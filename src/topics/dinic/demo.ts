interface Edge {
  from: number
  to: number
  capacity: number
  flow: number
}

interface DinicGraph {
  nodes: number
  edges: Edge[]
  adj: number[][]
}

function createGraph(nodes: number): DinicGraph {
  return {
    nodes,
    edges: [],
    adj: Array.from({ length: nodes }, () => []),
  }
}

function addEdge(graph: DinicGraph, from: number, to: number, capacity: number): void {
  const idx = graph.edges.length
  graph.edges.push({ from, to, capacity, flow: 0 })
  graph.edges.push({ from: to, to: from, capacity: 0, flow: 0 })
  graph.adj[from].push(idx)
  graph.adj[to].push(idx + 1)
}

function bfsLevel(graph: DinicGraph, source: number, sink: number): number[] {
  const level = new Array(graph.nodes).fill(-1)
  level[source] = 0
  const queue = [source]
  let head = 0
  while (head < queue.length) {
    const u = queue[head++]
    for (const idx of graph.adj[u]) {
      const e = graph.edges[idx]
      if (level[e.to] === -1 && e.capacity - e.flow > 0) {
        level[e.to] = level[u] + 1
        queue.push(e.to)
      }
    }
  }
  return level
}

function dfsBlockingFlow(
  graph: DinicGraph,
  u: number,
  sink: number,
  pushed: number,
  level: number[],
  ptr: number[]
): number {
  if (u === sink || pushed === 0) return pushed
  for (; ptr[u] < graph.adj[u].length; ptr[u]++) {
    const idx = graph.adj[u][ptr[u]]
    const e = graph.edges[idx]
    if (level[e.to] !== level[u] + 1 || e.capacity - e.flow <= 0) continue
    const tr = dfsBlockingFlow(graph, e.to, sink, Math.min(pushed, e.capacity - e.flow), level, ptr)
    if (tr > 0) {
      graph.edges[idx].flow += tr
      graph.edges[idx ^ 1].flow -= tr
      return tr
    }
  }
  return 0
}

function dinic(graph: DinicGraph, source: number, sink: number): number {
  let totalFlow = 0
  const output: string[] = []
  let iteration = 0

  while (true) {
    const level = bfsLevel(graph, source, sink)
    if (level[sink] === -1) break

    iteration++
    output.push(`\n--- 第 ${iteration} 轮迭代 ---`)
    output.push(`层次图: 汇点层数 = ${level[sink]}`)

    const ptr = new Array(graph.nodes).fill(0)
    let pushed: number
    let augmentCount = 0

    while ((pushed = dfsBlockingFlow(graph, source, sink, Infinity, level, ptr)) > 0) {
      totalFlow += pushed
      augmentCount++
    }

    output.push(`阻塞流中找到 ${augmentCount} 条增广路, 本轮增广量贡献到总流量`)
  }

  output.push(`\n最大流 = ${totalFlow}`)
  return totalFlow
}

export default function dinicDemo(): string {
  const output: string[] = []

  output.push('=== Dinic最大流算法演示 ===\n')

  // 示例1: 基础网络
  output.push('【示例1】基础网络流')
  output.push('节点: 0(源点) -> 1,2 -> 3(汇点)')
  output.push('边: 0->1(10), 0->2(10), 1->2(2), 1->3(8), 2->3(10)\n')

  const g1 = createGraph(4)
  addEdge(g1, 0, 1, 10)
  addEdge(g1, 0, 2, 10)
  addEdge(g1, 1, 2, 2)
  addEdge(g1, 1, 3, 8)
  addEdge(g1, 2, 3, 10)

  output.push('边列表:')
  output.push('  0 -> 1 : 容量 = 10')
  output.push('  0 -> 2 : 容量 = 10')
  output.push('  1 -> 2 : 容量 = 2')
  output.push('  1 -> 3 : 容量 = 8')
  output.push('  2 -> 3 : 容量 = 10')

  const flow1 = dinic(g1, 0, 3)
  output.push(`\n结果: 最大流 = ${flow1}`)

  // 展示残余网络
  output.push('\n残余网络边流量:')
  for (let i = 0; i < g1.edges.length; i += 2) {
    const e = g1.edges[i]
    if (e.capacity > 0) {
      output.push(`  ${e.from} -> ${e.to} : 流量 = ${e.flow}/${e.capacity}`)
    }
  }

  // 示例2: 复杂网络
  output.push('\n\n【示例2】复杂网络')
  output.push('节点: 0(源) -> 1,2,3 -> 4,5 -> 6(汇)')
  output.push('6个节点，8条边\n')

  const g2 = createGraph(7)
  addEdge(g2, 0, 1, 10)
  addEdge(g2, 0, 2, 8)
  addEdge(g2, 0, 3, 5)
  addEdge(g2, 1, 4, 7)
  addEdge(g2, 1, 5, 5)
  addEdge(g2, 2, 5, 10)
  addEdge(g2, 3, 5, 7)
  addEdge(g2, 4, 6, 10)
  addEdge(g2, 5, 6, 10)

  output.push('边列表:')
  output.push('  0 -> 1 : 容量 = 10')
  output.push('  0 -> 2 : 容量 = 8')
  output.push('  0 -> 3 : 容量 = 5')
  output.push('  1 -> 4 : 容量 = 7')
  output.push('  1 -> 5 : 容量 = 5')
  output.push('  2 -> 5 : 容量 = 10')
  output.push('  3 -> 5 : 容量 = 7')
  output.push('  4 -> 6 : 容量 = 10')
  output.push('  5 -> 6 : 容量 = 10')

  const flow2 = dinic(g2, 0, 6)
  output.push(`\n结果: 最大流 = ${flow2}`)

  output.push('\n残余网络边流量:')
  for (let i = 0; i < g2.edges.length; i += 2) {
    const e = g2.edges[i]
    if (e.capacity > 0) {
      output.push(`  ${e.from} -> ${e.to} : 流量 = ${e.flow}/${e.capacity}`)
    }
  }

  // 示例3: 二分图匹配
  output.push('\n\n【示例3】二分图最大匹配 (转化为最大流)')
  output.push('左侧节点: 1,2,3  右侧节点: 4,5,6')
  output.push('源点: 0, 汇点: 7')
  output.push('匹配边: 1->4, 1->5, 2->4, 3->5, 3->6')

  const g3 = createGraph(8)
  // 源点到左侧
  addEdge(g3, 0, 1, 1)
  addEdge(g3, 0, 2, 1)
  addEdge(g3, 0, 3, 1)
  // 匹配边
  addEdge(g3, 1, 4, 1)
  addEdge(g3, 1, 5, 1)
  addEdge(g3, 2, 4, 1)
  addEdge(g3, 3, 5, 1)
  addEdge(g3, 3, 6, 1)
  // 右侧到汇点
  addEdge(g3, 4, 7, 1)
  addEdge(g3, 5, 7, 1)
  addEdge(g3, 6, 7, 1)

  const flow3 = dinic(g3, 0, 7)
  output.push(`\n最大匹配数 = ${flow3}`)

  output.push('\n匹配结果:')
  for (let i = 0; i < g3.edges.length; i += 2) {
    const e = g3.edges[i]
    if (e.capacity > 0 && e.flow > 0 && e.from !== 0 && e.to !== 7) {
      output.push(`  左${e.from} 匹配 右${e.to}`)
    }
  }

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
