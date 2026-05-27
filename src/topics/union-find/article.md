# 并查集 (Union-Find)

## 概念解释

并查集（Union-Find），也叫**不相交集合**（Disjoint Set），是一种用于管理元素分组的数据结构。它支持两种核心操作：

- **Find（查找）**：确定某个元素属于哪个集合。每个集合有一个**代表元素**（也叫根节点、集合标识），Find 返回的就是这个代表元素。
- **Union（合并）**：将两个集合合并为一个集合。

并查集的核心思想是：**每个集合用一棵树来表示**，树的根节点就是该集合的代表元素。所有属于同一集合的元素，最终都会沿着父节点指针找到同一个根。

```
初始状态（6 个元素，各自独立）:
  {0}  {1}  {2}  {3}  {4}  {5}

执行 Union(0, 1), Union(2, 3), Union(4, 5) 后:
  {0, 1}  {2, 3}  {4, 5}

执行 Union(1, 3) 后:
  {0, 1, 2, 3}  {4, 5}

执行 Find(2) → 返回 0（代表元素）
执行 Find(4) → 返回 4（代表元素）
判断: Find(2) == Find(4)?  → 否，不在同一集合
```

### 核心术语

- **代表元素 / 根节点（Representative / Root）**：每个集合的标识，是树的根节点。Find 操作返回的就是这个值。
- **父节点数组（Parent Array）**：`parent[i]` 存储元素 i 的父节点。根节点的父节点是自身（或设为 -1）。
- **按秩合并（Union by Rank）**：合并时将较矮的树挂到较高的树下面，保持平衡。
- **路径压缩（Path Compression）**：Find 过程中将路径上的节点直接指向根，加速后续查询。

## 为什么重要

并查集看似简单，却是解决**连通性问题**的利器：

**网络连通性判断**：判断两台计算机是否在同一网络中，或者网络中有多少个独立的子网络。

**Kruskal 最小生成树**：贪心地按权重从小到大选边，用并查集判断是否会形成环——这是并查集最经典的应用。

**社交网络好友圈**：判断两个人是否属于同一个社交圈子，或者统计一共有多少个独立的社交圈。

**渗流问题（Percolation）**：物理和材料科学中的经典问题，判断一个网格系统是否从顶部到底部连通。

**图像处理**：连通区域标记（Connected Component Labeling），将相邻的同色像素归为同一区域。

并查集的魅力在于：经过两种简单优化后，每次操作的均摊时间复杂度接近 **O(1)**，效率极高。

## 核心原理

### 基本实现：父节点数组

并查集的核心数据结构是一个数组 `parent[]`，其中 `parent[i]` 表示元素 i 的父节点。

```typescript
// 初始化：每个元素是自己的父节点（独立集合）
function makeSet(n: number): number[] {
  const parent: number[] = new Array(n)
  for (let i = 0; i < n; i++) {
    parent[i] = i  // 自己是自己的代表
  }
  return parent
}
```

```
初始状态（n=6）:
索引:   0   1   2   3   4   5
parent: 0   1   2   3   4   5
        ↑   ↑   ↑   ↑   ↑   ↑
       根  根  根  根  根  根
```

### 朴素 Find 操作

Find 操作沿着父节点指针向上追溯，直到找到根节点（`parent[x] == x`）。

```typescript
function find(parent: number[], x: number): number {
  while (parent[x] !== x) {
    x = parent[x]
  }
  return x
}
```

### 朴素 Union 操作

Union 操作先找到两个元素各自的根，然后将一棵树的根指向另一棵树的根。

```typescript
function union(parent: number[], x: number, y: number): void {
  const rootX = find(parent, x)
  const rootY = find(parent, y)
  if (rootX !== rootY) {
    parent[rootX] = rootY  // 将 x 的根挂到 y 的根下面
  }
}
```

```
Union(0, 1):        Union(2, 3):        Union(1, 3):
  0 ← 1              2 ← 3              0 ← 1
                                          ↑
  parent[0]=1         parent[2]=3         2 ← 3
                                          ↑
                      rootX=find(1)=0     rootX=0, rootY=2
                                          parent[0]=2
                                          结果: 2 → 0 → 1
                                                ↑
                                                3
```

朴素实现的问题：连续执行 `union(0,1), union(1,2), union(2,3), ...` 会形成一条长链，树高为 O(n)，Find 操作退化为 O(n)。

### 优化一：按秩合并（Union by Rank）

维护一个 `rank[]` 数组，记录每棵树的**上界高度**。合并时，总是将 rank 较小的树挂到 rank 较大的树下面。

