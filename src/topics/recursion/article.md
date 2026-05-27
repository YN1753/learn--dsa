# 递归 (Recursion)

## 概念解释

递归是一种编程技巧，指的是**函数直接或间接调用自身**来解决问题。递归的核心思想是：将一个大问题分解为结构相同但规模更小的子问题，直到子问题足够简单可以直接求解。

一个完整的递归函数包含两个关键部分：

- **基本情况（Base Case）**：递归的终止条件，不再调用自身，直接返回一个确定的值。它是递归的"出口"。
- **递归情况（Recursive Case）**：将问题分解为更小的子问题，调用自身来解决。

```typescript
// 阶乘函数 —— 递归的经典示例
function factorial(n: number): number {
  // 基本情况：0! = 1，1! = 1
  if (n <= 1) return 1
  // 递归情况：n! = n × (n-1)!
  return n * factorial(n - 1)
}
```

### 调用栈与栈帧

每当一个函数被调用时，系统会在**调用栈（Call Stack）**上分配一块内存，称为**栈帧（Stack Frame）**。栈帧中存储了函数的参数、局部变量和返回地址。

```
调用栈示意图（factorial(4) 的执行过程）：

  调用 factorial(4)
  ┌─────────────────┐
  │ factorial(4)     │  等待 factorial(3) 的结果
  │ n = 4            │
  │ 返回地址: main   │
  └─────────────────┘
  ┌─────────────────┐
  │ factorial(3)     │  等待 factorial(2) 的结果
  │ n = 3            │
  │ 返回地址: f(4)   │
  └─────────────────┘
  ┌─────────────────┐
  │ factorial(2)     │  等待 factorial(1) 的结果
  │ n = 2            │
  │ 返回地址: f(3)   │
  └─────────────────┘
  ┌─────────────────┐
  │ factorial(1)     │  命中基本情况，返回 1
  │ n = 1            │
  │ 返回地址: f(2)   │
  └─────────────────┘
  栈底
```

当函数返回时，它的栈帧被弹出，控制权交还给调用者。如果递归层数太深，调用栈空间耗尽，就会发生**栈溢出（Stack Overflow）**。

## 为什么重要

递归是计算机科学中最基础、最重要的思想之一：

### 1. 分治策略的基础

分治法（Divide and Conquer）将问题分成若干子问题，递归求解后合并结果。归并排序、快速排序、二分查找等经典算法都基于递归。

### 2. 回溯算法的核心

回溯法通过递归系统地搜索所有可能的解，当发现当前路径不可行时"回退"。八皇后、数独求解、迷宫路径等问题都使用回溯。

### 3. 树与图的遍历

树的前序、中序、后序遍历天然是递归的。图的深度优先搜索（DFS）也用递归实现最为直观。

### 4. 数学归纳法的映射

递归与数学归纳法有天然的对应关系：基本情况对应归纳法的初始步骤，递归情况对应归纳步骤。理解递归有助于理解数学证明，反之亦然。

## 核心原理

### 调用栈的工作机制

每次递归调用都会在调用栈上压入一个新的栈帧。栈帧包含：

- **函数参数**：当前调用的实参值
- **返回地址**：函数执行完毕后应该回到哪里继续执行
- **局部变量**：函数内部声明的变量
- **返回值**：函数的计算结果

```
factorial(3) 的栈帧变化过程：

步骤1: 调用 factorial(3)
  栈: [factorial(3)]

步骤2: 调用 factorial(2)
  栈: [factorial(3), factorial(2)]

步骤3: 调用 factorial(1)
  栈: [factorial(3), factorial(2), factorial(1)]

步骤4: factorial(1) 返回 1，弹出栈帧
  栈: [factorial(3), factorial(2)]

步骤5: factorial(2) 得到 1*2=2，返回，弹出
  栈: [factorial(3)]

步骤6: factorial(3) 得到 2*3=6，返回，弹出
  栈: []（空）
```

### 尾递归

**尾递归（Tail Recursion）**是指递归调用是函数中最后执行的操作，递归返回后不需要再做任何计算。

```typescript
// 普通递归：递归返回后还要做 n * ... 的乘法
function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)  // 递归调用不是最后一步
}

// 尾递归：递归调用就是最后一步，结果通过累加器传递
function factorialTail(n: number, acc: number = 1): number {
  if (n <= 1) return acc
  return factorialTail(n - 1, n * acc)  // 递归调用是最后一步
}
```

支持尾调用优化（TCO）的语言/引擎可以将尾递归转化为循环，复用当前栈帧，避免栈溢出。JavaScript 的严格模式下部分引擎支持 TCO，但并非所有环境都支持。

### 递归 vs 迭代

| 特性 | 递归 | 迭代 |
|------|------|------|
| 代码风格 | 简洁、直观 | 通常更冗长 |
| 内存使用 | 每次调用消耗栈帧 | 通常更少 |
| 栈溢出风险 | 深度过大会溢出 | 无此风险 |
| 性能 | 函数调用有开销 | 通常更快 |
| 适用场景 | 树/图遍历、分治、回溯 | 线性遍历、简单循环 |

任何递归都可以转化为迭代（通常借助显式栈），任何迭代也可以转化为递归。选择哪种方式取决于问题特性和代码可读性。

### 时间与空间复杂度分析

递归算法的复杂度分析通常使用**递推关系（Recurrence Relation）**：

