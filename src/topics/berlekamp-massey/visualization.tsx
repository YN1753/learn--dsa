import { useState, useEffect, useRef, useCallback } from 'react'

interface BMState {
  C: number[]       // 当前递推式系数
  B: number[]       // 上一次更新时的递推式
  L: number         // 当前递推式长度
  m: number         // 修正偏移量
  b: number         // 上一次的差异
  i: number         // 当前处理的序列位置
  d: number         // 当前差异
  phase: 'init' | 'check' | 'update' | 'done'
}

interface AnimationStep {
  description: string
  state: BMState
  highlightIndex: number | null
  highlightType: 'check' | 'match' | 'mismatch' | 'update' | 'none'
}

const EXAMPLE_SEQUENCES: Record<string, { seq: number[], name: string }> = {
  fib: { seq: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55], name: 'Fibonacci' },
  trib: { seq: [1, 1, 2, 4, 7, 13, 24, 44, 81, 149], name: 'Tribonacci' },
  pow2: { seq: [1, 2, 4, 8, 16, 32, 64, 128], name: '2的幂次' },
}

function modInverse(a: number, mod: number): number {
  let b = mod, x = 0, y = 1, lastX = 1, lastY = 0
  while (b !== 0) {
    const q = Math.floor(a / b)
    ;[a, b] = [b, a % b]
    ;[x, lastX] = [lastX - q * x, x]
    ;[y, lastY] = [lastY - q * y, y]
  }
  return ((lastX % mod) + mod) % mod
}

function bmSteps(seq: number[], mod: number = 998244353): AnimationStep[] {
  const steps: AnimationStep[] = []
  const n = seq.length
  let C = [1]
  let B = [1]
  let L = 0
  let m = 1
  let b = 1

  steps.push({
    description: '初始化：递推式 C = [1]，长度 L = 0',
    state: { C: [...C], B: [...B], L, m, b, i: 0, d: 0, phase: 'init' },
    highlightIndex: null,
    highlightType: 'none',
  })

  for (let i = 0; i < n; i++) {
    // 计算差异
    let d = seq[i]
    for (let j = 1; j <= L && j < C.length; j++) {
      d = (d + C[j] * seq[i - j]) % mod
    }
    if (d < 0) d += mod

    steps.push({
      description: `检查位置 i=${i}，值=${seq[i]}，计算差异 d=${d}`,
      state: { C: [...C], B: [...B], L, m, b, i, d, phase: 'check' },
      highlightIndex: i,
      highlightType: 'check',
    })

    if (d === 0) {
      m += 1
      steps.push({
        description: `差异为0，递推式满足，继续下一项 (m=${m})`,
        state: { C: [...C], B: [...B], L, m, b, i, d: 0, phase: 'check' },
        highlightIndex: i,
        highlightType: 'match',
      })
    } else {
      if (2 * L <= i) {
        const T = [...C]
        const coeff = (d * modInverse(b, mod)) % mod
        const newC = new Array(Math.max(C.length, m + B.length)).fill(0)
        for (let j = 0; j < C.length; j++) newC[j] = C[j]
        for (let j = 0; j < B.length; j++) {
          newC[j + m] = (newC[j + m] - coeff * B[j]) % mod
          if (newC[j + m] < 0) newC[j + m] += mod
        }
        C = newC
        L = i + 1 - L
        B = T
        b = d
        m = 1

        steps.push({
          description: `2*L <= i，更新递推式：L 从 ${L} 变为 ${i + 1 - L}，新递推式 C = [${C.join(',')}]`,
          state: { C: [...C], B: [...B], L, m, b, i, d, phase: 'update' },
          highlightIndex: i,
          highlightType: 'update',
        })
      } else {
        const coeff = (d * modInverse(b, mod)) % mod
        const newC = new Array(Math.max(C.length, m + B.length)).fill(0)
        for (let j = 0; j < C.length; j++) newC[j] = C[j]
        for (let j = 0; j < B.length; j++) {
          newC[j + m] = (newC[j + m] - coeff * B[j]) % mod
          if (newC[j + m] < 0) newC[j + m] += mod
        }
        C = newC
        m += 1

        steps.push({
          description: `2*L > i，修正递推式，m 增加到 ${m}，C = [${C.join(',')}]`,
          state: { C: [...C], B: [...B], L, m, b, i, d, phase: 'update' },
          highlightIndex: i,
          highlightType: 'mismatch',
        })
      }
    }
  }

  steps.push({
    description: `算法完成！最短递推式长度为 ${L}，系数 C = [${C.join(',')}]`,
    state: { C: [...C], B: [...B], L, m, b, i: n, d: 0, phase: 'done' },
    highlightIndex: null,
    highlightType: 'none',
  })

  return steps
}

function formatRecurrence(C: number[]): string {
  if (C.length <= 1) return '无递推式'
  const terms: string[] = []
  for (let i = 1; i < C.length; i++) {
    if (C[i] === 0) continue
    const sign = C[i] > 0 && terms.length > 0 ? '+ ' : ''
    const coeff = Math.abs(C[i]) === 1 ? '' : `${Math.abs(C[i])}`
    terms.push(`${sign}${coeff}a[n-${i}]`)
  }
  return terms.length > 0 ? `a[n] = ${terms.join(' ')}` : '无递推式'
}

