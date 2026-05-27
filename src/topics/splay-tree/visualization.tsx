import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface SplayNodeData {
  value: number
  left: SplayNodeData | null
  right: SplayNodeData | null
  id: string
}

interface SplayStep {
  description: string
  phase: 'insert' | 'search' | 'delete' | 'splay' | 'rotate' | 'idle'
  tree: SplayNodeData | null
  highlights: { nodeId: string; color: string }[]
  rotationType?: string
}

let nodeIdCounter = 0
function generateNodeId(): string {
  return `node-${nodeIdCounter++}`
}

function cloneTree(node: SplayNodeData | null): SplayNodeData | null {
  if (!node) return null
  return {
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    id: node.id,
  }
}

function findNodeId(node: SplayNodeData | null, value: number): string | null {
  if (!node) return null
  if (value === node.value) return node.id
  return findNodeId(node.left, value) || findNodeId(node.right, value)
}

class SplayDemo {
  root: SplayNodeData | null = null
  private steps: SplayStep[] = []

  private rotateRight(node: SplayNodeData): SplayNodeData {
    const left = node.left!
    node.left = left.right
    left.right = node
    return left
  }

  private rotateLeft(node: SplayNodeData): SplayNodeData {
    const right = node.right!
    node.right = right.left
    right.left = node
    return right
  }

  private splay(node: SplayNodeData | null, value: number): SplayNodeData | null {
    if (!node) return null

    const dummy: SplayNodeData = { value: -1, left: null, right: null, id: 'dummy' }
    let leftMax: SplayNodeData = dummy
    let rightMin: SplayNodeData = dummy
    let current: SplayNodeData | null = node

    while (true) {
      if (value < current!.value) {
        if (!current!.left) break

        if (value < current!.left.value) {
          // Zig-Zig
          this.steps.push({
            description: `Zig-Zig: 节点 ${current!.value} 和 ${current!.left.value} 同为左子，先旋转 ${current!.value}`,
            phase: 'rotate',
            tree: cloneTree(this.root),
            highlights: [
              { nodeId: current!.id, color: '#ef4444' },
              { nodeId: current!.left.id, color: '#3b82f6' },
            ],
            rotationType: 'Zig-Zig',
          })
          current = this.rotateRight(current!)
          if (!current!.left) break
        }

        rightMin.left = current!
        rightMin = current!
        current = current!.left
      } else if (value > current!.value) {
        if (!current!.right) break

        if (value > current!.right.value) {
          // Zig-Zig (right side)
          this.steps.push({
            description: `Zig-Zig: 节点 ${current!.value} 和 ${current!.right.value} 同为右子，先旋转 ${current!.value}`,
            phase: 'rotate',
            tree: cloneTree(this.root),
            highlights: [
              { nodeId: current!.id, color: '#ef4444' },
              { nodeId: current!.right.id, color: '#3b82f6' },
            ],
            rotationType: 'Zig-Zig',
          })
          current = this.rotateLeft(current!)
          if (!current!.right) break
        }

        leftMax.right = current!
        leftMax = current!
        current = current!.right
      } else {
        break
      }
    }

    leftMax.right = current!.left
    rightMin.left = current!.right
    current!.left = dummy.right
    current!.right = dummy.left

    return current
  }

