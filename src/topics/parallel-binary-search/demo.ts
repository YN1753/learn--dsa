interface DemoQuery {
  id: number
  left: number
  right: number
  k: number
}

interface DemoOperation {
  pos: number
  val: number
}

export default function parallelBinarySearchDemo(): string {
  const output: string[] = []

  output.push('=== 整体二分演示 ===')
  output.push('')
  output.push('问题: 给定数组 [3, 1, 4, 1, 5, 9, 2, 6]')
  output.push('多个查询: 求区间 [l, r] 中的第 k 小值')
  output.push('')

  const arr = [3, 1, 4, 1, 5, 9, 2, 6]
  const queries: DemoQuery[] = [
    { id: 0, left: 1, right: 5, k: 2 },   // [3,1,4,1,5] 第2小 = 1
    { id: 1, left: 3, right: 7, k: 3 },   // [4,1,5,9,2] 第3小 = 4
    { id: 2, left: 1, right: 8, k: 4 },   // [3,1,4,1,5,9,2,6] 第4小 = 3
  ]

  output.push('查询列表:')
  for (const q of queries) {
    const subArr = arr.slice(q.left - 1, q.right)
    const sorted = [...subArr].sort((a, b) => a - b)
    output.push(`  Q${q.id + 1}: 区间 [${q.left}, ${q.right}] 第 ${q.k} 小 = ${sorted[q.k - 1]}`)
  }
  output.push('')

  // 模拟整体二分过程
  const valMin = 1
  const valMax = 9
  const answer: number[] = new Array(queries.length).fill(-1)
  let stepCount = 0

  function simulateSolve(
    qList: DemoQuery[],
    ops: DemoOperation[],
    L: number,
    R: number,
    depth: number
  ): void {
    if (qList.length === 0) return
    if (L === R) {
      for (const q of qList) {
        answer[q.id] = L
        output.push(`${'  '.repeat(depth)}查询 Q${q.id + 1} 答案确定: ${L}`)
      }
      return
    }

    const mid = Math.floor((L + R) / 2)
    stepCount++
    output.push(`${'  '.repeat(depth)}第 ${stepCount} 轮: 值域 [${L}, ${R}], mid = ${mid}`)
    output.push(`${'  '.repeat(depth)}加入值 <= ${mid} 的操作到数据结构`)

    // 模拟树状数组: 统计每个查询区间内有多少个值 <= mid
    const bit = new Array(arr.length + 2).fill(0)

    function bitUpdate(i: number, delta: number): void {
      for (; i <= arr.length; i += i & (-i)) {
        bit[i] += delta
      }
    }

    function bitQuery(i: number): number {
      let sum = 0
      for (; i > 0; i -= i & (-i)) {
        sum += bit[i]
      }
      return sum
    }

    // 加入值 <= mid 的操作
    for (const op of ops) {
      if (op.val <= mid) {
        bitUpdate(op.pos, 1)
      }
    }

    // 判定每个查询
    const leftQ: DemoQuery[] = []
    const rightQ: DemoQuery[] = []

    for (const q of qList) {
      const count = bitQuery(q.right) - bitQuery(q.left - 1)
      output.push(`${'  '.repeat(depth)}  Q${q.id + 1}: 区间 [${q.left}, ${q.right}] 中 <= ${mid} 的数有 ${count} 个, 需要第 ${q.k} 小`)

      if (count >= q.k) {
        leftQ.push(q)
        output.push(`${'  '.repeat(depth)}    ${count} >= ${q.k}, 答案在 [${L}, ${mid}] 中`)
      } else {
        rightQ.push(q)
        output.push(`${'  '.repeat(depth)}    ${count} < ${q.k}, 答案在 [${mid + 1}, ${R}] 中, k 更新为 ${q.k - count}`)
      }
    }

    // 撤销操作
    for (const op of ops) {
      if (op.val <= mid) {
        bitUpdate(op.pos, -1)
      }
    }
    output.push(`${'  '.repeat(depth)}撤销数据结构操作`)
    output.push('')

    // 分组操作
    const leftOps: DemoOperation[] = []
    const rightOps: DemoOperation[] = []
    for (const op of ops) {
      if (op.val <= mid) {
        leftOps.push(op)
      } else {
        rightOps.push(op)
      }
    }

    // 修正右组查询的 k 值
    for (const q of rightQ) {
      const count = ops.filter(o => o.val <= mid && o.pos >= q.left && o.pos <= q.right).length
      q.k -= count
    }

    simulateSolve(leftQ, leftOps, L, mid, depth + 1)
    simulateSolve(rightQ, rightOps, mid + 1, R, depth + 1)
  }

  // 构造操作
  const operations: DemoOperation[] = arr.map((val, idx) => ({
    pos: idx + 1,
    val,
  }))

  output.push('整体二分过程:')
  output.push('')
  simulateSolve([...queries], operations, valMin, valMax, 1)

  output.push('')
  output.push('最终结果:')
  for (const q of queries) {
    const subArr = arr.slice(q.left - 1, q.right)
    const sorted = [...subArr].sort((a, b) => a - b)
    output.push(`  Q${q.id + 1}: 区间 [${q.left}, ${q.right}] 第 ${q.k} 小 = ${answer[q.id]} (验证: ${sorted[q.k - 1]})`)
  }

  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
