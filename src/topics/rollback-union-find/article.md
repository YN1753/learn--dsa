# 可撤销并查集 (Rollback Union-Find)

## 概念解释

可撤销并查集是一种**支持撤销最近操作**的并查集变体。它在普通并查集的基础上增加了一个关键能力：可以撤销最近的一次或多次合并操作，将数据结构恢复到之前的状态。

核心思想非常简单：

- **只能撤销最近的操作**（栈式撤销），不能删除任意一条边
- 使用**操作栈**记录每次合并时修改了什么
- 撤销时，根据栈顶记录恢复被修改的状态

类比理解：想象你在玩积木，每次合并两块积木时你拍一张照片。撤销操作就是翻出最近的照片，按照片把积木还原。注意你只能从最近的照片开始翻，不能跳过中间的某张。

### 与普通并查集的区别

| 特性 | 普通并查集 | 可撤销并查集 |
|------|-----------|-------------|
| 合并操作 | 支持 | 支持 |
| 查询操作 | 支持（路径压缩后 O(1)） | 支持（无路径压缩，O(log n)） |
| 撤销操作 | 不支持 | 支持 |
| 路径压缩 | 可以使用 | 不能使用 |
| 按秩合并 | 可选 | 必须使用 |
| 单次合并复杂度 | O(alpha(n)) | O(log n) |

## 为什么重要

可撤销并查集不是一个「炫技」的数据结构，它在算法竞赛和实际工程中有不可替代的作用：

### 1. 线段树分治的基础组件

线段树分治是一种处理「离线动态图连通性」的强大技巧。核心思想是：

- 把每条边的存在时间区间挂到线段树的节点上
- 从上到下遍历线段树，遇到边就加入并查集
- 回溯时撤销操作

如果没有可撤销并查集，线段树分治就无法实现。

### 2. 时间旅行并查集

支持「回到过去某个时间点」的并查集。在需要回溯搜索的场景中非常有用。

### 3. 动态图连通性

在图的边不断增删的情况下，判断两个节点是否连通。可撤销并查集配合线段树分治可以高效处理这类问题。

### 4. 离线算法优化

许多离线算法需要「尝试」某些操作然后回退，可撤销并查集提供了这种能力。

## 核心原理

### 关键约束：不能使用路径压缩

这是可撤销并查集最重要的设计约束。原因很简单：

- 路径压缩会同时修改路径上所有节点的 parent 指针
- 撤销时需要恢复所有这些修改，但你不知道哪些修改属于哪次操作
- 路径压缩是「不可逆」的批量操作

因此，可撤销并查集**只使用按秩合并**来保持树的平衡，保证树高为 O(log n)。

### 数据结构设计

```typescript
class RollbackUnionFind {
  parent: number[]   // parent[i] 表示节点 i 的父节点
  rank: number[]     // rank[i] 表示以 i 为根的树的高度
  history: Array<{   // 操作栈，记录每次修改
    node: number     // 被修改的节点
    oldParent: number // 修改前的 parent 值
    oldRank: number   // 修改前的 rank 值（仅当根节点 rank 变化时）
    wasRoot: boolean  // 被修改的节点之前是否是根
  }> = []

  constructor(n: number) {
    this.parent = new Array(n)
    this.rank = new Array(n).fill(0)
    for (let i = 0; i < n; i++) this.parent[i] = i
  }
}
```

### Find 操作（无路径压缩）

```typescript
find(x: number): number {
  while (this.parent[x] !== x) {
    x = this.parent[x]
  }
  return x
}
```

由于没有路径压缩，find 的时间复杂度为 O(log n)（因为按秩合并保证了树高为 O(log n)）。

### Union 操作（记录修改）

```typescript
union(x: number, y: number): boolean {
  x = this.find(x)
  y = this.find(y)
  if (x === y) return false  // 已在同一集合，无需合并

  // 确保 x 的 rank 更小，挂到 y 下面
  if (this.rank[x] > this.rank[y]) {
    ;[x, y] = [y, x]
  }

  // 记录修改前的状态
  this.history.push({
    node: x,
    oldParent: this.parent[x],
    oldRank: this.rank[y],
    wasRoot: true,
  })

  // 执行合并
  this.parent[x] = y
  if (this.rank[x] === this.rank[y]) {
    this.rank[y]++
  }

  return true
}
```

### Rollback 操作（恢复状态）

```typescript
rollback(): void {
  if (this.history.length === 0) return

  const record = this.history.pop()!
  this.parent[record.node] = record.oldParent
  this.rank[record.node] = record.oldRank
}
```

每次 rollback 恢复一次合并操作。如果要撤销多次操作，多次调用 rollback 即可。

### 快照机制

除了逐次撤销，还可以使用快照（snapshot）机制：

```typescript
// 保存当前状态的「书签」
getSnapshot(): number {
  return this.history.length
}

// 回滚到某个书签位置
rollbackTo(snapshot: number): void {
  while (this.history.length > snapshot) {
    this.rollback()
  }
}
```

快照机制在「尝试一系列操作后回退」的场景中非常有用，比如回溯搜索。

### 复杂度分析

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| find | O(log n) | 无路径压缩，树高为 O(log n) |
| union | O(log n) | 需要两次 find |
| rollback | O(1) | 只恢复栈顶记录 |
| rollbackTo | O(k) | k 为需要撤销的操作数 |

空间复杂度：O(n + m)，其中 m 为操作次数（历史栈大小）。

## 可视化说明

在可视化界面中，可撤销并查集表现为一棵棵不断生长的树：

