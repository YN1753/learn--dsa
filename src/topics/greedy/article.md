# 贪心算法 (Greedy Algorithm)

## 概念解释

贪心算法（Greedy Algorithm）是一种在每一步选择中都采取**当前状态下最优**的选择，期望通过一系列局部最优选择达到**全局最优**的算法策略。

想象你在一个岔路口，每条路都标有距离。贪心策略就是：每次都走当前看起来最近的路，不回头、不犹豫。有时这能找到最短路径，有时则会错过更好的路线——这就是贪心算法的核心特点。

### 核心术语

- **贪心选择性质（Greedy Choice Property）**：一个问题的全局最优解可以通过一系列局部最优选择来达到。也就是说，在每一步做出当前最好的选择，最终就能得到全局最优解。这是贪心算法能正确工作的关键前提。

- **最优子结构（Optimal Substructure）**：做出一个贪心选择后，剩余的子问题仍然具有最优子结构——原问题的最优解包含子问题的最优解。这保证了贪心选择之后，我们可以继续对子问题应用贪心策略。

- **局部最优 → 全局最优**：贪心算法的核心假设是「每一步的局部最优选择最终能导向全局最优」。但这个假设并非总是成立——只有当问题同时满足贪心选择性质和最优子结构时，贪心才能保证正确性。

### 贪心的基本框架

```
1. 将问题分解为若干步骤
2. 在每一步中，根据某种贪心策略选择当前最优的选项
3. 做出选择后，缩小问题规模，进入下一步
4. 重复直到问题解决
```

## 为什么重要

### 1. 简单高效

贪心算法通常比动态规划更简单、更高效。很多贪心算法的时间复杂度仅为 O(n log n)（排序的开销），而对应的动态规划解法可能需要 O(n²) 甚至更高。

### 2. 经典应用广泛

许多经典算法本质上都是贪心的：

- **霍夫曼编码（Huffman Coding）**：数据压缩的基础算法，让高频字符用更短的编码
- **区间调度（Interval Scheduling）**：选择最多不重叠的活动
- **Dijkstra 最短路径**：每次选择距离源点最近的未访问节点
- **Kruskal / Prim 最小生成树**：每次选择最小的可用边
- **分数背包（Fractional Knapsack）**：按性价比从高到低装入物品

### 3. 面试与竞赛高频

贪心是算法面试和编程竞赛中的常见题型。它考察的不仅是代码能力，更是对问题性质的分析能力——能否判断一个问题是否适合用贪心来解决。

## 核心原理

### 贪心 vs 动态规划

贪心和动态规划都用于求解最优化问题，但它们的决策方式有本质区别：

| 特性 | 贪心算法 | 动态规划 |
|------|---------|---------|
| 决策方式 | 每步做局部最优选择，不回退 | 考虑所有子问题，从中选择最优组合 |
| 是否需要证明 | 必须证明贪心选择性质 | 只需最优子结构 + 重叠子问题 |
| 时间复杂度 | 通常更低（O(n) 或 O(n log n)） | 通常更高（O(n²) 或更高） |
| 适用范围 | 较窄，需要满足特定条件 | 更广泛 |
| 空间复杂度 | 通常 O(1) 或 O(n) | 通常 O(n) 或 O(n²) |

**关键区别**：贪心做出选择后就不回头，而动态规划会保留所有子问题的答案，从中组合出最优解。

### 正确性证明：交换论证

贪心算法并不总是正确的。要使用贪心，必须证明它的正确性。最常用的证明方法是**交换论证（Exchange Argument）**：

```
证明思路：
1. 假设存在一个最优解 OPT，它不包含贪心选择
2. 将 OPT 中的某个选择替换为贪心选择
3. 证明替换后的解不会变差
4. 因此贪心选择一定存在于某个最优解中
5. 递归地对子问题应用同样的论证
```

### 经典问题：活动选择问题

**问题描述**：有 n 个活动，每个活动有开始时间和结束时间。一个人同时只能参加一个活动，求最多能参加多少个活动。

**贪心策略**：每次都选择**结束时间最早**且与已选活动不冲突的活动。

