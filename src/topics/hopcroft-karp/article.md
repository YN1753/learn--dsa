# Hopcroft-Karp 最大匹配算法

## 概念解释

### 什么是二分图最大匹配

二分图（Bipartite Graph）是顶点可以分为两个不相交集合 U 和 V 的图，所有边都连接 U 和 V 中的顶点。**匹配**是边集的一个子集，其中任意两条边没有公共端点。**最大匹配**是包含边数最多的匹配。

```
二分图最大匹配示例：

  集合 U            集合 V
  ┌───┐            ┌───┐
  │ A │════════════│ 1 │   ══ 表示匹配边
  └───┘    /───────└───┘
  ┌───┐   /        ┌───┐
  │ B │────────────│ 2 │   ── 表示普通边
  └───┘  \         └───┘
  ┌───┐   \        ┌───┐
  │ C │    ════════│ 3 │
  └───┘            └───┘

最大匹配 = {(A,1), (B,2), (C,3)} = 3
```

### 增广路（Augmenting Path）

增广路是 Hopcroft-Karp 算法的核心概念。它是一条从未匹配顶点出发，到另一个未匹配顶点结束的路径，路径上的边交替为非匹配边和匹配边。

```
增广路示例（══ 为匹配边，── 为非匹配边）：

  A ── 1 ══ B ── 2 ══ C ── 3

路径: A → 1 → B → 2 → C → 3

翻转所有边的状态后：
  A ══ 1 ── B ══ 2 ── C ══ 3

匹配数从 2 增加到 3！
```

每找到一条增广路并翻转，匹配数恰好增加 1。当不存在增广路时，当前匹配就是最大匹配。

### Hopcroft-Karp 算法的核心思想

朴素的匈牙利算法每次只找一条增广路，时间复杂度为 O(V * E)。Hopcroft-Karp 算法的关键创新是：**每次迭代同时找到尽可能多的最短增广路**，然后一次性翻转它们。

算法分两个阶段交替进行：

1. **BFS 阶段**：从所有未匹配的 U 节点出发，构建分层图，找到从自由节点到自由节点的最短增广路长度
2. **DFS 阶段**：在分层图上，用 DFS 找到多条不相交的最短增广路并翻转

## 为什么重要

### 效率优势

Hopcroft-Karp 算法的时间复杂度为 **O(E * sqrt(V))**，相比朴素匈牙利算法的 O(V * E) 有显著提升：

| 算法 | 时间复杂度 | 1000个顶点、5000条边 |
|------|-----------|---------------------|
| 朴素匈牙利算法 | O(V * E) | ~5,000,000 次操作 |
| Hopcroft-Karp | O(E * sqrt(V)) | ~158,000 次操作 |

当图的规模较大时，这个差距是巨大的。

### 理论基础

Hopcroft-Karp 算法是理解更高级匹配算法的基础：

- 它是理解**网络流**算法的重要前置知识
- 它的思想（BFS分层 + DFS增广）被广泛应用于其他图算法
- 它为理解**带权二分图匹配**（KM算法）奠定基础

### 实际应用广泛

从任务分配到编译器优化，从网络路由到生物信息学，二分图最大匹配问题无处不在。一个高效的匹配算法是解决这些实际问题的关键。

## 核心原理

### 算法流程

```
Hopcroft-Karp 算法流程：

  ┌─────────────────────────────────┐
  │  初始化：所有节点未匹配          │
  └──────────┬──────────────────────┘
             ▼
  ┌─────────────────────────────────┐
  │  BFS：构建分层图                 │
  │  从所有未匹配的U节点出发         │
  │  计算每个节点的层级 dist[u]      │
  │  如果找不到增广路，算法结束       │
  └──────────┬──────────────────────┘
             ▼
  ┌─────────────────────────────────┐
  │  DFS：在分层图上找增广路         │
  │  从每个未匹配的U节点出发         │
  │  只沿着 dist[v] = dist[u]+1 的  │
  │  边前进，找到多条不相交增广路     │
  └──────────┬──────────────────────┘
             ▼
       翻转所有找到的增广路
             │
             └──── 返回 BFS 阶段
```

### BFS 构建分层图

BFS 从所有未匹配的 U 节点开始，按层扩展：

