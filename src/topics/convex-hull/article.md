# 凸包 (Convex Hull)

## 概念解释

**凸包**是计算几何中最基本的概念之一。给定平面上的 n 个点，凸包是包含所有这些点的**最小凸多边形**。

可以想象：在平面上钉了很多钉子，然后用一根橡皮筋把所有钉子围起来，松手后橡皮筋形成的形状就是凸包。

### 基本术语

| 术语 | 说明 |
|------|------|
| 凸集 (Convex Set) | 集合中任意两点的连线上的所有点都属于该集合 |
| 凸多边形 (Convex Polygon) | 所有内角都小于 180 度的多边形 |
| 凸包 (Convex Hull) | 包含点集的最小凸集 |
| 叉积 (Cross Product) | 判断转向方向的核心工具 |
| 对踵点 (Antipodal Points) | 凸包上具有平行切线的点对 |

### 什么是凸多边形？

一个简单多边形是凸多边形，当且仅当：
- 它的所有内角均小于 180 度
- 从多边形内部任意一点到另一点的连线完全在多边形内部

```
凸多边形:          非凸多边形:
  *                  *
 / \                / \
*   *              *   *--*
 \ /                  \ /
  *                    *
```

## 为什么重要

凸包在计算机科学和实际应用中极为重要：

1. **基础性**：许多计算几何问题都可以归结为凸包问题
2. **模式识别**：在计算机视觉中用于物体形状描述
3. **碰撞检测**：游戏和物理引擎中判断物体是否碰撞
4. **路径规划**：机器人导航中计算安全区域
5. **统计分析**：在数据分析中确定数据的边界

## 核心原理

### 叉积判定

叉积是凸包算法的核心工具，用于判断三个点的转向方向：

给定三个点 O、A、B，叉积定义为：

```
cross(O, A, B) = (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x)
```

叉积的符号表示转向方向：
- **cross > 0**：O -> A -> B 为**左转**（逆时针）
- **cross < 0**：O -> A -> B 为**右转**（顺时针）
- **cross = 0**：三点**共线**

```typescript
function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}
```

### Graham Scan 算法

Graham Scan 是最经典的凸包算法之一，时间复杂度为 O(n log n)。

**算法步骤：**

1. **选择基准点**：找到 y 坐标最小的点（若有多个取 x 最小的），记为 P0
2. **极角排序**：以 P0 为原点，按其余点的极角从小到大排序
3. **扫描构建**：维护一个栈，依次处理每个点：
   - 若栈顶两个点与当前点构成「左转」，将当前点入栈
   - 否则弹出栈顶，重复检查直到满足「左转」条件

```typescript
function grahamScan(points: Point[]): Point[] {
  if (points.length <= 1) return [...points]

  // 1. 找基准点
  const sorted = [...points].sort((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x
  )
  const base = sorted[0]

  // 2. 极角排序
  const rest = sorted.slice(1).sort((a, b) => {
    const c = cross(base, a, b)
    if (c !== 0) return c > 0 ? -1 : 1
    return dist2(base, a) - dist2(base, b)
  })

  // 3. 扫描
  const hull: Point[] = []
  for (const p of rest) {
    while (hull.length >= 2 &&
           cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) {
      hull.pop()
    }
    hull.push(p)
  }

  return [base, ...hull]
}
```

**图解过程：**

```
步骤1: 找到最低点 P0
  .  .  .
  .  .  .
  P0 .

步骤2: 按极角排序后依次处理
  P4 .
P3  .  P5
  P2 .
P1  .
  P0 .

步骤3: 栈维护凸壳
处理 P1: 栈 = [P0, P1]
处理 P2: P0->P1->P2 左转, 栈 = [P0, P1, P2]
处理 P3: P1->P2->P3 右转, 弹出P2; P0->P1->P3 左转, 栈 = [P0, P1, P3]
...
```

### Andrew 单调链算法

Andrew 单调链是 Graham Scan 的改进版本，避免了极角计算的浮点误差。

**算法步骤：**

1. **排序**：按 x 坐标排序（x 相同时按 y 排序）
2. **构建下凸壳**：从左到右扫描，维护栈保证「左转」
3. **构建上凸壳**：从右到左扫描，同样维护栈保证「左转」
4. **合并**：将上下凸壳合并得到完整凸包

```typescript
function andrewMonotoneChain(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) =>
    a.x !== b.x ? a.x - b.x : a.y - b.y
  )
  const n = sorted.length
  if (n <= 1) return sorted

  const hull: Point[] = []

  // 下凸壳
  for (const p of sorted) {
    while (hull.length >= 2 &&
           cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) {
      hull.pop()
    }
    hull.push(p)
  }

  // 上凸壳
  const lowerSize = hull.length
  for (let i = n - 2; i >= 0; i--) {
    while (hull.length > lowerSize &&
           cross(hull[hull.length - 2], hull[hull.length - 1], sorted[i]) <= 0) {
      hull.pop()
    }
    hull.push(sorted[i])
  }

  // 移除重复的首尾点
  hull.pop()
  return hull
}
```

**Andrew 单调链 vs Graham Scan：**

