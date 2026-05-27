import { useState, useEffect, useRef, useCallback } from 'react'

interface GraphNode {
  id: number
  x: number
  y: number
  vx: number
  vy: number
}

interface GraphEdge {
  from: number
  to: number
}

type AlgorithmType = 'bfs' | 'dfs'
type NodeState = 'unvisited' | 'queued' | 'current' | 'visited'

interface StepSnapshot {
  states: Map<number, NodeState>
  container: number[]  // queue or stack contents
  description: string
  traversalOrder: number[]
}

const SVG_WIDTH = 780
const SVG_HEIGHT = 440
const NODE_RADIUS = 24

function buildDefaultGraph(): { nodes: GraphNode[]; edges: GraphEdge[]; adjList: Map<number, number[]> } {
  const nodePositions: [number, number, number][] = [
    [0, 150, 80],
    [1, 350, 60],
    [2, 200, 220],
    [3, 400, 200],
    [4, 550, 100],
    [5, 580, 260],
    [6, 350, 350],
  ]

  const edgePairs: [number, number][] = [
    [0, 1], [0, 2], [1, 2], [1, 3], [1, 4],
    [2, 3], [3, 5], [3, 6], [4, 5], [5, 6],
  ]

  const nodes: GraphNode[] = nodePositions.map(([id, x, y]) => ({ id, x, y, vx: 0, vy: 0 }))
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

function generateBFSSteps(adjList: Map<number, number[]>, start: number): StepSnapshot[] {
  const steps: StepSnapshot[] = []
  const visited = new Set<number>()
  const queue: number[] = [start]
  visited.add(start)
  const traversalOrder: number[] = []

  const initialStates = new Map<number, NodeState>()
  for (const id of adjList.keys()) initialStates.set(id, 'unvisited')
  initialStates.set(start, 'queued')
  steps.push({
    states: new Map(initialStates),
    container: [start],
    description: `初始化: 将起始节点 ${start} 入队`,
    traversalOrder: [],
  })

  while (queue.length > 0) {
    const node = queue.shift()!
    traversalOrder.push(node)

    const currentStates = new Map(steps[steps.length - 1].states)
    currentStates.set(node, 'current')
    for (const v of visited) {
      if (v !== node && currentStates.get(v) !== 'queued') currentStates.set(v, 'visited')
    }
    steps.push({
      states: new Map(currentStates),
      container: [...queue],
      description: `出队并访问节点 ${node}`,
      traversalOrder: [...traversalOrder],
    })

    const neighbors = adjList.get(node) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
        const newStates = new Map(steps[steps.length - 1].states)
        newStates.set(neighbor, 'queued')
        newStates.set(node, 'current')
        steps.push({
          states: newStates,
          container: [...queue],
          description: `发现邻居 ${neighbor}，入队`,
          traversalOrder: [...traversalOrder],
        })
      }
    }

    const afterStates = new Map(steps[steps.length - 1].states)
    afterStates.set(node, 'visited')
    for (const q of queue) afterStates.set(q, 'queued')
    steps.push({
      states: afterStates,
      container: [...queue],
      description: `节点 ${node} 处理完毕，标记为已访问`,
      traversalOrder: [...traversalOrder],
    })
  }

  return steps
}

