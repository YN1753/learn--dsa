import { useState, useEffect, useRef, useCallback } from 'react'

interface TreeNode {
  id: number
  label: string
  x: number
  y: number
  parentId: number | null
  solidEdge: boolean // true = 实边, false = 虚边
}

interface AnimationStep {
  description: string
  nodes: TreeNode[]
  highlightIds: number[]
  highlightType: 'access' | 'makeRoot' | 'link' | 'cut' | 'splay' | 'none'
  preferredPath: number[] // 当前偏好路径上的节点
  splayEdges: [number, number][] // Splay 内部的连接
}

const INITIAL_NODES: TreeNode[] = [
  { id: 1, label: '1', x: 300, y: 40, parentId: null, solidEdge: false },
  { id: 2, label: '2', x: 150, y: 120, parentId: 1, solidEdge: true },
  { id: 3, label: '3', x: 450, y: 120, parentId: 1, solidEdge: false },
  { id: 4, label: '4', x: 80, y: 200, parentId: 2, solidEdge: true },
  { id: 5, label: '5', x: 220, y: 200, parentId: 2, solidEdge: false },
  { id: 6, label: '6', x: 380, y: 200, parentId: 3, solidEdge: true },
  { id: 7, label: '7', x: 520, y: 200, parentId: 3, solidEdge: false },
  { id: 8, label: '8', x: 50, y: 280, parentId: 4, solidEdge: true },
  { id: 9, label: '9', x: 110, y: 280, parentId: 4, solidEdge: false },
]

