// B树 (B-Tree) 演示

interface BTreeNode {
  keys: number[]
  children: BTreeNode[]
  isLeaf: boolean
}

class BTree {
  root: BTreeNode
  order: number // 阶数 m
  maxKeys: number
  minKeys: number // 非根节点的最小关键字数

  constructor(order: number = 3) {
    this.order = order
    this.maxKeys = order - 1
    this.minKeys = Math.ceil(order / 2) - 1
    this.root = { keys: [], children: [], isLeaf: true }
  }

  // 查找
  search(key: number): { found: boolean; path: string[] } {
    const path: string[] = []
    return { found: this.searchNode(this.root, key, path), path }
  }

  private searchNode(node: BTreeNode, key: number, path: string[]): boolean {
    const keysStr = `[${node.keys.join(',')}]`
    path.push(`访问节点 ${keysStr}`)

    let i = 0
    while (i < node.keys.length && key > node.keys[i]) {
      i++
    }

    if (i < node.keys.length && key === node.keys[i]) {
      path.push(`找到关键字 ${key}！`)
      return true
    }

    if (node.isLeaf) {
      path.push(`叶子节点中未找到 ${key}`)
      return false
    }

    path.push(`沿第 ${i + 1} 个子树继续`)
    return this.searchNode(node.children[i], key, path)
  }

  // 插入
  insert(key: number): { steps: string[] } {
    const steps: string[] = []
    steps.push(`插入关键字 ${key}`)

    const root = this.root
    if (root.keys.length === this.maxKeys) {
      steps.push(`根节点已满 [${root.keys.join(',')}], 需要分裂`)
      const newRoot: BTreeNode = { keys: [], children: [this.root], isLeaf: false }
      this.splitChild(newRoot, 0, steps)
      this.root = newRoot
      steps.push(`创建新根节点 [${newRoot.keys.join(',')}]`)
    }

    this.insertNonFull(this.root, key, steps)
    steps.push(`插入完成`)
    return { steps }
  }

  private splitChild(parent: BTreeNode, index: number, steps: string[]): void {
    const node = parent.children[index]
    const mid = Math.floor(node.keys.length / 2)

    const newNode: BTreeNode = {
      keys: node.keys.splice(mid + 1),
      children: node.isLeaf ? [] : node.children.splice(mid + 1),
      isLeaf: node.isLeaf,
    }
    const midKey = node.keys.splice(mid, 1)[0]

    parent.keys.splice(index, 0, midKey)
    parent.children.splice(index + 1, 0, newNode)

    steps.push(
      `分裂节点: [${node.keys.join(',')}] | ${midKey} | [${newNode.keys.join(',')}]`,
    )
    steps.push(`中间关键字 ${midKey} 上提到父节点`)
  }

  private insertNonFull(node: BTreeNode, key: number, steps: string[]): void {
    let i = node.keys.length - 1

    if (node.isLeaf) {
      // 在叶子节点中找到插入位置
      while (i >= 0 && key < node.keys[i]) {
        i--
      }
      // 检查是否已存在
      if (i >= 0 && node.keys[i] === key) {
        steps.push(`关键字 ${key} 已存在，跳过`)
        return
      }
      node.keys.splice(i + 1, 0, key)
      steps.push(`在叶子节点 [${node.keys.join(',')}] 中插入 ${key}`)
    } else {
      // 找到应该插入的子树
      while (i >= 0 && key < node.keys[i]) {
        i--
      }
      // 检查是否已存在
      if (i >= 0 && node.keys[i] === key) {
        steps.push(`关键字 ${key} 已存在，跳过`)
        return
      }
      i++
      if (node.children[i].keys.length === this.maxKeys) {
        steps.push(
          `子节点 [${node.children[i].keys.join(',')}] 已满, 需要分裂`,
        )
        this.splitChild(node, i, steps)
        if (key > node.keys[i]) {
          i++
        } else if (key === node.keys[i]) {
          steps.push(`关键字 ${key} 已存在，跳过`)
          return
        }
      }
      this.insertNonFull(node.children[i], key, steps)
    }
  }

  // 获取树的可视化结构
  getTreeStructure(): string {
    const lines: string[] = []
    this.printNode(this.root, '', true, lines)
    return lines.join('\n')
  }

  private printNode(
    node: BTreeNode,
    prefix: string,
    isLast: boolean,
    lines: string[],
  ): void {
    const connector = isLast ? '└── ' : '├── '
    const keysStr = `[${node.keys.join(', ')}]`
    const leafMark = node.isLeaf ? ' (叶子)' : ''
    lines.push(prefix + connector + keysStr + leafMark)

    if (!node.isLeaf) {
      for (let i = 0; i < node.children.length; i++) {
        const childIsLast = i === node.children.length - 1
        const newPrefix = prefix + (isLast ? '    ' : '│   ')
        this.printNode(node.children[i], newPrefix, childIsLast, lines)
      }
    }
  }

