# 树的直径 (Tree Diameter)

## 概念解释

**树的直径**是指树中任意两个节点之间最长路径的长度（以边数计算）。

直观理解：想象一棵树是一张地图，直径就是地图上「相隔最远」的两个地点之间的距离。

```
        1
       / \
      2   3
     / \   \
    4   5   6
       / \
      7   8
     /
    9

直径路径: 9 -> 7 -> 5 -> 2 -> 1 -> 3 -> 6  (长度 = 6)
或者:     9 -> 7 -> 5 -> 2 -> 1 -> 3 -> 6
或者:     4 -> 2 -> 1 -> 3 -> 6  (长度 = 4，不是直径)
```

### 关键术语

| 术语 | 说明 |
|------|------|
| 直径 (Diameter) | 树中最长路径的边数 |
| 直径端点 | 直径路径的两个端点 |
| 树的中心 | 直径路径的中点，到所有叶子的最大距离最小 |

## 为什么重要

树的直径是图论中的基础概念：

1. **最小高度树**：树的中心就是最小高度树的根，网络设计中用于最小化最大延迟
2. **网络拓扑**：评估网络中两个节点之间的最大通信延迟
3. **算法基础**：许多树上问题的求解依赖于直径的性质
4. **竞赛常考**：NOI/ICPC 等竞赛中频繁出现

## 核心原理

### 方法一：两次 BFS/DFS（推荐）

这是最常用、最简洁的方法，基于一个关键性质：

> **性质**：从任意节点出发，距离它最远的节点一定是直径的一个端点。

**算法步骤**：

1. 从任意节点（如节点 1）出发，执行 BFS/DFS，找到距离最远的节点 u
2. 从 u 出发，再次执行 BFS/DFS，找到距离最远的节点 v
3. u 到 v 的距离就是树的直径

```typescript
function treeDiameter(n: number, edges: [number, number][]): number {
  // 构建邻接表
  const adj: number[][] = Array.from({ length: n + 1 }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }

  // BFS 函数
  function bfs(start: number): { farthest: number; dist: number } {
    const dist = new Array(n + 1).fill(-1)
    const queue: number[] = [start]
    dist[start] = 0
    let farthest = start

    while (queue.length > 0) {
      const node = queue.shift()!
      if (dist[node] > dist[farthest]) farthest = node
      for (const neighbor of adj[node]) {
        if (dist[neighbor] === -1) {
          dist[neighbor] = dist[node] + 1
          queue.push(neighbor)
        }
      }
    }

    return { farthest, dist: dist[farthest] }
  }

  // 第一次 BFS
  const { farthest: u } = bfs(1)
  // 第二次 BFS
  const { dist: diameter } = bfs(u)

  return diameter
}
```

**时间复杂度**：O(n)，两次 BFS 各 O(n)

**空间复杂度**：O(n)，存储邻接表和距离数组

### 方法二：树形 DP

树形 DP 方法可以在一次 DFS 中同时求出直径，适合需要额外信息的场景。

**核心思想**：对于每个节点，维护从它向下走的最长链 d1 和次长链 d2。经过该节点的最长路径为 d1 + d2。

```typescript
function treeDiameterDP(n: number, edges: [number, number][]): number {
  const adj: number[][] = Array.from({ length: n + 1 }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }

  let diameter = 0

  function dfs(node: number, parent: number): number {
    let d1 = 0, d2 = 0 // 最长链和次长链

    for (const child of adj[node]) {
      if (child === parent) continue
      const childLen = dfs(child, node) + 1
      if (childLen > d1) {
        d2 = d1
        d1 = childLen
      } else if (childLen > d2) {
        d2 = childLen
      }
    }

    diameter = Math.max(diameter, d1 + d2)
    return d1
  }

  dfs(1, -1)
  return diameter
}
```

**时间复杂度**：O(n)

**空间复杂度**：O(n)

### 为什么两次 BFS 有效？

**证明概要**：

设直径的两个端点为 a 和 b，直径长度为 D。

1. 从任意节点 s 出发，设距离 s 最远的节点为 u
2. 假设 u 不是直径端点，则 dist(s, u) >= dist(s, a) 且 dist(s, u) >= dist(s, b)
3. 利用树的唯一路径性质和三角不等式，可以推出矛盾
4. 因此 u 必然是直径端点之一

## 直径的重要性质

### 性质 1：直径路径必经中心

直径路径的中点（或中边）是树的中心，从中心到所有叶子的最大距离最小。

