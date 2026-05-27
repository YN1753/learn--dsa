import type { TopicMetadata, QuizQuestion } from '../types'

export interface TopicEntry {
  metadata: TopicMetadata
  articleHtml: string
  quiz: QuizQuestion[]
  getVisualization: () => Promise<{ default: React.ComponentType }>
  getDemo: () => Promise<{ default: () => string }>
}

class TopicRegistry {
  private topics = new Map<string, TopicEntry>()

  register(id: string, entry: TopicEntry) {
    this.topics.set(id, entry)
  }

  get(id: string): TopicEntry | undefined {
    return this.topics.get(id)
  }

  getAll(): TopicMetadata[] {
    return Array.from(this.topics.values())
      .map(t => t.metadata)
      .sort((a, b) => a.order - b.order)
  }
}

export const topicRegistry = new TopicRegistry()

// Register Array topic
import arrayMetadata from './array/metadata.json'
import arrayQuiz from './array/quiz.json'

const arrayArticleHtml = `
<h2>什么是数组？</h2>
<p>数组（Array）是最基础、最常用的数据结构之一。它是一组<strong>相同类型</strong>元素的集合，这些元素在内存中<strong>连续存放</strong>，并通过<strong>索引</strong>（下标）来访问每个元素。</p>
<p>想象一排储物柜，每个柜子大小相同，整齐排列。你可以通过柜子编号（索引）直接找到任何一个柜子，这就是数组的核心思想。</p>
<pre><code class="language-typescript">// 创建一个包含 5 个数字的数组
const numbers: number[] = [10, 25, 33, 47, 58]

// 通过索引访问元素
console.log(numbers[0])  // 10（第一个元素）
console.log(numbers[3])  // 47（第四个元素）
</code></pre>

<h2>数组为什么重要？</h2>
<h3>1. 数据结构的基石</h3>
<p>数组是几乎所有高级数据结构的基础。栈、队列、哈希表、堆、图的邻接矩阵等，底层都可以用数组来实现。理解数组，是学习其他数据结构的前提。</p>

<h3>2. 缓存友好（Cache Friendly）</h3>
<p>由于数组元素在内存中连续存放，当访问一个元素时，CPU 会把相邻的元素也加载到缓存中（缓存行，Cache Line）。这意味着遍历数组的速度通常比遍历链表快得多，即使两者的时间复杂度都是 O(n)。</p>
<pre><code>内存布局示意：

地址:  1000  1004  1008  1012  1016
      +-----+-----+-----+-----+-----+
数据:  | 10  | 25  | 33  | 47  | 58  |
      +-----+-----+-----+-----+-----+
索引:    [0]   [1]   [2]   [3]   [4]

连续存储 → 缓存一次可以加载多个元素
</code></pre>

<h3>3. 随机访问 O(1)</h3>
<p>数组最大的优势是可以用 O(1) 时间访问任意位置的元素。这得益于连续内存布局带来的简单地址计算公式。</p>

<h2>核心原理</h2>
<h3>地址计算公式</h3>
<p>数组元素的内存地址可以通过以下公式直接计算：</p>
<pre><code>元素地址 = 基地址 + 索引 × 元素大小
address(arr[i]) = base_address + i × sizeof(element)
</code></pre>
<p>例如，一个 <code>int</code> 数组（每个 int 占 4 字节），基地址为 1000：</p>
<table>
<thead><tr><th>索引</th><th>计算过程</th><th>地址</th></tr></thead>
<tbody>
<tr><td>0</td><td>1000 + 0 × 4</td><td>1000</td></tr>
<tr><td>1</td><td>1000 + 1 × 4</td><td>1004</td></tr>
<tr><td>2</td><td>1000 + 2 × 4</td><td>1008</td></tr>
<tr><td>3</td><td>1000 + 3 × 4</td><td>1012</td></tr>
<tr><td>4</td><td>1000 + 4 × 4</td><td>1016</td></tr>
</tbody>
</table>
<p>无论数组有多大，访问任意元素都只需要一次计算，这就是 O(1) 的秘密。</p>

<h3>时间复杂度</h3>
<table>
<thead><tr><th>操作</th><th>时间复杂度</th><th>说明</th></tr></thead>
<tbody>
<tr><td>随机访问</td><td>O(1)</td><td>通过索引直接计算地址</td></tr>
<tr><td>线性查找</td><td>O(n)</td><td>最坏情况需要遍历所有元素</td></tr>
<tr><td>末尾插入</td><td>O(1)</td><td>直接放到末尾</td></tr>
<tr><td>中间插入</td><td>O(n)</td><td>需要移动后续元素</td></tr>
<tr><td>末尾删除</td><td>O(1)</td><td>直接移除末尾</td></tr>
<tr><td>中间删除</td><td>O(n)</td><td>需要移动后续元素</td></tr>
</tbody>
</table>

<h2>可视化说明</h2>
<p>在右侧的可视化面板中，你可以直观地观察数组的各种操作：</p>
<ul>
<li><strong>插入动画</strong>：新元素插入时，后续元素依次向右移动，为新元素腾出空间</li>
<li><strong>删除动画</strong>：删除元素后，后续元素依次向左移动，填补空位</li>
<li><strong>查找动画</strong>：从左到右逐个比较，高亮当前正在比较的元素</li>
</ul>
<p>通过动画控制栏，你可以：</p>
<ul>
<li>播放 / 暂停动画</li>
<li>调整动画速度</li>
<li>重置到初始状态</li>
</ul>

<h2>常见错误</h2>
<h3>1. 数组越界（Off-by-One / Out of Bounds）</h3>
<pre><code class="language-typescript">const arr = [1, 2, 3, 4, 5]

// ❌ 错误：索引从 0 开始，最大索引是 length - 1
console.log(arr[5])   // undefined（越界）

// ❌ 错误：循环条件应该是 i &lt; length，不是 i &lt;= length
for (let i = 0; i &lt;= arr.length; i++) {
  console.log(arr[i]) // 最后一次会越界
}

// ✅ 正确：使用 &lt; 而不是 &lt;=
for (let i = 0; i &lt; arr.length; i++) {
  console.log(arr[i])
}
</code></pre>

<h3>2. 缓冲区溢出（Buffer Overflow）</h3>
<p>在低级语言（如 C/C++）中，访问越界数组不会报错，而是访问了相邻内存的数据，这可能导致程序崩溃或安全漏洞。TypeScript/JavaScript 会返回 <code>undefined</code>，但逻辑错误仍然存在。</p>

<h3>3. 混淆索引和长度</h3>
<pre><code class="language-typescript">const arr = [10, 20, 30]

// ❌ 错误：arr.length 是 3，不是最后一个元素的索引
console.log(arr[arr.length])     // undefined

// ✅ 正确：最后一个元素的索引是 length - 1
console.log(arr[arr.length - 1]) // 30
</code></pre>

<h2>实际应用</h2>
<h3>1. 查找表（Lookup Table）</h3>
<p>当需要频繁通过索引查找值时，数组是最佳选择：</p>
<pre><code class="language-typescript">// 星期几的名称
const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const today = new Date().getDay()
console.log(\`今天是\${dayNames[today]}\`)
</code></pre>

<h3>2. 缓冲区（Buffer）</h3>
<p>音频、视频、网络数据包的处理中，数据通常存储在数组缓冲区中：</p>
<pre><code class="language-typescript">// 处理二进制数据
const buffer = new ArrayBuffer(1024)  // 1KB 缓冲区
const view = new Uint8Array(buffer)
view[0] = 0xFF
view[1] = 0xAA
</code></pre>

<h3>3. 矩阵运算</h3>
<p>二维数组常用于表示矩阵，广泛应用于图像处理、机器学习等领域：</p>
<pre><code class="language-typescript">// 3x3 矩阵
const matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]

// 访问第 2 行第 3 列的元素
console.log(matrix[1][2])  // 6
</code></pre>

<h3>4. 实现其他数据结构</h3>
<pre><code class="language-typescript">// 用数组实现栈
class Stack&lt;T&gt; {
  private items: T[] = []
  push(item: T) { this.items.push(item) }
  pop(): T | undefined { return this.items.pop() }
  peek(): T | undefined { return this.items[this.items.length - 1] }
  get size(): number { return this.items.length }
}

// 用数组实现队列（环形缓冲区更高效）
class Queue&lt;T&gt; {
  private items: T[] = []
  enqueue(item: T) { this.items.push(item) }
  dequeue(): T | undefined { return this.items.shift() }
  get size(): number { return this.items.length }
}
</code></pre>

<h2>总结</h2>
<p>数组是最基础的数据结构，理解它对于学习计算机科学至关重要：</p>
<ul>
<li><strong>连续内存存储</strong>：元素紧密排列，带来优秀的缓存性能</li>
<li><strong>O(1) 随机访问</strong>：通过地址公式直接定位元素</li>
<li><strong>固定大小</strong>：创建时确定大小，扩容需要重新分配内存</li>
<li><strong>插入/删除较慢</strong>：中间操作需要移动元素，时间复杂度 O(n)</li>
<li><strong>广泛应用</strong>：查找表、缓冲区、矩阵、底层实现各种数据结构</li>
</ul>
<p>掌握数组的特性和适用场景，是成为优秀程序员的第一步。在接下来的主题中，我们将学习链表——另一种线性数据结构，它在插入和删除方面有更好的表现，但牺牲了随机访问的能力。</p>
`

