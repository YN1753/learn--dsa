# K-D树 (K-D Tree)

## 概念解释

K-D树（K-Dimensional Tree）是一种用于组织k维空间中点集的**二叉搜索树**。它是二叉搜索树在多维空间中的推广。

想象你在一个房间里有很多气球。如果你想快速找到离某个位置最近的气球，你会怎么做？一个聪明的办法是：先把房间按左右分成两半，再把每一半按前后分成两半，如此反复。这样每次查找时，你只需要看一半的区域，大大减少了搜索范围。K-D树就是这个思路的数据结构实现。

### 核心思想

K-D树的每一层按照**不同的维度**对空间进行分割：

- **第0层**：按第0维（如x坐标）分割
- **第1层**：按第1维（如y坐标）分割
- **第2层**：按第2维（如z坐标）分割
- **第k层**：按第 k mod d 维分割（d为总维度）

这种交替分割的方式保证了每个维度都被均匀地考虑。

### 基本术语

| 术语 | 说明 |
|------|------|
| 分割维度 (Split Axis) | 当前节点用来分割空间的维度 |
| 分割超平面 (Split Hyperplane) | 垂直于分割维度的平面，将空间分为两部分 |
| 左子树 | 分割维度值小于等于中位数的点 |
| 右子树 | 分割维度值大于中位数的点 |
| 叶节点 | 不再分割的节点，通常存储实际数据点 |

## 为什么重要

K-D树在多维空间查询中具有重要地位：

1. **高效查询**：平均情况下，最近邻搜索的时间复杂度为 O(log n)，远优于暴力搜索的 O(n)
2. **空间索引**：是处理多维空间数据的基础工具，广泛应用于地理信息系统、计算机图形学等领域
3. **范围查询**：可以高效地找到某个区域内的所有点
4. **机器学习基础**：kNN（k近邻）算法的加速核心，是机器学习中最常用的算法之一
5. **游戏开发**：碰撞检测、可见性判断等都需要空间查询

### 与其他数据结构的对比

| 数据结构 | 维度 | 最近邻查询 | 构建时间 | 适用场景 |
|----------|------|-----------|----------|----------|
| 暴力搜索 | 任意 | O(n) | 无 | 数据量小 |
| K-D树 | 低维(2-20) | O(log n) 平均 | O(n log n) | 低维空间查询 |
| R树 | 任意 | O(log n) | O(n log n) | 数据库索引 |
| 球树 | 中高维 | O(log n) | O(n log n) | 高维数据 |

## 核心原理

### 1. 构建K-D树

构建过程是一个递归的空间分割过程：

1. 选择当前深度对应的维度 d = depth % k
2. 按该维度对所有点排序
3. 选择中位数点作为当前节点
4. 左半部分点递归构建左子树
5. 右半部分点递归构建右子树

```typescript
interface KDNode {
  point: number[]      // 数据点
  axis: number         // 分割维度
  left: KDNode | null  // 左子树
  right: KDNode | null // 右子树
}

function buildKDTree(points: number[][], depth: number = 0): KDNode | null {
  if (points.length === 0) return null

  const k = points[0].length  // 维度数
  const axis = depth % k      // 当前分割维度

  // 按当前维度排序
  points.sort((a, b) => a[axis] - b[axis])
  const mid = Math.floor(points.length / 2)

  return {
    point: points[mid],
    axis,
    left: buildKDTree(points.slice(0, mid), depth + 1),
    right: buildKDTree(points.slice(mid + 1), depth + 1),
  }
}
```

**构建示例**（2维数据）：

```
数据点: (2,3), (5,4), (9,6), (4,7), (8,1), (7,2)

第1层 (axis=0, 按x排序):
  排序后: (2,3), (4,7), (5,4), (7,2), (8,1), (9,6)
  中位数: (5,4) → 根节点

第2层 (axis=1, 按y排序):
  左子树点: (2,3), (4,7)
    按y排序: (2,3), (4,7)
    中位数: (2,3) → 左子节点
  右子树点: (7,2), (8,1), (9,6)
    按y排序: (8,1), (7,2), (9,6)
    中位数: (7,2) → 右子节点
```

### 2. 最近邻搜索

最近邻搜索是K-D树最重要的操作，核心思想是**深度优先搜索 + 剪枝**：

```typescript
function nearestNeighbor(
  root: KDNode | null,
  target: number[],
  depth: number = 0,
  best: KDNode | null = null
): KDNode | null {
  if (root === null) return best

  const k = target.length
  const axis = depth % k

  // 更新最近点
  if (best === null || distance(target, root.point) < distance(target, best.point)) {
    best = root
  }

  // 先搜索更可能包含最近点的子树
  const diff = target[axis] - root.point[axis]
  const closeSide = diff < 0 ? root.left : root.right
  const farSide = diff < 0 ? root.right : root.left

  best = nearestNeighbor(closeSide, target, depth + 1, best)

  // 剪枝：如果到分割超平面的距离 >= 当前最近距离，跳过另一侧
  if (Math.abs(diff) < distance(target, best.point)) {
    best = nearestNeighbor(farSide, target, depth + 1, best)
  }

  return best
}
```

**剪枝原理**：

```
查询点 Q，当前最近点 B，距离 d

分割超平面
     |
     |   Q *          * B
     |        d
     |
     |   另一侧的最近距离 >= 到超平面的距离
     |   如果 到超平面距离 >= d，则另一侧不可能有更近的点
     |   → 剪枝！跳过整个子树
```

### 3. 范围搜索

查找某个半径范围内的所有点：

