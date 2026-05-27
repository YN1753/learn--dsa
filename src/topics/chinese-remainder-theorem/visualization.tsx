import { useState, useEffect, useRef, useCallback } from 'react'

interface CRTStep {
  description: string
  phase: 'input' | 'compute-m' | 'compute-mi' | 'inverse' | 'construct' | 'verify' | 'done'
  values: Record<string, number | string>
  highlightIndex: number
  equations: { remainder: number; modulus: number }[]
  M: number
  Mis: number[]
  inverses: number[]
  terms: number[]
  result: number | null
}

function extendedGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0]
  const [g, x1, y1] = extendedGcd(b, a % b)
  return [g, y1, x1 - Math.floor(a / b) * y1]
}

function modInverse(a: number, m: number): number {
  const [g, x] = extendedGcd(a, m)
  if (g !== 1) return -1
  return ((x % m) + m) % m
}

export default function ChineseRemainderTheoremVisualization() {
  const [remainderInputs, setRemainderInputs] = useState<number[]>([2, 3, 2])
  const [modulusInputs, setModulusInputs] = useState<number[]>([3, 5, 7])
  const [steps, setSteps] = useState<CRTStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((rems: number[], mods: number[]): CRTStep[] => {
    const n = rems.length
    const allSteps: CRTStep[] = []
    const equations = rems.map((r, i) => ({ remainder: r, modulus: mods[i] }))

    // 初始状态
    allSteps.push({
      description: '同余方程组：找到 x 使得对所有 i，x ≡ rᵢ (mod mᵢ)',
      phase: 'input',
      values: {},
      highlightIndex: -1,
      equations,
      M: 0,
      Mis: [],
      inverses: [],
      terms: [],
      result: null,
    })

    // 计算 M
    let M = 1
    for (const m of mods) M *= m
    allSteps.push({
      description: `计算 M = m₁ × m₂ × ... × mₙ = ${mods.join(' × ')} = ${M}`,
      phase: 'compute-m',
      values: { M },
      highlightIndex: -1,
      equations,
      M,
      Mis: [],
      inverses: [],
      terms: [],
      result: null,
    })

    const Mis: number[] = []
    const inverses: number[] = []
    const terms: number[] = []

    // 计算每个 Mᵢ 和逆元
    for (let i = 0; i < n; i++) {
      const Mi = M / mods[i]
      Mis.push(Mi)

      allSteps.push({
        description: `计算 M${i + 1} = M / m${i + 1} = ${M} / ${mods[i]} = ${Mi}`,
        phase: 'compute-mi',
        values: { [`M${i + 1}`]: Mi },
        highlightIndex: i,
        equations,
        M,
        Mis: [...Mis],
        inverses: [...inverses],
        terms: [...terms],
        result: null,
      })

      const inv = modInverse(Mi, mods[i])
      inverses.push(inv)

      allSteps.push({
        description: `求 M${i + 1} 在模 m${i + 1} 下的逆元：${Mi} × t ≡ 1 (mod ${mods[i]})，t${i + 1} = ${inv}`,
        phase: 'inverse',
        values: { [`t${i + 1}`]: inv },
        highlightIndex: i,
        equations,
        M,
        Mis: [...Mis],
        inverses: [...inverses],
        terms: [...terms],
        result: null,
      })

      const term = rems[i] * Mi * inv
      terms.push(term)

      allSteps.push({
        description: `计算第 ${i + 1} 项：r${i + 1} × M${i + 1} × t${i + 1} = ${rems[i]} × ${Mi} × ${inv} = ${term}`,
        phase: 'construct',
        values: { [`term${i + 1}`]: term },
        highlightIndex: i,
        equations,
        M,
        Mis: [...Mis],
        inverses: [...inverses],
        terms: [...terms],
        result: null,
      })
    }

    // 求和并取模
    let sum = 0
    for (const t of terms) sum += t
    const result = ((sum % M) + M) % M

    allSteps.push({
      description: `求和：x = (${terms.join(' + ')}) mod ${M} = ${sum} mod ${M} = ${result}`,
      phase: 'construct',
      values: { sum, result },
      highlightIndex: -1,
      equations,
      M,
      Mis: [...Mis],
      inverses: [...inverses],
      terms: [...terms],
      result,
    })

    // 验证
    for (let i = 0; i < n; i++) {
      const mod = result % mods[i]
      allSteps.push({
        description: `验证：${result} mod ${mods[i]} = ${mod} ${mod === rems[i] ? '✓ 等于' + rems[i] : '✗ 不等于' + rems[i]}`,
        phase: 'verify',
        values: {},
        highlightIndex: i,
        equations,
        M,
        Mis: [...Mis],
        inverses: [...inverses],
        terms: [...terms],
        result,
      })
    }

    allSteps.push({
      description: `求解完成！x ≡ ${result} (mod ${M})，通解为 x = ${result} + ${M}k`,
      phase: 'done',
      values: {},
      highlightIndex: -1,
      equations,
      M,
      Mis: [...Mis],
      inverses: [...inverses],
      terms: [...terms],
      result,
    })

    return allSteps
  }, [])

  const handleSolve = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const newSteps = generateSteps(remainderInputs, modulusInputs)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [remainderInputs, modulusInputs, generateSteps])

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

  const handleStepBackward = () => {
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

  const handleAddEquation = () => {
    setRemainderInputs([...remainderInputs, 0])
    setModulusInputs([...modulusInputs, 1])
  }

  const handleRemoveEquation = () => {
    if (remainderInputs.length > 2) {
      setRemainderInputs(remainderInputs.slice(0, -1))
      setModulusInputs(modulusInputs.slice(0, -1))
    }
  }

  const updateRemainder = (index: number, value: string) => {
    const num = parseInt(value) || 0
    const newInputs = [...remainderInputs]
    newInputs[index] = num
    setRemainderInputs(newInputs)
  }

  const updateModulus = (index: number, value: string) => {
    const num = parseInt(value) || 1
    const newInputs = [...modulusInputs]
    newInputs[index] = num
    setModulusInputs(newInputs)
  }

  const step = steps.length > 0 ? steps[Math.min(currentStep, steps.length - 1)] : null

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {remainderInputs.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-card)', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>x ≡</span>
              <input
                type="number"
                value={r}
                onChange={(e) => updateRemainder(i, e.target.value)}
                style={{ width: '48px', padding: '0.2rem', textAlign: 'center', background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }}
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(mod</span>
              <input
                type="number"
                value={modulusInputs[i]}
                onChange={(e) => updateModulus(i, e.target.value)}
                min="2"
                style={{ width: '48px', padding: '0.2rem', textAlign: 'center', background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.85rem' }}
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>)</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <button className="btn btn-primary" onClick={handleSolve}>
            求解
          </button>
          <button className="btn btn-secondary" onClick={handleAddEquation}>
            + 方程
          </button>
          <button className="btn btn-secondary" onClick={handleRemoveEquation} disabled={remainderInputs.length <= 2}>
            - 方程
          </button>
          <button className="btn btn-secondary" onClick={handleStepBackward} disabled={steps.length === 0 || currentStep <= 0}>
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
              max="3000"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span>{speed}ms</span>
          </label>
        </div>
      </div>

      <div className="viz-canvas">
        {step ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 方程组展示 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
              {step.equations.map((eq, i) => {
                const isActive = step.highlightIndex === i
                return (
                  <div
                    key={i}
                    style={{
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      border: `2px solid ${isActive ? '#3b82f6' : 'var(--border)'}`,
                      background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    x ≡ {eq.remainder} (mod {eq.modulus})
                  </div>
                )
              })}
            </div>

            {/* 中间计算结果 */}
            {(step.phase === 'compute-m' || step.phase === 'compute-mi' || step.phase === 'inverse' || step.phase === 'construct') && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                {step.M > 0 && (
                  <div style={{ padding: '0.5rem 0.8rem', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    M = {step.M}
                  </div>
                )}
                {step.Mis.map((Mi, i) => (
                  <div
                    key={`Mi-${i}`}
                    style={{
                      padding: '0.5rem 0.8rem',
                      borderRadius: '6px',
                      background: step.highlightIndex === i ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 100, 100, 0.1)',
                      border: `1px solid ${step.highlightIndex === i ? 'rgba(34, 197, 94, 0.3)' : 'var(--border)'}`,
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    M{i + 1} = {Mi}
                    {step.inverses[i] !== undefined && (
                      <span style={{ marginLeft: '0.75rem', color: '#f59e0b' }}>
                        t{i + 1} = {step.inverses[i]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 构造解 */}
            {step.terms.length > 0 && step.phase !== 'verify' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {step.terms.map((term, i) => (
                  <div
                    key={`term-${i}`}
                    style={{
                      padding: '0.4rem 0.7rem',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {step.equations[i].remainder} × {step.Mis[i]} × {step.inverses[i]} = {term}
                    {i < step.terms.length - 1 && <span style={{ marginLeft: '0.3rem' }}>+</span>}
                  </div>
                ))}
              </div>
            )}

            {/* 结果 */}
            {step.result !== null && step.phase !== 'verify' && (
              <div style={{ textAlign: 'center', padding: '0.8rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', border: '2px solid rgba(34, 197, 94, 0.4)', fontFamily: 'Consolas, Monaco, monospace', fontSize: '1.2rem', fontWeight: 'bold', color: '#22c55e' }}>
                x = {step.result} (mod {step.M})
              </div>
            )}

            {/* 验证 */}
            {step.phase === 'verify' && step.result !== null && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {step.equations.map((eq, i) => {
                  const mod = step.result! % eq.modulus
                  const ok = mod === eq.remainder
                  return (
                    <div
                      key={`v-${i}`}
                      style={{
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        background: step.highlightIndex === i
                          ? (ok ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)')
                          : 'rgba(100, 100, 100, 0.05)',
                        border: `1px solid ${step.highlightIndex === i ? (ok ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)') : 'var(--border)'}`,
                        fontFamily: 'Consolas, Monaco, monospace',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {step.result} mod {eq.modulus} = {mod} {ok ? '✓' : '✗'}
                    </div>
                  )
                })}
              </div>
            )}

            {/* 完成 */}
            {step.phase === 'done' && (
              <div style={{ textAlign: 'center', padding: '1rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', border: '2px solid rgba(34, 197, 94, 0.3)' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '0.5rem' }}>
                  求解完成！
                </div>
                <div style={{ fontFamily: 'Consolas, Monaco, monospace', color: 'var(--text-primary)' }}>
                  x ≡ {step.result} (mod {step.M})，通解：x = {step.result} + {step.M}k
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>中国剩余定理 (CRT)</div>
            <div style={{ fontSize: '0.9rem' }}>输入同余方程组，点击「求解」查看逐步构造过程</div>
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>当前步骤：</strong> {step ? step.description : '等待求解...'}
        {steps.length > 0 && (
          <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
            [{currentStep + 1} / {steps.length}]
          </span>
        )}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前方程
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          Mᵢ / 逆元
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          构造项
        </span>
      </div>
    </div>
  )
}
