import { useState, useEffect, useRef, useCallback } from 'react'

interface GraphNode {
  id: number
  x: number
  y: number
  group: 'U' | 'V'
  label: string
}

interface GraphEdge {
  from: number
  to: number
}

type ModeType = 'coloring' | 'matching'
type NodeColorState = 'uncolored' | 'color-0' | 'color-1' | 'conflict'

interface AnimationStep {
  nodeStates: Map<number, NodeColorState>
  edgeStates: Map<string, 'normal' | 'matched' | 'augmenting' | 'unmatched'>
  description: string
  queueOrPath: number[]
  matchedEdges: [number, number][]
}

const SVG_WIDTH = 780
const SVG_HEIGHT = 440
const NODE_RADIUS = 22

function buildDefaultGraph(): { nodes: GraphNode[]; edges: GraphEdge[]; adjList: Map<number, number[]> } {
  const nodes: GraphNode[] = [
    { id: 0, x: 120, y: 80, group: 'U', label: 'A' },
    { id: 1, x: 120, y: 200, group: 'U', label: 'B' },
    { id: 2, x: 120, y: 320, group: 'U', label: 'C' },
    { id: 3, x: 380, y: 60, group: 'V', label: '1' },
    { id: 4, x: 380, y: 170, group: 'V', label: '2' },
    { id: 5, x: 380, y: 280, group: 'V', label: '3' },
    { id: 6, x: 380, y: 380, group: 'V', label: '4' },
  ]

  const edges: GraphEdge[] = [
    { from: 0, to: 3 },
    { from: 0, to: 4 },
    { from: 1, to: 4 },
    { from: 1, to: 5 },
    { from: 2, to: 4 },
    { from: 2, to: 6 },
  ]

  const adjList = new Map<number, number[]>()
  for (const node of nodes) adjList.set(node.id, [])
  for (const { from, to } of edges) {
    adjList.get(from)!.push(to)
    adjList.get(to)!.push(from)
  }
  for (const neighbors of adjList.values()) {
    neighbors.sort((a, b) => a - b)
  }

  return { nodes, edges, adjList }
}

function edgeKey(a: number, b: number): string {
  return `${Math.min(a, b)}-${Math.max(a, b)}`
}

function generateColoringSteps(adjList: Map<number, number[]>): AnimationStep[] {
  const steps: AnimationStep[] = []
  const color = new Map<number, number>()
  const allNodes = [...adjList.keys()]

  // 初始状态
  const initStates = new Map<number, NodeColorState>()
  for (const id of allNodes) initStates.set(id, 'uncolored')
  const initEdges = new Map<string, 'normal' | 'matched' | 'augmenting' | 'unmatched'>()
  steps.push({
    nodeStates: new Map(initStates),
    edgeStates: new Map(initEdges),
    description: '准备开始 BFS 染色',
    queueOrPath: [],
    matchedEdges: [],
  })

  for (const startNode of allNodes) {
    if (color.has(startNode)) continue

    const queue: number[] = [startNode]
    color.set(startNode, 0)

    const s1 = new Map(steps[steps.length - 1].nodeStates)
    s1.set(startNode, 'color-0')
    steps.push({
      nodeStates: new Map(s1),
      edgeStates: new Map(steps[steps.length - 1].edgeStates),
      description: `从节点 ${startNode} 开始 BFS，染为红色 (0)`,
      queueOrPath: [startNode],
      matchedEdges: [],
    })

    while (queue.length > 0) {
      const curr = queue.shift()!
      const currColor = color.get(curr)!

      const neighbors = adjList.get(curr) || []
      for (const neighbor of neighbors) {
        const edgeK = edgeKey(curr, neighbor)
        if (!color.has(neighbor)) {
          const newColor = 1 - currColor
          color.set(neighbor, newColor)
          queue.push(neighbor)

          const s = new Map(steps[steps.length - 1].nodeStates)
          s.set(neighbor, newColor === 0 ? 'color-0' : 'color-1')
          const e = new Map(steps[steps.length - 1].edgeStates)
          e.set(edgeK, 'matched')
          steps.push({
            nodeStates: new Map(s),
            edgeStates: new Map(e),
            description: `节点 ${neighbor} 染为${newColor === 0 ? '红色 (0)' : '蓝色 (1)'}`,
            queueOrPath: [...queue],
            matchedEdges: [],
          })
        } else if (color.get(neighbor) === currColor) {
          const s = new Map(steps[steps.length - 1].nodeStates)
          s.set(curr, 'conflict')
          s.set(neighbor, 'conflict')
          const e = new Map(steps[steps.length - 1].edgeStates)
          e.set(edgeK, 'unmatched')
          steps.push({
            nodeStates: new Map(s),
            edgeStates: new Map(e),
            description: `冲突！节点 ${curr} 和 ${neighbor} 相邻且同色，不是二分图！`,
            queueOrPath: [],
            matchedEdges: [],
          })
          return steps
        }
      }

      // 处理完当前节点
      const s = new Map(steps[steps.length - 1].nodeStates)
      const e = new Map(steps[steps.length - 1].edgeStates)
      steps.push({
        nodeStates: new Map(s),
        edgeStates: new Map(e),
        description: `节点 ${curr} 处理完毕`,
        queueOrPath: [...queue],
        matchedEdges: [],
      })
    }
  }

  steps.push({
    nodeStates: new Map(steps[steps.length - 1].nodeStates),
    edgeStates: new Map(steps[steps.length - 1].edgeStates),
    description: '染色完成！图是二分图',
    queueOrPath: [],
    matchedEdges: [],
  })

  return steps
}

