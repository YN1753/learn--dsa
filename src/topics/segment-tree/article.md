# 线段树 (Segment Tree)

## 概念解释

线段树（Segment Tree）是一种用于处理**区间相关问题**的二叉树数据结构。它将一个长度为 n 的数组组织成一棵二叉树，其中：

- **根节点**代表整个区间 [0, n-1]
- **每个内部节点**代表一个区间 [l, r]，其中点为 mid = (l+r)/2
  - 左子节点代表区间 [l, mid]
  - 右子节点代表区间 [mid+1, r]
- **叶子节点**代表单个元素（长度为 1 的区间）

每个节点存储对应区间的**聚合信息**，例如区间和、区间最大值、区间最小值等。这些信息在建树时自底向上计算，使得任意区间的聚合信息可以通过组合 O(log n) 个节点的信息得到。

例如，对于数组 `[3, 1, 4, 1, 5, 9, 2, 6]`，如果每个节点存储区间和，那么：

- 根节点存储 [0,7] 的和 = 31
- 根的左子节点存储 [0,3] 的和 = 9
- 根的右子节点存储 [4,7] 的和 = 22
- 以此类推，直到叶子节点存储单个元素的值

## 为什么重要

在算法竞赛和实际工程中，我们经常需要对数组进行**区间查询**（如求区间和、区间最值）和**动态修改**（如更新某个元素的值）。线段树的重要性在于：

**1. 同时支持高效查询和修改**

| 操作 | 暴力 | 前缀和 | 线段树 |
|------|------|--------|--------|
| 建表/建树 | O(1) | O(n) | O(n) |
| 区间查询 | O(n) | O(1) | O(log n) |
| 单点修改 | O(1) | O(n) | O(log n) |
| 区间修改 | O(n) | O(n) | O(log n) |

前缀和虽然查询 O(1)，但一旦数组发生修改就需要 O(n) 重新构建。线段树在查询和修改之间取得了完美的 O(log n) 平衡。

**2. 通用性强**

线段树可以处理各种区间聚合操作：求和、最值、最大公约数、矩阵乘法等。只要满足**结合律**的运算都可以用线段树维护。

**3. 可扩展性好**

通过懒标记（Lazy Propagation）技术，线段树还能高效支持区间修改（如区间加、区间赋值），这在很多场景下是不可替代的。

## 核心原理

### 建树 (Build)

建树是一个递归过程，时间复杂度 O(n)。

```typescript
// tree[] 是线段树数组，arr[] 是原数组
// node 是当前节点在 tree[] 中的下标
// [start, end] 是当前节点代表的区间
function build(node: number, start: number, end: number): void {
  if (start === end) {
    // 叶子节点：直接存储原数组的值
    tree[node] = arr[start]
    return
  }
  const mid = Math.floor((start + end) / 2)
  build(2 * node, start, mid)       // 递归建左子树
  build(2 * node + 1, mid + 1, end) // 递归建右子树
  // 合并左右子树的信息
  tree[node] = tree[2 * node] + tree[2 * node + 1]
}
```

### 区间查询 (Query)

查询区间 [l, r] 的聚合信息，时间复杂度 O(log n)。

核心思想：将目标区间分解为线段树中 O(log n) 个节点的并集，然后合并这些节点的信息。

```typescript
// 查询 [l, r] 的区间和
function query(node: number, start: number, end: number, l: number, r: number): number {
  if (r < start || end < l) return 0      // 无交集
  if (l <= start && end <= r) return tree[node]  // 完全包含
  // 部分重叠：递归查询左右子树
  const mid = Math.floor((start + end) / 2)
  return query(2 * node, start, mid, l, r)
       + query(2 * node + 1, mid + 1, end, l, r)
}
```

### 单点修改 (Point Update)

将某个位置的值更新，时间复杂度 O(log n)。

```typescript
// 将 arr[idx] 更新为 val
function update(node: number, start: number, end: number, idx: number, val: number): void {
  if (start === end) {
    tree[node] = val  // 找到叶子节点，直接更新
    return
  }
  const mid = Math.floor((start + end) / 2)
  if (idx <= mid) update(2 * node, start, mid, idx, val)
  else update(2 * node + 1, mid + 1, end, idx, val)
  tree[node] = tree[2 * node] + tree[2 * node + 1]  // 更新祖先节点
}
```

### 区间修改与懒标记 (Lazy Propagation)

区间修改的核心问题是：如果直接修改区间内每个叶子节点，时间复杂度会退化为 O(n)。懒标记解决了这个问题。

**懒标记的工作原理：**

1. 当修改的区间完全覆盖当前节点的区间时，不继续向下递归，而是在当前节点记录一个「懒标记」
2. 懒标记表示「这个节点的子节点还需要进行此操作，但暂时推迟」
3. 当后续操作需要访问子节点时，先将懒标记**下推**（pushdown）到子节点

