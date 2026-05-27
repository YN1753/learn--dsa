import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface SegmentTreeStep {
  description: string
  phase: 'build' | 'query' | 'point-update' | 'range-update' | 'idle'
  tree: number[]
  lazy: number[]
  highlights: { node: number; color: string }[]
  queryRange?: [number, number]
  updateIdx?: number
  updateVal?: number
  result?: number
}

const SAMPLE_ARRAYS = [
  [3, 1, 4, 1, 5, 9, 2, 6],
  [2, 5, 3, 8, 1, 4, 6, 7],
  [1, 7, 3, 5, 2, 8, 4, 6],
]

function buildTreeSteps(arr: number[]): SegmentTreeStep[] {
  const n = arr.length
  const tree = new Array(4 * n).fill(0)
  const lazy = new Array(4 * n).fill(0)
  const steps: SegmentTreeStep[] = []

  steps.push({
    description: '初始化线段树，所有节点值为 0',
    phase: 'build',
    tree: [...tree],
    lazy: [...lazy],
    highlights: [],
  })

  function build(node: number, start: number, end: number): void {
    if (start === end) {
      tree[node] = arr[start]
      steps.push({
        description: `叶子节点 node=${node}: 区间 [${start},${end}]，值 = arr[${start}] = ${arr[start]}`,
        phase: 'build',
        tree: [...tree],
        lazy: [...lazy],
        highlights: [{ node, color: '#22c55e' }],
      })
      return
    }
    const mid = Math.floor((start + end) / 2)
    build(2 * node, start, mid)
    build(2 * node + 1, mid + 1, end)
    tree[node] = tree[2 * node] + tree[2 * node + 1]
    steps.push({
      description: `内部节点 node=${node}: 区间 [${start},${end}]，值 = 左(${tree[2 * node]}) + 右(${tree[2 * node + 1]}) = ${tree[node]}`,
      phase: 'build',
      tree: [...tree],
      lazy: [...lazy],
      highlights: [
        { node, color: '#3b82f6' },
        { node: 2 * node, color: '#f59e0b' },
        { node: 2 * node + 1, color: '#f59e0b' },
      ],
    })
  }

  build(1, 0, n - 1)

  steps.push({
    description: '线段树构建完成！',
    phase: 'build',
    tree: [...tree],
    lazy: [...lazy],
    highlights: [{ node: 1, color: '#3b82f6' }],
  })

  return steps
}

function queryTreeSteps(arr: number[], tree: number[], lazy: number[], l: number, r: number): SegmentTreeStep[] {
  const n = arr.length
  const t = [...tree]
  const lz = [...lazy]
  const steps: SegmentTreeStep[] = []

  steps.push({
    description: `查询区间 [${l}, ${r}] 的和`,
    phase: 'query',
    tree: [...t],
    lazy: [...lz],
    highlights: [],
    queryRange: [l, r],
  })

  function query(node: number, start: number, end: number): number {
    if (r < start || end < l) {
      steps.push({
        description: `节点 [${start},${end}] 与查询区间 [${l},${r}] 无交集，返回 0`,
        phase: 'query',
        tree: [...t],
        lazy: [...lz],
        highlights: [{ node, color: '#6b7280' }],
        queryRange: [l, r],
      })
      return 0
    }
    if (l <= start && end <= r) {
      steps.push({
        description: `节点 [${start},${end}] 完全包含在查询区间内，返回 ${t[node]}`,
        phase: 'query',
        tree: [...t],
        lazy: [...lz],
        highlights: [{ node, color: '#22c55e' }],
        queryRange: [l, r],
      })
      return t[node]
    }
    steps.push({
      description: `节点 [${start},${end}] 部分重叠，继续递归`,
      phase: 'query',
      tree: [...t],
      lazy: [...lz],
      highlights: [{ node, color: '#f59e0b' }],
      queryRange: [l, r],
    })
    const mid = Math.floor((start + end) / 2)
    const leftVal = query(2 * node, start, mid)
    const rightVal = query(2 * node + 1, mid + 1, end)
    return leftVal + rightVal
  }

  const result = query(1, 0, n - 1)

  steps.push({
    description: `查询完成！区间 [${l}, ${r}] 的和 = ${result}`,
    phase: 'query',
    tree: [...t],
    lazy: [...lz],
    highlights: [{ node: 1, color: '#3b82f6' }],
    queryRange: [l, r],
    result,
  })

  return steps
}

