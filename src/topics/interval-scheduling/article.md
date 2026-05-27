# 区间调度 (Interval Scheduling)

## 概念解释

区间调度问题是经典的**贪心算法**问题，也被称为**活动选择问题**。

问题描述：给定 n 个区间 [s_i, e_i]（表示开始时间和结束时间），要求选出**尽可能多的互不重叠的区间**。

两个区间 [a, b] 和 [c, d] 不重叠的条件是：b <= c 或 d <= a。

**核心贪心策略**：将所有区间按**结束时间**从小到大排序，然后依次扫描，选择与已选区间不重叠的区间。

```
输入区间: [1,4] [3,5] [0,6] [5,7] [3,9] [5,9] [6,10] [8,11] [8,12] [2,14] [12,16]
按结束时间排序后贪心选择: [1,4] -> [5,7] -> [8,11] -> [12,16]
结果: 选中 4 个不重叠区间
```

## 为什么重要

### 1. 贪心算法的经典教材

区间调度是理解贪心算法**正确性证明**的最佳入门案例。通过**交换论证**（Exchange Argument）可以严格证明贪心策略的最优性。

### 2. 实际应用广泛

许多现实问题都可以建模为区间调度：
- 会议室安排：在有限的会议室中安排尽可能多的会议
- CPU 调度：在单核 CPU 上安排尽可能多的任务
- 课程选择：在不冲突的前提下选择最多的课程
- 工作安排：在限定时间内完成尽可能多的工作

### 3. 许多复杂问题的基础

区间调度的贪心思想可以扩展到更复杂的问题：
- 区间覆盖问题
- 区间合并问题
- 区间图着色
- 多机调度问题

## 核心原理

### 贪心策略

**按结束时间排序，贪心选择不重叠区间。**

为什么是结束时间而不是开始时间？直觉上：选择结束最早的区间，可以为后续留出尽可能多的时间空间。

### 交换论证证明最优性

设贪心算法选择的区间为 G = {g_1, g_2, ..., g_k}，最优解为 O = {o_1, o_2, ..., o_m}（均按结束时间排序）。

**定理**：k = m，即贪心解和最优解选择的区间数量相同。

**证明**（归纳法）：

**基础**：第一个选择时，贪心选择结束最早的区间 g_1。设最优解第一个区间为 o_1。
- 如果 g_1 = o_1，直接成立
- 如果 g_1 != o_1，因为 g_1 结束时间 <= o_1 结束时间，将 o_1 替换为 g_1 后仍然可行（g_1 不会与 o_2 冲突，因为 g_1 结束更早）
- 替换后区间数不减少，所以存在一个包含 g_1 的最优解

**归纳**：假设前 i 个选择都与某个最优解相同。
- 贪心选择 g_{i+1} 是当前结束最早的不重叠区间
- 如果最优解的第 i+1 个区间 o_{i+1} != g_{i+1}，同样可以替换为 g_{i+1}
- 替换后仍然可行且区间数不减少

因此贪心解的区间数 >= 最优解的区间数，又因为贪心解本身就是可行解，所以两者相等。

### 算法伪代码

```
function intervalScheduling(intervals):
    // 按结束时间排序
    sort intervals by end time ascending

    selected = []
    lastEnd = -infinity

    for each interval [s, e] in intervals:
        if s >= lastEnd:           // 不重叠
            selected.add([s, e])
            lastEnd = e

    return selected
```

### TypeScript 实现

```typescript
interface Interval {
  start: number
  end: number
}

function intervalScheduling(intervals: Interval[]): Interval[] {
  // 按结束时间排序
  const sorted = [...intervals].sort((a, b) => a.end - b.end)

  const selected: Interval[] = []
  let lastEnd = -Infinity

  for (const interval of sorted) {
    if (interval.start >= lastEnd) {
      selected.push(interval)
      lastEnd = interval.end
    }
  }

  return selected
}
```

### 复杂度分析

- **时间复杂度**：O(n log n)，排序是瓶颈，贪心扫描是 O(n)
- **空间复杂度**：O(1)（不考虑排序的额外空间）

### 为什么不能按其他标准排序？

| 排序方式 | 是否正确 | 反例 |
|---------|---------|------|
| 按结束时间 | 正确 | - |
| 按开始时间 | 错误 | [0,10] [1,2] [3,4]，按开始时间会选 [0,10]，但最优是选 [1,2] 和 [3,4] |
| 按区间长度 | 错误 | [0,10] [1,2] [3,4]，按长度会选 [1,2] [3,4]（碰巧正确），但 [0,3] [2,10] [4,5] 按长度选 [0,3] [4,5]，最优是 [4,5] [2,10]... 其实这个反例不好，更简单的：[1,100] [2,3] [4,5] [6,7]，按长度选 [2,3] [4,5] [6,7]（3个）与按结束时间相同。关键在于按长度排序无法保证贪心选择性质。 |

## 可视化说明

在可视化界面中，区间调度的过程通过以下方式展示：

- **时间轴**：水平轴表示时间，每个区间显示为一条水平线段
- **颜色编码**：
  - 蓝色：当前正在考虑的区间
  - 绿色：已选中的区间（不重叠）
  - 红色：被跳过的区间（与已选区间重叠）
  - 灰色：尚未处理的区间
