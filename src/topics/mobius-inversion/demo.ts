// 莫比乌斯反演演示

function mobius(n: number): number {
  let result = 1
  let temp = n
  for (let p = 2; p * p <= temp; p++) {
    if (temp % p === 0) {
      temp /= p
      if (temp % p === 0) return 0
      result = -result
    }
  }
  if (temp > 1) result = -result
  return result
}

function sieveMobius(n: number): number[] {
  const mu = new Array(n + 1).fill(0)
  const primes: number[] = []
  const isComposite = new Array(n + 1).fill(false)
  mu[1] = 1

  for (let i = 2; i <= n; i++) {
    if (!isComposite[i]) {
      primes.push(i)
      mu[i] = -1
    }
    for (const p of primes) {
      if (i * p > n) break
      isComposite[i * p] = true
      if (i % p === 0) {
        mu[i * p] = 0
        break
      } else {
        mu[i * p] = -mu[i]
      }
    }
  }
  return mu
}

function getFactors(n: number): number[] {
  const factors: number[] = []
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      factors.push(d)
      if (d !== n / d) factors.push(n / d)
    }
  }
  factors.sort((a, b) => a - b)
  return factors
}

export default function mobiusInversionDemo(): string {
  const output: string[] = []

  output.push('=== 莫比乌斯反演演示 ===\n')

  // 演示 1: μ 函数值
  output.push('1. 莫比乌斯函数 μ(n) 的前 20 个值:')
  let muLine = '   n:  '
  let valLine = '   μ:  '
  for (let i = 1; i <= 20; i++) {
    muLine += String(i).padStart(4)
    valLine += String(mobius(i)).padStart(4)
  }
  output.push(muLine)
  output.push(valLine)
  output.push('')

  // 演示 2: 线性筛
  output.push('2. 线性筛求 μ 函数 (n=30):')
  const mu30 = sieveMobius(30)
  output.push('   ' + mu30.slice(1).join(', '))
  output.push('')

  // 演示 3: 验证 μ * I = e
  output.push('3. 验证 Σ μ(d) = [n==1] (对 n 的所有因子 d):')
  for (let n = 1; n <= 10; n++) {
    const factors = getFactors(n)
    let sum = 0
    let terms: string[] = []
    for (const d of factors) {
      const muVal = mobius(d)
      sum += muVal
      if (muVal !== 0) {
        terms.push(`μ(${d})=${muVal}`)
      }
    }
    const result = sum === (n === 1 ? 1 : 0) ? '✓' : '✗'
    output.push(`   n=${n}: ${terms.join(' + ')} = ${sum}  [n==1 → ${n === 1 ? 1 : 0}] ${result}`)
  }
  output.push('')

  // 演示 4: 莫比乌斯反演实例
  output.push('4. 莫比乌斯反演实例:')
  output.push('   设 g(n) = n（恒等函数）')
  output.push('   f(n) = Σ g(d) = Σ d = σ(n)（因子和函数）')
  output.push('   反演验证: g(n) = Σ μ(d) · f(n/d)\n')

  for (let n = 1; n <= 6; n++) {
    const factors = getFactors(n)
    let f_n = 0
    for (const d of factors) f_n += d

    let reconstruct = 0
    let terms: string[] = []
    for (const d of factors) {
      const n_over_d = n / d
      let f_n_over_d = 0
      for (const k of getFactors(n_over_d)) f_n_over_d += k
      const term = mobius(d) * f_n_over_d
      reconstruct += term
      if (mobius(d) !== 0) {
        terms.push(`μ(${d})·f(${n_over_d})=${mobius(d)}·${f_n_over_d}=${term}`)
      }
    }

    output.push(`   n=${n}: f(${n})=${f_n}, 因子: [${factors.join(',')}]`)
    output.push(`         ${terms.join(' + ')} = ${reconstruct}  (应等于 g(${n})=${n}) ${reconstruct === n ? '✓' : '✗'}`)
  }
  output.push('')

  // 演示 5: 互质对计数
  output.push('5. 互质对计数: gcd(i,j)=1 的对数 (1<=i<=6, 1<=j<=6):')

  // 暴力验证
  let bruteCount = 0
  for (let i = 1; i <= 6; i++) {
    for (let j = 1; j <= 6; j++) {
      function gcd(a: number, b: number): number { return b === 0 ? a : gcd(b, a % b) }
      if (gcd(i, j) === 1) bruteCount++
    }
  }

  // 莫比乌斯反演
  const mu6 = sieveMobius(6)
  let inversionCount = 0
  let terms: string[] = []
  for (let d = 1; d <= 6; d++) {
    if (mu6[d] === 0) continue
    const term = mu6[d] * Math.floor(6 / d) * Math.floor(6 / d)
    inversionCount += term
    terms.push(`μ(${d})·⌊6/d⌋²=${mu6[d]}·${Math.floor(6 / d)}²=${term}`)
  }

  output.push(`   暴力结果: ${bruteCount}`)
  output.push(`   反演公式: ${terms.join(' + ')} = ${inversionCount}`)
  output.push(`   结果一致: ${bruteCount === inversionCount ? '✓' : '✗'}`)
  output.push('')

  // 演示 6: 整除分块
  output.push('6. 整除分块演示: Σ μ(d)·⌊n/d⌋·⌊m/d⌋ (n=12, m=8):')

  const mu12 = sieveMobius(12)
  const muPrefix = new Array(13).fill(0)
  for (let i = 1; i <= 12; i++) muPrefix[i] = muPrefix[i - 1] + mu12[i]

  const n = 12, m = 8
  let blockResult = 0
  let l = 1
  while (l <= Math.min(n, m)) {
    const r = Math.min(Math.floor(n / Math.floor(n / l)), Math.floor(m / Math.floor(m / l)))
    const muSum = muPrefix[r] - muPrefix[l - 1]
    const term = muSum * Math.floor(n / l) * Math.floor(m / l)
    blockResult += term
    output.push(`   区间 [${l}, ${r}]: Σμ=${muSum}, ⌊n/d⌋=${Math.floor(n / l)}, ⌊m/d⌋=${Math.floor(m / l)}, 贡献=${term}`)
    l = r + 1
  }
  output.push(`   总结果: ${blockResult}`)
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
