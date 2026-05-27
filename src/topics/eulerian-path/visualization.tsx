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

interface HierholzerStep {
  type: 'visit' | 'backtrack' | 'done'
  current: number
  from: number
  path: number[]
  stack: number[]
  visitedEdges: Set<string>
  description: string
}

function edgeKey(u: number, v: number): string {
  return `${Math.min(u, v)}-${Math.max(u, v)}`
}

// 示例图 1：欧拉回路图 (6顶点，7边)
function buildEulerCircuitGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    { id: 0, x: 150, y: 80, label: '0' },
    { id: 1, x: 350, y: 80, label: '1' },
    { id: 2, x: 550, y: 80, label: '2' },
    { id: 3, x: 150, y: 280, label: '3' },
    { id: 4, x: 350, y: 280, label: '4' },
    { id: 5, x: 550, y: 280, label: '5' },
  ]
  const edges: GraphEdge[] = [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 5 },
    { from: 5, to: 4 }, { from: 4, to: 3 }, { from: 3, to: 0 },
    { from: 1, to: 4 },
  ]
  return { nodes, edges }
}

// 示例图 2：欧拉路径图 (7顶点，7边)
function buildEulerPathGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [
    { id: 0, x: 100, y: 80, label: '0' },
    { id: 1, x: 250, y: 80, label: '1' },
    { id: 2, x: 400, y: 80, label: '2' },
    { id: 3, x: 550, y: 80, label: '3' },
    { id: 4, x: 250, y: 280, label: '4' },
    { id: 5, x: 400, y: 280, label: '5' },
    { id: 6, x: 550, y: 280, label: '6' },
  ]
  const edges: GraphEdge[] = [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
    { from: 3, to: 6 }, { from: 6, to: 5 }, { from: 5, to: 4 },
    { from: 4, to: 1 },
  ]
  return { nodes, edges }
}

function getDegrees(nodes: GraphNode[], edges: GraphEdge[]): Map<number, number> {
  const deg = new Map<number, number>()
  for (const n of nodes) deg.set(n.id, 0)
  for (const e of edges) {
    deg.set(e.from, (deg.get(e.from) || 0) + 1)
    deg.set(e.to, (deg.get(e.to) || 0) + 1)
  }
  return deg
}

function findOddDegreeVertices(nodes: GraphNode[], edges: GraphEdge[]): number[] {
  const deg = getDegrees(nodes, edges)
  const odds: number[] = []
  for (const [v, d] of deg) {
    if (d % 2 !== 0) odds.push(v)
  }
  return odds
}

function computeHierholzerSteps(
  nodes: GraphNode[],
  edges: GraphEdge[]
): HierholzerStep[] {
  // Build adjacency list
  const adj = new Map<number, number[]>()
  for (const n of nodes) adj.set(n.id, [])
  for (const e of edges) {
    adj.get(e.from)!.push(e.to)
    adj.get(e.to)!.push(e.from)
  }

  // Determine start vertex
  const odds = findOddDegreeVertices(nodes, edges)
  let start: number
  if (odds.length === 2) {
    start = odds[0]
  } else {
    start = nodes[0].id
  }

  const steps: HierholzerStep[] = []
  const visitedEdges = new Set<string>()
  const path: number[] = []
  const stack: number[] = [start]

  steps.push({
    type: 'visit',
    current: start,
    from: -1,
    path: [...path],
    stack: [...stack],
    visitedEdges: new Set(visitedEdges),
    description: `从顶点 ${start} 开始 DFS`,
  })

  while (stack.length > 0) {
    const v = stack[stack.length - 1]
    const neighbors = adj.get(v)!

    if (neighbors.length === 0) {
      // Backtrack
      const popped = stack.pop()!
      path.push(popped)
      steps.push({
        type: 'backtrack',
        current: popped,
        from: stack.length > 0 ? stack[stack.length - 1] : -1,
        path: [...path],
        stack: [...stack],
        visitedEdges: new Set(visitedEdges),
        description: `回溯: 顶点 ${popped} 无未访问边，加入路径`,
      })
    } else {
      // Visit edge
      const u = neighbors.pop()!
      // Remove reverse edge
      const rev = adj.get(u)!
      const idx = rev.indexOf(v)
      if (idx !== -1) rev.splice(idx, 1)

      visitedEdges.add(edgeKey(v, u))
      stack.push(u)

      steps.push({
        type: 'visit',
        current: u,
        from: v,
        path: [...path],
        stack: [...stack],
        visitedEdges: new Set(visitedEdges),
        description: `访问: ${v} → ${u}，删除边 (${v},${u})`,
      })
    }
  }

  steps.push({
    type: 'done',
    current: -1,
    from: -1,
    path: [...path],
    stack: [],
    visitedEdges: new Set(visitedEdges),
    description: `算法完成！欧拉路径: ${path.join(' → ')}`,
  })

  return steps
}

