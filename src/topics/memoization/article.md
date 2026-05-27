# 记忆化搜索 (Memoization)

## 概念解释

记忆化搜索是一种通过**缓存递归函数的返回结果**来避免重复计算的优化技术。核心思想非常简单：当一个函数被调用时，先检查缓存中是否已有该输入对应的结果；如果有，直接返回缓存值；如果没有，执行计算，将结果存入缓存后再返回。

```typescript
// 普通递归：同一个 fib(3) 被计算了多次
function fib(n: number): number {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)  // fib(3) 被反复计算！
}

// 记忆化递归：每个 fib(i) 只计算一次
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)!       // 命中缓存，直接返回
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  memo.set(n, result)                         // 存入缓存
  return result
}
```

记忆化搜索本质上是**自顶向下的动态规划**：它保留了递归的思维框架，同时通过缓存消除了重复计算的开销。

### 核心三要素

1. **递归函数**：定义问题的分解方式
2. **缓存（备忘录）**：存储已求解子问题的结果
3. **查缓存逻辑**：函数入口先查缓存，计算后写缓存

## 为什么重要

### 1. 递归与动态规划之间的桥梁

很多问题用递归思考很自然，但直接写递归会有严重的性能问题。记忆化搜索让你保持递归的思维方式，同时获得动态规划的效率。对于初学者而言，这比直接构造 DP 表格要容易得多。

### 2. 实现简单，改造成本低

只需要在原有递归函数上增加三行代码（声明缓存、查缓存、写缓存），就能将指数级算法优化为多项式级。

### 3. 性能提升巨大

| 问题 | 朴素递归 | 记忆化搜索 | 提升倍数 |
|------|---------|-----------|---------|
| fib(40) | ~2^40 次运算 | 41 次运算 | ~260 亿倍 |
| 网格路径 20×20 | ~C(40,20) 次 | 400 次 | ~数十亿倍 |
| 零钱兑换 | 指数级 | O(amount × coins) | 极大 |

### 4. 只计算需要的子问题

与自底向上的动态规划表格法不同，记忆化搜索只计算实际被调用到的子问题。如果某些子问题在求解过程中不会被触及，它们就不会被计算，这在某些场景下能节省大量时间。

## 核心原理

### 缓存容器的选择

记忆化搜索需要一个快速查找的数据结构来存储子问题的结果：

- **哈希表（Map/Object）**：通用，支持任意类型的键
- **数组**：当状态可以用连续整数表示时，数组比哈希表更快
- **嵌套数组/Map**：多维状态时使用

```typescript
// 一维状态：用数组缓存
const memo = new Array(n + 1).fill(-1)

// 一维状态：用 Map 缓存
const memo = new Map<number, number>()

// 二维状态：嵌套 Map
const memo = new Map<string, number>()

// 二维状态：二维数组
const memo = Array.from({ length: m }, () => new Array(n).fill(-1))
```

### 什么时候需要记忆化

判断一个递归问题是否需要记忆化，关键看是否存在**重叠子问题（Overlapping Subproblems）**：

```
fib(5) 的递归调用树：

                fib(5)
              /        \
          fib(4)        fib(3)      ← fib(3) 被计算了 2 次
          /    \        /    \
      fib(3)  fib(2)  fib(2) fib(1) ← fib(2) 被计算了 3 次
      /    \
  fib(2)  fib(1)

fib(3) 出现 2 次，fib(2) 出现 3 次 → 重叠子问题！
```

如果每个子问题都是唯一的（如阶乘 n! = n × (n-1)!），则不需要记忆化。

### Fibonacci：从 O(2^n) 到 O(n)

朴素递归的 fib(n) 会产生约 2^n 次调用，因为每个 fib(i) 都被重复计算。记忆化后，fib(i) 只计算一次，后续调用直接查缓存返回。

```typescript
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)!
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  memo.set(n, result)
  return result
}
// 时间复杂度: O(n)，空间复杂度: O(n)
```

### 网格路径问题

从 m×n 网格的左上角走到右下角（每次只能向右或向下），有多少种走法？

```typescript
function gridPaths(m: number, n: number, memo: Map<string, number> = new Map()): number {
  if (m === 1 || n === 1) return 1
  const key = `${m},${n}`
  if (memo.has(key)) return memo.get(key)!
  const result = gridPaths(m - 1, n, memo) + gridPaths(m, n - 1, memo)
  memo.set(key, result)
  return result
}
// 时间复杂度: O(m × n)，空间复杂度: O(m × n)
```

