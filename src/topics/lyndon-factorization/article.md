# Lyndon分解 (Lyndon Factorization)

## 概念解释

### Lyndon词

一个字符串 w 被称为 **Lyndon词**（Lyndon Word），当且仅当 w **严格字典序小于**它的所有**真后缀**。

例如，考虑字符串 `ababb`：
- 真后缀有：`babb`、`abb`、`bb`、`b`
- `ababb` < `abb` < `b` < `babb` < `bb`
- `ababb` 严格小于所有真后缀，所以 `ababb` 是一个Lyndon词

再看 `abab`：
- 真后缀有：`bab`、`ab`、`b`
- `ab` < `abab`，即真后缀 `ab` 比原串小
- 所以 `abab` **不是**Lyndon词

### Lyndon分解定理（Chen-Fox-Lyndon定理）

**任何字符串都可以唯一地分解为一系列Lyndon词的拼接**：

```
s = w1 · w2 · w3 · ... · wk
```

其中每个 wi 都是Lyndon词，且满足字典序非增：

```
w1 >= w2 >= w3 >= ... >= wk
```

这个分解是**唯一的**。例如：

| 字符串 | Lyndon分解 | 说明 |
|--------|------------|------|
| `abcabc` | `abc`, `abc` | 两个相同的Lyndon词 |
| `ababb` | `ababb` | 本身就是Lyndon词 |
| `aababb` | `aababb` | 本身就是Lyndon词 |
| `dcbaabcd` | `d`, `cbaabcd` | `d` > `cbaabcd` 满足非增 |
| `abcabac` | `abc`, `abac` | `abc` > `abac` 满足非增 |

## 为什么重要

Lyndon分解在字符串算法中有重要地位：

1. **最小表示法**：O(n) 时间求字符串循环同构中字典序最小的表示
2. **Burrows-Wheeler变换 (BWT)**：数据压缩（如 bzip2）的核心操作可以高效计算
3. **de Bruijn序列**：构造包含所有长度为 k 的子串的最短循环序列
4. **字符串匹配**：某些模式匹配问题可以利用Lyndon分解加速
5. **组合数学**：Lyndon词与necklace（项链）计数密切相关

## 核心原理

### Duval算法

Duval算法（1983年）是进行Lyndon分解的经典算法，时间复杂度 O(n)，额外空间 O(1)。

算法维护三个指针：
- `i`：当前正在处理的Lyndon因子的起始位置
- `j`：正在扫描的位置
- `k`：用于比较的位置（相对于当前因子的偏移）

```typescript
function duval(s: string): string[] {
  const n = s.length
  const factors: string[] = []
  let i = 0

  while (i < n) {
    let j = i + 1
    let k = i

    // 阶段1: 尝试扩展当前Lyndon词
    while (j < n && s[k] <= s[j]) {
      if (s[k] < s[j]) {
        k = i    // 重置比较位置
      } else {
        k++      // 继续比较下一个字符
      }
      j++
    }

    // 阶段2: 输出当前找到的所有Lyndon因子
    while (i <= k) {
      factors.push(s.substring(i, i + j - k))
      i += j - k
    }
  }

  return factors
}
```

### 算法直觉

Duval算法的核心思想是**贪心**：

1. 从位置 `i` 开始，尝试找到一个尽可能长的"非Lyndon"前缀
2. 一旦发现某个字符打破了非增趋势（即 `s[k] < s[j]`），说明找到了一个新的Lyndon词的起点
3. 将找到的Lyndon因子输出，然后继续处理剩余部分

算法的精妙之处在于：它通过 `k` 指针的回退机制，巧妙地避免了重复比较，从而保证了线性时间复杂度。

### Lyndon词与最小表示法

**最小表示法**问题：给定字符串 s，求 s 的所有循环同构中字典序最小的那个。

利用Lyndon分解可以在 O(n) 时间内解决：

```typescript
function minRepresentation(s: string): string {
  const doubled = s + s
  const factors = duval(doubled)
  let pos = 0

  for (const factor of factors) {
    if (factor.length >= s.length) {
      return doubled.substring(pos, pos + s.length)
    }
    pos += factor.length
  }

  return s
}
```

原理：对 `s+s` 进行Lyndon分解后，找到第一个长度 >= |s| 的Lyndon因子，该因子的起始位置（模 |s|）就是最小表示法的起始位置。

### Lyndon词与necklace计数

