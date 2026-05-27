// 拟阵贪心算法演示 - 以图拟阵（最小生成树 / Kruskal 算法）为例

interface Edge {
  u: number
  v: number
  weight: number
  label: string
}

class UnionFind {
  private parent: number[]
  private rank: number[]

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.rank = new Array(n).fill(0)
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x])
    }
    return this.parent[x]
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x)
    const ry = this.find(y)
    if (rx === ry) return false
    if (this.rank[rx] < this.rank[ry]) {
      this.parent[rx] = ry
    } else if (this.rank[rx] > this.rank[ry]) {
      this.parent[ry] = rx
    } else {
      this.parent[ry] = rx
      this.rank[rx]++
    }
    return true
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y)
  }
}

export default function matroidDemo(): string {
  const output: string[] = []

  output.push('=== 拟阵理论演示 ===')
  output.push('--- 图拟阵上的贪心算法（Kruskal 最小生成树）---\n')

  // 定义一个带权无向图
  //     0
  //    / \
  //   4   2
  //  /     \
  // 1---3---2
  //  \  |  /
  //   7 5 6
  //    \|/
  //     3

  const edges: Edge[] = [
    { u: 0, v: 1, weight: 4, label: '(0,1)' },
    { u: 0, v: 2, weight: 2, label: '(0,2)' },
    { u: 1, v: 2, weight: 3, label: '(1,2)' },
    { u: 1, v: 3, weight: 7, label: '(1,3)' },
    { u: 2, v: 3, weight: 5, label: '(2,3)' },
    { u: 2, v: 3, weight: 6, label: '(2,3)备用' },
  ]
  const numVertices = 4

  output.push('图的边集 E（拟阵的基础集）:')
  for (const e of edges) {
    output.push(`  ${e.label}: 权重 = ${e.weight}`)
  }
  output.push('')

  // 步骤 1：按权重排序
  output.push('【步骤 1】按权重从小到大排序边:')
  const sorted = [...edges].sort((a, b) => a.weight - b.weight)
  for (const e of sorted) {
    output.push(`  ${e.label}: 权重 = ${e.weight}`)
  }
  output.push('')

  // 步骤 2：贪心选择
  output.push('【步骤 2】贪心选择过程:')
  output.push('  独立性判据：加入边后不形成环（并查集检测）\n')

  const uf = new UnionFind(numVertices)
  const mst: Edge[] = []
  let totalWeight = 0

  for (const edge of sorted) {
    const isIndependent = !uf.connected(edge.u, edge.v)

    if (isIndependent) {
      uf.union(edge.u, edge.v)
      mst.push(edge)
      totalWeight += edge.weight
      output.push(`  [选择] 边 ${eLabel(edge)} (权重 ${edge.weight}) -> 不形成环，加入独立集`)
      output.push(`         当前已选边数: ${mst.length}, 当前总权重: ${totalWeight}`)
    } else {
      output.push(`  [拒绝] 边 ${eLabel(edge)} (权重 ${edge.weight}) -> 会形成环，违反独立性`)
    }

    if (mst.length === numVertices - 1) {
      output.push(`\n  已选够 n-1 = ${numVertices - 1} 条边，达到基的大小，算法结束`)
      break
    }
  }

  output.push('')
  output.push('【结果】最小生成树（图拟阵的最小权基）:')
  for (const e of mst) {
    output.push(`  边 ${eLabel(e)}, 权重 = ${e.weight}`)
  }
  output.push(`  总权重 = ${totalWeight}`)

  output.push('')
  output.push('【拟阵理论解读】')
  output.push('  - 基础集 E = 所有边')
  output.push('  - 独立集 I = 不含环的边子集（森林）')
  output.push('  - 基 = 生成树（n-1 条边的无环连通子图）')
  output.push('  - 独立性公理验证:')
  output.push('    (1) 空集是独立集 ✓')
  output.push('    (2) 无环边集的子集仍无环（遗传性）✓')
  output.push('    (3) 两个不同大小的森林之间可以交换边（交换性）✓')
  output.push('  - 由拟阵理论，贪心算法保证得到最优解 ✓')

  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}

function eLabel(e: Edge): string {
  return `(${e.u},${e.v})`
}
