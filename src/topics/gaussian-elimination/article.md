# 高斯消元 (Gaussian Elimination)

## 概念解释

高斯消元法是求解**线性方程组**的经典算法，由数学家高斯（Carl Friedrich Gauss）提出。其核心思想是通过**行变换**将方程组的系数矩阵化为**行阶梯形**（Row Echelon Form），从而逐步求解未知数。

对于一个 n 元线性方程组：

```
a₁₁x₁ + a₁₂x₂ + ... + a₁ₙxₙ = b₁
a₂₁x₁ + a₂₂x₂ + ... + a₂ₙxₙ = b₂
...
aₙ₁x₁ + aₙ₂x₂ + ... + aₙₙxₙ = bₙ
```

可以表示为增广矩阵 `[A | b]`，通过高斯消元将其化简为上三角形式后回代求解。

### 基本术语

| 术语 | 说明 |
|------|------|
| 增广矩阵 | 系数矩阵 A 与常数向量 b 合并形成的矩阵 |
| 主元 (Pivot) | 每行对角线上的非零元素，用于消去该列其余元素 |
| 行阶梯形 | 每行首个非零元素（主元）在其上方行的主元右侧 |
| 行最简形 | 行阶梯形中所有主元为 1，且主元所在列其余元素全为 0 |

## 为什么重要

高斯消元在计算机科学和工程中有广泛的应用：

1. **解线性方程组**：最基础的应用，工程计算中无处不在
2. **矩阵求逆**：通过 `[A | I]` 消元得到 `[I | A⁻¹]`
3. **求矩阵的秩**：消元后非零行的数量即为矩阵的秩
4. **求行列式**：消元后主元的乘积（考虑行交换的符号）
5. **竞赛中的异或方程组**：利用 XOR 的性质高效求解 01 方程组

## 核心原理

### 三种基本行变换

高斯消元使用以下三种行变换，这些变换**不改变方程组的解**：

1. **交换两行**：`Ri <-> Rj`
2. **某行乘以非零常数**：`Ri <- k * Ri`（k ≠ 0）
3. **将某行的倍数加到另一行**：`Ri <- Ri + k * Rj`

### 算法步骤

```typescript
function gaussianElimination(matrix: number[][]): number[] {
  const n = matrix.length
  const m = matrix[0].length

  // 消元阶段：化为行阶梯形
  let pivotRow = 0
  for (let col = 0; col < m - 1 && pivotRow < n; col++) {
    // 1. 选取主元：找当前列中绝对值最大的行
    let maxRow = pivotRow
    for (let row = pivotRow + 1; row < n; row++) {
      if (Math.abs(matrix[row][col]) > Math.abs(matrix[maxRow][col])) {
        maxRow = row
      }
    }
    if (Math.abs(matrix[maxRow][col]) < 1e-10) continue // 跳过全零列

    // 2. 交换行
    [matrix[pivotRow], matrix[maxRow]] = [matrix[maxRow], matrix[pivotRow]]

    // 3. 消元：将当前列下方的元素消为 0
    for (let row = pivotRow + 1; row < n; row++) {
      const factor = matrix[row][col] / matrix[pivotRow][col]
      for (let j = col; j < m; j++) {
        matrix[row][j] -= factor * matrix[pivotRow][j]
      }
    }
    pivotRow++
  }

  // 回代阶段：从下往上求解
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    x[i] = matrix[i][m - 1]
    for (let j = i + 1; j < n; j++) {
      x[i] -= matrix[i][j] * x[j]
    }
    x[i] /= matrix[i][i]
  }
  return x
}
```

### 主元选取（列主元消去法）

为了减少数值误差，通常选择当前列中**绝对值最大**的元素作为主元，称为「列主元消去法」（Partial Pivoting）。这样可以避免除以接近 0 的数导致的精度问题。

### 解的判定

消元完成后，可以通过增广矩阵判断方程组的解的情况：

| 条件 | 结论 |
|------|------|
| 秩(A) = 秩(A\|b) = n | 唯一解 |
| 秩(A) = 秩(A\|b) < n | 无穷多解 |
| 秩(A) < 秩(A\|b) | 无解 |

具体判断：如果消元后出现 `[0, 0, ..., 0 | b]`（b ≠ 0）的行，则无解；如果主元个数小于未知数个数，则有无穷多解（自由变量）。

### 时间复杂度

