import { useState, useEffect, useRef, useCallback } from 'react'

interface SieveStep {
  description: string
  primes: number[]
  currentPrime: number | null
  marked: number[]
  eliminated: Set<number>
}

function generateSteps(limit: number): SieveStep[] {
  const steps: SieveStep[] = []
  const isPrime = new Array(limit + 1).fill(true)
  isPrime[0] = isPrime[1] = false
  const eliminated = new Set<number>()

  steps.push({
    description: `初始化: 将 0 和 1 标记为非质数，其余假设为质数`,
    primes: [],
    currentPrime: null,
    marked: [],
    eliminated: new Set(eliminated),
  })

  for (let i = 2; i * i <= limit; i++) {
    if (isPrime[i]) {
      const newlyMarked: number[] = []
      for (let j = i * i; j <= limit; j += i) {
        if (isPrime[j]) {
          isPrime[j] = false
          eliminated.add(j)
          newlyMarked.push(j)
        }
      }

      if (newlyMarked.length > 0) {
        steps.push({
          description: `用质数 ${i} 筛掉它的倍数: ${newlyMarked.join(', ')}`,
          primes: [],
          currentPrime: i,
          marked: newlyMarked,
          eliminated: new Set(eliminated),
        })
      }
    }
  }

  const finalPrimes: number[] = []
  for (let i = 2; i <= limit; i++) {
    if (isPrime[i]) finalPrimes.push(i)
  }

  steps.push({
    description: `筛选完成! 共找到 ${finalPrimes.length} 个质数: ${finalPrimes.join(', ')}`,
    primes: finalPrimes,
    currentPrime: null,
    marked: [],
    eliminated: new Set(eliminated),
  })

  return steps
}

export default function SieveVisualization() {
  const [limit] = useState(80)
  const [steps, setSteps] = useState<SieveStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const timerRef = useRef<number | null>(null)

  const initSteps = useCallback(() => {
    const s = generateSteps(limit)
    setSteps(s)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [limit])

  useEffect(() => {
    initSteps()
  }, [initSteps])

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

  const step = steps[currentStep] || steps[0]
  if (!step) return null

  const cols = 10
  const cellSize = 42
  const gap = 4
  const rows = Math.ceil((limit + 1) / cols)

  const getCellColor = (num: number): string => {
    if (num < 2) return 'var(--bg-card)'
    if (step.currentPrime === num) return '#f59e0b'
    if (step.marked.includes(num)) return '#ef4444'
    if (step.primes.includes(num)) return '#22c55e'
    if (step.eliminated.has(num)) return 'var(--bg-card)'
    return '#3b82f6'
  }

  const getCellBorder = (num: number): string => {
    if (num < 2) return 'var(--border)'
    if (step.currentPrime === num) return '#fbbf24'
    if (step.marked.includes(num)) return '#f87171'
    if (step.primes.includes(num)) return '#4ade80'
    if (step.eliminated.has(num)) return 'var(--border)'
    return '#60a5fa'
  }

  const getTextColor = (num: number): string => {
    if (num < 2) return 'var(--text-secondary)'
    if (step.currentPrime === num || step.marked.includes(num) || step.primes.includes(num)) return '#fff'
    if (step.eliminated.has(num)) return 'var(--text-secondary)'
    return '#fff'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying && currentStep < steps.length}>
          播放
        </button>
        <button className="btn btn-primary" onClick={handlePause} disabled={!isPlaying}>
          暂停
        </button>
        <button className="btn btn-secondary" onClick={handleStep} disabled={currentStep >= steps.length}>
          单步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
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

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={cols * (cellSize + gap) + gap} height={rows * (cellSize + gap) + gap}>
          {Array.from({ length: limit + 1 }, (_, i) => i).map(num => {
            const row = Math.floor(num / cols)
            const col = num % cols
            const x = gap + col * (cellSize + gap)
            const y = gap + row * (cellSize + gap)
            return (
              <g key={num}>
                <rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={4}
                  fill={getCellColor(num)}
                  stroke={getCellBorder(num)}
                  strokeWidth={step.currentPrime === num || step.marked.includes(num) || step.primes.includes(num) ? 2.5 : 1}
                />
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2 + 5}
                  fill={getTextColor(num)}
                  fontSize="13"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {num}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="viz-info">
        <strong>步骤 {currentStep}/{steps.length}:</strong> {step.description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例:</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          候选质数
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前筛数
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          本轮筛掉
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          确认质数
        </span>
      </div>
    </div>
  )
}
