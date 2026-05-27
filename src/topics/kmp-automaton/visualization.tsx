import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface Transition {
  from: number
  to: number
  char: string
  isMatch: boolean
  isSelfLoop: boolean
}

interface AnimationStep {
  description: string
  currentState: number
  textIndex: number
  matchedPositions: number[]
  highlightTransition: Transition | null
}

const DEFAULT_PATTERN = 'ABABC'
const DEFAULT_TEXT = 'ABABABCABABABC'

function buildFailFunction(pattern: string): number[] {
  const m = pattern.length
  const fail = new Array(m).fill(0)
  let k = 0
  for (let i = 1; i < m; i++) {
    while (k > 0 && pattern[k] !== pattern[i]) {
      k = fail[k - 1]
    }
    if (pattern[k] === pattern[i]) {
      k++
    }
    fail[i] = k
  }
  return fail
}

function buildDFA(pattern: string, alphabet: string): Map<string, number[]> {
  const m = pattern.length
  const dfa = new Map<string, number[]>()

  for (const c of alphabet) {
    dfa.set(c, new Array(m).fill(0))
  }

  const firstChar = pattern[0]
  if (dfa.has(firstChar)) {
    dfa.get(firstChar)![0] = 1
  }

  let x = 0
  for (let j = 1; j < m; j++) {
    for (const c of alphabet) {
      dfa.get(c)![j] = dfa.get(c)![x]
    }
    const pj = pattern[j]
    if (dfa.has(pj)) {
      dfa.get(pj)![j] = j + 1
    }
    x = dfa.get(pattern[x])![x] ?? 0
  }

  return dfa
}

function getAlphabet(pattern: string, text: string): string {
  const chars = new Set<string>()
  for (const c of pattern) chars.add(c)
  for (const c of text) chars.add(c)
  return Array.from(chars).sort().join('')
}

function buildTransitions(pattern: string, alphabet: string, dfa: Map<string, number[]>): Transition[] {
  const m = pattern.length
  const transitions: Transition[] = []
  const seen = new Set<string>()

  for (let state = 0; state < m; state++) {
    for (const c of alphabet) {
      const nextState = dfa.get(c)![state]
      const key = `${state}-${nextState}-${c}`
      if (!seen.has(key)) {
        seen.add(key)
        transitions.push({
          from: state,
          to: nextState,
          char: c,
          isMatch: nextState === state + 1,
          isSelfLoop: state === nextState,
        })
      }
    }
  }

  return transitions
}

