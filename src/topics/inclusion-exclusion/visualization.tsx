import { useState, useEffect, useRef, useCallback } from 'react'

interface SetData {
  id: string
  label: string
  color: string
  elements: number[]
}

interface AnimationStep {
  description: string
  highlightSets: string[]
  highlightRegion: string[]
  formula: string
  result: number | null
}

const SETS: SetData[] = [
  { id: 'A', label: 'A', color: '#3b82f6', elements: [1, 2, 3, 4, 5, 6, 7, 8] },
  { id: 'B', label: 'B', color: '#22c55e', elements: [5, 6, 7, 8, 9, 10, 11, 12] },
  { id: 'C', label: 'C', color: '#f59e0b', elements: [7, 8, 9, 10, 13, 14, 15] },
]

function getIntersection(a: number[], b: number[]): number[] {
  const setB = new Set(b)
  return a.filter(x => setB.has(x))
}

function getRegionElements(regionId: string): number[] {
  const sets: Record<string, number[]> = {
    A: SETS[0].elements,
    B: SETS[1].elements,
    C: SETS[2].elements,
  }
  const parts = regionId.split('∩')
  let result = sets[parts[0]]
  for (let i = 1; i < parts.length; i++) {
    result = getIntersection(result, sets[parts[i]])
  }
  return result
}

