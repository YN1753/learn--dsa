import { useState, useEffect, useRef, useCallback } from 'react'

interface SieveStep {
  description: string
  currentI: number
  currentP: number | null
  isComposite: boolean[]
  phi: number[]
  primes: number[]
  action: 'init' | 'new-prime' | 'mark-composite' | 'compute-phi' | 'done'
  resultIndex: number
}

export default function EulerTotientVisualization() {
  const [maxN, setMaxN] = useState(24)
  const [steps, setSteps] = useState<SieveStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [mode, setMode] = useState<'sieve' | 'coprime'>('sieve')
  const [coprimeN, setCoprimeN] = useState(12)
  const timerRef = useRef<number | null>(null)

  const gcd = (a: number, b: number): number => {
    while (b !== 0) {
      const t = b
      b = a % b
      a = t
    }
    return a
  }

  const generateSieveSteps = useCallback((n: number): SieveStep[] => {
    const result: SieveStep[] = []
    const phi: number[] = new Array(n + 1).fill(0)
    const primes: number[] = []
    const isComposite = new Array(n + 1).fill(false)

    phi[1] = 1
    result.push({
      description: '初始化：φ(1) = 1',
      currentI: 1,
      currentP: null,
      isComposite: [...isComposite],
      phi: [...phi],
      primes: [...primes],
      action: 'init',
      resultIndex: 1,
    })

    for (let i = 2; i <= n; i++) {
      if (!isComposite[i]) {
        primes.push(i)
        phi[i] = i - 1
        result.push({
          description: `i = ${i} 是素数，φ(${i}) = ${i} - 1 = ${i - 1}`,
          currentI: i,
          currentP: null,
          isComposite: [...isComposite],
          phi: [...phi],
          primes: [...primes],
          action: 'new-prime',
          resultIndex: i,
        })
      }

      for (let j = 0; j < primes.length; j++) {
        const p = primes[j]
        if (i * p > n) break

        isComposite[i * p] = true

        if (i % p === 0) {
          phi[i * p] = phi[i] * p
          result.push({
            description: `i = ${i}, p = ${p}：${p} | ${i}，所以 φ(${i * p}) = φ(${i}) × ${p} = ${phi[i]} × ${p} = ${phi[i * p]}`,
            currentI: i,
            currentP: p,
            isComposite: [...isComposite],
            phi: [...phi],
            primes: [...primes],
            action: 'compute-phi',
            resultIndex: i * p,
          })
          break
        } else {
          phi[i * p] = phi[i] * phi[p]
          result.push({
            description: `i = ${i}, p = ${p}：gcd(${i},${p}) = 1，φ(${i * p}) = φ(${i}) × φ(${p}) = ${phi[i]} × ${phi[p]} = ${phi[i * p]}`,
            currentI: i,
            currentP: p,
            isComposite: [...isComposite],
            phi: [...phi],
            primes: [...primes],
            action: 'mark-composite',
            resultIndex: i * p,
          })
        }
      }
    }

    result.push({
      description: '筛选完成！所有 φ 值已计算。',
      currentI: n,
      currentP: null,
      isComposite: [...isComposite],
      phi: [...phi],
      primes: [...primes],
      action: 'done',
      resultIndex: -1,
    })

    return result
  }, [])

  useEffect(() => {
    const newSteps = generateSieveSteps(maxN)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [maxN, generateSieveSteps])

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
    if (currentStep >= steps.length) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStep = () => {
    setIsPlaying(false)
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const step = steps.length > 0 ? steps[Math.min(currentStep, steps.length - 1)] : null
  const displayPhi = step ? step.phi : new Array(maxN + 1).fill(0)
  const displayComposite = step ? step.isComposite : new Array(maxN + 1).fill(false)
  const displayPrimes = step ? step.primes : []
  const highlightIndex = step ? step.resultIndex : -1
  const currentI = step ? step.currentI : -1
  const currentP = step ? step.currentP : null

  const getCellColor = (idx: number): string => {
    if (idx === highlightIndex) return '#22c55e'
    if (idx === currentI) return '#3b82f6'
    if (currentP !== null && idx === currentP) return '#f59e0b'
    if (displayComposite[idx]) return 'var(--bg-card)'
    if (displayPhi[idx] > 0) return '#1e3a5f'
    return 'var(--bg-card)'
  }

  const getCellBorder = (idx: number): string => {
    if (idx === highlightIndex) return '#4ade80'
    if (idx === currentI) return '#60a5fa'
    if (currentP !== null && idx === currentP) return '#fbbf24'
    return 'var(--border)'
  }

  const getCoprimeCells = (n: number): { value: number; coprime: boolean }[] => {
    const cells: { value: number; coprime: boolean }[] = []
    for (let i = 1; i <= n; i++) {
      cells.push({ value: i, coprime: gcd(i, n) === 1 })
    }
    return cells
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={mode === 'sieve' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setMode('sieve')}
          >
            筛法演示
          </button>
          <button
            className={mode === 'coprime' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setMode('coprime')}
          >
            互质关系
          </button>
        </div>

        {mode === 'sieve' && (
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
              范围:
              <select
                value={maxN}
                onChange={(e) => setMaxN(Number(e.target.value))}
                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              >
                <option value={12}>1-12</option>
                <option value={18}>1-18</option>
                <option value={24}>1-24</option>
                <option value={36}>1-36</option>
                <option value={48}>1-48</option>
              </select>
            </label>
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
        )}

        {mode === 'coprime' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              n =
              <select
                value={coprimeN}
                onChange={(e) => setCoprimeN(Number(e.target.value))}
                style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto', padding: '1rem' }}>
        {mode === 'sieve' && step && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(maxN, 12)}, 1fr)`,
              gap: '4px',
              marginBottom: '1rem',
            }}>
              {Array.from({ length: maxN }, (_, i) => i + 1).map(idx => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '6px 4px',
                    borderRadius: '6px',
                    background: getCellColor(idx),
                    border: `2px solid ${getCellBorder(idx)}`,
                    transition: 'all 0.3s ease',
                    minWidth: '50px',
                  }}
                >
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: idx === highlightIndex || idx === currentI ? '#fff' : 'var(--text-primary)',
                  }}>
                    {idx}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: idx === highlightIndex || idx === currentI ? '#fff' : 'var(--text-secondary)',
                    fontFamily: 'Consolas, Monaco, monospace',
                  }}>
                    φ={displayPhi[idx]}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2 }} />
                当前 i
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2 }} />
                当前素数 p
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2 }} />
                刚计算的 φ
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, background: '#1e3a5f', borderRadius: 2 }} />
                已计算 φ
              </span>
            </div>

            {displayPrimes.length > 0 && (
              <div style={{ marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <strong>已发现素数：</strong> {displayPrimes.join(', ')}
              </div>
            )}
          </div>
        )}

        {mode === 'coprime' && (
          <div>
            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              与 <strong style={{ color: 'var(--text-primary)' }}>{coprimeN}</strong> 互质的数（gcd = 1）用绿色标记
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(coprimeN, 12)}, 1fr)`,
              gap: '4px',
            }}>
              {getCoprimeCells(coprimeN).map(({ value, coprime }) => (
                <div
                  key={value}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 8px',
                    borderRadius: '6px',
                    background: coprime ? '#166534' : '#7f1d1d',
                    border: `2px solid ${coprime ? '#22c55e' : '#ef4444'}`,
                    minWidth: '50px',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: '#fff',
                  }}>
                    {value}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: coprime ? '#86efac' : '#fca5a5',
                    fontFamily: 'Consolas, Monaco, monospace',
                  }}>
                    gcd={gcd(value, coprimeN)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2 }} />
                  互质
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2 }} />
                  不互质
                </span>
              </div>
              <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <strong>φ({coprimeN}) = {getCoprimeCells(coprimeN).filter(c => c.coprime).length}</strong>
                <span style={{ marginLeft: '0.5rem' }}>
                  互质数：{'{'}{getCoprimeCells(coprimeN).filter(c => c.coprime).map(c => c.value).join(', ')}{'}'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong>{' '}
        {mode === 'sieve'
          ? (step ? step.description : '选择范围后点击播放或单步执行')
          : `选择一个数 n，查看 1 到 ${coprimeN} 中哪些数与 ${coprimeN} 互质`
        }
      </div>

      {mode === 'sieve' && step && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>进度：</strong> 第 {currentStep + 1} / {steps.length} 步
          {step.action === 'new-prime' && ' — 发现新素数！'}
          {step.action === 'compute-phi' && ' — 利用 p | i 计算 φ'}
          {step.action === 'mark-composite' && ' — 利用积性函数计算 φ'}
          {step.action === 'done' && ' — 筛选完成！'}
        </div>
      )}
    </div>
  )
}
