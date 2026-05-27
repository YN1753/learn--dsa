import { useState, useCallback, useRef, useEffect } from 'react'

interface Query {
  id: number
  left: number
  right: number
  k: number
  label: string
}

interface SolveStep {
  description: string
  valueRange: [number, number]
  mid: number
  activeQueries: number[]
  queryResults: { id: number; count: number; target: number; goesLeft: boolean }[]
  bitState: number[]
  phase: 'add' | 'query' | 'rollback' | 'split' | 'result'
}

const INITIAL_ARRAY = [3, 1, 4, 1, 5, 9, 2, 6]

const INITIAL_QUERIES: Query[] = [
  { id: 0, left: 1, right: 5, k: 2, label: 'Q1: [1,5] 第2小' },
  { id: 1, left: 3, right: 7, k: 3, label: 'Q2: [3,7] 第3小' },
  { id: 2, left: 1, right: 8, k: 4, label: 'Q3: [1,8] 第4小' },
]

function bitUpdate(bit: number[], n: number, i: number, delta: number): void {
  for (; i <= n; i += i & (-i)) {
    bit[i] += delta
  }
}

function bitQuery(bit: number[], i: number): number {
  let sum = 0
  for (; i > 0; i -= i & (-i)) {
    sum += bit[i]
  }
  return sum
}

function generateSteps(arr: number[], queries: Query[]): SolveStep[] {
  const steps: SolveStep[] = []
  const n = arr.length
  const valMin = 1
  const valMax = Math.max(...arr)

  interface InternalQuery {
    id: number
    left: number
    right: number
    k: number
  }

  function solve(
    qList: InternalQuery[],
    L: number,
    R: number
  ): void {
    if (qList.length === 0) return
    if (L === R) {
      for (const q of qList) {
        steps.push({
          description: `查询 Q${q.id + 1} 答案确定为 ${L}`,
          valueRange: [L, R],
          mid: L,
          activeQueries: [q.id],
          queryResults: [],
          bitState: [],
          phase: 'result',
        })
      }
      return
    }

    const mid = Math.floor((L + R) / 2)

    // Phase: Add operations
    const bit = new Array(n + 2).fill(0)
    const addedPositions: number[] = []
    for (let i = 0; i < n; i++) {
      if (arr[i] <= mid) {
        bitUpdate(bit, n, i + 1, 1)
        addedPositions.push(i + 1)
      }
    }

    steps.push({
      description: `值域 [${L}, ${R}], mid = ${mid}. 加入值 <= ${mid} 的位置到树状数组`,
      valueRange: [L, R],
      mid,
      activeQueries: qList.map(q => q.id),
      queryResults: [],
      bitState: [...bit.slice(1, n + 1)],
      phase: 'add',
    })

    // Phase: Query
    const leftQ: InternalQuery[] = []
    const rightQ: InternalQuery[] = []
    const queryResults: { id: number; count: number; target: number; goesLeft: boolean }[] = []

    for (const q of qList) {
      const count = bitQuery(bit, q.right) - bitQuery(bit, q.left - 1)
      const goesLeft = count >= q.k
      queryResults.push({ id: q.id, count, target: q.k, goesLeft })
      if (goesLeft) {
        leftQ.push(q)
      } else {
        rightQ.push({ ...q, k: q.k - count })
      }
    }

    steps.push({
      description: `判定查询: 统计各区间内 <= ${mid} 的数的个数`,
      valueRange: [L, R],
      mid,
      activeQueries: qList.map(q => q.id),
      queryResults,
      bitState: [...bit.slice(1, n + 1)],
      phase: 'query',
    })

    // Phase: Rollback
    for (const pos of addedPositions) {
      bitUpdate(bit, n, pos, -1)
    }

    steps.push({
      description: `撤销树状数组操作`,
      valueRange: [L, R],
      mid,
      activeQueries: qList.map(q => q.id),
      queryResults,
      bitState: new Array(n).fill(0),
      phase: 'rollback',
    })

    // Phase: Split
    steps.push({
      description: `分组: 左 [${L}, ${mid}] 包含 ${leftQ.map(q => 'Q' + (q.id + 1)).join(', ') || '无'}, 右 [${mid + 1}, ${R}] 包含 ${rightQ.map(q => 'Q' + (q.id + 1)).join(', ') || '无'}`,
      valueRange: [L, R],
      mid,
      activeQueries: qList.map(q => q.id),
      queryResults,
      bitState: new Array(n).fill(0),
      phase: 'split',
    })

    solve(leftQ, L, mid)
    solve(rightQ, mid + 1, R)
  }

  const internalQueries: InternalQuery[] = queries.map(q => ({
    id: q.id,
    left: q.left,
    right: q.right,
    k: q.k,
  }))

  solve(internalQueries, valMin, valMax)
  return steps
}

