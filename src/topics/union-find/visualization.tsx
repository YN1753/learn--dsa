import { useState, useEffect, useRef, useCallback } from 'react'

interface UFNode {
  id: number
  x: number
  y: number
}

interface UFEdge {
  from: number
  to: number
}

type NodeState = 'normal' | 'highlight' | 'path' | 'root'

interface StepSnapshot {
  parent: number[]
  rank: number[]
  description: string
  highlightedNodes: Set<number>
  highlightedEdges: [number, number][]
  nodeStates: Map<number, NodeState>
}

const SVG_WIDTH = 780
const SVG_HEIGHT = 440
const NODE_RADIUS = 22

const NODE_COLORS: Record<NodeState, { fill: string; stroke: string; text: string }> = {
  normal: { fill: 'var(--bg-card)', stroke: 'var(--border)', text: 'var(--text-primary)' },
  highlight: { fill: 'rgba(245, 158, 11, 0.3)', stroke: '#f59e0b', text: '#f59e0b' },
  path: { fill: 'rgba(239, 68, 68, 0.3)', stroke: '#ef4444', text: '#ef4444' },
  root: { fill: 'var(--accent)', stroke: '#60a5fa', text: '#ffffff' },
}

function getNodePositions(n: number): UFNode[] {
  const positions: UFNode[] = []
  const cols = 4
  const spacingX = SVG_WIDTH / (cols + 1)
  const spacingY = SVG_HEIGHT / (Math.ceil(n / cols) + 1)
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    positions.push({
      id: i,
      x: spacingX * (col + 1),
      y: spacingY * (row + 1),
    })
  }
  return positions
}

function buildEdges(parent: number[]): UFEdge[] {
  const edges: UFEdge[] = []
  for (let i = 0; i < parent.length; i++) {
    if (parent[i] !== i) {
      edges.push({ from: i, to: parent[i] })
    }
  }
  return edges
}

function findRoot(parent: number[], x: number): number {
  let cur = x
  while (parent[cur] !== cur) {
    cur = parent[cur]
  }
  return cur
}

function findPath(parent: number[], x: number): number[] {
  const path: number[] = []
  let cur = x
  while (parent[cur] !== cur) {
    path.push(cur)
    cur = parent[cur]
  }
  path.push(cur)
  return path
}

