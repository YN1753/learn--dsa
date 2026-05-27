# 整体二分 (Parallel Binary Search)

## 概念解释

整体二分是一种**离线算法**，核心思想是：当我们需要对**多个查询**分别进行二分答案时，不必逐个独立二分，而是将所有查询**合并在一起**，在同一个二分过程中同时处理。

想象一下：你有 10 个学生，每个学生都要在一组考试中找到自己的「及格线排名」。如果每个学生单独去二分查找，需要 10 次独立的二分过程。但如果把 10 个学生放在一起，每次判定阶段统一处理所有学生，就可以**共享中间结果**，大幅减少重复计算。

### 与普通二分的区别

| 对比项 | 普通二分 | 整体二分 |
|--------|----------|----------|
| 查询数量 | 单个查询 | 多个查询 |
| 二分过程 | 独立进行 | 所有查询同步进行 |
| 数据结构操作 | 每次二分重建 | 共享操作，分摊成本 |
| 适用场景 | 在线查询 | 离线批量查询 |

## 为什么重要

整体二分的重要性体现在**效率提升**上：

1. **减少数据结构操作次数**：如果每个查询独立二分，m 个查询在值域 [1, V] 上二分，每个查询需要 O(log V) 次判定，每次判定需要 O(n) 次数据结构操作，总操作次数为 O(m * n * log V)。使用整体二分后，总操作次数降为 O((n + m) * log V)。

2. **共享判定过程**：在判定阶段，所有查询共享同一个数据结构状态，避免了重复的插入和删除操作。

3. **通用性强**：只要问题满足「可二分」和「可离线」两个条件，就可以使用整体二分。常见的可搭配数据结构包括树状数组、线段树等。

4. **与 CDQ 分治互补**：整体二分和 CDQ 分治都是处理离线问题的强大工具，它们可以独立使用，也可以结合使用来解决更复杂的问题。

### 复杂度分析

假设值域为 [1, V]，操作数为 n，查询数为 m：

- **普通逐个二分**：O(m * n * log V)
- **整体二分**：O((n + m) * log V * log n)（如果使用树状数组）

当 m 较大时，差距非常显著。

## 核心原理

### 基本框架

整体二分的递归框架如下：

```typescript
interface Query {
  id: number       // 查询编号
  l: number        // 二分左边界
  r: number        // 二分右边界
  // 其他查询相关参数
}

interface Operation {
  pos: number      // 操作位置
  val: number      // 操作值
  // 其他操作相关参数
}

function solve(
  queries: Query[],
  operations: Operation[],
  L: number,       // 值域左边界
  R: number        // 值域右边界
): void {
  if (L === R) {
    // 所有剩余查询的答案都是 L
    for (const q of queries) {
      answer[q.id] = L
    }
    return
  }

  const mid = Math.floor((L + R) / 2)

  // 第一步：将值 <= mid 的操作加入数据结构
  for (const op of operations) {
    if (op.val <= mid) {
      addToDataStructure(op)
    }
  }

  // 第二步：判定每个查询是否满足条件
  const leftQueries: Query[] = []   // 答案在 [L, mid] 中的查询
  const rightQueries: Query[] = []  // 答案在 [mid+1, R] 中的查询

  for (const q of queries) {
    const result = queryDataStructure(q)
    if (result >= target(q)) {
      leftQueries.push(q)
    } else {
      rightQueries.push(q)
    }
  }

  // 第三步：撤销值 <= mid 的操作（回滚数据结构）
  for (const op of operations) {
    if (op.val <= mid) {
      removeFromDataStructure(op)
    }
  }

  // 第四步：将操作分为两组
  const leftOps: Operation[] = []
  const rightOps: Operation[] = []
  for (const op of operations) {
    if (op.val <= mid) {
      leftOps.push(op)
    } else {
      rightOps.push(op)
    }
  }

  // 第五步：递归处理
  solve(leftQueries, leftOps, L, mid)
  solve(rightQueries, rightOps, mid + 1, R)
}
```

### 核心思想分解

1. **值域分治**：将值域 [L, R] 分成 [L, mid] 和 [mid+1, R] 两半
2. **操作分配**：将所有操作按其值分配到左半组或右半组
3. **批量判定**：一次性判定所有查询，将其分配到左半组或右半组
4. **递归处理**：左右两组分别递归

### 与 CDQ 分治的关系

整体二分和 CDQ 分治都是基于分治思想的离线算法，它们的区别在于：

- **整体二分**：按**值域**分治，将操作和查询分为两组
- **CDQ 分治**：按**时间**分治，将操作分为前半段和后半段

两者可以结合使用：在整体二分的判定过程中，使用 CDQ 分治来计算贡献。

## 可视化说明