  getRoot(): BTreeNode {
    return this.root
  }

  getHeight(): number {
    let h = 0
    let node = this.root
    while (!node.isLeaf) {
      h++
      node = node.children[0]
    }
    return h + 1
  }

  getTotalKeys(): number {
    return this.countKeys(this.root)
  }

  private countKeys(node: BTreeNode): number {
    let count = node.keys.length
    for (const child of node.children) {
      count += this.countKeys(child)
    }
    return count
  }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('          B树 (B-Tree) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 构建 B树
  lines.push('【第一步】构建 3 阶 B树（2-3 树）')
  lines.push('─────────────────────────')
  lines.push('阶数 m=3，每个节点最多 2 个关键字，最多 3 个子节点')
  lines.push('')

  const tree = new BTree(3)
  const insertKeys = [10, 20, 5, 15, 25, 30, 3, 8, 12, 18]

  for (const key of insertKeys) {
    const { steps } = tree.insert(key)
    for (const step of steps) {
      lines.push(`  ${step}`)
    }
    lines.push('')
  }

  lines.push('最终 B树结构:')
  lines.push(tree.getTreeStructure())
  lines.push(`树高: ${tree.getHeight()}, 总关键字数: ${tree.getTotalKeys()}`)
  lines.push('')

  // 2. 查找操作
  lines.push('【第二步】查找操作')
  lines.push('─────────────────────────')

  const searchKeys = [15, 7, 25, 99]
  for (const key of searchKeys) {
    const { found, path } = tree.search(key)
    lines.push(`  查找 ${key}: ${found ? '找到' : '未找到'}`)
    for (const p of path) {
      lines.push(`    ${p}`)
    }
    lines.push('')
  }

  // 3. 再插入几个关键字，观察分裂
  lines.push('【第三步】继续插入，观察分裂过程')
  lines.push('─────────────────────────')

  const moreKeys = [35, 1, 40]
  for (const key of moreKeys) {
    const { steps } = tree.insert(key)
    for (const step of steps) {
      lines.push(`  ${step}`)
    }
    lines.push('')
  }

  lines.push('插入后的 B树结构:')
  lines.push(tree.getTreeStructure())
  lines.push(`树高: ${tree.getHeight()}, 总关键字数: ${tree.getTotalKeys()}`)
  lines.push('')

  // 4. 对比不同阶数
  lines.push('【第四步】不同阶数的 B树对比')
  lines.push('─────────────────────────')
  lines.push('  阶数 m  每节点最大关键字  适用场景')
  lines.push('  ─────────────────────────────────────────')
  lines.push('  3       2                2-3 树（教学）')
  lines.push('  4       3                2-3-4 树')
  lines.push('  100     99               小型数据库索引')
  lines.push('  500     499              中型数据库索引')
  lines.push('  1000+   999+             大型数据库索引')
  lines.push('')

  // 5. B树 vs 二叉搜索树
  lines.push('【第五步】B树 vs 二叉搜索树')
  lines.push('─────────────────────────')
  lines.push('  存储 1 亿条记录的对比:')
  lines.push('')
  lines.push('  二叉搜索树 (BST):')
  lines.push('    - 最坏情况高度: ~1 亿层（退化为链表）')
  lines.push('    - 平衡 BST 高度: ~27 层')
  lines.push('    - 每层 1 次磁盘 I/O → 最多 27 次 I/O')
  lines.push('')
  lines.push('  B树 (m=100):')
  lines.push('    - 高度: ~4 层')
  lines.push('    - 每层 1 次磁盘 I/O → 最多 4 次 I/O')
  lines.push('    - 比 BST 快 ~7 倍！')
  lines.push('')

  // 6. B树 vs B+树
  lines.push('【第六步】B树 vs B+树')
  lines.push('─────────────────────────')
  lines.push('  特性          B树              B+树')
  lines.push('  ─────────────────────────────────────────────')
  lines.push('  数据存储      所有节点          仅叶子节点')
  lines.push('  内部节点      存关键字+数据     仅存关键字')
  lines.push('  叶子链接      无                双向链表')
  lines.push('  范围查询      需遍历整棵树      遍历叶子链表')
  lines.push('  查询稳定性    不一定到叶子      一定到叶子')
  lines.push('  典型应用      文件系统          数据库索引')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
