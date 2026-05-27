import { useState, useEffect, useRef, useCallback } from 'react'

interface TreeNode {
  id: number
  value: number
  index: number
  left: number | null
  right: number | null
}

interface StackItem {
  nodeId: number
  value: number
}

interface AnimationStep {
  description: string
  nodes: TreeNode[]
  root: number | null
  stack: StackItem[]
  currentIdx: number
  highlightNodeId: number | null
  highlightType: 'push' | 'pop' | 'link' | 'done' | 'none'
  removedNodeIds: number[]
}

const INITIAL_ARRAY = [3, 1, 4, 1, 5, 9, 2, 6]

function buildSteps(arr: number[]): AnimationStep[] {
  const steps: AnimationStep[] = []
  const n = arr.length
  if (n === 0) return steps

  const allNodes: TreeNode[] = arr.map((val, i) => ({
    id: i,
    value: val,
    index: i,
    left: null,
    right: null,
  }))

  const stack: { nodeId: number; value: number }[] = []
  const nodePool: TreeNode[] = []

  steps.push({
    description: `初始序列: [${arr.join(', ')}]，开始构建笛卡尔树`,
    nodes: [],
    root: null,
    stack: [],
    currentIdx: -1,
    highlightNodeId: null,
    highlightType: 'none',
    removedNodeIds: [],
  })

  for (let i = 0; i < n; i++) {
    const newNode: TreeNode = { ...allNodes[i], left: null, right: null }
    const removedIds: number[] = []

    steps.push({
      description: `处理元素 a[${i}] = ${arr[i]}，准备入栈`,
      nodes: [...nodePool.map(n => ({ ...n }))],
      root: stack.length > 0 ? stack[0].nodeId : null,
      stack: [...stack],
      currentIdx: i,
      highlightNodeId: i,
      highlightType: 'push',
      removedNodeIds: [],
    })

    let lastPopped: number | null = null

    while (stack.length > 0 && stack[stack.length - 1].value > arr[i]) {
      const popped = stack.pop()!
      lastPopped = popped.nodeId
      removedIds.push(popped.nodeId)

      steps.push({
        description: `栈顶 [${popped.nodeId}]:${popped.value} > ${arr[i]}，弹出`,
        nodes: [...nodePool.map(n => ({ ...n }))],
        root: stack.length > 0 ? stack[0].nodeId : null,
        stack: [...stack],
        currentIdx: i,
        highlightNodeId: popped.nodeId,
        highlightType: 'pop',
        removedNodeIds: [...removedIds],
      })
    }

    if (lastPopped !== null) {
      newNode.left = lastPopped
      steps.push({
        description: `将弹出的最后一个节点 [${lastPopped}] 作为 a[${i}] 的左子树`,
        nodes: [...nodePool.map(n => ({ ...n }))],
        root: stack.length > 0 ? stack[0].nodeId : null,
        stack: [...stack],
        currentIdx: i,
        highlightNodeId: i,
        highlightType: 'link',
        removedNodeIds: [],
      })
    }

    if (stack.length > 0) {
      const topNode = stack[stack.length - 1]
      const topIdx = nodePool.findIndex(n => n.id === topNode.nodeId)
      if (topIdx >= 0) {
        nodePool[topIdx].right = i
      }
      steps.push({
        description: `栈顶 [${topNode.nodeId}]:${topNode.value} 的右子节点指向 a[${i}]`,
        nodes: [...nodePool.map(n => ({ ...n }))],
        root: stack.length > 0 ? stack[0].nodeId : null,
        stack: [...stack],
        currentIdx: i,
        highlightNodeId: i,
        highlightType: 'link',
        removedNodeIds: [],
      })
    }

    nodePool.push(newNode)
    stack.push({ nodeId: i, value: arr[i] })

    steps.push({
      description: `将 a[${i}] = ${arr[i]} 压入栈，当前栈: [${stack.map(s => s.value).join(', ')}]`,
      nodes: [...nodePool.map(n => ({ ...n }))],
      root: stack[0].nodeId,
      stack: [...stack],
      currentIdx: i,
      highlightNodeId: i,
      highlightType: 'push',
      removedNodeIds: [],
    })
  }

  steps.push({
    description: `构建完成！根节点为 [${stack[0].nodeId}]:${stack[0].value}，满足BST+最小堆性质`,
    nodes: [...nodePool.map(n => ({ ...n }))],
    root: stack[0].nodeId,
    stack: [],
    currentIdx: -1,
    highlightNodeId: stack[0].nodeId,
    highlightType: 'done',
    removedNodeIds: [],
  })

  return steps
}