- 每个**节点**显示元素编号和 parent 值
- **箭头**表示 parent 指向关系
- **不同颜色**区分根节点、普通节点、被合并节点
- **操作栈**显示历史记录，最新操作在栈顶
- **撤销按钮**从栈顶弹出记录，恢复状态

通过可视化可以直观观察：

1. 合并时小树如何挂到大树下
2. rank 如何变化
3. 撤销操作如何精确恢复状态
4. 快照如何标记时间点

## 常见错误

### 1. 使用路径压缩（不可撤销）

```typescript
// 错误：使用了路径压缩
find(x: number): number {
  if (this.parent[x] !== x) {
    this.parent[x] = this.find(this.parent[x])  // 修改了多个节点！
  }
  return this.parent[x]
}

// 正确：不使用路径压缩
find(x: number): number {
  while (this.parent[x] !== x) {
    x = this.parent[x]
  }
  return x
}
```

路径压缩会同时修改路径上所有节点的 parent，导致撤销时无法精确恢复。

### 2. 撤销顺序错误

```typescript
// 错误：跳过中间操作直接撤销
uf.union(0, 1)  // 操作 1
uf.union(2, 3)  // 操作 2
uf.union(1, 2)  // 操作 3
uf.rollbackTo(snapshot1)  // 直接跳回操作 1 之前，但操作 2、3 的影响没有正确恢复

// 正确：按照后进先出的顺序撤销
uf.rollback()  // 撤销操作 3
uf.rollback()  // 撤销操作 2
// 或者使用 rollbackTo，它内部也是按照后进先出的顺序
```

### 3. 忘记检查是否真的合并了

```typescript
// 错误：不管是否合并都记录历史
union(x: number, y: number): void {
  x = this.find(x)
  y = this.find(y)
  this.history.push({ ... })  // 即使 x 和 y 已在同一集合也记录了！
  this.parent[x] = y
}

// 正确：只在真正合并时记录
union(x: number, y: number): boolean {
  x = this.find(x)
  y = this.find(y)
  if (x === y) return false  // 已在同一集合，不记录
  // ... 记录并执行合并
  return true
}
```

如果在未合并时也记录了历史，撤销时会恢复一个没有变化的状态，导致后续操作的快照位置错乱。

### 4. 撤销时 rank 恢复不正确

```typescript
// 错误：只恢复 parent，不恢复 rank
rollback(): void {
  const record = this.history.pop()!
  this.parent[record.node] = record.oldParent
  // 忘记恢复 rank！
}

// 正确：同时恢复 parent 和 rank
rollback(): void {
  const record = this.history.pop()!
  this.parent[record.node] = record.oldParent
  this.rank[record.node] = record.oldRank
}
```

rank 不恢复会导致后续合并决策错误，树可能变得不平衡。

## 实际应用

### 1. 线段树分治

线段树分治是可撤销并查集最重要的应用场景。

问题：给定一个图，每条边在某个时间段 [l, r) 内存在，回答每个时间点的连通性查询。

解法：
- 将每条边的存在区间挂到线段树的 O(log T) 个节点上
- DFS 遍历线段树，进入节点时加入该节点上的所有边
- 到达叶子节点时回答查询
- 回溯时撤销所有在该节点加入的边

```typescript
function solve(node: number, l: number, r: number) {
  const snapshot = uf.getSnapshot()

  // 加入当前节点上的所有边
  for (const edge of nodeEdges[node]) {
    uf.union(edge.u, edge.v)
  }

  if (l + 1 === r) {
    // 叶子节点，回答查询
    answer(l, uf.find(query.u) === uf.find(query.v))
  } else {
    const mid = (l + r) >> 1
    solve(node * 2, l, mid)
    solve(node * 2 + 1, mid, r)
  }

  // 回溯：撤销到进入节点前的状态
  uf.rollbackTo(snapshot)
}
```

### 2. 时间旅行并查集

支持「回到过去」的并查集。每次操作自动保存快照，可以通过时间戳回到任意历史状态。

### 3. 动态图连通性（离线）

配合线段树分治，可以高效处理：
- 边的批量添加和删除
- 任意时刻的连通性查询
- 动态最小生成树的某些变体

### 4. 回溯搜索中的状态管理

在搜索算法中，需要「尝试-回退」的模式。可撤销并查集可以高效管理连通性状态：

```typescript
function search(state: RollbackUnionFind) {
  const snapshot = state.getSnapshot()

  for (const choice of choices) {
    state.union(choice.u, choice.v)  // 尝试
    search(state)                      // 递归
    state.rollbackTo(snapshot)         // 回退
  }
}
```

## 总结

可撤销并查集是普通并查集的重要扩展：

**核心思想**：
- 不使用路径压缩，只用按秩合并，保证 O(log n) 的树高
- 用操作栈记录每次修改，撤销时精确恢复
- 支持快照机制，可以高效回退到任意历史状态

**关键特性**：
- 合并 O(log n)，查询 O(log n)，撤销 O(1)
- 只能撤销最近的操作（栈式），不能删除任意边
- 空间复杂度 O(n + m)，m 为操作次数

**适用场景**：
- 线段树分治（最核心的应用）
- 时间旅行并查集
- 离线动态图连通性
- 回溯搜索中的状态管理

**与普通并查集的权衡**：
- 牺牲了路径压缩带来的 O(alpha(n)) 查询效率
- 换来了撤销操作的能力
- 在需要回溯的场景中，这种权衡是值得的

理解可撤销并查集，是掌握线段树分治等高级离线算法的关键一步。
