# 广义后缀自动机 (Generalized Suffix Automaton)

## 概念解释

广义后缀自动机（Generalized Suffix Automaton，简称 GSAM）是**后缀自动机（SAM）在多字符串上的推广**。它能够同时接受多个字符串的所有子串。

### 核心思想

普通后缀自动机只能处理单个字符串，而广义后缀自动机将多个字符串「合并」到同一个自动机中：

- 只维护**一个**自动机结构
- 每构建完一个新字符串后，将当前指针 `last` **重置回根节点**，然后从根节点开始构建下一个字符串
- 所有字符串共享公共前缀对应的状态，节省空间

### 基本术语

| 术语 | 说明 |
|------|------|
| 状态 (State) | 自动机中的节点，代表一组 endpos 等价类 |
| 转移 (Transition) | 状态之间的有向边，标记为字符 |
| 后缀链接 (Suffix Link) | 指向当前状态代表的最长后缀所属的状态 |
| 来源标记 (Source) | 记录某个状态来自哪些输入字符串 |
| 根节点 (Root) | 初始状态，编号为 0，len=0 |

### 与单串 SAM 的关系

```
单串 SAM:  构建 "abc"  -->  自动机 A
单串 SAM:  构建 "bc"   -->  自动机 B

广义 SAM:  构建 "abc"，重置 last，构建 "bc"  -->  自动机 C（包含 A 和 B 的所有信息）
```

GSAM 可以看作是将多个 SAM 合并到一个结构中，且空间更优。

## 为什么重要

### 1. 多串子串问题的统一框架

很多字符串问题涉及多个字符串：

- 多个文本串中查找公共子串
- 多个模式串的子串统计
- 多串匹配问题

GSAM 为这些问题提供了统一的解决框架。

### 2. 空间效率高

- 分别建 SAM：空间为 O(Σ 2|si|) ≈ O(2Σ|si|)
- 建 GSAM：空间为 O(Σ|si|)，因为多个字符串共享公共前缀对应的状态

当多个字符串有较长的公共前缀时，GSAM 的空间优势更加明显。

### 3. 查询效率高

在 GSAM 上可以同时进行多串匹配：

- 子串存在性查询：O(|p|)
- 多串最长公共子串：O(Σ|si|)
- 不同子串计数：O(状态数)

### 4. 与 Trie + SAM 的关系

另一种构建 GSAM 的方法是：先将所有字符串插入 Trie，然后在 Trie 上构建 SAM。这种方法等价于逐串构建 GSAM，但实现方式不同：

- **逐串构建**：逐个字符串处理，每条新串从 root 开始
- **Trie + SAM**：先建 Trie，再在 Trie 的 BFS 序上构建 SAM

两种方法得到的自动机结构相同。

## 核心原理

### 构造方法

GSAM 的构建过程与单串 SAM 几乎相同，唯一的区别是**每条新串开始时重置 last**：

```typescript
function buildGSAM(strings: string[]): void {
  initSAM()  // 初始化，创建根节点

  for (let i = 0; i < strings.length; i++) {
    last = 0  // 关键：每条新串从根节点开始

    for (const ch of strings[i]) {
      extend(ch, i)  // 传入字符串编号用于来源标记
    }
  }
}
```

### extend 函数

extend 函数与单串 SAM 基本一致，但增加了**来源标记**的维护：

```typescript
function extend(c: string, stringIdx: number): void {
  const cur = newState()
  cur.len = states[last].len + 1
  cur.source.add(stringIdx)  // 标记来源

  let p = last
  while (p !== -1 && !states[p].transitions[c]) {
    states[p].transitions[c] = cur
    p = states[p].link
  }

  if (p === -1) {
    cur.link = 0
  } else {
    const q = states[p].transitions[c]
    if (states[p].len + 1 === states[q].len) {
      cur.link = q
    } else {
      // 分裂（clone）
      const clone = newState()
      clone.len = states[p].len + 1
      clone.link = states[q].link
      clone.transitions = { ...states[q].transitions }
      clone.source = new Set(states[q].source)  // clone 继承 q 的来源

      // 重定向转移边
      while (p !== -1 && states[p].transitions[c] === q) {
        states[p].transitions[c] = clone
        p = states[p].link
      }
      states[q].link = clone
      cur.link = clone
    }
  }

  last = cur
}
```

### 状态来源标记

每个状态维护一个集合，记录它来自哪些输入字符串：

- 新创建的状态：来源为当前字符串
- clone 状态：来源与被复制的状态 q 相同
- 通过后缀链接传播：子节点的来源是父节点来源的超集

### 多串公共子串查询

要找所有字符串的公共子串：

1. 遍历所有状态
2. 找出 `source.size === 字符串总数` 的状态
3. 这些状态代表的子串就是公共子串
4. 取其中最长的即可得到最长公共子串

