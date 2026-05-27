# 回溯 (Backtracking)

## 概念解释

回溯是一种通过**试探和撤销**来系统地搜索所有可能解的算法框架。它的核心思想可以用一句话概括：**走不通就退回来，换条路再试**。

想象你在一个迷宫中寻找出口：你选择一条路走下去，如果遇到死胡同，就退回到上一个路口，尝试另一条路。这个过程不断重复，直到找到出口或确认所有路都走不通。

### 回溯的三步模式

回溯算法的执行过程遵循一个固定的模式：

```
1. 选择（Choose）  ：在当前位置做出一个选择
2. 探索（Explore）  ：基于这个选择，递归地探索后续路径
3. 撤销（Unchoose） ：探索完毕后，撤销刚才的选择，恢复到之前的状态
```

```typescript
function backtrack(状态, 当前路径) {
  if (满足结束条件) {
    保存当前路径
    return
  }

  for (每个候选选择) {
    if (选择有效) {          // 剪枝
      做出选择               // choose
      backtrack(新状态, 新路径) // explore
      撤销选择               // unchoose
    }
  }
}
```

### 状态空间树

回溯算法的搜索过程可以用一棵**状态空间树（State Space Tree）**来表示。树的每个节点代表一个「状态」，每条边代表一个「选择」。回溯的本质就是在这棵树上进行深度优先搜索（DFS）。

```
状态空间树示意图（以排列 [1,2,3] 为例）：

              []
        /      |      \
      [1]     [2]     [3]
      / \     / \     / \
   [1,2][1,3][2,1][2,3][3,1][3,2]
     |    |    |    |    |    |
  [1,2,3] ...  ...  ...  ... [3,2,1]

回溯从根节点出发，深度优先遍历每条路径，
到达叶子节点时得到一个完整解，
然后回溯到上一层继续探索。
```

### 剪枝（Pruning）

并非所有分支都值得探索。**剪枝**是在搜索过程中提前判断某些分支不可能产生有效解，从而跳过它们。这是回溯算法从「暴力穷举」变为「智能搜索」的关键。

```
未剪枝：遍历整棵树 → O(n!) 或 O(2^n)
剪枝后：跳过无效分支 → 实际运行时间大幅减少
```

常见的剪枝条件：
- **约束剪枝**：当前选择违反了问题约束（如皇后冲突）
- **重复剪枝**：跳过相同的元素以避免重复解
- **排序剪枝**：先对候选排序，当某个选择不满足条件时，后续更大的选择也不会满足

## 为什么重要

### 1. 穷举搜索与剪枝的完美结合

回溯算法是解决「组合搜索」问题的通用框架。它通过系统地枚举所有可能的解，并利用剪枝来排除无效分支，在保证找到所有解的同时尽可能减少搜索空间。

### 2. 约束满足问题的基础

许多现实问题都可以建模为约束满足问题（Constraint Satisfaction Problem, CSP）：在一组变量上寻找满足所有约束条件的赋值。回溯是求解 CSP 的核心方法。

### 3. 谜题求解的标准工具

数独、N 皇后、数和（Sum Sudoku）、填字游戏等经典谜题，都可以自然地用回溯算法来求解。

### 4. 组合优化的起点

许多组合优化问题（如旅行商问题 TSP 的精确解法）的基础框架就是回溯。理解回溯是学习分支限界法（Branch and Bound）等高级算法的前提。

## 核心原理

### Choose-Explore-Unchoose 模式

回溯算法的骨架可以用一个统一的递归模板来表示。掌握这个模板，就能解决几乎所有回溯类问题。

```typescript
function backtrack(
  path: number[],       // 当前已做出的选择
  choices: number[],    // 剩余可选的候选
  result: number[][]    // 存储所有有效解
): void {
  // 终止条件：当前路径构成一个完整解
  if (path.length === 目标长度) {
    result.push([...path])  // 注意要拷贝！
    return
  }

  for (let i = 0; i < choices.length; i++) {
    // 剪枝：跳过无效选择
    if (!isValid(choices[i], path)) continue

    // 选择：将 choices[i] 加入路径
    path.push(choices[i])

    // 探索：递归搜索下一层
    backtrack(path, 剩余选择, result)

    // 撤销选择：将 choices[i] 从路径中移除
    path.pop()
  }
}
```

### 递归树可视化

以生成 `[1, 2, 3]` 的全排列为例，回溯过程的递归树如下：

```
backtrack(path=[], choices=[1,2,3])
│
├─ 选择 1 → path=[1]
│  ├─ 选择 2 → path=[1,2]
│  │  └─ 选择 3 → path=[1,2,3] ✓ 保存解
│  │     └─ 撤销 3 → path=[1,2]
│  └─ 撤销 2 → path=[1]
│  ├─ 选择 3 → path=[1,3]
│  │  └─ 选择 2 → path=[1,3,2] ✓ 保存解
│  │     └─ 撤销 2 → path=[1,3]
│  └─ 撤销 3 → path=[1]
├─ 撤销 1 → path=[]
│
├─ 选择 2 → path=[2]
│  ...（类似过程）
│
└─ 选择 3 → path=[3]
   ...（类似过程）
```

