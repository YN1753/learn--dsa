import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface AVLNodeData {
  value: number
  left: AVLNodeData | null
  right: AVLNodeData | null
  height: number
  id: string
}

interface AVLStep {
  description: string
  phase: 'insert' | 'delete' | 'rotate' | 'idle'
  tree: AVLNodeData | null
  highlights: { nodeId: string; color: string }[]
  insertedKey?: number
  deletedKey?: number
}

let nodeIdCounter = 0
function generateNodeId(): string {
  return `node-${nodeIdCounter++}`
}

function getHeight(node: AVLNodeData | null): number {
  return node ? node.height : -1
}

function updateHeight(node: AVLNodeData): void {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right))
}

function getBalanceFactor(node: AVLNodeData | null): number {
  return node ? getHeight(node.left) - getHeight(node.right) : 0
}

function cloneTree(node: AVLNodeData | null): AVLNodeData | null {
  if (!node) return null
  return {
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    height: node.height,
    id: node.id,
  }
}

function findImbalanced(node: AVLNodeData | null, imbalanced: string[]): void {
  if (!node) return
  const bf = getBalanceFactor(node)
  if (Math.abs(bf) >= 2) {
    imbalanced.push(node.id)
  }
  findImbalanced(node.left, imbalanced)
  findImbalanced(node.right, imbalanced)
}

class AVLDemo {
  root: AVLNodeData | null = null

  private rotateRight(y: AVLNodeData): AVLNodeData {
    const x = y.left!
    const T2 = x.right
    x.right = y
    y.left = T2
    updateHeight(y)
    updateHeight(x)
    return x
  }

  private rotateLeft(x: AVLNodeData): AVLNodeData {
    const y = x.right!
    const T2 = y.left
    y.left = x
    x.right = T2
    updateHeight(x)
    updateHeight(y)
    return y
  }

  private balance(node: AVLNodeData, steps: AVLStep[]): AVLNodeData {
    updateHeight(node)
    const bf = getBalanceFactor(node)

    if (bf > 1 && getBalanceFactor(node.left) >= 0) {
      steps.push({
        description: `节点 ${node.value} 失衡 (BF=${bf}), 执行 LL 右旋`,
        phase: 'rotate',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: node.id, color: '#ef4444' }],
      })
      return this.rotateRight(node)
    }

    if (bf < -1 && getBalanceFactor(node.right) <= 0) {
      steps.push({
        description: `节点 ${node.value} 失衡 (BF=${bf}), 执行 RR 左旋`,
        phase: 'rotate',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: node.id, color: '#ef4444' }],
      })
      return this.rotateLeft(node)
    }

    if (bf > 1 && getBalanceFactor(node.left) < 0) {
      steps.push({
        description: `节点 ${node.value} 失衡 (BF=${bf}), 执行 LR 先左旋后右旋`,
        phase: 'rotate',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: node.id, color: '#ef4444' }],
      })
      node.left = this.rotateLeft(node.left!)
      return this.rotateRight(node)
    }

    if (bf < -1 && getBalanceFactor(node.right) > 0) {
      steps.push({
        description: `节点 ${node.value} 失衡 (BF=${bf}), 执行 RL 先右旋后左旋`,
        phase: 'rotate',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: node.id, color: '#ef4444' }],
      })
      node.right = this.rotateRight(node.right!)
      return this.rotateLeft(node)
    }

    return node
  }

  insertWithSteps(value: number): AVLStep[] {
    const steps: AVLStep[] = []
    steps.push({
      description: `准备插入值 ${value}`,
      phase: 'insert',
      tree: cloneTree(this.root),
      highlights: [],
      insertedKey: value,
    })

    this.root = this.insertNode(this.root, value, steps)

    steps.push({
      description: `值 ${value} 插入完成`,
      phase: 'insert',
      tree: cloneTree(this.root),
      highlights: this.root ? [{ nodeId: this.findNode(this.root, value)!, color: '#22c55e' }] : [],
      insertedKey: value,
    })

    return steps
  }

  private findNode(node: AVLNodeData | null, value: number): string | null {
    if (!node) return null
    if (value === node.value) return node.id
    if (value < node.value) return this.findNode(node.left, value)
    return this.findNode(node.right, value)
  }

  private insertNode(node: AVLNodeData | null, value: number, steps: AVLStep[]): AVLNodeData {
    if (!node) {
      const newNode: AVLNodeData = { value, left: null, right: null, height: 0, id: generateNodeId() }
      steps.push({
        description: `创建新节点 ${value}`,
        phase: 'insert',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: newNode.id, color: '#3b82f6' }],
        insertedKey: value,
      })
      return newNode
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value, steps)
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value, steps)
    } else {
      steps.push({
        description: `值 ${value} 已存在，跳过`,
        phase: 'insert',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: node.id, color: '#f59e0b' }],
      })
      return node
    }

    return this.balance(node, steps)
  }

  deleteWithSteps(value: number): AVLStep[] {
    const steps: AVLStep[] = []
    steps.push({
      description: `准备删除值 ${value}`,
      phase: 'delete',
      tree: cloneTree(this.root),
      highlights: [],
      deletedKey: value,
    })

    this.root = this.deleteNode(this.root, value, steps)

    steps.push({
      description: `值 ${value} 删除完成`,
      phase: 'delete',
      tree: cloneTree(this.root),
      highlights: [],
      deletedKey: value,
    })

    return steps
  }

  private deleteNode(node: AVLNodeData | null, value: number, steps: AVLStep[]): AVLNodeData | null {
    if (!node) {
      steps.push({
        description: `值 ${value} 不存在`,
        phase: 'delete',
        tree: cloneTree(this.root),
        highlights: [],
      })
      return null
    }

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value, steps)
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value, steps)
    } else {
      steps.push({
        description: `找到要删除的节点 ${value}`,
        phase: 'delete',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: node.id, color: '#ef4444' }],
        deletedKey: value,
      })

      if (!node.left || !node.right) {
        const child = node.left || node.right
        return child
      }

      const successor = this.findMin(node.right)
      steps.push({
        description: `用中序后继 ${successor.value} 替换 ${node.value}`,
        phase: 'delete',
        tree: cloneTree(this.root),
        highlights: [
          { nodeId: node.id, color: '#ef4444' },
          { nodeId: successor.id, color: '#f59e0b' },
        ],
      })
      node.value = successor.value
      node.right = this.deleteNode(node.right, successor.value, steps)
    }

    return this.balance(node, steps)
  }

  private findMin(node: AVLNodeData): AVLNodeData {
    while (node.left) node = node.left
    return node
  }
}

