import { useState, useEffect, useRef, useCallback } from 'react'

// --- Types ---

interface TreeNode {
  id: string
  arr: number[]
  depth: number
  parentId?: string
  children: string[]
  state: 'pending' | 'dividing' | 'conquering' | 'merging' | 'done'
  result?: number[]
  x: number
  y: number
}

interface DcStep {
  nodes: Map<string, TreeNode>
  activeId: string | null
  desc: string
  phase: 'divide' | 'conquer' | 'merge'
}

// --- Helpers ---

function cloneNodes(source: Map<string, TreeNode>): Map<string, TreeNode> {
  const cloned = new Map<string, TreeNode>()
  for (const [key, val] of source) {
    cloned.set(key, { ...val, arr: [...val.arr], children: [...val.children], result: val.result ? [...val.result] : undefined })
  }
  return cloned
}

function buildTreeSteps(arr: number[]): DcStep[] {
  const steps: DcStep[] = []
  const nodes = new Map<string, TreeNode>()
  let nodeId = 0

  function createNode(a: number[], depth: number, parentId?: string): string {
    const id = `n${nodeId++}`
    const node: TreeNode = {
      id,
      arr: [...a],
      depth,
      parentId,
      children: [],
      state: 'pending',
      x: 0,
      y: 0,
    }
    nodes.set(id, node)
    if (parentId) {
      const p = nodes.get(parentId)
      if (p) p.children.push(id)
    }
    return id
  }

  function assignPositions(): void {
    // BFS level-order positioning
    const levels: string[][] = []
    const queue: Array<{ id: string; depth: number }> = [{ id: 'n0', depth: 0 }]
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!
      while (levels.length <= depth) levels.push([])
      levels[depth].push(id)
      const node = nodes.get(id)
      if (node) {
        for (const childId of node.children) {
          queue.push({ id: childId, depth: depth + 1 })
        }
      }
    }

    const verticalGap = 70
    for (let d = 0; d < levels.length; d++) {
      const row = levels[d]
      const totalWidth = row.length * 90
      const startX = 400 - totalWidth / 2 + 45
      for (let i = 0; i < row.length; i++) {
        const node = nodes.get(row[i])
        if (node) {
          node.x = startX + i * 90
          node.y = 30 + d * verticalGap
        }
      }
    }
  }

  function trace(a: number[], depth: number, parentId?: string): number[] {
    const nid = createNode(a, depth, parentId)
    const node = nodes.get(nid)!

    // Record: entering this node
    node.state = 'dividing'
    assignPositions()
    steps.push({
      nodes: cloneNodes(nodes),
      activeId: nid,
      desc: `分解: [${a.join(', ')}] (长度=${a.length})`,
      phase: 'divide',
    })

    if (a.length <= 1) {
      node.state = 'conquering'
      node.result = [...a]
      assignPositions()
      steps.push({
        nodes: cloneNodes(nodes),
        activeId: nid,
        desc: `基本情况: [${a.join(', ')}] 直接返回`,
        phase: 'conquer',
      })
      node.state = 'done'
      return a
    }

    const mid = Math.floor(a.length / 2)
    const left = trace(a.slice(0, mid), depth + 1, nid)
    const right = trace(a.slice(mid), depth + 1, nid)

    // Merge
    node.state = 'merging'
    assignPositions()
    steps.push({
      nodes: cloneNodes(nodes),
      activeId: nid,
      desc: `合并: [${left.join(', ')}] + [${right.join(', ')}]`,
      phase: 'merge',
    })

    const merged: number[] = []
    let i = 0
    let j = 0
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        merged.push(left[i])
        i++
      } else {
        merged.push(right[j])
        j++
      }
    }
    while (i < left.length) merged.push(left[i++])
    while (j < right.length) merged.push(right[j++])

    node.result = merged
    node.state = 'done'
    assignPositions()
    steps.push({
      nodes: cloneNodes(nodes),
      activeId: nid,
      desc: `结果: [${merged.join(', ')}]`,
      phase: 'merge',
    })

    return merged
  }

  trace(arr, 0)
  return steps
}

// --- Component ---

