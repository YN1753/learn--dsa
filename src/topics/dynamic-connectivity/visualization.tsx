import { useState, useEffect, useRef, useCallback } from 'react'

// ---- Types ----

interface RollbackOp {
  nodeX: number
  oldParentX: number
  nodeY: number
  oldRankY: number
}

interface EdgeInterval {
  u: number
  v: number
  l: number
  r: number
  color: string
}

interface Query {
  u: number
  v: number
  time: number
  result: boolean | null
}

interface SegmentTreeNode {
  id: number
  l: number
  r: number
  edges: Array<[number, number]>
  children: [number, number]
}

interface StepSnapshot {
  description: string
  parent: number[]
  rank: number[]
  currentNode: number
  highlightEdge: [number, number] | null
  queryResult: { u: number; v: number; connected: boolean } | null
  phase: 'enter' | 'add-edge' | 'query' | 'rollback' | 'leave'
}

// ---- Rollback Union-Find ----

class RollbackUF {
  parent: number[]
  rank: number[]
  history: RollbackOp[]

  constructor(n: number) {
    this.parent = new Array(n)
    this.rank = new Array(n).fill(0)
    this.history = []
    for (let i = 0; i < n; i++) this.parent[i] = i
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      x = this.parent[x]
    }
    return x
  }

  union(x: number, y: number): boolean {
    let rootX = this.find(x)
    let rootY = this.find(y)
    if (rootX === rootY) return false

    if (this.rank[rootX] > this.rank[rootY]) {
      const tmp = rootX; rootX = rootY; rootY = tmp
    }

    this.history.push({
      nodeX: rootX,
      oldParentX: this.parent[rootX],
      nodeY: rootY,
      oldRankY: this.rank[rootY],
    })

    this.parent[rootX] = rootY
    if (this.rank[rootX] === this.rank[rootY]) {
      this.rank[rootY]++
    }
    return true
  }

  rollback(): boolean {
    if (this.history.length === 0) return false
    const op = this.history.pop()!
    this.parent[op.nodeX] = op.oldParentX
    this.rank[op.nodeY] = op.oldRankY
    return true
  }

  snapshot(): number {
    return this.history.length
  }

  rollbackTo(snap: number): void {
    while (this.history.length > snap) {
      this.rollback()
    }
  }

  isConnected(x: number, y: number): boolean {
    return this.find(x) === this.find(y)
  }
}

// ---- Constants ----

const NODE_COUNT = 5
const TIME_RANGE = 6
const EDGE_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6']

// Predefined demo operations
const DEMO_OPS = [
  { type: 'add' as const, u: 0, v: 1, time: 0 },
  { type: 'add' as const, u: 1, v: 2, time: 1 },
  { type: 'query' as const, u: 0, v: 2, time: 2 },
  { type: 'remove' as const, u: 0, v: 1, time: 3 },
  { type: 'add' as const, u: 3, v: 4, time: 4 },
  { type: 'query' as const, u: 0, v: 4, time: 5 },
]

// ---- Segment Tree Construction ----

function buildSegmentTree(intervals: EdgeInterval[]): SegmentTreeNode[] {
  const nodes: SegmentTreeNode[] = []
  const edgeLists = new Map<number, Array<[number, number]>>()

  function addToTree(node: number, nl: number, nr: number, ql: number, qr: number, edge: [number, number]): void {
    if (ql >= nr || qr <= nl) return
    if (ql <= nl && nr <= qr) {
      if (!edgeLists.has(node)) edgeLists.set(node, [])
      edgeLists.get(node)!.push(edge)
      return
    }
    const mid = (nl + nr) >> 1
    addToTree(node * 2, nl, mid, ql, qr, edge)
    addToTree(node * 2 + 1, mid, nr, ql, qr, edge)
  }

  for (const { u, v, l, r } of intervals) {
    addToTree(1, 0, TIME_RANGE, l, r, [u, v])
  }

  // Build node list for rendering
  function buildNodes(node: number, nl: number, nr: number): void {
    nodes.push({
      id: node,
      l: nl,
      r: nr,
      edges: edgeLists.get(node) || [],
      children: node * 2 < 100 ? [node * 2, node * 2 + 1] : [0, 0],
    })
    if (nr - nl > 1) {
      const mid = (nl + nr) >> 1
      buildNodes(node * 2, nl, mid)
      buildNodes(node * 2 + 1, mid, nr)
    }
  }

  buildNodes(1, 0, TIME_RANGE)
  return nodes
}

