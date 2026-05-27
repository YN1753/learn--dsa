import { useState, useEffect, useRef, useCallback } from 'react'

interface TreeEdge {
  from: number
  to: number
}

interface NodePos {
  id: number
  x: number
  y: number
}

interface AnimationStep {
  description: string
  phase: 'init' | 'dfs1-size' | 'dfs1-heavy' | 'dfs2-pos' | 'dfs2-chain' | 'query' | 'done'
  highlightedNodes: number[]
  highlightType: 'size' | 'heavy' | 'light' | 'chain' | 'query' | 'path' | 'none'
  chainColors: Map<number, number[]>
  dfsOrder: number[]
  querySegments?: { from: number; to: number; chainHead: number }[]
}

const EDGES: TreeEdge[] = [
  { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 4 },
  { from: 2, to: 5 }, { from: 2, to: 6 },
  { from: 4, to: 7 },
  { from: 5, to: 8 }, { from: 5, to: 9 },
]

const CHILDREN: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [5, 6],
  3: [],
  4: [7],
  5: [8, 9],
  6: [],
  7: [],
  8: [],
  9: [],
}

const CHAIN_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function getNodePositions(): NodePos[] {
  const positions: NodePos[] = [
    { id: 1, x: 400, y: 40 },
    { id: 2, x: 220, y: 130 },
    { id: 3, x: 400, y: 130 },
    { id: 4, x: 580, y: 130 },
    { id: 5, x: 140, y: 220 },
    { id: 6, x: 300, y: 220 },
    { id: 7, x: 580, y: 220 },
    { id: 8, x: 80, y: 310 },
    { id: 9, x: 200, y: 310 },
  ]
  return positions
}

function computeHLD() {
  const n = 9
  const size = new Array<number>(n + 1).fill(0)
  const depth = new Array<number>(n + 1).fill(0)
  const parent = new Array<number>(n + 1).fill(0)
  const heavy = new Array<number>(n + 1).fill(-1)
  const pos = new Array<number>(n + 1).fill(0)
  const head = new Array<number>(n + 1).fill(0)

  function dfs1(u: number, p: number): void {
    parent[u] = p
    depth[u] = depth[p] + 1
    size[u] = 1
    let maxSize = 0
    for (const v of CHILDREN[u] ?? []) {
      dfs1(v, u)
      size[u] += size[v]
      if (size[v] > maxSize) {
        maxSize = size[v]
        heavy[u] = v
      }
    }
  }
  dfs1(1, 0)

  let currentPos = 0
  function dfs2(u: number, h: number): void {
    pos[u] = currentPos++
    head[u] = h
    if (heavy[u] !== -1) {
      dfs2(heavy[u], h)
    }
    for (const v of CHILDREN[u] ?? []) {
      if (v !== heavy[u]) {
        dfs2(v, v)
      }
    }
  }
  dfs2(1, 1)

  return { size, depth, parent, heavy, pos, head }
}

