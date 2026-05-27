import { useState, useEffect, useRef, useCallback } from 'react'

interface ArrayElement {
  value: number
  state: 'default' | 'modified' | 'endpoint' | 'reconstructing' | 'highlight'
}

interface AnimationStep {
  original: ArrayElement[]
  diff: ArrayElement[]
  description: string
}

const INITIAL_ARRAY: number[] = [2, 5, 9, 7, 10]
const COLORS: Record<ArrayElement['state'], string> = {
  default: '#4a9eff',
  modified: '#34d399',
  endpoint: '#f59e0b',
  reconstructing: '#a78bfa',
  highlight: '#f87171'
}

function createElements(values: number[], state: ArrayElement['state'] = 'default'): ArrayElement[] {
  return values.map(v => ({ value: v, state }))
}

function buildDiffArray(arr: number[]): number[] {
  const diff: number[] = [arr[0]]
  for (let i = 1; i < arr.length; i++) {
    diff.push(arr[i] - arr[i - 1])
  }
  return diff
}

function generateSteps(initialArr: number[], l: number, r: number, val: number): AnimationStep[] {
  const steps: AnimationStep[] = []
  const n = initialArr.length
  const diff = buildDiffArray(initialArr)

  // Step 1: Show original array
  steps.push({
    original: createElements(initialArr),
    diff: createElements(diff),
    description: `初始数组: [${initialArr.join(', ')}]，差分数组: [${diff.join(', ')}]`
  })

  // Step 2: Show range to modify
  const rangeHighlight = createElements(initialArr)
  for (let i = l; i <= r; i++) {
    rangeHighlight[i] = { value: initialArr[i], state: 'highlight' }
  }
  steps.push({
    original: rangeHighlight,
    diff: createElements(diff),
    description: `准备对区间 [${l}, ${r}] 的所有元素加 ${val}`
  })

  // Step 3: Modify diff[l]
  const diffAfterL = [...diff]
  diffAfterL[l] += val
  const diffStepL = createElements(diffAfterL)
  diffStepL[l] = { value: diffAfterL[l], state: 'endpoint' }
  const origStepL = createElements(initialArr)
  origStepL[l] = { value: initialArr[l], state: 'endpoint' }
  steps.push({
    original: origStepL,
    diff: diffStepL,
    description: `修改 diff[${l}] += ${val}，diff[${l}] = ${diff[l]} + ${val} = ${diffAfterL[l]}`
  })

  // Step 4: Modify diff[r+1]
  if (r + 1 < n) {
    diffAfterL[r + 1] -= val
    const diffStepR = createElements(diffAfterL)
    diffStepR[l] = { value: diffAfterL[l], state: 'modified' }
    diffStepR[r + 1] = { value: diffAfterL[r + 1], state: 'endpoint' }
    const origStepR = createElements(initialArr)
    origStepR[r + 1] = { value: initialArr[r + 1], state: 'endpoint' }
    steps.push({
      original: origStepR,
      diff: diffStepR,
      description: `修改 diff[${r + 1}] -= ${val}，diff[${r + 1}] = ${diff[r + 1]} + (${-val}) = ${diffAfterL[r + 1]}`
    })
  }

  // Step 5: Show completed diff modification
  const diffComplete = createElements(diffAfterL)
  diffComplete[l] = { value: diffAfterL[l], state: 'modified' }
  if (r + 1 < n) {
    diffComplete[r + 1] = { value: diffAfterL[r + 1], state: 'modified' }
  }
  steps.push({
    original: createElements(initialArr),
    diff: diffComplete,
    description: `区间修改完成！差分数组: [${diffAfterL.join(', ')}]`
  })

  // Step 6-10: Step by step reconstruction
  const reconstructed: number[] = [diffAfterL[0]]
  for (let i = 1; i < n; i++) {
    reconstructed.push(reconstructed[i - 1] + diffAfterL[i])

    const origRecon = createElements(reconstructed)
    const diffRecon = createElements(diffAfterL)
    for (let j = 0; j <= i; j++) {
      origRecon[j] = { value: reconstructed[j], state: j === i ? 'reconstructing' : 'modified' }
    }
    diffRecon[i] = { value: diffAfterL[i], state: 'reconstructing' }
    steps.push({
      original: origRecon,
      diff: diffRecon,
      description: `还原: arr[${i}] = arr[${i - 1}] + diff[${i}] = ${reconstructed[i - 1]} + ${diffAfterL[i]} = ${reconstructed[i]}`
    })
  }

  // Final step
  steps.push({
    original: createElements(reconstructed, 'modified'),
    diff: createElements(diffAfterL),
    description: `还原完成！最终数组: [${reconstructed.join(', ')}]`
  })

  return steps
}

