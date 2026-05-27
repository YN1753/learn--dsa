import { useState, useEffect, useRef, useCallback } from 'react'

interface HistoryRecord {
  node: number
  oldParent: number
  oldRank: number
}

type NodeState = 'normal' | 'highlight' | 'merged' | 'root' | 'rollback'

interface StepSnapshot {
  parent: number[]
  rank: number[]
  description: string
  nodeStates: Map<number, NodeState>
  highlightedEdge: [number, number] | null
  historySize: number
}

const SVG_WIDTH = 780
const SVG_HEIGHT = 440
const NODE_RADIUS = 22

const NODE_COLORS: Record<NodeState, { fill: string; stroke: string; text: string }> = {
  normal: { fill: 'var(--bg-card)', stroke: 'var(--border)', text: 'var(--text-primary)' },
  highlight: { fill: 'rgba(59, 130, 246, 0.3)', stroke: '#3b82f6', text: '#3b82f6' },
  merged: { fill: 'rgba(34, 197, 94, 0.3)', stroke: '#22c55e', text: '#22c55e' },
  root: { fill: 'var(--accent)', stroke: '#60a5fa', text: '#ffffff' },
  rollback: { fill: 'rgba(239, 68, 68, 0.3)', stroke: '#ef4444', text: '#ef4444' },
}

function getNodePositions(n: number): { id: number; x: number; y: number }[] {
  const positions: { id: number; x: number; y: number }[] = []
  const cols = 4
  const spacingX = SVG_WIDTH / (cols + 1)
  const spacingY = SVG_HEIGHT / (Math.ceil(n / cols) + 1)
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    positions.push({
      id: i,
      x: spacingX * (col + 1),
      y: spacingY * (row + 1),
    })
  }
  return positions
}

function buildEdges(parent: number[]): [number, number][] {
  const edges: [number, number][] = []
  for (let i = 0; i < parent.length; i++) {
    if (parent[i] !== i) {
      edges.push([i, parent[i]])
    }
  }
  return edges
}

function findRoot(parent: number[], x: number): number {
  while (parent[x] !== x) {
    x = parent[x]
  }
  return x
}

