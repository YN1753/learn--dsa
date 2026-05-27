import { useState, useEffect, useRef, useCallback } from 'react'

interface DeBruijnVertex {
  id: string
  label: string
  x: number
  y: number
}

interface DeBruijnEdge {
  id: string
  label: string
  from: string
  to: string
  angle: number
}

interface StepAction {
  type: 'traverse' | 'backtrack' | 'complete'
  edgeId?: string
  edgeLabel?: string
  vertex?: string
  description: string
  usedEdges: Set<string>
  currentVertex: string | null
  sequence: string
  pathEdges: string[]
}

function buildDeBruijnGraph(k: number, n: number) {
  const vertices: DeBruijnVertex[] = []
  const edges: DeBruijnEdge[] = []
  const numVertices = Math.pow(k, n - 1)

  const cx = 280
  const cy = 220
  const radius = 130

  for (let i = 0; i < numVertices; i++) {
    const label = i.toString(k).padStart(n - 1, '0')
    const angle = (2 * Math.PI * i) / numVertices - Math.PI / 2
    vertices.push({
      id: label,
      label,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    })
  }

  let edgeIdx = 0
  for (let i = 0; i < numVertices; i++) {
    const fromLabel = i.toString(k).padStart(n - 1, '0')
    for (let d = 0; d < k; d++) {
      const toIdx = (i * k + d) % numVertices
      const toLabel = toIdx.toString(k).padStart(n - 1, '0')
      const edgeLabel = fromLabel + d.toString()
      const isSelfLoop = fromLabel === toLabel
      const baseAngle = isSelfLoop
        ? (2 * Math.PI * i) / numVertices - Math.PI / 2
        : Math.atan2(
            vertices.find(v => v.id === toLabel)!.y - vertices.find(v => v.id === fromLabel)!.y,
            vertices.find(v => v.id === toLabel)!.x - vertices.find(v => v.id === fromLabel)!.x
          )
      edges.push({
        id: `e${edgeIdx}`,
        label: edgeLabel,
        from: fromLabel,
        to: toLabel,
        angle: baseAngle + (isSelfLoop ? -0.4 + d * 0.8 : d * 0.15),
      })
      edgeIdx++
    }
  }

  return { vertices, edges }
}

function generateSteps(k: number, n: number): StepAction[] {
  const kPow = Math.pow(k, n - 1)
  const edgesUsed: number[] = new Array(kPow).fill(0)
  const steps: StepAction[] = []
  const usedEdgeIds = new Set<string>()
  const pathEdges: string[] = []
  const sequence: string[] = []

  const edgeList: { from: number; to: number; label: string; id: string }[] = []
  for (let i = 0; i < kPow; i++) {
    for (let d = 0; d < k; d++) {
      const to = (i * k + d) % kPow
      const fromLabel = i.toString(k).padStart(n - 1, '0')
      const edgeLabel = fromLabel + d.toString()
      edgeList.push({ from: i, to, label: edgeLabel, id: `e${i * k + d}` })
    }
  }

  function getEdgeId(from: number, d: number): string {
    return `e${from * k + d}`
  }

  steps.push({
    type: 'traverse',
    vertex: '0'.repeat(n - 1),
    description: `从顶点 ${'0'.repeat(n - 1)} 开始Hierholzer算法`,
    usedEdges: new Set(usedEdgeIds),
    currentVertex: '0'.repeat(n - 1),
    sequence: '',
    pathEdges: [...pathEdges],
  })

  function dfs(node: number): void {
    while (edgesUsed[node] < k) {
      const d = edgesUsed[node]
      edgesUsed[node]++
      const edgeId = getEdgeId(node, d)
      const edgeLabel = edgeList[node * k + d].label
      const fromLabel = node.toString(k).padStart(n - 1, '0')
      const toNode = (node * k + d) % kPow
      const toLabel = toNode.toString(k).padStart(n - 1, '0')

      usedEdgeIds.add(edgeId)
      pathEdges.push(edgeId)

      steps.push({
        type: 'traverse',
        edgeId,
        edgeLabel,
        vertex: toLabel,
        description: `沿边 ${edgeLabel} 从 ${fromLabel} 到 ${toLabel}`,
        usedEdges: new Set(usedEdgeIds),
        currentVertex: toLabel,
        sequence: sequence.join(''),
        pathEdges: [...pathEdges],
      })

      dfs(toNode)

      sequence.push(d.toString())
      pathEdges.pop()

      steps.push({
        type: 'backtrack',
        edgeId,
        edgeLabel: d.toString(),
        description: `回溯，添加边标签 ${d}，当前序列: ${[...sequence].reverse().join('')}...`,
        usedEdges: new Set(usedEdgeIds),
        currentVertex: fromLabel,
        sequence: [...sequence].reverse().join(''),
        pathEdges: [...pathEdges],
      })
    }
  }

  dfs(0)

  const finalSequence = [...sequence].reverse().join('')
  steps.push({
    type: 'complete',
    description: `欧拉回路完成！De Bruijn序列: ${finalSequence} (长度: ${finalSequence.length})`,
    usedEdges: new Set(usedEdgeIds),
    currentVertex: null,
    sequence: finalSequence,
    pathEdges: [],
  })

  return steps
}

