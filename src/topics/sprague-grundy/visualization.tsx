import { useState, useCallback } from 'react'

interface SGNode {
  value: number
  sg: number
  reachable: number[]
  isComputing: boolean
}

function mex(s: Set<number>): number {
  let i = 0
  while (s.has(i)) i++
  return i
}

export default function SpragueGrundyVisualization() {
  const [piles, setPiles] = useState<number[]>([3, 5, 7])
  const [moves, setMoves] = useState<number[]>([1, 2])
  const [sgValues, setSgValues] = useState<number[]>([])
  const [xorResult, setXorResult] = useState<number | null>(null)
  const [computingIndex, setComputingIndex] = useState<number>(-1)
  const [computingSG, setComputingSG] = useState<SGNode | null>(null)
  const [description, setDescription] = useState<string>('Sprague-Grundy 定理可视化 - 点击「计算 SG 值」开始')
  const [newPileSize, setNewPileSize] = useState<number>(4)
  const [newMoveSize, setNewMoveSize] = useState<number>(3)

  const computeSGForValue = useCallback((n: number, moveSet: number[]): { sg: number; reachable: number[] } => {
    if (n === 0) return { sg: 0, reachable: [] }
    const reachable: number[] = []
    for (const move of moveSet) {
      if (n - move >= 0) {
        const sg = computeSGForValue(n - move, moveSet).sg
        if (!reachable.includes(sg)) reachable.push(sg)
      }
    }
    reachable.sort((a, b) => a - b)
    return { sg: mex(new Set(reachable)), reachable }
  }, [])

  const handleComputeSG = useCallback(() => {
    const results: number[] = []
    for (const pile of piles) {
      const { sg } = computeSGForValue(pile, moves)
      results.push(sg)
    }
    setSgValues(results)
    const xor = results.reduce((a, b) => a ^ b, 0)
    setXorResult(xor)
    setComputingIndex(-1)
    setComputingSG(null)

    const sgStr = results.map((sg, i) => `SG(${piles[i]})=${sg}`).join(' XOR ')
    const resultStr = xor === 0 ? 'P 态（先手必败）' : 'N 态（先手必胜）'
    setDescription(`计算完成: ${sgStr} = ${xor} → ${resultStr}`)
  }, [piles, moves, computeSGForValue])

  const handleShowStep = useCallback((index: number) => {
    if (index >= piles.length) return
    setComputingIndex(index)
    const pile = piles[index]
    const { sg, reachable } = computeSGForValue(pile, moves)
    setComputingSG({ value: pile, sg, reachable, isComputing: true })
    setDescription(`正在计算第 ${index + 1} 堆 SG(${pile}): 后继 SG 值集合 = {${reachable.join(', ')}}，mex = ${sg}`)
  }, [piles, moves, computeSGForValue])

  const handleAddPile = useCallback(() => {
    if (newPileSize < 1 || newPileSize > 20) return
    setPiles(prev => [...prev, newPileSize])
    setSgValues([])
    setXorResult(null)
    setComputingIndex(-1)
    setComputingSG(null)
    setDescription(`添加石子堆: ${newPileSize} 个石子`)
  }, [newPileSize])

  const handleRemovePile = useCallback((index: number) => {
    setPiles(prev => prev.filter((_, i) => i !== index))
    setSgValues([])
    setXorResult(null)
    setComputingIndex(-1)
    setComputingSG(null)
    setDescription(`移除第 ${index + 1} 堆石子`)
  }, [])

  const handleAddMove = useCallback(() => {
    if (newMoveSize < 1 || moves.includes(newMoveSize)) return
    setMoves(prev => [...prev, newMoveSize].sort((a, b) => a - b))
    setSgValues([])
    setXorResult(null)
    setComputingIndex(-1)
    setComputingSG(null)
    setDescription(`添加可取石子数: ${newMoveSize}`)
  }, [newMoveSize, moves])

  const handleReset = useCallback(() => {
    setPiles([3, 5, 7])
    setMoves([1, 2])
    setSgValues([])
    setXorResult(null)
    setComputingIndex(-1)
    setComputingSG(null)
    setDescription('已重置为默认配置')
  }, [])

  const maxPile = Math.max(...piles, 10)
  const barMax = Math.max(...Array.from({ length: maxPile + 1 }, (_, n) => computeSGForValue(n, moves).sg), 1)

  return (
    <div className="visualization-container">
      <div className="viz-controls" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <button className="btn btn-primary" onClick={handleComputeSG}>
          计算 SG 值
        </button>
        <button className="btn btn-primary" onClick={() => {
          if (computingIndex < 0) handleShowStep(0)
          else if (computingIndex < piles.length - 1) handleShowStep(computingIndex + 1)
        }} disabled={computingIndex >= 0 && computingIndex >= piles.length - 1}>
          逐步计算
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>

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
          可取数:
          <input
            type="number"
            min="1"
            max="20"
            value={newMoveSize}
            onChange={(e) => setNewMoveSize(Number(e.target.value))}
            style={{ width: '50px', padding: '2px 4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)' }}
          />
          <button className="btn btn-secondary" onClick={handleAddMove} style={{ padding: '2px 8px', fontSize: '0.8rem' }}>
            添加
          </button>
        </label>
      </div>

      <div style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span>石子堆: [{piles.join(', ')}]</span>
        <span>每次可取: [{moves.join(', ')}] 个</span>
        <span>
          堆按钮:
          {piles.map((p, i) => (
            <button
              key={i}
              onClick={() => handleRemovePile(i)}
              style={{
                marginLeft: '4px',
                padding: '0 6px',
                fontSize: '0.8rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              {p} x
            </button>
          ))}
        </span>
      </div>

      <div className="viz-canvas" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {piles.map((pile, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                堆 {index + 1}
              </div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '120px' }}>
                {Array.from({ length: pile }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: computingIndex === index ? 'var(--accent, #3b82f6)' : 'var(--text-secondary)',
                      opacity: computingIndex === index ? 1 : 0.7,
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>
              <div style={{
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: sgValues.length > index
                  ? (sgValues[index] === 0 ? '#ef4444' : '#22c55e')
                  : 'var(--text-primary)',
              }}>
                {sgValues.length > index ? `SG = ${sgValues[index]}` : `n = ${pile}`}
              </div>
            </div>
          ))}
        </div>

        {xorResult !== null && (
          <div style={{
            textAlign: 'center',
            padding: '0.75rem',
            background: xorResult === 0 ? '#ef444422' : '#22c55e22',
            borderRadius: '8px',
            border: `1px solid ${xorResult === 0 ? '#ef4444' : '#22c55e'}`,
            marginBottom: '1rem',
          }}>
            <div style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '1.1rem', fontWeight: 'bold' }}>
              {sgValues.map((sg) => `${sg}`).join(' XOR ')} = {xorResult}
            </div>
            <div style={{
              marginTop: '0.3rem',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: xorResult === 0 ? '#ef4444' : '#22c55e',
            }}>
              {xorResult === 0 ? 'P 态 - 先手必败' : 'N 态 - 先手必胜'}
            </div>
          </div>
        )}

        {computingSG !== null && (
          <div style={{
            padding: '0.75rem',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            marginBottom: '1rem',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>
              SG({computingSG.value}) 计算过程:
            </div>
            <div style={{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.9rem' }}>
              {computingSG.reachable.length > 0
                ? `后继 SG 值集合 = {${computingSG.reachable.join(', ')}}, mex = ${computingSG.sg}`
                : `终止局面, SG = 0`}
            </div>
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            SG 值表 (规则: 每次取 [{moves.join(', ')}] 个)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100px', overflowX: 'auto', padding: '0.5rem 0' }}>
            {Array.from({ length: maxPile + 1 }, (_, n) => {
              const { sg } = computeSGForValue(n, moves)
              const height = barMax > 0 ? (sg / barMax) * 80 : 0
              return (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '20px' }}>
                  <div style={{ fontSize: '0.7rem', color: sg === 0 ? '#ef4444' : 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace' }}>
                    {sg}
                  </div>
                  <div style={{
                    width: '16px',
                    height: `${Math.max(height, 4)}px`,
                    background: sg === 0 ? '#ef4444' : 'var(--accent, #3b82f6)',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.3s',
                  }} />
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'Consolas, Monaco, monospace' }}>
                    {n}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="viz-info">
        <strong>说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          SG = 0 (P 态 / 必败)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          SG != 0 (N 态 / 必胜)
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'var(--accent, #3b82f6)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前计算
        </span>
      </div>
    </div>
  )
}
