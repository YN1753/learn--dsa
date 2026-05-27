import { useState, useEffect, useRef, useCallback } from 'react'

const INF = Infinity
const NODE_NAMES = ['A', 'B', 'C', 'D', 'E']

interface FloydStep {
  k: number
  i: number
  j: number
  dist: number[][]
  updated: boolean
  oldValue: number
  newValue: number
  description: string
  phase: string
}

const COLORS = {
  cellDefault: '#FFFFFF',
  cellHighlight: '#FEF3C7',
  cellUpdated: '#BBF7D0',
  cellDiagonal: '#E5E7EB',
  cellInfinity: '#F3F4F6',
  cellK: '#DBEAFE',
  cellI: '#E0E7FF',
  cellJ: '#EDE9FE',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textUpdated: '#059669',
  textInfinity: '#9CA3AF',
  textNegative: '#EF4444',
  background: '#F9FAFB',
  border: '#D1D5DB',
  btnPrimary: '#3B82F6',
  btnSecondary: '#6B7280',
  btnDanger: '#EF4444',
}

function generateFloydSteps(initialDist: number[][]): FloydStep[] {
  const steps: FloydStep[] = []
  const n = initialDist.length
  const dist = initialDist.map(row => [...row])

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j || i === k || j === k) continue
        if (dist[i][k] === INF || dist[k][j] === INF) continue

        const oldValue = dist[i][j]
        const newValue = dist[i][k] + dist[k][j]
        const updated = newValue < oldValue

        if (updated) {
          dist[i][j] = newValue
        }

        steps.push({
          k, i, j,
          dist: dist.map(row => [...row]),
          updated,
          oldValue,
          newValue,
          description: updated
            ? `dist[${NODE_NAMES[i]}][${NODE_NAMES[j]}] = min(${oldValue === INF ? '∞' : oldValue}, ${dist[i][k]}+${dist[k][j]}) = ${newValue} ← 更新!`
            : `dist[${NODE_NAMES[i]}][${NODE_NAMES[j]}] = min(${oldValue === INF ? '∞' : oldValue}, ${dist[i][k]}+${dist[k][j]}) = ${oldValue === INF ? '∞' : oldValue} (不更新)`,
          phase: `阶段 k=${k} (${NODE_NAMES[k]}): 检查 ${NODE_NAMES[i]}→${NODE_NAMES[k]}→${NODE_NAMES[j]}`
        })
      }
    }
  }

  return steps
}

