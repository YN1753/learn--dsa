import { useState, useEffect, useRef, useCallback } from 'react'

interface SearchStep {
  array: number[]
  left: number
  right: number
  mid: number
  found: boolean
  foundIndex: number
  eliminated: Set<number>
  description: string
  comparisonCount: number
}

type SearchMode = 'standard' | 'findFirst' | 'findLast' | 'insertPosition'

const MODE_LABELS: Record<SearchMode, string> = {
  standard: '标准查找',
  findFirst: '查找首次出现',
  findLast: '查找末次出现',
  insertPosition: '查找插入位置',
}

function generateSearchSteps(
  arr: number[],
  target: number,
  mode: SearchMode
): SearchStep[] {
  const steps: SearchStep[] = []
  const eliminated = new Set<number>()
  let comparisonCount = 0

  // Initial step
  steps.push({
    array: [...arr],
    left: 0,
    right: arr.length - 1,
    mid: -1,
    found: false,
    foundIndex: -1,
    eliminated: new Set(),
    description: `开始${MODE_LABELS[mode]}，目标值 = ${target}，搜索范围 [0, ${arr.length - 1}]`,
    comparisonCount: 0,
  })

  if (mode === 'standard') {
    let left = 0
    let right = arr.length - 1

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2)
      comparisonCount++

      if (arr[mid] === target) {
        steps.push({
          array: [...arr],
          left, right, mid,
          found: true,
          foundIndex: mid,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} == ${target}，找到目标！`,
          comparisonCount,
        })
        return steps
      } else if (arr[mid] < target) {
        steps.push({
          array: [...arr],
          left, right, mid,
          found: false,
          foundIndex: -1,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} < ${target}，目标在右半部分，排除 [${left}, ${mid}]`,
          comparisonCount,
        })
        for (let i = left; i <= mid; i++) eliminated.add(i)
        left = mid + 1
      } else {
        steps.push({
          array: [...arr],
          left, right, mid,
          found: false,
          foundIndex: -1,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} > ${target}，目标在左半部分，排除 [${mid}, ${right}]`,
          comparisonCount,
        })
        for (let i = mid; i <= right; i++) eliminated.add(i)
        right = mid - 1
      }
    }

    steps.push({
      array: [...arr],
      left, right, mid: -1,
      found: false,
      foundIndex: -1,
      eliminated: new Set(eliminated),
      description: `搜索范围为空 (left=${left} > right=${right})，目标值 ${target} 不存在`,
      comparisonCount,
    })
  } else if (mode === 'findFirst') {
    let left = 0
    let right = arr.length - 1
    let result = -1

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2)
      comparisonCount++

      if (arr[mid] === target) {
        result = mid
        steps.push({
          array: [...arr],
          left, right, mid,
          found: true,
          foundIndex: mid,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} == ${target}，记录位置 ${mid}，继续向左搜索更早出现的位置`,
          comparisonCount,
        })
        for (let i = mid; i <= right; i++) eliminated.add(i)
        right = mid - 1
      } else if (arr[mid] < target) {
        steps.push({
          array: [...arr],
          left, right, mid,
          found: false,
          foundIndex: -1,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} < ${target}，向右搜索`,
          comparisonCount,
        })
        for (let i = left; i <= mid; i++) eliminated.add(i)
        left = mid + 1
      } else {
        steps.push({
          array: [...arr],
          left, right, mid,
          found: false,
          foundIndex: -1,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} > ${target}，向左搜索`,
          comparisonCount,
        })
        for (let i = mid; i <= right; i++) eliminated.add(i)
        right = mid - 1
      }
    }

    steps.push({
      array: [...arr],
      left: result >= 0 ? result : left,
      right: result >= 0 ? result : right,
      mid: -1,
      found: result >= 0,
      foundIndex: result,
      eliminated: new Set(eliminated),
      description: result >= 0
        ? `${target} 第一次出现在位置 ${result}`
        : `未找到 ${target}`,
      comparisonCount,
    })
  } else if (mode === 'findLast') {
    let left = 0
    let right = arr.length - 1
    let result = -1

    while (left <= right) {
      const mid = left + Math.floor((right - left) / 2)
      comparisonCount++

      if (arr[mid] === target) {
        result = mid
        steps.push({
          array: [...arr],
          left, right, mid,
          found: true,
          foundIndex: mid,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} == ${target}，记录位置 ${mid}，继续向右搜索更晚出现的位置`,
          comparisonCount,
        })
        for (let i = left; i <= mid; i++) eliminated.add(i)
        left = mid + 1
      } else if (arr[mid] < target) {
        steps.push({
          array: [...arr],
          left, right, mid,
          found: false,
          foundIndex: -1,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} < ${target}，向右搜索`,
          comparisonCount,
        })
        for (let i = left; i <= mid; i++) eliminated.add(i)
        left = mid + 1
      } else {
        steps.push({
          array: [...arr],
          left, right, mid,
          found: false,
          foundIndex: -1,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} > ${target}，向左搜索`,
          comparisonCount,
        })
        for (let i = mid; i <= right; i++) eliminated.add(i)
        right = mid - 1
      }
    }

    steps.push({
      array: [...arr],
      left: result >= 0 ? result : left,
      right: result >= 0 ? result : right,
      mid: -1,
      found: result >= 0,
      foundIndex: result,
      eliminated: new Set(eliminated),
      description: result >= 0
        ? `${target} 最后一次出现在位置 ${result}`
        : `未找到 ${target}`,
      comparisonCount,
    })
  } else if (mode === 'insertPosition') {
    let left = 0
    let right = arr.length

    steps[0].description = `开始查找插入位置，目标值 = ${target}，搜索范围 [0, ${arr.length})`

    while (left < right) {
      const mid = left + Math.floor((right - left) / 2)
      comparisonCount++

      if (arr[mid] < target) {
        steps.push({
          array: [...arr],
          left, right: right - 1, mid,
          found: false,
          foundIndex: -1,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} < ${target}，向右搜索`,
          comparisonCount,
        })
        for (let i = left; i <= mid; i++) eliminated.add(i)
        left = mid + 1
      } else {
        steps.push({
          array: [...arr],
          left, right: right - 1, mid,
          found: false,
          foundIndex: -1,
          eliminated: new Set(eliminated),
          description: `arr[${mid}] = ${arr[mid]} >= ${target}，向左搜索`,
          comparisonCount,
        })
        for (let i = mid; i < right; i++) eliminated.add(i)
        right = mid
      }
    }

    steps.push({
      array: [...arr],
      left, right: left, mid: -1,
      found: false,
      foundIndex: left,
      eliminated: new Set(eliminated),
      description: `${target} 应插入到位置 ${left}`,
      comparisonCount,
    })
  }

  return steps
}

