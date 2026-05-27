# Treap (笛卡尔树 / 随机优先队列)

## 概念解释

Treap 是 Tree（树）和 Heap（堆）的合成词，它是一种**同时满足二叉搜索树（BST）性质和堆性质**的随机化数据结构。

### 什么是 Treap？

想象你有一组数据，每个数据有两个属性：

- **key（键）**：用于排序的值，满足 BST 性质（左子树 < 根 < 右子树）
- **priority（优先级）**：一个随机值，满足堆性质（父节点 >= 子节点，最大堆）

```
        (key=5, pri=8)
       /              \
  (key=2, pri=5)    (key=7, pri=3)
   /        \
(key=1,pri=2) (key=3,pri=1)
```

在上面的例子中：
- BST 性质：左子树的 key 都小于父节点，右子树的 key 都大于父节点
- 堆性质：父节点的 priority 都大于子节点的 priority

### 关键性质

| 性质 | 说明 |
|------|------|
| BST 性质 | 对于任意节点，左子树所有 key < 该节点 key < 右子树所有 key |
| 堆性质 | 对于任意节点，该节点的 priority >= 其子节点的 priority（最大堆） |
| 随机性 | priority 在节点创建时随机生成 |

## 为什么重要

Treap 在数据结构中占有独特的地位：

1. **实现简单**：相比 AVL 树和红黑树，Treap 的平衡逻辑更加简洁
2. **期望高效**：期望时间复杂度为 O(log n)，实践表现优秀
3. **随机化思想**：展示了随机化在算法设计中的强大力量
4. **理论价值**：期望等价于随机 BST，有坚实的理论基础
5. **灵活扩展**：支持分裂（split）和合并（merge）等高级操作

## 核心原理

### 节点结构

```typescript
interface TreapNode {
  key: number       // BST 的键值
  priority: number  // 随机生成的优先级
  left: TreapNode | null
  right: TreapNode | null
  size: number      // 子树大小（可选，用于 order-statistic）
}
```

### 旋转操作

Treap 维护平衡的核心操作是**旋转**，分为左旋和右旋。

#### 右旋 (Right Rotation)

当左子节点的优先级高于父节点时，进行右旋：

```
    y                x
   / \              / \
  x   C    →      A   y
 / \                  / \
A   B                B   C
```

```typescript
function rotateRight(y: TreapNode): TreapNode {
  const x = y.left!
  y.left = x.right
  x.right = y
  return x  // x 成为新的根
}
```

#### 左旋 (Left Rotation)

当右子节点的优先级高于父节点时，进行左旋：

```
  x                  y
 / \                / \
A   y      →      x   C
   / \            / \
  B   C          A   B
```

```typescript
function rotateLeft(x: TreapNode): TreapNode {
  const y = x.right!
  x.right = y.left
  y.left = x
  return y  // y 成为新的根
}
```

### 插入操作

插入操作分为两步：

1. **按 BST 规则插入**：将新节点插入到正确的位置
2. **维护堆性质**：如果新节点的优先级高于父节点，通过旋转上移

```typescript
function insert(root: TreapNode | null, key: number, priority: number): TreapNode {
  if (root === null) {
    return { key, priority, left: null, right: null, size: 1 }
  }

  if (key < root.key) {
    root.left = insert(root.left, key, priority)
    // 维护堆性质：如果左子节点优先级更高，右旋
    if (root.left!.priority > root.priority) {
      root = rotateRight(root)
    }
  } else if (key > root.key) {
    root.right = insert(root.right, key, priority)
    // 维护堆性质：如果右子节点优先级更高，左旋
    if (root.right!.priority > root.priority) {
      root = rotateLeft(root)
    }
  }

  return root
}
```

### 删除操作

删除操作利用优先级下沉：

1. 将目标节点的优先级设为负无穷
2. 通过旋转让它下沉到叶子节点
3. 直接删除

```typescript
function deleteNode(root: TreapNode | null, key: number): TreapNode | null {
  if (root === null) return null

  if (key < root.key) {
    root.left = deleteNode(root.left, key)
  } else if (key > root.key) {
    root.right = deleteNode(root.right, key)
  } else {
    // 找到目标节点
    if (root.left === null) return root.right
    if (root.right === null) return root.left

    // 通过旋转下沉到叶子
    if (root.left.priority > root.right.priority) {
      root = rotateRight(root)
      root.right = deleteNode(root.right, key)
    } else {
      root = rotateLeft(root)
      root.left = deleteNode(root.left, key)
    }
  }

  return root
}
```

