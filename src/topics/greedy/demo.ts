export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 贪心算法 (Greedy Algorithm) 演示 ===')
  lines.push('')

  // --- 1. 活动选择问题 ---
  lines.push('【1】活动选择问题 - 选择最多的不重叠活动')
  lines.push('─────────────────────────────────────')
  lines.push('')

  const activities = [
    { name: 'A', start: 1, finish: 4 },
    { name: 'B', start: 3, finish: 5 },
    { name: 'C', start: 0, finish: 6 },
    { name: 'D', start: 5, finish: 7 },
    { name: 'E', start: 3, finish: 9 },
    { name: 'F', start: 5, finish: 9 },
    { name: 'G', start: 6, finish: 10 },
    { name: 'H', start: 8, finish: 11 },
  ]

  lines.push('所有活动:')
  for (const a of activities) {
    const bar = ' '.repeat(a.start) + '█'.repeat(a.finish - a.start)
    lines.push(`  ${a.name}: [${a.start}-${a.finish}] ${bar}`)
  }
  lines.push('')

  // 按结束时间排序
  const sorted = [...activities].sort((a, b) => a.finish - b.finish)
  lines.push('按结束时间排序后:')
  lines.push(`  ${sorted.map(a => `${a.name}(${a.finish})`).join(' → ')}`)
  lines.push('')

  // 贪心选择过程
  const selected: typeof activities = []
  let lastFinish = 0
  lines.push('贪心选择过程:')

  for (const a of sorted) {
    if (a.start >= lastFinish) {
      selected.push(a)
      lines.push(`  ✓ 选中 ${a.name} [${a.start}-${a.finish}]（开始时间 ${a.start} >= 上次结束 ${lastFinish}）`)
      lastFinish = a.finish
    } else {
      lines.push(`  ✗ 跳过 ${a.name} [${a.start}-${a.finish}]（与已选活动冲突）`)
    }
  }

  lines.push('')
  lines.push(`结果: 选择了 ${selected.length} 个活动: ${selected.map(a => a.name).join(', ')}`)
  lines.push('')

  // --- 2. 分数背包 ---
  lines.push('【2】分数背包问题 - 按性价比贪心装入')
  lines.push('─────────────────────────────────────')
  lines.push('')

  const items = [
    { name: '金块', weight: 10, value: 60 },
    { name: '银块', weight: 20, value: 100 },
    { name: '铜块', weight: 30, value: 120 },
  ]
  const capacity = 50

  lines.push(`背包容量: ${capacity}`)
  lines.push('物品信息:')
  for (const item of items) {
    const ratio = (item.value / item.weight).toFixed(2)
    lines.push(`  ${item.name}: 重量=${item.weight}, 价值=${item.value}, 性价比=${ratio}`)
  }
  lines.push('')

  // 按性价比排序
  const sortedItems = [...items].sort((a, b) =>
    (b.value / b.weight) - (a.value / a.weight)
  )
  lines.push('按性价比降序排序:')
  lines.push(`  ${sortedItems.map(i => `${i.name}(${(i.value / i.weight).toFixed(2)})`).join(' → ')}`)
  lines.push('')

  let remaining = capacity
  let totalValue = 0
  lines.push('贪心装入过程:')

  for (const item of sortedItems) {
    if (remaining >= item.weight) {
      lines.push(`  ✓ 装入全部 ${item.name}: 重量${item.weight}, 价值${item.value}, 剩余容量${remaining - item.weight}`)
      remaining -= item.weight
      totalValue += item.value
    } else if (remaining > 0) {
      const fraction = remaining / item.weight
      const partialValue = Math.round(item.value * fraction * 100) / 100
      lines.push(`  ✓ 装入 ${(fraction * 100).toFixed(1)}% ${item.name}: 重量${remaining}, 价值${partialValue}, 剩余容量0`)
      totalValue += partialValue
      remaining = 0
    }
  }

  lines.push('')
  lines.push(`结果: 总价值 = ${totalValue}`)
  lines.push('')

  // --- 3. 霍夫曼树构建 ---
  lines.push('【3】霍夫曼编码树构建')
  lines.push('─────────────────────────────────────')
  lines.push('')

  const text = 'aabbcdddd'
  const freqMap = new Map<string, number>()
  for (const ch of text) {
    freqMap.set(ch, (freqMap.get(ch) || 0) + 1)
  }

  lines.push(`输入文本: "${text}"`)
  lines.push('字符频率:')
  for (const [ch, freq] of freqMap) {
    lines.push(`  '${ch}' → ${freq}`)
  }
  lines.push('')

  // 霍夫曼树构建过程
  interface HNode {
    char?: string
    freq: number
    left?: HNode
    right?: HNode
    label: string
  }

  let nodes: HNode[] = []
  for (const [ch, freq] of freqMap) {
    nodes.push({ char: ch, freq, label: `'${ch}':${freq}` })
  }

  let step = 1
  lines.push('构建过程（每次合并频率最低的两个节点）:')

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq)
    const left = nodes.shift()!
    const right = nodes.shift()!
    const merged: HNode = {
      freq: left.freq + right.freq,
      left,
      right,
      label: `(${left.label}+${right.label}):${left.freq + right.freq}`,
    }
    nodes.push(merged)
    lines.push(`  步骤${step}: 合并 ${left.label} 和 ${right.label} → 新节点(${left.freq + right.freq})`)
    step++
  }

  // 生成编码
  lines.push('')
  lines.push('最终霍夫曼编码:')

  const codes = new Map<string, string>()
  function generateCodes(node: HNode, code: string) {
    if (node.char) {
      codes.set(node.char, code || '0')
      return
    }
    if (node.left) generateCodes(node.left, code + '0')
    if (node.right) generateCodes(node.right, code + '1')
  }
  if (nodes[0]) generateCodes(nodes[0], '')

  for (const [ch, code] of codes) {
    const freq = freqMap.get(ch) || 0
    lines.push(`  '${ch}' (频率${freq}) → ${code} (长度${code.length})`)
  }

  // 计算总编码长度
  let totalBits = 0
  for (const [ch, code] of codes) {
    totalBits += code.length * (freqMap.get(ch) || 0)
  }
  lines.push('')
  lines.push(`总编码长度: ${totalBits} 位`)
  lines.push(`等长编码需要: ${text.length * Math.ceil(Math.log2(freqMap.size))} 位`)
  lines.push(`压缩率: ${((1 - totalBits / (text.length * 8)) * 100).toFixed(1)}%`)
  lines.push('')

  // --- 4. 零钱兑换对比 ---
  lines.push('【4】零钱兑换：贪心 vs 动态规划')
  lines.push('─────────────────────────────────────')
  lines.push('')

  // 规范面额 - 贪心正确
  lines.push('场景 A: 规范面额 [1, 5, 10, 25]，凑 41 分')
  const coins1 = [25, 10, 5, 1]
  let amount1 = 41
  const result1: number[] = []
  for (const c of coins1) {
    while (amount1 >= c) {
      amount1 -= c
      result1.push(c)
    }
  }
  lines.push(`  贪心结果: ${result1.join('+')} = ${result1.length} 枚 ✓ 正确`)
  lines.push('')

  // 非规范面额 - 贪心失败
  lines.push('场景 B: 非规范面额 [1, 3, 4]，凑 6 分')
  const coins2 = [4, 3, 1]
  let amount2 = 6
  const result2: number[] = []
  for (const c of coins2) {
    while (amount2 >= c) {
      amount2 -= c
      result2.push(c)
    }
  }
  lines.push(`  贪心结果: ${result2.join('+')} = ${result2.length} 枚 ✗ 不是最优`)
  lines.push(`  最优结果: 3+3 = 2 枚`)
  lines.push('')
  lines.push('结论: 贪心不总是正确！面额不规范时需要动态规划。')
  lines.push('')

  // --- 5. 总结 ---
  lines.push('【5】贪心算法效率总结')
  lines.push('─────────────────────────────────────')
  lines.push('')
  lines.push('问题              时间复杂度      关键操作')
  lines.push('──────────────────────────────────────────')
  lines.push('活动选择          O(n log n)      按结束时间排序')
  lines.push('分数背包          O(n log n)      按性价比排序')
  lines.push('霍夫曼编码        O(n log n)      优先队列合并')
  lines.push('最小生成树(Kruskal) O(E log E)    按边权排序+并查集')
  lines.push('Dijkstra最短路径  O((V+E)log V)  优先队列选择最小距离')
  lines.push('')
  lines.push('贪心算法通常以排序或优先队列为核心，时间复杂度多为 O(n log n)！')
  lines.push('')
  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}