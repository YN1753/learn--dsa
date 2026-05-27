# 单调栈 (Monotonic Stack)

## 概念解释

单调栈是一种特殊的栈结构，它在普通栈「后进先出」的基础上，额外维护了一个**单调性**：栈内的元素从栈底到栈顶始终保持**单调递增**或**单调递减**的顺序。

具体来说，每次向栈中压入一个新元素时，需要检查它是否违反了栈的单调性。如果违反了，就不断弹出栈顶元素，直到满足单调性为止，然后再将新元素压入栈中。

```
单调递减栈示例（从栈底到栈顶递减）：

压入过程：
  初始栈: []
  压入 5: [5]
  压入 3: [5, 3]        ← 3 < 5，满足递减
  压入 4: [5, 4]        ← 4 > 3，弹出 3，再压入 4
  压入 2: [5, 4, 2]     ← 2 < 4，满足递减
  压入 6: [6]           ← 6 > 2, 6 > 4, 6 > 5，全部弹出
```

单调栈的关键在于：**不是简单地把元素压入栈，而是在压入前维护栈的单调性**。这种「破坏-重建」的过程恰恰是单调栈能够高效解决问题的核心。

### 两种单调栈

| 类型 | 性质 | 典型用途 |
|------|------|---------|
| 单调递减栈 | 栈底 → 栈顶：大 → 小 | 寻找下一个更大元素 |
| 单调递增栈 | 栈底 → 栈顶：小 → 大 | 寻找下一个更小元素 |

注意：这里的「递增」和「递减」是指栈底到栈顶的方向，不同教材可能有不同定义，请以实际代码逻辑为准。

## 为什么重要

很多问题乍看需要 O(n²) 的暴力解法，但使用单调栈可以优化到 O(n)。

### 从暴力到高效

以「下一个更大元素」问题为例：给定数组 `[2, 1, 2, 4, 3]`，对每个元素找到它右边第一个比它大的元素。

**暴力解法**：对每个元素，向右扫描寻找第一个更大的元素。两层循环，时间复杂度 O(n²)。

**单调栈解法**：使用单调递减栈，一次遍历即可得到所有结果，时间复杂度 O(n)。

```
数组: [2, 1, 2, 4, 3]

暴力法: 每个元素都要向右扫描 → 最多 n × n 次比较 → O(n²)
单调栈: 每个元素最多入栈一次、出栈一次 → 共 2n 次操作 → O(n)
```

### 经典应用场景

- **下一个更大/更小元素**：LeetCode 496, 503
- **股票跨度问题 (Stock Span)**：LeetCode 901
- **柱状图中最大矩形**：LeetCode 84
- **每日温度**：LeetCode 739
- **接雨水**：LeetCode 42

这些问题如果使用暴力解法通常是 O(n²)，但单调栈都能将它们优化到 O(n)。

## 核心原理

### 单调递减栈：寻找下一个更大元素

单调递减栈的直觉：栈中保存的是「还在等待更大元素出现」的元素，它们从栈底到栈顶递减排列。

算法流程：
1. 从左到右遍历数组
2. 对于当前元素 `arr[i]`，当它比栈顶元素大时，说明栈顶元素找到了它的「下一个更大元素」，弹出并记录
3. 将 `arr[i]` 压入栈
4. 遍历结束后，栈中剩余元素没有下一个更大元素

```typescript
function nextGreaterElement(arr: number[]): number[] {
  const n = arr.length
  const result = new Array(n).fill(-1)  // -1 表示不存在
  const stack: number[] = []  // 存储索引，而非值

  for (let i = 0; i < n; i++) {
    // 当前元素比栈顶大 → 栈顶元素找到了下一个更大元素
    while (stack.length > 0 && arr[i] > arr[stack[stack.length - 1]]) {
      const topIndex = stack.pop()!
      result[topIndex] = arr[i]
    }
    stack.push(i)
  }
  // 栈中剩余元素的 result 保持 -1（没有更大元素）
  return result
}
```

### 单调递增栈：寻找下一个更小元素

逻辑类似，只是比较方向相反：

```typescript
function nextSmallerElement(arr: number[]): number[] {
  const n = arr.length
  const result = new Array(n).fill(-1)
  const stack: number[] = []

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && arr[i] < arr[stack[stack.length - 1]]) {
      const topIndex = stack.pop()!
      result[topIndex] = arr[i]
    }
    stack.push(i)
  }
  return result
}
```

### 为什么是 O(n)？

关键观察：**每个元素最多被压入栈一次，弹出栈一次**。

- 外层循环遍历 n 个元素：O(n)
- 内层 while 循环的总执行次数：所有元素被弹出的总次数，最多 n 次
- 因此总操作数最多 2n，时间复杂度 O(n)

这个分析方式叫做**摊还分析**（Amortized Analysis）：虽然某一次 while 循环可能弹出多个元素，但从整体来看，弹出操作的总次数被入栈次数所限制。

### 存储索引而非值

在实际实现中，单调栈通常存储**索引**而非值，原因是：
1. 可以通过索引计算元素之间的距离（如股票跨度问题）
2. 可以通过索引访问原数组的值
3. 可以处理重复元素的情况

## 可视化说明

在右侧的可视化面板中，你可以直观地观察单调栈的工作过程：

- **数组以柱状图形式展示**：每根柱子代表一个数组元素，高度表示数值大小
- **栈的内容实时显示**：栈中存储的元素以从底到顶的方式排列
- **逐步执行动画**：每一步展示压入或弹出操作，以及相应的比较过程
- **结果高亮**：当一个元素找到它的「答案」时，会高亮显示对应关系

通过播放控制栏，你可以：
- 播放 / 暂停动画
- 单步前进 / 后退
- 调整动画速度
- 重置到初始状态

