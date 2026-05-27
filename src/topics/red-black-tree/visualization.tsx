import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

type Color = 'R' | 'B'

interface RBNodeData {
  value: number
  left: RBNodeData | null
  right: RBNodeData | null
  color: Color
  id: string
}

interface RBStep {
  description: string
  phase: 'insert' | 'fix' | 'idle'
  tree: RBNodeData | null
  highlights: { nodeId: string; color: string }[]
  violations: string[] // node ids with double-red violation
  insertedKey?: number
}

let nodeIdCounter = 0
function generateNodeId(): string {
  return `rb-${nodeIdCounter++}`
}

const NIL: RBNodeData = { value: -1, left: null, right: null, color: 'B', id: 'nil' }

function cloneTree(node: RBNodeData | null): RBNodeData | null {
  if (!node || node === NIL) return null
  return {
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    color: node.color,
    id: node.id,
  }
}

function findNode(node: RBNodeData | null, value: number): string | null {
  if (!node || node === NIL) return null
  if (value === node.value) return node.id
  if (value < node.value) return findNode(node.left, value)
  return findNode(node.right, value)
}

function findDoubleReds(node: RBNodeData | null, violations: string[]): void {
  if (!node || node === NIL) return
  if (node.color === 'R') {
    if (node.left && node.left !== NIL && node.left.color === 'R') {
      violations.push(node.id, node.left.id)
    }
    if (node.right && node.right !== NIL && node.right.color === 'R') {
      violations.push(node.id, node.right.id)
    }
  }
  findDoubleReds(node.left, violations)
  findDoubleReds(node.right, violations)
}

// Internal tree with parent tracking for proper rotations
interface InternalNode {
  value: number
  left: InternalNode | null
  right: InternalNode | null
  parent: InternalNode | null
  color: Color
  id: string
}

const INTERNAL_NIL: InternalNode = {
  value: -1, left: null, right: null, parent: null, color: 'B', id: 'nil',
}

function toDisplayTree(node: InternalNode | null): RBNodeData | null {
  if (!node || node === INTERNAL_NIL) return null
  return {
    value: node.value,
    left: toDisplayTree(node.left),
    right: toDisplayTree(node.right),
    color: node.color,
    id: node.id,
  }
}

class RBDemo {
  root: InternalNode = INTERNAL_NIL

  private rotateLeft(x: InternalNode): void {
    const y = x.right!
    x.right = y.left
    if (y.left !== INTERNAL_NIL) y.left.parent = x
    y.parent = x.parent
    if (x.parent === null) {
      this.root = y
    } else if (x === x.parent.left) {
      x.parent.left = y
    } else {
      x.parent.right = y
    }
    y.left = x
    x.parent = y
  }

  private rotateRight(x: InternalNode): void {
    const y = x.left!
    x.left = y.right
    if (y.right !== INTERNAL_NIL) y.right.parent = x
    y.parent = x.parent
    if (x.parent === null) {
      this.root = y
    } else if (x === x.parent.right) {
      x.parent.right = y
    } else {
      x.parent.left = y
    }
    y.right = x
    x.parent = y
  }

  insertWithSteps(value: number): RBStep[] {
    const steps: RBStep[] = []

    // Check duplicates
    if (this.findValue(this.root, value)) {
      steps.push({
        description: `值 ${value} 已存在，跳过`,
        phase: 'insert',
        tree: toDisplayTree(this.root),
        highlights: [{ nodeId: findNode(toDisplayTree(this.root), value) || '', color: '#f59e0b' }],
        violations: [],
      })
      return steps
    }

    const newNode: InternalNode = {
      value, left: INTERNAL_NIL, right: INTERNAL_NIL,
      parent: null, color: 'R', id: generateNodeId(),
    }

    // BST insert
    let parent: InternalNode | null = null
    let current = this.root
    while (current !== INTERNAL_NIL) {
      parent = current
      if (value < current.value) current = current.left!
      else current = current.right!
    }
    newNode.parent = parent
    if (parent === null) {
      this.root = newNode
    } else if (value < parent.value) {
      parent.left = newNode
    } else {
      parent.right = newNode
    }

    steps.push({
      description: `插入红色节点 ${value}`,
      phase: 'insert',
      tree: toDisplayTree(this.root),
      highlights: [{ nodeId: newNode.id, color: '#ef4444' }],
      violations: [],
      insertedKey: value,
    })

    // Fix
    if (newNode.parent === null) {
      newNode.color = 'B'
      steps.push({
        description: `新节点 ${value} 是根节点，染为黑色`,
        phase: 'fix',
        tree: toDisplayTree(this.root),
        highlights: [{ nodeId: newNode.id, color: '#1e293b' }],
        violations: [],
        insertedKey: value,
      })
      return steps
    }

    this.fixInsert(newNode, steps)
    return steps
  }

