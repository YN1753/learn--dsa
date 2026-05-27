import { useState, useEffect, useRef, useCallback } from 'react'

interface Point {
  x: number
  y: number
  id: number
}

interface AnimationStep {
  description: string
  points: Point[]
  highlightIds: number[]
  highlightType: 'divide' | 'strip' | 'compare' | 'found' | 'none'
  divideX: number | null
  stripLeft: number | null
  stripRight: number | null
  currentPair: [number, number] | null
  bestPair: [number, number] | null
  bestDist: number
  phase: string
}

const INITIAL_POINTS: Point[] = [
  { x: 20, y: 120, id: 1 },
  { x: 60, y: 60, id: 2 },
  { x: 100, y: 180, id: 3 },
  { x: 150, y: 40, id: 4 },
  { x: 200, y: 150, id: 5 },
  { x: 250, y: 80, id: 6 },
  { x: 300, y: 200, id: 7 },
  { x: 350, y: 50, id: 8 },
  { x: 400, y: 160, id: 9 },
  { x: 450, y: 90, id: 10 },
  { x: 180, y: 100, id: 11 },
  { x: 220, y: 110, id: 12 },
]

function euclidean(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function bruteForcePair(points: Point[]): { dist: number; p1: Point; p2: Point } {
  let minDist = Infinity
  let p1 = points[0]
  let p2 = points[1]
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = euclidean(points[i], points[j])
      if (d < minDist) {
        minDist = d
        p1 = points[i]
        p2 = points[j]
      }
    }
  }
  return { dist: minDist, p1, p2 }
}

