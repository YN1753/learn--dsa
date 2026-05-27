# 数位DP (Digit DP)

## 概念解释

数位DP是一类按数字的每一位进行动态规划的技术。它的核心目标是：**统计在区间 [L, R] 中满足某种"数字性质"的数的个数**。

所谓"数字性质"，通常与数字的各个数位有关，例如：
- 不包含某个数字（如不含数字 4）
- 相邻数位不相同
- 数位之和能被某个数整除
- 某个数字出现的次数恰好为 K 次
- 回文数

**典型问题：** 统计 [1, N] 中不含数字 4 的整数有多少个？

暴力解法需要遍历 [1, N] 的每个数并逐位检查，时间复杂度 O(N * logN)。当 N 达到 10^18 时完全不可行。数位DP可以在 O(logN * 状态数) 的时间内解决此类问题。

### 核心思想

将数字看作一个字符串，从高位到低位逐位构造。在每一位上，我们需要决策填什么数字，同时维护一些状态信息。

以"统计 [1, N] 中不含数字 4 的数的个数"为例：

```
N = 523

从高位到低位构造数字:
  第1位(百位): 可以填 0~5
  第2位(十位): 如果第1位填了5，则只能填 0~2（受上界约束）
                否则可以填 0~9
  第3位(个位): 同理，取决于之前的位是否"贴着"上界

  每一位都不能填 4
```

## 为什么重要

### 竞赛高频考点

数位DP是信息学竞赛中的经典题型，在 Codeforces、Atcoder、LeetCode 等平台上频繁出现。掌握它可以解决大量计数类问题。

### 化暴力为高效

对于 [1, N] 范围的计数问题，暴力枚举是 O(N)，而数位DP通常只需要 O(位数 * 状态数)，即 O(logN * S)。当 N = 10^18 时，位数仅为 18，效率提升巨大。

### 通用框架

数位DP有一套通用的模板框架，学会后可以快速适配各种变体问题。核心区别仅在于维护的状态不同。

### 思维训练

数位DP训练了"按位分解"和"状态压缩"的思维能力，这是算法设计中的重要技巧。

## 核心原理

### DFS + 记忆化搜索框架

数位DP最常用的实现方式是记忆化搜索（DFS + memoization）。

**关键参数：**

| 参数 | 含义 |
|------|------|
| `pos` | 当前处理到第几位（从高位到低位） |
| `tight` | 是否贴着上界（即前面所有位都和 N 的对应位相同） |
| `lead` | 是否有前导零（用于处理"位数不足"的情况） |
| `state` | 根据题目要求维护的状态（如数位之和、上一位填了什么等） |

**状态转移：**

```
dfs(pos, tight, lead, state):
    if pos == len(digits):
        return 满足条件 ? 1 : 0

    if memo[pos][tight][lead][state] 已计算:
        return memo[pos][tight][lead][state]

    upper = tight ? digits[pos] : 9  // 当前位的上界
    result = 0

    for d in 0..upper:
        if 不满足约束:
            continue
        result += dfs(
            pos + 1,
            tight && (d == upper),   // 是否继续贴着上界
            lead && (d == 0),        // 是否继续前导零
            new_state(state, d)      // 更新状态
        )

    memo[pos][tight][lead][state] = result
    return result
```

### 完整示例：统计 [1, N] 中不含数字 4 的数

```typescript
function countWithout4(n: number): number {
    const digits = String(n).split('').map(Number)
    const len = digits.length
    // memo[pos][tight] = -1 表示未计算
    const memo: number[][] = Array.from(
        { length: len },
        () => Array(2).fill(-1)
    )

    function dfs(pos: number, tight: boolean): number {
        if (pos === len) return 1

        const ti = tight ? 1 : 0
        if (memo[pos][ti] !== -1) return memo[pos][ti]

        const upper = tight ? digits[pos] : 9
        let result = 0

        for (let d = 0; d <= upper; d++) {
            if (d === 4) continue  // 跳过数字 4
            result += dfs(pos + 1, tight && d === upper)
        }

        memo[pos][ti] = result
        return result
    }

    return dfs(0, true)
}
```

**执行过程（N = 23）：**

```
digits = [2, 3], len = 2

dfs(0, tight=true):
  upper = 2
  d=0: dfs(1, tight=false)   // 不贴上界
    upper = 9
    d=0..9 (跳过4): 共9个 → return 9
  d=1: dfs(1, tight=false)   // 不贴上界
    同上 → return 9
  d=2: dfs(1, tight=true)    // 贴着上界
    upper = 3
    d=0..3 (跳过4): 共3个 → return 3

总结果 = 9 + 9 + 3 = 21
```

验证：[1, 23] 中不含 4 的数为 1,2,3,5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,21,22,23，共 21 个。正确！

### 求区间 [L, R] 的答案

利用前缀和思想：

```
count(L, R) = count(1, R) - count(1, L-1)
```

### 记忆化的作用

为什么需要记忆化？因为当 `tight = false` 时（不再受上界限制），相同 `(pos, state)` 的子问题会被重复计算。

```
N = 523

dfs(0, tight=true) 时:
  d=0 → dfs(1, tight=false) → 需要算
  d=1 → dfs(1, tight=false) → 和上面完全相同！可复用
  d=2 → dfs(1, tight=false) → 同上
  d=3 → dfs(1, tight=false) → 同上
  d=5 → dfs(1, tight=true)  → 不同，需单独算
```