- **阶乘 factorial(n)**：T(n) = T(n-1) + O(1)，时间 O(n)，空间 O(n)（栈深度）
- **斐波那契 fib(n)（朴素）**：T(n) = T(n-1) + T(n-2) + O(1)，时间 O(2^n)，空间 O(n)
- **归并排序**：T(n) = 2T(n/2) + O(n)，时间 O(n log n)，空间 O(n)
- **二分查找**：T(n) = T(n/2) + O(1)，时间 O(log n)，空间 O(log n)

空间复杂度通常是递归的最大深度，即调用栈中同时存在的最大栈帧数。

## 可视化说明

在右侧的可视化面板中，你可以直观地观察递归的执行过程：

- **调用栈动画**：每次递归调用时，新的栈帧从顶部压入；返回时栈帧弹出
- **阶乘演示**：逐步展示 factorial(n) 的调用和返回过程，显示每个栈帧的参数和返回值
- **斐波那契树**：展示递归调用树，对比朴素递归和记忆化递归的计算次数差异
- **汉诺塔**：展示圆盘的移动步骤

通过控制栏，你可以：

- 播放 / 暂停动画
- 调整动画速度
- 选择不同的演示模式
- 重置到初始状态

## 常见错误

### 1. 缺少基本情况 —— 栈溢出

```typescript
// 错误：没有基本情况，无限递归！
function badRecursion(n: number): number {
  return badRecursion(n - 1)  // 永远不会停止
}
// 结果：Maximum call stack size exceeded

// 正确：必须有终止条件
function goodRecursion(n: number): number {
  if (n <= 0) return 0       // 基本情况
  return goodRecursion(n - 1) // 递归情况
}
```

### 2. 基本情况错误 —— 结果不正确

```typescript
// 错误：基本情况的返回值不对
function factorial(n: number): number {
  if (n === 0) return 0  // 错！0! = 1，不是 0
  return n * factorial(n - 1)
}
// factorial(5) = 5*4*3*2*1*0 = 0（错误）

// 正确：
function factorial(n: number): number {
  if (n <= 1) return 1   // 0! = 1, 1! = 1
  return n * factorial(n - 1)
}
```

### 3. 斐波那契的重复计算

```typescript
// 朴素递归：存在大量重复计算
function fib(n: number): number {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)  // fib(3) 被计算了 2 次，fib(2) 被计算了 3 次...
}
// fib(40) 需要约 2^40 次运算，非常慢！

// 记忆化递归：缓存已计算的结果
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n
  if (memo.has(n)) return memo.get(n)!
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo)
  memo.set(n, result)
  return result
}
// fibMemo(40) 只需要约 40 次计算
```

### 4. 忘记返回递归结果

```typescript
// 错误：没有 return 递归调用的结果
function sum(n: number): number {
  if (n <= 0) return 0
  sum(n - 1)  // 忘了 return！
}
// 结果：undefined（函数没有返回值）

// 正确：
function sum(n: number): number {
  if (n <= 0) return 0
  return n + sum(n - 1)  // 必须 return
}
```

## 实际应用

### 1. 阶乘计算

```typescript
function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}
// factorial(5) = 120
```

### 2. 斐波那契数列

```typescript
// 记忆化版本
function fib(n: number, memo: number[] = []): number {
  if (n <= 1) return n
  if (memo[n] !== undefined) return memo[n]
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
  return memo[n]
}
```

### 3. 二叉树遍历

```typescript
interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}

// 前序遍历：根 → 左 → 右
function preorder(node: TreeNode | null): number[] {
  if (!node) return []
  return [node.val, ...preorder(node.left), ...preorder(node.right)]
}

// 中序遍历：左 → 根 → 右（二叉搜索树的有序遍历）
function inorder(node: TreeNode | null): number[] {
  if (!node) return []
  return [...inorder(node.left), node.val, ...inorder(node.right)]
}
```

### 4. 归并排序

```typescript
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr

  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))

  // 合并两个有序数组
  const result: number[] = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++])
    else result.push(right[j++])
  }
  return result.concat(left.slice(i)).concat(right.slice(j))
}
```

### 5. 汉诺塔

```typescript
function hanoi(n: number, from: string, to: string, aux: string): string[] {
  if (n === 1) return [`将圆盘 1 从 ${from} 移到 ${to}`]
  return [
    ...hanoi(n - 1, from, aux, to),
    `将圆盘 ${n} 从 ${from} 移到 ${to}`,
    ...hanoi(n - 1, aux, to, from),
  ]
}
// hanoi(3, 'A', 'C', 'B') 输出 7 步移动过程
```

### 6. 全排列生成

```typescript
function permutations(arr: number[]): number[][] {
  if (arr.length <= 1) return [arr]

  const result: number[][] = []
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm])
    }
  }
  return result
}
// permutations([1,2,3]) 输出 6 种排列
```

## 总结

递归是将问题分解为相同结构的子问题并调用自身解决的编程技巧。掌握递归需要理解以下要点：

- **两个必要条件**：每个递归函数必须有基本情况（终止条件）和递归情况（缩小问题规模）
- **调用栈机制**：每次递归调用消耗一个栈帧，深度过大会导致栈溢出
- **尾递归优化**：将递归调用放在最后一步，可被优化为循环
- **记忆化技术**：缓存已计算结果，避免重复计算（如斐波那契数列）
- **复杂度分析**：通过递推关系分析时间和空间复杂度

递归是分治、回溯、动态规划等高级算法思想的基础，也是树和图遍历的天然工具。虽然迭代在性能上通常更优，但递归的代码往往更简洁、更接近问题的数学定义，在很多场景下是更好的选择。
