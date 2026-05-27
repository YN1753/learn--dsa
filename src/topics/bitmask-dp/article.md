# 状压DP (Bitmask DP)

## 概念解释

状压DP（Bitmask Dynamic Programming）是一种将**集合状态**用二进制整数表示的动态规划技巧。当问题涉及"选择了哪些元素"时，我们可以用一个二进制数的每一位来表示某个元素是否被选中，从而将复杂的集合状态压缩为一个整数。

### 核心思想

假设我们有 n 个元素，编号从 0 到 n-1。用一个 n 位的二进制数 `mask` 来表示集合状态：

- 第 i 位为 1：表示第 i 个元素**已被选中**
- 第 i 位为 0：表示第 i 个元素**未被选中**

例如，n = 4 时：
- `mask = 0b0000 = 0`：空集，没有选中任何元素
- `mask = 0b1010 = 10`：选中了第 1 和第 3 个元素
- `mask = 0b1111 = 15`：全集，所有元素都被选中

### 常用位运算操作

```typescript
// 检查第 i 位是否为 1
const isSelected = (mask: number, i: number) => (mask >> i) & 1

// 将第 i 位设为 1（选中第 i 个元素）
const select = (mask: number, i: number) => mask | (1 << i)

// 将第 i 位设为 0（取消选中第 i 个元素）
const deselect = (mask: number, i: number) => mask & ~(1 << i)

// 枚举 mask 的所有子集
for (let sub = mask; sub; sub = (sub - 1) & mask) {
  // sub 是 mask 的一个非空子集
}

// 统计 mask 中 1 的个数（popcount）
const count = (mask: number) => {
  let c = 0
  for (let x = mask; x; x &= x - 1) c++
  return c
}
```

## 为什么重要

状压DP在算法竞赛和实际应用中具有重要地位：

1. **解决集合类问题**：当状态需要表示"哪些元素已被处理"时，状压DP是最自然的选择
2. **经典问题框架**：TSP（旅行商问题）、指派问题、哈密顿路径等问题的标准解法
3. **时间复杂度优化**：将暴力枚举从 O(n!) 降低到 O(2^n * n^2)
4. **位运算高效**：整数上的位运算速度极快，适合密集计算
5. **思维训练**：培养将复杂状态抽象为简洁表示的能力

## 核心原理

### 状态定义

状压DP的状态通常包含两个部分：

```
dp[mask][i] = 某个最优值
```

- `mask`：已经处理过的元素集合（用二进制表示）
- `i`：当前所在的"位置"或"最后一个处理的元素"

### 以 TSP 为例

**问题**：n 个城市，从城市 0 出发，经过所有城市恰好一次后回到城市 0，求最短路径。

**状态定义**：
```
dp[mask][i] = 从城市 0 出发，经过 mask 中标记的所有城市，
              最后停在城市 i 的最短路径长度
```

**初始状态**：
```
dp[1][0] = 0  （只访问了城市 0，停在城市 0，路径长度为 0）
```

**状态转移**：
```
dp[mask | (1 << j)][j] = min(dp[mask | (1 << j)][j], dp[mask][i] + dist[i][j])
```

其中 j 不在 mask 中（城市 j 还没有被访问过）。

**最终答案**：
```
min(dp[(1 << n) - 1][i] + dist[i][0])，对所有 i
```

### 转移过程示例

假设有 4 个城市，距离矩阵为：

```
     0  1  2  3
  0 [0, 10, 15, 20]
  1 [10, 0, 35, 25]
  2 [15, 35, 0, 30]
  3 [20, 25, 30, 0]
```

DP 过程：
```
初始: dp[0001][0] = 0

mask=0001 (只访问了城市0):
  → dp[0011][1] = dp[0001][0] + dist[0][1] = 0 + 10 = 10
  → dp[0101][2] = dp[0001][0] + dist[0][2] = 0 + 15 = 15
  → dp[1001][3] = dp[0001][0] + dist[0][3] = 0 + 20 = 20

mask=0011 (访问了城市0,1):
  → dp[0111][2] = min(dp[0011][1] + dist[1][2]) = 10 + 35 = 45
  → dp[1011][3] = min(dp[0011][1] + dist[1][3]) = 10 + 25 = 35

mask=0101 (访问了城市0,2):
  → dp[0111][1] = min(dp[0101][2] + dist[2][1]) = 15 + 35 = 50
  → dp[1101][3] = min(dp[0101][2] + dist[2][3]) = 15 + 30 = 45

... 以此类推

最终: mask=1111 (所有城市都访问过)
  答案 = min(dp[1111][1]+dist[1][0], dp[1111][2]+dist[2][0], dp[1111][3]+dist[3][0])
```

### 复杂度分析

- **状态数**：2^n 个 mask，每个 mask 有 n 个可能的"当前位置"，共 O(2^n * n) 个状态
- **转移复杂度**：每个状态最多转移 n 次
- **总复杂度**：O(2^n * n^2)

对于 n <= 20 的问题，2^20 * 20^2 ≈ 4 亿，可以在合理时间内运行。

## 可视化说明

可视化界面展示了状压DP的完整计算过程：

- **二进制状态展示**：每个 mask 用二进制位直观表示集合状态
- **DP 表格**：以 mask 为索引的 DP 表，显示每个状态的计算结果
- **当前状态高亮**：标记正在计算的状态
- **状态转移箭头**：展示从前驱状态到当前状态的转移过程
- **逐步控制**：可以单步执行，观察每个状态的计算细节

通过动画可以直观理解：

- mask 如何用二进制表示集合
- 状态转移如何通过位运算实现
- DP 的计算顺序（按 mask 中 1 的个数递增）
- 最终答案的回溯路径

