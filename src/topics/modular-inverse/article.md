# 模逆元 (Modular Inverse)

## 概念解释

在普通数学中，一个数 a 的乘法逆元是 1/a，因为 a × (1/a) = 1。在模运算的世界里，我们也有类似的概念：

**模逆元**的定义：如果存在整数 x，使得：

```
a × x ≡ 1 (mod m)
```

则 x 称为 a 在模 m 下的**乘法逆元**，记作 a⁻¹ mod m。

### 直观理解

想象一个时钟只有 m 个刻度（0 到 m-1）。模逆元 a⁻¹ 就是这样一个数：当你把 a 和 a⁻¹ 相乘后，在时钟上走一圈，最终刚好停在刻度 1 上。

### 基本术语

| 术语 | 说明 |
|------|------|
| 模逆元 a⁻¹ | 满足 a × a⁻¹ ≡ 1 (mod m) 的整数 |
| 互质 | gcd(a, m) = 1，即 a 和 m 没有公共因子（除了 1） |
| 费马小定理 | 若 p 是质数，则 a^(p-1) ≡ 1 (mod p) |
| 贝祖等式 | ax + by = gcd(a, b)，扩展欧几里得算法的基础 |

### 存在条件

a 在模 m 下存在逆元的**充要条件**是 gcd(a, m) = 1（a 和 m 互质）。

为什么？由贝祖定理，方程 ax + my = gcd(a, m) 一定有整数解。当 gcd(a, m) = 1 时：

```
ax + my = 1
```

两边对 m 取模，my 变成 0，得到 ax ≡ 1 (mod m)，即 x 是 a 的逆元。

如果 gcd(a, m) ≠ 1，那么 ax mod m 只能是 gcd(a, m) 的倍数，永远无法等于 1。

## 为什么重要

模逆元是数论和算法竞赛中的基础工具，原因在于：

### 1. 模运算下没有"除法"

在普通算术中，a / b = a × (1/b)。但在模运算中：

```
(a / b) mod m ≠ (a mod m) / (b mod m)
```

模运算中除法的正确做法是：

```
(a / b) mod m = (a × b⁻¹) mod m
```

即把除法转化为乘以逆元。

### 2. 组合数计算

组合数公式 C(n, k) = n! / (k! × (n-k)!) 包含除法。在竞赛中经常需要计算 C(n, k) mod p，必须用逆元将除法转化为乘法：

```
C(n, k) mod p = (n! × (k!)⁻¹ × ((n-k)!)⁻¹) mod p
```

### 3. 分数方程求解

当方程中出现分数时，在模意义下需要将分母替换为逆元。

### 4. 密码学基础

RSA 等加密算法的核心运算依赖模逆元的计算。

## 核心原理

求模逆元有两种主要方法。

### 方法一：扩展欧几里得算法

扩展欧几里得算法可以求解 ax + by = gcd(a, b) 的整数解 (x, y)。

当 gcd(a, m) = 1 时，求解 ax + my = 1，得到的 x 就是 a 在模 m 下的逆元。

**算法步骤**：

```
1. 使用扩展欧几里得算法求解 ax + my = 1
2. 得到 x
3. 逆元 = ((x % m) + m) % m  // 确保结果为非负数
```

**代码实现**：

```typescript
function extendedGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0]
  const [g, x1, y1] = extendedGcd(b, a % b)
  return [g, y1, x1 - Math.floor(a / b) * y1]
}

function modInverse(a: number, m: number): number | null {
  const [g, x] = extendedGcd(a, m)
  if (g !== 1) return null  // 逆元不存在
  return ((x % m) + m) % m
}
```

**时间复杂度**：O(log(min(a, m)))

### 方法二：费马小定理

当模数 m 是质数（通常记为 p）时，可以用费马小定理：

```
a^(p-1) ≡ 1 (mod p)  （p 是质数，gcd(a, p) = 1）
```

两边同除以 a（即乘以 a 的逆元）：

```
a^(p-2) ≡ a⁻¹ (mod p)
```

所以 a 在模 p 下的逆元就是 a^(p-2) mod p，用快速幂计算。

**代码实现**：

```typescript
function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base = ((base % mod) + mod) % mod
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod
    base = (base * base) % mod
    exp >>= 1
  }
  return result
}

function modInverseFermat(a: number, p: number): number {
  // p 必须是质数
  return modPow(a, p - 2, p)
}
```

**时间复杂度**：O(log p)

### 两种方法对比

| 特性 | 扩展欧几里得 | 费马小定理 |
|------|-------------|-----------|
| 模数要求 | gcd(a, m) = 1 即可 | m 必须是质数 |
| 时间复杂度 | O(log m) | O(log m) |
| 实现方式 | 递归或迭代 | 快速幂 |
| 适用范围 | 更通用 | 竞赛中常用（配合 10^9+7 等质数模） |

### 计算示例

求 3 在模 7 下的逆元：

**方法一（扩展欧几里得）**：
```
gcd(3, 7): 7 = 3×2 + 1, 3 = 1×3 + 0
回溯: 1 = 7 - 3×2 = 7×1 + 3×(-2)
x = -2, 取模: (-2 + 7) = 5
验证: 3 × 5 = 15 ≡ 1 (mod 7) ✓
```

**方法二（费马小定理）**：
```
3^(7-2) = 3^5 = 243
243 mod 7 = 243 - 34×7 = 243 - 238 = 5
验证: 3 × 5 = 15 ≡ 1 (mod 7) ✓
```

