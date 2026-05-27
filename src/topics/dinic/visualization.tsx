import { useState, useEffect, useRef, useCallback } from 'react'

interface VizEdge {
  from: number
  to: number
  capacity: number
  flow: number
  reverseIdx: number
}

interface VizNode {
  id: number
  label: string
  x: number
  y: number
  level: number
}

interface GraphState {
  nodes: VizNode[]
  edges: VizEdge[]
}

interface AnimationStep {
  description: string
  state: GraphState
  highlightNodes: number[]
  highlightEdges: number[]
  highlightType: 'bfs' | 'dfs' | 'augment' | 'blocked' | 'done' | 'none'
  phase: string
}

function createInitialGraph(): GraphState {
  const nodes: VizNode[] = [
    { id: 0, label: 'S', x: 80, y: 200, level: -1 },
    { id: 1, label: 'A', x: 240, y: 100, level: -1 },
    { id: 2, label: 'B', x: 240, y: 300, level: -1 },
    { id: 3, label: 'C', x: 400, y: 100, level: -1 },
    { id: 4, label: 'D', x: 400, y: 300, level: -1 },
    { id: 5, label: 'T', x: 560, y: 200, level: -1 },
  ]

  const edges: VizEdge[] = [
    { from: 0, to: 1, capacity: 10, flow: 0, reverseIdx: 1 },
    { from: 1, to: 0, capacity: 0, flow: 0, reverseIdx: 0 },
    { from: 0, to: 2, capacity: 10, flow: 0, reverseIdx: 3 },
    { from: 2, to: 0, capacity: 0, flow: 0, reverseIdx: 2 },
    { from: 1, to: 3, capacity: 8, flow: 0, reverseIdx: 5 },
    { from: 3, to: 1, capacity: 0, flow: 0, reverseIdx: 4 },
    { from: 1, to: 4, capacity: 5, flow: 0, reverseIdx: 7 },
    { from: 4, to: 1, capacity: 0, flow: 0, reverseIdx: 6 },
    { from: 2, to: 4, capacity: 10, flow: 0, reverseIdx: 9 },
    { from: 4, to: 2, capacity: 0, flow: 0, reverseIdx: 8 },
    { from: 3, to: 5, capacity: 10, flow: 0, reverseIdx: 11 },
    { from: 5, to: 3, capacity: 0, flow: 0, reverseIdx: 10 },
    { from: 4, to: 5, capacity: 10, flow: 0, reverseIdx: 13 },
    { from: 5, to: 4, capacity: 0, flow: 0, reverseIdx: 12 },
    { from: 3, to: 4, capacity: 2, flow: 0, reverseIdx: 15 },
    { from: 4, to: 3, capacity: 0, flow: 0, reverseIdx: 14 },
  ]

  return { nodes, edges }
}

function cloneState(state: GraphState): GraphState {
  return {
    nodes: state.nodes.map(n => ({ ...n })),
    edges: state.edges.map(e => ({ ...e })),
  }
}

