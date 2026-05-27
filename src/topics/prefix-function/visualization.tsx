import { useState, useEffect, useRef, useCallback } from 'react'

interface StepData {
  description: string
  charIndex: number
  j: number
  piValues: number[]
  highlightPrefix: number[]
  highlightSuffix: number[]
  matched: boolean
  jumped: boolean
}

const DEFAULT_STRING = 'ababaca'

function computeSteps(s: string): StepData[] {
  const n = s.length
  const pi: number[] = new Array(n).fill(0)
  const steps: StepData[] = []

  // Initial state
  steps.push({
    description: `初始化：字符串 s = "${s}"，pi 数组全部为 0`,
    charIndex: 0,
    j: 0,
    piValues: [...pi],
    highlightPrefix: [],
    highlightSuffix: [],
    matched: false,
    jumped: false,
  })

  for (let i = 1; i < n; i++) {
    let j = pi[i - 1]

    // Show the start of processing position i
    steps.push({
      description: `处理位置 i=${i}，字符 s[${i}]='${s[i]}'。初始 j = pi[${i - 1}] = ${j}`,
      charIndex: i,
      j,
      piValues: [...pi],
      highlightPrefix: j > 0 ? Array.from({ length: j }, (_, k) => k) : [],
      highlightSuffix: j > 0 ? Array.from({ length: j }, (_, k) => i - j + k) : [],
      matched: false,
      jumped: false,
    })

    let jumped = false
    while (j > 0 && s[i] !== s[j]) {
      steps.push({
        description: `s[${i}]='${s[i]}' != s[${j}]='${s[j]}'，不匹配。跳转 j = pi[${j - 1}] = ${pi[j - 1]}`,
        charIndex: i,
        j,
        piValues: [...pi],
        highlightPrefix: Array.from({ length: j }, (_, k) => k),
        highlightSuffix: Array.from({ length: j }, (_, k) => i - j + k),
        matched: false,
        jumped: true,
      })
      j = pi[j - 1]
      jumped = true
    }

    if (j > 0 || s[i] === s[j]) {
      if (s[i] === s[j]) {
        j++
        const prefixIndices = Array.from({ length: j }, (_, k) => k)
        const suffixIndices = Array.from({ length: j }, (_, k) => i - j + 1 + k)
        steps.push({
          description: `s[${i}]='${s[i]}' == s[${j - 1}]='${s[j - 1]}'，匹配成功！j++ = ${j}。前缀 "${s.substring(0, j)}" = 后缀 "${s.substring(i - j + 1, i + 1)}"`,
          charIndex: i,
          j,
          piValues: [...pi],
          highlightPrefix: prefixIndices,
          highlightSuffix: suffixIndices,
          matched: true,
          jumped,
        })
      } else {
        steps.push({
          description: `j=0，检查 s[${i}]='${s[i]}' 与 s[0]='${s[0]}'。不匹配，pi[${i}] = 0`,
          charIndex: i,
          j: 0,
          piValues: [...pi],
          highlightPrefix: [],
          highlightSuffix: [],
          matched: false,
          jumped,
        })
      }
    } else {
      steps.push({
        description: `j=0，检查 s[${i}]='${s[i]}' 与 s[0]='${s[0]}'。不匹配，pi[${i}] = 0`,
        charIndex: i,
        j: 0,
        piValues: [...pi],
        highlightPrefix: [],
        highlightSuffix: [],
        matched: false,
        jumped,
      })
    }

    pi[i] = j
    steps.push({
      description: `确定 pi[${i}] = ${j}`,
      charIndex: i,
      j,
      piValues: [...pi],
      highlightPrefix: j > 0 ? Array.from({ length: j }, (_, k) => k) : [],
      highlightSuffix: j > 0 ? Array.from({ length: j }, (_, k) => i - j + 1 + k) : [],
      matched: j > 0,
      jumped: false,
    })
  }

  steps.push({
    description: `计算完成！前缀函数数组: [${pi.join(', ')}]`,
    charIndex: n,
    j: 0,
    piValues: [...pi],
    highlightPrefix: [],
    highlightSuffix: [],
    matched: false,
    jumped: false,
  })

  return steps
}

