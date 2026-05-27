function mex(s: Set<number>): number {
  let i = 0
  while (s.has(i)) i++
  return i
}

function computeSG(n: number, moves: number[]): number {
  if (n === 0) return 0
  const reachable = new Set<number>()
  for (const move of moves) {
    if (n - move >= 0) {
      reachable.add(computeSG(n - move, moves))
    }
  }
  return mex(reachable)
}

export default function spragueGrundyDemo(): string {
  const output: string[] = []

  output.push('=== Sprague-Grundy 定理演示 ===\n')

  // 1. mex 运算演示
  output.push('1. mex (Minimum Excluded) 运算演示:')
  const mexExamples: [Set<number>, number][] = [
    [new Set(), 0],
    [new Set([0]), 1],
    [new Set([0, 1, 2]), 3],
    [new Set([1, 3]), 0],
    [new Set([0, 2, 3]), 1],
  ]
  for (const [s, expected] of mexExamples) {
    const result = mex(s)
    const setStr = `{${[...s].sort((a, b) => a - b).join(', ')}}`
    output.push(`   mex(${setStr}) = ${result}  ${result === expected ? '✓' : '✗'}`)
  }
  output.push('')

  // 2. 一维取石子 SG 值
  output.push('2. 一维取石子游戏 (每次取 1 或 2 个) SG 值:')
  output.push('   SG(0) = 0 (终止局面)')
  const moves = [1, 2]
  const sgValues: number[] = [0]
  for (let n = 1; n <= 10; n++) {
    const sg = computeSG(n, moves)
    sgValues.push(sg)
    const reachable = new Set<number>()
    for (const move of moves) {
      if (n - move >= 0) reachable.add(sgValues[n - move])
    }
    const reachableStr = `{${[...reachable].sort((a, b) => a - b).join(', ')}}`
    output.push(`   SG(${n}) = mex(${reachableStr}) = ${sg}`)
  }
  output.push(`   SG 值序列: ${sgValues.join(', ')}`)
  output.push('')

  // 3. Nim 游戏分析
  output.push('3. Nim 游戏分析 (SG 定理的特例):')
  const nimCases = [
    [3, 4, 5],
    [1, 1],
    [2, 2, 2],
    [1, 2, 3],
  ]
  for (const piles of nimCases) {
    const xorResult = piles.reduce((a, b) => a ^ b, 0)
    const sgStr = piles.map(p => `SG(${p})=${p}`).join(' XOR ')
    const result = xorResult === 0 ? 'P 态 (先手必败)' : 'N 态 (先手必胜)'
    output.push(`   石子堆 [${piles.join(', ')}]: ${sgStr} = ${xorResult} → ${result}`)
  }
  output.push('')

  // 4. 变种游戏：每次取 1, 3, 4 个石子
  output.push('4. 变种游戏 (每次取 1, 3 或 4 个石子) SG 值:')
  const moves2 = [1, 3, 4]
  const sgValues2: number[] = [0]
  output.push('   SG(0) = 0 (终止局面)')
  for (let n = 1; n <= 15; n++) {
    const sg = computeSG(n, moves2)
    sgValues2.push(sg)
    output.push(`   SG(${n}) = ${sg}`)
  }
  output.push(`   SG 值序列: ${sgValues2.join(', ')}`)
  output.push('')

  // 5. 组合游戏示例
  output.push('5. 组合游戏示例 (两堆独立取石子游戏):')
  output.push('   游戏规则: 两堆石子，每堆每次可取 1 或 2 个')
  const comboCases: [number, number][] = [[3, 5], [4, 4], [2, 6], [1, 2]]
  for (const [a, b] of comboCases) {
    const sgA = sgValues[a]
    const sgB = sgValues[b]
    const total = sgA ^ sgB
    const result = total === 0 ? 'P 态 (先手必败)' : 'N 态 (先手必胜)'
    output.push(`   堆 [${a}, ${b}]: SG(${a}) XOR SG(${b}) = ${sgA} XOR ${sgB} = ${total} → ${result}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
