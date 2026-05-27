# 离线算法 (Offline Algorithms)

## 概念解释

离线算法是一种特殊的算法设计范式。与在线算法逐个处理到达的查询不同，离线算法要求我们**预先知道所有的查询**，然后通过重新排列查询的处理顺序来优化整体性能。

核心思想可以类比为：

> 你有一堆快递要送。在线算法是来一单送一单，离线算法是先看所有订单，规划最优路线后再出发。

### 在线 vs 离线

| 特性 | 在线算法 | 离线算法 |
|------|----------|----------|
| 查询到达 | 逐个到达 | 全部已知 |
| 处理方式 | 按到达顺序处理 | 可重排顺序 |
| 适用场景 | 实时响应 | 批量处理 |
| 灵活性 | 高 | 受限 |
| 效率 | 通常较低 | 通常更高 |

## 为什么重要

离线算法在算法竞赛和实际工程中都非常重要：

1. **性能优势明显**：许多问题离线处理比在线处理快一个量级，例如莫队算法将区间查询优化到 O(n*sqrt(m))
2. **解决在线难以处理的问题**：某些问题在线处理非常困难甚至不可能高效实现，但离线后可以巧妙解决
3. **算法设计的重要思路**：离线思想是分治、排序、数据结构等技巧的综合运用
4. **实际应用广泛**：数据库批量查询优化、离线数据分析、图形渲染预处理等场景都依赖离线思想

## 核心原理

离线算法的核心在于：**通过改变查询的处理顺序，使得相邻查询之间的状态变化量最小**，从而摊销总时间复杂度。

### 1. 查询排序

最常见的离线优化手段是排序。不同的排序策略适用于不同问题：

**莫队算法（Mo's Algorithm）**：
- 将查询按左端点所在块分组，块内按右端点排序
- 复杂度从 O(n*m) 优化到 O(n*sqrt(m))

```typescript
function moSort(queries: Query[], blockSize: number): Query[] {
  return [...queries].sort((a, b) => {
    const blockA = Math.floor(a.l / blockSize)
    const blockB = Math.floor(b.l / blockSize)
    if (blockA !== blockB) return blockA - blockB
    return blockA % 2 === 0 ? a.r - b.r : b.r - a.r
  })
}
```

**CDQ 分治**：
- 将查询按时间维度排序
- 通过分治处理左半部分对右半部分的贡献
- 适用于多维偏序问题

### 2. 回滚技术（回退 / Rollback）

有些操作容易添加但难以撤销（如并查集的 Union）。回滚技术的思想是：

1. 先执行所有添加操作
2. 到达某个检查点时，保存状态快照
3. 需要回退时，恢复到快照状态

```typescript
// 并查集回滚示例
class RollbackDSU {
  parent: number[]
  rank: number[]
  history: [number, number, number][] = [] // [child, oldParent, oldRank]

  find(x: number): number {
    while (this.parent[x] !== x) x = this.parent[x]
    return x
  }

  union(x: number, y: number): boolean {
    x = this.find(x)
    y = this.find(y)
    if (x === y) return false
    if (this.rank[x] < this.rank[y]) [x, y] = [y, x]
    this.history.push([y, this.parent[y], this.rank[x]])
    this.parent[y] = x
    if (this.rank[x] === this.rank[y]) this.rank[x]++
    return true
  }

  snapshot(): number {
    return this.history.length
  }

  rollback(to: number): void {
    while (this.history.length > to) {
      const [child, oldParent, oldRank] = this.history.pop()!
      this.parent[child] = oldParent
      // rank 回退逻辑省略
    }
  }
}
```

### 3. 整体二分（Parallel Binary Search）

对多个查询同时进行二分搜索：

- 所有查询共享同一个二分框架
- 每次二分的 check 操作可以批量处理
- 将 m 个查询的二分从 O(m * n * log n) 优化到 O(n * log n * log MAX)

```typescript
function parallelBinarySearch(queries: Query[], n: number): number[] {
  const m = queries.length
  let low = Array(m).fill(0)
  let high = Array(m).fill(n - 1)
  const ans = Array(m).fill(0)

  while (true) {
    let hasWork = false
    const buckets: Query[][] = Array(n).fill(null).map(() => [])

    for (let i = 0; i < m; i++) {
      if (low[i] <= high[i]) {
        hasWork = true
        const mid = Math.floor((low[i] + high[i]) / 2)
        buckets[mid].push({ ...queries[i], queryIdx: i })
      }
    }

    if (!hasWork) break

    // 按中点分组，逐步添加数据并检查
    // 具体 check 逻辑取决于问题类型
    for (let mid = 0; mid < n; mid++) {
      // 执行到 mid 位置的操作
      for (const q of buckets[mid]) {
        const idx = q.queryIdx
        if (check(q)) {
          ans[idx] = mid
          high[idx] = mid - 1
        } else {
          low[idx] = mid + 1
        }
      }
    }
  }

  return ans
}
```

### 4. 离线处理 vs 在线处理的权衡