function generateDFSSteps(adjList: Map<number, number[]>, start: number): StepSnapshot[] {
  const steps: StepSnapshot[] = []
  const visited = new Set<number>()
  const traversalOrder: number[] = []
  const stack: number[] = [start]

  const initialStates = new Map<number, NodeState>()
  for (const id of adjList.keys()) initialStates.set(id, 'unvisited')
  initialStates.set(start, 'queued')
  steps.push({
    states: new Map(initialStates),
    container: [start],
    description: `初始化: 将起始节点 ${start} 压栈`,
    traversalOrder: [],
  })

  while (stack.length > 0) {
    const node = stack.pop()!

    if (visited.has(node)) continue
    visited.add(node)
    traversalOrder.push(node)

    const currentStates = new Map<number, NodeState>()
    for (const id of adjList.keys()) {
      if (id === node) currentStates.set(id, 'current')
      else if (visited.has(id)) currentStates.set(id, 'visited')
      else if (stack.includes(id)) currentStates.set(id, 'queued')
      else currentStates.set(id, 'unvisited')
    }
    steps.push({
      states: currentStates,
      container: [...stack].reverse(),
      description: `弹栈并访问节点 ${node}`,
      traversalOrder: [...traversalOrder],
    })

    const neighbors = (adjList.get(node) || []).filter(n => !visited.has(n))
    for (const neighbor of [...neighbors].reverse()) {
      stack.push(neighbor)
    }

    if (neighbors.length > 0) {
      const pushStates = new Map<number, NodeState>()
      for (const id of adjList.keys()) {
        if (id === node) pushStates.set(id, 'current')
        else if (visited.has(id)) pushStates.set(id, 'visited')
        else if (stack.includes(id)) pushStates.set(id, 'queued')
        else pushStates.set(id, 'unvisited')
      }
      steps.push({
        states: pushStates,
        container: [...stack].reverse(),
        description: `将邻居 [${neighbors.join(', ')}] 压栈`,
        traversalOrder: [...traversalOrder],
      })
    }

    const doneStates = new Map<number, NodeState>()
    for (const id of adjList.keys()) {
      if (visited.has(id)) doneStates.set(id, 'visited')
      else if (stack.includes(id)) doneStates.set(id, 'queued')
      else doneStates.set(id, 'unvisited')
    }
    steps.push({
      states: doneStates,
      container: [...stack].reverse(),
      description: `节点 ${node} 处理完毕`,
      traversalOrder: [...traversalOrder],
    })
  }

  return steps
}

const NODE_COLORS: Record<NodeState, { fill: string; stroke: string; text: string }> = {
  unvisited: { fill: 'var(--bg-card)', stroke: 'var(--border)', text: 'var(--text-primary)' },
  queued: { fill: 'rgba(245, 158, 11, 0.3)', stroke: '#f59e0b', text: '#f59e0b' },
  current: { fill: 'var(--accent)', stroke: '#60a5fa', text: '#ffffff' },
  visited: { fill: '#1e3a5f', stroke: 'var(--accent)', text: 'var(--accent)' },
}

