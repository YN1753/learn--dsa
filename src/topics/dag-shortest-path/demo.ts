interface Edge {
  to: number
  weight: number
}

function topologicalSort(graph: Map<number, Edge[]>, n: number): number[] {
  const inDegree = new Array(n).fill(0)
  for (const edges of graph.values()) {
    for (const e of edges) {
      inDegree[e.to]++
    }
  }

  const queue: number[] = []
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i)
  }

  const order: number[] = []
  while (queue.length > 0) {
    const u = queue.shift()!
    order.push(u)
    for (const e of graph.get(u) || []) {
      if (--inDegree[e.to] === 0) {
        queue.push(e.to)
      }
    }
  }
  return order
}

function dagShortestPath(
  graph: Map<number, Edge[]>,
  n: number,
  source: number
): { dist: number[]; prev: (number | null)[] } {
  const topoOrder = topologicalSort(graph, n)
  const dist = new Array(n).fill(Infinity)
  const prev: (number | null)[] = new Array(n).fill(null)
  dist[source] = 0

  for (const u of topoOrder) {
    if (dist[u] === Infinity) continue
    for (const e of graph.get(u) || []) {
      if (dist[u] + e.weight < dist[e.to]) {
        dist[e.to] = dist[u] + e.weight
        prev[e.to] = u
      }
    }
  }

  return { dist, prev }
}

function getPath(prev: (number | null)[], target: number): number[] {
  const path: number[] = []
  let current: number | null = target
  while (current !== null) {
    path.unshift(current)
    current = prev[current]
  }
  return path
}

export default function dagShortestPathDemo(): string {
  const output: string[] = []

  output.push('=== DAG最短路径演示 ===\n')

  // 构建示例图
  // 0 -> 1 (5), 0 -> 2 (3)
  // 1 -> 3 (6), 1 -> 2 (2)
  // 2 -> 3 (7), 2 -> 4 (4), 2 -> 5 (2)
  // 3 -> 4 (-1), 3 -> 5 (1)
  // 4 -> 5 (-2)
  const n = 6
  const graph = new Map<number, Edge[]>()
  for (let i = 0; i < n; i++) graph.set(i, [])

  const edges: [number, number, number][] = [
    [0, 1, 5], [0, 2, 3],
    [1, 2, 2], [1, 3, 6],
    [2, 3, 7], [2, 4, 4], [2, 5, 2],
    [3, 4, -1], [3, 5, 1],
    [4, 5, -2],
  ]

  for (const [u, v, w] of edges) {
    graph.get(u)!.push({ to: v, weight: w })
  }

  output.push('图结构（邻接表）：')
  const nodeNames = ['A', 'B', 'C', 'D', 'E', 'F']
  for (let i = 0; i < n; i++) {
    const edgeStr = graph.get(i)!
      .map(e => `${nodeNames[e.to]}(${e.weight})`)
      .join(', ')
    output.push(`  ${nodeNames[i]} -> ${edgeStr}`)
  }
  output.push('')

  // 拓扑排序
  const topoOrder = topologicalSort(graph, n)
  output.push(`拓扑排序结果: ${topoOrder.map(i => nodeNames[i]).join(' -> ')}\n`)

  // 逐步展示最短路径计算
  const source = 0
  output.push(`源点: ${nodeNames[source]}\n`)

  const dist = new Array(n).fill(Infinity)
  const prev: (number | null)[] = new Array(n).fill(null)
  dist[source] = 0

  output.push('逐步松弛过程：')
  for (const u of topoOrder) {
    if (dist[u] === Infinity) {
      output.push(`  节点 ${nodeNames[u]}: 不可达，跳过`)
      continue
    }

    output.push(`  处理节点 ${nodeNames[u]} (当前距离: ${dist[u]})`)
    for (const e of graph.get(u) || []) {
      const newDist = dist[u] + e.weight
      if (newDist < dist[e.to]) {
        const oldDist = dist[e.to] === Infinity ? '∞' : String(dist[e.to])
        output.push(`    松弛边 ${nodeNames[u]}->${nodeNames[e.to]}: ${oldDist} -> ${newDist}`)
        dist[e.to] = newDist
        prev[e.to] = u
      } else {
        output.push(`    边 ${nodeNames[u]}->${nodeNames[e.to]}: 无需更新 (当前: ${dist[e.to]}, 经过: ${newDist})`)
      }
    }
  }

  output.push('')
  output.push('最终最短距离：')
  for (let i = 0; i < n; i++) {
    const d = dist[i] === Infinity ? '∞' : String(dist[i])
    output.push(`  ${nodeNames[source]} -> ${nodeNames[i]}: ${d}`)
  }

  output.push('')
  output.push('最短路径：')
  for (let i = 0; i < n; i++) {
    if (i === source) continue
    if (dist[i] === Infinity) {
      output.push(`  ${nodeNames[source]} -> ${nodeNames[i]}: 不可达`)
    } else {
      const path = getPath(prev, i)
      output.push(`  ${nodeNames[source]} -> ${nodeNames[i]}: ${path.map(j => nodeNames[j]).join(' -> ')} (距离: ${dist[i]})`)
    }
  }

  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
