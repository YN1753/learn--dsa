// 伸展树 (Splay Tree) 演示

interface SplayNode {
  value: number
  left: SplayNode | null
  right: SplayNode | null
}

class SplayTree {
  root: SplayNode | null = null

  // 右旋
  private rotateRight(node: SplayNode): SplayNode {
    const left = node.left!
    node.left = left.right
    left.right = node
    return left
  }

  // 左旋
  private rotateLeft(node: SplayNode): SplayNode {
    const right = node.right!
    node.right = right.left
    right.left = node
    return right
  }

  // 伸展操作：将值为 value 的节点伸展到根部
  // 返回新的根节点
  splay(node: SplayNode | null, value: number, steps: string[]): SplayNode | null {
    if (!node) return null

    // 创建虚拟根节点（辅助处理边界情况）
    const dummy: SplayNode = { value: -1, left: null, right: null }
    let leftMax: SplayNode = dummy   // 左子树的最大值链
    let rightMin: SplayNode = dummy  // 右子树的最小值链

    let current: SplayNode | null = node

    while (true) {
      if (value < current!.value) {
        // 目标在左子树
        if (!current!.left) break

        if (value < current!.left.value) {
          // Zig-Zig 情况：先旋转父节点
          steps.push(`  Zig-Zig: 节点 ${current!.value} 和 ${current!.left.value} 同为左子，先旋转 ${current!.value}`)
          current = this.rotateRight(current!)
          if (!current!.left) break
        }

        // 将当前节点连接到右子树链
        rightMin.left = current!
        rightMin = current!
        current = current!.left
      } else if (value > current!.value) {
        // 目标在右子树
        if (!current!.right) break

        if (value > current!.right.value) {
          // Zig-Zig 情况：先旋转父节点
          steps.push(`  Zig-Zig: 节点 ${current!.value} 和 ${current!.right.value} 同为右子，先旋转 ${current!.value}`)
          current = this.rotateLeft(current!)
          if (!current!.right) break
        }

        // 将当前节点连接到左子树链
        leftMax.right = current!
        leftMax = current!
        current = current!.right
      } else {
        // 找到目标节点
        break
      }
    }

    // 重新组装树
    leftMax.right = current!.left
    rightMin.left = current!.right
    current!.left = dummy.right
    current!.right = dummy.left

    return current
  }

  // 查找（带伸展）
  search(value: number, steps: string[]): boolean {
    steps.push(`搜索值 ${value}`)
    this.root = this.splay(this.root, value, steps)
    if (this.root && this.root.value === value) {
      steps.push(`  找到 ${value}，已伸展到根部`)
      return true
    }
    steps.push(`  值 ${value} 不存在，最后访问的节点 ${this.root?.value ?? '无'} 已伸展到根部`)
    return false
  }

  // 插入
  insert(value: number, steps: string[]): void {
    steps.push(`插入值 ${value}`)

    if (!this.root) {
      this.root = { value, left: null, right: null }
      steps.push(`  树为空，创建根节点 ${value}`)
      return
    }

    // 先伸展
    this.root = this.splay(this.root, value, steps)

    if (this.root!.value === value) {
      steps.push(`  值 ${value} 已存在，跳过`)
      return
    }

    const newNode: SplayNode = { value, left: null, right: null }

    if (value < this.root!.value) {
      newNode.right = this.root
      newNode.left = this.root!.left
      this.root!.left = null
      steps.push(`  ${value} < 根 ${this.root!.value}，新节点成为根，原根成为右子`)
    } else {
      newNode.left = this.root
      newNode.right = this.root!.right
      this.root!.right = null
      steps.push(`  ${value} > 根 ${this.root!.value}，新节点成为根，原根成为左子`)
    }

    this.root = newNode
  }

