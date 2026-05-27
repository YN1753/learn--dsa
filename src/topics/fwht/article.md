# FWHT 快速沃尔什变换

## 概念解释

**快速沃尔什变换**（Fast Walsh-Hadamard Transform，FWHT）是一种处理**位运算卷积**的高效算法。与 FFT 处理普通多项式乘法类似，FWHT 可以在 O(n log n) 的时间内计算以下三种卷积：

- **OR 卷积**：c[k] = Σ (i|j=k) a[i] * b[j]
- **AND 卷积**：c[k] = Σ (i&j=k) a[i] * b[j]
- **XOR 卷积**：c[k] = Σ (i^j=k) a[i] * b[j]

其中 n = 2^N，N 是二进制位数。

### 核心思想

直接计算位运算卷积需要 O(3^N) 或 O(n^2) 的时间。FWHT 通过**沃尔什-哈达玛矩阵**（Walsh-Hadamard Matrix）将序列变换到另一个域，在该域中卷积变成逐点乘法，从而将复杂度降至 O(n log n)。

整体流程与 FFT 完全类似：

```
正变换 -> 逐点乘法 -> 逆变换
FWHT(a) * FWHT(b) -> IFWHT -> 卷积结果
```

### 关键术语

| 术语 | 说明 |
|------|------|
| Walsh-Hadamard 变换 | 基于 Hadamard 矩阵的正交变换 |
| OR 卷积 | 下标满足 i OR j = k 的求和 |
| AND 卷积 | 下标满足 i AND j = k 的求和 |
| XOR 卷积 | 下标满足 i XOR j = k 的求和 |
| 蝶形运算 | FWHT 的基本计算单元，类似 FFT 的蝶形运算 |

## 为什么重要

FWHT 在算法竞赛和理论计算机科学中是不可或缺的工具：

1. **子集卷积优化**：将朴素 O(3^N) 的子集卷积降至 O(N * 2^N)
2. **位运算计数**：高效处理涉及 OR/AND/XOR 的计数问题
3. **图计数问题**：计算满足特定位运算条件的路径或子图数量
4. **概率 DP 优化**：将涉及位运算的状态转移转化为卷积
5. **集合幂级数**：处理集合上的代数运算

在竞赛中，当题目涉及「两个数的 OR/AND/XOR 等于某个值」这类条件求和时，FWHT 几乎是唯一可行的高效解法。

## 核心原理

### Walsh-Hadamard 变换矩阵

FWHT 的数学基础是 Walsh-Hadamard 矩阵。对于长度 n = 2^N，变换矩阵 H 满足 H * H = n * I（I 是单位矩阵）。

#### OR 变换

OR 变换的矩阵元素为：H[i][j] = 1 当且仅当 (i AND j) = j，否则为 0。即 j 是 i 的子集。

**正变换（逐级蝶形）：**

```
对于每一级 len = 2, 4, 8, ..., n:
  对于每个长度为 len 的块:
    对于块的前半部分 j:
      a[j] = a[j] + a[j + len/2]   (保留原值 + 加上配对值)
```

**逆变换：**

```
对于每一级 len = 2, 4, 8, ..., n:
  对于每个长度为 len 的块:
    对于块的前半部分 j:
      a[j] = a[j] - a[j + len/2]   (减去配对值)
```

#### AND 变换

AND 变换与 OR 变换方向相反：

**正变换：**

```
对于每一级 len = 2, 4, 8, ..., n:
  对于每个长度为 len 的块:
    对于块的后半部分 j:
      a[j] = a[j] + a[j - len/2]   (加上配对值)
```

**逆变换：**

```
对于每一级 len = 2, 4, 8, ..., n:
  对于每个长度为 len 的块:
    对于块的后半部分 j:
      a[j] = a[j] - a[j - len/2]   (减去配对值)
```

#### XOR 变换

XOR 变换基于 Hadamard 矩阵，蝶形运算同时更新两个位置：

**正变换：**

```
对于每一级 len = 2, 4, 8, ..., n:
  对于每个长度为 len 的块:
    对于块的前半部分 j:
      u = a[j], v = a[j + len/2]
      a[j] = u + v          (和)
      a[j + len/2] = u - v  (差)
```

**逆变换：** 与正变换相同，最后每个元素除以 n。

### 与 FFT 的关系

FWHT 和 FFT 的核心思想完全一致：

| 对比项 | FFT | FWHT |
|--------|-----|------|
| 变换矩阵 | DFT 矩阵（单位根） | Hadamard 矩阵（+1/-1） |
| 运算域 | 复数域 | 实数域（整数） |
| 蝶形运算 | 乘旋转因子后加减 | 直接加减 |
| 精度 | 浮点误差 | 精确（整数运算） |
| 适用问题 | 多项式乘法 | 位运算卷积 |

FWHT 可以看作 FFT 在有限域上的「简化版本」——旋转因子只有 +1 和 -1，不需要复数运算。

### 蝶形运算图示（XOR，N=4）

```
输入: [a0, a1, a2, a3]

第1级 (len=2):
  [a0, a1, a2, a3]
   ↓       ↓
  a0+a1   a0-a1   a2+a3   a2-a3

第2级 (len=4):
  [a0+a1, a0-a1, a2+a3, a2-a3]
   ↓              ↓
  (a0+a1)+(a2+a3)  (a0-a1)+(a2-a3)  (a0+a1)-(a2+a3)  (a0-a1)-(a2-a3)

最终结果 = FWHT(a)
```

### 代码实现

