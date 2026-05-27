const INF = Infinity

interface Edge {
  u: number
  v: number
  w: number
}

interface BellmanStep {
  round: number
  edgeIdx: number
  u: number
  v: number
  w: number
  dist: number[]
  updated: boolean
  oldValue: number
  newValue: number
  description: string
}

export default function bellmanFordDemo(): string {
  const result: string[] = []

  // 创建一个 5 个顶点的有向加权图
  // 顶点: 0=A, 1=B, 2=C, 3=D, 4=E
  const V = 5
  const nodeNames = ['A', 'B', 'C', 'D', 'E']

  // 边列表（包含负权边）
  const edges: Edge[] = [
    { u: 0, v: 1, w: 6 },   // A -> B, 权重 6
    { u: 0, v: 3, w: -2 },  // A -> D, 权重 -2
    { u: 1, v: 2, w: 4 },   // B -> C, 权重 4
    { u: 3, v: 4, w: 5 },   // D -> E, 权重 5
    { u: 4, v: 2, w: -1 },  // E -> C, 权重 -1
    { u: 4, v: 1, w: 3 },   // E -> B, 权重 3
  ]

  const source = 0  // 源点 A

  result.push("=== Bellman-Ford 最短路径算法演示 ===\n")

  // 显示图结构
  result.push("图结构 (边列表):")
  for (const edge of edges) {
    result.push(`  ${nodeNames[edge.u]} -> ${nodeNames[edge.v]}, 权重: ${edge.w}`)
  }
  result.push(`\n源点: ${nodeNames[source]}\n`)

  // 初始化距离数组
  const dist: number[] = new Array(V).fill(INF)
  dist[source] = 0

  // 前驱数组（用于路径重建）
  const prev: number[] = new Array(V).fill(-1)

  result.push("=== 初始化 ===\n")
  result.push(`  dist = [${dist.map(d => d === INF ? '∞' : d).join(', ')}]`)
  result.push(`  源点 ${nodeNames[source]} 的距离设为 0\n`)

  // 记录所有步骤
  const allSteps: BellmanStep[] = []

  // V-1 轮松弛
  for (let round = 0; round < V - 1; round++) {
    result.push(`--- 第 ${round + 1} 轮松弛 (共 ${V - 1} 轮) ---\n`)
    let roundUpdated = false

    for (let i = 0; i < edges.length; i++) {
      const { u, v, w } = edges[i]
      const oldValue = dist[v]
      let newValue = oldValue
      let updated = false

      if (dist[u] !== INF && dist[u] + w < dist[v]) {
        newValue = dist[u] + w
        dist[v] = newValue
        prev[v] = u
        updated = true
        roundUpdated = true
      }

      const desc = updated
        ? `  边 ${nodeNames[u]}→${nodeNames[v]}(${w}): dist[${nodeNames[v]}] = min(${oldValue === INF ? '∞' : oldValue}, ${dist[u] === INF ? '∞' : dist[u]}+${w}) = ${newValue} ← 更新!`
        : `  边 ${nodeNames[u]}→${nodeNames[v]}(${w}): 不更新 (dist[${nodeNames[u]}]=${dist[u] === INF ? '∞' : dist[u]}, dist[${nodeNames[v]}]=${oldValue === INF ? '∞' : oldValue})`

      result.push(desc)

      allSteps.push({
        round,
        edgeIdx: i,
        u, v, w,
        dist: [...dist],
        updated,
        oldValue,
        newValue,
        description: desc,
      })
    }

    if (!roundUpdated) {
      result.push(`  本轮无更新，提前收敛`)
      break
    }

    result.push(`\n  当前 dist = [${dist.map(d => d === INF ? '∞' : d).join(', ')}]\n`)
  }

  // 检测负权环
  result.push("=== 负权环检测 (第 V 轮) ===\n")
  let hasNegativeCycle = false
  for (let i = 0; i < edges.length; i++) {
    const { u, v, w } = edges[i]
    if (dist[u] !== INF && dist[u] + w < dist[v]) {
      result.push(`  警告: 边 ${nodeNames[u]}→${nodeNames[v]}(${w}) 仍可松弛!`)
      result.push(`  存在负权环!`)
      hasNegativeCycle = true
    }
  }
  if (!hasNegativeCycle) {
    result.push("  不存在负权环\n")
  }
  result.push("")

  // 显示最终结果
  result.push("=== 最终最短距离 ===\n")
  for (let i = 0; i < V; i++) {
    if (dist[i] === INF) {
      result.push(`  ${nodeNames[source]} → ${nodeNames[i]}: 不可达`)
    } else {
      result.push(`  ${nodeNames[source]} → ${nodeNames[i]}: 距离 = ${dist[i]}`)
    }
  }
  result.push("")

  // 路径重建
  result.push("=== 最短路径重建 ===\n")
  for (let i = 0; i < V; i++) {
    if (i === source) continue
    if (dist[i] === INF) {
      result.push(`  ${nodeNames[source]} → ${nodeNames[i]}: 不可达`)
    } else {
      const path = getPath(prev, source, i, nodeNames)
      result.push(`  ${nodeNames[source]} → ${nodeNames[i]}: 路径 = ${path}, 距离 = ${dist[i]}`)
    }
  }
  result.push("")

  // 统计信息
  result.push("=== 算法统计 ===\n")
  result.push(`  顶点数: ${V}`)
  result.push(`  边数: ${edges.length}`)
  result.push(`  总松弛轮数: ${V - 1}`)
  result.push(`  总检查次数: ${(V - 1) * edges.length}`)
  result.push(`  时间复杂度: O(V×E) = O(${V}×${edges.length}) = O(${V * edges.length})`)
  result.push(`  空间复杂度: O(V) = O(${V})`)

  return result.join('\n')
}

function getPath(prev: number[], source: number, target: number, names: string[]): string {
  const path: string[] = []
  let current = target
  while (current !== -1) {
    path.unshift(names[current])
    current = prev[current]
  }
  if (path[0] !== names[source]) return '无路径'
  return path.join(' → ')
}
