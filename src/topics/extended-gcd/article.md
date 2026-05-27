# 扩展欧几里得算法 (Extended Euclidean Algorithm)

## 概念解释

扩展欧几里得算法是经典欧几里得算法（辗转相除法）的扩展版本。它不仅能求出两个整数 a 和 b 的最大公约数 gcd(a, b)，还能找到一组整数解 (x, y)，使得：

```
ax + by = gcd(a, b)
```

这个等式被称为**贝祖等式（Bézout's Identity）**，是数论中的一个基本定理。

### 基本术语

| 术语 | 说明 |
|------|------|
| 最大公约数 (GCD) | 两个整数共有约数中最大的一个 |
| 贝祖等式 | ax + by = gcd(a, b)，其中 x, y 为整数 |
| 模逆元 | 若 ax ≡ 1 (mod m)，则 x 是 a 在模 m 下的乘法逆元 |
| 互质 | 两个数的最大公约数为 1 |

### 普通欧几里得算法 vs 扩展欧几里得算法

**普通欧几里得算法**：
- 只求 gcd(a, b)
- 递归终止条件：gcd(a, 0) = a
- 时间复杂度 O(log n)

**扩展欧几里得算法**：
- 求 gcd(a, b) 及对应的 x, y
- 在回溯过程中计算系数
- 时间复杂度同样是 O(log n)

## 为什么重要

扩展欧几里得算法在计算机科学和密码学中具有核心地位：

1. **模逆元求解**：求解 a 在模 m 下的乘法逆元，是模运算的基础操作
2. **RSA 加密算法**：密钥生成过程中需要计算私钥，本质就是求模逆元
3. **中国剩余定理**：求解同余方程组时需要模逆元
4. **模线性方程**：求解 ax ≡ b (mod m) 的关键步骤
5. **密码学基础**：椭圆曲线密码、Diffie-Hellman 密钥交换等都依赖模逆元

## 核心原理

### 算法推导

从欧几里得算法的递归过程出发：

```
gcd(a, b) = gcd(b, a mod b)
```

当递归到基本情况 `b = 0` 时：
- `gcd(a, 0) = a`
- 此时 `a * 1 + 0 * 0 = a`，所以 `x = 1, y = 0`

回溯时，假设已知 `gcd(b, a mod b)` 的解为 `(x', y')`，即：
```
b * x' + (a mod b) * y' = gcd(a, b)
```

因为 `a mod b = a - floor(a/b) * b`，代入得：
```
b * x' + (a - floor(a/b) * b) * y' = gcd(a, b)
a * y' + b * (x' - floor(a/b) * y') = gcd(a, b)
```

所以：
```
x = y'
y = x' - floor(a/b) * y'
```

### 代码实现

```typescript
function extendedGcd(a: number, b: number): { gcd: number; x: number; y: number } {
  // 基本情况
  if (b === 0) {
    return { gcd: a, x: 1, y: 0 }
  }

  // 递归调用
  const result = extendedGcd(b, a % b)

  // 回溯计算系数
  const x = result.y
  const y = result.x - Math.floor(a / b) * result.y

  return { gcd: result.gcd, x, y }
}
```

**时间复杂度**：O(log(min(a, b)))

### 计算示例

以 `gcd(35, 15)` 为例：

```
gcd(35, 15) → gcd(15, 5) → gcd(5, 0) = 5

回溯过程：
gcd(5, 0): x=1, y=0        → 5*1 + 0*0 = 5
gcd(15, 5): x=0, y=1-3*0=1 → 15*0 + 5*1 = 5  (不对，重新计算)

实际上：
gcd(5, 0): 5*1 + 0*0 = 5, 返回 {gcd:5, x:1, y:0}
gcd(15, 5): a=15, b=5, floor(15/5)=3
  x = y' = 0
  y = x' - 3*y' = 1 - 3*0 = 1
  验证: 15*0 + 5*1 = 5 ✓

gcd(35, 15): a=35, b=15, floor(35/15)=2
  x = y' = 1
  y = x' - 2*y' = 0 - 2*1 = -2
  验证: 35*1 + 15*(-2) = 35-30 = 5 ✓
```

