# Z 算法 (Z-Algorithm)

## 概念解释

Z 算法是一种高效的**字符串匹配算法**，它利用一个叫做 **Z 数组**（Z-array）的辅助结构，在 **O(n)** 时间内完成字符串的匹配工作。

### Z 数组的定义

给定一个长度为 n 的字符串 S，它的 Z 数组 Z[0..n-1] 定义如下：

- **Z[0]**：通常定义为 0（也可以定义为 n，取决于具体实现）
- **Z[i]**（i > 0）：S 与 S[i:]（从位置 i 开始的后缀）的**最长公共前缀**（LCP）的长度

用通俗的话说：Z[i] 告诉你，从位置 i 开始往后看，最多能和字符串开头匹配多少个字符。

```
字符串 S = "aabxaabxcaab"

位置:   0  1  2  3  4  5  6  7  8  9  10 11
字符:   a  a  b  x  a  a  b  x  c  a  a  b
Z值:    0  1  0  0  4  1  0  0  0  3  1  0
```

解释：
- Z[1] = 1：S[1:] = "abxaabxcaab" 与 S = "aabxaabxcaab" 的最长公共前缀是 "a"，长度 1
- Z[4] = 4：S[4:] = "aabxcaab" 与 S = "aabxaabxcaab" 的最长公共前缀是 "aabx"，长度 4
- Z[9] = 3：S[9:] = "aab" 与 S = "aabxaabxcaab" 的最长公共前缀是 "aab"，长度 3

## 为什么重要

Z 算法在字符串处理领域具有重要地位：

1. **线性时间复杂度**：计算 Z 数组只需 O(n) 时间，用于模式匹配只需 O(n + m) 时间
2. **实现简单**：相比 KMP 算法，Z 算法的逻辑更直观，代码更简洁
3. **应用广泛**：除了基本的模式匹配，还可以解决许多字符串问题
4. **理论基础**：Z 数组与后缀数组、LCP 数组有密切联系，是理解高级字符串算法的基础

## 核心原理

### 朴素方法：O(n^2)

最直观的方法是对每个位置 i，逐字符比较 S 和 S[i:]：

```typescript
function naiveZArray(s: string): number[] {
  const n = s.length
  const z = new Array(n).fill(0)

  for (let i = 1; i < n; i++) {
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++
    }
  }
  return z
}
```

这种方法对每个位置都从头开始比较，时间复杂度为 O(n^2)。

### 高效方法：O(n) —— 利用 Z-box

Z 算法的精髓在于利用**已知信息**来避免重复计算。核心概念是 **Z-box**：

**Z-box** 是一个区间 [l, r]，表示当前已知的最右端匹配区间。具体来说，S[l..r] 是 S 的一个前缀（即 S[0..r-l] = S[l..r]）。

#### 算法步骤

```typescript
function computeZArray(s: string): number[] {
  const n = s.length
  const z = new Array(n).fill(0)
  let l = 0  // Z-box 左边界
  let r = 0  // Z-box 右边界

  for (let i = 1; i < n; i++) {
    // 情况 1：i 在 Z-box 内部，可以利用已知信息
    if (i <= r) {
      z[i] = Math.min(r - i + 1, z[i - l])
    }

    // 情况 2：暴力扩展
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++
    }

    // 更新 Z-box
    if (i + z[i] - 1 > r) {
      l = i
      r = i + z[i] - 1
    }
  }
  return z
}
```

#### 关键思想详解

当计算 Z[i] 时，如果 i 位于当前 Z-box [l, r] 内部（即 i <= r）：

```
S:    a a b x a a b x c a a b
      |_______|         |
      0   l   r         i
      |___|
      |___|
        i-l

Z-box: S[l..r] 与 S[0..r-l] 匹配
所以: S[i..r] = S[i-l .. r-l]
因此: Z[i] >= min(r-i+1, Z[i-l])
```

这意味着我们不需要从头比较，而是可以直接从已知信息出发，将 Z[i] 初始化为一个较大的值，然后只需从该位置继续扩展。

#### 为什么是 O(n)？

关键观察：变量 r 只会向右移动，不会回退。每次 while 循环中的比较都会使 r 向右移动至少一个位置。由于 r 最多移动 n 次，所以总比较次数为 O(n)。

### 模式匹配：P$T 构造

使用 Z 算法进行模式匹配的标准方法：

1. 构造字符串：`combined = pattern + '$' + text`
   - `$` 是一个不在 pattern 和 text 中出现的分隔符
2. 计算 combined 的 Z 数组
3. 扫描 Z 数组：当 Z[i] = len(pattern) 时，说明在 text 的位置 `i - len(pattern) - 1` 处找到了匹配

```typescript
function zSearch(text: string, pattern: string): number[] {
  const combined = pattern + '$' + text
  const z = computeZArray(combined)
  const results: number[] = []
  const pLen = pattern.length

  for (let i = pLen + 1; i < combined.length; i++) {
    if (z[i] === pLen) {
      results.push(i - pLen - 1)
    }
  }
  return results
}
```

#### 为什么需要分隔符？

分隔符 `$` 保证了 Z 数组中不会出现跨越 pattern 和 text 边界的匹配。因为 `$` 不会等于 pattern 或 text 中的任何字符，所以当 i 在 text 部分时，Z[i] 只会反映 text 的后缀与 pattern 的匹配程度。