在组合数学中，长度为 n 的二进制Lyndon词的数量由以下公式给出：

```
L(n) = (1/n) × Σ(d|n) μ(d) × 2^(n/d)
```

其中 μ 是莫比乌斯函数。这是necklace计数公式的特殊情况。

## 可视化说明

在可视化界面中，你可以观察Duval算法的执行过程：

- **字符串展示**：输入字符串的每个字符以格子形式展示
- **指针追踪**：三个指针 i、j、k 的当前位置用不同颜色标记
- **因子边界**：已识别的Lyndon因子用分隔线标出
- **比较过程**：当前正在比较的两个字符会高亮显示
- **分解结果**：最终的Lyndon分解结果以不同颜色的区块展示

通过控制面板你可以：
- **播放/暂停**：观察算法的每一步执行
- **单步执行**：仔细分析每一步的比较逻辑
- **调节速度**：加快或减慢动画速度
- **自定义输入**：输入任意字符串观察分解过程

## 常见错误

### 1. 混淆Lyndon词的定义

```typescript
// 错误理解：Lyndon词是小于等于所有后缀的字符串
// 正确理解：Lyndon词是严格小于所有真后缀的字符串
// 注意：是严格小于 (<=)，不是小于等于

// 例如 "aa" 不是Lyndon词
// 真后缀 "a" 与原串 "aa" 比较： "a" < "aa"
// 所以 "aa" 不严格小于所有真后缀
```

### 2. Duval算法中比较方向错误

```typescript
// 错误：使用 >= 而不是 <=
while (j < n && s[k] >= s[j])  // 错误！

// 正确：使用 <=
while (j < n && s[k] <= s[j])  // 正确
// s[k] <= s[j] 时继续扩展，因为当前前缀仍可能成为Lyndon词的一部分
```

### 3. 忘记处理 k 指针的回退

```typescript
// 错误：只递增 k，不重置
k++  // 只在 s[k] == s[j] 时递增

// 正确：在 s[k] < s[j] 时重置 k 到 i
if (s[k] < s[j]) {
  k = i    // 重置！这意味着从头开始新的Lyndon词
} else {
  k++
}
```

### 4. 最小表示法中未正确处理边界

```typescript
// 错误：直接对原串做Lyndon分解
const factors = duval(s)  // 错误！

// 正确：对 s+s 做分解
const factors = duval(s + s)  // 正确
```

## 实际应用

### 1. 字符串最小表示法

在很多字符串问题中，需要找到一个字符串的"标准形式"。例如判断两个字符串是否为循环同构，可以比较它们的最小表示法。

```typescript
function areRotationallyEquivalent(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return minRepresentation(a) === minRepresentation(b)
}
```

### 2. Burrows-Wheeler变换 (BWT)

BWT是数据压缩的核心技术之一（bzip2 使用BWT）。BWT将字符串重新排列，使得相同字符聚集在一起，便于后续压缩。

Lyndon分解提供了一种 O(n) 时间计算BWT的方法，比传统的基于后缀数组的方法更加简洁。

### 3. de Bruijn序列

de Bruijn序列 B(k, n) 是一个长度为 k^n 的循环序列，其中每个长度为 n 的字符串（在 k 字母表上）恰好出现一次。

Lyndon词为构造de Bruijn序列提供了优雅的方法：将所有长度整除 n 的Lyndon词按字典序拼接，即可得到de Bruijn序列。

### 4. 字符串周期性分析

Lyndon分解可以帮助分析字符串的周期性结构。如果一个字符串的Lyndon分解只有一个因子，说明它本身就是Lyndon词，具有较强的"非周期性"。

## 总结

Lyndon分解是字符串算法中的一个重要工具：

**核心概念**：
- Lyndon词：严格小于所有真后缀的字符串
- Chen-Fox-Lyndon定理：任何字符串有唯一的Lyndon分解
- 分解因子按字典序非增排列

**Duval算法**：
- 时间复杂度 O(n)，空间复杂度 O(1)
- 基于贪心思想，在线处理
- 通过三个指针 i、j、k 实现

**主要应用**：
- 字符串最小表示法：O(n) 求循环同构的最小表示
- BWT变换：数据压缩的基础
- de Bruijn序列构造
- 字符串周期性分析

Lyndon分解展示了数学之美与算法之巧的结合。理解它不仅能帮助解决具体的字符串问题，也能加深对字符串结构本质的理解。