  insertWithSteps(value: number): SplayStep[] {
    this.steps = []

    this.steps.push({
      description: `准备插入值 ${value}`,
      phase: 'insert',
      tree: cloneTree(this.root),
      highlights: [],
    })

    if (!this.root) {
      const newNode: SplayNodeData = { value, left: null, right: null, id: generateNodeId() }
      this.root = newNode
      this.steps.push({
        description: `树为空，创建根节点 ${value}`,
        phase: 'insert',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: newNode.id, color: '#22c55e' }],
      })
      return this.steps
    }

    this.root = this.splay(this.root, value)!

    if (this.root.value === value) {
      this.steps.push({
        description: `值 ${value} 已存在于根部，跳过`,
        phase: 'insert',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: this.root.id, color: '#f59e0b' }],
      })
      return this.steps
    }

    const newNode: SplayNodeData = { value, left: null, right: null, id: generateNodeId() }

    if (value < this.root.value) {
      newNode.right = this.root
      newNode.left = this.root.left
      this.root.left = null
      this.steps.push({
        description: `${value} < 根 ${this.root.value}，新节点成为根，原根成为右子`,
        phase: 'insert',
        tree: cloneTree(newNode),
        highlights: [{ nodeId: newNode.id, color: '#22c55e' }],
      })
    } else {
      newNode.left = this.root
      newNode.right = this.root.right
      this.root.right = null
      this.steps.push({
        description: `${value} > 根 ${this.root.value}，新节点成为根，原根成为左子`,
        phase: 'insert',
        tree: cloneTree(newNode),
        highlights: [{ nodeId: newNode.id, color: '#22c55e' }],
      })
    }

    this.root = newNode

    this.steps.push({
      description: `插入 ${value} 完成`,
      phase: 'insert',
      tree: cloneTree(this.root),
      highlights: [{ nodeId: newNode.id, color: '#22c55e' }],
    })

    return this.steps
  }

  searchWithSteps(value: number): SplayStep[] {
    this.steps = []

    const targetId = findNodeId(this.root, value)

    this.steps.push({
      description: `搜索值 ${value}`,
      phase: 'search',
      tree: cloneTree(this.root),
      highlights: targetId ? [{ nodeId: targetId, color: '#3b82f6' }] : [],
    })

    this.root = this.splay(this.root, value)

    if (this.root && this.root.value === value) {
      this.steps.push({
        description: `找到 ${value}，已伸展到根部`,
        phase: 'search',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: this.root.id, color: '#22c55e' }],
      })
    } else {
      this.steps.push({
        description: `值 ${value} 不存在，最后访问的节点 ${this.root?.value ?? '无'} 已伸展到根部`,
        phase: 'search',
        tree: cloneTree(this.root),
        highlights: this.root ? [{ nodeId: this.root.id, color: '#f59e0b' }] : [],
      })
    }

    return this.steps
  }

  deleteWithSteps(value: number): SplayStep[] {
    this.steps = []

    this.steps.push({
      description: `准备删除值 ${value}`,
      phase: 'delete',
      tree: cloneTree(this.root),
      highlights: [],
    })

    if (!this.root) {
      this.steps.push({
        description: `树为空，无法删除`,
        phase: 'delete',
        tree: null,
        highlights: [],
      })
      return this.steps
    }

    this.root = this.splay(this.root, value)!

    if (this.root.value !== value) {
      this.steps.push({
        description: `值 ${value} 不存在`,
        phase: 'delete',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: this.root.id, color: '#f59e0b' }],
      })
      return this.steps
    }

    this.steps.push({
      description: `找到 ${value}，执行删除`,
      phase: 'delete',
      tree: cloneTree(this.root),
      highlights: [{ nodeId: this.root!.id, color: '#ef4444' }],
    })

    if (!this.root!.left) {
      this.root = this.root!.right
      this.steps.push({
        description: `无左子树，右子树成为新根`,
        phase: 'delete',
        tree: cloneTree(this.root),
        highlights: this.root ? [{ nodeId: this.root.id, color: '#22c55e' }] : [],
      })
    } else {
      const leftTree = this.root!.left
      const rightTree = this.root!.right

      // Find max in left subtree
      let maxNode = leftTree
      while (maxNode.right) maxNode = maxNode.right

      const splayedLeft = this.splay(leftTree, maxNode.value)
      splayedLeft!.right = rightTree
      this.root = splayedLeft

      this.steps.push({
        description: `左子树根 ${splayedLeft!.value} 成为新根，右子树连接为其右子树`,
        phase: 'delete',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: splayedLeft!.id, color: '#22c55e' }],
      })
    }

    return this.steps
  }
}

// Layout computation
interface LayoutNode {
  id: string
  value: number
  x: number
  y: number
}

function computeTreeLayout(
  node: SplayNodeData | null,
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
    result.push(...computeTreeLayout(node.left, depth + 1, xMin, (xMin + xMax) / 2, levelHeight))
  }
  if (node.right) {
    result.push(...computeTreeLayout(node.right, depth + 1, (xMin + xMax) / 2, xMax, levelHeight))
  }

  result.push({ id: node.id, value: node.value, x, y })
  return result
}

function collectEdges(
  node: SplayNodeData | null,
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

function getTreeHeight(node: SplayNodeData | null): number {
  if (!node) return 0
  return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right))
}

const SAMPLE_SEQUENCES: { name: string; keys: number[] }[] = [
  { name: '基本演示: [10,20,30,15,25,5,8]', keys: [10, 20, 30, 15, 25, 5, 8] },
  { name: '顺序插入: [1,2,3,4,5,6,7]', keys: [1, 2, 3, 4, 5, 6, 7] },
  { name: '逆序插入: [7,6,5,4,3,2,1]', keys: [7, 6, 5, 4, 3, 2, 1] },
  { name: '随机插入: [50,30,70,20,40,60,80,10]', keys: [50, 30, 70, 20, 40, 60, 80, 10] },
]

