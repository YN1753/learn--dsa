# 字符串哈希 (Rabin-Karp)

## 概念解释

字符串哈希是一种将字符串映射为数值（哈希值）的技术。通过巧妙的数学设计，我们可以在 O(n) 预处理之后，以 O(1) 的时间复杂度计算任意子串的哈希值。这一特性使得字符串哈希成为解决子串匹配、重复子串检测等问题的强大工具。

### 核心术语

- **哈希函数（Hash Function）**：将任意长度的字符串映射为固定长度整数的函数
- **多项式哈希（Polynomial Hash）**：最常见的字符串哈希方式，将字符串视为 base 进制数
- **滚动哈希（Rolling Hash）**：从一个子串的哈希值 O(1) 推导出相邻子串哈希值的技术
- **哈希冲突（Hash Collision）**：两个不同的字符串产生相同的哈希值
- **基数（Base）**：多项式哈希中的底数，通常选择一个大于字符集大小的质数
- **模数（Modulus）**：对哈希值取模的大质数，用于防止整数溢出并减少冲突

### 多项式哈希的定义

对于一个长度为 m 的字符串 S = s_0 s_1 ... s_{m-1}，其多项式哈希值定义为：

```
H(S) = (s_0 × base^(m-1) + s_1 × base^(m-2) + ... + s_{m-1} × base^0) mod mod
```

这实际上就是把字符串看作一个 base 进制的数。例如，字符串 "ABC"（A=65, B=66, C=67）在 base=31 下的哈希值为：

```
H("ABC") = (65 × 31^2 + 66 × 31^1 + 67 × 31^0) mod mod
         = (65 × 961 + 66 × 31 + 67) mod mod
         = (62465 + 2046 + 67) mod mod
         = 64578 mod mod
```

### 滚动哈希的核心思想

假设我们已经计算了文本 T 中子串 T[i..i+m-1] 的哈希值 H_i，现在要计算下一个子串 T[i+1..i+m] 的哈希值 H_{i+1}。

滚动哈希公式：

```
H_{i+1} = (H_i × base - T[i] × base^m + T[i+m]) mod mod
```

这个操作只需要常数时间！关键在于：
1. **乘以 base**：将整个哈希值"左移"一位（类似于十进制中 123 变成 1230）
2. **减去 T[i] × base^m**：去掉最高位的贡献
3. **加上 T[i+m]**：加入新的最低位

### Rabin-Karp 算法

Rabin-Karp 算法利用滚动哈希实现高效的字符串匹配：

```
1. 计算模式串 P 的哈希值 H(P)
2. 计算文本 T 中第一个长度为 m 的子串的哈希值 H_0
3. 对于每个位置 i = 0, 1, ..., n-m:
   a. 如果 H_i == H(P)，逐字符验证是否真正匹配
   b. 如果不匹配，使用滚动哈希计算 H_{i+1}
4. 返回所有匹配位置
```

## 为什么重要

字符串哈希在计算机科学中有广泛的应用，是许多高级算法的基础构件：

### 子串匹配

Rabin-Karp 算法是解决子串匹配问题的经典方法之一。虽然在单模式匹配场景下 KMP 算法的最坏情况更优，但 Rabin-Karp 的优势在于其简洁性和可扩展性——它可以轻松扩展到多模式匹配。

### 抄袭检测

学术界使用字符串哈希来检测文档之间的相似性。通过计算文档中所有句子或段落的哈希值，可以快速识别重复内容，这是 Turnitin 等查重工具的核心技术之一。

### 重复子串检测

在 DNA 序列分析中，科学家需要找到基因组中的重复片段。字符串哈希可以在接近线性的时间内完成这一任务，而不需要 O(n^2) 的暴力比较。

### 内容寻址存储

Git 等版本控制系统使用哈希值作为内容的唯一标识。虽然 Git 使用的是 SHA-1 而非多项式哈希，但思想是一致的：相同的内容产生相同的哈希值。

## 核心原理

### 多项式哈希的数学基础

多项式哈希将字符串 S = s_0 s_1 ... s_{m-1} 视为 base 进制数：

```
H(S) = Σ(s_i × base^(m-1-i)) mod mod,  i = 0, 1, ..., m-1
```

选择 base 和 mod 的原则：
- **base**：通常选择大于字符集大小的质数，如 31、131、13331
- **mod**：选择一个大质数，如 10^9 + 7、10^9 + 9、2^61 - 1

### 滚动哈希的推导

已知 H_i = H(T[i..i+m-1])，求 H_{i+1} = H(T[i+1..i+m])：

