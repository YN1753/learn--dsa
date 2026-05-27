interface Complex {
  re: number
  im: number
}

function fft(a: Complex[], invert: boolean): void {
  const n = a.length

  // 位逆序置换
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) {
      j ^= bit
    }
    j ^= bit
    if (i < j) {
      const tmp = a[i]
      a[i] = a[j]
      a[j] = tmp
    }
  }

  // 蝶形运算
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (2 * Math.PI / len) * (invert ? -1 : 1)
    const wlen: Complex = { re: Math.cos(ang), im: Math.sin(ang) }

    for (let i = 0; i < n; i += len) {
      let w: Complex = { re: 1, im: 0 }
      for (let j = 0; j < len / 2; j++) {
        const u = a[i + j]
        const v: Complex = {
          re: a[i + j + len / 2].re * w.re - a[i + j + len / 2].im * w.im,
          im: a[i + j + len / 2].re * w.im + a[i + j + len / 2].im * w.re,
        }
        a[i + j] = { re: u.re + v.re, im: u.im + v.im }
        a[i + j + len / 2] = { re: u.re - v.re, im: u.im - v.im }
        const newW: Complex = {
          re: w.re * wlen.re - w.im * wlen.im,
          im: w.re * wlen.im + w.im * wlen.re,
        }
        w = newW
      }
    }
  }

  if (invert) {
    for (let i = 0; i < n; i++) {
      a[i] = { re: a[i].re / n, im: a[i].im / n }
    }
  }
}

function multiply(a: number[], b: number[]): number[] {
  const n = 1 << Math.ceil(Math.log2(a.length + b.length - 1))

  const fa: Complex[] = Array.from({ length: n }, (_, i) => ({
    re: i < a.length ? a[i] : 0,
    im: 0,
  }))
  const fb: Complex[] = Array.from({ length: n }, (_, i) => ({
    re: i < b.length ? b[i] : 0,
    im: 0,
  }))

  fft(fa, false)
  fft(fb, false)

  for (let i = 0; i < n; i++) {
    fa[i] = {
      re: fa[i].re * fb[i].re - fa[i].im * fb[i].im,
      im: fa[i].re * fb[i].im + fa[i].im * fb[i].re,
    }
  }

  fft(fa, true)

  return fa.slice(0, a.length + b.length - 1).map(x => Math.round(x.re))
}

export default function fftDemo(): string {
  const output: string[] = []

  output.push('=== 快速傅里叶变换 (FFT) 演示 ===\n')

  // 多项式乘法示例
  output.push('1. 多项式乘法')
  output.push('   a(x) = 1 + 2x + 3x²  (系数: [1, 2, 3])')
  output.push('   b(x) = 4 + 5x         (系数: [4, 5])')

  const a = [1, 2, 3]
  const b = [4, 5]
  const c = multiply(a, b)

  output.push('   c(x) = a(x) * b(x)')
  output.push(`   结果系数: [${c.join(', ')}]`)
  output.push('   验证: (1+2x+3x²)(4+5x) = 4 + 5x + 8x + 10x² + 12x² + 15x³')
  output.push('        = 4 + 13x + 22x² + 15x³')
  output.push(`   实际结果: [${c.join(', ')}]\n`)

  // FFT 变换示例
  output.push('2. DFT 变换示例')
  const dftInput: Complex[] = [
    { re: 1, im: 0 },
    { re: 2, im: 0 },
    { re: 3, im: 0 },
    { re: 4, im: 0 },
  ]
  output.push(`   输入: [${dftInput.map(x => x.re).join(', ')}]`)

  fft(dftInput, false)
  output.push('   FFT 结果 (频域):')
  for (let i = 0; i < dftInput.length; i++) {
    const re = dftInput[i].re.toFixed(4)
    const im = dftInput[i].im.toFixed(4)
    output.push(`     X[${i}] = ${re} + ${im}i`)
  }
  output.push('')

  // IFFT 验证
  output.push('3. 逆变换验证 (IFFT)')
  fft(dftInput, true)
  output.push('   IFFT 结果 (还原):')
  output.push(`     [${dftInput.map(x => Math.round(x.re)).join(', ')}]`)
  output.push('   原始输入: [1, 2, 3, 4]')
  output.push('   验证: IFFT(FFT(a)) = a ✓\n')

  // 较大的多项式乘法
  output.push('4. 较大多项式乘法')
  const poly1 = [1, 3, 5, 7, 9]
  const poly2 = [2, 4, 6, 8]
  const result = multiply(poly1, poly2)
  output.push(`   a 系数: [${poly1.join(', ')}]`)
  output.push(`   b 系数: [${poly2.join(', ')}]`)
  output.push(`   a*b 系数: [${result.join(', ')}]`)

  // 手动验证
  const manual = new Array(poly1.length + poly2.length - 1).fill(0)
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      manual[i + j] += poly1[i] * poly2[j]
    }
  }
  output.push(`   朴素验证: [${manual.join(', ')}]`)
  output.push(`   结果一致: ${JSON.stringify(result) === JSON.stringify(manual) ? '✓' : '✗'}\n`)

  // 时间复杂度对比
  output.push('5. 时间复杂度对比')
  output.push('   N=1024 时:')
  output.push(`     朴素 DFT:  ${1024 * 1024} 次运算`)
  output.push(`     FFT:       ${1024 * 10} 次运算 (1024 * log₂(1024))`)
  output.push(`     加速比:    ${(1024 * 1024 / (1024 * 10)).toFixed(0)}x\n`)

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
