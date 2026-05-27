// 二叉树演示

interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
}

function createNode(value: number): TreeNode {
  return { value, left: null, right: null }
}

function insertBST(root: TreeNode | null, value: number): TreeNode {
  if (root === null) return createNode(value)
  if (value < root.value) {
    root.left = insertBST(root.left, value)
  } else if (value > root.value) {
    root.right = insertBST(root.right, value)
  }
  return root
}

function preorder(node: TreeNode | null, result: number[] = []): number[] {
  if (node === null) return result
  result.push(node.value)
  preorder(node.left, result)
  preorder(node.right, result)
  return result
}

function inorder(node: TreeNode | null, result: number[] = []): number[] {
  if (node === null) return result
  inorder(node.left, result)
  result.push(node.value)
  inorder(node.right, result)
  return result
}

function postorder(node: TreeNode | null, result: number[] = []): number[] {
  if (node === null) return result
  postorder(node.left, result)
  postorder(node.right, result)
  result.push(node.value)
  return result
}

function levelOrder(root: TreeNode | null): number[] {
  if (root === null) return []
  const result: number[] = []
  const queue: TreeNode[] = [root]
  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node.value)
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
  return result
}

function getHeight(node: TreeNode | null): number {
  if (node === null) return -1
  return 1 + Math.max(getHeight(node.left), getHeight(node.right))
}

function getNodeCount(node: TreeNode | null): number {
  if (node === null) return 0
  return 1 + getNodeCount(node.left) + getNodeCount(node.right)
}

function searchBST(node: TreeNode | null, target: number, path: number[] = []): { found: boolean; path: number[] } {
  if (node === null) return { found: false, path }
  path.push(node.value)
  if (target === node.value) return { found: true, path }
  if (target < node.value) return searchBST(node.left, target, path)
  return searchBST(node.right, target, path)
}

function buildSampleTree(): TreeNode {
  //       50
  //      /  \
  //    30    70
  //   /  \  /  \
  //  20  40 60  80
  const values = [50, 30, 70, 20, 40, 60, 80]
  let root: TreeNode | null = null
  for (const v of values) {
    root = insertBST(root, v)
  }
  return root!
}

function printTree(node: TreeNode | null, prefix: string = '', isLeft: boolean = true): string {
  if (node === null) return ''
  let result = ''
  result += printTree(node.right, prefix + (isLeft ? '│   ' : '    '), false)
  result += prefix + (isLeft ? '└── ' : '┌── ') + node.value + '\n'
  result += printTree(node.left, prefix + (isLeft ? '    ' : '│   '), true)
  return result
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('        二叉树 (Binary Tree) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 构建二叉搜索树
  lines.push('【第一步】构建二叉搜索树')
  lines.push('依次插入: 50, 30, 70, 20, 40, 60, 80')
  lines.push('')
  const tree = buildSampleTree()

  lines.push('树的结构:')
  lines.push(printTree(tree))

  // 2. 基本信息
  lines.push('【第二步】基本信息')
  lines.push(`  树的高度: ${getHeight(tree)}`)
  lines.push(`  节点总数: ${getNodeCount(tree)}`)
  lines.push(`  根节点值: ${tree.value}`)
  lines.push('')

  // 3. 四种遍历方式
  lines.push('【第三步】四种遍历方式')
  lines.push('')

  lines.push('  前序遍历 (Preorder: 根→左→右):')
  lines.push(`    结果: [${preorder(tree).join(', ')}]`)
  lines.push('    步骤: 访问根 → 遍历左子树 → 遍历右子树')
  lines.push('')

  lines.push('  中序遍历 (Inorder: 左→根→右):')
  lines.push(`    结果: [${inorder(tree).join(', ')}]`)
  lines.push('    说明: BST 的中序遍历恰好是升序序列！')
  lines.push('')

  lines.push('  后序遍历 (Postorder: 左→右→根):')
  lines.push(`    结果: [${postorder(tree).join(', ')}]`)
  lines.push('    应用: 释放树的内存、计算目录大小')
  lines.push('')

  lines.push('  层序遍历 (Level-order: 逐层从左到右):')
  lines.push(`    结果: [${levelOrder(tree).join(', ')}]`)
  lines.push('    说明: 使用队列实现，按层访问节点')
  lines.push('')

  // 4. 搜索演示
  lines.push('【第四步】BST 搜索演示')
  lines.push('')

  const searchTargets = [40, 65, 80]
  for (const target of searchTargets) {
    const result = searchBST(tree, target)
    if (result.found) {
      lines.push(`  搜索 ${target}: 找到！路径: ${result.path.join(' → ')}`)
    } else {
      lines.push(`  搜索 ${target}: 未找到。路径: ${result.path.join(' → ')} → null`)
    }
  }
  lines.push('')

  // 5. 插入演示
  lines.push('【第五步】插入新节点')
  lines.push('')
  lines.push('  插入值 55:')
  const newTree = insertBST(tree, 55)
  lines.push('  更新后的树:')
  lines.push(printTree(newTree))
  lines.push(`  新的中序遍历: [${inorder(newTree).join(', ')}]`)
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
