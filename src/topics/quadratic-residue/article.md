# 二次剩余 (Quadratic Residue)

## 概念解释

二次剩余是数论中的核心概念之一。简单来说，它研究的是：**在模运算意义下，哪些数可以表示为某个整数的平方？**

### 形式化定义

设 p 是一个奇素数，a 是一个不被 p 整除的整数。如果同余方程：

```
x^2 ≡ a (mod p)
```

存在整数解 x，则称 **a 是模 p 的二次剩余**（Quadratic Residue）；否则称 a 是模 p 的**二次非剩余**（Quadratic Non-Residue）。

### 勒让德符号 (Legendre Symbol)

为了方便表示一个数是否为二次剩余，引入**勒让德符号**：

```
(a/p) = {
  1,   如果 a 是模 p 的二次剩余
  -1,  如果 a 是模 p 的二次非剩余
  0,   如果 p | a
}
```

例如，对于 p = 7：
- 1^2 ≡ 1 (mod 7)，所以 (1/7) = 1
- 2^2 ≡ 4 (mod 7)，所以 (4/7) = 1
- 3^2 ≡ 2 (mod 7)，所以 (2/7) = 1
- 但找不到 x 使得 x^2 ≡ 3 (mod 7)，所以 (3/7) = -1

模 7 的二次剩余集合为 {1, 2, 4}，共 3 个，恰好等于 (p-1)/2 = 3。这并非巧合——对于任意奇素数 p，模 p 的非零二次剩余恰好有 (p-1)/2 个。

### 基本术语

| 术语 | 说明 |
|------|------|
| 二次剩余 (QR) | 可以表示为某整数平方 (mod p) 的数 |
| 二次非剩余 (QNR) | 不能表示为某整数平方 (mod p) 的数 |
| 勒让德符号 (a/p) | 表示 a 相对素数 p 的二次剩余性 |
| 雅可比符号 | 勒让德符号对合数的推广 |
| 二次互反律 | 连接不同素数下勒让德符号的关系 |

## 为什么重要

二次剩余在理论和应用中都有重要地位：

1. **数论基础工具**：二次剩余是理解更高级数论概念（如高次剩余、类域论）的基础
2. **密码学核心**：许多密码方案的安全性依赖于二次剩余问题的困难性，如 Rabin 加密、Goldwasser-Micali 加密、Blum-Blum-Shub 伪随机数生成器
3. **竞赛必备**：信息学竞赛（如 IOI、ACM）中涉及数论的题目经常需要判断二次剩余
4. **椭圆曲线基础**：椭圆曲线上的点运算涉及模平方根的计算，二次剩余理论是其基础

## 核心原理

### 1. 欧拉判别法 (Euler's Criterion)

判断一个数是否为二次剩余的最直接方法：

```
对于奇素数 p 和整数 a（p 不整除 a）：
(a/p) ≡ a^((p-1)/2) (mod p)
```

即：
- 若 a^((p-1)/2) ≡ 1 (mod p)，则 a 是二次剩余
- 若 a^((p-1)/2) ≡ -1 (mod p)，则 a 是二次非剩余

**示例**：判断 2 是否为模 7 的二次剩余
- 2^((7-1)/2) = 2^3 = 8 ≡ 1 (mod 7)
- 因此 2 是模 7 的二次剩余（确实 3^2 = 9 ≡ 2 (mod 7)）

**时间复杂度**：使用快速幂 O(log p)

### 2. Cipolla 算法

当已知 a 是模 p 的二次剩余时，如何求解 x 使得 x^2 ≡ a (mod p)？

**特殊情况**：当 p ≡ 3 (mod 4) 时，可直接计算：
```
x ≡ a^((p+1)/4) (mod p)
```

**一般情况**：使用 Cipolla 算法，核心思想是在扩域 F_{p^2} 中进行运算。

算法步骤：
1. 找到一个 t，使得 t^2 - a 是模 p 的二次非剩余
2. 在扩域 F_{p^2} = F_p[ω]（其中 ω^2 = t^2 - a）中计算
3. 结果 x = (t + ω)^((p+1)/2) 的实部即为所求平方根

```typescript
function cipolla(a: number, p: number): number {
  // 步骤1: 找到合适的 t
  let t = 0
  for (let i = 1; i < p; i++) {
    if (legendreSymbol((i * i - a + p) % p, p) === -1) {
      t = i
      break
    }
  }

  // 步骤2: 在 F_p[w] 中计算 (t + w)^((p+1)/2)
  // w^2 = t^2 - a
  // 使用快速幂，每步维护 (x0, x1) 表示 x0 + x1 * w

  // 步骤3: 返回实部
  return x0
}
```

**时间复杂度**：O(log p)，与快速幂相同

### 3. 二次互反律 (Law of Quadratic Reciprocity)

连接两个不同素数下勒让德符号的深刻关系：

```
对于两个不同的奇素数 p 和 q：
(p/q) * (q/p) = (-1)^(((p-1)/2) * ((q-1)/2))
```

等价表述：
- 若 p ≡ 1 (mod 4) 或 q ≡ 1 (mod 4)，则 (p/q) = (q/p)
- 若 p ≡ q ≡ 3 (mod 4)，则 (p/q) = -(q/p)

