# 0-1 BFS

## 概念解释

0-1 BFS 是一种求解**最短路**的特殊算法，适用于图中**所有边的权重仅为 0 或 1** 的情况。

它使用**双端队列（Deque）**代替普通队列，核心思想非常简单：

- 遇到**权重为 0 的边**：将邻居节点从**队头**插入（push_front）
- 遇到**权重为 1 的边**：将邻居节点从**队尾**插入（push_back）

这样就能保证双端队列中的距离**单调不递减**，每次从队头取出的节点就是当前距离最小的节点——这与 Dijkstra 算法的贪心思想完全一致，但不需要优先队列（堆），实现更简单，常数更小。

**时间复杂度**：O(V + E)，其中 V 是顶点数，E 是边数。

```
普通 BFS：所有边权重相等（通常为1），用普通队列
0-1 BFS ：边权重只有 0 和 1，用双端队列
Dijkstra ：边权重为任意非负值，用优先队列（最小堆）
```

## 为什么重要

### 1. 比 Dijkstra 更快（在适用场景下）

Dijkstra 算法使用优先队列（最小堆），每次操作需要 O(log V)。而 0-1 BFS 使用双端队列，插入和删除都是 O(1)，总复杂度 O(V + E) 比 Dijkstra 的 O((V + E) log V) 更优。

### 2. 实现简单

不需要维护堆结构，代码量与普通 BFS 几乎相同，只是将普通队列换成双端队列，并根据边权决定插入位置。

### 3. 适用场景广泛

许多看似复杂的问题可以转化为 0-1 边权图：
- 网格迷宫中某些格子移动代价为 0、某些为 1
- 图上翻转边方向的最小次数问题
- 二进制状态空间中的最短转换路径

### 4. 竞赛常考

在算法竞赛中，0-1 BFS 是高频考点，掌握它可以快速解决一类最短路问题。

## 核心原理

### 为什么双端队列能保证正确性？

关键在于：**双端队列始终保持距离的单调不递减性**。

假设当前队列为 `[d, d, d+1, d+1, d+2]`，从队头取出一个距离为 d 的节点 u：

- 如果 u 通过**权重 0 的边**到达邻居 v，则 v 的距离也是 d，放入**队头**
  - 队列变成 `[d, d, d, d+1, d+1, d+2]`，仍然单调
- 如果 u 通过**权重 1 的边**到达邻居 v，则 v 的距离是 d+1，放入**队尾**
  - 队列变成 `[d, d, d+1, d+1, d+2, d+1]`，队尾的 d+1 不破坏单调性

这保证了每次从队头取出的节点，其距离一定是当前最小的，与 Dijkstra 算法的正确性相同。

### 算法伪代码

```
function zeroOneBFS(graph, source):
    dist[] = {INF, INF, ..., INF}
    dist[source] = 0
    deque = new Deque()
    deque.push_front(source)

    while deque is not empty:
        u = deque.pop_front()

        for each edge (u, v, weight):
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                if weight == 0:
                    deque.push_front(v)
                else:
                    deque.push_back(v)

    return dist
```

### TypeScript 实现

```typescript
interface Edge {
  to: number
  weight: 0 | 1
}

function zeroOneBFS(graph: Edge[][], source: number): number[] {
  const n = graph.length
  const dist = new Array(n).fill(Infinity)
  dist[source] = 0

  // 使用数组模拟双端队列
  const deque: number[] = [source]
  let front = 0

  while (front < deque.length) {
    const u = deque[front++]

    for (const { to: v, weight } of graph[u]) {
      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight
        if (weight === 0) {
          // 权重0：插入队头
          deque.splice(front, 0, v)
        } else {
          // 权重1：插入队尾
          deque.push(v)
        }
      }
    }
  }

  return dist
}
```

### 与普通 BFS 和 Dijkstra 的对比

| 特性 | 普通 BFS | 0-1 BFS | Dijkstra |
|------|----------|---------|----------|
| 边权限制 | 全部相等 | 仅 0 和 1 | 任意非负 |
| 数据结构 | 普通队列 | 双端队列 | 优先队列（堆） |
| 入队/出队复杂度 | O(1) | O(1) | O(log V) |
| 总时间复杂度 | O(V + E) | O(V + E) | O((V + E) log V) |
| 实现难度 | 简单 | 简单 | 中等 |

## 可视化说明

在可视化界面中，0-1 BFS 的执行过程通过以下方式展示：

- **图的展示**：节点用圆圈表示，边上的数字表示权重（0 或 1）
- **双端队列状态**：实时显示当前队列中的节点，队头在左、队尾在右
- **节点着色**：
  - 蓝色：正在处理的节点
  - 绿色：已确定最短距离的节点
  - 灰色：未访问的节点
- **操作高亮**：当节点从队头插入（权0边）时高亮左侧，从队尾插入（权1边）时高亮右侧

