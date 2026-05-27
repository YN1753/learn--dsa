import { useState, useEffect, useRef, useCallback } from 'react'

interface PrefixSumStep {
  originalArray: number[]
  prefixSumArray: number[]
  currentBuildIndex: number  // 正在构建的前缀和索引，-1 表示构建完成
  queryL: number  // 查询左边界（1-indexed），-1 表示无查询
  queryR: number  // 查询右边界（1-indexed）
  queryResult: number
  description: string
  phase: 'build' | 'query' | 'idle'
}

const SAMPLE_ARRAYS = [
  [3, 1, 4, 1, 5, 9, 2, 6],
  [2, 5, 3, 8, 1, 4, 6, 7],
  [1, -2, 3, -4, 5, -6, 7],
  [10, 20, 30, 40, 50],
]

function buildPrefixSum(arr: number[]): number[] {
  const sum = new Array(arr.length + 1).fill(0)
  for (let i = 1; i <= arr.length; i++) {
    sum[i] = sum[i - 1] + arr[i - 1]
  }
  return sum
}

function generateBuildSteps(arr: number[]): PrefixSumStep[] {
  const steps: PrefixSumStep[] = []
  const sum = new Array(arr.length + 1).fill(0)

  steps.push({
    originalArray: [...arr],
    prefixSumArray: [...sum],
    currentBuildIndex: 0,
    queryL: -1,
    queryR: -1,
    queryResult: 0,
    description: '初始化前缀和数组，sum[0] = 0（哨兵值）',
    phase: 'build',
  })

  for (let i = 1; i <= arr.length; i++) {
    sum[i] = sum[i - 1] + arr[i - 1]
    const parts = arr.slice(0, i).join(' + ')
    steps.push({
      originalArray: [...arr],
      prefixSumArray: [...sum],
      currentBuildIndex: i,
      queryL: -1,
      queryR: -1,
      queryResult: 0,
      description: `sum[${i}] = sum[${i - 1}] + arr[${i - 1}] = ${sum[i - 1]} + ${arr[i - 1]} = ${sum[i]}  （${parts}）`,
      phase: 'build',
    })
  }

  steps.push({
    originalArray: [...arr],
    prefixSumArray: [...sum],
    currentBuildIndex: -1,
    queryL: -1,
    queryR: -1,
    queryResult: 0,
    description: '前缀和数组构建完成！现在可以进行 O(1) 区间查询',
    phase: 'build',
  })

  return steps
}

function generateQuerySteps(arr: number[], sum: number[], l: number, r: number): PrefixSumStep[] {
  const steps: PrefixSumStep[] = []

  steps.push({
    originalArray: [...arr],
    prefixSumArray: [...sum],
    currentBuildIndex: -1,
    queryL: l,
    queryR: r,
    queryResult: 0,
    description: `查询区间 [${l}, ${r}] 的和`,
    phase: 'query',
  })

  steps.push({
    originalArray: [...arr],
    prefixSumArray: [...sum],
    currentBuildIndex: -1,
    queryL: l,
    queryR: r,
    queryResult: 0,
    description: `读取 sum[${r}] = ${sum[r]}（前 ${r} 个元素的和）`,
    phase: 'query',
  })

  steps.push({
    originalArray: [...arr],
    prefixSumArray: [...sum],
    currentBuildIndex: -1,
    queryL: l,
    queryR: r,
    queryResult: 0,
    description: `读取 sum[${l - 1}] = ${sum[l - 1]}（前 ${l - 1} 个元素的和）`,
    phase: 'query',
  })

  const result = sum[r] - sum[l - 1]
  const elements = arr.slice(l - 1, r).join(' + ')
  steps.push({
    originalArray: [...arr],
    prefixSumArray: [...sum],
    currentBuildIndex: -1,
    queryL: l,
    queryR: r,
    queryResult: result,
    description: `sum[${r}] - sum[${l - 1}] = ${sum[r]} - ${sum[l - 1]} = ${result}  （${elements} = ${result}）`,
    phase: 'query',
  })

  return steps
}

