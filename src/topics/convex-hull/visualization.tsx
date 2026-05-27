import { useState, useEffect, useRef, useCallback } from 'react'

interface Point {
  x: number
  y: number
}

interface AnimationStep {
  description: string
  points: Point[]
  hull: Point[]
  currentPoint: Point | null
  stack: Point[]
  crossCheck: [Point, Point, Point] | null
  crossResult: number
  phase: 'init' | 'sort' | 'scan' | 'done'
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

function dist2(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2
}

const INITIAL_POINTS: Point[] = [
  { x: 50, y: 280 },
  { x: 120, y: 100 },
  { x: 200, y: 250 },
  { x: 300, y: 80 },
  { x: 380, y: 200 },
  { x: 420, y: 320 },
  { x: 250, y: 350 },
  { x: 150, y: 320 },
  { x: 320, y: 150 },
  { x: 450, y: 120 },
  { x: 100, y: 200 },
  { x: 350, y: 280 },
]

export default function ConvexHullVisualization() {
  const [points, setPoints] = useState<Point[]>(INITIAL_POINTS)
  const [hull, setHull] = useState<Point[]>([])
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [stack, setStack] = useState<Point[]>([])
  const [crossCheck, setCrossCheck] = useState<[Point, Point, Point] | null>(null)
  const [crossResult, setCrossResult] = useState<number>(0)
  const [description, setDescription] = useState<string>('凸包可视化 - 点击「开始 Graham Scan」观看算法执行过程')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [phase, setPhase] = useState<'init' | 'sort' | 'scan' | 'done'>('init')
  const timerRef = useRef<number | null>(null)

  const CANVAS_W = 500
  const CANVAS_H = 400
  const PADDING = 30

  const executeSteps = useCallback((animationSteps: AnimationStep[]) => {
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
      setPoints([...step.points])
      setHull([...step.hull])
      setCurrentPoint(step.currentPoint)
      setStack([...step.stack])
      setCrossCheck(step.crossCheck)
      setCrossResult(step.crossResult)
      setDescription(step.description)
      setPhase(step.phase)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const generateGrahamScanSteps = useCallback(() => {
    const pts = [...INITIAL_POINTS]
    const animationSteps: AnimationStep[] = []

    // Step 1: show initial points
    animationSteps.push({
      description: '初始点集，共 ' + pts.length + ' 个点',
      points: pts,
      hull: [],
      currentPoint: null,
      stack: [],
      crossCheck: null,
      crossResult: 0,
      phase: 'init',
    })

    // Step 2: find base point
    let baseIdx = 0
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].y > pts[baseIdx].y || (pts[i].y === pts[baseIdx].y && pts[i].x < pts[baseIdx].x)) {
        baseIdx = i
      }
    }
    const base = pts[baseIdx]

    animationSteps.push({
      description: `选择基准点 (${base.x.toFixed(0)}, ${base.y.toFixed(0)})：画布中最下方的点`,
      points: pts,
      hull: [],
      currentPoint: base,
      stack: [base],
      crossCheck: null,
      crossResult: 0,
      phase: 'sort',
    })

    // Step 3: sort by polar angle (using screen coords where y increases downward, so max y = lowest)
    const rest = pts.filter((_, i) => i !== baseIdx)
    rest.sort((a, b) => {
      const c = cross(base, a, b)
      if (c !== 0) return c > 0 ? -1 : 1
      return dist2(base, a) - dist2(base, b)
    })

    animationSteps.push({
      description: '按极角排序完成，从基准点出发按逆时针方向依次处理各点',
      points: pts,
      hull: [],
      currentPoint: null,
      stack: [base],
      crossCheck: null,
      crossResult: 0,
      phase: 'sort',
    })

    // Step 4: Graham Scan
    const scanStack: Point[] = [base]
    for (const p of rest) {
      // Show approaching point
      animationSteps.push({
        description: `处理点 (${p.x.toFixed(0)}, ${p.y.toFixed(0)})`,
        points: pts,
        hull: [],
        currentPoint: p,
        stack: [...scanStack],
        crossCheck: null,
        crossResult: 0,
        phase: 'scan',
      })

      while (scanStack.length >= 2) {
        const a = scanStack[scanStack.length - 2]
        const b = scanStack[scanStack.length - 1]
        const c = cross(a, b, p)

        // Show cross product check
        animationSteps.push({
          description: `叉积判定：(${a.x.toFixed(0)},${a.y.toFixed(0)}) -> (${b.x.toFixed(0)},${b.y.toFixed(0)}) -> (${p.x.toFixed(0)},${p.y.toFixed(0)})，叉积 = ${c.toFixed(0)}，${c > 0 ? '左转' : c < 0 ? '右转，弹出栈顶' : '共线，弹出栈顶'}`,
          points: pts,
          hull: [],
          currentPoint: p,
          stack: [...scanStack],
          crossCheck: [a, b, p],
          crossResult: c,
          phase: 'scan',
        })

        if (c <= 0) {
          scanStack.pop()
          animationSteps.push({
            description: `弹出栈顶 (${b.x.toFixed(0)}, ${b.y.toFixed(0)})`,
            points: pts,
            hull: [],
            currentPoint: p,
            stack: [...scanStack],
            crossCheck: null,
            crossResult: 0,
            phase: 'scan',
          })
        } else {
          break
        }
      }

      scanStack.push(p)
      animationSteps.push({
        description: `将 (${p.x.toFixed(0)}, ${p.y.toFixed(0)}) 入栈，栈大小 = ${scanStack.length}`,
        points: pts,
        hull: [...scanStack],
        currentPoint: p,
        stack: [...scanStack],
        crossCheck: null,
        crossResult: 0,
        phase: 'scan',
      })
    }

    // Done
    animationSteps.push({
      description: `Graham Scan 完成！凸包共有 ${scanStack.length} 个顶点`,
      points: pts,
      hull: [...scanStack],
      currentPoint: null,
      stack: [...scanStack],
      crossCheck: null,
      crossResult: 0,
      phase: 'done',
    })

    return animationSteps
  }, [])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setHull([])
    setCurrentPoint(null)
    setStack([])
    setCrossCheck(null)
    setCrossResult(0)
    setPhase('init')
    setCurrentStep(0)

