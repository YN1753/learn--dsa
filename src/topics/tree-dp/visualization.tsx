import { useState, useEffect, useRef, useCallback } from 'react'

interface Edge {
  u: number
  v: number
}

interface TreeNodeData {
  id: number
  x: number
  y: number
  weight: number
}

type Phase = 'idle' | 'computing' | 'done'

interface AnimationStep {
  description: string
  phase: Phase
  currentNode: number | null
  processedNodes: Set<number>
  dp0: Map<number, number>
  dp1: Map<number, number>
  highlightedEdge: [number, number] | null
}

const TREE_EDGES: Edge[] = [
  { u: 1, v: 2 }, { u: 1, v: 3 }, { u: 2, v: 4 },
  { u: 2, v: 5 }, { u: 3, v: 6 }, { u: 5, v: 7 },
  { u: 5, v: 8 },
]

const TREE_NODES: TreeNodeData[] = [
  { id: 1, x: 400, y: 50, weight: 1 },
  { id: 2, x: 220, y: 140, weight: 2 },
  { id: 3, x: 580, y: 140, weight: 3 },
  { id: 4, x: 100, y: 250, weight: 4 },
  { id: 5, x: 320, y: 250, weight: 5 },
  { id: 6, x: 660, y: 250, weight: 6 },
  { id: 7, x: 220, y: 360, weight: 7 },
  { id: 8, x: 420, y: 360, weight: 8 },
]

function buildAdjacency(): Map<number, number[]> {
  const adj = new Map<number, number[]>()
  for (const edge of TREE_EDGES) {
    if (!adj.has(edge.u)) adj.set(edge.u, [])
    if (!adj.has(edge.v)) adj.set(edge.v, [])
    adj.get(edge.u)!.push(edge.v)
    adj.get(edge.v)!.push(edge.u)
  }
  return adj
}

function postOrderTraversal(
  node: number,
  parent: number,
  adj: Map<number, number[]>,
  order: number[],
  parentMap: Map<number, number>
): void {
  parentMap.set(node, parent)
  for (const child of adj.get(node) || []) {
    if (child === parent) continue
    postOrderTraversal(child, node, adj, order, parentMap)
  }
  order.push(node)
}

function generateSteps(adj: Map<number, number[]>): AnimationStep[] {
  const steps: AnimationStep[] = []
  const order: number[] = []
  const parentMap = new Map<number, number>()
  postOrderTraversal(1, -1, adj, order, parentMap)

  const dp0 = new Map<number, number>()
  const dp1 = new Map<number, number>()
  const processedNodes = new Set<number>()
  const nodeWeight = new Map(TREE_NODES.map(n => [n.id, n.weight]))

  steps.push({
    description: '开始树形DP计算最大独立集。将按后序遍历顺序处理每个节点。',
    phase: 'idle',
    currentNode: null,
    processedNodes: new Set(),
    dp0: new Map(),
    dp1: new Map(),
    highlightedEdge: null,
  })

  for (const node of order) {
    const w = nodeWeight.get(node)!
    dp0.set(node, 0)
    dp1.set(node, w)

    steps.push({
      description: `处理节点 ${node}（权值=${w}）。初始化: dp[${node}][0]=0, dp[${node}][1]=${w}`,
      phase: 'computing',
      currentNode: node,
      processedNodes: new Set(processedNodes),
      dp0: new Map(dp0),
      dp1: new Map(dp1),
      highlightedEdge: null,
    })

    const children = (adj.get(node) || []).filter(c => c !== parentMap.get(node))
    for (const child of children) {
      const childDp0 = dp0.get(child)!
      const childDp1 = dp1.get(child)!

      steps.push({
        description: `节点 ${node} 合并子节点 ${child} 的DP值: dp[${child}][0]=${childDp0}, dp[${child}][1]=${childDp1}`,
        phase: 'computing',
        currentNode: node,
        processedNodes: new Set(processedNodes),
        dp0: new Map(dp0),
        dp1: new Map(dp1),
        highlightedEdge: [node, child],
      })

      const newDp0 = dp0.get(node)! + Math.max(childDp0, childDp1)
      const newDp1 = dp1.get(node)! + childDp0
      dp0.set(node, newDp0)
      dp1.set(node, newDp1)

      steps.push({
        description: `更新: dp[${node}][0]=${newDp0}（取子节点较大值），dp[${node}][1]=${newDp1}（子节点不能选）`,
        phase: 'computing',
        currentNode: node,
        processedNodes: new Set(processedNodes),
        dp0: new Map(dp0),
        dp1: new Map(dp1),
        highlightedEdge: [node, child],
      })
    }

    processedNodes.add(node)
    steps.push({
      description: `节点 ${node} 处理完毕: dp[${node}][0]=${dp0.get(node)}, dp[${node}][1]=${dp1.get(node)}`,
      phase: 'computing',
      currentNode: null,
      processedNodes: new Set(processedNodes),
      dp0: new Map(dp0),
      dp1: new Map(dp1),
      highlightedEdge: null,
    })
  }

  const result = Math.max(dp0.get(1)!, dp1.get(1)!)
  steps.push({
    description: `计算完成！最大独立集 = max(dp[1][0], dp[1][1]) = max(${dp0.get(1)}, ${dp1.get(1)}) = ${result}`,
    phase: 'done',
    currentNode: null,
    processedNodes: new Set(processedNodes),
    dp0: new Map(dp0),
    dp1: new Map(dp1),
    highlightedEdge: null,
  })

  return steps
}

