interface TreeNode {
  value: number
  index: number
  left: TreeNode | null
  right: TreeNode | null
}

function buildCartesianTree(arr: number[]): TreeNode | null {
  const n = arr.length
  if (n === 0) return null

  const nodes: TreeNode[] = arr.map((val, i) => ({
    value: val,
    index: i,
    left: null,
    right: null,
  }))

  const stack: TreeNode[] = []

  for (let i = 0; i < n; i++) {
    let lastPopped: TreeNode | null = null

    while (stack.length > 0 && stack[stack.length - 1].value > arr[i]) {
      lastPopped = stack.pop()!
    }

    nodes[i].left = lastPopped

    if (stack.length > 0) {
      stack[stack.length - 1].right = nodes[i]
    }

    stack.push(nodes[i])
  }

  return stack[0]
}

function printTree(node: TreeNode | null, prefix: string = '', isLeft: boolean = true): string[] {
  if (node === null) return []

  const lines: string[] = []
  const connector = isLeft ? '├── ' : '└── '
  const childPrefix = isLeft ? '│   ' : '    '

  if (prefix === '') {
    lines.push(`[${node.index}]:${node.value}`)
  } else {
    lines.push(`${prefix}${connector}[${node.index}]:${node.value}`)
  }

  if (node.left !== null || node.right !== null) {
    if (node.left !== null) {
      lines.push(...printTree(node.left, prefix + childPrefix, true))
    } else {
      lines.push(`${prefix}${childPrefix}├── null`)
    }
    if (node.right !== null) {
      lines.push(...printTree(node.right, prefix + childPrefix, false))
    } else {
      lines.push(`${prefix}${childPrefix}└── null`)
    }
  }

  return lines
}

function inorderTraversal(node: TreeNode | null): number[] {
  if (node === null) return []
  return [...inorderTraversal(node.left), node.value, ...inorderTraversal(node.right)]
}

function findMin(tree: TreeNode, l: number, r: number): number | null {
  function lca(node: TreeNode | null, a: number, b: number): TreeNode | null {
    if (node === null) return null
    if (node.index >= a && node.index <= b) return node
    if (node.index < a) return lca(node.right, a, b)
    return lca(node.left, a, b)
  }

  const result = lca(tree, l, r)
  return result ? result.value : null
}

export default function cartesianTreeDemo(): string {
  const output: string[] = []

  output.push('=== 笛卡尔树演示 ===\n')

  // 构建笛卡尔树
  const arr = [3, 1, 4, 1, 5, 9, 2, 6]
  output.push(`1. 输入序列: [${arr.join(', ')}]`)
  output.push('   下标:      [0, 1, 2, 3, 4, 5, 6, 7]\n')

  output.push('2. 使用单调栈构建笛卡尔树（最小堆）:')
  const tree = buildCartesianTree(arr)

  if (tree) {
    output.push('   树结构:')
    const treeLines = printTree(tree)
    for (const line of treeLines) {
      output.push(`   ${line}`)
    }
    output.push('')

    // 验证中序遍历
    output.push('3. 中序遍历验证（应与原序列一致）:')
    const inorder = inorderTraversal(tree)
    output.push(`   中序遍历: [${inorder.join(', ')}]`)
    output.push(`   原序列:   [${arr.join(', ')}]`)
    output.push(`   验证: ${JSON.stringify(inorder) === JSON.stringify(arr) ? '✓ 一致' : '✗ 不一致'}\n`)

    // RMQ示例
    output.push('4. RMQ查询示例（通过LCA实现）:')
    const queries = [
      [0, 3], [2, 5], [1, 7], [4, 6],
    ]
    for (const [l, r] of queries) {
      const minVal = findMin(tree, l, r)
      const subArr = arr.slice(l, r + 1)
      const expected = Math.min(...subArr)
      output.push(`   RMQ(${l}, ${r}): min([${subArr.join(', ')}]) = ${minVal}  ${minVal === expected ? '✓' : '✗'}`)
    }
    output.push('')

    // 展示堆性质
    output.push('5. 堆性质验证（父节点值 <= 子节点值）:')
    function verifyHeap(node: TreeNode | null): boolean {
      if (node === null) return true
      if (node.left !== null && node.value > node.left.value) return false
      if (node.right !== null && node.value > node.right.value) return false
      return verifyHeap(node.left) && verifyHeap(node.right)
    }
    output.push(`   最小堆性质: ${verifyHeap(tree) ? '✓ 满足' : '✗ 不满足'}\n`)

    // Treap关系说明
    output.push('6. 与Treap的关系:')
    output.push('   Treap = 随机化的笛卡尔树')
    output.push('   - key: 插入的值（决定BST位置）')
    output.push('   - priority: 随机生成（决定堆序层次）')
    output.push('   - 期望高度: O(log n)\n')
  }

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
