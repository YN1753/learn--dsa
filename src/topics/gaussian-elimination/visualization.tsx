import { useState, useEffect, useRef, useCallback } from 'react'

interface AnimationStep {
  description: string
  matrix: number[][]
  highlightRow: number
  highlightCol: number
  highlightType: 'pivot' | 'eliminate' | 'swap' | 'result' | 'none'
  pivotRow: number
  pivotCol: number
}

const EXAMPLE_MATRIX: number[][] = [
  [2, 1, -1, 8],
  [-3, -1, 2, -11],
  [-2, 1, 2, -3],
]

function deepCopy(mat: number[][]): number[][] {
  return mat.map(row => [...row])
}

function generateEliminationSteps(initialMatrix: number[][]): AnimationStep[] {
  const steps: AnimationStep[] = []
  const matrix = deepCopy(initialMatrix)
  const n = matrix.length
  const m = matrix[0].length

  steps.push({
    description: '初始增广矩阵',
    matrix: deepCopy(matrix),
    highlightRow: -1,
    highlightCol: -1,
    highlightType: 'none',
    pivotRow: -1,
    pivotCol: -1,
  })

  let pivotRow = 0
  for (let col = 0; col < m - 1 && pivotRow < n; col++) {
    // Find pivot
    let maxRow = pivotRow
    let maxVal = Math.abs(matrix[pivotRow][col])
    for (let row = pivotRow + 1; row < n; row++) {
      if (Math.abs(matrix[row][col]) > maxVal) {
        maxVal = Math.abs(matrix[row][col])
        maxRow = row
      }
    }

    if (maxVal < 1e-10) {
      steps.push({
        description: `第 ${col + 1} 列在当前行及以下全为 0，跳过该列`,
        matrix: deepCopy(matrix),
        highlightRow: -1,
        highlightCol: col,
        highlightType: 'none',
        pivotRow: -1,
        pivotCol: col,
      })
      continue
    }

    // Swap if needed
    if (maxRow !== pivotRow) {
      steps.push({
        description: `选取第 ${col + 1} 列绝对值最大的元素 ${matrix[maxRow][col].toFixed(2)} 作为主元，交换第 ${pivotRow + 1} 行和第 ${maxRow + 1} 行`,
        matrix: deepCopy(matrix),
        highlightRow: maxRow,
        highlightCol: col,
        highlightType: 'swap',
        pivotRow: pivotRow,
        pivotCol: col,
      })
      ;[matrix[pivotRow], matrix[maxRow]] = [matrix[maxRow], matrix[pivotRow]]

      steps.push({
        description: `交换完成`,
        matrix: deepCopy(matrix),
        highlightRow: pivotRow,
        highlightCol: col,
        highlightType: 'pivot',
        pivotRow: pivotRow,
        pivotCol: col,
      })
    } else {
      steps.push({
        description: `选取第 ${col + 1} 列的元素 ${matrix[pivotRow][col].toFixed(2)} 作为主元（第 ${pivotRow + 1} 行）`,
        matrix: deepCopy(matrix),
        highlightRow: pivotRow,
        highlightCol: col,
        highlightType: 'pivot',
        pivotRow: pivotRow,
        pivotCol: col,
      })
    }

    // Eliminate below
    for (let row = pivotRow + 1; row < n; row++) {
      if (Math.abs(matrix[row][col]) < 1e-10) continue

      const factor = matrix[row][col] / matrix[pivotRow][col]
      steps.push({
        description: `消元：第 ${row + 1} 行 - (${factor.toFixed(2)}) × 第 ${pivotRow + 1} 行`,
        matrix: deepCopy(matrix),
        highlightRow: row,
        highlightCol: col,
        highlightType: 'eliminate',
        pivotRow: pivotRow,
        pivotCol: col,
      })

      for (let j = col; j < m; j++) {
        matrix[row][j] -= factor * matrix[pivotRow][j]
        if (Math.abs(matrix[row][j]) < 1e-10) matrix[row][j] = 0
      }

      steps.push({
        description: `消元完成，第 ${row + 1} 行第 ${col + 1} 列变为 0`,
        matrix: deepCopy(matrix),
        highlightRow: row,
        highlightCol: col,
        highlightType: 'eliminate',
        pivotRow: pivotRow,
        pivotCol: col,
      })
    }

    pivotRow++
  }

  // Back substitution
  steps.push({
    description: '消元完成，进入回代阶段',
    matrix: deepCopy(matrix),
    highlightRow: -1,
    highlightCol: -1,
    highlightType: 'result',
    pivotRow: -1,
    pivotCol: -1,
  })

  // Check for no solution
  for (let row = 0; row < n; row++) {
    let allZero = true
    for (let col = 0; col < m - 1; col++) {
      if (Math.abs(matrix[row][col]) > 1e-10) { allZero = false; break }
    }
    if (allZero && Math.abs(matrix[row][m - 1]) > 1e-10) {
      steps.push({
        description: `发现矛盾方程（第 ${row + 1} 行：0 = ${matrix[row][m - 1].toFixed(2)}），方程组无解`,
        matrix: deepCopy(matrix),
        highlightRow: row,
        highlightCol: -1,
        highlightType: 'result',
        pivotRow: -1,
        pivotCol: -1,
      })
      return steps
    }
  }

  // Compute solution
  const solution: number[] = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let pivotCol = -1
    for (let col = 0; col < m - 1; col++) {
      if (Math.abs(matrix[i][col]) > 1e-10) { pivotCol = col; break }
    }
    if (pivotCol === -1) continue

    solution[pivotCol] = matrix[i][m - 1]
    for (let j = pivotCol + 1; j < m - 1; j++) {
      solution[pivotCol] -= matrix[i][j] * solution[j]
    }
    solution[pivotCol] /= matrix[i][pivotCol]
  }

  const solutionStr = solution.map((v, i) => `x${i + 1} = ${v.toFixed(2)}`).join(', ')
  steps.push({
    description: `求解完成：${solutionStr}`,
    matrix: deepCopy(matrix),
    highlightRow: -1,
    highlightCol: -1,
    highlightType: 'result',
    pivotRow: -1,
    pivotCol: -1,
  })

  return steps
}

