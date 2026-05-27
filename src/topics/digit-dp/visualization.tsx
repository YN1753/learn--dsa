import { useState, useEffect, useRef, useCallback } from 'react'

interface DPState {
  pos: number
  tight: boolean
  digit: number
  currentNumber: number[]
  description: string
  memoSnapshot: Record<string, number>
  children: { digit: number; tight: boolean; result: number }[]
  result: number
  phase: 'explore' | 'memo-hit' | 'return'
  depth: number
}

function generateDPSteps(N: number, forbidden: number): DPState[] {
  const digits = String(N).split('').map(Number)
  const len = digits.length
  const steps: DPState[] = []
  const memo: Map<string, number> = new Map()
  const memoSnapshot: Record<string, number> = {}

  function dfs(pos: number, tight: boolean, path: number[], depth: number): number {
    if (pos === len) {
      steps.push({
        pos, tight, digit: -1,
        currentNumber: [...path],
        description: `到达末尾，构造完成: ${path.length > 0 ? path.join('') : '0'}`,
        memoSnapshot: { ...memoSnapshot },
        children: [],
        result: 1,
        phase: 'return',
        depth,
      })
      return 1
    }

    const key = `${pos},${tight ? 1 : 0}`
    if (!tight && memo.has(key)) {
      const cached = memo.get(key)!
      steps.push({
        pos, tight, digit: -1,
        currentNumber: [...path],
        description: `记忆化命中: dfs(${pos}, tight=false) = ${cached}`,
        memoSnapshot: { ...memoSnapshot },
        children: [],
        result: cached,
        phase: 'memo-hit',
        depth,
      })
      return cached
    }

    const upper = tight ? digits[pos] : 9
    const children: { digit: number; tight: boolean; result: number }[] = []

    steps.push({
      pos, tight, digit: -1,
      currentNumber: [...path],
      description: `探索 dfs(pos=${pos}, tight=${tight})，上界=${upper}，可选数字: ${Array.from({ length: upper + 1 }, (_, i) => i).filter(d => d !== forbidden).join(',')}`,
      memoSnapshot: { ...memoSnapshot },
      children: [],
      result: 0,
      phase: 'explore',
      depth,
    })

    let result = 0
    for (let d = 0; d <= upper; d++) {
      if (d === forbidden) {
        steps.push({
          pos, tight, digit: d,
          currentNumber: [...path],
          description: `跳过数字 ${d}（被禁止）`,
          memoSnapshot: { ...memoSnapshot },
          children: [],
          result: 0,
          phase: 'explore',
          depth,
        })
        continue
      }
      const newPath = [...path, d]
      const newTight = tight && d === upper
      const subResult = dfs(pos + 1, newTight, newPath, depth + 1)
      children.push({ digit: d, tight: newTight, result: subResult })
      result += subResult
    }

    if (!tight) {
      memo.set(key, result)
      memoSnapshot[key] = result
    }

    steps.push({
      pos, tight, digit: -1,
      currentNumber: [...path],
      description: `返回 dfs(${pos}, tight=${tight}) = ${result}`,
      memoSnapshot: { ...memoSnapshot },
      children,
      result,
      phase: 'return',
      depth,
    })

    return result
  }

  dfs(0, true, [], 0)
  return steps
}

const PRESETS = [
  { label: 'N=23', N: 23, forbidden: 4 },
  { label: 'N=50', N: 50, forbidden: 4 },
  { label: 'N=100', N: 100, forbidden: 4 },
  { label: 'N=523', N: 523, forbidden: 4 },
]

