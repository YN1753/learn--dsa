// 动态图连通性 (Dynamic Connectivity) 演示

interface RollbackOp {
  nodeX: number
  oldParentX: number
  nodeY: number
  oldRankY: number
}

class RollbackUnionFind {
  parent: number[]
  rank: number[]
  history: RollbackOp[]

  constructor(n: number) {
    this.parent = new Array(n)
    this.rank = new Array(n).fill(0)
    this.history = []
    for (let i = 0; i < n; i++) this.parent[i] = i
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      x = this.parent[x]
    }
    return x
  }

  union(x: number, y: number): boolean {
    let rootX = this.find(x)
    let rootY = this.find(y)
    if (rootX === rootY) return false

    if (this.rank[rootX] > this.rank[rootY]) {
      const tmp = rootX; rootX = rootY; rootY = tmp
    }

    this.history.push({
      nodeX: rootX,
      oldParentX: this.parent[rootX],
      nodeY: rootY,
      oldRankY: this.rank[rootY],
    })

    this.parent[rootX] = rootY
    if (this.rank[rootX] === this.rank[rootY]) {
      this.rank[rootY]++
    }
    return true
  }

  rollback(): boolean {
    if (this.history.length === 0) return false
    const op = this.history.pop()!
    this.parent[op.nodeX] = op.oldParentX
    this.rank[op.nodeY] = op.oldRankY
    return true
  }

  getSnapshot(): number {
    return this.history.length
  }

  rollbackTo(snapshot: number): void {
    while (this.history.length > snapshot) {
      this.rollback()
    }
  }

  isConnected(x: number, y: number): boolean {
    return this.find(x) === this.find(y)
  }
}

interface EdgeInterval {
  u: number
  v: number
  l: number
  r: number
}

interface Query {
  u: number
  v: number
  time: number
  index: number
}

function addToSegmentTree(
  tree: Map<number, Array<[number, number]>>,
  node: number,
  nodeL: number,
  nodeR: number,
  queryL: number,
  queryR: number,
  edge: [number, number]
): void {
  if (queryL >= nodeR || queryR <= nodeL) return
  if (queryL <= nodeL && nodeR <= queryR) {
    if (!tree.has(node)) tree.set(node, [])
    tree.get(node)!.push(edge)
    return
  }
  const mid = (nodeL + nodeR) >> 1
  addToSegmentTree(tree, node * 2, nodeL, mid, queryL, queryR, edge)
  addToSegmentTree(tree, node * 2 + 1, mid, nodeR, queryL, queryR, edge)
}

