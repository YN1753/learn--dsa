# Floyd-Warshall 最短路径算法

## 概念解释

**Floyd-Warshall 算法**（简称 Floyd 算法）是一种用于求解**所有顶点对之间最短路径**（All-Pairs Shortest Path）的经典动态规划算法。与 Dijkstra 算法每次只能求出一个源点到其他顶点的最短路径不同，Floyd 算法一次运行就能得到图中任意两个顶点之间的最短距离。

### 核心概念

**全源最短路径 (All-Pairs Shortest Path)**
给定一个带权有向图或无向图，求出每一对顶点 (i, j) 之间的最短路径长度。如果有 n 个顶点，最终结果是一个 n×n 的距离矩阵。

**动态规划与中间顶点**
Floyd 算法的核心思想是引入"中间顶点"的概念。定义 `dist[i][j]` 为从顶点 i 到顶点 j、只允许经过前 k 个顶点作为中间节点时的最短路径长度。当 k 从 0 递增到 n-1 时，dist[i][j] 就是从 i 到 j 允许经过所有顶点的最短路径。

**松弛操作的推广**
与 Dijkstra 算法对单条边进行松弛不同，Floyd 算法对每一对顶点 (i, j) 通过中间顶点 k 进行松弛：
```
dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
```
这意味着：如果经过顶点 k 能让 i 到 j 的路径更短，就更新距离。

## 为什么重要

Floyd-Warshall 算法在图论和实际应用中具有重要地位：

- **实现简单**：核心代码仅需三重循环，不到 10 行代码即可实现
- **处理负权边**：与 Dijkstra 不同，Floyd 可以正确处理含负权边的图（但不能有负权环）
- **传递闭包**：通过简单修改可以判断任意两点间是否存在路径
- **同时获得路径**：通过额外的前驱矩阵，可以重建任意两点间的具体最短路径
- **检测负权环**：如果算法结束后 `dist[i][i] < 0`，说明存在经过顶点 i 的负权环

### 与其他算法的比较

| 特性 | Floyd-Warshall | Dijkstra（运行 V 次） | Bellman-Ford（运行 V 次） |
|------|---------------|----------------------|--------------------------|
| 时间复杂度 | O(V³) | O(V(V+E) log V) | O(V²E) |
| 空间复杂度 | O(V²) | O(V²) | O(V²) |
| 负权边 | 支持 | 不支持 | 支持 |
| 负权环检测 | 支持 | 不支持 | 支持 |
| 实现难度 | 极简 | 中等 | 中等 |
| 适用场景 | 稠密图 | 稀疏图 | 稀疏图 |

对于稠密图（E 接近 V²），Floyd 的 O(V³) 与运行 V 次 Dijkstra 的 O(V³ log V) 相比反而更优。

## 核心原理

### 状态定义

定义三维状态 `dp[k][i][j]`：从顶点 i 到顶点 j，只允许经过编号为 0 到 k-1 的顶点作为中间节点时的最短路径长度。

实际实现中，可以使用空间优化，只保留二维数组 `dist[i][j]`，通过 k 的迭代逐步更新。

### 状态转移方程

```
dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
```

含义：从 i 到 j 的最短路径，要么是当前已知的最短路径 `dist[i][j]`，要么是先从 i 到 k（`dist[i][k]`），再从 k 到 j（`dist[k][j]`）的路径。

### 初始化

```typescript
// 初始化距离矩阵
const INF = Infinity
const dist: number[][] = [
  //   A    B    C    D    E
  [  0,   3, INF,   7, INF],  // A
  [INF,   0,   1, INF, INF],  // B
  [INF, INF,   0,   2, INF],  // C
  [INF, INF, INF,   0,   1],  // D
  [  4, INF, INF, INF,   0],  // E
]

// dist[i][j] = 边(i,j)的权重，如果不存在则为无穷大
// dist[i][i] = 0（自己到自己的距离为 0）
```

### 算法步骤