export default function DifferenceArrayVisualization() {
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('点击"生成演示"开始')
  const [originalArr, setOriginalArr] = useState<ArrayElement[]>(createElements(INITIAL_ARRAY))
  const [diffArr, setDiffArr] = useState<ArrayElement[]>(createElements(buildDiffArray(INITIAL_ARRAY)))
  const [inputL, setInputL] = useState('1')
  const [inputR, setInputR] = useState('3')
  const [inputVal, setInputVal] = useState('3')
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
      const step = steps[currentStep]
      setOriginalArr(step.original)
      setDiffArr(step.diff)
      setDescription(step.description)
    }
  }, [steps, currentStep])

  const handleGenerate = () => {
    const l = parseInt(inputL)
    const r = parseInt(inputR)
    const val = parseInt(inputVal)
    if (isNaN(l) || isNaN(r) || isNaN(val)) return
    if (l < 0 || r >= INITIAL_ARRAY.length || l > r) return

    stopTimer()
    setIsPlaying(false)
    const newSteps = generateSteps(INITIAL_ARRAY, l, r, val)
    setSteps(newSteps)
    setCurrentStep(0)
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
    setSteps([])
    setCurrentStep(0)
    setOriginalArr(createElements(INITIAL_ARRAY))
    setDiffArr(createElements(buildDiffArray(INITIAL_ARRAY)))
    setDescription('点击"生成演示"开始')
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

  const renderArray = (elements: ArrayElement[], label: string) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {elements.map((element, index) => (
          <div key={`${label}-${index}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              transform: element.state !== 'default' ? 'scale(1.05)' : 'scale(1)'
            }}>
              {element.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="viz-canvas">
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>区间:</span>
          <input
            type="number"
            placeholder="l"
            value={inputL}
            onChange={e => setInputL(e.target.value)}
            style={{
              width: '60px',
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <span style={{ fontSize: '13px', color: '#6b7280' }}>,</span>
          <input
            type="number"
            placeholder="r"
            value={inputR}
            onChange={e => setInputR(e.target.value)}
            style={{
              width: '60px',
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <span style={{ fontSize: '13px', color: '#6b7280', marginLeft: '8px' }}>增加值:</span>
          <input
            type="number"
            placeholder="val"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            style={{
              width: '60px',
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <button className="btn btn-primary" onClick={handleGenerate}>生成演示</button>
        </div>
      </div>

      {renderArray(originalArr, '原始数组 / 还原结果')}
      {renderArray(diffArr, '差分数组')}

      <div className="viz-info" style={{
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
        marginBottom: '12px'
      }}>
        <label style={{ fontSize: '13px', color: '#6b7280' }}>速度:</label>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={speed}
          onChange={e => setSpeed(parseInt(e.target.value))}
          style={{ width: '120px' }}
        />
        <span style={{ fontSize: '13px', color: '#6b7280', minWidth: '50px' }}>
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
              {state === 'modified' ? '已修改' :
               state === 'endpoint' ? '端点操作' :
               state === 'reconstructing' ? '还原中' :
               state === 'highlight' ? '选中区间' : state}
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
