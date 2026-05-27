import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

interface PersonState {
  id: number
  eliminated: boolean
}

interface AnimationStep {
  description: string
  people: PersonState[]
  currentIndex: number
  counting: number[]
  eliminatedThisRound: number | null
}

export default function JosephusVisualization() {
  const [n, setN] = useState(8)
  const [k, setK] = useState(3)
  const [people, setPeople] = useState<PersonState[]>(
    Array.from({ length: 8 }, (_, i) => ({ id: i, eliminated: false }))
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [counting, setCounting] = useState<number[]>([])
  const [description, setDescription] = useState('设置人数和间隔，然后点击「开始」观察约瑟夫问题的求解过程')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [finished, setFinished] = useState(false)
  const [survivor, setSurvivor] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const buildSteps = useCallback((totalN: number, totalK: number): AnimationStep[] => {
    const result: AnimationStep[] = []
    const state: PersonState[] = Array.from({ length: totalN }, (_, i) => ({
      id: i,
      eliminated: false,
    }))

    result.push({
      description: `${totalN} 个人围成一圈，从编号 0 开始报数，每数到第 ${totalK} 个人出列`,
      people: state.map(p => ({ ...p })),
      currentIndex: 0,
      counting: [],
      eliminatedThisRound: null,
    })

    let alive = totalN
    let pos = 0
    let round = 1

    while (alive > 1) {
      // Count k people (skip eliminated ones)
      const countPath: number[] = []
      let counted = 0
      let cur = pos

      while (counted < totalK) {
        if (!state[cur].eliminated) {
          counted++
          countPath.push(cur)
        }
        if (counted < totalK) {
          cur = (cur + 1) % totalN
        }
      }

      // Show counting process
      result.push({
        description: `第 ${round} 轮：从编号 ${pos} 开始报数，经过 ${countPath.join(' -> ')}`,
        people: state.map(p => ({ ...p })),
        currentIndex: pos,
        counting: countPath,
        eliminatedThisRound: null,
      })

      // Eliminate
      const elimIdx = countPath[countPath.length - 1]
      state[elimIdx].eliminated = true
      alive--

      result.push({
        description: `第 ${round} 轮：编号 ${elimIdx} 出列！剩余 ${alive} 人`,
        people: state.map(p => ({ ...p })),
        currentIndex: elimIdx,
        counting: [],
        eliminatedThisRound: elimIdx,
      })

      // Find next starting position
      let nextPos = (elimIdx + 1) % totalN
      while (state[nextPos].eliminated) {
        nextPos = (nextPos + 1) % totalN
      }
      pos = nextPos
      round++
    }

    // Find survivor
    const survivorId = state.findIndex(p => !p.eliminated)
    result.push({
      description: `约瑟夫问题 J(${totalN}, ${totalK}) = ${survivorId}，编号 ${survivorId} 是最后的幸存者！`,
      people: state.map(p => ({ ...p })),
      currentIndex: survivorId,
      counting: [],
      eliminatedThisRound: null,
    })

    return result
  }, [])

  const handleStart = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const animationSteps = buildSteps(n, k)
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
    setFinished(false)
    setSurvivor(null)
  }, [n, k, buildSteps])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      setFinished(true)
      const lastStep = steps[steps.length - 1]
      setSurvivor(lastStep.people.findIndex(p => !p.eliminated))
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setPeople(step.people)
      setCurrentIndex(step.currentIndex)
      setCounting(step.counting)
      setDescription(step.description)
      if (step.eliminatedThisRound !== null || currentStep === steps.length - 1) {
        const s = step.people.findIndex(p => !p.eliminated)
        if (currentStep === steps.length - 1) {
          setSurvivor(s)
          setFinished(true)
        }
      }
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStep = useCallback(() => {
    if (steps.length === 0) {
      const animationSteps = buildSteps(n, k)
      setSteps(animationSteps)
      setCurrentStep(0)
      setFinished(false)
      setSurvivor(null)
      if (animationSteps.length > 0) {
        const step = animationSteps[0]
        setPeople(step.people)
        setCurrentIndex(step.currentIndex)
        setCounting(step.counting)
        setDescription(step.description)
        setCurrentStep(1)
      }
      return
    }
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setPeople(step.people)
      setCurrentIndex(step.currentIndex)
      setCounting(step.counting)
      setDescription(step.description)
      if (currentStep === steps.length - 1) {
        const s = step.people.findIndex(p => !p.eliminated)
        setSurvivor(s)
        setFinished(true)
      }
      setCurrentStep(prev => prev + 1)
    }
  }, [steps, currentStep, n, k, buildSteps])

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    const initial = Array.from({ length: n }, (_, i) => ({ id: i, eliminated: false }))
    setPeople(initial)
    setCurrentIndex(0)
    setCounting([])
    setDescription('设置人数和间隔，然后点击「开始」观察约瑟夫问题的求解过程')
    setSteps([])
    setCurrentStep(0)
    setFinished(false)
    setSurvivor(null)
  }

  // Circle layout positions
  const positions = useMemo(() => {
    const cx = 250
    const cy = 220
    const radius = 160
    return people.map((_, i) => {
      const angle = (2 * Math.PI * i) / people.length - Math.PI / 2
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      }
    })
  }, [people.length])

  const getPersonFill = (id: number): string => {
    const person = people[id]
    if (!person) return 'var(--bg-card)'
    if (person.eliminated) return '#374151'
    if (survivor === id && finished) return '#059669'
    if (counting.includes(id)) return '#3b82f6'
    if (currentIndex === id) return '#f59e0b'
    return 'var(--bg-card)'
  }

  const getPersonStroke = (id: number): string => {
    const person = people[id]
    if (!person) return 'var(--border)'
    if (person.eliminated) return '#4b5563'
    if (survivor === id && finished) return '#10b981'
    if (counting.includes(id)) return '#60a5fa'
    if (currentIndex === id) return '#fbbf24'
    return 'var(--border)'
  }

  const getPersonTextColor = (id: number): string => {
    const person = people[id]
    if (!person) return 'var(--text-primary)'
    if (person.eliminated) return '#6b7280'
    if (survivor === id && finished) return '#ffffff'
    if (counting.includes(id)) return '#ffffff'
    if (currentIndex === id) return '#ffffff'
    return 'var(--text-primary)'
  }

  return (
    <div className="visualization-container">
      {/* Parameter controls */}
      <div className="viz-controls" style={{ flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          人数 n:
          <input
            type="range"
            min="3"
            max="20"
            value={n}
            onChange={(e) => {
              const val = Number(e.target.value)
              setN(val)
              setPeople(Array.from({ length: val }, (_, i) => ({ id: i, eliminated: false })))
              setSteps([])
              setCurrentStep(0)
              setFinished(false)
              setSurvivor(null)
            }}
            disabled={isPlaying}
          />
          <span style={{ minWidth: '2rem', textAlign: 'center' }}>{n}</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          间隔 k:
          <input
            type="range"
            min="2"
            max={Math.max(2, n)}
            value={k}
            onChange={(e) => {
              setK(Number(e.target.value))
              setSteps([])
              setCurrentStep(0)
              setFinished(false)
              setSurvivor(null)
            }}
            disabled={isPlaying}
          />
          <span style={{ minWidth: '2rem', textAlign: 'center' }}>{k}</span>
        </label>
      </div>

      {/* Action controls */}
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始
        </button>
        <button className="btn btn-primary" onClick={handleStep}>
          单步执行
        </button>
        <button
          className="btn btn-secondary"
          onClick={handlePauseResume}
          disabled={steps.length === 0 || currentStep >= steps.length}
        >
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="100"
            max="1500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      {/* Circle visualization */}
      <div className="viz-canvas">
        <svg width="100%" viewBox="0 0 500 440">
          {/* Connection lines from current to counting path */}
          {counting.length > 1 && counting.slice(0, -1).map((fromId, i) => {
            const toId = counting[i + 1]
            const from = positions[fromId]
            const to = positions[toId]
            return (
              <line
                key={`count-line-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 2"
                opacity={0.5}
              />
            )
          })}

          {/* Person circles */}
          {people.map((person, i) => {
            const pos = positions[i]
            return (
              <g key={person.id}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={person.eliminated ? 18 : 22}
                  fill={getPersonFill(person.id)}
                  stroke={getPersonStroke(person.id)}
                  strokeWidth={currentIndex === person.id ? 3 : 2}
                  style={{
                    transition: 'all 0.3s ease',
                    opacity: person.eliminated ? 0.4 : 1,
                  }}
                />
                <text
                  x={pos.x}
                  y={pos.y + (person.eliminated ? 0 : 1)}
                  fill={getPersonTextColor(person.id)}
                  fontSize={person.eliminated ? '11' : '14'}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Consolas, Monaco, monospace"
                  style={{ textDecoration: person.eliminated ? 'line-through' : 'none' }}
                >
                  {person.id}
                </text>
              </g>
            )
          })}

          {/* Center info */}
          <text x="250" y="210" fill="var(--text-secondary)" fontSize="13" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">
            {`J(${n}, ${k})`}
          </text>
          {survivor !== null && finished && (
            <text x="250" y="235" fill="#10b981" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="Consolas, Monaco, monospace">
              {`= ${survivor}`}
            </text>
          )}
        </svg>
      </div>

      {/* Status panel */}
      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      {/* Legend */}
      <div className="viz-info" style={{ fontSize: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem' }}>
        <span>
          <strong>图例：</strong>
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          存活
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          当前位置
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          计数中
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#374151', border: '1.5px solid #4b5563', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          已出列
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#059669', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          幸存者
        </span>
      </div>
    </div>
  )
}