### 搜索操作

搜索操作与普通 BST 完全相同：

```typescript
function search(root: TreapNode | null, key: number): TreapNode | null {
  if (root === null || root.key === key) return root

  if (key < root.key) {
    return search(root.left, key)
  } else {
    return search(root.right, key)
  }
}
```

### 分裂与合并（高级操作）

Treap 独特的优势在于支持高效的**分裂（split）**和**合并（merge）**操作：

```typescript
// 将 Treap 分裂为两个：所有 key <= val 的在左树，其余在右树
function split(root: TreapNode | null, val: number): [TreapNode | null, TreapNode | null] {
  if (root === null) return [null, null]

  if (root.key <= val) {
    const [left, right] = split(root.right, val)
    root.right = left
    return [root, right]
  } else {
    const [left, right] = split(root.left, val)
    root.left = right
    return [left, root]
  }
}

// 合并两个 Treap（左树所有 key < 右树所有 key）
function merge(left: TreapNode | null, right: TreapNode | null): TreapNode | null {
  if (left === null) return right
  if (right === null) return left

  if (left.priority > right.priority) {
    left.right = merge(left.right, right)
    return left
  } else {
    right.left = merge(left, right.left)
    return right
  }
}
```

## 时间复杂度分析

由于 priority 是随机的，Treap 在结构上等价于一棵随机 BST。

| 操作 | 期望时间复杂度 | 最坏时间复杂度 | 说明 |
|------|--------------|--------------|------|
| 插入 | O(log n) | O(n) | 期望等价于随机 BST |
| 删除 | O(log n) | O(n) | 优先级下沉 |
| 搜索 | O(log n) | O(n) | 与 BST 相同 |
| 分裂 | O(log n) | O(n) | 沿路径递归 |
| 合并 | O(log n) | O(n) | 沿路径递归 |

**期望高度**：一棵有 n 个节点的 Treap，其期望高度约为 2 ln n，即 O(log n)。

## 可视化说明

在可视化界面中，Treap 以二叉树的形式展示：

- 每个节点显示 **key** 和 **priority**（用不同颜色区分）
- BST 性质：中序遍历得到有序序列
- 堆性质：父节点的优先级高于子节点
- 旋转操作会带动整棵子树移动
- 插入时可以看到新节点如何通过旋转「上浮」
- 删除时可以看到目标节点如何通过旋转「下沉」

通过动画控制栏可以：
- 逐步观察每次旋转的细节
- 调整动画速度
- 重置到初始状态

## 常见错误

### 1. 忘记维护旋转后的子树关系

```typescript
// 错误：旋转后没有正确更新子树指针
function badRotateRight(y: TreapNode): TreapNode {
  const x = y.left!
  y.left = x.right  // 更新了 y 的左子树
  x.right = y       // 更新了 x 的右子树
  // 正确！但很多人忘记返回新的根节点
  return y  // 错误！应该返回 x
}

// 正确
function goodRotateRight(y: TreapNode): TreapNode {
  const x = y.left!
  y.left = x.right
  x.right = y
  return x  // 返回新的根
}
```

### 2. 插入时只检查一侧的堆性质

```typescript
// 错误：只在 key < root.key 时检查堆性质
function badInsert(root: TreapNode | null, key: number, pri: number): TreapNode {
  if (root === null) return { key, priority: pri, left: null, right: null }

  if (key < root.key) {
    root.left = badInsert(root.left, key, pri)
    if (root.left!.priority > root.priority) {
      root = rotateRight(root)
    }
  } else {
    root.right = badInsert(root.right, key, pri)
    // 忘记检查右子树的堆性质！
    // 缺少：if (root.right!.priority > root.priority) { root = rotateLeft(root) }
  }
  return root
}
```

### 3. 删除时没有考虑子节点为空的情况

