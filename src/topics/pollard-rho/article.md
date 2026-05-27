# Pollard Rho 因数分解算法

## 概念解释

Pollard Rho是由John Pollard于1975年提出的一种**概率性因数分解算法**。它的名字来源于序列迭代过程中形成的希腊字母「ρ」(rho)形状。

核心思想非常巧妙：

1. 定义一个伪随机函数 f(x) = (x² + c) mod n
2. 从某个起始值开始不断迭代，生成序列 x₀, x₁, x₂, ...
3. 由于模运算的限制，序列最终会进入循环，形成「尾巴 + 循环」的ρ形状
4. 如果n有因子p，那么序列模p也会形成类似的ρ形状
5. 通过检测序列中的碰撞，可以找到n的非平凡因子

### 为什么叫「Rho」？

迭代序列的形状像希腊字母ρ：

```
      ┌───┐
      │   │  ← 循环部分
      │   │
  ────┘   │
  │       │
  │       │  ← 尾巴部分
  └───────┘
```

## 为什么重要

Pollard Rho在密码学和数论计算中具有重要地位：

1. **效率高**：期望时间复杂度为 O(n^{1/4})，远优于试除法的 O(√n)
2. **空间效率**：只需常数空间（Floyd判圈法只用两个变量）
3. **实用性强**：可以分解20-30位的合数，是许多因数分解工具的核心算法
4. **密码学应用**：RSA密钥的安全性分析中，Pollard Rho是重要的攻击手段之一

### 复杂度对比

| 算法 | 时间复杂度 | 适用范围 |
|------|------------|----------|
| 试除法 | O(√n) | 小于 10^12 |
| Pollard Rho | O(n^{1/4}) | 小于 10^20 |
| 椭圆曲线法 | O(exp(√(2ln n ln ln n))) | 更大的数 |

## 核心原理

### 1. 随机函数与伪随机序列

选择函数 f(x) = (x² + c) mod n，其中c是随机常数（c ≠ 0, c ≠ -2）。

```typescript
function f(x: number, c: number, n: number): number {
  return (x * x + c) % n
}
```

这个函数有两个关键性质：
- **确定性**：给定相同的输入，总是产生相同的输出
- **伪随机性**：在模n下，序列表现得像随机序列

### 2. 生日悖论

生日悖论告诉我们：从n个元素中随机选取，大约在 √n 次后就会出现重复。

在Pollard Rho中，如果n有因子p：
- 序列模p也会形成ρ形状
- 大约在 √p 次迭代后，序列模p会出现碰撞
- 此时 x ≡ y (mod p)，即 p | gcd(x - y, n)

由于 √p ≤ n^{1/4}（当p ≤ √n时），这给出了 O(n^{1/4}) 的期望时间复杂度。

### 3. Floyd判圈法（龟兔赛跑）

Floyd判圈法用两个指针检测循环：

```typescript
function pollardRho(n: number): number {
  if (n % 2 === 0) return 2

  let x = 2  // 慢指针（龟）
  let y = 2  // 快指针（兔）
  const c = Math.floor(Math.random() * (n - 1)) + 1
  let d = 1

  while (d === 1) {
    x = f(x, c, n)        // 龟走一步
    y = f(f(y, c, n), c, n)  // 兔走两步
    d = gcd(abs(x - y), n)
  }

  return d === n ? -1 : d  // -1 表示失败
}
```

**工作原理**：
- 慢指针每次迭代一步：x = f(x)
- 快指针每次迭代两步：y = f(f(y))
- 如果 gcd(|x - y|, n) > 1，找到了因子
- 如果 x = y（指针相遇），说明进入了循环但未找到因子

### 4. 完整的因数分解流程

```typescript
function factorize(n: number): number[] {
  if (n <= 1) return []
  if (isPrime(n)) return [n]  // 先用Miller-Rabin判断

  const factors: number[] = []
  const queue = [n]

  while (queue.length > 0) {
    const curr = queue.shift()!
    if (curr === 1) continue
    if (isPrime(curr)) {
      factors.push(curr)
      continue
    }

    // 用Pollard Rho找一个因子
    let d = pollardRho(curr)
    if (d === -1) d = fallbackTrialDivision(curr)

    queue.push(d)
    queue.push(curr / d)
  }

  return factors.sort((a, b) => a - b)
}
```

### 5. 与Miller-Rabin的配合

实际应用中，Pollard Rho与Miller-Rabin素性测试配合使用：

