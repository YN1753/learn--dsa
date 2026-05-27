import { useState, useCallback, useMemo } from 'react'

interface DPStep {
  mask: number
  city: number
  value: number
  fromMask: number
  fromCity: number
  isNewBest: boolean
}

function toBinary(mask: number, n: number): string {
  return mask.toString(2).padStart(n, '0')
}

function countBits(x: number): number {
  let c = 0
  for (; x; x &= x - 1) c++
  return c
}

const DEFAULT_DIST: number[][] = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
]

export default function BitmaskDPVisualization() {
  const n = 4
  const [dist] = useState<number[][]>(DEFAULT_DIST)
  const [steps, setSteps] = useState<DPStep[]>([])
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [dpTable, setDpTable] = useState<number[][]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [description, setDescription] = useState('状压DP可视化 - TSP 旅行商问题（4 城市）')
  const [highlightedMask, setHighlightedMask] = useState<number>(-1)

  const INF = Number.MAX_SAFE_INTEGER

  const computeAllSteps = useCallback((): DPStep[] => {
    const allSteps: DPStep[] = []
    const dp: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(INF))
    dp[1][0] = 0

    for (let mask = 1; mask < (1 << n); mask++) {
      for (let i = 0; i < n; i++) {
        if (dp[mask][i] === INF) continue
        if ((mask & (1 << i)) === 0) continue
        for (let j = 0; j < n; j++) {
          if (mask & (1 << j)) continue
          const next = mask | (1 << j)
          const newCost = dp[mask][i] + dist[i][j]
          const isNewBest = newCost < dp[next][j]
          if (isNewBest) {
            dp[next][j] = newCost
          }
          allSteps.push({
            mask: next,
            city: j,
            value: dp[next][j],
            fromMask: mask,
            fromCity: i,
            isNewBest,
          })
        }
      }
    }

    return allSteps
  }, [n, dist])

  const handleGenerateSteps = useCallback(() => {
    const allSteps = computeAllSteps()
    setSteps(allSteps)
    setCurrentStep(-1)

    const dp: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(INF))
    dp[1][0] = 0
    setDpTable(dp)
    setIsRunning(false)
    setHighlightedMask(-1)
    setDescription(`已生成 ${allSteps.length} 个转移步骤，点击「单步执行」开始`)
  }, [n, computeAllSteps])

  const applyStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return

    const step = steps[stepIndex]
    setDpTable(prev => {
      const next = prev.map(row => [...row])
      if (step.isNewBest) {
        next[step.mask][step.city] = step.value
      }
      return next
    })
    setHighlightedMask(step.mask)

    const fromBits = toBinary(step.fromMask, n)
    const toBits = toBinary(step.mask, n)
    if (step.isNewBest) {
      setDescription(
        `步骤 ${stepIndex + 1}: dp[${fromBits}][${step.fromCity}] + dist[${step.fromCity}][${step.city}] = ${step.value} → 更新 dp[${toBits}][${step.city}]`
      )
    } else {
      setDescription(
        `步骤 ${stepIndex + 1}: dp[${fromBits}][${step.fromCity}] + dist[${step.fromCity}][${step.city}] = ${step.value}（未更新，当前最优更小）`
      )
    }
  }, [steps, n])

  const handleStepForward = useCallback(() => {
    if (currentStep >= steps.length - 1) return
    const nextStep = currentStep + 1
    setCurrentStep(nextStep)
    applyStep(nextStep)
  }, [currentStep, steps.length, applyStep])

  const handleRunAll = useCallback(() => {
    if (steps.length === 0) return
    setIsRunning(true)

    const dp: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(INF))
    dp[1][0] = 0

    let idx = 0
    const interval = setInterval(() => {
      if (idx >= steps.length) {
        clearInterval(interval)
        setIsRunning(false)
        const full = (1 << n) - 1
        let ans = INF
        for (let i = 1; i < n; i++) {
          ans = Math.min(ans, dp[full][i] + dist[i][0])
        }
        setDescription(`计算完成！最短路径长度 = ${ans}`)
        return
      }

      const step = steps[idx]
      if (step.isNewBest) {
        dp[step.mask][step.city] = step.value
      }
      setDpTable(dp.map(row => [...row]))
      setHighlightedMask(step.mask)
      setCurrentStep(idx)

      const fromBits = toBinary(step.fromMask, n)
      const toBits = toBinary(step.mask, n)
      if (step.isNewBest) {
        setDescription(
          `步骤 ${idx + 1}: dp[${fromBits}][${step.fromCity}] + dist[${step.fromCity}][${step.city}] = ${step.value} -> dp[${toBits}][${step.city}]`
        )
      }

      idx++
    }, speed)
  }, [steps, n, dist, speed])

  const handleReset = useCallback(() => {
    setSteps([])
    setCurrentStep(-1)
    setDpTable([])
    setIsRunning(false)
    setHighlightedMask(-1)
    setDescription('已重置')
  }, [])

  const finalAnswer = useMemo(() => {
    if (dpTable.length === 0) return null
    const full = (1 << n) - 1
    let ans = INF
    let lastCity = -1
    for (let i = 1; i < n; i++) {
      if (dpTable[full] && dpTable[full][i] < INF) {
        const cost = dpTable[full][i] + dist[i][0]
        if (cost < ans) {
          ans = cost
          lastCity = i
        }
      }
    }
    return ans < INF ? { cost: ans, lastCity } : null
  }, [dpTable, n, dist])

  const currentStepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null

  return (
    <div className="visualization-container">
      <div className="viz-controls" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <button className="btn btn-primary" onClick={handleGenerateSteps}>
          生成步骤
        </button>
        <button
          className="btn btn-primary"
          onClick={handleStepForward}
          disabled={isRunning || steps.length === 0 || currentStep >= steps.length - 1}
        >
          单步执行
        </button>
        <button
          className="btn btn-primary"
          onClick={handleRunAll}
          disabled={isRunning || steps.length === 0}
        >
          自动运行
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ padding: '2px 4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)' }}
          >
            <option value={1000}>慢</option>
            <option value={500}>中</option>
            <option value={200}>快</option>
            <option value={50}>极快</option>
          </select>
        </label>
      </div>

      {/* 距离矩阵 */}
      <div style={{ padding: '0.5rem 1rem' }}>
        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
          城市距离矩阵:
        </div>
        <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${n + 1}, auto)`, gap: '2px', fontSize: '0.85rem', fontFamily: 'Consolas, Monaco, monospace' }}>
          <div></div>
          {Array.from({ length: n }, (_, i) => (
            <div key={`h${i}`} style={{ textAlign: 'center', padding: '2px 8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
              {i}
            </div>
          ))}
          {dist.map((row, i) => (
            <>
              <div key={`l${i}`} style={{ textAlign: 'center', padding: '2px 8px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                {i}
              </div>
              {row.map((val, j) => (
                <div
                  key={`${i}-${j}`}
                  style={{
                    textAlign: 'center',
                    padding: '2px 8px',
                    background: i === j ? 'var(--bg-card)' : 'var(--bg-main)',
                    borderRadius: '2px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {i === j ? '-' : val}
                </div>
              ))}
            </>
          ))}
        </div>
      </div>

      {/* 当前状态二进制表示 */}
      {currentStepData && (
        <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
              前驱状态:
            </span>
            <span style={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '1.1rem',
              padding: '2px 8px',
              background: 'var(--bg-card)',
              borderRadius: '4px',
              border: '1px solid var(--border)',
            }}>
              {toBinary(currentStepData.fromMask, n)}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0.3rem' }}>
              城市 {currentStepData.fromCity}
            </span>
          </div>
          <div style={{ fontSize: '1.2rem', color: 'var(--accent, #3b82f6)' }}>→</div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
              新状态:
            </span>
            <span style={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '1.1rem',
              padding: '2px 8px',
              background: currentStepData.isNewBest ? '#22c55e22' : 'var(--bg-card)',
              borderRadius: '4px',
              border: `1px solid ${currentStepData.isNewBest ? '#22c55e' : 'var(--border)'}`,
            }}>
              {toBinary(currentStepData.mask, n)}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0.3rem' }}>
              城市 {currentStepData.city}
            </span>
            <span style={{
              marginLeft: '0.5rem',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.9rem',
              color: currentStepData.isNewBest ? '#22c55e' : 'var(--text-secondary)',
            }}>
              值 = {currentStepData.value}
            </span>
          </div>
        </div>
      )}

      {/* DP 表格 */}
      <div className="viz-canvas" style={{ padding: '1rem', overflowX: 'auto' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          DP 表 (dp[mask][city]):
        </div>
        {dpTable.length > 0 ? (
          <div style={{ display: 'inline-grid', gridTemplateColumns: `120px repeat(${n}, 80px)`, gap: '2px', fontSize: '0.8rem', fontFamily: 'Consolas, Monaco, monospace' }}>
            {/* 表头 */}
            <div style={{ padding: '4px', fontWeight: 'bold', color: 'var(--text-secondary)', textAlign: 'center' }}>
              mask (bin)
            </div>
            {Array.from({ length: n }, (_, i) => (
              <div key={`ch${i}`} style={{ padding: '4px', fontWeight: 'bold', color: 'var(--text-secondary)', textAlign: 'center' }}>
                城市 {i}
              </div>
            ))}

            {/* 数据行 - 只显示有值的行 */}
            {dpTable
              .map((row, mask) => ({ row, mask }))
              .filter(({ mask }) => {
                if (mask === 0) return false
                const hasValue = dpTable[mask].some(v => v < INF)
                return hasValue || highlightedMask === mask
              })
              .map(({ row, mask }) => (
                <>
                  <div
                    key={`r${mask}`}
                    style={{
                      padding: '4px 8px',
                      background: highlightedMask === mask ? 'var(--accent, #3b82f6)22' : 'var(--bg-card)',
                      borderRadius: '2px',
                      border: highlightedMask === mask ? '1px solid var(--accent, #3b82f6)' : '1px solid transparent',
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                    }}
                  >
                    {toBinary(mask, n)}
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                      ({countBits(mask)})
                    </span>
                  </div>
                  {row.map((val, city) => (
                    <div
                      key={`${mask}-${city}`}
                      style={{
                        padding: '4px',
                        textAlign: 'center',
                        background: val < INF
                          ? (highlightedMask === mask ? '#22c55e22' : 'var(--bg-main)')
                          : 'var(--bg-card)',
                        borderRadius: '2px',
                        color: val < INF ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {val < INF ? val : '∞'}
                    </div>
                  ))}
                </>
              ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
            点击「生成步骤」开始演示
          </div>
        )}

        {/* 最终答案 */}
        {finalAnswer && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#22c55e22',
            borderRadius: '8px',
            border: '1px solid #22c55e',
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#22c55e' }}>
              TSP 最短路径长度: {finalAnswer.cost}
            </div>
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>进度：</strong>
        {steps.length > 0 ? `${currentStep + 1} / ${steps.length} 步` : '未开始'}
        {currentStepData && (
          <span style={{ marginLeft: '1rem' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
            更新了 DP 值
          </span>
        )}
      </div>
    </div>
  )
}
