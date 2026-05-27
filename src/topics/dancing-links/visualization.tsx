import { useState, useEffect, useRef, useCallback } from 'react'

// --- DLX Types ---
interface DLXNode {
  id: number
  row: number
  col: number
  leftId: number
  rightId: number
  upId: number
  downId: number
  colHeaderId: number
}

interface ColumnHeader {
  id: number
  col: number
  size: number
  name: string
  leftId: number
  rightId: number
  upId: number
  downId: number
}

interface MatrixState {
  nodes: DLXNode[]
  columns: ColumnHeader[]
  coveredCols: Set<number>
  coveredRows: Set<number>
  removedNodes: Set<number>
  solution: number[]
  selectedRow: number | null
  selectedCol: number | null
  highlightNodes: Set<number>
  actionType: 'cover-col' | 'cover-row' | 'uncover-row' | 'uncover-col' | 'select' | 'none'
}

interface AnimationStep {
  description: string
  state: MatrixState
}

// Small exact cover matrix
const MATRIX = [
  [1, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 1],
  [0, 0, 1, 0, 1, 1, 0],
  [0, 1, 1, 0, 0, 1, 1],
  [0, 1, 0, 0, 0, 0, 1],
]
const COL_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

function buildInitialState(): MatrixState {
  const nodes: DLXNode[] = []
  const columns: ColumnHeader[] = []
  let nodeId = 0

  // Build column headers
  for (let c = 0; c < COL_NAMES.length; c++) {
    const colNodes = MATRIX.map((row, r) => ({ r, val: row[c] })).filter(x => x.val === 1)
    columns.push({
      id: nodeId++,
      col: c,
      size: colNodes.length,
      name: COL_NAMES[c],
      leftId: c === 0 ? -1 : nodeId - 2,
      rightId: c === COL_NAMES.length - 1 ? -1 : nodeId,
      upId: -1,
      downId: -1,
    })
  }
  // Fix left/right for columns
  for (let c = 0; c < columns.length; c++) {
    columns[c].leftId = c === 0 ? columns[columns.length - 1].id : columns[c - 1].id
    columns[c].rightId = c === columns.length - 1 ? columns[0].id : columns[c + 1].id
  }

  // Build row nodes
  const colNodeLists: number[][] = Array.from({ length: COL_NAMES.length }, () => [])
  for (let r = 0; r < MATRIX.length; r++) {
    const rowNodeIds: number[] = []
    for (let c = 0; c < MATRIX[r].length; c++) {
      if (MATRIX[r][c] === 1) {
        const id = nodeId++
        nodes.push({
          id,
          row: r,
          col: c,
          leftId: -1,
          rightId: -1,
          upId: -1,
          downId: -1,
          colHeaderId: columns[c].id,
        })
        rowNodeIds.push(id)
        colNodeLists[c].push(id)
      }
    }
    // Link row nodes circularly
    for (let i = 0; i < rowNodeIds.length; i++) {
      const node = nodes.find(n => n.id === rowNodeIds[i])!
      node.leftId = rowNodeIds[(i - 1 + rowNodeIds.length) % rowNodeIds.length]
      node.rightId = rowNodeIds[(i + 1) % rowNodeIds.length]
    }
  }

  // Link column nodes
  for (let c = 0; c < COL_NAMES.length; c++) {
    const colNodeIds = colNodeLists[c]
    for (let i = 0; i < colNodeIds.length; i++) {
      const node = nodes.find(n => n.id === colNodeIds[i])!
      node.upId = i === 0 ? columns[c].id : colNodeIds[i - 1]
      node.downId = i === colNodeIds.length - 1 ? columns[c].id : colNodeIds[i + 1]
    }
    // Update column header up/down
    if (colNodeIds.length > 0) {
      columns[c].upId = colNodeIds[colNodeIds.length - 1]
      columns[c].downId = colNodeIds[0]
    } else {
      columns[c].upId = columns[c].id
      columns[c].downId = columns[c].id
    }
  }

  return {
    nodes,
    columns,
    coveredCols: new Set(),
    coveredRows: new Set(),
    removedNodes: new Set(),
    solution: [],
    selectedRow: null,
    selectedCol: null,
    highlightNodes: new Set(),
    actionType: 'none',
  }
}

function deepCopyState(state: MatrixState): MatrixState {
  return {
    nodes: state.nodes.map(n => ({ ...n })),
    columns: state.columns.map(c => ({ ...c })),
    coveredCols: new Set(state.coveredCols),
    coveredRows: new Set(state.coveredRows),
    removedNodes: new Set(state.removedNodes),
    solution: [...state.solution],
    selectedRow: state.selectedRow,
    selectedCol: state.selectedCol,
    highlightNodes: new Set(state.highlightNodes),
    actionType: state.actionType,
  }
}

