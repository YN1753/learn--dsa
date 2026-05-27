/**
 * 扩展欧几里得算法：求 ax + by = gcd(a, b) 的一组解
 */
function extendedGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0]
  const [g, x1, y1] = extendedGcd(b, a % b)
  return [g, y1, x1 - Math.floor(a / b) * y1]
}

/**
 * 方法一：使用扩展欧几里得算法求逆元
 * 适用于 gcd(a, m) = 1 的情况，不要求 m 是质数
 */
function modInverseByGcd(a: number, m: number): number | null {
  const [g, x] = extendedGcd(a, m)
  if (g !== 1) return null
  return ((x % m) + m) % m
}

/**
 * 快速幂：计算 base^exp mod mod
 */
function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base = ((base % mod) + mod) % mod
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod
    base = (base * base) % mod
    exp >>= 1
  }
  return result
}

/**
 * 方法二：使用费马小定理求逆元
 * 要求 m 是质数且 gcd(a, m) = 1
 * a^(m-1) ≡ 1 (mod m) → a^(m-2) ≡ a⁻¹ (mod m)
 */
function modInverseByFermat(a: number, m: number): number | null {
  // 需要 a 和 m 互质
  const [g] = extendedGcd(a, m)
  if (g !== 1) return null
  return modPow(a, m - 2, m)
}

export default function modularInverseDemo(): string {
  const output: string[] = []

  output.push('=== 模逆元（Modular Inverse）演示 ===\n')

  // === 方法一：扩展欧几里得 ===
  output.push('【方法一】扩展欧几里得算法')
  output.push('原理：求 ax + my = 1 的解 x，x 即为 a 的逆元\n')

  const gcdExamples: [number, number][] = [
    [3, 7],
    [7, 11],
    [17, 43],
    [5, 12],
    [3, 6],   // 不存在逆元
    [10, 17],
  ]

  for (const [a, m] of gcdExamples) {
    const inv = modInverseByGcd(a, m)
    if (inv !== null) {
      output.push(`  求 ${a} 在模 ${m} 下的逆元:`)
      output.push(`    扩展欧几里得求解 ${a}x + ${m}y = 1`)
      output.push(`    x = ${inv}`)
      output.push(`    验证: ${a} × ${inv} = ${a * inv}，${a * inv} mod ${m} = ${(a * inv) % m} ✓`)
    } else {
      output.push(`  求 ${a} 在模 ${m} 下的逆元:`)
      output.push(`    gcd(${a}, ${m}) = ${extendedGcd(a, m)[0]} ≠ 1，逆元不存在 ✗`)
    }
    output.push('')
  }

  // === 方法二：费马小定理 ===
  output.push('【方法二】费马小定理')
  output.push('原理：若 p 是质数，则 a^(p-1) ≡ 1 (mod p)')
  output.push('      因此 a^(p-2) ≡ a⁻¹ (mod p)\n')

  const fermatExamples: [number, number][] = [
    [3, 7],
    [7, 11],
    [17, 43],
    [2, 1000000007],
    [123456789, 1000000007],
  ]

  for (const [a, p] of fermatExamples) {
    const inv = modInverseByFermat(a, p)
    if (inv !== null) {
      output.push(`  求 ${a} 在模 ${p} 下的逆元:`)
      output.push(`    计算 ${a}^(${p}-2) mod ${p}`)
      output.push(`    = ${a}^${p - 2} mod ${p}`)
      output.push(`    = ${inv}`)
      output.push(`    验证: ${a} × ${inv} mod ${p} = ${(BigInt(a) * BigInt(inv)) % BigInt(p)} ✓`)
    } else {
      output.push(`  求 ${a} 在模 ${p} 下的逆元: 逆元不存在`)
    }
    output.push('')
  }

  // === 两种方法对比 ===
  output.push('【方法对比】')
  output.push('  ┌─────────────┬──────────────────────┬──────────────────────┐')
  output.push('  │   方法       │ 扩展欧几里得          │ 费马小定理            │')
  output.push('  ├─────────────┼──────────────────────┼──────────────────────┤')
  output.push('  │ 模数要求     │ gcd(a, m) = 1 即可   │ m 必须是质数          │')
  output.push('  │ 时间复杂度   │ O(log m)             │ O(log m)             │')
  output.push('  │ 实现方式     │ 递归/迭代            │ 快速幂               │')
  output.push('  │ 适用范围     │ 更广                  │ 竞赛常用（配合质数模） │')
  output.push('  └─────────────┴──────────────────────┴──────────────────────┘')
  output.push('')

  // === 实际应用：组合数计算 ===
  output.push('【应用】组合数 C(n, k) mod p')
  output.push('  C(n,k) = n! / (k! × (n-k)!)')
  output.push('  模运算下除法 = 乘以逆元')
  output.push('')

  // 计算 C(10, 3) mod 1000000007
  const prime = 1000000007
  const n = 10
  const k = 3

  // 预计算阶乘
  let factorial = 1
  for (let i = 2; i <= n; i++) factorial = (factorial * i) % prime
  const nFact = factorial

  factorial = 1
  for (let i = 2; i <= k; i++) factorial = (factorial * i) % prime
  const kFact = factorial

  factorial = 1
  for (let i = 2; i <= n - k; i++) factorial = (factorial * i) % prime
  const nMinusKFact = factorial

  const denominator = (kFact * nMinusKFact) % prime
  const denomInv = modInverseByFermat(denominator, prime)!
  const result = (nFact * denomInv) % prime

  output.push(`  计算 C(${n}, ${k}) mod ${prime}:`)
  output.push(`    ${n}! mod ${prime} = ${nFact}`)
  output.push(`    ${k}! mod ${prime} = ${kFact}`)
  output.push(`    ${n - k}! mod ${prime} = ${nMinusKFact}`)
  output.push(`    分母 = ${kFact} × ${nMinusKFact} mod ${prime} = ${denominator}`)
  output.push(`    分母的逆元 = ${denomInv}`)
  output.push(`    C(${n}, ${k}) = ${nFact} × ${denomInv} mod ${prime} = ${result}`)
  output.push(`    验证: C(10, 3) = 120 ✓`)
  output.push('')

  // === 分数取模 ===
  output.push('【应用】分数取模')
  output.push('  计算 (a/b) mod p = (a × b⁻¹) mod p')
  output.push('')

  const fractionExamples = [
    { a: 7, b: 3, p: 11 },
    { a: 15, b: 4, p: 17 },
    { a: 100, b: 7, p: 13 },
  ]

  for (const { a, b, p } of fractionExamples) {
    const bInv = modInverseByGcd(b, p)!
    const fracResult = (a * bInv) % p
    output.push(`  (${a}/${b}) mod ${p} = ${a} × ${b}⁻¹ mod ${p}`)
    output.push(`    ${b}⁻¹ mod ${p} = ${bInv}`)
    output.push(`    = ${a} × ${bInv} mod ${p} = ${fracResult}`)
    output.push(`    验证: ${fracResult} × ${b} mod ${p} = ${(fracResult * b) % p} (应等于 ${a} mod ${p} = ${a % p}) ✓`)
    output.push('')
  }

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
