import { useState, useEffect, useRef, useCallback } from 'react'

interface GraphNode {
  id: number
  x: number
  y: number
  label: string
}

interface GraphEdge {
  from: number
  to: number
}

interface AnimationStep {
  description: string
  phase: 'dfs' | 'sdom' | 'idom' | 'tree' | 'done'
  highlightNodes: number[]
  highlightEdges: { from: number; to: number }[]
  dfnMap: Map<number, number>
  sdomMap: Map<number, number>
  idomMap: Map<number, number>
  treeEdges: { from: number; to: number }[]
  activeNode: number | null
}

const GRAPH_NODES: GraphNode[] = [
  { id: 0, x: 100, y: 40, label: '0' },
  { id: 1, x: 40, y: 120, label: '1' },
  { id: 2, x: 160, y: 120, label: '2' },
  { id: 3, x: 100, y: 200, label: '3' },
  { id: 4, x: 40, y: 280, label: '4' },
  { id: 5, x: 160, y: 280, label: '5' },
  { id: 6, x: 100, y: 360, label: '6' },
]

const GRAPH_EDGES: GraphEdge[] = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 3, to: 5 },
  { from: 4, to: 6 },
  { from: 5, to: 6 },
  { from: 2, to: 6 },
]

function generateSteps(): AnimationStep[] {
  const steps: AnimationStep[] = []
  const nodeIds = GRAPH_NODES.map(n => n.id)

  // DFS order: 0 -> 1 -> 3 -> 4 -> 6 -> 5 -> 2
  const dfsOrder = [0, 1, 3, 4, 6, 5, 2]
  const dfnValues = new Map<number, number>()
  dfsOrder.forEach((id, idx) => dfnValues.set(id, idx))

  // Step 1: Show initial graph
  steps.push({
    description: '初始有向图：从节点 0 出发，构建支配树',
    phase: 'dfs',
    highlightNodes: [0],
    highlightEdges: [],
    dfnMap: new Map(),
    sdomMap: new Map(),
    idomMap: new Map(),
    treeEdges: [],
    activeNode: 0,
  })

  // Step 2: DFS traversal
  let currentDfn = new Map<number, number>()
  for (const node of dfsOrder) {
    currentDfn = new Map(currentDfn)
    currentDfn.set(node, dfnValues.get(node)!)
    steps.push({
      description: `DFS 访问节点 ${node}，分配 DFS 序 = ${dfnValues.get(node)}`,
      phase: 'dfs',
      highlightNodes: [node],
      highlightEdges: [],
      dfnMap: currentDfn,
      sdomMap: new Map(),
      idomMap: new Map(),
      treeEdges: [],
      activeNode: node,
    })
  }

  // Step 3: Semi-dominator computation
  const sdomValues = new Map<number, number>()

  const sdomData: [number, number][] = [
    [6, 0], [5, 3], [4, 3], [3, 0], [2, 0], [1, 0],
  ]

  for (const [node, sdomVal] of sdomData) {
    sdomValues.set(node, sdomVal)
    steps.push({
      description: `计算节点 ${node} 的半支配点：sdom(${node}) = ${sdomVal}`,
      phase: 'sdom',
      highlightNodes: [node, sdomVal],
      highlightEdges: [],
      dfnMap: dfnValues,
      sdomMap: new Map(sdomValues),
      idomMap: new Map(),
      treeEdges: [],
      activeNode: node,
    })
  }

  // Step 4: idom computation
  const idomValues = new Map<number, number>()
  idomValues.set(0, 0)

  const idomData: [number, number][] = [
    [1, 0], [2, 0], [3, 0], [4, 3], [5, 3], [6, 0],
  ]

  for (const [node, idomVal] of idomData) {
    idomValues.set(node, idomVal)
    steps.push({
      description: `确定节点 ${node} 的直接支配者：idom(${node}) = ${idomVal}`,
      phase: 'idom',
      highlightNodes: [node, idomVal],
      highlightEdges: [],
      dfnMap: dfnValues,
      sdomMap: sdomValues,
      idomMap: new Map(idomValues),
      treeEdges: [],
      activeNode: node,
    })
  }

  // Step 5: Build dominator tree edges
  const treeEdges: { from: number; to: number }[] = []
  for (const [node, idomVal] of idomData) {
    treeEdges.push({ from: idomVal, to: node })
    steps.push({
      description: `在支配树中连接 ${idomVal} -> ${node}`,
      phase: 'tree',
      highlightNodes: [node, idomVal],
      highlightEdges: [{ from: idomVal, to: node }],
      dfnMap: dfnValues,
      sdomMap: sdomValues,
      idomMap: idomValues,
      treeEdges: [...treeEdges],
      activeNode: node,
    })
  }

  // Step 6: Done
  steps.push({
    description: '支配树构建完成！绿色边表示支配树的边',
    phase: 'done',
    highlightNodes: nodeIds,
    highlightEdges: [],
    dfnMap: dfnValues,
    sdomMap: sdomValues,
    idomMap: idomValues,
    treeEdges,
    activeNode: null,
  })

  return steps
}

