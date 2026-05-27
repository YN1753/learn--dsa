interface GraphEdge {
  from: number
  to: number
}

interface TarjanState {
  disc: number[]
  low: number[]
  visited: boolean[]
  parent: number[]
  time: number
  bridges: GraphEdge[]
  articulationPoints: number[]
}

function createGraph(vertices: number, edges: [number, number][]): Map<number, number[]> {
  const adj = new Map<number, number[]>()
  for (let i = 0; i < vertices; i++) {
    adj.set(i, [])
  }
  for (const [u, v] of edges) {
    adj.get(u)!.push(v)
    adj.get(v)!.push(u)
  }
  return adj
}

function tarjan(vertices: number, adj: Map<number, number[]>): TarjanState {
  const state: TarjanState = {
    disc: new Array(vertices).fill(-1),
    low: new Array(vertices).fill(-1),
    visited: new Array(vertices).fill(false),
    parent: new Array(vertices).fill(-1),
    time: 0,
    bridges: [],
    articulationPoints: [],
  }

  const isArticulation = new Array(vertices).fill(false)
  const childCount = new Array(vertices).fill(0)

  function dfs(u: number): void {
    state.visited[u] = true
    state.disc[u] = state.time
    state.low[u] = state.time
    state.time++

    for (const v of adj.get(u)!) {
      if (!state.visited[v]) {
        state.parent[v] = u
        childCount[u]++
        dfs(v)

        state.low[u] = Math.min(state.low[u], state.low[v])

        // Check bridge
        if (state.low[v] > state.disc[u]) {
          state.bridges.push({ from: u, to: v })
        }

        // Check articulation point (non-root)
        if (state.parent[u] !== -1 && state.low[v] >= state.disc[u]) {
          isArticulation[u] = true
        }
      } else if (v !== state.parent[u]) {
        state.low[u] = Math.min(state.low[u], state.disc[v])
      }
    }
  }

  for (let i = 0; i < vertices; i++) {
    if (!state.visited[i]) {
      dfs(i)
      // Root is articulation if it has 2+ children
      if (childCount[i] >= 2) {
        isArticulation[i] = true
      }
    }
  }

  for (let i = 0; i < vertices; i++) {
    if (isArticulation[i]) {
      state.articulationPoints.push(i)
    }
  }

  return state
}

export default function bridgesAndArticulationDemo(): string {
  const output: string[] = []

  output.push('=== 桥与割点演示 ===\n')

  // Example 1: Simple graph with bridge
  output.push('--- 示例 1: 包含桥的图 ---')
  output.push('图结构:')
  output.push('  0 --- 1 --- 2')
  output.push('  |           |')
  output.push('  3 --- 4 --- 5')
  output.push('        |')
  output.push('        6')

  const edges1: [number, number][] = [
    [0, 1], [0, 3], [1, 2], [2, 5], [3, 4], [4, 5], [4, 6],
  ]
  const adj1 = createGraph(7, edges1)
  const result1 = tarjan(7, adj1)

  output.push('\ndisc[] 时间戳:')
  output.push(`  ${result1.disc.map((d, i) => `${i}:${d}`).join(', ')}`)
  output.push('low[] 最低可达:')
  output.push(`  ${result1.low.map((l, i) => `${i}:${l}`).join(', ')}`)

  output.push('\n找到的桥:')
  if (result1.bridges.length === 0) {
    output.push('  无')
  } else {
    for (const b of result1.bridges) {
      output.push(`  ${b.from} --- ${b.to}`)
    }
  }

  output.push('\n找到的割点:')
  if (result1.articulationPoints.length === 0) {
    output.push('  无')
  } else {
    output.push(`  ${result1.articulationPoints.join(', ')}`)
  }
  output.push('')

  // Example 2: Graph with no bridges (cycle)
  output.push('--- 示例 2: 环形图（无桥） ---')
  output.push('图结构:')
  output.push('  0 --- 1')
  output.push('  |     |')
  output.push('  3 --- 2')

  const edges2: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0],
  ]
  const adj2 = createGraph(4, edges2)
  const result2 = tarjan(4, adj2)

  output.push('\ndisc[] 时间戳:')
  output.push(`  ${result2.disc.map((d, i) => `${i}:${d}`).join(', ')}`)
  output.push('low[] 最低可达:')
  output.push(`  ${result2.low.map((l, i) => `${i}:${l}`).join(', ')}`)

  output.push('\n找到的桥:')
  output.push(result2.bridges.length === 0 ? '  无（环中无桥）' : result2.bridges.map(b => `  ${b.from} --- ${b.to}`).join('\n'))

  output.push('\n找到的割点:')
  output.push(result2.articulationPoints.length === 0 ? '  无（环中无割点）' : `  ${result2.articulationPoints.join(', ')}`)
  output.push('')

  // Example 3: Graph with multiple articulation points
  output.push('--- 示例 3: 多个割点的图 ---')
  output.push('图结构:')
  output.push('  0 --- 1 --- 2 --- 3')
  output.push('        |           |')
  output.push('        4 --- 5 --- 6')

  const edges3: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [1, 4], [3, 6], [4, 5], [5, 6],
  ]
  const adj3 = createGraph(7, edges3)
  const result3 = tarjan(7, adj3)

  output.push('\ndisc[] 时间戳:')
  output.push(`  ${result3.disc.map((d, i) => `${i}:${d}`).join(', ')}`)
  output.push('low[] 最低可达:')
  output.push(`  ${result3.low.map((l, i) => `${i}:${l}`).join(', ')}`)

  output.push('\n找到的桥:')
  if (result3.bridges.length === 0) {
    output.push('  无')
  } else {
    for (const b of result3.bridges) {
      output.push(`  ${b.from} --- ${b.to}`)
    }
  }

  output.push('\n找到的割点:')
  if (result3.articulationPoints.length === 0) {
    output.push('  无')
  } else {
    output.push(`  ${result3.articulationPoints.join(', ')}`)
  }
  output.push('')

  // Summary
  output.push('=== 算法总结 ===')
  output.push('桥: 边 (u, v)，满足 low[v] > disc[u]')
  output.push('割点: 非根节点 u，存在子节点 v 满足 low[v] >= disc[u]')
  output.push('割点: 根节点，在 DFS 树中有 >= 2 个子节点')
  output.push('时间复杂度: O(V + E)')
  output.push('空间复杂度: O(V)')
  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
