// 二分图 (Bipartite Graph) 演示

type AdjList = Map<number, number[]>

function createBipartiteGraph(): AdjList {
  const graph: AdjList = new Map()
  // 二分图示例: 工人-任务分配
  // 集合 U: {0, 1, 2}  集合 V: {3, 4, 5, 6}
  // 0 --- 3
  // | \   |
  // |  \  |
  // 1 --- 4 --- 2
  // |       \  /
  // 5        6
  const edges: [number, number][] = [
    [0, 3], [0, 4], [1, 4], [1, 5], [2, 4], [2, 6],
  ]
  for (const [u, v] of edges) {
    if (!graph.has(u)) graph.set(u, [])
    if (!graph.has(v)) graph.set(v, [])
    graph.get(u)!.push(v)
    graph.get(v)!.push(u)
  }
  for (const neighbors of graph.values()) {
    neighbors.sort((a, b) => a - b)
  }
  return graph
}

function createNonBipartiteGraph(): AdjList {
  const graph: AdjList = new Map()
  // 含奇环的图: 三角形 0-1-2-0
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 0], [1, 3],
  ]
  for (const [u, v] of edges) {
    if (!graph.has(u)) graph.set(u, [])
    if (!graph.has(v)) graph.set(v, [])
    graph.get(u)!.push(v)
    graph.get(v)!.push(u)
  }
  for (const neighbors of graph.values()) {
    neighbors.sort((a, b) => a - b)
  }
  return graph
}

function isBipartite(graph: AdjList): { result: boolean; colors: Map<number, number>; steps: string[] } {
  const color = new Map<number, number>()
  const steps: string[] = []

  for (const startNode of graph.keys()) {
    if (color.has(startNode)) continue

    const queue: number[] = [startNode]
    color.set(startNode, 0)
    steps.push(`从节点 ${startNode} 开始 BFS 染色, 颜色 = 0 (红)`)

    while (queue.length > 0) {
      const curr = queue.shift()!
      const currColor = color.get(curr)!
      const neighbors = graph.get(curr) || []

      for (const neighbor of neighbors) {
        if (!color.has(neighbor)) {
          const newColor = 1 - currColor
          color.set(neighbor, newColor)
          queue.push(neighbor)
          steps.push(`  节点 ${neighbor} 染色为 ${newColor} (${newColor === 0 ? '红' : '蓝'}), 邻居: ${curr}`)
        } else if (color.get(neighbor) === currColor) {
          steps.push(`  冲突! 节点 ${curr} 和 ${neighbor} 相邻且同色 (${currColor})`)
          return { result: false, colors: color, steps }
        }
      }
    }
  }

  steps.push('染色完成，未发现冲突，图是二分图！')
  return { result: true, colors: color, steps }
}

function maxMatching(graph: AdjList, uSet: number[]): { matchSize: number; matching: Map<number, number>; steps: string[] } {
  const match = new Map<number, number>()  // match[v] = u
  const steps: string[] = []

  function findAugmentingPath(u: number, visited: Set<number>): boolean {
    for (const v of graph.get(u) || []) {
      if (visited.has(v)) continue
      visited.add(v)

      if (!match.has(v)) {
        steps.push(`  找到增广路径终点 ${v} (未匹配), 匹配 ${u}-${v}`)
        match.set(v, u)
        return true
      } else {
        const matchedU = match.get(v)!
        steps.push(`  尝试 ${u}-${v}, 但 ${v} 已匹配给 ${matchedU}, 尝试从 ${matchedU} 找增广路径`)
        if (findAugmentingPath(matchedU, visited)) {
          match.set(v, u)
          steps.push(`  成功! 将 ${v} 重新匹配给 ${u}`)
          return true
        }
      }
    }
    return false
  }

  let result = 0
  for (const u of uSet) {
    steps.push(`\n尝试为节点 ${u} 寻找匹配:`)
    const visited = new Set<number>()
    if (findAugmentingPath(u, visited)) {
      result++
      steps.push(`  成功匹配! 当前匹配数: ${result}`)
    } else {
      steps.push(`  未找到增广路径, 节点 ${u} 无法匹配`)
    }
  }

  return { matchSize: result, matching: match, steps }
}

function koenigTheorem(matchSize: number, uSet: number[], vSet: number[]): string[] {
  const lines: string[] = []
  const totalVertices = uSet.length + vSet.length

  lines.push(`顶点总数: ${totalVertices}`)
  lines.push(`最大匹配数: ${matchSize}`)
  lines.push(`最小点覆盖数: ${matchSize} (König 定理: 最大匹配 = 最小点覆盖)`)
  lines.push(`最大独立集大小: ${totalVertices - matchSize} (= 顶点数 - 最大匹配数)`)
  lines.push(`最小边覆盖数: ${totalVertices - matchSize} (= 顶点数 - 最大匹配数)`)

  return lines
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('        二分图 (Bipartite Graph) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 二分图判定
  lines.push('【第一步】二分图判定 (2-染色法)')
  lines.push('')
  lines.push('  测试图 1 (二分图):')
  lines.push('    集合 U: {0, 1, 2}  集合 V: {3, 4, 5, 6}')
  lines.push('    边: 0-3, 0-4, 1-4, 1-5, 2-4, 2-6')
  lines.push('')

  const graph1 = createBipartiteGraph()
  const result1 = isBipartite(graph1)
  for (const step of result1.steps) {
    lines.push(`  ${step}`)
  }
  lines.push(`  结果: ${result1.result ? '是二分图 ✓' : '不是二分图 ✗'}`)
  lines.push('')

  // 2. 非二分图
  lines.push('  测试图 2 (含奇环):')
  lines.push('    三角形: 0-1, 1-2, 2-0, 额外边: 1-3')
  lines.push('')

  const graph2 = createNonBipartiteGraph()
  const result2 = isBipartite(graph2)
  for (const step of result2.steps) {
    lines.push(`  ${step}`)
  }
  lines.push(`  结果: ${result2.result ? '是二分图 ✓' : '不是二分图 ✗'}`)
  lines.push('')

  // 3. 最大匹配
  lines.push('【第二步】最大匹配 (匈牙利算法)')
  lines.push('')
  lines.push('  图: 集合 U = {0, 1, 2}, 集合 V = {3, 4, 5, 6}')
  lines.push('  边: 0-3, 0-4, 1-4, 1-5, 2-4, 2-6')
  lines.push('')

  const matchResult = maxMatching(graph1, [0, 1, 2])
  for (const step of matchResult.steps) {
    lines.push(`  ${step}`)
  }
  lines.push('')
  lines.push(`  最大匹配数: ${matchResult.matchSize}`)
  lines.push('  匹配方案:')
  for (const [v, u] of matchResult.matching) {
    lines.push(`    ${u} - ${v}`)
  }
  lines.push('')

  // 4. König 定理
  lines.push('【第三步】König 定理验证')
  lines.push('')
  const koenigLines = koenigTheorem(matchResult.matchSize, [0, 1, 2], [3, 4, 5, 6])
  for (const line of koenigLines) {
    lines.push(`  ${line}`)
  }
  lines.push('')

  // 5. 总结
  lines.push('【总结】')
  lines.push('')
  lines.push('  二分图核心知识点:')
  lines.push('    1. 二分图 = 顶点可分为两个不相交集合，同集合内无边')
  lines.push('    2. 等价条件: 不含奇数长度的环')
  lines.push('    3. 判定方法: BFS/DFS 2-染色法, O(V+E)')
  lines.push('    4. 最大匹配: 匈牙利算法 (增广路径), O(VE)')
  lines.push('    5. König 定理: 最大匹配 = 最小点覆盖')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
