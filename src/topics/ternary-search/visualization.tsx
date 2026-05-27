import { useState, useEffect, useRef, useCallback } from 'react'

interface SearchStep {
  left: number
  right: number
  m1: number
  m2: number
  f1: number
  f2: number
  eliminated: 'left' | 'right' | 'none'
  description: string
  iteration: number
}

type FunctionChoice = 'parabola' | 'quartic' | 'cubic'

interface FunctionDef {
  label: string
  f: (x: number) => number
  domain: [number, number]
  peak: number
}

const FUNCTIONS: Record<FunctionChoice, FunctionDef> = {
  parabola: {
    label: 'f(x) = -(x-3)^2 + 10',
    f: (x) => -(x - 3) * (x - 3) + 10,
    domain: [0, 6],
    peak: 3,
  },
  quartic: {
    label: 'f(x) = -x^4 + 12x^2 + 1',
    f: (x) => -x * x * x * x + 12 * x * x + 1,
    domain: [-4, 4],
    peak: -Math.sqrt(6),
  },
  cubic: {
    label: 'f(x) = -(x-2)^2(x-8)^2 / 50 + 9',
    f: (x) => -((x - 2) * (x - 2) * (x - 8) * (x - 8)) / 50 + 9,
    domain: [0, 10],
    peak: 5,
  },
}

const SVG_WIDTH = 700
const SVG_HEIGHT = 360
const PADDING = { top: 30, right: 30, bottom: 40, left: 50 }
const PLOT_W = SVG_WIDTH - PADDING.left - PADDING.right
const PLOT_H = SVG_HEIGHT - PADDING.top - PADDING.bottom

function mapX(x: number, domain: [number, number]): number {
  return PADDING.left + ((x - domain[0]) / (domain[1] - domain[0])) * PLOT_W
}

function mapY(y: number, yMin: number, yMax: number): number {
  return PADDING.top + ((yMax - y) / (yMax - yMin)) * PLOT_H
}

function generateCurvePoints(
  f: (x: number) => number,
  domain: [number, number],
  count: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  const step = (domain[1] - domain[0]) / count
  for (let i = 0; i <= count; i++) {
    const x = domain[0] + step * i
    points.push({ x, y: f(x) })
  }
  return points
}

function computeYRange(
  f: (x: number) => number,
  domain: [number, number]
): [number, number] {
  let yMin = Infinity
  let yMax = -Infinity
  const steps = 200
  const dx = (domain[1] - domain[0]) / steps
  for (let i = 0; i <= steps; i++) {
    const x = domain[0] + dx * i
    const y = f(x)
    if (y < yMin) yMin = y
    if (y > yMax) yMax = y
  }
  const margin = (yMax - yMin) * 0.1
  return [yMin - margin, yMax + margin]
}

function generateSteps(
  f: (x: number) => number,
  domain: [number, number]
): SearchStep[] {
  const steps: SearchStep[] = []
  let left = domain[0]
  let right = domain[1]
  const epsilon = 1e-8

  steps.push({
    left,
    right,
    m1: left + (right - left) / 3,
    m2: right - (right - left) / 3,
    f1: f(left + (right - left) / 3),
    f2: f(right - (right - left) / 3),
    eliminated: 'none',
    description: `初始区间 [${left.toFixed(2)}, ${right.toFixed(2)}]，计算两个三等分点`,
    iteration: 0,
  })

  let iteration = 0
  while (right - left > epsilon) {
    iteration++
    const m1 = left + (right - left) / 3
    const m2 = right - (right - left) / 3
    const f1 = f(m1)
    const f2 = f(m2)

    if (f1 < f2) {
      steps.push({
        left,
        right,
        m1,
        m2,
        f1,
        f2,
        eliminated: 'left',
        description: `f(m1)=${f1.toFixed(4)} < f(m2)=${f2.toFixed(4)}，最大值在右侧，排除 [${left.toFixed(4)}, ${m1.toFixed(4)}]`,
        iteration,
      })
      left = m1
    } else {
      steps.push({
        left,
        right,
        m1,
        m2,
        f1,
        f2,
        eliminated: 'right',
        description: `f(m1)=${f1.toFixed(4)} >= f(m2)=${f2.toFixed(4)}，最大值在左侧，排除 [${m2.toFixed(4)}, ${right.toFixed(4)}]`,
        iteration,
      })
      right = m2
    }
  }

  steps.push({
    left,
    right,
    m1: (left + right) / 2,
    m2: (left + right) / 2,
    f1: f((left + right) / 2),
    f2: f((left + right) / 2),
    eliminated: 'none',
    description: `搜索完成！极值点 x ≈ ${((left + right) / 2).toFixed(6)}，f(x) ≈ ${f((left + right) / 2).toFixed(6)}`,
    iteration,
  })

  return steps
}

