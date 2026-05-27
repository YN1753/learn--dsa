# 深度优先搜索 (DFS)

## 概念解释

深度优先搜索（Depth-First Search，简称 DFS）是一种用于遍历或搜索图和树的算法。它的核心思想是：**沿着一条路径尽可能深入地探索，直到无路可走时再回溯**，然后尝试其他未探索的分支。

想象你在走迷宫：每次遇到岔路口，你选择其中一条路一直走下去；如果走到死胡同，就退回到上一个岔路口，尝试另一条路。这就是 DFS 的直观过程。

### 核心概念

- **深度优先**：优先向深处探索，而非横向扩展
- **回溯 (Backtracking)**：当当前路径无法继续时，退回到上一步做其他选择
- **已访问标记 (Visited)**：记录已经访问过的节点，避免重复访问导致死循环
- **递归栈 / 显式栈**：DFS 天然与递归契合，也可以用显式栈来实现

```
DFS 遍历过程示意:

图:          遍历路径（从 A 出发）:
  A --- B       A → B → D → 回溯 → E → 回溯 → 回溯
  |     |       → C → F → 回溯 → 回溯 → 完成
  C --- D
  |     |
  E --- F

DFS 访问顺序: A → B → D → E → C → F
```

## 为什么重要

DFS 是图论和算法中最基础的算法之一，许多高级算法都建立在 DFS 的基础上：

**连通分量检测**：通过 DFS 可以快速找出图中的所有连通分量。从每个未访问的节点开始一次 DFS，就能将图分解为独立的连通区域。

**环检测**：在 DFS 过程中，如果遇到一个"正在访问"的节点（而非"已完成"的节点），说明图中存在环。这个技巧广泛用于依赖分析和死锁检测。

**拓扑排序**：对有向无环图（DAG）进行 DFS，按完成时间的逆序排列节点，就能得到一个合法的拓扑排序。这在任务调度、编译依赖分析中极为重要。

**强连通分量 (SCC)**：Tarjan 算法和 Kosaraju 算法都是基于 DFS 来寻找有向图中的强连通分量。

**迷宫和路径搜索**：DFS 天然适合迷宫求解——它会尝试每一条可能的路径，直到找到出口或穷尽所有可能。

**二分图检测**：通过 DFS 着色法，可以判断一个图是否是二分图。

## 核心原理

### 递归实现（最直观）

递归版本的 DFS 利用函数调用栈来隐式地维护遍历状态：

```typescript
function dfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>()
  const result: number[] = []

  function traverse(node: number) {
    visited.add(node)       // 标记已访问
    result.push(node)       // 记录遍历顺序
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        traverse(neighbor)  // 递归深入
      }
    }
    // 函数返回时自动回溯
  }

  traverse(start)
  return result
}
```

**执行流程分析：**

1. 从起始节点出发，标记为已访问
2. 遍历当前节点的所有邻居
3. 对每个未访问的邻居，递归调用 DFS
4. 递归返回（回溯）后，继续处理下一个邻居
5. 所有邻居处理完毕，返回上一层

### 栈实现（等价的迭代版本）

显式使用栈来模拟递归过程，避免深层递归的栈溢出风险：

```typescript
function dfsIterative(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>()
  const stack: number[] = [start]
  const result: number[] = []

  while (stack.length > 0) {
    const node = stack.pop()!
    if (visited.has(node)) continue
    visited.add(node)
    result.push(node)

    // 注意：需要逆序压栈，才能保证邻居按顺序被访问
    const neighbors = graph.get(node) || []
    for (let i = neighbors.length - 1; i >= 0; i--) {
      if (!visited.has(neighbors[i])) {
        stack.push(neighbors[i])
      }
    }
  }
  return result
}
```

### 时间和空间复杂度

| 复杂度 | 值 | 说明 |
|--------|-----|------|
| 时间复杂度 | O(V + E) | 每个顶点访问一次，每条边检查一次 |
| 空间复杂度 | O(V) | visited 集合 + 递归栈/显式栈 |

其中 V 是顶点数，E 是边数。

## 可视化说明

在可视化界面中，你可以直观地观察 DFS 的完整执行过程：

1. **图的展示**：6 个节点的无向图，节点可拖拽重新排列
2. **颜色状态**：
   - 灰色：未访问
   - 黄色：已压入栈中，等待处理
   - 蓝色高亮：当前正在访问的节点
   - 深色：已完成访问
3. **递归栈面板**：实时显示当前栈中的内容，观察 DFS 的"深度"变化
4. **遍历顺序**：显示已访问节点的顺序
5. **步骤控制**：支持播放/暂停、单步前进/后退、重置，以及速度调节

## 常见错误

### 1. 忘记标记已访问导致无限循环

```typescript
// ❌ 错误：没有 visited 集合，遇到环会无限递归
function dfsWrong(graph: Map<number, number[]>, node: number) {
  console.log(node)
  for (const neighbor of graph.get(node) || []) {
    dfsWrong(graph, neighbor)  // 已访问的节点会被重复访问！
  }
}

// ✅ 正确：使用 visited 集合
function dfsCorrect(graph: Map<number, number[]>, node: number, visited: Set<number>) {
  visited.add(node)
  console.log(node)
  for (const neighbor of graph.get(node) || []) {
    if (!visited.has(neighbor)) {
      dfsCorrect(graph, neighbor, visited)
    }
  }
}
```