| 特性 | Graham Scan | Andrew 单调链 |
|------|-------------|---------------|
| 排序方式 | 极角排序 | x 坐标排序 |
| 浮点运算 | 需要 atan2 | 纯叉积比较 |
| 实现难度 | 稍复杂 | 简洁 |
| 数值稳定性 | 可能有误差 | 更稳定 |
| 时间复杂度 | O(n log n) | O(n log n) |

### 旋转卡壳求凸包直径

**凸包直径**是凸包上距离最远的两个点之间的距离。

旋转卡壳算法利用凸包的**对踵点**性质，在 O(n) 时间内求出直径。

**核心思想：**

想象用两条平行线从上下「夹住」凸包，然后旋转这对平行线。在旋转过程中，与两条线接触的点称为对踵点。所有最远点对一定是对踵点对。

```typescript
function convexHullDiameter(hull: Point[]): number {
  const n = hull.length
  if (n < 2) return 0

  let maxDist = 0
  let j = 1

  for (let i = 0; i < n; i++) {
    const nextI = (i + 1) % n
    // 旋转卡壳：找到对踵点
    while (true) {
      const nextJ = (j + 1) % n
      const currentArea = Math.abs(cross(hull[i], hull[nextI], hull[j]))
      const nextArea = Math.abs(cross(hull[i], hull[nextI], hull[nextJ]))
      if (nextArea > currentArea) {
        j = nextJ
      } else {
        break
      }
    }
    const d = dist2(hull[i], hull[j])
    if (d > maxDist) maxDist = d
  }

  return Math.sqrt(maxDist)
}
```

## 可视化说明

在可视化界面中，凸包算法的执行过程可以直观展示：

- **点集**：散落在平面上的点
- **当前处理的点**：高亮显示正在判断的点
- **凸壳边界**：已确认属于凸包的边
- **栈内容**：当前维护的候选凸包顶点
- **叉积判定**：展示三点转向方向的动画

通过逐步执行，可以观察：
- 点如何按极角排序
- 哪些点被保留在凸包上
- 哪些点因为「右转」而被弹出栈
- 凸壳如何逐步「生长」

## 常见错误

### 1. 叉积符号搞反

```typescript
// 错误：将左转判断为右转
if (cross(o, a, b) < 0) { // 应该是 > 0
  // 以为是左转，其实是右转
}
```

### 2. 共线点处理不当

```typescript
// 错误：包含共线的内部点
while (cross(...) < 0) { // 用 < 0，保留了共线点
  hull.pop()
}

// 正确：严格判断转向，排除共线
while (cross(...) <= 0) { // 用 <= 0，排除共线点
  hull.pop()
}
```

### 3. 基准点选择错误

```typescript
// 错误：没有正确处理多个最低点
const base = points[0] // 可能不是最低点

// 正确：找到 y 最小、y 相同时 x 最小的点
const base = points.reduce((min, p) =>
  p.y < min.y || (p.y === min.y && p.x < min.x) ? p : min
)
```

### 4. 忘记处理边界情况

```typescript
// 错误：没有处理少于 3 个点的情况
function convexHull(points: Point[]): Point[] {
  return grahamScan(points) // 1 个或 2 个点时行为未定义
}

// 正确：特判
function convexHull(points: Point[]): Point[] {
  if (points.length <= 2) return [...points]
  return grahamScan(points)
}
```

## 实际应用

### 1. 碰撞检测

在游戏引擎中，使用凸包近似物体形状来检测碰撞。凸多边形的碰撞检测比凹多边形简单得多（分离轴定理 SAT）。

### 2. 光线追踪

在光线追踪渲染中，用凸包包围物体作为粗略的包围体，快速判断光线是否可能与物体相交。

### 3. 聚类分析

在数据挖掘中，凸包可以帮助确定数据簇的边界，用于异常检测和离群点识别。

### 4. 地理信息系统 (GIS)

在 GIS 中，凸包用于：
- 计算区域的凸边界
- 简化复杂的地理形状
- 计算最小包围区域

### 5. 图像处理

在计算机视觉中，凸包用于：
- 手势识别：计算手部轮廓的凸包和凸缺陷
- 形状匹配：比较两个物体的凸包相似度
- 目标检测：确定目标物体的包围区域

## 总结

凸包是计算几何的基石问题：

**核心要点**：
- 凸包是包含点集的最小凸多边形
- 叉积是判断转向方向的核心工具
- Graham Scan 和 Andrew 单调链都是 O(n log n) 的经典算法
- 旋转卡壳可以在 O(n) 时间内求凸包直径

**算法选择建议**：
- 需要简洁稳定的实现：使用 Andrew 单调链
- 需要与极角相关的操作：使用 Graham Scan
- 需要求最远点对：使用旋转卡壳

**时间复杂度总结**：

| 操作 | 时间复杂度 |
|------|------------|
| 构建凸包 | O(n log n) |
| 求凸包直径 | O(n)（旋转卡壳） |
| 求凸包面积 | O(n)（Shoelace 公式） |
| 判断点在凸包内 | O(log n)（二分） |

理解凸包是深入学习计算几何的第一步，后续的 Delaunay 三角剖分、Voronoi 图、半平面交等问题都建立在凸包的基础之上。
