# 字典树 (Trie)

## 概念解释

字典树（Trie），也称为前缀树（Prefix Tree），是一种用于高效存储和检索字符串的树形数据结构。它的名字来源于英文单词 "retrieval"（检索）的前三个字母。

**核心思想：** 字典树中，每个节点代表一个字符，从根节点到某个节点的路径构成一个字符串的前缀。根节点不存储任何字符，每条边代表一个字符。

```
          (root)
         /  |  \
        a   b   c
       / \   \
      p   n   a
     /     \   \
    p       d   t
   (E)
   
   存储了: "app", "and", "bat"
   (E) 表示 isEnd = true，该节点标记一个完整单词的结尾
```

### 关键特性

- **根节点为空**：根节点不包含字符，仅作为起点
- **路径即前缀**：从根到任意节点的路径代表一个前缀
- **isEnd 标志**：标记从根到该节点的路径是否构成一个完整的已插入单词
- **共享前缀**：具有相同前缀的单词共享路径，节省存储空间

## 为什么重要

### 1. 高效的查找和插入

字典树的插入和查找时间复杂度为 **O(L)**，其中 L 是单词的长度。这与字典中已存储的单词数量无关，非常适合大规模字符串集合的操作。

### 2. 前缀匹配

字典树天然支持前缀匹配操作。判断是否存在以某个前缀开头的单词，只需沿路径遍历到前缀的最后一个字符即可。这是搜索引擎自动补全功能的核心。

### 3. 字典序排序

对字典树进行深度优先遍历，可以按字典序输出所有存储的单词。

### 4. 空间效率

当大量单词共享相同前缀时（如 "application"、"apply"、"app"），字典树通过共享路径节点来节省空间。

## 核心原理

### 节点结构

每个字典树节点包含：
- **children**：子节点映射，通常使用哈希表（Map）或固定大小的数组（如 26 个字母）
- **isEnd**：布尔标志，标记该节点是否为某个单词的结尾

```typescript
class TrieNode {
  children: Map<string, TrieNode>
  isEnd: boolean

  constructor() {
    this.children = new Map()
    this.isEnd = false
  }
}
```

### 插入单词 (Insert)

从根节点开始，逐字符遍历单词：
1. 如果当前字符对应的子节点不存在，创建新节点
2. 移动到子节点，处理下一个字符
3. 遍历完所有字符后，将最后一个节点的 isEnd 设为 true

```typescript
insert(word: string): void {
  let node = this.root
  for (const char of word) {
    if (!node.children.has(char)) {
      node.children.set(char, new TrieNode())
    }
    node = node.children.get(char)!
  }
  node.isEnd = true
}
```

### 搜索单词 (Search)

从根节点开始，逐字符遍历：
1. 如果当前字符对应的子节点不存在，返回 false
2. 遍历完所有字符后，检查最后一个节点的 isEnd 是否为 true

```typescript
search(word: string): boolean {
  let node = this.root
  for (const char of word) {
    if (!node.children.has(char)) return false
    node = node.children.get(char)!
  }
  return node.isEnd
}
```

### 前缀匹配 (StartsWith)

与搜索类似，但不需要检查 isEnd。只要路径存在，就说明有以该前缀开头的单词。

```typescript
startsWith(prefix: string): boolean {
  let node = this.root
  for (const char of prefix) {
    if (!node.children.has(char)) return false
    node = node.children.get(char)!
  }
  return true
}
```

### 删除单词 (Delete)

删除操作需要递归处理：
1. 找到单词的最后一个字符节点
2. 将 isEnd 设为 false
3. 如果该节点没有子节点，可以安全删除
4. 递归向上删除没有子节点且不是其他单词结尾的节点

### 压缩字典树 (Compressed Trie / Radix Tree)

当字典树中存在大量只有一个子节点的节点链时，可以将这些节点合并为一个节点，用字符串片段替代单个字符，从而减少节点数量和内存开销。

```
普通字典树:          压缩字典树:
    (root)              (root)
     |                  /    \
     b                 b      c
     a                /a\     |
     n               p  nd   at
     a               |   |
     n              ple (E)
     a
     (E)

存储: "banana", "band", "apple", "cat"
```

### 时间复杂度

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| 插入 | O(L) | L 为单词长度 |
| 搜索 | O(L) | L 为单词长度 |
| 前缀匹配 | O(L) | L 为前缀长度 |
| 删除 | O(L) | L 为单词长度 |

