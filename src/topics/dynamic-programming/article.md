# 动态规划 (Dynamic Programming)

## 概念解释

动态规划（Dynamic Programming，简称 DP）是一种通过将复杂问题分解为更小的**重叠子问题**来高效求解的算法思想。它不是一种具体的算法，而是一种解决问题的**方法论**。

### 核心术语

- **重叠子问题（Overlapping Subproblems）**：在求解过程中，同一个子问题会被反复多次计算。例如计算斐波那契数列 F(5) 时，F(3) 会被计算两次，F(2) 会被计算三次。如果能记住已经计算过的结果，就可以避免大量重复计算。

- **最优子结构（Optimal Substructure）**：问题的最优解可以通过组合其子问题的最优解来获得。例如，从 A 到 B 的最短路径上，任意两点之间的子路径也是最短路径。这是动态规划能正确工作的前提。

- **状态（State）**：描述子问题的参数集合。好的状态定义是 DP 成功的关键。例如在背包问题中，状态是「前 i 个物品、剩余容量为 w」。

- **状态转移方程（State Transition Equation）**：描述状态之间递推关系的数学公式。它是 DP 的核心，决定了如何从已知状态推导出未知状态。

- **记忆化（Memoization）**：自顶向下的方法，通过递归 + 缓存来避免重复计算。

- **制表法（Tabulation）**：自底向上的方法，通过迭代填充表格来逐步求解。

### 记忆化 vs 制表法

| 特性 | 记忆化（Memoization） | 制表法（Tabulation） |
|------|----------------------|---------------------|
| 方向 | 自顶向下 | 自底向上 |
| 实现方式 | 递归 + 哈希表/数组缓存 | 迭代 + 数组填充 |
| 计算顺序 | 按需计算，只算需要的子问题 | 按固定顺序，可能计算不需要的子问题 |
| 空间开销 | 通常较大（递归栈 + 缓存） | 通常较小（只需数组） |
| 代码风格 | 更直观，接近问题的自然递归定义 | 需要确定正确的填充顺序 |
| 适用场景 | 子问题空间稀疏时更高效 | 子问题空间稠密时更高效 |

## 为什么重要

### 1. 将指数级降为多项式级

动态规划最强大的地方在于：它能将指数级时间复杂度的暴力解法优化到多项式级。

以斐波那契数列为例：
- 暴力递归：O(2^n)——每个问题分裂为两个子问题
- 动态规划：O(n)——每个子问题只计算一次

对于 LCS 问题：
- 暴力枚举：O(2^n × 2^m)——枚举所有子序列
- 动态规划：O(n × m)——填充一个二维表格

### 2. 优化问题的通用解法

很多实际问题天然具有最优子结构和重叠子问题的特征：
- 资源分配：有限预算下如何最大化收益
- 路径规划：最短路径、最少换乘
- 序列比对：DNA 序列比对、文本 diff
- 调度问题：任务调度、课程安排

### 3. 面试高频考点

动态规划是技术面试中最常见的高级算法话题。LeetCode 上超过 20% 的题目涉及动态规划。掌握 DP 不仅能解决具体问题，更能训练将复杂问题分解为子问题的思维方式。

### 4. 真实世界的优化

许多工业级系统的核心算法都基于动态规划：
- 生物信息学中的序列比对（BLAST、ClustalW）
- 编译器的寄存器分配和指令调度
- 通信系统的 Viterbi 解码算法
- 经济学中的最优决策模型

## 核心原理

### 自顶向下：记忆化搜索

记忆化搜索的思路非常直观：从原问题出发递归分解，用缓存记录已计算的结果。

```typescript
// 斐波那契数列 - 记忆化搜索
function fibMemo(n: number, cache: Map<number, number> = new Map()): number {
  // 基础情况
  if (n <= 1) return n

  // 检查缓存
  if (cache.has(n)) return cache.get(n)!

  // 递归计算并缓存
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache)
  cache.set(n, result)
  return result
}
```

### 自底向上：制表法

