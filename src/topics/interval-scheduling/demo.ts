interface Interval {
  id: number
  start: number
  end: number
}

export default function intervalSchedulingDemo(): string {
  const output: string[] = []

  output.push('=== 区间调度（活动选择）演示 ===\n')

  // 示例区间
  const intervals: Interval[] = [
    { id: 1, start: 1, end: 4 },
    { id: 2, start: 3, end: 5 },
    { id: 3, start: 0, end: 6 },
    { id: 4, start: 5, end: 7 },
    { id: 5, start: 3, end: 9 },
    { id: 6, start: 5, end: 9 },
    { id: 7, start: 6, end: 10 },
    { id: 8, start: 8, end: 11 },
    { id: 9, start: 8, end: 12 },
    { id: 10, start: 2, end: 14 },
    { id: 11, start: 12, end: 16 },
  ]

  output.push('原始区间列表：')
  for (const iv of intervals) {
    output.push(`  区间 ${iv.id}: [${iv.start}, ${iv.end}]`)
  }

  // 按结束时间排序
  const sorted = [...intervals].sort((a, b) => a.end - b.end)
  output.push('\n按结束时间排序后：')
  for (const iv of sorted) {
    output.push(`  区间 ${iv.id}: [${iv.start}, ${iv.end}] (结束时间=${iv.end})`)
  }

  // 贪心选择
  output.push('\n--- 贪心选择过程 ---\n')

  const selected: Interval[] = []
  let lastEnd = -Infinity
  let step = 1

  for (const iv of sorted) {
    if (iv.start >= lastEnd) {
      selected.push(iv)
      lastEnd = iv.end
      output.push(`步骤 ${step++}: 考虑区间 ${iv.id} [${iv.start}, ${iv.end}]`)
      output.push(`  开始时间 ${iv.start} >= 上一个结束时间 ${lastEnd === iv.end ? '无' : lastEnd - (iv.end - iv.start)}`)
      output.push(`  -> 选中！当前已选: [${selected.map(s => s.id).join(', ')}]`)
      output.push(`  -> 最后结束时间更新为 ${iv.end}\n`)
    } else {
      output.push(`步骤 ${step++}: 考虑区间 ${iv.id} [${iv.start}, ${iv.end}]`)
      output.push(`  开始时间 ${iv.start} < 上一个结束时间 ${lastEnd}`)
      output.push(`  -> 跳过（与已选区间重叠）\n`)
    }
  }

  output.push('--- 最终结果 ---')
  output.push(`选中 ${selected.length} 个不重叠区间：`)
  for (const iv of selected) {
    output.push(`  区间 ${iv.id}: [${iv.start}, ${iv.end}]`)
  }

  // 可视化时间轴
  output.push('\n--- 时间轴可视化 ---')
  const maxTime = 16
  for (const iv of intervals) {
    const isSelected = selected.some(s => s.id === iv.id)
    const prefix = `区间 ${String(iv.id).padStart(2)}: `
    let timeline = ''
    for (let t = 0; t <= maxTime; t++) {
      if (t >= iv.start && t <= iv.end) {
        timeline += isSelected ? '█' : '░'
      } else {
        timeline += ' '
      }
    }
    output.push(`${prefix}${timeline} [${iv.start},${iv.end}] ${isSelected ? '(选中)' : ''}`)
  }

  // 为什么按结束时间排序
  output.push('\n--- 为什么按结束时间排序？ ---')
  output.push('反例：如果按开始时间排序')
  const byStart = [...intervals].sort((a, b) => a.start - b.start)
  output.push('排序结果: ' + byStart.map(iv => `[${iv.start},${iv.end}]`).join(', '))
  output.push('贪心选择: [0,6] -> [6,10] -> [12,16] = 3 个区间')
  output.push('但按结束时间排序可以选 4 个！')
  output.push('\n按开始时间排序会优先选开始早但可能很长的区间，')
  output.push('导致排除多个短区间，无法得到最优解。')

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
