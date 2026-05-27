# 前缀和 (Prefix Sum)

## 概念解释

前缀和是一种简单而强大的预处理技巧，用于高效地计算数组的区间和。它的核心思想是：**提前计算好数组的累加和，将每次区间求和从 O(n) 降低到 O(1)**。

### 什么是一维前缀和？

给定一个数组 `arr`，前缀和数组 `sum` 的定义如下：

- `sum[0] = 0`（哨兵值，便于处理边界情况）
- `sum[i] = arr[0] + arr[1] + ... + arr[i-1]`（前 i 个元素的和）

也就是说，`sum[i]` 存储的是原数组中**前 i 个元素**的累加和。

### 区间求和公式

有了前缀和数组，任意区间 `[l, r]`（闭区间，1-indexed）的和可以通过一次减法得到：

```
区间和 = sum[r] - sum[l-1]
```

直觉理解：`sum[r]` 是前 r 个元素的总和，减去前 l-1 个元素的总和 `sum[l-1]`，剩下的就是第 l 到第 r 个元素的和。

## 为什么重要

### 1. 将 O(n) 查询优化到 O(1)

暴力求解区间和需要遍历区间内的每个元素，时间复杂度为 O(n)。如果有 m 次查询，总时间为 O(m*n)。

使用前缀和：O(n) 预处理 + O(1) 每次查询，总时间为 O(n + m)。当查询次数 m 很大时，效率提升显著。

### 2. 二维前缀和的基础

前缀和可以扩展到二维，用于高效计算矩阵中任意子矩阵的和。这在图像处理（积分图）、动态规划等领域有重要应用。

### 3. 竞赛和面试中的高频技巧

前缀和是算法竞赛和技术面试中出现频率极高的基础技巧。许多看似复杂的问题，本质上都是前缀和的应用或变体。

## 核心原理

### 一维前缀和的构建

构建前缀和数组的过程非常直观：从左到右逐个累加。

```typescript
function buildPrefixSum(arr: number[]): number[] {
  const n = arr.length
  const sum = new Array(n + 1).fill(0)  // sum[0] = 0 作为哨兵

  for (let i = 1; i <= n; i++) {
    sum[i] = sum[i - 1] + arr[i - 1]
  }

  return sum
}
```

执行过程（数组 `[3, 1, 4, 1, 5]`）：

```
原数组:     [3, 1, 4, 1, 5]
前缀和:  [0, 3, 4, 8, 9, 14]
索引:     0  1  2  3  4  5

sum[0] = 0
sum[1] = 0 + 3 = 3
sum[2] = 3 + 1 = 4
sum[3] = 4 + 4 = 8
sum[4] = 8 + 1 = 9
sum[5] = 9 + 5 = 14
```

### 区间查询

```typescript
// 查询区间 [l, r] 的和（1-indexed，闭区间）
function rangeQuery(sum: number[], l: number, r: number): number {
  return sum[r] - sum[l - 1]
}
```

查询示例（以上述前缀和数组为例）：

```
查询 [2, 4]：sum[4] - sum[1] = 9 - 3 = 6   → 验证: 1 + 4 + 1 = 6 ✓
查询 [1, 5]：sum[5] - sum[0] = 14 - 0 = 14  → 验证: 3 + 1 + 4 + 1 + 5 = 14 ✓
查询 [3, 3]：sum[3] - sum[2] = 8 - 4 = 4    → 验证: 4 = 4 ✓
```

### 二维前缀和

对于 m×n 的矩阵，二维前缀和 `sum[i][j]` 表示左上角 (1,1) 到右下角 (i,j) 这个子矩阵的所有元素之和。

**构建公式**（容斥原理）：

```
sum[i][j] = matrix[i][j] + sum[i-1][j] + sum[i][j-1] - sum[i-1][j-1]
```

**查询公式**：查询从 (r1, c1) 到 (r2, c2) 的子矩阵和：