### 零钱兑换

给定不同面额的硬币和一个总金额，计算凑出该金额的最少硬币数。

```typescript
function coinChange(coins: number[], amount: number, memo: Map<number, number> = new Map()): number {
  if (amount === 0) return 0
  if (amount < 0) return -1
  if (memo.has(amount)) return memo.get(amount)!

  let minCoins = Infinity
  for (const coin of coins) {
    const sub = coinChange(coins, amount - coin, memo)
    if (sub >= 0) minCoins = Math.min(minCoins, sub + 1)
  }

  const result = minCoins === Infinity ? -1 : minCoins
  memo.set(amount, result)
  return result
}
```

### 如何设计状态键

状态键的设计是记忆化搜索最关键的部分：

1. **列出所有影响返回值的参数**：遗漏任何一个参数都会导致错误缓存命中
2. **将参数组合为不可变的键**：字符串拼接 `"${a},${b}"` 是最通用的方式
3. **保持一致性**：相同的子问题必须产生相同的键

```typescript
// ❌ 错误：遗漏了列坐标
const key = `${row}`        // 同一行不同列的子问题会冲突！

// ✅ 正确：包含所有影响结果的参数
const key = `${row},${col}`  // 每个 (row, col) 位置唯一标识

// ❌ 错误：数组作为键（引用比较）
memo.set([row, col], result) // 无法正确查找！

// ✅ 正确：转换为字符串
const key = `${row},${col}`
memo.set(key, result)
```

## 可视化说明

在右侧的可视化面板中，你可以直观地观察记忆化搜索的执行过程：

- **递归调用树**：展示函数的调用关系，每个节点代表一次函数调用
- **缓存命中高亮**：命中缓存的节点用不同颜色标记，区分"新计算"和"缓存返回"
- **逐步执行**：观察每一步的调用过程，理解缓存如何避免重复计算
- **调用次数统计**：对比有无记忆化时的调用次数差异

通过控制栏，你可以：

- 播放 / 暂停动画
- 逐步前进 / 后退
- 调整演示的参数（如 Fibonacci 的 n 值）
- 重置到初始状态

## 常见错误

### 1. 将可变对象作为缓存键

```typescript
// ❌ 错误：数组作为 Map 的键（引用比较）
const memo = new Map<number[], number>()
memo.set([1, 2], 10)
memo.get([1, 2])  // undefined！不同的数组引用

// ❌ 错误：对象作为键
const memo = new Map<object, number>()
memo.set({ a: 1 }, 10)
memo.get({ a: 1 })  // undefined！

// ✅ 正确：转换为字符串
const key = `${row},${col}`
if (memo.has(key)) return memo.get(key)!
```

### 2. 遗漏状态参数

```typescript
// ❌ 错误：背包问题中忘记记录当前物品索引
function knapsack(capacity: number, memo: Map<number, number>): number {
  // capacity 相同但当前考虑的物品不同，结果可能不同！
  // 缺少 itemIndex 参数会导致错误的缓存命中
}

// ✅ 正确：记录所有影响结果的参数
function knapsack(
  itemIndex: number,
  capacity: number,
  memo: Map<string, number>
): number {
  const key = `${itemIndex},${capacity}`
  if (memo.has(key)) return memo.get(key)!
  // ...
}
```

### 3. 忘记在计算后写入缓存

```typescript
// ❌ 错误：计算了结果但没有存入缓存
function fib(n: number, memo: Map<number, number>): number {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)!
  return fib(n - 1, memo) + fib(n - 2, memo)  // 没有 memo.set！
}

// ✅ 正确：先存缓存再返回
function fib(n: number, memo: Map<number, number>): number {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)!
  const result = fib(n - 1, memo) + fib(n - 2, memo)
  memo.set(n, result)   // 必须存入缓存
  return result
}
```

### 4. 深层递归导致栈溢出

```typescript
// ❌ 危险：n 很大时会栈溢出
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)!
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  memo.set(n, result)
  return result
}
fibMemo(100000)  // Stack Overflow！

// ✅ 解决：对于线性递归，改用迭代式记忆化
function fibIterative(n: number): number {
  const memo = new Map<number, number>()
  memo.set(0, 0)
  memo.set(1, 1)
  for (let i = 2; i <= n; i++) {
    memo.set(i, memo.get(i - 1)! + memo.get(i - 2)!)
  }
  return memo.get(n)!
}
```