function generateDinicSteps(initialState: GraphState): AnimationStep[] {
  const steps: AnimationStep[] = []
  const state = cloneState(initialState)
  const source = 0
  const sink = 5
  const nodeCount = state.nodes.length

  // Build adjacency list (only non-reverse edges with capacity > 0)
  const adj: number[][] = Array.from({ length: nodeCount }, () => [])
  for (let i = 0; i < state.edges.length; i++) {
    if (state.edges[i].capacity > 0) {
      adj[state.edges[i].from].push(i)
    }
  }

  let totalFlow = 0
  let iteration = 0

  steps.push({
    description: '初始状态：所有边流量为0，准备开始Dinic算法',
    state: cloneState(state),
    highlightNodes: [source, sink],
    highlightEdges: [],
    highlightType: 'none',
    phase: '初始化',
  })

  while (true) {
    // BFS to build level graph
    const level = new Array(nodeCount).fill(-1)
    level[source] = 0
    const queue = [source]
    let head = 0
    const bfsVisitedEdges: number[] = []
    const bfsVisitedNodes: number[] = [source]

    while (head < queue.length) {
      const u = queue[head++]
      for (const idx of adj[u]) {
        const e = state.edges[idx]
        if (level[e.to] === -1 && e.capacity - e.flow > 0) {
          level[e.to] = level[u] + 1
          queue.push(e.to)
          bfsVisitedNodes.push(e.to)
          bfsVisitedEdges.push(idx)
        }
      }
    }

    // Update node levels
    for (let i = 0; i < nodeCount; i++) {
      state.nodes[i].level = level[i]
    }

    if (level[sink] === -1) {
      steps.push({
        description: `BFS: 汇点不可达，层次图构建完毕，算法结束。总最大流 = ${totalFlow}`,
        state: cloneState(state),
        highlightNodes: [source],
        highlightEdges: [],
        highlightType: 'done',
        phase: '完成',
      })
      break
    }

    iteration++

    steps.push({
      description: `第${iteration}轮 BFS: 构建层次图，汇点在第${level[sink]}层`,
      state: cloneState(state),
      highlightNodes: bfsVisitedNodes,
      highlightEdges: bfsVisitedEdges,
      highlightType: 'bfs',
      phase: `BFS (第${iteration}轮)`,
    })

    // DFS to find blocking flow with current arc optimization
    const ptr = new Array(nodeCount).fill(0)

    function dfs(u: number, pushed: number): number {
      if (u === sink || pushed === 0) return pushed
      for (; ptr[u] < adj[u].length; ptr[u]++) {
        const idx = adj[u][ptr[u]]
        const e = state.edges[idx]
        if (level[e.to] !== level[u] + 1 || e.capacity - e.flow <= 0) continue
        const tr = dfs(e.to, Math.min(pushed, e.capacity - e.flow))
        if (tr > 0) {
          state.edges[idx].flow += tr
          state.edges[e.reverseIdx].flow -= tr
          return tr
        }
      }
      return 0
    }

    let augmentCount = 0
    while (true) {
      // Reset ptr for each augmentation attempt
      const savedPtr = [...ptr]
      const savedEdges = state.edges.map(e => ({ ...e }))

      const pushed = dfs(source, Infinity)
      if (pushed === 0) {
        // Restore state if no augmenting path found
        for (let i = 0; i < state.edges.length; i++) {
          state.edges[i].flow = savedEdges[i].flow
        }
        break
      }

      totalFlow += pushed
      augmentCount++

      // Find the augmenting path edges for visualization
      const pathEdges: number[] = []
      const pathNodes: number[] = [source]
      let cur = source
      const tempLevel = level
      while (cur !== sink) {
        for (const idx of adj[cur]) {
          const e = state.edges[idx]
          const se = savedEdges[idx]
          if (tempLevel[e.to] === tempLevel[cur] + 1 && e.flow > se.flow) {
            pathEdges.push(idx)
            pathNodes.push(e.to)
            cur = e.to
            break
          }
        }
      }

      steps.push({
        description: `DFS增广: 找到路径 ${pathNodes.map(n => state.nodes[n].label).join(' -> ')}，增广量 = ${pushed}，当前总流量 = ${totalFlow}`,
        state: cloneState(state),
        highlightNodes: pathNodes,
        highlightEdges: pathEdges,
        highlightType: 'augment',
        phase: `DFS增广 (第${iteration}轮)`,
      })
    }

    if (augmentCount === 0) {
      steps.push({
        description: `第${iteration}轮: 层次图中无法找到增广路（阻塞），进入下一轮BFS`,
        state: cloneState(state),
        highlightNodes: [],
        highlightEdges: [],
        highlightType: 'blocked',
        phase: `阻塞 (第${iteration}轮)`,
      })
    } else {
      steps.push({
        description: `第${iteration}轮完成: 找到${augmentCount}条增广路，阻塞流已计算。总流量 = ${totalFlow}`,
        state: cloneState(state),
        highlightNodes: [],
        highlightEdges: [],
        highlightType: 'blocked',
        phase: `阻塞 (第${iteration}轮)`,
      })
    }
  }

  return steps
}

