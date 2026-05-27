# 差分数组

## 概念解释

差分数组（Difference Array）是一种基于**差分思想**的技巧，它通过对原数组进行变换，将**区间修改**操作的时间复杂度从 O(n) 降低到 O(1)。

给定一个数组 `arr[0..n-1]`，其差分数组 `diff` 的定义如下：

```
diff[0] = arr[0]
diff[i] = arr[i] - arr[i-1]  (i >= 1)
```

换句话说，差分数组记录的是**相邻元素之间的差值**。

### 直观理解

想象你站在山坡上，记录每一步相对于前一步的高度变化：上坡为正，下坡为负，平路为零。这个"每步变化量"就是差分。知道了起点高度和每步变化量，你就能还原出整条路线的高度。

```
原数组 arr:   [2,  5,  9,  7,  10]
差分数组 diff: [2,  3,  4, -2,   3]
                ↑   ↑   ↑   ↑    ↑
              2-0  5-2 9-5 7-9 10-7
```

### 核心操作：区间加法

差分数组的精髓在于**区间修改**。要将区间 `[l, r]` 的所有元素加上 `val`，只需：

```
diff[l]   += val
diff[r+1] -= val   （如果 r+1 < n）
```

为什么这样可行？因为对差分数组求前缀和还原时：
- `diff[l] += val` 会使 `arr[l]` 及之后所有元素都加上 `val`
- `diff[r+1] -= val` 会抵消掉 `r+1` 之后多加的部分

因此只有 `[l, r]` 区间内的元素被加上了 `val`。

## 为什么重要

### 1. O(1) 区间修改

在没有差分数组的情况下，对区间 `[l, r]` 的每个元素加 `val` 需要遍历该区间，时间复杂度为 O(r - l + 1)，最坏为 O(n)。使用差分数组，只需修改两个端点，时间复杂度为 O(1)。

### 2. 与前缀和互为逆运算

差分数组和前缀和是一对互逆操作：
- **前缀和**：快速计算区间**查询**（区间求和）
- **差分数组**：快速实现区间**修改**（区间加减）

两者结合可以解决"区间修改 + 区间查询"的问题。

### 3. 批量操作的利器

当有大量区间修改操作时，可以先全部记录到差分数组中，最后一次前缀和还原，避免每次修改都遍历原数组。

### 时间复杂度对比

| 操作 | 暴力方法 | 差分数组 |
|------|---------|---------|
| 单次区间修改 | O(n) | O(1) |
| m 次区间修改 | O(mn) | O(m) |
| 最终还原数组 | 不需要 | O(n) |
| 总计 | O(mn) | O(m + n) |

当 m 较大时，差分数组的优势非常明显。

## 核心原理

### 1. 构建差分数组

```typescript
function buildDiffArray(arr: number[]): number[] {
  const n = arr.length
  const diff: number[] = new Array(n).fill(0)
  diff[0] = arr[0]
  for (let i = 1; i < n; i++) {
    diff[i] = arr[i] - arr[i - 1]
  }
  return diff
}
```

时间复杂度：O(n)

### 2. 区间加法操作

```typescript
function rangeAdd(diff: number[], l: number, r: number, val: number): void {
  diff[l] += val
  if (r + 1 < diff.length) {
    diff[r + 1] -= val
  }
}
```

时间复杂度：O(1)

### 3. 还原原数组（前缀和）

```typescript
function reconstruct(diff: number[]): number[] {
  const n = diff.length
  const arr: number[] = new Array(n).fill(0)
  arr[0] = diff[0]
  for (let i = 1; i < n; i++) {
    arr[i] = arr[i - 1] + diff[i]
  }
  return arr
}
```

时间复杂度：O(n)

### 4. 完整流程示例

```
初始数组:     [1,  3,  5,  7,  9]

步骤 1: 构建差分数组
diff =        [1,  2,  2,  2,  2]

步骤 2: 区间 [1, 3] 加 2
diff[1] += 2  →  diff = [1, 4, 2, 2, 2]
diff[4] -= 2  →  diff = [1, 4, 2, 2, 0]

步骤 3: 还原数组
arr[0] = 1
arr[1] = 1 + 4 = 5
arr[2] = 5 + 2 = 7
arr[3] = 7 + 2 = 9
arr[4] = 9 + 0 = 9

结果:          [1,  5,  7,  9,  9]
验证: 原 [1,3,5,7,9]，区间[1,3]加2 → [1,5,7,9,9] ✓
```

### 5. 二维差分数组

对于二维矩阵的区间修改，可以使用二维差分数组。要将子矩阵 `(x1, y1)` 到 `(x2, y2)` 的所有元素加 `val`：

