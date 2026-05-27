import { useState, useEffect, useRef, useCallback } from 'react'

interface SuffixEntry {
  index: number
  suffix: string
  rank: number
}

interface SearchStep {
  low: number
  high: number
  mid: number
  comparison: string
  result: string
  found: boolean | null
}

const DEFAULT_TEXT = 'banana'

function buildSuffixArray(text: string): number[] {
  const n = text.length
  const suffixes: { index: number; suffix: string }[] = []
  for (let i = 0; i < n; i++) {
    suffixes.push({ index: i, suffix: text.substring(i) })
  }
  suffixes.sort((a, b) => a.suffix.localeCompare(b.suffix))
  return suffixes.map(s => s.index)
}

function buildLCPArray(text: string, sa: number[]): number[] {
  const n = text.length
  const rank: number[] = new Array(n)
  const lcp: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) rank[sa[i]] = i
  let h = 0
  for (let i = 0; i < n; i++) {
    if (rank[i] > 0) {
      const j = sa[rank[i] - 1]
      while (i + h < n && j + h < n && text[i + h] === text[j + h]) h++
      lcp[rank[i]] = h
      if (h > 0) h--
    }
  }
  return lcp
}

function computeSearchSteps(text: string, sa: number[], pattern: string): SearchStep[] {
  const n = text.length
  const m = pattern.length
  const steps: SearchStep[] = []
  let low = 0, high = n - 1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const suffix = text.substring(sa[mid], Math.min(sa[mid] + m, n))
    if (suffix < pattern) {
      steps.push({ low, high, mid, comparison: `"${suffix}" < "${pattern}"`, result: '向右', found: null })
      low = mid + 1
    } else if (suffix > pattern) {
      steps.push({ low, high, mid, comparison: `"${suffix}" > "${pattern}"`, result: '向左', found: null })
      high = mid - 1
    } else {
      steps.push({ low, high, mid, comparison: `"${suffix}" = "${pattern}"`, result: '找到匹配！', found: true })
      break
    }
  }
  if (steps.length > 0 && steps[steps.length - 1].found !== true) {
    steps.push({ low, high, mid: -1, comparison: 'low > high', result: '未找到', found: false })
  }
  return steps
}

