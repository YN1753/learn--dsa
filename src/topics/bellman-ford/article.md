# Bellman-Ford 最短路径算法

## 概念解释

**Bellman-Ford 算法**是一种用于求解**单源最短路径**（Single-Source Shortest Path）的经典算法。与 Dijkstra 算法不同，Bellman-Ford 算法能够正确处理**含有负权边**的图，并且能够**检测负权环**（Negative Cycle）的存在。

### 核心概念

**单源最短路径 (Single-Source Shortest Path)**
给定一个带权有向图和一个源点 s，求出从 s 到图中其他所有顶点的最短路径长度。如果有 n 个顶点，最终结果是一个长度为 n 的距离数组。

**负权边 (Negative Weight Edge)**
图中边的权重可以为负数。例如在金融模型中，负权边可以表示亏损；在网络中可以表示成本降低。Bellman-Ford 算法能够正确处理这类边。

**负权环 (Negative Cycle)**
图中存在一个环，环上所有边的权重之和为负数。如果存在负权环，最短路径没有意义——可以无限绕环来使路径长度趋向负无穷。Bellman-Ford 算法能够检测出这种环。

**松弛操作 (Relaxation)**
对于一条边 (u, v, w)，如果从源点经过 u 到达 v 的路径比当前已知的最短路径更短，就更新 dist[v]：
```
if dist[u] + w < dist[v]:
    dist[v] = dist[u] + w
```

## 为什么重要

Bellman-Ford 算法在图论和实际应用中具有独特地位：

- **处理负权边**：Dijkstra 算法无法处理负权边，因为其贪心策略依赖于"已确定的最短距离不会再被更新"这一假设，而负权边会打破这一假设
- **检测负权环**：通过第 V 次迭代是否还能松弛，可以判断图中是否存在负权环
- **实现简单**：核心代码仅需两重循环，非常容易理解和实现
- **理论基础**：基于动态规划思想，是理解更高级算法（如 SPFA）的基础

### 与其他最短路径算法的比较

| 特性 | Bellman-Ford | Dijkstra | Floyd-Warshall |
|------|-------------|----------|----------------|
| 类型 | 单源最短路径 | 单源最短路径 | 全源最短路径 |
| 时间复杂度 | O(VE) | O((V+E) log V) | O(V³) |
| 负权边 | 支持 | 不支持 | 支持 |
| 负权环检测 | 支持 | 不支持 | 支持 |
| 适用场景 | 含负权边的稀疏图 | 非负权稀疏图 | 稠密图 |
| 实现难度 | 简单 | 中等 | 极简 |

## 核心原理

### 算法思想

Bellman-Ford 算法的核心思想基于一个关键观察：**在没有负权环的图中，任意两个顶点之间的最短路径最多包含 V-1 条边**。

因此，算法重复进行 V-1 轮松弛操作。每一轮遍历所有边，尝试通过每条边来缩短路径。经过 V-1 轮后，所有最短路径都已经被找到。

如果第 V 轮仍然能松弛某条边，说明存在负权环——因为正常情况下 V-1 轮就足够了。

### 算法步骤

```typescript
function bellmanFord(edges: [number, number, number][], V: number, source: number) {
  // 初始化距离数组
  const dist = new Array(V).fill(Infinity)
  dist[source] = 0

  // V-1 轮松弛
  for (let i = 0; i < V - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
      }
    }
  }

  // 检测负权环：第 V 轮如果还能松弛，说明存在负权环
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      console.log('图中存在负权环！')
      return null
    }
  }

  return dist
}
```

### 路径重建

要重建具体的最短路径，需要额外维护一个前驱数组 `prev[]`：

```typescript
function bellmanFordWithPath(edges: [number, number, number][], V: number, source: number) {
  const dist = new Array(V).fill(Infinity)
  const prev = new Array(V).fill(-1)
  dist[source] = 0

  for (let i = 0; i < V - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
        prev[v] = u  // 记录前驱节点
      }
    }
  }

  // 重建从源点到目标顶点的路径
  function getPath(target: number): number[] {
    const path: number[] = []
    let current = target
    while (current !== -1) {
      path.unshift(current)
      current = prev[current]
    }
    return path
  }

  return { dist, prev, getPath }
}
```

