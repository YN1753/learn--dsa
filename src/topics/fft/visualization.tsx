import { useState, useEffect, useRef, useCallback } from 'react'

interface Complex {
  re: number
  im: number
}

interface ButterflyEdge {
  from: number
  to: number
  twiddle: number
  stage: number
}

interface AnimationStep {
  description: string
  values: Complex[]
  highlights: number[]
  edges: ButterflyEdge[]
  stage: number
  phase: 'bitreverse' | 'butterfly' | 'result'
}

function complexMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  }
}

function complexAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im }
}

function complexSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im }
}

function complexAbs(c: Complex): number {
  return Math.sqrt(c.re * c.re + c.im * c.im)
}

const N = 8
const STAGES = Math.log2(N)

function bitReverse(x: number, bits: number): number {
  let result = 0
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (x & 1)
    x >>= 1
  }
  return result
}

function generateSteps(): AnimationStep[] {
  const steps: AnimationStep[] = []
  const original: Complex[] = Array.from({ length: N }, (_, i) => ({
    re: Math.round(Math.sin(2 * Math.PI * i / N) * 100) / 100,
    im: 0,
  }))

  // 初始状态
  steps.push({
    description: `初始输入序列 x = [${original.map(v => v.re.toFixed(2)).join(', ')}]`,
    values: original.map(v => ({ ...v })),
    highlights: [],
    edges: [],
    stage: 0,
    phase: 'bitreverse',
  })

  // 位逆序置换
  const bitrev = original.map(v => ({ ...v }))
  const reverseMap: number[] = []
  for (let i = 0; i < N; i++) {
    reverseMap.push(bitReverse(i, STAGES))
  }

  const reordered = Array.from({ length: N }, (_, i) => ({ ...bitrev[reverseMap[i]] }))
  steps.push({
    description: `位逆序置换：将索引按二进制位反转排列`,
    values: reordered,
    highlights: Array.from({ length: N }, (_, i) => i),
    edges: [],
    stage: 0,
    phase: 'bitreverse',
  })

  // 蝶形运算逐级演示
  const current = reordered.map(v => ({ ...v }))
  for (let stage = 1; stage <= STAGES; stage++) {
    const len = 1 << stage
    const halfLen = len >> 1
    const ang = (2 * Math.PI / len)
    const wlen: Complex = { re: Math.cos(ang), im: Math.sin(ang) }

    for (let i = 0; i < N; i += len) {
      let w: Complex = { re: 1, im: 0 }
      const edges: ButterflyEdge[] = []

      for (let j = 0; j < halfLen; j++) {
        const idx1 = i + j
        const idx2 = i + j + halfLen
        const twiddleAngle = Math.atan2(w.im, w.re)

        edges.push({
          from: idx1,
          to: idx2,
          twiddle: twiddleAngle,
          stage,
        })

        const u = { ...current[idx1] }
        const v = complexMul({ ...current[idx2] }, w)
        current[idx1] = complexAdd(u, v)
        current[idx2] = complexSub(u, v)

        w = complexMul(w, wlen)
      }

      steps.push({
        description: `第 ${stage} 级蝶形运算：组 [${i}..${i + len - 1}]，步长 ${len}`,
        values: current.map(v => ({ ...v })),
        highlights: Array.from({ length: len }, (_, j) => i + j),
        edges,
        stage,
        phase: 'butterfly',
      })
    }
  }

  // 最终结果
  steps.push({
    description: `FFT 完成！频域结果 X = [${current.map(v => complexAbs(v).toFixed(2)).join(', ')}]`,
    values: current.map(v => ({ ...v })),
    highlights: Array.from({ length: N }, (_, i) => i),
    edges: [],
    stage: STAGES,
    phase: 'result',
  })

  return steps
}

