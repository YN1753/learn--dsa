export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 斐波那契数列 (Fibonacci Sequence) 演示 ===')
  lines.push('')

  // --- 1. 朴素递归（带调用追踪） ---
  lines.push('【1】朴素递归 - 计算 fib(7)')
  lines.push('─────────────────────────')
  lines.push('')

  let callCount = 0
  const naiveResult = fibNaiveTrace(7, 0, lines, new Set(), () => { callCount++ })
  lines.push(`结果: fib(7) = ${naiveResult}`)
  lines.push(`总调用次数: ${callCount}`)
  lines.push(`注意：很多子问题被重复计算了多次！`)
  lines.push('')

  // --- 2. 记忆化搜索 ---
  lines.push('【2】记忆化搜索 - 计算 fib(7)')
  lines.push('─────────────────────────')
  lines.push('')

  let memoCalls = 0
  const memoCache = new Map<number, number>()
  const memoResult = fibMemoTrace(7, 0, lines, memoCache, () => { memoCalls++ })
  lines.push(`结果: fib(7) = ${memoResult}`)
  lines.push(`总调用次数: ${memoCalls}（相比朴素递归大幅减少！）`)
  lines.push(`缓存内容: ${JSON.stringify(Object.fromEntries(memoCache))}`)
  lines.push('')

  // --- 3. 自底向上 DP ---
  lines.push('【3】自底向上 DP - 计算 fib(10)')
  lines.push('─────────────────────────')
  lines.push('')

  const dpResult = fibDPTrace(10, lines)
  lines.push(`结果: fib(10) = ${dpResult}`)
  lines.push('')

  // --- 4. 矩阵快速幂 ---
  lines.push('【4】矩阵快速幂 - 计算 fib(10)')
  lines.push('─────────────────────────')
  lines.push('')

  const matrixResult = fibMatrixTrace(10, lines)
  lines.push(`结果: fib(10) = ${matrixResult}`)
  lines.push('')

  // --- 5. 方法对比 ---
  lines.push('【5】各方法效率对比')
  lines.push('─────────────────────────')
  lines.push('')
  lines.push('方法             时间复杂度    空间复杂度   适用场景')
  lines.push('─────────────────────────────────────────────────────')
  lines.push('朴素递归         O(2^n)       O(n)         仅用于教学')
  lines.push('记忆化搜索       O(n)         O(n)         少量查询')
  lines.push('自底向上 DP      O(n)         O(1)         连续计算')
  lines.push('矩阵快速幂       O(log n)     O(1)         大 n 单次查询')
  lines.push('Binet 公式       O(1)         O(1)         近似值（有精度问题）')
  lines.push('')
  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 朴素递归（带追踪）
function fibNaiveTrace(
  n: number,
  depth: number,
  lines: string[],
  visited: Set<string>,
  counter: () => void
): number {
  counter()
  const indent = '  '.repeat(depth)
  const key = `${n}`

  if (n <= 1) {
    lines.push(`${indent}fib(${n}) = ${n}  [基础情况]`)
    return n
  }

  // 检查是否是重复计算
  const dupMark = ''

  lines.push(`${indent}计算 fib(${n}) = fib(${n - 1}) + fib(${n - 2})${dupMark}`)

  const a = fibNaiveTrace(n - 1, depth + 1, lines, visited, counter)
  const b = fibNaiveTrace(n - 2, depth + 1, lines, visited, counter)
  const result = a + b

  visited.add(key + '-' + depth)
  lines.push(`${indent}fib(${n}) = ${a} + ${b} = ${result}`)
  return result
}

// 记忆化搜索（带追踪）
function fibMemoTrace(
  n: number,
  depth: number,
  lines: string[],
  cache: Map<number, number>,
  counter: () => void
): number {
  counter()
  const indent = '  '.repeat(depth)

  if (n <= 1) {
    lines.push(`${indent}fib(${n}) = ${n}  [基础情况]`)
    cache.set(n, n)
    return n
  }

  if (cache.has(n)) {
    lines.push(`${indent}fib(${n}) = ${cache.get(n)}  [缓存命中!]`)
    return cache.get(n)!
  }

  lines.push(`${indent}计算 fib(${n}) = fib(${n - 1}) + fib(${n - 2})`)

  const a = fibMemoTrace(n - 1, depth + 1, lines, cache, counter)
  const b = fibMemoTrace(n - 2, depth + 1, lines, cache, counter)
  const result = a + b

  cache.set(n, result)
  lines.push(`${indent}fib(${n}) = ${a} + ${b} = ${result}  [存入缓存]`)
  return result
}

// 自底向上 DP（带追踪）
function fibDPTrace(n: number, lines: string[]): number {
  const dp: number[] = [0, 1]
  lines.push('初始化: dp[0] = 0, dp[1] = 1')
  lines.push('')

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
    lines.push(`dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`)
  }

  lines.push('')
  lines.push(`完整序列: [${dp.join(', ')}]`)
  return dp[n]
}

// 矩阵快速幂（带追踪）
function fibMatrixTrace(n: number, lines: string[]): number {
  if (n <= 1) {
    lines.push(`fib(${n}) = ${n}`)
    return n
  }

  lines.push('矩阵表示: [[1,1],[1,0]]^n 的 [0][0] 元素 = F(n+1)')
  lines.push('')

  let result: [number, number, number, number] = [1, 0, 0, 1] // 单位矩阵
  let base: [number, number, number, number] = [1, 1, 1, 0]   // 基础矩阵
  let exp = n
  let step = 0

  lines.push(`计算 M^${n}，其中 M = [[1,1],[1,0]]`)
  lines.push('')

  while (exp > 0) {
    step++
    if (exp % 2 === 1) {
      const prev = [...result]
      result = matMul(result, base)
      lines.push(
        `步骤${step}: n=${exp}为奇数 → 结果 = 结果 × M = ` +
        `[[${prev[0]},${prev[1]}],[${prev[2]},${prev[3]}]] × [[${base[0]},${base[1]}],[${base[2]},${base[3]}]] = ` +
        `[[${result[0]},${result[1]}],[${result[2]},${result[3]}]]`
      )
    } else {
      lines.push(`步骤${step}: n=${exp}为偶数 → 跳过乘法，继续平方`)
    }

    if (exp > 1) {
      const prevBase = [...base]
      base = matMul(base, base)
      lines.push(
        `        M = M × M = ` +
        `[[${prevBase[0]},${prevBase[1]}],[${prevBase[2]},${prevBase[3]}]]² = ` +
        `[[${base[0]},${base[1]}],[${base[2]},${base[3]}]]`
      )
    }

    exp = Math.floor(exp / 2)
    lines.push(`        n = n / 2 = ${exp}`)
    lines.push('')
  }

  lines.push(`最终矩阵: [[${result[0]},${result[1]}],[${result[2]},${result[3]}]]`)
  lines.push(`F(${n}) = 结果矩阵的 [0][1] = ${result[1]}`)

  return result[1]
}

// 2x2 矩阵乘法
function matMul(
  a: [number, number, number, number],
  b: [number, number, number, number]
): [number, number, number, number] {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
  ]
}
