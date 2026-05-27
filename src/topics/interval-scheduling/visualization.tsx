import { useState, useEffect, useRef, useCallback } from 'react'

interface Interval {
  id: number
  start: number
  end: number
  label: string
}

type IntervalStatus = 'pending' | 'considering' | 'selected' | 'rejected'

interface AnimationStep {
  description: string
  intervalStatuses: Map<number, IntervalStatus>
  lastEnd: number
  currentId: number | null
  selectedCount: number
}

const INITIAL_INTERVALS: Interval[] = [
  { id: 1, start: 1, end: 4, label: 'A' },
  { id: 2, start: 3, end: 5, label: 'B' },
  { id: 3, start: 0, end: 6, label: 'C' },
  { id: 4, start: 5, end: 7, label: 'D' },
  { id: 5, start: 3, end: 9, label: 'E' },
  { id: 6, start: 5, end: 9, label: 'F' },
  { id: 7, start: 6, end: 10, label: 'G' },
  { id: 8, start: 8, end: 11, label: 'H' },
  { id: 9, start: 8, end: 12, label: 'I' },
  { id: 10, start: 2, end: 14, label: 'J' },
  { id: 11, start: 12, end: 16, label: 'K' },
]

const MAX_TIME = 17

export default function IntervalSchedulingVisualization() {
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [description, setDescription] = useState<string>('区间调度可视化 - 点击「开始」运行贪心算法')
  const [intervalStatuses, setIntervalStatuses] = useState<Map<number, IntervalStatus>>(
    new Map(INITIAL_INTERVALS.map(iv => [iv.id, 'pending' as IntervalStatus]))
  )
  const [lastEnd, setLastEnd] = useState(-1)
  const [currentId, setCurrentId] = useState<number | null>(null)
  const [selectedCount, setSelectedCount] = useState(0)
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((): AnimationStep[] => {
    const intervals = [...INITIAL_INTERVALS].sort((a, b) => a.end - b.end)
    const animationSteps: AnimationStep[] = []

    const statuses = new Map<number, IntervalStatus>()
    for (const iv of INITIAL_INTERVALS) {
      statuses.set(iv.id, 'pending')
    }

    animationSteps.push({
      description: `初始化：将 ${intervals.length} 个区间按结束时间排序`,
      intervalStatuses: new Map(statuses),
      lastEnd: -1,
      currentId: null,
      selectedCount: 0,
    })

    let lastEndTime = -1
    let count = 0

    for (const iv of intervals) {
      // Mark as considering
      statuses.set(iv.id, 'considering')
      animationSteps.push({
        description: `考虑区间 ${iv.label} [${iv.start}, ${iv.end}]：开始时间 ${iv.start} ${iv.start >= lastEndTime ? '>=' : '<'} 上一个结束时间 ${lastEndTime === -1 ? '无' : lastEndTime}`,
        intervalStatuses: new Map(statuses),
        lastEnd: lastEndTime,
        currentId: iv.id,
        selectedCount: count,
      })

      if (iv.start >= lastEndTime) {
        // Select
        statuses.set(iv.id, 'selected')
        lastEndTime = iv.end
        count++
        animationSteps.push({
          description: `选中区间 ${iv.label}！不重叠，更新结束时间为 ${iv.end}，已选 ${count} 个`,
          intervalStatuses: new Map(statuses),
          lastEnd: lastEndTime,
          currentId: iv.id,
          selectedCount: count,
        })
      } else {
        // Reject
        statuses.set(iv.id, 'rejected')
        animationSteps.push({
          description: `跳过区间 ${iv.label}：与已选区间重叠（${iv.start} < ${lastEndTime}）`,
          intervalStatuses: new Map(statuses),
          lastEnd: lastEndTime,
          currentId: iv.id,
          selectedCount: count,
        })
      }
    }

    animationSteps.push({
      description: `算法完成！共选中 ${count} 个不重叠区间`,
      intervalStatuses: new Map(statuses),
      lastEnd: lastEndTime,
      currentId: null,
      selectedCount: count,
    })

    return animationSteps
  }, [])

  const applyStep = useCallback((step: AnimationStep) => {
    setDescription(step.description)
    setIntervalStatuses(new Map(step.intervalStatuses))
    setLastEnd(step.lastEnd)
    setCurrentId(step.currentId)
    setSelectedCount(step.selectedCount)
  }, [])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const allSteps = generateSteps()
    setSteps(allSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    if (allSteps.length > 0) {
      applyStep(allSteps[0])
    }
  }

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      const nextStep = currentStep + 1
      if (nextStep < steps.length) {
        applyStep(steps[nextStep])
        setCurrentStep(nextStep)
      } else {
        setIsPlaying(false)
      }
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed, applyStep])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length - 1) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (steps.length === 0) return
    setIsPlaying(false)
    const nextStep = Math.min(currentStep + 1, steps.length - 1)
    applyStep(steps[nextStep])
    setCurrentStep(nextStep)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setDescription('区间调度可视化 - 点击「开始」运行贪心算法')
    setIntervalStatuses(new Map(INITIAL_INTERVALS.map(iv => [iv.id, 'pending' as IntervalStatus])))
    setLastEnd(-1)
    setCurrentId(null)
    setSelectedCount(0)
  }

  const getStatusColor = (status: IntervalStatus): string => {
    switch (status) {
      case 'considering': return '#3b82f6'
      case 'selected': return '#22c55e'
      case 'rejected': return '#ef4444'
      case 'pending': return '#6b7280'
    }
  }

  const getStatusBg = (status: IntervalStatus): string => {
    switch (status) {
      case 'considering': return 'rgba(59,130,246,0.15)'
      case 'selected': return 'rgba(34,197,94,0.15)'
      case 'rejected': return 'rgba(239,68,68,0.15)'
      case 'pending': return 'rgba(107,114,128,0.08)'
    }
  }

  // Sort intervals by end time for display
  const sortedIntervals = [...INITIAL_INTERVALS].sort((a, b) => a.end - b.end)

  // Timeline dimensions
  const marginLeft = 60
  const marginRight = 30
  const barHeight = 24
  const barGap = 6
  const svgWidth = 680
  const timelineWidth = svgWidth - marginLeft - marginRight
  const scale = timelineWidth / MAX_TIME

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={isPlaying || steps.length === 0}>
          单步
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
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
            max="2500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={svgWidth} height={sortedIntervals.length * (barHeight + barGap) + 60}>
          {/* Time axis */}
          <line
            x1={marginLeft}
            y1={20}
            x2={marginLeft + timelineWidth}
            y2={20}
            stroke="var(--text-secondary)"
            strokeWidth={1}
          />
          {Array.from({ length: MAX_TIME + 1 }, (_, t) => (
            <g key={t}>
              <line
                x1={marginLeft + t * scale}
                y1={15}
                x2={marginLeft + t * scale}
                y2={25}
                stroke="var(--text-secondary)"
                strokeWidth={1}
              />
              <text
                x={marginLeft + t * scale}
                y={12}
                fill="var(--text-secondary)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                {t}
              </text>
            </g>
          ))}

          {/* Last end marker */}
          {lastEnd >= 0 && (
            <line
              x1={marginLeft + lastEnd * scale}
              y1={28}
              x2={marginLeft + lastEnd * scale}
              y2={sortedIntervals.length * (barHeight + barGap) + 45}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4,3"
            />
          )}
          {lastEnd >= 0 && (
            <text
              x={marginLeft + lastEnd * scale}
              y={sortedIntervals.length * (barHeight + barGap) + 55}
              fill="#f59e0b"
              fontSize="10"
              textAnchor="middle"
              fontFamily="Consolas, Monaco, monospace"
            >
              lastEnd={lastEnd}
            </text>
          )}

          {/* Interval bars */}
          {sortedIntervals.map((iv, idx) => {
            const status = intervalStatuses.get(iv.id) ?? 'pending'
            const color = getStatusColor(status)
            const bg = getStatusBg(status)
            const isCurrent = iv.id === currentId
            const y = 35 + idx * (barHeight + barGap)
            const x = marginLeft + iv.start * scale
            const width = (iv.end - iv.start) * scale

            return (
              <g key={iv.id}>
                {/* Background row */}
                <rect
                  x={marginLeft}
                  y={y - 2}
                  width={timelineWidth}
                  height={barHeight + 4}
                  rx={3}
                  fill={isCurrent ? bg : 'transparent'}
                />

                {/* Label */}
                <text
                  x={marginLeft - 8}
                  y={y + barHeight / 2 + 4}
                  fill="var(--text-primary)"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="end"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {iv.label}
                </text>

                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={Math.max(width, 2)}
                  height={barHeight}
                  rx={4}
                  fill={bg}
                  stroke={color}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                />

                {/* Bar fill */}
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={Math.max(width - 2, 1)}
                  height={barHeight - 2}
                  rx={3}
                  fill={status === 'selected' ? 'rgba(34,197,94,0.3)' : status === 'rejected' ? 'rgba(239,68,68,0.2)' : status === 'considering' ? 'rgba(59,130,246,0.25)' : 'rgba(107,114,128,0.1)'}
                />

                {/* Interval text */}
                <text
                  x={x + width / 2}
                  y={y + barHeight / 2 + 4}
                  fill={color}
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  [{iv.start},{iv.end}]
                </text>

                {/* Status icon */}
                {status === 'selected' && (
                  <text
                    x={x + width + 8}
                    y={y + barHeight / 2 + 4}
                    fill="#22c55e"
                    fontSize="14"
                    fontFamily="sans-serif"
                  >
                    ✓
                  </text>
                )}
                {status === 'rejected' && (
                  <text
                    x={x + width + 8}
                    y={y + barHeight / 2 + 4}
                    fill="#ef4444"
                    fontSize="14"
                    fontFamily="sans-serif"
                  >
                    ✗
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Sort order display */}
      <div style={{
        margin: '0.5rem 0',
        padding: '0.5rem 0.75rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
      }}>
        <strong>排序顺序（按结束时间）：</strong>
        <span style={{ marginLeft: '0.5rem', fontFamily: 'Consolas, Monaco, monospace' }}>
          {sortedIntervals.map(iv => {
            const status = intervalStatuses.get(iv.id) ?? 'pending'
            const color = status === 'selected' ? '#22c55e' : status === 'rejected' ? '#ef4444' : status === 'considering' ? '#3b82f6' : 'var(--text-secondary)'
            return (
              <span key={iv.id} style={{ color, margin: '0 0.25rem' }}>
                {iv.label}[{iv.end}]
              </span>
            )
          })}
        </span>
      </div>

      {/* Status panel */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        margin: '0.5rem 0',
        flexWrap: 'wrap',
      }}>
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          <strong>已选中：</strong>
          <span style={{ color: '#22c55e', fontWeight: 'bold', marginLeft: '0.25rem' }}>{selectedCount}</span>
          <span> 个</span>
        </div>
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          <strong>最后结束时间：</strong>
          <span style={{ color: '#f59e0b', fontWeight: 'bold', marginLeft: '0.25rem' }}>
            {lastEnd < 0 ? '无' : lastEnd}
          </span>
        </div>
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          <strong>步骤：</strong>
          <span style={{ fontWeight: 'bold', marginLeft: '0.25rem' }}>
            {steps.length > 0 ? `${currentStep + 1}/${steps.length}` : '-'}
          </span>
        </div>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前考虑
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已选中
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已跳过
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#6b7280', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          未处理
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 2, height: 12, background: '#f59e0b', marginRight: 4, verticalAlign: 'middle' }} />
          最后结束时间
        </span>
      </div>
    </div>
  )
}