// ---- DFS Step Generation ----

function generateSteps(intervals: EdgeInterval[], queries: Query[]): StepSnapshot[] {
  const steps: StepSnapshot[] = []
  const uf = new RollbackUF(NODE_COUNT)

  // Build edge tree
  const edgeLists = new Map<number, Array<[number, number]>>()
  function addToTree(node: number, nl: number, nr: number, ql: number, qr: number, edge: [number, number]): void {
    if (ql >= nr || qr <= nl) return
    if (ql <= nl && nr <= qr) {
      if (!edgeLists.has(node)) edgeLists.set(node, [])
      edgeLists.get(node)!.push(edge)
      return
    }
    const mid = (nl + nr) >> 1
    addToTree(node * 2, nl, mid, ql, qr, edge)
    addToTree(node * 2 + 1, mid, nr, ql, qr, edge)
  }

  for (const { u, v, l, r } of intervals) {
    addToTree(1, 0, TIME_RANGE, l, r, [u, v])
  }

  function dfs(node: number, nl: number, nr: number): void {
    const snap = uf.snapshot()
    const edges = edgeLists.get(node) || []

    // Enter node
    steps.push({
      description: `进入线段树节点 ${node} [${nl},${nr})${edges.length > 0 ? '，准备加入 ' + edges.length + ' 条边' : ''}`,
      parent: [...uf.parent],
      rank: [...uf.rank],
      currentNode: node,
      highlightEdge: null,
      queryResult: null,
      phase: 'enter',
    })

    // Add edges
    for (const [u, v] of edges) {
      uf.union(u, v)
      steps.push({
        description: `加入边 (${u},${v})`,
        parent: [...uf.parent],
        rank: [...uf.rank],
        currentNode: node,
        highlightEdge: [u, v],
        queryResult: null,
        phase: 'add-edge',
      })
    }

    if (nr - nl === 1) {
      // Leaf: answer queries
      for (const q of queries) {
        if (q.time === nl) {
          const connected = uf.isConnected(q.u, q.v)
          steps.push({
            description: `时刻 ${nl} 查询 (${q.u},${q.v}): ${connected ? '连通' : '不连通'}`,
            parent: [...uf.parent],
            rank: [...uf.rank],
            currentNode: node,
            highlightEdge: null,
            queryResult: { u: q.u, v: q.v, connected },
            phase: 'query',
          })
        }
      }
    } else {
      const mid = (nl + nr) >> 1
      dfs(node * 2, nl, mid)
      dfs(node * 2 + 1, mid, nr)
    }

    // Rollback
    if (edges.length > 0) {
      uf.rollbackTo(snap)
      steps.push({
        description: `离开节点 ${node}，撤销 ${edges.length} 条边`,
        parent: [...uf.parent],
        rank: [...uf.rank],
        currentNode: node,
        highlightEdge: null,
        queryResult: null,
        phase: 'rollback',
      })
    }
  }

  dfs(1, 0, TIME_RANGE)
  return steps
}

// ---- Visualization Component ----

const SVG_W = 760
const SVG_H = 380

interface GraphNode {
  id: number
  x: number
  y: number
}

const NODE_POSITIONS: GraphNode[] = [
  { id: 0, x: 100, y: 80 },
  { id: 1, x: 250, y: 50 },
  { id: 2, x: 400, y: 80 },
  { id: 3, x: 150, y: 220 },
  { id: 4, x: 350, y: 220 },
]

const NODE_RADIUS = 24

