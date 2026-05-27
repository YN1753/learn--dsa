# 广度优先搜索 (BFS)

## 概念解释

广度优先搜索（Breadth-First Search，简称 BFS）是一种用于遍历或搜索图和树的算法。它的核心思想是**逐层扩展**：从起始节点开始，先访问所有距离为 1 的邻居节点，再访问所有距离为 2 的节点，依此类推。

BFS 使用**队列（Queue）**来管理待访问的节点，遵循「先进先出」(FIFO) 的原则：

1. 将起始节点加入队列
2. 从队头取出一个节点
3. 将该节点所有未访问的邻居加入队尾
4. 重复步骤 2-3，直到队列为空

```
层次展开示意：

    第0层:      A          ← 起始节点
               / \
    第1层:    B   C         ← A 的邻居
             / \   \
    第2层:  D   E   F       ← B、C 的邻居
                 \
    第3层:        G          ← F 的邻居
```

## 为什么重要

### 1. 无权图最短路径

BFS 最重要的特性：在无权图（所有边权重相同）中，BFS 第一次到达某个节点时的路径一定是**边数最少的最短路径**。这是因为 BFS 按层次扩展，先探索近的节点，再探索远的节点。

### 2. 层次遍历

BFS 天然地按「层级」顺序访问节点。这在很多场景下非常有用：
- 二叉树的层序遍历
- 按距离分层处理图中的节点
- 社交网络中查找「N度好友」

### 3. 连通性判断

BFS 可以高效地判断两个节点是否连通，以及找出图中的所有连通分量。

### 4. 算法基础

BFS 是许多高级算法的基石：
- Dijkstra 最短路径算法（BFS 的加权版本）
- Prim 最小生成树算法
- 网络流算法中的层次图构建
- 拓扑排序的 Kahn 算法

## 核心原理

### 算法流程

```
function BFS(graph, start):
    visited = new Set()
    queue = new Queue()

    visited.add(start)
    queue.enqueue(start)

    while queue is not empty:
        node = queue.dequeue()       // 从队头取出
        process(node)                 // 处理当前节点

        for each neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.enqueue(neighbor) // 加入队尾
```

### 关键要素

**1. 队列（Queue）**

队列是 BFS 的核心数据结构。它保证了「先进先出」的顺序，使得节点按层次被访问。先被发现的节点（距离更近）会先被处理。

**2. 已访问标记（Visited）**

使用一个集合或布尔数组记录每个节点是否已被访问。这是防止重复访问和避免死循环的关键。在有环的图中，如果没有 visited 标记，算法可能无限循环。

**3. 层级追踪**

通过记录每个节点的「层级」（或距离），可以知道从起始节点到任意节点的最短距离。实现方式是在将邻居节点入队时，将其层级设为当前节点层级 + 1。

### TypeScript 实现

```typescript
function bfs(graph: number[][], start: number): number[] {
  const n = graph.length
  const visited = new Array(n).fill(false)
  const dist = new Array(n).fill(-1)
  const queue: number[] = [start]

  visited[start] = true
  dist[start] = 0

  while (queue.length > 0) {
    const u = queue.shift()!
    for (const v of graph[u]) {
      if (!visited[v]) {
        visited[v] = true
        dist[v] = dist[u] + 1
        queue.push(v)
      }
    }
  }

  return dist // dist[i] 表示从 start 到 i 的最短距离
}
```

### 复杂度分析

| 指标 | 复杂度 |
|------|--------|
| 时间复杂度 | O(V + E) |
| 空间复杂度 | O(V) |

- **时间**：每个顶点最多入队出队一次 O(V)，每条边最多被检查一次 O(E)
- **空间**：visited 数组 O(V)，队列最多存储 O(V) 个节点

## 可视化说明

在可视化界面中，BFS 的执行过程通过以下方式展示：

- **图的展示**：节点用圆圈表示，边用线条连接
- **队列状态**：实时显示当前队列中的节点，左边是队头（即将取出），右边是队尾（刚加入）
- **节点着色**：
  - 蓝色：正在处理的当前节点
  - 绿色：已访问过的节点
  - 灰色：未访问的节点
- **边高亮**：正在探索的边用橙色高亮显示
- **层级标注**：每个节点下方显示其所在层级（到源点的距离）

通过动画控制栏，你可以：
- 逐步执行算法，观察每一步队列和节点状态的变化
- 播放/暂停自动动画
- 调整动画速度
- 重置到初始状态

## 常见错误

### 1. 忘记标记已访问节点

```typescript
// 错误：没有 visited 标记
while (queue.length > 0) {
  const u = queue.shift()!
  for (const v of graph[u]) {
    queue.push(v) // 可能重复入队！
  }
}

// 正确：使用 visited 数组
const visited = new Array(n).fill(false)
visited[start] = true
while (queue.length > 0) {
  const u = queue.shift()!
  for (const v of graph[u]) {
    if (!visited[v]) {
      visited[v] = true  // 入队前标记
      queue.push(v)
    }
  }
}
```

