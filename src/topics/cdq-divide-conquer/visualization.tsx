import { useState, useRef, useCallback } from 'react'

interface Point3D {
  id: number
  a: number
  b: number
  c: number
  color: string
}

interface DivState {
  left: number
  right: number
  depth: number
  phase: 'divide' | 'conquer' | 'merge'
}

interface StepInfo {
  description: string
  points: Point3D[]
  highlightLeft: number[]
  highlightRight: number[]
  highlightContrib: number[]
  state: string
}

const COLORS = {
  left: '#3b82f6',
  right: '#22c55e',
  contrib: '#f59e0b',
  normal: 'var(--text-secondary)',
  active: '#8b5cf6',
  bg: 'var(--bg-card)',
}

const INITIAL_POINTS: Point3D[] = [
  { id: 0, a: 1, b: 3, c: 2, color: COLORS.normal },
  { id: 1, a: 2, b: 1, c: 3, color: COLORS.normal },
  { id: 2, a: 3, b: 2, c: 1, color: COLORS.normal },
  { id: 3, a: 2, b: 3, c: 3, color: COLORS.normal },
  { id: 4, a: 4, b: 2, c: 2, color: COLORS.normal },
]

export default function CDQVisualization() {
  const [points, setPoints] = useState<Point3D[]>(INITIAL_POINTS)
  const [description, setDescription] = useState<string>('CDQ分治可视化 - 选择操作开始演示')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [steps, setSteps] = useState<StepInfo[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightLeft, setHighlightLeft] = useState<number[]>([])
  const [highlightRight, setHighlightRight] = useState<number[]>([])
  const [highlightContrib, setHighlightContrib] = useState<number[]>([])
  const [stateInfo, setStateInfo] = useState<string>('就绪')
  const timerRef = useRef<number | null>(null)

  const executeSteps = useCallback((animationSteps: StepInfo[]) => {
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [])

  // Auto-play effect
  const stepsRef = useRef(steps)
  const currentStepRef = useRef(currentStep)
  stepsRef.current = steps
  currentStepRef.current = currentStep

  const playNextStep = useCallback(() => {
    if (currentStepRef.current >= stepsRef.current.length) {
      setIsPlaying(false)
      return
    }
    const step = stepsRef.current[currentStepRef.current]
    setPoints([...step.points])
    setHighlightLeft(step.highlightLeft)
    setHighlightRight(step.highlightRight)
    setHighlightContrib(step.highlightContrib)
    setDescription(step.description)
    setStateInfo(step.state)
    setCurrentStep(prev => prev + 1)
  }, [])

  // Use interval for auto-play
  const intervalRef = useRef<number | null>(null)

  if (isPlaying && !intervalRef.current) {
    intervalRef.current = window.setInterval(() => {
      if (currentStepRef.current >= stepsRef.current.length) {
        setIsPlaying(false)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        return
      }
      playNextStep()
    }, speed)
  }

  if (!isPlaying && intervalRef.current) {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  const handleStartCDQ = () => {
    const sorted = [...INITIAL_POINTS].sort((x, y) => x.a - y.a)
    const animationSteps: StepInfo[] = []

    // Step 1: Show initial points
    animationSteps.push({
      description: '初始点集，每个点有三个维度(a, b, c)',
      points: sorted.map(p => ({ ...p, color: COLORS.normal })),
      highlightLeft: [],
      highlightRight: [],
      highlightContrib: [],
      state: '初始化',
    })

    // Step 2: Sort by first dimension
    animationSteps.push({
      description: '按第一维a排序完成。左半部分的a值 <= 右半部分的a值',
      points: sorted.map(p => ({ ...p, color: COLORS.active })),
      highlightLeft: [],
      highlightRight: [],
      highlightContrib: [],
      state: '按第一维排序',
    })

    // Step 3: Divide
    const mid = Math.floor(sorted.length / 2)
    const leftIds = sorted.slice(0, mid + 1).map(p => p.id)
    const rightIds = sorted.slice(mid + 1).map(p => p.id)

    animationSteps.push({
      description: `分治：将点集分成左半(${leftIds.length}个)和右半(${rightIds.length}个)`,
      points: sorted.map(p => ({
        ...p,
        color: leftIds.includes(p.id) ? COLORS.left : COLORS.right,
      })),
      highlightLeft: leftIds,
      highlightRight: rightIds,
      highlightContrib: [],
      state: '分治 - 分成两半',
    })

    // Step 4: Sort by second dimension (b) for merge
    const leftSorted = sorted.slice(0, mid + 1).sort((x, y) => x.b - y.b)
    const rightSorted = sorted.slice(mid + 1).sort((x, y) => x.b - y.b)

    animationSteps.push({
      description: '递归处理后，左右两半各自按第二维b有序。准备归并并计算贡献',
      points: [...leftSorted, ...rightSorted].map(p => ({
        ...p,
        color: leftIds.includes(p.id) ? COLORS.left : COLORS.right,
      })),
      highlightLeft: leftIds,
      highlightRight: rightIds,
      highlightContrib: [],
      state: '归并准备 - 按第二维有序',
    })

    // Step 5: Calculate contributions - left to right
    for (let i = 0; i < rightSorted.length; i++) {
      const rp = rightSorted[i]
      const contribLeft = leftSorted.filter(lp => lp.b <= rp.b)

      animationSteps.push({
        description: `处理右半点(${rp.a},${rp.b},${rp.c})：统计左半中b<=${rp.b}的点，再查树状数组得到c<=${rp.c}的个数`,
        points: [...leftSorted, ...rightSorted].map(p => ({
          ...p,
          color: p.id === rp.id
            ? COLORS.contrib
            : contribLeft.some(cl => cl.id === p.id)
              ? COLORS.left
              : rightIds.includes(p.id)
                ? COLORS.right
                : COLORS.normal,
        })),
        highlightLeft: leftIds,
        highlightRight: rightIds,
        highlightContrib: [rp.id, ...contribLeft.map(cl => cl.id)],
        state: `贡献计算 - 处理右半第${i + 1}个点`,
      })
    }

    // Step 6: Merge complete
    animationSteps.push({
      description: '归并完成！按第二维b排序后，左半对右半的贡献已全部计算。树状数组已清空',
      points: [...leftSorted, ...rightSorted].map(p => ({
        ...p,
        color: COLORS.active,
      })),
      highlightLeft: [],
      highlightRight: [],
      highlightContrib: [],
      state: '归并完成',
    })

    // Step 7: Result
    animationSteps.push({
      description: 'CDQ分治完成！每个点的「被支配数」已统计。整体时间复杂度O(n log^2 n)',
      points: INITIAL_POINTS.map(p => ({ ...p, color: COLORS.normal })),
      highlightLeft: [],
      highlightRight: [],
      highlightContrib: [],
      state: '完成',
    })

    executeSteps(animationSteps)
  }

  const handleShowBruteForce = () => {
    const animationSteps: StepInfo[] = []
    const pts = [...INITIAL_POINTS].sort((x, y) => x.a - y.a)

    animationSteps.push({
      description: '暴力枚举：对每个点，检查所有其他点是否满足三维偏序条件',
      points: pts.map(p => ({ ...p, color: COLORS.normal })),
      highlightLeft: [],
      highlightRight: [],
      highlightContrib: [],
      state: '暴力枚举开始',
    })

    for (let i = 0; i < pts.length; i++) {
      const contribs: number[] = []
      for (let j = 0; j < pts.length; j++) {
        if (i !== j && pts[j].a <= pts[i].a && pts[j].b <= pts[i].b && pts[j].c <= pts[i].c) {
          contribs.push(pts[j].id)
        }
      }

      animationSteps.push({
        description: `检查点${pts[i].id}(${pts[i].a},${pts[i].b},${pts[i].c})：找到${contribs.length}个支配点`,
        points: pts.map(p => ({
          ...p,
          color: p.id === pts[i].id
            ? COLORS.contrib
            : contribs.includes(p.id)
              ? COLORS.left
              : COLORS.normal,
        })),
        highlightLeft: [],
        highlightRight: [],
        highlightContrib: [pts[i].id, ...contribs],
        state: `暴力枚举 - 点${pts[i].id}`,
      })
    }

    animationSteps.push({
      description: '暴力枚举完成。时间复杂度O(n^2)，对于大数据量会超时',
      points: pts.map(p => ({ ...p, color: COLORS.normal })),
      highlightLeft: [],
      highlightRight: [],
      highlightContrib: [],
      state: '暴力枚举完成',
    })

    executeSteps(animationSteps)
  }

  const handleStep = () => {
    if (currentStep >= steps.length) return
    const step = steps[currentStep]
    setPoints([...step.points])
    setHighlightLeft(step.highlightLeft)
    setHighlightRight(step.highlightRight)
    setHighlightContrib(step.highlightContrib)
    setDescription(step.description)
    setStateInfo(step.state)
    setCurrentStep(prev => prev + 1)
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPlaying(false)
    setPoints(INITIAL_POINTS)
    setHighlightLeft([])
    setHighlightRight([])
    setHighlightContrib([])
    setDescription('CDQ分治可视化 - 选择操作开始演示')
    setStateInfo('就绪')
    setSteps([])
    setCurrentStep(0)
  }

  // Layout constants
  const canvasWidth = 600
  const canvasHeight = 360
  const margin = 40
  const plotWidth = canvasWidth - 2 * margin
  const plotHeight = canvasHeight - 2 * margin - 40
  const plotTop = margin + 40

  const maxA = Math.max(...INITIAL_POINTS.map(p => p.a))
  const maxB = Math.max(...INITIAL_POINTS.map(p => p.b))

  const scaleX = (b: number) => margin + (b / (maxB + 1)) * plotWidth
  const scaleY = (a: number) => plotTop + plotHeight - (a / (maxA + 1)) * plotHeight

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStartCDQ} disabled={isPlaying}>
          CDQ分治演示
        </button>
        <button className="btn btn-primary" onClick={handleShowBruteForce} disabled={isPlaying}>
          暴力枚举对比
        </button>
        <button className="btn btn-secondary" onClick={handleStep} disabled={isPlaying || currentStep >= steps.length}>
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
            min="300"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        <svg width={canvasWidth} height={canvasHeight} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
          {/* Background */}
          <rect x={margin} y={plotTop} width={plotWidth} height={plotHeight} fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" rx="4" />

          {/* Grid lines */}
          {[1, 2, 3, 4].map(v => (
            <g key={`grid-${v}`}>
              <line
                x1={margin}
                y1={scaleY(v)}
                x2={margin + plotWidth}
                y2={scaleY(v)}
                stroke="var(--border)"
                strokeWidth="0.5"
                strokeDasharray="4,4"
              />
              <text x={margin - 8} y={scaleY(v) + 4} fill="var(--text-secondary)" fontSize="10" textAnchor="end" fontFamily="Consolas, Monaco, monospace">
                {v}
              </text>
            </g>
          ))}

          {[1, 2, 3, 4].map(v => (
            <g key={`gridx-${v}`}>
              <line
                x1={scaleX(v)}
                y1={plotTop}
                x2={scaleX(v)}
                y2={plotTop + plotHeight}
                stroke="var(--border)"
                strokeWidth="0.5"
                strokeDasharray="4,4"
              />
              <text x={scaleX(v)} y={plotTop + plotHeight + 16} fill="var(--text-secondary)" fontSize="10" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">
                {v}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text x={canvasWidth / 2} y={plotTop - 20} fill="var(--text-primary)" fontSize="13" textAnchor="middle" fontWeight="bold">
            CDQ分治 - 三维偏序可视化
          </text>
          <text x={canvasWidth / 2} y={canvasHeight - 6} fill="var(--text-secondary)" fontSize="11" textAnchor="middle">
            第二维 b
          </text>
          <text x={12} y={plotTop + plotHeight / 2} fill="var(--text-secondary)" fontSize="11" textAnchor="middle" transform={`rotate(-90, 12, ${plotTop + plotHeight / 2})`}>
            第一维 a
          </text>

          {/* Points */}
          {points.map((p) => {
            const cx = scaleX(p.b)
            const cy = scaleY(p.a)
            const isHighlight = highlightContrib.includes(p.id)
            const isLeft = highlightLeft.includes(p.id)
            const isRight = highlightRight.includes(p.id)

            return (
              <g key={p.id}>
                {isHighlight && (
                  <circle cx={cx} cy={cy} r="18" fill="none" stroke={COLORS.contrib} strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r="12"
                  fill={p.color}
                  stroke={isHighlight ? COLORS.contrib : isLeft ? COLORS.left : isRight ? COLORS.right : 'var(--border)'}
                  strokeWidth={isHighlight || isLeft || isRight ? 2.5 : 1.5}
                />
                <text x={cx} y={cy + 4} fill="white" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="Consolas, Monaco, monospace">
                  {p.id}
                </text>
                <text x={cx} y={cy - 18} fill="var(--text-secondary)" fontSize="9" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">
                  ({p.a},{p.b},{p.c})
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="viz-info">
        <strong>当前状态：</strong> {stateInfo}
      </div>
      <div className="viz-info">
        <strong>说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: COLORS.left, borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          左半部分
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: COLORS.right, borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          右半部分
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: COLORS.contrib, borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前计算
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: COLORS.active, borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          活跃点
        </span>
      </div>
    </div>
  )
}
