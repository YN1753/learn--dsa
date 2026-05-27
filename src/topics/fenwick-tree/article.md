# 树状数组 (Fenwick Tree / Binary Indexed Tree)

## 概念解释

树状数组（Binary Indexed Tree，简称 BIT），也称为 Fenwick Tree，是一种用于高效处理**前缀和查询**与**单点更新**的数据结构。它由 Peter Fenwick 于 1994 年提出，以极其紧凑的代码实现了与线段树相同的 O(log n) 时间复杂度。

**核心思想：** 利用二进制的 lowbit 运算，将数组元素组织成一棵隐式的树结构。每个节点 `tree[i]` 负责管理原数组中一段连续区间的和，区间长度恰好等于 `lowbit(i)`。

```
lowbit(x) = x & (-x)

lowbit(6) = 110 & 010 = 010 = 2
lowbit(8) = 1000 & 1000 = 1000 = 8
lowbit(7) = 111 & 001 = 001 = 1
```

### 树状数组的逻辑结构

树状数组虽然用一维数组存储，但逻辑上是一棵树。节点 i 的父节点是 `i + lowbit(i)`：

```
索引的二进制表示    负责区间      含义
tree[1]  = 0001    [1, 1]      长度 1
tree[2]  = 0010    [1, 2]      长度 2
tree[3]  = 0011    [3, 3]      长度 1
tree[4]  = 0100    [1, 4]      长度 4
tree[5]  = 0101    [5, 5]      长度 1
tree[6]  = 0110    [5, 6]      长度 2
tree[7]  = 0111    [7, 7]      长度 1
tree[8]  = 1000    [1, 8]      长度 8
```

## 为什么重要

### 1. 代码极其简洁

树状数组的核心操作只需不到 10 行代码，远比线段树简单。在算法竞赛和面试中，树状数组是快速实现前缀和操作的首选。

### 2. 常数因子小

由于只使用一维数组和简单的位运算，树状数组的实际运行速度通常快于线段树，空间占用也更少。

### 3. 广泛的应用场景

凡是涉及"动态前缀和"的问题，都可以用树状数组解决：
- 逆序对计数
- 动态排名查询
- 二维区间求和
- 差分数组的维护

### 4. 与线段树互补

树状数组和线段树各有优劣。树状数组适合简单的前缀和场景，线段树适合复杂的区间操作。掌握两者，可以灵活应对不同问题。

## 核心原理

### lowbit 运算

lowbit 是树状数组的灵魂。它的定义非常简单：

```
lowbit(x) = x & (-x)
```

其中 `-x` 是 x 的补码（取反加 1）。这个运算巧妙地提取了 x 二进制表示中**最低位的 1** 及其后面的 0。

```
x = 12 = 1100 (二进制)
-x 的补码 = 0100
x & (-x) = 0100 = 4

lowbit(12) = 4
```

### 单点更新 (Update)

在位置 i 加上一个值 val 时，需要更新所有包含位置 i 的区间节点：

```
update(i, val):
    while i <= n:
        tree[i] += val
        i += lowbit(i)    // 跳到父节点
```

更新路径：i → i + lowbit(i) → ... → 超出范围

```
例：update(3, val)
3 (011) → 3 + 1 = 4 (100) → 4 + 4 = 8 (1000) → 停止

更新 tree[3], tree[4], tree[8]
```

### 前缀和查询 (Query)

查询 [1, i] 的前缀和时，需要累加从 i 开始向前跳转经过的所有区间：

```
query(i):
    sum = 0
    while i > 0:
        sum += tree[i]
        i -= lowbit(i)    // 跳到前一个区间
    return sum
```

查询路径：i → i - lowbit(i) → ... → 0

```
例：query(7)
7 (111) → 7 - 1 = 6 (110) → 6 - 2 = 4 (100) → 4 - 4 = 0

sum = tree[7] + tree[6] + tree[4]
```

### 区间和查询

利用前缀和的差分思想：

```
rangeQuery(l, r) = query(r) - query(l - 1)
```

### 构建树状数组

**朴素方法 O(n log n)：** 逐个调用 update

```
for i = 1 to n:
    update(i, arr[i])
```

**优化方法 O(n)：** 利用父节点关系直接构建

```
// 先将原数组复制到 tree
for i = 1 to n:
    tree[i] = arr[i - 1]
// 对每个节点，将其值加到直接父节点
for i = 1 to n:
    parent = i + lowbit(i)
    if parent <= n:
        tree[parent] += tree[i]
```

## 可视化说明

在右侧的可视化面板中，你可以直观地观察树状数组的操作过程：

- **树形结构**：将树状数组的逻辑树可视化展示，每个节点标注索引和值
- **lowbit 高亮**：展示每个节点的 lowbit 值及其负责的区间长度
- **更新动画**：逐步展示 update 操作的跳转路径（向上跳转到父节点）
- **查询动画**：逐步展示 query 操作的跳转路径（向前跳转到前一个区间）

