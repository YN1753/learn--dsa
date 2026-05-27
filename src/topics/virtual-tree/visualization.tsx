import { useState, useEffect, useRef, useCallback } from 'react'

interface VNode {
  id: number
  x: number
  y: number
  label: string
  isKey: boolean
  isLCA: boolean
  depth: number
}

interface VEdge {
  from: number
  to: number
  weight: number
}

interface AnimationStep {
  description: string
  nodes: VNode[]
  edges: VEdge[]
  highlightNodes: number[]
  highlightType: 'key' | 'lca' | 'processing' | 'stack' | 'done' | 'none'
  stackState: number[]
  sortedKeyNodes: number[]
}

const TREE_NODES: VNode[] = [
  { id: 0, x: 400, y: 40, label: '0', isKey: false, isLCA: false, depth: 0 },
  { id: 1, x: 200, y: 120, label: '1', isKey: false, isLCA: false, depth: 1 },
  { id: 2, x: 400, y: 120, label: '2', isKey: false, isLCA: false, depth: 1 },
  { id: 3, x: 600, y: 120, label: '3', isKey: false, isLCA: false, depth: 1 },
  { id: 4, x: 120, y: 200, label: '4', isKey: true, isLCA: false, depth: 2 },
  { id: 5, x: 280, y: 200, label: '5', isKey: true, isLCA: false, depth: 2 },
  { id: 6, x: 340, y: 200, label: '6', isKey: false, isLCA: false, depth: 2 },
  { id: 7, x: 460, y: 200, label: '7', isKey: true, isLCA: false, depth: 2 },
  { id: 8, x: 600, y: 200, label: '8', isKey: true, isLCA: false, depth: 2 },
]

const TREE_EDGES: VEdge[] = [
  { from: 0, to: 1, weight: 1 },
  { from: 0, to: 2, weight: 1 },
  { from: 0, to: 3, weight: 1 },
  { from: 1, to: 4, weight: 1 },
  { from: 1, to: 5, weight: 1 },
  { from: 2, to: 6, weight: 1 },
  { from: 2, to: 7, weight: 1 },
  { from: 3, to: 8, weight: 1 },
]

const DFN_MAP: Record<number, number> = {
  0: 0, 1: 1, 2: 4, 3: 7, 4: 2, 5: 3, 6: 5, 7: 6, 8: 8,
}

const PARENT: Record<number, number> = {
  1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 2, 7: 2, 8: 3,
}

function getLCA(u: number, v: number): number {
  const visited = new Set<number>()
  let a = u
  let b = v
  while (true) {
    if (a !== 0) {
      if (visited.has(a)) return a
      visited.add(a)
      a = PARENT[a] ?? 0
    }
    if (b !== 0) {
      if (visited.has(b)) return b
      visited.add(b)
      b = PARENT[b] ?? 0
    }
    if (a === 0 && b === 0) return 0
  }
}

const DEFAULT_KEY_NODES = [4, 5, 7, 8]

