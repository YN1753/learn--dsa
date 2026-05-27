import { useState, useEffect, useRef, useCallback } from 'react'

interface SAMState {
  len: number
  link: number
  transitions: Record<string, number>
}

interface NodeLayout {
  x: number
  y: number
  id: number
}

interface AnimationStep {
  description: string
  states: SAMState[]
  last: number
  highlightState: number | null
  highlightTransition: string | null
  newStates: number[]
  phase: string
  currentChar: string
}

export default function SuffixAutomatonVisualization() {
  const [text, setText] = useState('abcbc')
  const [states, setStates] = useState<SAMState[]>([])
  const [, setLast] = useState(0)
  const [highlightState, setHighlightState] = useState<number | null>(null)
  const [highlightTransition, setHighlightTransition] = useState<string | null>(null)
  const [description, setDescription] = useState('后缀自动机可视化 - 输入字符串并点击构建')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [phase, setPhase] = useState('就绪')
  const [newStates, setNewStates] = useState<number[]>([])
  const [currentChar, setCurrentChar] = useState('')
  const timerRef = useRef<number | null>(null)

  const buildSAMSteps = useCallback((inputText: string): AnimationStep[] => {
    const allSteps: AnimationStep[] = []
    const st: SAMState[] = [{ len: 0, link: -1, transitions: {} }]
    let l = 0

    const cloneStates = (src: SAMState[]): SAMState[] => {
      return src.map(s => ({ ...s, transitions: { ...s.transitions } }))
    }

    allSteps.push({
      description: `初始化: 创建初始状态 (状态 0)，len=0, link=-1`,
      states: cloneStates(st),
      last: 0,
      highlightState: 0,
      highlightTransition: null,
      newStates: [0],
      phase: '初始化',
      currentChar: '',
    })

    for (let idx = 0; idx < inputText.length; idx++) {
      const c = inputText[idx]
      const cur = st.length
      st.push({ len: st[l].len + 1, link: 0, transitions: {} })

      allSteps.push({
        description: `添加字符 '${c}': 创建新状态 ${cur}，len=${st[cur].len}`,
        states: cloneStates(st),
        last: cur,
        highlightState: cur,
        highlightTransition: null,
        newStates: [cur],
        phase: `添加 '${c}'`,
        currentChar: c,
      })

      let p = l
      while (p !== -1 && !st[p].transitions[c]) {
        st[p].transitions[c] = cur
        allSteps.push({
          description: `回溯: 状态 ${p} 没有通过 '${c}' 的转移，添加 ${p} --${c}--> ${cur}`,
          states: cloneStates(st),
          last: cur,
          highlightState: p,
          highlightTransition: `${p}-${c}-${cur}`,
          newStates: [cur],
          phase: `添加 '${c}' - 回溯`,
          currentChar: c,
        })
        p = st[p].link
      }

      if (p === -1) {
        st[cur].link = 0
        allSteps.push({
          description: `回溯到根: 设置 link(${cur}) = 0`,
          states: cloneStates(st),
          last: cur,
          highlightState: cur,
          highlightTransition: null,
          newStates: [cur],
          phase: `添加 '${c}' - 设置 link`,
          currentChar: c,
        })
      } else {
        const q = st[p].transitions[c]
        if (st[p].len + 1 === st[q].len) {
          st[cur].link = q
          allSteps.push({
            description: `状态 ${p} 通过 '${c}' 转移到 ${q}，且 len(${p})+1 == len(${q})，设置 link(${cur}) = ${q}`,
            states: cloneStates(st),
            last: cur,
            highlightState: q,
            highlightTransition: `${p}-${c}-${q}`,
            newStates: [cur],
            phase: `添加 '${c}' - 设置 link`,
            currentChar: c,
          })
        } else {
          const clone = st.length
          st.push({
            len: st[p].len + 1,
            link: st[q].link,
            transitions: { ...st[q].transitions },
          })

          allSteps.push({
            description: `需要分裂! 创建 clone ${clone}，复制状态 ${q} 的转移，len(${clone}) = ${st[clone].len}`,
            states: cloneStates(st),
            last: cur,
            highlightState: clone,
            highlightTransition: null,
            newStates: [cur, clone],
            phase: `添加 '${c}' - 创建 clone`,
            currentChar: c,
          })

          while (p !== -1 && st[p].transitions[c] === q) {
            st[p].transitions[c] = clone
            allSteps.push({
              description: `重定向: ${p} 的 '${c}' 转移从 ${q} 改为指向 clone ${clone}`,
              states: cloneStates(st),
              last: cur,
              highlightState: p,
              highlightTransition: `${p}-${c}-${clone}`,
              newStates: [cur, clone],
              phase: `添加 '${c}' - 重定向`,
              currentChar: c,
            })
            p = st[p].link
          }

          st[q].link = clone
          st[cur].link = clone
          allSteps.push({
            description: `设置 link(${q}) = ${clone}, link(${cur}) = ${clone}，分裂完成`,
            states: cloneStates(st),
            last: cur,
            highlightState: clone,
            highlightTransition: null,
            newStates: [cur, clone],
            phase: `添加 '${c}' - 分裂完成`,
            currentChar: c,
          })
        }
      }

      l = cur
    }

    // Final state
    allSteps.push({
      description: `构建完成! 字符串 "${inputText}" 的后缀自动机共有 ${st.length} 个状态`,
      states: cloneStates(st),
      last: l,
      highlightState: 0,
      highlightTransition: null,
      newStates: [],
      phase: '完成',
      currentChar: '',
    })

    return allSteps
  }, [])

  const executeSteps = useCallback((animationSteps: AnimationStep[]) => {
    setSteps(animationSteps)
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
      setStates(step.states)
      setLast(step.last)
      setHighlightState(step.highlightState)
      setHighlightTransition(step.highlightTransition)
      setDescription(step.description)
      setPhase(step.phase)
      setNewStates(step.newStates)
      setCurrentChar(step.currentChar)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleBuild = () => {
    if (isPlaying) return
    const animationSteps = buildSAMSteps(text)
    executeSteps(animationSteps)
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStep = () => {
    if (steps.length === 0 || currentStep >= steps.length) return
    const step = steps[currentStep]
    setStates(step.states)
    setLast(step.last)
    setHighlightState(step.highlightState)
    setHighlightTransition(step.highlightTransition)
    setDescription(step.description)
    setPhase(step.phase)
    setNewStates(step.newStates)
    setCurrentChar(step.currentChar)
    setCurrentStep(prev => prev + 1)
    setIsPlaying(false)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setStates([])
    setLast(0)
    setHighlightState(null)
    setHighlightTransition(null)
    setDescription('后缀自动机已重置')
    setSteps([])
    setCurrentStep(0)
    setPhase('就绪')
    setNewStates([])
    setCurrentChar('')
  }

  // Compute layout positions for states
  const computeLayout = (): NodeLayout[] => {
    if (states.length === 0) return []

    const layouts: NodeLayout[] = []
    const width = 760
    const centerX = width / 2
    const radius = 380 * 0.35

    // Place states in a circle, with initial state at center-top
    for (let i = 0; i < states.length; i++) {
      if (i === 0) {
        layouts.push({ x: centerX, y: 50, id: 0 })
      } else {
        const angle = ((i - 1) / (states.length - 1)) * Math.PI * 0.8 + Math.PI * 0.1
        layouts.push({
          x: centerX + radius * Math.cos(angle),
          y: 80 + radius * 0.9 * Math.sin(angle),
          id: i,
        })
      }
    }

    return layouts
  }

  const nodeRadius = 22
  const layouts = computeLayout()

  const getStateColor = (id: number): string => {
    if (newStates.includes(id)) return '#22c55e'
    if (id === highlightState) return '#3b82f6'
    return 'var(--bg-card)'
  }

  const getStateBorder = (id: number): string => {
    if (newStates.includes(id)) return '#4ade80'
    if (id === highlightState) return '#60a5fa'
    return 'var(--border)'
  }

  // Compute distinct substring count
  const distinctCount = states.reduce((acc, s, i) => {
    if (i === 0) return acc
    return acc + s.len - states[s.link]?.len
  }, 0)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          输入:
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isPlaying}
            style={{ padding: '0.3rem 0.6rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem', width: 120 }}
          />
        </label>
        <button className="btn btn-primary" onClick={handleBuild} disabled={isPlaying || !text}>
          构建 SAM
        </button>
        <button className="btn btn-secondary" onClick={handleStep} disabled={steps.length === 0 || currentStep >= steps.length}>
          单步执行
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="100"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflow: 'auto', minHeight: 400 }}>
        {states.length > 0 ? (
          <svg width={800} height={420}>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
              </marker>
              <marker id="arrow-highlight" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
              </marker>
              <marker id="arrow-link" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Draw suffix links */}
            {states.map((s, i) => {
              if (s.link < 0 || s.link >= layouts.length || i >= layouts.length) return null
              const from = layouts[i]
              const to = layouts[s.link]
              return (
                <g key={`link-${i}`}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="6,4"
                    markerEnd="url(#arrow-link)"
                    opacity={0.6}
                  />
                </g>
              )
            })}

            {/* Draw transitions */}
            {states.map((s, fromId) =>
              Object.entries(s.transitions).map(([ch, toId]) => {
                if (fromId >= layouts.length || toId >= layouts.length) return null
                const from = layouts[fromId]
                const to = layouts[toId]
                const isSelfLoop = fromId === toId
                const isHighlight = highlightTransition === `${fromId}-${ch}-${toId}`

                if (isSelfLoop) {
                  return (
                    <g key={`trans-${fromId}-${ch}-${toId}`}>
                      <circle
                        cx={from.x + nodeRadius + 8}
                        cy={from.y - nodeRadius - 8}
                        r={14}
                        fill="none"
                        stroke={isHighlight ? '#3b82f6' : 'var(--text-secondary)'}
                        strokeWidth={isHighlight ? 2.5 : 1.5}
                      />
                      <text
                        x={from.x + nodeRadius + 8}
                        y={from.y - nodeRadius - 4}
                        fill="var(--text-primary)"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="Consolas, Monaco, monospace"
                      >
                        {ch}
                      </text>
                    </g>
                  )
                }

                // Curved edge
                const dx = to.x - from.x
                const dy = to.y - from.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                const nx = -dy / dist
                const ny = dx / dist
                const curvature = 20
                const cx = (from.x + to.x) / 2 + nx * curvature
                const cy = (from.y + to.y) / 2 + ny * curvature

                const labelX = cx
                const labelY = cy

                return (
                  <g key={`trans-${fromId}-${ch}-${toId}`}>
                    <path
                      d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                      fill="none"
                      stroke={isHighlight ? '#3b82f6' : 'var(--text-secondary)'}
                      strokeWidth={isHighlight ? 2.5 : 1.5}
                      markerEnd={isHighlight ? 'url(#arrow-highlight)' : 'url(#arrow)'}
                    />
                    <rect
                      x={labelX - 10}
                      y={labelY - 9}
                      width={20}
                      height={18}
                      rx={4}
                      fill="var(--bg-card)"
                      stroke={isHighlight ? '#3b82f6' : 'var(--border)'}
                      strokeWidth={1}
                    />
                    <text
                      x={labelX}
                      y={labelY + 4}
                      fill="var(--text-primary)"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      {ch}
                    </text>
                  </g>
                )
              })
            )}

            {/* Draw states */}
            {layouts.map((layout) => {
              const s = states[layout.id]
              if (!s) return null
              const isHighlight = layout.id === highlightState
              const isNew = newStates.includes(layout.id)

              return (
                <g key={`state-${layout.id}`}>
                  <circle
                    cx={layout.x}
                    cy={layout.y}
                    r={nodeRadius}
                    fill={getStateColor(layout.id)}
                    stroke={getStateBorder(layout.id)}
                    strokeWidth={isHighlight || isNew ? 3 : 2}
                  />
                  <text
                    x={layout.x}
                    y={layout.y - 4}
                    fill="var(--text-primary)"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {layout.id}
                  </text>
                  <text
                    x={layout.x}
                    y={layout.y + 12}
                    fill="var(--text-secondary)"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    len={s.len}
                  </text>
                </g>
              )
            })}
          </svg>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem 1rem' }}>
            输入字符串并点击「构建 SAM」开始演示
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>状态：</strong> {phase}
        {currentChar && <span> | 当前字符: <strong>{currentChar}</strong></span>}
        {states.length > 0 && <span> | 状态数: {states.length}</span>}
        {distinctCount > 0 && <span> | 不同子串: {distinctCount}</span>}
      </div>
      <div className="viz-info">
        <strong>说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          普通状态
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          高亮状态
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          新创建状态
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: '#f59e0b', borderRadius: 1, marginRight: 4, verticalAlign: 'middle' }} />
          suffix link
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--text-secondary)', borderRadius: 1, marginRight: 4, verticalAlign: 'middle' }} />
          转移边
        </span>
      </div>
    </div>
  )
}
