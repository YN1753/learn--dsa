import { useState, useEffect, useRef, useCallback } from 'react'

interface GraphNode {
  id: number
  x: number
  y: number
  group: 'U' | 'V'
  label: string
  layer: number
}

interface GraphEdge {
  from: number
  to: number
}

interface AnimationStep {
  nodeStates: Map<number, 'free' | 'matched' | 'current' | 'visited' | 'layered' | 'augmenting'>
  edgeStates: Map<string, 'normal' | 'matched' | 'bfs-tree' | 'augmenting' | 'layer-edge'>
  description: string
  currentLayer: number
  matchedEdges: [number, number][]
  bfsQueue: number[]
}

const SVG_WIDTH = 780
const SVG_HEIGHT = 440
const NODE_RADIUS = 22

function buildDefaultGraph(): { nodes: GraphNode[]; edges: GraphEdge[]; adjList: Map<number, number[]> } {
  const nodes: GraphNode[] = [
    { id: 0, x: 120, y: 60, group: 'U', label: 'A', layer: -1 },
    { id: 1, x: 120, y: 170, group: 'U', label: 'B', layer: -1 },
    { id: 2, x: 120, y: 280, group: 'U', label: 'C', layer: -1 },
    { id: 3, x: 120, y: 380, group: 'U', label: 'D', layer: -1 },
    { id: 4, x: 520, y: 60, group: 'V', label: '1', layer: -1 },
    { id: 5, x: 520, y: 170, group: 'V', label: '2', layer: -1 },
    { id: 6, x: 520, y: 280, group: 'V', label: '3', layer: -1 },
    { id: 7, x: 520, y: 380, group: 'V', label: '4', layer: -1 },
  ]

  const edges: GraphEdge[] = [
    { from: 0, to: 4 },
    { from: 0, to: 5 },
    { from: 1, to: 5 },
    { from: 1, to: 6 },
    { from: 2, to: 5 },
    { from: 2, to: 7 },
    { from: 3, to: 6 },
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

function generateSteps(
  adjList: Map<number, number[]>,
  uSet: number[],
  vSet: number[]
): AnimationStep[] {
  const steps: AnimationStep[] = []
  const pairU = new Map<number, number | null>()
  const pairV = new Map<number, number | null>()
  const dist = new Map<number, number>()

  for (const u of uSet) pairU.set(u, null)
  for (const v of vSet) pairV.set(v, null)

  const nodeNames = new Map([
    [0, 'A'], [1, 'B'], [2, 'C'], [3, 'D'],
    [4, '1'], [5, '2'], [6, '3'], [7, '4'],
  ])

  // 初始状态
  const initNodeStates = new Map<number, 'free' | 'matched' | 'current' | 'visited' | 'layered' | 'augmenting'>()
  for (const id of [...uSet, ...vSet]) initNodeStates.set(id, 'free')
  const initEdgeStates = new Map<string, 'normal' | 'matched' | 'bfs-tree' | 'augmenting' | 'layer-edge'>()

  steps.push({
    nodeStates: new Map(initNodeStates),
    edgeStates: new Map(initEdgeStates),
    description: '初始状态：所有节点未匹配，准备开始 Hopcroft-Karp 算法',
    currentLayer: -1,
    matchedEdges: [],
    bfsQueue: [],
  })

  let matching = 0
  let iteration = 0

  function doBfs(): boolean {
    iteration++
    const queue: number[] = []

    // 重置节点状态
    const resetStates = new Map(steps[steps.length - 1].nodeStates)
    for (const id of [...uSet, ...vSet]) {
      if (pairU.get(id) !== undefined && pairU.get(id) !== null) {
        resetStates.set(id, 'matched')
      } else if (pairV.get(id) !== undefined && pairV.get(id) !== null) {
        resetStates.set(id, 'matched')
      } else {
        resetStates.set(id, 'free')
      }
    }

    for (const u of uSet) {
      if (pairU.get(u) === null) {
        dist.set(u, 0)
        queue.push(u)
        resetStates.set(u, 'layered')
      } else {
        dist.set(u, Infinity)
      }
    }

    steps.push({
      nodeStates: new Map(resetStates),
      edgeStates: new Map(steps[steps.length - 1].edgeStates),
      description: `第 ${iteration} 轮：BFS 分层开始，从所有未匹配的 U 节点出发`,
      currentLayer: 0,
      matchedEdges: [...pairU.entries()].filter(([, v]) => v !== null).map(([u, v]) => [u, v!]),
      bfsQueue: [...queue],
    })

    let found = false
    while (queue.length > 0) {
      const u = queue.shift()!
      const d = dist.get(u)!
      const s = new Map(steps[steps.length - 1].nodeStates)

      for (const v of adjList.get(u) || []) {
        const matchedU = pairV.get(v) ?? null
        if (matchedU === null) {
          found = true
          s.set(v, 'layered')
        } else if (dist.get(matchedU) === Infinity) {
          dist.set(matchedU, d + 1)
          queue.push(matchedU)
          s.set(matchedU, 'layered')
          s.set(v, 'visited')
        }
      }

      steps.push({
        nodeStates: new Map(s),
        edgeStates: new Map(steps[steps.length - 1].edgeStates),
        description: `BFS：处理节点 ${nodeNames.get(u)}（第 ${d} 层），扩展其邻居`,
        currentLayer: d,
        matchedEdges: [...pairU.entries()].filter(([, v]) => v !== null).map(([u2, v2]) => [u2, v2!]),
        bfsQueue: [...queue],
      })
    }

    if (found) {
      steps.push({
        nodeStates: new Map(steps[steps.length - 1].nodeStates),
        edgeStates: new Map(steps[steps.length - 1].edgeStates),
        description: `BFS 完成：存在增广路，准备 DFS 搜索`,
        currentLayer: -1,
        matchedEdges: [...pairU.entries()].filter(([, v]) => v !== null).map(([u, v]) => [u, v!]),
        bfsQueue: [],
      })
    } else {
      steps.push({
        nodeStates: new Map(steps[steps.length - 1].nodeStates),
        edgeStates: new Map(steps[steps.length - 1].edgeStates),
        description: `BFS 完成：不存在增广路，算法结束`,
        currentLayer: -1,
        matchedEdges: [...pairU.entries()].filter(([, v]) => v !== null).map(([u, v]) => [u, v!]),
        bfsQueue: [],
      })
    }

    return found
  }

  function doDfs(): number {
    let roundMatch = 0

    for (const u of uSet) {
      if (pairU.get(u) !== null) continue

      const s = new Map(steps[steps.length - 1].nodeStates)
      s.set(u, 'current')
      steps.push({
        nodeStates: new Map(s),
        edgeStates: new Map(steps[steps.length - 1].edgeStates),
        description: `DFS：从节点 ${nodeNames.get(u)} 出发寻找增广路`,
        currentLayer: -1,
        matchedEdges: [...pairU.entries()].filter(([, v]) => v !== null).map(([u2, v2]) => [u2, v2!]),
        bfsQueue: [],
      })

      if (dfsHelper(u)) {
        roundMatch++
        matching++
        const s2 = new Map(steps[steps.length - 1].nodeStates)
        // 标记增广完成
        for (const [uu, vv] of pairU.entries()) {
          if (vv !== null) {
            s2.set(uu, 'matched')
            s2.set(vv, 'matched')
          }
        }
        steps.push({
          nodeStates: new Map(s2),
          edgeStates: new Map(steps[steps.length - 1].edgeStates),
          description: `节点 ${nodeNames.get(u)} 增广成功！当前匹配数: ${matching}`,
          currentLayer: -1,
          matchedEdges: [...pairU.entries()].filter(([, v]) => v !== null).map(([u2, v2]) => [u2, v2!]),
          bfsQueue: [],
        })
      }
    }

    return roundMatch
  }

  function dfsHelper(u: number): boolean {
    for (const v of adjList.get(u) || []) {
      const matchedU = pairV.get(v) ?? null
      const s = new Map(steps[steps.length - 1].nodeStates)
      const e = new Map(steps[steps.length - 1].edgeStates)

      s.set(u, 'current')
      s.set(v, 'visited')
      e.set(edgeKey(u, v), 'augmenting')

      steps.push({
        nodeStates: new Map(s),
        edgeStates: new Map(e),
        description: `DFS：尝试 ${nodeNames.get(u)} → ${nodeNames.get(v)}`,
        currentLayer: -1,
        matchedEdges: [...pairU.entries()].filter(([, vv]) => vv !== null).map(([uu, vv]) => [uu, vv!]),
        bfsQueue: [],
      })

      if (matchedU === null || (dist.get(matchedU) === dist.get(u)! + 1 && dfsHelper(matchedU))) {
        pairU.set(u, v)
        pairV.set(v, u)

        const s2 = new Map(steps[steps.length - 1].nodeStates)
        const e2 = new Map(steps[steps.length - 1].edgeStates)
        s2.set(u, 'matched')
        s2.set(v, 'matched')
        e2.set(edgeKey(u, v), 'matched')

        steps.push({
          nodeStates: new Map(s2),
          edgeStates: new Map(e2),
          description: `匹配成功：${nodeNames.get(u)} - ${nodeNames.get(v)}`,
          currentLayer: -1,
          matchedEdges: [...pairU.entries()].filter(([, vv]) => vv !== null).map(([uu, vv]) => [uu, vv!]),
          bfsQueue: [],
        })
        return true
      } else {
        // 回溯
        const s3 = new Map(steps[steps.length - 1].nodeStates)
        const e3 = new Map(steps[steps.length - 1].edgeStates)
        e3.set(edgeKey(u, v), 'normal')
        s3.set(v, 'free')
        steps.push({
          nodeStates: new Map(s3),
          edgeStates: new Map(e3),
          description: `回溯：${nodeNames.get(v)} 的匹配路径不通`,
          currentLayer: -1,
          matchedEdges: [...pairU.entries()].filter(([, vv]) => vv !== null).map(([uu, vv]) => [uu, vv!]),
          bfsQueue: [],
        })
      }
    }

    dist.set(u, Infinity)
    return false
  }

  // 主循环
  while (doBfs()) {
    doDfs()
  }

  // 最终状态
  const finalNodeStates = new Map<number, 'free' | 'matched' | 'current' | 'visited' | 'layered' | 'augmenting'>()
  for (const id of [...uSet, ...vSet]) {
    if (pairU.get(id) !== null || pairV.get(id) !== null) {
      finalNodeStates.set(id, 'matched')
    } else {
      finalNodeStates.set(id, 'free')
    }
  }
  const finalEdgeStates = new Map<string, 'normal' | 'matched' | 'bfs-tree' | 'augmenting' | 'layer-edge'>()
  for (const [u, v] of pairU.entries()) {
    if (v !== null) {
      finalEdgeStates.set(edgeKey(u, v), 'matched')
    }
  }

  steps.push({
    nodeStates: finalNodeStates,
    edgeStates: finalEdgeStates,
    description: `算法完成！最大匹配数: ${matching}`,
    currentLayer: -1,
    matchedEdges: [...pairU.entries()].filter(([, v]) => v !== null).map(([u, v]) => [u, v!]),
    bfsQueue: [],
  })

  return steps
}

const NODE_COLOR_MAP: Record<string, { fill: string; stroke: string; text: string }> = {
  free: { fill: 'var(--bg-card)', stroke: 'var(--border)', text: 'var(--text-primary)' },
  matched: { fill: 'rgba(34, 197, 94, 0.25)', stroke: '#22c55e', text: '#22c55e' },
  current: { fill: 'rgba(239, 68, 68, 0.3)', stroke: '#ef4444', text: '#ef4444' },
  visited: { fill: 'rgba(59, 130, 246, 0.2)', stroke: '#3b82f6', text: '#3b82f6' },
  layered: { fill: 'rgba(168, 85, 247, 0.25)', stroke: '#a855f7', text: '#a855f7' },
  augmenting: { fill: 'rgba(245, 158, 11, 0.3)', stroke: '#f59e0b', text: '#f59e0b' },
}

export default function HopcroftKarpVisualization() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges] = useState<GraphEdge[]>(buildDefaultGraph().edges)
  const [adjList] = useState<Map<number, number[]>>(buildDefaultGraph().adjList)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('点击「开始」按钮，观察 Hopcroft-Karp 算法的执行过程')
  const [nodeStates, setNodeStates] = useState<Map<number, string>>(new Map())
  const [edgeStates, setEdgeStates] = useState<Map<string, string>>(new Map())
  const [matchedEdges, setMatchedEdges] = useState<[number, number][]>([])
  const [bfsQueue, setBfsQueue] = useState<number[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const timerRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const { nodes: n } = buildDefaultGraph()
    setNodes(n)
    const initStates = new Map<number, string>()
    for (const node of n) initStates.set(node.id, 'free')
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
    setMatchedEdges([])
    setBfsQueue([])
    setEdgeStates(new Map())
    const { nodes: n } = buildDefaultGraph()
    setNodes(n)
    const initStates = new Map<number, string>()
    for (const node of n) initStates.set(node.id, 'free')
    setNodeStates(initStates)
    setDescription('已重置，点击「开始」按钮')
  }, [clearTimer])

  const handleStart = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setCurrentStep(-1)

    const uSet = nodes.filter(n => n.group === 'U').map(n => n.id)
    const vSet = nodes.filter(n => n.group === 'V').map(n => n.id)
    const generatedSteps = generateSteps(adjList, uSet, vSet)

    setSteps(generatedSteps)

    if (generatedSteps.length > 0) {
      const first = generatedSteps[0]
      setNodeStates(first.nodeStates)
      setEdgeStates(first.edgeStates)
      setMatchedEdges(first.matchedEdges)
      setBfsQueue(first.bfsQueue)
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
        setMatchedEdges(step.matchedEdges)
        setBfsQueue(step.bfsQueue)
        setDescription(step.description)
        setCurrentStep(stepIdx)
      }, speed)
    }
  }, [adjList, edges, nodes, speed, clearTimer])

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
        setMatchedEdges(step.matchedEdges)
        setBfsQueue(step.bfsQueue)
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
    setMatchedEdges(step.matchedEdges)
    setBfsQueue(step.bfsQueue)
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
    setMatchedEdges(step.matchedEdges)
    setBfsQueue(step.bfsQueue)
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
            <filter id="hkGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 集合标签 */}
          <text x={120} y={30} textAnchor="middle" fill="var(--text-secondary)" fontSize="14" fontWeight="600">
            集合 U
          </text>
          <text x={520} y={30} textAnchor="middle" fill="var(--text-secondary)" fontSize="14" fontWeight="600">
            集合 V
          </text>

          {/* 分隔线 */}
          <line x1={320} y1={30} x2={320} y2={SVG_HEIGHT - 20} stroke="var(--border)" strokeWidth={1} strokeDasharray="6,4" strokeOpacity={0.4} />

          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = nodeMap.get(edge.from)
            const toNode = nodeMap.get(edge.to)
            if (!fromNode || !toNode) return null
            const eKey = edgeKey(edge.from, edge.to)
            const eState = edgeStates.get(eKey) || 'normal'

            let strokeColor = 'var(--border)'
            let strokeWidth = 1.5
            let strokeOpacity = 0.4
            let strokeDasharray = ''

            if (eState === 'matched') {
              strokeColor = '#22c55e'
              strokeWidth = 3.5
              strokeOpacity = 0.9
            } else if (eState === 'augmenting') {
              strokeColor = '#f59e0b'
              strokeWidth = 3
              strokeOpacity = 0.9
              strokeDasharray = '6,3'
            } else if (eState === 'bfs-tree') {
              strokeColor = '#a855f7'
              strokeWidth = 2
              strokeOpacity = 0.7
            } else if (eState === 'layer-edge') {
              strokeColor = '#3b82f6'
              strokeWidth = 2
              strokeOpacity = 0.6
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
            const state = nodeStates.get(node.id) || 'free'
            const colors = NODE_COLOR_MAP[state] || NODE_COLOR_MAP.free
            const isCurrent = bfsQueue.includes(node.id)

            return (
              <g
                key={node.id}
                filter={isCurrent ? 'url(#hkGlow)' : undefined}
                style={{ cursor: 'grab' }}
                onMouseDown={e => handleMouseDown(node.id, e)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={state === 'current' ? 3 : isCurrent ? 2.5 : 2}
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
            <circle cx={0} cy={0} r={7} fill={NODE_COLOR_MAP.free.fill} stroke={NODE_COLOR_MAP.free.stroke} strokeWidth={1.5} />
            <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">未匹配</text>
            <circle cx={70} cy={0} r={7} fill={NODE_COLOR_MAP.matched.fill} stroke={NODE_COLOR_MAP.matched.stroke} strokeWidth={1.5} />
            <text x={82} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">已匹配</text>
            <circle cx={150} cy={0} r={7} fill={NODE_COLOR_MAP.current.fill} stroke={NODE_COLOR_MAP.current.stroke} strokeWidth={1.5} />
            <text x={162} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">当前</text>
            <circle cx={210} cy={0} r={7} fill={NODE_COLOR_MAP.layered.fill} stroke={NODE_COLOR_MAP.layered.stroke} strokeWidth={1.5} />
            <text x={222} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">BFS分层</text>
            <line x1={300} y1={0} x2={330} y2={0} stroke="#22c55e" strokeWidth={3} />
            <text x={335} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">匹配边</text>
            <line x1={390} y1={0} x2={420} y2={0} stroke="#f59e0b" strokeWidth={3} strokeDasharray="6,3" />
            <text x={425} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">增广路</text>
          </g>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>当前匹配</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            {matchedEdges.length > 0
              ? matchedEdges.map(([u, v]) => {
                  const names = new Map([[0,'A'],[1,'B'],[2,'C'],[3,'D'],[4,'1'],[5,'2'],[6,'3'],[7,'4']])
                  return `${names.get(u)}-${names.get(v)}`
                }).join(', ')
              : '无'}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>BFS 队列</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            {bfsQueue.length > 0
              ? `[${bfsQueue.map(id => {
                  const names = new Map([[0,'A'],[1,'B'],[2,'C'],[3,'D'],[4,'1'],[5,'2'],[6,'3'],[7,'4']])
                  return names.get(id)
                }).join(', ')}]`
              : '空'}
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
