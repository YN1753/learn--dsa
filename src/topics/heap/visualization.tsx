import { useState, useEffect, useRef, useCallback } from 'react'

interface HeapNode {
  value: number
  x: number
  y: number
  index: number
}

const SVG_WIDTH = 400
const SVG_HEIGHT = 350
const NODE_RADIUS = 20
const LEVEL_HEIGHT = 65
const ROOT_Y = 40

type OperationType = 'insert' | 'extractMax' | 'idle'

interface AnimationStep {
  array: number[]
  highlights: number[]
  swapPair: [number, number] | null
  description: string
  phase: 'initial' | 'compare' | 'swap' | 'done'
}

function getParent(i: number): number {
  return Math.floor((i - 1) / 2)
}

function getLeft(i: number): number {
  return 2 * i + 1
}

function getRight(i: number): number {
  return 2 * i + 2
}

function getNodePositions(arr: number[]): HeapNode[] {
  const nodes: HeapNode[] = []
  const height = arr.length > 0 ? Math.floor(Math.log2(arr.length)) + 1 : 0

  for (let i = 0; i < arr.length; i++) {
    const level = Math.floor(Math.log2(i + 1))
    const posInLevel = i - (Math.pow(2, level) - 1)
    const nodesInLevel = Math.pow(2, level)
    const levelWidth = Math.pow(2, height - level) * NODE_RADIUS * 1.8
    const spacing = levelWidth / (nodesInLevel + 1)

    const x = SVG_WIDTH / 2 - levelWidth / 2 + spacing * (posInLevel + 1)
    const y = ROOT_Y + level * LEVEL_HEIGHT

    nodes.push({ value: arr[i], x, y, index: i })
  }

  return nodes
}

function generateInsertSteps(arr: number[], value: number): AnimationStep[] {
  const steps: AnimationStep[] = []
  const data = [...arr]
  data.push(value)

  steps.push({
    array: [...data],
    highlights: [data.length - 1],
    swapPair: null,
    description: `将 ${value} 添加到数组末尾（树的最后一层最右边）`,
    phase: 'initial'
  })

  let current = data.length - 1
  while (current > 0) {
    const parentIdx = getParent(current)
    steps.push({
      array: [...data],
      highlights: [current, parentIdx],
      swapPair: null,
      description: `比较 ${data[current]} 与父节点 ${data[parentIdx]}`,
      phase: 'compare'
    })

    if (data[current] > data[parentIdx]) {
      const temp = data[current]
      data[current] = data[parentIdx]
      data[parentIdx] = temp
      steps.push({
        array: [...data],
        highlights: [parentIdx],
        swapPair: [current, parentIdx],
        description: `${temp} > ${data[parentIdx]}，交换！${temp} 上浮到索引 ${parentIdx}`,
        phase: 'swap'
      })
      current = parentIdx
    } else {
      steps.push({
        array: [...data],
        highlights: [current],
        swapPair: null,
        description: `${data[current]} <= ${data[parentIdx]}，堆性质满足，停止上浮`,
        phase: 'done'
      })
      break
    }
  }

  if (current === 0) {
    steps.push({
      array: [...data],
      highlights: [0],
      swapPair: null,
      description: `${data[0]} 已上浮到堆顶，插入完成！`,
      phase: 'done'
    })
  }

  return steps
}

