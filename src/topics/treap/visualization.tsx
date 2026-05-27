import { useState, useRef, useCallback, useEffect } from 'react'

interface TreapNode {
  key: number
  priority: number
  left: number | null
  right: number | null
  id: number
}

interface AnimationStep {
  description: string
  nodes: TreapNode[]
  rootId: number | null
  highlightId: number | null
  highlightType: 'search' | 'insert' | 'delete' | 'rotate' | 'found' | 'none'
  rotatingPair: [number, number] | null
}

let nextNodeId = 1

function generatePriority(): number {
  return Math.floor(Math.random() * 100) + 1
}

export default function TreapVisualization() {
  const [nodes, setNodes] = useState<TreapNode[]>([])
  const [rootId, setRootId] = useState<number | null>(null)
  const [highlightId, setHighlightId] = useState<number | null>(null)
  const [highlightType, setHighlightType] = useState<'search' | 'insert' | 'delete' | 'rotate' | 'found' | 'none'>('none')
  const [description, setDescription] = useState<string>('Treap 可视化 - 点击「插入」开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const timerRef = useRef<number | null>(null)

  const buildInsertSteps = useCallback((currentNodes: TreapNode[], currentRootId: number | null, key: number): AnimationStep[] => {
    const animationSteps: AnimationStep[] = []
    const priority = generatePriority()

    animationSteps.push({
      description: `创建新节点: key=${key}, priority=${priority}`,
      nodes: [...currentNodes],
      rootId: currentRootId,
      highlightId: null,
      highlightType: 'none',
      rotatingPair: null,
    })

    // Simulate insert by building new tree state
    const nodeMap = new Map<number, TreapNode>()
    for (const n of currentNodes) {
      nodeMap.set(n.id, { ...n })
    }

    let newRootId = currentRootId
    const newNodeId = nextNodeId++
    const newNode: TreapNode = { id: newNodeId, key, priority, left: null, right: null }
    nodeMap.set(newNodeId, newNode)

    if (newRootId === null) {
      newRootId = newNodeId
      animationSteps.push({
        description: `Treap 为空，新节点成为根节点`,
        nodes: Array.from(nodeMap.values()),
        rootId: newRootId,
        highlightId: newNodeId,
        highlightType: 'insert',
        rotatingPair: null,
      })
    } else {
      // BST insert
      const path: number[] = []
      let currentId: number | null = newRootId

      while (currentId !== null) {
        path.push(currentId)
        const current: TreapNode = nodeMap.get(currentId)!
        if (key < current.key) {
          if (current.left === null) {
            current.left = newNodeId
            break
          }
          currentId = current.left
        } else if (key > current.key) {
          if (current.right === null) {
            current.right = newNodeId
            break
          }
          currentId = current.right
        } else {
          // duplicate key, remove the new node
          nodeMap.delete(newNodeId)
          animationSteps.push({
            description: `key=${key} 已存在，跳过插入`,
            nodes: Array.from(nodeMap.values()),
            rootId: newRootId,
            highlightId: null,
            highlightType: 'none',
            rotatingPair: null,
          })
          return animationSteps
        }
      }

      animationSteps.push({
        description: `按照 BST 规则将 key=${key} 插入到正确位置`,
        nodes: Array.from(nodeMap.values()),
        rootId: newRootId,
        highlightId: newNodeId,
        highlightType: 'insert',
        rotatingPair: null,
      })

      // Fix heap property with rotations - work bottom-up
      for (let i = path.length - 1; i >= 0; i--) {
        const parentId = path[i]
        const parent = nodeMap.get(parentId)!

        let childId: number | null = null
        if (parent.left === newNodeId) childId = parent.left
        else if (parent.right === newNodeId) childId = parent.right

        if (childId === null) {
          // Check if the child that leads to newNode
          if (key < parent.key && parent.left !== null) {
            const leftChild = nodeMap.get(parent.left)!
            if (leftChild.priority > parent.priority) {
              childId = parent.left
            }
          } else if (key > parent.key && parent.right !== null) {
            const rightChild = nodeMap.get(parent.right)!
            if (rightChild.priority > parent.priority) {
              childId = parent.right
            }
          }
        }

        if (childId === null) {
          // Check via path
          if (i + 1 < path.length) {
            const child = nodeMap.get(path[i + 1])!
            if (child.priority > parent.priority) {
              childId = path[i + 1]
            }
          }
        }

        if (childId === null) break

        const child = nodeMap.get(childId)!

        if (child.priority <= parent.priority) break

        // Determine rotation direction
        if (parent.left === childId) {
          // Right rotation
          parent.left = child.right
          child.right = parentId

          // Update parent of parent
          if (i > 0) {
            const grandParent = nodeMap.get(path[i - 1])!
            if (grandParent.left === parentId) grandParent.left = childId
            else grandParent.right = childId
          } else {
            newRootId = childId
          }

          animationSteps.push({
            description: `节点 ${child.key}(p${child.priority}) 的优先级高于父节点 ${parent.key}(p${parent.priority})，执行右旋`,
            nodes: Array.from(nodeMap.values()),
            rootId: newRootId,
            highlightId: childId,
            highlightType: 'rotate',
            rotatingPair: [parentId, childId],
          })
        } else {
          // Left rotation
          parent.right = child.left
          child.left = parentId

          if (i > 0) {
            const grandParent = nodeMap.get(path[i - 1])!
            if (grandParent.left === parentId) grandParent.left = childId
            else grandParent.right = childId
          } else {
            newRootId = childId
          }

          animationSteps.push({
            description: `节点 ${child.key}(p${child.priority}) 的优先级高于父节点 ${parent.key}(p${parent.priority})，执行左旋`,
            nodes: Array.from(nodeMap.values()),
            rootId: newRootId,
            highlightId: childId,
            highlightType: 'rotate',
            rotatingPair: [parentId, childId],
          })
        }

        // Update path
        path[i] = childId
      }

      animationSteps.push({
        description: `插入完成！key=${key}(p${priority}) 已插入，BST 和堆性质均已满足`,
        nodes: Array.from(nodeMap.values()),
        rootId: newRootId,
        highlightId: newNodeId,
        highlightType: 'found',
        rotatingPair: null,
      })
    }

    return animationSteps
  }, [])

  const buildSearchSteps = useCallback((currentNodes: TreapNode[], currentRootId: number | null, key: number): AnimationStep[] => {
    const animationSteps: AnimationStep[] = []

    if (currentRootId === null) {
      animationSteps.push({
        description: `Treap 为空，无法搜索`,
        nodes: currentNodes,
        rootId: null,
        highlightId: null,
        highlightType: 'none',
        rotatingPair: null,
      })
      return animationSteps
    }

    const nodeMap = new Map<number, TreapNode>()
    for (const n of currentNodes) {
      nodeMap.set(n.id, { ...n })
    }

    let currentId: number | null = currentRootId

    animationSteps.push({
      description: `开始搜索 key=${key}，从根节点开始`,
      nodes: currentNodes,
      rootId: currentRootId,
      highlightId: currentRootId,
      highlightType: 'search',
      rotatingPair: null,
    })

    while (currentId !== null) {
      const current: TreapNode = nodeMap.get(currentId)!

      if (key === current.key) {
        animationSteps.push({
          description: `找到目标节点 key=${key}！`,
          nodes: currentNodes,
          rootId: currentRootId,
          highlightId: currentId,
          highlightType: 'found',
          rotatingPair: null,
        })
        return animationSteps
      }

      if (key < current.key) {
        animationSteps.push({
          description: `当前节点 key=${current.key} > 目标 ${key}，转向左子树`,
          nodes: currentNodes,
          rootId: currentRootId,
          highlightId: currentId,
          highlightType: 'search',
          rotatingPair: null,
        })
        currentId = current.left
      } else {
        animationSteps.push({
          description: `当前节点 key=${current.key} < 目标 ${key}，转向右子树`,
          nodes: currentNodes,
          rootId: currentRootId,
          highlightId: currentId,
          highlightType: 'search',
          rotatingPair: null,
        })
        currentId = current.right
      }
    }

    animationSteps.push({
      description: `搜索结束，未找到 key=${key}`,
      nodes: currentNodes,
      rootId: currentRootId,
      highlightId: null,
      highlightType: 'none',
      rotatingPair: null,
    })

    return animationSteps
  }, [])

  const buildDeleteSteps = useCallback((currentNodes: TreapNode[], currentRootId: number | null, key: number): AnimationStep[] => {
    const animationSteps: AnimationStep[] = []

    if (currentRootId === null) {
      animationSteps.push({
        description: `Treap 为空，无法删除`,
        nodes: currentNodes,
        rootId: null,
        highlightId: null,
        highlightType: 'none',
        rotatingPair: null,
      })
      return animationSteps
    }

    // Check if key exists
    const nodeMap = new Map<number, TreapNode>()
    for (const n of currentNodes) {
      nodeMap.set(n.id, { ...n })
    }

    let targetId: number | null = null
    let currentId: number | null = currentRootId
    while (currentId !== null) {
      const current: TreapNode = nodeMap.get(currentId)!
      if (key === current.key) {
        targetId = currentId
        break
      }
      currentId = key < current.key ? current.left : current.right
    }

    if (targetId === null) {
      animationSteps.push({
        description: `未找到 key=${key}，无法删除`,
        nodes: currentNodes,
        rootId: currentRootId,
        highlightId: null,
        highlightType: 'none',
        rotatingPair: null,
      })
      return animationSteps
    }

    animationSteps.push({
      description: `找到要删除的节点 key=${key}，开始删除过程`,
      nodes: currentNodes,
      rootId: currentRootId,
      highlightId: targetId,
      highlightType: 'delete',
      rotatingPair: null,
    })

    // For simplicity, do a naive BST delete
    // Find the node and its parent
    const findAndDelete = (nodeId: number | null, _parent: TreapNode | null, _isLeft: boolean): number | null => {
      if (nodeId === null) return null
      const node = nodeMap.get(nodeId)!
      if (key < node.key) {
        node.left = findAndDelete(node.left, node, true)
        return nodeId
      } else if (key > node.key) {
        node.right = findAndDelete(node.right, node, false)
        return nodeId
      } else {
        // Found it
        if (node.left === null && node.right === null) {
          return null
        } else if (node.left === null) {
          return node.right
        } else if (node.right === null) {
          return node.left
        } else {
          // Both children: rotate down
          const leftChild = nodeMap.get(node.left!)!
          const rightChild = node.right ? nodeMap.get(node.right) : null
          if (!rightChild || leftChild.priority > rightChild.priority) {
            // Right rotation
            const newRoot = node.left!
            const newRootNode = nodeMap.get(newRoot)!
            node.left = newRootNode.right
            newRootNode.right = nodeId
            // Now delete from right subtree of the rotated node
            node.right = findAndDelete(node.right, node, false)
            return newRoot
          } else {
            // Left rotation
            const newRoot = node.right!
            const newRootNode = nodeMap.get(newRoot)!
            node.right = newRootNode.left
            newRootNode.left = nodeId
            node.left = findAndDelete(node.left, node, true)
            return newRoot
          }
        }
      }
    }

    const newRoot = findAndDelete(currentRootId, null, false)

    // Remove the deleted node
    nodeMap.delete(targetId)

    const remainingNodes = Array.from(nodeMap.values()).filter(n => {
      // Filter out any nodes that reference the deleted node
      if (n.left === targetId) n.left = null
      if (n.right === targetId) n.right = null
      return true
    })

    animationSteps.push({
      description: `删除完成！节点 key=${key} 已从 Treap 中移除`,
      nodes: remainingNodes,
      rootId: newRoot,
      highlightId: null,
      highlightType: 'none',
      rotatingPair: null,
    })

    return animationSteps
  }, [])

  const executeSteps = useCallback((animationSteps: AnimationStep[]) => {
    if (animationSteps.length === 0) return
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
      setRootId(step.rootId)
      setHighlightId(step.highlightId)
      setHighlightType(step.highlightType)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleInsert = () => {
    if (isPlaying) return
    let value: number
    if (inputValue.trim() !== '') {
      value = parseInt(inputValue.trim(), 10)
      if (isNaN(value)) {
        setDescription('请输入有效的数字')
        return
      }
    } else {
      value = Math.floor(Math.random() * 90) + 10
    }
    setInputValue('')
    const animationSteps = buildInsertSteps(nodes, rootId, value)
    executeSteps(animationSteps)
  }

  const handleSearch = () => {
    if (isPlaying) return
    if (inputValue.trim() === '') {
      setDescription('请输入要搜索的值')
      return
    }
    const value = parseInt(inputValue.trim(), 10)
    if (isNaN(value)) {
      setDescription('请输入有效的数字')
      return
    }
    setInputValue('')
    const animationSteps = buildSearchSteps(nodes, rootId, value)
    executeSteps(animationSteps)
  }

  const handleDelete = () => {
    if (isPlaying) return
    if (inputValue.trim() === '') {
      setDescription('请输入要删除的值')
      return
    }
    const value = parseInt(inputValue.trim(), 10)
    if (isNaN(value)) {
      setDescription('请输入有效的数字')
      return
    }
    setInputValue('')
    const animationSteps = buildDeleteSteps(nodes, rootId, value)
    executeSteps(animationSteps)
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setNodes([])
    setRootId(null)
    setHighlightId(null)
    setHighlightType('none')
    setDescription('Treap 已重置')
    setSteps([])
    setCurrentStep(0)
    nextNodeId = 1
  }

  const handleStepForward = () => {
    if (steps.length === 0 || currentStep >= steps.length) return
    if (isPlaying) {
      setIsPlaying(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    const step = steps[currentStep]
    setNodes([...step.nodes])
    setRootId(step.rootId)
    setHighlightId(step.highlightId)
    setHighlightType(step.highlightType)
    setDescription(step.description)
    setCurrentStep(prev => prev + 1)
  }

  // Layout calculation
  const nodePositions = new Map<number, { x: number; y: number }>()
  const canvasWidth = 700
  const canvasHeight = 400
  const nodeRadius = 28
  const levelHeight = 65

  function layoutTree(nodeId: number | null, x: number, y: number, spread: number) {
    if (nodeId === null) return
    nodePositions.set(nodeId, { x, y })
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    if (node.left !== null) layoutTree(node.left, x - spread, y + levelHeight, spread * 0.55)
    if (node.right !== null) layoutTree(node.right, x + spread, y + levelHeight, spread * 0.55)
  }

  nodePositions.clear()
  if (rootId !== null) {
    layoutTree(rootId, canvasWidth / 2, 50, 160)
  }

  const getHighlightColor = (nodeId: number): string => {
    if (nodeId !== highlightId) return 'var(--bg-card)'
    switch (highlightType) {
      case 'search': return '#3b82f6'
      case 'insert': return '#22c55e'
      case 'delete': return '#ef4444'
      case 'rotate': return '#a855f7'
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
      case 'rotate': return '#c084fc'
      case 'found': return '#fbbf24'
      default: return 'var(--border)'
    }
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="输入 key 值"
          style={{
            width: '100px',
            padding: '0.4rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        />
        <button className="btn btn-primary" onClick={handleInsert} disabled={isPlaying}>
          插入
        </button>
        <button className="btn btn-primary" onClick={handleSearch} disabled={isPlaying}>
          搜索
        </button>
        <button className="btn btn-primary" onClick={handleDelete} disabled={isPlaying}>
          删除
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length}>
          单步
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
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto', minHeight: canvasHeight }}>
        <svg width={canvasWidth} height={canvasHeight}>
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
            </marker>
          </defs>

          {/* Draw edges */}
          {nodes.map(node => {
            const pos = nodePositions.get(node.id)
            if (!pos) return null

            const edges: JSX.Element[] = []

            if (node.left !== null) {
              const leftPos = nodePositions.get(node.left)
              if (leftPos) {
                edges.push(
                  <line
                    key={`${node.id}-left`}
                    x1={pos.x}
                    y1={pos.y + nodeRadius}
                    x2={leftPos.x}
                    y2={leftPos.y - nodeRadius}
                    stroke="var(--text-secondary)"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                )
              }
            }

            if (node.right !== null) {
              const rightPos = nodePositions.get(node.right)
              if (rightPos) {
                edges.push(
                  <line
                    key={`${node.id}-right`}
                    x1={pos.x}
                    y1={pos.y + nodeRadius}
                    x2={rightPos.x}
                    y2={rightPos.y - nodeRadius}
                    stroke="var(--text-secondary)"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                )
              }
            }

            return <g key={`edges-${node.id}`}>{edges}</g>
          })}

          {/* Draw nodes */}
          {nodes.map(node => {
            const pos = nodePositions.get(node.id)
            if (!pos) return null

            return (
              <g key={node.id}>
                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={getHighlightColor(node.id)}
                  stroke={getHighlightBorder(node.id)}
                  strokeWidth={node.id === highlightId ? 3 : 1.5}
                />

                {/* Key */}
                <text
                  x={pos.x}
                  y={pos.y - 3}
                  fill="var(--text-primary)"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.key}
                </text>

                {/* Priority */}
                <text
                  x={pos.x}
                  y={pos.y + 12}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  p{node.priority}
                </text>
              </g>
            )
          })}

          {/* Empty state */}
          {nodes.length === 0 && (
            <text
              x={canvasWidth / 2}
              y={canvasHeight / 2}
              fill="var(--text-secondary)"
              fontSize="14"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              Treap 为空，请插入节点
            </text>
          )}
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
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#a855f7', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          旋转
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
