import { useState, useEffect, useRef, useCallback } from 'react'

interface GraphNode {
  id: number
  label: string
  x: number
  y: number
}

interface GraphEdge {
  from: number
  to: number
}

interface AnimationStep {
  description: string
  currentNode: number | null
  queue: number[]
  visited: Set<number>
  dist: number[]
  highlightEdge: { from: number; to: number } | null
  phase: 'init' | 'dequeue' | 'enqueue' | 'done'
}

const NODES: GraphNode[] = [
  { id: 0, label: 'A', x: 80, y: 150 },
  { id: 1, label: 'B', x: 200, y: 60 },
  { id: 2, label: 'C', x: 200, y: 240 },
  { id: 3, label: 'D', x: 350, y: 40 },
  { id: 4, label: 'E', x: 350, y: 150 },
  { id: 5, label: 'F', x: 350, y: 260 },
  { id: 6, label: 'G', x: 500, y: 100 },
  { id: 7, label: 'H', x: 500, y: 220 },
]

const EDGES: GraphEdge[] = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 1, to: 4 },
  { from: 2, to: 4 },
  { from: 2, to: 5 },
  { from: 3, to: 6 },
  { from: 4, to: 6 },
  { from: 4, to: 7 },
  { from: 5, to: 7 },
]

const SOURCE = 0
const NODE_RADIUS = 22

