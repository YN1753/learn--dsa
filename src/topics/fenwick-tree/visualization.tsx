import { useState, useEffect, useRef, useCallback } from 'react'

interface BITNode {
  index: number
  value: number
  lowbit: number
  parent: number | null
  children: number[]
  x: number
  y: number
}

function computeLowbit(x: number): number {
  return x & (-x)
}

function buildBITree(n: number): BITNode[] {
  // Build the logical parent-child tree structure
  const nodes: BITNode[] = []
  const childrenMap: Map<number, number[]> = new Map()

  // Initialize nodes
  for (let i = 0; i <= n; i++) {
    childrenMap.set(i, [])
  }

  // Determine parent for each node: parent(i) = i + lowbit(i)
  for (let i = 1; i <= n; i++) {
    const parent = i + computeLowbit(i)
    if (parent <= n) {
      childrenMap.get(parent)!.push(i)
    }
  }

  // The root of the tree is n (or the largest power of 2 <= n, but the logical root
  // of the BIT tree structure is the node that no other node points to as parent.
  // Actually, for visualization we treat the node with no parent as root.
  // Find root: node that is not a child of any other node within [1..n]
  const hasParent = new Set<number>()
  for (let i = 1; i <= n; i++) {
    const parent = i + computeLowbit(i)
    if (parent <= n) hasParent.add(i)
  }

  // Build BITNode objects
  for (let i = 0; i <= n; i++) {
    const parent = i + computeLowbit(i)
    nodes.push({
      index: i,
      value: 0,
      lowbit: i === 0 ? 0 : computeLowbit(i),
      parent: i === 0 ? null : (parent <= n ? parent : null),
      children: childrenMap.get(i) || [],
      x: 0,
      y: 0,
    })
  }

  return nodes
}

const SVG_WIDTH = 780
const SVG_HEIGHT = 480
const NODE_RADIUS = 22

function layoutTree(nodes: BITNode[]): void {
  // BFS to assign levels, then spread horizontally
  const visited = new Set<number>()
  const levels: Map<number, number[]> = new Map()

  // Find all roots (nodes with no parent)
  const roots: number[] = []
  for (let i = 1; i < nodes.length; i++) {
    if (nodes[i].parent === null) {
      roots.push(i)
    }
  }

  // BFS from roots
  const queue: { idx: number; level: number }[] = []
  for (const r of roots) {
    queue.push({ idx: r, level: 0 })
    visited.add(r)
  }

  while (queue.length > 0) {
    const { idx, level } = queue.shift()!
    if (!levels.has(level)) levels.set(level, [])
    levels.get(level)!.push(idx)

    for (const child of nodes[idx].children) {
      if (!visited.has(child)) {
        visited.add(child)
        queue.push({ idx: child, level: level + 1 })
      }
    }
  }

  // Assign positions
  const maxLevel = Math.max(...levels.keys(), 0)
  const levelHeight = Math.min(70, (SVG_HEIGHT - 80) / (maxLevel + 1))

  for (const [level, indices] of levels) {
    const count = indices.length
    const totalWidth = SVG_WIDTH - 80
    const spacing = totalWidth / (count + 1)
    indices.forEach((idx, i) => {
      nodes[idx].x = 40 + spacing * (i + 1)
      nodes[idx].y = 50 + level * levelHeight
    })
  }
}

function buildDefaultArray(): number[] {
  return [3, 1, 4, 1, 5, 9, 2, 6]
}

function buildBITFromArray(arr: number[]): number[] {
  const n = arr.length
  const tree = new Array(n + 1).fill(0)
  // O(n) build
  for (let i = 0; i < n; i++) {
    tree[i + 1] = arr[i]
  }
  for (let i = 1; i <= n; i++) {
    const parent = i + computeLowbit(i)
    if (parent <= n) {
      tree[parent] += tree[i]
    }
  }
  return tree
}

