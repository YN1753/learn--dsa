# 二分图 (Bipartite Graph)

## 概念解释

二分图（Bipartite Graph）是一种特殊的图结构：它的顶点集可以被划分为两个**不相交**的子集 U 和 V，使得图中的每条边都连接 U 中的一个顶点和 V 中的一个顶点。换句话说，**同一集合内的顶点之间没有边**。

```
二分图示例:

  集合 U          集合 V
  ┌───┐          ┌───┐
  │ A │──────────│ 1 │
  └───┘         /└───┘
  ┌───┐       /  ┌───┐
  │ B │─────/───│ 2 │
  └───┐   /     └───┘
  ┌───┐ /      ┌───┐
  │ C │────────│ 3 │
  └───┘        └───┘

同一集合内的顶点之间没有边！
```

### 判定条件

一个图是二分图，当且仅当它**不包含奇数长度的环**。这是因为：

- 如果存在奇环，环上的顶点必然需要两种以上的颜色才能保证相邻顶点颜色不同，而二分图只需要两种颜色。
- 如果没有奇环，就可以用两种颜色对所有顶点进行染色，从而得到合法的二分划分。

### 二部图与普通图的区别

| 特性 | 普通图 | 二分图 |
|------|--------|--------|
| 顶点划分 | 无特殊要求 | 必须分为两个不相交集合 |
| 同集合内边 | 可以有 | 不能有 |
| 奇环 | 可以存在 | 不能存在 |
| 2-染色 | 不一定可行 | 一定可行 |

## 为什么重要

二分图在计算机科学和实际应用中有着极其重要的地位：

**匹配问题的基础**：二分图的最大匹配问题是组合优化中的经典问题。从工作分配到稳定匹配，许多现实问题都可以建模为二分图匹配。

**资源分配**：将 n 个任务分配给 n 个工人，每个工人只能胜任某些任务，这就是一个典型的二分图完美匹配问题。匈牙利算法可以在多项式时间内求解。

**调度问题**：课程与考试时间安排、航班与登机口分配、护士排班等调度问题都可以用二分图建模。

**网络流的特例**：二分图匹配是最大流问题的特例，理解二分图有助于理解更一般的网络流算法。

**社交网络**：在推荐系统中，用户和商品可以构成二分图，匹配算法用于推荐最相关的商品。

## 核心原理

### 二分图判定：2-染色法

判断一个图是否为二分图，最常用的方法是**2-染色法**（Two-Coloring）。核心思想是：用两种颜色对顶点着色，保证相邻顶点颜色不同。如果能成功染色，则图是二分图；如果发现冲突（相邻顶点同色），则不是。

**BFS 染色实现：**

```typescript
function isBipartite(graph: Map<number, number[]>): boolean {
  const color = new Map<number, number>()  // 0 或 1

  for (const node of graph.keys()) {
    if (color.has(node)) continue  // 已染色，跳过

    // BFS 染色
    const queue: number[] = [node]
    color.set(node, 0)

    while (queue.length > 0) {
      const curr = queue.shift()!
      for (const neighbor of graph.get(curr) || []) {
        if (!color.has(neighbor)) {
          color.set(neighbor, 1 - color.get(curr)!)  // 染相反颜色
          queue.push(neighbor)
        } else if (color.get(neighbor) === color.get(curr)) {
          return false  // 相邻顶点同色，不是二分图
        }
      }
    }
  }
  return true
}
```

**时间复杂度**：O(V + E)，每个顶点和每条边各访问一次。

**DFS 染色实现：**

```typescript
function isBipartiteDFS(graph: Map<number, number[]>): boolean {
  const color = new Map<number, number>()

  function dfs(node: number, c: number): boolean {
    color.set(node, c)
    for (const neighbor of graph.get(node) || []) {
      if (!color.has(neighbor)) {
        if (!dfs(neighbor, 1 - c)) return false
      } else if (color.get(neighbor) === c) {
        return false
      }
    }
    return true
  }

  for (const node of graph.keys()) {
    if (!color.has(node)) {
      if (!dfs(node, 0)) return false
    }
  }
  return true
}
```

### 最大匹配：增广路径与匈牙利算法

**匹配**是边集的一个子集，其中任意两条边没有公共端点。**最大匹配**是包含边数最多的匹配。

**增广路径（Augmenting Path）**：从一个未匹配顶点出发，到另一个未匹配顶点结束，路径上的边交替为非匹配边和匹配边。

```
增广路径示例（粗线为匹配边）:

  U:  A ─── B ─── C
      |     ║     |
  V:  1     2     3

路径: A - 1（非匹配）→ 1 - B（匹配）→ B - 2（非匹配）→ 2 - C（匹配）→ C - 3（非匹配）

翻转后: A-1, B-2, C-3 全部变为匹配边，匹配数从 2 增加到 3
```

**匈牙利算法（Hungarian Algorithm）**：

```typescript
function maxBipartiteMatching(graph: Map<number, number[]>, uSet: number[]): number {
  const match = new Map<number, number>()  // match[v] = u，记录匹配关系

  function findAugmentingPath(u: number, visited: Set<number>): boolean {
    for (const v of graph.get(u) || []) {
      if (visited.has(v)) continue
      visited.add(v)
      // v 未匹配，或者从 match[v] 出发能找到增广路径
      if (!match.has(v) || findAugmentingPath(match.get(v)!, visited)) {
        match.set(v, u)
        return true
      }
    }
    return false
  }

  let result = 0
  for (const u of uSet) {
    if (findAugmentingPath(u, new Set())) {
      result++
    }
  }
  return result
}
```

**时间复杂度**：O(V × E)，其中 V 是顶点数，E 是边数。