function randomSortedArray(size: number): number[] {
  const arr: number[] = []
  let current = Math.floor(Math.random() * 3) + 1
  for (let i = 0; i < size; i++) {
    arr.push(current)
    current += Math.floor(Math.random() * 4) + 1
  }
  return arr
}

export default function BinarySearchVisualization() {
  const [inputArray, setInputArray] = useState<number[]>(() => randomSortedArray(16))
  const [target, setTarget] = useState<number>(() => {
    const arr = randomSortedArray(16)
    setInputArray(arr)
    return arr[Math.floor(Math.random() * arr.length)]
  })
  const [mode, setMode] = useState<SearchMode>('standard')
  const [steps, setSteps] = useState<SearchStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [targetInput, setTargetInput] = useState('')
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newSteps = generateSearchSteps(inputArray, target, mode)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [inputArray, target, mode])

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

  const handleRandomize = useCallback(() => {
    const newArr = randomSortedArray(16)
    setInputArray(newArr)
    const newTarget = newArr[Math.floor(Math.random() * newArr.length)]
    setTarget(newTarget)
    setTargetInput('')
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newSteps = generateSearchSteps(newArr, newTarget, mode)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [mode])

  const handleSetTarget = useCallback(() => {
    const val = parseInt(targetInput, 10)
    if (!isNaN(val)) {
      setTarget(val)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setIsPlaying(false)
      const newSteps = generateSearchSteps(inputArray, val, mode)
      setSteps(newSteps)
      setCurrentStep(0)
      setTargetInput('')
    }
  }, [targetInput, inputArray, mode])

  const current = steps[currentStep] || steps[0] || {
    array: inputArray,
    left: 0,
    right: inputArray.length - 1,
    mid: -1,
    found: false,
    foundIndex: -1,
    eliminated: new Set<number>(),
    description: '点击"开始搜索"或"播放"开始演示',
    comparisonCount: 0,
  }

  const getBoxColor = (index: number): string => {
    if (current.found && index === current.foundIndex) return '#22c55e'
    if (current.eliminated.has(index)) return '#374151'
    if (index === current.mid) return '#ef4444'
    if (index >= current.left && index <= current.right) return '#3b82f6'
    return '#374151'
  }

  const getBoxBorder = (index: number): string => {
    if (current.found && index === current.foundIndex) return '3px solid #4ade80'
    if (index === current.mid) return '3px solid #f87171'
    if (index === current.left) return '3px solid #60a5fa'
    if (index === current.right) return '3px solid #a78bfa'
    return '1px solid #4b5563'
  }

  const getBoxOpacity = (index: number): number => {
    if (current.eliminated.has(index)) return 0.3
    return 1
  }

  return (
    <div className="visualization-container">
      {/* Mode selector and target input */}
      <div className="viz-controls">
        <select
          value={mode}
          onChange={e => {
            setMode(e.target.value as SearchMode)
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
          <option value="standard">标准查找</option>
          <option value="findFirst">查找首次出现</option>
          <option value="findLast">查找末次出现</option>
          <option value="insertPosition">查找插入位置</option>
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
          目标值:
          <input
            type="text"
            value={targetInput}
            onChange={e => setTargetInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSetTarget() }}
            placeholder={String(target)}
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
          <button className="btn btn-primary" onClick={handleSetTarget}>
            设置
          </button>
        </label>

        <button className="btn btn-primary" onClick={generateSteps}>
          开始搜索
        </button>
        <button className="btn btn-secondary" onClick={handleRandomize}>
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

      {/* Array visualization */}
      <div
        className="viz-canvas"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          minHeight: '200px',
          padding: '1.5rem 0.5rem',
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
                color: index === current.left || index === current.right
                  ? '#60a5fa'
                  : 'var(--text-secondary)',
                fontWeight: index === current.left || index === current.right ? 'bold' : 'normal',
              }}
            >
              [{index}]
            </div>
          ))}
        </div>

        {/* Array boxes */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {current.array.map((value, index) => (
            <div
              key={`box-${index}`}
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                background: getBoxColor(index),
                border: getBoxBorder(index),
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                fontFamily: 'Consolas, Monaco, monospace',
                opacity: getBoxOpacity(index),
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              {value}
              {/* Mid indicator */}
              {index === current.mid && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    fontSize: '0.65rem',
                    color: '#f87171',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}
                >
                  mid
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pointer labels */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
          {current.array.map((_, index) => (
            <div
              key={`ptr-${index}`}
              style={{
                width: '48px',
                textAlign: 'center',
                fontSize: '0.65rem',
                height: '16px',
              }}
            >
              {index === current.left && index === current.right
                ? <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>L=R</span>
                : index === current.left
                  ? <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>L</span>
                  : index === current.right
                    ? <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>R</span>
                    : null
              }
            </div>
          ))}
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
          搜索范围
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px', display: 'inline-block' }} />
          中间位置 (mid)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
          找到目标
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#374151', borderRadius: '2px', display: 'inline-block', opacity: 0.5 }} />
          已排除
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>模式: {MODE_LABELS[mode]}</span>
          <span>目标值: {target}</span>
          <span>比较次数: {current.comparisonCount}</span>
          {current.left >= 0 && current.right < current.array.length && (
            <span>搜索范围: [{current.left}, {current.right}]</span>
          )}
        </div>
      </div>
    </div>
  )
}
