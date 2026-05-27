import { useState, useEffect, useRef, useCallback } from 'react'

// Types
interface ShellStep {
  array: number[]
  comparing: number[]
  moving: number[]
  grouped: number[][]
  currentGap: number
  gapIndex: number
  sorted: boolean
  description: string
}

// Knuth gap sequence: 1, 4, 13, 40, 121, ...  (h = 3h + 1, stop before n/3)
function knuthGaps(n: number): number[] {
  const gaps: number[] = []
  let h = 1
  while (h < Math.floor(n / 3)) {
    h = 3 * h + 1
  }
  while (h >= 1) {
    gaps.push(h)
    h = Math.floor(h / 3)
  }
  return gaps
}

// Build index groups for a given gap value
function buildGroups(n: number, gap: number): number[][] {
  const groups: number[][] = []
  for (let start = 0; start < gap; start++) {
    const group: number[] = []
    for (let i = start; i < n; i += gap) {
      group.push(i)
    }
    groups.push(group)
  }
  return groups
}

// Generate all step-by-step frames for Shell sort with Knuth sequence
function generateSteps(inputArr: number[]): ShellStep[] {
  const steps: ShellStep[] = []
  const arr = [...inputArr]
  const n = arr.length
  const gaps = knuthGaps(n)

  steps.push({
    array: [...arr],
    comparing: [],
    moving: [],
    grouped: [],
    currentGap: 0,
    gapIndex: -1,
    sorted: false,
    description: `Knuth 增量序列: [${gaps.join(', ')}]，开始希尔排序`,
  })

  for (let gi = 0; gi < gaps.length; gi++) {
    const gap = gaps[gi]
    const groups = buildGroups(n, gap)

    // Announce this gap pass
    steps.push({
      array: [...arr],
      comparing: [],
      moving: [],
      grouped: groups,
      currentGap: gap,
      gapIndex: gi,
      sorted: false,
      description: `gap = ${gap}，将数组分为 ${groups.length} 组，对每组进行间隔为 ${gap} 的插入排序`,
    })

    // Insertion sort within each subsequence defined by this gap
    for (let i = gap; i < n; i++) {
      const temp = arr[i]
      let j = i

      steps.push({
        array: [...arr],
        comparing: [i],
        moving: [],
        grouped: groups,
        currentGap: gap,
        gapIndex: gi,
        sorted: false,
        description: `gap=${gap}: 取出 arr[${i}]=${temp}，准备在其间隔子序列中插入`,
      })

      while (j >= gap && arr[j - gap] > temp) {
        steps.push({
          array: [...arr],
          comparing: [j - gap, j],
          moving: [],
          grouped: groups,
          currentGap: gap,
          gapIndex: gi,
          sorted: false,
          description: `gap=${gap}: arr[${j - gap}]=${arr[j - gap]} > ${temp}，右移`,
        })
        arr[j] = arr[j - gap]
        j -= gap
      }

      arr[j] = temp

      if (j !== i) {
        steps.push({
          array: [...arr],
          comparing: [],
          moving: [j],
          grouped: groups,
          currentGap: gap,
          gapIndex: gi,
          sorted: false,
          description: `gap=${gap}: 将 ${temp} 插入到位置 ${j}`,
        })
      }
    }

    // Gap pass complete
    steps.push({
      array: [...arr],
      comparing: [],
      moving: [],
      grouped: groups,
      currentGap: gap,
      gapIndex: gi,
      sorted: gi === gaps.length - 1,
      description: `gap = ${gap} 排序完成: [${arr.join(', ')}]`,
    })
  }

  // Final step
  steps.push({
    array: [...arr],
    comparing: [],
    moving: [],
    grouped: [],
    currentGap: 0,
    gapIndex: gaps.length,
    sorted: true,
    description: '希尔排序完成！',
  })

  return steps
}

function randomArray(size: number): number[] {
  const arr: number[] = []
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 90) + 10)
  }
  return arr
}

// Distinct colors for gap groups
const GROUP_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
]