  // 删除
  delete(value: number, steps: string[]): void {
    steps.push(`删除值 ${value}`)

    if (!this.root) {
      steps.push(`  树为空，无法删除`)
      return
    }

    // 先将要删除的节点伸展到根部
    this.root = this.splay(this.root, value, steps)

    if (this.root!.value !== value) {
      steps.push(`  值 ${value} 不存在`)
      return
    }

    steps.push(`  找到 ${value}，执行删除`)

    if (!this.root!.left) {
      // 没有左子树，直接用右子树替换
      this.root = this.root!.right
      steps.push(`  无左子树，右子树成为新根`)
    } else {
      // 有左子树：将左子树中最大的节点伸展到左子树的根
      const leftTree = this.root!.left
      const rightTree = this.root!.right
      steps.push(`  将左子树中最大值伸展到左子树根部`)

      // 伸展左子树（用一个比所有值都大的值来确保伸展到最大节点）
      const maxNode = this.findMax(leftTree)
      const splayedLeft = this.splay(leftTree, maxNode.value, steps)
      // 将右子树连接到伸展后的左子树的右侧
      splayedLeft!.right = rightTree
      this.root = splayedLeft
      steps.push(`  左子树根 ${splayedLeft!.value} 成为新根，右子树连接为其右子树`)
    }
  }

  private findMax(node: SplayNode): SplayNode {
    let current = node
    while (current.right) current = current.right
    return current
  }

  // 获取树的可视化结构
  getTreeStructure(): string {
    const lines: string[] = []
    this.printNode(this.root, '', true, lines)
    return lines.join('\n')
  }

