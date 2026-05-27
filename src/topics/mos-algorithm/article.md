# 莫队算法 (Mo's Algorithm)

## 概念解释

莫队算法是一种**离线区间查询算法**，由莫涛在 2009 年国家集训队论文中提出。它的核心思想是：

- 将所有查询**离线收集**
- 按照**分块排序**的方式重新排列查询顺序
- 通过**维护左右指针**的移动来逐步计算每个查询的答案

简单来说，莫队算法通过巧妙地安排查询的处理顺序，将原本需要 O(nm) 的暴力算法优化到 O(n√m)。

### 基本术语

| 术语 | 说明 |
|------|------|
| 离线算法 | 需要提前知道所有查询，不能边接收边回答 |
| 分块 | 将数组分成 √n 大小的块 |
| 指针移动 | 通过添加/删除元素来扩展或收缩当前区间 |
| 区间转移 | 从一个查询的答案转移到相邻查询 |

### 算法分类

```
莫队算法
├── 普通莫队 (Basic Mo's)        — 区间查询
├── 带修改莫队 (Mo's with Updates) — 区间查询 + 单点修改
└── 树上莫队 (Mo's on Tree)       — 树路径查询
```

## 为什么重要

莫队算法在竞赛和实际应用中有重要价值：

1. **通用性强**：适用于几乎所有可以「添加一个元素」和「删除一个元素」来维护答案的区间问题
2. **实现简单**：相比线段树等数据结构，莫队算法的代码量小，不易出错
3. **复杂度优秀**：O(n√m) 的时间复杂度对于大量离线查询非常高效
4. **思维门槛低**：不需要复杂的数据结构知识，理解分块和排序即可

## 核心原理

### 问题模型

给定一个长度为 n 的数组，有 m 个区间查询 [l, r]，每个查询需要计算该区间内的某种统计信息（如不同元素个数、区间和、区间众数等）。

### 暴力解法

对每个查询独立扫描区间，时间复杂度 O(nm)。

### 莫队的优化思路

关键观察：如果我们按某种顺序处理查询，使得相邻两个查询 [l₁, r₁] 和 [l₂, r₂] 的端点距离 |l₁ - l₂| + |r₁ - r₂| 较小，那么从一个查询转移到下一个查询只需移动少量步数。

### 分块排序策略

将数组按位置分成大小为 B 的块（通常 B ≈ √n）。

排序规则（双关键字）：
1. **第一关键字**：左端点 l 所在的块编号 `block(l) = l / B`
2. **第二关键字**：右端点 r 的大小（同一块内按 r 升序，奇数块降序以优化）

```typescript
function comparator(a: Query, b: Query, blockSize: number): number {
  const blockA = Math.floor(a.l / blockSize)
  const blockB = Math.floor(b.l / blockSize)
  if (blockA !== blockB) return blockA - blockB
  // 奇数块右端点降序，偶数块升序（蛇形优化）
  return blockA % 2 === 0 ? a.r - b.r : b.r - a.r
}
```

### 指针移动

维护当前区间 [curL, curR] 和对应答案。对于目标查询 [targetL, targetR]：

```
while curL > targetL:  add(--curL)     // 左指针左移，添加元素
while curR < targetR:  add(++curR)     // 右指针右移，添加元素
while curL < targetL:  remove(curL++)  // 左指针右移，删除元素
while curR > targetR:  remove(curR--)  // 右指针左移，删除元素
```

### 复杂度分析

- 左指针：每个块内最多移动 O(B)，共 O(m) 个查询，但跨块时最多跳 O(n/B) 次，每次 O(B)，总计 O(n * n/B)
- 右指针：同一块内单调移动，每个块最多 O(n)，共 O(n/B) 个块，总计 O(n²/B)
- 总复杂度：O(n²/B + m*B)
- 取 B = n/√m 时，总复杂度为 **O(n√m)**

当 m ≈ n 时，复杂度为 **O(n√n) = O(n^1.5)**。

## 莫队算法示例：区间不同元素个数

### 问题描述

给定数组 a[1..n] 和 m 个查询 [l, r]，求每个区间内不同元素的个数。

### 实现

```typescript
interface Query {
  l: number
  r: number
  id: number
}

function moAlgorithm(a: number[], queries: Query[]): number[] {
  const n = a.length
  const m = queries.length
  const blockSize = Math.floor(Math.sqrt(n))
  const ans: number[] = new Array(m)
  const freq: Map<number, number> = new Map()
  let curL = 0
  let curR = -1
  let curAns = 0

  // 添加元素
  function add(pos: number): void {
    const val = a[pos]
    const count = freq.get(val) || 0
    if (count === 0) curAns++
    freq.set(val, count + 1)
  }

  // 删除元素
  function remove(pos: number): void {
    const val = a[pos]
    const count = freq.get(val) || 0
    if (count === 1) curAns--
    freq.set(val, count - 1)
  }

  // 排序
  queries.sort((a, b) => {
    const blockA = Math.floor(a.l / blockSize)
    const blockB = Math.floor(b.l / blockSize)
    if (blockA !== blockB) return blockA - blockB
    return blockA % 2 === 0 ? a.r - b.r : b.r - a.r
  })

  // 处理查询
  for (const q of queries) {
    while (curL > q.l) add(--curL)
    while (curR < q.r) add(++curR)
    while (curL < q.l) remove(curL++)
    while (curR > q.r) remove(curR--)
    ans[q.id] = curAns
  }

  return ans
}
```