// Layout computation for SVG rendering
interface LayoutNode {
  id: string
  value: number
  bf: number
  x: number
  y: number
}

function computeTreeLayout(
  node: AVLNodeData | null,
  depth: number,
  xMin: number,
  xMax: number,
  levelHeight: number,
): LayoutNode[] {
  if (!node) return []
  const result: LayoutNode[] = []
  const x = (xMin + xMax) / 2
  const y = depth * levelHeight + 40

  if (node.left) {
    const childXMin = xMin
    const childXMax = (xMin + xMax) / 2
    result.push(...computeTreeLayout(node.left, depth + 1, childXMin, childXMax, levelHeight))
  }

  if (node.right) {
    const childXMin = (xMin + xMax) / 2
    const childXMax = xMax
    result.push(...computeTreeLayout(node.right, depth + 1, childXMin, childXMax, levelHeight))
  }

  result.push({
    id: node.id,
    value: node.value,
    bf: getBalanceFactor(node),
    x,
    y,
  })

  return result
}

function collectEdges(
  node: AVLNodeData | null,
  xMin: number,
  xMax: number,
  depth: number,
  levelHeight: number,
): { fromX: number; fromY: number; toX: number; toY: number }[] {
  if (!node) return []
  const edges: { fromX: number; fromY: number; toX: number; toY: number }[] = []
  const x = (xMin + xMax) / 2
  const y = depth * levelHeight + 40

  if (node.left) {
    const childX = (xMin + (xMin + xMax) / 2) / 2
    const childY = (depth + 1) * levelHeight + 40
    edges.push({ fromX: x, fromY: y, toX: childX, toY: childY })
    edges.push(...collectEdges(node.left, xMin, (xMin + xMax) / 2, depth + 1, levelHeight))
  }

  if (node.right) {
    const childX = ((xMin + xMax) / 2 + xMax) / 2
    const childY = (depth + 1) * levelHeight + 40
    edges.push({ fromX: x, fromY: y, toX: childX, toY: childY })
    edges.push(...collectEdges(node.right, (xMin + xMax) / 2, xMax, depth + 1, levelHeight))
  }

  return edges
}

function getTreeHeight(node: AVLNodeData | null): number {
  if (!node) return 0
  return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right))
}