function generateGridLines(
  domain: [number, number],
  yRange: [number, number]
): { xLines: number[]; yLines: number[] } {
  const xSpan = domain[1] - domain[0]
  const ySpan = yRange[1] - yRange[0]

  const xStep = Math.pow(10, Math.floor(Math.log10(xSpan / 5)))
  const yStep = Math.pow(10, Math.floor(Math.log10(ySpan / 5)))

  const xLines: number[] = []
  for (let x = Math.ceil(domain[0] / xStep) * xStep; x <= domain[1]; x += xStep) {
    xLines.push(Math.round(x * 1e6) / 1e6)
  }

  const yLines: number[] = []
  for (let y = Math.ceil(yRange[0] / yStep) * yStep; y <= yRange[1]; y += yStep) {
    yLines.push(Math.round(y * 1e6) / 1e6)
  }

  return { xLines, yLines }
}

export default function TernarySearchVisualization() {
  const [funcChoice, setFuncChoice] = useState<FunctionChoice>('parabola')
  const [steps, setSteps] = useState<SearchStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const funcDef = FUNCTIONS[funcChoice]
  const yRange = computeYRange(funcDef.f, funcDef.domain)
  const curvePoints = generateCurvePoints(funcDef.f, funcDef.domain, 300)
  const gridLines = generateGridLines(funcDef.domain, yRange)

  const buildPath = useCallback(() => {
    return curvePoints
      .map((p, i) => {
        const sx = mapX(p.x, funcDef.domain)
        const sy = mapY(p.y, yRange[0], yRange[1])
        return `${i === 0 ? 'M' : 'L'}${sx},${sy}`
      })
      .join(' ')
  }, [curvePoints, funcDef.domain, yRange])

  const regenerateSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newSteps = generateSteps(funcDef.f, funcDef.domain)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [funcDef])

  useEffect(() => {
    regenerateSteps()
  }, [regenerateSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return

    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
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
      setIsPlaying((prev) => !prev)
    }
  }, [steps, currentStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep, steps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleFuncChange = useCallback((choice: FunctionChoice) => {
    setFuncChoice(choice)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const current = steps[currentStep] || steps[0]

  const pathD = buildPath()

  return (
    <div className="visualization-container">
      {/* Function selector */}
      <div className="viz-controls">
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          目标函数:
          <select
            value={funcChoice}
            onChange={(e) => handleFuncChange(e.target.value as FunctionChoice)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          >
            {Object.entries(FUNCTIONS).map(([key, def]) => (
              <option key={key} value={key}>
                {def.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying
            ? '暂停'
            : currentStep >= steps.length - 1
              ? '重新播放'
              : '播放'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={stepForward}
          disabled={currentStep >= steps.length - 1}
        >
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
            onChange={(e) => setSpeed(Number(e.target.value))}
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
            onChange={(e) => {
              setIsPlaying(false)
              setCurrentStep(Number(e.target.value))
            }}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* SVG Canvas */}
      <div
        className="viz-canvas"
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '1rem 0.5rem',
        }}
      >
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{
            maxWidth: '100%',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Grid lines */}
          {gridLines.xLines.map((xVal) => {
            const sx = mapX(xVal, funcDef.domain)
            return (
              <line
                key={`gx-${xVal}`}
                x1={sx}
                y1={PADDING.top}
                x2={sx}
                y2={PADDING.top + PLOT_H}
                stroke="var(--border)"
                strokeWidth={0.5}
                opacity={0.5}
              />
            )
          })}
          {gridLines.yLines.map((yVal) => {
            const sy = mapY(yVal, yRange[0], yRange[1])
            return (
              <line
                key={`gy-${yVal}`}
                x1={PADDING.left}
                y1={sy}
                x2={PADDING.left + PLOT_W}
                y2={sy}
                stroke="var(--border)"
                strokeWidth={0.5}
                opacity={0.5}
              />
            )
          })}

          {/* Axis labels */}
          {gridLines.xLines.map((xVal) => {
            const sx = mapX(xVal, funcDef.domain)
            return (
              <text
                key={`lx-${xVal}`}
                x={sx}
                y={PADDING.top + PLOT_H + 18}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize={10}
              >
                {xVal}
              </text>
            )
          })}
          {gridLines.yLines.map((yVal) => {
            const sy = mapY(yVal, yRange[0], yRange[1])
            return (
              <text
                key={`ly-${yVal}`}
                x={PADDING.left - 8}
                y={sy + 4}
                textAnchor="end"
                fill="var(--text-secondary)"
                fontSize={10}
              >
                {yVal.toFixed(1)}
              </text>
            )
          })}

          {/* Axes */}
          <line
            x1={PADDING.left}
            y1={PADDING.top}
            x2={PADDING.left}
            y2={PADDING.top + PLOT_H}
            stroke="var(--text-secondary)"
            strokeWidth={1}
          />
          <line
            x1={PADDING.left}
            y1={PADDING.top + PLOT_H}
            x2={PADDING.left + PLOT_W}
            y2={PADDING.top + PLOT_H}
            stroke="var(--text-secondary)"
            strokeWidth={1}
          />

          {/* Eliminated region */}
          {current && current.eliminated === 'left' && (
            <rect
              x={mapX(current.left, funcDef.domain)}
              y={PADDING.top}
              width={mapX(current.m1, funcDef.domain) - mapX(current.left, funcDef.domain)}
              height={PLOT_H}
              fill="#6b7280"
              opacity={0.2}
            />
          )}
          {current && current.eliminated === 'right' && (
            <rect
              x={mapX(current.m2, funcDef.domain)}
              y={PADDING.top}
              width={mapX(current.right, funcDef.domain) - mapX(current.m2, funcDef.domain)}
              height={PLOT_H}
              fill="#6b7280"
              opacity={0.2}
            />
          )}

          {/* Current search interval highlight */}
          {current && (
            <rect
              x={mapX(current.left, funcDef.domain)}
              y={PADDING.top}
              width={mapX(current.right, funcDef.domain) - mapX(current.left, funcDef.domain)}
              height={PLOT_H}
              fill="#3b82f6"
              opacity={0.08}
            />
          )}

          {/* Function curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {/* Current interval boundaries */}
          {current && (
            <>
              <line
                x1={mapX(current.left, funcDef.domain)}
                y1={PADDING.top}
                x2={mapX(current.left, funcDef.domain)}
                y2={PADDING.top + PLOT_H}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6,4"
              />
              <line
                x1={mapX(current.right, funcDef.domain)}
                y1={PADDING.top}
                x2={mapX(current.right, funcDef.domain)}
                y2={PADDING.top + PLOT_H}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6,4"
              />
              <text
                x={mapX(current.left, funcDef.domain)}
                y={PADDING.top + PLOT_H + 32}
                textAnchor="middle"
                fill="#3b82f6"
                fontSize={11}
                fontWeight="bold"
              >
                l={current.left.toFixed(2)}
              </text>
              <text
                x={mapX(current.right, funcDef.domain)}
                y={PADDING.top + PLOT_H + 32}
                textAnchor="middle"
                fill="#3b82f6"
                fontSize={11}
                fontWeight="bold"
              >
                r={current.right.toFixed(2)}
              </text>
            </>
          )}

          {/* M1 point and line */}
          {current && current.iteration > 0 && (
            <>
              <line
                x1={mapX(current.m1, funcDef.domain)}
                y1={PADDING.top}
                x2={mapX(current.m1, funcDef.domain)}
                y2={PADDING.top + PLOT_H}
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="4,3"
              />
              <circle
                cx={mapX(current.m1, funcDef.domain)}
                cy={mapY(current.f1, yRange[0], yRange[1])}
                r={5}
                fill="#ef4444"
                stroke="#fff"
                strokeWidth={1.5}
              />
              <text
                x={mapX(current.m1, funcDef.domain)}
                y={mapY(current.f1, yRange[0], yRange[1]) - 12}
                textAnchor="middle"
                fill="#ef4444"
                fontSize={10}
                fontWeight="bold"
              >
                m1={current.m1.toFixed(2)}
              </text>
            </>
          )}

          {/* M2 point and line */}
          {current && current.iteration > 0 && (
            <>
              <line
                x1={mapX(current.m2, funcDef.domain)}
                y1={PADDING.top}
                x2={mapX(current.m2, funcDef.domain)}
                y2={PADDING.top + PLOT_H}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4,3"
              />
              <circle
                cx={mapX(current.m2, funcDef.domain)}
                cy={mapY(current.f2, yRange[0], yRange[1])}
                r={5}
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth={1.5}
              />
              <text
                x={mapX(current.m2, funcDef.domain)}
                y={mapY(current.f2, yRange[0], yRange[1]) - 12}
                textAnchor="middle"
                fill="#f59e0b"
                fontSize={10}
                fontWeight="bold"
              >
                m2={current.m2.toFixed(2)}
              </text>
            </>
          )}

          {/* Peak marker */}
          {current && current.iteration === steps.length - 1 && (
            <circle
              cx={mapX(current.m1, funcDef.domain)}
              cy={mapY(current.f1, yRange[0], yRange[1])}
              r={8}
              fill="#22c55e"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </svg>
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
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#6366f1',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          函数曲线
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#3b82f6',
              borderRadius: '2px',
              display: 'inline-block',
              opacity: 0.4,
            }}
          />
          当前搜索区间
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#ef4444',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
          三等分点 m1
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#f59e0b',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
          三等分点 m2
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              background: '#22c55e',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          />
          极值点
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>
          {current?.description ?? '点击"播放"开始演示'}
        </div>
        {current && (
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
            }}
          >
            <span>函数: {funcDef.label}</span>
            <span>迭代次数: {current.iteration}</span>
            <span>
              区间: [{current.left.toFixed(4)}, {current.right.toFixed(4)}]
            </span>
            <span>区间长度: {(current.right - current.left).toFixed(6)}</span>
            {current.iteration > 0 && current.iteration < steps.length - 1 && (
              <>
                <span style={{ color: '#ef4444' }}>
                  f(m1)={current.f1.toFixed(4)}
                </span>
                <span style={{ color: '#f59e0b' }}>
                  f(m2)={current.f2.toFixed(4)}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
