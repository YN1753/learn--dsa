# 可持久化字典树 (Persistent Trie)

## 概念解释

可持久化字典树（Persistent Trie）是在普通字典树（Trie）的基础上引入**版本管理**能力的数据结构。它允许我们在每次插入新数据时保留所有历史版本，使得我们可以随时回溯到任意历史状态进行查询操作。

核心思想非常简单：**每次插入时，不修改已有节点，而是只复制从根到叶子路径上的节点，其余节点与历史版本共享。**

这就是所谓的「路径复制」技术——与可持久化线段树（主席树）的思路完全一致。

### 普通 Trie vs 可持久化 Trie

| 特性 | 普通 Trie | 可持久化 Trie |
|------|-----------|---------------|
| 版本管理 | 仅保留最新版本 | 保留所有历史版本 |
| 插入操作 | 直接修改节点 | 路径复制，共享未修改节点 |
| 空间复杂度 | O(总字符数) | O(总字符数 x log 值域) |
| 历史查询 | 不支持 | 支持任意版本查询 |

## 为什么重要

可持久化字典树在算法竞赛和实际工程中都有重要应用：

1. **区间异或最大值**：这是可持久化 Trie 最经典的应用。给定一个数组，查询区间 [l, r] 内某个数与给定值 x 的异或最大值，可以在 O(log 值域) 时间内完成。

2. **最大异或对**：在一组数中找到两个数使得它们的异或值最大。

3. **字符串版本历史**：在文本编辑器等场景中，需要回溯到某个历史版本进行查询。

4. **结合可持久化思想**：可持久化 Trie 展示了路径复制这一通用技巧，掌握后可以推广到可持久化线段树、可持久化平衡树等多种数据结构。

## 核心原理

### 节点结构

二进制可持久化 Trie 通常从高位到低位存储每个数的二进制表示：

```typescript
interface TrieNode {
  children: [TrieNode | null, TrieNode | null]  // 0 和 1 两个分支
  count: number  // 经过该节点的数的个数
}
```

### 路径复制（Path Copying）

每次插入一个新数时：

1. 从根节点开始，沿着二进制位的方向向下走
2. 对于路径上的每个节点，创建一个**新节点**（复制原节点的信息）
3. 将新节点的对应子指针指向新创建的子节点
4. 不在路径上的节点直接共享旧版本的引用

```
版本 0 (空):         root0
                    /      \
                  ...      ...

插入数 5 (101):     root1 (新建)
                    /        \
               child1(新建)   root0.right (共享)
               /       \
          child2(新建)  root0.left.right (共享)
```

### 版本 Root 数组

维护一个 `roots[]` 数组，`roots[i]` 表示插入第 i 个数之后的 Trie 根节点。

```typescript
const roots: TrieNode[] = []
roots[0] = emptyRoot  // 空树

for (let i = 0; i < n; i++) {
  roots[i + 1] = insert(roots[i], a[i])
}
```

### 区间查询原理

区间 [l, r] 的查询利用了前缀思想：

- `roots[r]` 包含了前 r 个数的信息
- `roots[l-1]` 包含了前 l-1 个数的信息
- 两者做差，即可得到区间 [l, r] 的信息

在查询时，对于每个二进制位，我们贪心地选择与目标位相反的方向（使异或值为 1），并通过 `count` 判断该方向在区间 [l, r] 内是否有数存在。

```typescript
function query(roots: TrieNode[], l: number, r: number, x: number): number {
  let nodeL = roots[l - 1]  // l-1 版本的根
  let nodeR = roots[r]      // r 版本的根
  let result = 0

  for (let bit = 30; bit >= 0; bit--) {
    const b = (x >> bit) & 1
    const desired = 1 - b  // 贪心：选择异或后为 1 的方向

    // 检查 desired 方向在 [l, r] 区间内是否有数
    const countDesired = (nodeR.children[desired]?.count ?? 0) - (nodeL.children[desired]?.count ?? 0)

    if (countDesired > 0) {
      result |= (1 << bit)
      nodeL = nodeL.children[desired]!
      nodeR = nodeR.children[desired]!
    } else {
      nodeL = nodeL.children[b]!
      nodeR = nodeR.children[b]!
    }
  }

  return result
}
```

### 时间与空间复杂度

| 操作 | 时间复杂度 | 说明 |
|------|------------|------|
| 插入一个数 | O(log V) | V 为值域大小，遍历二进制位 |
| 区间异或最大值查询 | O(log V) | 贪心遍历二进制位 |
| 空间 | O(n log V) | 每次插入新建 log V 个节点 |

## 可视化说明

在可视化界面中，可持久化 Trie 展示为：

- **多个版本**并排显示，每个版本有自己的根节点
- **新建节点**用绿色高亮，表示路径复制产生的新节点
- **共享节点**用蓝色标记，表示多个版本共同使用的节点
- **箭头**表示父子关系，虚线表示共享引用