```typescript
function unionByRank(parent: number[], rank: number[], x: number, y: number): void {
  const rootX = find(parent, x)
  const rootY = find(parent, y)
  if (rootX === rootY) return

  if (rank[rootX] < rank[rootY]) {
    parent[rootX] = rootY    // 矮树挂到高树下
  } else if (rank[rootX] > rank[rootY]) {
    parent[rootY] = rootX    // 矮树挂到高树下
  } else {
    parent[rootY] = rootX    // 高度相同，任选一个
    rank[rootX]++            // 高度加 1
  }
}
```

```
按秩合并示例:
  rank=1:   A       rank=1:   B
           / \              / \
          0   1            2   3

  Union(A, B): rank 相同，选 A 为新根
        A (rank=2)
       /|\
      0 1 B
         / \
        2   3

  树高保持最小，不会退化成链
```

按秩合并保证树高最多为 O(log n)。

### 优化二：路径压缩（Path Compression）

在 Find 过程中，将路径上所有节点**直接指向根节点**，大幅缩短后续查询路径。

```typescript
function findWithPathCompression(parent: number[], x: number): number {
  if (parent[x] !== x) {
    parent[x] = findWithPathCompression(parent, parent[x])  // 递归压缩
  }
  return parent[x]
}
```

```
路径压缩前:          路径压缩后:
    3                     3
    ↑                   / | \
    2        →         0  1  2
    ↑
    1
    ↑
    0

find(0) 后，0、1、2 都直接指向根 3
下次 find(0) 只需一步！
```

### 两种优化结合：近似 O(1)

同时使用路径压缩和按秩合并，m 次操作的总时间复杂度为 **O(m · α(n))**，其中 α(n) 是**反阿克曼函数**。

阿克曼函数增长极快：A(4, 2) 已经是一个天文数字。其反函数 α(n) 增长极慢——即使 n 是宇宙中所有原子的数量（约 10^80），α(n) 也不超过 4。因此在实践中，并查集的每次操作可以认为是 **O(1)**。

| 优化方案 | Find 复杂度 | Union 复杂度 | m 次操作总复杂度 |
|---------|-----------|------------|----------------|
| 无优化 | O(n) | O(n) | O(mn) |
| 仅按秩合并 | O(log n) | O(log n) | O(m log n) |
| 仅路径压缩 | 均摊 O(log n) | 均摊 O(log n) | O(m log n) |
| 两者结合 | 均摊 O(α(n)) | 均摊 O(α(n)) | O(m α(n)) ≈ O(m) |

## 可视化说明

在可视化界面中，你可以直观地观察并查集的工作过程：

1. **森林结构**：每个元素显示为节点，父节点关系用箭头连接。每个集合形成一棵树，根节点用不同颜色高亮。
2. **Union 动画**：选择两个元素后，可以看到两棵树如何合并——较小的树被挂到较大树的根下面。
3. **Find 动画**：选择一个元素后，可以看到沿着父节点指针追溯到根的过程。开启路径压缩后，路径上的节点会重新连接到根。
4. **优化开关**：可以独立开启/关闭路径压缩和按秩合并，对比不同优化策略下的树结构变化。
5. **速度控制**：通过滑块调整动画速度，可以慢速观察每一步细节，也可以快速浏览整体过程。

## 常见错误

### 1. 忘记路径压缩导致性能退化

```typescript
// 错误：朴素 Find，不压缩路径
function findBad(parent: number[], x: number): number {
  while (parent[x] !== x) {
    x = parent[x]
  }
  return x  // 路径上的节点下次还要重新遍历！
}

// 正确：使用路径压缩
function findGood(parent: number[], x: number): number {
  if (parent[x] !== x) {
    parent[x] = findGood(parent, parent[x])
  }
  return parent[x]
}
```

不使用路径压缩时，连续的 Union 操作可能形成高树，Find 退化为 O(n)。在数据量大的场景下，这会带来数量级的性能差异。

### 2. 朴素 Union 不考虑树高

```typescript
// 错误：总是把 rootX 挂到 rootY 下
function unionBad(parent: number[], x: number, y: number): void {
  const rootX = find(parent, x)
  const rootY = find(parent, y)
  if (rootX !== rootY) {
    parent[rootX] = rootY  // 可能导致树越来越高
  }
}

// 正确：使用按秩合并
function unionGood(parent: number[], rank: number[], x: number, y: number): void {
  const rootX = find(parent, x)
  const rootY = find(parent, y)
  if (rootX === rootY) return

  if (rank[rootX] < rank[rootY]) {
    parent[rootX] = rootY
  } else if (rank[rootX] > rank[rootY]) {
    parent[rootY] = rootX
  } else {
    parent[rootY] = rootX
    rank[rootX]++
  }
}
```

### 3. Find 实现中遗漏递归赋值