export default function DigitDPVisualization() {
  const [N, setN] = useState(23)
  const [forbidden, setForbidden] = useState(4)
  const [steps, setSteps] = useState<DPState[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const generateSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    const newSteps = generateDPSteps(N, forbidden)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [N, forbidden])

  useEffect(() => {
    generateSteps()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, speed)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, steps, speed])

  const togglePlay = useCallback(() => {
    if (steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }, [steps, currentStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1)
  }, [currentStep, steps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }, [currentStep])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
  }, [])

  const current = steps[currentStep]
  const digits = String(N).split('').map(Number)

  const getPhaseColor = (phase: DPState['phase']): string => {
    switch (phase) {
      case 'explore': return '#3b82f6'
      case 'memo-hit': return '#22c55e'
      case 'return': return '#f59e0b'
    }
  }

  const getPhaseLabel = (phase: DPState['phase']): string => {
    switch (phase) {
      case 'explore': return '探索'
      case 'memo-hit': return '命中'
      case 'return': return '返回'
    }
  }

  return (
    <div className="visualization-container">
      {/* Problem description */}
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
            问题:
          </span>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            统计 [1, N] 中不含数字 {forbidden} 的数的个数
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              className="btn btn-secondary"
              style={{
                fontSize: '0.8rem',
                padding: '0.2rem 0.6rem',
                background: N === p.N ? 'var(--accent)' : undefined,
                color: N === p.N ? '#fff' : undefined,
              }}
              onClick={() => { setN(p.N); setForbidden(p.forbidden) }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upper bound display */}
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            上界 N =
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {digits.map((d, i) => {
              const isCurrentPos = current && current.pos === i
              const isTightPos = current && current.pos > i
              return (
                <div
                  key={i}
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: isCurrentPos
                      ? '#f59e0b33'
                      : isTightPos
                        ? '#22c55e22'
                        : 'var(--bg-card)',
                    border: isCurrentPos
                      ? '2px solid #f59e0b'
                      : isTightPos
                        ? '2px solid #22c55e'
                        : '1px solid var(--border)',
                    color: isCurrentPos ? '#fbbf24' : 'var(--text-primary)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {d}
                </div>
              )
            })}
          </div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
            禁止数字: {forbidden}
          </span>
        </div>
      </div>

      {/* Current number being constructed */}
      <div className="viz-controls">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            当前构造:
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {current && current.currentNumber.length > 0 ? (
              current.currentNumber.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: d === forbidden ? '#ef444433' : '#22c55e22',
                    border: d === forbidden ? '2px solid #ef4444' : '2px solid #22c55e',
                    color: d === forbidden ? '#f87171' : '#86efac',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {d}
                </div>
              ))
            ) : (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>(空)</span>
            )}
          </div>
          {current && current.phase === 'return' && current.result > 0 && (
            <span style={{
              marginLeft: '0.5rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius)',
              background: '#22c55e22',
              border: '1px solid #22c55e',
              color: '#86efac',
              fontSize: '0.85rem',
            }}>
              = {current.currentNumber.length > 0 ? parseInt(current.currentNumber.join('')) : 0}
            </span>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-secondary)', fontSize: '0.85rem',
        }}>
          速度:
          <input
            type="range" min="200" max="2000" step="100"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          {speed}ms
        </label>
      </div>

      {/* Progress bar */}
      {steps.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
            {currentStep + 1}/{steps.length}
          </span>
          <input
            type="range" min="0" max={steps.length - 1}
            value={currentStep}
            onChange={e => { setIsPlaying(false); setCurrentStep(Number(e.target.value)) }}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* Decision tree visualization */}
      <div
        className="viz-canvas"
        style={{
          overflow: 'auto',
          padding: '1rem',
          minHeight: '200px',
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '0.85rem',
        }}
      >
        {current && (
          <div>
            {/* Show DFS call stack as indented tree */}
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              DFS 调用栈 (深度 {current.depth}):
            </div>
            <div style={{
              background: '#0d1117',
              borderRadius: 'var(--radius)',
              padding: '0.75rem',
              border: '1px solid var(--border)',
            }}>
              {/* Show the current path as tree nodes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#8b949e' }}>root</span>
                {current.currentNumber.map((d, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: '#8b949e' }}>{' → '}</span>
                    <span style={{
                      padding: '0.1rem 0.4rem',
                      borderRadius: '3px',
                      background: i === current.currentNumber.length - 1
                        ? getPhaseColor(current.phase) + '33'
                        : '#21262d',
                      color: i === current.currentNumber.length - 1
                        ? getPhaseColor(current.phase)
                        : '#e6edf3',
                      border: `1px solid ${i === current.currentNumber.length - 1 ? getPhaseColor(current.phase) : '#30363d'}`,
                    }}>
                      {d}
                    </span>
                  </span>
                ))}
                {current.digit >= 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: '#8b949e' }}>{' → '}</span>
                    <span style={{
                      padding: '0.1rem 0.4rem',
                      borderRadius: '3px',
                      background: '#f59e0b33',
                      color: '#fbbf24',
                      border: '1px solid #f59e0b',
                      fontWeight: 'bold',
                    }}>
                      {current.digit}
                    </span>
                  </span>
                )}
              </div>

              {/* Children explored */}
              {current.children.length > 0 && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #21262d' }}>
                  <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>子结果: </span>
                  {current.children.map((ch, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      margin: '0.15rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '3px',
                      background: ch.result > 0 ? '#22c55e22' : '#ef444422',
                      border: `1px solid ${ch.result > 0 ? '#22c55e' : '#ef4444'}`,
                      color: ch.result > 0 ? '#86efac' : '#f87171',
                      fontSize: '0.8rem',
                    }}>
                      d={ch.digit}{ch.tight ? '(紧)' : '(松)'}: {ch.result}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Memoization table */}
      <div className="viz-canvas" style={{ padding: '1rem', minHeight: '120px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          记忆化缓存表:
        </div>
        {current && Object.keys(current.memoSnapshot).length > 0 ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.entries(current.memoSnapshot).map(([key, val]) => (
              <div
                key={key}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius)',
                  background: '#22c55e22',
                  border: '1px solid #22c55e',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.8rem',
                  color: '#86efac',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>dfs({key})</span>
                {' = '}
                <strong>{val}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
            (缓存为空)
          </div>
        )}
      </div>

      {/* Tight/loose indicator */}
      <div style={{
        display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.25rem 0.6rem', borderRadius: 'var(--radius)',
          background: current?.tight ? '#f59e0b22' : '#37415122',
          border: `1px solid ${current?.tight ? '#f59e0b' : '#4b5563'}`,
          fontSize: '0.8rem',
          color: current?.tight ? '#fbbf24' : 'var(--text-secondary)',
        }}>
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: current?.tight ? '#f59e0b' : '#4b5563',
            display: 'inline-block',
          }} />
          {current?.tight ? '紧贴上界 (tight)' : '自由选择 (loose)'}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.25rem 0.6rem', borderRadius: 'var(--radius)',
          background: '#3b82f622',
          border: '1px solid #3b82f6',
          fontSize: '0.8rem',
          color: '#93c5fd',
        }}>
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#3b82f6',
            display: 'inline-block',
          }} />
          位置: {current?.pos ?? 0} / {digits.length}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.25rem 0.6rem', borderRadius: 'var(--radius)',
          background: '#ef444422',
          border: '1px solid #ef4444',
          fontSize: '0.8rem',
          color: '#f87171',
        }}>
          <span style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#ef4444',
            display: 'inline-block',
          }} />
          禁止数字: {forbidden}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap',
        fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.5rem 0',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
          探索中
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
          记忆化命中
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }} />
          返回结果
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current?.description || '等待开始...'}
        </div>
        {current && (
          <div style={{
            display: 'flex', gap: '1.5rem', fontSize: '0.85rem',
            color: 'var(--text-secondary)', flexWrap: 'wrap',
          }}>
            <span>
              状态: <span style={{ color: getPhaseColor(current.phase) }}>{getPhaseLabel(current.phase)}</span>
            </span>
            <span>位置: pos={current.pos}</span>
            <span>上界约束: {current.tight ? '是' : '否'}</span>
            {current.phase === 'return' && <span>返回值: <strong style={{ color: '#fbbf24' }}>{current.result}</strong></span>}
            <span>步骤: {currentStep + 1}/{steps.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}
