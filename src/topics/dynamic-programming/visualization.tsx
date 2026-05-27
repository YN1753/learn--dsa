import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// Types
type Problem = 'knapsack' | 'lcs' | 'edit-distance'

interface DPStep {
  row: number
  col: number
  value: number
  dependencies: { row: number; col: number }[]
  description: string
  formula: string
  table: number[][]
}

// Generate knapsack DP steps
function generateKnapsackSteps(): DPStep[] {
  const weights = [2, 3, 4, 5]
  const values = [3, 4, 5, 6]
  const capacity = 8
  const n = weights.length

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  )
  const steps: DPStep[] = []

  // Initial state
  steps.push({
    row: 0,
    col: 0,
    value: 0,
    dependencies: [],
    description: '初始化: 前 0 个物品的最大价值为 0',
    formula: 'dp[0][w] = 0',
    table: dp.map(r => [...r]),
  })

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      const deps: { row: number; col: number }[] = []

      if (w >= weights[i - 1]) {
        const notTake = dp[i - 1][w]
        const take = dp[i - 1][w - weights[i - 1]] + values[i - 1]
        dp[i][w] = Math.max(notTake, take)

        deps.push({ row: i - 1, col: w })
        deps.push({ row: i - 1, col: w - weights[i - 1] })

        steps.push({
          row: i,
          col: w,
          value: dp[i][w],
          dependencies: deps,
          description: `物品${i}(重${weights[i-1]},值${values[i-1]}): max(不取=${notTake}, 取=${take}) = ${dp[i][w]}`,
          formula: `dp[${i}][${w}] = max(dp[${i-1}][${w}], dp[${i-1}][${w-weights[i-1]}]+${values[i-1]})`,
          table: dp.map(r => [...r]),
        })
      } else {
        dp[i][w] = dp[i - 1][w]
        deps.push({ row: i - 1, col: w })

        steps.push({
          row: i,
          col: w,
          value: dp[i][w],
          dependencies: deps,
          description: `物品${i}(重${weights[i-1]})装不下(容量${w}): dp[${i}][${w}] = ${dp[i][w]}`,
          formula: `dp[${i}][${w}] = dp[${i-1}][${w}]`,
          table: dp.map(r => [...r]),
        })
      }
    }
  }

  return steps
}

// Generate LCS DP steps
function generateLCSSteps(): DPStep[] {
  const X = 'ABCBD'
  const Y = 'BDCAB'
  const m = X.length
  const n = Y.length

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )
  const steps: DPStep[] = []

  // Base cases
  steps.push({
    row: 0,
    col: 0,
    value: 0,
    dependencies: [],
    description: '初始化: 空序列的 LCS 长度为 0',
    formula: 'dp[0][j] = dp[i][0] = 0',
    table: dp.map(r => [...r]),
  })

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const deps: { row: number; col: number }[] = []

      if (X[i - 1] === Y[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        deps.push({ row: i - 1, col: j - 1 })

        steps.push({
          row: i,
          col: j,
          value: dp[i][j],
          dependencies: deps,
          description: `'${X[i-1]}' == '${Y[j-1]}': LCS +1 = ${dp[i][j]}`,
          formula: `dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i-1][j-1]} + 1`,
          table: dp.map(r => [...r]),
        })
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
        deps.push({ row: i - 1, col: j })
        deps.push({ row: i, col: j - 1 })

        steps.push({
          row: i,
          col: j,
          value: dp[i][j],
          dependencies: deps,
          description: `'${X[i-1]}' != '${Y[j-1]}': max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}`,
          formula: `dp[${i}][${j}] = max(dp[${i-1}][${j}], dp[${i}][${j-1}])`,
          table: dp.map(r => [...r]),
        })
      }
    }
  }

  return steps
}

