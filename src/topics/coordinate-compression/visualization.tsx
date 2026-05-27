import { useState, useEffect, useRef, useCallback } from 'react'

interface CompressStep {
  description: string
  phase: 'input' | 'sort' | 'map' | 'result' | 'query' | 'done'
  originalValues: number[]
  sortedUnique: number[]
  mapping: Map<number, number>
  compressedResult: number[]
  currentOriginalIndex: number
  currentSortedIndex: number
  highlightedValue: number | null
  queryValue: number | null
  queryResult: number | null
}

function buildCompressSteps(values: number[], queryVal: number | null): CompressStep[] {
  const steps: CompressStep[] = []
  const sorted = [...new Set(values)].sort((a, b) => a - b)
  const mapping = new Map<number, number>()
  const result: number[] = []

  // Phase 1: Show original input
  steps.push({
    description: '原始数据：一组大范围的稀疏值',
    phase: 'input',
    originalValues: [...values],
    sortedUnique: [],
    mapping: new Map(mapping),
    compressedResult: [],
    currentOriginalIndex: -1,
    currentSortedIndex: -1,
    highlightedValue: null,
    queryValue: null,
    queryResult: null,
  })

  // Phase 2: Sorting and dedup - show each element being inserted
  const tempSorted: number[] = []
  for (let i = 0; i < sorted.length; i++) {
    tempSorted.push(sorted[i])
    steps.push({
      description: `去重排序: 插入 ${sorted[i]} → 排序后位置 ${i}`,
      phase: 'sort',
      originalValues: [...values],
      sortedUnique: [...tempSorted],
      mapping: new Map(mapping),
      compressedResult: [],
      currentOriginalIndex: -1,
      currentSortedIndex: i,
      highlightedValue: sorted[i],
      queryValue: null,
      queryResult: null,
    })
  }

  // Phase 3: Building mapping
  for (let i = 0; i < sorted.length; i++) {
    mapping.set(sorted[i], i)
    steps.push({
      description: `建立映射: ${sorted[i]} → ${i}`,
      phase: 'map',
      originalValues: [...values],
      sortedUnique: [...sorted],
      mapping: new Map(mapping),
      compressedResult: [],
      currentOriginalIndex: -1,
      currentSortedIndex: i,
      highlightedValue: sorted[i],
      queryValue: null,
      queryResult: null,
    })
  }

  // Phase 4: Compress original sequence
  for (let i = 0; i < values.length; i++) {
    const idx = mapping.get(values[i])!
    result.push(idx)
    steps.push({
      description: `压缩: 原始值 ${values[i]} (位置 ${i}) → 索引 ${idx}`,
      phase: 'result',
      originalValues: [...values],
      sortedUnique: [...sorted],
      mapping: new Map(mapping),
      compressedResult: [...result],
      currentOriginalIndex: i,
      currentSortedIndex: idx,
      highlightedValue: values[i],
      queryValue: null,
      queryResult: null,
    })
  }

  // Phase 5: Query demo
  if (queryVal !== null) {
    const found = mapping.get(queryVal)
    steps.push({
      description: found !== undefined
        ? `查询: 值 ${queryVal} 在压缩后对应索引 ${found}`
        : `查询: 值 ${queryVal} 不在原始数据中`,
      phase: 'query',
      originalValues: [...values],
      sortedUnique: [...sorted],
      mapping: new Map(mapping),
      compressedResult: [...result],
      currentOriginalIndex: -1,
      currentSortedIndex: found ?? -1,
      highlightedValue: queryVal,
      queryValue: queryVal,
      queryResult: found ?? -1,
    })
  }

  return steps
}

