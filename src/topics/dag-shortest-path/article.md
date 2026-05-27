# DAG最短路径 (Shortest Path in DAG)

## 概念解释

DAG最短路径问题是指在一个**有向无环图**（Directed Acyclic Graph, DAG）中，从一个源点出发，求得到所有其他节点的最短路径。

与一般的最短路径算法不同，DAG最短路径算法利用了图的**无环特性**，通过**拓扑排序**来保证处理顺序，从而实现更高效的求解。

### 核心思想

```
1. 对DAG进行拓扑排序，得到节点的线性序列
2. 初始化源点距离为0，其余为无穷大
3. 按拓扑序依次处理每个节点：
   对该节点的所有出边执行「松弛」操作
4. 所有节点处理完毕后，即得到最短路径
```

### 为什么拓扑序有效？

拓扑排序保证：如果存在从节点 u 到节点 v 的边，那么 u 一定排在 v 的前面。这意味着当我们处理节点 v 时，所有能到达 v 的节点都已经被处理过了，它们的最短距离已经确定。

## 为什么重要

DAG最短路径算法在理论和实践中都有重要价值：

1. **最优时间复杂度**：O(V + E)，比Dijkstra和Bellman-Ford都快
2. **处理负权边**：由于无环，不存在负权环问题
3. **关键路径法（CPM）的基础**：项目管理中的核心算法
4. **动态规划的图论视角**：很多DP问题可以建模为DAG最短路径

### 与其他算法对比

| 算法 | 时间复杂度 | 负权边 | 适用图类型 |
|------|------------|--------|------------|
| DAG最短路径 | O(V + E) | 支持 | DAG |
| Dijkstra | O(E·logV) | 不支持 | 非负权图 |
| Bellman-Ford | O(V·E) | 支持 | 任意图 |
| Floyd-Warshall | O(V³) | 支持 | 任意图 |

## 核心原理

### 算法步骤

```typescript
function dagShortestPath(
  graph: Map<number, [number, number][]>,  // 邻接表: [目标节点, 权重]
  n: number,                                // 节点数
  source: number                            // 源点
): number[] {
  // 步骤1: 拓扑排序
  const topoOrder = topologicalSort(graph, n)

  // 步骤2: 初始化距离数组
  const dist = new Array(n).fill(Infinity)
  dist[source] = 0

  // 步骤3: 按拓扑序松弛
  for (const u of topoOrder) {
    if (dist[u] === Infinity) continue  // 不可达，跳过

    for (const [v, weight] of graph.get(u) || []) {
      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight  // 松弛
      }
    }
  }

  return dist
}
```

### 松弛操作详解

松弛（Relaxation）是最短路径算法的核心操作：

```
对于边 (u, v, w)：
如果 dist[u] + w < dist[v]
则更新 dist[v] = dist[u] + w

这意味着：经过节点 u 到达 v 比当前已知路径更短
```

### 拓扑排序

拓扑排序是将DAG的节点排成线性序列，使得对于每条边 (u, v)，u 都排在 v 前面。

```typescript
function topologicalSort(
  graph: Map<number, [number, number][]>,
  n: number
): number[] {
  const inDegree = new Array(n).fill(0)

  // 计算入度
  for (const [, edges] of graph) {
    for (const [v] of edges) {
      inDegree[v]++
    }
  }

  // BFS拓扑排序
  const queue: number[] = []
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i)
  }

  const order: number[] = []
  while (queue.length > 0) {
    const u = queue.shift()!
    order.push(u)
    for (const [v] of graph.get(u) || []) {
      if (--inDegree[v] === 0) {
        queue.push(v)
      }
    }
  }

  return order
}
```

## 可视化说明

在可视化界面中，你可以直观地观察DAG最短路径算法的执行过程：

1. **图的展示**：节点按拓扑序排列，带权边用箭头连接
2. **逐步松弛**：按拓扑序依次处理节点，高亮当前正在处理的节点
3. **距离更新**：当发生松弛操作时，目标节点的距离值会动态更新
4. **路径标记**：最短路径上的边会被特殊标记

通过控制面板，你可以：
- 播放 / 暂停动画
- 单步执行
- 调整动画速度
- 重置到初始状态

## 常见错误

### 1. 未进行拓扑排序就直接遍历

```typescript
// 错误：随机顺序处理节点
for (let i = 0; i < n; i++) {
  relax(i)  // 不能保证处理顺序正确
}

// 正确：先拓扑排序，再按序处理
const order = topologicalSort(graph, n)
for (const u of order) {
  relax(u)
}
```

### 2. 对有环图使用此算法

```typescript
// 错误：有环图无法进行拓扑排序
// 如果图中有环，topologicalSort 会返回不完整的序列
// 需要先确认图是DAG

if (order.length !== n) {
  throw new Error('图中存在环，无法使用DAG最短路径算法')
}
```

### 3. 忽略不可达节点

```typescript
// 错误：未检查节点是否可达
for (const [v, w] of graph.get(u)!) {
  dist[v] = Math.min(dist[v], dist[u] + w)
}

// 正确：跳过不可达节点
if (dist[u] === Infinity) continue
for (const [v, w] of graph.get(u) || []) {
  dist[v] = Math.min(dist[v], dist[u] + w)
}
```

### 4. 混淆最短路径和最长路径

```typescript
// 最短路径：取 min
dist[v] = Math.min(dist[v], dist[u] + weight)

// 最长路径：取 max（用于关键路径法）
dist[v] = Math.max(dist[v], dist[u] + weight)
```

## 实际应用

### 1. 关键路径法（CPM）

项目管理中，用DAG表示任务依赖关系：
- 节点 = 任务
- 边 = 依赖关系，权重 = 任务耗时
- 关键路径 = 最长路径 = 项目最短完成时间

```typescript
// 求关键路径：将边权取反后求最短路径
for (const [u, edges] of graph) {
  for (let i = 0; i < edges.length; i++) {
    edges[i][1] = -edges[i][1]  // 取反
  }
}
const longestPath = dagShortestPath(graph, n, source)
```

### 2. 编译依赖分析

编译器中，源文件之间的依赖关系形成DAG：
- 按拓扑序编译可以最大化并行度
- 最短路径算法可以计算最长编译链

### 3. 动态规划问题

很多DP问题可以建模为DAG：
- 最长递增子序列（LIS）
- 背包问题
- 区间DP

### 4. 网络路由

在无环网络拓扑中：
- 节点 = 路由器
- 边 = 链路，权重 = 延迟或带宽
- 最短路径 = 最优路由

## 总结

DAG最短路径算法是一个高效且实用的图论算法：

**核心要点**：
- 利用拓扑排序保证正确的处理顺序
- 时间复杂度 O(V + E)，是最优的最短路径算法之一
- 可以处理负权边（因为无环，不存在负权环）
- 是关键路径法和许多动态规划问题的基础

**适用场景**：
- 有向无环图（DAG）上的最短路径
- 项目管理中的关键路径分析
- 编译依赖分析
- 将DP问题建模为图论问题

**与其他算法的关系**：
- 是Dijkstra算法在DAG上的特化版本
- 与Bellman-Ford相比，利用无环特性避免了重复松弛
- 是理解更复杂最短路径算法的基础
