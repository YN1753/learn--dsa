# 卢卡斯定理 (Lucas Theorem)

## 概念解释

卢卡斯定理是组合数学中的一个重要定理，用于高效计算大组合数对素数取模的结果。

**核心公式**：

设 p 为素数，将 n 和 m 表示为 p 进制数：

```
n = n_k * p^k + ... + n_1 * p + n_0
m = m_k * p^k + ... + m_1 * p + m_0
```

则有：

```
C(n, m) mod p = C(n_k, m_k) * C(n_k-1, m_k-1) * ... * C(n_0, m_0) mod p
```

即：

```
C(n, m) mod p = Π C(n_i, m_i) mod p
```

### 直观理解

想象你有 n 个物品，要从中选 m 个。如果 n 和 m 都很大，直接计算 C(n, m) 会溢出。卢卡斯定理告诉我们：可以把这个大问题拆成若干小问题，每个小问题只需要计算 C(n_i, m_i)，其中 n_i 和 m_i 都小于 p。

### 基本术语

| 术语 | 说明 |
|------|------|
| 组合数 C(n, m) | 从 n 个元素中选 m 个的方案数 |
| p 进制分解 | 将整数表示为 p 为基数的形式 |
| 模运算 | 求除法的余数 |
| 逆元 | 乘法逆元，用于除法取模 |

## 为什么重要

卢卡斯定理在算法竞赛和实际应用中具有重要价值：

1. **高效计算大组合数取模**：直接计算 C(10^9, 10^6) mod (10^9+7) 几乎不可能，但卢卡斯定理可以将其分解为小问题
2. **时间复杂度优化**：将 O(n) 降至 O(log_p(n))，其中 p 是模数
3. **竞赛必备**：许多组合计数问题需要求大组合数取模，卢卡斯定理是标准解法
4. **理论基础**：是理解更高级数论工具的基础

### 复杂度对比

| 方法 | 时间复杂度 | 适用范围 |
|------|------------|----------|
| 直接计算 | O(n) | n 较小 |
| 预处理阶乘 | O(n) 预处理，O(1) 查询 | n 中等 |
| 卢卡斯定理 | O(log_p(n)) | n 很大，p 为素数 |
| 扩展卢卡斯 | O(p * log_p(n)) | n 很大，p 不一定是素数 |

## 核心原理

### 1. p 进制分解

将整数 n 转换为 p 进制表示：

```typescript
function toPAdic(n: number, p: number): number[] {
  const digits: number[] = []
  while (n > 0) {
    digits.push(n % p)
    n = Math.floor(n / p)
  }
  return digits  // 从低位到高位
}
```

**示例**：将 15 转换为 3 进制

```
15 / 3 = 5 余 0
5 / 3 = 1 余 2
1 / 3 = 0 余 1

所以 15 = (1, 2, 0)_3 = 1*3^2 + 2*3^1 + 0*3^0
```

### 2. 小组合数计算

对于 C(n_i, m_i)，其中 0 <= n_i, m_i < p，可以直接计算：

```typescript
function combSmall(n: number, m: number): number {
  if (m > n) return 0
  if (m === 0 || m === n) return 1

  // 使用公式 C(n, m) = n! / (m! * (n-m)!)
  let result = 1
  for (let i = 0; i < m; i++) {
    result = result * (n - i) / (i + 1)
  }
  return result
}
```

### 3. 卢卡斯定理递归

```typescript
function lucas(n: number, m: number, p: number): number {
  if (m === 0) return 1

  // 分解为 p 进制
  const ni = n % p
  const mi = m % p

  // 递归计算
  return (combSmall(ni, mi, p) * lucas(Math.floor(n / p), Math.floor(m / p), p)) % p
}
```

### 4. 逆元预处理

为了高效计算 C(n_i, m_i) mod p，需要预处理阶乘和逆元：

```typescript
function preprocess(p: number): { fact: number[], invFact: number[] } {
  const fact = new Array(p).fill(1)
  const invFact = new Array(p).fill(1)

  // 计算阶乘
  for (let i = 1; i < p; i++) {
    fact[i] = (fact[i - 1] * i) % p
  }

  // 计算阶乘的逆元（费马小定理）
  invFact[p - 1] = modPow(fact[p - 1], p - 2, p)
  for (let i = p - 2; i >= 0; i--) {
    invFact[i] = (invFact[i + 1] * (i + 1)) % p
  }

  return { fact, invFact }
}

function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base = base % mod
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod
    }
    exp = Math.floor(exp / 2)
    base = (base * base) % mod
  }
  return result
}
```

### 5. 扩展卢卡斯定理

当 p 不是素数时，需要使用扩展卢卡斯定理：

1. 将 p 分解为素因子的幂：p = p1^a1 * p2^a2 * ...
2. 对每个 pi^ai 计算 C(n, m) mod pi^ai
3. 使用中国剩余定理合并结果

```typescript
function extendedLucas(n: number, m: number, p: number): number {
  // 分解 p 的素因子
  const factors = factorize(p)

  // 对每个素因子幂计算
  const remainders: number[] = []
  const moduli: number[] = []

  for (const [prime, power] of factors) {
    const mod = Math.pow(prime, power)
    remainders.push(combModPrimePower(n, m, prime, power))
    moduli.push(mod)
  }

  // 中国剩余定理合并
  return chineseRemainderTheorem(remainders, moduli)
}
```

