# 单调队列 (Monotonic Queue)

## 概念解释

单调队列是一种特殊的双端队列（deque），它的核心性质是：**队列中的元素始终保持单调递增或单调递减的顺序**。

具体来说：
- **单调递减队列**：从队首到队尾，元素值单调递减（队首最大）
- **单调递增队列**：从队首到队尾，元素值单调递增（队首最小）

想象一条生产线上的传送带，物品按顺序到来。你有一个特殊的架子，架子上的物品从前往后排成从大到小的顺序。每当新物品到来时，你先把架子上比它小的物品全部拿走（因为它们永远不会成为最大值了），然后把新物品放在架子末尾。同时，如果架子最前面的物品已经"过期"（超出了当前窗口范围），就把它移除。这就是单调队列的工作方式。

### 核心操作

单调队列支持三种操作：

1. **push（入队）**：从队尾加入新元素，同时移除队尾所有不满足单调性的元素
2. **pop（出队）**：从队首移除过期元素（超出窗口范围的元素）
3. **front（取队首）**：获取当前最大值（或最小值）

```
单调递减队列示例（求最大值）：

初始:  []
加入5: [5]
加入3: [5, 3]         ← 3 < 5，直接加入队尾
加入4: [5, 4]         ← 4 > 3，移除3，加入4
加入2: [5, 4, 2]      ← 2 < 4，直接加入队尾
加入6: [6]            ← 6 > 2,4,5，全部移除，加入6

队首始终是当前最大值！
```

## 为什么重要

### 1. 滑动窗口最值的最优解

对于「长度为 k 的滑动窗口中的最大值」问题：
- 暴力解法：每个窗口遍历 k 个元素找最大值，时间复杂度 O(n × k)
- 堆解法：使用大顶堆，每次移除过期元素，时间复杂度 O(n × log n)
- **单调队列**：均摊 O(1) 取最值，总时间复杂度 **O(n)**

单调队列是解决滑动窗口最值问题的最优解法。

### 2. DP 优化利器

单调队列在动态规划优化中扮演重要角色：
- **LCIS（最长公共递增子序列）**：将 O(n³) 优化到 O(n²)
- **多重背包问题**：将 O(n × V × count) 优化到 O(n × V)
- **区间 DP 优化**：某些带限制的区间 DP 可以用单调队列优化

### 3. 图论中的应用

在某些图论问题中，单调队列可以优化最短路径算法：
- **带限制的最短路**：如最多经过 k 条边的最短路
- **网格图 BFS**：某些特殊的网格搜索问题

## 核心原理

### 算法流程

以求滑动窗口最大值（单调递减队列）为例：

1. **入队（push）**：当新元素 `x` 到来时，从队尾开始，移除所有 `< x` 的元素，然后将 `x` 加入队尾
2. **出队（pop）**：当窗口左边界移动时，检查队首元素是否已过期（不在当前窗口内），如果是则移除
3. **查询（front）**：队首元素就是当前窗口的最大值

### 关键洞察

为什么可以安全地移除比新元素小的旧元素？

因为窗口是向右滑动的，如果一个旧元素 `a` 比新元素 `x` 小，那么：
- `a` 在 `x` 的左边（更早进入窗口）
- `a` 一定比 `x` 先过期（更早离开窗口）
- 只要 `x` 在窗口中，`a` 就不可能成为最大值

所以 `a` 永远没有机会成为答案，可以安全移除。

### 时间复杂度分析

每个元素在整个过程中：
- 最多被加入队列 **1 次**（push 时）
- 最多被移出队列 **1 次**（被更大的元素挤出，或过期时移除）

因此 n 个元素的总操作次数为 O(n)，均摊每次操作 O(1)。

### 代码实现