制表法从最小子问题开始，按顺序填表，逐步推导出原问题的解。

```typescript
// 斐波那契数列 - 制表法
function fibTable(n: number): number {
  if (n <= 1) return n

  const dp = new Array(n + 1)
  dp[0] = 0
  dp[1] = 1

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]  // 状态转移方程
  }
  return dp[n]
}
```

### 状态转移方程的设计

状态转移方程是 DP 的灵魂。设计一个好的状态转移方程需要：

1. **定义状态**：明确 dp[i]（或 dp[i][j]）代表什么含义
2. **找到递推关系**：当前状态如何由之前的状态推导
3. **确定基础情况**：最小子问题的答案是什么
4. **确定填充顺序**：确保计算某个状态时，它依赖的状态已经计算完毕

### DP 表的填充顺序

对于二维 DP（如背包、LCS），填充顺序至关重要：

```
对于 dp[i][j]，通常的填充顺序：
  外层循环：i 从小到大
  内层循环：j 从小到大

这样可以保证：
  dp[i-1][j]   （上方）已经计算
  dp[i][j-1]   （左方）已经计算
  dp[i-1][j-1] （左上方）已经计算
```

## 经典问题详解

### 0/1 背包问题

**问题描述**：有 n 个物品，每个物品有重量 wi 和价值 vi。背包容量为 W，每个物品只能选或不选（0/1），求背包能装下的最大总价值。

**状态定义**：`dp[i][w]` = 前 i 个物品中选择，背包容量为 w 时的最大价值

**状态转移方程**：
```
dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi] + vi)  （当 w >= wi）
dp[i][w] = dp[i-1][w]                              （当 w < wi）
```

**基础情况**：`dp[0][w] = 0`（没有物品时价值为 0）

```typescript
function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  )

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (w >= weights[i - 1]) {
        dp[i][w] = Math.max(
          dp[i - 1][w],                    // 不选第 i 个物品
          dp[i - 1][w - weights[i - 1]] + values[i - 1]  // 选第 i 个物品
        )
      } else {
        dp[i][w] = dp[i - 1][w]           // 装不下，不选
      }
    }
  }
  return dp[n][capacity]
}
```

**示例**：物品重量 [2, 3, 4, 5]，价值 [3, 4, 5, 6]，背包容量 8

DP 表填充过程：
```
       w=0  w=1  w=2  w=3  w=4  w=5  w=6  w=7  w=8
i=0  [  0    0    0    0    0    0    0    0    0  ]
i=1  [  0    0    3    3    3    3    3    3    3  ]
i=2  [  0    0    3    4    4    7    7    7    7  ]
i=3  [  0    0    3    4    5    7    8    9    12 ]
i=4  [  0    0    3    4    5    7    8    9    12 ]
```

### 最长公共子序列 (LCS)

**问题描述**：给定两个序列 X 和 Y，找出它们的最长公共子序列的长度。

**状态定义**：`dp[i][j]` = X 的前 i 个字符和 Y 的前 j 个字符的 LCS 长度

**状态转移方程**：
```
dp[i][j] = dp[i-1][j-1] + 1       （当 X[i] == Y[j]）
dp[i][j] = max(dp[i-1][j], dp[i][j-1])  （当 X[i] != Y[j]）
```

**基础情况**：`dp[0][j] = 0`，`dp[i][0] = 0`

```typescript
function lcs(X: string, Y: string): number {
  const m = X.length
  const n = Y.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (X[i - 1] === Y[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1  // 字符匹配
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])  // 字符不匹配
      }
    }
  }
  return dp[m][n]
}
```

**示例**：X = "ABCBDAB"，Y = "BDCAB"

```
       ""   B    D    C    A    B
  ""  [ 0    0    0    0    0    0 ]
  A   [ 0    0    0    0    1    1 ]
  B   [ 0    1    1    1    1    2 ]
  C   [ 0    1    1    2    2    2 ]
  B   [ 0    1    1    2    2    3 ]
  D   [ 0    1    2    2    2    3 ]
  A   [ 0    1    2    2    3    3 ]
  B   [ 0    1    2    2    3    4 ]
```