```typescript
interface Activity {
  name: string
  start: number
  finish: number
}

function activitySelection(activities: Activity[]): Activity[] {
  // 按结束时间排序
  const sorted = [...activities].sort((a, b) => a.finish - b.finish)
  const selected: Activity[] = []

  let lastFinish = 0
  for (const activity of sorted) {
    if (activity.start >= lastFinish) {
      selected.push(activity)
      lastFinish = activity.finish
    }
  }
  return selected
}

// 示例
const activities = [
  { name: 'A', start: 1, finish: 4 },
  { name: 'B', start: 3, finish: 5 },
  { name: 'C', start: 0, finish: 6 },
  { name: 'D', start: 5, finish: 7 },
  { name: 'E', start: 3, finish: 9 },
  { name: 'F', start: 5, finish: 9 },
  { name: 'G', start: 6, finish: 10 },
  { name: 'H', start: 8, finish: 11 },
]

const result = activitySelection(activities)
// 结果：A(1-4), D(5-7), H(8-11) —— 共 3 个活动
```

**为什么选结束最早的？** 因为结束越早，留给后续活动的时间越多。通过交换论证可以证明：如果最优解不包含结束最早的活动，我们可以将其中的第一个活动替换为结束最早的活动，解不会变差。

### 零钱兑换：贪心 vs 动态规划

零钱兑换问题完美展示了贪心何时有效、何时失败：

```typescript
// 贪心解法：每次选最大面额
function coinChangeGreedy(coins: number[], amount: number): number {
  coins.sort((a, b) => b - a) // 降序排列
  let count = 0
  let remaining = amount

  for (const coin of coins) {
    while (remaining >= coin) {
      remaining -= coin
      count++
    }
  }
  return remaining === 0 ? count : -1
}

// 标准美国硬币：[1, 5, 10, 25]
// 凑 41 分：贪心选 25+10+5+1 = 4 枚 ✓ 正确

// 但自定义面额 [1, 3, 4] 凑 6 分：
// 贪心：4+1+1 = 3 枚 ✗
// 最优：3+3 = 2 枚 ✓
```

**当面额是「规范的」（如 1, 5, 10, 25）时，贪心正确；当面额不规范时，贪心可能失败，需要用动态规划。**

## 可视化说明

在右侧的可视化面板中，你可以直观地观察贪心算法的执行过程：

- **活动选择动画**：时间轴上展示各活动为水平条形，贪心每步选中一个活动（高亮），自动排除与之冲突的活动（灰化）
- **霍夫曼树构建**：逐步展示如何从频率最低的节点开始合并，构建完整的霍夫曼编码树
- **分数背包**：按性价比排序后依次装入物品，展示分数部分的装入过程
- **播放控制**：播放/暂停、单步执行、速度调节、重置功能

通过控制栏，你可以：
- 切换不同的贪心问题进行观察
- 调整动画速度，仔细研究每一步的选择过程
- 查看当前操作的文字说明

## 常见错误

### 1. 贪心不总是有效——零钱兑换反例

```typescript
// ❌ 错误：盲目使用贪心解决零钱兑换
// 面额 [1, 3, 4]，目标金额 6
// 贪心：4 + 1 + 1 = 3 枚（错误！）
// 最优：3 + 3 = 2 枚

// ✅ 正确：对于非规范面额，使用动态规划
function coinChangeDP(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}
```

### 2. 必须证明贪心选择性质

```typescript
// ❌ 错误：看到「最优化」就用贪心
// 很多最优化问题不满足贪心选择性质：
// - 0/1 背包问题（贪心按性价比排序不一定最优）
// - 最长公共子序列
// - 旅行商问题

// ✅ 正确：使用贪心前，必须证明：
// (1) 贪心选择性质成立
// (2) 最优子结构成立
// 如果无法证明，应该考虑动态规划或其他方法
```

### 3. 排序顺序至关重要

```typescript
// ❌ 错误：活动选择问题按开始时间排序
activities.sort((a, b) => a.start - b.start)
// 这样不能保证选出最多活动！

// ❌ 错误：活动选择问题按持续时间排序
activities.sort((a, b) =>
  (a.finish - a.start) - (b.finish - b.start))
// 持续时间短不一定意味着能安排更多活动！

// ✅ 正确：按结束时间排序
activities.sort((a, b) => a.finish - b.finish)
```

