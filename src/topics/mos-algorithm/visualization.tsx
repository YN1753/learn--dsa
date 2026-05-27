import { useState, useEffect, useRef, useCallback } from 'react'

interface Query {
  l: number
  r: number
  id: number
}

interface AnimationStep {
  description: string
  curL: number
  curR: number
  highlightPos: number | null
  highlightType: 'add' | 'remove' | 'current' | 'none'
  freq: Record<number, number>
  curAns: number
  queryOrder: number[]
  currentQueryIdx: number
}

const INITIAL_ARRAY = [1, 2, 1, 3, 2, 1, 3, 4, 2, 1]

const INITIAL_QUERIES: Query[] = [
  { l: 0, r: 4, id: 0 },
  { l: 2, r: 7, id: 1 },
  { l: 1, r: 9, id: 2 },
  { l: 4, r: 8, id: 3 },
  { l: 0, r: 9, id: 4 },
]

export default function MosAlgorithmVisualization() {
  const [arr] = useState<number[]>(INITIAL_ARRAY)
  const [queries] = useState<Query[]>(INITIAL_QUERIES)
  const [blockSize] = useState(Math.floor(Math.sqrt(INITIAL_ARRAY.length)))
  const [curL, setCurL] = useState(0)
  const [curR, setCurR] = useState(-1)
  const [highlightPos, setHighlightPos] = useState<number | null>(null)
  const [highlightType, setHighlightType] = useState<'add' | 'remove' | 'current' | 'none'>('none')
  const [freq, setFreq] = useState<Record<number, number>>({})
  const [curAns, setCurAns] = useState(0)
  const [description, setDescription] = useState<string>('莫队算法可视化 - 点击「开始执行」观察指针移动过程')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [showSorted, setShowSorted] = useState(false)
  const timerRef = useRef<number | null>(null)

  const getSortedQueryOrder = useCallback((): number[] => {
    const indices = queries.map((_, i) => i)
    indices.sort((a, b) => {
      const blockA = Math.floor(queries[a].l / blockSize)
      const blockB = Math.floor(queries[b].l / blockSize)
      if (blockA !== blockB) return blockA - blockB
      return blockA % 2 === 0 ? queries[a].r - queries[b].r : queries[b].r - queries[a].r
    })
    return indices
  }, [queries, blockSize])

  const generateSteps = useCallback((): AnimationStep[] => {
    const allSteps: AnimationStep[] = []
    const sortedOrder = getSortedQueryOrder()
    let tCurL = 0
    let tCurR = -1
    let tCurAns = 0
    const tFreq: Record<number, number> = {}

    function addElement(pos: number) {
      const val = arr[pos]
      if (!tFreq[val]) tFreq[val] = 0
      if (tFreq[val] === 0) tCurAns++
      tFreq[val]++
    }

    function removeElement(pos: number) {
      const val = arr[pos]
      tFreq[val]--
      if (tFreq[val] === 0) tCurAns--
    }

    // Initial state
    allSteps.push({
      description: '初始状态：区间为空，准备按排序顺序处理查询',
      curL: 0,
      curR: -1,
      highlightPos: null,
      highlightType: 'none',
      freq: { ...tFreq },
      curAns: 0,
      queryOrder: sortedOrder,
      currentQueryIdx: -1,
    })

    for (let idx = 0; idx < sortedOrder.length; idx++) {
      const q = queries[sortedOrder[idx]]

      allSteps.push({
        description: `开始处理查询 ${q.id}: [${q.l}, ${q.r}]`,
        curL: tCurL,
        curR: tCurR,
        highlightPos: null,
        highlightType: 'current',
        freq: { ...tFreq },
        curAns: tCurAns,
        queryOrder: sortedOrder,
        currentQueryIdx: idx,
      })

      // Move pointers
      while (tCurL > q.l) {
        tCurL--
        addElement(tCurL)
        allSteps.push({
          description: `左指针左移至 ${tCurL}，添加元素 ${arr[tCurL]}`,
          curL: tCurL,
          curR: tCurR,
          highlightPos: tCurL,
          highlightType: 'add',
          freq: { ...tFreq },
          curAns: tCurAns,
          queryOrder: sortedOrder,
          currentQueryIdx: idx,
        })
      }
      while (tCurR < q.r) {
        tCurR++
        addElement(tCurR)
        allSteps.push({
          description: `右指针右移至 ${tCurR}，添加元素 ${arr[tCurR]}`,
          curL: tCurL,
          curR: tCurR,
          highlightPos: tCurR,
          highlightType: 'add',
          freq: { ...tFreq },
          curAns: tCurAns,
          queryOrder: sortedOrder,
          currentQueryIdx: idx,
        })
      }
      while (tCurL < q.l) {
        allSteps.push({
          description: `左指针右移，删除位置 ${tCurL} 的元素 ${arr[tCurL]}`,
          curL: tCurL,
          curR: tCurR,
          highlightPos: tCurL,
          highlightType: 'remove',
          freq: { ...tFreq },
          curAns: tCurAns,
          queryOrder: sortedOrder,
          currentQueryIdx: idx,
        })
        removeElement(tCurL)
        tCurL++
      }
      while (tCurR > q.r) {
        allSteps.push({
          description: `右指针左移，删除位置 ${tCurR} 的元素 ${arr[tCurR]}`,
          curL: tCurL,
          curR: tCurR,
          highlightPos: tCurR,
          highlightType: 'remove',
          freq: { ...tFreq },
          curAns: tCurAns,
          queryOrder: sortedOrder,
          currentQueryIdx: idx,
        })
        removeElement(tCurR)
        tCurR--
      }

      allSteps.push({
        description: `查询 ${q.id} 完成！区间 [${q.l}, ${q.r}] 中有 ${tCurAns} 个不同元素`,
        curL: tCurL,
        curR: tCurR,
        highlightPos: null,
        highlightType: 'current',
        freq: { ...tFreq },
        curAns: tCurAns,
        queryOrder: sortedOrder,
        currentQueryIdx: idx,
      })
    }

    return allSteps
  }, [arr, queries, blockSize, getSortedQueryOrder])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setCurL(step.curL)
      setCurR(step.curR)
      setHighlightPos(step.highlightPos)
      setHighlightType(step.highlightType)
      setFreq({ ...step.freq })
      setCurAns(step.curAns)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleStart = () => {
    const allSteps = generateSteps()
    setSteps(allSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setShowSorted(true)
    setCurL(0)
    setCurR(-1)
    setHighlightPos(null)
    setHighlightType('none')
    setFreq({})
    setCurAns(0)
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
    if (steps.length === 0) {
      const allSteps = generateSteps()
      setSteps(allSteps)
      setCurrentStep(0)
      setShowSorted(true)
      setIsPlaying(false)
      // Apply first step
      if (allSteps.length > 0) {
        const step = allSteps[0]
        setCurL(step.curL)
        setCurR(step.curR)
        setHighlightPos(step.highlightPos)
        setHighlightType(step.highlightType)
        setFreq({ ...step.freq })
        setCurAns(step.curAns)
        setDescription(step.description)
        setCurrentStep(1)
      }
      return
    }
    if (currentStep < steps.length) {
      setIsPlaying(false)
      const step = steps[currentStep]
      setCurL(step.curL)
      setCurR(step.curR)
      setHighlightPos(step.highlightPos)
      setHighlightType(step.highlightType)
      setFreq({ ...step.freq })
      setCurAns(step.curAns)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurL(0)
    setCurR(-1)
    setHighlightPos(null)
    setHighlightType('none')
    setFreq({})
    setCurAns(0)
    setSteps([])
    setCurrentStep(0)
    setShowSorted(false)
    setDescription('莫队算法可视化 - 点击「开始执行」观察指针移动过程')
  }

  const sortedOrder = getSortedQueryOrder()
  const cellSize = 52
  const startX = 30
  const startY = 60
  const totalWidth = startX + arr.length * cellSize + 30

  const getBlockColor = (index: number): string => {
    const blockId = Math.floor(index / blockSize)
    const colors = ['#1e3a5f', '#2d4a3f', '#4a3520', '#3d2d50', '#4a2d2d']
    return colors[blockId % colors.length]
  }

  const getCellHighlight = (index: number): string => {
    if (index === highlightPos) {
      switch (highlightType) {
        case 'add': return '#22c55e'
        case 'remove': return '#ef4444'
        case 'current': return '#3b82f6'
        default: return 'transparent'
      }
    }
    if (index >= curL && index <= curR && curR >= curL) {
      return 'rgba(59, 130, 246, 0.2)'
    }
    return 'transparent'
  }

  const getCellBorder = (index: number): string => {
    if (index === highlightPos) {
      switch (highlightType) {
        case 'add': return '#4ade80'
        case 'remove': return '#f87171'
        case 'current': return '#60a5fa'
        default: return 'var(--border)'
      }
    }
    if (index >= curL && index <= curR && curR >= curL) {
      return '#3b82f6'
    }
    return 'var(--border)'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始执行
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={isPlaying}>
          单步执行
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="100"
            max="1500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={Math.max(totalWidth, 500)} height={280}>
          {/* Block labels */}
          {Array.from({ length: Math.ceil(arr.length / blockSize) }, (_, i) => {
            const blockStart = i * blockSize
            const blockEnd = Math.min(blockStart + blockSize - 1, arr.length - 1)
            const x1 = startX + blockStart * cellSize
            const x2 = startX + (blockEnd + 1) * cellSize
            return (
              <g key={`block-${i}`}>
                <rect
                  x={x1}
                  y={startY - 25}
                  width={x2 - x1}
                  height={18}
                  rx={4}
                  fill={getBlockColor(blockStart)}
                  opacity={0.6}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={startY - 12}
                  fill="var(--text-primary)"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  块 {i}
                </text>
              </g>
            )
          })}

          {/* Array cells */}
          {arr.map((val, i) => {
            const x = startX + i * cellSize
            const isInRange = i >= curL && i <= curR && curR >= curL
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={startY}
                  width={cellSize - 4}
                  height={cellSize}
                  rx={6}
                  fill={getCellHighlight(i)}
                  stroke={getCellBorder(i)}
                  strokeWidth={i === highlightPos ? 3 : isInRange ? 2 : 1.5}
                />
                <text
                  x={x + (cellSize - 4) / 2}
                  y={startY + cellSize / 2 + 1}
                  fill="var(--text-primary)"
                  fontSize="18"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                  dominantBaseline="middle"
                >
                  {val}
                </text>
                <text
                  x={x + (cellSize - 4) / 2}
                  y={startY + cellSize + 16}
                  fill="var(--text-secondary)"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {i}
                </text>
              </g>
            )
          })}

          {/* Pointer L */}
          {curR >= curL && (
            <g>
              <polygon
                points={`${startX + curL * cellSize + (cellSize - 4) / 2 - 6},${startY + cellSize + 28} ${startX + curL * cellSize + (cellSize - 4) / 2 + 6},${startY + cellSize + 28} ${startX + curL * cellSize + (cellSize - 4) / 2},${startY + cellSize + 22}`}
                fill="#3b82f6"
              />
              <text
                x={startX + curL * cellSize + (cellSize - 4) / 2}
                y={startY + cellSize + 42}
                fill="#3b82f6"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                L
              </text>
            </g>
          )}

          {/* Pointer R */}
          {curR >= curL && (
            <g>
              <polygon
                points={`${startX + curR * cellSize + (cellSize - 4) / 2 - 6},${startY + cellSize + 28} ${startX + curR * cellSize + (cellSize - 4) / 2 + 6},${startY + cellSize + 28} ${startX + curR * cellSize + (cellSize - 4) / 2},${startY + cellSize + 22}`}
                fill="#f59e0b"
              />
              <text
                x={startX + curR * cellSize + (cellSize - 4) / 2}
                y={startY + cellSize + 42}
                fill="#f59e0b"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                R
              </text>
            </g>
          )}

          {/* Query list */}
          <text
            x={startX}
            y={startY + cellSize + 68}
            fill="var(--text-secondary)"
            fontSize="12"
            fontFamily="Consolas, Monaco, monospace"
          >
            {`当前答案: ${curAns} 个不同元素`}
          </text>
        </svg>
      </div>

      {/* Frequency table */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0 1rem' }}>
        <div className="viz-info" style={{ flex: 1, minWidth: 200 }}>
          <strong>频率表：</strong>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {Object.entries(freq)
              .filter(([, count]) => count > 0)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([val, count]) => (
                <span
                  key={val}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.85rem',
                  }}
                >
                  {val}: {count}
                </span>
              ))}
            {Object.keys(freq).filter(k => freq[Number(k)] > 0).length === 0 && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>(空)</span>
            )}
          </div>
        </div>

        {showSorted && (
          <div className="viz-info" style={{ flex: 1, minWidth: 200 }}>
            <strong>查询排序顺序：</strong>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {sortedOrder.map((idx, order) => {
                const q = queries[idx]
                const step = steps[currentStep]
                const isActive = step && step.currentQueryIdx === order
                return (
                  <span
                    key={idx}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-card)',
                      border: isActive ? '2px solid #3b82f6' : '1px solid var(--border)',
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.85rem',
                    }}
                  >
                    q{q.id}[{q.l},{q.r}]
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(59, 130, 246, 0.2)', border: '2px solid #3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前区间
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          添加元素
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          删除元素
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          L 指针
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          R 指针
        </span>
      </div>
    </div>
  )
}
