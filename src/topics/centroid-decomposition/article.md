# 点分治 (Centroid Decomposition)

## 概念解释

点分治是一种基于**树的重心**进行递归分解的算法思想，用于高效解决各类**树上路径统计问题**。

核心思想：每次找到当前树的**重心**，以重心为根处理经过它的路径，然后删除重心，对剩余的每个连通分量递归执行相同操作。

### 基本术语

| 术语 | 说明 |
|------|------|
| 重心 (Centroid) | 删除后最大连通分量最小的节点 |
| 点分治 (Centroid Decomposition) | 基于重心递归分解树的算法框架 |
| 点分树 (Centroid Tree) | 由重心递归分解过程构成的树结构 |
| 连通分量 (Connected Component) | 删除重心后形成的独立子树 |

### 重心的定义与性质

**重心**是树中一个特殊的节点，满足：删除该节点后，剩余各连通分量中，节点数最多的连通分量的节点数**最小**。

等价地说，如果删除节点 v 后最大子树的大小不超过 n/2（n 为树的节点总数），那么 v 就是重心。

**关键性质**：

- 一棵树的重心有且只有 **1 个或 2 个**
- 如果有两个重心，它们一定相邻
- 以重心为根时，每个子树的大小不超过 n/2

```
示例树:
        1
       / \
      2   3
     / \  / \
    4   5 6  7
       |
       8

节点 2 是重心：
- 删除 2 后，子树分别为 {4}, {5,8}, {1,3,6,7}
- 最大子树大小为 4，等于 8/2 = 4
```

## 为什么重要

点分治在树上问题中具有重要地位：

1. **将树上路径问题转化为可合并的子问题**：经过重心的路径可以通过遍历子树统计
2. **保证 O(log n) 层深**：每次重心分解保证最大子树不超过一半，递归深度为 O(log n)
3. **总时间复杂度 O(n log n)**：每层处理 O(n) 个节点，共 O(log n) 层
4. **适用范围广**：距离统计、路径计数、路径权值查询等问题都能高效解决

## 核心原理

### 寻找重心

寻找重心的基本方法：从任意节点出发 DFS，计算每个节点的最大子树大小，找到最大子树大小不超过 n/2 的节点。

```typescript
function findCentroid(
  adj: Map<number, number[]>,
  node: number,
  parent: number,
  totalSize: number,
  removed: Set<number>
): number {
  for (const child of adj.get(node) || []) {
    if (child !== parent && !removed.has(child)) {
      const childSizes = getSubtreeSizes(adj, child, node, removed)
      if (childSizes.get(child)! > Math.floor(totalSize / 2)) {
        // 最大子树超过一半，重心在该子树方向
        return findCentroid(adj, child, node, totalSize, removed)
      }
    }
  }
  return node  // 当前节点就是重心
}
```

**时间复杂度**：O(n) 每次查找

### 点分治框架

```typescript
function centroidDecomposition(
  adj: Map<number, number[]>,
  node: number,
  removed: Set<number>
): void {
  // 1. 计算当前连通分量大小
  const sizes = getSubtreeSizes(adj, node, -1, removed)
  const totalSize = sizes.get(node)!

  // 2. 找到重心
  const centroid = findCentroid(adj, node, -1, totalSize, removed)

  // 3. 以重心为中心处理当前层的问题
  processCentroid(adj, centroid, removed)

  // 4. 标记重心为已删除
  removed.add(centroid)

  // 5. 对每个子树递归执行点分治
  for (const child of adj.get(centroid) || []) {
    if (!removed.has(child)) {
      centroidDecomposition(adj, child, removed)
    }
  }
}
```

### 时间复杂度分析

点分治的时间复杂度为 **O(n log n)**，原因如下：

1. **每层处理 O(n)**：每层递归中，所有连通分量的节点总数恰好等于未处理的节点数
2. **共 O(log n) 层**：每次选取重心后，最大子树不超过当前大小的一半
3. **总复杂度**：O(n) x O(log n) = O(n log n)

```
第 1 层:  n 个节点
第 2 层:  每个子树 <= n/2，总计 <= n
第 3 层:  每个子树 <= n/4，总计 <= n
...
第 log n 层: 每个子树 <= 1
```

## 可视化说明

在可视化界面中，点分治的过程展示为：

1. **初始状态**：显示完整的树结构，所有节点为普通状态
2. **查找重心**：当前检查的节点高亮为蓝色，正在检查的子树节点为黄色
3. **找到重心**：重心节点变为绿色，显示各子树的大小
4. **删除重心**：重心变为灰色虚线，表示已处理
5. **递归处理**：对剩余的连通分量重复上述过程