两种方法都得到逆元为 5。

## 可视化说明

在可视化界面中，模逆元的求解过程被直观展示：

- **等式展示**：显示 a × x ≡ 1 (mod m) 的方程
- **两种方法切换**：可以分别查看扩展欧几里得和费马小定理的计算过程
- **步骤分解**：每一步的中间计算都清晰展示
- **验证过程**：最终验证 a × result ≡ 1 (mod m)

通过可视化可以理解：
- 扩展欧几里得的递归回溯过程
- 费马小定理的快速幂分解
- 为什么需要取模保证结果非负
- 逆元不存在的情况（gcd ≠ 1）

## 常见错误

### 1. 忘记检查逆元是否存在

```typescript
// 错误：不检查 gcd 就直接求逆元
function badModInverse(a: number, m: number): number {
  const [g, x] = extendedGcd(a, m)
  return ((x % m) + m) % m  // 如果 g ≠ 1，结果无意义
}

// 正确：先检查互质
function goodModInverse(a: number, m: number): number | null {
  const [g, x] = extendedGcd(a, m)
  if (g !== 1) return null  // 逆元不存在
  return ((x % m) + m) % m
}
```

### 2. 结果可能是负数

```typescript
// 错误：直接返回 x
function wrongInverse(a: number, m: number): number {
  const [g, x] = extendedGcd(a, m)
  if (g !== 1) throw new Error('No inverse')
  return x  // x 可能是负数！
}

// 正确：取模保证非负
function correctInverse(a: number, m: number): number {
  const [g, x] = extendedGcd(a, m)
  if (g !== 1) throw new Error('No inverse')
  return ((x % m) + m) % m  // 确保在 [0, m) 范围内
}
```

### 3. 费马小定理用于非质数模

```typescript
// 错误：对非质数模使用费马小定理
modInverseFermat(3, 12)  // 12 不是质数，费马小定理不适用！

// 正确：费马小定理只适用于质数模
modInverseFermat(3, 7)   // 7 是质数，结果 = 5

// 非质数模用扩展欧几里得
modInverseGcd(3, 12)     // gcd(3, 12) = 3 ≠ 1，逆元不存在
modInverseGcd(5, 12)     // gcd(5, 12) = 1，逆元 = 5
```

### 4. 快速幂中的溢出问题

```typescript
// 错误：直接乘法可能溢出
function badModPow(base: number, exp: number, mod: number): number {
  let result = 1
  for (let i = 0; i < exp; i++) {
    result = result * base  // 可能溢出！
  }
  return result % mod
}

// 正确：每一步都取模
function goodModPow(base: number, exp: number, mod: number): number {
  let result = 1
  base = ((base % mod) + mod) % mod
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod
    base = (base * base) % mod
    exp >>= 1
  }
  return result
}
```

## 实际应用

### 1. 组合数取模

竞赛中最常见的应用。计算 C(n, k) mod p（p 为质数）：

```typescript
function combMod(n: number, k: number, p: number): number {
  if (k > n) return 0
  if (k === 0 || k === n) return 1

  // 预计算阶乘和逆元
  const fact = new Array(n + 1).fill(1)
  for (let i = 2; i <= n; i++) {
    fact[i] = (fact[i - 1] * i) % p
  }

  // C(n, k) = n! × (k!)^(-1) × ((n-k)!)^(-1) mod p
  const invK = modPow(fact[k], p - 2, p)
  const invNK = modPow(fact[n - k], p - 2, p)

  return (((fact[n] * invK) % p) * invNK) % p
}
```

### 2. 分数取模

计算分数表达式在模意义下的值：

```typescript
// 计算 (a/b) mod p
function fractionMod(a: number, b: number, p: number): number {
  const bInv = modInverse(b, p)
  if (bInv === null) throw new Error('Inverse does not exist')
  return (a * bInv) % p
}
```

### 3. 线性同余方程

求解 ax ≡ b (mod m)：

```typescript
function solveLinearCongruence(a: number, b: number, m: number): number | null {
  const aInv = modInverse(a, m)
  if (aInv === null) return null
  return (b * aInv) % m
}
```

### 4. 预计算逆元表

当需要大量求逆元时（如阶乘逆元），可以线性预计算：

```typescript
// 线性求 1 到 n 的逆元（mod p，p 是质数）
function precomputeInverses(n: number, p: number): number[] {
  const inv = new Array(n + 1).fill(0)
  inv[1] = 1
  for (let i = 2; i <= n; i++) {
    inv[i] = ((-(p / i) * inv[p % i]) % p + p) % p
  }
  return inv
}
```

这个技巧的时间复杂度是 O(n)，比对每个数单独求逆元的 O(n log p) 更快。

## 总结

模逆元是模运算中"除法"的替代方案，是数论和算法竞赛中的核心概念。

**核心要点**：

- 模逆元 a⁻¹ 满足 a × a⁻¹ ≡ 1 (mod m)
- 存在条件：gcd(a, m) = 1
- 两种求法：扩展欧几里得（通用）和费马小定理（质数模）
- 时间复杂度均为 O(log m)

**关键应用**：

- 组合数取模 C(n, k) mod p
- 分数在模意义下的计算
- 线性同余方程求解
- RSA 等密码学算法

**学习建议**：

- 先理解为什么模运算中不能直接做除法
- 掌握扩展欧几里得算法的原理
- 了解费马小定理的推导过程
- 练习组合数取模等经典应用
