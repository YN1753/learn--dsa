import { useState, useEffect, useRef, useCallback } from 'react'

type Phase = 'idle' | 'split' | 'enumerate-left' | 'enumerate-right' | 'sort' | 'match' | 'done'

interface SubsetInfo {
  indices: number[]
  sum: number
}

interface MatchResult {
  leftIdx: number
  rightIdx: number
  leftSum: number
  rightSum: number
}

interface AnimationStep {
  phase: Phase
  description: string
  leftSubsets: SubsetInfo[]
  rightSubsets: SubsetInfo[]
  leftActive: number
  rightActive: number
  sortedRight: number[]
  sortProgress: number
  matchResults: MatchResult[]
  currentMatchLeft: number
  currentMatchRightNeed: number
  matchCount: number
}

const DEFAULT_ARR = [3, 7, 1, 5, 9, 2, 8, 4]
const DEFAULT_TARGET = 12

function generateSteps(arr: number[], target: number): AnimationStep[] {
  const n = arr.length
  const mid = Math.floor(n / 2)
  const leftArr = arr.slice(0, mid)
  const rightArr = arr.slice(mid)
  const steps: AnimationStep[] = []

  // Generate all subsets for left and right
  const leftSubsets: SubsetInfo[] = []
  const rightSubsets: SubsetInfo[] = []

  for (let mask = 0; mask < (1 << mid); mask++) {
    const indices: number[] = []
    let sum = 0
    for (let i = 0; i < mid; i++) {
      if (mask & (1 << i)) {
        indices.push(i)
        sum += leftArr[i]
      }
    }
    leftSubsets.push({ indices, sum })
  }

  for (let mask = 0; mask < (1 << (n - mid)); mask++) {
    const indices: number[] = []
    let sum = 0
    for (let i = 0; i < n - mid; i++) {
      if (mask & (1 << i)) {
        indices.push(mid + i)
        sum += rightArr[i]
      }
    }
    rightSubsets.push({ indices, sum })
  }

  // Step: split
  steps.push({
    phase: 'split',
    description: `将数组分成两半：A=[${leftArr.join(',')}]，B=[${rightArr.join(',')}]`,
    leftSubsets: [],
    rightSubsets: [],
    leftActive: -1,
    rightActive: -1,
    sortedRight: [],
    sortProgress: 0,
    matchResults: [],
    currentMatchLeft: -1,
    currentMatchRightNeed: -1,
    matchCount: 0,
  })

  // Steps: enumerate left
  for (let i = 0; i < leftSubsets.length; i++) {
    const s = leftSubsets[i]
    const subsetStr = s.indices.length === 0 ? '{}' : `{${s.indices.map(j => arr[j]).join(',')}}`
    steps.push({
      phase: 'enumerate-left',
      description: `枚举 A 的子集 ${subsetStr}，和 = ${s.sum}`,
      leftSubsets: leftSubsets.slice(0, i + 1),
      rightSubsets: [],
      leftActive: i,
      rightActive: -1,
      sortedRight: [],
      sortProgress: 0,
      matchResults: [],
      currentMatchLeft: -1,
      currentMatchRightNeed: -1,
      matchCount: 0,
    })
  }

  // Steps: enumerate right
  for (let i = 0; i < rightSubsets.length; i++) {
    const s = rightSubsets[i]
    const subsetStr = s.indices.length === 0 ? '{}' : `{${s.indices.map(j => arr[j]).join(',')}}`
    steps.push({
      phase: 'enumerate-right',
      description: `枚举 B 的子集 ${subsetStr}，和 = ${s.sum}`,
      leftSubsets: [...leftSubsets],
      rightSubsets: rightSubsets.slice(0, i + 1),
      leftActive: -1,
      rightActive: i,
      sortedRight: [],
      sortProgress: 0,
      matchResults: [],
      currentMatchLeft: -1,
      currentMatchRightNeed: -1,
      matchCount: 0,
    })
  }

  // Step: sort right sums
  const sortedRight = rightSubsets.map(s => s.sum).sort((a, b) => a - b)
  for (let i = 0; i <= sortedRight.length; i++) {
    steps.push({
      phase: 'sort',
      description: i < sortedRight.length
        ? `排序 S_B: 插入 ${sortedRight[i]}`
        : `排序完成: [${sortedRight.join(', ')}]`,
      leftSubsets: [...leftSubsets],
      rightSubsets: [...rightSubsets],
      leftActive: -1,
      rightActive: -1,
      sortedRight: sortedRight.slice(0, i),
      sortProgress: i,
      matchResults: [],
      currentMatchLeft: -1,
      currentMatchRightNeed: -1,
      matchCount: 0,
    })
  }

  // Steps: match
  const matchResults: MatchResult[] = []
  let matchCount = 0

  for (let li = 0; li < leftSubsets.length; li++) {
    const ls = leftSubsets[li]
    const need = target - ls.sum
    let found = 0
    for (let ri = 0; ri < rightSubsets.length; ri++) {
      if (rightSubsets[ri].sum === need) {
        found++
      }
    }
    if (found > 0) {
      matchCount += found
      for (let ri = 0; ri < rightSubsets.length; ri++) {
        if (rightSubsets[ri].sum === need) {
          matchResults.push({
            leftIdx: li,
            rightIdx: ri,
            leftSum: ls.sum,
            rightSum: rightSubsets[ri].sum,
          })
        }
      }
      steps.push({
        phase: 'match',
        description: `在 S_A 中找到 x=${ls.sum}，需要 S_B 中有 ${need}，找到 ${found} 个匹配`,
        leftSubsets: [...leftSubsets],
        rightSubsets: [...rightSubsets],
        leftActive: li,
        rightActive: -1,
        sortedRight: [...sortedRight],
        sortProgress: sortedRight.length,
        matchResults: [...matchResults],
        currentMatchLeft: li,
        currentMatchRightNeed: need,
        matchCount,
      })
    }
  }

  // Done
  steps.push({
    phase: 'done',
    description: `完成！共找到 ${matchCount} 个子集的和为 ${target}`,
    leftSubsets: [...leftSubsets],
    rightSubsets: [...rightSubsets],
    leftActive: -1,
    rightActive: -1,
    sortedRight: [...sortedRight],
    sortProgress: sortedRight.length,
    matchResults: [...matchResults],
    currentMatchLeft: -1,
    currentMatchRightNeed: -1,
    matchCount,
  })

  return steps
}

