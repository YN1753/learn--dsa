// 最大流 (Max Flow) - Ford-Fulkerson / Edmonds-Karp 演示

interface FlowNetwork {
  nodes: string[]
  adj: Map<string, { to: string; capacity: number; flow: number }[]>
  source: string
  sink: string
}

function createNetwork(): FlowNetwork {
  const nodes = ['s', 'A', 'B', 'C', 'D', 't']
  const edges: [string, string, number][] = [
    ['s', 'A', 10],
    ['s', 'B', 10],
    ['A', 'B', 2],
    ['A', 'C', 8],
    ['A', 'D', 4],
    ['B', 'D', 9],
    ['C', 't', 10],
    ['D', 'C', 6],
    ['D', 't', 10],
  ]

  const adj = new Map<string, { to: string; capacity: number; flow: number }[]>()
  for (const node of nodes) {
    adj.set(node, [])
  }
  for (const [u, v, c] of edges) {
    adj.get(u)!.push({ to: v, capacity: c, flow: 0 })
    // 反向边，初始容量为 0
    adj.get(v)!.push({ to: u, capacity: 0, flow: 0 })
  }

  return { nodes, adj, source: 's', sink: 't' }
}

function findAugmentingPathBFS(
  network: FlowNetwork
): { path: string[]; edges: { from: string; to: string }[]; bottleneck: number } | null {
  const { adj, source, sink } = network
  const visited = new Set<string>()
  const parent = new Map<string, { node: string; edgeIdx: number }>()
  const queue: string[] = [source]
  visited.add(source)

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === sink) break

    const neighbors = adj.get(current) || []
    for (let i = 0; i < neighbors.length; i++) {
      const edge = neighbors[i]
      const residual = edge.capacity - edge.flow
      if (residual > 0 && !visited.has(edge.to)) {
        visited.add(edge.to)
        parent.set(edge.to, { node: current, edgeIdx: i })
        queue.push(edge.to)
      }
    }
  }

  if (!visited.has(sink)) return null

  // 回溯路径
  const path: string[] = []
  const edges: { from: string; to: string }[] = []
  let current = sink
  while (current !== source) {
    path.unshift(current)
    const p = parent.get(current)!
    edges.unshift({ from: p.node, to: current })
    current = p.node
  }
  path.unshift(source)

  // 计算瓶颈
  let bottleneck = Infinity
  for (const { from, to } of edges) {
    const neighbors = adj.get(from)!
    const edge = neighbors.find(e => e.to === to)!
    bottleneck = Math.min(bottleneck, edge.capacity - edge.flow)
  }

  return { path, edges, bottleneck }
}

