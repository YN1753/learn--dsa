import { useState, useEffect, useRef, useCallback } from 'react'

interface Edge {
  u: number
  v: number
}

interface TreeNode {
  id: number
  x: number
  y: number
}

type Phase = 'idle' | 'bfs1' | 'bfs2' | 'done'

interface AnimationStep {
  description: string
  phase: Phase
  visited: Set<number>
  current: number | null
  queue: number[]
  distances: Map<number, number>
  farthest: number | null
  diameterPath: number[]
  highlightEdge: [number, number] | null
}

const TREE_EDGES: Edge[] = [
  { u: 1, v: 2 }, { u: 1, v: 3 }, { u: 2, v: 4 },
  { u: 2, v: 5 }, { u: 3, v: 6 }, { u: 5, v: 7 },
  { u: 5, v: 8 }, { u: 7, v: 9 },
]

const TREE_NODES: TreeNode[] = [
  { id: 1, x: 400, y: 40 },
  { id: 2, x: 220, y: 130 },
  { id: 3, x: 580, y: 130 },
  { id: 4, x: 100, y: 230 },
  { id: 5, x: 320, y: 230 },
  { id: 6, x: 660, y: 230 },
  { id: 7, x: 240, y: 330 },
  { id: 8, x: 400, y: 330 },
  { id: 9, x: 240, y: 420 },
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

function bfs(start: number, adj: Map<number, number[]>): { farthest: number; dist: Map<number, number>; steps: { node: number; dist: number }[] } {
  const dist = new Map<number, number>()
  const queue: number[] = [start]
  dist.set(start, 0)
  let farthest = start
  const steps: { node: number; dist: number }[] = []

  while (queue.length > 0) {
    const node = queue.shift()!
    const d = dist.get(node)!
    steps.push({ node, dist: d })
    if (d > dist.get(farthest)!) farthest = node
    for (const neighbor of adj.get(node) || []) {
      if (!dist.has(neighbor)) {
        dist.set(neighbor, d + 1)
        queue.push(neighbor)
      }
    }
  }

  return { farthest, dist, steps }
}

function getPath(start: number, end: number, adj: Map<number, number[]>): number[] {
  const parent = new Map<number, number>()
  const queue: number[] = [start]
  parent.set(start, -1)

  while (queue.length > 0) {
    const node = queue.shift()!
    if (node === end) break
    for (const neighbor of adj.get(node) || []) {
      if (!parent.has(neighbor)) {
        parent.set(neighbor, node)
        queue.push(neighbor)
      }
    }
  }

  const path: number[] = []
  let cur: number = end
  while (cur !== -1) {
    path.push(cur)
    cur = parent.get(cur)!
  }
  path.reverse()
  return path
}

export default function TreeDiameterVisualization() {
  const adj = useRef(buildAdjacency())
  const [phase, setPhase] = useState<Phase>('idle')
  const [visited, setVisited] = useState<Set<number>>(new Set())
  const [current, setCurrent] = useState<number | null>(null)
  const [queue, setQueue] = useState<number[]>([])
  const [distances, setDistances] = useState<Map<number, number>>(new Map())
  const [farthest, setFarthest] = useState<number | null>(null)
  const [bfsStart, setBfsStart] = useState<number | null>(null)
  const [diameterPath, setDiameterPath] = useState<number[]>([])
  const [description, setDescription] = useState<string>('点击「开始」执行两次BFS求树的直径')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((): AnimationStep[] => {
    const allSteps: AnimationStep[] = []

    // Phase 1: BFS from node 1
    const bfs1Result = bfs(1, adj.current)
    const visited1 = new Set<number>()
    const dist1 = new Map<number, number>()

    allSteps.push({
      description: `第一次BFS：从节点 1 出发`,
      phase: 'bfs1',
      visited: new Set(visited1),
      current: 1,
      queue: bfs1Result.steps.map(s => s.node),
      distances: new Map(dist1),
      farthest: null,
      diameterPath: [],
      highlightEdge: null,
    })

    for (const step of bfs1Result.steps) {
      visited1.add(step.node)
      dist1.set(step.node, step.dist)
      allSteps.push({
        description: `BFS-1: 访问节点 ${step.node}，距离 = ${step.dist}`,
        phase: 'bfs1',
        visited: new Set(visited1),
        current: step.node,
        queue: [],
        distances: new Map(dist1),
        farthest: bfs1Result.farthest,
        diameterPath: [],
        highlightEdge: null,
      })
    }

    const u = bfs1Result.farthest
    allSteps.push({
      description: `第一次BFS完成！最远节点 u = ${u}（直径端点之一）`,
      phase: 'bfs1',
      visited: new Set(visited1),
      current: null,
      queue: [],
      distances: new Map(dist1),
      farthest: u,
      diameterPath: [],
      highlightEdge: null,
    })

    // Phase 2: BFS from u
    const bfs2Result = bfs(u, adj.current)
    const visited2 = new Set<number>()
    const dist2 = new Map<number, number>()

    allSteps.push({
      description: `第二次BFS：从节点 ${u} 出发`,
      phase: 'bfs2',
      visited: new Set(),
      current: u,
      queue: [],
      distances: new Map(),
      farthest: u,
      diameterPath: [],
      highlightEdge: null,
    })

    for (const step of bfs2Result.steps) {
      visited2.add(step.node)
      dist2.set(step.node, step.dist)
      allSteps.push({
        description: `BFS-2: 访问节点 ${step.node}，距离 = ${step.dist}`,
        phase: 'bfs2',
        visited: new Set(visited2),
        current: step.node,
        queue: [],
        distances: new Map(dist2),
        farthest: bfs2Result.farthest,
        diameterPath: [],
        highlightEdge: null,
      })
    }

    const v = bfs2Result.farthest
    const diameter = dist2.get(v)!
    const path = getPath(u, v, adj.current)

    // Highlight diameter path edges
    for (let i = 0; i < path.length - 1; i++) {
      allSteps.push({
        description: `标记直径路径边: ${path[i]} -- ${path[i + 1]}`,
        phase: 'bfs2',
        visited: new Set(visited2),
        current: null,
        queue: [],
        distances: new Map(dist2),
        farthest: v,
        diameterPath: path.slice(0, i + 2),
        highlightEdge: [path[i], path[i + 1]],
      })
    }

    allSteps.push({
      description: `树的直径 = ${diameter}，路径: ${path.join(' -> ')}`,
      phase: 'done',
      visited: new Set([...visited1, ...visited2]),
      current: null,
      queue: [],
      distances: new Map(dist2),
      farthest: v,
      diameterPath: path,
      highlightEdge: null,
    })

    return allSteps
  }, [])

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
      setVisited(new Set(step.visited))
      setCurrent(step.current)
      setQueue([...step.queue])
      setDistances(new Map(step.distances))
      setFarthest(step.farthest)
      setDiameterPath([...step.diameterPath])
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleStart = () => {
    const allSteps = generateSteps()
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
      const allSteps = generateSteps()
      setSteps(allSteps)
      setCurrentStep(0)
    }
    if (currentStep < steps.length) {
      setIsPlaying(false)
      const step = steps[currentStep]
      setPhase(step.phase)
      setVisited(new Set(step.visited))
      setCurrent(step.current)
      setQueue([...step.queue])
      setDistances(new Map(step.distances))
      setFarthest(step.farthest)
      setDiameterPath([...step.diameterPath])
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setPhase('idle')
    setVisited(new Set())
    setCurrent(null)
    setQueue([])
    setDistances(new Map())
    setFarthest(null)
    setBfsStart(null)
    setDiameterPath([])
    setDescription('点击「开始」执行两次BFS求树的直径')
    setSteps([])
    setCurrentStep(0)
  }

  const getNodeColor = (nodeId: number): string => {
    if (diameterPath.includes(nodeId) && phase === 'done') return '#a855f7'
    if (nodeId === current) return '#3b82f6'
    if (nodeId === farthest && phase !== 'done') return '#f59e0b'
    if (visited.has(nodeId)) return '#22c55e'
    return 'var(--bg-card)'
  }

  const getNodeBorder = (nodeId: number): string => {
    if (diameterPath.includes(nodeId) && phase === 'done') return '#c084fc'
    if (nodeId === current) return '#60a5fa'
    if (nodeId === farthest && phase !== 'done') return '#fbbf24'
    if (visited.has(nodeId)) return '#4ade80'
    return 'var(--border)'
  }

  const getEdgeColor = (u: number, v: number): string => {
    if (diameterPath.length >= 2) {
      for (let i = 0; i < diameterPath.length - 1; i++) {
        if ((diameterPath[i] === u && diameterPath[i + 1] === v) ||
            (diameterPath[i] === v && diameterPath[i + 1] === u)) {
          return '#a855f7'
        }
      }
    }
    if (visited.has(u) && visited.has(v)) return '#4ade80'
    return 'var(--border)'
  }

  const getEdgeWidth = (u: number, v: number): number => {
    if (diameterPath.length >= 2) {
      for (let i = 0; i < diameterPath.length - 1; i++) {
        if ((diameterPath[i] === u && diameterPath[i + 1] === v) ||
            (diameterPath[i] === v && diameterPath[i + 1] === u)) {
          return 4
        }
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
        <svg width="800" height="480" viewBox="0 0 800 480">
          <defs>
            <marker id="arrow-td" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
          </defs>

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
            const isCurrent = node.id === current
            const isFarthest = node.id === farthest && phase !== 'done'
            const dist = distances.get(node.id)
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={28}
                  fill={getNodeColor(node.id)}
                  stroke={getNodeBorder(node.id)}
                  strokeWidth={isCurrent || isFarthest ? 4 : 2}
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
                {dist !== undefined && (
                  <text
                    x={node.x}
                    y={node.y + 42}
                    fill="var(--text-secondary)"
                    fontSize="12"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    d={dist}
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
          当前节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          已访问
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          最远节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#a855f7', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          直径路径
        </span>
      </div>
    </div>
  )
}
