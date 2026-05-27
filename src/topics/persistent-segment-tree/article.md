# 可持久化线段树 (Persistent Segment Tree / 主席树)

## 概念解释

可持久化线段树，又称**主席树**（因发明者名字谐音而得名），是一种能够**保留所有历史版本**的线段树。

普通线段树在修改后会丢失之前的状态。而可持久化线段树可以在任意时刻访问任何一个历史版本，并在某个版本基础上进行查询或修改。

### 核心思想：函数式数据结构

可持久化线段树的设计灵感来自**函数式编程**中的不可变数据结构：

- 每次「修改」操作不会破坏旧版本
- 而是创建一个**新版本**，新版本与旧版本共享大部分结构
- 只有被修改的路径上的节点会被复制

```
版本 0 (初始):          版本 1 (修改位置 3):
      [1]                     [1']
     /   \                   /   \
   [2]   [3]              [2']   [3]
   / \   / \              / \   / \
  [4][5][6][7]          [4][5'] [6][7]
                              ↑
                    只新建了从根到叶子的路径节点
                    [3] 和 [4] 直接指向旧版本
```

### 关键术语

| 术语 | 说明 |
|------|------|
| 版本 (Version) | 线段树的一个历史状态 |
| 路径复制 | 只复制从根到修改点路径上的节点 |
| 节点共享 | 未修改的子树在新旧版本间共享 |
| 权值线段树 | 按值域建立的线段树，用于求第 k 大 |

## 为什么重要

可持久化线段树是高级算法竞赛和实际工程中的重要工具：

1. **历史版本回溯**：可以随时访问任意时刻的数据状态，类似数据库的时间旅行查询
2. **区间第 k 大问题**：经典应用，时间复杂度 O(log n)，比排序后暴力查询高效得多
3. **函数式思想**：展示了如何通过「不修改，只新建」的方式实现高效的版本管理
4. **空间高效**：通过节点共享，m 次修改只需要 O(m log n) 的额外空间

## 核心原理

### 1. 节点结构

每个节点存储左右子节点的指针和维护的信息（如区间和、元素个数等）：

```typescript
class Node {
  left: Node | null   // 左子节点
  right: Node | null  // 右子节点
  count: number       // 区间内元素个数（权值线段树）

  constructor(left: Node | null = null, right: Node | null = null, count: number = 0) {
    this.left = left
    this.right = right
    this.count = count
  }
}
```

### 2. 建树 (Build)

初始版本的建树与普通线段树相同，时间复杂度 O(n)：

```typescript
function build(arr: number[], lo: number, hi: number): Node {
  if (lo === hi) {
    return new Node(null, null, arr[lo])
  }
  const mid = Math.floor((lo + hi) / 2)
  const leftChild = build(arr, lo, mid)
  const rightChild = build(arr, mid + 1, hi)
  return new Node(leftChild, rightChild, leftChild.count + rightChild.count)
}
```

### 3. 单点修改 (Update) —— 路径复制

这是可持久化线段树的核心操作。修改时，不直接修改原节点，而是**新建节点**：

```typescript
function update(prev: Node, lo: number, hi: number, pos: number, val: number): Node {
  if (lo === hi) {
    return new Node(null, null, prev.count + val)
  }
  const mid = Math.floor((lo + hi) / 2)
  if (pos <= mid) {
    // 左子树修改，新建左子节点，右子节点共享
    return new Node(update(prev.left!, lo, mid, pos, val), prev.right, 0)
  } else {
    // 右子树修改，新建右子节点，左子节点共享
    return new Node(prev.left, update(prev.right!, mid + 1, hi, pos, val), 0)
  }
}
```

**关键点**：每次 update 只新建 O(log n) 个节点，其余节点通过指针共享。

### 4. 区间第 k 大查询

这是主席树最经典的应用。对序列每个前缀 [1, i] 建立权值线段树版本，查询 [l, r] 的第 k 大时，同时在版本 `root[r]` 和版本 `root[l-1]` 上做差值二分：

```typescript
function queryKth(rootR: Node, rootL: Node, lo: number, hi: number, k: number): number {
  if (lo === hi) return lo
  const mid = Math.floor((lo + hi) / 2)
  const leftCount = rootR.left!.count - rootL.left!.count
  if (k <= leftCount) {
    return queryKth(rootR.left!, rootL.left!, lo, mid, k)
  } else {
    return queryKth(rootR.right!, rootL.right!, mid + 1, hi, k - leftCount)
  }
}
```

