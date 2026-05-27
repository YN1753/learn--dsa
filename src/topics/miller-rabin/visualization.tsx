import { useState, useEffect, useRef, useCallback } from 'react'

interface TestStep {
  description: string
  phase: 'decompose' | 'modpow' | 'probe' | 'result'
  round: number
  detail: string
  highlightValue?: string
  isPass?: boolean
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n
  base = base % mod
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod
    }
    exp = exp / 2n
    base = (base * base) % mod
  }
  return result
}

function generateSteps(n: number): TestStep[] {
  const steps: TestStep[] = []
  const bigN = BigInt(n)

  if (n < 2) {
    steps.push({
      description: `${n} < 2，不是素数`,
      phase: 'result',
      round: 0,
      detail: '小于2的数不是素数',
      isPass: false,
    })
    return steps
  }

  if (n === 2 || n === 3) {
    steps.push({
      description: `${n} 是小素数，直接判定`,
      phase: 'result',
      round: 0,
      detail: `${n} 是素数`,
      isPass: true,
    })
    return steps
  }

  if (n % 2 === 0) {
    steps.push({
      description: `${n} 是偶数，不是素数`,
      phase: 'result',
      round: 0,
      detail: '偶数(除2外)不是素数',
      isPass: false,
    })
    return steps
  }

  // Decompose n-1 = 2^r * d
  let d = bigN - 1n
  let r = 0
  while (d % 2n === 0n) {
    d /= 2n
    r++
  }

  steps.push({
    description: `分解 n-1 = ${n - 1} = 2^${r} × ${d}`,
    phase: 'decompose',
    round: 0,
    detail: `n = ${n}, n-1 = ${n - 1}, r = ${r}, d = ${d}`,
  })

  const witnesses = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]

  for (let wi = 0; wi < witnesses.length; wi++) {
    const a = witnesses[wi]
    if (BigInt(a) >= bigN) break

    const round = wi + 1
    steps.push({
      description: `第 ${round} 轮测试，底数 a = ${a}`,
      phase: 'modpow',
      round,
      detail: `计算 ${a}^${d} mod ${n}`,
    })

    const x0 = modPow(BigInt(a), d, bigN)

    steps.push({
      description: `${a}^${d} mod ${n} = ${x0}`,
      phase: 'modpow',
      round,
      detail: `结果: ${x0}`,
      highlightValue: x0.toString(),
    })

    if (x0 === 1n || x0 === bigN - 1n) {
      steps.push({
        description: `${x0} ≡ ${x0 === 1n ? '1' : 'n-1'} (mod n)，通过本轮测试`,
        phase: 'probe',
        round,
        detail: `底数 a=${a} 未发现 n 为合数`,
        isPass: true,
        highlightValue: x0.toString(),
      })
      continue
    }

    let foundComposite = false
    let x = x0
    for (let i = 0; i < r - 1; i++) {
      const prevX = x
      x = modPow(x, 2n, bigN)

      steps.push({
        description: `平方探测 ${i + 1}/${r - 1}: ${prevX}^2 mod ${n} = ${x}`,
        phase: 'probe',
        round,
        detail: `第${i + 1}次平方`,
        highlightValue: x.toString(),
      })

      if (x === bigN - 1n) {
        steps.push({
          description: `到达 n-1 = ${n - 1}，通过本轮测试`,
          phase: 'probe',
          round,
          detail: `底数 a=${a} 未发现 n 为合数`,
          isPass: true,
          highlightValue: x.toString(),
        })
        break
      }

      if (x === 1n) {
        steps.push({
          description: `发现非平凡平方根! ${prevX}^2 ≡ 1 (mod ${n})，但 ${prevX} ≠ ±1`,
          phase: 'result',
          round,
          detail: `${n} 一定是合数`,
          isPass: false,
          highlightValue: prevX.toString(),
        })
        foundComposite = true
        break
      }
    }

    if (foundComposite) {
      steps.push({
        description: `结论: ${n} 是合数`,
        phase: 'result',
        round,
        detail: `在第 ${round} 轮被底数 a=${a} 证伪`,
        isPass: false,
      })
      return steps
    }

    if (x !== bigN - 1n && x !== 1n) {
      steps.push({
        description: `经过 ${r - 1} 次平方仍未到达 n-1，n 是合数`,
        phase: 'result',
        round,
        detail: `${n} 一定是合数`,
        isPass: false,
      })
      return steps
    }
  }

  steps.push({
    description: `通过所有测试轮，${n} 是素数`,
    phase: 'result',
    round: 0,
    detail: `${n} 通过了 ${Math.min(witnesses.length, witnesses.filter(w => w < n).length)} 轮 Miller-Rabin 测试`,
    isPass: true,
  })

  return steps
}