### König 定理

König 定理是二分图中最重要的定理之一，它建立了三个量之间的等价关系：

```
最大匹配数 = 最小点覆盖数

最大独立集大小 = 顶点数 - 最小点覆盖数 = 顶点数 - 最大匹配数

最小边覆盖数 = 顶点数 - 最大匹配数
```

- **最小点覆盖**：选择最少的顶点，使得每条边至少有一个端点被选中。
- **最大独立集**：选择最多的顶点，使得任意两个被选中的顶点之间没有边。
- **最小边覆盖**：选择最少的边，使得每个顶点至少是一条被选中边的端点。

## 可视化说明

在可视化界面中，你可以直观地观察二分图的结构和算法过程：

1. **二分图展示**：顶点分为左右两组（集合 U 和 V），不同集合用不同颜色标识。边连接左右两组的顶点。
2. **2-染色动画**：选择"染色判定"模式后，BFS 从一个顶点开始逐层染色。你可以观察到两种颜色交替分布，以及发现奇环冲突的过程。
3. **匹配动画**：选择"最大匹配"模式后，展示匈牙利算法寻找增广路径的过程。匹配边用粗线高亮，增广路径用特殊颜色标记。
4. **播放控制**：支持播放、暂停、单步前进、单步后退和重置功能，速度可调。

## 常见错误

### 1. 奇环导致二分图判定失败

```typescript
// 错误：认为所有图都是二分图
// 三角形（3 个顶点的环）不是二分图！
//    A --- B
//     \   /
//      \ /
//       C
// 无论如何划分，A、B、C 中必有两个在同一集合且有边相连

const triangleGraph = new Map([
  [0, [1, 2]],
  [1, [0, 2]],
  [2, [0, 1]],
])
console.log(isBipartite(triangleGraph))  // false！
```

### 2. 混淆二分图判定和最大匹配

```typescript
// 错误：把二分图判定当成了求最大匹配
// isBipartite() 只检查图是否为二分图，不求匹配

// 正确：判定和匹配是两个不同的问题
const graph = new Map([
  [0, [2, 3]],
  [1, [2]],
  [2, [0, 1]],
  [3, [0]],
])

console.log(isBipartite(graph))          // true：是二分图
console.log(maxBipartiteMatching(graph, [0, 1]))  // 2：最大匹配数
```

### 3. 未找到最大匹配

```typescript
// 错误：贪心匹配不保证最大
// 贪心可能得到匹配数 1，而最优解是 2

// 图示：A-1, A-2, B-1
// 贪心：先选 A-1 → B 无法匹配 → 匹配数 1
// 最优：选 A-2, B-1 → 匹配数 2

// 正确：使用匈牙利算法（增广路径）保证最大匹配
```

### 4. 忽略非连通图

```typescript
// 错误：只从一个起点开始染色
// 如果图不连通，需要对每个连通分量分别染色

// 正确：遍历所有顶点，未染色的都作为新起点
for (const node of graph.keys()) {
  if (!color.has(node)) {
    if (!dfs(node, 0)) return false
  }
}
```

## 实际应用

### 1. 任务分配（Job Assignment）

```typescript
// n 个工人，n 个任务，每个工人能做某些任务
// 求最大分配方案，使尽可能多的任务被完成

const workers = ['Alice', 'Bob', 'Carol']
const tasks = ['设计', '开发', '测试']
const canDo = new Map([
  ['Alice', ['设计', '开发']],
  ['Bob', ['开发', '测试']],
  ['Carol', ['设计', '测试']],
])

// 建图：工人 → 任务的边表示能做
// 求最大匹配 = 最大分配数
// 最优分配：Alice-设计, Bob-开发, Carol-测试 = 3
```

### 2. 稳定匹配（Stable Matching）

Gale-Shapley 算法虽然不直接使用匈牙利算法，但其本质也是在二分图上求解匹配问题。稳定匹配广泛应用于：

- 医院与住院医师的匹配（NRMP 系统）
- 大学招生与考生的匹配
- 器官捐赠者与受者的匹配

### 3. 课程-考试调度

```typescript
// 课程是集合 U，考试时间段是集合 V
// 如果课程 i 可以在时间段 j 考试，则有边 (i, j)
// 最大匹配 = 最多能安排的考试数

function scheduleExams(
  courses: string[],
  timeSlots: string[],
  conflicts: Map<string, string[]>
): Map<string, string> {
  // 构建二分图并求最大匹配
  // 返回 课程 → 时间段 的映射
  // ...使用匈牙利算法
  return new Map()
}
```

### 4. 推荐系统

在电商推荐中，用户和商品构成二分图。用户购买或浏览过的商品与用户之间有边。通过分析二分图的结构，可以发现用户群体和商品类别之间的关联模式，从而进行精准推荐。

### 5. 社交网络中的社区检测

社交网络可以建模为二分图（如用户-群组、演员-电影）。通过分析二分图的结构，可以发现社区结构、进行链路预测等。

## 总结

二分图是图论中一个优雅且实用的概念，掌握它对于理解匹配问题和组合优化至关重要：

1. **核心定义**：顶点可划分为两个不相交集合，同集合内无边。等价于不含奇环。
2. **判定方法**：BFS/DFS 2-染色法，时间复杂度 O(V + E)。
3. **最大匹配**：匈牙利算法基于增广路径，时间复杂度 O(V × E)。
4. **König 定理**：最大匹配数 = 最小点覆盖数，是二分图的核心理论。
5. **广泛应用**：任务分配、稳定匹配、调度问题、推荐系统等。

二分图是连接图论与实际应用的桥梁，理解它的性质和算法，将为你解决复杂的组合优化问题提供强有力的工具。