1. **Miller-Rabin**：快速判断n是否为素数 O(k log³n)
2. **Pollard Rho**：如果n是合数，找一个因子 O(n^{1/4})

```
输入 n
  │
  ├── Miller-Rabin 判断为素数 → 返回 [n]
  │
  └── 判断为合数
        │
        ├── Pollard Rho 找到因子 d
        │     │
        │     ├── 递归分解 d
        │     └── 递归分解 n/d
        │
        └── Pollard Rho 失败 → 更换c重试
```

## 可视化说明

在可视化界面中，Pollard Rho的执行过程可以分为三个视图：

### 1. 序列迭代视图

展示x和y两个指针在序列中的移动：

```
步骤  慢指针(x)  快指针(y)  |x-y|  gcd
 1      5         26        21     7   ← 找到因子!
```

### 2. Rho形状视图

展示序列形成的ρ形状循环结构，帮助理解为什么检测碰撞能发现因子。

### 3. Floyd判圈视图

龟兔赛跑的动画，直观展示两个指针如何在循环中相遇。

## 常见错误

### 1. 忘记处理特殊情况

```typescript
// 错误：没有处理偶数
function pollardRho(n: number): number {
  // 当n为偶数时，应该直接返回2
  // ...
}

// 正确：
function pollardRho(n: number): number {
  if (n % 2 === 0) return 2
  // ...
}
```

### 2. 没有处理算法失败的情况

```typescript
// 错误：假设Pollard Rho一定能找到因子
const d = pollardRho(n)
queue.push(d)  // d可能是-1

// 正确：检查返回值
const d = pollardRho(n)
if (d === -1) {
  // 更换常数c重试，或使用降级算法
} else {
  queue.push(d)
  queue.push(n / d)
}
```

### 3. 大数溢出问题

```typescript
// 错误：x * x 可能溢出
x = (x * x + c) % n  // 当x很大时，x*x可能超过JavaScript安全整数范围

// 正确：使用模乘
function modMul(a: number, b: number, m: number): number {
  return ((a % m) * (b % m)) % m
}
x = (modMul(x, x, n) + c) % n
```

### 4. 选择了不合适的常数c

```typescript
// 错误：c = 0 会导致序列退化
// f(x) = x² mod n，从x=0开始会一直是0

// 错误：c = -2 可能导致某些情况下效率低下
// f(x) = (x² - 2) mod n 对某些n表现不好

// 正确：随机选择c，且c ≠ 0, c ≠ -2
let c = Math.floor(Math.random() * (n - 3)) + 2  // c ∈ [2, n-2]
```

## 实际应用

### 1. RSA密钥安全性分析

RSA的安全性基于大整数分解的困难性。如果能快速分解n=pq，就能破解RSA。Pollard Rho可以分解较小的RSA模数（约20-30位十进制数）。

### 2. 竞赛编程中的因数分解

在算法竞赛中，Pollard Rho常用于：
- 快速分解中等大小的整数（< 10^18）
- 配合Miller-Rabin进行素性判断
- 计算欧拉函数φ(n)

### 3. 数论研究

Pollard Rho是许多更高级因数分解算法的基础：
- **Pollard's p-1算法**：利用p-1的光滑性
- **椭圆曲线法 (ECM)**：Pollard Rho在椭圆曲线上的推广
- **二次筛法 (QS)**：大规模因数分解

### 4. 密码学随机数生成

Pollard Rho的思想可以用于分析伪随机数生成器的质量，检测序列中的循环和碰撞。

## 总结

Pollard Rho是一种优雅而实用的概率性因数分解算法：

**核心要点**：
- 利用生日悖论，期望 O(n^{1/4}) 时间找到因子
- Floyd判圈法用两个指针检测循环，只需常数空间
- 随机函数 f(x) = (x² + c) mod n 产生伪随机序列
- 与Miller-Rabin配合使用，先判断素性再分解

**优势**：
- 实现简单，代码量少
- 空间效率高
- 对于中等大小的整数非常高效

**局限**：
- 概率性算法，不保证每次成功
- 对于大素因子效果不佳
- 超大整数需要更高级的算法

**适用场景**：
- 分解小于 10^20 的合数
- 竞赛编程中的因数分解
- 密码学中的安全性分析
- 数论计算中的辅助工具

理解Pollard Rho不仅有助于掌握因数分解技术，更能加深对概率算法、生日悖论和Floyd判圈等重要概念的理解。
