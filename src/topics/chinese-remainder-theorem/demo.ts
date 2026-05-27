/**
 * 扩展欧几里得算法：求 ax + by = gcd(a, b) 的一组解
 */
function extendedGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0]
  const [g, x1, y1] = extendedGcd(b, a % b)
  return [g, y1, x1 - Math.floor(a / b) * y1]
}

/**
 * 求 a 在模 m 下的逆元（要求 gcd(a, m) = 1）
 */
function modInverse(a: number, m: number): number {
  const [g, x] = extendedGcd(a, m)
  if (g !== 1) throw new Error(`逆元不存在：gcd(${a}, ${m}) = ${g} ≠ 1`)
  return ((x % m) + m) % m
}

/**
 * 中国剩余定理求解
 * 给定同余方程组 x ≡ r[i] (mod m[i])，求 x (mod M)
 * 要求所有 m[i] 两两互质
 */
function chineseRemainderTheorem(remainders: number[], moduli: number[]): number {
  const n = remainders.length
  // 计算 M = m₁ × m₂ × ... × mₙ
  let M = 1
  for (const m of moduli) M *= m

  let result = 0
  for (let i = 0; i < n; i++) {
    const Mi = M / moduli[i]
    const yi = modInverse(Mi, moduli[i])
    result += remainders[i] * Mi * yi
  }

  return ((result % M) + M) % M
}

export default function chineseRemainderTheoremDemo(): string {
  const output: string[] = []

  output.push('=== 中国剩余定理演示 ===\n')

  // 示例 1：经典问题
  output.push('【示例 1】经典中国剩余定理')
  output.push('求解同余方程组：')
  output.push('  x ≡ 2 (mod 3)')
  output.push('  x ≡ 3 (mod 5)')
  output.push('  x ≡ 2 (mod 7)')
  output.push('')

  const remainders1 = [2, 3, 2]
  const moduli1 = [3, 5, 7]
  let M = 1
  for (const m of moduli1) M *= m

  output.push(`步骤 1：计算 M = ${moduli1.join(' × ')} = ${M}`)

  for (let i = 0; i < moduli1.length; i++) {
    const Mi = M / moduli1[i]
    const yi = modInverse(Mi, moduli1[i])
    output.push(`步骤 ${i + 2}：M${i + 1} = ${M}/${moduli1[i]} = ${Mi}`)
    output.push(`         求 ${Mi} 在模 ${moduli1[i]} 下的逆元：t${i + 1} = ${yi}`)
    output.push(`         验证：${Mi} × ${yi} = ${Mi * yi} ≡ ${(Mi * yi) % moduli1[i]} (mod ${moduli1[i]})`)
  }

  const x1 = chineseRemainderTheorem(remainders1, moduli1)
  output.push(`\n结果：x = ${x1}`)
  output.push('验证：')
  for (let i = 0; i < moduli1.length; i++) {
    output.push(`  ${x1} ÷ ${moduli1[i]} = ${Math.floor(x1 / moduli1[i])} 余 ${x1 % moduli1[i]}  →  x ≡ ${remainders1[i]} (mod ${moduli1[i]}) ${x1 % moduli1[i] === remainders1[i] ? '✓' : '✗'}`)
  }
  output.push(`\n通解：x = ${x1} + ${M}k，k 为任意整数\n`)

  // 示例 2：《孙子算经》问题
  output.push('【示例 2】《孙子算经》经典问题')
  output.push('「今有物不知其数，三三数之剩二，五五数之剩三，七七数之剩二。问物几何？」')
  output.push('')

  const x2 = chineseRemainderTheorem([2, 3, 2], [3, 5, 7])
  output.push(`答案：x = ${x2}`)
  output.push(`验证：${x2} ÷ 3 = ${Math.floor(x2 / 3)} 余 ${x2 % 3}`)
  output.push(`      ${x2} ÷ 5 = ${Math.floor(x2 / 5)} 余 ${x2 % 5}`)
  output.push(`      ${x2} ÷ 7 = ${Math.floor(x2 / 7)} 余 ${x2 % 7}`)
  output.push('')

  // 示例 3：较大的模数
  output.push('【示例 3】较大的模数')
  output.push('求解：')
  output.push('  x ≡ 1 (mod 11)')
  output.push('  x ≡ 4 (mod 13)')
  output.push('  x ≡ 7 (mod 17)')
  output.push('')

  const remainders3 = [1, 4, 7]
  const moduli3 = [11, 13, 17]
  const x3 = chineseRemainderTheorem(remainders3, moduli3)
  let M3 = 1
  for (const m of moduli3) M3 *= m

  output.push(`M = ${moduli3.join(' × ')} = ${M3}`)
  output.push(`结果：x = ${x3}`)
  output.push('验证：')
  for (let i = 0; i < moduli3.length; i++) {
    output.push(`  ${x3} mod ${moduli3[i]} = ${x3 % moduli3[i]}  ${x3 % moduli3[i] === remainders3[i] ? '✓' : '✗'}`)
  }
  output.push('')

  // 扩展 CRT 说明
  output.push('【扩展中国剩余定理（EXCRT）】')
  output.push('当模数不两两互质时，使用 EXCRT：')
  output.push('核心思想：逐个合并同余方程')
  output.push('  x ≡ r₁ (mod m₁) 和 x ≡ r₂ (mod m₂)')
  output.push('  等价于 x = m₁·t + r₁，代入第二个方程：')
  output.push('  m₁·t ≡ (r₂ - r₁) (mod m₂)')
  output.push('  设 g = gcd(m₁, m₂)，若 (r₂ - r₁) % g ≠ 0 则无解')
  output.push('  否则用扩展欧几里得求 t，合并为 x ≡ r (mod lcm(m₁, m₂))')
  output.push('')

  // 复杂度分析
  output.push('【复杂度分析】')
  output.push('  经典 CRT：O(n · log M)，n 为方程个数，M 为所有模数之积')
  output.push('  EXCRT：O(n · log M)，每次合并需要一次扩展欧几里得')
  output.push('  空间复杂度：O(1)')

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
