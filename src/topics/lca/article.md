# 最近公共祖先 (Lowest Common Ancestor, LCA)

## 概念解释

在一棵有根树中，**最近公共祖先（LCA）**是指对于两个节点 u 和 v，同时满足以下条件的节点 w：

1. w 是 u 的祖先（w 可以是 u 本身）
2. w 是 v 的祖先（w 可以是 v 本身）
3. 在所有满足条件 1 和 2 的节点中，w 的深度最大

直观理解：从根出发分别走向 u 和 v，两条路径的「最后一个交汇点」就是 LCA。

```
        1          LCA(5, 6) = 2
       / \         LCA(5, 7) = 1
      2   3        LCA(2, 3) = 1
     / \           LCA(8, 9) = 5
    5   6
   / \
  8   9
```

## 为什么重要

LCA 是树上问题的核心工具，许多树上操作都可以转化为 LCA 问题：

1. **距离查询**：树上两点距离 = dist(u) + dist(v) - 2 * dist(LCA(u,v))
2. **路径操作**：对 u 到 v 路径上的所有节点进行修改或查询
3. **祖先关系判断**：判断 u 是否是 v 的祖先
4. **竞赛高频**：LCA 是算法竞赛中出现频率最高的树上问题之一

## 核心原理

### 方法一：暴力上跳法

最朴素的方法：每次将较深的节点往上跳一步，直到两个节点相遇。

```typescript
function lcaBruteForce(
  parent: number[],
  depth: number[],
  u: number,
  v: number
): number {
  // 对齐深度
  while (depth[u] > depth[v]) u = parent[u]
  while (depth[v] > depth[u]) v = parent[v]

  // 同时上跳直到相遇
  while (u !== v) {
    u = parent[u]
    v = parent[v]
  }
  return u
}
```

**时间复杂度**：O(n) 每次查询，太慢。

### 方法二：倍增法（Binary Lifting）

倍增法的核心思想：不一步一步跳，而是用 **2 的幂次** 大步跳。

#### 预处理

定义 `f[v][k]` 表示节点 v 向上跳 2^k 步后到达的祖先节点。

```
f[v][0] = parent(v)           // 跳 1 步 = 父节点
f[v][1] = f[f[v][0]][0]       // 跳 2 步 = 先跳 1 步再跳 1 步
f[v][2] = f[f[v][1]][1]       // 跳 4 步 = 先跳 2 步再跳 2 步
f[v][k] = f[f[v][k-1]][k-1]   // 递推公式
```

```typescript
const LOG = 20  // 足够覆盖最大深度
const f: number[][] = []

function preprocess(n: number, parent: number[], depth: number[]) {
  // 初始化 f[v][0]
  for (let v = 0; v < n; v++) {
    f[v] = new Array(LOG).fill(0)
    f[v][0] = parent[v]
  }

  // 递推 f[v][k]
  for (let k = 1; k < LOG; k++) {
    for (let v = 0; v < n; v++) {
      f[v][k] = f[f[v][k - 1]][k - 1]
    }
  }
}
```

**预处理时间复杂度**：O(n log n)

#### 查询

```typescript
function lca(u: number, v: number, depth: number[]): number {
  // Step 1: 将较深节点上跳到同深度
  if (depth[u] < depth[v]) [u, v] = [v, u]
  let diff = depth[u] - depth[v]

  for (let k = 0; k < LOG; k++) {
    if ((diff >> k) & 1) u = f[u][k]
  }

  if (u === v) return u

  // Step 2: 从大到小尝试跳，找到 LCA 的下一层
  for (let k = LOG - 1; k >= 0; k--) {
    if (f[u][k] !== f[v][k]) {
      u = f[u][k]
      v = f[v][k]
    }
  }

  return f[u][0]
}
```

**查询时间复杂度**：O(log n)

### 方法三：Tarjan 离线算法

Tarjan 算法一次性处理所有查询，利用 **DFS + 并查集** 实现。

核心思想：
1. DFS 遍历整棵树
2. 遍历完一个节点的所有子树后，将该子树中的节点用并查集合并到父节点
3. 当 DFS 到达节点 u 时，如果查询对端 v 已被访问，则 `find(v)` 就是 LCA

