import { useState, useEffect, useRef, useCallback } from 'react'

interface CostEdge {
  from: string
  to: string
  capacity: number
  cost: number
  flow: number
}

interface Node {
  id: string
  x: number
  y: number
  label: string
}

interface AugmentStep {
  path: string[]
  pathEdges: { from: string; to: string; isReverse: boolean }[]
  pathCost: number
  bottleneck: number
  totalFlow: number
  totalCost: number
  edgeStates: CostEdge[]
}

function buildDefaultNetwork(): { nodes: Node[]; edges: CostEdge[]; source: string; sink: string } {
  const nodes: Node[] = [
    { id: 's', x: 80, y: 200, label: 's' },
    { id: 'A', x: 240, y: 100, label: 'A' },
    { id: 'B', x: 240, y: 300, label: 'B' },
    { id: 'C', x: 440, y: 150, label: 'C' },
    { id: 't', x: 620, y: 200, label: 't' },
  ]

  const edges: CostEdge[] = [
    { from: 's', to: 'A', capacity: 3, cost: 1, flow: 0 },
    { from: 's', to: 'B', capacity: 3, cost: 5, flow: 0 },
    { from: 'A', to: 'B', capacity: 2, cost: 1, flow: 0 },
    { from: 'A', to: 'C', capacity: 2, cost: 2, flow: 0 },
    { from: 'B', to: 'C', capacity: 2, cost: 1, flow: 0 },
    { from: 'B', to: 't', capacity: 3, cost: 3, flow: 0 },
    { from: 'C', to: 't', capacity: 4, cost: 1, flow: 0 },
  ]

  return { nodes, edges, source: 's', sink: 't' }
}

function buildResidualAdj(edges: CostEdge[]): Map<string, { to: string; residual: number; cost: number; isReverse: boolean; from: string }[]> {
  const adj = new Map<string, { to: string; residual: number; cost: number; isReverse: boolean; from: string }[]>()
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, [])
    if (!adj.has(e.to)) adj.set(e.to, [])
    const residual = e.capacity - e.flow
    if (residual > 0) {
      adj.get(e.from)!.push({ to: e.to, residual, cost: e.cost, isReverse: false, from: e.from })
    }
    if (e.flow > 0) {
      adj.get(e.to)!.push({ to: e.from, residual: e.flow, cost: -e.cost, isReverse: true, from: e.to })
    }
  }
  return adj
}

function spfaFindPath(
  edges: CostEdge[],
  source: string,
  sink: string,
  nodes: string[]
): { path: string[]; pathEdges: { from: string; to: string; isReverse: boolean }[]; pathCost: number; bottleneck: number } | null {
  const adj = buildResidualAdj(edges)

  const dist = new Map<string, number>()
  const parentMap = new Map<string, { node: string; residual: number; isReverse: boolean }>()
  const inQueue = new Map<string, boolean>()

  for (const v of nodes) {
    dist.set(v, Infinity)
    inQueue.set(v, false)
  }
  dist.set(source, 0)

  const queue: string[] = [source]
  inQueue.set(source, true)

  while (queue.length > 0) {
    const u = queue.shift()!
    inQueue.set(u, false)

    for (const edge of adj.get(u) || []) {
      const newDist = dist.get(u)! + edge.cost
      if (newDist < dist.get(edge.to)!) {
        dist.set(edge.to, newDist)
        parentMap.set(edge.to, { node: u, residual: edge.residual, isReverse: edge.isReverse })
        if (!inQueue.get(edge.to)) {
          queue.push(edge.to)
          inQueue.set(edge.to, true)
        }
      }
    }
  }

  if (dist.get(sink) === Infinity) return null

  const path: string[] = []
  const pathEdges: { from: string; to: string; isReverse: boolean }[] = []
  let current = sink
  let bottleneck = Infinity

  while (current !== source) {
    const p = parentMap.get(current)!
    bottleneck = Math.min(bottleneck, p.residual)
    path.unshift(current)
    pathEdges.unshift({ from: p.node, to: current, isReverse: p.isReverse })
    current = p.node
  }
  path.unshift(source)

  return { path, pathEdges, pathCost: dist.get(sink)!, bottleneck }
}

