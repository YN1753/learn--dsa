# 图 (Graph)

## 概念解释

图是一种由**顶点**（Vertex，也叫节点 Node）和**边**（Edge）组成的数据结构，用于表示对象之间的关系。与树不同，图没有严格的层次结构，任意两个顶点之间都可以有连接。

### 核心术语

- **顶点 (Vertex)**：图中的基本单元，代表一个对象或实体。例如社交网络中的一个用户、地图中的一个城市。
- **边 (Edge)**：连接两个顶点的关系。边可以是有向的或无向的，可以有权重。
- **有向图 (Directed Graph)**：边有方向，从一个顶点指向另一个顶点。例如 Twitter 的关注关系——你关注某人，但对方不一定关注你。
- **无向图 (Undirected Graph)**：边没有方向，表示双向关系。例如微信好友关系——A 是 B 的好友，B 也是 A 的好友。
- **加权图 (Weighted Graph)**：每条边有一个数值权重，表示距离、时间、费用等。例如地图上两个城市之间的距离。
- **度 (Degree)**：与一个顶点相连的边的数量。在有向图中分为**入度**（指向该顶点的边数）和**出度**（从该顶点出发的边数）。
- **路径 (Path)**：从一个顶点到另一个顶点经过的顶点序列。路径长度通常用经过的边数或权重之和来衡量。
- **环 (Cycle)**：起点和终点相同的路径。有环图和无环图（DAG，有向无环图）在算法处理上有很大区别。

```
无向图示例:                有向图示例:
  A --- B                  A → B
  |     |                  ↑   ↓
  C --- D                  D ← C

加权图示例:
  A --5-- B
  |       |
  3       2
  |       |
  C --7-- D
```

## 为什么重要

图是计算机科学中用途最广泛的数据结构之一，它能自然地建模现实世界中的各种关系网络：

**社交网络**：Facebook、微信等社交平台中，用户是顶点，好友关系是边。通过图算法可以找到"你可能认识的人"（共同好友）、计算社交距离、检测社区结构。

**地图与导航**：Google Maps、高德地图等导航系统中，路口是顶点，道路是边，距离或时间是权重。Dijkstra 算法、A* 算法等图的最短路径算法是导航的核心。

**依赖管理**：编译器、包管理器（npm、pip）使用有向无环图（DAG）来表示模块之间的依赖关系，通过拓扑排序确定编译或安装顺序。

**网络路由**：互联网中的路由器使用图算法（如 OSPF、BGP）来确定数据包的最优传输路径。

**搜索引擎**：Google 的 PageRank 算法将互联网看作一个巨大的有向图——网页是顶点，超链接是边，通过分析链接结构来评估网页的重要性。

## 核心原理

### 图的存储方式

**邻接矩阵 (Adjacency Matrix)**

用一个 V×V 的二维数组表示图，`matrix[i][j]` 表示顶点 i 和顶点 j 之间是否有边（或边的权重）。

```typescript
// 邻接矩阵表示
//   0  1  2  3
// 0[0, 1, 1, 0]    顶点 0 连接 1, 2
// 1[1, 0, 0, 1]    顶点 1 连接 0, 3
// 2[1, 0, 0, 1]    顶点 2 连接 0, 3
// 3[0, 1, 1, 0]    顶点 3 连接 1, 2

const matrix: number[][] = [
  [0, 1, 1, 0],
  [1, 0, 0, 1],
  [1, 0, 0, 1],
  [0, 1, 1, 0],
]
```

**邻接表 (Adjacency List)**

用数组（或哈希表）存储每个顶点的邻居列表。每个顶点对应一个链表或数组，包含所有与之相邻的顶点。

```typescript
// 邻接表表示
const adjList: Map<number, number[]> = new Map([
  [0, [1, 2]],
  [1, [0, 3]],
  [2, [0, 3]],
  [3, [1, 2]],
])
```

**两种方式的对比：**

