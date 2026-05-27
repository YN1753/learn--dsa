# Miller-Rabin 素性测试

## 概念解释

Miller-Rabin 素性测试是一种**概率性算法**，用于判断一个大整数是否为素数。它是目前工程实践中最常用的素性测试方法，广泛应用于密码学（如 RSA 密钥生成）中。

核心思想很简单：如果 n 是素数，那么它必须满足某些数学性质。我们随机选取底数 a，检查 n 是否满足这些性质。如果 n 不满足，它一定是合数；如果满足，它「可能」是素数。

### 关键术语

| 术语 | 说明 |
|------|------|
| 素数 (Prime) | 大于 1 且只能被 1 和自身整除的数 |
| 合数 (Composite) | 大于 1 且不是素数的数 |
| 费马小定理 | 若 p 是素数，则 a^(p-1) ≡ 1 (mod p) |
| 二次探测 | 若 p 是素数，x² ≡ 1 (mod p) 的解只有 x ≡ ±1 |
| 强伪素数 | 能通过费马测试的合数 |
| 底数 (Witness) | 测试中选取的基数 a |

## 为什么重要

Miller-Rabin 在计算机科学和工程中有重要地位：

1. **密码学基石**：RSA、Diffie-Hellman 等加密算法需要生成大素数，Miller-Rabin 是首选方法
2. **效率极高**：时间复杂度为 O(k log³n)，可以快速判断数百位大数的素性
3. **实用性**：确定性版本对小于 2^64 的数 100% 正确，覆盖几乎所有工程场景
4. **概率可调**：通过增加测试轮数 k，可以将错误概率降到任意低

## 核心原理

### 第一步：费马小定理

费马小定理指出：如果 p 是素数，那么对于任意 1 ≤ a < p，都有：

```
a^(p-1) ≡ 1 (mod p)
```

这意味着如果 a^(n-1) ≠ 1 (mod n)，那么 n 一定是合数。这就是**费马测试**。

但费马测试有缺陷：存在一类叫 **Carmichael 数**的合数（如 561 = 3 × 11 × 17），它们对所有与 n 互素的底数 a 都能通过费马测试。

### 第二步：二次探测定理

为了弥补费马测试的不足，Miller-Rabin 引入了**二次探测定理**：

如果 p 是素数，且 x² ≡ 1 (mod p)，那么 x ≡ 1 (mod p) 或 x ≡ -1 (mod p)。

换句话说，1 在模素数意义下没有「非平凡平方根」。

### 第三步：组合测试

将 n-1 写成 2^r × d 的形式（d 为奇数），然后检查：

1. 计算 a^d mod n
2. 如果结果为 1 或 n-1，通过本轮测试
3. 否则，不断平方，检查是否能在某次平方后得到 n-1
4. 如果始终得不到 n-1，则 n 一定是合数

```typescript
function millerRabinTest(n: bigint, a: bigint): boolean {
  // 将 n-1 写成 2^r * d
  let d = n - 1n
  let r = 0
  while (d % 2n === 0n) {
    d /= 2n
    r++
  }

  // 计算 a^d mod n
  let x = modPow(a, d, n)

  if (x === 1n || x === n - 1n) return true

  for (let i = 0; i < r - 1; i++) {
    x = modPow(x, 2n, n)
    if (x === n - 1n) return true
    if (x === 1n) return false  // 非平凡平方根
  }

  return false
}
```

### 错误概率分析

每一轮测试，对于一个合数 n：
- 至少有 3/4 的底数 a 能正确识别 n 为合数
- 误判概率不超过 **1/4**

k 轮独立测试后：
- 总误判概率不超过 **(1/4)^k**
- 20 轮 → 误判概率 < 10^(-12)
- 50 轮 → 误判概率 < 10^(-30)

### 确定性版本

对于小于 2^64 的整数，只需要检查固定的底数集合：

```
{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}
```

这 12 个底数就能 100% 正确判定所有小于 2^64 的数的素性。这使得 Miller-Rabin 在实际工程中可以作为**确定性算法**使用。

