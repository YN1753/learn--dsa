import { useState, useEffect, useRef, useCallback } from 'react'

interface TreeNodeData {
  id: number
  len: number
  link: number
  label: string
  childEdges: { char: string; target: number }[]
}

interface StepState {
  description: string
  nodes: TreeNodeData[]
  currentChar: string
  charIndex: number
  activeNode: number | null
  suffixLinkHighlight: { from: number; to: number } | null
  longestSuffix: number | null
  addedNode: number | null
  inputString: string
}

function buildSteps(s: string): StepState[] {
  const steps: StepState[] = []
  interface InternalNode {
    len: number
    link: number
    next: Map<string, number>
  }
  const internalNodes: InternalNode[] = [
    { len: -1, link: 0, next: new Map() },
    { len: 0, link: 0, next: new Map() },
  ]
  let last = 1

  function snapshot(desc: string, ch: string, ci: number, active: number | null, slH: { from: number; to: number } | null, ls: number | null, added: number | null): StepState {
    const treeNodes: TreeNodeData[] = internalNodes.map((n, idx) => ({
      id: idx,
      len: n.len,
      link: n.link,
      label: idx === 0 ? 'odd(-1)' : idx === 1 ? 'even(0)' : `p${idx}(len=${n.len})`,
      childEdges: Array.from(n.next.entries()).map(([c, t]) => ({ char: c, target: t })),
    }))
    return {
      description: desc,
      nodes: treeNodes,
      currentChar: ch,
      charIndex: ci,
      activeNode: active,
      suffixLinkHighlight: slH,
      longestSuffix: ls,
      addedNode: added,
      inputString: s.substring(0, ci + 1),
    }
  }

  steps.push(snapshot(`初始化回文树：奇根(len=-1) 和偶根(len=0)`, '', -1, null, null, null, null))

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    let cur = last

    steps.push(snapshot(
      `处理字符 '${ch}' (位置 ${i})，从最长回文后缀节点开始寻找可扩展节点`,
      ch, i, cur, null, null, null
    ))

    while (true) {
      const curLen = internalNodes[cur].len
      if (i - curLen - 1 >= 0 && s[i - curLen - 1] === ch) {
        break
      }
      steps.push(snapshot(
        `节点(len=${internalNodes[cur].len}) 无法用 '${ch}' 扩展，沿后缀链接跳转到节点(len=${internalNodes[internalNodes[cur].link].len})`,
        ch, i, cur, { from: cur, to: internalNodes[cur].link }, null, null
      ))
      cur = internalNodes[cur].link
    }

    steps.push(snapshot(
      `找到可扩展节点(len=${internalNodes[cur].len})，检查 '${ch}' 转移是否已存在`,
      ch, i, cur, null, null, null
    ))

    if (internalNodes[cur].next.has(ch)) {
      last = internalNodes[cur].next.get(ch)!
      steps.push(snapshot(
        `回文 "${s.substring(i - internalNodes[last].len + 1, i + 1)}" 已存在（节点 ${last}），无需创建`,
        ch, i, last, null, last, null
      ))
      continue
    }

    // Create new node
    const newIdx = internalNodes.length
    internalNodes[cur].next.set(ch, newIdx)
    internalNodes.push({ len: internalNodes[cur].len + 2, link: 0, next: new Map() })

    steps.push(snapshot(
      `创建新节点 ${newIdx}，代表回文 "${s.substring(i - internalNodes[newIdx].len + 1, i + 1)}"（长度=${internalNodes[newIdx].len}）`,
      ch, i, cur, null, null, newIdx
    ))

    if (internalNodes[newIdx].len === 1) {
      internalNodes[newIdx].link = 1
      steps.push(snapshot(
        `新节点长度为 1，后缀链接指向偶根`,
        ch, i, newIdx, { from: newIdx, to: 1 }, newIdx, newIdx
      ))
      last = newIdx
      continue
    }

    // Find suffix link
    let linkCur = internalNodes[cur].link
    while (true) {
      const linkLen = internalNodes[linkCur].len
      if (i - linkLen - 1 >= 0 && s[i - linkLen - 1] === ch) {
        break
      }
      linkCur = internalNodes[linkCur].link
    }
    const slTarget = internalNodes[linkCur].next.get(ch)!
    internalNodes[newIdx].link = slTarget

    steps.push(snapshot(
      `为节点 ${newIdx} 设置后缀链接指向节点 ${slTarget}（代表 "${s.substring(i - internalNodes[slTarget].len + 1, i + 1)}"）`,
      ch, i, newIdx, { from: newIdx, to: slTarget }, newIdx, newIdx
    ))

    last = newIdx
  }

  steps.push(snapshot(
    `构建完成！共 ${internalNodes.length - 2} 个本质不同的回文子串`,
    '', s.length, null, null, null, null
  ))

  return steps
}

