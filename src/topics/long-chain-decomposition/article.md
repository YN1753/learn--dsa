# 长链剖分 (Long Chain Decomposition)

## 概念解释

长链剖分是一种**树的分解方法**，它将树中的节点按照「最长链」进行分组。每条长链是从某个节点出发，沿着到叶子节点的**最长路径**所构成的一条链。

核心思想：
- 对于树中的每个节点，定义其**长儿子**（heavy son）为：在所有儿子中，以该儿子为根的子树具有**最大深度**的那个儿子
- 由长儿子连接形成的链称为**长链**（long chain）
- 每个节点恰好属于一条长链

长链剖分与树链剖分（Heavy-Light Decomposition）的区别：
- **树链剖分**：按子树大小（size）选择重儿子，用于路径查询
- **长链剖分**：按子树深度（depth）选择长儿子，用于深度相关DP和k级祖先查询

### 基本术语

| 术语 | 说明 |
|------|------|
| 长儿子 (Heavy Son) | 子树深度最大的儿子节点 |
| 长链 (Long Chain) | 由长儿子连接形成的链 |
| 链顶 (Chain Top) | 每条长链的最高节点 |
| 链长 (Chain Length) | 长链上节点的个数 |
| 继承指针 (Inherited Pointer) | 长儿子复用父亲的DP空间 |

## 为什么重要

长链剖分在以下场景中具有关键优势：

1. **O(n) 处理树上 k 级祖先查询**：通过长链剖分 + 倍增，可以在 O(n log n) 预处理后 O(1) 查询 k 级祖先
2. **优化树上 DP**：对于按深度合并信息的 DP，长链剖分可以将时间复杂度从 O(n^2) 降到 O(n)
3. **继承指针技巧**：长儿子可以复用父亲的DP数组空间，避免重复分配，空间复杂度 O(n)
4. **合并子树贡献**：在处理「按深度合并」类问题时，长链剖分提供了最优的合并策略

### 与其他方法的对比

| 方法 | k 级祖先预处理 | k 级祖先查询 | 按深度 DP |
|------|---------------|-------------|-----------|
| 倍增 | O(n log n) | O(log n) | - |
| 长链剖分 | O(n) | O(1) | O(n) |
| 树链剖分 | - | - | 不适用 |

## 核心原理

### 1. 长链的定义

对于树中的节点 u，定义：
- `depth[u]`：以 u 为根的子树的最大深度（u 到其子树中最深叶子的距离）
- `heavy[u]`：u 的长儿子，即满足 `depth[heavy[u]] = max(depth[v])` 的儿子 v

长链就是从一个节点出发，不断走长儿子直到叶子所形成的路径。

### 2. 剖分方法

长链剖分通过两次 DFS 完成：

**第一次 DFS**：计算每个节点的深度和长儿子

```typescript
function dfs1(u: number, parent: number): void {
  depth[u] = 0
  heavy[u] = -1
  let maxDepth = 0

  for (const v of children[u]) {
    if (v === parent) continue
    dfs1(v, u)
    if (depth[v] + 1 > maxDepth) {
      maxDepth = depth[v] + 1
      heavy[u] = v
      depth[u] = maxDepth
    }
  }
}
```

**第二次 DFS**：分配长链编号

```typescript
let chainId = 0

function dfs2(u: number, topOfChain: number): void {
  top[u] = topOfChain
  chainIdx[u] = chainId

  if (heavy[u] !== -1) {
    dfs2(heavy[u], topOfChain)  // 长儿子继承同一条链
  }

  for (const v of children[u]) {
    if (v !== parent[u] && v !== heavy[u]) {
      chainId++
      dfs2(v, v)  // 非长儿子开新链
    }
  }
}
```

### 3. 继承指针（核心技巧）

继承指针是长链剖分最重要的优化技巧。其核心思想是：

**长儿子复用父亲的 DP 数组空间**，通过偏移量来访问正确的位置。

假设我们维护一个数组 `f[u][d]`，表示以 u 为根的子树中，深度为 d（相对于 u）的节点信息。

```typescript
// 全局数组，大小为 2n
const f: number[] = new Array(2 * MAXN).fill(0)
const offset: number[] = new Array(MAXN).fill(0)

function dfs(u: number, parent: number): void {
  // 长儿子继承父亲的空间（偏移 +1）
  if (heavy[u] !== -1) {
    offset[heavy[u]] = offset[u] + 1
    dfs(heavy[u], u)
  }

  // f[u][0] 就是 u 自身的信息
  f[offset[u]] = info[u]

  // 合并其他儿子的信息
  for (const v of children[u]) {
    if (v !== parent && v !== heavy[u]) {
      offset[v] = offset[u] + depth[u] + 1
      dfs(v, u)

      // 将 v 的贡献合并到 u
      for (let d = 0; d <= depth[v]; d++) {
        f[offset[u] + d + 1] += f[offset[v] + d]
      }
    }
  }
}
```

**关键点**：
- 长儿子的 `f` 数组和父亲的 `f` 数组是同一段内存，只是偏移了 1
- 非长儿子需要新分配空间
- 每条长链只分配一次空间，总空间 O(n)

### 4. k 级祖先 O(1) 查询

