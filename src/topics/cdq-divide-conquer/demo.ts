interface Point3D {
  a: number
  b: number
  c: number
  id: number
}

class FenwickTree {
  private tree: number[]
  private size: number

  constructor(size: number) {
    this.size = size
    this.tree = new Array(size + 1).fill(0)
  }

  update(index: number, delta: number): void {
    for (let i = index; i <= this.size; i += i & (-i)) {
      this.tree[i] += delta
    }
  }

  query(index: number): number {
    let sum = 0
    for (let i = index; i > 0; i -= i & (-i)) {
      sum += this.tree[i]
    }
    return sum
  }

  clear(): void {
    this.tree.fill(0)
  }
}

function cdqSolve(points: Point3D[]): number[] {
  const n = points.length
  const result = new Array(n).fill(0)

  // 按第一维排序
  const sorted = [...points].sort((x, y) => x.a - y.a || x.b - y.b || x.c - y.c)

  // 离散化第三维
  const cValues = [...new Set(sorted.map(p => p.c))].sort((a, b) => a - b)
  const cMap = new Map<number, number>()
  cValues.forEach((v, i) => cMap.set(v, i + 1))

  const tree = new FenwickTree(cValues.length)

  function cdq(left: number, right: number): void {
    if (left === right) return

    const mid = Math.floor((left + right) / 2)
    cdq(left, mid)
    cdq(mid + 1, right)

    // 计算左半对右半的贡献
    let j = left
    for (let i = mid + 1; i <= right; i++) {
      while (j <= mid && sorted[j].b <= sorted[i].b) {
        tree.update(cMap.get(sorted[j].c)!, 1)
        j++
      }
      result[sorted[i].id] += tree.query(cMap.get(sorted[i].c)!)
    }

    // 清空树状数组
    for (let k = left; k < j; k++) {
      tree.update(cMap.get(sorted[k].c)!, -1)
    }

    // 归并排序（按第二维b）
    const temp: Point3D[] = []
    let p1 = left
    let p2 = mid + 1
    while (p1 <= mid && p2 <= right) {
      if (sorted[p1].b <= sorted[p2].b) {
        temp.push(sorted[p1++])
      } else {
        temp.push(sorted[p2++])
      }
    }
    while (p1 <= mid) temp.push(sorted[p1++])
    while (p2 <= right) temp.push(sorted[p2++])
    for (let i = 0; i < temp.length; i++) {
      sorted[left + i] = temp[i]
    }
  }

  cdq(0, n - 1)
  return result
}

export default function cdqDemo(): string {
  const output: string[] = []

  output.push('=== CDQ分治演示 ===')
  output.push('')
  output.push('问题：给定n个三维点(a,b,c)，对每个点统计')
  output.push('满足 a_i<=a_j, b_i<=b_j, c_i<=c_j 的点j的个数')
  output.push('')

  const points: Point3D[] = [
    { a: 1, b: 3, c: 2, id: 0 },
    { a: 2, b: 1, c: 3, id: 1 },
    { a: 3, b: 2, c: 1, id: 2 },
    { a: 2, b: 3, c: 3, id: 3 },
    { a: 3, b: 3, c: 2, id: 4 },
  ]

  output.push('输入点集：')
  for (const p of points) {
    output.push(`  点${p.id}: (${p.a}, ${p.b}, ${p.c})`)
  }
  output.push('')

  output.push('步骤1：按第一维a排序')
  const sorted1 = [...points].sort((x, y) => x.a - y.a || x.b - y.b || x.c - y.c)
  for (const p of sorted1) {
    output.push(`  点${p.id}: (${p.a}, ${p.b}, ${p.c})`)
  }
  output.push('')

  output.push('步骤2：CDQ分治')
  output.push('  分治过程：')
  output.push('  [1,3,2] [2,1,3] | [2,3,3] [3,2,1] [3,3,2]')
  output.push('  左半部分第一维 <= 右半部分第一维')
  output.push('')

  output.push('  计算左半对右半的贡献：')
  output.push('  归并第二维b，同时用树状数组维护第三维c')
  output.push('')

  const result = cdqSolve([...points])

  output.push('步骤3：结果')
  output.push('  对每个点，统计有多少个点「支配」它：')
  for (let i = 0; i < points.length; i++) {
    output.push(`  点${i} (${points[i].a},${points[i].b},${points[i].c}): ${result[i]}个支配点`)
  }
  output.push('')

  output.push('验证（暴力枚举）：')
  for (let i = 0; i < points.length; i++) {
    let count = 0
    for (let j = 0; j < points.length; j++) {
      if (i !== j &&
          points[j].a <= points[i].a &&
          points[j].b <= points[i].b &&
          points[j].c <= points[i].c) {
        count++
      }
    }
    const match = count === result[i] ? '正确' : '错误'
    output.push(`  点${i}: CDQ=${result[i]}, 暴力=${count} [${match}]`)
  }
  output.push('')

  output.push('时间复杂度分析：')
  output.push('  暴力枚举: O(n^2) = O(25)')
  output.push('  CDQ分治: O(n log^2 n) = O(5 * 4) ≈ O(20)')
  output.push('  n越大，CDQ分治的优势越明显')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
