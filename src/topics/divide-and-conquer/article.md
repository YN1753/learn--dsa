# 分治法 (Divide and Conquer)

## 概念解释

分治法（Divide and Conquer）是一种重要的算法设计范式。它的核心思想可以用四个字概括：**分而治之**。

将一个复杂的问题分解为若干个规模更小但结构相同的子问题，递归地求解这些子问题，最后将子问题的解合并，得到原问题的解。

分治法包含三个核心步骤：

1. **分解（Divide）**：将原问题分解为若干规模更小的子问题，子问题的结构与原问题相同
2. **解决（Conquer）**：递归地求解各子问题。当子问题规模足够小时（基本情况），直接求解
3. **合并（Combine）**：将子问题的解合并为原问题的解

```
分治法的通用框架：

function divideAndConquer(problem):
    if problem 足够小:
        return 直接求解(problem)

    subProblems = divide(problem)          // 分解
    subResults = []
    for sub in subProblems:
        subResults.push(conquer(sub))      // 递归解决
    return combine(subResults)             // 合并
```

## 为什么重要

分治法是计算机科学中最基本的算法设计范式之一，它的重要性体现在：

- **高效性**：许多分治算法能达到 O(n log n) 甚至更低的时间复杂度，远优于朴素的 O(n^2) 算法
- **并行性**：子问题之间相互独立，天然适合并行计算
- **普适性**：适用于排序、搜索、几何计算、信号处理等众多领域
- **理论基础**：是理解更高级算法（如 FFT、Strassen 矩阵乘法）的基础

许多经典算法本质上都是分治法的应用：

- **归并排序**：分 → 排序两半 → 合并有序数组
- **快速排序**：选基准 → 分为大小两部分 → 递归排序
- **二分查找**：分 → 只在一半中搜索
- **最近点对**：分 → 递归求解 → 合并跨分割线的情况
- **FFT（快速傅里叶变换）**：分 → 递归计算 → 合并蝴蝶操作

## 核心原理

### 以归并排序为例

归并排序是分治法最直观的示例：

```
原始数组: [38, 27, 43, 3, 9, 82, 10]

步骤1 —— 分解 (Divide):
  [38, 27, 43, 3]  |  [9, 82, 10]
  [38, 27] | [43, 3] | [9, 82] | [10]
  [38]|[27] | [43]|[3] | [9]|[82]

步骤2 —— 解决 (Conquer):
  基本情况：单个元素天然有序

步骤3 —— 合并 (Combine):
  [27, 38] | [3, 43] | [9, 82] | [10]
  [3, 27, 38, 43] | [9, 10, 82]
  [3, 9, 10, 27, 38, 43, 82]
```

### 递推关系与 Master 定理

分治算法的时间复杂度通常可以用递推关系表示：

```
T(n) = a * T(n/b) + O(n^k)
```

其中：
- `a`：子问题的个数
- `n/b`：每个子问题的规模
- `O(n^k)`：分解和合并的代价

**Master 定理**提供了分析此类递推式的标准方法：

设 `c = log_b(a)`，则：

| 情况 | 条件 | 结果 |
|------|------|------|
| 情况 1 | c > k | T(n) = O(n^c) |
| 情况 2 | c = k | T(n) = O(n^k * log n) |
| 情况 3 | c < k | T(n) = O(n^k) |

**示例：归并排序**
- a = 2（分成两半）
- b = 2（每半大小为 n/2）
- k = 1（合并需要 O(n)）
- c = log_2(2) = 1 = k → 情况 2
- T(n) = O(n log n)

### 分治法的适用条件

一个问题适合用分治法解决，通常需要满足：

1. **原问题可以分解**为若干规模更小的相同问题
2. **子问题相互独立**，不包含重叠的子子问题（否则应考虑动态规划）
3. **存在基本情况**，当问题规模足够小时可以直接求解
4. **合并代价合理**，子问题的解可以高效地合并

## 可视化说明

可视化演示展示了分治法的三个核心方面：

1. **分治树**：展示问题如何被递归分解为子问题，形成一棵树结构。每一层代表一次分解操作，叶子节点是基本情况
2. **归并排序动画**：逐步展示数组如何被分割，然后逐层合并为有序数组
3. **工作量分析**：展示每一层递归所做的工作量，直观理解为什么归并排序是 O(n log n)

你可以：
- 输入自定义数组，观察分治过程
- 使用 step-by-step 控制器逐步查看分解和合并
- 调节速度来仔细观察每一步操作

## 常见错误

### 1. 基本情况设置错误

```typescript
// 错误：缺少基本情况，导致无限递归
function mergeSort(arr: number[]): number[] {
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))  // 当 arr 长度为 1 时，mid=0，无限递归！
  const right = mergeSort(arr.slice(mid))
  return merge(left, right)
}

// 正确：添加基本情况
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr  // 基本情况
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  return merge(left, right)
}
```

### 2. 合并步骤的逻辑错误

```typescript
// 错误：合并时没有处理剩余元素
function merge(left: number[], right: number[]): number[] {
  const result: number[] = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++])
    else result.push(right[j++])
  }
  // 遗漏！left 或 right 中可能还有剩余元素
  return result
}

// 正确：处理剩余元素
function merge(left: number[], right: number[]): number[] {
  const result: number[] = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++])
    else result.push(right[j++])
  }
  while (i < left.length) result.push(left[i++])  // 处理 left 剩余
  while (j < right.length) result.push(right[j++]) // 处理 right 剩余
  return result
}
```

### 3. 深度递归导致栈溢出

当数组非常大时，递归深度可能超出调用栈限制。解决方法：
- 使用尾递归优化（如果语言支持）
- 改用迭代实现（自底向上的归并排序）
- 对小规模子问题使用插入排序（混合排序）

### 4. 不必要的复制

每次递归都创建新数组（如 `arr.slice()`）会增加空间开销。优化方案是使用原地操作和索引传递，减少不必要的数组复制。

## 实际应用

分治法在实际中有广泛应用：

| 算法 | 分解方式 | 合并方式 | 时间复杂度 |
|------|---------|---------|-----------|
| 归并排序 | 分为两半 | 合并有序子数组 | O(n log n) |
| 快速排序 | 按 pivot 分区 | 无需合并（原地） | 平均 O(n log n) |
| 二分查找 | 取中间值判断方向 | 无需合并 | O(log n) |
| 最近点对 | 按 x 坐标分半 | 处理跨分割线的情况 | O(n log n) |
| FFT | 按奇偶分组 | 蝴蝶操作合并 | O(n log n) |
| Strassen 矩阵乘法 | 分为 4 个子矩阵 | 7 次子矩阵乘法组合 | O(n^2.81) |
| 大整数乘法（Karatsuba） | 分为高低位 | 3 次乘法组合 | O(n^1.585) |

## 总结

分治法是算法设计的基石之一。它的核心思想简洁有力：将大问题分解为小问题，递归求解后合并结果。

掌握分治法需要理解：
- **三步框架**：分解、解决、合并
- **Master 定理**：快速分析分治算法的时间复杂度
- **适用条件**：问题可分解、子问题独立、合并代价合理
- **常见陷阱**：基本情况遗漏、合并逻辑错误、深度递归溢出

分治法不仅是一种具体的算法技术，更是一种思维方式——面对复杂问题时，先想想能否"分而治之"。