```typescript
function findLongestCommonSubstring(): number {
  let best = 0
  for (let i = 1; i < states.length; i++) {
    if (states[i].source.size === totalStrings) {
      best = Math.max(best, states[i].len)
    }
  }
  return best
}
```

### 多串子串计数

某个子串在多少个字符串中出现：直接查看对应状态的 `source.size`。

所有字符串的不同子串总数：

```typescript
let count = 0
for (let i = 1; i < states.length; i++) {
  count += states[i].len - states[states[i].link].len
}
```

这个公式与单串 SAM 相同，因为每个状态代表的子串数量为 `len[v] - len[link[v]]`。

## 可视化说明

在可视化界面中，GSAM 表示为一个有向图：

- **圆圈**表示状态，标注状态编号和 len 值
- **实线箭头**表示转移边，标注字符
- **虚线箭头**表示后缀链接
- **颜色编码**区分不同来源的状态
- 构建过程中可以观察到每添加一个字符后的状态变化

通过可视化可以直观地观察：

- 多个字符串如何共享状态
- 重置 last 后从根节点重新构建的过程
- clone 分裂时来源标记的继承
- 公共子串对应的状态特征

## 常见错误

### 1. 没有 reset 到 root 就构建新串

```typescript
// 错误：忘记重置 last
function buildGSAM(strings: string[]): void {
  initSAM()
  for (const str of strings) {
    // last 没有重置！会从上一个串的末尾状态继续
    for (const ch of str) {
      extend(ch)
    }
  }
}

// 正确：每条新串从根节点开始
function buildGSAM(strings: string[]): void {
  initSAM()
  for (const str of strings) {
    last = 0  // 重置到根节点
    for (const ch of str) {
      extend(ch)
    }
  }
}
```

这个错误会导致：
- 新字符串的前缀无法被正确识别
- 后缀链接结构错误
- 所有后续查询结果都不正确

### 2. 来源标记遗漏

```typescript
// 错误：新状态没有标记来源
const cur = newState()
cur.len = states[last].len + 1
// 忘记 cur.source.add(stringIdx)

// 正确：
const cur = newState()
cur.len = states[last].len + 1
cur.source.add(stringIdx)
```

遗漏来源标记会导致无法正确查询某个子串出现在哪些字符串中。

### 3. clone 节点来源处理错误

```typescript
// 错误：clone 的来源为空
const clone = newState()
clone.source = new Set()  // 空集合，错误！

// 正确：clone 继承被复制节点的来源
const clone = newState()
clone.source = new Set(states[q].source)
```

clone 节点代表的子串集合是 q 的子集，因此必须继承 q 的来源标记。如果 clone 的来源为空，会导致公共子串查询遗漏结果。

### 4. 混淆来源标记与出现次数

来源标记记录的是「这个子串在哪些字符串中出现」，而不是「出现了多少次」。例如子串 "ab" 在字符串 0 中出现了 3 次，其来源标记仍然是 `{0}`，而不是 `{0, 0, 0}`。

## 实际应用

### 1. 多串最长公共子串

给定 n 个字符串，找出它们的最长公共子串：

- 构建 GSAM，同时维护来源标记
- 遍历所有状态，找 `source.size === n` 的状态
- 取最大的 `len` 值

时间复杂度：O(Σ|si|)

### 2. 多串子串统计

查询某个子串在多少个不同的字符串中出现：

- 在 GSAM 上走对应的转移路径
- 到达的状态的 `source.size` 就是答案

时间复杂度：O(|pattern|)

### 3. 多串模式匹配

在多个文本串中查找某个模式串：

- 构建 GSAM 后，直接在自动机上走
- 如果能走完，说明是某个字符串的子串
- 同时可以通过来源标记知道是哪些字符串的子串

### 4. 不同子串统计

统计多个字符串中所有不同的子串总数：

- 构建 GSAM
- 所有状态的 `len[v] - len[link[v]]` 之和

这比暴力枚举所有子串去重要高效得多。

### 5. 基因序列分析

在生物信息学中，GSAM 可以用于：

- 多条 DNA 序列的公共片段查找
- 序列相似性分析
- 重复序列检测

## 总结

广义后缀自动机是后缀自动机在多字符串场景下的自然推广：

**核心要点**：

- 每构建新串时重置 `last` 到根节点
- 维护每个状态的来源标记
- clone 节点继承被复制节点的来源
- 空间复杂度 O(Σ|si|)，与总长度线性相关

**适用场景**：

- 多串公共子串问题
- 多串子串存在性查询
- 多串不同子串计数
- 多串模式匹配

**与单串 SAM 的关系**：

- 构造方法几乎相同，唯一区别是重置 last
- 所有单串 SAM 的性质在 GSAM 中依然成立
- 额外支持来源相关的查询

掌握广义后缀自动机，能够高效地解决大量多字符串相关的子串问题，是字符串算法领域的重要工具。
