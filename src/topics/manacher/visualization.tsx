import { useState, useEffect, useRef, useCallback } from 'react'

interface StepData {
  index: number
  char: string
  pValue: number
  center: number
  right: number
  mirror: number
  usedMirror: boolean
  expanding: boolean
  expandedPositions: number[]
  description: string
}

function preprocess(s: string): string {
  let result = '^'
  for (let i = 0; i < s.length; i++) {
    result += '#' + s[i]
  }
  result += '#$'
  return result
}

function computeSteps(s: string): StepData[] {
  const T = preprocess(s)
  const n = T.length
  const P = new Array(n).fill(0)
  const steps: StepData[] = []
  let C = 0
  let R = 0

  for (let i = 1; i < n - 1; i++) {
    const mirror = 2 * C - i
    let usedMirror = false

    if (i < R) {
      P[i] = Math.min(R - i, P[mirror])
      usedMirror = P[i] > 0
    }

    steps.push({
      index: i,
      char: T[i],
      pValue: P[i],
      center: C,
      right: R,
      mirror,
      usedMirror,
      expanding: false,
      expandedPositions: [],
      description: usedMirror
        ? `位置${i}('${T[i]}')：利用镜像位置${mirror}，初始P[${i}]=${P[i]}`
        : `位置${i}('${T[i]}')：不在右边界内或镜像P为0，P[${i}]=0，开始扩展`,
    })

    const expandedPositions: number[] = []
    while (T[i + P[i] + 1] === T[i - P[i] - 1]) {
      P[i]++
      expandedPositions.push(i + P[i])
      expandedPositions.unshift(i - P[i])
    }

    if (expandedPositions.length > 0) {
      steps.push({
        index: i,
        char: T[i],
        pValue: P[i],
        center: C,
        right: i + P[i],
        mirror,
        usedMirror,
        expanding: true,
        expandedPositions: [...expandedPositions],
        description: `位置${i}：扩展完成，P[${i}]=${P[i]}${P[i] > 1 ? `，回文 "${T.substring(i - P[i], i + P[i] + 1).replace(/[#^$]/g, '')}"` : ''}`,
      })
    }

    if (i + P[i] > R) {
      C = i
      R = i + P[i]
    }
  }

  return steps
}

export default function ManacherVisualization() {
  const [inputStr, setInputStr] = useState('abacaba')
  const [transformed, setTransformed] = useState('')
  const [pArray, setPArray] = useState<number[]>([])
  const [steps, setSteps] = useState<StepData[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [description, setDescription] = useState('Manacher算法可视化 - 输入字符串并点击「开始」')
  const [center, setCenter] = useState(0)
  const [right, setRight] = useState(0)
  const [activeCells, setActiveCells] = useState<Set<number>>(new Set())
  const [mirrorCell, setMirrorCell] = useState<number | null>(null)
  const [expandCells, setExpandCells] = useState<Set<number>>(new Set())
  const timerRef = useRef<number | null>(null)

  const handleStart = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const T = preprocess(inputStr)
    setTransformed(T)
    setPArray(new Array(T.length).fill(0))
    setCenter(0)
    setRight(0)
    setActiveCells(new Set())
    setMirrorCell(null)
    setExpandCells(new Set())
    const s = computeSteps(inputStr)
    setSteps(s)
    setCurrentStep(0)
    setIsPlaying(true)
    setDescription('开始计算...')
  }, [inputStr])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      setDescription('计算完成！P数组已全部求出。')
      return
    }

    timerRef.current = window.setTimeout(() => {
      const step = steps[currentStep]
      setPArray(prev => {
        const next = [...prev]
        next[step.index] = step.pValue
        return next
      })
      setCenter(step.center)
      setRight(step.right)
      setDescription(step.description)

      if (step.usedMirror) {
        setMirrorCell(step.mirror)
      } else {
        setMirrorCell(null)
      }

      if (step.expanding) {
        setExpandCells(new Set(step.expandedPositions))
      } else {
        setExpandCells(new Set())
      }

      setActiveCells(new Set([step.index]))

      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

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
      const T = preprocess(inputStr)
      setTransformed(T)
      setPArray(new Array(T.length).fill(0))
      const s = computeSteps(inputStr)
      setSteps(s)
      setCurrentStep(0)
    }
    setIsPlaying(false)
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setPArray(prev => {
        const next = [...prev]
        next[step.index] = step.pValue
        return next
      })
      setCenter(step.center)
      setRight(step.right)
      setDescription(step.description)
      if (step.usedMirror) {
        setMirrorCell(step.mirror)
      } else {
        setMirrorCell(null)
      }
      if (step.expanding) {
        setExpandCells(new Set(step.expandedPositions))
      } else {
        setExpandCells(new Set())
      }
      setActiveCells(new Set([step.index]))
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setTransformed('')
    setPArray([])
    setSteps([])
    setCurrentStep(-1)
    setCenter(0)
    setRight(0)
    setActiveCells(new Set())
    setMirrorCell(null)
    setExpandCells(new Set())
    setDescription('Manacher算法可视化 - 输入字符串并点击「开始」')
  }

  const getCellBg = (idx: number): string => {
    if (idx === 0 || idx === transformed.length - 1) return 'var(--bg-card)'
    if (expandCells.has(idx)) return '#22c55e'
    if (mirrorCell === idx) return '#f59e0b'
    if (activeCells.has(idx)) return '#3b82f6'
    return 'var(--bg-card)'
  }

  const getCellBorder = (idx: number): string => {
    if (idx === 0 || idx === transformed.length - 1) return 'var(--border)'
    if (expandCells.has(idx)) return '#4ade80'
    if (mirrorCell === idx) return '#fbbf24'
    if (activeCells.has(idx)) return '#60a5fa'
    return 'var(--border)'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          输入:
          <input
            type="text"
            value={inputStr}
            onChange={e => setInputStr(e.target.value)}
            disabled={isPlaying}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontFamily: 'Consolas, Monaco, monospace',
              width: '140px',
            }}
          />
        </label>
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying || inputStr.length === 0}>
          开始
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying}>
          步进
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
            max="2000"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      {transformed && (
        <div className="viz-canvas" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              变换字符串 T:
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
              {transformed.split('').map((ch, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    border: `2px solid ${getCellBorder(idx)}`,
                    background: getCellBg(idx),
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: (idx === 0 || idx === transformed.length - 1) ? 'var(--text-secondary)' : 'var(--text-primary)',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  {ch}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              索引:
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {transformed.split('').map((_ch, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'Consolas, Monaco, monospace',
                    flexShrink: 0,
                  }}
                >
                  {idx}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
              P[] 回文半径:
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {pArray.map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    border: `2px solid ${val > 0 ? 'var(--accent)' : 'var(--border)'}`,
                    background: val > 0 ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg-card)',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    color: val > 0 ? 'var(--accent)' : 'var(--text-secondary)',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {idx === 0 || idx === pArray.length - 1 ? '' : val}
                </div>
              ))}
            </div>
          </div>

          {right > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>当前中心 C = {center}</strong>，{' '}
              <strong>右边界 R = {right}</strong>
              {center > 0 && right > center && (
                <span>
                  {' '}(回文 "{transformed.substring(center - (right - center), right + 1).replace(/[#^$]/g, '')}")
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="viz-info">
        <strong>说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前位置
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          镜像位置
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          扩展区域
        </span>
      </div>
    </div>
  )
}