通过动画控制栏，你可以：
- 播放 / 暂停动画
- 调整动画速度
- 重置到初始状态
- 输入自定义数组

## 常见错误

### 1. Off-by-One：忘记使用 1-indexed

树状数组**必须使用 1-indexed**（从索引 1 开始），因为 lowbit(0) = 0 会导致死循环。

```typescript
// ❌ 错误：使用 0-indexed
update(0, val)  // lowbit(0) = 0，死循环！

// ✅ 正确：使用 1-indexed
update(1, val)  // lowbit(1) = 1，正常工作
```

### 2. lowbit 计算错误

```typescript
// ❌ 错误：使用位移而不是位与
function lowbit(x: number): number {
  return x >> 1  // 这是右移，不是 lowbit！
}

// ❌ 错误：使用异或
function lowbit(x: number): number {
  return x ^ (-x)  // 这不是 lowbit！
}

// ✅ 正确
function lowbit(x: number): number {
  return x & (-x)
}
```

### 3. 混淆 update 和 query 的方向

```typescript
// ❌ 错误：update 向前跳转
update(i, val) {
  while (i > 0) {     // 错！应该是 <= n
    tree[i] += val
    i -= lowbit(i)     // 错！应该是 += lowbit(i)
  }
}

// ❌ 错误：query 向后跳转
query(i) {
  while (i <= n) {     // 错！应该是 > 0
    sum += tree[i]
    i += lowbit(i)     // 错！应该是 -= lowbit(i)
  }
}
```

记忆口诀：**update 向上走（+=），query 向前走（-=）**

### 4. 区间查询的边界处理

```typescript
// ❌ 错误：忘记 l-1
rangeQuery(l, r) {
  return query(r) - query(l)  // 错！应该是 query(l-1)
}

// ✅ 正确
rangeQuery(l, r) {
  return query(r) - query(l - 1)
}
```

## 实际应用

### 1. 逆序对计数

逆序对是数组中满足 `i < j 且 arr[i] > arr[j]` 的数对。利用树状数组可以在 O(n log n) 时间内统计逆序对数量：

```typescript
function countInversions(arr: number[]): number {
  const n = arr.length
  const ft = new FenwickTree(n)
  let count = 0

  // 离散化后从右往左
  for (let i = n - 1; i >= 0; i--) {
    count += ft.query(rank[arr[i]] - 1)  // 查询比当前元素小的已处理元素数
    ft.update(rank[arr[i]], 1)
  }
  return count
}
```

### 2. 动态排名查询

支持动态插入元素并查询第 k 小的元素。将树状数组的每个位置视为一个计数器：

```typescript
// 插入值 val
ft.update(val, 1)

// 查询第 k 小的元素（二分 + 前缀和）
function kthSmallest(k: number): number {
  let lo = 1, hi = n
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (ft.query(mid) >= k) hi = mid
    else lo = mid + 1
  }
  return lo
}
```

### 3. 二维区间求和

树状数组可以扩展到二维，支持矩阵的子矩阵求和和单点更新：

```typescript
class BIT2D {
  tree: number[][]
  update(x: number, y: number, val: number): void {
    for (let i = x; i <= n; i += i & (-i))
      for (let j = y; j <= m; j += j & (-j))
        this.tree[i][j] += val
  }
  query(x: number, y: number): number {
    let sum = 0
    for (let i = x; i > 0; i -= i & (-i))
      for (let j = y; j > 0; j -= j & (-j))
        sum += this.tree[i][j]
    return sum
  }
}
```

### 4. 差分数组 + 树状数组

结合差分数组的思想，树状数组可以支持**区间修改 + 单点查询**：

```typescript
// 区间 [l, r] 加上 val
ft.update(l, val)
ft.update(r + 1, -val)

// 查询位置 i 的值
ft.query(i)
```

### 5. 算法竞赛中的常见应用

- **离线处理区间问题**：将区间按右端点排序，用树状数组维护
- **扫描线算法**：配合树状数组处理几何问题
- **动态凸包**：利用树状数组维护前缀信息

## 总结

树状数组是一种以极简代码实现 O(log n) 前缀和操作的数据结构，其核心要点包括：

- **lowbit 运算**：`x & (-x)` 取最低位 1，是所有操作的基础
- **update 方向**：i += lowbit(i)，向父节点（上层）跳转
- **query 方向**：i -= lowbit(i)，向前一个区间跳转
- **1-indexed**：必须从索引 1 开始，避免 lowbit(0) = 0 的死循环
- **空间效率**：只需一个长度为 n+1 的数组

树状数组的主要局限是功能较单一（主要处理前缀和），不直接支持复杂区间操作。对于需要区间修改、区间查询等复杂操作的场景，应选择线段树。

掌握树状数组是理解动态前缀和、逆序对计数、离线算法等高级技巧的基础，也是算法竞赛和面试中的高频考点。