长链剖分可以实现 O(1) 的 k 级祖先查询：

1. **预处理**：对每条长链，记录链顶向上跳 1, 2, 4, 8, ... 步能到达的节点
2. **查询**：
   - 如果 k 不超过当前长链长度，直接在链上跳
   - 否则，利用倍增数组跳到祖先所在的长链，再在链上跳

```typescript
// 预处理每条长链的向上跳转表
function preprocess(): void {
  for each chain with top node t:
    let jump = 0
    let node = t
    while (node !== root && jump < chainLength):
      upTable[t][jump] = ancestor of node at distance 2^k
      node = parent[node]
      jump++
}

// 查询 u 的第 k 级祖先
function kthAncestor(u: number, k: number): number {
  // 在当前长链内直接跳
  if (k <= depthInChain[u]) {
    return walkUp(u, k)
  }
  // 跳到链顶，再跳到祖先的链
  k -= depthInChain[u]
  u = top[u]
  u = upTable[u][highestBit(k)]
  k -= highestPowerOf2(k)
  return walkUp(u, k)
}
```

## 可视化说明

在可视化界面中，长链剖分的过程分为以下阶段：

1. **初始状态**：显示一棵树，所有节点默认颜色
2. **深度计算**：逐步计算每个节点的子树最大深度
3. **长儿子标记**：高亮每条长链的长儿子边
4. **长链着色**：不同长链用不同颜色标记
5. **继承指针演示**：展示长儿子如何复用父亲的 DP 空间
6. **k 级祖先查询**：动画演示查询过程

## 常见错误

### 1. 长链定义搞混

```typescript
// 错误：认为长儿子是子树中节点最多的儿子
// 这是树链剖分的重儿子，不是长链剖分的长儿子

// 正确：长儿子是子树深度最大的儿子
function findHeavySon(u: number): number {
  let maxDepth = -1
  let heavySon = -1
  for (const v of children[u]) {
    if (depth[v] > maxDepth) {  // 比较的是深度，不是节点数
      maxDepth = depth[v]
      heavySon = v
    }
  }
  return heavySon
}
```

### 2. 继承指针偏移计算错误

```typescript
// 错误：偏移量计算不考虑当前链的长度
offset[heavySon] = offset[u] + 1  // 看起来对，但要确保 f 数组足够大

// 常见错误：忘记为非长儿子分配新空间
// 正确做法：
for (const v of children[u]) {
  if (v !== heavy[u]) {
    offset[v] = /* 新分配的位置，不是 offset[u] + ... */
  }
}
```

### 3. k 级祖先跳转错误

```typescript
// 错误：在长链内跳转时方向搞反
// 向上跳 k 级 = 从当前节点向链顶方向走 k 步

// 错误：没有处理 k 超过当前链长的情况
// 正确：先在当前链跳，不够再跳到祖先链
```

### 4. 混淆深度定义

```typescript
// depth[u] 应该是 u 到子树中最深叶子的距离（边数）
// 不是 u 到根的距离

// 正确计算：
depth[u] = max(depth[v] for v in children[u]) + 1
// 叶子节点的 depth = 0
```

## 实际应用

### 1. 树上 k 级祖先查询

长链剖分最经典的应用。在 O(n log n) 预处理后，可以在 O(1) 时间内回答 k 级祖先查询。

```typescript
// 应用场景：给定树和多组查询 (u, k)，求 u 的第 k 级祖先
// 暴力 O(nq)，倍增 O(q log n)，长链剖分 O(n log n + q)
```

### 2. 树上距离相关 DP

问题示例：对于每个节点 u，求以 u 为根的子树中，距离 u 恰好为 d 的节点有多少个。

```typescript
// f[u][d] = 以 u 为根的子树中，距离 u 为 d 的节点数
// 使用继承指针：
//   - 长儿子的 f 数组直接继承（偏移 +1）
//   - 非长儿子的贡献暴力合并
// 时间复杂度 O(n)
```

### 3. 按深度合并信息

问题示例：对于每个节点，维护其子树中所有深度为 d 的节点的某种聚合信息（如权值和、最大值等）。

长链剖分保证：每个节点的信息最多被暴力合并一次（当它作为非长儿子被合并时），总复杂度 O(n)。

### 4. 树的中心分解

在某些需要按深度分层处理的问题中，长链剖分提供了自然的分层结构，可以高效地进行信息传递。

## 总结

长链剖分是一种强大的树优化技巧，其核心优势在于：

**关键特性**：
- 按子树深度（而非子树大小）选择长儿子
- 继承指针让长儿子复用父亲的 DP 空间，空间 O(n)
- 每个节点的信息最多被暴力合并一次，时间 O(n)

**适用场景**：
- 树上 k 级祖先查询（O(1) 查询）
- 按深度合并信息的树上 DP
- 距离相关的子树统计问题

**与树链剖分的区别**：
- 树链剖分：按 size 选重儿子，用于路径查询（结合线段树）
- 长链剖分：按 depth 选长儿子，用于深度 DP 和 k 级祖先

**注意事项**：
- 长链剖分的常数较小，实际运行效率高
- 继承指针的实现需要仔细处理偏移量
- 适用于深度相关的问题，不适用于路径查询问题
