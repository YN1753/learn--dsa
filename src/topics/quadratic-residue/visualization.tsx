import { useState, useEffect, useRef, useCallback } from 'react'

interface StepState {
  description: string
  cells: { value: number; isQR: boolean; highlight: boolean; isTarget: boolean }[]
  computation: string
}

export default function QuadraticResidueVisualization() {
  const [prime, setPrime] = useState(7)
  const [targetA, setTargetA] = useState(2)
  const [mode, setMode] = useState<'table' | 'euler' | 'cipolla'>('table')
  const [steps, setSteps] = useState<StepState[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('二次剩余可视化 - 选择模式和参数开始')
  const [computation, setComputation] = useState('')
  const timerRef = useRef<number | null>(null)

  const modPow = useCallback((base: bigint, exp: bigint, mod: bigint): bigint => {
    let result = 1n
    base = ((base % mod) + mod) % mod
    while (exp > 0n) {
      if (exp % 2n === 1n) result = (result * base) % mod
      exp = exp / 2n
      base = (base * base) % mod
    }
    return result
  }, [])

  const legendreSymbol = useCallback((a: number, p: number): number => {
    const aMod = ((a % p) + p) % p
    if (aMod === 0) return 0
    const result = modPow(BigInt(aMod), BigInt(p - 1) / 2n, BigInt(p))
    return result === BigInt(p - 1) ? -1 : Number(result)
  }, [modPow])

  const getQRSet = useCallback((p: number): Set<number> => {
    const qr = new Set<number>()
    for (let x = 0; x < p; x++) qr.add((x * x) % p)
    return qr
  }, [])

  const buildTableSteps = useCallback((p: number): StepState[] => {
    const result: StepState[] = []
    const qr = getQRSet(p)
    const cells: StepState['cells'] = []
    for (let a = 0; a < p; a++) {
      cells.push({ value: a, isQR: qr.has(a), highlight: false, isTarget: false })
    }
    result.push({
      description: `模 p = ${p} 的完全剩余系 {0, 1, ..., ${p - 1}}`,
      cells: cells.map(c => ({ ...c })),
      computation: `共有 ${p} 个元素`,
    })
    for (let x = 1; x < p; x++) {
      const sq = (x * x) % p
      const newCells = cells.map((c, i) => ({
        ...c,
        highlight: i === sq,
        isTarget: c.isTarget,
      }))
      result.push({
        description: `计算 ${x}^2 = ${x * x} ≡ ${sq} (mod ${p})`,
        cells: newCells,
        computation: `${x}^2 mod ${p} = ${sq}`,
      })
      cells[sq].isTarget = true
    }
    const finalCells = cells.map(c => ({ ...c, highlight: false, isTarget: false }))
    const qrList = Array.from(qr).filter(x => x !== 0).sort((a, b) => a - b)
    result.push({
      description: `模 ${p} 的二次剩余: {${qrList.join(', ')}}，共 ${qrList.length} 个 = (p-1)/2`,
      cells: finalCells,
      computation: `非零二次剩余恰好有 (p-1)/2 = ${qrList.length} 个`,
    })
    return result
  }, [getQRSet])

  const buildEulerSteps = useCallback((a: number, p: number): StepState[] => {
    const result: StepState[] = []
    const qr = getQRSet(p)
    const exp = (p - 1) / 2
    const cells: StepState['cells'] = []
    for (let i = 0; i < p; i++) {
      cells.push({ value: i, isQR: qr.has(i), highlight: i === a, isTarget: i === a })
    }
    result.push({
      description: `使用欧拉判别法判断 a = ${a} 是否为模 p = ${p} 的二次剩余`,
      cells: cells.map(c => ({ ...c })),
      computation: `需要计算 ${a}^(${exp}) mod ${p}`,
    })
    let val = 1n
    const base = BigInt(a % p)
    const mod = BigInt(p)
    for (let i = 1; i <= exp; i++) {
      val = (val * base) % mod
      if (i <= 6 || i === exp) {
        const newCells = cells.map((c, idx) => ({
          ...c,
          highlight: idx === Number(val),
        }))
        result.push({
          description: `计算 ${a}^${i} ≡ ${val} (mod ${p})`,
          cells: newCells,
          computation: `${a}^${i} = ${val} mod ${p}`,
        })
      }
    }
    const isQR = Number(val) === 1
    const finalCells = cells.map(c => ({
      ...c,
      highlight: c.value === a,
      isTarget: c.value === a,
    }))
    result.push({
      description: `${a}^(${exp}) ≡ ${val} (mod ${p}) → ${a} 是模 ${p} 的${isQR ? '二次剩余' : '二次非剩余'}`,
      cells: finalCells,
      computation: `结果: ${val}，结论: ${isQR ? '二次剩余 (QR)' : '二次非剩余 (QNR)'}`,
    })
    return result
  }, [getQRSet])

  const buildCipollaSteps = useCallback((a: number, p: number): StepState[] => {
    const result: StepState[] = []
    const qr = getQRSet(p)
    const cells: StepState['cells'] = []
    for (let i = 0; i < p; i++) {
      cells.push({ value: i, isQR: qr.has(i), highlight: i === a, isTarget: i === a })
    }
    if (!qr.has(a)) {
      result.push({
        description: `${a} 不是模 ${p} 的二次剩余，无平方根`,
        cells: cells.map(c => ({ ...c })),
        computation: `Legendre(${a}, ${p}) = -1，无解`,
      })
      return result
    }
    if (p % 4 === 3) {
      const r = Number(modPow(BigInt(a), BigInt(p + 1) / 4n, BigInt(p)))
      const r2 = p - r
      result.push({
        description: `p ≡ 3 (mod 4)，可直接计算: x = a^((p+1)/4) mod p`,
        cells: cells.map(c => ({ ...c })),
        computation: `${a}^((${p}+1)/4) = ${a}^${(p + 1) / 4} mod ${p}`,
      })
      const newCells = cells.map(c => ({
        ...c,
        highlight: c.value === r || c.value === r2,
      }))
      result.push({
        description: `平方根为 ±${Math.min(r, r2)} (即 ${r} 和 ${r2})`,
        cells: newCells,
        computation: `${r}^2 ≡ ${(r * r) % p} (mod ${p}), ${r2}^2 ≡ ${(r2 * r2) % p} (mod ${p})`,
      })
      return result
    }
    // General Cipolla
    let t = 0
    for (let i = 1; i < p; i++) {
      if (legendreSymbol((i * i - a + p) % p, p) === -1) {
        t = i
        break
      }
    }
    const w2 = (t * t - a + p) % p
    result.push({
      description: `Cipolla 算法: 找到 t = ${t}，使得 t^2 - a = ${w2} 是二次非剩余`,
      cells: cells.map(c => ({ ...c })),
      computation: `t = ${t}, t^2 - a = ${t}^2 - ${a} = ${w2}, Legendre(${w2}, ${p}) = -1`,
    })
    // Simplified: just show the result
    const tp = BigInt(t)
    const ap = BigInt(a % p)
    const pp = BigInt(p)
    let x0 = 1n, x1 = 0n
    let a0 = tp, a1 = 1n
    const bw2 = BigInt(w2)
    let exp = (pp + 1n) / 2n
    result.push({
      description: `在扩域 F_{p^2} 中计算 (t + w)^((p+1)/2)，其中 w^2 = ${w2}`,
      cells: cells.map(c => ({ ...c })),
      computation: `计算 (${t} + w)^${(p + 1) / 2} in F_${p}[w]`,
    })
    let stepCount = 0
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        const nx0 = (x0 * a0 + x1 * a1 % pp * bw2) % pp
        const nx1 = (x0 * a1 + x1 * a0) % pp
        x0 = nx0
        x1 = nx1
        stepCount++
      }
      exp = exp / 2n
      if (exp > 0n) {
        const na0 = (a0 * a0 + a1 * a1 % pp * bw2) % pp
        const na1 = (2n * a0 * a1) % pp
        a0 = na0
        a1 = na1
      }
    }
    let r = Number(x0 % pp)
    if (r < 0) r += p
    if (BigInt(r) * BigInt(r) % pp !== ap % pp) {
      r = p - r
    }
    const r2 = p - r
    const newCells = cells.map(c => ({
      ...c,
      highlight: c.value === r || c.value === r2,
    }))
    result.push({
      description: `计算完成! 平方根为 ±${Math.min(r, r2)}`,
      cells: newCells,
      computation: `x = ${r} (mod ${p}), 验证: ${r}^2 = ${(r * r) % p} ≡ ${a} (mod ${p})`,
    })
    return result
  }, [getQRSet, legendreSymbol, modPow])

  const handleGenerate = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(0)
    let newSteps: StepState[]
    switch (mode) {
      case 'table':
        newSteps = buildTableSteps(prime)
        break
      case 'euler':
        newSteps = buildEulerSteps(targetA, prime)
        break
      case 'cipolla':
        newSteps = buildCipollaSteps(targetA, prime)
        break
      default:
        newSteps = []
    }
    setSteps(newSteps)
    if (newSteps.length > 0) {
      setDescription(newSteps[0].description)
      setComputation(newSteps[0].computation)
      setIsPlaying(true)
    }
  }, [mode, prime, targetA, buildTableSteps, buildEulerSteps, buildCipollaSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }
    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setDescription(step.description)
      setComputation(step.computation)
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
    setDescription('二次剩余可视化 - 选择模式和参数开始')
    setComputation('')
  }

  const handleStepForward = () => {
    if (steps.length === 0) return
    setIsPlaying(false)
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setDescription(step.description)
      setComputation(step.computation)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleStepBack = () => {
    if (steps.length === 0) return
    setIsPlaying(false)
    if (currentStep > 1) {
      const step = steps[currentStep - 2]
      setDescription(step.description)
      setComputation(step.computation)
      setCurrentStep(prev => prev - 2)
      setCurrentStep(prev => prev + 1)
    } else if (currentStep === 1) {
      const step = steps[0]
      setDescription(step.description)
      setComputation(step.computation)
      setCurrentStep(0)
    }
  }

  const currentCells = steps.length > 0 && currentStep > 0
    ? steps[Math.min(currentStep - 1, steps.length - 1)].cells
    : []

  const cellSize = prime <= 11 ? 60 : prime <= 17 ? 45 : 35
  const cols = prime <= 11 ? prime : Math.min(8, Math.ceil(Math.sqrt(prime)))
  const rows = Math.ceil(currentCells.length / cols)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          模数 p:
          <select
            value={prime}
            onChange={e => setPrime(Number(e.target.value))}
            style={{ padding: '0.3rem 0.5rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {[5, 7, 11, 13, 17, 19, 23].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          a:
          <select
            value={targetA}
            onChange={e => setTargetA(Number(e.target.value))}
            style={{ padding: '0.3rem 0.5rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {Array.from({ length: prime - 1 }, (_, i) => i + 1).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          模式:
          <select
            value={mode}
            onChange={e => setMode(e.target.value as 'table' | 'euler' | 'cipolla')}
            style={{ padding: '0.3rem 0.5rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            <option value="table">二次剩余表</option>
            <option value="euler">欧拉判别法</option>
            <option value="cipolla">Cipolla 算法</option>
          </select>
        </label>
        <button className="btn btn-primary" onClick={handleGenerate}>
          开始演示
        </button>
        <button className="btn btn-secondary" onClick={handleStepBack} disabled={steps.length === 0 || currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length}>
          下一步
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
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        {currentCells.length > 0 && (
          <svg
            width={Math.max(cols * (cellSize + 16) + 40, 400)}
            height={rows * (cellSize + 16) + 60}
            style={{ display: 'block', margin: '0 auto' }}
          >
            {currentCells.map((cell, index) => {
              const col = index % cols
              const row = Math.floor(index / cols)
              const x = 20 + col * (cellSize + 16)
              const y = 20 + row * (cellSize + 16)

              let fill = 'var(--bg-card)'
              let stroke = 'var(--border)'
              let strokeWidth = 1.5
              let textColor = 'var(--text-primary)'

              if (cell.highlight) {
                fill = '#f59e0b'
                stroke = '#fbbf24'
                strokeWidth = 3
                textColor = '#000'
              } else if (cell.isTarget) {
                fill = '#3b82f6'
                stroke = '#60a5fa'
                strokeWidth = 2.5
                textColor = '#fff'
              } else if (cell.value === 0) {
                fill = 'var(--bg-card)'
                stroke = 'var(--border)'
              } else if (cell.isQR) {
                fill = '#1e3a2f'
                stroke = '#22c55e'
                textColor = '#4ade80'
              } else {
                fill = '#3a1e1e'
                stroke = '#ef4444'
                textColor = '#f87171'
              }

              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx="6"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  />
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 1}
                    fill={textColor}
                    fontSize={cellSize > 45 ? 18 : 14}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {cell.value}
                  </text>
                  {cell.isQR && cell.value !== 0 && !cell.highlight && !cell.isTarget && (
                    <text
                      x={x + cellSize - 6}
                      y={y + 12}
                      fill="#4ade80"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      QR
                    </text>
                  )}
                  {!cell.isQR && cell.value !== 0 && !cell.highlight && !cell.isTarget && (
                    <text
                      x={x + cellSize - 4}
                      y={y + 12}
                      fill="#f87171"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      N
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      {computation && (
        <div className="viz-info" style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.9rem' }}>
          <strong>计算过程：</strong> {computation}
        </div>
      )}

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#1e3a2f', border: '1px solid #22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          二次剩余 (QR)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3a1e1e', border: '1px solid #ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          二次非剩余 (QNR)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前高亮
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          目标值 a
        </span>
      </div>

      {steps.length > 0 && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>进度：</strong> 步骤 {currentStep} / {steps.length}
          {currentStep >= steps.length && ' (完成)'}
        </div>
      )}
    </div>
  )
}
