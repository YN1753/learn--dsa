import { useState, useEffect, useRef, useCallback } from 'react'

interface LRUNode {
  key: number
  value: number
}

interface AnimationStep {
  description: string
  cacheState: LRUNode[]
  hashMap: Record<number, number>
  highlightKey: number | null
  highlightType: 'get' | 'put' | 'evict' | 'update' | 'none'
  evictedKey: number | null
}

const CAPACITY = 4

export default function LRUCacheVisualization() {
  const [cacheState, setCacheState] = useState<LRUNode[]>([])
  const [hashMap, setHashMap] = useState<Record<number, number>>({})
  const [highlightKey, setHighlightKey] = useState<number | null>(null)
  const [highlightType, setHighlightType] = useState<'get' | 'put' | 'evict' | 'update' | 'none'>('none')
  const [evictedKey, setEvictedKey] = useState<number | null>(null)
  const [description, setDescription] = useState<string>('LRU 缓存演示 — 选择一个操作开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [inputKey, setInputKey] = useState('1')
  const [inputValue, setInputValue] = useState('100')
  const timerRef = useRef<number | null>(null)
  const nextValueRef = useRef(1)

  const executeSteps = useCallback((animationSteps: AnimationStep[]) => {
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setEvictedKey(null)
  }, [])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setCacheState([...step.cacheState])
      setHashMap({ ...step.hashMap })
      setHighlightKey(step.highlightKey)
      setHighlightType(step.highlightType)
      setEvictedKey(step.evictedKey)
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePut = () => {
    const key = parseInt(inputKey) || nextValueRef.current
    const value = parseInt(inputValue) || (key * 10)
    const animationSteps: AnimationStep[] = []

    // 检查是否已存在
    const existingIndex = cacheState.findIndex(n => n.key === key)
    let newState = [...cacheState]
    let newMap = { ...hashMap }
    let evicted: number | null = null

    if (existingIndex >= 0) {
      // 更新已有键
      animationSteps.push({
        description: `put(${key}, ${value}): 键 ${key} 已存在，更新值并移到头部`,
        cacheState: [...cacheState],
        hashMap: { ...hashMap },
        highlightKey: key,
        highlightType: 'update',
        evictedKey: null,
      })

      newState.splice(existingIndex, 1)
      newState.unshift({ key, value })
      newMap[key] = value
    } else {
      // 插入新键
      if (newState.length >= CAPACITY) {
        const tail = newState[newState.length - 1]
        evicted = tail.key
        animationSteps.push({
          description: `put(${key}, ${value}): 缓存已满，淘汰最久未使用的键 ${tail.key}`,
          cacheState: [...cacheState],
          hashMap: { ...hashMap },
          highlightKey: tail.key,
          highlightType: 'evict',
          evictedKey: tail.key,
        })
        newState.pop()
        delete newMap[tail.key]
      }

      newState.unshift({ key, value })
      newMap[key] = value

      animationSteps.push({
        description: `put(${key}, ${value}): 将新节点插入链表头部${evicted !== null ? `，淘汰键 ${evicted}` : ''}`,
        cacheState: [...newState],
        hashMap: { ...newMap },
        highlightKey: key,
        highlightType: 'put',
        evictedKey: evicted,
      })
    }

    // 最终状态
    animationSteps.push({
      description: `put(${key}, ${value}) 完成。链表: HEAD <-> ${newState.map(n => `[${n.key}:${n.value}]`).join(' <-> ')} <-> TAIL`,
      cacheState: [...newState],
      hashMap: { ...newMap },
      highlightKey: key,
      highlightType: 'put',
      evictedKey: null,
    })

    executeSteps(animationSteps)
    nextValueRef.current++
    setInputKey(String(nextValueRef.current))
    setInputValue(String(nextValueRef.current * 10))
  }

  const handleGet = () => {
    const key = parseInt(inputKey) || 1
    const animationSteps: AnimationStep[] = []

    const existingIndex = cacheState.findIndex(n => n.key === key)

    if (existingIndex < 0) {
      animationSteps.push({
        description: `get(${key}): 键 ${key} 不存在于缓存中，返回 -1`,
        cacheState: [...cacheState],
        hashMap: { ...hashMap },
        highlightKey: key,
        highlightType: 'evict',
        evictedKey: null,
      })
    } else {
      const node = cacheState[existingIndex]
      animationSteps.push({
        description: `get(${key}): 在哈希表中找到键 ${key}，定位到链表节点`,
        cacheState: [...cacheState],
        hashMap: { ...hashMap },
        highlightKey: key,
        highlightType: 'get',
        evictedKey: null,
      })

      const newState = [...cacheState]
      newState.splice(existingIndex, 1)
      newState.unshift(node)

      animationSteps.push({
        description: `get(${key}): 将节点移到链表头部（标记为最近使用）`,
        cacheState: [...newState],
        hashMap: { ...hashMap },
        highlightKey: key,
        highlightType: 'get',
        evictedKey: null,
      })

      animationSteps.push({
        description: `get(${key}) 返回 ${node.value}。链表: HEAD <-> ${newState.map(n => `[${n.key}:${n.value}]`).join(' <-> ')} <-> TAIL`,
        cacheState: [...newState],
        hashMap: { ...hashMap },
        highlightKey: key,
        highlightType: 'get',
        evictedKey: null,
      })
    }

    executeSteps(animationSteps)
  }

  const handleAutoPut = () => {
    const key = nextValueRef.current
    const value = key * 10
    setInputKey(String(key))
    setInputValue(String(value))
    // 延迟执行以确保 state 更新
    setTimeout(() => {
      const animationSteps: AnimationStep[] = []
      let newState = [...cacheState]
      let newMap = { ...hashMap }
      let evicted: number | null = null

      if (newState.length >= CAPACITY) {
        const tail = newState[newState.length - 1]
        evicted = tail.key
        animationSteps.push({
          description: `put(${key}, ${value}): 缓存已满，淘汰最久未使用的键 ${tail.key}`,
          cacheState: [...cacheState],
          hashMap: { ...hashMap },
          highlightKey: tail.key,
          highlightType: 'evict',
          evictedKey: tail.key,
        })
        newState.pop()
        delete newMap[tail.key]
      }

      newState.unshift({ key, value })
      newMap[key] = value

      animationSteps.push({
        description: `put(${key}, ${value}): 将新节点插入链表头部${evicted !== null ? `，淘汰键 ${evicted}` : ''}`,
        cacheState: [...newState],
        hashMap: { ...newMap },
        highlightKey: key,
        highlightType: 'put',
        evictedKey: evicted,
      })

      animationSteps.push({
        description: `put(${key}, ${value}) 完成。链表: HEAD <-> ${newState.map(n => `[${n.key}:${n.value}]`).join(' <-> ')} <-> TAIL`,
        cacheState: [...newState],
        hashMap: { ...newMap },
        highlightKey: key,
        highlightType: 'put',
        evictedKey: null,
      })

      executeSteps(animationSteps)
      nextValueRef.current++
      setInputKey(String(nextValueRef.current))
      setInputValue(String(nextValueRef.current * 10))
    }, 10)
  }

  const handleAutoGet = () => {
    if (cacheState.length === 0) {
      setDescription('缓存为空，无法执行 get 操作')
      return
    }
    const randomIndex = Math.floor(Math.random() * cacheState.length)
    const key = cacheState[randomIndex].key
    setInputKey(String(key))
    setTimeout(() => handleGet(), 10)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCacheState([])
    setHashMap({})
    setHighlightKey(null)
    setHighlightType('none')
    setEvictedKey(null)
    setDescription('缓存已重置')
    setSteps([])
    setCurrentStep(0)
    nextValueRef.current = 1
    setInputKey('1')
    setInputValue('10')
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const getHighlightColor = (key: number): string => {
    if (key === evictedKey) return '#ef4444'
    if (key !== highlightKey) return 'var(--bg-card)'
    switch (highlightType) {
      case 'get': return '#3b82f6'
      case 'put': return '#22c55e'
      case 'evict': return '#ef4444'
      case 'update': return '#f59e0b'
      default: return 'var(--bg-card)'
    }
  }

  const getHighlightBorder = (key: number): string => {
    if (key === evictedKey) return '#f87171'
    if (key !== highlightKey) return 'var(--border)'
    switch (highlightType) {
      case 'get': return '#60a5fa'
      case 'put': return '#4ade80'
      case 'evict': return '#f87171'
      case 'update': return '#fbbf24'
      default: return 'var(--border)'
    }
  }

  const nodeWidth = 100
  const nodeHeight = 60
  const gap = 40
  const startX = 80
  const startY = 80

  const svgWidth = Math.max(startX + Math.max(cacheState.length, 1) * (nodeWidth + gap) + 120, 500)
  const svgHeight = startY + nodeHeight + 80

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleAutoPut} disabled={isPlaying}>
          自动 Put
        </button>
        <button className="btn btn-primary" onClick={handleAutoGet} disabled={isPlaying || cacheState.length === 0}>
          自动 Get
        </button>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Key:
          <input
            type="number"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            style={{ width: '50px', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            disabled={isPlaying}
          />
          Value:
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: '50px', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            disabled={isPlaying}
          />
        </span>
        <button className="btn btn-secondary" onClick={handlePut} disabled={isPlaying}>
          Put
        </button>
        <button className="btn btn-secondary" onClick={handleGet} disabled={isPlaying || cacheState.length === 0}>
          Get
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
          <input
            type="range"
            min="300"
            max="2500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      {/* 链表可视化 */}
      <div className="viz-canvas" style={{ overflowX: 'auto' }}>
        <svg width={svgWidth} height={svgHeight}>
          <defs>
            <marker id="lru-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--text-secondary)" />
            </marker>
          </defs>

          {/* HEAD 哨兵 */}
          <rect
            x={10}
            y={startY + 5}
            width={50}
            height={nodeHeight - 10}
            rx={4}
            fill="var(--bg-card)"
            stroke="var(--border)"
            strokeWidth={1.5}
          />
          <text
            x={35}
            y={startY + nodeHeight / 2 + 2}
            fill="var(--text-secondary)"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Consolas, Monaco, monospace"
          >
            HEAD
          </text>

          {/* HEAD -> 第一个节点的箭头 */}
          {cacheState.length > 0 && (
            <line
              x1={60}
              y1={startY + nodeHeight / 2}
              x2={startX - 5}
              y2={startY + nodeHeight / 2}
              stroke="var(--text-secondary)"
              strokeWidth={1.5}
              markerEnd="url(#lru-arrow)"
            />
          )}

          {/* 节点 */}
          {cacheState.map((node, index) => {
            const x = startX + index * (nodeWidth + gap)
            const y = startY
            const isHighlighted = node.key === highlightKey || node.key === evictedKey
            return (
              <g key={`node-${node.key}-${index}`}>
                {/* 连接箭头 */}
                {index < cacheState.length - 1 && (
                  <>
                    <line
                      x1={x + nodeWidth}
                      y1={y + nodeHeight / 2}
                      x2={x + nodeWidth + gap - 5}
                      y2={y + nodeHeight / 2}
                      stroke="var(--text-secondary)"
                      strokeWidth={1.5}
                      markerEnd="url(#lru-arrow)"
                    />
                    {/* 反向箭头（双向链表） */}
                    <line
                      x1={x + nodeWidth + gap - 5}
                      y1={y + nodeHeight / 2 + 8}
                      x2={x + nodeWidth + 5}
                      y2={y + nodeHeight / 2 + 8}
                      stroke="var(--text-secondary)"
                      strokeWidth={1}
                      opacity={0.4}
                      markerEnd="url(#lru-arrow)"
                    />
                  </>
                )}

                {/* 节点矩形 */}
                <rect
                  x={x}
                  y={y}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx={6}
                  fill={getHighlightColor(node.key)}
                  stroke={getHighlightBorder(node.key)}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  opacity={node.key === evictedKey ? 0.5 : 1}
                />

                {/* key */}
                <text
                  x={x + nodeWidth / 2}
                  y={y + 22}
                  fill="var(--text-primary)"
                  fontSize="13"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  key: {node.key}
                </text>

                {/* value */}
                <text
                  x={x + nodeWidth / 2}
                  y={y + 42}
                  fill="var(--text-secondary)"
                  fontSize="12"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  val: {node.value}
                </text>

                {/* 位置标注 */}
                <text
                  x={x + nodeWidth / 2}
                  y={y - 8}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="Consolas, Monaco, monospace"
                >
                  {index === 0 ? '最近使用' : index === cacheState.length - 1 ? '最久未使用' : ''}
                </text>
              </g>
            )
          })}

          {/* TAIL 哨兵 */}
          <rect
            x={startX + cacheState.length * (nodeWidth + gap) + (cacheState.length > 0 ? 0 : 0)}
            y={startY + 5}
            width={50}
            height={nodeHeight - 10}
            rx={4}
            fill="var(--bg-card)"
            stroke="var(--border)"
            strokeWidth={1.5}
          />
          <text
            x={startX + cacheState.length * (nodeWidth + gap) + 25 + (cacheState.length > 0 ? 0 : 0)}
            y={startY + nodeHeight / 2 + 2}
            fill="var(--text-secondary)"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="Consolas, Monaco, monospace"
          >
            TAIL
          </text>

          {/* TAIL 连接 */}
          {cacheState.length > 0 && (
            <line
              x1={startX + (cacheState.length - 1) * (nodeWidth + gap) + nodeWidth}
              y1={startY + nodeHeight / 2}
              x2={startX + cacheState.length * (nodeWidth + gap) - 5}
              y2={startY + nodeHeight / 2}
              stroke="var(--text-secondary)"
              strokeWidth={1.5}
              markerEnd="url(#lru-arrow)"
            />
          )}

          {/* 标题 */}
          <text
            x={svgWidth / 2}
            y={25}
            fill="var(--text-primary)"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
          >
            双向链表（头部 = 最近使用，尾部 = 最久未使用）
          </text>

          {/* 容量信息 */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 15}
            fill="var(--text-secondary)"
            fontSize="12"
            textAnchor="middle"
            fontFamily="Consolas, Monaco, monospace"
          >
            容量: {CAPACITY} | 当前: {cacheState.length}/{CAPACITY}
          </text>
        </svg>
      </div>

      {/* 哈希表面板 */}
      <div className="viz-canvas" style={{ padding: '1rem', marginTop: '0.5rem' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
          哈希表（HashMap）— key 到链表节点的映射
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {Object.entries(hashMap).length === 0 ? (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>(空)</span>
          ) : (
            Object.entries(hashMap).map(([key, value]) => (
              <span
                key={key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: `1.5px solid ${Number(key) === highlightKey ? getHighlightBorder(Number(key)) : 'var(--border)'}`,
                  background: Number(key) === highlightKey ? getHighlightColor(Number(key)) : 'var(--bg-card)',
                  fontSize: '0.85rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  color: 'var(--text-primary)',
                  opacity: Number(key) === evictedKey ? 0.4 : 1,
                  textDecoration: Number(key) === evictedKey ? 'line-through' : 'none',
                }}
              >
                {key} → {value}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          新插入
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          Get 访问
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          更新
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          淘汰
        </span>
      </div>

      <div className="viz-info" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
        <strong>LRU 缓存原理：</strong>
        使用哈希表实现 O(1) 查找，双向链表维护访问顺序。
        链表头部为最近使用的元素，尾部为最久未使用的元素。
        缓存满时淘汰尾部元素。get 和 put 操作均为 O(1)。
      </div>
    </div>
  )
}
