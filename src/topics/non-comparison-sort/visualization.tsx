import { useState, useEffect, useRef, useCallback } from 'react'

// --- Types ---

type SortMode = 'counting' | 'radix'

interface Step {
  array: number[]
  countArray?: number[]
  outputArray?: (number | null)[]
  description: string
  phase: string
  highlightIndices: number[]
  highlightCountIndices: number[]
  activeDigit?: number
}

// --- Helpers ---

function generateRandomArray(size: number, maxVal: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * maxVal) + 1)
}

// --- Counting Sort Steps ---

function generateCountingSortSteps(input: number[]): Step[] {
  const steps: Step[] = []
  const arr = [...input]
  const n = arr.length
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const k = max - min + 1
  const count = new Array(k).fill(0)
  const output: (number | null)[] = new Array(n).fill(null)

  steps.push({
    array: [...arr],
    countArray: [...count],
    outputArray: [...output],
    description: `初始数组，值域范围 [${min}, ${max}]，k=${k}`,
    phase: '初始化',
    highlightIndices: [],
    highlightCountIndices: [],
  })

  // Step 1: Count occurrences
  for (let i = 0; i < n; i++) {
    count[arr[i] - min]++
    steps.push({
      array: [...arr],
      countArray: [...count],
      outputArray: [...output],
      description: `统计 arr[${i}]=${arr[i]}，count[${arr[i] - min}]++ = ${count[arr[i] - min]}`,
      phase: '统计次数',
      highlightIndices: [i],
      highlightCountIndices: [arr[i] - min],
    })
  }

  // Step 2: Prefix sum
  for (let i = 1; i < k; i++) {
    count[i] += count[i - 1]
    steps.push({
      array: [...arr],
      countArray: [...count],
      outputArray: [...output],
      description: `前缀和: count[${i}] += count[${i - 1}] = ${count[i]}`,
      phase: '前缀和',
      highlightIndices: [],
      highlightCountIndices: [i, i - 1],
    })
  }

  // Step 3: Place elements (from back to front for stability)
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i]
    const idx = val - min
    const pos = --count[idx]
    output[pos] = val
    steps.push({
      array: [...arr],
      countArray: [...count],
      outputArray: [...output],
      description: `放置: arr[${i}]=${val} → 输出位置 ${pos}（从后往前保证稳定性）`,
      phase: '放置元素',
      highlightIndices: [i],
      highlightCountIndices: [idx],
    })
  }

  // Final
  steps.push({
    array: [...arr],
    countArray: [...count],
    outputArray: [...output],
    description: '计数排序完成！',
    phase: '完成',
    highlightIndices: [],
    highlightCountIndices: [],
  })

  return steps
}

// --- Radix Sort Steps ---

function generateRadixSortSteps(input: number[]): Step[] {
  const steps: Step[] = []
  let arr = [...input]
  const max = Math.max(...arr)

  steps.push({
    array: [...arr],
    description: `初始数组，最大值=${max}`,
    phase: '初始化',
    highlightIndices: [],
    highlightCountIndices: [],
  })

  let round = 0
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    round++
    const digitName = exp === 1 ? '个位' : exp === 10 ? '十位' : exp === 100 ? '百位' : `10^${Math.log10(exp)}位`

    steps.push({
      array: [...arr],
      description: `第${round}轮: 按${digitName}排序`,
      phase: `按${digitName}排序`,
      highlightIndices: [],
      highlightCountIndices: [],
      activeDigit: exp,
    })

    // Show each element's current digit
    const digitCount = new Array(10).fill(0)
    for (const x of arr) digitCount[Math.floor(x / exp) % 10]++

    steps.push({
      array: [...arr],
      countArray: [...digitCount],
      description: `统计每位的${digitName}值分布`,
      phase: `统计${digitName}`,
      highlightIndices: arr.map((_, i) => i),
      highlightCountIndices: digitCount.map((_, i) => i).filter(i => digitCount[i] > 0),
      activeDigit: exp,
    })

    // Prefix sum
    for (let i = 1; i < 10; i++) digitCount[i] += digitCount[i - 1]

    steps.push({
      array: [...arr],
      countArray: [...digitCount],
      description: `计算前缀和`,
      phase: `前缀和`,
      highlightIndices: [],
      highlightCountIndices: Array.from({ length: 10 }, (_, i) => i),
      activeDigit: exp,
    })

    // Place elements
    const sorted = new Array(arr.length)
    for (let i = arr.length - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10
      sorted[--digitCount[digit]] = arr[i]
    }
    arr = sorted

    steps.push({
      array: [...arr],
      countArray: [...digitCount],
      description: `按${digitName}排序完成: [${arr.join(', ')}]`,
      phase: `${digitName}排序完成`,
      highlightIndices: arr.map((_, i) => i),
      highlightCountIndices: [],
      activeDigit: exp,
    })
  }

  steps.push({
    array: [...arr],
    description: '基数排序完成！',
    phase: '完成',
    highlightIndices: [],
    highlightCountIndices: [],
  })

  return steps
}

// --- Component ---

