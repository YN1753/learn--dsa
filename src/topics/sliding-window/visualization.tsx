import { useState, useEffect, useRef, useCallback } from 'react'

interface WindowStep {
  array: string[]
  left: number
  right: number
  windowContent: string
  result: number
  resultLabel: string
  description: string
  action: 'expand' | 'shrink' | 'init' | 'done'
}

type WindowMode = 'fixed' | 'variable'

const MODE_LABELS: Record<WindowMode, string> = {
  fixed: '固定大小窗口',
  variable: '可变大小窗口',
}

const SAMPLE_ARRAYS = [
  [2, 1, 5, 1, 3, 2],
  [1, 3, 2, 6, -1, 4, 1, 8, 2],
  [5, 3, 4, 7, 1, 8, 2, 6],
  [9, 2, 8, 1, 5, 4, 3, 7],
]

const SAMPLE_STRINGS = [
  'abcabcbb',
  'pwwkew',
  'dvdf',
  'bbbbb',
]

function generateFixedWindowSteps(arr: number[], k: number): WindowStep[] {
  const steps: WindowStep[] = []
  const strArr = arr.map(String)

  steps.push({
    array: strArr,
    left: 0,
    right: k - 1,
    windowContent: strArr.slice(0, k).join(', '),
    result: 0,
    resultLabel: '当前和',
    description: `初始化窗口，大小 k=${k}，范围 [0, ${k - 1}]`,
    action: 'init',
  })

  let windowSum = 0
  for (let i = 0; i < k; i++) windowSum += arr[i]
  let maxSum = windowSum

  steps.push({
    array: strArr,
    left: 0,
    right: k - 1,
    windowContent: strArr.slice(0, k).join(', '),
    result: windowSum,
    resultLabel: '当前和',
    description: `第一个窗口 [${strArr.slice(0, k).join(', ')}]，和 = ${windowSum}`,
    action: 'expand',
  })

  for (let i = k; i < arr.length; i++) {
    const removed = arr[i - k]
    const added = arr[i]
    windowSum += added - removed
    maxSum = Math.max(maxSum, windowSum)

    steps.push({
      array: strArr,
      left: i - k + 1,
      right: i,
      windowContent: strArr.slice(i - k + 1, i + 1).join(', '),
      result: windowSum,
      resultLabel: '当前和',
      description: `滑动: 移除 ${removed}，加入 ${added}，和 = ${windowSum}，最大和 = ${maxSum}`,
      action: 'expand',
    })
  }

  steps.push({
    array: strArr,
    left: arr.length - k,
    right: arr.length - 1,
    windowContent: strArr.slice(arr.length - k).join(', '),
    result: maxSum,
    resultLabel: '最大和',
    description: `完成！最大子数组和 = ${maxSum}`,
    action: 'done',
  })

  return steps
}

function generateVariableWindowSteps(s: string): WindowStep[] {
  const steps: WindowStep[] = []
  const strArr = s.split('')

  const seen = new Set<string>()
  let left = 0
  let maxLen = 0

  steps.push({
    array: strArr,
    left: 0,
    right: -1,
    windowContent: '',
    result: 0,
    resultLabel: '最长长度',
    description: '初始化空窗口',
    action: 'init',
  })

  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left])
      steps.push({
        array: strArr,
        left: left + 1,
        right: right - 1,
        windowContent: s.substring(left + 1, right),
        result: maxLen,
        resultLabel: '最长长度',
        description: `'${s[right]}' 重复，收缩左边界，移除 '${s[left]}'`,
        action: 'shrink',
      })
      left++
    }
    seen.add(s[right])
    const currentLen = right - left + 1
    if (currentLen > maxLen) maxLen = currentLen

    steps.push({
      array: strArr,
      left,
      right,
      windowContent: s.substring(left, right + 1),
      result: maxLen,
      resultLabel: '最长长度',
      description: `加入 '${s[right]}'，窗口 = "${s.substring(left, right + 1)}"，长度 = ${currentLen}`,
      action: 'expand',
    })
  }

  steps.push({
    array: strArr,
    left,
    right: s.length - 1,
    windowContent: s.substring(left),
    result: maxLen,
    resultLabel: '最长长度',
    description: `完成！最长无重复子串长度 = ${maxLen}`,
    action: 'done',
  })

  return steps
}

