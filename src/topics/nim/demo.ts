function nimXor(piles: number[]): number {
  return piles.reduce((a, b) => a ^ b, 0)
}

function toBinary(n: number, width: number = 4): string {
  return n.toString(2).padStart(width, '0')
}

export default function nimDemo(): string {
  const output: string[] = []

  output.push('=== Nim 游戏演示 ===\n')

  // 1. XOR 基础运算演示
  output.push('1. 异或 (XOR) 运算基础:')
  const xorExamples: [number, number][] = [
    [3, 5], [7, 7], [0, 8], [15, 9],
  ]
  for (const [a, b] of xorExamples) {
    const result = a ^ b
    output.push(`   ${a} (${toBinary(a)}) XOR ${b} (${toBinary(b)}) = ${result} (${toBinary(result)})`)
  }
  output.push('')

  // 2. Nim 游戏局面判定
  output.push('2. Nim 游戏局面判定:')
  const cases = [
    { piles: [3, 4, 5], desc: '经典例子' },
    { piles: [7, 7], desc: '两堆相同' },
    { piles: [1, 2, 3], desc: '连续数' },
    { piles: [2, 3, 5], desc: '一般情况' },
    { piles: [4, 4, 4, 4], desc: '四堆相同' },
    { piles: [1, 1, 2, 2], desc: '成对出现' },
    { piles: [10, 20, 30], desc: '大数情况' },
  ]

  for (const { piles, desc } of cases) {
    const xor = nimXor(piles)
    const status = xor === 0 ? 'P 态 (先手必败)' : 'N 态 (先手必胜)'
    const xorSteps: string[] = []
    let acc = 0
    for (const p of piles) {
      acc ^= p
      xorSteps.push(`${p}`)
    }
    output.push(`   [${piles.join(', ')}] (${desc})`)
    output.push(`   ${xorSteps.join(' XOR ')} = ${xor} → ${status}`)

    // If N-state, show best move
    if (xor !== 0) {
      for (let i = 0; i < piles.length; i++) {
        const target = piles[i] ^ xor
        if (target < piles[i]) {
          const newPiles = [...piles]
          newPiles[i] = target
          output.push(`   最优操作: 从第 ${i + 1} 堆取走 ${piles[i] - target} 个 → [${newPiles.join(', ')}] (异或 = 0)`)
          break
        }
      }
    }
    output.push('')
  }

  // 3. 对局模拟
  output.push('3. 对局模拟: [3, 4, 5]')
  let piles = [3, 4, 5]
  let turn = 0 // 0 = Player A, 1 = Player B
  output.push(`   初始: [${piles.join(', ')}], XOR = ${nimXor(piles)}`)

  while (piles.some(p => p > 0)) {
    const xor = nimXor(piles)
    const playerName = turn === 0 ? 'A' : 'B'
    let moveMade = false

    // Try to make the optimal move
    if (xor !== 0) {
      for (let i = 0; i < piles.length; i++) {
        const target = piles[i] ^ xor
        if (target < piles[i]) {
          const taken = piles[i] - target
          piles[i] = target
          output.push(`   玩家 ${playerName}: 从第 ${i + 1} 堆取走 ${taken} 个 → [${piles.join(', ')}], XOR = ${nimXor(piles)}`)
          moveMade = true
          break
        }
      }
    }

    // If P-state (losing), make any valid move
    if (!moveMade) {
      for (let i = 0; i < piles.length; i++) {
        if (piles[i] > 0) {
          piles[i] -= 1
          output.push(`   玩家 ${playerName}: 从第 ${i + 1} 堆取走 1 个 → [${piles.join(', ')}], XOR = ${nimXor(piles)}`)
          break
        }
      }
    }

    if (piles.every(p => p === 0)) {
      output.push(`   玩家 ${playerName} 取走最后一个石子，获胜！`)
      break
    }

    turn = 1 - turn
  }
  output.push('')

  // 4. Binary analysis
  output.push('4. 二进制分析: [3, 4, 5]')
  piles = [3, 4, 5]
  output.push('   堆    十进制  二进制')
  output.push('   ----  ------  --------')
  for (let i = 0; i < piles.length; i++) {
    output.push(`   堆${i + 1}    ${piles[i].toString().padStart(5)}  ${toBinary(piles[i])}`)
  }
  output.push('   ----  ------  --------')
  output.push(`   XOR    ${nimXor(piles).toString().padStart(5)}  ${toBinary(nimXor(piles))}`)

  // Show bit-by-bit XOR
  const maxBits = Math.max(...piles.map(p => p.toString(2).length))
  output.push(`\n   逐位 XOR (从右到左):`)
  for (let bit = maxBits - 1; bit >= 0; bit--) {
    const bits = piles.map(p => (p >> bit) & 1)
    const xorBit = bits.reduce((a, b) => a ^ b, 0)
    output.push(`   第 ${bit} 位: ${bits.join(' XOR ')} = ${xorBit}`)
  }
  output.push('')

  // 5. Different pile configurations
  output.push('5. 不同配置的胜负判定:')
  const configs = [
    [1], [1, 1], [1, 1, 1], [1, 1, 1, 1],
    [2], [2, 2], [2, 2, 2],
    [1, 2], [1, 2, 3], [1, 2, 3, 4],
  ]
  for (const config of configs) {
    const xor = nimXor(config)
    const status = xor === 0 ? 'P (必败)' : 'N (必胜)'
    output.push(`   [${config.join(', ').padEnd(12)}] XOR = ${xor.toString().padStart(2)} → ${status}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