```typescript
// 错误：只递归查找，没有更新 parent[x]
function findWrong(parent: number[], x: number): number {
  if (parent[x] !== x) {
    return findWrong(parent, parent[x])  // parent[x] 没有被更新！
  }
  return x
}

// 正确：递归返回时更新 parent[x]
function findCorrect(parent: number[], x: number): number {
  if (parent[x] !== x) {
    parent[x] = findCorrect(parent, parent[x])  // 关键：parent[x] = ...
  }
  return parent[x]
}
```

这叫"路径分裂"的遗漏版本——虽然能找到根，但没有压缩路径，丢失了优化效果。

### 4. 混淆 rank 和实际深度

```typescript
// rank 不是精确的树高，而是上界
// 只在两棵树 rank 相同时才增加 rank
// 不要尝试用 rank 做精确的深度计算
```

## 实际应用

### 1. Kruskal 最小生成树

```typescript
interface Edge { u: number; v: number; weight: number }

function kruskal(n: number, edges: Edge[]): Edge[] {
  // 按权重排序
  edges.sort((a, b) => a.weight - b.weight)

  // 初始化并查集
  const parent: number[] = new Array(n)
  const rank: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) parent[i] = i

  const mst: Edge[] = []

  for (const edge of edges) {
    const rootU = find(parent, edge.u)
    const rootV = find(parent, edge.v)

    if (rootU !== rootV) {
      // 不会形成环，加入 MST
      mst.push(edge)
      unionByRank(parent, rank, edge.u, edge.v)
    }

    if (mst.length === n - 1) break  // MST 已完成
  }

  return mst
}
```

### 2. 网络连通性检测

```typescript
class Network {
  private parent: number[]
  private rank: number[]
  private components: number

  constructor(n: number) {
    this.parent = new Array(n)
    this.rank = new Array(n).fill(0)
    this.components = n
    for (let i = 0; i < n; i++) this.parent[i] = i
  }

  // 连接两台计算机
  connect(a: number, b: number): void {
    const rootA = find(this.parent, a)
    const rootB = find(this.parent, b)
    if (rootA !== rootB) {
      unionByRank(this.parent, this.rank, a, b)
      this.components--  // 连通分量减少
    }
  }

  // 判断两台计算机是否连通
  isConnected(a: number, b: number): boolean {
    return find(this.parent, a) === find(this.parent, b)
  }

  // 获取独立网络数量
  getComponentCount(): number {
    return this.components
  }
}
```

### 3. 社交网络好友圈

```typescript
// 统计社交网络中有多少个独立的好友圈
function countFriendCircles(n: number, friendships: [number, number][]): number {
  const parent: number[] = new Array(n)
  const rank: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) parent[i] = i

  for (const [a, b] of friendships) {
    unionByRank(parent, rank, a, b)
  }

  // 统计有多少个不同的根
  const roots = new Set<number>()
  for (let i = 0; i < n; i++) {
    roots.add(find(parent, i))
  }
  return roots.size
}

// 示例: 6 个人，3 组好友关系
// friendships: [[0,1], [2,3], [4,5]]
// 结果: 3 个好友圈
```

### 4. 图像连通区域标记

```typescript
// 在二值图像中，将相邻的白色像素归为同一区域
function labelConnectedComponents(grid: number[][]): number {
  const rows = grid.length
  const cols = grid[0].length
  const n = rows * cols
  const parent: number[] = new Array(n)
  const rank: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) parent[i] = i

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        const idx = r * cols + c
        // 检查右邻居和下邻居
        if (c + 1 < cols && grid[r][c + 1] === 1) {
          unionByRank(parent, rank, idx, idx + 1)
        }
        if (r + 1 < rows && grid[r + 1][c] === 1) {
          unionByRank(parent, rank, idx, idx + cols)
        }
      }
    }
  }

  // 统计连通区域数
  const regions = new Set<number>()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        regions.add(find(parent, r * cols + c))
      }
    }
  }
  return regions.size
}
```

## 总结

并查集是处理**不相交集合合并与查询**的高效数据结构，核心要点：

1. **两种操作**：Find 查找元素所属集合的代表，Union 合并两个集合。
2. **树形结构**：每个集合用一棵树表示，根节点是集合的代表元素，用父节点数组存储。
3. **两大优化**：路径压缩让 Find 近乎 O(1)，按秩合并保持树的平衡。两者结合后均摊时间复杂度为 O(α(n)) ≈ O(1)。
4. **经典应用**：Kruskal 最小生成树、网络连通性、社交圈分析、图像连通区域标记。
5. **实现简单**：只需一个 parent 数组和一个 rank 数组，代码量少但威力巨大。

并查集是"简单但强大"的典范——十几行代码就能解决复杂的连通性问题，是每个程序员工具箱中必备的数据结构。
