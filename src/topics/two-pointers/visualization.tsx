import { useState, useEffect, useRef, useCallback } from 'react'

interface TwoPointerStep {
  array: number[]
  left: number
  right: number
  found: boolean
  foundIndices: number[]
  description: string
  highlight: Record<number, string>  // index -> color
  slow?: number
  fast?: number
}

type VizMode = 'twoSum' | 'maxArea' | 'cycleDetect' | 'removeDups'

const MODE_LABELS: Record<VizMode, string> = {
  twoSum: '两数之和',
  maxArea: '盛最多水',
  cycleDetect: '环检测',
  removeDups: '去重',
}

function generateTwoSumSteps(arr: number[], target: number): TwoPointerStep[] {
  const sorted = [...arr].sort((a, b) => a - b)
  const steps: TwoPointerStep[] = []

  steps.push({
    array: [...sorted],
    left: 0,
    right: sorted.length - 1,
    found: false,
    foundIndices: [],
    description: `开始查找，目标和 = ${target}，left=0, right=${sorted.length - 1}`,
    highlight: { [0]: '#3b82f6', [sorted.length - 1]: '#a78bfa' },
  })

  let left = 0
  let right = sorted.length - 1

  while (left < right) {
    const sum = sorted[left] + sorted[right]
    const hl: Record<number, string> = { [left]: '#3b82f6', [right]: '#a78bfa' }

    if (sum === target) {
      steps.push({
        array: [...sorted],
        left, right,
        found: true,
        foundIndices: [left, right],
        description: `sorted[${left}]=${sorted[left]} + sorted[${right}]=${sorted[right]} = ${sum} == ${target}，找到！`,
        highlight: { [left]: '#22c55e', [right]: '#22c55e' },
      })
      return steps
    } else if (sum < target) {
      steps.push({
        array: [...sorted],
        left, right,
        found: false,
        foundIndices: [],
        description: `${sorted[left]} + ${sorted[right]} = ${sum} < ${target}，left 右移`,
        highlight: hl,
      })
      left++
    } else {
      steps.push({
        array: [...sorted],
        left, right,
        found: false,
        foundIndices: [],
        description: `${sorted[left]} + ${sorted[right]} = ${sum} > ${target}，right 左移`,
        highlight: hl,
      })
      right--
    }
  }

  steps.push({
    array: [...sorted],
    left, right,
    found: false,
    foundIndices: [],
    description: `left >= right，未找到和为 ${target} 的两个数`,
    highlight: {},
  })

  return steps
}

function generateMaxAreaSteps(arr: number[]): TwoPointerStep[] {
  const steps: TwoPointerStep[] = []

  steps.push({
    array: [...arr],
    left: 0,
    right: arr.length - 1,
    found: false,
    foundIndices: [],
    description: `开始查找最大面积，left=0, right=${arr.length - 1}`,
    highlight: { [0]: '#3b82f6', [arr.length - 1]: '#a78bfa' },
  })

  let left = 0
  let right = arr.length - 1
  let maxArea = 0
  let maxLeft = 0
  let maxRight = 0

  while (left < right) {
    const width = right - left
    const h = Math.min(arr[left], arr[right])
    const area = h * width

    if (area > maxArea) {
      maxArea = area
      maxLeft = left
      maxRight = right
    }

    const hl: Record<number, string> = { [left]: '#3b82f6', [right]: '#a78bfa' }

    steps.push({
      array: [...arr],
      left, right,
      found: false,
      foundIndices: [],
      description: `min(${arr[left]}, ${arr[right]}) * ${width} = ${area}，当前最大=${maxArea}，${arr[left] < arr[right] ? 'left 右移' : 'right 左移'}`,
      highlight: hl,
    })

    if (arr[left] < arr[right]) {
      left++
    } else {
      right--
    }
  }

  // Final step showing the best answer
  steps.push({
    array: [...arr],
    left: maxLeft,
    right: maxRight,
    found: true,
    foundIndices: [maxLeft, maxRight],
    description: `最大面积: min(${arr[maxLeft]}, ${arr[maxRight]}) * ${maxRight - maxLeft} = ${maxArea}`,
    highlight: { [maxLeft]: '#22c55e', [maxRight]: '#22c55e' },
  })

  return steps
}