export default function DynamicConnectivityVisualization() {
  const [steps, setSteps] = useState<StepSnapshot[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const [description, setDescription] = useState('点击「运行」开始线段树分治演示')
  const [parent, setParent] = useState<number[]>([])
  const [highlightEdge, setHighlightEdge] = useState<[number, number] | null>(null)
  const [queryResult, setQueryResult] = useState<{ u: number; v: number; connected: boolean } | null>(null)
  const [intervals] = useState<EdgeInterval[]>(() => {
    const edgeLife = new Map<string, number>()
    const result: EdgeInterval[] = []
    let colorIdx = 0

    for (const op of DEMO_OPS) {
      const key = `${Math.min(op.u, op.v)}-${Math.max(op.u, op.v)}`
      if (op.type === 'add') {
        edgeLife.set(key, op.time)
      } else if (op.type === 'remove') {
        const start = edgeLife.get(key)!
        result.push({ u: op.u, v: op.v, l: start, r: op.time, color: EDGE_COLORS[colorIdx % EDGE_COLORS.length] })
        colorIdx++
        edgeLife.delete(key)
      }
    }

    for (const [key, start] of edgeLife) {
      const [u, v] = key.split('-').map(Number)
      result.push({ u, v, l: start, r: TIME_RANGE, color: EDGE_COLORS[colorIdx % EDGE_COLORS.length] })
      colorIdx++
    }

    return result
  })

  const [queries] = useState<Query[]>(() => {
    return DEMO_OPS
      .filter(op => op.type === 'query')
      .map(op => ({ u: op.u, v: op.v, time: op.time, result: null }))
  })

  const [segTree] = useState<SegmentTreeNode[]>(() => buildSegmentTree(intervals))

  const timerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const handleRun = useCallback(() => {
    clearTimer()
    const generated = generateSteps(intervals, queries)
    setSteps(generated)
    setCurrentStep(0)
    setIsPlaying(true)

    if (generated.length > 0) {
      const first = generated[0]
      setParent([...first.parent])
      setHighlightEdge(first.highlightEdge)
      setQueryResult(first.queryResult)
      setDescription(first.description)
    }
  }, [intervals, queries, clearTimer])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      setDescription('演示完成')
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setParent([...step.parent])
      setHighlightEdge(step.highlightEdge)
      setQueryResult(step.queryResult)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = useCallback(() => {
    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }, [isPlaying, steps, currentStep, description, clearTimer])

  const handleStepForward = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) return
    clearTimer()
    setIsPlaying(false)
    const step = steps[currentStep]
    setParent([...step.parent])
    setHighlightEdge(step.highlightEdge)
    setQueryResult(step.queryResult)
    setDescription(step.description)
    setCurrentStep(prev => prev + 1)
  }, [steps, currentStep, clearTimer])

  const handleReset = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(-1)
    setParent(new Array(NODE_COUNT).fill(0).map((_, i) => i))
    setHighlightEdge(null)
    setQueryResult(null)
    setDescription('点击「运行」开始线段树分治演示')
  }, [clearTimer])

  // Get current UF for rendering
  const currentParent = parent.length > 0 ? parent : new Array(NODE_COUNT).fill(0).map((_, i) => i)

  // Find connected components for coloring
  function getComponentColor(nodeId: number): string {
    const colors = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6']
    const root = findRoot(currentParent, nodeId)
    return colors[root % colors.length]
  }

  function findRoot(p: number[], x: number): number {
    while (p[x] !== x) x = p[x]
    return x
  }

  // Build current edges from intervals and step progress
  const getCurrentEdges = (): Array<{ u: number; v: number; color: string }> => {
    if (currentStep < 0 || currentStep >= steps.length) return []
    const step = steps[Math.min(currentStep, steps.length - 1)]
    const p = step.parent
    const activeEdges: Array<{ u: number; v: number; color: string }> = []

    // Derive active edges from parent array
    for (let i = 0; i < p.length; i++) {
      if (p[i] !== i) {
        const edge = intervals.find(e =>
          (e.u === i && e.v === p[i]) || (e.v === i && e.u === p[i])
        )
        activeEdges.push({
          u: i,
          v: p[i],
          color: edge?.color || 'var(--text-secondary)',
        })
      }
    }
    return activeEdges
  }

  const currentEdges = getCurrentEdges()

  // Timeline bar
  const renderTimeline = () => {
    const barWidth = 660
    const barHeight = 40
    const segW = barWidth / TIME_RANGE

    return (
      <svg width={barWidth + 60} height={barHeight + 30} style={{ display: 'block', margin: '0 auto' }}>
        {/* Base bar */}
        <rect x={30} y={10} width={barWidth} height={barHeight} rx={4} fill="var(--bg-card)" stroke="var(--border)" strokeWidth={1} />

        {/* Edge intervals */}
        {intervals.map((interval, idx) => {
          const x1 = 30 + interval.l * segW
          const x2 = 30 + interval.r * segW
          const y = 15 + (idx % 3) * 10
          return (
            <g key={`interval-${idx}`}>
              <rect x={x1} y={y} width={x2 - x1} height={6} rx={2} fill={interval.color} opacity={0.7} />
              <text x={(x1 + x2) / 2} y={y + 5} textAnchor="middle" fill="var(--text-primary)" fontSize={8} fontFamily="Consolas, Monaco, monospace">
                ({interval.u},{interval.v})
              </text>
            </g>
          )
        })}

        {/* Query markers */}
        {queries.map((q, idx) => {
          const x = 30 + q.time * segW + segW / 2
          return (
            <g key={`query-${idx}`}>
              <polygon points={`${x},5 ${x - 5},15 ${x + 5},15`} fill="#f59e0b" />
              <text x={x} y={38} textAnchor="middle" fill="var(--text-secondary)" fontSize={9} fontFamily="Consolas, Monaco, monospace">
                Q({q.u},{q.v})
              </text>
            </g>
          )
        })}

        {/* Time labels */}
        {Array.from({ length: TIME_RANGE + 1 }, (_, i) => (
          <text key={`t-${i}`} x={30 + i * segW} y={barHeight + 22} textAnchor="middle" fill="var(--text-secondary)" fontSize={9} fontFamily="Consolas, Monaco, monospace">
            {i}
          </text>
        ))}
      </svg>
    )
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleRun} disabled={isPlaying && currentStep < steps.length}>
          运行
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
          <input
            type="range"
            min={400}
            max={2400}
            step={200}
            value={2800 - speed}
            onChange={e => setSpeed(2800 - Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      {/* Graph visualization */}
      <div className="viz-canvas" style={{ padding: '0.5rem' }}>
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block' }}>
          <defs>
            <marker id="dc-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" opacity="0.5" />
            </marker>
            <filter id="dc-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Title */}
          <text x={SVG_W / 2} y={20} textAnchor="middle" fill="var(--text-secondary)" fontSize={12} fontWeight="600">
            并查集森林
          </text>

          {/* Edges from UF parent pointers */}
          {currentEdges.map((edge, i) => {
            const fromNode = NODE_POSITIONS[edge.u]
            const toNode = NODE_POSITIONS[edge.v]
            if (!fromNode || !toNode) return null

            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const offsetX = (dx / dist) * NODE_RADIUS
            const offsetY = (dy / dist) * NODE_RADIUS

            const isHighlighted = highlightEdge !== null &&
              ((highlightEdge[0] === edge.u && highlightEdge[1] === edge.v) ||
               (highlightEdge[0] === edge.v && highlightEdge[1] === edge.u))

            return (
              <line
                key={`edge-${i}`}
                x1={fromNode.x + offsetX}
                y1={fromNode.y + offsetY}
                x2={toNode.x - offsetX}
                y2={toNode.y - offsetY}
                stroke={isHighlighted ? '#f59e0b' : edge.color}
                strokeWidth={isHighlighted ? 3 : 2}
                strokeOpacity={isHighlighted ? 1 : 0.6}
                markerEnd="url(#dc-arrow)"
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}

          {/* Query highlight edges */}
          {queryResult && (() => {
            const uNode = NODE_POSITIONS[queryResult.u]
            const vNode = NODE_POSITIONS[queryResult.v]
            if (!uNode || !vNode) return null
            return (
              <line
                x1={uNode.x}
                y1={uNode.y}
                x2={vNode.x}
                y2={vNode.y}
                stroke={queryResult.connected ? '#22c55e' : '#ef4444'}
                strokeWidth={3}
                strokeDasharray={queryResult.connected ? 'none' : '6 4'}
                strokeOpacity={0.8}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })()}

          {/* Nodes */}
          {NODE_POSITIONS.map(node => {
            const compColor = getComponentColor(node.id)
            const isRoot = currentParent[node.id] === node.id
            const isQueryNode = queryResult !== null && (queryResult.u === node.id || queryResult.v === node.id)

            return (
              <g key={node.id}>
                {/* Root indicator */}
                {isRoot && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 4}
                    fill="none"
                    stroke={compColor}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    opacity={0.5}
                  />
                )}
                {/* Query glow */}
                {isQueryNode && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 6}
                    fill="none"
                    stroke={queryResult?.connected ? '#22c55e' : '#ef4444'}
                    strokeWidth={2}
                    opacity={0.6}
                    filter="url(#dc-glow)"
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={isRoot ? compColor : 'var(--bg-card)'}
                  stroke={compColor}
                  strokeWidth={isQueryNode ? 3 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isRoot ? '#fff' : 'var(--text-primary)'}
                  fontSize="14"
                  fontWeight="600"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ pointerEvents: 'none' }}
                >
                  {node.id}
                </text>
                <text
                  x={node.x}
                  y={node.y + NODE_RADIUS + 14}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  p={currentParent[node.id]}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(15, ${SVG_H - 30})`}>
            <circle cx={0} cy={0} r={6} fill="#3b82f6" />
            <text x={10} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize={10}>分量A</text>
            <circle cx={70} cy={0} r={6} fill="#22c55e" />
            <text x={80} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize={10}>分量B</text>
            <circle cx={140} cy={0} r={6} fill="#ef4444" />
            <text x={150} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize={10}>分量C</text>
            <text x={210} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize={10}>虚线环=根</text>
          </g>
        </svg>
      </div>

      {/* Segment Tree Node Info */}
      {steps.length > 0 && currentStep >= 0 && currentStep < steps.length && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '0.5rem 0', padding: '0 0.5rem' }}>
          <div style={{ flex: 1, minWidth: '150px', background: 'var(--bg-card)', padding: '0.6rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
            <strong>当前节点</strong>
            <div style={{ marginTop: '0.3rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace' }}>
              节点 {steps[currentStep].currentNode}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '150px', background: 'var(--bg-card)', padding: '0.6rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
            <strong>阶段</strong>
            <div style={{ marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
              {steps[currentStep].phase === 'enter' && '进入节点'}
              {steps[currentStep].phase === 'add-edge' && '加入边'}
              {steps[currentStep].phase === 'query' && '回答查询'}
              {steps[currentStep].phase === 'rollback' && '撤销边'}
              {steps[currentStep].phase === 'leave' && '离开节点'}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '150px', background: 'var(--bg-card)', padding: '0.6rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
            <strong>Parent 数组</strong>
            <div style={{ marginTop: '0.3rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace' }}>
              [{currentParent.join(', ')}]
            </div>
          </div>
          {queryResult && (
            <div style={{
              flex: 1,
              minWidth: '150px',
              background: 'var(--bg-card)',
              padding: '0.6rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.85rem',
              borderLeft: `3px solid ${queryResult.connected ? '#22c55e' : '#ef4444'}`,
            }}>
              <strong>查询结果</strong>
              <div style={{ marginTop: '0.3rem', color: queryResult.connected ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                ({queryResult.u}, {queryResult.v}): {queryResult.connected ? '连通' : '不连通'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', margin: '0.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>时间轴 / 边存活区间</div>
        {renderTimeline()}
      </div>

      {/* Seg tree info */}
      <div style={{ padding: '0.5rem', margin: '0 0.5rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>线段树节点分配</div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {segTree.filter(n => n.edges.length > 0).map(node => {
            const isActive = currentStep >= 0 && currentStep < steps.length && steps[currentStep].currentNode === node.id
            return (
              <div
                key={node.id}
                style={{
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                  border: isActive ? '1px solid #3b82f6' : '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.3s ease',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>节点 {node.id}</span>
                <span style={{ marginLeft: '0.4rem' }}>[{node.l},{node.r})</span>
                <span style={{ marginLeft: '0.4rem' }}>
                  {node.edges.map(([u, v]) => `(${u},${v})`).join(', ')}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="viz-info">
        {description}
      </div>

      {/* Legend */}
      <div className="viz-info" style={{ fontSize: '0.8rem' }}>
        <strong>操作序列：</strong>
        {DEMO_OPS.map((op, i) => (
          <span key={i} style={{ marginLeft: '0.8rem' }}>
            {op.type === 'add' && <span style={{ color: '#22c55e' }}>+加</span>}
            {op.type === 'remove' && <span style={{ color: '#ef4444' }}>-删</span>}
            {op.type === 'query' && <span style={{ color: '#f59e0b' }}>?查</span>}
            ({op.u},{op.v})
          </span>
        ))}
      </div>
    </div>
  )
}