```typescript
// OR 卷积
function fwhtOr(a: number[], invert: boolean): void {
  const n = a.length
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1
    for (let i = 0; i < n; i += len) {
      for (let j = 0; j < half; j++) {
        if (invert) {
          a[i + j] -= a[i + j + half]
        } else {
          a[i + j] += a[i + j + half]
        }
      }
    }
  }
}

// AND 卷积
function fwhtAnd(a: number[], invert: boolean): void {
  const n = a.length
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1
    for (let i = 0; i < n; i += len) {
      for (let j = 0; j < half; j++) {
        if (invert) {
          a[i + j + half] -= a[i + j]
        } else {
          a[i + j + half] += a[i + j]
        }
      }
    }
  }
}

// XOR 卷积
function fwhtXor(a: number[], invert: boolean): void {
  const n = a.length
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1
    for (let i = 0; i < n; i += len) {
      for (let j = 0; j < half; j++) {
        const u = a[i + j]
        const v = a[i + j + half]
        a[i + j] = u + v
        a[i + j + half] = u - v
      }
    }
  }
  if (invert) {
    for (let i = 0; i < n; i++) {
      a[i] /= n
    }
  }
}
```

### 卷积计算流程

```typescript
function convolution(
  a: number[],
  b: number[],
  transform: (a: number[], invert: boolean) => void
): number[] {
  const n = a.length
  const fa = [...a]
  const fb = [...b]

  // 正变换
  transform(fa, false)
  transform(fb, false)

  // 逐点相乘
  for (let i = 0; i < n; i++) {
    fa[i] *= fb[i]
  }

  // 逆变换
  transform(fa, true)

  return fa
}
```

## 可视化说明

可视化界面展示了 FWHT 的**蝶形运算过程**：

- **左侧**：输入数组的当前状态
- **连线**：蝶形运算的数据依赖关系
- **高亮**：当前正在计算的元素对
- **三种模式**：OR、AND、XOR 变换可切换

通过动画可以观察：

- 每一级蝶形运算如何成对合并元素
- OR/AND/XOR 三种变换的蝶形方向差异
- 逆变换如何还原原始数组

## 常见错误

### 1. OR 和 AND 变换公式搞混

OR 变换更新**前半部分**（a[j] += a[j + half]），AND 变换更新**后半部分**（a[j + half] += a[j]）。两者方向相反，搞混会导致错误结果。

```typescript
// 错误：OR 变换写成了 AND 的方向
// OR 应该更新前半部分
a[i + j] += a[i + j + half]  // 正确 (OR)
a[i + j + half] += a[i + j]  // 这是 AND！
```

### 2. 逆变换忘记除以 n（XOR）

XOR 变换的逆变换需要最后将每个元素除以 n。OR 和 AND 的逆变换不需要除法（通过减法实现）。

```typescript
// XOR 逆变换
if (invert) {
  for (let i = 0; i < n; i++) {
    a[i] /= n  // 忘记这步会导致结果放大 n 倍
  }
}
```

### 3. XOR 卷积符号错误

XOR 蝶形运算是 a[j] = u + v, a[j + half] = u - v。如果写成 a[j] = u - v, a[j + half] = u + v，结果会不同（相当于做了不同顺序的变换）。

### 4. 数组长度不是 2 的幂

FWHT 要求输入长度为 2 的幂。如果原始数据长度不是，需要补零。

```typescript
// 正确做法：补零到 2 的幂
const n = 1 << Math.ceil(Math.log2(Math.max(a.length, b.length)))
const fa = new Array(n).fill(0)
const fb = new Array(n).fill(0)
for (let i = 0; i < a.length; i++) fa[i] = a[i]
for (let i = 0; i < b.length; i++) fb[i] = b[i]
```

### 5. 混淆正变换和逆变换

OR/AND 的正变换和逆变换的区别仅在于加法变减法。如果正逆搞反，卷积结果会错误。

## 实际应用

### 1. 子集卷积

给定两个集合上的函数 f(S) 和 g(S)，计算 h(T) = Σ (A∪B=T, A∩B=∅) f(A) * g(B)。

可以拆分为：先按集合大小分层，每层内做 OR 卷积，时间复杂度从 O(3^N) 降至 O(N^2 * 2^N)。

### 2. 位运算计数

例如：给定数组，求有多少对 (i, j) 满足 a[i] OR a[j] = k。将数组转为频次数组后做 OR 卷积即可。

### 3. 图计数问题

在某些图论问题中，需要计算满足特定位运算条件的路径数量。FWHT 可以将暴力枚举优化为卷积计算。

### 4. 概率 DP 优化

当 DP 的状态转移涉及位运算（如异或和、或和），可以将转移过程建模为卷积，用 FWHT 加速。

### 5. 集合幂级数

在组合数学中，集合幂级数的乘法运算本质上就是子集卷积，FWHT 是其核心计算工具。

## 总结

FWHT 是处理位运算卷积的标准算法工具：

**核心价值**：

- 将位运算卷积从 O(n^2) 优化到 O(n log n)
- 支持 OR、AND、XOR 三种卷积类型
- 整数运算，无精度问题

**关键思想**：

- Walsh-Hadamard 变换：位运算域上的正交变换
- 蝶形运算：逐级合并，类似 FFT
- 变换域乘法：卷积定理在位运算域上的推广

**适用场景**：

- 涉及 OR/AND/XOR 条件的计数问题
- 子集卷积和集合幂级数
- 竞赛中的位运算优化 DP

FWHT 与 FFT/NTT 共享相同的「变换-乘法-逆变换」范式，理解 FWHT 有助于深入理解这一系列变换算法的统一本质。