### 5. 缓存未正确清理导致状态污染

```typescript
// ❌ 问题：在多轮调用间共享缓存但数据已变化
const globalMemo = new Map<string, number>()
// 第一轮调用后，缓存中可能包含依赖特定输入状态的值
// 第二轮输入不同时，旧缓存可能导致错误结果

// ✅ 建议：每次调用使用新的缓存，或确保缓存的有效性
function solve(input: number): number {
  const memo = new Map<string, number>()  // 每次新建
  return helper(input, memo)
}
```

## 实际应用

### 1. 斐波那契数列

记忆化搜索最经典的入门示例。朴素递归 O(2^n) → 记忆化 O(n)。

```typescript
function fib(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)!
  const result = fib(n - 1, memo) + fib(n - 2, memo)
  memo.set(n, result)
  return result
}
```

### 2. 网格路径计数

从网格左上角到右下角的路径数，记忆化避免重复计算每个格子的路径数。

```typescript
function uniquePaths(m: number, n: number, memo: Map<string, number> = new Map()): number {
  if (m === 1 || n === 1) return 1
  const key = `${m},${n}`
  if (memo.has(key)) return memo.get(key)!
  const result = uniquePaths(m - 1, n, memo) + uniquePaths(m, n - 1, memo)
  memo.set(key, result)
  return result
}
```

### 3. 零钱兑换

计算凑出目标金额的最少硬币数，记忆化避免对相同金额重复枚举。

```typescript
function coinChange(coins: number[], amount: number, memo: Map<number, number> = new Map()): number {
  if (amount === 0) return 0
  if (amount < 0) return -1
  if (memo.has(amount)) return memo.get(amount)!

  let minCoins = Infinity
  for (const coin of coins) {
    const sub = coinChange(coins, amount - coin, memo)
    if (sub >= 0) minCoins = Math.min(minCoins, sub + 1)
  }

  const result = minCoins === Infinity ? -1 : minCoins
  memo.set(amount, result)
  return result
}
```

### 4. 背包问题

0-1 背包问题中，用记忆化存储每个 (物品索引, 剩余容量) 组合的最优解。

```typescript
function knapsack(
  weights: number[],
  values: number[],
  index: number,
  capacity: number,
  memo: Map<string, number> = new Map()
): number {
  if (index >= weights.length || capacity === 0) return 0
  const key = `${index},${capacity}`
  if (memo.has(key)) return memo.get(key)!

  // 不选当前物品
  let result = knapsack(weights, values, index + 1, capacity, memo)

  // 选当前物品（如果放得下）
  if (weights[index] <= capacity) {
    const take = values[index] + knapsack(weights, values, index + 1, capacity - weights[index], memo)
    result = Math.max(result, take)
  }

  memo.set(key, result)
  return result
}
```

### 5. 博弈论问题

在很多博弈问题中（如石子游戏、取数字游戏），每个状态的胜负可以通过记忆化搜索来判断。

```typescript
// 判断当前玩家在剩余石子数为 n 时是否必胜
function canWin(n: number, memo: Map<number, boolean> = new Map()): boolean {
  if (n <= 0) return false
  if (memo.has(n)) return memo.get(n)!

  // 当前玩家可以拿 1、2 或 3 颗石子
  // 如果存在一种拿法让对手必败，则当前玩家必胜
  let win = false
  for (let take = 1; take <= 3; take++) {
    if (n >= take && !canWin(n - take, memo)) {
      win = true
      break
    }
  }

  memo.set(n, win)
  return win
}
```

## 总结

记忆化搜索是递归优化的核心技术，掌握它可以让你在面对复杂问题时，先用递归思考，再用缓存优化效率：

- **核心思想**：缓存递归函数的返回结果，避免重复计算
- **适用条件**：问题具有重叠子问题（相同的子问题被多次求解）
- **实现要点**：声明缓存 → 函数入口查缓存 → 计算后写缓存
- **状态键设计**：必须包含所有影响返回值的参数，使用不可变类型
- **性能提升**：通常将指数级时间复杂度优化为多项式级
- **与 DP 的关系**：记忆化搜索 = 自顶向下的动态规划，是递归到 DP 的自然过渡

记忆化搜索不仅是一种优化技巧，更是一种思维方式——它教会我们在递归中识别重复，并用空间换取时间。无论是算法竞赛还是日常开发，这种思想都有着广泛的应用价值。
