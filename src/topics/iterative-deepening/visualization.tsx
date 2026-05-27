import { useState, useEffect, useRef, useCallback } from 'react'

interface TreeNode {
  id: number
  name: string
  children: number[]
  x: number
  y: number
}

interface AnimationStep {
  description: string
  visited: number[]
  current: number | null
  path: number[]
  depthLimit: number
  phase: 'search' | 'found' | 'complete' | 'reset'
}

const TREE_NODES: TreeNode[] = [
  { id: 0, name: 'A', children: [1, 2], x: 300, y: 40 },
  { id: 1, name: 'B', children: [3, 4], x: 160, y: 120 },
  { id: 2, name: 'C', children: [5, 6], x: 440, y: 120 },
  { id: 3, name: 'D', children: [7, 8], x: 80, y: 200 },
  { id: 4, name: 'E', children: [9], x: 240, y: 200 },
  { id: 5, name: 'F', children: [10, 11], x: 360, y: 200 },
  { id: 6, name: 'G', children: [12], x: 520, y: 200 },
  { id: 7, name: 'H', children: [], x: 40, y: 280 },
  { id: 8, name: 'I', children: [], x: 120, y: 280 },
  { id: 9, name: 'J', children: [], x: 240, y: 280 },
  { id: 10, name: 'K', children: [], x: 320, y: 280 },
  { id: 11, name: 'L', children: [], x: 400, y: 280 },
  { id: 12, name: 'M', children: [], x: 520, y: 280 },
]

const TARGET_NODE = 10 // K

function getNodeDepth(nodeId: number): number {
  const depths: Record<number, number> = { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 2, 6: 2, 7: 3, 8: 3, 9: 3, 10: 3, 11: 3, 12: 3 }
  return depths[nodeId] ?? 0
}

function generateStepsForDepthLimit(limit: number, _allVisited: number[]): AnimationStep[] {
  const steps: AnimationStep[] = []
  const visited: number[] = []
  const path: number[] = []

  function dfs(nodeId: number, depth: number): boolean {
    visited.push(nodeId)
    path.push(nodeId)
    steps.push({
      description: `深度限制=${limit}，访问节点 ${TREE_NODES[nodeId].name}（深度 ${getNodeDepth(nodeId)}）`,
      visited: [...visited],
      current: nodeId,
      path: [...path],
      depthLimit: limit,
      phase: 'search',
    })

    if (nodeId === TARGET_NODE) {
      steps.push({
        description: `找到目标节点 ${TREE_NODES[TARGET_NODE].name}！路径: ${path.map(id => TREE_NODES[id].name).join(' -> ')}`,
        visited: [...visited],
        current: nodeId,
        path: [...path],
        depthLimit: limit,
        phase: 'found',
      })
      return true
    }

    if (depth >= limit) {
      path.pop()
      return false
    }

    for (const childId of TREE_NODES[nodeId].children) {
      if (dfs(childId, depth + 1)) return true
    }

    path.pop()
    return false
  }

  dfs(0, 0)
  return steps
}

