import { useState, useEffect, useRef, useCallback } from 'react'

interface Edge {
  from: number
  to: number
  weight: number
}

interface DagNode {
  id: number
  label: string
  x: number
  y: number
}

interface StepState {
  description: string
  currentNode: number | null
  relaxingEdge: [number, number] | null
  dist: number[]
  prev: (number | null)[]
  processed: Set<number>
  topoOrder: number[]
  topoIndex: number
}

const NODES: DagNode[] = [
  { id: 0, label: 'A', x: 80, y: 100 },
  { id: 1, label: 'B', x: 240, y: 50 },
  { id: 2, label: 'C', x: 240, y: 180 },
  { id: 3, label: 'D', x: 420, y: 50 },
  { id: 4, label: 'E', x: 420, y: 180 },
  { id: 5, label: 'F', x: 580, y: 120 },
]

const EDGES: Edge[] = [
  { from: 0, to: 1, weight: 5 },
  { from: 0, to: 2, weight: 3 },
  { from: 1, to: 2, weight: 2 },
  { from: 1, to: 3, weight: 6 },
  { from: 2, to: 3, weight: 7 },
  { from: 2, to: 4, weight: 4 },
  { from: 2, to: 5, weight: 2 },
  { from: 3, to: 4, weight: -1 },
  { from: 3, to: 5, weight: 1 },
  { from: 4, to: 5, weight: -2 },
]

const TOPO_ORDER = [0, 1, 2, 3, 4, 5]

function buildGraph(): Map<number, Edge[]> {
  const graph = new Map<number, Edge[]>()
  for (const node of NODES) graph.set(node.id, [])
  for (const edge of EDGES) graph.get(edge.from)!.push(edge)
  return graph
}

