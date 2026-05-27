import { useState, useEffect, useRef, useCallback } from 'react'

// Types
type Algorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick'

interface SortStep {
  array: number[]
  comparing: number[]
  swapping: number[]
  sorted: number[]
  pivot: number
  description: string
}

// Generate sorting steps for bubble sort
function generateBubbleSteps(inputArr: number[]): SortStep[] {
  const steps: SortStep[] = []
  const arr = [...inputArr]
  const n = arr.length
  const sorted = new Set<number>()

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    pivot: -1,
    description: '开始冒泡排序',
  })

  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      // Comparing
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        pivot: -1,
        description: `比较 arr[${j}]=${arr[j]} 和 arr[${j + 1}]=${arr[j + 1]}`,
      })

      if (arr[j] > arr[j + 1]) {
        // Swapping
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sorted],
          pivot: -1,
          description: `交换 ${arr[j + 1]} 和 ${arr[j]}`,
        })
      }
    }
    sorted.add(n - 1 - i)
    if (!swapped) {
      for (let k = 0; k < n; k++) sorted.add(k)
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
        pivot: -1,
        description: '本轮无交换，数组已有序，提前结束',
      })
      break
    }
  }

  for (let k = 0; k < n; k++) sorted.add(k)
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    pivot: -1,
    description: '冒泡排序完成！',
  })

  return steps
}

// Generate sorting steps for selection sort
function generateSelectionSteps(inputArr: number[]): SortStep[] {
  const steps: SortStep[] = []
  const arr = [...inputArr]
  const n = arr.length
  const sorted = new Set<number>()

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    pivot: -1,
    description: '开始选择排序',
  })

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        comparing: [minIdx, j],
        swapping: [],
        sorted: [...sorted],
        pivot: -1,
        description: `比较当前最小值 arr[${minIdx}]=${arr[minIdx]} 和 arr[${j}]=${arr[j]}`,
      })
      if (arr[j] < arr[minIdx]) {
        minIdx = j
      }
    }
    if (minIdx !== i) {
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i, minIdx],
        sorted: [...sorted],
        pivot: -1,
        description: `将最小值 ${arr[i]} 交换到位置 ${i}`,
      })
    }
    sorted.add(i)
  }

  for (let k = 0; k < n; k++) sorted.add(k)
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    pivot: -1,
    description: '选择排序完成！',
  })

  return steps
}

// Generate sorting steps for insertion sort
function generateInsertionSteps(inputArr: number[]): SortStep[] {
  const steps: SortStep[] = []
  const arr = [...inputArr]
  const n = arr.length
  const sorted = new Set<number>()
  sorted.add(0)

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [0],
    pivot: -1,
    description: '开始插入排序，第一个元素默认已排序',
  })

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1

    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [...sorted],
      pivot: -1,
      description: `取出 arr[${i}]=${key}，准备插入到已排序部分`,
    })

    while (j >= 0 && arr[j] > key) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        pivot: -1,
        description: `arr[${j}]=${arr[j]} > ${key}，向右移动`,
      })
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = key
    sorted.add(i)

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      pivot: -1,
      description: `将 ${key} 插入到位置 ${j + 1}`,
    })
  }

  for (let k = 0; k < n; k++) sorted.add(k)
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    pivot: -1,
    description: '插入排序完成！',
  })

  return steps
}

// Generate sorting steps for merge sort
function generateMergeSteps(inputArr: number[]): SortStep[] {
  const steps: SortStep[] = []
  const arr = [...inputArr]
  const n = arr.length
  const sorted = new Set<number>()

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    pivot: -1,
    description: '开始归并排序',
  })

  function mergeSort(left: number, right: number): void {
    if (left >= right) return

    const mid = (left + right) >> 1

    steps.push({
      array: [...arr],
      comparing: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      swapping: [],
      sorted: [...sorted],
      pivot: mid,
      description: `分割区间 [${left}..${right}]，中点=${mid}`,
    })

    mergeSort(left, mid)
    mergeSort(mid + 1, right)

    // Merge
    const temp: number[] = []
    let i = left,
      j = mid + 1
    while (i <= mid && j <= right) {
      steps.push({
        array: [...arr],
        comparing: [i, j],
        swapping: [],
        sorted: [...sorted],
        pivot: -1,
        description: `合并: 比较 arr[${i}]=${arr[i]} 和 arr[${j}]=${arr[j]}`,
      })
      if (arr[i] <= arr[j]) {
        temp.push(arr[i++])
      } else {
        temp.push(arr[j++])
      }
    }
    while (i <= mid) temp.push(arr[i++])
    while (j <= right) temp.push(arr[j++])

    for (let k = 0; k < temp.length; k++) {
      arr[left + k] = temp[k]
    }

    if (left === 0 && right === n - 1) {
      for (let k = 0; k < n; k++) sorted.add(k)
    }

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      sorted: [...sorted],
      pivot: -1,
      description: `合并完成 [${left}..${right}]: [${arr.slice(left, right + 1).join(', ')}]`,
    })
  }

  mergeSort(0, n - 1)

  for (let k = 0; k < n; k++) sorted.add(k)
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    pivot: -1,
    description: '归并排序完成！',
  })

  return steps
}

