import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

const INF = Infinity
const NODE_NAMES = ['A', 'B', 'C', 'D', 'E']

interface Edge {
  u: number
  v: number
  w: number
}

interface NodePos {
  x: number
  y: number
}

const NODE_POSITIONS: NodePos[] = [
  { x: 100, y: 80 },   // A
  { x: 280, y: 40 },   // B
  { x: 420, y: 80 },   // C
  { x: 100, y: 220 },  // D
  { x: 280, y: 220 },  // E
]

const EDGES: Edge[] = [
  { u: 0, v: 1, w: 6 },   // A -> B
  { u: 0, v: 3, w: -2 },  // A -> D
  { u: 1, v: 2, w: 4 },   // B -> C
  { u: 3, v: 4, w: 5 },   // D -> E
  { u: 4, v: 2, w: -1 },  // E -> C
  { u: 4, v: 1, w: 3 },   // E -> B
]

interface BellmanStep {
  round: number
  edgeIdx: number
  u: number
  v: number
  w: number
  dist: number[]
  prev: number[]
  updated: boolean
  oldValue: number
  newValue: number
  description: string
  isNegativeCycleCheck: boolean
}

const COLORS = {
  nodeDefault: '#3B82F6',
  nodeSource: '#10B981',
  nodeHighlight: '#F59E0B',
  nodeUpdated: '#22C55E',
  nodeNegativeCycle: '#EF4444',
  edgeDefault: '#6B7280',
  edgeHighlight: '#F59E0B',
  edgeUpdated: '#22C55E',
  edgeNegative: '#EF4444',
  edgeNegativeCycle: '#DC2626',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textUpdated: '#059669',
  textInfinity: '#9CA3AF',
  textNegative: '#EF4444',
  background: '#F9FAFB',
  border: '#D1D5DB',
  btnPrimary: '#3B82F6',
  btnSecondary: '#6B7280',
  btnDanger: '#EF4444',
  distBg: '#FFFFFF',
  distHighlight: '#FEF3C7',
  distUpdated: '#BBF7D0',
  distNegative: '#FEE2E2',
}

function generateSteps(): BellmanStep[] {
  const steps: BellmanStep[] = []
  const V = NODE_NAMES.length
  const dist = new Array(V).fill(INF)
  const prev = new Array(V).fill(-1)
  dist[0] = 0  // 源点 A

  // 记录初始状态
  steps.push({
    round: 0,
    edgeIdx: -1,
    u: -1,
    v: -1,
    w: 0,
    dist: [...dist],
    prev: [...prev],
    updated: false,
    oldValue: 0,
    newValue: 0,
    description: '初始化: 源点 A 的距离设为 0，其他顶点设为 ∞',
    isNegativeCycleCheck: false,
  })

  // V-1 轮松弛
  for (let round = 0; round < V - 1; round++) {
    for (let i = 0; i < EDGES.length; i++) {
      const { u, v, w } = EDGES[i]
      const oldValue = dist[v]
      let newValue = oldValue
      let updated = false

      if (dist[u] !== INF && dist[u] + w < dist[v]) {
        newValue = dist[u] + w
        dist[v] = newValue
        prev[v] = u
        updated = true
      }

      steps.push({
        round: round + 1,
        edgeIdx: i,
        u, v, w,
        dist: [...dist],
        prev: [...prev],
        updated,
        oldValue,
        newValue,
        description: updated
          ? `第${round + 1}轮: 边 ${NODE_NAMES[u]}→${NODE_NAMES[v]}(${w}) 松弛成功, dist[${NODE_NAMES[v]}] = ${oldValue === INF ? '∞' : oldValue} → ${newValue}`
          : `第${round + 1}轮: 边 ${NODE_NAMES[u]}→${NODE_NAMES[v]}(${w}) 不更新`,
        isNegativeCycleCheck: false,
      })
    }
  }

  // 第 V 轮：负权环检测
  for (let i = 0; i < EDGES.length; i++) {
    const { u, v, w } = EDGES[i]
    const canRelax = dist[u] !== INF && dist[u] + w < dist[v]

    steps.push({
      round: V,
      edgeIdx: i,
      u, v, w,
      dist: [...dist],
      prev: [...prev],
      updated: canRelax,
      oldValue: dist[v],
      newValue: canRelax ? dist[u] + w : dist[v],
      description: canRelax
        ? `负权环检测: 边 ${NODE_NAMES[u]}→${NODE_NAMES[v]}(${w}) 仍可松弛! 存在负权环!`
        : `负权环检测: 边 ${NODE_NAMES[u]}→${NODE_NAMES[v]}(${w}) 正常`,
      isNegativeCycleCheck: true,
    })
  }

  return steps
}