- **排序顺序**：显示区间按结束时间排序后的顺序
- **贪心选择**：每次决策时高亮显示选择依据

通过动画控制栏，你可以：
- 逐步执行贪心算法，观察每一步的选择过程
- 播放/暂停动画
- 调整动画速度
- 重置到初始状态

## 常见错误

### 1. 按开始时间排序

```typescript
// 错误：按开始时间排序
const sorted = intervals.sort((a, b) => a.start - b.start)

// 正确：按结束时间排序
const sorted = intervals.sort((a, b) => a.end - b.end)
```

按开始时间排序会优先选择开始最早但可能很长的区间，导致排除多个短区间。

### 2. 重叠判断条件错误

```typescript
// 错误：用 > 判断不重叠
if (interval.start > lastEnd) { ... }

// 正确：用 >= 判断不重叠
// [1,3] 和 [3,5] 在时间点 3 接触但不重叠
if (interval.start >= lastEnd) { ... }
```

是否认为 [1,3] 和 [3,5] 重叠取决于问题定义。通常认为端点接触不算重叠。

### 3. 混淆区间调度和区间覆盖

```typescript
// 区间调度：选择最多不重叠区间（贪心：按结束时间排序）
// 区间覆盖：用最少区间覆盖整个范围（贪心：按开始时间排序）

// 两者贪心策略不同，不要混淆
```

### 4. 忘记排序

```typescript
// 错误：直接按原顺序扫描
// 原顺序可能不是按结束时间排序的，贪心策略不成立

// 正确：先排序再扫描
const sorted = [...intervals].sort((a, b) => a.end - b.end)
```

### 5. 试图用贪心解决加权版本

```typescript
// 加权区间调度不能用简单贪心
// 需要用动态规划：
// dp[i] = max(dp[i-1], weight[i] + dp[j])
// 其中 j 是最后一个与区间 i 不重叠的区间

// 贪心只能解决"数量最多"，不能解决"权重最大"
```

## 实际应用

### 1. 会议室安排

```typescript
interface Meeting {
  id: string
  start: number  // 开始时间（小时）
  end: number    // 结束时间（小时）
}

function scheduleMeetings(meetings: Meeting[]): Meeting[] {
  // 按结束时间排序
  const sorted = [...meetings].sort((a, b) => a.end - b.end)
  const scheduled: Meeting[] = []
  let lastEnd = 0

  for (const meeting of sorted) {
    if (meeting.start >= lastEnd) {
      scheduled.push(meeting)
      lastEnd = meeting.end
    }
  }

  return scheduled
}

// 示例
const meetings = [
  { id: 'A', start: 9, end: 10 },
  { id: 'B', start: 9, end: 11 },
  { id: 'C', start: 10, end: 12 },
  { id: 'D', start: 11, end: 13 },
  { id: 'E', start: 13, end: 14 },
]
// 结果: A -> D -> E（3 个会议）
```

### 2. CPU 任务调度

```typescript
interface Task {
  name: string
  arrival: number   // 到达时间
  deadline: number  // 截止时间
}

function scheduleTasks(tasks: Task[]): Task[] {
  // 按截止时间排序
  const sorted = [...tasks].sort((a, b) => a.deadline - b.deadline)
  const scheduled: Task[] = []
  let currentTime = 0

  for (const task of sorted) {
    if (task.arrival >= currentTime) {
      scheduled.push(task)
      currentTime = task.deadline
    }
  }

  return scheduled
}
```

### 3. 课程选择

```typescript
interface Course {
  name: string
  startTime: string  // "09:00"
  endTime: string    // "10:30"
}

function selectCourses(courses: Course[]): Course[] {
  // 转换时间为分钟数便于比较
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const sorted = [...courses].sort(
    (a, b) => toMinutes(a.endTime) - toMinutes(b.endTime)
  )

  const selected: Course[] = []
  let lastEnd = 0

  for (const course of sorted) {
    const start = toMinutes(course.startTime)
    if (start >= lastEnd) {
      selected.push(course)
      lastEnd = toMinutes(course.endTime)
    }
  }

  return selected
}
```

## 总结

区间调度是贪心算法的经典问题：

**核心思想**：
- 按结束时间从小到大排序
- 贪心选择与已选区间不重叠的区间
- 每次选择结束最早的区间，为后续留出最大空间

**正确性保证**：
- 交换论证：可以将最优解中的第一个区间替换为贪心选择的区间，结果不会变差
- 归纳证明：每一步贪心选择都与某个最优解一致

**复杂度**：
- 时间 O(n log n)，排序是瓶颈
- 空间 O(1)

**适用场景**：
- 选择最多不重叠区间（活动选择、会议安排）
- 不适用于加权版本（需要动态规划）

**关键注意点**：
- 按结束时间排序，不是开始时间
- 端点接触 [1,3] 和 [3,5] 通常不算重叠
- 加权版本需要用 DP，不能用贪心

掌握区间调度问题，你就掌握了贪心算法正确性证明的核心方法——交换论证，这在学习其他贪心问题时非常有用。
