// 图 (Graph) 演示

type AdjList = Map<number, number[]>

function createGraph(): AdjList {
  const graph: AdjList = new Map()
  // 添加边: 无向图
  //     0 --- 1
  //     |   / |
  //     2 --- 3
  //          / \
  //         4   5
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4], [3, 5],
  ]
  for (const [u, v] of edges) {
    if (!graph.has(u)) graph.set(u, [])
    if (!graph.has(v)) graph.set(v, [])
    graph.get(u)!.push(v)
    graph.get(v)!.push(u)
  }
  // 排序邻居列表以保证输出稳定
  for (const neighbors of graph.values()) {
    neighbors.sort((a, b) => a - b)
  }
  return graph
}

function bfs(graph: AdjList, start: number): { order: number[]; steps: string[] } {
  const visited = new Set<number>([start])
  const queue: number[] = [start]
  const order: number[] = []
  const steps: string[] = []

  steps.push(`初始化: 将起始节点 ${start} 入队, visited = {${start}}`)

  while (queue.length > 0) {
    const node = queue.shift()!
    order.push(node)
    const neighbors = graph.get(node) || []
    const unvisited = neighbors.filter(n => !visited.has(n))
    steps.push(`出队 ${node}, 访问邻居 [${unvisited.join(', ')}], 入队 [${unvisited.join(', ')}]`)

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }

    if (queue.length > 0) {
      steps.push(`  队列: [${queue.join(', ')}], 已访问: {${[...visited].join(', ')}}`)
    }
  }

  return { order, steps }
}

function dfs(graph: AdjList, start: number): { order: number[]; steps: string[] } {
  const visited = new Set<number>()
  const order: number[] = []
  const steps: string[] = []

  function traverse(node: number, depth: number) {
    visited.add(node)
    order.push(node)
    const indent = '  '.repeat(depth)
    const neighbors = graph.get(node) || []
    steps.push(`${indent}访问节点 ${node}, 邻居: [${neighbors.filter(n => !visited.has(n)).join(', ')}]`)

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        steps.push(`${indent}  → 深入到节点 ${neighbor}`)
        traverse(neighbor, depth + 1)
        steps.push(`${indent}  ← 回溯到节点 ${node}`)
      }
    }
  }

  traverse(start, 0)
  return { order, steps }
}

function shortestPath(graph: AdjList, start: number, end: number): { path: number[]; distance: number } {
  const visited = new Set<number>([start])
  const queue: [number, number[]][] = [[start, [start]]]

  while (queue.length > 0) {
    const [node, path] = queue.shift()!
    if (node === end) return { path, distance: path.length - 1 }

    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push([neighbor, [...path, neighbor]])
      }
    }
  }

  return { path: [], distance: -1 }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('          图 (Graph) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 构建图
  lines.push('【第一步】构建无向图（邻接表）')
  lines.push('')
  lines.push('  图的结构:')
  lines.push('      0 --- 1')
  lines.push('      |   / |')
  lines.push('      2 --- 3')
  lines.push('           / \\')
  lines.push('          4   5')
  lines.push('')

  const graph = createGraph()
  lines.push('  邻接表:')
  for (const [node, neighbors] of [...graph.entries()].sort((a, b) => a[0] - b[0])) {
    lines.push(`    ${node} → [${neighbors.join(', ')}]`)
  }
  lines.push('')

  // 2. BFS 遍历
  lines.push('【第二步】广度优先搜索 (BFS)')
  lines.push('  从节点 0 开始，逐层扩展:')
  lines.push('')

  const bfsResult = bfs(graph, 0)
  for (const step of bfsResult.steps) {
    lines.push(`  ${step}`)
  }
  lines.push('')
  lines.push(`  BFS 遍历顺序: [${bfsResult.order.join(' → ')}]`)
  lines.push(`  特点: 先访问距离近的节点，逐层向外扩展`)
  lines.push('')

  // 3. DFS 遍历
  lines.push('【第三步】深度优先搜索 (DFS)')
  lines.push('  从节点 0 开始，深入探索:')
  lines.push('')

  const dfsResult = dfs(graph, 0)
  for (const step of dfsResult.steps) {
    lines.push(`  ${step}`)
  }
  lines.push('')
  lines.push(`  DFS 遍历顺序: [${dfsResult.order.join(' → ')}]`)
  lines.push(`  特点: 沿一条路径深入到底，再回溯探索其他分支`)
  lines.push('')

  // 4. 最短路径
  lines.push('【第四步】最短路径（无权图 BFS）')
  lines.push('')

  const pathPairs: [number, number][] = [[0, 4], [0, 5], [1, 5], [2, 4]]
  for (const [start, end] of pathPairs) {
    const result = shortestPath(graph, start, end)
    if (result.distance >= 0) {
      lines.push(`  ${start} → ${end}: 路径 [${result.path.join(' → ')}], 距离 ${result.distance}`)
    } else {
      lines.push(`  ${start} → ${end}: 不可达`)
    }
  }
  lines.push('')

  // 5. 图的基本信息
  lines.push('【第五步】图的基本信息')
  lines.push('')
  const vertices = graph.size
  let edgeCount = 0
  for (const neighbors of graph.values()) {
    edgeCount += neighbors.length
  }
  edgeCount /= 2  // 无向图每条边被计算两次
  lines.push(`  顶点数: ${vertices}`)
  lines.push(`  边数: ${edgeCount}`)
  lines.push(`  平均度数: ${(edgeCount * 2 / vertices).toFixed(1)}`)
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
