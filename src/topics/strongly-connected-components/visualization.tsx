import { useState, useEffect, useRef, useCallback } from 'react'

interface GraphNode {
  id: number
  label: string
  x: number
  y: number
}

interface GraphEdge {
  from: number
  to: number
}

interface SCCState {
  step: number
  description: string
  dfn: Record<number, number>
  low: Record<number, number>
  stack: number[]
  inStack: Set<number>
  visited: Set<number>
  sccs: number[][]
  currentNode: number | null
  highlightEdge: { from: number; to: number } | null
  nodeStatus: Record<number, 'unvisited' | 'visiting' | 'scc'>
  sccColors: Record<number, string>
}

const SCC_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

const NODES: GraphNode[] = [
  { id: 1, label: '1', x: 150, y: 80 },
  { id: 2, label: '2', x: 300, y: 40 },
  { id: 3, label: '3', x: 300, y: 130 },
  { id: 4, label: '4', x: 450, y: 80 },
  { id: 5, label: '5', x: 550, y: 130 },
  { id: 6, label: '6', x: 650, y: 80 },
]

const EDGES: GraphEdge[] = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 1 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 5, to: 4 },
  { from: 5, to: 6 },
]

function generateTarjanSteps(): SCCState[] {
  const steps: SCCState[] = []
  let timer = 0
  const dfn: Record<number, number> = {}
  const low: Record<number, number> = {}
  const stack: number[] = []
  const inStack = new Set<number>()
  const visited = new Set<number>()
  const sccs: number[][] = []
  const nodeStatus: Record<number, 'unvisited' | 'visiting' | 'scc'> = {}
  const sccColorMap: Record<number, string> = {}

  NODES.forEach(n => {
    dfn[n.id] = 0
    low[n.id] = 0
    nodeStatus[n.id] = 'unvisited'
  })

  const adjList: Record<number, number[]> = {}
  NODES.forEach(n => { adjList[n.id] = [] })
  EDGES.forEach(e => { adjList[e.from].push(e.to) })

  function addStep(desc: string, currentNode: number | null, highlightEdge: { from: number; to: number } | null = null) {
    steps.push({
      step: steps.length,
      description: desc,
      dfn: { ...dfn },
      low: { ...low },
      stack: [...stack],
      inStack: new Set(inStack),
      visited: new Set(visited),
      sccs: sccs.map(s => [...s]),
      currentNode,
      highlightEdge,
      nodeStatus: { ...nodeStatus },
      sccColors: { ...sccColorMap },
    })
  }

  function dfs(u: number) {
    timer++
    dfn[u] = timer
    low[u] = timer
    stack.push(u)
    inStack.add(u)
    nodeStatus[u] = 'visiting'
    visited.add(u)

    addStep(`访问节点 ${u}: dfn=${timer}, low=${timer}, 入栈`, u)

    for (const v of adjList[u]) {
      if (dfn[v] === 0) {
        addStep(`从节点 ${u} 访问未访问的邻居 ${v}`, u, { from: u, to: v })
        dfs(v)
        low[u] = Math.min(low[u], low[v])
        addStep(`回溯到节点 ${u}: low[${u}] = min(${low[u]}, ${low[v]}) = ${low[u]}`, u)
      } else if (inStack.has(v)) {
        low[u] = Math.min(low[u], dfn[v])
        addStep(`节点 ${u} 的邻居 ${v} 在栈中（回边）: low[${u}] = min(${low[u]}, ${dfn[v]}) = ${low[u]}`, u, { from: u, to: v })
      }
    }

    if (dfn[u] === low[u]) {
      addStep(`节点 ${u} 是 SCC 的根 (dfn[${u}]=${dfn[u]} == low[${u}]=${low[u]})，开始弹栈`, u)

      const scc: number[] = []
      const sccColor = SCC_COLORS[sccs.length % SCC_COLORS.length]
      let node: number
      do {
        node = stack.pop()!
        inStack.delete(node)
        scc.push(node)
        nodeStatus[node] = 'scc'
        sccColorMap[node] = sccColor
      } while (node !== u)

      sccs.push(scc)
      addStep(`找到 SCC: {${scc.join(', ')}}`, null)
    }
  }

  addStep('开始 Tarjan 算法，初始化所有节点', null)

  for (let i = 1; i <= 6; i++) {
    if (dfn[i] === 0) {
      addStep(`从节点 ${i} 开始 DFS`, i)
      dfs(i)
    }
  }

  addStep(`算法完成！共找到 ${sccs.length} 个强连通分量`, null)

  return steps
}

