# 树链剖分 (Heavy-Light Decomposition)

## 概念解释

树链剖分是一种将树分解为若干条链的算法技术。它的核心思想是：将树上的路径问题转化为序列上的区间问题，从而利用线段树等高效数据结构来处理。

### 基本术语

| 术语 | 说明 |
|------|------|
| 重儿子 (Heavy Child) | 一个节点的所有儿子中，子树大小最大的那个 |
| 轻儿子 (Light Child) | 除重儿子以外的其他儿子 |
| 重边 (Heavy Edge) | 连接父节点与其重儿子的边 |
| 轻边 (Light Edge) | 连接父节点与其轻儿子的边 |
| 重链 (Heavy Chain) | 由重边连接形成的链 |
| DFS 序 | 对树进行 DFS 遍历时的访问顺序编号 |

### 直觉理解

想象一棵树，我们用粗线（重边）和细线（轻边）来标注每条边：

```
        1
       /|\
      2  3  4
     /|    |
    5  6   7
   /|
  8  9
```

剖分后（假设子树大小大的优先）：

```
        1  ← 轻边
       /|
      2  3  4  ← 2 的重儿子可能是 5（子树更大）
     /|    |
    5  6   7
   /|
  8  9
```

每条重链是一条从上到下的连续路径，整棵树被分解为若干条不相交的重链。

## 为什么重要

树链剖分解决了树上路径查询的核心难题：

1. **路径问题转化为区间问题**：树上的路径被拆分为 O(log n) 段连续区间，可以使用线段树高效处理
2. **子树问题天然支持**：DFS 序使得同一子树的节点编号连续，子树操作变为区间操作
3. **应用广泛**：路径求和、路径最大值、路径修改等操作都可以高效实现
4. **实现相对简单**：相比树上倍增等方法，代码实现更直观

## 核心原理

### 第一次 DFS：计算基础信息

第一次 DFS 从根节点开始，计算以下信息：

- `size[u]`：以 u 为根的子树大小
- `depth[u]`：节点 u 的深度
- `parent[u]`：节点 u 的父节点
- `heavy[u]`：节点 u 的重儿子

```typescript
function dfs1(u: number, p: number): void {
  parent[u] = p
  depth[u] = depth[p] + 1
  size[u] = 1
  heavy[u] = -1

  for (const v of tree[u]) {
    if (v === p) continue
    dfs1(v, u)
    size[u] += size[v]
    if (heavy[u] === -1 || size[v] > size[heavy[u]]) {
      heavy[u] = v
    }
  }
}
```

### 第二次 DFS：分配 DFS 序

第二次 DFS 按照「先走重儿子」的顺序遍历，为每个节点分配 DFS 编号：

```typescript
let currentPos = 0

function dfs2(u: number, headOfChain: number): void {
  pos[u] = currentPos++     // 分配 DFS 编号
  head[u] = headOfChain      // 记录所在重链的顶端

  if (heavy[u] !== -1) {
    dfs2(heavy[u], headOfChain)  // 重儿子继续当前链
  }

  for (const v of tree[u]) {
    if (v === parent[u] || v === heavy[u]) continue
    dfs2(v, v)  // 轻儿子开启新链
  }
}
```

关键性质：每条重链上的节点在 DFS 序中是**连续的区间**。

### 路径查询

查询节点 u 到节点 v 之间的路径信息：

```typescript
function queryPath(u: number, v: number): number {
  let result = 0
  while (head[u] !== head[v]) {
    // 确保 u 所在链的顶端更深
    if (depth[head[u]] < depth[head[v]]) swap(u, v)
    // 查询 u 到链顶端的区间
    result = merge(result, segTree.query(pos[head[u]], pos[u]))
    u = parent[head[u]]  // 跳到链顶端的父节点
  }
  // u 和 v 在同一重链上
  if (depth[u] > depth[v]) swap(u, v)
  result = merge(result, segTree.query(pos[u], pos[v]))
  return result
}
```

### 时间复杂度分析

| 操作 | 时间复杂度 | 说明 |
|------|------------|------|
| 预处理（两次 DFS） | O(n) | 遍历整棵树 |
| 路径查询 | O(log²n) | 最多 O(log n) 条链，每条链线段树查询 O(log n) |
| 路径修改 | O(log²n) | 同上 |
| 子树查询 | O(log n) | DFS 序连续，一次线段树查询 |
| 子树修改 | O(log n) | 同上 |

