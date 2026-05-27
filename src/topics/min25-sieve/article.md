# Min-25筛 (Min-25 Sieve)

## 概念解释

Min-25筛是一种用于**快速计算积性函数前缀和**的算法，由日本选手 Min_25 于2018年提出。

对于一个积性函数 $f(n)$，Min-25筛可以在 $O(n^{3/4}/\log n)$ 的时间复杂度内计算出：

$$\sum_{i=1}^{n} f(i)$$

### 关键术语

| 术语 | 说明 |
|------|------|
| 积性函数 | 满足 $f(ab) = f(a) \cdot f(b)$（当 $\gcd(a,b)=1$ 时）的函数 |
| 完全积性函数 | 满足 $f(ab) = f(a) \cdot f(b)$（对所有 $a,b$）的函数 |
| 前缀和 | $\sum_{i=1}^{n} f(i)$ |
| 质数贡献 | 质数对前缀和的贡献部分 |
| 合数贡献 | 合数对前缀和的贡献部分 |

### Min-25筛的核心思想

Min-25筛将计算分为**两个阶段**：

1. **第一阶段（质数贡献）**：对每个 $n/i$，计算所有质数 $p \leq \sqrt{n}$ 对前缀和的贡献
2. **第二阶段（合数贡献）**：通过枚举最小质因子，递归计算合数的贡献

## 为什么重要

Min-25筛在数论竞赛和研究中具有重要地位：

1. **高效处理大范围求和**：对于 $n = 10^{10}$ 级别的问题，传统筛法（如埃氏筛、欧拉筛）无法在合理时间内完成，而Min-25筛可以高效处理
2. **比杜教筛更通用**：杜教筛要求函数满足特定的卷积性质，而Min-25筛适用于更广泛的积性函数
3. **处理复杂积性函数**：对于形如 $f(p^k) = g(p^k)$ 的积性函数，Min-25筛可以高效计算
4. **竞赛常用算法**：在信息学竞赛（如ICPC、Codeforces）的数论题目中频繁出现

### 与其他筛法的对比

| 算法 | 时间复杂度 | 适用范围 |
|------|------------|----------|
| 埃氏筛 | $O(n \log \log n)$ | 质数筛选 |
| 欧拉筛 | $O(n)$ | 质数筛选、线性筛 |
| 杜教筛 | $O(n^{2/3})$ | 特定积性函数前缀和 |
| Min-25筛 | $O(n^{3/4}/\log n)$ | 一般积性函数前缀和 |

## 核心原理

### 前置知识

#### 积性函数的性质

对于积性函数 $f$，有：
- $f(1) = 1$
- 若 $n = p_1^{a_1} \cdot p_2^{a_2} \cdots p_k^{a_k}$，则 $f(n) = f(p_1^{a_1}) \cdot f(p_2^{a_2}) \cdots f(p_k^{a_k})$

#### 关键引理

Min-25筛依赖以下引理：

> **引理**：对于积性函数 $f$，设 $g(p) = f(p)$ 对所有质数 $p$ 成立，且 $g$ 是完全积性函数，则：
>
> $$\sum_{i=1}^{n} f(i) = \sum_{i=1}^{n} g(i) - \sum_{\substack{p \leq \sqrt{n} \\ p \text{ 是质数}}} \sum_{k=1}^{\lfloor \log_p n \rfloor} \left( g(p^k) \cdot S\left(\lfloor \frac{n}{p^k} \rfloor, p-1 \right) - f(p^k) \right)$$
>
> 其中 $S(n, m)$ 表示 $\sum_{\substack{i \leq n \\ \text{最小质因子} > m}} f(i)$。

### 第一阶段：计算质数贡献

目标：对每个 $v = n/i$，计算 $S_1(v) = \sum_{\substack{p \leq v \\ p \text{ 是质数}}} g(p)$

**步骤**：

1. 筛出 $\sqrt{n}$ 以内的所有质数
2. 对每个 $v = n/i$，初始化 $S_1(v) = \sum_{i=2}^{v} g(i)$（使用完全积性函数的前缀和公式）
3. 从小到大枚举质数 $p$，对每个 $p$ 更新：
   $$S_1(v) \leftarrow S_1(v) - g(p) \cdot \left( S_1\left(\lfloor \frac{v}{p} \rfloor\right) - S_1(p-1) \right)$$

**原理**：逐步减去以 $p$ 为最小质因子的合数的贡献。

### 第二阶段：计算完整前缀和

目标：计算 $S(n) = \sum_{i=1}^{n} f(i)$

**步骤**：

1. 初始化 $S(n) = S_1(n)$（质数贡献）
2. 从小到大枚举质数 $p \leq \sqrt{n}$，对每个 $p$ 递归计算：
   $$S(n) \leftarrow S(n) + \sum_{k=1}^{\lfloor \log_p n \rfloor} \left( f(p^k) \cdot S\left(\lfloor \frac{n}{p^k} \rfloor, p\right) + f(p^{k+1}) \right)$$

**原理**：枚举每个合数的最小质因子，递归计算贡献。

### 算法流程图

```
输入 n 和积性函数 f
    |
    v
筛出 sqrt(n) 以内的质数
    |
    v
初始化第一阶段数组
    |
    v
第一阶段：计算质数贡献 S1(v)
    |
    v
第二阶段：递归计算完整前缀和 S(n)
    |
    v
输出结果
```

## 可视化说明

在可视化界面中，Min-25筛的两个阶段被直观展示：

**第一阶段可视化**：
- 横轴表示不同的 $v = n/i$ 值
- 纵轴表示 $S_1(v)$ 的值
- 动画展示每个质数 $p$ 如何更新 $S_1(v)$