## 可视化说明

在可视化界面中，Z 算法的执行过程分为以下几个阶段：

### 1. Z 数组计算过程

- **字符串展示**：将字符串的每个字符显示在一个格子中
- **Z-box 高亮**：用彩色区间标出当前的 Z-box [l, r]
- **当前计算位置**：用特殊颜色标记正在计算 Z[i] 的位置
- **匹配比较**：逐字符展示比较过程，匹配的字符用绿色标记，不匹配用红色

### 2. 模式匹配过程

- **拼接字符串**：展示 pattern$text 的构造
- **Z 数组显示**：实时显示 Z 数组的计算结果
- **匹配发现**：当 Z[i] 等于模式串长度时，高亮显示匹配位置

### 3. 交互控制

- **播放/暂停**：自动播放或暂停动画
- **单步执行**：一步步展示每个 Z[i] 的计算过程
- **速度调节**：调整动画播放速度
- **重置**：回到初始状态

## 常见错误

### 1. 忘记使用分隔符

```typescript
// 错误：直接拼接 pattern 和 text
const combined = pattern + text  // 可能导致跨边界误匹配！

// 正确：使用分隔符
const combined = pattern + '$' + text
```

### 2. Z[0] 的处理

```typescript
// 注意：Z[0] 的定义因实现而异
// 有些实现定义 Z[0] = 0（本文采用的方式）
// 有些实现定义 Z[0] = n（字符串长度）
// 使用时要注意一致性
```

### 3. 边界条件

```typescript
// 错误：不检查空字符串
function computeZArray(s: string): number[] {
  const n = s.length
  // 如果 s 为空，下面的循环不会执行，但返回值是正确的
  // 不过最好显式处理
  if (n === 0) return []
  // ...
}
```

### 4. Z-box 更新时机

```typescript
// 错误：在 while 循环之前就更新 Z-box
// 正确：在 while 循环之后更新 Z-box
// 因为我们需要先确定 Z[i] 的最终值才能更新 Z-box
```

## 实际应用

### 1. 文本编辑器中的查找功能

文本编辑器的"查找"功能可以使用 Z 算法实现高效的字符串搜索：

```typescript
function findAllOccurrences(text: string, pattern: string): number[] {
  if (pattern.length === 0) return []
  return zSearch(text, pattern)
}

// 示例
const positions = findAllOccurrences('hello world hello', 'hello')
// 结果: [0, 12]
```

### 2. 统计不同子串数量

利用 Z 数组可以高效地统计字符串中不同子串的数量，这在生物信息学中分析 DNA 序列时非常有用。

### 3. 最长重复子串

Z 数组可以直接用于查找字符串中的最长重复子串：

```typescript
function longestRepeatedSubstring(s: string): string {
  const z = computeZArray(s)
  let maxLen = 0
  let maxPos = 0

  for (let i = 1; i < z.length; i++) {
    if (z[i] > maxLen) {
      maxLen = z[i]
      maxPos = i
    }
  }

  return s.substring(maxPos, maxPos + maxLen)
}
```

### 4. 字符串压缩检测

Z 数组可以用来检测字符串是否由某个子串重复构成：

```typescript
function findRepeatingUnit(s: string): string | null {
  const z = computeZArray(s)
  const n = s.length

  for (let i = 1; i < n; i++) {
    if (i + z[i] === n && n % i === 0) {
      return s.substring(0, i)
    }
  }
  return null
}

// "abcabcabc" -> "abc"
// "ababab" -> "ab"
```

### 5. 与后缀数组的关系

Z 数组和后缀数组的 LCP（最长公共前缀）数组有密切联系。理解 Z 算法有助于学习更高级的字符串数据结构。

## 与 KMP 算法的比较

| 特性 | Z 算法 | KMP 算法 |
|------|--------|----------|
| 时间复杂度 | O(n + m) | O(n + m) |
| 空间复杂度 | O(n + m) | O(m) |
| 核心概念 | Z 数组（LCP） | next/fail 数组（最长前后缀） |
| 直观程度 | 更直观 | 较抽象 |
| 实现难度 | 较简单 | 较复杂 |
| 预处理 | 计算 Z 数组 | 计算 next 数组 |

两者在时间复杂度上相同，选择哪个取决于具体场景和个人偏好。Z 算法的 Z 数组含义更直观（直接表示与前缀的匹配长度），而 KMP 的 next 数组需要理解"最长相等前后缀"的概念。

## 总结

Z 算法是一种优雅且高效的字符串匹配算法：

**核心思想**：
- 利用 Z 数组记录每个后缀与原串的最长公共前缀长度
- 通过 Z-box 机制避免重复计算，达到 O(n) 时间复杂度

**关键要点**：
- Z[i] = S 与 S[i:] 的最长公共前缀长度
- Z-box [l, r] 记录当前最右端的匹配区间
- 模式匹配通过 P$T 拼接实现

**优势**：
- 时间复杂度 O(n)，与 KMP 相同
- 实现简单，逻辑直观
- Z 数组本身在很多字符串问题中有用

**适用场景**：
- 单次和多次模式匹配
- 最长重复子串查找
- 字符串压缩检测
- 作为学习后缀数组等高级数据结构的基础

掌握 Z 算法不仅能解决实际的字符串匹配问题，还能帮助理解更复杂的字符串算法，如后缀数组、后缀树等。