const SAMPLE_SEQUENCES: { name: string; keys: number[] }[] = [
  { name: 'LL/RR 旋转: [30,20,10,25,28,5]', keys: [30, 20, 10, 25, 28, 5] },
  { name: 'LR/RL 旋转: [10,30,20,5,15,25,28]', keys: [10, 30, 20, 5, 15, 25, 28] },
  { name: '顺序插入: [1,2,3,4,5,6,7,8]', keys: [1, 2, 3, 4, 5, 6, 7, 8] },
  { name: '逆序插入: [8,7,6,5,4,3,2,1]', keys: [8, 7, 6, 5, 4, 3, 2, 1] },
]

export default function AVLTreeVisualization() {
  const [seqIndex, setSeqIndex] = useState(0)
  const [allSteps, setAllSteps] = useState<AVLStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [insertKey, setInsertKey] = useState(18)
  const [deleteKey, setDeleteKey] = useState(20)
  const timerRef = useRef<number | null>(null)
  const [avltree, setAvltree] = useState<AVLDemo | null>(null)

  const buildInitialTree = useCallback(() => {
    nodeIdCounter = 0
    const seq = SAMPLE_SEQUENCES[seqIndex]
    const tree = new AVLDemo()
    const steps: AVLStep[] = []
    for (const key of seq.keys) {
      const insertSteps = tree.insertWithSteps(key)
      steps.push(...insertSteps)
    }
    steps.push({
      description: `初始树构建完成，共插入 ${seq.keys.length} 个值`,
      phase: 'idle',
      tree: cloneTree(tree.root),
      highlights: [],
    })
    setAvltree(tree)
    setAllSteps(steps)
    setCurrentStep(steps.length - 1)
    setIsPlaying(false)
  }, [seqIndex])

  useEffect(() => {
    buildInitialTree()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const doInsert = useCallback(() => {
    if (!avltree) return
    const steps = avltree.insertWithSteps(insertKey)
    setAllSteps(prev => [...prev, ...steps])
    setCurrentStep(prev => prev + 1)
    setIsPlaying(false)
  }, [avltree, insertKey])

  const doDelete = useCallback(() => {
    if (!avltree) return
    const steps = avltree.deleteWithSteps(deleteKey)
    setAllSteps(prev => [...prev, ...steps])
    setCurrentStep(prev => prev + 1)
    setIsPlaying(false)
  }, [avltree, deleteKey])

  const doReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    buildInitialTree()
  }, [buildInitialTree])

  useEffect(() => {
    if (!isPlaying || allSteps.length === 0) return
    if (currentStep >= allSteps.length - 1) {
      setIsPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, allSteps.length - 1))
    }, speed)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, allSteps, speed])

  const togglePlay = useCallback(() => {
    if (allSteps.length === 0) return
    if (currentStep >= allSteps.length - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }, [allSteps, currentStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < allSteps.length - 1) setCurrentStep(prev => prev + 1)
  }, [currentStep, allSteps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }, [currentStep])

  const current = allSteps[currentStep] || {
    description: '点击按钮开始演示',
    phase: 'idle' as const,
    tree: null as AVLNodeData | null,
    highlights: [] as { nodeId: string; color: string }[],
  }

  const highlightMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const h of current.highlights) {
      map.set(h.nodeId, h.color)
    }
    return map
  }, [current.highlights])

  // Find imbalanced nodes
  const imbalancedIds = useMemo(() => {
    const ids: string[] = []
    if (current.tree) findImbalanced(current.tree, ids)
    return ids
  }, [current.tree])

  // Compute SVG layout
  const layoutNodes = useMemo(() => {
    if (!current.tree) return []
    const treeH = getTreeHeight(current.tree)
    const levelHeight = Math.min(80, 320 / Math.max(treeH, 1))
    const svgWidth = 760
    return computeTreeLayout(current.tree, 0, 0, svgWidth, levelHeight)
  }, [current.tree])

  const edges = useMemo(() => {
    if (!current.tree) return []
    const treeH = getTreeHeight(current.tree)
    const levelHeight = Math.min(80, 320 / Math.max(treeH, 1))
    return collectEdges(current.tree, 0, 760, 0, levelHeight)
  }, [current.tree])

  const svgHeight = useMemo(() => {
    if (layoutNodes.length === 0) return 200
    const maxY = Math.max(...layoutNodes.map(n => n.y))
    return maxY + 80
  }, [layoutNodes])

  const selectStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
  }

  const inputStyle: React.CSSProperties = {
    padding: '0.4rem 0.6rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    width: '60px',
    textAlign: 'center',
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  }

  return (
    <div className="visualization-container">
      {/* Sequence selector */}
      <div className="viz-controls">
        <select
          value={seqIndex}
          onChange={e => {
            setSeqIndex(Number(e.target.value))
            if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
            setIsPlaying(false)
          }}
          style={selectStyle}
        >
          {SAMPLE_SEQUENCES.map((seq, idx) => (
            <option key={idx} value={idx}>{seq.name}</option>
          ))}
        </select>
        <button className="btn btn-secondary" onClick={doReset}>重建树</button>
      </div>

      {/* Insert / Delete controls */}
      <div className="viz-controls">
        <label style={labelStyle}>
          插入值:
          <input type="number" value={insertKey}
            onChange={e => setInsertKey(Number(e.target.value))}
            style={inputStyle} />
        </label>
        <button className="btn btn-primary" onClick={doInsert}>插入</button>
        <label style={labelStyle}>
          删除值:
          <input type="number" value={deleteKey}
            onChange={e => setDeleteKey(Number(e.target.value))}
            style={inputStyle} />
        </label>
        <button className="btn btn-primary" onClick={doDelete}>删除</button>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>上一步</button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : currentStep >= allSteps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= allSteps.length - 1}>下一步</button>
        <button className="btn btn-secondary" onClick={() => { setIsPlaying(false); setCurrentStep(0) }}>重置步骤</button>
        <label style={{ ...labelStyle, fontSize: '0.85rem' }}>
          速度:
          <input type="range" min={200} max={2000} step={100} value={speed} onChange={e => setSpeed(Number(e.target.value))} />
          {speed}ms
        </label>
      </div>

      {/* Progress bar */}
      {allSteps.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
            {currentStep + 1}/{allSteps.length}
          </span>
          <input type="range" min={0} max={allSteps.length - 1} value={currentStep}
            onChange={e => { setIsPlaying(false); setCurrentStep(Number(e.target.value)) }}
            style={{ flex: 1 }} />
        </div>
      )}

      {/* SVG AVL Tree Visualization */}
      <div className="viz-canvas" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '1rem', minHeight: '300px', padding: '1rem 0.5rem', overflow: 'auto',
      }}>
        <svg width="100%" height={svgHeight} viewBox={`0 0 760 ${svgHeight}`}
          style={{ maxWidth: '760px', overflow: 'visible' }}>
          {/* Edges */}
          {edges.map((edge, i) => (
            <line key={`edge-${i}`}
              x1={edge.fromX} y1={edge.fromY + 22}
              x2={edge.toX} y2={edge.toY - 22}
              stroke="#4b5563"
              strokeWidth={1.5}
              opacity={0.6}
            />
          ))}

          {/* Nodes */}
          {layoutNodes.map(node => {
            const hlColor = highlightMap.get(node.id)
            const isImbalanced = imbalancedIds.includes(node.id)
            const nodeRadius = 20
            const bfColor = isImbalanced ? '#ef4444' : (hlColor || '#1e3a5f')
            const bfTextColor = isImbalanced ? '#fecaca' : (hlColor ? '#fff' : '#93c5fd')

            return (
              <g key={node.id}>
                {/* Node circle */}
                <circle
                  cx={node.x} cy={node.y}
                  r={nodeRadius}
                  fill={bfColor}
                  stroke={hlColor ? '#fff' : isImbalanced ? '#fca5a5' : '#4b5563'}
                  strokeWidth={hlColor || isImbalanced ? 2.5 : 1.5}
                  style={{ transition: 'all 0.3s ease' }}
                />

                {/* Value text */}
                <text
                  x={node.x} y={node.y - 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize={14} fontWeight="bold"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.value}
                </text>

                {/* Balance factor */}
                <text
                  x={node.x} y={node.y + 12}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={bfTextColor}
                  fontSize={9}
                  fontFamily="Consolas, Monaco, monospace"
                >
                  BF={node.bf}
                </text>

                {/* Imbalanced indicator */}
                {isImbalanced && (
                  <text
                    x={node.x + nodeRadius + 4} y={node.y - nodeRadius + 4}
                    fill="#ef4444" fontSize={16} fontWeight="bold"
                  >
                    !
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap',
        fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
          插入成功
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%', display: 'inline-block' }} />
          新建节点
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
          失衡节点
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%', display: 'inline-block' }} />
          值已存在
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        {current.phase === 'rotate' && (
          <div style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 'bold' }}>
            执行旋转操作以恢复平衡
          </div>
        )}
      </div>
    </div>
  )
}
