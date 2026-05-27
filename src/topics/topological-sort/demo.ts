export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 拓扑排序 (Topological Sort) 演示 ===')
  lines.push('')

  // --- 1. 构建 DAG ---
  lines.push('【1】构建有向无环图 (DAG)')
  lines.push('─────────────────────────')
  lines.push('课程先修关系图：')
  lines.push('  0: 数学      → 1: 线性代数  → 4: 机器学习')
  lines.push('  0: 数学      → 2: 概率论    → 5: 统计学 → 4: 机器学习')
  lines.push('  3: 程序设计  → 6: 数据结构  → 4: 机器学习')
  lines.push('')

  const graph: Map<number, number[]> = new Map()
  const nodeNames: Map<number, string> = new Map([
    [0, '数学'], [1, '线性代数'], [2, '概率论'], [3, '程序设计'],
    [4, '机器学习'], [5, '统计学'], [6, '数据结构']
  ])
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 4], [2, 5], [5, 4], [3, 6], [6, 4]
  ]

  for (const [u, v] of edges) {
    if (!graph.has(u)) graph.set(u, [])
    graph.get(u)!.push(v)
  }

  for (const [id, name] of nodeNames) {
    const neighbors = (graph.get(id) || []).map(n => nodeNames.get(n)).join(', ')
    lines.push(`  ${name} → [${neighbors}]`)
  }
  lines.push('')

  // --- 2. Kahn 算法 ---
  lines.push('【2】Kahn 算法 (基于 BFS)')
  lines.push('─────────────────────────')
  kahnAlgorithmDemo(graph, nodeNames, edges, 7, lines)
  lines.push('')

  // --- 3. DFS 拓扑排序 ---
  lines.push('【3】基于 DFS 的拓扑排序')
  lines.push('─────────────────────────')
  dfsTopoSortDemo(graph, nodeNames, 7, lines)
  lines.push('')

  // --- 4. 环检测演示 ---
  lines.push('【4】环检测演示')
  lines.push('─────────────────────────')
  cycleDetectionDemo(lines)
  lines.push('')

  // --- 5. 多种拓扑序 ---
  lines.push('【5】一个 DAG 可能有多种合法拓扑序')
  lines.push('─────────────────────────')
  multipleOrdersDemo(lines)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

function kahnAlgorithmDemo(
  graph: Map<number, number[]>,
  nodeNames: Map<number, string>,
  edges: [number, number][],
  n: number,
  lines: string[]
): void {
  const inDegree = new Array(n).fill(0)
  for (const [, v] of edges) {
    inDegree[v]++
  }

  lines.push('初始入度:')
  for (let i = 0; i < n; i++) {
    lines.push(`  ${nodeNames.get(i)}: 入度 = ${inDegree[i]}`)
  }
  lines.push('')

  const queue: number[] = []
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i)
  }

  lines.push(`入度为 0 的节点（加入队列）: [${queue.map(i => nodeNames.get(i)).join(', ')}]`)
  lines.push('')

  const result: number[] = []
  let step = 1

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)

    lines.push(`步骤 ${step}: 取出 ${nodeNames.get(node)}`)
    lines.push(`  结果: [${result.map(i => nodeNames.get(i)).join(', ')}]`)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      inDegree[neighbor]--
      lines.push(`  ${nodeNames.get(neighbor)} 入度: ${inDegree[neighbor] + 1} → ${inDegree[neighbor]}`)
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
        lines.push(`  ${nodeNames.get(neighbor)} 入度变为 0，加入队列`)
      }
    }

    lines.push(`  队列: [${queue.map(i => nodeNames.get(i)).join(', ')}]`)
    lines.push('')
    step++
  }

  lines.push(`最终拓扑序: [${result.map(i => nodeNames.get(i)).join(', ')}]`)

  if (result.length < n) {
    lines.push('警告：结果长度小于节点总数，图中存在环！')
  } else {
    lines.push('排序完成，所有节点已处理，图中无环。')
  }
}

