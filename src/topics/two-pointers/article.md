# 双指针 (Two Pointers)

## 概念解释

双指针（Two Pointers）是一种使用两个指针在数组或链表上协同移动以高效解决问题的算法技巧。这两个指针可以根据问题的需要，以不同的方式移动——从两端向中间靠拢、从同一端以不同速度前进、或者一快一慢地遍历数据结构。

双指针并不是一种独立的数据结构，而是一种**思维方式**和**编程技巧**。它的核心在于：通过巧妙地安排两个指针的移动策略，将原本需要嵌套循环才能解决的问题，降低为单次遍历。

### 两种主要形式

| 类型 | 说明 | 典型应用 |
|------|------|----------|
| 对撞指针 (Collision Pointer) | 两个指针分别从数组的两端出发，向中间靠拢 | 有序数组两数之和、盛最多水的容器 |
| 快慢指针 (Fast/Slow Pointer) | 两个指针从同一端出发，以不同速度移动 | 链表环检测、找链表中间节点 |

此外，还有一种变体叫做**滑动窗口**（Sliding Window），本质上也是双指针的一种应用形式，但它更侧重于维护一个"窗口"来处理子数组或子串问题，我们将单独讨论。

## 为什么重要

### 1. 显著降低时间复杂度

双指针技巧最直观的价值在于时间复杂度的优化。以"两数之和"问题为例：

- **暴力解法**：枚举所有两个数的组合，时间复杂度 O(n²)
- **双指针解法**（有序数组）：左右指针协同移动，时间复杂度 O(n)

当 n = 10,000 时，暴力解法需要约 1 亿次操作，而双指针只需要约 10,000 次——差距高达万倍。

### 2. 常量级空间复杂度

大多数双指针算法只需要 O(1) 的额外空间（几个指针变量），不需要额外的数组或哈希表。这在内存受限的场景中尤为重要。

### 3. 面试和竞赛的高频考点

双指针是技术面试和算法竞赛中最常考的技巧之一。掌握双指针能够帮助你快速识别问题模式，并给出优雅高效的解决方案。

### 4. 许多高级算法的基础

双指针的思想渗透在许多高级算法中：
- **归并排序**中的合并步骤使用双指针
- **滑动窗口**本质上是双指针的变体
- **荷兰国旗问题**使用三指针（双指针的扩展）

## 核心原理

### 对撞指针：有序数组两数之和

对撞指针是双指针最经典的形态。以"在有序数组中找到两个数使其和等于目标值"为例：

**思路**：
1. 左指针 `left` 指向数组开头，右指针 `right` 指向数组末尾
2. 计算 `arr[left] + arr[right]` 的和
3. 如果和等于目标值，找到答案
4. 如果和小于目标值，说明需要更大的数，`left` 右移
5. 如果和大于目标值，说明需要更小的数，`right` 左移
6. 重复直到 `left >= right`

**为什么这个策略是正确的？** 因为数组是有序的：
- `left` 右移会使和变大（取到了更大的数）
- `right` 左移会使和变小（取到了更小的数）

每一步我们都确定地排除了一个不可能的解，因此不会遗漏正确答案。

```typescript
function twoSumSorted(arr: number[], target: number): [number, number] | null {
  let left = 0
  let right = arr.length - 1

  while (left < right) {
    const sum = arr[left] + arr[right]
    if (sum === target) {
      return [left, right]
    } else if (sum < target) {
      left++      // 需要更大的和
    } else {
      right--     // 需要更小的和
    }
  }

  return null  // 未找到
}
```

### 快慢指针：链表环检测

快慢指针的代表应用是 Floyd 判圈算法（龟兔赛跑算法）：

**思路**：
1. 慢指针 `slow` 每次走 1 步
2. 快指针 `fast` 每次走 2 步
3. 如果链表中存在环，快指针一定会追上慢指针（两者在环内相遇）
4. 如果不存在环，快指针会先到达链表末尾

**数学证明**：假设环的长度为 C，当慢指针进入环时，快指针在环内某个位置。此时两者的距离差为 d（0 < d < C）。每走一步，距离差减少 1（因为快指针比慢指针多走 1 步）。经过 d 步后，两者相遇。

```typescript
function hasCycle(head: ListNode | null): boolean {
  let slow = head
  let fast = head

  while (fast !== null && fast.next !== null) {
    slow = slow!.next        // 慢指针走 1 步
    fast = fast.next.next    // 快指针走 2 步

    if (slow === fast) {
      return true            // 相遇，说明有环
    }
  }

  return false               // 快指针到达末尾，无环
}
```

### 快慢指针：去除有序数组中的重复元素

这是另一种双指针的经典应用——快慢指针同向移动：

**思路**：
1. 慢指针 `slow` 指向当前不重复序列的末尾
2. 快指针 `fast` 遍历整个数组
3. 当 `arr[fast] != arr[slow]` 时，将 `arr[fast]` 复制到 `arr[slow + 1]`，`slow` 前进
4. 最终 `slow + 1` 就是去重后数组的长度

```typescript
function removeDuplicates(arr: number[]): number {
  if (arr.length === 0) return 0

  let slow = 0
  for (let fast = 1; fast < arr.length; fast++) {
    if (arr[fast] !== arr[slow]) {
      slow++
      arr[slow] = arr[fast]
    }
  }

  return slow + 1  // 去重后的长度
}
```

### 盛最多水的容器

这是一个经典的对撞指针应用：

**问题**：给定 n 条垂直线段，选择两条线段与 x 轴构成的容器，使其能盛最多的水。

