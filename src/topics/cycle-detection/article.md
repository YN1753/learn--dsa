# 环检测 (Cycle Detection)

## 概念解释

环检测是图论和数据结构中的一个基本问题：给定一个图或链表，判断其中是否存在环（即从某个节点出发，沿着边走能回到自身）。

环在实际问题中意味着：
- **循环依赖**：任务A依赖B，B依赖C，C又依赖A，形成死锁
- **无限循环**：程序遍历数据结构时永远无法终止
- **资源泄漏**：内存中的对象互相引用，垃圾回收器无法释放

环检测的核心方法有：
- **DFS三色标记法**（有向图）
- **DFS+父节点判断**（无向图）
- **Floyd快慢指针**（链表）
- **拓扑排序**（有向图）

## 为什么重要

环检测在计算机科学中有广泛应用：

1. **编译器设计**：检测模块间的循环依赖
2. **操作系统**：检测死锁（进程间的循环等待）
3. **版本控制**：检测依赖图中的循环引用
4. **数据库**：检测外键引用中的循环
5. **任务调度**：检测任务间的循环依赖
6. **垃圾回收**：引用计数法需要处理循环引用

## 核心原理

### 1. 有向图 - DFS三色标记法

三色标记法是检测有向图环的经典方法，使用三种颜色标记节点状态：

| 颜色 | 含义 | 说明 |
|------|------|------|
| 白色 | 未访问 | 节点尚未被处理 |
| 灰色 | 访问中 | 节点正在被处理（在当前递归栈中） |
| 黑色 | 已完成 | 节点及其所有后代都已处理完毕 |

**核心思想**：如果DFS过程中遇到灰色节点，说明找到了一条指向祖先的回边（back edge），即存在环。

```typescript
enum Color { WHITE, GRAY, BLACK }

function hasCycleDirected(adj: number[][], n: number): boolean {
  const color: Color[] = new Array(n).fill(Color.WHITE)

  function dfs(u: number): boolean {
    color[u] = Color.GRAY  // 标记为访问中
    for (const v of adj[u]) {
      if (color[v] === Color.GRAY) return true   // 遇到灰色节点，有环
      if (color[v] === Color.WHITE && dfs(v)) return true
    }
    color[u] = Color.BLACK  // 标记为已完成
    return false
  }

  for (let i = 0; i < n; i++) {
    if (color[i] === Color.WHITE && dfs(i)) return true
  }
  return false
}
```

**时间复杂度**：O(V + E)
**空间复杂度**：O(V)

### 2. 无向图 - DFS + 父节点判断

无向图中，每条边会被遍历两次。关键在于区分「回边」和「回到父节点的边」。

```typescript
function hasCycleUndirected(adj: number[][], n: number): boolean {
  const visited = new Array(n).fill(false)

  function dfs(u: number, parent: number): boolean {
    visited[u] = true
    for (const v of adj[u]) {
      if (!visited[v]) {
        if (dfs(v, u)) return true
      } else if (v !== parent) {
        return true  // 已访问且不是父节点，有环
      }
    }
    return false
  }

  for (let i = 0; i < n; i++) {
    if (!visited[i] && dfs(i, -1)) return true
  }
  return false
}
```

**关键区别**：无向图中遇到已访问的邻居时，必须检查它是否是父节点。如果是父节点，只是正常回溯；如果不是父节点，说明有另一条路径到达该节点，即存在环。

### 3. 链表 - Floyd快慢指针

Floyd判圈算法（龟兔赛跑算法）用两个指针以不同速度遍历链表：

```typescript
function hasCycle(head: ListNode | null): boolean {
  let slow = head  // 慢指针：每次走1步
  let fast = head  // 快指针：每次走2步

  while (fast !== null && fast.next !== null) {
    slow = slow!.next
    fast = fast.next.next
    if (slow === fast) return true  // 相遇说明有环
  }
  return false  // 快指针到null，无环
}
```

**原理**：
- 如果无环：快指针先到达null
- 如果有环：快指针最终会追上慢指针（就像跑道上跑得快的人一定会套圈跑得慢的人）

**时间复杂度**：O(n)
**空间复杂度**：O(1) - 只用了两个指针

**进阶**：找到环的入口节点

```typescript
function detectCycle(head: ListNode | null): ListNode | null {
  let slow = head, fast = head

  // 第一步：找相遇点
  while (fast !== null && fast.next !== null) {
    slow = slow!.next
    fast = fast.next.next
    if (slow === fast) break
  }
  if (fast === null || fast.next === null) return null

  // 第二步：从头和相遇点同时走，再次相遇即为入口
  slow = head
  while (slow !== fast) {
    slow = slow!.next
    fast = fast!.next
  }
  return slow
}
```

### 4. 拓扑排序检测环

