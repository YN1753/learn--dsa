import { useState, useEffect, useRef, useCallback } from 'react'

interface SortStep {
  description: string
  array: number[]
  pivotIdx: number | null
  comparingIdx: number | null
  sortedIndices: number[]
  partitionRange: [number, number] | null
  stage: 'select' | 'partition' | 'done'
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function RandomizedAlgorithmVisualization() {
  const [array, setArray] = useState<number[]>([38, 27, 43, 3, 9, 82, 10, 55, 21, 64])
  const [steps, setSteps] = useState<SortStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [pivotIdx, setPivotIdx] = useState<number | null>(null)
  const [comparingIdx, setComparingIdx] = useState<number | null>(null)
  const [sortedIndices, setSortedIndices] = useState<number[]>([])
  const [partitionRange, setPartitionRange] = useState<[number, number] | null>(null)
  const [description, setDescription] = useState<string>('点击「开始排序」观察随机快速排序过程')
  const [stage, setStage] = useState<'select' | 'partition' | 'done'>('select')
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((inputArr: number[]): SortStep[] => {
    const arr = [...inputArr]
    const allSteps: SortStep[] = []
    const sorted: number[] = []

    allSteps.push({
      description: '初始数组，准备开始随机快速排序',
      array: [...arr],
      pivotIdx: null,
      comparingIdx: null,
      sortedIndices: [],
      partitionRange: null,
      stage: 'select',
    })

    function rqs(lo: number, hi: number): void {
      if (lo > hi) return
      if (lo === hi) {
        sorted.push(lo)
        allSteps.push({
          description: `子数组 [${lo}] 只有一个元素 ${arr[lo]}，已排序`,
          array: [...arr],
          pivotIdx: null,
          comparingIdx: null,
          sortedIndices: [...sorted],
          partitionRange: null,
          stage: 'done',
        })
        return
      }

      // Random pivot selection
      const pivotPos = randomInt(lo, hi)
      allSteps.push({
        description: `在范围 [${lo}..${hi}] 中随机选择 pivot: 索引 ${pivotPos}，值 ${arr[pivotPos]}`,
        array: [...arr],
        pivotIdx: pivotPos,
        comparingIdx: null,
        sortedIndices: [...sorted],
        partitionRange: [lo, hi],
        stage: 'select',
      })

      // Swap pivot to end
      ;[arr[pivotPos], arr[hi]] = [arr[hi], arr[pivotPos]]
      const pivotVal = arr[hi]
      allSteps.push({
        description: `将 pivot ${pivotVal} 交换到末尾位置 ${hi}`,
        array: [...arr],
        pivotIdx: hi,
        comparingIdx: null,
        sortedIndices: [...sorted],
        partitionRange: [lo, hi],
        stage: 'partition',
      })

      // Partition
      let i = lo
      for (let j = lo; j < hi; j++) {
        allSteps.push({
          description: `比较 arr[${j}]=${arr[j]} 与 pivot=${pivotVal}`,
          array: [...arr],
          pivotIdx: hi,
          comparingIdx: j,
          sortedIndices: [...sorted],
          partitionRange: [lo, hi],
          stage: 'partition',
        })

        if (arr[j] <= pivotVal) {
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          allSteps.push({
            description: `${arr[j] <= pivotVal ? arr[j] : arr[i]} <= ${pivotVal}，交换到位置 ${i}`,
            array: [...arr],
            pivotIdx: hi,
            comparingIdx: i,
            sortedIndices: [...sorted],
            partitionRange: [lo, hi],
            stage: 'partition',
          })
          i++
        }
      }

      // Place pivot in final position
      ;[arr[i], arr[hi]] = [arr[hi], arr[i]]
      sorted.push(i)
      allSteps.push({
        description: `将 pivot ${pivotVal} 放到最终位置 ${i}`,
        array: [...arr],
        pivotIdx: i,
        comparingIdx: null,
        sortedIndices: [...sorted],
        partitionRange: [lo, hi],
        stage: 'done',
      })

      rqs(lo, i - 1)
      rqs(i + 1, hi)
    }

    rqs(0, arr.length - 1)

    allSteps.push({
      description: '排序完成！所有元素已就位',
      array: [...arr],
      pivotIdx: null,
      comparingIdx: null,
      sortedIndices: Array.from({ length: arr.length }, (_, idx) => idx),
      partitionRange: null,
      stage: 'done',
    })

    return allSteps
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setArray([...step.array])
      setPivotIdx(step.pivotIdx)
      setComparingIdx(step.comparingIdx)
      setSortedIndices(step.sortedIndices)
      setPartitionRange(step.partitionRange)
      setDescription(step.description)
      setStage(step.stage)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const inputArr = [38, 27, 43, 3, 9, 82, 10, 55, 21, 64]
    const generatedSteps = generateSteps(inputArr)
    setSteps(generatedSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setSortedIndices([])
    setPivotIdx(null)
    setComparingIdx(null)
    setPartitionRange(null)
    setStage('select')
    setArray([...inputArr])
    setDescription('开始随机快速排序...')
  }

  const handleShuffle = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const newArr = Array.from({ length: 10 }, () => randomInt(3, 99))
    setArray(newArr)
    setSteps([])
    setCurrentStep(0)
    setSortedIndices([])
    setPivotIdx(null)
    setComparingIdx(null)
    setPartitionRange(null)
    setStage('select')
    setDescription('已生成新数组，点击「开始排序」')
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStep = () => {
    if (steps.length === 0) {
      const inputArr = [...array]
      const generatedSteps = generateSteps(inputArr)
      setSteps(generatedSteps)
      setCurrentStep(0)
    }
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setArray([...step.array])
      setPivotIdx(step.pivotIdx)
      setComparingIdx(step.comparingIdx)
      setSortedIndices(step.sortedIndices)
      setPartitionRange(step.partitionRange)
      setDescription(step.description)
      setStage(step.stage)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const defaultArr = [38, 27, 43, 3, 9, 82, 10, 55, 21, 64]
    setArray(defaultArr)
    setSteps([])
    setCurrentStep(0)
    setSortedIndices([])
    setPivotIdx(null)
    setComparingIdx(null)
    setPartitionRange(null)
    setStage('select')
    setDescription('已重置，点击「开始排序」')
  }

  const getBarColor = (index: number): string => {
    if (sortedIndices.includes(index)) return '#22c55e'
    if (index === pivotIdx) return '#f59e0b'
    if (index === comparingIdx) return '#3b82f6'
    if (partitionRange && index >= partitionRange[0] && index <= partitionRange[1]) return '#6366f1'
    return 'var(--bg-card)'
  }

  const getBarBorder = (index: number): string => {
    if (index === pivotIdx) return '#fbbf24'
    if (index === comparingIdx) return '#60a5fa'
    return 'var(--border)'
  }

  const maxVal = Math.max(...array, 1)
  const barAreaHeight = 220
  const barWidth = Math.min(48, Math.max(24, Math.floor(560 / array.length)))
  const gap = Math.max(4, Math.floor(barWidth * 0.25))
  const totalWidth = array.length * (barWidth + gap) + gap
  const startX = Math.max(20, Math.floor((600 - totalWidth) / 2))

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始排序
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying}>
          单步执行
        </button>
        <button className="btn btn-primary" onClick={handleShuffle} disabled={isPlaying}>
          随机数组
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="100"
            max="1500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        <svg width="100%" viewBox={`0 0 600 ${barAreaHeight + 40}`} style={{ maxWidth: 640 }}>
          {array.map((val, idx) => {
            const barHeight = Math.max(8, Math.floor((val / maxVal) * (barAreaHeight - 30)))
            const x = startX + idx * (barWidth + gap)
            const y = barAreaHeight - barHeight

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="3"
                  fill={getBarColor(idx)}
                  stroke={getBarBorder(idx)}
                  strokeWidth={idx === pivotIdx || idx === comparingIdx ? 2.5 : 1}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  fill="var(--text-primary)"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {val}
                </text>
                {idx === pivotIdx && (
                  <text
                    x={x + barWidth / 2}
                    y={barAreaHeight + 16}
                    fill="#f59e0b"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    pivot
                  </text>
                )}
                {idx === comparingIdx && idx !== pivotIdx && (
                  <text
                    x={x + barWidth / 2}
                    y={barAreaHeight + 16}
                    fill="#3b82f6"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    比较
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          Pivot
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          比较中
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#6366f1', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前分区
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已确定位置
        </span>
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
        <strong>算法信息：</strong>
        期望时间 O(n log n) | 步骤 {steps.length > 0 ? `${currentStep}/${steps.length}` : '未开始'} | 当前阶段: {stage === 'select' ? '选择 Pivot' : stage === 'partition' ? '划分中' : '已完成'}
      </div>
    </div>
  )
}
