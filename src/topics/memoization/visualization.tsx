import { useState, useEffect, useRef, useCallback } from 'react'

// --- Types ---

interface TreeNode {
  id: string
  label: string
  value?: number
  x: number
  y: number
  state: 'pending' | 'computing' | 'cached-hit' | 'done'
  children: string[]
  parent?: string
  isMemoized: boolean
}

interface CacheEntry {
  key: string
  value: number
  hitCount: number
}

interface Step {
  nodes: Map<string, TreeNode>
  cache: Map<string, CacheEntry>
  description: string
  activeNodeId: string | null
  totalCalls: number
  cacheHits: number
}

type DemoMode = 'fibonacci' | 'grid-paths' | 'coin-change'

// --- Helpers ---

function cloneNodes(source: Map<string, TreeNode>): Map<string, TreeNode> {
  const cloned = new Map<string, TreeNode>()
  for (const [key, val] of source) {
    cloned.set(key, { ...val, children: [...val.children] })
  }
  return cloned
}

function cloneCache(source: Map<string, CacheEntry>): Map<string, CacheEntry> {
  const cloned = new Map<string, CacheEntry>()
  for (const [key, val] of source) {
    cloned.set(key, { ...val })
  }
  return cloned
}

// --- Component ---

export default function MemoizationVisualization() {
  const [mode, setMode] = useState<DemoMode>('fibonacci')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [nodes, setNodes] = useState<Map<string, TreeNode>>(new Map())
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map())
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)
  const [totalCalls, setTotalCalls] = useState(0)
  const [cacheHits, setCacheHits] = useState(0)
  const timerRef = useRef<number | null>(null)

  // Params
  const [fibN, setFibN] = useState(6)
  const [gridSize, setGridSize] = useState(4)
  const [coinAmount, setCoinAmount] = useState(11)

  // --- Generate Fibonacci Steps ---
  const generateFibSteps = useCallback((n: number) => {
    const resultSteps: Step[] = []
    const allNodes = new Map<string, TreeNode>()
    const memo = new Map<number, number>()
    const cacheMap = new Map<string, CacheEntry>()
    let nodeIdCounter = 0
    let calls = 0
    let hits = 0

    function createNode(nVal: number, parent?: string, side?: 'left' | 'right'): string {
      const id = `node-${nodeIdCounter++}`
      const parentNode = parent ? allNodes.get(parent) : undefined
      let x: number, y: number
      if (!parentNode) {
        x = 400; y = 30
      } else {
        const offset = Math.max(35, 180 / (nVal + 1))
        x = parentNode.x + (side === 'left' ? -offset : offset)
        y = parentNode.y + 60
      }
      const node: TreeNode = {
        id, label: `fib(${nVal})`, x, y,
        state: 'pending', children: [], parent, isMemoized: false,
      }
      allNodes.set(id, node)
      if (parent) {
        const p = allNodes.get(parent)
        if (p) p.children.push(id)
      }
      return id
    }

    function trace(nVal: number, parentId?: string, side?: 'left' | 'right'): number {
      const nodeId = createNode(nVal, parentId, side)
      calls++

      // Check cache
      if (memo.has(nVal)) {
        hits++
        const cached = memo.get(nVal)!
        const node = allNodes.get(nodeId)!
        node.state = 'cached-hit'
        node.isMemoized = true
        node.value = cached
        const entry = cacheMap.get(`fib(${nVal})`)!
        entry.hitCount++
        resultSteps.push({
          nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
          description: `缓存命中: fib(${nVal}) = ${cached}`,
          activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
        })
        return cached
      }

      // Compute
      allNodes.get(nodeId)!.state = 'computing'
      resultSteps.push({
        nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
        description: `开始计算 fib(${nVal})`,
        activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
      })

      if (nVal <= 1) {
        const node = allNodes.get(nodeId)!
        node.state = 'done'
        node.value = nVal
        memo.set(nVal, nVal)
        cacheMap.set(`fib(${nVal})`, { key: `fib(${nVal})`, value: nVal, hitCount: 0 })
        resultSteps.push({
          nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
          description: `基本情况: fib(${nVal}) = ${nVal}, 存入缓存`,
          activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
        })
        return nVal
      }

      const left = trace(nVal - 1, nodeId, 'left')
      const right = trace(nVal - 2, nodeId, 'right')
      const result = left + right

      const node = allNodes.get(nodeId)!
      node.state = 'done'
      node.value = result
      memo.set(nVal, result)
      cacheMap.set(`fib(${nVal})`, { key: `fib(${nVal})`, value: result, hitCount: 0 })
      resultSteps.push({
        nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
        description: `fib(${nVal}) = fib(${nVal - 1}) + fib(${nVal - 2}) = ${left} + ${right} = ${result}, 存入缓存`,
        activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
      })
      return result
    }

    trace(n)
    return resultSteps
  }, [])

  // --- Generate Grid Paths Steps ---
  const generateGridSteps = useCallback((size: number) => {
    const resultSteps: Step[] = []
    const allNodes = new Map<string, TreeNode>()
    const memo = new Map<string, number>()
    const cacheMap = new Map<string, CacheEntry>()
    let nodeIdCounter = 0
    let calls = 0
    let hits = 0

    function createNode(m: number, n: number, parent?: string, side?: 'left' | 'right'): string {
      const id = `node-${nodeIdCounter++}`
      const parentNode = parent ? allNodes.get(parent) : undefined
      let x: number, y: number
      if (!parentNode) {
        x = 400; y = 30
      } else {
        const offset = Math.max(30, 160 / (m + n))
        x = parentNode.x + (side === 'left' ? -offset : offset)
        y = parentNode.y + 58
      }
      const node: TreeNode = {
        id, label: `(${m},${n})`, x, y,
        state: 'pending', children: [], parent, isMemoized: false,
      }
      allNodes.set(id, node)
      if (parent) {
        const p = allNodes.get(parent)
        if (p) p.children.push(id)
      }
      return id
    }

    function trace(m: number, n: number, parentId?: string, side?: 'left' | 'right'): number {
      const nodeId = createNode(m, n, parentId, side)
      calls++
      const key = `${m},${n}`

      if (memo.has(key)) {
        hits++
        const cached = memo.get(key)!
        const node = allNodes.get(nodeId)!
        node.state = 'cached-hit'
        node.isMemoized = true
        node.value = cached
        const entry = cacheMap.get(key)!
        entry.hitCount++
        resultSteps.push({
          nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
          description: `缓存命中: (${m},${n}) = ${cached}`,
          activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
        })
        return cached
      }

      allNodes.get(nodeId)!.state = 'computing'
      resultSteps.push({
        nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
        description: `计算 (${m},${n})`,
        activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
      })

      if (m === 1 || n === 1) {
        const node = allNodes.get(nodeId)!
        node.state = 'done'
        node.value = 1
        memo.set(key, 1)
        cacheMap.set(key, { key, value: 1, hitCount: 0 })
        resultSteps.push({
          nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
          description: `基本情况: (${m},${n}) = 1, 存入缓存`,
          activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
        })
        return 1
      }

      const left = trace(m - 1, n, nodeId, 'left')
      const right = trace(m, n - 1, nodeId, 'right')
      const result = left + right

      const node = allNodes.get(nodeId)!
      node.state = 'done'
      node.value = result
      memo.set(key, result)
      cacheMap.set(key, { key, value: result, hitCount: 0 })
      resultSteps.push({
        nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
        description: `(${m},${n}) = (${m - 1},${n}) + (${m},${n - 1}) = ${left} + ${right} = ${result}, 存入缓存`,
        activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
      })
      return result
    }

    trace(size, size)
    return resultSteps
  }, [])

  // --- Generate Coin Change Steps ---
  const generateCoinSteps = useCallback((amount: number) => {
    const resultSteps: Step[] = []
    const allNodes = new Map<string, TreeNode>()
    const memo = new Map<number, number>()
    const cacheMap = new Map<string, CacheEntry>()
    const coins = [1, 3, 4]
    let nodeIdCounter = 0
    let calls = 0
    let hits = 0

    function createNode(amt: number, parent?: string, side?: 'left' | 'right'): string {
      const id = `node-${nodeIdCounter++}`
      const parentNode = parent ? allNodes.get(parent) : undefined
      let x: number, y: number
      if (!parentNode) {
        x = 400; y = 30
      } else {
        const offset = Math.max(30, 140 / (amt + 1))
        x = parentNode.x + (side === 'left' ? -offset * 1.5 : side === 'right' ? offset * 1.5 : 0)
        y = parentNode.y + 58
      }
      const node: TreeNode = {
        id, label: `amt(${amt})`, x, y,
        state: 'pending', children: [], parent, isMemoized: false,
      }
      allNodes.set(id, node)
      if (parent) {
        const p = allNodes.get(parent)
        if (p) p.children.push(id)
      }
      return id
    }

    function trace(amt: number, parentId?: string, side?: 'left' | 'right'): number {
      const nodeId = createNode(amt, parentId, side)
      calls++

      if (amt === 0) {
        const node = allNodes.get(nodeId)!
        node.state = 'done'
        node.value = 0
        memo.set(0, 0)
        cacheMap.set('amt(0)', { key: 'amt(0)', value: 0, hitCount: 0 })
        resultSteps.push({
          nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
          description: `基本情况: amt(0) = 0`,
          activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
        })
        return 0
      }

      if (amt < 0) {
        allNodes.get(nodeId)!.state = 'done'
        allNodes.get(nodeId)!.value = -1
        resultSteps.push({
          nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
          description: `无效: amt(${amt}) < 0, 返回 -1`,
          activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
        })
        return -1
      }

      if (memo.has(amt)) {
        hits++
        const cached = memo.get(amt)!
        const node = allNodes.get(nodeId)!
        node.state = 'cached-hit'
        node.isMemoized = true
        node.value = cached
        const entry = cacheMap.get(`amt(${amt})`)!
        entry.hitCount++
        resultSteps.push({
          nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
          description: `缓存命中: amt(${amt}) = ${cached}`,
          activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
        })
        return cached
      }

      allNodes.get(nodeId)!.state = 'computing'
      resultSteps.push({
        nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
        description: `计算 amt(${amt}), 尝试硬币 [${coins.join(',')}]`,
        activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
      })

      let minCoins = Infinity
      for (let i = 0; i < coins.length; i++) {
        const sub = trace(amt - coins[i], nodeId, i === 0 ? 'left' : i === 1 ? undefined : 'right')
        if (sub >= 0) minCoins = Math.min(minCoins, sub + 1)
      }

      const result = minCoins === Infinity ? -1 : minCoins
      const node = allNodes.get(nodeId)!
      node.state = 'done'
      node.value = result
      memo.set(amt, result)
      cacheMap.set(`amt(${amt})`, { key: `amt(${amt})`, value: result, hitCount: 0 })
      resultSteps.push({
        nodes: cloneNodes(allNodes), cache: cloneCache(cacheMap),
        description: `amt(${amt}) = ${result}, 存入缓存`,
        activeNodeId: nodeId, totalCalls: calls, cacheHits: hits,
      })
      return result
    }

    trace(amount)
    return resultSteps
  }, [])

  // --- Initialize ---
  const initDemo = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    setDescription('')
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    let generatedSteps: Step[] = []
    if (mode === 'fibonacci') {
      generatedSteps = generateFibSteps(fibN)
    } else if (mode === 'grid-paths') {
      generatedSteps = generateGridSteps(gridSize)
    } else if (mode === 'coin-change') {
      generatedSteps = generateCoinSteps(coinAmount)
    }

    setSteps(generatedSteps)
    setTotalSteps(generatedSteps.length)
    if (generatedSteps.length > 0) {
      const first = generatedSteps[0]
      setNodes(first.nodes)
      setCache(first.cache)
      setDescription(first.description)
      setActiveNodeId(first.activeNodeId)
      setTotalCalls(first.totalCalls)
      setCacheHits(first.cacheHits)
    } else {
      setNodes(new Map())
      setCache(new Map())
      setActiveNodeId(null)
      setTotalCalls(0)
      setCacheHits(0)
    }
  }, [mode, fibN, gridSize, coinAmount, generateFibSteps, generateGridSteps, generateCoinSteps])

  // --- Apply step ---
  const applyStep = useCallback((stepIdx: number) => {
    if (stepIdx >= 0 && stepIdx < steps.length) {
      const step = steps[stepIdx]
      setNodes(step.nodes)
      setCache(step.cache)
      setDescription(step.description)
      setActiveNodeId(step.activeNodeId)
      setTotalCalls(step.totalCalls)
      setCacheHits(step.cacheHits)
    }
  }, [steps])

  // --- Auto-play ---
  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= totalSteps) {
      setIsPlaying(false)
      return
    }
    applyStep(currentStep)
    timerRef.current = window.setTimeout(() => {
      if (currentStep + 1 < totalSteps) {
        setCurrentStep(prev => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }, speed)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, totalSteps, speed, applyStep])

  // --- Controls ---
  const togglePlay = () => {
    if (totalSteps === 0) {
      initDemo()
      setTimeout(() => setIsPlaying(true), 100)
      return
    }
    setIsPlaying(prev => !prev)
  }

  const stepForward = () => {
    if (totalSteps === 0) { initDemo(); return }
    setIsPlaying(false)
    const next = currentStep + 1
    if (next < totalSteps) {
      setCurrentStep(next)
      applyStep(next)
    }
  }

  const stepBackward = () => {
    setIsPlaying(false)
    const prev = currentStep - 1
    if (prev >= 0) {
      setCurrentStep(prev)
      applyStep(prev)
    }
  }

  const reset = () => { initDemo() }

  useEffect(() => { initDemo() }, [initDemo])

  // --- Render tree ---
  const renderTree = () => {
    const nodeArray = Array.from(nodes.values())
    if (nodeArray.length === 0) return <div style={{ color: 'var(--text-secondary)' }}>点击播放开始演示</div>

    const maxX = Math.max(...nodeArray.map(n => n.x)) + 60
    const maxY = Math.max(...nodeArray.map(n => n.y)) + 50
    const minX = Math.min(...nodeArray.map(n => n.x)) - 60
    const svgW = Math.max(500, maxX - minX + 80)
    const svgH = Math.max(300, maxY + 30)
    const offsetX = minX < 40 ? 40 - minX : 0

    const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
    for (const node of nodeArray) {
      for (const childId of node.children) {
        const child = nodes.get(childId)
        if (child) {
          edges.push({
            x1: node.x + offsetX, y1: node.y + 18,
            x2: child.x + offsetX, y2: child.y - 18,
          })
        }
      }
    }

    return (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto' }}>
          {edges.map((e, i) => (
            <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="var(--border)" strokeWidth={1.5} />
          ))}
          {nodeArray.map(node => {
            const isActive = node.id === activeNodeId
            let fill: string
            let textColor: string
            if (node.state === 'cached-hit') {
              fill = '#10b981' // green for cache hit
              textColor = 'white'
            } else if (node.state === 'done') {
              fill = 'var(--accent)'
              textColor = 'white'
            } else if (node.state === 'computing') {
              fill = 'var(--warning)'
              textColor = 'white'
            } else {
              fill = 'var(--bg-card)'
              textColor = 'var(--text-primary)'
            }
            return (
              <g key={node.id}>
                <circle
                  cx={node.x + offsetX} cy={node.y} r={20}
                  fill={fill}
                  stroke={isActive ? '#f59e0b' : 'var(--border)'}
                  strokeWidth={isActive ? 3 : 1.5}
                  style={{ transition: 'all 0.3s' }}
                />
                <text x={node.x + offsetX} y={node.y - 4} textAnchor="middle"
                  fill={textColor} fontSize="10" fontWeight="bold">
                  {node.label}
                </text>
                {node.value !== undefined && (
                  <text x={node.x + offsetX} y={node.y + 12} textAnchor="middle"
                    fill={textColor} fontSize="9">
                    ={node.value}
                  </text>
                )}
                {node.isMemoized && (
                  <text x={node.x + offsetX + 24} y={node.y - 10}
                    fill="#10b981" fontSize="8" fontWeight="bold">
                    memo
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // --- Render cache table ---
  const renderCacheTable = () => {
    const entries = Array.from(cache.values())
    if (entries.length === 0) return null
    return (
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
        justifyContent: 'center', marginTop: '0.5rem',
      }}>
        {entries.map((entry, i) => (
          <div key={i} style={{
            padding: '0.25rem 0.5rem',
            background: entry.hitCount > 0 ? '#10b981' : 'var(--bg-card)',
            color: entry.hitCount > 0 ? 'white' : 'var(--text-primary)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            transition: 'all 0.3s',
          }}>
            {entry.key}={entry.value}
            {entry.hitCount > 0 && <span style={{ marginLeft: 4, opacity: 0.8 }}>(命中{entry.hitCount}次)</span>}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="visualization-container">
      {/* Mode selector */}
      <div className="viz-controls">
        <select
          value={mode}
          onChange={e => setMode(e.target.value as DemoMode)}
          style={{
            padding: '0.5rem 1rem', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer',
          }}
        >
          <option value="fibonacci">斐波那契</option>
          <option value="grid-paths">网格路径</option>
          <option value="coin-change">零钱兑换</option>
        </select>

        {mode === 'fibonacci' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            n =
            <select value={fibN} onChange={e => setFibN(Number(e.target.value))}
              style={{ padding: '0.3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {[4, 5, 6, 7, 8].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        )}
        {mode === 'grid-paths' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            网格大小 =
            <select value={gridSize} onChange={e => setGridSize(Number(e.target.value))}
              style={{ padding: '0.3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {[3, 4, 5].map(v => <option key={v} value={v}>{v}×{v}</option>)}
            </select>
          </label>
        )}
        {mode === 'coin-change' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            金额 =
            <select value={coinAmount} onChange={e => setCoinAmount(Number(e.target.value))}
              style={{ padding: '0.3rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {[7, 9, 11, 13].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        )}
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= totalSteps - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={reset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
          <input type="range" min="200" max="2000" step="100" value={speed}
            onChange={e => setSpeed(Number(e.target.value))} />
          {speed}ms
        </label>
      </div>

      {/* Info bar */}
      <div className="viz-info">
        <span>步骤: {totalSteps > 0 ? currentStep + 1 : 0} / {totalSteps}</span>
        <span style={{ marginLeft: '1.5rem' }}>总调用: {totalCalls}</span>
        <span style={{ marginLeft: '1.5rem' }}>缓存命中: {cacheHits}</span>
        {totalCalls > 0 && (
          <span style={{ marginLeft: '1.5rem' }}>
            命中率: {Math.round(cacheHits / totalCalls * 100)}%
          </span>
        )}
      </div>

      {/* Main canvas */}
      <div className="viz-canvas" style={{ minHeight: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
        {renderTree()}
      </div>

      {/* Cache state */}
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.3rem' }}>
          缓存状态
        </div>
        {renderCacheTable()}
      </div>

      {/* Description */}
      {description && (
        <div className="viz-info" style={{ fontWeight: 500, marginTop: '0.5rem' }}>
          {description}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--warning)', marginRight: 4, verticalAlign: 'middle' }} />
          计算中
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', marginRight: 4, verticalAlign: 'middle' }} />
          已完成
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#10b981', marginRight: 4, verticalAlign: 'middle' }} />
          缓存命中
        </span>
      </div>
    </div>
  )
}