topicRegistry.register('array', {
  metadata: arrayMetadata as TopicMetadata,
  articleHtml: arrayArticleHtml,
  quiz: arrayQuiz as QuizQuestion[],
  getVisualization: () => import('./array/visualization.tsx'),
  getDemo: () => import('./array/demo.ts')
})

// Register Queue topic
import queueMetadata from './queue/metadata.json'
import queueQuiz from './queue/quiz.json'

const queueArticleHtml = `
<h2>概念解释</h2>
<p>队列是一种<strong>先进先出 (FIFO, First In First Out)</strong> 的线性数据结构。</p>
<p>想象你在食堂排队打饭：先来的人先打饭，后来的人排在后面。这就是队列的核心思想。</p>

<h3>核心术语</h3>
<ul>
<li><strong>入队 (Enqueue)</strong>：将元素添加到队列的尾部（rear）</li>
<li><strong>出队 (Dequeue)</strong>：从队列的头部（front）移除元素</li>
<li><strong>队头 (Front)</strong>：队列的第一个元素，即将被取出的元素</li>
<li><strong>队尾 (Rear)</strong>：队列的最后一个元素，刚刚进入的元素</li>
</ul>
<pre><code>入队方向 →
  ┌───┬───┬───┬───┬───┐
  │ A │ B │ C │ D │ E │
  └───┴───┴───┴───┴───┘
  队头 ↑               ↑ 队尾
 (front)            (rear)
                 → 出队方向
</code></pre>

<h2>为什么重要</h2>
<p>队列在计算机科学中无处不在：</p>
<ol>
<li><strong>广度优先搜索 (BFS)</strong>：图和树的层序遍历必须使用队列</li>
<li><strong>任务调度</strong>：操作系统使用队列管理进程和线程</li>
<li><strong>打印队列</strong>：打印机按顺序处理打印任务</li>
<li><strong>消息队列</strong>：分布式系统中异步通信的基础（如 RabbitMQ、Kafka）</li>
<li><strong>缓冲区</strong>：视频播放、网络数据包都使用队列缓冲</li>
</ol>

<h2>核心原理</h2>
<h3>数组实现：循环队列</h3>
<p>普通数组实现队列有一个问题：出队后前面的空间无法复用。</p>
<pre><code>初始:   [A, B, C, D, _, _]  front=0, rear=4
出队后: [_, B, C, D, _, _]  front=1, rear=4
问题：前面的空间浪费了！
</code></pre>
<p><strong>循环队列</strong>通过取模运算让数组"首尾相连"：</p>
<pre><code class="language-typescript">class CircularQueue {
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
</code></pre>

<h3>链表实现</h3>
<p>使用链表实现队列更加直观：</p>
<pre><code class="language-typescript">class LinkedQueue {
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
</code></pre>

<h3>时间复杂度</h3>
<table>
<thead><tr><th>操作</th><th>数组循环队列</th><th>链表队列</th></tr></thead>
<tbody>
<tr><td>入队</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>出队</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>查看队头</td><td>O(1)</td><td>O(1)</td></tr>
</tbody>
</table>

<h2>可视化说明</h2>
<p>可视化展示了队列的核心操作：</p>
<ul>
<li><strong>入队动画</strong>：新元素从右侧滑入队尾</li>
<li><strong>出队动画</strong>：队头元素从左侧滑出</li>
<li><strong>循环队列</strong>：展示数组如何首尾相连</li>
<li><strong>BFS 演示</strong>：在图上展示 BFS 如何使用队列</li>
</ul>

<h2>常见错误</h2>
<h3>1. 循环队列判空判满混淆</h3>
<pre><code class="language-typescript">// 错误：只用 front == rear 判断
if (this.front === this.rear) return true  // 无法区分空和满！

// 正确：使用 size 变量，或牺牲一个空间
isEmpty(): boolean { return this.size === 0 }
isFull(): boolean { return this.size === this.capacity }
</code></pre>

<h3>2. 循环缓冲区的 off-by-one 错误</h3>
<pre><code class="language-typescript">// 错误：忘记取模
this.rear = this.rear + 1  // 可能越界！

// 正确：始终取模
this.rear = (this.rear + 1) % this.capacity
</code></pre>

<h3>3. 空队列操作</h3>
<pre><code class="language-typescript">// 错误：不检查空队列就出队
const val = this.data[this.front]  // 可能是 null！

// 正确：先检查
if (this.size === 0) throw new Error("队列为空")
</code></pre>

<h2>实际应用</h2>
<h3>1. BFS（广度优先搜索）</h3>
<pre><code class="language-typescript">function bfs(graph: number[][], start: number): number[] {
  const visited = new Set&lt;number&gt;()
  const queue: number[] = [start]
  const result: number[] = []
  visited.add(start)

  while (queue.length &gt; 0) {
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
</code></pre>

<h3>2. 消息队列</h3>
<p>分布式系统中，生产者将消息放入队列，消费者从队列取出处理，实现异步解耦。</p>

<h3>3. 打印任务调度</h3>
<p>多个用户提交打印任务，打印机按 FIFO 顺序处理。</p>

<h3>4. CPU 进程调度</h3>
<p>操作系统使用就绪队列管理等待 CPU 时间片的进程。</p>

<h2>总结</h2>
<p>队列是最重要的基础数据结构之一：</p>
<ul>
<li><strong>核心思想</strong>：先进先出 (FIFO)</li>
<li><strong>关键操作</strong>：入队 O(1)，出队 O(1)</li>
<li><strong>实现方式</strong>：循环数组 或 链表</li>
<li><strong>核心应用</strong>：BFS、任务调度、消息队列、缓冲区</li>
</ul>
<p>掌握队列是理解 BFS、操作系统调度、分布式系统等高级主题的基础。</p>
`

topicRegistry.register('queue', {
  metadata: queueMetadata as TopicMetadata,
  articleHtml: queueArticleHtml,
  quiz: queueQuiz as QuizQuestion[],
  getVisualization: () => import('./queue/visualization.tsx'),
  getDemo: () => import('./queue/demo.ts')
})