function pointUpdateSteps(arr: number[], tree: number[], lazy: number[], idx: number, val: number): SegmentTreeStep[] {
  const n = arr.length
  const t = [...tree]
  const lz = [...lazy]
  const steps: SegmentTreeStep[] = []

  steps.push({
    description: `单点修改: 将 arr[${idx}] 从 ${arr[idx]} 修改为 ${val}`,
    phase: 'point-update',
    tree: [...t],
    lazy: [...lz],
    highlights: [],
    updateIdx: idx,
    updateVal: val,
  })

  function update(node: number, start: number, end: number): void {
    if (start === end) {
      t[node] = val
      steps.push({
        description: `叶子节点 node=${node}: 更新值为 ${val}`,
        phase: 'point-update',
        tree: [...t],
        lazy: [...lz],
        highlights: [{ node, color: '#22c55e' }],
        updateIdx: idx,
        updateVal: val,
      })
      return
    }
    const mid = Math.floor((start + end) / 2)
    if (idx <= mid) update(2 * node, start, mid)
    else update(2 * node + 1, mid + 1, end)
    t[node] = t[2 * node] + t[2 * node + 1]
    steps.push({
      description: `节点 [${start},${end}]: 更新为 ${t[2 * node]} + ${t[2 * node + 1]} = ${t[node]}`,
      phase: 'point-update',
      tree: [...t],
      lazy: [...lz],
      highlights: [
        { node, color: '#3b82f6' },
        { node: 2 * node, color: '#f59e0b' },
        { node: 2 * node + 1, color: '#f59e0b' },
      ],
      updateIdx: idx,
      updateVal: val,
    })
  }

  update(1, 0, n - 1)

  steps.push({
    description: `修改完成！arr[${idx}] = ${val}`,
    phase: 'point-update',
    tree: [...t],
    lazy: [...lz],
    highlights: [],
    updateIdx: idx,
    updateVal: val,
  })

  return steps
}

function rangeUpdateSteps(arr: number[], tree: number[], lazy: number[], l: number, r: number, val: number): SegmentTreeStep[] {
  const n = arr.length
  const t = [...tree]
  const lz = [...lazy]
  const steps: SegmentTreeStep[] = []

  steps.push({
    description: `区间修改: 将 [${l}, ${r}] 每个元素 +${val}`,
    phase: 'range-update',
    tree: [...t],
    lazy: [...lz],
    highlights: [],
    queryRange: [l, r],
  })

  function pushDown(node: number, start: number, end: number): void {
    if (lz[node] !== 0) {
      const mid = Math.floor((start + end) / 2)
      t[2 * node] += lz[node] * (mid - start + 1)
      lz[2 * node] += lz[node]
      t[2 * node + 1] += lz[node] * (end - mid)
      lz[2 * node + 1] += lz[node]
      steps.push({
        description: `下推懒标记: 节点 ${node} 的标记 ${lz[node]} 传递给子节点`,
        phase: 'range-update',
        tree: [...t],
        lazy: [...lz],
        highlights: [
          { node, color: '#ef4444' },
          { node: 2 * node, color: '#f59e0b' },
          { node: 2 * node + 1, color: '#f59e0b' },
        ],
        queryRange: [l, r],
      })
      lz[node] = 0
    }
  }

  function update(node: number, start: number, end: number): void {
    if (r < start || end < l) return
    if (l <= start && end <= r) {
      t[node] += val * (end - start + 1)
      lz[node] += val
      steps.push({
        description: `节点 [${start},${end}] 完全覆盖: 值 += ${val} * ${end - start + 1} = ${val * (end - start + 1)}，设置懒标记 ${val}`,
        phase: 'range-update',
        tree: [...t],
        lazy: [...lz],
        highlights: [{ node, color: '#22c55e' }],
        queryRange: [l, r],
      })
      return
    }
    pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    update(2 * node, start, mid)
    update(2 * node + 1, mid + 1, end)
    t[node] = t[2 * node] + t[2 * node + 1]
    steps.push({
      description: `节点 [${start},${end}]: 更新为 ${t[2 * node]} + ${t[2 * node + 1]} = ${t[node]}`,
      phase: 'range-update',
      tree: [...t],
      lazy: [...lz],
      highlights: [
        { node, color: '#3b82f6' },
        { node: 2 * node, color: '#f59e0b' },
        { node: 2 * node + 1, color: '#f59e0b' },
      ],
      queryRange: [l, r],
    })
  }

  update(1, 0, n - 1)

  steps.push({
    description: `区间修改完成！[${l}, ${r}] 每个元素 +${val}`,
    phase: 'range-update',
    tree: [...t],
    lazy: [...lz],
    highlights: [],
    queryRange: [l, r],
  })

  return steps
}

