import { useState, useRef, useCallback } from 'react'

interface GraphEdge {
  from: number
  to: number
  weight: number
}

interface GraphNode {
  id: number
  x: number
  y: number
  label: string
}

interface StepData {
  description: string
  matrix: number[][] | null
  matrixLabel: string
  highlightRow: number
  highlightCol: number
  cofactorMatrix: number[][] | null
  result: number | null
  phase: 'graph' | 'adjacency' | 'degree' | 'kirchhoff' | 'cofactor' | 'result'
}

const INITIAL_NODES: GraphNode[] = [
  { id: 0, x: 100, y: 60, label: '0' },
  { id: 1, x: 300, y: 60, label: '1' },
  { id: 2, x: 100, y: 200, label: '2' },
  { id: 3, x: 300, y: 200, label: '3' },
]

const INITIAL_EDGES: GraphEdge[] = [
  { from: 0, to: 1, weight: 1 },
  { from: 0, to: 2, weight: 1 },
  { from: 1, to: 3, weight: 1 },
  { from: 2, to: 3, weight: 1 },
]

const GRAPH_PRESETS: { name: string; nodes: GraphNode[]; edges: GraphEdge[] }[] = [
  {
    name: '4节点环图',
    nodes: INITIAL_NODES,
    edges: INITIAL_EDGES,
  },
  {
    name: '三角形 (K3)',
    nodes: [
      { id: 0, x: 200, y: 40, label: '0' },
      { id: 1, x: 80, y: 200, label: '1' },
      { id: 2, x: 320, y: 200, label: '2' },
    ],
    edges: [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 1 },
      { from: 1, to: 2, weight: 1 },
    ],
  },
  {
    name: '完全图 K4',
    nodes: INITIAL_NODES,
    edges: [
      { from: 0, to: 1, weight: 1 },
      { from: 0, to: 2, weight: 1 },
      { from: 0, to: 3, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 1, to: 3, weight: 1 },
      { from: 2, to: 3, weight: 1 },
    ],
  },
  {
    name: '路径图 P4',
    nodes: INITIAL_NODES,
    edges: [
      { from: 0, to: 1, weight: 1 },
      { from: 1, to: 2, weight: 1 },
      { from: 2, to: 3, weight: 1 },
    ],
  },
]

function determinant(matrix: number[][]): number {
  const n = matrix.length
  if (n === 0) return 0
  if (n === 1) return matrix[0][0]
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]

  const mat = matrix.map(row => [...row])
  let det = 1

  for (let i = 0; i < n; i++) {
    let maxRow = i
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(mat[k][i]) > Math.abs(mat[maxRow][i])) {
        maxRow = k
      }
    }
    if (maxRow !== i) {
      ;[mat[i], mat[maxRow]] = [mat[maxRow], mat[i]]
      det *= -1
    }
    if (Math.abs(mat[i][i]) < 1e-10) return 0

    det *= mat[i][i]
    for (let k = i + 1; k < n; k++) {
      const factor = mat[k][i] / mat[i][i]
      for (let j = i; j < n; j++) {
        mat[k][j] -= factor * mat[i][j]
      }
    }
  }

  return Math.round(det)
}

function buildAdjacencyMatrix(nodes: GraphNode[], edges: GraphEdge[]): number[][] {
  const n = nodes.length
  const A: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  for (const e of edges) {
    A[e.from][e.to] = e.weight
    A[e.to][e.from] = e.weight
  }
  return A
}

function buildDegreeMatrix(nodes: GraphNode[], edges: GraphEdge[]): number[][] {
  const n = nodes.length
  const D: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  for (const e of edges) {
    D[e.from][e.from] += e.weight
    D[e.to][e.to] += e.weight
  }
  return D
}

function buildKirchhoffMatrix(nodes: GraphNode[], edges: GraphEdge[]): number[][] {
  const n = nodes.length
  const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
  for (const e of edges) {
    L[e.from][e.to] = -e.weight
    L[e.to][e.from] = -e.weight
    L[e.from][e.from] += e.weight
    L[e.to][e.to] += e.weight
  }
  return L
}