**思路**：
1. 左右指针分别指向数组两端
2. 面积 = `min(height[left], height[right]) * (right - left)`
3. 移动较短的那一侧指针（因为移动较长的指针不可能增大面积）

```typescript
function maxArea(height: number[]): number {
  let left = 0
  let right = height.length - 1
  let maxWater = 0

  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left)
    maxWater = Math.max(maxWater, area)

    if (height[left] < height[right]) {
      left++
    } else {
      right--
    }
  }

  return maxWater
}
```

## 可视化说明

在可视化面板中，双指针的执行过程以数组方块的形式直观展示：

- **蓝色**方块标记左指针 (`left`) 的位置
- **紫色**方块标记右指针 (`right`) 的位置
- **绿色**方块表示已找到的目标元素或满足条件的位置
- **橙色**方块标记快指针 (`fast`) 的位置（快慢指针模式下）
- **灰色**方块表示已排除或已处理的元素

每一步都会显示：
- 当前两个指针的位置和指向的值
- 当前的比较操作和结果
- 指针的移动方向和原因

通过控制栏，你可以：
- 选择不同的算法模式（两数之和 / 盛最多水 / 环检测 / 去重）
- 逐步执行或自动播放
- 调整播放速度
- 重置到初始状态

## 常见错误

### 1. 忘记数组必须有序（对撞指针）

```typescript
// 错误：对无序数组使用对撞指针
const arr = [3, 1, 4, 1, 5, 9, 2, 6]
twoSumSorted(arr, 10)  // 结果不可靠！

// 正确：先排序，或确认数组已排序
const sorted = [...arr].sort((a, b) => a - b)
twoSumSorted(sorted, 10)
```

对撞指针的正确性依赖于数组的有序性。如果数组无序，`left++` 不一定使和变大，`right--` 不一定使和变小，算法将无法正确工作。

### 2. 指针移动逻辑错误

```typescript
// 错误：找到一个解就直接返回，可能遗漏其他解
if (sum === target) return [left, right]

// 如果需要找所有解，找到后应同时移动两个指针
if (sum === target) {
  results.push([left, right])
  left++
  right--  // 同时移动，避免重复
}
```

### 3. 边界条件处理不当（off-by-one）

```typescript
// 错误：循环条件使用 left <= right（对撞指针）
while (left <= right) { ... }  // 当 left == right 时，同一个元素被用了两次

// 正确：对撞指针应使用 left < right
while (left < right) { ... }
```

### 4. 快慢指针初始化错误

```typescript
// 错误：快慢指针初始化在同一位置但没有先移动
let slow = head
let fast = head
while (fast !== null) {
  if (slow === fast) return true  // 第一次就相等！永远返回 true
  slow = slow.next
  fast = fast.next.next
}

// 正确：先移动再比较
while (fast !== null && fast.next !== null) {
  slow = slow.next
  fast = fast.next.next
  if (slow === fast) return true  // 移动后再比较
}
```

### 5. 混淆不同双指针模式的适用场景

```typescript
// 错误：对无序数组使用对撞指针找两数之和
// 无序数组应使用哈希表方法，而非对撞指针

// 正确做法：使用哈希表
function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (map.has(complement)) {
      return [map.get(complement)!, i]
    }
    map.set(nums[i], i)
  }
  return []
}
```

## 实际应用

### 1. 有序数组两数之和（LeetCode 167）

这是双指针最经典的应用。给定一个升序排列的整数数组，找出两个数使其和等于目标值。

**关键点**：数组有序 → 可以使用对撞指针 → O(n) 时间。

### 2. 盛最多水的容器（LeetCode 11）

给定 n 条垂直线段，找两条线段使容器盛水最多。

**关键点**：每次移动较短的那侧指针，因为移动较长的指针不可能增大面积。

### 3. 三数之和（LeetCode 15）

在数组中找出所有和为 0 的三元组。

**思路**：先排序，然后固定第一个数，对剩余部分使用对撞指针找两数之和。外层循环 O(n)，内层双指针 O(n)，总时间 O(n²)。

### 4. 链表环检测（LeetCode 141）

判断链表中是否存在环。

**关键点**：快指针走 2 步，慢指针走 1 步，有环必相遇。O(n) 时间，O(1) 空间。

### 5. 去除有序数组中的重复元素（LeetCode 26）

原地删除有序数组中的重复元素，返回去重后的长度。

**关键点**：快慢指针同向移动，慢指针标记不重复序列的末尾。

### 6. 接雨水（LeetCode 42）

计算柱状图能接多少雨水。

**思路**：使用对撞指针，维护左右两侧的最大高度，每次移动较矮的一侧。

## 总结

双指针是算法设计中最基础、最实用的技巧之一：

**核心思想**：使用两个指针在数据结构上协同移动，通过巧妙的移动策略将时间复杂度从 O(n²) 降低到 O(n)。

**两种形态**：
- **对撞指针**：从两端向中间靠拢，适用于有序数组的搜索问题
- **快慢指针**：从同一端以不同速度移动，适用于链表环检测、找中间节点等问题

**关键要点**：

- 对撞指针的前提是数据有序，否则无法正确决策指针移动方向
- 快慢指针的速度选择要根据问题决定（通常是 1 步和 2 步）
- 边界条件要特别注意，尤其是 `left < right` 还是 `left <= right`
- 双指针的核心在于每一步都确定地排除一部分不可能的解

掌握双指针技巧不仅能帮助你高效解决大量数组和链表问题，也是理解滑动窗口、归并排序等高级算法的重要基础。在实际面试和工程中，识别问题是否适合使用双指针，往往是解题的关键一步。
