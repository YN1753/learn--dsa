import { useState, useEffect, useRef, useCallback } from 'react'

interface PRNode {
  id: number
  label: string
  x: number
  y: number
  height: number
  excess: number
}

interface PREdge {
  from: number
  to: number
  capacity: number
  flow: number
}

interface AnimationStep {
  description: string
  nodes: PRNode[]
  edges: PREdge[]
  activeNodeId: number | null
  operationType: 'push' | 'relabel' | 'init' | 'done' | 'none'
}

const INITIAL_NODES: PRNode[] = [
  { id: 0, label: 's', x: 60, y: 150, height: 4, excess: 0 },
  { id: 1, label: 'A', x: 220, y: 70, height: 0, excess: 0 },
  { id: 2, label: 'B', x: 220, y: 230, height: 0, excess: 0 },
  { id: 3, label: 'C', x: 380, y: 70, height: 0, excess: 0 },
  { id: 4, label: 'D', x: 380, y: 230, height: 0, excess: 0 },
  { id: 5, label: 't', x: 540, y: 150, height: 0, excess: 0 },
]

const INITIAL_EDGES: PREdge[] = [
  { from: 0, to: 1, capacity: 10, flow: 10 },
  { from: 0, to: 2, capacity: 8, flow: 8 },
  { from: 1, to: 3, capacity: 5, flow: 0 },
  { from: 1, to: 2, capacity: 2, flow: 0 },
  { from: 2, to: 4, capacity: 10, flow: 0 },
  { from: 3, to: 5, capacity: 7, flow: 0 },
  { from: 4, to: 5, capacity: 10, flow: 0 },
  { from: 3, to: 4, capacity: 3, flow: 0 },
]

function cloneState(nodes: PRNode[], edges: PREdge[]): { nodes: PRNode[]; edges: PREdge[] } {
  return {
    nodes: nodes.map(n => ({ ...n })),
    edges: edges.map(e => ({ ...e })),
  }
}

