import { useState, useEffect, useRef, useCallback } from 'react'

interface ArrayElement {
  value: number
  state: 'default' | 'comparing' | 'found' | 'inserting' | 'deleting' | 'shifting'
}

interface AnimationStep {
  array: ArrayElement[]
  description: string
  highlightIndex?: number
}

const INITIAL_ARRAY: number[] = [12, 25, 33, 47, 58, 62, 79]
const COLORS: Record<ArrayElement['state'], string> = {
  default: '#4a9eff',
  comparing: '#fbbf24',
  found: '#34d399',
  inserting: '#a78bfa',
  deleting: '#f87171',
  shifting: '#fb923c'
}

function createDefaultArray(values: number[]): ArrayElement[] {
  return values.map(v => ({ value: v, state: 'default' }))
}

function generateInsertSteps(arr: number[], value: number, index: number): AnimationStep[] {
  const steps: AnimationStep[] = []
  const elements = createDefaultArray(arr)

  steps.push({
    array: [...elements],
    description: `准备在索引 ${index} 处插入值 ${value}`
  })

  // Shift elements to the right
  for (let i = arr.length - 1; i >= index; i--) {
    const shifting = createDefaultArray(arr)
    for (let j = arr.length - 1; j > i; j--) {
      shifting[j] = { value: arr[j - 1], state: 'shifting' }
    }
    shifting[i] = { value: arr[i], state: 'shifting' }
    steps.push({
      array: [...shifting],
      description: `将 arr[${i}] = ${arr[i]} 向右移动`,
      highlightIndex: i
    })
  }

  // Insert new element
  const inserted = createDefaultArray(arr)
  for (let i = arr.length; i > index; i--) {
    inserted[i] = { value: arr[i - 1], state: 'default' }
  }
  inserted[index] = { value, state: 'inserting' }
  steps.push({
    array: [...inserted],
    description: `在索引 ${index} 处插入 ${value}`,
    highlightIndex: index
  })

  // Final state
  const finalArr = [...arr]
  finalArr.splice(index, 0, value)
  const final = createDefaultArray(finalArr)
  steps.push({
    array: [...final],
    description: `插入完成！新数组长度: ${finalArr.length}`
  })

  return steps
}

function generateDeleteSteps(arr: number[], index: number): AnimationStep[] {
  const steps: AnimationStep[] = []
  const deletedValue = arr[index]

  const initial = createDefaultArray(arr)
  initial[index] = { value: arr[index], state: 'deleting' }
  steps.push({
    array: [...initial],
    description: `准备删除索引 ${index} 处的元素 ${deletedValue}`,
    highlightIndex: index
  })

  // Shift elements to the left
  for (let i = index; i < arr.length - 1; i++) {
    const shifting = createDefaultArray(arr)
    shifting[i] = { value: arr[i], state: 'deleting' }
    for (let j = index; j < i; j++) {
      shifting[j] = { value: arr[j + 1], state: 'shifting' }
    }
    steps.push({
      array: [...shifting],
      description: `将 arr[${i + 1}] = ${arr[i + 1]} 向左移动`,
      highlightIndex: i
    })
  }

  // Final state
  const finalArr = [...arr]
  finalArr.splice(index, 1)
  const final = createDefaultArray(finalArr)
  steps.push({
    array: [...final],
    description: `删除完成！已移除 ${deletedValue}，新数组长度: ${finalArr.length}`
  })

  return steps
}

function generateSearchSteps(arr: number[], target: number): AnimationStep[] {
  const steps: AnimationStep[] = []

  steps.push({
    array: createDefaultArray(arr),
    description: `开始线性查找目标值 ${target}`
  })

  for (let i = 0; i < arr.length; i++) {
    const current = createDefaultArray(arr)
    current[i] = { value: arr[i], state: 'comparing' }
    steps.push({
      array: [...current],
      description: `比较 arr[${i}] = ${arr[i]} 与目标值 ${target}`,
      highlightIndex: i
    })

    if (arr[i] === target) {
      const found = createDefaultArray(arr)
      found[i] = { value: arr[i], state: 'found' }
      steps.push({
        array: [...found],
        description: `找到了！arr[${i}] = ${target}`,
        highlightIndex: i
      })
      return steps
    }
  }

  steps.push({
    array: createDefaultArray(arr),
    description: `未找到目标值 ${target}`
  })

  return steps
}

