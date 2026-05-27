# 树状数组区间操作 (Fenwick Tree Range Operations)

## 概念解释

树状数组（Fenwick Tree / Binary Indexed Tree）本身只能高效地完成「单点修改 + 前缀查询」。但通过**差分**的思想，我们可以将它扩展为支持**区间修改**和**区间查询**的强大工具。

核心思路：

- **区间加 + 单点查询**：用一个树状数组维护差分数组
- **区间加 + 区间查询**：用两个树状数组分别维护不同的信息

## 为什么重要

在实际编程竞赛和工程中，「区间修改 + 区间查询」是非常常见的需求：

1. **频繁的区间操作**：对数组的某一段同时加减一个值，再查询某段的和——如果每次都暴力修改，时间复杂度为 O(n * m)，在大数据量下不可接受
2. **比线段树更轻量**：树状数组代码短、常数小、空间省，适合只需要区间加减和求和的场景
3. **面试高频**：理解差分与树状数组的结合，是展示算法功底的好机会

## 核心原理

### 前置知识：差分数组

给定原数组 a[1..n]，定义差分数组：

```
d[1] = a[1]
d[i] = a[i] - a[i-1]   (i >= 2)
```

差分数组的两个关键性质：

**性质 1**：对原数组 a 的区间 [l, r] 加 v，等价于对差分数组做两次单点操作：

```
d[l] += v
d[r+1] -= v
```

**性质 2**：原数组 a[i] 等于差分数组的前缀和：

```
a[i] = d[1] + d[2] + ... + d[i]
```

这两个性质正好完美匹配树状数组的能力——树状数组擅长的就是单点修改和前缀查询。

### 方法一：区间加 + 单点查询（一个 BIT）

直接用树状数组维护差分数组 d：

```typescript
class FenwickTree {
  private tree: number[]
  private n: number

  constructor(size: number) {
    this.n = size
    this.tree = new Array(size + 2).fill(0)
  }

  // 单点加
  update(i: number, delta: number): void {
    for (; i <= this.n; i += i & (-i)) {
      this.tree[i] += delta
    }
  }

  // 前缀和查询
  query(i: number): number {
    let sum = 0
    for (; i > 0; i -= i & (-i)) {
      sum += this.tree[i]
    }
    return sum
  }
}
```

使用方式：

```typescript
const bit = new FenwickTree(n)

// 区间 [l, r] 加 v
function rangeAdd(l: number, r: number, v: number): void {
  bit.update(l, v)
  bit.update(r + 1, -v)
}

// 单点查询 a[i]
function pointQuery(i: number): number {
  return bit.query(i)  // 返回差分前缀和，即 a[i]
}
```

**时间复杂度**：区间加 O(log n)，单点查询 O(log n)

### 方法二：区间加 + 区间查询（两个 BIT）

单个 BIT 只能查询前缀和 sum(d[1..x])。但区间查询需要的是 sum(a[l..r])，也就是原数组的区间和。

让我们推导一下。设差分数组为 d，那么：

```
sum(a[1..x]) = a[1] + a[2] + ... + a[x]
             = d[1] + (d[1]+d[2]) + (d[1]+d[2]+d[3]) + ... + (d[1]+...+d[x])
             = sum_{i=1}^{x} (x - i + 1) * d[i]
             = (x+1) * sum_{i=1}^{x} d[i] - sum_{i=1}^{x} i * d[i]
```

这个公式告诉我们：如果能同时维护 sum(d[i]) 和 sum(i * d[i])，就能在 O(log n) 内完成区间查询。

**做法**：用两个树状数组：

- **B1** 维护 d[i]（差分数组本身）
- **B2** 维护 i * d[i]（差分数组加权）

区间 [l, r] 加 v 时：

```typescript
function rangeUpdate(l: number, r: number, v: number): void {
  // 更新 B1：维护 d[i]
  B1.update(l, v)
  B1.update(r + 1, -v)

  // 更新 B2：维护 i * d[i]
  B2.update(l, l * v)
  B2.update(r + 1, -(r + 1) * v)
}
```

前缀和查询 sum(a[1..x])：

```typescript
function prefixSum(x: number): number {
  return (x + 1) * B1.query(x) - B2.query(x)
}
```

区间和查询 sum(a[l..r])：

```typescript
function rangeSum(l: number, r: number): number {
  return prefixSum(r) - prefixSum(l - 1)
}
```

**时间复杂度**：区间加 O(log n)，区间查询 O(log n)

### 完整代码

