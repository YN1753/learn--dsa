import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface BTreeNodeData {
  keys: number[]
  children: BTreeNodeData[]
  isLeaf: boolean
  id: string
}

interface BTreeStep {
  description: string
  phase: 'insert' | 'search' | 'idle' | 'split'
  tree: BTreeNodeData
  highlights: { nodeId: string; color: string }[]
  searchPath?: string[]
  insertKey?: number
  splitNodes?: string[]
  found?: boolean
}

let nodeIdCounter = 0
function generateNodeId(): string {
  return `node-${nodeIdCounter++}`
}

function cloneTree(node: BTreeNodeData): BTreeNodeData {
  return {
    keys: [...node.keys],
    children: node.children.map(c => cloneTree(c)),
    isLeaf: node.isLeaf,
    id: node.id,
  }
}

function createEmptyNode(isLeaf: boolean): BTreeNodeData {
  return { keys: [], children: [], isLeaf, id: generateNodeId() }
}

class BTreeDemo {
  root: BTreeNodeData
  order: number
  maxKeys: number

  constructor(order: number = 3) {
    this.order = order
    this.maxKeys = order - 1
    this.root = createEmptyNode(true)
  }

  insertWithSteps(key: number): BTreeStep[] {
    const steps: BTreeStep[] = []
    steps.push({
      description: `准备插入关键字 ${key}`,
      phase: 'insert',
      tree: cloneTree(this.root),
      highlights: [],
      insertKey: key,
    })

    if (this.root.keys.length === this.maxKeys) {
      steps.push({
        description: `根节点 [${this.root.keys.join(', ')}] 已满，需要分裂`,
        phase: 'split',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: this.root.id, color: '#ef4444' }],
        insertKey: key,
      })
      const newRoot = createEmptyNode(false)
      newRoot.children.push(this.root)
      this.splitChild(newRoot, 0, steps)
      this.root = newRoot
    }

    this.insertNonFull(this.root, key, steps)

    steps.push({
      description: `关键字 ${key} 插入完成！`,
      phase: 'insert',
      tree: cloneTree(this.root),
      highlights: [],
      insertKey: key,
    })

    return steps
  }

  private splitChild(parent: BTreeNodeData, index: number, steps: BTreeStep[]): void {
    const node = parent.children[index]
    const mid = Math.floor(node.keys.length / 2)

    const newNode = createEmptyNode(node.isLeaf)
    newNode.keys = node.keys.splice(mid + 1)
    if (!node.isLeaf) {
      newNode.children = node.children.splice(mid + 1)
    }
    const midKey = node.keys.splice(mid, 1)[0]

    parent.keys.splice(index, 0, midKey)
    parent.children.splice(index + 1, 0, newNode)

    steps.push({
      description: `分裂: [${node.keys.join(', ')}] | ${midKey} | [${newNode.keys.join(', ')}]`,
      phase: 'split',
      tree: cloneTree(this.root),
      highlights: [
        { nodeId: node.id, color: '#ef4444' },
        { nodeId: newNode.id, color: '#f59e0b' },
        { nodeId: parent.id, color: '#3b82f6' },
      ],
      splitNodes: [node.id, newNode.id, parent.id],
    })
  }

  private insertNonFull(node: BTreeNodeData, key: number, steps: BTreeStep[]): void {
    let i = node.keys.length - 1

    if (node.isLeaf) {
      while (i >= 0 && key < node.keys[i]) {
        i--
      }
      if (i >= 0 && node.keys[i] === key) {
        steps.push({
          description: `关键字 ${key} 已存在，跳过`,
          phase: 'insert',
          tree: cloneTree(this.root),
          highlights: [{ nodeId: node.id, color: '#f59e0b' }],
        })
        return
      }
      node.keys.splice(i + 1, 0, key)
      steps.push({
        description: `在叶子节点 [${node.keys.join(', ')}] 中插入 ${key}`,
        phase: 'insert',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: node.id, color: '#22c55e' }],
        insertKey: key,
      })
    } else {
      while (i >= 0 && key < node.keys[i]) {
        i--
      }
      if (i >= 0 && node.keys[i] === key) {
        steps.push({
          description: `关键字 ${key} 已存在，跳过`,
          phase: 'insert',
          tree: cloneTree(this.root),
          highlights: [{ nodeId: node.id, color: '#f59e0b' }],
        })
        return
      }
      i++
      steps.push({
        description: `在内部节点 [${node.keys.join(', ')}] 中搜索，沿第 ${i + 1} 个子树继续`,
        phase: 'insert',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: node.id, color: '#3b82f6' }],
        insertKey: key,
      })

      if (node.children[i].keys.length === this.maxKeys) {
        steps.push({
          description: `子节点 [${node.children[i].keys.join(', ')}] 已满，需要分裂`,
          phase: 'split',
          tree: cloneTree(this.root),
          highlights: [
            { nodeId: node.children[i].id, color: '#ef4444' },
            { nodeId: node.id, color: '#3b82f6' },
          ],
        })
        this.splitChild(node, i, steps)
        if (key > node.keys[i]) {
          i++
        } else if (key === node.keys[i]) {
          steps.push({
            description: `关键字 ${key} 已存在，跳过`,
            phase: 'insert',
            tree: cloneTree(this.root),
            highlights: [{ nodeId: node.id, color: '#f59e0b' }],
          })
          return
        }
      }
      this.insertNonFull(node.children[i], key, steps)
    }
  }

  searchWithSteps(key: number): BTreeStep[] {
    const steps: BTreeStep[] = []
    const found = this.searchNode(this.root, key, steps)
    steps.push({
      description: found ? `找到关键字 ${key}！` : `未找到关键字 ${key}`,
      phase: 'search',
      tree: cloneTree(this.root),
      highlights: [],
      found,
    })
    return steps
  }

  private searchNode(
    node: BTreeNodeData,
    key: number,
    steps: BTreeStep[],
  ): boolean {
    let i = 0
    while (i < node.keys.length && key > node.keys[i]) {
      i++
    }

    if (i < node.keys.length && key === node.keys[i]) {
      steps.push({
        description: `在节点 [${node.keys.join(', ')}] 中找到 ${key}`,
        phase: 'search',
        tree: cloneTree(this.root),
        highlights: [{ nodeId: node.id, color: '#22c55e' }],
        searchPath: [node.id],
      })
      return true
    }

    steps.push({
      description: `在节点 [${node.keys.join(', ')}] 中搜索 ${key}，${node.isLeaf ? '未找到' : `沿第 ${i + 1} 个子树继续`}`,
      phase: 'search',
      tree: cloneTree(this.root),
      highlights: [{ nodeId: node.id, color: '#3b82f6' }],
      searchPath: [node.id],
    })

    if (node.isLeaf) {
      return false
    }

    return this.searchNode(node.children[i], key, steps)
  }
}