function generateExtractSteps(arr: number[]): AnimationStep[] {
  const steps: AnimationStep[] = []
  if (arr.length === 0) return steps

  const data = [...arr]
  const maxValue = data[0]

  steps.push({
    array: [...data],
    highlights: [0],
    swapPair: null,
    description: `堆顶元素 ${maxValue} 是最大值，准备移除`,
    phase: 'initial'
  })

  if (data.length === 1) {
    steps.push({
      array: [],
      highlights: [],
      swapPair: null,
      description: `堆中只有一个元素 ${maxValue}，移除后堆为空`,
      phase: 'done'
    })
    return steps
  }

  data[0] = data[data.length - 1]
  data.pop()
  steps.push({
    array: [...data],
    highlights: [0],
    swapPair: null,
    description: `将末尾元素 ${data[0]} 移到堆顶，准备下沉`,
    phase: 'initial'
  })

  let current = 0
  while (true) {
    const leftIdx = getLeft(current)
    const rightIdx = getRight(current)
    let largest = current

    if (leftIdx < data.length) {
      steps.push({
        array: [...data],
        highlights: [current, leftIdx],
        swapPair: null,
        description: `比较 ${data[current]} 与左子节点 ${data[leftIdx]}`,
        phase: 'compare'
      })
      if (data[leftIdx] > data[largest]) {
        largest = leftIdx
      }
    }

    if (rightIdx < data.length) {
      steps.push({
        array: [...data],
        highlights: [current, rightIdx],
        swapPair: null,
        description: `比较 ${data[largest]} 与右子节点 ${data[rightIdx]}`,
        phase: 'compare'
      })
      if (data[rightIdx] > data[largest]) {
        largest = rightIdx
      }
    }

    if (largest !== current) {
      const temp = data[current]
      data[current] = data[largest]
      data[largest] = temp
      steps.push({
        array: [...data],
        highlights: [largest],
        swapPair: [current, largest],
        description: `${temp} < ${data[largest]}，交换！${data[largest]} 下沉到索引 ${largest}`,
        phase: 'swap'
      })
      current = largest
    } else {
      steps.push({
        array: [...data],
        highlights: [current],
        swapPair: null,
        description: `${data[current]} 大于等于所有子节点，堆性质恢复，下沉完成`,
        phase: 'done'
      })
      break
    }
  }

  return steps
}

