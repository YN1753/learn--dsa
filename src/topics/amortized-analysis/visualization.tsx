import { useState, useEffect, useRef, useCallback } from 'react'

interface ArrayElement {
  value: number
  state: 'normal' | 'copying' | 'new' | 'expanded'
}

interface StepInfo {
  description: string
  array: ArrayElement[]
  capacity: number
  size: number
  actualCost: number
  amortizedCost: number
  potential: number
  credit: number
  isExpansion: boolean
}

function buildSteps(count: number): StepInfo[] {
  const steps: StepInfo[] = []
  let capacity = 1
  let size = 0
  let potential = 2 * size - capacity
  let credit = 0

  for (let i = 0; i < count; i++) {
    let isExpansion = false
    let actualCost = 1
    const amortizedCost = 3

    if (size === capacity) {
      isExpansion = true
      actualCost += size
      capacity *= 2
    }

    // Build array representation
    const arr: ArrayElement[] = []
    for (let j = 0; j < capacity; j++) {
      if (j < size) {
        arr.push({ value: j + 1, state: isExpansion ? 'copying' : 'normal' })
      } else if (j === size) {
        arr.push({ value: i + 1, state: 'new' })
      } else {
        arr.push({ value: 0, state: 'normal' })
      }
    }

    const oldPotential = potential
    size++
    potential = 2 * size - capacity
    credit += amortizedCost - actualCost

    let desc = ''
    if (isExpansion) {
      desc = `第 ${i + 1} 次 push: 扩容! 容量 ${capacity / 2} -> ${capacity}, 复制 ${size - 1} 个元素, 实际代价 = ${actualCost}`
    } else {
      desc = `第 ${i + 1} 次 push: 无需扩容, 实际代价 = 1`
    }

    steps.push({
      description: desc,
      array: arr,
      capacity,
      size,
      actualCost,
      amortizedCost,
      potential: oldPotential,
      credit,
      isExpansion,
    })
  }
  return steps
}

