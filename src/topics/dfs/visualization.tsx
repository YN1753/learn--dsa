import { useState, useEffect, useRef, useCallback } from 'react'

interface GraphNode {
  id: number
  x: number
  y: number
}

interface GraphEdge {
  from: number
  to: number
}

type NodeState = 'unvisited' | 'inStack' | 'current' | 'visited'

interface StepSnapshot {
  states: Map<number, NodeState>
  stack: number[]
  description: string
  traversalOrder: number[]
}

const SVG_WIDTH = 780
const SVG_HEIGHT = 420
const NODE_RADIUS = 26

function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[]; adjList: Map<number, number[]> } {
  const nodeData: [number, number, number][] = [
    [0, 100, 80],
    [1, 280, 50],
    [2, 100, 240],
    [3, 450, 80],
    [4, 280, 220],
    [5, 450, 240],
    [6, 620, 150],
  ]

  const edgePairs: [number, number][] = [
    [0, 1], [0, 2], [1, 2], [1, 3], [1, 4],
    [2, 4], [3, 5], [3, 6], [4, 5], [5, 6],
  ]

  const nodes: GraphNode[] = nodeData.map(([id, x, y]) => ({ id, x, y }))
  const edges: GraphEdge[] = edgePairs.map(([from, to]) => ({ from, to }))

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

function generateDFSSteps(adjList: Map<number, number[]>, start: number): StepSnapshot[] {
  const steps: StepSnapshot[] = []
  const visited = new Set<number>()
  const traversalOrder: number[] = []
  const allNodes = [...adjList.keys()]

  const makeStates = (current: number | null, stack: number[]): Map<number, NodeState> => {
    const states = new Map<number, NodeState>()
    for (const id of allNodes) {
      if (current !== null && id === current) states.set(id, 'current')
      else if (visited.has(id)) states.set(id, 'visited')
      else if (stack.includes(id)) states.set(id, 'inStack')
      else states.set(id, 'unvisited')
    }
    return states
  }

  // Initial step
  steps.push({
    states: makeStates(null, [start]),
    stack: [start],
    description: `初始化: 将起始节点 ${start} 压入栈中`,
    traversalOrder: [],
  })

  const stack: number[] = [start]

  while (stack.length > 0) {
    const node = stack.pop()!

    if (visited.has(node)) {
      steps.push({
        states: makeStates(null, stack),
        stack: [...stack],
        description: `节点 ${node} 已访问过，跳过`,
        traversalOrder: [...traversalOrder],
      })
      continue
    }

    visited.add(node)
    traversalOrder.push(node)

    steps.push({
      states: makeStates(node, stack),
      stack: [...stack],
      description: `弹栈并访问节点 ${node}`,
      traversalOrder: [...traversalOrder],
    })

    const neighbors = (adjList.get(node) || []).filter(n => !visited.has(n))
    for (let i = neighbors.length - 1; i >= 0; i--) {
      stack.push(neighbors[i])
    }

    if (neighbors.length > 0) {
      steps.push({
        states: makeStates(node, stack),
        stack: [...stack],
        description: `将邻居 [${neighbors.join(', ')}] 压入栈中`,
        traversalOrder: [...traversalOrder],
      })
    } else {
      steps.push({
        states: makeStates(null, stack),
        stack: [...stack],
        description: `节点 ${node} 没有未访问的邻居，回溯`,
        traversalOrder: [...traversalOrder],
      })
    }
  }

  // Final step
  steps.push({
    states: makeStates(null, []),
    stack: [],
    description: `DFS 遍历完成! 共访问 ${traversalOrder.length} 个节点`,
    traversalOrder: [...traversalOrder],
  })

  return steps
}

const NODE_COLORS: Record<NodeState, { fill: string; stroke: string; text: string }> = {
  unvisited: { fill: 'var(--bg-card)', stroke: 'var(--border)', text: 'var(--text-primary)' },
  inStack: { fill: 'rgba(245, 158, 11, 0.25)', stroke: '#f59e0b', text: '#f59e0b' },
  current: { fill: 'var(--accent)', stroke: '#60a5fa', text: '#ffffff' },
  visited: { fill: '#1e3a5f', stroke: 'var(--accent)', text: 'var(--accent)' },
}

export default function DFSVisualization() {
  const [graphData] = useState(() => buildGraph())
  const [nodes, setNodes] = useState<GraphNode[]>(graphData.nodes)
  const [adjList] = useState<Map<number, number[]>>(graphData.adjList)
  const [steps, setSteps] = useState<StepSnapshot[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('点击"开始"按钮观察 DFS 遍历过程')
  const [nodeStates, setNodeStates] = useState<Map<number, NodeState>>(new Map())
  const [stack, setStack] = useState<number[]>([])
  const [traversalOrder, setTraversalOrder] = useState<number[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const timerRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const initStates = new Map<number, NodeState>()
    for (const node of graphData.nodes) initStates.set(node.id, 'unvisited')
    setNodeStates(initStates)
  }, [graphData.nodes])

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
    setStack([])
    setTraversalOrder([])
    const initStates = new Map<number, NodeState>()
    for (const node of graphData.nodes) initStates.set(node.id, 'unvisited')
    setNodeStates(initStates)
    setDescription('已重置，点击"开始"按钮观察 DFS 遍历过程')
  }, [clearTimer, graphData.nodes])

  const applyStep = useCallback((step: StepSnapshot) => {
    setNodeStates(step.states)
    setStack(step.stack)
    setTraversalOrder(step.traversalOrder)
    setDescription(step.description)
  }, [])

  const handleStart = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setCurrentStep(-1)

    const generatedSteps = generateDFSSteps(adjList, 0)
    setSteps(generatedSteps)

    if (generatedSteps.length > 0) {
      const first = generatedSteps[0]
      applyStep(first)
      setCurrentStep(0)
      setIsPlaying(true)

      let stepIdx = 0
      timerRef.current = window.setInterval(() => {
        stepIdx++
        if (stepIdx >= generatedSteps.length) {
          clearTimer()
          setIsPlaying(false)
          return
        }
        applyStep(generatedSteps[stepIdx])
        setCurrentStep(stepIdx)
      }, speed)
    }
  }, [adjList, speed, clearTimer, applyStep])

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
          return
        }
        applyStep(steps[stepIdx])
        setCurrentStep(stepIdx)
      }, speed)
    }
  }, [isPlaying, steps, currentStep, speed, clearTimer, handleStart, applyStep])

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
            <filter id="dfsGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {graphData.edges.map((edge, i) => {
            const fromNode = nodeMap.get(edge.from)
            const toNode = nodeMap.get(edge.to)
            if (!fromNode || !toNode) return null
            const fromState = nodeStates.get(edge.from) || 'unvisited'
            const toState = nodeStates.get(edge.to) || 'unvisited'
            const bothVisited = fromState === 'visited' && toState === 'visited'
            const oneCurrent = fromState === 'current' || toState === 'current'
            return (
              <line
                key={i}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={bothVisited ? 'var(--accent)' : oneCurrent ? '#60a5fa' : 'var(--border)'}
                strokeWidth={bothVisited ? 2.5 : oneCurrent ? 2 : 1.5}
                strokeOpacity={0.6}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const state = nodeStates.get(node.id) || 'unvisited'
            const colors = NODE_COLORS[state]
            const isCurrent = state === 'current'

            return (
              <g
                key={node.id}
                filter={isCurrent ? 'url(#dfsGlow)' : undefined}
                style={{ cursor: 'grab' }}
                onMouseDown={e => handleMouseDown(node.id, e)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isCurrent ? 3 : 2}
                  style={{ transition: dragging === node.id ? 'none' : 'all 0.3s ease' }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={colors.text}
                  fontSize="14"
                  fontWeight="600"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ transition: dragging === node.id ? 'none' : 'fill 0.3s ease', pointerEvents: 'none' }}
                >
                  {node.id}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(15, ${SVG_HEIGHT - 30})`}>
            <circle cx={0} cy={0} r={7} fill={NODE_COLORS.unvisited.fill} stroke={NODE_COLORS.unvisited.stroke} strokeWidth={1.5} />
            <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">未访问</text>
            <circle cx={70} cy={0} r={7} fill={NODE_COLORS.inStack.fill} stroke={NODE_COLORS.inStack.stroke} strokeWidth={1.5} />
            <text x={82} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">在栈中</text>
            <circle cx={140} cy={0} r={7} fill={NODE_COLORS.current.fill} stroke={NODE_COLORS.current.stroke} strokeWidth={1.5} />
            <text x={152} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">当前节点</text>
            <circle cx={220} cy={0} r={7} fill={NODE_COLORS.visited.fill} stroke={NODE_COLORS.visited.stroke} strokeWidth={1.5} />
            <text x={232} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">已访问</text>
          </g>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>DFS 栈 (Stack)</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            {stack.length > 0 ? `[${stack.join(', ')}]` : '空'}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>遍历顺序</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            {traversalOrder.length > 0 ? traversalOrder.join(' -> ') : '等待开始...'}
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
