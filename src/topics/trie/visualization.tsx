import { useState, useEffect, useRef, useCallback } from 'react'

interface TrieNodeData {
  char: string
  isEnd: boolean
  children: Map<string, TrieNodeData>
  id: string
}

interface NodePosition {
  x: number
  y: number
  char: string
  isEnd: boolean
  id: string
  parentId: string | null
}

const SVG_WIDTH = 780
const SVG_HEIGHT = 440
const NODE_RADIUS = 20
const ROOT_Y = 40

let nodeIdCounter = 0
function makeNodeId(): string {
  return `node-${nodeIdCounter++}`
}

function createTrieNode(char: string): TrieNodeData {
  return { char, isEnd: false, children: new Map(), id: makeNodeId() }
}

function insertWord(root: TrieNodeData, word: string): { newNodeIds: string[] } {
  let node = root
  const newNodeIds: string[] = []
  for (const char of word) {
    if (!node.children.has(char)) {
      const child = createTrieNode(char)
      node.children.set(char, child)
      newNodeIds.push(child.id)
    }
    node = node.children.get(char)!
  }
  node.isEnd = true
  return { newNodeIds }
}

function searchWord(root: TrieNodeData, word: string): { path: string[]; found: boolean } {
  let node = root
  const path: string[] = [node.id]
  for (const char of word) {
    if (!node.children.has(char)) return { path, found: false }
    node = node.children.get(char)!
    path.push(node.id)
  }
  return { path, found: node.isEnd }
}

function getAllWords(node: TrieNodeData, prefix: string = '', words: string[] = []): string[] {
  if (node.isEnd) words.push(prefix)
  for (const [char, child] of node.children) {
    getAllWords(child, prefix + char, words)
  }
  return words
}

function getNodeCount(node: TrieNodeData): number {
  let count = 1
  for (const child of node.children.values()) {
    count += getNodeCount(child)
  }
  return count
}

function layoutTrie(
  node: TrieNodeData,
  x: number,
  y: number,
  spread: number,
  parentId: string | null,
  positions: NodePosition[] = []
): NodePosition[] {
  positions.push({ x, y, char: node.char, isEnd: node.isEnd, id: node.id, parentId })
  const children = Array.from(node.children.entries())
  if (children.length === 0) return positions

  const totalWidth = (children.length - 1) * spread
  const startX = x - totalWidth / 2
  children.forEach(([_, child], i) => {
    const childX = startX + i * spread
    const childY = y + 65
    layoutTrie(child, childX, childY, spread * 0.6, node.id, positions)
  })
  return positions
}

function getEdges(
  node: TrieNodeData,
  x: number,
  y: number,
  spread: number,
  edges: { x1: number; y1: number; x2: number; y2: number; char: string; childId: string }[] = []
): typeof edges {
  const children = Array.from(node.children.entries())
  if (children.length === 0) return edges

  const totalWidth = (children.length - 1) * spread
  const startX = x - totalWidth / 2
  children.forEach(([char, child], i) => {
    const childX = startX + i * spread
    const childY = y + 65
    edges.push({ x1: x, y1: y, x2: childX, y2: childY, char, childId: child.id })
    getEdges(child, childX, childY, spread * 0.6, edges)
  })
  return edges
}

function getTreeDepth(node: TrieNodeData): number {
  let maxChild = 0
  for (const child of node.children.values()) {
    maxChild = Math.max(maxChild, getTreeDepth(child))
  }
  return 1 + maxChild
}

function getTreeWidth(node: TrieNodeData): number {
  const children = Array.from(node.children.values())
  if (children.length === 0) return 1
  let total = 0
  for (const child of children) {
    total += getTreeWidth(child)
  }
  return Math.max(total, 1)
}

function buildDefaultTrie(): TrieNodeData {
  nodeIdCounter = 0
  const root = createTrieNode('')
  const words = ['apple', 'app', 'bat', 'ball']
  for (const word of words) insertWord(root, word)
  return root
}