  private printNode(node: SplayNode | null, prefix: string, isLast: boolean, lines: string[]): void {
    if (!node) return

    const connector = isLast ? '└── ' : '├── '
    const isRoot = prefix === ''
    const label = isRoot ? `[根] ${node.value}` : `${node.value}`
    lines.push(prefix + connector + label)

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

  private inorderHelper(node: SplayNode | null, result: number[]): void {
    if (!node) return
    this.inorderHelper(node.left, result)
    result.push(node.value)
    this.inorderHelper(node.right, result)
  }

  // 获取树的高度
  getHeight(): number {
    return this.getNodeHeight(this.root)
  }

  private getNodeHeight(node: SplayNode | null): number {
    if (!node) return -1
    return 1 + Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right))
  }

  // 验证是否为合法 BST
  isValid(): boolean {
    return this.validateNode(this.root, -Infinity, Infinity)
  }

  private validateNode(node: SplayNode | null, min: number, max: number): boolean {
    if (!node) return true
    if (node.value <= min || node.value >= max) return false
    return this.validateNode(node.left, min, node.value) && this.validateNode(node.right, node.value, max)
  }

  getRoot(): SplayNode | null {
    return this.root
  }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('        伸展树 (Splay Tree) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 构建伸展树
  lines.push('【第一步】构建伸展树')
  lines.push('─────────────────────────')
  lines.push('依次插入以下值，观察伸展过程:')
  lines.push('')

  const tree = new SplayTree()
  const insertValues = [10, 20, 30, 15, 25, 5, 8, 3]

  for (const val of insertValues) {
    const steps: string[] = []
    tree.insert(val, steps)
    for (const step of steps) {
      lines.push(`  ${step}`)
    }
    lines.push(`  当前根: ${tree.getRoot()?.value}`)
    lines.push(`  中序遍历: [${tree.inorder().join(', ')}]`)
    lines.push('')
  }

  lines.push('最终伸展树结构:')
  lines.push(tree.getTreeStructure())
  lines.push(`树高: ${tree.getHeight()}`)
  lines.push(`节点数: ${tree.inorder().length}`)
  lines.push('')

  // 2. 搜索操作
  lines.push('【第二步】搜索操作（带伸展）')
  lines.push('─────────────────────────')
  lines.push('搜索节点，观察伸展到根部的过程:')
  lines.push('')

  const searchValues = [8, 25, 50]
  for (const val of searchValues) {
    const steps: string[] = []
    tree.search(val, steps)
    for (const step of steps) {
      lines.push(`  ${step}`)
    }
    lines.push(`  当前根: ${tree.getRoot()?.value}`)
    lines.push('')
  }

  // 3. 删除操作
  lines.push('【第三步】删除操作')
  lines.push('─────────────────────────')
  lines.push('删除节点，观察伸展树的变化:')
  lines.push('')

  const deleteValues = [20, 5]
  for (const val of deleteValues) {
    const steps: string[] = []
    tree.delete(val, steps)
    for (const step of steps) {
      lines.push(`  ${step}`)
    }
    lines.push(`  当前根: ${tree.getRoot()?.value}`)
    lines.push(`  中序遍历: [${tree.inorder().join(', ')}]`)
    lines.push('')
  }

  lines.push('删除后的伸展树结构:')
  lines.push(tree.getTreeStructure())
  lines.push('')

  // 4. 三种旋转类型演示
  lines.push('【第四步】三种旋转类型详解')
  lines.push('─────────────────────────')
  lines.push('')
  lines.push('  类型      触发条件                    操作')
  lines.push('  ─────────────────────────────────────────────────────────')
  lines.push('  Zig       目标是根的子节点            一次单旋')
  lines.push('  Zig-Zig   目标与父节点同方向          先旋转父节点，再旋转目标')
  lines.push('  Zig-Zag   目标与父节点反方向          先旋转目标，再旋转目标')
  lines.push('')

  // 5. Zig-Zig 演示
  lines.push('  ▶ Zig-Zig 演示: 插入 1,2,3,4,5 后搜索 1')
  const zigzigTree = new SplayTree()
  for (const v of [1, 2, 3, 4, 5]) {
    const s: string[] = []
    zigzigTree.insert(v, s)
  }
  lines.push(`    插入后树高: ${zigzigTree.getHeight()}`)
  lines.push(`    插入后根: ${zigzigTree.getRoot()?.value}`)
  const s1: string[] = []
  zigzigTree.search(1, s1)
  lines.push('    搜索 1 的伸展过程:')
  for (const step of s1) lines.push(`      ${step}`)
  lines.push(`    伸展后根: ${zigzigTree.getRoot()?.value}`)
  lines.push(`    伸展后树高: ${zigzigTree.getHeight()}`)
  lines.push('')

  // 6. 伸展树 vs AVL 树对比
  lines.push('【第五步】伸展树 vs AVL 树 vs 红黑树')
  lines.push('─────────────────────────')
  lines.push('  特性          伸展树          AVL 树          红黑树')
  lines.push('  ────────────────────────────────────────────────────────────')
  lines.push('  平衡信息      无              高度            颜色')
  lines.push('  最坏单次      O(n)            O(log n)        O(log n)')
  lines.push('  摊还复杂度    O(log n)        O(log n)        O(log n)')
  lines.push('  旋转时机      每次访问后      插入/删除后     插入/删除后')
  lines.push('  实现难度      简单            中等            较复杂')
  lines.push('  自适应性      有              无              无')
  lines.push('  典型应用      Link-Cut Tree   内存数据库      C++ STL map')
  lines.push('')

  // 7. 复杂度分析
  lines.push('【第六步】复杂度分析')
  lines.push('─────────────────────────')
  lines.push('  操作      最坏情况    摊还复杂度')
  lines.push('  ────────────────────────────────')
  lines.push('  查找      O(n)        O(log n)')
  lines.push('  插入      O(n)        O(log n)')
  lines.push('  删除      O(n)        O(log n)')
  lines.push('  空间      O(n)        O(n)')
  lines.push('')
  lines.push('  摊还分析使用势能法:')
  lines.push('  Φ = Σ log(size(v))  对所有节点 v')
  lines.push('  关键: Zig-Zig 操作虽然旋转两次，但势能下降足够大，')
  lines.push('  使得摊还代价仍为 O(log n)')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
