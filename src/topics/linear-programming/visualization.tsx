import { useState, useEffect, useRef, useCallback } from 'react'

interface SimplexRow {
  coefficients: number[]
  rhs: number
  basisVar: number
}

interface AnimationStep {
  description: string
  table: SimplexRow[]
  objective: number[]
  objValue: number
  enteringVar: number
  leavingVar: number
  pivotRow: number
  pivotCol: number
  isOptimal: boolean
}

const INITIAL_TABLE: SimplexRow[] = [
  { coefficients: [2, 3, 1, 0], rhs: 120, basisVar: 2 },
  { coefficients: [4, 2, 0, 1], rhs: 160, basisVar: 3 },
]

const INITIAL_OBJECTIVE: number[] = [-5, -4, 0, 0]

const VAR_NAMES = ['x₁', 'x₂', 'x₃', 'x₄']

function cloneTable(table: SimplexRow[]): SimplexRow[] {
  return table.map(row => ({
    coefficients: [...row.coefficients],
    rhs: row.rhs,
    basisVar: row.basisVar,
  }))
}

function findPivotCol(objective: number[]): number {
  let minVal = 0
  let minIdx = -1
  for (let i = 0; i < objective.length; i++) {
    if (objective[i] < minVal) {
      minVal = objective[i]
      minIdx = i
    }
  }
  return minIdx
}

function findPivotRow(table: SimplexRow[], pivotCol: number): number {
  let minRatio = Infinity
  let minIdx = -1
  for (let i = 0; i < table.length; i++) {
    if (table[i].coefficients[pivotCol] > 0) {
      const ratio = table[i].rhs / table[i].coefficients[pivotCol]
      if (ratio < minRatio) {
        minRatio = ratio
        minIdx = i
      }
    }
  }
  return minIdx
}

function generateSteps(): AnimationStep[] {
  const steps: AnimationStep[] = []
  let table = cloneTable(INITIAL_TABLE)
  let objective = [...INITIAL_OBJECTIVE]
  let objValue = 0

  // Initial state
  steps.push({
    description: '初始单纯形表：基变量为 x₃ 和 x₄（松弛变量），目标函数值为 0',
    table: cloneTable(table),
    objective: [...objective],
    objValue,
    enteringVar: -1,
    leavingVar: -1,
    pivotRow: -1,
    pivotCol: -1,
    isOptimal: false,
  })

  for (let iter = 0; iter < 10; iter++) {
    const pivotCol = findPivotCol(objective)
    if (pivotCol === -1) {
      steps.push({
        description: `最优解已找到！所有检验数非负，目标函数值 z = ${objValue.toFixed(1)}`,
        table: cloneTable(table),
        objective: [...objective],
        objValue,
        enteringVar: -1,
        leavingVar: -1,
        pivotRow: -1,
        pivotCol: -1,
        isOptimal: true,
      })
      break
    }

    const pivotRow = findPivotRow(table, pivotCol)
    if (pivotRow === -1) {
      steps.push({
        description: '问题无界：找不到出基变量',
        table: cloneTable(table),
        objective: [...objective],
        objValue,
        enteringVar: pivotCol,
        leavingVar: -1,
        pivotRow: -1,
        pivotCol,
        isOptimal: false,
      })
      break
    }

    const enteringName = VAR_NAMES[pivotCol]
    const leavingName = VAR_NAMES[table[pivotRow].basisVar]

    // Show entering/leaving selection
    steps.push({
      description: `第 ${iter + 1} 次迭代：选择 ${enteringName} 入基（检验数 ${objective[pivotCol].toFixed(1)} 最负），${leavingName} 出基（最小比值规则）`,
      table: cloneTable(table),
      objective: [...objective],
      objValue,
      enteringVar: pivotCol,
      leavingVar: table[pivotRow].basisVar,
      pivotRow,
      pivotCol,
      isOptimal: false,
    })

    // Perform pivot operation
    const pivotElement = table[pivotRow].coefficients[pivotCol]
    const newTable = cloneTable(table)
    const newObjective = [...objective]

    // Scale pivot row
    for (let j = 0; j < newTable[pivotRow].coefficients.length; j++) {
      newTable[pivotRow].coefficients[j] /= pivotElement
    }
    newTable[pivotRow].rhs /= pivotElement

    // Eliminate other rows
    for (let i = 0; i < newTable.length; i++) {
      if (i === pivotRow) continue
      const factor = newTable[i].coefficients[pivotCol]
      for (let j = 0; j < newTable[i].coefficients.length; j++) {
        newTable[i].coefficients[j] -= factor * newTable[pivotRow].coefficients[j]
      }
      newTable[i].rhs -= factor * newTable[pivotRow].rhs
    }

    // Eliminate objective row
    const objFactor = newObjective[pivotCol]
    for (let j = 0; j < newObjective.length; j++) {
      newObjective[j] -= objFactor * newTable[pivotRow].coefficients[j]
    }
    const newObjValue = objValue - objFactor * newTable[pivotRow].rhs

    // Update basis
    newTable[pivotRow].basisVar = pivotCol

    table = newTable
    objective = newObjective
    objValue = newObjValue

    // Show result after pivot
    steps.push({
      description: `转轴完成：${enteringName} 替换 ${leavingName} 进入基，目标函数值 z = ${objValue.toFixed(1)}`,
      table: cloneTable(table),
      objective: [...objective],
      objValue,
      enteringVar: -1,
      leavingVar: -1,
      pivotRow,
      pivotCol,
      isOptimal: false,
    })

    // Check optimality
    const isOptimalNow = objective.every(v => v >= -1e-10)
    if (isOptimalNow) {
      steps.push({
        description: `最优解已找到！所有检验数非负，目标函数值 z = ${objValue.toFixed(1)}`,
        table: cloneTable(table),
        objective: [...objective],
        objValue,
        enteringVar: -1,
        leavingVar: -1,
        pivotRow: -1,
        pivotCol: -1,
        isOptimal: true,
      })
      break
    }
  }

  return steps
}