### 执行过程示例

考虑 5 个顶点的有向图，源点为 A：

```
    6       4
 A -----> B -----> C
 |               ^
 | -2      3    |
 v       ↓      |
 D -----> E ----+
     5       -1
```

边列表：[(A,B,6), (A,D,-2), (B,C,4), (D,E,5), (E,C,-1), (E,B,3)]

**初始状态**：dist = [0, INF, INF, INF, INF]

**第 1 轮松弛**：
- 边 (A,B,6)：dist[B] = min(INF, 0+6) = 6，更新
- 边 (A,D,-2)：dist[D] = min(INF, 0+(-2)) = -2，更新
- 边 (B,C,4)：dist[C] = min(INF, 6+4) = 10，更新
- 边 (D,E,5)：dist[E] = min(INF, -2+5) = 3，更新
- 边 (E,C,-1)：dist[C] = min(10, 3+(-1)) = 2，更新
- 边 (E,B,3)：dist[B] = min(6, 3+3) = 6，不更新

dist = [0, 6, 2, -2, 3]

**第 2 轮松弛**：
- 所有边检查后，没有更新发生

**第 3 轮松弛**（V-1=4，还需要第 3、4 轮）：
- 没有更新

**第 4 轮松弛**：
- 没有更新

**检测负权环**：第 V=5 轮检查所有边，没有更新，说明不存在负权环。

最终结果：dist = [0, 6, 2, -2, 3]

### 时间与空间复杂度

| 指标 | 复杂度 | 说明 |
|------|--------|------|
| 时间 | O(V*E) | V-1 轮松弛，每轮遍历所有 E 条边 |
| 空间 | O(V) | 存储距离数组和前驱数组 |

### SPFA 优化

**SPFA（Shortest Path Faster Algorithm）** 是 Bellman-Ford 的队列优化版本。核心思想是：如果某个顶点的距离没有被更新，那么以它为起点的边也不需要检查。

```typescript
function spfa(adjList: [number, number][][], V: number, source: number) {
  const dist = new Array(V).fill(Infinity)
  const inQueue = new Array(V).fill(false)
  const count = new Array(V).fill(0)  // 记录入队次数，用于检测负权环
  dist[source] = 0

  const queue: number[] = [source]
  inQueue[source] = true

  while (queue.length > 0) {
    const u = queue.shift()!
    inQueue[u] = false

    for (const [v, w] of adjList[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
        if (!inQueue[v]) {
          queue.push(v)
          inQueue[v] = true
          count[v]++
          if (count[v] >= V) {
            console.log('存在负权环！')
            return null
          }
        }
      }
    }
  }

  return dist
}
```

SPFA 的平均时间复杂度为 O(E)，最坏情况仍为 O(VE)。在随机图上通常比原版 Bellman-Ford 快很多。

## 可视化说明

通过可视化可以直观理解 Bellman-Ford 算法的执行过程：

1. **图结构**：以带箭头的加权有向图展示顶点和边，负权边用红色标记
2. **松弛过程**：每次检查一条边时，高亮该边的两个端点
3. **距离更新**：当某条边成功松弛时，目标顶点的距离值会高亮并更新
4. **轮次进度**：显示当前是第几轮松弛（共 V-1 轮）
5. **负权环检测**：如果在额外的第 V 轮中仍能松弛，高亮显示负权环相关的边
6. **dist 数组**：实时展示从源点到各顶点的当前最短距离

通过逐步执行，你可以观察到每轮松弛如何逐步逼近最终的最短路径。

## 常见错误

### 1. 未检测负权环

**错误表现**：算法结束后直接输出结果，不进行第 V 轮检查。

**正确做法**：
```typescript
// 必须进行第 V 轮检查
for (const [u, v, w] of edges) {
  if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
    throw new Error('图中存在负权环，最短路径无定义')
  }
}
```

### 2. 松弛轮数不足

