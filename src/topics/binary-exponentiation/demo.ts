/**
 * 快速幂演示 - 展示二进制分解和逐步计算过程
 */

// 基本快速幂
function binPow(base: number, exp: number, mod: number): number {
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

// 带步骤记录的快速幂
function binPowWithSteps(
  base: number,
  exp: number,
  mod: number
): { result: number; steps: string[] } {
  const steps: string[] = []
  let result = 1
  const originalBase = base
  let originalExp = exp
  base = base % mod

  steps.push(`计算 ${originalBase}^${originalExp} mod ${mod}`)
  steps.push(`将指数 ${originalExp} 转换为二进制: ${originalExp.toString(2)}`)
  steps.push('')

  let stepNum = 0
  while (exp > 0) {
    stepNum++
    const isOdd = exp % 2 === 1
    const expBin = exp.toString(2)
    const baseBin = base

    if (isOdd) {
      const prevResult = result
      result = (result * base) % mod
      steps.push(
        `步骤 ${stepNum}: exp=${exp} (${expBin}), 最低位为1 → result = ${prevResult} × ${baseBin} mod ${mod} = ${result}`
      )
    } else {
      steps.push(
        `步骤 ${stepNum}: exp=${exp} (${expBin}), 最低位为0 → result 不变 = ${result}`
      )
    }

    exp = Math.floor(exp / 2)
    base = (base * base) % mod
    steps.push(
      `         exp 右移 → ${exp}, base 平方 → ${baseBin}² mod ${mod} = ${base}`
    )
  }

  steps.push('')
  steps.push(`最终结果: ${result}`)
  return { result, steps }
}

// 矩阵快速幂
type Matrix2x2 = [[number, number], [number, number]]

function matMul(a: Matrix2x2, b: Matrix2x2, mod: number): Matrix2x2 {
  return [
    [
      (a[0][0] * b[0][0] + a[0][1] * b[1][0]) % mod,
      (a[0][0] * b[0][1] + a[0][1] * b[1][1]) % mod,
    ],
    [
      (a[1][0] * b[0][0] + a[1][1] * b[1][0]) % mod,
      (a[1][0] * b[0][1] + a[1][1] * b[1][1]) % mod,
    ],
  ]
}

function matPow(mat: Matrix2x2, n: number, mod: number): Matrix2x2 {
  let result: Matrix2x2 = [
    [1, 0],
    [0, 1],
  ]
  let base = mat
  while (n > 0) {
    if (n % 2 === 1) {
      result = matMul(result, base, mod)
    }
    base = matMul(base, base, mod)
    n = Math.floor(n / 2)
  }
  return result
}

function fibonacci(n: number): number {
  if (n <= 1) return n
  const fibMatrix: Matrix2x2 = [
    [1, 1],
    [1, 0],
  ]
  const result = matPow(fibMatrix, n, 1e9 + 7)
  return result[0][1]
}

export default function binaryExponentiationDemo(): string {
  const output: string[] = []

  output.push('=== 快速幂演示 ===\n')

  // 基本示例
  output.push('1. 计算 2^10 mod 1000:')
  const { steps: s1 } = binPowWithSteps(2, 10, 1000)
  for (const s of s1) {
    output.push(`   ${s}`)
  }
  output.push(`   验证: 2^10 = ${Math.pow(2, 10)}, 1024 mod 1000 = ${1024 % 1000}`)
  output.push('')

  // 较大指数
  output.push('2. 计算 3^13 mod 1000000007:')
  const { steps: s2 } = binPowWithSteps(3, 13, 1000000007)
  for (const s of s2) {
    output.push(`   ${s}`)
  }
  output.push(`   验证: 3^13 = ${BigInt(3) ** BigInt(13)}, mod 1e9+7 = ${Number(BigInt(3) ** BigInt(13) % BigInt(1000000007))}`)
  output.push('')

  // 大数快速幂
  output.push('3. 大数快速幂 (BigInt):')
  const bigBase = 123456789n
  const bigExp = 987654321n
  const bigMod = 1000000007n
  let bigResult = 1n
  let bigBaseCurr = bigBase % bigMod
  let bigExpCurr = bigExp
  let bigSteps = 0
  while (bigExpCurr > 0n) {
    if (bigExpCurr % 2n === 1n) {
      bigResult = (bigResult * bigBaseCurr) % bigMod
    }
    bigBaseCurr = (bigBaseCurr * bigBaseCurr) % bigMod
    bigExpCurr /= 2n
    bigSteps++
  }
  output.push(`   ${bigBase}^${bigExp} mod ${bigMod}`)
  output.push(`   二进制位数: ${bigExp.toString(2).length}`)
  output.push(`   循环次数: ${bigSteps}`)
  output.push(`   结果: ${bigResult}`)
  output.push('')

  // 矩阵快速幂求斐波那契
  output.push('4. 矩阵快速幂求斐波那契数列:')
  const fibResults: number[] = []
  for (let i = 0; i <= 20; i++) {
    fibResults.push(fibonacci(i))
  }
  output.push(`   F(0) 到 F(20): ${fibResults.join(', ')}`)
  output.push(`   F(100) mod 1e9+7 = ${fibonacci(100)}`)
  output.push(`   F(1000) mod 1e9+7 = ${fibonacci(1000)}`)
  output.push('')

  // 性能对比
  output.push('5. 性能对比 (朴素 vs 快速幂):')
  output.push('   计算 a^n 所需乘法次数:')
  for (const n of [10, 100, 1000, 1e6, 1e9]) {
    const naiveMul = Math.floor(n)
    const fastMul = Math.floor(Math.log2(n)) + 1
    output.push(`   n=${n.toExponential(0)}: 朴素 ${naiveMul} 次 vs 快速幂 ${fastMul} 次`)
  }
  output.push('')

  // 多组取模测试
  output.push('6. 多组测试:')
  const tests = [
    { a: 2, n: 10, m: 1000 },
    { a: 3, n: 100, m: 7 },
    { a: 7, n: 256, m: 13 },
    { a: 5, n: 1000, m: 1000000007 },
    { a: 2, n: 100, m: 100000 },
  ]
  for (const { a, n, m } of tests) {
    output.push(`   ${a}^${n} mod ${m} = ${binPow(a, n, m)}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')
  return output.join('\n')
}
