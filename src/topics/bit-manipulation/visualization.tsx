import { useState, useEffect, useRef, useCallback } from 'react'

type DemoMode = 'operations' | 'kernighan' | 'subsets'

interface BitStep {
  description: string
  highlightBits?: number[]
  resultBin?: string
  resultDec?: number
}

const toBin = (n: number, width = 8): string =>
  (n >>> 0).toString(2).padStart(width, '0').slice(-width)

function generateKernighanSteps(num: number): BitStep[] {
  const steps: BitStep[] = []
  let n = num
  const width = Math.max(8, toBin(num).length)

  steps.push({
    description: `开始计算 ${num} (${toBin(num, width)}) 的置位个数`,
    resultBin: toBin(n, width),
    resultDec: 0,
  })

  let count = 0
  while (n > 0) {
    const prev = n
    n &= (n - 1)
    count++
    const changedBits: number[] = []
    const prevBin = toBin(prev, width)
    const newBin = toBin(n, width)
    for (let i = 0; i < width; i++) {
      if (prevBin[width - 1 - i] !== newBin[width - 1 - i]) {
        changedBits.push(i)
      }
    }
    steps.push({
      description: `n & (n-1): ${toBin(prev, width)} & ${toBin(prev - 1, width)} = ${toBin(n, width)}，消除了最低位的 1，当前计数 = ${count}`,
      highlightBits: changedBits,
      resultBin: toBin(n, width),
      resultDec: count,
    })
  }

  steps.push({
    description: `n 变为 0，算法结束。${num} 的二进制中有 ${count} 个 1`,
    resultDec: count,
  })

  return steps
}

function generateSubsetSteps(n: number): BitStep[] {
  const steps: BitStep[] = []
  const elements = ['a', 'b', 'c', 'd', 'e'].slice(0, n)
  const width = n

  steps.push({
    description: `枚举集合 {${elements.join(', ')}} 的所有 ${1 << n} 个子集`,
  })

  for (let mask = 0; mask < (1 << n); mask++) {
    const subset: string[] = []
    const highlightBits: number[] = []
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.push(elements[i])
        highlightBits.push(i)
      }
    }
    steps.push({
      description: `mask = ${toBin(mask, width)}  →  子集 = {${subset.join(', ') || '∅'}}`,
      highlightBits,
      resultBin: toBin(mask, width),
    })
  }

  return steps
}