// Compute tree layout positions for SVG rendering
interface TreeNode {
  node: number
  start: number
  end: number
  x: number
  y: number
  left?: TreeNode
  right?: TreeNode
}

function computeLayout(n: number): TreeNode | null {
  function build(node: number, start: number, end: number, depth: number, xMin: number, xMax: number): TreeNode {
    const x = (xMin + xMax) / 2
    const y = depth
    const result: TreeNode = { node, start, end, x, y }
    if (start !== end) {
      const mid = Math.floor((start + end) / 2)
      result.left = build(2 * node, start, mid, depth + 1, xMin, x)
      result.right = build(2 * node + 1, mid + 1, end, depth + 1, x, xMax)
    }
    return result
  }
  if (n <= 0) return null
  return build(1, 0, n - 1, 0, 0, 800)
}

function getTreeHeight(n: number): number {
  return Math.ceil(Math.log2(n)) + 1
}

export default function SegmentTreeVisualization() {
  const [inputArray, setInputArray] = useState<number[]>(SAMPLE_ARRAYS[0])
  const [allSteps, setAllSteps] = useState<SegmentTreeStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [queryL, setQueryL] = useState(2)
  const [queryR, setQueryR] = useState(5)
  const [updateIdx, setUpdateIdx] = useState(3)
  const [updateVal, setUpdateVal] = useState(10)
  const [rangeL, setRangeL] = useState(1)
  const [rangeR, setRangeR] = useState(4)
  const [rangeVal, setRangeVal] = useState(3)
  const timerRef = useRef<number | null>(null)

  const n = inputArray.length
  const treeHeight = getTreeHeight(n)
  const layout = useMemo(() => computeLayout(n), [n])

  const doBuild = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setCurrentStep(0)
    const steps = buildTreeSteps(inputArray)
    setAllSteps(steps)
  }, [inputArray])

  const doQuery = useCallback(() => {
    const buildSteps = buildTreeSteps(inputArray)
    const lastBuild = buildSteps[buildSteps.length - 1]
    const l = Math.max(0, Math.min(queryL, n - 1))
    const r = Math.max(l, Math.min(queryR, n - 1))
    const qSteps = queryTreeSteps(inputArray, lastBuild.tree, lastBuild.lazy, l, r)
    const combined = [...buildSteps, ...qSteps]
    setAllSteps(combined)
    setCurrentStep(buildSteps.length)
    setIsPlaying(false)
  }, [inputArray, queryL, queryR, n])

  const doPointUpdate = useCallback(() => {
    const buildSteps = buildTreeSteps(inputArray)
    const lastBuild = buildSteps[buildSteps.length - 1]
    const idx = Math.max(0, Math.min(updateIdx, n - 1))
    const uSteps = pointUpdateSteps(inputArray, lastBuild.tree, lastBuild.lazy, idx, updateVal)
    const combined = [...buildSteps, ...uSteps]
    setAllSteps(combined)
    setCurrentStep(buildSteps.length)
    setIsPlaying(false)
  }, [inputArray, updateIdx, updateVal, n])

  const doRangeUpdate = useCallback(() => {
    const buildSteps = buildTreeSteps(inputArray)
    const lastBuild = buildSteps[buildSteps.length - 1]
    const l = Math.max(0, Math.min(rangeL, n - 1))
    const r = Math.max(l, Math.min(rangeR, n - 1))
    const uSteps = rangeUpdateSteps(inputArray, lastBuild.tree, lastBuild.lazy, l, r, rangeVal)
    const combined = [...buildSteps, ...uSteps]
    setAllSteps(combined)
    setCurrentStep(buildSteps.length)
    setIsPlaying(false)
  }, [inputArray, rangeL, rangeR, rangeVal, n])

  useEffect(() => {
    doBuild()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isPlaying || allSteps.length === 0) return
    if (currentStep >= allSteps.length - 1) {
      setIsPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, allSteps.length - 1))
    }, speed)
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, allSteps, speed])

  const togglePlay = useCallback(() => {
    if (allSteps.length === 0) return
    if (currentStep >= allSteps.length - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }, [allSteps, currentStep])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < allSteps.length - 1) setCurrentStep(prev => prev + 1)
  }, [currentStep, allSteps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }, [currentStep])

  const current = allSteps[currentStep] || {
    description: '点击按钮开始演示',
    phase: 'idle' as const,
    tree: new Array(4 * n).fill(0),
    lazy: new Array(4 * n).fill(0),
    highlights: [],
  }

  // Flatten layout into a map
  const nodeMap = useMemo(() => {
    const map = new Map<number, { x: number; y: number; start: number; end: number }>()
    function traverse(node: TreeNode) {
      map.set(node.node, { x: node.x, y: node.y, start: node.start, end: node.end })
      if (node.left) traverse(node.left)
      if (node.right) traverse(node.right)
    }
    if (layout) traverse(layout)
    return map
  }, [layout])

  // Collect edges
  const edges = useMemo(() => {
    const result: { from: number; to: number }[] = []
    function traverse(node: TreeNode) {
      if (node.left) {
        result.push({ from: node.node, to: node.left.node })
        traverse(node.left)
      }
      if (node.right) {
        result.push({ from: node.node, to: node.right.node })
        traverse(node.right)
      }
    }
    if (layout) traverse(layout)
    return result
  }, [layout])

  // Collect visible nodes (only show levels that have values)
  const visibleDepth = Math.min(treeHeight, 4) // show up to 4 levels for readability
  const visibleNodes = useMemo(() => {
    const result: number[] = []
    function collect(node: number, depth: number) {
      if (depth >= visibleDepth) return
      if (!nodeMap.has(node)) return
      result.push(node)
      if (2 * node < 4 * n) collect(2 * node, depth + 1)
      if (2 * node + 1 < 4 * n) collect(2 * node + 1, depth + 1)
    }
    collect(1, 0)
    return result
  }, [nodeMap, visibleDepth, n])

  const highlightMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const h of current.highlights) {
      map.set(h.node, h.color)
    }
    return map
  }, [current.highlights])

  const svgWidth = 800
  const svgHeight = visibleDepth * 100 + 40

  const selectStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
  }

  const inputStyle: React.CSSProperties = {
    padding: '0.4rem 0.6rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    width: '50px',
    textAlign: 'center',
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  }

  return (
    <div className="visualization-container">
      {/* Array selector */}
      <div className="viz-controls">
        <select
          value={SAMPLE_ARRAYS.findIndex(a => a.length === inputArray.length && a.every((v, i) => v === inputArray[i]))}
          onChange={e => {
            const idx = Number(e.target.value)
            setInputArray(SAMPLE_ARRAYS[idx])
            if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
            setIsPlaying(false)
            setCurrentStep(0)
          }}
          style={selectStyle}
        >
          {SAMPLE_ARRAYS.map((arr, idx) => (
            <option key={idx} value={idx}>[{arr.join(', ')}]</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={doBuild}>建树</button>
      </div>

      {/* Query controls */}
      <div className="viz-controls">
        <label style={labelStyle}>
          l:
          <input type="number" min={0} max={n - 1} value={queryL}
            onChange={e => setQueryL(Math.max(0, Math.min(Number(e.target.value), n - 1)))}
            style={inputStyle} />
        </label>
        <label style={labelStyle}>
          r:
          <input type="number" min={0} max={n - 1} value={queryR}
            onChange={e => setQueryR(Math.max(0, Math.min(Number(e.target.value), n - 1)))}
            style={inputStyle} />
        </label>
        <button className="btn btn-primary" onClick={doQuery}>区间查询</button>
      </div>

      {/* Point update controls */}
      <div className="viz-controls">
        <label style={labelStyle}>
          idx:
          <input type="number" min={0} max={n - 1} value={updateIdx}
            onChange={e => setUpdateIdx(Math.max(0, Math.min(Number(e.target.value), n - 1)))}
            style={inputStyle} />
        </label>
        <label style={labelStyle}>
          val:
          <input type="number" value={updateVal}
            onChange={e => setUpdateVal(Number(e.target.value))}
            style={inputStyle} />
        </label>
        <button className="btn btn-secondary" onClick={doPointUpdate}>单点修改</button>
      </div>

      {/* Range update controls */}
      <div className="viz-controls">
        <label style={labelStyle}>
          l:
          <input type="number" min={0} max={n - 1} value={rangeL}
            onChange={e => setRangeL(Math.max(0, Math.min(Number(e.target.value), n - 1)))}
            style={inputStyle} />
        </label>
        <label style={labelStyle}>
          r:
          <input type="number" min={0} max={n - 1} value={rangeR}
            onChange={e => setRangeR(Math.max(0, Math.min(Number(e.target.value), n - 1)))}
            style={inputStyle} />
        </label>
        <label style={labelStyle}>
          +val:
          <input type="number" value={rangeVal}
            onChange={e => setRangeVal(Number(e.target.value))}
            style={inputStyle} />
        </label>
        <button className="btn btn-secondary" onClick={doRangeUpdate}>区间修改</button>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>上一步</button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : currentStep >= allSteps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= allSteps.length - 1}>下一步</button>
        <button className="btn btn-secondary" onClick={() => { setIsPlaying(false); setCurrentStep(0) }}>重置</button>
        <label style={{ ...labelStyle, fontSize: '0.85rem' }}>
          速度:
          <input type="range" min={200} max={2000} step={100} value={speed} onChange={e => setSpeed(Number(e.target.value))} />
          {speed}ms
        </label>
      </div>

      {/* Progress bar */}
      {allSteps.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
            {currentStep + 1}/{allSteps.length}
          </span>
          <input type="range" min={0} max={allSteps.length - 1} value={currentStep}
            onChange={e => { setIsPlaying(false); setCurrentStep(Number(e.target.value)) }}
            style={{ flex: 1 }} />
        </div>
      )}

      {/* SVG Tree Visualization */}
      <div className="viz-canvas" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minHeight: '300px', padding: '1rem 0.5rem' }}>
        {/* Original array display */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>原始数组</div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {inputArray.map((value, index) => (
              <div key={index} style={{
                width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px',
                background: current.phase === 'query' && current.queryRange &&
                  index >= current.queryRange[0] && index <= current.queryRange[1] ? '#3b82f6'
                  : current.updateIdx === index ? '#22c55e' : '#374151',
                border: current.phase === 'query' && current.queryRange &&
                  index >= current.queryRange[0] && index <= current.queryRange[1] ? '3px solid #60a5fa'
                  : current.updateIdx === index ? '3px solid #4ade80' : '1px solid #4b5563',
                color: '#fff', fontSize: '0.95rem', fontWeight: 'bold',
                fontFamily: 'Consolas, Monaco, monospace', transition: 'all 0.3s ease',
              }}>
                {value}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
            {inputArray.map((_, index) => (
              <div key={`idx-${index}`} style={{
                width: '48px', textAlign: 'center', fontSize: '0.7rem',
                color: current.phase === 'query' && current.queryRange &&
                  index >= current.queryRange[0] && index <= current.queryRange[1] ? '#60a5fa' : 'var(--text-secondary)',
              }}>
                [{index}]
              </div>
            ))}
          </div>
        </div>

        {/* SVG Segment Tree */}
        <svg width={svgWidth} height={svgHeight} style={{ maxWidth: '100%', overflow: 'visible' }}>
          {/* Edges */}
          {edges.filter(e => visibleNodes.includes(e.from) && visibleNodes.includes(e.to)).map((edge, i) => {
            const fromPos = nodeMap.get(edge.from)!
            const toPos = nodeMap.get(edge.to)!
            const fromY = fromPos.y * 100 + 30
            const toY = toPos.y * 100 + 30
            return (
              <line key={`edge-${i}`}
                x1={fromPos.x} y1={fromY}
                x2={toPos.x} y2={toY}
                stroke="#4b5563" strokeWidth={1.5}
              />
            )
          })}
          {/* Nodes */}
          {visibleNodes.map(nodeIdx => {
            const pos = nodeMap.get(nodeIdx)
            if (!pos) return null
            const y = pos.y * 100 + 30
            const value = current.tree[nodeIdx] ?? 0
            const lazyVal = current.lazy[nodeIdx] ?? 0
            const hlColor = highlightMap.get(nodeIdx)
            const isLeaf = pos.start === pos.end
            return (
              <g key={`node-${nodeIdx}`}>
                {/* Node circle */}
                <circle cx={pos.x} cy={y} r={isLeaf ? 22 : 28}
                  fill={hlColor || '#1e3a5f'}
                  stroke={hlColor ? '#fff' : '#4b5563'} strokeWidth={hlColor ? 2.5 : 1.5}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Value */}
                <text x={pos.x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize={isLeaf ? 13 : 14} fontWeight="bold"
                  fontFamily="Consolas, Monaco, monospace">
                  {value}
                </text>
                {/* Range label */}
                <text x={pos.x} y={y + (isLeaf ? -30 : -36)} textAnchor="middle"
                  fill="var(--text-secondary)" fontSize={11} fontFamily="Consolas, Monaco, monospace">
                  [{pos.start},{pos.end}]
                </text>
                {/* Lazy marker */}
                {lazyVal !== 0 && (
                  <>
                    <circle cx={pos.x + 24} cy={y - 20} r={10} fill="#ef4444" stroke="#fff" strokeWidth={1} />
                    <text x={pos.x + 24} y={y - 19} textAnchor="middle" dominantBaseline="middle"
                      fill="#fff" fontSize={9} fontWeight="bold">
                      {lazyVal}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap',
        fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }} />
          叶子节点 / 完全覆盖
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px', display: 'inline-block' }} />
          当前操作节点
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }} />
          子节点参与合并
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#6b7280', borderRadius: '2px', display: 'inline-block' }} />
          无交集
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px', display: 'inline-block' }} />
          懒标记
        </span>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前操作：</strong>{current.description}
        </div>
        {current.result !== undefined && (
          <div style={{ fontSize: '0.9rem', color: '#4ade80', fontWeight: 'bold' }}>
            查询结果: {current.result}
          </div>
        )}
      </div>
    </div>
  )
}
