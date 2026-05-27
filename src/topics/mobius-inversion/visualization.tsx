import { useState, useCallback } from 'react'

function mobius(n: number): number {
  let result = 1
  let temp = n
  for (let p = 2; p * p <= temp; p++) {
    if (temp % p === 0) {
      temp /= p
      if (temp % p === 0) return 0
      result = -result
    }
  }
  if (temp > 1) result = -result
  return result
}

function getFactors(n: number): number[] {
  const factors: number[] = []
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      factors.push(d)
      if (d !== n / d) factors.push(n / d)
    }
  }
  factors.sort((a, b) => a - b)
  return factors
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

interface StepInfo {
  description: string
  highlightN: number | null
  highlightD: number | null
  muValues: Map<number, number>
  inversionResult: number | null
}

export default function MobiusInversionVisualization() {
  const [mode, setMode] = useState<'mu-table' | 'inversion' | 'gcd-count'>('mu-table')
  const [tableSize, setTableSize] = useState(20)
  const [inversionN, setInversionN] = useState(6)
  const [gcdN, setGcdN] = useState(6)
  const [gcdM, setGcdM] = useState(6)
  const [steps, setSteps] = useState<StepInfo[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('莫比乌斯反演可视化 - 选择模式开始探索')

  const renderMuTable = useCallback(() => {
    const cells = []
    for (let i = 1; i <= tableSize; i++) {
      const mu = mobius(i)
      const bgColor = mu === 1 ? '#22c55e' : mu === -1 ? '#ef4444' : '#6b7280'
      const factors = getFactors(i)
      const isHighlighted = steps.length > 0 && currentStep < steps.length && steps[currentStep].highlightN === i
      cells.push(
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 6,
            background: isHighlighted ? '#3b82f6' : bgColor + '22',
            border: isHighlighted ? '2px solid #3b82f6' : `2px solid ${bgColor}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title={`n=${i}, μ=${mu}, 因子: [${factors.join(',')}]`}
          onMouseEnter={() => setDescription(`n=${i}: μ(${i})=${mu}, 因子: [${factors.join(', ')}]`)}
        >
          <span style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--text-primary)' }}>{i}</span>
          <span style={{ fontSize: 12, fontWeight: 'bold', color: bgColor }}>{mu}</span>
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {cells}
      </div>
    )
  }, [tableSize, steps, currentStep])

  const renderInversion = useCallback(() => {
    const n = inversionN
    const factors = getFactors(n)
    const rows = []

    for (const d of factors) {
      const muD = mobius(d)
      const nOverD = n / d
      const term = muD * nOverD
      const isHighlighted = steps.length > 0 && currentStep < steps.length && steps[currentStep].highlightD === d

      rows.push(
        <div
          key={d}
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 80px 80px 80px 80px',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 6,
            background: isHighlighted ? 'rgba(59,130,246,0.15)' : 'transparent',
            border: isHighlighted ? '1px solid #3b82f6' : '1px solid transparent',
            alignItems: 'center',
          }}
        >
          <span style={{ fontFamily: 'Consolas, Monaco, monospace', fontWeight: 'bold', color: 'var(--text-primary)' }}>d={d}</span>
          <span style={{ fontFamily: 'Consolas, Monaco, monospace', color: muD > 0 ? '#22c55e' : muD < 0 ? '#ef4444' : '#6b7280' }}>μ({d})={muD}</span>
          <span style={{ fontFamily: 'Consolas, Monaco, monospace', color: 'var(--text-primary)' }}>n/d={nOverD}</span>
          <span style={{ fontFamily: 'Consolas, Monaco, monospace', color: 'var(--text-primary)' }}>g({nOverD})={nOverD}</span>
          <span style={{ fontFamily: 'Consolas, Monaco, monospace', color: 'var(--accent)', fontWeight: 'bold' }}>贡献={term}</span>
        </div>
      )
    }

    const total = factors.reduce((sum, d) => sum + mobius(d) * (n / d), 0)

    return (
      <div>
        <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
            反演公式: g(n) = Σ μ(d) · f(n/d)
          </div>
          <div style={{ fontSize: 16, fontWeight: 'bold', fontFamily: 'Consolas, Monaco, monospace', color: 'var(--text-primary)' }}>
            计算 g({n})，n 的因子: [{factors.join(', ')}]
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 80px 80px 80px', gap: 8, padding: '6px 10px', fontWeight: 'bold', fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>d</span><span>μ(d)</span><span>n/d</span><span>g(n/d)</span><span>贡献</span>
        </div>
        {rows}
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <span style={{ fontSize: 16, fontWeight: 'bold', color: '#22c55e', fontFamily: 'Consolas, Monaco, monospace' }}>
            g({n}) = {factors.map(d => `${mobius(d)}·${n/d}`).join(' + ')} = {total}
          </span>
        </div>
      </div>
    )
  }, [inversionN, steps, currentStep])

  const renderGcdCount = useCallback(() => {
    const grid = []
    let count = 0
    for (let i = 1; i <= gcdN; i++) {
      const row = []
      for (let j = 1; j <= gcdM; j++) {
        const g = gcd(i, j)
        const isCoprime = g === 1
        if (isCoprime) count++
        const isHighlighted = steps.length > 0 && currentStep < steps.length &&
          steps[currentStep].highlightN === i && steps[currentStep].highlightD === j
        row.push(
          <div
            key={`${i}-${j}`}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'Consolas, Monaco, monospace',
              fontWeight: 'bold',
              background: isHighlighted ? '#3b82f6' : isCoprime ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)',
              border: isHighlighted ? '2px solid #3b82f6' : isCoprime ? '1px solid #22c55e' : '1px solid rgba(239,68,68,0.3)',
              color: isHighlighted ? '#fff' : isCoprime ? '#22c55e' : '#ef4444',
            }}
            title={`gcd(${i},${j})=${g}`}
          >
            {g}
          </div>
        )
      }
      grid.push(
        <div key={i} style={{ display: 'flex', gap: 3 }}>
          {row}
        </div>
      )
    }

    // 莫比乌斯反演计算
    const muMax = Math.max(gcdN, gcdM)
    const mu = new Array(muMax + 1).fill(0)
    mu[1] = 1
    const primes: number[] = []
    const isComposite = new Array(muMax + 1).fill(false)
    for (let i = 2; i <= muMax; i++) {
      if (!isComposite[i]) { primes.push(i); mu[i] = -1 }
      for (const p of primes) {
        if (i * p > muMax) break
        isComposite[i * p] = true
        if (i % p === 0) { mu[i * p] = 0; break }
        else mu[i * p] = -mu[i]
      }
    }

    let inversionResult = 0
    const inversionTerms: string[] = []
    for (let d = 1; d <= Math.min(gcdN, gcdM); d++) {
      if (mu[d] === 0) continue
      const term = mu[d] * Math.floor(gcdN / d) * Math.floor(gcdM / d)
      inversionResult += term
      inversionTerms.push(`μ(${d})·${Math.floor(gcdN/d)}·${Math.floor(gcdM/d)}=${term}`)
    }

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
            <div style={{ width: 36 }} />
            {Array.from({ length: gcdM }, (_, j) => (
              <div key={j} style={{ width: 36, textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                j={j + 1}
              </div>
            ))}
          </div>
          {grid.map((row, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <div style={{ width: 36, textAlign: 'right', paddingRight: 4, fontSize: 12, fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                i={idx + 1}
              </div>
              {row}
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', fontSize: 14 }}>
          <div style={{ marginBottom: 4, color: 'var(--text-secondary)' }}>
            互质对 (绿色, gcd=1): {count} 对
          </div>
          <div style={{ fontFamily: 'Consolas, Monaco, monospace', color: 'var(--text-primary)', fontSize: 13 }}>
            莫比乌斯反演: {inversionTerms.join(' + ')} = {inversionResult}
          </div>
        </div>
      </div>
    )
  }, [gcdN, gcdM, steps, currentStep])

  const handlePlaySteps = useCallback(() => {
    if (mode === 'mu-table') {
      const newSteps: StepInfo[] = [{ description: '莫比乌斯函数值表: 绿色=1, 红色=-1, 灰色=0', highlightN: null, highlightD: null, muValues: new Map(), inversionResult: null }]
      for (let i = 1; i <= Math.min(tableSize, 12); i++) {
        newSteps.push({
          description: `μ(${i}) = ${mobius(i)}  (${i} 的因子: [${getFactors(i).join(', ')}])`,
          highlightN: i, highlightD: null, muValues: new Map(), inversionResult: null
        })
      }
      setSteps(newSteps)
      setCurrentStep(0)
      setIsPlaying(true)
    } else if (mode === 'inversion') {
      const factors = getFactors(inversionN)
      const newSteps: StepInfo[] = [{ description: `计算 g(${inversionN}) = Σ μ(d) · f(${inversionN}/d)`, highlightN: null, highlightD: null, muValues: new Map(), inversionResult: null }]
      for (const d of factors) {
        newSteps.push({
          description: `d=${d}: μ(${d})=${mobius(d)}, f(${inversionN}/${d})=f(${inversionN/d}), 贡献=${mobius(d) * (inversionN / d)}`,
          highlightN: null, highlightD: d, muValues: new Map(), inversionResult: null
        })
      }
      setSteps(newSteps)
      setCurrentStep(0)
      setIsPlaying(true)
    }
  }, [mode, tableSize, inversionN])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1
      setCurrentStep(next)
      setDescription(steps[next].description)
    }
  }

  const handleStepBack = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1
      setCurrentStep(prev)
      setDescription(steps[prev].description)
    }
  }

  const handleReset = () => {
    setSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
    setDescription('已重置')
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className={`btn ${mode === 'mu-table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setMode('mu-table'); handleReset() }}>
          μ 值表格
        </button>
        <button className={`btn ${mode === 'inversion' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setMode('inversion'); handleReset() }}>
          反演演示
        </button>
        <button className={`btn ${mode === 'gcd-count' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setMode('gcd-count'); handleReset() }}>
          互质对计数
        </button>
      </div>

      {mode === 'mu-table' && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            范围:
            <input type="range" min={5} max={50} value={tableSize} onChange={e => setTableSize(Number(e.target.value))} />
            <span>{tableSize}</span>
          </label>
        </div>
      )}

      {mode === 'inversion' && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            n 值:
            <input type="range" min={2} max={20} value={inversionN} onChange={e => setInversionN(Number(e.target.value))} />
            <span>{inversionN}</span>
          </label>
        </div>
      )}

      {mode === 'gcd-count' && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            n:
            <input type="range" min={2} max={12} value={gcdN} onChange={e => setGcdN(Number(e.target.value))} />
            <span>{gcdN}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            m:
            <input type="range" min={2} max={12} value={gcdM} onChange={e => setGcdM(Number(e.target.value))} />
            <span>{gcdM}</span>
          </label>
        </div>
      )}

      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePlaySteps} disabled={isPlaying || mode === 'gcd-count'}>
          播放步骤
        </button>
        <button className="btn btn-secondary" onClick={handleStepBack} disabled={currentStep === 0}>
          上一步
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input type="range" min={200} max={2000} value={speed} onChange={e => setSpeed(Number(e.target.value))} />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ padding: 16 }}>
        {mode === 'mu-table' && renderMuTable()}
        {mode === 'inversion' && renderInversion()}
        {mode === 'gcd-count' && renderGcdCount()}
      </div>

      <div className="viz-info">
        <strong>说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          μ = 1
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          μ = -1
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#6b7280', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          μ = 0 (有平方因子)
        </span>
      </div>
    </div>
  )
}