function dfsTopoSortDemo(
  graph: Map<number, number[]>,
  nodeNames: Map<number, string>,
  n: number,
  lines: string[]
): void {
  const visited = new Set<number>()
  const inStack = new Set<number>()
  const stack: number[] = []
  let hasCycle = false

  function dfs(node: number, depth: number): void {
    const indent = '  '.repeat(depth + 1)
    if (inStack.has(node)) {
      lines.push(`${indent}发现环！节点 ${nodeNames.get(node)} 在递归栈中`)
      hasCycle = true
      return
    }
    if (visited.has(node)) {
      lines.push(`${indent}${nodeNames.get(node)} 已访问，跳过`)
      return
    }

    visited.add(node)
    inStack.add(node)
    lines.push(`${indent}进入 ${nodeNames.get(node)}`)

    for (const neighbor of graph.get(node) || []) {
      dfs(neighbor, depth + 1)
    }

    inStack.delete(node)
    stack.push(node)
    lines.push(`${indent}离开 ${nodeNames.get(node)}，压入栈`)
  }

  lines.push('DFS 遍历过程:')
  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) {
      lines.push(`从 ${nodeNames.get(i)} 开始 DFS:`)
      dfs(i, 0)
    }
  }

  lines.push('')
  if (hasCycle) {
    lines.push('检测到环，无法进行拓扑排序！')
  } else {
    const result = stack.reverse()
    lines.push(`栈中元素（反转后）: [${result.map(i => nodeNames.get(i)).join(', ')}]`)
    lines.push(`拓扑序: [${result.map(i => nodeNames.get(i)).join(', ')}]`)
  }
}

function cycleDetectionDemo(lines: string[]): void {
  lines.push('示例：一个包含环的图')
  lines.push('  A → B → C → A  (环！)')
  lines.push('  A → D')
  lines.push('')

  const graphCycle = new Map([
    ['A', ['B', 'D']],
    ['B', ['C']],
    ['C', ['A']],
    ['D', []],
  ])

  // Kahn 算法检测环
  lines.push('用 Kahn 算法检测：')
  const inDegree = new Map<string, number>([
    ['A', 1], ['B', 1], ['C', 1], ['D', 1]
  ])

  const queue: string[] = []
  for (const [node, deg] of inDegree) {
    if (deg === 0) queue.push(node)
  }

  lines.push(`  初始入度为 0 的节点: [${queue.join(', ')}]`)

  if (queue.length === 0) {
    lines.push('  没有入度为 0 的节点！所有节点都在环中。')
    lines.push('  Kahn 算法无法开始，判定图中存在环。')
  }

  const result: string[] = []
  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    for (const neighbor of graphCycle.get(node) || []) {
      const newDeg = inDegree.get(neighbor)! - 1
      inDegree.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }

  lines.push(`  处理的节点数: ${result.length}, 总节点数: 4`)
  if (result.length < 4) {
    lines.push(`  结果: [${result.join(', ')}]`)
    lines.push('  判定：图中存在环！无法完成拓扑排序。')
  }

  lines.push('')
  lines.push('用 DFS 检测环：')
  lines.push('  DFS 路径: A → B → C → A')
  lines.push('  A 已在递归栈中，发现后向边，判定存在环！')
}

function multipleOrdersDemo(lines: string[]): void {
  lines.push('示例图：')
  lines.push('  5 → 0, 5 → 2')
  lines.push('  4 → 0, 4 → 1')
  lines.push('  2 → 3, 3 → 1')
  lines.push('')

  lines.push('可能的拓扑序包括：')
  lines.push('  [5, 4, 2, 3, 1, 0]  -- 不合法！0 依赖 5 和 4')
  lines.push('  [5, 4, 2, 3, 0, 1]  -- 合法')
  lines.push('  [4, 5, 2, 3, 1, 0]  -- 合法')
  lines.push('  [5, 2, 3, 4, 1, 0]  -- 合法')
  lines.push('')

  lines.push('关键观察：')
  lines.push('  - 5 一定在 0 和 2 之前')
  lines.push('  - 4 一定在 0 和 1 之前')
  lines.push('  - 2 一定在 3 之前')
  lines.push('  - 3 一定在 1 之前')
  lines.push('  - 满足这些约束的任何排列都是合法的拓扑序')
}
