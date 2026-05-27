interface Point {
  x: number
  y: number
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

function dist2(a: Point, b: Point): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2
}

function grahamScan(points: Point[]): Point[] {
  if (points.length <= 1) return [...points]

  // 找到最下方（y 最小，相同则 x 最小）的点作为基准
  const sorted = [...points].sort((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x
  )
  const base = sorted[0]

  // 按极角排序
  const rest = sorted.slice(1).sort((a, b) => {
    const c = cross(base, a, b)
    if (c !== 0) return c > 0 ? -1 : 1
    return dist2(base, a) - dist2(base, b)
  })

  // Graham Scan
  const hull: Point[] = []
  for (const p of rest) {
    while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) {
      hull.pop()
    }
    hull.push(p)
  }

  return [base, ...hull]
}

function convexHullDiameter(hull: Point[]): { p1: Point; p2: Point; dist: number } {
  if (hull.length < 2) return { p1: hull[0], p2: hull[0], dist: 0 }

  let maxDist = 0
  let bestP1 = hull[0]
  let bestP2 = hull[1]
  const n = hull.length
  let j = 1

  for (let i = 0; i < n; i++) {
    const nextI = (i + 1) % n
    // 旋转卡壳：j 在对踵位置附近
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
    if (d > maxDist) {
      maxDist = d
      bestP1 = hull[i]
      bestP2 = hull[j]
    }
  }

  return { p1: bestP1, p2: bestP2, dist: Math.sqrt(maxDist) }
}

export default function convexHullDemo(): string {
  const output: string[] = []

  output.push('=== 凸包演示 ===\n')

  // 示例点集
  const points: Point[] = [
    { x: 0, y: 3 },
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 4, y: 4 },
    { x: 0, y: 0 },
    { x: 1, y: 2 },
    { x: 3, y: 1 },
    { x: 3, y: 3 },
  ]

  output.push('输入点集:')
  for (const p of points) {
    output.push(`  (${p.x}, ${p.y})`)
  }
  output.push('')

  // Graham Scan
  output.push('--- Graham Scan ---\n')
  const hull = grahamScan(points)
  output.push(`凸包顶点 (共 ${hull.length} 个):`)
  for (const p of hull) {
    output.push(`  (${p.x}, ${p.y})`)
  }
  output.push('')

  // 计算凸包面积 (Shoelace 公式)
  let area = 0
  for (let i = 0; i < hull.length; i++) {
    const j = (i + 1) % hull.length
    area += hull[i].x * hull[j].y
    area -= hull[j].x * hull[i].y
  }
  area = Math.abs(area) / 2
  output.push(`凸包面积 (Shoelace 公式): ${area}`)
  output.push('')

  // 凸包周长
  let perimeter = 0
  for (let i = 0; i < hull.length; i++) {
    const j = (i + 1) % hull.length
    perimeter += Math.sqrt(dist2(hull[i], hull[j]))
  }
  output.push(`凸包周长: ${perimeter.toFixed(4)}`)
  output.push('')

  // 旋转卡壳求直径
  output.push('--- 旋转卡壳求凸包直径 ---\n')
  const { p1, p2, dist } = convexHullDiameter(hull)
  output.push(`最远点对: (${p1.x}, ${p1.y}) 和 (${p2.x}, ${p2.y})`)
  output.push(`直径: ${dist.toFixed(4)}`)
  output.push('')

  // 叉积示例
  output.push('--- 叉积判定示例 ---\n')
  const o: Point = { x: 0, y: 0 }
  const a: Point = { x: 1, y: 0 }
  const b1: Point = { x: 0, y: 1 }
  const b2: Point = { x: 0, y: -1 }
  const b3: Point = { x: 2, y: 0 }

  output.push(`叉积 (0,0)-(1,0)-(0,1) = ${cross(o, a, b1)}  (正 = 左转/逆时针)`)
  output.push(`叉积 (0,0)-(1,0)-(0,-1) = ${cross(o, a, b2)}  (负 = 右转/顺时针)`)
  output.push(`叉积 (0,0)-(1,0)-(2,0) = ${cross(o, a, b3)}  (零 = 共线)`)
  output.push('')

  // 边界情况
  output.push('--- 边界情况 ---\n')
  output.push('所有点共线:')
  const collinear: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }]
  const collinearHull = grahamScan(collinear)
  output.push(`  点数: ${collinear.length}, 凸包顶点数: ${collinearHull.length}`)
  for (const p of collinearHull) {
    output.push(`  (${p.x}, ${p.y})`)
  }
  output.push('')

  output.push('三点构成三角形:')
  const triangle: Point[] = [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 3 }]
  const triangleHull = grahamScan(triangle)
  output.push(`  点数: ${triangle.length}, 凸包顶点数: ${triangleHull.length}`)
  for (const p of triangleHull) {
    output.push(`  (${p.x}, ${p.y})`)
  }

  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