### 剪枝条件的设计

剪枝是回溯算法效率的关键。设计剪枝条件需要深入理解问题的约束：

```typescript
// N 皇后问题的剪枝：检查当前位置是否与已有皇后冲突
function isSafe(board: number[], row: number, col: number): boolean {
  for (let i = 0; i < row; i++) {
    // 同列冲突
    if (board[i] === col) return false
    // 对角线冲突：行距 === 列距
    if (Math.abs(board[i] - col) === Math.abs(i - row)) return false
  }
  return true  // 不冲突，可以放置
}
```

### 时间复杂度分析

回溯算法的时间复杂度取决于解空间树的大小和剪枝的效率：

| 问题 | 解空间大小 | 剪枝后实际搜索 |
|------|-----------|---------------|
| 全排列 | O(n!) | O(n!)（无剪枝） |
| 子集生成 | O(2^n) | O(2^n)（无剪枝） |
| N 皇后 | O(n!) | 远小于 n! |
| 数独 | O(9^(空格数)) | 通过约束大幅减少 |

一般来说，回溯算法的时间复杂度为 **O(解空间大小)**，但由于剪枝的存在，实际运行时间往往远好于最坏情况。

## 经典问题

### 1. N 皇后问题

在 N×N 的棋盘上放置 N 个皇后，使得它们互不攻击（不能同行、同列、同对角线）。

```typescript
function solveNQueens(n: number): string[][] {
  const results: string[][] = []
  const board: number[] = new Array(n).fill(-1) // board[i] = j 表示第 i 行皇后在第 j 列

  function isSafe(row: number, col: number): boolean {
    for (let i = 0; i < row; i++) {
      if (board[i] === col || Math.abs(board[i] - col) === Math.abs(i - row)) {
        return false
      }
    }
    return true
  }

  function backtrack(row: number): void {
    if (row === n) {
      // 找到一组解，生成棋盘字符串
      const solution: string[] = []
      for (let i = 0; i < n; i++) {
        solution.push('.'.repeat(board[i]) + 'Q' + '.'.repeat(n - board[i] - 1))
      }
      results.push(solution)
      return
    }

    for (let col = 0; col < n; col++) {
      if (!isSafe(row, col)) continue  // 剪枝：冲突则跳过
      board[row] = col                 // 选择：放置皇后
      backtrack(row + 1)               // 探索：处理下一行
      board[row] = -1                  // 撤销：移除皇后
    }
  }

  backtrack(0)
  return results
}
```

### 2. 子集生成

给定一组不重复的元素，生成所有可能的子集。

```typescript
function subsets(nums: number[]): number[][] {
  const result: number[][] = []

  function backtrack(start: number, path: number[]): void {
    result.push([...path])  // 每个路径都是一个有效子集

    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])        // 选择
      backtrack(i + 1, path)    // 探索
      path.pop()                // 撤销
    }
  }

  backtrack(0, [])
  return result
}
// subsets([1,2,3]) → [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

### 3. 全排列生成

给定一组不重复的元素，生成所有可能的排列。

```typescript
function permute(nums: number[]): number[][] {
  const result: number[][] = []

  function backtrack(path: number[], used: boolean[]): void {
    if (path.length === nums.length) {
      result.push([...path])
      return
    }

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue  // 跳过已使用的元素
      used[i] = true         // 选择
      path.push(nums[i])
      backtrack(path, used)  // 探索
      path.pop()             // 撤销
      used[i] = false
    }
  }

  backtrack([], new Array(nums.length).fill(false))
  return result
}
// permute([1,2,3]) → [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
```

### 4. 数独求解器

在 9×9 的数独棋盘上填入数字 1-9，使得每行、每列、每个 3×3 宫格内数字不重复。

```typescript
function solveSudoku(board: string[][]): boolean {
  function isValid(row: number, col: number, num: string): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false           // 行冲突
      if (board[i][col] === num) return false           // 列冲突
      const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3)
      const boxCol = 3 * Math.floor(col / 3) + i % 3
      if (board[boxRow][boxCol] === num) return false   // 宫格冲突
    }
    return true
  }

  function backtrack(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== '.') continue  // 跳过已填格子

        for (let num = 1; num <= 9; num++) {
          const ch = num.toString()
          if (!isValid(row, col, ch)) continue  // 剪枝

          board[row][col] = ch        // 选择
          if (backtrack()) return true // 探索（找到解直接返回）
          board[row][col] = '.'        // 撤销
        }
        return false  // 1-9 都不行，说明前面的选择有误
      }
    }
    return true  // 所有格子都填完了
  }

  return backtrack()
}
```

## 可视化说明

在右侧的可视化面板中，你可以直观地观察回溯算法的执行过程：

- **N 皇后棋盘**：在 N×N 的棋盘上观察皇后如何逐行放置
- **冲突检测**：当新放置的皇后与已有皇后冲突时，该位置会被标记为红色
- **回溯动画**：当遇到冲突时，皇后会被移除（回溯），然后尝试下一列
- **逐步执行**：你可以一步一步观察算法的决策过程

通过控制面板，你可以：
- 播放 / 暂停动画
- 调整棋盘大小（4-8 皇后）
- 调整动画速度
- 重置到初始状态

## 常见错误

### 1. 忘记撤销选择

这是回溯算法中最常见的错误。做出选择后递归探索，探索完毕必须撤销选择，否则后续分支会基于错误的状态进行搜索。

```typescript
// ❌ 错误：忘记撤销选择
function backtrack(path: number[], choices: number[]): void {
  for (let i = 0; i < choices.length; i++) {
    path.push(choices[i])       // 选择
    backtrack(path, choices)    // 探索
    // ⚠️ 忘记 path.pop()！后续循环中 path 会越来越大
  }
}

