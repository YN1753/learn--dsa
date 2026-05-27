import { useState, useEffect, useRef, useCallback } from 'react'

interface StepData {
  description: string
  x: number
  y: number
  diff: number
  gcd: number
  found: boolean
  loopDetected: boolean
  iteration: number
  history: { x: number; y: number; diff: number; gcd: number; found: boolean }[]
}

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    [a, b] = [b, a % b]
  }
  return a
}

export default function PollardRhoVisualization() {
  const [n, setN] = useState(91)
  const [c, setC] = useState(1)
  const [steps, setSteps] = useState<StepData[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [description, setDescription] = useState('Pollard Rho因数分解 - 输入n并点击开始')
  const [foundFactor, setFoundFactor] = useState<number | null>(null)
  const [mode, setMode] = useState<'floyd' | 'sequence'>('floyd')
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((targetN: number, targetC: number): StepData[] => {
    const result: StepData[] = []
    const history: { x: number; y: number; diff: number; gcd: number; found: boolean }[] = []

    if (targetN % 2 === 0) {
      result.push({
        description: `n = ${targetN} 是偶数，直接找到因子 2`,
        x: 0, y: 0, diff: 0, gcd: 2, found: true, loopDetected: false, iteration: 0, history
      })
      return result
    }

    let x = 2
    let y = 2
    const maxIter = Math.min(50, targetN)

    for (let i = 1; i <= maxIter; i++) {
      x = (x * x + targetC) % targetN
      y = (y * y + targetC) % targetN
      y = (y * y + targetC) % targetN

      const diff = Math.abs(x - y)
      const d = gcd(diff, targetN)
      const found = d > 1 && d < targetN

      history.push({ x, y, diff, gcd: d, found })

      if (found) {
        result.push({
          description: `步骤${i}: x=${x}, y=${y}, |x-y|=${diff}, gcd(${diff},${targetN})=${d} - 找到因子!`,
          x, y, diff, gcd: d, found: true, loopDetected: false, iteration: i, history: [...history]
        })
        return result
      }

      if (x === y) {
        result.push({
          description: `步骤${i}: x=${x}, y=${y} - 指针相遇(循环检测)，未找到因子，需更换c重试`,
          x, y, diff, gcd: d, found: false, loopDetected: true, iteration: i, history: [...history]
        })
        return result
      }

      result.push({
        description: `步骤${i}: x=${x}, y=${y}, |x-y|=${diff}, gcd(${diff},${targetN})=${d}`,
        x, y, diff, gcd: d, found: false, loopDetected: false, iteration: i, history: [...history]
      })
    }

    return result
  }, [])

  const handleStart = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const newSteps = generateSteps(n, c)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setFoundFactor(null)
    setDescription('开始执行Pollard Rho算法...')
  }, [n, c, generateSteps])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setFoundFactor(null)
    setDescription('Pollard Rho因数分解 - 输入n并点击开始')
  }, [])

  const handlePauseResume = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }, [isPlaying, steps, currentStep, description])

  const handleStep = useCallback(() => {
    if (steps.length === 0) {
      const newSteps = generateSteps(n, c)
      setSteps(newSteps)
      setCurrentStep(0)
      if (newSteps.length > 0) {
        const step = newSteps[0]
        setDescription(step.description)
        if (step.found) setFoundFactor(step.gcd)
        setCurrentStep(1)
      }
      return
    }
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setDescription(step.description)
      if (step.found) setFoundFactor(step.gcd)
      setCurrentStep(prev => prev + 1)
    }
  }, [steps, currentStep, n, c, generateSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setDescription(step.description)
      if (step.found) setFoundFactor(step.gcd)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const currentStepData = currentStep > 0 && currentStep <= steps.length ? steps[currentStep - 1] : null

  const canvasWidth = 700
  const canvasHeight = 320

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>n =</label>
          <input
            type="number"
            value={n}
            onChange={(e) => setN(Math.max(4, Number(e.target.value)))}
            style={{ width: '100px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            disabled={isPlaying}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>c =</label>
          <input
            type="number"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            disabled={isPlaying}
          />
        </div>
        <button className="btn btn-primary" onClick={handleStart}>开始</button>
        <button className="btn btn-primary" onClick={handleStep}>单步</button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>重置</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className={`btn ${mode === 'floyd' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('floyd')}
            style={{ fontSize: '0.8rem' }}
          >
            Floyd判圈
          </button>
          <button
            className={`btn ${mode === 'sequence' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('sequence')}
            style={{ fontSize: '0.8rem' }}
          >
            序列视图
          </button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="100"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ minHeight: canvasHeight + 'px', position: 'relative' }}>
        <svg width={canvasWidth} height={canvasHeight}>
          {mode === 'floyd' ? (
            <>
              {/* Floyd cycle detection visualization */}
              <text x={canvasWidth / 2} y={20} fill="var(--text-primary)" fontSize="14" fontWeight="bold" textAnchor="middle">
                Floyd判圈法 (龟兔赛跑) - f(x) = (x² + {c}) mod {n}
              </text>

              {/* Sequence track - circular representation */}
              {(() => {
                const seqLen = Math.min(20, n)
                const centerX = canvasWidth / 2
                const centerY = canvasHeight / 2 + 10
                const radius = 100
                const positions: { cx: number; cy: number; val: number }[] = []
                let val = 2
                const seen = new Set<number>()
                for (let i = 0; i < seqLen; i++) {
                  if (seen.has(val)) break
                  seen.add(val)
                  const angle = (2 * Math.PI * i) / seqLen - Math.PI / 2
                  positions.push({
                    cx: centerX + radius * Math.cos(angle),
                    cy: centerY + radius * Math.sin(angle),
                    val
                  })
                  val = (val * val + c) % n
                }

                return (
                  <>
                    {/* Draw connections */}
                    {positions.map((pos, i) => {
                      const next = positions[(i + 1) % positions.length]
                      return (
                        <line
                          key={`conn-${i}`}
                          x1={pos.cx}
                          y1={pos.cy}
                          x2={next.cx}
                          y2={next.cy}
                          stroke="var(--border)"
                          strokeWidth="1.5"
                          markerEnd="url(#arrow-gray)"
                        />
                      )
                    })}

                    {/* Draw nodes */}
                    {positions.map((pos, i) => {
                      const isSlowPointer = currentStepData && pos.val === currentStepData.x
                      const isFastPointer = currentStepData && pos.val === currentStepData.y
                      let fill = 'var(--bg-card)'
                      let strokeColor = 'var(--border)'
                      let strokeWidth = 1.5
                      if (isSlowPointer && isFastPointer) {
                        fill = '#f59e0b'
                        strokeColor = '#d97706'
                        strokeWidth = 3
                      } else if (isSlowPointer) {
                        fill = '#3b82f6'
                        strokeColor = '#2563eb'
                        strokeWidth = 3
                      } else if (isFastPointer) {
                        fill = '#ef4444'
                        strokeColor = '#dc2626'
                        strokeWidth = 3
                      }
                      return (
                        <g key={`node-${i}`}>
                          <circle
                            cx={pos.cx}
                            cy={pos.cy}
                            r={20}
                            fill={fill}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                          />
                          <text
                            x={pos.cx}
                            y={pos.cy + 4}
                            fill="var(--text-primary)"
                            fontSize="11"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="Consolas, Monaco, monospace"
                          >
                            {pos.val}
                          </text>
                        </g>
                      )
                    })}

                    {/* Pointer labels */}
                    {currentStepData && (
                      <>
                        <rect x={20} y={canvasHeight - 70} width={140} height={55} rx={6} fill="var(--bg-card)" stroke="var(--border)" />
                        <circle cx={35} cy={canvasHeight - 52} r={8} fill="#3b82f6" />
                        <text x={50} y={canvasHeight - 48} fill="var(--text-primary)" fontSize="12">龟 (x={currentStepData.x})</text>
                        <circle cx={35} cy={canvasHeight - 30} r={8} fill="#ef4444" />
                        <text x={50} y={canvasHeight - 26} fill="var(--text-primary)" fontSize="12">兔 (y={currentStepData.y})</text>
                      </>
                    )}
                  </>
                )
              })()}

              <defs>
                <marker id="arrow-gray" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" opacity="0.5" />
                </marker>
              </defs>
            </>
          ) : (
            <>
              {/* Sequence history table */}
              <text x={canvasWidth / 2} y={20} fill="var(--text-primary)" fontSize="14" fontWeight="bold" textAnchor="middle">
                迭代序列 - f(x) = (x² + {c}) mod {n}
              </text>

              {/* Table header */}
              <text x={60} y={50} fill="var(--text-secondary)" fontSize="12" fontWeight="bold" textAnchor="middle">步骤</text>
              <text x={170} y={50} fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="middle">x (龟)</text>
              <text x={280} y={50} fill="#ef4444" fontSize="12" fontWeight="bold" textAnchor="middle">y (兔)</text>
              <text x={390} y={50} fill="var(--text-secondary)" fontSize="12" fontWeight="bold" textAnchor="middle">|x-y|</text>
              <text x={500} y={50} fill="var(--text-secondary)" fontSize="12" fontWeight="bold" textAnchor="middle">gcd</text>
              <text x={600} y={50} fill="var(--text-secondary)" fontSize="12" fontWeight="bold" textAnchor="middle">状态</text>
              <line x1={30} y1={58} x2={670} y2={58} stroke="var(--border)" strokeWidth="1" />

              {/* Table rows */}
              {currentStepData?.history.slice(-12).map((h, i) => {
                const y = 75 + i * 20
                const isLatest = i === (currentStepData?.history.slice(-12).length ?? 0) - 1
                return (
                  <g key={`row-${i}`}>
                    <text x={60} y={y} fill={isLatest ? 'var(--text-primary)' : 'var(--text-secondary)'} fontSize="11" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">{currentStepData.history.length - 12 + i + 1}</text>
                    <text x={170} y={y} fill={isLatest ? '#3b82f6' : 'var(--text-secondary)'} fontSize="11" textAnchor="middle" fontFamily="Consolas, Monaco, monospace" fontWeight={isLatest ? 'bold' : 'normal'}>{h.x}</text>
                    <text x={280} y={y} fill={isLatest ? '#ef4444' : 'var(--text-secondary)'} fontSize="11" textAnchor="middle" fontFamily="Consolas, Monaco, monospace" fontWeight={isLatest ? 'bold' : 'normal'}>{h.y}</text>
                    <text x={390} y={y} fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">{h.diff}</text>
                    <text x={500} y={y} fill={h.found ? '#22c55e' : 'var(--text-primary)'} fontSize="11" textAnchor="middle" fontFamily="Consolas, Monaco, monospace" fontWeight={h.found ? 'bold' : 'normal'}>{h.gcd}</text>
                    <text x={600} y={y} fill={h.found ? '#22c55e' : 'var(--text-secondary)'} fontSize="10" textAnchor="middle">{h.found ? '因子!' : h.gcd > 1 ? '非平凡' : '继续'}</text>
                  </g>
                )
              })}

              {/* Arrow showing current */}
              {currentStepData && currentStepData.history.length > 0 && (
                <g>
                  <text x={canvasWidth / 2} y={canvasHeight - 30} fill="var(--text-primary)" fontSize="13" textAnchor="middle">
                    当前: gcd(|{currentStepData.x} - {currentStepData.y}|, {n}) = gcd({currentStepData.diff}, {n}) = {currentStepData.gcd}
                  </text>
                </g>
              )}
            </>
          )}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      {foundFactor !== null && (
        <div className="viz-info" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          <strong>结果：</strong> {n} = {foundFactor} x {Math.floor(n / foundFactor)}
        </div>
      )}

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          龟 (慢指针 x)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          兔 (快指针 y)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          相遇
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          找到因子
        </span>
      </div>
    </div>
  )
}
