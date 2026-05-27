interface Edge {
  from: number
  to: number
}

function buildDominatorTree(
  n: number,
  edges: Edge[],
  start: number
): { idom: number[], children: Map<number, number[]> } {
  // Build adjacency lists
  const adj: number[][] = Array.from({ length: n }, () => [])
  const pred: number[][] = Array.from({ length: n }, () => [])
  for (const e of edges) {
    adj[e.from].push(e.to)
    pred[e.to].push(e.from)
  }

  // Phase 1: DFS to assign dfn
  const dfn: number[] = new Array(n).fill(-1)
  const vertex: number[] = []
  const parent: number[] = new Array(n).fill(-1)
  let counter = 0

  function dfs(v: number) {
    dfn[v] = counter
    vertex[counter] = v
    counter++
    for (const u of adj[v]) {
      if (dfn[u] === -1) {
        parent[u] = v
        dfs(u)
      }
    }
  }
  dfs(start)
  const nVertices = counter

  // Phase 2: Compute semi-dominators
  const sdom: number[] = new Array(n).fill(-1)
  const idom: number[] = new Array(n).fill(-1)
  const ancestor: number[] = new Array(n).fill(-1)

  for (let i = 0; i < n; i++) {
    sdom[i] = dfn[i] >= 0 ? dfn[i] : -1
  }

  // Buckets: for each vertex w, store vertices v with sdom[v] = dfn[w]
  const buckets: number[][] = Array.from({ length: nVertices }, () => [])

  // Union-Find with path compression for eval
  function evalNode(v: number): number {
    if (ancestor[v] === -1) return v
    // Path compression: find the ancestor with minimum sdom on the path
    let u = v
    while (ancestor[u] !== -1) {
      u = ancestor[u]
    }
    // Now u is the root of the forest
    // Compress path and find min sdom
    const path: number[] = []
    let curr = v
    while (curr !== u) {
      path.push(curr)
      curr = ancestor[curr]
    }
    // Find min sdom on path
    let minSdom = sdom[u]
    let minVertex = u
    for (const node of path) {
      if (sdom[node] < minSdom) {
        minSdom = sdom[node]
        minVertex = node
      }
    }
    return minVertex
  }

  // Process vertices in reverse DFS order
  for (let i = nVertices - 1; i >= 1; i--) {
    const w = vertex[i]
    // Process predecessors
    for (const v of pred[w]) {
      if (dfn[v] === -1) continue // skip unreachable
      const u = evalNode(v)
      if (sdom[u] < sdom[w]) {
        sdom[w] = sdom[u]
      }
    }
    buckets[vertex[sdom[w]]].push(w)
    // Link w to its parent in DFS tree
    ancestor[w] = parent[w]

    // Process bucket of parent[w]
    const pw = parent[w]
    for (const v of buckets[pw]) {
      const u = evalNode(v)
      if (sdom[u] < sdom[v]) {
        idom[v] = u
      } else {
        idom[v] = pw
      }
    }
    buckets[pw] = []
  }

  // Phase 3: Finalize idom
  for (let i = 1; i < nVertices; i++) {
    const w = vertex[i]
    if (idom[w] !== vertex[sdom[w]]) {
      idom[w] = idom[idom[w]]
    }
  }
  idom[start] = start

  // Build children map for dominator tree
  const children = new Map<number, number[]>()
  for (let i = 0; i < nVertices; i++) {
    const v = vertex[i]
    if (v !== start && idom[v] >= 0) {
      if (!children.has(idom[v])) children.set(idom[v], [])
      children.get(idom[v])!.push(v)
    }
  }

  return { idom, children }
}

export default function dominatorTreeDemo(): string {
  const output: string[] = []

  output.push('=== 支配树演示 ===\n')

  // Example graph
  //   0 → 1 → 3
  //   0 → 2 → 3
  //   1 → 4
  //   2 → 4
  //   3 → 4
  //   4 → 5
  const n = 6
  const edges: Edge[] = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
    { from: 1, to: 4 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
  ]
  const start = 0

  output.push('输入有向图：')
  output.push('  节点: 0, 1, 2, 3, 4, 5')
  output.push('  边:')
  for (const e of edges) {
    output.push(`    ${e.from} -> ${e.to}`)
  }
  output.push('  起点: 0\n')

  // Build dominator tree
  const result = buildDominatorTree(n, edges, start)

  output.push('计算结果：')
  output.push('  直接支配者 (idom):')
  for (let i = 0; i < n; i++) {
    if (result.idom[i] >= 0) {
      if (i === start) {
        output.push(`    idom(${i}) = ${i} (起点)`)
      } else {
        output.push(`    idom(${i}) = ${result.idom[i]}`)
      }
    }
  }

  output.push('\n  支配树结构:')
  output.push(`    根节点: ${start}`)

  function printTree(v: number, indent: string) {
    const ch = result.children.get(v) || []
    for (let i = 0; i < ch.length; i++) {
      const isLast = i === ch.length - 1
      const connector = isLast ? '└── ' : '├── '
      const childIndent = indent + (isLast ? '    ' : '│   ')
      output.push(`${indent}${connector}${ch[i]}`)
      printTree(ch[i], childIndent)
    }
  }
  printTree(start, '    ')

  output.push('\n  支配关系分析:')
  for (let i = 0; i < n; i++) {
    if (i === start) continue
    const dominated: number[] = []
    function collectDominated(v: number) {
      const ch = result.children.get(v) || []
      for (const c of ch) {
        dominated.push(c)
        collectDominated(c)
      }
    }
    collectDominated(i)
    if (dominated.length > 0) {
      output.push(`    节点 ${i} 支配: {${dominated.join(', ')}}`)
    }
  }

  // Second example: a more complex graph
  output.push('\n\n--- 第二个示例 ---\n')
  output.push('输入有向图：')
  output.push('  节点: 0, 1, 2, 3, 4, 5, 6')
  output.push('  边: 0->1, 0->2, 1->3, 2->3, 3->4, 3->5, 4->6, 5->6, 2->6')
  output.push('  起点: 0\n')

  const n2 = 7
  const edges2: Edge[] = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 6 },
    { from: 5, to: 6 },
    { from: 2, to: 6 },
  ]

  const result2 = buildDominatorTree(n2, edges2, 0)

  output.push('计算结果：')
  output.push('  直接支配者 (idom):')
  for (let i = 0; i < n2; i++) {
    if (result2.idom[i] >= 0) {
      if (i === 0) {
        output.push(`    idom(${i}) = ${i} (起点)`)
      } else {
        output.push(`    idom(${i}) = ${result2.idom[i]}`)
      }
    }
  }

  output.push('\n  支配树结构:')
  output.push('    根节点: 0')
  printTree.call(null, 0, '    ')

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