export default function CoordinateCompressionVisualization() {
  const [inputText, setInputText] = useState('100, 5000, 300, 100, 5000, 7, 300')
  const [queryText, setQueryText] = useState('300')
  const [steps, setSteps] = useState<CompressStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('坐标压缩可视化 - 点击「开始压缩」查看过程')
  const [phase, setPhase] = useState<CompressStep['phase']>('input')
  const [originalValues, setOriginalValues] = useState<number[]>([])
  const [sortedUnique, setSortedUnique] = useState<number[]>([])
  const [mapping, setMapping] = useState<Map<number, number>>(new Map())
  const [compressedResult, setCompressedResult] = useState<number[]>([])
  const [currentOriginalIndex, setCurrentOriginalIndex] = useState(-1)
  const [currentSortedIndex, setCurrentSortedIndex] = useState(-1)
  const [highlightedValue, setHighlightedValue] = useState<number | null>(null)
  const [queryValue, setQueryValue] = useState<number | null>(null)
  const [queryResult, setQueryResult] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const parseInput = useCallback((): number[] => {
    return inputText
      .split(/[,，\s]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(Number)
      .filter(n => !isNaN(n))
  }, [inputText])

  const applyStep = useCallback((step: CompressStep) => {
    setOriginalValues(step.originalValues)
    setSortedUnique(step.sortedUnique)
    setMapping(step.mapping)
    setCompressedResult(step.compressedResult)
    setCurrentOriginalIndex(step.currentOriginalIndex)
    setCurrentSortedIndex(step.currentSortedIndex)
    setHighlightedValue(step.highlightedValue)
    setQueryValue(step.queryValue)
    setQueryResult(step.queryResult)
    setDescription(step.description)
    setPhase(step.phase)
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      setPhase('done')
      return
    }

    timerRef.current = window.setTimeout(() => {
      applyStep(steps[currentStep])
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed, applyStep])

  const handleStart = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const values = parseInput()
    if (values.length === 0) return
    const queryVal = queryText.trim() ? Number(queryText) : null
    const allSteps = buildCompressSteps(values, isNaN(queryVal!) ? null : queryVal)
    setSteps(allSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setPhase('input')
    setDescription('开始坐标压缩...')
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
    setSteps([])
    setCurrentStep(0)
    setOriginalValues([])
    setSortedUnique([])
    setMapping(new Map())
    setCompressedResult([])
    setCurrentOriginalIndex(-1)
    setCurrentSortedIndex(-1)
    setHighlightedValue(null)
    setQueryValue(null)
    setQueryResult(null)
    setPhase('input')
    setDescription('坐标压缩可视化 - 点击「开始压缩」查看过程')
  }

  const handleStep = () => {
    if (steps.length === 0) {
      const values = parseInput()
      if (values.length === 0) return
      const queryVal = queryText.trim() ? Number(queryText) : null
      const allSteps = buildCompressSteps(values, isNaN(queryVal!) ? null : queryVal)
      setSteps(allSteps)
      setCurrentStep(0)
    }
    if (currentStep < steps.length) {
      applyStep(steps[currentStep])
      setCurrentStep(prev => prev + 1)
    }
  }

  const cellStyle = (
    isActive: boolean,
    isHighlight: boolean,
  ): React.CSSProperties => ({
    padding: '0.4rem 0.6rem',
    background: isActive
      ? '#3b82f6'
      : isHighlight
        ? '#f59e0b'
        : 'var(--bg-card)',
    border: `1px solid ${isActive ? '#60a5fa' : isHighlight ? '#fbbf24' : 'var(--border)'}`,
    borderRadius: 6,
    fontSize: '0.85rem',
    fontFamily: 'Consolas, Monaco, monospace',
    color: 'var(--text-primary)',
    textAlign: 'center' as const,
    transition: 'all 0.2s',
    minWidth: 48,
  })

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          数据:
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="用逗号分隔，如: 100, 5000, 300"
            style={{ width: 260, padding: '0.25rem', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4 }}
            disabled={isPlaying}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          查询值:
          <input
            type="text"
            value={queryText}
            onChange={e => setQueryText(e.target.value)}
            placeholder="如: 300"
            style={{ width: 80, padding: '0.25rem', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 4 }}
            disabled={isPlaying}
          />
        </label>
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始压缩
        </button>
        <button className="btn btn-primary" onClick={handleStep} disabled={isPlaying}>
          单步执行
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
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ padding: '1rem', overflowX: 'auto' }}>
        {/* Original Values */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
            原始数据
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {originalValues.length === 0 ? (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>等待输入...</span>
            ) : (
              originalValues.map((v, i) => (
                <div key={`orig-${i}`} style={cellStyle(currentOriginalIndex === i, highlightedValue === v)}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>idx {i}</div>
                  <div style={{ fontWeight: 'bold' }}>{v}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sorted Unique Values */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
            去重排序后
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {sortedUnique.length === 0 ? (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {phase === 'input' ? '等待开始...' : ''}
              </span>
            ) : (
              sortedUnique.map((v, i) => (
                <div key={`sorted-${i}`} style={cellStyle(currentSortedIndex === i, highlightedValue === v)}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>索引 {i}</div>
                  <div style={{ fontWeight: 'bold' }}>{v}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mapping Arrows */}
        {mapping.size > 0 && phase !== 'input' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
              映射关系
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {sortedUnique.map((v) => {
                const idx = mapping.get(v)
                const isActive = highlightedValue === v
                return (
                  <div
                    key={`map-${v}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.3rem 0.6rem',
                      background: isActive ? '#3b82f622' : 'var(--bg-card)',
                      border: `1px solid ${isActive ? '#60a5fa' : 'var(--border)'}`,
                      borderRadius: 6,
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span style={{ fontWeight: 'bold', color: isActive ? '#60a5fa' : 'var(--text-primary)' }}>{v}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>&rarr;</span>
                    <span style={{ fontWeight: 'bold', color: isActive ? '#60a5fa' : 'var(--text-primary)' }}>{idx}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Compressed Result */}
        {compressedResult.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
              压缩结果
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {compressedResult.map((v, i) => (
                <div key={`res-${i}`} style={cellStyle(currentOriginalIndex === i, false)}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>idx {i}</div>
                  <div style={{ fontWeight: 'bold' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Query Result */}
        {queryValue !== null && queryResult !== null && phase === 'query' && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem 1.5rem',
            background: queryResult >= 0 ? '#22c55e22' : '#ef444422',
            border: `1px solid ${queryResult >= 0 ? '#4ade80' : '#f87171'}`,
            borderRadius: 8,
            fontSize: '1rem',
            color: 'var(--text-primary)',
          }}>
            {queryResult >= 0 ? (
              <span>
                查询值 <strong>{queryValue}</strong> 在压缩后对应索引 <strong>{queryResult}</strong>
                ，即排序后数组的第 {queryResult} 个元素
              </span>
            ) : (
              <span>
                查询值 <strong>{queryValue}</strong> 不在原始数据中，无法映射
              </span>
            )}
          </div>
        )}

        {/* Summary when done */}
        {phase === 'done' && compressedResult.length > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem 1.5rem',
            background: '#22c55e22',
            border: '1px solid #4ade80',
            borderRadius: 8,
            fontSize: '1rem',
            color: 'var(--text-primary)',
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
            压缩完成！原始 {originalValues.length} 个值 (值域跨度 {sortedUnique.length > 0 ? sortedUnique[sortedUnique.length - 1] - sortedUnique[0] : 0})
            被压缩为 {sortedUnique.length} 个连续索引 (0 ~ {sortedUnique.length - 1})
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前步骤
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          高亮值
        </span>
      </div>
    </div>
  )
}