```
子矩阵和 = sum[r2][c2] - sum[r1-1][c2] - sum[r2][c1-1] + sum[r1-1][c1-1]
```

```typescript
function build2DPrefixSum(matrix: number[][]): number[][] {
  const m = matrix.length
  const n = matrix[0].length
  const sum = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      sum[i][j] = matrix[i - 1][j - 1]
        + sum[i - 1][j]
        + sum[i][j - 1]
        - sum[i - 1][j - 1]
    }
  }

  return sum
}

// 查询子矩阵 (r1,c1) 到 (r2,c2) 的和（1-indexed）
function query2D(
  sum: number[][],
  r1: number, c1: number,
  r2: number, c2: number
): number {
  return sum[r2][c2]
    - sum[r1 - 1][c2]
    - sum[r2][c1 - 1]
    + sum[r1 - 1][c1 - 1]
}
```

二维前缀和构建示例（3×4 矩阵）：

```
原矩阵:              前缀和矩阵:
1  2  3  4           0  0  0  0  0
5  6  7  8           0  1  3  6  10
9 10 11 12           0  6 14 24  36
                     0 15 34 56  80
```

## 可视化说明

在右侧的可视化面板中，前缀和的构建和查询过程以直观的方式展示：

- **原始数组**和**前缀和数组**并排显示，清晰对比
- 每个前缀和元素用颜色标注其累加来源
- 区间查询时，高亮显示参与计算的前缀和元素，直观展示 `sum[r] - sum[l-1]` 的含义
- 支持逐步构建前缀和，观察每一步的累加过程
- 输入任意区间 [l, r]，实时显示区间和的计算过程和结果

## 常见错误

### 1. Off-by-one：区间公式错误

```typescript
// ❌ 错误：忘记前缀和的定义
const rangeSum = sum[r] - sum[l]      // 少算了第 l 个元素

// ✅ 正确：区间 [l, r] 的和
const rangeSum = sum[r] - sum[l - 1]
```

这是前缀和最常见的错误。记住：`sum[i]` 包含了第 i 个元素，所以要减去 `sum[l-1]` 而不是 `sum[l]`。

### 2. 混淆 0-indexed 和 1-indexed

```typescript
// ❌ 错误：在 0-indexed 的前缀和上使用 1-indexed 的公式
// 如果 sum[0] = arr[0]（没有哨兵），则：
const rangeSum = sum[r] - sum[l - 1]  // 错误！

// ✅ 方案一：使用哨兵 sum[0] = 0，前缀和数组长度为 n+1
// ✅ 方案二：在 0-indexed 下正确推导公式
// sum[i] = arr[0] + ... + arr[i]
// 区间 [l, r] 的和 = sum[r] - (l > 0 ? sum[l-1] : 0)
```

建议始终使用 `sum[0] = 0` 的哨兵方式，可以统一处理所有情况，避免边界判断。

### 3. 忘记处理空区间或边界情况

```typescript
// ❌ 错误：没有考虑 l = 0 或 l > r 的情况
function rangeQuery(sum: number[], l: number, r: number): number {
  return sum[r] - sum[l - 1]  // 当 l = 0 时，sum[-1] 为 undefined
}

// ✅ 正确：使用哨兵值 + 边界检查
function rangeQuery(sum: number[], l: number, r: number): number {
  if (l > r || l < 1 || r >= sum.length) return 0
  return sum[r] - sum[l - 1]
}
```

### 4. 二维前缀和的容斥原理计算错误

```typescript
// ❌ 错误：构建时忘记减去重复部分
sum[i][j] = matrix[i][j] + sum[i-1][j] + sum[i][j-1]
// sum[i-1][j-1] 被加了两次！

// ✅ 正确：使用容斥原理
sum[i][j] = matrix[i][j] + sum[i-1][j] + sum[i][j-1] - sum[i-1][j-1]
```

### 5. 在需要动态更新的场景中错误使用前缀和

前缀和适用于**静态数组**的多次查询。如果数组元素会频繁修改，每次修改后都需要重新构建前缀和，时间复杂度退化为 O(n)。此时应该使用线段树或树状数组。

