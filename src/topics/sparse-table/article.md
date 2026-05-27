# 稀疏表 (Sparse Table / ST表)

## 概念解释

稀疏表（Sparse Table，简称 ST 表）是一种用于**静态区间查询**的数据结构。它基于**倍增**（binary lifting）的思想，通过预处理所有长度为 2 的幂次的区间信息，实现 O(1) 的区间最值查询。

### 核心思想

ST 表的核心非常简单：**任何一个区间都可以拆成两个重叠的、长度为 2 的幂次的区间**。

例如，区间 [2, 7]（长度为 6）可以拆成：
- [2, 5]（长度 4 = 2^2）
- [4, 7]（长度 4 = 2^2）

两个区间有重叠 [4, 5]，但这不影响最值的求解，因为最值操作满足**幂等性**：重复计算同一个元素不影响结果。

### 基本术语

| 术语 | 说明 |
|------|------|
| 倍增 (Binary Lifting) | 每次将范围扩大一倍的递推方法 |
| RMQ (Range Minimum/Maximum Query) | 区间最值查询 |
| 幂等性 (Idempotent) | f(f(x)) = f(x)，如 max、min、gcd |
| st[i][k] | 从位置 i 开始，长度为 2^k 的区间的最值 |

## 为什么重要

ST 表在竞赛和实际工程中有重要地位：

1. **查询极快**：O(1) 的区间最值查询，在大量查询场景下优势巨大
2. **实现简单**：代码量少，容易理解和调试
3. **倍增思想通用**：倍增是许多高级算法的基础（如 LCA、树上倍增）
4. **空间换时间**：经典的预处理优化思路

## 核心原理

### 数据结构定义

ST 表是一个二维数组 `st[i][k]`，其中：
- `i` 表示起始位置（0-indexed）
- `k` 表示区间长度为 2^k

```
st[i][k] = max(arr[i], arr[i+1], ..., arr[i + 2^k - 1])
```

### 预处理：递推构建

预处理利用递推关系：

```
st[i][k] = max(st[i][k-1], st[i + 2^(k-1)][k-1])
```

含义：长度为 2^k 的区间，可以拆成两个长度为 2^(k-1) 的子区间。

```typescript
function buildSparseTable(arr: number[]): number[][] {
  const n = arr.length
  const logN = Math.floor(Math.log2(n))
  const st: number[][] = Array.from(
    { length: n },
    () => Array(logN + 1).fill(0)
  )

  // 初始化：k=0 时，区间长度为 1，就是元素本身
  for (let i = 0; i < n; i++) {
    st[i][0] = arr[i]
  }

  // 递推：从小到大枚举 k
  for (let k = 1; k <= logN; k++) {
    for (let i = 0; i + (1 << k) - 1 < n; i++) {
      st[i][k] = Math.max(
        st[i][k - 1],
        st[i + (1 << (k - 1))][k - 1]
      )
    }
  }

  return st
}
```

**时间复杂度**：O(n log n)
**空间复杂度**：O(n log n)

### 查询：O(1) 区间最值

查询 [l, r] 区间的最值：

1. 计算区间长度 `len = r - l + 1`
2. 找到最大的 k 使得 `2^k <= len`
3. 取两个重叠区间的最值

```typescript
function query(st: number[][], l: number, r: number): number {
  const len = r - l + 1
  const k = Math.floor(Math.log2(len))
  return Math.max(st[l][k], st[r - (1 << k) + 1][k])
}
```

**为什么正确？**

两个区间 [l, l + 2^k - 1] 和 [r - 2^k + 1, r] 的并集覆盖了整个 [l, r]。即使有重叠，由于最值的幂等性，结果仍然正确。

**时间复杂度**：O(1)

### 倍增思想

ST 表的预过程体现了**倍增**思想：

- k = 0：知道所有长度为 1 的区间的最值
- k = 1：由 k = 0 的结果推出所有长度为 2 的区间的最值
- k = 2：由 k = 1 的结果推出所有长度为 4 的区间的最值
- ...

每一步都利用上一步的结果，将"已知范围"扩大一倍。这种思想在 LCA（最近公共祖先）等算法中也广泛使用。

