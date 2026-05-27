# Manacher算法

## 概念解释

Manacher算法是一种在**O(n)时间**内找到字符串中最长回文子串的高效算法。它由Glenn Manacher在1975年提出。

回文串是指正读和反读都一样的字符串，例如「aba」「abba」「racecar」。

### 核心思想

Manacher算法的精髓在于**利用已知信息避免重复计算**：

1. **奇偶统一**：通过在每个字符前后插入特殊分隔符（如`#`），将所有回文统一为「奇数长度」
2. **镜像对称**：维护一个已知的最右回文边界，利用回文的对称性，将已有计算结果「映射」到新位置
3. **线性扫描**：每个字符最多被访问两次，保证O(n)时间复杂度

### 关键术语

| 术语 | 说明 |
|------|------|
| 原始串 S | 待处理的原始字符串 |
| 变换串 T | 插入分隔符后的字符串，如 `#a#b#a#` |
| P[i] | 以T[i]为中心的回文半径（不含T[i]本身） |
| C | 当前已知最右回文的中心位置 |
| R | 当前已知最右回文的右边界（C + P[C]） |
| mirror | i关于C的对称点，mirror = 2*C - i |

## 为什么重要

Manacher算法在以下场景中非常重要：

1. **字符串处理基础**：最长回文子串问题是经典的字符串问题，面试高频考点
2. **线性时间最优**：相比暴力O(n²)或动态规划O(n²)，Manacher达到了理论最优
3. **思想可迁移**：「利用已知信息跳过重复计算」的思想在很多算法中都有应用
4. **实际应用广泛**：DNA序列分析、文本编辑器、数据压缩等领域都需要回文检测

## 核心原理

### 第一步：预处理——奇偶统一

原始字符串中，奇数长度回文和偶数长度回文的「中心」不同：

```
奇数回文 "aba"：中心是字符 'b'
偶数回文 "abba"：中心是两个 'b' 之间
```

通过在每个字符前后插入分隔符`#`，所有回文都变成奇数长度：

```
"aba"  → "#a#b#a#"   中心是 '#'
"abba" → "#a#b#b#a#" 中心是中间的 '#'
```

预处理代码：

```typescript
function preprocess(s: string): string {
  let result = '^'  // 哨兵，防止越界
  for (let i = 0; i < s.length; i++) {
    result += '#' + s[i]
  }
  result += '#$'  // 尾部哨兵
  return result
}
```

### 第二步：利用镜像对称

当计算位置`i`的回文半径`P[i]`时，如果`i`在当前已知最右回文的范围内（`i < R`），我们可以利用对称性：

```
       C 是当前回文中心
       R 是右边界
       mirror = 2*C - i 是i的镜像位置

  ... [  mirror回文  ] ... [  i的回文  ] ...
       ↑     C     ↑
       left        right
```

由于回文的对称性，`P[i]`至少等于`min(P[mirror], R - i)`：

- `P[mirror]`：镜像位置的回文半径（对称映射过来）
- `R - i`：不能超过当前回文的右边界

### 第三步：扩展与更新

在利用镜像信息得到初始值后，继续尝试向外扩展：

```typescript
// 尝试扩展
while (T[i + P[i] + 1] === T[i - P[i] - 1]) {
  P[i]++
}

// 如果扩展后超过了右边界，更新C和R
if (i + P[i] > R) {
  C = i
  R = i + P[i]
}
```

### 完整算法

```typescript
function manacher(s: string): number {
  const T = preprocess(s)
  const n = T.length
  const P = new Array(n).fill(0)
  let C = 0, R = 0

  for (let i = 1; i < n - 1; i++) {
    const mirror = 2 * C - i

    if (i < R) {
      P[i] = Math.min(R - i, P[mirror])
    }

    while (T[i + P[i] + 1] === T[i - P[i] - 1]) {
      P[i]++
    }

    if (i + P[i] > R) {
      C = i
      R = i + P[i]
    }
  }

  // P中的最大值即为最长回文长度
  return Math.max(...P)
}
```

## 可视化说明

在可视化界面中，你可以观察Manacher算法的完整执行过程：

