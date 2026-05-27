import { useState, useRef, useCallback, useEffect } from 'react'

interface Clause {
  a: string
  b: string
}

interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  scc: number
  assigned: boolean | null
  highlighted: boolean
  visiting: boolean
}

interface GraphEdge {
  from: string
  to: string
  highlighted: boolean
}

interface AnimationStep {
  description: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  phase: 'build' | 'scc' | 'assign' | 'done'
  sccColors: string[]
}

const SCC_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  '#14b8a6', '#a855f7', '#6366f1', '#84cc16',
]

const PRESET_CLAUSES: Clause[][] = [
  // 示例 1：可满足
  [
    { a: 'a', b: 'b' },
    { a: '¬a', b: 'c' },
    { a: '¬b', b: '¬c' },
  ],
  // 示例 2：不可满足
  [
    { a: 'a', b: 'b' },
    { a: '¬a', b: 'b' },
    { a: 'a', b: '¬b' },
    { a: '¬a', b: '¬b' },
  ],
  // 示例 3：链式约束
  [
    { a: 'a', b: '¬b' },
    { a: 'b', b: '¬c' },
    { a: 'c', b: '¬a' },
  ],
]

function negate(lit: string): string {
  return lit.startsWith('¬') ? lit.slice(1) : `¬${lit}`
}

function getVariables(clauses: Clause[]): string[] {
  const vars = new Set<string>()
  for (const c of clauses) {
    const a = c.a.startsWith('¬') ? c.a.slice(1) : c.a
    const b = c.b.startsWith('¬') ? c.b.slice(1) : c.b
    vars.add(a)
    vars.add(b)
  }
  return Array.from(vars).sort()
}