export default function SCCVisualization() {
  const [steps] = useState<SCCState[]>(() => generateTarjanSteps())
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const state = steps[currentStep] || steps[0]

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, speed)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps.length, speed])

  const handlePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }, [currentStep, steps.length])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleStep = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    setCurrentStep(0)
  }, [])

  const handlePrev = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }, [])

  const getNodeFill = (nodeId: number): string => {
    if (state.sccColors[nodeId]) return state.sccColors[nodeId]
    if (state.currentNode === nodeId) return '#3b82f6'
    if (state.nodeStatus[nodeId] === 'visiting') return '#60a5fa'
    return '#334155'
  }

  const getNodeStroke = (nodeId: number): string => {
    if (state.currentNode === nodeId) return '#93c5fd'
    if (state.sccColors[nodeId]) return state.sccColors[nodeId]
    return '#64748b'
  }

  const getEdgeColor = (edge: GraphEdge): string => {
    if (state.highlightEdge && state.highlightEdge.from === edge.from && state.highlightEdge.to === edge.to) {
      return '#f59e0b'
    }
    if (state.sccColors[edge.from] && state.sccColors[edge.from] === state.sccColors[edge.to]) {
      return state.sccColors[edge.from]
    }
    return '#475569'
  }

  const nodeMap = new Map(NODES.map(n => [n.id, n]))

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={handlePrev} disabled={currentStep === 0}>
          上一步
        </button>
        {isPlaying ? (
          <button className="btn btn-primary" onClick={handlePause}>暂停</button>
        ) : (
          <button className="btn btn-primary" onClick={handlePlay}>
            {currentStep >= steps.length - 1 ? '重新播放' : '播放'}
          </button>
        )}
        <button className="btn btn-secondary" onClick={handleStep} disabled={currentStep >= steps.length - 1}>
          下一步
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

      <div className="viz-canvas" style={{ display: 'flex', gap: '1rem' }}>
        <svg width="750" height="200" style={{ flex: '1 1 auto' }}>
          <defs>
            <marker id="scc-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
            <marker id="scc-arrow-highlight" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>

          {EDGES.map((edge, i) => {
            const from = nodeMap.get(edge.from)!
            const to = nodeMap.get(edge.to)!
            const isHighlight = state.highlightEdge?.from === edge.from && state.highlightEdge?.to === edge.to

            const dx = to.x - from.x
            const dy = to.y - from.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const offset = 25
            const x1 = from.x + (dx / dist) * offset
            const y1 = from.y + (dy / dist) * offset
            const x2 = to.x - (dx / dist) * offset
            const y2 = to.y - (dy / dist) * offset

            const edgeColor = getEdgeColor(edge)

            // 自环处理
            if (edge.from === edge.to) {
              return (
                <circle
                  key={i}
                  cx={from.x}
                  cy={from.y - 35}
                  r="15"
                  fill="none"
                  stroke={edgeColor}
                  strokeWidth={isHighlight ? 3 : 1.5}
                />
              )
            }

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={edgeColor}
                strokeWidth={isHighlight ? 3 : 1.5}
                markerEnd={isHighlight ? 'url(#scc-arrow-highlight)' : 'url(#scc-arrow)'}
              />
            )
          })}

          {NODES.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="22"
                fill={getNodeFill(node.id)}
                stroke={getNodeStroke(node.id)}
                strokeWidth={state.currentNode === node.id ? 3 : 2}
              />
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
                fontFamily="Consolas, Monaco, monospace"
              >
                {node.label}
              </text>
              {state.dfn[node.id] > 0 && (
                <text
                  x={node.x}
                  y={node.y + 38}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="11"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  d={state.dfn[node.id]} l={state.low[node.id]}
                </text>
              )}
            </g>
          ))}
        </svg>

        <div style={{
          width: '160px',
          flexShrink: 0,
          background: 'var(--bg-card)',
          borderRadius: '8px',
          padding: '0.75rem',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            栈 (Stack)
          </div>
          <div style={{
            fontFamily: 'Consolas, Monaco, monospace',
            color: 'var(--text-secondary)',
            minHeight: '60px',
          }}>
            {state.stack.length === 0 ? (
              <span style={{ opacity: 0.5 }}>空</span>
            ) : (
              [...state.stack].reverse().map((id, i) => (
                <div key={i} style={{
                  padding: '2px 6px',
                  marginBottom: '2px',
                  background: id === state.currentNode ? 'rgba(59,130,246,0.2)' : 'transparent',
                  borderRadius: '3px',
                }}>
                  {id}
                </div>
              ))
            )}
          </div>

          {state.sccs.length > 0 && (
            <>
              <div style={{ fontWeight: 'bold', marginTop: '0.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                已找到的 SCC
              </div>
              {state.sccs.map((scc, i) => (
                <div key={i} style={{
                  padding: '3px 6px',
                  marginBottom: '3px',
                  background: `${SCC_COLORS[i % SCC_COLORS.length]}22`,
                  borderLeft: `3px solid ${SCC_COLORS[i % SCC_COLORS.length]}`,
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                }}>
                  SCC{i + 1}: {'{' + scc.join(', ') + '}'}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="viz-info">
        <strong>步骤 {currentStep + 1}/{steps.length}：</strong> {state.description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#334155', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          未访问
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前访问
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#60a5fa', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          在栈中
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          已确定 SCC
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前探索的边
        </span>
      </div>
    </div>
  )
}