在可视化界面中，整体二分的过程可以这样理解：

```
值域 [1, 8], 查询 Q1, Q2, Q3

第一轮: mid = 4
  操作: 加入值 <= 4 的操作
  判定: Q1->左, Q2->右, Q3->左
  撤销: 移除值 <= 4 的操作

  左组 [1,4]: Q1, Q3    右组 [5,8]: Q2

第二轮 (左): mid = 2
  操作: 加入值 <= 2 的操作
  判定: Q1->左, Q3->右
  撤销

  [1,2]: Q1              [3,4]: Q3

第三轮 (右): mid = 6
  操作: 加入值 <= 6 的操作
  判定: Q2->左

  [5,6]: Q2              [7,8]: 空

最终答案: Q1=1, Q2=5, Q3=3
```

通过可视化可以观察到：
- 每轮所有查询同时参与判定
- 操作根据值被分配到不同的递归分支
- 数据结构的操作是「增量式」的，不是每次重建

## 常见错误

### 1. 操作分配到错误的组

```typescript
// 错误：将操作按查询条件分组
for (const op of operations) {
  if (op.pos <= mid) {  // 应该按 op.val 分组，不是 op.pos
    leftOps.push(op)
  }
}

// 正确：按操作的值分组
for (const op of operations) {
  if (op.val <= mid) {
    leftOps.push(op)
  }
}
```

### 2. 忘记撤销/回滚数据结构

```typescript
// 错误：加入操作后没有撤销
for (const op of operations) {
  if (op.val <= mid) {
    addToDataStructure(op)  // 加入了
  }
}
// 判定查询...
// 忘记撤销！下一轮递归会重复计算

// 正确：判定完成后撤销
for (const op of operations) {
  if (op.val <= mid) {
    addToDataStructure(op)
  }
}
// 判定查询...
for (const op of operations) {
  if (op.val <= mid) {
    removeFromDataStructure(op)  // 撤销
  }
}
```

### 3. 判定函数写错

```typescript
// 错误：判定条件不对
if (queryResult >= threshold) {
  leftQueries.push(q)  // 条件写反了
}

// 正确：根据具体问题确定判定条件
// 如果「值越小越好」且需要满足 >= threshold
if (queryResult >= threshold) {
  leftQueries.push(q)   // 答案可能更小，在左半区间
} else {
  rightQueries.push(q)  // 答案需要更大，在右半区间
}
```

### 4. 递归终止条件不对

```typescript
// 错误：L > R 时没有处理
function solve(queries, operations, L, R) {
  if (queries.length === 0) return  // 只检查了查询为空
  // ...
}

// 正确：检查值域收缩和查询为空
function solve(queries, operations, L, R) {
  if (queries.length === 0) return
  if (L === R) {
    for (const q of queries) {
      answer[q.id] = L
    }
    return
  }
  // ...
}
```

## 实际应用

### 1. 多个第 k 小问题

给定一个数组和多个查询 (l, r, k)，求每个区间的第 k 小值。使用整体二分，按值域分治，用树状数组维护区间内有多少个数 <= mid。

### 2. 多个最小瓶颈路

给定一张带权图和多个查询 (u, v)，求 u 到 v 的路径上最大边权的最小值。整体二分按边权分治，并查集维护连通性。

### 3. 动态连通性查询

给定一些加边操作和查询操作，判断两个点在某个时刻是否连通。整体二分按时间分治，并查集维护连通性（需要支持撤销操作）。

### 4. 落谷 P2617 Dynamic Rankings

带修改的区间第 k 小问题。这是整体二分的经典应用：将修改操作和查询操作一起分治，用树状数组维护前缀和。

### 5. 落谷 P3834 可持久化线段树模板（也可以用整体二分）

静态区间第 k 小问题，整体二分 + 树状数组是一种替代可持久化线段树的解法。

## 总结

整体二分是一种强大的离线算法技巧，核心思想非常简洁：

**本质**：将多个独立的二分过程合并，共享数据结构操作，降低总操作次数。

**适用条件**：
- 问题可以二分（答案具有单调性）
- 查询可以离线处理
- 存在合适的数据结构支持「增量式」的加入/撤销操作

**关键要点**：
- 按值域分治，不是按位置或时间分治
- 操作和查询都要分组递归
- 判定阶段使用增量式数据结构，不要每次重建
- 必须正确撤销操作，保证数据结构状态正确

**与其他算法的关系**：
- 与 CDQ 分治：都是离线分治算法，可以互补
- 与莫队算法：都是处理离线查询的工具，适用场景不同
- 与可持久化数据结构：可以解决相同的问题，整体二分通常更易于实现

掌握整体二分后，你会发现许多看似复杂的离线查询问题，都可以用这个框架优雅地解决。
