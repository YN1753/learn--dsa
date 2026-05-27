import { useState, useRef, useCallback, useEffect } from 'react'

interface Point {
  x: number
  y: number
}

interface KDNodeData {
  point: Point
  axis: number
  left: KDNodeData | null
  right: KDNodeData | null
  depth: number
  splitMin: number
  splitMax: number
  splitMinY: number
  splitMaxY: number
}

interface AnimationStep {
  description: string
  highlightPoints: number[]
  searchPath: number[]
  pruneNode: boolean
  splitLines: SplitLine[]
  queryPoint: Point | null
  nearestPoint: Point | null
  searchRadius: number
}

interface SplitLine {
  x1: number
  y1: number
  x2: number
  y2: number
  axis: number
}

const INITIAL_POINTS: Point[] = [
  { x: 80, y: 120 },
  { x: 200, y: 80 },
  { x: 150, y: 250 },
  { x: 320, y: 180 },
  { x: 280, y: 300 },
  { x: 400, y: 100 },
  { x: 450, y: 280 },
  { x: 120, y: 350 },
  { x: 350, y: 380 },
  { x: 500, y: 200 },
]

const CANVAS_WIDTH = 580
const CANVAS_HEIGHT = 440

export default function KDTreeVisualization() {
  const [points] = useState<Point[]>(INITIAL_POINTS)
  const [tree, setTree] = useState<KDNodeData | null>(null)
  const [splitLines, setSplitLines] = useState<SplitLine[]>([])
  const [queryPoint, setQueryPoint] = useState<Point | null>(null)
  const [nearestPoint, setNearestPoint] = useState<Point | null>(null)
  const [highlightPoints, setHighlightPoints] = useState<number[]>([])
  const [searchPath, setSearchPath] = useState<number[]>([])
  const [searchRadius, setSearchRadius] = useState(0)
  const [description, setDescription] = useState<string>('K-D树可视化 - 点击「构建K-D树」开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<number | null>(null)

  const getPointIndex = useCallback((p: Point): number => {
    return points.findIndex(pt => pt.x === p.x && pt.y === p.y)
  }, [points])

  const dist = useCallback((a: Point, b: Point): number => {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  }, [])

  const buildTree = useCallback((pts: Point[], depth: number, min: number, max: number, minY: number, maxY: number): { node: KDNodeData | null; lines: SplitLine[] } => {
    if (pts.length === 0) return { node: null, lines: [] }

    const axis = depth % 2
    const sorted = [...pts].sort((a, b) => (axis === 0 ? a.x - b.x : a.y - b.y))
    const mid = Math.floor(sorted.length / 2)
    const medianPoint = sorted[mid]

    const lines: SplitLine[] = []
    if (axis === 0) {
      lines.push({ x1: medianPoint.x, y1: minY, x2: medianPoint.x, y2: maxY, axis: 0 })
    } else {
      lines.push({ x1: min, y1: medianPoint.y, x2: max, y2: medianPoint.y, axis: 1 })
    }

    const leftResult = axis === 0
      ? buildTree(sorted.slice(0, mid), depth + 1, min, medianPoint.x, minY, maxY)
      : buildTree(sorted.slice(0, mid), depth + 1, min, max, minY, medianPoint.y)
    const rightResult = axis === 0
      ? buildTree(sorted.slice(mid + 1), depth + 1, medianPoint.x, max, minY, maxY)
      : buildTree(sorted.slice(mid + 1), depth + 1, min, max, medianPoint.y, maxY)

    return {
      node: {
        point: medianPoint,
        axis,
        left: leftResult.node,
        right: rightResult.node,
        depth,
        splitMin: min,
        splitMax: max,
        splitMinY: minY,
        splitMaxY: maxY,
      },
      lines: [...lines, ...leftResult.lines, ...rightResult.lines],
    }
  }, [])

  const handleBuild = useCallback(() => {
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: '开始构建K-D树，准备对数据点进行空间分割',
      highlightPoints: points.map((_, i) => i),
      searchPath: [],
      pruneNode: false,
      splitLines: [],
      queryPoint: null,
      nearestPoint: null,
      searchRadius: 0,
    })

    const sorted0 = [...points].sort((a, b) => a.x - b.x)
    const mid0 = Math.floor(sorted0.length / 2)
    const rootPoint = sorted0[mid0]
    const rootIdx = getPointIndex(rootPoint)

    animationSteps.push({
      description: `第1层：按X轴排序，选择中位数 (${rootPoint.x}, ${rootPoint.y}) 作为根节点`,
      highlightPoints: [rootIdx],
      searchPath: [],
      pruneNode: false,
      splitLines: [{ x1: rootPoint.x, y1: 0, x2: rootPoint.x, y2: CANVAS_HEIGHT, axis: 0 }],
      queryPoint: null,
      nearestPoint: null,
      searchRadius: 0,
    })

    const leftPoints = sorted0.slice(0, mid0)
    const rightPoints = sorted0.slice(mid0 + 1)

    const leftSorted = [...leftPoints].sort((a, b) => a.y - b.y)
    const rightSorted = [...rightPoints].sort((a, b) => a.y - b.y)

    if (leftSorted.length > 0) {
      const midLeft = Math.floor(leftSorted.length / 2)
      const leftMedian = leftSorted[midLeft]
      const leftIdx = getPointIndex(leftMedian)
      animationSteps.push({
        description: `第2层左子树：按Y轴排序，选择中位数 (${leftMedian.x}, ${leftMedian.y})`,
        highlightPoints: [leftIdx],
        searchPath: [],
        pruneNode: false,
        splitLines: [
          { x1: rootPoint.x, y1: 0, x2: rootPoint.x, y2: CANVAS_HEIGHT, axis: 0 },
          { x1: 0, y1: leftMedian.y, x2: rootPoint.x, y2: leftMedian.y, axis: 1 },
        ],
        queryPoint: null,
        nearestPoint: null,
        searchRadius: 0,
      })
    }

    if (rightSorted.length > 0) {
      const midRight = Math.floor(rightSorted.length / 2)
      const rightMedian = rightSorted[midRight]
      const rightIdx = getPointIndex(rightMedian)
      animationSteps.push({
        description: `第2层右子树：按Y轴排序，选择中位数 (${rightMedian.x}, ${rightMedian.y})`,
        highlightPoints: [rightIdx],
        searchPath: [],
        pruneNode: false,
        splitLines: [
          { x1: rootPoint.x, y1: 0, x2: rootPoint.x, y2: CANVAS_HEIGHT, axis: 0 },
          { x1: 0, y1: leftSorted.length > 0 ? leftSorted[Math.floor(leftSorted.length / 2)].y : 0, x2: rootPoint.x, y2: leftSorted.length > 0 ? leftSorted[Math.floor(leftSorted.length / 2)].y : CANVAS_HEIGHT, axis: 1 },
          { x1: rootPoint.x, y1: rightMedian.y, x2: CANVAS_WIDTH, y2: rightMedian.y, axis: 1 },
        ],
        queryPoint: null,
        nearestPoint: null,
        searchRadius: 0,
      })
    }

    const result = buildTree(points, 0, 0, CANVAS_WIDTH, 0, CANVAS_HEIGHT)
    setTree(result.node)
    setSplitLines(result.lines)

    animationSteps.push({
      description: 'K-D树构建完成！每个区域最多包含一个点。现在可以进行最近邻或范围搜索。',
      highlightPoints: points.map((_, i) => i),
      searchPath: [],
      pruneNode: false,
      splitLines: result.lines,
      queryPoint: null,
      nearestPoint: null,
      searchRadius: 0,
    })

    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [points, buildTree, getPointIndex])

  const nearestSearch = useCallback((node: KDNodeData | null, target: Point, depth: number, best: Point | null): { best: Point; path: number[] } => {
    if (node === null) return { best: best!, path: [] }

    const axis = node.axis
    const currentDist = dist(target, node.point)
    const bestDist = best ? dist(target, best) : Infinity

    let newBest = currentDist < bestDist ? node.point : best!
    const path: number[] = [getPointIndex(node.point)]

    const diff = axis === 0 ? target.x - node.point.x : target.y - node.point.y
    const closeSide = diff < 0 ? node.left : node.right
    const farSide = diff < 0 ? node.right : node.left

    const closeResult = nearestSearch(closeSide, target, depth + 1, newBest)
    newBest = closeResult.best
    path.push(...closeResult.path)

    if (Math.abs(diff) < dist(target, newBest)) {
      const farResult = nearestSearch(farSide, target, depth + 1, newBest)
      newBest = farResult.best
      path.push(...farResult.path)
    }

    return { best: newBest, path }
  }, [dist, getPointIndex])

  const handleNearestSearch = useCallback(() => {
    if (!tree) {
      setDescription('请先构建K-D树')
      return
    }

    const qp: Point = {
      x: 50 + Math.random() * (CANVAS_WIDTH - 100),
      y: 50 + Math.random() * (CANVAS_HEIGHT - 100),
    }
    setQueryPoint(qp)

    const result = nearestSearch(tree, qp, 0, null)
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `开始最近邻搜索，查询点: (${Math.round(qp.x)}, ${Math.round(qp.y)})`,
      highlightPoints: [],
      searchPath: [],
      pruneNode: false,
      splitLines,
      queryPoint: qp,
      nearestPoint: null,
      searchRadius: 0,
    })

    for (let i = 0; i < result.path.length; i++) {
      const pIdx = result.path[i]
      const p = points[pIdx]
      const d = dist(qp, p)
      animationSteps.push({
        description: `访问节点 (${Math.round(p.x)}, ${Math.round(p.y)})，距离: ${d.toFixed(1)}`,
        highlightPoints: [pIdx],
        searchPath: result.path.slice(0, i + 1),
        pruneNode: false,
        splitLines,
        queryPoint: qp,
        nearestPoint: i === result.path.length - 1 ? p : null,
        searchRadius: i === result.path.length - 1 ? d : 0,
      })
    }

    animationSteps.push({
      description: `搜索完成！最近点: (${Math.round(result.best.x)}, ${Math.round(result.best.y)})，距离: ${dist(qp, result.best).toFixed(1)}`,
      highlightPoints: [getPointIndex(result.best)],
      searchPath: result.path,
      pruneNode: false,
      splitLines,
      queryPoint: qp,
      nearestPoint: result.best,
      searchRadius: dist(qp, result.best),
    })

    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [tree, points, splitLines, nearestSearch, dist, getPointIndex])

  const handleRangeSearch = useCallback(() => {
    if (!tree) {
      setDescription('请先构建K-D树')
      return
    }

    const center: Point = {
      x: 100 + Math.random() * (CANVAS_WIDTH - 200),
      y: 100 + Math.random() * (CANVAS_HEIGHT - 200),
    }
    const radius = 80 + Math.random() * 60
    setQueryPoint(center)
    setSearchRadius(radius)

    const inRange: number[] = []
    for (let i = 0; i < points.length; i++) {
      if (dist(center, points[i]) <= radius) {
        inRange.push(i)
      }
    }

    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `开始范围搜索，中心: (${Math.round(center.x)}, ${Math.round(center.y)})，半径: ${Math.round(radius)}`,
      highlightPoints: [],
      searchPath: [],
      pruneNode: false,
      splitLines,
      queryPoint: center,
      nearestPoint: null,
      searchRadius: radius,
    })

    for (let i = 0; i < points.length; i++) {
      const d = dist(center, points[i])
      const isInRange = d <= radius
      animationSteps.push({
        description: isInRange
          ? `检查点 (${Math.round(points[i].x)}, ${Math.round(points[i].y)})，距离 ${d.toFixed(1)} <= ${Math.round(radius)}，在范围内`
          : `检查点 (${Math.round(points[i].x)}, ${Math.round(points[i].y)})，距离 ${d.toFixed(1)} > ${Math.round(radius)}，不在范围内`,
        highlightPoints: isInRange ? [i] : [],
        searchPath: [],
        pruneNode: false,
        splitLines,
        queryPoint: center,
        nearestPoint: null,
        searchRadius: radius,
      })
    }

    animationSteps.push({
      description: `范围搜索完成！找到 ${inRange.length} 个点在半径 ${Math.round(radius)} 范围内`,
      highlightPoints: inRange,
      searchPath: [],
      pruneNode: false,
      splitLines,
      queryPoint: center,
      nearestPoint: null,
      searchRadius: radius,
    })

    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [tree, points, splitLines, dist])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setHighlightPoints(step.highlightPoints)
      setSearchPath(step.searchPath)
      setSplitLines(step.splitLines)
      if (step.queryPoint) setQueryPoint(step.queryPoint)
      if (step.nearestPoint) setNearestPoint(step.nearestPoint)
      setSearchRadius(step.searchRadius)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setTree(null)
    setSplitLines([])
    setQueryPoint(null)
    setNearestPoint(null)
    setHighlightPoints([])
    setSearchPath([])
    setSearchRadius(0)
    setDescription('K-D树已重置')
    setSteps([])
    setCurrentStep(0)
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleBuild} disabled={isPlaying}>
          构建K-D树
        </button>
        <button className="btn btn-primary" onClick={handleNearestSearch} disabled={isPlaying || !tree}>
          最近邻搜索
        </button>
        <button className="btn btn-primary" onClick={handleRangeSearch} disabled={isPlaying || !tree}>
          范围搜索
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

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ background: 'var(--bg-card)', borderRadius: '8px' }}>
          <defs>
            <marker id="arrow-x" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
            </marker>
            <marker id="arrow-y" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
            </marker>
          </defs>

          {/* 分割线 */}
          {splitLines.map((line, i) => (
            <line
              key={`split-${i}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.axis === 0 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(34, 197, 94, 0.4)'}
              strokeWidth="2"
              strokeDasharray="6,4"
            />
          ))}

          {/* 范围搜索的圆 */}
          {searchRadius > 0 && queryPoint && (
            <circle
              cx={queryPoint.x}
              cy={queryPoint.y}
              r={searchRadius}
              fill="rgba(245, 158, 11, 0.1)"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}

          {/* 数据点 */}
          {points.map((p, i) => {
            const isHighlighted = highlightPoints.includes(i)
            const isOnPath = searchPath.includes(i)
            const isNearest = nearestPoint !== null && nearestPoint.x === p.x && nearestPoint.y === p.y
            let fillColor = 'var(--bg-card)'
            let strokeColor = 'var(--border)'
            let r = 6

            if (isNearest) {
              fillColor = '#f59e0b'
              strokeColor = '#d97706'
              r = 9
            } else if (isHighlighted) {
              fillColor = '#3b82f6'
              strokeColor = '#2563eb'
              r = 8
            } else if (isOnPath) {
              fillColor = 'rgba(59, 130, 246, 0.3)'
              strokeColor = '#60a5fa'
            }

            return (
              <g key={`point-${i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted || isNearest ? 2.5 : 1.5}
                />
                <text
                  x={p.x + 10}
                  y={p.y - 10}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  ({Math.round(p.x)},{Math.round(p.y)})
                </text>
              </g>
            )
          })}

          {/* 查询点 */}
          {queryPoint && (
            <g>
              <line
                x1={queryPoint.x - 8}
                y1={queryPoint.y - 8}
                x2={queryPoint.x + 8}
                y2={queryPoint.y + 8}
                stroke="#ef4444"
                strokeWidth="2.5"
              />
              <line
                x1={queryPoint.x + 8}
                y1={queryPoint.y - 8}
                x2={queryPoint.x - 8}
                y2={queryPoint.y + 8}
                stroke="#ef4444"
                strokeWidth="2.5"
              />
              <text
                x={queryPoint.x + 12}
                y={queryPoint.y + 4}
                fill="#ef4444"
                fontSize="11"
                fontWeight="bold"
                fontFamily="Consolas, Monaco, monospace"
              >
                Q
              </text>
            </g>
          )}

          {/* 最近点连线 */}
          {nearestPoint && queryPoint && (
            <line
              x1={queryPoint.x}
              y1={queryPoint.y}
              x2={nearestPoint.x}
              y2={nearestPoint.y}
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="4,3"
            />
          )}

          {/* 搜索路径连线 */}
          {searchPath.length > 1 && searchPath.map((pIdx, i) => {
            if (i === 0) return null
            const prevIdx = searchPath[i - 1]
            const from = points[prevIdx]
            const to = points[pIdx]
            return (
              <line
                key={`path-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="1.5"
              />
            )
          })}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 2, background: 'rgba(59, 130, 246, 0.4)', marginRight: 4, verticalAlign: 'middle' }} />
          X轴分割线
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 2, background: 'rgba(34, 197, 94, 0.4)', marginRight: 4, verticalAlign: 'middle' }} />
          Y轴分割线
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前访问
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          最近点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #ef4444', position: 'relative', marginRight: 4, verticalAlign: 'middle' }}>
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: 8, height: 0, borderTop: '1.5px solid #ef4444' }} />
          </span>
          查询点
        </span>
      </div>
    </div>
  )
}