- **消元阶段**：O(n^3) — 对每列进行消元，共 n 列，每列消去 n 行，每行需要 n 次操作
- **回代阶段**：O(n^2) — 从下往上依次求解
- **总复杂度**：O(n^3)

## 可视化说明

在可视化界面中，高斯消元的过程通过矩阵的行变换来展示：

```
初始矩阵:           消元后 (行阶梯形):
[2  1  -1 | 8]      [2  1  -1 | 8 ]
[-3 -1  2 | -11]    [0  0.5 0.5| 1 ]
[-2  1  2 | -3]     [0  0   -1 | 1 ]
```

通过逐步观察：
- 主元的选择和行交换
- 每次消元操作如何将一列下方的元素变为 0
- 回代过程如何从最后一行开始逐个求解变量

## 常见错误

### 1. 忘记行交换

当主元为 0 时，必须尝试与下方的行交换。如果整列都为 0，应跳过该列。

### 2. 精度问题

浮点数计算中，除以接近 0 的数会导致严重误差。应使用列主元消去法避免。

### 3. 增广矩阵处理

消元时必须对增广矩阵的**整行**（包括常数项 b）进行操作，不能只变换系数部分。

### 4. 解的个数判断

消元后不能直接认为有唯一解。必须检查：
- 是否有矛盾方程（0 = b，b ≠ 0）
- 主元个数是否等于未知数个数

## 实际应用

### 1. 工程计算

结构力学、电路分析、流体力学等领域的方程组求解都依赖高斯消元。

### 2. 计算机图形学

3D 变换矩阵求解、光线追踪中的交点计算等。

### 3. 竞赛中的异或方程组

在算法竞赛中，经常会遇到系数只有 0 和 1 的异或方程组。例如 n 个灯的开关问题：每个灯有两种状态（开/关），按下一个开关会改变若干灯的状态，求如何操作使所有灯都关闭。

```typescript
// GF(2) 上的高斯消元
function xorGaussianElimination(matrix: number[][]): number[] | null {
  const n = matrix.length
  const m = matrix[0].length
  let rank = 0

  for (let col = 0; col < m - 1 && rank < n; col++) {
    // 找主元
    let pivotRow = -1
    for (let row = rank; row < n; row++) {
      if (matrix[row][col] === 1) {
        pivotRow = row
        break
      }
    }
    if (pivotRow === -1) continue

    // 交换
    [matrix[rank], matrix[pivotRow]] = [matrix[pivotRow], matrix[rank]]

    // 消元（用 XOR 代替减法）
    for (let row = 0; row < n; row++) {
      if (row !== rank && matrix[row][col] === 1) {
        for (let j = col; j < m; j++) {
          matrix[row][j] ^= matrix[rank][j]
        }
      }
    }
    rank++
  }

  // 检查是否有解
  for (let row = 0; row < n; row++) {
    let allZero = true
    for (let col = 0; col < m - 1; col++) {
      if (matrix[row][col] !== 0) { allZero = false; break }
    }
    if (allZero && matrix[row][m - 1] !== 0) return null // 无解
  }

  // 提取解
  const x = new Array(m - 1).fill(0)
  for (let row = 0; row < rank; row++) {
    for (let col = 0; col < m - 1; col++) {
      if (matrix[row][col] === 1) {
        x[col] = matrix[row][m - 1]
        break
      }
    }
  }
  return x
}
```

### 4. 概率异或方程组

在某些问题中，异或方程组的系数是随机的，或者需要求解满足特定概率条件的方程组。这类问题在密码学和编码理论中有重要应用。概率异或方程组通常关注：
- 方程组有解的概率
- 解的期望个数
- 随机矩阵满秩的概率

## 总结

高斯消元是一种基础而强大的线性代数算法：

**优点**：
- 理论成熟，实现简单
- 时间复杂度 O(n^3)，对中小规模问题效率很高
- 适用范围广：实数、整数、GF(2) 等各种域

**缺点**：
- 浮点运算存在精度问题
- 对于大规模稀疏矩阵，效率不如迭代法
- 不适合病态矩阵（条件数很大）

**适用场景**：
- 中小规模线性方程组求解
- 矩阵求秩、求逆
- 竞赛中的异或方程组
- 密码学中的线性方程问题

理解高斯消元是学习更高级线性代数算法（如 LU 分解、QR 分解）的基础，也是算法竞赛中处理线性问题的核心工具。
