import { useState, useEffect, useRef, useCallback } from 'react'

// --- Types ---

interface Step {
  array: number[]
  countArray: number[]
  outputArray: (number | null)[]
  description: string
  phase: 'counting' | 'prefix' | 'placing' | 'done'
  highlightInputIndex: number
  highlightCountIndex: number
  highlightOutputIndex: number
}

// --- Helpers ---

function generateRandomArray(size: number, maxVal: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * maxVal) + 1)
}

// --- Step Generation ---

function generateSteps(input: number[]): Step[] {
  const steps: Step[] = []
  const arr = [...input]
  const n = arr.length
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const k = max - min + 1
  const count = new Array(k).fill(0)
  const output: (number | null)[] = new Array(n).fill(null)

  // Initial
  steps.push({
    array: [...arr],
    countArray: [...count],
    outputArray: [...output],
    description: `初始数组: [${arr.join(', ')}], 值域 [${min}, ${max}], k=${k}`,
    phase: 'counting',
    highlightInputIndex: -1,
    highlightCountIndex: -1,
    highlightOutputIndex: -1,
  })

  // Phase 1: Count occurrences
  for (let i = 0; i < n; i++) {
    count[arr[i] - min]++
    steps.push({
      array: [...arr],
      countArray: [...count],
      outputArray: [...output],
      description: `统计: arr[${i}]=${arr[i]}, count[${arr[i] - min}] += 1 -> ${count[arr[i] - min]}`,
      phase: 'counting',
      highlightInputIndex: i,
      highlightCountIndex: arr[i] - min,
      highlightOutputIndex: -1,
    })
  }

  // Phase 2: Prefix sum
  const prefixSum = [...count]
  steps.push({
    array: [...arr],
    countArray: [...prefixSum],
    outputArray: [...output],
    description: `前缀和开始: prefixSum[0] = count[0] = ${count[0]}`,
    phase: 'prefix',
    highlightInputIndex: -1,
    highlightCountIndex: 0,
    highlightOutputIndex: -1,
  })

  for (let i = 1; i < k; i++) {
    prefixSum[i] = prefixSum[i - 1] + count[i]
    steps.push({
      array: [...arr],
      countArray: [...prefixSum],
      outputArray: [...output],
      description: `前缀和: prefixSum[${i}] = prefixSum[${i - 1}] + count[${i}] = ${prefixSum[i - 1]} + ${count[i]} = ${prefixSum[i]}`,
      phase: 'prefix',
      highlightInputIndex: -1,
      highlightCountIndex: i,
      highlightOutputIndex: -1,
    })
  }

  // Phase 3: Reverse placement for stability
  const tempPrefix = [...prefixSum]
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i]
    const idx = val - min
    const pos = --tempPrefix[idx]
    output[pos] = val
    steps.push({
      array: [...arr],
      countArray: [...tempPrefix],
      outputArray: [...output],
      description: `放置: arr[${i}]=${val} -> output[${pos}] (反向保证稳定性)`,
      phase: 'placing',
      highlightInputIndex: i,
      highlightCountIndex: idx,
      highlightOutputIndex: pos,
    })
  }

  // Final
  steps.push({
    array: [...arr],
    countArray: [...tempPrefix],
    outputArray: [...output],
    description: `排序完成! 结果: [${output.join(', ')}]`,
    phase: 'done',
    highlightInputIndex: -1,
    highlightCountIndex: -1,
    highlightOutputIndex: -1,
  })

  return steps
}

// --- Component ---

