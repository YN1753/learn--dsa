import { useState, useEffect, useRef, useCallback } from 'react'

interface Transition {
  from: number
  to: number
  prob: number
}

interface VizState {
  nodes: { id: number; label: string; ev: number; computed: boolean; computing: boolean }[]
  edges: Transition[]
  currentStep: number
  totalSteps: number
  phase: 'init' | 'computing' | 'done'
  description: string
  highlightedNode: number | null
  highlightedEdges: { from: number; to: number }[]
}

const SPEED_MIN = 100
const SPEED_MAX = 2000
const SPEED_DEFAULT = 700

function buildDiceGameSteps(boardSize: number, diceSize: number): VizState[] {
  const steps: VizState[] = []
  const n = boardSize

  // Build nodes: 0..n (n is terminal)
  const nodes: VizState['nodes'] = []
  for (let i = 0; i <= n; i++) {
    nodes.push({
      id: i,
      label: i === n ? '终点' : `${i}`,
      ev: 0,
      computed: i === n,
      computing: false,
    })
  }

  // Build edges: from i, dice d (1..diceSize), to min(i+d, n)
  const edges: Transition[] = []
  for (let i = 0; i < n; i++) {
    const targets = new Map<number, number>()
    for (let d = 1; d <= diceSize; d++) {
      const to = Math.min(i + d, n)
      targets.set(to, (targets.get(to) || 0) + 1 / diceSize)
    }
    for (const [to, prob] of targets) {
      edges.push({ from: i, to, prob })
    }
  }

  // Initial state
  steps.push({
    nodes: nodes.map(n => ({ ...n })),
    edges,
    currentStep: 0,
    totalSteps: n,
    phase: 'init',
    description: `初始化：${boardSize} 格棋盘，掷 ${diceSize} 面骰子。dp[${n}] = 0（终点期望为 0）`,
    highlightedNode: n,
    highlightedEdges: [],
  })

  // Compute dp backward
  const dp = new Array(n + diceSize + 1).fill(0)

  for (let i = n - 1; i >= 0; i--) {
    let sum = 0
    const usedEdges: { from: number; to: number }[] = []
    for (let d = 1; d <= diceSize; d++) {
      sum += dp[i + d]
      const to = Math.min(i + d, n)
      usedEdges.push({ from: i, to })
    }
    dp[i] = 1 + sum / diceSize

    nodes[i] = { ...nodes[i], ev: dp[i], computed: true, computing: true }

    // Highlight the edges being used
    const uniqueEdges: { from: number; to: number }[] = []
    const seen = new Set<string>()
    for (const e of usedEdges) {
      const key = `${e.from}-${e.to}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueEdges.push(e)
      }
    }

    const terms: string[] = []
    for (let d = 1; d <= diceSize; d++) {
      terms.push(`dp[${Math.min(i + d, n)}]=${dp[Math.min(i + d, n)].toFixed(2)}`)
    }

    steps.push({
      nodes: nodes.map(n => ({ ...n })),
      edges,
      currentStep: n - i,
      totalSteps: n,
      phase: 'computing',
      description: `计算 dp[${i}] = 1 + (${terms.join(' + ')}) / ${diceSize} = ${dp[i].toFixed(4)}`,
      highlightedNode: i,
      highlightedEdges: uniqueEdges,
    })

    nodes[i] = { ...nodes[i], computing: false }
  }

  // Final state
  steps.push({
    nodes: nodes.map(n => ({ ...n })),
    edges,
    currentStep: n,
    totalSteps: n,
    phase: 'done',
    description: `计算完成！从位置 0 到终点的期望掷骰次数 = ${dp[0].toFixed(4)}`,
    highlightedNode: 0,
    highlightedEdges: [],
  })

  return steps
}

export default function ProbabilityDPVisualization() {
  const [boardSize, setBoardSize] = useState(8)
  const [diceSize, setDiceSize] = useState(4)
  const [steps, setSteps] = useState<VizState[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(SPEED_DEFAULT)
  const timerRef = useRef<number | null>(null)

  const current = steps[currentStep] || null

  const handleGenerate = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const newSteps = buildDiceGameSteps(boardSize, diceSize)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [boardSize, diceSize])

  useEffect(() => {
    handleGenerate()
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStepForward = () => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleStepBack = () => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(0)
  }

  // Layout: nodes arranged in a line
  const nodeSpacing = Math.min(80, 600 / (boardSize + 2))
  const svgWidth = Math.max(500, (boardSize + 1) * nodeSpacing + 120)
  const svgHeight = 320
  const nodeRadius = 20
  const startX = 60
  const nodeY = 140

  const getNodeX = (id: number) => startX + id * nodeSpacing

  const getNodeColor = (node: VizState['nodes'][0]): { fill: string; stroke: string; text: string } => {
    if (current?.highlightedNode === node.id) {
      return { fill: '#3b82f644', stroke: '#3b82f6', text: '#3b82f6' }
    }
    if (node.computing) {
      return { fill: '#f59e0b33', stroke: '#f59e0b', text: '#f59e0b' }
    }
    if (node.computed) {
      return { fill: '#22c55e22', stroke: '#22c55e', text: '#22c55e' }
    }
    return { fill: 'var(--bg-card)', stroke: 'var(--border)', text: 'var(--text-primary)' }
  }

  const isEdgeHighlighted = (from: number, to: number): boolean => {
    return current?.highlightedEdges.some(e => e.from === from && e.to === to) ?? false
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          棋盘长度:
          <input
            type="number"
            min={3}
            max={15}
            value={boardSize}
            onChange={(e) => setBoardSize(Math.max(3, Math.min(15, Number(e.target.value))))}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              width: '60px',
              fontSize: '0.9rem',
            }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          骰子面数:
          <input
            type="number"
            min={2}
            max={6}
            value={diceSize}
            onChange={(e) => setDiceSize(Math.max(2, Math.min(6, Number(e.target.value))))}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              width: '60px',
              fontSize: '0.9rem',
            }}
          />
        </label>
        <button className="btn btn-primary" onClick={handleGenerate}>
          生成
        </button>
        <button className="btn btn-primary" onClick={isPlaying ? handlePause : handlePlay} disabled={steps.length === 0}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={handleStepBack} disabled={currentStep <= 0 || isPlaying}>
          上一步
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={currentStep >= steps.length - 1 || isPlaying}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            value={SPEED_MAX - speed + SPEED_MIN}
            onChange={(e) => setSpeed(SPEED_MAX - Number(e.target.value) + SPEED_MIN)}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      {current && (
        <div className="viz-canvas" style={{ overflowX: 'auto', padding: '1rem' }}>
          <svg width={svgWidth} height={svgHeight}>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
              </marker>
              <marker id="arrow-hl" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
              </marker>
            </defs>

            {/* Edges: draw probability arcs */}
            {current.edges.map((edge, idx) => {
              if (edge.from === edge.to) return null
              const x1 = getNodeX(edge.from) + nodeRadius
              const x2 = getNodeX(edge.to) - nodeRadius
              const midX = (x1 + x2) / 2
              const arcHeight = Math.min(60, Math.abs(edge.to - edge.from) * 6 + 15)
              const highlighted = isEdgeHighlighted(edge.from, edge.to)

              return (
                <g key={`edge-${idx}`}>
                  <path
                    d={`M ${x1} ${nodeY} Q ${midX} ${nodeY - arcHeight} ${x2} ${nodeY}`}
                    fill="none"
                    stroke={highlighted ? '#3b82f6' : 'var(--border)'}
                    strokeWidth={highlighted ? 2.5 : 1}
                    strokeDasharray={highlighted ? '' : '4,3'}
                    markerEnd={highlighted ? 'url(#arrow-hl)' : 'url(#arrow)'}
                    opacity={highlighted ? 1 : 0.4}
                  />
                  <text
                    x={midX}
                    y={nodeY - arcHeight - 4}
                    fill={highlighted ? '#3b82f6' : 'var(--text-secondary)'}
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                    fontWeight={highlighted ? 'bold' : 'normal'}
                  >
                    {edge.prob.toFixed(2)}
                  </text>
                </g>
              )
            })}

            {/* Nodes */}
            {current.nodes.map((node) => {
              const x = getNodeX(node.id)
              const colors = getNodeColor(node)

              return (
                <g key={`node-${node.id}`}>
                  <circle
                    cx={x}
                    cy={nodeY}
                    r={nodeRadius}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={2}
                  />
                  <text
                    x={x}
                    y={nodeY + 1}
                    fill={colors.text}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {node.label}
                  </text>

                  {/* Expected value below node */}
                  {node.computed && (
                    <text
                      x={x}
                      y={nodeY + nodeRadius + 16}
                      fill={node.computing ? '#f59e0b' : '#22c55e'}
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      {node.ev.toFixed(2)}
                    </text>
                  )}

                  {/* Label below expected value */}
                  {node.computed && (
                    <text
                      x={x}
                      y={nodeY + nodeRadius + 30}
                      fill="var(--text-secondary)"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      期望
                    </text>
                  )}
                </g>
              )
            })}

            {/* Step counter */}
            <text
              x={svgWidth - 10}
              y={20}
              fill="var(--text-secondary)"
              fontSize="12"
              textAnchor="end"
              fontFamily="Consolas, Monaco, monospace"
            >
              Step {currentStep + 1}/{steps.length}
            </text>

            {/* Direction label */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 10}
              fill="var(--text-secondary)"
              fontSize="11"
              textAnchor="middle"
              fontFamily="Consolas, Monaco, monospace"
            >
              逆向DP：从终点向起点逐步计算期望值
            </text>
          </svg>
        </div>
      )}

      <div className="viz-info">
        <strong>状态：</strong> {current?.description || '请设置参数后点击「生成」'}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '0.8rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前正在计算
        </span>
        <span style={{ marginLeft: '0.8rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          已计算完成
        </span>
        <span style={{ marginLeft: '0.8rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          正在计算
        </span>
        <span style={{ marginLeft: '0.8rem' }}>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: '#3b82f6', marginRight: 4, verticalAlign: 'middle' }} />
          活跃转移
        </span>
      </div>

      {current && current.phase === 'done' && (
        <div className="viz-info" style={{ marginTop: '0.5rem' }}>
          <strong>结论：</strong> 从位置 0 出发，掷 {diceSize} 面骰子，到达终点（位置 {boardSize}）的期望掷骰次数为{' '}
          <span style={{ color: '#3b82f6', fontWeight: 'bold', fontFamily: 'Consolas, Monaco, monospace' }}>
            {current.nodes[0]?.ev.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  )
}
