interface FlowEdge {
  to: number
  capacity: number
  flow: number
}

class PushRelabelMaxFlow {
  private n: number
  private graph: FlowEdge[][]
  private height: number[]
  private excess: number[]

  constructor(n: number) {
    this.n = n
    this.graph = Array.from({ length: n }, () => [])
    this.height = new Array(n).fill(0)
    this.excess = new Array(n).fill(0)
  }

  addEdge(from: number, to: number, capacity: number): void {
    this.graph[from].push({ to, capacity, flow: 0 })
    this.graph[to].push({ to: from, capacity: 0, flow: 0 })
  }

  private push(u: number, ei: number): boolean {
    const edge = this.graph[u][ei]
    const v = edge.to
    const residual = edge.capacity - edge.flow
    if (this.height[u] !== this.height[v] + 1 || residual <= 0) return false
    const delta = Math.min(this.excess[u], residual)
    edge.flow += delta
    // Find reverse edge
    for (const rev of this.graph[v]) {
      if (rev.to === u) {
        rev.flow -= delta
        break
      }
    }
    this.excess[u] -= delta
    this.excess[v] += delta
    return true
  }

  private relabel(u: number): void {
    let minH = Infinity
    for (const edge of this.graph[u]) {
      if (edge.capacity - edge.flow > 0) {
        minH = Math.min(minH, this.height[edge.to])
      }
    }
    if (minH < Infinity) {
      this.height[u] = minH + 1
    }
  }

  computeMaxFlow(source: number, sink: number): number {
    // Initialize
    this.height[source] = this.n
    for (const edge of this.graph[source]) {
      edge.flow = edge.capacity
      const v = edge.to
      // Reverse edge
      for (const rev of this.graph[v]) {
        if (rev.to === source) {
          rev.flow = -edge.capacity
          break
        }
      }
      this.excess[v] = edge.capacity
      this.excess[source] -= edge.capacity
    }

    // Main loop
    let changed = true
    while (changed) {
      changed = false
      for (let u = 0; u < this.n; u++) {
        if (u === source || u === sink) continue
        while (this.excess[u] > 0) {
          let pushed = false
          for (let ei = 0; ei < this.graph[u].length; ei++) {
            if (this.push(u, ei)) {
              pushed = true
              changed = true
              if (this.excess[u] === 0) break
            }
          }
          if (!pushed && this.excess[u] > 0) {
            this.relabel(u)
            changed = true
          }
        }
      }
    }

    return this.excess[sink]
  }
}

export default function pushRelabelDemo(): string {
  const output: string[] = []

  output.push('=== 预流推进算法 (Push-Relabel) 演示 ===\n')

  // Example 1: Simple graph
  output.push('1. 简单网络最大流:')
  output.push('   网络结构:')
  output.push('   s --(10)--> A --(5)--> t')
  output.push('   s --(8)--> B --(10)--> t')
  output.push('   A --(2)--> B')
  output.push('')

  const flow1 = new PushRelabelMaxFlow(4)
  flow1.addEdge(0, 1, 10) // s->A
  flow1.addEdge(0, 2, 8)  // s->B
  flow1.addEdge(1, 3, 5)  // A->t
  flow1.addEdge(2, 3, 10) // B->t
  flow1.addEdge(1, 2, 2)  // A->B

  const maxFlow1 = flow1.computeMaxFlow(0, 3)
  output.push(`   最大流 = ${maxFlow1}`)
  output.push('')

  // Example 2: Diamond graph
  output.push('2. 菱形网络:')
  output.push('   s --(10)--> A --(5)--> C --(7)--> t')
  output.push('   s --(8)--> B --(10)--> D --(10)--> t')
  output.push('   A --(2)--> B')
  output.push('   C --(3)--> D')
  output.push('')

  const flow2 = new PushRelabelMaxFlow(6)
  flow2.addEdge(0, 1, 10) // s->A
  flow2.addEdge(0, 2, 8)  // s->B
  flow2.addEdge(1, 3, 5)  // A->C
  flow2.addEdge(1, 2, 2)  // A->B
  flow2.addEdge(2, 4, 10) // B->D
  flow2.addEdge(3, 5, 7)  // C->t
  flow2.addEdge(4, 5, 10) // D->t
  flow2.addEdge(3, 4, 3)  // C->D

  const maxFlow2 = flow2.computeMaxFlow(0, 5)
  output.push(`   最大流 = ${maxFlow2}`)
  output.push('')

  // Example 3: Bottleneck
  output.push('3. 瓶颈网络:')
  output.push('   s --(100)--> A --(1)--> B --(100)--> t')
  output.push('   s --(100)--> C --(1)--> D --(100)--> t')
  output.push('')

  const flow3 = new PushRelabelMaxFlow(6)
  flow3.addEdge(0, 1, 100) // s->A
  flow3.addEdge(0, 3, 100) // s->C
  flow3.addEdge(1, 2, 1)   // A->B
  flow3.addEdge(3, 4, 1)   // C->D
  flow3.addEdge(2, 5, 100) // B->t
  flow3.addEdge(4, 5, 100) // D->t

  const maxFlow3 = flow3.computeMaxFlow(0, 5)
  output.push(`   最大流 = ${maxFlow3} (受限于瓶颈边)`)
  output.push('')

  // Algorithm explanation
  output.push('=== 算法要点 ===')
  output.push('')
  output.push('核心操作:')
  output.push('  - Push(u,v): 将 u 的超额流量推送到邻居 v')
  output.push('  - Relabel(u): 抬高节点 u 的高度标签')
  output.push('')
  output.push('不变量:')
  output.push('  - height[u] <= height[v] + 1 (对于残量边 u->v)')
  output.push('  - height[s] = n, height[t] = 0')
  output.push('  - 超额: excess[u] = 流入 - 流出 (中间节点可为正)')
  output.push('')
  output.push('终止条件: 所有中间节点超额为 0')
  output.push('')
  output.push('时间复杂度:')
  output.push('  - FIFO 策略: O(V³)')
  output.push('  - 最高标号策略: O(V²√E)')
  output.push('  - 间隙优化: O(V²√E)')
  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
