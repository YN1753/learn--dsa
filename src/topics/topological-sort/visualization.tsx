import { useState, useEffect, useRef, useCallback } from 'react'

// Types
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

interface TopoStep {
  description: string
  inDegree: number[]
  queue: number[]
  result: number[]
  currentNode: number
  removedEdges: [number, number][]
  processedNodes: number[]
  inQueue: number[]
}

// Example graphs
const graphExamples: Record<string, { nodes: GraphNode[]; edges: GraphEdge[]; name: string }> = {
  courses: {
    name: '课程依赖',
    nodes: [
      { id: 0, label: '数学', x: 80, y: 60 },
      { id: 1, label: '线性代数', x: 240, y: 60 },
      { id: 2, label: '概率论', x: 80, y: 200 },
      { id: 3, label: '程序设计', x: 400, y: 60 },
      { id: 4, label: '机器学习', x: 400, y: 200 },
      { id: 5, label: '统计学', x: 240, y: 200 },
      { id: 6, label: '数据结构', x: 550, y: 130 },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 4 },
      { from: 2, to: 5 },
      { from: 5, to: 4 },
      { from: 3, to: 6 },
      { from: 6, to: 4 },
    ],
  },
  tasks: {
    name: '任务调度',
    nodes: [
      { id: 0, label: 'A', x: 80, y: 60 },
      { id: 1, label: 'B', x: 220, y: 60 },
      { id: 2, label: 'C', x: 80, y: 200 },
      { id: 3, label: 'D', x: 360, y: 60 },
      { id: 4, label: 'E', x: 220, y: 200 },
      { id: 5, label: 'F', x: 360, y: 200 },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
    ],
  },
  build: {
    name: '构建依赖',
    nodes: [
      { id: 0, label: 'main', x: 80, y: 130 },
      { id: 1, label: 'utils', x: 240, y: 60 },
      { id: 2, label: 'config', x: 240, y: 200 },
      { id: 3, label: 'core', x: 400, y: 60 },
      { id: 4, label: 'db', x: 400, y: 200 },
      { id: 5, label: 'app', x: 560, y: 130 },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
    ],
  },
}

// Generate Kahn's algorithm steps
function generateKahnSteps(nodes: GraphNode[], edges: GraphEdge[]): TopoStep[] {
  const n = nodes.length
  const steps: TopoStep[] = []
  const inDegree = new Array(n).fill(0)

  for (const edge of edges) {
    inDegree[edge.to]++
  }

  // Initial state
  const initialQueue: number[] = []
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) initialQueue.push(i)
  }

  steps.push({
    description: '初始化：计算所有节点的入度',
    inDegree: [...inDegree],
    queue: [...initialQueue],
    result: [],
    currentNode: -1,
    removedEdges: [],
    processedNodes: [],
    inQueue: [...initialQueue],
  })

  const currentInDegree = [...inDegree]
  const queue: number[] = [...initialQueue]
  const result: number[] = []
  const processed: number[] = []
  const removed: [number, number][] = []

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    processed.push(node)

    steps.push({
      description: `取出节点 ${nodes[node].label}（入度为 0），加入结果`,
      inDegree: [...currentInDegree],
      queue: [...queue],
      result: [...result],
      currentNode: node,
      removedEdges: [...removed],
      processedNodes: [...processed],
      inQueue: [...queue],
    })

    // Find neighbors and update in-degree
    const neighbors = edges.filter(e => e.from === node)
    for (const edge of neighbors) {
      currentInDegree[edge.to]--
      removed.push([edge.from, edge.to])

      if (currentInDegree[edge.to] === 0) {
        queue.push(edge.to)
      }

      steps.push({
        description: `移除边 ${nodes[edge.from].label}→${nodes[edge.to].label}，${nodes[edge.to].label} 入度 ${currentInDegree[edge.to] + 1}→${currentInDegree[edge.to]}${currentInDegree[edge.to] === 0 ? '（入度为 0，加入队列）' : ''}`,
        inDegree: [...currentInDegree],
        queue: [...queue],
        result: [...result],
        currentNode: node,
        removedEdges: [...removed],
        processedNodes: [...processed],
        inQueue: [...queue],
      })
    }
  }

  if (result.length < n) {
    steps.push({
      description: `排序完成，但结果长度 ${result.length} < 节点数 ${n}，图中存在环！`,
      inDegree: [...currentInDegree],
      queue: [],
      result: [...result],
      currentNode: -1,
      removedEdges: [...removed],
      processedNodes: [...processed],
      inQueue: [],
    })
  } else {
    steps.push({
      description: `拓扑排序完成！结果: [${result.map(i => nodes[i].label).join(', ')}]`,
      inDegree: [...currentInDegree],
      queue: [],
      result: [...result],
      currentNode: -1,
      removedEdges: [...removed],
      processedNodes: [...processed],
      inQueue: [],
    })
  }

  return steps
}