  private findValue(node: InternalNode, value: number): boolean {
    if (node === INTERNAL_NIL) return false
    if (value === node.value) return true
    if (value < node.value) return this.findValue(node.left!, value)
    return this.findValue(node.right!, value)
  }

  private fixInsert(node: InternalNode, steps: RBStep[]): void {
    let current = node

    while (current.parent !== null && current.parent.color === 'R') {
      const parent = current.parent
      const grandparent = parent.parent!
      const violations: string[] = []
      findDoubleReds(toDisplayTree(this.root), violations)

      if (parent === grandparent.left) {
        const uncle = grandparent.right
        if (uncle.color === 'R') {
          // Case 1: color flip
          steps.push({
            description: `情况1: 叔叔节点 ${uncle.value} 是红色，颜色翻转 → 父 ${parent.value} 和叔 ${uncle.value} 染黑，祖父 ${grandparent.value} 染红`,
            phase: 'fix',
            tree: toDisplayTree(this.root),
            highlights: [
              { nodeId: parent.id, color: '#3b82f6' },
              { nodeId: uncle.id, color: '#3b82f6' },
              { nodeId: grandparent.id, color: '#f59e0b' },
            ],
            violations,
            insertedKey: node.value,
          })
          parent.color = 'B'
          uncle.color = 'B'
          grandparent.color = 'R'
          current = grandparent

          steps.push({
            description: `颜色翻转完成，以祖父 ${grandparent.value} 为起点继续检查`,
            phase: 'fix',
            tree: toDisplayTree(this.root),
            highlights: [{ nodeId: grandparent.id, color: '#ef4444' }],
            violations: [],
            insertedKey: node.value,
          })
        } else {
          if (current === parent.right) {
            // Case 2: left rotate to become case 3
            steps.push({
              description: `情况2: 叔叔是黑色，${current.value} 是右子，对父节点 ${parent.value} 左旋`,
              phase: 'fix',
              tree: toDisplayTree(this.root),
              highlights: [{ nodeId: parent.id, color: '#8b5cf6' }],
              violations,
              insertedKey: node.value,
            })
            current = parent
            this.rotateLeft(current)
          }
          // Case 3
          steps.push({
            description: `情况3: 叔叔是黑色，对祖父 ${grandparent.value} 右旋，父 ${current.parent!.value} 染黑，祖父 ${grandparent.value} 染红`,
            phase: 'fix',
            tree: toDisplayTree(this.root),
            highlights: [
              { nodeId: current.parent!.id, color: '#3b82f6' },
              { nodeId: grandparent.id, color: '#ef4444' },
            ],
            violations: [],
            insertedKey: node.value,
          })
          current.parent!.color = 'B'
          grandparent.color = 'R'
          this.rotateRight(grandparent)
        }
      } else {
        // Symmetric
        const uncle = grandparent.left
        if (uncle.color === 'R') {
          steps.push({
            description: `情况1(对称): 叔叔节点 ${uncle.value} 是红色，颜色翻转 → 父 ${parent.value} 和叔 ${uncle.value} 染黑，祖父 ${grandparent.value} 染红`,
            phase: 'fix',
            tree: toDisplayTree(this.root),
            highlights: [
              { nodeId: parent.id, color: '#3b82f6' },
              { nodeId: uncle.id, color: '#3b82f6' },
              { nodeId: grandparent.id, color: '#f59e0b' },
            ],
            violations,
            insertedKey: node.value,
          })
          parent.color = 'B'
          uncle.color = 'B'
          grandparent.color = 'R'
          current = grandparent

          steps.push({
            description: `颜色翻转完成，以祖父 ${grandparent.value} 为起点继续检查`,
            phase: 'fix',
            tree: toDisplayTree(this.root),
            highlights: [{ nodeId: grandparent.id, color: '#ef4444' }],
            violations: [],
            insertedKey: node.value,
          })
        } else {
          if (current === parent.left) {
            steps.push({
              description: `情况2(对称): 叔叔是黑色，${current.value} 是左子，对父节点 ${parent.value} 右旋`,
              phase: 'fix',
              tree: toDisplayTree(this.root),
              highlights: [{ nodeId: parent.id, color: '#8b5cf6' }],
              violations,
              insertedKey: node.value,
            })
            current = parent
            this.rotateRight(current)
          }
          steps.push({
            description: `情况3(对称): 叔叔是黑色，对祖父 ${grandparent.value} 左旋，父 ${current.parent!.value} 染黑，祖父 ${grandparent.value} 染红`,
            phase: 'fix',
            tree: toDisplayTree(this.root),
            highlights: [
              { nodeId: current.parent!.id, color: '#3b82f6' },
              { nodeId: grandparent.id, color: '#ef4444' },
            ],
            violations: [],
            insertedKey: node.value,
          })
          current.parent!.color = 'B'
          grandparent.color = 'R'
          this.rotateLeft(grandparent)
        }
      }
    }

    if (this.root.color === 'R') {
      this.root.color = 'B'
      steps.push({
        description: `根节点 ${this.root.value} 强制染黑`,
        phase: 'fix',
        tree: toDisplayTree(this.root),
        highlights: [{ nodeId: this.root.id, color: '#1e293b' }],
        violations: [],
      })
    }

    // Final state
    steps.push({
      description: `插入 ${node.value} 修复完成`,
      phase: 'idle',
      tree: toDisplayTree(this.root),
      highlights: [{ nodeId: node.id, color: node.color === 'R' ? '#ef4444' : '#1e293b' }],
      violations: [],
      insertedKey: node.value,
    })
  }
}