export default function PrefixSumVisualization() {
  const [inputArray, setInputArray] = useState<number[]>(SAMPLE_ARRAYS[0])
  const [buildSteps, setBuildSteps] = useState<PrefixSumStep[]>([])
  const [querySteps, setQuerySteps] = useState<PrefixSumStep[]>([])
  const [allSteps, setAllSteps] = useState<PrefixSumStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [queryL, setQueryL] = useState(2)
  const [queryR, setQueryR] = useState(5)
  const timerRef = useRef<number | null>(null)

  const doBuild = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setCurrentStep(0)
    const steps = generateBuildSteps(inputArray)
    setBuildSteps(steps)
    setQuerySteps([])
    setAllSteps(steps)
  }, [inputArray])

  const doQuery = useCallback(() => {
    const sum = buildPrefixSum(inputArray)
    const l = Math.max(1, Math.min(queryL, inputArray.length))
    const r = Math.max(l, Math.min(queryR, inputArray.length))
    const steps = generateQuerySteps(inputArray, sum, l, r)
    setQuerySteps(steps)
    const combined = [...buildSteps, ...steps]
    setAllSteps(combined)
    setCurrentStep(buildSteps.length)
    setIsPlaying(false)
  }, [inputArray, queryL, queryR, buildSteps])

  useEffect(() => {
    doBuild()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isPlaying || allSteps.length === 0) return

    if (currentStep >= allSteps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, allSteps.length - 1))
    }, speed)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, allSteps, speed])

  const togglePlay = useCallback(() => {
    if (allSteps.length === 0) return
    if (currentStep >= allSteps.length - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }, [allSteps, currentStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < allSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, allSteps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const handleRandomize = useCallback(() => {
    const idx = Math.floor(Math.random() * SAMPLE_ARRAYS.length)
    setInputArray(SAMPLE_ARRAYS[idx])
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setCurrentStep(0)
    setQuerySteps([])
  }, [])

  const current = allSteps[currentStep] || allSteps[0] || {
    originalArray: [],
    prefixSumArray: [],
    currentBuildIndex: -1,
    queryL: -1,
    queryR: -1,
    queryResult: 0,
    description: '点击"构建前缀和"开始演示',
    phase: 'idle' as const,
  }

  const getOriginalBoxColor = (index: number): string => {
    // 如果在查询阶段，高亮查询区间内的原数组元素
    if (current.phase === 'query' && current.queryL >= 0) {
      const l = current.queryL - 1
      const r = current.queryR - 1
      if (index >= l && index <= r) {
        return '#3b82f6'
      }
    }
    // 如果在构建阶段，高亮当前正在累加的元素
    if (current.phase === 'build' && current.currentBuildIndex > 0) {
      if (index < current.currentBuildIndex) {
        return '#3b82f6'
      }
    }
    return '#374151'
  }

  const getSumBoxColor = (index: number): string => {
    if (current.phase === 'build' && index === current.currentBuildIndex) {
      return '#22c55e'
    }
    if (current.phase === 'build' && index === current.currentBuildIndex - 1) {
      return '#f59e0b'
    }
    if (current.phase === 'query' && current.queryL >= 0) {
      if (index === current.queryR) return '#22c55e'
      if (index === current.queryL - 1) return '#ef4444'
    }
    if (index === 0) return '#4b5563'
    if (index <= current.currentBuildIndex) return '#1e40af'
    return '#374151'
  }

  const getSumBoxBorder = (index: number): string => {
    if (current.phase === 'build' && index === current.currentBuildIndex) {
      return '3px solid #4ade80'
    }
    if (current.phase === 'build' && index === current.currentBuildIndex - 1) {
      return '3px solid #fbbf24'
    }
    if (current.phase === 'query' && current.queryL >= 0) {
      if (index === current.queryR) return '3px solid #4ade80'
      if (index === current.queryL - 1) return '3px solid #f87171'
    }
    return '1px solid #4b5563'
  }

  return (
    <div className="visualization-container">
      {/* Controls */}
      <div className="viz-controls">
        <select
          value={SAMPLE_ARRAYS.findIndex(a => a.length === inputArray.length && a.every((v, i) => v === inputArray[i]))}
          onChange={e => {
            const idx = Number(e.target.value)
            setInputArray(SAMPLE_ARRAYS[idx])
            if (timerRef.current) {
              clearTimeout(timerRef.current)
              timerRef.current = null
            }
            setIsPlaying(false)
            setCurrentStep(0)
            setQuerySteps([])
          }}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        >
          {SAMPLE_ARRAYS.map((arr, idx) => (
            <option key={idx} value={idx}>
              [{arr.join(', ')}]
            </option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={doBuild}>
          构建前缀和
        </button>
        <button className="btn btn-secondary" onClick={handleRandomize}>
          随机数据
        </button>
      </div>

      {/* Query controls */}
      <div className="viz-controls">
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          l:
          <input
            type="number"
            min="1"
            max={inputArray.length}
            value={queryL}
            onChange={e => setQueryL(Math.max(1, Math.min(Number(e.target.value), inputArray.length)))}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              width: '50px',
              textAlign: 'center',
            }}
          />
        </label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          r:
          <input
            type="number"
            min="1"
            max={inputArray.length}
            value={queryR}
            onChange={e => setQueryR(Math.max(1, Math.min(Number(e.target.value), inputArray.length)))}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              width: '50px',
              textAlign: 'center',
            }}
          />
        </label>
        <button className="btn btn-primary" onClick={doQuery}>
          查询区间和
        </button>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : currentStep >= allSteps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= allSteps.length - 1}>
          下一步
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setIsPlaying(false)
            setCurrentStep(0)
          }}
        >
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
            min="200"
            max="2000"
            step="100"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          {speed}ms
        </label>
      </div>

      {/* Progress bar */}
      {allSteps.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 0.25rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
            {currentStep + 1}/{allSteps.length}
          </span>
          <input
            type="range"
            min="0"
            max={allSteps.length - 1}
            value={currentStep}
            onChange={e => {
              setIsPlaying(false)
              setCurrentStep(Number(e.target.value))
            }}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* Visualization */}
      <div
        className="viz-canvas"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          minHeight: '250px',
          padding: '1.5rem 0.5rem',
        }}
      >
        {/* Original array */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            原始数组 arr[]
          </div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {current.originalArray.map((_, index) => (
              <div
                key={`idx-${index}`}
                style={{
                  width: '48px',
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  color: current.phase === 'query' && current.queryL >= 0 &&
                    index >= current.queryL - 1 && index <= current.queryR - 1
                    ? '#60a5fa'
                    : 'var(--text-secondary)',
                }}
              >
                [{index + 1}]
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
            {current.originalArray.map((value, index) => (
              <div
                key={`arr-${index}`}
                style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  background: getOriginalBoxColor(index),
                  border: current.phase === 'query' && current.queryL >= 0 &&
                    index >= current.queryL - 1 && index <= current.queryR - 1
                    ? '3px solid #60a5fa'
                    : '1px solid #4b5563',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  fontFamily: 'Consolas, Monaco, monospace',
                  transition: 'all 0.3s ease',
                }}
              >
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* Prefix sum array */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            前缀和数组 sum[]
          </div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {current.prefixSumArray.map((_, index) => (
              <div
                key={`sidx-${index}`}
                style={{
                  width: '48px',
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  color: current.phase === 'query' && current.queryL >= 0 &&
                    (index === current.queryR || index === current.queryL - 1)
                    ? '#4ade80'
                    : 'var(--text-secondary)',
                }}
              >
                [{index}]
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
            {current.prefixSumArray.map((value, index) => (
              <div
                key={`sum-${index}`}
                style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  background: getSumBoxColor(index),
                  border: getSumBoxBorder(index),
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  fontFamily: 'Consolas, Monaco, monospace',
                  transition: 'all 0.3s ease',
                }}
              >
                {value}
              </div>
            ))}
          </div>
          {/* Labels for query */}
          {current.phase === 'query' && current.queryL >= 0 && (
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
              {current.prefixSumArray.map((_, index) => (
                <div
                  key={`ql-${index}`}
                  style={{
                    width: '48px',
                    textAlign: 'center',
                    fontSize: '0.65rem',
                    height: '16px',
                  }}
                >
                  {index === current.queryR
                    ? <span style={{ color: '#4ade80', fontWeight: 'bold' }}>sum[r]</span>
                    : index === current.queryL - 1
                      ? <span style={{ color: '#f87171', fontWeight: 'bold' }}>sum[l-1]</span>
                      : null
                  }
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          padding: '0.25rem 0',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
          当前构建 / sum[r]
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }} />
          前一个累加值
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px', display: 'inline-block' }} />
          sum[l-1]
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
          查询区间 / 已构建
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        {current.phase === 'query' && current.queryL >= 0 && (
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
            <span>查询区间: [{current.queryL}, {current.queryR}]</span>
            <span>公式: sum[{current.queryR}] - sum[{current.queryL - 1}]</span>
            {current.queryResult !== 0 && (
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>结果: {current.queryResult}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