const SVG_WIDTH = 700
const SVG_HEIGHT = 380
const NODE_RADIUS = 24

export default function EulerPathVisualization() {
  const [graphType, setGraphType] = useState<'circuit' | 'path'>('circuit')
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [steps, setSteps] = useState<HierholzerStep[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [visitedEdges, setVisitedEdges] = useState<Set<string>>(new Set())
  const [highlightNode, setHighlightNode] = useState<number>(-1)
  const [currentPath, setCurrentPath] = useState<number[]>([])
  const [currentStack, setCurrentStack] = useState<number[]>([])
  const [description, setDescription] = useState('点击"运行算法"开始 Hierholzer 演示')
  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Initialize graph
  useEffect(() => {
    clearTimer()
    const g = graphType === 'circuit' ? buildEulerCircuitGraph() : buildEulerPathGraph()
    setNodes(g.nodes)
    setEdges(g.edges)
    setSteps([])
    setCurrentStep(-1)
    setIsPlaying(false)
    setVisitedEdges(new Set())
    setHighlightNode(-1)
    setCurrentPath([])
    setCurrentStack([])
    setDescription('点击"运行算法"开始 Hierholzer 演示')
  }, [graphType, clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const handleRun = useCallback(() => {
    clearTimer()
    const g = graphType === 'circuit' ? buildEulerCircuitGraph() : buildEulerPathGraph()
    const allSteps = computeHierholzerSteps(g.nodes, g.edges)
    setNodes(g.nodes)
    setEdges(g.edges)
    setSteps(allSteps)
    setCurrentStep(-1)
    setIsPlaying(false)
    setVisitedEdges(new Set())
    setHighlightNode(-1)
    setCurrentPath([])
    setCurrentStack([])

    // Start animation
    let idx = 0
    const step = allSteps[idx]
    setHighlightNode(step.current)
    setVisitedEdges(step.visitedEdges)
    setCurrentPath(step.path)
    setCurrentStack(step.stack)
    setCurrentStep(idx)
    setDescription(`步骤 ${idx + 1}/${allSteps.length}: ${step.description}`)

    setIsPlaying(true)
    timerRef.current = window.setInterval(() => {
      idx++
      if (idx >= allSteps.length) {
        clearTimer()
        setIsPlaying(false)
        return
      }
      const s = allSteps[idx]
      setHighlightNode(s.current)
      setVisitedEdges(s.visitedEdges)
      setCurrentPath(s.path)
      setCurrentStack(s.stack)
      setCurrentStep(idx)
      setDescription(`步骤 ${idx + 1}/${allSteps.length}: ${s.description}`)
    }, speed)
  }, [graphType, speed, clearTimer])

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
    } else if (steps.length > 0 && currentStep < steps.length - 1) {
      let idx = currentStep
      setIsPlaying(true)
      timerRef.current = window.setInterval(() => {
        idx++
        if (idx >= steps.length) {
          clearTimer()
          setIsPlaying(false)
          return
        }
        const s = steps[idx]
        setHighlightNode(s.current)
        setVisitedEdges(s.visitedEdges)
        setCurrentPath(s.path)
        setCurrentStack(s.stack)
        setCurrentStep(idx)
        setDescription(`步骤 ${idx + 1}/${steps.length}: ${s.description}`)
      }, speed)
    }
  }, [isPlaying, steps, currentStep, speed, clearTimer])

  const handleStepForward = useCallback(() => {
    if (steps.length === 0) return
    clearTimer()
    setIsPlaying(false)
    const nextIdx = Math.min(currentStep + 1, steps.length - 1)
    const s = steps[nextIdx]
    setHighlightNode(s.current)
    setVisitedEdges(s.visitedEdges)
    setCurrentPath(s.path)
    setCurrentStack(s.stack)
    setCurrentStep(nextIdx)
    setDescription(`步骤 ${nextIdx + 1}/${steps.length}: ${s.description}`)
  }, [steps, currentStep, clearTimer])

  const handleStepBackward = useCallback(() => {
    if (steps.length === 0) return
    clearTimer()
    setIsPlaying(false)
    const prevIdx = Math.max(currentStep - 1, 0)
    const s = steps[prevIdx]
    setHighlightNode(s.current)
    setVisitedEdges(s.visitedEdges)
    setCurrentPath(s.path)
    setCurrentStack(s.stack)
    setCurrentStep(prevIdx)
    setDescription(`步骤 ${prevIdx + 1}/${steps.length}: ${s.description}`)
  }, [steps, currentStep, clearTimer])

  const handleReset = useCallback(() => {
    clearTimer()
    const g = graphType === 'circuit' ? buildEulerCircuitGraph() : buildEulerPathGraph()
    setNodes(g.nodes)
    setEdges(g.edges)
    setSteps([])
    setCurrentStep(-1)
    setIsPlaying(false)
    setVisitedEdges(new Set())
    setHighlightNode(-1)
    setCurrentPath([])
    setCurrentStack([])
    setDescription('点击"运行算法"开始 Hierholzer 演示')
  }, [graphType, clearTimer])

  const degrees = getDegrees(nodes, edges)
  const oddVertices = findOddDegreeVertices(nodes, edges)

  // Node position map
  const nodePos = new Map<number, GraphNode>()
  for (const n of nodes) nodePos.set(n.id, n)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleRun} disabled={isPlaying}>
          运行算法
        </button>
        <button className="btn btn-secondary" onClick={handleTogglePlay} disabled={steps.length === 0}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleStepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <select
          value={graphType}
          onChange={e => setGraphType(e.target.value as 'circuit' | 'path')}
          style={{ marginLeft: '0.5rem', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm, 4px)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
        >
          <option value="circuit">欧拉回路图</option>
          <option value="path">欧拉路径图</option>
        </select>
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
            <filter id="ep-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodePos.get(edge.from)
            const to = nodePos.get(edge.to)
            if (!from || !to) return null

            const ek = edgeKey(edge.from, edge.to)
            const isVisited = visitedEdges.has(ek)

            const dx = to.x - from.x
            const dy = to.y - from.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const ux = dx / dist
            const uy = dy / dist

            const x1 = from.x + ux * NODE_RADIUS
            const y1 = from.y + uy * NODE_RADIUS
            const x2 = to.x - ux * NODE_RADIUS
            const y2 = to.y - uy * NODE_RADIUS

            const mx = (from.x + to.x) / 2
            const my = (from.y + to.y) / 2

            return (
              <g key={`edge-${i}`}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isVisited ? '#10b981' : 'var(--border)'}
                  strokeWidth={isVisited ? 3 : 2}
                  strokeDasharray={isVisited ? 'none' : 'none'}
                  opacity={isVisited ? 1 : 0.6}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Edge label */}
                <g transform={`translate(${mx}, ${my})`}>
                  <rect x={-12} y={-8} width={24} height={16} rx={3} fill={isVisited ? '#065f46' : 'var(--bg-card)'} stroke={isVisited ? '#10b981' : 'var(--border)'} strokeWidth={0.8} />
                  <text textAnchor="middle" dominantBaseline="central" fill={isVisited ? '#d1fae5' : 'var(--text-secondary)'} fontSize="9" fontFamily="Consolas, Monaco, monospace">
                    {ek}
                  </text>
                </g>
              </g>
            )
          })}

          {/* Current DFS path highlight */}
          {currentStack.length >= 2 && currentStack.map((v, i) => {
            if (i === 0) return null
            const from = nodePos.get(currentStack[i - 1])
            const to = nodePos.get(v)
            if (!from || !to) return null
            const dx = to.x - from.x
            const dy = to.y - from.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const ux = dx / dist
            const uy = dy / dist
            return (
              <line
                key={`dfs-${i}`}
                x1={from.x + ux * NODE_RADIUS} y1={from.y + uy * NODE_RADIUS}
                x2={to.x - ux * NODE_RADIUS} y2={to.y - uy * NODE_RADIUS}
                stroke="#f59e0b" strokeWidth={4} opacity={0.7}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const isCurrent = node.id === highlightNode
            const isInPath = currentPath.includes(node.id)
            const isInStack = currentStack.includes(node.id)
            const deg = degrees.get(node.id) || 0
            const isOdd = deg % 2 !== 0

            let fillColor = 'var(--bg-card)'
            let strokeColor = isOdd ? '#f59e0b' : 'var(--border)'
            let textColor = 'var(--text-primary)'

            if (isCurrent) {
              fillColor = '#1e40af'
              strokeColor = '#f59e0b'
              textColor = '#ffffff'
            } else if (isInPath) {
              fillColor = '#065f46'
              strokeColor = '#10b981'
              textColor = '#d1fae5'
            } else if (isInStack) {
              fillColor = '#1e3a5f'
              strokeColor = '#3b82f6'
              textColor = '#dbeafe'
            }

            return (
              <g key={node.id} filter={isCurrent ? 'url(#ep-glow)' : undefined}>
                <circle
                  cx={node.x} cy={node.y} r={NODE_RADIUS}
                  fill={fillColor} stroke={strokeColor}
                  strokeWidth={isCurrent ? 3 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text
                  x={node.x} y={node.y}
                  textAnchor="middle" dominantBaseline="central"
                  fill={textColor} fontSize="16" fontWeight="700"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.label}
                </text>
                {/* Degree label */}
                <text
                  x={node.x} y={node.y + NODE_RADIUS + 14}
                  textAnchor="middle" dominantBaseline="central"
                  fill={isOdd ? '#f59e0b' : 'var(--text-secondary)'}
                  fontSize="10" fontFamily="Consolas, Monaco, monospace"
                >
                  d={deg}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform="translate(15, 15)">
            <circle cx={0} cy={0} r={7} fill="#1e40af" stroke="#f59e0b" strokeWidth={2} />
            <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">当前顶点</text>
            <circle cx={80} cy={0} r={7} fill="#1e3a5f" stroke="#3b82f6" strokeWidth={1.5} />
            <text x={92} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">DFS栈中</text>
            <circle cx={150} cy={0} r={7} fill="#065f46" stroke="#10b981" strokeWidth={1.5} />
            <text x={162} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">已入路径</text>
            <circle cx={220} cy={0} r={7} fill="var(--bg-card)" stroke="#f59e0b" strokeWidth={1.5} />
            <text x={232} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">奇数度顶点</text>
          </g>

          {/* Step counter */}
          {steps.length > 0 && (
            <g transform={`translate(${SVG_WIDTH - 15}, 15)`}>
              <text textAnchor="end" dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">
                {currentStep >= 0 ? `步骤 ${currentStep + 1} / ${steps.length}` : `共 ${steps.length} 步`}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="viz-info">
        {description}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>图信息</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>类型: {graphType === 'circuit' ? '欧拉回路图' : '欧拉路径图'}</div>
            <div>顶点: {nodes.length}，边: {edges.length}</div>
            <div>奇数度顶点: {oddVertices.length === 0 ? '无 (欧拉回路)' : oddVertices.join(', ')}</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>算法状态</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>DFS栈: [{currentStack.join(' → ')}]</div>
            <div>已构建路径: [{currentPath.join(' → ')}]</div>
            <div>已访问边: {visitedEdges.size}/{edges.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