## 实际应用

### 1. 子数组和等于 k

这是前缀和最经典的应用之一：找出数组中和为 k 的连续子数组的个数。

```typescript
function subarraySum(nums: number[], k: number): number {
  const prefixCount = new Map<number, number>()
  prefixCount.set(0, 1)  // 前缀和为 0 出现 1 次

  let currSum = 0
  let count = 0

  for (const num of nums) {
    currSum += num
    // 如果 currSum - k 之前出现过，说明存在子数组和为 k
    if (prefixCount.has(currSum - k)) {
      count += prefixCount.get(currSum - k)!
    }
    prefixCount.set(currSum, (prefixCount.get(currSum) || 0) + 1)
  }

  return count
}
```

### 2. 数据库中的范围查询优化

数据库中的 OLAP 分析经常需要对时间序列数据进行范围聚合（如"本月销售额"、"最近 7 天的日活"）。前缀和的思想在物化视图和预聚合中广泛使用。

### 3. 图像处理：积分图

积分图（Integral Image）就是二维前缀和在图像处理中的应用。它被广泛用于：

- 快速计算任意矩形区域的像素和
- Haar 特征计算（人脸检测）
- 均值模糊（Box Blur）

```typescript
// 计算图像中任意矩形区域的平均灰度值
function regionAverage(
  integral: number[][],
  r1: number, c1: number,
  r2: number, c2: number
): number {
  const sum = integral[r2][c2]
    - (r1 > 0 ? integral[r1 - 1][c2] : 0)
    - (c1 > 0 ? integral[r2][c1 - 1] : 0)
    + (r1 > 0 && c1 > 0 ? integral[r1 - 1][c1 - 1] : 0)
  const area = (r2 - r1 + 1) * (c2 - c1 + 1)
  return sum / area
}
```

### 4. 竞赛中的常见变体

前缀和在算法竞赛中有许多变体和扩展：

- **前缀异或和**：`xor[i] = arr[0] ^ arr[1] ^ ... ^ arr[i-1]`，区间异或 = `xor[r] ^ xor[l-1]`
- **前缀积**：配合乘法逆元使用
- **差分数组**：前缀和的逆运算，用于区间加减操作
- **二维差分**：矩阵的区间加减操作

```typescript
// 前缀异或和示例
function buildPrefixXor(arr: number[]): number[] {
  const xor = new Array(arr.length + 1).fill(0)
  for (let i = 1; i <= arr.length; i++) {
    xor[i] = xor[i - 1] ^ arr[i - 1]
  }
  return xor
}

// 区间异或查询
function rangeXor(xor: number[], l: number, r: number): number {
  return xor[r] ^ xor[l - 1]
}
```

### 5. 统计类问题

前缀和常用于统计满足特定条件的子数组数量：

- 和能被 k 整除的子数组个数
- 和在某个范围内的子数组个数
- 奇数个数为偶数的子数组个数

这些问题的共同模式是：维护前缀和的哈希表，利用数学关系快速计数。

## 总结

前缀和是最基础、最实用的预处理技巧之一：

**核心思想**：用 O(n) 的预处理时间，将每次区间求和从 O(n) 优化到 O(1)。

**关键公式**：
- 一维：`sum[i] = sum[i-1] + arr[i-1]`，区间和 = `sum[r] - sum[l-1]`
- 二维：利用容斥原理构建和查询

**适用场景**：
- 静态数组的大量区间求和查询
- 子数组和相关问题（等于 k、能被 k 整除等）
- 图像处理中的区域统计（积分图）

**注意事项**：
- 始终使用 `sum[0] = 0` 的哨兵方式，避免 off-by-one 错误
- 区分 0-indexed 和 1-indexed 的使用场景
- 数组元素频繁修改时，应考虑线段树或树状数组

掌握前缀和后，你会发现它是一把万能钥匙，能打开大量看似复杂的区间问题的大门。