## 可视化说明

ST 表可以想象为一个二维表格：

```
       k=0    k=1    k=2    k=3
i=0  [  3  ] [  3  ] [  4  ] [  9  ]
i=1  [  1  ] [  4  ] [  9  ] [  9  ]
i=2  [  4  ] [  4  ] [  9  ] [  ... ]
i=3  [  1  ] [  5  ] [  9  ] [  ... ]
i=4  [  5  ] [  9  ] [  9  ]
i=5  [  9  ] [  9  ] [  6  ]
i=6  [  2  ] [  6  ]
i=7  [  6  ]
```

每一列 k 对应一种区间长度。预处理就是从左到右填充这个表格。

查询时，只需要在表格中查两个位置，取最值即可。

## 常见错误

### 1. 混淆幂等性和结合律

```typescript
// 错误：用 ST 表求区间和
// 区间和不满足幂等性！重叠部分会被重复计算
// st[i][k] = st[i][k-1] + st[i + (1<<(k-1))][k-1]  // 这是正确的预处理
// 但查询时两个区间有重叠，求和会重复计算

// 正确：求区间和应该用前缀和或线段树
```

### 2. 边界条件处理

```typescript
// 错误：没有检查区间是否有效
function query(st: number[][], l: number, r: number): number {
  const k = Math.floor(Math.log2(r - l + 1))
  return Math.max(st[l][k], st[r - (1 << k) + 1][k])
  // 如果 l > r 或超出数组范围，会出错
}

// 正确：先检查边界
function query(st: number[][], l: number, r: number): number {
  if (l > r || l < 0 || r >= st.length) throw new Error('Invalid range')
  const k = Math.floor(Math.log2(r - l + 1))
  return Math.max(st[l][k], st[r - (1 << k) + 1][k])
}
```

### 3. 预处理时数组越界

```typescript
// 错误：没有检查 i + (1<<k) - 1 < n
for (let i = 0; i < n; i++) {  // 可能越界！
  st[i][k] = Math.max(st[i][k-1], st[i + (1 << (k-1))][k-1])
}

// 正确：加上边界检查
for (let i = 0; i + (1 << k) - 1 < n; i++) {
  st[i][k] = Math.max(st[i][k-1], st[i + (1 << (k-1))][k-1])
}
```

### 4. 试图在修改后复用 ST 表

```typescript
// 错误：修改数组后不重新预处理
arr[3] = 100
// st 表仍然是旧的值！
const result = query(st, 2, 5)  // 结果可能不正确

// 正确：修改后需要重新构建
arr[3] = 100
const newSt = buildSparseTable(arr)
const result = query(newSt, 2, 5)
```

## 实际应用

### 1. 竞赛中的区间最值查询

ST 表是解决 RMQ 问题的经典方法，在信息学竞赛中广泛使用。

### 2. 最近公共祖先 (LCA)

树上倍增求 LCA 的思想与 ST 表一致：预处理每个节点向上跳 2^k 步到达的祖先，然后 O(log n) 查询 LCA。

### 3. 区间 GCD 查询

GCD 满足幂等性（gcd(gcd(a,b), gcd(b,c)) = gcd(a,b,c)），因此 ST 表也可以用于 O(1) 区间 GCD 查询。

### 4. 数据库查询优化

某些数据库在处理大量静态数据的范围查询时，会使用类似 ST 表的预处理策略来加速查询。

## 总结

ST 表是一种简洁高效的静态区间查询结构：

**优点**：
- 查询时间 O(1)，在大量查询场景下优势明显
- 实现简单，代码量少
- 倍增思想可推广到其他算法

**缺点**：
- 不支持修改操作（修改需要重新预处理 O(n log n)）
- 空间复杂度 O(n log n)
- 只适用于满足幂等性的操作（max、min、gcd 等）

**适用场景**：
- 静态数据的大量区间最值查询
- 竞赛中的 RMQ 问题
- 需要 O(1) 查询且数据不变的场景

**与线段树的选择**：
- 数据不变、只需查询 -> ST 表（查询更快）
- 需要修改数据 -> 线段树（支持修改）