function generateCycleDetectSteps(): TwoPointerStep[] {
  const nodes = [1, 2, 3, 4, 5, 6]
  const nextIdx = [1, 2, 3, 4, 5, 3]  // 6 -> 3, 形成环
  const steps: TwoPointerStep[] = []
  const arr = [...nodes]

  let slow = 0
  let fast = 0
  let stepNum = 0

  steps.push({
    array: arr,
    left: 0,
    right: 0,
    found: false,
    foundIndices: [],
    description: `链表: 1→2→3→4→5→6→3(环)。slow 和 fast 都从节点 1 出发`,
    highlight: { [0]: '#3b82f6' },
    slow: 0,
    fast: 0,
  })

  while (true) {
    stepNum++
    slow = nextIdx[slow]
    fast = nextIdx[nextIdx[fast]]

    const hl: Record<number, string> = {}
    // Mark visited nodes
    for (let i = 0; i < slow; i++) hl[i] = '#4b5563'
    hl[slow] = '#f97316'  // slow pointer - orange
    hl[fast] = '#a78bfa'  // fast pointer - purple

    steps.push({
      array: arr,
      left: slow,
      right: fast,
      found: false,
      foundIndices: [],
      description: `第${stepNum}步: slow -> 节点${nodes[slow]}, fast -> 节点${nodes[fast]}`,
      highlight: hl,
      slow,
      fast,
    })

    if (slow === fast) {
      const hlMeet: Record<number, string> = {}
      for (let i = 0; i < nodes.length; i++) hlMeet[i] = '#4b5563'
      hlMeet[slow] = '#22c55e'
      steps.push({
        array: arr,
        left: slow,
        right: fast,
        found: true,
        foundIndices: [slow],
        description: `在节点 ${nodes[slow]} 处相遇！链表存在环`,
        highlight: hlMeet,
        slow,
        fast,
      })
      break
    }

    if (stepNum > 15) break
  }

  return steps
}

function generateRemoveDupsSteps(arr: number[]): TwoPointerStep[] {
  const workArr = [...arr]
  const steps: TwoPointerStep[] = []

  let slow = 0
  steps.push({
    array: [...workArr],
    left: 0,
    right: 1,
    found: false,
    foundIndices: [],
    description: `初始: slow=0, 开始遍历`,
    highlight: { [0]: '#3b82f6' },
    slow: 0,
    fast: 0,
  })

  for (let fast = 1; fast < workArr.length; fast++) {
    const hl: Record<number, string> = {}
    // Mark processed
    for (let i = 0; i <= slow; i++) hl[i] = '#3b82f6'
    hl[fast] = '#f97316'  // fast pointer

    if (workArr[fast] !== workArr[slow]) {
      slow++
      workArr[slow] = workArr[fast]
      hl[slow] = '#22c55e'
      steps.push({
        array: [...workArr],
        left: slow,
        right: fast,
        found: false,
        foundIndices: [],
        description: `arr[${fast}]=${workArr[fast]} != arr[${slow - 1}]=${workArr[slow - 1]}，slow 移到 ${slow}，复制值 ${workArr[fast]}`,
        highlight: hl,
        slow,
        fast,
      })
    } else {
      steps.push({
        array: [...workArr],
        left: slow,
        right: fast,
        found: false,
        foundIndices: [],
        description: `arr[${fast}]=${workArr[fast]} == arr[${slow}]=${workArr[slow]}，跳过重复`,
        highlight: hl,
        slow,
        fast,
      })
    }
  }

  const newLen = slow + 1
  const hlFinal: Record<number, string> = {}
  for (let i = 0; i < newLen; i++) hlFinal[i] = '#22c55e'
  for (let i = newLen; i < workArr.length; i++) hlFinal[i] = '#374151'

  steps.push({
    array: [...workArr],
    left: slow,
    right: workArr.length - 1,
    found: true,
    foundIndices: [],
    description: `去重完成！新长度 = ${newLen}，数组: [${workArr.slice(0, newLen).join(', ')}]`,
    highlight: hlFinal,
    slow,
    fast: workArr.length - 1,
  })

  return steps
}

