function sieveOfEratosthenes(n: number): number[] {
  const isPrime = new Array(n + 1).fill(true)
  isPrime[0] = isPrime[1] = false

  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= n; j += i) {
        isPrime[j] = false
      }
    }
  }

  const primes: number[] = []
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) primes.push(i)
  }
  return primes
}

function linearSieve(n: number): { primes: number[]; lpf: number[] } {
  const primes: number[] = []
  const lpf = new Array(n + 1).fill(0) // 最小质因子

  for (let i = 2; i <= n; i++) {
    if (lpf[i] === 0) {
      lpf[i] = i
      primes.push(i)
    }
    for (const p of primes) {
      if (p > lpf[i] || i * p > n) break
      lpf[i * p] = p
    }
  }
  return { primes, lpf }
}

function factorize(n: number, lpf: number[]): Map<number, number> {
  const factors = new Map<number, number>()
  while (n > 1) {
    const p = lpf[n]
    factors.set(p, (factors.get(p) || 0) + 1)
    n /= p
  }
  return factors
}

export default function sieveDemo(): string {
  const output: string[] = []

  output.push('=== 埃氏筛演示 ===\n')

  // 基本筛法
  output.push('1. 埃氏筛法求 50 以内的质数:')
  const primes50 = sieveOfEratosthenes(50)
  output.push(`   质数列表: ${primes50.join(', ')}`)
  output.push(`   共 ${primes50.length} 个质数\n`)

  // 筛法过程模拟
  output.push('2. 筛选过程 (n=30):')
  const n = 30
  const isPrime = new Array(n + 1).fill(true)
  isPrime[0] = isPrime[1] = false
  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      const marked: number[] = []
      for (let j = i * i; j <= n; j += i) {
        if (isPrime[j]) {
          isPrime[j] = false
          marked.push(j)
        }
      }
      if (marked.length > 0) {
        output.push(`   用 ${i} 筛掉: ${marked.join(', ')}`)
      }
    }
  }
  const result: number[] = []
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) result.push(i)
  }
  output.push(`   最终质数: ${result.join(', ')}\n`)

  // 线性筛
  output.push('3. 线性筛（欧拉筛）求 50 以内的质数:')
  const { primes: linearPrimes, lpf } = linearSieve(50)
  output.push(`   质数列表: ${linearPrimes.join(', ')}`)
  output.push(`   共 ${linearPrimes.length} 个质数\n`)

  // 最小质因子表
  output.push('4. 最小质因子表 (2~20):')
  let lpfLine = '   '
  for (let i = 2; i <= 20; i++) {
    lpfLine += `${i.toString().padStart(3)}`
  }
  output.push(lpfLine)
  lpfLine = '   '
  for (let i = 2; i <= 20; i++) {
    lpfLine += `${lpf[i].toString().padStart(3)}`
  }
  output.push(lpfLine + '\n')

  // 质因数分解
  output.push('5. 质因数分解示例:')
  const testNumbers = [12, 60, 97, 360, 1024]
  for (const num of testNumbers) {
    const factors = factorize(num, lpf)
    const parts: string[] = []
    for (const [p, exp] of factors) {
      if (exp === 1) parts.push(`${p}`)
      else parts.push(`${p}^${exp}`)
    }
    output.push(`   ${num} = ${parts.join(' × ')}`)
  }
  output.push('')

  // 质数定理验证
  output.push('6. 质数定理验证:')
  for (const limit of [100, 1000, 10000]) {
    const count = sieveOfEratosthenes(limit).length
    const estimate = Math.round(limit / Math.log(limit))
    const ratio = (count / estimate).toFixed(3)
    output.push(`   π(${limit}) = ${count}, n/ln(n) ≈ ${estimate}, 比值 = ${ratio}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')
  return output.join('\n')
}
