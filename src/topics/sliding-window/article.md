# 滑动窗口 (Sliding Window)

## 概念解释

滑动窗口是一种在数组或字符串上高效求解子数组（子串）问题的技巧。它的核心思想是维护一个**动态的窗口**，通过两个指针（左边界 `left` 和右边界 `right`）来控制窗口的范围，避免重复计算，从而将暴力解法的时间复杂度从 O(n²) 或 O(n³) 降低到 O(n)。

想象你在看一条很长的胶卷：你不需要每次都从头看到尾，而是用一个固定大小的取景框在胶卷上滑动，每次只关注框内的画面。这就是"滑动窗口"名称的由来。

### 两种窗口类型

| 类型 | 特点 | 典型应用 |
|------|------|----------|
| 固定大小窗口 | 窗口长度 k 始终不变 | 最大子数组和（固定长度）、移动平均值 |
| 可变大小窗口 | 窗口大小根据条件动态伸缩 | 最长无重复子串、最小覆盖子串 |

### 核心术语

- **左边界 (left)**：窗口的起始位置
- **右边界 (right)**：窗口的结束位置
- **窗口内容**：`[left, right]` 范围内的所有元素
- **窗口大小**：`right - left + 1`

## 为什么重要

### 1. 将 O(n²) 优化到 O(n)

暴力解法通常需要嵌套循环来遍历所有子数组，时间复杂度为 O(n²)。滑动窗口通过"增量更新"的策略，每个元素最多被访问两次（一次被右指针加入，一次被左指针移除），总时间复杂度为 O(n)。

### 2. 面试高频模式

滑动窗口是技术面试中出现频率最高的算法模式之一。它能解决大量看似需要嵌套循环的问题：

- 求最大/最小子数组和
- 求最长/最短满足条件的子串
- 字符串匹配与包含问题
- 频率统计类问题

### 3. 实际工程中无处不在

从网络协议中的流量控制到实时数据流处理，从限流算法到文本编辑器中的搜索功能，滑动窗口的思想在实际工程中有广泛应用。

## 核心原理

### 固定大小窗口

固定大小窗口的实现非常直观：窗口大小为 k，每次将右指针右移一位，同时左指针也右移一位，保持窗口大小不变。

```typescript
function maxSumSubarray(arr: number[], k: number): number {
  let windowSum = 0
  // 先计算第一个窗口的和
  for (let i = 0; i < k; i++) {
    windowSum += arr[i]
  }
  let maxSum = windowSum

  // 滑动窗口：加入右边元素，减去左边元素
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]
    maxSum = Math.max(maxSum, windowSum)
  }

  return maxSum
}
```

执行过程（数组 `[2, 1, 5, 1, 3, 2]`，k=3）：

```
初始窗口: [2, 1, 5]        sum = 8,  max = 8
滑动一步: [1, 5, 1]        sum = 7,  max = 8
滑动一步: [5, 1, 3]        sum = 9,  max = 9
滑动一步: [1, 3, 2]        sum = 6,  max = 9

结果: 9（子数组 [5, 1, 3]）
```

### 可变大小窗口

可变大小窗口的核心模式是：**扩展右边界探索，收缩左边界约束**。

```typescript
function longestUniqueSubstring(s: string): number {
  const charSet = new Set<string>()
  let left = 0
  let maxLength = 0

  for (let right = 0; right < s.length; right++) {
    // 当出现重复字符时，收缩左边界
    while (charSet.has(s[right])) {
      charSet.delete(s[left])
      left++
    }
    // 加入当前字符
    charSet.add(s[right])
    // 更新结果
    maxLength = Math.max(maxLength, right - left + 1)
  }

  return maxLength
}
```

执行过程（字符串 `"abcabcbb"`）：

```
right=0: 窗口 [a]         长度=1, max=1
right=1: 窗口 [ab]        长度=2, max=2
right=2: 窗口 [abc]       长度=3, max=3
right=3: 'a'重复, 收缩→窗口 [bca]  长度=3, max=3
right=4: 'b'重复, 收缩→窗口 [cab]  长度=3, max=3
right=5: 'c'重复, 收缩→窗口 [abc]  长度=3, max=3
right=6: 'b'重复, 收缩→窗口 [cb]   长度=2, max=3
right=7: 'b'重复, 收缩→窗口 [b]    长度=1, max=3

结果: 3（子串 "abc"）
```

### 通用模板

可变大小滑动窗口有一个通用模板，适用于大多数场景：

```typescript
function slidingWindow(s: string): number {
  let left = 0
  let result = 0
  const window = /* 用于维护窗口状态的数据结构（哈希表、数组等）*/

  for (let right = 0; right < s.length; right++) {
    // 1. 将 s[right] 加入窗口
    // ... 更新 window 状态

    // 2. 判断是否需要收缩
    while (/* 窗口需要收缩的条件 */) {
      // 3. 将 s[left] 移出窗口
      // ... 更新 window 状态
      left++
    }

    // 4. 更新结果
    result = Math.max(result, right - left + 1)
  }

  return result
}
```

## 可视化说明

在可视化面板中，滑动窗口的过程以方块数组的形式直观展示：

- **蓝色**方块表示当前窗口范围 `[left, right]`
- **绿色**方块表示正在处理的元素（右指针位置）
- **橙色**方块表示即将被移除的元素（左指针位置）
- **灰色**方块表示窗口外的元素

每一步都会显示：
- 当前窗口的 left 和 right 指针位置
- 窗口内的内容
- 当前的最优结果（最大和/最长长度等）

通过控制栏，你可以：
- 选择固定窗口或可变窗口模式
- 逐步执行或自动播放
- 调整播放速度
- 重置到初始状态

## 常见错误

### 1. 收缩前忘记更新结果

