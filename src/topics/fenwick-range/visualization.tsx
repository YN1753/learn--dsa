import { useState, useEffect, useRef, useCallback } from 'react'

interface AnimationStep {
  description: string
  bit1Values: number[]
  bit2Values: number[]
  arrayValues: number[]
  highlightIndices: number[]
  highlightType: 'update' | 'query' | 'result' | 'none'
}

const SIZE = 8

function lowbit(x: number): number {
  return x & (-x)
}

function createEmptyArray(len: number): number[] {
  return new Array(len + 1).fill(0)
}

function bitUpdate(tree: number[], i: number, delta: number, n: number): number[] {
  const newTree = [...tree]
  for (let idx = i; idx <= n; idx += lowbit(idx)) {
    newTree[idx] += delta
  }
  return newTree
}

function bitQuery(tree: number[], i: number): number {
  let sum = 0
  for (let idx = i; idx > 0; idx -= lowbit(idx)) {
    sum += tree[idx]
  }
  return sum
}

export default function FenwickRangeVisualization() {
  const [mode, setMode] = useState<'single' | 'double'>('single')
  const [baseArray] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8])
  const [bit1, setBit1] = useState<number[]>(createEmptyArray(SIZE))
  const [bit2, setBit2] = useState<number[]>(createEmptyArray(SIZE))
  const [arrayValues, setArrayValues] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8])
  const [highlightIndices, setHighlightIndices] = useState<number[]>([])
  const [highlightType, setHighlightType] = useState<'update' | 'query' | 'result' | 'none'>('none')
  const [description, setDescription] = useState<string>('树状数组区间操作 - 选择一个操作开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<number | null>(null)

  // Range input
  const [rangeL, setRangeL] = useState(3)
  const [rangeR, setRangeR] = useState(6)
  const [rangeV, setRangeV] = useState(5)

  const computeArrayValues = useCallback((b1: number[], b2: number[], m: string) => {
    const arr = new Array(SIZE + 1).fill(0)
    for (let i = 1; i <= SIZE; i++) {
      if (m === 'single') {
        arr[i] = baseArray[i] + bitQuery(b1, i)
      } else {
        const prefixI = (i + 1) * bitQuery(b1, i) - bitQuery(b2, i)
        const prefixI1 = i * bitQuery(b1, i - 1) - bitQuery(b2, i - 1)
        arr[i] = prefixI - prefixI1
      }
    }
    return arr
  }, [baseArray])

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
      setBit1([...step.bit1Values])
      setBit2([...step.bit2Values])
      setArrayValues([...step.arrayValues])
      setHighlightIndices([...step.highlightIndices])
      setHighlightType(step.highlightType)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleRangeAdd = () => {
    const l = rangeL, r = rangeR, v = rangeV
    if (l < 1 || r > SIZE || l > r) {
      setDescription('请输入有效的区间范围')
      return
    }

    const animationSteps: AnimationStep[] = []

    if (mode === 'single') {
      // Update d[l] += v
      const b1AfterL = bitUpdate(bit1, l, v, SIZE)
      const arrAfterL = computeArrayValues(b1AfterL, bit2, mode)
      animationSteps.push({
        description: `差分更新: d[${l}] += ${v}，正在更新 BIT 中包含位置 ${l} 的节点`,
        bit1Values: b1AfterL,
        bit2Values: bit2,
        arrayValues: arrAfterL,
        highlightIndices: getAffectedIndices(l, SIZE),
        highlightType: 'update',
      })

      // Update d[r+1] -= v
      if (r + 1 <= SIZE) {
        const b1AfterR = bitUpdate(b1AfterL, r + 1, -v, SIZE)
        const arrAfterR = computeArrayValues(b1AfterR, bit2, mode)
        animationSteps.push({
          description: `差分更新: d[${r + 1}] -= ${v}，正在更新 BIT 中包含位置 ${r + 1} 的节点`,
          bit1Values: b1AfterR,
          bit2Values: bit2,
          arrayValues: arrAfterR,
          highlightIndices: getAffectedIndices(r + 1, SIZE),
          highlightType: 'update',
        })

        // Show result
        animationSteps.push({
          description: `区间 [${l}, ${r}] 加 ${v} 完成！原数组已更新`,
          bit1Values: b1AfterR,
          bit2Values: bit2,
          arrayValues: arrAfterR,
          highlightIndices: Array.from({ length: r - l + 1 }, (_, i) => l + i),
          highlightType: 'result',
        })
      } else {
        animationSteps.push({
          description: `区间 [${l}, ${r}] 加 ${v} 完成！(r+1=${r + 1} 超出范围，无需更新)`,
          bit1Values: b1AfterL,
          bit2Values: bit2,
          arrayValues: arrAfterL,
          highlightIndices: Array.from({ length: r - l + 1 }, (_, i) => l + i),
          highlightType: 'result',
        })
      }
    } else {
      // Double BIT mode
      let b1Cur = [...bit1]
      let b2Cur = [...bit2]

      // B1: d[l] += v
      b1Cur = bitUpdate(b1Cur, l, v, SIZE)
      const arr1 = computeArrayValues(b1Cur, b2Cur, mode)
      animationSteps.push({
        description: `B1 更新: d[${l}] += ${v}`,
        bit1Values: b1Cur,
        bit2Values: b2Cur,
        arrayValues: arr1,
        highlightIndices: getAffectedIndices(l, SIZE),
        highlightType: 'update',
      })

      // B1: d[r+1] -= v
      if (r + 1 <= SIZE) {
        b1Cur = bitUpdate(b1Cur, r + 1, -v, SIZE)
        const arr2 = computeArrayValues(b1Cur, b2Cur, mode)
        animationSteps.push({
          description: `B1 更新: d[${r + 1}] -= ${v}`,
          bit1Values: b1Cur,
          bit2Values: b2Cur,
          arrayValues: arr2,
          highlightIndices: getAffectedIndices(r + 1, SIZE),
          highlightType: 'update',
        })
      }

      // B2: update l*v
      b2Cur = bitUpdate(b2Cur, l, l * v, SIZE)
      const arr3 = computeArrayValues(b1Cur, b2Cur, mode)
      animationSteps.push({
        description: `B2 更新: i*d[i] 在位置 ${l} 加 ${l * v}`,
        bit1Values: b1Cur,
        bit2Values: b2Cur,
        arrayValues: arr3,
        highlightIndices: getAffectedIndices(l, SIZE),
        highlightType: 'update',
      })

      // B2: update -(r+1)*v
      if (r + 1 <= SIZE) {
        b2Cur = bitUpdate(b2Cur, r + 1, -(r + 1) * v, SIZE)
        const arr4 = computeArrayValues(b1Cur, b2Cur, mode)
        animationSteps.push({
          description: `B2 更新: i*d[i] 在位置 ${r + 1} 加 ${-(r + 1) * v}`,
          bit1Values: b1Cur,
          bit2Values: b2Cur,
          arrayValues: arr4,
          highlightIndices: getAffectedIndices(r + 1, SIZE),
          highlightType: 'update',
        })
      }

      const arrFinal = computeArrayValues(b1Cur, b2Cur, mode)
      animationSteps.push({
        description: `区间 [${l}, ${r}] 加 ${v} 完成！B1 和 B2 均已更新`,
        bit1Values: b1Cur,
        bit2Values: b2Cur,
        arrayValues: arrFinal,
        highlightIndices: Array.from({ length: r - l + 1 }, (_, i) => l + i),
        highlightType: 'result',
      })
    }

    executeSteps(animationSteps)
  }

  const handleRangeQuery = () => {
    if (mode !== 'double') {
      setDescription('区间查询仅在双 BIT 模式下可用')
      return
    }

    const l = rangeL, r = rangeR
    if (l < 1 || r > SIZE || l > r) {
      setDescription('请输入有效的区间范围')
      return
    }

    const animationSteps: AnimationStep[] = []
    const arr = computeArrayValues(bit1, bit2, mode)

    // Query prefix sum up to r
    let highlightsR: number[] = []
    for (let idx = r; idx > 0; idx -= lowbit(idx)) {
      highlightsR.push(idx)
    }
    const sumR = (r + 1) * bitQuery(bit1, r) - bitQuery(bit2, r)
    animationSteps.push({
      description: `查询前缀和 sum(a[1..${r}]) = (${r}+1)*B1.sum(${r}) - B2.sum(${r}) = ${sumR}`,
      bit1Values: bit1,
      bit2Values: bit2,
      arrayValues: arr,
      highlightIndices: highlightsR,
      highlightType: 'query',
    })

    // Query prefix sum up to l-1
    if (l > 1) {
      let highlightsL: number[] = []
      for (let idx = l - 1; idx > 0; idx -= lowbit(idx)) {
        highlightsL.push(idx)
      }
      const sumL = l * bitQuery(bit1, l - 1) - bitQuery(bit2, l - 1)
      animationSteps.push({
        description: `查询前缀和 sum(a[1..${l - 1}]) = ${l}*B1.sum(${l - 1}) - B2.sum(${l - 1}) = ${sumL}`,
        bit1Values: bit1,
        bit2Values: bit2,
        arrayValues: arr,
        highlightIndices: highlightsL,
        highlightType: 'query',
      })

      const rangeSumVal = sumR - sumL
      animationSteps.push({
        description: `区间和 sum(a[${l}..${r}]) = ${sumR} - ${sumL} = ${rangeSumVal}`,
        bit1Values: bit1,
        bit2Values: bit2,
        arrayValues: arr,
        highlightIndices: Array.from({ length: r - l + 1 }, (_, i) => l + i),
        highlightType: 'result',
      })
    } else {
      animationSteps.push({
        description: `区间和 sum(a[1..${r}]) = ${sumR}`,
        bit1Values: bit1,
        bit2Values: bit2,
        arrayValues: arr,
        highlightIndices: Array.from({ length: r }, (_, i) => i + 1),
        highlightType: 'result',
      })
    }

    executeSteps(animationSteps)
  }

  function getAffectedIndices(i: number, n: number): number[] {
    const indices: number[] = []
    for (let idx = i; idx <= n; idx += lowbit(idx)) {
      indices.push(idx)
    }
    return indices
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (steps.length === 0 || currentStep >= steps.length) return
    setIsPlaying(false)
    const step = steps[currentStep]
    setBit1([...step.bit1Values])
    setBit2([...step.bit2Values])
    setArrayValues([...step.arrayValues])
    setHighlightIndices([...step.highlightIndices])
    setHighlightType(step.highlightType)
    setDescription(step.description)
    setCurrentStep(prev => prev + 1)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setBit1(createEmptyArray(SIZE))
    setBit2(createEmptyArray(SIZE))
    setArrayValues([0, 1, 2, 3, 4, 5, 6, 7, 8])
    setHighlightIndices([])
    setHighlightType('none')
    setDescription('已重置')
    setSteps([])
    setCurrentStep(0)
  }

  const getHighlightColor = (idx: number): string => {
    if (!highlightIndices.includes(idx)) return 'var(--bg-card)'
    switch (highlightType) {
      case 'update': return '#3b82f6'
      case 'query': return '#f59e0b'
      case 'result': return '#22c55e'
      default: return 'var(--bg-card)'
    }
  }

  const getHighlightBorder = (idx: number): string => {
    if (!highlightIndices.includes(idx)) return 'var(--border)'
    switch (highlightType) {
      case 'update': return '#60a5fa'
      case 'query': return '#fbbf24'
      case 'result': return '#4ade80'
      default: return 'var(--border)'
    }
  }

  const cellSize = 56
  const cellGap = 4
  const startX = 50
  const renderRow = (label: string, values: number[], yOffset: number, baseArr?: number[]) => {
    return (
      <g>
        <text x={startX - 10} y={yOffset + cellSize / 2 + 5} fill="var(--text-secondary)" fontSize="13" textAnchor="end" fontFamily="Consolas, Monaco, monospace">
          {label}
        </text>
        {values.slice(1).map((val, i) => {
          const idx = i + 1
          const x = startX + (i) * (cellSize + cellGap)
          return (
            <g key={`${label}-${idx}`}>
              <rect
                x={x}
                y={yOffset}
                width={cellSize}
                height={cellSize}
                rx="6"
                fill={getHighlightColor(idx)}
                stroke={getHighlightBorder(idx)}
                strokeWidth={highlightIndices.includes(idx) ? 3 : 1.5}
              />
              <text
                x={x + cellSize / 2}
                y={yOffset + cellSize / 2 + 5}
                fill="var(--text-primary)"
                fontSize="15"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                {val}
              </text>
              {baseArr && (
                <text
                  x={x + cellSize / 2}
                  y={yOffset + cellSize + 14}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  [{idx}]
                </text>
              )}
            </g>
          )
        })}
      </g>
    )
  }

  const svgWidth = startX + SIZE * (cellSize + cellGap) + 20
  const rowHeight = cellSize + 24

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button
          className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('single'); handleReset() }}
          disabled={isPlaying}
        >
          单BIT(区间加+单点查)
        </button>
        <button
          className={`btn ${mode === 'double' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('double'); handleReset() }}
          disabled={isPlaying}
        >
          双BIT(区间加+区间查)
        </button>
        <span style={{ color: 'var(--text-secondary)', margin: '0 0.5rem' }}>|</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          L:
          <input type="number" min={1} max={SIZE} value={rangeL} onChange={e => setRangeL(Number(e.target.value))} style={{ width: 45 }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          R:
          <input type="number" min={1} max={SIZE} value={rangeR} onChange={e => setRangeR(Number(e.target.value))} style={{ width: 45 }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          V:
          <input type="number" value={rangeV} onChange={e => setRangeV(Number(e.target.value))} style={{ width: 50 }} />
        </label>
        <button className="btn btn-primary" onClick={handleRangeAdd} disabled={isPlaying}>
          区间加
        </button>
        {mode === 'double' && (
          <button className="btn btn-primary" onClick={handleRangeQuery} disabled={isPlaying}>
            区间查询
          </button>
        )}
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={steps.length === 0 || currentStep >= steps.length}>
          单步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
          <input type="range" min="200" max="2000" value={speed} onChange={e => setSpeed(Number(e.target.value))} />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={svgWidth} height={mode === 'double' ? 4 * rowHeight + 60 : 3 * rowHeight + 40}>
          {/* Index row */}
          <g>
            <text x={startX - 10} y={15} fill="var(--text-secondary)" fontSize="12" textAnchor="end" fontFamily="Consolas, Monaco, monospace">
              idx
            </text>
            {Array.from({ length: SIZE }, (_, i) => (
              <text
                key={`idx-${i}`}
                x={startX + i * (cellSize + cellGap) + cellSize / 2}
                y={15}
                fill="var(--text-secondary)"
                fontSize="12"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                {i + 1}
              </text>
            ))}
          </g>

          {/* Array values row */}
          {renderRow('a[]', arrayValues, 24)}

          {/* BIT1 row */}
          {renderRow(mode === 'single' ? 'd[]' : 'B1[]', bit1, 24 + rowHeight)}

          {/* BIT2 row (double mode only) */}
          {mode === 'double' && renderRow('B2[]', bit2, 24 + 2 * rowHeight)}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在更新
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          正在查询
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          结果
        </span>
        {mode === 'single' && (
          <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
            模式: 差分数组 d[], 单点查询 a[i] = sum(d[1..i])
          </span>
        )}
        {mode === 'double' && (
          <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
            模式: B1=d[i], B2=i*d[i], sum(a[1..x]) = (x+1)*B1-B2
          </span>
        )}
      </div>
    </div>
  )
}
