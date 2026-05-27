# 迭代加深搜索 (Iterative Deepening Search)

## 概念解释

迭代加深搜索（Iterative Deepening Depth-First Search, IDDFS）是一种结合了**深度优先搜索（DFS）**空间效率和**广度优先搜索（BFS）**最优性的搜索策略。

核心思想非常简单：**从深度限制为0开始，逐步增加最大搜索深度，每次都执行一次完整的深度受限DFS**。

```
第1次迭代: 深度限制=0 → 只搜索根节点
第2次迭代: 深度限制=1 → 搜索深度0-1的节点
第3次迭代: 深度限制=2 → 搜索深度0-2的节点
...直到找到目标
```

### 基本术语

| 术语 | 说明 |
|------|------|
| 深度限制 (Depth Limit) | 每次迭代中DFS的最大搜索深度 |
| 分支因子 (Branching Factor) | 每个节点的平均子节点数 |
| IDA* | 使用启发函数的迭代加深变体 |
| 截断 (Cutoff) | 达到深度限制时停止搜索 |

## 为什么重要

迭代加深搜索在人工智能和博弈搜索中具有重要地位：

1. **空间效率**：空间复杂度仅为 O(bd)，远优于BFS的 O(b^d)
2. **最优性保证**：像BFS一样能找到最浅层的最优解
3. **完整性**：在有限分支因子的图中保证找到解
4. **自然的深度控制**：避免DFS陷入过深的分支
5. **博弈搜索标配**：国际象棋、围棋等程序的标准搜索策略

## 核心原理

### 基本迭代加深搜索

```typescript
function iterativeDeepeningSearch(
  root: TreeNode,
  target: any
): TreeNode | null {
  for (let depth = 0; depth < Infinity; depth++) {
    const result = depthLimitedDFS(root, target, depth)
    if (result !== null) return result
  }
  return null
}

function depthLimitedDFS(
  node: TreeNode,
  target: any,
  limit: number
): TreeNode | null {
  if (node.value === target) return node
  if (limit <= 0) return null  // 达到深度限制，截断

  for (const child of node.children) {
    const result = depthLimitedDFS(child, target, limit - 1)
    if (result !== null) return result
  }
  return null
}
```

### IDA* 算法

IDA* 将深度限制替换为 f 值阈值：

```typescript
function idaStar(root: Node, heuristic: (n: Node) => number): Node | null {
  let threshold = heuristic(root)

  while (true) {
    const result = dfsWithThreshold(root, 0, threshold, heuristic)
    if (result.found) return result.node
    if (result.nextThreshold === Infinity) return null
    threshold = result.nextThreshold
  }
}

function dfsWithThreshold(
  node: Node,
  g: number,
  threshold: number,
  heuristic: (n: Node) => number
): { found: boolean; node: Node | null; nextThreshold: number } {
  const f = g + heuristic(node)
  if (f > threshold) return { found: false, node: null, nextThreshold: f }
  if (isGoal(node)) return { found: true, node, nextThreshold: threshold }

  let minThreshold = Infinity
  for (const child of getChildren(node)) {
    const result = dfsWithThreshold(child, g + cost(node, child), threshold, heuristic)
    if (result.found) return result
    minThreshold = Math.min(minThreshold, result.nextThreshold)
  }

  return { found: false, node: null, nextThreshold: minThreshold }
}
```

### 时间复杂度分析

虽然IDDFS重复访问浅层节点，但总时间复杂度仍然高效：

```
假设分支因子 b，解在深度 d

第1次迭代访问: b^0 个节点
第2次迭代访问: b^1 个节点
...
第d+1次迭代访问: b^d 个节点

总计: b^0 + b^1 + ... + b^d = (b^(d+1) - 1) / (b - 1)

当 b >= 2 时，总计 <= b^d * b/(b-1) = O(b^d)
```

最后一层的节点数占总数的绝大多数（约 (b-1)/b），因此重复访问的开销很小。

## 可视化说明

在可视化界面中，迭代加深搜索的过程如下：