### 2. 栈溢出（递归深度过大）

```typescript
// ❌ 对于链状图 A-B-C-D-E-...-Z（10000+ 节点）
// 递归版 DFS 可能导致 Maximum call stack size exceeded

// ✅ 改用迭代版本
function dfsSafe(graph: Map<number, number[]>, start: number) {
  const visited = new Set<number>()
  const stack = [start]
  while (stack.length > 0) {
    const node = stack.pop()!
    if (visited.has(node)) continue
    visited.add(node)
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) stack.push(neighbor)
    }
  }
}
```

### 3. 迭代版忘记跳过已访问节点

```typescript
// ❌ 错误：栈实现中不检查 visited，同一节点可能被多次处理
function dfsIterativeWrong(graph: Map<number, number[]>, start: number) {
  const visited = new Set<number>()
  const stack = [start]
  while (stack.length > 0) {
    const node = stack.pop()!
    visited.add(node)           // 重复处理同一个节点
    for (const n of graph.get(node) || []) {
      if (!visited.has(n)) stack.push(n)
    }
  }
}

// ✅ 正确：弹出时先检查
function dfsIterativeCorrect(graph: Map<number, number[]>, start: number) {
  const visited = new Set<number>()
  const stack = [start]
  while (stack.length > 0) {
    const node = stack.pop()!
    if (visited.has(node)) continue  // 跳过已访问
    visited.add(node)
    for (const n of graph.get(node) || []) {
      if (!visited.has(n)) stack.push(n)
    }
  }
}
```

## 实际应用

### 1. 连通分量检测

```typescript
function findConnectedComponents(graph: Map<number, number[]>): number[][] {
  const visited = new Set<number>()
  const components: number[][] = []

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      const component: number[] = []
      const stack = [node]
      while (stack.length > 0) {
        const curr = stack.pop()!
        if (visited.has(curr)) continue
        visited.add(curr)
        component.push(curr)
        for (const neighbor of graph.get(curr) || []) {
          if (!visited.has(neighbor)) stack.push(neighbor)
        }
      }
      components.push(component)
    }
  }
  return components
}
```

### 2. 环检测（有向图）

```typescript
function hasCycle(graph: Map<number, number[]>): boolean {
  const WHITE = 0, GRAY = 1, BLACK = 2
  const color = new Map<number, number>()
  for (const node of graph.keys()) color.set(node, WHITE)

  function dfs(node: number): boolean {
    color.set(node, GRAY)  // 正在访问
    for (const neighbor of graph.get(node) || []) {
      if (color.get(neighbor) === GRAY) return true   // 遇到灰色节点 = 有环
      if (color.get(neighbor) === WHITE && dfs(neighbor)) return true
    }
    color.set(node, BLACK)  // 访问完成
    return false
  }

  for (const node of graph.keys()) {
    if (color.get(node) === WHITE && dfs(node)) return true
  }
  return false
}
```

### 3. 拓扑排序（基于 DFS）

```typescript
function topologicalSort(graph: Map<number, number[]>): number[] {
  const visited = new Set<number>()
  const order: number[] = []

  function dfs(node: number) {
    visited.add(node)
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) dfs(neighbor)
    }
    order.push(node)  // 后序遍历，完成时加入
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) dfs(node)
  }
  return order.reverse()  // 逆序即为拓扑排序
}
```

### 4. 迷宫求解

```typescript
function solveMaze(maze: number[][], start: [number, number], end: [number, number]): [number, number][] | null {
  const rows = maze.length, cols = maze[0].length
  const visited = new Set<string>()
  const path: [number, number][] = []

  function dfs(r: number, c: number): boolean {
    if (r === end[0] && c === end[1]) {
      path.push([r, c])
      return true
    }
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false
    if (maze[r][c] === 1 || visited.has(`${r},${c}`)) return false

    visited.add(`${r},${c}`)
    path.push([r, c])

    // 四个方向: 上、下、左、右
    if (dfs(r - 1, c) || dfs(r + 1, c) || dfs(r, c - 1) || dfs(r, c + 1)) return true

    path.pop()  // 回溯
    return false
  }

  return dfs(start[0], start[1]) ? path : null
}
```

## 总结

DFS 是最基础也最强大的图遍历算法之一。掌握 DFS 的关键要点：

1. **核心思想**：深入探索到底再回溯，用递归或栈实现
2. **visited 必不可少**：图可能有环，必须标记已访问节点
3. **递归 vs 迭代**：递归版本直观但可能栈溢出，迭代版本更安全
4. **广泛的应用**：连通分量、环检测、拓扑排序、迷宫求解、强连通分量等都以 DFS 为基础
5. **时间复杂度 O(V + E)**：高效且通用

DFS 是通往高级图算法的必经之路。理解了 DFS 的回溯思想，你就能更好地掌握回溯法、动态规划等更复杂的算法范式。
