// 可撤销并查集 (Rollback Union-Find) 演示

interface HistoryRecord {
  node: number
  oldParent: number
  oldRank: number
}

class RollbackUnionFind {
  parent: number[]
  rank: number[]
  history: HistoryRecord[] = []

  constructor(n: number) {
    this.parent = new Array(n)
    this.rank = new Array(n).fill(0)
    for (let i = 0; i < n; i++) this.parent[i] = i
  }

  find(x: number): number {
    while (this.parent[x] !== x) {
      x = this.parent[x]
    }
    return x
  }

  union(x: number, y: number): boolean {
    x = this.find(x)
    y = this.find(y)
    if (x === y) return false

    if (this.rank[x] > this.rank[y]) {
      ;[x, y] = [y, x]
    }

    this.history.push({
      node: x,
      oldParent: this.parent[x],
      oldRank: this.rank[y],
    })

    this.parent[x] = y
    if (this.rank[x] === this.rank[y]) {
      this.rank[y]++
    }
    return true
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y)
  }

  rollback(): boolean {
    if (this.history.length === 0) return false
    const record = this.history.pop()!
    this.parent[record.node] = record.oldParent
    this.rank[record.node] = record.oldRank
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
}

function printState(uf: RollbackUnionFind, n: number): string[] {
  const lines: string[] = []
  lines.push(`  parent: [${uf.parent.join(', ')}]`)
  lines.push(`  rank:   [${uf.rank.join(', ')}]`)

  const sets = new Map<number, number[]>()
  for (let i = 0; i < n; i++) {
    const root = uf.find(i)
    if (!sets.has(root)) sets.set(root, [])
    sets.get(root)!.push(i)
  }
  const setStrs: string[] = []
  for (const [, members] of sets) {
    setStrs.push(`{${members.join(', ')}}`)
  }
  lines.push(`  集合: ${setStrs.join('  ')}`)
  lines.push(`  历史栈大小: ${uf.history.length}`)
  return lines
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('     可撤销并查集 (Rollback Union-Find) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  const N = 8
  const uf = new RollbackUnionFind(N)

  // 1. 初始化
  lines.push('【第一步】初始化 8 个独立元素')
  lines.push('')
  lines.push('  每个元素自成一个集合，不使用路径压缩:')
  lines.push(...printState(uf, N))
  lines.push('')

  // 2. 执行 Union 操作
  lines.push('【第二步】执行 Union 操作（按秩合并，不压缩路径）')
  lines.push('')

  const unionOps: [number, number][] = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [4, 6],
    [1, 5],
  ]

  for (const [a, b] of unionOps) {
    const merged = uf.union(a, b)
    if (merged) {
      lines.push(`  Union(${a}, ${b}): 合并成功`)
    } else {
      lines.push(`  Union(${a}, ${b}): 已在同一集合，跳过`)
    }
    lines.push(...printState(uf, N))
    lines.push('')
  }

  // 3. 查询操作
  lines.push('【第三步】查询连通性')
  lines.push('')

  const testPairs: [number, number][] = [
    [0, 3], [0, 5], [1, 7], [0, 4],
  ]
  for (const [a, b] of testPairs) {
    const connected = uf.connected(a, b)
    lines.push(`  Connected(${a}, ${b})? ${connected ? '是' : '否'}`)
  }
  lines.push('')

  // 4. 撤销操作演示
  lines.push('【第四步】撤销操作（栈式回滚）')
  lines.push('')

  lines.push('  当前状态:')
  lines.push(...printState(uf, N))
  lines.push('')

  lines.push('  撤销最后一次合并 (1, 5):')
  uf.rollback()
  lines.push(...printState(uf, N))
  lines.push('')

  lines.push('  再撤销一次 (4, 6):')
  uf.rollback()
  lines.push(...printState(uf, N))
  lines.push('')

  lines.push('  再撤销一次 (0, 2):')
  uf.rollback()
  lines.push(...printState(uf, N))
  lines.push('')

  // 5. 快照机制演示
  lines.push('【第五步】快照机制（Snapshot）')
  lines.push('')

  // 重新构建
  const uf2 = new RollbackUnionFind(N)
  uf2.union(0, 1)
  uf2.union(2, 3)
  uf2.union(4, 5)
  lines.push('  重新构建: Union(0,1), Union(2,3), Union(4,5)')
  lines.push(...printState(uf2, N))
  lines.push('')

  const snap = uf2.getSnapshot()
  lines.push(`  保存快照，历史栈大小 = ${snap}`)
  lines.push('')

  uf2.union(0, 2)
  uf2.union(4, 6)
  lines.push('  继续操作: Union(0,2), Union(4,6)')
  lines.push(...printState(uf2, N))
  lines.push('')

  uf2.union(1, 5)
  lines.push('  继续操作: Union(1,5)')
  lines.push(...printState(uf2, N))
  lines.push('')

  lines.push(`  回滚到快照位置 (${snap}):`)
  uf2.rollbackTo(snap)
  lines.push(...printState(uf2, N))
  lines.push('')

  // 6. 与普通并查集的对比
  lines.push('【第六步】与普通并查集的对比')
  lines.push('')
  lines.push('  普通并查集:')
  lines.push('    - 使用路径压缩 + 按秩合并')
  lines.push('    - 查询接近 O(1)（阿克曼函数的反函数）')
  lines.push('    - 不支持撤销')
  lines.push('')
  lines.push('  可撤销并查集:')
  lines.push('    - 只用按秩合并，不压缩路径')
  lines.push('    - 查询 O(log n)')
  lines.push('    - 支持 O(1) 撤销')
  lines.push('    - 支持快照回滚')
  lines.push('')
  lines.push('  核心权衡: 牺牲查询效率，换取撤销能力')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
