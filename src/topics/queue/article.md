# 队列 (Queue)

## 概念解释

队列是一种**先进先出 (FIFO, First In First Out)** 的线性数据结构。

想象你在食堂排队打饭：先来的人先打饭，后来的人排在后面。这就是队列的核心思想。

### 核心术语

- **入队 (Enqueue)**：将元素添加到队列的尾部（rear）
- **出队 (Dequeue)**：从队列的头部（front）移除元素
- **队头 (Front)**：队列的第一个元素，即将被取出的元素
- **队尾 (Rear)**：队列的最后一个元素，刚刚进入的元素

```
入队方向 →
  ┌───┬───┬───┬───┬───┐
  │ A │ B │ C │ D │ E │
  └───┴───┴───┴───┴───┘
  队头 ↑               ↑ 队尾
 (front)            (rear)
                 → 出队方向
```

## 为什么重要

队列在计算机科学中无处不在：

1. **广度优先搜索 (BFS)**：图和树的层序遍历必须使用队列
2. **任务调度**：操作系统使用队列管理进程和线程
3. **打印队列**：打印机按顺序处理打印任务
4. **消息队列**：分布式系统中异步通信的基础（如 RabbitMQ、Kafka）
5. **缓冲区**：视频播放、网络数据包都使用队列缓冲

## 核心原理

### 数组实现：循环队列

普通数组实现队列有一个问题：出队后前面的空间无法复用。

```
初始:   [A, B, C, D, _, _]  front=0, rear=4
出队后: [_, B, C, D, _, _]  front=1, rear=4
问题：前面的空间浪费了！
```

**循环队列**通过取模运算让数组"首尾相连"：

```typescript
class CircularQueue {
  private data: (number | null)[]
  private front: number = 0
  private rear: number = 0
  private size: number = 0
  private capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
    this.data = new Array(capacity).fill(null)
  }

  enqueue(val: number): boolean {
    if (this.size === this.capacity) return false  // 队满
    this.data[this.rear] = val
    this.rear = (this.rear + 1) % this.capacity  // 关键：取模
    this.size++
    return true
  }

  dequeue(): number | null {
    if (this.size === 0) return null  // 队空
    const val = this.data[this.front]
    this.data[this.front] = null
    this.front = (this.front + 1) % this.capacity  // 关键：取模
    this.size--
    return val
  }
}
```

### 链表实现

使用链表实现队列更加直观：

```typescript
class LinkedQueue {
  private front: Node | null = null
  private rear: Node | null = null

  enqueue(val: number): void {
    const node = new Node(val)
    if (!this.rear) {
      this.front = this.rear = node
    } else {
      this.rear.next = node
      this.rear = node
    }
  }

  dequeue(): number | null {
    if (!this.front) return null
    const val = this.front.val
    this.front = this.front.next
    if (!this.front) this.rear = null
    return val
  }
}
```

### 时间复杂度

| 操作 | 数组循环队列 | 链表队列 |
|------|-------------|---------|
| 入队 | O(1) | O(1) |
| 出队 | O(1) | O(1) |
| 查看队头 | O(1) | O(1) |

## 可视化说明

可视化展示了队列的核心操作：

1. **入队动画**：新元素从右侧滑入队尾
2. **出队动画**：队头元素从左侧滑出
3. **循环队列**：展示数组如何首尾相连
4. **BFS 演示**：在图上展示 BFS 如何使用队列

## 常见错误

### 1. 循环队列判空判满混淆

```typescript
// 错误：只用 front == rear 判断
if (this.front === this.rear) return true  // 无法区分空和满！

// 正确：使用 size 变量，或牺牲一个空间
isEmpty(): boolean { return this.size === 0 }
isFull(): boolean { return this.size === this.capacity }
```

### 2. 循环缓冲区的 off-by-one 错误

```typescript
// 错误：忘记取模
this.rear = this.rear + 1  // 可能越界！

// 正确：始终取模
this.rear = (this.rear + 1) % this.capacity
```

### 3. 空队列操作

```typescript
// 错误：不检查空队列就出队
const val = this.data[this.front]  // 可能是 null！

// 正确：先检查
if (this.size === 0) throw new Error("队列为空")
```

## 实际应用

### 1. BFS（广度优先搜索）

```typescript
function bfs(graph: number[][], start: number): number[] {
  const visited = new Set<number>()
  const queue: number[] = [start]
  const result: number[] = []
  visited.add(start)

  while (queue.length > 0) {
    const node = queue.shift()!
    result.push(node)
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }
  return result
}
```

### 2. 消息队列

分布式系统中，生产者将消息放入队列，消费者从队列取出处理，实现异步解耦。

### 3. 打印任务调度

多个用户提交打印任务，打印机按 FIFO 顺序处理。

### 4. CPU 进程调度

操作系统使用就绪队列管理等待 CPU 时间片的进程。

## 总结

队列是最重要的基础数据结构之一：

- **核心思想**：先进先出 (FIFO)
- **关键操作**：入队 O(1)，出队 O(1)
- **实现方式**：循环数组 或 链表
- **核心应用**：BFS、任务调度、消息队列、缓冲区

掌握队列是理解 BFS、操作系统调度、分布式系统等高级主题的基础。