function generateSteps(): AnimationStep[] {
  const steps: AnimationStep[] = []

  // Step 0: Initial state
  const s0 = cloneState(INITIAL_NODES, INITIAL_EDGES)
  steps.push({
    description: '初始化：源点 s 高度设为 4（节点数），源点出边满流，邻居获得初始超额。A 获得超额 10，B 获得超额 8。',
    ...s0,
    activeNodeId: null,
    operationType: 'init',
  })

  // Step 1: Push s->A, then push A->C
  const s1 = cloneState(INITIAL_NODES, INITIAL_EDGES)
  s1.nodes[1].excess = 5
  s1.nodes[3].excess = 5
  s1.edges[2].flow = 5
  steps.push({
    description: 'Push(s→A) 将超额推送给 A。然后 Push(A→C)：A 的高度(1)比 C(0)高 1，推送 5 单位流量到 C。C 获得超额 5。',
    ...s1,
    activeNodeId: 1,
    operationType: 'push',
  })

  // Step 2: Relabel A (can't push further, height 1, neighbors all >= 1)
  const s2 = cloneState(s1.nodes, s1.edges)
  s2.nodes[1].height = 3
  steps.push({
    description: 'Relabel(A)：A 的邻居 C 高度为 0（已被推过），B 高度为 0 但边容量为 2。A 无法继续 push，抬高 A 的高度到 3。',
    ...s2,
    activeNodeId: 1,
    operationType: 'relabel',
  })

  // Step 3: Push s->B excess, push B->D
  const s3 = cloneState(s2.nodes, s2.edges)
  s3.nodes[2].excess = 0 // B had 8, push 8 to D
  s3.nodes[4].excess = 8
  s3.edges[4].flow = 8
  steps.push({
    description: 'Push(B→D)：B 高度(1)比 D(0)高 1，推送 8 单位流量到 D。D 获得超额 8。',
    ...s3,
    activeNodeId: 2,
    operationType: 'push',
  })

  // Step 4: Push C->t
  const s4 = cloneState(s3.nodes, s3.edges)
  s4.nodes[3].excess = 0
  s4.nodes[5].excess = 5
  s4.edges[5].flow = 5
  steps.push({
    description: 'Push(C→t)：C 高度(1)比 t(0)高 1，推送 5 单位流量到汇点 t。汇点获得超额 5。',
    ...s4,
    activeNodeId: 3,
    operationType: 'push',
  })

  // Step 5: Push D->t
  const s5 = cloneState(s4.nodes, s4.edges)
  s5.nodes[4].excess = 0
  s5.nodes[5].excess = 13
  s5.edges[6].flow = 8
  steps.push({
    description: 'Push(D→t)：D 高度(1)比 t(0)高 1，推送 8 单位流量到汇点 t。汇点累计超额 13。',
    ...s5,
    activeNodeId: 4,
    operationType: 'push',
  })

  // Step 6: Push A->B (remaining excess)
  const s6 = cloneState(s5.nodes, s5.edges)
  s6.nodes[1].excess = 3
  s6.nodes[2].excess = 2
  s6.edges[3].flow = 2
  steps.push({
    description: 'Push(A→B)：A 仍有超额 5，高度(3)比 B(1)高 2，但需要 relabel B 先。Relabel(B) 后高度为 2，再 Push(A→B) 推送 2 单位。B 获得超额 2。',
    ...s6,
    activeNodeId: 1,
    operationType: 'push',
  })

  // Step 7: Push B->D then D->t
  const s7 = cloneState(s6.nodes, s6.edges)
  s7.nodes[2].excess = 0
  s7.nodes[4].excess = 2
  s7.edges[4].flow = 10
  steps.push({
    description: 'Push(B→D)：B 高度(3)比 D(1)高 2，relabel D 到 2 后推送 2 单位到 D。然后 Push(D→t) 将 D 的超额推到汇点。',
    ...s7,
    activeNodeId: 2,
    operationType: 'push',
  })

  // Step 8: Push A->B remaining, then to t
  const s8 = cloneState(s7.nodes, s7.edges)
  s8.nodes[1].excess = 1
  s8.nodes[2].excess = 2
  s8.edges[3].flow = 4
  steps.push({
    description: '继续处理 A 的剩余超额 3 单位。通过 A→B→D→t 的路径，逐步将流量推向汇点。',
    ...s8,
    activeNodeId: 1,
    operationType: 'push',
  })

  // Step 9: Final push to drain A
  const s9 = cloneState(s8.nodes, s8.edges)
  s9.nodes[1].excess = 0
  s9.nodes[2].excess = 0
  s9.nodes[4].excess = 0
  s9.nodes[5].excess = 16
  s9.edges[3].flow = 5
  s9.edges[4].flow = 10
  s9.edges[6].flow = 10
  steps.push({
    description: '将所有中间节点的超额全部推送到汇点。A、B、C、D 的超额均为 0，汇点超额为 16。',
    ...s9,
    activeNodeId: 5,
    operationType: 'push',
  })

  // Step 10: Done
  steps.push({
    description: '算法完成！所有中间节点超额为 0，预流变为可行流。最大流值 = 16。路径：s→A→C→t (5)，s→A→B→D→t (5)，s→B→D→t (8)。注意：s→A→B 流量调整了多次。',
    ...s9,
    activeNodeId: null,
    operationType: 'done',
  })

  return steps
}

