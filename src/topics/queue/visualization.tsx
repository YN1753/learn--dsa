import { useState, useEffect, useCallback, useRef } from 'react'

interface QueueElement {
  value: number
  id: number
  animating: 'entering' | 'exiting' | null
}

interface GraphNode {
  id: number
  label: string
  x: number
  y: number
  visited: boolean
  inQueue: boolean
  current: boolean
}

interface GraphEdge {
  from: number
  to: number
}

interface BFSStep {
  description: string
  queue: number[]
  visited: number[]
  currentNode: number | null
  action: 'dequeue' | 'enqueue' | 'visit' | 'done'
  targetNode?: number
}

export default function QueueVisualization() {
  // ---- Queue state ----
  const [elements, setElements] = useState<QueueElement[]>([])
  const [nextId, setNextId] = useState(1)
  const [inputVal, setInputVal] = useState('')
  const [message, setMessage] = useState('点击 "入队" 添加元素')

  // ---- Mode ----
  const [mode, setMode] = useState<'basic' | 'circular' | 'bfs'>('basic')

  // ---- Circular queue ----
  const [circularCapacity] = useState(6)
  const [circularData, setCircularData] = useState<(number | null)[]>(new Array(6).fill(null))
  const [circularFront, setCircularFront] = useState(0)
  const [circularRear, setCircularRear] = useState(0)
  const [circularCount, setCircularCount] = useState(0)
  const [circularInputVal, setCircularInputVal] = useState('')

  // ---- BFS ----
  const bfsGraphNodes: GraphNode[] = [
    { id: 0, label: '0', x: 250, y: 40, visited: false, inQueue: false, current: false },
    { id: 1, label: '1', x: 130, y: 120, visited: false, inQueue: false, current: false },
    { id: 2, label: '2', x: 370, y: 120, visited: false, inQueue: false, current: false },
    { id: 3, label: '3', x: 70, y: 210, visited: false, inQueue: false, current: false },
    { id: 4, label: '4', x: 190, y: 210, visited: false, inQueue: false, current: false },
    { id: 5, label: '5', x: 370, y: 210, visited: false, inQueue: false, current: false },
  ]
  const bfsEdges: GraphEdge[] = [
    { from: 0, to: 1 }, { from: 0, to: 2 },
    { from: 1, to: 3 }, { from: 1, to: 4 },
    { from: 2, to: 5 },
  ]
  const bfsGraph: number[][] = [[1, 2], [0, 3, 4], [0, 5], [1], [1], [2]]

  const [bfsNodes, setBfsNodes] = useState<GraphNode[]>(bfsGraphNodes.map(n => ({ ...n })))
  const [bfsSteps, setBfsSteps] = useState<BFSStep[]>([])
  const [bfsCurrentStep, setBfsCurrentStep] = useState(-1)
  const [bfsQueueDisplay, setBfsQueueDisplay] = useState<number[]>([])
  const [bfsResult, setBfsResult] = useState<number[]>([])
  const [bfsRunning, setBfsRunning] = useState(false)

  // ---- Playback ----
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  // ---- Basic queue operations ----
  const enqueue = useCallback(() => {
    const val = parseInt(inputVal)
    if (isNaN(val)) {
      setMessage('请输入有效数字')
      return
    }
    const newEl: QueueElement = { value: val, id: nextId, animating: 'entering' }
    setElements(prev => [...prev, newEl])
    setNextId(prev => prev + 1)
    setInputVal('')
    setMessage(`入队: ${val}`)

    // Clear animation
    setTimeout(() => {
      setElements(prev => prev.map(e => e.id === newEl.id ? { ...e, animating: null } : e))
    }, 400)
  }, [inputVal, nextId])

  const dequeue = useCallback(() => {
    if (elements.length === 0) {
      setMessage('队列为空，无法出队')
      return
    }
    const frontVal = elements[0].value
    // Animate exit
    setElements(prev => prev.map((e, i) => i === 0 ? { ...e, animating: 'exiting' } : e))
    setMessage(`出队: ${frontVal}`)

    setTimeout(() => {
      setElements(prev => prev.slice(1))
    }, 400)
  }, [elements])

  // ---- Circular queue operations ----
  const circularEnqueue = useCallback(() => {
    const val = parseInt(circularInputVal)
    if (isNaN(val)) {
      setMessage('请输入有效数字')
      return
    }
    if (circularCount >= circularCapacity) {
      setMessage(`队列已满！容量=${circularCapacity}`)
      return
    }
    const newData = [...circularData]
    newData[circularRear] = val
    setCircularData(newData)
    setCircularRear((circularRear + 1) % circularCapacity)
    setCircularCount(circularCount + 1)
    setCircularInputVal('')
    setMessage(`入队 ${val}，rear 移动到 ${(circularRear + 1) % circularCapacity}`)
  }, [circularInputVal, circularData, circularFront, circularRear, circularCount, circularCapacity])

  const circularDequeue = useCallback(() => {
    if (circularCount <= 0) {
      setMessage('队列为空！')
      return
    }
    const val = circularData[circularFront]
    const newData = [...circularData]
    newData[circularFront] = null
    setCircularData(newData)
    setCircularFront((circularFront + 1) % circularCapacity)
    setCircularCount(circularCount - 1)
    setMessage(`出队 ${val}，front 移动到 ${(circularFront + 1) % circularCapacity}`)
  }, [circularData, circularFront, circularRear, circularCount, circularCapacity])

  // ---- BFS ----
  const generateBFSSteps = useCallback((): BFSStep[] => {
    const steps: BFSStep[] = []
    const visited = new Set<number>()
    const queue: number[] = [0]
    visited.add(0)

    steps.push({
      description: '将起始节点 0 加入队列',
      queue: [0],
      visited: [0],
      currentNode: null,
      action: 'enqueue',
      targetNode: 0,
    })

    while (queue.length > 0) {
      const node = queue.shift()!
      steps.push({
        description: `取出节点 ${node} 进行访问`,
        queue: [...queue],
        visited: [...visited],
        currentNode: node,
        action: 'dequeue',
        targetNode: node,
      })

      const neighbors = bfsGraph[node].filter(n => !visited.has(n))
      for (const neighbor of neighbors) {
        visited.add(neighbor)
        queue.push(neighbor)
        steps.push({
          description: `发现邻居节点 ${neighbor}，加入队列`,
          queue: [...queue],
          visited: [...visited],
          currentNode: node,
          action: 'enqueue',
          targetNode: neighbor,
        })
      }
    }

    steps.push({
      description: 'BFS 遍历完成！',
      queue: [],
      visited: [...visited],
      currentNode: null,
      action: 'done',
    })

    return steps
  }, [])

  const startBFS = useCallback(() => {
    const steps = generateBFSSteps()
    setBfsSteps(steps)
    setBfsCurrentStep(0)
    setBfsNodes(bfsGraphNodes.map(n => ({ ...n })))
    setBfsQueueDisplay([])
    setBfsResult([])
    setBfsRunning(true)
    applyBFSStep(steps, 0)
  }, [generateBFSSteps])

  const applyBFSStep = useCallback((steps: BFSStep[], stepIdx: number) => {
    if (stepIdx < 0 || stepIdx >= steps.length) return
    const step = steps[stepIdx]

    setBfsQueueDisplay([...step.queue])
    setMessage(step.description)

    setBfsNodes(prev => {
      const next = prev.map(n => ({ ...n, current: false }))
      // Mark visited
      for (const vid of step.visited) {
        next[vid].visited = true
        next[vid].inQueue = step.queue.includes(vid)
      }
      if (step.currentNode !== null) {
        next[step.currentNode].current = true
      }
      if (step.targetNode !== undefined && step.action === 'enqueue') {
        next[step.targetNode].inQueue = true
      }
      return next
    })

    if (step.action === 'dequeue' && step.targetNode !== undefined) {
      setBfsResult(prev => {
        if (!prev.includes(step.targetNode!)) return [...prev, step.targetNode!]
        return prev
      })
    }
  }, [])

  const nextBFSStep = useCallback(() => {
    const next = bfsCurrentStep + 1
    if (next >= bfsSteps.length) {
      setPlaying(false)
      return
    }
    setBfsCurrentStep(next)
    applyBFSStep(bfsSteps, next)
  }, [bfsCurrentStep, bfsSteps, applyBFSStep])

  const prevBFSStep = useCallback(() => {
    const prev = bfsCurrentStep - 1
    if (prev < 0) return
    // Rebuild state from scratch up to prev
    setBfsNodes(bfsGraphNodes.map(n => ({ ...n })))
    setBfsQueueDisplay([])
    setBfsResult([])

    // Replay all steps up to prev
    const tempVisited = new Set<number>()
    const tempResult: number[] = []
    for (let i = 0; i <= prev; i++) {
      const step = bfsSteps[i]
      for (const vid of step.visited) tempVisited.add(vid)
      if (step.action === 'dequeue' && step.targetNode !== undefined) {
        if (!tempResult.includes(step.targetNode)) tempResult.push(step.targetNode)
      }
    }

    setBfsCurrentStep(prev)
    applyBFSStep(bfsSteps, prev)
    setBfsResult(tempResult)
  }, [bfsCurrentStep, bfsSteps, applyBFSStep])

  const resetBFS = useCallback(() => {
    setBfsNodes(bfsGraphNodes.map(n => ({ ...n })))
    setBfsSteps([])
    setBfsCurrentStep(-1)
    setBfsQueueDisplay([])
    setBfsResult([])
    setBfsRunning(false)
    setPlaying(false)
    setMessage('点击"开始 BFS"启动广度优先搜索')
  }, [])

  // ---- Auto-play ----
  useEffect(() => {
    if (playing && mode === 'bfs' && bfsRunning) {
      timerRef.current = window.setInterval(() => {
        setBfsCurrentStep(prev => {
          const next = prev + 1
          if (next >= bfsSteps.length) {
            setPlaying(false)
            return prev
          }
          applyBFSStep(bfsSteps, next)
          return next
        })
      }, speed)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [playing, speed, mode, bfsRunning, bfsSteps, applyBFSStep])

  const togglePlay = useCallback(() => {
    if (mode === 'bfs') {
      if (!bfsRunning) {
        startBFS()
        setPlaying(true)
      } else {
        setPlaying(prev => !prev)
      }
    }
  }, [mode, bfsRunning, startBFS])

  const handleReset = useCallback(() => {
    setPlaying(false)
    if (timerRef.current) clearInterval(timerRef.current)

    if (mode === 'basic') {
      setElements([])
      setMessage('队列已重置')
    } else if (mode === 'circular') {
      setCircularData(new Array(circularCapacity).fill(null))
      setCircularFront(0)
      setCircularRear(0)
      setCircularCount(0)
      setMessage('循环队列已重置')
    } else {
      resetBFS()
    }
  }, [mode, circularCapacity, resetBFS])

  // ---- Render helpers ----
  const renderBasicQueue = () => (
    <div>
      <div className="viz-controls">
        <input
          type="number"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && enqueue()}
          placeholder="输入数字"
          style={{ width: 100, padding: '0.4rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
        />
        <button className="btn btn-primary" onClick={enqueue}>入队</button>
        <button className="btn btn-secondary" onClick={dequeue}>出队</button>
        <button className="btn btn-secondary" onClick={handleReset}>重置</button>
      </div>

      <div className="viz-canvas" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: 80, justifyContent: 'center' }}>
          {elements.length === 0 ? (
            <span style={{ color: 'var(--text-secondary)' }}>队列为空</span>
          ) : (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginRight: '0.25rem' }}>队头 →</span>
              {elements.map((el, i) => (
                <div
                  key={el.id}
                  style={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: i === 0 ? 'var(--accent)' : 'var(--bg-card)',
                    border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: i === 0 ? '#fff' : 'var(--text-primary)',
                    transform: el.animating === 'entering' ? 'translateX(30px)' : el.animating === 'exiting' ? 'translateX(-30px)' : 'none',
                    opacity: el.animating === 'exiting' ? 0.3 : 1,
                    transition: 'all 0.35s ease',
                  }}
                >
                  {el.value}
                </div>
              ))}
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.25rem' }}>← 队尾</span>
            </>
          )}
        </div>
      </div>

      <div className="viz-info" style={{ marginTop: '0.75rem' }}>
        队列长度: {elements.length} | 队头: {elements.length > 0 ? elements[0].value : '无'}
      </div>
    </div>
  )

  const renderCircularQueue = () => (
    <div>
      <div className="viz-controls">
        <input
          type="number"
          value={circularInputVal}
          onChange={e => setCircularInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && circularEnqueue()}
          placeholder="输入数字"
          style={{ width: 100, padding: '0.4rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
        />
        <button className="btn btn-primary" onClick={circularEnqueue}>入队</button>
        <button className="btn btn-secondary" onClick={circularDequeue}>出队</button>
        <button className="btn btn-secondary" onClick={handleReset}>重置</button>
      </div>

      <div className="viz-canvas" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 280, height: 280 }}>
          {/* Circular arrangement */}
          {circularData.map((val, i) => {
            const angle = (2 * Math.PI * i) / circularCapacity - Math.PI / 2
            const radius = 100
            const cx = 140 + radius * Math.cos(angle)
            const cy = 140 + radius * Math.sin(angle)
            const isFront = i === circularFront && circularCount > 0
            const isRear = i === circularRear && circularCount > 0
            const hasValue = val !== null

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: cx - 28,
                  top: cy - 28,
                  width: 56,
                  height: 56,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: hasValue ? (isFront ? 'var(--accent)' : 'var(--bg-card)') : 'var(--bg-primary)',
                  border: `2px solid ${isFront ? 'var(--accent)' : isRear ? 'var(--success)' : hasValue ? 'var(--border)' : 'var(--border)'}`,
                  borderRadius: '50%',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: isFront ? '#fff' : 'var(--text-primary)',
                  transition: 'all 0.3s ease',
                }}
              >
                <span>{val !== null ? val : '_'}</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginTop: 1 }}>{i}</span>
              </div>
            )
          })}

          {/* Center label */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}>
            <div>容量: {circularCapacity}</div>
            <div>数量: {circularCount}</div>
          </div>

          {/* Front arrow */}
          {circularCount > 0 && (() => {
            const angle = (2 * Math.PI * circularFront) / circularCapacity - Math.PI / 2
            const arrowR = 60
            const ax = 140 + arrowR * Math.cos(angle)
            const ay = 140 + arrowR * Math.sin(angle)
            return (
              <div style={{
                position: 'absolute',
                left: ax - 14,
                top: ay - 10,
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--accent)',
              }}>
                F
              </div>
            )
          })()}

          {/* Rear arrow */}
          {circularCount > 0 && circularCount < circularCapacity && (() => {
            const angle = (2 * Math.PI * circularRear) / circularCapacity - Math.PI / 2
            const arrowR = 60
            const ax = 140 + arrowR * Math.cos(angle)
            const ay = 140 + arrowR * Math.sin(angle)
            return (
              <div style={{
                position: 'absolute',
                left: ax - 14,
                top: ay - 10,
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--success)',
              }}>
                R
              </div>
            )
          })()}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--accent)' }}>● F = Front (队头)</span>
          <span style={{ color: 'var(--success)' }}>● R = Rear (队尾)</span>
          <span style={{ color: 'var(--text-secondary)' }}>● _ = 空位</span>
        </div>
      </div>

      <div className="viz-info" style={{ marginTop: '0.75rem' }}>
        front={circularFront} | rear={circularRear} | count={circularCount}/{circularCapacity} |
        {circularCount >= circularCapacity ? ' 已满' : circularCount === 0 ? ' 为空' : ' 可用'}
      </div>
    </div>
  )

  const renderBFS = () => (
    <div>
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={togglePlay}>
          {playing ? '暂停' : bfsRunning ? '继续' : '开始 BFS'}
        </button>
        <button className="btn btn-secondary" onClick={() => { setPlaying(false); prevBFSStep() }} disabled={!bfsRunning || bfsCurrentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-secondary" onClick={() => { setPlaying(false); nextBFSStep() }} disabled={!bfsRunning || bfsCurrentStep >= bfsSteps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>重置</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
          <input
            type="range"
            min={200}
            max={2000}
            step={100}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ marginTop: '1rem' }}>
        <svg width="500" height="260" style={{ display: 'block', margin: '0 auto' }}>
          {/* Edges */}
          {bfsEdges.map((edge, i) => {
            const fromNode = bfsNodes[edge.from]
            const toNode = bfsNodes[edge.to]
            const edgeVisited = fromNode.visited && toNode.visited
            return (
              <line
                key={i}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={edgeVisited ? 'var(--accent)' : 'var(--border)'}
                strokeWidth={edgeVisited ? 2.5 : 1.5}
                style={{ transition: 'all 0.3s ease' }}
              />
            )
          })}

          {/* Nodes */}
          {bfsNodes.map(node => {
            const fill = node.current
              ? 'var(--warning)'
              : node.inQueue
                ? 'var(--success)'
                : node.visited
                  ? 'var(--accent)'
                  : 'var(--bg-card)'
            const strokeColor = node.current
              ? 'var(--warning)'
              : node.inQueue
                ? 'var(--success)'
                : node.visited
                  ? 'var(--accent)'
                  : 'var(--border)'

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  fill={fill}
                  stroke={strokeColor}
                  strokeWidth={2.5}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={node.visited || node.current || node.inQueue ? '#fff' : 'var(--text-primary)'}
                  fontSize={16}
                  fontWeight={600}
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.78rem' }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--border)', verticalAlign: 'middle', marginRight: 4 }} /> 未访问</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--success)', verticalAlign: 'middle', marginRight: 4 }} /> 在队列中</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', verticalAlign: 'middle', marginRight: 4 }} /> 已访问</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--warning)', verticalAlign: 'middle', marginRight: 4 }} /> 当前节点</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
        <div className="viz-info" style={{ flex: 1 }}>
          <strong>BFS 队列:</strong> [{bfsQueueDisplay.join(', ')}]
        </div>
        <div className="viz-info" style={{ flex: 1 }}>
          <strong>遍历顺序:</strong> [{bfsResult.join(', ')}]
        </div>
      </div>

      {bfsRunning && bfsCurrentStep >= 0 && bfsCurrentStep < bfsSteps.length && (
        <div className="viz-info" style={{ marginTop: '0.5rem' }}>
          步骤 {bfsCurrentStep + 1}/{bfsSteps.length}: {bfsSteps[bfsCurrentStep].description}
        </div>
      )}
    </div>
  )

  return (
    <div className="visualization-container">
      {/* Mode switch */}
      <div className="viz-controls">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>模式:</span>
        <button
          className={`btn ${mode === 'basic' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('basic'); handleReset() }}
        >
          基本队列
        </button>
        <button
          className={`btn ${mode === 'circular' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('circular'); handleReset() }}
        >
          循环队列
        </button>
        <button
          className={`btn ${mode === 'bfs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setMode('bfs'); handleReset() }}
        >
          BFS 演示
        </button>
      </div>

      {/* Content */}
      {mode === 'basic' && renderBasicQueue()}
      {mode === 'circular' && renderCircularQueue()}
      {mode === 'bfs' && renderBFS()}

      {/* Message bar */}
      <div className="viz-info" style={{ marginTop: '0.5rem', fontWeight: 500 }}>
        {message}
      </div>
    </div>
  )
}
