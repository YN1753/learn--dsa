# 堆 (Heap)

## 概念解释

堆（Heap）是一种特殊的**完全二叉树**，它满足**堆性质**（Heap Property）。堆不是简单的无序集合，而是一种有特定组织规则的树形结构。

### 最大堆与最小堆

堆有两种基本形式：

- **最大堆（Max-Heap）**：对于任意节点，其值**大于等于**其子节点的值。堆顶（根节点）是整个堆中的**最大值**。
- **最小堆（Min-Heap）**：对于任意节点，其值**小于等于**其子节点的值。堆顶是整个堆中的**最小值**。

```
最大堆示例：              最小堆示例：

      90                      10
     /  \                    /  \
    80   70                 20   30
   / \   /                 / \   /
  50 60 40               40 50 60

每个父节点 >= 子节点       每个父节点 <= 子节点
```

### 完全二叉树

堆必须是一棵**完全二叉树**（Complete Binary Tree）：除了最后一层外，其他层都是满的，且最后一层的节点从左到右连续排列。这个性质使得堆可以高效地用数组来表示。

### 堆性质（Heap Property）

堆性质是堆的核心约束：
- **最大堆**：`parent(i) >= i` 对所有节点成立
- **最小堆**：`parent(i) <= i` 对所有节点成立

注意：堆**不保证**兄弟节点之间的大小关系，只保证父子关系。

## 为什么重要

堆在计算机科学中有极其广泛的应用：

### 1. 优先队列（Priority Queue）

堆是实现优先队列最常用的数据结构。优先队列不同于普通队列的"先进先出"，而是**优先级最高的元素先出**。操作系统的任务调度、医院急诊分诊等都是优先队列的典型场景。

### 2. 堆排序（Heap Sort）

利用堆的性质，可以在 O(n log n) 时间内完成排序，且只需要 O(1) 的额外空间（原地排序）。

### 3. 图算法

Dijkstra 最短路径算法和 Prim 最小生成树算法都需要使用最小堆来高效地选择下一个要处理的节点。

### 4. Top-K 问题

从海量数据中找出最大（或最小）的 K 个元素，使用堆可以在 O(n log K) 时间内完成，远优于排序的 O(n log n)。

### 5. 中位数维护

使用一个最大堆和一个最小堆，可以实时维护数据流的中位数，支持 O(log n) 插入和 O(1) 查询。

## 核心原理

### 数组表示堆

完全二叉树的一个重要特性是可以用数组紧凑地表示，无需指针。对于索引从 0 开始的数组：

```
数组: [90, 80, 70, 50, 60, 40]

对应的树结构：
        90           索引: 0
       /  \
     80    70        索引: 1, 2
    / \   /
  50  60 40          索引: 3, 4, 5

索引关系：
  父节点:   parent(i) = Math.floor((i - 1) / 2)
  左子节点: left(i)   = 2 * i + 1
  右子节点: right(i)  = 2 * i + 2
```

数组表示的优势：
- **空间紧凑**：无需存储指针，节省内存
- **缓存友好**：连续内存访问，CPU 缓存命中率高
- **索引计算简单**：通过简单算术即可定位父子节点

### 上浮操作（Sift-Up / Bubble-Up）

当插入新元素时，将其放在数组末尾（树的最后一层最右边），然后**向上调整**以恢复堆性质：

```
插入 85 到最大堆中：

步骤 1: 将 85 放到末尾
        90                  [90, 80, 70, 50, 60, 40, 85]
       /  \
     80    70
    / \   / \
  50  60 40  85  ← 新元素

步骤 2: 85 > 70(父节点)，交换
        90                  [90, 80, 85, 50, 60, 40, 70]
       /  \
     80    85  ← 上浮
    / \   / \
  50  60 40  70

步骤 3: 85 < 90(父节点)，停止
堆性质恢复！
```

### 下沉操作（Sift-Down / Bubble-Down）

当移除堆顶元素时，将最后一个元素移到堆顶，然后**向下调整**：

```
从最大堆中移除最大值：

步骤 1: 移除堆顶 90，将末尾 40 放到堆顶
        40                  [40, 80, 70, 50, 60]
       /  \
     80    70
    / \
  50  60

步骤 2: 40 < 80(较大子节点)，交换
        80                  [80, 40, 70, 50, 60]
       /  \
     40    70
    / \
  50  60

步骤 3: 40 < 60(较大子节点)，交换
        80                  [80, 60, 70, 50, 40]
       /  \
     60    70
    / \
  50  40  ← 下沉到底

堆性质恢复！返回移除的值 90。
```

