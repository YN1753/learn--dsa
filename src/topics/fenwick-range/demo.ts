// 树状数组区间操作演示

class FenwickTree {
  private tree: number[]
  private n: number

  constructor(size: number) {
    this.n = size
    this.tree = new Array(size + 2).fill(0)
  }

  update(i: number, delta: number): void {
    for (; i <= this.n; i += i & (-i)) {
      this.tree[i] += delta
    }
  }

  query(i: number): number {
    let sum = 0
    for (; i > 0; i -= i & (-i)) {
      sum += this.tree[i]
    }
    return sum
  }
}

export default function fenwickRangeDemo(): string {
  const output: string[] = []

  output.push('=== 树状数组区间操作演示 ===\n')

  // Part 1: 区间加 + 单点查询（一个 BIT 维护差分数组）
  output.push('【方法一】区间加 + 单点查询（1 个 BIT）')
  output.push('原理：用 BIT 维护差分数组 d，区间 [l,r] 加 v -> d[l]+=v, d[r+1]-=v')
  output.push('单点查询 a[i] = sum(d[1..i])\n')

  const n1 = 8
  const arr1 = [0, 1, 2, 3, 4, 5, 6, 7, 8] // 1-indexed
  const bit1 = new FenwickTree(n1)

  output.push(`初始数组 a = [${arr1.slice(1).join(', ')}]`)

  // 区间 [3, 6] 加 5
  const l1 = 3, r1 = 6, v1 = 5
  bit1.update(l1, v1)
  bit1.update(r1 + 1, -v1)
  output.push(`\n操作: 区间 [${l1}, ${r1}] 加 ${v1}`)
  output.push(`  d[${l1}] += ${v1}, d[${r1 + 1}] -= ${v1}`)

  // 查询各位置
  output.push('\n查询各位置的值:')
  for (let i = 1; i <= n1; i++) {
    const val = arr1[i] + bit1.query(i)
    output.push(`  a[${i}] = ${arr1[i]} + ${bit1.query(i)}(差分前缀和) = ${val}`)
  }

  // 再做一次区间加
  output.push('')
  const l1b = 2, r1b = 5, v1b = 3
  bit1.update(l1b, v1b)
  bit1.update(r1b + 1, -v1b)
  output.push(`操作: 区间 [${l1b}, ${r1b}] 加 ${v1b}`)
  output.push(`  d[${l1b}] += ${v1b}, d[${r1b + 1}] -= ${v1b}`)

  output.push('\n查询各位置的值（两次区间加之后）:')
  for (let i = 1; i <= n1; i++) {
    const val = arr1[i] + bit1.query(i)
    output.push(`  a[${i}] = ${arr1[i]} + ${bit1.query(i)}(差分前缀和) = ${val}`)
  }

  // Part 2: 区间加 + 区间查询（两个 BIT）
  output.push('\n\n【方法二】区间加 + 区间查询（2 个 BIT）')
  output.push('原理：B1 维护 d[i]，B2 维护 i*d[i]')
  output.push('区间 [l,r] 加 v:')
  output.push('  B1.update(l, v), B1.update(r+1, -v)')
  output.push('  B2.update(l, l*v), B2.update(r+1, -(r+1)*v)')
  output.push('区间查询 sum(a[1..x]) = (x+1)*B1.sum(x) - B2.sum(x)\n')

  const n2 = 8
  const arr2 = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  const B1 = new FenwickTree(n2)
  const B2 = new FenwickTree(n2)

  function rangeUpdate(l: number, r: number, v: number): void {
    B1.update(l, v)
    B1.update(r + 1, -v)
    B2.update(l, l * v)
    B2.update(r + 1, -(r + 1) * v)
  }

  function prefixSum(x: number): number {
    return (x + 1) * B1.query(x) - B2.query(x)
  }

  function rangeSum(l: number, r: number): number {
    return prefixSum(r) - prefixSum(l - 1)
  }

  output.push(`初始数组 a = [${arr2.slice(1).join(', ')}]`)

  // 区间 [3, 6] 加 5
  rangeUpdate(3, 6, 5)
  output.push(`\n操作: 区间 [3, 6] 加 5`)

  // 区间查询 [2, 7]
  const sum1 = rangeSum(2, 7)
  const expected1 = (2 + 3 + 8 + 9 + 10 + 11)
  output.push(`查询 sum(a[2..7]) = ${sum1}  (期望: ${expected1})`)

  // 区间查询 [1, 8]
  const sum2 = rangeSum(1, 8)
  const expected2 = (1 + 2 + 8 + 9 + 10 + 11 + 12 + 8)
  output.push(`查询 sum(a[1..8]) = ${sum2}  (期望: ${expected2})`)

  // 再做一次区间加
  rangeUpdate(2, 5, 3)
  output.push(`\n操作: 区间 [2, 5] 加 3`)

  // 验证每个位置
  output.push('\n逐位置验证:')
  for (let i = 1; i <= n2; i++) {
    const prefixVal = prefixSum(i)
    const prefixPrev = prefixSum(i - 1)
    const pointVal = prefixVal - prefixPrev
    output.push(`  a[${i}] = ${pointVal}  (期望: ${arr2[i] + (i >= 3 && i <= 6 ? 5 : 0) + (i >= 2 && i <= 5 ? 3 : 0)})`)
  }

  // 区间查询
  const sum3 = rangeSum(1, 8)
  const expected3 = 1 + 5 + 11 + 12 + 13 + 11 + 12 + 8
  output.push(`\n查询 sum(a[1..8]) = ${sum3}  (期望: ${expected3})`)

  const sum4 = rangeSum(4, 6)
  const expected4 = 12 + 13 + 11
  output.push(`查询 sum(a[4..6]) = ${sum4}  (期望: ${expected4})`)

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
