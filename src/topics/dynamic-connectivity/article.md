# 动态图连通性 (Dynamic Connectivity)

## 概念解释

动态图连通性问题是指：在一个不断变化的图中，高效地维护节点之间的连通关系。

具体来说，我们需要支持以下操作：

- **加边（Add Edge）**：在图中添加一条新边
- **删边（Remove Edge）**：从图中删除一条已有的边
- **连通性查询（Query）**：判断两个节点是否在同一连通分量中

这类问题的核心挑战在于：当图的结构动态变化时，传统的并查集无法直接处理删边操作。我们需要更高级的框架来解决这个问题。

### 线段树分治 + 可撤销并查集

解决离线动态连通性的标准框架是**线段树分治（Segment Tree Divide and Conquer）**配合**可撤销并查集（Rollback Union-Find）**。

核心思想：

1. 每条边有一个「存活时间区间」，即从加入到删除的时间段
2. 将所有边的存活区间分配到线段树的节点上
3. 从线段树的根节点出发，深度优先遍历，进入节点时加入该节点存储的边，离开时撤销
4. 到达叶子节点时回答该时刻的查询

```
时间轴:   0    1    2    3    4    5
          |    |    |    |    |    |
边 (0,1): [====)
边 (1,2):      [==========)
边 (0,2):           [====)
查询:     q0        q1   q2       q3

线段树分治将每条边分配到 O(log T) 个节点
DFS 过程中维护并查集状态，到达叶子时回答查询
```

### 核心术语

| 术语 | 说明 |
|------|------|
| 线段树分治 | 将时间区间问题转化为树上的 DFS 遍历 |
| 可撤销并查集 | 支持回退上一次合并操作的并查集 |
| 按秩合并 | 合并时将矮树挂到高树下，保证树高 O(log n) |
| 操作栈 | 记录每次合并的细节，用于回退 |
| 离线算法 | 需要提前知道所有操作，然后统一处理 |

## 为什么重要

动态图连通性在算法竞赛和实际工程中都有重要应用：

1. **竞赛高频考点**：线段树分治是处理离线动态图问题的标准框架，出现在许多高水平竞赛题中
2. **时间复杂度优秀**：总时间复杂度为 O(m log m * alpha(n))，其中 m 是操作数量
3. **框架通用性强**：线段树分治的思想可以推广到其他「带删除」的离线问题
4. **弥补并查集不足**：标准并查集不支持删边，线段树分治巧妙地将删边转化为「不加边」

## 核心原理

### 可撤销并查集（Rollback Union-Find）

可撤销并查集是标准并查集的变体，关键区别：

- **不使用路径压缩**：路径压缩会修改多个节点的父指针，撤销代价太大
- **仅使用按秩合并**：每次合并只修改一个节点的父指针和一个节点的秩，易于撤销
- **维护操作栈**：每次合并将修改信息压栈，撤销时弹栈恢复

```typescript
class RollbackUnionFind {
  parent: number[]
  rank: number[]
  stack: Array<[number, number, number, number]> // [nodeX, parentX, nodeY, rankY, sizeDiff]

  constructor(n: number) {
    this.parent = new Array(n)
    this.rank = new Array(n).fill(0)
    this.stack = []
    for (let i = 0; i < n; i++) this.parent[i] = i
  }

  find(x: number): number {
    // 不使用路径压缩！
    while (this.parent[x] !== x) {
      x = this.parent[x]
    }
    return x
  }

  union(x: number, y: number): boolean {
    let rootX = this.find(x)
    let rootY = this.find(y)
    if (rootX === rootY) return false

    // 按秩合并：矮树挂到高树下
    if (this.rank[rootX] > this.rank[rootY]) {
      ;[rootX, rootY] = [rootY, rootX]
    }

    // 记录修改前的状态
    this.stack.push([rootX, this.parent[rootX], rootY, this.rank[rootY]])

    this.parent[rootX] = rootY
    if (this.rank[rootX] === this.rank[rootY]) {
      this.rank[rootY]++
    }
    return true
  }

  rollback(): void {
    if (this.stack.length === 0) return
    const [nodeX, oldParentX, nodeY, oldRankY] = this.stack.pop()!
    this.parent[nodeX] = oldParentX
    this.rank[nodeY] = oldRankY
  }
}
```

关键点：每次 `union` 最多修改两个值（一个 parent 和一个 rank），所以撤销时只需恢复这两个值。

