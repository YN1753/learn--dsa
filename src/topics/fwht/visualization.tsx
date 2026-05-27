import { useState, useEffect, useRef, useCallback } from 'react'

type ConvType = 'or' | 'and' | 'xor'

interface AnimationStep {
  description: string
  values: number[]
  highlights: number[]
  stage: number
  phase: 'transform' | 'multiply' | 'inverse' | 'result'
  pairEdges: Array<{ from: number; to: number }>
}

function generateSteps(inputA: number[], inputB: number[], type: ConvType): AnimationStep[] {
  const steps: AnimationStep[] = []
  const n = inputA.length
  const stages = Math.log2(n)

  // 初始状态
  steps.push({
    description: `输入数组 a = [${inputA.join(', ')}]，b = [${inputB.join(', ')}]`,
    values: [...inputA],
    highlights: [],
    stage: 0,
    phase: 'transform',
    pairEdges: [],
  })

  // 正变换 a
  const a = [...inputA]
  for (let s = 1; s <= stages; s++) {
    const len = 1 << s
    const half = len >> 1
    const edges: Array<{ from: number; to: number }> = []
    for (let i = 0; i < n; i += len) {
      for (let j = 0; j < half; j++) {
        edges.push({ from: i + j, to: i + j + half })
        if (type === 'or') {
          a[i + j] += a[i + j + half]
        } else if (type === 'and') {
          a[i + j + half] += a[i + j]
        } else {
          const u = a[i + j]
          const v = a[i + j + half]
          a[i + j] = u + v
          a[i + j + half] = u - v
        }
      }
    }
    const typeLabel = type === 'or' ? 'OR' : type === 'and' ? 'AND' : 'XOR'
    steps.push({
      description: `正变换 a：第 ${s} 级 ${typeLabel} 蝶形运算 (len=${len})`,
      values: [...a],
      highlights: edges.flatMap(e => [e.from, e.to]),
      stage: s,
      phase: 'transform',
      pairEdges: edges,
    })
  }

  // 正变换 b
  const b = [...inputB]
  steps.push({
    description: `开始正变换 b = [${inputB.join(', ')}]`,
    values: [...b],
    highlights: [],
    stage: 0,
    phase: 'transform',
    pairEdges: [],
  })

  for (let s = 1; s <= stages; s++) {
    const len = 1 << s
    const half = len >> 1
    const edges: Array<{ from: number; to: number }> = []
    for (let i = 0; i < n; i += len) {
      for (let j = 0; j < half; j++) {
        edges.push({ from: i + j, to: i + j + half })
        if (type === 'or') {
          b[i + j] += b[i + j + half]
        } else if (type === 'and') {
          b[i + j + half] += b[i + j]
        } else {
          const u = b[i + j]
          const v = b[i + j + half]
          b[i + j] = u + v
          b[i + j + half] = u - v
        }
      }
    }
    const typeLabel = type === 'or' ? 'OR' : type === 'and' ? 'AND' : 'XOR'
    steps.push({
      description: `正变换 b：第 ${s} 级 ${typeLabel} 蝶形运算 (len=${len})`,
      values: [...b],
      highlights: edges.flatMap(e => [e.from, e.to]),
      stage: s,
      phase: 'transform',
      pairEdges: edges,
    })
  }

  // 逐点乘法
  const product = a.map((v, i) => v * b[i])
  steps.push({
    description: `逐点相乘：FWHT(a) * FWHT(b) = [${product.join(', ')}]`,
    values: [...product],
    highlights: Array.from({ length: n }, (_, i) => i),
    stage: 0,
    phase: 'multiply',
    pairEdges: [],
  })

  // 逆变换
  const result = [...product]
  for (let s = 1; s <= stages; s++) {
    const len = 1 << s
    const half = len >> 1
    const edges: Array<{ from: number; to: number }> = []
    for (let i = 0; i < n; i += len) {
      for (let j = 0; j < half; j++) {
        edges.push({ from: i + j, to: i + j + half })
        if (type === 'or') {
          result[i + j] -= result[i + j + half]
        } else if (type === 'and') {
          result[i + j + half] -= result[i + j]
        } else {
          const u = result[i + j]
          const v = result[i + j + half]
          result[i + j] = u + v
          result[i + j + half] = u - v
        }
      }
    }
    const typeLabel = type === 'or' ? 'OR' : type === 'and' ? 'AND' : 'XOR'
    steps.push({
      description: `逆变换：第 ${s} 级 ${typeLabel} 蝶形运算 (len=${len})`,
      values: [...result],
      highlights: edges.flatMap(e => [e.from, e.to]),
      stage: s,
      phase: 'inverse',
      pairEdges: edges,
    })
  }

  // XOR 需要除以 n
  if (type === 'xor') {
    for (let i = 0; i < n; i++) {
      result[i] /= n
    }
    steps.push({
      description: `XOR 逆变换：每个元素除以 ${n}`,
      values: [...result],
      highlights: Array.from({ length: n }, (_, i) => i),
      stage: stages,
      phase: 'inverse',
      pairEdges: [],
    })
  }

  // 最终结果
  const finalResult = result.map(x => Math.round(x))
  const typeLabel = type === 'or' ? 'OR' : type === 'and' ? 'AND' : 'XOR'
  steps.push({
    description: `${typeLabel} 卷积结果：c = [${finalResult.join(', ')}]`,
    values: [...finalResult],
    highlights: Array.from({ length: n }, (_, i) => i),
    stage: stages,
    phase: 'result',
    pairEdges: [],
  })

  return steps
}

