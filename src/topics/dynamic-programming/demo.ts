export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 动态规划 (Dynamic Programming) 演示 ===')
  lines.push('')

  // --- 1. 斐波那契数列：记忆化搜索 ---
  lines.push('【1】斐波那契数列 - 记忆化搜索')
  lines.push('─────────────────────────')
  lines.push('')

  const cache = new Map<number, number>()
  const callLog: string[] = []
  fibMemoTrace(6, cache, callLog, 0)
  for (const log of callLog) {
    lines.push(log)
  }
  lines.push(`结果: fib(6) = ${cache.get(6)}`)
  lines.push(`缓存内容: ${JSON.stringify(Object.fromEntries(cache))}`)
  lines.push(`缓存命中避免了大量重复计算！`)
  lines.push('')

  // --- 2. 0/1 背包问题 ---
  lines.push('【2】0/1 背包问题')
  lines.push('─────────────────────────')
  lines.push('')

  const weights = [2, 3, 4, 5]
  const values = [3, 4, 5, 6]
  const capacity = 8

  lines.push(`物品重量: [${weights.join(', ')}]`)
  lines.push(`物品价值: [${values.join(', ')}]`)
  lines.push(`背包容量: ${capacity}`)
  lines.push('')

  const knapsackResult = knapsackTrace(weights, values, capacity, lines)
  lines.push(`最大价值: ${knapsackResult}`)
  lines.push('')

  // --- 3. 最长公共子序列 (LCS) ---
  lines.push('【3】最长公共子序列 (LCS)')
  lines.push('─────────────────────────')
  lines.push('')

  const X = 'ABCBDAB'
  const Y = 'BDCAB'

  lines.push(`序列 X: "${X}"`)
  lines.push(`序列 Y: "${Y}"`)
  lines.push('')

  const lcsResult = lcsTrace(X, Y, lines)
  lines.push(`LCS 长度: ${lcsResult}`)
  lines.push('')

  // --- 4. 编辑距离 ---
  lines.push('【4】编辑距离 (Edit Distance)')
  lines.push('─────────────────────────')
  lines.push('')

  const A = 'kitten'
  const B = 'sitting'

  lines.push(`字符串 A: "${A}"`)
  lines.push(`字符串 B: "${B}"`)
  lines.push('')

  const editResult = editDistanceTrace(A, B, lines)
  lines.push(`编辑距离: ${editResult}`)
  lines.push('')

  // --- 5. 对比总结 ---
  lines.push('【5】动态规划效率对比')
  lines.push('─────────────────────────')
  lines.push('')
  lines.push('问题           暴力解法          动态规划')
  lines.push('─────────────────────────────────────────')
  lines.push('斐波那契(30)   O(2^30) ~10亿次   O(30) ~30次')
  lines.push('0/1背包(20件)  O(2^20) ~100万次  O(20×W) 线性')
  lines.push('LCS(长度100)   O(2^100) 天文数字  O(100×100) 1万次')
  lines.push('编辑距离(100)  O(3^100) 天文数字  O(100×100) 1万次')
  lines.push('')
  lines.push('动态规划通过记录子问题的解，将指数级复杂度降为多项式级！')
  lines.push('')
  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 斐波那契记忆化搜索（带追踪）
function fibMemoTrace(
  n: number,
  cache: Map<number, number>,
  log: string[],
  depth: number
): number {
  const indent = '  '.repeat(depth)

  if (n <= 1) {
    log.push(`${indent}fib(${n}) = ${n} (基础情况)`)
    cache.set(n, n)
    return n
  }

  if (cache.has(n)) {
    log.push(`${indent}fib(${n}) = ${cache.get(n)} (缓存命中!)`)
    return cache.get(n)!
  }

  log.push(`${indent}计算 fib(${n}) = fib(${n - 1}) + fib(${n - 2})`)

  const a = fibMemoTrace(n - 1, cache, log, depth + 1)
  const b = fibMemoTrace(n - 2, cache, log, depth + 1)
  const result = a + b

  cache.set(n, result)
  log.push(`${indent}fib(${n}) = ${a} + ${b} = ${result}`)
  return result
}

