# Dinic最大流算法

## 概念解释

Dinic算法（也称为Dinitz算法）是一种求解**网络最大流**问题的高效算法，由以色列计算机科学家Yefim Dinitz于1970年提出。

### 核心思想

Dinic算法的核心思想是**分层图+阻塞流**：

1. **层次图(Level Graph)**：用BFS将图分层，只保留从第i层到第i+1层的边
2. **阻塞流(Blocking Flow)**：在层次图上用DFS找所有增广路，直到无法再增广
3. **多路增广**：一次BFS后，DFS可以找到多条增广路，提高了效率

### 基本术语

| 术语 | 说明 |
|------|------|
| 源点 (Source) | 流的起点，通常记为S或0 |
| 汇点 (Sink) | 流的终点，通常记为T或n-1 |
| 容量 (Capacity) | 边能承载的最大流量 |
| 流量 (Flow) | 边上实际通过的流量 |
| 残余容量 | 容量 - 流量，表示还能增加的流量 |
| 增广路 | 从源点到汇点的一条可增广路径 |
| 层次图 | BFS分层后只保留相邻层边的子图 |
| 阻塞流 | 层次图中无法再找到增广路时的流 |

## 为什么重要

Dinic算法在网络流领域具有重要地位：

1. **理论最优性**：时间复杂度O(V²E)，优于Ford-Fulkerson和Edmonds-Karp
2. **实践高效**：多路增广使得实际运行速度非常快
3. **应用广泛**：二分图匹配、网络可靠性、项目选择等问题的基础
4. **优化基础**：ISAP、HLPP等更高级算法都基于Dinic的思想

## 核心原理

### 算法流程

```
1. 初始化：所有边流量为0
2. 循环：
   a. BFS构建层次图
      - 从源点出发，按距离分层
      - 只保留 capacity - flow > 0 的边
      - 如果汇点不可达，算法结束
   b. DFS寻找阻塞流
      - 在层次图上用DFS找增广路
      - 使用当前弧优化（ptr数组）
      - 直到无法再找到增广路
3. 返回总流量
```

### BFS构建层次图

```typescript
function bfs(graph, source, sink): number[] {
  const level = new Array(graph.nodes).fill(-1)
  level[source] = 0
  const queue = [source]

  while (queue.length > 0) {
    const u = queue.shift()
    for (const edge of graph.adj[u]) {
      // 只走有残余容量的边
      if (level[edge.to] === -1 && edge.capacity - edge.flow > 0) {
        level[edge.to] = level[u] + 1
        queue.push(edge.to)
      }
    }
  }
  return level
}
```

**关键点**：
- BFS确保找到的是最短增广路
- level数组记录每个节点的层数
- 如果level[sink] == -1，说明汇点不可达，算法结束

### DFS寻找阻塞流

```typescript
function dfs(graph, u, sink, pushed, level, ptr): number {
  if (u === sink || pushed === 0) return pushed

  // 当前弧优化：从上次断开的地方继续
  for (; ptr[u] < graph.adj[u].length; ptr[u]++) {
    const edge = graph.adj[u][ptr[u]]

    // 只走下一层的边
    if (level[edge.to] !== level[u] + 1) continue
    if (edge.capacity - edge.flow <= 0) continue

    const flow = dfs(graph, edge.to, sink,
      Math.min(pushed, edge.capacity - edge.flow), level, ptr)

    if (flow > 0) {
      edge.flow += flow
      // 反向边
      graph.edges[edge.reverseId].flow -= flow
      return flow
    }
  }
  return 0
}
```

### 当前弧优化

当前弧优化（Current Arc Optimization）是Dinic算法的关键优化：

```typescript
const ptr = new Array(graph.nodes).fill(0)

// 在DFS中使用ptr[u]作为起始位置
for (; ptr[u] < graph.adj[u].length; ptr[u]++) {
  // ...
}
```

**原理**：
- 每次DFS后，已经处理过的边不需要再检查
- ptr[u]记录节点u下次DFS应该从哪条边开始
- 避免重复检查已饱和的边

### 多路增广

一次BFS构建层次图后，可以进行多次DFS增广：

```typescript
const ptr = new Array(graph.nodes).fill(0)
let pushed

// 反复DFS直到找不到增广路
while ((pushed = dfs(graph, source, sink, Infinity, level, ptr)) > 0) {
  totalFlow += pushed
}
```

这就是「阻塞流」的含义：在层次图中找到所有可能的增广路，直到阻塞。

### 完整算法

```typescript
function dinic(graph, source, sink): number {
  let totalFlow = 0

  while (true) {
    // 1. BFS构建层次图
    const level = bfs(graph, source, sink)
    if (level[sink] === -1) break  // 汇点不可达，结束

    // 2. DFS寻找阻塞流
    const ptr = new Array(graph.nodes).fill(0)
    let pushed
    while ((pushed = dfs(graph, source, sink, Infinity, level, ptr)) > 0) {
      totalFlow += pushed
    }
  }

  return totalFlow
}
```

## 时间复杂度分析

### O(V²E) 的证明

1. **BFS次数**：每次BFS后，汇点的层数至少增加1，最多进行O(V)次BFS
2. **每次BFS后的DFS**：使用当前弧优化后，所有DFS的总时间是O(VE)
3. **总时间**：O(V) * O(VE) = O(V²E)