function getCofactor(matrix: number[][], row: number, col: number): number[][] {
  return matrix
    .filter((_, i) => i !== row)
    .map(r => r.filter((_, j) => j !== col))
}

export default function MatrixTreeVisualization() {
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES)
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES)
  const [steps, setSteps] = useState<StepData[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const [description, setDescription] = useState('Matrix-Tree 定理 - 选择图例或点击「开始计算」')
  const [deleteRow, setDeleteRow] = useState(0)
  const timerRef = useRef<number | null>(null)

  const buildSteps = useCallback((): StepData[] => {
    const n = nodes.length
    const A = buildAdjacencyMatrix(nodes, edges)
    const D = buildDegreeMatrix(nodes, edges)
    const L = buildKirchhoffMatrix(nodes, edges)
    const cofactor = getCofactor(L, deleteRow, deleteRow)
    const result = determinant(cofactor)

    return [
      {
        description: '步骤 1/5: 显示原始图结构，观察节点和边的连接关系',
        matrix: null,
        matrixLabel: '',
        highlightRow: -1,
        highlightCol: -1,
        cofactorMatrix: null,
        result: null,
        phase: 'graph',
      },
      {
        description: `步骤 2/5: 构造邻接矩阵 A（${n}x${n}），A[i][j]=1 表示节点 i 和 j 之间有边`,
        matrix: A,
        matrixLabel: 'A (邻接矩阵)',
        highlightRow: -1,
        highlightCol: -1,
        cofactorMatrix: null,
        result: null,
        phase: 'adjacency',
      },
      {
        description: `步骤 3/5: 构造度数矩阵 D（对角矩阵），D[i][i] = 节点 i 的度数`,
        matrix: D,
        matrixLabel: 'D (度数矩阵)',
        highlightRow: -1,
        highlightCol: -1,
        cofactorMatrix: null,
        result: null,
        phase: 'degree',
      },
      {
        description: '步骤 4/5: 计算 Kirchhoff 矩阵 L = D - A（拉普拉斯矩阵）',
        matrix: L,
        matrixLabel: 'L = D - A (Kirchhoff矩阵)',
        highlightRow: -1,
        highlightCol: -1,
        cofactorMatrix: null,
        result: null,
        phase: 'kirchhoff',
      },
      {
        description: `步骤 5/5: 删除第 ${deleteRow} 行第 ${deleteRow} 列，计算代数余子式的行列式 = ${result}。生成树数量 = ${result}！`,
        matrix: L,
        matrixLabel: 'L (Kirchhoff矩阵)',
        highlightRow: deleteRow,
        highlightCol: deleteRow,
        cofactorMatrix: cofactor,
        result,
        phase: 'result',
      },
    ]
  }, [nodes, edges, deleteRow])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const newSteps = buildSteps()
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setDescription(newSteps[0].description)
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1
      setCurrentStep(next)
      setDescription(steps[next].description)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1
      setCurrentStep(prev)
      setDescription(steps[prev].description)
    }
  }

  const handlePreset = (presetIndex: number) => {
    const preset = GRAPH_PRESETS[presetIndex]
    if (timerRef.current) clearTimeout(timerRef.current)
    setNodes(preset.nodes)
    setEdges(preset.edges)
    setSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
    setDeleteRow(0)
    setDescription(`已加载图例: ${preset.name}，点击「开始计算」`)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setNodes(INITIAL_NODES)
    setEdges(INITIAL_EDGES)
    setSteps([])
    setCurrentStep(0)
    setDeleteRow(0)
    setDescription('已重置为默认图例')
  }

  const currentStepData = steps[currentStep] || null

  const renderMatrix = (
    matrix: number[][],
    label: string,
    highlightRow: number,
    highlightCol: number,
    isCofactor: boolean
  ) => {
    const n = matrix.length
    const cellSize = Math.min(36, 280 / n)

    return (
      <div style={{ textAlign: 'center', margin: '0.5rem' }}>
        {label && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
            {label}
          </div>
        )}
        <table
          style={{
            margin: '0 auto',
            borderCollapse: 'collapse',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: `${Math.min(14, 120 / n)}px`,
          }}
        >
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {row.map((val, j) => {
                  const isHighlighted =
                    !isCofactor && (i === highlightRow || j === highlightCol)
                  const isDiag = i === highlightRow && j === highlightCol
                  return (
                    <td
                      key={j}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        textAlign: 'center',
                        border: '1px solid var(--border)',
                        backgroundColor: isDiag
                          ? '#ef444480'
                          : isHighlighted
                          ? '#ef444430'
                          : 'var(--bg-card)',
                        color: isDiag || isHighlighted ? '#ef4444' : 'var(--text-primary)',
                        fontWeight: isDiag ? 'bold' : 'normal',
                        padding: '2px 4px',
                      }}
                    >
                      {val}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderGraph = () => {
    const nodeRadius = 22
    return (
      <svg width="400" height="280" style={{ display: 'block', margin: '0 auto' }}>
        <defs>
          <marker
            id="arrow-mt"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((e, idx) => {
          const fromNode = nodes[e.from]
          const toNode = nodes[e.to]
          if (!fromNode || !toNode) return null
          return (
            <g key={idx}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="var(--border)"
                strokeWidth="2.5"
              />
              {e.weight !== 1 && (
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 8}
                  fill="var(--text-secondary)"
                  fontSize="12"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  w={e.weight}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map(node => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              fill="var(--bg-card)"
              stroke="var(--accent)"
              strokeWidth="2"
            />
            <text
              x={node.x}
              y={node.y + 5}
              fill="var(--text-primary)"
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="Consolas, Monaco, monospace"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    )
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          图例:
          <select
            onChange={e => handlePreset(Number(e.target.value))}
            style={{
              padding: '0.3rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
          >
            {GRAPH_PRESETS.map((p, i) => (
              <option key={i} value={i}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          删除第
          <select
            value={deleteRow}
            onChange={e => setDeleteRow(Number(e.target.value))}
            style={{
              padding: '0.3rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
          >
            {nodes.map((_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          行/列
        </label>

        <button className="btn btn-primary" onClick={handleStart}>
          开始计算
        </button>
        <button
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={currentStep <= 0 || steps.length === 0}
        >
          上一步
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleNext}
          disabled={steps.length === 0 || currentStep >= steps.length - 1}
        >
          下一步
        </button>
        <button
          className="btn btn-secondary"
          onClick={handlePauseResume}
          disabled={steps.length === 0}
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
            min="400"
            max="3000"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        {currentStepData && currentStepData.phase === 'graph' ? (
          renderGraph()
        ) : currentStepData && currentStepData.matrix ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', padding: '1rem' }}>
            <div>
              {renderMatrix(
                currentStepData.matrix,
                currentStepData.matrixLabel,
                currentStepData.highlightRow,
                currentStepData.highlightCol,
                false
              )}
            </div>
            {currentStepData.cofactorMatrix && (
              <div>
                {renderMatrix(
                  currentStepData.cofactorMatrix,
                  `余子式 (删第${deleteRow}行第${deleteRow}列)`,
                  -1,
                  -1,
                  true
                )}
                {currentStepData.result !== null && (
                  <div
                    style={{
                      marginTop: '1rem',
                      textAlign: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: 'var(--accent)',
                    }}
                  >
                    行列式 = {currentStepData.result}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          renderGraph()
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      {currentStepData && currentStepData.result !== null && (
        <div
          className="viz-info"
          style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: 'var(--accent)',
            textAlign: 'center',
          }}
        >
          生成树数量 = {currentStepData.result}
        </div>
      )}

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>步骤流程：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--accent)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          1. 图结构
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          2. 邻接矩阵 A
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          3. 度数矩阵 D
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          4. Kirchhoff矩阵 L
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          5. 代数余子式
        </span>
      </div>
    </div>
  )
}
