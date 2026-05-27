import { useState, useEffect, useRef, useCallback } from 'react'

// --- Types ---

type DataMode = 'float' | 'integer'

interface BucketElement {
  value: number
  originalIndex: number
  bucketIndex: number
}

interface Step {
  buckets: number[][]
  highlightBucket: number
  highlightElementIndex: number
  phase: string
  description: string
  sortedResult: number[]
  sortedCount: number
}

// --- Helpers ---

function generateFloatArray(size: number): number[] {
  return Array.from({ length: size }, () => Math.round(Math.random() * 100) / 100)
}

function generateIntegerArray(size: number, maxVal: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * maxVal) + 1)
}

// --- Step Generation ---

function generateBucketSortSteps(input: number[], bucketCount: number, mode: DataMode): Step[] {
  const steps: Step[] = []
  const n = input.length
  const min = mode === 'float' ? 0 : Math.min(...input)
  const max = mode === 'float' ? 1 : Math.max(...input)

  // Initialize empty buckets
  const buckets: number[][] = Array.from({ length: bucketCount }, () => [])

  steps.push({
    buckets: Array.from({ length: bucketCount }, () => []),
    highlightBucket: -1,
    highlightElementIndex: -1,
    phase: '初始化',
    description: `创建 ${bucketCount} 个空桶，准备分配 ${n} 个元素`,
    sortedResult: [],
    sortedCount: 0,
  })

  // Phase 1: Distribute elements into buckets
  const elements: BucketElement[] = input.map((value, idx) => {
    let bucketIdx: number
    if (mode === 'float') {
      bucketIdx = Math.min(Math.floor(value * bucketCount), bucketCount - 1)
    } else {
      const range = max - min + 1
      const bucketWidth = Math.ceil(range / bucketCount)
      bucketIdx = Math.min(Math.floor((value - min) / bucketWidth), bucketCount - 1)
    }
    return { value, originalIndex: idx, bucketIndex: bucketIdx }
  })

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]
    buckets[el.bucketIndex] = [...buckets[el.bucketIndex], el.value]
    const bucketsCopy = buckets.map(b => [...b])

    steps.push({
      buckets: bucketsCopy,
      highlightBucket: el.bucketIndex,
      highlightElementIndex: buckets[el.bucketIndex].length - 1,
      phase: '分配元素',
      description: `将 arr[${el.originalIndex}]=${el.value.toFixed(mode === 'float' ? 2 : 0)} 放入桶 ${el.bucketIndex}`,
      sortedResult: [],
      sortedCount: 0,
    })
  }

  // Phase 2: Sort each bucket
  const sortedBuckets: number[][] = buckets.map(b => [...b])

  for (let i = 0; i < bucketCount; i++) {
    if (sortedBuckets[i].length <= 1) continue

    // Insertion sort with animation steps
    for (let j = 1; j < sortedBuckets[i].length; j++) {
      const key = sortedBuckets[i][j]
      let k = j - 1
      while (k >= 0 && sortedBuckets[i][k] > key) {
        sortedBuckets[i][k + 1] = sortedBuckets[i][k]
        k--
      }
      sortedBuckets[i][k + 1] = key

      const bucketsCopy = sortedBuckets.map(b => [...b])
      steps.push({
        buckets: bucketsCopy,
        highlightBucket: i,
        highlightElementIndex: k + 1,
        phase: '桶内排序',
        description: `桶 ${i} 内排序: 插入 ${key.toFixed(mode === 'float' ? 2 : 0)} 到位置 ${k + 1}`,
        sortedResult: [],
        sortedCount: 0,
      })
    }
  }

  // Final sorted bucket state
  for (let i = 0; i < bucketCount; i++) {
    if (sortedBuckets[i].length > 0) {
      const bucketsCopy = sortedBuckets.map(b => [...b])
      steps.push({
        buckets: bucketsCopy,
        highlightBucket: i,
        highlightElementIndex: -1,
        phase: '桶内排序完成',
        description: `桶 ${i} 排序完成: [${sortedBuckets[i].map(v => v.toFixed(mode === 'float' ? 2 : 0)).join(', ')}]`,
        sortedResult: [],
        sortedCount: 0,
      })
    }
  }

  // Phase 3: Collect from buckets
  const finalResult: number[] = []
  for (let i = 0; i < bucketCount; i++) {
    for (const val of sortedBuckets[i]) {
      finalResult.push(val)
      const bucketsCopy = sortedBuckets.map(b => [...b])
      steps.push({
        buckets: bucketsCopy,
        highlightBucket: i,
        highlightElementIndex: -1,
        phase: '收集结果',
        description: `从桶 ${i} 取出 ${val.toFixed(mode === 'float' ? 2 : 0)}，当前结果: [${finalResult.map(v => v.toFixed(mode === 'float' ? 2 : 0)).join(', ')}]`,
        sortedResult: [...finalResult],
        sortedCount: finalResult.length,
      })
    }
  }

  // Final step
  steps.push({
    buckets: sortedBuckets.map(b => [...b]),
    highlightBucket: -1,
    highlightElementIndex: -1,
    phase: '完成',
    description: `桶排序完成! 结果: [${finalResult.map(v => v.toFixed(mode === 'float' ? 2 : 0)).join(', ')}]`,
    sortedResult: [...finalResult],
    sortedCount: n,
  })

  return steps
}