### 线段树分治（Segment Tree Divide and Conquer）

线段树分治的核心步骤：

**第一步：建立边的时间区间**

对于每条边 (u, v)，记录它从时间 `L` 存活到时间 `R`（左闭右开区间 [L, R)）。

```typescript
interface EdgeInterval {
  u: number
  v: number
  l: number  // 加入时间
  r: number  // 删除时间（如果是永久边，设为总时间 T）
}
```

**第二步：将区间分配到线段树节点**

对于区间 [L, R)，在线段树上找到 O(log T) 个节点完全覆盖它，将边存到这些节点中。

```typescript
function addToSegmentTree(
  tree: Map<number, Array<[number, number]>>,
  node: number, nodeL: number, nodeR: number,
  queryL: number, queryR: number,
  edge: [number, number]
): void {
  if (queryL >= nodeR || queryR <= nodeL) return
  if (queryL <= nodeL && nodeR <= queryR) {
    if (!tree.has(node)) tree.set(node, [])
    tree.get(node)!.push(edge)
    return
  }
  const mid = (nodeL + nodeR) >> 1
  addToSegmentTree(tree, node * 2, nodeL, mid, queryL, queryR, edge)
  addToSegmentTree(tree, node * 2 + 1, mid, nodeR, queryL, queryR, edge)
}
```

**第三步：DFS 遍历线段树**

```typescript
function dfs(
  tree: Map<number, Array<[number, number]>>,
  uf: RollbackUnionFind,
  queries: Array<[number, number, number]>, // [u, v, time]
  node: number, nodeL: number, nodeR: number,
  answers: boolean[]
): void {
  // 记录当前栈大小，用于回退
  const snapshot = uf.stack.length

  // 加入当前节点存储的所有边
  const edges = tree.get(node) || []
  for (const [u, v] of edges) {
    uf.union(u, v)
  }

  if (nodeR - nodeL === 1) {
    // 叶子节点：回答该时刻的查询
    for (const [u, v, t] of queries) {
      if (t === nodeL) {
        answers[t] = uf.find(u) === uf.find(v)
      }
    }
  } else {
    const mid = (nodeL + nodeR) >> 1
    dfs(tree, uf, queries, node * 2, nodeL, mid, answers)
    dfs(tree, uf, queries, node * 2 + 1, mid, nodeR, answers)
  }

  // 回退：撤销当前节点加入的所有边
  while (uf.stack.length > snapshot) {
    uf.rollback()
  }
}
```

### 完整框架示例

```typescript
interface Operation {
  type: 'add' | 'remove' | 'query'
  u: number
  v: number
}

function solveDynamicConnectivity(n: number, ops: Operation[]): boolean[] {
  const T = ops.length
  const edgeLife = new Map<string, number>() // edge -> start time
  const intervals: Array<{ u: number; v: number; l: number; r: number }> = []
  const queries: Array<[number, number, number]> = []

  // 处理所有操作，建立边的时间区间
  for (let t = 0; t < T; t++) {
    const op = ops[t]
    const key = `${Math.min(op.u, op.v)}-${Math.max(op.u, op.v)}`

    if (op.type === 'add') {
      edgeLife.set(key, t)
    } else if (op.type === 'remove') {
      const start = edgeLife.get(key)!
      intervals.push({ u: op.u, v: op.v, l: start, r: t })
      edgeLife.delete(key)
    } else {
      queries.push([op.u, op.v, t])
    }
  }

  // 未删除的边，存活到结束
  for (const [key, start] of edgeLife) {
    const [u, v] = key.split('-').map(Number)
    intervals.push({ u, v, l: start, r: T })
  }

  // 将边分配到线段树
  const tree = new Map<number, Array<[number, number]>>()
  for (const { u, v, l, r } of intervals) {
    addToSegmentTree(tree, 1, 0, T, l, r, [u, v])
  }

  // DFS 遍历回答查询
  const uf = new RollbackUnionFind(n)
  const answers: boolean[] = new Array(T).fill(false)
  dfs(tree, uf, queries, 1, 0, T, answers)

  return answers.filter((_, i) => ops[i]?.type === 'query')
}
```

## 可视化说明

在可视化界面中，动态图连通性的过程分为两个主要部分：

### 线段树分治视图

