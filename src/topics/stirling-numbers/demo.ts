/**
 * 斯特林数演示
 * 展示第一类和第二类斯特林数的计算
 */

function stirlingFirst(n: number, k: number, memo: Map<string, number> = new Map()): number {
  const key = `${n},${k}`
  if (memo.has(key)) return memo.get(key)!

  if (n === 0 && k === 0) return 1
  if (n === 0 || k === 0) return 0
  if (k > n) return 0

  const result = stirlingFirst(n - 1, k - 1, memo) + (n - 1) * stirlingFirst(n - 1, k, memo)
  memo.set(key, result)
  return result
}

function stirlingSecond(n: number, k: number, memo: Map<string, number> = new Map()): number {
  const key = `${n},${k}`
  if (memo.has(key)) return memo.get(key)!

  if (n === 0 && k === 0) return 1
  if (n === 0 || k === 0) return 0
  if (k > n) return 0

  const result = stirlingSecond(n - 1, k - 1, memo) + k * stirlingSecond(n - 1, k, memo)
  memo.set(key, result)
  return result
}

function buildTriangle(n: number, type: 'first' | 'second'): number[][] {
  const tri: number[][] = []
  for (let i = 0; i <= n; i++) {
    tri[i] = []
    for (let j = 0; j <= i; j++) {
      if (i === 0 && j === 0) {
        tri[i][j] = 1
      } else if (j === 0 || i === 0) {
        tri[i][j] = 0
      } else if (type === 'first') {
        tri[i][j] = tri[i - 1][j - 1] + (i - 1) * tri[i - 1][j]
      } else {
        tri[i][j] = tri[i - 1][j - 1] + j * tri[i - 1][j]
      }
    }
  }
  return tri
}

function formatTriangle(tri: number[][], type: 'first' | 'second'): string {
  const lines: string[] = []
  const symbol = type === 'first' ? 's' : 'S'
  lines.push(`${type === 'first' ? '第一类' : '第二类'}斯特林数三角形:`)
  lines.push('')

  for (let n = 0; n < tri.length; n++) {
    const row = tri[n].map((v, k) => `${symbol}(${n},${k})=${v}`).join('  ')
    lines.push(`n=${n}: ${row}`)
  }
  return lines.join('\n')
}

export default function stirlingNumbersDemo(): string {
  const output: string[] = []

  output.push('=== 斯特林数演示 ===\n')

  // 1. 第二类斯特林数基础计算
  output.push('1. 第二类斯特林数 S(n, k) 计算')
  const examples2: [number, number][] = [[4, 2], [5, 3], [6, 2], [5, 5]]
  for (const [n, k] of examples2) {
    const result = stirlingSecond(n, k)
    output.push(`   S(${n}, ${k}) = ${result}`)
  }
  output.push('')

  // 2. 第一类斯特林数基础计算
  output.push('2. 第一类斯特林数 s(n, k) 计算（无符号）')
  const examples1: [number, number][] = [[4, 2], [5, 3], [6, 2], [5, 5]]
  for (const [n, k] of examples1) {
    const result = stirlingFirst(n, k)
    output.push(`   s(${n}, ${k}) = ${result}`)
  }
  output.push('')

  // 3. 第二类斯特林数三角形
  output.push('3. 第二类斯特林数三角形 (n = 0 到 7):')
  const tri2 = buildTriangle(7, 'second')
  output.push(formatTriangle(tri2, 'second'))
  output.push('')

  // 4. 第一类斯特林数三角形
  output.push('4. 第一类斯特林数三角形 (n = 0 到 7):')
  const tri1 = buildTriangle(7, 'first')
  output.push(formatTriangle(tri1, 'first'))
  output.push('')

  // 5. 贝尔数（第二类斯特林数的行和）
  output.push('5. 贝尔数 B(n) = sum S(n, k) for k = 0 to n:')
  const bellNumbers: number[] = []
  for (let n = 0; n <= 10; n++) {
    let sum = 0
    for (let k = 0; k <= n; k++) {
      sum += stirlingSecond(n, k)
    }
    bellNumbers.push(sum)
  }
  output.push(`   B(0) 到 B(10): ${bellNumbers.join(', ')}`)
  output.push('')

  // 6. 验证幂展开关系: x^n = sum S(n,k) * x^(underline k)
  output.push('6. 验证第二类斯特林数的幂展开关系')
  output.push('   x^n = sum_{k=0}^{n} S(n,k) * x^(underline k)')
  output.push('   以 n=4, x=5 为例:')
  const x = 5
  const n = 4
  let powerResult = Math.pow(x, n)

  let fallingResult = 0
  const terms: string[] = []
  for (let k = 0; k <= n; k++) {
    const s = stirlingSecond(n, k)
    let falling = 1
    for (let j = 0; j < k; j++) {
      falling *= (x - j)
    }
    fallingResult += s * falling
    if (s > 0 && k > 0) {
      terms.push(`${s} * ${falling}`)
    }
  }
  output.push(`   ${x}^${n} = ${powerResult}`)
  output.push(`   sum = ${terms.join(' + ')} = ${fallingResult}`)
  output.push(`   验证: ${powerResult === fallingResult ? '通过' : '失败'}`)
  output.push('')

  // 7. 集合划分的具体例子
  output.push('7. 集合划分示例: 将 {1,2,3,4} 分成 2 个非空子集')
  output.push(`   方案数 S(4,2) = ${stirlingSecond(4, 2)}`)
  output.push('   所有方案:')
  output.push('   {1} | {2,3,4}')
  output.push('   {2} | {1,3,4}')
  output.push('   {3} | {1,2,4}')
  output.push('   {4} | {1,2,3}')
  output.push('   {1,2} | {3,4}')
  output.push('   {1,3} | {2,4}')
  output.push('   {1,4} | {2,3}')
  output.push('')

  // 8. 轮换分解的具体例子
  output.push('8. 轮换分解示例: 将 {1,2,3} 分成 2 个轮换')
  output.push(`   方案数 s(3,2) = ${stirlingFirst(3, 2)}`)
  output.push('   所有方案:')
  output.push('   (1)(2 3)')
  output.push('   (2)(1 3)')
  output.push('   (3)(1 2)')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
