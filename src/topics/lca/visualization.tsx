import { useState, useEffect, useRef, useCallback } from 'react'

interface TreeNode {
  id: number
  label: string
  children: number[]
  x: number
  y: number
}

interface AnimationStep {
  description: string
  highlightNodes: number[]
  highlightEdges: [number, number][]
  activeNode: number | null
  phase: 'idle' | 'align-depth' | 'jump' | 'found'
}

const TREE_NODES: TreeNode[] = [
  { id: 1, label: '1', children: [2, 3, 4], x: 300, y: 40 },
  { id: 2, label: '2', children: [5, 6], x: 140, y: 120 },
  { id: 3, label: '3', children: [], x: 300, y: 120 },
  { id: 4, label: '4', children: [7], x: 460, y: 120 },
  { id: 5, label: '5', children: [8, 9], x: 80, y: 200 },
  { id: 6, label: '6', children: [], x: 200, y: 200 },
  { id: 7, label: '7', children: [], x: 460, y: 200 },
  { id: 8, label: '8', children: [], x: 40, y: 280 },
  { id: 9, label: '9', children: [], x: 120, y: 280 },
]

const PARENT: Record<number, number | null> = {
  1: null, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 4, 8: 5, 9: 5,
}

const DEPTH: Record<number, number> = {
  1: 0, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 2, 8: 3, 9: 3,
}

// Build binary lifting table
function buildBinaryLiftTable(): Map<number, number[]> {
  const LOG = 4
  const table = new Map<number, number[]>()
  const nodeIds = TREE_NODES.map(n => n.id)

  for (const id of nodeIds) {
    table.set(id, new Array(LOG).fill(0))
  }

  // k=0
  for (const id of nodeIds) {
    table.get(id)![0] = PARENT[id] ?? 0
  }

  // k > 0
  for (let k = 1; k < LOG; k++) {
    for (const id of nodeIds) {
      const mid = table.get(id)![k - 1]
      table.get(id)![k] = mid === 0 ? 0 : table.get(mid)![k - 1]
    }
  }

  return table
}

const LIFT_TABLE = buildBinaryLiftTable()

function getDepth(node: number): number {
  return DEPTH[node] ?? 0
}

