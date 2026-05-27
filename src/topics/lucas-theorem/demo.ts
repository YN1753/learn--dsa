function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base = base % mod
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod
    }
    exp = Math.floor(exp / 2)
    base = (base * base) % mod
  }
  return result
}

function combSmall(n: number, m: number, p: number): number {
  if (m > n) return 0
  if (m === 0 || m === n) return 1

  let numerator = 1
  let denominator = 1
  for (let i = 0; i < m; i++) {
    numerator = (numerator * ((n - i) % p)) % p
    denominator = (denominator * ((i + 1) % p)) % p
  }
  return (numerator * modPow(denominator, p - 2, p)) % p
}

function lucas(n: number, m: number, p: number): number {
  if (m === 0) return 1
  const ni = n % p
  const mi = m % p
  return (combSmall(ni, mi, p) * lucas(Math.floor(n / p), Math.floor(m / p), p)) % p
}

function toPAdic(n: number, p: number): number[] {
  if (n === 0) return [0]
  const digits: number[] = []
  let temp = n
  while (temp > 0) {
    digits.push(temp % p)
    temp = Math.floor(temp / p)
  }
  return digits.reverse()
}

export default function lucasTheoremDemo(): string {
  const output: string[] = []

  output.push('=== 卢卡斯定理演示 ===\n')

  // 示例 1：基本卢卡斯定理
  output.push('1. 基本卢卡斯定理计算')
  const n1 = 10
  const m1 = 3
  const p1 = 7
  output.push(`   计算 C(${n1}, ${m1}) mod ${p1}`)
  output.push(`   ${n1} 的 ${p1} 进制: ${toPAdic(n1, p1).join(', ')}`)
  output.push(`   ${m1} 的 ${p1} 进制: ${toPAdic(m1, p1).join(', ')}`)
  output.push(`   结果: ${lucas(n1, m1, p1)}\n`)

  // 示例 2：大数取模
  output.push('2. 大组合数取模')
  const n2 = 100
  const m2 = 50
  const p2 = 13
  output.push(`   计算 C(${n2}, ${m2}) mod ${p2}`)
  output.push(`   ${n2} 的 ${p2} 进制: ${toPAdic(n2, p2).join(', ')}`)
  output.push(`   ${m2} 的 ${p2} 进制: ${toPAdic(m2, p2).join(', ')}`)
  output.push(`   结果: ${lucas(n2, m2, p2)}\n`)

  // 示例 3：p 进制分解详解
  output.push('3. p 进制分解详解')
  const n3 = 1000
  const p3 = 7
  const digits3 = toPAdic(n3, p3)
  output.push(`   ${n3} 的 ${p3} 进制表示: [${digits3.join(', ')}]`)
  output.push(`   验证: ${digits3.map((d, i) => `${d}*${p3}^${digits3.length - 1 - i}`).join(' + ')}`)
  let verify = 0
  for (let i = 0; i < digits3.length; i++) {
    verify += digits3[i] * Math.pow(p3, digits3.length - 1 - i)
  }
  output.push(`   计算结果: ${verify}\n`)

  // 示例 4：小组合数计算
  output.push('4. 小组合数计算 (p 进制下)')
  const cases = [[6, 3, 7], [4, 2, 5], [5, 1, 3]]
  for (const [n, m, p] of cases) {
    const result = combSmall(n, m, p)
    output.push(`   C(${n}, ${m}) mod ${p} = ${result}`)
  }
  output.push('')

  // 示例 5：卢卡斯定理分解过程
  output.push('5. 卢卡斯定理分解过程')
  const n5 = 20
  const m5 = 8
  const p5 = 3
  output.push(`   计算 C(${n5}, ${m5}) mod ${p5}`)
  const n5Digits = toPAdic(n5, p5)
  const m5Digits = toPAdic(m5, p5)
  output.push(`   ${n5} = (${n5Digits.join(', ')})_${p5}`)
  output.push(`   ${m5} = (${m5Digits.join(', ')})_${p5}`)

  const maxLen = Math.max(n5Digits.length, m5Digits.length)
  let product = 1
  for (let i = 0; i < maxLen; i++) {
    const ni = n5Digits[n5Digits.length - 1 - i] || 0
    const mi = m5Digits[m5Digits.length - 1 - i] || 0
    const ci = combSmall(ni, mi, p5)
    output.push(`   C(${ni}, ${mi}) = ${ci}`)
    product = (product * ci) % p5
  }
  output.push(`   乘积 mod ${p5} = ${product}`)
  output.push(`   验证: C(${n5}, ${m5}) mod ${p5} = ${lucas(n5, m5, p5)}\n`)

  // 示例 6：费马小定理求逆元
  output.push('6. 费马小定理求逆元')
  const a = 3
  const p6 = 7
  const inv = modPow(a, p6 - 2, p6)
  output.push(`   ${a} 在 mod ${p6} 下的逆元 = ${inv}`)
  output.push(`   验证: ${a} * ${inv} mod ${p6} = ${(a * inv) % p6}\n`)

  // 示例 7：路径计数问题
  output.push('7. 网格路径计数')
  const gridN = 4
  const gridM = 3
  const gridP = 11
  const paths = lucas(gridN + gridM, gridN, gridP)
  output.push(`   在 ${gridN}x${gridM} 网格中，从 (0,0) 到 (${gridN},${gridM}) 的路径数 mod ${gridP}`)
  output.push(`   路径数 = C(${gridN + gridM}, ${gridN}) mod ${gridP} = ${paths}\n`)

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
