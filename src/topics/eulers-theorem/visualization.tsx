import { useState, useEffect, useRef, useCallback } from 'react'

interface PowerStep {
  description: string
  exponent: number
  value: number
  modResult: number
  isHighlight: boolean
}

export default function EulersTheoremVisualization() {
  const [mode, setMode] = useState<'cycle' | 'reduce' | 'compare'>('cycle')
  const [a, setA] = useState(2)
  const [n, setN] = useState(7)
  const [bigExp, setBigExp] = useState(100)
  const [steps, setSteps] = useState<PowerStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(400)
  const timerRef = useRef<number | null>(null)

  const gcd = (x: number, y: number): number => {
    while (y !== 0) {
      const t = y
      y = x % y
      x = t
    }
    return x
  }

  const eulerPhi = (m: number): number => {
    let result = m
    let temp = m
    for (let p = 2; p * p <= temp; p++) {
      if (temp % p === 0) {
        while (temp % p === 0) temp /= p
        result -= result / p
      }
    }
    if (temp > 1) result -= result / temp
    return Math.floor(result)
  }

  const modPow = (base: number, exp: number, mod: number): number => {
    let result = 1
    base = base % mod
    while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % mod
      exp = Math.floor(exp / 2)
      base = (base * base) % mod
    }
    return result
  }

  const generateCycleSteps = useCallback((base: number, mod: number): PowerStep[] => {
    const phiN = eulerPhi(mod)
    const maxExp = phiN * 2
    const result: PowerStep[] = []

    for (let k = 1; k <= maxExp; k++) {
      const val = modPow(base, k, mod)
      result.push({
        description: k === phiN
          ? `${base}^${k} = ${base}^φ(${mod}) ≡ ${val} (mod ${mod}) — 到达 φ(${mod})，回到 1！`
          : k === phiN * 2
            ? `${base}^${k} = ${base}^(2·φ(${mod})) ≡ ${val} (mod ${mod}) — 完成一个完整周期`
            : `${base}^${k} ≡ ${val} (mod ${mod})`,
        exponent: k,
        value: Math.pow(base, Math.min(k, 20)),
        modResult: val,
        isHighlight: k === phiN || k === phiN * 2,
      })
    }
    return result
  }, [])

  const generateReduceSteps = useCallback((base: number, exp: number, mod: number): PowerStep[] => {
    const phiN = eulerPhi(mod)
    const reduced = exp % phiN
    const result: PowerStep[] = []

    result.push({
      description: `计算 ${base}^${exp} mod ${mod}`,
      exponent: 0,
      value: 0,
      modResult: 0,
      isHighlight: false,
    })
    result.push({
      description: `φ(${mod}) = ${phiN}，与 ${mod} 互质的数的个数`,
      exponent: 0,
      value: 0,
      modResult: 0,
      isHighlight: false,
    })
    result.push({
      description: `降幂：${exp} mod ${phiN} = ${reduced}`,
      exponent: reduced,
      value: 0,
      modResult: 0,
      isHighlight: true,
    })

    if (gcd(base, mod) !== 1) {
      result.push({
        description: `注意：gcd(${base}, ${mod}) = ${gcd(base, mod)} ≠ 1，需使用扩展欧拉定理`,
        exponent: 0,
        value: 0,
        modResult: 0,
        isHighlight: false,
      })
      const extExp = reduced + phiN
      const extResult = modPow(base, extExp, mod)
      result.push({
        description: `扩展公式：${base}^(${reduced} + ${phiN}) = ${base}^${extExp} ≡ ${extResult} (mod ${mod})`,
        exponent: extExp,
        value: 0,
        modResult: extResult,
        isHighlight: true,
      })
    } else {
      const finalResult = modPow(base, reduced, mod)
      result.push({
        description: `${base}^${exp} ≡ ${base}^${reduced} ≡ ${finalResult} (mod ${mod})`,
        exponent: reduced,
        value: 0,
        modResult: finalResult,
        isHighlight: true,
      })
    }

    return result
  }, [])

  const generateCompareSteps = useCallback((base: number, mod: number): PowerStep[] => {
    const phiN = eulerPhi(mod)
    const result: PowerStep[] = []

    result.push({
      description: `比较缩系中每个元素乘以 ${base} 后模 ${mod} 的结果`,
      exponent: 0,
      value: 0,
      modResult: 0,
      isHighlight: false,
    })

    const reduced: number[] = []
    for (let i = 1; i < mod; i++) {
      if (gcd(i, mod) === 1) reduced.push(i)
    }

    result.push({
      description: `与 ${mod} 互质的数（缩系）：{${reduced.join(', ')}}，共 ${reduced.length} = φ(${mod}) = ${phiN} 个`,
      exponent: 0,
      value: 0,
      modResult: 0,
      isHighlight: false,
    })

    const mapped = reduced.map(r => (base * r) % mod)
    result.push({
      description: `每个元素乘以 ${base} mod ${mod}：{${mapped.join(', ')}}`,
      exponent: 0,
      value: 0,
      modResult: 0,
      isHighlight: true,
    })

    const sorted = [...mapped].sort((x, y) => x - y)
    const isPermutation = sorted.length === reduced.length && sorted.every((v, i) => v === reduced[i])
    result.push({
      description: isPermutation
        ? `排序后：{${sorted.join(', ')}} — 恰好是缩系的一个排列！证明了 a^φ(n) ≡ 1`
        : `排序后：{${sorted.join(', ')}} — 结果集合`,
      exponent: 0,
      value: 0,
      modResult: 0,
      isHighlight: isPermutation,
    })

    return result
  }, [])

  useEffect(() => {
    let newSteps: PowerStep[]
    if (mode === 'cycle') {
      newSteps = generateCycleSteps(a, n)
    } else if (mode === 'reduce') {
      newSteps = generateReduceSteps(a, bigExp, n)
    } else {
      newSteps = generateCompareSteps(a, n)
    }
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [mode, a, n, bigExp, generateCycleSteps, generateReduceSteps, generateCompareSteps])

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

  const handlePlay = () => {
    if (currentStep >= steps.length) setCurrentStep(0)
    setIsPlaying(true)
  }

  const handlePause = () => setIsPlaying(false)

  const handleStep = () => {
    setIsPlaying(false)
    if (currentStep < steps.length) setCurrentStep(prev => prev + 1)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const phiN = eulerPhi(n)
  const isCoprime = gcd(a, n) === 1

  const getBarColor = (k: number, modResult: number): string => {
    if (k === phiN) return '#22c55e'
    if (k === phiN * 2) return '#a855f7'
    if (modResult === 1) return '#3b82f6'
    return '#475569'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={mode === 'cycle' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setMode('cycle')}
          >
            幂循环
          </button>
          <button
            className={mode === 'reduce' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setMode('reduce')}
          >
            降幂演示
          </button>
          <button
            className={mode === 'compare' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setMode('compare')}
          >
            缩系映射
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying || steps.length === 0}>
            播放
          </button>
          <button className="btn btn-primary" onClick={handlePause} disabled={!isPlaying}>
            暂停
          </button>
          <button className="btn btn-primary" onClick={handleStep} disabled={currentStep >= steps.length}>
            单步
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            重置
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            a =
            <select
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            n =
            <select
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
          {mode === 'reduce' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              b =
              <select
                value={bigExp}
                onChange={(e) => setBigExp(Number(e.target.value))}
                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              >
                {[10, 20, 50, 100, 200, 500, 1000].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            速度:
            <input
              type="range"
              min="100"
              max="1500"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span>{speed}ms</span>
          </label>
        </div>
      </div>

      <div className="viz-canvas" style={{ padding: '1rem' }}>
        <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>gcd({a}, {n}) = {gcd(a, n)}</span>
          <span>φ({n}) = {phiN}</span>
          <span style={{ color: isCoprime ? '#22c55e' : '#ef4444' }}>
            {isCoprime ? '互质 — 可使用欧拉定理' : '不互质 — 需使用扩展欧拉定理'}
          </span>
        </div>

        {mode === 'cycle' && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '2px',
              height: '200px',
              overflowX: 'auto',
              padding: '0.5rem 0',
            }}>
              {steps.slice(0, currentStep).map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                    minWidth: '28px',
                  }}
                >
                  <div style={{
                    fontSize: '0.65rem',
                    color: step.isHighlight ? '#22c55e' : 'var(--text-secondary)',
                    marginBottom: '2px',
                    fontWeight: step.isHighlight ? 'bold' : 'normal',
                  }}>
                    {step.modResult}
                  </div>
                  <div style={{
                    width: '20px',
                    height: `${(step.modResult / n) * 160 + 20}px`,
                    background: getBarColor(step.exponent, step.modResult),
                    borderRadius: '3px 3px 0 0',
                    transition: 'all 0.3s ease',
                    border: step.exponent === phiN ? '2px solid #4ade80' : 'none',
                  }} />
                  <div style={{
                    fontSize: '0.6rem',
                    color: step.isHighlight ? '#22c55e' : 'var(--text-secondary)',
                    marginTop: '2px',
                    transform: 'rotate(-45deg)',
                    whiteSpace: 'nowrap',
                  }}>
                    {step.exponent}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: '0.85rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2 }} />
                k = φ({n}) = {phiN}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#a855f7', borderRadius: 2 }} />
                k = 2φ({n}) = {phiN * 2}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2 }} />
                mod 结果 = 1
              </span>
            </div>
          </div>
        )}

        {mode === 'reduce' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {steps.slice(0, currentStep).map((step, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: step.isHighlight ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-card)',
                  border: `1px solid ${step.isHighlight ? '#22c55e' : 'var(--border)'}`,
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                }}
              >
                {step.description}
              </div>
            ))}
          </div>
        )}

        {mode === 'compare' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {steps.slice(0, currentStep).map((step, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: step.isHighlight ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                  border: `1px solid ${step.isHighlight ? '#3b82f6' : 'var(--border)'}`,
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                }}
              >
                {step.description}
              </div>
            ))}

            {currentStep > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(phiN * 2, 12)}, 1fr)`,
                  gap: '4px',
                }}>
                  {Array.from({ length: phiN * 2 }, (_, i) => {
                    const k = i + 1
                    const val = modPow(a, k, n)
                    return (
                      <div
                        key={k}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '4px',
                          borderRadius: '4px',
                          background: k === phiN ? '#166534' : val === 1 ? '#1e3a5f' : 'var(--bg-card)',
                          border: `1px solid ${k === phiN ? '#22c55e' : 'var(--border)'}`,
                          fontSize: '0.7rem',
                          color: k === phiN ? '#fff' : 'var(--text-secondary)',
                        }}
                      >
                        <span>{a}^{k}</span>
                        <span style={{ fontWeight: 'bold', color: k === phiN ? '#fff' : 'var(--text-primary)' }}>
                          {val}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong>{' '}
        {currentStep > 0 && currentStep <= steps.length
          ? steps[Math.min(currentStep - 1, steps.length - 1)].description
          : mode === 'cycle'
            ? `观察 ${a}^k mod ${n} 的值随 k 变化的周期性，周期为 φ(${n}) = ${phiN} 的因子`
            : mode === 'reduce'
              ? `演示如何利用欧拉定理将 ${a}^b 的大指数 b 降幂`
              : `观察缩系中每个元素乘以 ${a} 后的映射关系`
        }
      </div>

      {steps.length > 0 && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>进度：</strong> 第 {currentStep} / {steps.length} 步
        </div>
      )}
    </div>
  )
}