// 0/1 背包问题（带追踪）
function knapsackTrace(
  weights: number[],
  values: number[],
  capacity: number,
  lines: string[]
): number {
  const n = weights.length
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  )

  lines.push('DP 表填充过程:')
  lines.push('')

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (w >= weights[i - 1]) {
        const notTake = dp[i - 1][w]
        const take = dp[i - 1][w - weights[i - 1]] + values[i - 1]
        dp[i][w] = Math.max(notTake, take)

        if (w === capacity || w === weights[i - 1]) {
          lines.push(
            `dp[${i}][${w}]: max(不取=${notTake}, 取=${take}) = ${dp[i][w]}  ` +
            `(物品${i}: 重${weights[i-1]}, 值${values[i-1]})`
          )
        }
      } else {
        dp[i][w] = dp[i - 1][w]
      }
    }
  }

  // 打印完整 DP 表
  lines.push('')
  lines.push('完整 DP 表:')
  let header = '       '
  for (let w = 0; w <= capacity; w++) {
    header += `w=${w}`.padStart(5)
  }
  lines.push(header)

  for (let i = 0; i <= n; i++) {
    let row = `i=${i}`.padStart(7)
    for (let w = 0; w <= capacity; w++) {
      row += String(dp[i][w]).padStart(5)
    }
    lines.push(row)
  }

  return dp[n][capacity]
}

// LCS 问题（带追踪）
function lcsTrace(X: string, Y: string, lines: string[]): number {
  const m = X.length
  const n = Y.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  lines.push('DP 表填充过程:')
  lines.push('')

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (X[i - 1] === Y[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        lines.push(
          `dp[${i}][${j}]: X[${i-1}]='${X[i-1]}' == Y[${j-1}]='${Y[j-1]}' → ` +
          `dp[${i-1}][${j-1}]+1 = ${dp[i][j]}`
        )
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  lines.push('')
  lines.push('完整 DP 表:')

  let header = '       ""'
  for (let j = 0; j < n; j++) {
    header += `  ${Y[j]}`
  }
  lines.push(header)

  for (let i = 0; i <= m; i++) {
    const label = i === 0 ? '""' : X[i - 1]
    let row = `  ${label}  `
    for (let j = 0; j <= n; j++) {
      row += ` ${dp[i][j]}`
    }
    lines.push(row)
  }

  return dp[m][n]
}

// 编辑距离（带追踪）
function editDistanceTrace(A: string, B: string, lines: string[]): number {
  const m = A.length
  const n = B.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  // 基础情况
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  lines.push('DP 表填充过程:')
  lines.push('')

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (A[i - 1] === B[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
        lines.push(
          `dp[${i}][${j}]: '${A[i-1]}' == '${B[j-1]}' → 无需操作 = ${dp[i][j]}`
        )
      } else {
        const del = dp[i - 1][j]
        const ins = dp[i][j - 1]
        const rep = dp[i - 1][j - 1]
        dp[i][j] = 1 + Math.min(del, ins, rep)
        lines.push(
          `dp[${i}][${j}]: '${A[i-1]}' != '${B[j-1]}' → ` +
          `1+min(删=${del}, 插=${ins}, 替=${rep}) = ${dp[i][j]}`
        )
      }
    }
  }

  lines.push('')
  lines.push('完整 DP 表:')

  let header = '      ""'
  for (let j = 0; j < n; j++) {
    header += `  ${B[j]}`
  }
  lines.push(header)

  for (let i = 0; i <= m; i++) {
    const label = i === 0 ? '""' : A[i - 1]
    let row = `  ${label}  `
    for (let j = 0; j <= n; j++) {
      row += ` ${dp[i][j]}`
    }
    lines.push(row)
  }

  return dp[m][n]
}
