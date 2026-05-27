export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 单调队列 (Monotonic Queue) 演示 ===')
  lines.push('')

  // --- 1. 滑动窗口最大值 ---
  lines.push('【1】滑动窗口最大值（单调递减队列）')
  lines.push('─────────────────────────')
  const arr1 = [1, 3, -1, -3, 5, 3, 6, 7]
  const k1 = 3
  lines.push(`数组: [${arr1.join(', ')}]`)
  lines.push(`窗口大小 k = ${k1}`)
  lines.push('')
  slidingWindowMaxTrace(arr1, k1, lines)
  lines.push('')

  // --- 2. 滑动窗口最小值 ---
  lines.push('【2】滑动窗口最小值（单调递增队列）')
  lines.push('─────────────────────────')
  const arr2 = [1, 3, -1, -3, 5, 3, 6, 7]
  const k2 = 3
  lines.push(`数组: [${arr2.join(', ')}]`)
  lines.push(`窗口大小 k = ${k2}`)
  lines.push('')
  slidingWindowMinTrace(arr2, k2, lines)
  lines.push('')

  // --- 3. 另一个例子：最大值 ---
  lines.push('【3】滑动窗口最大值 - 另一个例子')
  lines.push('─────────────────────────')
  const arr3 = [9, 11, 8, 5, 7, 10, 4, 3, 2]
  const k3 = 4
  lines.push(`数组: [${arr3.join(', ')}]`)
  lines.push(`窗口大小 k = ${k3}`)
  lines.push('')
  slidingWindowMaxTrace(arr3, k3, lines)
  lines.push('')

  // --- 4. 单调队列入队过程详解 ---
  lines.push('【4】单调队列入队过程详解')
  lines.push('─────────────────────────')
  const arr4 = [5, 3, 4, 2, 6, 1]
  lines.push(`依次加入元素: [${arr4.join(', ')}]`)
  lines.push('维护单调递减队列（队首最大）：')
  lines.push('')
  monotonicPushTrace(arr4, lines)
  lines.push('')

  // --- 5. 边界情况 ---
  lines.push('【5】边界情况')
  lines.push('─────────────────────────')
  lines.push('')

  lines.push('情况 A：窗口大小为 1')
  const arr5a = [4, 2, 7, 1]
  lines.push(`数组: [${arr5a.join(', ')}], k=1`)
  slidingWindowMaxTrace(arr5a, 1, lines)
  lines.push('')

  lines.push('情况 B：窗口大小等于数组长度')
  const arr5b = [3, 1, 4, 1, 5]
  lines.push(`数组: [${arr5b.join(', ')}], k=${arr5b.length}`)
  slidingWindowMaxTrace(arr5b, arr5b.length, lines)
  lines.push('')

  lines.push('情况 C：单调递增数组')
  const arr5c = [1, 2, 3, 4, 5]
  lines.push(`数组: [${arr5c.join(', ')}], k=3`)
  slidingWindowMaxTrace(arr5c, 3, lines)
  lines.push('')

  lines.push('情况 D：单调递减数组')
  const arr5d = [5, 4, 3, 2, 1]
  lines.push(`数组: [${arr5d.join(', ')}], k=3`)
  slidingWindowMaxTrace(arr5d, 3, lines)
  lines.push('')

  // --- 6. 效率对比 ---
  lines.push('【6】效率对比')
  lines.push('─────────────────────────')
  lines.push('  暴力解法：每个窗口遍历 k 个元素找最值')
  lines.push('  单调队列：每个元素最多入队出队各一次')
  lines.push('')
  const sizes = [100, 1000, 10000, 100000]
  const kComp = 10
  for (const size of sizes) {
    lines.push(`  n=${size.toLocaleString().padStart(8)}, k=${kComp}:  暴力 O(n*k) ≈ ${(size * kComp).toLocaleString().padStart(10)} 次操作,  单调队列 O(n) = ${size.toLocaleString().padStart(8)} 次操作`)
  }
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 辅助函数：滑动窗口最大值追踪
function slidingWindowMaxTrace(arr: number[], k: number, lines: string[]): void {
  const deque: number[] = []  // 存储索引
  const result: number[] = []

  for (let i = 0; i < arr.length; i++) {
    // 入队：移除队尾所有小于当前元素的索引
    const removed: number[] = []
    while (deque.length > 0 && arr[deque[deque.length - 1]] < arr[i]) {
      removed.push(deque.pop()!)
    }

    deque.push(i)

    // 移除过期元素
    let expired = -1
    if (deque[0] < i - k + 1) {
      expired = deque.shift()!
    }

    // 记录操作
    const dequeValues = deque.map(idx => arr[idx])
    const window = arr.slice(Math.max(0, i - k + 1), i + 1)

    let op = `  i=${i}: 加入 ${arr[i]}`
    if (removed.length > 0) {
      const removedVals = removed.map(idx => arr[idx])
      op += `，移除队尾 [${removedVals.join(',')}]`
    }
    if (expired >= 0) {
      op += `，移除过期元素 ${arr[expired]}`
    }
    op += ` → 队列 [${dequeValues.join(',')}], 窗口 [${window.join(',')}]`

    if (i >= k - 1) {
      result.push(arr[deque[0]])
      op += `  最大值 = ${arr[deque[0]]}`
    }

    lines.push(op)
  }

  lines.push(`  结果: [${result.join(', ')}]`)
}