export default function CartesianTreeVisualization() {
  const [inputArr] = useState(INITIAL_ARRAY)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(900)
  const [stepData, setStepData] = useState<AnimationStep | null>(null)
  const timerRef = useRef<number | null>(null)

  const initSteps = useCallback(() => {
    const s = buildSteps(inputArr)
    setSteps(s)
    setCurrentStep(0)
    setIsPlaying(false)
    if (s.length > 0) setStepData(s[0])
  }, [inputArr])

  useEffect(() => {
    initSteps()
  }, [initSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setStepData(steps[currentStep])
      setCurrentStep(prev => prev + 1)
      if (currentStep + 1 >= steps.length) {
        setIsPlaying(false)
      }
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePlay = () => {
    if (currentStep >= steps.length) {
      setCurrentStep(0)
      setStepData(steps[0])
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStep = () => {
    if (currentStep < steps.length) {
      setStepData(steps[currentStep])
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(0)
    if (steps.length > 0) setStepData(steps[0])
  }

  const getNodeColor = (nodeId: number): string => {
    if (!stepData) return '#374151'
    if (stepData.highlightNodeId === nodeId) {
      switch (stepData.highlightType) {
        case 'push': return '#22c55e'
        case 'pop': return '#ef4444'
        case 'link': return '#3b82f6'
        case 'done': return '#f59e0b'
        default: return '#374151'
      }
    }
    return '#374151'
  }

  const getNodeBorder = (nodeId: number): string => {
    if (!stepData) return '#4b5563'
    if (stepData.highlightNodeId === nodeId) {
      switch (stepData.highlightType) {
        case 'push': return '#4ade80'
        case 'pop': return '#f87171'
        case 'link': return '#60a5fa'
        case 'done': return '#fbbf24'
        default: return '#4b5563'
      }
    }
    if (stepData.removedNodeIds.includes(nodeId)) return '#7f1d1d'
    return '#4b5563'
  }

  const renderTree = () => {
    if (!stepData || stepData.nodes.length === 0) {
      return (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
          点击「播放」或「单步」开始构建
        </div>
      )
    }

    const nodeMap = new Map(stepData.nodes.map(n => [n.id, n]))
    const rootId = stepData.root

    const getNodePositions = (): Map<number, { x: number; y: number }> => {
      const positions = new Map<number, { x: number; y: number }>()
      if (rootId === null) return positions

      const svgWidth = 680
      const levelHeight = 70
      const baseY = 40

      function layout(nodeId: number, left: number, right: number, depth: number) {
        const node = nodeMap.get(nodeId)
        if (!node) return

        const midX = (left + right) / 2
        positions.set(nodeId, { x: midX, y: baseY + depth * levelHeight })

        if (node.left !== null) {
          layout(node.left, left, midX, depth + 1)
        }
        if (node.right !== null) {
          layout(node.right, midX, right, depth + 1)
        }
      }

      layout(rootId, 20, svgWidth - 20, 0)
      return positions
    }

    const positions = getNodePositions()
    const maxDepth = (() => {
      let max = 0
      positions.forEach((pos) => {
        const depth = (pos.y - 40) / 70
        if (depth > max) max = depth
      })
      return max
    })()
    const svgHeight = Math.max(200, 40 + (maxDepth + 1) * 70 + 40)

    const edges: { x1: number; y1: number; x2: number; y2: number }[] = []
    stepData.nodes.forEach(node => {
      const pos = positions.get(node.id)
      if (!pos) return
      if (node.left !== null) {
        const leftPos = positions.get(node.left)
        if (leftPos) {
          edges.push({ x1: pos.x, y1: pos.y + 20, x2: leftPos.x, y2: leftPos.y - 20 })
        }
      }
      if (node.right !== null) {
        const rightPos = positions.get(node.right)
        if (rightPos) {
          edges.push({ x1: pos.x, y1: pos.y + 20, x2: rightPos.x, y2: rightPos.y - 20 })
        }
      }
    })

    return (
      <svg width="100%" viewBox={`0 0 680 ${svgHeight}`} style={{ maxHeight: '400px' }}>
        <defs>
          <marker id="ct-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
          </marker>
        </defs>

        {edges.map((edge, i) => (
          <line
            key={i}
            x1={edge.x1} y1={edge.y1}
            x2={edge.x2} y2={edge.y2}
            stroke="#6b7280"
            strokeWidth="2"
            markerEnd="url(#ct-arrow)"
          />
        ))}

        {stepData.nodes.map(node => {
          const pos = positions.get(node.id)
          if (!pos) return null
          const isRemoved = stepData.removedNodeIds.includes(node.id)
          return (
            <g key={node.id}>
              <circle
                cx={pos.x} cy={pos.y} r={20}
                fill={isRemoved ? '#450a0a' : getNodeColor(node.id)}
                stroke={getNodeBorder(node.id)}
                strokeWidth={stepData.highlightNodeId === node.id ? 3 : 1.5}
                opacity={isRemoved ? 0.4 : 1}
              />
              <text
                x={pos.x} y={pos.y - 5}
                fill={isRemoved ? '#7f1d1d' : '#fff'}
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                {node.value}
              </text>
              <text
                x={pos.x} y={pos.y + 10}
                fill={isRemoved ? '#7f1d1d' : '#9ca3af'}
                fontSize="9"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                [{node.index}]
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying}>
          播放
        </button>
        <button className="btn btn-primary" onClick={handlePause} disabled={!isPlaying}>
          暂停
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying || currentStep >= steps.length}>
          单步
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
        <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            输入序列: <code style={{ color: 'var(--accent)' }}>[{inputArr.join(', ')}]</code>
            {stepData && stepData.currentIdx >= 0 && (
              <span style={{ marginLeft: '1rem', color: 'var(--text-primary)' }}>
                当前处理: a[{stepData.currentIdx}] = {inputArr[stepData.currentIdx]}
              </span>
            )}
          </span>
        </div>

        <div style={{ display: 'flex', minHeight: '300px' }}>
          <div style={{ flex: '1 1 65%', padding: '0.5rem', overflow: 'auto' }}>
            {renderTree()}
          </div>

          <div style={{
            flex: '0 0 35%',
            borderLeft: '1px solid var(--border)',
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold' }}>
              单调栈（右链）
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column-reverse',
              gap: '4px',
              flex: 1,
              justifyContent: 'flex-start',
            }}>
              {stepData && stepData.stack.map((item, i) => (
                <div
                  key={`${item.nodeId}-${i}`}
                  style={{
                    background: item.nodeId === stepData.highlightNodeId
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(255,255,255,0.05)',
                    border: '1px solid',
                    borderColor: item.nodeId === stepData.highlightNodeId ? '#22c55e' : 'var(--border)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.85rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    color: 'var(--text-primary)',
                    textAlign: 'center',
                  }}
                >
                  [{item.nodeId}]: {item.value}
                </div>
              ))}
              {stepData && stepData.stack.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  (空栈)
                </div>
              )}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.25rem' }}>
              栈底 (根方向)
            </div>
          </div>
        </div>
      </div>

      <div className="viz-info">
        <strong>步骤 {currentStep}/{steps.length}：</strong> {stepData?.description || '准备就绪'}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          入栈/压入
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          弹出
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          建立链接
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          完成
        </span>
      </div>
    </div>
  )
}