- **变换字符串**：展示原始字符串如何插入分隔符
- **P数组计算**：逐个位置展示回文半径的计算过程
- **镜像优化**：高亮显示哪些位置利用了镜像信息（蓝色），哪些需要从头扩展（绿色）
- **中心与边界**：实时显示当前的C和R位置
- **回文扩展**：动画展示字符比较和扩展过程

通过控制面板，你可以：
- 播放/暂停动画，逐步观察每个位置的计算
- 调整速度，仔细分析关键步骤
- 使用步进模式，手动控制每一步

## 常见错误

### 1. 忘记插入分隔符

```typescript
// 错误：直接在原始字符串上运行
// 无法正确处理偶数长度回文，如 "abba"

// 正确：先预处理
const T = preprocess(s)
```

### 2. 混淆回文半径和回文长度

```typescript
// P[i] 是回文半径，不是长度！
// 回文长度 = P[i]  （在变换串中）
// 原始串中的回文长度也是 P[i]（因为分隔符的巧妙设计）

// 变换串中回文: "#a#b#a#" 的半径P=3，长度=3（原始串"aba"）
```

### 3. 边界处理不当

```typescript
// 错误：没有哨兵字符，while循环可能越界
while (T[i + P[i] + 1] === T[i - P[i] - 1]) { ... }

// 正确：使用 '^' 和 '$' 作为哨兵
const T = '^' + processed + '$'
```

### 4. 从变换串索引映射回原始串索引

```typescript
// 变换串索引 i 对应原始串索引 (i - 1) / 2
// 如果需要从变换串的中心位置恢复原始串的子串：
const centerInOriginal = (centerInT - 1) / 2
const start = centerInOriginal - (P[centerInT] - 1) / 2
const end = centerInOriginal + (P[centerInT] - 1) / 2 + 1
```

## 实际应用

### 1. DNA序列分析

在生物信息学中，DNA序列中的回文结构（如限制性内切酶识别位点）非常重要。Manacher算法可以快速找到DNA序列中的最长回文：

```typescript
function findLongestPalindrome(dna: string): string {
  const T = preprocess(dna)
  const P = new Array(T.length).fill(0)
  let C = 0, R = 0, maxLen = 0, centerIndex = 0

  for (let i = 1; i < T.length - 1; i++) {
    const mirror = 2 * C - i
    if (i < R) P[i] = Math.min(R - i, P[mirror])
    while (T[i + P[i] + 1] === T[i - P[i] - 1]) P[i]++
    if (i + P[i] > R) { C = i; R = i + P[i] }
    if (P[i] > maxLen) { maxLen = P[i]; centerIndex = i }
  }

  const start = (centerIndex - maxLen) / 2
  return dna.substring(start, start + maxLen)
}
```

### 2. 文本编辑器中的回文检测

文本编辑器可以使用Manacher算法实时检测用户输入中的最长回文，用于拼写检查或文本分析功能。

### 3. 数据压缩

某些数据压缩算法利用回文结构来减少冗余。Manacher算法可以帮助快速识别数据中的回文模式。

### 4. 面试与竞赛

最长回文子串是LeetCode等平台的经典题目（第5题），Manacher算法是最优解法。掌握这个算法不仅解决具体问题，更能理解「利用已知信息优化」的算法设计思想。

## 总结

Manacher算法是字符串处理领域的经典之作：

**核心优势**：
- O(n)时间复杂度，理论最优
- 奇偶统一处理，逻辑简洁
- 利用镜像对称避免重复计算

**关键思想**：
- 预处理：插入分隔符统一奇偶
- 维护中心C和右边界R
- 利用mirror位置的已知信息
- 每个字符最多被访问两次

**适用场景**：
- 需要查找最长回文子串
- 需要统计所有回文子串
- DNA序列分析
- 字符串竞赛题目

**复杂度**：
- 时间：O(n)
- 空间：O(n)

Manacher算法展示了一个重要的算法设计原则：**通过维护辅助信息，将看似需要重复计算的问题转化为线性扫描**。这种思想在KMP算法、Z算法等其他字符串算法中也有体现。