// ✅ 正确：选择和撤销必须成对出现
function backtrack(path: number[], choices: number[]): void {
  for (let i = 0; i < choices.length; i++) {
    path.push(choices[i])       // 选择
    backtrack(path, choices)    // 探索
    path.pop()                  // 撤销 ← 不要忘记！
  }
}
```

### 2. 错误的剪枝条件

剪枝条件写错会导致两种问题：要么漏掉有效解（剪枝过度），要么无法排除无效解（剪枝不足）。

```typescript
// ❌ 错误：剪枝条件过于严格，遗漏了有效解
// 假设要求子集和不超过 target，但错误地将 == 也算作无效
if (currentSum >= target) return  // 当 currentSum == target 时也是有效解！

// ✅ 正确：仔细区分「等于」和「大于」
if (currentSum > target) return   // 只排除超过目标的情况
if (currentSum === target) {
  result.push([...path])          // 恰好等于目标，保存解
  return
}
```

### 3. 深递归导致栈溢出

对于规模很大的问题（如 n > 10000），递归深度可能超过调用栈限制。此时需要考虑将递归转为迭代，或增大栈空间。

```typescript
// 对于超大规模问题，可以用迭代 + 显式栈替代递归
function backtrackIterative(problem: Problem): Solution[] {
  const stack: State[] = [initialState]
  const results: Solution[] = []

  while (stack.length > 0) {
    const state = stack.pop()!

    if (isComplete(state)) {
      results.push(extractSolution(state))
      continue
    }

    for (const choice of getChoices(state)) {
      if (isValid(choice, state)) {
        stack.push(applyChoice(state, choice))
      }
    }
  }

  return results
}
```

### 4. 保存解时未拷贝数组

```typescript
// ❌ 错误：直接保存引用，后续修改会覆盖已保存的解
result.push(path)

// ✅ 正确：保存数组的拷贝
result.push([...path])
```

## 实际应用

### 1. N 皇后问题

N 皇后是回溯算法的经典教学案例。它清晰地展示了选择、探索、撤销的全过程，以及冲突检测作为剪枝条件的效果。N 皇后问题也是理解「约束满足」概念的绝佳入门问题。

### 2. 数独求解

数独是广受欢迎的逻辑谜题。计算机求解数独的标准方法就是回溯：逐个尝试填入数字，遇到冲突就回溯。对于标准 9×9 数独，回溯算法通常能在毫秒级完成求解。

### 3. 迷宫求解

在迷宫中寻找从起点到终点的路径，本质上是一个回溯问题。从起点出发，每次选择一个方向前进，遇到死胡同就退回上一个路口，尝试其他方向。

### 4. 正则表达式匹配

正则表达式引擎中的回溯匹配（Backtracking Regex）是回溯的经典应用。当匹配失败时，引擎会回溯到上一个决策点，尝试其他匹配策略。这也是为什么某些正则表达式会导致灾难性回溯（Catastrophic Backtracking）的原因。

### 5. 约束满足问题

许多实际问题都可以建模为约束满足问题，用回溯求解：
- **课程排课**：在有限的教室和时间段中安排课程，满足教师、学生、教室等约束
- **编译器寄存器分配**：将变量分配到有限的 CPU 寄存器中，避免冲突
- **物流调度**：在时间窗口、车辆容量等约束下安排配送路线

## 总结

回溯算法是解决组合搜索问题的通用框架，它的核心思想可以概括为：

- **试探与撤销**：做出选择 → 深入探索 → 撤销选择 → 尝试下一个
- **状态空间树**：回溯本质是在状态空间树上进行深度优先搜索
- **剪枝优化**：通过约束条件提前排除无效分支，减少搜索空间
- **通用模板**：掌握 choose-explore-unchoose 模式，就能解决大多数回溯问题

回溯算法的时间复杂度通常较高（指数级或阶乘级），但对于中等规模的问题，配合有效的剪枝，它往往是最直观、最可靠的解法。理解回溯是学习分支限界法、约束编程等高级算法技术的基础。
