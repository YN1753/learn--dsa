# CDQ分治

## 概念解释

CDQ分治是一种**离线算法**，由中国OI选手陈丹琦（CDQ）提出，主要用于解决**多维偏序问题**。

核心思想：对某一维进行排序后，通过分治的过程，利用**左半部分对右半部分的贡献**来处理其余维度的偏序关系。它巧妙地将一维的有序性「贡献」到另一维，从而实现降维。

简单来说：
- 问题有多个维度需要同时满足条件
- 先对一个维度排序
- 在分治归并的过程中，处理第二个维度
- 配合树状数组/线段树处理第三个维度

这样，一个三维偏序问题就被「拆解」成了多个一维问题。

## 为什么重要

CDQ分治在算法竞赛和实际应用中非常重要：

1. **降维能力**：将O(n^2)的多维偏序暴力枚举降至O(n log^2 n)
2. **三维偏序的标准解法**：三维偏序（如陌上花开问题）的标配算法
3. **离线算法核心技巧**：可以将动态问题转化为静态问题处理
4. **通用性强**：可以推广到更高维偏序，也可以与其他数据结构结合
5. **思维训练**：理解分治与归并排序思想的高级应用

### 复杂度对比

| 方法 | 三维偏序时间复杂度 | 空间复杂度 |
|------|-------------------|-----------|
| 暴力枚举 | O(n^2) | O(1) |
| CDQ分治 | O(n log^2 n) | O(n) |
| k-d树 | 平均O(n log n) | O(n) |

## 核心原理

### 基本框架

CDQ分治的核心流程：

```
1. 按第一维排序
2. 递归处理左半部分
3. 递归处理右半部分
4. 计算左半部分对右半部分的贡献（归并第二维 + 树状数组维护第三维）
```

### 三维偏序示例

问题：给定n个点(a, b, c)，求满足 a_i <= a_j, b_i <= b_j, c_i <= c_j 且 i != j 的点对数量。

```typescript
// CDQ分治解决三维偏序
interface Point {
  a: number  // 第一维
  b: number  // 第二维
  c: number  // 第三维
  count: number  // 重复点计数
}

// 树状数组，用于维护第三维
class FenwickTree {
  private tree: number[]
  private size: number

  constructor(size: number) {
    this.size = size
    this.tree = new Array(size + 1).fill(0)
  }

  update(index: number, delta: number): void {
    for (let i = index; i <= this.size; i += i & (-i)) {
      this.tree[i] += delta
    }
  }

  query(index: number): number {
    let sum = 0
    for (let i = index; i > 0; i -= i & (-i)) {
      sum += this.tree[i]
    }
    return sum
  }

  clear(): void {
    this.tree.fill(0)
  }
}

function cdq(points: Point[], left: number, right: number,
             tree: FenwickTree, result: number[]): void {
  if (left === right) return

  const mid = Math.floor((left + right) / 2)

  // 递归处理左右两半
  cdq(points, left, mid, tree, result)
  cdq(points, mid + 1, right, tree, result)

  // 计算左半对右半的贡献
  // 此时左右两半各自按第二维(b)已有序（由归并保证）
  let j = left
  for (let i = mid + 1; i <= right; i++) {
    // 将左半中 b <= 当前右半 b 的点加入树状数组
    while (j <= mid && points[j].b <= points[i].b) {
      tree.update(points[j].c, points[j].count)
      j++
    }
    // 查询第三维 <= 当前点c的贡献
    result[i] += tree.query(points[i].c)
  }

  // 清空树状数组
  for (let k = left; k < j; k++) {
    tree.update(points[k].c, -points[k].count)
  }

  // 归并排序，使[left, right]按第二维有序
  merge(points, left, mid, right)
}
```

### 关键步骤解析

**第一步：按第一维排序**

```typescript
// 进入CDQ之前，先按第一维a排序
points.sort((x, y) => x.a - y.a)
```

这保证了左半部分的a值一定 <= 右半部分的a值。

**第二步：分治递归**

递归处理左右两半，使各自内部的偏序关系已经计算完毕。

**第三步：计算跨左右的贡献**

这是CDQ的核心。此时左右两半已经各自按第二维b有序（由递归中的归并保证）。用双指针遍历右半部分，将左半中满足b条件的点加入树状数组，然后查询树状数组得到第三维c的贡献。

**第四步：归并排序**

对第二维b进行归并，保证上层递归使用时有序。

### 工作流程图示