export default function SlidingWindowVisualization() {
  const [mode, setMode] = useState<WindowMode>('fixed')
  const [inputArray, setInputArray] = useState<number[]>(SAMPLE_ARRAYS[0])
  const [inputString, setInputString] = useState('abcabcbb')
  const [windowSize, setWindowSize] = useState(3)
  const [steps, setSteps] = useState<WindowStep[]>([])
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
    setCurrentStep(0)

    if (mode === 'fixed') {
      const k = Math.min(Math.max(windowSize, 1), inputArray.length)
      setSteps(generateFixedWindowSteps(inputArray, k))
    } else {
      setSteps(generateVariableWindowSteps(inputString))
    }
  }, [mode, inputArray, inputString, windowSize])

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
    if (mode === 'fixed') {
      const idx = Math.floor(Math.random() * SAMPLE_ARRAYS.length)
      setInputArray(SAMPLE_ARRAYS[idx])
      setWindowSize(3)
    } else {
      const idx = Math.floor(Math.random() * SAMPLE_STRINGS.length)
      setInputString(SAMPLE_STRINGS[idx])
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setCurrentStep(0)
  }, [mode])

  const current = steps[currentStep] || steps[0] || {
    array: [],
    left: 0,
    right: -1,
    windowContent: '',
    result: 0,
    resultLabel: '',
    description: '点击"生成步骤"或"播放"开始演示',
    action: 'init',
  }

  const getBoxColor = (index: number): string => {
    if (current.action === 'done' && index >= current.left && index <= current.right) {
      return '#22c55e'
    }
    if (index === current.right && current.action === 'expand') {
      return '#f59e0b'
    }
    if (index === current.left && current.action === 'shrink') {
      return '#ef4444'
    }
    if (index >= current.left && index <= current.right) {
      return '#3b82f6'
    }
    return '#374151'
  }

  const getBoxBorder = (index: number): string => {
    if (current.action === 'done' && index >= current.left && index <= current.right) {
      return '3px solid #4ade80'
    }
    if (index === current.left) return '3px solid #60a5fa'
    if (index === current.right) return '3px solid #a78bfa'
    return '1px solid #4b5563'
  }

  return (
    <div className="visualization-container">
      {/* Mode selector */}
      <div className="viz-controls">
        <select
          value={mode}
          onChange={e => {
            setMode(e.target.value as WindowMode)
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
          <option value="fixed">固定大小窗口</option>
          <option value="variable">可变大小窗口</option>
        </select>

        {mode === 'fixed' && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}
          >
            窗口大小 k:
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
        )}

        {mode === 'variable' && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}
          >
            字符串:
            <input
              type="text"
              value={inputString}
              onChange={e => setInputString(e.target.value)}
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                width: '120px',
              }}
            />
          </label>
        )}

        <button className="btn btn-primary" onClick={generateSteps}>
          生成步骤
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

      {/* Array/String visualization */}
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

        {/* Element boxes */}
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
                opacity: index >= current.left && index <= current.right ? 1 : 0.4,
                transition: 'all 0.3s ease',
              }}
            >
              {value}
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
          窗口内
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }} />
          新加入
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px', display: 'inline-block' }} />
          即将移除
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
          完成
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#374151', borderRadius: '2px', display: 'inline-block', opacity: 0.5 }} />
          窗口外
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          <span>模式: {MODE_LABELS[mode]}</span>
          {current.windowContent && (
            <span>窗口内容: [{current.windowContent}]</span>
          )}
          {current.left <= current.right && (
            <span>窗口范围: [{current.left}, {current.right}]</span>
          )}
          <span>{current.resultLabel}: {current.result}</span>
        </div>
      </div>
    </div>
  )
}
