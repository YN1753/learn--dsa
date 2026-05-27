import { useState, useEffect, useRef, useCallback } from 'react'

type Matrix = number[][]

interface StepInfo {
  description: string
  result: Matrix | null
  current: Matrix | null
  exp: number
  bit: number
  squaring: boolean
  multiplying: boolean
}

function matMul(A: Matrix, B: Matrix, mod: number): Matrix {
  const n = A.length
  const m = B[0].length
  const k = B.length
  const C: Matrix = Array.from({ length: n }, () => new Array(m).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      for (let p = 0; p < k; p++) {
        C[i][j] = (C[i][j] + A[i][p] * B[p][j]) % mod
      }
    }
  }
  return C
}

function copyMatrix(M: Matrix): Matrix {
  return M.map(row => [...row])
}

function generateSteps(exp: number): StepInfo[] {
  const MOD = 10 ** 9 + 7
  const steps: StepInfo[] = []
  const T: Matrix = [
    [1, 1],
    [1, 0],
  ]
  const identity: Matrix = [
    [1, 0],
    [0, 1],
  ]

  let result = copyMatrix(identity)
  let current = copyMatrix(T)
  let e = exp
  const bits: number[] = []
  let temp = e
  while (temp > 0) {
    bits.push(temp & 1)
    temp >>= 1
  }
  bits.reverse()

  steps.push({
    description: `初始化：result = 单位矩阵 I，current = T = [[1,1],[1,0]]，exp = ${exp}（二进制 ${exp.toString(2)}）`,
    result: copyMatrix(result),
    current: copyMatrix(current),
    exp: e,
    bit: -1,
    squaring: false,
    multiplying: false,
  })

  for (let i = 0; i < bits.length; i++) {
    const bit = bits[i]

    const squared = matMul(current, current, MOD)
    steps.push({
      description: `步骤 ${i + 1}：检查二进制位 ${bits.length - 1 - i}（值=${bit}）。先平方：current = current²`,
      result: copyMatrix(result),
      current: copyMatrix(squared),
      exp: e,
      bit,
      squaring: true,
      multiplying: false,
    })

    if (bit === 1) {
      const newResult = matMul(result, current, MOD)
      steps.push({
        description: `步骤 ${i + 1}：该位为 1，执行 result = result × current`,
        result: copyMatrix(newResult),
        current: copyMatrix(squared),
        exp: e >> 1,
        bit,
        squaring: false,
        multiplying: true,
      })
      result = newResult
    } else {
      steps.push({
        description: `步骤 ${i + 1}：该位为 0，跳过乘法，result 不变`,
        result: copyMatrix(result),
        current: copyMatrix(squared),
        exp: e >> 1,
        bit,
        squaring: false,
        multiplying: false,
      })
    }

    current = squared
    e >>= 1
  }

  steps.push({
    description: `计算完成！T^${exp} 的 [0][0] 元素即为 F(${exp}) = ${result[0][0]}`,
    result: copyMatrix(result),
    current: copyMatrix(current),
    exp: 0,
    bit: -1,
    squaring: false,
    multiplying: false,
  })

  return steps
}

export default function MatrixExponentiationVisualization() {
  const [exp, setExp] = useState(13)
  const [inputExp, setInputExp] = useState('13')
  const [steps, setSteps] = useState<StepInfo[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const timerRef = useRef<number | null>(null)

  const generateAndReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const s = generateSteps(exp)
    setSteps(s)
    setCurrentStep(0)
  }, [exp])

  useEffect(() => {
    generateAndReset()
  }, [generateAndReset])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
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

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStep = () => {
    if (currentStep < steps.length) {
      setIsPlaying(false)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handleApplyExp = () => {
    const val = parseInt(inputExp, 10)
    if (!isNaN(val) && val >= 1 && val <= 100) {
      setExp(val)
    }
  }

  const step = steps[currentStep] ?? steps[0]

  const renderMatrix = (M: Matrix | null, label: string, highlight?: boolean) => {
    if (!M) return null
    return (
      <div style={{ display: 'inline-block', margin: '0 1rem', verticalAlign: 'top' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
          {label}
        </div>
        <table style={{
          borderCollapse: 'collapse',
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '1rem',
          background: highlight ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
          border: highlight ? '2px solid #3b82f6' : '1px solid var(--border)',
          borderRadius: 4,
        }}>
          <tbody>
            {M.map((row, i) => (
              <tr key={i}>
                {row.map((val, j) => (
                  <td key={j} style={{
                    padding: '0.4rem 0.8rem',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    minWidth: 40,
                    color: 'var(--text-primary)',
                  }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const binaryExp = exp.toString(2)
  const fibResult = step?.result?.[0]?.[0] ?? (currentStep === 0 ? 0 : '?')

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            指数 n:
          </label>
          <input
            type="text"
            value={inputExp}
            onChange={e => setInputExp(e.target.value)}
            style={{
              width: 60,
              padding: '0.25rem 0.4rem',
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          />
          <button className="btn btn-primary" onClick={handleApplyExp}>生成</button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleStep} disabled={currentStep >= steps.length}>
            单步
          </button>
          <button className="btn btn-primary" onClick={handlePauseResume} disabled={currentStep >= steps.length}>
            {isPlaying ? '暂停' : '播放'}
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            重置
          </button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="300"
            max="3000"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ padding: '1rem', minHeight: 200 }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            计算 T^{exp}，n = {exp}，二进制 = {binaryExp}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          {renderMatrix(step?.result ?? null, 'result（结果矩阵）', step?.multiplying)}
          {renderMatrix(step?.current ?? null, 'current（当前矩阵）', step?.squaring)}
        </div>

        {step?.bit !== undefined && step.bit >= 0 && (
          <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.2rem 0.6rem',
              borderRadius: 4,
              fontSize: '0.85rem',
              background: step.bit === 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: step.bit === 1 ? '#22c55e' : '#ef4444',
              border: `1px solid ${step.bit === 1 ? '#22c55e' : '#ef4444'}`,
            }}>
              当前位: {step.bit} {step.bit === 1 ? '(执行乘法)' : '(跳过)'}
            </span>
          </div>
        )}

        {currentStep === steps.length - 1 && steps.length > 1 && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <span style={{
              padding: '0.3rem 0.8rem',
              borderRadius: 4,
              fontSize: '0.95rem',
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              border: '1px solid #f59e0b',
              fontWeight: 'bold',
            }}>
              F({exp}) = {fibResult}
            </span>
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>当前步骤 ({currentStep + 1}/{steps.length})：</strong> {step?.description ?? ''}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(59, 130, 246, 0.3)', border: '2px solid #3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          刚更新
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(34, 197, 94, 0.3)', border: '1px solid #22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          位为 1（乘入结果）
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(239, 68, 68, 0.3)', border: '1px solid #ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          位为 0（跳过）
        </span>
      </div>
    </div>
  )
}
