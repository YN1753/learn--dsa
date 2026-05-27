# 二分查找 (Binary Search)

## 概念解释

二分查找（Binary Search）是一种在**有序数组**中查找目标值的高效算法。它的核心思想非常简单：每次将搜索范围缩小一半，直到找到目标值或确认目标值不存在。

想象一下你在翻字典：如果你想查"苹果"这个词，你不会从第一页开始逐页翻找，而是直接翻到字典中间，看看中间的词是比"苹果"靠前还是靠后，然后排除掉一半的页面，再在剩下的部分重复这个过程。这就是二分查找的本质。

### 前提条件

- 数组必须是**有序的**（通常为升序）
- 数组必须支持**随机访问**（通过索引直接访问元素，数组满足，链表不满足）

### 核心术语

| 术语 | 说明 |
|------|------|
| 搜索空间 (Search Space) | 当前可能包含目标值的数组范围，用 left 和 right 表示 |
| 中间位置 (Mid) | 搜索空间的中间索引，mid = left + (right - left) / 2 |
| 循环不变量 (Loop Invariant) | 目标值（如果存在）一定在 [left, right] 区间内 |

## 为什么重要

### 1. O(log n) 的惊人效率

二分查找的时间复杂度是 O(log n)，这意味着：

- 100 个元素最多需要 7 次比较
- 1,000 个元素最多需要 10 次比较
- 1,000,000 个元素最多需要 20 次比较
- 10 亿个元素最多只需要 30 次比较！

相比之下，线性查找 O(n) 在 10 亿个元素时最坏需要 10 亿次比较。这种指数级的效率差距在大规模数据中至关重要。

### 2. 许多算法的基础

二分查找不仅仅是一个独立的算法，它还是许多高级算法和数据结构的基础：

- **二叉搜索树 (BST)**：每个节点的左子树都小于它，右子树都大于它，本质上就是二分查找的树形表示
- **B 树 / B+ 树**：数据库索引的核心数据结构，利用了二分查找的思想
- **分治算法**：很多分治算法在合并阶段使用二分查找来优化

### 3. 数据库索引的核心

当你执行 `SELECT * FROM users WHERE id = 12345` 时，数据库不是逐行扫描，而是通过 B+ 树索引进行类似二分查找的操作，将查找时间从 O(n) 降低到 O(log n)。

### 4. 工程中的广泛应用

从调试工具 `git bisect` 到操作系统的内存分配，从游戏中的碰撞检测到机器学习中的超参数搜索，二分查找无处不在。

## 核心原理

### 标准二分查找

二分查找使用两个指针 `left` 和 `right` 来维护搜索空间的边界：

```typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) {
      return mid           // 找到目标
    } else if (arr[mid] < target) {
      left = mid + 1       // 目标在右半部分
    } else {
      right = mid - 1      // 目标在左半部分
    }
  }

  return -1  // 未找到
}
```

### 执行过程详解

以数组 `[1, 3, 5, 7, 9, 11, 13, 15]` 查找目标值 `7` 为例：

```
第 1 步: left=0, right=7, mid=3
         [1, 3, 5, 7, 9, 11, 13, 15]
                   ^
         arr[3]=7 == target → 找到！返回 3

如果目标是 11:

第 1 步: left=0, right=7, mid=3
         [1, 3, 5, 7, 9, 11, 13, 15]
                   ^
         arr[3]=7 < 11 → 搜索右半部分, left=4

第 2 步: left=4, right=7, mid=5
         [1, 3, 5, 7, 9, 11, 13, 15]
                         ^
         arr[5]=11 == target → 找到！返回 5
```

### 循环不变量

二分查找的关键在于维护一个**循环不变量**：如果目标值存在于数组中，那么它一定在 `[left, right]` 这个闭区间内。

- 初始化：`left=0, right=n-1`，整个数组都是搜索空间
- 保持：每次比较后，根据结果缩小范围，但目标值仍在区间内
- 终止：`left > right` 时，搜索空间为空，目标值不存在

### 查找第一次出现的位置

当数组中有重复元素时，找到目标值后不立即返回，而是继续向左搜索：

```typescript
function findFirst(arr: number[], target: number): number {
  let left = 0
  let right = arr.length - 1
  let result = -1

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (arr[mid] === target) {
      result = mid        // 记录位置，但继续向左搜索
      right = mid - 1
    } else if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return result
}
```

### 查找插入位置

查找目标值应该插入的位置（即第一个大于等于目标值的位置）：

```typescript
function searchInsert(arr: number[], target: number): number {
  let left = 0
  let right = arr.length

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  return left
}
```

## 可视化说明

在可视化面板中，二分查找的过程以数组方块的形式直观展示：

- **蓝色**方块表示当前搜索范围 `[left, right]`
- **红色**方块表示当前正在比较的中间位置 `mid`
- **绿色**方块表示已找到的目标值
- **灰色**方块表示已排除的区域

每一步都会显示：
- 当前的 left、right、mid 指针位置
- 中间值与目标值的比较结果
- 搜索范围如何缩小

通过控制栏，你可以：
- 输入自定义的目标值
- 逐步执行或自动播放
- 调整播放速度
- 重置到初始状态

## 常见错误

### 1. 整数溢出

