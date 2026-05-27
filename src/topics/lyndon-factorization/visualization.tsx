import { useState, useEffect, useRef, useCallback } from 'react'

interface VizState {
  str: string
  i: number
  j: number
  k: number
  factors: { start: number; end: number }[]
  currentFactorStart: number
  comparing: { left: number; right: number } | null
  phase: 'idle' | 'comparing' | 'extending' | 'reset-k' | 'factor-found' | 'done'
  description: string
  highlightCells: { index: number; type: 'pointer-i' | 'pointer-j' | 'pointer-k' | 'comparing' | 'factor' | 'current-factor' }[]
}

const DEFAULT_STRING = 'abcabac'
const SPEED_MIN = 100
const SPEED_MAX = 2000
const SPEED_DEFAULT = 600

function generateDuvalSteps(s: string): VizState[] {
  const steps: VizState[] = []
  const n = s.length
  const factors: { start: number; end: number }[] = []

  const makeHighlight = (
    iVal: number, jVal: number, kVal: number,
    cmp: { left: number; right: number } | null,
    phase: VizState['phase'],
    currentFactorStart: number
  ) => {
    const cells: VizState['highlightCells'] = []
    for (let idx = 0; idx < n; idx++) {
      const inFactor = factors.some(f => idx >= f.start && idx < f.end)
      if (inFactor) {
        cells.push({ index: idx, type: 'factor' })
      } else if (idx >= currentFactorStart && idx < iVal) {
        cells.push({ index: idx, type: 'current-factor' })
      }
    }
    if (cmp) {
      cells.push({ index: cmp.left, type: 'comparing' })
      cells.push({ index: cmp.right, type: 'comparing' })
    }
    if (iVal < n) cells.push({ index: iVal, type: 'pointer-i' })
    if (jVal < n) cells.push({ index: jVal, type: 'pointer-j' })
    if (kVal < n) cells.push({ index: kVal, type: 'pointer-k' })
    return cells
  }

  const addStep = (
    iVal: number, jVal: number, kVal: number,
    cmp: { left: number; right: number } | null,
    phase: VizState['phase'],
    description: string,
    currentFactorStart: number
  ) => {
    steps.push({
      str: s,
      i: iVal,
      j: jVal,
      k: kVal,
      factors: [...factors],
      currentFactorStart,
      comparing: cmp,
      phase,
      description,
      highlightCells: makeHighlight(iVal, jVal, kVal, cmp, phase, currentFactorStart),
    })
  }

  addStep(0, 0, 0, null, 'idle', `开始Lyndon分解，字符串为「${s}」`, 0)

  let i = 0
  while (i < n) {
    let j = i + 1
    let k = i
    const factorStart = i

    addStep(i, j, k, null, 'comparing',
      `初始化: i=${i}, j=${j}, k=${k}，开始从位置 ${i} 构建Lyndon因子`, factorStart)

    while (j < n) {
      const sk = s[k]
      const sj = s[j]

      addStep(i, j, k, { left: k, right: j }, 'comparing',
        `比较 s[${k}]='${sk}' 与 s[${j}]='${sj}'`, factorStart)

      if (sk < sj) {
        addStep(i, j, k, { left: k, right: j }, 'reset-k',
          `'${sk}' < '${sj}'，重置 k 到 i=${i}，j 前进到 ${j + 1}`, factorStart)
        k = i
        j++
      } else if (sk === sj) {
        addStep(i, j, k, { left: k, right: j }, 'extending',
          `'${sk}' == '${sj}'，k 前进到 ${k + 1}，j 前进到 ${j + 1}`, factorStart)
        k++
        j++
      } else {
        addStep(i, j, k, { left: k, right: j }, 'comparing',
          `'${sk}' > '${sj}'，当前前缀不是Lyndon词前缀，停止扩展`, factorStart)
        break
      }
    }

    if (j >= n) {
      addStep(i, j, k, null, 'comparing',
        `j=${j} 已到达字符串末尾`, factorStart)
    }

    const factorLen = j - k
    while (i <= k) {
      const factor = s.substring(i, i + factorLen)
      factors.push({ start: i, end: i + factorLen })
      addStep(i, j, k, null, 'factor-found',
        `找到Lyndon因子「${factor}」(位置 ${i} 到 ${i + factorLen - 1})`, factorStart)
      i += factorLen
    }
  }

  addStep(n, n, n, null, 'done',
    `分解完成！共 ${factors.length} 个因子: [${factors.map(f => `「${s.substring(f.start, f.end)}」`).join(', ')}]`, n)

  return steps
}