export default function PushRelabelVisualization() {
  const [nodes, setNodes] = useState<PRNode[]>(INITIAL_NODES)
  const [edges, setEdges] = useState<PREdge[]>(INITIAL_EDGES)
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null)
  const [operationType, setOperationType] = useState<'push' | 'relabel' | 'init' | 'done' | 'none'>('none')
  const [description, setDescription] = useState<string>('预流推进算法可视化 - 点击「播放」开始演示')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
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
      setNodes([...step.nodes])
      setEdges([...step.edges])
      setActiveNodeId(step.activeNodeId)
      setOperationType(step.operationType)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePlay = () => {
    const animationSteps = generateSteps()
    executeSteps(animationSteps)
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
      const animationSteps = generateSteps()
      setSteps(animationSteps)
      setCurrentStep(0)
    }
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setNodes([...step.nodes])
      setEdges([...step.edges])
      setActiveNodeId(step.activeNodeId)
      setOperationType(step.operationType)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setNodes(INITIAL_NODES.map(n => ({ ...INITIAL_NODES.find(i => i.id === n.id)! })))
    setEdges(INITIAL_EDGES.map(e => ({ ...e })))
    setActiveNodeId(null)
    setOperationType('none')
    setDescription('预流推进算法可视化 - 点击「播放」开始演示')
    setSteps([])
    setCurrentStep(0)
  }

  const getNodeColor = (node: PRNode): string => {
    if (node.id === 0) return '#6366f1' // source - indigo
    if (node.id === 5) return '#8b5cf6' // sink - purple
    if (node.id === activeNodeId) {
      if (operationType === 'push') return '#3b82f6'
      if (operationType === 'relabel') return '#22c55e'
    }
    if (node.excess > 0) return '#ef4444' // active (has excess)
    return 'var(--bg-card)'
  }

  const getNodeBorder = (node: PRNode): string => {
    if (node.id === activeNodeId) {
      if (operationType === 'push') return '#60a5fa'
      if (operationType === 'relabel') return '#4ade80'
    }
    return 'var(--border)'
  }

  const getEdgeColor = (edge: PREdge): string => {
    if (edge.flow === edge.capacity) return '#f59e0b' // saturated
    if (edge.flow > 0) return '#3b82f6' // has flow
    return 'var(--text-secondary)'
  }

  const getEdgeWidth = (edge: PREdge): number => {
    if (edge.flow === 0) return 1.5
    return 1.5 + (edge.flow / edge.capacity) * 3
  }

  const svgWidth = 620
  const svgHeight = 320

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying}>
          播放
        </button>
        <button className="btn btn-primary" onClick={handleStepForward} disabled={isPlaying}>
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
            min="400"
            max="3000"
            value={3200 - speed}
            onChange={(e) => setSpeed(3200 - Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        <svg width={svgWidth} height={svgHeight}>
          <defs>
            <marker id="pr-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
            <marker id="pr-arrow-flow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
            <marker id="pr-arrow-saturated" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from)!
            const toNode = nodes.find(n => n.id === edge.to)!
            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const len = Math.sqrt(dx * dx + dy * dy)
            const nodeR = 28
            const offsetX = (dx / len) * nodeR
            const offsetY = (dy / len) * nodeR

            // Offset for parallel edges (e.g., A->B and B->A look cleaner)
            const perpX = -(dy / len) * 6
            const perpY = (dx / len) * 6

            const x1 = fromNode.x + offsetX + perpX
            const y1 = fromNode.y + offsetY + perpY
            const x2 = toNode.x - offsetX + perpX
            const y2 = toNode.y - offsetY + perpY

            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2

            const color = getEdgeColor(edge)
            const width = getEdgeWidth(edge)
            const markerId = edge.flow === edge.capacity ? 'pr-arrow-saturated' : (edge.flow > 0 ? 'pr-arrow-flow' : 'pr-arrow')

            return (
              <g key={idx}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color}
                  strokeWidth={width}
                  markerEnd={`url(#${markerId})`}
                />
                <text
                  x={midX + perpX * 2.5}
                  y={midY + perpY * 2.5}
                  fill="var(--text-secondary)"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {edge.flow}/{edge.capacity}
                </text>
              </g>
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const color = getNodeColor(node)
            const border = getNodeBorder(node)
            const isActive = node.id === activeNodeId

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={28}
                  fill={color}
                  stroke={border}
                  strokeWidth={isActive ? 3 : 1.5}
                />
                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + 1}
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.label}
                </text>
                {/* Height label */}
                <text
                  x={node.x}
                  y={node.y - 40}
                  fill="var(--text-primary)"
                  fontSize="12"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  h={node.height}
                </text>
                {/* Excess label */}
                <text
                  x={node.x}
                  y={node.y + 42}
                  fill={node.excess > 0 ? '#ef4444' : 'var(--text-secondary)'}
                  fontSize="12"
                  textAnchor="middle"
                  fontWeight={node.excess > 0 ? 'bold' : 'normal'}
                  fontFamily="Consolas, Monaco, monospace"
                >
                  e={node.excess}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          Push 操作
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          Relabel 操作
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          活跃节点（有超额）
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          饱和边
        </span>
      </div>
    </div>
  )
}
