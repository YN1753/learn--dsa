import { useState, useEffect, useRef, useCallback } from 'react'

interface AnimationStep {
  description: string
  bits: number[]
  highlightPositions: number[]
  highlightType: 'insert' | 'query-check' | 'query-pass' | 'query-fail' | 'none'
  currentHashIndex: number
}

const BIT_COUNT = 24
const HASH_COUNT = 3
const INITIAL_BITS: number[] = new Array(BIT_COUNT).fill(0)

function simpleHash(element: string, seed: number): number {
  let hash = 5381 + seed * 33
  for (let i = 0; i < element.length; i++) {
    hash = ((hash << 5) + hash + element.charCodeAt(i)) & 0x7fffffff
  }
  return hash % BIT_COUNT
}

export default function BloomFilterVisualization() {
  const [bits, setBits] = useState<number[]>([...INITIAL_BITS])
  const [highlightPositions, setHighlightPositions] = useState<number[]>([])
  const [highlightType, setHighlightType] = useState<'insert' | 'query-check' | 'query-pass' | 'query-fail' | 'none'>('none')
  const [currentHashIndex, setCurrentHashIndex] = useState(-1)
  const [description, setDescription] = useState<string>('布隆过滤器演示 - 输入元素后点击插入或查询')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [insertedElements, setInsertedElements] = useState<string[]>([])
  const timerRef = useRef<number | null>(null)

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
      setBits([...step.bits])
      setHighlightPositions([...step.highlightPositions])
      setHighlightType(step.highlightType)
      setCurrentHashIndex(step.currentHashIndex)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handleInsert = () => {
    const element = inputValue.trim()
    if (!element) {
      setDescription('请输入要插入的元素')
      return
    }
    if (insertedElements.includes(element)) {
      setDescription(`元素 "${element}" 已存在（注意：布隆过滤器实际无法判断是否重复插入）`)
    }

    const animationSteps: AnimationStep[] = []
    const newBits = [...bits]
    const positions: number[] = []

    for (let i = 0; i < HASH_COUNT; i++) {
      const pos = simpleHash(element, i)
      positions.push(pos)
    }

    // 展示每个哈希函数的计算和置位
    for (let i = 0; i < HASH_COUNT; i++) {
      const pos = positions[i]
      newBits[pos] = 1

      animationSteps.push({
        description: `插入 "${element}" - 第 ${i + 1} 个哈希函数: h${i + 1}("${element}") = ${pos}，将位数组[${pos}] 设为 1`,
        bits: [...newBits],
        highlightPositions: positions.slice(0, i + 1),
        highlightType: 'insert',
        currentHashIndex: i,
      })
    }

    // 完成
    animationSteps.push({
      description: `插入 "${element}" 完成！共设置了 ${HASH_COUNT} 个位`,
      bits: [...newBits],
      highlightPositions: positions,
      highlightType: 'insert',
      currentHashIndex: -1,
    })

    setBits(newBits)
    setInsertedElements(prev => [...prev, element])
    executeSteps(animationSteps)
  }

  const handleQuery = () => {
    const element = inputValue.trim()
    if (!element) {
      setDescription('请输入要查询的元素')
      return
    }

    const animationSteps: AnimationStep[] = []
    const positions: number[] = []
    const bitValues: number[] = []

    for (let i = 0; i < HASH_COUNT; i++) {
      const pos = simpleHash(element, i)
      positions.push(pos)
      bitValues.push(bits[pos])
    }

    // 逐步检查每个位
    for (let i = 0; i < HASH_COUNT; i++) {
      const pos = positions[i]
      const bitVal = bitValues[i]
      const status = bitVal === 1 ? '为 1（通过）' : '为 0（未通过）'

      animationSteps.push({
        description: `查询 "${element}" - 检查第 ${i + 1} 个哈希位: h${i + 1}("${element}") = ${pos}，位数组[${pos}] ${status}`,
        bits: [...bits],
        highlightPositions: [pos],
        highlightType: 'query-check',
        currentHashIndex: i,
      })
    }

    // 最终结果
    const allOnes = bitValues.every(v => v === 1)
    const isInserted = insertedElements.includes(element)

    if (allOnes) {
      if (isInserted) {
        animationSteps.push({
          description: `查询 "${element}" 结果: 所有位都为 1 → 可能存在 ✓（真阳性：元素确实已插入）`,
          bits: [...bits],
          highlightPositions: positions,
          highlightType: 'query-pass',
          currentHashIndex: -1,
        })
      } else {
        animationSteps.push({
          description: `查询 "${element}" 结果: 所有位都为 1 → 可能存在 ✗（假阳性！元素从未插入，但所有对应位碰巧都为 1）`,
          bits: [...bits],
          highlightPositions: positions,
          highlightType: 'query-fail',
          currentHashIndex: -1,
        })
      }
    } else {
      animationSteps.push({
        description: `查询 "${element}" 结果: 存在位为 0 → 一定不存在 ✓（真阴性）`,
        bits: [...bits],
        highlightPositions: positions,
        highlightType: 'query-fail',
        currentHashIndex: -1,
      })
    }

    executeSteps(animationSteps)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setBits([...INITIAL_BITS])
    setHighlightPositions([])
    setHighlightType('none')
    setCurrentHashIndex(-1)
    setDescription('布隆过滤器已重置')
    setSteps([])
    setCurrentStep(0)
    setInsertedElements([])
    setInputValue('')
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const getBitColor = (index: number): string => {
    const isHighlighted = highlightPositions.includes(index)
    if (!isHighlighted) {
      return bits[index] === 1 ? '#6b7280' : 'var(--bg-card)'
    }
    switch (highlightType) {
      case 'insert': return '#22c55e'
      case 'query-check': return '#3b82f6'
      case 'query-pass': return '#22c55e'
      case 'query-fail': return '#ef4444'
      default: return 'var(--bg-card)'
    }
  }

  const getBitBorder = (index: number): string => {
    const isHighlighted = highlightPositions.includes(index)
    if (!isHighlighted) {
      return bits[index] === 1 ? '#4b5563' : 'var(--border)'
    }
    switch (highlightType) {
      case 'insert': return '#4ade80'
      case 'query-check': return '#60a5fa'
      case 'query-pass': return '#4ade80'
      case 'query-fail': return '#f87171'
      default: return 'var(--border)'
    }
  }

  const onCount = bits.filter(b => b === 1).length

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入元素名称"
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            width: '140px',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isPlaying) handleInsert()
          }}
        />
        <button className="btn btn-primary" onClick={handleInsert} disabled={isPlaying}>
          插入
        </button>
        <button className="btn btn-primary" onClick={handleQuery} disabled={isPlaying}>
          查询
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

      <div className="viz-canvas" style={{ overflowX: 'auto', padding: '1rem' }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          位数组 (m = {BIT_COUNT}, k = {HASH_COUNT})
        </div>

        {/* 位数组 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
          {bits.map((bit, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* 索引 */}
              <div style={{
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                marginBottom: '2px',
                fontFamily: 'Consolas, Monaco, monospace',
              }}>
                {index}
              </div>
              {/* 位 */}
              <div style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                border: `2px solid ${getBitBorder(index)}`,
                background: getBitColor(index),
                color: highlightPositions.includes(index) ? '#fff' : (bit === 1 ? '#fff' : 'var(--text-secondary)'),
                fontWeight: 'bold',
                fontSize: '0.9rem',
                fontFamily: 'Consolas, Monaco, monospace',
                transition: 'all 0.2s ease',
              }}>
                {bit}
              </div>
              {/* 哈希函数标记 */}
              {currentHashIndex >= 0 && highlightPositions[currentHashIndex] === index && (
                <div style={{
                  fontSize: '0.6rem',
                  marginTop: '2px',
                  color: highlightType === 'insert' ? '#22c55e' : '#3b82f6',
                  fontWeight: 'bold',
                }}>
                  h{currentHashIndex + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 统计信息 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '1rem',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
        }}>
          <span>已置 1 的位数: {onCount}/{BIT_COUNT}</span>
          <span>使用率: {(onCount / BIT_COUNT * 100).toFixed(1)}%</span>
          <span>已插入元素: {insertedElements.length}</span>
        </div>

        {/* 已插入元素列表 */}
        {insertedElements.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
            flexWrap: 'wrap',
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>已插入:</span>
            {insertedElements.map((elem, i) => (
              <span key={i} style={{
                padding: '0.1rem 0.5rem',
                borderRadius: '4px',
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                fontSize: '0.8rem',
                fontFamily: 'Consolas, Monaco, monospace',
              }}>
                {elem}
              </span>
            ))}
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
          插入/真阳性
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          查询检查中
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          假阳性/不存在
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#6b7280', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          已置 1
        </span>
      </div>
    </div>
  )
}