export default function ParallelBinarySearchVisualization() {
  const [arr] = useState<number[]>(INITIAL_ARRAY)
  const [queries] = useState<Query[]>(INITIAL_QUERIES)
  const [steps, setSteps] = useState<SolveStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const [description, setDescription] = useState<string>('点击「开始」按钮开始整体二分演示')
  const [valueRange, setValueRange] = useState<[number, number]>([1, 9])
  const [mid, setMid] = useState(0)
  const [activeQueries, setActiveQueries] = useState<number[]>([])
  const [queryResults, setQueryResults] = useState<SolveStep['queryResults']>([])
  const [bitState, setBitState] = useState<number[]>(new Array(INITIAL_ARRAY.length).fill(0))
  const [phase, setPhase] = useState<SolveStep['phase']>('add')
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(INITIAL_QUERIES.length).fill(null))
  const timerRef = useRef<number | null>(null)

  const handleStart = useCallback(() => {
    const generatedSteps = generateSteps(arr, queries)
    setSteps(generatedSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setAnswers(new Array(queries.length).fill(null))
    setDescription('整体二分开始...')
  }, [arr, queries])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      setDescription('整体二分完成！')
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setDescription(step.description)
      setValueRange(step.valueRange)
      setMid(step.mid)
      setActiveQueries(step.activeQueries)
      setQueryResults(step.queryResults)
      setBitState(step.bitState)
      setPhase(step.phase)

      if (step.phase === 'result' && step.queryResults.length === 0) {
        const qId = step.activeQueries[0]
        if (qId !== undefined) {
          setAnswers(prev => {
            const next = [...prev]
            next[qId] = step.mid
            return next
          })
        }
      }

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

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setDescription('点击「开始」按钮开始整体二分演示')
    setValueRange([1, 9])
    setMid(0)
    setActiveQueries([])
    setQueryResults([])
    setBitState(new Array(arr.length).fill(0))
    setPhase('add')
    setAnswers(new Array(queries.length).fill(null))
  }

  const getPhaseLabel = (): string => {
    switch (phase) {
      case 'add': return '加入操作'
      case 'query': return '判定查询'
      case 'rollback': return '撤销操作'
      case 'split': return '分组递归'
      case 'result': return '答案确定'
      default: return ''
    }
  }

  const getPhaseColor = (): string => {
    switch (phase) {
      case 'add': return '#3b82f6'
      case 'query': return '#f59e0b'
      case 'rollback': return '#ef4444'
      case 'split': return '#8b5cf6'
      case 'result': return '#22c55e'
      default: return 'var(--text-secondary)'
    }
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始
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

      <div className="viz-canvas" style={{ padding: '1.5rem', minHeight: '420px' }}>
        {/* Array display */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            原始数组:
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {arr.map((val, idx) => {
              const isActive = bitState[idx] > 0
              return (
                <div
                  key={idx}
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${isActive ? '#22c55e' : 'var(--border)'}`,
                    borderRadius: '6px',
                    background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-card)',
                    color: isActive ? '#22c55e' : 'var(--text-primary)',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span>{val}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{idx + 1}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* BIT state */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            树状数组状态 (前缀和):
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {bitState.map((val, idx) => (
              <div
                key={idx}
                style={{
                  width: '48px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${val > 0 ? '#3b82f6' : 'var(--border)'}`,
                  borderRadius: '4px',
                  background: val > 0 ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)',
                  color: val > 0 ? '#3b82f6' : 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                }}
              >
                {val}
              </div>
            ))}
          </div>
        </div>

        {/* Value range visualization */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            当前值域: [{valueRange[0]}, {valueRange[1]}] {mid > 0 ? `| mid = ${mid}` : ''}
          </div>
          <div style={{
            display: 'flex',
            gap: '2px',
            alignItems: 'flex-end',
            height: '40px',
          }}>
            {Array.from({ length: 9 }, (_, i) => i + 1).map(v => {
              const inRange = v >= valueRange[0] && v <= valueRange[1]
              const isMid = v === mid
              const isLeft = v >= valueRange[0] && v <= mid
              return (
                <div
                  key={v}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontWeight: isMid ? 'bold' : 'normal',
                    border: isMid ? '2px solid #f59e0b' : inRange ? `1px solid ${isLeft ? '#3b82f6' : '#ef4444'}` : '1px solid var(--border)',
                    background: isMid ? 'rgba(245, 158, 11, 0.2)' : inRange ? (isLeft ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)') : 'var(--bg-card)',
                    color: isMid ? '#f59e0b' : inRange ? (isLeft ? '#3b82f6' : '#ef4444') : 'var(--text-secondary)',
                    opacity: inRange ? 1 : 0.4,
                  }}
                >
                  {v}
                </div>
              )
            })}
          </div>
        </div>

        {/* Queries display */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            查询状态:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {queries.map(q => {
              const isActive = activeQueries.includes(q.id)
              const result = queryResults.find(r => r.id === q.id)
              const answer = answers[q.id]
              return (
                <div
                  key={q.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${isActive ? '#f59e0b' : 'var(--border)'}`,
                    background: isActive ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                    fontSize: '0.85rem',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span style={{ fontWeight: 'bold', color: isActive ? '#f59e0b' : 'var(--text-primary)', minWidth: '100px' }}>
                    {q.label}
                  </span>
                  {result && (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {`<= ${mid} 的数: ${result.count} 个`}
                      {' -> '}
                      <span style={{ color: result.goesLeft ? '#3b82f6' : '#ef4444', fontWeight: 'bold' }}>
                        {result.goesLeft ? `去左 [${valueRange[0]}, ${mid}]` : `去右 [${mid + 1}, ${valueRange[1]}]`}
                      </span>
                    </span>
                  )}
                  {answer !== null && (
                    <span style={{ color: '#22c55e', fontWeight: 'bold', marginLeft: 'auto' }}>
                      答案 = {answer}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Phase indicator */}
        {steps.length > 0 && currentStep > 0 && (
          <div style={{
            display: 'inline-block',
            padding: '0.3rem 0.75rem',
            borderRadius: '4px',
            background: getPhaseColor(),
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 'bold',
          }}>
            {getPhaseLabel()}
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已加入 BIT
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          左半值域
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          右半值域
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前 mid
        </span>
      </div>
    </div>
  )
}