这是最常见的错误。没有 visited 标记，在有环图中算法会无限循环。

### 2. 使用栈代替队列

```typescript
// 错误：使用栈（push + pop）→ 这是 DFS，不是 BFS
stack.push(start)
while (stack.length > 0) {
  const u = stack.pop()!  // LIFO：最后加入的先取出
  // ...
}

// 正确：使用队列（push + shift）→ BFS
queue.push(start)
while (queue.length > 0) {
  const u = queue.shift()! // FIFO：最先加入的先取出
  // ...
}
```

栈是「后进先出」(LIFO)，使用栈会变成深度优先搜索（DFS），访问顺序完全不同。

### 3. 在有权图中误用 BFS 求最短路径

```typescript
// 错误：边有权重时，BFS 不保证找到最短路径
// BFS 只在无权图中保证最短路径（边数最少）

// 如果边有权重，应该使用：
// - Dijkstra 算法（非负权重）
// - Bellman-Ford 算法（可处理负权重）
```

### 4. 入队后再标记 visited

```typescript
// 有问题：在出队时才标记 visited
while (queue.length > 0) {
  const u = queue.shift()!
  visited[u] = true  // 出队时才标记
  for (const v of graph[u]) {
    if (!visited[v]) {
      queue.push(v)  // 同一个节点可能被多次入队
    }
  }
}

// 更好：在入队时就标记 visited
while (queue.length > 0) {
  const u = queue.shift()!
  for (const v of graph[u]) {
    if (!visited[v]) {
      visited[v] = true  // 入队前就标记
      queue.push(v)
    }
  }
}
```

两种方式都能得到正确结果，但在入队前标记可以避免队列中出现重复元素，效率更高。

## 实际应用

### 1. 最短路径（无权图）

在迷宫、网格或无权图中找最短路径是 BFS 最经典的应用。BFS 保证第一次到达目标时的路径就是最短的。

```typescript
// 网格迷宫中最短路径
function shortestPath(grid: number[][], start: [number, number], end: [number, number]): number {
  const m = grid.length, n = grid[0].length
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]]
  const visited = Array.from({ length: m }, () => new Array(n).fill(false))
  const queue: [number, number, number][] = [[start[0], start[1], 0]]
  visited[start[0]][start[1]] = true

  while (queue.length > 0) {
    const [x, y, dist] = queue.shift()!
    if (x === end[0] && y === end[1]) return dist
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy
      if (nx >= 0 && nx < m && ny >= 0 && ny < n && !visited[nx][ny] && grid[nx][ny] === 0) {
        visited[nx][ny] = true
        queue.push([nx, ny, dist + 1])
      }
    }
  }
  return -1 // 不可达
}
```

### 2. 社交网络分析

在社交网络中，BFS 可以用来计算「六度分隔」理论中的人际距离：
- 找出两个人之间的最短关系链
- 推荐「你可能认识的人」（2-3 度好友）
- 计算社交网络中节点的中心度

### 3. Web 爬虫

搜索引擎的爬虫程序通常使用 BFS 策略：
- 从一个种子 URL 开始
- 先抓取当前页面的所有链接
- 再抓取这些链接页面中的链接
- 这样可以按「距离」种子页面的跳数逐步扩展

### 4. 垃圾回收（可达性分析）

编程语言的垃圾回收器使用 BFS 来标记所有可达对象：
- 从根对象（全局变量、栈上的引用）开始
- 逐层遍历所有引用的对象
- 未被访问到的对象就是垃圾，可以回收

### 5. 网络广播

在计算机网络中，BFS 模型用于广播消息：
- 消息从源节点开始
- 先传给所有直接相连的节点
- 再由这些节点转发给它们的邻居
- 保证消息以最少的跳数到达所有节点

## 总结

BFS 是最基础、最重要的图算法之一：

**核心思想**：
- 使用队列实现「先进先出」的遍历顺序
- 逐层扩展，先访问近的节点，再访问远的节点
- 使用 visited 数组避免重复访问

**关键特性**：
- 在无权图中保证找到最短路径（边数最少）
- 时间复杂度 O(V + E)，空间复杂度 O(V)
- 实现简单，只需要一个队列和一个 visited 数组

**适用场景**：
- 无权图最短路径
- 层次遍历
- 连通性判断
- 按距离分层处理

**与 DFS 的对比**：

| 特性 | BFS | DFS |
|------|-----|-----|
| 数据结构 | 队列 (Queue) | 栈 (Stack) / 递归 |
| 遍历顺序 | 逐层扩展 | 深入到底再回溯 |
| 最短路径 | 无权图中保证 | 不保证 |
| 空间复杂度 | O(宽度) | O(深度) |
| 适用场景 | 最短路径、层次遍历 | 拓扑排序、连通分量 |

掌握 BFS，你就拥有了处理图论问题的基础工具。很多看似复杂的问题，本质上都可以转化为 BFS 来求解。