**错误写法**：
```typescript
// 错误！只松弛了 V-2 轮
for (let i = 0; i < V - 2; i++) {  // 应该是 V-1
  // ...
}
```

**正确写法**：必须执行恰好 V-1 轮松弛，因为最坏情况下最短路径包含 V-1 条边。

### 3. 未处理不可达顶点

**错误表现**：假设所有顶点都可达，直接输出 dist 数组。

**正确做法**：
```typescript
// 输出时检查是否可达
for (let i = 0; i < V; i++) {
  if (dist[i] === Infinity) {
    console.log(`顶点 ${i} 不可达`)
  } else {
    console.log(`到顶点 ${i} 的最短距离: ${dist[i]}`)
  }
}
```

### 4. 混淆 Bellman-Ford 与 Dijkstra 的适用场景

**错误**：在含有负权边的图上使用 Dijkstra 算法。

**原因**：Dijkstra 使用贪心策略，每次选择距离最小的未访问顶点并标记为"已确定"。但负权边可能导致已经标记的顶点距离被进一步缩短，因此 Dijkstra 在负权图上会产生错误结果。

### 5. 边的遍历顺序问题

**注意**：Bellman-Ford 算法的正确性不依赖于边的遍历顺序。不同顺序可能影响中间结果，但最终结果相同。但 SPFA 的效率与入队顺序有关。

## 实际应用

### 1. 货币套汇检测 (Currency Arbitrage)

将不同货币之间的汇率建模为图：如果 1 美元可以兑换 0.9 欧元，就创建一条从美元到欧元、权重为 -ln(0.9) 的边。检测是否存在套汇机会等价于检测负权环。

```typescript
// 检测货币套汇
function detectArbitrage(rates: number[][], currencies: string[]): boolean {
  const n = currencies.length
  // 将汇率转换为对数权重
  const edges: [number, number, number][] = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        edges.push([i, j, -Math.log(rates[i][j])])
      }
    }
  }

  // 运行 Bellman-Ford 检测负权环
  const dist = new Array(n).fill(Infinity)
  dist[0] = 0
  for (let i = 0; i < n - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
      }
    }
  }
  for (const [u, v, w] of edges) {
    if (dist[u] + w < dist[v]) return true  // 存在套汇机会
  }
  return false
}
```

### 2. 网络路由中的负权成本

在某些网络路由场景中，某些路径可能有"奖励"（负成本），例如使用某条链路可以获得带宽折扣。Bellman-Ford 可以在这种场景下找到最优路由。

### 3. 游戏理论与零和博弈

在博弈论中，某些策略可以建模为带负权边的图。Bellman-Ford 可以帮助分析最优策略和检测循环优势。

### 4. 任务调度中的约束满足

某些任务调度问题可以建模为差分约束系统，转化为图的最短路径问题。负权边表示时间约束，Bellman-Ford 可以求解或判断约束是否矛盾。

### 5. 交通网络分析

交通网络中，某些路段可能有"奖励"（如免费通行、补贴），这些可以用负权边表示。Bellman-Ford 可以在包含这些负权路段的网络中找到最短路径。

## 总结

Bellman-Ford 算法是处理含负权边图的最短路径问题的经典解决方案。

**关键要点**：
- 基于松弛操作，执行 V-1 轮迭代，时间复杂度 O(VE)
- 能够正确处理负权边，这是 Dijkstra 算法做不到的
- 通过额外的第 V 轮松弛可以检测负权环
- SPFA 是其队列优化版本，平均性能更优
- 实现简单，是理解图算法的重要基础

**适用场景**：
- 图中含有负权边
- 需要检测负权环（如货币套汇检测）
- 稀疏图的单源最短路径
- 差分约束系统求解

**局限性**：
- 时间复杂度 O(VE)，对于大规模稠密图不如 Dijkstra 高效
- 不能处理存在负权环的图（最短路径无定义）
- SPFA 最坏情况仍为 O(VE)

掌握 Bellman-Ford 算法，不仅能解决含负权边的最短路径问题，更能加深对松弛操作和动态规划思想的理解。结合 Dijkstra 和 Floyd-Warshall，你就拥有了完整的最短路径算法工具箱。
