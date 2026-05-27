import { useState, useMemo } from 'react'

interface ComplexityFn {
  name: string
  formula: string
  color: string
  fn: (n: number) => number
}

const COMPLEXITIES: ComplexityFn[] = [
  { name: 'O(1)', formula: '1', color: '#22c55e', fn: () => 1 },
  { name: 'O(log n)', formula: 'log₂(n)', color: '#3b82f6', fn: (n: number) => Math.max(1, Math.ceil(Math.log2(n))) },
  { name: 'O(n)', formula: 'n', color: '#a855f7', fn: (n: number) => n },
  { name: 'O(n log n)', formula: 'n·log₂(n)', color: '#f97316', fn: (n: number) => Math.ceil(n * Math.log2(Math.max(2, n))) },
  { name: 'O(n²)', formula: 'n²', color: '#ef4444', fn: (n: number) => n * n },
]

const CODE_EXAMPLES = [
  {
    title: 'O(1) — 常数时间',
    code: `const val = arr[5]  // 直接访问`,
    explanation: '无论数组多大，访问固定位置只需一步。',
  },
  {
    title: 'O(log n) — 对数时间',
    code: `let i = n
while (i > 1) {
  i = Math.floor(i / 2)
}`,
    explanation: '每次减半，共 log₂(n) 次迭代。',
  },
  {
    title: 'O(n) — 线性时间',
    code: `for (let i = 0; i < n; i++) {
  console.log(i)
}`,
    explanation: '循环 n 次，每次 O(1)，总计 O(n)。',
  },
  {
    title: 'O(n²) — 平方时间',
    code: `for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    console.log(i, j)
  }
}`,
    explanation: '两层嵌套循环，n × n = n²。',
  },
]

function formatNumber(val: number): string {
  if (val >= 1e12) return `${(val / 1e12).toFixed(1)}T`
  if (val >= 1e9) return `${(val / 1e9).toFixed(1)}B`
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}M`
  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}K`
  return String(val)
}

export default function ComplexityVisualization() {
  const [n, setN] = useState(32)
  const [selectedExample, setSelectedExample] = useState(0)

  const values = useMemo(
    () => COMPLEXITIES.map(c => ({ ...c, value: c.fn(n) })),
    [n]
  )

  const maxVal = useMemo(() => Math.max(...values.map(v => v.value), 1), [values])

  // Graph points for the curve chart
  const graphPoints = useMemo(() => {
    const maxN = Math.max(n, 50)
    const steps = 100
    const stepSize = maxN / steps
    return COMPLEXITIES.map(c => {
      const points: string[] = []
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * 100
        const val = c.fn(Math.max(1, Math.round(i * stepSize)))
        // Clamp y to chart height
        const yNorm = Math.min(val / Math.max(maxVal, 1), 1)
        const y = 100 - yNorm * 95
        points.push(`${x},${y}`)
      }
      return { name: c.name, color: c.color, polyline: points.join(' ') }
    })
  }, [n, maxVal])

  const nForGraph = Math.max(n, 50)

  return (
    <div className="visualization-container">
      {/* N slider */}
      <div className="viz-controls">
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            flex: 1,
          }}
        >
          输入规模 n:
          <input
            type="range"
            min="2"
            max="200"
            value={n}
            onChange={e => setN(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span
            style={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              minWidth: '36px',
              textAlign: 'right',
            }}
          >
            {n}
          </span>
        </label>
      </div>

      {/* Growth curve chart */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '1rem',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          增长曲线 (n = 1 到 {nForGraph})
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ width: '100%', height: '200px', display: 'block' }}
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(frac => (
            <line
              key={frac}
              x1="0" y1={100 - frac * 95} x2="100" y2={100 - frac * 95}
              stroke="var(--border)" strokeWidth="0.3"
            />
          ))}
          {/* Curves */}
          {graphPoints.map(gp => (
            <polyline
              key={gp.name}
              points={gp.polyline}
              fill="none"
              stroke={gp.color}
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {/* Legend */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginTop: '0.5rem',
            fontSize: '0.75rem',
          }}
        >
          {COMPLEXITIES.map(c => (
            <span key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
              <span style={{ width: '10px', height: '10px', background: c.color, borderRadius: '2px', display: 'inline-block' }} />
              {c.name}
            </span>
          ))}
        </div>
      </div>

      {/* Bar comparison at current n */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '1rem',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          n = {n} 时各复杂度的实际运算次数
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {values.map(v => {
            const ratio = maxVal > 0 ? v.value / maxVal : 0
            const barWidth = Math.max(ratio * 100, 0.5)
            return (
              <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    minWidth: '90px',
                    fontSize: '0.8rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    color: 'var(--text-secondary)',
                    textAlign: 'right',
                  }}
                >
                  {v.name}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: '22px',
                    background: 'var(--bg-main)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: '100%',
                      background: v.color,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span
                  style={{
                    minWidth: '70px',
                    fontSize: '0.75rem',
                    fontFamily: 'Consolas, Monaco, monospace',
                    color: 'var(--text-primary)',
                    textAlign: 'right',
                  }}
                >
                  {formatNumber(v.value)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Code analysis examples */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '1rem',
        }}
      >
        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          代码复杂度分析示例
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {CODE_EXAMPLES.map((ex, idx) => (
            <button
              key={ex.title}
              className={idx === selectedExample ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setSelectedExample(idx)}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
            >
              {ex.title}
            </button>
          ))}
        </div>
        <pre
          style={{
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem 1rem',
            fontSize: '0.82rem',
            fontFamily: 'Consolas, Monaco, monospace',
            color: 'var(--text-primary)',
            overflow: 'auto',
            margin: '0 0 0.5rem 0',
            lineHeight: '1.5',
          }}
        >
          {CODE_EXAMPLES[selectedExample].code}
        </pre>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          {CODE_EXAMPLES[selectedExample].explanation}
        </div>
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>当前输入规模：</strong>n = {n}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
          {values.map(v => (
            <span key={v.name}>
              {v.name} = {formatNumber(v.value)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
