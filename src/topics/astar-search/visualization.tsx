import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface Pos {
  row: number
  col: number
}

interface AStarNode {
  pos: Pos
  g: number
  h: number
  f: number
  parent: AStarNode | null
}

interface AStarStep {
  type: 'expand' | 'update' | 'found' | 'no-path'
  current: Pos
  neighbors: Pos[]
  openList: { pos: Pos; f: number }[]
  closedList: Pos[]
  cellValues: Map<string, { g: number; h: number; f: number }>
  path: Pos[]
  description: string
}

const GRID_ROWS = 8
const GRID_COLS = 10
const CELL_SIZE = 44

// 障碍物位置
const OBSTACLES: Pos[] = [
  { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 },
  { row: 2, col: 7 },
  { row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 5 }, { row: 3, col: 6 },
  { row: 4, col: 5 },
  { row: 5, col: 1 }, { row: 5, col: 2 },
  { row: 5, col: 7 }, { row: 5, col: 8 },
  { row: 6, col: 4 }, { row: 6, col: 5 },
]

const START: Pos = { row: 0, col: 0 }
const GOAL: Pos = { row: 7, col: 9 }

const COLORS = {
  start: '#10B981',
  goal: '#EF4444',
  obstacle: '#374151',
  open: '#DBEAFE',
  openBorder: '#3B82F6',
  closed: '#E5E7EB',
  closedBorder: '#9CA3AF',
  expanding: '#F59E0B',
  path: '#22C55E',
  pathBorder: '#16A34A',
  background: '#F9FAFB',
  gridLine: '#E5E7EB',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textValue: '#1D4ED8',
  border: '#D1D5DB',
  btnPrimary: '#3B82F6',
  btnSecondary: '#6B7280',
  btnDanger: '#EF4444',
}

function posKey(p: Pos): string {
  return `${p.row},${p.col}`
}

function manhattan(a: Pos, b: Pos): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
}

function isObstacle(pos: Pos): boolean {
  return OBSTACLES.some(o => o.row === pos.row && o.col === pos.col)
}

function isStart(pos: Pos): boolean {
  return pos.row === START.row && pos.col === START.col
}

function isGoal(pos: Pos): boolean {
  return pos.row === GOAL.row && pos.col === GOAL.col
}