export default function LCAVisualization() {
  const [queryU, setQueryU] = useState(8)
  const [queryV, setQueryV] = useState(7)
  const [description, setDescription] = useState('选择两个节点，点击「开始查询」观察倍增法求 LCA 的过程')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightNodes, setHighlightNodes] = useState<number[]>([])
  const [highlightEdges, setHighlightEdges] = useState<[number, number][]>([])
  const [activeNode, setActiveNode] = useState<number | null>(null)
  const [phase, setPhase] = useState<'idle' | 'align-depth' | 'jump' | 'found'>('idle')
  const [liftTableVisible, setLiftTableVisible] = useState(false)
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((u: number, v: number): AnimationStep[] => {
    const result: AnimationStep[] = []
    let cu = u
    let cv = v
    const LOG = 4

    result.push({
      description: `开始查询 LCA(${u}, ${v})，初始: u=${cu}, v=${cv}`,
      highlightNodes: [u, v],
      highlightEdges: [],
      activeNode: null,
      phase: 'idle',
    })

    // Align depths
    let du = getDepth(cu)
    let dv = getDepth(cv)

    if (du < dv) {
      ;[cu, cv] = [cv, cu]
      ;[du, dv] = [dv, du]
      result.push({
        description: `交换 u 和 v，保证 u 深度 >= v 深度: u=${cu}(深度${du}), v=${cv}(深度${dv})`,
        highlightNodes: [cu, cv],
        highlightEdges: [],
        activeNode: cu,
        phase: 'align-depth',
      })
    }

    let diff = du - dv
    for (let k = LOG - 1; k >= 0; k--) {
      if ((diff >> k) & 1) {
        const from = cu
        cu = LIFT_TABLE.get(cu)![k]
        result.push({
          description: `对齐深度: u 从 ${from} 跳 2^${k}=${1 << k} 步到 ${cu}，depth(u)=${getDepth(cu)}`,
          highlightNodes: [cu, cv],
          highlightEdges: [[from, cu]],
          activeNode: cu,
          phase: 'align-depth',
        })
      }
    }

    if (cu === cv) {
      result.push({
        description: `对齐深度后 u === v === ${cu}，LCA 就是 ${cu}`,
        highlightNodes: [cu],
        highlightEdges: [],
        activeNode: cu,
        phase: 'found',
      })
      return result
    }

    // Binary lift jump
    for (let k = LOG - 1; k >= 0; k--) {
      const au = LIFT_TABLE.get(cu)![k]
      const av = LIFT_TABLE.get(cv)![k]
      if (au !== av) {
        const prevU = cu
        const prevV = cv
        cu = au
        cv = av
        result.push({
          description: `k=${k}: f[u][${k}]=${cu}, f[v][${k}]=${cv}，祖先不同，跳跃`,
          highlightNodes: [cu, cv],
          highlightEdges: [[prevU, cu], [prevV, cv]],
          activeNode: null,
          phase: 'jump',
        })
      }
    }

    // Result
    const lcaNode = LIFT_TABLE.get(cu)![0]
    result.push({
      description: `u=${cu}, v=${cv}，parent(u)=parent(v)=${lcaNode}，LCA(${u}, ${v}) = ${lcaNode}`,
      highlightNodes: [lcaNode],
      highlightEdges: [],
      activeNode: lcaNode,
      phase: 'found',
    })

    return result
  }, [])

  const executeSteps = useCallback((animSteps: AnimationStep[]) => {
    setSteps(animSteps)
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
      setDescription(step.description)
      setHighlightNodes(step.highlightNodes)
      setHighlightEdges(step.highlightEdges)
      setActiveNode(step.activeNode)
      setPhase(step.phase)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleQuery = () => {
    const animSteps = generateSteps(queryU, queryV)
    executeSteps(animSteps)
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setHighlightNodes([])
    setHighlightEdges([])
    setActiveNode(null)
    setPhase('idle')
    setDescription('选择两个节点，点击「开始查询」观察倍增法求 LCA 的过程')
    setSteps([])
    setCurrentStep(0)
  }

  const getNodeColor = (nodeId: number): string => {
    if (phase === 'found' && highlightNodes.includes(nodeId)) return '#22c55e'
    if (activeNode === nodeId) return '#3b82f6'
    if (highlightNodes.includes(nodeId)) return '#f59e0b'
    if (nodeId === queryU) return '#8b5cf6'
    if (nodeId === queryV) return '#ec4899'
    return 'var(--bg-card)'
  }

  const getNodeBorder = (nodeId: number): string => {
    if (phase === 'found' && highlightNodes.includes(nodeId)) return '#4ade80'
    if (activeNode === nodeId) return '#60a5fa'
    if (highlightNodes.includes(nodeId)) return '#fbbf24'
    if (nodeId === queryU) return '#a78bfa'
    if (nodeId === queryV) return '#f472b6'
    return 'var(--border)'
  }

  const isEdgeHighlighted = (from: number, to: number): boolean => {
    return highlightEdges.some(([a, b]) => (a === from && b === to) || (a === to && b === from))
  }

  const nodeRadius = 20

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          节点 u:
          <select
            value={queryU}
            onChange={e => setQueryU(Number(e.target.value))}
            style={{ padding: '0.25rem 0.5rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {TREE_NODES.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          节点 v:
          <select
            value={queryV}
            onChange={e => setQueryV(Number(e.target.value))}
            style={{ padding: '0.25rem 0.5rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {TREE_NODES.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
          </select>
        </label>
        <button className="btn btn-primary" onClick={handleQuery} disabled={isPlaying}>
          开始查询
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <button className="btn btn-secondary" onClick={() => setLiftTableVisible(!liftTableVisible)}>
          {liftTableVisible ? '隐藏' : '查看'}倍增表
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="200"
            max="2000"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={600} height={340}>
          <defs>
            <marker id="lca-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
          </defs>

          {/* Edges */}
          {TREE_NODES.map(node =>
            node.children.map(childId => {
              const child = TREE_NODES.find(n => n.id === childId)
              if (!child) return null
              const highlighted = isEdgeHighlighted(node.id, childId)
              return (
                <line
                  key={`${node.id}-${childId}`}
                  x1={node.x}
                  y1={node.y + nodeRadius}
                  x2={child.x}
                  y2={child.y - nodeRadius}
                  stroke={highlighted ? '#f59e0b' : 'var(--text-secondary)'}
                  strokeWidth={highlighted ? 3 : 1.5}
                  markerEnd={highlighted ? undefined : undefined}
                />
              )
            })
          )}

          {/* Nodes */}
          {TREE_NODES.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeRadius}
                fill={getNodeColor(node.id)}
                stroke={getNodeBorder(node.id)}
                strokeWidth={activeNode === node.id || highlightNodes.includes(node.id) ? 3 : 1.5}
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
              <text
                x={node.x}
                y={node.y - nodeRadius - 6}
                fill="var(--text-secondary)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                d={getDepth(node.id)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          节点 u
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ec4899', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          节点 v
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前活跃
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          跳跃路径
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          找到 LCA
        </span>
      </div>

      {liftTableVisible && (
        <div className="viz-info" style={{ fontSize: '0.8rem', marginTop: '0.5rem', overflowX: 'auto' }}>
          <strong>倍增表 f[v][k]：</strong>
          <table style={{ marginTop: '0.5rem', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '4px 8px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>v</th>
                {[0, 1, 2, 3].map(k => (
                  <th key={k} style={{ padding: '4px 8px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>k={k} (2^{k}={1 << k})</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TREE_NODES.map(n => (
                <tr key={n.id}>
                  <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--border)', textAlign: 'center', fontWeight: 'bold' }}>{n.id}</td>
                  {[0, 1, 2, 3].map(k => {
                    const val = LIFT_TABLE.get(n.id)?.[k] ?? 0
                    return (
                      <td key={k} style={{ padding: '4px 8px', borderBottom: '1px solid var(--border)', textAlign: 'center', fontFamily: 'Consolas, Monaco, monospace' }}>
                        {val === 0 ? '-' : val}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
