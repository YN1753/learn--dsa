interface Point {
  x: number
  y: number
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y
}

function sub(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y }
}

function onSegment(p: Point, a: Point, b: Point): boolean {
  const ab = sub(b, a)
  const ap = sub(p, a)
  const cp = cross(a, b, p)
  if (Math.abs(cp) > 1e-9) return false
  return dot(ap, ab) >= 0 && dot(ap, ab) <= dot(ab, ab)
}

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point): boolean {
  const d1 = cross(a, b, c)
  const d2 = cross(a, b, d)
  const d3 = cross(c, d, a)
  const d4 = cross(c, d, b)

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true
  }

  if (Math.abs(d1) < 1e-9 && onSegment(c, a, b)) return true
  if (Math.abs(d2) < 1e-9 && onSegment(d, a, b)) return true
  if (Math.abs(d3) < 1e-9 && onSegment(a, c, d)) return true
  if (Math.abs(d4) < 1e-9 && onSegment(b, c, d)) return true

  return false
}

function lineIntersection(a: Point, b: Point, c: Point, d: Point): Point | null {
  const ab = sub(b, a)
  const cd = sub(d, c)
  const denom = ab.x * cd.y - ab.y * cd.x
  if (Math.abs(denom) < 1e-9) return null
  const ac = sub(c, a)
  const t = (ac.x * cd.y - ac.y * cd.x) / denom
  return { x: a.x + t * ab.x, y: a.y + t * ab.y }
}

export default function lineIntersectionDemo(): string {
  const output: string[] = []

  output.push('=== 线段交演示 ===\n')

  // 演示 1: 叉积方向测试
  output.push('1. 叉积方向测试')
  const o: Point = { x: 0, y: 0 }
  const p1: Point = { x: 1, y: 0 }
  const p2: Point = { x: 0, y: 1 }
  const p3: Point = { x: -1, y: 0 }
  output.push(`   O=(0,0), A=(1,0), B=(0,1)`)
  output.push(`   cross(O,A,B) = ${cross(o, p1, p2)} > 0 => B 在 OA 左侧（逆时针）`)
  output.push(`   O=(0,0), A=(1,0), C=(-1,0)`)
  output.push(`   cross(O,A,C) = ${cross(o, p1, p3)} => C 在 OA 上（共线）`)
  output.push('')

  // 演示 2: 相交的线段
  output.push('2. 线段交判定 - 相交情况')
  const a: Point = { x: 0, y: 0 }
  const b: Point = { x: 4, y: 4 }
  const c: Point = { x: 0, y: 4 }
  const d: Point = { x: 4, y: 0 }
  output.push(`   线段 AB: (0,0)-(4,4)`)
  output.push(`   线段 CD: (0,4)-(4,0)`)
  const d1 = cross(a, b, c)
  const d2 = cross(a, b, d)
  const d3 = cross(c, d, a)
  const d4 = cross(c, d, b)
  output.push(`   cross(AB,C) = ${d1}, cross(AB,D) = ${d2}`)
  output.push(`   cross(CD,A) = ${d3}, cross(CD,B) = ${d4}`)
  output.push(`   结果: ${segmentsIntersect(a, b, c, d) ? '相交' : '不相交'}`)
  const pt = lineIntersection(a, b, c, d)
  if (pt) {
    output.push(`   交点: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`)
  }
  output.push('')

  // 演示 3: 不相交的线段
  output.push('3. 线段交判定 - 不相交情况')
  const e: Point = { x: 0, y: 0 }
  const f: Point = { x: 2, y: 2 }
  const g: Point = { x: 3, y: 0 }
  const h: Point = { x: 5, y: 2 }
  output.push(`   线段 EF: (0,0)-(2,2)`)
  output.push(`   线段 GH: (3,0)-(5,2)`)
  output.push(`   cross(EF,G) = ${cross(e, f, g)}, cross(EF,H) = ${cross(e, f, h)}`)
  output.push(`   结果: ${segmentsIntersect(e, f, g, h) ? '相交' : '不相交'}`)
  output.push('')

  // 演示 4: 端点共线
  output.push('4. 端点共线情况')
  const i: Point = { x: 0, y: 0 }
  const j: Point = { x: 4, y: 0 }
  const k: Point = { x: 2, y: 0 }
  const l: Point = { x: 6, y: 0 }
  output.push(`   线段 IJ: (0,0)-(4,0)`)
  output.push(`   线段 KL: (2,0)-(6,0)`)
  output.push(`   两线段共线且有重叠`)
  output.push(`   结果: ${segmentsIntersect(i, j, k, l) ? '相交' : '不相交'}`)
  output.push('')

  // 演示 5: 平行不相交
  output.push('5. 平行不相交情况')
  const m: Point = { x: 0, y: 0 }
  const n: Point = { x: 4, y: 0 }
  const p: Point = { x: 0, y: 2 }
  const q: Point = { x: 4, y: 2 }
  output.push(`   线段 MN: (0,0)-(4,0)`)
  output.push(`   线段 PQ: (0,2)-(4,2)`)
  output.push(`   两线段平行但不共线`)
  output.push(`   结果: ${segmentsIntersect(m, n, p, q) ? '相交' : '不相交'}`)
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