export default function FloydWarshallVisualization() {
  const initialDist = useRef<number[][]>([
    [0,   3,   8, INF, -4],
    [INF, 0,   INF, 1,   7],
    [INF, 4,   0,   INF, INF],
    [2,   INF, INF, 0,   INF],
    [INF, INF, INF, 6,   0],
  ])

  const [steps, setSteps] = useState<FloydStep[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  // 当前状态
  const [dist, setDist] = useState<number[][]>(initialDist.current.map(r => [...r]))
  const [currentK, setCurrentK] = useState(-1)
  const [currentI, setCurrentI] = useState(-1)
  const [currentJ, setCurrentJ] = useState(-1)
  const [updated, setUpdated] = useState(false)
  const [description, setDescription] = useState('点击播放开始 Floyd-Warshall 算法演示')
  const [phase, setPhase] = useState('就绪')

  // 初始化步骤
  useEffect(() => {
    const generated = generateFloydSteps(initialDist.current)
    setSteps(generated)
  }, [])

  // 更新当前步骤状态
  useEffect(() => {
    if (currentStep < 0) {
      setDist(initialDist.current.map(r => [...r]))
      setCurrentK(-1)
      setCurrentI(-1)
      setCurrentJ(-1)
      setUpdated(false)
      setDescription('点击播放开始 Floyd-Warshall 算法演示')
      setPhase('就绪')
      return
    }
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setDist(step.dist)
      setCurrentK(step.k)
      setCurrentI(step.i)
      setCurrentJ(step.j)
      setUpdated(step.updated)
      setDescription(step.description)
      setPhase(step.phase)
    }
  }, [currentStep, steps])

  // 自动播放
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = window.setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, speed)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps.length, speed])

  const handlePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(-1)
    }
    setIsPlaying(true)
  }, [currentStep, steps.length])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(-1)
  }, [])

  const handleStepForward = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps.length])

  const handleStepBackward = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const getCellStyle = (i: number, j: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '8px 12px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
      border: `1px solid ${COLORS.border}`,
      transition: 'all 0.3s ease',
      minWidth: '50px',
    }

    if (i === j) {
      return { ...base, backgroundColor: COLORS.cellDiagonal, color: COLORS.textSecondary }
    }
    if (i === currentK || j === currentK) {
      return { ...base, backgroundColor: COLORS.cellK }
    }
    if (i === currentI && j === currentJ && updated) {
      return { ...base, backgroundColor: COLORS.cellUpdated, color: COLORS.textUpdated }
    }
    if (i === currentI) {
      return { ...base, backgroundColor: COLORS.cellI }
    }
    if (j === currentJ) {
      return { ...base, backgroundColor: COLORS.cellJ }
    }
    return { ...base, backgroundColor: COLORS.cellDefault }
  }

  const formatValue = (val: number): string => {
    if (val === INF) return '∞'
    if (val < 0) return String(val)
    return String(val)
  }

  const renderDistMatrix = () => {
    return (
      <div style={{ overflow: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', margin: '0 auto' }}>
          <thead>
            <tr>
              <th style={{
                padding: '8px 12px',
                backgroundColor: '#F3F4F6',
                border: `1px solid ${COLORS.border}`,
                fontSize: '13px',
                color: COLORS.textSecondary,
              }}></th>
              {NODE_NAMES.map((name, idx) => (
                <th key={idx} style={{
                  padding: '8px 12px',
                  backgroundColor: '#F3F4F6',
                  border: `1px solid ${COLORS.border}`,
                  fontSize: '13px',
                  color: COLORS.textPrimary,
                  fontWeight: 'bold',
                }}>
                  {name}
                  {idx === currentK && <span style={{ color: COLORS.btnPrimary, marginLeft: 4 }}>←k</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dist.map((row, i) => (
              <tr key={i}>
                <td style={{
                  padding: '8px 12px',
                  backgroundColor: '#F3F4F6',
                  border: `1px solid ${COLORS.border}`,
                  fontSize: '13px',
                  color: COLORS.textPrimary,
                  fontWeight: 'bold',
                }}>
                  {NODE_NAMES[i]}
                  {i === currentI && <span style={{ color: '#6366F1', marginLeft: 4 }}>←i</span>}
                </td>
                {row.map((val, j) => (
                  <td key={j} style={getCellStyle(i, j)}>
                    <span style={{
                      color: val < 0 ? COLORS.textNegative : val === INF ? COLORS.textInfinity : COLORS.textPrimary,
                    }}>
                      {formatValue(val)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderLegend = () => (
    <div style={{ marginTop: '15px' }}>
      <h4 style={{ margin: '0 0 10px 0', color: COLORS.textPrimary, fontSize: '14px' }}>图例</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: COLORS.cellDiagonal, border: `1px solid ${COLORS.border}`, borderRadius: '3px' }} />
          <span>对角线 (dist[i][i] = 0)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: COLORS.cellK, border: `1px solid ${COLORS.border}`, borderRadius: '3px' }} />
          <span>中间顶点 k 所在行列</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: COLORS.cellI, border: `1px solid ${COLORS.border}`, borderRadius: '3px' }} />
          <span>起始顶点 i 所在行</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: COLORS.cellJ, border: `1px solid ${COLORS.border}`, borderRadius: '3px' }} />
          <span>目标顶点 j 所在列</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: COLORS.cellUpdated, border: `1px solid ${COLORS.border}`, borderRadius: '3px' }} />
          <span>距离被更新</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="viz-canvas" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: COLORS.background,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* 标题 */}
      <div style={{ padding: '12px 15px', borderBottom: `1px solid ${COLORS.border}` }}>
        <h2 style={{ margin: 0, color: COLORS.textPrimary, fontSize: '18px' }}>Floyd-Warshall 算法</h2>
        <p style={{ margin: '4px 0 0 0', color: COLORS.textSecondary, fontSize: '13px' }}>
          全源最短路径：逐步展示距离矩阵的更新过程
        </p>
      </div>

      {/* 主内容 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 矩阵区域 */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflow: 'auto',
        }}>
          {renderDistMatrix()}
        </div>

        {/* 信息面板 */}
        <div className="viz-info" style={{
          width: '280px',
          borderLeft: `1px solid ${COLORS.border}`,
          padding: '15px',
          overflowY: 'auto',
          backgroundColor: 'white',
        }}>
          {/* 当前阶段 */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary, fontSize: '14px' }}>当前阶段</h4>
            <div style={{
              padding: '8px 10px',
              backgroundColor: '#DBEAFE',
              borderRadius: '6px',
              fontSize: '13px',
              color: COLORS.textPrimary,
            }}>
              {phase}
            </div>
          </div>

          {/* 操作说明 */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary, fontSize: '14px' }}>操作详情</h4>
            <div style={{
              padding: '8px 10px',
              backgroundColor: updated ? '#D1FAE5' : '#F3F4F6',
              borderRadius: '6px',
              fontSize: '13px',
              lineHeight: '1.5',
              color: COLORS.textPrimary,
            }}>
              {description}
            </div>
          </div>

          {/* 当前检查的三元组 */}
          {currentK >= 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary, fontSize: '14px' }}>检查三元组</h4>
              <div style={{
                padding: '8px 10px',
                backgroundColor: '#FEF3C7',
                borderRadius: '6px',
                fontSize: '13px',
                textAlign: 'center',
              }}>
                <span style={{ color: '#6366F1', fontWeight: 'bold' }}>{NODE_NAMES[currentI]}</span>
                {' → '}
                <span style={{ color: COLORS.btnPrimary, fontWeight: 'bold' }}>{NODE_NAMES[currentK]}</span>
                {' → '}
                <span style={{ color: '#8B5CF6', fontWeight: 'bold' }}>{NODE_NAMES[currentJ]}</span>
                <div style={{ marginTop: '4px', fontSize: '12px', color: COLORS.textSecondary }}>
                  {updated ? `距离更新: ${formatValue(steps[currentStep].oldValue)} → ${formatValue(steps[currentStep].newValue)}` : '未更新'}
                </div>
              </div>
            </div>
          )}

          {/* 算法统计 */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary, fontSize: '14px' }}>算法信息</h4>
            <div style={{ fontSize: '12px', color: COLORS.textSecondary, lineHeight: '1.8' }}>
              <div>顶点数: {NODE_NAMES.length}</div>
              <div>当前步骤: {currentStep + 1} / {steps.length}</div>
              <div>时间复杂度: O(V³) = O({NODE_NAMES.length}³) = O({NODE_NAMES.length * NODE_NAMES.length * NODE_NAMES.length})</div>
              <div>空间复杂度: O(V²) = O({NODE_NAMES.length * NODE_NAMES.length})</div>
            </div>
          </div>

          {renderLegend()}
        </div>
      </div>

      {/* 控制栏 */}
      <div className="viz-controls" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '12px 15px',
        borderTop: `1px solid ${COLORS.border}`,
        backgroundColor: 'white',
      }}>
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={currentStep < 0}
          style={{
            padding: '6px 14px',
            backgroundColor: currentStep < 0 ? '#E5E7EB' : COLORS.btnSecondary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep < 0 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          重置
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepBackward}
          disabled={currentStep <= 0}
          style={{
            padding: '6px 14px',
            backgroundColor: currentStep <= 0 ? '#E5E7EB' : COLORS.btnSecondary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep <= 0 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          上一步
        </button>
        <button
          className="btn btn-primary"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={steps.length === 0}
          style={{
            padding: '6px 20px',
            backgroundColor: isPlaying ? COLORS.btnDanger : COLORS.btnPrimary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: steps.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepForward}
          disabled={currentStep >= steps.length - 1}
          style={{
            padding: '6px 14px',
            backgroundColor: currentStep >= steps.length - 1 ? '#E5E7EB' : COLORS.btnSecondary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep >= steps.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          下一步
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '15px' }}>
          <span style={{ fontSize: '13px', color: COLORS.textSecondary }}>速度:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '13px',
            }}
          >
            <option value={2000}>慢速</option>
            <option value={800}>正常</option>
            <option value={400}>快速</option>
            <option value={150}>极快</option>
          </select>
        </div>
        <div style={{ marginLeft: '15px', fontSize: '13px', color: COLORS.textSecondary }}>
          步骤: {Math.max(0, currentStep + 1)} / {steps.length}
        </div>
      </div>
    </div>
  )
}
