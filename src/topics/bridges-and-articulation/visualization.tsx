import { useState, useEffect, useRef, useCallback } from 'react'

interface VisNode {
  id: number
  label: string
  x: number
  y: number
}

interface VisEdge {
  from: number
  to: number
}

interface DfsStep {
  description: string
  currentNode: number | null
  visited: Set<number>
  disc: Map<number, number>
  low: Map<number, number>
  bridges: Set<string>
  articulationPoints: Set<number>
  treeEdges: Set<string>
  backEdges: Set<string>
  phase: 'disc' | 'low-update' | 'bridge-check' | 'result'
}

const GRAPH_NODES: VisNode[] = [
  { id: 0, label: '0', x: 100, y: 80 },
  { id: 1, label: '1', x: 250, y: 50 },
  { id: 2, label: '2', x: 400, y: 80 },
  { id: 3, label: '3', x: 100, y: 200 },
  { id: 4, label: '4', x: 250, y: 230 },
  { id: 5, label: '5', x: 400, y: 200 },
  { id: 6, label: '6', x: 250, y: 340 },
]

const GRAPH_EDGES: VisEdge[] = [
  { from: 0, to: 1 },
  { from: 0, to: 3 },
  { from: 1, to: 2 },
  { from: 2, to: 5 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 4, to: 6 },
]

function edgeKey(a: number, b: number): string {
  return `${Math.min(a, b)}-${Math.max(a, b)}`
}

function generateDfsSteps(nodes: VisNode[], edges: VisEdge[]): DfsStep[] {
  const steps: DfsStep[] = []
  const adj = new Map<number, number[]>()
  for (const n of nodes) adj.set(n.id, [])
  for (const e of edges) {
    adj.get(e.from)!.push(e.to)
    adj.get(e.to)!.push(e.from)
  }

  const disc = new Map<number, number>()
  const low = new Map<number, number>()
  const visited = new Set<number>()
  const parent = new Map<number, number>()
  const treeEdges = new Set<string>()
  const backEdges = new Set<string>()
  const bridges = new Set<string>()
  const isArticulation = new Set<number>()
  const childCount = new Map<number, number>()
  let time = 0

  // Track return values for low updates
  function addStep(description: string, currentNode: number | null, phase: DfsStep['phase']) {
    steps.push({
      description,
      currentNode,
      visited: new Set(visited),
      disc: new Map(disc),
      low: new Map(low),
      bridges: new Set(bridges),
      articulationPoints: new Set(isArticulation),
      treeEdges: new Set(treeEdges),
      backEdges: new Set(backEdges),
      phase,
    })
  }

  function dfs(u: number): void {
    visited.add(u)
    disc.set(u, time)
    low.set(u, time)
    time++
    addStep(`访问节点 ${u}，设置 disc[${u}] = ${disc.get(u)}，low[${u}] = ${low.get(u)}`, u, 'disc')

    let cc = 0
    for (const v of adj.get(u)!) {
      if (!visited.has(v)) {
        cc++
        parent.set(v, u)
        treeEdges.add(edgeKey(u, v))
        addStep(`树边: ${u} -> ${v}，继续 DFS`, u, 'disc')

        dfs(v)

        // Update low[u] from child v
        const childLow = low.get(v)!
        if (childLow < low.get(u)!) {
          low.set(u, childLow)
          addStep(`回溯: 更新 low[${u}] = min(low[${u}], low[${v}]) = ${low.get(u)}`, u, 'low-update')
        }

        // Check bridge
        if (low.get(v)! > disc.get(u)!) {
          bridges.add(edgeKey(u, v))
          addStep(`发现桥: (${u}, ${v})，因为 low[${v}] = ${low.get(v)} > disc[${u}] = ${disc.get(u)}`, u, 'bridge-check')
        }

        // Check articulation (non-root)
        if (parent.get(u) !== undefined && low.get(v)! >= disc.get(u)!) {
          if (!isArticulation.has(u)) {
            isArticulation.add(u)
            addStep(`发现割点: ${u}，因为 low[${v}] = ${low.get(v)} >= disc[${u}] = ${disc.get(u)}`, u, 'bridge-check')
          }
        }
      } else if (v !== parent.get(u)) {
        // Back edge
        backEdges.add(edgeKey(u, v))
        if (disc.get(v)! < low.get(u)!) {
          low.set(u, disc.get(v)!)
          addStep(`反向边: ${u} -> ${v}，更新 low[${u}] = min(low[${u}], disc[${v}]) = ${low.get(u)}`, u, 'low-update')
        }
      }
    }

    childCount.set(u, cc)

    // Root articulation check
    if (parent.get(u) === undefined && cc >= 2) {
      if (!isArticulation.has(u)) {
        isArticulation.add(u)
        addStep(`根节点 ${u} 有 ${cc} 个子节点，是割点`, u, 'bridge-check')
      }
    }
  }

  // Start DFS from node 0
  addStep('开始从节点 0 进行 DFS 遍历', null, 'disc')
  dfs(0)

  // Final result step
  const bridgeList = [...bridges].join(', ')
  const artList = [...isArticulation].sort((a, b) => a - b).join(', ')
  addStep(
    `遍历完成！桥: {${bridgeList || '无'}}，割点: {${artList || '无'}}`,
    null,
    'result'
  )

  return steps
}