function generateUnionSteps(
  parent: number[],
  rank: number[],
  a: number,
  b: number,
  useRank: boolean,
  usePathCompression: boolean,
): StepSnapshot[] {
  const steps: StepSnapshot[] = []
  const p = [...parent]
  const r = [...rank]

  // Find root of a
  const pathA = findPath(p, a)
  steps.push({
    parent: [...p],
    rank: [...r],
    description: `查找 ${a} 的根: 沿路径 [${pathA.join(' → ')}] 追溯`,
    highlightedNodes: new Set(pathA),
    highlightedEdges: pathA.slice(0, -1).map((n, i) => [n, pathA[i + 1]] as [number, number]),
    nodeStates: new Map([
      ...pathA.map((n): [number, NodeState] => [n, 'path']),
      [pathA[pathA.length - 1], 'root'] as [number, NodeState],
    ]),
  })

  if (usePathCompression) {
    const rootA = pathA[pathA.length - 1]
    for (const node of pathA.slice(0, -1)) {
      p[node] = rootA
    }
    steps.push({
      parent: [...p],
      rank: [...r],
      description: `路径压缩: 将 [${pathA.slice(0, -1).join(', ')}] 直接指向根 ${rootA}`,
      highlightedNodes: new Set(pathA),
      highlightedEdges: pathA.slice(0, -1).map((n) => [n, rootA] as [number, number]),
      nodeStates: new Map([
        ...pathA.map((n): [number, NodeState] => [n, 'highlight']),
        [rootA, 'root'] as [number, NodeState],
      ]),
    })
  }

  // Find root of b
  const pathB = findPath(p, b)
  steps.push({
    parent: [...p],
    rank: [...r],
    description: `查找 ${b} 的根: 沿路径 [${pathB.join(' → ')}] 追溯`,
    highlightedNodes: new Set(pathB),
    highlightedEdges: pathB.slice(0, -1).map((n, i) => [n, pathB[i + 1]] as [number, number]),
    nodeStates: new Map([
      ...pathB.map((n): [number, NodeState] => [n, 'path']),
      [pathB[pathB.length - 1], 'root'] as [number, NodeState],
    ]),
  })

  if (usePathCompression) {
    const rootB = pathB[pathB.length - 1]
    for (const node of pathB.slice(0, -1)) {
      p[node] = rootB
    }
    steps.push({
      parent: [...p],
      rank: [...r],
      description: `路径压缩: 将 [${pathB.slice(0, -1).join(', ')}] 直接指向根 ${rootB}`,
      highlightedNodes: new Set(pathB),
      highlightedEdges: pathB.slice(0, -1).map((n) => [n, rootB] as [number, number]),
      nodeStates: new Map([
        ...pathB.map((n): [number, NodeState] => [n, 'highlight']),
        [rootB, 'root'] as [number, NodeState],
      ]),
    })
  }

  // Union
  const rootA = findRoot(p, a)
  const rootB = findRoot(p, b)

  if (rootA === rootB) {
    steps.push({
      parent: [...p],
      rank: [...r],
      description: `${a} 和 ${b} 已在同一集合（根都是 ${rootA}），无需合并`,
      highlightedNodes: new Set([a, b, rootA]),
      highlightedEdges: [],
      nodeStates: new Map([
        [rootA, 'root'] as [number, NodeState],
        [a, 'highlight'] as [number, NodeState],
        [b, 'highlight'] as [number, NodeState],
      ]),
    })
    return steps
  }

  let newRoot: number
  let mergedRoot: number
  let desc: string

  if (useRank) {
    if (r[rootA] < r[rootB]) {
      p[rootA] = rootB
      newRoot = rootB
      mergedRoot = rootA
      desc = `按秩合并: rank(${rootA})=${r[rootA]} < rank(${rootB})=${r[rootB]}，将 ${rootA} 挂到 ${rootB} 下`
    } else if (r[rootA] > r[rootB]) {
      p[rootB] = rootA
      newRoot = rootA
      mergedRoot = rootB
      desc = `按秩合并: rank(${rootA})=${r[rootA]} > rank(${rootB})=${r[rootB]}，将 ${rootB} 挂到 ${rootA} 下`
    } else {
      p[rootB] = rootA
      r[rootA]++
      newRoot = rootA
      mergedRoot = rootB
      desc = `按秩合并: rank 相同(${r[rootA]})，将 ${rootB} 挂到 ${rootA} 下，rank(${rootA})++`
    }
  } else {
    p[rootA] = rootB
    newRoot = rootB
    mergedRoot = rootA
    desc = `朴素合并: 将 ${rootA} 挂到 ${rootB} 下`
  }

  steps.push({
    parent: [...p],
    rank: [...r],
    description: desc,
    highlightedNodes: new Set([rootA, rootB, a, b]),
    highlightedEdges: [[mergedRoot, newRoot]],
    nodeStates: new Map([
      [newRoot, 'root'] as [number, NodeState],
      [mergedRoot, 'highlight'] as [number, NodeState],
      [a, 'highlight'] as [number, NodeState],
      [b, 'highlight'] as [number, NodeState],
    ]),
  })

  return steps
}