### 时间复杂度总结

| 操作 | 时间复杂度 | 说明 |
|------|------------|------|
| 建树 | O(n) | 一次性构建初始版本 |
| 单点修改（新建版本） | O(log n) | 路径复制，新建 log n 个节点 |
| 区间第 k 大查询 | O(log n) | 两棵线段树同时二分 |
| 空间（m 次修改） | O((n + m) log n) | 初始 O(n) + 每次修改 O(log n) |

## 可视化说明

在可视化界面中，可持久化线段树展示了以下关键概念：

- **版本树**：多个版本并排显示，可以清晰看到节点的共享关系
- **路径高亮**：新建节点时，从根到叶子的路径被高亮显示
- **共享连线**：不同版本中指向相同节点的指针用特殊颜色标记
- **逐步动画**：可以观察每次修改操作如何只影响路径上的节点

通过动画控制栏，你可以：
- 播放 / 暂停动画
- 单步执行每一步操作
- 调整动画速度
- 查看任意历史版本

## 常见错误

### 1. 忘记复制节点，直接修改原节点

```typescript
// ❌ 错误：直接修改旧节点，破坏了历史版本
function badUpdate(node: Node, lo: number, hi: number, pos: number, val: number): void {
  if (lo === hi) {
    node.count += val  // 直接修改！旧版本被破坏
    return
  }
  // ...
}

// ✅ 正确：新建节点，保留旧版本
function goodUpdate(prev: Node, lo: number, hi: number, pos: number, val: number): Node {
  if (lo === hi) {
    return new Node(null, null, prev.count + val)  // 新建节点
  }
  // ...
}
```

### 2. 离散化错误

主席树通常需要对值域离散化。常见错误：

```typescript
// ❌ 错误：离散化后没有正确映射查询值
const values = [100, 300, 500, 200, 400]
// 排序去重后: [100, 200, 300, 400, 500]
// 查询时需要将原始值映射到离散化后的下标

// ✅ 正确：使用二分查找映射
function discretize(val: number, sorted: number[]): number {
  let lo = 0, hi = sorted.length - 1
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (sorted[mid] >= val) hi = mid
    else lo = mid + 1
  }
  return lo
}
```

### 3. 混淆 root 数组的含义

```typescript
// ❌ 错误：root[i] 表示前 i 个元素的版本
// 查询 [l, r] 时应该用 root[r] - root[l-1]
// 而不是 root[r] - root[l]

// ✅ 正确：
// root[0] = 空树
// root[i] = 对前 i 个元素建立的权值线段树
// 查询 [l, r] 第 k 大 = query(root[r], root[l-1], k)
```

## 实际应用

### 1. 区间第 k 小/大查询

这是主席树最经典的应用。给定序列，支持查询任意区间 [l, r] 中第 k 小的元素。

```typescript
// 离散化 + 前缀权值线段树
// 时间: O(n log n) 建树, O(log n) 查询
// 空间: O(n log n)
```

### 2. 区间不同元素个数

查询区间 [l, r] 中有多少种不同的元素。对序列从左到右遍历，记录每个值上一次出现的位置，用主席树维护。

### 3. 带修区间和（可持久化 + 树状数组）

将可持久化线段树与树状数组结合，可以实现「带修改的区间第 k 大」等高级操作。

### 4. 版本控制 / 快照

可持久化数据结构的思想广泛应用于：
- **数据库的时间旅行查询**：查看任意时刻的数据状态
- **编辑器的撤销功能**：保留每一步操作的文档状态
- **函数式编程**：不可变数据结构的高效实现

## 总结

可持久化线段树（主席树）是线段树的重要扩展：

**核心思想**：
- 函数式设计：不修改旧数据，只新建变化的部分
- 路径复制：每次修改只新建 O(log n) 个节点
- 节点共享：未修改的子树在版本间共享，节省空间

**优点**：
- 支持历史版本查询
- 空间高效：O(m log n) 额外空间
- 查询高效：O(log n) 时间复杂度
- 实现相对简洁

**缺点**：
- 空间消耗仍比普通线段树大
- 只支持单点修改（区间修改需要标记持久化，复杂度较高）
- 需要离散化处理

**适用场景**：
- 需要访问历史版本的查询
- 区间第 k 小/大问题
- 需要「时间旅行」功能的系统
- 函数式编程中需要高效不可变数据结构

理解可持久化线段树是掌握高级数据结构的重要一步，它展示了如何用简单的「路径复制」策略实现强大的版本管理功能。
