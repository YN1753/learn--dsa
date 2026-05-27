# 二分答案 (Binary Search on Answer)

## 概念解释

二分答案是一种将**最优化问题**转化为**判定问题**的算法技巧。它的核心思想是：不直接求解最优解，而是在答案空间上进行二分搜索，每次用一个 check 函数判断当前候选答案是否可行，逐步缩小答案范围，最终找到最优解。

想象你在猜一个 1 到 1000 之间的数字。你不会从 1 开始逐个尝试，而是先猜 500，如果大了就猜 250，小了就猜 750——这就是二分搜索。二分答案把同样的思想应用到了"求最优解"上：我们不直接构造最优解，而是在所有可能的答案中二分搜索，用一个判定函数来验证每个候选答案。

### 什么时候可以使用二分答案？

使用二分答案需要满足以下条件：

1. **答案具有单调性**：如果答案 x 可行，那么所有比 x 更"宽松"的答案也可行。例如在最小化问题中，如果 x 可行，则所有大于 x 的值也可行。
2. **存在高效的 check 函数**：能够快速判断某个候选答案是否满足约束条件。
3. **答案空间有明确的上下界**：可以确定答案的最小值和最大值。

### 与普通二分查找的区别

| 特征 | 普通二分查找 | 二分答案 |
|------|------------|---------|
| 搜索对象 | 有序数组中的元素 | 答案空间中的值 |
| 前提条件 | 数组有序 | 答案空间具有单调性 |
| 验证方式 | 直接比较数组元素 | 调用 check 函数判断可行性 |
| 应用场景 | 查找特定值 | 求解最优化问题 |

## 为什么重要

### 1. 高效解决最优化问题

许多最优化问题如果直接枚举答案，时间复杂度为 O(S)（S 为答案空间大小）。使用二分答案可以将复杂度降低到 O(log S)，这是一个巨大的提升。例如答案空间为 10^9 时，枚举需要 10^9 次，而二分只需要约 30 次。

### 2. 竞赛中的常见技巧

在算法竞赛中，二分答案是出现频率极高的解题模式。很多看起来复杂的问题，一旦识别出可以二分答案，就会变得非常简单。常见的题目类型包括：

- 最大化最小值（如 Aggressive Cows）
- 最小化最大值（如 Ship Packages）
- 求满足条件的最小/最大值

### 3. 解题思路的转变

二分答案教会我们一个重要的思维方式：**不要试图直接构造最优解，而是把"求最优解"转化为"判断一个解是否可行"**。这种思维方式在算法设计中非常有价值。

## 核心原理

### 通用框架

二分答案的通用框架如下：

```typescript
function solve(): number {
  // 1. 确定答案空间 [lo, hi]
  let lo = 最小可能答案
  let hi = 最大可能答案

  // 2. 在答案空间上二分搜索
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)

    if (check(mid)) {
      hi = mid       // mid 可行，尝试更优的答案
    } else {
      lo = mid + 1   // mid 不可行，需要调整
    }
  }

  // 3. lo 就是最优解
  return lo
}

function check(candidate: number): boolean {
  // 判断 candidate 是否可行
  // 返回 true 表示可行，false 表示不可行
}
```

注意：上述框架适用于**最小化**问题（找最小的可行解）。对于**最大化**问题，需要调整搜索方向。

### 示例 1：Aggressive Cows（最大化最小间距）

**问题描述**：有 n 个牛棚位于一条直线上，坐标分别为 positions[0..n-1]。要把 m 头牛放进牛棚中，要求**最大化任意两头牛之间的最小距离**。

**分析**：
- 答案空间：最小间距 d 的范围是 [0, max_pos - min_pos]
- 单调性：如果间距 d 可行（能放下所有牛），那么所有小于 d 的间距也可行
- check(d)：贪心地从第一个牛棚开始放牛，每头牛放在距上一头至少 d 的位置

```typescript
function aggressiveCows(positions: number[], m: number): number {
  positions.sort((a, b) => a - b)

  function check(d: number): boolean {
    let count = 1  // 第一头牛放在第一个位置
    let lastPos = positions[0]

    for (let i = 1; i < positions.length; i++) {
      if (positions[i] - lastPos >= d) {
        count++
        lastPos = positions[i]
        if (count >= m) return true
      }
    }

    return false
  }

  let lo = 1
  let hi = positions[positions.length - 1] - positions[0]

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo + 1) / 2)  // 注意：向上取整避免死循环
    if (check(mid)) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }

  return lo
}
```

### 示例 2：Ship Packages（最小化运载能力）

**问题描述**：有 n 个包裹，重量分别为 weights[0..n-1]。一艘船需要在 days 天内将所有包裹运走，每天只能运送一次。求船的最小运载能力。

**分析**：
- 答案空间：运载能力 capacity 的范围是 [max(weights), sum(weights)]
- 单调性：如果容量 capacity 可行，所有大于 capacity 的容量也可行
- check(capacity)：贪心地按顺序装包裹，超重就换下一天

```typescript
function shipWithinDays(weights: number[], days: number): number {
  function check(capacity: number): boolean {
    let dayCount = 1
    let currentLoad = 0

    for (const w of weights) {
      if (currentLoad + w > capacity) {
        dayCount++
        currentLoad = 0
        if (dayCount > days) return false
      }
      currentLoad += w
    }

    return true
  }

  let lo = Math.max(...weights)
  let hi = weights.reduce((a, b) => a + b, 0)

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (check(mid)) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }

  return lo
}
```