```typescript
function rangeSearch(
  root: KDNode | null,
  target: number[],
  radius: number,
  depth: number = 0
): number[][] {
  if (root === null) return []

  const k = target.length
  const axis = depth % k
  const result: number[][] = []

  // 检查当前点是否在范围内
  if (distance(target, root.point) <= radius) {
    result.push(root.point)
  }

  const diff = target[axis] - root.point[axis]

  // 搜索可能包含范围内点的子树
  if (diff - radius <= 0) {
    result.push(...rangeSearch(root.left, target, radius, depth + 1))
  }
  if (diff + radius >= 0) {
    result.push(...rangeSearch(root.right, target, radius, depth + 1))
  }

  return result
}
```

### 4. 时间复杂度

| 操作 | 平均 | 最坏 |
|------|------|------|
| 构建 | O(n log n) | O(n log n) |
| 最近邻搜索 | O(log n) | O(n) |
| 范围搜索 | O(n^(1-1/k) + m) | O(n) |
| 插入 | O(log n) | O(n) |
| 删除 | O(log n) | O(n) |

其中 k 是维度数，m 是返回的结果数量。

## 可视化说明

在可视化界面中，K-D树通过以下方式展示：

- **散点图**：显示所有数据点的位置
- **分割线**：每条线代表一次空间分割，交替水平和垂直
- **树结构**：右侧显示对应的二叉树
- **搜索过程**：动态展示最近邻搜索的路径和剪枝过程

通过交互可以观察：
- 分割线如何交替在不同维度上切割空间
- 最近邻搜索如何沿着树向下遍历
- 剪枝如何跳过不可能包含更近点的子树
- 范围搜索如何找到圆形区域内的所有点

## 常见错误

### 1. 维度循环忘记取模

```typescript
// 错误：维度递增后不会回到0
const axis = depth  // depth可能超过k-1，导致越界

// 正确：使用取模运算
const axis = depth % k
```

### 2. 最近邻搜索剪枝不充分

```typescript
// 错误：总是搜索两个子树，没有剪枝
best = nearestNeighbor(root.left, target, depth + 1, best)
best = nearestNeighbor(root.right, target, depth + 1, best)

// 正确：先搜索近侧，再判断是否需要搜索远侧
best = nearestNeighbor(closeSide, target, depth + 1, best)
if (Math.abs(diff) < distance(target, best.point)) {
  best = nearestNeighbor(farSide, target, depth + 1, best)
}
```

### 3. 建树不平衡

```typescript
// 错误：选择第一个点作为根节点
const root = { point: points[0], ... }

// 正确：选择中位数，保证树平衡
points.sort((a, b) => a[axis] - b[axis])
const mid = Math.floor(points.length / 2)
const root = { point: points[mid], ... }
```

### 4. 距离计算不正确

```typescript
// 错误：只计算了一个维度的距离
const dist = Math.abs(a[0] - b[0])

// 正确：计算欧几里得距离（所有维度）
let sum = 0
for (let i = 0; i < a.length; i++) {
  sum += (a[i] - b[i]) ** 2
}
const dist = Math.sqrt(sum)
```

## 实际应用

### 1. 机器学习 - kNN算法

K-D树是kNN（k近邻）分类算法的核心加速结构：

```typescript
function knn(tree: KDNode, testPoint: number[], k: number): number[][] {
  // 使用K-D树快速找到k个最近的训练样本
  const neighbors: number[][] = []
  // ... 使用优先队列维护k个最近点
  return neighbors
}
```

kNN通过找到离测试点最近的k个训练样本来进行分类或回归。没有K-D树时需要O(n)时间，使用K-D树后平均只需O(log n)。

### 2. 游戏引擎 - 碰撞检测

在2D或3D游戏中，需要快速判断哪些物体可能发生碰撞：

```typescript
// 查找某个物体附近的所有其他物体
function findNearbyObjects(tree: KDNode, position: number[], radius: number) {
  return rangeSearch(tree, position, radius)
  // 只对范围内的物体进行精确碰撞检测
}
```

### 3. 地理信息系统

在地图应用中查找附近的兴趣点（POI）：

```typescript
// 查找用户位置附近的餐厅
const nearbyRestaurants = rangeSearch(
  restaurantTree,
  [userLat, userLng],
  searchRadius
)
```

### 4. 点云处理

在3D扫描和自动驾驶中，点云数据需要高效的空间索引：

```typescript
// 对3D点云建立K-D树
const pointCloudTree = buildKDTree(pointCloud3D)

// 查找某个点附近的点（用于法向量估计、表面重建等）
const nearbyPoints = rangeSearch(pointCloudTree, queryPoint, radius)
```

## 总结

K-D树是一种优雅的多维空间索引数据结构：

**核心思想**：
- 交替按不同维度分割空间
- 使用中位数保持树的平衡
- 通过剪枝优化搜索效率

**优点**：
- 低维空间中查询效率高，平均O(log n)
- 构建简单，理解直观
- 支持最近邻、范围查询等多种操作

**缺点**：
- 高维空间中性能退化严重（维度灾难）
- 不适合频繁插入删除的场景
- 对数据分布敏感

**适用场景**：
- 低维度（2-20维）的空间查询
- 静态数据集或少量更新的场景
- 机器学习中的kNN加速
- 游戏中的碰撞检测和空间查询
- 地理信息系统中的位置搜索

理解K-D树是掌握空间数据结构的重要一步，它将二叉搜索树的思想自然地推广到了多维空间，是算法设计中「分治思想」的经典应用。
