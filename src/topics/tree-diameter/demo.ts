interface TreeNode {
  id: number
  children: number[]
}

function buildTree(): Map<number, TreeNode> {
  const tree = new Map<number, TreeNode>()
  const edges: [number, number][] = [
    [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [5, 7], [5, 8], [7, 9],
  ]
  for (const [u, v] of edges) {
    if (!tree.has(u)) tree.set(u, { id: u, children: [] })
    if (!tree.has(v)) tree.set(v, { id: v, children: [] })
    tree.get(u)!.children.push(v)
    tree.get(v)!.children.push(u) // 无向树
  }
  return tree
}

function bfs(start: number, tree: Map<number, TreeNode>): { farthest: number; dist: Map<number, number> } {
  const dist = new Map<number, number>()
  const queue: number[] = [start]
  dist.set(start, 0)
  let farthest = start

  while (queue.length > 0) {
    const node = queue.shift()!
    const d = dist.get(node)!
    if (d > dist.get(farthest)!) farthest = node
    for (const child of tree.get(node)!.children) {
      if (!dist.has(child)) {
        dist.set(child, d + 1)
        queue.push(child)
      }
    }
  }

  return { farthest, dist }
}

function getPath(start: number, end: number, tree: Map<number, TreeNode>): number[] {
  const parent = new Map<number, number>()
  const queue: number[] = [start]
  parent.set(start, -1)

  while (queue.length > 0) {
    const node = queue.shift()!
    if (node === end) break
    for (const child of tree.get(node)!.children) {
      if (!parent.has(child)) {
        parent.set(child, node)
        queue.push(child)
      }
    }
  }

  const path: number[] = []
  let cur: number = end
  while (cur !== -1) {
    path.push(cur)
    cur = parent.get(cur)!
  }
  path.reverse()
  return path
}

export default function treeDiameterDemo(): string {
  const output: string[] = []

  output.push('=== 树的直径演示 ===\n')

  const tree = buildTree()
  output.push('树的结构（邻接表）:')
  for (const [id, node] of tree) {
    const neighbors = node.children.filter(c => c !== id)
    output.push(`  节点 ${id} -> [${neighbors.join(', ')}]`)
  }
  output.push('')

  // 方法：两次 BFS
  output.push('--- 方法：两次 BFS/DFS 求直径 ---\n')

  output.push('第 1 次 BFS：从节点 1 出发，找到最远节点')
  const { farthest: u, dist: dist1 } = bfs(1, tree)
  output.push(`  最远节点: u = ${u}，距离 = ${dist1.get(u)}`)
  output.push(`  各节点距离: ${Array.from(dist1.entries()).map(([id, d]) => `${id}:${d}`).join(', ')}`)
  output.push('')

  output.push(`第 2 次 BFS：从节点 ${u} 出发，找到最远节点`)
  const { farthest: v, dist: dist2 } = bfs(u, tree)
  const diameter = dist2.get(v)!
  output.push(`  最远节点: v = ${v}，距离 = ${diameter}`)
  output.push(`  各节点距离: ${Array.from(dist2.entries()).map(([id, d]) => `${id}:${d}`).join(', ')}`)
  output.push('')

  output.push(`树的直径 = ${diameter}`)
  const path = getPath(u, v, tree)
  output.push(`直径路径: ${path.join(' -> ')}`)
  output.push('')

  // 树形 DP 方法
  output.push('--- 方法：树形 DP 求直径 ---\n')

  let dpDiameter = 0
  const d1 = new Map<number, number>() // 最长链
  const d2 = new Map<number, number>() // 次长链

  function dfs(node: number, parent: number): number {
    let maxD1 = 0, maxD2 = 0
    for (const child of tree.get(node)!.children) {
      if (child === parent) continue
      const childLen = dfs(child, node) + 1
      if (childLen > maxD1) {
        maxD2 = maxD1
        maxD1 = childLen
      } else if (childLen > maxD2) {
        maxD2 = childLen
      }
    }
    d1.set(node, maxD1)
    d2.set(node, maxD2)
    dpDiameter = Math.max(dpDiameter, maxD1 + maxD2)
    return maxD1
  }

  dfs(1, -1)

  output.push('各节点的最长链(d1)和次长链(d2):')
  for (const id of tree.keys()) {
    output.push(`  节点 ${id}: d1=${d1.get(id)}, d2=${d2.get(id)}, 经过该节点的最长路径=${d1.get(id)! + d2.get(id)!}`)
  }
  output.push(`\n树的直径 = ${dpDiameter}`)
  output.push('')

  // 性质验证
  output.push('--- 直径性质验证 ---\n')
  const center = path[Math.floor(path.length / 2)]
  output.push(`直径路径的中点（树的中心候选）: 节点 ${center}`)
  output.push(`直径路径长度（边数）: ${diameter}`)
  output.push(`直径路径节点数: ${path.length}`)
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
