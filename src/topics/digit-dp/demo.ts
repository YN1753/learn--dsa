export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 数位DP (Digit DP) 演示 ===')
  lines.push('')

  // --- 1. 基础示例：统计 [1, N] 中不含数字 4 的数 ---
  lines.push('【1】统计 [1, N] 中不含数字 4 的数')
  lines.push('─────────────────────────')

  const testCases = [23, 100, 523, 1000, 10000]
  for (const N of testCases) {
    const result = countWithoutDigit(N, 4)
    const total = N
    const withDigit = total - result
    lines.push(`  N = ${N}: 不含4的数 = ${result} 个 (含4的数 = ${withDigit} 个, 占比 ${(withDigit / total * 100).toFixed(1)}%)`)
  }
  lines.push('')

  // --- 2. DFS 过程追踪 ---
  lines.push('【2】DFS 过程追踪 (N=23, 不含4)')
  lines.push('─────────────────────────')
  const trace23 = traceCountWithout4(23)
  for (const line of trace23) {
    lines.push(`  ${line}`)
  }
  lines.push('')

  // --- 3. 区间查询 [L, R] ---
  lines.push('【3】区间查询 [L, R] 中不含数字 4 的数')
  lines.push('─────────────────────────')
  const intervals = [
    { L: 1, R: 100 },
    { L: 50, R: 150 },
    { L: 400, R: 500 },
    { L: 1, R: 10000 },
  ]
  for (const { L, R } of intervals) {
    const result = countWithoutDigit(R, 4) - countWithoutDigit(L - 1, 4)
    lines.push(`  [${L}, ${R}]: 不含4的数 = ${result} 个`)
  }
  lines.push('')

  // --- 4. 变体：数位之和能被 K 整除 ---
  lines.push('【4】变体: [1, N] 中各位数字之和能被 K 整除的数')
  lines.push('─────────────────────────')
  for (const K of [3, 7, 9]) {
    for (const N of [100, 1000]) {
      const result = countDigitSumDivisible(N, K)
      lines.push(`  N=${N}, K=${K}: 数位之和能被${K}整除的数 = ${result} 个`)
    }
  }
  lines.push('')

  // --- 5. 变体：不含连续相同数字 ---
  lines.push('【5】变体: [1, N] 中相邻数位不相同的数')
  lines.push('─────────────────────────')
  for (const N of [100, 1000, 10000]) {
    const result = countNoConsecutiveSame(N)
    lines.push(`  N=${N}: 相邻数位不同的数 = ${result} 个 (总${N}个, 占比${(result / N * 100).toFixed(1)}%)`)
  }
  lines.push('')

  // --- 6. 效率对比 ---
  lines.push('【6】数位DP vs 暴力枚举 效率对比')
  lines.push('─────────────────────────')
  const sizes = [1000, 100000, 10000000]
  for (const N of sizes) {
    const dpStart = performance.now()
    const dpResult = countWithoutDigit(N, 4)
    const dpTime = performance.now() - dpStart

    let bruteResult = 0
    const bruteStart = performance.now()
    if (N <= 100000) {
      for (let i = 1; i <= N; i++) {
        if (!String(i).includes('4')) bruteResult++
      }
    }
    const bruteTime = performance.now() - bruteStart

    const ops = String(N).length * 2 * 10  // 位数 * tight状态 * 10种数字
    lines.push(`  N=${N.toLocaleString()}: DP结果=${dpResult}, DP用时=${dpTime.toFixed(2)}ms, DP状态数≈${ops}`)
    if (N <= 100000) {
      lines.push(`           暴力结果=${bruteResult}, 暴力用时=${bruteTime.toFixed(2)}ms`)
    } else {
      lines.push(`           暴力: N太大，跳过`)
    }
  }
  lines.push('')

  // --- 7. 记忆化命中率分析 ---
  lines.push('【7】记忆化命中率分析 (N=12345, 不含4)')
  lines.push('─────────────────────────')
  const memoStats = analyzeMemoization(12345)
  lines.push(`  总调用次数: ${memoStats.totalCalls}`)
  lines.push(`  记忆化命中: ${memoStats.hits}`)
  lines.push(`  实际计算: ${memoStats.totalCalls - memoStats.hits}`)
  lines.push(`  命中率: ${(memoStats.hits / memoStats.totalCalls * 100).toFixed(1)}%`)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 统计 [1, N] 中不含指定数字的数的个数