```typescript
function bfs(
  adjList: Map<number, number[]>,
  pairU: Map<number, number | null>,
  pairV: Map<number, number | null>,
  dist: Map<number, number>,
  uSet: number[]
): boolean {
  const queue: number[] = []

  // 初始化：未匹配的U节点距离为0，已匹配的为无穷大
  for (const u of uSet) {
    if (pairU.get(u) === null) {
      dist.set(u, 0)
      queue.push(u)
    } else {
      dist.set(u, Infinity)
    }
  }

  let foundAugmenting = false

  while (queue.length > 0) {
    const u = queue.shift()!
    const d = dist.get(u)!

    for (const v of adjList.get(u) || []) {
      const matchedU = pairV.get(v)
      // 如果v未匹配，说明找到了增广路的终点
      if (matchedU === null) {
        foundAugmenting = true
      } else if (dist.get(matchedU) === Infinity) {
        // 如果v的匹配对象尚未访问，扩展到下一层
        dist.set(matchedU, d + 1)
        queue.push(matchedU)
      }
    }
  }

  return foundAugmenting
}
```

BFS 的关键作用：
- 确定增广路的最短长度
- 构建分层图，限制 DFS 只在最短路径上搜索
- 如果 BFS 找不到增广路，算法终止

### DFS 在分层图上找增广路

DFS 从每个未匹配的 U 节点出发，沿着分层图找增广路：

```typescript
function dfs(
  u: number,
  adjList: Map<number, number[]>,
  pairU: Map<number, number | null>,
  pairV: Map<number, number | null>,
  dist: Map<number, number>
): boolean {
  for (const v of adjList.get(u) || []) {
    const matchedU = pairV.get(v)

    // 只沿着分层图的边前进
    if (matchedU === null || dist.get(matchedU) === dist.get(u)! + 1) {
      if (matchedU === null || dfs(matchedU, adjList, pairU, pairV, dist)) {
        // 找到增广路，更新匹配
        pairU.set(u, v)
        pairV.set(v, u)
        return true
      }
    }
  }

  // 标记此节点已访问（防止重复搜索）
  dist.set(u, Infinity)
  return false
}
```

### 完整算法

```typescript
function hopcroftKarp(
  adjList: Map<number, number[]>,
  uSet: number[],
  vSet: number[]
): number {
  const pairU = new Map<number, number | null>()
  const pairV = new Map<number, number | null>()
  const dist = new Map<number, number>()

  // 初始化：所有节点未匹配
  for (const u of uSet) pairU.set(u, null)
  for (const v of vSet) pairV.set(v, null)

  let matching = 0

  // 每次迭代找尽可能多的最短增广路
  while (bfs(adjList, pairU, pairV, dist, uSet)) {
    for (const u of uSet) {
      if (pairU.get(u) === null) {
        if (dfs(u, adjList, pairU, pairV, dist)) {
          matching++
        }
      }
    }
  }

  return matching
}
```

### 时间复杂度分析

**为什么是 O(E * sqrt(V))？**

关键观察：
1. 每次 BFS-DFS 迭代，最短增广路的长度严格递增
2. 最短增广路的长度最多为 O(sqrt(V))
3. 每次迭代中，DFS 对每条边最多访问一次，总代价为 O(E)

详细证明思路：
- 设当前匹配数为 M，最大匹配数为 M*
- 存在 M* - M 条不相交的增广路
- 每次迭代至少找到 sqrt(V) 条增广路（否则最短增广路长度 < sqrt(V)）
- 因此最多迭代 sqrt(V) 次
- 每次迭代代价 O(E)
- 总时间复杂度 O(E * sqrt(V))

## 可视化说明

在可视化界面中，你可以直观地观察 Hopcroft-Karp 算法的执行过程：

1. **图的展示**：二分图的 U 集合和 V 集合分别显示在左右两侧，节点可拖拽调整位置
2. **BFS 分层**：点击「BFS 分层」按钮，观察 BFS 如何从未匹配节点出发，逐层扩展构建分层图。每一层的节点用不同颜色标识
3. **DFS 增广**：点击「DFS 增广」按钮，观察 DFS 如何在分层图上找到多条不相交的增广路
4. **匹配更新**：找到的增广路会高亮显示，翻转后匹配边用粗线标记
5. **播放控制**：支持播放、暂停、单步前进、单步后退和重置功能，速度可调

通过可视化，你可以清晰地理解「BFS分层 + DFS增广」的核心思想，以及为什么这个策略比朴素匈牙利算法更高效。

## 常见错误

### 1. 忘记标记已访问节点

```typescript
// 错误：DFS 中没有标记已访问的节点，导致死循环
function dfs(u: number, ...): boolean {
  for (const v of adjList.get(u) || []) {
    if (dfs(matchedU, ...)) {  // 可能反复访问同一个节点！
      // ...
    }
  }
  return false
}

// 正确：将访问过的节点距离设为无穷大
function dfs(u: number, ...): boolean {
  for (const v of adjList.get(u) || []) {
    if (matchedU === null || dist.get(matchedU) === dist.get(u)! + 1) {
      if (matchedU === null || dfs(matchedU, ...)) {
        // ...
        return true
      }
    }
  }
  dist.set(u, Infinity)  // 标记已访问！
  return false
}
```

