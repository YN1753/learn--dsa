function hopcroftKarpDemo(): string {
  const output: string[] = []

  output.push('=== Hopcroft-Karp 最大匹配算法演示 ===\n')

  // 构建二分图
  const uSet = [0, 1, 2, 3]  // 集合 U
  const vSet = [4, 5, 6, 7]  // 集合 V
  const edges: [number, number][] = [
    [0, 4], [0, 5],
    [1, 5], [1, 6],
    [2, 5], [2, 7],
    [3, 6],
  ]

  output.push('二分图结构:')
  output.push('  集合 U: {A, B, C, D} (编号 0-3)')
  output.push('  集合 V: {1, 2, 3, 4} (编号 4-7)')
  output.push('  边: A-1, A-2, B-2, B-3, C-2, C-4, D-3')
  output.push('')

  // 构建邻接表
  const adjList = new Map<number, number[]>()
  for (const u of uSet) adjList.set(u, [])
  for (const v of vSet) adjList.set(v, [])
  for (const [u, v] of edges) {
    adjList.get(u)!.push(v)
    adjList.get(v)!.push(u)
  }

  // 匹配数组
  const pairU = new Map<number, number | null>()
  const pairV = new Map<number, number | null>()
  const dist = new Map<number, number>()
  for (const u of uSet) pairU.set(u, null)
  for (const v of vSet) pairV.set(v, null)

  const nodeNames = new Map([
    [0, 'A'], [1, 'B'], [2, 'C'], [3, 'D'],
    [4, '1'], [5, '2'], [6, '3'], [7, '4'],
  ])

  function bfs(): boolean {
    const queue: number[] = []
    for (const u of uSet) {
      if (pairU.get(u) === null) {
        dist.set(u, 0)
        queue.push(u)
      } else {
        dist.set(u, Infinity)
      }
    }
    let found = false
    while (queue.length > 0) {
      const u = queue.shift()!
      for (const v of adjList.get(u) || []) {
        const matchedU = pairV.get(v) ?? null
        if (matchedU === null) {
          found = true
        } else if (dist.get(matchedU) === Infinity) {
          dist.set(matchedU, dist.get(u)! + 1)
          queue.push(matchedU)
        }
      }
    }
    return found
  }

  function dfs(u: number): boolean {
    for (const v of adjList.get(u) || []) {
      const matchedU = pairV.get(v) ?? null
      if (matchedU === null || (dist.get(matchedU) === dist.get(u)! + 1 && dfs(matchedU))) {
        pairU.set(u, v)
        pairV.set(v, u)
        return true
      }
    }
    dist.set(u, Infinity)
    return false
  }

  let matching = 0
  let iteration = 0

  while (bfs()) {
    iteration++
    output.push(`--- 第 ${iteration} 轮 BFS-DFS 迭代 ---`)

    // 显示 BFS 分层结果
    const layers = new Map<number, number[]>()
    for (const u of uSet) {
      const d = dist.get(u)!
      if (d !== Infinity) {
        if (!layers.has(d)) layers.set(d, [])
        layers.get(d)!.push(u)
      }
    }
    output.push('BFS 分层结果:')
    for (const [level, nodes] of [...layers.entries()].sort((a, b) => a[0] - b[0])) {
      const names = nodes.map(n => nodeNames.get(n) || String(n))
      output.push(`  第 ${level} 层: {${names.join(', ')}}`)
    }

    // DFS 找增广路
    let roundMatch = 0
    for (const u of uSet) {
      if (pairU.get(u) === null) {
        if (dfs(u)) {
          roundMatch++
          matching++
        }
      }
    }

    output.push(`本轮找到 ${roundMatch} 条增广路`)
    output.push(`当前匹配数: ${matching}`)
    output.push('当前匹配边:')
    for (const [u, v] of pairU.entries()) {
      if (v !== null) {
        output.push(`  ${nodeNames.get(u)} - ${nodeNames.get(v)}`)
      }
    }
    output.push('')
  }

  output.push('=== 算法结束 ===')
  output.push(`最大匹配数: ${matching}`)
  output.push('最终匹配方案:')
  for (const [u, v] of pairU.entries()) {
    if (v !== null) {
      output.push(`  ${nodeNames.get(u)} 匹配 ${nodeNames.get(v)}`)
    }
  }
  output.push('')
  output.push('分析:')
  output.push('  - 共 4 个 U 节点，4 个 V 节点，7 条边')
  output.push('  - 最大匹配数为 4（完美匹配）')
  output.push('  - 算法通过 BFS 分层 + DFS 增广，高效地找到了最大匹配')
  output.push('  - 时间复杂度 O(E * sqrt(V)) = O(7 * 2) = O(14)')

  return output.join('\n')
}

export default hopcroftKarpDemo