### 为什么轻边数量是 O(log n)？

从任意节点向根走，每经过一条轻边，所在子树大小至少翻倍：

- 设节点 u 通过轻边连接到父节点 p
- u 不是 p 的重儿子，所以 `size[u] <= size[p] / 2`
- 因此最多经过 log₂(n) 条轻边

这意味着任意两点间的路径最多被分为 O(log n) 段重链。

## 可视化说明

在可视化界面中，树链剖分过程分为以下步骤展示：

1. **原始树结构**：显示完整的树，标注每个节点
2. **计算子树大小**：第一次 DFS，展示每个节点的子树大小
3. **标记重儿子**：用粗线标注重边，细线标注轻边
4. **分配 DFS 序**：第二次 DFS，展示每个节点的编号
5. **路径查询演示**：展示如何沿重链跳转进行路径查询

重链用不同颜色区分，路径查询时可以看到查询过程如何在多条重链间跳转。

## 常见错误

### 1. 忘记处理轻儿子

```typescript
// 错误：只递归重儿子，忘记轻儿子
function dfs2(u: number, head: number): void {
  pos[u] = currentPos++
  if (heavy[u] !== -1) dfs2(heavy[u], head)
  // 缺少轻儿子的递归！
}

// 正确：先处理重儿子，再处理轻儿子
function dfs2(u: number, head: number): void {
  pos[u] = currentPos++
  if (heavy[u] !== -1) dfs2(heavy[u], head)
  for (const v of tree[u]) {
    if (v !== parent[u] && v !== heavy[u]) {
      dfs2(v, v)  // 轻儿子开启新链
    }
  }
}
```

### 2. 路径查询时未正确跳链

```typescript
// 错误：未比较链顶深度就跳转
function queryPath(u: number, v: number): number {
  while (head[u] !== head[v]) {
    segTree.query(pos[head[u]], pos[u])
    u = parent[head[u]]  // 没有确保 u 的链顶更深
  }
}

// 正确：先比较深度，确保从更深的链开始
function queryPath(u: number, v: number): number {
  while (head[u] !== head[v]) {
    if (depth[head[u]] < depth[head[v]]) [u, v] = [v, u]
    segTree.query(pos[head[u]], pos[u])
    u = parent[head[u]]
  }
}
```

### 3. DFS 序编号从 0 还是 1 开始不一致

确保线段树的建树和查询范围与 DFS 序编号一致。如果从 0 开始，线段树区间为 `[0, n-1]`；如果从 1 开始，区间为 `[1, n]`。

## 实际应用

### 1. 树上路径求和与修改

给定一棵带权树，支持两种操作：
- 修改某条边的权值
- 查询两点间路径上的边权之和

树链剖分 + 线段树可以在 O(log²n) 时间内完成每种操作。

### 2. 树上路径最大/最小值

查询树上两点间路径上的最大边权或最小边权，常用于图论问题中的瓶颈路径分析。

### 3. 动态 LCA（最近公共祖先）

树链剖分可以高效求解 LCA 问题：当两个节点不在同一重链上时，将链顶深度更大的节点向上跳，直到两者在同一重链上，深度较小的节点即为 LCA。时间复杂度 O(log n)。

### 4. 竞赛中的综合应用

在算法竞赛中，树链剖分常与线段树结合，处理复杂的树上查询问题，如：
- 路径上第 k 大值
- 路径上不同颜色的数量
- 带修改的树上查询

## 总结

树链剖分是一种强大的树上问题处理技术：

**核心思想**：
- 将树分解为 O(log n) 条重链
- 利用 DFS 序将重链映射到连续区间
- 结合线段树将路径问题转化为区间问题

**优势**：
- 路径操作 O(log²n)，子树操作 O(log n)
- 实现相对简洁，代码量适中
- 应用广泛，适配性强

**适用场景**：
- 需要在树上进行路径查询/修改
- 需要高效处理子树信息
- 算法竞赛中的树上数据结构题

**注意事项**：
- 需要配合线段树使用
- 预处理需要 O(n) 时间和空间
- 对于简单的 LCA 问题，倍增法可能更简洁