function generateMatchingSteps(adjList: Map<number, number[]>, uSet: number[]): AnimationStep[] {
  const steps: AnimationStep[] = []
  const match = new Map<number, number>()
  const allNodes = [...adjList.keys()]

  // 初始状态
  const initStates = new Map<number, NodeColorState>()
  for (const id of allNodes) {
    initStates.set(id, uSet.includes(id) ? 'color-0' : 'color-1')
  }
  steps.push({
    nodeStates: new Map(initStates),
    edgeStates: new Map(),
    description: '准备开始匈牙利算法求最大匹配',
    queueOrPath: [],
    matchedEdges: [],
  })

  function findAugmentingPath(u: number, visited: Set<number>): boolean {
    const neighbors = adjList.get(u) || []
    for (const v of neighbors) {
      if (visited.has(v)) continue
      visited.add(v)
      const edgeK = edgeKey(u, v)

      if (!match.has(v)) {
        // 找到增广路径终点
        match.set(v, u)
        const s = new Map(steps[steps.length - 1].nodeStates)
        const e = new Map(steps[steps.length - 1].edgeStates)
        e.set(edgeK, 'matched')
        const matchedArr: [number, number][] = []
        for (const [vv, uu] of match) matchedArr.push([uu, vv])
        steps.push({
          nodeStates: new Map(s),
          edgeStates: new Map(e),
          description: `找到增广路径终点 ${v}，匹配 ${u}-${v}`,
          queueOrPath: [u, v],
          matchedEdges: [...matchedArr],
        })
        return true
      } else {
        const matchedU = match.get(v)!
        const prevEdgeK = edgeKey(matchedU, v)

        const s1 = new Map(steps[steps.length - 1].nodeStates)
        const e1 = new Map(steps[steps.length - 1].edgeStates)
        e1.set(edgeK, 'augmenting')
        steps.push({
          nodeStates: new Map(s1),
          edgeStates: new Map(e1),
          description: `尝试 ${u}-${v}，但 ${v} 已匹配给 ${matchedU}，尝试回溯`,
          queueOrPath: [u, v, matchedU],
          matchedEdges: [...match.entries()].map(([vv, uu]) => [uu, vv]),
        })

        if (findAugmentingPath(matchedU, visited)) {
          match.set(v, u)
          const s2 = new Map(steps[steps.length - 1].nodeStates)
          const e2 = new Map(steps[steps.length - 1].edgeStates)
          e2.set(edgeK, 'matched')
          e2.set(prevEdgeK, 'normal')
          const matchedArr: [number, number][] = []
          for (const [vv, uu] of match) matchedArr.push([uu, vv])
          steps.push({
            nodeStates: new Map(s2),
            edgeStates: new Map(e2),
            description: `成功！将 ${v} 重新匹配给 ${u}`,
            queueOrPath: [u, v],
            matchedEdges: [...matchedArr],
          })
          return true
        }
      }
    }
    return false
  }

  for (const u of uSet) {
    const s = new Map(steps[steps.length - 1].nodeStates)
    // 高亮当前尝试的 U 节点
    for (const id of uSet) s.set(id, 'color-0')
    s.set(u, 'uncolored') // 用 uncolored 作为"当前"高亮

    steps.push({
      nodeStates: new Map(s),
      edgeStates: new Map(steps[steps.length - 1].edgeStates),
      description: `尝试为节点 ${u} 寻找匹配`,
      queueOrPath: [u],
      matchedEdges: [...match.entries()].map(([vv, uu]) => [uu, vv]),
    })

    const visited = new Set<number>()
    if (findAugmentingPath(u, visited)) {
      // 恢复颜色
      const s2 = new Map(steps[steps.length - 1].nodeStates)
      s2.set(u, 'color-0')
      const matchedArr: [number, number][] = []
      for (const [vv, uu] of match) matchedArr.push([uu, vv])
      steps.push({
        nodeStates: new Map(s2),
        edgeStates: new Map(steps[steps.length - 1].edgeStates),
        description: `节点 ${u} 匹配成功！当前匹配数: ${match.size}`,
        queueOrPath: [],
        matchedEdges: [...matchedArr],
      })
    } else {
      const s2 = new Map(steps[steps.length - 1].nodeStates)
      s2.set(u, 'color-0')
      steps.push({
        nodeStates: new Map(s2),
        edgeStates: new Map(steps[steps.length - 1].edgeStates),
        description: `节点 ${u} 无法找到匹配`,
        queueOrPath: [],
        matchedEdges: [...match.entries()].map(([vv, uu]) => [uu, vv]),
      })
    }
  }

  // 最终状态
  const finalEdges = new Map<string, 'normal' | 'matched' | 'augmenting' | 'unmatched'>()
  const matchedArr: [number, number][] = []
  for (const [v, u] of match) {
    finalEdges.set(edgeKey(u, v), 'matched')
    matchedArr.push([u, v])
  }
  const finalStates = new Map<number, NodeColorState>()
  for (const id of allNodes) {
    finalStates.set(id, uSet.includes(id) ? 'color-0' : 'color-1')
  }
  steps.push({
    nodeStates: finalStates,
    edgeStates: finalEdges,
    description: `匈牙利算法完成！最大匹配数: ${match.size}`,
    queueOrPath: [],
    matchedEdges: matchedArr,
  })

  return steps
}

