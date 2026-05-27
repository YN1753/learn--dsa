import { useState, useEffect, useRef, useCallback } from 'react'

interface DequeElement {
  value: number
  index: number
}

interface MQStep {
  array: number[]
  deque: DequeElement[]
  windowLeft: number
  windowRight: number
  currentIndex: number
  action: 'push' | 'pop-expired' | 'remove-back' | 'query' | 'init' | 'done'
  description: string
  result: number[]
  maxValue: number | null
  removedFromBack: number[]
  removedFromFront: number | null
}

type MQMode = 'max' | 'min'

const SAMPLE_ARRAYS = [
  { arr: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 },
  { arr: [9, 11, 8, 5, 7, 10, 4, 3, 2], k: 4 },
  { arr: [4, 3, 2, 1, 5, 6, 7, 8], k: 3 },
  { arr: [5, 3, 4, 2, 6, 1, 8, 7], k: 4 },
]

function generateSteps(arr: number[], k: number, mode: MQMode): MQStep[] {
  const steps: MQStep[] = []
  const deque: DequeElement[] = []
  const result: number[] = []

  // 初始状态
  steps.push({
    array: [...arr],
    deque: [],
    windowLeft: 0,
    windowRight: -1,
    currentIndex: -1,
    action: 'init',
    description: `初始化：数组长度 ${arr.length}，窗口大小 k=${k}，模式：求${mode === 'max' ? '最大值' : '最小值'}`,
    result: [],
    maxValue: null,
    removedFromBack: [],
    removedFromFront: null,
  })

  for (let i = 0; i < arr.length; i++) {
    // 步骤1：移除队尾破坏单调性的元素
    const removedBack: number[] = []
    if (mode === 'max') {
      while (deque.length > 0 && deque[deque.length - 1].value < arr[i]) {
        const removed = deque.pop()!
        removedBack.push(removed.value)
      }
    } else {
      while (deque.length > 0 && deque[deque.length - 1].value > arr[i]) {
        const removed = deque.pop()!
        removedBack.push(removed.value)
      }
    }

    if (removedBack.length > 0) {
      steps.push({
        array: [...arr],
        deque: deque.map(d => ({ ...d })),
        windowLeft: Math.max(0, i - k + 1),
        windowRight: i,
        currentIndex: i,
        action: 'remove-back',
        description: `加入 ${arr[i]}：移除队尾 [${removedBack.join(', ')}]（${mode === 'max' ? '小于' : '大于'} ${arr[i]}）`,
        result: [...result],
        maxValue: deque.length > 0 ? deque[0].value : null,
        removedFromBack: removedBack,
        removedFromFront: null,
      })
    }

    // 步骤2：加入新元素
    deque.push({ value: arr[i], index: i })

    steps.push({
      array: [...arr],
      deque: deque.map(d => ({ ...d })),
      windowLeft: Math.max(0, i - k + 1),
      windowRight: i,
      currentIndex: i,
      action: 'push',
      description: `将 ${arr[i]}（索引 ${i}）加入队尾`,
      result: [...result],
      maxValue: deque[0].value,
      removedFromBack: removedBack,
      removedFromFront: null,
    })

    // 步骤3：移除过期元素
    let removedFront: number | null = null
    if (deque[0].index < i - k + 1) {
      const expired = deque.shift()!
      removedFront = expired.value

      steps.push({
        array: [...arr],
        deque: deque.map(d => ({ ...d })),
        windowLeft: i - k + 1,
        windowRight: i,
        currentIndex: i,
        action: 'pop-expired',
        description: `移除过期元素 ${expired.value}（索引 ${expired.index}，不在窗口 [${i - k + 1}, ${i}] 内）`,
        result: [...result],
        maxValue: deque.length > 0 ? deque[0].value : null,
        removedFromBack: [],
        removedFromFront: removedFront,
      })
    }

    // 步骤4：记录结果
    if (i >= k - 1) {
      const maxVal = deque[0].value
      result.push(maxVal)

      const windowArr = arr.slice(i - k + 1, i + 1)
      steps.push({
        array: [...arr],
        deque: deque.map(d => ({ ...d })),
        windowLeft: i - k + 1,
        windowRight: i,
        currentIndex: i,
        action: 'query',
        description: `窗口 [${windowArr.join(', ')}]，${mode === 'max' ? '最大' : '最小'}值 = ${maxVal}（队首元素）`,
        result: [...result],
        maxValue: maxVal,
        removedFromBack: [],
        removedFromFront: null,
      })
    }
  }

  // 完成
  steps.push({
    array: [...arr],
    deque: [],
    windowLeft: arr.length - k,
    windowRight: arr.length - 1,
    currentIndex: arr.length,
    action: 'done',
    description: `完成！结果: [${result.join(', ')}]`,
    result: [...result],
    maxValue: null,
    removedFromBack: [],
    removedFromFront: null,
  })

  return steps
}

