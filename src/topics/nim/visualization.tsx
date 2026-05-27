import { useState, useCallback, useMemo } from 'react'

type Player = 'human' | 'computer'
type GamePhase = 'setup' | 'playing' | 'finished'

interface GameState {
  piles: number[]
  currentPlayer: Player
  phase: GamePhase
  winner: Player | null
  selectedPile: number | null
  takeCount: number
  lastMove: { pile: number; taken: number } | null
  message: string
}

function computeXor(piles: number[]): number {
  return piles.reduce((a, b) => a ^ b, 0)
}

function toBinary(n: number, width: number = 4): string {
  return n.toString(2).padStart(width, '0')
}

function findBestMove(piles: number[]): [number, number] | null {
  const xor = computeXor(piles)
  if (xor === 0) return null
  for (let i = 0; i < piles.length; i++) {
    const target = piles[i] ^ xor
    if (target < piles[i]) {
      return [i, piles[i] - target]
    }
  }
  return null
}

function makeComputerMove(piles: number[]): [number, number] {
  const best = findBestMove(piles)
  if (best) return best
  // Losing position: make any valid move
  for (let i = 0; i < piles.length; i++) {
    if (piles[i] > 0) return [i, 1]
  }
  return [0, 0] // Should not happen
}

export default function NimVisualization() {
  const [gameState, setGameState] = useState<GameState>({
    piles: [3, 4, 5],
    currentPlayer: 'human',
    phase: 'setup',
    winner: null,
    selectedPile: null,
    takeCount: 1,
    lastMove: null,
    message: '点击"开始游戏"与计算机对战，或调整堆数后开始',
  })

  const [showBinary, setShowBinary] = useState(true)
  const [newPileSize, setNewPileSize] = useState(4)
  const [humanFirst, setHumanFirst] = useState(true)

  const xorResult = useMemo(() => computeXor(gameState.piles), [gameState.piles])
  const isLosingPosition = xorResult === 0

  const handleAddPile = useCallback(() => {
    if (newPileSize < 1 || newPileSize > 20) return
    setGameState(prev => ({
      ...prev,
      piles: [...prev.piles, newPileSize],
      message: `添加了一堆 ${newPileSize} 个石子`,
    }))
  }, [newPileSize])

  const handleStartGame = useCallback(() => {
    if (gameState.piles.length === 0 || gameState.piles.every(p => p === 0)) {
      setGameState(prev => ({ ...prev, message: '请先添加石子堆' }))
      return
    }
    const firstPlayer: Player = humanFirst ? 'human' : 'computer'
    setGameState(prev => ({
      ...prev,
      currentPlayer: firstPlayer,
      phase: 'playing',
      winner: null,
      selectedPile: null,
      takeCount: 1,
      lastMove: null,
      message: firstPlayer === 'human'
        ? '你的回合！选择一堆石子并决定取走多少个'
        : '计算机正在思考...',
    }))

    // If computer goes first
    if (!humanFirst) {
      setTimeout(() => {
        setGameState(prev => {
          const [pileIdx, taken] = makeComputerMove(prev.piles)
          const newPiles = [...prev.piles]
          newPiles[pileIdx] -= taken
          const isWin = newPiles.every(p => p === 0)
          return {
            ...prev,
            piles: newPiles,
            currentPlayer: 'human',
            lastMove: { pile: pileIdx, taken },
            winner: isWin ? 'computer' : null,
            phase: isWin ? 'finished' : 'playing',
            selectedPile: null,
            takeCount: 1,
            message: isWin
              ? '计算机取走最后一个石子，计算机获胜！'
              : `计算机从第 ${pileIdx + 1} 堆取走了 ${taken} 个石子。轮到你了！`,
          }
        })
      }, 800)
    }
  }, [gameState.piles, humanFirst])

  const handleSelectPile = useCallback((index: number) => {
    if (gameState.phase !== 'playing' || gameState.currentPlayer !== 'human') return
    if (gameState.piles[index] === 0) return
    setGameState(prev => ({
      ...prev,
      selectedPile: index,
      takeCount: 1,
      message: `已选择第 ${index + 1} 堆（${gameState.piles[index]} 个石子），选择取走数量`,
    }))
  }, [gameState.phase, gameState.currentPlayer, gameState.piles])

  const handleTake = useCallback(() => {
    if (gameState.phase !== 'playing' || gameState.currentPlayer !== 'human') return
    if (gameState.selectedPile === null) return
    if (gameState.takeCount < 1 || gameState.takeCount > gameState.piles[gameState.selectedPile]) return

    const pileIdx = gameState.selectedPile
    const taken = gameState.takeCount
    const newPiles = [...gameState.piles]
    newPiles[pileIdx] -= taken
    const isWin = newPiles.every(p => p === 0)

    if (isWin) {
      setGameState(prev => ({
        ...prev,
        piles: newPiles,
        lastMove: { pile: pileIdx, taken },
        winner: 'human',
        phase: 'finished',
        selectedPile: null,
        takeCount: 1,
        message: '你取走了最后一个石子，你获胜了！',
      }))
      return
    }

    setGameState(prev => ({
      ...prev,
      piles: newPiles,
      currentPlayer: 'computer',
      lastMove: { pile: pileIdx, taken },
      selectedPile: null,
      takeCount: 1,
      message: `你从第 ${pileIdx + 1} 堆取走了 ${taken} 个石子。计算机正在思考...`,
    }))

    // Computer's turn
    setTimeout(() => {
      setGameState(prev => {
        if (prev.phase !== 'playing') return prev
        const [cPileIdx, cTaken] = makeComputerMove(prev.piles)
        const cNewPiles = [...prev.piles]
        cNewPiles[cPileIdx] -= cTaken
        const cIsWin = cNewPiles.every(p => p === 0)
        return {
          ...prev,
          piles: cNewPiles,
          currentPlayer: 'human',
          lastMove: { pile: cPileIdx, taken: cTaken },
          winner: cIsWin ? 'computer' : null,
          phase: cIsWin ? 'finished' : 'playing',
          message: cIsWin
            ? '计算机取走最后一个石子，计算机获胜！'
            : `计算机从第 ${cPileIdx + 1} 堆取走了 ${cTaken} 个石子。轮到你了！`,
        }
      })
    }, 800)
  }, [gameState])

  const handleReset = useCallback(() => {
    setGameState({
      piles: [3, 4, 5],
      currentPlayer: 'human',
      phase: 'setup',
      winner: null,
      selectedPile: null,
      takeCount: 1,
      lastMove: null,
      message: '已重置。点击"开始游戏"与计算机对战',
    })
  }, [])

  const maxPile = Math.max(...gameState.piles, 1)
  const maxWidth = Math.max(...gameState.piles.map(p => toBinary(p).length), 4)

  return (
    <div className="visualization-container">
      {/* Game controls */}
      <div className="viz-controls" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        {gameState.phase === 'setup' ? (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              堆大小:
              <input
                type="number"
                min="1"
                max="20"
                value={newPileSize}
                onChange={(e) => setNewPileSize(Number(e.target.value))}
                style={{ width: '50px', padding: '2px 4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)' }}
              />
              <button className="btn btn-secondary" onClick={handleAddPile} style={{ padding: '2px 8px', fontSize: '0.8rem' }}>
                添加堆
              </button>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={humanFirst}
                onChange={(e) => setHumanFirst(e.target.checked)}
              />
              玩家先手
            </label>
            <button className="btn btn-primary" onClick={handleStartGame}>
              开始游戏
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-secondary" onClick={handleReset}>
              重新开始
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={showBinary}
                onChange={(e) => setShowBinary(e.target.checked)}
              />
              显示二进制
            </label>
          </>
        )}
      </div>

      {/* Status bar */}
      <div style={{
        padding: '0.5rem 1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
      }}>
        <span>
          石子堆: [{gameState.piles.join(', ')}]
        </span>
        {gameState.phase !== 'setup' && (
          <span style={{
            padding: '2px 8px',
            borderRadius: '4px',
            background: gameState.currentPlayer === 'human' ? '#3b82f622' : '#f59e0b22',
            border: `1px solid ${gameState.currentPlayer === 'human' ? '#3b82f6' : '#f59e0b'}`,
            color: gameState.currentPlayer === 'human' ? '#60a5fa' : '#fbbf24',
            fontWeight: 'bold',
          }}>
            {gameState.currentPlayer === 'human' ? '你的回合' : '计算机回合'}
          </span>
        )}
      </div>

      {/* Pile visualization */}
      <div className="viz-canvas" style={{ padding: '1rem' }}>
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          {gameState.piles.map((pile, index) => {
            const isSelected = gameState.selectedPile === index
            const isLastMovePile = gameState.lastMove?.pile === index
            const isEmpty = pile === 0

            return (
              <div
                key={index}
                onClick={() => handleSelectPile(index)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  cursor: gameState.phase === 'playing' && gameState.currentPlayer === 'human' && !isEmpty ? 'pointer' : 'default',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: `2px solid ${isSelected ? '#3b82f6' : isLastMovePile ? '#f59e0b' : 'transparent'}`,
                  background: isSelected ? '#3b82f611' : 'transparent',
                  transition: 'all 0.2s',
                  opacity: isEmpty ? 0.4 : 1,
                  minWidth: '80px',
                }}
              >
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  fontWeight: isSelected ? 'bold' : 'normal',
                }}>
                  堆 {index + 1}
                </div>

                {/* Stone stack */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  alignItems: 'center',
                  gap: '3px',
                  minHeight: `${maxPile * 22}px`,
                  justifyContent: 'flex-start',
                }}>
                  {Array.from({ length: pile }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isSelected
                          ? '#3b82f6'
                          : isLastMovePile && i >= pile
                            ? '#f59e0b'
                            : 'var(--text-secondary)',
                        opacity: isSelected ? 1 : 0.8,
                        transition: 'all 0.3s',
                      }}
                    />
                  ))}
                </div>

                <div style={{
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: isEmpty ? 'var(--text-secondary)' : 'var(--text-primary)',
                }}>
                  {pile}
                </div>

                {showBinary && !isEmpty && (
                  <div style={{
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}>
                    {toBinary(pile, maxWidth)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* XOR computation display */}
        <div style={{
          textAlign: 'center',
          padding: '0.75rem',
          background: isLosingPosition ? '#ef444422' : '#22c55e22',
          borderRadius: '8px',
          border: `1px solid ${isLosingPosition ? '#ef4444' : '#22c55e'}`,
          marginBottom: '1rem',
        }}>
          {showBinary && (
            <div style={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.3rem',
            }}>
              {gameState.piles.map(p => toBinary(p, maxWidth)).join(' XOR ')}
            </div>
          )}
          <div style={{
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '1.1rem',
            fontWeight: 'bold',
          }}>
            {gameState.piles.join(' XOR ')} = {xorResult}
          </div>
          <div style={{
            marginTop: '0.3rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: isLosingPosition ? '#ef4444' : '#22c55e',
          }}>
            {gameState.phase === 'finished'
              ? (gameState.winner === 'human' ? '你获胜了！' : '计算机获胜！')
              : (isLosingPosition ? 'P 态 - 先手必败' : 'N 态 - 先手必胜')
            }
          </div>
        </div>

        {/* Take controls for human player */}
        {gameState.phase === 'playing' && gameState.currentPlayer === 'human' && gameState.selectedPile !== null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            marginBottom: '1rem',
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              从第 {gameState.selectedPile + 1} 堆取走:
            </span>
            <input
              type="range"
              min={1}
              max={gameState.piles[gameState.selectedPile]}
              value={gameState.takeCount}
              onChange={(e) => setGameState(prev => ({ ...prev, takeCount: Number(e.target.value) }))}
              style={{ width: '120px' }}
            />
            <span style={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              minWidth: '24px',
              textAlign: 'center',
            }}>
              {gameState.takeCount}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              个石子
            </span>
            <button className="btn btn-primary" onClick={handleTake}>
              确认取走
            </button>
          </div>
        )}

        {/* Hint for winning position */}
        {gameState.phase === 'playing' && gameState.currentPlayer === 'human' && !isLosingPosition && gameState.selectedPile === null && (
          <div style={{
            textAlign: 'center',
            padding: '0.5rem',
            color: '#22c55e',
            fontSize: '0.85rem',
            opacity: 0.8,
          }}>
            提示: 当前是必胜态，选择一堆石子开始操作
          </div>
        )}

        {gameState.phase === 'playing' && gameState.currentPlayer === 'human' && isLosingPosition && gameState.selectedPile === null && (
          <div style={{
            textAlign: 'center',
            padding: '0.5rem',
            color: '#ef4444',
            fontSize: '0.85rem',
            opacity: 0.8,
          }}>
            提示: 当前是必败态，但尽力而为！选择一堆石子开始操作
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="viz-info">
        <strong>说明：</strong> {gameState.message}
      </div>

      {/* Binary XOR detail */}
      {showBinary && gameState.piles.length > 0 && (
        <div style={{
          padding: '0.75rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            逐位 XOR 分析
          </div>
          <div style={{
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.8rem',
            lineHeight: '1.6',
          }}>
            {Array.from({ length: maxWidth }, (_, bit) => {
              const bitIdx = maxWidth - 1 - bit
              const bits = gameState.piles.map(p => (p >> bitIdx) & 1)
              const xorBit = bits.reduce((a, b) => a ^ b, 0)
              return (
                <div key={bitIdx} style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)', minWidth: '40px' }}>
                    位 {bitIdx}:
                  </span>
                  <span>
                    {bits.join(' XOR ')} = <span style={{ color: xorBit ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>{xorBit}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          已选择的堆
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />
          上次操作的堆
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          N 态 (必胜)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          P 态 (必败)
        </span>
      </div>
    </div>
  )
}
