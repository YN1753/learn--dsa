interface Edge {
  to: number
  weight: 0 | 1
}

export default function zeroOneBFSDemo(): string {
  const output: string[] = []

  output.push('=== 0-1 BFS 最短路演示 ===\n')

  // 构建图：6个节点 (0-5)
  // 0 -> 1 (权0), 0 -> 2 (权1)
  // 1 -> 2 (权0), 1 -> 3 (权1)
  // 2 -> 4 (权0)
  // 3 -> 5 (权0)
  // 4 -> 3 (权1), 4 -> 5 (权1)
  const graph: Edge[][] = [
    [{ to: 1, weight: 0 }, { to: 2, weight: 1 }],  // 0
    [{ to: 2, weight: 0 }, { to: 3, weight: 1 }],  // 1
    [{ to: 4, weight: 0 }],                          // 2
    [{ to: 5, weight: 0 }],                          // 3
    [{ to: 3, weight: 1 }, { to: 5, weight: 1 }],   // 4
    [],                                               // 5
  ]

  const labels = ['S', 'A', 'B', 'C', 'D', 'T']

  output.push('图结构：')
  output.push('  节点: S(0), A(1), B(2), C(3), D(4), T(5)')
  output.push('  边:')
  output.push('    S -> A, 权重 0')
  output.push('    S -> B, 权重 1')
  output.push('    A -> B, 权重 0')
  output.push('    A -> C, 权重 1')
  output.push('    B -> D, 权重 0')
  output.push('    C -> T, 权重 0')
  output.push('    D -> C, 权重 1')
  output.push('    D -> T, 权重 1')
  output.push('')

  // 执行 0-1 BFS
  output.push('从源点 S 开始执行 0-1 BFS：\n')

  const n = graph.length
  const dist = new Array(n).fill(Infinity)
  dist[0] = 0
  const deque: number[] = [0]
  let front = 0
  const visited = new Set<number>()
  let step = 1

  output.push(`  初始: 队列 = [S], dist = [0, INF, INF, INF, INF, INF]`)

  while (front < deque.length) {
    const u = deque[front++]
    if (visited.has(u)) continue
    visited.add(u)

    output.push(`\n  步骤 ${step++}: 取出 ${labels[u]} (距离=${dist[u]})`)

    for (const { to: v, weight } of graph[u]) {
      const oldDist = dist[v]
      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight
        const insertPos = weight === 0 ? '队头' : '队尾'
        if (weight === 0) {
          deque.splice(front, 0, v)
        } else {
          deque.push(v)
        }
        const queueLabels = deque.slice(front).map(i => labels[i]).join(', ')
        output.push(`    ${labels[u]} -> ${labels[v]}, 权重=${weight}, 距离: ${oldDist === Infinity ? 'INF' : oldDist} -> ${dist[v]}, 插入${insertPos}`)
        output.push(`    队列 = [${queueLabels}]`)
      }
    }
  }

  output.push('\n最终最短距离：')
  for (let i = 0; i < n; i++) {
    output.push(`  S -> ${labels[i]}: ${dist[i] === Infinity ? '不可达' : dist[i]}`)
  }

  // 与普通 BFS 对比
  output.push('\n--- 与普通 BFS 对比 ---')
  output.push('普通 BFS 将所有边视为权重 1，结果:')
  const bfsDist = new Array(n).fill(Infinity)
  bfsDist[0] = 0
  const bfsQueue = [0]
  const bfsVisited = new Set<number>()
  while (bfsQueue.length > 0) {
    const u = bfsQueue.shift()!
    if (bfsVisited.has(u)) continue
    bfsVisited.add(u)
    for (const { to: v } of graph[u]) {
      if (bfsDist[u] + 1 < bfsDist[v]) {
        bfsDist[v] = bfsDist[u] + 1
        bfsQueue.push(v)
      }
    }
  }
  for (let i = 0; i < n; i++) {
    output.push(`  S -> ${labels[i]}: ${bfsDist[i] === Infinity ? '不可达' : bfsDist[i]}`)
  }
  output.push('\n可以看到，0-1 BFS 考虑了边权差异，给出的结果更准确。')

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