export default function ArrayVisualization() {
  const [array, setArray] = useState<ArrayElement[]>(createDefaultArray(INITIAL_ARRAY))
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [description, setDescription] = useState('选择一个操作开始演示')
  const [inputValue, setInputValue] = useState('')
  const [inputIndex, setInputIndex] = useState('')
  const timerRef = useRef<number | null>(null)

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isPlaying && steps.length > 0 && currentStep < steps.length - 1) {
      timerRef.current = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed)
    } else {
      stopTimer()
      if (currentStep >= steps.length - 1 && steps.length > 0) {
        setIsPlaying(false)
      }
    }
    return stopTimer
  }, [isPlaying, speed, steps.length, currentStep, stopTimer])

  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      setArray(steps[currentStep].array)
      setDescription(steps[currentStep].description)
    }
  }, [steps, currentStep])

  const handleInsert = () => {
    const value = parseInt(inputValue)
    const index = parseInt(inputIndex)
    if (isNaN(value)) return
    const arr = INITIAL_ARRAY
    const idx = isNaN(index) || index < 0 ? arr.length : Math.min(index, arr.length)

    stopTimer()
    setIsPlaying(false)
    const newSteps = generateInsertSteps(arr, value, idx)
    setSteps(newSteps)
    setCurrentStep(0)
    setInputValue('')
    setInputIndex('')
  }

  const handleDelete = () => {
    const index = parseInt(inputIndex)
    if (isNaN(index) || index < 0 || index >= INITIAL_ARRAY.length) return

    stopTimer()
    setIsPlaying(false)
    const newSteps = generateDeleteSteps(INITIAL_ARRAY, index)
    setSteps(newSteps)
    setCurrentStep(0)
    setInputIndex('')
  }

  const handleSearch = () => {
    const value = parseInt(inputValue)
    if (isNaN(value)) return

    stopTimer()
    setIsPlaying(false)
    const newSteps = generateSearchSteps(INITIAL_ARRAY, value)
    setSteps(newSteps)
    setCurrentStep(0)
    setInputValue('')
  }

  const handlePlay = () => {
    if (steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    stopTimer()
    setIsPlaying(false)
    setArray(createDefaultArray(INITIAL_ARRAY))
    setSteps([])
    setCurrentStep(0)
    setDescription('选择一个操作开始演示')
  }

  const handleStepForward = () => {
    if (steps.length === 0 || currentStep >= steps.length - 1) return
    setIsPlaying(false)
    stopTimer()
    setCurrentStep(prev => prev + 1)
  }

  const handleStepBackward = () => {
    if (steps.length === 0 || currentStep <= 0) return
    setIsPlaying(false)
    stopTimer()
    setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="viz-canvas">
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="值"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            style={{
              width: '70px',
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <input
            type="number"
            placeholder="索引"
            value={inputIndex}
            onChange={e => setInputIndex(e.target.value)}
            style={{
              width: '70px',
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <button className="btn btn-primary" onClick={handleInsert}>插入</button>
          <button className="btn btn-secondary" onClick={handleDelete}>删除</button>
          <button className="btn btn-secondary" onClick={handleSearch}>查找</button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '24px',
        minHeight: '100px',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        padding: '20px 0'
      }}>
        {array.map((element, index) => (
          <div
            key={`${index}-${element.value}-${element.state}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: element.state !== 'default' ? 'pulse 0.3s ease-in-out' : 'none'
            }}
          >
            <span style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginBottom: '4px',
              fontFamily: 'monospace'
            }}>
              [{index}]
            </span>
            <div style={{
              width: '52px',
              height: '52px',
              backgroundColor: COLORS[element.state],
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: element.state !== 'default'
                ? `0 4px 12px ${COLORS[element.state]}40`
                : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              transform: element.state === 'inserting' ? 'scale(1.1)' : 'scale(1)'
            }}>
              {element.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        fontSize: '14px',
        color: '#475569',
        textAlign: 'center',
        minHeight: '24px',
        border: '1px solid #e2e8f0'
      }}>
        {description}
      </div>

      <div className="viz-controls" style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '12px'
      }}>
        <button
          className="btn btn-secondary"
          onClick={handleStepBackward}
          disabled={steps.length === 0 || currentStep <= 0}
          title="上一步"
        >
          ⏮
        </button>
        {isPlaying ? (
          <button className="btn btn-primary" onClick={handlePause}>⏸ 暂停</button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handlePlay}
            disabled={steps.length === 0}
          >
            ▶ 播放
          </button>
        )}
        <button
          className="btn btn-secondary"
          onClick={handleStepForward}
          disabled={steps.length === 0 || currentStep >= steps.length - 1}
          title="下一步"
        >
          ⏭
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>↺ 重置</button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <label style={{ fontSize: '13px', color: '#6b7280' }}>速度:</label>
        <input
          type="range"
          min={100}
          max={1500}
          step={100}
          value={speed}
          onChange={e => setSpeed(parseInt(e.target.value))}
          style={{ width: '120px' }}
        />
        <span style={{ fontSize: '13px', color: '#6b7280', minWidth: '40px' }}>
          {speed}ms
        </span>
      </div>

      {steps.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '4px',
          marginBottom: '12px'
        }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: i === currentStep ? '#4a9eff' : i < currentStep ? '#93c5fd' : '#e5e7eb',
                transition: 'background-color 0.2s'
              }}
            />
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        fontSize: '12px',
        color: '#6b7280',
        flexWrap: 'wrap'
      }}>
        {Object.entries(COLORS).filter(([key]) => key !== 'default').map(([state, color]) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: color,
              borderRadius: '3px'
            }} />
            <span>
              {state === 'comparing' ? '比较中' :
               state === 'found' ? '已找到' :
               state === 'inserting' ? '插入中' :
               state === 'deleting' ? '删除中' :
               state === 'shifting' ? '移动中' : state}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
