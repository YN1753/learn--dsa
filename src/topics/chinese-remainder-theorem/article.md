# 中国剩余定理 (Chinese Remainder Theorem)

## 概念解释

**中国剩余定理**（CRT）是数论中的一个经典定理，用于求解**同余方程组**。它最早出现在中国古代数学著作《孙子算经》中，因此也被称为「孙子定理」。

### 什么是同余方程组

给定一组同余方程：

```
x ≡ r₁ (mod m₁)
x ≡ r₂ (mod m₂)
...
x ≡ rₙ (mod mₙ)
```

其中 `m₁, m₂, ..., mₙ` 是模数，`r₁, r₂, ..., rₙ` 是余数。问题是要找到一个整数 x，使得 x 除以每个 `mᵢ` 的余数恰好等于 `rᵢ`。

### 经典问题

《孙子算经》中的问题：「今有物不知其数，三三数之剩二，五五数之剩三，七七数之剩二。问物几何？」

翻译成数学语言就是：

```
x ≡ 2 (mod 3)
x ≡ 3 (mod 5)
x ≡ 2 (mod 7)
```

答案是 x = 23。

## 为什么重要

中国剩余定理在计算机科学中有广泛应用：

1. **RSA 加密算法**：RSA 的解密过程本质上就是中国剩余定理的应用，可以将大数模幂运算分解为多个小模数的运算，大幅提高解密速度
2. **大数计算**：将大整数表示为多个小模数下的余数，利用 CRT 还原结果，避免直接处理大数
3. **密码学**：许多密码协议的安全性基于中国剩余定理
4. **计算机系统**：在分布式计算中，CRT 可用于数据分片和并行计算

## 核心原理

### 存在性与唯一性

**定理**：如果模数 `m₁, m₂, ..., mₙ` 两两互质（即任意两个模数的最大公约数为 1），那么同余方程组在模 `M = m₁ × m₂ × ... × mₙ` 意义下有唯一解。

### 构造解法

中国剩余定理不仅证明了解的存在，还给出了构造解的方法：

**步骤 1**：计算 `M = m₁ × m₂ × ... × mₙ`

**步骤 2**：对每个 i，计算 `Mᵢ = M / mᵢ`（即除第 i 个模数外所有模数的乘积）

**步骤 3**：求 `Mᵢ` 在模 `mᵢ` 下的逆元 `tᵢ`，即满足 `Mᵢ × tᵢ ≡ 1 (mod mᵢ)`

**步骤 4**：构造解 `x = Σ(rᵢ × Mᵢ × tᵢ) mod M`

### 为什么这个构造是正确的

关键性质：
- `Mᵢ ≡ 0 (mod mⱼ)` 对所有 `j ≠ i`（因为 `Mᵢ` 是 `mⱼ` 的倍数）
- `gcd(Mᵢ, mᵢ) = 1`（因为模数两两互质），所以 `Mᵢ` 在模 `mᵢ` 下有逆元

因此 `rᵢ × Mᵢ × tᵢ ≡ rᵢ × 1 ≡ rᵢ (mod mᵢ)`，而对 `j ≠ i` 有 `rᵢ × Mᵢ × tᵢ ≡ 0 (mod mⱼ)`。

求和后，`x ≡ rᵢ (mod mᵢ)` 对所有 i 成立。

### 算法实现

```typescript
function extendedGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0]
  const [g, x1, y1] = extendedGcd(b, a % b)
  return [g, y1, x1 - Math.floor(a / b) * y1]
}

function modInverse(a: number, m: number): number {
  const [g, x] = extendedGcd(a, m)
  if (g !== 1) throw new Error('逆元不存在')
  return ((x % m) + m) % m
}

function CRT(remainders: number[], moduli: number[]): number {
  let M = 1
  for (const m of moduli) M *= m

  let result = 0
  for (let i = 0; i < remainders.length; i++) {
    const Mi = M / moduli[i]
    const yi = modInverse(Mi, moduli[i])
    result += remainders[i] * Mi * yi
  }

  return ((result % M) + M) % M
}
```

## 扩展中国剩余定理（EXCRT）

### 模数不互质的情况

经典 CRT 要求模数两两互质。当模数不互质时，需要使用**扩展中国剩余定理**。

### 核心思想：逐个合并