// Layout computation
interface LayoutNode {
  id: string
  value: number
  color: Color
  x: number
  y: number
}

function computeTreeLayout(
  node: RBNodeData | null,
  depth: number,
  xMin: number,
  xMax: number,
  levelHeight: number,
): LayoutNode[] {
  if (!node || node === NIL) return []
  const result: LayoutNode[] = []
  const x = (xMin + xMax) / 2
  const y = depth * levelHeight + 40

  if (node.left && node.left !== NIL) {
    result.push(...computeTreeLayout(node.left, depth + 1, xMin, (xMin + xMax) / 2, levelHeight))
  }
  if (node.right && node.right !== NIL) {
    result.push(...computeTreeLayout(node.right, depth + 1, (xMin + xMax) / 2, xMax, levelHeight))
  }

  result.push({ id: node.id, value: node.value, color: node.color, x, y })
  return result
}

function collectEdges(
  node: RBNodeData | null,
  xMin: number,
  xMax: number,
  depth: number,
  levelHeight: number,
): { fromX: number; fromY: number; toX: number; toY: number }[] {
  if (!node || node === NIL) return []
  const edges: { fromX: number; fromY: number; toX: number; toY: number }[] = []
  const x = (xMin + xMax) / 2
  const y = depth * levelHeight + 40

  if (node.left && node.left !== NIL) {
    const cx = (xMin + (xMin + xMax) / 2) / 2
    const cy = (depth + 1) * levelHeight + 40
    edges.push({ fromX: x, fromY: y, toX: cx, toY: cy })
    edges.push(...collectEdges(node.left, xMin, (xMin + xMax) / 2, depth + 1, levelHeight))
  }
  if (node.right && node.right !== NIL) {
    const cx = ((xMin + xMax) / 2 + xMax) / 2
    const cy = (depth + 1) * levelHeight + 40
    edges.push({ fromX: x, fromY: y, toX: cx, toY: cy })
    edges.push(...collectEdges(node.right, (xMin + xMax) / 2, xMax, depth + 1, levelHeight))
  }

  return edges
}

function getTreeHeight(node: RBNodeData | null): number {
  if (!node || node === NIL) return 0
  return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right))
}

const SAMPLE_SEQUENCES: { name: string; keys: number[] }[] = [
  { name: '颜色翻转演示: [10,5,15,3,7,12,20]', keys: [10, 5, 15, 3, 7, 12, 20] },
  { name: '旋转演示: [7,3,18,10,22,8,11,26]', keys: [7, 3, 18, 10, 22, 8, 11, 26] },
  { name: '顺序插入: [1,2,3,4,5,6,7,8]', keys: [1, 2, 3, 4, 5, 6, 7, 8] },
  { name: '逆序插入: [8,7,6,5,4,3,2,1]', keys: [8, 7, 6, 5, 4, 3, 2, 1] },
]