export default function KmpAutomatonVisualization() {
  const [pattern, setPattern] = useState(DEFAULT_PATTERN)
  const [text, setText] = useState(DEFAULT_TEXT)
  const [currentState, setCurrentState] = useState(0)
  const [textIndex, setTextIndex] = useState(-1)
  const [matchedPositions, setMatchedPositions] = useState<number[]>([])
  const [description, setDescription] = useState('KMP自动机可视化 - 点击「运行」开始匹配')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightTransition, setHighlightTransition] = useState<Transition | null>(null)
  const timerRef = useRef<number | null>(null)

  const alphabet = getAlphabet(pattern, text)
  const dfa = useMemo(() => buildDFA(pattern, alphabet), [pattern, alphabet])
  const transitions = useMemo(() => buildTransitions(pattern, alphabet, dfa), [pattern, alphabet, dfa])
  const fail = useMemo(() => buildFailFunction(pattern), [pattern])
  const m = pattern.length

  // Layout constants
  const stateRadius = 30
  const stateGap = 110
  const svgPadding = 50
  const canvasWidth = Math.max((m + 1) * stateGap + svgPadding * 2, 600)
  const canvasHeight = 420

  const getStateX = (state: number): number => svgPadding + state * stateGap + stateRadius
  const getStateY = (_state: number): number => canvasHeight / 2

  const generateSteps = useCallback((): AnimationStep[] => {
    const result: AnimationStep[] = []
    let state = 0
    const matched: number[] = []

    result.push({
      description: `初始状态：自动机在状态0，开始扫描文本`,
      currentState: 0,
      textIndex: -1,
      matchedPositions: [],
      highlightTransition: null,
    })

    for (let i = 0; i < text.length; i++) {
      const c = text[i]
      const nextState = dfa.get(c)?.[state] ?? 0
      const isMatchTransition = nextState === state + 1

      const trans: Transition = {
        from: state,
        to: nextState,
        char: c,
        isMatch: isMatchTransition,
        isSelfLoop: state === nextState,
      }

      if (nextState === m) {
        matched.push(i - m + 1)
        result.push({
          description: `读入「${c}」: 状态${state} → 状态${nextState}，在位置 ${i - m + 1} 找到匹配！`,
          currentState: nextState,
          textIndex: i,
          matchedPositions: [...matched],
          highlightTransition: trans,
        })
        // Reset for continued search (using fail)
        state = dfa.get(c)?.[m - 1] ?? 0
        result.push({
          description: `匹配完成，自动机重置到状态${state}继续搜索`,
          currentState: state,
          textIndex: i,
          matchedPositions: [...matched],
          highlightTransition: null,
        })
      } else {
        const action = isMatchTransition
          ? `匹配成功`
          : state !== nextState
            ? `失配回退`
            : `保持状态`
        result.push({
          description: `读入「${c}」: 状态${state} → 状态${nextState}（${action}）`,
          currentState: nextState,
          textIndex: i,
          matchedPositions: [...matched],
          highlightTransition: trans,
        })
        state = nextState
      }
    }

    result.push({
      description: `扫描完成！共找到 ${matched.length} 个匹配，位置：[${matched.join(', ')}]`,
      currentState: state,
      textIndex: text.length,
      matchedPositions: matched,
      highlightTransition: null,
    })

    return result
  }, [text, dfa, m])

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      const step = steps[currentStep]
      setCurrentState(step.currentState)
      setTextIndex(step.textIndex)
      setMatchedPositions(step.matchedPositions)
      setHighlightTransition(step.highlightTransition)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleRun = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const allSteps = generateSteps()
    setSteps(allSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setCurrentState(0)
    setTextIndex(-1)
    setMatchedPositions([])
    setHighlightTransition(null)
    setDescription('开始运行KMP自动机匹配...')
  }

  const handleStep = () => {
    if (steps.length === 0) {
      const allSteps = generateSteps()
      setSteps(allSteps)
      setCurrentStep(0)
      setIsPlaying(false)
    }

    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setCurrentState(step.currentState)
      setTextIndex(step.textIndex)
      setMatchedPositions(step.matchedPositions)
      setHighlightTransition(step.highlightTransition)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
      setIsPlaying(false)
    }
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentState(0)
    setTextIndex(-1)
    setMatchedPositions([])
    setHighlightTransition(null)
    setSteps([])
    setCurrentStep(0)
    setDescription('已重置')
  }

  // Build state label
  const getStateLabel = (state: number): string => {
    if (state === 0) return 'ε'
    return pattern.slice(0, state)
  }

  // Get curved path for transition
  const getTransitionPath = (t: Transition): string => {
    const x1 = getStateX(t.from)
    const y1 = getStateY(t.from)
    const x2 = getStateX(t.to)
    const y2 = getStateY(t.to)

    if (t.isSelfLoop) {
      return `M ${x1} ${y1 - stateRadius} C ${x1 - 40} ${y1 - 80}, ${x1 + 40} ${y1 - 80}, ${x1} ${y1 - stateRadius}`
    }

    const dx = x2 - x1
    const dy = y2 - y1
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) return ''

    // Offset start/end by radius
    const sx = x1 + (dx / dist) * stateRadius
    const sy = y1 + (dy / dist) * stateRadius
    const ex = x2 - (dx / dist) * stateRadius
    const ey = y2 - (dy / dist) * stateRadius

    // Curve for non-adjacent transitions
    if (Math.abs(t.from - t.to) > 1) {
      const midX = (sx + ex) / 2
      const midY = Math.min(sy, ey) - 60 - Math.abs(t.from - t.to) * 15
      return `M ${sx} ${sy} Q ${midX} ${midY}, ${ex} ${ey}`
    }

    // Slight curve for adjacent
    const midX = (sx + ex) / 2
    const midY = (sy + ey) / 2 - 20
    return `M ${sx} ${sy} Q ${midX} ${midY}, ${ex} ${ey}`
  }

  const getTransitionLabelPos = (t: Transition): { x: number; y: number } => {
    if (t.isSelfLoop) {
      return { x: getStateX(t.from), y: getStateY(t.from) - stateRadius - 30 }
    }
    const x1 = getStateX(t.from)
    const y1 = getStateY(t.from)
    const x2 = getStateX(t.to)
    const y2 = getStateY(t.to)

    if (Math.abs(t.from - t.to) > 1) {
      const midX = (x1 + x2) / 2
      const midY = Math.min(y1, y2) - 60 - Math.abs(t.from - t.to) * 15
      return { x: midX, y: midY - 5 }
    }

    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 25 }
  }

  // Group transitions by from->to for display
  const groupedTransitions = new Map<string, { trans: Transition; chars: string[] }>()
  for (const t of transitions) {
    const key = `${t.from}-${t.to}`
    const existing = groupedTransitions.get(key)
    if (existing) {
      existing.chars.push(t.char)
    } else {
      groupedTransitions.set(key, { trans: t, chars: [t.char] })
    }
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleRun}>
          运行
        </button>
        <button className="btn btn-primary" onClick={handleStep}>
          单步
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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          模式串:
          <input
            type="text"
            value={pattern}
            onChange={(e) => { setPattern(e.target.value.toUpperCase()); handleReset() }}
            style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'monospace', width: '120px' }}
          />
        </label>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          文本:
          <input
            type="text"
            value={text}
            onChange={(e) => { setText(e.target.value.toUpperCase()); handleReset() }}
            style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'monospace', width: '240px' }}
          />
        </label>
      </div>

      {/* Text display with match highlights */}
      <div style={{ marginBottom: '0.75rem', fontFamily: 'Consolas, Monaco, monospace', fontSize: '1.1rem', letterSpacing: '0.15em' }}>
        <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem', fontSize: '0.85rem' }}>文本:</span>
        {text.split('').map((c, i) => {
          const isCurrentChar = i === textIndex
          const isMatched = matchedPositions.some(pos => i >= pos && i < pos + m)
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: '1.4em',
                textAlign: 'center',
                padding: '0.15em 0',
                borderBottom: isCurrentChar ? '3px solid #3b82f6' : '3px solid transparent',
                background: isCurrentChar ? 'rgba(59, 130, 246, 0.15)' : isMatched ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                color: isCurrentChar ? '#60a5fa' : isMatched ? '#4ade80' : 'var(--text-primary)',
                fontWeight: isCurrentChar ? 'bold' : 'normal',
                borderRadius: '3px',
              }}
            >
              {c}
            </span>
          )
        })}
      </div>

      {/* Fail function display */}
      <div style={{ marginBottom: '0.75rem', fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <span>fail[]: [{fail.join(', ')}]</span>
      </div>

      {/* DFA State Diagram */}
      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={canvasWidth} height={canvasHeight}>
          <defs>
            <marker id="arrow-gray" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" opacity="0.5" />
            </marker>
            <marker id="arrow-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
            </marker>
            <marker id="arrow-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
            </marker>
          </defs>

          {/* Draw transitions */}
          {Array.from(groupedTransitions.values()).map(({ trans, chars }) => {
            const highlighted = highlightTransition &&
              trans.from === highlightTransition.from &&
              trans.to === highlightTransition.to &&
              chars.includes(highlightTransition.char)

            const path = getTransitionPath(trans)
            const labelPos = getTransitionLabelPos(trans)
            const markerUrl = highlighted
              ? trans.isMatch ? 'url(#arrow-green)' : 'url(#arrow-blue)'
              : 'url(#arrow-gray)'

            return (
              <g key={`${trans.from}-${trans.to}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={highlighted ? (trans.isMatch ? '#22c55e' : '#3b82f6') : 'var(--text-secondary)'}
                  strokeWidth={highlighted ? 3 : 1.2}
                  opacity={highlighted ? 1 : 0.35}
                  markerEnd={markerUrl}
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill={highlighted ? (trans.isMatch ? '#4ade80' : '#60a5fa') : 'var(--text-secondary)'}
                  fontSize="11"
                  fontWeight={highlighted ? 'bold' : 'normal'}
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                  opacity={highlighted ? 1 : 0.5}
                >
                  {chars.join(',')}
                </text>
              </g>
            )
          })}

          {/* Draw states */}
          {Array.from({ length: m + 1 }, (_, i) => {
            const x = getStateX(i)
            const y = getStateY(i)
            const isActive = currentState === i
            const isAccept = i === m

            return (
              <g key={i}>
                {/* Accept state double circle */}
                {isAccept && (
                  <circle
                    cx={x}
                    cy={y}
                    r={stateRadius + 4}
                    fill="none"
                    stroke={isActive ? '#22c55e' : 'var(--text-secondary)'}
                    strokeWidth={isActive ? 3 : 1.5}
                    opacity={isActive ? 1 : 0.4}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={stateRadius}
                  fill={isActive ? (isAccept ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)') : 'var(--bg-card)'}
                  stroke={isActive ? (isAccept ? '#22c55e' : '#3b82f6') : 'var(--border)'}
                  strokeWidth={isActive ? 3 : 1.5}
                />
                <text
                  x={x}
                  y={y - 5}
                  fill={isActive ? (isAccept ? '#4ade80' : '#60a5fa') : 'var(--text-primary)'}
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {i}
                </text>
                <text
                  x={x}
                  y={y + 12}
                  fill="var(--text-secondary)"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {getStateLabel(i)}
                </text>
              </g>
            )
          })}

          {/* Start arrow */}
          <line
            x1={svgPadding - 20}
            y1={getStateY(0)}
            x2={svgPadding + stateRadius - 5}
            y2={getStateY(0)}
            stroke="var(--text-secondary)"
            strokeWidth="2"
            markerEnd="url(#arrow-gray)"
          />
          <text
            x={svgPadding - 25}
            y={getStateY(0) + 5}
            fill="var(--text-secondary)"
            fontSize="12"
            textAnchor="end"
            fontFamily="Consolas, Monaco, monospace"
          >
            start
          </text>
        </svg>
      </div>

      <div className="viz-info">
        <strong>说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(59, 130, 246, 0.3)', border: '2px solid #3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前状态
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(34, 197, 94, 0.3)', border: '2px solid #22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          接受状态
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: '#3b82f6', marginRight: 4, verticalAlign: 'middle' }} />
          当前转移
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: 'rgba(128,128,128,0.35)', marginRight: 4, verticalAlign: 'middle' }} />
          非活跃转移
        </span>
      </div>
    </div>
  )
}
