import { useState, useEffect, useRef, useCallback } from 'react'

interface GcdStep {
  a: number
  b: number
  quotient: number
  remainder: number
  isBase: boolean
}

interface BacktrackStep {
  depth: number
  a: number
  b: number
  x: number
  y: number
  gcd: number
  description: string
}

export default function ExtendedGcdVisualization() {
  const [inputA, setInputA] = useState(35)
  const [inputB, setInputB] = useState(15)
  const [gcdSteps, setGcdSteps] = useState<GcdStep[]>([])
  const [backtrackSteps, setBacktrackSteps] = useState<BacktrackStep[]>([])
  const [currentPhase, setCurrentPhase] = useState<'input' | 'gcd' | 'backtrack' | 'done'>('input')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [description, setDescription] = useState('扩展欧几里得算法 - 输入 a 和 b 的值，然后开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [result, setResult] = useState<{ gcd: number; x: number; y: number } | null>(null)
  const timerRef = useRef<number | null>(null)

  const computeGcdSteps = useCallback((a: number, b: number): GcdStep[] => {
    const steps: GcdStep[] = []
    let curA = a
    let curB = b
    while (curB !== 0) {
      const q = Math.floor(curA / curB)
      const r = curA % curB
      steps.push({ a: curA, b: curB, quotient: q, remainder: r, isBase: false })
      curA = curB
      curB = r
    }
    steps.push({ a: curA, b: 0, quotient: 0, remainder: 0, isBase: true })
    return steps
  }, [])

  const computeBacktrackSteps = useCallback((a: number, b: number): BacktrackStep[] => {
    const steps: BacktrackStep[] = []

    function extendedGcdSteps(
      curA: number,
      curB: number,
      depth: number
    ): { gcd: number; x: number; y: number } {
      if (curB === 0) {
        steps.push({
          depth,
          a: curA,
          b: 0,
          x: 1,
          y: 0,
          gcd: curA,
          description: `基本情况：gcd(${curA}, 0) = ${curA}，x = 1，y = 0`,
        })
        return { gcd: curA, x: 1, y: 0 }
      }

      const result = extendedGcdSteps(curB, curA % curB, depth + 1)
      const newX = result.y
      const newY = result.x - Math.floor(curA / curB) * result.y
      const q = Math.floor(curA / curB)

      steps.push({
        depth,
        a: curA,
        b: curB,
        x: newX,
        y: newY,
        gcd: result.gcd,
        description: `回溯：gcd(${curA}, ${curB})，q = ${q}，x = y' = ${newX}，y = x' - ${q}*y' = ${result.x} - ${q}*${result.y} = ${newY}`,
      })

      return { gcd: result.gcd, x: newX, y: newY }
    }

    extendedGcdSteps(a, b, 0)
    return steps
  }, [])

  const handleStart = useCallback(() => {
    if (inputA <= 0 || inputB < 0) {
      setDescription('请输入有效的正整数')
      return
    }

    const steps = computeGcdSteps(inputA, inputB)
    setGcdSteps(steps)
    setBacktrackSteps([])
    setCurrentPhase('gcd')
    setCurrentStepIndex(0)
    setResult(null)
    setDescription(`开始计算 gcd(${inputA}, ${inputB}) 的辗转相除过程`)
    setIsPlaying(true)
  }, [inputA, inputB, computeGcdSteps])

  useEffect(() => {
    if (!isPlaying) return

    if (currentPhase === 'gcd') {
      if (currentStepIndex >= gcdSteps.length) {
        const btSteps = computeBacktrackSteps(inputA, inputB)
        setBacktrackSteps(btSteps)
        setCurrentPhase('backtrack')
        setCurrentStepIndex(0)
        setDescription('递归完成，开始回溯计算 x 和 y 的系数')
        return
      }

      timerRef.current = window.setTimeout(() => {
        const step = gcdSteps[currentStepIndex]
        if (step.isBase) {
          setDescription(`基本情况：gcd(${step.a}, 0) = ${step.a}，递归结束`)
        } else {
          setDescription(
            `第 ${currentStepIndex + 1} 步：gcd(${step.a}, ${step.b})，${step.a} = ${step.b} * ${step.quotient} + ${step.remainder}`
          )
        }
        setCurrentStepIndex(prev => prev + 1)
      }, speed)

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }

    if (currentPhase === 'backtrack') {
      if (currentStepIndex >= backtrackSteps.length) {
        const finalStep = backtrackSteps[backtrackSteps.length - 1]
        if (finalStep) {
          setResult({ gcd: finalStep.gcd, x: finalStep.x, y: finalStep.y })
          setDescription(
            `完成！${inputA} * (${finalStep.x}) + ${inputB} * (${finalStep.y}) = ${finalStep.gcd}`
          )
        }
        setCurrentPhase('done')
        setIsPlaying(false)
        return
      }

      timerRef.current = window.setTimeout(() => {
        const step = backtrackSteps[currentStepIndex]
        setDescription(step.description)
        setCurrentStepIndex(prev => prev + 1)
      }, speed)

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
  }, [isPlaying, currentPhase, currentStepIndex, gcdSteps, backtrackSteps, speed, inputA, inputB, computeBacktrackSteps])

  const handleStep = useCallback(() => {
    if (currentPhase === 'input') {
      handleStart()
      setIsPlaying(false)
      return
    }
    setIsPlaying(false)
    if (currentPhase === 'gcd' && currentStepIndex < gcdSteps.length) {
      const step = gcdSteps[currentStepIndex]
      if (step.isBase) {
        setDescription(`基本情况：gcd(${step.a}, 0) = ${step.a}，递归结束`)
      } else {
        setDescription(
          `第 ${currentStepIndex + 1} 步：gcd(${step.a}, ${step.b})，${step.a} = ${step.b} * ${step.quotient} + ${step.remainder}`
        )
      }
      setCurrentStepIndex(prev => prev + 1)
      if (currentStepIndex + 1 >= gcdSteps.length) {
        const btSteps = computeBacktrackSteps(inputA, inputB)
        setBacktrackSteps(btSteps)
        setCurrentPhase('backtrack')
        setCurrentStepIndex(0)
      }
    } else if (currentPhase === 'backtrack' && currentStepIndex < backtrackSteps.length) {
      const step = backtrackSteps[currentStepIndex]
      setDescription(step.description)
      setCurrentStepIndex(prev => prev + 1)
      if (currentStepIndex + 1 >= backtrackSteps.length) {
        const finalStep = backtrackSteps[backtrackSteps.length - 1]
        if (finalStep) {
          setResult({ gcd: finalStep.gcd, x: finalStep.x, y: finalStep.y })
          setDescription(
            `完成！${inputA} * (${finalStep.x}) + ${inputB} * (${finalStep.y}) = ${finalStep.gcd}`
          )
        }
        setCurrentPhase('done')
      }
    }
  }, [currentPhase, currentStepIndex, gcdSteps, backtrackSteps, inputA, inputB, handleStart, computeBacktrackSteps])

  const handlePauseResume = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (currentPhase !== 'input' && currentPhase !== 'done') {
      setIsPlaying(true)
    }
  }, [isPlaying, description, currentPhase])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setGcdSteps([])
    setBacktrackSteps([])
    setCurrentPhase('input')
    setCurrentStepIndex(0)
    setResult(null)
    setDescription('扩展欧几里得算法 - 输入 a 和 b 的值，然后开始')
  }, [])

  const boxWidth = 180
  const boxHeight = 50
  const verticalGap = 60
  const canvasWidth = 600
  const startY = 30

  const getPhaseColor = (index: number): string => {
    if (currentPhase === 'gcd') {
      if (index < currentStepIndex) return '#22c55e'
      if (index === currentStepIndex) return '#3b82f6'
    }
    if (currentPhase === 'backtrack') return '#22c55e'
    if (currentPhase === 'done') return '#22c55e'
    return 'var(--bg-card)'
  }

  const getBtColor = (index: number): string => {
    if (currentPhase === 'backtrack') {
      if (index < currentStepIndex) return '#f59e0b'
      if (index === currentStepIndex) return '#3b82f6'
    }
    if (currentPhase === 'done') return '#f59e0b'
    return 'var(--bg-card)'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          a:
          <input
            type="number"
            min="1"
            value={inputA}
            onChange={(e) => setInputA(Math.max(1, Number(e.target.value)))}
            disabled={currentPhase !== 'input'}
            style={{ width: 80, padding: '0.25rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          b:
          <input
            type="number"
            min="0"
            value={inputB}
            onChange={(e) => setInputB(Math.max(0, Number(e.target.value)))}
            disabled={currentPhase !== 'input'}
            style={{ width: 80, padding: '0.25rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
          />
        </label>
        <button className="btn btn-primary" onClick={handleStart} disabled={currentPhase !== 'input'}>
          开始
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={currentPhase === 'done'}>
          单步
        </button>
        <button
          className="btn btn-secondary"
          onClick={handlePauseResume}
          disabled={currentPhase === 'input' || currentPhase === 'done'}
        >
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
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

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={canvasWidth} height={Math.max(startY + (gcdSteps.length + backtrackSteps.length) * verticalGap + 100, 300)}>
          {/* GCD recursion trace */}
          {gcdSteps.length > 0 && (
            <g>
              <text x={20} y={startY} fill="var(--text-primary)" fontSize="14" fontWeight="bold">
                辗转相除过程
              </text>
              {gcdSteps.map((step, i) => {
                const x = 40
                const y = startY + 20 + i * verticalGap
                return (
                  <g key={`gcd-${i}`}>
                    <rect
                      x={x}
                      y={y}
                      width={boxWidth}
                      height={boxHeight}
                      rx="6"
                      fill={getPhaseColor(i)}
                      stroke={i === currentStepIndex && currentPhase === 'gcd' ? '#60a5fa' : 'var(--border)'}
                      strokeWidth={i === currentStepIndex && currentPhase === 'gcd' ? 3 : 1.5}
                    />
                    <text
                      x={x + boxWidth / 2}
                      y={y + 20}
                      fill="var(--text-primary)"
                      fontSize="13"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      {step.isBase
                        ? `gcd(${step.a}, 0) = ${step.a}`
                        : `gcd(${step.a}, ${step.b})`}
                    </text>
                    {!step.isBase && (
                      <text
                        x={x + boxWidth / 2}
                        y={y + 38}
                        fill="var(--text-secondary)"
                        fontSize="11"
                        textAnchor="middle"
                        fontFamily="Consolas, Monaco, monospace"
                      >
                        {step.a} = {step.b}*{step.quotient} + {step.remainder}
                      </text>
                    )}
                    {i < gcdSteps.length - 1 && (
                      <line
                        x1={x + boxWidth / 2}
                        y1={y + boxHeight}
                        x2={x + boxWidth / 2}
                        y2={y + verticalGap}
                        stroke="var(--text-secondary)"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowhead-egcd)"
                      />
                    )}
                  </g>
                )
              })}
            </g>
          )}

          {/* Backtrack steps */}
          {backtrackSteps.length > 0 && (
            <g>
              <text
                x={canvasWidth / 2 + 20}
                y={startY}
                fill="var(--text-primary)"
                fontSize="14"
                fontWeight="bold"
              >
                回溯计算系数
              </text>
              {backtrackSteps.map((step, i) => {
                const x = canvasWidth / 2 + 20
                const y = startY + 20 + i * verticalGap
                return (
                  <g key={`bt-${i}`}>
                    <rect
                      x={x}
                      y={y}
                      width={boxWidth + 60}
                      height={boxHeight}
                      rx="6"
                      fill={getBtColor(i)}
                      stroke={i === currentStepIndex && currentPhase === 'backtrack' ? '#60a5fa' : 'var(--border)'}
                      strokeWidth={i === currentStepIndex && currentPhase === 'backtrack' ? 3 : 1.5}
                    />
                    <text
                      x={x + (boxWidth + 60) / 2}
                      y={y + 20}
                      fill="var(--text-primary)"
                      fontSize="12"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      {`gcd(${step.a}, ${step.b})`}
                    </text>
                    <text
                      x={x + (boxWidth + 60) / 2}
                      y={y + 38}
                      fill="var(--text-secondary)"
                      fontSize="11"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      {`x=${step.x}, y=${step.y}`}
                    </text>
                    {i < backtrackSteps.length - 1 && (
                      <line
                        x1={x + (boxWidth + 60) / 2}
                        y1={y + boxHeight}
                        x2={x + (boxWidth + 60) / 2}
                        y2={y + verticalGap}
                        stroke="var(--text-secondary)"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowhead-egcd)"
                      />
                    )}
                  </g>
                )
              })}
            </g>
          )}

          <defs>
            <marker id="arrowhead-egcd" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
          </defs>
        </svg>
      </div>

      {result && (
        <div className="viz-info" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e' }}>
          <strong>结果：</strong>
          gcd({inputA}, {inputB}) = {result.gcd}，
          x = {result.x}，y = {result.y}，
          验证：{inputA} * ({result.x}) + {inputB} * ({result.y}) = {inputA * result.x + inputB * result.y}
        </div>
      )}

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前步骤
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已完成（递归）
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已完成（回溯）
        </span>
      </div>
    </div>
  )
}