export default function BridgesVisualization() {
  const [steps] = useState<DfsStep[]>(() => generateDfsSteps(GRAPH_NODES, GRAPH_EDGES))
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const timerRef = useRef<number | null>(null)

  const step = steps[currentStep] || steps[steps.length - 1]

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

  const handleStepBackward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    setCurrentStep(0)
  }, [])

  const getNodeColor = (id: number): string => {
    if (step.articulationPoints.has(id)) return '#f59e0b'
    if (step.currentNode === id) return '#3b82f6'
    if (step.visited.has(id)) return '#22c55e'
    return 'var(--bg-card)'
  }

  const getNodeBorder = (id: number): string => {
    if (step.articulationPoints.has(id)) return '#f59e0b'
    if (step.currentNode === id) return '#60a5fa'
    if (step.visited.has(id)) return '#4ade80'
    return 'var(--border)'
  }

  const getEdgeColor = (from: number, to: number): string => {
    const key = edgeKey(from, to)
    if (step.bridges.has(key)) return '#ef4444'
    if (step.treeEdges.has(key)) return '#22c55e'
    if (step.backEdges.has(key)) return '#8b5cf6'
    return 'var(--border)'
  }

  const getEdgeWidth = (from: number, to: number): number => {
    const key = edgeKey(from, to)
    if (step.bridges.has(key)) return 4
    if (step.treeEdges.has(key) || step.backEdges.has(key)) return 2.5
    return 1.5
  }

  const getEdgeDash = (from: number, to: number): string => {
    const key = edgeKey(from, to)
    if (step.backEdges.has(key)) return '6,4'
    return ''
  }

  const svgWidth = 500
  const svgHeight = 420

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying && currentStep < steps.length - 1}>
          {currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={handlePause} disabled={!isPlaying}>
          暂停
        </button>
        <button className="btn btn-secondary" onClick={handleStepBackward} disabled={currentStep === 0}>
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
            min="200"
            max="3000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <defs>
            <marker id="arrowhead-bridge" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
          </defs>

          {/* Edges */}
          {GRAPH_EDGES.map((edge) => {
            const fromNode = GRAPH_NODES[edge.from]
            const toNode = GRAPH_NODES[edge.to]
            const color = getEdgeColor(edge.from, edge.to)
            const width = getEdgeWidth(edge.from, edge.to)
            const dash = getEdgeDash(edge.from, edge.to)
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={color}
                  strokeWidth={width}
                  strokeDasharray={dash}
                />
                {/* Edge label for bridge */}
                {step.bridges.has(edgeKey(edge.from, edge.to)) && (
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 8}
                    fill="#ef4444"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    桥
                  </text>
                )}
              </g>
            )
          })}

          {/* Nodes */}
          {GRAPH_NODES.map((node) => {
            const nodeRadius = 22
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill={getNodeColor(node.id)}
                  stroke={getNodeBorder(node.id)}
                  strokeWidth={step.currentNode === node.id || step.articulationPoints.has(node.id) ? 3 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  fill="var(--text-primary)"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.label}
                </text>

                {/* disc/low labels */}
                {step.disc.has(node.id) && (
                  <text
                    x={node.x}
                    y={node.y - 30}
                    fill="var(--text-secondary)"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    d={step.disc.get(node.id)}/l={step.low.get(node.id)}
                  </text>
                )}

                {/* Articulation point marker */}
                {step.articulationPoints.has(node.id) && (
                  <text
                    x={node.x + 28}
                    y={node.y - 12}
                    fill="#f59e0b"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    割点
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="viz-info">
        <strong>步骤 {currentStep + 1}/{steps.length}：</strong> {step.description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已访问/树边
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          反向边
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          桥
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          割点
        </span>
      </div>
    </div>
  )
}
