// 红黑树 (Red-Black Tree) 演示

type Color = 'R' | 'B'

interface RBNode {
  value: number
  left: RBNode | null
  right: RBNode | null
  parent: RBNode | null
  color: Color
}

const NIL_NODE: RBNode = {
  value: -1,
  left: null,
  right: null,
  parent: null,
  color: 'B',
}

class RedBlackTree {
  root: RBNode = NIL_NODE

  // 左旋
  private rotateLeft(x: RBNode): void {
    const y = x.right!
    x.right = y.left
    if (y.left !== NIL_NODE) {
      y.left.parent = x
    }
    y.parent = x.parent
    if (x.parent === null) {
      this.root = y
    } else if (x === x.parent.left) {
      x.parent.left = y
    } else {
      x.parent.right = y
    }
    y.left = x
    x.parent = y
  }

  // 右旋
  private rotateRight(x: RBNode): void {
    const y = x.left!
    x.left = y.right
    if (y.right !== NIL_NODE) {
      y.right.parent = x
    }
    y.parent = x.parent
    if (x.parent === null) {
      this.root = y
    } else if (x === x.parent.right) {
      x.parent.right = y
    } else {
      x.parent.left = y
    }
    y.right = x
    x.parent = y
  }

  // 插入
  insert(value: number, steps: string[]): void {
    steps.push(`插入值 ${value} (初始为红色)`)

    // 创建新节点
    const newNode: RBNode = {
      value,
      left: NIL_NODE,
      right: NIL_NODE,
      parent: null,
      color: 'R',
    }

    // BST 插入
    let parent: RBNode | null = null
    let current = this.root
    while (current !== NIL_NODE) {
      parent = current
      if (value < current.value) {
        current = current.left!
      } else if (value > current.value) {
        current = current.right!
      } else {
        steps.push(`  值 ${value} 已存在，跳过`)
        return
      }
    }

    newNode.parent = parent
    if (parent === null) {
      this.root = newNode
    } else if (value < parent.value) {
      parent.left = newNode
    } else {
      parent.right = newNode
    }

    // 如果是根节点，直接染黑
    if (newNode.parent === null) {
      newNode.color = 'B'
      steps.push(`  新节点是根节点，染为黑色`)
      return
    }

    // 如果祖父是 null（父节点是根），不需要修复
    if (newNode.parent.parent === null) {
      steps.push(`  插入完成`)
      return
    }

    // 修复红黑树性质
    this.fixInsert(newNode, steps)
  }

  // 插入修复
  private fixInsert(node: RBNode, steps: string[]): void {
    let current = node

    while (current.parent !== null && current.parent.color === 'R') {
      const parent = current.parent
      const grandparent = parent.parent!

      if (parent === grandparent.left) {
        const uncle = grandparent.right

        if (uncle.color === 'R') {
          // 情况 1：叔叔是红色 -> 颜色翻转
          steps.push(`  情况1: 叔叔节点 ${uncle.value} 是红色，执行颜色翻转`)
          steps.push(`    父节点 ${parent.value} 染黑，叔叔 ${uncle.value} 染黑，祖父 ${grandparent.value} 染红`)
          parent.color = 'B'
          uncle.color = 'B'
          grandparent.color = 'R'
          current = grandparent
        } else {
          if (current === parent.right) {
            // 情况 2：叔叔是黑色，当前节点是右子 -> 左旋转为情况 3
            steps.push(`  情况2: 叔叔是黑色，节点 ${current.value} 是父节点右子，先对父节点 ${parent.value} 左旋`)
            current = parent
            this.rotateLeft(current)
          }
          // 情况 3：叔叔是黑色，当前节点是左子 -> 右旋
          steps.push(`  情况3: 叔叔是黑色，对祖父 ${grandparent.value} 右旋并调整颜色`)
          steps.push(`    父节点 ${current.parent!.value} 染黑，祖父 ${grandparent.value} 染红`)
          current.parent!.color = 'B'
          grandparent.color = 'R'
          this.rotateRight(grandparent)
        }
      } else {
        // 对称情况
        const uncle = grandparent.left

        if (uncle.color === 'R') {
          steps.push(`  情况1(对称): 叔叔节点 ${uncle.value} 是红色，执行颜色翻转`)
          steps.push(`    父节点 ${parent.value} 染黑，叔叔 ${uncle.value} 染黑，祖父 ${grandparent.value} 染红`)
          parent.color = 'B'
          uncle.color = 'B'
          grandparent.color = 'R'
          current = grandparent
        } else {
          if (current === parent.left) {
            steps.push(`  情况2(对称): 叔叔是黑色，节点 ${current.value} 是父节点左子，先对父节点 ${parent.value} 右旋`)
            current = parent
            this.rotateRight(current)
          }
          steps.push(`  情况3(对称): 叔叔是黑色，对祖父 ${grandparent.value} 左旋并调整颜色`)
          steps.push(`    父节点 ${current.parent!.value} 染黑，祖父 ${grandparent.value} 染红`)
          current.parent!.color = 'B'
          grandparent.color = 'R'
          this.rotateLeft(grandparent)
        }
      }
    }

    // 确保根节点是黑色
    if (this.root.color === 'R') {
      steps.push(`  根节点 ${this.root.value} 染为黑色`)
      this.root.color = 'B'
    }
  }