export default function FenwickTreeVisualization() {
  const [arr, setArr] = useState<number[]>(buildDefaultArray)
  const [tree, setTree] = useState<number[]>(() => buildBITFromArray(buildDefaultArray()))
  const [n] = useState(8)
  const [nodes, setNodes] = useState<BITNode[]>(() => {
    const ns = buildBITree(8)
    layoutTree(ns)
    return ns
  })
  const [, setHighlightNodes] = useState<Set<number>>(new Set())
  const [currentNode, setCurrentNode] = useState<number | null>(null)
  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(700)
  const [description, setDescription] = useState('选择"单点更新"或"前缀和查询"开始演示')
  const [mode, setMode] = useState<'idle' | 'update' | 'query'>('idle')
  const [inputIndex, setInputIndex] = useState('3')
  const [inputValue, setInputValue] = useState('10')
  const [inputArray, setInputArray] = useState('3,1,4,1,5,9,2,6')
  const timerRef = useRef<number | null>(null)
  const stepRef = useRef(0)
  const sequenceRef = useRef<number[]>([])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetHighlight = useCallback(() => {
    clearTimer()
    setCurrentNode(null)
    setVisitedNodes(new Set())
    setHighlightNodes(new Set())
    setIsPlaying(false)
    setMode('idle')
    stepRef.current = 0
    sequenceRef.current = []
  }, [clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const rebuildTree = useCallback((newArr: number[]) => {
    const newTree = buildBITFromArray(newArr)
    setArr(newArr)
    setTree(newTree)
    const ns = buildBITree(newArr.length)
    // Update values
    for (let i = 1; i <= newArr.length; i++) {
      ns[i].value = newTree[i]
    }
    layoutTree(ns)
    setNodes(ns)
    resetHighlight()
  }, [resetHighlight])

  const handleUpdate = useCallback(() => {
    const idx = parseInt(inputIndex)
    const val = parseInt(inputValue)
    if (isNaN(idx) || isNaN(val) || idx < 1 || idx > n) {
      setDescription(`请输入有效的索引 (1-${n}) 和值`)
      return
    }
    resetHighlight()

    // Collect update path
    const path: number[] = []
    let i = idx
    while (i <= n) {
      path.push(i)
      i += computeLowbit(i)
    }

    sequenceRef.current = path
    stepRef.current = 0
    setMode('update')
    setIsPlaying(true)
    setDescription(`单点更新: 在位置 ${idx} 加上 ${val}...`)

    timerRef.current = window.setInterval(() => {
      if (stepRef.current >= path.length) {
        // Apply the update
        const newArr = [...arr]
        newArr[idx - 1] += val
        rebuildTree(newArr)
        clearTimer()
        setIsPlaying(false)
        setCurrentNode(null)
        setDescription(`更新完成！位置 ${idx} 加上了 ${val}。更新路径: [${path.join(' → ')}]`)
        return
      }
      const nid = path[stepRef.current]
      setCurrentNode(nid)
      setVisitedNodes(prev => {
        const next = new Set(prev)
        if (stepRef.current > 0) next.add(path[stepRef.current - 1])
        return next
      })
      setDescription(`更新步骤 ${stepRef.current + 1}/${path.length}: 更新 tree[${nid}]，下一步跳到 tree[${nid + computeLowbit(nid)}]`)
      stepRef.current++
    }, speed)
  }, [inputIndex, inputValue, arr, n, speed, resetHighlight, clearTimer, rebuildTree])

  const handleQuery = useCallback(() => {
    const idx = parseInt(inputIndex)
    if (isNaN(idx) || idx < 1 || idx > n) {
      setDescription(`请输入有效的索引 (1-${n})`)
      return
    }
    resetHighlight()

    // Collect query path
    const path: number[] = []
    let i = idx
    while (i > 0) {
      path.push(i)
      i -= computeLowbit(i)
    }

    sequenceRef.current = path
    stepRef.current = 0
    setMode('query')
    setIsPlaying(true)
    setDescription(`前缀和查询: query(${idx})...`)

    let sum = 0
    timerRef.current = window.setInterval(() => {
      if (stepRef.current >= path.length) {
        clearTimer()
        setIsPlaying(false)
        setCurrentNode(null)
        setDescription(`查询完成！query(${idx}) = ${sum}。查询路径: [${path.join(' → ')}]`)
        return
      }
      const nid = path[stepRef.current]
      sum += tree[nid]
      setCurrentNode(nid)
      setVisitedNodes(prev => {
        const next = new Set(prev)
        if (stepRef.current > 0) next.add(path[stepRef.current - 1])
        return next
      })
      setDescription(`查询步骤 ${stepRef.current + 1}/${path.length}: sum += tree[${nid}] = ${tree[nid]}，当前 sum = ${sum}`)
      stepRef.current++
    }, speed)
  }, [inputIndex, tree, n, speed, resetHighlight, clearTimer])

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription('已暂停')
    } else {
      const seq = sequenceRef.current
      if (mode === 'update') {
        timerRef.current = window.setInterval(() => {
          stepRef.current++
          if (stepRef.current >= seq.length) {
            clearTimer()
            setIsPlaying(false)
            setCurrentNode(null)
            setDescription('动画完成')
            return
          }
          setCurrentNode(seq[stepRef.current])
          setVisitedNodes(prev => new Set([...prev, seq[stepRef.current - 1]]))
        }, speed)
      } else {
        let sum = 0
        for (let i = 0; i < stepRef.current; i++) sum += tree[seq[i]]
        timerRef.current = window.setInterval(() => {
          stepRef.current++
          if (stepRef.current >= seq.length) {
            clearTimer()
            setIsPlaying(false)
            setCurrentNode(null)
            setDescription('动画完成')
            return
          }
          sum += tree[seq[stepRef.current]]
          setCurrentNode(seq[stepRef.current])
          setVisitedNodes(prev => new Set([...prev, seq[stepRef.current - 1]]))
        }, speed)
      }
      setIsPlaying(true)
    }
  }, [isPlaying, speed, clearTimer, mode, tree])

  const handleReset = useCallback(() => {
    resetHighlight()
    setDescription('已重置高亮，选择操作开始演示')
  }, [resetHighlight])

  const handleResetArray = useCallback(() => {
    const newArr = buildDefaultArray()
    rebuildTree(newArr)
    setInputArray('3,1,4,1,5,9,2,6')
    setDescription('已重置为默认数组 [3,1,4,1,5,9,2,6]')
  }, [rebuildTree])

  const handleSetArray = useCallback(() => {
    const parts = inputArray.split(/[,，\s]+/).map(s => parseInt(s.trim())).filter(v => !isNaN(v))
    if (parts.length === 0 || parts.length > 16) {
      setDescription('请输入 1-16 个有效的数字')
      return
    }
    rebuildTree(parts)
    setDescription(`已设置数组为 [${parts.join(', ')}]`)
  }, [inputArray, rebuildTree])

  // Draw edges from parent to child
  const edges: { x1: number; y1: number; x2: number; y2: number; childIdx: number }[] = []
  for (let i = 1; i < nodes.length; i++) {
    const parentNodeIdx = nodes[i].parent
    if (parentNodeIdx !== null && parentNodeIdx < nodes.length) {
      const parent = nodes[parentNodeIdx]
      edges.push({
        x1: parent.x,
        y1: parent.y,
        x2: nodes[i].x,
        y2: nodes[i].y,
        childIdx: i,
      })
    }
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>数组:</span>
        <input
          type="text"
          value={inputArray}
          onChange={e => setInputArray(e.target.value)}
          placeholder="如: 3,1,4,1,5,9,2,6"
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '180px',
            fontSize: '0.85rem'
          }}
        />
        <button className="btn btn-secondary" onClick={handleSetArray}>
          设置数组
        </button>
        <button className="btn btn-secondary" onClick={handleResetArray}>
          重置数组
        </button>
      </div>

      <div className="viz-controls" style={{ marginTop: '0.25rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>索引:</span>
        <input
          type="text"
          value={inputIndex}
          onChange={e => setInputIndex(e.target.value)}
          placeholder="1-8"
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '50px',
            fontSize: '0.85rem'
          }}
        />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.3rem' }}>值:</span>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="10"
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '50px',
            fontSize: '0.85rem'
          }}
        />
        <button className="btn btn-primary" onClick={handleUpdate} disabled={isPlaying}>
          单点更新
        </button>
        <button className="btn btn-primary" onClick={handleQuery} disabled={isPlaying}>
          前缀和查询
        </button>
        <button className="btn btn-secondary" onClick={handleTogglePlay} disabled={mode === 'idle'}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置高亮
        </button>
      </div>

      <div className="viz-controls" style={{ marginTop: '0.25rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>速度:</span>
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

      <div className="viz-canvas" style={{ padding: '0.5rem', overflow: 'auto' }}>
        <svg width="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ display: 'block' }}>
          <defs>
            <filter id="bit-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" opacity="0.5" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e, i) => {
            const isVisited = visitedNodes.has(e.childIdx)
            const isCurrent = currentNode === e.childIdx || currentNode === nodes.findIndex((_, idx) => idx > 0 && nodes[idx].x === e.x1 && nodes[idx].y === e.y1)
            return (
              <line
                key={`edge-${i}`}
                x1={e.x1}
                y1={e.y1 + NODE_RADIUS}
                x2={e.x2}
                y2={e.y2 - NODE_RADIUS}
                stroke={isVisited || isCurrent ? 'var(--accent)' : 'var(--border)'}
                strokeWidth={isVisited || isCurrent ? 2.5 : 1.5}
                strokeOpacity={0.7}
              />
            )
          })}

          {/* Nodes */}
          {nodes.slice(1).map(node => {
            const isCurrent = currentNode === node.index
            const isVisited = visitedNodes.has(node.index)

            let fillColor = 'var(--bg-card)'
            let strokeColor = 'var(--border)'
            let textColor = 'var(--text-primary)'
            let extraFilter = ''

            if (isCurrent) {
              fillColor = 'var(--accent)'
              strokeColor = '#60a5fa'
              textColor = '#ffffff'
              extraFilter = 'url(#bit-glow)'
            } else if (isVisited) {
              fillColor = '#1e3a5f'
              strokeColor = 'var(--accent)'
            }

            return (
              <g key={node.index} filter={extraFilter}>
                {/* Lowbit indicator ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS + 4}
                  fill="none"
                  stroke={node.lowbit > 1 ? '#f59e0b' : 'transparent'}
                  strokeWidth={1.5}
                  strokeDasharray={node.lowbit > 1 ? '3 2' : ''}
                  opacity={0.6}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isCurrent ? 3 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Index label */}
                <text
                  x={node.x}
                  y={node.y - 5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textColor}
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ transition: 'fill 0.3s ease' }}
                >
                  {node.index}
                </text>
                {/* Value label */}
                <text
                  x={node.x}
                  y={node.y + 9}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isCurrent ? '#e0e7ff' : 'var(--text-secondary)'}
                  fontSize="10"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ transition: 'fill 0.3s ease' }}
                >
                  v={tree[node.index]}
                </text>
              </g>
            )
          })}

          {/* Array display at top */}
          <g transform={`translate(40, ${SVG_HEIGHT - 70})`}>
            <text x={0} y={0} fill="var(--text-secondary)" fontSize="11" fontWeight="600">
              原始数组:
            </text>
            {arr.map((v, i) => (
              <g key={`arr-${i}`}>
                <rect
                  x={70 + i * 55}
                  y={-12}
                  width={48}
                  height={24}
                  rx={4}
                  fill="var(--bg-card)"
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={94 + i * 55}
                  y={2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-primary)"
                  fontSize="11"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {v}
                </text>
                <text
                  x={94 + i * 55}
                  y={22}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-secondary)"
                  fontSize="9"
                >
                  [{i + 1}]
                </text>
              </g>
            ))}
          </g>

          {/* Legend */}
          <g transform={`translate(15, ${SVG_HEIGHT - 25})`}>
            <circle cx={0} cy={0} r={8} fill="var(--bg-card)" stroke="var(--border)" strokeWidth={1.5} />
            <text x={14} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">普通节点</text>
            <circle cx={90} cy={0} r={8} fill="#1e3a5f" stroke="var(--accent)" strokeWidth={1.5} />
            <text x={104} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">已访问</text>
            <circle cx={175} cy={0} r={8} fill="var(--accent)" stroke="#60a5fa" strokeWidth={2} />
            <text x={189} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">当前节点</text>
            <circle cx={260} cy={0} r={8} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" />
            <text x={274} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">lowbit {'>'} 1</text>
          </g>

          {/* Info panel */}
          <g transform={`translate(${SVG_WIDTH - 200}, ${SVG_HEIGHT - 25})`}>
            <text x={0} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">
              n={n} | tree[i] 负责 [i-lowbit(i)+1, i]
            </text>
          </g>
        </svg>
      </div>

      <div className="viz-info">
        {description}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>树状数组信息</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>数组长度: {n}</div>
            <div>tree 数组: [{tree.slice(1).join(', ')}]</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>操作说明</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>更新: i += lowbit(i)，沿树向上跳转</div>
            <div>查询: i -= lowbit(i)，向前累加区间</div>
            <div>虚线圈 = lowbit {'>'} 1 的节点</div>
          </div>
        </div>
      </div>
    </div>
  )
}
