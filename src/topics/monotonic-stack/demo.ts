export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 单调栈 (Monotonic Stack) 演示 ===')
  lines.push('')

  // --- 1. 下一个更大元素（逐步演示） ---
  lines.push('【1】下一个更大元素 — 逐步演示')
  lines.push('─────────────────────────')

  const arr = [2, 1, 2, 4, 3]
  lines.push(`数组: [${arr.join(', ')}]`)
  lines.push('')

  const n = arr.length
  const result = new Array(n).fill(-1)
  const stack: number[] = []

  for (let i = 0; i < n; i++) {
    lines.push(`第 ${i + 1} 步: 处理 arr[${i}] = ${arr[i]}`)
    lines.push(`  当前栈 (索引): [${stack.join(', ')}]  对应值: [${stack.map(idx => arr[idx]).join(', ')}]`)

    const poppedItems: string[] = []
    while (stack.length > 0 && arr[i] > arr[stack[stack.length - 1]]) {
      const topIndex = stack.pop()!
      result[topIndex] = arr[i]
      poppedItems.push(`arr[${topIndex}]=${arr[topIndex]} → 答案是 ${arr[i]}`)
    }

    if (poppedItems.length > 0) {
      for (const item of poppedItems) {
        lines.push(`  弹出: ${item}`)
      }
    } else if (stack.length > 0) {
      lines.push(`  ${arr[i]} <= 栈顶 ${arr[stack[stack.length - 1]]}，不弹出`)
    }

    stack.push(i)
    lines.push(`  压入 arr[${i}] = ${arr[i]}  →  栈: [${stack.join(', ')}]`)
    lines.push(`  当前结果: [${result.map((v, idx) => `arr[${idx}]→${v === -1 ? '无' : v}`).join(', ')}]`)
    lines.push('')
  }

  lines.push('遍历结束，栈中剩余元素没有下一个更大元素:')
  for (const idx of stack) {
    lines.push(`  arr[${idx}] = ${arr[idx]} → 无更大元素`)
  }
  lines.push(`最终结果: [${result.join(', ')}]`)
  lines.push('')

  // --- 2. 股票跨度问题 ---
  lines.push('【2】股票跨度问题 (Stock Span)')
  lines.push('─────────────────────────')

  const prices = [100, 80, 60, 70, 60, 75, 85]
  lines.push(`价格序列: [${prices.join(', ')}]`)
  lines.push('')

  const spanStack: [number, number][] = []  // [价格, 跨度]
  const spans: number[] = []

  for (let i = 0; i < prices.length; i++) {
    let span = 1
    const popped: string[] = []

    while (spanStack.length > 0 && prices[i] >= spanStack[spanStack.length - 1][0]) {
      const [poppedPrice, poppedSpan] = spanStack.pop()!
      span += poppedSpan
      popped.push(`价格${poppedPrice}(跨度${poppedSpan})`)
    }

    spanStack.push([prices[i], span])
    spans.push(span)

    lines.push(`第 ${i + 1} 天: 价格=${prices[i]}`)
    if (popped.length > 0) {
      lines.push(`  弹出: ${popped.join(', ')}  累加跨度`)
    }
    lines.push(`  跨度 = ${span}  栈: [${spanStack.map(([p, s]) => `${p}(${s})`).join(', ')}]`)
    lines.push('')
  }

  lines.push(`最终跨度: [${spans.join(', ')}]`)
  lines.push('')

  // --- 3. 柱状图中最大矩形 ---
  lines.push('【3】柱状图中最大矩形 (Largest Rectangle in Histogram)')
  lines.push('─────────────────────────')

  const heights = [2, 1, 5, 6, 2, 3]
  lines.push(`柱高: [${heights.join(', ')}]`)
  lines.push('')

  const rectStack: number[] = []
  let maxArea = 0
  const extended = [...heights, 0]
  let step = 0

  for (let i = 0; i < extended.length; i++) {
    step++
    const popped: string[] = []

    while (rectStack.length > 0 && extended[i] < extended[rectStack[rectStack.length - 1]]) {
      const topIdx = rectStack.pop()!
      const height = extended[topIdx]
      const width = rectStack.length === 0 ? i : i - rectStack[rectStack.length - 1] - 1
      const area = height * width
      if (area > maxArea) maxArea = area
      popped.push(`索引${topIdx}(高${height}, 宽${width}, 面积${area})`)
    }

    rectStack.push(i)

    const label = i < heights.length ? `柱${i}(高${heights[i]})` : '哨兵(高0)'
    lines.push(`第 ${step} 步: 处理 ${label}`)
    if (popped.length > 0) {
      lines.push(`  弹出计算: ${popped.join(', ')}`)
      lines.push(`  当前最大面积: ${maxArea}`)
    }
    lines.push(`  栈 (索引): [${rectStack.join(', ')}]  对应高度: [${rectStack.map(idx => extended[idx]).join(', ')}]`)
    lines.push('')
  }

  lines.push(`最大矩形面积: ${maxArea}`)
  lines.push('')

  // --- 4. 每日温度 ---
  lines.push('【4】每日温度 (Daily Temperatures)')
  lines.push('─────────────────────────')

  const temps = [73, 74, 75, 71, 69, 72, 76, 73]
  lines.push(`温度: [${temps.join(', ')}]`)
  lines.push('')

  const tempResult = new Array(temps.length).fill(0)
  const tempStack: number[] = []

  for (let i = 0; i < temps.length; i++) {
    const popped: string[] = []

    while (tempStack.length > 0 && temps[i] > temps[tempStack[tempStack.length - 1]]) {
      const prevDay = tempStack.pop()!
      tempResult[prevDay] = i - prevDay
      popped.push(`第${prevDay}天(${temps[prevDay]}°) → 等${i - prevDay}天到第${i}天(${temps[i]}°)`)
    }

    tempStack.push(i)

    if (popped.length > 0) {
      for (const p of popped) lines.push(`  ${p}`)
    }

    lines.push(`第 ${i} 天: ${temps[i]}°  栈: [${tempStack.join(', ')}]`)
  }

  lines.push('')
  lines.push(`等待天数: [${tempResult.join(', ')}]`)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}
