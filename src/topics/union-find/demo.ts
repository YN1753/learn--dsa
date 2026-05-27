// 并查集 (Union-Find) 演示

function makeSet(n: number): { parent: number[]; rank: number[] } {
  const parent = new Array(n)
  const rank = new Array(n).fill(0)
  for (let i = 0; i < n; i++) parent[i] = i
  return { parent, rank }
}

function find(parent: number[], x: number): number {
  if (parent[x] !== x) {
    parent[x] = find(parent, parent[x])
  }
  return parent[x]
}

function union(parent: number[], rank: number[], x: number, y: number): boolean {
  const rootX = find(parent, x)
  const rootY = find(parent, y)
  if (rootX === rootY) return false

  if (rank[rootX] < rank[rootY]) {
    parent[rootX] = rootY
  } else if (rank[rootX] > rank[rootY]) {
    parent[rootY] = rootX
  } else {
    parent[rootY] = rootX
    rank[rootX]++
  }
  return true
}

function isConnected(parent: number[], x: number, y: number): boolean {
  return find(parent, x) === find(parent, y)
}

function printState(parent: number[], rank: number[]): string[] {
  const lines: string[] = []
  lines.push(`  parent: [${parent.join(', ')}]`)
  lines.push(`  rank:   [${rank.join(', ')}]`)

  // 显示集合
  const sets = new Map<number, number[]>()
  for (let i = 0; i < parent.length; i++) {
    const root = find(parent, i)
    if (!sets.has(root)) sets.set(root, [])
    sets.get(root)!.push(i)
  }
  const setStrs: string[] = []
  for (const [, members] of sets) {
    setStrs.push(`{${members.join(', ')}}`)
  }
  lines.push(`  集合: ${setStrs.join('  ')}`)
  return lines
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('        并查集 (Union-Find) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 初始化
  lines.push('【第一步】初始化 8 个独立元素')
  lines.push('')
  const { parent, rank } = makeSet(8)
  lines.push('  每个元素自成一个集合:')
  lines.push(...printState(parent, rank))
  lines.push('')

  // 2. 执行 Union 操作
  lines.push('【第二步】执行 Union 操作（按秩合并）')
  lines.push('')

  const unionOps: [number, number][] = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [4, 6],
    [1, 5],
  ]

  for (const [a, b] of unionOps) {
    const merged = union(parent, rank, a, b)
    if (merged) {
      lines.push(`  Union(${a}, ${b}): 合并成功`)
    } else {
      lines.push(`  Union(${a}, ${b}): 已在同一集合，跳过`)
    }
    lines.push(...printState(parent, rank))
    lines.push('')
  }

  // 3. Find 操作与路径压缩
  lines.push('【第三步】Find 操作（展示路径压缩）')
  lines.push('')

  for (const x of [0, 1, 5, 7]) {
    const root = find(parent, x)
    lines.push(`  Find(${x}) → ${root}`)
  }
  lines.push('')
  lines.push('  路径压缩后的 parent 数组:')
  lines.push(`  parent: [${parent.join(', ')}]`)
  lines.push('')

  // 4. 连通性判断
  lines.push('【第四步】连通性判断')
  lines.push('')

  const testPairs: [number, number][] = [
    [0, 3], [0, 5], [1, 7], [0, 4],
  ]
  for (const [a, b] of testPairs) {
    const connected = isConnected(parent, a, b)
    lines.push(`  连通(${a}, ${b})? ${connected ? '是 ✓' : '否 ✗'}`)
  }
  lines.push('')

  // 5. Kruskal 最小生成树演示
  lines.push('【第五步】Kruskal 最小生成树算法')
  lines.push('')

  interface Edge { u: number; v: number; weight: number }
  const edges: Edge[] = [
    { u: 0, v: 1, weight: 4 },
    { u: 0, v: 2, weight: 3 },
    { u: 1, v: 2, weight: 1 },
    { u: 1, v: 3, weight: 2 },
    { u: 2, v: 3, weight: 5 },
    { u: 3, v: 4, weight: 7 },
    { u: 2, v: 4, weight: 6 },
  ]

  edges.sort((a, b) => a.weight - b.weight)
  lines.push('  按权重排序的边:')
  for (const e of edges) {
    lines.push(`    (${e.u}, ${e.v}) 权重=${e.weight}`)
  }
  lines.push('')

  const mstParent: number[] = new Array(5)
  const mstRank: number[] = new Array(5).fill(0)
  for (let i = 0; i < 5; i++) mstParent[i] = i

  const mstEdges: Edge[] = []
  lines.push('  Kruskal 算法步骤:')

  for (const edge of edges) {
    const rootU = find(mstParent, edge.u)
    const rootV = find(mstParent, edge.v)

    if (rootU !== rootV) {
      union(mstParent, mstRank, edge.u, edge.v)
      mstEdges.push(edge)
      lines.push(`  + 加入边 (${edge.u}, ${edge.v}), 权重=${edge.weight}  → 不构成环`)
    } else {
      lines.push(`  - 跳过边 (${edge.u}, ${edge.v}), 权重=${edge.weight}  → 会构成环`)
    }

    if (mstEdges.length === 4) break
  }

  lines.push('')
  lines.push('  最小生成树的边:')
  let totalWeight = 0
  for (const e of mstEdges) {
    lines.push(`    (${e.u}, ${e.v}) 权重=${e.weight}`)
    totalWeight += e.weight
  }
  lines.push(`  总权重: ${totalWeight}`)
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