| 操作 | 邻接矩阵 | 邻接表 |
|------|----------|--------|
| 空间复杂度 | O(V²) | O(V + E) |
| 判断两顶点是否相邻 | O(1) | O(degree) |
| 获取某顶点的所有邻居 | O(V) | O(degree) |
| 添加边 | O(1) | O(1) |
| 删除边 | O(1) | O(degree) |
| 适用场景 | 稠密图 | 稀疏图 |

大多数实际应用中，图是稀疏的（边数远小于 V²），因此邻接表更为常用。

### 广度优先搜索 (BFS)

BFS 从起始顶点开始，逐层向外扩展访问。它使用**队列**来管理待访问的顶点，保证按距离从近到远的顺序访问。

```typescript
function bfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>()
  const queue: number[] = [start]
  const result: number[] = []
  visited.add(start)

  while (queue.length > 0) {
    const node = queue.shift()!  // 出队
    result.push(node)
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)  // 入队
      }
    }
  }
  return result
}
```

**BFS 的特点：**
- 使用队列（FIFO）管理访问顺序
- 找到的路径是**最短路径**（无权图中）
- 时间复杂度：O(V + E)
- 空间复杂度：O(V)

### 深度优先搜索 (DFS)

DFS 从起始顶点开始，沿着一条路径尽可能深入，遇到死胡同再回溯。它使用**栈**（或递归调用栈）来实现。

```typescript
function dfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>()
  const result: number[] = []

  function traverse(node: number) {
    visited.add(node)
    result.push(node)
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        traverse(neighbor)  // 递归深入
      }
    }
  }

  traverse(start)
  return result
}
```

**DFS 的特点：**
- 使用栈（LIFO）或递归来管理访问顺序
- 适合探索所有路径、检测环、拓扑排序
- 时间复杂度：O(V + E)
- 空间复杂度：O(V)

### BFS vs DFS 对比

| 特性 | BFS | DFS |
|------|-----|-----|
| 数据结构 | 队列 | 栈/递归 |
| 访问顺序 | 逐层扩展 | 深入到底再回溯 |
| 最短路径 | 无权图中最短 | 不保证最短 |
| 空间开销 | 较大（需存储整层） | 较小（只需一条路径） |
| 适用场景 | 最短路径、层序遍历 | 拓扑排序、环检测、连通分量 |

## 可视化说明

在可视化界面中，你可以直观地观察图的结构和遍历过程：

1. **图的展示**：顶点以圆形显示，边以线条连接。顶点可以拖拽重新排列，方便观察图的结构。
2. **BFS 动画**：选择 BFS 模式后，可以看到队列的变化过程。节点颜色会变化——灰色表示未访问、黄色表示已入队、蓝色表示正在访问、深色表示已访问完成。
3. **DFS 动画**：选择 DFS 模式后，可以看到栈的变化过程。DFS 会沿着一条路径深入到底，再回溯探索其他分支。
4. **速度控制**：通过滑块调整动画速度，可以慢速观察每个步骤，也可以快速浏览整体过程。

## 常见错误

### 1. 忘记维护 visited 集合导致死循环

```typescript
// ❌ 错误：没有 visited 集合，遇到环会无限循环
function bfsWrong(graph: Map<number, number[]>, start: number) {
  const queue = [start]
  while (queue.length > 0) {
    const node = queue.shift()!
    for (const neighbor of graph.get(node) || []) {
      queue.push(neighbor)  // 已访问过的节点会重复入队！
    }
  }
}

// ✅ 正确：使用 visited 集合避免重复访问
function bfsCorrect(graph: Map<number, number[]>, start: number) {
  const visited = new Set<number>([start])
  const queue = [start]
  while (queue.length > 0) {
    const node = queue.shift()!
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }
}
```

这是图的遍历中最常见也最危险的错误。树的遍历不需要 visited 集合（因为树没有环），但图可能有环，不记录已访问节点会导致无限循环。

### 2. 混淆有向图和无向图

```typescript
// 添加边时，无向图需要添加两个方向
function addEdge(graph: Map<number, number[]>, u: number, v: number, directed: boolean) {
  if (!graph.has(u)) graph.set(u, [])
  graph.get(u)!.push(v)

  if (!directed) {
    // ❌ 常见错误：忘记添加反向边
    if (!graph.has(v)) graph.set(v, [])
    graph.get(v)!.push(u)
  }
}
```

