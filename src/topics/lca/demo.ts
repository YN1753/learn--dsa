interface TreeNode {
  id: number
  depth: number
  parent: number | null
}

function buildSampleTree(): TreeNode[] {
  //        1
  //       / | \
  //      2  3  4
  //     / \    |
  //    5   6   7
  //   / \
  //  8   9
  const nodes: TreeNode[] = [
    { id: 1, depth: 0, parent: null },
    { id: 2, depth: 1, parent: 1 },
    { id: 3, depth: 1, parent: 1 },
    { id: 4, depth: 1, parent: 1 },
    { id: 5, depth: 2, parent: 2 },
    { id: 6, depth: 2, parent: 2 },
    { id: 7, depth: 2, parent: 4 },
    { id: 8, depth: 3, parent: 5 },
    { id: 9, depth: 3, parent: 5 },
  ]
  return nodes
}

function findLCA_bruteForce(nodes: TreeNode[], u: number, v: number): number {
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  // Collect ancestors of u
  const ancestorsU = new Set<number>()
  let cur: number | null = u
  while (cur !== null) {
    ancestorsU.add(cur)
    cur = nodeMap.get(cur)!.parent
  }

  // Walk up from v until hitting an ancestor of u
  cur = v
  while (cur !== null) {
    if (ancestorsU.has(cur)) return cur
    cur = nodeMap.get(cur)!.parent
  }
  return -1
}

export default function lcaDemo(): string {
  const output: string[] = []
  const nodes = buildSampleTree()

  output.push('=== 最近公共祖先 (LCA) 演示 ===')
  output.push('')
  output.push('树结构:')
  output.push('        1')
  output.push('       / | \\')
  output.push('      2  3  4')
  output.push('     / \\    |')
  output.push('    5   6   7')
  output.push('   / \\')
  output.push('  8   9')
  output.push('')

  const queries: [number, number][] = [
    [8, 9],
    [8, 6],
    [5, 7],
    [3, 9],
    [2, 4],
    [8, 3],
    [6, 7],
  ]

  output.push('--- 暴力上跳法查询 ---')
  output.push('')
  for (const [u, v] of queries) {
    const lca = findLCA_bruteForce(nodes, u, v)
    output.push(`LCA(${u}, ${v}) = ${lca}`)
  }

  output.push('')
  output.push('--- 倍增法原理说明 ---')
  output.push('')
  output.push('预处理: f[v][k] 表示节点 v 的第 2^k 级祖先')
  output.push('  f[v][0] = parent(v)')
  output.push('  f[v][k] = f[ f[v][k-1] ][k-1]  (递推)')
  output.push('')
  output.push('查询 LCA(u, v):')
  output.push('  1) 将较深的节点上跳到与另一节点同深')
  output.push('  2) 从大到小尝试跳 2^k 步，若祖先不同则跳')
  output.push('  3) 最后 u 和 v 的父节点即为 LCA')
  output.push('')

  // Demonstrate step-by-step binary lifting for LCA(8, 7)
  output.push('--- 倍增法示例: LCA(8, 7) ---')
  output.push('')
  output.push('节点 8 路径到根: 8 -> 5 -> 2 -> 1')
  output.push('节点 7 路径到根: 7 -> 4 -> 1')
  output.push('')
  output.push('Step 1: 对齐深度')
  output.push('  depth(8) = 3, depth(7) = 2, 差值 = 1')
  output.push('  将节点 8 上跳 2^0 = 1 步到节点 5')
  output.push('  现在 depth(5) = 2, depth(7) = 2')
  output.push('')
  output.push('Step 2: 从大到小尝试跳')
  output.push('  k=1: f[5][1]=2, f[7][1]=4, 祖先不同 → 不跳')
  output.push('  k=0: f[5][0]=2, f[7][0]=4, 祖父不同 → 跳')
  output.push('  跳后: u=2, v=4')
  output.push('')
  output.push('Step 3: parent(2)=1, parent(4)=1, 相同 → LCA = 1')
  output.push('')
  output.push('结论: LCA(8, 7) = 1')
  output.push('')

  output.push('--- 复杂度分析 ---')
  output.push('')
  output.push('方法            预处理      单次查询    总查询 q 次')
  output.push('暴力上跳        O(1)        O(n)        O(nq)')
  output.push('倍增法          O(n log n)  O(log n)    O(n log n + q log n)')
  output.push('Tarjan 离线     O(1)        O(α(n))     O(n + q)')
  output.push('树链剖分        O(n)        O(log n)    O(n + q log n)')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
