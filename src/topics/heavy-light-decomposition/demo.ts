interface TreeNode {
  id: number
  children: number[]
}

function buildTree(): Map<number, TreeNode> {
  const tree = new Map<number, TreeNode>()
  //       1
  //      /|\
  //     2  3  4
  //    /|    |
  //   5  6   7
  //  /|
  // 8  9
  const edges: [number, number][] = [
    [1, 2], [1, 3], [1, 4],
    [2, 5], [2, 6],
    [4, 7],
    [5, 8], [5, 9],
  ]
  for (const [u, v] of edges) {
    if (!tree.has(u)) tree.set(u, { id: u, children: [] })
    if (!tree.has(v)) tree.set(v, { id: v, children: [] })
    tree.get(u)!.children.push(v)
  }
  return tree
}

export default function heavyLightDecompositionDemo(): string {
  const output: string[] = []
  const tree = buildTree()
  const n = 9

  output.push('=== 树链剖分演示 ===\n')

  // 第一次 DFS：计算子树大小、深度、重儿子
  const size = new Array<number>(n + 1).fill(0)
  const depth = new Array<number>(n + 1).fill(0)
  const parent = new Array<number>(n + 1).fill(0)
  const heavy = new Array<number>(n + 1).fill(-1)

  function dfs1(u: number, p: number): void {
    parent[u] = p
    depth[u] = depth[p] + 1
    size[u] = 1
    let maxSize = 0
    for (const v of tree.get(u)?.children ?? []) {
      if (v === p) continue
      dfs1(v, u)
      size[u] += size[v]
      if (size[v] > maxSize) {
        maxSize = size[v]
        heavy[u] = v
      }
    }
  }

  dfs1(1, 0)

  output.push('第一步：第一次 DFS - 计算子树大小和重儿子')
  output.push('节点 | 深度 | 子树大小 | 重儿子')
  output.push('-'.repeat(35))
  for (let i = 1; i <= n; i++) {
    output.push(`  ${i}    |  ${depth[i]}   |   ${size[i]}      | ${heavy[i] === -1 ? '无' : heavy[i]}`)
  }
  output.push('')

  // 第二次 DFS：分配 DFS 序
  const pos = new Array<number>(n + 1).fill(0)
  const head = new Array<number>(n + 1).fill(0)
  let currentPos = 0

  function dfs2(u: number, headOfChain: number): void {
    pos[u] = currentPos++
    head[u] = headOfChain
    if (heavy[u] !== -1) {
      dfs2(heavy[u], headOfChain)
    }
    for (const v of tree.get(u)?.children ?? []) {
      if (v !== parent[u] && v !== heavy[u]) {
        dfs2(v, v)
      }
    }
  }

  dfs2(1, 1)

  output.push('第二步：第二次 DFS - 分配 DFS 序和重链')
  output.push('节点 | DFS序 | 所在重链顶端')
  output.push('-'.repeat(30))
  for (let i = 1; i <= n; i++) {
    output.push(`  ${i}    |  ${pos[i]}    |  链顶=${head[i]}`)
  }
  output.push('')

  // 找出所有重链
  const chains = new Map<number, number[]>()
  for (let i = 1; i <= n; i++) {
    const h = head[i]
    if (!chains.has(h)) chains.set(h, [])
    chains.get(h)!.push(i)
  }

  output.push('第三步：重链分解结果')
  let chainIdx = 1
  for (const [h, nodes] of chains) {
    // 按 DFS 序排序
    nodes.sort((a, b) => pos[a] - pos[b])
    output.push(`  重链 ${chainIdx++} (链顶=${h}): ${nodes.join(' -> ')}`)
  }
  output.push('')

  // 路径查询演示
  output.push('第四步：路径查询演示')
  const u = 8, v = 7
  output.push(`  查询节点 ${u} 到节点 ${v} 的路径：`)

  let cu = u, cv = v
  const segments: string[] = []

  while (head[cu] !== head[cv]) {
    if (depth[head[cu]] < depth[head[cv]]) {
      ;[cu, cv] = [cv, cu]
    }
    segments.push(`[${head[cu]}..${cu}]`)
    cu = parent[head[cu]]
  }
  if (depth[cu] > depth[cv]) {
    ;[cu, cv] = [cv, cu]
  }
  segments.push(`[${cu}..${cv}]`)

  output.push(`  路径被拆分为 ${segments.length} 段重链区间：`)
  for (const seg of segments) {
    output.push(`    线段树查询区间 ${seg}`)
  }
  output.push(`  总共需要 ${segments.length} 次线段树查询`)
  output.push('')

  output.push('=== 演示结束 ===')
  return output.join('\n')
}
