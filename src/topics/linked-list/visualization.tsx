import { useState, useEffect, useRef, useCallback } from 'react'

interface ListNode {
  id: number
  value: number
  next: number | null
}

interface AnimationStep {
  description: string
  nodes: ListNode[]
  head: number | null
  highlightId: number | null
  highlightType: 'search' | 'insert' | 'delete' | 'found' | 'none'
}

const INITIAL_NODES: ListNode[] = [
  { id: 1, value: 10, next: 2 },
  { id: 2, value: 20, next: 3 },
  { id: 3, value: 30, next: 4 },
  { id: 4, value: 40, next: null },
]

export default function LinkedListVisualization() {
  const [nodes, setNodes] = useState<ListNode[]>(INITIAL_NODES)
  const [head, setHead] = useState<number | null>(1)
  const [highlightId, setHighlightId] = useState<number | null>(null)
  const [highlightType, setHighlightType] = useState<'search' | 'insert' | 'delete' | 'found' | 'none'>('none')
  const [description, setDescription] = useState<string>('链表演示 - 选择一个操作开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<number | null>(null)
  const nextIdRef = useRef(10)

  const getOrderedNodes = useCallback((): ListNode[] => {
    const result: ListNode[] = []
    let currentId = head
    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    while (currentId !== null) {
      const node = nodeMap.get(currentId)
      if (!node) break
      result.push(node)
      currentId = node.next
    }
    return result
  }, [nodes, head])

  const executeSteps = useCallback((animationSteps: AnimationStep[]) => {
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setNodes([...step.nodes])
      setHead(step.head)
      setHighlightId(step.highlightId)
      setHighlightType(step.highlightType)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleInsertHead = () => {
    const value = Math.floor(Math.random() * 90) + 10
    const newId = nextIdRef.current++
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `创建新节点，值为 ${value}`,
      nodes: [...nodes, { id: newId, value, next: null }],
      head,
      highlightId: newId,
      highlightType: 'insert',
    })

    animationSteps.push({
      description: `将新节点的 next 指向当前头节点`,
      nodes: [...nodes, { id: newId, value, next: head }],
      head,
      highlightId: newId,
      highlightType: 'insert',
    })

    animationSteps.push({
      description: `更新头指针指向新节点，插入完成`,
      nodes: [...nodes, { id: newId, value, next: head }],
      head: newId,
      highlightId: newId,
      highlightType: 'insert',
    })

    executeSteps(animationSteps)
  }

  const handleInsertTail = () => {
    const value = Math.floor(Math.random() * 90) + 10
    const newId = nextIdRef.current++
    const orderedNodes = getOrderedNodes()
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `创建新节点，值为 ${value}`,
      nodes: [...nodes, { id: newId, value, next: null }],
      head,
      highlightId: newId,
      highlightType: 'insert',
    })

    animationSteps.push({
      description: `遍历链表找到尾节点...`,
      nodes: [...nodes, { id: newId, value, next: null }],
      head,
      highlightId: orderedNodes.length > 0 ? orderedNodes[orderedNodes.length - 1].id : null,
      highlightType: 'search',
    })

    const updatedNodes = nodes.map(n =>
      n.id === orderedNodes[orderedNodes.length - 1]?.id
        ? { ...n, next: newId }
        : n
    )
    animationSteps.push({
      description: `将尾节点的 next 指向新节点，插入完成`,
      nodes: [...updatedNodes, { id: newId, value, next: null }],
      head,
      highlightId: newId,
      highlightType: 'insert',
    })

    executeSteps(animationSteps)
  }

  const handleInsertPosition = () => {
    const value = Math.floor(Math.random() * 90) + 10
    const position = 2
    const newId = nextIdRef.current++
    const orderedNodes = getOrderedNodes()
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `创建新节点，值为 ${value}，目标位置: ${position}`,
      nodes: [...nodes, { id: newId, value, next: null }],
      head,
      highlightId: newId,
      highlightType: 'insert',
    })

    let prevNode = orderedNodes[position - 1]
    animationSteps.push({
      description: `遍历到位置 ${position - 1} 的节点 (值: ${prevNode?.value})`,
      nodes: [...nodes, { id: newId, value, next: null }],
      head,
      highlightId: prevNode?.id ?? null,
      highlightType: 'search',
    })

    const updatedNodes = nodes.map(n => {
      if (n.id === prevNode?.id) {
        return { ...n, next: newId }
      }
      return n
    })

    animationSteps.push({
      description: `将新节点的 next 指向原位置 ${position} 的节点`,
      nodes: [...updatedNodes, { id: newId, value, next: prevNode?.next ?? null }],
      head,
      highlightId: newId,
      highlightType: 'insert',
    })

    animationSteps.push({
      description: `将位置 ${position - 1} 节点的 next 指向新节点，插入完成`,
      nodes: [...updatedNodes, { id: newId, value, next: prevNode?.next ?? null }],
      head,
      highlightId: newId,
      highlightType: 'found',
    })

    executeSteps(animationSteps)
  }

  const handleDelete = () => {
    const orderedNodes = getOrderedNodes()
    if (orderedNodes.length === 0) {
      setDescription('链表为空，无法删除')
      return
    }

    const targetNode = orderedNodes[Math.floor(orderedNodes.length / 2)]
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `要删除值为 ${targetNode.value} 的节点`,
      nodes,
      head,
      highlightId: targetNode.id,
      highlightType: 'delete',
    })

    let prevNode: ListNode | null = null
    for (const node of orderedNodes) {
      if (node.next === targetNode.id) {
        prevNode = node
        break
      }
    }

    if (prevNode) {
      animationSteps.push({
        description: `找到前驱节点 (值: ${prevNode.value})`,
        nodes,
        head,
        highlightId: prevNode.id,
        highlightType: 'search',
      })

      const updatedNodes = nodes
        .map(n => n.id === prevNode!.id ? { ...n, next: targetNode.next } : n)
        .filter(n => n.id !== targetNode.id)

      animationSteps.push({
        description: `修改前驱节点的 next 指向被删除节点的下一个节点`,
        nodes: updatedNodes,
        head,
        highlightId: prevNode.id,
        highlightType: 'found',
      })

      animationSteps.push({
        description: `删除完成`,
        nodes: updatedNodes,
        head,
        highlightId: null,
        highlightType: 'none',
      })
    } else {
      const updatedNodes = nodes.filter(n => n.id !== targetNode.id)
      animationSteps.push({
        description: `删除头节点，更新头指针`,
        nodes: updatedNodes,
        head: targetNode.next,
        highlightId: targetNode.next,
        highlightType: 'delete',
      })

      animationSteps.push({
        description: `删除完成`,
        nodes: updatedNodes,
        head: targetNode.next,
        highlightId: null,
        highlightType: 'none',
      })
    }

    executeSteps(animationSteps)
  }

  const handleSearch = () => {
    const orderedNodes = getOrderedNodes()
    if (orderedNodes.length === 0) {
      setDescription('链表为空')
      return
    }

    const targetIndex = Math.floor(Math.random() * orderedNodes.length)
    const targetValue = orderedNodes[targetIndex].value
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `搜索值为 ${targetValue} 的节点`,
      nodes,
      head,
      highlightId: null,
      highlightType: 'none',
    })

    for (let i = 0; i <= targetIndex; i++) {
      const isFound = i === targetIndex
      animationSteps.push({
        description: isFound
          ? `找到目标节点！值为 ${targetValue}`
          : `访问位置 ${i} 的节点 (值: ${orderedNodes[i].value})，不是目标，继续...`,
        nodes,
        head,
        highlightId: orderedNodes[i].id,
        highlightType: isFound ? 'found' : 'search',
      })
    }

    executeSteps(animationSteps)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setNodes(INITIAL_NODES)
    setHead(1)
    setHighlightId(null)
    setHighlightType('none')
    setDescription('链表已重置')
    setSteps([])
    setCurrentStep(0)
    nextIdRef.current = 10
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const orderedNodes = getOrderedNodes()
  const nodeWidth = 100
  const nodeHeight = 60
  const gap = 60
  const startX = 40
  const startY = 80

  const getHighlightColor = (nodeId: number): string => {
    if (nodeId !== highlightId) return 'var(--bg-card)'
    switch (highlightType) {
      case 'search': return '#3b82f6'
      case 'insert': return '#22c55e'
      case 'delete': return '#ef4444'
      case 'found': return '#f59e0b'
      default: return 'var(--bg-card)'
    }
  }

  const getHighlightBorder = (nodeId: number): string => {
    if (nodeId !== highlightId) return 'var(--border)'
    switch (highlightType) {
      case 'search': return '#60a5fa'
      case 'insert': return '#4ade80'
      case 'delete': return '#f87171'
      case 'found': return '#fbbf24'
      default: return 'var(--border)'
    }
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleInsertHead} disabled={isPlaying}>
          头部插入
        </button>
        <button className="btn btn-primary" onClick={handleInsertTail} disabled={isPlaying}>
          尾部插入
        </button>
        <button className="btn btn-primary" onClick={handleInsertPosition} disabled={isPlaying}>
          中间插入
        </button>
        <button className="btn btn-primary" onClick={handleDelete} disabled={isPlaying}>
          删除节点
        </button>
        <button className="btn btn-primary" onClick={handleSearch} disabled={isPlaying}>
          搜索节点
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

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg
          width={Math.max(startX + orderedNodes.length * (nodeWidth + gap) + 40, 400)}
          height={startY + nodeHeight + 40}
        >
          {head !== null && (
            <g>
              <text x={startX - 10} y={startY - 20} fill="var(--text-secondary)" fontSize="12" fontFamily="Consolas, Monaco, monospace">
                HEAD
              </text>
              <line
                x1={startX + 15}
                y1={startY - 15}
                x2={startX + 15}
                y2={startY}
                stroke="var(--accent)"
                strokeWidth="2"
                markerEnd="url(#arrowhead-head)"
              />
            </g>
          )}

          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
            <marker id="arrowhead-head" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent)" />
            </marker>
          </defs>

          {orderedNodes.map((node, index) => {
            const x = startX + index * (nodeWidth + gap)
            const y = startY
            return (
              <g key={node.id}>
                <rect
                  x={x}
                  y={y}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx="8"
                  fill={getHighlightColor(node.id)}
                  stroke={getHighlightBorder(node.id)}
                  strokeWidth={node.id === highlightId ? 3 : 1.5}
                />

                <line
                  x1={x + nodeWidth * 0.65}
                  y1={y}
                  x2={x + nodeWidth * 0.65}
                  y2={y + nodeHeight}
                  stroke="var(--border)"
                  strokeWidth="1"
                />

                <text
                  x={x + nodeWidth * 0.325}
                  y={y + nodeHeight / 2 + 5}
                  fill="var(--text-primary)"
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.value}
                </text>

                <text
                  x={x + nodeWidth * 0.825}
                  y={y + nodeHeight / 2 + 4}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.next !== null ? '→' : '∅'}
                </text>

                {index < orderedNodes.length - 1 && (
                  <line
                    x1={x + nodeWidth}
                    y1={y + nodeHeight / 2}
                    x2={x + nodeWidth + gap}
                    y2={y + nodeHeight / 2}
                    stroke="var(--text-secondary)"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                )}

                {index === orderedNodes.length - 1 && (
                  <text
                    x={x + nodeWidth + 20}
                    y={y + nodeHeight / 2 + 5}
                    fill="var(--text-secondary)"
                    fontSize="14"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    null
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          搜索中
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          插入
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          删除
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          找到/完成
        </span>
      </div>
    </div>
  )
}