export default function DominatorTreeVisualization() {
  const [steps] = useState<AnimationStep[]>(() => generateSteps())
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const timerRef = useRef<number | null>(null)

  const step = steps[currentStep] || steps[0]

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, speed)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps.length, speed])

  const handlePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }, [currentStep, steps.length])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleStepForward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const handleStepBack = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const getEdgePath = (from: GraphNode, to: GraphNode): string => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const len = Math.sqrt(dx * dx + dy * dy)
    const r = 22
    const sx = from.x + (dx / len) * r
    const sy = from.y + (dy / len) * r
    const ex = to.x - (dx / len) * r
    const ey = to.y - (dy / len) * r
    return `M ${sx} ${sy} L ${ex} ${ey}`
  }

  const nodeMap = new Map(GRAPH_NODES.map(n => [n.id, n]))

  const getNodeFill = (id: number): string => {
    if (step.highlightNodes.includes(id)) {
      if (step.phase === 'dfs') return '#3b82f6'
      if (step.phase === 'sdom') return '#f59e0b'
      if (step.phase === 'idom') return '#8b5cf6'
      if (step.phase === 'tree') return '#22c55e'
      if (step.phase === 'done') return '#22c55e'
    }
    return 'var(--bg-card)'
  }

  const getNodeStroke = (id: number): string => {
    if (id === 0) return '#ef4444'
    if (step.highlightNodes.includes(id)) return getNodeFill(id)
    return 'var(--border)'
  }

  const isTreeEdge = (from: number, to: number): boolean => {
    return step.treeEdges.some(e => e.from === from && e.to === to)
  }

  const isHighlightEdge = (from: number, to: number): boolean => {
    return step.highlightEdges.some(e => e.from === from && e.to === to)
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying}>
          播放
        </button>
        <button className="btn btn-primary" onClick={handlePause} disabled={!isPlaying}>
          暂停
        </button>
        <button className="btn btn-secondary" onClick={handleStepBack} disabled={currentStep === 0}>
          上一步
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="300"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Original graph */}
        <div style={{ flex: '1 1 280px', minWidth: '280px' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            原图 (DFS 序标注)
          </div>
          <svg width="220" height="400" style={{ display: 'block', margin: '0 auto' }}>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
              </marker>
              <marker id="arrow-highlight" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
              </marker>
            </defs>

            {/* Edges */}
            {GRAPH_EDGES.map((e, i) => {
              const from = nodeMap.get(e.from)!
              const to = nodeMap.get(e.to)!
              const highlighted = isHighlightEdge(e.from, e.to)
              const tree = isTreeEdge(e.from, e.to)
              return (
                <path
                  key={`edge-${i}`}
                  d={getEdgePath(from, to)}
                  stroke={highlighted ? '#22c55e' : tree ? '#22c55e' : 'var(--border)'}
                  strokeWidth={highlighted || tree ? 2.5 : 1.5}
                  fill="none"
                  markerEnd={highlighted || tree ? 'url(#arrow-highlight)' : 'url(#arrow)'}
                  opacity={tree ? 0.6 : 1}
                />
              )
            })}

            {/* Nodes */}
            {GRAPH_NODES.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  fill={getNodeFill(node.id)}
                  stroke={getNodeStroke(node.id)}
                  strokeWidth={step.highlightNodes.includes(node.id) ? 3 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.label}
                </text>
                {step.dfnMap.has(node.id) && (
                  <text
                    x={node.x + 28}
                    y={node.y - 12}
                    fill="#3b82f6"
                    fontSize="11"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    d:{step.dfnMap.get(node.id)}
                  </text>
                )}
                {step.sdomMap.has(node.id) && (
                  <text
                    x={node.x + 28}
                    y={node.y + 2}
                    fill="#f59e0b"
                    fontSize="11"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    s:{step.sdomMap.get(node.id)}
                  </text>
                )}
                {step.idomMap.has(node.id) && node.id !== 0 && (
                  <text
                    x={node.x + 28}
                    y={node.y + 16}
                    fill="#8b5cf6"
                    fontSize="11"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    i:{step.idomMap.get(node.id)}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Dominator tree */}
        <div style={{ flex: '1 1 280px', minWidth: '280px' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            支配树
          </div>
          <svg width="220" height="400" style={{ display: 'block', margin: '0 auto' }}>
            {/* Tree nodes - same positions but only tree edges */}
            {step.treeEdges.map((e, i) => {
              const from = nodeMap.get(e.from)
              const to = nodeMap.get(e.to)
              if (!from || !to) return null
              const isNew = step.highlightEdges.some(he => he.from === e.from && he.to === e.to)
              return (
                <line
                  key={`tree-edge-${i}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isNew ? '#4ade80' : '#22c55e'}
                  strokeWidth={isNew ? 3 : 2}
                />
              )
            })}

            {GRAPH_NODES.map(node => {
              const inTree = step.treeEdges.some(e => e.to === node.id) || node.id === 0
              return (
                <g key={`tree-${node.id}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={22}
                    fill={inTree ? (step.highlightNodes.includes(node.id) ? '#22c55e' : 'var(--bg-card)') : 'var(--bg-card)'}
                    stroke={inTree ? (step.highlightNodes.includes(node.id) ? '#4ade80' : '#22c55e') : 'var(--border)'}
                    strokeWidth={step.highlightNodes.includes(node.id) ? 3 : 1.5}
                    opacity={inTree ? 1 : 0.3}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize="14"
                    fontWeight="bold"
                    fontFamily="Consolas, Monaco, monospace"
                    opacity={inTree ? 1 : 0.3}
                  >
                    {node.label}
                  </text>
                  {node.id !== 0 && inTree && step.idomMap.has(node.id) && (
                    <text
                      x={node.x}
                      y={node.y + 36}
                      textAnchor="middle"
                      fill="var(--text-secondary)"
                      fontSize="10"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      idom={step.idomMap.get(node.id)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>

      <div className="viz-info">
        <strong>步骤 {currentStep + 1}/{steps.length}：</strong> {step.description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          DFS 遍历
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          半支配点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          直接支配者
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          支配树边
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          起点
        </span>
      </div>
    </div>
  )
}
