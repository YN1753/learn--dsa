// AVL树 (AVL Tree) 演示

interface AVLNode {
  value: number
  left: AVLNode | null
  right: AVLNode | null
  height: number
}

class AVLTree {
  root: AVLNode | null = null

  // 获取节点高度
  private getHeight(node: AVLNode | null): number {
    return node ? node.height : -1
  }

  // 更新节点高度
  private updateHeight(node: AVLNode): void {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right))
  }

  // 获取平衡因子
  getBalanceFactor(node: AVLNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0
  }

  // 右旋 (LL 情况)
  private rotateRight(y: AVLNode): AVLNode {
    const x = y.left!
    const T2 = x.right

    x.right = y
    y.left = T2

    this.updateHeight(y)
    this.updateHeight(x)

    return x
  }

  // 左旋 (RR 情况)
  private rotateLeft(x: AVLNode): AVLNode {
    const y = x.right!
    const T2 = y.left

    y.left = x
    x.right = T2

    this.updateHeight(x)
    this.updateHeight(y)

    return y
  }

  // 平衡节点
  private balance(node: AVLNode, steps: string[]): AVLNode {
    this.updateHeight(node)
    const bf = this.getBalanceFactor(node)

    // LL 情况: 左子树过高，右旋
    if (bf > 1 && this.getBalanceFactor(node.left) >= 0) {
      steps.push(`  节点 ${node.value} 失衡 (BF=${bf}), 执行 LL 右旋`)
      return this.rotateRight(node)
    }

    // RR 情况: 右子树过高，左旋
    if (bf < -1 && this.getBalanceFactor(node.right) <= 0) {
      steps.push(`  节点 ${node.value} 失衡 (BF=${bf}), 执行 RR 左旋`)
      return this.rotateLeft(node)
    }

    // LR 情况: 左子树的右子树过高，先左旋再右旋
    if (bf > 1 && this.getBalanceFactor(node.left) < 0) {
      steps.push(`  节点 ${node.value} 失衡 (BF=${bf}), 执行 LR 先左旋后右旋`)
      node.left = this.rotateLeft(node.left!)
      return this.rotateRight(node)
    }

    // RL 情况: 右子树的左子树过高，先右旋再左旋
    if (bf < -1 && this.getBalanceFactor(node.right) > 0) {
      steps.push(`  节点 ${node.value} 失衡 (BF=${bf}), 执行 RL 先右旋后左旋`)
      node.right = this.rotateRight(node.right!)
      return this.rotateLeft(node)
    }

    return node
  }

  // 插入
  insert(value: number, steps: string[]): void {
    steps.push(`插入值 ${value}`)
    this.root = this.insertNode(this.root, value, steps)
  }

  private insertNode(node: AVLNode | null, value: number, steps: string[]): AVLNode {
    if (!node) {
      steps.push(`  创建新节点 ${value}`)
      return { value, left: null, right: null, height: 0 }
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value, steps)
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value, steps)
    } else {
      steps.push(`  值 ${value} 已存在，跳过`)
      return node
    }

    return this.balance(node, steps)
  }

  // 删除
  delete(value: number, steps: string[]): void {
    steps.push(`删除值 ${value}`)
    this.root = this.deleteNode(this.root, value, steps)
  }

  private deleteNode(node: AVLNode | null, value: number, steps: string[]): AVLNode | null {
    if (!node) {
      steps.push(`  值 ${value} 不存在`)
      return null
    }

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value, steps)
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value, steps)
    } else {
      // 找到要删除的节点
      if (!node.left || !node.right) {
        const child = node.left || node.right
        if (!child) {
          steps.push(`  删除叶子节点 ${node.value}`)
        } else {
          steps.push(`  用子节点 ${child.value} 替换 ${node.value}`)
        }
        return child
      }

      // 有两个子节点：找中序后继
      const successor = this.findMin(node.right)
      steps.push(`  用中序后继 ${successor.value} 替换 ${node.value}`)
      node.value = successor.value
      node.right = this.deleteNode(node.right, successor.value, steps)
    }

    return this.balance(node, steps)
  }

  private findMin(node: AVLNode): AVLNode {
    while (node.left) node = node.left
    return node
  }

  // 获取树的可视化结构（带平衡因子）
  getTreeStructure(): string {
    const lines: string[] = []
    this.printNode(this.root, '', true, lines)
    return lines.join('\n')
  }

  private printNode(node: AVLNode | null, prefix: string, isLast: boolean, lines: string[]): void {
    if (!node) return

    const connector = isLast ? '└── ' : '├── '
    const bf = this.getBalanceFactor(node)
    lines.push(prefix + connector + `${node.value} (BF=${bf}, H=${node.height})`)

    const newPrefix = prefix + (isLast ? '    ' : '│   ')

    if (node.left || node.right) {
      if (node.right) {
        this.printNode(node.right, newPrefix, !node.left, lines)
      }
      if (node.left) {
        this.printNode(node.left, newPrefix, true, lines)
      }
    }
  }

  // 中序遍历
  inorder(): number[] {
    const result: number[] = []
    this.inorderHelper(this.root, result)
    return result
  }

  private inorderHelper(node: AVLNode | null, result: number[]): void {
    if (!node) return
    this.inorderHelper(node.left, result)
    result.push(node.value)
    this.inorderHelper(node.right, result)
  }

  // 验证是否为合法 AVL 树
  isValid(): boolean {
    return this.validateNode(this.root)
  }

  private validateNode(node: AVLNode | null): boolean {
    if (!node) return true
    const bf = this.getBalanceFactor(node)
    if (Math.abs(bf) > 1) return false
    return this.validateNode(node.left) && this.validateNode(node.right)
  }

  getRoot(): AVLNode | null {
    return this.root
  }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('         AVL树 (AVL Tree) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 构建 AVL 树
  lines.push('【第一步】构建 AVL 树')
  lines.push('─────────────────────────')
  lines.push('依次插入以下值，观察旋转过程:')
  lines.push('')

  const tree = new AVLTree()
  const insertValues = [10, 20, 30, 25, 28, 5, 3, 8, 15, 12]

  for (const val of insertValues) {
    const steps: string[] = []
    tree.insert(val, steps)
    for (const step of steps) {
      lines.push(`  ${step}`)
    }
    lines.push('')
  }

  lines.push('最终 AVL 树结构:')
  lines.push(tree.getTreeStructure())
  lines.push(`中序遍历: [${tree.inorder().join(', ')}]`)
  lines.push(`验证平衡: ${tree.isValid() ? '合法' : '不合法'}`)
  lines.push('')

  // 2. 删除操作
  lines.push('【第二步】删除操作')
  lines.push('─────────────────────────')
  lines.push('删除节点，观察重新平衡:')
  lines.push('')

  const deleteValues = [20, 30, 10]
  for (const val of deleteValues) {
    const steps: string[] = []
    tree.delete(val, steps)
    for (const step of steps) {
      lines.push(`  ${step}`)
    }
    lines.push('')
  }

  lines.push('删除后的 AVL 树结构:')
  lines.push(tree.getTreeStructure())
  lines.push(`中序遍历: [${tree.inorder().join(', ')}]`)
  lines.push(`验证平衡: ${tree.isValid() ? '合法' : '不合法'}`)
  lines.push('')

  // 3. 旋转类型演示
  lines.push('【第三步】四种旋转类型详解')
  lines.push('─────────────────────────')
  lines.push('')
  lines.push('  类型    触发条件              操作        示例')
  lines.push('  ────────────────────────────────────────────────────────')
  lines.push('  LL      BF=+2, 左子BF>=0     右旋        插入 30,20,10')
  lines.push('  RR      BF=-2, 右子BF<=0     左旋        插入 10,20,30')
  lines.push('  LR      BF=+2, 左子BF<0      先左旋后右旋 插入 30,10,20')
  lines.push('  RL      BF=-2, 右子BF>0      先右旋后左旋 插入 10,30,20')
  lines.push('')

  // 4. 四种旋转的独立演示
  lines.push('【第四步】逐个演示四种旋转')
  lines.push('─────────────────────────')
  lines.push('')

  // LL 旋转
  lines.push('  ▶ LL 旋转 (右旋): 插入 30, 20, 10')
  const llTree = new AVLTree()
  for (const v of [30, 20, 10]) {
    const s: string[] = []
    llTree.insert(v, s)
    for (const step of s) lines.push(`    ${step}`)
  }
  lines.push(`    结果: [${llTree.inorder().join(', ')}]`)
  lines.push('')

  // RR 旋转
  lines.push('  ▶ RR 旋转 (左旋): 插入 10, 20, 30')
  const rrTree = new AVLTree()
  for (const v of [10, 20, 30]) {
    const s: string[] = []
    rrTree.insert(v, s)
    for (const step of s) lines.push(`    ${step}`)
  }
  lines.push(`    结果: [${rrTree.inorder().join(', ')}]`)
  lines.push('')

  // LR 旋转
  lines.push('  ▶ LR 旋转 (先左旋后右旋): 插入 30, 10, 20')
  const lrTree = new AVLTree()
  for (const v of [30, 10, 20]) {
    const s: string[] = []
    lrTree.insert(v, s)
    for (const step of s) lines.push(`    ${step}`)
  }
  lines.push(`    结果: [${lrTree.inorder().join(', ')}]`)
  lines.push('')

  // RL 旋转
  lines.push('  ▶ RL 旋转 (先右旋后左旋): 插入 10, 30, 20')
  const rlTree = new AVLTree()
  for (const v of [10, 30, 20]) {
    const s: string[] = []
    rlTree.insert(v, s)
    for (const step of s) lines.push(`    ${step}`)
  }
  lines.push(`    结果: [${rlTree.inorder().join(', ')}]`)
  lines.push('')

  // 5. 复杂度对比
  lines.push('【第五步】AVL树 vs 普通BST 复杂度对比')
  lines.push('─────────────────────────')
  lines.push('  操作      普通BST(最坏)  普通BST(平均)  AVL树(保证)')
  lines.push('  ──────────────────────────────────────────────────')
  lines.push('  查找      O(n)           O(log n)       O(log n)')
  lines.push('  插入      O(n)           O(log n)       O(log n)')
  lines.push('  删除      O(n)           O(log n)       O(log n)')
  lines.push('  空间      O(n)           O(n)           O(n)')
  lines.push('')
  lines.push('  AVL树的优势: 所有操作都有 O(log n) 的最坏情况保证')
  lines.push('  普通BST在有序插入时退化为链表，AVL树永远不会')
  lines.push('')

  // 6. 与红黑树的对比
  lines.push('【第六步】AVL树 vs 红黑树')
  lines.push('─────────────────────────')
  lines.push('  特性          AVL树           红黑树')
  lines.push('  ──────────────────────────────────────────────')
  lines.push('  平衡程度      严格平衡        近似平衡')
  lines.push('  树高上界      1.44 log n      2 log n')
  lines.push('  插入旋转次数  最多 2 次       最多 2 次')
  lines.push('  删除旋转次数  最多 O(log n)   最多 3 次')
  lines.push('  查找效率      更快(树更矮)    略慢')
  lines.push('  插入/删除     旋转可能更多    旋转次数固定')
  lines.push('  实际应用      内存数据库索引  C++ STL map, Java TreeMap')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