```typescript
class MonotonicQueue {
  private deque: number[] = []  // 存储元素值
  private indices: number[] = []  // 存储元素在原数组中的索引

  // 入队：维护单调递减性质
  push(val: number, index: number): void {
    // 移除队尾所有小于新元素的元素
    while (this.deque.length > 0 && this.deque[this.deque.length - 1] < val) {
      this.deque.pop()
      this.indices.pop()
    }
    this.deque.push(val)
    this.indices.push(index)
  }

  // 出队：移除过期元素
  pop(leftBound: number): void {
    if (this.indices.length > 0 && this.indices[0] < leftBound) {
      this.deque.shift()
      this.indices.shift()
    }
  }

  // 获取当前最大值
  front(): number {
    return this.deque[0]
  }
}

// 滑动窗口最大值
function maxSlidingWindow(nums: number[], k: number): number[] {
  const mq = new MonotonicQueue()
  const result: number[] = []

  for (let i = 0; i < nums.length; i++) {
    mq.push(nums[i], i)
    // 当窗口形成后，开始记录结果并移除过期元素
    if (i >= k - 1) {
      result.push(mq.front())
      mq.pop(i - k + 1)  // 移除窗口左边界之前的元素
    }
  }

  return result
}
```

执行过程（数组 `[1, 3, -1, -3, 5, 3, 6, 7]`，k=3）：

```
i=0: push(1,0)   队列:[(1,0)]                 窗口未形成
i=1: push(3,1)   队列:[(3,1)]                 移除1，窗口未形成
i=2: push(-1,2)  队列:[(3,1),(-1,2)]          窗口形成，max=3
i=3: push(-3,3)  队列:[(3,1),(-1,2),(-3,3)]   pop过期(1>=0不移除), max=3
i=4: push(5,4)   队列:[(5,4)]                 移除-3,-1,3，max=5
i=5: push(3,5)   队列:[(5,4),(3,5)]           max=5
i=6: push(6,6)   队列:[(6,6)]                 移除3,5，max=6
i=7: push(7,7)   队列:[(7,7)]                 移除6，max=7

结果: [3, 3, 3, 5, 5, 6, 7]
```

## 可视化说明

在可视化面板中，单调队列的过程以动画形式直观展示：

- **数组条形图**：上方显示原始数组，用柱状高度表示数值大小
- **滑动窗口**：高亮显示当前窗口范围 `[left, left+k-1]`
- **双端队列**：下方展示队列内容，队首在左侧（最大值），队尾在右侧
- **操作标注**：每一步都标注了入队、出队、移除过期等操作

通过控制栏，你可以：
- 逐步执行：观察每一步的队列变化
- 自动播放：连续观看整个过程
- 调整速度：控制动画播放速度
- 切换模式：在最大值和最小值模式间切换
- 重置：回到初始状态

## 常见错误

### 1. 混淆入队方向

```typescript
// 错误：从队首入队
push(val: number) {
  this.deque.unshift(val)  // 错误！应该从队尾入队
}

// 正确：从队尾入队
push(val: number) {
  this.deque.push(val)  // 从队尾加入
}
```

新元素从队尾入队，过期元素从队首移除。这是因为窗口向右滑动，新元素从右边来，过期元素在左边。

### 2. 忘记移除过期元素

```typescript
// 错误：只做入队，不检查过期
for (let i = 0; i < nums.length; i++) {
  mq.push(nums[i], i)
  if (i >= k - 1) {
    result.push(mq.front())  // 队首可能是过期元素！
  }
}

// 正确：在查询前移除过期元素
for (let i = 0; i < nums.length; i++) {
  mq.push(nums[i], i)
  if (i >= k - 1) {
    mq.pop(i - k + 1)  // 先移除过期元素
    result.push(mq.front())  // 再查询
  }
}
```

### 3. 最大值和最小值的比较方向错误

```typescript
// 错误：求最大值时用 > 比较（应该是 <）
while (deque.length > 0 && deque[deque.length - 1] > val) {
  deque.pop()  // 这样得到的是单调递增队列（队首是最小值）！
}

// 正确：求最大值时用 < 比较
while (deque.length > 0 && deque[deque.length - 1] < val) {
  deque.pop()  // 移除比新元素小的，得到单调递减队列（队首是最大值）
}
```

- 求**最大值**：移除队尾**小于**新元素的元素 → 单调递减队列
- 求**最小值**：移除队尾**大于**新元素的元素 → 单调递增队列

### 4. 存储值而不存储索引

