function countBits(x: number): number {
  let c = 0
  for (; x; x &= x - 1) c++
  return c
}

function toBinary(mask: number, n: number): string {
  return mask.toString(2).padStart(n, '0')
}

export default function bitmaskDpDemo(): string {
  const output: string[] = []

  output.push('=== 状压DP (Bitmask DP) 演示 ===\n')

  // 1. 位运算基础操作
  output.push('1. 位运算基础操作:')
  const mask = 0b10110
  output.push(`   mask = ${toBinary(mask, 5)} (十进制: ${mask})`)
  output.push(`   检查第 1 位: ${(mask >> 1) & 1} (已选中)`)
  output.push(`   检查第 2 位: ${(mask >> 2) & 1} (未选中)`)
  output.push(`   设置第 2 位: ${toBinary(mask | (1 << 2), 5)} = ${mask | (1 << 2)}`)
  output.push(`   清除第 1 位: ${toBinary(mask & ~(1 << 1), 5)} = ${mask & ~(1 << 1)}`)
  output.push(`   1 的个数: ${countBits(mask)}`)
  output.push('')

  // 2. 枚举子集
  output.push('2. 枚举 mask=10110 的所有非空子集:')
  let subsetCount = 0
  for (let sub = mask; sub; sub = (sub - 1) & mask) {
    output.push(`   ${toBinary(sub, 5)} = ${sub}`)
    subsetCount++
  }
  output.push(`   共 ${subsetCount} 个非空子集`)
  output.push('')

  // 3. TSP 问题演示 (4 个城市)
  output.push('3. 旅行商问题 (TSP) 演示 - 4 个城市:')
  const n = 4
  const dist: number[][] = [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0],
  ]

  output.push('   距离矩阵:')
  for (let i = 0; i < n; i++) {
    output.push(`   [${dist[i].join(', ')}]`)
  }
  output.push('')

  const INF = Number.MAX_SAFE_INTEGER
  const dp: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(INF))
  const parent: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(-1))
  dp[1][0] = 0

  for (let maskState = 1; maskState < (1 << n); maskState++) {
    for (let i = 0; i < n; i++) {
      if (dp[maskState][i] === INF) continue
      if ((maskState & (1 << i)) === 0) continue
      for (let j = 0; j < n; j++) {
        if (maskState & (1 << j)) continue
        const next = maskState | (1 << j)
        const newCost = dp[maskState][i] + dist[i][j]
        if (newCost < dp[next][j]) {
          dp[next][j] = newCost
          parent[next][j] = i
        }
      }
    }
  }

  // 输出部分关键状态
  output.push('   关键状态计算过程:')
  const statesToShow = [
    0b0001, 0b0011, 0b0101, 0b1001,
    0b0111, 0b1011, 0b1101, 0b1111,
  ]
  for (const s of statesToShow) {
    const bits = toBinary(s, n)
    const vals: string[] = []
    for (let i = 0; i < n; i++) {
      if (dp[s][i] < INF) {
        vals.push(`dp[${bits}][${i}]=${dp[s][i]}`)
      }
    }
    if (vals.length > 0) {
      output.push(`   mask=${bits}: ${vals.join(', ')}`)
    }
  }
  output.push('')

  // 求最终答案
  const full = (1 << n) - 1
  let ans = INF
  let lastCity = -1
  for (let i = 1; i < n; i++) {
    const cost = dp[full][i] + dist[i][0]
    if (cost < ans) {
      ans = cost
      lastCity = i
    }
  }

  output.push(`   最短路径长度: ${ans}`)

  // 回溯路径
  const path: number[] = [0]
  let curMask = full
  let curCity = lastCity
  while (curCity !== 0) {
    path.push(curCity)
    const prevCity = parent[curMask][curCity]
    curMask ^= 1 << curCity
    curCity = prevCity
  }
  path.push(0)
  output.push(`   最优路径: ${path.join(' -> ')}`)
  output.push('')

  // 4. 指派问题演示
  output.push('4. 指派问题演示 - 4 个人分配 4 个任务:')
  const cost: number[][] = [
    [9, 2, 7, 8],
    [6, 4, 3, 7],
    [5, 8, 1, 8],
    [7, 6, 9, 4],
  ]
  output.push('   代价矩阵 (行=人, 列=任务):')
  for (let i = 0; i < 4; i++) {
    output.push(`   [${cost[i].join(', ')}]`)
  }

  const m = 4
  const assignDp = new Array(1 << m).fill(INF)
  const assignChoice = new Array(1 << m).fill(-1)
  assignDp[0] = 0

  for (let s = 0; s < (1 << m); s++) {
    if (assignDp[s] === INF) continue
    const person = countBits(s)
    if (person >= m) continue
    for (let j = 0; j < m; j++) {
      if (s & (1 << j)) continue
      const next = s | (1 << j)
      const newCost = assignDp[s] + cost[person][j]
      if (newCost < assignDp[next]) {
        assignDp[next] = newCost
        assignChoice[next] = j
      }
    }
  }

  output.push(`   最小总代价: ${assignDp[(1 << m) - 1]}`)

  // 回溯分配方案
  const assignment: number[] = []
  let s = (1 << m) - 1
  while (s > 0) {
    assignment.unshift(assignChoice[s])
    s ^= 1 << assignChoice[s]
  }
  output.push('   分配方案:')
  for (let i = 0; i < m; i++) {
    output.push(`   人 ${i} -> 任务 ${assignment[i]} (代价: ${cost[i][assignment[i]]})`)
  }
  output.push('')

  // 5. 空间优化技巧
  output.push('5. 状态数量分析:')
  for (let size = 4; size <= 20; size += 4) {
    const states = (1 << size) * size
    output.push(`   n=${size}: 状态数 = 2^${size} * ${size} = ${states.toLocaleString()}`)
  }
  output.push('')
  output.push('   当 n > 20 时，状压DP 的时间和空间消耗急剧增长，')
  output.push('   通常需要结合剪枝或其他算法技巧。')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