```typescript
function floyd(dist: number[][]): number[][] {
  const n = dist.length

  // 三重循环：k 必须在最外层！
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        // 如果经过 k 能缩短 i 到 j 的距离
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j]
        }
      }
    }
  }

  return dist
}
```

### 路径重建

除了距离矩阵，还需要维护一个前驱矩阵 `next[i][j]` 来记录最短路径：

```typescript
// 初始化 next 矩阵
const next: number[][] = []
for (let i = 0; i < n; i++) {
  next[i] = []
  for (let j = 0; j < n; j++) {
    if (dist[i][j] !== INF) {
      next[i][j] = j  // 如果有边 i->j，下一步就是 j
    } else {
      next[i][j] = -1  // 不可达
    }
  }
}

// 在 Floyd 主循环中更新 next
if (dist[i][k] + dist[k][j] < dist[i][j]) {
  dist[i][j] = dist[i][k] + dist[k][j]
  next[i][j] = next[i][k]  // 路径经过 k，下一步沿 i->k 的路径走
}

// 重建从 u 到 v 的路径
function getPath(next: number[][], u: number, v: number): number[] {
  if (next[u][v] === -1) return []  // 不可达
  const path = [u]
  let current = u
  while (current !== v) {
    current = next[current][v]
    path.push(current)
  }
  return path
}
```

### 执行过程示例

考虑 4 个顶点的有向图：

```
    1       3
 A -----> B -----> D
 |               ^
 | 7             | 1
 v       2       |
 C ------->------+
```

初始距离矩阵：
```
     A    B    C    D
A  [ 0,   1, INF, INF]
B  [INF,  0, INF,   3]
C  [INF, INF,  0,   2]
D  [INF, INF, INF,  0]
```

**k=0（经过 A）**：检查所有 (i,j) 是否可以通过 A 缩短。没有更新。

**k=1（经过 B）**：
- dist[A][D] = min(INF, dist[A][B] + dist[B][D]) = min(INF, 1+3) = 4，更新！

**k=2（经过 C）**：
- dist[A][D] = min(4, dist[A][C] + dist[C][D]) = min(4, INF+2) = 4，不更新。

**k=3（经过 D）**：没有更新。

最终距离矩阵：
```
     A    B    C    D
A  [ 0,   1, INF,   4]
B  [INF,  0, INF,   3]
C  [INF, INF,  0,   2]
D  [INF, INF, INF,  0]
```

### 时间与空间复杂度

| 指标 | 复杂度 | 说明 |
|------|--------|------|
| 时间 | O(V³) | 三重循环，每重遍历 V 个顶点 |
| 空间 | O(V²) | 存储距离矩阵和前驱矩阵 |

## 可视化说明

通过可视化可以直观理解 Floyd 算法的执行过程：

1. **距离矩阵**：以 n×n 的二维网格展示所有顶点对之间的当前最短距离
2. **当前中间顶点 k**：高亮显示当前正在作为中间顶点的节点
3. **正在检查的 (i, j) 对**：高亮显示当前正在尝试通过 k 进行松弛的顶点对
4. **距离更新**：当 dist[i][j] 被更新时，单元格会闪烁并显示新旧值的变化
5. **负权环检测**：如果 dist[i][i] 变为负数，会发出警告提示存在负权环

通过逐步执行，你可以观察到距离矩阵如何随着中间顶点的增加而逐步优化。

## 常见错误

### 1. 循环顺序错误：k 必须在最外层

**错误写法**：
```typescript
// 错误！i-j-k 顺序
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    for (let k = 0; k < n; k++) {
      dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j])
    }
  }
}
```

**为什么错误**：这不再是动态规划，而是一种贪心策略，无法保证正确性。因为当更新 dist[i][j] 时，dist[i][k] 或 dist[k][j] 可能已经被本轮的其他更新修改过，导致结果不正确。

**正确写法**：k 必须在最外层，确保每次只增加一个"允许经过的中间顶点"。

### 2. 未正确初始化 dist[i][i]

