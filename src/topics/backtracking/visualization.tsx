import { useState, useEffect, useRef, useCallback } from 'react'

// --- Types ---

interface QueenPlacement {
  row: number
  col: number
  state: 'placed' | 'conflict' | 'backtrack'
}

interface VizStep {
  queens: QueenPlacement[]
  currentRow: number
  currentCol: number
  description: string
  action: 'place' | 'conflict' | 'backtrack' | 'solution'
  backtrackCount: number
  solutionCount: number
}

// --- Generate N-Queens Steps ---

function generateNQueensSteps(n: number): VizStep[] {
  const steps: VizStep[] = []
  const board: number[] = new Array(n).fill(-1)
  let backtracks = 0
  let solutions = 0

  function isSafe(row: number, col: number): boolean {
    for (let i = 0; i < row; i++) {
      if (board[i] === col) return false
      if (Math.abs(board[i] - col) === Math.abs(i - row)) return false
    }
    return true
  }

  function getQueens(): QueenPlacement[] {
    const queens: QueenPlacement[] = []
    for (let r = 0; r < n; r++) {
      if (board[r] !== -1) {
        queens.push({ row: r, col: board[r], state: 'placed' })
      }
    }
    return queens
  }

  function getConflicts(row: number, col: number): QueenPlacement[] {
    const conflicts: QueenPlacement[] = []
    for (let i = 0; i < row; i++) {
      if (board[i] === col || Math.abs(board[i] - col) === Math.abs(i - row)) {
        conflicts.push({ row: i, col: board[i], state: 'conflict' })
      }
    }
    return conflicts
  }

  function solve(row: number): void {
    if (row === n) {
      solutions++
      steps.push({
        queens: getQueens(),
        currentRow: n,
        currentCol: -1,
        description: `找到第 ${solutions} 组解！`,
        action: 'solution',
        backtrackCount: backtracks,
        solutionCount: solutions,
      })
      return
    }

    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        // Place queen
        board[row] = col
        steps.push({
          queens: getQueens(),
          currentRow: row,
          currentCol: col,
          description: `在第 ${row} 行第 ${col} 列放置皇后`,
          action: 'place',
          backtrackCount: backtracks,
          solutionCount: solutions,
        })

        solve(row + 1)

        // Backtrack - remove queen
        board[row] = -1
        if (row + 1 < n) {
          const queens = getQueens()
          queens.push({ row: row, col: col, state: 'backtrack' })
          steps.push({
            queens,
            currentRow: row,
            currentCol: col,
            description: `移除第 ${row} 行第 ${col} 列的皇后（回溯）`,
            action: 'backtrack',
            backtrackCount: backtracks,
            solutionCount: solutions,
          })
        }
      } else {
        backtracks++
        if (backtracks <= 50) {
          // Only record first 50 conflicts to avoid too many steps
          const queens = getQueens()
          const conflicts = getConflicts(row, col)
          steps.push({
            queens: [...queens, ...conflicts],
            currentRow: row,
            currentCol: col,
            description: `第 ${row} 行第 ${col} 列与已有皇后冲突，跳过`,
            action: 'conflict',
            backtrackCount: backtracks,
            solutionCount: solutions,
          })
        }
      }
    }
  }

  // Initial step
  steps.push({
    queens: [],
    currentRow: 0,
    currentCol: -1,
    description: `开始求解 ${n} 皇后问题`,
    action: 'place',
    backtrackCount: 0,
    solutionCount: 0,
  })

  solve(0)

  // Final summary
  steps.push({
    queens: [],
    currentRow: -1,
    currentCol: -1,
    description: `搜索完成！共找到 ${solutions} 组解，回溯 ${backtracks} 次`,
    action: 'solution',
    backtrackCount: backtracks,
    solutionCount: solutions,
  })

  return steps
}

// --- Component ---