export default function AmortizedAnalysisVisualization() {
  const [stepCount, setStepCount] = useState(12)
  const [allSteps, setAllSteps] = useState<StepInfo[]>(() => buildSteps(12))
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const rebuildSteps = useCallback((count: number) => {
    setStepCount(count)
    setAllSteps(buildSteps(count))
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    if (!isPlaying || allSteps.length === 0) return
    if (currentStep >= allSteps.length) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, allSteps.length, speed])

  const handlePlayPause = () => {
    if (currentStep >= allSteps.length) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleStep = () => {
    setIsPlaying(false)
    if (currentStep < allSteps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const step = allSteps[Math.min(currentStep, allSteps.length - 1)]

  // Compute cumulative stats
  let totalActual = 0
  let totalAmortized = 0
  const costHistory: { actual: number; amortized: number }[] = []
  for (let i = 0; i < allSteps.length; i++) {
    totalActual += allSteps[i].actualCost
    totalAmortized += allSteps[i].amortizedCost
    costHistory.push({ actual: allSteps[i].actualCost, amortized: allSteps[i].amortizedCost })
  }

  const displayStep = currentStep > 0 ? Math.min(currentStep, allSteps.length) : 0
  const displayedHistory = costHistory.slice(0, displayStep)
  const cumActual = displayedHistory.reduce((s, h) => s + h.actual, 0)
  const cumAmortized = displayedHistory.reduce((s, h) => s + h.amortized, 0)

  // Chart dimensions
  const chartW = 480
  const chartH = 160
  const barGroupW = allSteps.length > 0 ? chartW / allSteps.length : 40
  const maxCost = 8

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePlayPause}>
          {isPlaying ? '暂停' : currentStep >= allSteps.length ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={handleStep} disabled={currentStep >= allSteps.length}>
          单步
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
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          操作次数:
          <select
            value={stepCount}
            onChange={(e) => rebuildSteps(Number(e.target.value))}
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 4px' }}
          >
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={16}>16</option>
            <option value={24}>24</option>
          </select>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto', minHeight: 420 }}>
        {/* Array visualization */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
            动态数组 (容量: {step.capacity}, 大小: {step.size})
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.array.map((el, i) => {
              let bg = 'var(--bg-card)'
              let border = 'var(--border)'
              let textColor = 'var(--text-secondary)'
              if (el.state === 'copying') {
                bg = '#3b82f6'
                border = '#60a5fa'
                textColor = '#fff'
              } else if (el.state === 'new') {
                bg = '#22c55e'
                border = '#4ade80'
                textColor = '#fff'
              } else if (i < step.size) {
                bg = 'var(--bg-card)'
                border = 'var(--accent)'
                textColor = 'var(--text-primary)'
              }
              return (
                <div
                  key={i}
                  style={{
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    background: bg,
                    border: `2px solid ${border}`,
                    color: textColor,
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {i < step.size ? (el.value || '') : ''}
                </div>
              )
            })}
          </div>
          {step.isExpansion && (
            <div style={{ marginTop: 6, color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>
              -- 扩容发生! 复制 {step.size - 1} 个元素 --
            </div>
          )}
        </div>

        {/* Cost bar chart */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
            每次操作的代价对比
          </div>
          <svg width={chartW + 20} height={chartH + 30} style={{ display: 'block' }}>
            {/* Axis */}
            <line x1={30} y1={10} x2={30} y2={chartH + 10} stroke="var(--border)" strokeWidth={1} />
            <line x1={30} y1={chartH + 10} x2={chartW + 20} y2={chartH + 10} stroke="var(--border)" strokeWidth={1} />
            {/* Y axis labels */}
            {[0, 2, 4, 6, 8].map(v => {
              const y = chartH + 10 - (v / maxCost) * chartH
              return (
                <text key={v} x={5} y={y + 4} fill="var(--text-secondary)" fontSize={10} fontFamily="Consolas, Monaco, monospace">
                  {v}
                </text>
              )
            })}
            {/* Bars */}
            {allSteps.map((s, i) => {
              const x = 35 + i * barGroupW
              const visible = i < displayStep
              const barW = Math.max(barGroupW * 0.35, 6)
              const actualH = (s.actualCost / maxCost) * chartH
              const amortizedH = (s.amortizedCost / maxCost) * chartH
              return (
                <g key={i} opacity={visible ? 1 : 0.15}>
                  {/* Actual cost bar */}
                  <rect
                    x={x}
                    y={chartH + 10 - actualH}
                    width={barW}
                    height={actualH}
                    fill="#ef4444"
                    rx={2}
                  />
                  {/* Amortized cost bar */}
                  <rect
                    x={x + barW + 2}
                    y={chartH + 10 - amortizedH}
                    width={barW}
                    height={amortizedH}
                    fill="#3b82f6"
                    rx={2}
                  />
                  {/* Step number */}
                  <text
                    x={x + barW}
                    y={chartH + 25}
                    fill="var(--text-secondary)"
                    fontSize={9}
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {i + 1}
                  </text>
                </g>
              )
            })}
          </svg>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            <span>
              <span style={{ display: 'inline-block', width: 10, height: 10, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
              实际代价
            </span>
            <span>
              <span style={{ display: 'inline-block', width: 10, height: 10, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
              摊还代价 (固定 3)
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            <strong>当前步骤:</strong> {displayStep} / {allSteps.length}
          </div>
          <div style={{ color: '#ef4444' }}>
            <strong>累计实际代价:</strong> {cumActual}
          </div>
          <div style={{ color: '#3b82f6' }}>
            <strong>累计摊还代价:</strong> {cumAmortized}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            <strong>平均摊还:</strong> {displayStep > 0 ? (cumAmortized / displayStep).toFixed(2) : '-'}
          </div>
        </div>
      </div>

      <div className="viz-info">
        <strong>说明：</strong> {step.description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          新插入元素
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在复制的元素 (扩容时)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--bg-card)', border: '2px solid var(--accent)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已有元素
        </span>
      </div>
    </div>
  )
}