export default function GraphVisualization() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges] = useState<GraphEdge[]>([])
  const [adjList, setAdjList] = useState<Map<number, number[]>>(new Map())
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bfs')
  const [steps, setSteps] = useState<StepSnapshot[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('选择算法并点击"开始"按钮')
  const [nodeStates, setNodeStates] = useState<Map<number, NodeState>>(new Map())
  const [container, setContainer] = useState<number[]>([])
  const [traversalOrder, setTraversalOrder] = useState<number[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const timerRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const { nodes: n, adjList: adj } = buildDefaultGraph()
    setNodes(n)
    setAdjList(adj)
    const initStates = new Map<number, NodeState>()
    for (const node of n) initStates.set(node.id, 'unvisited')
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
    setContainer([])
    setTraversalOrder([])
    const initStates = new Map<number, NodeState>()
    for (const node of nodes) initStates.set(node.id, 'unvisited')
    setNodeStates(initStates)
    setDescription('已重置，选择算法并点击"开始"按钮')
  }, [clearTimer, nodes])

  const handleStart = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setCurrentStep(-1)

    const generatedSteps = algorithm === 'bfs'
      ? generateBFSSteps(adjList, 0)
      : generateDFSSteps(adjList, 0)

    setSteps(generatedSteps)

    if (generatedSteps.length > 0) {
      const first = generatedSteps[0]
      setNodeStates(first.states)
      setContainer(first.container)
      setTraversalOrder(first.traversalOrder)
      setDescription(first.description)
      setCurrentStep(0)
      setIsPlaying(true)

      let stepIdx = 0
      timerRef.current = window.setInterval(() => {
        stepIdx++
        if (stepIdx >= generatedSteps.length) {
          clearTimer()
          setIsPlaying(false)
          setDescription(`${algorithm === 'bfs' ? 'BFS' : 'DFS'} 遍历完成！共访问 ${generatedSteps[generatedSteps.length - 1].traversalOrder.length} 个节点`)
          return
        }
        const step = generatedSteps[stepIdx]
        setNodeStates(step.states)
        setContainer(step.container)
        setTraversalOrder(step.traversalOrder)
        setDescription(step.description)
        setCurrentStep(stepIdx)
      }, speed)
    }
  }, [algorithm, adjList, speed, clearTimer])

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
          setDescription(`${algorithm === 'bfs' ? 'BFS' : 'DFS'} 遍历完成！共访问 ${steps[steps.length - 1].traversalOrder.length} 个节点`)
          return
        }
        const step = steps[stepIdx]
        setNodeStates(step.states)
        setContainer(step.container)
        setTraversalOrder(step.traversalOrder)
        setDescription(step.description)
        setCurrentStep(stepIdx)
      }, speed)
    }
  }, [isPlaying, steps, currentStep, speed, algorithm, clearTimer, handleStart])

  const handleStepForward = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length - 1) return
    clearTimer()
    setIsPlaying(false)
    const nextStep = currentStep + 1
    const step = steps[nextStep]
    setNodeStates(step.states)
    setContainer(step.container)
    setTraversalOrder(step.traversalOrder)
    setDescription(step.description)
    setCurrentStep(nextStep)
  }, [steps, currentStep, clearTimer])

  const handleStepBackward = useCallback(() => {
    if (steps.length === 0 || currentStep <= 0) return
    clearTimer()
    setIsPlaying(false)
    const prevStep = currentStep - 1
    const step = steps[prevStep]
    setNodeStates(step.states)
    setContainer(step.container)
    setTraversalOrder(step.traversalOrder)
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
          value={algorithm}
          onChange={e => { setAlgorithm(e.target.value as AlgorithmType); handleReset() }}
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
          }}
        >
          <option value="bfs">BFS 广度优先搜索</option>
          <option value="dfs">DFS 深度优先搜索</option>
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
            <filter id="graphGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const fromNode = nodeMap.get(edge.from)
            const toNode = nodeMap.get(edge.to)
            if (!fromNode || !toNode) return null
            const fromState = nodeStates.get(edge.from) || 'unvisited'
            const toState = nodeStates.get(edge.to) || 'unvisited'
            const isHighlighted = fromState === 'visited' && toState === 'visited'
            return (
              <line
                key={i}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={isHighlighted ? 'var(--accent)' : 'var(--border)'}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
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
                filter={isCurrent ? 'url(#graphGlow)' : undefined}
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
          <g transform={`translate(15, ${SVG_HEIGHT - 35})`}>
            <circle cx={0} cy={0} r={7} fill={NODE_COLORS.unvisited.fill} stroke={NODE_COLORS.unvisited.stroke} strokeWidth={1.5} />
            <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">未访问</text>
            <circle cx={65} cy={0} r={7} fill={NODE_COLORS.queued.fill} stroke={NODE_COLORS.queued.stroke} strokeWidth={1.5} />
            <text x={77} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">已入队/栈</text>
            <circle cx={155} cy={0} r={7} fill={NODE_COLORS.current.fill} stroke={NODE_COLORS.current.stroke} strokeWidth={1.5} />
            <text x={167} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">当前节点</text>
            <circle cx={235} cy={0} r={7} fill={NODE_COLORS.visited.fill} stroke={NODE_COLORS.visited.stroke} strokeWidth={1.5} />
            <text x={247} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">已访问</text>
          </g>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>{algorithm === 'bfs' ? 'BFS 队列 (Queue)' : 'DFS 栈 (Stack)'}</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            {container.length > 0 ? `[${container.join(', ')}]` : '空'}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>遍历顺序</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            {traversalOrder.length > 0 ? traversalOrder.join(' → ') : '等待开始...'}
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
