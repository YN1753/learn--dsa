# 线段交 (Line Intersection)

## 概念解释

线段交是**计算几何**中的基础问题：给定平面上两条线段，判断它们是否相交，以及求出交点坐标。

这个问题看似简单，但在计算机中需要用严格的数学方法来判断，不能依赖「肉眼观察」。核心工具是**叉积（Cross Product）**，它能告诉我们点在线段的哪一侧。

### 基本术语

| 术语 | 说明 |
|------|------|
| 线段 (Segment) | 两个端点之间的有限直线段 |
| 直线 (Line) | 无限延伸的线 |
| 叉积 (Cross Product) | 两个向量的外积，用于判断方向 |
| 跨立实验 (Straddle Test) | 判断两点是否在直线两侧的方法 |

## 为什么重要

线段交判定在实际中有广泛应用：

1. **碰撞检测**：游戏和物理引擎中判断物体是否碰撞
2. **地图计算**：判断道路是否交叉、区域边界是否重叠
3. **图形学**：多边形裁剪、布尔运算的基础步骤
4. **机器人路径规划**：判断路径是否穿过障碍物

## 核心原理

### 1. 叉积方向测试

叉积是线段交判定的基础工具。给定原点 O 和两个向量 OA、OB：

```
cross(O, A, B) = (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x)
```

叉积的符号告诉我们方向：

| cross 值 | 含义 |
|----------|------|
| > 0 | B 在 OA 的逆时针方向（左侧） |
| < 0 | B 在 OA 的顺时针方向（右侧） |
| = 0 | O、A、B 三点共线 |

```typescript
function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}
```

### 2. 跨立实验（Straddle Test）

判断线段 AB 和 CD 是否相交，核心思想是：

**如果两条线段相交，那么每条线段的两个端点必须分别在另一条线段所在直线的两侧。**

具体步骤：

1. 计算 C、D 相对于 AB 的叉积：`d1 = cross(A, B, C)`，`d2 = cross(A, B, D)`
2. 计算 A、B 相对于 CD 的叉积：`d3 = cross(C, D, A)`，`d4 = cross(C, D, B)`
3. 若 `d1 * d2 < 0` 且 `d3 * d4 < 0`，则两线段相交

```typescript
function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  const d1 = cross(a, b, c)
  const d2 = cross(a, b, d)
  const d3 = cross(c, d, a)
  const d4 = cross(c, d, b)

  // 严格相交：两次跨立实验都通过
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true
  }

  // 处理端点共线的特殊情况
  if (Math.abs(d1) < 1e-9 && onSegment(c, a, b)) return true
  if (Math.abs(d2) < 1e-9 && onSegment(d, a, b)) return true
  if (Math.abs(d3) < 1e-9 && onSegment(a, c, d)) return true
  if (Math.abs(d4) < 1e-9 && onSegment(b, c, d)) return true

  return false
}
```

### 3. 点在线段上的判定

当叉积为 0（三点共线）时，需要判断点是否在线段范围内：

```typescript
function onSegment(p: Point, a: Point, b: Point): boolean {
  const ab = { x: b.x - a.x, y: b.y - a.y }
  const ap = { x: p.x - a.x, y: p.y - a.y }
  const cp = cross(a, b, p)
  if (Math.abs(cp) > 1e-9) return false
  // 检查投影是否在 [0, |AB|^2] 范围内
  const dot_ap_ab = ap.x * ab.x + ap.y * ab.y
  const dot_ab_ab = ab.x * ab.x + ab.y * ab.y
  return dot_ap_ab >= 0 && dot_ap_ab <= dot_ab_ab
}
```

### 4. 直线交点计算

如果两条直线不平行，可以用参数方程求交点：

```
L1: P = A + t * (B - A)
L2: Q = C + u * (D - C)
```

联立方程求解 t：

```typescript
function lineIntersection(a: Point, b: Point, c: Point, d: Point): Point | null {
  const ab = { x: b.x - a.x, y: b.y - a.y }
  const cd = { x: d.x - c.x, y: d.y - c.y }
  const denom = ab.x * cd.y - ab.y * cd.x
  if (Math.abs(denom) < 1e-9) return null  // 平行，无交点
  const ac = { x: c.x - a.x, y: c.y - a.y }
  const t = (ac.x * cd.y - ac.y * cd.x) / denom
  return { x: a.x + t * ab.x, y: a.y + t * ab.y }
}
```

### 5. 扫描线算法求所有交点

当需要求 n 条线段的所有交点时，暴力枚举需要 O(n²)。**Bentley-Ottmann 扫描线算法**可以更高效地处理：

**核心思想**：
- 用一条垂直线从左向右扫描
- 维护一个**事件队列**（按 x 坐标排序）
- 维护一个**状态结构**（当前与扫描线相交的线段，按 y 排序）

**事件类型**：
1. **左端点事件**：线段开始，插入状态结构，检查与相邻线段的交点
2. **右端点事件**：线段结束，从状态结构删除，检查新相邻线段的交点
3. **交点事件**：两条线段交叉，交换它们在状态结构中的位置

**时间复杂度**：O((n + k) log n)，其中 k 是交点数量。

## 可视化说明

在可视化界面中：

- **线段**用不同颜色的线段表示
- **交点**用红色圆点标记
- **叉积方向**用箭头和颜色指示
- 可以拖动端点实时观察交点变化

通过可视化可以直观理解：
- 叉积如何判断方向
- 跨立实验的几何意义
- 端点共线的特殊情况

## 常见错误

### 1. 忽略端点共线

```typescript
// 错误：只做跨立实验，忽略端点共线
function badIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  return cross(a, b, c) * cross(a, b, d) < 0 &&
         cross(c, d, a) * cross(c, d, b) < 0
}
// 当端点恰好在另一条线段上时会漏判
```

### 2. 浮点精度问题

```typescript
// 错误：直接比较浮点数
if (cross(a, b, c) === 0) { ... }

// 正确：使用 epsilon
if (Math.abs(cross(a, b, c)) < 1e-9) { ... }
```

### 3. 混淆线段与直线

```typescript
// 错误：用直线交点公式判断线段相交
const pt = lineIntersection(a, b, c, d)
if (pt !== null) return true  // 交点可能不在线段范围内！
```

### 4. 叉积公式记错符号

```
正确：(A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x)
错误：(A.x - O.x) * (B.y - O.y) + (A.y - O.y) * (B.x - O.x)  // 加号变减号
```

## 实际应用

### 1. 游戏碰撞检测

在游戏中判断子弹是否击中敌人，本质是判断子弹轨迹线段与敌人边界线段是否相交。

### 2. 多边形布尔运算

计算两个多边形的交集、并集、差集，第一步就是找出所有边的交点。

### 3. 地图渲染

判断河流是否穿过道路、行政区边界是否重叠，都需要线段交判定。

### 4. 机器人路径规划

判断机器人规划路径是否穿过障碍物边界，避免碰撞。

## 总结

线段交判定是计算几何的基础问题：

**核心方法**：
- **叉积**判断方向，是所有判定的基础
- **跨立实验**判断线段是否相交，只需 O(1) 时间
- **扫描线算法**批量求交点，时间复杂度 O((n+k) log n)

**关键细节**：
- 不要忽略端点共线的特殊情况
- 浮点数比较要用 epsilon
- 区分线段相交和直线相交

**适用场景**：
- 碰撞检测、地图计算、图形学
- 任何需要判断几何对象位置关系的问题

掌握叉积和跨立实验，就掌握了计算几何最重要的基础工具。