```
H_i   = T[i] × base^(m-1) + T[i+1] × base^(m-2) + ... + T[i+m-1] × base^0
H_{i+1} = T[i+1] × base^(m-1) + T[i+2] × base^(m-2) + ... + T[i+m] × base^0

H_i × base = T[i] × base^m + T[i+1] × base^(m-1) + ... + T[i+m-1] × base^1

H_i × base - T[i] × base^m = T[i+1] × base^(m-1) + ... + T[i+m-1] × base^1

H_{i+1} = H_i × base - T[i] × base^m + T[i+m]
```

因此滚动哈希的公式为：

```
H_{i+1} = (H_i × base - T[i] × pow_base_m + T[i+m]) mod mod
```

其中 `pow_base_m = base^m mod mod` 可以预先计算。

### Rabin-Karp 算法的完整过程

```
输入: 文本 T (长度 n)，模式 P (长度 m)
输出: 所有匹配位置

1. 预处理:
   - 计算 pow_base_m = base^m mod mod
   - 计算 H_P = hash(P)
   - 计算 H_0 = hash(T[0..m-1])

2. 滑动窗口:
   for i = 0 to n-m:
     if H_i == H_P:
       if T[i..i+m-1] == P:  // 逐字符验证
         输出位置 i
     if i < n-m:
       H_{i+1} = (H_i × base - T[i] × pow_base_m + T[i+m]) mod mod
```

### 哈希冲突处理

由于哈希值是有限范围的整数，理论上两个不同的字符串可能产生相同的哈希值（冲突）。处理策略：

1. **取模验证**：当哈希值匹配时，必须逐字符比较确认真正匹配
2. **双哈希**：使用两个不同的 (base, mod) 对计算两个哈希值，两个都匹配才认为真正匹配
3. **选择好的参数**：使用大质数作为 mod，可以大幅降低冲突概率

```
冲突概率分析:
- 使用单个 mod = 10^9+7 时，冲突概率约为 1/10^9
- 使用双哈希时，冲突概率约为 1/10^18，几乎不可能发生
```

### 时间复杂度分析

| 步骤 | 时间复杂度 | 说明 |
|------|-----------|------|
| 预处理 pow_base_m | O(log m) | 快速幂计算 |
| 计算 H_P | O(m) | 遍历模式串 |
| 计算 H_0 | O(m) | 遍历第一个窗口 |
| 滑动窗口 | O(n - m) | 每次滚动 O(1) |
| 冲突验证 | O(n × m) 最坏 | 平均远小于此 |
| **总计** | **O(n + m) 平均** | 最坏 O(n × m) |

## 可视化说明

在可视化面板中，Rabin-Karp 算法的执行过程以直观的方式展示：

- **文本串**显示为一行字符方块，每个字符上方标注其数值（ASCII 码）
- **模式串**显示在文本下方，对齐当前窗口位置
- **哈希窗口**高亮显示当前正在计算的子串范围
- **哈希值对比**：实时显示窗口哈希值和模式串哈希值
  - **绿色**：哈希值匹配，且逐字符验证成功
  - **黄色**：哈希值匹配，但逐字符验证失败（冲突）
  - **红色**：哈希值不匹配，直接跳过
- **滚动过程**：动画展示窗口滑动时哈希值的更新计算

通过控制栏，你可以：

- 调整 **base** 和 **mod** 参数，观察不同参数对哈希值的影响
- 逐步观察每次滚动哈希的计算过程
- 查看冲突检测的详细信息
- 自定义输入文本和模式串
- 调整动画速度

## 常见错误

### 1. 哈希冲突时不进行验证

```typescript
// 错误：只比较哈希值就认为匹配
if (hashWindow === hashPattern) {
  matches.push(i)  // 可能是假阳性！
}

// 正确：哈希匹配后必须逐字符验证
if (hashWindow === hashPattern) {
  if (text.substring(i, i + m) === pattern) {
    matches.push(i)
  }
}
```

### 2. 取模运算中的负数问题

```typescript
// 错误：减法可能导致负数
let newHash = (hash * base - text[i] * powBaseM + text[i + m]) % mod
// 当 hash * base < text[i] * powBaseM 时，结果为负数！

// 正确：加上 mod 确保结果为正
let newHash = (hash * base - text[i] * powBaseM % mod + text[i + m] + mod) % mod
// 或使用 ((a % mod) + mod) % mod 的技巧
```

### 3. 选择不合适的 base 和 mod

```typescript
// 错误：base 太小，冲突率高
const base = 2   // 只有 0 和 1 两种字符区分度

// 错误：mod 不是质数，分布不均匀
const mod = 1000000 // 有很多因子，哈希分布差

// 正确：base > 字符集大小，mod 为大质数
const base = 31      // 大于小写字母数 26
const mod = 1e9 + 7  // 大质数
```

### 4. 整数溢出