export default function LCTVisualization() {
  const [nodes, setNodes] = useState<TreeNode[]>(INITIAL_NODES)
  const [highlightIds, setHighlightIds] = useState<number[]>([])
  const [highlightType, setHighlightType] = useState<'access' | 'makeRoot' | 'link' | 'cut' | 'splay' | 'none'>('none')
  const [description, setDescription] = useState<string>('Link-Cut Tree 可视化 - 选择操作开始演示')
  const [preferredPath, setPreferredPath] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<number | null>(null)

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
      setHighlightIds(step.highlightIds)
      setHighlightType(step.highlightType)
      setDescription(step.description)
      setPreferredPath(step.preferredPath)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleAccess = () => {
    const targetId = 8 // access(8) -> 路径 8 -> 4 -> 2 -> 1
    const animationSteps: AnimationStep[] = []
    const pathToRoot = [8, 4, 2, 1]

    // Step 1: 开始 access
    animationSteps.push({
      description: `access(${targetId}): 将节点 ${targetId} 到根的路径暴露为偏好路径`,
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [targetId],
      highlightType: 'access',
      preferredPath: [],
    })

    // Step 2: Splay 节点 8
    animationSteps.push({
      description: 'Splay(8): 将 8 旋转到其 Splay 的根',
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [8],
      highlightType: 'splay',
      preferredPath: [8],
    })

    // Step 3: 沿虚边向上到 4
    animationSteps.push({
      description: '从 8 沿父指针到 4，Splay(4)',
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [8, 4],
      highlightType: 'access',
      preferredPath: [8, 4],
    })

    // Step 4: 连接偏好路径
    animationSteps.push({
      description: '将 4 的右孩子设为 8（建立偏好路径）',
      nodes: nodes.map(n => {
        if (n.id === 4) return { ...n, solidEdge: true }
        return n
      }),
      highlightIds: [4, 8],
      highlightType: 'splay',
      preferredPath: [8, 4],
    })

    // Step 5: 向上到 2
    animationSteps.push({
      description: '从 4 沿父指针到 2，Splay(2)',
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [8, 4, 2],
      highlightType: 'access',
      preferredPath: [8, 4, 2],
    })

    // Step 6: 建立偏好路径
    animationSteps.push({
      description: '将 2 的右孩子设为 4',
      nodes: nodes.map(n => {
        if (n.id === 2) return { ...n, solidEdge: true }
        return n
      }),
      highlightIds: [2, 4],
      highlightType: 'splay',
      preferredPath: [8, 4, 2],
    })

    // Step 7: 向上到 1
    animationSteps.push({
      description: '从 2 沿父指针到 1（根），Splay(1)',
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [8, 4, 2, 1],
      highlightType: 'access',
      preferredPath: [8, 4, 2, 1],
    })

    // Step 8: 完成
    animationSteps.push({
      description: `access(${targetId}) 完成: 路径 1→2→4→${targetId} 现在是一条偏好路径`,
      nodes: nodes.map(n => {
        if ([1, 2, 4, 8].includes(n.id)) return { ...n, solidEdge: true }
        return n
      }),
      highlightIds: [1, 2, 4, 8],
      highlightType: 'access',
      preferredPath: [8, 4, 2, 1],
    })

    executeSteps(animationSteps)
  }

  const handleMakeRoot = () => {
    const targetId = 5
    const animationSteps: AnimationStep[] = []

    // Step 1: access
    animationSteps.push({
      description: `makeRoot(${targetId}): 先执行 access(${targetId})`,
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [targetId],
      highlightType: 'makeRoot',
      preferredPath: [],
    })

    // Step 2: access 完成
    animationSteps.push({
      description: `access(${targetId}) 完成，路径 1→2→${targetId} 已暴露`,
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [1, 2, 5],
      highlightType: 'access',
      preferredPath: [5, 2, 1],
    })

    // Step 3: 翻转
    animationSteps.push({
      description: '在 Splay 上施加翻转标记 (reverse)，路径方向反转',
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [1, 2, 5],
      highlightType: 'splay',
      preferredPath: [5, 2, 1],
    })

    // Step 4: 完成
    animationSteps.push({
      description: `makeRoot(${targetId}) 完成: 节点 ${targetId} 现在是树的根`,
      nodes: nodes.map(n => {
        if (n.id === 5) return { ...n, parentId: null }
        if (n.id === 2) return { ...n, parentId: 5 }
        return n
      }),
      highlightIds: [5],
      highlightType: 'makeRoot',
      preferredPath: [5],
    })

    executeSteps(animationSteps)
  }

  const handleLink = () => {
    const u = 9, v = 3
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `link(${u}, ${v}): 将节点 ${u} 连接到节点 ${v} 下方`,
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [u, v],
      highlightType: 'link',
      preferredPath: [],
    })

    animationSteps.push({
      description: `先 makeRoot(${u}): 将 ${u} 设为其树的根`,
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [u],
      highlightType: 'makeRoot',
      preferredPath: [],
    })

    animationSteps.push({
      description: `设置 ${u} 的父指针指向 ${v}，建立虚边连接`,
      nodes: nodes.map(n => {
        if (n.id === u) return { ...n, parentId: v, solidEdge: false }
        return n
      }),
      highlightIds: [u, v],
      highlightType: 'link',
      preferredPath: [],
    })

    animationSteps.push({
      description: `link(${u}, ${v}) 完成: 节点 ${u} 已连接到 ${v} 下方`,
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [u, v],
      highlightType: 'link',
      preferredPath: [],
    })

    executeSteps(animationSteps)
  }

  const handleCut = () => {
    const u = 4, v = 2
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `cut(${u}, ${v}): 删除 ${u} 和 ${v} 之间的边`,
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [u, v],
      highlightType: 'cut',
      preferredPath: [],
    })

    animationSteps.push({
      description: `先 makeRoot(${u}): 将 ${u} 设为根`,
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [u],
      highlightType: 'makeRoot',
      preferredPath: [],
    })

    animationSteps.push({
      description: `access(${v}): 将 ${v} 到根的路径暴露`,
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [u, v],
      highlightType: 'access',
      preferredPath: [v, u],
    })

    animationSteps.push({
      description: `断开 ${v} 的左子树连接（即 ${u}）`,
      nodes: nodes.map(n => {
        if (n.id === v) return { ...n }
        if (n.id === u) return { ...n, parentId: null }
        if (n.id === 8 || n.id === 9) return { ...n, parentId: null }
        return n
      }),
      highlightIds: [u, v],
      highlightType: 'cut',
      preferredPath: [],
    })

    animationSteps.push({
      description: `cut(${u}, ${v}) 完成: 树被分为两棵独立的子树`,
      nodes: nodes.map(n => ({ ...n })),
      highlightIds: [u, v],
      highlightType: 'cut',
      preferredPath: [],
    })

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
    setNodes(INITIAL_NODES)
    setHighlightIds([])
    setHighlightType('none')
    setDescription('Link-Cut Tree 已重置')
    setPreferredPath([])
    setSteps([])
    setCurrentStep(0)
  }

  const getHighlightColor = (nodeId: number): string => {
    if (highlightIds.includes(nodeId)) {
      switch (highlightType) {
        case 'access': return '#3b82f6'
        case 'makeRoot': return '#22c55e'
        case 'link': return '#a855f7'
        case 'cut': return '#ef4444'
        case 'splay': return '#f59e0b'
        default: return 'var(--bg-card)'
      }
    }
    if (preferredPath.includes(nodeId)) return '#1e3a5f'
    return 'var(--bg-card)'
  }

  const getHighlightBorder = (nodeId: number): string => {
    if (highlightIds.includes(nodeId)) {
      switch (highlightType) {
        case 'access': return '#60a5fa'
        case 'makeRoot': return '#4ade80'
        case 'link': return '#c084fc'
        case 'cut': return '#f87171'
        case 'splay': return '#fbbf24'
        default: return 'var(--border)'
      }
    }
    return 'var(--border)'
  }

  const getEdgeColor = (node: TreeNode): string => {
    if (node.parentId === null) return 'transparent'
    const isPreferred = preferredPath.includes(node.id) && preferredPath.includes(node.parentId)
    if (isPreferred) return '#60a5fa'
    if (highlightIds.includes(node.id)) return '#f59e0b'
    return node.solidEdge ? 'var(--text-secondary)' : 'var(--text-secondary)'
  }

  const getEdgeDash = (node: TreeNode): string => {
    return node.solidEdge ? '' : '6,4'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleAccess} disabled={isPlaying}>
          access(8)
        </button>
        <button className="btn btn-primary" onClick={handleMakeRoot} disabled={isPlaying}>
          makeRoot(5)
        </button>
        <button className="btn btn-primary" onClick={handleLink} disabled={isPlaying}>
          link(9, 3)
        </button>
        <button className="btn btn-primary" onClick={handleCut} disabled={isPlaying}>
          cut(4, 2)
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
            min="300"
            max="2500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflow: 'auto' }}>
        <svg width={600} height={360}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
            <marker id="arrow-highlight" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
            </marker>
          </defs>

          {/* 绘制边 */}
          {nodes.map(node => {
            if (node.parentId === null) return null
            const parent = nodes.find(n => n.id === node.parentId)
            if (!parent) return null

            const isPreferred = preferredPath.includes(node.id) && preferredPath.includes(parent.id)
            const edgeColor = isPreferred ? '#60a5fa' : getEdgeColor(node)
            const dashArray = getEdgeDash(node)

            return (
              <line
                key={`edge-${node.id}`}
                x1={parent.x}
                y1={parent.y + 24}
                x2={node.x}
                y2={node.y - 24}
                stroke={edgeColor}
                strokeWidth={isPreferred ? 3 : 1.5}
                strokeDasharray={dashArray}
                markerEnd={isPreferred ? 'url(#arrow-highlight)' : 'url(#arrow)'}
              />
            )
          })}

          {/* 绘制节点 */}
          {nodes.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={24}
                fill={getHighlightColor(node.id)}
                stroke={getHighlightBorder(node.id)}
                strokeWidth={highlightIds.includes(node.id) ? 3 : 1.5}
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
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          access
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          makeRoot
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#a855f7', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          link
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          cut
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          splay
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: '#60a5fa', marginRight: 4, verticalAlign: 'middle' }} />
          偏好路径
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 20, height: 0, borderTop: '2px dashed var(--text-secondary)', marginRight: 4, verticalAlign: 'middle' }} />
          虚边
        </span>
      </div>
    </div>
  )
}