export default function BitManipulationVisualization() {
  const [mode, setMode] = useState<DemoMode>('operations')
  const [inputA, setInputA] = useState(13)
  const [inputB, setInputB] = useState(11)
  const [kernighanInput, setKernighanInput] = useState(180)
  const [subsetSize, setSubsetSize] = useState(3)
  const [selectedOp, setSelectedOp] = useState<string>('AND')
  const [steps, setSteps] = useState<BitStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const bitWidth = 8

  // Generate steps for kernighan / subsets
  const generateSteps = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setCurrentStep(0)
    if (mode === 'kernighan') {
      setSteps(generateKernighanSteps(kernighanInput))
    } else if (mode === 'subsets') {
      setSteps(generateSubsetSteps(subsetSize))
    }
  }, [mode, kernighanInput, subsetSize])

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

  // Compute operation result
  const getOpResult = (): { a: number; b: number; r: number; op: string } => {
    let r: number
    let op: string
    switch (selectedOp) {
      case 'AND': r = inputA & inputB; op = '&'; break
      case 'OR': r = inputA | inputB; op = '|'; break
      case 'XOR': r = inputA ^ inputB; op = '^'; break
      case 'NOT A': r = (~inputA) & 0xff; op = '~'; break
      case 'A<<1': r = (inputA << 1) & 0xff; op = '<<'; break
      case 'A>>1': r = inputA >> 1; op = '>>'; break
      default: r = inputA & inputB; op = '&'
    }
    return { a: inputA, b: inputB, r, op }
  }

  const renderBitRow = (
    value: number,
    label: string,
    color: string,
    highlight?: number[],
    width = bitWidth
  ) => {
    const bin = toBin(value, width)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <span style={{ width: '60px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
          {label}
        </span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {bin.split('').map((bit, idx) => {
            const bitPos = width - 1 - idx
            const isHighlighted = highlight?.includes(bitPos)
            return (
              <div
                key={idx}
                style={{
                  width: '32px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  background: isHighlighted ? '#3b82f6' : bit === '1' ? color : 'rgba(75, 85, 99, 0.3)',
                  color: isHighlighted || bit === '1' ? '#fff' : 'var(--text-secondary)',
                  border: isHighlighted ? '2px solid #60a5fa' : '1px solid var(--border)',
                  transition: 'all 0.3s ease',
                }}
              >
                {bit}
              </div>
            )
          })}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace' }}>
          = {value}
        </span>
      </div>
    )
  }

  const current = steps[currentStep]

  return (
    <div className="visualization-container">
      {/* Mode selector */}
      <div className="viz-controls">
        <button
          className={`btn ${mode === 'operations' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('operations'); setCurrentStep(0) }}
        >
          基本运算
        </button>
        <button
          className={`btn ${mode === 'kernighan' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('kernighan'); generateSteps() }}
        >
          Kernighan 算法
        </button>
        <button
          className={`btn ${mode === 'subsets' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('subsets'); generateSteps() }}
        >
          子集枚举
        </button>
      </div>

      {/* Mode-specific input controls */}
      {mode === 'operations' && (
        <div className="viz-controls">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            A:
            <input
              type="number"
              value={inputA}
              onChange={e => setInputA(Math.max(0, Math.min(255, Number(e.target.value))))}
              style={{
                padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem', width: '60px',
                fontFamily: 'Consolas, Monaco, monospace',
              }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            B:
            <input
              type="number"
              value={inputB}
              onChange={e => setInputB(Math.max(0, Math.min(255, Number(e.target.value))))}
              style={{
                padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem', width: '60px',
                fontFamily: 'Consolas, Monaco, monospace',
              }}
            />
          </label>
          {['AND', 'OR', 'XOR', 'NOT A', 'A<<1', 'A>>1'].map(op => (
            <button
              key={op}
              className={`btn ${selectedOp === op ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedOp(op)}
            >
              {op}
            </button>
          ))}
        </div>
      )}

      {mode === 'kernighan' && (
        <div className="viz-controls">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            数字:
            <input
              type="number"
              value={kernighanInput}
              onChange={e => setKernighanInput(Math.max(0, Math.min(65535, Number(e.target.value))))}
              style={{
                padding: '0.4rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem', width: '80px',
                fontFamily: 'Consolas, Monaco, monospace',
              }}
            />
          </label>
          <button className="btn btn-primary" onClick={generateSteps}>重新计算</button>
          <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>上一步</button>
          <button className="btn btn-primary" onClick={togglePlay}>
            {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
          </button>
          <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= steps.length - 1}>下一步</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            速度:
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
            />
            {speed}ms
          </label>
        </div>
      )}

      {mode === 'subsets' && (
        <div className="viz-controls">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            元素个数:
            <input
              type="range"
              min="1"
              max="5"
              value={subsetSize}
              onChange={e => setSubsetSize(Number(e.target.value))}
            />
            {subsetSize} (共 {1 << subsetSize} 个子集)
          </label>
          <button className="btn btn-primary" onClick={generateSteps}>重新生成</button>
          <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>上一步</button>
          <button className="btn btn-primary" onClick={togglePlay}>
            {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
          </button>
          <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= steps.length - 1}>下一步</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            速度:
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
            />
            {speed}ms
          </label>
        </div>
      )}

      {/* Progress bar for step-based modes */}
      {(mode === 'kernighan' || mode === 'subsets') && steps.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
            {currentStep + 1}/{steps.length}
          </span>
          <input
            type="range"
            min="0"
            max={steps.length - 1}
            value={currentStep}
            onChange={e => { setIsPlaying(false); setCurrentStep(Number(e.target.value)) }}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* Visualization canvas */}
      <div className="viz-canvas" style={{ padding: '1rem', minHeight: '280px' }}>
        {mode === 'operations' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            {(() => {
              const { a, b, r, op } = getOpResult()
              const isUnary = selectedOp.startsWith('NOT') || selectedOp.includes('<<') || selectedOp.includes('>>')
              return (
                <>
                  {renderBitRow(a, 'A', '#3b82f6')}
                  {!isUnary && renderBitRow(b, 'B', '#8b5cf6')}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                    {'─'.repeat(bitWidth * 3.8)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '60px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                      {selectedOp}
                    </span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {toBin(r, bitWidth).split('').map((bit, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: '32px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            fontFamily: 'Consolas, Monaco, monospace',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            background: bit === '1' ? '#22c55e' : 'rgba(75, 85, 99, 0.3)',
                            color: bit === '1' ? '#fff' : 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {bit}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace' }}>
                      = {r}
                    </span>
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {mode === 'kernighan' && current && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            {renderBitRow(
              kernighanInput,
              '原数',
              '#3b82f6',
              undefined,
              Math.max(8, toBin(kernighanInput).length)
            )}
            {current.resultBin && (
              <>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                  {'─'.repeat(Math.max(8, toBin(kernighanInput).length) * 3.8)}
                </div>
                {renderBitRow(
                  parseInt(current.resultBin, 2),
                  '当前 n',
                  '#8b5cf6',
                  current.highlightBits,
                  Math.max(8, toBin(kernighanInput).length)
                )}
              </>
            )}
          </div>
        )}

        {mode === 'subsets' && current && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            {/* Element labels */}
            <div style={{ display: 'flex', gap: '2px', marginLeft: '65px' }}>
              {['a', 'b', 'c', 'd', 'e'].slice(0, subsetSize).map((el, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '32px',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: current.highlightBits?.includes(subsetSize - 1 - idx) ? '#60a5fa' : 'var(--text-secondary)',
                    fontWeight: current.highlightBits?.includes(subsetSize - 1 - idx) ? 'bold' : 'normal',
                  }}
                >
                  {el}
                </div>
              ))}
            </div>
            {current.resultBin && renderBitRow(
              parseInt(current.resultBin, 2),
              'mask',
              '#8b5cf6',
              current.highlightBits?.map(b => subsetSize - 1 - b),
              subsetSize
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap',
        fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0',
      }}>
        {mode === 'operations' && (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
              操作数 A
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '2px', display: 'inline-block' }} />
              操作数 B
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
              结果
            </span>
          </>
        )}
        {mode === 'kernighan' && (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
              原始数字
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '2px', display: 'inline-block' }} />
              当前值
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
              被消除的位
            </span>
          </>
        )}
        {mode === 'subsets' && (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '2px', display: 'inline-block' }} />
              选中的元素
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '12px', height: '12px', background: 'rgba(75, 85, 99, 0.3)', borderRadius: '2px', display: 'inline-block' }} />
              未选中的元素
            </span>
          </>
        )}
      </div>

      {/* Info panel */}
      <div className="viz-info">
        {mode === 'operations' && (
          <>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>当前操作：</strong>{selectedOp} — {getOpResult().a} {getOpResult().op} {selectedOp.startsWith('NOT') || selectedOp.includes('<') || selectedOp.includes('>') ? '' : getOpResult().b} = {getOpResult().r}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              A = {toBin(inputA, 8)}, B = {toBin(inputB, 8)}, 结果 = {toBin(getOpResult().r, 8)}
            </div>
          </>
        )}
        {mode === 'kernighan' && current && (
          <>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>当前操作：</strong>{current.description}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              步骤: {currentStep + 1}/{steps.length} | 当前置位数: {current.resultDec ?? 0}
            </div>
          </>
        )}
        {mode === 'subsets' && current && (
          <>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>当前子集：</strong>{current.description}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              步骤: {currentStep + 1}/{steps.length} / {1 << subsetSize}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