// SVG arrow marker
const ArrowMarker = () => (
  <defs>
    <marker
      id="arrowhead"
      markerWidth="10"
      markerHeight="7"
      refX="10"
      refY="3.5"
      orient="auto"
    >
      <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
    </marker>
    <marker
      id="arrowhead-active"
      markerWidth="10"
      markerHeight="7"
      refX="10"
      refY="3.5"
      orient="auto"
    >
      <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent)" />
    </marker>
    <marker
      id="arrowhead-removed"
      markerWidth="10"
      markerHeight="7"
      refX="10"
      refY="3.5"
      orient="auto"
    >
      <polygon points="0 0, 10 3.5, 0 7" fill="var(--error)" opacity="0.4" />
    </marker>
  </defs>
)

export default function TopologicalSortVisualization() {
  const [graphKey, setGraphKey] = useState<string>('courses')
  const [steps, setSteps] = useState<TopoStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const graph = graphExamples[graphKey]

  // Generate steps
  const regenerateSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newSteps = generateKahnSteps(graph.nodes, graph.edges)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [graph])

  // Initialize
  useEffect(() => {
    regenerateSteps()
  }, [regenerateSteps])

  // Auto-play
  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, speed)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, steps, speed])

  const togglePlay = useCallback(() => {
    if (steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }, [steps, currentStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const current = steps[currentStep] || steps[0] || {
    description: '点击播放开始演示',
    inDegree: new Array(graph.nodes.length).fill(0),
    queue: [],
    result: [],
    currentNode: -1,
    removedEdges: [],
    processedNodes: [],
    inQueue: [],
  }

  // Compute edge positions with offset to avoid overlapping with node circles
  const getEdgePoints = (from: GraphNode, to: GraphNode) => {
    const dx = to.x - from.x
    const dy = to.y - from.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const nodeRadius = 22
    const offset = nodeRadius + 8 // arrow tip offset
    return {
      x1: from.x + (dx / dist) * nodeRadius,
      y1: from.y + (dy / dist) * nodeRadius,
      x2: to.x - (dx / dist) * offset,
      y2: to.y - (dy / dist) * offset,
    }
  }

  const isEdgeRemoved = (from: number, to: number) => {
    return current.removedEdges.some(([f, t]) => f === from && t === to)
  }

  const isEdgeActive = (from: number, to: number) => {
    if (current.currentNode === -1) return false
    return from === current.currentNode && !isEdgeRemoved(from, to)
  }

  const getNodeColor = (nodeId: number): string => {
    if (current.currentNode === nodeId) return 'var(--accent)'
    if (current.processedNodes.includes(nodeId)) return 'var(--success)'
    if (current.inQueue.includes(nodeId)) return 'var(--warning)'
    return 'var(--bg-card)'
  }

  return (
    <div className="visualization-container">
      {/* Graph selector */}
      <div className="viz-controls">
        <select
          value={graphKey}
          onChange={e => {
            setGraphKey(e.target.value)
            setIsPlaying(false)
            if (timerRef.current) {
              clearTimeout(timerRef.current)
              timerRef.current = null
            }
          }}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        >
          {Object.entries(graphExamples).map(([key, g]) => (
            <option key={key} value={key}>{g.name}</option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={regenerateSteps}>
          重新生成
        </button>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={() => { setIsPlaying(false); setCurrentStep(0) }}>
          重置
        </button>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          速度:
          <input
            type="range"
            min="200"
            max="2000"
            step="100"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          {speed}ms
        </label>
      </div>

      {/* Progress bar */}
      {steps.length > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 0.25rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
            {currentStep + 1}/{steps.length}
          </span>
          <input
            type="range"
            min="0"
            max={steps.length - 1}
            value={currentStep}
            onChange={e => {
              setIsPlaying(false)
              setCurrentStep(Number(e.target.value))
            }}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* SVG Graph */}
      <div
        className="viz-canvas"
        style={{
          display: 'flex',
          justifyContent: 'center',
          minHeight: '300px',
          padding: '1rem',
        }}
      >
        <svg width="640" height="280" viewBox="0 0 640 280">
          <ArrowMarker />

          {/* Edges */}
          {graph.edges.map((edge, idx) => {
            const from = graph.nodes[edge.from]
            const to = graph.nodes[edge.to]
            const pts = getEdgePoints(from, to)
            const removed = isEdgeRemoved(edge.from, edge.to)
            const active = isEdgeActive(edge.from, edge.to)

            return (
              <line
                key={`edge-${idx}`}
                x1={pts.x1}
                y1={pts.y1}
                x2={pts.x2}
                y2={pts.y2}
                stroke={removed ? 'var(--error)' : active ? 'var(--accent)' : 'var(--text-secondary)'}
                strokeWidth={active ? 2.5 : 1.5}
                opacity={removed ? 0.3 : 1}
                markerEnd={removed ? 'url(#arrowhead-removed)' : active ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}

          {/* Nodes */}
          {graph.nodes.map(node => {
            const isProcessed = current.processedNodes.includes(node.id)
            const isCurrent = current.currentNode === node.id
            const inQueue = current.inQueue.includes(node.id)
            const inDeg = current.inDegree[node.id]

            return (
              <g key={node.id}>
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  fill={getNodeColor(node.id)}
                  stroke={isCurrent ? 'var(--accent-hover)' : isProcessed ? 'var(--success)' : inQueue ? 'var(--warning)' : 'var(--border)'}
                  strokeWidth={isCurrent ? 3 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Node label */}
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill={isCurrent || isProcessed ? '#fff' : 'var(--text-primary)'}
                >
                  {node.label}
                </text>
                {/* In-degree badge */}
                <g>
                  <rect
                    x={node.x + 14}
                    y={node.y - 30}
                    width={18}
                    height={16}
                    rx={4}
                    fill={inDeg === 0 && !isProcessed ? 'var(--warning)' : 'var(--bg-secondary)'}
                    stroke="var(--border)"
                    strokeWidth={1}
                  />
                  <text
                    x={node.x + 23}
                    y={node.y - 21}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill={inDeg === 0 && !isProcessed ? '#fff' : 'var(--text-secondary)'}
                  >
                    {inDeg}
                  </text>
                </g>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          padding: '0.25rem 0',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} />
          当前节点
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
          已完成
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--warning)', borderRadius: '50%', display: 'inline-block' }} />
          在队列中
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: 'var(--error)', borderRadius: '2px', display: 'inline-block', opacity: 0.5 }} />
          已移除的边
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '16px', height: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '3px', display: 'inline-block', fontSize: '9px', textAlign: 'center', lineHeight: '14px' }}>0</span>
          入度值
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <div>
            <strong>入度数组：</strong>
            [{current.inDegree.join(', ')}]
          </div>
          <div>
            <strong>队列：</strong>
            [{current.queue.map(i => graph.nodes[i]?.label).join(', ')}]
          </div>
          <div>
            <strong>结果：</strong>
            [{current.result.map(i => graph.nodes[i]?.label).join(', ')}]
          </div>
        </div>
      </div>
    </div>
  )
}
