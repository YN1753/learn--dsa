import { useState, useRef, useCallback, useEffect } from 'react'

interface PhaseStep {
  phase: 1 | 2
  description: string
  values: Map<number, number>
  highlight: number | null
  prime: number | null
}

export default function Min25SieveVisualization() {
  const [n, setN] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<PhaseStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [description, setDescription] = useState('Min-25筛可视化 - 点击「开始演示」查看算法过程')
  const [s1Values, setS1Values] = useState<Map<number, number>>(new Map())
  const [currentPhase, setCurrentPhase] = useState<1 | 2>(1)
  const timerRef = useRef<number | null>(null)

  const sievePrimes = useCallback((limit: number): number[] => {
    const isPrime = new Array(limit + 1).fill(true)
    isPrime[0] = isPrime[1] = false
    for (let i = 2; i * i <= limit; i++) {
      if (isPrime[i]) {
        for (let j = i * i; j <= limit; j += i) {
          isPrime[j] = false
        }
      }
    }
    const primes: number[] = []
    for (let i = 2; i <= limit; i++) {
      if (isPrime[i]) primes.push(i)
    }
    return primes
  }, [])

  const generateSteps = useCallback(() => {
    const sqrtN = Math.floor(Math.sqrt(n))
    const primes = sievePrimes(sqrtN)
    const newSteps: PhaseStep[] = []

    // 收集所有 n/i 值
    const values: number[] = []
    for (let i = 1; i <= sqrtN; i++) {
      values.push(i)
    }
    for (let i = sqrtN; i >= 1; i--) {
      const v = Math.floor(n / i)
      if (v > sqrtN) values.push(v)
    }

    // 初始化 S1
    const s1 = new Map<number, number>()
    for (const v of values) {
      s1.set(v, v - 1)
    }

    newSteps.push({
      phase: 1,
      description: `初始化：对每个 n/i 值，S1(v) = v - 1（假设 g(p) = 1）`,
      values: new Map(s1),
      highlight: null,
      prime: null
    })

    // 第一阶段：逐个处理质数
    for (const p of primes) {
      const sp1 = s1.get(p - 1) ?? 0
      const updated = new Map(s1)

      for (const v of values) {
        if (v < p * p) break
        const vp = Math.floor(v / p)
        const current = updated.get(v) ?? 0
        const sub = updated.get(vp) ?? 0
        updated.set(v, current - (sub - sp1))
      }

      for (const [v, val] of updated) {
        s1.set(v, val)
      }

      newSteps.push({
        phase: 1,
        description: `第一阶段：处理质数 p = ${p}，减去以 ${p} 为最小质因子的合数贡献`,
        values: new Map(s1),
        highlight: p,
        prime: p
      })
    }

    // 第二阶段示例步骤
    newSteps.push({
      phase: 2,
      description: `第一阶段完成！S1(n) = ${s1.get(n) ?? 0}，进入第二阶段计算合数贡献`,
      values: new Map(s1),
      highlight: null,
      prime: null
    })

    for (const p of primes) {
      if (p * p > n) break
      const updated = new Map(s1)
      const currentVal = updated.get(n) ?? 0
      updated.set(n, currentVal + p)

      newSteps.push({
        phase: 2,
        description: `第二阶段：处理质数 p = ${p}，递归计算以 ${p} 为最小质因子的合数贡献`,
        values: new Map(updated),
        highlight: p,
        prime: p
      })

      for (const [v, val] of updated) {
        s1.set(v, val)
      }
    }

    newSteps.push({
      phase: 2,
      description: `计算完成！前缀和 S(n) = ${s1.get(n) ?? 0}`,
      values: new Map(s1),
      highlight: null,
      prime: null
    })

    return newSteps
  }, [n, sievePrimes])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const newSteps = generateSteps()
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setCurrentPhase(1)
  }

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setS1Values(new Map(step.values))
      setDescription(step.description)
      setCurrentPhase(step.phase)
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
    setS1Values(new Map())
    setDescription('Min-25筛可视化 - 点击「开始演示」查看算法过程')
    setSteps([])
    setCurrentStep(0)
    setCurrentPhase(1)
  }

  const displayValues = Array.from(s1Values.entries())
    .filter(([v]) => v <= n)
    .sort((a, b) => a[0] - b[0])

  const maxValue = Math.max(...displayValues.map(([, val]) => Math.abs(val)), 1)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          n =
          <input
            type="range"
            min="10"
            max="100"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            disabled={isPlaying}
          />
          <span>{n}</span>
        </label>
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始演示
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

      <div className="viz-canvas" style={{ minHeight: 300 }}>
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 8 }}>
          <strong>当前阶段：</strong>
          <span style={{ color: currentPhase === 1 ? '#3b82f6' : '#22c55e', marginLeft: '0.5rem' }}>
            {currentPhase === 1 ? '第一阶段 - 计算质数贡献' : '第二阶段 - 计算合数贡献'}
          </span>
          {currentStep > 0 && (
            <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
              步骤 {currentStep}/{steps.length}
            </span>
          )}
        </div>

        {displayValues.length > 0 ? (
          <svg width="100%" height={250} viewBox={`0 0 ${Math.max(displayValues.length * 40 + 40, 300)} 250`}>
            {displayValues.map(([v, val], index) => {
              const x = 20 + index * 40
              const barHeight = (Math.abs(val) / maxValue) * 150
              const isHighlighted = steps[currentStep - 1]?.highlight === v
              const isPrimeHighlight = steps[currentStep - 1]?.prime === v

              return (
                <g key={v}>
                  <rect
                    x={x}
                    y={200 - barHeight}
                    width={30}
                    height={barHeight}
                    fill={isHighlighted ? '#f59e0b' : isPrimeHighlight ? '#ef4444' : '#3b82f6'}
                    rx="4"
                    opacity={isHighlighted || isPrimeHighlight ? 1 : 0.7}
                  />
                  <text
                    x={x + 15}
                    y={220}
                    fill="var(--text-secondary)"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {v}
                  </text>
                  <text
                    x={x + 15}
                    y={195 - barHeight}
                    fill="var(--text-primary)"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {val}
                  </text>
                </g>
              )
            })}
          </svg>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            点击「开始演示」查看 Min-25筛的计算过程
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
          当前 S1(v) 值
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在更新的值
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前处理的质数
        </span>
      </div>
    </div>
  )
}
