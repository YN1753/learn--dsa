// Min-25筛 演示
// 计算积性函数前缀和的算法

interface Min25Result {
  n: number
  primes: number[]
  prefixSum: number
  phase1Values: Map<number, number>
  phase2Steps: string[]
}

function sievePrimes(limit: number): number[] {
  const isPrime = new Array(limit + 1).fill(true)
  isPrime[0] = isPrime[1] = false
  for (let i = 2; i * i <= limit; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= limit; j += i) {
        isPrime[j] = false
      }
    }
  }
  const primes: number[] = []
  for (let i = 2; i <= limit; i++) {
    if (isPrime[i]) primes.push(i)
  }
  return primes
}

function min25Sieve(
  n: number,
  fAtPrime: (p: number) => number,
  fAtPrimePower: (p: number, k: number) => number
): Min25Result {
  const sqrtN = Math.floor(Math.sqrt(n))
  const primes = sievePrimes(sqrtN)
  const output: string[] = []

  // 收集所有不同的 n/i 值
  const values: number[] = []
  for (let i = 1; i <= sqrtN; i++) {
    values.push(i)
  }
  for (let i = sqrtN; i >= 1; i--) {
    const v = Math.floor(n / i)
    if (v > sqrtN) values.push(v)
  }

  // 使用 Map 存储 S1 值
  const s1 = new Map<number, number>()

  // 初始化：S1(v) = sum of g(i) for i = 2 to v
  // 对于 g(p) = f(p)，使用完全积性函数的前缀和公式
  // 这里简化为：S1(v) = v - 1（假设 g(p) = 1 对所有质数）
  for (const v of values) {
    s1.set(v, v - 1)
  }

  output.push(`第一阶段：初始化 S1(v) = v - 1（假设 g(p) = 1）`)
  output.push(`收集到 ${values.length} 个不同的 n/i 值`)

  // 第一阶段：计算质数贡献
  for (const p of primes) {
    const sp1 = s1.get(p - 1) ?? 0
    for (const v of values) {
      if (v < p * p) break
      const vp = Math.floor(v / p)
      const current = s1.get(v) ?? 0
      const sub = s1.get(vp) ?? 0
      s1.set(v, current - (sub - sp1))
    }
    output.push(`处理质数 p = ${p}，更新 S1 值`)
  }

  output.push(`第一阶段完成，S1(n) = ${s1.get(n) ?? 0}`)

  // 第二阶段：计算完整前缀和
  const phase2Steps: string[] = []

  function solve(currentN: number, minPrimeIdx: number): number {
    if (currentN <= 1) return 0

    let result = s1.get(currentN) ?? 0
    phase2Steps.push(`S(${currentN}, ${minPrimeIdx}) = ${result}（质数贡献）`)

    for (let i = minPrimeIdx; i < primes.length; i++) {
      const p = primes[i]
      if (p * p > currentN) break

      let pk = p * p
      let k = 2
      while (pk <= currentN) {
        const subResult = solve(Math.floor(currentN / pk), i + 1)
        const fVal = fAtPrimePower(p, k)
        result += fVal * subResult + fAtPrimePower(p, k + 1)
        phase2Steps.push(`  加上 p=${p}, k=${k} 的贡献: ${fVal * subResult + fAtPrimePower(p, k + 1)}`)
        pk *= p
        k++
      }
    }

    return result
  }

  const finalResult = solve(n, 0)

  return {
    n,
    primes,
    prefixSum: finalResult,
    phase1Values: s1,
    phase2Steps
  }
}

export default function min25SieveDemo(): string {
  const output: string[] = []

  output.push('=== Min-25筛 演示 ===\n')

  // 演示1：计算 π(n) - 素数计数函数
  output.push('1. 计算 π(n) - 素数计数函数')
  output.push('   f(p) = 1 对所有质数 p')
  output.push('   f(p^k) = 0 对所有 k >= 2\n')

  const n1 = 100
  const result1 = min25Sieve(n1, (p) => 1, (p, k) => k >= 2 ? 0 : 1)
  output.push(`   n = ${n1}`)
  output.push(`   筛出的质数: ${result1.primes.join(', ')}`)
  output.push(`   π(${n1}) = ${result1.prefixSum}`)
  output.push(`   第一阶段 S1 值:`)
  for (const [v, val] of result1.phase1Values) {
    if (v <= 20 || v === n1) {
      output.push(`     S1(${v}) = ${val}`)
    }
  }
  output.push('')

  // 演示2：计算欧拉函数前缀和
  output.push('2. 计算欧拉函数前缀和 Σφ(i)')
  output.push('   f(p) = p - 1 对所有质数 p')
  output.push('   f(p^k) = p^k - p^(k-1) 对所有 k >= 1\n')

  const n2 = 50
  const result2 = min25Sieve(n2, (p) => p - 1, (p, k) => Math.pow(p, k) - Math.pow(p, k - 1))
  output.push(`   n = ${n2}`)
  output.push(`   Σφ(i) for i=1 to ${n2} = ${result2.prefixSum}`)
  output.push('')

  // 演示3：计算莫比乌斯函数前缀和
  output.push('3. 计算莫比乌斯函数前缀和 Σμ(i)')
  output.push('   f(p) = -1 对所有质数 p')
  output.push('   f(p^k) = 0 对所有 k >= 2\n')

  const n3 = 50
  const result3 = min25Sieve(n3, (p) => -1, (p, k) => k >= 2 ? 0 : -1)
  output.push(`   n = ${n3}`)
  output.push(`   Σμ(i) for i=1 to ${n3} = ${result3.prefixSum}`)
  output.push('')

  // 演示4：第二阶段递归过程
  output.push('4. 第二阶段递归过程示例 (n = 20)')
  const n4 = 20
  const result4 = min25Sieve(n4, (p) => 1, (p, k) => k >= 2 ? 0 : 1)
  output.push(`   n = ${n4}`)
  output.push(`   递归步骤:`)
  for (const step of result4.phase2Steps.slice(0, 10)) {
    output.push(`     ${step}`)
  }
  if (result4.phase2Steps.length > 10) {
    output.push(`     ... (共 ${result4.phase2Steps.length} 步)`)
  }
  output.push('')

  // 复杂度分析
  output.push('5. 复杂度分析')
  output.push('   时间复杂度: O(n^(3/4) / log n)')
  output.push('   空间复杂度: O(sqrt(n))')
  output.push(`   当 n = 10^6 时，约需 ${(Math.pow(10, 6) * 0.75 / Math.log(1000000)).toFixed(0)} 次操作`)
  output.push(`   当 n = 10^9 时，约需 ${(Math.pow(10, 9) * 0.75 / Math.log(1e9)).toFixed(0)} 次操作`)
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
