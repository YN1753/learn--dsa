import { useState, useEffect, useRef, useCallback } from 'react'

interface StepState {
  str: string
  zArray: number[]
  currentIndex: number
  zBoxL: number
  zBoxR: number
  comparePos1: number
  comparePos2: number
  phase: 'init' | 'computing' | 'done'
  description: string
  matchPositions: number[]
}

function computeSteps(s: string): StepState[] {
  const steps: StepState[] = []
  const n = s.length
  const z = new Array(n).fill(0)
  let l = 0
  let r = 0

  steps.push({
    str: s,
    zArray: [...z],
    currentIndex: -1,
    zBoxL: -1,
    zBoxR: -1,
    comparePos1: -1,
    comparePos2: -1,
    phase: 'init',
    description: `初始化 Z 数组，Z[0] = 0。开始从 i=1 计算。`,
    matchPositions: [],
  })

  for (let i = 1; i < n; i++) {
    // 利用 Z-box 初始化
    if (i <= r) {
      z[i] = Math.min(r - i + 1, z[i - l])
      steps.push({
        str: s,
        zArray: [...z],
        currentIndex: i,
        zBoxL: l,
        zBoxR: r,
        comparePos1: -1,
        comparePos2: -1,
        phase: 'computing',
        description: `i=${i} 在 Z-box [${l},${r}] 内，利用已知信息初始化 Z[${i}] = min(${r - i + 1}, Z[${i - l}]) = ${z[i]}`,
        matchPositions: [],
      })
    }

    // 暴力扩展
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      steps.push({
        str: s,
        zArray: [...z],
        currentIndex: i,
        zBoxL: l,
        zBoxR: r,
        comparePos1: z[i],
        comparePos2: i + z[i],
        phase: 'computing',
        description: `i=${i}: 比较 S[${z[i]}]='${s[z[i]]}' 与 S[${i + z[i]}]='${s[i + z[i]]}'，匹配！Z[${i}] 增加到 ${z[i] + 1}`,
        matchPositions: [],
      })
      z[i]++
    }

    // 不匹配的情况（如果不是因为越界停止）
    if (i + z[i] < n && s[z[i]] !== s[i + z[i]]) {
      steps.push({
        str: s,
        zArray: [...z],
        currentIndex: i,
        zBoxL: l,
        zBoxR: r,
        comparePos1: z[i],
        comparePos2: i + z[i],
        phase: 'computing',
        description: `i=${i}: 比较 S[${z[i]}]='${s[z[i]]}' 与 S[${i + z[i]}]='${s[i + z[i]]}'，不匹配，停止扩展`,
        matchPositions: [],
      })
    }

    // 更新 Z-box
    if (i + z[i] - 1 > r) {
      l = i
      r = i + z[i] - 1
      if (z[i] > 0) {
        steps.push({
          str: s,
          zArray: [...z],
          currentIndex: i,
          zBoxL: l,
          zBoxR: r,
          comparePos1: -1,
          comparePos2: -1,
          phase: 'computing',
          description: `i=${i}: Z[${i}]=${z[i]}，更新 Z-box 为 [${l}, ${r}]`,
          matchPositions: [],
        })
      }
    }
  }

  // 完成
  steps.push({
    str: s,
    zArray: [...z],
    currentIndex: -1,
    zBoxL: -1,
    zBoxR: -1,
    comparePos1: -1,
    comparePos2: -1,
    phase: 'done',
    description: `Z 数组计算完成: [${z.join(', ')}]`,
    matchPositions: [],
  })

  return steps
}

const PRESETS = [
  { label: 'aabxaabxcaab', value: 'aabxaabxcaab' },
  { label: 'aabxaabx', value: 'aabxaabx' },
  { label: 'abcabcabc', value: 'abcabcabc' },
  { label: 'aaaaaa', value: 'aaaaaa' },
  { label: 'abcde', value: 'abcde' },
]