### 性质 2：直径的唯一性与不唯一性

- 直径的**值**（最长路径长度）是唯一的
- 直径的**路径**可能不唯一（可能有多条等长的最长路径）

### 性质 3：子树直径不超过原树直径

删除任意边后，每个连通分量的直径不超过原树直径。

## 可视化说明

在可视化界面中，树的直径求解过程分为两个阶段：

```
阶段 1：从节点 1 BFS
  1 (d=0)
  ├── 2 (d=1)
  │   ├── 4 (d=2)
  │   └── 5 (d=2)
  │       ├── 7 (d=3)
  │       │   └── 9 (d=4)  <-- 最远节点 u
  │       └── 8 (d=3)
  └── 3 (d=1)
      └── 6 (d=2)

阶段 2：从节点 9 BFS
  9 (d=0)
  └── 7 (d=1)
      └── 5 (d=2)
          ├── 2 (d=3)
          │   ├── 1 (d=4)
          │   │   └── 3 (d=5)
          │   │       └── 6 (d=6)  <-- 最远节点 v
          │   └── 4 (d=4)
          └── 8 (d=3)

直径 = 6，路径: 9 -> 7 -> 5 -> 2 -> 1 -> 3 -> 6
```

通过可视化可以观察：
- 第一次 BFS 如何找到直径端点
- 第二次 BFS 如何确定直径长度
- 直径路径在树中的位置

## 常见错误

### 1. 混淆节点数和边数

```typescript
// 错误：直径应该是边数，不是节点数
const diameter = path.length // 这是节点数

// 正确：
const diameter = path.length - 1 // 边数 = 节点数 - 1
```

### 2. 忘记处理无向树

```typescript
// 错误：只添加单向边
adj[u].push(v)

// 正确：无向树需要双向边
adj[u].push(v)
adj[v].push(u)
```

### 3. 树形 DP 中忘记排除父节点

```typescript
// 错误：遍历所有邻居，包括父节点
for (const child of adj[node]) {
  const childLen = dfs(child, node) + 1 // 可能回到父节点，导致无限循环
}

// 正确：排除父节点
for (const child of adj[node]) {
  if (child === parent) continue
  const childLen = dfs(child, node) + 1
}
```

### 4. BFS 初始化距离为 0 而非 -1

```typescript
// 错误：初始化为 0，无法区分未访问节点
const dist = new Array(n + 1).fill(0)

// 正确：初始化为 -1 表示未访问
const dist = new Array(n + 1).fill(-1)
```

## 实际应用

### 1. 网络延迟优化

在网络拓扑中，树的直径代表最大通信延迟。通过找到树的中心作为路由器位置，可以最小化最坏情况下的延迟。

### 2. 最小高度树

LeetCode 310「最小高度树」：找到以哪个节点为根时树的高度最小。答案就是直径路径的中点（一个或两个）。

```typescript
function findMinHeightTrees(n: number, edges: number[][]): number[] {
  // 1. 两次 BFS 找直径
  // 2. 直径路径的中点即为答案
  if (n === 1) return [0]
  // ... 实现省略
}
```

### 3. 树的中心分解

在树的中心分解（Centroid Decomposition）中，首先需要找到树的中心，而树的中心恰好在直径路径上。

### 4. 生物信息学

在进化树分析中，树的直径代表物种之间的最大进化距离，用于评估生物多样性。

## 两种方法对比

| 特性 | 两次 BFS/DFS | 树形 DP |
|------|-------------|---------|
| 实现难度 | 简单 | 中等 |
| 遍历次数 | 2 次 | 1 次 |
| 额外信息 | 只能得到直径 | 可同时得到每个节点的最长链 |
| 适用场景 | 只需求直径 | 需要更多树上信息 |
| 代码量 | 少 | 稍多 |

## 总结

树的直径是一个基础而重要的概念：

**核心算法**：
- 两次 BFS/DFS：O(n)，简单高效，推荐首选
- 树形 DP：O(n)，一次遍历，适合需要额外信息的场景

**关键性质**：
- 从任意节点出发的最远节点一定是直径端点
- 直径路径的中点是树的中心
- 直径值唯一，但路径可能不唯一

**适用场景**：
- 网络延迟优化
- 最小高度树
- 树的中心分解
- 生物进化树分析

掌握树的直径是理解树上算法的重要一步，它连接了 BFS/DFS、动态规划和树的结构性质等多个核心概念。