function generateSteps(): AStarStep[] {
  const steps: AStarStep[] = []
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ]

  // 简单最小堆
  class MinHeap {
    private data: AStarNode[] = []
    get size() { return this.data.length }
    push(node: AStarNode) {
      this.data.push(node)
      this.bubbleUp(this.data.length - 1)
    }
    pop(): AStarNode | undefined {
      if (this.data.length === 0) return undefined
      const top = this.data[0]
      const last = this.data.pop()!
      if (this.data.length > 0) {
        this.data[0] = last
        this.sinkDown(0)
      }
      return top
    }
    getAll(): { pos: Pos; f: number }[] {
      return this.data.map(n => ({ pos: n.pos, f: n.f }))
    }
    has(pos: Pos): boolean {
      return this.data.some(n => n.pos.row === pos.row && n.pos.col === pos.col)
    }
    get(pos: Pos): AStarNode | undefined {
      return this.data.find(n => n.pos.row === pos.row && n.pos.col === pos.col)
    }
    update(pos: Pos, newNode: AStarNode) {
      const idx = this.data.findIndex(n => n.pos.row === pos.row && n.pos.col === pos.col)
      if (idx !== -1) {
        this.data[idx] = newNode
        this.bubbleUp(idx)
      }
    }
    private bubbleUp(i: number) {
      while (i > 0) {
        const p = Math.floor((i - 1) / 2)
        if (this.data[i].f < this.data[p].f) {
          [this.data[i], this.data[p]] = [this.data[p], this.data[i]]
          i = p
        } else break
      }
    }
    private sinkDown(i: number) {
      const n = this.data.length
      while (true) {
        let s = i
        const l = 2 * i + 1, r = 2 * i + 2
        if (l < n && this.data[l].f < this.data[s].f) s = l
        if (r < n && this.data[r].f < this.data[s].f) s = r
        if (s !== i) {
          [this.data[i], this.data[s]] = [this.data[s], this.data[i]]
          i = s
        } else break
      }
    }
  }

  const openList = new MinHeap()
  const closedSet = new Set<string>()
  const cellValues = new Map<string, { g: number; h: number; f: number }>()

  const startH = manhattan(START, GOAL)
  const startNode: AStarNode = { pos: START, g: 0, h: startH, f: startH, parent: null }
  openList.push(startNode)
  cellValues.set(posKey(START), { g: 0, h: startH, f: startH })

  while (openList.size > 0) {
    const current = openList.pop()!
    const currentKey = posKey(current.pos)

    if (current.pos.row === GOAL.row && current.pos.col === GOAL.col) {
      // 找到目标，重建路径
      const path: Pos[] = []
      let node: AStarNode | null = current
      while (node) {
        path.unshift(node.pos)
        node = node.parent
      }
      steps.push({
        type: 'found',
        current: current.pos,
        neighbors: [],
        openList: openList.getAll(),
        closedList: [...closedSet].map(k => {
          const [r, c] = k.split(',').map(Number)
          return { row: r, col: c }
        }),
        cellValues: new Map(cellValues),
        path,
        description: `到达目标 (${GOAL.row},${GOAL.col})! 最短路径长度 = ${current.g}`,
      })
      break
    }

    closedSet.add(currentKey)

    const neighborPositions: Pos[] = []
    for (const dir of directions) {
      const nr = current.pos.row + dir.dr
      const nc = current.pos.col + dir.dc
      const nPos = { row: nr, col: nc }

      if (nr < 0 || nr >= GRID_ROWS || nc < 0 || nc >= GRID_COLS) continue
      if (isObstacle(nPos)) continue
      if (closedSet.has(posKey(nPos))) continue

      const newG = current.g + 1
      const h = manhattan(nPos, GOAL)
      const newF = newG + h

      if (openList.has(nPos)) {
        const existing = openList.get(nPos)!
        if (newG < existing.g) {
          const updated: AStarNode = { pos: nPos, g: newG, h, f: newF, parent: current }
          openList.update(nPos, updated)
          cellValues.set(posKey(nPos), { g: newG, h, f: newF })
        }
      } else {
        const neighbor: AStarNode = { pos: nPos, g: newG, h, f: newF, parent: current }
        openList.push(neighbor)
        cellValues.set(posKey(nPos), { g: newG, h, f: newF })
      }
      neighborPositions.push(nPos)
    }

    steps.push({
      type: 'expand',
      current: current.pos,
      neighbors: neighborPositions,
      openList: openList.getAll(),
      closedList: [...closedSet].map(k => {
        const [r, c] = k.split(',').map(Number)
        return { row: r, col: c }
      }),
      cellValues: new Map(cellValues),
      path: [],
      description: `扩展 (${current.pos.row},${current.pos.col})  g=${current.g}  h=${current.h}  f=${current.f}  邻居: ${neighborPositions.length}`,
    })
  }

  // 如果没有找到路径
  if (steps.length === 0 || steps[steps.length - 1].type !== 'found') {
    steps.push({
      type: 'no-path',
      current: START,
      neighbors: [],
      openList: [],
      closedList: [...closedSet].map(k => {
        const [r, c] = k.split(',').map(Number)
        return { row: r, col: c }
      }),
      cellValues: new Map(cellValues),
      path: [],
      description: '开放列表为空，未找到路径!',
    })
  }

  return steps
}

