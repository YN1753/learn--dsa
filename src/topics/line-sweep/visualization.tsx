import { useState, useEffect, useRef, useCallback } from 'react'

interface Rectangle {
  id: number
  x1: number
  y1: number
  x2: number
  y2: number
}

interface SweepEvent {
  x: number
  rectId: number
  y1: number
  y2: number
  type: 'enter' | 'leave'
}

interface StepState {
  description: string
  sweepX: number
  events: SweepEvent[]
  activeRectIds: number[]
  processedEventIdx: number
  areaSoFar: number
  phase: 'ready' | 'sweeping' | 'done'
}

const INITIAL_RECTS: Rectangle[] = [
  { id: 1, x1: 50, y1: 60, x2: 180, y2: 200 },
  { id: 2, x1: 120, y1: 100, x2: 280, y2: 260 },
  { id: 3, x1: 220, y1: 40, x2: 360, y2: 160 },
  { id: 4, x1: 300, y1: 140, x2: 440, y2: 280 },
  { id: 5, x1: 160, y1: 200, x2: 340, y2: 330 },
]

const RECT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

function computeActiveYLength(rects: Rectangle[], activeIds: number[]): number {
  if (activeIds.length === 0) return 0
  const intervals = activeIds
    .map(id => rects.find(r => r.id === id))
    .filter((r): r is Rectangle => r !== undefined)
    .map(r => ({ y1: r.y1, y2: r.y2 }))
    .sort((a, b) => a.y1 - b.y1)

  let total = 0
  let cur = intervals[0]
  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i].y1 <= cur.y2) {
      cur.y2 = Math.max(cur.y2, intervals[i].y2)
    } else {
      total += cur.y2 - cur.y1
      cur = intervals[i]
    }
  }
  total += cur.y2 - cur.y1
  return total
}

