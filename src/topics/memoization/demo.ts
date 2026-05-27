export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 记忆化搜索 (Memoization) 演示 ===')
  lines.push('')

  // --- 1. Fibonacci: 朴素 vs 记忆化 (调用次数对比) ---
  lines.push('【1】斐波那契数列 —— 朴素递归 vs 记忆化递归')
  lines.push('─────────────────────────────────────────')

  let naiveCallCount = 0
  function fibNaive(n: number): number {
    naiveCallCount++
    if (n <= 1) return n
    return fibNaive(n - 1) + fibNaive(n - 2)
  }

  let memoCallCount = 0
  function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
    memoCallCount++
    if (n <= 1) return n
    if (memo.has(n)) return memo.get(n)!
    const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
    memo.set(n, result)
    return result
  }

  lines.push('')
  lines.push('不同 n 值的调用次数对比:')
  lines.push('  n      | 朴素递归      | 记忆化递归  | 性能提升')
  lines.push('  -------|--------------|------------|------------------')

  for (const n of [5, 10, 15, 20, 25, 30]) {
    naiveCallCount = 0
    fibNaive(n)
    memoCallCount = 0
    fibMemo(n)
    const ratio = (naiveCallCount / memoCallCount).toFixed(0)
    lines.push(`  fib(${String(n).padEnd(2)}) | ${String(naiveCallCount).padEnd(12)} | ${String(memoCallCount).padEnd(10)} | ${ratio}x 更快`)
  }
  lines.push('')

  // --- 2. 缓存状态展示 ---
  lines.push('【2】记忆化缓存状态展示 —— fib(8)')
  lines.push('─────────────────────────────────────────')

  const cacheLog: string[] = []
  function fibMemoTrace(n: number, memo: Map<number, number> = new Map(), depth: number = 0): number {
    const indent = '  '.repeat(depth)
    if (n <= 1) {
      cacheLog.push(`${indent}fib(${n}) = ${n} [基本情况]`)
      return n
    }
    if (memo.has(n)) {
      cacheLog.push(`${indent}fib(${n}) = ${memo.get(n)} [缓存命中!]`)
      return memo.get(n)!
    }
    cacheLog.push(`${indent}开始计算 fib(${n})...`)
    const left = fibMemoTrace(n - 1, memo, depth + 1)
    const right = fibMemoTrace(n - 2, memo, depth + 1)
    const result = left + right
    memo.set(n, result)
    cacheLog.push(`${indent}fib(${n}) = ${left} + ${right} = ${result} [存入缓存]`)
    return result
  }

  fibMemoTrace(8)
  for (const log of cacheLog) {
    lines.push(`  ${log}`)
  }
  lines.push('')

  // 展示最终缓存内容
  const finalMemo = new Map<number, number>()
  fibMemo(8, finalMemo)
  lines.push('最终缓存内容:')
  const entries = Array.from(finalMemo.entries()).sort((a, b) => a[0] - b[0])
  lines.push(`  { ${entries.map(([k, v]) => `fib(${k})=${v}`).join(', ')} }`)
  lines.push('')

  // --- 3. 网格路径问题 ---
  lines.push('【3】网格路径问题 —— 从左上角到右下角的路径数')
  lines.push('─────────────────────────────────────────')

  let pathCallCount = 0
  function gridPaths(m: number, n: number, memo: Map<string, number> = new Map()): number {
    pathCallCount++
    if (m === 1 || n === 1) return 1
    const key = `${m},${n}`
    if (memo.has(key)) return memo.get(key)!
    const result = gridPaths(m - 1, n, memo) + gridPaths(m, n - 1, memo)
    memo.set(key, result)
    return result
  }

  let pathCallCountNaive = 0
  function gridPathsNaive(m: number, n: number): number {
    pathCallCountNaive++
    if (m === 1 || n === 1) return 1
    return gridPathsNaive(m - 1, n) + gridPathsNaive(m, n - 1)
  }

  for (const [m, n] of [[3, 3], [5, 5], [8, 8], [10, 10]]) {
    pathCallCountNaive = 0
    gridPathsNaive(m, n)
    pathCallCount = 0
    const memoResult = gridPaths(m, n)
    lines.push(`  ${m}×${n} 网格: 路径数 = ${memoResult}`)
    lines.push(`    朴素递归: ${pathCallCountNaive} 次调用`)
    lines.push(`    记忆化:   ${pathCallCount} 次调用 (减少 ${Math.round((1 - pathCallCount / pathCallCountNaive) * 100)}%)`)
    lines.push('')
  }

  // --- 4. 零钱兑换 ---
  lines.push('【4】零钱兑换 —— 凑出目标金额的最少硬币数')
  lines.push('─────────────────────────────────────────')

  let coinCallCount = 0
  function coinChange(coins: number[], amount: number, memo: Map<number, number> = new Map()): number {
    coinCallCount++
    if (amount === 0) return 0
    if (amount < 0) return -1
    if (memo.has(amount)) return memo.get(amount)!

    let minCoins = Infinity
    for (const coin of coins) {
      const sub = coinChange(coins, amount - coin, memo)
      if (sub >= 0) minCoins = Math.min(minCoins, sub + 1)
    }

    const result = minCoins === Infinity ? -1 : minCoins
    memo.set(amount, result)
    return result
  }

  const testCases = [
    { coins: [1, 5, 10, 25], amount: 30, desc: '硬币 [1, 5, 10, 25]，金额 30' },
    { coins: [1, 3, 4], amount: 15, desc: '硬币 [1, 3, 4]，金额 15' },
    { coins: [2, 5, 10], amount: 27, desc: '硬币 [2, 5, 10]，金额 27' },
    { coins: [1, 2, 5], amount: 100, desc: '硬币 [1, 2, 5]，金额 100' },
  ]

  for (const tc of testCases) {
    coinCallCount = 0
    const result = coinChange(tc.coins, tc.amount)
    lines.push(`  ${tc.desc}:`)
    lines.push(`    最少硬币数 = ${result}`)
    lines.push(`    递归调用次数 = ${coinCallCount}`)
    lines.push('')
  }

  // --- 5. 缓存键设计对比 ---
  lines.push('【5】缓存键设计 —— 正确 vs 错误示例')
  lines.push('─────────────────────────────────────────')

  lines.push('  场景: 二维网格路径，3×3 网格')
  lines.push('')

  // 正确：使用 (row, col) 作为键
  const correctMemo = new Map<string, number>()
  let correctCalls = 0
  function gridPathsCorrect(m: number, n: number): number {
    correctCalls++
    if (m === 1 || n === 1) return 1
    const key = `${m},${n}`
    if (correctMemo.has(key)) return correctMemo.get(key)!
    const result = gridPathsCorrect(m - 1, n) + gridPathsCorrect(m, n - 1)
    correctMemo.set(key, result)
    return result
  }

  // 错误：只用行作为键
  const wrongMemo = new Map<number, number>()
  let wrongCalls = 0
  function gridPathsWrong(m: number, n: number): number {
    wrongCalls++
    if (m === 1 || n === 1) return 1
    const key = m
    if (wrongMemo.has(key)) return wrongMemo.get(key)!
    const result = gridPathsWrong(m - 1, n) + gridPathsWrong(m, n - 1)
    wrongMemo.set(key, result)
    return result
  }

  correctCalls = 0
  const correctResult = gridPathsCorrect(3, 3)
  wrongCalls = 0
  const wrongResult = gridPathsWrong(3, 3)

  lines.push(`  ✅ 正确键 "${'{'}row,col{'}'}": 调用 ${correctCalls} 次，结果 = ${correctResult}`)
  lines.push(`  ❌ 错误键 "row":     调用 ${wrongCalls} 次，结果 = ${wrongResult} (可能错误!)`)
  lines.push('')
  lines.push('  启示: 状态键必须包含所有影响返回值的参数!')
  lines.push('')

  // --- 6. 记忆化的空间换时间 ---
  lines.push('【6】总结：记忆化的空间换时间')
  lines.push('─────────────────────────────────────────')
  lines.push('')
  lines.push('  记忆化搜索三要素:')
  lines.push('    1. 递归函数 —— 定义问题分解方式')
  lines.push('    2. 缓存 (备忘录) —— 存储已求解的结果')
  lines.push('    3. 查/写缓存逻辑 —— 入口查，计算后写')
  lines.push('')
  lines.push('  适用条件: 存在重叠子问题')
  lines.push('  时间优化: 通常从指数级 → 多项式级')
  lines.push('  代价: 额外 O(子问题数量) 的空间')
  lines.push('')
  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}