export default function TrieVisualization() {
  const [trie, setTrie] = useState<TrieNodeData>(buildDefaultTrie)
  const [inputWord, setInputWord] = useState('')
  const [currentNode, setCurrentNode] = useState<string | null>(null)
  const [newNodes, setNewNodes] = useState<Set<string>>(new Set())
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(700)
  const [description, setDescription] = useState('输入单词后点击"插入"或"搜索"开始演示')
  const [mode, setMode] = useState<'idle' | 'insert' | 'search'>('idle')
  const timerRef = useRef<number | null>(null)
  const stepRef = useRef(0)
  const sequenceRef = useRef<string[]>([])

  const depth = getTreeDepth(trie)
  const treeWidth = getTreeWidth(trie)
  const spread = Math.max(50, Math.min(200, 300 / Math.max(treeWidth, 1)))
  const positions = layoutTrie(trie, SVG_WIDTH / 2, ROOT_Y, spread, null)
  const edges = getEdges(trie, SVG_WIDTH / 2, ROOT_Y, spread)

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
    setNewNodes(new Set())
    setIsPlaying(false)
    setMode('idle')
    stepRef.current = 0
    sequenceRef.current = []
  }, [clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const handleInsert = useCallback(() => {
    const word = inputWord.trim().toLowerCase()
    if (!word || !/^[a-z]+$/.test(word)) {
      setDescription('请输入纯英文单词（仅小写字母）')
      return
    }
    resetHighlight()

    // Actually insert
    const newTrie = JSON.parse(JSON.stringify(trie)) as TrieNodeData
    // Rebuild with proper IDs by reconstructing
    nodeIdCounter = 0
    const rebuiltRoot = createTrieNode('')
    const existingWords = getAllWords(newTrie)
    for (const w of existingWords) insertWord(rebuiltRoot, w)
    const result = insertWord(rebuiltRoot, word)
    setTrie(rebuiltRoot)

    // Animate along the path
    const insertedPath: string[] = []
    let animNode = rebuiltRoot
    insertedPath.push(animNode.id)
    for (const char of word) {
      animNode = animNode.children.get(char)!
      insertedPath.push(animNode.id)
    }

    sequenceRef.current = insertedPath
    stepRef.current = 0
    setMode('insert')
    setIsPlaying(true)
    setNewNodes(new Set(result.newNodeIds))
    setDescription(`插入单词 "${word}"...`)

    timerRef.current = window.setInterval(() => {
      stepRef.current++
      if (stepRef.current >= insertedPath.length) {
        clearTimer()
        setIsPlaying(false)
        setCurrentNode(null)
        setVisitedNodes(prev => new Set([...prev, insertedPath[insertedPath.length - 1]]))
        setDescription(`插入完成！单词 "${word}" 已添加到字典树。当前共 ${getAllWords(rebuiltRoot).length} 个单词。`)
        return
      }
      const nid = insertedPath[stepRef.current]
      setCurrentNode(nid)
      setVisitedNodes(prev => new Set([...prev, insertedPath[stepRef.current - 1]]))
      setDescription(`插入步骤 ${stepRef.current}/${insertedPath.length - 1}: 沿路径遍历到字符 '${word[stepRef.current - 1]}'`)
    }, speed)
  }, [inputWord, trie, speed, resetHighlight, clearTimer])

  const handleSearch = useCallback(() => {
    const word = inputWord.trim().toLowerCase()
    if (!word || !/^[a-z]+$/.test(word)) {
      setDescription('请输入纯英文单词（仅小写字母）')
      return
    }
    resetHighlight()

    const { path, found } = searchWord(trie, word)
    sequenceRef.current = path
    stepRef.current = 0
    setMode('search')
    setIsPlaying(true)
    setDescription(`搜索单词 "${word}"...`)

    timerRef.current = window.setInterval(() => {
      if (stepRef.current >= path.length) {
        clearTimer()
        setIsPlaying(false)
        setCurrentNode(null)
        if (found) {
          setDescription(`搜索完成！单词 "${word}" 存在于字典树中。`)
        } else {
          setDescription(`搜索完成！单词 "${word}" 不存在于字典树中。`)
        }
        return
      }
      const nid = path[stepRef.current]
      setCurrentNode(nid)
      setVisitedNodes(prev => new Set([...prev, nid]))
      const charInfo = stepRef.current === 0 ? '根节点' : `字符 '${word[stepRef.current - 1]}'`
      setDescription(`搜索步骤 ${stepRef.current + 1}/${path.length}: 检查${charInfo}`)
      stepRef.current++
    }, speed)
  }, [inputWord, trie, speed, resetHighlight, clearTimer])

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription('已暂停')
    } else {
      // Resume
      const seq = sequenceRef.current
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
      setIsPlaying(true)
    }
  }, [isPlaying, speed, clearTimer])

  const handleReset = useCallback(() => {
    resetHighlight()
    setDescription('已重置高亮，输入单词开始新操作')
  }, [resetHighlight])

  const handleResetTrie = useCallback(() => {
    setTrie(buildDefaultTrie())
    resetHighlight()
    setInputWord('')
    setDescription('已重置为默认字典树（包含: apple, app, bat, ball）')
  }, [resetHighlight])

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <input
          type="text"
          value={inputWord}
          onChange={e => setInputWord(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleInsert() }}
          placeholder="输入英文单词"
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '130px',
            fontSize: '0.85rem'
          }}
        />
        <button className="btn btn-primary" onClick={handleInsert} disabled={isPlaying}>
          插入
        </button>
        <button className="btn btn-primary" onClick={handleSearch} disabled={isPlaying}>
          搜索
        </button>
        <button className="btn btn-secondary" onClick={handleTogglePlay} disabled={mode === 'idle'}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置高亮
        </button>
        <button className="btn btn-secondary" onClick={handleResetTrie}>
          重置字典树
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
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
          当前单词: [{getAllWords(trie).join(', ')}]
        </span>
      </div>

      <div className="viz-canvas" style={{ padding: '1rem', overflow: 'auto' }}>
        <svg width="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ display: 'block' }}>
          <defs>
            <filter id="trie-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Root node */}
          {positions.length > 0 && (() => {
            const root = positions[0]
            const isCurrent = currentNode === root.id
            return (
              <g>
                <circle
                  cx={root.x}
                  cy={root.y}
                  r={NODE_RADIUS - 2}
                  fill={isCurrent ? 'var(--accent)' : 'var(--bg-card)'}
                  stroke={isCurrent ? '#60a5fa' : 'var(--border)'}
                  strokeWidth={isCurrent ? 3 : 2}
                  filter={isCurrent ? 'url(#trie-glow)' : ''}
                />
                <text
                  x={root.x}
                  y={root.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-secondary)"
                  fontSize="11"
                  fontWeight="600"
                >
                  root
                </text>
              </g>
            )
          })()}

          {/* Edges */}
          {edges.map((e, i) => {
            const isVisited = visitedNodes.has(e.childId)
            return (
              <g key={i}>
                <line
                  x1={e.x1}
                  y1={e.y1 + (e.y1 === ROOT_Y ? NODE_RADIUS - 2 : NODE_RADIUS)}
                  x2={e.x2}
                  y2={e.y2 - NODE_RADIUS}
                  stroke={isVisited ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={isVisited ? 2.5 : 1.5}
                  strokeOpacity={0.7}
                />
                <text
                  x={(e.x1 + e.x2) / 2 + 8}
                  y={(e.y1 + e.y2) / 2}
                  fill={isVisited ? 'var(--accent)' : 'var(--text-secondary)'}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {e.char}
                </text>
              </g>
            )
          })}

          {/* Nodes (skip root, handled above) */}
          {positions.slice(1).map(p => {
            const isCurrent = currentNode === p.id
            const isVisited = visitedNodes.has(p.id)
            const isNew = newNodes.has(p.id)

            let fillColor = 'var(--bg-card)'
            let strokeColor = 'var(--border)'
            let textColor = 'var(--text-primary)'
            let extraFilter = ''

            if (isCurrent) {
              fillColor = 'var(--accent)'
              strokeColor = '#60a5fa'
              textColor = '#ffffff'
              extraFilter = 'url(#trie-glow)'
            } else if (isNew && !isVisited) {
              fillColor = 'rgba(16, 185, 129, 0.3)'
              strokeColor = '#10b981'
            } else if (isVisited) {
              fillColor = '#1e3a5f'
              strokeColor = 'var(--accent)'
            }

            return (
              <g key={p.id} filter={extraFilter}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={NODE_RADIUS}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isCurrent ? 3 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {p.isEnd && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={NODE_RADIUS + 4}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    opacity={0.8}
                  />
                )}
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
                  {p.char}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(15, ${SVG_HEIGHT - 50})`}>
            <circle cx={0} cy={0} r={8} fill="var(--bg-card)" stroke="var(--border)" strokeWidth={1.5} />
            <text x={14} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">普通节点</text>
            <circle cx={90} cy={0} r={8} fill="var(--bg-card)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" />
            <text x={104} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">单词结尾 (isEnd)</text>
            <circle cx={210} cy={0} r={8} fill="#1e3a5f" stroke="var(--accent)" strokeWidth={1.5} />
            <text x={224} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">已访问</text>
            <circle cx={290} cy={0} r={8} fill="var(--accent)" stroke="#60a5fa" strokeWidth={2} />
            <text x={304} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">当前节点</text>
          </g>

          {/* Word count info */}
          <g transform={`translate(${SVG_WIDTH - 180}, ${SVG_HEIGHT - 50})`}>
            <text x={0} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">
              单词数: {getAllWords(trie).length} | 节点数: {getNodeCount(trie)}
            </text>
          </g>
        </svg>
      </div>

      <div className="viz-info">
        {description}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>字典树信息</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>存储单词: {getAllWords(trie).join(', ') || '(空)'}</div>
            <div>节点总数: {getNodeCount(trie)} | 树深度: {depth}</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>操作说明</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>插入：沿路径逐字符创建节点，标记 isEnd</div>
            <div>搜索：沿路径逐字符查找，检查 isEnd 标志</div>
            <div>虚线圈 = 单词结尾节点</div>
          </div>
        </div>
      </div>
    </div>
  )
}
