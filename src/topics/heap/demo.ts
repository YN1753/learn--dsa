// 堆 (Heap) 演示

class MaxHeap {
  private data: number[] = []

  get size(): number {
    return this.data.length
  }

  peek(): number | undefined {
    return this.data[0]
  }

  toArray(): number[] {
    return [...this.data]
  }

  // 获取父节点索引
  private parent(i: number): number {
    return Math.floor((i - 1) / 2)
  }

  // 获取左子节点索引
  private left(i: number): number {
    return 2 * i + 1
  }

  // 获取右子节点索引
  private right(i: number): number {
    return 2 * i + 2
  }

  // 交换两个元素
  private swap(i: number, j: number): void {
    const temp = this.data[i]
    this.data[i] = this.data[j]
    this.data[j] = temp
  }

  // 上浮操作：插入元素后恢复堆性质
  private siftUp(i: number): void {
    while (i > 0) {
      const parentIdx = this.parent(i)
      if (this.data[i] > this.data[parentIdx]) {
        this.swap(i, parentIdx)
        i = parentIdx
      } else {
        break
      }
    }
  }

  // 下沉操作：移除堆顶后恢复堆性质
  private siftDown(i: number): void {
    const n = this.data.length
    while (true) {
      let largest = i
      const leftIdx = this.left(i)
      const rightIdx = this.right(i)

      if (leftIdx < n && this.data[leftIdx] > this.data[largest]) {
        largest = leftIdx
      }
      if (rightIdx < n && this.data[rightIdx] > this.data[largest]) {
        largest = rightIdx
      }

      if (largest !== i) {
        this.swap(i, largest)
        i = largest
      } else {
        break
      }
    }
  }

  // 插入元素
  insert(value: number): void {
    this.data.push(value)
    this.siftUp(this.data.length - 1)
  }

  // 取出最大值
  extractMax(): number | undefined {
    if (this.data.length === 0) return undefined
    const max = this.data[0]
    this.data[0] = this.data[this.data.length - 1]
    this.data.pop()
    if (this.data.length > 0) {
      this.siftDown(0)
    }
    return max
  }
}

// 从无序数组建堆
function buildHeap(arr: number[]): MaxHeap {
  const heap = new MaxHeap()
  heap['data'] = [...arr]

  // 从最后一个非叶子节点开始下沉
  const n = arr.length
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heap['siftDown'](i)
  }

  return heap
}

// 堆排序
function heapSort(arr: number[]): number[] {
  const result: number[] = []
  const heap = buildHeap(arr)

  while (heap.size > 0) {
    result.push(heap.extractMax()!)
  }

  return result
}

// 打印堆的树形结构
function printHeapTree(data: number[]): string {
  if (data.length === 0) return '(空堆)'

  const lines: string[] = []
  const height = Math.floor(Math.log2(data.length)) + 1

  let index = 0
  for (let level = 0; level < height; level++) {
    const count = Math.pow(2, level)
    const spacing = Math.pow(2, height - level) - 1
    const indent = ' '.repeat(spacing)
    const between = ' '.repeat(spacing * 2 + 1)

    let line = indent
    for (let i = 0; i < count && index < data.length; i++) {
      line += String(data[index]).padStart(2)
      if (i < count - 1 && index + 1 < data.length) {
        line += between
      } else if (i < count - 1) {
        line += ' '.repeat(between.length)
      }
      index++
    }
    lines.push(line)
  }

  return lines.join('\n')
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('          堆 (Heap) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 建堆演示
  lines.push('【第一步】从无序数组构建最大堆')
  lines.push('原始数组: [10, 40, 30, 60, 50, 20, 70]')
  lines.push('')

  const arr = [10, 40, 30, 60, 50, 20, 70]
  const heap = buildHeap(arr)

  lines.push('建堆过程 (自底向上下沉):')
  lines.push('  最后一个非叶子节点索引 = Math.floor(7/2) - 1 = 2')
  lines.push('  从索引 2 开始，自右向左执行下沉操作')
  lines.push('')
  lines.push('建堆结果 (最大堆):')
  lines.push(`  数组表示: [${heap.toArray().join(', ')}]`)
  lines.push(`  树形结构:`)
  lines.push(printHeapTree(heap.toArray()))
  lines.push(`  堆顶 (最大值): ${heap.peek()}`)
  lines.push('')

  // 2. 插入演示
  lines.push('【第二步】插入元素 (上浮操作)')
  lines.push('')

  const insertValues = [85, 55, 95]
  for (const val of insertValues) {
    const before = heap.toArray()
    heap.insert(val)
    const after = heap.toArray()
    lines.push(`  插入 ${val}:`)
    lines.push(`    插入前: [${before.join(', ')}]`)
    lines.push(`    插入后: [${after.join(', ')}]`)
    lines.push(`    ${val} 上浮到正确位置，恢复堆性质`)
    lines.push('')
  }

  // 3. 取最大值演示
  lines.push('【第三步】取出最大值 (下沉操作)')
  lines.push('')

  for (let i = 0; i < 3; i++) {
    const before = heap.toArray()
    const max = heap.extractMax()
    const after = heap.toArray()
    lines.push(`  取出最大值: ${max}`)
    lines.push(`    操作前: [${before.join(', ')}]`)
    lines.push(`    操作后: [${after.join(', ')}]`)
    if (after.length > 0) {
      lines.push(`    新的堆顶: ${heap.peek()}`)
    }
    lines.push('')
  }

  // 4. 堆排序演示
  lines.push('【第四步】堆排序')
  lines.push('')

  const sortArr = [38, 27, 43, 3, 9, 82, 10]
  lines.push(`  原始数组: [${sortArr.join(', ')}]`)
  lines.push('')

  const sorted = heapSort(sortArr)
  lines.push('  排序过程:')
  lines.push('    1) 建最大堆')
  lines.push('    2) 依次取出堆顶 (最大值)')
  lines.push('    3) 结果为降序排列')
  lines.push('')
  lines.push(`  排序结果: [${sorted.join(', ')}]`)
  lines.push(`  验证: ${sorted.every((v, i) => i === 0 || v <= sorted[i - 1]) ? '✓ 正确降序' : '✗ 排序错误'}`)
  lines.push('')

  // 5. 复杂度总结
  lines.push('【第五步】复杂度分析')
  lines.push('')
  lines.push('  ┌─────────────┬──────────────┬──────────────┐')
  lines.push('  │    操作     │  时间复杂度  │  空间复杂度  │')
  lines.push('  ├─────────────┼──────────────┼──────────────┤')
  lines.push('  │    插入     │   O(log n)   │    O(1)      │')
  lines.push('  │  取最值     │   O(log n)   │    O(1)      │')
  lines.push('  │  查看最值   │    O(1)      │    O(1)      │')
  lines.push('  │    建堆     │    O(n)      │    O(1)      │')
  lines.push('  │   堆排序    │  O(n log n)  │    O(1)      │')
  lines.push('  └─────────────┴──────────────┴──────────────┘')
  lines.push('')

  // 6. 应用场景
  lines.push('【第六步】典型应用场景')
  lines.push('')
  lines.push('  1. 优先队列: 操作系统任务调度、医院急诊分诊')
  lines.push('  2. 堆排序: O(n log n) 原地排序，不需要额外空间')
  lines.push('  3. Top-K 问题: 从海量数据中找最大/最小的 K 个')
  lines.push('  4. 合并 K 个有序链表: O(N log K) 时间复杂度')
  lines.push('  5. 中位数维护: 最大堆 + 最小堆，O(log n) 插入')
  lines.push('  6. Dijkstra 算法: 最小堆优化最短路径搜索')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