// Generate Edit Distance DP steps
function generateEditDistanceSteps(): DPStep[] {
  const A = 'CAT'
  const B = 'CAR'
  const m = A.length
  const n = B.length

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )
  const steps: DPStep[] = []

  // Base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  steps.push({
    row: 0,
    col: 0,
    value: 0,
    dependencies: [],
    description: '初始化: dp[i][0]=i(删除), dp[0][j]=j(插入)',
    formula: 'dp[i][0] = i, dp[0][j] = j',
    table: dp.map(r => [...r]),
  })

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const deps: { row: number; col: number }[] = []

      if (A[i - 1] === B[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
        deps.push({ row: i - 1, col: j - 1 })

        steps.push({
          row: i,
          col: j,
          value: dp[i][j],
          dependencies: deps,
          description: `'${A[i-1]}' == '${B[j-1]}': 无需操作 = ${dp[i][j]}`,
          formula: `dp[${i}][${j}] = dp[${i-1}][${j-1}] = ${dp[i-1][j-1]}`,
          table: dp.map(r => [...r]),
        })
      } else {
        const del = dp[i - 1][j]
        const ins = dp[i][j - 1]
        const rep = dp[i - 1][j - 1]
        dp[i][j] = 1 + Math.min(del, ins, rep)

        deps.push({ row: i - 1, col: j })
        deps.push({ row: i, col: j - 1 })
        deps.push({ row: i - 1, col: j - 1 })

        steps.push({
          row: i,
          col: j,
          value: dp[i][j],
          dependencies: deps,
          description: `'${A[i-1]}' != '${B[j-1]}': 1+min(删${del},插${ins},替${rep}) = ${dp[i][j]}`,
          formula: `dp[${i}][${j}] = 1 + min(${del}, ${ins}, ${rep})`,
          table: dp.map(r => [...r]),
        })
      }
    }
  }

  return steps
}

// Problem configurations
const problemConfigs = {
  knapsack: {
    label: '0/1 背包问题',
    rowLabels: (_steps: DPStep[]) => {
      const n = 4
      const labels = ['i=0']
      for (let i = 1; i <= n; i++) labels.push(`物品${i}`)
      return labels
    },
    colLabels: (_steps: DPStep[]) => {
      const labels: string[] = []
      for (let w = 0; w <= 8; w++) labels.push(`w=${w}`)
      return labels
    },
    description: '物品重量[2,3,4,5], 价值[3,4,5,6], 背包容量8',
    equation: 'dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi]+vi)',
    generate: generateKnapsackSteps,
  },
  lcs: {
    label: '最长公共子序列 (LCS)',
    rowLabels: () => ['', 'A', 'B', 'C', 'B', 'D'],
    colLabels: () => ['', 'B', 'D', 'C', 'A', 'B'],
    description: 'X="ABCBD", Y="BDCAB"',
    equation: 'dp[i][j] = dp[i-1][j-1]+1 (匹配) / max(dp[i-1][j],dp[i][j-1]) (不匹配)',
    generate: generateLCSSteps,
  },
  'edit-distance': {
    label: '编辑距离',
    rowLabels: () => ['', 'C', 'A', 'T'],
    colLabels: () => ['', 'C', 'A', 'R'],
    description: 'A="CAT", B="CAR"',
    equation: 'dp[i][j] = dp[i-1][j-1] (相同) / 1+min(删,插,替) (不同)',
    generate: generateEditDistanceSteps,
  },
}