```
diff[x1][y1]     += val
diff[x1][y2+1]   -= val
diff[x2+1][y1]   -= val
diff[x2+1][y2+1] += val
```

还原时对二维差分数组求二维前缀和即可。

## 可视化说明

在右侧的可视化面板中，你可以直观地观察差分数组的工作原理：

- **原始数组**：显示当前数组的实际值
- **差分数组**：显示对应的差分值，帮助理解差分变换
- **区间修改**：选择区间和增加值，观察差分数组如何仅通过修改两个端点完成区间加法
- **还原动画**：逐步展示通过前缀和从差分数组还原原数组的过程

通过动画控制栏，你可以：
- 逐步执行区间修改操作
- 观察差分数组的变化过程
- 查看还原时每一步的前缀和计算

## 常见错误

### 1. 忘记还原数组

```typescript
// ❌ 错误：直接使用差分数组的值
const diff = buildDiffArray(arr)
rangeAdd(diff, 1, 3, 5)
console.log(diff[2])  // 这不是 arr[2] 的新值！

// ✅ 正确：先还原再查询
const result = reconstruct(diff)
console.log(result[2])  // 这才是修改后 arr[2] 的值
```

### 2. 端点修改的 off-by-one 错误

```typescript
// ❌ 错误：右端点忘记 +1
function rangeAdd(diff: number[], l: number, r: number, val: number) {
  diff[l] += val
  diff[r] -= val  // 错误！应该是 diff[r+1]
}
// 这样 [r] 之后的元素不会被抵消，导致错误

// ✅ 正确：右端点是 r+1
function rangeAdd(diff: number[], l: number, r: number, val: number) {
  diff[l] += val
  if (r + 1 < diff.length) {
    diff[r + 1] -= val
  }
}
```

### 3. 混淆差分数组和前缀和数组

```typescript
// 前缀和：sum[i] = arr[0] + arr[1] + ... + arr[i]
// 差分：  diff[i] = arr[i] - arr[i-1]

// ❌ 混淆：用前缀和的方式理解差分
// diff[i] 不是前 i 个元素的和

// ✅ 正确理解：
// diff 记录的是相邻元素的差值
// 对 diff 求前缀和才能得到原数组
```

### 4. 边界条件处理

```typescript
// ❌ 错误：不检查 r+1 是否越界
diff[r + 1] -= val  // 当 r 是最后一个元素时，r+1 越界！

// ✅ 正确：检查边界
if (r + 1 < diff.length) {
  diff[r + 1] -= val
}
```

## 实际应用

### 1. 数据库批量更新

在数据库中，如果需要对某个范围内的记录批量增加相同的值，差分数组的思想可以帮助优化批量更新操作。

### 2. 图像亮度调整

对图像的某个矩形区域进行亮度调整，可以使用二维差分数组：

```typescript
// 将图像 (x1,y1) 到 (x2,y2) 区域亮度增加 brightness
function adjustBrightness(
  diff: number[][],
  x1: number, y1: number,
  x2: number, y2: number,
  brightness: number
): void {
  diff[x1][y1] += brightness
  diff[x1][y2 + 1] -= brightness
  diff[x2 + 1][y1] -= brightness
  diff[x2 + 1][y2 + 1] += brightness
}
```

### 3. 调度问题

在会议安排或航班调度中，统计每个时间段的资源使用情况：

```typescript
// 统计每个时刻有多少会议正在进行
// 会议 [start, end) 对应 diff[start]++, diff[end]--
const timeline: number[] = new Array(24).fill(0)
meetings.forEach(([start, end]) => {
  timeline[start]++
  if (end < 24) timeline[end]--
})
// 求前缀和即可得到每个时刻的会议数量
```

### 4. 竞赛编程

差分数组是竞赛编程中的高频技巧，常见题型包括：
- 多次区间加减后求最终数组
- 区间修改 + 单点查询
- 与其他数据结构（如线段树）结合使用

## 总结

差分数组是一种简单而强大的技巧：

- **核心思想**：通过记录相邻元素的差值，将区间修改转化为端点操作
- **关键操作**：区间修改 O(1)，最终还原 O(n)
- **与前缀和的关系**：互为逆运算，差分数组求前缀和即还原原数组
- **适用场景**：多次区间修改 + 最后统一查询
- **注意事项**：正确处理右端点 r+1 的边界条件，修改后需要还原才能查询

掌握差分数组，可以让你在处理区间修改问题时事半功倍。结合前缀和，可以同时高效处理区间修改和区间查询，是算法竞赛和实际开发中不可或缺的工具。