export default function MonotonicQueueVisualization() {
  const [mode, setMode] = useState<MQMode>('max')
  const [sampleIdx, setSampleIdx] = useState(0)
  const [windowSize, setWindowSize] = useState(SAMPLE_ARRAYS[0].k)
  const [inputArray, setInputArray] = useState<number[]>(SAMPLE_ARRAYS[0].arr)
  const [steps, setSteps] = useState<MQStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(900)
  const timerRef = useRef<number | null>(null)

  const generateNewSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setCurrentStep(0)
    const k = Math.min(Math.max(windowSize, 1), inputArray.length)
    setSteps(generateSteps(inputArray, k, mode))
  }, [inputArray, windowSize, mode])

  useEffect(() => {
    generateNewSteps()
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

  const handleSampleChange = useCallback((idx: number) => {
    setSampleIdx(idx)
    const sample = SAMPLE_ARRAYS[idx]
    setInputArray(sample.arr)
    setWindowSize(sample.k)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const current = steps[currentStep] || steps[0] || {
    array: [],
    deque: [],
    windowLeft: 0,
    windowRight: -1,
    currentIndex: -1,
    action: 'init' as const,
    description: '点击"生成步骤"或"播放"开始演示',
    result: [],
    maxValue: null,
    removedFromBack: [],
    removedFromFront: null,
  }

  const maxVal = Math.max(...(current.array.length > 0 ? current.array : [1]))

  const getBarColor = (index: number): string => {
    if (current.action === 'done') return '#22c55e'
    if (index >= current.windowLeft && index <= current.windowRight) {
      if (index === current.currentIndex) return '#f59e0b'
      return '#3b82f6'
    }
    return '#374151'
  }

  const getBarBorder = (index: number): string => {
    if (current.action === 'done') return '2px solid #4ade80'
    if (index === current.windowLeft && index <= current.windowRight) return '2px solid #60a5fa'
    if (index === current.windowRight && index >= current.windowLeft) return '2px solid #a78bfa'
    return '1px solid #4b5563'
  }

  const isInDeque = (index: number): boolean => {
    return current.deque.some(d => d.index === index)
  }

  return (
    <div className="visualization-container">
      {/* Controls */}
      <div className="viz-controls">
        <select
          value={mode}
          onChange={e => {
            setMode(e.target.value as MQMode)
            setIsPlaying(false)
            setCurrentStep(0)
            if (timerRef.current) {
              clearTimeout(timerRef.current)
              timerRef.current = null
            }
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
          <option value="max">单调递减（求最大值）</option>
          <option value="min">单调递增（求最小值）</option>
        </select>

        <select
          value={sampleIdx}
          onChange={e => handleSampleChange(Number(e.target.value))}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        >
          {SAMPLE_ARRAYS.map((s, i) => (
            <option key={i} value={i}>
              示例 {i + 1}: [{s.arr.join(', ')}] k={s.k}
            </option>
          ))}
        </select>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          窗口 k:
          <input
            type="number"
            min="1"
            max={inputArray.length}
            value={windowSize}
            onChange={e => setWindowSize(Math.max(1, Math.min(Number(e.target.value), inputArray.length)))}
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              width: '60px',
              textAlign: 'center',
            }}
          />
        </label>

        <button className="btn btn-primary" onClick={generateNewSteps}>
          生成步骤
        </button>
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
            min="300"
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

      {/* Array visualization with bars */}
      <div
        className="viz-canvas"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          minHeight: '280px',
          padding: '1rem 0.5rem',
        }}
      >
        {/* Index labels */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {current.array.map((_, index) => (
            <div
              key={`idx-${index}`}
              style={{
                width: '48px',
                textAlign: 'center',
                fontSize: '0.7rem',
                color: index === current.currentIndex ? '#f59e0b' : 'var(--text-secondary)',
                fontWeight: index === current.currentIndex ? 'bold' : 'normal',
              }}
            >
              [{index}]
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'flex-end',
            justifyContent: 'center',
            height: '120px',
            flexWrap: 'wrap',
          }}
        >
          {current.array.map((value, index) => {
            const barHeight = Math.max(20, (Math.abs(value) / Math.max(maxVal, 1)) * 100)
            const inWindow = index >= current.windowLeft && index <= current.windowRight
            return (
              <div
                key={`bar-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontFamily: 'Consolas, Monaco, monospace',
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    width: '44px',
                    height: `${barHeight}px`,
                    background: getBarColor(index),
                    borderRadius: '4px 4px 0 0',
                    border: getBarBorder(index),
                    transition: 'all 0.3s ease',
                    opacity: inWindow || current.action === 'done' ? 1 : 0.35,
                    position: 'relative',
                  }}
                >
                  {isInDeque(index) && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.6rem',
                        color: '#fff',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      DQ
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Window range indicator */}
        {current.windowLeft <= current.windowRight && current.windowRight < current.array.length && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {current.array.map((_, index) => (
              <div
                key={`win-${index}`}
                style={{
                  width: '48px',
                  textAlign: 'center',
                  fontSize: '0.65rem',
                  height: '14px',
                }}
              >
                {index === current.windowLeft ? (
                  <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>L</span>
                ) : index === current.windowRight ? (
                  <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>R</span>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Deque visualization */}
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(59, 130, 246, 0.08)',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            minWidth: '200px',
            maxWidth: '90%',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.4rem',
              fontWeight: 'bold',
            }}
          >
            双端队列 (deque) — {mode === 'max' ? '单调递减' : '单调递增'}：
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>队首(最大) →</span>
            {current.deque.length === 0 ? (
              <span
                style={{
                  padding: '0.3rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(107, 114, 128, 0.3)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontStyle: 'italic',
                }}
              >
                空
              </span>
            ) : (
              current.deque.map((elem, idx) => (
                <div
                  key={`dq-${idx}`}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '6px',
                    background: idx === 0 ? '#22c55e' : elem.value === current.maxValue ? '#16a34a' : '#3b82f6',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    fontFamily: 'Consolas, Monaco, monospace',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1px',
                    border: idx === 0 ? '2px solid #4ade80' : 'none',
                  }}
                >
                  <span>{elem.value}</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>i={elem.index}</span>
                </div>
              ))
            )}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>→ 队尾</span>
          </div>
        </div>

        {/* Result display */}
        {current.result.length > 0 && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.4rem 0.8rem',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
            }}
          >
            结果: [{current.result.join(', ')}]
          </div>
        )}
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
          <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
          窗口内
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }} />
          当前处理
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
          队首(最值)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#374151', borderRadius: '2px', display: 'inline-block', opacity: 0.5 }} />
          窗口外
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontSize: '0.65rem', padding: '0 4px', background: '#3b82f6', borderRadius: '3px', color: '#fff' }}>DQ</span>
          在队列中
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
          }}
        >
          <span>模式: {mode === 'max' ? '单调递减（求最大值）' : '单调递增（求最小值）'}</span>
          {current.windowLeft <= current.windowRight && (
            <span>
              窗口: [{current.windowLeft}, {current.windowRight}]
            </span>
          )}
          <span>队列大小: {current.deque.length}</span>
          {current.maxValue !== null && (
            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
              队首(最值): {current.maxValue}
            </span>
          )}
        </div>
        {current.removedFromBack.length > 0 && (
          <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#ef4444' }}>
            被移除的队尾元素: [{current.removedFromBack.join(', ')}]
          </div>
        )}
        {current.removedFromFront !== null && (
          <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#f59e0b' }}>
            被移除的过期元素: {current.removedFromFront}
          </div>
        )}
      </div>
    </div>
  )
}