将两个同余方程合并为一个：

```
x ≡ r₁ (mod m₁)
x ≡ r₂ (mod m₂)
```

等价于 `x = m₁ × t + r₁`，代入第二个方程：

```
m₁ × t + r₁ ≡ r₂ (mod m₂)
m₁ × t ≡ (r₂ - r₁) (mod m₂)
```

设 `g = gcd(m₁, m₂)`：
- 如果 `(r₂ - r₁) % g ≠ 0`，则方程组无解
- 否则，用扩展欧几里得求解 t，合并为 `x ≡ r (mod lcm(m₁, m₂))`

### EXCRT 实现

```typescript
function excrt(remainders: number[], moduli: number[]): number | null {
  let r = remainders[0], m = moduli[0]
  for (let i = 1; i < remainders.length; i++) {
    const [g, x] = extendedGcd(m, moduli[i])
    const diff = remainders[i] - r
    if (diff % g !== 0) return null // 无解

    const lcm = m / g * moduli[i]
    const t = (diff / g * x % (moduli[i] / g) + moduli[i] / g) % (moduli[i] / g)
    r = (r + m * t % lcm + lcm) % lcm
    m = lcm
  }
  return r
}
```

## 可视化说明

在可视化界面中，中国剩余定理的求解过程分为以下几个阶段：

1. **输入阶段**：显示同余方程组 `x ≡ rᵢ (mod mᵢ)`
2. **计算 M**：展示 `M = m₁ × m₂ × ... × mₙ` 的计算
3. **计算 Mᵢ**：对每个方程计算 `Mᵢ = M / mᵢ`
4. **求逆元**：用扩展欧几里得算法求 `Mᵢ` 在模 `mᵢ` 下的逆元
5. **构造解**：计算 `x = Σ(rᵢ × Mᵢ × tᵢ) mod M`
6. **验证**：检查 `x mod mᵢ = rᵢ` 是否对所有 i 成立

## 常见错误

### 1. 模数不互质时直接使用经典 CRT

```typescript
// 错误：模数 6 和 9 不互质 (gcd = 3)
CRT([1, 2], [6, 9]) // 可能得到错误结果

// 正确：使用 EXCRT
excrt([1, 2], [6, 9])
```

### 2. 忘记取模处理负数

```typescript
// 错误：逆元可能为负数
const inv = modInverse(a, m)

// 正确：确保结果为正
const inv = ((modInverse(a, m) % m) + m) % m
```

### 3. 混淆 Mᵢ 和 mᵢ

- `Mᵢ = M / mᵢ`（所有模数之积除以当前模数）
- `mᵢ` 是当前方程的模数
- 求的是 `Mᵢ` 在模 `mᵢ` 下的逆元，不是 `mᵢ` 在模 `Mᵢ` 下的逆元

## 实际应用

### 1. RSA 解密加速

RSA 解密需要计算 `c^d mod n`，其中 n = p × q。利用 CRT：

```
x₁ = c^(d mod (p-1)) mod p
x₂ = c^(d mod (q-1)) mod q
x = CRT([x₁, x₂], [p, q])
```

这样可以将大数模幂分解为两个小模数的运算，速度提升约 4 倍。

### 2. 大整数表示

将一个大整数表示为多个小模数下的余数：

```
N → (N mod m₁, N mod m₂, ..., N mod mₙ)
```

利用 CRT 可以从余数恢复原数。这种表示方法允许并行计算。

### 3. 日历计算

中国剩余定理可用于计算「某天是星期几」等问题，本质上是同余方程组的求解。

### 4. 错误纠正编码

在编码理论中，CRT 用于构造纠错码，将信息分散到多个「通道」中。

## 总结

**中国剩余定理**是数论中一个优美且实用的定理：

**核心要点**：
- 经典 CRT 要求模数两两互质，在模 M 意义下有唯一解
- 构造解法：`x = Σ(rᵢ × Mᵢ × tᵢ) mod M`
- 扩展 CRT（EXCRT）处理模数不互质的情况
- 时间复杂度：O(n log M)

**优点**：
- 将大数问题分解为多个小数问题
- 支持并行计算
- 理论优美，实现简洁

**适用场景**：
- RSA 等公钥密码算法
- 大整数运算优化
- 分布式计算中的数据分片
- 日历和周期性问题求解