export default function FFTVisualization() {
  const [steps] = useState<AnimationStep[]>(() => generateSteps())
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const timerRef = useRef<number | null>(null)

  const step = steps[currentStep]

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

  const handleStep = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const canvasWidth = 700
  const canvasHeight = 340
  const nodeRadius = 18
  const stageWidth = canvasWidth / (STAGES + 2)

  const getNodeX = (stage: number) => stageWidth * (stage + 1)
  const getNodeY = (index: number) => 40 + index * ((canvasHeight - 80) / (N - 1))

  const getHighlightColor = (index: number): string => {
    if (!step) return 'var(--bg-card)'
    if (step.phase === 'result') return '#22c55e'
    if (step.highlights.includes(index)) return '#3b82f6'
    return 'var(--bg-card)'
  }

  const getHighlightBorder = (index: number): string => {
    if (!step) return 'var(--border)'
    if (step.phase === 'result') return '#4ade80'
    if (step.highlights.includes(index)) return '#60a5fa'
    return 'var(--border)'
  }

  const formatComplex = (c: Complex): string => {
    const re = c.re.toFixed(2)
    const im = c.im.toFixed(2)
    if (Math.abs(c.im) < 0.001) return re
    if (Math.abs(c.re) < 0.001) return `${im}i`
    const sign = c.im >= 0 ? '+' : ''
    return `${re}${sign}${im}i`
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying && currentStep < steps.length - 1}>
          播放
        </button>
        <button className="btn btn-primary" onClick={handlePause} disabled={!isPlaying}>
          暂停
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={currentStep >= steps.length - 1}>
          单步
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
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
          步骤 {currentStep + 1} / {steps.length}
        </span>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={canvasWidth} height={canvasHeight} style={{ display: 'block', margin: '0 auto' }}>
          {/* 阶段标签 */}
          {Array.from({ length: STAGES + 1 }, (_, s) => (
            <text
              key={`stage-${s}`}
              x={getNodeX(s)}
              y={20}
              fill="var(--text-secondary)"
              fontSize="11"
              textAnchor="middle"
              fontFamily="Consolas, Monaco, monospace"
            >
              {s === 0 ? '输入' : `Stage ${s}`}
            </text>
          ))}

          {/* 蝶形连线 */}
          {step?.edges.map((edge, i) => {
            const x1 = getNodeX(step.stage - 1)
            const x2 = getNodeX(step.stage)
            const y1 = getNodeY(edge.from)
            const y2 = getNodeY(edge.to)
            return (
              <g key={`edge-${i}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth="2" opacity="0.6" />
                <line x1={x1} y1={y2} x2={x2} y2={y1} stroke="#3b82f6" strokeWidth="2" opacity="0.6" />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 6}
                  fill="#60a5fa"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  w^{edge.twiddle.toFixed(2)}
                </text>
              </g>
            )
          })}

          {/* 输入节点（左侧） */}
          {Array.from({ length: N }, (_, i) => {
            const x = getNodeX(0)
            const y = getNodeY(i)
            return (
              <g key={`input-${i}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius}
                  fill={step?.phase === 'bitreverse' ? getHighlightColor(i) : 'var(--bg-card)'}
                  stroke={step?.phase === 'bitreverse' ? getHighlightBorder(i) : 'var(--border)'}
                  strokeWidth={step?.highlights.includes(i) && step?.phase === 'bitreverse' ? 2.5 : 1.5}
                />
                <text
                  x={x}
                  y={y + 4}
                  fill="var(--text-primary)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {i}
                </text>
              </g>
            )
          })}

          {/* 当前阶段的值节点 */}
          {step && (
            <g>
              {step.values.map((val, i) => {
                const stageIdx = step.phase === 'bitreverse' ? 0 : step.stage
                const x = getNodeX(stageIdx)
                const y = getNodeY(i)
                return (
                  <g key={`val-${i}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={nodeRadius}
                      fill={getHighlightColor(i)}
                      stroke={getHighlightBorder(i)}
                      strokeWidth={step.highlights.includes(i) ? 2.5 : 1.5}
                    />
                    <text
                      x={x}
                      y={y + 4}
                      fill="var(--text-primary)"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      {formatComplex(val).substring(0, 7)}
                    </text>
                  </g>
                )
              })}
            </g>
          )}
        </svg>
      </div>

      <div className="viz-info">
        <strong>说明：</strong> {step?.description ?? '加载中...'}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前计算
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          完成
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          未处理
        </span>
      </div>
    </div>
  )
}
