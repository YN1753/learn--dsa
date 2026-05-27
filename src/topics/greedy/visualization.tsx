import { useState, useEffect, useRef, useCallback } from 'react'

// Types
type Mode = 'activity' | 'huffman'

interface Activity {
  name: string
  start: number
  finish: number
  color: string
}

interface HNode {
  id: string
  char?: string
  freq: number
  left?: HNode
  right?: HNode
  x?: number
  y?: number
}

interface Step {
  description: string
  selectedActivities?: string[]
  eliminatedActivities?: string[]
  huffmanNodes?: HNode[]
  huffmanCodes?: Map<string, string>
  mergedNodes?: [string, string]
  treeRoot?: HNode
}

// Activity selection data
const activityData: Activity[] = [
  { name: 'A', start: 1, finish: 4, color: '#4CAF50' },
  { name: 'B', start: 3, finish: 5, color: '#2196F3' },
  { name: 'C', start: 0, finish: 6, color: '#FF9800' },
  { name: 'D', start: 5, finish: 7, color: '#9C27B0' },
  { name: 'E', start: 3, finish: 9, color: '#F44336' },
  { name: 'F', start: 5, finish: 9, color: '#00BCD4' },
  { name: 'G', start: 6, finish: 10, color: '#795548' },
  { name: 'H', start: 8, finish: 11, color: '#607D8B' },
]

// Generate activity selection steps
function generateActivitySteps(): Step[] {
  const sorted = [...activityData].sort((a, b) => a.finish - b.finish)
  const steps: Step[] = []
  const selected: string[] = []
  const eliminated: string[] = []
  let lastFinish = 0

  steps.push({
    description: '将所有活动按结束时间排序，准备开始贪心选择',
    selectedActivities: [],
    eliminatedActivities: [],
  })

  for (const act of sorted) {
    if (act.start >= lastFinish) {
      selected.push(act.name)
      lastFinish = act.finish
      steps.push({
        description: `选中活动 ${act.name}（时间 ${act.start}-${act.finish}）：开始时间 ${act.start} >= 上次结束 ${lastFinish - act.finish + act.start}，不冲突`,
        selectedActivities: [...selected],
        eliminatedActivities: [...eliminated],
      })
    } else {
      eliminated.push(act.name)
      steps.push({
        description: `跳过活动 ${act.name}（时间 ${act.start}-${act.finish}）：与已选活动冲突`,
        selectedActivities: [...selected],
        eliminatedActivities: [...eliminated],
      })
    }
  }

  steps.push({
    description: `选择完成！共选择 ${selected.length} 个活动：${selected.join(', ')}`,
    selectedActivities: [...selected],
    eliminatedActivities: [...eliminated],
  })

  return steps
}

// Generate Huffman tree steps
function generateHuffmanSteps(): Step[] {
  const freqs: [string, number][] = [
    ['a', 2], ['b', 2], ['c', 1], ['d', 4], ['e', 3],
  ]

  const steps: Step[] = []
  let nodeId = 0

  let nodes: HNode[] = freqs.map(([ch, freq]) => ({
    id: `leaf_${nodeId++}`,
    char: ch,
    freq,
  }))

  steps.push({
    description: `初始化：创建 ${nodes.length} 个叶子节点`,
    huffmanNodes: nodes.map(n => ({ ...n })),
  })

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq)
    const left = nodes.shift()!
    const right = nodes.shift()!

    const merged: HNode = {
      id: `node_${nodeId++}`,
      freq: left.freq + right.freq,
      left: { ...left },
      right: { ...right },
    }

    nodes.push(merged)

    steps.push({
      description: `合并频率最低的两个节点：${left.char || `(${left.freq})`}(${left.freq}) + ${right.char || `(${right.freq})`}(${right.freq}) → 新节点(${merged.freq})`,
      huffmanNodes: nodes.map(n => ({ ...n })),
      mergedNodes: [left.id, right.id],
    })
  }

  // Generate codes
  const codes = new Map<string, string>()
  function genCodes(node: HNode, code: string) {
    if (node.char) {
      codes.set(node.char, code || '0')
      return
    }
    if (node.left) genCodes(node.left, code + '0')
    if (node.right) genCodes(node.right, code + '1')
  }
  if (nodes[0]) genCodes(nodes[0], '')

  steps.push({
    description: `霍夫曼树构建完成！编码：${Array.from(codes).map(([ch, code]) => `${ch}→${code}`).join(', ')}`,
    treeRoot: nodes[0],
    huffmanCodes: codes,
  })

  return steps
}