export default function HeapVisualization() {
  const [array, setArray] = useState<number[]>([90, 80, 70, 50, 60, 40, 30])
  const [highlights, setHighlights] = useState<number[]>([])
  const [swapPair, setSwapPair] = useState<[number, number] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [description, setDescription] = useState('选择操作开始演示')
  const [insertValue, setInsertValue] = useState('')
  const [currentOp, setCurrentOp] = useState<OperationType>('idle')
  const timerRef = useRef<number | null>(null)
  const stepsRef = useRef<AnimationStep[]>([])
  const stepIndexRef = useRef(0)

  const nodes = getNodePositions(array)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetState = useCallback(() => {
    clearTimer()
    setHighlights([])
    setSwapPair(null)
    setIsPlaying(false)
    setCurrentOp('idle')
    stepsRef.current = []
    stepIndexRef.current = 0
  }, [clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const applyStep = useCallback((step: AnimationStep) => {
    setArray([...step.array])
    setHighlights([...step.highlights])
    setSwapPair(step.swapPair)
    setDescription(step.description)
  }, [])

  const playSteps = useCallback((steps: AnimationStep[], onComplete?: () => void) => {
    if (steps.length === 0) return
    stepsRef.current = steps
    stepIndexRef.current = 0
    setIsPlaying(true)
    applyStep(steps[0])

    timerRef.current = window.setInterval(() => {
      stepIndexRef.current++
      if (stepIndexRef.current >= stepsRef.current.length) {
        clearTimer()
        setIsPlaying(false)
        setHighlights([])
        setSwapPair(null)
        if (onComplete) onComplete()
        return
      }
      applyStep(stepsRef.current[stepIndexRef.current])
    }, speed)
  }, [speed, clearTimer, applyStep])

  const handleInsert = useCallback(() => {
    const val = parseInt(insertValue)
    if (isNaN(val)) {
      setDescription('请输入有效的数字')
      return
    }
    if (val < 0 || val > 99) {
      setDescription('请输入 0-99 之间的数字')
      return
    }
    resetState()
    setCurrentOp('insert')
    const steps = generateInsertSteps(array, val)
    playSteps(steps, () => {
      setDescription(`插入 ${val} 完成！堆性质已恢复。`)
    })
    setInsertValue('')
  }, [insertValue, array, resetState, playSteps])

  const handleExtractMax = useCallback(() => {
    if (array.length === 0) {
      setDescription('堆为空，无法取出最大值')
      return
    }
    resetState()
    setCurrentOp('extractMax')
    const maxVal = array[0]
    const steps = generateExtractSteps(array)
    playSteps(steps, () => {
      setDescription(`取出最大值 ${maxVal} 完成！堆性质已恢复。`)
    })
  }, [array, resetState, playSteps])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription('已暂停')
    } else if (stepsRef.current.length > 0) {
      setIsPlaying(true)
      timerRef.current = window.setInterval(() => {
        stepIndexRef.current++
        if (stepIndexRef.current >= stepsRef.current.length) {
          clearTimer()
          setIsPlaying(false)
          setHighlights([])
          setSwapPair(null)
          return
        }
        applyStep(stepsRef.current[stepIndexRef.current])
      }, speed)
    }
  }, [isPlaying, speed, clearTimer, applyStep])

  const handleReset = useCallback(() => {
    resetState()
    setArray([90, 80, 70, 50, 60, 40, 30])
    setDescription('已重置为默认最大堆')
  }, [resetState])

  const isHighlighted = (idx: number) => highlights.includes(idx)
  const isSwapped = (idx: number) => swapPair !== null && (swapPair[0] === idx || swapPair[1] === idx)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <input
          type="number"
          value={insertValue}
          onChange={e => setInsertValue(e.target.value)}
          placeholder="输入插入值 (0-99)"
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '130px',
            fontSize: '0.85rem'
          }}
        />
        <button className="btn btn-primary" onClick={handleInsert} disabled={isPlaying}>
          插入元素
        </button>
        <button className="btn btn-primary" onClick={handleExtractMax} disabled={isPlaying || array.length === 0}>
          取出最大值
        </button>
        <button className="btn btn-secondary" onClick={togglePlay} disabled={currentOp === 'idle'}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
          速度:
        </span>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={2200 - speed}
          onChange={e => setSpeed(2200 - parseInt(e.target.value))}
          title={`速度: ${speed}ms`}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
        {/* Tree View */}
        <div className="viz-canvas" style={{ flex: 1, padding: '0.75rem', overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            树形视图 (Tree View)
          </div>
          <svg width="100%" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} style={{ display: 'block' }}>
            <defs>
              <filter id="heapGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {nodes.map((node, i) => {
              const leftIdx = getLeft(i)
              const rightIdx = getRight(i)
              const edges = []
              if (leftIdx < nodes.length) {
                const child = nodes[leftIdx]
                edges.push(
                  <line
                    key={`edge-${i}-left`}
                    x1={node.x}
                    y1={node.y}
                    x2={child.x}
                    y2={child.y}
                    stroke={isHighlighted(i) && isHighlighted(leftIdx) ? 'var(--accent)' : 'var(--border)'}
                    strokeWidth={isHighlighted(i) && isHighlighted(leftIdx) ? 2.5 : 1.5}
                    strokeOpacity={0.6}
                  />
                )
              }
              if (rightIdx < nodes.length) {
                const child = nodes[rightIdx]
                edges.push(
                  <line
                    key={`edge-${i}-right`}
                    x1={node.x}
                    y1={node.y}
                    x2={child.x}
                    y2={child.y}
                    stroke={isHighlighted(i) && isHighlighted(rightIdx) ? 'var(--accent)' : 'var(--border)'}
                    strokeWidth={isHighlighted(i) && isHighlighted(rightIdx) ? 2.5 : 1.5}
                    strokeOpacity={0.6}
                  />
                )
              }
              return edges
            })}

            {/* Nodes */}
            {nodes.map((node, i) => {
              const highlighted = isHighlighted(i)
              const swapped = isSwapped(i)

              let fillColor = 'var(--bg-card)'
              let strokeColor = 'var(--border)'
              let textColor = 'var(--text-primary)'
              let extraFilter = ''

              if (swapped) {
                fillColor = '#f59e0b'
                strokeColor = '#d97706'
                textColor = '#ffffff'
                extraFilter = 'url(#heapGlow)'
              } else if (highlighted) {
                fillColor = 'var(--accent)'
                strokeColor = '#60a5fa'
                textColor = '#ffffff'
                extraFilter = 'url(#heapGlow)'
              }

              return (
                <g key={i} filter={extraFilter}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={highlighted || swapped ? 3 : 2}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={textColor}
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="Consolas, Monaco, monospace"
                    style={{ transition: 'fill 0.3s ease' }}
                  >
                    {node.value}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + NODE_RADIUS + 12}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--text-secondary)"
                    fontSize="9"
                    fontFamily="Consolas, Monaco, monospace"
                  >
                    [{i}]
                  </text>
                </g>
              )
            })}

            {/* Legend */}
            <g transform={`translate(15, ${SVG_HEIGHT - 30})`}>
              <circle cx={0} cy={0} r={7} fill="var(--bg-card)" stroke="var(--border)" strokeWidth={1.5} />
              <text x={12} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="10">普通</text>
              <circle cx={55} cy={0} r={7} fill="var(--accent)" stroke="#60a5fa" strokeWidth={1.5} />
              <text x={67} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="10">比较中</text>
              <circle cx={125} cy={0} r={7} fill="#f59e0b" stroke="#d97706" strokeWidth={1.5} />
              <text x={137} y={0} dominantBaseline="central" fill="var(--text-secondary)" fontSize="10">交换</text>
            </g>
          </svg>
        </div>

        {/* Array View */}
        <div className="viz-canvas" style={{ flex: 1, padding: '0.75rem' }}>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            数组视图 (Array View)
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            justifyContent: 'center',
            marginTop: '0.5rem'
          }}>
            {array.map((val, i) => {
              const highlighted = isHighlighted(i)
              const swapped = isSwapped(i)
              let bg = 'var(--bg-card)'
              let border = 'var(--border)'
              let color = 'var(--text-primary)'

              if (swapped) {
                bg = '#f59e0b'
                border = '#d97706'
                color = '#ffffff'
              } else if (highlighted) {
                bg = 'var(--accent)'
                border = '#60a5fa'
                color = '#ffffff'
              }

              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: bg,
                    border: `2px solid ${border}`,
                    borderRadius: 'var(--radius)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    color,
                    fontFamily: 'Consolas, Monaco, monospace',
                    transition: 'all 0.3s ease'
                  }}>
                    {val}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                    fontFamily: 'Consolas, Monaco, monospace'
                  }}>
                    [{i}]
                  </div>
                </div>
              )
            })}
          </div>

          {array.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '0.3rem' }}>
                <strong>父子关系 (索引从0开始):</strong>
              </div>
              <div>父节点: Math.floor((i-1)/2)</div>
              <div>左子节点: 2*i + 1</div>
              <div>右子节点: 2*i + 2</div>
            </div>
          )}

          {array.length > 0 && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '0.3rem' }}>
                <strong>堆信息:</strong>
              </div>
              <div>堆大小: {array.length}</div>
              <div>堆顶 (最大值): {array[0]}</div>
              <div>堆高度: {Math.floor(Math.log2(array.length)) + 1}</div>
            </div>
          )}
        </div>
      </div>

      <div className="viz-info">
        {description}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>最大堆性质</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            对于任意节点 i，data[i] &gt;= data[parent(i)]。堆顶始终是最大值。
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>操作说明</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            {currentOp === 'insert' && '插入：添加到末尾后上浮 (Sift-Up)，与父节点比较交换。'}
            {currentOp === 'extractMax' && '取出最大值：将末尾元素移到堆顶后下沉 (Sift-Down)，与较大子节点交换。'}
            {currentOp === 'idle' && '选择插入或取出最大值开始演示。'}
          </div>
        </div>
      </div>
    </div>
  )
}
