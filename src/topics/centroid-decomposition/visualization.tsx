import { useState, useEffect, useRef, useCallback } from 'react'

interface Edge {
  from: number
  to: number
}

interface NodeState {
  id: number
  x: number
  y: number
  size: number
  status: 'normal' | 'centroid' | 'removed' | 'checking' | 'in-subtree'
  subtreeLabel?: string
}

interface AnimationStep {
  description: string
  nodes: NodeState[]
  edges: Edge[]
  highlightEdges: [number, number][]
}

const TREE_EDGES: Edge[] = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 2, to: 5 },
  { from: 3, to: 6 },
  { from: 3, to: 7 },
  { from: 5, to: 8 },
]

const BASE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 400, y: 60 },
  2: { x: 250, y: 170 },
  3: { x: 550, y: 170 },
  4: { x: 150, y: 280 },
  5: { x: 350, y: 280 },
  6: { x: 480, y: 280 },
  7: { x: 620, y: 280 },
  8: { x: 350, y: 380 },
}

const NODE_COUNT = 8

function buildAdjList(edges: Edge[]): Map<number, number[]> {
  const adj = new Map<number, number[]>()
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, [])
    if (!adj.has(e.to)) adj.set(e.to, [])
    adj.get(e.from)!.push(e.to)
    adj.get(e.to)!.push(e.from)
  }
  return adj
}

function getSubtreeSizes(
  adj: Map<number, number[]>,
  node: number,
  parent: number,
  removed: Set<number>
): Map<number, number> {
  const sizes = new Map<number, number>()
  let size = 1
  for (const child of adj.get(node) || []) {
    if (child !== parent && !removed.has(child)) {
      const childSizes = getSubtreeSizes(adj, child, node, removed)
      for (const [k, v] of childSizes) sizes.set(k, v)
      size += childSizes.get(child)!
    }
  }
  sizes.set(node, size)
  return sizes
}

function getComponentNodes(
  adj: Map<number, number[]>,
  start: number,
  removed: Set<number>
): number[] {
  const result: number[] = []
  const visited = new Set<number>()
  const queue = [start]
  while (queue.length > 0) {
    const node = queue.shift()!
    if (visited.has(node) || removed.has(node)) continue
    visited.add(node)
    result.push(node)
    for (const child of adj.get(node) || []) {
      if (!visited.has(child) && !removed.has(child)) queue.push(child)
    }
  }
  return result
}

function getNodesSubtreeOfCentroid(
  adj: Map<number, number[]>,
  centroid: number,
  removed: Set<number>
): Map<number, number> {
  const result = new Map<number, number>()
  for (const child of adj.get(centroid) || []) {
    if (!removed.has(child)) {
      const component = getComponentNodes(adj, child, removed)
      for (const n of component) result.set(n, child)
    }
  }
  return result
}

function buildAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = []
  const adj = buildAdjList(TREE_EDGES)
  const removed = new Set<number>()

  const makeBaseNodes = (overrides: Partial<Record<number, Partial<NodeState>>> = {}): NodeState[] => {
    return Array.from({ length: NODE_COUNT }, (_, i) => {
      const id = i + 1
      const pos = BASE_POSITIONS[id]
      const ov = overrides[id] || {}
      return {
        id,
        x: pos.x,
        y: pos.y,
        size: 0,
        status: removed.has(id) ? 'removed' : 'normal',
        ...ov,
      }
    })
  }

  // Initial state
  steps.push({
    description: '初始树结构，共 8 个节点。接下来将通过点分治逐步分解。',
    nodes: makeBaseNodes(),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  // Round 1: find centroid starting from node 1
  const comp1 = getComponentNodes(adj, 1, removed)
  steps.push({
    description: `第 1 层分治：当前连通分量包含节点 [${comp1.join(', ')}]，大小为 ${comp1.length}。从节点 1 开始查找重心。`,
    nodes: makeBaseNodes({ 1: { status: 'checking' } }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  // Check node 1 - subtree sizes
  const sizes1 = getSubtreeSizes(adj, 1, -1, removed)
  const subtreeOf1 = getNodesSubtreeOfCentroid(adj, 1, removed)
  const childInfo1 = adj.get(1)!.filter(c => !removed.has(c)).map(c => `子树${c}: ${sizes1.get(c)}个`).join(', ')
  steps.push({
    description: `检查节点 1：各子树大小为 ${childInfo1}。最大子树大小 ${Math.max(...adj.get(1)!.filter(c => !removed.has(c)).map(c => sizes1.get(c)!))} > ${Math.floor(comp1.length / 2)}，不是重心，向最大子树方向移动。`,
    nodes: makeBaseNodes({
      ...Object.fromEntries([...subtreeOf1.entries()].map(([n]) => [n, { status: 'in-subtree' as const }])),
      1: { status: 'checking' },
    }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  // Check node 2
  const subtreeOf2 = getNodesSubtreeOfCentroid(adj, 2, removed)
  const sizes2 = getSubtreeSizes(adj, 2, -1, removed)
  const childInfo2 = adj.get(2)!.filter(c => !removed.has(c)).map(c => `子树${c}: ${sizes2.get(c)}个`).join(', ')
  steps.push({
    description: `检查节点 2：各子树大小为 ${childInfo2}。最大子树大小 ${Math.max(...adj.get(2)!.filter(c => !removed.has(c)).map(c => sizes2.get(c)!))} <= ${Math.floor(comp1.length / 2)}，节点 2 是重心！`,
    nodes: makeBaseNodes({
      ...Object.fromEntries([...subtreeOf2.entries()].map(([n]) => [n, { status: 'in-subtree' as const }])),
      2: { status: 'checking' },
    }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  // Centroid found
  steps.push({
    description: `重心为节点 2，删除节点 2 后，剩余子树为：[4], [5, 8], [1, 3, 6, 7]。`,
    nodes: makeBaseNodes({ 2: { status: 'centroid' } }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  removed.add(2)
  steps.push({
    description: `标记节点 2 为已处理。剩余 3 个连通分量需要继续分治。`,
    nodes: makeBaseNodes(),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  // Round 2: component [4]
  steps.push({
    description: `第 2 层分治：处理连通分量 [4]，大小为 1，节点 4 就是重心。`,
    nodes: makeBaseNodes({ 4: { status: 'centroid' } }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  removed.add(4)

  // Round 2: component [5, 8]
  steps.push({
    description: `第 2 层分治：处理连通分量 [5, 8]，大小为 2。`,
    nodes: makeBaseNodes({ 5: { status: 'checking' } }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  steps.push({
    description: `节点 5 的子树 [8] 大小为 1 <= 1，节点 5 是重心。`,
    nodes: makeBaseNodes({ 5: { status: 'centroid' } }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  removed.add(5)

  steps.push({
    description: `处理最后一个节点 8，大小为 1，节点 8 是重心。`,
    nodes: makeBaseNodes({ 8: { status: 'centroid' } }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  removed.add(8)

  // Round 2: component [1, 3, 6, 7]
  steps.push({
    description: `第 2 层分治：处理连通分量 [1, 3, 6, 7]，大小为 4。从节点 1 开始查找重心。`,
    nodes: makeBaseNodes({ 1: { status: 'checking' } }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  steps.push({
    description: `节点 1 的子树 [3, 6, 7] 大小为 3 > 2，不是重心。向节点 3 方向移动。`,
    nodes: makeBaseNodes({ 1: { status: 'checking' }, 3: { status: 'in-subtree' }, 6: { status: 'in-subtree' }, 7: { status: 'in-subtree' } }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  steps.push({
    description: `节点 3 的子树 [6] 和 [7] 大小分别为 1 和 1，均 <= 2。节点 3 是重心！`,
    nodes: makeBaseNodes({ 3: { status: 'centroid' } }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  removed.add(3)

  steps.push({
    description: `处理剩余节点 1、6、7，各自大小为 1，直接作为重心处理。`,
    nodes: makeBaseNodes({ 1: { status: 'centroid' }, 6: { status: 'centroid' }, 7: { status: 'centroid' } }),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  // Final
  steps.push({
    description: `点分治完成！处理顺序为 2 -> 4 -> 5 -> 8 -> 3 -> 1 -> 6 -> 7。每层递归处理 O(n) 个节点，共 O(log n) 层，总复杂度 O(n log n)。`,
    nodes: makeBaseNodes(),
    edges: [...TREE_EDGES],
    highlightEdges: [],
  })

  return steps
}

export default function CentroidDecompositionVisualization() {
  const [steps] = useState<AnimationStep[]>(() => buildAnimationSteps())
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const timerRef = useRef<number | null>(null)

  const step = steps[currentStep] || steps[0]

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

  const handleStepBack = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const getNodeColor = (status: NodeState['status']): string => {
    switch (status) {
      case 'centroid': return '#22c55e'
      case 'removed': return '#6b7280'
      case 'checking': return '#3b82f6'
      case 'in-subtree': return '#f59e0b'
      default: return 'var(--bg-card)'
    }
  }

  const getNodeBorder = (status: NodeState['status']): string => {
    switch (status) {
      case 'centroid': return '#4ade80'
      case 'removed': return '#9ca3af'
      case 'checking': return '#60a5fa'
      case 'in-subtree': return '#fbbf24'
      default: return 'var(--border)'
    }
  }

  const svgWidth = 800
  const svgHeight = 440

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying && currentStep < steps.length - 1}>
          {currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={handlePause} disabled={!isPlaying}>
          暂停
        </button>
        <button className="btn btn-secondary" onClick={handleStepBack} disabled={currentStep === 0}>
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
            min="400"
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
            <marker id="edge-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" opacity="0.5" />
            </marker>
          </defs>

          {/* Edges */}
          {step.edges.map((edge, i) => {
            const fromNode = step.nodes.find(n => n.id === edge.from)
            const toNode = step.nodes.find(n => n.id === edge.to)
            if (!fromNode || !toNode) return null
            if (fromNode.status === 'removed' || toNode.status === 'removed') return null

            const isHighlighted = step.highlightEdges.some(
              ([a, b]) => (a === edge.from && b === edge.to) || (a === edge.to && b === edge.from)
            )

            return (
              <line
                key={`edge-${i}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={isHighlighted ? '#f59e0b' : 'var(--text-secondary)'}
                strokeWidth={isHighlighted ? 3 : 2}
                opacity={isHighlighted ? 1 : 0.4}
              />
            )
          })}

          {/* Nodes */}
          {step.nodes.map(node => {
            if (node.status === 'removed') {
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={22}
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    opacity={0.4}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    fill="#6b7280"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                    opacity={0.4}
                  >
                    {node.id}
                  </text>
                </g>
              )
            }

            const radius = node.status === 'centroid' ? 26 : 22

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={getNodeColor(node.status)}
                  stroke={getNodeBorder(node.status)}
                  strokeWidth={node.status === 'centroid' || node.status === 'checking' ? 3 : 2}
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
                  {node.id}
                </text>
                {node.status === 'centroid' && (
                  <text
                    x={node.x}
                    y={node.y - 32}
                    fill="#22c55e"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    重心
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
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          正在检查
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          子树节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          重心
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#6b7280', borderRadius: 6, marginRight: 4, verticalAlign: 'middle', border: '1px dashed #9ca3af' }} />
          已移除
        </span>
      </div>
    </div>
  )
}