export default function ClosestPairVisualization() {
  const [points] = useState<Point[]>(INITIAL_POINTS)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [description, setDescription] = useState('最近点对 - 分治法可视化。点击「开始分治」观看算法执行过程')
  const [mode, setMode] = useState<'idle' | 'divide' | 'brute'>('idle')
  const timerRef = useRef<number | null>(null)

  const generateDivideSteps = useCallback(() => {
    const allSteps: AnimationStep[] = []
    const sortedByX = [...points].sort((a, b) => a.x - b.x)

    // Step 1: show all points
    allSteps.push({
      description: '初始状态：平面上有n个点，需要找到距离最近的一对点',
      points: [...points],
      highlightIds: [],
      highlightType: 'none',
      divideX: null,
      stripLeft: null,
      stripRight: null,
      currentPair: null,
      bestPair: null,
      bestDist: Infinity,
      phase: '初始',
    })

    // Step 2: sort by x
    allSteps.push({
      description: '预处理：将所有点按x坐标排序',
      points: sortedByX,
      highlightIds: sortedByX.map(p => p.id),
      highlightType: 'divide',
      divideX: null,
      stripLeft: null,
      stripRight: null,
      currentPair: null,
      bestPair: null,
      bestDist: Infinity,
      phase: '排序',
    })

    // Divide
    const mid = Math.floor(sortedByX.length / 2)
    const midX = (sortedByX[mid - 1].x + sortedByX[mid].x) / 2
    const leftPoints = sortedByX.slice(0, mid)
    const rightPoints = sortedByX.slice(mid)

    allSteps.push({
      description: `分治：从中间（x=${midX.toFixed(0)}）将点集分为左右两半，左半${leftPoints.length}个点，右半${rightPoints.length}个点`,
      points: sortedByX,
      highlightIds: [],
      highlightType: 'divide',
      divideX: midX,
      stripLeft: null,
      stripRight: null,
      currentPair: null,
      bestPair: null,
      bestDist: Infinity,
      phase: '分解',
    })

    // Recursive left
    const leftResult = bruteForcePair(leftPoints)
    allSteps.push({
      description: `递归求解左半部分：最近点对距离 dL = ${leftResult.dist.toFixed(1)}，点对(${leftResult.p1.x},${leftResult.p1.y})和(${leftResult.p2.x},${leftResult.p2.y})`,
      points: sortedByX,
      highlightIds: [leftResult.p1.id, leftResult.p2.id],
      highlightType: 'found',
      divideX: midX,
      stripLeft: null,
      stripRight: null,
      currentPair: [leftResult.p1.id, leftResult.p2.id],
      bestPair: [leftResult.p1.id, leftResult.p2.id],
      bestDist: leftResult.dist,
      phase: '递归左半',
    })

    // Recursive right
    const rightResult = bruteForcePair(rightPoints)
    allSteps.push({
      description: `递归求解右半部分：最近点对距离 dR = ${rightResult.dist.toFixed(1)}，点对(${rightResult.p1.x},${rightResult.p1.y})和(${rightResult.p2.x},${rightResult.p2.y})`,
      points: sortedByX,
      highlightIds: [rightResult.p1.id, rightResult.p2.id],
      highlightType: 'found',
      divideX: midX,
      stripLeft: null,
      stripRight: null,
      currentPair: [rightResult.p1.id, rightResult.p2.id],
      bestPair: leftResult.dist <= rightResult.dist
        ? [leftResult.p1.id, leftResult.p2.id]
        : [rightResult.p1.id, rightResult.p2.id],
      bestDist: Math.min(leftResult.dist, rightResult.dist),
      phase: '递归右半',
    })

    // Take min
    const d = Math.min(leftResult.dist, rightResult.dist)
    const bestLeft = leftResult.dist <= rightResult.dist
    allSteps.push({
      description: `取较小值 d = min(${leftResult.dist.toFixed(1)}, ${rightResult.dist.toFixed(1)}) = ${d.toFixed(1)}，当前最佳点对来自${bestLeft ? '左半' : '右半'}`,
      points: sortedByX,
      highlightIds: bestLeft
        ? [leftResult.p1.id, leftResult.p2.id]
        : [rightResult.p1.id, rightResult.p2.id],
      highlightType: 'found',
      divideX: midX,
      stripLeft: null,
      stripRight: null,
      currentPair: null,
      bestPair: bestLeft
        ? [leftResult.p1.id, leftResult.p2.id]
        : [rightResult.p1.id, rightResult.p2.id],
      bestDist: d,
      phase: '取最小值',
    })

    // Show strip
    const stripLeft = midX - d
    const stripRight = midX + d
    const stripPoints = sortedByX.filter(p => Math.abs(p.x - midX) < d)
    allSteps.push({
      description: `合并步骤：在中线两侧各取宽度d的区域（strip），共${stripPoints.length}个点落入strip区域`,
      points: sortedByX,
      highlightIds: stripPoints.map(p => p.id),
      highlightType: 'strip',
      divideX: midX,
      stripLeft,
      stripRight,
      currentPair: null,
      bestPair: bestLeft
        ? [leftResult.p1.id, leftResult.p2.id]
        : [rightResult.p1.id, rightResult.p2.id],
      bestDist: d,
      phase: 'Strip检查',
    })

    // Check strip pairs
    const sortedStrip = [...stripPoints].sort((a, b) => a.y - b.y)
    let currentBestDist = d
    let currentBestPair: [number, number] = bestLeft
      ? [leftResult.p1.id, leftResult.p2.id]
      : [rightResult.p1.id, rightResult.p2.id]

    for (let i = 0; i < sortedStrip.length; i++) {
      for (let j = i + 1; j < sortedStrip.length && (sortedStrip[j].y - sortedStrip[i].y) < currentBestDist; j++) {
        const dd = euclidean(sortedStrip[i], sortedStrip[j])
        if (dd < currentBestDist) {
          currentBestDist = dd
          currentBestPair = [sortedStrip[i].id, sortedStrip[j].id]
          allSteps.push({
            description: `Strip检查：发现更近的点对(${sortedStrip[i].x},${sortedStrip[i].y})和(${sortedStrip[j].x},${sortedStrip[j].y})，距离=${dd.toFixed(1)}`,
            points: sortedByX,
            highlightIds: [sortedStrip[i].id, sortedStrip[j].id],
            highlightType: 'compare',
            divideX: midX,
            stripLeft,
            stripRight,
            currentPair: [sortedStrip[i].id, sortedStrip[j].id],
            bestPair: [sortedStrip[i].id, sortedStrip[j].id],
            bestDist: dd,
            phase: 'Strip比较',
          })
        } else {
          allSteps.push({
            description: `Strip检查：比较(${sortedStrip[i].x},${sortedStrip[i].y})和(${sortedStrip[j].x},${sortedStrip[j].y})，距离=${dd.toFixed(1)}，不优于当前最优`,
            points: sortedByX,
            highlightIds: [sortedStrip[i].id, sortedStrip[j].id],
            highlightType: 'compare',
            divideX: midX,
            stripLeft,
            stripRight,
            currentPair: [sortedStrip[i].id, sortedStrip[j].id],
            bestPair: currentBestPair,
            bestDist: currentBestDist,
            phase: 'Strip比较',
          })
        }
      }
    }

    // Final result
    const finalBest = bruteForcePair(points)
    allSteps.push({
      description: `算法完成！最近点对：(${finalBest.p1.x},${finalBest.p1.y})和(${finalBest.p2.x},${finalBest.p2.y})，距离=${finalBest.dist.toFixed(1)}`,
      points: sortedByX,
      highlightIds: [finalBest.p1.id, finalBest.p2.id],
      highlightType: 'found',
      divideX: null,
      stripLeft: null,
      stripRight: null,
      currentPair: null,
      bestPair: [finalBest.p1.id, finalBest.p2.id],
      bestDist: finalBest.dist,
      phase: '完成',
    })

    return allSteps
  }, [points])

  const generateBruteSteps = useCallback(() => {
    const allSteps: AnimationStep[] = []

    allSteps.push({
      description: '暴力法：检查所有点对，共C(n,2)种组合',
      points: [...points],
      highlightIds: [],
      highlightType: 'none',
      divideX: null,
      stripLeft: null,
      stripRight: null,
      currentPair: null,
      bestPair: null,
      bestDist: Infinity,
      phase: '暴力法',
    })

    let bestDist = Infinity
    let bestPair: [number, number] | null = null

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = euclidean(points[i], points[j])
        if (d < bestDist) {
          bestDist = d
          bestPair = [points[i].id, points[j].id]
          allSteps.push({
            description: `比较(${points[i].x},${points[i].y})和(${points[j].x},${points[j].y})，距离=${d.toFixed(1)}，更新最优`,
            points: [...points],
            highlightIds: [points[i].id, points[j].id],
            highlightType: 'compare',
            divideX: null,
            stripLeft: null,
            stripRight: null,
            currentPair: [points[i].id, points[j].id],
            bestPair: [points[i].id, points[j].id],
            bestDist: d,
            phase: '暴力比较',
          })
        }
      }
    }

    allSteps.push({
      description: `暴力法完成！最近点对距离=${bestDist.toFixed(1)}`,
      points: [...points],
      highlightIds: bestPair!,
      highlightType: 'found',
      divideX: null,
      stripLeft: null,
      stripRight: null,
      currentPair: null,
      bestPair,
      bestDist,
      phase: '完成',
    })

    return allSteps
  }, [points])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleStartDivide = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const newSteps = generateDivideSteps()
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setMode('divide')
    setDescription(newSteps[0].description)
  }

  const handleStartBrute = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const newSteps = generateBruteSteps()
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setMode('brute')
    setDescription(newSteps[0].description)
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (steps.length === 0) return
    if (isPlaying) setIsPlaying(false)

    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setMode('idle')
    setDescription('最近点对 - 分治法可视化。点击「开始分治」观看算法执行过程')
  }

  const getCurrentStep = (): AnimationStep | null => {
    if (currentStep > 0 && currentStep <= steps.length) {
      return steps[currentStep - 1]
    }
    return null
  }

  const step = getCurrentStep()

  const getPointColor = (point: Point): string => {
    if (!step) return 'var(--accent)'
    if (step.highlightIds.includes(point.id)) {
      if (step.highlightType === 'found') return '#22c55e'
      if (step.highlightType === 'compare') return '#f59e0b'
      if (step.highlightType === 'strip') return '#8b5cf6'
      if (step.highlightType === 'divide') return '#3b82f6'
    }
    return 'var(--text-secondary)'
  }

  const getPointRadius = (point: Point): number => {
    if (!step) return 5
    if (step.highlightIds.includes(point.id)) return 8
    return 5
  }

  const canvasWidth = 500
  const canvasHeight = 260

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStartDivide} disabled={isPlaying}>
          开始分治
        </button>
        <button className="btn btn-primary" onClick={handleStartBrute} disabled={isPlaying}>
          暴力法
        </button>
        <button
          className="btn btn-secondary"
          onClick={handlePauseResume}
          disabled={steps.length === 0 || currentStep >= steps.length}
        >
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepForward}
          disabled={steps.length === 0 || currentStep >= steps.length}
        >
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
      </div>

      <div className="viz-canvas">
        <svg width={canvasWidth} height={canvasHeight} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.3" opacity="0.5" />
            </pattern>
          </defs>
          <rect width={canvasWidth} height={canvasHeight} fill="url(#grid)" />

          {/* Divide line */}
          {step && step.divideX !== null && (
            <line
              x1={step.divideX}
              y1={0}
              x2={step.divideX}
              y2={canvasHeight}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="6,4"
              opacity="0.7"
            />
          )}

          {/* Strip region */}
          {step && step.stripLeft !== null && step.stripRight !== null && (
            <rect
              x={step.stripLeft}
              y={0}
              width={step.stripRight - step.stripLeft}
              height={canvasHeight}
              fill="#8b5cf6"
              opacity="0.1"
              stroke="#8b5cf6"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          )}

          {/* Best pair line */}
          {step && step.bestPair && (
            (() => {
              const p1 = step.points.find(p => p.id === step.bestPair![0])
              const p2 = step.points.find(p => p.id === step.bestPair![1])
              if (!p1 || !p2) return null
              return (
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                  opacity="0.6"
                />
              )
            })()
          )}

          {/* Current pair line */}
          {step && step.currentPair && step.currentPair !== step.bestPair && (
            (() => {
              const p1 = step.points.find(p => p.id === step.currentPair![0])
              const p2 = step.points.find(p => p.id === step.currentPair![1])
              if (!p1 || !p2) return null
              return (
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />
              )
            })()
          )}

          {/* Points */}
          {step ? step.points.map((point) => (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={getPointRadius(point)}
                fill={getPointColor(point)}
                stroke={step.highlightIds.includes(point.id) ? '#fff' : 'none'}
                strokeWidth={step.highlightIds.includes(point.id) ? 2 : 0}
              />
              <text
                x={point.x}
                y={point.y - getPointRadius(point) - 4}
                fill="var(--text-secondary)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                ({point.x},{point.y})
              </text>
            </g>
          )) : points.map((point) => (
            <g key={point.id}>
              <circle cx={point.x} cy={point.y} r={5} fill="var(--accent)" />
              <text
                x={point.x}
                y={point.y - 9}
                fill="var(--text-secondary)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                ({point.x},{point.y})
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      {step && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>阶段：</strong> {step.phase}
          {step.bestDist < Infinity && (
            <span style={{ marginLeft: '1.5rem' }}>
              <strong>当前最优距离：</strong> {step.bestDist.toFixed(1)}
            </span>
          )}
        </div>
      )}

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          分治/排序
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          Strip区域
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          比较中
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          最近点对
        </span>
      </div>

      {mode === 'idle' && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>提示：</strong> 点击「开始分治」观看分治法过程，或「暴力法」对比暴力解法。支持暂停、单步执行和速度调节。
        </div>
      )}
    </div>
  )
}
