import { useState, useEffect, useRef, useCallback } from 'react'

interface Edge {
  u: number
  v: number
  weight: number
  id: string
}

interface Step {
  description: string
  edges: Edge[]
  selectedIds: Set<string>
  rejectedIds: Set<string>
  currentId: string | null
}

interface VertexPos {
  x: number
  y: number
}

const VERTICES: VertexPos[] = [
  { x: 200, y: 60 },
  { x: 80, y: 200 },
  { x: 320, y: 200 },
  { x: 200, y: 340 },
]

const INITIAL_EDGES: Edge[] = [
  { u: 0, v: 1, weight: 4, id: 'e1' },
  { u: 0, v: 2, weight: 2, id: 'e2' },
  { u: 1, v: 2, weight: 3, id: 'e3' },
  { u: 1, v: 3, weight: 7, id: 'e4' },
  { u: 2, v: 3, weight: 5, id: 'e5' },
]

const VERTEX_LABELS = ['A', 'B', 'C', 'D']

class UnionFind {
  parent: number[]
  rankArr: number[]
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.rankArr = new Array(n).fill(0)
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x])
    return this.parent[x]
  }
  union(x: number, y: number): boolean {
    const rx = this.find(x)
    const ry = this.find(y)
    if (rx === ry) return false
    if (this.rankArr[rx] < this.rankArr[ry]) this.parent[rx] = ry
    else if (this.rankArr[rx] > this.rankArr[ry]) this.parent[ry] = rx
    else { this.parent[ry] = rx; this.rankArr[rx]++ }
    return true
  }
}

export default function MatroidVisualization() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set())
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [description, setDescription] = useState<string>('图拟阵贪心 - 点击「开始贪心」观察 Kruskal 算法过程')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [sortedEdges, setSortedEdges] = useState<Edge[]>([])
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback((): Step[] => {
    const sorted = [...INITIAL_EDGES].sort((a, b) => a.weight - b.weight)
    const uf = new UnionFind(VERTICES.length)
    const result: Step[] = []
    const sel = new Set<string>()
    const rej = new Set<string>()

    result.push({
      description: `按权重排序边: ${sorted.map(e => `${eLabel(e)}(${e.weight})`).join(', ')}`,
      edges: sorted,
      selectedIds: new Set(sel),
      rejectedIds: new Set(rej),
      currentId: null,
    })

    for (const edge of sorted) {
      const added = uf.union(edge.u, edge.v)
      if (added) {
        sel.add(edge.id)
        result.push({
          description: `边 ${eLabel(edge)} 权重=${edge.weight}: 不形成环 -> 选择加入生成树`,
          edges: sorted,
          selectedIds: new Set(sel),
          rejectedIds: new Set(rej),
          currentId: edge.id,
        })
        if (sel.size === VERTICES.length - 1) {
          result.push({
            description: `已选够 ${VERTICES.length - 1} 条边，最小生成树构建完成！总权重 = ${[...sel].reduce((s, id) => s + (sorted.find(e => e.id === id)?.weight ?? 0), 0)}`,
            edges: sorted,
            selectedIds: new Set(sel),
            rejectedIds: new Set(rej),
            currentId: null,
          })
          break
        }
      } else {
        rej.add(edge.id)
        result.push({
          description: `边 ${eLabel(edge)} 权重=${edge.weight}: 会形成环 -> 拒绝（违反独立性）`,
          edges: sorted,
          selectedIds: new Set(sel),
          rejectedIds: new Set(rej),
          currentId: edge.id,
        })
      }
    }
    return result
  }, [])

  const executeSteps = useCallback((animationSteps: Step[]) => {
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
      setSelectedIds(new Set(step.selectedIds))
      setRejectedIds(new Set(step.rejectedIds))
      setCurrentId(step.currentId)
      setDescription(step.description)
      setSortedEdges([...step.edges])
      setCurrentStep(prev => prev + 1)
    }, speed)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isPlaying, currentStep, steps, speed])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const animationSteps = generateSteps()
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
    setSelectedIds(new Set())
    setRejectedIds(new Set())
    setCurrentId(null)
    setDescription('图拟阵贪心 - 点击「开始贪心」观察 Kruskal 算法过程')
    setSteps([])
    setCurrentStep(0)
    setSortedEdges([])
  }

  const getEdgeColor = (edgeId: string): string => {
    if (edgeId === currentId) return '#f59e0b'
    if (selectedIds.has(edgeId)) return '#22c55e'
    if (rejectedIds.has(edgeId)) return '#ef4444'
    return 'var(--text-secondary)'
  }

  const getEdgeWidth = (edgeId: string): number => {
    if (edgeId === currentId) return 4
    if (selectedIds.has(edgeId)) return 3
    return 1.5
  }

  const edgesToDraw = sortedEdges.length > 0 ? sortedEdges : INITIAL_EDGES

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始贪心
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
            min="400"
            max="2500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas">
        <svg width={400} height={400}>
          {/* 边 */}
          {edgesToDraw.map((edge) => {
            const p1 = VERTICES[edge.u]
            const p2 = VERTICES[edge.v]
            const midX = (p1.x + p2.x) / 2
            const midY = (p1.y + p2.y) / 2
            const color = getEdgeColor(edge.id)
            const width = getEdgeWidth(edge.id)
            return (
              <g key={edge.id}>
                <line
                  x1={p1.x} y1={p1.y}
                  x2={p2.x} y2={p2.y}
                  stroke={color}
                  strokeWidth={width}
                  strokeLinecap="round"
                />
                <rect
                  x={midX - 10} y={midY - 10}
                  width={20} height={18}
                  rx={4}
                  fill="var(--bg-card)"
                  stroke={color}
                  strokeWidth={1}
                />
                <text
                  x={midX} y={midY + 4}
                  textAnchor="middle"
                  fill={color}
                  fontSize={12}
                  fontWeight="bold"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {edge.weight}
                </text>
              </g>
            )
          })}

          {/* 顶点 */}
          {VERTICES.map((pos, i) => (
            <g key={i}>
              <circle
                cx={pos.x} cy={pos.y} r={20}
                fill="var(--bg-card)"
                stroke="var(--accent)"
                strokeWidth={2}
              />
              <text
                x={pos.x} y={pos.y + 5}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize={16}
                fontWeight="bold"
                fontFamily="Consolas, Monaco, monospace"
              >
                {VERTEX_LABELS[i]}
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
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前考虑
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已选入生成树
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          被拒绝（形成环）
        </span>
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
        <strong>拟阵视角：</strong>
        独立集 = 无环边集（森林），基 = 生成树。贪心策略（每次选最小权重可行边）由图拟阵的交换性公理保证最优。
      </div>
    </div>
  )
}

function eLabel(e: Edge): string {
  return `(${VERTICES[e.u] ? ['A', 'B', 'C', 'D'][e.u] : e.u},${VERTICES[e.v] ? ['A', 'B', 'C', 'D'][e.v] : e.v})`
}