```typescript
const lazy: number[] = new Array(4 * MAXN).fill(0)

// 下推懒标记
function pushDown(node: number, start: number, end: number): void {
  if (lazy[node] !== 0) {
    const mid = Math.floor((start + end) / 2)
    // 将标记传递给左子节点
    tree[2 * node] += lazy[node] * (mid - start + 1)
    lazy[2 * node] += lazy[node]
    // 将标记传递给右子节点
    tree[2 * node + 1] += lazy[node] * (end - mid)
    lazy[2 * node + 1] += lazy[node]
    // 清除当前节点的标记
    lazy[node] = 0
  }
}

// 区间 [l, r] 每个元素加 val
function rangeUpdate(node: number, start: number, end: number, l: number, r: number, val: number): void {
  if (r < start || end < l) return
  if (l <= start && end <= r) {
    tree[node] += val * (end - start + 1)
    lazy[node] += val
    return
  }
  pushDown(node, start, end)  // 访问子节点前，先下推标记
  const mid = Math.floor((start + end) / 2)
  rangeUpdate(2 * node, start, mid, l, r, val)
  rangeUpdate(2 * node + 1, mid + 1, end, l, r, val)
  tree[node] = tree[2 * node] + tree[2 * node + 1]
}
```

### 数组表示法

线段树可以用数组高效表示，无需动态建节点：

- 根节点下标为 1（有些实现用 0，但 1 更方便计算）
- 节点 i 的左子节点下标为 `2*i`，右子节点下标为 `2*i+1`
- 节点 i 的父节点下标为 `i/2`（向下取整）
- 数组大小需要开 **4n**（n 为原数组长度），这是因为在最坏情况下，当 n 不是 2 的幂次时，线段树需要的空间可能接近 4n

## 可视化说明

上面的交互式演示展示了线段树的完整工作过程：

1. **建树**：从叶子节点开始，自底向上合并区间信息。每一步可以看到左右子节点的值如何合并为父节点的值。
2. **区间查询**：目标区间被高亮显示，可以看到它被分解为线段树中哪些节点的并集，以及如何合并这些节点的值得到最终结果。
3. **单点修改**：修改某个叶子节点的值后，所有祖先节点的值会沿路径更新。
4. **区间修改**：展示懒标记的下推过程，可以看到标记如何被推迟传递，以及何时被实际应用。

## 常见错误

**1. 区间边界的 off-by-one 错误**

线段树的区间表示需要保持一致。建议统一使用闭区间 [l, r]，并在递归时仔细处理中点分割：
- 左子树：[start, mid]
- 右子树：[mid+1, end]

**2. 忘记懒标记下推**

在区间修改后，如果后续操作需要访问子节点，必须先执行 pushdown。忘记下推会导致查询结果错误，这是线段树最常犯的 bug。

**3. 合并操作不正确**

合并操作必须满足结合律。常见的错误包括：
- 求最值时误用加法合并
- 求区间和时忘记乘以区间长度（区间修改场景）

**4. 数组大小不足**

线段树数组大小应为 4n 而非 2n。虽然满二叉树只需 2n-1 个节点，但 n 不是 2 的幂次时，数组实现会浪费一些空间，4n 是安全的上界。

**5. 查询时未处理无交集情况**

当查询区间与当前节点区间完全不重叠时，需要返回不影响结果的「单位元」：区间和返回 0，区间最大值返回 -Infinity，区间最小值返回 Infinity。

## 实际应用

**1. 算法竞赛**

线段树是竞赛中最常用的数据结构之一，典型题目包括：
- 区间求和 / 区间最值查询
- 区间加 / 区间赋值修改
- 求逆序对（归并树）
- 扫线法中的面积 / 周长并

**2. 数据库系统**

数据库的索引结构（如 B+ 树）在概念上与线段树有相似之处。范围查询（如 `SELECT * FROM table WHERE age BETWEEN 20 AND 30`）的本质就是区间查询。

**3. 游戏开发**

- 地图中某个区域的单位数量统计
- 碰撞检测中的空间划分
- 伤害计算中的区间加成

**4. 时间序列分析**

对时间序列数据进行滑动窗口统计（如最近 N 秒的平均值、最大值），线段树可以高效支持动态数据的区间聚合。

**5. 计算几何**

线段树是扫描线算法的核心组件，用于高效计算矩形面积并、矩形周长并等问题。

## 总结

线段树是一种功能强大的区间数据结构，核心优势在于：

- **O(log n)** 的区间查询和修改，两者兼顾
- **懒标记**技术支持高效的区间修改
- **通用性好**，满足结合律的运算都能维护
- **数组实现**简单高效，空间 4n

学习线段树的建议路径：先理解基本的区间查询和单点修改，再学习懒标记的区间修改，最后掌握各种变体（如持久化线段树、可合并线段树、动态开点线段树等）。

与其他区间数据结构相比：树状数组（Fenwick Tree）代码更短、常数更小，但功能较弱（主要支持前缀操作）；线段树更通用，能处理更多类型的区间问题。
