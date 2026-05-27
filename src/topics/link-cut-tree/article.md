# Link-Cut Tree (动态树)

## 概念解释

Link-Cut Tree（简称 LCT）是一种用于维护**动态树**信息的高级数据结构，由 Sleator 和 Tarjan 于 1983 年提出。它能在均摊 O(log n) 的时间内完成树的**连接、断开、路径查询**等操作。

### 核心思想

LCT 的核心思想是将一棵树分解为若干条**偏好路径 (preferred path)**，每条偏好路径用一棵 **Splay Tree** 维护。这样，树上的路径操作就转化为 Splay 上的序列操作。

### 关键概念

| 术语 | 说明 |
|------|------|
| 实边 (Solid Edge) | 偏好路径上的边，连接父子关系 |
| 虚边 (Dashed Edge) | 不在偏好路径上的边 |
| 偏好路径 (Preferred Path) | 由实边连接的路径片段 |
| Splay Tree | 维护每条偏好路径的平衡二叉搜索树 |
| access(u) | 将 u 到根的路径变为偏好路径 |

### 偏好路径图示

```
实树:          LCT 分解:
    1             1 (Splay根)
   / \           / \
  2   3         2   3
 / \               / \
4   5             4   5
                  |
                  6
```

偏好路径将树「拍平」为 Splay 序列，使得路径上的节点在 Splay 中连续。

## 为什么重要

LCT 在算法竞赛和理论计算机科学中有重要地位：

1. **动态连接性**：支持在线判断两点是否连通，以及动态加边/删边
2. **路径操作**：路径求和、路径最大值、路径修改等，均摊 O(log n)
3. **树的动态维护**：link（连接）和 cut（断开）操作，比重新建树高效得多
4. **理论基础**：为动态树问题提供了通用框架

### 典型应用场景

- 动态最小生成树 (Dynamic MST)
- 动态最近公共祖先 (Dynamic LCA)
- 树链剖分的动态版本
- 网络流中的动态树优化

## 核心原理

### 节点结构

LCT 的每个节点维护以下信息：

```typescript
class LCTNode {
  val: number           // 节点值
  parent: LCTNode | null // 父指针
  child: [LCTNode | null, LCTNode | null] // 左右孩子
  rev: boolean          // 翻转标记 (用于 makeRoot)
  // 可维护额外信息：sum, max, min, size 等
}
```

### isRoot 判断

LCT 中判断一个节点是否为 Splay 的根（而非整棵树的根）：

```typescript
function isRoot(x: LCTNode): boolean {
  const p = x.parent
  return p === null || (p.child[0] !== x && p.child[1] !== x)
}
```

关键区别：如果 x 是父节点的「偏好孩子」（实边），则 x 不是 Splay 根；否则（虚边连接）x 是 Splay 根。

### access 操作

`access(u)` 是 LCT 最核心的操作，它将 u 到原树根的路径变为偏好路径：

```typescript
function access(u: LCTNode): void {
  let last: LCTNode | null = null
  let y: LCTNode | null = u
  while (y !== null) {
    splay(y)
    y.child[1] = last  // 断开右子树，接上上次的 Splay
    last = y
    y = y.parent       // 沿虚边向上
  }
  splay(u)
}
```

执行 `access(u)` 后，u 到根的路径上的所有节点在同一个 Splay 中，且 u 是该 Splay 的最右节点（最大值）。

### makeRoot 操作

`makeRoot(u)` 将 u 设为整棵树的根：

```typescript
function makeRoot(u: LCTNode): void {
  access(u)
  u.rev ^= true  // 翻转整条偏好路径
}
```

原理：先 access(u)，此时 u 到原根的路径在 Splay 中。翻转后，u 变为路径的起点（最小值），即新根。

### link 操作

`link(u, v)` 将 u 连接到 v 下方：

```typescript
function link(u: LCTNode, v: LCTNode): void {
  makeRoot(u)
  u.parent = v  // u 变为 v 的虚儿子
}
```

### cut 操作

`cut(u, v)` 删除 u 和 v 之间的边：

