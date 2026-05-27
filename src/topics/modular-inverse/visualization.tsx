import { useState, useEffect, useRef, useCallback } from 'react'

interface GcdStep {
  a: number
  b: number
  quotient: number
  remainder: number
  isBase: boolean
}

interface BacktrackStep {
  a: number
  b: number
  x: number
  y: number
  gcd: number
  description: string
}

interface FermatStep {
  base: number
  exp: number
  result: number
  description: string
}

type Method = 'gcd' | 'fermat'
type Phase = 'input' | 'forward' | 'backtrack' | 'fermat-steps' | 'done'

export default function ModularInverseVisualization() {
  const [inputA, setInputA] = useState(3)
  const [inputM, setInputM] = useState(7)
  const [method, setMethod] = useState<Method>('gcd')
  const [phase, setPhase] = useState<Phase>('input')
  const [currentStep, setCurrentStep] = useState(0)
  const [description, setDescription] = useState('模逆元求解 - 输入 a 和 m，选择方法后开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)

  const [gcdSteps, setGcdSteps] = useState<GcdStep[]>([])
  const [backtrackSteps, setBacktrackSteps] = useState<BacktrackStep[]>([])
  const [fermatSteps, setFermatSteps] = useState<FermatStep[]>([])
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const timerRef = useRef<number | null>(null)

  const computeGcdSteps = useCallback((a: number, b: number): GcdStep[] => {
    const steps: GcdStep[] = []
    let curA = a, curB = b
    while (curB !== 0) {
      steps.push({ a: curA, b: curB, quotient: Math.floor(curA / curB), remainder: curA % curB, isBase: false })
      const tmp = curB
      curB = curA % curB
      curA = tmp
    }
    steps.push({ a: curA, b: 0, quotient: 0, remainder: 0, isBase: true })
    return steps
  }, [])

  const computeBacktrackSteps = useCallback((a: number, m: number): BacktrackStep[] => {
    const steps: BacktrackStep[] = []
    function extGcdSteps(curA: number, curB: number): { gcd: number; x: number; y: number } {
      if (curB === 0) {
        steps.push({ a: curA, b: 0, x: 1, y: 0, gcd: curA, description: `基本情况: gcd(${curA}, 0) = ${curA}, x = 1, y = 0` })
        return { gcd: curA, x: 1, y: 0 }
      }
      const res = extGcdSteps(curB, curA % curB)
      const q = Math.floor(curA / curB)
      const newX = res.y
      const newY = res.x - q * res.y
      steps.push({
        a: curA, b: curB, x: newX, y: newY, gcd: res.gcd,
        description: `回溯: gcd(${curA}, ${curB}), q=${q}, x=y'=${newX}, y=x'-${q}*y'=${res.x}-${q}*${res.y}=${newY}`,
      })
      return { gcd: res.gcd, x: newX, y: newY }
    }
    extGcdSteps(a, m)
    return steps
  }, [])

  const computeFermatSteps = useCallback((a: number, p: number): FermatStep[] => {
    const steps: FermatStep[] = []
    const exp = p - 2
    let base = ((a % p) + p) % p
    let e = exp
    let res = 1
    steps.push({ base, exp: e, result: res, description: `计算 ${a}^(${p}-2) = ${a}^${exp} mod ${p}` })
    while (e > 0) {
      const prevRes = res
      if (e & 1) {
        res = (res * base) % p
        steps.push({
          base, exp: e, result: res,
          description: `指数 ${e} 是奇数, result = ${prevRes} * ${base} mod ${p} = ${res}`,
        })
      } else {
        steps.push({
          base, exp: e, result: res,
          description: `指数 ${e} 是偶数, result 保持 ${res}`,
        })
      }
      const prevBase = base
      base = (base * base) % p
      e >>= 1
      if (e > 0) {
        steps.push({
          base, exp: e, result: res,
          description: `底数更新: ${prevBase}^2 mod ${p} = ${base}, 指数变为 ${e}`,
        })
      }
    }
    steps.push({ base, exp: 0, result: res, description: `计算完成: ${a}^${exp} mod ${p} = ${res}` })
    return steps
  }, [])

  const gcdOf = useCallback((a: number, b: number): number => {
    while (b !== 0) { const t = b; b = a % b; a = t }
    return a
  }, [])

  const handleStart = useCallback(() => {
    if (inputA <= 0 || inputM <= 1) {
      setDescription('请输入有效的正整数（a > 0, m > 1）')
      return
    }
    const g = gcdOf(inputA, inputM)
    if (g !== 1) {
      setError(`gcd(${inputA}, ${inputM}) = ${g} ≠ 1，逆元不存在`)
      setPhase('done')
      setResult(null)
      setDescription(`gcd(${inputA}, ${inputM}) = ${g} ≠ 1，逆元不存在`)
      return
    }
    setError(null)
    setResult(null)
    if (method === 'gcd') {
      const fwd = computeGcdSteps(inputA, inputM)
      setGcdSteps(fwd)
      setBacktrackSteps([])
      setPhase('forward')
      setCurrentStep(0)
      setDescription(`扩展欧几里得: 开始辗转相除求 gcd(${inputA}, ${inputM})`)
    } else {
      if (gcdOf(inputM, 2) === 1 && !isPrime(inputM)) {
        setError(`费马小定理要求 m 是质数，${inputM} 不是质数`)
        setPhase('done')
        return
      }
      const fs = computeFermatSteps(inputA, inputM)
      setFermatSteps(fs)
      setPhase('fermat-steps')
      setCurrentStep(0)
      setDescription(`费马小定理: 计算 ${inputA}^(${inputM}-2) mod ${inputM}`)
    }
    setIsPlaying(true)
  }, [inputA, inputM, method, computeGcdSteps, computeBacktrackSteps, computeFermatSteps, gcdOf])

  function isPrime(n: number): boolean {
    if (n < 2) return false
    if (n < 4) return true
    if (n % 2 === 0 || n % 3 === 0) return false
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false
    }
    return true
  }

  useEffect(() => {
    if (!isPlaying) return

    if (phase === 'forward') {
      if (currentStep >= gcdSteps.length) {
        const bt = computeBacktrackSteps(inputA, inputM)
        setBacktrackSteps(bt)
        setPhase('backtrack')
        setCurrentStep(0)
        setDescription('递归完成，开始回溯计算 x 和 y 的系数')
        return
      }
      timerRef.current = window.setTimeout(() => {
        const s = gcdSteps[currentStep]
        setDescription(s.isBase
          ? `基本情况: gcd(${s.a}, 0) = ${s.a}，递归结束`
          : `第 ${currentStep + 1} 步: gcd(${s.a}, ${s.b}), ${s.a} = ${s.b}*${s.quotient} + ${s.remainder}`)
        setCurrentStep(p => p + 1)
      }, speed)
      return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }

    if (phase === 'backtrack') {
      if (currentStep >= backtrackSteps.length) {
        const last = backtrackSteps[backtrackSteps.length - 1]
        if (last) {
          const inv = ((last.x % inputM) + inputM) % inputM
          setResult(inv)
          setDescription(`完成! ${inputA} * (${last.x}) + ${inputM} * (${last.y}) = ${last.gcd}, 逆元 = ${inv}`)
        }
        setPhase('done')
        setIsPlaying(false)
        return
      }
      timerRef.current = window.setTimeout(() => {
        setDescription(backtrackSteps[currentStep].description)
        setCurrentStep(p => p + 1)
      }, speed)
      return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }

    if (phase === 'fermat-steps') {
      if (currentStep >= fermatSteps.length) {
        const last = fermatSteps[fermatSteps.length - 1]
        if (last) {
          setResult(last.result)
          setDescription(`完成! ${inputA}^(${inputM}-2) mod ${inputM} = ${last.result}, 逆元 = ${last.result}`)
        }
        setPhase('done')
        setIsPlaying(false)
        return
      }
      timerRef.current = window.setTimeout(() => {
        setDescription(fermatSteps[currentStep].description)
        setCurrentStep(p => p + 1)
      }, speed)
      return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }
  }, [isPlaying, phase, currentStep, gcdSteps, backtrackSteps, fermatSteps, speed, inputA, inputM, computeBacktrackSteps])

  const handleStep = useCallback(() => {
    if (phase === 'input') { handleStart(); setIsPlaying(false); return }
    setIsPlaying(false)

    if (phase === 'forward' && currentStep < gcdSteps.length) {
      const s = gcdSteps[currentStep]
      setDescription(s.isBase ? `基本情况: gcd(${s.a}, 0) = ${s.a}` : `第 ${currentStep + 1} 步: gcd(${s.a}, ${s.b}), ${s.a} = ${s.b}*${s.quotient} + ${s.remainder}`)
      setCurrentStep(p => p + 1)
      if (currentStep + 1 >= gcdSteps.length) {
        const bt = computeBacktrackSteps(inputA, inputM)
        setBacktrackSteps(bt)
        setPhase('backtrack')
        setCurrentStep(0)
      }
    } else if (phase === 'backtrack' && currentStep < backtrackSteps.length) {
      setDescription(backtrackSteps[currentStep].description)
      setCurrentStep(p => p + 1)
      if (currentStep + 1 >= backtrackSteps.length) {
        const last = backtrackSteps[backtrackSteps.length - 1]
        if (last) {
          const inv = ((last.x % inputM) + inputM) % inputM
          setResult(inv)
          setDescription(`完成! 逆元 = ${inv}`)
        }
        setPhase('done')
      }
    } else if (phase === 'fermat-steps' && currentStep < fermatSteps.length) {
      setDescription(fermatSteps[currentStep].description)
      setCurrentStep(p => p + 1)
      if (currentStep + 1 >= fermatSteps.length) {
        const last = fermatSteps[fermatSteps.length - 1]
        if (last) { setResult(last.result); setDescription(`完成! 逆元 = ${last.result}`) }
        setPhase('done')
      }
    }
  }, [phase, currentStep, gcdSteps, backtrackSteps, fermatSteps, inputA, inputM, handleStart, computeBacktrackSteps])

  const handlePauseResume = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (phase !== 'input' && phase !== 'done') {
      setIsPlaying(true)
    }
  }, [isPlaying, description, phase])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setGcdSteps([])
    setBacktrackSteps([])
    setFermatSteps([])
    setPhase('input')
    setCurrentStep(0)
    setResult(null)
    setError(null)
    setDescription('模逆元求解 - 输入 a 和 m，选择方法后开始')
  }, [])

  const getGcdColor = (i: number) => {
    if (phase === 'forward' || phase === 'backtrack' || phase === 'done') {
      if (i < currentStep || phase === 'backtrack' || phase === 'done') return '#22c55e'
      if (i === currentStep) return '#3b82f6'
    }
    return 'var(--bg-card)'
  }

  const getBtColor = (i: number) => {
    if (phase === 'backtrack') {
      if (i < currentStep) return '#f59e0b'
      if (i === currentStep) return '#3b82f6'
    }
    if (phase === 'done') return '#f59e0b'
    return 'var(--bg-card)'
  }

  const getFermatColor = (i: number) => {
    if (phase === 'fermat-steps') {
      if (i < currentStep) return '#8b5cf6'
      if (i === currentStep) return '#3b82f6'
    }
    if (phase === 'done') return '#8b5cf6'
    return 'var(--bg-card)'
  }

  const boxW = 220
  const boxH = 48
  const gap = 56
  const startY = 30

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          a:
          <input type="number" min="1" value={inputA}
            onChange={e => setInputA(Math.max(1, Number(e.target.value)))}
            disabled={phase !== 'input'}
            style={{ width: 80, padding: '0.25rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          m:
          <input type="number" min="2" value={inputM}
            onChange={e => setInputM(Math.max(2, Number(e.target.value)))}
            disabled={phase !== 'input'}
            style={{ width: 80, padding: '0.25rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          方法:
          <select value={method} onChange={e => setMethod(e.target.value as Method)} disabled={phase !== 'input'}
            style={{ padding: '0.25rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
          >
            <option value="gcd">扩展欧几里得</option>
            <option value="fermat">费马小定理</option>
          </select>
        </label>
        <button className="btn btn-primary" onClick={handleStart} disabled={phase !== 'input'}>开始</button>
        <button className="btn btn-primary" onClick={handleStep} disabled={phase === 'done'}>单步</button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={phase === 'input' || phase === 'done'}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>重置</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input type="range" min="200" max="2000" value={speed} onChange={e => setSpeed(Number(e.target.value))} />
          <span>{speed}ms</span>
        </label>
      </div>

      {/* 方程展示 */}
      <div style={{ padding: '0.75rem 1rem', margin: '0.75rem 0', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'Consolas, Monaco, monospace', fontSize: '1rem', textAlign: 'center' }}>
        求 x 使得 <strong>{inputA} * x ≡ 1 (mod {inputM})</strong>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        {method === 'gcd' && (phase === 'forward' || phase === 'backtrack' || phase === 'done') && (
          <svg width={boxW * 2 + 80} height={Math.max(startY + (gcdSteps.length + backtrackSteps.length) * gap + 80, 260)}>
            {/* 递归阶段 */}
            <g>
              <text x={20} y={startY} fill="var(--text-primary)" fontSize="13" fontWeight="bold">辗转相除</text>
              {gcdSteps.map((s, i) => {
                const x = 20, y = startY + 18 + i * gap
                return (
                  <g key={`g-${i}`}>
                    <rect x={x} y={y} width={boxW} height={boxH} rx={6}
                      fill={getGcdColor(i)}
                      stroke={i === currentStep && phase === 'forward' ? '#60a5fa' : 'var(--border)'}
                      strokeWidth={i === currentStep && phase === 'forward' ? 3 : 1.5} />
                    <text x={x + boxW / 2} y={y + 18} fill="var(--text-primary)" fontSize="12" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">
                      {s.isBase ? `gcd(${s.a}, 0) = ${s.a}` : `gcd(${s.a}, ${s.b})`}
                    </text>
                    {!s.isBase && (
                      <text x={x + boxW / 2} y={y + 36} fill="var(--text-secondary)" fontSize="11" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">
                        {s.a} = {s.b}*{s.quotient} + {s.remainder}
                      </text>
                    )}
                    {i < gcdSteps.length - 1 && (
                      <line x1={x + boxW / 2} y1={y + boxH} x2={x + boxW / 2} y2={y + gap}
                        stroke="var(--text-secondary)" strokeWidth={1.5} markerEnd="url(#arrow-mi)" />
                    )}
                  </g>
                )
              })}
            </g>
            {/* 回溯阶段 */}
            {backtrackSteps.length > 0 && (
              <g>
                <text x={boxW + 50} y={startY} fill="var(--text-primary)" fontSize="13" fontWeight="bold">回溯求系数</text>
                {backtrackSteps.map((s, i) => {
                  const x = boxW + 50, y = startY + 18 + i * gap
                  return (
                    <g key={`b-${i}`}>
                      <rect x={x} y={y} width={boxW} height={boxH} rx={6}
                        fill={getBtColor(i)}
                        stroke={i === currentStep && phase === 'backtrack' ? '#60a5fa' : 'var(--border)'}
                        strokeWidth={i === currentStep && phase === 'backtrack' ? 3 : 1.5} />
                      <text x={x + boxW / 2} y={y + 18} fill="var(--text-primary)" fontSize="12" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">
                        gcd({s.a}, {s.b})
                      </text>
                      <text x={x + boxW / 2} y={y + 36} fill="var(--text-secondary)" fontSize="11" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">
                        x={s.x}, y={s.y}
                      </text>
                      {i < backtrackSteps.length - 1 && (
                        <line x1={x + boxW / 2} y1={y + boxH} x2={x + boxW / 2} y2={y + gap}
                          stroke="var(--text-secondary)" strokeWidth={1.5} markerEnd="url(#arrow-mi)" />
                      )}
                    </g>
                  )
                })}
              </g>
            )}
            <defs>
              <marker id="arrow-mi" markerWidth={10} markerHeight={7} refX={9} refY={3.5} orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
              </marker>
            </defs>
          </svg>
        )}

        {method === 'fermat' && (phase === 'fermat-steps' || phase === 'done') && (
          <svg width={boxW + 40} height={Math.max(startY + fermatSteps.length * gap + 80, 200)}>
            <text x={20} y={startY} fill="var(--text-primary)" fontSize="13" fontWeight="bold">费马小定理快速幂</text>
            {fermatSteps.map((s, i) => {
              const x = 20, y = startY + 18 + i * gap
              return (
                <g key={`f-${i}`}>
                  <rect x={x} y={y} width={boxW} height={boxH} rx={6}
                    fill={getFermatColor(i)}
                    stroke={i === currentStep && phase === 'fermat-steps' ? '#60a5fa' : 'var(--border)'}
                    strokeWidth={i === currentStep && phase === 'fermat-steps' ? 3 : 1.5} />
                  <text x={x + boxW / 2} y={y + 18} fill="var(--text-primary)" fontSize="12" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">
                    exp={s.exp}, base={s.base}
                  </text>
                  <text x={x + boxW / 2} y={y + 36} fill="var(--text-secondary)" fontSize="11" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">
                    result={s.result}
                  </text>
                  {i < fermatSteps.length - 1 && (
                    <line x1={x + boxW / 2} y1={y + boxH} x2={x + boxW / 2} y2={y + gap}
                      stroke="var(--text-secondary)" strokeWidth={1.5} markerEnd="url(#arrow-mi-f)" />
                  )}
                </g>
              )
            })}
            <defs>
              <marker id="arrow-mi-f" markerWidth={10} markerHeight={7} refX={9} refY={3.5} orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
              </marker>
            </defs>
          </svg>
        )}
      </div>

      {result !== null && (
        <div className="viz-info" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' }}>
          <strong>结果：</strong>
          {inputA} 在模 {inputM} 下的逆元 = {result}，
          验证: {inputA} * {result} = {inputA * result}, {inputA * result} mod {inputM} = {(inputA * result) % inputM}
        </div>
      )}

      {error && (
        <div className="viz-info" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>
          <strong>错误：</strong>{error}
        </div>
      )}

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前步骤
        </span>
        {method === 'gcd' && (
          <>
            <span style={{ marginLeft: '1rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
              已完成（递归）
            </span>
            <span style={{ marginLeft: '1rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
              已完成（回溯）
            </span>
          </>
        )}
        {method === 'fermat' && (
          <span style={{ marginLeft: '1rem' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
            已完成
          </span>
        )}
      </div>
    </div>
  )
}