## 可视化说明

在可视化界面中，卢卡斯定理的计算过程可以分为以下步骤：

### 步骤 1：p 进制分解

```
n = 15, p = 3

分解过程：
15 ÷ 3 = 5 余 0  →  n_0 = 0
5 ÷ 3 = 1 余 2   →  n_1 = 2
1 ÷ 3 = 0 余 1   →  n_2 = 1

结果：15 = (1, 2, 0)_3
```

### 步骤 2：逐位计算组合数

```
C(15, 7) mod 3

n = (1, 2, 0)_3
m = (0, 2, 1)_3

C(0, 1) = 0  (因为 0 < 1)
C(2, 2) = 1
C(1, 0) = 1

结果 = 0 * 1 * 1 = 0
```

### 步骤 3：合并结果

```
C(15, 7) mod 3 = 0
```

通过可视化可以观察：
- p 进制分解的详细过程
- 每一位组合数的计算
- 最终结果的合并

## 常见错误

### 1. 忘记 p 必须是素数

```typescript
// 错误：p 不是素数时使用普通卢卡斯定理
lucas(10, 5, 6)  // 6 不是素数，结果可能错误

// 正确：使用扩展卢卡斯定理
extendedLucas(10, 5, 6)
```

### 2. 逆元预处理范围不够

```typescript
// 错误：预处理范围小于 p
const fact = new Array(p - 1).fill(1)  // 应该是 p

// 正确：
const fact = new Array(p).fill(1)
```

### 3. 递归终止条件错误

```typescript
// 错误：没有处理 m === 0 的情况
function lucas(n: number, m: number, p: number): number {
  if (n === 0) return 1  // 不完整
  // ...
}

// 正确：
function lucas(n: number, m: number, p: number): number {
  if (m === 0) return 1
  // ...
}
```

### 4. 整数溢出

```typescript
// 错误：没有取模导致溢出
result = result * base  // 可能溢出

// 正确：每次乘法后取模
result = (result * base) % mod
```

### 5. p 进制分解顺序错误

```typescript
// 错误：从高位开始分解
function wrongToPAdic(n: number, p: number): number[] {
  const digits: number[] = []
  let power = 1
  while (power * p <= n) power *= p
  while (power > 0) {
    digits.push(Math.floor(n / power))
    n %= power
    power /= p
  }
  return digits  // 顺序可能混乱
}

// 正确：从低位开始，然后反转
function toPAdic(n: number, p: number): number[] {
  const digits: number[] = []
  while (n > 0) {
    digits.push(n % p)
    n = Math.floor(n / p)
  }
  return digits.reverse()  // 从高位到低位
}
```

## 实际应用

### 1. 组合数取模竞赛题

**问题**：计算 C(n, m) mod p，其中 n, m 可达 10^18，p 为素数。

**解法**：直接使用卢卡斯定理。

```typescript
function solve(n: number, m: number, p: number): number {
  return lucas(n, m, p)
}
```

### 2. 路径计数问题

**问题**：在网格中从 (0,0) 走到 (n,m)，只能向右或向上，求路径数 mod p。

**解法**：路径数 = C(n+m, n)，使用卢卡斯定理求解。

```typescript
function gridPaths(n: number, m: number, p: number): number {
  return lucas(n + m, n, p)
}
```

### 3. 多项式系数

**问题**：计算多项式系数 C(n; k1, k2, ..., kr) mod p。

**解法**：多项式系数 = C(n, k1) * C(n-k1, k2) * ... * C(n-k1-...-k_{r-1}, kr)

```typescript
function multinomial(n: number, ks: number[], p: number): number {
  let result = 1
  let remaining = n
  for (const k of ks) {
    result = (result * lucas(remaining, k, p)) % p
    remaining -= k
  }
  return result
}
```

### 4. 卡特兰数取模

**问题**：计算第 n 个卡特兰数 mod p。

**解法**：卡特兰数 Cat(n) = C(2n, n) / (n+1)

```typescript
function catalanMod(n: number, p: number): number {
  const numerator = lucas(2 * n, n, p)
  const denominator = modPow(n + 1, p - 2, p)  // 费马小定理求逆元
  return (numerator * denominator) % p
}
```

### 5. 杨辉三角第 n 行

**问题**：求杨辉三角第 n 行中，能被 p 整除的元素个数。

**解法**：利用卢卡斯定理，C(n, m) mod p = 0 当且仅当存在某一位 n_i < m_i。

```typescript
function countDivisible(n: number, p: number): number {
  const digits = toPAdic(n, p)
  let count = 0
  for (const digit of digits) {
    count += digit
  }
  return count
}
```

## 总结

卢卡斯定理是处理大组合数取模问题的强大工具：

**核心思想**：
- 将大问题分解为小问题
- 利用 p 进制分解降低问题规模
- 通过递归合并结果

**适用场景**：
- n 很大（如 10^18）
- p 为素数（普通卢卡斯）
- p 不为素数（扩展卢卡斯）

**时间复杂度**：
- 普通卢卡斯：O(log_p(n))
- 扩展卢卡斯：O(p * log_p(n))

**注意事项**：
- 普通卢卡斯要求 p 为素数
- 需要预处理阶乘和逆元
- 注意整数溢出问题

掌握卢卡斯定理，可以高效解决许多组合计数问题，是算法竞赛和数论学习的重要内容。