export default function LineSweepVisualization() {
  const [rects] = useState<Rectangle[]>(INITIAL_RECTS)
  const [sweepX, setSweepX] = useState(0)
  const [activeRectIds, setActiveRectIds] = useState<number[]>([])
  const [description, setDescription] = useState<string>('扫描线可视化 - 点击「开始扫描」观看算法执行过程')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [steps, setSteps] = useState<StepState[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [phase, setPhase] = useState<'ready' | 'sweeping' | 'done'>('ready')
  const [areaSoFar, setAreaSoFar] = useState(0)
  const [processedEventIdx, setProcessedEventIdx] = useState(-1)
  const timerRef = useRef<number | null>(null)

  const CANVAS_W = 500
  const CANVAS_H = 380

  const generateSteps = useCallback((): StepState[] => {
    const events: SweepEvent[] = []
    for (const r of rects) {
      events.push({ x: r.x1, rectId: r.id, y1: r.y1, y2: r.y2, type: 'enter' })
      events.push({ x: r.x2, rectId: r.id, y1: r.y1, y2: r.y2, type: 'leave' })
    }
    events.sort((a, b) => a.x - b.x)

    const allSteps: StepState[] = []
    const currentActive: number[] = []
    let totalArea = 0
    let prevX = events[0].x

    // Initial step
    allSteps.push({
      description: `初始状态: ${rects.length} 个矩形，扫描线在最左侧`,
      sweepX: events[0].x,
      events,
      activeRectIds: [],
      processedEventIdx: -1,
      areaSoFar: 0,
      phase: 'ready',
    })

    // Group events by x
    let i = 0
    while (i < events.length) {
      const currentX = events[i].x

      // Area contribution
      if (currentX > prevX) {
        const coverage = computeActiveYLength(rects, currentActive)
        const dx = currentX - prevX
        totalArea += dx * coverage

        allSteps.push({
          description: `扫描线移到 x=${currentX}，区间 [${prevX}, ${currentX}] 的覆盖长度=${coverage}，面积贡献=${dx * coverage}，累计面积=${totalArea}`,
          sweepX: currentX,
          events,
          activeRectIds: [...currentActive],
          processedEventIdx: i - 1,
          areaSoFar: totalArea,
          phase: 'sweeping',
        })
      }

      // Process all events at this x
      while (i < events.length && events[i].x === currentX) {
        const e = events[i]
        if (e.type === 'enter') {
          currentActive.push(e.rectId)
          allSteps.push({
            description: `事件: 矩形${e.rectId} 进入 (左边界 x=${e.x})，将区间 [${e.y1}, ${e.y2}] 加入活跃集`,
            sweepX: currentX,
            events,
            activeRectIds: [...currentActive],
            processedEventIdx: i,
            areaSoFar: totalArea,
            phase: 'sweeping',
          })
        } else {
          const idx = currentActive.indexOf(e.rectId)
          if (idx !== -1) currentActive.splice(idx, 1)
          allSteps.push({
            description: `事件: 矩形${e.rectId} 离开 (右边界 x=${e.x})，将区间 [${e.y1}, ${e.y2}] 从活跃集移除`,
            sweepX: currentX,
            events,
            activeRectIds: [...currentActive],
            processedEventIdx: i,
            areaSoFar: totalArea,
            phase: 'sweeping',
          })
        }
        i++
      }

      prevX = currentX
    }

    // Done step
    allSteps.push({
      description: `扫描完成！矩形面积并 = ${totalArea}`,
      sweepX: events[events.length - 1].x,
      events,
      activeRectIds: [],
      processedEventIdx: events.length - 1,
      areaSoFar: totalArea,
      phase: 'done',
    })

    return allSteps
  }, [rects])

  const executeSteps = useCallback((animationSteps: StepState[]) => {
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setSweepX(step.sweepX)
      setActiveRectIds([...step.activeRectIds])
      setDescription(step.description)
      setAreaSoFar(step.areaSoFar)
      setProcessedEventIdx(step.processedEventIdx)
      setPhase(step.phase)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setActiveRectIds([])
    setAreaSoFar(0)
    setProcessedEventIdx(-1)
    setPhase('ready')
    setCurrentStep(0)
    setSweepX(0)

    const animationSteps = generateSteps()
    setTimeout(() => executeSteps(animationSteps), 50)
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStep = () => {
    if (steps.length === 0) {
      const animationSteps = generateSteps()
      setSteps(animationSteps)
      setCurrentStep(0)

      if (animationSteps.length > 0) {
        const step = animationSteps[0]
        setSweepX(step.sweepX)
        setActiveRectIds([...step.activeRectIds])
        setDescription(step.description)
        setAreaSoFar(step.areaSoFar)
        setProcessedEventIdx(step.processedEventIdx)
        setPhase(step.phase)
        setCurrentStep(1)
      }
      return
    }

    if (currentStep < steps.length) {
      setIsPlaying(false)
      const step = steps[currentStep]
      setSweepX(step.sweepX)
      setActiveRectIds([...step.activeRectIds])
      setDescription(step.description)
      setAreaSoFar(step.areaSoFar)
      setProcessedEventIdx(step.processedEventIdx)
      setPhase(step.phase)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSweepX(0)
    setActiveRectIds([])
    setAreaSoFar(0)
    setProcessedEventIdx(-1)
    setDescription('扫描线可视化 - 点击「开始扫描」观看算法执行过程')
    setSteps([])
    setCurrentStep(0)
    setPhase('ready')
  }

  const getRectColor = (r: Rectangle): string => {
    if (activeRectIds.includes(r.id)) return RECT_COLORS[(r.id - 1) % RECT_COLORS.length]
    return '#64748b'
  }

  const getRectOpacity = (r: Rectangle): number => {
    if (phase === 'ready') return 0.5
    if (activeRectIds.includes(r.id)) return 0.6
    if (phase === 'done') return 0.3
    // Check if rect has been seen (its left edge is <= sweepX)
    if (r.x1 <= sweepX) return 0.2
    return 0.4
  }

  const eventPositions = steps.length > 0 ? steps[0].events : []

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始扫描
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying}>
          单步执行
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume}
          disabled={steps.length === 0 || currentStep >= steps.length}>
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

      <div className="viz-canvas">
        <svg width={CANVAS_W} height={CANVAS_H} style={{ background: 'var(--bg-card)', borderRadius: '8px' }}>
          {/* Grid */}
          {Array.from({ length: 10 }, (_, i) => (
            <g key={`grid-${i}`}>
              <line x1={0} y1={i * (CANVAS_H / 10)} x2={CANVAS_W} y2={i * (CANVAS_H / 10)}
                stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
              <line x1={i * (CANVAS_W / 10)} y1={0} x2={i * (CANVAS_W / 10)} y2={CANVAS_H}
                stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
            </g>
          ))}

          {/* Rectangles */}
          {rects.map(r => (
            <g key={`rect-${r.id}`}>
              <rect
                x={r.x1}
                y={r.y1}
                width={r.x2 - r.x1}
                height={r.y2 - r.y1}
                fill={getRectColor(r)}
                fillOpacity={getRectOpacity(r)}
                stroke={getRectColor(r)}
                strokeWidth={activeRectIds.includes(r.id) ? 2 : 1}
                strokeOpacity={activeRectIds.includes(r.id) ? 1 : 0.5}
              />
              <text
                x={(r.x1 + r.x2) / 2}
                y={(r.y1 + r.y2) / 2}
                fill="var(--text-primary)"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                opacity={0.8}
              >
                R{r.id}
              </text>
            </g>
          ))}

          {/* Active y-interval highlight */}
          {phase !== 'ready' && activeRectIds.length > 0 && (() => {
            const activeRects = activeRectIds
              .map(id => rects.find(r => r.id === id))
              .filter((r): r is Rectangle => r !== undefined)
            if (activeRects.length === 0) return null
            const minY = Math.min(...activeRects.map(r => r.y1))
            const maxY = Math.max(...activeRects.map(r => r.y2))
            return (
              <rect
                x={sweepX - 2}
                y={minY}
                width={4}
                height={maxY - minY}
                fill="#f59e0b"
                fillOpacity={0.3}
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="3,2"
              />
            )
          })()}

          {/* Event markers */}
          {phase !== 'ready' && eventPositions.map((e, idx) => {
            const isProcessed = idx <= processedEventIdx
            return (
              <g key={`event-${idx}`}>
                <line
                  x1={e.x}
                  y1={e.y1}
                  x2={e.x}
                  y2={e.y2}
                  stroke={e.type === 'enter' ? '#22c55e' : '#ef4444'}
                  strokeWidth={2}
                  strokeDasharray={isProcessed ? 'none' : '4,3'}
                  opacity={isProcessed ? 0.6 : 0.3}
                />
                {isProcessed && (
                  <text
                    x={e.x}
                    y={e.y1 - 5}
                    fill={e.type === 'enter' ? '#22c55e' : '#ef4444'}
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {e.type === 'enter' ? '入' : '出'}
                  </text>
                )}
              </g>
            )
          })}

          {/* Sweep line */}
          {phase !== 'ready' && (
            <line
              x1={sweepX}
              y1={0}
              x2={sweepX}
              y2={CANVAS_H}
              stroke="#ef4444"
              strokeWidth={2}
              opacity={0.8}
            />
          )}

          {/* Sweep line label */}
          {phase !== 'ready' && (
            <text
              x={sweepX}
              y={15}
              fill="#ef4444"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              x={sweepX.toFixed(0)}
            </text>
          )}

          {/* Axis labels */}
          <text x={CANVAS_W - 5} y={CANVAS_H - 5} fill="var(--text-secondary)" fontSize="10" textAnchor="end">x</text>
          <text x={5} y={10} fill="var(--text-secondary)" fontSize="10">y</text>
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <span><strong>图例：</strong></span>
        <span>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: '#ef4444', marginRight: 4, verticalAlign: 'middle' }} />
          扫描线
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', opacity: 0.6, marginRight: 4, verticalAlign: 'middle' }} />
          进入事件
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', opacity: 0.6, marginRight: 4, verticalAlign: 'middle' }} />
          离开事件
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', opacity: 0.6, marginRight: 4, verticalAlign: 'middle' }} />
          活跃区间
        </span>
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>状态：</strong>
        活跃矩形: {activeRectIds.length > 0 ? activeRectIds.map(id => `R${id}`).join(', ') : '无'}
        {' | '}
        <strong>累计面积:</strong> {areaSoFar}
      </div>

      {phase === 'done' && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>算法完成：</strong>
          矩形面积并 = {areaSoFar}
        </div>
      )}
    </div>
  )
}
