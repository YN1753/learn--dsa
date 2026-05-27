import { useState, useEffect, useRef, useCallback } from 'react'

interface SortStep {
  array: number[]
  currentIndex: number
  insertPosition: number
  comparingIndex: number
  sortedBoundary: number
  description: string
  phase: 'select' | 'compare' | 'shift' | 'insert' | 'done'
}

function generateSteps(inputArr: number[]): SortStep[] {
  const steps: SortStep[] = []
  const arr = [...inputArr]
  const n = arr.length

  steps.push({
    array: [...arr],
    currentIndex: -1,
    insertPosition: -1,
    comparingIndex: -1,
    sortedBoundary: 0,
    description: '初始数组，第 0 个元素默认已排序',
    phase: 'select',
  })

  for (let i = 1; i < n; i++) {
    const key = arr[i]

    steps.push({
      array: [...arr],
      currentIndex: i,
      insertPosition: -1,
      comparingIndex: -1,
      sortedBoundary: i - 1,
      description: `选择元素 arr[${i}] = ${key} 作为待插入元素`,
      phase: 'select',
    })

    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      steps.push({
        array: [...arr],
        currentIndex: i,
        insertPosition: -1,
        comparingIndex: j,
        sortedBoundary: i - 1,
        description: `比较 arr[${j}]=${arr[j]} > ${key}，需要右移`,
        phase: 'compare',
      })

      arr[j + 1] = arr[j]

      steps.push({
        array: [...arr],
        currentIndex: i,
        insertPosition: j + 1,
        comparingIndex: j,
        sortedBoundary: i - 1,
        description: `将 arr[${j}]=${arr[j]} 右移到位置 ${j + 1}`,
        phase: 'shift',
      })

      j--
    }

    if (j >= 0) {
      steps.push({
        array: [...arr],
        currentIndex: i,
        insertPosition: j + 1,
        comparingIndex: j,
        sortedBoundary: i - 1,
        description: `比较 arr[${j}]=${arr[j]} <= ${key}，找到插入位置`,
        phase: 'compare',
      })
    }

    arr[j + 1] = key

    steps.push({
      array: [...arr],
      currentIndex: -1,
      insertPosition: j + 1,
      comparingIndex: -1,
      sortedBoundary: i,
      description: `将 ${key} 插入到位置 ${j + 1}`,
      phase: 'insert',
    })
  }

  steps.push({
    array: [...arr],
    currentIndex: -1,
    insertPosition: -1,
    comparingIndex: -1,
    sortedBoundary: n - 1,
    description: '排序完成！',
    phase: 'done',
  })

  return steps
}

function generateRandomArray(size: number): number[] {
  const arr: number[] = []
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10)
  }
  return arr
}

function generateNearlySortedArray(size: number): number[] {
  const arr: number[] = []
  for (let i = 0; i < size; i++) {
    arr.push((i + 1) * Math.floor(90 / size) + Math.floor(Math.random() * 5))
  }
  // Swap a few elements to make it nearly sorted
  for (let i = 0; i < 2; i++) {
    const a = Math.floor(Math.random() * size)
    const b = Math.floor(Math.random() * size)
    ;[arr[a], arr[b]] = [arr[b], arr[a]]
  }
  return arr
}