// Generate sorting steps for quick sort
function generateQuickSteps(inputArr: number[]): SortStep[] {
  const steps: SortStep[] = []
  const arr = [...inputArr]
  const n = arr.length
  const sorted = new Set<number>()

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    pivot: -1,
    description: '开始快速排序',
  })

  function quickSort(left: number, right: number): void {
    if (left >= right) {
      if (left === right) sorted.add(left)
      return
    }

    // Median of three pivot selection
    const mid = (left + right) >> 1
    if (arr[left] > arr[mid]) [arr[left], arr[mid]] = [arr[mid], arr[left]]
    if (arr[left] > arr[right]) [arr[left], arr[right]] = [arr[right], arr[left]]
    if (arr[mid] > arr[right]) [arr[mid], arr[right]] = [arr[right], arr[mid]]
    // Place pivot at right-1
    ;[arr[mid], arr[right]] = [arr[right], arr[mid]]
    const pivot = arr[right]

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      pivot: right,
      description: `选择枢轴 pivot=${pivot}，分区 [${left}..${right}]`,
    })

    // Lomuto partition
    let i = left
    for (let j = left; j < right; j++) {
      steps.push({
        array: [...arr],
        comparing: [j, right],
        swapping: [],
        sorted: [...sorted],
        pivot: right,
        description: `比较 arr[${j}]=${arr[j]} 和枢轴 ${pivot}`,
      })
      if (arr[j] <= pivot) {
        if (i !== j) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [i, j],
            sorted: [...sorted],
            pivot: right,
            description: `交换 arr[${i}] 和 arr[${j}]`,
          })
        }
        i++
      }
    }
    ;[arr[i], arr[right]] = [arr[right], arr[i]]
    sorted.add(i)

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [i, right],
      sorted: [...sorted],
      pivot: i,
      description: `枢轴 ${pivot} 放到最终位置 ${i}`,
    })

    quickSort(left, i - 1)
    quickSort(i + 1, right)
  }

  quickSort(0, n - 1)

  for (let k = 0; k < n; k++) sorted.add(k)
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    pivot: -1,
    description: '快速排序完成！',
  })

  return steps
}

// Generate steps based on algorithm
function generateSteps(arr: number[], algorithm: Algorithm): SortStep[] {
  switch (algorithm) {
    case 'bubble':
      return generateBubbleSteps(arr)
    case 'selection':
      return generateSelectionSteps(arr)
    case 'insertion':
      return generateInsertionSteps(arr)
    case 'merge':
      return generateMergeSteps(arr)
    case 'quick':
      return generateQuickSteps(arr)
  }
}

// Random array generator
function randomArray(size: number): number[] {
  const arr: number[] = []
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10)
  }
  return arr
}

// Algorithm labels
const algorithmLabels: Record<Algorithm, string> = {
  bubble: '冒泡排序',
  selection: '选择排序',
  insertion: '插入排序',
  merge: '归并排序',
  quick: '快速排序',
}

