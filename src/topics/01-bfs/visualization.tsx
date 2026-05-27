import { useState, useEffect, useRef, useCallback } from 'react'

interface GraphEdge {
  from: number
  to: number
  weight: 0 | 1
}

interface GraphNode {
  id: number
  label: string
  x: number
  y: number
}

interface AnimationStep {
  description: string
  currentNode: number | null
  deque: number[]
  visited: Set<number>
  dist: number[]
  highlightEdge: { from: number; to: number } | null
  insertType: 'front' | 'back' | 'none'
}

const NODES: GraphNode[] = [
  { id: 0, label: 'S', x: 80, y: 150 },
  { id: 1, label: 'A', x: 230, y: 60 },
  { id: 2, label: 'B', x: 230, y: 240 },
  { id: 3, label: 'C', x: 400, y: 60 },
  { id: 4, label: 'D', x: 400, y: 240 },
  { id: 5, label: 'T', x: 550, y: 150 },
]

const EDGES: GraphEdge[] = [
  { from: 0, to: 1, weight: 0 },
  { from: 0, to: 2, weight: 1 },
  { from: 1, to: 2, weight: 0 },
  { from: 1, to: 3, weight: 1 },
  { from: 2, to: 4, weight: 0 },
  { from: 3, to: 5, weight: 0 },
  { from: 4, to: 3, weight: 1 },
  { from: 4, to: 5, weight: 1 },
]

const SOURCE = 0

