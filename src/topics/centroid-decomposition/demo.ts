interface TreeNode {
  id: number
  children: number[]
}

function buildSampleTree(): Map<number, TreeNode> {
  const tree = new Map<number, TreeNode>()
  const edges: [number, number][] = [
    [1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [5, 8]
  ]

  for (const [u, v] of edges) {
    if (!tree.has(u)) tree.set(u, { id: u, children: [] })
    if (!tree.has(v)) tree.set(v, { id: v, children: [] })
    tree.get(u)!.children.push(v)
    tree.get(v)!.children.push(u)
  }

  return tree
}

function getSubtreeSizes(
  tree: Map<number, TreeNode>,
  node: number,
  parent: number,
  removed: Set<number>
): Map<number, number> {
  const sizes = new Map<number, number>()
  let size = 1

  for (const child of tree.get(node)!.children) {
    if (child !== parent && !removed.has(child)) {
      const childSizes = getSubtreeSizes(tree, child, node, removed)
      for (const [k, v] of childSizes) {
        sizes.set(k, v)
      }
      size += childSizes.get(child)!
    }
  }

  sizes.set(node, size)
  return sizes
}

function findCentroid(
  tree: Map<number, TreeNode>,
  node: number,
  parent: number,
  totalSize: number,
  removed: Set<number>
): number {
  for (const child of tree.get(node)!.children) {
    if (child !== parent && !removed.has(child)) {
      const childSizes = getSubtreeSizes(tree, child, node, removed)
      if (childSizes.get(child)! > Math.floor(totalSize / 2)) {
        return findCentroid(tree, child, node, totalSize, removed)
      }
    }
  }
  return node
}

export default function centroidDecompositionDemo(): string {
  const output: string[] = []

  output.push('=== 点分治演示 ===\n')

  const tree = buildSampleTree()
  const removed = new Set<number>()

  output.push('树结构 (邻接表):')
  for (const [id, node] of tree) {
    const neighbors = node.children.filter(c => !removed.has(c))
    output.push(`  节点 ${id}: [${neighbors.join(', ')}]`)
  }
  output.push('')

  // Round 1
  output.push('--- 第 1 层分治 ---')
  const sizes1 = getSubtreeSizes(tree, 1, -1, removed)
  const totalSize1 = sizes1.get(1)!
  output.push(`  当前子树大小: ${totalSize1}`)
  const centroid1 = findCentroid(tree, 1, -1, totalSize1, removed)
  output.push(`  找到重心: 节点 ${centroid1}`)

  const centroidSizes1 = getSubtreeSizes(tree, centroid1, -1, removed)
  output.push(`  重心 ${centroid1} 的各子树大小:`)
  for (const child of tree.get(centroid1)!.children) {
    if (!removed.has(child)) {
      output.push(`    子树 ${child}: ${centroidSizes1.get(child)} 个节点`)
    }
  }

  removed.add(centroid1)
  output.push(`  标记重心 ${centroid1} 为已处理\n`)

  // Round 2
  output.push('--- 第 2 层分治 ---')
  const remaining = [...tree.keys()].filter(id => !removed.has(id))
  output.push(`  剩余节点: [${remaining.join(', ')}]`)

  // Process each connected component
  const processed = new Set<number>()
  for (const start of remaining) {
    if (processed.has(start)) continue

    const component: number[] = []
    const queue = [start]
    const visited = new Set<number>()
    while (queue.length > 0) {
      const node = queue.shift()!
      if (visited.has(node) || removed.has(node)) continue
      visited.add(node)
      component.push(node)
      for (const child of tree.get(node)!.children) {
        if (!removed.has(child) && !visited.has(child)) {
          queue.push(child)
        }
      }
    }

    if (component.length === 0) continue

    output.push(`\n  连通分量: [${component.join(', ')}]`)

    const compRoot = component[0]
    const compSizes = getSubtreeSizes(tree, compRoot, -1, removed)
    const compTotal = compSizes.get(compRoot)!
    const compCentroid = findCentroid(tree, compRoot, -1, compTotal, removed)
    output.push(`  找到重心: 节点 ${compCentroid}`)

    const subSizes = getSubtreeSizes(tree, compCentroid, -1, removed)
    output.push(`  重心 ${compCentroid} 的各子树大小:`)
    for (const child of tree.get(compCentroid)!.children) {
      if (!removed.has(child)) {
        output.push(`    子树 ${child}: ${subSizes.get(child)} 个节点`)
      }
    }

    removed.add(compCentroid)
    output.push(`  标记重心 ${compCentroid} 为已处理`)

    for (const n of component) processed.add(n)
  }

  output.push('\n--- 分治完成 ---')
  output.push(`  处理顺序: ${[...removed].join(' -> ')}`)
  output.push(`  递归层数: 2`)
  output.push(`  总处理次数: ${removed.size}`)

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