export default function RollbackUnionFindVisualization() {
  const N = 8
  const [parent, setParent] = useState<number[]>([])
  const [rank, setRank] = useState<number[]>([])
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [nodeStates, setNodeStates] = useState<Map<number, NodeState>>(new Map())
  const [edges, setEdges] = useState<[number, number][]>([])
  const [steps, setSteps] = useState<StepSnapshot[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('选择操作并点击执行按钮')
  const [inputA, setInputA] = useState(0)
  const [inputB, setInputB] = useState(1)
  const [operation, setOperation] = useState<'union' | 'query' | 'rollback'>('union')
  const [highlightedEdge, setHighlightedEdge] = useState<[number, number] | null>(null)

  const timerRef = useRef<number | null>(null)
  const nodes = getNodePositions(N)

  const reset = useCallback(() => {
    const p = new Array(N)
    const r = new Array(N).fill(0)
    for (let i = 0; i < N; i++) p[i] = i
    setParent(p)
    setRank(r)
    setHistory([])
    setEdges([])
    setSteps([])
    setCurrentStep(-1)
    setIsPlaying(false)
    const initStates = new Map<number, NodeState>()
    for (let i = 0; i < N; i++) initStates.set(i, 'normal')
    setNodeStates(initStates)
    setHighlightedEdge(null)
    setDescription('已重置，选择操作并点击执行按钮')
  }, [])

  useEffect(() => {
    reset()
  }, [reset])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const applyStep = useCallback((step: StepSnapshot) => {
    setEdges(buildEdges(step.parent))
    setNodeStates(step.nodeStates)
    setHighlightedEdge(step.highlightedEdge)
    setDescription(step.description)
  }, [])

  const handleUnion = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setCurrentStep(-1)

    const p = [...parent]
    const r = [...rank]
    const h = [...history]
    const generatedSteps: StepSnapshot[] = []

    // Step 1: Find root of a
    const rootA = findRoot(p, inputA)
    const states1 = new Map<number, NodeState>()
    for (let i = 0; i < N; i++) states1.set(i, 'normal')
    states1.set(rootA, 'highlight')
    generatedSteps.push({
      parent: [...p],
      rank: [...r],
      description: `查找 ${inputA} 的根: ${rootA}`,
      nodeStates: states1,
      highlightedEdge: null,
      historySize: h.length,
    })

    // Step 2: Find root of b
    const rootB = findRoot(p, inputB)
    const states2 = new Map<number, NodeState>()
    for (let i = 0; i < N; i++) states2.set(i, 'normal')
    states2.set(rootA, 'highlight')
    states2.set(rootB, 'highlight')
    generatedSteps.push({
      parent: [...p],
      rank: [...r],
      description: `查找 ${inputB} 的根: ${rootB}`,
      nodeStates: states2,
      highlightedEdge: null,
      historySize: h.length,
    })

    // Step 3: Check if already connected
    if (rootA === rootB) {
      const states3 = new Map<number, NodeState>()
      for (let i = 0; i < N; i++) states3.set(i, 'normal')
      states3.set(rootA, 'root')
      generatedSteps.push({
        parent: [...p],
        rank: [...r],
        description: `${inputA} 和 ${inputB} 已在同一集合（根都是 ${rootA}），无需合并`,
        nodeStates: states3,
        highlightedEdge: null,
        historySize: h.length,
      })
      setSteps(generatedSteps)
      if (generatedSteps.length > 0) {
        applyStep(generatedSteps[0])
        setCurrentStep(0)
      }
      return
    }

    // Step 4: Perform union (small rank under large rank)
    let mergedNode = rootA
    let newRoot = rootB
    if (r[rootA] > r[rootB]) {
      mergedNode = rootB
      newRoot = rootA
    }

    const record: HistoryRecord = {
      node: mergedNode,
      oldParent: p[mergedNode],
      oldRank: r[newRoot],
    }
    h.push(record)

    p[mergedNode] = newRoot
    if (r[rootA] === r[rootB]) {
      r[newRoot]++
    }

    const states4 = new Map<number, NodeState>()
    for (let i = 0; i < N; i++) states4.set(i, 'normal')
    states4.set(newRoot, 'root')
    states4.set(mergedNode, 'merged')
    states4.set(inputA, 'highlight')
    states4.set(inputB, 'highlight')
    generatedSteps.push({
      parent: [...p],
      rank: [...r],
      description: `合并: 将 ${mergedNode} 挂到 ${newRoot} 下，记录到历史栈（栈大小: ${h.length}）`,
      nodeStates: states4,
      highlightedEdge: [mergedNode, newRoot],
      historySize: h.length,
    })

    setParent(p)
    setRank(r)
    setHistory(h)
    setSteps(generatedSteps)

    if (generatedSteps.length > 0) {
      const last = generatedSteps[generatedSteps.length - 1]
      applyStep(last)
      setCurrentStep(generatedSteps.length - 1)
    }
  }, [parent, rank, history, inputA, inputB, clearTimer, applyStep])

  const handleQuery = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setCurrentStep(-1)

    const p = [...parent]
    const generatedSteps: StepSnapshot[] = []

    const rootA = findRoot(p, inputA)
    const states1 = new Map<number, NodeState>()
    for (let i = 0; i < N; i++) states1.set(i, 'normal')
    states1.set(rootA, 'highlight')
    generatedSteps.push({
      parent: [...p],
      rank: [...rank],
      description: `查找 ${inputA} 的根: ${rootA}`,
      nodeStates: states1,
      highlightedEdge: null,
      historySize: history.length,
    })

    const rootB = findRoot(p, inputB)
    const connected = rootA === rootB
    const states2 = new Map<number, NodeState>()
    for (let i = 0; i < N; i++) states2.set(i, 'normal')
    states2.set(rootA, 'highlight')
    states2.set(rootB, 'highlight')
    generatedSteps.push({
      parent: [...p],
      rank: [...rank],
      description: connected
        ? `${inputA} 和 ${inputB} 连通（根都是 ${rootA}）`
        : `${inputA} 和 ${inputB} 不连通（根分别为 ${rootA} 和 ${rootB}）`,
      nodeStates: states2,
      highlightedEdge: null,
      historySize: history.length,
    })

    setSteps(generatedSteps)
    if (generatedSteps.length > 0) {
      applyStep(generatedSteps[generatedSteps.length - 1])
      setCurrentStep(generatedSteps.length - 1)
    }
  }, [parent, rank, history, inputA, inputB, clearTimer, applyStep])

  const handleRollback = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setCurrentStep(-1)

    if (history.length === 0) {
      setDescription('历史栈为空，没有可撤销的操作')
      return
    }

    const p = [...parent]
    const r = [...rank]
    const h = [...history]
    const generatedSteps: StepSnapshot[] = []

    const record = h.pop()!

    // Show before state
    const states1 = new Map<number, NodeState>()
    for (let i = 0; i < N; i++) states1.set(i, 'normal')
    states1.set(record.node, 'rollback')
    generatedSteps.push({
      parent: [...p],
      rank: [...r],
      description: `准备撤销: 节点 ${record.node} 的 parent 将从 ${p[record.node]} 恢复为 ${record.oldParent}`,
      nodeStates: states1,
      highlightedEdge: [record.node, p[record.node]],
      historySize: h.length + 1,
    })

    // Perform rollback
    p[record.node] = record.oldParent
    r[record.node] = record.oldRank

    const states2 = new Map<number, NodeState>()
    for (let i = 0; i < N; i++) states2.set(i, 'normal')
    states2.set(record.node, 'merged')
    generatedSteps.push({
      parent: [...p],
      rank: [...r],
      description: `撤销完成: 节点 ${record.node} 已恢复，历史栈大小: ${h.length}`,
      nodeStates: states2,
      highlightedEdge: null,
      historySize: h.length,
    })

    setParent(p)
    setRank(r)
    setHistory(h)
    setSteps(generatedSteps)

    if (generatedSteps.length > 0) {
      applyStep(generatedSteps[generatedSteps.length - 1])
      setCurrentStep(generatedSteps.length - 1)
    }
  }, [parent, rank, history, clearTimer, applyStep])

  const handleRollbackAll = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setCurrentStep(-1)

    if (history.length === 0) {
      setDescription('历史栈为空，没有可撤销的操作')
      return
    }

    const p = [...parent]
    const r = [...rank]
    const count = history.length

    while (history.length > 0) {
      const record = history.pop()!
      p[record.node] = record.oldParent
      r[record.node] = record.oldRank
    }

    const states = new Map<number, NodeState>()
    for (let i = 0; i < N; i++) states.set(i, 'normal')

    setParent(p)
    setRank(r)
    setHistory([])
    setEdges(buildEdges(p))
    setNodeStates(states)
    setHighlightedEdge(null)
    setDescription(`已撤销全部 ${count} 次操作，恢复到初始状态`)
  }, [parent, rank, history, clearTimer])

  const handleStepForward = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length - 1) return
    clearTimer()
    setIsPlaying(false)
    const nextStep = currentStep + 1
    applyStep(steps[nextStep])
    setCurrentStep(nextStep)
  }, [steps, currentStep, clearTimer, applyStep])

  const handleStepBackward = useCallback(() => {
    if (steps.length === 0 || currentStep <= 0) return
    clearTimer()
    setIsPlaying(false)
    const prevStep = currentStep - 1
    applyStep(steps[prevStep])
    setCurrentStep(prevStep)
  }, [steps, currentStep, clearTimer, applyStep])

  const handleTogglePlay = useCallback(() => {
    if (steps.length === 0) return

    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else {
      if (currentStep >= steps.length - 1) return
      setIsPlaying(true)
      let stepIdx = currentStep
      timerRef.current = window.setInterval(() => {
        stepIdx++
        if (stepIdx >= steps.length) {
          clearTimer()
          setIsPlaying(false)
          return
        }
        applyStep(steps[stepIdx])
        setCurrentStep(stepIdx)
      }, speed)
    }
  }, [isPlaying, steps, currentStep, speed, description, clearTimer, applyStep])

  const edgesToShow = edges

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <select
          value={operation}
          onChange={e => {
            setOperation(e.target.value as 'union' | 'query' | 'rollback')
            setSteps([])
            setCurrentStep(-1)
          }}
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
          }}
        >
          <option value="union">Union 合并</option>
          <option value="query">Query 查询</option>
          <option value="rollback">Rollback 撤销</option>
        </select>

        {operation !== 'rollback' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            元素 A:
            <input
              type="number"
              min={0}
              max={N - 1}
              value={inputA}
              onChange={e => setInputA(parseInt(e.target.value) || 0)}
              style={{
                width: '3rem',
                padding: '0.3rem',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            />
          </label>
        )}

        {operation !== 'rollback' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            元素 B:
            <input
              type="number"
              min={0}
              max={N - 1}
              value={inputB}
              onChange={e => setInputB(parseInt(e.target.value) || 0)}
              style={{
                width: '3rem',
                padding: '0.3rem',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            />
          </label>
        )}

        <button
          className="btn btn-primary"
          onClick={() => {
            if (operation === 'union') handleUnion()
            else if (operation === 'query') handleQuery()
            else handleRollback()
          }}
        >
          {operation === 'union' ? '合并' : operation === 'query' ? '查询' : '撤销'}
        </button>

        {operation === 'rollback' && (
          <button className="btn btn-primary" onClick={handleRollbackAll} disabled={history.length === 0}>
            撤销全部
          </button>
        )}

        <button className="btn btn-secondary" onClick={handleTogglePlay} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={handleStepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={reset}>
          重置
        </button>
      </div>

      <div className="viz-controls" style={{ marginTop: '0.3rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
        </span>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={2200 - speed}
          onChange={e => setSpeed(2200 - parseInt(e.target.value))}
          title={`速度: ${speed}ms`}
        />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
          注意: 不使用路径压缩，只用按秩合并
        </span>
      </div>

      <div className="viz-canvas" style={{ padding: '0.5rem', overflow: 'hidden' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ display: 'block' }}
        >
          <defs>
            <filter id="rufGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" opacity="0.6" />
            </marker>
            <marker
              id="arrowhead-hl"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
            </marker>
          </defs>

          {/* Edges */}
          {edgesToShow.map((edge, i) => {
            const fromNode = nodes.find(n => n.id === edge[0])
            const toNode = nodes.find(n => n.id === edge[1])
            if (!fromNode || !toNode) return null

            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const offsetX = (dx / dist) * NODE_RADIUS
            const offsetY = (dy / dist) * NODE_RADIUS

            const isHL = highlightedEdge !== null &&
              highlightedEdge[0] === edge[0] && highlightedEdge[1] === edge[1]

            return (
              <line
                key={`edge-${i}`}
                x1={fromNode.x + offsetX}
                y1={fromNode.y + offsetY}
                x2={toNode.x - offsetX}
                y2={toNode.y - offsetY}
                stroke={isHL ? '#ef4444' : 'var(--text-secondary)'}
                strokeWidth={isHL ? 3 : 2}
                strokeOpacity={isHL ? 1 : 0.4}
                markerEnd={isHL ? 'url(#arrowhead-hl)' : 'url(#arrowhead)'}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const state = nodeStates.get(node.id) || 'normal'
            const colors = NODE_COLORS[state]
            const isRoot = parent[node.id] === node.id
            const isCurrent = state === 'root' || state === 'highlight' || state === 'merged' || state === 'rollback'

            return (
              <g
                key={node.id}
                filter={isCurrent ? 'url(#rufGlow)' : undefined}
              >
                {isRoot && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 4}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    opacity={0.5}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={isRoot && state === 'normal' ? NODE_COLORS.root.fill : colors.fill}
                  stroke={isRoot && state === 'normal' ? NODE_COLORS.root.stroke : colors.stroke}
                  strokeWidth={isCurrent ? 3 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isRoot && state === 'normal' ? NODE_COLORS.root.text : colors.text}
                  fontSize="14"
                  fontWeight="600"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ transition: 'fill 0.3s ease', pointerEvents: 'none' }}
                >
                  {node.id}
                </text>
                <text
                  x={node.x}
                  y={node.y + NODE_RADIUS + 14}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  p={parent[node.id]}
                </text>
                <text
                  x={node.x}
                  y={node.y + NODE_RADIUS + 26}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  r={rank[node.id]}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(15, ${SVG_HEIGHT - 40})`}>
            <circle cx={0} cy={0} r={7} fill={NODE_COLORS.root.fill} stroke={NODE_COLORS.root.stroke} strokeWidth={1.5} />
            <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">根节点</text>
            <circle cx={80} cy={0} r={7} fill={NODE_COLORS.normal.fill} stroke={NODE_COLORS.normal.stroke} strokeWidth={1.5} />
            <text x={92} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">普通节点</text>
            <circle cx={170} cy={0} r={7} fill={NODE_COLORS.highlight.fill} stroke={NODE_COLORS.highlight.stroke} strokeWidth={1.5} />
            <text x={182} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">查找中</text>
            <circle cx={240} cy={0} r={7} fill={NODE_COLORS.merged.fill} stroke={NODE_COLORS.merged.stroke} strokeWidth={1.5} />
            <text x={252} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">被合并</text>
            <circle cx={310} cy={0} r={7} fill={NODE_COLORS.rollback.fill} stroke={NODE_COLORS.rollback.stroke} strokeWidth={1.5} />
            <text x={322} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">撤销中</text>
          </g>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>Parent 数组</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            [{parent.join(', ')}]
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>Rank 数组</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            [{rank.join(', ')}]
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>历史栈</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            {history.length} 条记录
          </div>
        </div>
        {steps.length > 0 && (
          <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
            <strong>步骤进度</strong>
            <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
              {currentStep + 1} / {steps.length}
            </div>
          </div>
        )}
      </div>

      <div className="viz-info">
        {description}
      </div>
    </div>
  )
}