export default function AStarVisualization() {
  const steps = useMemo(() => generateSteps(), [])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const timerRef = useRef<number | null>(null)

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = window.setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, speed)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps.length, speed])

  const handlePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(-1)
    }
    setIsPlaying(true)
  }, [currentStep, steps.length])

  const handlePause = useCallback(() => setIsPlaying(false), [])
  const handleReset = useCallback(() => { setIsPlaying(false); setCurrentStep(-1) }, [])

  const handleStepForward = useCallback(() => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1)
  }, [currentStep, steps.length])

  const handleStepBackward = useCallback(() => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }, [currentStep])

  const getCellBg = useCallback((row: number, col: number): string => {
    const pos = { row, col }
    if (isStart(pos)) return COLORS.start
    if (isGoal(pos)) return COLORS.goal
    if (isObstacle(pos)) return COLORS.obstacle
    if (!step) return 'white'

    const inPath = step.path.some(p => p.row === row && p.col === col)
    if (inPath && step.type === 'found') return COLORS.path

    if (step.current.row === row && step.current.col === col) return COLORS.expanding
    if (step.closedList.some(p => p.row === row && p.col === col)) return COLORS.closed
    if (step.openList.some(p => p.pos.row === row && p.pos.col === col)) return COLORS.open
    return 'white'
  }, [step])

  const getCellBorder = useCallback((row: number, col: number): string => {
    const pos = { row, col }
    if (isStart(pos) || isGoal(pos)) return '2px solid transparent'
    if (isObstacle(pos)) return '2px solid transparent'
    if (!step) return `1px solid ${COLORS.gridLine}`

    const inPath = step.path.some(p => p.row === row && p.col === col)
    if (inPath && step.type === 'found') return `2px solid ${COLORS.pathBorder}`

    if (step.current.row === row && step.current.col === col) return `2px solid #D97706`
    if (step.openList.some(p => p.pos.row === row && p.pos.col === col)) return `1px solid ${COLORS.openBorder}`
    if (step.closedList.some(p => p.row === row && p.col === col)) return `1px solid ${COLORS.closedBorder}`
    return `1px solid ${COLORS.gridLine}`
  }, [step])

  const renderGrid = () => {
    const cells = []
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const bg = getCellBg(r, c)
        const border = getCellBorder(r, c)
        const isSpecial = isStart({ row: r, col: c }) || isGoal({ row: r, col: c })
        const isWall = isObstacle({ row: r, col: c })

        const values = step?.cellValues.get(posKey({ row: r, col: c }))

        cells.push(
          <div
            key={`${r}-${c}`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: bg,
              border,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isSpecial ? '14px' : '9px',
              fontWeight: isSpecial ? 'bold' : 'normal',
              color: isSpecial ? 'white' : isWall ? 'white' : COLORS.textValue,
              position: 'relative',
              transition: 'all 0.2s ease',
              lineHeight: '1.1',
            }}
          >
            {isStart({ row: r, col: c }) && '起'}
            {isGoal({ row: r, col: c }) && '终'}
            {isWall && !isStart({ row: r, col: c }) && !isGoal({ row: r, col: c }) && '█'}
            {!isSpecial && !isWall && values && (
              <span style={{ fontSize: '9px', textAlign: 'center' }}>
                {values.g}/{values.h}
                <br />
                <strong>{values.f}</strong>
              </span>
            )}
          </div>
        )
      }
    }
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
        gap: 0,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '6px',
        overflow: 'hidden',
      }}>
        {cells}
      </div>
    )
  }

  const openListDisplay = step?.openList ?? []
  const closedListDisplay = step?.closedList ?? []

  return (
    <div className="viz-canvas" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: COLORS.background,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* 标题 */}
      <div style={{ padding: '10px 15px', borderBottom: `1px solid ${COLORS.border}` }}>
        <h2 style={{ margin: 0, color: COLORS.text, fontSize: '16px' }}>A* 搜索算法</h2>
        <p style={{ margin: '2px 0 0 0', color: COLORS.textSecondary, fontSize: '12px' }}>
          f(n) = g(n) + h(n)  ·  启发式路径搜索  ·  曼哈顿距离
        </p>
      </div>

      {/* 主内容 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 网格区域 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          overflow: 'auto',
          gap: '10px',
        }}>
          {renderGrid()}

          {/* 图例 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            fontSize: '11px',
            color: COLORS.textSecondary,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 12, height: 12, backgroundColor: COLORS.start, borderRadius: '2px' }} />
              起点
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 12, height: 12, backgroundColor: COLORS.goal, borderRadius: '2px' }} />
              目标
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 12, height: 12, backgroundColor: COLORS.obstacle, borderRadius: '2px' }} />
              障碍
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 12, height: 12, backgroundColor: COLORS.open, border: `1px solid ${COLORS.openBorder}`, borderRadius: '2px' }} />
              开放列表
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 12, height: 12, backgroundColor: COLORS.closed, border: `1px solid ${COLORS.closedBorder}`, borderRadius: '2px' }} />
              关闭列表
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 12, height: 12, backgroundColor: COLORS.expanding, borderRadius: '2px' }} />
              正在扩展
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 12, height: 12, backgroundColor: COLORS.path, border: `1px solid ${COLORS.pathBorder}`, borderRadius: '2px' }} />
              最终路径
            </span>
          </div>

          <div style={{ fontSize: '10px', color: COLORS.textSecondary }}>
            每个格子显示: g值/h值, f值(粗体)
          </div>
        </div>

        {/* 信息面板 */}
        <div className="viz-info" style={{
          width: '250px',
          borderLeft: `1px solid ${COLORS.border}`,
          padding: '10px',
          overflowY: 'auto',
          backgroundColor: 'white',
          fontSize: '12px',
        }}>
          {/* 当前操作 */}
          {step && (
            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: COLORS.text, fontSize: '13px' }}>当前操作</h4>
              <div style={{
                padding: '6px 8px',
                backgroundColor: step.type === 'found' ? '#D1FAE5' : step.type === 'expand' ? '#FEF3C7' : '#F3F4F6',
                borderRadius: '6px',
                fontSize: '11px',
                lineHeight: '1.5',
                color: COLORS.text,
              }}>
                {step.description}
              </div>
            </div>
          )}

          {/* 开放列表 */}
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: COLORS.text, fontSize: '13px' }}>
              开放列表 ({openListDisplay.length})
            </h4>
            <div style={{
              maxHeight: '120px',
              overflowY: 'auto',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '4px',
              padding: '4px',
            }}>
              {openListDisplay.length === 0 ? (
                <span style={{ color: COLORS.textSecondary, fontSize: '11px' }}>空</span>
              ) : (
                [...openListDisplay]
                  .sort((a, b) => a.f - b.f)
                  .slice(0, 15)
                  .map((item, idx) => (
                    <div key={idx} style={{ fontSize: '10px', padding: '1px 4px' }}>
                      ({item.pos.row},{item.pos.col}) f={item.f}
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* 关闭列表 */}
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: COLORS.text, fontSize: '13px' }}>
              关闭列表 ({closedListDisplay.length})
            </h4>
            <div style={{
              maxHeight: '100px',
              overflowY: 'auto',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '4px',
              padding: '4px',
            }}>
              {closedListDisplay.length === 0 ? (
                <span style={{ color: COLORS.textSecondary, fontSize: '11px' }}>空</span>
              ) : (
                closedListDisplay.map((pos, idx) => (
                  <span key={idx} style={{ fontSize: '10px', padding: '1px 2px', display: 'inline-block' }}>
                    ({pos.row},{pos.col})
                  </span>
                ))
              )}
            </div>
          </div>

          {/* 最终路径 */}
          {step && step.type === 'found' && (
            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: COLORS.text, fontSize: '13px' }}>
                最短路径 ({step.path.length - 1} 步)
              </h4>
              <div style={{
                padding: '6px 8px',
                backgroundColor: '#D1FAE5',
                borderRadius: '6px',
                fontSize: '10px',
                lineHeight: '1.6',
                wordBreak: 'break-all',
              }}>
                {step.path.map((p, i) => (
                  <span key={i}>
                    ({p.row},{p.col})
                    {i < step.path.length - 1 ? ' → ' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 算法信息 */}
          <div>
            <h4 style={{ margin: '0 0 5px 0', color: COLORS.text, fontSize: '13px' }}>算法信息</h4>
            <div style={{ fontSize: '11px', color: COLORS.textSecondary, lineHeight: '1.8' }}>
              <div>网格: {GRID_ROWS}×{GRID_COLS}</div>
              <div>启发式: 曼哈顿距离</div>
              <div>当前步骤: {Math.max(0, currentStep + 1)} / {steps.length}</div>
              <div>f(n) = g(n) + h(n)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 控制栏 */}
      <div className="viz-controls" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 15px',
        borderTop: `1px solid ${COLORS.border}`,
        backgroundColor: 'white',
      }}>
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={currentStep < 0}
          style={{
            padding: '5px 12px',
            backgroundColor: currentStep < 0 ? '#E5E7EB' : COLORS.btnSecondary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep < 0 ? 'not-allowed' : 'pointer',
            fontSize: '12px',
          }}
        >
          重置
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepBackward}
          disabled={currentStep <= 0}
          style={{
            padding: '5px 12px',
            backgroundColor: currentStep <= 0 ? '#E5E7EB' : COLORS.btnSecondary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep <= 0 ? 'not-allowed' : 'pointer',
            fontSize: '12px',
          }}
        >
          上一步
        </button>
        <button
          className="btn btn-primary"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={steps.length === 0}
          style={{
            padding: '5px 18px',
            backgroundColor: isPlaying ? COLORS.btnDanger : COLORS.btnPrimary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: steps.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepForward}
          disabled={currentStep >= steps.length - 1}
          style={{
            padding: '5px 12px',
            backgroundColor: currentStep >= steps.length - 1 ? '#E5E7EB' : COLORS.btnSecondary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep >= steps.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '12px',
          }}
        >
          下一步
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
          <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>速度:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{
              padding: '3px 6px',
              borderRadius: '4px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '12px',
            }}
          >
            <option value={1200}>慢速</option>
            <option value={500}>正常</option>
            <option value={200}>快速</option>
            <option value={80}>极快</option>
          </select>
        </div>
        <div style={{ marginLeft: '12px', fontSize: '12px', color: COLORS.textSecondary }}>
          步骤: {Math.max(0, currentStep + 1)} / {steps.length}
        </div>
      </div>
    </div>
  )
}
