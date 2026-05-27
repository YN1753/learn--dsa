import { useState, useEffect, useRef, useCallback } from 'react'

interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
}

interface NodePosition {
  x: number
  y: number
  value: number
  depth: number
}

type TraversalType = 'preorder' | 'inorder' | 'postorder' | 'levelorder'

const SVG_WIDTH = 780
const SVG_HEIGHT = 420
const NODE_RADIUS = 22
const LEVEL_HEIGHT = 70
const ROOT_Y = 45

function createNode(value: number): TreeNode {
  return { value, left: null, right: null }
}

function insertBST(root: TreeNode | null, value: number): TreeNode {
  if (root === null) return createNode(value)
  if (value < root.value) {
    root.left = insertBST(root.left, value)
  } else if (value > root.value) {
    root.right = insertBST(root.right, value)
  }
  return root
}

function getHeight(node: TreeNode | null): number {
  if (node === null) return -1
  return 1 + Math.max(getHeight(node.left), getHeight(node.right))
}

function getNodePositions(node: TreeNode | null, x: number, y: number, spread: number, positions: NodePosition[] = []): NodePosition[] {
  if (node === null) return positions
  positions.push({ x, y, value: node.value, depth: y })
  if (node.left) {
    getNodePositions(node.left, x - spread, y + LEVEL_HEIGHT, spread * 0.55, positions)
  }
  if (node.right) {
    getNodePositions(node.right, x + spread, y + LEVEL_HEIGHT, spread * 0.55, positions)
  }
  return positions
}

function getEdges(node: TreeNode | null, x: number, y: number, spread: number, edges: { x1: number; y1: number; x2: number; y2: number }[] = []): { x1: number; y1: number; x2: number; y2: number }[] {
  if (node === null) return edges
  if (node.left) {
    edges.push({ x1: x, y1: y, x2: x - spread, y2: y + LEVEL_HEIGHT })
    getEdges(node.left, x - spread, y + LEVEL_HEIGHT, spread * 0.55, edges)
  }
  if (node.right) {
    edges.push({ x1: x, y1: y, x2: x + spread, y2: y + LEVEL_HEIGHT })
    getEdges(node.right, x + spread, y + LEVEL_HEIGHT, spread * 0.55, edges)
  }
  return edges
}

function getTraversalOrder(node: TreeNode | null, type: TraversalType): number[] {
  const result: number[] = []
  function preorder(n: TreeNode | null) {
    if (n === null) return
    result.push(n.value)
    preorder(n.left)
    preorder(n.right)
  }
  function inorder(n: TreeNode | null) {
    if (n === null) return
    inorder(n.left)
    result.push(n.value)
    inorder(n.right)
  }
  function postorder(n: TreeNode | null) {
    if (n === null) return
    postorder(n.left)
    postorder(n.right)
    result.push(n.value)
  }
  function levelorder(root: TreeNode | null) {
    if (root === null) return
    const queue: TreeNode[] = [root]
    while (queue.length > 0) {
      const n = queue.shift()!
      result.push(n.value)
      if (n.left) queue.push(n.left)
      if (n.right) queue.push(n.right)
    }
  }
  switch (type) {
    case 'preorder': preorder(node); break
    case 'inorder': inorder(node); break
    case 'postorder': postorder(node); break
    case 'levelorder': levelorder(node); break
  }
  return result
}

function searchBST(node: TreeNode | null, target: number, path: number[] = []): number[] {
  if (node === null) return path
  path.push(node.value)
  if (target === node.value) return path
  if (target < node.value) return searchBST(node.left, target, path)
  return searchBST(node.right, target, path)
}

function buildDefaultTree(): TreeNode {
  const values = [50, 30, 70, 20, 40, 60, 80]
  let root: TreeNode | null = null
  for (const v of values) root = insertBST(root, v)
  return root!
}

const TRAVERSAL_LABELS: Record<TraversalType, string> = {
  preorder: '前序遍历 (根→左→右)',
  inorder: '中序遍历 (左→根→右)',
  postorder: '后序遍历 (左→右→根)',
  levelorder: '层序遍历 (逐层)',
}

