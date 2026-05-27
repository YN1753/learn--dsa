import { useState, useEffect, useRef, useCallback } from 'react'

// --- Types ---

interface StackFrame {
  id: number
  funcName: string
  args: string
  returnValue?: number
  state: 'calling' | 'returning' | 'done'
  depth: number
}

interface FibNode {
  id: string
  n: number
  x: number
  y: number
  result?: number
  state: 'pending' | 'computing' | 'done'
  memoized: boolean
  children: string[]
  parent?: string
}

interface HanoiStep {
  disk: number
  from: string
  to: string
  description: string
}

type DemoMode = 'factorial' | 'fibonacci' | 'tower-of-hanoi'

let frameId = 0

// --- Component ---

export default function RecursionVisualization() {
  const [mode, setMode] = useState<DemoMode>('factorial')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [description, setDescription] = useState('')
  const [currentDepth, setCurrentDepth] = useState(0)
  const timerRef = useRef<number | null>(null)

  // Factorial state
  const [factN, setFactN] = useState(5)
  const [factStack, setFactStack] = useState<StackFrame[]>([])
  const [factSteps, setFactSteps] = useState<Array<{
    stack: StackFrame[]
    desc: string
    depth: number
  }>>([])

  // Fibonacci state
  const [fibN, setFibN] = useState(6)
  const [fibNodes, setFibNodes] = useState<Map<string, FibNode>>(new Map())
  const [fibSteps, setFibSteps] = useState<Array<{
    nodes: Map<string, FibNode>
    desc: string
    depth: number
    activeId: string | null
  }>>([])
  const [fibActiveId, setFibActiveId] = useState<string | null>(null)

  // Tower of Hanoi state
  const [hanoiDisks, setHanoiDisks] = useState(3)
  const [hanoiPegs, setHanoiPegs] = useState<Map<string, number[]>>(new Map())
  const [hanoiSteps, setHanoiSteps] = useState<HanoiStep[]>([])
  const [hanoiStateSteps, setHanoiStateSteps] = useState<Array<{
    pegs: Map<string, number[]>
    desc: string
    highlightDisk: number
  }>>([])

  // --- Generate Factorial Steps ---
  const generateFactorialSteps = useCallback((n: number) => {
    const steps: Array<{ stack: StackFrame[]; desc: string; depth: number }> = []
    const stack: StackFrame[] = []

    function trace(num: number): number {
      frameId++
      const frame: StackFrame = {
        id: frameId,
        funcName: 'factorial',
        args: `${num}`,
        state: 'calling',
        depth: stack.length,
      }
      stack.push(frame)
      steps.push({
        stack: stack.map(f => ({ ...f })),
        desc: `调用 factorial(${num})，压入栈帧`,
        depth: stack.length,
      })

      if (num <= 1) {
        frame.returnValue = 1
        frame.state = 'returning'
        steps.push({
          stack: stack.map(f => ({ ...f })),
          desc: `factorial(${num}) 命中基本情况，返回 1`,
          depth: stack.length,
        })
        stack.pop()
        steps.push({
          stack: stack.map(f => ({ ...f })),
          desc: `弹出 factorial(${num}) 的栈帧`,
          depth: stack.length,
        })
        return 1
      }

      const subResult = trace(num - 1)
      const result = num * subResult
      // Find the frame in the stack again (it may have been popped and re-pushed)
      const currentFrame = stack.find(f => f.funcName === 'factorial' && f.args === `${num}`)
      if (currentFrame) {
        currentFrame.returnValue = result
        currentFrame.state = 'returning'
      }
      steps.push({
        stack: stack.map(f => ({ ...f })),
        desc: `factorial(${num}) = ${num} × ${subResult} = ${result}，返回结果`,
        depth: stack.length,
      })
      stack.pop()
      steps.push({
        stack: stack.map(f => ({ ...f })),
        desc: `弹出 factorial(${num}) 的栈帧`,
        depth: stack.length,
      })
      return result
    }

    frameId = 0
    trace(n)
    return steps
  }, [])

  // --- Generate Fibonacci Steps ---
  const generateFibonacciSteps = useCallback((n: number) => {
    const steps: Array<{
      nodes: Map<string, FibNode>
      desc: string
      depth: number
      activeId: string | null
    }> = []
    const nodes = new Map<string, FibNode>()
    let nodeId = 0
    const memo = new Map<number, number>()

    function createNode(nVal: number, parent?: string, side?: 'left' | 'right'): string {
      const id = `fib-${nodeId++}`
      const parentNode = parent ? nodes.get(parent) : undefined
      let x: number
      let y: number

      if (!parentNode) {
        x = 400
        y = 30
      } else {
        const offset = Math.max(40, 200 / (nVal + 1))
        x = parentNode.x + (side === 'left' ? -offset : offset)
        y = parentNode.y + 55
      }

      const node: FibNode = {
        id,
        n: nVal,
        x,
        y,
        state: 'pending',
        memoized: false,
        children: [],
        parent,
      }
      nodes.set(id, node)
      if (parent) {
        const p = nodes.get(parent)
        if (p) p.children.push(id)
      }
      return id
    }

    function trace(nVal: number, parentId?: string, side?: 'left' | 'right'): number {
      const nodeIdStr = createNode(nVal, parentId, side)

      if (memo.has(nVal)) {
        const node = nodes.get(nodeIdStr)!
        node.memoized = true
        node.state = 'done'
        node.result = memo.get(nVal)
        steps.push({
          nodes: cloneNodes(nodes),
          desc: `fib(${nVal}) 命中缓存，直接返回 ${node.result}`,
          depth: 0,
          activeId: nodeIdStr,
        })
        return node.result!
      }

      nodes.get(nodeIdStr)!.state = 'computing'
      steps.push({
        nodes: cloneNodes(nodes),
        desc: `开始计算 fib(${nVal})`,
        depth: 0,
        activeId: nodeIdStr,
      })

      if (nVal <= 1) {
        const node = nodes.get(nodeIdStr)!
        node.result = nVal
        node.state = 'done'
        memo.set(nVal, nVal)
        steps.push({
          nodes: cloneNodes(nodes),
          desc: `fib(${nVal}) 命中基本情况，返回 ${nVal}`,
          depth: 0,
          activeId: nodeIdStr,
        })
        return nVal
      }

      const left = trace(nVal - 1, nodeIdStr, 'left')
      const right = trace(nVal - 2, nodeIdStr, 'right')
      const result = left + right

      const node = nodes.get(nodeIdStr)!
      node.result = result
      node.state = 'done'
      memo.set(nVal, result)
      steps.push({
        nodes: cloneNodes(nodes),
        desc: `fib(${nVal}) = fib(${nVal - 1}) + fib(${nVal - 2}) = ${left} + ${right} = ${result}`,
        depth: 0,
        activeId: nodeIdStr,
      })
      return result
    }

    function cloneNodes(source: Map<string, FibNode>): Map<string, FibNode> {
      const cloned = new Map<string, FibNode>()
      for (const [key, val] of source) {
        cloned.set(key, { ...val, children: [...val.children] })
      }
      return cloned
    }

    trace(n)
    return steps
  }, [])

  // --- Generate Hanoi Steps ---
  const generateHanoiSteps = useCallback((diskCount: number) => {
    const stateSteps: Array<{
      pegs: Map<string, number[]>
      desc: string
      highlightDisk: number
    }> = []

    const pegs = new Map<string, number[]>()
    pegs.set('A', [])
    pegs.set('B', [])
    pegs.set('C', [])
    // Init: all disks on peg A
    for (let i = diskCount; i >= 1; i--) {
      pegs.get('A')!.push(i)
    }

    function clonePegs(source: Map<string, number[]>): Map<string, number[]> {
      const cloned = new Map<string, number[]>()
      for (const [key, val] of source) {
        cloned.set(key, [...val])
      }
      return cloned
    }

    stateSteps.push({
      pegs: clonePegs(pegs),
      desc: `初始状态：${diskCount} 个圆盘在柱子 A 上`,
      highlightDisk: -1,
    })

    function move(n: number, from: string, to: string, aux: string): void {
      if (n === 1) {
        const fromPeg = pegs.get(from)!
        const disk = fromPeg.pop()!
        pegs.get(to)!.push(disk)
        stateSteps.push({
          pegs: clonePegs(pegs),
          desc: `将圆盘 ${disk} 从 ${from} 移到 ${to}`,
          highlightDisk: disk,
        })
        return
      }
      move(n - 1, from, aux, to)
      const fromPeg = pegs.get(from)!
      const disk = fromPeg.pop()!
      pegs.get(to)!.push(disk)
      stateSteps.push({
        pegs: clonePegs(pegs),
        desc: `将圆盘 ${disk} 从 ${from} 移到 ${to}`,
        highlightDisk: disk,
      })
      move(n - 1, aux, to, from)
    }

    move(diskCount, 'A', 'C', 'B')
    return stateSteps
  }, [])

  // --- Initialize demos ---
  const initDemo = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    setDescription('')
    setCurrentDepth(0)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (mode === 'factorial') {
      frameId = 0
      const steps = generateFactorialSteps(factN)
      setFactSteps(steps)
      setFactStack([])
      setTotalSteps(steps.length)
      if (steps.length > 0) {
        setFactStack(steps[0].stack)
        setDescription(steps[0].desc)
        setCurrentDepth(steps[0].depth)
      }
    } else if (mode === 'fibonacci') {
      const steps = generateFibonacciSteps(fibN)
      setFibSteps(steps)
      setFibNodes(new Map())
      setFibActiveId(null)
      setTotalSteps(steps.length)
      if (steps.length > 0) {
        setFibNodes(steps[0].nodes)
        setDescription(steps[0].desc)
        setFibActiveId(steps[0].activeId)
      }
    } else if (mode === 'tower-of-hanoi') {
      const steps = generateHanoiSteps(hanoiDisks)
      setHanoiStateSteps(steps)
      setTotalSteps(steps.length)
      if (steps.length > 0) {
        setHanoiPegs(steps[0].pegs)
        setDescription(steps[0].desc)
      }
    }
  }, [mode, factN, fibN, hanoiDisks, generateFactorialSteps, generateFibonacciSteps, generateHanoiSteps])

  // --- Apply step ---
  const applyStep = useCallback(
    (stepIdx: number) => {
      if (mode === 'factorial') {
        if (stepIdx >= 0 && stepIdx < factSteps.length) {
          const step = factSteps[stepIdx]
          setFactStack(step.stack)
          setDescription(step.desc)
          setCurrentDepth(step.depth)
        }
      } else if (mode === 'fibonacci') {
        if (stepIdx >= 0 && stepIdx < fibSteps.length) {
          const step = fibSteps[stepIdx]
          setFibNodes(step.nodes)
          setDescription(step.desc)
          setFibActiveId(step.activeId)
        }
      } else if (mode === 'tower-of-hanoi') {
        if (stepIdx >= 0 && stepIdx < hanoiStateSteps.length) {
          const step = hanoiStateSteps[stepIdx]
          setHanoiPegs(step.pegs)
          setDescription(step.desc)
        }
      }
    },
    [mode, factSteps, fibSteps, hanoiStateSteps]
  )

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
    if (totalSteps === 0) {
      initDemo()
      return
    }
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

  const reset = () => {
    initDemo()
  }

  // Init on mode change
  useEffect(() => {
    initDemo()
  }, [initDemo])

  // --- Render helpers ---
  const maxVisibleFrames = 8

  const renderFactorialViz = () => {
    const visible = factStack.slice(-maxVisibleFrames)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          调用栈顶 ↑
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            border: '2px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '0.5rem',
            minHeight: '280px',
            minWidth: '280px',
            gap: '3px',
            background: 'rgba(30, 41, 59, 0.5)',
          }}
        >
          {visible.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontStyle: 'italic' }}>
              调用栈为空
            </div>
          ) : (
            visible.map((frame, index) => {
              const isTop = index === visible.length - 1
              const isReturning = frame.state === 'returning'
              return (
                <div
                  key={frame.id}
                  style={{
                    padding: '0.5rem 1rem',
                    background: isReturning
                      ? 'var(--success)'
                      : isTop
                        ? 'var(--accent)'
                        : 'var(--bg-card)',
                    color: isReturning || isTop ? 'white' : 'var(--text-primary)',
                    borderRadius: 'var(--radius)',
                    textAlign: 'center',
                    fontWeight: isTop ? 'bold' : 'normal',
                    border: isTop ? '2px solid var(--accent-hover)' : '1px solid var(--border)',
                    fontSize: '0.9rem',
                    minWidth: '200px',
                    transition: 'all 0.3s',
                    animation: isTop && frame.state === 'calling' ? 'framePush 0.3s ease-out' : undefined,
                  }}
                >
                  <div>{frame.funcName}({frame.args})</div>
                  {frame.returnValue !== undefined && (
                    <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>
                      返回值: {frame.returnValue}
                    </div>
                  )}
                  {isTop && (
                    <span style={{ position: 'absolute', right: '-3rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                      ← 栈顶
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          调用栈底
        </div>
      </div>
    )
  }

  const renderFibonacciViz = () => {
    const nodeArray = Array.from(fibNodes.values())
    if (nodeArray.length === 0) return <div style={{ color: 'var(--text-secondary)' }}>点击播放开始演示</div>

    // Calculate SVG dimensions
    const maxX = Math.max(...nodeArray.map(n => n.x)) + 60
    const maxY = Math.max(...nodeArray.map(n => n.y)) + 50
    const svgW = Math.max(500, maxX + 40)
    const svgH = Math.max(300, maxY + 30)

    // Build edges
    const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
    for (const node of nodeArray) {
      for (const childId of node.children) {
        const child = fibNodes.get(childId)
        if (child) {
          edges.push({ x1: node.x, y1: node.y + 18, x2: child.x, y2: child.y - 18 })
        }
      }
    }

    return (
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto' }}>
          {/* Edges */}
          {edges.map((e, i) => (
            <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="var(--border)" strokeWidth={1.5} />
          ))}
          {/* Nodes */}
          {nodeArray.map(node => {
            const isActive = node.id === fibActiveId
            const fill = node.memoized
              ? 'var(--success)'
              : node.state === 'done'
                ? 'var(--accent)'
                : node.state === 'computing'
                  ? 'var(--warning)'
                  : 'var(--bg-card)'
            const textColor = node.state === 'done' || node.state === 'computing' || node.memoized ? 'white' : 'var(--text-primary)'
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={18}
                  fill={fill}
                  stroke={isActive ? 'var(--warning)' : 'var(--border)'}
                  strokeWidth={isActive ? 3 : 1.5}
                  style={{ transition: 'all 0.3s' }}
                />
                <text x={node.x} y={node.y - 3} textAnchor="middle" fill={textColor} fontSize="11" fontWeight="bold">
                  {node.n}
                </text>
                {node.result !== undefined && (
                  <text x={node.x} y={node.y + 11} textAnchor="middle" fill={textColor} fontSize="9">
                    ={node.result}
                  </text>
                )}
                {node.memoized && (
                  <text x={node.x + 22} y={node.y - 10} fill="var(--success)" fontSize="9">
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

  const renderHanoiViz = () => {
    const pegNames = ['A', 'B', 'C']
    const pegColors = ['var(--accent)', 'var(--warning)', 'var(--success)']
    const maxDisk = hanoiDisks
    const pegWidth = 120
    const diskHeight = 22
    const pegHeight = (maxDisk + 1) * diskHeight + 20
    const totalWidth = pegWidth * 3 + 60

    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', alignItems: 'flex-end', minHeight: pegHeight + 40 }}>
        {pegNames.map((name, pegIdx) => {
          const disks = hanoiPegs.get(name) || []
          return (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: pegColors[pegIdx], fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                柱子 {name}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  alignItems: 'center',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '0.5rem',
                  minHeight: pegHeight,
                  width: pegWidth,
                  gap: '2px',
                  background: 'rgba(30, 41, 59, 0.3)',
                  position: 'relative',
                }}
              >
                {/* Peg rod */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    width: '4px',
                    height: pegHeight - 20,
                    background: 'var(--border)',
                    borderRadius: '2px',
                  }}
                />
                {disks.map((disk, i) => {
                  const widthPct = (disk / maxDisk) * 80 + 20
                  return (
                    <div
                      key={`${name}-${disk}-${i}`}
                      style={{
                        width: `${widthPct}%`,
                        height: diskHeight - 2,
                        background: `hsl(${(disk * 40) % 360}, 60%, 55%)`,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        zIndex: 1,
                        transition: 'all 0.3s',
                      }}
                    >
                      {disk}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
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
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          <option value="factorial">阶乘 - 调用栈演示</option>
          <option value="fibonacci">斐波那契 - 记忆化对比</option>
          <option value="tower-of-hanoi">汉诺塔 - 递归步骤</option>
        </select>

        {mode === 'factorial' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            n =
            <select
              value={factN}
              onChange={e => setFactN(Number(e.target.value))}
              style={{
                padding: '0.3rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            >
              {[3, 4, 5, 6].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
        )}

        {mode === 'fibonacci' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            n =
            <select
              value={fibN}
              onChange={e => setFibN(Number(e.target.value))}
              style={{
                padding: '0.3rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            >
              {[4, 5, 6, 7].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
        )}

        {mode === 'tower-of-hanoi' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            圆盘数 =
            <select
              value={hanoiDisks}
              onChange={e => setHanoiDisks(Number(e.target.value))}
              style={{
                padding: '0.3rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            >
              {[2, 3, 4, 5].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
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

      {/* Info bar */}
      <div className="viz-info">
        <span>步骤: {totalSteps > 0 ? currentStep + 1 : 0} / {totalSteps}</span>
        {mode === 'factorial' && <span style={{ marginLeft: '1.5rem' }}>当前深度: {currentDepth}</span>}
      </div>

      {/* Main canvas */}
      <div className="viz-canvas" style={{ minHeight: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
        {mode === 'factorial' && renderFactorialViz()}
        {mode === 'fibonacci' && renderFibonacciViz()}
        {mode === 'tower-of-hanoi' && renderHanoiViz()}
      </div>

      {/* Description */}
      {description && (
        <div className="viz-info" style={{ fontWeight: 500 }}>
          {description}
        </div>
      )}

      {/* Legend for fibonacci */}
      {mode === 'fibonacci' && fibNodes.size > 0 && (
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
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--success)', marginRight: 4, verticalAlign: 'middle' }} />
            命中缓存
          </span>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes framePush {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
