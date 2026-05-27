import { useState, useEffect, useRef, useCallback } from 'react'

interface RKStep {
  windowStart: number
  windowEnd: number
  windowHash: number
  patternHash: number
  hashMatch: boolean
  charMatch: boolean
  verified: boolean
  isMatch: boolean
  description: string
  oldChar: string
  newChar: string
  rolling: boolean
}

const DEFAULT_BASE = 31
const DEFAULT_MOD = 1e9 + 7

function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base %= mod
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod
    base = (base * base) % mod
    exp >>= 1
  }
  return result
}

function polynomialHash(s: string, base: number, mod: number): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (hash * base + s.charCodeAt(i)) % mod
  }
  return hash
}

function generateSteps(text: string, pattern: string, base: number, mod: number): RKStep[] {
  const steps: RKStep[] = []
  const n = text.length
  const m = pattern.length

  if (m === 0 || n < m) return steps

  const patternHash = polynomialHash(pattern, base, mod)
  const powBaseM = modPow(base, m, mod)

  // Initial step
  steps.push({
    windowStart: 0,
    windowEnd: m - 1,
    windowHash: 0,
    patternHash,
    hashMatch: false,
    charMatch: false,
    verified: false,
    isMatch: false,
    description: `开始 Rabin-Karp 匹配: 模式串哈希值 = ${patternHash}`,
    oldChar: '',
    newChar: '',
    rolling: false,
  })

  let hashW = polynomialHash(text.substring(0, m), base, mod)

  for (let i = 0; i <= n - m; i++) {
    const window = text.substring(i, i + m)
    const hashMatch = hashW === patternHash
    let charMatch = false

    if (hashMatch) {
      charMatch = window === pattern

      steps.push({
        windowStart: i,
        windowEnd: i + m - 1,
        windowHash: hashW,
        patternHash,
        hashMatch: true,
        charMatch,
        verified: true,
        isMatch: charMatch,
        description: charMatch
          ? `位置 ${i}: 哈希匹配 (${hashW} == ${patternHash}), 逐字符验证通过! 找到匹配`
          : `位置 ${i}: 哈希匹配 (${hashW} == ${patternHash}), 但验证失败 (哈希冲突!)`,
        oldChar: '',
        newChar: '',
        rolling: false,
      })
    } else {
      steps.push({
        windowStart: i,
        windowEnd: i + m - 1,
        windowHash: hashW,
        patternHash,
        hashMatch: false,
        charMatch: false,
        verified: false,
        isMatch: false,
        description: `位置 ${i}: 哈希不匹配 (${hashW} ≠ ${patternHash}), 跳过`,
        oldChar: '',
        newChar: '',
        rolling: false,
      })
    }

    // Rolling hash step
    if (i < n - m) {
      const oldChar = text[i]
      const newChar = text[i + m]
      const oldHash = hashW
      hashW = ((hashW * base - oldChar.charCodeAt(0) * powBaseM % mod + newChar.charCodeAt(0)) % mod + mod) % mod

      steps.push({
        windowStart: i + 1,
        windowEnd: i + m,
        windowHash: hashW,
        patternHash,
        hashMatch: false,
        charMatch: false,
        verified: false,
        isMatch: false,
        description: `滚动哈希: 移除 '${oldChar}', 加入 '${newChar}', H: ${oldHash} → ${hashW}`,
        oldChar,
        newChar,
        rolling: true,
      })
    }
  }

  // End step
  steps.push({
    windowStart: n,
    windowEnd: n,
    windowHash: 0,
    patternHash,
    hashMatch: false,
    charMatch: false,
    verified: false,
    isMatch: false,
    description: 'Rabin-Karp 匹配结束',
    oldChar: '',
    newChar: '',
    rolling: false,
  })

  return steps
}