export default function BellmanFordVisualization() {
  const steps = useMemo(() => generateSteps(), [])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null
  const dist = step ? step.dist : new Array(NODE_NAMES.length).fill(INF)
  const prevArr = step ? step.prev : new Array(NODE_NAMES.length).fill(-1)

  // 负权环检测结果
  const hasNegativeCycle = useMemo(() => {
    const lastRoundSteps = steps.filter(s => s.isNegativeCycleCheck)
    return lastRoundSteps.some(s => s.updated)
  }, [steps])

  // 自动播放
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = window.setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, speed)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps.length, speed])

  const handlePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(-1)
    }
    setIsPlaying(true)
  }, [currentStep, steps.length])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(-1)
  }, [])

  const handleStepForward = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps.length])

  const handleStepBackward = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const getEdgeColor = (edgeIdx: number): string => {
    if (!step) return COLORS.edgeDefault
    if (step.edgeIdx === edgeIdx) {
      if (step.isNegativeCycleCheck && step.updated) return COLORS.edgeNegativeCycle
      if (step.updated) return COLORS.edgeUpdated
      return COLORS.edgeHighlight
    }
    return COLORS.edgeDefault
  }

  const getEdgeWidth = (edgeIdx: number): number => {
    if (!step) return 2
    return step.edgeIdx === edgeIdx ? 3.5 : 2
  }

  const getNodeColor = (idx: number): string => {
    if (!step) return idx === 0 ? COLORS.nodeSource : COLORS.nodeDefault
    if (step.isNegativeCycleCheck && step.updated && (step.u === idx || step.v === idx)) {
      return COLORS.nodeNegativeCycle
    }
    if (step.updated && step.v === idx) return COLORS.nodeUpdated
    if (step.u === idx || step.v === idx) return COLORS.nodeHighlight
    return idx === 0 ? COLORS.nodeSource : COLORS.nodeDefault
  }

  const getPathToNode = (target: number): number[] => {
    if (target === 0) return [0]
    if (prevArr[target] === -1) return [target]
    const path: number[] = [target]
    let current = target
    while (current !== 0 && prevArr[current] !== -1) {
      current = prevArr[current]
      path.unshift(current)
    }
    if (current !== 0) return [target]
    return path
  }

  const renderGraph = () => {
    const svgWidth = 520
    const svgHeight = 300

    const getEdgePath = (edge: Edge): { x1: number; y1: number; x2: number; y2: number; midX: number; midY: number } => {
      const from = NODE_POSITIONS[edge.u]
      const to = NODE_POSITIONS[edge.v]
      const dx = to.x - from.x
      const dy = to.y - from.y
      const len = Math.sqrt(dx * dx + dy * dy)
      const nodeRadius = 22

      // Offset for arrow tip
      const x1 = from.x + (dx / len) * nodeRadius
      const y1 = from.y + (dy / len) * nodeRadius
      const x2 = to.x - (dx / len) * (nodeRadius + 6)
      const y2 = to.y - (dy / len) * (nodeRadius + 6)

      // Curved edge offset for bidirectional edges
      const edgeIdx = EDGES.indexOf(edge)
      const hasReverse = EDGES.some((e, i) => i !== edgeIdx && e.u === edge.v && e.v === edge.u)
      const curveOffset = hasReverse ? 20 : 0
      const nx = -dy / len
      const ny = dx / len

      return {
        x1: x1 + nx * curveOffset,
        y1: y1 + ny * curveOffset,
        x2: x2 + nx * curveOffset,
        y2: y2 + ny * curveOffset,
        midX: (x1 + x2) / 2 + nx * curveOffset,
        midY: (y1 + y2) / 2 + ny * curveOffset,
      }
    }

    return (
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ maxWidth: '100%' }}>
        <defs>
          <marker
            id="arrowDefault"
            viewBox="0 0 10 6"
            refX="10"
            refY="3"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 3 L 0 6 z" fill={COLORS.edgeDefault} />
          </marker>
          <marker
            id="arrowHighlight"
            viewBox="0 0 10 6"
            refX="10"
            refY="3"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 3 L 0 6 z" fill={COLORS.edgeHighlight} />
          </marker>
          <marker
            id="arrowUpdated"
            viewBox="0 0 10 6"
            refX="10"
            refY="3"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 3 L 0 6 z" fill={COLORS.edgeUpdated} />
          </marker>
          <marker
            id="arrowNegative"
            viewBox="0 0 10 6"
            refX="10"
            refY="3"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 3 L 0 6 z" fill={COLORS.edgeNegativeCycle} />
          </marker>
        </defs>

        {/* Edges */}
        {EDGES.map((edge, idx) => {
          const path = getEdgePath(edge)
          const color = getEdgeColor(idx)
          const width = getEdgeWidth(idx)
          const markerId = color === COLORS.edgeDefault ? 'arrowDefault'
            : color === COLORS.edgeHighlight ? 'arrowHighlight'
            : color === COLORS.edgeUpdated ? 'arrowUpdated'
            : 'arrowNegative'

          return (
            <g key={idx}>
              <line
                x1={path.x1}
                y1={path.y1}
                x2={path.x2}
                y2={path.y2}
                stroke={color}
                strokeWidth={width}
                markerEnd={`url(#${markerId})`}
                style={{ transition: 'all 0.3s ease' }}
              />
              {/* Edge weight label */}
              <text
                x={path.midX}
                y={path.midY - 8}
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill={edge.w < 0 ? COLORS.textNegative : COLORS.textPrimary}
              >
                {edge.w}
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {NODE_POSITIONS.map((pos, idx) => {
          const color = getNodeColor(idx)
          return (
            <g key={idx}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={22}
                fill={color}
                stroke={step?.updated && step.v === idx ? '#000' : 'transparent'}
                strokeWidth={step?.updated && step.v === idx ? 2 : 0}
                style={{ transition: 'all 0.3s ease' }}
              />
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fontWeight="bold"
                fill="white"
              >
                {NODE_NAMES[idx]}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderDistArray = () => {
    return (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {dist.map((d, idx) => {
          const isSource = idx === 0
          const isUpdated = step?.updated && step.v === idx
          const isNegCycle = step?.isNegativeCycleCheck && step.updated && (step.u === idx || step.v === idx)
          const bgColor = isNegCycle ? COLORS.distNegative : isUpdated ? COLORS.distUpdated : isSource ? '#D1FAE5' : COLORS.distBg
          const textColor = d < 0 ? COLORS.textNegative : d === INF ? COLORS.textInfinity : COLORS.textPrimary

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '6px 10px',
                backgroundColor: bgColor,
                borderRadius: '6px',
                border: `1px solid ${COLORS.border}`,
                minWidth: '48px',
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ fontSize: '11px', color: COLORS.textSecondary, fontWeight: 'bold' }}>
                {NODE_NAMES[idx]}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: textColor }}>
                {d === INF ? '∞' : d}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderPath = () => {
    if (!step || step.round === 0) return null

    return (
      <div style={{ fontSize: '12px', color: COLORS.textSecondary, lineHeight: '1.8' }}>
        {NODE_NAMES.map((name, idx) => {
          if (idx === 0) return null
          if (dist[idx] === INF) return <div key={idx}>{NODE_NAMES[0]} → {name}: 不可达</div>
          const path = getPathToNode(idx)
          return (
            <div key={idx}>
              {NODE_NAMES[0]} → {name}: {path.map(i => NODE_NAMES[i]).join(' → ')} ({dist[idx]})
            </div>
          )
        })}
      </div>
    )
  }

  const renderLegend = () => (
    <div style={{ marginTop: '12px' }}>
      <h4 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary, fontSize: '13px' }}>图例</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.nodeSource }} />
          <span>源点</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.nodeHighlight }} />
          <span>当前检查的顶点</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.nodeUpdated }} />
          <span>距离被更新</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.nodeNegativeCycle }} />
          <span>负权环相关</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="viz-canvas" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: COLORS.background,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* 标题 */}
      <div style={{ padding: '10px 15px', borderBottom: `1px solid ${COLORS.border}` }}>
        <h2 style={{ margin: 0, color: COLORS.textPrimary, fontSize: '16px' }}>Bellman-Ford 算法</h2>
        <p style={{ margin: '2px 0 0 0', color: COLORS.textSecondary, fontSize: '12px' }}>
          单源最短路径 · 支持负权边 · 检测负权环
        </p>
      </div>

      {/* 主内容 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 图区域 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '15px',
          overflow: 'auto',
        }}>
          {renderGraph()}

          {/* dist 数组 */}
          <div style={{ marginTop: '15px', width: '100%' }}>
            <h4 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary, fontSize: '13px', textAlign: 'center' }}>
              dist[] 数组 (从源点 A 的最短距离)
            </h4>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {renderDistArray()}
            </div>
          </div>
        </div>

        {/* 信息面板 */}
        <div className="viz-info" style={{
          width: '260px',
          borderLeft: `1px solid ${COLORS.border}`,
          padding: '12px',
          overflowY: 'auto',
          backgroundColor: 'white',
        }}>
          {/* 当前轮次 */}
          <div style={{ marginBottom: '12px' }}>
            <h4 style={{ margin: '0 0 6px 0', color: COLORS.textPrimary, fontSize: '13px' }}>当前轮次</h4>
            <div style={{
              padding: '6px 10px',
              backgroundColor: step?.isNegativeCycleCheck ? '#FEE2E2' : '#DBEAFE',
              borderRadius: '6px',
              fontSize: '13px',
              color: step?.isNegativeCycleCheck ? COLORS.textNegative : COLORS.textPrimary,
              fontWeight: 'bold',
            }}>
              {step ? (step.isNegativeCycleCheck ? `负权环检测 (第${step.round}轮)` : `松弛第${step.round}轮 / ${NODE_NAMES.length - 1}轮`) : '就绪'}
            </div>
          </div>

          {/* 当前操作 */}
          {step && (
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ margin: '0 0 6px 0', color: COLORS.textPrimary, fontSize: '13px' }}>当前操作</h4>
              <div style={{
                padding: '6px 10px',
                backgroundColor: step.updated ? '#D1FAE5' : '#F3F4F6',
                borderRadius: '6px',
                fontSize: '12px',
                lineHeight: '1.5',
                color: COLORS.textPrimary,
              }}>
                {step.description}
              </div>
            </div>
          )}

          {/* 当前检查的边 */}
          {step && step.u >= 0 && (
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ margin: '0 0 6px 0', color: COLORS.textPrimary, fontSize: '13px' }}>检查的边</h4>
              <div style={{
                padding: '6px 10px',
                backgroundColor: '#FEF3C7',
                borderRadius: '6px',
                fontSize: '13px',
                textAlign: 'center',
              }}>
                <span style={{ color: COLORS.nodeSource, fontWeight: 'bold' }}>{NODE_NAMES[step.u]}</span>
                {' → '}
                <span style={{ color: step.updated ? COLORS.nodeUpdated : COLORS.nodeDefault, fontWeight: 'bold' }}>{NODE_NAMES[step.v]}</span>
                <span style={{ color: step.w < 0 ? COLORS.textNegative : COLORS.textPrimary, fontWeight: 'bold' }}>
                  {' '}({step.w})
                </span>
                {step.updated && (
                  <div style={{ marginTop: '4px', fontSize: '12px', color: COLORS.textUpdated }}>
                    {step.oldValue === INF ? '∞' : step.oldValue} → {step.newValue}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 负权环检测结果 */}
          {step?.isNegativeCycleCheck && step.round === NODE_NAMES.length && step.edgeIdx === EDGES.length - 1 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                padding: '8px 10px',
                backgroundColor: hasNegativeCycle ? '#FEE2E2' : '#D1FAE5',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 'bold',
                color: hasNegativeCycle ? COLORS.textNegative : COLORS.textUpdated,
                textAlign: 'center',
              }}>
                {hasNegativeCycle ? '检测到负权环!' : '不存在负权环'}
              </div>
            </div>
          )}

          {/* 最短路径 */}
          {step && step.round > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ margin: '0 0 6px 0', color: COLORS.textPrimary, fontSize: '13px' }}>当前最短路径</h4>
              {renderPath()}
            </div>
          )}

          {/* 算法统计 */}
          <div style={{ marginBottom: '12px' }}>
            <h4 style={{ margin: '0 0 6px 0', color: COLORS.textPrimary, fontSize: '13px' }}>算法信息</h4>
            <div style={{ fontSize: '12px', color: COLORS.textSecondary, lineHeight: '1.8' }}>
              <div>顶点数: {NODE_NAMES.length}</div>
              <div>边数: {EDGES.length}</div>
              <div>当前步骤: {currentStep + 1} / {steps.length}</div>
              <div>时间复杂度: O(VE) = O({NODE_NAMES.length}×{EDGES.length}) = O({NODE_NAMES.length * EDGES.length})</div>
            </div>
          </div>

          {renderLegend()}
        </div>
      </div>

      {/* 控制栏 */}
      <div className="viz-controls" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 15px',
        borderTop: `1px solid ${COLORS.border}`,
        backgroundColor: 'white',
      }}>
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={currentStep < 0}
          style={{
            padding: '5px 12px',
            backgroundColor: currentStep < 0 ? '#E5E7EB' : COLORS.btnSecondary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep < 0 ? 'not-allowed' : 'pointer',
            fontSize: '12px',
          }}
        >
          重置
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepBackward}
          disabled={currentStep <= 0}
          style={{
            padding: '5px 12px',
            backgroundColor: currentStep <= 0 ? '#E5E7EB' : COLORS.btnSecondary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep <= 0 ? 'not-allowed' : 'pointer',
            fontSize: '12px',
          }}
        >
          上一步
        </button>
        <button
          className="btn btn-primary"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={steps.length === 0}
          style={{
            padding: '5px 18px',
            backgroundColor: isPlaying ? COLORS.btnDanger : COLORS.btnPrimary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: steps.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepForward}
          disabled={currentStep >= steps.length - 1}
          style={{
            padding: '5px 12px',
            backgroundColor: currentStep >= steps.length - 1 ? '#E5E7EB' : COLORS.btnSecondary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep >= steps.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '12px',
          }}
        >
          下一步
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
          <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>速度:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{
              padding: '3px 6px',
              borderRadius: '4px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '12px',
            }}
          >
            <option value={2000}>慢速</option>
            <option value={800}>正常</option>
            <option value={400}>快速</option>
            <option value={150}>极快</option>
          </select>
        </div>
        <div style={{ marginLeft: '12px', fontSize: '12px', color: COLORS.textSecondary }}>
          步骤: {Math.max(0, currentStep + 1)} / {steps.length}
        </div>
      </div>
    </div>
  )
}