function getTreeHeight(node: BTreeNodeData): number {
  if (node.isLeaf) return 1
  return 1 + getTreeHeight(node.children[0])
}

// Layout computation for SVG rendering
interface LayoutNode {
  id: string
  keys: number[]
  isLeaf: boolean
  x: number
  y: number
  width: number
  childPositions: { x: number; y: number }[]
}

function computeTreeLayout(
  node: BTreeNodeData,
  depth: number,
  xMin: number,
  xMax: number,
  nodeWidth: number,
  levelHeight: number,
): LayoutNode[] {
  const result: LayoutNode[] = []
  const x = (xMin + xMax) / 2
  const y = depth * levelHeight + 40
  const width = Math.max(nodeWidth, node.keys.length * 36 + 20)

  const childPositions: { x: number; y: number }[] = []

  if (!node.isLeaf && node.children.length > 0) {
    const childWidth = (xMax - xMin) / node.children.length
    for (let i = 0; i < node.children.length; i++) {
      const childXMin = xMin + i * childWidth
      const childXMax = childXMin + childWidth
      const childX = (childXMin + childXMax) / 2
      const childY = (depth + 1) * levelHeight + 40
      childPositions.push({ x: childX, y: childY })

      const childLayout = computeTreeLayout(
        node.children[i],
        depth + 1,
        childXMin,
        childXMax,
        nodeWidth,
        levelHeight,
      )
      result.push(...childLayout)
    }
  }

  result.push({
    id: node.id,
    keys: node.keys,
    isLeaf: node.isLeaf,
    x,
    y,
    width,
    childPositions,
  })

  return result
}