function countWithoutDigit(n: number, forbidden: number): number {
  if (n <= 0) return 0
  const digits = String(n).split('').map(Number)
  const len = digits.length
  const memo: Map<string, number> = new Map()

  function dfs(pos: number, tight: boolean): number {
    if (pos === len) return 1

    const key = `${pos},${tight ? 1 : 0}`
    if (!tight && memo.has(key)) return memo.get(key)!

    const upper = tight ? digits[pos] : 9
    let result = 0

    for (let d = 0; d <= upper; d++) {
      if (d === forbidden) continue
      result += dfs(pos + 1, tight && d === upper)
    }

    if (!tight) memo.set(key, result)
    return result
  }

  return dfs(0, true)
}

// 追踪 N=23 不含 4 的 DFS 过程
function traceCountWithout4(N: number): string[] {
  const lines: string[] = []
  const digits = String(N).split('').map(Number)
  const len = digits.length

  lines.push(`N = ${N}, digits = [${digits.join(', ')}]`)
  lines.push('')

  function dfs(pos: number, tight: boolean, path: number[]): void {
    const indent = '  '.repeat(pos + 1)
    if (pos === len) {
      const num = path.length > 0 ? parseInt(path.join('')) : 0
      lines.push(`${indent}✓ 构造完成: ${num === 0 ? '(前导零)' : num}`)
      return
    }

    const upper = tight ? digits[pos] : 9
    lines.push(`${indent}dfs(pos=${pos}, tight=${tight}, upper=${upper})`)

    for (let d = 0; d <= upper; d++) {
      if (d === 4) {
        lines.push(`${indent}  跳过 d=${d} (含数字4)`)
        continue
      }
      const newPath = [...path, d]
      const newTight = tight && d === upper
      lines.push(`${indent}  尝试 d=${d} → tight=${newTight}, 当前构造: ${newPath.join('')}`)
      dfs(pos + 1, newTight, newPath)
    }
  }

  dfs(0, true, [])
  return lines
}

// 变体：数位之和能被 K 整除
function countDigitSumDivisible(n: number, K: number): number {
  if (n <= 0) return 0
  const digits = String(n).split('').map(Number)
  const len = digits.length
  const memo: Map<string, number> = new Map()

  function dfs(pos: number, tight: boolean, sumMod: number): number {
    if (pos === len) return sumMod % K === 0 ? 1 : 0

    const key = `${pos},${tight ? 1 : 0},${sumMod}`
    if (!tight && memo.has(key)) return memo.get(key)!

    const upper = tight ? digits[pos] : 9
    let result = 0

    for (let d = 0; d <= upper; d++) {
      result += dfs(pos + 1, tight && d === upper, (sumMod + d) % K)
    }

    if (!tight) memo.set(key, result)
    return result
  }

  return dfs(0, true, 0)
}

// 变体：相邻数位不相同
function countNoConsecutiveSame(n: number): number {
  if (n <= 0) return 0
  const digits = String(n).split('').map(Number)
  const len = digits.length
  const memo: Map<string, number> = new Map()

  function dfs(pos: number, tight: boolean, lead: boolean, last: number): number {
    if (pos === len) return 1

    const key = `${pos},${tight ? 1 : 0},${lead ? 1 : 0},${last}`
    if (!tight && memo.has(key)) return memo.get(key)!

    const upper = tight ? digits[pos] : 9
    let result = 0

    for (let d = 0; d <= upper; d++) {
      if (!lead && d === last) continue  // 相邻不能相同（忽略前导零）
      result += dfs(
        pos + 1,
        tight && d === upper,
        lead && d === 0,
        d
      )
    }

    if (!tight) memo.set(key, result)
    return result
  }

  return dfs(0, true, true, -1)
}

// 分析记忆化命中率
function analyzeMemoization(n: number): { totalCalls: number; hits: number } {
  const digits = String(n).split('').map(Number)
  const len = digits.length
  const memo: Map<string, number> = new Map()
  let totalCalls = 0
  let hits = 0

  function dfs(pos: number, tight: boolean): number {
    totalCalls++
    if (pos === len) return 1

    const key = `${pos},${tight ? 1 : 0}`
    if (!tight && memo.has(key)) {
      hits++
      return memo.get(key)!
    }

    const upper = tight ? digits[pos] : 9
    let result = 0

    for (let d = 0; d <= upper; d++) {
      if (d === 4) continue
      result += dfs(pos + 1, tight && d === upper)
    }

    if (!tight) memo.set(key, result)
    return result
  }

  dfs(0, true)
  return { totalCalls, hits }
}