export default function TreeDPVisualization() {
  const adj = useRef(buildAdjacency())
  const [_phase, setPhase] = useState<Phase>('idle')
  const [currentNode, setCurrentNode] = useState<number | null>(null)
  const [processedNodes, setProcessedNodes] = useState<Set<number>>(new Set())
  const [dp0, setDp0] = useState<Map<number, number>>(new Map())
  const [dp1, setDp1] = useState<Map<number, number>>(new Map())
  const [description, setDescription] = useState<string>('点击「开始」执行树形DP求最大独立集')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(700)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedEdge, setHighlightedEdge] = useState<[number, number] | null>(null)
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
      setPhase(step.phase)
      setCurrentNode(step.currentNode)
      setProcessedNodes(new Set(step.processedNodes))
      setDp0(new Map(step.dp0))
      setDp1(new Map(step.dp1))
      setHighlightedEdge(step.highlightedEdge)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleStart = () => {
    const allSteps = generateSteps(adj.current)
    executeSteps(allSteps)
  }

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
      const allSteps = generateSteps(adj.current)
      setSteps(allSteps)
      setCurrentStep(0)
    }
    if (currentStep < steps.length) {
      setIsPlaying(false)
      const step = steps[currentStep]
      setPhase(step.phase)
      setCurrentNode(step.currentNode)
      setProcessedNodes(new Set(step.processedNodes))
      setDp0(new Map(step.dp0))
      setDp1(new Map(step.dp1))
      setHighlightedEdge(step.highlightedEdge)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setPhase('idle')
    setCurrentNode(null)
    setProcessedNodes(new Set())
    setDp0(new Map())
    setDp1(new Map())
    setHighlightedEdge(null)
    setDescription('点击「开始」执行树形DP求最大独立集')
    setSteps([])
    setCurrentStep(0)
  }

  const getNodeColor = (nodeId: number): string => {
    if (nodeId === currentNode) return '#3b82f6'
    if (processedNodes.has(nodeId)) return '#22c55e'
    return 'var(--bg-card)'
  }

  const getNodeBorder = (nodeId: number): string => {
    if (nodeId === currentNode) return '#60a5fa'
    if (processedNodes.has(nodeId)) return '#4ade80'
    return 'var(--border)'
  }

  const getEdgeColor = (u: number, v: number): string => {
    if (highlightedEdge) {
      if ((highlightedEdge[0] === u && highlightedEdge[1] === v) ||
          (highlightedEdge[0] === v && highlightedEdge[1] === u)) {
        return '#f59e0b'
      }
    }
    if (processedNodes.has(u) && processedNodes.has(v)) return '#4ade80'
    return 'var(--border)'
  }

  const getEdgeWidth = (u: number, v: number): number => {
    if (highlightedEdge) {
      if ((highlightedEdge[0] === u && highlightedEdge[1] === v) ||
          (highlightedEdge[0] === v && highlightedEdge[1] === u)) {
        return 4
      }
    }
    return 2
  }

  const nodeMap = new Map(TREE_NODES.map(n => [n.id, n]))

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying && currentStep >= steps.length}>
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
            min="100"
            max="1500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        <svg width="800" height="440" viewBox="0 0 800 440">
          {/* Edges */}
          {TREE_EDGES.map((edge) => {
            const from = nodeMap.get(edge.u)!
            const to = nodeMap.get(edge.v)!
            const color = getEdgeColor(edge.u, edge.v)
            const width = getEdgeWidth(edge.u, edge.v)
            return (
              <line
                key={`${edge.u}-${edge.v}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={color}
                strokeWidth={width}
              />
            )
          })}

          {/* Nodes */}
          {TREE_NODES.map((node) => {
            const isCurrent = node.id === currentNode
            const nodeDp0 = dp0.get(node.id)
            const nodeDp1 = dp1.get(node.id)
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={28}
                  fill={getNodeColor(node.id)}
                  stroke={getNodeBorder(node.id)}
                  strokeWidth={isCurrent ? 4 : 2}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  fill="var(--text-primary)"
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.id}
                </text>
                <text
                  x={node.x}
                  y={node.y - 42}
                  fill="var(--text-secondary)"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  w={node.weight}
                </text>
                {nodeDp0 !== undefined && (
                  <text
                    x={node.x}
                    y={node.y + 44}
                    fill="#3b82f6"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    [{nodeDp0},{nodeDp1}]
                  </text>
                )}
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
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前处理
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          已处理
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前合并边
        </span>
        <span style={{ marginLeft: '1rem', color: '#3b82f6' }}>
          [dp0, dp1] = [不选, 选] 的最大权值
        </span>
      </div>
    </div>
  )
}
