# 欧拉序 (Euler Tour / Euler Order)

## 概念解释

欧拉序是一种对树进行DFS遍历时产生的**节点序列**。它的核心思想是：在DFS过程中，每次「访问」或「回溯」一个节点时，都将其记录到序列中。

### 两种欧拉序

**1. 完全欧拉序（Euler Tour Sequence）**

DFS遍历过程中，每次经过一个节点（无论是进入还是离开）都记录一次。对于一棵有 n 个节点的树，完全欧拉序的长度为 2n-1。

```
       1
      / \
     2   3
    / \
   4   5

完全欧拉序: [1, 2, 4, 2, 5, 2, 1, 3, 1]
```

**2. 入出序（Entry-Exit Order / DFS Order）**

只在首次访问节点时记录一次「入」时间戳，在离开该节点子树时记录一次「出」时间戳。每个节点恰好出现两次，序列长度为 2n。

```
       1
      / \
     2   3
    / \
   4   5

入出序: [1, 2, 4, 4, 5, 5, 2, 3, 3, 1]
（也可以用 in/out 时间戳表示: in[1]=0, out[1]=9, in[2]=1, out[2]=6, ...）
```

### 基本术语

| 术语 | 说明 |
|------|------|
| 欧拉序 | DFS遍历时每次经过节点都记录的序列 |
| 入出序 | 只记录首次访问和离开时的序列 |
| in[u] | 节点 u 首次被访问时在序列中的位置 |
| out[u] | 节点 u 的子树遍历完毕离开时的位置 |
| DFS序 | 有时特指入出序中「入」的顺序 |

## 为什么重要

欧拉序的最大价值在于：**将树上问题转化为序列问题**。

树是一种非线性结构，很多在数组上可以高效处理的操作（区间修改、区间查询）无法直接应用到树上。但通过欧拉序，我们可以：

1. **子树变为区间**：在入出序中，节点 u 的整个子树对应的是一段连续区间 [in[u], out[u]]
2. **配合数据结构**：将树映射为序列后，可以使用线段树、树状数组等经典数据结构进行高效处理
3. **LCA查询**：完全欧拉序配合RMQ（区间最值查询）可以在线求最近公共祖先
4. **树上差分**：利用入出序的区间性质，高效处理树上的路径加减操作

## 核心原理

### 1. 入出序的生成

```typescript
function eulerTour(
  tree: number[][],
  u: number,
  parent: number,
  inTime: number[],
  outTime: number[],
  timer: { value: number }
): void {
  inTime[u] = timer.value++  // 记录「入」时间
  for (const v of tree[u]) {
    if (v !== parent) {
      eulerTour(tree, v, u, inTime, outTime, timer)
    }
  }
  outTime[u] = timer.value++  // 记录「出」时间
}
```

**关键性质**：对于任意节点 u，其子树中所有节点 v 满足 `in[u] <= in[v] && out[v] <= out[u]`。

### 2. 子树修改

利用入出序的区间性质，子树上的操作可以转化为区间操作：

```typescript
// 将节点 u 的整个子树中所有节点加上 val
// 转化为：在序列的 [in[u], out[u]] 区间上执行加法
function addSubtree(
  BIT: FenwickTree,
  inTime: number[],
  outTime: number[],
  u: number,
  val: number
): void {
  BIT.add(inTime[u], val)
  BIT.add(outTime[u] + 1, -val)  // 差分思想
}
```

### 3. 完全欧拉序求LCA

完全欧拉序的一个经典应用是求两个节点的最近公共祖先（LCA）：

```typescript
// 思路：
// 1. 生成完全欧拉序 tour[]
// 2. 记录每个节点首次出现的位置 first[u]
// 3. LCA(u, v) = tour 中 [first[u], first[v]] 区间内深度最小的节点
// 4. 使用线段树或ST表进行区间最值查询
function lca(
  u: number,
  v: number,
  first: number[],
  tour: number[],
  depth: number[],
  st: SparseTable
): number {
  let l = first[u]
  let r = first[v]
  if (l > r) [l, r] = [r, l]
  return st.query(l, r, depth, tour)  // 返回区间内深度最小的节点
}
```

**时间复杂度**：预处理 O(n log n)，每次查询 O(1)。

### 4. 树上差分

利用入出序可以高效处理「给某条路径上的所有节点加一个值」这类问题：

```typescript
// 给 u 到 v 的路径上所有节点加上 val
// 使用树上差分 + 入出序 + 树状数组
function addPath(
  u: number,
  v: number,
  lcaNode: number,
  parent: number[],
  val: number,
  BIT: FenwickTree,
  inTime: number[]
): void {
  BIT.add(inTime[u], val)
  BIT.add(inTime[v], val)
  BIT.add(inTime[lcaNode], -val)
  if (parent[lcaNode] !== -1) {
    BIT.add(inTime[parent[lcaNode]], -val)
  }
}
```

### 时间复杂度总结