export default function MillerRabinVisualization() {
  const [inputValue, setInputValue] = useState(561)
  const [steps, setSteps] = useState<TestStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const handleStart = useCallback(() => {
    const newSteps = generateSteps(inputValue)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [inputValue])

  const handleStep = useCallback(() => {
    if (steps.length === 0) {
      const newSteps = generateSteps(inputValue)
      setSteps(newSteps)
      setCurrentStep(1)
      return
    }
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }, [steps, currentStep, inputValue])

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

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
  }

  const currentStepData = steps.length > 0 && currentStep > 0 ? steps[currentStep - 1] : null

  const getPhaseColor = (phase: TestStep['phase']) => {
    switch (phase) {
      case 'decompose': return '#8b5cf6'
      case 'modpow': return '#3b82f6'
      case 'probe': return '#f59e0b'
      case 'result': return '#22c55e'
      default: return 'var(--text-secondary)'
    }
  }

  const getPhaseLabel = (phase: TestStep['phase']) => {
    switch (phase) {
      case 'decompose': return '分解'
      case 'modpow': return '模幂'
      case 'probe': return '探测'
      case 'result': return '结论'
      default: return ''
    }
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          测试数 n:
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Math.max(2, Number(e.target.value)))}
            style={{ width: 120, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          />
        </label>
        <button className="btn btn-primary" onClick={handleStart}>
          开始测试
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={steps.length > 0 && currentStep >= steps.length}>
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
            min="200"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ padding: '1.5rem', minHeight: 280 }}>
        {steps.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
            输入一个数并点击「开始测试」或「单步执行」查看 Miller-Rabin 测试过程
          </div>
        )}

        {steps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Progress bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                进度:
              </span>
              <div style={{ flex: 1, height: 8, background: 'var(--bg-secondary, #1a1a2e)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(currentStep / steps.length) * 100}%`,
                    height: '100%',
                    background: 'var(--accent, #6366f1)',
                    borderRadius: 4,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                {currentStep}/{steps.length}
              </span>
            </div>

            {/* Current step display */}
            {currentStepData && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 8,
                  border: `2px solid ${getPhaseColor(currentStepData.phase)}`,
                  background: `${getPhaseColor(currentStepData.phase)}15`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: 4,
                      background: getPhaseColor(currentStepData.phase),
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                    }}
                  >
                    {getPhaseLabel(currentStepData.phase)}
                  </span>
                  {currentStepData.round > 0 && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      第 {currentStepData.round} 轮
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {currentStepData.description}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {currentStepData.detail}
                </div>
              </div>
            )}

            {/* Step history */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {steps.slice(0, currentStep).map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.5rem',
                    borderRadius: 4,
                    background: i === currentStep - 1 ? `${getPhaseColor(step.phase)}10` : 'transparent',
                    opacity: i === currentStep - 1 ? 1 : 0.6,
                    fontSize: '0.85rem',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: getPhaseColor(step.phase),
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>{step.description}</span>
                  {step.isPass !== undefined && i === currentStep - 1 && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        padding: '1px 8px',
                        borderRadius: 4,
                        background: step.isPass ? '#22c55e' : '#ef4444',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {step.isPass ? '通过' : '失败'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong>
        {steps.length === 0
          ? '输入测试数 n，点击「开始测试」自动播放，或「单步执行」逐步观察'
          : currentStepData
            ? currentStepData.description
            : '测试完成'}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          分解
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          模幂运算
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          二次探测
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          结论
        </span>
      </div>
    </div>
  )
}
