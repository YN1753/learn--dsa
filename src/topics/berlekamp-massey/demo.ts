/**
 * Berlekamp-Massey算法演示
 *
 * 本文件演示BM算法在已知序列上的应用，包括：
 * 1. Fibonacci序列的递推式发现
 * 2. Tribonacci序列的递推式发现
 * 3. 自定义序列的递推式求解
 */

function modInverse(a: number, mod: number): number {
  let b = mod, x = 0, lastX = 1
  while (b !== 0) {
    const q = Math.floor(a / b)
    ;[a, b] = [b, a % b]
    ;[x, lastX] = [lastX - q * x, x]
  }
  return ((lastX % mod) + mod) % mod
}

/**
 * Berlekamp-Massey算法实现
 * @param seq 输入序列
 * @param mod 模数（默认998244353，一个常用的NTT质数）
 * @returns 最短线性递推式的系数数组 C，其中 C[0]=1，递推式为 a[n] = -C[1]*a[n-1] - C[2]*a[n-2] - ...
 */
function berlekampMassey(seq: number[], mod: number = 998244353): number[] {
  const n = seq.length
  let C = [1]
  let B = [1]
  let L = 0
  let m = 1
  let b = 1

  for (let i = 0; i < n; i++) {
    // 计算差异 d = a[i] + C[1]*a[i-1] + C[2]*a[i-2] + ...
    let d = seq[i] % mod
    for (let j = 1; j <= L && j < C.length; j++) {
      d = (d + C[j] * seq[i - j]) % mod
    }
    if (d < 0) d += mod

    if (d === 0) {
      m += 1
    } else {
      if (2 * L <= i) {
        const T = [...C]
        const coeff = (d * modInverse(b, mod)) % mod
        const newC = new Array(Math.max(C.length, m + B.length)).fill(0)
        for (let j = 0; j < C.length; j++) newC[j] = C[j]
        for (let j = 0; j < B.length; j++) {
          newC[j + m] = (newC[j + m] - coeff * B[j]) % mod
          if (newC[j + m] < 0) newC[j + m] += mod
        }
        C = newC
        L = i + 1 - L
        B = T
        b = d
        m = 1
      } else {
        const coeff = (d * modInverse(b, mod)) % mod
        const newC = new Array(Math.max(C.length, m + B.length)).fill(0)
        for (let j = 0; j < C.length; j++) newC[j] = C[j]
        for (let j = 0; j < B.length; j++) {
          newC[j + m] = (newC[j + m] - coeff * B[j]) % mod
          if (newC[j + m] < 0) newC[j + m] += mod
        }
        C = newC
        m += 1
      }
    }
  }

  // 裁剪多余的0
  while (C.length > 1 && C[C.length - 1] === 0) {
    C.pop()
  }

  return C
}

/**
 * 格式化递推式为可读字符串
 */
function formatRecurrence(C: number[], seqName: string): string {
  if (C.length <= 1) return `${seqName}: 无递推式`

  const terms: string[] = []
  for (let i = 1; i < C.length; i++) {
    if (C[i] === 0) continue
    const negC = ((-C[i]) % 998244353 + 998244353) % 998244353
    const sign = terms.length > 0 ? '+ ' : ''
    if (negC === 1) {
      terms.push(`${sign}a[n-${i}]`)
    } else {
      terms.push(`${sign}${negC}*a[n-${i}]`)
    }
  }

  return `${seqName}: a[n] = ${terms.join(' ')}`
}

/**
 * 使用递推式预测序列的后续项
 */
function predictNext(C: number[], seq: number[], count: number, mod: number = 998244353): number[] {
  const result = [...seq]
  for (let step = 0; step < count; step++) {
    let next = 0
    const n = result.length
    for (let j = 1; j < C.length; j++) {
      if (n - j >= 0) {
        next = (next - C[j] * result[n - j]) % mod
      }
    }
    next = ((next % mod) + mod) % mod
    result.push(next)
  }
  return result.slice(seq.length)
}