```typescript
function cut(u: LCTNode, v: LCTNode): void {
  makeRoot(u)
  access(v)
  // 此时 v 的左子树就是 u，断开连接
  v.child[0] = null
  u.parent = null
}
```

### findRoot 操作

`findRoot(u)` 找到 u 所在树的根：

```typescript
function findRoot(u: LCTNode): LCTNode {
  access(u)
  // Splay 中最左节点就是根
  while (u.child[0] !== null) {
    pushDown(u)
    u = u.child[0]
  }
  splay(u)
  return u
}
```

## 可视化说明

LCT 的可视化需要展示两个层面：

1. **实树结构**：原始的树结构，显示实边和虚边
2. **Splay 结构**：每条偏好路径对应的 Splay Tree

操作过程中可以观察：
- access 如何逐步「暴露」路径
- Splay 如何旋转保持平衡
- makeRoot 如何通过翻转改变树根

## 常见错误

### 1. 忘记 pushDown

Splay 操作前必须先将翻转标记下传，否则树结构会混乱：

```typescript
// 错误：直接 splay，没有下传标记
function badSplay(x: LCTNode): void {
  // ...
}

// 正确：先收集路径，从上到下 pushDown
function goodSplay(x: LCTNode): void {
  const path: LCTNode[] = []
  let cur: LCTNode | null = x
  while (!isRoot(cur)) {
    path.push(cur)
    cur = cur.parent
  }
  path.push(cur)
  for (let i = path.length - 1; i >= 0; i--) pushDown(path[i])
  // 然后执行旋转
}
```

### 2. isRoot 判断错误

LCT 的 isRoot 不是判断「整棵树的根」，而是判断「Splay 的根」：

```typescript
// 错误：认为 parent 为 null 就是根
function badIsRoot(x: LCTNode): boolean {
  return x.parent === null
}

// 正确：判断是否为偏好孩子
function goodIsRoot(x: LCTNode): boolean {
  const p = x.parent
  return p === null || (p.child[0] !== x && p.child[1] !== x)
}
```

### 3. link 前忘记 makeRoot

直接设置 parent 可能导致环：

```typescript
// 错误：可能导致环
function badLink(u: LCTNode, v: LCTNode): void {
  u.parent = v
}

// 正确：先 makeRoot
function goodLink(u: LCTNode, v: LCTNode): void {
  makeRoot(u)
  u.parent = v
}
```

## 实际应用

### 1. 动态连通性

判断两点是否连通，以及动态加边/删边：

```typescript
function connected(u: LCTNode, v: LCTNode): boolean {
  return findRoot(u) === findRoot(v)
}
```

### 2. 路径查询与修改

查询路径上的信息（和、最大值等）：

```typescript
function queryPath(u: LCTNode, v: LCTNode): number {
  makeRoot(u)
  access(v)
  return v.sum  // v 的子树信息就是 u-v 路径上的信息
}
```

### 3. 动态最小生成树

在图中动态维护最小生成树，当边权变化时高效更新。

### 4. 竞赛中的动态树问题

LCT 是解决一类「动态树」问题的标准工具，常见于算法竞赛的高级题目中。

## 总结

Link-Cut Tree 是一种强大的动态树数据结构：

**核心操作**：
- `access(u)`：暴露 u 到根的路径，O(log n)
- `makeRoot(u)`：将 u 设为根，O(log n)
- `link(u, v)`：连接 u 和 v，O(log n)
- `cut(u, v)`：断开 u 和 v，O(log n)

**优点**：
- 均摊 O(log n) 的时间复杂度
- 支持路径查询和修改
- 支持动态连接和断开
- 通用性强，可维护多种信息

**缺点**：
- 实现复杂度较高
- 常数较大
- 子树操作需要特殊处理

**适用场景**：
- 需要动态维护树结构的问题
- 需要高效路径查询的问题
- 算法竞赛中的动态树题目

理解 LCT 需要先掌握 Splay Tree 和树链剖分的思想。它是高级数据结构中的一颗明珠，掌握它能解决许多复杂的动态树问题。