export default function PrefixFunctionVisualization() {
  const [inputString, setInputString] = useState(DEFAULT_STRING)
  const [steps, setSteps] = useState<StepData[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const timerRef = useRef<number | null>(null)

  const initSteps = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const newSteps = computeSteps(inputString)
    setSteps(newSteps)
    setCurrentStep(0)
  }, [inputString])

  useEffect(() => {
    initSteps()
  }, [initSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStep = () => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    initSteps()
  }

  const step = steps[currentStep] || steps[0]
  if (!step) return null

  const s = inputString
  const cellSize = 48
  const cellGap = 4
  const startX = 30
  const charY = 40
  const piY = charY + cellSize + 30

  const getCharColor = (idx: number): string => {
    if (step.highlightPrefix.includes(idx)) return '#3b82f6'
    if (step.highlightSuffix.includes(idx)) return '#22c55e'
    if (idx === step.charIndex && step.charIndex < s.length) return '#f59e0b'
    return 'var(--bg-card)'
  }

  const getCharBorder = (idx: number): string => {
    if (step.highlightPrefix.includes(idx)) return '#60a5fa'
    if (step.highlightSuffix.includes(idx)) return '#4ade80'
    if (idx === step.charIndex && step.charIndex < s.length) return '#fbbf24'
    return 'var(--border)'
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            输入字符串:
          </label>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            maxLength={20}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.9rem',
              width: '160px',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {!isPlaying ? (
            <button className="btn btn-primary" onClick={handlePlay} disabled={steps.length === 0}>
              播放
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handlePause}>
              暂停
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleStep} disabled={isPlaying || currentStep >= steps.length - 1}>
            单步
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
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto', padding: '1rem' }}>
        <svg
          width={Math.max(startX * 2 + s.length * (cellSize + cellGap) + 80, 400)}
          height={piY + cellSize + 60}
        >
          {/* Index row */}
          <text x={startX - 25} y={charY + cellSize / 2 + 4} fill="var(--text-secondary)" fontSize="11" fontFamily="Consolas, Monaco, monospace" textAnchor="end">
            i:
          </text>
          {s.split('').map((_, idx) => (
            <text
              key={`idx-${idx}`}
              x={startX + idx * (cellSize + cellGap) + cellSize / 2}
              y={charY - 8}
              fill="var(--text-secondary)"
              fontSize="11"
              textAnchor="middle"
              fontFamily="Consolas, Monaco, monospace"
            >
              {idx}
            </text>
          ))}

          {/* Character cells */}
          {s.split('').map((ch, idx) => (
            <g key={`char-${idx}`}>
              <rect
                x={startX + idx * (cellSize + cellGap)}
                y={charY}
                width={cellSize}
                height={cellSize}
                rx="4"
                fill={getCharColor(idx)}
                stroke={getCharBorder(idx)}
                strokeWidth={idx === step.charIndex && step.charIndex < s.length ? 3 : 1.5}
              />
              <text
                x={startX + idx * (cellSize + cellGap) + cellSize / 2}
                y={charY + cellSize / 2 + 6}
                fill="var(--text-primary)"
                fontSize="18"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
              >
                {ch}
              </text>
            </g>
          ))}

          {/* Comparison indicator line */}
          {step.charIndex < s.length && step.j > 0 && step.highlightPrefix.length > 0 && step.highlightSuffix.length > 0 && (
            <g>
              <line
                x1={startX + step.highlightPrefix[0] * (cellSize + cellGap) + cellSize / 2}
                y1={charY + cellSize + 5}
                x2={startX + step.highlightPrefix[step.highlightPrefix.length - 1] * (cellSize + cellGap) + cellSize / 2}
                y2={charY + cellSize + 5}
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <text
                x={startX + step.highlightPrefix[0] * (cellSize + cellGap) + cellSize / 2}
                y={charY + cellSize + 18}
                fill="#3b82f6"
                fontSize="10"
                fontFamily="Consolas, Monaco, monospace"
              >
                prefix
              </text>
              <line
                x1={startX + step.highlightSuffix[0] * (cellSize + cellGap) + cellSize / 2}
                y1={charY + cellSize + 5}
                x2={startX + step.highlightSuffix[step.highlightSuffix.length - 1] * (cellSize + cellGap) + cellSize / 2}
                y2={charY + cellSize + 5}
                stroke="#22c55e"
                strokeWidth="2"
              />
              <text
                x={startX + step.highlightSuffix[0] * (cellSize + cellGap) + cellSize / 2}
                y={charY + cellSize + 28}
                fill="#22c55e"
                fontSize="10"
                fontFamily="Consolas, Monaco, monospace"
              >
                suffix
              </text>
            </g>
          )}

          {/* Pi array row */}
          <text x={startX - 25} y={piY + cellSize / 2 + 4} fill="var(--text-secondary)" fontSize="11" fontFamily="Consolas, Monaco, monospace" textAnchor="end">
            pi:
          </text>
          {step.piValues.map((val, idx) => (
            <g key={`pi-${idx}`}>
              <rect
                x={startX + idx * (cellSize + cellGap)}
                y={piY}
                width={cellSize}
                height={cellSize}
                rx="4"
                fill={idx <= step.charIndex ? 'var(--bg-card)' : 'transparent'}
                stroke={idx <= step.charIndex ? 'var(--border)' : 'var(--border)'}
                strokeWidth={idx === step.charIndex ? 2 : 1}
                strokeDasharray={idx > step.charIndex ? '4 2' : 'none'}
                opacity={idx <= step.charIndex ? 1 : 0.3}
              />
              <text
                x={startX + idx * (cellSize + cellGap) + cellSize / 2}
                y={piY + cellSize / 2 + 6}
                fill={idx <= step.charIndex ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize="18"
                fontWeight={idx === step.charIndex ? 'bold' : 'normal'}
                textAnchor="middle"
                fontFamily="Consolas, Monaco, monospace"
                opacity={idx <= step.charIndex ? 1 : 0.3}
              >
                {val}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="viz-info">
        <strong>步骤 {currentStep + 1}/{steps.length}：</strong> {step.description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前处理位置
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          前缀匹配
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          后缀匹配
        </span>
      </div>
    </div>
  )
}
