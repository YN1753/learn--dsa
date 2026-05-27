import { useState, useEffect, useRef, useCallback } from 'react'

interface STEdge {
  start: number
  end: number
  childId: number
}

interface STNode {
  id: number
  children: Record<string, STEdge>
  suffixLink: number | null
  isLeaf: boolean
  depth: number
}

interface TreeLayout {
  x: number
  y: number
  nodeId: number
  children: TreeLayout[]
  edgeLabel: string
}

interface AnimationStep {
  description: string
  nodes: Record<number, STNode>
  edges: Array<{ from: number; to: number; label: string; char: string }>
  highlightNode: number | null
  highlightEdge: string | null
  phase: string
}

export default function SuffixTreeVisualization() {
  const [text, setText] = useState('banana')
  const [nodes, setNodes] = useState<Record<number, STNode>>({})
  const [edges, setEdges] = useState<Array<{ from: number; to: number; label: string; char: string }>>([])
  const [highlightNode, setHighlightNode] = useState<number | null>(null)
  const [highlightEdge, setHighlightEdge] = useState<string | null>(null)
  const [description, setDescription] = useState('后缀树可视化 - 输入字符串并点击构建')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [phase, setPhase] = useState('就绪')
  const [searchPattern, setSearchPattern] = useState('')
  const [searchResult, setSearchResult] = useState<number[]>([])
  const timerRef = useRef<number | null>(null)

  const buildSuffixTreeSteps = useCallback((inputText: string): AnimationStep[] => {
    const fullText = inputText + '$'
    const allSteps: AnimationStep[] = []
    let nodeId = 0

    const createNode = (isLeaf: boolean, depth: number): STNode => ({
      id: nodeId++,
      children: {},
      suffixLink: null,
      isLeaf,
      depth,
    })

    // Simple O(n^2) construction with step recording
    let root = createNode(false, 0)

    const cloneNodes = (src: Record<number, STNode>): Record<number, STNode> => {
      const result: Record<number, STNode> = {}
      for (const [k, v] of Object.entries(src)) {
        result[Number(k)] = { ...v, children: { ...v.children } }
      }
      return result
    }

    const collectEdges = (rootNode: STNode, allNodes: Record<number, STNode>): Array<{ from: number; to: number; label: string; char: string }> => {
      const result: Array<{ from: number; to: number; label: string; char: string }> = []
      const visited = new Set<number>()
      const dfs = (node: STNode) => {
        if (visited.has(node.id)) return
        visited.add(node.id)
        for (const [ch, edge] of Object.entries(node.children)) {
          const targetNode = allNodes[edge.childId]
          if (targetNode) {
            result.push({
              from: node.id,
              to: targetNode.id,
              label: fullText.substring(edge.start, edge.end + 1),
              char: ch,
            })
            dfs(targetNode)
          }
        }
      }
      dfs(rootNode)
      return result
    }

    // Record initial state
    allSteps.push({
      description: `初始化: 创建根节点，准备插入字符串 "${fullText}" 的所有后缀`,
      nodes: { [root.id]: { ...root, children: { ...root.children } } },
      edges: [],
      highlightNode: root.id,
      highlightEdge: null,
      phase: '初始化',
    })

    for (let i = 0; i < fullText.length; i++) {
      nodeId = 0
      // Rebuild tree with suffixes 0..i
      root = createNode(false, 0)
      const allNodes: Record<number, STNode> = { [root.id]: root }

      for (let s = 0; s <= i; s++) {
        let current = root
        for (let j = s; j <= i; j++) {
          const ch = fullText[j]
          if (current.children[ch]) {
            const edge = current.children[ch]
            const edgeLen = edge.end - edge.start + 1
            let k = 0
            while (k < edgeLen && edge.start + k <= edge.end && j + k <= i && fullText[edge.start + k] === fullText[j + k]) {
              k++
            }
            if (k === edgeLen) {
              current = allNodes[edge.childId]
              j += k - 1
              continue
            }
            // Split
            if (edge.start + k <= edge.end && j + k <= i) {
              const splitNode = createNode(false, current.depth + k)
              allNodes[splitNode.id] = splitNode

              const midCh = fullText[edge.start + k]
              splitNode.children[midCh] = { start: edge.start + k, end: edge.end, childId: edge.childId }

              const newLeaf = createNode(true, current.depth + k + (i - j - k))
              allNodes[newLeaf.id] = newLeaf

              const newCh = fullText[j + k]
              splitNode.children[newCh] = { start: j + k, end: i, childId: newLeaf.id }

              edge.end = edge.start + k - 1
              edge.childId = splitNode.id
            }
          } else {
            const newLeaf = createNode(true, current.depth + (i - j + 1))
            allNodes[newLeaf.id] = newLeaf
            current.children[ch] = { start: j, end: i, childId: newLeaf.id }
          }
        }
      }

      const newEdges = collectEdges(root, allNodes)

      allSteps.push({
        description: `Phase ${i + 1}: 插入字符 '${fullText[i]}'，处理后缀 "${fullText.substring(0, i + 1)}" 的所有后缀`,
        nodes: cloneNodes(allNodes),
        edges: newEdges,
        highlightNode: null,
        highlightEdge: null,
        phase: `Phase ${i + 1}`,
      })

      // Highlight each suffix being inserted
      for (let s = 0; s <= i; s++) {
        allSteps.push({
          description: `  插入后缀 [${s}]: "${fullText.substring(s, i + 1)}"`,
          nodes: cloneNodes(allNodes),
          edges: newEdges,
          highlightNode: null,
          highlightEdge: `${s}-${i}`,
          phase: `Phase ${i + 1} - 后缀 ${s}`,
        })
      }
    }

    // Final state
    const finalEdges = collectEdges(root, allNodes)
    allSteps.push({
      description: `后缀树构建完成! 字符串 "${fullText}" 共有 ${fullText.length} 个后缀`,
      nodes: cloneNodes(allNodes),
      edges: finalEdges,
      highlightNode: root.id,
      highlightEdge: null,
      phase: '完成',
    })

    return allSteps
  }, [])

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
      setNodes(step.nodes)
      setEdges(step.edges)
      setHighlightNode(step.highlightNode)
      setHighlightEdge(step.highlightEdge)
      setDescription(step.description)
      setPhase(step.phase)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleBuild = () => {
    if (isPlaying) return
    setSearchResult([])
    const animationSteps = buildSuffixTreeSteps(text)
    executeSteps(animationSteps)
  }

  const handleSearch = () => {
    if (!searchPattern || Object.keys(nodes).length === 0) return
    const fullText = text + '$'
    const positions: number[] = []

    for (let i = 0; i <= fullText.length - searchPattern.length; i++) {
      if (fullText.substring(i, i + searchPattern.length) === searchPattern) {
        positions.push(i)
      }
    }
    setSearchResult(positions)

    if (positions.length > 0) {
      setDescription(`搜索 "${searchPattern}": 在位置 [${positions.join(', ')}] 找到 ${positions.length} 处匹配`)
    } else {
      setDescription(`搜索 "${searchPattern}": 未找到匹配`)
    }
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStep = () => {
    if (steps.length === 0 || currentStep >= steps.length) return
    const step = steps[currentStep]
    setNodes(step.nodes)
    setEdges(step.edges)
    setHighlightNode(step.highlightNode)
    setHighlightEdge(step.highlightEdge)
    setDescription(step.description)
    setPhase(step.phase)
    setCurrentStep(prev => prev + 1)
    setIsPlaying(false)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setNodes({})
    setEdges([])
    setHighlightNode(null)
    setHighlightEdge(null)
    setDescription('后缀树已重置')
    setSteps([])
    setCurrentStep(0)
    setPhase('就绪')
    setSearchResult([])
  }

  // Compute layout for tree visualization
  const computeLayout = (): TreeLayout[] => {
    const nodeList = Object.values(nodes)
    if (nodeList.length === 0) return []

    const layouts: TreeLayout[] = []
    const root = nodeList.find(n => n.id === 0)
    if (!root) return []

    const layoutNode = (node: STNode, x: number, y: number, xSpread: number): TreeLayout => {
      const layout: TreeLayout = {
        x,
        y,
        nodeId: node.id,
        children: [],
        edgeLabel: '',
      }

      const childEntries = Object.entries(node.children)
      const totalWidth = childEntries.length * xSpread
      let startX = x - totalWidth / 2 + xSpread / 2

      for (const [, edge] of childEntries) {
        const childNode = nodes[edge.childId]
        if (childNode) {
          const childLayout = layoutNode(childNode, startX, y + 80, xSpread * 0.7)
          childLayout.edgeLabel = text + '$'
          childLayout.edgeLabel = childLayout.edgeLabel.substring(edge.start, edge.end + 1)
          layout.children.push(childLayout)
          startX += xSpread
        }
      }

      return layout
    }

    const rootLayout = layoutNode(root, 400, 40, 200)
    layouts.push(rootLayout)

    // Flatten
    const flatten = (layout: TreeLayout): TreeLayout[] => {
      const result = [layout]
      for (const child of layout.children) {
        result.push(...flatten(child))
      }
      return result
    }

    return flatten(rootLayout)
  }

  const layoutNodes = computeLayout()

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          输入:
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isPlaying}
            style={{ padding: '0.3rem 0.6rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem', width: 120 }}
          />
        </label>
        <button className="btn btn-primary" onClick={handleBuild} disabled={isPlaying || !text}>
          构建后缀树
        </button>
        <button className="btn btn-secondary" onClick={handleStep} disabled={steps.length === 0 || currentStep >= steps.length}>
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
            min="100"
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-controls" style={{ borderTop: 'none', paddingTop: 0 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          搜索模式:
          <input
            type="text"
            value={searchPattern}
            onChange={(e) => setSearchPattern(e.target.value)}
            style={{ padding: '0.3rem 0.6rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.9rem', width: 100 }}
          />
        </label>
        <button className="btn btn-primary" onClick={handleSearch} disabled={!searchPattern || Object.keys(nodes).length === 0}>
          搜索
        </button>
        {searchResult.length > 0 && (
          <span style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>
            找到 {searchResult.length} 处: [{searchResult.join(', ')}]
          </span>
        )}
      </div>

      <div className="viz-canvas" style={{ overflow: 'auto', minHeight: 300 }}>
        {Object.keys(nodes).length > 0 ? (
          <svg width={800} height={Math.max(300, layoutNodes.reduce((max, n) => Math.max(max, n.y), 0) + 80)}>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
              </marker>
            </defs>

            {/* Draw edges */}
            {edges.map((edge, idx) => {
              const fromNode = layoutNodes.find(n => n.nodeId === edge.from)
              const toNode = layoutNodes.find(n => n.nodeId === edge.to)
              if (!fromNode || !toNode) return null

              const midX = (fromNode.x + toNode.x) / 2
              const midY = (fromNode.y + toNode.y) / 2

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y + 16}
                    x2={toNode.x}
                    y2={toNode.y - 16}
                    stroke="var(--border)"
                    strokeWidth={2}
                    markerEnd="url(#arrow)"
                  />
                  <rect
                    x={midX - 16}
                    y={midY - 10}
                    width={32}
                    height={20}
                    rx={4}
                    fill="var(--bg-card)"
                    stroke="var(--border)"
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    fill="var(--text-primary)"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    {edge.label}
                  </text>
                </g>
              )
            })}

            {/* Draw nodes */}
            {layoutNodes.map((layout) => {
              const node = nodes[layout.nodeId]
              if (!node) return null
              const isHighlight = layout.nodeId === highlightNode
              const radius = node.isLeaf ? 12 : 16

              return (
                <g key={`node-${layout.nodeId}`}>
                  <circle
                    cx={layout.x}
                    cy={layout.y}
                    r={radius}
                    fill={isHighlight ? 'var(--accent)' : node.isLeaf ? '#22c55e' : 'var(--bg-card)'}
                    stroke={isHighlight ? 'var(--accent)' : 'var(--border)'}
                    strokeWidth={isHighlight ? 3 : 2}
                  />
                  {!node.isLeaf && (
                    <text
                      x={layout.x}
                      y={layout.y + 4}
                      fill="var(--text-primary)"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      {node.id}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem 1rem' }}>
            输入字符串并点击「构建后缀树」开始演示
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>状态：</strong> {phase}
      </div>
      <div className="viz-info">
        <strong>说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          叶子节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          内部节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--accent)', borderRadius: 6, marginRight: 4, verticalAlign: 'middle' }} />
          高亮节点
        </span>
      </div>
    </div>
  )
}
