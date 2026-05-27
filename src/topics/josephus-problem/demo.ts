export default function josephusDemo(): string {
  const output: string[] = []

  output.push('=== 约瑟夫问题演示 ===\n')

  // 1. 模拟法
  output.push('1. 模拟法（链表/数组模拟）')
  output.push('   n=7, k=3（7个人围成一圈，每数到第3个人出列）\n')

  const n1 = 7, k1 = 3
  const people: number[] = Array.from({ length: n1 }, (_, i) => i)
  let idx = 0
  let round = 1

  output.push(`   初始队列: [${people.join(', ')}]`)

  while (people.length > 1) {
    idx = (idx + k1 - 1) % people.length
    const eliminated = people.splice(idx, 1)[0]
    output.push(`   第${round}轮: 报数到${k1}，编号 ${eliminated} 出列，剩余: [${people.join(', ')}]`)
    round++
  }

  output.push(`   最终存活者: 编号 ${people[0]}\n`)

  // 2. 递推法
  output.push('2. 数学递推法')
  output.push('   公式: J(n,k) = (J(n-1,k) + k) % n, J(1,k) = 0')
  output.push('   求 J(7, 3):\n')

  const n2 = 7, k2 = 3
  let result = 0
  output.push(`   J(1,3) = 0`)

  for (let i = 2; i <= n2; i++) {
    const prev = result
    result = (result + k2) % i
    output.push(`   J(${i},3) = (J(${i - 1},3) + 3) % ${i} = (${prev} + 3) % ${i} = ${result}`)
  }

  output.push(`   最终结果: J(7,3) = ${result}\n`)

  // 3. 验证两种方法结果一致
  output.push('3. 结果验证')
  const simResult = simulateJosephus(n1, k1)
  const recResult = recurrenceJosephus(n1, k1)
  output.push(`   模拟法结果: ${simResult}`)
  output.push(`   递推法结果: ${recResult}`)
  output.push(`   两种方法结果${simResult === recResult ? '一致' : '不一致'}！\n`)

  // 4. 更多示例
  output.push('4. 更多示例\n')

  const examples: [number, number][] = [[5, 2], [6, 4], [10, 3], [100, 7]]
  for (const [n, k] of examples) {
    const r = recurrenceJosephus(n, k)
    output.push(`   J(${n}, ${k}) = ${r}`)
  }

  output.push('\n5. 完整淘汰顺序演示')
  output.push('   n=5, k=2:\n')

  const n5 = 5, k5 = 2
  const peopleOrder: number[] = Array.from({ length: n5 }, (_, i) => i)
  let idxOrder = 0
  const eliminationOrder: number[] = []

  while (peopleOrder.length > 1) {
    idxOrder = (idxOrder + k5 - 1) % peopleOrder.length
    const eliminated = peopleOrder.splice(idxOrder, 1)[0]
    eliminationOrder.push(eliminated)
    output.push(`   淘汰编号 ${eliminated}，剩余: [${peopleOrder.join(', ')}]`)
  }

  output.push(`   淘汰顺序: [${eliminationOrder.join(', ')}]`)
  output.push(`   存活者: 编号 ${peopleOrder[0]}`)

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}

function simulateJosephus(n: number, k: number): number {
  const people: number[] = Array.from({ length: n }, (_, i) => i)
  let idx = 0
  while (people.length > 1) {
    idx = (idx + k - 1) % people.length
    people.splice(idx, 1)
  }
  return people[0]
}

function recurrenceJosephus(n: number, k: number): number {
  let result = 0
  for (let i = 2; i <= n; i++) {
    result = (result + k) % i
  }
  return result
}