export default function FWHTVisualization() {
  const [convType, setConvType] = useState<ConvType>('xor')
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const timerRef = useRef<number | null>(null)

  const inputA = [1, 2, 3, 4]
  const inputB = [5, 6, 7, 8]

  useEffect(() => {
    const newSteps = generateSteps(inputA, inputB, convType)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [convType])

  const step = steps[currentStep]
  const n = inputA.length

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

  const canvasWidth = 500
  const canvasHeight = 260
  const nodeRadius = 22
  const nodeGap = (canvasHeight - 80) / (n - 1)

  const getNodeX = (index: number) => 60 + index * ((canvasWidth - 120) / (n - 1))
  const getNodeY = (index: number) => 40 + index * nodeGap

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

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <button
            className={`btn ${convType === 'or' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setConvType('or')}
          >
            OR 卷积
          </button>
          <button
            className={`btn ${convType === 'and' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setConvType('and')}
          >
            AND 卷积
          </button>
          <button
            className={`btn ${convType === 'xor' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setConvType('xor')}
          >
            XOR 卷积
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={canvasWidth} height={canvasHeight} style={{ display: 'block', margin: '0 auto' }}>
          {/* 蝶形连线 */}
          {step?.pairEdges.map((edge, i) => {
            const x1 = getNodeX(edge.from)
            const x2 = getNodeX(edge.to)
            const y1 = getNodeY(edge.from)
            const y2 = getNodeY(edge.to)
            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2
            return (
              <g key={`edge-${i}`}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.5"
                  strokeDasharray="4,3"
                />
                <circle cx={midX} cy={midY} r="3" fill="#3b82f6" />
              </g>
            )
          })}

          {/* 数值节点 */}
          {step?.values.map((val, i) => {
            const x = getNodeX(i)
            const y = getNodeY(i)
            return (
              <g key={`node-${i}`}>
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
                  y={y + 5}
                  fill="var(--text-primary)"
                  fontSize="12"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                  fontWeight={step.highlights.includes(i) ? 'bold' : 'normal'}
                >
                  {Math.round(val)}
                </text>
                <text
                  x={x}
                  y={y + nodeRadius + 14}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  [{i}]
                </text>
              </g>
            )
          })}
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