### 特殊情况

- **单位容量网络**（每条边容量为1）：O(E√V)
- **二分图匹配**：O(E√V)

## 可视化说明

在可视化界面中，Dinic算法的执行过程分为两个阶段：

### 阶段1：BFS构建层次图

```
源点(层0) --> 节点A(层1) --> 节点B(层2) --> 汇点(层3)
     \         /
      \       /
       节点C(层1) --> 节点D(层2)
```

- 从源点出发，按BFS顺序给每个节点标记层数
- 只保留从低层到高层的边
- 形成一个DAG（有向无环图）

### 阶段2：DFS找阻塞流

```
路径1: 源点 -> A -> B -> 汇点 (增广5)
路径2: 源点 -> C -> D -> 汇点 (增广3)
路径3: 源点 -> A -> D -> 汇点 (增广2)
```

- 在层次图上用DFS找增广路
- 找到后更新残余网络
- 继续找下一条，直到阻塞

### 交互操作

- **播放**：自动执行算法步骤
- **暂停/继续**：控制执行节奏
- **单步**：一步一步查看算法过程
- **速度调节**：控制动画播放速度
- **重置**：重新开始

## 常见错误

### 1. 忘记添加反向边

```typescript
// 错误：只添加正向边
addEdge(graph, 0, 1, 10)

// 正确：同时添加反向边（容量为0）
addEdge(graph, 0, 1, 10)
// 反向边自动添加，容量为0
```

反向边是残余网络的核心，允许算法「撤销」之前的决策。

### 2. 混淆BFS和DFS的作用

```typescript
// 错误理解：BFS找增广路
// 正确理解：BFS构建层次图，DFS在层次图上找增广路
```

- BFS的作用是分层，确保找到最短增广路
- DFS的作用是在层次图上找所有增广路

### 3. 忘记当前弧优化

```typescript
// 错误：每次都从0开始
for (let i = 0; i < graph.adj[u].length; i++) { ... }

// 正确：使用ptr数组
for (; ptr[u] < graph.adj[u].length; ptr[u]++) { ... }
```

没有当前弧优化，时间复杂度会退化。

### 4. 残余容量计算错误

```typescript
// 错误：直接比较flow和capacity
if (edge.flow < edge.capacity) { ... }

// 正确：使用残余容量
if (edge.capacity - edge.flow > 0) { ... }
```

## 实际应用

### 1. 二分图最大匹配

将二分图转化为网络流：
- 源点连接左部所有节点（容量1）
- 匹配边连接左右两部（容量1）
- 右部所有节点连接汇点（容量1）
- 最大流 = 最大匹配数

### 2. 网络带宽分配

在通信网络中，Dinic算法可以：
- 计算两点之间的最大传输带宽
- 优化网络资源分配
- 发现网络瓶颈

### 3. 项目选择问题

给定项目和依赖关系：
- 源点连接有利润的项目（容量=利润）
- 有依赖的项目之间连边（容量=INF）
- 有成本的项目连接汇点（容量=成本）
- 最大权闭合子图 = 总利润 - 最小割

### 4. 图像分割

在计算机视觉中：
- 像素作为节点
- 相邻像素之间有边
- 前景/背景概率作为源/汇边容量
- 最小割 = 最优分割

## 与其他算法的比较

| 算法 | 时间复杂度 | 特点 |
|------|------------|------|
| Ford-Fulkerson | O(E * max_flow) | 最基础，可能不终止 |
| Edmonds-Karp | O(VE²) | BFS找最短增广路 |
| **Dinic** | **O(V²E)** | **层次图+阻塞流** |
| ISAP | O(V²E) | 动态更新距离标号 |
| HLPP | O(V²√E) | 高标号预流推进 |

### Dinic vs Edmonds-Karp

| 对比项 | Dinic | Edmonds-Karp |
|--------|-------|--------------|
| 增广路搜索 | BFS+DFS | 仅BFS |
| 每轮效率 | 找多条增广路 | 只找一条 |
| 总复杂度 | O(V²E) | O(VE²) |
| 实现难度 | 中等 | 简单 |

### Dinic vs ISAP

ISAP（Improved Shortest Augmenting Path）是Dinic的优化版本：

| 对比项 | Dinic | ISAP |
|--------|-------|------|
| 层次图 | 每轮重新BFS | 动态更新标号 |
| 断层处理 | 重新BFS | Gap优化 |
| 实践速度 | 快 | 通常更快 |
| 实现难度 | 中等 | 较高 |

## 总结

Dinic算法是网络流算法的经典之作：

**优点**：
- 时间复杂度O(V²E)，优于Edmonds-Karp
- 多路增广提高实际效率
- 实现相对简单
- 适用于多种网络流问题

**缺点**：
- 对于稠密图，复杂度可能不够好
- 每轮需要重新BFS，有重复计算
- 空间复杂度O(V+E)

**适用场景**：
- 中等规模的网络流问题
- 二分图匹配
- 需要快速求解最大流的竞赛题目
- 作为更高级算法（ISAP、HLPP）的基础

**学习建议**：
- 先理解Ford-Fulkerson方法
- 掌握残余网络和增广路的概念
- 理解BFS分层的意义
- 注意当前弧优化的实现
- 多做练习题加深理解

Dinic算法是网络流学习的重要里程碑，掌握它将为学习更高级的算法打下坚实基础。
