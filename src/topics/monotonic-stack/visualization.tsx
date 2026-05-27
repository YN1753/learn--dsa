import { useState, useEffect, useRef, useCallback } from 'react'

interface StackItem {
  index: number
  value: number
}

interface NgeStep {
  array: number[]
  action: 'compare' | 'pop' | 'push' | 'found' | 'done'
  currentIndex: number
  stack: StackItem[]
  result: number[]
  description: string
  comparingWith?: number
  poppedItem?: StackItem
  foundAnswer?: { index: number; value: number; answer: number }
}

const SAMPLE_ARRAYS = [
  [2, 1, 2, 4, 3],
  [3, 1, 4, 1, 5, 9, 2, 6],
  [5, 3, 4, 7, 1, 8, 2, 6],
  [9, 2, 8, 1, 5, 4, 3, 7],
  [1, 3, 2, 4, 6, 5],
  [6, 5, 4, 3, 2, 1],
]

function generateNgeSteps(arr: number[]): NgeStep[] {
  const steps: NgeStep[] = []
  const n = arr.length
  const result = new Array(n).fill(-1)
  const stack: StackItem[] = []

  steps.push({
    array: [...arr],
    action: 'compare',
    currentIndex: 0,
    stack: [],
    result: [...result],
    description: '初始化：空栈，结果数组全部为 -1',
  })

  for (let i = 0; i < n; i++) {
    // Show we're processing current element
    steps.push({
      array: [...arr],
      action: 'compare',
      currentIndex: i,
      stack: stack.map(s => ({ ...s })),
      result: [...result],
      description: `处理 arr[${i}] = ${arr[i]}，检查是否比栈顶大`,
    })

    while (stack.length > 0 && arr[i] > stack[stack.length - 1].value) {
      const topItem = stack[stack.length - 1]

      // Show comparison
      steps.push({
        array: [...arr],
        action: 'compare',
        currentIndex: i,
        stack: stack.map(s => ({ ...s })),
        result: [...result],
        description: `${arr[i]} > 栈顶 ${topItem.value}，栈顶元素找到答案！`,
        comparingWith: topItem.index,
      })

      // Pop and record answer
      const popped = stack.pop()!
      result[popped.index] = arr[i]

      steps.push({
        array: [...arr],
        action: 'found',
        currentIndex: i,
        stack: stack.map(s => ({ ...s })),
        result: [...result],
        description: `弹出 arr[${popped.index}] = ${popped.value}，其下一个更大元素为 ${arr[i]}`,
        poppedItem: popped,
        foundAnswer: { index: popped.index, value: popped.value, answer: arr[i] },
      })
    }

    // Push current element
    stack.push({ index: i, value: arr[i] })
    steps.push({
      array: [...arr],
      action: 'push',
      currentIndex: i,
      stack: stack.map(s => ({ ...s })),
      result: [...result],
      description: `压入 arr[${i}] = ${arr[i]}，维护单调递减性`,
    })
  }

  // Handle remaining elements
  if (stack.length > 0) {
    const remaining = stack.map(s => `arr[${s.index}]=${s.value}`).join(', ')
    steps.push({
      array: [...arr],
      action: 'done',
      currentIndex: n,
      stack: stack.map(s => ({ ...s })),
      result: [...result],
      description: `遍历结束。栈中剩余元素 ${remaining} 没有下一个更大元素，保持 -1`,
    })
  } else {
    steps.push({
      array: [...arr],
      action: 'done',
      currentIndex: n,
      stack: [],
      result: [...result],
      description: '遍历结束，所有元素都已找到答案',
    })
  }

  return steps
}

