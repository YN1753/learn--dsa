export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 队列 (Queue) 演示 ===\n')

  // ---- 1. 基本队列操作 ----
  lines.push('【1】基本队列操作 (链表实现)')
  lines.push('─'.repeat(40))

  class LinkedQueue {
    private data: number[] = []

    enqueue(val: number): void {
      this.data.push(val)
    }

    dequeue(): number | undefined {
      return this.data.shift()
    }

    peek(): number | undefined {
      return this.data[0]
    }

    isEmpty(): boolean {
      return this.data.length === 0
    }

    size(): number {
      return this.data.length
    }

    toString(): string {
      return `[${this.data.join(', ')}]`
    }
  }

  const queue = new LinkedQueue()

  // 入队
  for (const val of [10, 20, 30, 40, 50]) {
    queue.enqueue(val)
    lines.push(`  enqueue(${val})  → 队列: ${queue.toString()}`)
  }

  lines.push('')

  // 查看队头
  lines.push(`  peek()        → ${queue.peek()}`)
  lines.push(`  size()        → ${queue.size()}`)
  lines.push('')

  // 出队
  for (let i = 0; i < 3; i++) {
    const val = queue.dequeue()
    lines.push(`  dequeue()     → ${val}  队列: ${queue.toString()}`)
  }

  lines.push(`\n  isEmpty()     → ${queue.isEmpty()}`)
  lines.push('')

  // ---- 2. 循环队列演示 ----
  lines.push('【2】循环队列演示 (容量=5)')
  lines.push('─'.repeat(40))

  class CircularQueue {
    private data: (number | null)[]
    private front: number = 0
    private rear: number = 0
    private count: number = 0
    private capacity: number

    constructor(capacity: number) {
      this.capacity = capacity
      this.data = new Array(capacity).fill(null)
    }

    enqueue(val: number): boolean {
      if (this.isFull()) return false
      this.data[this.rear] = val
      this.rear = (this.rear + 1) % this.capacity
      this.count++
      return true
    }

    dequeue(): number | null {
      if (this.isEmpty()) return null
      const val = this.data[this.front]
      this.data[this.front] = null
      this.front = (this.front + 1) % this.capacity
      this.count--
      return val
    }

    isFull(): boolean {
      return this.count === this.capacity
    }

    isEmpty(): boolean {
      return this.count === 0
    }

    toString(): string {
      const arr = this.data.map(v => v !== null ? String(v) : '_')
      return `数据: [${arr.join(', ')}]  front=${this.front}  rear=${this.rear}  count=${this.count}`
    }
  }

  const cq = new CircularQueue(5)

  // 填满队列
  lines.push('  填充队列:')
  for (const val of [1, 2, 3, 4, 5]) {
    cq.enqueue(val)
    lines.push(`    enqueue(${val})  → ${cq.toString()}`)
  }

  lines.push(`  尝试 enqueue(6)  → ${cq.enqueue(6) ? '成功' : '失败（队满）'}`)
  lines.push('')

  // 出队腾出空间，再入队（展示循环特性）
  lines.push('  出队腾出空间，再入队（展示循环特性）:')
  const d1 = cq.dequeue()
  const d2 = cq.dequeue()
  lines.push(`    dequeue() → ${d1}  ${cq.toString()}`)
  lines.push(`    dequeue() → ${d2}  ${cq.toString()}`)

  cq.enqueue(6)
  lines.push(`    enqueue(6)    → ${cq.toString()}`)
  cq.enqueue(7)
  lines.push(`    enqueue(7)    → ${cq.toString()}`)
  lines.push('  注意: rear 已经绕回到数组开头，这就是"循环"的含义！')
  lines.push('')

  // ---- 3. BFS 演示 ----
  lines.push('【3】BFS（广度优先搜索）演示')
  lines.push('─'.repeat(40))
  lines.push('  图结构:')
  lines.push('      0')
  lines.push('     / \\')
  lines.push('    1   2')
  lines.push('   / \\   \\')
  lines.push('  3   4   5')
  lines.push('')

  // 邻接表
  const graph: number[][] = [
    [1, 2],    // 0 -> 1, 2
    [0, 3, 4], // 1 -> 0, 3, 4
    [0, 5],    // 2 -> 0, 5
    [1],       // 3 -> 1
    [1],       // 4 -> 1
    [2],       // 5 -> 2
  ]

  lines.push('  从节点 0 开始 BFS:')
  lines.push('')

  const visited = new Set<number>()
  const bfsQueue: number[] = [0]
  visited.add(0)
  let step = 0
  const result: number[] = []

  while (bfsQueue.length > 0) {
    step++
    const node = bfsQueue.shift()!
    result.push(node)

    lines.push(`  步骤 ${step}: 取出节点 ${node}`)
    lines.push(`    访问: [${result.join(', ')}]`)

    const neighbors = graph[node].filter(n => !visited.has(n))
    if (neighbors.length > 0) {
      for (const neighbor of neighbors) {
        visited.add(neighbor)
        bfsQueue.push(neighbor)
        lines.push(`    将邻居 ${neighbor} 入队`)
      }
    } else {
      lines.push(`    无新邻居`)
    }
    lines.push(`    队列: [${bfsQueue.join(', ')}]`)
    lines.push('')
  }

  lines.push(`  BFS 遍历顺序: [${result.join(', ')}]`)
  lines.push(`  这就是层序遍历: 第一层 0 → 第二层 1,2 → 第三层 3,4,5`)
  lines.push('')

  // ---- 总结 ----
  lines.push('=== 总结 ===')
  lines.push('队列的核心特性: 先进先出 (FIFO)')
  lines.push('入队/出队时间复杂度: O(1)')
  lines.push('循环队列通过取模运算实现空间复用')
  lines.push('BFS 使用队列实现层序遍历')

  return lines.join('\n')
}