**第二阶段可视化**：
- 树形结构展示递归过程
- 每个节点表示一个 $(n, m)$ 状态
- 边表示递归调用关系
- 颜色区分质数贡献和合数贡献

通过可视化可以观察：
- 第一阶段如何逐步减去合数贡献
- 第二阶段的递归树结构
- 不同 $n$ 值对应的计算量变化

## 常见错误

### 1. 哈希映射错误

```typescript
// 错误：使用普通数组存储 n/i 的值
// 当 n 很大时（如 10^10），数组下标无法表示 n/i
const dp = new Array(n + 1)  // 内存溢出！

// 正确：使用 Map 存储，或使用两个数组分别存储 i 和 n/i
const dpSmall = new Array(sqrtN + 1)  // 存储 i <= sqrt(n)
const dpLarge = new Array(sqrtN + 1)  // 存储 n/i

function getIndex(v: number): number {
  return v <= sqrtN ? v : sqrtN + Math.floor(n / v)
}
```

### 2. 质数枚举范围不够

```typescript
// 错误：只筛到 sqrt(n) 的质数
// 第一阶段需要 sqrt(n) 以内的所有质数
const primes = sieve(Math.floor(Math.sqrt(n)))  // 正确

// 错误：第二阶段枚举质数时超过 sqrt(n)
for (const p of primes) {
  if (p * p > n) break  // 必须检查！
  // ...
}
```

### 3. 递归终止条件错误

```typescript
// 错误：没有正确处理递归终止
function S(n: number, m: number): number {
  // 错误：只检查 n == 0
  if (n === 0) return 0
}

// 正确：需要检查多个终止条件
function S(n: number, m: number): number {
  if (n <= 1) return 0           // n 太小
  if (m > n) return 0            // m 超过 n
  if (primes[m] > n) return 0    // 最小质因子超过 n
  // ...
}
```

### 4. 整数溢出

```typescript
// 错误：没有处理大数运算
const result = a * b  // 可能溢出！

// 正确：使用 BigInt 或取模运算
const MOD = BigInt(1e9 + 7)
const result = (a * b) % MOD
```

### 5. 边界条件处理

```typescript
// 错误：没有处理 n = 1 的情况
if (n === 0) return 0  // 不够！

// 正确：处理所有边界情况
if (n <= 1) return n === 1 ? f(1) : 0
```

## 实际应用

### 1. 素数计数函数 π(n)

计算不超过 $n$ 的质数个数 $\pi(n)$：

```typescript
// f(p) = 1 对所有质数 p
// f(p^k) = 0 对所有 k >= 2
function primeCounting(n: number): number {
  return min25Sieve(n, (p: number) => 1, (p: number, k: number) => k >= 2 ? 0 : 1)
}
```

**应用场景**：质数分布研究、密码学中的质数生成。

### 2. 莫比乌斯函数前缀和

计算 $\sum_{i=1}^{n} \mu(i)$：

```typescript
// f(p) = -1 对所有质数 p
// f(p^k) = 0 对所有 k >= 2
function mobiusPrefixSum(n: number): number {
  return min25Sieve(n, (p: number) => -1, (p: number, k: number) => k >= 2 ? 0 : -1)
}
```

**应用场景**：莫比乌斯反演、数论函数研究。

### 3. 欧拉函数前缀和

计算 $\sum_{i=1}^{n} \phi(i)$：

```typescript
// f(p) = p - 1 对所有质数 p
// f(p^k) = p^k - p^(k-1) 对所有 k >= 1
function eulerPhiPrefixSum(n: number): number {
  return min25Sieve(n, (p: number) => p - 1, (p: number, k: number) => 
    Math.pow(p, k) - Math.pow(p, k - 1)
  )
}
```

**应用场景**：欧拉定理、RSA加密算法。

### 4. 积性函数求和

计算任意积性函数的前缀和，例如：

```typescript
// f(p) = p^2 对所有质数 p
// f(p^k) = p^(2k) 对所有 k >= 1
function sumOfSquares(n: number): number {
  return min25Sieve(n, (p: number) => p * p, (p: number, k: number) => 
    Math.pow(p, 2 * k)
  )
}
```

**应用场景**：数论竞赛题、数学研究。

### 5. 筛法优化

Min-25筛可以与其他筛法结合，优化特定问题的求解：

- **区间筛**：筛选 $[L, R]$ 区间内的质数
- **质数计数**：高效计算大范围内的质数个数
- **积性函数表**：快速生成积性函数值表

## 总结

Min-25筛是一种强大的数论算法，具有以下特点：

**优点**：
- 时间复杂度优秀：$O(n^{3/4}/\log n)$
- 适用范围广：适用于一般积性函数
- 空间效率高：只需要 $O(\sqrt{n})$ 空间
- 实现相对简洁：核心代码不超过50行

**缺点**：
- 需要预处理质数表
- 对于特定函数（如完全积性函数），可能不如专门算法高效
- 递归深度可能较大

**适用场景**：
- 大范围积性函数前缀和计算（$n > 10^7$）
- 竞赛中的数论题目
- 数学研究中的质数分布分析
- 密码学中的大质数相关计算

**学习建议**：
1. 先理解积性函数的性质
2. 掌握埃氏筛和欧拉筛的基本原理
3. 理解杜教筛的思想（作为对比）
4. 手动模拟小规模数据的计算过程
5. 阅读高质量的实现代码

Min-25筛是数论算法中的重要工具，掌握它可以帮助解决许多复杂的数论问题。
