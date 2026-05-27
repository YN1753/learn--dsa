// 线段树 (Segment Tree) 演示

class SegmentTree {
  private tree: number[]
  private lazy: number[]
  private n: number
  private arr: number[]

  constructor(arr: number[]) {
    this.n = arr.length
    this.arr = [...arr]
    this.tree = new Array(4 * this.n).fill(0)
    this.lazy = new Array(4 * this.n).fill(0)
    this.build(1, 0, this.n - 1)
  }

  private build(node: number, start: number, end: number): void {
    if (start === end) {
      this.tree[node] = this.arr[start]
      return
    }
    const mid = Math.floor((start + end) / 2)
    this.build(2 * node, start, mid)
    this.build(2 * node + 1, mid + 1, end)
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1]
  }

  private pushDown(node: number, start: number, end: number): void {
    if (this.lazy[node] !== 0) {
      const mid = Math.floor((start + end) / 2)
      this.tree[2 * node] += this.lazy[node] * (mid - start + 1)
      this.lazy[2 * node] += this.lazy[node]
      this.tree[2 * node + 1] += this.lazy[node] * (end - mid)
      this.lazy[2 * node + 1] += this.lazy[node]
      this.lazy[node] = 0
    }
  }

  query(node: number, start: number, end: number, l: number, r: number): number {
    if (r < start || end < l) return 0
    if (l <= start && end <= r) return this.tree[node]
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    return this.query(2 * node, start, mid, l, r)
         + this.query(2 * node + 1, mid + 1, end, l, r)
  }

  pointUpdate(node: number, start: number, end: number, idx: number, val: number): void {
    if (start === end) {
      this.tree[node] = val
      this.arr[idx] = val
      return
    }
    const mid = Math.floor((start + end) / 2)
    if (idx <= mid) this.pointUpdate(2 * node, start, mid, idx, val)
    else this.pointUpdate(2 * node + 1, mid + 1, end, idx, val)
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1]
  }

  rangeUpdate(node: number, start: number, end: number, l: number, r: number, val: number): void {
    if (r < start || end < l) return
    if (l <= start && end <= r) {
      this.tree[node] += val * (end - start + 1)
      this.lazy[node] += val
      return
    }
    this.pushDown(node, start, end)
    const mid = Math.floor((start + end) / 2)
    this.rangeUpdate(2 * node, start, mid, l, r, val)
    this.rangeUpdate(2 * node + 1, mid + 1, end, l, r, val)
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1]
  }

  getTree(): number[] { return this.tree }
  getArr(): number[] { return this.arr }

  // 获取树的可视化结构
  getTreeStructure(): string {
    const lines: string[] = []
    this.printNode(1, 0, this.n - 1, '', true, lines)
    return lines.join('\n')
  }

  private printNode(node: number, start: number, end: number, prefix: string, isLast: boolean, lines: string[]): void {
    const connector = isLast ? '└── ' : '├── '
    const range = `[${start},${end}]`
    const value = this.tree[node]
    const lazyMark = this.lazy[node] !== 0 ? ` (lazy: ${this.lazy[node]})` : ''
    lines.push(prefix + connector + `${range} = ${value}${lazyMark}`)

    if (start !== end) {
      const mid = Math.floor((start + end) / 2)
      const newPrefix = prefix + (isLast ? '    ' : '│   ')
      this.printNode(2 * node + 1, mid + 1, end, newPrefix, false, lines)
      this.printNode(2 * node, start, mid, newPrefix, true, lines)
    }
  }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('        线段树 (Segment Tree) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 建树
  lines.push('【第一步】构建线段树')
  lines.push('─────────────────────────')
  const arr = [3, 1, 4, 1, 5, 9, 2, 6]
  lines.push(`原数组: [${arr.join(', ')}]`)
  lines.push('')

  const st = new SegmentTree(arr)
  lines.push('线段树结构（区间 = 值）:')
  lines.push(st.getTreeStructure())
  lines.push('')

  // 2. 区间查询
  lines.push('【第二步】区间查询')
  lines.push('─────────────────────────')
  const queries: [number, number][] = [[0, 2], [3, 5], [0, 7], [2, 4]]
  for (const [l, r] of queries) {
    const result = st.query(1, 0, arr.length - 1, l, r)
    const elements = arr.slice(l, r + 1).join(' + ')
    lines.push(`  查询 [${l}, ${r}]: ${elements} = ${result}`)
  }
  lines.push('')

  // 3. 单点修改
  lines.push('【第三步】单点修改')
  lines.push('─────────────────────────')
  lines.push(`  修改前: arr[3] = ${arr[3]}`)
  lines.push(`  执行: 将 arr[3] 修改为 10`)
  st.pointUpdate(1, 0, arr.length - 1, 3, 10)
  lines.push(`  修改后: arr[3] = ${st.getArr()[3]}`)
  lines.push('')
  lines.push('  修改后重新查询:')
  for (const [l, r] of queries) {
    const result = st.query(1, 0, arr.length - 1, l, r)
    lines.push(`  查询 [${l}, ${r}] = ${result}`)
  }
  lines.push('')

  // 4. 区间修改（懒标记）
  lines.push('【第四步】区间修改（懒标记）')
  lines.push('─────────────────────────')
  const st2 = new SegmentTree(arr)
  lines.push(`  原数组: [${arr.join(', ')}]`)
  lines.push(`  执行: 区间 [2, 5] 每个元素 +3`)
  st2.rangeUpdate(1, 0, arr.length - 1, 2, 5, 3)
  lines.push(`  修改后数组: [${st2.getArr().join(', ')}]`)
  lines.push('')
  lines.push('  修改后查询:')
  const rangeQueries: [number, number][] = [[0, 7], [2, 5], [0, 1], [4, 7]]
  for (const [l, r] of rangeQueries) {
    const result = st2.query(1, 0, arr.length - 1, l, r)
    lines.push(`  查询 [${l}, ${r}] = ${result}`)
  }
  lines.push('')

  // 5. 线段树 vs 前缀和对比
  lines.push('【第五步】线段树 vs 前缀和')
  lines.push('─────────────────────────')
  lines.push('  操作            前缀和        线段树')
  lines.push('  ─────────────────────────────────────')
  lines.push('  建表/建树       O(n)          O(n)')
  lines.push('  区间查询        O(1)          O(log n)')
  lines.push('  单点修改        O(n)          O(log n)')
  lines.push('  区间修改        O(n)          O(log n)')
  lines.push('')
  lines.push('  结论: 当需要频繁修改时，线段树更优')
  lines.push('        当数组不变时，前缀和更快')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