export default function DPVisualization() {
  const [problem, setProblem] = useState<Problem>('knapsack')
  const [steps, setSteps] = useState<DPStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const timerRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const config = problemConfigs[problem]

  // Generate steps when problem changes
  useEffect(() => {
    const newSteps = config.generate()
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [problem]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return

    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
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
      setIsPlaying(prev => !prev)
    }
  }, [steps, currentStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const current = steps[currentStep] || steps[0]

  const rowLabels = useMemo(() => config.rowLabels(steps), [config, steps])
  const colLabels = useMemo(() => config.colLabels(steps), [config, steps])

  const isDependency = useCallback(
    (r: number, c: number) => {
      if (!current) return false
      return current.dependencies.some(d => d.row === r && d.col === c)
    },
    [current]
  )

  const isCurrent = useCallback(
    (r: number, c: number) => {
      if (!current) return false
      return current.row === r && current.col === c
    },
    [current]
  )

  const getCellColor = useCallback(
    (r: number, c: number) => {
      if (isCurrent(r, c)) return 'var(--accent)'
      if (isDependency(r, c)) return 'var(--warning)'
      const table = current?.table
      if (table && table[r] && table[r][c] !== 0) return 'var(--bg-card)'
      return 'var(--bg-secondary)'
    },
    [isCurrent, isDependency, current]
  )

  const getCellBorder = useCallback(
    (r: number, c: number) => {
      if (isCurrent(r, c)) return '2px solid var(--accent-hover)'
      if (isDependency(r, c)) return '2px solid var(--warning)'
      return '1px solid var(--border)'
    },
    [isCurrent, isDependency]
  )

  const getTextColor = useCallback(
    (r: number, c: number) => {
      if (isCurrent(r, c)) return '#fff'
      return 'var(--text-primary)'
    },
    [isCurrent]
  )

  // Build dependency arrows as SVG
  const arrows = useMemo(() => {
    if (!current || !canvasRef.current) return null

    const table = current.table
    if (!table || !table.length) return null

    const rows = table.length
    const cols = table[0]?.length || 0
    if (rows === 0 || cols === 0) return null

    return current.dependencies.map((dep, idx) => {
      const fromR = dep.row
      const fromC = dep.col
      const toR = current.row
      const toC = current.col

      // Calculate approximate positions
      const cellSize = 52
      const labelOffset = 40
      const fromX = labelOffset + fromC * cellSize + cellSize / 2
      const fromY = labelOffset + fromR * cellSize + cellSize / 2
      const toX = labelOffset + toC * cellSize + cellSize / 2
      const toY = labelOffset + toR * cellSize + cellSize / 2

      return (
        <line
          key={idx}
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="var(--warning)"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
          opacity="0.8"
        />
      )
    })
  }, [current])

  const table = current?.table
  const tableRows = table?.length || 0
  const tableCols = table?.[0]?.length || 0

  return (
    <div className="visualization-container">
      {/* Problem selector */}
      <div className="viz-controls">
        <select
          value={problem}
          onChange={e => {
            setProblem(e.target.value as Problem)
            setIsPlaying(false)
            if (timerRef.current) {
              clearTimeout(timerRef.current)
              timerRef.current = null
            }
          }}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        >
          <option value="knapsack">0/1 背包问题</option>
          <option value="lcs">最长公共子序列 (LCS)</option>
          <option value="edit-distance">编辑距离</option>
        </select>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {config.description}
        </span>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={reset}>
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
            min="100"
            max="1500"
            step="100"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          {speed}ms
        </label>
      </div>

      {/* Progress */}
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
            onChange={e => {
              setIsPlaying(false)
              setCurrentStep(Number(e.target.value))
            }}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* DP Table */}
      <div
        ref={canvasRef}
        className="viz-canvas"
        style={{
          position: 'relative',
          overflow: 'auto',
          padding: '1rem',
          minHeight: '280px',
        }}
      >
        {table && tableRows > 0 && tableCols > 0 && (
          <div style={{ display: 'inline-block', position: 'relative' }}>
            {/* SVG arrows overlay */}
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="var(--warning)" />
                </marker>
              </defs>
              {arrows}
            </svg>

            <table
              style={{
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr>
                  <th style={{ padding: '4px 6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}></th>
                  {Array.from({ length: tableCols }, (_, c) => (
                    <th
                      key={c}
                      style={{
                        padding: '4px 6px',
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                        minWidth: '44px',
                        textAlign: 'center',
                      }}
                    >
                      {colLabels[c] || `c${c}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: tableRows }, (_, r) => (
                  <tr key={r}>
                    <td
                      style={{
                        padding: '4px 6px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'right',
                        paddingRight: '8px',
                      }}
                    >
                      {rowLabels[r] || `r${r}`}
                    </td>
                    {Array.from({ length: tableCols }, (_, c) => (
                      <td
                        key={c}
                        style={{
                          width: '44px',
                          height: '44px',
                          textAlign: 'center',
                          background: getCellColor(r, c),
                          border: getCellBorder(r, c),
                          color: getTextColor(r, c),
                          fontWeight: isCurrent(r, c) ? 'bold' : 'normal',
                          fontSize: isCurrent(r, c) ? '1rem' : '0.85rem',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                        }}
                      >
                        {table[r][c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
              background: 'var(--accent)',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          当前计算
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              background: 'var(--warning)',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          依赖单元格
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              display: 'inline-block',
            }}
          />
          已计算
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>状态转移方程：</strong>{config.equation}
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current?.description || '等待开始...'}
        </div>
        {current && (
          <div
            style={{
              padding: '0.4rem 0.6rem',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius)',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: 'var(--accent)',
            }}
          >
            {current.formula}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginTop: '0.25rem',
          }}
        >
          <span>问题: {config.label}</span>
          <span>步骤: {currentStep + 1} / {steps.length}</span>
        </div>
      </div>
    </div>
  )
}
