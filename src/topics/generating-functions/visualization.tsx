import { useState, useEffect, useRef, useCallback } from 'react'

interface PolyCoeff {
  degree: number
  value: number
}

interface AnimationStep {
  description: string
  polyA: PolyCoeff[]
  polyB: PolyCoeff[]
  result: PolyCoeff[]
  highlightA: number
  highlightB: number
  highlightResult: number
}

const INITIAL_POLY_A: PolyCoeff[] = [
  { degree: 0, value: 1 },
  { degree: 1, value: 1 },
]

const INITIAL_POLY_B: PolyCoeff[] = [
  { degree: 0, value: 1 },
  { degree: 1, value: -1 },
]

const PRESETS: Record<string, { a: PolyCoeff[]; b: PolyCoeff[]; label: string }> = {
  geometric: {
    label: '1/(1-x) * (1-x)',
    a: [
      { degree: 0, value: 1 },
      { degree: 1, value: 1 },
      { degree: 2, value: 1 },
      { degree: 3, value: 1 },
      { degree: 4, value: 1 },
    ],
    b: [
      { degree: 0, value: 1 },
      { degree: 1, value: -1 },
    ],
  },
  fibonacci: {
    label: 'Fibonacci 生成函数',
    a: [
      { degree: 0, value: 0 },
      { degree: 1, value: 1 },
    ],
    b: [
      { degree: 0, value: 1 },
      { degree: 1, value: 1 },
      { degree: 2, value: 1 },
    ],
  },
  catalan: {
    label: 'Catalan 自卷积',
    a: [
      { degree: 0, value: 1 },
      { degree: 1, value: 1 },
      { degree: 2, value: 2 },
      { degree: 3, value: 5 },
    ],
    b: [
      { degree: 0, value: 1 },
      { degree: 1, value: 1 },
      { degree: 2, value: 2 },
      { degree: 3, value: 5 },
    ],
  },
  simple: {
    label: '(1+x) * (1+x)',
    a: [
      { degree: 0, value: 1 },
      { degree: 1, value: 1 },
    ],
    b: [
      { degree: 0, value: 1 },
      { degree: 1, value: 1 },
    ],
  },
}

function polyToString(poly: PolyCoeff[]): string {
  if (poly.length === 0) return '0'
  const terms = poly
    .filter(c => c.value !== 0)
    .map(c => {
      if (c.degree === 0) return `${c.value}`
      if (c.degree === 1) return c.value === 1 ? 'x' : c.value === -1 ? '-x' : `${c.value}x`
      return c.value === 1
        ? `x^${c.degree}`
        : c.value === -1
          ? `-x^${c.degree}`
          : `${c.value}x^${c.degree}`
    })
  return terms.join(' + ').replace(/\+ -/g, '- ')
}

function multiplyPolynomials(a: PolyCoeff[], b: PolyCoeff[]): PolyCoeff[] {
  const maxDeg = (a.length > 0 ? a[a.length - 1].degree : 0) + (b.length > 0 ? b[b.length - 1].degree : 0)
  const result: number[] = new Array(maxDeg + 1).fill(0)
  for (const ca of a) {
    for (const cb of b) {
      result[ca.degree + cb.degree] += ca.value * cb.value
    }
  }
  return result.map((v, i) => ({ degree: i, value: v }))
}

function getSeqFromPoly(poly: PolyCoeff[]): number[] {
  if (poly.length === 0) return []
  const maxDeg = poly[poly.length - 1].degree
  const seq: number[] = new Array(maxDeg + 1).fill(0)
  for (const c of poly) {
    seq[c.degree] = c.value
  }
  return seq
}