export default function MonotonicStackVisualization() {
  const [inputArray, setInputArray] = useState<number[]>(SAMPLE_ARRAYS[0])
  const [steps, setSteps] = useState<NgeStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [customInput, setCustomInput] = useState('2, 1, 2, 4, 3')
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setCurrentStep(0)
    setSteps(generateNgeSteps(inputArray))
  }, [inputArray])

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

  const handleCustomInput = useCallback(() => {
    try {
      const parsed = customInput
        .split(/[,，\s]+/)
        .filter(s => s.trim())
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n))
      if (parsed.length > 0 && parsed.length <= 16) {
        setInputArray(parsed)
      }
    } catch {
      // ignore invalid input
    }
  }, [customInput])

  const handleRandomize = useCallback(() => {
    const idx = Math.floor(Math.random() * SAMPLE_ARRAYS.length)
    setInputArray(SAMPLE_ARRAYS[idx])
    setCustomInput(SAMPLE_ARRAYS[idx].join(', '))
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const current = steps[currentStep] || {
    array: inputArray,
    action: 'compare' as const,
    currentIndex: 0,
    stack: [],
    result: new Array(inputArray.length).fill(-1),
    description: '点击"生成步骤"或"播放"开始演示',
  }

  const maxValue = Math.max(...(current.array.length > 0 ? current.array : [1]))

  const getBarColor = (index: number): string => {
    if (current.foundAnswer && current.foundAnswer.index === index) {
      return '#22c55e' // green - found answer
    }
    if (current.poppedItem && current.poppedItem.index === index) {
      return '#f59e0b' // amber - being popped
    }
    if (index === current.currentIndex) {
      return '#3b82f6' // blue - current
    }
    if (current.comparingWith === index) {
      return '#f59e0b' // amber - comparing
    }
    if (current.stack.some(s => s.index === index)) {
      return '#8b5cf6' // purple - in stack
    }
    if (current.result[index] !== -1) {
      return '#6b7280' // gray - already resolved
    }
    return '#4b5563' // dark gray - not yet processed
  }

  const getBarBorder = (index: number): string => {
    if (current.foundAnswer && current.foundAnswer.index === index) {
      return '3px solid #4ade80'
    }
    if (index === current.currentIndex) {
      return '3px solid #60a5fa'
    }
    if (current.comparingWith === index) {
      return '3px solid #fbbf24'
    }
    return '1px solid #4b5563'
  }

  return (
    <div className="visualization-container">
      {/* Input controls */}
      <div className="viz-controls">
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          数组:
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomInput()}
            placeholder="用逗号分隔，如: 2, 1, 2, 4, 3"
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '200px',
              fontFamily: 'Consolas, Monaco, monospace',
            }}
          />
        </label>
        <button className="btn btn-primary" onClick={handleCustomInput}>
          应用
        </button>
        <button className="btn btn-secondary" onClick={handleRandomize}>
          随机数据
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
        <button className="btn btn-secondary" onClick={generateSteps}>
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
            max="2500"
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

      {/* Bar chart visualization */}
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
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'flex-end' }}>
          {current.array.map((_, index) => (
            <div
              key={`idx-${index}`}
              style={{
                width: '48px',
                textAlign: 'center',
                fontSize: '0.7rem',
                color:
                  index === current.currentIndex
                    ? '#60a5fa'
                    : current.comparingWith === index
                      ? '#fbbf24'
                      : 'var(--text-secondary)',
                fontWeight:
                  index === current.currentIndex || current.comparingWith === index ? 'bold' : 'normal',
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
            justifyContent: 'center',
            alignItems: 'flex-end',
            height: '180px',
            width: '100%',
          }}
        >
          {current.array.map((value, index) => {
            const barHeight = Math.max(20, (value / maxValue) * 160)
            return (
              <div
                key={`bar-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    fontWeight: 'bold',
                    fontFamily: 'Consolas, Monaco, monospace',
                  }}
                >
                  {value}
                </span>
                <div
                  style={{
                    width: '40px',
                    height: `${barHeight}px`,
                    background: getBarColor(index),
                    border: getBarBorder(index),
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                  }}
                >
                  {(current.foundAnswer?.index === index) && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.65rem',
                        color: '#22c55e',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                      }}
                      >
                      →{current.foundAnswer.answer}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Result row */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          {current.array.map((_, index) => (
            <div
              key={`res-${index}`}
              style={{
                width: '48px',
                textAlign: 'center',
                fontSize: '0.75rem',
                fontFamily: 'Consolas, Monaco, monospace',
                color:
                  current.result[index] !== -1
                    ? '#22c55e'
                    : 'var(--text-secondary)',
                fontWeight: current.foundAnswer?.index === index ? 'bold' : 'normal',
              }}
            >
              {current.result[index] === -1 ? '—' : current.result[index]}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          答案数组（-1 表示无更大元素）
        </div>
      </div>

      {/* Stack visualization */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
            单调递减栈
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column-reverse',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '0.4rem',
              minHeight: '100px',
              minWidth: '250px',
              gap: '2px',
              background: 'rgba(30, 41, 59, 0.5)',
            }}
          >
            {current.stack.length === 0 ? (
              <div
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  fontStyle: 'italic',
                }}
              >
                空栈
              </div>
            ) : (
              current.stack.map((item, idx) => {
                const isTop = idx === current.stack.length - 1
                const isPopping =
                  current.action === 'pop' ||
                  (current.action === 'found' && current.poppedItem?.index === item.index)
                return (
                  <div
                    key={`${item.index}-${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0.8rem',
                      background: isPopping
                        ? '#f59e0b'
                        : isTop
                          ? '#8b5cf6'
                          : 'var(--bg-card)',
                      color: isPopping || isTop ? '#fff' : 'var(--text-primary)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.85rem',
                      fontFamily: 'Consolas, Monaco, monospace',
                      border: isTop ? '2px solid #a78bfa' : '1px solid var(--border)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span>arr[{item.index}] = {item.value}</span>
                    {isTop && (
                      <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>← 栈顶</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
            栈底
          </div>
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
          <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
          当前元素
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '2px', display: 'inline-block' }} />
          栈中元素
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }} />
          正在比较/弹出
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
          已找到答案
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#4b5563', borderRadius: '2px', display: 'inline-block' }} />
          未处理
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
          <span>步骤: {currentStep + 1}/{steps.length}</span>
          <span>栈大小: {current.stack.length}</span>
          <span>
            已解决: {current.result.filter(r => r !== -1).length}/{current.array.length}
          </span>
        </div>
      </div>
    </div>
  )
}