选择离线还是在线取决于：

| 考虑因素 | 选择离线 | 选择在线 |
|----------|----------|----------|
| 查询是否提前已知 | 是 | 否 |
| 是否需要实时响应 | 否 | 是 |
| 数据是否可排序 | 是 | 否 |
| 空间限制 | 宽松 | 严格 |
| 追求最优复杂度 | 是 | 否 |

## 可视化说明

在可视化界面中，可以观察以下内容：

- **在线处理**：查询按原始顺序依次到达和处理，每次从零开始
- **离线处理**：先展示所有查询，然后按优化后的顺序处理，状态在查询间传递
- **状态复用**：离线处理中相邻查询共享大部分状态，只需增量修改
- **排序策略**：不同排序策略对处理顺序和总步数的影响

通过对比可以直观感受到离线重排带来的效率提升。

## 常见错误

### 1. 混淆离线和在线

```typescript
// 错误：在离线算法中按原始顺序处理查询
for (const q of queries) {
  // 直接处理，没有利用离线特性
  answer(q)
}

// 正确：先排序再处理
const sorted = offlineSort(queries)
for (const q of sorted) {
  // 增量处理，利用上一次的状态
  updateState(q)
  answer(q)
}
```

### 2. 忘记保存查询原始顺序

```typescript
// 错误：排序后丢失了原始顺序
queries.sort((a, b) => a.l - b.l)
for (const q of queries) {
  results.push(solve(q))  // results 的顺序是排序后的
}

// 正确：保存原始索引
const indexed = queries.map((q, i) => ({ ...q, originalIdx: i }))
indexed.sort((a, b) => a.l - b.l)
const results = new Array(queries.length)
for (const q of indexed) {
  results[q.originalIdx] = solve(q)
}
```

### 3. 排序策略选择错误

```typescript
// 错误：对莫队使用简单排序，导致指针来回跳动
queries.sort((a, b) => a.l - b.l || a.r - b.r)

// 正确：使用分块排序
queries.sort((a, b) => {
  const blockA = Math.floor(a.l / blockSize)
  const blockB = Math.floor(b.l / blockSize)
  if (blockA !== blockB) return blockA - blockB
  return blockA % 2 === 0 ? a.r - b.r : b.r - a.r
})
```

### 4. 回滚操作不完整

```typescript
// 错误：回滚时遗漏某些状态
rollback(): void {
  this.parent = [...this.savedParent]  // 只恢复了 parent
  // 忘记恢复 rank、size 等其他状态
}

// 正确：记录所有变更，完整回滚
rollback(to: number): void {
  while (this.history.length > to) {
    const entry = this.history.pop()!
    // 恢复所有相关状态
    this.parent[entry.child] = entry.oldParent
    this.rank[entry.root] = entry.oldRank
  }
}
```

## 实际应用

### 1. 莫队算法

适用于区间查询问题，如统计区间内不同元素个数、区间逆序对等。

- 将 n 个元素分成 sqrt(n) 块
- 查询按块号排序，块内奇偶交替排序
- 维护左右指针，增量更新答案

### 2. CDQ 分治

用于多维偏序问题，如三维偏序计数、带修改的区间查询。

- 按第一维排序
- 分治处理左半对右半的贡献
- 合并时按第二维排序，用树状数组维护第三维

### 3. 整体二分

适用于多个查询同时求第 k 大/小值、判定性问题。

- 所有查询一起二分
- 每轮批量 check
- 利用数据结构（如树状数组）加速 check 过程

### 4. 并查集离线（逆序加边）

图的连通性查询中，如果边是逐步删除的，可以逆序处理：

- 将删除操作转化为逆序的添加操作
- 用并查集维护连通性
- 逆序处理查询，每步只需做一次 union

```typescript
function offlineConnectivity(n: number, queries: Query[]): boolean[] {
  const dsu = new DSU(n)
  const results: boolean[] = []

  // 逆序处理
  for (let i = queries.length - 1; i >= 0; i--) {
    const q = queries[i]
    if (q.type === 'add') {
      dsu.union(q.u, q.v)
    } else {
      results[i] = dsu.find(q.u) === dsu.find(q.v)
    }
  }

  return results.reverse()
}
```

## 总结

离线算法是一种强大而实用的算法设计范式：

**核心优势**：
- 通过重排查询顺序大幅降低时间复杂度
- 状态可以在查询间复用，避免重复计算
- 某些在线难以解决的问题在离线下有优雅解法

**适用场景**：
- 所有查询预先已知（如数据库批量查询）
- 不要求实时响应
- 问题本身具有可排序的结构

**常见技巧**：
- 查询排序（莫队、CDQ 分治）
- 回滚技术（并查集回退）
- 整体二分
- 逆序处理

**局限性**：
- 无法处理实时查询场景
- 需要额外存储所有查询
- 某些问题无法通过离线获得优化

掌握离线算法思想，能够帮助你在面对复杂查询问题时，跳出在线思维的限制，找到更高效的解决方案。
