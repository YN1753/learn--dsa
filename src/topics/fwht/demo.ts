function fwhtOr(a: number[], invert: boolean): void {
  const n = a.length
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1
    for (let i = 0; i < n; i += len) {
      for (let j = 0; j < half; j++) {
        if (invert) {
          a[i + j] -= a[i + j + half]
        } else {
          a[i + j] += a[i + j + half]
        }
      }
    }
  }
}

function fwhtAnd(a: number[], invert: boolean): void {
  const n = a.length
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1
    for (let i = 0; i < n; i += len) {
      for (let j = 0; j < half; j++) {
        if (invert) {
          a[i + j + half] -= a[i + j]
        } else {
          a[i + j + half] += a[i + j]
        }
      }
    }
  }
}

function fwhtXor(a: number[], invert: boolean): void {
  const n = a.length
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1
    for (let i = 0; i < n; i += len) {
      for (let j = 0; j < half; j++) {
        const u = a[i + j]
        const v = a[i + j + half]
        a[i + j] = u + v
        a[i + j + half] = u - v
      }
    }
  }
  if (invert) {
    for (let i = 0; i < n; i++) {
      a[i] /= n
    }
  }
}

function convolution(
  a: number[],
  b: number[],
  transform: (a: number[], invert: boolean) => void,
): number[] {
  const n = a.length
  const fa = [...a]
  const fb = [...b]
  transform(fa, false)
  transform(fb, false)
  for (let i = 0; i < n; i++) {
    fa[i] *= fb[i]
  }
  transform(fa, true)
  return fa
}

function verifyOrConvolution(a: number[], b: number[], result: number[]): boolean {
  const n = a.length
  for (let k = 0; k < n; k++) {
    let expected = 0
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if ((i | j) === k) {
          expected += a[i] * b[j]
        }
      }
    }
    if (Math.round(result[k]) !== expected) return false
  }
  return true
}

function verifyXorConvolution(a: number[], b: number[], result: number[]): boolean {
  const n = a.length
  for (let k = 0; k < n; k++) {
    let expected = 0
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if ((i ^ j) === k) {
          expected += a[i] * b[j]
        }
      }
    }
    if (Math.round(result[k]) !== expected) return false
  }
  return true
}

export default function fwhtDemo(): string {
  const output: string[] = []

  output.push('=== FWHT 快速沃尔什变换演示 ===\n')

  // OR 卷积示例
  output.push('1. OR 卷积')
  const orA = [1, 2, 3, 4]
  const orB = [5, 6, 7, 8]
  output.push(`   a = [${orA.join(', ')}]`)
  output.push(`   b = [${orB.join(', ')}]`)
  output.push('   计算 c[k] = Σ (i|j=k) a[i] * b[j]')

  const orResult = convolution(orA, orB, fwhtOr)
  output.push(`   OR卷积结果: [${orResult.map(x => Math.round(x)).join(', ')}]`)
  output.push(`   朴素验证: ${verifyOrConvolution(orA, orB, orResult) ? '正确' : '错误'}\n`)

  // AND 卷积示例
  output.push('2. AND 卷积')
  const andA = [1, 2, 3, 4]
  const andB = [5, 6, 7, 8]
  output.push(`   a = [${andA.join(', ')}]`)
  output.push(`   b = [${andB.join(', ')}]`)
  output.push('   计算 c[k] = Σ (i&j=k) a[i] * b[j]')

  const andResult = convolution(andA, andB, fwhtAnd)
  output.push(`   AND卷积结果: [${andResult.map(x => Math.round(x)).join(', ')}]`)

  // 朴素验证 AND
  let andCorrect = true
  for (let k = 0; k < 4; k++) {
    let expected = 0
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if ((i & j) === k) expected += andA[i] * andB[j]
      }
    }
    if (Math.round(andResult[k]) !== expected) andCorrect = false
  }
  output.push(`   朴素验证: ${andCorrect ? '正确' : '错误'}\n`)

  // XOR 卷积示例
  output.push('3. XOR 卷积')
  const xorA = [1, 2, 3, 4]
  const xorB = [5, 6, 7, 8]
  output.push(`   a = [${xorA.join(', ')}]`)
  output.push(`   b = [${xorB.join(', ')}]`)
  output.push('   计算 c[k] = Σ (i^j=k) a[i] * b[j]')

  const xorResult = convolution(xorA, xorB, fwhtXor)
  output.push(`   XOR卷积结果: [${xorResult.map(x => Math.round(x)).join(', ')}]`)
  output.push(`   朴素验证: ${verifyXorConvolution(xorA, xorB, xorResult) ? '正确' : '错误'}\n`)

  // 逆变换验证
  output.push('4. 逆变换验证')
  const testArr = [3, 1, 4, 1]
  output.push(`   原始数组: [${testArr.join(', ')}]`)

  const testXor = [...testArr]
  fwhtXor(testXor, false)
  output.push(`   XOR正变换: [${testXor.join(', ')}]`)
  fwhtXor(testXor, true)
  output.push(`   XOR逆变换: [${testXor.map(x => Math.round(x)).join(', ')}]`)
  output.push(`   还原验证: ${testXor.every((v, i) => Math.round(v) === testArr[i]) ? '正确' : '错误'}\n`)

  // 时间复杂度对比
  output.push('5. 时间复杂度对比')
  output.push('   N=1024 (2^10) 时:')
  output.push(`     朴素卷积:  ${1024 * 1024} 次运算`)
  output.push(`     FWHT:      ${1024 * 10} 次运算 (1024 * log2(1024))`)
  output.push(`     加速比:    ${(1024 * 1024 / (1024 * 10)).toFixed(0)}x`)
  output.push('')
  output.push('   子集卷积 (N=20):')
  const naiveOps = Math.pow(3, 20)
  output.push(`     朴素:      ${naiveOps.toLocaleString()} 次运算 (3^20)`)
  const fwhtOps = 20 * Math.pow(2, 20)
  output.push(`     FWHT优化:  ${fwhtOps.toLocaleString()} 次运算 (20 * 2^20)`)
  output.push(`     加速比:    ${(naiveOps / fwhtOps).toFixed(0)}x\n`)

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
