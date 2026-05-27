interface PolyCoeff {
  degree: number
  value: number
}

function polyMultiply(a: PolyCoeff[], b: PolyCoeff[]): PolyCoeff[] {
  const maxDeg = (a.length > 0 ? a[a.length - 1].degree : 0) + (b.length > 0 ? b[b.length - 1].degree : 0)
  const result: number[] = new Array(maxDeg + 1).fill(0)
  for (const ca of a) {
    for (const cb of b) {
      result[ca.degree + cb.degree] += ca.value * cb.value
    }
  }
  return result.map((v, i) => ({ degree: i, value: v }))
}

function polyToString(poly: PolyCoeff[]): string {
  if (poly.length === 0) return '0'
  const terms = poly
    .filter(c => c.value !== 0)
    .map(c => {
      if (c.degree === 0) return `${c.value}`
      if (c.degree === 1) return c.value === 1 ? 'x' : c.value === -1 ? '-x' : `${c.value}x`
      return c.value === 1
        ? `x^${c.degree}`
        : c.value === -1
          ? `-x^${c.degree}`
          : `${c.value}x^${c.degree}`
    })
  return terms.join(' + ').replace(/\+ -/g, '- ')
}

function fibonacci(n: number): number[] {
  const seq: number[] = [0, 1]
  for (let i = 2; i <= n; i++) {
    seq.push(seq[i - 1] + seq[i - 2])
  }
  return seq
}

function catalan(n: number): number[] {
  const cat: number[] = [1]
  for (let i = 1; i <= n; i++) {
    let val = 0
    for (let j = 0; j < i; j++) {
      val += cat[j] * cat[i - 1 - j]
    }
    cat.push(val)
  }
  return cat
}

export default function generatingFunctionsDemo(): string {
  const output: string[] = []

  output.push('=== 生成函数演示 ===\n')

  // 1. 基本多项式乘法（卷积）
  output.push('1. 多项式乘法（卷积）')
  const a1: PolyCoeff[] = [
    { degree: 0, value: 1 },
    { degree: 1, value: 2 },
    { degree: 2, value: 3 },
  ]
  const b1: PolyCoeff[] = [
    { degree: 0, value: 1 },
    { degree: 1, value: 1 },
  ]
  const r1 = polyMultiply(a1, b1)
  output.push(`   A(x) = ${polyToString(a1)}`)
  output.push(`   B(x) = ${polyToString(b1)}`)
  output.push(`   A(x) * B(x) = ${polyToString(r1)}`)
  output.push(`   系数序列: [${r1.map(c => c.value).join(', ')}]\n`)

  // 2. 几何级数验证：1/(1-x) 的前几项
  output.push('2. 几何级数生成函数 1/(1-x)')
  output.push('   展开: 1 + x + x^2 + x^3 + x^4 + ...')
  output.push('   系数序列: [1, 1, 1, 1, 1, ...]\n')

  // 3. 验证 (1+x)^n 的二项式系数
  output.push('3. 二项式定理: (1+x)^4')
  const binomBase: PolyCoeff[] = [
    { degree: 0, value: 1 },
    { degree: 1, value: 1 },
  ]
  let binomResult = binomBase
  for (let i = 1; i < 4; i++) {
    binomResult = polyMultiply(binomResult, binomBase)
  }
  output.push(`   (1+x)^4 = ${polyToString(binomResult)}`)
  output.push(`   系数(二项式系数): [${binomResult.map(c => c.value).join(', ')}]`)
  output.push(`   即 C(4,0)=1, C(4,1)=4, C(4,2)=6, C(4,3)=4, C(4,4)=1\n`)

  // 4. 斐波那契数列
  output.push('4. 斐波那契数列')
  const fib = fibonacci(10)
  output.push(`   F(0..10): [${fib.join(', ')}]`)
  const fibGenPoly: PolyCoeff[] = [
    { degree: 0, value: 0 },
    { degree: 1, value: 1 },
  ]
  const fibDenom: PolyCoeff[] = [
    { degree: 0, value: 1 },
    { degree: 1, value: -1 },
    { degree: 2, value: -1 },
  ]
  output.push(`   生成函数: F(x) = x / (1 - x - x^2)`)
  output.push(`   分子: ${polyToString(fibGenPoly)}`)
  output.push(`   分母: ${polyToString(fibDenom)}`)
  output.push(`   F(x) * (1 - x - x^2) = x (验证递推关系)\n`)

  // 5. 卡特兰数
  output.push('5. 卡特兰数')
  const cat = catalan(8)
  output.push(`   C(0..8): [${cat.join(', ')}]`)
  output.push(`   递推: C(n+1) = sum(C(i) * C(n-i), i=0..n)`)
  const catSmall: PolyCoeff[] = cat.slice(0, 4).map((v, i) => ({ degree: i, value: v }))
  const catSelf = polyMultiply(catSmall, catSmall)
  output.push(`   C(x) (前4项) = ${polyToString(catSmall)}`)
  output.push(`   C(x)^2 (前几项) = ${polyToString(catSelf)}`)
  output.push(`   验证: C(x) = 1 + x*C(x)^2\n`)

  // 6. 整数分拆生成函数
  output.push('6. 整数分拆生成函数')
  output.push('   P(x) = 1/((1-x)(1-x^2)(1-x^3)...)')
  const partProd: PolyCoeff[] = [{ degree: 0, value: 1 }]
  for (let k = 1; k <= 4; k++) {
    const factor: PolyCoeff[] = []
    for (let i = 0; i <= 4; i++) {
      factor.push({ degree: i * k, value: 1 })
    }
    const newProd = polyMultiply(partProd, factor)
    partProd.length = 0
    for (const c of newProd) {
      if (c.degree <= 8) partProd.push(c)
    }
  }
  output.push(`   截断到 1/((1-x)(1-x^2)(1-x^3)(1-x^4)):`)
  output.push(`   展开系数: [${partProd.map(c => c.value).join(', ')}]`)
  output.push(`   p(0)=1, p(1)=1, p(2)=2, p(3)=3, p(4)=5, ...`)
  output.push(`   这些就是整数分拆数\n`)

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