function generateFindSteps(
  parent: number[],
  x: number,
  usePathCompression: boolean,
): StepSnapshot[] {
  const steps: StepSnapshot[] = []
  const p = [...parent]

  const path = findPath(p, x)

  // Trace step by step
  for (let i = 0; i < path.length; i++) {
    const partialPath = path.slice(0, i + 1)
    const isRoot = i === path.length - 1
    steps.push({
      parent: [...p],
      rank: new Array(p.length).fill(0),
      description: isRoot
        ? `到达根节点 ${path[i]}，Find(${x}) = ${path[i]}`
        : `从 ${path[i]} 出发，parent[${path[i]}] = ${path[i + 1]}`,
      highlightedNodes: new Set(partialPath),
      highlightedEdges: partialPath.slice(0, -1).map((n, j) => [n, partialPath[j + 1]] as [number, number]),
      nodeStates: new Map([
        ...partialPath.slice(0, -1).map((n): [number, NodeState] => [n, 'path']),
        [path[i], isRoot ? 'root' : 'highlight'] as [number, NodeState],
      ]),
    })
  }

  if (usePathCompression && path.length > 2) {
    const root = path[path.length - 1]
    for (const node of path.slice(0, -1)) {
      p[node] = root
    }
    steps.push({
      parent: [...p],
      rank: new Array(p.length).fill(0),
      description: `路径压缩: 将 [${path.slice(0, -1).join(', ')}] 直接指向根 ${root}`,
      highlightedNodes: new Set(path),
      highlightedEdges: path.slice(0, -1).map((n) => [n, root] as [number, number]),
      nodeStates: new Map([
        ...path.map((n): [number, NodeState] => [n, 'highlight']),
        [root, 'root'] as [number, NodeState],
      ]),
    })
  }

  return steps
}