export default function LyndonFactorizationVisualization() {
  const [inputString, setInputString] = useState(DEFAULT_STRING)
  const [steps, setSteps] = useState<VizState[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(SPEED_DEFAULT)
  const timerRef = useRef<number | null>(null)

  const current = steps[currentStep] || null

  const handleGenerate = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const newSteps = generateDuvalSteps(inputString)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [inputString])

  useEffect(() => {
    handleGenerate()
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
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

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStepForward = () => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleStepBack = () => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const getCellColor = (index: number): { bg: string; border: string; textColor: string } => {
    if (!current) return { bg: 'var(--bg-card)', border: 'var(--border)', textColor: 'var(--text-primary)' }

    const cell = current.highlightCells.find(c => c.index === index)
    if (!cell) return { bg: 'var(--bg-card)', border: 'var(--border)', textColor: 'var(--text-primary)' }

    switch (cell.type) {
      case 'pointer-i': return { bg: '#3b82f622', border: '#3b82f6', textColor: '#3b82f6' }
      case 'pointer-j': return { bg: '#22c55e22', border: '#22c55e', textColor: '#22c55e' }
      case 'pointer-k': return { bg: '#f59e0b22', border: '#f59e0b', textColor: '#f59e0b' }
      case 'comparing': return { bg: '#ef444422', border: '#ef4444', textColor: 'var(--text-primary)' }
      case 'factor': return { bg: '#8b5cf622', border: '#8b5cf6', textColor: '#8b5cf6' }
      case 'current-factor': return { bg: '#06b6d422', border: '#06b6d4', textColor: '#06b6d4' }
      default: return { bg: 'var(--bg-card)', border: 'var(--border)', textColor: 'var(--text-primary)' }
    }
  }

  const cellSize = Math.min(48, Math.max(32, 600 / (inputString.length + 2)))
  const svgWidth = Math.max(400, inputString.length * (cellSize + 8) + 80)
  const svgHeight = 220

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          输入字符串:
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            maxLength={20}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.9rem',
              width: '120px',
            }}
          />
        </label>
        <button className="btn btn-primary" onClick={handleGenerate}>
          生成
        </button>
        <button className="btn btn-primary" onClick={isPlaying ? handlePause : handlePlay} disabled={steps.length === 0}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={handleStepBack} disabled={currentStep <= 0 || isPlaying}>
          上一步
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={currentStep >= steps.length - 1 || isPlaying}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            value={SPEED_MAX - speed + SPEED_MIN}
            onChange={(e) => setSpeed(SPEED_MAX - Number(e.target.value) + SPEED_MIN)}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      {current && (
        <div className="viz-canvas" style={{ overflowX: 'auto', padding: '1rem' }}>
          <svg width={svgWidth} height={svgHeight}>
            {/* String cells */}
            {current.str.split('').map((ch, idx) => {
              const colors = getCellColor(idx)
              const x = 40 + idx * (cellSize + 8)
              const y = 30

              return (
                <g key={idx}>
                  {/* Index label */}
                  <text
                    x={x + cellSize / 2}
                    y={y - 8}
                    fill="var(--text-secondary)"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {idx}
                  </text>

                  {/* Cell background */}
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx="4"
                    fill={colors.bg}
                    stroke={colors.border}
                    strokeWidth={2}
                  />

                  {/* Character */}
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 5}
                    fill={colors.textColor}
                    fontSize={cellSize * 0.45}
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {ch}
                  </text>

                  {/* Pointer labels below cells */}
                  {current.i === idx && current.i < current.str.length && (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize + 18}
                      fill="#3b82f6"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      i
                    </text>
                  )}
                  {current.j === idx && current.j < current.str.length && (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize + 32}
                      fill="#22c55e"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      j
                    </text>
                  )}
                  {current.k === idx && current.k < current.str.length && (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize + 46}
                      fill="#f59e0b"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      k
                    </text>
                  )}
                </g>
              )
            })}

            {/* Factor boundaries */}
            {current.factors.map((f, fIdx) => {
              const x1 = 40 + f.start * (cellSize + 8) - 2
              const x2 = 40 + (f.end - 1) * (cellSize + 8) + cellSize + 2
              const y = 30 + cellSize + 60

              return (
                <g key={`factor-${fIdx}`}>
                  <rect
                    x={x1}
                    y={y}
                    width={x2 - x1}
                    height={24}
                    rx="4"
                    fill="#8b5cf622"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={y + 16}
                    fill="#8b5cf6"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    w{fIdx + 1}: {current.str.substring(f.start, f.end)}
                  </text>
                </g>
              )
            })}

            {/* Comparison arrow */}
            {current.comparing && current.phase !== 'done' && (
              <g>
                {(() => {
                  const lx = 40 + current.comparing.left * (cellSize + 8) + cellSize / 2
                  const rx = 40 + current.comparing.right * (cellSize + 8) + cellSize / 2
                  const y = 30 - 16
                  return (
                    <>
                      <line x1={lx} y1={y} x2={rx} y2={y} stroke="#ef4444" strokeWidth={1.5} markerEnd="url(#cmp-arrow)" />
                      <defs>
                        <marker id="cmp-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
                        </marker>
                      </defs>
                    </>
                  )
                })()}
              </g>
            )}

            {/* Step counter */}
            <text
              x={svgWidth - 10}
              y={16}
              fill="var(--text-secondary)"
              fontSize="12"
              textAnchor="end"
              fontFamily="Consolas, Monaco, monospace"
            >
              Step {currentStep + 1}/{steps.length}
            </text>
          </svg>
        </div>
      )}

      <div className="viz-info">
        <strong>状态：</strong> {current?.description || '请生成字符串开始演示'}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '0.8rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          指针 i
        </span>
        <span style={{ marginLeft: '0.8rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          指针 j
        </span>
        <span style={{ marginLeft: '0.8rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          指针 k
        </span>
        <span style={{ marginLeft: '0.8rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在比较
        </span>
        <span style={{ marginLeft: '0.8rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已找到的因子
        </span>
      </div>

      {current && current.factors.length > 0 && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>已分解因子：</strong>
          {current.factors.map((f, idx) => (
            <span key={idx} style={{
              marginLeft: '0.5rem',
              padding: '0.15rem 0.4rem',
              borderRadius: '3px',
              background: '#8b5cf622',
              border: '1px solid #8b5cf6',
              color: '#8b5cf6',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.85rem',
            }}>
              w{idx + 1}={current.str.substring(f.start, f.end)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
