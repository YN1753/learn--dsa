import { useState, useEffect, useRef, useCallback } from 'react'

interface DecompositionStep {
  description: string
  nDigits: number[]
  mDigits: number[]
  currentDigit: number
  subResults: number[]
  finalResult: number | null
}

function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base = base % mod
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod
    }
    exp = Math.floor(exp / 2)
    base = (base * base) % mod
  }
  return result
}

function combSmall(n: number, m: number, p: number): number {
  if (m > n) return 0
  if (m === 0 || m === n) return 1
  let numerator = 1
  let denominator = 1
  for (let i = 0; i < m; i++) {
    numerator = (numerator * ((n - i) % p)) % p
    denominator = (denominator * ((i + 1) % p)) % p
  }
  return (numerator * modPow(denominator, p - 2, p)) % p
}

function lucas(n: number, m: number, p: number): number {
  if (m === 0) return 1
  const ni = n % p
  const mi = m % p
  return (combSmall(ni, mi, p) * lucas(Math.floor(n / p), Math.floor(m / p), p)) % p
}

function toPAdic(n: number, p: number): number[] {
  if (n === 0) return [0]
  const digits: number[] = []
  let temp = n
  while (temp > 0) {
    digits.push(temp % p)
    temp = Math.floor(temp / p)
  }
  return digits.reverse()
}

