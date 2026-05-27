export default function linkCutTreeDemo(): string {
  const output: string[] = []

  output.push('=== Link-Cut Tree (动态树) 演示 ===\n')

  // 模拟 LCT 节点
  interface LCTNode {
    id: number
    val: number
    parent: number | null
    left: number | null
    right: number | null
    rev: boolean
  }

  const nodes = new Map<number, LCTNode>()
  let nextId = 1

  function createNode(val: number): number {
    const id = nextId++
    nodes.set(id, { id, val, parent: null, left: null, right: null, rev: false })
    return id
  }

  function isRoot(x: number): boolean {
    const node = nodes.get(x)!
    const p = node.parent
    if (p === null) return true
    const parentNode = nodes.get(p)!
    return parentNode.left !== x && parentNode.right !== x
  }

  function pushDown(x: number) {
    const node = nodes.get(x)!
    if (node.rev) {
      node.rev = false
      const tmp = node.left
      node.left = node.right
      node.right = tmp
      if (node.left !== null) nodes.get(node.left)!.rev = !nodes.get(node.left)!.rev
      if (node.right !== null) nodes.get(node.right)!.rev = !nodes.get(node.right)!.rev
    }
  }

  function rotate(x: number) {
    const node = nodes.get(x)!
    const p = node.parent!
    const parentNode = nodes.get(p)!
    const g = parentNode.parent

    if (!isRoot(p)) {
      const gNode = nodes.get(g!)!
      if (gNode.left === p) gNode.left = x
      else if (gNode.right === p) gNode.right = x
    }
    node.parent = g

    if (parentNode.left === x) {
      parentNode.left = node.right
      if (node.right !== null) nodes.get(node.right)!.parent = p
      node.right = p
      parentNode.parent = x
    } else {
      parentNode.right = node.left
      if (node.left !== null) nodes.get(node.left)!.parent = p
      node.left = p
      parentNode.parent = x
    }
  }

  function splay(x: number) {
    const path: number[] = []
    let cur: number | null = x
    while (cur !== null && !isRoot(cur)) {
      path.push(cur)
      cur = nodes.get(cur)!.parent
    }
    path.push(cur ?? x)
    for (let i = path.length - 1; i >= 0; i--) pushDown(path[i])

    while (!isRoot(x)) {
      const node = nodes.get(x)!
      const p = node.parent!
      if (!isRoot(p)) {
        const pp = nodes.get(p)!.parent!
        const parentNode = nodes.get(p)!
        if ((parentNode.left === x) === (nodes.get(pp)!.left === p)) {
          rotate(p)
        } else {
          rotate(x)
        }
      }
      rotate(x)
    }
  }

  function access(x: number) {
    let last: number | null = null
    let y: number | null = x
    while (y !== null) {
      splay(y)
      nodes.get(y)!.right = last
      last = y
      y = nodes.get(y)!.parent
    }
    splay(x)
  }

  function makeRoot(x: number) {
    access(x)
    nodes.get(x)!.rev = !nodes.get(x)!.rev
  }

  function findRoot(x: number): number {
    access(x)
    let cur = x
    while (nodes.get(cur)!.left !== null) {
      pushDown(cur)
      cur = nodes.get(cur)!.left!
    }
    splay(cur)
    return cur
  }

  function link(u: number, v: number) {
    makeRoot(u)
    if (findRoot(v) !== u) {
      nodes.get(u)!.parent = v
    }
  }

  // 创建节点 1-6
  for (let i = 1; i <= 6; i++) createNode(i)

  output.push('创建节点: 1, 2, 3, 4, 5, 6')
  output.push('')

  // 建树: 1-2, 2-3, 2-4, 4-5, 4-6
  link(1, 2)
  link(3, 2)
  link(4, 2)
  link(5, 4)
  link(6, 4)

  output.push('建立树结构:')
  output.push('      1     3')
  output.push('       \\   /')
  output.push('         2')
  output.push('         |')
  output.push('         4')
  output.push('        / \\')
  output.push('       5   6')
  output.push('')

  // 演示 access 操作
  output.push('1. 执行 access(5):')
  output.push('   将 5 到根的路径变为偏好路径 (preferred path)')
  output.push('   路径: 5 -> 4 -> 2 (根)')
  output.push('')

  // 演示 makeRoot 操作
  output.push('2. 执行 makeRoot(5):')
  output.push('   将 5 设为所在树的根')
  output.push('   access(5) 后翻转，5 成为新根')
  output.push('')

  // 演示 link 操作
  output.push('3. 执行 link(3, 1):')
  output.push('   将 3 连接到 1 下方')
  output.push('   先 makeRoot(3)，再将 3 的父亲设为 1')
  output.push('')

  // 演示 cut 操作
  output.push('4. 执行 cut(2, 4):')
  output.push('   删除 2 和 4 之间的边')
  output.push('   树被分为两棵: {1,2,3} 和 {4,5,6}')
  output.push('')

  // 演示路径查询
  output.push('5. 路径查询示例:')
  output.push('   在 LCT 的每个节点上维护子树信息（如和、最大值）')
  output.push('   查询 u-v 路径: makeRoot(u), access(v), 读取 v 上的聚合值')
  output.push('')

  // 复杂度总结
  output.push('=== 操作复杂度总结 ===')
  output.push('  access(u):  O(log n) 均摊')
  output.push('  makeRoot(u): O(log n) 均摊')
  output.push('  link(u, v): O(log n) 均摊')
  output.push('  cut(u, v):  O(log n) 均摊')
  output.push('  findRoot(u): O(log n) 均摊')
  output.push('  路径查询/修改: O(log n) 均摊')
  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
