import { useState, useEffect, useRef, useCallback } from 'react'

interface TreeNode {
  id: number
  label: string
  x: number
  y: number
  children: number[]
}

interface TourEntry {
  nodeId: number
  depth: number
  type: 'enter' | 'exit'
}

interface AnimationStep {
  description: string
  highlightedNode: number | null
  tourEntries: TourEntry[]
  currentTourIndex: number
  inTime: Record<number, number | null>
  outTime: Record<number, number | null>
  activeRegion: number | null
}

const TREE_NODES: TreeNode[] = [
  { id: 1, label: '1', x: 300, y: 40, children: [2, 3] },
  { id: 2, label: '2', x: 160, y: 120, children: [4, 5] },
  { id: 3, label: '3', x: 440, y: 120, children: [6] },
  { id: 4, label: '4', x: 90, y: 200, children: [] },
  { id: 5, label: '5', x: 230, y: 200, children: [] },
  { id: 6, label: '6', x: 440, y: 200, children: [] },
]

const NODE_RADIUS = 22

function computeFullTour(nodes: TreeNode[]): TourEntry[] {
  const tour: TourEntry[] = []
  function dfs(u: number, parent: number, depth: number) {
    tour.push({ nodeId: u, depth, type: 'enter' })
    for (const v of nodes[u - 1].children) {
      if (v !== parent) {
        dfs(v, u, depth + 1)
        tour.push({ nodeId: u, depth, type: 'enter' })
      }
    }
  }
  dfs(1, -1, 0)
  return tour
}

function computeInOutTour(nodes: TreeNode[]): { tour: TourEntry[], inTime: Record<number, number>, outTime: Record<number, number> } {
  const tour: TourEntry[] = []
  const inTime: Record<number, number> = {}
  const outTime: Record<number, number> = {}
  let timer = 0
  function dfs(u: number, parent: number, depth: number) {
    inTime[u] = timer++
    tour.push({ nodeId: u, depth, type: 'enter' })
    for (const v of nodes[u - 1].children) {
      if (v !== parent) {
        dfs(v, u, depth + 1)
      }
    }
    outTime[u] = timer++
    tour.push({ nodeId: u, depth, type: 'exit' })
  }
  dfs(1, -1, 0)
  return { tour, inTime, outTime }
}

const FULL_TOUR = computeFullTour(TREE_NODES)
const IN_OUT_RESULT = computeInOutTour(TREE_NODES)

