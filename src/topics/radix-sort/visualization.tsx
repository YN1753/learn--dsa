import React, { useState, useCallback, useRef, useEffect } from 'react'

interface SortStep {
  array: number[]
  digitPos: number
  buckets: number[][]
  distributing: boolean
  collecting: boolean
  highlightIndices: number[]
  collectingBucket: number
}

function generateSteps(input: number[]): SortStep[] {
  const steps: SortStep[] = []
  if (input.length === 0) return steps

  const maxVal = Math.max(...input)
  let maxDigits = 0
  let temp = maxVal
  while (temp > 0) {
    maxDigits++
    temp = Math.floor(temp / 10)
  }
  if (maxDigits === 0) maxDigits = 1

  let arr = [...input]
  steps.push({
    array: [...arr],
    digitPos: 0,
    buckets: Array.from({ length: 10 }, () => []),
    distributing: false,
    collecting: false,
    highlightIndices: [],
    collectingBucket: -1,
  })

  for (let digit = 0; digit < maxDigits; digit++) {
    const buckets: number[][] = Array.from({ length: 10 }, () => [])

    for (let i = 0; i < arr.length; i++) {
      const d = Math.floor(arr[i] / Math.pow(10, digit)) % 10
      buckets[d] = [...buckets[d], arr[i]]
      steps.push({
        array: [...arr],
        digitPos: digit,
        buckets: buckets.map((b) => [...b]),
        distributing: true,
        collecting: false,
        highlightIndices: [i],
        collectingBucket: -1,
      })
    }

    for (let b = 0; b < 10; b++) {
      if (buckets[b].length > 0) {
        steps.push({
          array: [...arr],
          digitPos: digit,
          buckets: buckets.map((bk) => [...bk]),
          distributing: false,
          collecting: true,
          highlightIndices: [],
          collectingBucket: b,
        })
      }
    }

    arr = buckets.flat()
    steps.push({
      array: [...arr],
      digitPos: digit,
      buckets: Array.from({ length: 10 }, () => []),
      distributing: false,
      collecting: false,
      highlightIndices: [],
      collectingBucket: -1,
    })
  }

  return steps
}

function getDigitLabel(pos: number): string {
  const labels = ['个位', '十位', '百位', '千位', '万位']
  return labels[pos] ?? `第${pos}位`
}

export default function RadixSortVisualization() {
  const [array, setArray] = useState<number[]>([170, 45, 75, 90, 802, 24, 2, 66])
  const [steps, setSteps] = useState<SortStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSteps(generateSteps(array))
    setCurrentStep(0)
    setPlaying(false)
  }, [array])

  useEffect(() => {
    if (playing && steps.length > 0) {
      timerRef.current = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep((s) => s + 1)
        } else {
          setPlaying(false)
        }
      }, speed)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [playing, currentStep, speed, steps])

  const step = steps[currentStep] ?? {
    array: array,
    digitPos: 0,
    buckets: Array.from({ length: 10 }, () => []),
    distributing: false,
    collecting: false,
    highlightIndices: [],
    collectingBucket: -1,
  }

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1)
  }, [currentStep, steps.length])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }, [currentStep])

  const handleReset = useCallback(() => {
    setCurrentStep(0)
    setPlaying(false)
  }, [])

  const handlePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setPlaying(true)
  }, [currentStep, steps.length])

  const handlePause = useCallback(() => {
    setPlaying(false)
  }, [])

  const handleRandom = useCallback(() => {
    const len = 8 + Math.floor(Math.random() * 5)
    const newArr = Array.from({ length: len }, () => Math.floor(Math.random() * 900) + 10)
    setArray(newArr)
    setPlaying(false)
  }, [])

  const handleSpeedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(1100 - Number(e.target.value))
  }, [])

  const hasBuckets = step.buckets.some((b) => b.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div className="viz-info" style={{ display: 'flex', gap: 24, fontSize: 14, color: '#cbd5e1' }}>
        <span>
          当前趟数:{' '}
          <strong style={{ color: '#f59e0b' }}>{step.digitPos + 1}</strong>
        </span>
        <span>
          当前位:{' '}
          <strong style={{ color: '#f59e0b' }}>{getDigitLabel(step.digitPos)}</strong>
        </span>
        <span>
          阶段:{' '}
          <strong style={{ color: '#38bdf8' }}>
            {step.distributing ? '分配中' : step.collecting ? '收集中' : '就绪'}
          </strong>
        </span>
        <span>
          步骤: {currentStep + 1} / {steps.length}
        </span>
      </div>

      <div className="viz-canvas">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          {step.array.map((num, i) => {
            const isHighlight = step.highlightIndices.includes(i)
            const digitVal = Math.floor(num / Math.pow(10, step.digitPos)) % 10
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 48,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: '#94a3b8',
                    marginBottom: 2,
                  }}
                >
                  {isHighlight ? `d=${digitVal}` : ''}
                </div>
                <div
                  style={{
                    padding: '8px 6px',
                    borderRadius: 6,
                    backgroundColor: isHighlight ? '#f59e0b' : '#1e293b',
                    color: isHighlight ? '#000' : '#e2e8f0',
                    border: `2px solid ${isHighlight ? '#fbbf24' : '#334155'}`,
                    fontWeight: 600,
                    fontSize: 15,
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {num}
                </div>
              </div>
            )
          })}
        </div>

        {hasBuckets && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(10, 1fr)',
              gap: 6,
              padding: 12,
              backgroundColor: '#0f172a',
              borderRadius: 8,
              border: '1px solid #1e293b',
            }}
          >
            {step.buckets.map((bucket, bIdx) => (
              <div
                key={bIdx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color:
                      step.collectingBucket === bIdx ? '#f59e0b' : '#64748b',
                    borderBottom: `2px solid ${
                      step.collectingBucket === bIdx ? '#f59e0b' : '#1e293b'
                    }`,
                    paddingBottom: 4,
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  {bIdx}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    minHeight: 40,
                    alignItems: 'center',
                  }}
                >
                  {bucket.map((val, vi) => (
                    <div
                      key={vi}
                      style={{
                        padding: '3px 6px',
                        backgroundColor: '#22c55e',
                        color: '#000',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="viz-controls"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secondary" onClick={handleReset}>
            重置
          </button>
          <button className="btn btn-secondary" onClick={handlePrev} disabled={currentStep === 0}>
            上一步
          </button>
          {playing ? (
            <button className="btn btn-primary" onClick={handlePause}>
              暂停
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handlePlay}>
              播放
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleNext}
            disabled={currentStep >= steps.length - 1}
          >
            下一步
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>速度</span>
          <input
            type="range"
            min={100}
            max={1000}
            value={1100 - speed}
            onChange={handleSpeedChange}
            style={{ width: 120 }}
          />
        </div>

        <button className="btn btn-secondary" onClick={handleRandom}>
          随机数组
        </button>
      </div>
    </div>
  )
}
