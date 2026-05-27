import { useState, useCallback, useRef, useEffect } from 'react'

interface SortStep {
  array: number[]
  comparing: number[]
  minIndex: number
  sortedBoundary: number
  description: string
}

function generateSteps(input: number[]): SortStep[] {
  const arr = [...input]
  const steps: SortStep[] = []
  const n = arr.length

  steps.push({
    array: [...arr],
    comparing: [],
    minIndex: -1,
    sortedBoundary: 0,
    description: '初始数组',
  })

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i

    steps.push({
      array: [...arr],
      comparing: [],
      minIndex: minIdx,
      sortedBoundary: i,
      description: `第 ${i + 1} 轮：假设最小值在位置 ${i}（值为 ${arr[i]}）`,
    })

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        comparing: [minIdx, j],
        minIndex: minIdx,
        sortedBoundary: i,
        description: `比较 ${arr[minIdx]} 和 ${arr[j]}`,
      })

      if (arr[j] < arr[minIdx]) {
        minIdx = j
        steps.push({
          array: [...arr],
          comparing: [],
          minIndex: minIdx,
          sortedBoundary: i,
          description: `发现更小值 ${arr[minIdx]}，更新最小值位置`,
        })
      }
    }

    if (minIdx !== i) {
      steps.push({
        array: [...arr],
        comparing: [i, minIdx],
        minIndex: minIdx,
        sortedBoundary: i,
        description: `交换位置 ${i}（${arr[i]}）和位置 ${minIdx}（${arr[minIdx]}）`,
      })
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
    }

    steps.push({
      array: [...arr],
      comparing: [],
      minIndex: -1,
      sortedBoundary: i + 1,
      description: `第 ${i + 1} 轮结束，${arr[i]} 就位`,
    })
  }

  steps.push({
    array: [...arr],
    comparing: [],
    minIndex: -1,
    sortedBoundary: n,
    description: '排序完成！',
  })

  return steps
}

const DEFAULT_ARRAY = [64, 25, 12, 22, 11, 90, 45]