通过动画控制栏，你可以：
- 逐步执行算法，观察每一步队列的变化
- 播放/暂停动画
- 调整动画速度
- 重置到初始状态

## 常见错误

### 1. push 方向搞反

```typescript
// 错误：权重0的边插入队尾，权重1的边插入队头
if (weight === 0) {
  deque.push(v)       // 错误！
} else {
  deque.unshift(v)    // 错误！
}

// 正确：权重0的边插入队头，权重1的边插入队尾
if (weight === 0) {
  deque.unshift(v)    // 正确：队头插入
} else {
  deque.push(v)       // 正确：队尾插入
}
```

这是最常见的错误。记住：**权0走前面，权1走后面**。

### 2. 忘记 vis 数组导致重复入队

```typescript
// 问题：同一个节点可能被多次加入队列
// 如果不记录已访问状态，队列会无限增长

// 方法一：使用 visited 数组（类似普通 BFS）
const visited = new Array(n).fill(false)

// 方法二：直接用 dist 数组判断
// 如果 dist[v] 已经 <= dist[u] + weight，说明不需要更新
if (dist[u] + weight < dist[v]) {
  dist[v] = dist[u] + weight
  // ... 入队
}
```

推荐使用方法二，既简洁又正确——`dist` 数组本身就起到了去重的作用。

### 3. 与普通 BFS 混淆

```typescript
// 错误：用普通 BFS 处理 0-1 边权图
// 普通 BFS 假设所有边权重相等，无法正确处理权重为 0 的边

// 普通 BFS 中，第一次访问节点时距离一定是最短的
// 但在 0-1 边权图中，权重为 0 的边可能找到更短的路径

// 正确：使用双端队列的 0-1 BFS
```

### 4. 在不适用的场景使用

```typescript
// 错误：边权包含 2、3 等其他值时使用 0-1 BFS
// 如果边权不限于 0 和 1，应该使用 Dijkstra 或其他算法

// 0-1 BFS 只保证在边权为 0 和 1 时正确
```

## 实际应用

### 1. 网格迷宫问题

在一个网格中，某些格子可以免费通过（代价 0），某些格子需要付出代价（代价 1），求从起点到终点的最小代价路径。

```typescript
// 网格中 0 表示空地（代价0），1 表示障碍（代价1，穿越需花费）
function minCost(grid: number[][]): number {
  const m = grid.length, n = grid[0].length
  const dist = Array.from({ length: m }, () => new Array(n).fill(Infinity))
  dist[0][0] = 0

  const deque: [number, number][] = [[0, 0]]
  const dirs = [[0,1],[0,-1],[1,0],[-1,0]]

  while (deque.length > 0) {
    const [x, y] = deque.shift()!
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy
      if (nx < 0 || nx >= m || ny < 0 || ny >= n) continue
      const cost = grid[nx][ny]
      if (dist[x][y] + cost < dist[nx][ny]) {
        dist[nx][ny] = dist[x][y] + cost
        if (cost === 0) {
          deque.unshift([nx, ny])
        } else {
          deque.push([nx, ny])
        }
      }
    }
  }

  return dist[m - 1][n - 1]
}
```

### 2. 图上翻转边权问题

给定一个有向图，某些边的方向需要翻转才能从源点到达目标点，求最少翻转次数。可以将每条边的权重设为 1（需要翻转）或 0（不需要翻转），然后用 0-1 BFS 求解。

### 3. 分层图最短路

在某些问题中，图可以分层表示（如有限次免费通行权），层间转移的代价为 0 或 1，此时 0-1 BFS 是理想的求解工具。

### 4. 二进制状态空间搜索

在状态用二进制表示的问题中（如翻转灯泡、棋盘操作），每次操作改变状态的代价可能为 0 或 1，可以用 0-1 BFS 在状态图上求最短路径。

## 总结

0-1 BFS 是一种优雅且高效的最短路算法：

**核心思想**：
- 边权为 0 时从队头插入，边权为 1 时从队尾插入
- 保证双端队列的单调性，等价于 Dijkstra 的贪心策略

**优势**：
- 时间复杂度 O(V + E)，优于 Dijkstra 的 O((V + E) log V)
- 实现简单，代码量与普通 BFS 相当
- 常数因子小，实际运行速度快

**适用条件**：
- 图中所有边的权重只能是 0 或 1
- 边权可以为任意非负值时，需要使用 Dijkstra

**关键注意点**：
- 权0边 push_front，权1边 push_back，方向不要搞反
- 利用 dist 数组天然去重，无需额外 vis 数组
- 只适用于 0-1 边权图，其他情况请用 Dijkstra

掌握 0-1 BFS，你就拥有了在特定场景下比 Dijkstra 更快、更简洁的最短路求解工具。