export default function berlekampMasseyDemo(): string {
  const output: string[] = []
  const mod = 998244353

  output.push('=== Berlekamp-Massey算法演示 ===\n')

  // 示例1：Fibonacci序列
  output.push('1. Fibonacci序列')
  const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
  output.push(`   输入序列: [${fib.join(', ')}]`)
  const fibC = berlekampMassey(fib, mod)
  output.push(`   递推式系数 C: [${fibC.join(', ')}]`)
  output.push(`   递推式: ${formatRecurrence(fibC, 'Fibonacci')}`)
  const fibPred = predictNext(fibC, fib, 5, mod)
  output.push(`   预测后续5项: [${fibPred.join(', ')}]`)
  output.push(`   验证: 预测值应为 [89, 144, 233, 377, 610]`)
  output.push('')

  // 示例2：Tribonacci序列
  output.push('2. Tribonacci序列')
  const trib = [1, 1, 2, 4, 7, 13, 24, 44, 81, 149]
  output.push(`   输入序列: [${trib.join(', ')}]`)
  const tribC = berlekampMassey(trib, mod)
  output.push(`   递推式系数 C: [${tribC.join(', ')}]`)
  output.push(`   递推式: ${formatRecurrence(tribC, 'Tribonacci')}`)
  const tribPred = predictNext(tribC, trib, 5, mod)
  output.push(`   预测后续5项: [${tribPred.join(', ')}]`)
  output.push(`   验证: 预测值应为 [274, 504, 927, 1705, 3136]`)
  output.push('')

  // 示例3：等比数列
  output.push('3. 等比数列 (公比=2)')
  const geo = [1, 2, 4, 8, 16, 32, 64, 128]
  output.push(`   输入序列: [${geo.join(', ')}]`)
  const geoC = berlekampMassey(geo, mod)
  output.push(`   递推式系数 C: [${geoC.join(', ')}]`)
  output.push(`   递推式: ${formatRecurrence(geoC, '等比数列')}`)
  const geoPred = predictNext(geoC, geo, 3, mod)
  output.push(`   预测后续3项: [${geoPred.join(', ')}]`)
  output.push(`   验证: 预测值应为 [256, 512, 1024]`)
  output.push('')

  // 示例4：线性数列
  output.push('4. 线性数列 a[n] = 3n + 1')
  const linear = [1, 4, 7, 10, 13, 16, 19, 22]
  output.push(`   输入序列: [${linear.join(', ')}]`)
  const linearC = berlekampMassey(linear, mod)
  output.push(`   递推式系数 C: [${linearC.join(', ')}]`)
  output.push(`   递推式: ${formatRecurrence(linearC, '线性数列')}`)
  const linearPred = predictNext(linearC, linear, 3, mod)
  output.push(`   预测后续3项: [${linearPred.join(', ')}]`)
  output.push(`   验证: 预测值应为 [25, 28, 31]`)
  output.push('')

  // 示例5：复杂递推
  output.push('5. 复杂递推 a[n] = 2*a[n-1] + 3*a[n-2]')
  const complex = [1, 1, 5, 13, 31, 71, 157, 341]
  output.push(`   输入序列: [${complex.join(', ')}]`)
  const complexC = berlekampMassey(complex, mod)
  output.push(`   递推式系数 C: [${complexC.join(', ')}]`)
  output.push(`   递推式: ${formatRecurrence(complexC, '复杂递推')}`)
  const complexPred = predictNext(complexC, complex, 3, mod)
  output.push(`   预测后续3项: [${complexPred.join(', ')}]`)
  output.push(`   验证: 预测值应为 [739, 1609, 3503]`)
  output.push('')

  output.push('=== 算法说明 ===')
  output.push('Berlekamp-Massey算法的时间复杂度为 O(n²)，空间复杂度为 O(n)。')
  output.push('算法自动找到最短的线性递推式，无需预先知道递推阶数。')
  output.push('在有限域上运算时，需要使用模逆元处理除法。')
  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