export default function InclusionExclusionVisualization() {
  const [selectedSets, setSelectedSets] = useState<string[]>(['A', 'B'])
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const [description, setDescription] = useState('选择集合并点击「计算」开始容斥原理演示')
  const [formula, setFormula] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [highlightSets, setHighlightSets] = useState<string[]>([])
  const [highlightRegion, setHighlightRegion] = useState<string[]>([])
  const timerRef = useRef<number | null>(null)

  const toggleSet = (id: string) => {
    setSelectedSets(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const buildSteps = useCallback((): AnimationStep[] => {
    const n = selectedSets.length
    if (n === 0) return []

    const allSteps: AnimationStep[] = []
    const selectedSetData = SETS.filter(s => selectedSets.includes(s.id))

    // Compute union directly
    const unionSet = new Set<number>()
    for (const s of selectedSetData) {
      for (const e of s.elements) unionSet.add(e)
    }

    // Build inclusion-exclusion steps
    let runningTotal = 0
    for (let k = 1; k <= n; k++) {
      const sign = k % 2 === 1 ? 1 : -1
      const signStr = sign > 0 ? '+' : '-'
      const termParts: string[] = []

      // Generate all C(n, k) combinations
      const combinations = getCombinations(selectedSetData.map(s => s.id), k)
      let termTotal = 0

      for (const combo of combinations) {
        const regionId = combo.join('∩')
        const elems = getRegionElements(regionId)
        termTotal += elems.length
        termParts.push(`|${regionId}|=${elems.length}`)

        allSteps.push({
          description: `${k === combo.length ? '' : ''}${k}个集合的交集: ${regionId}，包含 ${elems.length} 个元素 (符号: ${signStr})`,
          highlightSets: combo,
          highlightRegion: [regionId],
          formula: `第${k}层: ${signStr} ${termParts.join(' + ')}`,
          result: null,
        })
      }

      runningTotal += sign * termTotal
      allSteps.push({
        description: `第${k}层贡献: ${signStr}(${termTotal})，累计结果 = ${runningTotal}`,
        highlightSets: selectedSets,
        highlightRegion: [],
        formula: `累计: ${runningTotal}`,
        result: null,
      })
    }

    allSteps.push({
      description: `最终结果: |${selectedSets.join(' ∪ ')}| = ${unionSet.size}，容斥原理验证: ${runningTotal}`,
      highlightSets: selectedSets,
      highlightRegion: [],
      formula: `|${selectedSets.join(' ∪ ')}| = ${unionSet.size}`,
      result: unionSet.size,
    })

    return allSteps
  }, [selectedSets])

  function getCombinations<T>(arr: T[], k: number): T[][] {
    if (k === 0) return [[]]
    if (arr.length < k) return []
    const result: T[][] = []
    function helper(start: number, current: T[]) {
      if (current.length === k) {
        result.push([...current])
        return
      }
      for (let i = start; i < arr.length; i++) {
        current.push(arr[i])
        helper(i + 1, current)
        current.pop()
      }
    }
    helper(0, [])
    return result
  }

  const handleCalculate = () => {
    if (selectedSets.length === 0) {
      setDescription('请至少选择一个集合')
      return
    }
    const newSteps = buildSteps()
    setSteps(newSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setDescription('开始计算...')
  }

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setDescription(step.description)
      setHighlightSets(step.highlightSets)
      setHighlightRegion(step.highlightRegion)
      setFormula(step.formula)
      if (step.result !== null) setResult(step.result)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (steps.length === 0 || currentStep >= steps.length) return
    setIsPlaying(false)
    const step = steps[currentStep]
    setDescription(step.description)
    setHighlightSets(step.highlightSets)
    setHighlightRegion(step.highlightRegion)
    setFormula(step.formula)
    if (step.result !== null) setResult(step.result)
    setCurrentStep(prev => prev + 1)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setDescription('选择集合并点击「计算」开始容斥原理演示')
    setFormula('')
    setResult(null)
    setHighlightSets([])
    setHighlightRegion([])
  }

  // Venn diagram layout
  const cx = 200
  const cy = 160
  const r = 80
  const offsets: Record<string, { x: number; y: number }> = {
    A: { x: -50, y: -25 },
    B: { x: 50, y: -25 },
    C: { x: 0, y: 40 },
  }

  const getSetOpacity = (id: string) => {
    if (highlightSets.length === 0) return 0.3
    return highlightSets.includes(id) ? 0.5 : 0.1
  }

  const computeRegionElements = (regionId: string): number[] => {
    return getRegionElements(regionId)
  }

  // Compute all 7 regions for 3-set Venn
  const regions = selectedSets.length >= 3 ? [
    { id: 'A', label: 'A only', elems: computeRegionElements('A').filter(e => !SETS[1].elements.includes(e) && !SETS[2].elements.includes(e)) },
    { id: 'B', label: 'B only', elems: computeRegionElements('B').filter(e => !SETS[0].elements.includes(e) && !SETS[2].elements.includes(e)) },
    { id: 'C', label: 'C only', elems: computeRegionElements('C').filter(e => !SETS[0].elements.includes(e) && !SETS[1].elements.includes(e)) },
    { id: 'A∩B', label: 'A∩B only', elems: computeRegionElements('A∩B').filter(e => !SETS[2].elements.includes(e)) },
    { id: 'A∩C', label: 'A∩C only', elems: computeRegionElements('A∩C').filter(e => !SETS[1].elements.includes(e)) },
    { id: 'B∩C', label: 'B∩C only', elems: computeRegionElements('B∩C').filter(e => !SETS[0].elements.includes(e)) },
    { id: 'A∩B∩C', label: 'A∩B∩C', elems: computeRegionElements('A∩B∩C') },
  ] : selectedSets.length >= 2 ? [
    { id: 'A', label: 'A only', elems: computeRegionElements(selectedSets[0]).filter(e => !SETS.find(s => s.id === selectedSets[1])!.elements.includes(e)) },
    { id: 'B', label: 'B only', elems: computeRegionElements(selectedSets[1]).filter(e => !SETS.find(s => s.id === selectedSets[0])!.elements.includes(e)) },
    { id: 'A∩B', label: 'A∩B', elems: computeRegionElements(selectedSets[0] + '∩' + selectedSets[1]) },
  ] : selectedSets.length === 1 ? [
    { id: selectedSets[0], label: selectedSets[0], elems: computeRegionElements(selectedSets[0]) },
  ] : []

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        {SETS.map(s => (
          <button
            key={s.id}
            className={`btn ${selectedSets.includes(s.id) ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => toggleSet(s.id)}
            disabled={isPlaying}
            style={selectedSets.includes(s.id) ? { borderColor: s.color, background: s.color + '33' } : {}}
          >
            集合 {s.label} ({s.elements.length}个)
          </button>
        ))}
        <button className="btn btn-primary" onClick={handleCalculate} disabled={isPlaying || selectedSets.length === 0}>
          计算
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length}>
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
            min="400"
            max="3000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Venn Diagram */}
        <svg width={400} height={320} style={{ flexShrink: 0 }}>
          <defs>
            <clipPath id="clipA">
              <circle cx={cx + offsets.A.x} cy={cy + offsets.A.y} r={r} />
            </clipPath>
            <clipPath id="clipB">
              <circle cx={cx + offsets.B.x} cy={cy + offsets.B.y} r={r} />
            </clipPath>
            <clipPath id="clipC">
              <circle cx={cx + offsets.C.x} cy={cy + offsets.C.y} r={r} />
            </clipPath>
          </defs>

          {/* Draw circles */}
          {SETS.filter(s => selectedSets.includes(s.id)).map(s => (
            <circle
              key={s.id}
              cx={cx + offsets[s.id].x}
              cy={cy + offsets[s.id].y}
              r={r}
              fill={s.color}
              fillOpacity={getSetOpacity(s.id)}
              stroke={s.color}
              strokeWidth={highlightSets.includes(s.id) ? 3 : 1.5}
            />
          ))}

          {/* Region labels */}
          {regions.map((region, i) => {
            const regionOffsets: Record<string, { x: number; y: number }> = {
              'A': { x: -90, y: -25 },
              'B': { x: 90, y: -25 },
              'C': { x: 0, y: 85 },
              'A∩B': { x: 0, y: -50 },
              'A∩C': { x: -45, y: 35 },
              'B∩C': { x: 45, y: 35 },
              'A∩B∩C': { x: 0, y: 10 },
            }
            const pos = regionOffsets[region.id] || { x: 0, y: 0 }
            const isHighlighted = highlightRegion.some(r => r === region.id)
            return (
              <g key={i}>
                <text
                  x={cx + pos.x}
                  y={cy + pos.y - 8}
                  textAnchor="middle"
                  fill={isHighlighted ? '#fff' : 'var(--text-secondary)'}
                  fontSize="11"
                  fontWeight={isHighlighted ? 'bold' : 'normal'}
                >
                  {region.elems.length > 0 ? `{${region.elems.join(',')}}` : ''}
                </text>
                <text
                  x={cx + pos.x}
                  y={cy + pos.y + 8}
                  textAnchor="middle"
                  fill={isHighlighted ? '#fff' : 'var(--text-secondary)'}
                  fontSize="10"
                  opacity={0.7}
                >
                  {region.elems.length > 0 ? `${region.elems.length}个` : ''}
                </text>
              </g>
            )
          })}

          {/* Set labels */}
          {SETS.filter(s => selectedSets.includes(s.id)).map(s => (
            <text
              key={s.id + '-label'}
              x={cx + offsets[s.id].x + (s.id === 'A' ? -55 : s.id === 'B' ? 55 : 0)}
              y={cy + offsets[s.id].y + (s.id === 'C' ? r + 18 : -r - 8)}
              textAnchor="middle"
              fill={s.color}
              fontSize="16"
              fontWeight="bold"
            >
              {s.label}
            </text>
          ))}

          {/* Universe box */}
          <rect x={10} y={10} width={380} height={300} rx={8} fill="none" stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
          <text x={20} y={30} fill="var(--text-secondary)" fontSize="12">全集 U</text>
        </svg>

        {/* Step details */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>选中集合</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {SETS.filter(s => selectedSets.includes(s.id)).map(s => (
                <span key={s.id} style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: s.color + '22',
                  border: `1px solid ${s.color}`,
                  color: s.color,
                  fontSize: '0.85rem',
                }}>
                  {s.label}: {'{'} {s.elements.join(', ')} {'}'}
                </span>
              ))}
            </div>
          </div>

          {formula && (
            <div style={{
              padding: '0.75rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              marginBottom: '0.75rem',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.9rem',
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>当前计算</div>
              {formula}
            </div>
          )}

          {result !== null && (
            <div style={{
              padding: '0.75rem',
              background: '#22c55e22',
              border: '1px solid #22c55e',
              borderRadius: '8px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#22c55e',
            }}>
              并集大小 = {result}
            </div>
          )}
        </div>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>公式：</strong>
        <span style={{ fontFamily: 'Consolas, Monaco, monospace', marginLeft: '0.5rem' }}>
          |A ∪ B| = |A| + |B| - |A ∩ B|
        </span>
        <span style={{ marginLeft: '1.5rem' }}>
          <strong>奇加偶减</strong>：奇数层加，偶数层减
        </span>
      </div>
    </div>
  )
}