function getCharStyle(
  type: 'text' | 'pattern',
  index: number,
  step: RKStep
): { bg: string; border: string; color: string } {
  const { windowStart, windowEnd, hashMatch, charMatch, verified, isMatch, rolling } = step

  if (type === 'text') {
    // Matched range
    if (isMatch && index >= windowStart && index <= windowEnd) {
      return { bg: '#22c55e', border: '#16a34a', color: '#fff' }
    }
    // Current window with hash match but conflict
    if (verified && !charMatch && index >= windowStart && index <= windowEnd) {
      return { bg: '#f59e0b', border: '#d97706', color: '#fff' }
    }
    // Current window - not yet verified
    if (!rolling && index >= windowStart && index <= windowEnd) {
      if (hashMatch) {
        return { bg: '#f59e0b', border: '#d97706', color: '#fff' }
      }
      return { bg: '#3b82f6', border: '#2563eb', color: '#fff' }
    }
    // Rolling - old char being removed
    if (rolling && index === windowStart - 1) {
      return { bg: '#ef4444', border: '#dc2626', color: '#fff' }
    }
    // Rolling - new char being added
    if (rolling && index === windowEnd) {
      return { bg: '#22c55e', border: '#16a34a', color: '#fff' }
    }
    return { bg: 'var(--bg-card)', border: 'var(--border)', color: 'var(--text-primary)' }
  } else {
    // Pattern
    if (isMatch) {
      return { bg: '#22c55e', border: '#16a34a', color: '#fff' }
    }
    if (verified && !charMatch) {
      return { bg: '#f59e0b', border: '#d97706', color: '#fff' }
    }
    return { bg: 'var(--bg-card)', border: 'var(--border)', color: 'var(--text-primary)' }
  }
}

