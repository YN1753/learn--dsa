interface TreapNode {
  key: number
  priority: number
  left: TreapNode | null
  right: TreapNode | null
}

function createNode(key: number, priority: number): TreapNode {
  return { key, priority, left: null, right: null }
}

function rotateRight(y: TreapNode): TreapNode {
  const x = y.left!
  y.left = x.right
  x.right = y
  return x
}

function rotateLeft(x: TreapNode): TreapNode {
  const y = x.right!
  x.right = y.left
  y.left = x
  return y
}

function insert(root: TreapNode | null, key: number, priority: number): TreapNode {
  if (root === null) {
    return createNode(key, priority)
  }

  if (key < root.key) {
    root.left = insert(root.left, key, priority)
    if (root.left.priority > root.priority) {
      root = rotateRight(root)
    }
  } else if (key > root.key) {
    root.right = insert(root.right, key, priority)
    if (root.right.priority > root.priority) {
      root = rotateLeft(root)
    }
  }

  return root
}

function search(root: TreapNode | null, key: number): boolean {
  if (root === null) return false
  if (key === root.key) return true
  if (key < root.key) return search(root.left, key)
  return search(root.right, key)
}

function inorder(root: TreapNode | null, result: string[]): void {
  if (root === null) return
  inorder(root.left, result)
  result.push(`${root.key}(p${root.priority})`)
  inorder(root.right, result)
}

function printTreap(root: TreapNode | null, prefix: string = '', isLeft: boolean = true): string[] {
  const lines: string[] = []
  if (root === null) return lines

  const rightLines = printTreap(root.right, prefix + (isLeft ? '│   ' : '    '), false)
  const leftLines = printTreap(root.left, prefix + (isLeft ? '    ' : '│   '), true)

  lines.push(...rightLines)
  lines.push(prefix + (isLeft ? '└── ' : '┌── ') + `[${root.key}, p${root.priority}]`)
  lines.push(...leftLines)

  return lines
}

export default function treapDemo(): string {
  const output: string[] = []

  output.push('=== Treap (笛卡尔树) 演示 ===\n')

  // 使用固定的优先级来保证演示结果可重现
  const insertions: [number, number][] = [
    [5, 8], [3, 5], [7, 3], [1, 2], [4, 6], [6, 1], [8, 4]
  ]

  let root: TreapNode | null = null

  output.push('1. 逐步插入节点 (key, priority):')
  output.push('   BST 性质: 左子树 key < 根 key < 右子树 key')
  output.push('   堆性质: 父节点 priority >= 子节点 priority')
  output.push('')

  for (const [key, priority] of insertions) {
    root = insert(root, key, priority)
    output.push(`   插入 (${key}, p${priority}):`)
    const treeLines = printTreap(root, '        ')
    output.push(...treeLines)
    output.push('')
  }

  // 中序遍历
  output.push('2. 中序遍历 (验证 BST 性质，应为升序):')
  const inorderResult: string[] = []
  inorder(root, inorderResult)
  output.push(`   ${inorderResult.join(' -> ')}`)
  output.push('')

  // 搜索操作
  output.push('3. 搜索操作:')
  const searchKeys = [4, 9, 1, 10]
  for (const key of searchKeys) {
    const found = search(root, key)
    output.push(`   搜索 key=${key}: ${found ? '找到了' : '未找到'}`)
  }
  output.push('')

  // 演示旋转
  output.push('4. 旋转操作说明:')
  output.push('   当插入新节点后，如果其 priority 高于父节点:')
  output.push('   - 如果新节点是左子节点 -> 右旋')
  output.push('   - 如果新节点是右子节点 -> 左旋')
  output.push('   旋转保持 BST 性质不变，同时恢复堆性质')
  output.push('')

  // 时间复杂度
  output.push('5. 时间复杂度:')
  output.push('   插入: 期望 O(log n)')
  output.push('   删除: 期望 O(log n)')
  output.push('   搜索: 期望 O(log n)')
  output.push('   分裂/合并: 期望 O(log n)')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
