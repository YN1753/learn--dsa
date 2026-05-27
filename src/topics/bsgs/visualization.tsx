import { useState, useEffect, useRef, useCallback } from 'react'

interface BabyStepEntry {
  j: number
  value: number
}

interface GiantStepEntry {
  i: number
  gamma: number
  matched: boolean
  matchedJ: number | null
}

interface AnimationStep {
  description: string
  phase: 'baby' | 'giant' | 'found' | 'done'
  babySteps: BabyStepEntry[]
  giantSteps: GiantStepEntry[]
  currentJ: number
  currentI: number
  highlightValue: number | null
  result: number | null
}

function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base = ((base % mod) + mod) % mod
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod
    base = (base * base) % mod
    exp >>= 1
  }
  return result
}

function modInverse(a: number, mod: number): number {
  return modPow(a, mod - 2, mod)
}

export default function BsgsVisualization() {
  const [a, setA] = useState(3)
  const [b, setB] = useState(13)
  const [p, setP] = useState(17)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('BSGS算法可视化 - 点击「开始求解」查看过程')
  const [babySteps, setBabySteps] = useState<BabyStepEntry[]>([])
  const [giantSteps, setGiantSteps] = useState<GiantStepEntry[]>([])
  const [phase, setPhase] = useState<'idle' | 'baby' | 'giant' | 'found' | 'done'>('idle')
  const [currentJ, setCurrentJ] = useState(-1)
  const [currentI, setCurrentI] = useState(-1)
  const [highlightValue, setHighlightValue] = useState<number | null>(null)
  const [result, setResult] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((): AnimationStep[] => {
    const m = Math.ceil(Math.sqrt(p))
    const table = new Map<number, number>()
    const allSteps: AnimationStep[] = []

    const bs: BabyStepEntry[] = []
    const gs: GiantStepEntry[] = []

    // Baby Steps
    let baby = 1
    for (let j = 0; j < m; j++) {
      if (!table.has(baby)) {
        table.set(baby, j)
      }
      bs.push({ j, value: baby })
      allSteps.push({
        description: `Baby Step: 计算 ${a}^${j} mod ${p} = ${baby}，存入哈希表`,
        phase: 'baby',
        babySteps: [...bs],
        giantSteps: [...gs],
        currentJ: j,
        currentI: -1,
        highlightValue: baby,
        result: null,
      })
      baby = (baby * a) % p
    }

    // Giant Steps
    const giantStepVal = modInverse(modPow(a, m, p), p)
    let gamma = ((b % p) + p) % p

    for (let i = 0; i <= m; i++) {
      const matchedJ = table.get(gamma) ?? null
      const entry: GiantStepEntry = {
        i,
        gamma,
        matched: matchedJ !== null,
        matchedJ,
      }
      gs.push(entry)

      if (matchedJ !== null) {
        const x = i * m - matchedJ
        allSteps.push({
          description: `Giant Step: i=${i}, γ=${gamma} 在哈希表中找到 j=${matchedJ}，x = ${i}×${m} - ${matchedJ} = ${x}`,
          phase: 'found',
          babySteps: [...bs],
          giantSteps: [...gs],
          currentJ: matchedJ,
          currentI: i,
          highlightValue: gamma,
          result: x,
        })
        break
      }

      allSteps.push({
        description: `Giant Step: i=${i}, γ=${gamma}，未在哈希表中匹配，继续...`,
        phase: 'giant',
        babySteps: [...bs],
        giantSteps: [...gs],
        currentJ: -1,
        currentI: i,
        highlightValue: gamma,
        result: null,
      })
      gamma = (gamma * giantStepVal) % p
    }

    return allSteps
  }, [a, b, p])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      setPhase('done')
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setBabySteps(step.babySteps)
      setGiantSteps(step.giantSteps)
      setCurrentJ(step.currentJ)
      setCurrentI(step.currentI)
      setHighlightValue(step.highlightValue)
      setResult(step.result)
      setDescription(step.description)
      setPhase(step.phase)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const allSteps = generateSteps()
    setSteps(allSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setBabySteps([])
    setGiantSteps([])
    setCurrentJ(-1)
    setCurrentI(-1)
    setHighlightValue(null)
    setResult(null)
    setPhase('baby')
    setDescription('开始执行 BSGS 算法...')
  }

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
    setBabySteps([])
    setGiantSteps([])
    setCurrentJ(-1)
    setCurrentI(-1)
    setHighlightValue(null)
    setResult(null)
    setPhase('idle')
    setDescription('BSGS算法可视化 - 点击「开始求解」查看过程')
  }

  const handleStep = () => {
    if (steps.length === 0) {
      const allSteps = generateSteps()
      setSteps(allSteps)
      setCurrentStep(0)
    }
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setBabySteps(step.babySteps)
      setGiantSteps(step.giantSteps)
      setCurrentJ(step.currentJ)
      setCurrentI(step.currentI)
      setHighlightValue(step.highlightValue)
      setResult(step.result)
      setDescription(step.description)
      setPhase(step.phase)
      setCurrentStep(prev => prev + 1)
    }
  }

  const m = Math.ceil(Math.sqrt(p))

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          a:
          <input
            type="number"
            value={a}
            onChange={e => setA(Math.max(2, Number(e.target.value)))}
            style={{ width: 60, padding: '0.25rem', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4 }}
            disabled={isPlaying}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          b:
          <input
            type="number"
            value={b}
            onChange={e => setB(Math.max(1, Number(e.target.value)))}
            style={{ width: 60, padding: '0.25rem', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4 }}
            disabled={isPlaying}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          p:
          <input
            type="number"
            value={p}
            onChange={e => setP(Math.max(3, Number(e.target.value)))}
            style={{ width: 80, padding: '0.25rem', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4 }}
            disabled={isPlaying}
          />
        </label>
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始求解
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying}>
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
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ padding: '1rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Baby Steps Table */}
          <div style={{ flex: '1 1 300px', minWidth: 280 }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
              Baby Steps (m = {m})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
              {babySteps.map((entry) => (
                <div
                  key={entry.j}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: currentJ === entry.j && phase === 'baby'
                      ? '#3b82f6'
                      : highlightValue === entry.value
                        ? '#f59e0b'
                        : 'var(--bg-card)',
                    border: `1px solid ${currentJ === entry.j && phase === 'baby' ? '#60a5fa' : highlightValue === entry.value ? '#fbbf24' : 'var(--border)'}`,
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>j = {entry.j}</div>
                  <div style={{ fontWeight: 'bold' }}>{a}^{entry.j} = {entry.value}</div>
                </div>
              ))}
              {babySteps.length === 0 && phase === 'idle' && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', gridColumn: '1 / -1' }}>
                  等待开始...
                </div>
              )}
            </div>
          </div>

          {/* Giant Steps Table */}
          <div style={{ flex: '1 1 300px', minWidth: 280 }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
              Giant Steps
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
              {giantSteps.map((entry) => (
                <div
                  key={entry.i}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: entry.matched
                      ? '#22c55e'
                      : currentI === entry.i && phase === 'giant'
                        ? '#3b82f6'
                        : 'var(--bg-card)',
                    border: `1px solid ${entry.matched ? '#4ade80' : currentI === entry.i ? '#60a5fa' : 'var(--border)'}`,
                    borderRadius: 6,
                    fontSize: '0.85rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>i = {entry.i}</div>
                  <div style={{ fontWeight: 'bold' }}>γ = {entry.gamma}</div>
                  {entry.matched && (
                    <div style={{ fontSize: '0.75rem', color: '#fff', marginTop: 2 }}>
                      j = {entry.matchedJ}
                    </div>
                  )}
                </div>
              ))}
              {giantSteps.length === 0 && (phase === 'idle' || phase === 'baby') && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', gridColumn: '1 / -1' }}>
                  等待 Baby Step 完成...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result */}
        {result !== null && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem 1.5rem',
            background: '#22c55e22',
            border: '1px solid #4ade80',
            borderRadius: 8,
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
            解: {a}^{result} ≡ {b} (mod {p})
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
          当前步骤
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          匹配候选
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          找到匹配
        </span>
      </div>
    </div>
  )
}
