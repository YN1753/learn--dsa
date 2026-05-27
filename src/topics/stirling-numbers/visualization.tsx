import { useState, useEffect, useRef, useCallback } from 'react'

type StirlingType = 'first' | 'second'

interface AnimationStep {
  description: string
  highlightRow: number
  highlightCol: number
  dependencies: [number, number][]
  triangle: number[][]
}

export default function StirlingNumbersVisualization() {
  const [type, setType] = useState<StirlingType>('second')
  const [maxN, setMaxN] = useState(6)
  const [triangle, setTriangle] = useState<number[][]>([])
  const [highlightCell, setHighlightCell] = useState<[number, number] | null>(null)
  const [dependencies, setDependencies] = useState<[number, number][]>([])
  const [description, setDescription] = useState<string>('斯特林数三角形 - 点击「构建三角形」开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<number | null>(null)

  const computeStirling = useCallback((n: number, k: number, t: StirlingType): number => {
    if (k === 0 && n === 0) return 1
    if (k === 0 || n === 0) return 0
    if (t === 'first') {
      return computeStirling(n - 1, k - 1, t) + (n - 1) * computeStirling(n - 1, k, t)
    } else {
      return computeStirling(n - 1, k - 1, t) + k * computeStirling(n - 1, k, t)
    }
  }, [])

  const buildFullTriangle = useCallback((n: number, t: StirlingType): number[][] => {
    const tri: number[][] = []
    for (let i = 0; i <= n; i++) {
      tri[i] = []
      for (let j = 0; j <= i; j++) {
        if (i === 0 && j === 0) {
          tri[i][j] = 1
        } else if (j === 0 || i === 0) {
          tri[i][j] = 0
        } else if (t === 'first') {
          tri[i][j] = tri[i - 1][j - 1] + (i - 1) * tri[i - 1][j]
        } else {
          tri[i][j] = tri[i - 1][j - 1] + j * tri[i - 1][j]
        }
      }
    }
    return tri
  }, [])

  const generateSteps = useCallback((n: number, t: StirlingType): AnimationStep[] => {
    const allSteps: AnimationStep[] = []
    const tri: number[][] = []

    for (let i = 0; i <= n; i++) {
      tri[i] = []
      for (let j = 0; j <= i; j++) {
        if (i === 0 && j === 0) {
          tri[i][j] = 1
          allSteps.push({
            description: `边界条件: ${t === 'first' ? 's' : 'S'}(0, 0) = 1`,
            highlightRow: 0,
            highlightCol: 0,
            dependencies: [],
            triangle: tri.map(row => [...row]),
          })
        } else if (j === 0 || i === 0) {
          tri[i][j] = 0
        } else {
          const dep1: [number, number] = [i - 1, j - 1]
          const dep2: [number, number] = [i - 1, j]
          const val1 = tri[i - 1][j - 1]
          const val2 = tri[i - 1][j]
          const coeff = t === 'first' ? (i - 1) : j
          const symbol = t === 'first' ? 's' : 'S'

          tri[i][j] = val1 + coeff * val2

          allSteps.push({
            description: `${symbol}(${i}, ${j}) = ${symbol}(${i - 1}, ${j - 1}) + ${coeff === 1 ? '' : coeff + ' * '}${symbol}(${i - 1}, ${j}) = ${val1} + ${coeff === 1 ? '' : coeff + ' * '}${val2} = ${tri[i][j]}`,
            highlightRow: i,
            highlightCol: j,
            dependencies: [dep1, dep2],
            triangle: tri.map(row => [...row]),
          })
        }
      }
    }
    return allSteps
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      setDescription('构建完成！')
      setHighlightCell(null)
      setDependencies([])
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setTriangle(step.triangle)
      setHighlightCell([step.highlightRow, step.highlightCol])
      setDependencies(step.dependencies)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleBuild = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setTriangle([])
    setHighlightCell(null)
    setDependencies([])
    const animationSteps = generateSteps(maxN, type)
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setDescription('开始构建斯特林三角形...')
  }

  const handleShowFull = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const fullTriangle = buildFullTriangle(maxN, type)
    setTriangle(fullTriangle)
    setHighlightCell(null)
    setDependencies([])
    setSteps([])
    setCurrentStep(0)
    setDescription(`${type === 'first' ? '第一类' : '第二类'}斯特林数三角形 (n = 0 到 ${maxN})`)
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
    setTriangle([])
    setHighlightCell(null)
    setDependencies([])
    setSteps([])
    setCurrentStep(0)
    setDescription('已重置')
  }

  const handleTypeSwitch = (newType: StirlingType) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setType(newType)
    setTriangle([])
    setHighlightCell(null)
    setDependencies([])
    setSteps([])
    setCurrentStep(0)
    setDescription(`已切换为${newType === 'first' ? '第一类' : '第二类'}斯特林数`)
  }

  const cellSize = 60
  const padding = 40
  const svgWidth = Math.max((maxN + 1) * cellSize + padding * 2, 400)
  const svgHeight = (maxN + 1) * cellSize + padding * 2 + 20

  const getCellColor = (n: number, k: number): string => {
    if (highlightCell && highlightCell[0] === n && highlightCell[1] === k) {
      return type === 'first' ? '#8b5cf6' : '#3b82f6'
    }
    if (dependencies.some(([dn, dk]) => dn === n && dk === k)) {
      return type === 'first' ? '#c4b5fd' : '#93c5fd'
    }
    if (triangle[n] && triangle[n][k] !== undefined) {
      return 'var(--bg-card)'
    }
    return 'transparent'
  }

  const getCellBorder = (n: number, k: number): string => {
    if (highlightCell && highlightCell[0] === n && highlightCell[1] === k) {
      return type === 'first' ? '#7c3aed' : '#2563eb'
    }
    if (dependencies.some(([dn, dk]) => dn === n && dk === k)) {
      return type === 'first' ? '#a78bfa' : '#60a5fa'
    }
    if (triangle[n] && triangle[n][k] !== undefined) {
      return 'var(--border)'
    }
    return 'transparent'
  }

  const getCellTextColor = (n: number, k: number): string => {
    if (highlightCell && highlightCell[0] === n && highlightCell[1] === k) {
      return '#ffffff'
    }
    return 'var(--text-primary)'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={`btn ${type === 'second' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTypeSwitch('second')}
            disabled={isPlaying}
          >
            第二类 S(n,k)
          </button>
          <button
            className={`btn ${type === 'first' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTypeSwitch('first')}
            disabled={isPlaying}
          >
            第一类 s(n,k)
          </button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          n 最大值:
          <input
            type="range"
            min="3"
            max="9"
            value={maxN}
            onChange={(e) => {
              setMaxN(Number(e.target.value))
              setTriangle([])
              setHighlightCell(null)
              setDependencies([])
              setSteps([])
              setCurrentStep(0)
            }}
            disabled={isPlaying}
          />
          <span>{maxN}</span>
        </label>
        <button className="btn btn-primary" onClick={handleBuild} disabled={isPlaying}>
          构建三角形
        </button>
        <button className="btn btn-primary" onClick={handleShowFull} disabled={isPlaying}>
          显示完整
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
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg
          width={svgWidth}
          height={svgHeight}
        >
          {triangle.map((row, n) =>
            row.map((val, k) => {
              if (val === undefined) return null
              const x = padding + k * cellSize + (maxN - n) * (cellSize / 2)
              const y = padding + n * cellSize
              return (
                <g key={`${n}-${k}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize - 4}
                    height={cellSize - 4}
                    rx="6"
                    fill={getCellColor(n, k)}
                    stroke={getCellBorder(n, k)}
                    strokeWidth={highlightCell && highlightCell[0] === n && highlightCell[1] === k ? 3 : 1.5}
                  />
                  <text
                    x={x + (cellSize - 4) / 2}
                    y={y + (cellSize - 4) / 2 + 5}
                    fill={getCellTextColor(n, k)}
                    fontSize={val > 999 ? 11 : 14}
                    fontWeight={highlightCell && highlightCell[0] === n && highlightCell[1] === k ? 'bold' : 'normal'}
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {val}
                  </text>
                  {n === 0 && (
                    <text
                      x={x + (cellSize - 4) / 2}
                      y={y - 8}
                      fill="var(--text-secondary)"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      k={k}
                    </text>
                  )}
                  {k === 0 && (
                    <text
                      x={x - 8}
                      y={y + (cellSize - 4) / 2 + 4}
                      fill="var(--text-secondary)"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      n={n}
                    </text>
                  )}
                </g>
              )
            })
          )}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>递推公式：</strong>
        {type === 'first' ? (
          <span> s(n, k) = s(n-1, k-1) + (n-1) * s(n-1, k)</span>
        ) : (
          <span> S(n, k) = S(n-1, k-1) + k * S(n-1, k)</span>
        )}
        <span style={{ marginLeft: '1.5rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: type === 'first' ? '#8b5cf6' : '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前项
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: type === 'first' ? '#c4b5fd' : '#93c5fd', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          依赖项
        </span>
      </div>

      {triangle.length > 0 && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>行和（{type === 'first' ? '第一类' : '第二类'}）：</strong>
          {triangle.map((row, n) => {
            const sum = row.reduce((a, b) => a + b, 0)
            return (
              <span key={n} style={{ marginLeft: n > 0 ? '0.8rem' : '0' }}>
                n={n}: {sum}
                {type === 'second' && n <= 10 && (
                  <span style={{ color: 'var(--text-secondary)' }}> (B<sub>{n}</sub>)</span>
                )}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
