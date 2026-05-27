# 斐波那契数列 (Fibonacci Sequence)

## 概念解释

斐波那契数列是数学中最著名的数列之一，由意大利数学家列昂纳多·斐波那契（Leonardo Fibonacci）在 1202 年的《算盘书》中首次提出。

### 定义

斐波那契数列的递推定义非常简洁：

```
F(0) = 0
F(1) = 1
F(n) = F(n-1) + F(n-2)    (n >= 2)
```

即每一项等于前两项之和。数列的前几项为：

```
n:    0  1  2  3  4  5  6  7   8   9  10  11  12
F(n): 0  1  1  2  3  5  8  13  21  34  55  89  144
```

### 为什么叫"递推"

斐波那契数列是递推关系（Recurrence Relation）的经典示例。递推关系是指一个数列的第 n 项由它前面若干项的值来确定。斐波那契数列是最简单的二阶线性递推关系——每一项只依赖于前两项。

## 为什么重要

### 1. 无处不在的自然规律

斐波那契数列在自然界中频繁出现，仿佛是大自然的"密码"：

- **向日葵的种子排列**：向日葵花盘中的种子呈螺旋排列，顺时针和逆时针的螺旋数通常是相邻的斐波那契数（如 34 和 55）
- **松果的鳞片**：松果底部的鳞片也呈斐波那契螺旋
- **兔子繁殖问题**：斐波那契数列最初就是为了解决兔子繁殖问题而提出的
- **花瓣数目**：百合花有 3 瓣，梅花 5 瓣，雏菊通常有 34、55 或 89 瓣——都是斐波那契数

### 2. 算法与数据结构的基础

斐波那契数列在计算机科学中有广泛应用：

- **动态规划入门**：斐波那契数列是理解记忆化和制表法的最佳入门案例
- **斐波那契堆（Fibonacci Heap）**：一种高效的优先队列数据结构，用于 Dijkstra 算法的优化
- **斐波那契查找**：基于黄金分割的查找算法
- **分析算法复杂度**：很多算法的复杂度分析会涉及斐波那契数列

### 3. 数学之美

斐波那契数列连接了多个数学领域：

- 与**黄金分割比** phi = (1+sqrt(5))/2 约等于 1.618 有深刻联系
- 可以用**矩阵快速幂**在 O(log n) 时间内计算
- 有精确的**通项公式**（Binet 公式）
- 在**组合数学**中，F(n) 等于用 1x1 和 1x2 骨牌铺满 1xn 棋盘的方案数

## 核心原理

### 方法一：朴素递归

最直观的方法，直接按定义递归计算：

```typescript
function fibNaive(n: number): number {
  if (n <= 1) return n
  return fibNaive(n - 1) + fibNaive(n - 2)
}
```

**问题**：存在大量重复计算。计算 F(5) 时，F(3) 被计算了 2 次，F(2) 被计算了 3 次。时间复杂度为 O(2^n)，空间复杂度为 O(n)（递归栈深度）。

### 方法二：记忆化搜索（自顶向下 DP）

用缓存记录已计算的结果，避免重复计算：

```typescript
function fibMemo(n: number, cache: Map<number, number> = new Map()): number {
  if (n <= 1) return n
  if (cache.has(n)) return cache.get(n)!
  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache)
  cache.set(n, result)
  return result
}
```

时间复杂度降为 O(n)，空间复杂度 O(n)。

### 方法三：自底向上 DP（制表法）

从最小子问题开始，逐步推导：

```typescript
function fibDP(n: number): number {
  if (n <= 1) return n
  let prev2 = 0, prev1 = 1
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2
    prev2 = prev1
    prev1 = curr
  }
  return prev1
}
```

时间复杂度 O(n)，空间复杂度可优化到 O(1)。

### 方法四：矩阵快速幂

利用矩阵乘法的性质：

```
[F(n+1), F(n)  ]   [1, 1] ^ n
[F(n),   F(n-1)] = [1, 0]
```

通过快速幂算法，只需 O(log n) 次矩阵乘法：

```typescript
function fibMatrix(n: number): number {
  if (n <= 1) return n
  let result: [number, number, number, number] = [1, 0, 0, 1]
  let base: [number, number, number, number] = [1, 1, 1, 0]
  let exp = n

  while (exp > 0) {
    if (exp % 2 === 1) {
      result = matMul(result, base)
    }
    base = matMul(base, base)
    exp = Math.floor(exp / 2)
  }
  return result[1]
}

function matMul(
  a: [number, number, number, number],
  b: [number, number, number, number]
): [number, number, number, number] {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
  ]
}
```

时间复杂度 O(log n)，空间复杂度 O(1)。

### 方法五：Binet 公式（通项公式）