### 3. 邻接矩阵处理稀疏图浪费空间

对于 10000 个顶点、50000 条边的图，邻接矩阵需要 10000² = 1 亿个单元，而邻接表只需要约 60000 个单元。在实际工程中，选择合适的存储方式非常重要。

## 实际应用

### 1. 社交网络分析

```typescript
// 计算两个用户之间的最短社交距离
function socialDistance(friends: Map<string, string[]>, userA: string, userB: string): number {
  const visited = new Set<string>([userA])
  const queue: [string, number][] = [[userA, 0]]

  while (queue.length > 0) {
    const [user, dist] = queue.shift()!
    if (user === userB) return dist
    for (const friend of friends.get(user) || []) {
      if (!visited.has(friend)) {
        visited.add(friend)
        queue.push([friend, dist + 1])
      }
    }
  }
  return -1  // 不可达
}
```

### 2. 地图导航（Dijkstra 最短路径）

```typescript
// 加权图的最短路径
function dijkstra(graph: Map<string, [string, number][]>, start: string): Map<string, number> {
  const dist = new Map<string, number>()
  const visited = new Set<string>()
  // 使用优先队列（这里简化为数组）
  const pq: [number, string][] = [[0, start]]
  dist.set(start, 0)

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, node] = pq.shift()!
    if (visited.has(node)) continue
    visited.add(node)
    for (const [neighbor, weight] of graph.get(node) || []) {
      const newDist = d + weight
      if (!dist.has(neighbor) || newDist < dist.get(neighbor)!) {
        dist.set(neighbor, newDist)
        pq.push([newDist, neighbor])
      }
    }
  }
  return dist
}
```

### 3. 编译器依赖分析（拓扑排序）

```typescript
// Kahn 算法：拓扑排序
function topologicalSort(graph: Map<number, number[]>, inDegree: Map<number, number>): number[] {
  const queue: number[] = []
  const result: number[] = []

  // 找到所有入度为 0 的节点
  for (const [node, deg] of inDegree) {
    if (deg === 0) queue.push(node)
  }

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    for (const neighbor of graph.get(node) || []) {
      const newDeg = inDegree.get(neighbor)! - 1
      inDegree.set(neighbor, newDeg)
      if (newDeg === 0) queue.push(neighbor)
    }
  }

  if (result.length !== graph.size) {
    throw new Error('图中存在环，无法进行拓扑排序')
  }
  return result
}
```

### 4. 网页爬虫

```typescript
// 简化的网页爬虫：BFS 遍历链接
async function crawl(startUrl: string, maxPages: number): Promise<string[]> {
  const visited = new Set<string>([startUrl])
  const queue = [startUrl]
  const pages: string[] = []

  while (queue.length > 0 && pages.length < maxPages) {
    const url = queue.shift()!
    pages.push(url)
    const links = await fetchLinks(url)  // 获取页面中的链接
    for (const link of links) {
      if (!visited.has(link)) {
        visited.add(link)
        queue.push(link)
      }
    }
  }
  return pages
}
```

## 总结

图是最通用的数据结构之一，能够建模各种复杂的关系网络。掌握图的关键要点：

1. **两种存储方式**：邻接矩阵适合稠密图，邻接表适合稀疏图。实际工程中邻接表更常用。
2. **BFS 与 DFS**：BFS 逐层扩展，适合求最短路径；DFS 深入探索，适合拓扑排序和环检测。两者时间复杂度都是 O(V + E)。
3. **visited 集合必不可少**：图可能有环，必须记录已访问节点，否则会陷入无限循环。
4. **丰富的实际应用**：社交网络、地图导航、依赖管理、网络路由、搜索引擎等，图无处不在。

掌握了图的基本概念和算法，你就具备了处理复杂网络问题的能力，为学习更高级的图算法（最短路径、最小生成树、网络流等）打下了坚实基础。
