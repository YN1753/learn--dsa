import { useState, useEffect, useRef, useCallback } from 'react'

interface Query {
  l: number
  r: number
  id: number
  originalIdx: number
}

interface AnimationStep {
  description: string
  mode: 'online' | 'offline'
  processedQueries: number[]
  currentQueryIdx: number | null
  stepsUsed: number
  highlightPos: number | null
  highlightType: 'scan' | 'done' | 'move' | 'none'
  offlineOrder: number[]
  pointerL: number
  pointerR: number
}

const INITIAL_ARRAY = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]

const INITIAL_QUERIES: Query[] = [
  { l: 0, r: 4, id: 0, originalIdx: 0 },
  { l: 2, r: 7, id: 1, originalIdx: 1 },
  { l: 1, r: 9, id: 2, originalIdx: 2 },
  { l: 5, r: 9, id: 3, originalIdx: 3 },
  { l: 0, r: 9, id: 4, originalIdx: 4 },
]

export default function OfflineAlgorithmsVisualization() {
  const [arr] = useState<number[]>(INITIAL_ARRAY)
  const [queries] = useState<Query[]>(INITIAL_QUERIES)
  const [mode, setMode] = useState<'online' | 'offline'>('online')
  const [description, setDescription] = useState<string>('离线算法可视化 - 选择模式并点击「开始」')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [processedQueries, setProcessedQueries] = useState<number[]>([])
  const [currentQueryIdx, setCurrentQueryIdx] = useState<number | null>(null)
  const [highlightPos, setHighlightPos] = useState<number | null>(null)
  const [highlightType, setHighlightType] = useState<'scan' | 'done' | 'move' | 'none'>('none')
  const [stepsUsed, setStepsUsed] = useState(0)
  const [pointerL, setPointerL] = useState(0)
  const [pointerR, setPointerR] = useState(-1)
  const [offlineOrder, setOfflineOrder] = useState<number[]>([])
  const timerRef = useRef<number | null>(null)

  const generateOnlineSteps = useCallback((): AnimationStep[] => {
    const allSteps: AnimationStep[] = []
    let totalSteps = 0

    allSteps.push({
      description: '在线模式：按原始顺序逐个处理查询，每次都从零开始扫描',
      mode: 'online',
      processedQueries: [],
      currentQueryIdx: null,
      stepsUsed: 0,
      highlightPos: null,
      highlightType: 'none',
      offlineOrder: [],
      pointerL: 0,
      pointerR: -1,
    })

    for (let qi = 0; qi < queries.length; qi++) {
      const q = queries[qi]
      allSteps.push({
        description: `开始处理查询 ${q.id}: 区间 [${q.l}, ${q.r}]`,
        mode: 'online',
        processedQueries: [],
        currentQueryIdx: qi,
        stepsUsed: totalSteps,
        highlightPos: null,
        highlightType: 'none',
        offlineOrder: [],
        pointerL: q.l,
        pointerR: q.r,
      })

      for (let i = q.l; i <= q.r; i++) {
        totalSteps++
        allSteps.push({
          description: `扫描位置 ${i}，值为 ${arr[i]}`,
          mode: 'online',
          processedQueries: [],
          currentQueryIdx: qi,
          stepsUsed: totalSteps,
          highlightPos: i,
          highlightType: 'scan',
          offlineOrder: [],
          pointerL: q.l,
          pointerR: q.r,
        })
      }

      allSteps.push({
        description: `查询 ${q.id} 完成！遍历了 ${q.r - q.l + 1} 个元素`,
        mode: 'online',
        processedQueries: Array.from({ length: qi + 1 }, (_, i) => i),
        currentQueryIdx: qi,
        stepsUsed: totalSteps,
        highlightPos: null,
        highlightType: 'done',
        offlineOrder: [],
        pointerL: q.l,
        pointerR: q.r,
      })
    }

    allSteps.push({
      description: `在线处理完成！总步数: ${totalSteps}`,
      mode: 'online',
      processedQueries: queries.map((_, i) => i),
      currentQueryIdx: null,
      stepsUsed: totalSteps,
      highlightPos: null,
      highlightType: 'done',
      offlineOrder: [],
      pointerL: 0,
      pointerR: -1,
    })

    return allSteps
  }, [arr, queries])

  const generateOfflineSteps = useCallback((): AnimationStep[] => {
    const allSteps: AnimationStep[] = []
    const n = arr.length
    const blockSize = Math.floor(Math.sqrt(n))
    let totalSteps = 0

    const sorted = queries.map((q, i) => ({ ...q, sortIdx: i }))
    sorted.sort((a, b) => {
      const blockA = Math.floor(a.l / blockSize)
      const blockB = Math.floor(b.l / blockSize)
      if (blockA !== blockB) return blockA - blockB
      return blockA % 2 === 0 ? a.r - b.r : b.r - a.r
    })

    const order = sorted.map(q => q.id)

    allSteps.push({
      description: `离线模式：先将查询按莫队策略排序，排序后顺序: ${order.map(id => `q${id}`).join(' -> ')}`,
      mode: 'offline',
      processedQueries: [],
      currentQueryIdx: null,
      stepsUsed: 0,
      highlightPos: null,
      highlightType: 'none',
      offlineOrder: order,
      pointerL: 0,
      pointerR: -1,
    })

    let curL = 0
    let curR = -1

    for (let si = 0; si < sorted.length; si++) {
      const q = sorted[si]

      allSteps.push({
        description: `开始处理查询 ${q.id}: [${q.l}, ${q.r}]，当前指针 L=${curL}, R=${curR}`,
        mode: 'offline',
        processedQueries: sorted.slice(0, si).map(sq => sq.id),
        currentQueryIdx: q.id,
        stepsUsed: totalSteps,
        highlightPos: null,
        highlightType: 'move',
        offlineOrder: order,
        pointerL: curL,
        pointerR: curR,
      })

      while (curL > q.l) {
        curL--
        totalSteps++
        allSteps.push({
          description: `L 指针左移至 ${curL}，添加 arr[${curL}]=${arr[curL]}`,
          mode: 'offline',
          processedQueries: sorted.slice(0, si).map(sq => sq.id),
          currentQueryIdx: q.id,
          stepsUsed: totalSteps,
          highlightPos: curL,
          highlightType: 'move',
          offlineOrder: order,
          pointerL: curL,
          pointerR: curR,
        })
      }

      while (curR < q.r) {
        curR++
        totalSteps++
        allSteps.push({
          description: `R 指针右移至 ${curR}，添加 arr[${curR}]=${arr[curR]}`,
          mode: 'offline',
          processedQueries: sorted.slice(0, si).map(sq => sq.id),
          currentQueryIdx: q.id,
          stepsUsed: totalSteps,
          highlightPos: curR,
          highlightType: 'move',
          offlineOrder: order,
          pointerL: curL,
          pointerR: curR,
        })
      }

      while (curL < q.l) {
        totalSteps++
        allSteps.push({
          description: `L 指针右移，删除 arr[${curL}]=${arr[curL]}`,
          mode: 'offline',
          processedQueries: sorted.slice(0, si).map(sq => sq.id),
          currentQueryIdx: q.id,
          stepsUsed: totalSteps,
          highlightPos: curL,
          highlightType: 'scan',
          offlineOrder: order,
          pointerL: curL,
          pointerR: curR,
        })
        curL++
      }

      while (curR > q.r) {
        totalSteps++
        allSteps.push({
          description: `R 指针左移，删除 arr[${curR}]=${arr[curR]}`,
          mode: 'offline',
          processedQueries: sorted.slice(0, si).map(sq => sq.id),
          currentQueryIdx: q.id,
          stepsUsed: totalSteps,
          highlightPos: curR,
          highlightType: 'scan',
          offlineOrder: order,
          pointerL: curL,
          pointerR: curR,
        })
        curR--
      }

      allSteps.push({
        description: `查询 ${q.id} 完成！指针已到达 [${curL}, ${curR}]`,
        mode: 'offline',
        processedQueries: sorted.slice(0, si + 1).map(sq => sq.id),
        currentQueryIdx: q.id,
        stepsUsed: totalSteps,
        highlightPos: null,
        highlightType: 'done',
        offlineOrder: order,
        pointerL: curL,
        pointerR: curR,
      })
    }

    allSteps.push({
      description: `离线处理完成！总步数: ${totalSteps}（在线需要 ${queries.reduce((s, q) => s + (q.r - q.l + 1), 0)} 步）`,
      mode: 'offline',
      processedQueries: queries.map(q => q.id),
      currentQueryIdx: null,
      stepsUsed: totalSteps,
      highlightPos: null,
      highlightType: 'done',
      offlineOrder: order,
      pointerL: curL,
      pointerR: curR,
    })

    return allSteps
  }, [arr, queries])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setProcessedQueries(step.processedQueries)
      setCurrentQueryIdx(step.currentQueryIdx)
      setHighlightPos(step.highlightPos)
      setHighlightType(step.highlightType)
      setStepsUsed(step.stepsUsed)
      setDescription(step.description)
      setOfflineOrder(step.offlineOrder)
      setPointerL(step.pointerL)
      setPointerR(step.pointerR)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleStart = () => {
    const allSteps = mode === 'online' ? generateOnlineSteps() : generateOfflineSteps()
    setSteps(allSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setProcessedQueries([])
    setCurrentQueryIdx(null)
    setHighlightPos(null)
    setHighlightType('none')
    setStepsUsed(0)
    setPointerL(0)
    setPointerR(-1)
    setOfflineOrder([])
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (steps.length === 0) {
      const allSteps = mode === 'online' ? generateOnlineSteps() : generateOfflineSteps()
      setSteps(allSteps)
      setCurrentStep(0)
      setIsPlaying(false)
      if (allSteps.length > 0) {
        const step = allSteps[0]
        setProcessedQueries(step.processedQueries)
        setCurrentQueryIdx(step.currentQueryIdx)
        setHighlightPos(step.highlightPos)
        setHighlightType(step.highlightType)
        setStepsUsed(step.stepsUsed)
        setDescription(step.description)
        setOfflineOrder(step.offlineOrder)
        setPointerL(step.pointerL)
        setPointerR(step.pointerR)
        setCurrentStep(1)
      }
      return
    }
    if (currentStep < steps.length) {
      setIsPlaying(false)
      const step = steps[currentStep]
      setProcessedQueries(step.processedQueries)
      setCurrentQueryIdx(step.currentQueryIdx)
      setHighlightPos(step.highlightPos)
      setHighlightType(step.highlightType)
      setStepsUsed(step.stepsUsed)
      setDescription(step.description)
      setOfflineOrder(step.offlineOrder)
      setPointerL(step.pointerL)
      setPointerR(step.pointerR)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setProcessedQueries([])
    setCurrentQueryIdx(null)
    setHighlightPos(null)
    setHighlightType('none')
    setStepsUsed(0)
    setSteps([])
    setCurrentStep(0)
    setPointerL(0)
    setPointerR(-1)
    setOfflineOrder([])
    setDescription('离线算法可视化 - 选择模式并点击「开始」')
  }

  const cellSize = 52
  const startX = 30
  const startY = 60
  const totalWidth = startX + arr.length * cellSize + 30

  const getCellHighlight = (index: number): string => {
    if (index === highlightPos) {
      switch (highlightType) {
        case 'scan': return '#f59e0b'
        case 'move': return '#3b82f6'
        case 'done': return '#22c55e'
        default: return 'transparent'
      }
    }
    if (currentQueryIdx !== null) {
      const q = queries.find(q => q.id === currentQueryIdx)
      if (q && index >= q.l && index <= q.r) {
        return 'rgba(59, 130, 246, 0.15)'
      }
    }
    return 'transparent'
  }

  const getCellBorder = (index: number): string => {
    if (index === highlightPos) {
      switch (highlightType) {
        case 'scan': return '#fbbf24'
        case 'move': return '#60a5fa'
        case 'done': return '#4ade80'
        default: return 'var(--border)'
      }
    }
    return 'var(--border)'
  }

  const onlineTotalSteps = queries.reduce((s, q) => s + (q.r - q.l + 1), 0)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={mode === 'online' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => { setMode('online'); handleReset() }}
            disabled={isPlaying}
          >
            在线模式
          </button>
          <button
            className={mode === 'offline' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => { setMode('offline'); handleReset() }}
            disabled={isPlaying}
          >
            离线模式
          </button>
        </div>
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={isPlaying}>
          单步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="100"
            max="1500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={Math.max(totalWidth, 500)} height={240}>
          {arr.map((val, i) => {
            const x = startX + i * cellSize
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={startY}
                  width={cellSize - 4}
                  height={cellSize}
                  rx={6}
                  fill={getCellHighlight(i)}
                  stroke={getCellBorder(i)}
                  strokeWidth={i === highlightPos ? 3 : 1.5}
                />
                <text
                  x={x + (cellSize - 4) / 2}
                  y={startY + cellSize / 2 + 1}
                  fill="var(--text-primary)"
                  fontSize="18"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                  dominantBaseline="middle"
                >
                  {val}
                </text>
                <text
                  x={x + (cellSize - 4) / 2}
                  y={startY + cellSize + 16}
                  fill="var(--text-secondary)"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {i}
                </text>
              </g>
            )
          })}

          {mode === 'offline' && pointerR >= pointerL && (
            <>
              <polygon
                points={`${startX + pointerL * cellSize + (cellSize - 4) / 2 - 6},${startY + cellSize + 28} ${startX + pointerL * cellSize + (cellSize - 4) / 2 + 6},${startY + cellSize + 28} ${startX + pointerL * cellSize + (cellSize - 4) / 2},${startY + cellSize + 22}`}
                fill="#3b82f6"
              />
              <text
                x={startX + pointerL * cellSize + (cellSize - 4) / 2}
                y={startY + cellSize + 42}
                fill="#3b82f6"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                L
              </text>
              <polygon
                points={`${startX + pointerR * cellSize + (cellSize - 4) / 2 - 6},${startY + cellSize + 28} ${startX + pointerR * cellSize + (cellSize - 4) / 2 + 6},${startY + cellSize + 28} ${startX + pointerR * cellSize + (cellSize - 4) / 2},${startY + cellSize + 22}`}
                fill="#f59e0b"
              />
              <text
                x={startX + pointerR * cellSize + (cellSize - 4) / 2}
                y={startY + cellSize + 42}
                fill="#f59e0b"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                R
              </text>
            </>
          )}

          <text
            x={startX}
            y={startY + cellSize + 62}
            fill="var(--text-secondary)"
            fontSize="12"
            fontFamily="Consolas, Monaco, monospace"
          >
            {`已用步数: ${stepsUsed}  /  ${mode === 'online' ? `在线总步数: ${onlineTotalSteps}` : `在线对比: ${onlineTotalSteps}`}`}
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0 1rem' }}>
        <div className="viz-info" style={{ flex: 1, minWidth: 200 }}>
          <strong>查询状态：</strong>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {queries.map((q) => {
              const isProcessed = processedQueries.includes(q.id)
              const isCurrent = currentQueryIdx === q.id
              return (
                <span
                  key={q.id}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 4,
                    background: isCurrent ? 'rgba(59, 130, 246, 0.2)' : isProcessed ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-card)',
                    border: isCurrent ? '2px solid #3b82f6' : isProcessed ? '2px solid #22c55e' : '1px solid var(--border)',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.85rem',
                  }}
                >
                  q{q.id}[{q.l},{q.r}]
                </span>
              )
            })}
          </div>
        </div>

        {mode === 'offline' && offlineOrder.length > 0 && (
          <div className="viz-info" style={{ flex: 1, minWidth: 200 }}>
            <strong>离线排序顺序：</strong>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {offlineOrder.map((id) => {
                const q = queries.find(q => q.id === id)!
                const isCurrent = currentQueryIdx === id
                return (
                  <span
                    key={id}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 4,
                      background: isCurrent ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                      border: isCurrent ? '2px solid #3b82f6' : '1px solid var(--border)',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.85rem',
                    }}
                  >
                    q{q.id}[{q.l},{q.r}]
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(59, 130, 246, 0.15)', border: '1px solid var(--border)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          查询区间
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在扫描
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          指针移动
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          完成
        </span>
      </div>
    </div>
  )
}