export default function DagShortestPathVisualization() {
  const [steps, setSteps] = useState<StepState[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [source, setSource] = useState(0)
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((src: number): StepState[] => {
    const graph = buildGraph()
    const n = NODES.length
    const allSteps: StepState[] = []

    const dist = new Array(n).fill(Infinity)
    const prev: (number | null)[] = new Array(n).fill(null)
    const processed = new Set<number>()
    dist[src] = 0

    allSteps.push({
      description: `初始化：设置源点 ${NODES[src].label} 的距离为 0，其余为 ∞`,
      currentNode: src,
      relaxingEdge: null,
      dist: [...dist],
      prev: [...prev],
      processed: new Set(processed),
      topoOrder: TOPO_ORDER,
      topoIndex: -1,
    })

    for (let ti = 0; ti < TOPO_ORDER.length; ti++) {
      const u = TOPO_ORDER[ti]
      processed.add(u)

      if (dist[u] === Infinity) {
        allSteps.push({
          description: `节点 ${NODES[u].label} 不可达，跳过`,
          currentNode: u,
          relaxingEdge: null,
          dist: [...dist],
          prev: [...prev],
          processed: new Set(processed),
          topoOrder: TOPO_ORDER,
          topoIndex: ti,
        })
        continue
      }

      allSteps.push({
        description: `处理节点 ${NODES[u].label}（距离: ${dist[u]}），检查出边`,
        currentNode: u,
        relaxingEdge: null,
        dist: [...dist],
        prev: [...prev],
        processed: new Set(processed),
        topoOrder: TOPO_ORDER,
        topoIndex: ti,
      })

      for (const edge of graph.get(u) || []) {
        const v = edge.to
        const newDist = dist[u] + edge.weight

        if (newDist < dist[v]) {
          const oldDist = dist[v] === Infinity ? '∞' : String(dist[v])
          dist[v] = newDist
          prev[v] = u

          allSteps.push({
            description: `松弛边 ${NODES[u].label}→${NODES[v].label}（权${edge.weight}）：距离 ${oldDist} → ${newDist}`,
            currentNode: u,
            relaxingEdge: [u, v],
            dist: [...dist],
            prev: [...prev],
            processed: new Set(processed),
            topoOrder: TOPO_ORDER,
            topoIndex: ti,
          })
        } else {
          allSteps.push({
            description: `边 ${NODES[u].label}→${NODES[v].label}（权${edge.weight}）：无需更新（当前${dist[v]}，经${newDist}）`,
            currentNode: u,
            relaxingEdge: [u, v],
            dist: [...dist],
            prev: [...prev],
            processed: new Set(processed),
            topoOrder: TOPO_ORDER,
            topoIndex: ti,
          })
        }
      }
    }

    allSteps.push({
      description: '算法完成！所有最短路径已计算。',
      currentNode: null,
      relaxingEdge: null,
      dist: [...dist],
      prev: [...prev],
      processed: new Set(processed),
      topoOrder: TOPO_ORDER,
      topoIndex: TOPO_ORDER.length,
    })

    return allSteps
  }, [])

  const handleRun = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const newSteps = generateSteps(source)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [source, generateSteps])

  const handleStep = useCallback(() => {
    if (steps.length === 0) {
      const newSteps = generateSteps(source)
      setSteps(newSteps)
      setCurrentStep(0)
      setIsPlaying(false)
      return
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
    setIsPlaying(false)
  }, [steps, currentStep, source, generateSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (steps.length > 0 && currentStep < steps.length - 1) {
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
  }

  const step = steps[currentStep]

  const getNodeColor = (nodeId: number): string => {
    if (!step) return 'var(--bg-card)'
    if (step.currentNode === nodeId) return '#3b82f6'
    if (step.processed.has(nodeId)) return '#22c55e'
    return 'var(--bg-card)'
  }

  const getNodeBorder = (nodeId: number): string => {
    if (!step) return 'var(--border)'
    if (step.currentNode === nodeId) return '#60a5fa'
    if (step.processed.has(nodeId)) return '#4ade80'
    return 'var(--border)'
  }

  const isEdgeRelaxing = (from: number, to: number): boolean => {
    if (!step || !step.relaxingEdge) return false
    return step.relaxingEdge[0] === from && step.relaxingEdge[1] === to
  }

  const isEdgeInPath = (from: number, to: number): boolean => {
    if (!step) return false
    return step.prev[to] === from
  }

  const getEdgeColor = (from: number, to: number): string => {
    if (isEdgeRelaxing(from, to)) return '#f59e0b'
    if (isEdgeInPath(from, to)) return '#22c55e'
    return 'var(--text-secondary)'
  }

  const getEdgeWidth = (from: number, to: number): number => {
    if (isEdgeRelaxing(from, to)) return 3.5
    if (isEdgeInPath(from, to)) return 2.5
    return 1.5
  }

  const getEdgeMarker = (from: number, to: number): string => {
    if (isEdgeRelaxing(from, to)) return 'url(#arrow-amber)'
    if (isEdgeInPath(from, to)) return 'url(#arrow-green)'
    return 'url(#arrow-default)'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleRun}>
          运行算法
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={steps.length > 0 && currentStep >= steps.length - 1}>
          单步执行
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          源点:
          <select
            value={source}
            onChange={e => { setSource(Number(e.target.value)); handleReset() }}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {NODES.map(n => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="200"
            max="2000"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={680} height={280}>
          <defs>
            <marker id="arrow-default" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
            <marker id="arrow-amber" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
            </marker>
            <marker id="arrow-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map((edge, idx) => {
            const fromNode = NODES[edge.from]
            const toNode = NODES[edge.to]
            const r = 24
            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const len = Math.sqrt(dx * dx + dy * dy)
            const ux = dx / len
            const uy = dy / len
            const x1 = fromNode.x + ux * r
            const y1 = fromNode.y + uy * r
            const x2 = toNode.x - ux * (r + 8)
            const y2 = toNode.y - uy * (r + 8)
            const mx = (x1 + x2) / 2
            const my = (y1 + y2) / 2
            const offset = edge.weight < 0 ? 14 : -14

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={getEdgeColor(edge.from, edge.to)}
                  strokeWidth={getEdgeWidth(edge.from, edge.to)}
                  markerEnd={getEdgeMarker(edge.from, edge.to)}
                />
                <text
                  x={mx + (-uy) * offset}
                  y={my + ux * offset}
                  fill={isEdgeRelaxing(edge.from, edge.to) ? '#f59e0b' : 'var(--text-secondary)'}
                  fontSize="12"
                  fontWeight={isEdgeRelaxing(edge.from, edge.to) ? 'bold' : 'normal'}
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {edge.weight}
                </text>
              </g>
            )
          })}

          {/* Nodes */}
          {NODES.map(node => {
            const nodeColor = getNodeColor(node.id)
            const borderColor = getNodeBorder(node.id)
            const isCurrent = step?.currentNode === node.id
            return (
              <g key={node.id}>
                <circle
                  cx={node.x} cy={node.y} r={24}
                  fill={nodeColor}
                  stroke={borderColor}
                  strokeWidth={isCurrent ? 3 : 1.5}
                />
                <text
                  x={node.x} y={node.y + 5}
                  fill="var(--text-primary)"
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.label}
                </text>
                {/* Distance label */}
                {step && (
                  <text
                    x={node.x} y={node.y - 32}
                    fill={step.dist[node.id] === Infinity ? 'var(--text-secondary)' : '#f59e0b'}
                    fontSize="13"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    d={step.dist[node.id] === Infinity ? '∞' : step.dist[node.id]}
                  </text>
                )}
              </g>
            )
          })}

          {/* Topological order bar */}
          {step && (
            <g>
              <text x={10} y={260} fill="var(--text-secondary)" fontSize="12" fontFamily="Consolas, Monaco, monospace">
                拓扑序:
              </text>
              {TOPO_ORDER.map((nodeId, idx) => (
                <g key={`topo-${idx}`}>
                  <rect
                    x={70 + idx * 48} y={246}
                    width={40} height={20} rx={4}
                    fill={idx <= step.topoIndex ? '#22c55e' : 'var(--bg-card)'}
                    stroke={idx === step.topoIndex ? '#f59e0b' : 'var(--border)'}
                    strokeWidth={idx === step.topoIndex ? 2 : 1}
                  />
                  <text
                    x={90 + idx * 48} y={260}
                    fill={idx <= step.topoIndex ? '#fff' : 'var(--text-secondary)'}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {NODES[nodeId].label}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>

      <div className="viz-info">
        <strong>当前状态：</strong> {step ? step.description : '点击「运行算法」或「单步执行」开始演示'}
      </div>

      {step && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>距离表：</strong>
          {NODES.map(n => (
            <span key={n.id} style={{ marginLeft: '1rem' }}>
              {n.label}={step.dist[n.id] === Infinity ? '∞' : step.dist[n.id]}
            </span>
          ))}
        </div>
      )}

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
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在松弛
        </span>
      </div>
    </div>
  )
}
