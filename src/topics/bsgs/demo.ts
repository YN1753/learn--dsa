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

function modInverse(a: number, mod: number): number {
  return modPow(a, mod - 2, mod)
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

function bsgs(a: number, b: number, p: number): number {
  b = ((b % p) + p) % p
  if (b === 1) return 0

  const m = Math.ceil(Math.sqrt(p))
  const table = new Map<number, number>()

  // Baby Step
  let baby = 1
  for (let j = 0; j < m; j++) {
    if (!table.has(baby)) {
      table.set(baby, j)
    }
    baby = (baby * a) % p
  }

  // Giant Step
  const giantStep = modInverse(modPow(a, m, p), p)
  let gamma = b
  for (let i = 0; i <= m; i++) {
    const j = table.get(gamma)
    if (j !== undefined) {
      return i * m - j
    }
    gamma = (gamma * giantStep) % p
  }

  return -1 // 无解
}

function extendedBsgs(a: number, b: number, p: number): number {
  a = ((a % p) + p) % p
  b = ((b % p) + p) % p
  if (b === 1 || p === 1) return 0

  let k = 0
  let d: number
  while ((d = gcd(a, p)) !== 1) {
    if (b % d !== 0) return -1
    b /= d
    p /= d
    k++
    if (b === 1 && k > 0) return k
  }

  const result = bsgs(a, b, p)
  return result === -1 ? -1 : result + k
}

export default function bsgsDemo(): string {
  const output: string[] = []

  output.push('=== BSGS算法演示 ===\n')

  // 示例 1
  output.push('1. 求解 3^x ≡ 13 (mod 17)')
  const r1 = bsgs(3, 13, 17)
  output.push(`   结果: x = ${r1}`)
  output.push(`   验证: 3^${r1} mod 17 = ${modPow(3, r1, 17)}`)
  output.push('')

  // 示例 2
  output.push('2. 求解 2^x ≡ 8 (mod 19)')
  const r2 = bsgs(2, 8, 19)
  output.push(`   结果: x = ${r2}`)
  output.push(`   验证: 2^${r2} mod 19 = ${modPow(2, r2, 19)}`)
  output.push('')

  // 示例 3
  output.push('3. 求解 5^x ≡ 3 (mod 23)')
  const r3 = bsgs(5, 3, 23)
  output.push(`   结果: x = ${r3}`)
  output.push(`   验证: 5^${r3} mod 23 = ${modPow(5, r3, 23)}`)
  output.push('')

  // 示例 4: b = 1 的边界情况
  output.push('4. 求解 7^x ≡ 1 (mod 11) (边界: b=1)')
  const r4 = bsgs(7, 1, 11)
  output.push(`   结果: x = ${r4}`)
  output.push(`   验证: 7^${r4} mod 11 = ${modPow(7, r4, 11)}`)
  output.push('')

  // 示例 5: 扩展BSGS，a 和 p 不互质
  output.push('5. 求解 6^x ≡ 12 (mod 18) (扩展BSGS: gcd(6,18)=6)')
  const r5 = extendedBsgs(6, 12, 18)
  if (r5 !== -1) {
    output.push(`   结果: x = ${r5}`)
    output.push(`   验证: 6^${r5} mod 18 = ${modPow(6, r5, 18)}`)
  } else {
    output.push('   结果: 无解')
  }
  output.push('')

  // 示例 6: 较大素数
  output.push('6. 求解 3^x ≡ 100 (mod 1000000007)')
  const r6 = bsgs(3, 100, 1000000007)
  output.push(`   结果: x = ${r6}`)
  if (r6 !== -1) {
    output.push(`   验证: 3^${r6} mod 10^9+7 = ${modPow(3, r6, 1000000007)}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
