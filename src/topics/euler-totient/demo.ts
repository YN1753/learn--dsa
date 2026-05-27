function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

function eulerPhiDirect(n: number): number {
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

function eulerSieve(n: number): number[] {
  const phi: number[] = new Array(n + 1).fill(0)
  const primes: number[] = []
  const isComposite = new Array(n + 1).fill(false)

  phi[1] = 1

  for (let i = 2; i <= n; i++) {
    if (!isComposite[i]) {
      primes.push(i)
      phi[i] = i - 1
    }
    for (const p of primes) {
      if (i * p > n) break
      isComposite[i * p] = true
      if (i % p === 0) {
        phi[i * p] = phi[i] * p
        break
      } else {
        phi[i * p] = phi[i] * phi[p]
      }
    }
  }

  return phi
}

export default function eulerTotientDemo(): string {
  const output: string[] = []

  output.push('=== 欧拉函数演示 ===\n')

  // 1. 直接计算单个值
  output.push('1. 直接计算 φ(n)：')
  const testValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 20, 30]
  for (const n of testValues) {
    const coprimes: number[] = []
    for (let i = 1; i <= n; i++) {
      if (gcd(i, n) === 1) coprimes.push(i)
    }
    output.push(`   φ(${n}) = ${eulerPhiDirect(n)}  互质数: {${coprimes.join(', ')}}`)
  }
  output.push('')

  // 2. 公式验证
  output.push('2. 公式验证 φ(n) = n × ∏(1 - 1/p)：')
  for (const n of [12, 20, 30, 36, 60]) {
    const factors: number[] = []
    let temp = n
    for (let p = 2; p * p <= temp; p++) {
      if (temp % p === 0) {
        factors.push(p)
        while (temp % p === 0) temp /= p
      }
    }
    if (temp > 1) factors.push(temp)

    const formula = factors.map(p => `(1 - 1/${p})`).join(' × ')
    output.push(`   φ(${n}) = ${n} × ${formula} = ${eulerPhiDirect(n)}`)
  }
  output.push('')

  // 3. 筛法批量计算
  output.push('3. 欧拉筛法批量计算 φ(1) 到 φ(30)：')
  const phiTable = eulerSieve(30)
  const line1: string[] = []
  const line2: string[] = []
  for (let i = 1; i <= 30; i++) {
    line1.push(String(i).padStart(4))
    line2.push(String(phiTable[i]).padStart(4))
  }
  output.push(`   n:  ${line1.join('')}`)
  output.push(`   φ:  ${line2.join('')}`)
  output.push('')

  // 4. 欧拉定理验证
  output.push('4. 欧拉定理验证 a^φ(n) ≡ 1 (mod n)：')
  const verifyPairs = [[2, 7], [3, 10], [2, 15], [3, 8], [5, 12]]
  for (const [a, n] of verifyPairs) {
    if (gcd(a, n) !== 1) {
      output.push(`   gcd(${a}, ${n}) = ${gcd(a, n)} ≠ 1，不满足条件，跳过`)
      continue
    }
    const phiN = eulerPhiDirect(n)
    let power = 1
    for (let i = 0; i < phiN; i++) {
      power = (power * a) % n
    }
    output.push(`   ${a}^φ(${n}) = ${a}^${phiN} ≡ ${power} (mod ${n})  ${power === 1 ? '✓' : '✗'}`)
  }
  output.push('')

  // 5. 积性验证
  output.push('5. 积性函数验证：φ(mn) = φ(m) × φ(n) 当 gcd(m,n) = 1：')
  const pairs = [[3, 5], [4, 7], [2, 9], [5, 8]]
  for (const [m, n] of pairs) {
    if (gcd(m, n) !== 1) continue
    const phiM = eulerPhiDirect(m)
    const phiN = eulerPhiDirect(n)
    const phiMN = eulerPhiDirect(m * n)
    output.push(`   φ(${m}×${n}) = φ(${m * n}) = ${phiMN}，φ(${m})×φ(${n}) = ${phiM}×${phiN} = ${phiM * phiN}  ${phiMN === phiM * phiN ? '✓' : '✗'}`)
  }
  output.push('')

  // 6. RSA 示例
  output.push('6. RSA 密钥生成示例（小素数）：')
  const p = 61, q = 53
  const n = p * q
  const phiN = (p - 1) * (q - 1)
  output.push(`   选择素数 p = ${p}, q = ${q}`)
  output.push(`   n = p × q = ${n}`)
  output.push(`   φ(n) = (p-1)(q-1) = ${p - 1} × ${q - 1} = ${phiN}`)
  output.push(`   选择公钥指数 e = 17`)
  output.push(`   私钥指数 d = e^(-1) mod φ(n) = ?（需要扩展欧几里得算法）`)
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