const NODE_COLOR_MAP: Record<NodeColorState, { fill: string; stroke: string; text: string }> = {
  uncolored: { fill: 'var(--bg-card)', stroke: 'var(--border)', text: 'var(--text-primary)' },
  'color-0': { fill: 'rgba(239, 68, 68, 0.25)', stroke: '#ef4444', text: '#ef4444' },
  'color-1': { fill: 'rgba(59, 130, 246, 0.25)', stroke: '#3b82f6', text: '#3b82f6' },
  conflict: { fill: 'rgba(245, 158, 11, 0.4)', stroke: '#f59e0b', text: '#f59e0b' },
}

export default function BipartiteGraphVisualization() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges] = useState<GraphEdge[]>(buildDefaultGraph().edges)
  const [adjList, setAdjList] = useState<Map<number, number[]>>(new Map())
  const [mode, setMode] = useState<ModeType>('coloring')
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('选择模式并点击"开始"按钮')
  const [nodeStates, setNodeStates] = useState<Map<number, NodeColorState>>(new Map())
  const [edgeStates, setEdgeStates] = useState<Map<string, 'normal' | 'matched' | 'augmenting' | 'unmatched'>>(new Map())
  const [queueOrPath, setQueueOrPath] = useState<number[]>([])
  const [matchedEdges, setMatchedEdges] = useState<[number, number][]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const timerRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const { nodes: n, adjList: adj } = buildDefaultGraph()
    setNodes(n)
    setAdjList(adj)
    const initStates = new Map<number, NodeColorState>()
    for (const node of n) initStates.set(node.id, 'uncolored')
    setNodeStates(initStates)
  }, [])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const handleReset = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setCurrentStep(-1)
    setSteps([])
    setQueueOrPath([])
    setMatchedEdges([])
    setEdgeStates(new Map())
    const initStates = new Map<number, NodeColorState>()
    for (const node of nodes) initStates.set(node.id, 'uncolored')
    setNodeStates(initStates)
    setDescription('已重置，选择模式并点击"开始"按钮')
  }, [clearTimer, nodes])

  const handleStart = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setCurrentStep(-1)

    const uSet = nodes.filter(n => n.group === 'U').map(n => n.id)
    const generatedSteps = mode === 'coloring'
      ? generateColoringSteps(adjList)
      : generateMatchingSteps(adjList, uSet)

    setSteps(generatedSteps)

    if (generatedSteps.length > 0) {
      const first = generatedSteps[0]
      setNodeStates(first.nodeStates)
      setEdgeStates(first.edgeStates)
      setQueueOrPath(first.queueOrPath)
      setMatchedEdges(first.matchedEdges)
      setDescription(first.description)
      setCurrentStep(0)
      setIsPlaying(true)

      let stepIdx = 0
      timerRef.current = window.setInterval(() => {
        stepIdx++
        if (stepIdx >= generatedSteps.length) {
          clearTimer()
          setIsPlaying(false)
          const last = generatedSteps[generatedSteps.length - 1]
          setDescription(last.description)
          return
        }
        const step = generatedSteps[stepIdx]
        setNodeStates(step.nodeStates)
        setEdgeStates(step.edgeStates)
        setQueueOrPath(step.queueOrPath)
        setMatchedEdges(step.matchedEdges)
        setDescription(step.description)
        setCurrentStep(stepIdx)
      }, speed)
    }
  }, [mode, adjList, nodes, speed, clearTimer])

  const togglePlay = useCallback(() => {
    if (steps.length === 0) return

    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription('已暂停')
    } else {
      if (currentStep >= steps.length - 1) {
        handleStart()
        return
      }

      setIsPlaying(true)
      let stepIdx = currentStep
      timerRef.current = window.setInterval(() => {
        stepIdx++
        if (stepIdx >= steps.length) {
          clearTimer()
          setIsPlaying(false)
          setDescription(steps[steps.length - 1].description)
          return
        }
        const step = steps[stepIdx]
        setNodeStates(step.nodeStates)
        setEdgeStates(step.edgeStates)
        setQueueOrPath(step.queueOrPath)
        setMatchedEdges(step.matchedEdges)
        setDescription(step.description)
        setCurrentStep(stepIdx)
      }, speed)
    }
  }, [isPlaying, steps, currentStep, speed, clearTimer, handleStart])

  const handleStepForward = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length - 1) return
    clearTimer()
    setIsPlaying(false)
    const nextStep = currentStep + 1
    const step = steps[nextStep]
    setNodeStates(step.nodeStates)
    setEdgeStates(step.edgeStates)
    setQueueOrPath(step.queueOrPath)
    setMatchedEdges(step.matchedEdges)
    setDescription(step.description)
    setCurrentStep(nextStep)
  }, [steps, currentStep, clearTimer])

  const handleStepBackward = useCallback(() => {
    if (steps.length === 0 || currentStep <= 0) return
    clearTimer()
    setIsPlaying(false)
    const prevStep = currentStep - 1
    const step = steps[prevStep]
    setNodeStates(step.nodeStates)
    setEdgeStates(step.edgeStates)
    setQueueOrPath(step.queueOrPath)
    setMatchedEdges(step.matchedEdges)
    setDescription(step.description)
    setCurrentStep(prevStep)
  }, [steps, currentStep, clearTimer])

  const getSVGPoint = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = SVG_WIDTH / rect.width
    const scaleY = SVG_HEIGHT / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }, [])

  const handleMouseDown = useCallback((nodeId: number, e: React.MouseEvent) => {
    e.preventDefault()
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    const pt = getSVGPoint(e.clientX, e.clientY)
    setDragging(nodeId)
    setDragOffset({ x: pt.x - node.x, y: pt.y - node.y })
  }, [nodes, getSVGPoint])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null) return
    const pt = getSVGPoint(e.clientX, e.clientY)
    setNodes(prev => prev.map(n =>
      n.id === dragging
        ? { ...n, x: Math.max(NODE_RADIUS, Math.min(SVG_WIDTH - NODE_RADIUS, pt.x - dragOffset.x)), y: Math.max(NODE_RADIUS, Math.min(SVG_HEIGHT - NODE_RADIUS, pt.y - dragOffset.y)) }
        : n
    ))
  }, [dragging, dragOffset, getSVGPoint])

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <select
          value={mode}
          onChange={e => { setMode(e.target.value as ModeType); handleReset() }}
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
          }}
        >
          <option value="coloring">2-染色判定</option>
          <option value="matching">最大匹配</option>
        </select>
        <button className="btn btn-primary" onClick={handleStart}>
          开始
        </button>
        <button className="btn btn-secondary" onClick={togglePlay} disabled={steps.length === 0}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleStepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
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
      </div>

      <div className="viz-canvas" style={{ padding: '0.5rem', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ display: 'block', cursor: dragging !== null ? 'grabbing' : 'default' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <filter id="bipartiteGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id="arrowMatched" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#22c55e" />
            </marker>
          </defs>

          {/* 集合标签 */}
          <text x={120} y={30} textAnchor="middle" fill="var(--text-secondary)" fontSize="14" fontWeight="600">
            集合 U
          </text>
          <text x={380} y={30} textAnchor="middle" fill="var(--text-secondary)" fontSize="14" fontWeight="600">
            集合 V
          </text>

          {/* 分隔线 */}
          <line x1={250} y1={40} x2={250} y2={SVG_HEIGHT - 20} stroke="var(--border)" strokeWidth={1} strokeDasharray="6,4" strokeOpacity={0.4} />

          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = nodeMap.get(edge.from)
            const toNode = nodeMap.get(edge.to)
            if (!fromNode || !toNode) return null
            const eKey = edgeKey(edge.from, edge.to)
            const eState = edgeStates.get(eKey) || 'normal'

            let strokeColor = 'var(--border)'
            let strokeWidth = 1.5
            let strokeOpacity = 0.5
            let strokeDasharray = ''

            if (eState === 'matched') {
              strokeColor = '#22c55e'
              strokeWidth = 3
              strokeOpacity = 0.9
            } else if (eState === 'augmenting') {
              strokeColor = '#f59e0b'
              strokeWidth = 3
              strokeOpacity = 0.9
              strokeDasharray = '6,3'
            } else if (eState === 'unmatched') {
              strokeColor = '#ef4444'
              strokeWidth = 2.5
              strokeOpacity = 0.8
            }

            return (
              <line
                key={i}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={strokeDasharray}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const state = nodeStates.get(node.id) || 'uncolored'
            const colors = NODE_COLOR_MAP[state]
            const isCurrent = queueOrPath.includes(node.id)

            return (
              <g
                key={node.id}
                filter={isCurrent ? 'url(#bipartiteGlow)' : undefined}
                style={{ cursor: 'grab' }}
                onMouseDown={e => handleMouseDown(node.id, e)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={state === 'conflict' ? 3 : isCurrent ? 2.5 : 2}
                  style={{ transition: dragging === node.id ? 'none' : 'all 0.3s ease' }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={colors.text}
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ transition: dragging === node.id ? 'none' : 'fill 0.3s ease', pointerEvents: 'none' }}
                >
                  {node.label}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(15, ${SVG_HEIGHT - 35})`}>
            {mode === 'coloring' ? (
              <>
                <circle cx={0} cy={0} r={7} fill={NODE_COLOR_MAP.uncolored.fill} stroke={NODE_COLOR_MAP.uncolored.stroke} strokeWidth={1.5} />
                <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">未染色</text>
                <circle cx={70} cy={0} r={7} fill={NODE_COLOR_MAP['color-0'].fill} stroke={NODE_COLOR_MAP['color-0'].stroke} strokeWidth={1.5} />
                <text x={82} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">颜色 0 (红)</text>
                <circle cx={165} cy={0} r={7} fill={NODE_COLOR_MAP['color-1'].fill} stroke={NODE_COLOR_MAP['color-1'].stroke} strokeWidth={1.5} />
                <text x={177} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">颜色 1 (蓝)</text>
                <circle cx={260} cy={0} r={7} fill={NODE_COLOR_MAP.conflict.fill} stroke={NODE_COLOR_MAP.conflict.stroke} strokeWidth={1.5} />
                <text x={272} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">冲突</text>
              </>
            ) : (
              <>
                <circle cx={0} cy={0} r={7} fill={NODE_COLOR_MAP['color-0'].fill} stroke={NODE_COLOR_MAP['color-0'].stroke} strokeWidth={1.5} />
                <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">集合 U</text>
                <circle cx={70} cy={0} r={7} fill={NODE_COLOR_MAP['color-1'].fill} stroke={NODE_COLOR_MAP['color-1'].stroke} strokeWidth={1.5} />
                <text x={82} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">集合 V</text>
                <line x1={140} y1={0} x2={170} y2={0} stroke="#22c55e" strokeWidth={3} />
                <text x={175} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">匹配边</text>
                <line x1={225} y1={0} x2={255} y2={0} stroke="#f59e0b" strokeWidth={3} strokeDasharray="6,3" />
                <text x={260} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">增广路径</text>
              </>
            )}
          </g>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        {mode === 'coloring' && (
          <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
            <strong>BFS 队列</strong>
            <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
              {queueOrPath.length > 0 ? `[${queueOrPath.join(', ')}]` : '空'}
            </div>
          </div>
        )}
        {mode === 'matching' && (
          <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
            <strong>当前匹配</strong>
            <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
              {matchedEdges.length > 0 ? matchedEdges.map(([u, v]) => `${u}-${v}`).join(', ') : '无'}
            </div>
          </div>
        )}
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
