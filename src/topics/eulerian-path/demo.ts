// 欧拉路径 (Eulerian Path) - 存在性判断与 Hierholzer 算法演示

interface Graph {
  vertices: number
  adj: Map<number, number[]>
  edges: [number, number][]
}

function createGraph(): Graph {
  // 创建一个包含欧拉回路的图
  // 0 - 1 - 2
  // |   |   |
  // 3 - 4 - 5
  const vertices = 6
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 5], [5, 4], [4, 3], [3, 0], [1, 4]
  ]

  const adj = new Map<number, number[]>()
  for (let i = 0; i < vertices; i++) adj.set(i, [])
  for (const [u, v] of edges) {
    adj.get(u)!.push(v)
    adj.get(v)!.push(u)
  }

  return { vertices, adj, edges }
}

function createPathGraph(): Graph {
  // 创建一个有欧拉路径但无欧拉回路的图
  // 0 - 1 - 2 - 3
  //     |       |
  //     4 - 5 - 6
  const vertices = 7
  const edges: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 6], [6, 5], [5, 4], [4, 1]
  ]

  const adj = new Map<number, number[]>()
  for (let i = 0; i < vertices; i++) adj.set(i, [])
  for (const [u, v] of edges) {
    adj.get(u)!.push(v)
    adj.get(v)!.push(u)
  }

  return { vertices, adj, edges }
}

function getDegrees(graph: Graph): Map<number, number> {
  const degrees = new Map<number, number>()
  for (let i = 0; i < graph.vertices; i++) {
    degrees.set(i, graph.adj.get(i)!.length)
  }
  return degrees
}

function findOddDegreeVertices(graph: Graph): number[] {
  const degrees = getDegrees(graph)
  const oddVertices: number[] = []
  for (const [v, d] of degrees) {
    if (d % 2 !== 0) oddVertices.push(v)
  }
  return oddVertices
}

function isConnected(graph: Graph): boolean {
  // 检查非零度顶点是否连通
  const visited = new Set<number>()
  let start = -1
  for (let i = 0; i < graph.vertices; i++) {
    if (graph.adj.get(i)!.length > 0) {
      start = i
      break
    }
  }
  if (start === -1) return true // 无边的图视为连通

  const stack = [start]
  visited.add(start)
  while (stack.length > 0) {
    const u = stack.pop()!
    for (const v of graph.adj.get(u)!) {
      if (!visited.has(v)) {
        visited.add(v)
        stack.push(v)
      }
    }
  }

  for (let i = 0; i < graph.vertices; i++) {
    if (graph.adj.get(i)!.length > 0 && !visited.has(i)) return false
  }
  return true
}

function checkEulerian(graph: Graph): {
  type: string
  reason: string
  startVertex: number
} {
  const connected = isConnected(graph)
  if (!connected) {
    return { type: '无', reason: '图不连通', startVertex: -1 }
  }

  const oddVertices = findOddDegreeVertices(graph)

  if (oddVertices.length === 0) {
    // 找一个有边的顶点作为起点
    let start = 0
    for (let i = 0; i < graph.vertices; i++) {
      if (graph.adj.get(i)!.length > 0) { start = i; break }
    }
    return { type: '欧拉回路', reason: '所有顶点度数均为偶数', startVertex: start }
  } else if (oddVertices.length === 2) {
    return {
      type: '欧拉路径',
      reason: `恰好两个奇数度顶点: ${oddVertices[0]} 和 ${oddVertices[1]}`,
      startVertex: oddVertices[0]
    }
  } else {
    return {
      type: '无',
      reason: `有 ${oddVertices.length} 个奇数度顶点: [${oddVertices.join(', ')}]，需要 0 或 2 个`,
      startVertex: -1
    }
  }
}