// 辅助函数：滑动窗口最小值追踪
function slidingWindowMinTrace(arr: number[], k: number, lines: string[]): void {
  const deque: number[] = []
  const result: number[] = []

  for (let i = 0; i < arr.length; i++) {
    // 入队：移除队尾所有大于当前元素的索引（与最大值相反）
    const removed: number[] = []
    while (deque.length > 0 && arr[deque[deque.length - 1]] > arr[i]) {
      removed.push(deque.pop()!)
    }

    deque.push(i)

    let expired = -1
    if (deque[0] < i - k + 1) {
      expired = deque.shift()!
    }

    const dequeValues = deque.map(idx => arr[idx])
    const window = arr.slice(Math.max(0, i - k + 1), i + 1)

    let op = `  i=${i}: 加入 ${arr[i]}`
    if (removed.length > 0) {
      const removedVals = removed.map(idx => arr[idx])
      op += `，移除队尾 [${removedVals.join(',')}]`
    }
    if (expired >= 0) {
      op += `，移除过期元素 ${arr[expired]}`
    }
    op += ` → 队列 [${dequeValues.join(',')}], 窗口 [${window.join(',')}]`

    if (i >= k - 1) {
      result.push(arr[deque[0]])
      op += `  最小值 = ${arr[deque[0]]}`
    }

    lines.push(op)
  }

  lines.push(`  结果: [${result.join(', ')}]`)
}

// 辅助函数：单调队列入队过程详解
function monotonicPushTrace(arr: number[], lines: string[]): void {
  const deque: number[] = []

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i]
    const before = [...deque]

    // 移除队尾所有小于当前元素的
    while (deque.length > 0 && deque[deque.length - 1] < val) {
      deque.pop()
    }

    // 记录被移除的元素
    const removedSimple: number[] = []
    const temp = [...before]
    while (temp.length > 0 && temp[temp.length - 1] < val) {
      removedSimple.push(temp.pop()!)
    }

    deque.push(val)

    let op = `  加入 ${val}:`
    if (removedSimple.length > 0) {
      op += ` 移除队尾 [${removedSimple.join(',')}]`
    }
    op += ` → [${deque.join(', ')}]`
    lines.push(op)
  }

  lines.push(`  最终队列: [${deque.join(', ')}]`)
  lines.push(`  队首 ${deque[0]} 是全局最大值`)
}