```
深度限制=0:
    [A]          ← 只访问根节点

深度限制=1:
    [A]          ← 重新访问根节点
   /   \
  [B]  [C]       ← 访问深度1的节点

深度限制=2:
    [A]          ← 再次重新访问
   /   \
  [B]  [C]       ← 再次访问深度1
 / \   / \
[D][E][F][G]     ← 访问深度2的节点
```

通过可视化可以观察到：
- 每次迭代从根节点重新开始
- 浅层节点被重复访问（但占比很小）
- 深度限制逐步增加直到找到目标

## 常见错误

### 1. 忘记重置已访问集合

```typescript
// 错误：不同迭代间共享visited集合
function wrongIDS(root: Node, target: any): Node | null {
  const visited = new Set<Node>()  // 错误！应该每次迭代重置
  for (let depth = 0; ; depth++) {
    const result = dls(root, target, depth, visited)
    if (result) return result
  }
}

// 正确：每次迭代使用新的visited集合
function correctIDS(root: Node, target: any): Node | null {
  for (let depth = 0; ; depth++) {
    const visited = new Set<Node>()  // 正确！每次迭代重新初始化
    const result = dls(root, target, depth, visited)
    if (result) return result
  }
}
```

### 2. 深度限制计算错误

```typescript
// 错误：没有正确传递剩余深度
function wrongDLS(node: Node, target: any, limit: number): Node | null {
  if (node.value === target) return node
  if (limit <= 0) return null
  for (const child of node.children) {
    // 错误：传递的是 limit 而不是 limit - 1
    const result = wrongDLS(child, target, limit)
    if (result) return result
  }
  return null
}

// 正确：每层递归减少深度限制
function correctDLS(node: Node, target: any, limit: number): Node | null {
  if (node.value === target) return node
  if (limit <= 0) return null
  for (const child of node.children) {
    const result = correctDLS(child, target, limit - 1)  // 正确：limit - 1
    if (result) return result
  }
  return null
}
```

### 3. 混淆IDDFS与DFS

IDDFS不是简单的DFS。DFS会沿着一条路径一直深入，而IDDFS在每次迭代中都会限制搜索深度，并从头重新开始搜索。

## 实际应用

### 1. 博弈树搜索

国际象棋、围棋等博弈程序使用迭代加深搜索：

```
搜索策略:
1. 先搜索深度1，快速评估
2. 逐步增加深度，获得更精确的评估
3. 利用之前迭代的结果进行剪枝（置换表）
4. 在时间限制内尽可能搜索更深
```

### 2. 路径规划

在机器人路径规划中，IDDFS用于：
- 从起点开始逐步扩大搜索范围
- 保证找到最短路径
- 空间效率适合嵌入式设备

### 3. 谜题求解

如八数码问题、魔方还原等：
- 状态空间巨大，BFS内存不足
- 使用IDA*结合启发函数
- 在有限内存下找到最优解

### 4. 编译器优化

编译器中的指令调度、寄存器分配等优化问题：
- 搜索空间呈指数增长
- IDDFS在有限时间内找到可行解
- 逐步提高解的质量

## 总结

迭代加深搜索是一种优雅的搜索策略：

**优点**：
- 空间复杂度 O(bd)，远优于BFS的 O(b^d)
- 保证找到最浅层的最优解
- 时间复杂度与BFS同阶，仅多常数因子
- 实现简单，易于理解

**缺点**：
- 重复访问浅层节点（但开销很小）
- 不适合已知解很深的情况
- 对于图搜索需要额外处理环路

**适用场景**：
- 搜索树很宽但解不太深
- 内存有限但需要最优解
- 博弈搜索、谜题求解
- IDA* 结合启发函数的场景

**与BFS/DFS比较**：

| 特性 | BFS | DFS | IDDFS |
|------|-----|-----|-------|
| 时间复杂度 | O(b^d) | O(b^m) | O(b^d) |
| 空间复杂度 | O(b^d) | O(bm) | O(bd) |
| 最优性 | 是 | 否 | 是 |
| 完整性 | 是 | 否 | 是 |

其中 b=分支因子，d=解的深度，m=最大深度。

理解迭代加深搜索有助于掌握搜索算法的精髓：**在时间和空间之间找到最佳平衡点**。
