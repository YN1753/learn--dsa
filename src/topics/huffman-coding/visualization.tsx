import { useState, useEffect, useRef, useCallback } from 'react'

interface HuffmanNode {
  id: number
  char: string | null
  freq: number
  left: HuffmanNode | null
  right: HuffmanNode | null
  x: number
  y: number
  mergeRound: number
}

interface AnimationStep {
  description: string
  heap: HuffmanNode[]
  tree: HuffmanNode | null
  highlightIds: number[]
  mergeRound: number
}

const DEFAULT_CHARS = [
  { char: 'a', freq: 5 },
  { char: 'b', freq: 3 },
  { char: 'c', freq: 7 },
  { char: 'd', freq: 2 },
  { char: 'e', freq: 8 },
]

let nodeIdCounter = 0
function nextNodeId(): number {
  return ++nodeIdCounter
}

function resetIdCounter(): void {
  nodeIdCounter = 0
}

export default function HuffmanCodingVisualization() {
  const [heap, setHeap] = useState<HuffmanNode[]>([])
  const [tree, setTree] = useState<HuffmanNode | null>(null)
  const [description, setDescription] = useState<string>('哈夫曼编码可视化 - 点击「构建」开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightIds, setHighlightIds] = useState<number[]>([])
  const [mergeRound, setMergeRound] = useState(0)
  const [codeTable, setCodeTable] = useState<Map<string, string>>(new Map())
  const timerRef = useRef<number | null>(null)

  const buildSteps = useCallback((chars: { char: string; freq: number }[]) => {
    resetIdCounter()
    const animationSteps: AnimationStep[] = []

    // Create leaf nodes
    const leaves: HuffmanNode[] = chars.map(c => ({
      id: nextNodeId(),
      char: c.char,
      freq: c.freq,
      left: null,
      right: null,
      x: 0,
      y: 0,
      mergeRound: -1,
    }))

    animationSteps.push({
      description: `创建 ${leaves.length} 个叶子节点，放入优先队列`,
      heap: [...leaves],
      tree: null,
      highlightIds: [],
      mergeRound: 0,
    })

    // Build Huffman tree step by step
    const workingHeap = [...leaves]
    let round = 0

    while (workingHeap.length > 1) {
      workingHeap.sort((a, b) => a.freq - b.freq)
      const left = workingHeap.shift()!
      const right = workingHeap.shift()!
      round++

      animationSteps.push({
        description: `第 ${round} 步：取出频率最小的两个节点 "${left.char ?? '(' + left.freq + ')'}"(${left.freq}) 和 "${right.char ?? '(' + right.freq + ')'}"(${right.freq})`,
        heap: [...workingHeap],
        tree: animationSteps[animationSteps.length - 1]?.tree ?? null,
        highlightIds: [left.id, right.id],
        mergeRound: round - 1,
      })

      const parent: HuffmanNode = {
        id: nextNodeId(),
        char: null,
        freq: left.freq + right.freq,
        left,
        right,
        x: 0,
        y: 0,
        mergeRound: round,
      }

      workingHeap.push(parent)

      animationSteps.push({
        description: `合并为新节点 (${parent.freq})，放回优先队列。队列剩余 ${workingHeap.length} 个节点`,
        heap: [...workingHeap],
        tree: workingHeap.length === 1 ? parent : null,
        highlightIds: [parent.id],
        mergeRound: round,
      })
    }

    // Final step
    const finalTree = workingHeap[0] ?? null
    const table = new Map<string, string>()
    if (finalTree) {
      const dfs = (node: HuffmanNode, code: string) => {
        if (node.char !== null) {
          table.set(node.char, code || '0')
          return
        }
        if (node.left) dfs(node.left, code + '0')
        if (node.right) dfs(node.right, code + '1')
      }
      dfs(finalTree, '')
    }

    animationSteps.push({
      description: '哈夫曼树构建完成！下方显示编码表。',
      heap: [],
      tree: finalTree,
      highlightIds: finalTree ? [finalTree.id] : [],
      mergeRound: round,
    })

    return { steps: animationSteps, codeTable: table }
  }, [])

  const handleBuild = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const { steps: newSteps, codeTable: table } = buildSteps(DEFAULT_CHARS)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setCodeTable(table)
    setHeap([])
    setTree(null)
    setHighlightIds([])
    setMergeRound(0)
  }, [buildSteps])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setHeap([])
    setTree(null)
    setSteps([])
    setCurrentStep(0)
    setHighlightIds([])
    setMergeRound(0)
    setCodeTable(new Map())
    setDescription('已重置 - 点击「构建」开始')
  }, [])

  const handlePauseResume = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }, [isPlaying, description, steps.length, currentStep])

  const handleStep = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length) return
    const step = steps[currentStep]
    setHeap(step.heap)
    setTree(step.tree)
    setHighlightIds(step.highlightIds)
    setMergeRound(step.mergeRound)
    setDescription(step.description)
    setCurrentStep(prev => prev + 1)
  }, [steps, currentStep])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      const step = steps[currentStep]
      setHeap(step.heap)
      setTree(step.tree)
      setHighlightIds(step.highlightIds)
      setMergeRound(step.mergeRound)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  // Layout tree for SVG rendering
  const layoutTree = useCallback((root: HuffmanNode | null): { nodes: HuffmanNode[]; edges: { from: HuffmanNode; to: HuffmanNode; label: string }[] } => {
    if (!root) return { nodes: [], edges: [] }

    const nodes: HuffmanNode[] = []
    const edges: { from: HuffmanNode; to: HuffmanNode; label: string }[] = []
    const svgWidth = 700
    const levelHeight = 80
    const nodeRadius = 28

    function getWidth(node: HuffmanNode): number {
      if (!node.left && !node.right) return 1
      const leftW = node.left ? getWidth(node.left) : 0
      const rightW = node.right ? getWidth(node.right) : 0
      return leftW + rightW
    }

    function layout(node: HuffmanNode, x: number, y: number, availableWidth: number) {
      node.x = x
      node.y = y
      nodes.push(node)

      const leftW = node.left ? getWidth(node.left) : 0
      const rightW = node.right ? getWidth(node.right) : 0
      const totalW = leftW + rightW

      if (node.left && node.right) {
        const leftRatio = leftW / totalW
        const leftX = x - availableWidth * leftRatio / 2
        const rightX = x + availableWidth * (1 - leftRatio) / 2
        const childY = y + levelHeight
        edges.push({ from: node, to: node.left, label: '0' })
        edges.push({ from: node, to: node.right, label: '1' })
        layout(node.left, leftX, childY, availableWidth * leftRatio)
        layout(node.right, rightX, childY, availableWidth * (1 - leftRatio))
      } else if (node.left) {
        edges.push({ from: node, to: node.left, label: '0' })
        layout(node.left, x, y + levelHeight, availableWidth / 2)
      } else if (node.right) {
        edges.push({ from: node, to: node.right, label: '1' })
        layout(node.right, x, y + levelHeight, availableWidth / 2)
      }
    }

    layout(root, svgWidth / 2, 50, svgWidth * 0.85)
    return { nodes, edges }
  }, [])

  const treeLayout = layoutTree(tree)

  const svgWidth = 700
  const maxNodeY = treeLayout.nodes.reduce((max, n) => Math.max(max, n.y), 0)
  const svgHeight = Math.max(200, maxNodeY + 80)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleBuild} disabled={isPlaying}>
          构建
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying || steps.length === 0 || currentStep >= steps.length}>
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
            max="3000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      {/* Heap visualization */}
      {heap.length > 0 && (
        <div className="viz-canvas" style={{ overflowX: 'auto', marginBottom: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', padding: '0.5rem' }}>
            优先队列 (最小堆):
          </div>
          <div style={{ display: 'flex', gap: '12px', padding: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[...heap].sort((a, b) => a.freq - b.freq).map(node => (
              <div
                key={node.id}
                style={{
                  border: `2px solid ${highlightIds.includes(node.id) ? '#f59e0b' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '8px 14px',
                  background: highlightIds.includes(node.id) ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '60px',
                }}
              >
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {node.char ?? '...'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {node.freq}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tree visualization */}
      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        {tree ? (
          <svg width={svgWidth} height={svgHeight} style={{ display: 'block', margin: '0 auto' }}>
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
              </marker>
            </defs>

            {/* Edges */}
            {treeLayout.edges.map((edge, i) => {
              const fromX = edge.from.x
              const fromY = edge.from.y + 28
              const toX = edge.to.x
              const toY = edge.to.y - 28
              const midX = (fromX + toX) / 2
              const midY = (fromY + toY) / 2
              return (
                <g key={i}>
                  <line
                    x1={fromX} y1={fromY}
                    x2={toX} y2={toY}
                    stroke="var(--border)"
                    strokeWidth={2}
                  />
                  <text
                    x={midX - 12}
                    y={midY}
                    fill="#3b82f6"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {edge.label}
                  </text>
                </g>
              )
            })}

            {/* Nodes */}
            {treeLayout.nodes.map(node => {
              const isLeaf = node.char !== null
              const isHighlighted = highlightIds.includes(node.id)
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={28}
                    fill={isHighlighted ? '#f59e0b' : isLeaf ? '#3b82f6' : 'var(--bg-card)'}
                    stroke={isHighlighted ? '#fbbf24' : isLeaf ? '#60a5fa' : 'var(--border)'}
                    strokeWidth={isHighlighted ? 3 : 2}
                  />
                  <text
                    x={node.x}
                    y={node.y - (isLeaf ? 4 : 4)}
                    fill={isHighlighted ? '#000' : isLeaf ? '#fff' : 'var(--text-primary)'}
                    fontSize={isLeaf ? '15' : '12'}
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {node.char ?? ''}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + (isLeaf ? 12 : 14)}
                    fill={isHighlighted ? '#000' : isLeaf ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)'}
                    fontSize="12"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {node.freq}
                  </text>
                </g>
              )
            })}
          </svg>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            点击「构建」开始哈夫曼树的构建动画
          </div>
        )}
      </div>

      {/* Code table */}
      {codeTable.size > 0 && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            编码表:
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[...codeTable.entries()].sort((a, b) => a[1].length - b[1].length).map(([ch, code]) => (
              <span key={ch} style={{ fontFamily: 'Consolas, Monaco, monospace', color: 'var(--text-primary)' }}>
                <strong>'{ch}'</strong> = <span style={{ color: '#3b82f6' }}>{code}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          叶子节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          内部节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前合并
        </span>
      </div>
    </div>
  )
}