const SVG_WIDTH = 700
const SVG_HEIGHT = 420
const NODE_RADIUS = 28

export default function MinCostMaxFlowVisualization() {
  const [network, setNetwork] = useState(() => buildDefaultNetwork())
  const [steps, setSteps] = useState<AugmentStep[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [totalFlow, setTotalFlow] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [highlightPath, setHighlightPath] = useState<Set<string>>(new Set())
  const [highlightEdges, setHighlightEdges] = useState<Set<string>>(new Set())
  const [description, setDescription] = useState('点击"运行算法"开始 MCMF 演示')
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const computeAllSteps = useCallback(() => {
    const net = buildDefaultNetwork()
    const allSteps: AugmentStep[] = []
    let flow = 0
    let cost = 0

    while (true) {
      const result = spfaFindPath(net.edges, net.source, net.sink, net.nodes.map(n => n.id))
      if (!result) break

      flow += result.bottleneck
      cost += result.bottleneck * result.pathCost

      // Update flows
      for (const { from, to, isReverse } of result.pathEdges) {
        if (!isReverse) {
          const edge = net.edges.find(e => e.from === from && e.to === to)
          if (edge) edge.flow += result.bottleneck
        } else {
          const edge = net.edges.find(e => e.from === to && e.to === from)
          if (edge) edge.flow -= result.bottleneck
        }
      }

      allSteps.push({
        path: result.path,
        pathEdges: result.pathEdges,
        pathCost: result.pathCost,
        bottleneck: result.bottleneck,
        totalFlow: flow,
        totalCost: cost,
        edgeStates: net.edges.map(e => ({ ...e })),
      })
    }

    return { allSteps, finalEdges: net.edges, finalFlow: flow, finalCost: cost }
  }, [])

  const handleRun = useCallback(() => {
    clearTimer()
    const { allSteps, finalFlow, finalCost } = computeAllSteps()
    setSteps(allSteps)
    setTotalFlow(0)
    setTotalCost(0)
    setHighlightPath(new Set())
    setHighlightEdges(new Set())

    if (allSteps.length === 0) {
      setDescription('未找到增广路径')
      return
    }

    setCurrentStep(0)
    const firstStep = allSteps[0]
    setHighlightPath(new Set(firstStep.path))
    setHighlightEdges(new Set(firstStep.pathEdges.map(e => `${e.from}->${e.to}`)))
    setNetwork(prev => ({
      ...prev,
      edges: firstStep.edgeStates.map(e => ({ ...e })),
    }))
    setTotalFlow(firstStep.totalFlow)
    setTotalCost(firstStep.totalCost)
    setDescription(
      `增广 #1: ${firstStep.path.join(' -> ')}，费用=${firstStep.pathCost}，瓶颈=${firstStep.bottleneck}，总流=${firstStep.totalFlow}，总费=${firstStep.totalCost}`
    )

    let stepIdx = 0
    setIsPlaying(true)
    timerRef.current = window.setInterval(() => {
      stepIdx++
      if (stepIdx >= allSteps.length) {
        clearTimer()
        setIsPlaying(false)
        setDescription(`算法完成！最大流=${finalFlow}，最小费用=${finalCost}，共${allSteps.length}轮增广`)
        return
      }

      const step = allSteps[stepIdx]
      setHighlightPath(new Set(step.path))
      setHighlightEdges(new Set(step.pathEdges.map(e => `${e.from}->${e.to}`)))
      setNetwork(prev => ({
        ...prev,
        edges: step.edgeStates.map(e => ({ ...e })),
      }))
      setTotalFlow(step.totalFlow)
      setTotalCost(step.totalCost)
      setCurrentStep(stepIdx)
      setDescription(
        `增广 #${stepIdx + 1}: ${step.path.join(' -> ')}，费用=${step.pathCost}，瓶颈=${step.bottleneck}，总流=${step.totalFlow}，总费=${step.totalCost}`
      )
    }, speed)
  }, [computeAllSteps, speed, clearTimer])

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription('已暂停')
    } else if (steps.length > 0) {
      let stepIdx = currentStep
      setIsPlaying(true)
      timerRef.current = window.setInterval(() => {
        stepIdx++
        if (stepIdx >= steps.length) {
          clearTimer()
          setIsPlaying(false)
          setDescription(`算法完成！最大流=${totalFlow}，最小费用=${totalCost}，共${steps.length}轮增广`)
          return
        }
        const step = steps[stepIdx]
        setHighlightPath(new Set(step.path))
        setHighlightEdges(new Set(step.pathEdges.map(e => `${e.from}->${e.to}`)))
        setNetwork(prev => ({
          ...prev,
          edges: step.edgeStates.map(e => ({ ...e })),
        }))
        setTotalFlow(step.totalFlow)
        setTotalCost(step.totalCost)
        setCurrentStep(stepIdx)
        setDescription(
          `增广 #${stepIdx + 1}: ${step.path.join(' -> ')}，费用=${step.pathCost}，瓶颈=${step.bottleneck}，总流=${step.totalFlow}，总费=${step.totalCost}`
        )
      }, speed)
    }
  }, [isPlaying, steps, currentStep, speed, totalFlow, totalCost, clearTimer])

  const handleReset = useCallback(() => {
    clearTimer()
    const fresh = buildDefaultNetwork()
    setNetwork(fresh)
    setSteps([])
    setCurrentStep(-1)
    setIsPlaying(false)
    setTotalFlow(0)
    setTotalCost(0)
    setHighlightPath(new Set())
    setHighlightEdges(new Set())
    setDescription('已重置，点击"运行算法"开始演示')
  }, [clearTimer])

  const nodeMap = new Map<string, Node>()
  for (const node of network.nodes) {
    nodeMap.set(node.id, node)
  }

  function getEdgePath(fromNode: Node, toNode: Node, offset: number = 0): string {
    const dx = toNode.x - fromNode.x
    const dy = toNode.y - fromNode.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const nx = -dy / dist
    const ny = dx / dist

    const sx = fromNode.x + (dx / dist) * NODE_RADIUS + nx * offset
    const sy = fromNode.y + (dy / dist) * NODE_RADIUS + ny * offset
    const ex = toNode.x - (dx / dist) * NODE_RADIUS + nx * offset
    const ey = toNode.y - (dy / dist) * NODE_RADIUS + ny * offset

    if (offset !== 0) {
      const mx = (sx + ex) / 2 + nx * offset * 1.5
      const my = (sy + ey) / 2 + ny * offset * 1.5
      return `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`
    }
    return `M ${sx} ${sy} L ${ex} ${ey}`
  }

  function getEdgeOffset(from: string, to: string): number {
    const hasReverse = network.edges.some(e => e.from === to && e.to === from)
    if (hasReverse) {
      return from < to ? 12 : -12
    }
    return 0
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleRun} disabled={isPlaying}>
          运行算法
        </button>
        <button className="btn btn-secondary" onClick={handleTogglePlay} disabled={steps.length === 0}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
          速度:
        </span>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={2200 - speed}
          onChange={e => setSpeed(2200 - parseInt(e.target.value))}
          title={`速度: ${speed}ms`}
        />
      </div>

      <div className="viz-canvas" style={{ padding: '0.5rem', overflow: 'auto' }}>
        <svg width="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ display: 'block' }}>
          <defs>
            <marker id="mcmf-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" opacity="0.7" />
            </marker>
            <marker id="mcmf-arrow-highlight" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
            </marker>
            <filter id="mcmf-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {network.edges.map((edge, i) => {
            const fromNode = nodeMap.get(edge.from)
            const toNode = nodeMap.get(edge.to)
            if (!fromNode || !toNode) return null

            const edgeKey = `${edge.from}->${edge.to}`
            const isHighlighted = highlightEdges.has(edgeKey)
            const offset = getEdgeOffset(edge.from, edge.to)
            const pathD = getEdgePath(fromNode, toNode, offset)

            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const nx = -dy / dist
            const ny = dx / dist
            const mx = (fromNode.x + toNode.x) / 2 + nx * (offset * 2.2)
            const my = (fromNode.y + toNode.y) / 2 + ny * (offset * 2.2)

            return (
              <g key={`edge-${i}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHighlighted ? '#f59e0b' : 'var(--border)'}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  markerEnd={isHighlighted ? 'url(#mcmf-arrow-highlight)' : 'url(#mcmf-arrow)'}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Capacity/Cost label */}
                <g transform={`translate(${mx}, ${my - 6})`}>
                  <rect
                    x={-22}
                    y={-10}
                    width={44}
                    height={16}
                    rx={3}
                    fill={isHighlighted ? '#1e293b' : 'var(--bg-card)'}
                    stroke={isHighlighted ? '#f59e0b' : 'var(--border)'}
                    strokeWidth={0.8}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isHighlighted ? '#fbbf24' : 'var(--text-secondary)'}
                    fontSize="9.5"
                    fontFamily="Consolas, Monaco, monospace"
                    fontWeight={isHighlighted ? '700' : '400'}
                  >
                    {edge.capacity},{edge.cost}
                  </text>
                </g>
                {/* Flow label */}
                {edge.flow > 0 && (
                  <g transform={`translate(${mx}, ${my + 10})`}>
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#10b981"
                      fontSize="9"
                      fontFamily="Consolas, Monaco, monospace"
                      fontWeight="600"
                    >
                      f={edge.flow}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {network.nodes.map(node => {
            const isSource = node.id === 's'
            const isSink = node.id === 't'
            const isInPath = highlightPath.has(node.id)

            let fillColor = 'var(--bg-card)'
            let strokeColor = 'var(--border)'
            let textColor = 'var(--text-primary)'
            let extraFilter = ''

            if (isSource) {
              fillColor = '#065f46'
              strokeColor = '#10b981'
              textColor = '#d1fae5'
            } else if (isSink) {
              fillColor = '#7f1d1d'
              strokeColor = '#ef4444'
              textColor = '#fecaca'
            }

            if (isInPath) {
              fillColor = isSource ? '#059669' : isSink ? '#dc2626' : '#1e40af'
              strokeColor = '#f59e0b'
              textColor = '#ffffff'
              extraFilter = 'url(#mcmf-glow)'
            }

            return (
              <g key={node.id} filter={extraFilter}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isInPath ? 3 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textColor}
                  fontSize="16"
                  fontWeight="700"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ transition: 'fill 0.3s ease' }}
                >
                  {node.label}
                </text>
              </g>
            )
          })}

          {/* Flow and Cost display */}
          <g transform={`translate(${SVG_WIDTH / 2 - 80}, ${SVG_HEIGHT - 20})`}>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize="13"
              fontWeight="700"
              fontFamily="Consolas, Monaco, monospace"
            >
              流量: {totalFlow}
            </text>
          </g>
          <g transform={`translate(${SVG_WIDTH / 2 + 80}, ${SVG_HEIGHT - 20})`}>
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="#f59e0b"
              fontSize="13"
              fontWeight="700"
              fontFamily="Consolas, Monaco, monospace"
            >
              费用: {totalCost}
            </text>
          </g>

          {/* Legend */}
          <g transform="translate(15, 15)">
            <circle cx={0} cy={0} r={7} fill="#065f46" stroke="#10b981" strokeWidth={1.5} />
            <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">源点</text>
            <circle cx={50} cy={0} r={7} fill="#7f1d1d" stroke="#ef4444" strokeWidth={1.5} />
            <text x={62} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">汇点</text>
            <circle cx={100} cy={0} r={7} fill="#1e40af" stroke="#f59e0b" strokeWidth={2} />
            <text x={112} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">最短路径</text>
          </g>

          {/* Step counter */}
          {steps.length > 0 && (
            <g transform={`translate(${SVG_WIDTH - 15}, 15)`}>
              <text
                textAnchor="end"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize="11"
              >
                {currentStep >= 0 ? `步骤 ${currentStep + 1} / ${steps.length}` : `共 ${steps.length} 步`}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="viz-info">
        {description}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>网络信息</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>节点: s, A, B, C, t</div>
            <div>边数: {network.edges.length} 条</div>
            <div>当前流量: {totalFlow}</div>
            <div>当前总费用: {totalCost}</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>算法说明</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>算法: 连续最短路径 (SPFA)</div>
            <div>边标注: 容量,费用</div>
            <div>绿色数字 = 当前流量</div>
            <div>高亮边 = 当前增广路径</div>
          </div>
        </div>
      </div>
    </div>
  )
}