export default function ZAlgorithmVisualization() {
  const [inputStr, setInputStr] = useState('aabxaabxcaab')
  const [steps, setSteps] = useState<StepState[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const startComputation = useCallback(() => {
    if (inputStr.length === 0) return
    const newSteps = computeSteps(inputStr)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [inputStr])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (steps.length === 0) return
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleStepBackward = () => {
    if (steps.length === 0) return
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
  }

  const state = steps[currentStep] || null

  const getCellColor = (index: number): string => {
    if (!state) return 'var(--bg-card)'

    // Z-box highlight
    if (state.zBoxL >= 0 && index >= state.zBoxL && index <= state.zBoxR) {
      return 'rgba(59, 130, 246, 0.15)'
    }
    return 'var(--bg-card)'
  }

  const getCellBorder = (index: number): string => {
    if (!state) return 'var(--border)'

    // Current computing index
    if (index === state.currentIndex) return '#f59e0b'

    // Comparing positions
    if (index === state.comparePos1 || index === state.comparePos2) return '#22c55e'

    // Z-box borders
    if (state.zBoxL >= 0 && index === state.zBoxL) return '#3b82f6'
    if (state.zBoxR >= 0 && index === state.zBoxR) return '#3b82f6'

    return 'var(--border)'
  }

  const getCellBorderWidth = (index: number): number => {
    if (!state) return 1
    if (index === state.currentIndex) return 3
    if (index === state.comparePos1 || index === state.comparePos2) return 3
    if (state.zBoxL >= 0 && index === state.zBoxL) return 2
    if (state.zBoxR >= 0 && index === state.zBoxR) return 2
    return 1
  }

  const cellSize = Math.min(48, Math.max(28, 500 / Math.max(inputStr.length, 1)))

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            输入字符串:
          </label>
          <input
            type="text"
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            disabled={isPlaying}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontFamily: 'Consolas, Monaco, monospace',
              width: '200px',
            }}
          />
          <select
            value={inputStr}
            onChange={(e) => setInputStr(e.target.value)}
            disabled={isPlaying}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
          >
            {PRESETS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={startComputation} disabled={isPlaying || inputStr.length === 0}>
            开始计算
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleStepBackward} disabled={steps.length === 0 || currentStep === 0}>
            上一步
          </button>
          <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
            {isPlaying ? '暂停' : '继续'}
          </button>
          <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
            下一步
          </button>
          <button className="btn btn-secondary" onClick={handleReset} disabled={steps.length === 0}>
            重置
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            速度:
            <input
              type="range"
              min="200"
              max="2000"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span>{speed}ms</span>
          </label>
        </div>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        {state && (
          <div style={{ padding: '1rem' }}>
            {/* Index row */}
            <div style={{ display: 'flex', marginBottom: '0.25rem', paddingLeft: '0.5rem' }}>
              {state.str.split('').map((_, idx) => (
                <div
                  key={`idx-${idx}`}
                  style={{
                    width: cellSize,
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'Consolas, Monaco, monospace',
                    marginRight: '2px',
                  }}
                >
                  {idx}
                </div>
              ))}
            </div>

            {/* String row */}
            <div style={{ display: 'flex', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
              {state.str.split('').map((ch, idx) => (
                <div
                  key={`char-${idx}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `${getCellBorderWidth(idx)}px solid ${getCellBorder(idx)}`,
                    borderRadius: '4px',
                    background: getCellColor(idx),
                    color: 'var(--text-primary)',
                    fontWeight: idx === state.currentIndex ? 'bold' : 'normal',
                    fontSize: '1rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    marginRight: '2px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {ch}
                </div>
              ))}
            </div>

            {/* Z array row */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem', paddingLeft: '0.5rem' }}>
                Z 数组:
              </div>
              <div style={{ display: 'flex', paddingLeft: '0.5rem' }}>
                {state.zArray.map((val, idx) => (
                  <div
                    key={`z-${idx}`}
                    style={{
                      width: cellSize,
                      height: cellSize * 0.7,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${idx === state.currentIndex ? '#f59e0b' : 'var(--border)'}`,
                      borderRadius: '4px',
                      background: idx === state.currentIndex
                        ? 'rgba(245, 158, 11, 0.15)'
                        : val > 0
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'var(--bg-card)',
                      color: val > 0 ? '#22c55e' : 'var(--text-secondary)',
                      fontWeight: idx === state.currentIndex ? 'bold' : 'normal',
                      fontSize: '0.85rem',
                      fontFamily: 'Consolas, Monaco, monospace',
                      marginRight: '2px',
                    }}
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison indicator */}
            {state.comparePos1 >= 0 && state.comparePos2 >= 0 && (
              <div style={{ marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-block',
                    width: cellSize,
                    textAlign: 'center',
                    color: '#22c55e',
                    fontSize: '0.85rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    marginLeft: cellSize * state.comparePos1 + state.comparePos1 * 2,
                    position: 'relative',
                  }}>
                    {'↑'}
                  </span>
                  <span style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    marginLeft: cellSize * (state.comparePos2 - state.comparePos1 - 1) + (state.comparePos2 - state.comparePos1 - 1) * 2,
                  }}>
                    {'←'} 比较
                  </span>
                  <span style={{
                    display: 'inline-block',
                    width: cellSize,
                    textAlign: 'center',
                    color: '#22c55e',
                    fontSize: '0.85rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                  }}>
                    {'↑'}
                  </span>
                </div>
              </div>
            )}

            {/* Z-box indicator */}
            {state.zBoxL >= 0 && state.zBoxR >= 0 && (
              <div style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#3b82f6',
                  fontSize: '0.8rem',
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '2px solid #3b82f6',
                    borderRadius: 2,
                    marginRight: 4,
                  }} />
                  Z-box: [{state.zBoxL}, {state.zBoxR}]
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                    (S[{state.zBoxL}..{state.zBoxR}] = S[0..{state.zBoxR - state.zBoxL}])
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {!state && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            点击「开始计算」查看 Z 算法的执行过程
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>步骤 {steps.length > 0 ? currentStep + 1 : 0} / {steps.length}：</strong>
        {state?.description || '等待开始...'}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(59, 130, 246, 0.15)', border: '2px solid #3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          Z-box 区间
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'transparent', border: '3px solid #f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前计算位置
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'transparent', border: '3px solid #22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在比较
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--border)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已计算的 Z 值
        </span>
      </div>
    </div>
  )
}