通过可视化可以直观观察：
- 每次插入只新建 O(log V) 个节点
- 大部分节点是共享的，空间效率很高
- 不同版本之间的树结构差异

## 常见错误

### 1. 忘记复制路径节点，直接修改历史版本

```typescript
// 错误：直接在原节点上修改，破坏了历史版本
function badInsert(node: TrieNode, value: number): TrieNode {
  let current = node
  for (let bit = 30; bit >= 0; bit--) {
    const b = (value >> bit) & 1
    if (!current.children[b]) {
      current.children[b] = createNode()  // 直接修改了原节点！
    }
    current = current.children[b]!
    current.count++
  }
  return node  // 历史版本已被破坏
}

// 正确：创建新节点，保持历史版本不变
function goodInsert(node: TrieNode, value: number): TrieNode {
  const newRoot = createNode()
  let newCurrent = newRoot
  let oldCurrent = node

  for (let bit = 30; bit >= 0; bit--) {
    const b = (value >> bit) & 1
    const other = 1 - b

    // 共享另一个分支
    newCurrent.children[other] = oldCurrent.children[other]
    // 新建当前分支
    newCurrent.children[b] = createNode()
    newCurrent.children[b]!.count = (oldCurrent.children[b]?.count ?? 0) + 1

    newCurrent = newCurrent.children[b]!
    oldCurrent = oldCurrent.children[b] ?? createNode()
  }

  return newRoot
}
```

### 2. 二进制位顺序错误

```typescript
// 错误：从低位到高位构建 Trie
for (let bit = 0; bit <= 30; bit++) { ... }

// 正确：从高位到低位构建 Trie（贪心策略要求高位优先）
for (let bit = 30; bit >= 0; bit--) { ... }
```

从高位到低位是因为贪心策略要求我们优先让高位异或结果为 1，这样得到的异或值最大。

### 3. 版本数组索引偏移

```typescript
// 错误：索引没有对齐
roots[0] = insert(roots[-1], a[0])  // roots[-1] 不存在

// 正确：roots[0] 为空树，roots[i] 表示插入前 i 个数后的版本
roots[0] = emptyRoot
for (let i = 0; i < n; i++) {
  roots[i + 1] = insert(roots[i], a[i])
}
// 查询区间 [l, r] 时使用 roots[l-1] 和 roots[r]
```

### 4. count 维护错误

```typescript
// 错误：新节点的 count 没有加上旧节点的 count
newNode.count = 1  // 丢失了之前经过该节点的数的计数

// 正确：
newNode.count = (oldNode?.count ?? 0) + 1
```

## 实际应用

### 1. 区间异或最大值（经典问题）

给定数组 a[1..n]，多次查询：在 a[l..r] 中找一个数使得它与 x 的异或值最大。

```typescript
// 预处理：构建可持久化 Trie
for (let i = 0; i < n; i++) {
  roots[i + 1] = insert(roots[i], a[i])
}

// 查询：区间 [l, r] 中与 x 异或的最大值
function queryMaxXor(l: number, r: number, x: number): number {
  return query(roots, l, r, x)
}
```

### 2. 最大异或对

在数组中找到两个数使得异或值最大。可持久化 Trie 可以将此问题优化到 O(n log V)：

```typescript
let maxResult = 0
for (let i = 0; i < n; i++) {
  roots[i + 1] = insert(roots[i], a[i])
  // 查询前 i 个数中与 a[i] 异或的最大值
  const val = query(roots, 1, i, a[i])
  maxResult = Math.max(maxResult, val)
}
```

### 3. 字串版本历史查询

在文本编辑器中，每次保存形成一个版本，可持久化 Trie 可以支持：
- 查询某个历史版本中是否存在某个前缀
- 比较两个版本的差异

### 4. 离线区间查询

将所有查询按照右端点排序，利用可持久化 Trie 的版本特性，在线性时间内处理所有查询。

## 总结

可持久化字典树是一种强大的数据结构：

**核心要点**：
- 路径复制是可持久化的通用技术，每次插入只新建 O(log V) 个节点
- 版本 Root 数组记录了每个历史版本的入口
- 区间查询利用前缀差值思想：[l, r] = [1, r] - [1, l-1]
- 二进制位必须从高位到低位构建，以支持贪心策略

**适用场景**：
- 区间异或最大值查询
- 最大异或对问题
- 需要保留历史版本的字典树操作
- 离线区间查询问题

**复杂度**：
- 时间：插入和查询均为 O(log V)
- 空间：O(n log V)，其中 n 为插入的数的个数，V 为值域大小

掌握可持久化 Trie 不仅能解决一类经典问题，更能帮助理解可持久化数据结构的通用思想，为学习可持久化线段树、可持久化平衡树等打下基础。