const SAMPLE_SEQUENCES: { name: string; keys: number[]; order: number }[] = [
  { name: '3阶B树: [10,20,5,15,25,3,8]', keys: [10, 20, 5, 15, 25, 3, 8], order: 3 },
  { name: '4阶B树: [50,30,70,20,40,60,80,10,25,35]', keys: [50, 30, 70, 20, 40, 60, 80, 10, 25, 35], order: 4 },
  { name: '3阶B树: [1,2,3,4,5,6,7,8,9]', keys: [1, 2, 3, 4, 5, 6, 7, 8, 9], order: 3 },
]

export default function BTreeVisualization() {
  const [seqIndex, setSeqIndex] = useState(0)
  const [allSteps, setAllSteps] = useState<BTreeStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [insertKey, setInsertKey] = useState(16)
  const [searchKey, setSearchKey] = useState(15)
  const timerRef = useRef<number | null>(null)
  const [btree, setBtree] = useState<BTreeDemo | null>(null)

  const buildInitialTree = useCallback(() => {
    nodeIdCounter = 0
    const seq = SAMPLE_SEQUENCES[seqIndex]
    const tree = new BTreeDemo(seq.order)
    const steps: BTreeStep[] = []
    for (const key of seq.keys) {
      const insertSteps = tree.insertWithSteps(key)
      steps.push(...insertSteps)
    }
    steps.push({
      description: `初始树构建完成，共插入 ${seq.keys.length} 个关键字`,
      phase: 'idle',
      tree: cloneTree(tree.root),
      highlights: [],
    })
    setBtree(tree)
    setAllSteps(steps)
    setCurrentStep(steps.length - 1)
    setIsPlaying(false)
  }, [seqIndex])

  useEffect(() => {
    buildInitialTree()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const doInsert = useCallback(() => {
    if (!btree) return
    const steps = btree.insertWithSteps(insertKey)
    setAllSteps(prev => [...prev, ...steps])
    setCurrentStep(prev => prev + 1)
    setIsPlaying(false)
  }, [btree, insertKey])

  const doSearch = useCallback(() => {
    if (!btree) return
    const steps = btree.searchWithSteps(searchKey)
    setAllSteps(prev => [...prev, ...steps])
    setCurrentStep(prev => prev + 1)
    setIsPlaying(false)
  }, [btree, searchKey])

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
    tree: createEmptyNode(true),
    highlights: [],
  }

  const highlightMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const h of current.highlights) {
      map.set(h.nodeId, h.color)
    }
    return map
  }, [current.highlights])

  // Compute SVG layout
  const layoutNodes = useMemo(() => {
    const treeHeight = getTreeHeight(current.tree)
    const levelHeight = Math.min(90, 360 / Math.max(treeHeight, 1))
    const svgWidth = 760
    const nodeWidth = 80
    return computeTreeLayout(current.tree, 0, 0, svgWidth, nodeWidth, levelHeight)
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

  // Collect edges from layout
  const edges: { from: string; toX: number; toY: number; fromX: number; fromY: number; fromW: number }[] = []
  for (const node of layoutNodes) {
    for (const childPos of node.childPositions) {
      edges.push({
        from: node.id,
        fromX: node.x,
        fromY: node.y,
        fromW: node.width,
        toX: childPos.x,
        toY: childPos.y,
      })
    }
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

      {/* Insert controls */}
      <div className="viz-controls">
        <label style={labelStyle}>
          插入关键字:
          <input type="number" value={insertKey}
            onChange={e => setInsertKey(Number(e.target.value))}
            style={inputStyle} />
        </label>
        <button className="btn btn-primary" onClick={doInsert}>插入</button>
      </div>

      {/* Search controls */}
      <div className="viz-controls">
        <label style={labelStyle}>
          查找关键字:
          <input type="number" value={searchKey}
            onChange={e => setSearchKey(Number(e.target.value))}
            style={inputStyle} />
        </label>
        <button className="btn btn-primary" onClick={doSearch}>查找</button>
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

      {/* SVG B-Tree Visualization */}
      <div className="viz-canvas" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '1rem', minHeight: '300px', padding: '1rem 0.5rem', overflow: 'auto',
      }}>
        <svg width="100%" height={svgHeight} viewBox={`0 0 760 ${svgHeight}`}
          style={{ maxWidth: '760px', overflow: 'visible' }}>
          {/* Edges */}
          {edges.map((edge, i) => {
            const hlColor = highlightMap.get(edge.from)
            return (
              <line key={`edge-${i}`}
                x1={edge.fromX} y1={edge.fromY + 22}
                x2={edge.toX} y2={edge.toY - 22}
                stroke={hlColor ? '#94a3b8' : '#4b5563'}
                strokeWidth={1.5}
                opacity={0.6}
              />
            )
          })}

          {/* Nodes */}
          {layoutNodes.map(node => {
            const hlColor = highlightMap.get(node.id)
            const keyWidth = 36
            const nodeW = node.keys.length * keyWidth + 12
            const nodeH = 36

            return (
              <g key={node.id}>
                {/* Node background */}
                <rect
                  x={node.x - nodeW / 2} y={node.y - nodeH / 2}
                  width={nodeW} height={nodeH}
                  rx={6} ry={6}
                  fill={hlColor || '#1e3a5f'}
                  stroke={hlColor ? '#fff' : '#4b5563'}
                  strokeWidth={hlColor ? 2.5 : 1.5}
                  style={{ transition: 'all 0.3s ease' }}
                />

                {/* Keys */}
                {node.keys.map((key, ki) => {
                  const kx = node.x - nodeW / 2 + 6 + ki * keyWidth + keyWidth / 2
                  return (
                    <g key={ki}>
                      {/* Separator line */}
                      {ki > 0 && (
                        <line
                          x1={node.x - nodeW / 2 + 6 + ki * keyWidth}
                          y1={node.y - nodeH / 2 + 4}
                          x2={node.x - nodeW / 2 + 6 + ki * keyWidth}
                          y2={node.y + nodeH / 2 - 4}
                          stroke={hlColor ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)'}
                          strokeWidth={1}
                        />
                      )}
                      <text
                        x={kx} y={node.y + 1}
                        textAnchor="middle" dominantBaseline="middle"
                        fill="#fff" fontSize={14} fontWeight="bold"
                        fontFamily="Consolas, Monaco, monospace"
                      >
                        {key}
                      </text>
                    </g>
                  )
                })}

                {/* Leaf indicator */}
                {node.isLeaf && (
                  <circle
                    cx={node.x + nodeW / 2 + 8} cy={node.y - nodeH / 2 + 4}
                    r={3} fill="#4ade80" opacity={0.6}
                  />
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
          <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
          找到 / 插入成功
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
          当前访问节点
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px', display: 'inline-block' }} />
          节点分裂
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }} />
          已存在 / 新节点
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
          叶子节点
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        {current.phase === 'search' && current.found !== undefined && (
          <div style={{ fontSize: '0.9rem', color: current.found ? '#4ade80' : '#ef4444', fontWeight: 'bold' }}>
            {current.found ? '查找成功' : '查找失败'}
          </div>
        )}
      </div>
    </div>
  )
}
