export default function amortizedAnalysisDemo(): string {
  const output: string[] = []

  output.push('=== 摊还分析演示 ===\n')

  // 动态数组扩容演示
  output.push('1. 动态数组扩容 (Doubling Strategy)')
  output.push('   初始容量: 1\n')

  let capacity = 1
  let size = 0
  let totalCost = 0
  const operations = 16

  for (let i = 0; i < operations; i++) {
    let cost = 1
    if (size === capacity) {
      // 需要扩容
      cost += size // 复制旧元素
      capacity *= 2
      output.push(`   第 ${i + 1} 次 push: 需要扩容! 容量 ${capacity / 2} -> ${capacity}, 实际代价 = 1 + ${size} (复制) = ${cost}`)
    } else {
      output.push(`   第 ${i + 1} 次 push: 无需扩容, 实际代价 = 1`)
    }
    totalCost += cost
    size++
  }

  output.push(`\n   总操作次数: ${operations}`)
  output.push(`   总实际代价: ${totalCost}`)
  output.push(`   平均每次代价: ${totalCost} / ${operations} = ${(totalCost / operations).toFixed(2)}`)
  output.push(`   摊还代价: O(1) (聚集法证明)\n`)

  // 二进制计数器演示
  output.push('2. 二进制计数器递增')
  output.push('   从 0000 开始，每次加 1\n')

  let counter = 0
  let totalBitFlips = 0
  const bitWidth = 4

  for (let i = 0; i < 16; i++) {
    const oldCounter = counter
    let flips = 0
    counter++
    // 计算翻转的位数
    let temp = counter
    let oldTemp = oldCounter
    for (let b = 0; b < bitWidth; b++) {
      if ((temp & 1) !== (oldTemp & 1)) flips++
      temp >>= 1
      oldTemp >>= 1
    }
    totalBitFlips += flips
    const binary = counter.toString(2).padStart(bitWidth, '0')
    output.push(`   ${binary} (${oldCounter} -> ${counter}), 翻转 ${flips} 位, 累计翻转 ${totalBitFlips}`)
  }

  output.push(`\n   总操作次数: 16`)
  output.push(`   总位翻转次数: ${totalBitFlips}`)
  output.push(`   平均每次翻转: ${totalBitFlips} / 16 = ${(totalBitFlips / 16).toFixed(2)}`)
  output.push(`   摊还代价: O(1) (聚集法证明)\n`)

  // 记账法演示
  output.push('3. 记账法演示 (动态数组)')
  output.push('   每次 push 收取 3 元 (摊还代价)\n')

  let credit = 0
  capacity = 1
  size = 0

  for (let i = 0; i < 8; i++) {
    let actualCost = 1
    const amortizedCost = 3
    if (size === capacity) {
      actualCost += size
      capacity *= 2
    }
    credit += amortizedCost - actualCost
    output.push(`   第 ${i + 1} 次 push: 实际代价=${actualCost}, 摊还代价=${amortizedCost}, 信用=${credit >= 0 ? '+' : ''}${credit}`)
    size++
  }

  output.push(`\n   最终信用: ${credit} (非负，说明摊还代价有效)\n`)

  // 势能法演示
  output.push('4. 势能法演示 (动态数组)')
  output.push('   势能函数: Phi = 2 * size - capacity\n')

  capacity = 1
  size = 0
  let potential = 2 * size - capacity

  for (let i = 0; i < 8; i++) {
    const oldPotential = potential
    let actualCost = 1
    if (size === capacity) {
      actualCost += size
      capacity *= 2
    }
    size++
    potential = 2 * size - capacity
    const amortizedCost = actualCost + potential - oldPotential
    output.push(`   第 ${i + 1} 次 push: 实际=${actualCost}, 势能变化=${oldPotential} -> ${potential}, 摊还代价=${amortizedCost}`)
  }

  output.push(`\n   摊还代价始终为 3 (常数), 证明 O(1)\n`)

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
