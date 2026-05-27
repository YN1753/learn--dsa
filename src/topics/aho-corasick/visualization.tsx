import { useState, useEffect, useRef, useCallback } from 'react'

interface ACNodeData {
  char: string
  output: string[]
  children: Map<string, ACNodeData>
  fail: ACNodeData | null
  id: string
  depth: number
}

interface NodePosition {
  x: number
  y: number
  char: string
  output: string[]
  id: string
  parentId: string | null
}

interface FailLink {
  fromId: string
  toId: string
  fromX: number
  fromY: number
  toX: number
  toY: number
}

interface MatchStep {
  textIndex: number
  char: string
  currentNodeId: string
  failJumpId: string | null
  matchedPatterns: string[]
  description: string
}

const SVG_WIDTH = 780
const SVG_HEIGHT = 500
const NODE_RADIUS = 18
const ROOT_Y = 40

let nodeIdCounter = 0
function makeNodeId(): string {
  return `ac-node-${nodeIdCounter++}`
}

function createACNode(char: string, depth: number = 0): ACNodeData {
  return { char, output: [], children: new Map(), fail: null, id: makeNodeId(), depth }
}

function insertPattern(root: ACNodeData, pattern: string): void {
  let node = root
  for (const char of pattern) {
    if (!node.children.has(char)) {
      node.children.set(char, createACNode(char, node.depth + 1))
    }
    node = node.children.get(char)!
  }
  node.output.push(pattern)
}

function buildFailureLinks(root: ACNodeData): void {
  const queue: ACNodeData[] = []

  for (const child of root.children.values()) {
    child.fail = root
    queue.push(child)
  }

  while (queue.length > 0) {
    const current = queue.shift()!

    for (const [char, child] of current.children) {
      let failNode = current.fail

      while (failNode !== null && !failNode.children.has(char)) {
        failNode = failNode.fail
      }

      child.fail = failNode?.children.get(char) ?? root
      if (child.fail === child) {
        child.fail = root
      }

      // Propagate output links
      child.output = [...new Set([...child.output, ...child.fail.output])]

      queue.push(child)
    }
  }
}

function layoutTrie(
  node: ACNodeData,
  x: number,
  y: number,
  spread: number,
  parentId: string | null,
  positions: NodePosition[] = []
): NodePosition[] {
  positions.push({ x, y, char: node.char, output: node.output, id: node.id, parentId })
  const children = Array.from(node.children.entries())
  if (children.length === 0) return positions

  const totalWidth = (children.length - 1) * spread
  const startX = x - totalWidth / 2
  children.forEach(([_, child], i) => {
    const childX = startX + i * spread
    const childY = y + 60
    layoutTrie(child, childX, childY, spread * 0.6, node.id, positions)
  })
  return positions
}

function getTrieEdges(
  node: ACNodeData,
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
    const childY = y + 60
    edges.push({ x1: x, y1: y, x2: childX, y2: childY, char, childId: child.id })
    getTrieEdges(child, childX, childY, spread * 0.6, edges)
  })
  return edges
}

function getFailLinks(node: ACNodeData, posMap: Map<string, { x: number; y: number }>, links: FailLink[] = []): FailLink[] {
  if (node.fail && node.fail !== node) {
    const from = posMap.get(node.id)
    const to = posMap.get(node.fail.id)
    if (from && to) {
      links.push({
        fromId: node.id,
        toId: node.fail.id,
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y
      })
    }
  }
  for (const child of node.children.values()) {
    getFailLinks(child, posMap, links)
  }
  return links
}

function getNodeCount(node: ACNodeData): number {
  let count = 1
  for (const child of node.children.values()) {
    count += getNodeCount(child)
  }
  return count
}

function generateMatchSteps(root: ACNodeData, text: string): MatchStep[] {
  const steps: MatchStep[] = []
  let current = root

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    let failJumpId: string | null = null

    while (current !== root && !current.children.has(char)) {
      failJumpId = current.fail?.id ?? root.id
      current = current.fail!
    }

    if (current.children.has(char)) {
      current = current.children.get(char)!
    }

    const matchedPatterns = current.output.length > 0 ? [...current.output] : []

    steps.push({
      textIndex: i,
      char,
      currentNodeId: current.id,
      failJumpId,
      matchedPatterns,
      description: failJumpId
        ? `字符 '${char}': 失败跳转后匹配`
        : matchedPatterns.length > 0
          ? `字符 '${char}': 匹配到 ${matchedPatterns.map(p => `"${p}"`).join(', ')}`
          : `字符 '${char}': 沿 Trie 边前进`
    })
  }

  return steps
}