// --- Bucket Colors ---

const BUCKET_COLORS = [
  { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' },
  { bg: '#3b1f5e', border: '#8b5cf6', text: '#c4b5fd' },
  { bg: '#1a3c34', border: '#10b981', text: '#6ee7b7' },
  { bg: '#4a2c1a', border: '#f59e0b', text: '#fcd34d' },
  { bg: '#4a1a2e', border: '#ec4899', text: '#f9a8d4' },
  { bg: '#1a3a4a', border: '#06b6d4', text: '#67e8f9' },
  { bg: '#3a4a1a', border: '#84cc16', text: '#bef264' },
  { bg: '#4a3a1a', border: '#f97316', text: '#fdba74' },
]

// --- Component ---

export default function BucketSortVisualization() {
  const [dataMode, setDataMode] = useState<DataMode>('float')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const [arraySize, setArraySize] = useState(12)
  const [bucketCount, setBucketCount] = useState(5)
  const [customInput, setCustomInput] = useState('')
  const [inputArray, setInputArray] = useState<number[]>([])
  const timerRef = useRef<number | null>(null)

  const initDemo = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    let arr: number[]
    if (customInput.trim()) {
      arr = customInput.split(/[,\s]+/).map(Number).filter(n => !isNaN(n) && n >= 0 && (dataMode === 'float' ? n <= 1 : true))
      if (arr.length === 0) {
        arr = dataMode === 'float' ? generateFloatArray(arraySize) : generateIntegerArray(arraySize, 100)
      }
    } else {
      arr = dataMode === 'float' ? generateFloatArray(arraySize) : generateIntegerArray(arraySize, 100)
    }

    setInputArray(arr)
    const generatedSteps = generateBucketSortSteps(arr, bucketCount, dataMode)
    setSteps(generatedSteps)
    setTotalSteps(generatedSteps.length)
  }, [dataMode, arraySize, bucketCount, customInput])

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= totalSteps) {
      setIsPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      if (currentStep + 1 < totalSteps) {
        setCurrentStep(prev => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }, speed)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, totalSteps, speed])

  const togglePlay = () => {
    if (totalSteps === 0) {
      initDemo()
      setTimeout(() => setIsPlaying(true), 100)
      return
    }
    setIsPlaying(prev => !prev)
  }

  const stepForward = () => {
    if (totalSteps === 0) { initDemo(); return }
    setIsPlaying(false)
    const next = currentStep + 1
    if (next < totalSteps) setCurrentStep(next)
  }

  const stepBackward = () => {
    setIsPlaying(false)
    const prev = currentStep - 1
    if (prev >= 0) setCurrentStep(prev)
  }

  const reset = () => { initDemo() }

  useEffect(() => { initDemo() }, [initDemo])

  const step = steps[currentStep]
  const currentBuckets = step?.buckets ?? Array.from({ length: bucketCount }, () => [])
  const highlightBucket = step?.highlightBucket ?? -1
  const highlightElement = step?.highlightElementIndex ?? -1
  const sortedResult = step?.sortedResult ?? []

  const fmt = (v: number) => dataMode === 'float' ? v.toFixed(2) : String(v)

  return (
    <div className="visualization-container">
      {/* Mode selector */}
      <div className="viz-controls">
        <select
          value={dataMode}
          onChange={e => { setDataMode(e.target.value as DataMode); setCustomInput('') }}
          style={{
            padding: '0.5rem 1rem', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer',
          }}
        >
          <option value="float">浮点数 [0,1)</option>
          <option value="integer">整数</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          数组大小:
          <select value={arraySize} onChange={e => setArraySize(Number(e.target.value))}
            style={{ padding: '0.3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            {[6, 8, 10, 12, 16, 20].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          桶数量:
          <select value={bucketCount} onChange={e => setBucketCount(Number(e.target.value))}
            style={{ padding: '0.3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            {[3, 4, 5, 6, 8, 10].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          自定义:
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder={dataMode === 'float' ? '如: 0.42,0.32,0.23' : '如: 29,25,3,49'}
            style={{
              padding: '0.3rem 0.5rem', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-primary)', width: '140px', fontSize: '0.85rem',
            }}
          />
        </label>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= totalSteps - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={reset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
          <input type="range" min="100" max="2000" step="100" value={speed}
            onChange={e => setSpeed(Number(e.target.value))} />
          {speed}ms
        </label>
      </div>

      {/* Info bar */}
      <div className="viz-info">
        <span>步骤: {totalSteps > 0 ? currentStep + 1 : 0} / {totalSteps}</span>
        {step && <span style={{ marginLeft: '1.5rem' }}>阶段: {step.phase}</span>}
      </div>

      {/* Input array */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', textAlign: 'center' }}>
          原数组
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
          {inputArray.map((val, i) => (
            <span key={i} style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
            }}>
              {fmt(val)}
            </span>
          ))}
        </div>
      </div>

      {/* Main canvas - Buckets */}
      <div className="viz-canvas" style={{ minHeight: '260px', padding: '1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(bucketCount, 5)}, 1fr)`,
          gap: '8px',
          justifyItems: 'center',
        }}>
          {currentBuckets.map((bucket, bIdx) => {
            const color = BUCKET_COLORS[bIdx % BUCKET_COLORS.length]
            const isHighlighted = bIdx === highlightBucket
            return (
              <div key={bIdx} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  color: color.text,
                  marginBottom: '4px',
                  fontWeight: isHighlighted ? 700 : 400,
                }}>
                  桶 {bIdx}
                </div>
                <div style={{
                  width: '100%',
                  minHeight: '140px',
                  background: isHighlighted ? color.bg : 'var(--bg-card)',
                  border: `2px solid ${isHighlighted ? color.border : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  transition: 'all 0.3s',
                  boxShadow: isHighlighted ? `0 0 12px ${color.border}40` : 'none',
                }}>
                  {bucket.length === 0 ? (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textAlign: 'center', padding: '0.5rem', opacity: 0.5 }}>
                      空
                    </span>
                  ) : (
                    bucket.map((val, eIdx) => {
                      const isElHighlighted = isHighlighted && eIdx === highlightElement
                      return (
                        <div key={eIdx} style={{
                          padding: '3px 6px',
                          borderRadius: '4px',
                          background: isElHighlighted ? color.border : `${color.bg}80`,
                          color: isElHighlighted ? '#fff' : color.text,
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          textAlign: 'center',
                          fontWeight: isElHighlighted ? 700 : 400,
                          transition: 'all 0.3s',
                          border: `1px solid ${isElHighlighted ? color.border : 'transparent'}`,
                        }}>
                          {fmt(val)}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sorted result */}
      {sortedResult.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', textAlign: 'center' }}>
            已收集结果
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
            {sortedResult.map((val, i) => (
              <span key={i} style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: 'var(--radius)',
                background: '#10b98130',
                border: '1px solid #10b981',
                fontSize: '0.85rem',
                color: '#10b981',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}>
                {fmt(val)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {step && (
        <div className="viz-info" style={{ fontWeight: 500, marginTop: '0.5rem' }}>
          {step.description}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', background: 'var(--bg-card)', border: '1px solid var(--border)', marginRight: 4, verticalAlign: 'middle' }} />
          普通桶
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', background: '#3b82f6', marginRight: 4, verticalAlign: 'middle' }} />
          当前操作桶
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', background: '#10b981', marginRight: 4, verticalAlign: 'middle' }} />
          已收集结果
        </span>
      </div>
    </div>
  )
}
