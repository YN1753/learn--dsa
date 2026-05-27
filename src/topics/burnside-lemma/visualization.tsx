import { useState, useEffect, useRef, useCallback } from 'react'

interface GroupElement {
  name: string
  cycles: number[][]
  rotation: number // 旋转角度（度）
  flip: boolean // 是否为翻转
}

interface ColoringState {
  colors: number[]
  isFixed: boolean
}

const COLOR_PALETTE = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#a855f7', // purple
  '#ec4899', // pink
]

const GROUP_C3: GroupElement[] = [
  { name: '恒等 (0度)', cycles: [[0], [1], [2]], rotation: 0, flip: false },
  { name: '旋转 120度', cycles: [[0, 1, 2]], rotation: 120, flip: false },
  { name: '旋转 240度', cycles: [[0, 2, 1]], rotation: 240, flip: false },
]

const GROUP_D3: GroupElement[] = [
  { name: '恒等 (0度)', cycles: [[0], [1], [2]], rotation: 0, flip: false },
  { name: '旋转 120度', cycles: [[0, 1, 2]], rotation: 120, flip: false },
  { name: '旋转 240度', cycles: [[0, 2, 1]], rotation: 240, flip: false },
  { name: '翻转 (轴过顶点0)', cycles: [[0], [1, 2]], rotation: 0, flip: true },
  { name: '翻转 (轴过顶点1)', cycles: [[1], [0, 2]], rotation: 0, flip: true },
  { name: '翻转 (轴过顶点2)', cycles: [[2], [0, 1]], rotation: 0, flip: true },
]

const GROUP_C4: GroupElement[] = [
  { name: '恒等 (0度)', cycles: [[0], [1], [2], [3]], rotation: 0, flip: false },
  { name: '旋转 90度', cycles: [[0, 1, 2, 3]], rotation: 90, flip: false },
  { name: '旋转 180度', cycles: [[0, 2], [1, 3]], rotation: 180, flip: false },
  { name: '旋转 270度', cycles: [[0, 3, 2, 1]], rotation: 270, flip: false },
]

type GroupName = 'C3' | 'D3' | 'C4'

const GROUPS: Record<GroupName, { elements: GroupElement[]; n: number; label: string }> = {
  C3: { elements: GROUP_C3, n: 3, label: 'C_3 (三角形旋转)' },
  D3: { elements: GROUP_D3, n: 3, label: 'D_3 (三角形旋转+翻转)' },
  C4: { elements: GROUP_C4, n: 4, label: 'C_4 (正方形旋转)' },
}