export default function RedBlackTreeVisualization() {
  const [seqIndex, setSeqIndex] = useState(0)
  const [allSteps, setAllSteps] = useState<RBStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [insertKey, setInsertKey] = useState(25)
  const timerRef = useRef<number | null>(null)
  const [rbtree, setRbtree] = useState<RBDemo | null>(null)

  const buildInitialTree = useCallback(() => {
    nodeIdCounter = 0
    const seq = SAMPLE_SEQUENCES[seqIndex]
    const tree = new RBDemo()
    const steps: RBStep[] = []
    for (const key of seq.keys) {
      const insertSteps = tree.insertWithSteps(key)
      steps.push(...insertSteps)
    }
    steps.push({
      description: `初始树构建完成，共插入 ${seq.keys.length} 个值`,
      phase: 'idle',
      tree: toDisplayTree(tree.root as unknown as InternalNode),
      highlights: [],
      violations: [],
    })
    setRbtree(tree)
    setAllSteps(steps)
    setCurrentStep(steps.length - 1)
    setIsPlaying(false)
  }, [seqIndex])

  useEffect(() => {
    buildInitialTree()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const doInsert = useCallback(() => {
    if (!rbtree) return
    const steps = rbtree.insertWithSteps(insertKey)
    setAllSteps(prev => [...prev, ...steps])
    setCurrentStep(prev => prev + 1)
    setIsPlaying(false)
  }, [rbtree, insertKey])

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
    tree: null as RBNodeData | null,
    highlights: [] as { nodeId: string; color: string }[],
    violations: [] as string[],
  }

  const highlightMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const h of current.highlights) {
      map.set(h.nodeId, h.color)
    }
    return map
  }, [current.highlights])

  const violationSet = useMemo(() => new Set(current.violations), [current.violations])

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

      {/* Insert control */}
      <div className="viz-controls">
        <label style={labelStyle}>
          插入值:
          <input type="number" value={insertKey}
            onChange={e => setInsertKey(Number(e.target.value))}
            style={inputStyle} />
        </label>
        <button className="btn btn-primary" onClick={doInsert}>插入</button>
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

      {/* SVG Red-Black Tree */}
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
            const isViolation = violationSet.has(node.id)
            const nodeRadius = 20
            const isRed = node.color === 'R'
            const baseColor = isRed ? '#dc2626' : '#1e293b'
            const displayColor = hlColor || baseColor
            const strokeColor = isViolation ? '#fbbf24' : (hlColor ? '#fff' : (isRed ? '#fca5a5' : '#4b5563'))

            return (
              <g key={node.id}>
                {/* Violation ring */}
                {isViolation && (
                  <circle
                    cx={node.x} cy={node.y}
                    r={nodeRadius + 4}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={2.5}
                    strokeDasharray="4 3"
                    style={{ animation: 'pulse 1s ease-in-out infinite' }}
                  />
                )}
                {/* Node circle */}
                <circle
                  cx={node.x} cy={node.y}
                  r={nodeRadius}
                  fill={displayColor}
                  stroke={strokeColor}
                  strokeWidth={hlColor || isViolation ? 2.5 : 1.5}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Value text */}
                <text
                  x={node.x} y={node.y}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize={14} fontWeight="bold"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.value}
                </text>
                {/* Color indicator */}
                <text
                  x={node.x + nodeRadius + 2} y={node.y - nodeRadius + 2}
                  fill={isRed ? '#fca5a5' : '#94a3b8'}
                  fontSize={10} fontWeight="bold"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.color}
                </text>
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
          <span style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '50%', display: 'inline-block' }} />
          红色节点
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#1e293b', borderRadius: '50%', display: 'inline-block', border: '1px solid #4b5563' }} />
          黑色节点
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '50%', display: 'inline-block' }} />
          颜色翻转
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '50%', display: 'inline-block' }} />
          旋转操作
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', border: '2px dashed #fbbf24', borderRadius: '50%', display: 'inline-block' }} />
          双红冲突
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        {current.phase === 'fix' && (
          <div style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: 'bold' }}>
            正在修复红黑树性质
          </div>
        )}
      </div>
    </div>
  )
}