export default function DLXVisualization() {
  const [state, setState] = useState<MatrixState>(buildInitialState)
  const [description, setDescription] = useState<string>('精确覆盖问题 - 选择操作开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<number | null>(null)

  const executeSteps = useCallback((animationSteps: AnimationStep[]) => {
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }
    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setState(step.state)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleCoverColumn = () => {
    const availableCols = state.columns.filter(c => !state.coveredCols.has(c.col))
    if (availableCols.length === 0) {
      setDescription('所有列已被覆盖')
      return
    }
    // Pick column with minimum size
    let bestCol = availableCols[0]
    for (const c of availableCols) {
      if (c.size < bestCol.size) bestCol = c
    }

    const steps: AnimationStep[] = []
    const s1 = deepCopyState(state)
    s1.selectedCol = bestCol.col
    s1.highlightNodes = new Set(
      s1.nodes.filter(n => n.col === bestCol.col && !s1.removedNodes.has(n.id)).map(n => n.id)
    )
    s1.actionType = 'select'
    steps.push({
      description: `选择列 ${bestCol.name}（包含 ${bestCol.size} 个 1，是 1 最少的列）`,
      state: s1,
    })

    const s2 = deepCopyState(s1)
    s2.coveredCols.add(bestCol.col)
    s2.actionType = 'cover-col'
    // Remove all nodes in this column
    for (const n of s2.nodes) {
      if (n.col === bestCol.col && !s2.removedNodes.has(n.id)) {
        s2.removedNodes.add(n.id)
      }
    }
    steps.push({
      description: `覆盖列 ${bestCol.name}：从链表中摘除列头及该列所有节点`,
      state: s2,
    })

    // Also cover rows that have a 1 in this column and remove their other nodes
    const rowsInCol = s2.nodes
      .filter(n => n.col === bestCol.col && !state.removedNodes.has(n.id))
      .map(n => n.row)
    const uniqueRows = [...new Set(rowsInCol)]

    const s3 = deepCopyState(s2)
    for (const r of uniqueRows) {
      s3.coveredRows.add(r)
      for (const n of s3.nodes) {
        if (n.row === r && !s3.removedNodes.has(n.id)) {
          s3.removedNodes.add(n.id)
        }
      }
    }
    s3.highlightNodes = new Set(
      s3.nodes.filter(n => uniqueRows.includes(n.row) && !state.removedNodes.has(n.id)).map(n => n.id)
    )
    s3.actionType = 'cover-row'
    steps.push({
      description: `覆盖相关行 R${uniqueRows.join(', R')}：摘除这些行中所有节点`,
      state: s3,
    })

    executeSteps(steps)
  }

  const handleSelectRow = (rowIdx: number) => {
    if (state.coveredRows.has(rowIdx)) {
      setDescription(`行 R${rowIdx} 已被覆盖，无法选择`)
      return
    }

    const steps: AnimationStep[] = []
    const s1 = deepCopyState(state)
    s1.selectedRow = rowIdx
    s1.highlightNodes = new Set(
      s1.nodes.filter(n => n.row === rowIdx && !s1.removedNodes.has(n.id)).map(n => n.id)
    )
    s1.actionType = 'select'
    const rowCols = s1.nodes
      .filter(n => n.row === rowIdx && !s1.removedNodes.has(n.id))
      .map(n => COL_NAMES[n.col])
    steps.push({
      description: `选择行 R${rowIdx}：该行在列 [${rowCols.join(', ')}] 中有 1`,
      state: s1,
    })

    // Cover this row and its columns
    const s2 = deepCopyState(s1)
    s2.solution.push(rowIdx)
    s2.coveredRows.add(rowIdx)
    const colsInRow = s2.nodes
      .filter(n => n.row === rowIdx && !s2.removedNodes.has(n.id))
      .map(n => n.col)

    // Remove this row's nodes
    for (const n of s2.nodes) {
      if (n.row === rowIdx && !s2.removedNodes.has(n.id)) {
        s2.removedNodes.add(n.id)
      }
    }

    // Cover each column in this row
    for (const c of colsInRow) {
      s2.coveredCols.add(c)
      // Remove all nodes in this column
      for (const n of s2.nodes) {
        if (n.col === c && !s2.removedNodes.has(n.id)) {
          s2.removedNodes.add(n.id)
          s2.coveredRows.add(n.row)
        }
      }
    }

    s2.highlightNodes = new Set(
      s2.nodes.filter(n => colsInRow.includes(n.col) && !state.removedNodes.has(n.id)).map(n => n.id)
    )
    s2.actionType = 'cover-row'
    steps.push({
      description: `将 R${rowIdx} 加入解集，覆盖列 [${colsInRow.map(c => COL_NAMES[c]).join(', ')}] 及相关行`,
      state: s2,
    })

    executeSteps(steps)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setState(buildInitialState())
    setDescription('已重置')
    setSteps([])
    setCurrentStep(0)
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  // Layout
  const cellSize = 48
  const headerHeight = 36
  const rowLabelWidth = 36
  const padding = 20

  const getCellColor = (row: number, col: number): string => {
    const isRemoved = state.nodes.some(n => n.row === row && n.col === col && state.removedNodes.has(n.id))
    if (isRemoved) return 'var(--bg-card)'
    if (MATRIX[row][col] === 0) return 'var(--bg-card)'

    const isHighlighted = state.nodes.some(n => n.row === row && n.col === col && state.highlightNodes.has(n.id))
    if (isHighlighted) {
      if (state.actionType === 'select') return '#3b82f6'
      if (state.actionType === 'cover-col') return '#f59e0b'
      if (state.actionType === 'cover-row') return '#ef4444'
    }

    if (state.coveredCols.has(col) || state.coveredRows.has(row)) return 'var(--bg-card)'
    return 'var(--accent)'
  }

  const getCellOpacity = (row: number, col: number): number => {
    if (MATRIX[row][col] === 0) return 0.05
    const isRemoved = state.nodes.some(n => n.row === row && n.col === col && state.removedNodes.has(n.id))
    if (isRemoved) return 0.1
    if (state.coveredCols.has(col) || state.coveredRows.has(row)) return 0.15
    return 1
  }

  const getColHeaderColor = (col: number): string => {
    if (state.coveredCols.has(col)) return '#6b7280'
    if (state.selectedCol === col) return '#f59e0b'
    return 'var(--text-secondary)'
  }

  const isSolved = state.columns.every(c => state.coveredCols.has(c.col))

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button
          className="btn btn-primary"
          onClick={handleCoverColumn}
          disabled={isPlaying || isSolved}
        >
          覆盖最优列
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            const availableRows = [...new Set(
              state.nodes
                .filter(n => !state.removedNodes.has(n.id) && !state.coveredRows.has(n.row))
                .map(n => n.row)
            )]
            if (availableRows.length > 0) handleSelectRow(availableRows[0])
          }}
          disabled={isPlaying || isSolved}
        >
          选择第一可用行
        </button>
        <button
          className="btn btn-secondary"
          onClick={handlePauseResume}
          disabled={steps.length === 0 || currentStep >= steps.length}
        >
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="200"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto', padding: `${padding}px` }}>
        <svg
          width={rowLabelWidth + COL_NAMES.length * cellSize + padding * 2}
          height={headerHeight + MATRIX.length * cellSize + padding * 2 + 40}
        >
          {/* Column headers */}
          {COL_NAMES.map((name, c) => {
            const x = rowLabelWidth + c * cellSize
            const col = state.columns[c]
            return (
              <g key={`col-${c}`}>
                <rect
                  x={x}
                  y={padding}
                  width={cellSize - 2}
                  height={headerHeight}
                  rx={4}
                  fill={state.coveredCols.has(c) ? '#374151' : '#1e293b'}
                  stroke={state.selectedCol === c ? '#f59e0b' : '#475569'}
                  strokeWidth={state.selectedCol === c ? 2 : 1}
                  opacity={state.coveredCols.has(c) ? 0.4 : 1}
                />
                <text
                  x={x + cellSize / 2 - 1}
                  y={padding + headerHeight / 2 + 5}
                  fill={getColHeaderColor(c)}
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {name}
                </text>
                <text
                  x={x + cellSize / 2 - 1}
                  y={padding + headerHeight / 2 + 18}
                  fill={state.coveredCols.has(c) ? '#4b5563' : '#94a3b8'}
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {col.size}
                </text>
              </g>
            )
          })}

          {/* Row labels */}
          {MATRIX.map((_, r) => (
            <text
              key={`rowlabel-${r}`}
              x={0}
              y={padding + headerHeight + r * cellSize + cellSize / 2 + 5}
              fill={state.coveredRows.has(r) ? '#4b5563' : 'var(--text-secondary)'}
              fontSize="13"
              fontFamily="Consolas, Monaco, monospace"
              opacity={state.coveredRows.has(r) ? 0.4 : 1}
            >
              R{r}
            </text>
          ))}

          {/* Matrix cells */}
          {MATRIX.map((row, r) =>
            row.map((val, c) => {
              const x = rowLabelWidth + c * cellSize
              const y = padding + headerHeight + r * cellSize
              const color = getCellColor(r, c)
              const opacity = getCellOpacity(r, c)

              return (
                <g key={`cell-${r}-${c}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize - 2}
                    height={cellSize - 2}
                    rx={4}
                    fill={val === 1 ? color : 'var(--bg-card)'}
                    stroke={val === 1 ? 'transparent' : 'var(--border)'}
                    strokeWidth={1}
                    opacity={opacity}
                    style={{
                      cursor: val === 1 && !state.coveredRows.has(r) && !state.coveredCols.has(c) && !state.removedNodes.has(state.nodes.find(n => n.row === r && n.col === c)?.id ?? -1)
                        ? 'pointer' : 'default',
                      transition: 'fill 0.3s, opacity 0.3s',
                    }}
                    onClick={() => {
                      if (val === 1 && !state.coveredRows.has(r) && !state.coveredCols.has(c)) {
                        const nodeId = state.nodes.find(n => n.row === r && n.col === c)?.id
                        if (nodeId !== undefined && !state.removedNodes.has(nodeId)) {
                          handleSelectRow(r)
                        }
                      }
                    }}
                  />
                  {val === 1 && opacity > 0.5 && (
                    <circle
                      cx={x + cellSize / 2 - 1}
                      cy={y + cellSize / 2 - 1}
                      r={6}
                      fill="white"
                      opacity={0.9}
                    />
                  )}
                </g>
              )
            })
          )}

          {/* Linked list arrows (horizontal) */}
          {MATRIX.map((row, r) => {
            const ones: number[] = []
            for (let c = 0; c < row.length; c++) {
              if (row[c] === 1) {
                const node = state.nodes.find(n => n.row === r && n.col === c)
                if (node && !state.removedNodes.has(node.id)) {
                  ones.push(c)
                }
              }
            }
            return ones.slice(0, -1).map((c, i) => {
              const x1 = rowLabelWidth + c * cellSize + cellSize - 2
              const x2 = rowLabelWidth + ones[i + 1] * cellSize
              const y = padding + headerHeight + r * cellSize + cellSize / 2 - 1
              return (
                <line
                  key={`hlink-${r}-${c}-${ones[i + 1]}`}
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke="#60a5fa"
                  strokeWidth={1.5}
                  strokeDasharray="4,3"
                  opacity={0.5}
                />
              )
            })
          })}

          {/* Linked list arrows (vertical) */}
          {COL_NAMES.map((_, c) => {
            const ones: number[] = []
            for (let r = 0; r < MATRIX.length; r++) {
              if (MATRIX[r][c] === 1) {
                const node = state.nodes.find(n => n.row === r && n.col === c)
                if (node && !state.removedNodes.has(node.id)) {
                  ones.push(r)
                }
              }
            }
            return ones.slice(0, -1).map((r, i) => {
              const x = rowLabelWidth + c * cellSize + cellSize / 2 - 1
              const y1 = padding + headerHeight + r * cellSize + cellSize - 2
              const y2 = padding + headerHeight + ones[i + 1] * cellSize
              return (
                <line
                  key={`vlink-${c}-${r}-${ones[i + 1]}`}
                  x1={x}
                  y1={y1}
                  x2={x}
                  y2={y2}
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                  strokeDasharray="4,3"
                  opacity={0.5}
                />
              )
            })
          })}

          {/* Solution display */}
          {state.solution.length > 0 && (
            <text
              x={padding}
              y={padding + headerHeight + MATRIX.length * cellSize + 30}
              fill="#22c55e"
              fontSize="13"
              fontFamily="Consolas, Monaco, monospace"
            >
              解集: [{state.solution.map(r => `R${r}`).join(', ')}]
            </text>
          )}

          {isSolved && (
            <text
              x={padding}
              y={padding + headerHeight + MATRIX.length * cellSize + 50}
              fill="#22c55e"
              fontSize="15"
              fontWeight="bold"
              fontFamily="Consolas, Monaco, monospace"
            >
              找到精确覆盖解！
            </text>
          )}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--accent)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          活跃节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          选中
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          覆盖列
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          覆盖行
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#60a5fa', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          行链接
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#a78bfa', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          列链接
        </span>
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>提示：</strong> 点击矩阵中的 1 可以选择该行加入解集。「覆盖最优列」使用 MRV 启发式自动选择包含 1 最少的列。
      </div>
    </div>
  )
}
