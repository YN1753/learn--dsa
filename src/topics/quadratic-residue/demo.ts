/**
 * 二次剩余演示
 * 演示勒让德符号计算、欧拉判别法、Cipolla 算法求平方根
 */

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n
  base = ((base % mod) + mod) % mod
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod
    }
    exp = exp / 2n
    base = (base * base) % mod
  }
  return result
}

function legendreSymbol(a: number, p: number): number {
  if (a % p === 0) return 0
  const result = modPow(BigInt(a), BigInt(p - 1) / 2n, BigInt(p))
  if (result === BigInt(p - 1)) return -1
  return Number(result)
}

function isQuadraticResidue(a: number, p: number): boolean {
  return legendreSymbol(a, p) === 1
}

function findSquareRoot(a: number, p: number): number | null {
  if (p === 2) {
    return a % 2
  }
  if (!isQuadraticResidue(a, p)) return null
  if (p % 4 === 3) {
    const r = modPow(BigInt(a), BigInt(p + 1) / 4n, BigInt(p))
    return Number(r)
  }
  // Cipolla algorithm
  let t = 0
  for (let i = 1; i < p; i++) {
    if (legendreSymbol((i * i - a + p) % p, p) === -1) {
      t = i
      break
    }
  }
  const tp = BigInt(t)
  const ap = BigInt(a)
  const pp = BigInt(p)
  // (t + w)^((p+1)/2) in F_p[w] where w^2 = t^2 - a
  let x0 = 1n, x1 = 0n
  const w2 = ((tp * tp - ap) % pp + pp) % pp
  let exp = (BigInt(p) + 1n) / 2n
  // base = (t, 1) representing t + w
  let a0 = tp, a1 = 1n
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      // (x0, x1) * (a0, a1) = (x0*a0 + x1*a1*w2, x0*a1 + x1*a0)
      const nx0 = (x0 * a0 + x1 * a1 % pp * w2) % pp
      const nx1 = (x0 * a1 + x1 * a0) % pp
      x0 = nx0
      x1 = nx1
    }
    exp = exp / 2n
    // (a0, a1) = (a0, a1)^2 = (a0^2 + a1^2*w2, 2*a0*a1)
    const na0 = (a0 * a0 + a1 * a1 % pp * w2) % pp
    const na1 = (2n * a0 * a1) % pp
    a0 = na0
    a1 = na1
  }
  let result = Number(x0 % pp)
  if (result < 0) result += p
  if (BigInt(result) * BigInt(result) % pp !== ap % pp) {
    result = p - result
  }
  return result
}

function findAllQuadraticResidues(p: number): number[] {
  const residues: Set<number> = new Set()
  for (let x = 0; x < p; x++) {
    residues.add((x * x) % p)
  }
  return Array.from(residues).sort((a, b) => a - b)
}

export default function quadraticResidueDemo(): string {
  const output: string[] = []

  output.push('=== 二次剩余演示 ===\n')

  // 1. 计算模 p 的所有二次剩余
  const primes = [5, 7, 11, 13]
  output.push('1. 计算各素数模下的所有二次剩余:\n')
  for (const p of primes) {
    const residues = findAllQuadraticResidues(p)
    output.push(`   模 ${p} 的二次剩余: {${residues.join(', ')}}`)
    output.push(`   共 ${residues.length} 个（理论值: (p-1)/2 + 1 = ${(p - 1) / 2 + 1}）\n`)
  }

  // 2. 勒让德符号计算
  output.push('2. 勒让德符号计算:\n')
  const legendreCases = [
    [2, 7], [3, 7], [5, 7], [1, 11], [3, 11], [5, 11], [10, 13],
  ]
  for (const [a, p] of legendreCases) {
    const symbol = legendreSymbol(a, p)
    const desc = symbol === 1 ? '二次剩余' : symbol === -1 ? '二次非剩余' : '被整除'
    output.push(`   (${a}/${p}) = ${symbol}  →  ${a} 是模 ${p} 的${desc}`)
  }
  output.push('')

  // 3. 欧拉判别法验证
  output.push('3. 欧拉判别法验证 (p = 7):\n')
  for (let a = 1; a <= 6; a++) {
    const eulerValue = modPow(BigInt(a), 3n, 7n)
    const isQR = Number(eulerValue) === 1
    output.push(`   a = ${a}: a^((p-1)/2) = ${a}^3 ≡ ${eulerValue} (mod 7)  →  ${isQR ? '二次剩余' : '二次非剩余'}`)
  }
  output.push('')

  // 4. Cipolla 算法求平方根
  output.push('4. 使用 Cipolla 算法求模平方根:\n')
  const sqrtCases = [
    [4, 7], [2, 7], [3, 11], [5, 11], [9, 13], [10, 13],
  ]
  for (const [a, p] of sqrtCases) {
    const sqrt = findSquareRoot(a, p)
    if (sqrt !== null) {
      const otherSqrt = p - sqrt
      output.push(`   sqrt(${a}) mod ${p} = ±${Math.min(sqrt, otherSqrt)}` +
        `  (验证: ${Math.min(sqrt, otherSqrt)}^2 ≡ ${(Math.min(sqrt, otherSqrt) * Math.min(sqrt, otherSqrt)) % p} (mod ${p}))`)
    } else {
      output.push(`   sqrt(${a}) mod ${p} = 无解（${a} 不是模 ${p} 的二次剩余）`)
    }
  }
  output.push('')

  // 5. 二次互反律示例
  output.push('5. 二次互反律示例:\n')
  output.push('   计算 (3/11):')
  output.push('   由二次互反律: (3/11)(11/3) = (-1)^(((3-1)/2)*((11-1)/2)) = (-1)^(1*5) = -1')
  output.push(`   实际 (3/11) = ${legendreSymbol(3, 11)}, (11/3) = ${legendreSymbol(11 % 3, 3)}`)
  output.push(`   验证: (3/11) * (11/3) = ${legendreSymbol(3, 11) * legendreSymbol(11 % 3, 3)} (应为 -1)\n`)

  // 6. Blum 整数演示
  output.push('6. Blum 整数二次剩余 (n = 7 * 11 = 77):\n')
  output.push('   p = 7 ≡ 3 (mod 4), q = 11 ≡ 3 (mod 4), 所以 77 是 Blum 整数')
  const n = 77
  const qrModN: number[] = []
  for (let x = 1; x < n; x++) {
    const sq = (x * x) % n
    if (!qrModN.includes(sq)) {
      qrModN.push(sq)
    }
  }
  output.push(`   模 77 的二次剩余共 ${qrModN.length} 个: {${qrModN.slice(0, 10).join(', ')}...}`)
  output.push('   每个二次剩余恰好有 4 个平方根，且恰好 1 个是二次剩余\n')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