### 示例 3：最小化最大分配值

**问题描述**：将数组 nums 分成 m 个连续子数组，使得这些子数组的和的最大值最小。

```typescript
function splitArray(nums: number[], m: number): number {
  function check(maxSum: number): boolean {
    let count = 1
    let currentSum = 0

    for (const num of nums) {
      if (currentSum + num > maxSum) {
        count++
        currentSum = num
        if (count > m) return false
      } else {
        currentSum += num
      }
    }

    return true
  }

  let lo = Math.max(...nums)
  let hi = nums.reduce((a, b) => a + b, 0)

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (check(mid)) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }

  return lo
}
```

## 可视化说明

在可视化面板中，二分答案的过程以**数值线**的形式直观展示：

- **蓝色区间**表示当前搜索范围 [lo, hi]
- **红色标记**表示当前正在测试的中间值 mid
- **绿色区域**表示已确认可行的答案范围
- **灰色区域**表示已确认不可行的答案范围

每一步都会显示：
- 当前的 lo、hi、mid 值
- check(mid) 的执行结果（可行/不可行）
- 搜索范围如何缩小

通过控制栏，你可以：
- 选择不同的示例问题
- 逐步执行或自动播放
- 调整播放速度
- 重置到初始状态

## 常见错误

### 1. 搜索范围设置错误

```typescript
// 错误：答案范围不包含实际答案
let lo = 0
let hi = 100  // 可能太小，实际答案可能更大

// 正确：确保答案范围覆盖所有可能的解
let lo = 最小可能答案
let hi = 最大可能答案  // 通常可以用题目给定的数据范围
```

### 2. check 函数逻辑错误

```typescript
// 错误：check 函数没有正确判断可行性
function check(mid: number): boolean {
  // 逻辑有漏洞，可能漏掉某些约束
  return count >= m
}

// 正确：确保 check 函数考虑了所有约束条件
function check(mid: number): boolean {
  // 完整检查所有约束
  return count >= m && allConstraintsSatisfied
}
```

### 3. 整数二分中的死循环

```typescript
// 错误：最大化问题中向上取整导致死循环
while (lo < hi) {
  const mid = lo + Math.floor((hi - lo) / 2)  // 向下取整
  if (check(mid)) {
    lo = mid  // 当 hi = lo + 1 时，mid = lo，lo 不变 → 死循环！
  } else {
    hi = mid - 1
  }
}

// 正确：最大化问题中 mid 应向上取整
while (lo < hi) {
  const mid = lo + Math.floor((hi - lo + 1) / 2)
  if (check(mid)) {
    lo = mid
  } else {
    hi = mid - 1
  }
}
```

### 4. 混淆最小化和最大化的搜索方向

```typescript
// 最小化问题：找最小的可行解
// check(mid) 为 true → 答案可能更小 → hi = mid
// check(mid) 为 false → 答案需要更大 → lo = mid + 1

// 最大化问题：找最大的可行解
// check(mid) 为 true → 答案可能更大 → lo = mid
// check(mid) 为 false → 答案需要更小 → hi = mid - 1
```

### 5. 忘记排序或预处理

```typescript
// 错误：直接使用未排序的数据
function aggressiveCows(positions: number[], m: number): number {
  // positions 未排序！贪心策略不正确
}

// 正确：先排序
function aggressiveCows(positions: number[], m: number): number {
  positions.sort((a, b) => a - b)
  // 然后进行二分答案
}
```

## 实际应用

### 1. 最小化最大距离（资源分配）

将 n 个任务分配给 m 个工人，使得工作量最大的工人的工作量最小。这是典型的最小化最大值问题，可以用二分答案解决。

### 2. 容量规划

确定运输车辆的最小容量、服务器的最小带宽、管道的最小直径等。这些问题都可以转化为"找到满足条件的最小值"。

### 3. 调度问题

将作业分配到多台机器上，使得完成时间最短。或者将课程安排到最少的教室中。这类调度问题常常可以用二分答案配合贪心来解决。

### 4. 搜索问题的优化

在某些搜索问题中，如果目标函数具有单调性，可以用二分答案来加速。例如在矩阵中查找第 k 小的元素。

### 5. 浮点数二分

当答案是实数时，可以使用浮点数二分。需要注意精度控制：

```typescript
function solve(): number {
  let lo = 0.0
  let hi = 1e9

  while (hi - lo > 1e-7) {  // 精度阈值
    const mid = (lo + hi) / 2
    if (check(mid)) {
      hi = mid
    } else {
      lo = mid
    }
  }

  return lo
}
```

## 总结

二分答案是解决最优化问题的强大工具：

**核心思想**：将"求最优解"转化为"判断解是否可行"，然后在答案空间上二分搜索。

**时间复杂度**：O(log S * T(n))，其中 S 为答案空间大小，T(n) 为 check 函数的复杂度。

**关键要点**：

- 前提条件：答案空间必须具有单调性
- check 函数：是二分答案的核心，必须正确判断可行性
- 边界处理：明确答案的上下界，注意最小化和最大化的搜索方向
- 避免死循环：最大化问题中 mid 向上取整
- 与贪心结合：check 函数通常使用贪心策略来验证可行性

掌握二分答案不仅能解决大量竞赛题目，更能培养"将优化问题转化为判定问题"的思维方式，这是算法设计中的一项重要能力。