- **左侧**显示线段树结构，每个节点存储分配到该时间区间的边
- **高亮**当前 DFS 遍历到的路径
- 节点中显示该区间内存储的边列表

### 并查集森林视图

- **右侧**显示当前的并查集森林结构
- 节点按所属连通分量着色
- 加入边时，两棵树合并的动画
- 撤销操作时，树分裂回原来状态的动画

### 时间轴视图

- **底部**显示时间轴，标记每条边的存活区间
- 查询时刻用特殊标记高亮
- 当前时间用游标指示

## 常见错误

### 1. 在可撤销并查集中使用路径压缩

```typescript
// 错误：路径压缩会修改多个节点的 parent
function findBad(parent: number[], x: number): number {
  if (parent[x] !== x) {
    parent[x] = findBad(parent, parent[x]) // 修改了 parent[x]！
  }
  return parent[x]
}

// 正确：只读遍历，不修改任何值
function findGood(parent: number[], x: number): number {
  while (parent[x] !== x) {
    x = parent[x]
  }
  return x
}
```

路径压缩会同时修改路径上所有节点的 parent，撤销时无法知道哪些节点被修改了。必须使用按秩合并来保证树高。

### 2. 撤销顺序错误

```typescript
// 错误：不按栈顺序撤销
uf.rollback()
uf.rollback()
// 如果中间插入了新的合并，撤销顺序会混乱

// 正确：利用快照机制，精确撤销到指定状态
const snapshot = uf.stack.length
// ... 执行一些合并 ...
while (uf.stack.length > snapshot) {
  uf.rollback()  // 按 LIFO 顺序撤销
}
```

### 3. 边的存活区间计算错误

```typescript
// 错误：同一条边多次出现时，时间区间计算混乱
// 例如：加边(0,1) -> 删边(0,1) -> 加边(0,1) -> 删边(0,1)
// 应该生成两个独立的时间区间，而不是一个大区间

// 正确：用 Map 记录每条边当前的加入时间
const edgeLife = new Map<string, number>()
// 加边时：edgeLife.set(key, t)
// 删边时：intervals.push({ l: edgeLife.get(key)!, r: t }); edgeLife.delete(key)
```

### 4. 查询时机错误

```typescript
// 错误：在非叶子节点回答查询
// 查询应该只在叶子节点（对应具体时刻）回答

// 正确：
if (nodeR - nodeL === 1) {
  // 这是叶子节点，对应时刻 nodeL
  for (const [u, v, t] of queries) {
    if (t === nodeL) {
      answers[t] = uf.find(u) === uf.find(v)
    }
  }
}
```

## 实际应用

### 1. 离线动态连通性查询

这是最直接的应用。给定一系列加边、删边和查询操作，离线回答所有查询。

```typescript
// 输入：
// 操作序列：加(0,1), 加(1,2), 查询(0,2), 删(0,1), 加(2,3), 查询(0,3)
// 输出：
// 查询结果：true, false
```

### 2. 图的可达性分析

在社交网络中，用户之间的关注关系是动态变化的。线段树分治可以在离线场景下高效回答「在时刻 t，用户 A 和用户 B 是否在同一个社交圈中」。

### 3. 网络拓扑变化分析

计算机网络中，链路会因为故障或维护而动态断开和恢复。线段树分治可以分析历史数据，回答「在网络拓扑变化的某个时刻，节点 A 和节点 B 是否可达」。

### 4. 竞赛高级数据结构题

许多竞赛题目基于线段树分治框架：

- 带删除的最小生成树
- 动态图的连通分量计数
- 带删除的二分图判定
- 离线处理可持久化数据结构

## 总结

动态图连通性是处理离线动态图问题的标准框架，核心要点：

1. **两大组件**：线段树分治负责时间维度的区间管理，可撤销并查集负责空间维度的连通性维护。
2. **关键限制**：可撤销并查集不能使用路径压缩，只能用按秩合并来保证树高 O(log n)。
3. **时间复杂度**：O(m log m * alpha(n))，其中 m 是操作数量，alpha 是反阿克曼函数。
4. **撤销机制**：利用操作栈和快照机制，精确撤销到任意历史状态。
5. **框架通用性**：线段树分治的思想可以推广到其他需要「回退」的离线问题。

动态图连通性将两个经典数据结构（线段树和并查集）巧妙结合，是「离线算法」思想的精华体现。理解这个框架，对掌握高级数据结构和离线算法设计都有很大帮助。
