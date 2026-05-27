function extendedGcd(a: number, b: number): { gcd: number; x: number; y: number } {
  if (b === 0) {
    return { gcd: a, x: 1, y: 0 }
  }
  const result = extendedGcd(b, a % b)
  const x = result.y
  const y = result.x - Math.floor(a / b) * result.y
  return { gcd: result.gcd, x, y }
}

function modInverse(a: number, m: number): number | null {
  const { gcd, x } = extendedGcd(a, m)
  if (gcd !== 1) return null
  return ((x % m) + m) % m
}

export default function extendedGcdDemo(): string {
  const output: string[] = []

  output.push('=== 扩展欧几里得算法演示 ===\n')

  // 基本示例
  output.push('1. 求解贝祖等式 ax + by = gcd(a, b)')
  const examples = [
    [35, 15],
    [99, 78],
    [26, 4],
    [101, 13],
  ]
  for (const [a, b] of examples) {
    const result = extendedGcd(a, b)
    output.push(`   ${a} * (${result.x}) + ${b} * (${result.y}) = ${result.gcd}`)
    output.push(`   验证: ${a * result.x + b * result.y} = gcd(${a}, ${b}) = ${result.gcd}`)
    output.push('')
  }

  // 求模逆元
  output.push('2. 求模逆元')
  const inverseExamples = [
    [3, 7],
    [7, 11],
    [17, 43],
    [3, 6],
  ]
  for (const [a, m] of inverseExamples) {
    const inv = modInverse(a, m)
    if (inv !== null) {
      output.push(`   ${a} 在模 ${m} 下的逆元是 ${inv}`)
      output.push(`   验证: ${a} * ${inv} mod ${m} = ${(a * inv) % m}`)
    } else {
      output.push(`   ${a} 在模 ${m} 下不存在逆元 (gcd(${a}, ${m}) ≠ 1)`)
    }
    output.push('')
  }

  // 求解模线性方程
  output.push('3. 求解模线性方程 ax ≡ b (mod m)')
  const eqExamples = [
    { a: 3, b: 4, m: 7 },
    { a: 5, b: 3, m: 11 },
  ]
  for (const { a, b, m } of eqExamples) {
    const inv = modInverse(a, m)
    if (inv !== null) {
      const x = (b * inv) % m
      output.push(`   ${a}x ≡ ${b} (mod ${m})`)
      output.push(`   x = ${b} * ${a}^(-1) mod ${m} = ${b} * ${inv} mod ${m} = ${x}`)
      output.push(`   验证: ${a} * ${x} mod ${m} = ${(a * x) % m}`)
    } else {
      output.push(`   ${a}x ≡ ${b} (mod ${m}) 无唯一解`)
    }
    output.push('')
  }

  output.push('=== 演示结束 ===')

  return output.join('\n')
}