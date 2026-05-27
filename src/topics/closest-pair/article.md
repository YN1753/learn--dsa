# 最近点对 (Closest Pair of Points)

## 概念解释

**最近点对问题**是计算几何中的经典问题：给定平面上的n个点，找到距离最近的一对点。

这个问题看似简单，但有着深刻的算法设计思想。最直观的暴力解法是检查所有点对，时间复杂度为O(n²)。而通过**分治法**，可以将其优化到O(n log n)。

### 基本术语

| 术语 | 说明 |
|------|------|
| 点对距离 | 两点之间的欧几里得距离 √((x₁-x₂)² + (y₁-y₂)²) |
| 分治法 | 将问题分解为子问题，递归求解后合并 |
| Strip区域 | 以分界线为中心的带状区域，用于检查跨越分界线的点对 |
| 暴力法 | 检查所有可能的点对，取距离最小的 |

## 为什么重要

最近点对问题在计算机科学和实际应用中有重要地位：

1. **算法设计范例**：展示了分治法在几何问题中的巧妙应用
2. **理论基础**：是理解计算几何算法的入门问题
3. **实际应用广泛**：碰撞检测、聚类分析、图形学等领域都需要高效求解最近点对
4. **面试高频题**：考察分治思想和复杂度分析能力

## 核心原理

### 1. 暴力解法 (Brute Force)

最直接的方法：检查每一对点，记录最小距离。

```typescript
function closestPairBruteForce(points: Point[]): number {
  let minDist = Infinity
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = distance(points[i], points[j])
      minDist = Math.min(minDist, dist)
    }
  }
  return minDist
}
```

**时间复杂度**：O(n²)
**适用场景**：n较小时（如n < 10）

### 2. 分治法 (Divide and Conquer)

分治法的核心思想：

**第一步：预处理**
- 将所有点按x坐标排序

**第二步：递归分解**
- 将点集从中间分为左右两半
- 分别递归求解左右两半的最近点对距离
- 取两者的较小值d

**第三步：合并（关键步骤）**
- 在分界线两侧各取宽度为d的区域（strip区域）
- 按y坐标排序strip中的点
- 对每个点，只需检查其后最多7个点

```typescript
interface Point {
  x: number
  y: number
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function closestPair(points: Point[]): number {
  // 预处理：按x排序
  const sorted = [...points].sort((a, b) => a.x - b.x)
  return closestPairRec(sorted)
}

function closestPairRec(points: Point[]): number {
  if (points.length <= 3) {
    // 基础情况：使用暴力法
    return bruteForce(points)
  }

  const mid = Math.floor(points.length / 2)
  const midX = points[mid].x

  // 递归求解左右两半
  const dl = closestPairRec(points.slice(0, mid))
  const dr = closestPairRec(points.slice(mid))
  const d = Math.min(dl, dr)

  // 合并：检查strip区域
  const strip = points.filter(p => Math.abs(p.x - midX) < d)
  strip.sort((a, b) => a.y - b.y) // 按y排序

  // 检查strip中的点对
  for (let i = 0; i < strip.length; i++) {
    for (let j = i + 1; j < strip.length && (strip[j].y - strip[i].y) < d; j++) {
      const dist = distance(strip[i], strip[j])
      d = Math.min(d, dist)
    }
  }

  return d
}
```

### 3. 为什么strip检查只需要O(n)？

这是算法中最巧妙的部分。

**关键观察**：在strip中，如果按y坐标排序，每个点只需要与其后的最多7个点比较。

**证明思路**：
- 假设最近点对距离为d
- 在中线两侧各取一个点p和q，它们的距离小于d
- 以p为中心、d为半径的区域内，不可能有两个点的距离都小于d
- 在一个d×2d的矩形内，最多只能放置8个点
- 因此每个点只需检查其后的7个点

```
  |<-- d -->|<-- d -->|
  +---------+---------+
  |  ·   ·  |  ·   ·  |  d
  +---------+---------+
  |  ·   ·  |  ·   ·  |  d
  +---------+---------+
```