export default function DivideConquerVisualization() {
  const [inputStr, setInputStr] = useState('38,27,43,3,9,82,10')
  const [steps, setSteps] = useState<DcStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(900)
  const [nodes, setNodes] = useState<Map<string, TreeNode>>(new Map())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [phase, setPhase] = useState<'divide' | 'conquer' | 'merge'>('divide')
  const timerRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const parseInput = useCallback((): number[] => {
    return inputStr
      .split(/[,，\s]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n))
  }, [inputStr])

  const initDemo = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const arr = parseInput()
    if (arr.length === 0 || arr.length > 15) return

    const generated = buildTreeSteps(arr)
    setSteps(generated)
    if (generated.length > 0) {
      setNodes(generated[0].nodes)
      setActiveId(generated[0].activeId)
      setDescription(generated[0].desc)
      setPhase(generated[0].phase)
    }
  }, [parseInput])

  const applyStep = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < steps.length) {
        const s = steps[idx]
        setNodes(s.nodes)
        setActiveId(s.activeId)
        setDescription(s.desc)
        setPhase(s.phase)
      }
    },
    [steps]
  )

  useEffect(() => {
    initDemo()
  }, [initDemo])

  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }
    applyStep(currentStep)
    timerRef.current = window.setTimeout(() => {
      if (currentStep + 1 < steps.length) {
        setCurrentStep(prev => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }, speed)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, steps.length, speed, applyStep])

  const togglePlay = () => {
    if (steps.length === 0) {
      initDemo()
      setTimeout(() => setIsPlaying(true), 100)
      return
    }
    setIsPlaying(prev => !prev)
  }

  const stepForward = () => {
    if (steps.length === 0) {
      initDemo()
      return
    }
    setIsPlaying(false)
    const next = currentStep + 1
    if (next < steps.length) {
      setCurrentStep(next)
      applyStep(next)
    }
  }

  const stepBackward = () => {
    setIsPlaying(false)
    const prev = currentStep - 1
    if (prev >= 0) {
      setCurrentStep(prev)
      applyStep(prev)
    }
  }

  const reset = () => {
    initDemo()
  }

  const renderTree = () => {
    const nodeArr = Array.from(nodes.values())
    if (nodeArr.length === 0) {
      return (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
          输入数组并点击"初始化"开始演示
        </div>
      )
    }

    // Build edges
    const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
    for (const node of nodeArr) {
      for (const childId of node.children) {
        const child = nodes.get(childId)
        if (child) {
          edges.push({ x1: node.x, y1: node.y + 16, x2: child.x, y2: child.y - 16 })
        }
      }
    }

    const maxX = Math.max(...nodeArr.map(n => n.x)) + 80
    const maxY = Math.max(...nodeArr.map(n => n.y)) + 50
    const svgW = Math.max(500, maxX + 40)
    const svgH = Math.max(250, maxY + 30)

    return (
      <div style={{ overflowX: 'auto', width: '100%' }} ref={canvasRef}>
        <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto' }}>
          {edges.map((e, i) => (
            <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="var(--border)" strokeWidth={1.5} />
          ))}
          {nodeArr.map(node => {
            const isActive = node.id === activeId
            const fill =
              node.state === 'done'
                ? 'var(--success)'
                : node.state === 'merging'
                  ? 'var(--accent)'
                  : node.state === 'dividing'
                    ? 'var(--warning)'
                    : 'var(--bg-card)'
            const textColor = node.state !== 'pending' ? 'white' : 'var(--text-primary)'
            const label = node.result
              ? `[${node.result.join(',')}]`
              : `[${node.arr.join(',')}]`

            return (
              <g key={node.id}>
                <rect
                  x={node.x - 35}
                  y={node.y - 14}
                  width={70}
                  height={28}
                  rx={6}
                  fill={fill}
                  stroke={isActive ? 'var(--text-primary)' : 'var(--border)'}
                  strokeWidth={isActive ? 3 : 1}
                  style={{ transition: 'all 0.3s' }}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textColor}
                  fontSize="9"
                  fontWeight="bold"
                >
                  {label.length > 12 ? label.slice(0, 11) + '..' : label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // Work per level summary
  const renderWorkSummary = () => {
    if (nodes.size === 0) return null
    const levels = new Map<number, TreeNode[]>()
    for (const node of nodes.values()) {
      const arr = levels.get(node.depth) || []
      arr.push(node)
      levels.set(node.depth, arr)
    }

    const maxDepth = Math.max(...Array.from(levels.keys()))
    return (
      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>每层工作量:</div>
        {Array.from({ length: maxDepth + 1 }, (_, d) => {
          const levelNodes = levels.get(d) || []
          return (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
              <span style={{ minWidth: '50px' }}>第 {d} 层:</span>
              <div
                style={{
                  height: '8px',
                  width: `${Math.min(200, levelNodes.length * 20)}px`,
                  background: 'var(--accent)',
                  borderRadius: '4px',
                  opacity: 0.7,
                }}
              />
              <span>{levelNodes.length} 个子问题</span>
            </div>
          )
        })}
      </div>
    )
  }

  const phaseLabel = phase === 'divide' ? '分解阶段' : phase === 'merge' ? '合并阶段' : '求解阶段'

  return (
    <div className="visualization-container">
      {/* Input */}
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          数组:
          <input
            type="text"
            value={inputStr}
            onChange={e => setInputStr(e.target.value)}
            placeholder="用逗号分隔，如: 38,27,43,3"
            style={{
              padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '220px',
            }}
          />
        </label>
        <button className="btn btn-primary" onClick={initDemo}>
          初始化
        </button>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={reset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
          <input
            type="range"
            min="300"
            max="2000"
            step="100"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          {speed}ms
        </label>
      </div>

      {/* Info bar */}
      <div className="viz-info">
        <span>步骤: {steps.length > 0 ? currentStep + 1 : 0} / {steps.length}</span>
        <span style={{ marginLeft: '1.5rem', fontWeight: 600, color: 'var(--accent)' }}>{phaseLabel}</span>
      </div>

      {/* Main canvas */}
      <div className="viz-canvas" style={{ minHeight: '280px', padding: '0.5rem' }}>
        {renderTree()}
      </div>

      {/* Description */}
      {description && (
        <div className="viz-info" style={{ fontWeight: 500 }}>
          {description}
        </div>
      )}

      {/* Work summary */}
      {renderWorkSummary()}

      {/* Legend */}
      {nodes.size > 0 && (
        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '3px', background: 'var(--warning)', marginRight: 4, verticalAlign: 'middle' }} />
            分解中
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '3px', background: 'var(--accent)', marginRight: 4, verticalAlign: 'middle' }} />
            合并中
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '3px', background: 'var(--success)', marginRight: 4, verticalAlign: 'middle' }} />
            已完成
          </span>
          <span>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '3px', background: 'var(--bg-card)', border: '1px solid var(--border)', marginRight: 4, verticalAlign: 'middle' }} />
            等待中
          </span>
        </div>
      )}
    </div>
  )
}
