import { useState, useEffect, useRef, useCallback } from 'react'

interface BinPowStep {
  description: string
  expValue: number
  expBinary: string
  currentBit: number | null // 当前处理的位索引
  bitValue: number | null   // 当前位的值 (0 或 1)
  base: number
  result: number
  action: string // "init" | "square" | "multiply" | "done"
}

function generateSteps(base: number, exp: number, mod: number): BinPowStep[] {
  const steps: BinPowStep[] = []
  let result = 1
  let b = base % mod
  let e = exp
  const originalBase = base

  steps.push({
    description: `初始化: 计算 ${originalBase}^${exp} mod ${mod}`,
    expValue: e,
    expBinary: e.toString(2),
    currentBit: null,
    bitValue: null,
    base: b,
    result,
    action: 'init',
  })

  let bitIndex = 0
  while (e > 0) {
    const isOdd = e % 2 === 1
    const expBefore = e
    const baseBefore = b

    if (isOdd) {
      const prevResult = result
      result = (result * b) % mod
      steps.push({
        description: `第 ${bitIndex + 1} 位为 1: result = ${prevResult} × ${baseBefore} mod ${mod} = ${result}`,
        expValue: expBefore,
        expBinary: expBefore.toString(2),
        currentBit: bitIndex,
        bitValue: 1,
        base: b,
        result,
        action: 'multiply',
      })
    } else {
      steps.push({
        description: `第 ${bitIndex + 1} 位为 0: result 不变 = ${result}`,
        expValue: expBefore,
        expBinary: expBefore.toString(2),
        currentBit: bitIndex,
        bitValue: 0,
        base: b,
        result,
        action: 'square',
      })
    }

    e = Math.floor(e / 2)
    b = (b * b) % mod
    bitIndex++

    if (e > 0) {
      steps.push({
        description: `指数右移: ${expBefore} → ${e}, 底数平方: ${baseBefore} → ${baseBefore}² mod ${mod} = ${b}`,
        expValue: e,
        expBinary: e.toString(2),
        currentBit: null,
        bitValue: null,
        base: b,
        result,
        action: 'square',
      })
    }
  }

  steps.push({
    description: `计算完成! ${originalBase}^${exp} mod ${mod} = ${result}`,
    expValue: 0,
    expBinary: '0',
    currentBit: null,
    bitValue: null,
    base: b,
    result,
    action: 'done',
  })

  return steps
}

export default function BinaryExponentiationVisualization() {
  const [base, setBase] = useState(2)
  const [exp, setExp] = useState(10)
  const [mod, setMod] = useState(1000)
  const [steps, setSteps] = useState<BinPowStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const initSteps = useCallback(() => {
    const s = generateSteps(base, exp, mod)
    setSteps(s)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [base, exp, mod])

  useEffect(() => {
    initSteps()
  }, [initSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
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

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStep = () => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const step = steps[currentStep]
  if (!step) return null

  // 将指数转换为二进制位数组用于显示
  const originalExpBinary = exp.toString(2).split('').map(Number)
  const totalBits = originalExpBinary.length

  // 根据当前步骤确定哪些位已经被处理
  const getProcessedBits = (): number => {
    if (step.action === 'init') return 0
    if (step.action === 'done') return totalBits
    // 找到当前步骤对应的已处理位数
    let processed = 0
    for (let i = 0; i <= currentStep; i++) {
      const s = steps[i]
      if (s.currentBit !== null && s.bitValue !== null) {
        processed = Math.max(processed, s.currentBit + 1)
      }
    }
    return processed
  }

  const processedBits = getProcessedBits()

  const getBitColor = (index: number): string => {
    if (index >= processedBits) return 'var(--bg-card)'
    const bit = originalExpBinary[index]
    if (index === step.currentBit && step.bitValue !== null) {
      return step.bitValue === 1 ? '#22c55e' : '#ef4444'
    }
    return bit === 1 ? '#3b82f6' : '#6b7280'
  }

  const getBitBorder = (index: number): string => {
    if (index === step.currentBit) return '#fbbf24'
    if (index < processedBits) return 'transparent'
    return 'var(--border)'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            底数:
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(Math.max(2, Math.min(100, Number(e.target.value))))}
              style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            指数:
            <input
              type="number"
              value={exp}
              onChange={(e) => setExp(Math.max(1, Math.min(1000, Number(e.target.value))))}
              style={{ width: '70px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            模数:
            <input
              type="number"
              value={mod}
              onChange={(e) => setMod(Math.max(2, Math.min(1000000007, Number(e.target.value))))}
              style={{ width: '90px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying && currentStep < steps.length - 1}>
            播放
          </button>
          <button className="btn btn-primary" onClick={handlePause} disabled={!isPlaying}>
            暂停
          </button>
          <button className="btn btn-secondary" onClick={handleStep} disabled={currentStep >= steps.length - 1}>
            单步
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            重置
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            速度:
            <input
              type="range"
              min="200"
              max="2000"
              value={2200 - speed}
              onChange={(e) => setSpeed(2200 - Number(e.target.value))}
            />
            <span>{speed}ms</span>
          </label>
        </div>
      </div>

      {/* 二进制表示 */}
      <div className="viz-canvas" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            指数 {exp} 的二进制表示:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            {originalExpBinary.map((bit, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    background: getBitColor(idx),
                    border: `2px solid ${getBitBorder(idx)}`,
                    color: '#fff',
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    fontFamily: 'Consolas, Monaco, monospace',
                    transition: 'all 0.3s ease',
                    transform: idx === step.currentBit ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {bit}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: idx === step.currentBit ? '#fbbf24' : 'var(--text-secondary)',
                  fontFamily: 'Consolas, Monaco, monospace',
                }}>
                  2^{totalBits - 1 - idx}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 状态面板 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '8px',
            padding: '1rem',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              当前底数 (base)
            </div>
            <div style={{
              color: '#3b82f6',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: 'Consolas, Monaco, monospace',
            }}>
              {step.base}
            </div>
          </div>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '8px',
            padding: '1rem',
            border: `2px solid ${step.action === 'done' ? '#22c55e' : 'var(--border)'}`,
            textAlign: 'center',
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              当前结果 (result)
            </div>
            <div style={{
              color: step.action === 'done' ? '#22c55e' : '#f59e0b',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: 'Consolas, Monaco, monospace',
            }}>
              {step.result}
            </div>
          </div>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '8px',
            padding: '1rem',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              剩余指数
            </div>
            <div style={{
              color: 'var(--text-primary)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              fontFamily: 'Consolas, Monaco, monospace',
            }}>
              {step.expValue}
            </div>
          </div>
        </div>

        {/* 计算流程 */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid var(--border)',
          marginBottom: '1rem',
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            计算公式
          </div>
          <div style={{
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
            textAlign: 'center',
          }}>
            {base}<sup>{exp}</sup> mod {mod} = <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{step.result}</span>
          </div>
        </div>
      </div>

      <div className="viz-info">
        <strong>步骤 {currentStep + 1}/{steps.length}:</strong> {step.description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例:</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已处理的 1 位
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#6b7280', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已处理的 0 位
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前位 (乘入结果)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前位 (跳过)
        </span>
      </div>
    </div>
  )
}