export default function SortingVisualization() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('bubble')
  const [inputArray, setInputArray] = useState<number[]>(() => randomArray(20))
  const [steps, setSteps] = useState<SortStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(300)
  const [comparisons, setComparisons] = useState(0)
  const [swapCount, setSwapCount] = useState(0)
  const timerRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Count comparisons and swaps from steps
  const countMetrics = useCallback((steps: SortStep[]) => {
    let comps = 0
    let swaps = 0
    for (const step of steps) {
      if (step.comparing.length > 0) comps++
      if (step.swapping.length > 0) swaps++
    }
    setComparisons(comps)
    setSwapCount(swaps)
  }, [])

  // Initialize or reset
  const resetVisualization = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newSteps = generateSteps(inputArray, algorithm)
    setSteps(newSteps)
    setCurrentStep(0)
    countMetrics(newSteps)
  }, [inputArray, algorithm, countMetrics])

  // Generate new random array
  const randomize = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newArr = randomArray(20)
    setInputArray(newArr)
    const newSteps = generateSteps(newArr, algorithm)
    setSteps(newSteps)
    setCurrentStep(0)
    countMetrics(newSteps)
  }, [algorithm, countMetrics])

  // Initialize on mount
  useEffect(() => {
    const newSteps = generateSteps(inputArray, algorithm)
    setSteps(newSteps)
    setCurrentStep(0)
    countMetrics(newSteps)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play effect
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

  // Play / Pause
  const togglePlay = useCallback(() => {
    if (steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      // Restart
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }, [steps, currentStep])

  // Step forward
  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps])

  // Step backward
  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // Current state
  const current = steps[currentStep] || steps[0] || {
    array: inputArray,
    comparing: [],
    swapping: [],
    sorted: [],
    pivot: -1,
    description: '点击"开始"或"播放"开始排序演示',
  }

  const maxVal = Math.max(...current.array, 1)
  const barWidth = Math.max(8, Math.min(30, 500 / current.array.length))

  // Get bar color
  const getBarColor = (index: number): string => {
    if (current.sorted.includes(index)) return 'var(--success)'
    if (current.swapping.includes(index)) return 'var(--error)'
    if (current.comparing.includes(index)) return 'var(--warning)'
    if (index === current.pivot) return 'var(--accent)'
    return 'var(--bg-card)'
  }

  // Get bar border
  const getBarBorder = (index: number): string => {
    if (index === current.pivot) return '2px solid var(--accent-hover)'
    if (current.comparing.includes(index)) return '2px solid var(--warning)'
    if (current.swapping.includes(index)) return '2px solid var(--error)'
    return '1px solid var(--border)'
  }

  return (
    <div className="visualization-container">
      {/* Algorithm selector and controls */}
      <div className="viz-controls">
        <select
          value={algorithm}
          onChange={e => {
            setAlgorithm(e.target.value as Algorithm)
            setIsPlaying(false)
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
          <option value="bubble">冒泡排序</option>
          <option value="selection">选择排序</option>
          <option value="insertion">插入排序</option>
          <option value="merge">归并排序</option>
          <option value="quick">快速排序</option>
        </select>

        <button className="btn btn-primary" onClick={resetVisualization}>
          生成步骤
        </button>
        <button className="btn btn-secondary" onClick={randomize}>
          随机数组
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
        <button className="btn btn-secondary" onClick={() => { setIsPlaying(false); setCurrentStep(0) }}>
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
            min="50"
            max="1000"
            step="50"
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
        ref={canvasRef}
        className="viz-canvas"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '2px',
          minHeight: '300px',
          padding: '1rem 0.5rem',
        }}
      >
        {current.array.map((value, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'height 0.15s ease, background 0.15s ease',
            }}
          >
            <span
              style={{
                fontSize: '0.6rem',
                color: 'var(--text-secondary)',
                marginBottom: '2px',
                opacity: current.comparing.includes(index) || current.swapping.includes(index) || index === current.pivot ? 1 : 0.4,
              }}
            >
              {value}
            </span>
            <div
              style={{
                width: `${barWidth}px`,
                height: `${(value / maxVal) * 250}px`,
                background: getBarColor(index),
                border: getBarBorder(index),
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.15s ease, background 0.15s ease',
              }}
            />
          </div>
        ))}
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
          <span style={{ width: '12px', height: '12px', background: 'var(--warning)', borderRadius: '2px', display: 'inline-block' }} />
          比较中
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--error)', borderRadius: '2px', display: 'inline-block' }} />
          交换中
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '2px', display: 'inline-block' }} />
          枢轴
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '2px', display: 'inline-block' }} />
          已排序
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>算法: {algorithmLabels[algorithm]}</span>
          <span>比较次数: {comparisons}</span>
          <span>交换次数: {swapCount}</span>
          <span>数组大小: {current.array.length}</span>
        </div>
      </div>
    </div>
  )
}
