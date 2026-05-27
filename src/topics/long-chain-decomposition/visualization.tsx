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
  phase: 'init' | 'depth' | 'heavy' | 'chain' | 'inherit' | 'query' | 'done'
  highlightedNodes: number[]
  highlightType: 'depth' | 'heavy' | 'chain' | 'inherit' | 'query' | 'path' | 'none'
  chainColors: Map<number, number[]>
  inheritEdges: { from: number; to: number }[]
  queryPath: number[]
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
  return [
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
}

function computeLongChainDecomposition() {
  const n = 9
  const depth = new Array<number>(n + 1).fill(0)
  const heavy = new Array<number>(n + 1).fill(-1)
  const parent = new Array<number>(n + 1).fill(0)
  const top = new Array<number>(n + 1).fill(0)
  const chainId = new Array<number>(n + 1).fill(0)
  const offset = new Array<number>(n + 1).fill(0)

  // DFS 1: compute depth and heavy child
  function dfs1(u: number, p: number): void {
    parent[u] = p
    let maxDepth = 0
    for (const v of CHILDREN[u] ?? []) {
      dfs1(v, u)
      if (depth[v] + 1 > maxDepth) {
        maxDepth = depth[v] + 1
        heavy[u] = v
      }
    }
    depth[u] = maxDepth
  }
  dfs1(1, 0)

  // DFS 2: assign chains and offsets (inherited pointer)
  let nextOffset = 0
  let currentChain = 0

  function dfs2(u: number, topNode: number): void {
    top[u] = topNode
    chainId[u] = currentChain

    if (u === topNode) {
      offset[u] = nextOffset
      nextOffset += (depth[topNode] + 1)
    }

    if (heavy[u] !== -1) {
      offset[heavy[u]] = offset[u] + 1
      dfs2(heavy[u], topNode)
    }

    for (const v of CHILDREN[u] ?? []) {
      if (v !== heavy[u]) {
        currentChain++
        dfs2(v, v)
      }
    }
  }
  dfs2(1, 1)

  return { depth, heavy, parent, top, chainId, offset }
}

function getChainNodes(): Map<number, number[]> {
  const { top } = computeLongChainDecomposition()
  const chains = new Map<number, number[]>()
  for (let i = 1; i <= 9; i++) {
    const t = top[i]
    if (!chains.has(t)) chains.set(t, [])
    chains.get(t)!.push(i)
  }
  return chains
}

function getAncestors(u: number, k: number): number[] {
  const { parent } = computeLongChainDecomposition()
  const path: number[] = [u]
  let current = u
  for (let i = 0; i < k; i++) {
    if (parent[current] === 0) break
    current = parent[current]
    path.push(current)
  }
  return path
}