export default function UnionFindVisualization() {
  const N = 8
  const [parent, setParent] = useState<number[]>([])
  const [rank, setRank] = useState<number[]>([])
  const [nodes, setNodes] = useState<UFNode[]>([])
  const [edges, setEdges] = useState<UFEdge[]>([])
  const [steps, setSteps] = useState<StepSnapshot[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('选择操作并点击"执行"按钮')
  const [nodeStates, setNodeStates] = useState<Map<number, NodeState>>(new Map())
  const [usePathCompression, setUsePathCompression] = useState(true)
  const [useRank, setUseRank] = useState(true)
  const [operation, setOperation] = useState<'union' | 'find'>('union')
  const [inputA, setInputA] = useState(0)
  const [inputB, setInputB] = useState(1)

  const timerRef = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const resetUF = useCallback(() => {
    const p = new Array(N)
    const r = new Array(N).fill(0)
    for (let i = 0; i < N; i++) p[i] = i
    setParent(p)
    setRank(r)
    setNodes(getNodePositions(N))
    setEdges([])
    setSteps([])
    setCurrentStep(-1)
    setIsPlaying(false)
    const initStates = new Map<number, NodeState>()
    for (let i = 0; i < N; i++) initStates.set(i, 'normal')
    setNodeStates(initStates)
    setDescription('已重置，选择操作并点击"执行"按钮')
  }, [])

  useEffect(() => {
    resetUF()
  }, [resetUF])

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const applyStep = useCallback((step: StepSnapshot) => {
    setEdges(buildEdges(step.parent))
    setNodeStates(step.nodeStates)
    setDescription(step.description)
  }, [])

  const handleExecute = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setCurrentStep(-1)

    let generatedSteps: StepSnapshot[]
    if (operation === 'union') {
      generatedSteps = generateUnionSteps(parent, rank, inputA, inputB, useRank, usePathCompression)
    } else {
      generatedSteps = generateFindSteps(parent, inputA, usePathCompression)
    }

    setSteps(generatedSteps)

    if (generatedSteps.length > 0) {
      const first = generatedSteps[0]
      applyStep(first)
      setCurrentStep(0)
      setIsPlaying(true)

      // Apply last step's parent/rank as the final state
      const lastStep = generatedSteps[generatedSteps.length - 1]

      let stepIdx = 0
      timerRef.current = window.setInterval(() => {
        stepIdx++
        if (stepIdx >= generatedSteps.length) {
          clearTimer()
          setIsPlaying(false)
          // Update actual parent/rank state
          setParent(lastStep.parent)
          setRank(lastStep.rank)
          setDescription(operation === 'union'
            ? `Union(${inputA}, ${inputB}) 完成`
            : `Find(${inputA}) = ${lastStep.parent[inputA]} 完成`)
          return
        }
        const step = generatedSteps[stepIdx]
        applyStep(step)
        setCurrentStep(stepIdx)
      }, speed)
    }
  }, [operation, parent, rank, inputA, inputB, useRank, usePathCompression, speed, clearTimer, applyStep])

  const togglePlay = useCallback(() => {
    if (steps.length === 0) return

    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription('已暂停')
    } else {
      if (currentStep >= steps.length - 1) {
        handleExecute()
        return
      }

      setIsPlaying(true)
      const lastStep = steps[steps.length - 1]
      let stepIdx = currentStep
      timerRef.current = window.setInterval(() => {
        stepIdx++
        if (stepIdx >= steps.length) {
          clearTimer()
          setIsPlaying(false)
          setParent(lastStep.parent)
          setRank(lastStep.rank)
          setDescription(operation === 'union'
            ? `Union(${inputA}, ${inputB}) 完成`
            : `Find(${inputA}) = ${lastStep.parent[inputA]} 完成`)
          return
        }
        const step = steps[stepIdx]
        applyStep(step)
        setCurrentStep(stepIdx)
      }, speed)
    }
  }, [isPlaying, steps, currentStep, speed, operation, inputA, inputB, clearTimer, handleExecute, applyStep])

  const handleStepForward = useCallback(() => {
    if (steps.length === 0 || currentStep >= steps.length - 1) return
    clearTimer()
    setIsPlaying(false)
    const nextStep = currentStep + 1
    applyStep(steps[nextStep])
    setCurrentStep(nextStep)
  }, [steps, currentStep, clearTimer, applyStep])

  const handleStepBackward = useCallback(() => {
    if (steps.length === 0 || currentStep <= 0) return
    clearTimer()
    setIsPlaying(false)
    const prevStep = currentStep - 1
    applyStep(steps[prevStep])
    setCurrentStep(prevStep)
  }, [steps, currentStep, clearTimer, applyStep])

  const handleReset = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    resetUF()
  }, [clearTimer, resetUF])

  const getRoots = useCallback((): Set<number> => {
    const roots = new Set<number>()
    for (let i = 0; i < parent.length; i++) {
      if (parent[i] === i) roots.add(i)
    }
    return roots
  }, [parent])

  const roots = getRoots()
  const edgesToShow = edges

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <select
          value={operation}
          onChange={e => {
            setOperation(e.target.value as 'union' | 'find')
            setSteps([])
            setCurrentStep(-1)
          }}
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
          }}
        >
          <option value="union">Union 合并</option>
          <option value="find">Find 查找</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          元素 A:
          <input
            type="number"
            min={0}
            max={N - 1}
            value={inputA}
            onChange={e => setInputA(parseInt(e.target.value) || 0)}
            style={{
              width: '3rem',
              padding: '0.3rem',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              textAlign: 'center',
            }}
          />
        </label>

        {operation === 'union' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            元素 B:
            <input
              type="number"
              min={0}
              max={N - 1}
              value={inputB}
              onChange={e => setInputB(parseInt(e.target.value) || 0)}
              style={{
                width: '3rem',
                padding: '0.3rem',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            />
          </label>
        )}

        <button className="btn btn-primary" onClick={handleExecute}>
          执行
        </button>
        <button className="btn btn-secondary" onClick={togglePlay} disabled={steps.length === 0}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleStepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
      </div>

      <div className="viz-controls" style={{ marginTop: '0.3rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={usePathCompression}
            onChange={e => setUsePathCompression(e.target.checked)}
          />
          路径压缩
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useRank}
            onChange={e => setUseRank(e.target.checked)}
          />
          按秩合并
        </label>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
          速度:
        </span>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={2200 - speed}
          onChange={e => setSpeed(2200 - parseInt(e.target.value))}
          title={`速度: ${speed}ms`}
        />
      </div>

      <div className="viz-canvas" style={{ padding: '0.5rem', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          style={{ display: 'block' }}
        >
          <defs>
            <filter id="ufGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" opacity="0.6" />
            </marker>
          </defs>

          {/* Edges (parent pointers) */}
          {edgesToShow.map((edge, i) => {
            const fromNode = nodes.find(n => n.id === edge.from)
            const toNode = nodes.find(n => n.id === edge.to)
            if (!fromNode || !toNode) return null

            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const offsetX = (dx / dist) * NODE_RADIUS
            const offsetY = (dy / dist) * NODE_RADIUS

            const isHighlighted = steps.length > 0 && currentStep >= 0 &&
              steps[currentStep]?.highlightedEdges.some(([f, t]) => f === edge.from && t === edge.to)

            return (
              <line
                key={`edge-${i}`}
                x1={fromNode.x + offsetX}
                y1={fromNode.y + offsetY}
                x2={toNode.x - offsetX}
                y2={toNode.y - offsetY}
                stroke={isHighlighted ? '#ef4444' : 'var(--text-secondary)'}
                strokeWidth={isHighlighted ? 3 : 2}
                strokeOpacity={isHighlighted ? 1 : 0.4}
                markerEnd="url(#arrowhead)"
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const state = nodeStates.get(node.id) || 'normal'
            const colors = NODE_COLORS[state]
            const isRoot = parent[node.id] === node.id
            const isCurrent = state === 'root' || state === 'highlight' || state === 'path'

            return (
              <g
                key={node.id}
                filter={isCurrent ? 'url(#ufGlow)' : undefined}
              >
                {/* Root indicator ring */}
                {isRoot && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS + 4}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    opacity={0.5}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={NODE_RADIUS}
                  fill={isRoot ? NODE_COLORS.root.fill : colors.fill}
                  stroke={isRoot ? NODE_COLORS.root.stroke : colors.stroke}
                  strokeWidth={isCurrent ? 3 : 2}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isRoot ? NODE_COLORS.root.text : colors.text}
                  fontSize="14"
                  fontWeight="600"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ transition: 'fill 0.3s ease', pointerEvents: 'none' }}
                >
                  {node.id}
                </text>
                {/* Parent label */}
                <text
                  x={node.x}
                  y={node.y + NODE_RADIUS + 14}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  p={parent[node.id]}
                </text>
              </g>
            )
          })}

          {/* Legend */}
          <g transform={`translate(15, ${SVG_HEIGHT - 40})`}>
            <circle cx={0} cy={0} r={7} fill={NODE_COLORS.root.fill} stroke={NODE_COLORS.root.stroke} strokeWidth={1.5} />
            <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">根节点</text>
            <circle cx={70} cy={0} r={7} fill={NODE_COLORS.normal.fill} stroke={NODE_COLORS.normal.stroke} strokeWidth={1.5} />
            <text x={82} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">普通节点</text>
            <circle cx={160} cy={0} r={7} fill={NODE_COLORS.path.fill} stroke={NODE_COLORS.path.stroke} strokeWidth={1.5} />
            <text x={172} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">查找路径</text>
            <circle cx={240} cy={0} r={7} fill={NODE_COLORS.highlight.fill} stroke={NODE_COLORS.highlight.stroke} strokeWidth={1.5} />
            <text x={252} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">高亮</text>
            <text x={300} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="11">虚线环 = 根节点</text>
          </g>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>Parent 数组</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            [{parent.join(', ')}]
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>Rank 数组</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            [{rank.join(', ')}]
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>连通分量</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace', minHeight: '1.5em' }}>
            {roots.size} 个集合
          </div>
        </div>
        {steps.length > 0 && (
          <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
            <strong>步骤进度</strong>
            <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
              {currentStep + 1} / {steps.length}
            </div>
          </div>
        )}
      </div>

      <div className="viz-info">
        {description}
      </div>
    </div>
  )
}
