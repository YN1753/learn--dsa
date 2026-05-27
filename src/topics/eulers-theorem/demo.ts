function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

function eulerPhi(n: number): number {
  let result = n
  let temp = n
  for (let p = 2; p * p <= temp; p++) {
    if (temp % p === 0) {
      while (temp % p === 0) {
        temp /= p
      }
      result -= result / p
    }
  }
  if (temp > 1) {
    result -= result / temp
  }
  return Math.floor(result)
}

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

export default function eulersTheoremDemo(): string {
  const output: string[] = []

  output.push('=== 欧拉定理演示 ===\n')

  // 1. 基本验证
  output.push('1. 欧拉定理验证：a^φ(n) ≡ 1 (mod n)，当 gcd(a,n) = 1')
  const verifyPairs: [number, number][] = [[2, 7], [3, 5], [2, 9], [3, 10], [5, 12], [7, 15]]
  for (const [a, n] of verifyPairs) {
    const g = gcd(a, n)
    if (g !== 1) {
      output.push(`   gcd(${a}, ${n}) = ${g} ≠ 1，不满足条件`)
      continue
    }
    const phiN = eulerPhi(n)
    const result = modPow(a, phiN, n)
    output.push(`   ${a}^φ(${n}) = ${a}^${phiN} ≡ ${result} (mod ${n})  ${result === 1 ? '✓' : '✗'}`)
  }
  output.push('')

  // 2. 降幂公式演示
  output.push('2. 降幂公式演示：a^b ≡ a^(b mod φ(n)) (mod n)')
  const reduceCases: [number, number, number][] = [[2, 100, 7], [3, 50, 8], [5, 999, 12], [2, 1000, 9]]
  for (const [a, b, n] of reduceCases) {
    const phiN = eulerPhi(n)
    const reducedExp = b % phiN
    const directResult = modPow(a, b, n)
    const reducedResult = modPow(a, reducedExp, n)
    output.push(`   ${a}^${b} mod ${n}: φ(${n}) = ${phiN}, ${b} mod ${phiN} = ${reducedExp}`)
    output.push(`     直接计算: ${a}^${b} ≡ ${directResult} (mod ${n})`)
    output.push(`     降幂计算: ${a}^${reducedExp} ≡ ${reducedResult} (mod ${n})`)
    if (gcd(a, n) === 1) {
      output.push(`     结果一致: ${directResult === reducedResult ? '✓' : '✗'}`)
    } else {
      output.push(`     gcd(${a},${n}) = ${gcd(a, n)} ≠ 1，降幂仅在互质时保证正确`)
    }
  }
  output.push('')

  // 3. 幂运算循环展示
  output.push('3. 幂运算循环：观察 a^k mod n 的周期性')
  const cycleCases: [number, number][] = [[2, 7], [3, 7], [2, 9], [5, 12]]
  for (const [a, n] of cycleCases) {
    const phiN = eulerPhi(n)
    output.push(`   ${a}^k mod ${n} (φ(${n}) = ${phiN}):`)
    const values: string[] = []
    for (let k = 1; k <= phiN; k++) {
      values.push(`${a}^${k} ≡ ${modPow(a, k, n)}`)
    }
    output.push(`     ${values.join(', ')}`)
    output.push(`     ${a}^${phiN} ≡ ${modPow(a, phiN, n)} (回到 1)`)
  }
  output.push('')

  // 4. 扩展欧拉定理演示
  output.push('4. 扩展欧拉定理：a^b ≡ a^(b mod φ(n) + φ(n)) (mod n)，当 b ≥ φ(n)')
  const extCases: [number, number, number][] = [[6, 100, 8], [4, 50, 6], [2, 10, 4], [6, 20, 9]]
  for (const [a, b, n] of extCases) {
    const phiN = eulerPhi(n)
    if (b < phiN) {
      output.push(`   ${a}^${b} mod ${n}: b = ${b} < φ(${n}) = ${phiN}，不满足扩展条件，直接计算: ${modPow(a, b, n)}`)
    } else {
      const extExp = (b % phiN) + phiN
      const directResult = modPow(a, b, n)
      const extResult = modPow(a, extExp, n)
      output.push(`   ${a}^${b} mod ${n}: φ(${n}) = ${phiN}, 扩展指数 = ${b} mod ${phiN} + ${phiN} = ${extExp}`)
      output.push(`     直接计算: ${directResult}，扩展公式: ${extResult}  ${directResult === extResult ? '✓' : '✗'}`)
    }
  }
  output.push('')

  // 5. 费马小定理特例
  output.push('5. 费马小定理特例：当 n 为素数 p 时，a^(p-1) ≡ 1 (mod p)')
  const primes = [5, 7, 11, 13]
  for (const p of primes) {
    const a = 2
    const result = modPow(a, p - 1, p)
    output.push(`   ${a}^(${p}-1) = ${a}^${p - 1} ≡ ${result} (mod ${p})  ${result === 1 ? '✓' : '✗'}`)
  }
  output.push('')

  // 6. 模逆元计算
  output.push('6. 使用欧拉定理计算模逆元：a^(-1) ≡ a^(φ(n)-1) (mod n)')
  const inversePairs: [number, number][] = [[3, 7], [5, 12], [7, 15], [11, 13]]
  for (const [a, n] of inversePairs) {
    if (gcd(a, n) !== 1) {
      output.push(`   gcd(${a}, ${n}) = ${gcd(a, n)} ≠ 1，逆元不存在`)
      continue
    }
    const phiN = eulerPhi(n)
    const inv = modPow(a, phiN - 1, n)
    const check = (a * inv) % n
    output.push(`   ${a}^(-1) mod ${n} = ${a}^${phiN - 1} ≡ ${inv} (mod ${n})  验证: ${a}×${inv} ≡ ${check} (mod ${n})  ${check === 1 ? '✓' : '✗'}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