export default function PalindromicTreeVisualization() {
  const [inputStr, setInputStr] = useState('abacaba')
  const [steps, setSteps] = useState<StepState[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const timerRef = useRef<number | null>(null)

  const startBuild = useCallback(() => {
    const newSteps = buildSteps(inputStr)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [inputStr])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, speed)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setIsPlaying(false)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleStepBack = () => {
    if (currentStep > 0) {
      setIsPlaying(false)
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
  }

  const state = steps.length > 0 ? steps[currentStep] : null

  // Layout: place nodes in layers by length
  const getNodePositions = (nodes: TreeNodeData[]): Map<number, { x: number; y: number }> => {
    const pos = new Map<number, { x: number; y: number }>()
    if (nodes.length === 0) return pos

    // Group by length
    const byLen = new Map<number, number[]>()
    for (const n of nodes) {
      if (!byLen.has(n.len)) byLen.set(n.len, [])
      byLen.get(n.len)!.push(n.id)
    }

    const canvasWidth = 720
    const layerGap = 65
    const topY = 40

    // Sort lengths
    const lengths = Array.from(byLen.keys()).sort((a, b) => a - b)

    for (let li = 0; li < lengths.length; li++) {
      const ids = byLen.get(lengths[li])!
      const y = topY + li * layerGap
      const totalWidth = ids.length * 90
      const startX = (canvasWidth - totalWidth) / 2 + 45
      for (let ni = 0; ni < ids.length; ni++) {
        pos.set(ids[ni], { x: startX + ni * 90, y })
      }
    }
    return pos
  }

  const nodePositions = state ? getNodePositions(state.nodes) : new Map()

  const getNodeColor = (nodeId: number): string => {
    if (!state) return 'var(--bg-card)'
    if (state.addedNode === nodeId) return '#22c55e'
    if (state.activeNode === nodeId) return '#3b82f6'
    if (state.longestSuffix === nodeId) return '#f59e0b'
    return 'var(--bg-card)'
  }

  const getNodeBorder = (nodeId: number): string => {
    if (!state) return 'var(--border)'
    if (state.addedNode === nodeId) return '#4ade80'
    if (state.activeNode === nodeId) return '#60a5fa'
    if (state.longestSuffix === nodeId) return '#fbbf24'
    return 'var(--border)'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>输入字符串:</label>
          <input
            type="text"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.95rem',
              width: '160px',
            }}
            disabled={isPlaying}
          />
          <button className="btn btn-primary" onClick={startBuild} disabled={isPlaying || inputStr.length === 0}>
            构建
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleStepBack} disabled={currentStep === 0 || steps.length === 0}>
            上一步
          </button>
          <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
            {isPlaying ? '暂停' : '继续'}
          </button>
          <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
            下一步
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            重置
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            速度:
            <input
              type="range"
              min="300"
              max="2500"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span>{speed}ms</span>
          </label>
        </div>
      </div>

      {state && (
        <div className="viz-canvas" style={{ overflowX: 'auto', minHeight: '420px' }}>
          <svg width={720} height={420}>
            <defs>
              <marker id="arrow-sl" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
              </marker>
              <marker id="arrow-child" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
              </marker>
            </defs>

            {/* Draw suffix links */}
            {state.nodes.map(node => {
              if (node.id <= 1) return null
              const fromPos = nodePositions.get(node.id)
              const toPos = nodePositions.get(node.link)
              if (!fromPos || !toPos) return null
              const isHighlighted = state.suffixLinkHighlight?.from === node.id && state.suffixLinkHighlight?.to === node.link
              return (
                <line
                  key={`sl-${node.id}`}
                  x1={fromPos.x}
                  y1={fromPos.y + 20}
                  x2={toPos.x}
                  y2={toPos.y - 20}
                  stroke={isHighlighted ? '#ef4444' : '#666'}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  strokeDasharray={isHighlighted ? 'none' : '4,3'}
                  markerEnd="url(#arrow-sl)"
                  opacity={isHighlighted ? 1 : 0.4}
                />
              )
            })}

            {/* Draw child edges */}
            {state.nodes.map(node => {
              return node.childEdges.map((edge, ei) => {
                const fromPos = nodePositions.get(node.id)
                const toPos = nodePositions.get(edge.target)
                if (!fromPos || !toPos) return null
                const midX = (fromPos.x + toPos.x) / 2
                const midY = (fromPos.y + toPos.y) / 2
                return (
                  <g key={`ce-${node.id}-${ei}`}>
                    <line
                      x1={fromPos.x}
                      y1={fromPos.y + 20}
                      x2={toPos.x}
                      y2={toPos.y - 20}
                      stroke="var(--text-secondary)"
                      strokeWidth={1.5}
                      markerEnd="url(#arrow-child)"
                    />
                    <text
                      x={midX + 8}
                      y={midY}
                      fill="var(--accent)"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      {edge.char}
                    </text>
                  </g>
                )
              })
            })}

            {/* Draw nodes */}
            {state.nodes.map(node => {
              const pos = nodePositions.get(node.id)
              if (!pos) return null
              const rx = 36
              const ry = 18
              return (
                <g key={node.id}>
                  <ellipse
                    cx={pos.x}
                    cy={pos.y}
                    rx={rx}
                    ry={ry}
                    fill={getNodeColor(node.id)}
                    stroke={getNodeBorder(node.id)}
                    strokeWidth={node.id === state.activeNode || node.id === state.addedNode || node.id === state.longestSuffix ? 3 : 1.5}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 1}
                    fill="var(--text-primary)"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {node.id <= 1 ? (node.id === 0 ? 'odd' : 'even') : `len=${node.len}`}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}

      <div className="viz-info">
        <strong>当前字符:</strong> {state ? (state.charIndex >= 0 ? `'${state.currentChar}' (位置 ${state.charIndex})` : '(初始)') : '(等待构建)'}
        {state && <span style={{ marginLeft: '1.5rem' }}><strong>已处理前缀:</strong> "{state.inputString}"</span>}
      </div>
      <div className="viz-info">
        <strong>步骤说明:</strong> {state ? state.description : '点击「构建」开始'}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例:</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前活跃节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          新增节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          最长回文后缀
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: '#ef4444', verticalAlign: 'middle', marginRight: 4 }} />
          后缀链接
        </span>
      </div>
    </div>
  )
}