配合**补充律**使用：
- (-1/p) = (-1)^((p-1)/2)，即 p ≡ 1 (mod 4) 时为 1，p ≡ 3 (mod 4) 时为 -1
- (2/p) = (-1)^((p^2-1)/8)，即 p ≡ ±1 (mod 8) 时为 1，p ≡ ±3 (mod 8) 时为 -1

二次互反律使得我们可以高效计算任意勒让德符号，而不需要计算幂。

## 可视化说明

在可视化界面中，二次剩余的各组件以交互方式呈现：

- **二次剩余表**：展示模 p 下所有数的二次剩余状态，用颜色区分 QR 和 QNR
- **勒让德符号计算**：输入 a 和 p，动态展示欧拉判别法的计算过程
- **Cipolla 算法**：逐步展示扩域运算的每一步
- **二次互反律**：可视化符号转换过程

通过交互可以直观观察：
- 二次剩余的分布规律（恰好一半）
- 欧拉判别法的幂运算过程
- Cipolla 算法中扩域元素的变换

## 常见错误

### 1. p = 2 的特判遗漏

```typescript
// 错误：直接使用欧拉判别法
function legendre(a: number, p: number): number {
  // 当 p = 2 时，(p-1)/2 = 0，a^0 = 1，总返回 1
  return modPow(a, (p - 1) / 2, p) === 1 ? 1 : -1
}

// 正确：单独处理 p = 2
function legendre(a: number, p: number): number {
  if (p === 2) return a % 2 === 0 ? 0 : 1
  if (a % p === 0) return 0
  return modPow(a, (p - 1) / 2, p) === 1 ? 1 : -1
}
```

### 2. Cipolla 算法中虚数单位选择错误

```typescript
// 错误：未验证 t^2 - a 确实是二次非剩余
let t = 1  // 可能 (t^2 - a) 恰好是二次剩余

// 正确：必须验证
let t = 0
for (let i = 1; i < p; i++) {
  const w2 = (i * i - a + p) % p
  if (legendreSymbol(w2, p) === -1) {  // 必须是非剩余
    t = i
    break
  }
}
```

### 3. 勒让德符号计算中负数处理

```typescript
// 错误：没有正确处理负数
function legendre(a: number, p: number): number {
  return modPow(a, (p - 1) / 2, p)  // a 可能是负数
}

// 正确：先取模
function legendre(a: number, p: number): number {
  a = ((a % p) + p) % p  // 确保 a 在 [0, p) 范围内
  if (a === 0) return 0
  const result = modPow(a, (p - 1) / 2, p)
  return result === p - 1 ? -1 : result
}
```

### 4. 快速幂中间结果溢出

```typescript
// 错误：中间乘法可能溢出
function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base = base % mod
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod  // 可能溢出
    exp = Math.floor(exp / 2)
    base = (base * base) % mod  // 可能溢出
  }
  return result
}

// 正确：使用 BigInt 或乘法取模避免溢出
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n
  base = ((base % mod) + mod) % mod
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod
    exp = exp / 2n
    base = (base * base) % mod
  }
  return result
}
```

## 实际应用

### 1. Blum 整数与 Rabin 加密

**Blum 整数** n = pq，其中 p ≡ q ≡ 3 (mod 4)。这种数有特殊性质：
- 每个二次剩余模 n 恰好有 4 个平方根
- 其中恰好 1 个本身也是二次剩余

**Rabin 加密方案**：安全性基于模合数求平方根的困难性（等价于大整数分解）。

### 2. Blum-Blum-Shub (BBS) 伪随机数生成器

```
x_{n+1} = x_n^2 mod n
输出 x_{n+1} 的最低位
```

BBS 的安全性基于二次剩余假设：区分二次剩余和非剩余在计算上是困难的。

### 3. 零知识证明

二次剩余问题常用于构造零知识证明协议。证明者可以向验证者证明某个数是二次剩余，而不泄露任何关于平方根的信息。

### 4. 竞赛数论题

在信息学竞赛中，二次剩余的典型应用：
- 判断方程 x^2 ≡ a (mod p) 是否有解
- 计算模平方根
- 结合二次互反律快速计算勒让德符号
- 构造满足特定模条件的数

## 总结

二次剩余是数论中的基础而深刻的概念：

**核心知识**：
- 模 p 的非零二次剩余恰好有 (p-1)/2 个
- 欧拉判别法：a^((p-1)/2) ≡ (a/p) (mod p)
- Cipolla 算法：在 O(log p) 时间内求模平方根
- 二次互反律：连接不同素数下的勒让德符号

**重要性质**：
- 二次剩余的乘积仍是二次剩余
- 二次剩余乘以二次非剩余得到二次非剩余
- 二次非剩余的乘积是二次剩余

**学习建议**：
- 先理解勒让德符号和欧拉判别法
- 掌握特殊情况 p ≡ 3 (mod 4) 的直接求解
- 学习 Cipolla 算法处理一般情况
- 熟练运用二次互反律简化计算

二次剩余不仅是优美的数学理论，更是密码学和算法竞赛中的实用工具。理解它，是深入数论世界的重要一步。
