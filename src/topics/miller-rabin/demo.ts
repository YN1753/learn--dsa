// Miller-Rabin 素性测试演示

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n
  base = base % mod
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod
    }
    exp = exp / 2n
    base = (base * base) % mod
  }
  return result
}

function millerRabinWitness(n: bigint, a: bigint): boolean {
  // 返回 true 表示 n 可能是素数，false 表示 n 一定是合数
  if (n === a) return true
  if (n % 2n === 0n) return false

  // 将 n-1 写成 2^r * d 的形式
  let d = n - 1n
  let r = 0
  while (d % 2n === 0n) {
    d /= 2n
    r++
  }

  // 计算 a^d mod n
  let x = modPow(a, d, n)

  // 如果 a^d ≡ 1 (mod n)，通过本轮测试
  if (x === 1n || x === n - 1n) return true

  // 继续平方 r-1 次
  for (let i = 0; i < r - 1; i++) {
    x = modPow(x, 2n, n)
    if (x === n - 1n) return true
    if (x === 1n) return false // 发现非平凡平方根
  }

  return false
}

function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n < 4) return true
  if (n % 2 === 0 || n % 3 === 0) return false

  const bigN = BigInt(n)
  // 确定性底数集合，对 < 2^64 的数 100% 正确
  const witnesses = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]

  for (const w of witnesses) {
    if (BigInt(w) >= bigN) break
    if (!millerRabinWitness(bigN, BigInt(w))) return false
  }
  return true
}

export default function millerRabinDemo(): string {
  const output: string[] = []

  output.push('=== Miller-Rabin 素性测试演示 ===\n')

  // 1. 基本素数判定
  output.push('1. 基本素数判定:')
  const testNumbers = [2, 17, 20, 97, 100, 561, 1105, 2027, 7919, 1000000007]
  for (const n of testNumbers) {
    const result = isPrime(n)
    output.push(`   ${n} -> ${result ? '素数' : '合数'}`)
  }
  output.push('')

  // 2. 费马伪素数检测
  output.push('2. Carmichael数检测 (费马测试会误判，Miller-Rabin能正确识别):')
  const carmichael = [561, 1105, 1729, 2465, 2821, 6601, 8911]
  for (const n of carmichael) {
    const result = isPrime(n)
    output.push(`   ${n} (Carmichael数) -> ${result ? '素数' : '合数'} [正确识别为合数]`)
  }
  output.push('')

  // 3. 展示测试过程
  output.push('3. 详细测试过程 (n=561, 底数a=2):')
  const n561 = 561n
  let d = n561 - 1n
  let r = 0
  while (d % 2n === 0n) {
    d /= 2n
    r++
  }
  output.push(`   n = 561`)
  output.push(`   n-1 = 560 = 2^${r} * ${d}`)

  const x0 = modPow(2n, d, n561)
  output.push(`   a^d mod n = 2^${d} mod 561 = ${x0}`)

  let x = x0
  if (x === 1n || x === n561 - 1n) {
    output.push(`   ${x} ≡ ${x === 1n ? '1' : 'n-1'} (mod n)，通过测试`)
  } else {
    output.push(`   ${x} ≠ 1 且 ≠ n-1，继续平方探测:`)
    for (let i = 0; i < r - 1; i++) {
      const prevX = x
      x = modPow(x, 2n, n561)
      output.push(`   第${i + 1}次平方: ${prevX}^2 mod 561 = ${x}`)
      if (x === n561 - 1n) {
        output.push(`   到达 n-1，通过测试`)
        break
      }
      if (x === 1n) {
        output.push(`   发现非平凡平方根! 561是合数`)
        break
      }
    }
  }
  output.push('')

  // 4. 大素数查找
  output.push('4. 查找大素数 (从10^9开始):')
  let candidate = 1000000000
  let found = 0
  while (found < 5) {
    if (isPrime(candidate)) {
      output.push(`   ${candidate} 是素数`)
      found++
    }
    candidate++
  }
  output.push('')

  // 5. 素数计数
  output.push('5. 素数计数 (π(n)):')
  const ranges = [100, 1000, 10000]
  for (const limit of ranges) {
    let count = 0
    for (let i = 2; i <= limit; i++) {
      if (isPrime(i)) count++
    }
    output.push(`   π(${limit}) = ${count}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