export default function SelectionSortVisualization() {
  const [array, setArray] = useState<number[]>([...DEFAULT_ARRAY])
  const [steps, setSteps] = useState<SortStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [isStarted, setIsStarted] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = steps[currentStep] ?? null

  const initSort = useCallback((arr: number[]) => {
    const newSteps = generateSteps(arr)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
    setIsStarted(true)
  }, [])

  const handleStart = useCallback(() => {
    initSort(array)
  }, [array, initSort])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setArray([...DEFAULT_ARRAY])
    setSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
    setIsStarted(false)
    setCustomInput('')
  }, [])

  const handleRandomArray = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    const len = 6 + Math.floor(Math.random() * 5)
    const newArr = Array.from({ length: len }, () =>
      Math.floor(Math.random() * 90) + 10
    )
    setArray(newArr)
    setSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
    setIsStarted(false)
  }, [])

  const handleCustomInput = useCallback(() => {
    const nums = customInput
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n))
    if (nums.length >= 2 && nums.length <= 15) {
      if (timerRef.current) clearInterval(timerRef.current)
      setArray(nums)
      setSteps([])
      setCurrentStep(0)
      setIsPlaying(false)
      setIsStarted(false)
    }
  }, [customInput])

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const goPrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, speed, steps.length])

  const togglePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying((prev) => !prev)
  }, [currentStep, steps.length])

  const displayArray = current?.array ?? array
  const maxVal = Math.max(...(displayArray.length ? displayArray : [1]))

  const getBarColor = (index: number): string => {
    if (!current) return '#60a5fa'
    if (current.sortedBoundary > 0 && index < current.sortedBoundary)
      return '#4ade80'
    if (current.comparing.includes(index)) return '#f87171'
    if (current.minIndex === index) return '#fbbf24'
    return '#60a5fa'
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 700 }}>
        选择排序可视化
      </h2>
      <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '14px' }}>
        每轮从未排序部分选出最小元素，放到已排序末尾
      </p>

      {/* 输入区域 */}
      {!isStarted && (
        <div
          style={{
            marginBottom: '20px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="输入数组，如: 64,25,12,22,11"
            style={{
              padding: '8px 12px',
              border: '1px solid #374151',
              borderRadius: '6px',
              background: '#1f2937',
              color: '#e5e7eb',
              fontSize: '14px',
              flex: 1,
              minWidth: '200px',
            }}
          />
          <button
            onClick={handleCustomInput}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            使用自定义数组
          </button>
          <button
            onClick={handleRandomArray}
            style={{
              padding: '8px 16px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            随机数组
          </button>
          <button
            onClick={handleStart}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            开始排序
          </button>
        </div>
      )}

      {/* 当前数组展示 */}
      {!isStarted && (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          {array.map((val, i) => (
            <span
              key={i}
              style={{
                padding: '6px 12px',
                background: '#1f2937',
                borderRadius: '4px',
                color: '#e5e7eb',
                fontSize: '14px',
              }}
            >
              {val}
            </span>
          ))}
        </div>
      )}

      {/* 可视化区域 */}
      {isStarted && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '4px',
              height: '220px',
              padding: '16px',
              background: '#111827',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            {displayArray.map((val, i) => {
              const height = (val / maxVal) * 180
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#d1d5db',
                      marginBottom: '4px',
                    }}
                  >
                    {val}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '50px',
                      height: `${height}px`,
                      background: getBarColor(i),
                      borderRadius: '4px 4px 0 0',
                      transition: 'background 0.2s ease, height 0.3s ease',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      marginTop: '4px',
                    }}
                  >
                    {i}
                  </span>
                </div>
              )
            })}
          </div>

          {/* 图例 */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#9ca3af',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  background: '#60a5fa',
                  borderRadius: '2px',
                  display: 'inline-block',
                }}
              />
              未排序
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  background: '#4ade80',
                  borderRadius: '2px',
                  display: 'inline-block',
                }}
              />
              已排序
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  background: '#fbbf24',
                  borderRadius: '2px',
                  display: 'inline-block',
                }}
              />
              当前最小值
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  background: '#f87171',
                  borderRadius: '2px',
                  display: 'inline-block',
                }}
              />
              正在比较
            </span>
          </div>

          {/* 状态面板 */}
          <div
            style={{
              padding: '12px 16px',
              background: '#1f2937',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#e5e7eb',
            }}
          >
            <div style={{ marginBottom: '4px' }}>
              <strong>步骤：</strong>
              {currentStep + 1} / {steps.length}
            </div>
            <div>{current?.description}</div>
          </div>

          {/* 控制面板 */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setCurrentStep(0)}
              style={{
                padding: '8px 14px',
                background: '#374151',
                color: '#e5e7eb',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              重置
            </button>
            <button
              onClick={goPrev}
              disabled={currentStep <= 0}
              style={{
                padding: '8px 14px',
                background: currentStep <= 0 ? '#1f2937' : '#374151',
                color: currentStep <= 0 ? '#4b5563' : '#e5e7eb',
                border: 'none',
                borderRadius: '6px',
                cursor: currentStep <= 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              上一步
            </button>
            <button
              onClick={togglePlay}
              style={{
                padding: '8px 18px',
                background: isPlaying ? '#ef4444' : '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重播' : '播放'}
            </button>
            <button
              onClick={goNext}
              disabled={currentStep >= steps.length - 1}
              style={{
                padding: '8px 14px',
                background:
                  currentStep >= steps.length - 1 ? '#1f2937' : '#374151',
                color: currentStep >= steps.length - 1 ? '#4b5563' : '#e5e7eb',
                border: 'none',
                borderRadius: '6px',
                cursor:
                  currentStep >= steps.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              下一步
            </button>

            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>速度：</span>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{
                  padding: '6px 10px',
                  background: '#1f2937',
                  color: '#e5e7eb',
                  border: '1px solid #374151',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                <option value={1000}>慢 (1s)</option>
                <option value={500}>正常 (0.5s)</option>
                <option value={200}>快 (0.2s)</option>
                <option value={80}>极快 (0.08s)</option>
              </select>
            </div>
          </div>

          {/* 重新开始按钮 */}
          <button
            onClick={handleReset}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            重新开始
          </button>
        </>
      )}
    </div>
  )
}