    const animationSteps = generateGrahamScanSteps()
    setPoints(INITIAL_POINTS)
    // Small delay to ensure state reset
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
      const animationSteps = generateGrahamScanSteps()
      setSteps(animationSteps)
      setCurrentStep(0)
      setPoints(INITIAL_POINTS)

      if (animationSteps.length > 0) {
        const step = animationSteps[0]
        setHull(step.hull)
        setCurrentPoint(step.currentPoint)
        setStack(step.stack)
        setCrossCheck(step.crossCheck)
        setCrossResult(step.crossResult)
        setDescription(step.description)
        setPhase(step.phase)
        setCurrentStep(1)
      }
      return
    }

    if (currentStep < steps.length) {
      setIsPlaying(false)
      const step = steps[currentStep]
      setPoints([...step.points])
      setHull([...step.hull])
      setCurrentPoint(step.currentPoint)
      setStack([...step.stack])
      setCrossCheck(step.crossCheck)
      setCrossResult(step.crossResult)
      setDescription(step.description)
      setPhase(step.phase)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setPoints(INITIAL_POINTS)
    setHull([])
    setCurrentPoint(null)
    setStack([])
    setCrossCheck(null)
    setCrossResult(0)
    setDescription('凸包可视化 - 点击「开始 Graham Scan」观看算法执行过程')
    setSteps([])
    setCurrentStep(0)
    setPhase('init')
  }

  const handleRandomPoints = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const newPoints: Point[] = []
    for (let i = 0; i < 12; i++) {
      newPoints.push({
        x: PADDING + Math.random() * (CANVAS_W - 2 * PADDING),
        y: PADDING + Math.random() * (CANVAS_H - 2 * PADDING),
      })
    }
    setPoints(newPoints)
    setHull([])
    setCurrentPoint(null)
    setStack([])
    setCrossCheck(null)
    setCrossResult(0)
    setSteps([])
    setCurrentStep(0)
    setPhase('init')
    setDescription('已生成随机点集，点击「开始 Graham Scan」观看算法执行过程')
  }

  const getPointColor = (p: Point): string => {
    if (currentPoint && p.x === currentPoint.x && p.y === currentPoint.y) return '#f59e0b'
    if (hull.some(h => h.x === p.x && h.y === p.y)) return '#22c55e'
    return '#60a5fa'
  }

  const getPointRadius = (p: Point): number => {
    if (currentPoint && p.x === currentPoint.x && p.y === currentPoint.y) return 7
    if (hull.some(h => h.x === p.x && h.y === p.y)) return 6
    return 5
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始 Graham Scan
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying}>
          单步执行
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume}
          disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleRandomPoints}>
          随机点集
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
          {/* Grid lines */}
          {Array.from({ length: 10 }, (_, i) => (
            <g key={`grid-${i}`}>
              <line x1={0} y1={i * (CANVAS_H / 10)} x2={CANVAS_W} y2={i * (CANVAS_H / 10)}
                stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
              <line x1={i * (CANVAS_W / 10)} y1={0} x2={i * (CANVAS_W / 10)} y2={CANVAS_H}
                stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
            </g>
          ))}

          {/* Cross product triangle visualization */}
          {crossCheck && (
            <g>
              <polygon
                points={`${crossCheck[0].x},${crossCheck[0].y} ${crossCheck[1].x},${crossCheck[1].y} ${crossCheck[2].x},${crossCheck[2].y}`}
                fill={crossResult > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
                stroke={crossResult > 0 ? '#22c55e' : '#ef4444'}
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
            </g>
          )}

          {/* Hull edges */}
          {hull.length >= 2 && (
            <g>
              <polyline
                points={hull.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Completed hull polygon */}
          {phase === 'done' && hull.length >= 3 && (
            <polygon
              points={hull.map(p => `${p.x},${p.y}`).join(' ')}
              fill="rgba(34, 197, 94, 0.1)"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          )}

          {/* Stack connections */}
          {stack.length >= 2 && phase !== 'done' && (
            <g>
              <polyline
                points={stack.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="6,3"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Cross product arrow indicators */}
          {crossCheck && (
            <g>
              <line x1={crossCheck[0].x} y1={crossCheck[0].y}
                x2={crossCheck[1].x} y2={crossCheck[1].y}
                stroke={crossResult > 0 ? '#22c55e' : '#ef4444'}
                strokeWidth="2" markerEnd="url(#arrow-cross)" />
              <line x1={crossCheck[1].x} y1={crossCheck[1].y}
                x2={crossCheck[2].x} y2={crossCheck[2].y}
                stroke={crossResult > 0 ? '#22c55e' : '#ef4444'}
                strokeWidth="2" markerEnd="url(#arrow-cross)" />
            </g>
          )}

          {/* Points */}
          {points.map((p, i) => (
            <g key={`point-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={getPointRadius(p)}
                fill={getPointColor(p)}
                stroke="var(--bg-card)"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.y - 10}
                fill="var(--text-secondary)"
                fontSize="9"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                ({p.x.toFixed(0)},{p.y.toFixed(0)})
              </text>
            </g>
          ))}

          <defs>
            <marker id="arrow-cross" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={crossResult > 0 ? '#22c55e' : '#ef4444'} />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <span><strong>图例：</strong></span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#60a5fa', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          未处理的点
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前处理的点
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          凸包上的点
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: '#22c55e', marginRight: 4, verticalAlign: 'middle' }} />
          凸包边
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: '#f59e0b', marginRight: 4, verticalAlign: 'middle', borderBottom: '2px dashed #f59e0b' }} />
          栈内连接
        </span>
      </div>

      {crossCheck && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>叉积判定：</strong>
          cross(({crossCheck[0].x.toFixed(0)},{crossCheck[0].y.toFixed(0)}),
          ({crossCheck[1].x.toFixed(0)},{crossCheck[1].y.toFixed(0)}),
          ({crossCheck[2].x.toFixed(0)},{crossCheck[2].y.toFixed(0)}))
          = {crossResult.toFixed(0)}
          {crossResult > 0 ? ' > 0 => 左转 (保留)' : crossResult < 0 ? ' < 0 => 右转 (弹出栈顶)' : ' = 0 => 共线 (弹出栈顶)'}
        </div>
      )}

      {phase === 'done' && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>算法完成：</strong>
          凸包共 {hull.length} 个顶点，
          遍历顺序: {hull.map(p => `(${p.x.toFixed(0)},${p.y.toFixed(0)})`).join(' -> ')}
        </div>
      )}
    </div>
  )
}