export default function GaussianEliminationVisualization() {
  const [matrix, setMatrix] = useState<number[][]>(deepCopy(EXAMPLE_MATRIX))
  const [description, setDescription] = useState<string>('高斯消元演示 - 点击「开始消元」观察过程')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightRow, setHighlightRow] = useState(-1)
  const [highlightCol, setHighlightCol] = useState(-1)
  const [highlightType, setHighlightType] = useState<'pivot' | 'eliminate' | 'swap' | 'result' | 'none'>('none')
  const [pivotRow, setPivotRow] = useState(-1)
  const [pivotCol, setPivotCol] = useState(-1)
  const timerRef = useRef<number | null>(null)

  const applyStep = useCallback((step: AnimationStep) => {
    setMatrix(deepCopy(step.matrix))
    setDescription(step.description)
    setHighlightRow(step.highlightRow)
    setHighlightCol(step.highlightCol)
    setHighlightType(step.highlightType)
    setPivotRow(step.pivotRow)
    setPivotCol(step.pivotCol)
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      applyStep(steps[currentStep])
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed, applyStep])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const initial = deepCopy(EXAMPLE_MATRIX)
    setMatrix(initial)
    const allSteps = generateEliminationSteps(initial)
    setSteps(allSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    applyStep(allSteps[0])
    setCurrentStep(1)
  }

  const handleStep = () => {
    if (steps.length === 0) {
      const initial = deepCopy(EXAMPLE_MATRIX)
      setMatrix(initial)
      const allSteps = generateEliminationSteps(initial)
      setSteps(allSteps)
      setCurrentStep(0)
      applyStep(allSteps[0])
      setCurrentStep(1)
      return
    }
    if (currentStep < steps.length) {
      setIsPlaying(false)
      applyStep(steps[currentStep])
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setMatrix(deepCopy(EXAMPLE_MATRIX))
    setDescription('高斯消元演示 - 点击「开始消元」观察过程')
    setSteps([])
    setCurrentStep(0)
    setHighlightRow(-1)
    setHighlightCol(-1)
    setHighlightType('none')
    setPivotRow(-1)
    setPivotCol(-1)
  }

  const getCellColor = (row: number, col: number): string => {
    if (row === highlightRow && highlightType === 'pivot') return '#22c55e'
    if (row === highlightRow && highlightType === 'swap') return '#f59e0b'
    if (row === highlightRow && highlightType === 'eliminate') return '#ef4444'
    if (row === highlightRow && highlightType === 'result') return '#8b5cf6'
    if (row === pivotRow && col === pivotCol && highlightType !== 'none') return '#3b82f6'
    return ''
  }

  const getCellBorder = (row: number, col: number): string => {
    if (row === highlightRow && col === highlightCol && highlightType === 'eliminate') return '2px solid #ef4444'
    if (row === pivotRow && col === pivotCol && highlightType !== 'none') return '2px solid #3b82f6'
    if (row === highlightRow && highlightType === 'pivot') return '2px solid #22c55e'
    return '1px solid var(--border)'
  }

  const m = matrix[0]?.length ?? 0

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始消元
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying && currentStep >= steps.length}>
          单步执行
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
            min="200"
            max="3000"
            value={3100 - speed}
            onChange={(e) => setSpeed(3100 - Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${m}, 80px) 20px repeat(${m}, 80px)`,
            gap: '4px',
            fontFamily: 'Consolas, Monaco, monospace',
          }}>
            {matrix.map((row, i) => (
              <>
                {row.map((val, j) => {
                  const isAugmented = j === m - 1
                  const cellColor = getCellColor(i, j)
                  const cellBorder = getCellBorder(i, j)
                  return (
                    <div key={`${i}-${j}`} style={{ display: 'contents' }}>
                      {j === 0 && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 20,
                          fontSize: '1.2rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 'bold',
                        }}>
                          [
                        </span>
                      )}
                      <div style={{
                        width: 80,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: cellColor ? `${cellColor}22` : 'var(--bg-card)',
                        border: cellBorder,
                        borderRadius: 4,
                        fontSize: '0.95rem',
                        fontWeight: j === highlightCol || i === highlightRow ? 'bold' : 'normal',
                        color: cellColor || 'var(--text-primary)',
                        position: 'relative',
                      }}>
                        {val.toFixed(2)}
                        {isAugmented && (
                          <div style={{
                            position: 'absolute',
                            left: -3,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            background: 'var(--accent)',
                          }} />
                        )}
                      </div>
                      {j === m - 1 && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 20,
                          fontSize: '1.2rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 'bold',
                        }}>
                          ]
                        </span>
                      )}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前主元
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          选定主元行
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          行交换
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          消元操作
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          结果
        </span>
      </div>
    </div>
  )
}
