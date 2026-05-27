import { useState, useEffect, useRef, useCallback } from 'react'

interface Point {
  x: number
  y: number
}

interface Segment {
  id: number
  p1: Point
  p2: Point
  color: string
}

interface IntersectionResult {
  point: Point
  seg1Id: number
  seg2Id: number
}

interface AnimationStep {
  description: string
  segments: Segment[]
  intersections: IntersectionResult[]
  highlightSegIds: number[]
  crossValues: { d1: number; d2: number; d3: number; d4: number } | null
}

const CANVAS_W = 600
const CANVAS_H = 400

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

function onSegment(p: Point, a: Point, b: Point): boolean {
  const ab = { x: b.x - a.x, y: b.y - a.y }
  const ap = { x: p.x - a.x, y: p.y - a.y }
  const cp = cross(a, b, p)
  if (Math.abs(cp) > 1e-9) return false
  return ap.x * ab.x + ap.y * ab.y >= 0 &&
         ap.x * ab.x + ap.y * ab.y <= ab.x * ab.x + ab.y * ab.y
}

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  const d1 = cross(a, b, c)
  const d2 = cross(a, b, d)
  const d3 = cross(c, d, a)
  const d4 = cross(c, d, b)

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true
  }

  if (Math.abs(d1) < 1e-9 && onSegment(c, a, b)) return true
  if (Math.abs(d2) < 1e-9 && onSegment(d, a, b)) return true
  if (Math.abs(d3) < 1e-9 && onSegment(a, c, d)) return true
  if (Math.abs(d4) < 1e-9 && onSegment(b, c, d)) return true

  return false
}