数学上的精确公式：

```
F(n) = (phi^n - psi^n) / sqrt(5)

其中：
  phi = (1 + sqrt(5)) / 2 ≈ 1.6180339...  （黄金分割比）
  psi = (1 - sqrt(5)) / 2 ≈ -0.6180339...
```

由于 |psi| < 1，当 n 较大时 psi^n 趋近于 0，因此 F(n) 约等于 phi^n / sqrt(5)，四舍五入即可得到精确值。

```typescript
function fibBinet(n: number): number {
  const phi = (1 + Math.sqrt(5)) / 2
  const psi = (1 - Math.sqrt(5)) / 2
  return Math.round((Math.pow(phi, n) - Math.pow(psi, n)) / Math.sqrt(5))
}
```

时间复杂度 O(1)，但存在浮点精度限制，n 大于约 70 时结果不准确。

## 可视化说明

在可视化面板中，你可以直观地观察斐波那契数列的计算过程：

- **朴素递归树**：展示递归调用的完整树结构，红色高亮标记重复计算的子问题，直观展示为什么朴素递归效率低下
- **DP 表格填充**：自底向上逐格填充 DP 表格，展示每个值如何由前两项推导得出
- **矩阵乘法过程**：展示矩阵快速幂的逐步计算，包括平方和乘法操作

通过控制栏，你可以：

- 切换不同的计算方法进行对比
- 逐步执行，观察每一步的计算细节
- 调整速度，仔细研究算法的执行流程
- 选择不同的 n 值，观察不同规模下的计算过程

## 常见错误

### 1. 朴素递归导致栈溢出

```typescript
// 错误：对大 n 使用朴素递归
fibNaive(50)  // 可能导致栈溢出，且计算极慢

// 正确：使用 DP 或矩阵快速幂
fibDP(50)     // 瞬间完成
fibMatrix(50) // 瞬间完成
```

### 2. Binet 公式的精度问题

```typescript
// 错误：用 Binet 公式计算大 n
fibBinet(100)  // 结果不准确！浮点精度不足

// 正确：大 n 时使用矩阵快速幂
fibMatrix(100) // 精确结果：354224848179261915075
```

### 3. 忘记处理边界情况

```typescript
// 错误：没有处理 n = 0 和 n = 1
function fib(n: number): number {
  return fib(n - 1) + fib(n - 2)  // 无限递归！
}

// 正确：添加基础情况
function fib(n: number): number {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
}
```

### 4. DP 数组初始化错误

```typescript
// 错误：初始化不正确
const dp = new Array(n + 1).fill(0)
dp[1] = 1
// dp[2] = dp[1] + dp[0] = 1 + 0 = 1  正确
// 但如果 n = 0，dp[1] 会越界

// 正确：先检查边界
function fib(n: number): number {
  if (n <= 1) return n
  const dp = new Array(n + 1)
  dp[0] = 0
  dp[1] = 1
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
  }
  return dp[n]
}
```

### 5. 矩阵乘法顺序错误

```typescript
// 错误：矩阵乘法不满足交换律
result = matMul(base, result)  // 错误！顺序反了

// 正确：保持正确的乘法顺序
result = matMul(result, base)  // 正确
```

## 实际应用

### 黄金分割与设计

斐波那契数列与黄金分割比 phi 密切相关。相邻两项之比 F(n+1)/F(n) 随 n 增大趋近于 phi。黄金分割在艺术、建筑和设计中被广泛使用，被认为是最美的比例。

### 斐波那契堆

斐波那契堆是一种优化的优先队列数据结构，其摊还时间复杂度优于二叉堆。在 Dijkstra 最短路径算法中使用斐波那契堆，可以将时间复杂度从 O((V+E) log V) 优化到 O(E + V log V)。

### 动态规划入门

斐波那契数列是学习动态规划的最佳起点。通过它，可以理解：
- 重叠子问题的概念
- 记忆化搜索与制表法的区别
- 空间优化的技巧

### 兔子繁殖问题

斐波那契数列最初的问题背景：假设一对兔子从出生后第三个月开始每个月生一对兔子，且兔子永远不会死。问 n 个月后有多少对兔子？答案正是 F(n+1)。

## 总结

斐波那契数列虽然定义简单，却蕴含着丰富的数学和计算机科学知识：

- **多种求解方法**：从朴素递归到矩阵快速幂，体现了算法优化的思路
- **动态规划入门**：理解重叠子问题和状态转移的最佳案例
- **数学之美**：与黄金分割、组合数学、线性代数的深刻联系
- **实际应用**：从数据结构到自然规律，斐波那契数列无处不在

掌握斐波那契数列的多种求解方法，不仅是为了计算数列本身，更是为了理解算法设计和优化的核心思想。
