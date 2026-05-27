import { useState, useEffect, useRef, useCallback } from 'react'

type VizMode = 'triangle' | 'paths'

interface AnimationStep {
  description: string
  highlightIndex: number
  dependencies: number[]
  values: number[]
}

interface PathStep {
  description: string
  paths: [number, number][][]
  currentPath: [number, number][]
}

export default function CatalanNumbersVisualization() {
  const [mode, setMode] = useState<VizMode>('triangle')
  const [maxN, setMaxN] = useState(8)
  const [values, setValues] = useState<number[]>([])
  const [highlightIndex, setHighlightIndex] = useState<number>(-1)
  const [dependencies, setDependencies] = useState<number[]>([])
  const [description, setDescription] = useState<string>('卡特兰数 - 选择模式后点击「开始」')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [pathN, setPathN] = useState(4)
  const [pathSteps, setPathSteps] = useState<PathStep[]>([])
  const [currentPathStep, setCurrentPathStep] = useState(0)
  const [completedPaths, setCompletedPaths] = useState<[number, number][][]>([])
  const [activePath, setActivePath] = useState<[number, number][]>([])
  const timerRef = useRef<number | null>(null)

  // Generate all Dyck paths for small n
  const generateDyckPaths = useCallback((n: number): [number, number][][] => {
    const paths: [number, number][] = []
    const result: [number, number][][] = []

    function backtrack(x: number, y: number) {
      if (x === n && y === n) {
        result.push([...paths])
        return
      }
      if (x < n) {
        paths.push([x + 1, y])
        backtrack(x + 1, y)
        paths.pop()
      }
      if (y < x && y < n) {
        paths.push([x, y + 1])
        backtrack(x, y + 1)
        paths.pop()
      }
    }

    paths.push([0, 0])
    backtrack(0, 0)
    return result
  }, [])

  // Generate triangle build steps
  const generateTriangleSteps = useCallback((n: number): AnimationStep[] => {
    const allSteps: AnimationStep[] = []
    const c: number[] = new Array(n + 1).fill(0)
    c[0] = 1

    allSteps.push({
      description: `边界条件: C(0) = 1（空树/空序列算 1 种方案）`,
      highlightIndex: 0,
      dependencies: [],
      values: [...c],
    })

    for (let i = 1; i <= n; i++) {
      const deps: number[] = []
      const terms: string[] = []
      for (let j = 0; j < i; j++) {
        deps.push(j)
        deps.push(i - 1 - j)
        if (c[j] > 0 && c[i - 1 - j] > 0) {
          terms.push(`C(${j}) * C(${i - 1 - j}) = ${c[j]} * ${c[i - 1 - j]} = ${c[j] * c[i - 1 - j]}`)
        }
      }
      // Recompute c[i] for the step
      let sum = 0
      for (let j = 0; j < i; j++) {
        sum += c[j] * c[i - 1 - j]
      }
      c[i] = sum

      const uniqueDeps = [...new Set(deps)]
      allSteps.push({
        description: `C(${i}) = ${terms.join(' + ')} = ${c[i]}`,
        highlightIndex: i,
        dependencies: uniqueDeps,
        values: [...c],
      })
    }

    return allSteps
  }, [])

  // Generate path visualization steps
  const generatePathSteps = useCallback((n: number): PathStep[] => {
    const allPaths = generateDyckPaths(n)
    const steps: PathStep[] = []

    steps.push({
      description: `${n}x${n} 网格，不越过对角线 y=x 的路径数为 C(${n}) = ${allPaths.length}`,
      paths: [],
      currentPath: [],
    })

    for (let i = 0; i < allPaths.length; i++) {
      const completedBefore = allPaths.slice(0, i)
      steps.push({
        description: `第 ${i + 1} 条路径: ${allPaths[i].map(p => `(${p[0]},${p[1]})`).join(' → ')}`,
        paths: completedBefore,
        currentPath: allPaths[i],
      })
    }

    steps.push({
      description: `共 ${allPaths.length} 条合法路径，即 C(${n}) = ${allPaths.length}`,
      paths: allPaths,
      currentPath: [],
    })

    return steps
  }, [generateDyckPaths])

  useEffect(() => {
    if (!isPlaying) return

    if (mode === 'triangle') {
      if (currentStep >= steps.length) {
        setIsPlaying(false)
        setDescription('构建完成！')
        setHighlightIndex(-1)
        setDependencies([])
        return
      }

      const step = steps[currentStep]
      timerRef.current = window.setTimeout(() => {
        setValues(step.values)
        setHighlightIndex(step.highlightIndex)
        setDependencies(step.dependencies)
        setDescription(step.description)
        setCurrentStep(prev => prev + 1)
      }, speed)
    } else {
      if (currentPathStep >= pathSteps.length) {
        setIsPlaying(false)
        setDescription('路径展示完成！')
        return
      }

      const step = pathSteps[currentPathStep]
      timerRef.current = window.setTimeout(() => {
        setCompletedPaths(step.paths)
        setActivePath(step.currentPath)
        setDescription(step.description)
        setCurrentPathStep(prev => prev + 1)
      }, speed)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, currentPathStep, steps, pathSteps, speed, mode])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)

    if (mode === 'triangle') {
      setValues([])
      setHighlightIndex(-1)
      setDependencies([])
      const animationSteps = generateTriangleSteps(maxN)
      setSteps(animationSteps)
      setCurrentStep(0)
      setIsPlaying(true)
      setDescription('开始构建卡特兰数序列...')
    } else {
      setCompletedPaths([])
      setActivePath([])
      const pSteps = generatePathSteps(pathN)
      setPathSteps(pSteps)
      setCurrentPathStep(0)
      setIsPlaying(true)
      setDescription('开始展示 Dyck 路径...')
    }
  }

  const handleShowFull = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)

    if (mode === 'triangle') {
      const c: number[] = new Array(maxN + 1).fill(0)
      c[0] = 1
      for (let i = 1; i <= maxN; i++) {
        for (let j = 0; j < i; j++) {
          c[i] += c[j] * c[i - 1 - j]
        }
      }
      setValues(c)
      setHighlightIndex(-1)
      setDependencies([])
      setSteps([])
      setCurrentStep(0)
      setDescription(`卡特兰数序列 C(0) 到 C(${maxN})`)
    } else {
      const allPaths = generateDyckPaths(pathN)
      setCompletedPaths(allPaths)
      setActivePath([])
      setPathSteps([])
      setCurrentPathStep(0)
      setDescription(`${pathN}x${pathN} 网格的所有 ${allPaths.length} 条 Dyck 路径`)
    }
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else {
      const hasSteps = mode === 'triangle'
        ? (steps.length > 0 && currentStep < steps.length)
        : (pathSteps.length > 0 && currentPathStep < pathSteps.length)
      if (hasSteps) {
        setIsPlaying(true)
      }
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setValues([])
    setHighlightIndex(-1)
    setDependencies([])
    setSteps([])
    setCurrentStep(0)
    setCompletedPaths([])
    setActivePath([])
    setPathSteps([])
    setCurrentPathStep(0)
    setDescription('已重置')
  }

  const handleModeSwitch = (newMode: VizMode) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setMode(newMode)
    setValues([])
    setHighlightIndex(-1)
    setDependencies([])
    setSteps([])
    setCurrentStep(0)
    setCompletedPaths([])
    setActivePath([])
    setPathSteps([])
    setCurrentPathStep(0)
    setDescription(newMode === 'triangle' ? '已切换为序列构建模式' : '已切换为 Dyck 路径模式')
  }

  // Render triangle mode (bar chart)
  const renderTriangleMode = () => {
    if (values.length === 0) return null

    const maxVal = Math.max(...values, 1)
    const barWidth = Math.min(50, Math.max(20, 500 / values.length))
    const chartHeight = 250
    const chartWidth = values.length * (barWidth + 8) + 40

    return (
      <svg width={Math.max(chartWidth, 400)} height={chartHeight + 60} style={{ display: 'block', margin: '0 auto' }}>
        {/* Bars */}
        {values.map((val, i) => {
          const barHeight = maxVal > 0 ? (val / maxVal) * (chartHeight - 40) : 0
          const x = 30 + i * (barWidth + 8)
          const y = chartHeight - barHeight - 10

          let fill = 'var(--bg-card)'
          let stroke = 'var(--border)'
          let textColor = 'var(--text-primary)'

          if (i === highlightIndex) {
            fill = '#3b82f6'
            stroke = '#2563eb'
            textColor = '#ffffff'
          } else if (dependencies.includes(i)) {
            fill = '#93c5fd'
            stroke = '#60a5fa'
          }

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={fill}
                stroke={stroke}
                strokeWidth={1.5}
                rx={3}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                fill={textColor}
                fontSize={val > 999 ? 9 : 11}
                fontWeight={i === highlightIndex ? 'bold' : 'normal'}
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                {val}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 8}
                fill="var(--text-secondary)"
                fontSize="11"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                {i}
              </text>
            </g>
          )
        })}

        {/* Axis labels */}
        <text x={chartWidth / 2} y={chartHeight + 30} fill="var(--text-secondary)" fontSize="12" textAnchor="middle">
          n
        </text>
        <text x={10} y={chartHeight / 2} fill="var(--text-secondary)" fontSize="12" textAnchor="middle" transform={`rotate(-90, 10, ${chartHeight / 2})`}>
          C(n)
        </text>
      </svg>
    )
  }

  // Render path mode
  const renderPathMode = () => {
    const n = pathN
    const cellSize = Math.min(45, 280 / (n + 1))
    const padding = 30
    const gridSize = (n + 1) * cellSize
    const svgSize = gridSize + padding * 2

    return (
      <svg width={Math.max(svgSize, 300)} height={Math.max(svgSize, 300)} style={{ display: 'block', margin: '0 auto' }}>
        {/* Grid lines */}
        {Array.from({ length: n + 1 }, (_, i) => (
          <g key={`grid-${i}`}>
            <line
              x1={padding}
              y1={padding + i * cellSize}
              x2={padding + gridSize}
              y2={padding + i * cellSize}
              stroke="var(--border)"
              strokeWidth={0.5}
              opacity={0.5}
            />
            <line
              x1={padding + i * cellSize}
              y1={padding}
              x2={padding + i * cellSize}
              y2={padding + gridSize}
              stroke="var(--border)"
              strokeWidth={0.5}
              opacity={0.5}
            />
          </g>
        ))}

        {/* Diagonal y = x */}
        <line
          x1={padding}
          y1={padding + gridSize}
          x2={padding + gridSize}
          y2={padding}
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="6,4"
          opacity={0.6}
        />
        <text
          x={padding + gridSize + 5}
          y={padding - 5}
          fill="#ef4444"
          fontSize="10"
        >
          y=x
        </text>

        {/* Grid point labels */}
        {Array.from({ length: n + 1 }, (_, i) => (
          <g key={`label-${i}`}>
            <text
              x={padding + i * cellSize}
              y={padding + gridSize + 16}
              fill="var(--text-secondary)"
              fontSize="9"
              textAnchor="middle"
              fontFamily="Consolas, Monaco, monospace"
            >
              {i}
            </text>
            <text
              x={padding - 10}
              y={padding + (n - i) * cellSize + 4}
              fill="var(--text-secondary)"
              fontSize="9"
              textAnchor="end"
              fontFamily="Consolas, Monaco, monospace"
            >
              {i}
            </text>
          </g>
        ))}

        {/* Completed paths */}
        {completedPaths.map((path, idx) => {
          const pathData = path.map((p, i) => {
            const x = padding + p[0] * cellSize
            const y = padding + (n - p[1]) * cellSize
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
          }).join(' ')

          return (
            <path
              key={`completed-${idx}`}
              d={pathData}
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1.5}
              opacity={0.4}
            />
          )
        })}

        {/* Active path */}
        {activePath.length > 0 && (() => {
          const pathData = activePath.map((p, i) => {
            const x = padding + p[0] * cellSize
            const y = padding + (n - p[1]) * cellSize
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
          }).join(' ')

          return (
            <>
              <path
                d={pathData}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Start and end points */}
              <circle
                cx={padding + activePath[0][0] * cellSize}
                cy={padding + (n - activePath[0][1]) * cellSize}
                r={4}
                fill="#22c55e"
              />
              <circle
                cx={padding + activePath[activePath.length - 1][0] * cellSize}
                cy={padding + (n - activePath[activePath.length - 1][1]) * cellSize}
                r={4}
                fill="#ef4444"
              />
            </>
          )
        })()}

        {/* Grid dots */}
        {Array.from({ length: n + 1 }, (_, x) =>
          Array.from({ length: n + 1 }, (_, y) => {
            if (y > x) return null
            return (
              <circle
                key={`dot-${x}-${y}`}
                cx={padding + x * cellSize}
                cy={padding + (n - y) * cellSize}
                r={2.5}
                fill="var(--text-secondary)"
                opacity={0.6}
              />
            )
          })
        )}
      </svg>
    )
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={`btn ${mode === 'triangle' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleModeSwitch('triangle')}
            disabled={isPlaying}
          >
            序列构建
          </button>
          <button
            className={`btn ${mode === 'paths' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleModeSwitch('paths')}
            disabled={isPlaying}
          >
            Dyck 路径
          </button>
        </div>

        {mode === 'triangle' ? (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            n 最大值:
            <input
              type="range"
              min="3"
              max="12"
              value={maxN}
              onChange={(e) => {
                setMaxN(Number(e.target.value))
                setValues([])
                setHighlightIndex(-1)
                setDependencies([])
                setSteps([])
                setCurrentStep(0)
              }}
              disabled={isPlaying}
            />
            <span>{maxN}</span>
          </label>
        ) : (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            网格大小:
            <input
              type="range"
              min="2"
              max="6"
              value={pathN}
              onChange={(e) => {
                setPathN(Number(e.target.value))
                setCompletedPaths([])
                setActivePath([])
                setPathSteps([])
                setCurrentPathStep(0)
              }}
              disabled={isPlaying}
            />
            <span>{pathN}x{pathN}</span>
          </label>
        )}

        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始
        </button>
        <button className="btn btn-primary" onClick={handleShowFull} disabled={isPlaying}>
          显示完整
        </button>
        <button
          className="btn btn-secondary"
          onClick={handlePauseResume}
          disabled={
            mode === 'triangle'
              ? (steps.length === 0 || currentStep >= steps.length)
              : (pathSteps.length === 0 || currentPathStep >= pathSteps.length)
          }
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
            min="100"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto', padding: '1rem 0' }}>
        {mode === 'triangle' ? renderTriangleMode() : renderPathMode()}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        {mode === 'triangle' ? (
          <>
            <strong>递推公式：</strong>
            <span> C(n) = sum C(i) * C(n-1-i), i = 0..n-1</span>
            <span style={{ marginLeft: '1.5rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
              当前项
            </span>
            <span style={{ marginLeft: '1rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: '#93c5fd', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
              依赖项
            </span>
          </>
        ) : (
          <>
            <strong>Dyck 路径：</strong>
            <span> 从 (0,0) 到 (n,n)，每步向右或向上，不越过对角线 y=x</span>
            <span style={{ marginLeft: '1rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
              起点
            </span>
            <span style={{ marginLeft: '1rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
              终点
            </span>
          </>
        )}
      </div>

      {mode === 'triangle' && values.length > 0 && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>闭合公式验证：</strong>
          {values.map((val, i) => {
            // C(2n, n) / (n+1)
            let binom = 1
            for (let j = 0; j < i; j++) {
              binom = binom * (2 * i - j) / (j + 1)
            }
            const closed = Math.round(binom / (i + 1))
            const match = val === closed ? 'OK' : 'FAIL'
            return (
              <span key={i} style={{ marginLeft: i > 0 ? '0.6rem' : '0' }}>
                C({i})={val}
                <span style={{ color: match === 'OK' ? 'var(--text-secondary)' : '#ef4444' }}>
                  [{match}]
                </span>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