export default function IterativeDeepeningVisualization() {
  const [visited, setVisited] = useState<number[]>([])
  const [currentNode, setCurrentNode] = useState<number | null>(null)
  const [path, setPath] = useState<number[]>([])
  const [depthLimit, setDepthLimit] = useState(0)
  const [description, setDescription] = useState<string>('迭代加深搜索 - 点击「开始搜索」观察过程')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [allSteps, setAllSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'searching' | 'found'>('idle')
  const timerRef = useRef<number | null>(null)

  const generateAllSteps = useCallback(() => {
    const allSteps: AnimationStep[] = []

    for (let limit = 0; limit <= 3; limit++) {
      if (limit > 0) {
        allSteps.push({
          description: `第 ${limit + 1} 次迭代：增加深度限制到 ${limit}`,
          visited: [],
          current: null,
          path: [],
          depthLimit: limit,
          phase: 'reset',
        })
      }

      const limitSteps = generateStepsForDepthLimit(limit, [])
      allSteps.push(...limitSteps)

      const found = limitSteps.some(s => s.phase === 'found')
      if (found) break

      allSteps.push({
        description: `深度限制=${limit} 未找到目标，准备增加深度`,
        visited: [],
        current: null,
        path: [],
        depthLimit: limit,
        phase: 'complete',
      })
    }

    return allSteps
  }, [])

  useEffect(() => {
    if (!isPlaying || allSteps.length === 0) return
    if (currentStep >= allSteps.length) {
      setIsPlaying(false)
      return
    }

    const step = allSteps[currentStep]
    timerRef.current = window.setTimeout(() => {
      if (step.phase === 'reset') {
        setVisited([])
        setCurrentNode(null)
        setPath([])
      } else {
        setVisited(step.visited)
        setCurrentNode(step.current)
        setPath(step.path)
      }
      setDepthLimit(step.depthLimit)
      setDescription(step.description)
      setPhase(step.phase === 'found' ? 'found' : step.phase === 'complete' ? 'idle' : 'searching')
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, allSteps, speed])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const steps = generateAllSteps()
    setAllSteps(steps)
    setCurrentStep(0)
    setIsPlaying(true)
    setVisited([])
    setCurrentNode(null)
    setPath([])
    setDepthLimit(0)
    setPhase('searching')
    setDescription('开始迭代加深搜索...')
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (allSteps.length > 0 && currentStep < allSteps.length) {
      setIsPlaying(true)
    }
  }

  const handleStep = () => {
    if (allSteps.length === 0) {
      const steps = generateAllSteps()
      setAllSteps(steps)
      setCurrentStep(0)
    }

    if (currentStep < allSteps.length) {
      setIsPlaying(false)
      const step = allSteps[currentStep] || generateAllSteps()[0]
      if (step) {
        if (step.phase === 'reset') {
          setVisited([])
          setCurrentNode(null)
          setPath([])
        } else {
          setVisited(step.visited)
          setCurrentNode(step.current)
          setPath(step.path)
        }
        setDepthLimit(step.depthLimit)
        setDescription(step.description)
        setPhase(step.phase === 'found' ? 'found' : step.phase === 'complete' ? 'idle' : 'searching')
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setVisited([])
    setCurrentNode(null)
    setPath([])
    setDepthLimit(0)
    setDescription('迭代加深搜索 - 点击「开始搜索」观察过程')
    setPhase('idle')
    setAllSteps([])
    setCurrentStep(0)
  }

  const getNodeColor = (nodeId: number): string => {
    if (nodeId === TARGET_NODE && phase === 'found') return '#f59e0b'
    if (nodeId === currentNode) return '#3b82f6'
    if (path.includes(nodeId)) return '#22c55e'
    if (visited.includes(nodeId)) return '#6b7280'
    return 'var(--bg-card)'
  }

  const getNodeBorder = (nodeId: number): string => {
    if (nodeId === TARGET_NODE && phase === 'found') return '#fbbf24'
    if (nodeId === currentNode) return '#60a5fa'
    if (path.includes(nodeId)) return '#4ade80'
    if (visited.includes(nodeId)) return '#9ca3af'
    return 'var(--border)'
  }

  const isNodeVisible = (nodeId: number): boolean => {
    return getNodeDepth(nodeId) <= depthLimit || visited.includes(nodeId) || phase === 'found'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始搜索
        </button>
        <button className="btn btn-primary" onClick={handleStep}>
          单步执行
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={allSteps.length === 0 || currentStep >= allSteps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="100"
            max="1500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        <svg width={600} height={340}>
          <defs>
            <marker id="arrow-ids" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
          </defs>

          {/* Draw edges */}
          {TREE_NODES.map(node =>
            node.children.map(childId => {
              const child = TREE_NODES[childId]
              if (!isNodeVisible(node.id) || !isNodeVisible(childId)) return null
              const inPath = path.includes(node.id) && path.includes(childId) &&
                Math.abs(path.indexOf(node.id) - path.indexOf(childId)) === 1
              return (
                <line
                  key={`${node.id}-${childId}`}
                  x1={node.x}
                  y1={node.y + 20}
                  x2={child.x}
                  y2={child.y - 20}
                  stroke={inPath ? '#22c55e' : 'var(--text-secondary)'}
                  strokeWidth={inPath ? 3 : 1.5}
                  opacity={isNodeVisible(childId) ? 1 : 0.2}
                />
              )
            })
          )}

          {/* Draw nodes */}
          {TREE_NODES.map(node => {
            if (!isNodeVisible(node.id)) return null
            const isTarget = node.id === TARGET_NODE
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  fill={getNodeColor(node.id)}
                  stroke={getNodeBorder(node.id)}
                  strokeWidth={node.id === currentNode ? 3 : isTarget ? 2.5 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  fill="var(--text-primary)"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.name}
                </text>
                {isTarget && (
                  <text
                    x={node.x}
                    y={node.y - 28}
                    fill="#f59e0b"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    目标
                  </text>
                )}
              </g>
            )
          })}

          {/* Depth limit indicator */}
          <text x={10} y={330} fill="var(--text-secondary)" fontSize="12" fontFamily="Consolas, Monaco, monospace">
            深度限制: {depthLimit}
          </text>
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前访问
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前路径
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#6b7280', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已访问
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          找到目标
        </span>
      </div>
    </div>
  )
}