```typescript
// 错误：直接访问子节点的优先级
function badDelete(root: TreapNode | null, key: number): TreapNode | null {
  if (root === null) return null
  // ... 找到目标节点后
  // 错误：没有检查子节点是否为 null
  if (root.left.priority > root.right.priority) {  // 可能 NPE！
    root = rotateRight(root)
  }
  // ...
}

// 正确：先检查子节点
function goodDelete(root: TreapNode | null, key: number): TreapNode | null {
  if (root === null) return null
  // ... 找到目标节点后
  if (root.left === null) return root.right
  if (root.right === null) return root.left
  // 现在可以安全比较优先级
  if (root.left.priority > root.right.priority) {
    root = rotateRight(root)
    root.right = goodDelete(root.right, key)
  } else {
    root = rotateLeft(root)
    root.left = goodDelete(root.left, key)
  }
  return root
}
```

### 4. 随机数生成的陷阱

```typescript
// 不推荐：使用 Math.random() 可能产生重复优先级
const priority = Math.random()

// 更好：使用整数优先级，减少冲突
const priority = Math.floor(Math.random() * 1000000)

// 最佳：使用时间戳 + 随机数组合，确保唯一性
let counter = 0
function generatePriority(): number {
  return Date.now() * 1000 + (counter++)
}
```

## 实际应用

### 1. 随机化平衡 BST

Treap 最直接的用途是作为平衡的二叉搜索树。相比 AVL 和红黑树：
- 实现更简单
- 不需要存储额外的平衡信息
- 代码量通常只有 AVL 的一半

### 2. Order Statistic 操作

通过在每个节点维护子树大小，Treap 可以高效支持：
- `findKth(k)`：查找第 k 小的元素
- `rank(x)`：查询元素 x 的排名
- 时间复杂度：O(log n)

```typescript
function findKth(root: TreapNode | null, k: number): TreapNode | null {
  if (root === null) return null
  const leftSize = root.left ? root.left.size : 0
  if (k === leftSize + 1) return root
  if (k <= leftSize) return findKth(root.left, k)
  return findKth(root.right, k - leftSize - 1)
}
```

### 3. 区间操作（隐式 Treap）

将数组下标作为 key，Treap 可以支持：
- 区间翻转
- 区间求和
- 区间插入/删除
- 这些操作常用于竞赛编程

### 4. 笛卡尔树构建

Treap 本质上是一种笛卡尔树。给定 (key, priority) 对，存在唯一的 Treap 结构。这个性质在以下场景中有用：
- RMQ（区间最值查询）转化为 LCA（最近公共祖先）
- 可视化随机数据的分治结构

### 5. 随机化优先队列

Treap 可以作为优先队列使用，同时支持：
- 按 key 有序遍历
- 按 priority 取最大值
- 分裂和合并操作

## 与其他平衡树的比较

| 特性 | Treap | AVL 树 | 红黑树 | Splay 树 |
|------|-------|--------|--------|----------|
| 平衡方式 | 随机优先级 | 严格平衡因子 | 颜色规则 | 自适应调整 |
| 最坏查找 | O(n) | O(log n) | O(log n) | O(n) |
| 期望查找 | O(log n) | O(log n) | O(log n) | O(log n)* |
| 插入实现 | 简单 | 中等 | 复杂 | 简单 |
| 删除实现 | 简单 | 复杂 | 复杂 | 简单 |
| 分裂/合并 | 原生支持 | 困难 | 困难 | 支持 |
| 额外空间 | priority | 平衡因子 | 颜色位 | 无 |
| 适用场景 | 竞赛、随机化 | 通用 | 通用（如 STL map） | 局部性访问 |

*均摊时间复杂度

## 总结

Treap 是一种优雅的随机化数据结构：

**核心思想**：
- 每个节点有 key（BST 性质）和 random priority（堆性质）
- 随机优先级保证期望平衡

**优点**：
- 实现简单，代码量小
- 期望 O(log n) 的所有操作
- 原生支持分裂和合并
- 不需要复杂的平衡条件

**缺点**：
- 最坏情况 O(n)（概率极小）
- 需要随机数生成器
- 不保证确定性的 O(log n)

**适用场景**：
- 竞赛编程（实现快、功能全）
- 需要分裂/合并操作的场景
- 作为教学工具理解随机化算法
- 对最坏情况不敏感的应用

Treap 展示了随机化在算法设计中的巧妙应用：通过引入随机性，我们用极简的代码获得了高效的平衡性能。