export default function GeneratingFunctionsVisualization() {
  const [polyA, setPolyA] = useState<PolyCoeff[]>(INITIAL_POLY_A)
  const [polyB, setPolyB] = useState<PolyCoeff[]>(INITIAL_POLY_B)
  const [result, setResult] = useState<PolyCoeff[]>(multiplyPolynomials(INITIAL_POLY_A, INITIAL_POLY_B))
  const [description, setDescription] = useState<string>('生成函数可视化 - 选择预设或自定义多项式，观察卷积运算')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightA, setHighlightA] = useState(-1)
  const [highlightB, setHighlightB] = useState(-1)
  const [highlightResult, setHighlightResult] = useState(-1)
  const timerRef = useRef<number | null>(null)

  const executeSteps = useCallback((animationSteps: AnimationStep[]) => {
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      setHighlightA(-1)
      setHighlightB(-1)
      setHighlightResult(-1)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setResult([...step.result])
      setHighlightA(step.highlightA)
      setHighlightB(step.highlightB)
      setHighlightResult(step.highlightResult)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleConvolution = () => {
    const fullResult = multiplyPolynomials(polyA, polyB)
    const animationSteps: AnimationStep[] = []

    const maxResultDeg = fullResult.length > 0 ? fullResult[fullResult.length - 1].degree : 0

    animationSteps.push({
      description: '开始卷积运算：逐项计算系数',
      polyA,
      polyB,
      result: new Array(maxResultDeg + 1).fill(null).map((_, i) => ({ degree: i, value: 0 })),
      highlightA: -1,
      highlightB: -1,
      highlightResult: -1,
    })

    for (let deg = 0; deg <= maxResultDeg; deg++) {
      const partialResult: PolyCoeff[] = []
      let sum = 0
      let bestA = -1
      let bestB = -1

      for (const ca of polyA) {
        const neededDeg = deg - ca.degree
        const cb = polyB.find(b => b.degree === neededDeg)
        if (cb) {
          const product = ca.value * cb.value
          sum += product
          partialResult.push({ degree: deg, value: sum })
          bestA = ca.degree
          bestB = cb.degree
        }
      }

      const resultState = fullResult.map((c, i) => ({
        degree: i,
        value: i <= deg ? c.value : 0,
      }))

      animationSteps.push({
        description: `计算 x^${deg} 的系数: ${sum} (累加 a_i * b_{${deg}-i})`,
        polyA,
        polyB,
        result: resultState,
        highlightA: bestA,
        highlightB: bestB,
        highlightResult: deg,
      })
    }

    animationSteps.push({
      description: `卷积完成！结果: ${polyToString(fullResult)}`,
      polyA,
      polyB,
      result: fullResult,
      highlightA: -1,
      highlightB: -1,
      highlightResult: -1,
    })

    executeSteps(animationSteps)
  }

  const handleLoadPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey]
    if (!preset) return
    setPolyA([...preset.a])
    setPolyB([...preset.b])
    const newResult = multiplyPolynomials(preset.a, preset.b)
    setResult(newResult)
    setHighlightA(-1)
    setHighlightB(-1)
    setHighlightResult(-1)
    setDescription(`已加载预设: ${preset.label}`)
    setSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setPolyA(INITIAL_POLY_A)
    setPolyB(INITIAL_POLY_B)
    setResult(multiplyPolynomials(INITIAL_POLY_A, INITIAL_POLY_B))
    setHighlightA(-1)
    setHighlightB(-1)
    setHighlightResult(-1)
    setDescription('已重置')
    setSteps([])
    setCurrentStep(0)
  }

  const seqA = getSeqFromPoly(polyA)
  const seqB = getSeqFromPoly(polyB)
  const seqResult = getSeqFromPoly(result)
  const maxLen = Math.max(seqA.length, seqB.length, seqResult.length, 6)

  const renderBarChart = (
    values: number[],
    highlightIndex: number,
    color: string,
    label: string
  ) => {
    const maxVal = Math.max(1, ...values.map(Math.abs))
    const barWidth = 36
    const barGap = 6
    const chartHeight = 120
    const totalWidth = maxLen * (barWidth + barGap) + 20

    return (
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 }}>
          {label}
        </div>
        <svg width={totalWidth} height={chartHeight + 30} style={{ display: 'block' }}>
          {Array.from({ length: maxLen }).map((_, i) => {
            const val = values[i] ?? 0
            const barH = Math.abs(val) === 0 ? 2 : (Math.abs(val) / maxVal) * (chartHeight - 20)
            const x = 10 + i * (barWidth + barGap)
            const y = val >= 0 ? chartHeight - barH : chartHeight
            const isHighlighted = i === highlightIndex
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barH, 2)}
                  rx={3}
                  fill={isHighlighted ? color : 'var(--bg-card)'}
                  stroke={isHighlighted ? color : 'var(--border)'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  opacity={val === 0 && !isHighlighted ? 0.3 : 1}
                />
                <text
                  x={x + barWidth / 2}
                  y={val >= 0 ? y - 5 : y + barH + 14}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHighlighted ? 'bold' : 'normal'}
                  fill={isHighlighted ? color : 'var(--text-secondary)'}
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {val}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--text-secondary)"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  x^{i}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            className="btn btn-primary"
            onClick={() => handleLoadPreset(key)}
            disabled={isPlaying}
          >
            {preset.label}
          </button>
        ))}
        <button className="btn btn-primary" onClick={handleConvolution} disabled={isPlaying}>
          执行卷积动画
        </button>
        <button
          className="btn btn-secondary"
          onClick={handlePauseResume}
          disabled={steps.length === 0 || currentStep >= steps.length}
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

      <div className="viz-canvas" style={{ overflowX: 'auto', padding: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            A(x) = {polyToString(polyA)} &nbsp; | &nbsp; B(x) = {polyToString(polyB)}
          </span>
        </div>
        {renderBarChart(seqA, highlightA, '#3b82f6', 'A(x) 的系数')}
        {renderBarChart(seqB, highlightB, '#22c55e', 'B(x) 的系数')}
        <div style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          A(x) * B(x) =
        </div>
        {renderBarChart(seqResult, highlightResult, '#f59e0b', '卷积结果 C(x) 的系数')}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          多项式 A(x)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          多项式 B(x)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          卷积结果
        </span>
      </div>
    </div>
  )
}
