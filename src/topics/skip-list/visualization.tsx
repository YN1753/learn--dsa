import { useState, useEffect, useRef, useCallback } from 'react'

interface SkipNode {
  id: number
  value: number
  levels: number // 该节点出现的层数（0-based）
}

interface AnimationStep {
  description: string
  nodes: SkipNode[]
  highlightValue: number | null
  highlightType: 'search' | 'insert' | 'found' | 'delete' | 'none'
  activeLevel: number // 当前搜索所在的层
  path: number[] // 搜索路径中经过的节点值
}

const INITIAL_NODES: SkipNode[] = [
  { id: 1, value: 5, levels: 3 },
  { id: 2, value: 15, levels: 1 },
  { id: 3, value: 25, levels: 2 },
  { id: 4, value: 35, levels: 0 },
  { id: 5, value: 45, levels: 1 },
  { id: 6, value: 55, levels: 0 },
  { id: 7, value: 65, levels: 2 },
  { id: 8, value: 75, levels: 0 },
]

const MAX_LEVEL = 3

function getRandomLevel(): number {
  let level = 0
  while (Math.random() < 0.5 && level < MAX_LEVEL) {
    level++
  }
  return level
}

export default function SkipListVisualization() {
  const [nodes, setNodes] = useState<SkipNode[]>(INITIAL_NODES)
  const [highlightValue, setHighlightValue] = useState<number | null>(null)
  const [highlightType, setHighlightType] = useState<'search' | 'insert' | 'found' | 'delete' | 'none'>('none')
  const [activeLevel, setActiveLevel] = useState(MAX_LEVEL)
  const [description, setDescription] = useState<string>('跳表演示 - 选择一个操作开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [searchPath, setSearchPath] = useState<number[]>([])
  const timerRef = useRef<number | null>(null)
  const nextIdRef = useRef(20)

  const executeSteps = useCallback((animationSteps: AnimationStep[]) => {
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setSearchPath([])
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
      setHighlightValue(step.highlightValue)
      setHighlightType(step.highlightType)
      setActiveLevel(step.activeLevel)
      setDescription(step.description)
      setSearchPath(step.path)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleSearch = () => {
    if (nodes.length === 0) {
      setDescription('跳表为空，无法搜索')
      return
    }

    const targetIndex = Math.floor(Math.random() * nodes.length)
    const target = nodes[targetIndex].value
    const sortedNodes = [...nodes].sort((a, b) => a.value - b.value)
    const animationSteps: AnimationStep[] = []
    const path: number[] = []

    animationSteps.push({
      description: `开始搜索值 ${target}，从顶层（第 ${MAX_LEVEL} 层）开始`,
      nodes: [...sortedNodes],
      highlightValue: null,
      highlightType: 'search',
      activeLevel: MAX_LEVEL,
      path: [],
    })

    for (let level = MAX_LEVEL; level >= 0; level--) {
      const nodesAtLevel = sortedNodes.filter(n => n.levels >= level)
      for (const node of nodesAtLevel) {
        if (node.value > target) break
        if (node.value === target) {
          path.push(node.value)
          animationSteps.push({
            description: `第 ${level} 层: 访问节点 ${node.value}，找到目标！`,
            nodes: [...sortedNodes],
            highlightValue: node.value,
            highlightType: 'found',
            activeLevel: level,
            path: [...path],
          })
          break
        }
        path.push(node.value)
        animationSteps.push({
          description: `第 ${level} 层: 访问节点 ${node.value}，小于目标 ${target}，继续向右`,
          nodes: [...sortedNodes],
          highlightValue: node.value,
          highlightType: 'search',
          activeLevel: level,
          path: [...path],
        })
      }
      if (animationSteps[animationSteps.length - 1]?.highlightType === 'found') break
      if (level > 0) {
        animationSteps.push({
          description: `第 ${level} 层未找到，下降到第 ${level - 1} 层`,
          nodes: [...sortedNodes],
          highlightValue: null,
          highlightType: 'search',
          activeLevel: level - 1,
          path: [...path],
        })
      }
    }

    if (animationSteps[animationSteps.length - 1]?.highlightType !== 'found') {
      animationSteps.push({
        description: `搜索结束，值 ${target} 不存在于跳表中`,
        nodes: [...sortedNodes],
        highlightValue: null,
        highlightType: 'none',
        activeLevel: 0,
        path: [...path],
      })
    }

    executeSteps(animationSteps)
  }

  const handleInsert = () => {
    const value = Math.floor(Math.random() * 90) + 5
    const newLevel = getRandomLevel()
    const newId = nextIdRef.current++
    const animationSteps: AnimationStep[] = []
    const sortedNodes = [...nodes].sort((a, b) => a.value - b.value)

    animationSteps.push({
      description: `准备插入值 ${value}，随机分配层数: ${newLevel + 1} 层`,
      nodes: [...sortedNodes],
      highlightValue: null,
      highlightType: 'insert',
      activeLevel: MAX_LEVEL,
      path: [],
    })

    animationSteps.push({
      description: `在底层找到插入位置，插入节点 ${value}`,
      nodes: [...sortedNodes, { id: newId, value, levels: newLevel }].sort((a, b) => a.value - b.value),
      highlightValue: value,
      highlightType: 'insert',
      activeLevel: 0,
      path: [value],
    })

    for (let level = 1; level <= newLevel; level++) {
      animationSteps.push({
        description: `将节点 ${value} 提升到第 ${level} 层`,
        nodes: [...sortedNodes, { id: newId, value, levels: newLevel }].sort((a, b) => a.value - b.value),
        highlightValue: value,
        highlightType: 'insert',
        activeLevel: level,
        path: [value],
      })
    }

    animationSteps.push({
      description: `插入完成，节点 ${value} 出现在第 0 到第 ${newLevel} 层`,
      nodes: [...sortedNodes, { id: newId, value, levels: newLevel }].sort((a, b) => a.value - b.value),
      highlightValue: value,
      highlightType: 'found',
      activeLevel: newLevel,
      path: [value],
    })

    executeSteps(animationSteps)
  }

  const handleDelete = () => {
    if (nodes.length === 0) {
      setDescription('跳表为空，无法删除')
      return
    }

    const targetIndex = Math.floor(Math.random() * nodes.length)
    const target = nodes[targetIndex]
    const animationSteps: AnimationStep[] = []
    const sortedNodes = [...nodes].sort((a, b) => a.value - b.value)

    animationSteps.push({
      description: `准备删除值 ${target.value}（存在于第 0 到第 ${target.levels} 层）`,
      nodes: [...sortedNodes],
      highlightValue: target.value,
      highlightType: 'delete',
      activeLevel: target.levels,
      path: [],
    })

    for (let level = target.levels; level >= 0; level--) {
      animationSteps.push({
        description: `从第 ${level} 层删除节点 ${target.value}`,
        nodes: sortedNodes.filter(n => n.id !== target.id),
        highlightValue: target.value,
        highlightType: 'delete',
        activeLevel: level,
        path: [],
      })
    }

    animationSteps.push({
      description: `删除完成`,
      nodes: sortedNodes.filter(n => n.id !== target.id),
      highlightValue: null,
      highlightType: 'none',
      activeLevel: MAX_LEVEL,
      path: [],
    })

    executeSteps(animationSteps)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setNodes(INITIAL_NODES)
    setHighlightValue(null)
    setHighlightType('none')
    setActiveLevel(MAX_LEVEL)
    setDescription('跳表已重置')
    setSteps([])
    setCurrentStep(0)
    setSearchPath([])
    nextIdRef.current = 20
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const sortedNodes = [...nodes].sort((a, b) => a.value - b.value)
  const nodeWidth = 60
  const nodeHeight = 36
  const gap = 30
  const levelHeight = 60
  const startX = 60
  const startY = 40

  const getHighlightColor = (nodeValue: number): string => {
    if (nodeValue !== highlightValue) return 'var(--bg-card)'
    switch (highlightType) {
      case 'search': return '#3b82f6'
      case 'insert': return '#22c55e'
      case 'delete': return '#ef4444'
      case 'found': return '#f59e0b'
      default: return 'var(--bg-card)'
    }
  }

  const getHighlightBorder = (nodeValue: number): string => {
    if (nodeValue !== highlightValue) return 'var(--border)'
    switch (highlightType) {
      case 'search': return '#60a5fa'
      case 'insert': return '#4ade80'
      case 'delete': return '#f87171'
      case 'found': return '#fbbf24'
      default: return 'var(--border)'
    }
  }

  const svgWidth = Math.max(startX + sortedNodes.length * (nodeWidth + gap) + 60, 500)
  const svgHeight = startY + (MAX_LEVEL + 1) * levelHeight + 60

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleSearch} disabled={isPlaying}>
          搜索
        </button>
        <button className="btn btn-primary" onClick={handleInsert} disabled={isPlaying}>
          插入
        </button>
        <button className="btn btn-primary" onClick={handleDelete} disabled={isPlaying}>
          删除
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
        <svg width={svgWidth} height={svgHeight}>
          <defs>
            <marker id="sl-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
            <marker id="sl-arrow-hl" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
            </marker>
          </defs>

          {/* Level labels */}
          {Array.from({ length: MAX_LEVEL + 1 }, (_, level) => {
            const y = startY + (MAX_LEVEL - level) * levelHeight
            return (
              <g key={`label-${level}`}>
                <text
                  x={10}
                  y={y + nodeHeight / 2 + 4}
                  fill={level === activeLevel ? '#f59e0b' : 'var(--text-secondary)'}
                  fontSize="12"
                  fontWeight={level === activeLevel ? 'bold' : 'normal'}
                  fontFamily="Consolas, Monaco, monospace"
                >
                  L{level}
                </text>
                {level === activeLevel && (
                  <rect
                    x={4}
                    y={y + 2}
                    width={36}
                    height={nodeHeight - 4}
                    rx={4}
                    fill="#f59e0b"
                    opacity={0.15}
                  />
                )}
              </g>
            )
          })}

          {/* Draw connections for each level */}
          {Array.from({ length: MAX_LEVEL + 1 }, (_, level) => {
            const nodesAtLevel = sortedNodes.filter(n => n.levels >= level)
            return nodesAtLevel.map((node, index) => {
              if (index >= nodesAtLevel.length - 1) return null
              const nextNode = nodesAtLevel[index + 1]
              const x1 = startX + sortedNodes.indexOf(node) * (nodeWidth + gap) + nodeWidth
              const x2 = startX + sortedNodes.indexOf(nextNode) * (nodeWidth + gap)
              const y = startY + (MAX_LEVEL - level) * levelHeight + nodeHeight / 2
              const isHighlighted = searchPath.includes(node.value) && searchPath.includes(nextNode.value)
              return (
                <line
                  key={`conn-${level}-${node.id}`}
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke={isHighlighted ? '#60a5fa' : 'var(--text-secondary)'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  markerEnd={isHighlighted ? 'url(#sl-arrow-hl)' : 'url(#sl-arrow)'}
                  opacity={isHighlighted ? 1 : 0.5}
                />
              )
            })
          })}

          {/* Draw vertical links for multi-level nodes */}
          {sortedNodes.map((node, index) => {
            if (node.levels === 0) return null
            const x = startX + index * (nodeWidth + gap) + nodeWidth / 2
            const yTop = startY + (MAX_LEVEL - node.levels) * levelHeight + nodeHeight
            const yBottom = startY + MAX_LEVEL * levelHeight
            return (
              <line
                key={`vert-${node.id}`}
                x1={x}
                y1={yTop}
                x2={x}
                y2={yBottom}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity={0.4}
              />
            )
          })}

          {/* Draw nodes at each level */}
          {Array.from({ length: MAX_LEVEL + 1 }, (_, level) => {
            return sortedNodes.map((node, index) => {
              if (node.levels < level) return null
              const x = startX + index * (nodeWidth + gap)
              const y = startY + (MAX_LEVEL - level) * levelHeight
              const isHighlighted = node.value === highlightValue
              const isInPath = searchPath.includes(node.value)
              return (
                <g key={`node-${level}-${node.id}`}>
                  <rect
                    x={x}
                    y={y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx={6}
                    fill={getHighlightColor(node.value)}
                    stroke={getHighlightBorder(node.value)}
                    strokeWidth={isHighlighted ? 3 : isInPath ? 2 : 1.5}
                    opacity={isInPath || isHighlighted ? 1 : 0.8}
                  />
                  <text
                    x={x + nodeWidth / 2}
                    y={y + nodeHeight / 2 + 5}
                    fill="var(--text-primary)"
                    fontSize="13"
                    fontWeight={isHighlighted ? 'bold' : 'normal'}
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {node.value}
                  </text>
                </g>
              )
            })
          })}

          {/* HEAD label */}
          <text
            x={startX + nodeWidth / 2}
            y={startY - 10}
            fill="var(--text-secondary)"
            fontSize="11"
            textAnchor="middle"
            fontFamily="Consolas, Monaco, monospace"
          >
            HEAD
          </text>
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      {searchPath.length > 0 && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>搜索路径：</strong>
          {searchPath.map((v, i) => (
            <span key={i}>
              {i > 0 && ' → '}
              <span style={{
                background: '#3b82f6',
                color: 'white',
                padding: '1px 6px',
                borderRadius: '3px',
                fontSize: '0.8rem',
              }}>{v}</span>
            </span>
          ))}
        </div>
      )}

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

      <div className="viz-info" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
        <strong>跳表结构说明：</strong> 共 {MAX_LEVEL + 1} 层索引。底层（L0）包含所有 {sortedNodes.length} 个元素，高层为稀疏索引。
        每个节点通过随机过程决定出现在哪些层，搜索时从最高层开始逐层下降。
      </div>
    </div>
  )
}