export default function BacktrackingVisualization() {
  const [boardSize, setBoardSize] = useState(6)
  const [steps, setSteps] = useState<VizStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const timerRef = useRef<number | null>(null)

  // Generate steps
  const initDemo = useCallback(() => {
    setIsPlaying(false)
    setCurrentStep(0)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const newSteps = generateNQueensSteps(boardSize)
    setSteps(newSteps)
  }, [boardSize])

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
      return
    }

    timerRef.current = window.setTimeout(() => {
      const next = currentStep + 1
      if (next < steps.length) {
        setCurrentStep(next)
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
  }, [isPlaying, currentStep, steps.length, speed])

  // Init on mount and board size change
  useEffect(() => {
    initDemo()
  }, [initDemo])

  // Controls
  const togglePlay = () => {
    if (steps.length === 0) return
    if (currentStep >= steps.length - 1) {
      initDemo()
      setTimeout(() => setIsPlaying(true), 50)
      return
    }
    setIsPlaying(prev => !prev)
  }

  const stepForward = () => {
    setIsPlaying(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const stepBackward = () => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const reset = () => {
    initDemo()
  }

  // Current step data
  const step = steps[currentStep]
  const queenMap = new Map<string, string>() // "row,col" -> state
  if (step) {
    for (const q of step.queens) {
      queenMap.set(`${q.row},${q.col}`, q.state)
    }
  }

  // Cell size
  const maxCellSize = 48
  const minCellSize = 28
  const cellSize = Math.max(minCellSize, Math.min(maxCellSize, Math.floor(400 / boardSize)))

  const renderBoard = () => {
    if (!step) return null

    const rows = []
    for (let row = 0; row < boardSize; row++) {
      const cells = []
      for (let col = 0; col < boardSize; col++) {
        const key = `${row},${col}`
        const queenState = queenMap.get(key)
        const isLight = (row + col) % 2 === 0
        const isCurrent = row === step.currentRow && col === step.currentCol

        let bg = isLight ? '#f0d9b5' : '#b58863'
        let color = 'transparent'
        let border = 'none'
        let boxShadow = 'none'

        if (queenState === 'placed') {
          bg = isLight ? '#e8f5e9' : '#c8e6c9'
          color = '#2e7d32'
        } else if (queenState === 'conflict') {
          bg = '#ffcdd2'
          color = '#c62828'
          border = '2px solid #c62828'
        } else if (queenState === 'backtrack') {
          bg = '#fff3e0'
          color = '#e65100'
          border = '2px dashed #e65100'
        }

        if (isCurrent && step.action === 'conflict') {
          bg = '#ef9a9a'
          boxShadow = '0 0 8px rgba(198, 40, 40, 0.5)'
        } else if (isCurrent && step.action === 'place') {
          boxShadow = '0 0 8px rgba(46, 125, 50, 0.5)'
        }

        cells.push(
          <div
            key={col}
            style={{
              width: cellSize,
              height: cellSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: bg,
              border: border !== 'none' ? border : '1px solid rgba(0,0,0,0.1)',
              color,
              fontSize: cellSize * 0.55,
              fontWeight: 'bold',
              cursor: 'default',
              transition: 'all 0.25s ease',
              position: 'relative',
              boxShadow,
            }}
          >
            {queenState && queenState !== 'backtrack' ? '♛' : ''}
            {queenState === 'backtrack' ? '♛' : ''}
          </div>
        )
      }
      rows.push(
        <div key={row} style={{ display: 'flex' }}>
          {cells}
        </div>
      )
    }

    return (
      <div style={{ display: 'inline-block', border: '2px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {rows}
      </div>
    )
  }

  return (
    <div className="visualization-container">
      {/* Controls */}
      <div className="viz-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          棋盘大小:
          <select
            value={boardSize}
            onChange={e => setBoardSize(Number(e.target.value))}
            style={{
              padding: '0.3rem 0.5rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
            }}
          >
            {[4, 5, 6, 7, 8].map(v => (
              <option key={v} value={v}>{v}×{v}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Playback controls */}
      <div className="viz-controls">
        <button className="btn btn-secondary" onClick={stepBackward} disabled={currentStep <= 0}>
          上一步
        </button>
        <button className="btn btn-primary" onClick={togglePlay}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        <button className="btn btn-secondary" onClick={stepForward} disabled={currentStep >= steps.length - 1}>
          下一步
        </button>
        <button className="btn btn-secondary" onClick={reset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          速度:
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          />
          {speed}ms
        </label>
      </div>

      {/* Info bar */}
      <div className="viz-info">
        <span>步骤: {steps.length > 0 ? currentStep + 1 : 0} / {steps.length}</span>
        {step && (
          <>
            <span style={{ marginLeft: '1.5rem' }}>找到解: {step.solutionCount}</span>
            <span style={{ marginLeft: '1.5rem' }}>回溯次数: {step.backtrackCount}</span>
          </>
        )}
      </div>

      {/* Main canvas */}
      <div className="viz-canvas" style={{ minHeight: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
        {renderBoard()}
      </div>

      {/* Description */}
      {step && (
        <div className="viz-info" style={{ fontWeight: 500 }}>
          {step.description}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <span>
          <span style={{ display: 'inline-block', width: 14, height: 14, background: '#c8e6c9', border: '1px solid rgba(0,0,0,0.15)', marginRight: 4, verticalAlign: 'middle', borderRadius: 2 }} />
          已放置
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 14, height: 14, background: '#ffcdd2', border: '1px solid #c62828', marginRight: 4, verticalAlign: 'middle', borderRadius: 2 }} />
          冲突
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 14, height: 14, background: '#fff3e0', border: '1px dashed #e65100', marginRight: 4, verticalAlign: 'middle', borderRadius: 2 }} />
          回溯
        </span>
      </div>
    </div>
  )
}
