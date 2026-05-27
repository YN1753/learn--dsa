// 树状数组 (Fenwick Tree / Binary Indexed Tree) 演示

class FenwickTree {
  private tree: number[]
  private n: number

  constructor(size: number) {
    this.n = size
    this.tree = new Array(size + 1).fill(0)
  }

  // lowbit 运算：取出最低位的 1
  private lowbit(x: number): number {
    return x & (-x)
  }

  // 单点更新：在位置 i 加上 val
  update(i: number, val: number): void {
    while (i <= this.n) {
      this.tree[i] += val
      i += this.lowbit(i)
    }
  }

  // 前缀和查询：求 [1, i] 的和
  query(i: number): number {
    let sum = 0
    while (i > 0) {
      sum += this.tree[i]
      i -= this.lowbit(i)
    }
    return sum
  }

  // 区间和查询：求 [l, r] 的和
  rangeQuery(l: number, r: number): number {
    return this.query(r) - this.query(l - 1)
  }

  // 获取树数组内容
  getTree(): number[] {
    return [...this.tree]
  }

  // 从数组构建树状数组（O(n) 方法）
  static fromArray(arr: number[]): FenwickTree {
    const n = arr.length
    const ft = new FenwickTree(n)
    // 先复制到 tree 数组
    for (let i = 0; i < n; i++) {
      ft.tree[i + 1] = arr[i]
    }
    // O(n) 建树：对每个节点，将其值加到其直接父节点
    for (let i = 1; i <= n; i++) {
      const parent = i + ft.lowbit(i)
      if (parent <= n) {
        ft.tree[parent] += ft.tree[i]
      }
    }
    return ft
  }
}