## 带修改莫队

当问题中还包含**单点修改**操作时，普通莫队不再适用。带修改莫队通过增加「时间」维度来解决。

### 排序策略

三维排序：(左块, 右块, 时间戳)

```typescript
const B = Math.pow(n, 2 / 3)  // 块大小取 n^(2/3)

queries.sort((a, b) => {
  const blockAL = Math.floor(a.l / B)
  const blockBL = Math.floor(b.l / B)
  if (blockAL !== blockBL) return blockAL - blockBL

  const blockAR = Math.floor(a.r / B)
  const blockBR = Math.floor(b.r / B)
  if (blockAR !== blockBR) return blockAR - blockBR

  return a.time - b.time
})
```

### 指针移动

除了移动左右指针，还需要移动时间指针来执行或撤销修改：

```typescript
while curTime < targetTime: applyUpdate(++curTime)
while curTime > targetTime: revertUpdate(curTime--)
```

### 复杂度

块大小取 n^(2/3) 时，总复杂度为 **O(n^(5/3))**。

## 树上莫队

将莫队算法从序列推广到树上，用于回答树上路径查询。

### DFS 序技巧

通过 DFS 序将树上的路径转化为序列上的区间。使用括号序（每个节点在进入和退出时各记录一次），树上 u 到 v 的路径对应括号序上的一个区间。

### 复杂度

与普通莫队相同，为 **O(n√m)**。

## 可视化说明

在可视化界面中，莫队算法的核心过程表现为：

1. **数组与分块**：数组被分成若干块，用不同颜色标记
2. **查询排序**：查询按照分块规则重新排列
3. **指针移动**：左右指针在数组上滑动，添加（绿色）或删除（红色）元素
4. **答案维护**：实时显示当前区间的答案变化

通过动画可以直观理解：
- 分块排序如何减少指针移动的总距离
- 每次添加/删除元素如何影响答案
- 相邻查询之间的转移过程

## 常见错误

### 1. 块大小选择不当

```typescript
// 错误：块大小设为 1 或 n
const blockSize = 1  // 退化为按左端点排序，右指针可能大幅跳动

// 正确：根据问题类型选择合适的块大小
const blockSize = Math.floor(Math.sqrt(n))  // 普通莫队
const blockSize = Math.floor(Math.pow(n, 2/3))  // 带修改莫队
```

### 2. add 和 remove 函数不对称

```typescript
// 错误：add 和 remove 的逻辑不互逆
function add(pos: number) {
  freq[a[pos]]++
  if (freq[a[pos]] === 1) curAns++  // 新元素出现
}
function remove(pos: number) {
  freq[a[pos]]--  // 忘记检查是否减到 0
  // curAns 没有减少！
}

// 正确：确保互逆
function remove(pos: number) {
  freq[a[pos]]--
  if (freq[a[pos]] === 0) curAns--  // 元素完全消失
}
```

### 3. 初始指针设置错误

```typescript
// 错误：初始区间为空但指针设置不当
let curL = 1
let curR = 0  // 如果数组从 0 开始，应该是 -1

// 正确：确保初始区间为空区间 [0, -1]
let curL = 0
let curR = -1
```

### 4. 忘记记录原始查询编号

```typescript
// 错误：排序后丢失了原始查询顺序
queries.sort(comparator)
for (const q of queries) {
  ans.push(curAns)  // ans 的顺序是排序后的，不是原始顺序
}

// 正确：记录原始编号
interface Query { l: number; r: number; id: number }
for (const q of queries) {
  ans[q.id] = curAns  // 按原始编号存储
}
```

### 5. 带修改莫队中忘记撤销修改

```typescript
// 错误：时间指针回退时没有撤销修改
while (curTime > targetTime) {
  curTime--  // 只移动了指针，没有撤销操作
}

// 正确：必须撤销修改
while (curTime > targetTime) {
  revertUpdate(curTime)
  curTime--
}
```

## 实际应用

### 1. 区间不同元素个数

统计区间 [l, r] 中不同元素的数量，是莫队算法最经典的应用。

### 2. 区间众数查询

求区间内出现次数最多的元素。使用莫队维护每个元素的出现次数和当前众数。

### 3. 区间逆序对

维护区间内的逆序对数量，添加/删除元素时更新 BIT 或平衡树。

### 4. 色区间问题

在序列上进行区间颜色统计，如「区间内恰好出现 k 次的颜色数」。

### 5. 树上路径查询

- 树上路径不同颜色数
- 树上路径权值和
- 最近公共祖先相关问题

## 总结

莫队算法是一种优雅的离线区间查询方案：

**核心思想**：
- 离线处理 + 分块排序 + 指针滑动

**时间复杂度**：

| 变种 | 块大小 | 复杂度 |
|------|--------|--------|
| 普通莫队 | √n | O(n√m) |
| 带修改莫队 | n^(2/3) | O(n^(5/3)) |
| 树上莫队 | √n | O(n√m) |

**优点**：
- 实现简单，代码量小
- 通用性强，适用于大量区间统计问题
- 不需要复杂的数据结构

**缺点**：
- 必须离线处理
- 要求添加/删除操作可以高效完成
- 对于强制在线的问题不适用

**适用场景**：
- 大量离线区间查询
- 区间统计问题（不同元素个数、区间众数等）
- 树上路径统计问题

莫队算法体现了「通过调整处理顺序来降低总复杂度」的核心思想，是离线算法中的经典代表。
