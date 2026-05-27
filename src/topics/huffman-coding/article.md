# 哈夫曼编码 (Huffman Coding)

## 概念解释

哈夫曼编码是一种**无损数据压缩**算法，由 David Huffman 在 1952 年提出。它的核心思想是：为出现频率高的字符分配**较短**的编码，为出现频率低的字符分配**较长**的编码，从而使整体编码长度最短。

### 关键术语

| 术语 | 说明 |
|------|------|
| 前缀码 (Prefix Code) | 任何一个字符的编码都不是其他字符编码的前缀 |
| 频率 (Frequency) | 字符在文本中出现的次数 |
| 哈夫曼树 | 由贪心策略构建的带权路径长度最短的二叉树 |
| 变长编码 | 不同字符使用不同长度的编码 |

### 编码示例

对于文本 `aababc`：

| 字符 | 频率 | 定长编码 (ASCII) | 哈夫曼编码 |
|------|------|-----------------|-----------|
| a | 3 | 01100001 (8位) | 0 (1位) |
| b | 2 | 01100010 (8位) | 10 (2位) |
| c | 1 | 01100011 (8位) | 11 (2位) |

- 定长编码总长度：6 x 8 = 48 位
- 哈夫曼编码总长度：3 x 1 + 2 x 2 + 1 x 2 = 11 位

## 为什么重要

哈夫曼编码在计算机科学和信息论中具有重要地位：

1. **理论最优**：在已知字符频率的情况下，哈夫曼编码产生平均码长最短的前缀码
2. **广泛应用**：ZIP、GZIP、PNG、JPEG、MP3 等压缩格式都使用了哈夫曼编码或其变体
3. **信息论基础**：是理解 Shannon 熵、信源编码定理的重要实践案例
4. **贪心算法经典**：是贪心策略的典型应用，展示了局部最优如何达到全局最优

## 核心原理

### 构建哈夫曼树的步骤

哈夫曼算法使用**贪心策略**构建编码树：

1. 统计每个字符的出现频率
2. 为每个字符创建一个叶子节点，频率作为权值
3. 将所有节点放入**最小堆（优先队列）**
4. 重复以下步骤直到只剩一个节点：
   - 从堆中取出频率最小的两个节点
   - 创建一个新的父节点，频率为两个子节点之和
   - 将父节点放回堆中
5. 最终剩下的节点就是哈夫曼树的根

```typescript
interface HuffmanNode {
  char: string | null   // 叶子节点存储字符，内部节点为 null
  freq: number          // 字符频率
  left: HuffmanNode | null
  right: HuffmanNode | null
}

function buildHuffmanTree(freq: Map<string, number>): HuffmanNode | null {
  // 创建最小堆
  const heap: HuffmanNode[] = []
  for (const [ch, f] of freq) {
    heap.push({ char: ch, freq: f, left: null, right: null })
  }
  heap.sort((a, b) => a.freq - b.freq)

  while (heap.length > 1) {
    const left = heap.shift()!    // 取出最小
    const right = heap.shift()!   // 取出次小
    const parent: HuffmanNode = {
      char: null,
      freq: left.freq + right.freq,
      left,
      right,
    }
    // 插入并保持排序
    const idx = heap.findIndex(n => n.freq > parent.freq)
    if (idx === -1) heap.push(parent)
    else heap.splice(idx, 0, parent)
  }

  return heap[0] ?? null
}
```

### 生成编码表

从根节点遍历哈夫曼树，走左分支记为 `0`，走右分支记为 `1`：

```typescript
function buildCodeTable(root: HuffmanNode | null): Map<string, string> {
  const table = new Map<string, string>()
  if (!root) return table

  function dfs(node: HuffmanNode, code: string) {
    if (node.char !== null) {
      table.set(node.char, code || '0')  // 单字符情况
      return
    }
    if (node.left) dfs(node.left, code + '0')
    if (node.right) dfs(node.right, code + '1')
  }

  dfs(root, '')
  return table
}
```

### 编码与解码

**编码**：查表替换每个字符

```typescript
function encode(text: string, codeTable: Map<string, string>): string {
  let result = ''
  for (const ch of text) {
    result += codeTable.get(ch)!
  }
  return result
}
```

**解码**：从根节点沿编码位遍历树，到达叶子节点时输出字符

