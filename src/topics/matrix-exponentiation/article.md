# 矩阵快速幂 (Matrix Exponentiation)

## 概念解释

矩阵快速幂是一种将**线性递推关系**转化为**矩阵幂运算**的算法技巧。通过结合矩阵乘法和快速幂（二分幂），它可以将某些递推问题的时间复杂度从 O(n) 降低到 O(k³ log n)，其中 k 是递推的阶数。

### 核心思想

对于 k 阶线性递推：

```
f(n) = c₁·f(n-1) + c₂·f(n-2) + ... + cₖ·f(n-k)
```

我们可以构造一个 k × k 的**状态转移矩阵** T，使得：

```
[f(n)  ]       [f(n-1)]
[f(n-1)] = T × [f(n-2)]
[ ... ]        [ ...  ]
[f(n-k+1)]     [f(n-k)]
```

因此：

```
[f(n)  ]         [f(k-1)]
[f(n-1)] = T^(n-k+1) × [f(k-2)]
[ ... ]              [ ...  ]
[f(n-k+1)]           [f(0)  ]
```

计算 T^(n-k+1) 使用快速幂，只需 O(log n) 次矩阵乘法。

### 基本术语

| 术语 | 说明 |
|------|------|
| 状态向量 | 包含递推所需所有历史值的列向量 |
| 转移矩阵 | 将当前状态映射到下一状态的方阵 |
| 快速幂 | 通过二分指数来加速幂运算，O(log n) 次乘法 |
| 矩阵乘法 | 两个矩阵相乘，O(k³) 时间复杂度 |

## 为什么重要

矩阵快速幂在算法竞赛和实际应用中非常重要：

1. **巨大性能提升**：对于 n 达到 10¹⁸ 级别的问题，朴素递推需要 10¹⁸ 次操作（不可能完成），而矩阵快速幂只需约 60 次矩阵乘法
2. **通用框架**：可以处理各种线性递推问题，包括斐波那契、计数问题、图上路径问题
3. **组合数学**：许多组合计数问题可以转化为线性递推，进而用矩阵快速幂求解
4. **图论应用**：计算有向图中恰好长度为 k 的路径数量，时间复杂度 O(k³ log k)

## 核心原理

### 快速幂原理

整数快速幂利用了幂的二进制分解：

```
a^13 = a^(1101₂) = a^8 × a^4 × a^1
```

具体算法：

```typescript
function pow(base: number, exp: number): number {
  let result = 1
  let current = base
  while (exp > 0) {
    if (exp & 1) result *= current  // 当前位为 1，乘入结果
    current *= current               // 平方
    exp >>= 1                        // 右移一位
  }
  return result
}
```

### 矩阵乘法

两个矩阵 A (n×k) 和 B (k×m) 相乘，结果为 C (n×m)：

```typescript
function matMul(A: number[][], B: number[][]): number[][] {
  const n = A.length
  const m = B[0].length
  const k = B.length
  const C = Array.from({ length: n }, () => new Array(m).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      for (let p = 0; p < k; p++) {
        C[i][j] += A[i][p] * B[p][j]
      }
    }
  }
  return C
}
```

**时间复杂度**：O(n × m × k)，对于方阵为 O(k³)

### 矩阵快速幂

将快速幂的思想应用到矩阵上：

```typescript
function matPow(base: number[][], exp: number): number[][] {
  const n = base.length
  // 初始化为单位矩阵
  let result = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  )
  let current = base
  let e = exp
  while (e > 0) {
    if (e & 1) result = matMul(result, current)
    current = matMul(current, current)
    e >>= 1
  }
  return result
}
```

**总时间复杂度**：O(k³ log n)

### 斐波那契数列的矩阵表示

斐波那契递推关系：F(n) = F(n-1) + F(n-2)

状态转移矩阵：

```
T = | 1  1 |
    | 1  0 |
```

验证：

```
| 1  1 | × | F(n-1) | = | F(n-1) + F(n-2) | = | F(n)   |
| 1  0 |   | F(n-2) |   | F(n-1)           |   | F(n-1) |
```

因此：

```
| F(n)   |       | 1  1 |^(n-1)   | 1 |
| F(n-1) |   =   | 1  0 |      ×  | 0 |
```

## 可视化说明

矩阵快速幂的过程可以分解为以下步骤：

