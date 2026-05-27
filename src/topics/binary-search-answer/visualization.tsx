import { useState, useEffect, useRef, useCallback } from 'react'

interface BSAStep {
  lo: number
  hi: number
  mid: number
  feasible: boolean | null
  checkResult: string
  description: string
  feasibleRange: [number, number] | null
  infeasibleRange: [number, number] | null
}

interface ProblemConfig {
  name: string
  lo: number
  hi: number
  title: string
  question: string
  checkDesc: (mid: number) => string
  check: (mid: number) => boolean
}

const PROBLEMS: ProblemConfig[] = [
  {
    name: 'aggressive-cows',
    title: 'Aggressive Cows',
    question: '将牛放入牛棚 [1,2,4,8,9]，3头牛，最大化最小间距',
    lo: 1,
    hi: 8,
    checkDesc: (mid) => `间距>=${mid}能否放下3头牛?`,
    check: (mid) => {
      // positions: [1,2,4,8,9], m=3
      const pos = [1, 2, 4, 8, 9]
      let count = 1, last = pos[0]
      for (let i = 1; i < pos.length; i++) {
        if (pos[i] - last >= mid) { count++; last = pos[i] }
        if (count >= 3) return true
      }
      return false
    },
  },
  {
    name: 'ship-packages',
    title: 'Ship Packages',
    question: '包裹 [1,2,3,4,5,6,7,8,9,10]，5天运完，最小化船容量',
    lo: 10,
    hi: 55,
    checkDesc: (mid) => `容量=${mid}能否5天运完?`,
    check: (mid) => {
      const w = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      let days = 1, load = 0
      for (const x of w) {
        if (load + x > mid) { days++; load = x; if (days > 5) return false }
        else load += x
      }
      return true
    },
  },
  {
    name: 'split-array',
    title: 'Split Array',
    question: '数组 [7,2,5,10,8] 分成2份，最小化子数组和的最大值',
    lo: 10,
    hi: 32,
    checkDesc: (mid) => `最大子数组和<=${mid}能否分成2份?`,
    check: (mid) => {
      const nums = [7, 2, 5, 10, 8]
      let parts = 1, sum = 0
      for (const x of nums) {
        if (sum + x > mid) { parts++; sum = x; if (parts > 2) return false }
        else sum += x
      }
      return true
    },
  },
]

function generateSteps(config: ProblemConfig): BSAStep[] {
  const steps: BSAStep[] = []
  let lo = config.lo
  let hi = config.hi
  const feasibleRanges: [number, number][] = []
  const infeasibleRanges: [number, number][] = []

  steps.push({
    lo, hi, mid: -1, feasible: null,
    checkResult: '',
    description: `初始化搜索范围: [${lo}, ${hi}]`,
    feasibleRange: null,
    infeasibleRange: null,
  })

  let iteration = 0
  while (lo < hi && iteration < 30) {
    iteration++
    const mid = lo + Math.floor((hi - lo) / 2)
    const feasible = config.check(mid)

    if (feasible) {
      feasibleRanges.push([mid, hi])
      steps.push({
        lo, hi, mid, feasible: true,
        checkResult: config.checkDesc(mid),
        description: `check(${mid}) = 可行 → 答案可能更小, hi = ${mid}`,
        feasibleRange: [mid, hi],
        infeasibleRange: null,
      })
      hi = mid
    } else {
      infeasibleRanges.push([lo, mid])
      steps.push({
        lo, hi, mid, feasible: false,
        checkResult: config.checkDesc(mid),
        description: `check(${mid}) = 不可行 → 答案需要更大, lo = ${mid + 1}`,
        feasibleRange: null,
        infeasibleRange: [lo, mid],
      })
      lo = mid + 1
    }
  }

  steps.push({
    lo, hi, mid: -1, feasible: null,
    checkResult: '',
    description: `搜索结束! 最优答案 = ${lo}`,
    feasibleRange: null,
    infeasibleRange: null,
  })

  return steps
}