export default function GreedyVisualization() {
  const [mode, setMode] = useState<Mode>('activity')
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Generate steps when mode changes
  useEffect(() => {
    const newSteps = mode === 'activity' ? generateActivitySteps() : generateHuffmanSteps()
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [mode])

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

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const current = steps[currentStep] || steps[0]

  // Render activity selection timeline
  const renderActivityTimeline = () => {
    const maxTime = 12
    const barHeight = 32
    const gap = 8
    const labelWidth = 40
    const timelineWidth = 600

    const selectedSet = new Set(current?.selectedActivities || [])
    const eliminatedSet = new Set(current?.eliminatedActivities || [])

    return (
      <div style={{ padding: '1rem', overflow: 'auto' }}>
        {/* Timeline header */}
        <div style={{ display: 'flex', marginBottom: '0.5rem', paddingLeft: labelWidth }}>
          {Array.from({ length: maxTime + 1 }, (_, i) => (
            <div
              key={i}
              style={{
                width: `${timelineWidth / (maxTime + 1)}px`,
                textAlign: 'center',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
              }}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Activity bars */}
        {activityData.map((act) => {
          const isSelected = selectedSet.has(act.name)
          const isEliminated = eliminatedSet.has(act.name)
          const isPending = !isSelected && !isEliminated

          let bgColor = 'var(--bg-secondary)'
          let textColor = 'var(--text-secondary)'
          let opacity = 0.4

          if (isSelected) {
            bgColor = act.color
            textColor = '#fff'
            opacity = 1
          } else if (isEliminated) {
            bgColor = '#666'
            textColor = '#999'
            opacity = 0.5
          }

          const barLeft = labelWidth + (act.start / maxTime) * timelineWidth
          const barWidth = ((act.finish - act.start) / maxTime) * timelineWidth

          return (
            <div
              key={act.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: `${gap}px`,
                height: `${barHeight}px`,
              }}
            >
              <div
                style={{
                  width: `${labelWidth}px`,
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  color: isSelected ? act.color : 'var(--text-secondary)',
                  textAlign: 'right',
                  paddingRight: '8px',
                }}
              >
                {act.name}
              </div>
              <div style={{ position: 'relative', width: `${timelineWidth}px`, height: '100%' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: `${barLeft}px`,
                    width: `${barWidth}px`,
                    height: '100%',
                    background: bgColor,
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: textColor,
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    opacity: isPending ? 0.3 : opacity,
                    transition: 'all 0.3s ease',
                    border: isSelected ? '2px solid rgba(255,255,255,0.3)' : 'none',
                  }}
                >
                  {act.start}-{act.finish}
                </div>
              </div>
            </div>
          )
        })}

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '0.75rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            paddingLeft: labelWidth,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '12px', height: '12px', background: '#4CAF50', borderRadius: '2px', display: 'inline-block' }} />
            已选中
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '12px', height: '12px', background: '#666', borderRadius: '2px', display: 'inline-block', opacity: 0.5 }} />
            已排除
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '12px', height: '12px', background: 'var(--bg-secondary)', borderRadius: '2px', display: 'inline-block' }} />
            待处理
          </span>
        </div>
      </div>
    )
  }

  // Render Huffman tree
  const renderHuffmanTree = () => {
    if (!current) return null

    const treeRoot = current.treeRoot
    if (!treeRoot) {
      // Show current nodes
      const nodes = current.huffmanNodes || []
      return (
        <div style={{ padding: '1rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
            }}
          >
            {nodes.map((node) => (
              <div
                key={node.id}
                style={{
                  padding: '0.5rem 1rem',
                  background: node.char ? 'var(--accent)' : 'var(--bg-card)',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  textAlign: 'center',
                  minWidth: '60px',
                  transition: 'all 0.3s ease',
                }}
              >
                {node.char && (
                  <div style={{ fontWeight: 'bold', color: node.char ? '#fff' : 'var(--text-primary)' }}>
                    '{node.char}'
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: node.char ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                  频率: {node.freq}
                </div>
              </div>
            ))}
          </div>
          {current.mergedNodes && (
            <div
              style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
              }}
            >
              合并节点: {current.mergedNodes[0]} + {current.mergedNodes[1]}
            </div>
          )}
        </div>
      )
    }

    // Draw the final tree
    const codes = current.huffmanCodes
    const nodePositions: { node: HNode; x: number; y: number }[] = []
    const edges: { x1: number; y1: number; x2: number; y2: number; label: string }[] = []

    function layoutTree(node: HNode, x: number, y: number, spread: number) {
      nodePositions.push({ node, x, y })

      if (node.left) {
        const childX = x - spread
        const childY = y + 70
        edges.push({ x1: x, y1: y, x2: childX, y2: childY, label: '0' })
        layoutTree(node.left, childX, childY, spread * 0.55)
      }
      if (node.right) {
        const childX = x + spread
        const childY = y + 70
        edges.push({ x1: x, y1: y, x2: childX, y2: childY, label: '1' })
        layoutTree(node.right, childX, childY, spread * 0.55)
      }
    }

    layoutTree(treeRoot, 300, 40, 140)

    return (
      <div style={{ padding: '0.5rem', overflow: 'auto' }}>
        <svg width="600" height="320" style={{ display: 'block', margin: '0 auto' }}>
          {/* Edges */}
          {edges.map((edge, i) => (
            <g key={i}>
              <line
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke="var(--border)"
                strokeWidth="2"
              />
              <text
                x={(edge.x1 + edge.x2) / 2 - 8}
                y={(edge.y1 + edge.y2) / 2}
                fill="var(--accent)"
                fontSize="12"
                fontWeight="bold"
              >
                {edge.label}
              </text>
            </g>
          ))}

          {/* Nodes */}
          {nodePositions.map(({ node, x, y }) => (
            <g key={node.id}>
              <circle
                cx={x}
                cy={y}
                r={node.char ? 22 : 18}
                fill={node.char ? 'var(--accent)' : 'var(--bg-card)'}
                stroke="var(--border)"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y - 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={node.char ? '#fff' : 'var(--text-primary)'}
                fontSize={node.char ? '14' : '11'}
                fontWeight="bold"
              >
                {node.char || ''}
              </text>
              <text
                x={x}
                y={y + (node.char ? 10 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={node.char ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)'}
                fontSize="10"
              >
                {node.freq}
              </text>
            </g>
          ))}
        </svg>

        {/* Huffman codes table */}
        {codes && codes.size > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginTop: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            {Array.from(codes.entries()).map(([ch, code]) => (
              <div
                key={ch}
                style={{
                  padding: '0.3rem 0.6rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.8rem',
                }}
              >
                <strong>'{ch}'</strong> → {code}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="visualization-container">
      {/* Mode selector */}
      <div className="viz-controls">
        <select
          value={mode}
          onChange={e => {
            setMode(e.target.value as Mode)
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
          <option value="activity">活动选择问题</option>
          <option value="huffman">霍夫曼编码树</option>
        </select>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {mode === 'activity' ? '按结束时间最早贪心选择不重叠活动' : '每次合并频率最低的两个节点'}
        </span>
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
        <button className="btn btn-secondary" onClick={reset}>
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

      {/* Progress */}
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

      {/* Visualization canvas */}
      <div
        ref={canvasRef}
        className="viz-canvas"
        style={{
          position: 'relative',
          overflow: 'auto',
          minHeight: '280px',
        }}
      >
        {mode === 'activity' ? renderActivityTimeline() : renderHuffmanTree()}
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>贪心策略：</strong>
          {mode === 'activity' ? '选择结束时间最早的活动' : '合并频率最低的两个节点'}
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current?.description || '等待开始...'}
        </div>
        {mode === 'activity' && current && (
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            <span>已选: {current.selectedActivities?.length || 0} 个</span>
            <span>已排除: {current.eliminatedActivities?.length || 0} 个</span>
            <span>步骤: {currentStep + 1} / {steps.length}</span>
          </div>
        )}
        {mode === 'huffman' && current && (
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginTop: '0.25rem',
            }}
          >
            <span>剩余节点: {current.huffmanNodes?.length || 0}</span>
            <span>步骤: {currentStep + 1} / {steps.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}