### 建堆操作（Build Heap）

将一个无序数组转换为堆。朴素方法是逐个插入，时间复杂度 O(n log n)。更优的方法是**自底向上**调用下沉操作：

```
原始数组: [10, 40, 30, 60, 50, 20, 70]

从最后一个非叶子节点开始（索引 = n/2 - 1 = 2），自右向左下沉：

索引 2: 下沉 30 → [10, 40, 70, 60, 50, 20, 30]
索引 1: 下沉 40 → [10, 60, 70, 40, 50, 20, 30]
索引 0: 下沉 10 → [70, 60, 30, 40, 50, 20, 10]

最终堆:       70
             /  \
           60    30
          / \   / \
        40  50 20  10
```

时间复杂度分析：虽然看起来是 O(n log n)，但通过数学分析可以证明总操作次数约为 2n，即 **O(n)**。

### 插入操作（Insert）

1. 将新元素添加到数组末尾
2. 执行上浮操作（Sift-Up）
3. 时间复杂度：**O(log n)**（最多上浮树的高度）

### 取最值操作（Extract-Min / Extract-Max）

1. 保存堆顶元素（最大值或最小值）
2. 将最后一个元素移到堆顶
3. 执行下沉操作（Sift-Down）
4. 时间复杂度：**O(log n)**（最多下沉树的高度）

### 时间复杂度总结

| 操作 | 时间复杂度 | 说明 |
|------|-----------|------|
| 插入 | O(log n) | 上浮操作 |
| 取最值 | O(log n) | 下沉操作 |
| 查看最值 | O(1) | 堆顶即是最值 |
| 建堆 | O(n) | 自底向上下沉 |
| 堆排序 | O(n log n) | 建堆 + n次取最值 |

## 可视化说明

在可视化面板中，你可以直观地观察堆的操作过程：

### 双视图展示
- **树形视图**：以完全二叉树的形式展示堆的结构，清晰地看到父子关系
- **数组视图**：以数组的形式展示堆的底层存储，与树形视图同步更新

### 插入动画
1. 新元素出现在数组末尾（树的最后一层最右边）
2. 新元素与父节点比较，如果违反堆性质则交换
3. 重复步骤 2 直到堆性质恢复或到达根节点

### 取最值动画
1. 堆顶元素（最大/最小值）被高亮标记并移除
2. 最后一个元素移到堆顶
3. 与子节点比较，与较大/较小的子节点交换
4. 重复步骤 3 直到堆性质恢复或到达叶子节点

### 控制功能
- **播放/暂停**：控制动画播放
- **速度调节**：调整动画速度
- **重置**：恢复到初始状态

## 常见错误

### 1. 混淆父子节点索引公式

```
❌ 错误：索引从 1 开始的公式用在了从 0 开始的数组上
父节点: Math.floor(i / 2)     // 这是索引从 1 开始的公式！

✅ 正确：索引从 0 开始
父节点: Math.floor((i - 1) / 2)
左子节点: 2 * i + 1
右子节点: 2 * i + 2
```

### 2. 删除堆顶后忘记下沉

```
❌ 错误：移除堆顶后直接返回，不调整堆
extractMax() {
  const max = this.data[0]
  this.data[0] = this.data.pop()  // 只替换，没有下沉！
  return max
}

✅ 正确：替换后必须下沉
extractMax() {
  const max = this.data[0]
  this.data[0] = this.data.pop()
  this.siftDown(0)  // 必须下沉恢复堆性质
  return max
}
```

### 3. 数组越界问题

```
❌ 错误：下沉时没有检查子节点是否越界
siftDown(i) {
  const left = 2 * i + 1
  if (this.data[left] > this.data[i]) { ... }  // left 可能越界！

✅ 正确：先检查子节点索引是否有效
siftDown(i) {
  const left = 2 * i + 1
  if (left >= this.size) return  // 没有子节点，停止
  // ...
}
```

### 4. 只比较一个子节点

```
❌ 错误：下沉时只与左子节点比较
if (this.data[left] > this.data[i]) {
  swap(i, left)  // 可能右子节点更大！
}

✅ 正确：找到较大的子节点再比较
let larger = left
if (right < this.size && this.data[right] > this.data[left]) {
  larger = right
}
if (this.data[larger] > this.data[i]) {
  swap(i, larger)
}
```