```typescript
// 错误：当 left 和 right 都很大时可能溢出
const mid = (left + right) / 2

// 正确：避免溢出的写法
const mid = left + Math.floor((right - left) / 2)
```

在 Java、C++ 等语言中，`left + right` 可能超出 `int` 范围。虽然 JavaScript 的数字是浮点数，不容易溢出，但养成好习惯很重要。

### 2. 边界条件错误（off-by-one）

```typescript
// 错误：使用 left < right 作为循环条件（闭区间写法）
while (left < right) { ... }  // 可能漏掉 left == right 的情况

// 正确：闭区间写法应使用 left <= right
while (left <= right) { ... }
```

循环条件取决于区间的定义：
- **闭区间 [left, right]**：使用 `left <= right`，初始 `right = n - 1`
- **左闭右开 [left, right)**：使用 `left < right`，初始 `right = n`

两种写法都可以，但必须保持一致，混用会导致死循环或漏查。

### 3. 死循环

```typescript
// 错误：当 left == right 时 mid 始终等于 left，无法缩小范围
while (left < right) {
  const mid = left + Math.floor((right - left) / 2)
  if (arr[mid] < target) {
    left = mid       // 应该是 mid + 1！
  } else {
    right = mid
  }
}

// 正确：确保搜索范围在每次迭代中缩小
if (arr[mid] < target) {
  left = mid + 1    // 排除 mid
} else {
  right = mid       // mid 可能是答案，保留
}
```

### 4. 忘记数组必须有序

```typescript
// 错误：对无序数组使用二分查找
const arr = [3, 1, 4, 1, 5, 9, 2, 6]
binarySearch(arr, 5)  // 结果不可靠！

// 正确：先排序，或者确认数组已排序
const sorted = [...arr].sort((a, b) => a - b)
binarySearch(sorted, 5)
```

### 5. 混淆开区间和闭区间的写法

```typescript
// 闭区间写法 [left, right]
let left = 0, right = arr.length - 1   // right = n - 1
while (left <= right) { ... }           // <=
// 更新时：left = mid + 1, right = mid - 1

// 左闭右开写法 [left, right)
let left = 0, right = arr.length       // right = n
while (left < right) { ... }           // <
// 更新时：left = mid + 1, right = mid
```

两种写法都是正确的，关键是在整个函数中保持一致。

## 实际应用

### 1. 字典查找

二分查找最直观的应用就是字典查找。纸质字典的编排方式就是有序的，我们翻字典时天然使用的就是二分查找的思想。

### 2. 数据库索引（B 树 / B+ 树）

数据库的 B+ 树索引在每个节点中存储多个有序的键值，查找时在节点内部使用二分查找来确定应该走哪个子树。这使得数据库查询可以在 O(log n) 时间内完成。

### 3. git bisect

Git 提供了 `git bisect` 命令，用于在提交历史中定位引入 bug 的提交。它使用二分查找的思想：先检出中间的提交，测试是否有 bug，然后排除一半的提交，重复直到找到问题提交。对于 1000 个提交，只需要约 10 次测试。

### 4. 旋转数组查找

一个经典的面试题：在一个旋转后的有序数组（如 `[4, 5, 6, 7, 0, 1, 2]`）中查找目标值。解决方法是在标准二分查找的基础上，判断 mid 落在哪个有序段，然后决定搜索方向。

```typescript
function searchRotated(nums: number[], target: number): number {
  let left = 0, right = nums.length - 1
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] === target) return mid

    // 判断哪半部分是有序的
    if (nums[left] <= nums[mid]) {
      // 左半部分有序
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    } else {
      // 右半部分有序
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
  }
  return -1
}
```

### 5. 查找边界

二分查找可以用来查找满足条件的边界值：

- **查找第一个满足条件的位置**：找到满足条件的最左位置
- **查找最后一个满足条件的位置**：找到满足条件的最右位置

这类问题在实际工程中非常常见，例如查找某个时间范围内的第一条记录、查找某个价格区间内的第一个商品等。

### 6. 浮点数二分

二分查找不仅适用于整数，还可以用于浮点数，例如求平方根：

```typescript
function sqrt(n: number): number {
  let left = 0, right = n
  while (right - left > 1e-9) {
    const mid = (left + right) / 2
    if (mid * mid < n) {
      left = mid
    } else {
      right = mid
    }
  }
  return left
}
```

## 总结

二分查找是计算机科学中最基础、最实用的算法之一：

**核心思想**：在有序数组中，每次将搜索范围缩小一半，直到找到目标或确认不存在。

**时间复杂度**：O(log n) —— 对数级别，极其高效。

**空间复杂度**：O(1) —— 只需要几个变量。

**关键要点**：

- 前提条件：数组必须有序且支持随机访问
- 边界处理：明确区间的开闭定义，保持写法一致
- 避免溢出：使用 `left + (right - left) / 2` 计算中点
- 循环不变量：目标值始终在 `[left, right]` 区间内
- 变体丰富：查找第一个/最后一个、查找插入位置、旋转数组查找等

掌握二分查找不仅是学习更高级数据结构（二叉搜索树、B 树、跳表等）的基础，也是解决大量算法题和工程问题的核心工具。理解其原理并注意边界细节，将使你在面对有序数据的查找问题时游刃有余。