LCS 长度为 4（子序列为 "BCAB"）。

### 编辑距离 (Edit Distance)

**问题描述**：将字符串 A 转换为字符串 B，可以执行插入、删除、替换操作，求最少操作次数。

**状态定义**：`dp[i][j]` = A 的前 i 个字符转换为 B 的前 j 个字符所需的最少操作数

**状态转移方程**：
```
dp[i][j] = dp[i-1][j-1]           （当 A[i] == B[j]，无需操作）
dp[i][j] = 1 + min(
  dp[i-1][j],     // 删除 A[i]
  dp[i][j-1],     // 插入 B[j]
  dp[i-1][j-1]    // 替换 A[i] 为 B[j]
)
```

```typescript
function editDistance(A: string, B: string): number {
  const m = A.length
  const n = B.length
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  )

  // 基础情况
  for (let i = 0; i <= m; i++) dp[i][0] = i  // 删除所有字符
  for (let j = 0; j <= n; j++) dp[0][j] = j  // 插入所有字符

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (A[i - 1] === B[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]  // 字符相同，无需操作
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // 删除
          dp[i][j - 1],     // 插入
          dp[i - 1][j - 1]  // 替换
        )
      }
    }
  }
  return dp[m][n]
}
```

## 可视化说明

在右侧的可视化面板中，你可以直观地观察动态规划的执行过程：

- **DP 表格**：以二维网格形式展示 DP 表的填充过程
- **逐步动画**：逐单元格、逐行地展示表格填充过程
- **依赖关系**：高亮当前正在计算的单元格以及它所依赖的单元格（上方、左方、左上方），用箭头指示依赖方向
- **值计算过程**：展示每个单元格的值是如何通过状态转移方程计算得出的
- **问题切换**：通过下拉菜单选择不同问题（背包/LCS/编辑距离）
- **播放控制**：播放/暂停、速度调节、重置功能

通过控制栏，你可以：
- 选择不同的 DP 问题进行观察
- 调整动画速度，仔细研究每一步的计算过程
- 查看当前的状态转移方程和操作说明

## 常见错误

### 1. 未识别重叠子问题，选错方法

```typescript
// 错误：用纯递归解决斐波那契，没有缓存
// 时间复杂度 O(2^n)，大量重复计算
function fib(n: number): number {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)  // fib(3) 被计算了多次！
}

// 正确：使用记忆化或制表法
function fibDP(n: number): number {
  const dp = [0, 1]
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
  }
  return dp[n]
}
```

### 2. 状态定义不正确

```typescript
// 错误：在背包问题中只用一维状态
// dp[w] = 容量为 w 时的最大价值
// 这样无法区分「前 i 个物品」和「所有物品」
// 可能导致同一个物品被多次选择

// 正确：使用二维状态 dp[i][w]
// 明确表示「前 i 个物品、容量为 w」
```

### 3. 基础情况设置错误

```typescript
// 错误：编辑距离的基础情况
const dp: number[][] = Array.from({ length: m + 1 }, () =>
  new Array(n + 1).fill(0)  // 全部初始化为 0！
)
// dp[i][0] 应该是 i（删除 i 个字符），不是 0
// dp[0][j] 应该是 j（插入 j 个字符），不是 0

// 正确：
for (let i = 0; i <= m; i++) dp[i][0] = i
for (let j = 0; j <= n; j++) dp[0][j] = j
```

### 4. 填充顺序错误

```typescript
// 错误：在 LCS 中，从右下角开始填充
for (let i = m; i >= 1; i--) {
  for (let j = n; j >= 1; j--) {
    // dp[i-1][j-1] 还没有计算！
  }
}

// 正确：从左上角开始，逐行逐列填充
for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    // dp[i-1][j], dp[i][j-1], dp[i-1][j-1] 都已计算
  }
}
```

### 5. 忽略空间优化