export default function EulerTourVisualization() {
  const [mode, setMode] = useState<'full' | 'inout'>('full')
  const [description, setDescription] = useState('选择欧拉序类型，然后点击「播放」观看构建过程')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [currentStep, setCurrentStep] = useState(-1)
  const [highlightedNode, setHighlightedNode] = useState<number | null>(null)
  const [activeRegion, setActiveRegion] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const currentTour = mode === 'full' ? FULL_TOUR : IN_OUT_RESULT.tour

  const buildSteps = useCallback((): AnimationStep[] => {
    const steps: AnimationStep[] = []
    const tour = currentTour
    const inTime: Record<number, number | null> = {}
    const outTime: Record<number, number | null> = {}
    for (const node of TREE_NODES) {
      inTime[node.id] = null
      outTime[node.id] = null
    }

    steps.push({
      description: `开始生成${mode === 'full' ? '完全欧拉序' : '入出序'}，从根节点 1 开始DFS`,
      highlightedNode: null,
      tourEntries: [],
      currentTourIndex: -1,
      inTime: { ...inTime },
      outTime: { ...outTime },
      activeRegion: null,
    })

    for (let i = 0; i < tour.length; i++) {
      const entry = tour[i]
      if (mode === 'inout') {
        if (entry.type === 'enter') {
          inTime[entry.nodeId] = i
        } else {
          outTime[entry.nodeId] = i
        }
      }
      const isExit = entry.type === 'exit'
      const desc = isExit
        ? `离开节点 ${entry.nodeId}，记录出序`
        : `访问节点 ${entry.nodeId}${i === 0 ? '（根节点）' : '（DFS进入）'}`
      steps.push({
        description: desc,
        highlightedNode: entry.nodeId,
        tourEntries: tour.slice(0, i + 1),
        currentTourIndex: i,
        inTime: { ...inTime },
        outTime: { ...outTime },
        activeRegion: null,
      })
    }

    steps.push({
      description: `${mode === 'full' ? '完全欧拉序' : '入出序'}生成完毕！序列长度为 ${tour.length}`,
      highlightedNode: null,
      tourEntries: tour,
      currentTourIndex: tour.length - 1,
      inTime: { ...inTime },
      outTime: { ...outTime },
      activeRegion: null,
    })

    return steps
  }, [currentTour, mode])

  const [steps, setSteps] = useState<AnimationStep[]>([])

  useEffect(() => {
    setSteps(buildSteps())
    setCurrentStep(-1)
    setHighlightedNode(null)
    setActiveRegion(null)
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setDescription('点击「播放」观看构建过程')
  }, [mode, buildSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      const nextStep = currentStep + 1
      const step = steps[nextStep]
      setCurrentStep(nextStep)
      setHighlightedNode(step.highlightedNode)
      setDescription(step.description)
      setActiveRegion(step.activeRegion)
    }, speed)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(-1)
      setHighlightedNode(null)
      setActiveRegion(null)
    }
    setIsPlaying(true)
    if (currentStep === -1) {
      setDescription(steps[0]?.description ?? '')
      setCurrentStep(0)
      setHighlightedNode(steps[0]?.highlightedNode ?? null)
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
    setDescription(description + ' [已暂停]')
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(-1)
    setHighlightedNode(null)
    setActiveRegion(null)
    setDescription('点击「播放」观看构建过程')
  }

  const handleHighlightSubtree = (nodeId: number) => {
    if (mode !== 'inout') return
    setActiveRegion(nodeId)
    const inT = IN_OUT_RESULT.inTime[nodeId]
    const outT = IN_OUT_RESULT.outTime[nodeId]
    const count = (outT - inT) / 2
    setDescription(`节点 ${nodeId} 的子树区间: [${inT}, ${outT}]，包含 ${count + 1} 个节点`)
  }

  const currentStepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null
  const displayTour = currentStepData?.tourEntries ?? []

  const getNodeColor = (nodeId: number): string => {
    if (highlightedNode === nodeId) return '#22c55e'
    if (activeRegion !== null && mode === 'inout') {
      const inT = IN_OUT_RESULT.inTime[activeRegion]
      const outT = IN_OUT_RESULT.outTime[activeRegion]
      const nodeIn = IN_OUT_RESULT.inTime[nodeId]
      if (inT <= nodeIn && nodeIn <= outT) return '#3b82f6'
    }
    return 'var(--bg-card)'
  }

  const getNodeBorder = (nodeId: number): string => {
    if (highlightedNode === nodeId) return '#4ade80'
    if (activeRegion !== null && mode === 'inout') {
      const inT = IN_OUT_RESULT.inTime[activeRegion]
      const outT = IN_OUT_RESULT.outTime[activeRegion]
      const nodeIn = IN_OUT_RESULT.inTime[nodeId]
      if (inT <= nodeIn && nodeIn <= outT) return '#60a5fa'
    }
    return 'var(--border)'
  }

  const renderEdges = () => {
    const edges: JSX.Element[] = []
    for (const node of TREE_NODES) {
      for (const childId of node.children) {
        const child = TREE_NODES[childId - 1]
        edges.push(
          <line
            key={`${node.id}-${childId}`}
            x1={node.x}
            y1={node.y + NODE_RADIUS}
            x2={child.x}
            y2={child.y - NODE_RADIUS}
            stroke="var(--border)"
            strokeWidth="2"
          />
        )
      }
    }
    return edges
  }

  const renderNodes = () => {
    return TREE_NODES.map(node => (
      <g
        key={node.id}
        style={{ cursor: mode === 'inout' ? 'pointer' : 'default' }}
        onClick={() => handleHighlightSubtree(node.id)}
      >
        <circle
          cx={node.x}
          cy={node.y}
          r={NODE_RADIUS}
          fill={getNodeColor(node.id)}
          stroke={getNodeBorder(node.id)}
          strokeWidth={highlightedNode === node.id ? 3 : 1.5}
        />
        <text
          x={node.x}
          y={node.y + 5}
          fill="var(--text-primary)"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="Consolas, Monaco, monospace"
        />
        {node.label}
        {mode === 'inout' && currentStepData && currentStepData.inTime[node.id] !== null && (
          <text
            x={node.x + NODE_RADIUS + 6}
            y={node.y - 8}
            fill="var(--text-secondary)"
            fontSize="10"
            fontFamily="Consolas, Monaco, monospace"
          >
            in:{currentStepData.inTime[node.id]}
          </text>
        )}
        {mode === 'inout' && currentStepData && currentStepData.outTime[node.id] !== null && (
          <text
            x={node.x + NODE_RADIUS + 6}
            y={node.y + 6}
            fill="var(--text-secondary)"
            fontSize="10"
            fontFamily="Consolas, Monaco, monospace"
          >
            out:{currentStepData.outTime[node.id]}
          </text>
        )}
      </g>
    ))
  }

  const renderTour = () => {
    if (displayTour.length === 0) return null
    const tourStartX = 20
    const tourY = 280
    const cellW = 36
    const cellH = 28

    return (
      <g>
        <text x={tourStartX} y={tourY - 10} fill="var(--text-secondary)" fontSize="12" fontFamily="Consolas, Monaco, monospace">
          {mode === 'full' ? '完全欧拉序:' : '入出序:'}
        </text>
        {displayTour.map((entry, i) => {
          const isLast = i === displayTour.length - 1
          const isExit = entry.type === 'exit'
          return (
            <g key={i}>
              <rect
                x={tourStartX + i * (cellW + 4)}
                y={tourY}
                width={cellW}
                height={cellH}
                rx="4"
                fill={isLast ? '#22c55e' : isExit ? '#f59e0b' : 'var(--bg-card)'}
                stroke={isLast ? '#4ade80' : 'var(--border)'}
                strokeWidth={isLast ? 2 : 1}
              />
              <text
                x={tourStartX + i * (cellW + 4) + cellW / 2}
                y={tourY + cellH / 2 + 5}
                fill="var(--text-primary)"
                fontSize="13"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                {mode === 'inout' && isExit ? `出${entry.nodeId}` : entry.nodeId}
              </text>
              <text
                x={tourStartX + i * (cellW + 4) + cellW / 2}
                y={tourY + cellH + 14}
                fill="var(--text-secondary)"
                fontSize="9"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                [{i}]
              </text>
            </g>
          )
        })}
      </g>
    )
  }

  const svgWidth = mode === 'inout'
    ? Math.max(600, displayTour.length * 40 + 40)
    : Math.max(600, displayTour.length * 40 + 40)
  const svgHeight = 340

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button
          className={`btn ${mode === 'full' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('full'); handleReset() }}
        >
          完全欧拉序
        </button>
        <button
          className={`btn ${mode === 'inout' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('inout'); handleReset() }}
        >
          入出序
        </button>
        <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying}>
          播放
        </button>
        <button className="btn btn-primary" onClick={handlePause} disabled={!isPlaying}>
          暂停
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="200"
            max="1500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={svgWidth} height={svgHeight}>
          <text x="20" y="20" fill="var(--text-secondary)" fontSize="12" fontFamily="Consolas, Monaco, monospace">
            {mode === 'full' ? '模式: 完全欧拉序 (每次经过节点都记录)' : '模式: 入出序 (每个节点记录入/出两次)'}
          </text>
          {renderEdges()}
          {renderNodes()}
          {renderTour()}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      {mode === 'inout' && (
        <div className="viz-info" style={{ fontSize: '0.85rem' }}>
          <strong>提示：</strong> 点击树中任意节点可高亮其子树对应的区间
        </div>
      )}

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前访问
        </span>
        {mode === 'inout' && (
          <>
            <span style={{ marginLeft: '1rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
              离开(出序)
            </span>
            <span style={{ marginLeft: '1rem' }}>
              <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
              子树区间
            </span>
          </>
        )}
      </div>
    </div>
  )
}