最终结果：`35 * 1 + 15 * (-2) = 5`

## 可视化说明

在可视化界面中，扩展欧几里得算法的递归过程和回溯计算被直观展示：

- **递归阶段**：展示 gcd 的辗转相除过程，每一步显示当前的 a 和 b
- **回溯阶段**：从基本情况开始，逐步回溯计算 x 和 y 的值
- **最终验证**：显示 ax + by 的计算结果，验证等于 gcd

通过可视化可以观察到：
- 递归深度与输入大小的关系（O(log n)）
- 系数 x 和 y 在回溯过程中如何计算
- 贝祖等式如何在每一步得到满足

## 常见错误

### 1. 混淆回溯公式

```typescript
// 错误：直接使用递归结果而不交换
function wrongExtendedGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0]
  const [gcd, x, y] = wrongExtendedGcd(b, a % b)
  return [gcd, x, y]  // 错误！没有更新系数
}

// 正确：必须交换和更新系数
function correctExtendedGcd(a: number, b: number): [number, number, number] {
  if (b === 0) return [a, 1, 0]
  const [gcd, x1, y1] = correctExtendedGcd(b, a % b)
  return [gcd, y1, x1 - Math.floor(a / b) * y1]
}
```

### 2. 模逆元未取模

```typescript
// 错误：直接返回 x 作为逆元
function wrongModInverse(a: number, m: number): number {
  const [gcd, x, y] = extendedGcd(a, m)
  if (gcd !== 1) throw new Error('No inverse')
  return x  // 可能是负数！
}

// 正确：确保结果为正数
function correctModInverse(a: number, m: number): number {
  const [gcd, x, y] = extendedGcd(a, m)
  if (gcd !== 1) throw new Error('No inverse')
  return ((x % m) + m) % m  // 保证结果在 [0, m) 范围内
}
```

### 3. 忘记检查互质条件

```typescript
// 错误：不检查是否存在逆元
function badFindInverse(a: number, m: number): number {
  const [gcd, x] = extendedGcd(a, m)
  return x  // 如果 gcd ≠ 1，结果无意义
}

// 正确：先检查互质
function goodFindInverse(a: number, m: number): number | null {
  const [gcd, x] = extendedGcd(a, m)
  if (gcd !== 1) return null  // 不存在逆元
  return ((x % m) + m) % m
}
```

## 实际应用

### 1. RSA 加密算法

在 RSA 中，密钥生成需要计算私钥 d，使得：
```
e * d ≡ 1 (mod φ(n))
```

这等价于求 e 在模 φ(n) 下的乘法逆元，使用扩展欧几里得算法求解。

### 2. 中国剩余定理 (CRT)

求解同余方程组：
```
x ≡ a₁ (mod m₁)
x ≡ a₂ (mod m₂)
...
```

合并方程时需要计算 `Mᵢ = M/mᵢ` 在模 `mᵢ` 下的逆元。

### 3. 模线性方程

求解 `ax ≡ b (mod m)`：
1. 先用扩展欧几里得算法求 `a` 在模 `m` 下的逆元 `a⁻¹`
2. 则 `x = b * a⁻¹ mod m`

### 4. 椭圆曲线密码学

椭圆曲线上的点运算需要在有限域上做除法，本质是求模逆元。扩展欧几里得算法是高效求解模逆元的标准方法。

## 总结

扩展欧几里得算法是数论和密码学中的基础工具：

**核心能力**：
- 求解贝祖等式 ax + by = gcd(a, b) 的整数解
- 高效计算模逆元
- 时间复杂度 O(log n)，非常高效

**关键应用**：
- RSA 密钥生成
- 中国剩余定理
- 模线性方程求解
- 椭圆曲线密码学

**学习要点**：
- 理解递归到回溯的过程
- 掌握系数更新公式
- 注意模逆元的存在条件（互质）
- 正确处理负数取模

掌握扩展欧几里得算法，是深入理解现代密码学和数论算法的重要一步。
