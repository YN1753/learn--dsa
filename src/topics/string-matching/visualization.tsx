import { useState, useEffect, useRef, useCallback } from 'react'

type MatchMode = 'brute-force' | 'kmp'

interface MatchStep {
  textIndex: number      // 当前文本位置 i
  patternIndex: number   // 当前模式串位置 j
  patternOffset: number  // 模式串在文本中的偏移量
  comparing: boolean     // 是否正在比较
  matched: boolean       // 当前比较是否匹配
  allMatched: boolean    // 是否找到完整匹配
  shift: boolean         // 是否发生了模式串滑动
  description: string
  failUsed: boolean      // KMP 中是否使用了失败函数
  failValue: number      // KMP 中使用的失败函数值
}

// 构建失败函数并记录步骤
function buildFailureFunction(pattern: string): number[] {
  const m = pattern.length
  const fail: number[] = new Array(m).fill(0)
  let len = 0
  let i = 1
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++
      fail[i] = len
      i++
    } else {
      if (len > 0) {
        len = fail[len - 1]
      } else {
        fail[i] = 0
        i++
      }
    }
  }
  return fail
}

// 生成暴力匹配步骤
function generateBruteForceSteps(text: string, pattern: string): MatchStep[] {
  const steps: MatchStep[] = []
  const n = text.length
  const m = pattern.length

  if (m === 0 || n < m) return steps

  steps.push({
    textIndex: 0,
    patternIndex: 0,
    patternOffset: 0,
    comparing: false,
    matched: false,
    allMatched: false,
    shift: false,
    description: '开始暴力匹配',
    failUsed: false,
    failValue: -1,
  })

  for (let i = 0; i <= n - m; i++) {
    let j = 0
    while (j < m) {
      const isMatch = text[i + j] === pattern[j]
      steps.push({
        textIndex: i + j,
        patternIndex: j,
        patternOffset: i,
        comparing: true,
        matched: isMatch,
        allMatched: false,
        shift: false,
        description: isMatch
          ? `比较 T[${i + j}]='${text[i + j]}' == P[${j}]='${pattern[j]}' ✓`
          : `比较 T[${i + j}]='${text[i + j]}' ≠ P[${j}]='${pattern[j]}' ✗`,
        failUsed: false,
        failValue: -1,
      })

      if (!isMatch) break
      j++
    }

    if (j === m) {
      steps.push({
        textIndex: i,
        patternIndex: 0,
        patternOffset: i,
        comparing: false,
        matched: true,
        allMatched: true,
        shift: false,
        description: `在位置 ${i} 找到完整匹配!`,
        failUsed: false,
        failValue: -1,
      })
    } else if (i < n - m) {
      steps.push({
        textIndex: i + 1,
        patternIndex: 0,
        patternOffset: i + 1,
        comparing: false,
        matched: false,
        allMatched: false,
        shift: true,
        description: `失配，模式串右移 1 位 → 偏移 ${i + 1}`,
        failUsed: false,
        failValue: -1,
      })
    }
  }

  steps.push({
    textIndex: n,
    patternIndex: 0,
    patternOffset: 0,
    comparing: false,
    matched: false,
    allMatched: false,
    shift: false,
    description: '暴力匹配结束',
    failUsed: false,
    failValue: -1,
  })

  return steps
}