```typescript
function decode(encoded: string, root: HuffmanNode): string {
  let result = ''
  let node = root
  for (const bit of encoded) {
    node = bit === '0' ? node.left! : node.right!
    if (node.char !== null) {
      result += node.char
      node = root  // 回到根节点
    }
  }
  return result
}
```

### 时间复杂度

| 步骤 | 时间复杂度 | 说明 |
|------|------------|------|
| 频率统计 | O(n) | 遍历文本一次 |
| 构建哈夫曼树 | O(k log k) | k 为不同字符数，每次堆操作 O(log k) |
| 生成编码表 | O(k) | 遍历树一次 |
| 编码 | O(n) | 遍历文本一次 |
| 解码 | O(m) | m 为编码长度 |
| **总计** | **O(n log k)** | n 为文本长度，k 为字符种类数 |

## 可视化说明

哈夫曼树的可视化可以帮助理解编码的生成过程：

```
        (6)
       /   \
     a(3)  (3)
           /   \
         b(2)  c(1)
```

- 叶子节点标注字符和频率
- 内部节点标注子树频率之和
- 左分支编码为 `0`，右分支编码为 `1`
- 频率高的字符离根更近，编码更短

通过交互式可视化，你可以：
- 观察每一步合并过程
- 查看优先队列的状态变化
- 理解贪心策略如何产生最优解

## 常见错误

### 1. 忘记处理前缀码性质

```typescript
// 错误：生成的编码可能不是前缀码
// 如果 a="0", b="01"，那么 "01" 无法确定是 "b" 还是 "a" + 某个字符

// 正确：哈夫曼树天然保证前缀码性质
// 任何字符的编码都在叶子节点上，不可能是其他编码的前缀
```

### 2. 单字符边界情况

```typescript
// 当文本只有一个字符时，哈夫曼树退化
// 正确处理：编码为 "0"（单个位）
function encode(text: string, codeTable: Map<string, string>): string {
  if (text.length === 0) return ''
  if (new Set(text).size === 1) return '0'.repeat(text.length)
  // ... 正常编码
}
```

### 3. 优先队列实现不正确

```typescript
// 错误：使用普通数组而不排序
const heap = [node1, node2, node3]
const min = heap.pop()  // 取的是最后一个，不一定是最小的

// 正确：每次取出前排序，或使用最小堆
heap.sort((a, b) => a.freq - b.freq)
const min = heap.shift()  // 取出最小的
```

## 实际应用

### 1. 文件压缩 (ZIP/GZIP)

ZIP 格式使用 Deflate 算法，其中包含哈夫曼编码：
- 先用 LZ77 算法消除重复数据
- 再用哈夫曼编码压缩剩余数据

### 2. 图像压缩 (JPEG/PNG)

- **JPEG**：对 DCT 变换后的系数进行哈夫曼编码
- **PNG**：使用 Deflate（包含哈夫曼编码）进行无损压缩

### 3. 音频压缩 (MP3)

MP3 编码中，量化后的频谱系数使用哈夫曼编码进一步压缩。

### 4. 通信协议

HTTP/2 头部压缩（HPACK）使用了静态哈夫曼编码来压缩 HTTP 头部字段。

## 与 Shannon 编码的比较

| 特性 | 哈夫曼编码 | Shannon-Fano 编码 |
|------|-----------|-------------------|
| 构建方式 | 自底向上（合并） | 自顶向下（分裂） |
| 最优性 | 全局最优 | 可能非最优 |
| 实现复杂度 | O(n log n) | O(n log n) |
| 树的平衡性 | 不一定平衡 | 递归二分 |

哈夫曼编码保证了在已知概率分布下**平均码长最短**，而 Shannon-Fano 编码在某些概率分布下可能产生次优编码。

## 总结

哈夫曼编码是一种经典且实用的算法：

**优点**：
- 前缀码保证唯一可译性
- 贪心策略保证全局最优
- 实现简单，效率高 O(n log n)
- 广泛应用于各种压缩格式

**缺点**：
- 需要预先知道字符频率
- 需要传输编码表（或频率表）给解码端
- 对于均匀分布的数据压缩效果有限
- 不适合动态数据流（需要两遍扫描）

**适用场景**：
- 静态数据压缩
- 字符频率分布不均匀的文本
- 作为更复杂压缩算法的组成部分
- 教学中理解贪心算法和信息论

理解哈夫曼编码不仅有助于掌握压缩技术，更是理解信息论中 Shannon 熵、信源编码定理等核心概念的重要基础。