function buildDefaultAC(): { root: ACNodeData; patterns: string[] } {
  nodeIdCounter = 0
  const root = createACNode('')
  const patterns = ['he', 'she', 'his', 'hers']
  for (const p of patterns) insertPattern(root, p)
  buildFailureLinks(root)
  return { root, patterns }
}

export default function ACVisualization() {
  const [root, setRoot] = useState<ACNodeData>(() => buildDefaultAC().root)
  const [patterns, setPatterns] = useState<string[]>(['he', 'she', 'his', 'hers'])
  const [textInput, setTextInput] = useState('ushers')
  const [patternInput, setPatternInput] = useState('')
  const [matchSteps, setMatchSteps] = useState<MatchStep[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(700)
  const [description, setDescription] = useState('输入文本后点击"开始匹配"查看 AC自动机的工作过程')
  const [matchedNodeIds, setMatchedNodeIds] = useState<Set<string>>(new Set())
  const [failNodeId, setFailNodeId] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  const treeWidth = Math.max(3, Array.from(root.children.values()).length)
  const spread = Math.max(60, Math.min(180, 280 / treeWidth))
  const positions = layoutTrie(root, SVG_WIDTH / 2, ROOT_Y, spread, null)
  const edges = getTrieEdges(root, SVG_WIDTH / 2, ROOT_Y, spread)

  const posMap = new Map<string, { x: number; y: number }>()
  for (const p of positions) posMap.set(p.id, { x: p.x, y: p.y })
  const failLinks = getFailLinks(root, posMap)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const handleStartMatch = useCallback(() => {
    const text = textInput.trim()
    if (!text) {
      setDescription('请输入待匹配的文本')
      return
    }

    clearTimer()
    const steps = generateMatchSteps(root, text)
    setMatchSteps(steps)
    setCurrentStep(-1)
    setMatchedNodeIds(new Set())
    setFailNodeId(null)
    setIsPlaying(true)

    let step = -1
    timerRef.current = window.setInterval(() => {
      step++
      if (step >= steps.length) {
        clearTimer()
        setIsPlaying(false)
        setCurrentStep(step - 1)
        setDescription(`匹配完成！共找到 ${steps.reduce((s, st) => s + st.matchedPatterns.length, 0)} 个匹配。`)
        return
      }

      setCurrentStep(step)
      const s = steps[step]
      setFailNodeId(s.failJumpId)

      // Walk the Trie from root to current node to highlight path
      let node = root
      const pathIds = new Set<string>([root.id])
      for (let j = 0; j <= step; j++) {
        const ch = steps[j].char
        while (node !== root && !node.children.has(ch)) {
          node = node.fail!
        }
        if (node.children.has(ch)) {
          node = node.children.get(ch)!
        }
        pathIds.add(node.id)
      }
      setMatchedNodeIds(pathIds)
      setDescription(s.description)

      // Clear fail highlight after a short moment
      setTimeout(() => setFailNodeId(null), Math.min(speed * 0.4, 300))
    }, speed)
  }, [textInput, root, speed, clearTimer])

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription('已暂停')
    } else if (matchSteps.length > 0) {
      let step = currentStep
      setIsPlaying(true)
      timerRef.current = window.setInterval(() => {
        step++
        if (step >= matchSteps.length) {
          clearTimer()
          setIsPlaying(false)
          setDescription(`匹配完成！共找到 ${matchSteps.reduce((s, st) => s + st.matchedPatterns.length, 0)} 个匹配。`)
          return
        }
        setCurrentStep(step)
        const s = matchSteps[step]
        setFailNodeId(s.failJumpId)
        setDescription(s.description)
        setTimeout(() => setFailNodeId(null), Math.min(speed * 0.4, 300))
      }, speed)
    }
  }, [isPlaying, matchSteps, currentStep, speed, clearTimer])

  const handleReset = useCallback(() => {
    clearTimer()
    setMatchSteps([])
    setCurrentStep(-1)
    setMatchedNodeIds(new Set())
    setFailNodeId(null)
    setIsPlaying(false)
    setDescription('已重置，输入文本后点击"开始匹配"')
  }, [clearTimer])

  const handleAddPattern = useCallback(() => {
    const p = patternInput.trim()
    if (!p) return
    const newPatterns = [...patterns, p]
    nodeIdCounter = 0
    const newRoot = createACNode('')
    for (const np of newPatterns) insertPattern(newRoot, np)
    buildFailureLinks(newRoot)
    setRoot(newRoot)
    setPatterns(newPatterns)
    setPatternInput('')
    handleReset()
    setDescription(`已添加模式串 "${p}"，当前共 ${newPatterns.length} 个模式串`)
  }, [patternInput, patterns, handleReset])

  const handleResetPatterns = useCallback(() => {
    const { root: newRoot, patterns: newPatterns } = buildDefaultAC()
    setRoot(newRoot)
    setPatterns(newPatterns)
    handleReset()
    setDescription('已重置为默认模式串: he, she, his, hers')
  }, [handleReset])

  // Calculate SVG height based on tree depth
  const maxDepth = positions.reduce((max, p) => {
    const d = (p.y - ROOT_Y) / 60
    return Math.max(max, d)
  }, 0)
  const svgHeight = Math.max(SVG_HEIGHT, ROOT_Y + maxDepth * 60 + 100)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <input
          type="text"
          value={patternInput}
          onChange={e => setPatternInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddPattern() }}
          placeholder="添加模式串"
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
        <button className="btn btn-primary" onClick={handleAddPattern}>
          添加模式串
        </button>
        <input
          type="text"
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          placeholder="待匹配文本"
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '140px',
            fontSize: '0.85rem'
          }}
        />
        <button className="btn btn-primary" onClick={handleStartMatch} disabled={isPlaying}>
          开始匹配
        </button>
        <button className="btn btn-secondary" onClick={handleTogglePlay} disabled={matchSteps.length === 0}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <button className="btn btn-secondary" onClick={handleResetPatterns}>
          重置模式串
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
          模式串: [{patterns.join(', ')}]
        </span>
      </div>

      {/* Text display with progress */}
      {matchSteps.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          marginBottom: '0.5rem',
          fontSize: '0.9rem',
          fontFamily: 'Consolas, Monaco, monospace'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>文本:</span>
          {textInput.split('').map((ch, i) => {
            const isCurrent = i === currentStep
            const isPast = i < currentStep
            const step = matchSteps[i]
            const hasMatch = step && step.matchedPatterns.length > 0
            return (
              <span key={i} style={{
                display: 'inline-block',
                width: '1.5em',
                textAlign: 'center',
                padding: '2px 0',
                borderRadius: '3px',
                background: isCurrent ? 'var(--accent)' : hasMatch && isPast ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                color: isCurrent ? '#fff' : isPast ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isCurrent ? '700' : '400',
                border: isCurrent ? '2px solid #60a5fa' : '1px solid transparent'
              }}>
                {ch}
              </span>
            )
          })}
          {currentStep >= 0 && currentStep < matchSteps.length && (
            <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              位置 {currentStep}
            </span>
          )}
        </div>
      )}

      <div className="viz-canvas" style={{ padding: '1rem', overflow: 'auto' }}>
        <svg width="100%" viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`} style={{ display: 'block' }}>
          <defs>
            <filter id="ac-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id="fail-arrow" viewBox="0 0 10 6" refX="10" refY="3"
              markerWidth="8" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 3 L 0 6 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Trie edges */}
          {edges.map((e, i) => {
            const isVisited = matchedNodeIds.has(e.childId)
            return (
              <g key={`edge-${i}`}>
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

          {/* Failure links */}
          {failLinks.map((fl, i) => {
            const isHighlighted = failNodeId === fl.fromId
            // Offset to avoid overlap with trie edges
            const dx = (fl.toX - fl.fromX) * 0.08
            const dy = (fl.toY - fl.fromY) * 0.08
            return (
              <g key={`fail-${i}`}>
                <line
                  x1={fl.fromX + dx}
                  y1={fl.fromY + dy}
                  x2={fl.toX - dx}
                  y2={fl.toY - dy}
                  stroke={isHighlighted ? '#ef4444' : '#ef4444'}
                  strokeWidth={isHighlighted ? 3 : 1}
                  strokeDasharray={isHighlighted ? '' : '5 3'}
                  strokeOpacity={isHighlighted ? 1 : 0.35}
                  markerEnd="url(#fail-arrow)"
                />
              </g>
            )
          })}

          {/* Root node */}
          {positions.length > 0 && (() => {
            const rootPos = positions[0]
            const isCurrent = currentStep >= 0 && matchSteps[currentStep] && matchSteps[currentStep].currentNodeId === rootPos.id
            return (
              <g>
                <circle
                  cx={rootPos.x}
                  cy={rootPos.y}
                  r={NODE_RADIUS - 2}
                  fill={isCurrent ? 'var(--accent)' : 'var(--bg-card)'}
                  stroke={isCurrent ? '#60a5fa' : 'var(--border)'}
                  strokeWidth={isCurrent ? 3 : 2}
                  filter={isCurrent ? 'url(#ac-glow)' : ''}
                />
                <text
                  x={rootPos.x}
                  y={rootPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontWeight="600"
                >
                  root
                </text>
              </g>
            )
          })()}

          {/* Trie nodes */}
          {positions.slice(1).map(p => {
            const isCurrent = currentStep >= 0 && matchSteps[currentStep] && matchSteps[currentStep].currentNodeId === p.id
            const isVisited = matchedNodeIds.has(p.id)
            const isFailTarget = failNodeId === p.id
            const hasOutput = p.output.length > 0

            let fillColor = 'var(--bg-card)'
            let strokeColor = 'var(--border)'
            let textColor = 'var(--text-primary)'
            let extraFilter = ''

            if (isCurrent) {
              fillColor = 'var(--accent)'
              strokeColor = '#60a5fa'
              textColor = '#ffffff'
              extraFilter = 'url(#ac-glow)'
            } else if (isFailTarget) {
              fillColor = 'rgba(239, 68, 68, 0.3)'
              strokeColor = '#ef4444'
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
                {hasOutput && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={NODE_RADIUS + 4}
                    fill="none"
                    stroke="#10b981"
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
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ transition: 'fill 0.3s ease' }}
                >
                  {p.char}
                </text>
                {hasOutput && (
                  <text
                    x={p.x}
                    y={p.y + NODE_RADIUS + 14}
                    textAnchor="middle"
                    fill="#10b981"
                    fontSize="9"
                    fontWeight="500"
                  >
                    {p.output.join(',')}
                  </text>
                )}
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(15, ${svgHeight - 50})`}>
            <circle cx={0} cy={0} r={7} fill="var(--bg-card)" stroke="var(--border)" strokeWidth={1.5} />
            <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="10">普通节点</text>
            <circle cx={80} cy={0} r={7} fill="var(--bg-card)" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" />
            <text x={92} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="10">模式串结尾</text>
            <circle cx={180} cy={0} r={7} fill="#1e3a5f" stroke="var(--accent)" strokeWidth={1.5} />
            <text x={192} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="10">已访问</text>
            <circle cx={250} cy={0} r={7} fill="var(--accent)" stroke="#60a5fa" strokeWidth={2} />
            <text x={262} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="10">当前节点</text>
            <line x1={320} y1={0} x2={340} y2={0} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" />
            <text x={344} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="10">失败指针</text>
          </g>

          {/* Info */}
          <g transform={`translate(${SVG_WIDTH - 200}, ${svgHeight - 50})`}>
            <text x={0} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="10">
              节点数: {getNodeCount(root)} | 模式串: {patterns.length}
            </text>
          </g>
        </svg>
      </div>

      <div className="viz-info">
        {description}
      </div>

      {/* Match results */}
      {currentStep >= 0 && matchSteps.slice(0, currentStep + 1).some(s => s.matchedPatterns.length > 0) && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius)',
          padding: '0.5rem 0.75rem',
          fontSize: '0.85rem'
        }}>
          <strong style={{ color: '#10b981' }}>匹配结果:</strong>
          <div style={{ marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
            {matchSteps.slice(0, currentStep + 1).map((s, i) => {
              if (s.matchedPatterns.length === 0) return null
              return s.matchedPatterns.map((p, j) => (
                <span key={`${i}-${j}`} style={{
                  display: 'inline-block',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  margin: '2px 4px',
                  fontSize: '0.8rem',
                  fontFamily: 'Consolas, Monaco, monospace'
                }}>
                  "{p}" 在位置 {i - p.length + 1}
                </span>
              ))
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>AC自动机信息</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>模式串: {patterns.map(p => `"${p}"`).join(', ')}</div>
            <div>节点数: {getNodeCount(root)} | 模式串数: {patterns.length}</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>操作说明</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>绿色虚线圈 = 模式串结尾节点</div>
            <div>红色虚线箭头 = 失败指针</div>
            <div>匹配时沿 Trie 边前进，失配时沿失败指针跳转</div>
          </div>
        </div>
      </div>
    </div>
  )
}
