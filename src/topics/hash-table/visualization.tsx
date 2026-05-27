import { useState, useEffect, useRef, useCallback } from 'react'

interface ChainNode {
  key: string
  value: number
}

type Bucket = ChainNode[]

interface AnimationStep {
  description: string
  buckets: Bucket[]
  highlightBucket: number | null
  highlightChainIndex: number | null
  highlightType: 'hash' | 'insert' | 'search' | 'found' | 'notFound' | 'collision' | 'none'
  inputValue?: string
  inputHash?: number
}

type CollisionMode = 'chaining' | 'openAddressing'

const INITIAL_CAPACITY = 7

function simpleHash(key: string, capacity: number): number {
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h += key.charCodeAt(i)
  }
  return h % capacity
}

const SAMPLE_KEYS = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon']

export default function HashTableVisualization() {
  const [capacity] = useState(INITIAL_CAPACITY)
  const [buckets, setBuckets] = useState<Bucket[]>(() =>
    Array.from({ length: INITIAL_CAPACITY }, () => [])
  )
  const [mode, setMode] = useState<CollisionMode>('chaining')
  const [highlightBucket, setHighlightBucket] = useState<number | null>(null)
  const [highlightChainIndex, setHighlightChainIndex] = useState<number | null>(null)
  const [highlightType, setHighlightType] = useState<'hash' | 'insert' | 'search' | 'found' | 'notFound' | 'collision' | 'none'>('none')
  const [description, setDescription] = useState<string>('哈希表可视化 - 选择一个操作开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const timerRef = useRef<number | null>(null)
  const usedKeysRef = useRef<Set<string>>(new Set(['apple', 'banana', 'cherry']))

  // Initialize with some data
  useEffect(() => {
    const initialBuckets: Bucket[] = Array.from({ length: INITIAL_CAPACITY }, () => [])
    const initialKeys = ['apple', 'banana', 'cherry']
    for (const key of initialKeys) {
      const h = simpleHash(key, INITIAL_CAPACITY)
      initialBuckets[h].push({ key, value: Math.floor(Math.random() * 90) + 10 })
    }
    setBuckets(initialBuckets)
    usedKeysRef.current = new Set(initialKeys)
  }, [])

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
      setBuckets(step.buckets)
      setHighlightBucket(step.highlightBucket)
      setHighlightChainIndex(step.highlightChainIndex)
      setHighlightType(step.highlightType)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const getNextKey = (): string => {
    for (const key of SAMPLE_KEYS) {
      if (!usedKeysRef.current.has(key)) return key
    }
    // Fallback: generate random 3-letter key
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    let key: string
    do {
      key = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * 26)]).join('')
    } while (usedKeysRef.current.has(key))
    return key
  }

  const cloneBuckets = (b: Bucket[]): Bucket[] => b.map(bucket => bucket.map(entry => ({ ...entry })))

  const handleInsert = () => {
    const key = inputValue.trim() || getNextKey()
    setInputValue('')
    const value = Math.floor(Math.random() * 900) + 100
    const h = simpleHash(key, capacity)
    const animationSteps: AnimationStep[] = []

    // Step 1: Show hash computation
    animationSteps.push({
      description: `计算 hash("${key}") = ${Array.from(key).map(c => c.charCodeAt(0)).join('+')} mod ${capacity} = ${h}`,
      buckets: cloneBuckets(buckets),
      highlightBucket: null,
      highlightChainIndex: null,
      highlightType: 'hash',
      inputValue: key,
      inputHash: h,
    })

    // Step 2: Highlight target bucket
    const hasCollision = buckets[h].length > 0
    animationSteps.push({
      description: hasCollision
        ? `定位到桶[${h}]，发现已有 ${buckets[h].length} 个元素，发生冲突！`
        : `定位到桶[${h}]，该桶为空`,
      buckets: cloneBuckets(buckets),
      highlightBucket: h,
      highlightChainIndex: null,
      highlightType: hasCollision ? 'collision' : 'insert',
      inputValue: key,
      inputHash: h,
    })

    // Step 3: Insert (for chaining, add to chain)
    const newBuckets = cloneBuckets(buckets)
    newBuckets[h].push({ key, value })
    usedKeysRef.current.add(key)

    if (mode === 'chaining') {
      animationSteps.push({
        description: `将 [${key}:${value}] 添加到桶[${h}] 的链表末尾`,
        buckets: newBuckets,
        highlightBucket: h,
        highlightChainIndex: newBuckets[h].length - 1,
        highlightType: 'insert',
      })
    } else {
      // Open addressing: linear probe
      animationSteps.push({
        description: `将 [${key}:${value}] 放入桶[${h}]（当前使用链地址法模拟）`,
        buckets: newBuckets,
        highlightBucket: h,
        highlightChainIndex: newBuckets[h].length - 1,
        highlightType: 'insert',
      })
    }

    animationSteps.push({
      description: `插入完成! 当前负载因子: ${countAllEntries(newBuckets)}/${capacity} = ${(countAllEntries(newBuckets) / capacity).toFixed(2)}`,
      buckets: newBuckets,
      highlightBucket: h,
      highlightChainIndex: newBuckets[h].length - 1,
      highlightType: 'found',
    })

    executeSteps(animationSteps)
  }

  const handleSearch = () => {
    const allEntries: string[] = []
    for (const bucket of buckets) {
      for (const entry of bucket) {
        allEntries.push(entry.key)
      }
    }
    if (allEntries.length === 0) {
      setDescription('哈希表为空，请先插入数据')
      return
    }

    const key = inputValue.trim() || allEntries[Math.floor(Math.random() * allEntries.length)]
    setInputValue('')
    const h = simpleHash(key, capacity)
    const animationSteps: AnimationStep[] = []

    // Step 1: Compute hash
    animationSteps.push({
      description: `计算 hash("${key}") = ${Array.from(key).map(c => c.charCodeAt(0)).join('+')} mod ${capacity} = ${h}`,
      buckets: cloneBuckets(buckets),
      highlightBucket: null,
      highlightChainIndex: null,
      highlightType: 'hash',
    })

    // Step 2: Go to bucket
    animationSteps.push({
      description: `定位到桶[${h}]，开始在链表中查找...`,
      buckets: cloneBuckets(buckets),
      highlightBucket: h,
      highlightChainIndex: null,
      highlightType: 'search',
    })

    // Step 3: Search through chain
    const chain = buckets[h]
    let found = false
    for (let i = 0; i < chain.length; i++) {
      const isMatch = chain[i].key === key
      if (isMatch) found = true
      animationSteps.push({
        description: isMatch
          ? `比较 [${chain[i].key}:${chain[i].value}] 与 "${key}" -- 匹配! 查找成功`
          : `比较 [${chain[i].key}:${chain[i].value}] 与 "${key}" -- 不匹配，继续...`,
        buckets: cloneBuckets(buckets),
        highlightBucket: h,
        highlightChainIndex: i,
        highlightType: isMatch ? 'found' : 'search',
      })
      if (isMatch) break
    }

    if (!found) {
      animationSteps.push({
        description: `遍历完桶[${h}]的链表，未找到 "${key}"，查找失败`,
        buckets: cloneBuckets(buckets),
        highlightBucket: h,
        highlightChainIndex: null,
        highlightType: 'notFound',
      })
    }

    executeSteps(animationSteps)
  }

  const handleDelete = () => {
    const allEntries: string[] = []
    for (const bucket of buckets) {
      for (const entry of bucket) {
        allEntries.push(entry.key)
      }
    }
    if (allEntries.length === 0) {
      setDescription('哈希表为空，无法删除')
      return
    }

    const key = inputValue.trim() || allEntries[Math.floor(Math.random() * allEntries.length)]
    setInputValue('')
    const h = simpleHash(key, capacity)
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `计算 hash("${key}") = ${h}，定位到桶[${h}]`,
      buckets: cloneBuckets(buckets),
      highlightBucket: h,
      highlightChainIndex: null,
      highlightType: 'search',
    })

    const chain = buckets[h]
    const idx = chain.findIndex(e => e.key === key)

    if (idx === -1) {
      animationSteps.push({
        description: `在桶[${h}]中未找到 "${key}"，删除失败`,
        buckets: cloneBuckets(buckets),
        highlightBucket: h,
        highlightChainIndex: null,
        highlightType: 'notFound',
      })
    } else {
      animationSteps.push({
        description: `找到 "${key}" 在桶[${h}]的链表位置 ${idx}`,
        buckets: cloneBuckets(buckets),
        highlightBucket: h,
        highlightChainIndex: idx,
        highlightType: 'found',
      })

      const newBuckets = cloneBuckets(buckets)
      newBuckets[h] = newBuckets[h].filter(e => e.key !== key)
      usedKeysRef.current.delete(key)

      animationSteps.push({
        description: `删除 "${key}" 完成`,
        buckets: newBuckets,
        highlightBucket: h,
        highlightChainIndex: null,
        highlightType: 'insert',
      })
    }

    executeSteps(animationSteps)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const initialBuckets: Bucket[] = Array.from({ length: INITIAL_CAPACITY }, () => [])
    const initialKeys = ['apple', 'banana', 'cherry']
    for (const key of initialKeys) {
      const h = simpleHash(key, INITIAL_CAPACITY)
      initialBuckets[h].push({ key, value: Math.floor(Math.random() * 90) + 10 })
    }
    setBuckets(initialBuckets)
    usedKeysRef.current = new Set(initialKeys)
    setHighlightBucket(null)
    setHighlightChainIndex(null)
    setHighlightType('none')
    setDescription('哈希表已重置')
    setSteps([])
    setCurrentStep(0)
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const countAllEntries = (b: Bucket[]): number =>
    b.reduce((sum, bucket) => sum + bucket.length, 0)

  const toggleMode = () => {
    setMode(prev => prev === 'chaining' ? 'openAddressing' : 'chaining')
    setDescription(mode === 'chaining' ? '已切换到开放寻址模式（可视化仍使用链地址展示）' : '已切换到链地址模式')
  }

  const getBucketColor = (index: number): string => {
    if (index !== highlightBucket) return 'var(--bg-card)'
    switch (highlightType) {
      case 'hash': return '#8b5cf6'
      case 'search': return '#3b82f6'
      case 'insert': return '#22c55e'
      case 'collision': return '#f59e0b'
      case 'found': return '#22c55e'
      case 'notFound': return '#ef4444'
      default: return 'var(--bg-card)'
    }
  }

  const getBucketBorder = (index: number): string => {
    if (index !== highlightBucket) return 'var(--border)'
    switch (highlightType) {
      case 'hash': return '#a78bfa'
      case 'search': return '#60a5fa'
      case 'insert': return '#4ade80'
      case 'collision': return '#fbbf24'
      case 'found': return '#4ade80'
      case 'notFound': return '#f87171'
      default: return 'var(--border)'
    }
  }

  const getChainNodeColor = (bucketIdx: number, chainIdx: number): string => {
    if (bucketIdx === highlightBucket && chainIdx === highlightChainIndex) {
      switch (highlightType) {
        case 'search': return '#3b82f6'
        case 'found': return '#22c55e'
        case 'notFound': return '#ef4444'
        default: return 'var(--bg-card)'
      }
    }
    return 'var(--bg-card)'
  }

  const bucketWidth = 80
  const bucketHeight = 50
  const chainNodeWidth = 100
  const chainNodeHeight = 40
  const gapX = 30
  const gapY = 20
  const startX = 50
  const startY = 40

  // Calculate SVG dimensions
  let maxChainLen = 0
  for (const bucket of buckets) {
    maxChainLen = Math.max(maxChainLen, bucket.length)
  }
  const svgWidth = Math.max(startX + capacity * (bucketWidth + gapX) + 60, 700)
  const svgHeight = startY + bucketHeight + gapY + (maxChainLen > 0 ? maxChainLen * (chainNodeHeight + 8) + 40 : 80)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleInsert} disabled={isPlaying}>
          插入元素
        </button>
        <button className="btn btn-primary" onClick={handleSearch} disabled={isPlaying}>
          查找元素
        </button>
        <button className="btn btn-primary" onClick={handleDelete} disabled={isPlaying}>
          删除元素
        </button>
        <button className="btn btn-secondary" onClick={toggleMode} disabled={isPlaying}>
          {mode === 'chaining' ? '切换: 开放寻址' : '切换: 链地址法'}
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
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          键名:
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="留空则自动生成"
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '120px',
            }}
          />
        </label>
      </div>

      <div className="viz-canvas" style={{ overflow: 'auto' }}>
        <svg width={svgWidth} height={svgHeight} style={{ display: 'block' }}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
          </defs>

          {/* Bucket array label */}
          <text x={startX} y={startY - 10} fill="var(--text-secondary)" fontSize="13" fontWeight="bold">
            桶数组 ({mode === 'chaining' ? '链地址法' : '开放寻址'})
          </text>

          {/* Draw buckets */}
          {buckets.map((bucket, i) => {
            const x = startX + i * (bucketWidth + gapX)
            const y = startY

            return (
              <g key={`bucket-${i}`}>
                {/* Bucket index label */}
                <text
                  x={x + bucketWidth / 2}
                  y={y + bucketHeight + 16}
                  fill="var(--text-secondary)"
                  fontSize="12"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  [{i}]
                </text>

                {/* Bucket box */}
                <rect
                  x={x}
                  y={y}
                  width={bucketWidth}
                  height={bucketHeight}
                  rx="6"
                  fill={getBucketColor(i)}
                  stroke={getBucketBorder(i)}
                  strokeWidth={i === highlightBucket ? 3 : 1.5}
                />

                {/* Bucket content */}
                <text
                  x={x + bucketWidth / 2}
                  y={y + bucketHeight / 2 + 5}
                  fill="var(--text-primary)"
                  fontSize="13"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {bucket.length === 0 ? 'null' : `${bucket.length} 项`}
                </text>

                {/* Chain nodes below bucket */}
                {bucket.map((entry, j) => {
                  const nodeX = x + (bucketWidth - chainNodeWidth) / 2
                  const nodeY = y + bucketHeight + gapY + j * (chainNodeHeight + 8)
                  const isHighlighted = i === highlightBucket && j === highlightChainIndex

                  return (
                    <g key={`chain-${i}-${j}`}>
                      {/* Arrow from bucket to first chain node */}
                      {j === 0 && (
                        <line
                          x1={x + bucketWidth / 2}
                          y1={y + bucketHeight}
                          x2={x + bucketWidth / 2}
                          y2={nodeY}
                          stroke="var(--text-secondary)"
                          strokeWidth="1.5"
                          markerEnd="url(#arrow)"
                        />
                      )}

                      {/* Arrow between chain nodes */}
                      {j > 0 && (
                        <line
                          x1={x + bucketWidth / 2}
                          y1={nodeY - 8}
                          x2={x + bucketWidth / 2}
                          y2={nodeY}
                          stroke="var(--text-secondary)"
                          strokeWidth="1.5"
                          markerEnd="url(#arrow)"
                        />
                      )}

                      {/* Chain node */}
                      <rect
                        x={nodeX}
                        y={nodeY}
                        width={chainNodeWidth}
                        height={chainNodeHeight}
                        rx="4"
                        fill={getChainNodeColor(i, j)}
                        stroke={isHighlighted ? '#fbbf24' : 'var(--border)'}
                        strokeWidth={isHighlighted ? 2.5 : 1}
                      />

                      <text
                        x={nodeX + chainNodeWidth / 2}
                        y={nodeY + chainNodeHeight / 2 + 5}
                        fill="var(--text-primary)"
                        fontSize="12"
                        textAnchor="middle"
                        fontFamily="Consolas, Monaco, monospace"
                      >
                        {entry.key}:{entry.value}
                      </text>
                    </g>
                  )
                })}

                {/* null at end of chain */}
                {bucket.length > 0 && (
                  <text
                    x={x + bucketWidth / 2}
                    y={y + bucketHeight + gapY + bucket.length * (chainNodeHeight + 8) + 10}
                    fill="var(--text-secondary)"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    null
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>当前模式：</strong>
        <span style={{ marginLeft: '0.5rem', color: 'var(--accent)' }}>
          {mode === 'chaining' ? '链地址法 (Chaining)' : '开放寻址 (Open Addressing)'}
        </span>
        <span style={{ marginLeft: '1.5rem' }}>
          <strong>负载因子：</strong>
          <span style={{ color: 'var(--accent)' }}>
            {(countAllEntries(buckets) / capacity).toFixed(2)}
          </span>
        </span>
        <span style={{ marginLeft: '1.5rem' }}>
          <strong>元素数：</strong>
          <span style={{ color: 'var(--accent)' }}>
            {countAllEntries(buckets)} / {capacity}
          </span>
        </span>
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          计算哈希
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          搜索中
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          插入/找到
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          冲突
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          未找到
        </span>
      </div>
    </div>
  )
}