export default function BinaryTreeVisualization() {
  const [tree, setTree] = useState<TreeNode>(buildDefaultTree)
  const [traversalType, setTraversalType] = useState<TraversalType>('preorder')
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set())
  const [currentNode, setCurrentNode] = useState<number | null>(null)
  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('选择操作开始演示')
  const [insertValue, setInsertValue] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [mode, setMode] = useState<'idle' | 'traversal' | 'search'>('idle')
  const timerRef = useRef<number | null>(null)
  const stepRef = useRef(0)
  const sequenceRef = useRef<number[]>([])

  const spread = Math.max(100, 220 - getHeight(tree) * 25)
  const positions = getNodePositions(tree, SVG_WIDTH / 2, ROOT_Y, spread)
  const edges = getEdges(tree, SVG_WIDTH / 2, ROOT_Y, spread)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetHighlight = useCallback(() => {
    clearTimer()
    setHighlightedNodes(new Set())
    setCurrentNode(null)
    setVisitedNodes(new Set())
    setIsPlaying(false)
    setMode('idle')
    stepRef.current = 0
    sequenceRef.current = []
  }, [clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const startTraversal = useCallback(() => {
    resetHighlight()
    const order = getTraversalOrder(tree, traversalType)
    if (order.length === 0) return
    sequenceRef.current = order
    stepRef.current = 0
    setMode('traversal')
    setIsPlaying(true)
    setDescription(`开始${TRAVERSAL_LABELS[traversalType]}...`)

    timerRef.current = window.setInterval(() => {
      stepRef.current++
      if (stepRef.current >= order.length) {
        clearTimer()
        setIsPlaying(false)
        setDescription(`${TRAVERSAL_LABELS[traversalType]}完成！共访问 ${order.length} 个节点。`)
        setCurrentNode(null)
        return
      }
      const val = order[stepRef.current]
      setCurrentNode(val)
      setVisitedNodes(prev => new Set([...prev, order[stepRef.current - 1]]))
      setDescription(`遍历步骤 ${stepRef.current + 1}/${order.length}: 访问节点 ${val}`)
    }, speed)
  }, [tree, traversalType, speed, resetHighlight, clearTimer])

  const startSearch = useCallback(() => {
    const target = parseInt(searchValue)
    if (isNaN(target)) {
      setDescription('请输入有效的搜索值')
      return
    }
    resetHighlight()
    const path = searchBST(tree, target)
    if (path.length === 0) {
      setDescription(`树为空，无法搜索`)
      return
    }
    sequenceRef.current = path
    stepRef.current = 0
    setMode('search')
    setIsPlaying(true)
    setDescription(`搜索节点 ${target}...`)

    timerRef.current = window.setInterval(() => {
      if (stepRef.current >= path.length) {
        clearTimer()
        setIsPlaying(false)
        const found = path[path.length - 1] === target
        if (found) {
          setDescription(`找到节点 ${target}！搜索路径: ${path.join(' → ')}`)
        } else {
          setDescription(`未找到节点 ${target}。搜索路径: ${path.join(' → ')}`)
        }
        return
      }
      const val = path[stepRef.current]
      setCurrentNode(val)
      setVisitedNodes(prev => new Set([...prev, val]))
      setDescription(`搜索步骤 ${stepRef.current + 1}: 检查节点 ${val}${val === target ? ' ✓ 找到！' : val < target ? ' → 向右' : ' → 向左'}`)
      stepRef.current++
    }, speed)
  }, [tree, searchValue, speed, resetHighlight, clearTimer])

  const handleInsert = useCallback(() => {
    const val = parseInt(insertValue)
    if (isNaN(val)) {
      setDescription('请输入有效的插入值')
      return
    }
    const exists = searchBST(tree, val).length > 0 && searchBST(tree, val)[searchBST(tree, val).length - 1] === val
    if (exists) {
      setDescription(`节点 ${val} 已存在，BST 不允许重复值`)
      return
    }
    const newTree = JSON.parse(JSON.stringify(tree)) as TreeNode
    insertBST(newTree, val)
    setTree(newTree)
    setInsertValue('')
    resetHighlight()
    setDescription(`已插入节点 ${val}，中序遍历: [${getTraversalOrder(newTree, 'inorder').join(', ')}]`)
  }, [tree, insertValue, resetHighlight])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription('已暂停')
    } else {
      if (mode === 'traversal') {
        const order = sequenceRef.current
        timerRef.current = window.setInterval(() => {
          stepRef.current++
          if (stepRef.current >= order.length) {
            clearTimer()
            setIsPlaying(false)
            setDescription(`${TRAVERSAL_LABELS[traversalType]}完成！共访问 ${order.length} 个节点。`)
            setCurrentNode(null)
            return
          }
          const val = order[stepRef.current]
          setCurrentNode(val)
          setVisitedNodes(prev => new Set([...prev, order[stepRef.current - 1]]))
          setDescription(`遍历步骤 ${stepRef.current + 1}/${order.length}: 访问节点 ${val}`)
        }, speed)
        setIsPlaying(true)
      } else if (mode === 'search') {
        startSearch()
      }
    }
  }, [isPlaying, mode, speed, traversalType, clearTimer, startSearch])

  const handleReset = useCallback(() => {
    resetHighlight()
    setDescription('已重置，选择操作开始演示')
  }, [resetHighlight])

  const handleResetTree = useCallback(() => {
    setTree(buildDefaultTree())
    resetHighlight()
    setDescription('已重置为默认树结构')
  }, [resetHighlight])

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <select
          value={traversalType}
          onChange={e => { setTraversalType(e.target.value as TraversalType); resetHighlight() }}
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem'
          }}
        >
          <option value="preorder">前序遍历 (根→左→右)</option>
          <option value="inorder">中序遍历 (左→根→右)</option>
          <option value="postorder">后序遍历 (左→右→根)</option>
          <option value="levelorder">层序遍历 (逐层)</option>
        </select>
        <button className="btn btn-primary" onClick={startTraversal} disabled={isPlaying}>
          开始遍历
        </button>
        <button className="btn btn-secondary" onClick={togglePlay} disabled={mode === 'idle'}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置高亮
        </button>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
          速度:
        </span>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={2200 - speed}
          onChange={e => setSpeed(2200 - parseInt(e.target.value))}
          title={`速度: ${speed}ms`}
        />
      </div>

      <div className="viz-controls" style={{ marginTop: '0.25rem' }}>
        <input
          type="number"
          value={insertValue}
          onChange={e => setInsertValue(e.target.value)}
          placeholder="输入插入值"
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '110px',
            fontSize: '0.85rem'
          }}
        />
        <button className="btn btn-primary" onClick={handleInsert} disabled={isPlaying}>
          插入节点
        </button>
        <input
          type="number"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="输入搜索值"
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '110px',
            fontSize: '0.85rem'
          }}
        />
        <button className="btn btn-primary" onClick={startSearch} disabled={isPlaying}>
          搜索节点
        </button>
        <button className="btn btn-secondary" onClick={handleResetTree}>
          重置树
        </button>
      </div>

      <div className="viz-canvas" style={{ padding: '1rem', overflow: 'hidden' }}>
        <svg width="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ display: 'block' }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {edges.map((e, i) => {
            const isVisited = visitedNodes.has(
              positions.find(p => p.x === e.x2 && p.y === e.y2)?.value ?? -1
            )
            return (
              <line
                key={i}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke={isVisited ? 'var(--accent)' : 'var(--border)'}
                strokeWidth={isVisited ? 2.5 : 1.5}
                strokeOpacity={0.7}
              />
            )
          })}

          {/* Nodes */}
          {positions.map(p => {
            const isCurrent = currentNode === p.value
            const isVisited = visitedNodes.has(p.value)
            const isHighlighted = highlightedNodes.has(p.value)

            let fillColor = 'var(--bg-card)'
            let strokeColor = 'var(--border)'
            let textColor = 'var(--text-primary)'
            let extraFilter = ''

            if (isCurrent) {
              fillColor = 'var(--accent)'
              strokeColor = '#60a5fa'
              textColor = '#ffffff'
              extraFilter = 'url(#glow)'
            } else if (isVisited) {
              fillColor = '#1e3a5f'
              strokeColor = 'var(--accent)'
            } else if (isHighlighted) {
              fillColor = 'rgba(245, 158, 11, 0.3)'
              strokeColor = 'var(--warning)'
            }

            return (
              <g key={p.value} filter={extraFilter}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={NODE_RADIUS}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isCurrent ? 3 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textColor}
                  fontSize="14"
                  fontWeight="600"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ transition: 'fill 0.3s ease' }}
                >
                  {p.value}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(15, ${SVG_HEIGHT - 55})`}>
            <circle cx={0} cy={0} r={8} fill="var(--bg-card)" stroke="var(--border)" strokeWidth={1.5} />
            <text x={14} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">未访问</text>
            <circle cx={70} cy={0} r={8} fill="#1e3a5f" stroke="var(--accent)" strokeWidth={1.5} />
            <text x={84} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">已访问</text>
            <circle cx={140} cy={0} r={8} fill="var(--accent)" stroke="#60a5fa" strokeWidth={2} />
            <text x={154} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">当前节点</text>
          </g>

          {/* Traversal order preview */}
          {mode !== 'idle' && sequenceRef.current.length > 0 && (
            <g transform={`translate(${SVG_WIDTH - 200}, ${SVG_HEIGHT - 55})`}>
              <text x={0} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">
                序列: [{sequenceRef.current.join(', ')}]
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="viz-info">
        {description}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>树信息</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>高度: {getHeight(tree)} | 节点数: {positions.length}</div>
            <div>中序遍历: [{getTraversalOrder(tree, 'inorder').join(', ')}]</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>遍历说明</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            {traversalType === 'preorder' && '根→左→右：先访问根，再左子树，最后右子树。用于复制树结构。'}
            {traversalType === 'inorder' && '左→根→右：先左子树，再根，最后右子树。BST 中序遍历为升序。'}
            {traversalType === 'postorder' && '左→右→根：先左子树，再右子树，最后根。用于释放内存。'}
            {traversalType === 'levelorder' && '逐层从左到右：使用队列按层访问。用于 BFS 最短路径。'}
          </div>
        </div>
      </div>
    </div>
  )
}