function generateSteps(clauses: Clause[]): AnimationStep[] {
  const steps: AnimationStep[] = []
  const variables = getVariables(clauses)

  // Create all nodes
  const allLits: string[] = []
  for (const v of variables) {
    allLits.push(v)
    allLits.push(`¬${v}`)
  }

  const makeNode = (lit: string, index: number, total: number): GraphNode => {
    const cols = Math.ceil(total / 2)
    const row = Math.floor(index / cols)
    const col = index % cols
    const xSpacing = 140
    const ySpacing = 100
    const offsetX = 60
    const offsetY = 50
    return {
      id: lit,
      label: lit,
      x: offsetX + col * xSpacing,
      y: offsetY + row * ySpacing,
      scc: -1,
      assigned: null,
      highlighted: false,
      visiting: false,
    }
  }

  const initialNodes = allLits.map((lit, i) => makeNode(lit, i, allLits.length))
  // Step 0: Initial state
  steps.push({
    description: `初始状态：${variables.length} 个变量，${clauses.length} 个子句。蕴含图有 ${allLits.length} 个节点。`,
    nodes: initialNodes.map(n => ({ ...n })),
    edges: [],
    phase: 'build',
    sccColors: [],
  })

  // Build edges step by step
  const allEdges: GraphEdge[] = []
  for (let i = 0; i < clauses.length; i++) {
    const c = clauses[i]
    const negA = negate(c.a)
    const negB = negate(c.b)
    allEdges.push({ from: negA, to: c.b, highlighted: false })
    allEdges.push({ from: negB, to: c.a, highlighted: false })

    const stepNodes = initialNodes.map(n => ({ ...n }))
    const stepEdges = allEdges.map((e, ei) => ({
      ...e,
      highlighted: ei >= allEdges.length - 2,
    }))

    // Highlight the clause nodes
    for (const n of stepNodes) {
      if (n.id === c.a || n.id === c.b || n.id === negA || n.id === negB) {
        n.highlighted = true
      }
    }

    steps.push({
      description: `添加子句 (${c.a} ∨ ${c.b})：添加边 ${negA} → ${c.b} 和 ${negB} → ${c.a}`,
      nodes: stepNodes,
      edges: stepEdges,
      phase: 'build',
      sccColors: [],
    })
  }

  // SCC phase - simulate Tarjan
  // We'll do a simplified SCC computation for visualization
  const adjList = new Map<string, string[]>()
  for (const lit of allLits) {
    adjList.set(lit, [])
  }
  for (const e of allEdges) {
    adjList.get(e.from)?.push(e.to)
  }

  // Simple SCC via DFS-based approach for visualization
  // Perform Tarjan-like DFS
  const dfn = new Map<string, number>()
  const low = new Map<string, number>()
  const stack: string[] = []
  const onStack = new Set<string>()
  const sccMap = new Map<string, number>()
  let timer = 0
  let sccCount = 0

  function tarjanDfs(u: string, visitedDuringStep: Set<string>) {
    dfn.set(u, ++timer)
    low.set(u, timer)
    stack.push(u)
    onStack.add(u)
    visitedDuringStep.add(u)

    for (const v of adjList.get(u) || []) {
      if (!dfn.has(v)) {
        tarjanDfs(v, visitedDuringStep)
        low.set(u, Math.min(low.get(u)!, low.get(v)!))
      } else if (onStack.has(v)) {
        low.set(u, Math.min(low.get(u)!, dfn.get(v)!))
      }
    }

    if (dfn.get(u) === low.get(u)) {
      const sccMembers: string[] = []
      while (true) {
        const v = stack.pop()!
        onStack.delete(v)
        sccMap.set(v, sccCount)
        sccMembers.push(v)
        if (v === u) break
      }
      sccCount++
    }
  }

  // Run Tarjan and capture steps
  const visitedGlobal = new Set<string>()
  for (const lit of allLits) {
    if (!visitedGlobal.has(lit)) {
      const visitedDuringStep = new Set<string>()
      tarjanDfs(lit, visitedDuringStep)

      // Add a step showing the DFS visit
      const stepNodes = initialNodes.map(n => {
        const copy = { ...n }
        if (visitedDuringStep.has(n.id)) {
          copy.visiting = true
        }
        copy.scc = sccMap.get(n.id) ?? -1
        return copy
      })

      steps.push({
        description: `DFS 从 ${lit} 出发，访问了 {${Array.from(visitedDuringStep).join(', ')}}`,
        nodes: stepNodes,
        edges: allEdges.map(e => ({ ...e, highlighted: false })),
        phase: 'scc',
        sccColors: SCC_COLORS.slice(0, sccCount),
      })

      visitedGlobal.add(lit)
    }
  }

  // Final SCC coloring step
  const sccNodes = initialNodes.map(n => ({
    ...n,
    scc: sccMap.get(n.id) ?? -1,
    highlighted: false,
    visiting: false,
  }))

  const sccDescriptions: string[] = []
  for (let i = 0; i < sccCount; i++) {
    const members = allLits.filter(l => sccMap.get(l) === i)
    sccDescriptions.push(`SCC ${i + 1}: {${members.join(', ')}}`)
  }

  steps.push({
    description: `SCC 计算完成，共 ${sccCount} 个强连通分量。${sccDescriptions.join(' | ')}`,
    nodes: sccNodes,
    edges: allEdges.map(e => ({ ...e, highlighted: false })),
    phase: 'scc',
    sccColors: SCC_COLORS.slice(0, sccCount),
  })

  // Check satisfiability
  let satisfiable = true
  for (const v of variables) {
    if (sccMap.get(v) === sccMap.get(`¬${v}`)) {
      satisfiable = false
      break
    }
  }

  if (!satisfiable) {
    // Highlight conflict
    const conflictNodes = sccNodes.map(n => {
      const copy = { ...n }
      for (const v of variables) {
        if (sccMap.get(v) === sccMap.get(`¬${v}`)) {
          if (n.id === v || n.id === `¬${v}`) {
            copy.highlighted = true
          }
        }
      }
      return copy
    })

    steps.push({
      description: `无解！存在变量 x 使得 x 和 ¬x 在同一个 SCC 中。`,
      nodes: conflictNodes,
      edges: allEdges.map(e => ({ ...e, highlighted: false })),
      phase: 'done',
      sccColors: SCC_COLORS.slice(0, sccCount),
    })
  } else {
    // Construct solution
    const assignment = new Map<string, boolean>()
    for (const v of variables) {
      if ((sccMap.get(v) ?? 0) > (sccMap.get(`¬${v}`) ?? 0)) {
        assignment.set(v, true)
      } else {
        assignment.set(v, false)
      }
    }

    // Assign step by step
    for (const v of variables) {
      const value = assignment.get(v)!
      const assignNodes = sccNodes.map(n => {
        const copy = { ...n }
        if (n.id === v) {
          copy.assigned = value
          copy.highlighted = true
        } else if (n.id === `¬${v}`) {
          copy.assigned = !value
          copy.highlighted = true
        }
        return copy
      })

      steps.push({
        description: `变量 ${v}：SCC(${v})=${(sccMap.get(v) ?? 0) + 1}，SCC(¬${v})=${(sccMap.get(`¬${v}`) ?? 0) + 1}。${sccMap.get(v)! > sccMap.get(`¬${v}`)! ? `SCC(${v}) 拓扑序更靠前` : `SCC(¬${v}) 拓扑序更靠前`}，赋值 ${v} = ${value}`,
        nodes: assignNodes,
        edges: allEdges.map(e => ({ ...e, highlighted: false })),
        phase: 'assign',
        sccColors: SCC_COLORS.slice(0, sccCount),
      })
    }

    // Final result
    const finalNodes = sccNodes.map(n => {
      const v = n.id.startsWith('¬') ? n.id.slice(1) : n.id
      const isNeg = n.id.startsWith('¬')
      const value = assignment.get(v)
      return {
        ...n,
        assigned: isNeg ? !value! : value!,
        highlighted: false,
      }
    })

    const solutionStr = variables.map(v => `${v}=${assignment.get(v)}`).join(', ')
    steps.push({
      description: `求解完成！合法赋值方案：${solutionStr}`,
      nodes: finalNodes,
      edges: allEdges.map(e => ({ ...e, highlighted: false })),
      phase: 'done',
      sccColors: SCC_COLORS.slice(0, sccCount),
    })
  }

  return steps
}