export default function DeBruijnVisualization() {
  const [k] = useState(2)
  const [n] = useState(3)
  const [steps, setSteps] = useState<StepAction[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const timerRef = useRef<number | null>(null)

  const graph = buildDeBruijnGraph(k, n)

  const handleStart = useCallback(() => {
    const generatedSteps = generateSteps(k, n)
    setSteps(generatedSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setPhase('running')
  }, [k, n])

  const handleStep = useCallback(() => {
    if (steps.length === 0) {
      const generatedSteps = generateSteps(k, n)
      setSteps(generatedSteps)
      setCurrentStep(0)
      setPhase('running')
      return
    }
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }, [steps, currentStep, k, n])

  const handlePauseResume = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }, [isPlaying, steps, currentStep])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setPhase('idle')
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      setPhase('done')
      return
    }
    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, speed)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const step = steps.length > 0 && currentStep < steps.length ? steps[currentStep] : null
  const lastStep = currentStep > 0 ? steps[currentStep - 1] : null
  const displayStep = step || lastStep

  const usedEdges = displayStep?.usedEdges ?? new Set<string>()
  const currentVertex = displayStep?.currentVertex ?? null
  const sequence = displayStep?.sequence ?? ''
  const pathEdges = displayStep?.pathEdges ?? []
  const currentEdgeId = displayStep?.type === 'traverse' && displayStep?.edgeId ? displayStep.edgeId : null

  const getVertexPos = (id: string) => graph.vertices.find(v => v.id === id)

  const getEdgePath = (edge: DeBruijnEdge): { path: string; midX: number; midY: number; angle: number } => {
    const from = getVertexPos(edge.from)!
    const to = getVertexPos(edge.to)!
    const isSelfLoop = edge.from === edge.to

    if (isSelfLoop) {
      const r = 35
      const cx = from.x + r * Math.cos(edge.angle)
      const cy = from.y + r * Math.sin(edge.angle)
      const dr = 30
      const path = `M ${from.x + 12 * Math.cos(edge.angle - 0.3)} ${from.y + 12 * Math.sin(edge.angle - 0.3)} ` +
        `A ${dr} ${dr} 0 1 1 ${from.x + 12 * Math.cos(edge.angle + 0.3)} ${from.y + 12 * Math.sin(edge.angle + 0.3)}`
      return { path, midX: cx, midY: cy - 15, angle: edge.angle }
    }

    const dx = to.x - from.x
    const dy = to.y - from.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const nx = dx / dist
    const ny = dy / dist
    const startX = from.x + nx * 22
    const startY = from.y + ny * 22
    const endX = to.x - nx * 22
    const endY = to.y - ny * 22
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2
    const angle = Math.atan2(dy, dx)

    const offsetIdx = edge.from < edge.to ? 0 : (edge.from === edge.to ? 0 : 0)
    const perpX = -ny * 8 * (edge.from.charCodeAt(0) + edge.to.charCodeAt(0) + offsetIdx) / 20
    const perpY = nx * 8 * (edge.from.charCodeAt(0) + edge.to.charCodeAt(0) + offsetIdx) / 20

    const cpx = midX + perpX
    const cpy = midY + perpY

    const path = `M ${startX} ${startY} Q ${cpx} ${cpy} ${endX} ${endY}`
    return { path, midX: cpx, midY: cpy, angle }
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={phase === 'running'}>
          构造序列
        </button>
        <button className="btn btn-primary" onClick={handleStep}>
          单步
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={phase !== 'running'}>
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
            max="3000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        <svg width="560" height="440" viewBox="0 0 560 440">
          <defs>
            <marker id="db-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
            <marker id="db-arrow-active" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
            </marker>
            <marker id="db-arrow-used" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
            </marker>
            <marker id="db-arrow-path" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
            </marker>
          </defs>

          <text x="280" y="22" textAnchor="middle" fill="var(--text-primary)" fontSize="15" fontWeight="bold">
            De Bruijn图 G({k},{n}) — 顶点: {k}进制{n-1}元组, 边: {k}进制{n}元组
          </text>

          {graph.edges.map(edge => {
            const { path, midX, midY } = getEdgePath(edge)
            const isUsed = usedEdges.has(edge.id)
            const isCurrent = edge.id === currentEdgeId
            const isPath = pathEdges.includes(edge.id)

            let strokeColor = 'var(--border)'
            let strokeOpacity = 0.4
            let strokeWidth = 1.2
            let markerEnd = 'url(#db-arrow)'
            let textColor = 'var(--text-secondary)'
            let textOpacity = 0.5

            if (isCurrent) {
              strokeColor = '#f59e0b'
              strokeOpacity = 1
              strokeWidth = 3
              markerEnd = 'url(#db-arrow-active)'
              textColor = '#f59e0b'
              textOpacity = 1
            } else if (isPath) {
              strokeColor = '#22c55e'
              strokeOpacity = 1
              strokeWidth = 2.5
              markerEnd = 'url(#db-arrow-path)'
              textColor = '#22c55e'
              textOpacity = 1
            } else if (isUsed) {
              strokeColor = '#3b82f6'
              strokeOpacity = 0.8
              strokeWidth = 2
              markerEnd = 'url(#db-arrow-used)'
              textColor = '#3b82f6'
              textOpacity = 0.9
            }

            return (
              <g key={edge.id}>
                <path
                  d={path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  markerEnd={markerEnd}
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textColor}
                  fontSize="11"
                  fontFamily="Consolas, Monaco, monospace"
                  fontWeight={isCurrent ? 'bold' : 'normal'}
                  opacity={textOpacity}
                >
                  {edge.label}
                </text>
              </g>
            )
          })}

          {graph.vertices.map(vertex => {
            const isActive = vertex.id === currentVertex
            const isVisited = usedEdges.size > 0
            const fillColor = isActive ? '#f59e0b' : isVisited ? 'var(--bg-card)' : 'var(--bg-card)'
            const strokeColor = isActive ? '#fbbf24' : 'var(--border)'
            const strokeWidth = isActive ? 3 : 1.5

            return (
              <g key={vertex.id}>
                <circle
                  cx={vertex.x}
                  cy={vertex.y}
                  r={22}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
                <text
                  x={vertex.x}
                  y={vertex.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--text-primary)"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {vertex.label}
                </text>
              </g>
            )
          })}

          {phase === 'done' && (
            <text x="280" y="420" textAnchor="middle" fill="#22c55e" fontSize="14" fontWeight="bold">
              De Bruijn序列: {sequence}
            </text>
          )}
        </svg>
      </div>

      <div className="viz-info">
        <strong>状态：</strong>{displayStep?.description ?? '点击「构造序列」或「单步」开始演示'}
      </div>

      {sequence && (
        <div className="viz-info" style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '1rem', letterSpacing: '2px' }}>
          <strong>生成序列：</strong>
          {sequence.split('').map((ch, i) => (
            <span key={i} style={{ display: 'inline-block', width: 22, height: 22, lineHeight: '22px', textAlign: 'center', margin: '0 1px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 3 }}>
              {ch}
            </span>
          ))}
        </div>
      )}

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前探索
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前路径
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已访问边
        </span>
      </div>
    </div>
  )
}