export default function TwoPointersVisualization() {
  const [mode, setMode] = useState<VizMode>('twoSum')
  const [inputArray, setInputArray] = useState<number[]>([1, 2, 3, 4, 6, 8, 9, 11, 15])
  const [target, setTarget] = useState(10)
  const [targetInput, setTargetInput] = useState('')
  const [steps, setSteps] = useState<TwoPointerStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)

    let newSteps: TwoPointerStep[] = []
    if (mode === 'twoSum') {
      newSteps = generateTwoSumSteps(inputArray, target)
    } else if (mode === 'maxArea') {
      newSteps = generateMaxAreaSteps(inputArray)
    } else if (mode === 'cycleDetect') {
      newSteps = generateCycleDetectSteps()
    } else if (mode === 'removeDups') {
      const sorted = [...inputArray].sort((a, b) => a - b)
      // Add some duplicates for demo
      const withDups: number[] = []
      for (const v of sorted) {
        withDups.push(v)
        if (Math.random() < 0.4) withDups.push(v)
        if (Math.random() < 0.2) withDups.push(v)
      }
      setInputArray(withDups)
      newSteps = generateRemoveDupsSteps(withDups)
    }

    setSteps(newSteps)
    setCurrentStep(0)
  }, [mode, inputArray, target])

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
    const newArr: number[] = []
    let current = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < 12; i++) {
      newArr.push(current)
      current += Math.floor(Math.random() * 4) + 1
    }
    setInputArray(newArr)
    setTargetInput('')
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const handleSetTarget = useCallback(() => {
    const val = parseInt(targetInput, 10)
    if (!isNaN(val)) {
      setTarget(val)
      setTargetInput('')
    }
  }, [targetInput])

  const current = steps[currentStep] || steps[0] || {
    array: inputArray,
    left: 0,
    right: inputArray.length - 1,
    found: false,
    foundIndices: [],
    description: '点击"生成步骤"或"播放"开始演示',
    highlight: {},
  }

  const getBoxColor = (index: number): string => {
    if (current.highlight[index]) return current.highlight[index]
    if (current.foundIndices.includes(index)) return '#22c55e'
    return '#1e293b'
  }

  const getBoxBorder = (index: number): string => {
    if (current.foundIndices.includes(index)) return '3px solid #4ade80'
    if (current.slow === index) return '3px solid #fb923c'
    if (current.fast === index) return '3px solid #c084fc'
    if (index === current.left) return '3px solid #60a5fa'
    if (index === current.right) return '3px solid #a78bfa'
    return '1px solid #4b5563'
  }

  const isCycleMode = mode === 'cycleDetect'
  const isRemoveDupsMode = mode === 'removeDups'

  return (
    <div className="visualization-container">
      {/* Mode selector */}
      <div className="viz-controls">
        <select
          value={mode}
          onChange={e => {
            setMode(e.target.value as VizMode)
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
          <option value="twoSum">两数之和 (对撞指针)</option>
          <option value="maxArea">盛最多水 (对撞指针)</option>
          <option value="cycleDetect">环检测 (快慢指针)</option>
          <option value="removeDups">去重 (快慢指针)</option>
        </select>

        {mode === 'twoSum' && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}
          >
            目标和:
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
        )}

        <button className="btn btn-primary" onClick={generateSteps}>
          生成步骤
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
                width: isCycleMode ? '40px' : '48px',
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
                width: isCycleMode ? '40px' : '48px',
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
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              {value}
              {/* Cycle mode: show arrow indicator */}
              {isCycleMode && index === current.foundIndices[0] && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-20px',
                    fontSize: '0.65rem',
                    color: '#4ade80',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                  }}
                >
                  环入口
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pointer labels */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
          {current.array.map((_, index) => {
            const labels: string[] = []
            if (isCycleMode || isRemoveDupsMode) {
              if (current.slow === index) labels.push('slow')
              if (current.fast === index) labels.push('fast')
            } else {
              if (index === current.left && index === current.right) {
                labels.push('L=R')
              } else {
                if (index === current.left) labels.push('L')
                if (index === current.right) labels.push('R')
              }
            }

            return (
              <div
                key={`ptr-${index}`}
                style={{
                  width: isCycleMode ? '40px' : '48px',
                  textAlign: 'center',
                  fontSize: '0.65rem',
                  height: '16px',
                }}
              >
                {labels.length > 0 && labels.map((label, i) => (
                  <span
                    key={i}
                    style={{
                      color: label === 'L' || label === 'L=R'
                        ? '#60a5fa'
                        : label === 'R'
                          ? '#a78bfa'
                          : label === 'slow'
                            ? '#fb923c'
                            : '#c084fc',
                      fontWeight: 'bold',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            )
          })}
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
        {(isCycleMode || isRemoveDupsMode) ? (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#f97316', borderRadius: '2px', display: 'inline-block' }} />
              slow 指针
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#a78bfa', borderRadius: '2px', display: 'inline-block' }} />
              fast 指针
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
              {isCycleMode ? '相遇点 / 环入口' : '已保留'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#374151', borderRadius: '2px', display: 'inline-block', opacity: 0.5 }} />
              已排除
            </span>
          </>
        ) : (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
              左指针 (left)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#a78bfa', borderRadius: '2px', display: 'inline-block' }} />
              右指针 (right)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
              找到答案
            </span>
          </>
        )}
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>模式: {MODE_LABELS[mode]}</span>
          {mode === 'twoSum' && <span>目标和: {target}</span>}
          <span>步骤: {currentStep + 1}/{steps.length}</span>
        </div>
      </div>
    </div>
  )
}
