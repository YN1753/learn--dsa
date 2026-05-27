import { useState, useEffect, useRef, useCallback } from 'react'

interface CellData {
  value: number
  computed: boolean
}

interface AnimationStep {
  description: string
  phase: 'init' | 'build' | 'query'
  st: (number | null)[][]
  highlightCells: { i: number; k: number; color: string }[]
  queryRange?: { l: number; r: number }
  queryResult?: number
  currentK?: number
}

const INITIAL_ARR = [3, 1, 4, 1, 5, 9, 2, 6]

export default function SparseTableVisualization() {
  const [arr] = useState<number[]>(INITIAL_ARR)
  const [st, setSt] = useState<(number | null)[][]>([])
  const [description, setDescription] = useState<string>('稀疏表演示 - 点击「预处理」开始构建')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'building' | 'ready' | 'querying'>('idle')
  const [highlightCells, setHighlightCells] = useState<{ i: number; k: number; color: string }[]>([])
  const [queryRange, setQueryRange] = useState<{ l: number; r: number } | null>(null)
  const [queryResult, setQueryResult] = useState<number | null>(null)
  const [currentK, setCurrentK] = useState<number | undefined>(undefined)
  const timerRef = useRef<number | null>(null)

  const n = arr.length
  const logN = Math.floor(Math.log2(n))

  const initSt = useCallback((): (number | null)[][] => {
    return Array.from({ length: n }, () => Array(logN + 1).fill(null))
  }, [n, logN])

  const handlePreprocess = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const animationSteps: AnimationStep[] = []
    const tempSt: (number | null)[][] = initSt()

    // Step: Initialize k=0
    for (let i = 0; i < n; i++) {
      tempSt[i] = [...tempSt[i]]
      tempSt[i][0] = arr[i]
    }
    animationSteps.push({
      description: '初始化 k=0：st[i][0] = arr[i]，每个元素自身就是一个长度为 1 的区间',
      phase: 'build',
      st: tempSt.map(row => [...row]),
      highlightCells: Array.from({ length: n }, (_, i) => ({ i, k: 0, color: '#22c55e' })),
      currentK: 0,
    })

    // Build for each k
    for (let k = 1; k <= logN; k++) {
      const halfLen = 1 << (k - 1)
      const len = 1 << k

      // Show formula step
      const highlights: { i: number; k: number; color: string }[] = []
      for (let i = 0; i + len - 1 < n; i++) {
        tempSt[i] = [...tempSt[i]]
        tempSt[i][k] = Math.max(tempSt[i][k - 1]!, tempSt[i + halfLen][k - 1]!)
        highlights.push({ i, k, color: '#3b82f6' })
        highlights.push({ i, k: k - 1, color: '#f59e0b' })
        highlights.push({ i: i + halfLen, k: k - 1, color: '#f59e0b' })
      }

      animationSteps.push({
        description: `计算 k=${k}（区间长度 ${len}）：st[i][${k}] = max(st[i][${k - 1}], st[i+${halfLen}][${k - 1}])`,
        phase: 'build',
        st: tempSt.map(row => [...row]),
        highlightCells: highlights,
        currentK: k,
      })
    }

    // Preprocessing complete
    animationSteps.push({
      description: '预处理完成！现在可以进行 O(1) 区间查询了。点击下方数组选择查询区间。',
      phase: 'ready',
      st: tempSt.map(row => [...row]),
      highlightCells: [],
    })

    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setPhase('building')
  }, [arr, n, logN, initSt])

  const handleQuery = useCallback((l: number, r: number) => {
    if (phase !== 'ready') return
    if (l > r || l < 0 || r >= n) return

    const len = r - l + 1
    const k = Math.floor(Math.log2(len))
    const halfLen = 1 << k

    // Build actual st for result calculation
    const actualSt: number[][] = Array.from({ length: n }, () => Array(logN + 1).fill(0))
    for (let i = 0; i < n; i++) actualSt[i][0] = arr[i]
    for (let kk = 1; kk <= logN; kk++) {
      for (let i = 0; i + (1 << kk) - 1 < n; i++) {
        actualSt[i][kk] = Math.max(actualSt[i][kk - 1], actualSt[i + (1 << (kk - 1))][kk - 1])
      }
    }

    const result = actualSt[l][k]
    const leftVal = actualSt[l][k]
    const rightVal = actualSt[r - halfLen + 1][k]

    const animationSteps: AnimationStep[] = []

    // Step 1: Show query range
    animationSteps.push({
      description: `查询 [${l}, ${r}] 区间最大值，区间长度 = ${len}`,
      phase: 'query',
      st: actualSt.map(row => [...row]),
      highlightCells: [],
      queryRange: { l, r },
      queryResult: null,
    })

    // Step 2: Show k calculation
    animationSteps.push({
      description: `k = floor(log2(${len})) = ${k}，取两个长度为 ${halfLen} 的区间`,
      phase: 'query',
      st: actualSt.map(row => [...row]),
      highlightCells: [
        { i: l, k, color: '#3b82f6' },
        { i: r - halfLen + 1, k, color: '#8b5cf6' },
      ],
      queryRange: { l, r },
      queryResult: null,
    })

    // Step 3: Show result
    animationSteps.push({
      description: `左半 st[${l}][${k}] = ${leftVal}，右半 st[${r - halfLen + 1}][${k}] = ${rightVal}，结果 = ${result}`,
      phase: 'query',
      st: actualSt.map(row => [...row]),
      highlightCells: [
        { i: l, k, color: '#22c55e' },
        { i: r - halfLen + 1, k, color: '#22c55e' },
      ],
      queryRange: { l, r },
      queryResult: result,
    })

    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setPhase('querying')
  }, [phase, n, arr, logN])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      if (steps[steps.length - 1]?.phase === 'ready') {
        setPhase('ready')
        setSt(steps[steps.length - 1].st)
      } else if (steps[steps.length - 1]?.phase === 'query') {
        setPhase('ready')
      }
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setSt(step.st)
      setHighlightCells(step.highlightCells)
      setDescription(step.description)
      if (step.queryRange) setQueryRange(step.queryRange)
      if (step.queryResult !== undefined && step.queryResult !== null) {
        setQueryResult(step.queryResult)
      }
      if (step.currentK !== undefined) setCurrentK(step.currentK)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

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
    setIsPlaying(false)
    const step = steps[currentStep]
    setSt(step.st)
    setHighlightCells(step.highlightCells)
    setDescription(step.description)
    if (step.queryRange) setQueryRange(step.queryRange)
    if (step.queryResult !== undefined && step.queryResult !== null) {
      setQueryResult(step.queryResult)
    }
    if (step.currentK !== undefined) setCurrentK(step.currentK)
    setCurrentStep(prev => prev + 1)
    if (currentStep + 1 >= steps.length) {
      if (step.phase === 'ready') setPhase('ready')
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSt(initSt())
    setHighlightCells([])
    setDescription('稀疏表已重置 - 点击「预处理」开始构建')
    setSteps([])
    setCurrentStep(0)
    setPhase('idle')
    setQueryRange(null)
    setQueryResult(null)
    setCurrentK(undefined)
  }

  const handleRandomQuery = () => {
    if (phase !== 'ready') return
    const l = Math.floor(Math.random() * (n - 1))
    const r = l + 1 + Math.floor(Math.random() * (n - l - 1))
    handleQuery(l, Math.min(r, n - 1))
  }

  const getCellColor = (i: number, k: number): string => {
    for (const h of highlightCells) {
      if (h.i === i && h.k === k) return h.color
    }
    return ''
  }

  const colWidth = 56
  const rowHeight = 36
  const labelWidth = 40
  const headerHeight = 32
  const tableWidth = labelWidth + (logN + 1) * colWidth + 16
  const tableHeight = headerHeight + n * rowHeight + 16

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handlePreprocess} disabled={isPlaying}>
          预处理
        </button>
        <button className="btn btn-primary" onClick={handleRandomQuery} disabled={isPlaying || phase !== 'ready'}>
          随机查询
        </button>
        <button className="btn btn-secondary" onClick={handleStep} disabled={steps.length === 0 || currentStep >= steps.length}>
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
            max="2000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      {/* Array display with clickable query selection */}
      <div className="viz-canvas" style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <div style={{ padding: '1rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            原始数组（点击两个元素选择查询区间）:
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {arr.map((val, idx) => {
              const inQuery = queryRange && idx >= queryRange.l && idx <= queryRange.r
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (phase !== 'ready') return
                    if (!queryRange) {
                      setQueryRange({ l: idx, r: idx })
                    } else if (queryRange.l === queryRange.r) {
                      const l = Math.min(queryRange.l, idx)
                      const r = Math.max(queryRange.l, idx)
                      handleQuery(l, r)
                    } else {
                      setQueryRange({ l: idx, r: idx })
                    }
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: inQuery ? '#3b82f6' : 'var(--bg-card)',
                    border: `2px solid ${inQuery ? '#60a5fa' : 'var(--border)'}`,
                    borderRadius: 6,
                    cursor: phase === 'ready' ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{idx}</span>
                  <span style={{ color: inQuery ? '#fff' : 'var(--text-primary)', fontWeight: 600, fontSize: '1rem' }}>{val}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ST Table visualization */}
      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={Math.max(tableWidth, 400)} height={Math.max(tableHeight, 200)}>
          {/* Column headers */}
          {Array.from({ length: logN + 1 }, (_, k) => (
            <g key={`header-${k}`}>
              <text
                x={labelWidth + k * colWidth + colWidth / 2}
                y={20}
                fill="var(--text-secondary)"
                fontSize="11"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                k={k}
              </text>
              <text
                x={labelWidth + k * colWidth + colWidth / 2}
                y={20 + 12}
                fill="var(--text-muted)"
                fontSize="9"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                (2^{k})
              </text>
            </g>
          ))}

          {/* Rows */}
          {Array.from({ length: n }, (_, i) => (
            <g key={`row-${i}`}>
              {/* Row label */}
              <text
                x={8}
                y={headerHeight + i * rowHeight + rowHeight / 2 + 5}
                fill="var(--text-secondary)"
                fontSize="12"
                fontFamily="Consolas, Monaco, monospace"
              >
                i={i}
              </text>

              {/* Cells */}
              {Array.from({ length: logN + 1 }, (_, k) => {
                const x = labelWidth + k * colWidth
                const y = headerHeight + i * rowHeight
                const len = 1 << k
                const isValid = i + len - 1 < n
                const cellVal = st[i]?.[k]
                const highlightColor = getCellColor(i, k)

                // Check if this cell is part of query visualization
                const isQueryLeft = queryRange && k === Math.floor(Math.log2(queryRange.r - queryRange.l + 1)) && i === queryRange.l
                const isQueryRight = queryRange && k === Math.floor(Math.log2(queryRange.r - queryRange.l + 1)) && i === (queryRange.r - (1 << k) + 1)

                let bgColor = 'var(--bg-card)'
                if (highlightColor) {
                  bgColor = highlightColor
                } else if (isQueryLeft) {
                  bgColor = '#3b82f6'
                } else if (isQueryRight) {
                  bgColor = '#8b5cf6'
                }

                return (
                  <g key={`cell-${i}-${k}`}>
                    <rect
                      x={x}
                      y={y}
                      width={colWidth - 2}
                      height={rowHeight - 2}
                      rx="4"
                      fill={isValid ? bgColor : 'var(--bg-secondary)'}
                      stroke={isValid ? 'var(--border)' : 'transparent'}
                      strokeWidth={highlightColor ? 2 : 1}
                      opacity={isValid ? 1 : 0.3}
                    />
                    {isValid && cellVal !== null && cellVal !== undefined && (
                      <text
                        x={x + colWidth / 2 - 1}
                        y={y + rowHeight / 2 + 4}
                        fill={highlightColor || isQueryLeft || isQueryRight ? '#fff' : 'var(--text-primary)'}
                        fontSize="13"
                        fontWeight="600"
                        textAnchor="middle"
                        fontFamily="Consolas, Monaco, monospace"
                      >
                        {cellVal}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Info section */}
      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      {queryResult !== null && queryRange && (
        <div className="viz-info" style={{ fontSize: '0.9rem' }}>
          <strong>查询结果：</strong> arr[{queryRange.l}..{queryRange.r}] 的最大值 = {queryResult}
        </div>
      )}

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已计算 / 结果
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前计算 / 左半区间
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          依赖区间
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          右半区间
        </span>
      </div>
    </div>
  )
}