export default function BurnsideVisualization() {
  const [groupName, setGroupName] = useState<GroupName>('C3')
  const [numColors, setNumColors] = useState(2)
  const [currentElemIdx, setCurrentElemIdx] = useState(0)
  const [description, setDescription] = useState<string>('选择一个群元素，查看其不动点')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1200)
  const [fixedColorings, setFixedColorings] = useState<ColoringState[]>([])
  const [showAllResults, setShowAllResults] = useState(false)
  const timerRef = useRef<number | null>(null)

  const group = GROUPS[groupName]
  const elem = group.elements[currentElemIdx]
  const n = group.n

  // Generate all colorings and check which are fixed under current element
  const computeFixedColorings = useCallback(() => {
    const total = Math.pow(numColors, n)
    const results: ColoringState[] = []

    for (let i = 0; i < total; i++) {
      const colors: number[] = []
      let temp = i
      for (let j = 0; j < n; j++) {
        colors.push(temp % numColors)
        temp = Math.floor(temp / numColors)
      }

      // Check if this coloring is fixed under elem
      let isFixed = true
      for (const cycle of elem.cycles) {
        const firstColor = colors[cycle[0]]
        for (let k = 1; k < cycle.length; k++) {
          if (colors[cycle[k]] !== firstColor) {
            isFixed = false
            break
          }
        }
        if (!isFixed) break
      }

      results.push({ colors, isFixed })
    }

    return results
  }, [numColors, n, elem])

  useEffect(() => {
    const results = computeFixedColorings()
    setFixedColorings(results)
    const fixedCount = results.filter(r => r.isFixed).length
    setDescription(
      `${elem.name} | 循环个数: ${elem.cycles.length} | 不动点数: ${fixedCount}`
    )
  }, [computeFixedColorings, elem])

  // Auto-play through all group elements
  useEffect(() => {
    if (!isPlaying) return

    timerRef.current = window.setTimeout(() => {
      const nextIdx = currentElemIdx + 1
      if (nextIdx >= group.elements.length) {
        setIsPlaying(false)
        setShowAllResults(true)
        // Compute final result
        let totalFixed = 0
        for (let i = 0; i < group.elements.length; i++) {
          const g = group.elements[i]
          let count = 0
          const total = Math.pow(numColors, n)
          for (let j = 0; j < total; j++) {
            const colors: number[] = []
            let temp = j
            for (let k = 0; k < n; k++) {
              colors.push(temp % numColors)
              temp = Math.floor(temp / numColors)
            }
            let fixed = true
            for (const cycle of g.cycles) {
              const fc = colors[cycle[0]]
              for (let k = 1; k < cycle.length; k++) {
                if (colors[cycle[k]] !== fc) { fixed = false; break }
              }
              if (!fixed) break
            }
            if (fixed) count++
          }
          totalFixed += count
        }
        setDescription(
          `计算完成！不等价着色数 = ${totalFixed} / ${group.elements.length} = ${totalFixed / group.elements.length}`
        )
      } else {
        setCurrentElemIdx(nextIdx)
      }
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentElemIdx, group, numColors, n])

  const handlePlay = () => {
    setCurrentElemIdx(0)
    setShowAllResults(false)
    setIsPlaying(true)
  }

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (currentElemIdx < group.elements.length - 1) {
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setCurrentElemIdx(0)
    setShowAllResults(false)
    setDescription('已重置')
  }

  const handleGroupChange = (g: GroupName) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setGroupName(g)
    setCurrentElemIdx(0)
    setShowAllResults(false)
  }

  // Compute summary for all elements
  const computeSummary = () => {
    const summary: { name: string; cycles: number; fixed: number }[] = []
    let totalFixed = 0
    const total = Math.pow(numColors, n)

    for (const g of group.elements) {
      let count = 0
      for (let j = 0; j < total; j++) {
        const colors: number[] = []
        let temp = j
        for (let k = 0; k < n; k++) {
          colors.push(temp % numColors)
          temp = Math.floor(temp / numColors)
        }
        let fixed = true
        for (const cycle of g.cycles) {
          const fc = colors[cycle[0]]
          for (let k = 1; k < cycle.length; k++) {
            if (colors[cycle[k]] !== fc) { fixed = false; break }
          }
          if (!fixed) break
        }
        if (fixed) count++
      }
      summary.push({ name: g.name, cycles: g.cycles.length, fixed: count })
      totalFixed += count
    }

    return { summary, totalFixed, result: totalFixed / group.elements.length }
  }

  // Draw the polygon with colored vertices
  const renderPolygon = () => {
    const cx = 150
    const cy = 150
    const r = 100
    const vertexR = 18
    const fixedCount = fixedColorings.filter(f => f.isFixed).length

    return (
      <svg width={300} height={300} style={{ margin: '0 auto', display: 'block' }}>
        {/* Draw edges */}
        {Array.from({ length: n }, (_, i) => {
          const angle1 = (2 * Math.PI * i) / n - Math.PI / 2
          const angle2 = (2 * Math.PI * ((i + 1) % n)) / n - Math.PI / 2
          return (
            <line
              key={`edge-${i}`}
              x1={cx + r * Math.cos(angle1)}
              y1={cy + r * Math.sin(angle1)}
              x2={cx + r * Math.cos(angle2)}
              y2={cy + r * Math.sin(angle2)}
              stroke="var(--border)"
              strokeWidth="2"
            />
          )
        })}

        {/* Draw vertices */}
        {Array.from({ length: n }, (_, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2
          const vx = cx + r * Math.cos(angle)
          const vy = cy + r * Math.sin(angle)

          return (
            <g key={`vertex-${i}`}>
              <circle
                cx={vx}
                cy={vy}
                r={vertexR}
                fill="var(--bg-card)"
                stroke="var(--border)"
                strokeWidth="2"
              />
              <text
                x={vx}
                y={vy + 5}
                textAnchor="middle"
                fill="var(--text-primary)"
                fontSize="14"
                fontWeight="bold"
                fontFamily="Consolas, Monaco, monospace"
              >
                {i}
              </text>
            </g>
          )
        })}

        {/* Info text */}
        <text x={cx} y={280} textAnchor="middle" fill="var(--text-secondary)" fontSize="12">
          顶点数: {n} | 颜色数: {numColors} | 不动点数: {fixedCount}
        </text>
      </svg>
    )
  }

  // Render a sample coloring as small circles
  const renderColoring = (coloring: ColoringState, index: number) => {
    const size = 40
    const cx = size / 2
    const cy = size / 2
    const vr = 5

    return (
      <div
        key={index}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '2px',
          padding: '4px',
          borderRadius: '6px',
          border: coloring.isFixed
            ? '2px solid #22c55e'
            : '2px solid var(--border)',
          background: coloring.isFixed ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
        }}
      >
        <svg width={size} height={size}>
          {Array.from({ length: n }, (_, i) => {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2
            return (
              <circle
                key={i}
                cx={cx + vr * 2 * Math.cos(angle)}
                cy={cy + vr * 2 * Math.sin(angle)}
                r={vr}
                fill={COLOR_PALETTE[coloring.colors[i]]}
                stroke="var(--border)"
                strokeWidth="0.5"
              />
            )
          })}
        </svg>
      </div>
    )
  }

  const { summary, totalFixed, result } = computeSummary()

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <select
          value={groupName}
          onChange={(e) => handleGroupChange(e.target.value as GroupName)}
          style={{
            padding: '0.4rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        >
          <option value="C3">C_3 (三角形旋转)</option>
          <option value="D3">D_3 (三角形旋转+翻转)</option>
          <option value="C4">C_4 (正方形旋转)</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          颜色数:
          <select
            value={numColors}
            onChange={(e) => setNumColors(Number(e.target.value))}
            style={{
              padding: '0.3rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </label>

        <button className="btn btn-primary" onClick={handlePlay} disabled={isPlaying}>
          自动播放
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={!isPlaying && currentElemIdx === 0}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="400"
            max="3000"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      {/* Group element selector */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem 0' }}>
        {group.elements.map((g, i) => (
          <button
            key={i}
            className={`btn ${i === currentElemIdx ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setCurrentElemIdx(i); setShowAllResults(false) }}
            disabled={isPlaying}
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="viz-canvas">
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
          {/* Polygon visualization */}
          <div>
            <h4 style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
              {group.label} | 当前: {elem.name}
            </h4>
            {renderPolygon()}
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
              循环分解: {elem.cycles.map(c => `(${c.join(' ')})`).join(' ')}
            </div>
          </div>

          {/* Fixed colorings display */}
          <div style={{ maxWidth: '350px' }}>
            <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
              所有着色方案 ({fixedColorings.length} 种)
              <span style={{ marginLeft: '0.5rem', color: '#22c55e' }}>
                不动点: {fixedColorings.filter(f => f.isFixed).length}
              </span>
            </h4>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2px',
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '0.5rem',
              borderRadius: '8px',
              background: 'var(--bg-secondary, rgba(0,0,0,0.05))',
            }}>
              {fixedColorings.map((c, i) => renderColoring(c, i))}
            </div>
          </div>
        </div>
      </div>

      <div className="viz-info">
        <strong>当前状态：</strong> {description}
      </div>

      {/* Summary table */}
      {showAllResults && (
        <div className="viz-info" style={{ marginTop: '0.5rem' }}>
          <strong>计算结果：</strong>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.3rem 0.5rem', borderBottom: '1px solid var(--border)' }}>群元素</th>
                <th style={{ textAlign: 'center', padding: '0.3rem 0.5rem', borderBottom: '1px solid var(--border)' }}>循环个数</th>
                <th style={{ textAlign: 'center', padding: '0.3rem 0.5rem', borderBottom: '1px solid var(--border)' }}>不动点数</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s, i) => (
                <tr key={i}>
                  <td style={{ padding: '0.3rem 0.5rem', borderBottom: '1px solid var(--border)' }}>{s.name}</td>
                  <td style={{ textAlign: 'center', padding: '0.3rem 0.5rem', borderBottom: '1px solid var(--border)' }}>{s.cycles}</td>
                  <td style={{ textAlign: 'center', padding: '0.3rem 0.5rem', borderBottom: '1px solid var(--border)' }}>{s.fixed}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold' }}>
                <td style={{ padding: '0.3rem 0.5rem' }}>合计</td>
                <td style={{ textAlign: 'center', padding: '0.3rem 0.5rem' }}>-</td>
                <td style={{ textAlign: 'center', padding: '0.3rem 0.5rem' }}>{totalFixed}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
            不等价着色数 = {totalFixed} / {group.elements.length} = {result}
          </div>
        </div>
      )}

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          不动点（该着色在当前群元素作用下不变）
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--border)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          非不动点
        </span>
      </div>
    </div>
  )
}