### 时间复杂度

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| 单轮测试 | O(log³n) | 快速幂 O(log n) × 大数乘法 O(log²n) |
| k 轮测试 | O(k · log³n) | k 为测试轮数 |
| 确定性版本 | O(12 · log³n) | 固定 12 个底数 |

## 可视化说明

在可视化界面中，你可以直观地观察 Miller-Rabin 测试的完整过程：

- **分解展示**：将 n-1 分解为 2^r × d 的过程
- **模幂运算**：逐步展示快速幂的计算过程
- **二次探测**：展示每次平方操作及结果判断
- **多轮测试**：展示不同底数的测试过程
- **结果判定**：高亮显示通过/失败的判断点

通过动画控制，你可以：
- 逐步执行每一轮测试
- 调整测试速度
- 观察不同底数对同一数的测试结果

## 常见错误

### 1. 忘记处理偶数

```typescript
// 错误：不检查偶数就进行测试
function isPrime(n: number): boolean {
  const witnesses = [2, 3, 5, 7]
  for (const w of witnesses) {
    if (!millerRabinTest(BigInt(n), BigInt(w))) return false
  }
  return true
  // 4 会被误判为素数！
}

// 正确：先排除偶数和小数
function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n < 4) return true
  if (n % 2 === 0 || n % 3 === 0) return false
  // ... 继续测试
}
```

### 2. 底数选择不当

```typescript
// 错误：只用一个底数
function isPrime(n: number): boolean {
  return millerRabinTest(BigInt(n), 2n)
  // 2047 = 23 × 89 会通过 a=2 的测试
}

// 正确：使用多个底数
const witnesses = [2, 3, 5, 7, 11, 13, 17]
```

### 3. 大数精度问题

```typescript
// 错误：使用普通 number 类型
function modPow(base: number, exp: number, mod: number): number {
  // 当 mod > 2^53 时，乘法会丢失精度！
  return Math.pow(base, exp) % mod  // 完全错误
}

// 正确：使用 BigInt
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n
  base = base % mod
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod
    exp = exp / 2n
    base = (base * base) % mod
  }
  return result
}
```

### 4. 混淆概率性和确定性

```typescript
// 注意：随机底数版本是概率性的
// 对于密码学应用，通常使用 20-40 轮
// 对于 < 2^64 的数，使用确定性底数集合即可
```

## 实际应用

### 1. RSA 密钥生成

```typescript
function generatePrime(bits: number): bigint {
  while (true) {
    // 生成随机奇数
    let n = randomOddBigInt(bits)
    // 确保最高位为 1
    n |= (1n << BigInt(bits - 1))

    // Miller-Rabin 测试
    if (isProbablePrime(n, 20)) {
      return n
    }
  }
}
```

### 2. 密码学中的安全素数

安全素数是指 p = 2q + 1 形式的素数（q 也是素数），在 Diffie-Hellman 密钥交换中使用。

### 3. 哈希表大小选择

某些哈希表实现选择素数大小来减少冲突，Miller-Rabin 可以快速验证候选大小。

### 4. 数论竞赛题

在算法竞赛中，Miller-Rabin 常用于需要快速素性判断的题目，如筛选法、因数分解等。

## 总结

Miller-Rabin 素性测试是理论与实践完美结合的典范：

**核心优势**：
- 时间复杂度 O(k log³n)，远快于试除法 O(√n)
- 错误概率 (1/4)^k，可通过增加轮数任意降低
- 确定性版本对 < 2^64 的数 100% 正确
- 实现简洁，代码量少

**适用场景**：
- 密码学中的大素数生成
- 算法竞赛中的素数判定
- 需要快速判断大数素性的任何场合

**与其他素性测试对比**：

| 方法 | 时间复杂度 | 类型 | 适用范围 |
|------|------------|------|----------|
| 试除法 | O(√n) | 确定性 | 小数 |
| Fermat 测试 | O(k log³n) | 概率性 | 有 Carmichael 数缺陷 |
| Miller-Rabin | O(k log³n) | 概率性/确定性 | 通用 |
| AKS | O(log⁶n) | 确定性 | 理论意义大，实际较慢 |

Miller-Rabin 以其简洁、高效、可靠的特点，成为实际工程中素性测试的首选算法。