export default function LucasTheoremVisualization() {
  const [n, setN] = useState(20)
  const [m, setM] = useState(8)
  const [p, setP] = useState(3)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<DecompositionStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [description, setDescription] = useState('卢卡斯定理可视化 - 输入参数并点击「开始计算」')
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((nVal: number, mVal: number, pVal: number): DecompositionStep[] => {
    const nDigits = toPAdic(nVal, pVal)
    const mDigits = toPAdic(mVal, pVal)
    const maxLen = Math.max(nDigits.length, mDigits.length)
    const resultSteps: DecompositionStep[] = []

    // Step 1: Show p-adic decomposition
    resultSteps.push({
      description: `将 n=${nVal} 和 m=${mVal} 分解为 ${pVal} 进制`,
      nDigits,
      mDigits,
      currentDigit: -1,
      subResults: [],
      finalResult: null,
    })

    // Steps 2..maxLen+1: Calculate each digit's combination
    const subResults: number[] = []
    for (let i = 0; i < maxLen; i++) {
      const ni = nDigits[nDigits.length - 1 - i] || 0
      const mi = mDigits[mDigits.length - 1 - i] || 0
      const ci = combSmall(ni, mi, pVal)
      subResults.push(ci)
      resultSteps.push({
        description: `计算第 ${i} 位: C(${ni}, ${mi}) mod ${pVal} = ${ci}`,
        nDigits,
        mDigits,
        currentDigit: i,
        subResults: [...subResults],
        finalResult: null,
      })
    }

    // Final step
    let product = 1
    for (const s of subResults) {
      product = (product * s) % pVal
    }
    const actual = lucas(nVal, mVal, pVal)
    resultSteps.push({
      description: `合并结果: ${subResults.join(' * ')} mod ${pVal} = ${product} (验证: ${actual})`,
      nDigits,
      mDigits,
      currentDigit: -1,
      subResults,
      finalResult: product,
    })

    return resultSteps
  }, [])

  const handleStart = () => {
    if (m > n) {
      setDescription('错误: m 不能大于 n')
      return
    }
    if (p < 2) {
      setDescription('错误: p 必须大于等于 2')
      return
    }
    const newSteps = generateSteps(n, m, p)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setDescription(newSteps[0].description)
  }

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setDescription(steps[currentStep].description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

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
    setSteps([])
    setCurrentStep(0)
    setDescription('卢卡斯定理可视化 - 输入参数并点击「开始计算」')
  }

  const displayStep = currentStep > 0 ? steps[currentStep - 1] : steps[0]
  const maxLen = displayStep
    ? Math.max(displayStep.nDigits.length, displayStep.mDigits.length)
    : Math.max(toPAdic(n, p).length, toPAdic(m, p).length)

  const getDigitColor = (index: number): string => {
    if (!displayStep) return 'var(--bg-card)'
    if (displayStep.currentDigit === index) return '#3b82f6'
    if (index < displayStep.currentDigit) return '#22c55e'
    return 'var(--bg-card)'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          n:
          <input
            type="number"
            value={n}
            onChange={(e) => setN(Math.max(0, Number(e.target.value)))}
            style={{ width: '80px', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            disabled={isPlaying}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          m:
          <input
            type="number"
            value={m}
            onChange={(e) => setM(Math.max(0, Number(e.target.value)))}
            style={{ width: '80px', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            disabled={isPlaying}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          p:
          <input
            type="number"
            value={p}
            onChange={(e) => setP(Math.max(2, Number(e.target.value)))}
            style={{ width: '80px', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            disabled={isPlaying}
          />
        </label>
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始计算
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

      <div className="viz-canvas" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {/* P-adic decomposition display */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
            {p} 进制分解
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* n digits */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', minWidth: '60px', fontFamily: 'Consolas, Monaco, monospace' }}>
                n = {n} =
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(displayStep?.nDigits || toPAdic(n, p)).map((digit, i) => (
                  <div
                    key={`n-${i}`}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      border: '2px solid var(--border)',
                      background: getDigitColor((displayStep?.nDigits || toPAdic(n, p)).length - 1 - i),
                      color: 'var(--text-primary)',
                      fontWeight: 'bold',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '1.1rem',
                    }}
                  >
                    {digit}
                  </div>
                ))}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', marginLeft: '0.5rem' }}>
                ({p})
              </span>
            </div>
            {/* m digits */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', minWidth: '60px', fontFamily: 'Consolas, Monaco, monospace' }}>
                m = {m} =
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(displayStep?.mDigits || toPAdic(m, p)).map((digit, i) => (
                  <div
                    key={`m-${i}`}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      border: '2px solid var(--border)',
                      background: getDigitColor((displayStep?.mDigits || toPAdic(m, p)).length - 1 - i),
                      color: 'var(--text-primary)',
                      fontWeight: 'bold',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '1.1rem',
                    }}
                  >
                    {digit}
                  </div>
                ))}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', marginLeft: '0.5rem' }}>
                ({p})
              </span>
            </div>
          </div>
        </div>

        {/* Combination calculation per digit */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
            逐位计算组合数
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Array.from({ length: maxLen }).map((_, i) => {
              const nDigitsArr = displayStep?.nDigits || toPAdic(n, p)
              const mDigitsArr = displayStep?.mDigits || toPAdic(m, p)
              const ni = nDigitsArr[nDigitsArr.length - 1 - i] || 0
              const mi = mDigitsArr[mDigitsArr.length - 1 - i] || 0
              const ci = combSmall(ni, mi, p)
              const isActive = displayStep?.currentDigit === i
              const isDone = displayStep ? i < displayStep.currentDigit : false
              const subResult = displayStep?.subResults[i]

              return (
                <div
                  key={`comb-${i}`}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: `2px solid ${isActive ? '#3b82f6' : isDone ? '#22c55e' : 'var(--border)'}`,
                    background: isActive ? 'rgba(59, 130, 246, 0.1)' : isDone ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-card)',
                    minWidth: '120px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    位 {i}
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontFamily: 'Consolas, Monaco, monospace' }}>
                    C({ni}, {mi})
                  </div>
                  <div style={{ color: isActive ? '#3b82f6' : isDone ? '#22c55e' : 'var(--text-secondary)', fontWeight: 'bold', marginTop: '0.25rem' }}>
                    {subResult !== undefined ? `= ${subResult}` : `= ${ci}`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Final result */}
        {displayStep?.finalResult !== null && displayStep?.finalResult !== undefined && (
          <div style={{
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>最终结果</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '1.3rem', fontFamily: 'Consolas, Monaco, monospace' }}>
              C({n}, {m}) mod {p} = {displayStep.finalResult}
            </div>
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
          当前计算位
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已完成
        </span>
      </div>
    </div>
  )
}