export default function BerlekampMasseyVisualization() {
  const [sequence, setSequence] = useState<number[]>(EXAMPLE_SEQUENCES.fib.seq)
  const [sequenceName, setSequenceName] = useState<string>('Fibonacci')
  const [customInput, setCustomInput] = useState<string>('')
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState<string>('Berlekamp-Massey算法可视化 - 选择序列并开始')
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback(() => {
    const newSteps = bmSteps(sequence)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    setDescription('步骤已生成，点击「播放」或「单步」开始')
  }, [sequence])

  useEffect(() => {
    generateSteps()
  }, [generateSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePlay = () => {
    if (currentStep >= steps.length) {
      generateSteps()
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
    setDescription(description + ' [已暂停]')
  }

  const handleStep = () => {
    if (currentStep >= steps.length) {
      generateSteps()
      return
    }
    setIsPlaying(false)
    const step = steps[currentStep]
    setDescription(step.description)
    setCurrentStep(prev => prev + 1)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    generateSteps()
    setDescription('已重置')
  }

  const handleSelectSequence = (key: string) => {
    const seq = EXAMPLE_SEQUENCES[key]
    if (seq) {
      setSequence(seq.seq)
      setSequenceName(seq.name)
      setCustomInput('')
    }
  }

  const handleCustomSequence = () => {
    const parsed = customInput.split(/[,\s]+/).map(Number).filter(n => !isNaN(n))
    if (parsed.length >= 2) {
      setSequence(parsed)
      setSequenceName('自定义')
    }
  }

  const currentState = currentStep > 0 && currentStep <= steps.length
    ? steps[currentStep - 1].state
    : null

  const highlightIndex = currentStep > 0 && currentStep <= steps.length
    ? steps[currentStep - 1].highlightIndex
    : null

  const highlightType = currentStep > 0 && currentStep <= steps.length
    ? steps[currentStep - 1].highlightType
    : 'none'

  const getHighlightColor = (idx: number): string => {
    if (idx !== highlightIndex) return 'var(--bg-card)'
    switch (highlightType) {
      case 'check': return '#3b82f6'
      case 'match': return '#22c55e'
      case 'mismatch': return '#ef4444'
      case 'update': return '#f59e0b'
      default: return 'var(--bg-card)'
    }
  }

  const getHighlightBorder = (idx: number): string => {
    if (idx !== highlightIndex) return 'var(--border)'
    switch (highlightType) {
      case 'check': return '#60a5fa'
      case 'match': return '#4ade80'
      case 'mismatch': return '#f87171'
      case 'update': return '#fbbf24'
      default: return 'var(--border)'
    }
  }

  const cellSize = 48
  const padding = 16

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <select
          value={Object.keys(EXAMPLE_SEQUENCES).find(k => EXAMPLE_SEQUENCES[k].name === sequenceName) || ''}
          onChange={(e) => handleSelectSequence(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        >
          {Object.entries(EXAMPLE_SEQUENCES).map(([key, val]) => (
            <option key={key} value={key}>{val.name}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="自定义序列，逗号分隔"
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              width: '180px',
            }}
          />
          <button className="btn btn-secondary" onClick={handleCustomSequence}>
            应用
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {currentStep >= steps.length ? (
            <button className="btn btn-primary" onClick={handlePlay}>
              重新开始
            </button>
          ) : isPlaying ? (
            <button className="btn btn-secondary" onClick={handlePause}>
              暂停
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handlePlay}>
              播放
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleStep} disabled={isPlaying}>
            单步
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            重置
          </button>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="200"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto', padding: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            输入序列 ({sequenceName})：
          </div>
          <svg width={Math.max(sequence.length * (cellSize + 4) + padding * 2, 300)} height={cellSize + padding * 2}>
            {sequence.map((val, idx) => {
              const x = padding + idx * (cellSize + 4)
              const y = padding
              return (
                <g key={idx}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx="6"
                    fill={getHighlightColor(idx)}
                    stroke={getHighlightBorder(idx)}
                    strokeWidth={idx === highlightIndex ? 2.5 : 1}
                  />
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 5}
                    fill="var(--text-primary)"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {val}
                  </text>
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize + 14}
                    fill="var(--text-secondary)"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {idx}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {currentState && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '200px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                当前递推式系数 C(x)：
              </div>
              <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                background: 'var(--bg-secondary)',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}>
                {currentState.C.map((coeff, idx) => (
                  <span key={idx} style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.5rem',
                    background: idx === 0 ? 'var(--accent)' : 'var(--bg-card)',
                    color: idx === 0 ? '#fff' : 'var(--text-primary)',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    border: '1px solid var(--border)',
                  }}>
                    {idx === 0 ? '1' : `c${idx}=${coeff}`}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ minWidth: '150px' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                状态信息：
              </div>
              <div style={{
                background: 'var(--bg-secondary)',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '0.85rem',
                fontFamily: 'Consolas, Monaco, monospace',
                lineHeight: '1.6',
              }}>
                <div>递推式长度 L = {currentState.L}</div>
                <div>修正偏移量 m = {currentState.m}</div>
                <div>上次差异 b = {currentState.b}</div>
                {currentState.phase === 'check' && <div>当前差异 d = {currentState.d}</div>}
              </div>
            </div>

            {currentState.L > 0 && (
              <div style={{ minWidth: '200px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  递推关系：
                </div>
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  color: 'var(--accent)',
                }}>
                  {formatRecurrence(currentState.C)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在检查
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          递推式满足
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          存在差异
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          递推式更新
        </span>
      </div>
    </div>
  )
}
