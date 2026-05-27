interface Query {
  l: number
  r: number
  id: number
}

export default function offlineAlgorithmsDemo(): string {
  const output: string[] = []

  output.push('=== 离线算法演示 ===')
  output.push('对比在线处理与离线处理的效率差异\n')

  const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
  output.push(`数组: [${arr.join(', ')}]`)

  const queries: Query[] = [
    { l: 0, r: 4, id: 0 },
    { l: 2, r: 7, id: 1 },
    { l: 1, r: 9, id: 2 },
    { l: 5, r: 9, id: 3 },
    { l: 0, r: 9, id: 4 },
  ]

  output.push(`查询数量: ${queries.length}`)
  queries.forEach(q => {
    output.push(`  查询 ${q.id}: 区间 [${q.l}, ${q.r}]，求不同元素个数`)
  })

  // === 在线处理 ===
  output.push('\n--- 在线处理（按原始顺序，每次从零开始）---')
  let onlineSteps = 0
  for (const q of queries) {
    const freq = new Map<number, number>()
    let distinct = 0
    for (let i = q.l; i <= q.r; i++) {
      onlineSteps++
      const count = freq.get(arr[i]) || 0
      if (count === 0) distinct++
      freq.set(arr[i], count + 1)
    }
    output.push(`  查询 ${q.id} [${q.l},${q.r}]: ${distinct} 个不同元素 (遍历 ${q.r - q.l + 1} 个元素)`)
  }
  output.push(`  在线处理总步数: ${onlineSteps}`)

  // === 离线处理（莫队排序）===
  output.push('\n--- 离线处理（莫队排序，增量更新）---')
  const n = arr.length
  const blockSize = Math.floor(Math.sqrt(n))

  const indexed = queries.map(q => ({ ...q }))
  indexed.sort((a, b) => {
    const blockA = Math.floor(a.l / blockSize)
    const blockB = Math.floor(b.l / blockSize)
    if (blockA !== blockB) return blockA - blockB
    return blockA % 2 === 0 ? a.r - b.r : b.r - a.r
  })

  output.push(`块大小: ${blockSize}`)
  output.push(`排序后查询顺序: ${indexed.map(q => `q${q.id}`).join(' -> ')}`)

  let curL = 0
  let curR = -1
  let curAns = 0
  let offlineSteps = 0
  const freq = new Map<number, number>()
  const results = new Array(queries.length)

  function add(pos: number): void {
    offlineSteps++
    const val = arr[pos]
    const count = freq.get(val) || 0
    if (count === 0) curAns++
    freq.set(val, count + 1)
  }

  function remove(pos: number): void {
    offlineSteps++
    const val = arr[pos]
    const count = freq.get(val) || 0
    if (count === 1) curAns--
    freq.set(val, count - 1)
  }

  for (const q of indexed) {
    output.push(`\n  处理查询 ${q.id}: [${q.l}, ${q.r}]`)
    output.push(`    当前指针: L=${curL}, R=${curR}`)

    const moves: string[] = []
    while (curL > q.l) { curL--; add(curL); moves.push(`L 左移至 ${curL}，添加 ${arr[curL]}`) }
    while (curR < q.r) { curR++; add(curR); moves.push(`R 右移至 ${curR}，添加 ${arr[curR]}`) }
    while (curL < q.l) { remove(curL); moves.push(`L 右移，删除 ${arr[curL]}`); curL++ }
    while (curR > q.r) { remove(curR); moves.push(`R 左移，删除 ${arr[curR]}`); curR-- }

    moves.forEach(m => output.push(`      ${m}`))
    output.push(`    结果: ${curAns} 个不同元素`)
    results[q.id] = curAns
  }

  output.push(`\n  离线处理总步数: ${offlineSteps}`)

  // 验证结果
  output.push('\n--- 结果验证 ---')
  queries.forEach(q => {
    const segment = arr.slice(q.l, q.r + 1)
    const expected = new Set(segment).size
    output.push(`  查询 ${q.id} [${q.l},${q.r}]: 结果=${results[q.id]}, 验证=${expected}, ${results[q.id] === expected ? '正确' : '错误'}`)
  })

  // 复杂度对比
  output.push('\n--- 复杂度对比 ---')
  output.push(`在线处理总步数: ${onlineSteps}`)
  output.push(`离线处理总步数: ${offlineSteps}`)
  output.push(`节省步数: ${onlineSteps - offlineSteps} (${((1 - offlineSteps / onlineSteps) * 100).toFixed(1)}%)`)
  output.push(`理论复杂度: 在线 O(n*m)=${n * queries.length}, 离线 O(n*sqrt(m))=${Math.floor(n * Math.sqrt(queries.length))}`)

  // 整体二分演示
  output.push('\n--- 整体二分思路演示 ---')
  output.push('问题: 对每个查询求区间第 k 小值')
  output.push('思路:')
  output.push('  1. 所有查询共享二分区间 [low, high]')
  output.push('  2. 每轮取 mid，用树状数组统计 <= mid 的元素个数')
  output.push('  3. 根据统计结果决定每个查询向左还是向右二分')
  output.push('  4. 所有查询的 check 操作可以批量进行')
  output.push('  5. 复杂度: O(n * log(n) * log(MAX))')

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