// 生成 KMP 匹配步骤
function generateKMPSteps(text: string, pattern: string): MatchStep[] {
  const steps: MatchStep[] = []
  const n = text.length
  const m = pattern.length

  if (m === 0 || n < m) return steps

  const fail = buildFailureFunction(pattern)

  steps.push({
    textIndex: 0,
    patternIndex: 0,
    patternOffset: 0,
    comparing: false,
    matched: false,
    allMatched: false,
    shift: false,
    description: `开始 KMP 匹配 (失败函数: [${fail.join(', ')}])`,
    failUsed: false,
    failValue: -1,
  })

  let i = 0
  let j = 0

  while (i < n) {
    const isMatch = text[i] === pattern[j]
    steps.push({
      textIndex: i,
      patternIndex: j,
      patternOffset: i - j,
      comparing: true,
      matched: isMatch,
      allMatched: false,
      shift: false,
      description: isMatch
        ? `比较 T[${i}]='${text[i]}' == P[${j}]='${pattern[j]}' ✓`
        : `比较 T[${i}]='${text[i]}' ≠ P[${j}]='${pattern[j]}' ✗`,
      failUsed: false,
      failValue: -1,
    })

    if (isMatch) {
      i++
      j++
      if (j === m) {
        steps.push({
          textIndex: i - 1,
          patternIndex: m - 1,
          patternOffset: i - m,
          comparing: false,
          matched: true,
          allMatched: true,
          shift: false,
          description: `在位置 ${i - m} 找到完整匹配!`,
          failUsed: false,
          failValue: -1,
        })
        j = fail[j - 1]
        steps.push({
          textIndex: i,
          patternIndex: j,
          patternOffset: i - j,
          comparing: false,
          matched: false,
          allMatched: false,
          shift: true,
          description: `匹配成功，j 回退到 fail[${m - 1}] = ${j}（i=${i} 不变）`,
          failUsed: true,
          failValue: j,
        })
      }
    } else {
      if (j > 0) {
        const oldJ = j
        j = fail[j - 1]
        steps.push({
          textIndex: i,
          patternIndex: j,
          patternOffset: i - j,
          comparing: false,
          matched: false,
          allMatched: false,
          shift: true,
          description: `失配! j 从 ${oldJ} 回退到 fail[${oldJ - 1}] = ${j}（i=${i} 不变，模式串右移 ${oldJ - j} 位）`,
          failUsed: true,
          failValue: j,
        })
      } else {
        i++
        steps.push({
          textIndex: i,
          patternIndex: 0,
          patternOffset: i,
          comparing: false,
          matched: false,
          allMatched: false,
          shift: true,
          description: `j=0 已无法回退，文本指针右移 → i=${i}`,
          failUsed: false,
          failValue: -1,
        })
      }
    }
  }

  steps.push({
    textIndex: n,
    patternIndex: 0,
    patternOffset: 0,
    comparing: false,
    matched: false,
    allMatched: false,
    shift: false,
    description: 'KMP 匹配结束',
    failUsed: false,
    failValue: -1,
  })

  return steps
}

// 获取字符颜色
function getCharColor(
  type: 'text' | 'pattern',
  index: number,
  step: MatchStep
): { bg: string; border: string; color: string } {
  const isComparing = step.comparing
  const textIdx = step.textIndex
  const patIdx = step.patternIndex
  const offset = step.patternOffset

  if (type === 'text') {
    if (step.allMatched && index >= offset && index < offset + step.patternIndex + 1) {
      return { bg: '#22c55e', border: '#16a34a', color: '#fff' }
    }
    if (isComparing && index === textIdx) {
      if (step.matched) {
        return { bg: '#22c55e', border: '#16a34a', color: '#fff' }
      }
      return { bg: '#ef4444', border: '#dc2626', color: '#fff' }
    }
    if (index >= offset && index < offset + (step.allMatched ? step.patternIndex + 1 : patIdx)) {
      return { bg: '#94a3b8', border: '#64748b', color: '#fff' }
    }
    return { bg: 'var(--bg-card)', border: 'var(--border)', color: 'var(--text-primary)' }
  } else {
    // pattern
    if (step.allMatched && index <= patIdx) {
      return { bg: '#22c55e', border: '#16a34a', color: '#fff' }
    }
    if (isComparing && index === patIdx) {
      if (step.matched) {
        return { bg: '#22c55e', border: '#16a34a', color: '#fff' }
      }
      return { bg: '#ef4444', border: '#dc2626', color: '#fff' }
    }
    if (index < patIdx && !step.allMatched) {
      return { bg: '#94a3b8', border: '#64748b', color: '#fff' }
    }
    return { bg: 'var(--bg-card)', border: 'var(--border)', color: 'var(--text-primary)' }
  }
}

const modeLabels: Record<MatchMode, string> = {
  'brute-force': '暴力匹配',
  'kmp': 'KMP 匹配',
}