export default function HeavyLightDecompositionVisualization() {
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('树链剖分可视化 - 点击「开始演示」查看过程')
  const [highlightedNodes, setHighlightedNodes] = useState<number[]>([])
  const [highlightType, setHighlightType] = useState<AnimationStep['highlightType']>('none')
  const [chainColors, setChainColors] = useState<Map<number, number[]>>(new Map())
  const [dfsOrder, setDfsOrder] = useState<number[]>([])
  const [querySegments, setQuerySegments] = useState<{ from: number; to: number; chainHead: number }[]>([])
  const [_nodeLabels, setNodeLabels] = useState<Map<number, string>>(new Map())
  const timerRef = useRef<number | null>(null)

  const nodePositions = getNodePositions()
  const nodeMap = new Map(nodePositions.map(n => [n.id, n]))

  const generateSteps = useCallback((): AnimationStep[] => {
    const result: AnimationStep[] = []
    const { size, heavy, head: _head } = computeHLD()

    result.push({
      description: '初始状态：这是一棵有 9 个节点的树',
      phase: 'init',
      highlightedNodes: [],
      highlightType: 'none',
      chainColors: new Map(),
      dfsOrder: [],
    })

    // Show subtree sizes
    for (let i = 1; i <= 9; i++) {
      result.push({
        description: `计算节点 ${i} 的子树大小: size[${i}] = ${size[i]}`,
        phase: 'dfs1-size',
        highlightedNodes: [i],
        highlightType: 'size',
        chainColors: new Map(),
        dfsOrder: [],
      })
    }

    // Show heavy child identification
    for (let i = 1; i <= 9; i++) {
      if (heavy[i] !== -1) {
        result.push({
          description: `节点 ${i} 的重儿子是 ${heavy[i]}（子树大小 ${size[heavy[i]]} 最大）`,
          phase: 'dfs1-heavy',
          highlightedNodes: [i, heavy[i]],
          highlightType: 'heavy',
          chainColors: new Map(),
          dfsOrder: [],
        })
      }
    }

    // Show DFS order
    const order: number[] = []
    const tempHead = new Array<number>(10).fill(0)
    const tempPos = new Array<number>(10).fill(0)
    let cp = 0
    function dfs2Sim(u: number, h: number): void {
      tempPos[u] = cp++
      tempHead[u] = h
      order.push(u)
      if (heavy[u] !== -1) dfs2Sim(heavy[u], h)
      for (const v of CHILDREN[u] ?? []) {
        if (v !== heavy[u]) dfs2Sim(v, v)
      }
    }
    dfs2Sim(1, 1)

    for (let i = 0; i < order.length; i++) {
      const node = order[i]
      result.push({
        description: `DFS 序分配: pos[${node}] = ${i}, 所在链顶 = ${tempHead[node]}`,
        phase: 'dfs2-pos',
        highlightedNodes: [node],
        highlightType: 'chain',
        chainColors: new Map(),
        dfsOrder: order.slice(0, i + 1),
      })
    }

    // Show chains
    const chains = new Map<number, number[]>()
    for (let i = 1; i <= 9; i++) {
      const h = tempHead[i]
      if (!chains.has(h)) chains.set(h, [])
      chains.get(h)!.push(i)
    }

    const colorMap = new Map<number, number[]>()
    let ci = 0
    for (const [, nodes] of chains) {
      colorMap.set(ci, nodes)
      result.push({
        description: `重链 ${ci + 1}: ${nodes.join(' -> ')}（DFS 序中连续）`,
        phase: 'dfs2-chain',
        highlightedNodes: nodes,
        highlightType: 'chain',
        chainColors: new Map(colorMap),
        dfsOrder: order,
      })
      ci++
    }

    // Query demonstration: node 8 to node 7
    const queryResult: { from: number; to: number; chainHead: number }[] = []
    let u = 8, v = 7
    const qu = u, qv = v
    while (tempHead[u] !== tempHead[v]) {
      if (computeHLD().depth[tempHead[u]] < computeHLD().depth[tempHead[v]]) {
        ;[u, v] = [v, u]
      }
      queryResult.push({ from: tempHead[u], to: u, chainHead: tempHead[u] })
      u = computeHLD().parent[tempHead[u]]
    }
    if (computeHLD().depth[u] > computeHLD().depth[v]) {
      ;[u, v] = [v, u]
    }
    queryResult.push({ from: u, to: v, chainHead: tempHead[u] })

    result.push({
      description: `路径查询演示: 节点 ${qu} 到节点 ${qv}`,
      phase: 'query',
      highlightedNodes: [qu, qv],
      highlightType: 'query',
      chainColors: new Map(colorMap),
      dfsOrder: order,
      querySegments: [],
    })

    for (let i = 0; i < queryResult.length; i++) {
      const seg = queryResult[i]
      const allSegs = queryResult.slice(0, i + 1)
      result.push({
        description: `查询第 ${i + 1} 段: 重链区间 [${seg.from}..${seg.to}]（线段树查询）`,
        phase: 'query',
        highlightedNodes: [seg.from, seg.to],
        highlightType: 'path',
        chainColors: new Map(colorMap),
        dfsOrder: order,
        querySegments: allSegs,
      })
    }

    result.push({
      description: `路径查询完成! 共使用 ${queryResult.length} 次线段树查询，时间复杂度 O(log²n)`,
      phase: 'done',
      highlightedNodes: [qu, qv],
      highlightType: 'path',
      chainColors: new Map(colorMap),
      dfsOrder: order,
      querySegments: queryResult,
    })

    return result
  }, [])

  const handleStart = useCallback(() => {
    const s = generateSteps()
    setSteps(s)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [generateSteps])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setDescription('树链剖分可视化 - 点击「开始演示」查看过程')
    setHighlightedNodes([])
    setHighlightType('none')
    setChainColors(new Map())
    setDfsOrder([])
    setQuerySegments([])
    setNodeLabels(new Map())
  }, [])

  const handlePauseResume = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }, [isPlaying, description, steps, currentStep])

  const handleStep = useCallback(() => {
    if (steps.length === 0) {
      const s = generateSteps()
      setSteps(s)
      setCurrentStep(0)
      const step = s[0]
      setDescription(step.description)
      setHighlightedNodes(step.highlightedNodes)
      setHighlightType(step.highlightType)
      setChainColors(step.chainColors)
      setDfsOrder(step.dfsOrder)
      setQuerySegments(step.querySegments ?? [])
      setCurrentStep(1)
      return
    }
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setDescription(step.description)
      setHighlightedNodes(step.highlightedNodes)
      setHighlightType(step.highlightType)
      setChainColors(step.chainColors)
      setDfsOrder(step.dfsOrder)
      setQuerySegments(step.querySegments ?? [])
      setCurrentStep(prev => prev + 1)
    }
  }, [steps, currentStep, generateSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setDescription(step.description)
      setHighlightedNodes(step.highlightedNodes)
      setHighlightType(step.highlightType)
      setChainColors(step.chainColors)
      setDfsOrder(step.dfsOrder)
      setQuerySegments(step.querySegments ?? [])
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const getNodeColor = (id: number): string => {
    // Check chain colors
    for (const [colorIdx, nodes] of chainColors) {
      if (nodes.includes(id)) {
        return CHAIN_COLORS[colorIdx % CHAIN_COLORS.length]
      }
    }
    if (highlightedNodes.includes(id)) {
      switch (highlightType) {
        case 'size': return '#3b82f6'
        case 'heavy': return '#22c55e'
        case 'query': return '#f59e0b'
        case 'path': return '#ef4444'
        case 'chain': return '#8b5cf6'
        default: return 'var(--bg-card)'
      }
    }
    return 'var(--bg-card)'
  }

  const getNodeBorder = (id: number): string => {
    if (highlightedNodes.includes(id)) {
      return '#ffffff'
    }
    return 'var(--border)'
  }

  const getEdgeColor = (from: number, to: number): string => {
    const { heavy } = computeHLD()
    // Check if this is a heavy edge
    if (heavy[from] === to) {
      for (const [colorIdx, nodes] of chainColors) {
        if (nodes.includes(from) && nodes.includes(to)) {
          return CHAIN_COLORS[colorIdx % CHAIN_COLORS.length]
        }
      }
      return '#22c55e'
    }
    // Check query segments
    for (const seg of querySegments) {
      const minId = Math.min(seg.from, seg.to)
      const maxId = Math.max(seg.from, seg.to)
      if (from >= minId && from <= maxId && to >= minId && to <= maxId) {
        return '#ef4444'
      }
    }
    return 'var(--text-secondary)'
  }

  const { size, heavy } = computeHLD()

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始演示
        </button>
        <button className="btn btn-primary" onClick={handleStep}>
          单步执行
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
            min="200"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={800} height={380}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map((edge) => {
            const fromNode = nodeMap.get(edge.from)!
            const toNode = nodeMap.get(edge.to)!
            const isHeavy = heavy[edge.from] === edge.to
            const edgeColor = getEdgeColor(edge.from, edge.to)
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={fromNode.x}
                y1={fromNode.y + 20}
                x2={toNode.x}
                y2={toNode.y - 20}
                stroke={edgeColor}
                strokeWidth={isHeavy ? 3.5 : 1.5}
                strokeDasharray={isHeavy ? 'none' : '6,3'}
              />
            )
          })}

          {/* Nodes */}
          {nodePositions.map((node) => {
            const color = getNodeColor(node.id)
            const border = getNodeBorder(node.id)
            const isHighlighted = highlightedNodes.includes(node.id)
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  fill={color}
                  stroke={border}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  opacity={highlightedNodes.length === 0 || isHighlighted ? 1 : 0.4}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  fill={isHighlighted ? '#ffffff' : 'var(--text-primary)'}
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.id}
                </text>
                {/* Size label */}
                {(highlightType === 'size' || highlightType === 'heavy') && isHighlighted && (
                  <text
                    x={node.x}
                    y={node.y - 30}
                    fill="var(--text-secondary)"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    size={size[node.id]}
                  </text>
                )}
                {/* DFS order label */}
                {dfsOrder.length > 0 && dfsOrder.indexOf(node.id) >= 0 && (
                  <text
                    x={node.x + 25}
                    y={node.y - 10}
                    fill="var(--accent)"
                    fontSize="10"
                    textAnchor="start"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    pos={dfsOrder.indexOf(node.id)}
                  </text>
                )}
              </g>
            )
          })}

          {/* Legend */}
          <g transform="translate(620, 40)">
            <text x={0} y={0} fill="var(--text-secondary)" fontSize="12" fontWeight="bold">图例</text>
            <line x1={0} y1={12} x2={25} y2={12} stroke="#22c55e" strokeWidth={3} />
            <text x={30} y={16} fill="var(--text-secondary)" fontSize="11">重边</text>
            <line x1={0} y1={28} x2={25} y2={28} stroke="var(--text-secondary)" strokeWidth={1.5} strokeDasharray="6,3" />
            <text x={30} y={32} fill="var(--text-secondary)" fontSize="11">轻边</text>

            {Array.from(chainColors.entries()).map(([colorIdx, nodes], i) => (
              <g key={colorIdx} transform={`translate(0, ${44 + i * 18})`}>
                <rect x={0} y={-6} width={12} height={12} rx={2} fill={CHAIN_COLORS[colorIdx % CHAIN_COLORS.length]} />
                <text x={18} y={4} fill="var(--text-secondary)" fontSize="11">
                  重链 {colorIdx + 1}: {nodes.join('-')}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          子树大小计算
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          重儿子标记
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          查询端点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          路径段
        </span>
      </div>
    </div>
  )
}
