// 最小费用最大流 (Min-Cost Max-Flow) - 连续最短路径算法演示

interface CostEdge {
  from: string
  to: string
  capacity: number
  cost: number
  flow: number
}

interface CostNetwork {
  nodes: string[]
  edges: CostEdge[]
  source: string
  sink: string
}

function createNetwork(): CostNetwork {
  const nodes = ['s', 'A', 'B', 'C', 't']
  const edges: CostEdge[] = [
    { from: 's', to: 'A', capacity: 3, cost: 1, flow: 0 },
    { from: 's', to: 'B', capacity: 3, cost: 5, flow: 0 },
    { from: 'A', to: 'B', capacity: 2, cost: 1, flow: 0 },
    { from: 'A', to: 'C', capacity: 2, cost: 2, flow: 0 },
    { from: 'B', to: 'C', capacity: 2, cost: 1, flow: 0 },
    { from: 'B', to: 't', capacity: 3, cost: 3, flow: 0 },
    { from: 'C', to: 't', capacity: 4, cost: 1, flow: 0 },
  ]
  return { nodes, edges, source: 's', sink: 't' }
}

interface SPFAPath {
  path: string[]
  pathEdges: { from: string; to: string; isReverse: boolean }[]
  totalCost: number
  bottleneck: number
}

function buildResidualAdj(edges: CostEdge[]): Map<string, { to: string; residual: number; cost: number; isReverse: boolean; from: string }[]> {
  const adj = new Map<string, { to: string; residual: number; cost: number; isReverse: boolean; from: string }[]>()
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, [])
    if (!adj.has(e.to)) adj.set(e.to, [])
    const residual = e.capacity - e.flow
    if (residual > 0) {
      adj.get(e.from)!.push({ to: e.to, residual, cost: e.cost, isReverse: false, from: e.from })
    }
    if (e.flow > 0) {
      adj.get(e.to)!.push({ to: e.from, residual: e.flow, cost: -e.cost, isReverse: true, from: e.to })
    }
  }
  return adj
}