## 常见错误

### 1. 位运算优先级错误

```typescript
// 错误：& 的优先级低于 ==
if (mask & 1 << i == 0) { ... }

// 正确：加括号明确优先级
if ((mask & (1 << i)) == 0) { ... }
```

### 2. 空集处理遗漏

```typescript
// 错误：没有初始化空集状态
// dp[0][i] 可能是 undefined

// 正确：明确初始化起始状态
dp[1 << start][start] = 0  // 只有起点被选中
```

### 3. 状态转移时忘记检查元素是否已选

```typescript
// 错误：可能重复选择同一个元素
for (let j = 0; j < n; j++) {
  dp[mask | (1 << j)][j] = Math.min(...)
}

// 正确：只选择未被选中的元素
for (let j = 0; j < n; j++) {
  if ((mask & (1 << j)) == 0) {
    dp[mask | (1 << j)][j] = Math.min(...)
  }
}
```

### 4. 数组大小不够

```typescript
// 错误：数组大小为 n
const dp = new Array(n).fill(0).map(() => new Array(n).fill(INF))

// 正确：mask 的范围是 0 到 2^n - 1
const dp = new Array(1 << n).fill(0).map(() => new Array(n).fill(INF))
```

### 5. 枚举子集时的死循环

```typescript
// 错误：sub = (sub - 1) & mask 在 sub=0 时不会终止（会变成负数在JS中变成大数）
// 正确写法：
for (let sub = mask; sub > 0; sub = (sub - 1) & mask) {
  // 处理子集 sub
}
// 别忘了处理空集（sub = 0 的情况）
```

## 实际应用

### 1. 旅行商问题 (TSP)

```typescript
function tsp(dist: number[][]): number {
  const n = dist.length
  const INF = Number.MAX_SAFE_INTEGER
  const dp: number[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(INF))
  dp[1][0] = 0

  for (let mask = 1; mask < (1 << n); mask++) {
    for (let i = 0; i < n; i++) {
      if (dp[mask][i] === INF) continue
      if ((mask & (1 << i)) === 0) continue
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue
        const next = mask | (1 << j)
        dp[next][j] = Math.min(dp[next][j], dp[mask][i] + dist[i][j])
      }
    }
  }

  let ans = INF
  const full = (1 << n) - 1
  for (let i = 1; i < n; i++) {
    ans = Math.min(ans, dp[full][i] + dist[i][0])
  }
  return ans
}
```

### 2. 指派问题 (Assignment Problem)

n 个人分配 n 个任务，每个人做每个任务有不同代价，求总代价最小的分配方案。

```typescript
function assignment(cost: number[][]): number {
  const n = cost.length
  const INF = Number.MAX_SAFE_INTEGER
  const dp = new Array(1 << n).fill(INF)
  dp[0] = 0

  for (let mask = 0; mask < (1 << n); mask++) {
    const person = countBits(mask) // 第几个（第 person 个人）
    if (person >= n) continue
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) continue
      dp[mask | (1 << j)] = Math.min(dp[mask | (1 << j)], dp[mask] + cost[person][j])
    }
  }

  return dp[(1 << n) - 1]
}

function countBits(x: number): number {
  let c = 0
  for (; x; x &= x - 1) c++
  return c
}
```

### 3. 哈密顿路径判定

判断图中是否存在一条经过所有顶点恰好一次的路径：

```typescript
function hasHamiltonianPath(graph: boolean[][]): boolean {
  const n = graph.length
  const dp: boolean[][] = Array.from({ length: 1 << n }, () => new Array(n).fill(false))

  for (let i = 0; i < n; i++) dp[1 << i][i] = true

  for (let mask = 1; mask < (1 << n); mask++) {
    for (let i = 0; i < n; i++) {
      if (!dp[mask][i]) continue
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue
        if (graph[i][j]) {
          dp[mask | (1 << j)][j] = true
        }
      }
    }
  }

  const full = (1 << n) - 1
  for (let i = 0; i < n; i++) {
    if (dp[full][i]) return true
  }
  return false
}
```

### 4. 集合覆盖 / 最优子集选择

选择若干子集覆盖全集，使总代价最小：

```typescript
function minSetCover(universe: number, sets: number[][], costs: number[]): number {
  const INF = Number.MAX_SAFE_INTEGER
  const dp = new Array(1 << universe).fill(INF)
  dp[0] = 0

  for (let mask = 0; mask < (1 << universe); mask++) {
    if (dp[mask] === INF) continue
    for (let i = 0; i < sets.length; i++) {
      const newMask = mask | sets[i]
      dp[newMask] = Math.min(dp[newMask], dp[mask] + costs[i])
    }
  }

  return dp[(1 << universe) - 1]
}
```

## 总结

状压DP是处理小规模集合问题的强力工具：

**核心思想**：
- 用二进制整数表示集合状态，每一位代表一个元素是否被选中
- DP 状态通常为 `dp[mask][i]`，表示已选集合和当前位置
- 通过位运算高效地进行状态转移

**适用条件**：
- 元素数量 n 较小（通常 n <= 20~25）
- 问题涉及"选择哪些元素"的组合决策
- 需要在所有子集上进行优化

**复杂度**：
- 时间：O(2^n * n^2) 或 O(2^n * n)
- 空间：O(2^n * n)

**关键技巧**：
- 熟练掌握位运算（设置位、清除位、检查位、枚举子集）
- 注意边界条件（空集、全集）
- 可以用滚动数组优化空间

掌握状压DP，可以高效解决一大类涉及集合选择的优化问题，是算法竞赛中不可或缺的工具。