### 4. 分数背包 vs 0/1 背包

```typescript
// 分数背包可以用贪心：按性价比（价值/重量）降序排列，依次装入
// 0/1 背包不能用贪心：物品不可分割，局部最优不保证全局最优

// 示例：容量 50
// 物品 A: 重 10, 值 60 (性价比 6)
// 物品 B: 重 20, 值 100 (性价比 5)
// 物品 C: 重 30, 值 120 (性价比 4)

// 分数背包贪心：装 A(60) + B(100) + 20/30 × C(80) = 240 ✓
// 0/1 背包贪心：装 A(60) + B(100) = 160
// 0/1 背包最优：装 B(100) + C(120) = 220 ✓
```

## 实际应用

### 1. 霍夫曼编码（Huffman Coding）

霍夫曼编码是一种贪心的数据压缩算法，广泛用于文件压缩（ZIP、GIF、MP3 等）：

```typescript
interface HuffmanNode {
  char?: string
  freq: number
  left?: HuffmanNode
  right?: HuffmanNode
}

function buildHuffmanTree(freqs: Map<string, number>): HuffmanNode {
  // 使用最小堆（优先队列）
  const nodes: HuffmanNode[] = []
  freqs.forEach((freq, char) => {
    nodes.push({ char, freq })
  })

  while (nodes.length > 1) {
    // 每次取出频率最低的两个节点合并
    nodes.sort((a, b) => a.freq - b.freq)
    const left = nodes.shift()!
    const right = nodes.shift()!
    nodes.push({
      freq: left.freq + right.freq,
      left,
      right,
    })
  }
  return nodes[0]
}

// 示例：文本 "aabbcdddd"
// 频率：a=2, b=2, c=1, d=4
// 霍夫曼树让 'd'（频率最高）获得最短编码
```

### 2. 任务调度

区间调度是贪心的经典应用。活动选择问题可以推广到：

- **会议室安排**：最少需要多少间会议室
- **任务截止期限调度**：在截止日期前安排最多任务
- **CPU 任务调度**：最小化平均等待时间（按最短作业优先）

### 3. 最小生成树

Kruskal 算法和 Prim 算法都是贪心算法：

```typescript
// Kruskal 算法：按边权排序，依次加入不形成环的最小边
function kruskal(edges: [number, number, number][], n: number): [number, number, number][] {
  edges.sort((a, b) => a[2] - b[2]) // 按权重排序
  const parent = Array.from({ length: n }, (_, i) => i)

  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x])
    return parent[x]
  }

  const mst: [number, number, number][] = []
  for (const [u, v, w] of edges) {
    const pu = find(u), pv = find(v)
    if (pu !== pv) {
      parent[pu] = pv
      mst.push([u, v, w])
    }
  }
  return mst
}
```

### 4. 区间划分问题

给定一组区间，求最少需要多少个「资源」才能不冲突地安排所有区间（类似最少会议室问题）：

```typescript
function minMeetingRooms(intervals: [number, number][]): number {
  const events: [number, number][] = []
  for (const [start, end] of intervals) {
    events.push([start, 1])   // 开始事件
    events.push([end, -1])    // 结束事件
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1])

  let maxRooms = 0, current = 0
  for (const [, type] of events) {
    current += type
    maxRooms = Math.max(maxRooms, current)
  }
  return maxRooms
}
```

## 总结

贪心算法是算法设计中最直观、最优雅的策略之一，但也是最容易被误用的：

- **核心思想**：每步选择局部最优，期望达到全局最优
- **两大条件**：贪心选择性质 + 最优子结构，缺一不可
- **正确性证明**：交换论证是证明贪心正确性的标准方法
- **经典问题**：活动选择、霍夫曼编码、最小生成树、分数背包
- **常见陷阱**：盲目使用贪心、忽略证明、排序顺序选错、混淆分数背包和 0/1 背包

贪心算法的难点不在于实现，而在于判断一个问题是否适合用贪心来解决。当你遇到一个最优化问题时，先思考：是否可以证明局部最优选择不排斥全局最优解？如果可以，大胆使用贪心；如果不行，考虑动态规划。