```typescript
// 错误：在收缩之后才更新结果
while (charSet.has(s[right])) {
  charSet.delete(s[left])
  left++
}
charSet.add(s[right])
maxLength = Math.max(maxLength, right - left + 1)  // 可能遗漏了之前的窗口

// 正确：在加入元素后、收缩前更新结果（根据问题类型调整）
```

对于最长子串问题，应该在收缩完成并加入新元素后更新。但对于最大和等问题，可能需要在不同位置更新。关键是理解每一步窗口状态的含义。

### 2. 窗口大小计算错误

```typescript
// 错误：窗口大小计算
const size = right - left        // 少算了 1

// 正确：闭区间 [left, right] 的大小
const size = right - left + 1
```

### 3. 固定窗口滑动时忘记移除左边元素

```typescript
// 错误：只加不减
for (let i = k; i < arr.length; i++) {
  windowSum += arr[i]           // 只加了右边，没减左边
}

// 正确：加入右边，减去左边
for (let i = k; i < arr.length; i++) {
  windowSum += arr[i] - arr[i - k]
}
```

### 4. 可变窗口收缩条件错误

```typescript
// 错误：使用 if 而不是 while 收缩
if (charSet.has(s[right])) {
  charSet.delete(s[left])
  left++
}
// 可能需要连续收缩多次才能消除重复

// 正确：使用 while 循环连续收缩
while (charSet.has(s[right])) {
  charSet.delete(s[left])
  left++
}
```

### 5. 左指针移动时忘记更新窗口状态

```typescript
// 错误：移动了左指针，但没有从数据结构中移除对应元素
while (needShrink) {
  left++                        // 指针移了，但窗口状态没更新
}

// 正确：移除左指针对应的元素
while (needShrink) {
  removeFromWindow(s[left])
  left++
}
```

## 实际应用

### 1. 最大子数组和（固定窗口）

求大小为 k 的连续子数组的最大和，是固定窗口最经典的应用。

```typescript
function maxSumSubarray(arr: number[], k: number): number {
  let sum = 0
  for (let i = 0; i < k; i++) sum += arr[i]
  let max = sum
  for (let i = k; i < arr.length; i++) {
    sum += arr[i] - arr[i - k]
    max = Math.max(max, sum)
  }
  return max
}
```

### 2. 最长无重复字符子串（可变窗口）

给定一个字符串，找出其中不含重复字符的最长子串的长度。这是可变窗口最经典的题目。

```typescript
function lengthOfLongestSubstring(s: string): number {
  const seen = new Set<string>()
  let left = 0, maxLen = 0
  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      seen.delete(s[left])
      left++
    }
    seen.add(s[right])
    maxLen = Math.max(maxLen, right - left + 1)
  }
  return maxLen
}
```

### 3. 最小覆盖子串（可变窗口 + 哈希表）

给定字符串 s 和 t，找出 s 中包含 t 所有字符的最短子串。这是滑动窗口的进阶应用，需要同时维护窗口内字符的频率。

```typescript
function minWindow(s: string, t: string): string {
  const need = new Map<string, number>()
  for (const c of t) need.set(c, (need.get(c) || 0) + 1)

  let left = 0, valid = 0
  let start = 0, minLen = Infinity
  const window = new Map<string, number>()

  for (let right = 0; right < s.length; right++) {
    const c = s[right]
    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1)
      if (window.get(c) === need.get(c)) valid++
    }

    while (valid === need.size) {
      if (right - left + 1 < minLen) {
        start = left
        minLen = right - left + 1
      }
      const d = s[left]
      if (need.has(d)) {
        if (window.get(d) === need.get(d)) valid--
        window.set(d, window.get(d)! - 1)
      }
      left++
    }
  }

  return minLen === Infinity ? '' : s.substring(start, start + minLen)
}
```

### 4. 限流算法（固定窗口计数器）

在网络限流中，固定窗口计数器是一种简单的限流算法：在每个固定时间窗口内限制请求次数。

```typescript
class RateLimiter {
  private windowStart: number = Date.now()
  private count: number = 0

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  allowRequest(): boolean {
    const now = Date.now()
    if (now - this.windowStart >= this.windowMs) {
      this.windowStart = now
      this.count = 0
    }
    this.count++
    return this.count <= this.maxRequests
  }
}

// 每秒最多 10 个请求
const limiter = new RateLimiter(10, 1000)
```

### 5. 移动平均值（固定窗口）

计算数据流中最近 k 个元素的平均值，是固定窗口在实时数据处理中的典型应用。

```typescript
function movingAverage(nums: number[], k: number): number[] {
  const result: number[] = []
  let sum = 0
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i]
    if (i >= k) sum -= nums[i - k]
    if (i >= k - 1) result.push(sum / k)
  }
  return result
}
```

## 总结

滑动窗口是解决子数组/子串问题的核心技巧：

**核心思想**：用两个指针维护一个动态窗口，通过增量更新（加入右边元素、移除左边元素）避免重复计算。

**两种模式**：
- 固定大小窗口：窗口大小不变，适合求固定长度子数组的统计值
- 可变大小窗口：窗口根据条件伸缩，适合求满足条件的最优子数组

**时间复杂度**：O(n) —— 每个元素最多被访问两次。

**空间复杂度**：O(1) 或 O(k) —— 取决于是否需要额外的数据结构（如哈希表）来维护窗口状态。

**关键要点**：
- 理解窗口的扩展和收缩时机
- 明确在哪个阶段更新结果
- 使用正确的数据结构维护窗口状态（哈希表、计数器等）
- 注意边界条件：空数组、窗口大小大于数组长度等

掌握滑动窗口后，你会发现大量的数组和字符串问题都可以用这个模式高效解决。它是从暴力解法到优化解法之间最实用的桥梁之一。