export default function DinicVisualization() {
  const [graphState, setGraphState] = useState<GraphState>(createInitialGraph)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [highlightNodes, setHighlightNodes] = useState<number[]>([])
  const [highlightEdges, setHighlightEdges] = useState<number[]>([])
  const [highlightType, setHighlightType] = useState<string>('none')
  const [description, setDescription] = useState<string>('Dinic最大流算法 - 点击「开始」运行算法')
  const [phase, setPhase] = useState<string>('就绪')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setGraphState(step.state)
      setHighlightNodes(step.highlightNodes)
      setHighlightEdges(step.highlightEdges)
      setHighlightType(step.highlightType)
      setDescription(step.description)
      setPhase(step.phase)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleStart = useCallback(() => {
    const initial = createInitialGraph()
    setGraphState(initial)
    const generatedSteps = generateDinicSteps(initial)
    setSteps(generatedSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setHighlightNodes([])
    setHighlightEdges([])
    setHighlightType('none')
    setDescription('开始运行Dinic算法...')
    setPhase('运行中')
  }, [])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStep = () => {
    if (steps.length === 0) {
      const initial = createInitialGraph()
      setGraphState(initial)
      const generatedSteps = generateDinicSteps(initial)
      setSteps(generatedSteps)
      setCurrentStep(0)
      if (generatedSteps.length > 0) {
        const step = generatedSteps[0]
        setGraphState(step.state)
        setHighlightNodes(step.highlightNodes)
        setHighlightEdges(step.highlightEdges)
        setHighlightType(step.highlightType)
        setDescription(step.description)
        setPhase(step.phase)
        setCurrentStep(1)
      }
    } else if (currentStep < steps.length) {
      const step = steps[currentStep]
      setGraphState(step.state)
      setHighlightNodes(step.highlightNodes)
      setHighlightEdges(step.highlightEdges)
      setHighlightType(step.highlightType)
      setDescription(step.description)
      setPhase(step.phase)
      setCurrentStep(prev => prev + 1)
    }
    setIsPlaying(false)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setGraphState(createInitialGraph())
    setSteps([])
    setCurrentStep(0)
    setHighlightNodes([])
    setHighlightEdges([])
    setHighlightType('none')
    setDescription('已重置 - 点击「开始」运行算法')
    setPhase('就绪')
  }

  const getEdgeColor = (idx: number): string => {
    if (highlightEdges.includes(idx)) {
      switch (highlightType) {
        case 'bfs': return '#3b82f6'
        case 'augment': return '#22c55e'
        case 'blocked': return '#ef4444'
        default: return 'var(--text-secondary)'
      }
    }
    return 'var(--text-secondary)'
  }

  const getEdgeWidth = (idx: number): number => {
    return highlightEdges.includes(idx) ? 3 : 1.5
  }

  const getNodeColor = (id: number): string => {
    if (id === 0) return '#f59e0b'
    if (id === 5) return '#ef4444'
    if (highlightNodes.includes(id)) {
      switch (highlightType) {
        case 'bfs': return '#3b82f6'
        case 'dfs': return '#8b5cf6'
        case 'augment': return '#22c55e'
        default: return '#6b7280'
      }
    }
    return '#6b7280'
  }

  const realEdges = graphState.edges.filter(e => e.capacity > 0)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始
        </button>
        <button className="btn btn-primary" onClick={handleStep}>
          单步
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
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
            max="3000"
            value={3000 - speed}
            onChange={(e) => setSpeed(3000 - Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width="660" height="400">
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
            <marker id="arrow-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
            <marker id="arrow-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
            </marker>
            <marker id="arrow-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
          </defs>

          {/* Edges */}
          {realEdges.map((edge, i) => {
            const fromNode = graphState.nodes[edge.from]
            const toNode = graphState.nodes[edge.to]
            const edgeIdx = graphState.edges.indexOf(edge)
            const isHighlighted = highlightEdges.includes(edgeIdx)

            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const offsetX = (dx / dist) * 30
            const offsetY = (dy / dist) * 30

            const x1 = fromNode.x + offsetX
            const y1 = fromNode.y + offsetY
            const x2 = toNode.x - offsetX
            const y2 = toNode.y - offsetY

            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2

            const markerSuffix = highlightType === 'bfs' && isHighlighted ? '-blue' :
              highlightType === 'augment' && isHighlighted ? '-green' :
              highlightType === 'blocked' && isHighlighted ? '-red' : ''

            return (
              <g key={`edge-${edgeIdx}`}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={getEdgeColor(edgeIdx)}
                  strokeWidth={getEdgeWidth(edgeIdx)}
                  markerEnd={`url(#arrow${markerSuffix})`}
                />
                <rect
                  x={midX - 18} y={midY - 10} width="36" height="16" rx="3"
                  fill="var(--bg-card)" stroke="var(--border)" strokeWidth="0.5"
                />
                <text
                  x={midX} y={midY + 3}
                  textAnchor="middle" fontSize="10"
                  fill="var(--text-primary)" fontFamily="Consolas, Monaco, monospace"
                >
                  {edge.flow}/{edge.capacity}
                </text>
              </g>
            )
          })}

          {/* Nodes */}
          {graphState.nodes.map(node => {
            const isHighlighted = highlightNodes.includes(node.id)
            const isSource = node.id === 0
            const isSink = node.id === 5
            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={node.x} cy={node.y} r="25"
                  fill={getNodeColor(node.id)}
                  stroke={isHighlighted ? '#fff' : 'var(--border)'}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                />
                <text
                  x={node.x} y={node.y + 5}
                  textAnchor="middle" fontSize="16" fontWeight="bold"
                  fill="#fff" fontFamily="Consolas, Monaco, monospace"
                >
                  {node.label}
                </text>
                {node.level >= 0 && (
                  <text
                    x={node.x} y={node.y - 32}
                    textAnchor="middle" fontSize="10"
                    fill="var(--text-secondary)"
                  >
                    L{node.level}
                  </text>
                )}
                {isSource && (
                  <text
                    x={node.x} y={node.y + 42}
                    textAnchor="middle" fontSize="10"
                    fill="#f59e0b" fontWeight="bold"
                  >
                    源点
                  </text>
                )}
                {isSink && (
                  <text
                    x={node.x} y={node.y + 42}
                    textAnchor="middle" fontSize="10"
                    fill="#ef4444" fontWeight="bold"
                  >
                    汇点
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="viz-info">
        <strong>当前阶段：</strong>{phase} | <strong>说明：</strong>{description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          源点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          汇点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          BFS遍历
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          增广路径
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 20, height: 3, background: '#ef4444', marginRight: 4, verticalAlign: 'middle' }} />
          阻塞
        </span>
      </div>
    </div>
  )
}