// 计算逆序对数量
function countInversions(arr: number[]): { count: number; pairs: [number, number][] } {
  const n = arr.length
  // 离散化
  const sorted = [...arr].sort((a, b) => a - b)
  const rank = new Map<number, number>()
  let r = 0
  for (const v of sorted) {
    if (!rank.has(v)) rank.set(v, ++r)
  }

  const ft = new FenwickTree(r)
  let count = 0
  const pairs: [number, number][] = []

  // 从右往左遍历，查询有多少个比当前元素小的元素已在树状数组中
  for (let i = n - 1; i >= 0; i--) {
    const rk = rank.get(arr[i])!
    const smaller = ft.query(rk - 1)
    // 比 arr[i] 大且在它左边的元素数 = 已处理的元素数 - 比 arr[i] 小的元素数
    const processed = n - 1 - i
    const largerOnLeft = processed - smaller
    count += largerOnLeft

    // 记录逆序对
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[i]) {
        pairs.push([arr[i], arr[j]])
      }
    }

    ft.update(rk, 1)
  }

  return { count, pairs }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('   树状数组 (Fenwick Tree) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 低级运算演示
  lines.push('【第一步】lowbit 运算')
  lines.push('')
  lines.push('  lowbit(x) = x & (-x)，取出最低位的 1')
  lines.push('')
  const lowbitExamples = [1, 2, 3, 4, 5, 6, 7, 8, 12, 14, 16, 20]
  for (const x of lowbitExamples) {
    const lb = x & (-x)
    const bin = x.toString(2).padStart(6, '0')
    const lbBin = lb.toString(2).padStart(6, '0')
    lines.push(`  lowbit(${x.toString().padStart(2)}) = ${bin} & ${(-x >>> 0).toString(2).slice(-6)} = ${lbBin} = ${lb}`)
  }
  lines.push('')

  // 2. 构建树状数组
  lines.push('【第二步】构建树状数组')
  lines.push('')
  const arr = [3, 1, 4, 1, 5, 9, 2, 6]
  lines.push(`  原始数组: [${arr.join(', ')}]`)
  lines.push('')

  const ft = FenwickTree.fromArray(arr)
  const tree = ft.getTree()
  lines.push('  树状数组 tree[]:')
  lines.push('  索引:  ' + Array.from({ length: arr.length }, (_, i) => (i + 1).toString().padStart(4)).join(''))
  lines.push('  值:    ' + tree.slice(1).map(v => v.toString().padStart(4)).join(''))
  lines.push('')

  // 3. 各节点负责的区间
  lines.push('【第三步】每个 tree[i] 负责的区间')
  lines.push('')
  for (let i = 1; i <= arr.length; i++) {
    const lb = i & (-i)
    const start = i - lb + 1
    lines.push(`  tree[${i}] = ${tree[i]}  负责区间 [${start}, ${i}]  (lowbit(${i}) = ${lb})`)
  }
  lines.push('')

  // 4. 单点更新演示
  lines.push('【第四步】单点更新 update(3, 10)')
  lines.push('  在位置 3 加上 10')
  lines.push('')
  lines.push('  更新路径 (i += lowbit(i)):')
  let i = 3
  const path: number[] = []
  while (i <= arr.length) {
    path.push(i)
    const lb = i & (-i)
    lines.push(`    tree[${i}] += 10  (lowbit(${i}) = ${lb}, 下一步 i = ${i} + ${lb} = ${i + lb})`)
    i += lb
  }
  lines.push('')

  ft.update(3, 10)
  const treeAfter = ft.getTree()
  lines.push('  更新后的树状数组:')
  lines.push('  索引:  ' + Array.from({ length: arr.length }, (_, i) => (i + 1).toString().padStart(4)).join(''))
  lines.push('  值:    ' + treeAfter.slice(1).map(v => v.toString().padStart(4)).join(''))
  lines.push('')

  // 5. 前缀和查询演示
  lines.push('【第五步】前缀和查询 query(5)')
  lines.push('  查询 [1, 5] 的和')
  lines.push('')
  lines.push('  查询路径 (i -= lowbit(i)):')
  i = 5
  let sum = 0
  while (i > 0) {
    const lb = i & (-i)
    sum += treeAfter[i]
    lines.push(`    sum += tree[${i}] = ${treeAfter[i]}  →  sum = ${sum}  (lowbit(${i}) = ${lb}, 下一步 i = ${i} - ${lb} = ${i - lb})`)
    i -= lb
  }
  lines.push(`  结果: [1, 5] 的前缀和 = ${sum}`)
  lines.push(`  验证: [${arr.slice(0, 5).join(' + ')}] + 10(位置3的更新) = ${arr.slice(0, 5).reduce((a, b) => a + b, 0) + 10}`)
  lines.push('')

  // 6. 区间和查询
  lines.push('【第六步】区间和查询 rangeQuery(3, 6)')
  lines.push('')
  const rangeSum = ft.rangeQuery(3, 6)
  const q6 = ft.query(6)
  const q2 = ft.query(2)
  lines.push(`  rangeQuery(3, 6) = query(6) - query(2)`)
  lines.push(`                   = ${q6} - ${q2}`)
  lines.push(`                   = ${rangeSum}`)
  lines.push('')

  // 7. 逆序对计数
  lines.push('【第七步】逆序对计数')
  lines.push('')
  const invArr = [5, 2, 6, 1, 3]
  lines.push(`  数组: [${invArr.join(', ')}]`)
  lines.push('')
  const result = countInversions(invArr)
  lines.push(`  逆序对数量: ${result.count}`)
  lines.push('  逆序对列表:')
  for (const [a, b] of result.pairs) {
    lines.push(`    (${a}, ${b})`)
  }
  lines.push('')

  // 8. 复杂度总结
  lines.push('【第八步】复杂度总结')
  lines.push('')
  lines.push('  ┌─────────────────┬──────────────┬──────────────┐')
  lines.push('  │     操作        │  时间复杂度  │  空间复杂度  │')
  lines.push('  ├─────────────────┼──────────────┼──────────────┤')
  lines.push('  │  单点更新       │   O(log n)   │    O(n)      │')
  lines.push('  │  前缀和查询     │   O(log n)   │              │')
  lines.push('  │  区间和查询     │   O(log n)   │              │')
  lines.push('  │  构建 (朴素)    │  O(n log n)  │              │')
  lines.push('  │  构建 (优化)    │    O(n)      │              │')
  lines.push('  └─────────────────┴──────────────┴──────────────┘')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