export default function BinarySearchAnswerVisualization() {
  const [problemIdx, setProblemIdx] = useState(0)
  const [steps, setSteps] = useState<BSAStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const timerRef = useRef<number | null>(null)

  const config = PROBLEMS[problemIdx]

  const regenerate = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    setIsPlaying(false)
    setSteps(generateSteps(config))
    setCurrentStep(0)
  }, [config])

  useEffect(() => { regenerate() }, [problemIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) { setIsPlaying(false); return }
    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, speed)
    return () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null } }
  }, [isPlaying, currentStep, steps, speed])

  const togglePlay = useCallback(() => {
    if (steps.length === 0) return
    if (currentStep >= steps.length - 1) { setCurrentStep(0); setIsPlaying(true) }
    else setIsPlaying(prev => !prev)
  }, [steps, currentStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1)
  }, [currentStep, steps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }, [currentStep])

  const current = steps[currentStep] || steps[0]

  if (!current) return <div className="viz-canvas">加载中...</div>

  const rangeMin = config.lo
  const rangeMax = config.hi
  const rangeSize = rangeMax - rangeMin

  const toPercent = (val: number) => ((val - rangeMin) / rangeSize) * 100

  // Collect all feasible/infeasible ranges from past steps
  const pastFeasible: [number, number][] = []
  const pastInfeasible: [number, number][] = []
  for (let i = 1; i <= currentStep && i < steps.length; i++) {
    const s = steps[i]
    if (s.feasibleRange) pastFeasible.push(s.feasibleRange)
    if (s.infeasibleRange) pastInfeasible.push(s.infeasibleRange)
  }

  return (
    <div className="visualization-container">
      {/* Problem selector */}
      <div className="viz-controls">
        <select
          value={problemIdx}
          onChange={e => { setProblemIdx(Number(e.target.value)) }}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        >
          {PROBLEMS.map((p, i) => (
            <option key={i} value={i}>{p.title}</option>
          ))}
        </select>

        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {config.question}
        </span>

        <button className="btn btn-secondary" onClick={regenerate}>重置</button>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={() => { setIsPlaying(false); setCurrentStep(0) }}>
          重置
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
          <input type="range" min="300" max="2500" step="100" value={speed} onChange={e => setSpeed(Number(e.target.value))} />
          {speed}ms
        </label>
      </div>

      {/* Progress bar */}
      {steps.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
            {currentStep + 1}/{steps.length}
          </span>
          <input
            type="range" min="0" max={steps.length - 1} value={currentStep}
            onChange={e => { setIsPlaying(false); setCurrentStep(Number(e.target.value)) }}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* Number line visualization */}
      <div className="viz-canvas" style={{ minHeight: '220px', padding: '1.5rem 1rem' }}>
        {/* Number line */}
        <div style={{ position: 'relative', width: '100%', height: '80px', margin: '0 auto', maxWidth: '600px' }}>
          {/* Base line */}
          <div style={{
            position: 'absolute', top: '40px', left: '24px', right: '24px', height: '4px',
            background: 'var(--border)', borderRadius: '2px',
          }} />

          {/* Feasible regions (green) */}
          {pastFeasible.map(([a, b], i) => (
            <div key={`f-${i}`} style={{
              position: 'absolute', top: '36px',
              left: `${24 + toPercent(Math.max(a, rangeMin)) * (100 - 4) / 100}%`,
              width: `${(toPercent(Math.min(b, rangeMax)) - toPercent(Math.max(a, rangeMin))) * (100 - 4) / 100}%`,
              height: '12px',
              background: 'rgba(34, 197, 94, 0.3)',
              borderRadius: '2px',
            }} />
          ))}

          {/* Infeasible regions (red) */}
          {pastInfeasible.map(([a, b], i) => (
            <div key={`i-${i}`} style={{
              position: 'absolute', top: '36px',
              left: `${24 + toPercent(Math.max(a, rangeMin)) * (100 - 4) / 100}%`,
              width: `${(toPercent(Math.min(b, rangeMax)) - toPercent(Math.max(a, rangeMin))) * (100 - 4) / 100}%`,
              height: '12px',
              background: 'rgba(239, 68, 68, 0.3)',
              borderRadius: '2px',
            }} />
          ))}

          {/* Current search range */}
          {current.lo <= current.hi && (
            <div style={{
              position: 'absolute', top: '28px',
              left: `${24 + toPercent(current.lo) * (100 - 4) / 100}%`,
              width: `${(toPercent(current.hi) - toPercent(current.lo)) * (100 - 4) / 100}%`,
              height: '24px',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '2px solid #3b82f6',
              borderRadius: '4px',
            }} />
          )}

          {/* Mid marker */}
          {current.mid >= 0 && (
            <div style={{
              position: 'absolute', top: '8px',
              left: `${24 + toPercent(current.mid) * (100 - 4) / 100}%`,
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: current.feasible === true ? '#22c55e' : current.feasible === false ? '#ef4444' : '#f59e0b',
                border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem', color: '#fff', fontWeight: 'bold',
              }}>
                M
              </div>
            </div>
          )}

          {/* lo marker */}
          <div style={{
            position: 'absolute', top: '52px',
            left: `${24 + toPercent(current.lo) * (100 - 4) / 100}%`,
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{
              padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold',
              color: '#60a5fa', whiteSpace: 'nowrap',
            }}>
              lo={current.lo}
            </div>
          </div>

          {/* hi marker */}
          <div style={{
            position: 'absolute', top: '52px',
            left: `${24 + toPercent(current.hi) * (100 - 4) / 100}%`,
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{
              padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold',
              color: '#a78bfa', whiteSpace: 'nowrap',
            }}>
              hi={current.hi}
            </div>
          </div>

          {/* Tick marks */}
          <div style={{
            position: 'absolute', top: '40px', left: '24px',
            width: 'calc(100% - 48px)', display: 'flex', justifyContent: 'space-between',
          }}>
            {[rangeMin, rangeMin + rangeSize * 0.25, rangeMin + rangeSize * 0.5, rangeMin + rangeSize * 0.75, rangeMax].map((v, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '1px', height: '8px', background: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {Math.round(v)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Check result indicator */}
        {current.mid >= 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)',
            background: current.feasible ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${current.feasible ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            maxWidth: '500px', margin: '0 auto',
          }}>
            <span style={{
              fontSize: '1.2rem',
              color: current.feasible ? '#22c55e' : '#ef4444',
              fontWeight: 'bold',
            }}>
              {current.feasible ? '✓' : '✗'}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              check({current.mid}): {current.feasible ? '可行' : '不可行'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              → {current.feasible ? `hi = ${current.mid}` : `lo = ${current.mid + 1}`}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap',
        fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(59, 130, 246, 0.3)', border: '1px solid #3b82f6', borderRadius: '2px', display: 'inline-block' }} />
          当前搜索范围
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(34, 197, 94, 0.3)', borderRadius: '2px', display: 'inline-block' }} />
          可行区间
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.3)', borderRadius: '2px', display: 'inline-block' }} />
          不可行区间
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          当前 mid
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>问题: {config.title}</span>
          <span>范围: [{current.lo}, {current.hi}]</span>
          {current.mid >= 0 && <span>mid = {current.mid}</span>}
          <span>步骤: {currentStep + 1}/{steps.length}</span>
        </div>
      </div>
    </div>
  )
}
