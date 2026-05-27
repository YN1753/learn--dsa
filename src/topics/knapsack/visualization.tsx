import { useState, useEffect, useRef, useCallback } from 'react'

interface KnapsackItem {
  weight: number
  value: number
  name: string
}

interface DPStep {
  row: number
  col: number
  value: number
  notPick: number
  pick: number
  picked: boolean
  description: string
  dpTable: number[][]
  dependencies: { row: number; col: number }[]
}

function generateDPSteps(items: KnapsackItem[], capacity: number): DPStep[] {
  const n = items.length
  const W = capacity
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0))
  const steps: DPStep[] = []

  // Initial state
  steps.push({
    row: 0, col: 0, value: 0, notPick: 0, pick: 0, picked: false,
    description: '初始化 DP 表，第 0 行和第 0 列全部为 0（没有物品或没有容量时价值为 0）',
    dpTable: dp.map(r => [...r]),
    dependencies: [],
  })

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1]
    for (let w = 0; w <= W; w++) {
      const deps: { row: number; col: number }[] = []

      if (w < item.weight) {
        dp[i][w] = dp[i - 1][w]
        deps.push({ row: i - 1, col: w })
        steps.push({
          row: i, col: w, value: dp[i][w],
          notPick: dp[i - 1][w], pick: 0, picked: false,
          description: `物品${i}(${item.name}) 重量${item.weight} > 容量${w}，无法选入，继承 dp[${i - 1}][${w}]=${dp[i - 1][w]}`,
          dpTable: dp.map(r => [...r]),
          dependencies: deps,
        })
      } else {
        const notPick = dp[i - 1][w]
        const pick = dp[i - 1][w - item.weight] + item.value
        dp[i][w] = Math.max(notPick, pick)

        deps.push({ row: i - 1, col: w })
        if (w - item.weight >= 0) {
          deps.push({ row: i - 1, col: w - item.weight })
        }

        steps.push({
          row: i, col: w, value: dp[i][w],
          notPick, pick, picked: pick > notPick,
          description: pick > notPick
            ? `dp[${i}][${w}] = max(不选=${notPick}, 选=${pick}) = ${pick} ← 选入物品${i}`
            : `dp[${i}][${w}] = max(不选=${notPick}, 选=${pick}) = ${notPick} ← 不选物品${i}`,
          dpTable: dp.map(r => [...r]),
          dependencies: deps,
        })
      }
    }
  }

  return steps
}

const PRESET_ITEMS: KnapsackItem[] = [
  { weight: 2, value: 3, name: 'A' },
  { weight: 3, value: 4, name: 'B' },
  { weight: 4, value: 5, name: 'C' },
  { weight: 5, value: 6, name: 'D' },
]
const PRESET_CAPACITY = 8

export default function KnapsackVisualization() {
  const [items] = useState<KnapsackItem[]>(PRESET_ITEMS)
  const [capacity] = useState(PRESET_CAPACITY)
  const [steps, setSteps] = useState<DPStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newSteps = generateDPSteps(items, capacity)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [items, capacity])

  useEffect(() => {
    generateSteps()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return

    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, speed)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, steps, speed])

  const togglePlay = useCallback(() => {
    if (steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }, [steps, currentStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const current = steps[currentStep] || steps[0]
  const W = capacity

  const getCellColor = (row: number, col: number): string => {
    if (!current) return '#1a1a2e'
    if (row === current.row && col === current.col) return '#f59e0b'
    if (current.dependencies.some(d => d.row === row && d.col === col)) return '#3b82f6'
    if (row === 0 || col === 0) return '#374151'
    return '#1a1a2e'
  }

  const getCellBorder = (row: number, col: number): string => {
    if (!current) return '1px solid #4b5563'
    if (row === current.row && col === current.col) return '2px solid #fbbf24'
    if (current.dependencies.some(d => d.row === row && d.col === col)) return '2px solid #60a5fa'
    return '1px solid #4b5563'
  }

  return (
    <div className="visualization-container">
      {/* Items display */}
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
            物品列表:
          </span>
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius)',
                background: current && current.row === idx + 1 && current.picked
                  ? '#22c55e22'
                  : 'var(--bg-card)',
                border: current && current.row === idx + 1
                  ? '1px solid #22c55e'
                  : '1px solid var(--border)',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
              }}
            >
              <strong>{item.name}</strong>
              <span style={{ color: 'var(--text-secondary)' }}>
                w={item.weight}, v={item.value}
              </span>
            </div>
          ))}
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            容量 W = {capacity}
          </span>
        </div>
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
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          速度:
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          {speed}ms
        </label>
      </div>

      {/* Progress bar */}
      {steps.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 0.25rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
            {currentStep + 1}/{steps.length}
          </span>
          <input
            type="range"
            min="0"
            max={steps.length - 1}
            value={currentStep}
            onChange={e => {
              setIsPlaying(false)
              setCurrentStep(Number(e.target.value))
            }}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* DP Table */}
      <div
        className="viz-canvas"
        style={{
          overflowX: 'auto',
          padding: '1rem',
          minHeight: '280px',
        }}
      >
        {current && (
          <table
            style={{
              borderCollapse: 'collapse',
              margin: '0 auto',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.8rem',
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: '0.3rem 0.5rem', color: 'var(--text-secondary)', border: '1px solid #4b5563' }}>
                  i＼w
                </th>
                {Array.from({ length: W + 1 }, (_, w) => (
                  <th
                    key={w}
                    style={{
                      padding: '0.3rem 0.4rem',
                      color: w === current.col ? '#fbbf24' : 'var(--text-secondary)',
                      border: '1px solid #4b5563',
                      minWidth: '36px',
                      fontWeight: w === current.col ? 'bold' : 'normal',
                    }}
                  >
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current.dpTable.map((row, i) => (
                <tr key={i}>
                  <td
                    style={{
                      padding: '0.3rem 0.5rem',
                      color: i === current.row ? '#fbbf24' : 'var(--text-secondary)',
                      border: '1px solid #4b5563',
                      fontWeight: i === current.row ? 'bold' : 'normal',
                      textAlign: 'center',
                    }}
                  >
                    {i === 0 ? '0' : `${i}(${items[i - 1].name})`}
                  </td>
                  {row.map((val, w) => (
                    <td
                      key={w}
                      style={{
                        padding: '0.3rem 0.4rem',
                        textAlign: 'center',
                        background: getCellColor(i, w),
                        border: getCellBorder(i, w),
                        color: i === current.row && w === current.col
                          ? '#000'
                          : current.dependencies.some(d => d.row === i && d.col === w)
                            ? '#93c5fd'
                            : 'var(--text-primary)',
                        fontWeight: i === current.row && w === current.col ? 'bold' : 'normal',
                        transition: 'all 0.2s ease',
                        minWidth: '36px',
                      }}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          padding: '0.5rem 0',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }} />
          当前计算
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
          依赖单元格
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#374151', borderRadius: '2px', display: 'inline-block' }} />
          边界 (i=0)
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current?.description || '等待开始...'}
        </div>
        {current && (
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span>当前位置: dp[{current.row}][{current.col}]</span>
            {current.row > 0 && (
              <>
                <span>不选: {current.notPick}</span>
                <span>选入: {current.pick}</span>
                <span>结果: {current.value} {current.picked ? '(选入)' : '(不选)'}</span>
              </>
            )}
            <span>步骤: {currentStep + 1}/{steps.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}