### 空间复杂度

最坏情况下，所有单词没有公共前缀，空间复杂度为 O(N × L)，其中 N 是单词数量，L 是平均单词长度。实际使用中，由于前缀共享，空间通常远小于这个上界。

## 可视化说明

在右侧的可视化面板中，你可以直观地观察字典树的操作过程：

- **树形结构**：SVG 绘制的字典树，每个节点标注对应字符，isEnd 节点用特殊样式标记
- **插入动画**：逐步展示插入单词的过程，新创建的节点会高亮显示
- **搜索动画**：逐步展示搜索单词的过程，高亮遍历路径
- **输入交互**：输入框中输入单词，点击按钮执行插入或搜索操作

通过动画控制栏，你可以：
- 播放 / 暂停动画
- 调整动画速度
- 重置到初始状态

## 常见错误

### 1. 忘记设置 isEnd 标志

```typescript
// 错误：插入单词后忘记标记 isEnd
insert(word: string): void {
  let node = this.root
  for (const char of word) {
    if (!node.children.has(char)) {
      node.children.set(char, new TrieNode())
    }
    node = node.children.get(char)!
  }
  // 忘记 node.isEnd = true
}

// 后果：search("app") 返回 false，即使 "app" 已经插入
```

### 2. 混淆前缀匹配与精确匹配

```typescript
// startsWith("app") 只检查路径是否存在
// search("app") 还要检查 isEnd 标志

trie.insert("apple")
trie.startsWith("app")  // true - 路径 a→p→p 存在
trie.search("app")      // false - 第二个 p 的 isEnd 是 false
```

### 3. 未处理空字符串

```typescript
// 空字符串 "" 的处理需要特别注意
// 遍历循环不会执行，直接检查 root.isEnd
// 如果需要支持空字符串，应将 root.isEnd 设为 true
```

### 4. 内存开销估算不足

```typescript
// 每个节点都有一个 Map 或数组
// 对于仅存储少量短单词的场景，
// 字典树的内存开销可能大于简单的字符串数组
// 应根据实际场景选择合适的数据结构
```

## 实际应用

### 1. 自动补全（Autocomplete）

搜索引擎和输入法中，用户输入前几个字符后，系统需要快速找到所有以该前缀开头的候选词。字典树的前缀匹配特性使其成为自动补全的理想选择。

```typescript
function autocomplete(trie: Trie, prefix: string): string[] {
  let node = trie.root
  for (const char of prefix) {
    if (!node.children.has(char)) return []
    node = node.children.get(char)!
  }
  // 从该节点开始 DFS 收集所有单词
  const results: string[] = []
  collectWords(node, prefix, results)
  return results
}
```

### 2. 拼写检查器（Spell Checker）

将词典中的所有单词插入字典树，检查一个单词是否正确只需 O(L) 时间。还可以通过编辑距离算法在字典树上查找相似的正确单词。

### 3. IP 路由（最长前缀匹配）

路由器使用字典树（或压缩字典树）来存储路由表。给定一个目标 IP 地址，需要找到与之匹配的最长前缀，从而确定最佳路由路径。

### 4. T9 预测输入

老式手机的九宫格键盘输入中，数字按键对应多个字母。字典树可以高效地将数字序列映射为可能的单词列表。

### 5. 单词游戏

Boggle、Scrabble 等单词游戏中，字典树用于快速判断某个字母组合是否构成有效单词，以及在游戏板上搜索所有可能的单词。

### 6. DNA 序列匹配

生物信息学中，DNA 序列由 A、T、C、G 四种碱基组成。字典树可用于存储和检索 DNA 片段，支持高效的序列匹配和搜索。

## 总结

字典树是一种专门为字符串操作设计的树形数据结构，其核心优势包括：

- **O(L) 操作**：插入、搜索、删除的时间复杂度仅与单词长度有关
- **前缀匹配**：天然支持前缀查询，是自动补全的基础
- **共享前缀**：具有相同前缀的单词共享路径节点，节省空间
- **字典序输出**：遍历即可按字典序输出所有单词

字典树的主要局限在于内存开销——每个节点需要维护子节点映射，在字符集大或单词少时可能浪费空间。压缩字典树（Radix Tree）通过合并单子节点链来优化这一问题。

掌握字典树是理解自动补全、拼写检查、路由算法等实际应用的基础，也是算法面试中常见的数据结构主题。