```typescript
function tarjanLCA(
  tree: number[][],
  queries: Map<number, number[]>,
  root: number
): Map<string, number> {
  const n = tree.length
  const parent = new Array(n).fill(0)
  const visited = new Array(n).fill(false)
  const results = new Map<string, number>()

  // 并查集
  const ufParent = Array.from({ length: n }, (_, i) => i)
  function find(x: number): number {
    if (ufParent[x] !== x) ufParent[x] = find(ufParent[x])
    return ufParent[x]
  }

  function dfs(u: number) {
    visited[u] = true
    for (const v of tree[u]) {
      if (!visited[v]) {
        dfs(v)
        ufParent[v] = u  // 将子树合并到父节点
      }
    }

    // 处理与 u 相关的查询
    const qs = queries.get(u) || []
    for (const v of qs) {
      if (visited[v]) {
        const key = `${Math.min(u, v)}-${Math.max(u, v)}`
        results.set(key, find(v))
      }
    }
  }

  dfs(root)
  return results
}
```

**时间复杂度**：O((n + q) * α(n))，其中 α 是反阿克曼函数，近似常数。

### 方法四：树链剖分求 LCA

利用**重链剖分**，每次将较深节点沿重链跳到链顶的父节点，最多跳 O(log n) 次。

```typescript
function lcaByHLD(
  depth: number[],
  top: number[],
  parent: number[],
  u: number,
  v: number
): number {
  while (top[u] !== top[v]) {
    if (depth[top[u]] < depth[top[v]]) [u, v] = [v, u]
    u = parent[top[u]]
  }
  return depth[u] < depth[v] ? u : v
}
```

**时间复杂度**：预处理 O(n)，查询 O(log n)。

## 可视化说明

在可视化界面中，你可以直观地观察：

- **树结构展示**：带深度标注的有根树
- **倍增预处理**：展示每个节点的 2^k 级祖先关系
- **查询动画**：展示节点如何通过大步跳跃逼近 LCA
- **对比不同方法**：直观感受暴力法和倍增法的效率差异

通过控制面板可以：
- 选择不同的查询节点对
- 逐步执行倍增跳跃
- 调整动画速度

## 常见错误

### 1. 混淆 LCA 的定义

```typescript
// 错误：把「深度最小」当成 LCA
// LCA 是深度最大的公共祖先，不是深度最小的
// 深度最小的公共祖先永远是根节点
```

### 2. 倍增法跳过头

```typescript
// 错误：跳完之后没有检查是否跳过了
for (let k = LOG - 1; k >= 0; k--) {
  if (f[u][k] !== f[v][k]) {
    u = f[u][k]
    v = f[v][k]
  }
}
// 此时 u 和 v 的父节点才是 LCA，不是 u 和 v 本身

// 正确：
return f[u][0]  // 返回父节点
```

### 3. 深度对齐时方向搞反

```typescript
// 错误：把较浅的节点往上跳
// 应该把较深的节点往上跳，使其与较浅节点同深
if (depth[u] < depth[v]) [u, v] = [v, u]  // 保证 u 更深
```

### 4. Tarjan 算法中并查集路径压缩时机

并查集的路径压缩必须在「遍历完所有子树并合并之后」进行，否则会得到错误的祖先。

## 实际应用

### 1. 树上两点距离

```typescript
function treeDistance(
  u: number, v: number,
  depth: number[],
  dist: number[]
): number {
  const w = lca(u, v, depth)
  return dist[u] + dist[v] - 2 * dist[w]
}
```

### 2. 路径上的节点计数/求和

在树上 u 到 v 的路径上维护信息时，可以拆分为：
- root 到 u 的信息
- root 到 v 的信息
- 减去 root 到 LCA 的信息（重复计算的部分）

### 3. 判断祖先关系

```typescript
function isAncestor(u: number, v: number, depth: number[]): boolean {
  return lca(u, v, depth) === u
}
```

### 4. 最小公共祖先链上的信息查询

在带权树中，求 u 到 v 路径上的最小边权或最大边权，可以通过倍增法维护 `minEdge[v][k]` 或 `maxEdge[v][k]` 来实现。

## 总结

LCA 是树上算法的核心基础，掌握它对解决大量树上问题至关重要：

| 方法 | 预处理 | 单次查询 | 适用场景 |
|------|--------|----------|----------|
| 暴力上跳 | O(1) | O(n) | 小数据、教学 |
| 倍增法 | O(n log n) | O(log n) | 通用，最常用 |
| Tarjan 离线 | O(1) | O(α(n)) | 所有查询已知 |
| 树链剖分 | O(n) | O(log n) | 需要路径操作 |

**倍增法**是最通用的选择，既能在线查询，又能扩展到路径最值等场景。**Tarjan 离线算法**在所有查询预先知道时效率最高。理解 LCA 的多种求法，是深入学习树上算法的重要一步。
