// 深度优先搜索 (DFS) 演示

type AdjList = Map<number, number[]>

function createGraph(): AdjList {
  const graph: AdjList = new Map()
  // 无向图:
  //   0 --- 1 --- 3
  //   |     |     |
  //   2     4 --- 5
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [3, 5], [4, 5],
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

function dfsRecursive(graph: AdjList, start: number): { order: number[]; steps: string[] } {
  const visited = new Set<number>()
  const order: number[] = []
  const steps: string[] = []

  function traverse(node: number, depth: number) {
    visited.add(node)
    order.push(node)
    const indent = '  '.repeat(depth)
    const neighbors = graph.get(node) || []
    const unvisited = neighbors.filter(n => !visited.has(n))
    steps.push(`${indent}访问节点 ${node}, 未访问邻居: [${unvisited.join(', ')}]`)

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

function dfsIterative(graph: AdjList, start: number): { order: number[]; steps: string[] } {
  const visited = new Set<number>()
  const stack: number[] = [start]
  const order: number[] = []
  const steps: string[] = []

  steps.push(`初始化: 将起始节点 ${start} 压栈`)

  while (stack.length > 0) {
    const node = stack.pop()!

    if (visited.has(node)) {
      steps.push(`  节点 ${node} 已访问，跳过`)
      continue
    }

    visited.add(node)
    order.push(node)
    steps.push(`弹栈并访问节点 ${node}, 栈: [${[...stack].reverse().join(', ')}]`)

    const neighbors = (graph.get(node) || []).filter(n => !visited.has(n))
    // 逆序压栈以保证按顺序访问
    for (let i = neighbors.length - 1; i >= 0; i--) {
      stack.push(neighbors[i])
    }

    if (neighbors.length > 0) {
      steps.push(`  将邻居 [${neighbors.join(', ')}] 压栈, 栈: [${[...stack].reverse().join(', ')}]`)
    }
  }

  return { order, steps }
}

function countComponents(graph: AdjList): number {
  const visited = new Set<number>()
  let count = 0
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      count++
      const stack = [node]
      while (stack.length > 0) {
        const curr = stack.pop()!
        if (visited.has(curr)) continue
        visited.add(curr)
        for (const n of graph.get(curr) || []) {
          if (!visited.has(n)) stack.push(n)
        }
      }
    }
  }
  return count
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('     深度优先搜索 (DFS) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  const graph = createGraph()

  // 1. 图的结构
  lines.push('【第一步】构建无向图')
  lines.push('')
  lines.push('  图的结构:')
  lines.push('    0 --- 1 --- 3')
  lines.push('    |     |     |')
  lines.push('    2     4 --- 5')
  lines.push('')
  lines.push('  邻接表:')
  for (const [node, neighbors] of [...graph.entries()].sort((a, b) => a[0] - b[0])) {
    lines.push(`    ${node} → [${neighbors.join(', ')}]`)
  }
  lines.push('')

  // 2. 递归 DFS
  lines.push('【第二步】递归版 DFS（从节点 0 开始）')
  lines.push('')
  const recResult = dfsRecursive(graph, 0)
  for (const step of recResult.steps) {
    lines.push(`  ${step}`)
  }
  lines.push('')
  lines.push(`  遍历顺序: [${recResult.order.join(' → ')}]`)
  lines.push('')

  // 3. 迭代 DFS
  lines.push('【第三步】迭代版 DFS（从节点 0 开始）')
  lines.push('')
  const iterResult = dfsIterative(graph, 0)
  for (const step of iterResult.steps) {
    lines.push(`  ${step}`)
  }
  lines.push('')
  lines.push(`  遍历顺序: [${iterResult.order.join(' → ')}]`)
  lines.push('')

  // 4. 连通分量
  lines.push('【第四步】连通分量检测')
  lines.push('')
  lines.push(`  当前图的连通分量数: ${countComponents(graph)}`)
  lines.push(`  所有节点都在同一个连通分量中`)
  lines.push('')

  // 5. 总结
  lines.push('【第五步】DFS 特点总结')
  lines.push('')
  lines.push(`  顶点数: ${graph.size}`)
  let edgeCount = 0
  for (const neighbors of graph.values()) edgeCount += neighbors.length
  lines.push(`  边数: ${edgeCount / 2}`)
  lines.push(`  时间复杂度: O(V + E) = O(${graph.size} + ${edgeCount / 2})`)
  lines.push(`  空间复杂度: O(V) = O(${graph.size})`)
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