通过可视化可以直观观察：
- 重心如何将树「均衡地」分成若干部分
- 递归层数为什么是 O(log n)
- 每一层实际处理的节点数量

## 常见错误

### 1. 未标记已删除节点

```typescript
// 错误：忘记在递归前标记重心为已删除
function badDecompose(adj: Map<number, number[]>, node: number) {
  const centroid = findCentroid(adj, node, -1, totalSize, new Set())
  // 漏了 removed.add(centroid)
  for (const child of adj.get(centroid) || []) {
    badDecompose(adj, child)  // 可能重复处理，甚至无限递归
  }
}

// 正确：先标记再递归
function goodDecompose(adj: Map<number, number[]>, node: number, removed: Set<number>) {
  const centroid = findCentroid(adj, node, -1, totalSize, removed)
  removed.add(centroid)  // 关键！
  for (const child of adj.get(centroid) || []) {
    if (!removed.has(child)) {
      goodDecompose(adj, child, removed)
    }
  }
}
```

### 2. 计算子树大小时未排除已删除节点

```typescript
// 错误：getSubtreeSizes 没有检查 removed
function badGetSize(adj, node, parent, removed) {
  let size = 1
  for (const child of adj.get(node) || []) {
    if (child !== parent) {  // 缺少 !removed.has(child) 检查
      size += badGetSize(adj, child, node, removed)
    }
  }
  return size
}

// 正确：同时检查 parent 和 removed
function goodGetSize(adj, node, parent, removed) {
  let size = 1
  for (const child of adj.get(node) || []) {
    if (child !== parent && !removed.has(child)) {  // 两个条件都要检查
      size += goodGetSize(adj, child, node, removed)
    }
  }
  return size
}
```

### 3. 路径统计时重复计算

在统计经过重心的路径时，如果直接统计所有路径，会把同一子树内部的路径也统计进去。正确做法是先统计所有路径，再减去每个子树内部的路径。

### 4. 重心查找方向错误

在 findCentroid 中，应该向**最大子树**方向移动，而不是随意选择子树。如果移动方向错误，可能找不到重心。

## 实际应用

### 1. 树上距离为 k 的点对数

给定一棵带权树和整数 k，求有多少对节点 (u, v) 满足 u 到 v 的距离恰好为 k。

```typescript
function countPairsAtDistanceK(adj: Map<number, number[]>, k: number): number {
  let count = 0
  const removed = new Set<number>()

  function decompose(node: number) {
    const sizes = getSubtreeSizes(adj, node, -1, removed)
    const centroid = findCentroid(adj, node, -1, sizes.get(node)!, removed)
    removed.add(centroid)

    // 统计经过重心的距离为 k 的点对
    const distances: number[] = []
    for (const child of adj.get(centroid) || []) {
      if (!removed.has(child)) {
        const childDistances: number[] = []
        collectDistances(adj, child, centroid, 0, childDistances, removed)

        // 减去同一子树内的点对（容斥）
        for (const d of childDistances) {
          if (d === k) count--  // 同一子树内距离为 k 的要减去
        }

        distances.push(...childDistances)
      }
    }

    // 统计经过重心的点对
    for (const d of distances) {
      if (d === k) count++
    }

    // 递归处理子树
    for (const child of adj.get(centroid) || []) {
      if (!removed.has(child)) decompose(child)
    }
  }

  decompose(1)
  return count
}
```

### 2. 树上路径权值统计

统计满足某些条件的路径数量，如路径权值之和小于等于某值的路径数。

### 3. 动态树（点分树）

将点分治的分解结构保存为「点分树」，可以在 O(log n) 时间内支持树上的修改和查询操作。点分树的高度为 O(log n)，是一种常用的高级数据结构。

## 总结

点分治是一种强大的树上分治算法：

**优点**：
- 时间复杂度 O(n log n)，效率高
- 框架通用，适用于多种路径统计问题
- 递归结构清晰，易于理解和实现
- 可扩展为点分树，支持动态操作

**缺点**：
- 空间复杂度需要维护 removed 集合等辅助结构
- 对于某些特殊树形（如链），常数因子较大
- 实现细节较多，容易出错

**适用场景**：
- 树上距离统计问题
- 路径计数问题
- 路径权值查询问题
- 需要将树上问题转化为序列问题的场景

理解点分治是掌握高级树上算法的重要一步，它与树链剖分、LCA 等技术共同构成了树上问题求解的核心工具箱。