export default function SuffixArrayVisualization() {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [pattern, setPattern] = useState('ana')
  const [sa, setSa] = useState<number[]>([])
  const [lcp, setLcp] = useState<number[]>([])
  const [suffixEntries, setSuffixEntries] = useState<SuffixEntry[]>([])
  const [searchSteps, setSearchSteps] = useState<SearchStep[]>([])
  const [currentStep, setCurrentStep] = useState(-1)
  const [highlightLcp, setHighlightLcp] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [mode, setMode] = useState<'idle' | 'lcp' | 'search'>('idle')
  const [description, setDescription] = useState('输入字符串后点击"构建"开始演示')
  const timerRef = useRef<number | null>(null)
  const stepRef = useRef(0)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetHighlight = useCallback(() => {
    clearTimer()
    setCurrentStep(-1)
    setHighlightLcp(-1)
    setIsPlaying(false)
    setMode('idle')
    stepRef.current = 0
  }, [clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const handleBuild = useCallback(() => {
    const t = text.trim()
    if (t.length < 2 || t.length > 20) {
      setDescription('请输入 2-20 个字符的字符串')
      return
    }
    resetHighlight()
    const newSa = buildSuffixArray(t)
    const newLcp = buildLCPArray(t, newSa)
    const entries: SuffixEntry[] = newSa.map((idx, rank) => ({
      index: idx,
      suffix: t.substring(idx),
      rank
    }))
    setSa(newSa)
    setLcp(newLcp)
    setSuffixEntries(entries)
    setSearchSteps([])
    setDescription(`已构建后缀数组: SA = [${newSa.join(', ')}]，LCP = [${newLcp.join(', ')}]`)
  }, [text, resetHighlight])

  const handleAnimateLcp = useCallback(() => {
    if (lcp.length === 0) {
      setDescription('请先构建后缀数组')
      return
    }
    resetHighlight()
    setMode('lcp')
    setIsPlaying(true)
    setDescription('展示相邻后缀的 LCP（最长公共前缀）...')
    stepRef.current = 0

    timerRef.current = window.setInterval(() => {
      stepRef.current++
      if (stepRef.current >= lcp.length) {
        clearTimer()
        setIsPlaying(false)
        setHighlightLcp(-1)
        setMode('idle')
        setDescription('LCP 展示完成')
        return
      }
      setHighlightLcp(stepRef.current)
      const sa_val = sa[stepRef.current]
      const sa_prev = sa[stepRef.current - 1]
      const lcpVal = lcp[stepRef.current]
      setDescription(`LCP[${stepRef.current}] = ${lcpVal}  Suffix(${sa_prev})="${text.substring(sa_prev)}" 与 Suffix(${sa_val})="${text.substring(sa_val)}" 的公共前缀长度`)
    }, speed)
  }, [lcp, sa, text, speed, resetHighlight, clearTimer])

  const handleSearch = useCallback(() => {
    if (sa.length === 0) {
      setDescription('请先构建后缀数组')
      return
    }
    const p = pattern.trim()
    if (!p) {
      setDescription('请输入搜索模式串')
      return
    }
    resetHighlight()
    const steps = computeSearchSteps(text, sa, p)
    setSearchSteps(steps)
    setMode('search')
    setIsPlaying(true)
    stepRef.current = 0
    setDescription(`搜索模式 "${p}" ...`)

    timerRef.current = window.setInterval(() => {
      stepRef.current++
      if (stepRef.current >= steps.length) {
        clearTimer()
        setIsPlaying(false)
        setMode('idle')
        const lastStep = steps[steps.length - 1]
        if (lastStep.found) {
          const matchPos = sa[lastStep.mid]
          setDescription(`找到模式 "${p}"！匹配位置: ${matchPos}`)
        } else {
          setDescription(`模式 "${p}" 未在文本中找到`)
        }
        return
      }
      setCurrentStep(stepRef.current)
      const s = steps[stepRef.current]
      setDescription(`二分查找步骤 ${stepRef.current + 1}: 比较 ${s.comparison} -> ${s.result}`)
    }, speed)
  }, [text, sa, pattern, speed, resetHighlight, clearTimer])

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      clearTimer()
      setIsPlaying(false)
      setDescription('已暂停')
    } else {
      const seq = mode === 'search' ? searchSteps : null
      if (mode === 'search' && seq) {
        setIsPlaying(true)
        timerRef.current = window.setInterval(() => {
          stepRef.current++
          if (stepRef.current >= seq.length) {
            clearTimer()
            setIsPlaying(false)
            setMode('idle')
            const lastStep = seq[seq.length - 1]
            if (lastStep.found) {
              setDescription(`找到匹配！位置: ${sa[lastStep.mid]}`)
            } else {
              setDescription('未找到匹配')
            }
            return
          }
          setCurrentStep(stepRef.current)
          const s = seq[stepRef.current]
          setDescription(`步骤 ${stepRef.current + 1}: ${s.comparison} -> ${s.result}`)
        }, speed)
      } else if (mode === 'lcp') {
        setIsPlaying(true)
        timerRef.current = window.setInterval(() => {
          stepRef.current++
          if (stepRef.current >= lcp.length) {
            clearTimer()
            setIsPlaying(false)
            setHighlightLcp(-1)
            setMode('idle')
            setDescription('LCP 展示完成')
            return
          }
          setHighlightLcp(stepRef.current)
        }, speed)
      }
    }
  }, [isPlaying, mode, searchSteps, lcp, sa, speed, clearTimer])

  const handleReset = useCallback(() => {
    resetHighlight()
    setSearchSteps([])
    setDescription('已重置，可重新操作')
  }, [resetHighlight])

  const handleResetAll = useCallback(() => {
    setText(DEFAULT_TEXT)
    setPattern('ana')
    setSa([])
    setLcp([])
    setSuffixEntries([])
    setSearchSteps([])
    resetHighlight()
    setDescription('已重置为默认状态')
  }, [resetHighlight])

  const currentSearchStep = currentStep >= 0 && currentStep < searchSteps.length ? searchSteps[currentStep] : null
  const maxSuffixLen = Math.max(...suffixEntries.map(e => e.suffix.length), 1)
  const cellWidth = Math.max(28, Math.min(40, 600 / (maxSuffixLen + 3)))

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="输入字符串"
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '120px',
            fontSize: '0.85rem',
            fontFamily: 'Consolas, Monaco, monospace'
          }}
        />
        <button className="btn btn-primary" onClick={handleBuild} disabled={isPlaying}>
          构建
        </button>
        <button className="btn btn-primary" onClick={handleAnimateLcp} disabled={isPlaying || sa.length === 0}>
          展示 LCP
        </button>
        <input
          type="text"
          value={pattern}
          onChange={e => setPattern(e.target.value)}
          placeholder="搜索模式"
          style={{
            padding: '0.4rem 0.6rem',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            width: '100px',
            fontSize: '0.85rem',
            fontFamily: 'Consolas, Monaco, monospace'
          }}
        />
        <button className="btn btn-primary" onClick={handleSearch} disabled={isPlaying || sa.length === 0}>
          搜索
        </button>
        <button className="btn btn-secondary" onClick={handleTogglePlay} disabled={mode === 'idle'}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置动画
        </button>
        <button className="btn btn-secondary" onClick={handleResetAll}>
          全部重置
        </button>
      </div>

      <div className="viz-controls" style={{ marginTop: '0.25rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>速度:</span>
        <input
          type="range"
          min={200}
          max={2000}
          step={100}
          value={2200 - speed}
          onChange={e => setSpeed(2200 - parseInt(e.target.value))}
          title={`速度: ${speed}ms`}
        />
        {sa.length > 0 && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
            SA: [{sa.join(', ')}] | LCP: [{lcp.join(', ')}]
          </span>
        )}
      </div>

      <div className="viz-canvas" style={{ padding: '1rem', overflow: 'auto' }}>
        {suffixEntries.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>
            点击"构建"按钮开始演示
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* 后缀数组表格 */}
            <div style={{ flex: '1 1 400px', minWidth: '350px' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                后缀数组 (SA) - 排序后的后缀
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                {/* 表头 */}
                <div style={{ display: 'flex', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600 }}>
                  <div style={{ width: '40px', padding: '0.3rem', textAlign: 'center', borderRight: '1px solid var(--border)' }}>排名</div>
                  <div style={{ width: '40px', padding: '0.3rem', textAlign: 'center', borderRight: '1px solid var(--border)' }}>SA</div>
                  <div style={{ width: '40px', padding: '0.3rem', textAlign: 'center', borderRight: '1px solid var(--border)' }}>LCP</div>
                  <div style={{ flex: 1, padding: '0.3rem', textAlign: 'center' }}>后缀</div>
                </div>
                {/* 数据行 */}
                {suffixEntries.map((entry, i) => {
                  const isLcpHighlight = highlightLcp === i
                  const isSearchMid = currentSearchStep?.mid === i
                  const isInRange = currentSearchStep && i >= currentSearchStep.low && i <= currentSearchStep.high
                  const lcpLen = i === 0 ? 0 : lcp[i]

                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        borderBottom: '1px solid var(--border)',
                        background: isSearchMid
                          ? 'rgba(245, 158, 11, 0.2)'
                          : isInRange
                          ? 'rgba(96, 165, 250, 0.1)'
                          : isLcpHighlight
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'transparent',
                        transition: 'background 0.3s ease',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ width: '40px', padding: '0.3rem', textAlign: 'center', borderRight: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        {i}
                      </div>
                      <div style={{ width: '40px', padding: '0.3rem', textAlign: 'center', borderRight: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {entry.index}
                      </div>
                      <div style={{
                        width: '40px',
                        padding: '0.3rem',
                        textAlign: 'center',
                        borderRight: '1px solid var(--border)',
                        color: lcpLen > 0 ? '#10b981' : 'var(--text-secondary)',
                        fontWeight: lcpLen > 0 ? 600 : 400
                      }}>
                        {lcpLen}
                      </div>
                      <div style={{ flex: 1, padding: '0.3rem', fontFamily: 'Consolas, Monaco, monospace', display: 'flex' }}>
                        {entry.suffix.split('').map((ch, j) => {
                          const isLcpChar = isLcpHighlight && j < lcpLen
                          return (
                            <span
                              key={j}
                              style={{
                                display: 'inline-block',
                                width: cellWidth,
                                textAlign: 'center',
                                background: isLcpChar ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
                                color: isLcpChar ? '#10b981' : 'var(--text-primary)',
                                borderRadius: isLcpChar ? '2px' : '0',
                                fontWeight: isLcpChar ? 700 : 400,
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {ch}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 二分查找可视化 */}
            {currentSearchStep && (
              <div style={{ flex: '1 1 300px', minWidth: '280px' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  二分查找过程
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>模式: </span>
                    <span style={{ fontFamily: 'Consolas, Monaco, monospace', fontWeight: 600, color: '#f59e0b' }}>"{pattern}"</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>low: </span>
                      <span style={{ fontWeight: 600 }}>{currentSearchStep.low}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>high: </span>
                      <span style={{ fontWeight: 600 }}>{currentSearchStep.high}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>mid: </span>
                      <span style={{ fontWeight: 600, color: '#f59e0b' }}>{currentSearchStep.mid >= 0 ? currentSearchStep.mid : '-'}</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>比较: </span>
                    <span style={{ fontFamily: 'Consolas, Monaco, monospace' }}>{currentSearchStep.comparison}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)' }}>结果: </span>
                    <span style={{ color: currentSearchStep.found === true ? '#10b981' : currentSearchStep.found === false ? '#ef4444' : 'var(--accent)', fontWeight: 600 }}>
                      {currentSearchStep.result}
                    </span>
                  </div>
                </div>

                {/* 搜索范围可视化 */}
                <div style={{ marginTop: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '0.75rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>搜索范围</div>
                  <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                    {sa.map((_, i) => {
                      const isMid = currentSearchStep.mid === i
                      const isInRange = i >= currentSearchStep.low && i <= currentSearchStep.high
                      return (
                        <div
                          key={i}
                          style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: isMid ? 700 : 400,
                            background: isMid ? '#f59e0b' : isInRange ? 'var(--accent)' : 'var(--border)',
                            color: isMid || isInRange ? '#fff' : 'var(--text-secondary)',
                            borderRadius: '4px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {i}
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    <span>low={currentSearchStep.low}</span>
                    <span>high={currentSearchStep.high}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="viz-info">
        {description}
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>后缀数组信息</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>文本: "{text}" (长度 {text.length})</div>
            <div>后缀数: {suffixEntries.length}</div>
            <div>LCP 总和: {lcp.reduce((s, v) => s + v, 0)}</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', background: 'var(--bg-card)', padding: '0.75rem', borderRadius: 'var(--radius)', fontSize: '0.85rem' }}>
          <strong>操作说明</strong>
          <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
            <div>构建: 生成后缀数组和 LCP 数组</div>
            <div>展示 LCP: 逐个高亮相邻后缀的公共前缀</div>
            <div>搜索: 在后缀数组上二分查找模式串</div>
            <div>绿色高亮 = LCP 区域</div>
          </div>
        </div>
      </div>
    </div>
  )
}