export default function SplayTreeVisualization() {
  const [seqIndex, setSeqIndex] = useState(0)
  const [allSteps, setAllSteps] = useState<SplayStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [insertKey, setInsertKey] = useState(18)
  const [searchKey, setSearchKey] = useState(15)
  const [deleteKey, setDeleteKey] = useState(20)
  const timerRef = useRef<number | null>(null)
  const [splayTree, setSplayTree] = useState<SplayDemo | null>(null)

  const buildInitialTree = useCallback(() => {
    nodeIdCounter = 0
    const seq = SAMPLE_SEQUENCES[seqIndex]
    const tree = new SplayDemo()
    const steps: SplayStep[] = []
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
    setSplayTree(tree)
    setAllSteps(steps)
    setCurrentStep(steps.length - 1)
    setIsPlaying(false)
  }, [seqIndex])

  useEffect(() => {
    buildInitialTree()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const doInsert = useCallback(() => {
    if (!splayTree) return
    const steps = splayTree.insertWithSteps(insertKey)
    setAllSteps(prev => [...prev, ...steps])
    setCurrentStep(prev => prev + 1)
    setIsPlaying(false)
  }, [splayTree, insertKey])

  const doSearch = useCallback(() => {
    if (!splayTree) return
    const steps = splayTree.searchWithSteps(searchKey)
    setAllSteps(prev => [...prev, ...steps])
    setCurrentStep(prev => prev + 1)
    setIsPlaying(false)
  }, [splayTree, searchKey])

  const doDelete = useCallback(() => {
    if (!splayTree) return
    const steps = splayTree.deleteWithSteps(deleteKey)
    setAllSteps(prev => [...prev, ...steps])
    setCurrentStep(prev => prev + 1)
    setIsPlaying(false)
  }, [splayTree, deleteKey])

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
    tree: null as SplayNodeData | null,
    highlights: [] as { nodeId: string; color: string }[],
  }

  const highlightMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const h of current.highlights) {
      map.set(h.nodeId, h.color)
    }
    return map
  }, [current.highlights])

  const layoutNodes = useMemo(() => {
    if (!current.tree) return []
    const treeH = getTreeHeight(current.tree)
    const levelHeight = Math.min(80, 320 / Math.max(treeH, 1))
    return computeTreeLayout(current.tree, 0, 0, 760, levelHeight)
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

      {/* Insert / Search / Delete controls */}
      <div className="viz-controls">
        <label style={labelStyle}>
          插入值:
          <input type="number" value={insertKey}
            onChange={e => setInsertKey(Number(e.target.value))}
            style={inputStyle} />
        </label>
        <button className="btn btn-primary" onClick={doInsert}>插入</button>
        <label style={labelStyle}>
          搜索值:
          <input type="number" value={searchKey}
            onChange={e => setSearchKey(Number(e.target.value))}
            style={inputStyle} />
        </label>
        <button className="btn btn-primary" onClick={doSearch}>搜索</button>
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

      {/* SVG Tree Visualization */}
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
            const nodeRadius = 20
            const nodeColor = hlColor || '#1e3a5f'
            const strokeColor = hlColor ? '#fff' : '#4b5563'

            return (
              <g key={node.id}>
                <circle
                  cx={node.x} cy={node.y}
                  r={nodeRadius}
                  fill={nodeColor}
                  stroke={strokeColor}
                  strokeWidth={hlColor ? 2.5 : 1.5}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text
                  x={node.x} y={node.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize={14} fontWeight="bold"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.value}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Rotation type indicator */}
      {current.rotationType && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap',
          fontSize: '0.85rem', padding: '0.5rem',
        }}>
          <span style={{
            padding: '0.3rem 0.8rem', borderRadius: 'var(--radius)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: '#ef4444', fontWeight: 'bold',
          }}>
            {current.rotationType} 旋转
          </span>
        </div>
      )}

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
          搜索目标
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
          旋转节点
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%', display: 'inline-block' }} />
          未找到
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        {current.phase === 'rotate' && (
          <div style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 'bold' }}>
            执行伸展旋转操作
          </div>
        )}
      </div>
    </div>
  )
}