export default function StringHashingVisualization() {
  const [text, setText] = useState('ABRACADABRA')
  const [pattern, setPattern] = useState('ABRA')
  const [base, setBase] = useState(DEFAULT_BASE)
  const [mod, setMod] = useState(DEFAULT_MOD)
  const [steps, setSteps] = useState<RKStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const timerRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const generateAllSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newSteps = generateSteps(text, pattern, base, mod)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [text, pattern, base, mod])

  useEffect(() => {
    generateAllSteps()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, speed)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, steps, speed])

  const togglePlay = useCallback(() => {
    if (steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }, [steps, currentStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const current = steps[currentStep] || steps[0] || {
    windowStart: 0,
    windowEnd: 0,
    windowHash: 0,
    patternHash: 0,
    hashMatch: false,
    charMatch: false,
    verified: false,
    isMatch: false,
    description: '点击"生成步骤"或"播放"开始演示',
    oldChar: '',
    newChar: '',
    rolling: false,
  }

  const patternHashDisplay = pattern.length > 0 ? polynomialHash(pattern, base, mod) : 0

  return (
    <div className="visualization-container">
      {/* Input fields */}
      <div className="viz-controls">
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          文本 T:
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value.toUpperCase())}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '180px',
              fontFamily: 'monospace',
            }}
          />
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          模式 P:
          <input
            type="text"
            value={pattern}
            onChange={e => setPattern(e.target.value.toUpperCase())}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '120px',
              fontFamily: 'monospace',
            }}
          />
        </label>
        <button className="btn btn-primary" onClick={generateAllSteps}>
          生成步骤
        </button>
        <button className="btn btn-secondary" onClick={reset}>
          重置
        </button>
      </div>

      {/* Hash parameters */}
      <div className="viz-controls">
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          Base:
          <input
            type="number"
            value={base}
            onChange={e => setBase(Math.max(2, Number(e.target.value)))}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '70px',
            }}
          />
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          Mod:
          <input
            type="number"
            value={mod}
            onChange={e => setMod(Math.max(2, Number(e.target.value)))}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '110px',
            }}
          />
        </label>
        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          H(P) = {patternHashDisplay}
        </span>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button
          className="btn btn-secondary"
          onClick={stepBackward}
          disabled={currentStep <= 0}
        >
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying
            ? '暂停'
            : currentStep >= steps.length - 1
              ? '重新播放'
              : '播放'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={stepForward}
          disabled={currentStep >= steps.length - 1}
        >
          下一步
        </button>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          速度:
          <input
            type="range"
            min="100"
            max="1500"
            step="100"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          {speed}ms
        </label>
      </div>

      {/* Progress bar */}
      {steps.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 0.25rem',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              minWidth: '60px',
            }}
          >
            {currentStep + 1}/{steps.length}
          </span>
          <input
            type="range"
            min="0"
            max={steps.length - 1}
            value={currentStep}
            onChange={e => {
              setIsPlaying(false)
              setCurrentStep(Number(e.target.value))
            }}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* Visualization canvas */}
      <div
        ref={canvasRef}
        className="viz-canvas"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          minHeight: '200px',
          padding: '1.25rem 1rem',
          overflowX: 'auto',
        }}
      >
        {/* Text string */}
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.35rem',
              fontWeight: 600,
            }}
          >
            文本 T:
          </div>
          <div style={{ display: 'flex', gap: '3px', flexWrap: 'nowrap' }}>
            {text.split('').map((char, idx) => {
              const colors = getCharStyle('text', idx, current)
              return (
                <div
                  key={idx}
                  style={{
                    width: '36px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      background: colors.bg,
                      border: `2px solid ${colors.border}`,
                      color: colors.color,
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {char}
                  </div>
                  <span
                    style={{
                      fontSize: '0.55rem',
                      color: 'var(--text-secondary)',
                      opacity: 0.6,
                    }}
                  >
                    {char.charCodeAt(0)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6rem',
                      color: 'var(--text-secondary)',
                      opacity: 0.6,
                    }}
                  >
                    {idx}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pattern string */}
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.35rem',
              fontWeight: 600,
            }}
          >
            模式 P:
          </div>
          <div style={{ display: 'flex', gap: '3px', flexWrap: 'nowrap' }}>
            <div style={{ width: current.windowStart * 39, flexShrink: 0 }} />
            {pattern.split('').map((char, idx) => {
              const colors = getCharStyle('pattern', idx, current)
              return (
                <div
                  key={idx}
                  style={{
                    width: '36px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      background: colors.bg,
                      border: `2px solid ${colors.border}`,
                      color: colors.color,
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {char}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hash window indicator */}
        {!current.rolling && current.windowStart <= text.length - pattern.length && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              marginTop: '-0.15rem',
            }}
          >
            <div style={{ width: current.windowStart * 39 + 10, flexShrink: 0 }} />
            <div
              style={{
                width: `${pattern.length * 39 - 6}px`,
                height: '3px',
                borderRadius: '2px',
                background: current.hashMatch
                  ? (current.charMatch ? '#22c55e' : '#f59e0b')
                  : '#3b82f6',
                transition: 'all 0.15s ease',
              }}
            />
          </div>
        )}
      </div>

      {/* Hash values display */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '0.5rem 0.75rem',
          background: 'var(--bg-secondary, rgba(0,0,0,0.03))',
          borderRadius: 'var(--radius)',
          fontSize: '0.85rem',
        }}
      >
        <span style={{ color: 'var(--text-secondary)' }}>
          <strong>窗口哈希:</strong>{' '}
          <span style={{ fontFamily: 'monospace' }}>{current.windowHash}</span>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          <strong>模式哈希:</strong>{' '}
          <span style={{ fontFamily: 'monospace' }}>{current.patternHash}</span>
        </span>
        {current.hashMatch && (
          <span
            style={{
              color: current.charMatch ? '#22c55e' : '#f59e0b',
              fontWeight: 600,
            }}
          >
            {current.charMatch ? '哈希匹配 ✓ 验证通过' : '哈希匹配 ⚠ 冲突!'}
          </span>
        )}
      </div>

      {/* Rolling hash formula display */}
      {current.rolling && (
        <div
          style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-secondary, rgba(0,0,0,0.03))',
            borderRadius: 'var(--radius)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
          }}
        >
          <strong>滚动公式:</strong> H = (H × {base} - '{current.oldChar}'×{base}
          <sup>{pattern.length}</sup> + '{current.newChar}') mod {mod}
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          padding: '0.25rem 0',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#22c55e',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          匹配成功
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#f59e0b',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          哈希冲突
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#3b82f6',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          当前窗口
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#ef4444',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          移除字符
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>
          {current.description}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
          }}
        >
          <span>
            窗口位置: [{current.windowStart}, {current.windowEnd}]
          </span>
          <span>窗口哈希: {current.windowHash}</span>
          <span>模式哈希: {current.patternHash}</span>
          <span>Base: {base}</span>
          <span>Mod: {mod}</span>
        </div>
      </div>
    </div>
  )
}