## 可视化说明

可视化展示了数位DP的执行过程：

1. **数字构造过程**：从高位到低位逐位选择数字，显示当前构造的数字
2. **决策树**：每个位置可选的数字形成一棵决策树
3. **记忆化表**：展示 DP 缓存的状态和命中情况
4. **上界约束**：用颜色标识当前是"贴着上界"(tight) 还是"自由"(loose)
5. **逐步控制**：支持播放、暂停、单步前进后退

## 常见错误

### 忘记处理前导零

当数字可以有前导零时（如统计位数不足的数），需要额外维护 `lead` 状态：

```typescript
// 错误：003 和 3 被当作不同的数
// 正确：用 lead 标记前导零，003 和 3 视为同一个数
dfs(pos, tight, lead, state):
    if lead && d == 0:
        // 前导零，不计入状态
        dfs(pos+1, tight, true, state)
```

### tight 状态更新错误

```typescript
// 错误：tight 始终为 true
new_tight = true

// 正确：只有当前位也等于上界时才继续 tight
new_tight = tight && (d === upper)
```

### 边界条件处理

```typescript
// 错误：忘记 pos === len 时的返回值
if (pos === len) return 0  // 对于计数问题通常返回 1

// 正确：到达末尾时根据状态判断
if (pos === len) return state满足条件 ? 1 : 0
```

### memo 数组维度不够

```typescript
// 错误：只用了 pos 和 tight 两维，遗漏了其他状态
const memo = Array.from({ length: len }, () => Array(2).fill(-1))

// 正确：需要包含所有状态维度
const memo = Array.from(
    { length: len },
    () => Array.from({ length: 2 },
        () => Array.from({ length: 2 },
            () => Array(maxState + 1).fill(-1)
        )
    )
)
```

### 漏掉 0 的处理

统计 [1, N] 时，0 通常不应被计入。如果 DFS 从 0 开始构造且允许全部前导零，最终结果可能多算了一个 0：

```typescript
// 方法1：减去 0 的情况
result = dfs(0, true, true, ...) - 1

// 方法2：在 DFS 中特殊处理
// 当 lead = true 且 pos === len 时，说明构造的是 0，不计入
```

## 实际应用

### 统计不含某些数字的数

**问题：** 统计 [1, N] 中不含数字 4 和 7 的数的个数。

**解法：** 在 DFS 的循环中跳过 4 和 7。

```typescript
for (let d = 0; d <= upper; d++) {
    if (d === 4 || d === 7) continue
    result += dfs(pos + 1, tight && d === upper, ...)
}
```

### 数位之和相关

**问题：** 统计 [1, N] 中各位数字之和恰好为 S 的数的个数。

**解法：** 增加 `sum` 状态，转移时 `new_sum = sum + d`。

```typescript
function dfs(pos, tight, sum): number {
    if (pos === len) return sum === target ? 1 : 0
    if (sum > target) return 0  // 剪枝
    // ... 正常转移，sum += d
}
```

### 相邻数位约束

**问题：** 统计 [1, N] 中相邻数位不相同的数的个数。

**解法：** 增加 `last` 状态记录上一位填了什么。

```typescript
function dfs(pos, tight, last): number {
    // ...
    for (let d = 0; d <= upper; d++) {
        if (d === last) continue  // 相邻不能相同
        result += dfs(pos + 1, tight && d === upper, d)
    }
}
```

### 某数字恰好出现 K 次

**问题：** 统计 [1, N] 中数字 7 恰好出现 3 次的数的个数。

**解法：** 增加 `count7` 状态。

```typescript
function dfs(pos, tight, count7): number {
    if (pos === len) return count7 === 3 ? 1 : 0
    if (count7 > 3) return 0  // 剪枝
    // ...
    for (let d = 0; d <= upper; d++) {
        const newCount = count7 + (d === 7 ? 1 : 0)
        result += dfs(pos + 1, tight && d === upper, newCount)
    }
}
```

### 整除性问题

**问题：** 统计 [1, N] 中各位数字之和能被 K 整除的数的个数。

**解法：** 增加 `sum % K` 状态（模 K 意义下的余数）。

```typescript
function dfs(pos, tight, modSum): number {
    if (pos === len) return modSum === 0 ? 1 : 0
    // ...
    for (let d = 0; d <= upper; d++) {
        result += dfs(pos + 1, tight && d === upper, (modSum + d) % K)
    }
}
```

## 总结

数位DP是解决"按数字位约束计数"问题的强大工具。核心要点：

1. **从高位到低位**构造数字，维护 tight（上界约束）和题目特定状态
2. **记忆化搜索**是最佳实现方式，当 tight = false 时状态可以复用
3. **区间 [L, R]** 通过前缀和转化：`count(R) - count(L-1)`
4. **通用模板**只需修改状态参数和转移逻辑，即可适配各种变体
5. **时间复杂度**为 O(位数 * 状态数 * 10)，对于 10^18 级别的数通常很快

掌握数位DP的关键是理解 tight 参数的含义以及记忆化的作用。一旦理解了框架，就可以快速解决各类数位计数问题。