### 时间复杂度总结

| 算法 | 时间复杂度 | 空间复杂度 | 适用场景 |
|------|------------|------------|----------|
| 暴力法 | O(n²) | O(1) | n较小时 |
| 分治法 | O(n log n) | O(n) | 通用 |

## 可视化说明

在可视化界面中，最近点对算法的执行过程如下：

1. **初始状态**：显示平面上的所有点
2. **分治过程**：递归地将点集分为左右两半，用竖线标记分界
3. **当前最近距离**：用圆圈或线条高亮显示当前找到的最近点对
4. **Strip区域**：用半透明矩形标记需要检查的strip区域
5. **最终结果**：高亮显示最近点对及其距离

通过可视化可以观察到：
- 递归分解如何将大问题变为小问题
- strip区域如何缩小搜索范围
- 为什么只需检查常数个邻居

## 常见错误

### 1. 忘记按x排序

```typescript
// 错误：直接对原始数组递归
function closestPair(points: Point[]): number {
  return closestPairRec(points) // points没有按x排序，结果错误
}

// 正确：先按x排序
function closestPair(points: Point[]): number {
  const sorted = [...points].sort((a, b) => a.x - b.x)
  return closestPairRec(sorted)
}
```

### 2. strip检查时没有限制搜索范围

```typescript
// 错误：检查strip中所有点对
for (let i = 0; i < strip.length; i++) {
  for (let j = i + 1; j < strip.length; j++) { // 没有y坐标限制
    // ...
  }
}

// 正确：利用y坐标差限制
for (let i = 0; i < strip.length; i++) {
  for (let j = i + 1; j < strip.length && (strip[j].y - strip[i].y) < d; j++) {
    // ...
  }
}
```

### 3. 基础情况处理不当

```typescript
// 错误：n=2时没有正确处理
if (points.length <= 1) return Infinity // n=2时会漏掉

// 正确：n<=3时使用暴力法
if (points.length <= 3) return bruteForce(points)
```

### 4. 距离计算时忘记开方

```typescript
// 问题：比较距离平方和实际距离不一致
const distSq = (a.x - b.x) ** 2 + (a.y - b.y) ** 2
// 如果全程使用距离平方，需要保持一致
// 建议：全程使用距离平方，避免开方的性能损耗
```

## 实际应用

### 1. 碰撞检测

游戏和物理引擎中，需要快速判断两个物体是否可能发生碰撞。最近点对算法可以高效找出最接近的物体对，用于：
- 粒子系统碰撞检测
- 机器人路径规划中的障碍物检测

### 2. 聚类分析

在数据挖掘中，最近点对是层次聚类的基础：
- 找到距离最近的两个点/簇
- 合并为一个簇
- 重复直到满足终止条件

### 3. 计算机图形学

- 网格简化：合并距离最近的顶点
- 纹理映射：寻找最近的纹理坐标
- 点云处理：识别密集区域

### 4. 地理信息系统 (GIS)

- 找出地图上距离最近的两个兴趣点
- 优化物流配送路线
- 城市规划中的设施选址

## 总结

最近点对问题是分治法的经典应用：

**核心思想**：
- 将点集按x坐标分为左右两半
- 递归求解左右两半的最近点对
- 关键在于合并步骤：利用strip区域和几何性质将检查范围限制在常数个点

**关键技巧**：
- 按x坐标排序用于分治
- 按y坐标排序用于strip检查的剪枝
- 利用「d×2d矩形内最多8个点」的几何性质

**复杂度对比**：

| 方法 | 时间复杂度 | 说明 |
|------|------------|------|
| 暴力法 | O(n²) | 简单但低效 |
| 分治法 | O(n log n) | 高效，适合大规模数据 |

**适用场景**：当n较大时（如n > 100），分治法的优势明显。对于小规模数据，暴力法的常数因子更小，可能更快。

理解最近点对问题的分治解法，有助于掌握更复杂的计算几何算法，如凸包、Voronoi图等。
