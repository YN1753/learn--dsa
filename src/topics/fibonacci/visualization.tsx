import { useState, useEffect, useRef, useCallback } from 'react'

type Method = 'naive' | 'dp' | 'matrix'

interface TreeNode {
  id: number
  n: number
  x: number
  y: number
  result: number | null
  isDuplicate: boolean
  parentId: number | null
  leftChild: number | null
  rightChild: number | null
}

interface DPStep {
  index: number
  value: number
  prev1: number
  prev2: number
  description: string
  dpTable: number[]
}

interface MatrixStep {
  step: number
  exp: number
  isOdd: boolean
  resultMatrix: [number, number, number, number]
  baseMatrix: [number, number, number, number]
  description: string
}

// Generate naive recursion tree
function generateNaiveTree(n: number): TreeNode[] {
  const nodes: TreeNode[] = []
  let nodeId = 0
  const seen = new Map<string, number[]>() // track nodes by n value

  function buildTree(val: number, x: number, y: number, parentId: number | null, depth: number): number {
    const currentId = nodeId++
    const existingNodes = seen.get(String(val)) || []
    const isDuplicate = existingNodes.length > 0

    const node: TreeNode = {
      id: currentId,
      n: val,
      x,
      y,
      result: null,
      isDuplicate,
      parentId,
      leftChild: null,
      rightChild: null,
    }
    nodes.push(node)

    if (!seen.has(String(val))) {
      seen.set(String(val), [])
    }
    seen.get(String(val))!.push(currentId)

    if (val <= 1) {
      node.result = val
      return currentId
    }

    const spread = Math.max(30, 180 / (depth + 1))
    const leftId = buildTree(val - 1, x - spread, y + 70, currentId, depth + 1)
    const rightId = buildTree(val - 2, x + spread, y + 70, currentId, depth + 1)

    node.leftChild = leftId
    node.rightChild = rightId
    node.result = (nodes[leftId].result ?? 0) + (nodes[rightId].result ?? 0)

    return currentId
  }

  buildTree(n, 300, 30, null, 0)
  return nodes
}

// Generate DP steps
function generateDPSteps(n: number): DPStep[] {
  const steps: DPStep[] = []
  const dp: number[] = [0, 1]

  steps.push({
    index: 0,
    value: 0,
    prev1: 0,
    prev2: 0,
    description: '初始化: dp[0] = 0',
    dpTable: [...dp],
  })

  steps.push({
    index: 1,
    value: 1,
    prev1: 0,
    prev2: 0,
    description: '初始化: dp[1] = 1',
    dpTable: [...dp],
  })

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
    steps.push({
      index: i,
      value: dp[i],
      prev1: dp[i - 1],
      prev2: dp[i - 2],
      description: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
      dpTable: [...dp],
    })
  }

  return steps
}

// Generate matrix exponentiation steps
function generateMatrixSteps(n: number): MatrixStep[] {
  const steps: MatrixStep[] = []
  let result: [number, number, number, number] = [1, 0, 0, 1]
  let base: [number, number, number, number] = [1, 1, 1, 0]
  let exp = n
  let stepNum = 0

  while (exp > 0) {
    stepNum++
    const isOdd = exp % 2 === 1

    if (isOdd) {
      result = [
        result[0] * base[0] + result[1] * base[2],
        result[0] * base[1] + result[1] * base[3],
        result[2] * base[0] + result[3] * base[2],
        result[2] * base[1] + result[3] * base[3],
      ]
    }

    steps.push({
      step: stepNum,
      exp,
      isOdd,
      resultMatrix: [...result],
      baseMatrix: [...base],
      description: isOdd
        ? `n=${exp}为奇数: 结果矩阵 × 基础矩阵 → [[${result[0]},${result[1]}],[${result[2]},${result[3]}]]`
        : `n=${exp}为偶数: 跳过乘法`,
    })

    base = [
      base[0] * base[0] + base[1] * base[2],
      base[0] * base[1] + base[1] * base[3],
      base[2] * base[0] + base[3] * base[2],
      base[2] * base[1] + base[3] * base[3],
    ]

    if (exp > 1) {
      steps.push({
        step: stepNum,
        exp: Math.floor(exp / 2),
        isOdd: false,
        resultMatrix: [...result],
        baseMatrix: [...base],
        description: `基础矩阵平方: [[${base[0]},${base[1]}],[${base[2]},${base[3]}]]`,
      })
    }

    exp = Math.floor(exp / 2)
  }

  return steps
}

