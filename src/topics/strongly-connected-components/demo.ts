interface Graph {
  [key: number]: number[]
}

function tarjanSCC(n: number, graph: Graph): number[][] {
  let timer = 0
  const dfn: number[] = new Array(n + 1).fill(0)
  const low: number[] = new Array(n + 1).fill(0)
  const inStack: boolean[] = new Array(n + 1).fill(false)
  const stack: number[] = []
  const sccs: number[][] = []
  let sccCount = 0

  function dfs(u: number) {
    timer++
    dfn[u] = low[u] = timer
    stack.push(u)
    inStack[u] = true

    for (const v of graph[u] || []) {
      if (dfn[v] === 0) {
        dfs(v)
        low[u] = Math.min(low[u], low[v])
      } else if (inStack[v]) {
        low[u] = Math.min(low[u], dfn[v])
      }
    }

    if (dfn[u] === low[u]) {
      sccCount++
      const scc: number[] = []
      let node: number
      do {
        node = stack.pop()!
        inStack[node] = false
        scc.push(node)
      } while (node !== u)
      sccs.push(scc)
    }
  }

  for (let i = 1; i <= n; i++) {
    if (dfn[i] === 0) {
      dfs(i)
    }
  }

  return sccs
}

export default function sccDemo(): string {
  const output: string[] = []

  output.push('=== 强连通分量（SCC）演示 ===')
  output.push('')

  // 构建示例图
  // 1 -> 2 -> 3 -> 1  (SCC: {1, 2, 3})
  // 3 -> 4 -> 5 -> 4  (SCC: {4, 5})
  // 5 -> 6             (SCC: {6})
  const graph: Graph = {
    1: [2],
    2: [3],
    3: [1, 4],
    4: [5],
    5: [4, 6],
    6: [],
  }

  output.push('有向图结构：')
  output.push('  1 -> 2 -> 3 -> 1  (互相可达)')
  output.push('  3 -> 4')
  output.push('  4 -> 5 -> 4  (互相可达)')
  output.push('  5 -> 6')
  output.push('')

  output.push('使用 Tarjan 算法查找强连通分量...')
  output.push('')

  // 手动模拟 Tarjan 算法过程
  output.push('DFS 遍历过程：')
  output.push('  访问节点 1: dfn=1, low=1, 入栈')
  output.push('    访问节点 2: dfn=2, low=2, 入栈')
  output.push('      访问节点 3: dfn=3, low=3, 入栈')
  output.push('        邻居 1: 已访问且在栈中, low[3] = min(3, 1) = 1')
  output.push('        访问节点 4: dfn=4, low=4, 入栈')
  output.push('          访问节点 5: dfn=5, low=5, 入栈')
  output.push('            邻居 4: 已访问且在栈中, low[5] = min(5, 4) = 4')
  output.push('            访问节点 6: dfn=6, low=6, 入栈')
  output.push('            节点 6: dfn=low=6, 弹出 SCC: {6}')
  output.push('          节点 5: dfn=low=4, 弹出 SCC: {5, 4}')
  output.push('        节点 4: 已被弹出')
  output.push('      节点 3: dfn=low=1, 弹出 SCC: {3, 2, 1}')
  output.push('')

  const sccs = tarjanSCC(6, graph)
  output.push('找到的强连通分量：')
  sccs.forEach((scc, i) => {
    output.push(`  SCC ${i + 1}: {${scc.join(', ')}}`)
  })
  output.push('')

  output.push('缩点后的 DAG 结构：')
  output.push('  SCC{1,2,3} -> SCC{4,5} -> SCC{6}')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