```typescript
// 错误：只存储值，无法判断过期
class MonotonicQueue {
  private deque: number[] = []
  pop(): void {
    this.deque.shift()  // 不知道该不该移除！
  }
}

// 正确：同时存储值和索引
class MonotonicQueue {
  private deque: number[] = []
  private indices: number[] = []
  pop(leftBound: number): void {
    if (this.indices[0] < leftBound) {
      this.deque.shift()
      this.indices.shift()
    }
  }
}
```

### 5. 窗口边界计算错误

```typescript
// 错误：窗口左边界计算
mq.pop(i - k)  // 差了 1

// 正确：窗口范围是 [i-k+1, i]，过期的是 i-k
mq.pop(i - k + 1)  // 移除索引 < i-k+1 的元素
```

## 实际应用

### 1. 滑动窗口最大值（LeetCode 239）

这是单调队列最经典的应用。

```typescript
function maxSlidingWindow(nums: number[], k: number): number[] {
  const deque: number[] = []  // 存储索引
  const result: number[] = []

  for (let i = 0; i < nums.length; i++) {
    // 移除队尾所有小于当前元素的索引
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop()
    }
    deque.push(i)

    // 移除过期的队首
    if (deque[0] < i - k + 1) {
      deque.shift()
    }

    // 窗口形成后记录结果
    if (i >= k - 1) {
      result.push(nums[deque[0]])
    }
  }

  return result
}
```

### 2. 滑动窗口最小值

只需将比较方向反转即可。

```typescript
function minSlidingWindow(nums: number[], k: number): number[] {
  const deque: number[] = []
  const result: number[] = []

  for (let i = 0; i < nums.length; i++) {
    // 移除队尾所有大于当前元素的索引（注意：> 变成了 >）
    while (deque.length > 0 && nums[deque[deque.length - 1]] > nums[i]) {
      deque.pop()
    }
    deque.push(i)

    if (deque[0] < i - k + 1) {
      deque.shift()
    }

    if (i >= k - 1) {
      result.push(nums[deque[0]])
    }
  }

  return result
}
```

### 3. LCIS 优化（最长公共递增子序列）

单调队列可以将 LCIS 的时间复杂度从 O(n³) 优化到 O(n²)：

```typescript
function lcis(a: number[], b: number[]): number {
  const n = a.length, m = b.length
  const dp = new Array(m + 1).fill(0)

  for (let i = 0; i < n; i++) {
    let best = 0
    for (let j = 0; j < m; j++) {
      if (a[i] === b[j]) {
        dp[j] = Math.max(dp[j], best + 1)
      }
      if (b[j] < a[i]) {
        best = Math.max(best, dp[j])
      }
    }
  }

  return Math.max(...dp)
}
```

### 4. 多重背包的单调队列优化

在多重背包问题中，对于每种物品，朴素解法需要枚举使用 0~count 个，时间复杂度较高。使用单调队列可以将每种物品的处理从 O(count × V) 优化到 O(V)。

### 5. 接雨水（LeetCode 42）的双指针解法

虽然接雨水通常用双指针或栈解决，但单调队列的思想（维护前缀最值）在其中也有所体现。

## 总结

单调队列是解决滑动窗口最值问题的核心数据结构：

**核心思想**：维护一个双端队列，队列中的元素始终保持单调性（递增或递减），队首始终是当前窗口的最大值或最小值。

**三大操作**：
- **push**：从队尾入队，移除队尾所有破坏单调性的元素
- **pop**：从队首移除过期元素（超出窗口范围）
- **front**：获取队首元素（当前最值）

**时间复杂度**：O(n) —— 每个元素最多被加入和移出各一次，均摊 O(1)。

**空间复杂度**：O(k) —— 队列中最多存储 k 个元素（窗口大小）。

**关键要点**：
- 新元素从队尾入队，过期元素从队首移除
- 求最大值用单调递减队列，求最小值用单调递增队列
- 比较方向：最大值移除队尾较小的，最小值移除队尾较大的
- 一定要存储索引以判断元素是否过期

掌握单调队列后，你会发现它在滑动窗口最值、DP 优化、图论等领域都有重要应用。它是从 O(n²) 到 O(n) 的关键优化工具之一。