export default function ShellSortVisualization() {
  const [inputArray, setInputArray] = useState<number[]>(() => randomArray(20))
  const [steps, setSteps] = useState<ShellStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(350)
  const timerRef = useRef<number | null>(null)

  const resetVisualization = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newSteps = generateSteps(inputArray)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [inputArray])

  const randomize = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newArr = randomArray(20)
    setInputArray(newArr)
    const newSteps = generateSteps(newArr)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [])

  // Initialize on mount
  useEffect(() => {
    const newSteps = generateSteps(inputArray)
    setSteps(newSteps)
    setCurrentStep(0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play loop
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
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1)
  }, [currentStep, steps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }, [currentStep])

  const current = steps[currentStep] || steps[0] || {
    array: inputArray,
    comparing: [],
    moving: [],
    grouped: [],
    currentGap: 0,
    gapIndex: -1,
    sorted: false,
    description: '点击 "播放" 或 "下一步" 开始排序演示',
  }

  const maxVal = Math.max(...current.array, 1)
  const barWidth = Math.max(8, Math.min(30, 500 / current.array.length))

  // Map each array index to its group number for coloring
  const indexToGroup = new Map<number, number>()
  current.grouped.forEach((group, gi) => {
    group.forEach(idx => indexToGroup.set(idx, gi))
  })

  // Bar color priority: sorted > moving (red) > comparing (yellow) > group color > default
  const getBarColor = (index: number): string => {
    if (current.sorted && current.currentGap === 0) return 'var(--success)'
    if (current.moving.includes(index)) return '#ef4444'
    if (current.comparing.includes(index)) return 'var(--warning)'
    if (indexToGroup.has(index)) {
      return GROUP_COLORS[indexToGroup.get(index)! % GROUP_COLORS.length]
    }
    return 'var(--bg-card)'
  }

  const getBarBorder = (index: number): string => {
    if (current.moving.includes(index)) return '2px solid #dc2626'
    if (current.comparing.includes(index)) return '2px solid var(--warning)'
    if (indexToGroup.has(index)) {
      return `1px solid ${GROUP_COLORS[indexToGroup.get(index)! % GROUP_COLORS.length]}`
    }
    return '1px solid var(--border)'
  }

  const getBarOpacity = (index: number): number => {
    if (current.currentGap === 0 || current.sorted) return 1
    return indexToGroup.has(index) ? 1 : 0.3
  }

  const gaps = knuthGaps(inputArray.length)

  return (
    <div className="visualization-container">
      {/* Top controls */}
      <div className="viz-controls">
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

      {/* Prominent gap display */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem',
          margin: '0.5rem 0',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-secondary, var(--bg-card))',
        }}
      >
        <div
          style={{
            fontSize: '1.4rem',
            fontWeight: 'bold',
            color: current.currentGap > 0 ? 'var(--accent)' : 'var(--text-secondary)',
            letterSpacing: '0.02em',
          }}
        >
          {current.currentGap > 0 ? `gap = ${current.currentGap}` : '排序完成'}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span>Knuth 增量序列:</span>
          {gaps.map((g, i) => (
            <span
              key={i}
              style={{
                fontWeight: i === current.gapIndex ? 'bold' : 'normal',
                color: i === current.gapIndex ? 'var(--accent)' : 'var(--text-primary)',
                background: i === current.gapIndex ? 'var(--accent-bg, rgba(99,102,241,0.12))' : 'transparent',
                borderRadius: '4px',
                padding: '1px 6px',
                transition: 'all 0.15s ease',
              }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Bar chart visualization */}
      <div
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
                opacity:
                  current.comparing.includes(index) ||
                  current.moving.includes(index)
                    ? 1
                    : 0.4,
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
                opacity: getBarOpacity(index),
                transition: 'height 0.15s ease, background 0.15s ease, opacity 0.15s ease',
              }}
            />
            {indexToGroup.has(index) && current.currentGap > 0 && (
              <span
                style={{
                  fontSize: '0.55rem',
                  marginTop: '2px',
                  color: GROUP_COLORS[indexToGroup.get(index)! % GROUP_COLORS.length],
                  fontWeight: 'bold',
                }}
              >
                G{indexToGroup.get(index)!}
              </span>
            )}
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
          <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px', display: 'inline-block' }} />
          移动中
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#6366f1', borderRadius: '2px', display: 'inline-block' }} />
          同 gap 组
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
          <span>增量序列: Knuth (3h+1)</span>
          <span>数组大小: {current.array.length}</span>
          <span>当前 gap: {current.currentGap || '-'}</span>
          <span>总步数: {steps.length}</span>
        </div>
      </div>
    </div>
  )
}