function hierholzer(graph: Graph, start: number): number[] {
  // Hierholzer 算法：DFS + 回路拼接
  const adjCopy = new Map<number, number[]>()
  for (const [k, v] of graph.adj) {
    adjCopy.set(k, [...v])
  }

  const path: number[] = []
  const stack: number[] = [start]

  while (stack.length > 0) {
    const v = stack[stack.length - 1]
    const neighbors = adjCopy.get(v)!

    if (neighbors.length === 0) {
      // 没有未访问的边了，加入路径
      path.push(stack.pop()!)
    } else {
      // 贪心选择一条边
      const u = neighbors.pop()!
      // 移除反向边
      const revNeighbors = adjCopy.get(u)!
      const idx = revNeighbors.indexOf(v)
      if (idx !== -1) revNeighbors.splice(idx, 1)
      stack.push(u)
    }
  }

  return path // 注意：path 是逆序的
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('   欧拉路径 (Eulerian Path) 演示')
  lines.push('   算法: Hierholzer')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // ── 图 1：欧拉回路 ──
  const graph1 = createGraph()
  const degrees1 = getDegrees(graph1)

  lines.push('【图 1】6 个顶点，7 条边')
  lines.push('')
  lines.push('  0 - 1 - 2')
  lines.push('  |   |   |')
  lines.push('  3 - 4 - 5')
  lines.push('')

  lines.push('  各顶点度数:')
  for (let i = 0; i < graph1.vertices; i++) {
    const d = degrees1.get(i)!
    const marker = d % 2 !== 0 ? ' (奇数!)' : ''
    lines.push(`    顶点 ${i}: 度数 ${d}${marker}`)
  }
  lines.push('')

  const result1 = checkEulerian(graph1)
  lines.push(`  存在性判断: ${result1.type}`)
  lines.push(`  原因: ${result1.reason}`)
  lines.push('')

  if (result1.type !== '无') {
    const path = hierholzer(graph1, result1.startVertex)
    lines.push(`  Hierholzer 算法 (起点: ${result1.startVertex}):`)
    lines.push(`  欧拉回路: ${path.join(' → ')}`)
    lines.push(`  路径长度: ${path.length} (含 ${path.length - 1} 条边)`)
    lines.push('')

    // 验证：检查每条边是否恰好经过一次
    lines.push('  验证: 检查每条边是否恰好经过一次...')
    const usedEdges = new Set<string>()
    let valid = true
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i]
      const v = path[i + 1]
      const key = `${Math.min(u, v)}-${Math.max(u, v)}`
      if (usedEdges.has(key)) {
        lines.push(`    ✗ 边 ${key} 被重复使用!`)
        valid = false
      }
      usedEdges.add(key)
    }
    if (valid && usedEdges.size === graph1.edges.length) {
      lines.push(`    ✓ 所有 ${usedEdges.size} 条边恰好经过一次`)
    } else if (valid) {
      lines.push(`    ✗ 只经过了 ${usedEdges.size}/${graph1.edges.length} 条边`)
    }
  }

  lines.push('')

  // ── 图 2：欧拉路径 ──
  lines.push('───────────────────────────────────────')
  lines.push('')

  const graph2 = createPathGraph()
  const degrees2 = getDegrees(graph2)

  lines.push('【图 2】7 个顶点，7 条边')
  lines.push('')
  lines.push('  0 - 1 - 2 - 3')
  lines.push('      |       |')
  lines.push('      4 - 5 - 6')
  lines.push('')

  lines.push('  各顶点度数:')
  for (let i = 0; i < graph2.vertices; i++) {
    const d = degrees2.get(i)!
    const marker = d % 2 !== 0 ? ' (奇数!)' : ''
    lines.push(`    顶点 ${i}: 度数 ${d}${marker}`)
  }
  lines.push('')

  const result2 = checkEulerian(graph2)
  lines.push(`  存在性判断: ${result2.type}`)
  lines.push(`  原因: ${result2.reason}`)
  lines.push('')

  if (result2.type !== '无') {
    const path = hierholzer(graph2, result2.startVertex)
    lines.push(`  Hierholzer 算法 (起点: ${result2.startVertex}):`)
    lines.push(`  欧拉路径: ${path.join(' → ')}`)
    lines.push(`  路径长度: ${path.length} (含 ${path.length - 1} 条边)`)
    lines.push('')

    // 验证
    lines.push('  验证: 检查每条边是否恰好经过一次...')
    const usedEdges = new Set<string>()
    let valid = true
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i]
      const v = path[i + 1]
      const key = `${Math.min(u, v)}-${Math.max(u, v)}`
      if (usedEdges.has(key)) {
        lines.push(`    ✗ 边 ${key} 被重复使用!`)
        valid = false
      }
      usedEdges.add(key)
    }
    if (valid && usedEdges.size === graph2.edges.length) {
      lines.push(`    ✓ 所有 ${usedEdges.size} 条边恰好经过一次`)
    }
  }

  lines.push('')
  lines.push('───────────────────────────────────────')
  lines.push('')

  // ── 存在性条件总结 ──
  lines.push('【存在性条件总结】')
  lines.push('')
  lines.push('  无向图:')
  lines.push('    • 欧拉回路: 连通 + 所有顶点度数为偶数')
  lines.push('    • 欧拉路径: 连通 + 恰好 0 或 2 个奇数度顶点')
  lines.push('    • 不存在:   不连通 或 奇数度顶点数 > 2')
  lines.push('')
  lines.push('  有向图:')
  lines.push('    • 欧拉回路: 弱连通 + 所有顶点入度 = 出度')
  lines.push('    • 欧拉路径: 弱连通 + 恰好 1 个顶点出度 = 入度+1 (起点)')
  lines.push('              + 恰好 1 个顶点入度 = 出度+1 (终点)')
  lines.push('              + 其余顶点入度 = 出度')
  lines.push('')

  // ── 复杂度总结 ──
  lines.push('【算法复杂度对比】')
  lines.push('')
  lines.push('  ┌──────────────────┬──────────┬───────────────────────┐')
  lines.push('  │      算法        │ 时间复杂度│        说明           │')
  lines.push('  ├──────────────────┼──────────┼───────────────────────┤')
  lines.push('  │  Fleury          │ O(E²)    │ 每次删边后检查是否为桥│')
  lines.push('  │  Hierholzer      │ O(E)     │ DFS + 回路拼接        │')
  lines.push('  └──────────────────┴──────────┴───────────────────────┘')
  lines.push('')
  lines.push('  Hierholzer 算法每条边只访问一次，是求欧拉路径的最优算法。')
  lines.push('')
  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
