interface Query {
  l: number
  r: number
  id: number
}

export default function mosAlgorithmDemo(): string {
  const output: string[] = []

  output.push('=== 莫队算法演示 ===')
  output.push('问题：求区间 [l, r] 中不同元素的个数\n')

  // 示例数组
  const arr = [1, 2, 1, 3, 2, 1, 3, 4, 2, 1]
  output.push(`数组: [${arr.join(', ')}]`)

  // 查询
  const queries: Query[] = [
    { l: 0, r: 4, id: 0 },
    { l: 2, r: 7, id: 1 },
    { l: 1, r: 9, id: 2 },
    { l: 4, r: 8, id: 3 },
    { l: 0, r: 9, id: 4 },
  ]

  output.push(`查询数量: ${queries.length}`)
  queries.forEach(q => {
    output.push(`  查询 ${q.id}: [${q.l}, ${q.r}]`)
  })

  // 分块
  const n = arr.length
  const blockSize = Math.floor(Math.sqrt(n))
  output.push(`\n块大小: ${blockSize}`)
  output.push('分块情况:')
  for (let i = 0; i < n; i += blockSize) {
    const end = Math.min(i + blockSize - 1, n - 1)
    const blockId = Math.floor(i / blockSize)
    output.push(`  块 ${blockId}: 位置 [${i}, ${end}] -> [${arr.slice(i, end + 1).join(', ')}]`)
  }

  // 排序
  const sortedQueries = [...queries].sort((a, b) => {
    const blockA = Math.floor(a.l / blockSize)
    const blockB = Math.floor(b.l / blockSize)
    if (blockA !== blockB) return blockA - blockB
    return blockA % 2 === 0 ? a.r - b.r : b.r - a.r
  })

  output.push('\n--- 排序后的查询顺序 ---')
  sortedQueries.forEach(q => {
    const blockId = Math.floor(q.l / blockSize)
    output.push(`  查询 ${q.id}: [${q.l}, ${q.r}] (块 ${blockId})`)
  })

  // 模拟莫队过程
  output.push('\n--- 指针移动过程 ---')
  let curL = 0
  let curR = -1
  let curAns = 0
  const freq = new Map<number, number>()
  const results: number[] = new Array(queries.length)

  function add(pos: number): void {
    const val = arr[pos]
    const count = freq.get(val) || 0
    if (count === 0) curAns++
    freq.set(val, count + 1)
  }

  function remove(pos: number): void {
    const val = arr[pos]
    const count = freq.get(val) || 0
    if (count === 1) curAns--
    freq.set(val, count - 1)
  }

  for (const q of sortedQueries) {
    output.push(`\n处理查询 ${q.id}: [${q.l}, ${q.r}]`)
    output.push(`  当前区间: [${curL}, ${curR}], 答案: ${curAns}`)

    // 移动指针
    const moves: string[] = []
    while (curL > q.l) {
      curL--
      add(curL)
      moves.push(`左指针左移至 ${curL}，添加 arr[${curL}]=${arr[curL]}`)
    }
    while (curR < q.r) {
      curR++
      add(curR)
      moves.push(`右指针右移至 ${curR}，添加 arr[${curR}]=${arr[curR]}`)
    }
    while (curL < q.l) {
      moves.push(`左指针右移至 ${curL + 1}，删除 arr[${curL}]=${arr[curL]}`)
      remove(curL)
      curL++
    }
    while (curR > q.r) {
      moves.push(`右指针左移至 ${curR - 1}，删除 arr[${curR}]=${arr[curR]}`)
      remove(curR)
      curR--
    }

    moves.forEach(m => output.push(`  ${m}`))
    output.push(`  最终区间: [${curL}, ${curR}], 答案: ${curAns}`)
    results[q.id] = curAns
  }

  // 输出结果
  output.push('\n--- 查询结果 ---')
  queries.forEach(q => {
    const segment = arr.slice(q.l, q.r + 1)
    const uniqueCount = new Set(segment).size
    output.push(`  查询 ${q.id} [${q.l}, ${q.r}]: ${results[q.id]} 个不同元素`)
    output.push(`    区间内容: [${segment.join(', ')}]`)
    output.push(`    验证: 不同元素为 {${[...new Set(segment)].join(', ')}}，共 ${uniqueCount} 个`)
  })

  // 复杂度分析
  output.push('\n--- 复杂度分析 ---')
  output.push(`数组长度 n = ${n}`)
  output.push(`查询数量 m = ${queries.length}`)
  output.push(`块大小 B = ${blockSize}`)
  output.push(`理论复杂度 O(n * sqrt(m)) = O(${n} * ${Math.floor(Math.sqrt(queries.length))}) = O(${n * Math.floor(Math.sqrt(queries.length))})`)
  output.push(`暴力复杂度 O(n * m) = O(${n * queries.length})`)

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