export default function InsertionSortVisualization() {
  const [array, setArray] = useState<number[]>([38, 27, 43, 3, 9, 82, 10])
  const [steps, setSteps] = useState<SortStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [description, setDescription] = useState<string>('点击"开始排序"或"单步执行"来观察插入排序过程')
  const timerRef = useRef<number | null>(null)

  const maxVal = Math.max(...array, 1)

  const getBarColor = useCallback(
    (index: number, step: SortStep): string => {
      if (step.phase === 'done') return '#22c55e'

      if (index === step.comparingIndex) return '#f59e0b'
      if (index === step.currentIndex && step.phase === 'select') return '#3b82f6'
      if (index === step.insertPosition && step.phase === 'insert') return '#22c55e'
      if (index === step.insertPosition && step.phase === 'shift') return '#ef4444'

      if (index <= step.sortedBoundary) return '#22c55e'

      return 'var(--bg-card, #1e293b)'
    },
    []
  )

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setArray([...step.array])
      setDescription(step.description)
      setCurrentStep((prev) => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleStart = () => {
    if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
      return
    }
    const newSteps = generateSteps(array)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setDescription('开始排序...')
  }

  const handleStep = () => {
    if (steps.length === 0) {
      const newSteps = generateSteps(array)
      setSteps(newSteps)
      setCurrentStep(0)
      if (newSteps.length > 0) {
        const step = newSteps[0]
        setArray([...step.array])
        setDescription(step.description)
        setCurrentStep(1)
      }
      return
    }

    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setArray([...step.array])
      setDescription(step.description)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
    setDescription(description + ' [已暂停]')
  }

  const handlePrev = () => {
    if (steps.length === 0 || currentStep <= 1) return
    setIsPlaying(false)
    const prevStep = currentStep - 2
    const step = steps[prevStep]
    setArray([...step.array])
    setDescription(step.description)
    setCurrentStep(prevStep + 1)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setDescription('已重置，点击"开始排序"重新开始')
  }

  const handleRandomArray = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const newArr = generateRandomArray(8)
    setArray(newArr)
    setSteps([])
    setCurrentStep(0)
    setDescription('已生成随机数组，点击"开始排序"')
  }

  const handleNearlySorted = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const newArr = generateNearlySortedArray(8)
    setArray(newArr)
    setSteps([])
    setCurrentStep(0)
    setDescription('已生成近乎有序数组，观察插入排序的高效表现')
  }

  const currentStepData =
    steps.length > 0 && currentStep > 0 && currentStep <= steps.length
      ? steps[currentStep - 1]
      : null

  const sortedBoundary = currentStepData?.sortedBoundary ?? -1

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying && currentStep < steps.length}>
          开始排序
        </button>
        <button className="btn btn-secondary" onClick={handlePrev} disabled={isPlaying || currentStep <= 1}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={isPlaying ? handlePause : handleStart} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <button className="btn btn-secondary" onClick={handleRandomArray} disabled={isPlaying}>
          随机数组
        </button>
        <button className="btn btn-secondary" onClick={handleNearlySorted} disabled={isPlaying}>
          近乎有序
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input type="range" min="100" max="2000" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '6px', height: '280px', padding: '20px 10px 10px', position: 'relative' }}>
        {array.map((value, index) => {
          const barHeight = (value / maxVal) * 220
          const barColor = currentStepData ? getBarColor(index, currentStepData) : 'var(--bg-card, #1e293b)'
          const isHighlighted = currentStepData && (index === currentStepData.comparingIndex || index === currentStepData.currentIndex || (index === currentStepData.insertPosition && currentStepData.phase !== 'done'))

          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace' }}>{value}</span>
              <div
                style={{
                  width: '40px',
                  height: `${barHeight}px`,
                  backgroundColor: barColor,
                  borderRadius: '4px 4px 0 0',
                  border: isHighlighted ? '2px solid #fff' : '1px solid var(--border, #334155)',
                  transition: 'height 0.3s ease, background-color 0.3s ease',
                  position: 'relative',
                }}
              >
                {index <= sortedBoundary && currentStepData?.phase !== 'done' && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-18px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.65rem',
                      color: '#22c55e',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    已排序
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace' }}>
                [{index}]
              </span>
            </div>
          )
        })}

        {sortedBoundary >= 0 && sortedBoundary < array.length - 1 && currentStepData?.phase !== 'done' && (
          <div
            style={{
              position: 'absolute',
              left: `calc(50% - ${(array.length * 46) / 2}px + ${sortedBoundary * 46 + 46}px)`,
              top: '0',
              bottom: '30px',
              width: '2px',
              backgroundColor: '#22c55e',
              opacity: 0.6,
              borderStyle: 'dashed',
            }}
          />
        )}
      </div>

      <div className="viz-info">
        <strong>当前步骤：</strong> {description}
      </div>

      {steps.length > 0 && (
        <div className="viz-info" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          步骤: {currentStep} / {steps.length}
        </div>
      )}

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          待插入元素
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在比较
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在右移
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已排序部分
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          插入完成
        </span>
      </div>
    </div>
  )
}