export default function TwoSatVisualization() {
  const [clauses, setClauses] = useState<Clause[]>(PRESET_CLAUSES[0])
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const timerRef = useRef<number | null>(null)

  const generateAndReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const newSteps = generateSteps(clauses)
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [clauses])

  useEffect(() => {
    generateAndReset()
  }, [generateAndReset])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStep = () => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handlePreset = (index: number) => {
    setClauses(PRESET_CLAUSES[index])
  }

  const step = steps[currentStep] || steps[0]
  if (!step) return <div>加载中...</div>

  const svgWidth = 560
  const svgHeight = 320

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying || steps.length === 0}>
          播放
        </button>
        <button className="btn btn-primary" onClick={handlePause} disabled={!isPlaying}>
          暂停
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying || currentStep >= steps.length - 1}>
          单步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
          示例:
        </span>
        {PRESET_CLAUSES.map((_, i) => (
          <button
            key={i}
            className="btn btn-secondary"
            onClick={() => handlePreset(i)}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
          >
            {i + 1}
          </button>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
          速度:
          <input
            type="range"
            min="300"
            max="3000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflow: 'auto', position: 'relative' }}>
        <svg width={svgWidth} height={svgHeight} style={{ display: 'block', margin: '0 auto' }}>
          <defs>
            <marker id="arrow-2sat" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
            <marker id="arrow-2sat-hl" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Edges */}
          {step.edges.map((edge, i) => {
            const fromNode = step.nodes.find(n => n.id === edge.from)
            const toNode = step.nodes.find(n => n.id === edge.to)
            if (!fromNode || !toNode) return null

            const dx = toNode.x - fromNode.x
            const dy = toNode.y - fromNode.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist === 0) return null
            const nodeRadius = 28
            const startX = fromNode.x + (dx / dist) * nodeRadius
            const startY = fromNode.y + (dy / dist) * nodeRadius
            const endX = toNode.x - (dx / dist) * nodeRadius
            const endY = toNode.y - (dy / dist) * nodeRadius

            return (
              <line
                key={`edge-${i}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={edge.highlighted ? '#f59e0b' : 'var(--border)'}
                strokeWidth={edge.highlighted ? 2.5 : 1.2}
                markerEnd={edge.highlighted ? 'url(#arrow-2sat-hl)' : 'url(#arrow-2sat)'}
                opacity={edge.highlighted ? 1 : 0.5}
              />
            )
          })}

          {/* Nodes */}
          {step.nodes.map((node) => {
            const isNeg = node.label.startsWith('¬')
            let fillColor = 'var(--bg-card)'
            let strokeColor = 'var(--border)'
            let textColor = 'var(--text-primary)'

            if (node.visiting) {
              fillColor = '#3b82f6'
              strokeColor = '#60a5fa'
              textColor = '#ffffff'
            } else if (node.scc >= 0) {
              fillColor = SCC_COLORS[node.scc % SCC_COLORS.length] + '33'
              strokeColor = SCC_COLORS[node.scc % SCC_COLORS.length]
            }

            if (node.highlighted) {
              strokeColor = '#f59e0b'
              fillColor = '#f59e0b33'
            }

            if (node.assigned === true) {
              fillColor = '#22c55e33'
              strokeColor = '#22c55e'
            } else if (node.assigned === false) {
              fillColor = '#ef444433'
              strokeColor = '#ef4444'
            }

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={28}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={node.highlighted || node.visiting ? 3 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  fill={textColor}
                  fontSize={isNeg ? '11' : '13'}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {node.label}
                </text>
                {node.assigned !== null && (
                  <text
                    x={node.x}
                    y={node.y + 18}
                    fill={node.assigned ? '#22c55e' : '#ef4444'}
                    fontSize="10"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="bold"
                  >
                    {node.assigned ? 'T' : 'F'}
                  </text>
                )}
                {node.scc >= 0 && (
                  <text
                    x={node.x}
                    y={node.y - 18}
                    fill={SCC_COLORS[node.scc % SCC_COLORS.length]}
                    fontSize="9"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    SCC{node.scc + 1}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="viz-info">
        <strong>步骤 {currentStep + 1}/{steps.length} ({step.phase === 'build' ? '建图' : step.phase === 'scc' ? 'SCC' : step.phase === 'assign' ? '赋值' : '完成'})：</strong> {step.description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>当前子句：</strong>
        {clauses.map((c, i) => (
          <span key={i} style={{ marginLeft: '0.75rem' }}>
            ({c.a} ∨ {c.b})
          </span>
        ))}
      </div>
    </div>
  )
}