export default function StringMatchingVisualization() {
  const [mode, setMode] = useState<MatchMode>('brute-force')
  const [text, setText] = useState('ABABABCABABABCABD')
  const [pattern, setPattern] = useState('ABABCABD')
  const [steps, setSteps] = useState<MatchStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [comparisons, setComparisons] = useState(0)
  const timerRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Generate steps
  const generateSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)

    let newSteps: MatchStep[]
    if (mode === 'brute-force') {
      newSteps = generateBruteForceSteps(text, pattern)
    } else {
      newSteps = generateKMPSteps(text, pattern)
    }

    setSteps(newSteps)
    setCurrentStep(0)
    setComparisons(newSteps.filter(s => s.comparing).length)
  }, [text, pattern, mode])

  // Initialize
  useEffect(() => {
    generateSteps()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play
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

  // Controls
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
    textIndex: 0,
    patternIndex: 0,
    patternOffset: 0,
    comparing: false,
    matched: false,
    allMatched: false,
    shift: false,
    description: '点击"生成步骤"或"播放"开始演示',
    failUsed: false,
    failValue: -1,
  }

  // Failure function for display
  const failArray = pattern.length > 0 ? buildFailureFunction(pattern) : []

  return (
    <div className="visualization-container">
      {/* Mode selector */}
      <div className="viz-controls">
        <select
          value={mode}
          onChange={e => {
            setMode(e.target.value as MatchMode)
            setIsPlaying(false)
            if (timerRef.current) {
              clearTimeout(timerRef.current)
              timerRef.current = null
            }
          }}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        >
          <option value="brute-force">暴力匹配</option>
          <option value="kmp">KMP 匹配</option>
        </select>

        <button className="btn btn-primary" onClick={generateSteps}>
          生成步骤
        </button>
        <button className="btn btn-secondary" onClick={reset}>
          重置
        </button>
      </div>

      {/* Input fields */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '0.25rem 0',
        }}
      >
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
              width: '200px',
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
              width: '140px',
              fontFamily: 'monospace',
            }}
          />
        </label>
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
              const colors = getCharColor('text', idx, current)
              return (
                <div
                  key={idx}
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
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  {char}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-14px',
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
            {/* Leading spacer to align pattern under text */}
            <div style={{ width: current.patternOffset * 35, flexShrink: 0 }} />
            {pattern.split('').map((char, idx) => {
              const colors = getCharColor('pattern', idx, current)
              return (
                <div
                  key={idx}
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
                    flexShrink: 0,
                  }}
                >
                  {char}
                </div>
              )
            })}
          </div>
        </div>

        {/* Comparison pointer indicator */}
        {current.comparing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '3px',
              marginTop: '-0.25rem',
            }}
          >
            <div style={{ width: current.textIndex * 35 + 12, flexShrink: 0 }} />
            <div
              style={{
                fontSize: '0.7rem',
                color: current.matched ? '#22c55e' : '#ef4444',
                fontWeight: 600,
                textAlign: 'center',
                width: '10px',
              }}
            >
              {current.matched ? '✓' : '✗'}
            </div>
          </div>
        )}
      </div>

      {/* Failure function display for KMP mode */}
      {mode === 'kmp' && pattern.length > 0 && (
        <div
          style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--bg-secondary, rgba(0,0,0,0.03))',
            borderRadius: 'var(--radius)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}
        >
          <strong>失败函数 (fail):</strong>{' '}
          <span style={{ fontFamily: 'monospace' }}>
            [{failArray.join(', ')}]
          </span>
          {current.failUsed && current.failValue >= 0 && (
            <span
              style={{
                marginLeft: '0.75rem',
                color: 'var(--accent)',
                fontWeight: 600,
              }}
            >
              → 使用失败函数: j 回退到 {current.failValue}
            </span>
          )}
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
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
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
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#ef4444',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          失配
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#94a3b8',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          已比较过
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
          <span>算法: {modeLabels[mode]}</span>
          <span>
            文本位置: {current.textIndex < text.length ? current.textIndex : '-'}
          </span>
          <span>
            模式位置: {current.patternIndex < pattern.length ? current.patternIndex : '-'}
          </span>
          <span>模式偏移: {current.patternOffset}</span>
          <span>总比较次数: {comparisons}</span>
        </div>
      </div>
    </div>
  )
}