## 实际应用

### 1. 任务调度系统

操作系统使用优先队列管理进程调度，优先级高的进程先执行：

```typescript
interface Task {
  name: string
  priority: number  // 数字越大优先级越高
}

class TaskScheduler {
  private heap: Task[] = []

  addTask(task: Task): void {
    this.heap.push(task)
    this.siftUp(this.heap.length - 1)
  }

  getNextTask(): Task | undefined {
    if (this.heap.length === 0) return undefined
    const task = this.heap[0]
    this.heap[0] = this.heap[this.heap.length - 1]
    this.heap.pop()
    this.siftDown(0)
    return task
  }
}
```

### 2. 合并 K 个有序链表

使用最小堆高效合并 K 个有序链表，时间复杂度 O(N log K)：

```typescript
function mergeKLists(lists: ListNode[]): ListNode {
  const minHeap = new MinHeap<ListNode>((a, b) => a.val - b.val)

  // 将每个链表的头节点加入堆
  for (const list of lists) {
    if (list) minHeap.insert(list)
  }

  const dummy = new ListNode(0)
  let current = dummy

  while (minHeap.size > 0) {
    const node = minHeap.extract()!
    current.next = node
    current = current.next
    if (node.next) minHeap.insert(node.next)
  }

  return dummy.next
}
```

### 3. Top-K 问题

从 N 个元素中找出最大的 K 个，使用大小为 K 的最小堆，时间复杂度 O(N log K)：

```typescript
function topK(arr: number[], k: number): number[] {
  const minHeap = new MinHeap()

  for (const num of arr) {
    if (minHeap.size < k) {
      minHeap.insert(num)
    } else if (num > minHeap.peek()!) {
      minHeap.extract()
      minHeap.insert(num)
    }
  }

  return minHeap.toArray().sort((a, b) => b - a)
}
```

### 4. 数据流中位数维护

使用一个最大堆存较小的一半，一个最小堆存较大的一半：

```typescript
class MedianFinder {
  private maxHeap = new MaxHeap()  // 存较小的一半
  private minHeap = new MinHeap()  // 存较大的一半

  addNum(num: number): void {
    this.maxHeap.insert(num)
    this.minHeap.insert(this.maxHeap.extract()!)

    // 保持 maxHeap.size >= minHeap.size
    if (this.minHeap.size > this.maxHeap.size) {
      this.maxHeap.insert(this.minHeap.extract()!)
    }
  }

  findMedian(): number {
    if (this.maxHeap.size > this.minHeap.size) {
      return this.maxHeap.peek()!
    }
    return (this.maxHeap.peek()! + this.minHeap.peek()!) / 2
  }
}
```

### 5. Dijkstra 最短路径算法

使用最小堆高效选择下一个距离最短的未访问节点：

```typescript
function dijkstra(graph: number[][], start: number): number[] {
  const dist = new Array(graph.length).fill(Infinity)
  dist[start] = 0
  const minHeap = new MinHeap<[number, number]>((a, b) => a[1] - b[1])
  minHeap.insert([start, 0])

  while (minHeap.size > 0) {
    const [u, d] = minHeap.extract()!
    if (d > dist[u]) continue

    for (let v = 0; v < graph[u].length; v++) {
      if (graph[u][v] > 0) {
        const newDist = dist[u] + graph[u][v]
        if (newDist < dist[v]) {
          dist[v] = newDist
          minHeap.insert([v, newDist])
        }
      }
    }
  }

  return dist
}
```

## 总结

堆是一种高效的数据结构，核心要点如下：

- **本质**：满足堆性质的完全二叉树，可紧凑地用数组表示
- **两种类型**：最大堆（父 >= 子）和最小堆（父 <= 子）
- **核心操作**：插入 O(log n)、取最值 O(log n)、查看最值 O(1)
- **建堆**：自底向上下沉，O(n) 时间复杂度
- **数组索引**：父节点 (i-1)/2，左子 2i+1，右子 2i+2（从 0 开始）
- **关键操作**：上浮（插入时）和下沉（删除时）是维护堆性质的核心
- **广泛应用**：优先队列、堆排序、Top-K、中位数维护、图算法

掌握堆的原理和实现，是理解许多高级算法和系统设计的基础。堆排序、优先队列、以及各种基于堆的优化技巧，在面试和实际开发中都有高频出现。理解数组与树之间的映射关系，也是学习更复杂树形数据结构的重要基础。
