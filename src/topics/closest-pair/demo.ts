interface Point {
  x: number
  y: number
}

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function bruteForce(points: Point[]): { dist: number; p1: Point; p2: Point } {
  let minDist = Infinity
  let p1 = points[0]
  let p2 = points[1]
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = dist(points[i], points[j])
      if (d < minDist) {
        minDist = d
        p1 = points[i]
        p2 = points[j]
      }
    }
  }
  return { dist: minDist, p1, p2 }
}

function closestPairRec(pointsByX: Point[], pointsByY: Point[]): { dist: number; p1: Point; p2: Point } {
  if (pointsByX.length <= 3) {
    return bruteForce(pointsByX)
  }

  const mid = Math.floor(pointsByX.length / 2)
  const midX = pointsByX[mid].x

  const leftByX = pointsByX.slice(0, mid)
  const rightByX = pointsByX.slice(mid)

  const leftByY = pointsByY.filter(p => p.x <= midX)
  const rightByY = pointsByY.filter(p => p.x > midX)

  const leftResult = closestPairRec(leftByX, leftByY)
  const rightResult = closestPairRec(rightByX, rightByY)

  let best = leftResult.dist < rightResult.dist ? leftResult : rightResult
  const d = best.dist

  const strip = pointsByY.filter(p => Math.abs(p.x - midX) < d)

  for (let i = 0; i < strip.length; i++) {
    for (let j = i + 1; j < strip.length && (strip[j].y - strip[i].y) < d; j++) {
      const dd = dist(strip[i], strip[j])
      if (dd < best.dist) {
        best = { dist: dd, p1: strip[i], p2: strip[j] }
      }
    }
  }

  return best
}

export default function closestPairDemo(): string {
  const output: string[] = []

  output.push('=== 最近点对演示 ===\n')

  const points: Point[] = [
    { x: 2, y: 3 },
    { x: 12, y: 30 },
    { x: 40, y: 50 },
    { x: 5, y: 1 },
    { x: 12, y: 10 },
    { x: 3, y: 4 },
    { x: 7, y: 8 },
    { x: 50, y: 45 },
  ]

  output.push('点集:')
  points.forEach((p, i) => {
    output.push(`  P${i}: (${p.x}, ${p.y})`)
  })
  output.push('')

  // 暴力法
  output.push('1. 暴力法 (O(n²)):')
  const bruteResult = bruteForce(points)
  output.push(`   最近点对: (${bruteResult.p1.x}, ${bruteResult.p1.y}) 和 (${bruteResult.p2.x}, ${bruteResult.p2.y})`)
  output.push(`   距离: ${bruteResult.dist.toFixed(4)}\n`)

  // 分治法
  output.push('2. 分治法 (O(n log n)):')
  const sortedByX = [...points].sort((a, b) => a.x - b.x)
  const sortedByY = [...points].sort((a, b) => a.y - b.y)
  const dcResult = closestPairRec(sortedByX, sortedByY)
  output.push(`   最近点对: (${dcResult.p1.x}, ${dcResult.p1.y}) 和 (${dcResult.p2.x}, ${dcResult.p2.y})`)
  output.push(`   距离: ${dcResult.dist.toFixed(4)}\n`)

  // 验证结果一致
  output.push('3. 验证:')
  const match = Math.abs(bruteResult.dist - dcResult.dist) < 1e-9
  output.push(`   暴力法和分治法结果一致: ${match ? '是' : '否'}\n`)

  // 步骤详解
  output.push('4. 分治步骤详解:')
  output.push(`   步骤1: 按x坐标排序点集`)
  output.push(`   步骤2: 从中间分为左右两半`)
  output.push(`   步骤3: 递归求解左半部分最近点对`)
  output.push(`   步骤4: 递归求解右半部分最近点对`)
  output.push(`   步骤5: 取较小值 d = ${dcResult.dist.toFixed(4)}`)
  output.push(`   步骤6: 在strip区域（宽度2d）中检查跨越分界线的点对`)
  output.push(`   步骤7: 返回最终结果\n`)

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