export default function FibonacciVisualization() {
  const [method, setMethod] = useState<Method>('dp')
  const [n, setN] = useState(7)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const timerRef = useRef<number | null>(null)

  // Naive tree state
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([])
  const [revealedNodes, setRevealedNodes] = useState<Set<number>>(new Set())

  // DP state
  const [dpSteps, setDPSteps] = useState<DPStep[]>([])

  // Matrix state
  const [matrixSteps, setMatrixSteps] = useState<MatrixStep[]>([])

  // Generate data when method or n changes
  useEffect(() => {
    setIsPlaying(false)
    setCurrentStep(0)

    if (method === 'naive') {
      const maxN = Math.min(n, 8) // Limit for tree visualization
      const nodes = generateNaiveTree(maxN)
      setTreeNodes(nodes)
      setRevealedNodes(new Set())
    } else if (method === 'dp') {
      setDPSteps(generateDPSteps(n))
    } else {
      setMatrixSteps(generateMatrixSteps(n))
    }
  }, [method, n])

  // Auto-play for DP
  useEffect(() => {
    if (!isPlaying) return

    const maxSteps = method === 'dp' ? dpSteps.length : method === 'matrix' ? matrixSteps.length : treeNodes.length

    if (currentStep >= maxSteps - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => prev + 1)
      if (method === 'naive') {
        setRevealedNodes(prev => {
          const next = new Set(prev)
          // Reveal nodes in BFS order
          const toReveal = Math.min(prev.size + 1, treeNodes.length)
          for (let i = prev.size; i < toReveal; i++) {
            next.add(treeNodes[i].id)
          }
          return next
        })
      }
    }, speed)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, speed, method, dpSteps, matrixSteps, treeNodes])

  // Sync revealed nodes with currentStep for naive
  useEffect(() => {
    if (method === 'naive') {
      const newRevealed = new Set<number>()
      for (let i = 0; i <= Math.min(currentStep, treeNodes.length - 1); i++) {
        newRevealed.add(treeNodes[i].id)
      }
      setRevealedNodes(newRevealed)
    }
  }, [currentStep, method, treeNodes])

  const maxSteps = method === 'dp' ? dpSteps.length : method === 'matrix' ? matrixSteps.length : treeNodes.length

  const togglePlay = useCallback(() => {
    if (currentStep >= maxSteps - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(prev => !prev)
    }
  }, [currentStep, maxSteps])

  const stepForward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep < maxSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, maxSteps])

  const stepBackward = useCallback(() => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    if (method === 'naive') {
      setRevealedNodes(new Set())
    }
  }, [method])

  const effectiveN = method === 'naive' ? Math.min(n, 8) : n

  return (
    <div className="visualization-container">
      {/* Method selector */}
      <div className="viz-controls">
        <select
          value={method}
          onChange={e => setMethod(e.target.value as Method)}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        >
          <option value="naive">朴素递归（递归树）</option>
          <option value="dp">动态规划（DP 表）</option>
          <option value="matrix">矩阵快速幂</option>
        </select>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          n =
          <input
            type="range"
            min={method === 'naive' ? 2 : 2}
            max={method === 'naive' ? 8 : 30}
            value={effectiveN}
            onChange={e => setN(Number(e.target.value))}
            style={{ width: '120px' }}
          />
          <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>
            {effectiveN}
          </span>
        </label>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : currentStep >= maxSteps - 1 ? '重新播放' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= maxSteps - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={reset}>
          重置
        </button>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          速度:
          <input
            type="range"
            min="100"
            max="1500"
            step="100"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          {speed}ms
        </label>
      </div>

      {/* Progress */}
      {maxSteps > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0 0.25rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: '60px' }}>
            {currentStep + 1}/{maxSteps}
          </span>
          <input
            type="range"
            min="0"
            max={maxSteps - 1}
            value={currentStep}
            onChange={e => {
              setIsPlaying(false)
              setCurrentStep(Number(e.target.value))
            }}
            style={{ flex: 1 }}
          />
        </div>
      )}

      {/* Visualization area */}
      <div
        className="viz-canvas"
        style={{
          position: 'relative',
          overflow: 'auto',
          padding: '1rem',
          minHeight: '320px',
        }}
      >
        {method === 'naive' && (
          <NaiveTreeView nodes={treeNodes} revealedNodes={revealedNodes} n={effectiveN} />
        )}

        {method === 'dp' && dpSteps.length > 0 && (
          <DPTableView steps={dpSteps} currentStep={Math.min(currentStep, dpSteps.length - 1)} n={n} />
        )}

        {method === 'matrix' && matrixSteps.length > 0 && (
          <MatrixView steps={matrixSteps} currentStep={Math.min(currentStep, matrixSteps.length - 1)} n={n} />
        )}
      </div>

      {/* Legend & info */}
      <div className="viz-info">
        {method === 'naive' && (
          <div>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>方法：</strong>朴素递归 — 直接按定义 F(n) = F(n-1) + F(n-2) 递归计算
            </div>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>时间复杂度：</strong>O(2^n) — 存在大量重复计算
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '2px', display: 'inline-block' }} />
                当前节点
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '12px', height: '12px', background: 'var(--warning)', borderRadius: '2px', display: 'inline-block' }} />
                重复子问题
              </span>
              <span>步骤: {currentStep + 1} / {maxSteps}</span>
            </div>
          </div>
        )}

        {method === 'dp' && (
          <div>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>方法：</strong>自底向上动态规划 — 从 F(0) 和 F(1) 开始逐步计算
            </div>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>当前操作：</strong>{dpSteps[Math.min(currentStep, dpSteps.length - 1)]?.description || '等待开始...'}
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '2px', display: 'inline-block' }} />
                当前计算
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '12px', height: '12px', background: 'var(--warning)', borderRadius: '2px', display: 'inline-block' }} />
                依赖项
              </span>
              <span>步骤: {currentStep + 1} / {maxSteps}</span>
            </div>
          </div>
        )}

        {method === 'matrix' && (
          <div>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>方法：</strong>矩阵快速幂 — 利用 [[1,1],[1,0]]^n 的 [0][1] 元素 = F(n)
            </div>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>当前操作：</strong>{matrixSteps[Math.min(currentStep, matrixSteps.length - 1)]?.description || '等待开始...'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              <span>步骤: {currentStep + 1} / {maxSteps}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Naive recursion tree view
function NaiveTreeView({ nodes, revealedNodes, n }: { nodes: TreeNode[]; revealedNodes: Set<number>; n: number }) {
  if (nodes.length === 0) return null

  // Find bounds
  let minX = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const node of nodes) {
    minX = Math.min(minX, node.x)
    maxX = Math.max(maxX, node.x)
    maxY = Math.max(maxY, node.y)
  }

  const padding = 40
  const width = maxX - minX + padding * 2
  const height = maxY + padding * 2 + 40
  const offsetX = -minX + padding

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        F({n}) 的递归调用树 (限制 n &lt;= 8 以保证可读性)
      </div>
      <svg width={Math.max(width, 300)} height={Math.max(height, 200)} style={{ display: 'block', margin: '0 auto' }}>
        {/* Edges */}
        {nodes.map(node => {
          if (!revealedNodes.has(node.id)) return null
          if (node.parentId === null) return null
          const parent = nodes[node.parentId]
          if (!revealedNodes.has(parent.id)) return null
          return (
            <line
              key={`edge-${node.id}`}
              x1={parent.x + offsetX}
              y1={parent.y + 16}
              x2={node.x + offsetX}
              y2={node.y - 4}
              stroke="var(--border)"
              strokeWidth="1.5"
            />
          )
        })}

        {/* Nodes */}
        {nodes.map(node => {
          if (!revealedNodes.has(node.id)) return null

          const isCurrent = node.id === [...revealedNodes].pop()
          const fillColor = node.isDuplicate
            ? 'var(--warning)'
            : isCurrent
              ? 'var(--accent)'
              : 'var(--bg-card)'
          const textColor = (node.isDuplicate || isCurrent) ? '#fff' : 'var(--text-primary)'
          const borderColor = node.isDuplicate
            ? 'var(--warning)'
            : isCurrent
              ? 'var(--accent-hover)'
              : 'var(--border)'

          return (
            <g key={node.id}>
              <rect
                x={node.x + offsetX - 20}
                y={node.y - 12}
                width="40"
                height="24"
                rx="4"
                fill={fillColor}
                stroke={borderColor}
                strokeWidth={isCurrent || node.isDuplicate ? 2 : 1}
              />
              <text
                x={node.x + offsetX}
                y={node.y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isCurrent ? 'bold' : 'normal'}
                fill={textColor}
              >
                F({node.n})
                {node.result !== null ? `=${node.result}` : ''}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// DP table view
function DPTableView({ steps, currentStep, n }: { steps: DPStep[]; currentStep: number; n: number }) {
  const step = steps[currentStep]
  if (!step) return null

  const dpTable = step.dpTable
  const highlightedIndex = step.index

  return (
    <div>
      <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        F(0) 到 F({n}) 的 DP 表格
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        {Array.from({ length: n + 1 }, (_, i) => {
          const isFilled = i < dpTable.length
          const isCurrent = i === highlightedIndex
          const isDep = i === highlightedIndex - 1 || i === highlightedIndex - 2

          const bg = isCurrent
            ? 'var(--accent)'
            : isDep
              ? 'var(--warning)'
              : isFilled
                ? 'var(--bg-card)'
                : 'var(--bg-secondary)'
          const textColor = (isCurrent || isDep) ? '#fff' : 'var(--text-primary)'
          const border = isCurrent
            ? '2px solid var(--accent-hover)'
            : isDep
              ? '2px solid var(--warning)'
              : '1px solid var(--border)'

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                i={i}
              </span>
              <div
                style={{
                  width: '44px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: bg,
                  border,
                  borderRadius: 'var(--radius)',
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  fontSize: isCurrent ? '1rem' : '0.85rem',
                  color: textColor,
                  transition: 'all 0.2s ease',
                }}
              >
                {isFilled ? dpTable[i] : '?'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Formula display */}
      {highlightedIndex >= 2 && (
        <div
          style={{
            textAlign: 'center',
            padding: '0.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
          }}
        >
          <span style={{ color: 'var(--accent)' }}>dp[{highlightedIndex}]</span>
          {' = '}
          <span style={{ color: 'var(--warning)' }}>dp[{highlightedIndex - 1}]</span>
          {' + '}
          <span style={{ color: 'var(--warning)' }}>dp[{highlightedIndex - 2}]</span>
          {' = '}
          <span style={{ color: 'var(--warning)' }}>{step.prev1}</span>
          {' + '}
          <span style={{ color: 'var(--warning)' }}>{step.prev2}</span>
          {' = '}
          <strong>{step.value}</strong>
        </div>
      )}

      {highlightedIndex < 2 && (
        <div
          style={{
            textAlign: 'center',
            padding: '0.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
          }}
        >
          <span style={{ color: 'var(--accent)' }}>dp[{highlightedIndex}]</span>
          {' = '}
          <strong>{step.value}</strong>
          {' (基础情况)'}
        </div>
      )}
    </div>
  )
}

// Matrix view
function MatrixView({ steps, currentStep, n }: { steps: MatrixStep[]; currentStep: number; n: number }) {
  const step = steps[currentStep]
  if (!step) return null

  const MatrixDisplay = ({ matrix, label, highlight }: {
    matrix: [number, number, number, number]
    label: string
    highlight?: boolean
  }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <table
        style={{
          borderCollapse: 'collapse',
          margin: '0 auto',
          fontSize: '0.85rem',
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...cellStyle, borderColor: highlight ? 'var(--accent)' : 'var(--border)' }}>{matrix[0]}</td>
            <td style={{ ...cellStyle, borderColor: highlight ? 'var(--accent)' : 'var(--border)' }}>{matrix[1]}</td>
          </tr>
          <tr>
            <td style={{ ...cellStyle, borderColor: highlight ? 'var(--accent)' : 'var(--border)' }}>{matrix[2]}</td>
            <td style={{ ...cellStyle, borderColor: highlight ? 'var(--accent)' : 'var(--border)' }}>{matrix[3]}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        计算 F({n}) — 矩阵快速幂
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}
      >
        <MatrixDisplay matrix={step.resultMatrix} label="结果矩阵" highlight />
        <MatrixDisplay matrix={step.baseMatrix} label="基础矩阵" />
      </div>

      <div
        style={{
          textAlign: 'center',
          padding: '0.5rem',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前指数 n =</strong> {step.exp} {step.isOdd ? '(奇数 → 乘入结果)' : '(偶数 → 跳过)'}
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          F({n}) = 结果矩阵的 [0][1] = {step.resultMatrix[1]}
        </div>
      </div>

      {/* Steps summary */}
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          justifyContent: 'center',
        }}
      >
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius)',
              fontSize: '0.7rem',
              background: i === currentStep
                ? 'var(--accent)'
                : i < currentStep
                  ? 'var(--bg-card)'
                  : 'var(--bg-secondary)',
              color: i === currentStep ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${i === currentStep ? 'var(--accent-hover)' : 'var(--border)'}`,
            }}
          >
            {s.isOdd ? `n=${s.exp}*` : `n=${s.exp}`}
          </div>
        ))}
      </div>
    </div>
  )
}

const cellStyle: React.CSSProperties = {
  width: '44px',
  height: '36px',
  textAlign: 'center',
  border: '2px solid var(--border)',
  background: 'var(--bg-card)',
  padding: '4px',
}