```typescript
// 错误：JavaScript 中大数乘法可能丢失精度
let hash = hash * base  // 当 hash 接近 2^53 时精度丢失

// 正确：及时取模，或使用 BigInt
let hash = (hash * base) % mod

// 或者使用 BigInt 保证精度
let hash = BigInt(0)
const BASE = BigInt(31)
const MOD = BigInt(1e9 + 7)
```

### 5. 快速幂计算 pow_base_m 时的错误

```typescript
// 错误：逐次相乘，O(m) 时间且容易溢出
let powBaseM = 1
for (let i = 0; i < m; i++) {
  powBaseM *= base  // 溢出！
}

// 正确：使用快速幂，O(log m) 时间
function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base %= mod
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod
    base = (base * base) % mod
    exp >>= 1
  }
  return result
}
```

## 实际应用

### 抄袭检测

学术论文查重系统使用字符串哈希来高效检测文档相似性：

```typescript
function findSimilarSentences(doc1: string, doc2: string, k: number): string[] {
  // 将文档分割为句子
  const sentences1 = doc1.split(/[。！？]/)
  const sentences2 = doc2.split(/[。！？]/)
  const similar: string[] = []

  for (const s1 of sentences1) {
    if (s1.length < k) continue
    const hash1 = computeHash(s1)
    for (const s2 of sentences2) {
      if (s2.length < k) continue
      const hash2 = computeHash(s2)
      if (hash1 === hash2 && s1 === s2) {
        similar.push(s1)
        break
      }
    }
  }
  return similar
}
```

### 重复子串检测

在字符串中找到所有长度为 k 的重复子串：

```typescript
function findDuplicateSubstrings(s: string, k: number): string[] {
  const seen = new Map<number, number[]>()
  const duplicates: string[] = []
  let hash = computeHash(s.substring(0, k))
  seen.set(hash, [0])

  for (let i = 1; i <= s.length - k; i++) {
    hash = rollingHash(hash, s[i - 1], s[i + k - 1], k)
    const positions = seen.get(hash) || []
    // 验证是否真正重复
    const substr = s.substring(i, i + k)
    for (const pos of positions) {
      if (s.substring(pos, pos + k) === substr) {
        duplicates.push(substr)
        break
      }
    }
    positions.push(i)
    seen.set(hash, positions)
  }
  return [...new Set(duplicates)]
}
```

### 多模式匹配

Rabin-Karp 可以自然地扩展到同时搜索多个模式串：

```typescript
function multiPatternSearch(text: string, patterns: string[]): Map<string, number[]> {
  const results = new Map<string, number[]>()
  const hashMap = new Map<number, string[]>()

  // 将所有模式串的哈希值存入哈希表
  for (const p of patterns) {
    const h = computeHash(p)
    const existing = hashMap.get(h) || []
    existing.push(p)
    hashMap.set(h, existing)
    results.set(p, [])
  }

  // 在文本中滚动搜索
  const m = patterns[0].length // 假设所有模式串长度相同
  let hash = computeHash(text.substring(0, m))

  for (let i = 0; i <= text.length - m; i++) {
    const candidates = hashMap.get(hash)
    if (candidates) {
      const substr = text.substring(i, i + m)
      for (const p of candidates) {
        if (substr === p) {
          results.get(p)!.push(i)
        }
      }
    }
    if (i < text.length - m) {
      hash = rollingHash(hash, text[i], text[i + m], m)
    }
  }
  return results
}
```

### 内容寻址存储

Git 使用哈希值作为文件内容的唯一标识：

```typescript
// 类似 Git 的内容寻址思想
class ContentStore {
  private store = new Map<string, string>()

  put(content: string): string {
    const hash = sha1(content)  // 使用安全哈希
    this.store.set(hash, content)
    return hash
  }

  get(hash: string): string | undefined {
    return this.store.get(hash)
  }
}
```

## 总结

字符串哈希和 Rabin-Karp 算法是字符串处理中的重要工具：

- **多项式哈希**：将字符串视为 base 进制数，实现字符串到整数的映射
- **滚动哈希**：O(1) 时间从一个子串哈希值推导相邻子串哈希值，是 Rabin-Karp 的核心
- **Rabin-Karp 算法**：利用滚动哈希实现平均 O(n+m) 的字符串匹配
- **冲突处理**：哈希匹配后必须逐字符验证，或使用双哈希降低冲突概率
- **参数选择**：base 应大于字符集大小，mod 应为大质数

掌握字符串哈希，不仅能够高效解决子串匹配问题，更是学习后缀数组、字符串哈希树等高级数据结构的基础。与 KMP 算法相比，Rabin-Karp 的实现更简洁、扩展性更强（如多模式匹配），在实际工程中有着广泛的应用。
