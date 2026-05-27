interface Rectangle {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface Event {
  x: number
  y1: number
  y2: number
  type: 'enter' | 'leave'
}

interface Segment {
  y1: number
  y2: number
  count: number
}

function addSegment(segments: Segment[], y1: number, y2: number): void {
  for (const seg of segments) {
    if (seg.y1 === y1 && seg.y2 === y2) {
      seg.count++
      return
    }
  }
  segments.push({ y1, y2, count: 1 })
}

function removeSegment(segments: Segment[], y1: number, y2: number): void {
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].y1 === y1 && segments[i].y2 === y2) {
      segments[i].count--
      if (segments[i].count <= 0) {
        segments.splice(i, 1)
      }
      return
    }
  }
}

function computeCoverage(segments: Segment[]): number {
  // Simple merge of overlapping intervals
  if (segments.length === 0) return 0

  const intervals: { y1: number; y2: number }[] = []
  for (const seg of segments) {
    if (seg.count > 0) {
      intervals.push({ y1: seg.y1, y2: seg.y2 })
    }
  }

  if (intervals.length === 0) return 0

  intervals.sort((a, b) => a.y1 - b.y1)

  let total = 0
  let current = intervals[0]

  for (let i = 1; i < intervals.length; i++) {
    if (intervals[i].y1 <= current.y2) {
      current.y2 = Math.max(current.y2, intervals[i].y2)
    } else {
      total += current.y2 - current.y1
      current = intervals[i]
    }
  }
  total += current.y2 - current.y1

  return total
}

function lineSweepAreaUnion(rects: Rectangle[]): string {
  const output: string[] = []

  output.push('=== 扫描线求矩形面积并演示 ===\n')

  output.push('输入矩形:')
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i]
    output.push(`  矩形${i + 1}: (${r.x1}, ${r.y1}) - (${r.x2}, ${r.y2}), 面积 = ${(r.x2 - r.x1) * (r.y2 - r.y1)}`)
  }
  output.push('')

  // Generate events
  const events: Event[] = []
  for (const r of rects) {
    events.push({ x: r.x1, y1: r.y1, y2: r.y2, type: 'enter' })
    events.push({ x: r.x2, y1: r.y1, y2: r.y2, type: 'leave' })
  }

  // Sort events by x
  events.sort((a, b) => a.x - b.x)

  output.push('事件列表 (按 x 坐标排序):')
  for (const e of events) {
    output.push(`  x=${e.x}: ${e.type === 'enter' ? '进入' : '离开'} 区间 [${e.y1}, ${e.y2}]`)
  }
  output.push('')

  // Sweep
  const segments: Segment[] = []
  let totalArea = 0
  let prevX = events[0].x

  output.push('--- 扫描过程 ---\n')

  // Group events by x
  let i = 0
  while (i < events.length) {
    const currentX = events[i].x

    // Compute area contribution from prevX to currentX
    if (i > 0 || currentX !== prevX) {
      const coverage = computeCoverage(segments)
      const dx = currentX - prevX
      const contribution = dx * coverage
      if (dx > 0) {
        output.push(`  区间 [${prevX}, ${currentX}]: 活跃覆盖长度 = ${coverage}, 宽度 = ${dx}, 面积贡献 = ${contribution}`)
        totalArea += contribution
      }
    }

    // Process all events at this x
    while (i < events.length && events[i].x === currentX) {
      const e = events[i]
      if (e.type === 'enter') {
        addSegment(segments, e.y1, e.y2)
        output.push(`  x=${e.x}: 加入区间 [${e.y1}, ${e.y2}] (进入)`)
      } else {
        removeSegment(segments, e.y1, e.y2)
        output.push(`  x=${e.x}: 移除区间 [${e.y1}, ${e.y2}] (离开)`)
      }
      i++
    }

    prevX = currentX
  }

  output.push('')
  output.push(`总面积并 = ${totalArea}`)
  output.push('')

  // Verification with naive method
  output.push('--- 验证（逐像素法）---\n')
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const r of rects) {
    minX = Math.min(minX, r.x1)
    maxX = Math.max(maxX, r.x2)
    minY = Math.min(minY, r.y1)
    maxY = Math.max(maxY, r.y2)
  }

  let naiveCount = 0
  for (let x = minX; x < maxX; x++) {
    for (let y = minY; y < maxY; y++) {
      for (const r of rects) {
        if (x >= r.x1 && x < r.x2 && y >= r.y1 && y < r.y2) {
          naiveCount++
          break
        }
      }
    }
  }
  output.push(`逐像素法结果: ${naiveCount}`)
  output.push(`扫描线结果:   ${totalArea}`)
  output.push(`结果一致: ${naiveCount === totalArea ? '是' : '否'}`)
  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}

export default function lineSweepDemo(): string {
  const rects: Rectangle[] = [
    { x1: 0, y1: 0, x2: 4, y2: 4 },
    { x1: 2, y1: 2, x2: 6, y2: 6 },
    { x1: 5, y1: 1, x2: 8, y2: 3 },
  ]

  return lineSweepAreaUnion(rects)
}
