export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 递归 (Recursion) 演示 ===')
  lines.push('')

  // --- 1. 阶乘计算（带调用栈展示） ---
  lines.push('【1】阶乘计算 factorial(5) —— 调用栈展示')
  lines.push('─────────────────────────────────────────')

  const factorialStack: string[] = []
  let factorialResult = 0

  function factorialTrace(n: number): number {
    const indent = '  '.repeat(factorialStack.length)
    factorialStack.push(`factorial(${n})`)
    lines.push(`${indent}→ 调用 factorial(${n})  栈: [${factorialStack.join(', ')}]`)

    if (n <= 1) {
      lines.push(`${indent}  命中基本情况，返回 1`)
      factorialStack.pop()
      return 1
    }

    const result = n * factorialTrace(n - 1)
    lines.push(`${indent}← factorial(${n}) = ${n} × ${result / n} = ${result}  栈: [${factorialStack.join(', ')}]`)
    factorialStack.pop()
    return result
  }

  factorialResult = factorialTrace(5)
  lines.push('')
  lines.push(`最终结果: 5! = ${factorialResult}`)
  lines.push('')

  // --- 2. 斐波那契数列（朴素 vs 记忆化） ---
  lines.push('【2】斐波那契数列 —— 朴素递归 vs 记忆化递归')
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

  const testN = 10

  naiveCallCount = 0
  const naiveResult = fibNaive(testN)
  lines.push(`朴素递归 fib(${testN}):`)
  lines.push(`  结果 = ${naiveResult}`)
  lines.push(`  调用次数 = ${naiveCallCount} 次`)

  memoCallCount = 0
  const memoResult = fibMemo(testN)
  lines.push('')
  lines.push(`记忆化递归 fib(${testN}):`)
  lines.push(`  结果 = ${memoResult}`)
  lines.push(`  调用次数 = ${memoCallCount} 次`)

  lines.push('')
  lines.push(`性能提升: ${naiveCallCount} 次 → ${memoCallCount} 次 (减少 ${Math.round((1 - memoCallCount / naiveCallCount) * 100)}%)`)

  // 对比更大的 n
  lines.push('')
  lines.push('对比不同 n 值的调用次数:')
  lines.push('  n     | 朴素递归    | 记忆化递归')
  lines.push('  ------|------------|----------')
  for (const n of [5, 10, 15, 20]) {
    naiveCallCount = 0
    fibNaive(n)
    memoCallCount = 0
    fibMemo(n)
    lines.push(`  fib(${String(n).padEnd(2)})| ${String(naiveCallCount).padEnd(10)} | ${memoCallCount}`)
  }
  lines.push('')

  // --- 3. 汉诺塔 ---
  lines.push('【3】汉诺塔 (Tower of Hanoi)')
  lines.push('─────────────────────────────────────────')

  let hanoiStep = 0
  const hanoiMoves: string[] = []

  function hanoi(n: number, from: string, to: string, aux: string): void {
    if (n === 1) {
      hanoiStep++
      const move = `第${hanoiStep}步: 将圆盘 1 从 ${from} 移到 ${to}`
      hanoiMoves.push(move)
      return
    }
    hanoi(n - 1, from, aux, to)
    hanoiStep++
    const move = `第${hanoiStep}步: 将圆盘 ${n} 从 ${from} 移到 ${to}`
    hanoiMoves.push(move)
    hanoi(n - 1, aux, to, from)
  }

  hanoiStep = 0
  hanoi(3, 'A', 'C', 'B')
  lines.push('圆盘数 = 3，从 A 移到 C（借助 B）:')
  lines.push('')
  for (const move of hanoiMoves) {
    lines.push(`  ${move}`)
  }
  lines.push('')
  lines.push(`总步数: ${hanoiMoves.length} (理论值: 2^3 - 1 = 7)`)

  // 更多圆盘
  lines.push('')
  lines.push('不同圆盘数所需的步数:')
  for (const disks of [1, 2, 3, 4, 5, 10]) {
    lines.push(`  ${disks} 个圆盘 → ${Math.pow(2, disks) - 1} 步`)
  }
  lines.push('')

  // --- 4. 递归 vs 迭代对比 ---
  lines.push('【4】递归 vs 迭代：阶乘实现对比')
  lines.push('─────────────────────────────────────────')

  // 递归版
  function factorialRecursive(n: number): number {
    if (n <= 1) return 1
    return n * factorialRecursive(n - 1)
  }

  // 迭代版
  function factorialIterative(n: number): number {
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
  }

  // 尾递归版
  function factorialTail(n: number, acc: number = 1): number {
    if (n <= 1) return acc
    return factorialTail(n - 1, n * acc)
  }

  for (const n of [5, 10]) {
    lines.push(`n = ${n}:`)
    lines.push(`  普通递归: ${factorialRecursive(n)}`)
    lines.push(`  尾递归:   ${factorialTail(n)}`)
    lines.push(`  迭代:     ${factorialIterative(n)}`)
  }
  lines.push('')

  // --- 5. 全排列 ---
  lines.push('【5】全排列生成')
  lines.push('─────────────────────────────────────────')

  function permute(arr: number[]): number[][] {
    if (arr.length <= 1) return [arr]
    const result: number[][] = []
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
      for (const perm of permute(rest)) {
        result.push([arr[i], ...perm])
      }
    }
    return result
  }

  const perms = permute([1, 2, 3])
  lines.push('[1, 2, 3] 的全排列（共 ' + perms.length + ' 种）:')
  for (const perm of perms) {
    lines.push(`  [${perm.join(', ')}]`)
  }
  lines.push('')

  // --- 6. 递归深度演示 ---
  lines.push('【6】递归深度与调用栈')
  lines.push('─────────────────────────────────────────')

  let maxDepth = 0
  function countDown(n: number, depth: number = 0): void {
    if (depth > maxDepth) maxDepth = depth
    if (n <= 0) return
    countDown(n - 1, depth + 1)
  }

  for (const n of [5, 10, 50]) {
    maxDepth = 0
    countDown(n)
    lines.push(`countDown(${n}): 最大递归深度 = ${maxDepth}`)
  }

  lines.push('')
  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}