export default function NonComparisonSortVisualization() {
  const [mode, setMode] = useState<SortMode>('counting')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const [arraySize, setArraySize] = useState(12)
  const [maxVal, setMaxVal] = useState(20)
  const [customInput, setCustomInput] = useState('')
  const timerRef = useRef<number | null>(null)

  // Generate steps
  const initDemo = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    let arr: number[]
    if (customInput.trim()) {
      arr = customInput.split(/[,\s]+/).map(Number).filter(n => !isNaN(n) && n > 0)
      if (arr.length === 0) arr = generateRandomArray(arraySize, maxVal)
    } else {
      arr = generateRandomArray(arraySize, maxVal)
    }

    let generatedSteps: Step[]
    if (mode === 'counting') {
      generatedSteps = generateCountingSortSteps(arr)
    } else {
      generatedSteps = generateRadixSortSteps(arr)
    }

    setSteps(generatedSteps)
    setTotalSteps(generatedSteps.length)
  }, [mode, arraySize, maxVal, customInput])

  // Apply step (no-op, step state is derived from currentStep)
  const applyStep = useCallback((_stepIdx: number) => {
    // Step data is derived directly from steps[currentStep]
  }, [])

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= totalSteps) {
      setIsPlaying(false)
      return
    }
    applyStep(currentStep)
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
  }, [isPlaying, currentStep, totalSteps, speed, applyStep])

  // Controls
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
    if (next < totalSteps) {
      setCurrentStep(next)
      applyStep(next)
    }
  }

  const stepBackward = () => {
    setIsPlaying(false)
    const prev = currentStep - 1
    if (prev >= 0) {
      setCurrentStep(prev)
      applyStep(prev)
    }
  }

  const reset = () => { initDemo() }

  useEffect(() => { initDemo() }, [initDemo])

  // Current step data
  const step = steps[currentStep]
  const array = step?.array ?? []
  const countArray = step?.countArray
  const outputArray = step?.outputArray
  const highlightIndices = step?.highlightIndices ?? []
  const highlightCountIndices = step?.highlightCountIndices ?? []
  const activeDigit = step?.activeDigit

  // Bar rendering
  const maxArrayVal = Math.max(...array, 1)
  const barWidth = Math.max(20, Math.min(50, 500 / Math.max(array.length, 1)))

  return (
    <div className="visualization-container">
      {/* Mode selector */}
      <div className="viz-controls">
        <select
          value={mode}
          onChange={e => setMode(e.target.value as SortMode)}
          style={{
            padding: '0.5rem 1rem', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer',
          }}
        >
          <option value="counting">计数排序</option>
          <option value="radix">基数排序</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          数组大小:
          <select value={arraySize} onChange={e => setArraySize(Number(e.target.value))}
            style={{ padding: '0.3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            {[6, 8, 10, 12, 15].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          最大值:
          <select value={maxVal} onChange={e => setMaxVal(Number(e.target.value))}
            style={{ padding: '0.3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          自定义:
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="如: 4,2,2,8,3"
            style={{
              padding: '0.3rem 0.5rem', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-primary)', width: '120px', fontSize: '0.85rem',
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

      {/* Main canvas */}
      <div className="viz-canvas" style={{ minHeight: '280px', padding: '1rem' }}>
        {/* Original array bars */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', textAlign: 'center' }}>
            原数组
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '120px' }}>
            {array.map((val, i) => {
              const isHighlighted = highlightIndices.includes(i)
              const height = (val / maxArrayVal) * 100
              let bg = 'var(--accent)'
              if (isHighlighted) bg = '#f59e0b'
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>{val}</span>
                  <div style={{
                    width: `${barWidth}px`,
                    height: `${height}px`,
                    background: bg,
                    borderRadius: '2px 2px 0 0',
                    transition: 'all 0.3s',
                  }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{i}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Count array (for counting sort or radix sort digit distribution) */}
        {countArray && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', textAlign: 'center' }}>
              {mode === 'counting' ? '计数数组' : '数位分布'}
              {activeDigit !== undefined && mode === 'radix' && ` (${activeDigit === 1 ? '个位' : activeDigit === 10 ? '十位' : '百位'})`}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '80px' }}>
              {countArray.map((val, i) => {
                const isHighlighted = highlightCountIndices.includes(i)
                const maxCount = Math.max(...countArray, 1)
                const height = (val / maxCount) * 60
                let bg = 'var(--bg-card)'
                if (isHighlighted) bg = '#10b981'
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>{val}</span>
                    <div style={{
                      width: `${Math.max(barWidth, 20)}px`,
                      height: `${Math.max(height, 4)}px`,
                      background: bg,
                      borderRadius: '2px 2px 0 0',
                      transition: 'all 0.3s',
                      border: isHighlighted ? '2px solid #f59e0b' : '1px solid var(--border)',
                    }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {mode === 'counting' ? i + (Math.min(...array)) : i}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Output array (for counting sort) */}
        {outputArray && mode === 'counting' && (
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', textAlign: 'center' }}>
              输出数组
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '80px' }}>
              {outputArray.map((val, i) => {
                const height = val !== null ? (val / maxArrayVal) * 60 : 4
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                      {val !== null ? val : ''}
                    </span>
                    <div style={{
                      width: `${barWidth}px`,
                      height: `${Math.max(height, 4)}px`,
                      background: val !== null ? '#10b981' : 'var(--bg-card)',
                      borderRadius: '2px 2px 0 0',
                      transition: 'all 0.3s',
                      border: '1px solid var(--border)',
                    }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{i}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {step && (
        <div className="viz-info" style={{ fontWeight: 500, marginTop: '0.5rem' }}>
          {step.description}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', background: 'var(--accent)', marginRight: 4, verticalAlign: 'middle' }} />
          待处理
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', background: '#f59e0b', marginRight: 4, verticalAlign: 'middle' }} />
          当前处理
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', background: '#10b981', marginRight: 4, verticalAlign: 'middle' }} />
          已完成/命中
        </span>
      </div>
    </div>
  )
}