| 操作 | 时间复杂度 | 说明 |
|------|------------|------|
| 生成欧拉序 | O(n) | 一次DFS遍历 |
| 子树修改 | O(log n) | 配合线段树/树状数组 |
| 子树查询 | O(log n) | 配合线段树/树状数组 |
| LCA查询（完全欧拉序+ST表） | O(1) | 预处理 O(n log n) |
| 路径修改（树上差分） | O(log n) | 配合树状数组 |

## 可视化说明

在可视化界面中，欧拉序的构建过程通过以下方式展示：

- **树结构**：左侧显示原始树，节点按照DFS遍历顺序依次高亮
- **序列**：右侧显示正在构建的欧拉序数组，新加入的元素高亮
- **时间戳**：每个节点旁标注 in/out 时间戳
- **区间映射**：选中某个节点时，高亮其在序列中对应的区间

通过可视化可以直观理解：
- DFS遍历时节点的进出顺序
- 子树如何对应序列中的连续区间
- 两种欧拉序的区别

## 常见错误

### 1. 混淆两种欧拉序

```typescript
// 错误：将完全欧拉序的性质套用到入出序上
// 完全欧拉序中，LCA(u,v) 是 first[u]..first[v] 区间内深度最小的节点
// 入出序中不能这样求LCA！

// 正确：明确区分两种欧拉序的用途
// 完全欧拉序 -> LCA（RMQ）
// 入出序 -> 子树操作（区间修改/查询）
```

### 2. 入出序区间大小计算错误

```typescript
// 错误：认为子树大小 = out[u] - in[u]
// 实际上子树大小 = (out[u] - in[u]) / 2 + 1  (当每个节点出现两次时)
// 或者如果使用纯 in 时间戳: 子树大小 = out[u] - in[u] + 1 (如果out是子树中最后一个节点的in)

// 正确：根据具体的序列定义来计算
// 如果 in/out 都记录（每个节点出现两次）:
//   子树区间为 [in[u], out[u]], 区间长度 = out[u] - in[u] + 1
//   子树中节点数 = (out[u] - in[u]) / 2
```

### 3. LCA区间最小值查询错误

```typescript
// 错误：在完全欧拉序中，查询区间取 [in[u], in[v]]
// 但没有保证 in[u] <= in[v]

// 正确：先比较大小
function lcaQuery(u: number, v: number, first: number[]): [number, number] {
  let l = first[u]
  let r = first[v]
  if (l > r) [l, r] = [r, l]  // 确保 l <= r
  return [l, r]
}
```

### 4. 忘记处理父节点

```typescript
// 错误：DFS时没有记录父节点，导致在无向图上无限循环
function wrongDfs(tree: number[][], u: number): void {
  inTime[u] = timer++
  for (const v of tree[u]) {
    wrongDfs(tree, v)  // 可能回到父节点！
  }
  outTime[u] = timer++
}

// 正确：传入父节点参数
function correctDfs(tree: number[][], u: number, parent: number): void {
  inTime[u] = timer++
  for (const v of tree[u]) {
    if (v !== parent) {
      correctDfs(tree, v, u)
    }
  }
  outTime[u] = timer++
}
```

## 实际应用

### 1. 子树修改 + 路径查询

在树上进行子树加法和路径求和的混合操作：

- 使用入出序将子树映射为区间
- 配合线段树进行区间修改
- 使用树链剖分处理路径查询

### 2. LCA在线算法

完全欧拉序 + ST表是求LCA最常用的方法之一：

- 预处理：O(n log n)
- 单次查询：O(1)
- 实现简单，常数小
- 适用于需要大量LCA查询的场景

### 3. 树上差分

处理「给树上路径加值，最后求每个节点的值」这类问题：

- 入出差分：利用入出序的区间性质
- 配合树状数组进行单点修改、前缀查询
- 时间复杂度 O(n log n)

### 4. DFS序应用

入出序的一个特例是DFS序（只记录入时间），可以用于：

- 判断节点 u 是否是节点 v 的祖先：`in[u] <= in[v] && out[v] <= out[u]`
- 子树节点排序
- 树上莫队算法的基础

## 总结

欧拉序是一种强大的树上技巧：

**核心思想**：
- 通过DFS将树映射为线性序列
- 利用序列上的区间性质处理树上问题

**两种欧拉序**：
- **完全欧拉序**：每次经过节点都记录，长度 2n-1，主要用于LCA
- **入出序**：每个节点记录入/出两次，长度 2n，主要用于子树操作

**优势**：
- 将复杂的树上问题转化为简单的序列问题
- 可以配合线段树、树状数组等经典数据结构
- 实现简单，代码量小

**适用场景**：
- 子树的批量修改和查询
- 最近公共祖先（LCA）的高效求解
- 树上差分和路径操作
- 树上莫队算法

掌握欧拉序是进阶树上算法的重要一步，它与树链剖分、点分治等技巧共同构成了树上问题的完整解题工具箱。