```
步骤 1: 分解指数
  n = 13 → 1101₂ → 需要 a^8, a^4, a^1

步骤 2: 反复平方
  T^1 = T
  T^2 = T^1 × T^1
  T^4 = T^2 × T^2
  T^8 = T^4 × T^4

步骤 3: 合并结果
  T^13 = T^8 × T^4 × T^1
         (第3位=1)(第2位=1)(第0位=1)
```

在可视化中，你可以：
- 观察每一步矩阵平方的结果
- 查看哪些矩阵被选中（对应二进制位为 1）
- 理解最终矩阵是如何组合得到的

## 常见错误

### 1. 单位矩阵初始化错误

```typescript
// 错误：使用零矩阵作为初始结果
let result = Array.from({ length: n }, () => new Array(n).fill(0))

// 正确：使用单位矩阵
let result = Array.from({ length: n }, (_, i) =>
  Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
)
```

### 2. 转移矩阵构造错误

```typescript
// 错误：F(n) = F(n-1) + F(n-2) 的转移矩阵写成
const T = [[0, 1], [1, 1]]  // 列顺序错误

// 正确：根据状态向量 [F(n-1), F(n-2)]^T 构造
const T = [[1, 1], [1, 0]]
```

### 3. 忘记取模

```typescript
// 错误：结果溢出
C[i][j] += A[i][p] * B[p][j]

// 正确：每步取模
C[i][j] = (C[i][j] + A[i][p] * B[p][j]) % MOD
```

### 4. 指数处理不当

```typescript
// 错误：对于斐波那契，n=0 或 n=1 时直接进入矩阵幂运算
function fib(n: number): number {
  const Tn = matPow([[1,1],[1,0]], n - 1)  // n=0 时 n-1=-1，出错
  return Tn[0][0]
}

// 正确：特判边界情况
function fib(n: number): number {
  if (n <= 0) return 0
  if (n === 1) return 1
  const Tn = matPow([[1,1],[1,0]], n - 1)
  return Tn[0][0]
}
```

## 实际应用

### 1. 高效计算斐波那契数列

直接计算第 10¹⁸ 项斐波那契数，矩阵快速幂仅需约 60 次矩阵乘法：

```typescript
function fib(n: number, mod: number): number {
  if (n <= 0) return 0
  if (n === 1) return 1
  const T = [[1, 1], [1, 0]]
  const Tn = matPowMod(T, n - 1, mod)
  return Tn[0][0]
}
```

### 2. 图上路径计数

有向图的邻接矩阵 A，A^k 的第 (i,j) 项表示从节点 i 到节点 j 恰好经过 k 条边的路径数：

```typescript
function countPaths(adj: number[][], k: number): number[][] {
  return matPow(adj, k)
}
```

### 3. 字符串计数问题

问题：长度为 n 的字符串，由字符 {A, B, C} 组成，要求不出现连续的 "AB"。

构造转移矩阵，行和列分别代表末尾字符为 A、B、C 的状态：

```
T = | 1  0  1 |    // 上一个为 A，下一个可以是 A 或 C（不能是 B）
    | 1  0  1 |    // 上一个为 B，下一个可以是 A 或 C
    | 1  1  1 |    // 上一个为 C，下一个可以是任意
```

答案为 T^n 所有元素之和。

### 4. 动态规划状态压缩

某些 DP 问题的状态转移只依赖于固定的前 k 个状态，可以用矩阵快速幂优化：

- 带限制的铺砖问题
- 特定模式的字符串计数
- 状态机上的路径计数

## 总结

矩阵快速幂是一种强大的算法技巧：

**核心优势**：
- 将 O(n) 的线性递推优化为 O(k³ log n)
- 对于超大 n（如 10¹⁸）仍然高效
- 框架统一，适用范围广

**适用条件**：
- 问题可以表示为线性递推关系
- 递推的阶数 k 较小（通常 k ≤ 20）
- 需要计算递推的第 n 项，n 可以非常大

**复杂度分析**：
- 时间复杂度：O(k³ log n)
- 空间复杂度：O(k²) 存储矩阵

**注意事项**：
- 正确构造转移矩阵是关键
- 边界情况需要特判
- 大数运算需要取模防止溢出

理解矩阵快速幂是掌握高级算法技巧的重要一步，它将代数（矩阵运算）与算法（快速幂）完美结合，是算法竞赛中的常见考点。