### 2. BFS 和 DFS 配合不当

```typescript
// 错误：DFS 没有严格按照 BFS 的分层图前进
// 这样会破坏「找最短增广路」的性质
if (dfs(matchedU, ...)) {  // 没检查层级！

// 正确：只沿着分层图的边前进
if (dist.get(matchedU) === dist.get(u)! + 1) {
  if (dfs(matchedU, ...)) {
```

### 3. 混淆 pairU 和 pairV

```typescript
// 错误：pairU 存的是 v，pairV 存的也是 v
pairU.set(u, v)   // pairU[u] = v ✓
pairV.set(v, v)   // 错！应该是 pairV[v] = u

// 正确：
pairU.set(u, v)   // U中节点u匹配到V中节点v
pairV.set(v, u)   // V中节点v匹配到U中节点u
```

### 4. 未正确初始化距离

```typescript
// 错误：所有节点距离初始化为 0
for (const u of uSet) dist.set(u, 0)

// 正确：只有未匹配的U节点距离为0
for (const u of uSet) {
  if (pairU.get(u) === null) {
    dist.set(u, 0)
  } else {
    dist.set(u, Infinity)
  }
}
```

### 5. 忘记处理孤立节点

```typescript
// 错误：没有考虑某些节点没有边的情况
// adjList 中缺少某些节点的条目

// 正确：初始化时确保所有节点都有邻接表条目
for (const u of uSet) {
  if (!adjList.has(u)) adjList.set(u, [])
}
for (const v of vSet) {
  if (!adjList.has(v)) adjList.set(v, [])
}
```

## 实际应用

### 1. 任务分配（Job Assignment）

n 个工人，m 个任务，每个工人能胜任某些任务。求最大分配方案，使尽可能多的任务被完成。

```typescript
// 建图：工人 → 任务的边表示能胜任
const workers = ['Alice', 'Bob', 'Carol', 'Dave']
const tasks = ['设计', '开发', '测试', '运维']
const canDo = new Map([
  [0, [0, 1]],   // Alice: 设计、开发
  [1, [1, 2]],   // Bob: 开发、测试
  [2, [0, 2]],   // Carol: 设计、测试
  [3, [2, 3]],   // Dave: 测试、运维
])

// 使用 Hopcroft-Karp 求最大匹配
// 结果：4 个任务全部分配成功
```

### 2. 编译器寄存器分配

编译器需要将程序中的变量映射到有限的 CPU 寄存器。如果两个变量的生命周期不重叠，它们可以共享同一个寄存器。

```typescript
// 变量是集合 U，寄存器是集合 V
// 如果变量 i 可以使用寄存器 j，则有边 (i, j)
// 最大匹配 = 最多能分配到寄存器的变量数
// 未匹配的变量需要溢出到内存
```

### 3. 稳定匹配与 Gale-Shapley 算法

虽然 Gale-Shapley 算法本身不是 Hopcroft-Karp，但两者都处理二分图匹配问题。在某些变体中，Hopcroft-Karp 可以作为子程序使用。

### 4. 网络流量工程

在网络路由中，需要将数据流映射到物理链路。二分图匹配可以用来最大化网络吞吐量：

```typescript
// 数据流是集合 U，物理链路是集合 V
// 如果数据流 i 可以使用链路 j，则有边 (i, j)
// 最大匹配 = 最多能同时传输的数据流数
```

### 5. 生物信息学：蛋白质结构比对

在蛋白质结构比对中，需要将两个蛋白质的氨基酸残基进行匹配。这可以建模为二分图最大匹配问题，Hopcroft-Karp 算法可以高效地找到最优比对。

## 总结

Hopcroft-Karp 算法是二分图最大匹配的经典高效算法，掌握它对于理解图论和组合优化至关重要：

1. **核心思想**：BFS 构建分层图 + DFS 在分层图上找多条不相交增广路
2. **时间复杂度**：O(E * sqrt(V))，比朴素匈牙利算法 O(V * E) 快得多
3. **关键技巧**：每次迭代同时找最短的多条增广路，而非一次只找一条
4. **理论基础**：理解增广路理论和分层图思想，为学习网络流和带权匹配打下基础
5. **广泛应用**：任务分配、寄存器分配、网络路由、生物信息学等

Hopcroft-Karp 算法展示了「批量处理」和「最短路径优先」这两个思想在算法设计中的强大威力。理解这个算法，不仅有助于解决实际的匹配问题，更能提升你的算法思维能力。