function lineIntersection(a: Point, b: Point, c: Point, d: Point): Point | null {
  const ab = { x: b.x - a.x, y: b.y - a.y }
  const cd = { x: d.x - c.x, y: d.y - c.y }
  const denom = ab.x * cd.y - ab.y * cd.x
  if (Math.abs(denom) < 1e-9) return null
  const ac = { x: c.x - a.x, y: c.y - a.y }
  const t = (ac.x * cd.y - ac.y * cd.x) / denom
  return { x: a.x + t * ab.x, y: a.y + t * ab.y }
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899']

const DEFAULT_SEGMENTS: Segment[] = [
  { id: 1, p1: { x: 100, y: 100 }, p2: { x: 400, y: 300 }, color: COLORS[0] },
  { id: 2, p1: { x: 100, y: 300 }, p2: { x: 400, y: 100 }, color: COLORS[1] },
]

export default function LineIntersectionVisualization() {
  const [segments, setSegments] = useState<Segment[]>(DEFAULT_SEGMENTS)
  const [intersections, setIntersections] = useState<IntersectionResult[]>([])
  const [description, setDescription] = useState<string>('拖动端点改变线段位置，或点击按钮测试交点')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [crossValues, setCrossValues] = useState<{ d1: number; d2: number; d3: number; d4: number } | null>(null)
  const [highlightSegIds, setHighlightSegIds] = useState<number[]>([])
  const [dragging, setDragging] = useState<{ segId: number; point: 'p1' | 'p2' } | null>(null)
  const timerRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const nextIdRef = useRef(10)

  const findAllIntersections = useCallback((segs: Segment[]): IntersectionResult[] => {
    const results: IntersectionResult[] = []
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 1; j < segs.length; j++) {
        const s1 = segs[i]
        const s2 = segs[j]
        if (segmentsIntersect(s1.p1, s1.p2, s2.p1, s2.p2)) {
          const pt = lineIntersection(s1.p1, s1.p2, s2.p1, s2.p2)
          if (pt) {
            results.push({ point: pt, seg1Id: s1.id, seg2Id: s2.id })
          }
        }
      }
    }
    return results
  }, [])

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
      setSegments([...step.segments])
      setIntersections([...step.intersections])
      setHighlightSegIds([...step.highlightSegIds])
      setCrossValues(step.crossValues)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  // Real-time intersection check when segments change (not during animation)
  useEffect(() => {
    if (isPlaying) return
    const results = findAllIntersections(segments)
    setIntersections(results)
  }, [segments, isPlaying, findAllIntersections])

  const handleTestPair = () => {
    if (segments.length < 2) {
      setDescription('需要至少两条线段')
      return
    }

    const s1 = segments[0]
    const s2 = segments[1]
    const d1 = cross(s1.p1, s1.p2, s2.p1)
    const d2 = cross(s1.p1, s1.p2, s2.p2)
    const d3 = cross(s2.p1, s2.p2, s1.p1)
    const d4 = cross(s2.p1, s2.p2, s1.p2)

    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `测试线段 ${s1.id} 和线段 ${s2.id} 是否相交`,
      segments: [...segments],
      intersections: [],
      highlightSegIds: [s1.id, s2.id],
      crossValues: null,
    })

    animationSteps.push({
      description: `第一步：计算 C、D 相对于 AB 的叉积 -> d1=${d1.toFixed(1)}, d2=${d2.toFixed(1)}`,
      segments: [...segments],
      intersections: [],
      highlightSegIds: [s1.id],
      crossValues: { d1, d2, d3: 0, d4: 0 },
    })

    animationSteps.push({
      description: `第二步：计算 A、B 相对于 CD 的叉积 -> d3=${d3.toFixed(1)}, d4=${d4.toFixed(1)}`,
      segments: [...segments],
      intersections: [],
      highlightSegIds: [s2.id],
      crossValues: { d1, d2, d3, d4 },
    })

    const straddle1 = (d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)
    const straddle2 = (d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0)
    const result = segmentsIntersect(s1.p1, s1.p2, s2.p1, s2.p2)

    if (straddle1 && straddle2) {
      animationSteps.push({
        description: `d1*d2 < 0 且 d3*d4 < 0，两次跨立实验均通过 -> 线段相交！`,
        segments: [...segments],
        intersections: findAllIntersections(segments),
        highlightSegIds: [s1.id, s2.id],
        crossValues: { d1, d2, d3, d4 },
      })
    } else {
      animationSteps.push({
        description: result
          ? `端点共线在线段上，线段相交`
          : `跨立实验未通过 -> 线段不相交`,
        segments: [...segments],
        intersections: result ? findAllIntersections(segments) : [],
        highlightSegIds: [s1.id, s2.id],
        crossValues: { d1, d2, d3, d4 },
      })
    }

    executeSteps(animationSteps)
  }

  const handleFindAll = () => {
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `开始扫描所有 ${segments.length} 条线段的交点...`,
      segments: [...segments],
      intersections: [],
      highlightSegIds: [],
      crossValues: null,
    })

    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const s1 = segments[i]
        const s2 = segments[j]
        const d1 = cross(s1.p1, s1.p2, s2.p1)
        const d2 = cross(s1.p1, s1.p2, s2.p2)
        const d3 = cross(s2.p1, s2.p2, s1.p1)
        const d4 = cross(s2.p1, s2.p2, s1.p2)
        const result = segmentsIntersect(s1.p1, s1.p2, s2.p1, s2.p2)

        animationSteps.push({
          description: `检查线段 ${s1.id} 和 ${s2.id}: d1=${d1.toFixed(1)}, d2=${d2.toFixed(1)}, d3=${d3.toFixed(1)}, d4=${d4.toFixed(1)} -> ${result ? '相交' : '不相交'}`,
          segments: [...segments],
          intersections: result ? [{ point: lineIntersection(s1.p1, s1.p2, s2.p1, s2.p2)!, seg1Id: s1.id, seg2Id: s2.id }] : [],
          highlightSegIds: [s1.id, s2.id],
          crossValues: { d1, d2, d3, d4 },
        })
      }
    }

    const allIntersections = findAllIntersections(segments)
    animationSteps.push({
      description: `扫描完成！共找到 ${allIntersections.length} 个交点`,
      segments: [...segments],
      intersections: allIntersections,
      highlightSegIds: [],
      crossValues: null,
    })

    executeSteps(animationSteps)
  }

  const handleAddSegment = () => {
    const id = nextIdRef.current++
    const color = COLORS[(id - 1) % COLORS.length]
    const newSeg: Segment = {
      id,
      p1: { x: 50 + Math.random() * 200, y: 50 + Math.random() * 150 },
      p2: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 150 },
      color,
    }
    setSegments(prev => [...prev, newSeg])
    setDescription(`添加了线段 ${id}`)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSegments(DEFAULT_SEGMENTS)
    setIntersections([])
    setHighlightSegIds([])
    setCrossValues(null)
    setDescription('已重置')
    setSteps([])
    setCurrentStep(0)
    nextIdRef.current = 10
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const getMousePos = (e: React.MouseEvent<SVGSVGElement>): Point => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    }
  }

  const handleMouseDown = (segId: number, point: 'p1' | 'p2', e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPlaying) return
    setDragging({ segId, point })
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return
    const pos = getMousePos(e)
    setSegments(prev => prev.map(seg => {
      if (seg.id === dragging.segId) {
        return { ...seg, [dragging.point]: pos }
      }
      return seg
    }))
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleTestPair} disabled={isPlaying || segments.length < 2}>
          测试前两条
        </button>
        <button className="btn btn-primary" onClick={handleFindAll} disabled={isPlaying || segments.length < 2}>
          扫描所有交点
        </button>
        <button className="btn btn-primary" onClick={handleAddSegment} disabled={isPlaying}>
          添加线段
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
            min="200"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          style={{ width: '100%', maxWidth: CANVAS_W, height: 'auto', background: 'var(--bg-card)', borderRadius: 8, cursor: dragging ? 'grabbing' : 'default' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid */}
          {Array.from({ length: Math.floor(CANVAS_W / 50) + 1 }).map((_, i) => (
            <line key={`vg${i}`} x1={i * 50} y1={0} x2={i * 50} y2={CANVAS_H} stroke="var(--border)" strokeWidth={0.5} opacity={0.3} />
          ))}
          {Array.from({ length: Math.floor(CANVAS_H / 50) + 1 }).map((_, i) => (
            <line key={`hg${i}`} x1={0} y1={i * 50} x2={CANVAS_W} y2={i * 50} stroke="var(--border)" strokeWidth={0.5} opacity={0.3} />
          ))}

          {/* Segments */}
          {segments.map(seg => {
            const highlighted = highlightSegIds.includes(seg.id)
            return (
              <g key={seg.id}>
                <line
                  x1={seg.p1.x}
                  y1={seg.p1.y}
                  x2={seg.p2.x}
                  y2={seg.p2.y}
                  stroke={seg.color}
                  strokeWidth={highlighted ? 4 : 2.5}
                  strokeLinecap="round"
                  opacity={highlighted ? 1 : 0.8}
                />
                {/* Endpoints */}
                <circle
                  cx={seg.p1.x}
                  cy={seg.p1.y}
                  r={7}
                  fill={seg.color}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: isPlaying ? 'default' : 'grab' }}
                  onMouseDown={(e) => handleMouseDown(seg.id, 'p1', e)}
                />
                <circle
                  cx={seg.p2.x}
                  cy={seg.p2.y}
                  r={7}
                  fill={seg.color}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: isPlaying ? 'default' : 'grab' }}
                  onMouseDown={(e) => handleMouseDown(seg.id, 'p2', e)}
                />
                {/* Label */}
                <text
                  x={(seg.p1.x + seg.p2.x) / 2}
                  y={(seg.p1.y + seg.p2.y) / 2 - 12}
                  fill={seg.color}
                  fontSize={13}
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  S{seg.id}
                </text>
              </g>
            )
          })}

          {/* Intersections */}
          {intersections.map((inter, idx) => (
            <g key={`inter-${idx}`}>
              <circle
                cx={inter.point.x}
                cy={inter.point.y}
                r={6}
                fill="#ef4444"
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                x={inter.point.x + 10}
                y={inter.point.y - 10}
                fill="#ef4444"
                fontSize={11}
                fontFamily="Consolas, Monaco, monospace"
              >
                ({inter.point.x.toFixed(0)}, {inter.point.y.toFixed(0)})
              </text>
            </g>
          ))}
        </svg>
      </div>

      {crossValues && (
        <div className="viz-info" style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.85rem' }}>
          <strong>叉积值：</strong>
          d1={crossValues.d1.toFixed(2)} | d2={crossValues.d2.toFixed(2)} | d3={crossValues.d3.toFixed(2)} | d4={crossValues.d4.toFixed(2)}
        </div>
      )}

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          交点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 20, height: 3, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          线段
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: '#fff', border: '2px solid #3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          可拖动端点
        </span>
      </div>
    </div>
  )
}