function spfaFindPath(
  edges: CostEdge[],
  source: string,
  sink: string,
  nodes: string[]
): SPFAPath | null {
  const adj = buildResidualAdj(edges)

  const dist = new Map<string, number>()
  const parentMap = new Map<string, { node: string; residual: number; cost: number; isReverse: boolean }>()
  const inQueue = new Map<string, boolean>()

  for (const v of nodes) {
    dist.set(v, Infinity)
    inQueue.set(v, false)
  }
  dist.set(source, 0)

  const queue: string[] = [source]
  inQueue.set(source, true)

  while (queue.length > 0) {
    const u = queue.shift()!
    inQueue.set(u, false)

    for (const edge of adj.get(u) || []) {
      const newDist = dist.get(u)! + edge.cost
      if (newDist < dist.get(edge.to)!) {
        dist.set(edge.to, newDist)
        parentMap.set(edge.to, { node: u, residual: edge.residual, cost: edge.cost, isReverse: edge.isReverse })
        if (!inQueue.get(edge.to)) {
          queue.push(edge.to)
          inQueue.set(edge.to, true)
        }
      }
    }
  }

  if (dist.get(sink) === Infinity) return null

  // 回溯路径
  const path: string[] = []
  const pathEdges: { from: string; to: string; isReverse: boolean }[] = []
  let current = sink
  let bottleneck = Infinity

  while (current !== source) {
    const p = parentMap.get(current)!
    bottleneck = Math.min(bottleneck, p.residual)
    path.unshift(current)
    pathEdges.unshift({ from: p.node, to: current, isReverse: p.isReverse })
    current = p.node
  }
  path.unshift(source)

  const totalCost = dist.get(sink)!

  return { path, pathEdges, totalCost, bottleneck }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('=========================================')
  lines.push('  最小费用最大流 (MCMF) 演示')
  lines.push('  算法: 连续最短路径 (SPFA)')
  lines.push('=========================================')
  lines.push('')

  const network = createNetwork()

  // 显示网络结构
  lines.push('【第一步】构建费用流网络')
  lines.push('')
  lines.push('  节点: s (源点), A, B, C, t (汇点)')
  lines.push('  边及属性 (容量, 费用):')
  for (const e of network.edges) {
    lines.push(`    ${e.from} -> ${e.to}  容量: ${e.capacity}, 单位费用: ${e.cost}`)
  }
  lines.push('')

  lines.push('【第二步】初始状态')
  lines.push('')
  lines.push('  所有流量初始化为 0')
  lines.push('  总流量 = 0, 总费用 = 0')
  lines.push('')

  // 执行连续最短路径算法
  let totalFlow = 0
  let totalCost = 0
  let round = 0

  while (true) {
    const result = spfaFindPath(network.edges, network.source, network.sink, network.nodes)
    if (!result) break

    round++
    const { path, pathEdges, totalCost: pathCost, bottleneck } = result
    totalFlow += bottleneck
    totalCost += bottleneck * pathCost

    lines.push(`【第${round + 2}步】增广 #${round} - 寻找费用最短路径`)
    lines.push('')
    lines.push(`  SPFA 找到最短路径: ${path.join(' -> ')}`)
    lines.push(`  路径单位费用: ${pathCost}`)
    lines.push(`  瓶颈容量: ${bottleneck}`)
    lines.push(`  本轮增广流量: ${bottleneck}`)
    lines.push(`  本轮费用增量: ${bottleneck} x ${pathCost} = ${bottleneck * pathCost}`)
    lines.push('')

    // 更新流量
    lines.push('  更新残余图:')
    for (const { from, to, isReverse } of pathEdges) {
      if (!isReverse) {
        const edge = network.edges.find(e => e.from === from && e.to === to)!
        const oldFlow = edge.flow
        edge.flow += bottleneck
        lines.push(`    正向 ${from} -> ${to}: 流量 ${oldFlow} -> ${edge.flow} (残余容量 ${edge.capacity - edge.flow})`)
      } else {
        const edge = network.edges.find(e => e.from === to && e.to === from)!
        const oldFlow = edge.flow
        edge.flow -= bottleneck
        lines.push(`    反向 ${from} -> ${to}: 退流, ${to}->${from} 流量 ${oldFlow} -> ${edge.flow}`)
      }
    }
    lines.push('')

    lines.push('  当前各边状态:')
    for (const e of network.edges) {
      if (e.capacity > 0) {
        lines.push(`    ${e.from} -> ${e.to}: 流量 ${e.flow}/${e.capacity}, 费用 ${e.cost}`)
      }
    }
    lines.push(`  当前总流量: ${totalFlow}, 当前总费用: ${totalCost}`)
    lines.push('')
  }

  // 最终结果
  lines.push('【最终结果】')
  lines.push('')
  lines.push(`  最大流 = ${totalFlow}`)
  lines.push(`  最小费用 = ${totalCost}`)
  lines.push('')
  lines.push('  最终各边流量:')
  for (const e of network.edges) {
    if (e.flow > 0) {
      lines.push(`    ${e.from} -> ${e.to}: ${e.flow}/${e.capacity}, 费用 ${e.cost}, 边费用贡献 ${e.flow * e.cost}`)
    }
  }
  lines.push('')

  // 验证
  let sourceOut = 0
  let sinkIn = 0
  for (const e of network.edges) {
    if (e.from === network.source) sourceOut += e.flow
    if (e.to === network.sink) sinkIn += e.flow
  }
  lines.push(`  验证: 源点流出 = ${sourceOut}, 汇点流入 = ${sinkIn}, 相等 = ${sourceOut === sinkIn ? '是' : '否'}`)
  lines.push('')

  // 复杂度分析
  lines.push('【复杂度分析】')
  lines.push('')
  lines.push('  +---------------------------+------------------+')
  lines.push('  |          算法             |    时间复杂度    |')
  lines.push('  +---------------------------+------------------+')
  lines.push('  | 连续最短路径 (SPFA)       | O(V*E*max_flow)  |')
  lines.push('  | 连续最短路径 (Dijkstra+势) | O(V*logV*max_flow)|')
  lines.push('  | Primal-Dual 算法          | O(V^2*E*logV)    |')
  lines.push('  +---------------------------+------------------+')
  lines.push('')

  lines.push('=========================================')
  lines.push('  演示完成！')
  lines.push('=========================================')

  return lines.join('\n')
}
