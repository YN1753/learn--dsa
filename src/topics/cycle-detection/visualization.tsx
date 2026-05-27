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

type NodeColor = 'white' | 'gray' | 'black' | 'found'

interface AnimationStep {
  description: string
  nodeColors: Map<number, NodeColor>
  highlightEdge: [number, number] | null
  stack: number[]
}

const NODES: GraphNode[] = [
  { id: 0, x: 200, y: 80 },
  { id: 1, x: 380, y: 80 },
  { id: 2, x: 380, y: 240 },
  { id: 3, x: 200, y: 240 },
  { id: 4, x: 290, y: 320 },
]

const EDGES: GraphEdge[] = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 0 },
  { from: 2, to: 4 },
]

export default function CycleDetectionVisualization() {
  const [nodeColors, setNodeColors] = useState<Map<number, NodeColor>>(
    new Map(NODES.map(n => [n.id, 'white']))
  )
  const [highlightEdge, setHighlightEdge] = useState<[number, number] | null>(null)
  const [stack, setStack] = useState<number[]>([])
  const [description, setDescription] = useState<string>('点击「开始检测」观察DFS三色标记法')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<number | null>(null)

  const buildSteps = useCallback((): AnimationStep[] => {
    const result: AnimationStep[] = []
    const adj: number[][] = NODES.map(() => [])
    for (const e of EDGES) {
      adj[e.from].push(e.to)
    }

    const colors = new Map<number, NodeColor>(NODES.map(n => [n.id, 'white']))
    const dfsStack: number[] = []

    result.push({
      description: '初始化：所有节点为白色（未访问）',
      nodeColors: new Map(colors),
      highlightEdge: null,
      stack: [],
    })

    function dfs(u: number): boolean {
      colors.set(u, 'gray')
      dfsStack.push(u)

      result.push({
        description: `访问节点 ${u}，标记为灰色（访问中），加入递归栈`,
        nodeColors: new Map(colors),
        highlightEdge: null,
        stack: [...dfsStack],
      })

      for (const v of adj[u]) {
        result.push({
          description: `检查邻居节点 ${v}，当前颜色: ${colors.get(v) === 'white' ? '白色' : colors.get(v) === 'gray' ? '灰色' : '黑色'}`,
          nodeColors: new Map(colors),
          highlightEdge: [u, v],
          stack: [...dfsStack],
        })

        if (colors.get(v) === 'gray') {
          colors.set(v, 'found')
          result.push({
            description: `节点 ${v} 为灰色（在栈中）！发现回边 ${u}->${v}，存在环！`,
            nodeColors: new Map(colors),
            highlightEdge: [u, v],
            stack: [...dfsStack],
          })
          return true
        }

        if (colors.get(v) === 'white') {
          if (dfs(v)) return true
        } else {
          result.push({
            description: `节点 ${v} 为黑色（已完成），跳过`,
            nodeColors: new Map(colors),
            highlightEdge: null,
            stack: [...dfsStack],
          })
        }
      }

      colors.set(u, 'black')
      dfsStack.pop()
      result.push({
        description: `节点 ${u} 处理完成，标记为黑色（已完成），出栈`,
        nodeColors: new Map(colors),
        highlightEdge: null,
        stack: [...dfsStack],
      })
      return false
    }

    const found = dfs(0)
    if (found) {
      result.push({
        description: '检测完成：图中存在环！',
        nodeColors: new Map(colors),
        highlightEdge: null,
        stack: [],
      })
    } else {
      result.push({
        description: '检测完成：图中无环',
        nodeColors: new Map(colors),
        highlightEdge: null,
        stack: [],
      })
    }

    return result
  }, [])

  const handleStart = useCallback(() => {
    const animationSteps = buildSteps()
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [buildSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setNodeColors(step.nodeColors)
      setHighlightEdge(step.highlightEdge)
      setStack(step.stack)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStep = useCallback(() => {
    if (steps.length === 0) {
      const animationSteps = buildSteps()
      setSteps(animationSteps)
      setCurrentStep(0)
      if (animationSteps.length > 0) {
        const step = animationSteps[0]
        setNodeColors(step.nodeColors)
        setHighlightEdge(step.highlightEdge)
        setStack(step.stack)
        setDescription(step.description)
        setCurrentStep(1)
      }
      return
    }
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setNodeColors(step.nodeColors)
      setHighlightEdge(step.highlightEdge)
      setStack(step.stack)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }
  }, [steps, currentStep, buildSteps])

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setNodeColors(new Map(NODES.map(n => [n.id, 'white'])))
    setHighlightEdge(null)
    setStack([])
    setDescription('点击「开始检测」观察DFS三色标记法')
    setSteps([])
    setCurrentStep(0)
  }

  const getNodeFill = (id: number): string => {
    const color = nodeColors.get(id) ?? 'white'
    switch (color) {
      case 'gray': return '#6b7280'
      case 'black': return '#1f2937'
      case 'found': return '#ef4444'
      default: return 'var(--bg-card)'
    }
  }

  const getNodeStroke = (id: number): string => {
    const color = nodeColors.get(id) ?? 'white'
    switch (color) {
      case 'gray': return '#9ca3af'
      case 'black': return '#4b5563'
      case 'found': return '#f87171'
      default: return 'var(--border)'
    }
  }

  const getNodeTextColor = (id: number): string => {
    const color = nodeColors.get(id) ?? 'white'
    switch (color) {
      case 'black': return '#ffffff'
      case 'found': return '#ffffff'
      default: return 'var(--text-primary)'
    }
  }

  const getEdgeStroke = (from: number, to: number): string => {
    if (highlightEdge && highlightEdge[0] === from && highlightEdge[1] === to) {
      const targetColor = nodeColors.get(to)
      if (targetColor === 'gray' || targetColor === 'found') return '#ef4444'
      return '#3b82f6'
    }
    return 'var(--text-secondary)'
  }

  const getEdgeStrokeWidth = (from: number, to: number): number => {
    if (highlightEdge && highlightEdge[0] === from && highlightEdge[1] === to) return 3
    return 1.5
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始检测
        </button>
        <button className="btn btn-primary" onClick={handleStep}>
          单步执行
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
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
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        <svg width="100%" viewBox="0 0 600 420">
          <defs>
            <marker id="arrowhead-cycle" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
            <marker id="arrowhead-cycle-highlight" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
            <marker id="arrowhead-cycle-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
          </defs>

          {EDGES.map((edge, i) => {
            const fromNode = NODES[edge.from]
            const toNode = NODES[edge.to]
            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const nodeRadius = 28
            const offsetX = (dx / dist) * nodeRadius
            const offsetY = (dy / dist) * nodeRadius
            const isHighlighted = highlightEdge && highlightEdge[0] === edge.from && highlightEdge[1] === edge.to
            const edgeStroke = getEdgeStroke(edge.from, edge.to)
            const markerId = isHighlighted
              ? (nodeColors.get(edge.to) === 'gray' || nodeColors.get(edge.to) === 'found'
                ? 'arrowhead-cycle-red'
                : 'arrowhead-cycle-highlight')
              : 'arrowhead-cycle'

            return (
              <line
                key={i}
                x1={fromNode.x + offsetX}
                y1={fromNode.y + offsetY}
                x2={toNode.x - offsetX}
                y2={toNode.y - offsetY}
                stroke={edgeStroke}
                strokeWidth={getEdgeStrokeWidth(edge.from, edge.to)}
                markerEnd={`url(#${markerId})`}
              />
            )
          })}

          {NODES.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={28}
                fill={getNodeFill(node.id)}
                stroke={getNodeStroke(node.id)}
                strokeWidth={node.id === (highlightEdge ? highlightEdge[1] : -1) ? 3 : 2}
              />
              <text
                x={node.x}
                y={node.y + 5}
                fill={getNodeTextColor(node.id)}
                fontSize="16"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                {node.id}
              </text>
            </g>
          ))}

          {stack.length > 0 && (
            <g>
              <text x="20" y="390" fill="var(--text-secondary)" fontSize="12" fontFamily="Consolas, Monaco, monospace">
                递归栈:
              </text>
              {stack.map((id, i) => (
                <g key={i}>
                  <rect
                    x={80 + i * 40}
                    y={375}
                    width={35}
                    height={25}
                    rx="4"
                    fill="#6b7280"
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                  <text
                    x={97 + i * 40}
                    y={392}
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {id}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          白色(未访问)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#6b7280', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          灰色(访问中)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#1f2937', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          黑色(已完成)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          发现环
        </span>
      </div>
    </div>
  )
}
