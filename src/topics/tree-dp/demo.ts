function buildAdjList(n: number, edges: [number, number][]): number[][] {
  const adj: number[][] = Array.from({ length: n + 1 }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }
  return adj
}

export default function treeDPDemo(): string {
  const output: string[] = []

  output.push('=== 树形DP演示：最大独立集 ===\n')

  const n = 8
  const edges: [number, number][] = [
    [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [5, 7], [5, 8],
  ]

  output.push('树的结构:')
  output.push('         1')
  output.push('        / \\')
  output.push('       2   3')
  output.push('      / \\   \\')
  output.push('     4   5   6')
  output.push('        / \\')
  output.push('       7   8')
  output.push('')

  // 每个节点的权值（这里设为节点编号本身，方便理解）
  const weight = [0, 1, 2, 3, 4, 5, 6, 7, 8]

  output.push('节点权值:')
  for (let i = 1; i <= n; i++) {
    output.push(`  节点 ${i}: 权值 = ${weight[i]}`)
  }
  output.push('')

  const adj = buildAdjList(n, edges)

  // dp[u][0] = 不选u时，以u为根的子树最大独立集权值和
  // dp[u][1] = 选u时，以u为根的子树最大独立集权值和
  const dp: number[][] = Array.from({ length: n + 1 }, () => [0, 0])
  function dfs(node: number, parent: number): void {
    // 初始化：选当前节点
    dp[node][1] = weight[node]

    for (const child of adj[node]) {
      if (child === parent) continue
      dfs(child, node)

      // 不选node：子节点可选可不选，取较大值
      dp[node][0] += Math.max(dp[child][0], dp[child][1])
      // 选node：子节点不能选
      dp[node][1] += dp[child][0]
    }
  }

  dfs(1, -1)

  output.push('--- DP计算过程（后序遍历） ---\n')

  // 重新计算并记录过程
  const dpProcess: number[][] = Array.from({ length: n + 1 }, () => [0, 0])
  const order: number[] = []

  function dfsRecord(node: number, parent: number): void {
    dpProcess[node][1] = weight[node]
    for (const child of adj[node]) {
      if (child === parent) continue
      dfsRecord(child, node)
      dpProcess[node][0] += Math.max(dpProcess[child][0], dpProcess[child][1])
      dpProcess[node][1] += dpProcess[child][0]
    }
    order.push(node)
  }

  dfsRecord(1, -1)

  // 展示计算顺序
  output.push(`DFS后序遍历顺序: ${order.join(' -> ')}`)
  output.push('')

  // 逐节点展示
  output.push('各节点DP值:')
  for (let i = 1; i <= n; i++) {
    const isLeaf = adj[i].filter(c => c !== (i === 1 ? -1 : findParent(i))).length === 0
    output.push(`  节点 ${i}: dp[${i}][0] = ${dp[i][0]}, dp[${i}][1] = ${dp[i][1]}${isLeaf ? ' (叶子)' : ''}`)
  }
  output.push('')

  output.push(`最大独立集权值和 = max(dp[1][0], dp[1][1]) = max(${dp[1][0]}, ${dp[1][1]}) = ${Math.max(dp[1][0], dp[1][1])}`)
  output.push('')

  // 回溯找方案
  output.push('--- 回溯最优方案 ---\n')
  const selected: boolean[] = new Array(n + 1).fill(false)

  function traceSimple(node: number, parent: number, selectNode: boolean): void {
    selected[node] = selectNode
    for (const child of adj[node]) {
      if (child === parent) continue
      if (selectNode) {
        // 选了node，子节点不能选
        traceSimple(child, node, false)
      } else {
        // 没选node，子节点选收益更大的
        traceSimple(child, node, dp[child][1] > dp[child][0])
      }
    }
  }

  if (dp[1][1] > dp[1][0]) {
    traceSimple(1, -1, true)
  } else {
    traceSimple(1, -1, false)
  }

  const selectedNodes = []
  for (let i = 1; i <= n; i++) {
    if (selected[i]) selectedNodes.push(i)
  }

  output.push('选择的节点:')
  for (let i = 1; i <= n; i++) {
    output.push(`  节点 ${i}: ${selected[i] ? '✓ 选中' : '✗ 不选'} (权值 ${weight[i]})`)
  }
  output.push('')
  output.push(`独立集 = {${selectedNodes.join(', ')}}`)
  output.push(`总权值 = ${selectedNodes.reduce((s, id) => s + weight[id], 0)}`)
  output.push('')

  // 验证：选中的节点之间没有边相连
  output.push('--- 验证独立集合法性 ---\n')
  let valid = true
  for (const [u, v] of edges) {
    if (selected[u] && selected[v]) {
      output.push(`错误: 节点 ${u} 和 ${v} 相邻但都被选中！`)
      valid = false
    }
  }
  if (valid) {
    output.push('验证通过：选中的节点之间没有边相连。')
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')

  function findParent(node: number): number {
    // 简单BFS找父节点
    const visited = new Set<number>()
    const queue: [number, number][] = [[1, -1]]
    visited.add(1)
    while (queue.length > 0) {
      const [cur, par] = queue.shift()!
      if (cur === node) return par
      for (const child of adj[cur]) {
        if (!visited.has(child)) {
          visited.add(child)
          queue.push([child, cur])
        }
      }
    }
    return -1
  }
}