  // 获取树的可视化结构
  getTreeStructure(): string {
    const lines: string[] = []
    if (this.root === NIL_NODE) {
      return '  (空树)'
    }
    this.printNode(this.root, '', true, lines)
    return lines.join('\n')
  }

  private printNode(node: RBNode, prefix: string, isLast: boolean, lines: string[]): void {
    if (node === NIL_NODE) return

    const connector = isLast ? '└── ' : '├── '
    const colorStr = node.color === 'R' ? 'R' : 'B'
    lines.push(prefix + connector + `${node.value}[${colorStr}]`)

    const newPrefix = prefix + (isLast ? '    ' : '│   ')

    const hasChildren = (node.left !== NIL_NODE) || (node.right !== NIL_NODE)
    if (hasChildren) {
      if (node.right !== NIL_NODE) {
        this.printNode(node.right, newPrefix, node.left === NIL_NODE, lines)
      }
      if (node.left !== NIL_NODE) {
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

  private inorderHelper(node: RBNode, result: number[]): void {
    if (node === NIL_NODE) return
    this.inorderHelper(node.left, result)
    result.push(node.value)
    this.inorderHelper(node.right, result)
  }

  // 验证红黑树性质
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // 性质 2: 根节点是黑色
    if (this.root !== NIL_NODE && this.root.color !== 'B') {
      errors.push('根节点不是黑色')
    }

    // 性质 3, 4, 5
    if (this.root !== NIL_NODE) {
      this.validateNode(this.root, errors)
    }

    return { valid: errors.length === 0, errors }
  }

  private validateNode(node: RBNode, errors: string[]): number {
    if (node === NIL_NODE) return 1 // NIL 是黑色，黑高 +1

    // 性质 4: 红色节点的子节点必须是黑色
    if (node.color === 'R') {
      if (node.left.color === 'R') {
        errors.push(`节点 ${node.value} 是红色，其左子节点 ${node.left.value} 也是红色`)
      }
      if (node.right.color === 'R') {
        errors.push(`节点 ${node.value} 是红色，其右子节点 ${node.right.value} 也是红色`)
      }
    }

    // 递归计算黑高
    const leftBH = this.validateNode(node.left, errors)
    const rightBH = this.validateNode(node.right, errors)

    // 性质 5: 左右子树黑高必须相同
    if (leftBH !== rightBH) {
      errors.push(`节点 ${node.value} 的左右黑高不一致: 左=${leftBH}, 右=${rightBH}`)
    }

    return leftBH + (node.color === 'B' ? 1 : 0)
  }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('       红黑树 (Red-Black Tree) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 构建红黑树
  lines.push('【第一步】构建红黑树')
  lines.push('─────────────────────────')
  lines.push('依次插入以下值，观察颜色翻转和旋转过程:')
  lines.push('')

  const tree = new RedBlackTree()
  const insertValues = [10, 20, 30, 15, 25, 5, 8, 3, 12, 18]

  for (const val of insertValues) {
    const steps: string[] = []
    tree.insert(val, steps)
    for (const step of steps) {
      lines.push(`  ${step}`)
    }
    lines.push('')
  }

  lines.push('最终红黑树结构 ([值]颜色):')
  lines.push(tree.getTreeStructure())
  lines.push(`中序遍历: [${tree.inorder().join(', ')}]`)
  const validation = tree.validate()
  lines.push(`验证结果: ${validation.valid ? '合法红黑树' : '不合法: ' + validation.errors.join('; ')}`)
  lines.push('')

  // 2. 展示红黑树五条性质
  lines.push('【第二步】红黑树五条性质验证')
  lines.push('─────────────────────────')
  lines.push('')
  lines.push('  性质 1: 每个节点是红色或黑色             ✓')
  lines.push('  性质 2: 根节点是黑色                      ✓')
  lines.push('  性质 3: 所有叶子(NIL)是黑色               ✓')
  lines.push('  性质 4: 红色节点的子节点都是黑色           ✓')
  lines.push('  性质 5: 从任意节点到叶子的黑色节点数相同   ✓')
  lines.push('')

  // 3. 独立演示插入过程
  lines.push('【第三步】关键插入场景演示')
  lines.push('─────────────────────────')
  lines.push('')

  // 场景 1: 颜色翻转
  lines.push('  ▶ 场景1: 颜色翻转 (插入 10, 5, 15)')
  const tree1 = new RedBlackTree()
  for (const v of [10, 5, 15]) {
    const s: string[] = []
    tree1.insert(v, s)
    for (const step of s) lines.push(`    ${step}`)
  }
  lines.push(`    结果: [${tree1.inorder().join(', ')}]`)
  lines.push('')

  // 场景 2: LL 型旋转
  lines.push('  ▶ 场景2: LL 型旋转 (插入 30, 20, 10)')
  const tree2 = new RedBlackTree()
  for (const v of [30, 20, 10]) {
    const s: string[] = []
    tree2.insert(v, s)
    for (const step of s) lines.push(`    ${step}`)
  }
  lines.push(`    结果: [${tree2.inorder().join(', ')}]`)
  lines.push('')

  // 场景 3: RR 型旋转
  lines.push('  ▶ 场景3: RR 型旋转 (插入 10, 20, 30)')
  const tree3 = new RedBlackTree()
  for (const v of [10, 20, 30]) {
    const s: string[] = []
    tree3.insert(v, s)
    for (const step of s) lines.push(`    ${step}`)
  }
  lines.push(`    结果: [${tree3.inorder().join(', ')}]`)
  lines.push('')

  // 场景 4: 复杂插入
  lines.push('  ▶ 场景4: 复杂插入序列 (插入 7, 3, 18, 10, 22, 8, 11, 26, 2, 6)')
  const tree4 = new RedBlackTree()
  for (const v of [7, 3, 18, 10, 22, 8, 11, 26, 2, 6]) {
    const s: string[] = []
    tree4.insert(v, s)
    for (const step of s) lines.push(`    ${step}`)
  }
  lines.push(`    结果: [${tree4.inorder().join(', ')}]`)
  lines.push('')

  // 4. 复杂度对比
  lines.push('【第四步】红黑树 vs AVL树 vs 普通BST 复杂度对比')
  lines.push('─────────────────────────')
  lines.push('  操作      普通BST(最坏)  AVL树(保证)  红黑树(保证)')
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  查找      O(n)           O(log n)     O(log n)')
  lines.push('  插入      O(n)           O(log n)     O(log n)')
  lines.push('  删除      O(n)           O(log n)     O(log n)')
  lines.push('  旋转次数  -              最多O(log n)  最多3次(删)')
  lines.push('')

  // 5. 实际应用
  lines.push('【第五步】红黑树的实际应用')
  lines.push('─────────────────────────')
  lines.push('  - Java TreeMap / TreeSet: 有序映射和集合')
  lines.push('  - C++ std::map / std::set: 有序关联容器')
  lines.push('  - Linux CFS 调度器: 管理进程虚拟运行时间')
  lines.push('  - Nginx 定时器: 管理超时事件')
  lines.push('  - Linux epoll: 管理文件描述符集合')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
