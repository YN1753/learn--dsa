function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    [a, b] = [b, a % b]
  }
  return a
}

function modMul(a: number, b: number, m: number): number {
  return ((a % m) * (b % m)) % m
}

function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base = base % mod
  while (exp > 0) {
    if (exp % 2 === 1) result = modMul(result, base, mod)
    exp = Math.floor(exp / 2)
    base = modMul(base, base, mod)
  }
  return result
}

function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n < 4) return true
  if (n % 2 === 0 || n % 3 === 0) return false

  // 简单的确定性测试（小范围）
  const smallPrimes = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
  for (const p of smallPrimes) {
    if (n === p) return true
    if (n % p === 0) return false
  }

  // Miller-Rabin简化版
  let d = n - 1
  let r = 0
  while (d % 2 === 0) {
    d = Math.floor(d / 2)
    r++
  }

  const witnesses = [2, 3, 5, 7, 11, 13]
  for (const a of witnesses) {
    if (a >= n) continue
    let x = modPow(a, d, n)
    if (x === 1 || x === n - 1) continue
    let composite = true
    for (let i = 0; i < r - 1; i++) {
      x = modMul(x, x, n)
      if (x === n - 1) {
        composite = false
        break
      }
    }
    if (composite) return false
  }
  return true
}

function pollardRho(n: number): number {
  if (n % 2 === 0) return 2

  let x = Math.floor(Math.random() * (n - 2)) + 2
  let y = x
  const c = Math.floor(Math.random() * (n - 1)) + 1
  let d = 1

  while (d === 1) {
    x = (modMul(x, x, n) + c) % n
    y = (modMul(y, y, n) + c) % n
    y = (modMul(y, y, n) + c) % n
    d = gcd(Math.abs(x - y), n)
  }

  return d === n ? -1 : d
}

function factorize(n: number): number[] {
  if (n <= 1) return []
  if (isPrime(n)) return [n]

  const factors: number[] = []
  const queue = [n]

  while (queue.length > 0) {
    const curr = queue.shift()!
    if (curr === 1) continue
    if (isPrime(curr)) {
      factors.push(curr)
      continue
    }

    let d = -1
    let attempts = 0
    while (d === -1 && attempts < 50) {
      d = pollardRho(curr)
      attempts++
    }

    if (d === -1) {
      // 降级为试除法
      for (let i = 2; i * i <= curr; i++) {
        if (curr % i === 0) {
          d = i
          break
        }
      }
      if (d === -1) {
        factors.push(curr)
        continue
      }
    }

    queue.push(d)
    queue.push(Math.floor(curr / d))
  }

  return factors.sort((a, b) => a - b)
}

export default function pollardRhoDemo(): string {
  const output: string[] = []

  output.push('=== Pollard Rho 因数分解演示 ===\n')

  // 演示1：基本因数分解
  const testNumbers = [91, 143, 323, 1001, 2021, 9991, 1000000007 * 7]
  for (const n of testNumbers) {
    const factors = factorize(n)
    const verify = factors.reduce((a, b) => a * b, 1)
    output.push(`分解 ${n} = ${factors.join(' x ')}  (验证: ${verify === n ? '正确' : '错误'})`)
  }
  output.push('')

  // 演示2：算法步骤追踪
  output.push('--- 算法步骤追踪 (n = 91) ---')
  const n = 91
  const c = 1
  let x = 2
  let y = 2
  output.push(`初始值: x = ${x}, y = ${x}, c = ${c}, n = ${n}`)
  output.push(`随机函数: f(x) = (x² + ${c}) mod ${n}\n`)

  for (let step = 1; step <= 15; step++) {
    x = (x * x + c) % n
    y = (y * y + c) % n
    y = (y * y + c) % n

    const diff = Math.abs(x - y)
    const d = gcd(diff, n)
    const marker = d > 1 && d < n ? ' <-- 发现因子!' : ''
    output.push(`步骤 ${step}: x = ${x}, y = ${y}, |x-y| = ${diff}, gcd = ${d}${marker}`)

    if (d > 1 && d < n) {
      output.push(`\n找到非平凡因子: gcd(${diff}, ${n}) = ${d}`)
      output.push(`${n} = ${d} x ${Math.floor(n / d)}`)
      break
    }
  }
  output.push('')

  // 演示3：与Miller-Rabin配合
  output.push('--- 与Miller-Rabin配合使用 ---')
  const compositeNumbers = [561, 1105, 1729, 2465, 2821, 6601]
  for (const num of compositeNumbers) {
    const prime = isPrime(num)
    if (!prime) {
      const factors = factorize(num)
      output.push(`${num} 是合数，分解为: ${factors.join(' x ')}`)
    } else {
      output.push(`${num} 是素数`)
    }
  }
  output.push('')

  // 演示4：生日悖论统计
  output.push('--- 生日悖论验证 ---')
  output.push('在模p的有限域中，大约√p次迭代后出现碰撞：')
  const primes = [7, 13, 29, 53, 97]
  for (const p of primes) {
    const seen = new Map<number, number>()
    let val = 2
    let steps = 0
    while (!seen.has(val)) {
      seen.set(val, steps)
      val = (val * val + 1) % p
      steps++
      if (steps > p * 2) break
    }
    const expected = Math.ceil(Math.sqrt(p))
    output.push(`  p=${p}: 第${seen.get(val)!}步出现重复, √p ≈ ${expected}`)
  }

  output.push('\n=== 演示结束 ===')
  return output.join('\n')
}