export default function LinearProgrammingVisualization() {
  const [steps] = useState<AnimationStep[]>(() => generateSteps())
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const timerRef = useRef<number | null>(null)

  const step = steps[currentStep] || steps[0]

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps.length, speed])

  const handlePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }, [currentStep, steps.length])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleStepForward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const handleStepBackward = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const getCellColor = (rowIdx: number, colIdx: number): string => {
    if (step.isOptimal) return ''
    if (colIdx === step.pivotCol && rowIdx === step.pivotRow) return 'pivot-element'
    if (colIdx === step.pivotCol) return 'pivot-col'
    if (rowIdx === step.pivotRow) return 'pivot-row'
    return ''
  }

  const getObjCellColor = (colIdx: number): string => {
    if (step.isOptimal) return 'optimal'
    if (colIdx === step.pivotCol) return 'pivot-col'
    return ''
  }

  const getBasisVarName = (basisVar: number): string => {
    return VAR_NAMES[basisVar] || `x${basisVar + 1}`
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={handleReset} disabled={isPlaying}>
          重置
        </button>
        <button className="btn btn-secondary" onClick={handleStepBackward} disabled={currentStep === 0 || isPlaying}>
          上一步
        </button>
        {isPlaying ? (
          <button className="btn btn-primary" onClick={handlePause}>
            暂停
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handlePlay} disabled={currentStep >= steps.length - 1}>
            播放
          </button>
        )}
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={currentStep >= steps.length - 1 || isPlaying}>
          下一步
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="400"
            max="3000"
            value={3200 - speed}
            onChange={(e) => setSpeed(3200 - Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            <strong>问题：</strong>最大化 z = 5x₁ + 4x₂，约束：2x₁ + 3x₂ ≤ 120，4x₁ + 2x₂ ≤ 160
          </div>

          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.9rem',
          }}>
            <thead>
              <tr>
                <th style={{ padding: '0.5rem 1rem', borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)' }}>基变量</th>
                {VAR_NAMES.map((name, i) => (
                  <th key={i} style={{
                    padding: '0.5rem 1rem',
                    borderBottom: '2px solid var(--border)',
                    textAlign: 'center',
                    color: step.enteringVar === i ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: step.enteringVar === i ? 'bold' : 'normal',
                  }}>
                    {name}
                  </th>
                ))}
                <th style={{ padding: '0.5rem 1rem', borderBottom: '2px solid var(--border)', textAlign: 'center', color: 'var(--text-secondary)' }}>RHS</th>
              </tr>
            </thead>
            <tbody>
              {step.table.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td style={{
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    fontWeight: step.leavingVar === row.basisVar ? 'bold' : 'normal',
                    color: step.leavingVar === row.basisVar ? '#ef4444' : 'var(--text-primary)',
                  }}>
                    {getBasisVarName(row.basisVar)}
                  </td>
                  {row.coefficients.map((coeff, colIdx) => (
                    <td key={colIdx} style={{
                      padding: '0.5rem 1rem',
                      borderBottom: '1px solid var(--border)',
                      textAlign: 'center',
                      backgroundColor: getCellColor(rowIdx, colIdx) === 'pivot-element' ? 'rgba(34, 197, 94, 0.3)'
                        : getCellColor(rowIdx, colIdx) === 'pivot-col' ? 'rgba(59, 130, 246, 0.15)'
                        : getCellColor(rowIdx, colIdx) === 'pivot-row' ? 'rgba(239, 68, 68, 0.15)'
                        : 'transparent',
                      color: 'var(--text-primary)',
                    }}>
                      {coeff.toFixed(coeff % 1 === 0 ? 0 : 2)}
                    </td>
                  ))}
                  <td style={{
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                  }}>
                    {row.rhs.toFixed(row.rhs % 1 === 0 ? 0 : 2)}
                  </td>
                </tr>
              ))}
              <tr>
                <td style={{
                  padding: '0.5rem 1rem',
                  borderTop: '2px solid var(--border)',
                  fontWeight: 'bold',
                  color: 'var(--accent)',
                }}>
                  z
                </td>
                {step.objective.map((coeff, colIdx) => (
                  <td key={colIdx} style={{
                    padding: '0.5rem 1rem',
                    borderTop: '2px solid var(--border)',
                    textAlign: 'center',
                    fontWeight: coeff < -1e-10 ? 'bold' : 'normal',
                    backgroundColor: getObjCellColor(colIdx) === 'pivot-col' ? 'rgba(59, 130, 246, 0.15)'
                      : getObjCellColor(colIdx) === 'optimal' ? 'rgba(34, 197, 94, 0.1)'
                      : 'transparent',
                    color: coeff < -1e-10 ? '#ef4444' : step.isOptimal ? '#22c55e' : 'var(--text-primary)',
                  }}>
                    {coeff.toFixed(coeff % 1 === 0 ? 0 : 2)}
                  </td>
                ))}
                <td style={{
                  padding: '0.5rem 1rem',
                  borderTop: '2px solid var(--border)',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: 'var(--accent)',
                }}>
                  {step.objValue.toFixed(step.objValue % 1 === 0 ? 0 : 2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {step.isOptimal && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '8px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.9rem',
          }}>
            <strong style={{ color: '#22c55e' }}>最优解：</strong>
            <span style={{ color: 'var(--text-primary)', marginLeft: '0.5rem' }}>
              {step.table.map(row => `${getBasisVarName(row.basisVar)} = ${row.rhs.toFixed(1)}`).join('，')}
              ，z = {step.objValue.toFixed(1)}
            </span>
          </div>
        )}

        <div style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '1.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
        }}>
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
            入基列
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
            出基行
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(34, 197, 94, 0.3)', border: '1px solid #22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
            主元素
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(239, 68, 68, 0.8)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
            负检验数
          </span>
        </div>
      </div>

      <div className="viz-info">
        <strong>步骤 {currentStep + 1}/{steps.length}：</strong> {step.description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>进度：</strong>
        <span style={{ marginLeft: '0.5rem' }}>
          {currentStep + 1} / {steps.length} 步
        </span>
      </div>
    </div>
  )
}