```typescript
class FenwickTree {
  private tree: number[]
  private n: number

  constructor(size: number) {
    this.n = size
    this.tree = new Array(size + 2).fill(0)
  }

  update(i: number, delta: number): void {
    for (; i <= this.n; i += i & (-i)) {
      this.tree[i] += delta
    }
  }

  query(i: number): number {
    let sum = 0
    for (; i > 0; i -= i & (-i)) {
      sum += this.tree[i]
    }
    return sum
  }
}

class RangeFenwick {
  private B1: FenwickTree
  private B2: FenwickTree
  private n: number

  constructor(size: number) {
    this.n = size
    this.B1 = new FenwickTree(size)
    this.B2 = new FenwickTree(size)
  }

  // 区间 [l, r] 加 v
  rangeAdd(l: number, r: number, v: number): void {
    this.B1.update(l, v)
    this.B1.update(r + 1, -v)
    this.B2.update(l, l * v)
    this.B2.update(r + 1, -(r + 1) * v)
  }

  // 前缀和 sum(a[1..x])
  private prefixSum(x: number): number {
    return (x + 1) * this.B1.query(x) - this.B2.query(x)
  }

  // 区间和 sum(a[l..r])
  rangeSum(l: number, r: number): number {
    return this.prefixSum(r) - this.prefixSum(l - 1)
  }
}
```

## 可视化说明

可视化界面展示了树状数组区间操作的两种模式：

- **单 BIT 模式**：展示差分数组的更新过程，以及如何通过前缀和还原原数组的值
- **双 BIT 模式**：展示两个树状数组 B1、B2 如何协同工作，完成区间加和区间查询

通过动画可以直观看到：

1. 区间加操作如何转化为差分数组上的两个单点更新
2. 查询时如何通过两个 BIT 的组合公式得到正确的区间和
3. 多次区间操作叠加后的最终效果

## 常见错误

### 1. 忘记更新 r+1 位置

```typescript
// 错误：只更新了 l，忘记更新 r+1
function wrongRangeAdd(l: number, r: number, v: number): void {
  bit.update(l, v)
  // 缺少 bit.update(r + 1, -v)
}

// 正确：必须同时更新 r+1
function correctRangeAdd(l: number, r: number, v: number): void {
  bit.update(l, v)
  bit.update(r + 1, -v)
}
```

### 2. 混淆单点查询和前缀和查询

```typescript
// 在方法一中：
// bit.query(i) 返回的是差分数组的前缀和，即 a[i] 的值
// 要求 a[l..r] 的区间和，需要分别查询每个点再求和，或者用方法二

// 错误：直接用 bit.query(r) - bit.query(l-1) 求区间和
// 这求的是 d[l..r] 的和，不是 a[l..r] 的和！
```

### 3. B2 更新时忘记乘以索引

```typescript
// 错误：B2 的更新没有乘以索引
B2.update(l, v)        // 应该是 l * v
B2.update(r + 1, -v)   // 应该是 -(r+1) * v

// 正确：
B2.update(l, l * v)
B2.update(r + 1, -(r + 1) * v)
```

### 4. 数组下标越界

当 r = n 时，r + 1 = n + 1，需要确保树状数组大小至少为 n + 1。建议初始化时给足够的空间。

## 实际应用

### 1. 数据库范围更新

在某些场景下需要对某个范围内的记录批量加减值，树状数组区间操作可以在不遍历每条记录的情况下完成。

### 2. 游戏开发中的区域效果

例如在一个棋盘游戏中，某个技能对一片区域内的所有单位造成伤害，可以用区间加操作高效更新。

### 3. 竞赛中的区间问题

在算法竞赛中，大量题目涉及「区间修改 + 区间查询」，树状数组是最常用的解法之一，尤其当题目只需要区间加和区间求和时。

### 4. 时间序列数据

对时间序列的某个时间段批量调整数值，再查询某个时间点或时间段的累计值。

## 总结

树状数组区间操作是树状数组的重要扩展：

**核心思想**：差分——将区间操作转化为单点操作

| 操作类型 | 所需 BIT 数量 | 区间加复杂度 | 查询复杂度 |
|----------|--------------|-------------|-----------|
| 区间加 + 单点查询 | 1 | O(log n) | O(log n) |
| 区间加 + 区间查询 | 2 | O(log n) | O(log n) |

**相比线段树的优势**：

- 代码更简洁（约 20 行 vs 约 60 行）
- 常数更小，实际运行更快
- 空间更省（O(n) vs O(4n)）

**局限性**：

- 不支持区间最值查询
- 不支持区间乘除等非线性操作
- 仅适用于可差分的操作（加减）

理解差分思想和双 BIT 技巧，是掌握树状数组的关键一步。