拓扑排序基于入度，不断移除入度为0的节点：

```typescript
function hasCycleTopological(adj: number[][], n: number): boolean {
  const inDegree = new Array(n).fill(0)
  for (const neighbors of adj) {
    for (const v of neighbors) inDegree[v]++
  }

  const queue: number[] = []
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i)
  }

  let sorted = 0
  while (queue.length > 0) {
    const u = queue.shift()!
    sorted++
    for (const v of adj[u]) {
      if (--inDegree[v] === 0) queue.push(v)
    }
  }

  return sorted !== n  // 有未处理的节点说明有环
}
```

**原理**：环中的节点互相依赖，入度永远不可能变为0，因此无法被移除。

**时间复杂度**：O(V + E)
**空间复杂度**：O(V)

## 可视化说明

在可视化界面中，你可以直观地观察DFS三色标记法的执行过程：

- **白色节点**：尚未被访问
- **灰色节点**：正在被访问（在当前DFS路径上）
- **黑色节点**：已完全处理
- **回边高亮**：当发现环时，形成环的边会被高亮显示

通过控制栏可以：
- 播放 / 暂停动画
- 单步执行
- 调整速度
- 重置到初始状态

## 常见错误

### 1. 无向图中忘记排除父节点

```typescript
// 错误：没有排除父节点，会误判
function wrongDFS(u: number): boolean {
  visited[u] = true
  for (const v of adj[u]) {
    if (visited[v]) return true  // 错误！可能是从v来的
    if (wrongDFS(v)) return true
  }
  return false
}

// 正确：传入父节点信息
function correctDFS(u: number, parent: number): boolean {
  visited[u] = true
  for (const v of adj[u]) {
    if (!visited[v]) {
      if (correctDFS(v, u)) return true
    } else if (v !== parent) {
      return true  // 已访问且不是父节点
    }
  }
  return false
}
```

### 2. 有向图中使用无向图的方法

```typescript
// 错误：有向图中用parent判断是不对的
// 有向图 0->1, 0->2, 1->2 不是环
// 但如果用无向图方法，从0到1再到2，2已被访问且不是0，会误判为环
```

有向图必须使用三色标记法或拓扑排序。

### 3. 快慢指针初始位置错误

```typescript
// 错误：快慢指针起始位置不同
let slow = head
let fast = head.next  // 错误！

// 正确：两个指针从同一位置出发
let slow = head
let fast = head
```

### 4. 忘记检查图的所有连通分量

```typescript
// 错误：只从节点0开始DFS
if (dfs(0, -1)) return true

// 正确：遍历所有未访问节点
for (let i = 0; i < n; i++) {
  if (!visited[i] && dfs(i, -1)) return true
}
```

## 实际应用

### 1. 编译器依赖检测

编译器在编译模块化代码时，需要检测模块间的依赖关系是否存在循环：

```typescript
// 检测模块依赖是否有环
// A依赖B，B依赖C，C依赖A -> 编译失败
function checkModuleDependencies(modules: Map<string, string[]>): boolean {
  // 使用拓扑排序检测循环依赖
  // 如果排序结果数量 < 模块数量，说明存在循环依赖
  return !hasCycleTopological(/* ... */)
}
```

### 2. 死锁检测

操作系统中，多个进程可能互相等待对方释放资源，形成死锁：

```typescript
// 进程P1持有R1，等待R2
// 进程P2持有R2，等待R1
// 形成环：P1 -> R2 -> P2 -> R1 -> P1
```

### 3. 版本控制合并冲突

Git等版本控制系统中，分支的合并历史可能形成复杂的有向图，需要检测是否存在循环合并。

### 4. 任务调度系统

在任务调度系统中，任务之间可能存在依赖关系。如果存在循环依赖，任务将永远无法完成：

```typescript
// 任务A需要等B完成，任务B需要等C完成，任务C需要等A完成
// 这是一个死锁，调度系统需要检测并报告
```

## 总结

环检测是图论中的基础算法，核心方法各有适用场景：

| 方法 | 适用场景 | 时间复杂度 | 空间复杂度 |
|------|----------|------------|------------|
| DFS三色标记 | 有向图 | O(V+E) | O(V) |
| DFS+父节点 | 无向图 | O(V+E) | O(V) |
| Floyd快慢指针 | 链表 | O(n) | O(1) |
| 拓扑排序 | 有向图（DAG判断） | O(V+E) | O(V) |

**选择建议**：
- 链表环检测：优先使用Floyd快慢指针，O(1)空间
- 有向图环检测：DFS三色标记或拓扑排序均可
- 无向图环检测：DFS+父节点判断
- 需要拓扑序的同时检测环：使用拓扑排序法

掌握环检测是理解图论算法、编译原理、操作系统等领域的基础。
