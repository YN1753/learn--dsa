interface TreeNode {
  id: number
  children: number[]
}

function buildTree(): Map<number, TreeNode> {
  const tree = new Map<number, TreeNode>()
  //           1
  //         / | \
  //        2  3  4
  //       /|     |
  //      5  6    7
  //     /|
  //    8  9
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

export default function longChainDecompositionDemo(): string {
  const output: string[] = []
  const tree = buildTree()
  const n = 9

  output.push('=== 长链剖分演示 ===\n')

  // 计算父子关系
  const parent = new Array<number>(n + 1).fill(0)
  function buildParent(u: number, p: number): void {
    parent[u] = p
    for (const v of tree.get(u)?.children ?? []) {
      buildParent(v, u)
    }
  }
  buildParent(1, 0)

  // 第一步：计算子树深度和长儿子
  const depth = new Array<number>(n + 1).fill(0)
  const heavy = new Array<number>(n + 1).fill(-1)

  function dfs1(u: number): void {
    let maxDepth = 0
    for (const v of tree.get(u)?.children ?? []) {
      dfs1(v)
      if (depth[v] + 1 > maxDepth) {
        maxDepth = depth[v] + 1
        heavy[u] = v
      }
    }
    depth[u] = maxDepth
  }
  dfs1(1)

  output.push('第一步：计算子树深度和长儿子')
  output.push('节点 | 子树深度 | 长儿子')
  output.push('-'.repeat(30))
  for (let i = 1; i <= n; i++) {
    output.push(`  ${i}    |   ${depth[i]}      | ${heavy[i] === -1 ? '无（叶子）' : heavy[i]}`)
  }
  output.push('')

  // 第二步：长链分解
  const top = new Array<number>(n + 1).fill(0)
  const chainNodes = new Map<number, number[]>()

  function dfs2(u: number, topOfChain: number): void {
    top[u] = topOfChain
    if (!chainNodes.has(topOfChain)) chainNodes.set(topOfChain, [])
    chainNodes.get(topOfChain)!.push(u)

    if (heavy[u] !== -1) {
      dfs2(heavy[u], topOfChain)  // 长儿子继承同一条链
    }
    for (const v of tree.get(u)?.children ?? []) {
      if (v !== heavy[u]) {
        dfs2(v, v)  // 非长儿子开新链
      }
    }
  }
  dfs2(1, 1)

  output.push('第二步：长链分解结果')
  let chainIdx = 1
  for (const [topNode, nodes] of chainNodes) {
    output.push(`  长链 ${chainIdx++} (链顶=${topNode}): ${nodes.join(' -> ')}`)
    output.push(`    链长: ${nodes.length}`)
  }
  output.push('')

  // 第三步：继承指针演示
  output.push('第三步：继承指针 DP 演示')
  output.push('假设维护 f[u][d] = 以 u 为根的子树中距离 u 为 d 的节点数')
  output.push('')

  // 全局数组模拟
  const globalF = new Array<number>(2 * n).fill(0)
  const offset = new Array<number>(n + 1).fill(0)
  const chainStart = new Map<number, number>()
  let nextOffset = 0

  function assignOffsets(u: number, topNode: number): void {
    if (u === topNode) {
      chainStart.set(topNode, nextOffset)
      offset[u] = nextOffset
      nextOffset += (depth[topNode] + 1)
    }

    if (heavy[u] !== -1) {
      // 长儿子继承父亲的空间，偏移 +1
      offset[heavy[u]] = offset[u] + 1
      assignOffsets(heavy[u], topNode)
    }

    for (const v of tree.get(u)?.children ?? []) {
      if (v !== heavy[u]) {
        // 非长儿子需要新分配空间
        assignOffsets(v, v)
      }
    }
  }
  assignOffsets(1, 1)

  output.push('继承指针的内存分配:')
  output.push('节点 | 偏移量 | 说明')
  output.push('-'.repeat(45))
  for (let i = 1; i <= n; i++) {
    const isHeavy = heavy[parent[i]] === i
    const note = parent[i] === 0 ? '根节点，链顶'
      : isHeavy ? `继承父亲 ${parent[i]} 的空间 (offset[${parent[i]}]+1)`
      : `新分配空间（链顶=${i}）`
    output.push(`  ${i}    |  ${offset[i]}     | ${note}`)
  }
  output.push('')

  // 模拟 DP 填充
  output.push('DP 填充过程 (统计距离为 d 的节点数):')
  for (let i = 1; i <= n; i++) {
    globalF[offset[i]] = 1  // 每个节点自身距离为 0，计数 +1
  }

  // 自底向上合并
  function mergeDP(u: number): void {
    for (const v of tree.get(u)?.children ?? []) {
      mergeDP(v)
      if (v !== heavy[u]) {
        // 将非长儿子的贡献合并到父亲
        for (let d = 0; d <= depth[v]; d++) {
          globalF[offset[u] + d + 1] += globalF[offset[v] + d]
        }
      }
      // 长儿子的贡献已经在父亲的空间中了（继承指针）
    }
  }
  mergeDP(1)

  output.push(`  全局数组 f 的大小: ${nextOffset} (远小于 n^2 = ${n * n})`)
  output.push('')

  // 第四步：展示每个节点的深度分布
  output.push('第四步：每个节点的结果（子树中距离为 d 的节点数）')
  for (let i = 1; i <= n; i++) {
    const dist: string[] = []
    for (let d = 0; d <= depth[i]; d++) {
      const count = globalF[offset[i] + d]
      if (count > 0) dist.push(`d=${d}:${count}`)
    }
    output.push(`  节点 ${i}: ${dist.join(', ')}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')
  return output.join('\n')
}