function printSets(uf: RollbackUnionFind, n: number): string {
  const sets = new Map<number, number[]>()
  for (let i = 0; i < n; i++) {
    const root = uf.find(i)
    if (!sets.has(root)) sets.set(root, [])
    sets.get(root)!.push(i)
  }
  const parts: string[] = []
  for (const [, members] of sets) {
    parts.push(`{${members.join(', ')}}`)
  }
  return parts.join('  ')
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('=========================================')
  lines.push('    动态图连通性 (Dynamic Connectivity) 演示')
  lines.push('=========================================')
  lines.push('')

  // ---- 第一部分：可撤销并查集 ----
  lines.push('【第一部分】可撤销并查集 (Rollback Union-Find)')
  lines.push('')
  lines.push('  与普通并查集不同，可撤销并查集：')
  lines.push('  - 不使用路径压缩（无法撤销）')
  lines.push('  - 仅使用按秩合并（每次只修改一个 parent 和一个 rank）')
  lines.push('  - 维护操作栈，支持精确回退')
  lines.push('')

  const uf = new RollbackUnionFind(6)
  lines.push('  初始状态: 6 个独立节点')
  lines.push(`  集合: ${printSets(uf, 6)}`)
  lines.push('')

  // 执行合并
  const mergeOps: Array<[number, number]> = [[0, 1], [2, 3], [4, 5], [1, 3]]
  for (const [u, v] of mergeOps) {
    const merged = uf.union(u, v)
    lines.push(`  Union(${u}, ${v}): ${merged ? '合并成功' : '已在同一集合'}`)
    lines.push(`  集合: ${printSets(uf, 6)}`)
  }
  lines.push('')

  // 查询
  lines.push('  连通性查询:')
  lines.push(`  Connected(0, 3)? ${uf.isConnected(0, 3)}`)
  lines.push(`  Connected(0, 4)? ${uf.isConnected(0, 4)}`)
  lines.push('')

  // 撤销操作
  lines.push('  --- 撤销上一次合并 (1,3) ---')
  uf.rollback()
  lines.push(`  集合: ${printSets(uf, 6)}`)
  lines.push(`  Connected(0, 3)? ${uf.isConnected(0, 3)}`)
  lines.push('')

  lines.push('  --- 再撤销一次 (4,5) ---')
  uf.rollback()
  lines.push(`  集合: ${printSets(uf, 6)}`)
  lines.push('')

  // ---- 第二部分：线段树分治 ----
  lines.push('【第二部分】线段树分治 (Segment Tree Divide and Conquer)')
  lines.push('')
  lines.push('  核心思想: 将每条边的存活区间 [L, R) 分配到线段树节点上')
  lines.push('  DFS 遍历线段树，进入时加边，离开时撤销')
  lines.push('  到达叶子节点时回答该时刻的查询')
  lines.push('')

  // 模拟动态图操作
  // 时间轴: 0    1    2    3    4    5
  // 操作:   加   加   查   删   加   查
  //         0-1  1-2  Q    0-1  2-3  Q

  const n = 4
  const T = 6

  // 边的时间区间
  const intervals: EdgeInterval[] = [
    { u: 0, v: 1, l: 0, r: 3 },  // 边(0,1): 时间 0 加入，时间 3 删除
    { u: 1, v: 2, l: 1, r: T },  // 边(1,2): 时间 1 加入，永久存活
    { u: 2, v: 3, l: 4, r: T },  // 边(2,3): 时间 4 加入，永久存活
  ]

  const queries: Query[] = [
    { u: 0, v: 2, time: 2, index: 0 },  // 时间 2: 查询 (0,2)
    { u: 0, v: 3, time: 5, index: 1 },  // 时间 5: 查询 (0,3)
  ]

  lines.push('  操作序列:')
  lines.push('    时间 0: 加边 (0,1)')
  lines.push('    时间 1: 加边 (1,2)')
  lines.push('    时间 2: 查询 (0,2) 是否连通?')
  lines.push('    时间 3: 删边 (0,1)')
  lines.push('    时间 4: 加边 (2,3)')
  lines.push('    时间 5: 查询 (0,3) 是否连通?')
  lines.push('')

  lines.push('  边的存活区间:')
  for (const { u, v, l, r } of intervals) {
    const bar = ' '.repeat(l) + '='.repeat(r - l) + ' '.repeat(T - r)
    lines.push(`    (${u},${v}): [${bar}]  时间 [${l}, ${r})`)
  }
  lines.push('')

  // 构建线段树
  const tree = new Map<number, Array<[number, number]>>()
  for (const { u, v, l, r } of intervals) {
    addToSegmentTree(tree, 1, 0, T, l, r, [u, v])
  }

  lines.push('  线段树节点分配:')
  for (const [node, edges] of tree) {
    const edgeStrs = edges.map(([u, v]) => `(${u},${v})`).join(', ')
    lines.push(`    节点 ${node}: [${edgeStrs}]`)
  }
  lines.push('')

  // DFS 遍历模拟
  lines.push('  DFS 遍历过程:')
  lines.push('')

  const ufMain = new RollbackUnionFind(n)
  const answers: boolean[] = new Array(T).fill(false)

  function dfsSimulate(
    node: number,
    nodeL: number,
    nodeR: number,
    depth: number
  ): void {
    const indent = '    ' + '  '.repeat(depth)
    const snapshot = ufMain.getSnapshot()

    // 加入当前节点的边
    const edges = tree.get(node) || []
    for (const [u, v] of edges) {
      ufMain.union(u, v)
      lines.push(`${indent}进入节点 ${node} [${nodeL},${nodeR}): 加入边 (${u},${v})`)
    }
    if (edges.length === 0) {
      lines.push(`${indent}进入节点 ${node} [${nodeL},${nodeR}): 无边`)
    }

    if (nodeR - nodeL === 1) {
      // 叶子节点
      lines.push(`${indent}  -> 叶子节点，时刻 ${nodeL}`)
      lines.push(`${indent}     集合: ${printSets(ufMain, n)}`)

      for (const q of queries) {
        if (q.time === nodeL) {
          answers[nodeL] = ufMain.isConnected(q.u, q.v)
          lines.push(`${indent}     查询 (${q.u},${q.v}): ${answers[nodeL] ? '连通' : '不连通'}`)
        }
      }
    } else {
      const mid = (nodeL + nodeR) >> 1
      dfsSimulate(node * 2, nodeL, mid, depth + 1)
      dfsSimulate(node * 2 + 1, mid, nodeR, depth + 1)
    }

    // 撤销
    ufMain.rollbackTo(snapshot)
    if (edges.length > 0) {
      lines.push(`${indent}离开节点 ${node}: 撤销 ${edges.length} 条边`)
    }
  }

  dfsSimulate(1, 0, T, 0)
  lines.push('')

  lines.push('  查询结果:')
  for (const q of queries) {
    lines.push(`    时刻 ${q.time}: (${q.u},${q.v}) ${answers[q.time] ? '连通' : '不连通'}`)
  }
  lines.push('')

  // ---- 第三部分：复杂度分析 ----
  lines.push('【第三部分】复杂度分析')
  lines.push('')
  lines.push('  设 m 为操作数，n 为节点数，T 为时间范围')
  lines.push('')
  lines.push('  线段树分治: 每条边被分配到 O(log T) 个节点')
  lines.push('  可撤销并查集: 每次合并 O(alpha(n))，撤销 O(1)')
  lines.push('  总时间复杂度: O(m * log T * alpha(n))')
  lines.push('  空间复杂度: O(m * log T)')
  lines.push('')
  lines.push('  其中 alpha 是反阿克曼函数，实际可视为常数')
  lines.push('')

  lines.push('=========================================')
  lines.push('  演示完成！')
  lines.push('=========================================')

  return lines.join('\n')
}