**错误写法**：
```typescript
// 只初始化了边权，忘记设置 dist[i][i] = 0
const dist = adjMatrix  // 可能对角线是 INF 或其他值
```

**正确写法**：
```typescript
for (let i = 0; i < n; i++) {
  dist[i][i] = 0  // 自己到自己的距离必须为 0
}
```

### 3. 未检测负权环

**错误表现**：算法结束后直接输出结果，不检查是否存在负权环。

**正确做法**：
```typescript
// 检测负权环
for (let i = 0; i < n; i++) {
  if (dist[i][i] < 0) {
    console.log(`存在经过顶点 ${i} 的负权环！`)
    // 负权环上的最短路径无意义
  }
}
```

### 4. 使用整数溢出

**错误表现**：使用 `Number.MAX_SAFE_INTEGER` 或在加法时溢出。

**正确做法**：
```typescript
const INF = Number.MAX_SAFE_INTEGER / 2  // 预留加法空间
// 或使用 Infinity（JavaScript 的浮点无穷大）
const INF = Infinity

// 检查是否溢出
if (dist[i][k] !== INF && dist[k][j] !== INF) {
  dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j])
}
```

### 5. 混淆有向图和无向图的初始化

**错误表现**：无向图只设置了一半的边权。

**正确做法**：
```typescript
// 无向图需要双向设置
function addEdge(u: number, v: number, w: number) {
  dist[u][v] = w
  dist[v][u] = w  // 无向图需要这一行
}
```

## 实际应用

### 1. 网络路由协议

在计算机网络中，Floyd 算法可用于计算网络中所有路由器之间的最短路径。每个路由器作为顶点，网络链路作为边，链路延迟或带宽作为权重。这对于网络拓扑规划和故障分析非常有用。

### 2. 传递闭包

Floyd 算法的变体可以求解传递闭包——判断图中任意两个顶点之间是否存在路径：

```typescript
// 传递闭包：将距离改为布尔值
for (let k = 0; k < n; k++) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j])
    }
  }
}
```

### 3. 图的直径

图的直径是所有顶点对之间最短路径的最大值。Floyd 算法计算完所有最短路径后，只需遍历一次距离矩阵即可找到直径：

```typescript
let diameter = 0
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    if (dist[i][j] !== INF && dist[i][j] > diameter) {
      diameter = dist[i][j]
    }
  }
}
```

### 4. 套汇检测（Arbitrage Detection）

在金融市场中，不同货币之间的汇率可以建模为图。如果将汇率取对数并取负，那么检测是否存在"套汇机会"就等价于检测负权环。Floyd 算法可以高效地完成这一检测。

### 5. 社交网络分析

在社交网络中，Floyd 算法可以计算所有用户之间的最短"社交距离"，用于分析网络的紧密程度、识别关键节点等。

## 总结

Floyd-Warshall 算法是全源最短路径问题的经典解决方案，其核心思想是通过逐步引入中间顶点来优化所有顶点对之间的路径。

**关键要点**：
- 三重循环，k-i-j 顺序，时间复杂度 O(V³)，空间复杂度 O(V²)
- 可以处理含负权边的图，但不能有负权环
- 实现极其简洁，核心代码不到 10 行
- 通过前驱矩阵可以重建具体路径
- 算法结束后检查 dist[i][i] 可以检测负权环

**适用场景**：
- 稠密图的全源最短路径
- 需要同时获得所有顶点对的最短距离
- 需要检测负权环
- 求解传递闭包
- 图的直径计算

**局限性**：
- 时间复杂度 O(V³)，对于大规模稀疏图不如多次运行 Dijkstra
- 不能处理存在负权环的图（最短路径无定义）
- 空间复杂度 O(V²)，顶点数过多时内存消耗较大

掌握 Floyd-Warshall 算法，不仅能解决全源最短路径问题，更能加深对动态规划思想的理解——通过逐步引入中间变量来分解和求解复杂问题。