export default function LongChainDecompositionVisualization() {
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('长链剖分可视化 - 点击「开始演示」查看过程')
  const [highlightedNodes, setHighlightedNodes] = useState<number[]>([])
  const [highlightType, setHighlightType] = useState<AnimationStep['highlightType']>('none')
  const [chainColors, setChainColors] = useState<Map<number, number[]>>(new Map())
  const [inheritEdges, setInheritEdges] = useState<{ from: number; to: number }[]>([])
  const [queryPath, setQueryPath] = useState<number[]>([])
  const [queryInput, setQueryInput] = useState<{ node: number; k: number }>({ node: 8, k: 3 })
  const timerRef = useRef<number | null>(null)

  const nodePositions = getNodePositions()
  const nodeMap = new Map(nodePositions.map(n => [n.id, n]))
  const { depth, heavy } = computeLongChainDecomposition()

  const generateSteps = useCallback((): AnimationStep[] => {
    const result: AnimationStep[] = []

    result.push({
      description: '初始状态：这是一棵有 9 个节点的树',
      phase: 'init',
      highlightedNodes: [],
      highlightType: 'none',
      chainColors: new Map(),
      inheritEdges: [],
      queryPath: [],
    })

    // Show depth computation
    for (let i = 1; i <= 9; i++) {
      result.push({
        description: `计算节点 ${i} 的子树深度: depth[${i}] = ${depth[i]}`,
        phase: 'depth',
        highlightedNodes: [i],
        highlightType: 'depth',
        chainColors: new Map(),
        inheritEdges: [],
        queryPath: [],
      })
    }

    // Show heavy child identification
    for (let i = 1; i <= 9; i++) {
      if (heavy[i] !== -1) {
        result.push({
          description: `节点 ${i} 的长儿子是 ${heavy[i]}（子树深度 ${depth[heavy[i]]} 最大）`,
          phase: 'heavy',
          highlightedNodes: [i, heavy[i]],
          highlightType: 'heavy',
          chainColors: new Map(),
          inheritEdges: [],
          queryPath: [],
        })
      }
    }

    // Show chain decomposition
    const chains = getChainNodes()
    const colorMap = new Map<number, number[]>()
    let ci = 0
    for (const [, nodes] of chains) {
      colorMap.set(ci, nodes)
      result.push({
        description: `长链 ${ci + 1}: ${nodes.join(' -> ')}（链长 = ${nodes.length}）`,
        phase: 'chain',
        highlightedNodes: nodes,
        highlightType: 'chain',
        chainColors: new Map(colorMap),
        inheritEdges: [],
        queryPath: [],
      })
      ci++
    }

    // Show inherited pointers
    const inheritEdgesList: { from: number; to: number }[] = []
    for (let i = 1; i <= 9; i++) {
      if (heavy[i] !== -1) {
        inheritEdgesList.push({ from: i, to: heavy[i] })
      }
    }

    for (const edge of inheritEdgesList) {
      result.push({
        description: `继承指针: 节点 ${edge.to} 复用节点 ${edge.from} 的 DP 空间（偏移 +1）`,
        phase: 'inherit',
        highlightedNodes: [edge.from, edge.to],
        highlightType: 'inherit',
        chainColors: new Map(colorMap),
        inheritEdges: [edge],
        queryPath: [],
      })
    }

    // Show all inherited edges together
    result.push({
      description: '所有继承指针：长儿子直接复用父亲的 DP 空间，总空间 O(n)',
      phase: 'inherit',
      highlightedNodes: [1, 2, 4, 5],
      highlightType: 'inherit',
      chainColors: new Map(colorMap),
      inheritEdges: inheritEdgesList,
      queryPath: [],
    })

    // Query demonstration
    const qNode = queryInput.node
    const qK = queryInput.k
    const path = getAncestors(qNode, qK)

    result.push({
      description: `k 级祖先查询: 求节点 ${qNode} 的第 ${qK} 级祖先`,
      phase: 'query',
      highlightedNodes: [qNode],
      highlightType: 'query',
      chainColors: new Map(colorMap),
      inheritEdges: [],
      queryPath: [qNode],
    })

    for (let i = 1; i < path.length; i++) {
      const partialPath = path.slice(0, i + 1)
      const isLast = i === path.length - 1
      result.push({
        description: isLast
          ? `找到! 节点 ${qNode} 的第 ${qK} 级祖先是节点 ${path[i]}`
          : `跳转: ${path[i - 1]} -> ${path[i]}`,
        phase: isLast ? 'done' : 'query',
        highlightedNodes: [path[i - 1], path[i]],
        highlightType: isLast ? 'path' : 'query',
        chainColors: new Map(colorMap),
        inheritEdges: [],
        queryPath: partialPath,
      })
    }

    return result
  }, [depth, heavy, queryInput])

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
    setDescription('长链剖分可视化 - 点击「开始演示」查看过程')
    setHighlightedNodes([])
    setHighlightType('none')
    setChainColors(new Map())
    setInheritEdges([])
    setQueryPath([])
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
      setInheritEdges(step.inheritEdges)
      setQueryPath(step.queryPath)
      setCurrentStep(1)
      return
    }
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setDescription(step.description)
      setHighlightedNodes(step.highlightedNodes)
      setHighlightType(step.highlightType)
      setChainColors(step.chainColors)
      setInheritEdges(step.inheritEdges)
      setQueryPath(step.queryPath)
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
      setInheritEdges(step.inheritEdges)
      setQueryPath(step.queryPath)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const getNodeColor = (id: number): string => {
    for (const [colorIdx, nodes] of chainColors) {
      if (nodes.includes(id)) {
        return CHAIN_COLORS[colorIdx % CHAIN_COLORS.length]
      }
    }
    if (highlightedNodes.includes(id)) {
      switch (highlightType) {
        case 'depth': return '#3b82f6'
        case 'heavy': return '#22c55e'
        case 'chain': return '#8b5cf6'
        case 'inherit': return '#f59e0b'
        case 'query': return '#ef4444'
        case 'path': return '#22c55e'
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
    // Check if this is an inherit edge
    for (const edge of inheritEdges) {
      if (edge.from === from && edge.to === to) return '#f59e0b'
    }
    // Check if this edge is on the query path
    if (queryPath.length >= 2) {
      for (let i = 0; i < queryPath.length - 1; i++) {
        if ((queryPath[i] === from && queryPath[i + 1] === to) ||
            (queryPath[i] === to && queryPath[i + 1] === from)) {
          return '#ef4444'
        }
      }
    }
    // Check if this is a heavy edge
    if (heavy[from] === to) {
      for (const [colorIdx, nodes] of chainColors) {
        if (nodes.includes(from) && nodes.includes(to)) {
          return CHAIN_COLORS[colorIdx % CHAIN_COLORS.length]
        }
      }
      return '#22c55e'
    }
    return 'var(--text-secondary)'
  }

  const isHeavyEdge = (from: number, to: number): boolean => {
    return heavy[from] === to
  }

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

      <div className="viz-controls" style={{ gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          查询节点:
          <select
            value={queryInput.node}
            onChange={(e) => setQueryInput(prev => ({ ...prev, node: Number(e.target.value) }))}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(id => (
              <option key={id} value={id}>节点 {id}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          k 级:
          <select
            value={queryInput.k}
            onChange={(e) => setQueryInput(prev => ({ ...prev, k: Number(e.target.value) }))}
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {[1, 2, 3, 4, 5].map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={800} height={380}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
            <marker id="arrow-inherit" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map((edge) => {
            const fromNode = nodeMap.get(edge.from)!
            const toNode = nodeMap.get(edge.to)!
            const edgeColor = getEdgeColor(edge.from, edge.to)
            const isHeavy = isHeavyEdge(edge.from, edge.to)
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y + 20}
                  x2={toNode.x}
                  y2={toNode.y - 20}
                  stroke={edgeColor}
                  strokeWidth={isHeavy ? 3.5 : 1.5}
                  strokeDasharray={isHeavy ? 'none' : '6,3'}
                />
                {/* Inherit arrow indicator */}
                {inheritEdges.some(e => e.from === edge.from && e.to === edge.to) && (
                  <text
                    x={(fromNode.x + toNode.x) / 2 + 15}
                    y={(fromNode.y + toNode.y) / 2}
                    fill="#f59e0b"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    继承
                  </text>
                )}
              </g>
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
                {/* Depth label */}
                {highlightType === 'depth' && isHighlighted && (
                  <text
                    x={node.x}
                    y={node.y - 30}
                    fill="var(--text-secondary)"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    depth={depth[node.id]}
                  </text>
                )}
                {/* Chain ID label */}
                {(highlightType === 'chain' || chainColors.size > 0) && (
                  (() => {
                    let chainLabel = ''
                    for (const [colorIdx, nodes] of chainColors) {
                      if (nodes.includes(node.id)) {
                        chainLabel = `链${colorIdx + 1}`
                        break
                      }
                    }
                    if (!chainLabel) return null
                    return (
                      <text
                        x={node.x + 25}
                        y={node.y - 10}
                        fill="var(--accent)"
                        fontSize="10"
                        textAnchor="start"
                        fontFamily="Consolas, Monaco, monospace"
                      >
                        {chainLabel}
                      </text>
                    )
                  })()
                )}
                {/* Query step indicator */}
                {queryPath.includes(node.id) && highlightType === 'query' && (
                  <text
                    x={node.x}
                    y={node.y + 35}
                    fill="#ef4444"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    step {queryPath.indexOf(node.id)}
                  </text>
                )}
              </g>
            )
          })}

          {/* Legend */}
          <g transform="translate(620, 40)">
            <text x={0} y={0} fill="var(--text-secondary)" fontSize="12" fontWeight="bold">图例</text>
            <line x1={0} y1={12} x2={25} y2={12} stroke="#22c55e" strokeWidth={3} />
            <text x={30} y={16} fill="var(--text-secondary)" fontSize="11">长边</text>
            <line x1={0} y1={28} x2={25} y2={28} stroke="var(--text-secondary)" strokeWidth={1.5} strokeDasharray="6,3" />
            <text x={30} y={32} fill="var(--text-secondary)" fontSize="11">非长边</text>
            <line x1={0} y1={44} x2={25} y2={44} stroke="#f59e0b" strokeWidth={2} />
            <text x={30} y={48} fill="var(--text-secondary)" fontSize="11">继承指针</text>
            <line x1={0} y1={60} x2={25} y2={60} stroke="#ef4444" strokeWidth={2} />
            <text x={30} y={64} fill="var(--text-secondary)" fontSize="11">查询路径</text>

            {Array.from(chainColors.entries()).map(([colorIdx, nodes], i) => (
              <g key={colorIdx} transform={`translate(0, ${80 + i * 18})`}>
                <rect x={0} y={-6} width={12} height={12} rx={2} fill={CHAIN_COLORS[colorIdx % CHAIN_COLORS.length]} />
                <text x={18} y={4} fill="var(--text-secondary)" fontSize="11">
                  长链 {colorIdx + 1}: {nodes.join('-')}
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
          深度计算
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          长儿子标记
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          长链着色
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          继承指针
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          查询路径
        </span>
      </div>
    </div>
  )
}
