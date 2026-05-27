import { useState, useEffect, useRef, useCallback } from 'react'

interface StackItem {
  value: string
  id: number
  animating: 'push' | 'pop' | 'none'
}

type Mode = 'manual' | 'brackets'

interface BracketStep {
  type: 'push' | 'pop' | 'match' | 'nomatch' | 'done'
  char: string
  popped?: string
  stackBefore: string[]
  description: string
}

let nextId = 0

export default function StackVisualization() {
  const [stack, setStack] = useState<StackItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [operation, setOperation] = useState('')
  const [mode, setMode] = useState<Mode>('manual')
  const [highlightTop, setHighlightTop] = useState(false)

  // Bracket matching state
  const [bracketInput, setBracketInput] = useState('{[()()]}')
  const [bracketSteps, setBracketSteps] = useState<BracketStep[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [matchResult, setMatchResult] = useState<boolean | null>(null)
  const timerRef = useRef<number | null>(null)

  // Manual operations
  const pushValue = useCallback(() => {
    const val = inputValue.trim()
    if (!val) return
    const id = nextId++
    setStack(prev => [...prev, { value: val, id, animating: 'push' }])
    setOperation(`push("${val}")`)
    setInputValue('')
    setHighlightTop(false)
    // Clear animation after delay
    setTimeout(() => {
      setStack(prev =>
        prev.map(item => (item.id === id ? { ...item, animating: 'none' } : item))
      )
    }, 400)
  }, [inputValue])

  const popValue = useCallback(() => {
    setStack(prev => {
      if (prev.length === 0) return prev
      const top = prev[prev.length - 1]
      setOperation(`pop() → "${top.value}"`)
      setHighlightTop(false)
      // Animate out then remove
      setTimeout(() => {
        setStack(p => {
          const newStack = [...p]
          const idx = newStack.findIndex(item => item.id === top.id)
          if (idx !== -1) newStack[idx] = { ...newStack[idx], animating: 'pop' }
          return newStack
        })
        setTimeout(() => {
          setStack(p => p.filter(item => item.id !== top.id))
        }, 350)
      }, 50)
      return prev.map(item => (item.id === top.id ? { ...item, animating: 'pop' } : item))
    })
  }, [])

  const peekValue = useCallback(() => {
    setStack(prev => {
      if (prev.length === 0) {
        setOperation('peek() → 栈为空')
        return prev
      }
      const top = prev[prev.length - 1]
      setOperation(`peek() → "${top.value}"`)
      setHighlightTop(true)
      setTimeout(() => setHighlightTop(false), 1500)
      return prev
    })
  }, [])

  const resetStack = useCallback(() => {
    setStack([])
    setOperation('栈已清空')
    setHighlightTop(false)
    setBracketSteps([])
    setCurrentStep(-1)
    setIsPlaying(false)
    setMatchResult(null)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Generate bracket matching steps
  const generateBracketSteps = useCallback(() => {
    const steps: BracketStep[] = []
    const stackState: string[] = []
    const pairs: Record<string, string> = {
      ')': '(',
      ']': '[',
      '}': '{',
    }

    for (const char of bracketInput) {
      if ('([{'.includes(char)) {
        stackState.push(char)
        steps.push({
          type: 'push',
          char,
          stackBefore: [...stackState],
          description: `遇到左括号 '${char}'，压入栈`,
        })
      } else if (')]}'.includes(char)) {
        if (stackState.length === 0) {
          steps.push({
            type: 'nomatch',
            char,
            stackBefore: [...stackState],
            description: `遇到右括号 '${char}'，但栈为空，匹配失败`,
          })
          break
        }
        const popped = stackState.pop()!
        if (popped === pairs[char]) {
          steps.push({
            type: 'match',
            char,
            popped,
            stackBefore: [...stackState],
            description: `遇到 '${char}'，弹出 '${popped}'，匹配成功`,
          })
        } else {
          steps.push({
            type: 'nomatch',
            char,
            popped,
            stackBefore: [...stackState],
            description: `遇到 '${char}'，弹出 '${popped}'，不匹配！`,
          })
          break
        }
      }
    }

    if (steps.length > 0 && steps[steps.length - 1].type !== 'nomatch') {
      const isBalanced = stackState.length === 0
      steps.push({
        type: 'done',
        char: '',
        stackBefore: [...stackState],
        description: isBalanced
          ? '所有括号匹配完成，栈为空，匹配成功！'
          : `遍历结束，栈中还剩 ${stackState.length} 个未匹配的左括号`,
      })
    }

    return steps
  }, [bracketInput])

  // Apply a bracket step to the visual stack
  const applyBracketStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= bracketSteps.length) return
      const step = bracketSteps[stepIndex]

      if (step.type === 'push') {
        const id = nextId++
        setStack(prev => [...prev, { value: step.char, id, animating: 'push' }])
        setOperation(`第${stepIndex + 1}步: ${step.description}`)
        setTimeout(() => {
          setStack(prev =>
            prev.map(item => (item.id === id ? { ...item, animating: 'none' } : item))
          )
        }, 400)
      } else if (step.type === 'match') {
        // Pop the top element
        setStack(prev => {
          if (prev.length === 0) return prev
          const top = prev[prev.length - 1]
          setOperation(`第${stepIndex + 1}步: ${step.description}`)
          setTimeout(() => {
            setStack(p => p.filter(item => item.id !== top.id))
          }, 350)
          return prev.map(item => (item.id === top.id ? { ...item, animating: 'pop' } : item))
        })
      } else if (step.type === 'nomatch') {
        setOperation(`第${stepIndex + 1}步: ${step.description}`)
        setHighlightTop(true)
        setTimeout(() => setHighlightTop(false), 1500)
      } else if (step.type === 'done') {
        setOperation(step.description)
        setMatchResult(step.stackBefore.length === 0)
      }
    },
    [bracketSteps]
  )

  // Start bracket matching demo
  const startBracketDemo = useCallback(() => {
    const steps = generateBracketSteps()
    setBracketSteps(steps)
    setStack([])
    setCurrentStep(-1)
    setIsPlaying(false)
    setMatchResult(null)
    setOperation('准备开始括号匹配演示...')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    // Auto-play after a short delay
    setTimeout(() => {
      setCurrentStep(0)
      setIsPlaying(true)
    }, 500)
  }, [generateBracketSteps])

  // Auto-play effect for bracket demo
  useEffect(() => {
    if (!isPlaying || bracketSteps.length === 0) return

    if (currentStep >= bracketSteps.length) {
      setIsPlaying(false)
      return
    }

    if (currentStep >= 0) {
      applyBracketStep(currentStep)
    }

    timerRef.current = window.setTimeout(() => {
      if (currentStep + 1 < bracketSteps.length) {
        setCurrentStep(prev => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }, speed)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, bracketSteps, speed, applyBracketStep])

  const togglePlay = () => {
    if (bracketSteps.length === 0) {
      startBracketDemo()
      return
    }
    setIsPlaying(prev => !prev)
  }

  const stepForward = () => {
    if (bracketSteps.length === 0) {
      const steps = generateBracketSteps()
      setBracketSteps(steps)
      setStack([])
      setCurrentStep(0)
      applyBracketStep(0)
      return
    }
    setIsPlaying(false)
    const next = currentStep + 1
    if (next < bracketSteps.length) {
      setCurrentStep(next)
      applyBracketStep(next)
    }
  }

  const maxVisibleItems = 10
  const visibleStack = stack.slice(-maxVisibleItems)

  return (
    <div className="visualization-container">
      {/* Mode selector */}
      <div className="viz-controls">
        <button
          className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('manual')}
        >
          手动操作
        </button>
        <button
          className={`btn ${mode === 'brackets' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('brackets')}
        >
          括号匹配演示
        </button>
      </div>

      {/* Manual mode controls */}
      {mode === 'manual' && (
        <div className="viz-controls">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pushValue()}
            placeholder="输入值"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              width: '120px',
            }}
          />
          <button className="btn btn-primary" onClick={pushValue}>
            压入 (Push)
          </button>
          <button className="btn btn-primary" onClick={popValue}>
            弹出 (Pop)
          </button>
          <button className="btn btn-secondary" onClick={peekValue}>
            查看栈顶 (Peek)
          </button>
          <button className="btn btn-secondary" onClick={resetStack}>
            重置
          </button>
        </div>
      )}

      {/* Bracket matching controls */}
      {mode === 'brackets' && (
        <div className="viz-controls">
          <input
            type="text"
            value={bracketInput}
            onChange={e => setBracketInput(e.target.value)}
            placeholder="输入括号字符串"
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              width: '200px',
              fontFamily: 'Consolas, Monaco, monospace',
            }}
          />
          <button className="btn btn-primary" onClick={startBracketDemo}>
            开始演示
          </button>
          <button className="btn btn-secondary" onClick={togglePlay}>
            {isPlaying ? '暂停' : '播放'}
          </button>
          <button className="btn btn-secondary" onClick={stepForward}>
            下一步
          </button>
          <button className="btn btn-secondary" onClick={resetStack}>
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
              min="200"
              max="2000"
              step="100"
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
            />
            {speed}ms
          </label>
        </div>
      )}

      {/* Bracket matching progress */}
      {mode === 'brackets' && bracketSteps.length > 0 && (
        <div className="viz-info">
          进度: {currentStep + 1} / {bracketSteps.length} 步
          {matchResult !== null && (
            <span
              style={{
                marginLeft: '1rem',
                color: matchResult ? 'var(--success)' : 'var(--error)',
                fontWeight: 'bold',
              }}
            >
              {matchResult ? '括号完全匹配！' : '括号不匹配！'}
            </span>
          )}
        </div>
      )}

      {/* Stack visualization */}
      <div className="viz-canvas" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', minHeight: '350px', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Stack top label */}
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            栈顶 ↑
          </div>

          {/* Stack container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column-reverse',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem',
              minHeight: '200px',
              minWidth: '200px',
              gap: '2px',
              background: 'rgba(30, 41, 59, 0.5)',
            }}
          >
            {visibleStack.length === 0 ? (
              <div
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  fontStyle: 'italic',
                }}
              >
                空栈
              </div>
            ) : (
              visibleStack.map((item, index) => {
                const isTop = index === visibleStack.length - 1
                const isHighlighted = isTop && highlightTop

                let animStyle: React.CSSProperties = {}
                if (item.animating === 'push') {
                  animStyle = {
                    animation: 'stackPush 0.4s ease-out forwards',
                  }
                } else if (item.animating === 'pop') {
                  animStyle = {
                    animation: 'stackPop 0.35s ease-in forwards',
                  }
                }

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: '0.6rem 1.5rem',
                      background: isHighlighted
                        ? 'var(--warning)'
                        : isTop
                          ? 'var(--accent)'
                          : 'var(--bg-card)',
                      color: isHighlighted
                        ? '#000'
                        : isTop
                          ? 'white'
                          : 'var(--text-primary)',
                      borderRadius: 'var(--radius)',
                      textAlign: 'center',
                      fontWeight: isTop ? 'bold' : 'normal',
                      border: isTop
                        ? '2px solid var(--accent-hover)'
                        : '1px solid var(--border)',
                      fontSize: '0.95rem',
                      minWidth: '120px',
                      position: 'relative',
                      transition: 'background 0.3s, color 0.3s',
                      ...animStyle,
                    }}
                  >
                    {item.value}
                    {isTop && (
                      <span
                        style={{
                          position: 'absolute',
                          right: '-2.5rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '0.7rem',
                          color: 'var(--accent)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ← 栈顶
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Stack bottom label */}
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            栈底
          </div>
        </div>
      </div>

      {/* Operation display */}
      {operation && (
        <div className="viz-info">
          <strong>当前操作：</strong>{operation}
        </div>
      )}

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes stackPush {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes stackPop {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-30px);
          }
        }
      `}</style>
    </div>
  )
}