export default function ZeroOneBFSVisualization() {
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [description, setDescription] = useState<string>('0-1 BFS 可视化 - 点击「开始」运行算法')
  const [currentNode, setCurrentNode] = useState<number | null>(null)
  const [deque, setDeque] = useState<number[]>([])
  const [visited, setVisited] = useState<Set<number>>(new Set())
  const [dist, setDist] = useState<number[]>(new Array(NODES.length).fill(Infinity))
  const [highlightEdge, setHighlightEdge] = useState<{ from: number; to: number } | null>(null)
  const [insertType, setInsertType] = useState<'front' | 'back' | 'none'>('none')
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((): AnimationStep[] => {
    const n = NODES.length
    const distArr = new Array(n).fill(Infinity)
    distArr[SOURCE] = 0
    const visitedSet = new Set<number>()
    const dequeArr: number[] = [SOURCE]
    let front = 0
    const animationSteps: AnimationStep[] = []

    // Build adjacency list
    const adj: { to: number; weight: 0 | 1 }[][] = Array.from({ length: n }, () => [])
    for (const edge of EDGES) {
      adj[edge.from].push({ to: edge.to, weight: edge.weight })
    }

    animationSteps.push({
      description: `初始化：源点 ${NODES[SOURCE].label} 距离为 0，加入队头`,
      currentNode: SOURCE,
      deque: [...dequeArr],
      visited: new Set(visitedSet),
      dist: [...distArr],
      highlightEdge: null,
      insertType: 'none',
    })

    while (front < dequeArr.length) {
      const u = dequeArr[front++]
      if (visitedSet.has(u)) continue
      visitedSet.add(u)

      animationSteps.push({
        description: `从队头取出节点 ${NODES[u].label}，当前距离 = ${distArr[u]}`,
        currentNode: u,
        deque: dequeArr.slice(front),
        visited: new Set(visitedSet),
        dist: [...distArr],
        highlightEdge: null,
        insertType: 'none',
      })

      for (const { to: v, weight } of adj[u]) {
        if (distArr[u] + weight < distArr[v]) {
          distArr[v] = distArr[u] + weight

          if (weight === 0) {
            dequeArr.splice(front, 0, v)
            animationSteps.push({
              description: `${NODES[u].label} -> ${NODES[v].label}，边权 = 0，新距离 = ${distArr[v]}，插入队头（push_front）`,
              currentNode: u,
              deque: dequeArr.slice(front),
              visited: new Set(visitedSet),
              dist: [...distArr],
              highlightEdge: { from: u, to: v },
              insertType: 'front',
            })
          } else {
            dequeArr.push(v)
            animationSteps.push({
              description: `${NODES[u].label} -> ${NODES[v].label}，边权 = 1，新距离 = ${distArr[v]}，插入队尾（push_back）`,
              currentNode: u,
              deque: dequeArr.slice(front),
              visited: new Set(visitedSet),
              dist: [...distArr],
              highlightEdge: { from: u, to: v },
              insertType: 'back',
            })
          }
        }
      }
    }

    animationSteps.push({
      description: '算法完成！所有可达节点的最短距离已确定',
      currentNode: null,
      deque: [],
      visited: new Set(visitedSet),
      dist: [...distArr],
      highlightEdge: null,
      insertType: 'none',
    })

    return animationSteps
  }, [])

  const applyStep = useCallback((step: AnimationStep) => {
    setDescription(step.description)
    setCurrentNode(step.currentNode)
    setDeque([...step.deque])
    setVisited(new Set(step.visited))
    setDist([...step.dist])
    setHighlightEdge(step.highlightEdge)
    setInsertType(step.insertType)
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
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      const nextStep = currentStep + 1
      if (nextStep < steps.length) {
        applyStep(steps[nextStep])
        setCurrentStep(nextStep)
      } else {
        setIsPlaying(false)
      }
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed, applyStep])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
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
    setDescription('0-1 BFS 可视化 - 点击「开始」运行算法')
    setCurrentNode(null)
    setDeque([])
    setVisited(new Set())
    setDist(new Array(NODES.length).fill(Infinity))
    setHighlightEdge(null)
    setInsertType('none')
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
    if (highlightEdge && highlightEdge.from === edge.from && highlightEdge.to === edge.to) {
      return '#f59e0b'
    }
    if (visited.has(edge.from) && visited.has(edge.to)) {
      return '#4ade80'
    }
    return 'var(--text-secondary)'
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
        <svg width={640} height={320}>
          <defs>
            <marker id="arrowhead-01bfs" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
            <marker id="arrowhead-01bfs-highlight" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map((edge, i) => {
            const fromNode = NODES[edge.from]
            const toNode = NODES[edge.to]
            const color = getEdgeColor(edge)
            const isHighlighted = highlightEdge && highlightEdge.from === edge.from && highlightEdge.to === edge.to

            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const len = Math.sqrt(dx * dx + dy * dy)
            const offset = 25
            const x1 = fromNode.x + (dx / len) * offset
            const y1 = fromNode.y + (dy / len) * offset
            const x2 = toNode.x - (dx / len) * offset
            const y2 = toNode.y - (dy / len) * offset

            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2
            const perpX = -(y2 - y1) / len * 12
            const perpY = (x2 - x1) / len * 12

            return (
              <g key={i}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color}
                  strokeWidth={isHighlighted ? 3 : 2}
                  markerEnd={isHighlighted ? 'url(#arrowhead-01bfs-highlight)' : 'url(#arrowhead-01bfs)'}
                />
                <rect
                  x={midX + perpX - 10}
                  y={midY + perpY - 10}
                  width={20}
                  height={16}
                  rx={4}
                  fill={edge.weight === 0 ? '#065f46' : '#7c2d12'}
                  stroke={isHighlighted ? '#f59e0b' : 'var(--border)'}
                  strokeWidth={1}
                />
                <text
                  x={midX + perpX}
                  y={midY + perpY + 3}
                  fill={edge.weight === 0 ? '#6ee7b7' : '#fdba74'}
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {edge.weight}
                </text>
              </g>
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
                  r={22}
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
                {dist[node.id] !== Infinity && (
                  <text
                    x={node.x}
                    y={node.y + 38}
                    fill="var(--text-secondary)"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    d={dist[node.id]}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Deque visualization */}
      <div style={{
        margin: '1rem 0',
        padding: '0.75rem 1rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
          双端队列状态（左 = 队头，右 = 队尾）：
          {insertType === 'front' && (
            <span style={{ marginLeft: '0.5rem', color: '#f59e0b' }}>
              -- 从队头插入
            </span>
          )}
          {insertType === 'back' && (
            <span style={{ marginLeft: '0.5rem', color: '#f59e0b' }}>
              -- 从队尾插入
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', minHeight: 36 }}>
          {deque.length === 0 ? (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>空</span>
          ) : (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>队头</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{'>>>'}</span>
              {deque.map((nodeId, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: idx === 0 && insertType === 'front' ? '#f59e0b' : idx === deque.length - 1 && insertType === 'back' ? '#f59e0b' : '#1e3a5f',
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
          当前边
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 16, height: 12, background: '#065f46', borderRadius: 2, marginRight: 4, verticalAlign: 'middle', textAlign: 'center', fontSize: '10px', lineHeight: '12px', color: '#6ee7b7' }}>0</span>
          权重0
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 16, height: 12, background: '#7c2d12', borderRadius: 2, marginRight: 4, verticalAlign: 'middle', textAlign: 'center', fontSize: '10px', lineHeight: '12px', color: '#fdba74' }}>1</span>
          权重1
        </span>
      </div>
    </div>
  )
}