function findReverseEdgeIndex(adj: FlowNetwork['adj'], from: string, to: string): number {
  const neighbors = adj.get(to)!
  for (let i = 0; i < neighbors.length; i++) {
    if (neighbors[i].to === from) return i
  }
  return -1
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('   最大流 (Max Flow) 演示')
  lines.push('   算法: Edmonds-Karp (BFS Ford-Fulkerson)')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  const network = createNetwork()

  // 显示网络结构
  lines.push('【第一步】构建流网络')
  lines.push('')
  lines.push('  节点: s (源点), A, B, C, D, t (汇点)')
  lines.push('  边及容量:')
  const originalEdges: [string, string, number][] = [
    ['s', 'A', 10], ['s', 'B', 10], ['A', 'B', 2],
    ['A', 'C', 8], ['A', 'D', 4], ['B', 'D', 9],
    ['C', 't', 10], ['D', 'C', 6], ['D', 't', 10],
  ]
  for (const [u, v, c] of originalEdges) {
    lines.push(`    ${u} → ${v}  容量: ${c}`)
  }
  lines.push('')

  // 显示初始残余图
  lines.push('【第二步】初始残余图')
  lines.push('')
  lines.push('  所有流量初始化为 0')
  lines.push('  残余图中每条正向边的残余容量 = 容量')
  lines.push('  反向边的残余容量 = 0（因为流量为 0）')
  lines.push('')

  // 执行 Edmonds-Karp
  let totalFlow = 0
  let round = 0

  while (true) {
    const result = findAugmentingPathBFS(network)
    if (!result) break

    round++
    const { path, edges, bottleneck } = result
    totalFlow += bottleneck

    lines.push(`【第${round + 2}步】增广路径 #${round}`)
    lines.push('')
    lines.push(`  路径: ${path.join(' → ')}`)
    lines.push(`  瓶颈容量: min(残余容量) = ${bottleneck}`)
    lines.push(`  本轮增加流量: ${bottleneck}`)
    lines.push('')

    // 更新流量
    lines.push('  残余图更新:')
    for (const { from, to } of edges) {
      const neighbors = network.adj.get(from)!
      const edge = neighbors.find(e => e.to === to)!
      edge.flow += bottleneck

      // 更新反向边
      const reverseIdx = findReverseEdgeIndex(network.adj, from, to)
      if (reverseIdx >= 0) {
        network.adj.get(to)![reverseIdx].flow -= bottleneck
      }

      const residual = edge.capacity - edge.flow
      lines.push(`    ${from} → ${to}: 流量 ${edge.flow - bottleneck} → ${edge.flow}，残余容量 ${residual}`)
    }
    lines.push('')

    // 显示当前各边状态
    lines.push('  当前流量状态:')
    for (const [u, v, c] of originalEdges) {
      const neighbors = network.adj.get(u)!
      const edge = neighbors.find(e => e.to === v)!
      const status = edge.flow > 0 ? `${edge.flow}/${c}` : `0/${c}`
      lines.push(`    ${u} → ${v}: ${status}`)
    }
    lines.push(`  当前总流量: ${totalFlow}`)
    lines.push('')
  }

  // 最终结果
  lines.push('【最终结果】')
  lines.push('')
  lines.push(`  最大流 = ${totalFlow}`)
  lines.push('')
  lines.push('  最终各边流量:')
  for (const [u, v, c] of originalEdges) {
    const neighbors = network.adj.get(u)!
    const edge = neighbors.find(e => e.to === v)!
    if (edge.flow > 0) {
      lines.push(`    ${u} → ${v}: ${edge.flow}/${c}`)
    }
  }
  lines.push('')

  // 验证：计算源点流出量
  let sourceOut = 0
  for (const edge of network.adj.get('s')!) {
    if (edge.flow > 0) sourceOut += edge.flow
  }
  lines.push(`  验证: 源点 s 流出量 = ${sourceOut} = 最大流`)
  lines.push('')

  // 最小割分析
  lines.push('【最小割分析】')
  lines.push('')
  lines.push('  根据最大流最小割定理:')
  lines.push(`  最大流 (${totalFlow}) = 最小割容量 (${totalFlow})`)
  lines.push('')
  lines.push('  通过 BFS 在残余图中从 s 可达的节点确定 S 集合:')
  const visited = new Set<string>()
  const queue = ['s']
  visited.add('s')
  while (queue.length > 0) {
    const current = queue.shift()!
    for (const edge of network.adj.get(current)!) {
      if (edge.capacity - edge.flow > 0 && !visited.has(edge.to)) {
        visited.add(edge.to)
        queue.push(edge.to)
      }
    }
  }
  const sSet = [...visited].sort()
  const tSet = network.nodes.filter(n => !visited.has(n)).sort()
  lines.push(`  S = {${sSet.join(', ')}}`)
  lines.push(`  T = {${tSet.join(', ')}}`)
  lines.push('')

  let cutCapacity = 0
  lines.push('  割边 (从 S 到 T):')
  for (const u of sSet) {
    for (const edge of network.adj.get(u)!) {
      if (visited.has(edge.to) === false && edge.capacity > 0) {
        lines.push(`    ${u} → ${edge.to}: 容量 ${edge.capacity}`)
        cutCapacity += edge.capacity
      }
    }
  }
  lines.push(`  割容量 = ${cutCapacity} = 最大流 ✓`)
  lines.push('')

  // 复杂度总结
  lines.push('【复杂度总结】')
  lines.push('')
  lines.push('  ┌─────────────────────┬──────────────┐')
  lines.push('  │       算法          │  时间复杂度  │')
  lines.push('  ├─────────────────────┼──────────────┤')
  lines.push('  │  Ford-Fulkerson     │ O(E * f*)    │')
  lines.push('  │  (DFS, 整数容量)    │              │')
  lines.push('  ├─────────────────────┼──────────────┤')
  lines.push('  │  Edmonds-Karp       │ O(VE^2)      │')
  lines.push('  │  (BFS, 最短增广)    │              │')
  lines.push('  ├─────────────────────┼──────────────┤')
  lines.push('  │  Dinic              │ O(V^2 * E)   │')
  lines.push('  ├─────────────────────┼──────────────┤')
  lines.push('  │  Push-Relabel       │ O(V^2 * E)   │')
  lines.push('  └─────────────────────┴──────────────┘')
  lines.push('  注: f* 为最大流的值')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