export default function VirtualTreeVisualization() {
  const [keyNodes, setKeyNodes] = useState<number[]>(DEFAULT_KEY_NODES)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [description, setDescription] = useState('选择关键节点，点击「构建虚树」开始')
  const [_showVT, setShowVT] = useState(false)
  const [_vtNodes, setVtNodes] = useState<VNode[]>([])
  const [vtEdges, setVtEdges] = useState<VEdge[]>([])
  const [highlightNodes, setHighlightNodes] = useState<number[]>([])
  const [highlightType, setHighlightType] = useState<'key' | 'lca' | 'processing' | 'stack' | 'done' | 'none'>('none')
  const [stackState, setStackState] = useState<number[]>([])
  const timerRef = useRef<number | null>(null)

  const toggleKeyNode = (id: number) => {
    if (isPlaying) return
    setKeyNodes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id])
    setShowVT(false)
    setVtNodes([])
    setVtEdges([])
    setHighlightNodes([])
    setHighlightType('none')
    setStackState([])
    setDescription(`关键节点: [${(keyNodes.includes(id) ? keyNodes.filter(n => n !== id) : [...keyNodes, id]).join(', ')}]`)
  }

  const buildVirtualTree = useCallback(() => {
    if (keyNodes.length < 2) {
      setDescription('请至少选择 2 个关键节点')
      return
    }

    const sorted = [...keyNodes].sort((a, b) => DFN_MAP[a] - DFN_MAP[b])
    const allNodes = TREE_NODES.map(n => ({ ...n, isKey: false, isLCA: false }))
    sorted.forEach(id => {
      const node = allNodes.find(n => n.id === id)
      if (node) node.isKey = true
    })

    const generatedSteps: AnimationStep[] = []

    generatedSteps.push({
      description: `关键节点按 DFS 序排序: [${sorted.join(', ')}]`,
      nodes: allNodes.map(n => ({ ...n })),
      edges: [],
      highlightNodes: sorted,
      highlightType: 'key',
      stackState: [],
      sortedKeyNodes: sorted,
    })

    const stack: number[] = [sorted[0]]
    const edges: VEdge[] = []
    const vtNodeSet = new Set<number>([sorted[0]])

    generatedSteps.push({
      description: `将 ${sorted[0]} 压入栈`,
      nodes: allNodes.map(n => ({ ...n })),
      edges: [],
      highlightNodes: [sorted[0]],
      highlightType: 'stack',
      stackState: [...stack],
      sortedKeyNodes: sorted,
    })

    for (let i = 1; i < sorted.length; i++) {
      const node = sorted[i]
      const top = stack[stack.length - 1]
      const lca = getLCA(node, top)

      generatedSteps.push({
        description: `处理节点 ${node}，LCA(${node}, ${top}) = ${lca}`,
        nodes: allNodes.map(n => ({ ...n })),
        edges: edges.map(e => ({ ...e })),
        highlightNodes: [node, top],
        highlightType: 'processing',
        stackState: [...stack],
        sortedKeyNodes: sorted,
      })

      if (lca === top) {
        stack.push(node)
        vtNodeSet.add(node)
        generatedSteps.push({
          description: `LCA 就是栈顶 ${top}，将 ${node} 直接压入栈`,
          nodes: allNodes.map(n => ({ ...n })),
          edges: edges.map(e => ({ ...e })),
          highlightNodes: [node],
          highlightType: 'stack',
          stackState: [...stack],
          sortedKeyNodes: sorted,
        })
      } else {
        while (stack.length >= 2 && TREE_NODES[stack[stack.length - 2]].depth >= TREE_NODES[lca].depth) {
          const from = stack[stack.length - 2]
          const to = stack[stack.length - 1]
          const w = TREE_NODES[to].depth - TREE_NODES[from].depth
          edges.push({ from, to, weight: w })
          generatedSteps.push({
            description: `弹出 ${to}，连边 ${from} -> ${to} (权=${w})`,
            nodes: allNodes.map(n => ({ ...n })),
            edges: edges.map(e => ({ ...e })),
            highlightNodes: [from, to],
            highlightType: 'done',
            stackState: stack.slice(0, -1),
            sortedKeyNodes: sorted,
          })
          stack.pop()
        }

        if (stack[stack.length - 1] !== lca) {
          const to = stack[stack.length - 1]
          const w = TREE_NODES[to].depth - TREE_NODES[lca].depth
          edges.push({ from: lca, to, weight: w })
          const lcaNode = allNodes.find(n => n.id === lca)
          if (lcaNode) lcaNode.isLCA = true
          vtNodeSet.add(lca)

          generatedSteps.push({
            description: `插入 LCA 节点 ${lca}，连边 ${lca} -> ${to} (权=${w})`,
            nodes: allNodes.map(n => ({ ...n })),
            edges: edges.map(e => ({ ...e })),
            highlightNodes: [lca],
            highlightType: 'lca',
            stackState: stack.slice(0, -1),
            sortedKeyNodes: sorted,
          })

          stack.pop()
          stack.push(lca)
        }

        stack.push(node)
        vtNodeSet.add(node)
        generatedSteps.push({
          description: `将 ${node} 压入栈`,
          nodes: allNodes.map(n => ({ ...n })),
          edges: edges.map(e => ({ ...e })),
          highlightNodes: [node],
          highlightType: 'stack',
          stackState: [...stack],
          sortedKeyNodes: sorted,
        })
      }
    }

    while (stack.length >= 2) {
      const from = stack[stack.length - 2]
      const to = stack[stack.length - 1]
      const w = TREE_NODES[to].depth - TREE_NODES[from].depth
      edges.push({ from, to, weight: w })
      generatedSteps.push({
        description: `处理栈中剩余: 连边 ${from} -> ${to} (权=${w})`,
        nodes: allNodes.map(n => ({ ...n })),
        edges: edges.map(e => ({ ...e })),
        highlightNodes: [from, to],
        highlightType: 'done',
        stackState: stack.slice(0, -1),
        sortedKeyNodes: sorted,
      })
      stack.pop()
    }

    generatedSteps.push({
      description: `虚树构建完成！共 ${vtNodeSet.size} 个节点 (${sorted.length} 关键节点 + ${vtNodeSet.size - sorted.length} LCA)，${edges.length} 条边`,
      nodes: allNodes.map(n => ({ ...n })),
      edges: edges.map(e => ({ ...e })),
      highlightNodes: [...vtNodeSet],
      highlightType: 'done',
      stackState: [],
      sortedKeyNodes: sorted,
    })

    setSteps(generatedSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setShowVT(false)
  }, [keyNodes])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      const lastStep = steps[steps.length - 1]
      setVtNodes(lastStep.nodes)
      setVtEdges(lastStep.edges)
      setShowVT(true)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setHighlightNodes(step.highlightNodes)
      setHighlightType(step.highlightType)
      setStackState(step.stackState)
      setVtEdges(step.edges)
      setDescription(step.description)
      setVtNodes(step.nodes)
      setShowVT(step.edges.length > 0)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (steps.length === 0 || currentStep >= steps.length) return
    setIsPlaying(false)
    const step = steps[currentStep]
    setHighlightNodes(step.highlightNodes)
    setHighlightType(step.highlightType)
    setStackState(step.stackState)
    setVtEdges(step.edges)
    setDescription(step.description)
    setVtNodes(step.nodes)
    setShowVT(step.edges.length > 0)
    setCurrentStep(prev => prev + 1)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setShowVT(false)
    setVtNodes([])
    setVtEdges([])
    setHighlightNodes([])
    setHighlightType('none')
    setStackState([])
    setDescription('已重置，选择关键节点后点击「构建虚树」')
  }

  const nodeRadius = 18

  const getNodeColor = (node: VNode): string => {
    if (highlightNodes.includes(node.id)) {
      switch (highlightType) {
        case 'key': return '#3b82f6'
        case 'lca': return '#22c55e'
        case 'processing': return '#f59e0b'
        case 'stack': return '#8b5cf6'
        case 'done': return '#10b981'
        default: return 'var(--bg-card)'
      }
    }
    if (node.isKey) return '#3b82f6'
    if (node.isLCA) return '#22c55e'
    return 'var(--bg-card)'
  }

  const getNodeBorder = (node: VNode): string => {
    if (highlightNodes.includes(node.id)) {
      switch (highlightType) {
        case 'key': return '#60a5fa'
        case 'lca': return '#4ade80'
        case 'processing': return '#fbbf24'
        case 'stack': return '#a78bfa'
        case 'done': return '#34d399'
        default: return 'var(--border)'
      }
    }
    if (node.isKey) return '#60a5fa'
    if (node.isLCA) return '#4ade80'
    return 'var(--border)'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: '0.5rem' }}>关键节点:</span>
        {TREE_NODES.filter(n => !TREE_EDGES.some(e => e.from === n.id)).map(n => (
          <button
            key={n.id}
            className={`btn ${keyNodes.includes(n.id) ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => toggleKeyNode(n.id)}
            disabled={isPlaying}
            style={{ minWidth: '3rem' }}
          >
            {n.label}
          </button>
        ))}
        <button className="btn btn-primary" onClick={buildVirtualTree} disabled={isPlaying || keyNodes.length < 2}>
          构建虚树
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length}>
          下一步
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
            min="300"
            max="2500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={800} height={280}>
          <defs>
            <marker id="vt-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
            <marker id="vt-arrow-highlight" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
            </marker>
          </defs>

          {/* 原树边 */}
          {TREE_EDGES.map((edge, i) => {
            const fromNode = TREE_NODES[edge.from]
            const toNode = TREE_NODES[edge.to]
            const isVtEdge = vtEdges.some(e =>
              (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
            )
            return (
              <line
                key={`te-${i}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={isVtEdge ? '#10b981' : 'var(--border)'}
                strokeWidth={isVtEdge ? 3 : 1}
                strokeDasharray={isVtEdge ? undefined : '4,4'}
                opacity={isVtEdge ? 1 : 0.4}
              />
            )
          })}

          {/* 节点 */}
          {TREE_NODES.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill={getNodeColor(node)}
                stroke={getNodeBorder(node)}
                strokeWidth={highlightNodes.includes(node.id) ? 3 : 1.5}
              />
              <text
                x={node.x}
                y={node.y + 5}
                fill={highlightNodes.includes(node.id) || node.isKey || node.isLCA ? '#fff' : 'var(--text-primary)'}
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                {node.label}
              </text>
              <text
                x={node.x}
                y={node.y - nodeRadius - 6}
                fill="var(--text-secondary)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                dfn:{DFN_MAP[node.id]}
              </text>
            </g>
          ))}

          {/* 虚树边权标注 */}
          {vtEdges.map((edge, i) => {
            const fromNode = TREE_NODES[edge.from]
            const toNode = TREE_NODES[edge.to]
            const mx = (fromNode.x + toNode.x) / 2
            const my = (fromNode.y + toNode.y) / 2
            return (
              <text
                key={`wt-${i}`}
                x={mx + 8}
                y={my - 4}
                fill="#10b981"
                fontSize="11"
                fontWeight="bold"
                fontFamily="Consolas, Monaco, monospace"
              >
                w={edge.weight}
              </text>
            )
          })}
        </svg>
      </div>

      {stackState.length > 0 && (
        <div className="viz-info" style={{ marginBottom: '0.5rem' }}>
          <strong>栈状态：</strong>
          [{stackState.map(id => TREE_NODES[id]?.label ?? id).join(' -> ')}] (栈顶在右)
        </div>
      )}

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          关键节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          LCA 节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          栈中节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          正在处理
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#10b981', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          完成
        </span>
      </div>
    </div>
  )
}
