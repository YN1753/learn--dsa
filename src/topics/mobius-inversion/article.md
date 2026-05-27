# 莫比乌斯反演 (Mobius Inversion)

## 概念解释

莫比乌斯反演是数论中一种强大的**反演技术**，它允许我们在两个数论函数之间进行转换。其核心思想是：

> 如果已知函数 f(n) 可以表示为 g(d) 在 n 的因子 d 上的求和，那么反过来也可以用 f 来表示 g。

### 莫比乌斯函数 μ(n)

莫比乌斯函数 μ(n) 是定义在正整数上的数论函数：

```
μ(1) = 1
μ(n) = 0，如果 n 有平方因子（即存在质数 p 使得 p^2 | n）
μ(n) = (-1)^k，如果 n 是 k 个不同质数的乘积
```

**前几个值：**

| n | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| μ(n) | 1 | -1 | -1 | 0 | -1 | 1 | -1 | 0 | 0 | 1 |

- μ(6) = μ(2×3) = (-1)^2 = 1（两个不同质数）
- μ(8) = 0（8 = 2^3，有平方因子 4）
- μ(10) = μ(2×5) = (-1)^2 = 1

### 反演公式

**莫比乌斯反演定理**：

如果对于所有正整数 n，有：

```
f(n) = Σ g(d)    （对 n 的所有正因子 d 求和）
```

那么：

```
g(n) = Σ μ(d) · f(n/d)    （对 n 的所有正因子 d 求和）
```

等价形式（换元 t = n/d）：

```
g(n) = Σ μ(n/t) · f(t)    （对 n 的所有正因子 t 求和）
```

## 为什么重要

莫比乌斯反演在数论和算法竞赛中极其重要：

1. **求和转化**：将难以直接计算的求和转化为更容易处理的形式
2. **容斥推广**：莫比乌斯反演本质上是容斥原理在数论上的推广
3. **GCD 计数**：解决涉及最大公约数的计数问题
4. **积性函数**：与积性函数理论紧密结合，可利用线性筛高效计算
5. **竞赛利器**：大量数论题目可以通过莫比乌斯反演简化

## 核心原理

### 1. 莫比乌斯函数的定义

从**质因数分解**的角度理解：

```typescript
// μ(n) 的计算
function mobius(n: number): number {
  let result = 1
  let temp = n
  for (let p = 2; p * p <= temp; p++) {
    if (temp % p === 0) {
      temp /= p
      if (temp % p === 0) return 0  // 有平方因子
      result = -result               // 每个质因子取反
    }
  }
  if (temp > 1) result = -result     // 剩余的大质因子
  return result
}
```

### 2. 狄利克雷卷积

莫比乌斯反演可以简洁地用**狄利克雷卷积**表示。

两个数论函数 f 和 g 的狄利克雷卷积定义为：

```
(f * g)(n) = Σ f(d) · g(n/d)    （d 为 n 的所有正因子）
```

记 e 为单位函数：e(1) = 1, e(n) = 0（当 n > 1）

记 I 为常函数：I(n) = 1

记 id 为恒等函数：id(n) = n

则莫比乌斯函数满足：

```
μ * I = e
```

即：

```
Σ μ(d) = [n == 1]    （对 n 的所有正因子 d 求和）
```

### 3. 反演证明

**正向**：已知 f(n) = Σ g(d)，证明 g(n) = Σ μ(d) · f(n/d)

```
Σ μ(d) · f(n/d)
= Σ μ(d) · Σ g(k)       （其中 k | (n/d)）
= Σ g(k) · Σ μ(d)       （交换求和顺序，其中 d | (n/k)）
= Σ g(k) · [n/k == 1]    （利用 μ * I = e）
= g(n)
```

### 4. 常见变换技巧

**技巧一：提取公因子**

```
Σ [gcd(i,j) == 1]    （1 <= i <= n, 1 <= j <= m）
= Σ Σ [gcd(i,j) == 1]
= Σ Σ Σ μ(d) · [d|i] · [d|j]
= Σ μ(d) · floor(n/d) · floor(m/d)
```

**技巧二：整除分块优化**

当需要计算 Σ μ(d) · floor(n/d) · floor(m/d) 时，floor(n/d) 和 floor(m/d) 的值在连续区间内不变，可以用整除分块将 O(n) 优化到 O(sqrt(n))。

### 5. 线性筛求 μ 函数

```typescript
function sieveMobius(n: number): number[] {
  const mu = new Array(n + 1).fill(0)
  const primes: number[] = []
  const isComposite = new Array(n + 1).fill(false)
  mu[1] = 1

  for (let i = 2; i <= n; i++) {
    if (!isComposite[i]) {
      primes.push(i)
      mu[i] = -1  // 质数的 μ 值为 -1
    }
    for (const p of primes) {
      if (i * p > n) break
      isComposite[i * p] = true
      if (i % p === 0) {
        mu[i * p] = 0    // i*p 有平方因子 p^2
        break
      } else {
        mu[i * p] = -mu[i]  // 多一个质因子，符号取反
      }
    }
  }
  return mu
}
```