## 常见错误

### 1. 混淆递增栈和递减栈

这是最常见的错误。选择哪种单调栈取决于你要解决什么问题：

```typescript
// ❌ 错误：用递增栈找下一个更大元素
// 这会得到错误的结果！
while (stack.length > 0 && arr[i] < arr[stack[stack.length - 1]]) {
  // 这里是在找更小元素，不是更大元素
}

// ✅ 正确：用递减栈找下一个更大元素
while (stack.length > 0 && arr[i] > arr[stack[stack.length - 1]]) {
  const topIndex = stack.pop()!
  result[topIndex] = arr[i]
}
```

记住口诀：
- 找**更大**元素 → **递减**栈（遇到大的就弹出小的）
- 找**更小**元素 → **递增**栈（遇到小的就弹出大的）

### 2. 忘记处理遍历结束后栈中的剩余元素

在某些问题中（如环形数组的下一个更大元素），遍历结束后栈中还有元素，需要额外处理：

```typescript
// 环形数组：遍历两次
for (let i = 0; i < 2 * n; i++) {
  while (stack.length > 0 && arr[i % n] > arr[stack[stack.length - 1]]) {
    const topIndex = stack.pop()!
    result[topIndex] = arr[i % n]
  }
  stack.push(i % n)
}
```

### 3. 比较方向写反

```typescript
// ❌ 错误：比较方向写反，变成了递增栈
while (stack.length > 0 && arr[i] < arr[stack[stack.length - 1]]) {
  // 这是在找更小元素！
}

// ✅ 正确：找更大元素应该用 >
while (stack.length > 0 && arr[i] > arr[stack[stack.length - 1]]) {
  const topIndex = stack.pop()!
  result[topIndex] = arr[i]
}
```

### 4. 存储值而非索引

```typescript
// ❌ 错误：存储值，无法计算距离
const stack: number[] = []  // 存储的是数组的值
stack.push(arr[i])

// ✅ 正确：存储索引
const stack: number[] = []  // 存储的是数组的下标
stack.push(i)
// 需要值时：arr[stack[stack.length - 1]]
```

## 实际应用

### 1. 下一个更大元素 (Next Greater Element)

给定一个数组，对每个元素找到它右边第一个比它大的元素。

```typescript
function nextGreaterElement(nums: number[]): number[] {
  const n = nums.length
  const result = new Array(n).fill(-1)
  const stack: number[] = []

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && nums[i] > nums[stack[stack.length - 1]]) {
      result[stack.pop()!] = nums[i]
    }
    stack.push(i)
  }
  return result
}

// 示例
// 输入: [2, 1, 2, 4, 3]
// 输出: [4, 2, 4, -1, -1]
// 解释: 2→4, 1→2, 2→4, 4→无, 3→无
```

### 2. 股票跨度问题 (Stock Span)

计算股票价格的跨度：今天的价格之前连续多少天的价格不超过今天。

```typescript
class StockSpanner {
  private stack: [number, number][] = []  // [价格, 跨度]
  private day = 0

  next(price: number): number {
    let span = 1
    while (this.stack.length > 0 && price >= this.stack[this.stack.length - 1][0]) {
      span += this.stack.pop()![1]
    }
    this.stack.push([price, span])
    this.day++
    return span
  }
}

// 示例
// 价格序列: [100, 80, 60, 70, 60, 75, 85]
// 跨度结果: [1, 1, 1, 2, 1, 4, 6]
```

### 3. 柱状图中最大矩形 (Largest Rectangle in Histogram)

给定柱状图中每个柱子的高度，找到能构成的最大矩形面积。

```typescript
function largestRectangleArea(heights: number[]): number {
  const stack: number[] = []
  let maxArea = 0
  const extended = [...heights, 0]  // 末尾加 0 确保所有元素出栈

  for (let i = 0; i < extended.length; i++) {
    while (stack.length > 0 && extended[i] < extended[stack[stack.length - 1]]) {
      const height = extended[stack.pop()!]
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1
      maxArea = Math.max(maxArea, height * width)
    }
    stack.push(i)
  }
  return maxArea
}

// 示例
// heights = [2, 1, 5, 6, 2, 3]
// 最大矩形面积 = 10（高度 5，宽度 2）
```

### 4. 每日温度 (Daily Temperatures)

给定每天的温度数组，计算需要等多少天才能等到更暖和的天气。

```typescript
function dailyTemperatures(temps: number[]): number[] {
  const n = temps.length
  const result = new Array(n).fill(0)
  const stack: number[] = []

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
      const prevDay = stack.pop()!
      result[prevDay] = i - prevDay  // 等待的天数
    }
    stack.push(i)
  }
  return result
}

// 示例
// temps = [73, 74, 75, 71, 69, 72, 76, 73]
// 输出: [1, 1, 4, 2, 1, 1, 0, 0]
```

## 总结

单调栈是一种强大的技巧，能够将许多看似需要 O(n²) 的问题优化到 O(n)。掌握单调栈的关键要点：

- **核心思想**：维护栈的单调性，利用「弹出」操作获取信息
- **时间复杂度**：O(n)，每个元素最多入栈和出栈各一次
- **两种类型**：递减栈用于找更大元素，递增栈用于找更小元素
- **存储索引**：而非值，方便计算距离和处理边界
- **常见应用**：下一个更大元素、股票跨度、柱状图最大矩形、每日温度

单调栈的题目在面试和竞赛中非常常见。一旦理解了它的核心思想——「维护单调性，弹出时获取答案」，就能举一反三地解决大量相关问题。建议从「下一个更大元素」开始练习，逐步挑战更复杂的题目。