```
初始: 按第一维排序后
[a=1,b=3,c=2] [a=2,b=1,c=3] [a=3,b=2,c=1] [a=4,b=3,c=3]

分治: 左半 | 右半
[a=1,b=3,c=2] [a=2,b=1,c=3] | [a=3,b=2,c=1] [a=4,b=3,c=3]

归并第二维时:
- 左半按b排序: [b=1,c=3] [b=3,c=2]
- 右半按b排序: [b=2,c=1] [b=3,c=3]
- 用树状数组维护c维度，统计左对右的贡献
```

## 可视化说明

在可视化界面中，CDQ分治的过程被展示为：

1. **排序阶段**：点集按第一维排列
2. **分治阶段**：递归地将点集分成左右两半，用不同颜色标识
3. **归并阶段**：按第二维归并，同时显示树状数组的更新和查询
4. **贡献计算**：高亮显示左半部分对右半部分的有效贡献

通过动画可以直观理解：
- 为什么只计算左对右（第一维已经保证）
- 归并过程中双指针如何工作
- 树状数组如何维护第三维信息

## 常见错误

### 1. 忘记按第一维排序

```typescript
// 错误：直接开始分治，没有先排序
cdq(points, 0, n - 1, tree, result)

// 正确：先按第一维排序
points.sort((x, y) => x.a - y.a)
cdq(points, 0, n - 1, tree, result)
```

不排序的话，左半部分的第一维不一定小于右半部分，贡献计算结果会出错。

### 2. 计算贡献时顺序错误

```typescript
// 错误：先归并再计算贡献（归并后顺序被打乱）
merge(points, left, mid, right)
calculateContribution(points, left, mid, right)

// 正确：先计算贡献再归并
calculateContribution(points, left, mid, right)
merge(points, left, mid, right)
```

必须在归并之前计算贡献，因为此时左右两半各自按第二维有序，归并后这个性质会被破坏。

### 3. 重复计算（计算了右对左的贡献）

```typescript
// 错误：同时计算左对右和右对左
for (let i = left; i <= mid; i++) {
  for (let j = mid + 1; j <= right; j++) {
    // 这样会重复计算，且右对左不满足第一维偏序
  }
}

// 正确：只计算左半对右半的贡献
for (let i = mid + 1; i <= right; i++) {
  // 只统计左半部分的贡献
}
```

### 4. 树状数组没有清空

```typescript
// 错误：贡献计算后忘记清空树状数组
// 下一层递归会读到脏数据

// 正确：计算完后清空
for (let k = left; k < j; k++) {
  tree.update(points[k].c, -points[k].count)
}
```

### 5. 处理重复点时出错

```typescript
// 错误：重复点被当作不同点处理，导致计数偏多
// 正确：合并重复点，用count字段记录个数
// 在排序时合并相同点，在贡献计算中乘以count
```

## 实际应用

### 1. 三维偏序（逆序对推广）

逆序对是二维偏序的特例。三维偏序是其自然推广：

```typescript
// 问题：统计满足 a_i <= a_j, b_i <= b_j, c_i <= c_j 的点对
// 暴力O(n^2)，CDQ分治O(n log^2 n)
```

经典题目如「陌上花开」。

### 2. 动态DP / 带修改的查询

CDQ分治可以将「带修改的查询」离线处理：

- 将时间作为第一维
- 修改操作和查询操作按时间排列
- 分治过程中，左半的修改对右半的查询产生贡献

```typescript
// 问题：支持单点修改和区间查询
// 将操作按时间排列，用CDQ分治处理
// 时间维度保证了修改在查询之前
```

### 3. 多维计数问题

统计满足多维偏序条件的元素对数量：

```typescript
// 例：给定n个人，每个人有(a, b, c)三个属性
// 统计有多少对人满足：a_i <= a_j, b_i <= b_j, c_i <= c_j
// 可以推广到更高维度
```

### 4. 二维平面上的问题

CDQ分治可以解决很多二维平面上的统计问题：

- 统计某个矩形区域内有多少点
- 计算点对之间的某种偏序关系
- 处理带有时间顺序的几何问题

## 总结

CDQ分治是一种优雅的离线降维算法：

**核心思想**：
- 先对一维排序，通过分治归并将有序性贡献到另一维
- 只计算左半对右半的贡献，利用第一维的有序性保证正确性
- 与树状数组/线段树结合处理第三维

**优点**：
- 将O(n^2)降至O(n log^2 n)
- 代码简洁，易于实现
- 可推广到更高维度
- 与其他数据结构灵活组合

**缺点**：
- 离线算法，不支持在线查询
- 需要所有操作事先已知
- 对空间有一定要求

**适用场景**：
- 多维偏序计数/统计问题
- 带修改的离线查询问题
- 动态DP问题
- 二维平面上的统计问题

**一句话总结**：CDQ分治通过「分治归并 + 左对右贡献」的范式，将多维偏序问题优雅地降维处理，是离线算法中不可或缺的核心技巧。