## 可视化说明

在可视化界面中：

- **μ 值表格**：展示前 N 个数的莫比乌斯函数值，用颜色区分正、负、零
- **因子关系**：展示 n 的因子分解与 μ 值的关系
- **反演过程**：逐步演示从 f(n) = Σ g(d) 到 g(n) = Σ μ(d)f(n/d) 的推导
- **整除分块**：可视化 floor(n/d) 的分块结构

## 常见错误

### 1. μ 函数符号错误

```typescript
// 错误：忘记判断平方因子
function wrongMobius(n: number): number {
  let count = 0
  let temp = n
  for (let p = 2; p * p <= temp; p++) {
    while (temp % p === 0) {
      temp /= p
      count++
    }
  }
  if (temp > 1) count++
  return count % 2 === 0 ? 1 : -1  // 错误！没有判断平方因子
}

// 正确：先判断是否有平方因子
function correctMobius(n: number): number {
  let result = 1
  let temp = n
  for (let p = 2; p * p <= temp; p++) {
    if (temp % p === 0) {
      temp /= p
      if (temp % p === 0) return 0  // 有平方因子，直接返回 0
      result = -result
    }
  }
  if (temp > 1) result = -result
  return result
}
```

### 2. 求和上下界搞错

```typescript
// 错误：对 1..n 求和而不是对 n 的因子求和
function wrongInversion(f: number[], n: number): number {
  let result = 0
  for (let d = 1; d <= n; d++) {  // 应该只遍历 n 的因子
    result += mobius(d) * f[n / d]
  }
  return result
}

// 正确：只遍历 n 的因子
function correctInversion(f: number[], n: number): number {
  let result = 0
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      result += mobius(d) * f[n / d]
      if (d !== n / d) {
        result += mobius(n / d) * f[d]
      }
    }
  }
  return result
}
```

### 3. 忘记整除分块优化

```typescript
// 慢：O(n) 遍历
function slowSum(n: number, m: number, mu: number[]): number {
  let result = 0
  for (let d = 1; d <= Math.min(n, m); d++) {
    result += mu[d] * Math.floor(n / d) * Math.floor(m / d)
  }
  return result
}

// 快：O(sqrt(n)) 整除分块
function fastSum(n: number, m: number, mu: number[]): number[] {
  const muPrefix = new Array(mu.length).fill(0)
  for (let i = 1; i < mu.length; i++) {
    muPrefix[i] = muPrefix[i - 1] + mu[i]
  }

  let result = 0
  const limit = Math.min(n, m)
  let l = 1
  while (l <= limit) {
    const r = Math.min(Math.floor(n / Math.floor(n / l)), Math.floor(m / Math.floor(m / l)))
    result += (muPrefix[r] - muPrefix[l - 1]) * Math.floor(n / l) * Math.floor(m / l)
    l = r + 1
  }
  return [result]
}
```

## 实际应用

### 1. GCD 计数问题

求满足 gcd(i, j) = k 的对数 (1 <= i <= n, 1 <= j <= m)：

```
ans(k) = Σ μ(d) · floor(n/(kd)) · floor(m/(kd))
```

### 2. 互质对计数

求满足 gcd(i, j) = 1 的对数：

```
= Σ μ(d) · floor(n/d) · floor(m/d)
```

### 3. 容斥原理推广

莫比乌斯函数的性质 Σ_{d|n} μ(d) = [n==1] 本质上就是容斥原理：

- 包含所有情况（d=1）
- 减去有 1 个质因子的情况（d 为质数）
- 加上有 2 个质因子的情况（d 为两个质数乘积）
- 以此类推...

### 4. 积性函数求和

利用 μ 函数是积性函数的性质，配合线性筛可以在 O(n) 时间内计算大量数论问题。

## 总结

莫比乌斯反演是数论中的核心工具：

**核心公式**：
- f(n) = Σ g(d) 等价于 g(n) = Σ μ(d) · f(n/d)
- 狄利克雷卷积：μ * I = e

**关键技巧**：
- 线性筛预处理 μ 函数，O(n) 时间
- 整除分块优化求和，O(sqrt(n)) 时间
- 提取公因子转化为 μ 函数求和

**适用场景**：
- GCD 相关计数问题
- 互质对计数
- 积性函数前缀和
- 容斥原理的数论版本

掌握莫比乌斯反演需要理解其背后的数学原理，但一旦掌握，它将成为解决数论问题的强大武器。
