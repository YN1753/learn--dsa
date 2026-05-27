interface PSTNode {
  left: PSTNode | null
  right: PSTNode | null
  count: number
  id: number
}

let nodeIdCounter = 0

function createNode(left: PSTNode | null, right: PSTNode | null, count: number): PSTNode {
  return { left, right, count, id: nodeIdCounter++ }
}

function buildTree(lo: number, hi: number): PSTNode {
  if (lo === hi) {
    return createNode(null, null, 0)
  }
  const mid = Math.floor((lo + hi) / 2)
  return createNode(buildTree(lo, mid), buildTree(mid + 1, hi), 0)
}

function update(prev: PSTNode, lo: number, hi: number, pos: number): PSTNode {
  if (lo === hi) {
    return createNode(null, null, prev.count + 1)
  }
  const mid = Math.floor((lo + hi) / 2)
  if (pos <= mid) {
    return createNode(update(prev.left!, lo, mid, pos), prev.right, 0)
  } else {
    return createNode(prev.left, update(prev.right!, mid + 1, hi, pos), 0)
  }
}

function countNodes(node: PSTNode | null): number {
  if (!node) return 0
  return 1 + countNodes(node.left) + countNodes(node.right)
}

function printTree(node: PSTNode | null, prefix: string, isLeft: boolean, lines: string[]): void {
  if (!node) return
  lines.push(`${prefix}${isLeft ? '├── ' : '└── '}[id:${node.id}, cnt:${node.count}]`)
  if (node.left || node.right) {
    printTree(node.left, prefix + (isLeft ? '│   ' : '    '), true, lines)
    printTree(node.right, prefix + (isLeft ? '│   ' : '    '), false, lines)
  }
}

export default function persistentSegmentTreeDemo(): string {
  nodeIdCounter = 0
  const output: string[] = []

  output.push('=== 可持久化线段树（主席树）演示 ===\n')

  // 建立初始版本
  output.push('1. 建立初始空树（版本 0）')
  const lo = 1
  const hi = 8
  const root0 = buildTree(lo, hi)
  output.push(`   值域范围: [${lo}, ${hi}]`)
  output.push(`   节点数量: ${countNodes(root0)}\n`)

  // 版本 1: 插入元素 3
  output.push('2. 版本 1: 在位置 3 插入元素')
  const root1 = update(root0, lo, hi, 3)
  output.push(`   新建节点数: ${countNodes(root1) - countNodes(root0)}`)
  output.push(`   总节点数: ${countNodes(root1)}\n`)

  // 版本 2: 插入元素 5
  output.push('3. 版本 2: 在位置 5 插入元素')
  const root2 = update(root1, lo, hi, 5)
  output.push(`   新建节点数: ${countNodes(root2) - countNodes(root1)}`)
  output.push(`   总节点数: ${countNodes(root2)}\n`)

  // 版本 3: 插入元素 3（再次）
  output.push('4. 版本 3: 在位置 3 再次插入元素（计数增加）')
  const root3 = update(root2, lo, hi, 3)
  output.push(`   新建节点数: ${countNodes(root3) - countNodes(root2)}`)
  output.push(`   总节点数: ${countNodes(root3)}\n`)

  // 展示版本结构
  output.push('5. 版本 0 结构:')
  const lines0: string[] = []
  printTree(root0, '', false, lines0)
  output.push(lines0.join('\n'))
  output.push('')

  output.push('6. 版本 3 结构:')
  const lines3: string[] = []
  printTree(root3, '', false, lines3)
  output.push(lines3.join('\n'))
  output.push('')

  // 节点共享分析
  output.push('7. 节点共享分析:')
  const totalNodes = countNodes(root0) + countNodes(root1) + countNodes(root2) + countNodes(root3)
  const uniqueNodes = new Set<PSTNode>()
  function collectNodes(node: PSTNode | null): void {
    if (!node) return
    uniqueNodes.add(node)
    collectNodes(node.left)
    collectNodes(node.right)
  }
  collectNodes(root0)
  collectNodes(root1)
  collectNodes(root2)
  collectNodes(root3)
  output.push(`   各版本节点总数（含共享）: ${totalNodes}`)
  output.push(`   实际唯一节点数: ${uniqueNodes.size}`)
  output.push(`   节点共享节省: ${totalNodes - uniqueNodes.size} 个节点\n`)

  // 查询演示
  output.push('8. 查询版本 3 中位置 3 的元素计数:')
  function queryCount(node: PSTNode, ql: number, qh: number, lo: number, hi: number): number {
    if (ql <= lo && hi <= qh) return node.count
    const mid = Math.floor((lo + hi) / 2)
    let result = 0
    if (node.left && ql <= mid) result += queryCount(node.left, ql, qh, lo, mid)
    if (node.right && qh > mid) result += queryCount(node.right, ql, qh, mid + 1, hi)
    return result
  }
  const count3 = queryCount(root3, 3, 3, lo, hi)
  const count5 = queryCount(root3, 5, 5, lo, hi)
  output.push(`   位置 3 的计数: ${count3}`)
  output.push(`   位置 5 的计数: ${count5}`)
  output.push(`   位置 1 的计数: ${queryCount(root3, 1, 1, lo, hi)}\n`)

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