export default function CountingSortVisualization() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const [arraySize, setArraySize] = useState(8)
  const [maxVal, setMaxVal] = useState(15)
  const [customInput, setCustomInput] = useState('')
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
      arr = customInput
        .split(/[,\s]+/)
        .map(Number)
        .filter(n => !isNaN(n) && n > 0)
      if (arr.length === 0) arr = generateRandomArray(arraySize, maxVal)
    } else {
      arr = generateRandomArray(arraySize, maxVal)
    }

    const generatedSteps = generateSteps(arr)
    setSteps(generatedSteps)
    setTotalSteps(generatedSteps.length)
  }, [arraySize, maxVal, customInput])

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
  const array = step?.array ?? []
  const countArray = step?.countArray ?? []
  const outputArray = step?.outputArray ?? []
  const minVal = array.length > 0 ? Math.min(...array) : 0

  const getBarColor = (index: number, type: 'input' | 'count' | 'output') => {
    if (!step) return 'var(--accent)'
    if (type === 'input' && index === step.highlightInputIndex) return '#f59e0b'
    if (type === 'count' && index === step.highlightCountIndex) return '#3b82f6'
    if (type === 'output' && index === step.highlightOutputIndex) return '#10b981'
    return type === 'output' ? 'var(--border)' : 'var(--accent)'
  }

  const maxCountVal = Math.max(...countArray, 1)
  const maxArrayVal = Math.max(...array, 1)

  const phaseLabel: Record<string, string> = {
    counting: '统计计数',
    prefix: '前缀和',
    placing: '放置元素',
    done: '完成',
  }

  return (
    <div className="visualization-container">
      {/* Controls */}
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          数组大小:
          <select
            value={arraySize}
            onChange={e => setArraySize(Number(e.target.value))}
            style={{ padding: '0.3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {[5, 8, 10, 12, 15].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          最大值:
          <select
            value={maxVal}
            onChange={e => setMaxVal(Number(e.target.value))}
            style={{ padding: '0.3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {[9, 15, 20, 30].map(v => <option key={v} value={v}>{v}</option>)}
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
              color: 'var(--text-primary)', width: '140px', fontSize: '0.85rem',
            }}
          />
        </label>

        <button className="btn btn-secondary" onClick={reset}>随机生成</button>
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
        <button className="btn btn-secondary" onClick={reset}>重置</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
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

      {/* Info bar */}
      <div className="viz-info">
        <span>步骤: {totalSteps > 0 ? currentStep + 1 : 0} / {totalSteps}</span>
        {step && <span style={{ marginLeft: '1.5rem' }}>阶段: {phaseLabel[step.phase] ?? step.phase}</span>}
      </div>

      {/* Main canvas */}
      <div className="viz-canvas" style={{ minHeight: '320px', padding: '1rem' }}>
        {/* Input Array */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', textAlign: 'center' }}>
            输入数组
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', height: '110px' }}>
            {array.map((val, i) => {
              const height = (val / maxArrayVal) * 90
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>{val}</span>
                  <div style={{
                    width: '36px',
                    height: `${height}px`,
                    minHeight: '8px',
                    background: getBarColor(i, 'input'),
                    borderRadius: '2px 2px 0 0',
                    transition: 'background 0.3s, height 0.3s',
                  }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px' }}>[{i}]</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Count Array */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', textAlign: 'center' }}>
            计数数组 (索引 = 值 - {minVal})
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', height: '100px' }}>
            {countArray.map((val, i) => {
              const height = (val / maxCountVal) * 70
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 0 0', minWidth: '20px', maxWidth: '40px' }}>
                  <span style={{ fontSize: '0.65rem', color: '#93c5fd', marginBottom: '2px' }}>{val}</span>
                  <div style={{
                    width: '100%',
                    height: `${height}px`,
                    minHeight: val > 0 ? '4px' : '0',
                    background: getBarColor(i, 'count'),
                    borderRadius: '2px 2px 0 0',
                    transition: 'background 0.3s, height 0.3s',
                  }} />
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{i + minVal}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Output Array */}
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.3rem', textAlign: 'center' }}>
            输出数组
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', height: '110px' }}>
            {outputArray.map((val, i) => {
              const height = val !== null ? (val / maxArrayVal) * 90 : 8
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    color: val !== null ? '#10b981' : '#475569',
                    marginBottom: '2px',
                  }}>
                    {val !== null ? val : '-'}
                  </span>
                  <div style={{
                    width: '36px',
                    height: `${height}px`,
                    background: getBarColor(i, 'output'),
                    borderRadius: '2px 2px 0 0',
                    transition: 'background 0.3s, height 0.3s',
                    opacity: val !== null ? 1 : 0.3,
                  }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px' }}>[{i}]</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Description */}
      {step && (
        <div className="viz-info" style={{ fontWeight: 500 }}>
          {step.description}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', background: '#f59e0b', marginRight: 4, verticalAlign: 'middle' }} />
          当前元素
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', background: '#3b82f6', marginRight: 4, verticalAlign: 'middle' }} />
          计数更新
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '2px', background: '#10b981', marginRight: 4, verticalAlign: 'middle' }} />
          输出填充
        </span>
      </div>
    </div>
  )
}