function subsetLabel(indices: number[], arr: number[]): string {
  if (indices.length === 0) return '{}'
  return `{${indices.map(i => arr[i]).join(',')}}`
}

export default function MeetInTheMiddleVisualization() {
  const [arr] = useState<number[]>(DEFAULT_ARR)
  const [target] = useState<number>(DEFAULT_TARGET)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const current: AnimationStep = steps.length > 0
    ? steps[currentStep]
    : {
        phase: 'idle' as Phase,
        description: '点击「开始」运行折半搜索算法',
        leftSubsets: [],
        rightSubsets: [],
        leftActive: -1,
        rightActive: -1,
        sortedRight: [],
        sortProgress: 0,
        matchResults: [],
        currentMatchLeft: -1,
        currentMatchRightNeed: -1,
        matchCount: 0,
      }

  const handleStart = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const allSteps = generateSteps(arr, target)
    setSteps(allSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [arr, target])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else if (steps.length > 0 && currentStep < steps.length - 1) {
      setIsPlaying(true)
    }
  }

  const handleStepForward = () => {
    if (steps.length === 0) return
    setIsPlaying(false)
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
  }

  const mid = Math.floor(arr.length / 2)

  const phaseColors: Record<Phase, string> = {
    idle: '#6b7280',
    split: '#8b5cf6',
    'enumerate-left': '#3b82f6',
    'enumerate-right': '#10b981',
    sort: '#f59e0b',
    match: '#ef4444',
    done: '#22c55e',
  }

  const phaseLabels: Record<Phase, string> = {
    idle: '就绪',
    split: '分割',
    'enumerate-left': '枚举左半',
    'enumerate-right': '枚举右半',
    sort: '排序',
    match: '匹配',
    done: '完成',
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始
        </button>
        <button className="btn btn-secondary" onClick={handleStepForward} disabled={isPlaying || steps.length === 0}>
          单步
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length - 1}>
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
      </div>

      {/* Phase indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem',
        padding: '0.5rem 0.75rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
      }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>当前阶段:</span>
        <span style={{
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: '12px',
          background: phaseColors[current.phase],
          color: '#fff',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}>
          {phaseLabels[current.phase]}
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          步骤 {steps.length > 0 ? currentStep + 1 : 0} / {steps.length}
        </span>
      </div>

      {/* Array visualization */}
      <div style={{
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
      }}>
        <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
          原始数组 (目标值 = {target}):
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {arr.map((val, idx) => {
            const isLeft = idx < mid
            const isActiveLeft = current.phase === 'enumerate-left' && current.leftActive >= 0 &&
              current.leftSubsets[current.leftActive]?.indices.includes(idx)
            const isActiveRight = current.phase === 'enumerate-right' && current.rightActive >= 0 &&
              current.rightSubsets[current.rightActive]?.indices.includes(idx)
            const isActiveMatch = current.phase === 'match' && current.matchResults.length > 0
            const lastMatch = current.matchResults[current.matchResults.length - 1]
            const inMatchLeft = isActiveMatch && lastMatch && current.leftSubsets[lastMatch.leftIdx]?.indices.includes(idx)
            const inMatchRight = isActiveMatch && lastMatch && current.rightSubsets[lastMatch.rightIdx]?.indices.includes(idx)

            let bg = isLeft ? '#1e3a5f' : '#1a3a2e'
            let border = isLeft ? '#3b82f6' : '#10b981'
            if (isActiveLeft || inMatchLeft) { bg = '#3b82f6'; border = '#60a5fa' }
            if (isActiveRight || inMatchRight) { bg = '#10b981'; border = '#34d399' }

            return (
              <div key={idx} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                  {isLeft ? `A${idx}` : `B${idx - mid}`}
                </span>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  background: bg,
                  border: `2px solid ${border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                }}>
                  {val}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
            左半 A
          </span>
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: '#10b981', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
            右半 B
          </span>
        </div>
      </div>

      {/* Subset and result panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        {/* Left subsets */}
        <div style={{
          padding: '0.75rem 1rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          maxHeight: 180,
          overflowY: 'auto',
        }}>
          <div style={{ marginBottom: '0.5rem', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600 }}>
            左半子集和 S_A ({current.leftSubsets.length} / {1 << mid})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {current.leftSubsets.map((s, i) => (
              <span key={i} style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: i === current.leftActive || i === current.currentMatchLeft ? '#3b82f6' : '#1e3a5f',
                color: '#fff',
                fontSize: '0.75rem',
                fontFamily: 'Consolas, Monaco, monospace',
                border: i === current.leftActive || i === current.currentMatchLeft ? '1px solid #60a5fa' : '1px solid var(--border)',
              }}>
                {subsetLabel(s.indices, arr)}={s.sum}
              </span>
            ))}
          </div>
        </div>

        {/* Right subsets */}
        <div style={{
          padding: '0.75rem 1rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          maxHeight: 180,
          overflowY: 'auto',
        }}>
          <div style={{ marginBottom: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
            右半子集和 S_B ({current.rightSubsets.length} / {1 << (arr.length - mid)})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {current.rightSubsets.map((s, i) => {
              const isMatchTarget = current.currentMatchRightNeed >= 0 && s.sum === current.currentMatchRightNeed
              return (
                <span key={i} style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: i === current.rightActive ? '#10b981' : isMatchTarget ? '#ef4444' : '#1a3a2e',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  border: i === current.rightActive ? '1px solid #34d399' : isMatchTarget ? '1px solid #f87171' : '1px solid var(--border)',
                }}>
                  {subsetLabel(s.indices, arr)}={s.sum}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sorted right array */}
      {current.sortedRight.length > 0 && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ marginBottom: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
            排序后的 S_B ({current.sortedRight.length} / {1 << (arr.length - mid)})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {current.sortedRight.map((val, i) => (
              <span key={i} style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: current.currentMatchRightNeed === val ? '#ef4444' : '#2d1f0e',
                color: '#fff',
                fontSize: '0.75rem',
                fontFamily: 'Consolas, Monaco, monospace',
                border: current.currentMatchRightNeed === val ? '1px solid #f87171' : '1px solid var(--border)',
              }}>
                {val}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Match count */}
      {current.phase === 'match' || current.phase === 'done' ? (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: current.phase === 'done' ? '#065f46' : 'var(--bg-card)',
          borderRadius: '8px',
          border: `1px solid ${current.phase === 'done' ? '#10b981' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem' }}>
            匹配数: {current.matchCount}
          </span>
          {current.currentMatchRightNeed >= 0 && (
            <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>
              (在 S_B 中查找: {current.currentMatchRightNeed})
            </span>
          )}
        </div>
      ) : null}

      {/* Description */}
      <div className="viz-info">
        <strong>操作说明：</strong> {current.description}
      </div>

      {/* Legend */}
      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          左半/当前左
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#10b981', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          右半/当前右
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          排序中
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          匹配目标
        </span>
      </div>
    </div>
  )
}