```typescript
// 不够优化：O(mn) 空间
const dp: number[][] = Array.from({ length: m + 1 }, () =>
  new Array(n + 1).fill(0)
)

// 空间优化：O(n) 空间（利用滚动数组）
// 因为 dp[i][j] 只依赖 dp[i-1][...] 和 dp[i][j-1]
const prev = new Array(n + 1).fill(0)
const curr = new Array(n + 1).fill(0)
for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    // 用 prev 和 curr 交替计算
  }
  [prev, curr] = [curr, prev]  // 交换引用
}
```

## 实际应用

### 生物信息学：序列比对

DNA 和蛋白质序列比对是动态规划最经典的应用之一。两个基因序列的比对本质上就是 LCS 或编辑距离问题的变种。

```typescript
// DNA 序列比对示例
const seq1 = "AGTACGCA"
const seq2 = "TATGC"
const score = lcs(seq1, seq2)  // 找到最长公共子序列
// LCS = "TACGC"，长度 5
```

全局比对（Needleman-Wunsch 算法）和局部比对（Smith-Waterman 算法）都基于 DP，广泛用于基因组学研究。

### 资源分配

在有限资源下最大化收益的问题本质上是背包问题的变种：

```typescript
// 项目投资决策
// 有 100 万预算，每个项目需要不同投资额，预期收益不同
// 每个项目只能投或不投（0/1 背包）
const budgets = [20, 30, 40, 50]   // 各项目投资额（万元）
const profits = [15, 25, 35, 45]   // 各项目预期收益（万元）
const maxBudget = 100               // 总预算

const maxProfit = knapsack(budgets, profits, maxBudget)
// 结果：选择项目 2 和 4，总投资 80 万，最大收益 70 万
```

### 文本 diff 算法

Git、VS Code 等工具的文本差异比较算法基于编辑距离的 DP 解法：

```typescript
// 两段文本的差异比较
const oldText = "Hello World"
const newText = "Hello DP World"
const distance = editDistance(oldText, newText)
// 编辑距离 = 1（插入 "DP "）
```

实际的 diff 工具（如 Myers diff 算法）是对编辑距离 DP 的进一步优化，能输出具体的操作序列。

### 最短路径变种

许多路径规划问题是 DP 的应用：

```typescript// 最小路径和：从左上角到右下角，只能向右或向下移动
function minPathSum(grid: number[][]): number {
  const m = grid.length
  const n = grid[0].length
  const dp: number[][] = Array.from({ length: m }, () => new Array(n).fill(0))

  dp[0][0] = grid[0][0]
  for (let i = 1; i < m; i++) dp[i][0] = dp[i - 1][0] + grid[i][0]
  for (let j = 1; j < n; j++) dp[0][j] = dp[0][j - 1] + grid[0][j]

  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]
    }
  }
  return dp[m - 1][n - 1]
}
```

### 其他经典 DP 问题

- **最长递增子序列 (LIS)**：O(n log n) 解法，用于数据分析和推荐系统
- **零钱兑换**：完全背包的变种，用于金融计算
- **矩阵链乘法**：优化矩阵乘法顺序，减少计算量
- **最优二叉搜索树**：数据库索引优化
- **区间 DP**：括号匹配、石子合并等

## 总结

动态规划是算法设计中最重要的思想之一。掌握 DP 需要理解以下核心要点：

- **两大条件**：重叠子问题 + 最优子结构，缺一不可
- **两种实现**：记忆化搜索（自顶向下）和制表法（自底向上），根据问题特点选择
- **四步设计法**：定义状态 → 写出转移方程 → 确定基础情况 → 确定填充顺序
- **空间优化**：利用滚动数组或状态压缩，将二维 DP 优化为一维
- **常见陷阱**：状态定义不准确、基础情况错误、填充顺序不对、忽略边界条件

动态规划不是靠背模板就能掌握的，需要通过大量练习来培养「状态定义」的直觉。建议从经典的斐波那契、背包、LCS 问题开始，逐步挑战更复杂的区间 DP、树形 DP、数位 DP 等进阶话题。