export default function BFSVisualization() {
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [description, setDescription] = useState('BFS 广度优先搜索可视化 - 点击「开始」运行算法')
  const [currentNode, setCurrentNode] = useState<number | null>(null)
  const [queue, setQueue] = useState<number[]>([])
  const [visited, setVisited] = useState<Set<number>>(new Set())
  const [dist, setDist] = useState<number[]>(new Array(NODES.length).fill(-1))
  const [highlightEdge, setHighlightEdge] = useState<{ from: number; to: number } | null>(null)
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((): AnimationStep[] => {
    const n = NODES.length
    const adj: number[][] = Array.from({ length: n }, () => [])
    for (const edge of EDGES) {
      adj[edge.from].push(edge.to)
      adj[edge.to].push(edge.from)
    }

    const visitedSet = new Set<number>()
    const distArr = new Array(n).fill(-1)
    const queueArr: number[] = [SOURCE]
    visitedSet.add(SOURCE)
    distArr[SOURCE] = 0

    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `初始化：将源点 ${NODES[SOURCE].label} 加入队列，标记为已访问`,
      currentNode: SOURCE,
      queue: [...queueArr],
      visited: new Set(visitedSet),
      dist: [...distArr],
      highlightEdge: null,
      phase: 'init',
    })

    while (queueArr.length > 0) {
      const u = queueArr.shift()!
      const unvisitedNeighbors = adj[u].filter(v => !visitedSet.has(v))

      animationSteps.push({
        description: `从队头取出节点 ${NODES[u].label}（层级 ${distArr[u]}），未访问邻居: ${unvisitedNeighbors.map(v => NODES[v].label).join(', ') || '无'}`,
        currentNode: u,
        queue: [...queueArr],
        visited: new Set(visitedSet),
        dist: [...distArr],
        highlightEdge: null,
        phase: 'dequeue',
      })

      for (const v of adj[u]) {
        if (!visitedSet.has(v)) {
          visitedSet.add(v)
          distArr[v] = distArr[u] + 1
          queueArr.push(v)

          animationSteps.push({
            description: `探索边 ${NODES[u].label} -> ${NODES[v].label}，${NODES[v].label} 加入队尾，层级 = ${distArr[v]}`,
            currentNode: u,
            queue: [...queueArr],
            visited: new Set(visitedSet),
            dist: [...distArr],
            highlightEdge: { from: u, to: v },
            phase: 'enqueue',
          })
        }
      }
    }

    animationSteps.push({
      description: `算法完成！所有 ${visitedSet.size} 个可达节点已遍历`,
      currentNode: null,
      queue: [],
      visited: new Set(visitedSet),
      dist: [...distArr],
      highlightEdge: null,
      phase: 'done',
    })

    return animationSteps
  }, [])

  const applyStep = useCallback((step: AnimationStep) => {
    setDescription(step.description)
    setCurrentNode(step.currentNode)
    setQueue([...step.queue])
    setVisited(new Set(step.visited))
    setDist([...step.dist])
    setHighlightEdge(step.highlightEdge)
  }, [])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const allSteps = generateSteps()
    setSteps(allSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    if (allSteps.length > 0) {
      applyStep(allSteps[0])
    }
  }

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      const nextStep = currentStep + 1
      applyStep(steps[nextStep])
      setCurrentStep(nextStep)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed, applyStep])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (steps.length > 0 && currentStep < steps.length - 1) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (steps.length === 0) return
    setIsPlaying(false)
    const nextStep = Math.min(currentStep + 1, steps.length - 1)
    applyStep(steps[nextStep])
    setCurrentStep(nextStep)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setDescription('BFS 广度优先搜索可视化 - 点击「开始」运行算法')
    setCurrentNode(null)
    setQueue([])
    setVisited(new Set())
    setDist(new Array(NODES.length).fill(-1))
    setHighlightEdge(null)
  }

  const getNodeColor = (nodeId: number): string => {
    if (nodeId === currentNode) return '#3b82f6'
    if (visited.has(nodeId)) return '#22c55e'
    return 'var(--bg-card)'
  }

  const getNodeBorder = (nodeId: number): string => {
    if (nodeId === currentNode) return '#60a5fa'
    if (visited.has(nodeId)) return '#4ade80'
    return 'var(--border)'
  }

  const getEdgeColor = (edge: GraphEdge): string => {
    if (highlightEdge) {
      const isHL =
        (highlightEdge.from === edge.from && highlightEdge.to === edge.to) ||
        (highlightEdge.from === edge.to && highlightEdge.to === edge.from)
      if (isHL) return '#f59e0b'
    }
    if (visited.has(edge.from) && visited.has(edge.to)) return '#4ade80'
    return 'var(--text-secondary)'
  }

  const getEdgeWidth = (edge: GraphEdge): number => {
    if (highlightEdge) {
      const isHL =
        (highlightEdge.from === edge.from && highlightEdge.to === edge.to) ||
        (highlightEdge.from === edge.to && highlightEdge.to === edge.from)
      if (isHL) return 3
    }
    return 2
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={isPlaying || steps.length === 0}>
          单步
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="300"
            max="2500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={600} height={320}>
          <defs>
            <marker id="arrowhead-bfs" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
            <marker id="arrowhead-bfs-hl" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
            </marker>
            <marker id="arrowhead-bfs-visited" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#4ade80" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map((edge, i) => {
            const fromNode = NODES[edge.from]
            const toNode = NODES[edge.to]
            const color = getEdgeColor(edge)
            const width = getEdgeWidth(edge)
            const isHighlighted = highlightEdge !== null && (
              (highlightEdge.from === edge.from && highlightEdge.to === edge.to) ||
              (highlightEdge.from === edge.to && highlightEdge.to === edge.from)
            )

            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const len = Math.sqrt(dx * dx + dy * dy)
            const offset = NODE_RADIUS
            const x1 = fromNode.x + (dx / len) * offset
            const y1 = fromNode.y + (dy / len) * offset
            const x2 = toNode.x - (dx / len) * offset
            const y2 = toNode.y - (dy / len) * offset

            let markerId = 'url(#arrowhead-bfs)'
            if (isHighlighted) markerId = 'url(#arrowhead-bfs-hl)'
            else if (visited.has(edge.from) && visited.has(edge.to)) markerId = 'url(#arrowhead-bfs-visited)'

            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={color}
                strokeWidth={width}
                markerEnd={markerId}
              />
            )
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const isCurrent = node.id === currentNode
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={getNodeColor(node.id)}
                  stroke={getNodeBorder(node.id)}
                  strokeWidth={isCurrent ? 3 : 2}
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
                {dist[node.id] >= 0 && (
                  <text
                    x={node.x}
                    y={node.y + NODE_RADIUS + 14}
                    fill="var(--text-secondary)"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    L{dist[node.id]}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Queue visualization */}
      <div style={{
        margin: '1rem 0',
        padding: '0.75rem 1rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
          队列状态（左 = 队头，右 = 队尾）：
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minHeight: 36 }}>
          {queue.length === 0 ? (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>空</span>
          ) : (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>队头</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{'>>>'}</span>
              {queue.map((nodeId, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: '#1e3a5f',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                  }}
                >
                  {NODES[nodeId].label}
                </span>
              ))}
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{'<<<'}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>队尾</span>
            </>
          )}
        </div>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前处理
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已访问
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前探索边
        </span>
      </div>

      {/* Distance table */}
      {steps.length > 0 && (
        <div style={{
          margin: '1rem 0',
          padding: '0.75rem 1rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            各节点层级（距源点 {NODES[SOURCE].label} 的最短边数）：
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {NODES.map((node) => (
              <span
                key={node.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.85rem',
                  color: dist[node.id] >= 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'Consolas, Monaco, monospace',
                }}
              >
                {node.label}:
                <span style={{ fontWeight: 'bold' }}>
                  {dist[node.id] >= 0 ? dist[node.id] : '-'}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
