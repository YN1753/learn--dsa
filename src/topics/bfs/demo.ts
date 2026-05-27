export default function bfsDemo(): string {
  const output: string[] = []

  output.push('=== BFS 广度优先搜索演示 ===\n')

  // 构建图：7个节点 (0-6)
  // 0 -- 1, 0 -- 2
  // 1 -- 3, 1 -- 4
  // 2 -- 4, 2 -- 5
  // 5 -- 6
  const graph: number[][] = [
    [1, 2],       // 0
    [0, 3, 4],    // 1
    [0, 4, 5],    // 2
    [1],          // 3
    [1, 2],       // 4
    [2, 6],       // 5
    [5],          // 6
  ]

  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  output.push('图结构（无向图）：')
  output.push('  节点: A(0), B(1), C(2), D(3), E(4), F(5), G(6)')
  output.push('  边: A-B, A-C, B-D, B-E, C-E, C-F, F-G')
  output.push('')

  // 从节点 A 开始执行 BFS
  const start = 0
  output.push(`从节点 ${labels[start]} 开始执行 BFS：\n`)

  const n = graph.length
  const visited = new Array(n).fill(false)
  const dist = new Array(n).fill(-1)
  const queue: number[] = [start]
  visited[start] = true
  dist[start] = 0
  let step = 1

  output.push(`  初始: 队列 = [${labels[start]}], 已访问 = {${labels[start]}}`)

  while (queue.length > 0) {
    const u = queue.shift()!
    const neighbors = graph[u]
      .filter(v => !visited[v])
      .map(v => labels[v])
      .join(', ')

    output.push(`\n  步骤 ${step++}: 取出 ${labels[u]} (层级=${dist[u]})`)
    output.push(`    邻居（未访问）: ${neighbors || '无'}`)

    for (const v of graph[u]) {
      if (!visited[v]) {
        visited[v] = true
        dist[v] = dist[u] + 1
        queue.push(v)
        output.push(`    ${labels[u]} -> ${labels[v]}, 层级 = ${dist[v]}, 加入队尾`)
      }
    }

    const queueLabels = queue.map(i => labels[i]).join(', ')
    output.push(`    队列 = [${queueLabels}]`)
  }

  output.push('\n各节点到源点的最短距离（边数）：')
  for (let i = 0; i < n; i++) {
    output.push(`  ${labels[start]} -> ${labels[i]}: ${dist[i]} 条边`)
  }

  // 按层级展示遍历顺序
  output.push('\n按层级展示遍历顺序：')
  const levels: string[][] = []
  for (let i = 0; i < n; i++) {
    const level = dist[i]
    if (!levels[level]) levels[level] = []
    levels[level].push(labels[i])
  }
  for (let i = 0; i < levels.length; i++) {
    output.push(`  第 ${i} 层: ${levels[i].join(', ')}`)
  }

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
