# 拓扑排序 (Topological Sort)

## 概念解释

拓扑排序是对**有向无环图（DAG, Directed Acyclic Graph）**中所有节点进行线性排序，使得对于图中的每一条有向边 (u, v)，节点 u 在排序结果中都出现在节点 v 的前面。

### 核心术语

- **有向无环图（DAG）**：所有边都有方向，且图中不存在任何环路的图。这是拓扑排序的前提条件。

- **拓扑序（Topological Order）**：满足上述约束的一种线性排列。一个 DAG 可能有多种合法的拓扑序。

- **入度（In-degree）**：指向某个节点的边的数量。入度为 0 的节点表示没有任何依赖，可以最先执行。

- **依赖约束（Prerequisite Constraint）**：边 (u, v) 表示 u 是 v 的前置条件，u 必须在 v 之前完成。

- **环（Cycle）**：从某个节点出发，沿着有向边可以回到自身的路径。有环的图无法进行拓扑排序。

### 拓扑排序的直观理解

想象你正在制定一个学习计划，课程之间有先修关系：

```
数学 → 线性代数 → 机器学习
  ↓
概率论 → 统计学
```

拓扑排序就是要找到一个合法的学习顺序，使得每门课的先修课程都排在它前面。可能的结果：
- 数学 → 概率论 → 线性代数 → 统计学 → 机器学习
- 数学 → 线性代数 → 概率论 → 统计学 → 机器学习

两种都是合法的拓扑序。

## 为什么重要

拓扑排序在计算机科学和工程中有极其广泛的应用：

### 任务调度

操作系统需要决定多个任务的执行顺序。当任务之间存在依赖关系时（比如任务 B 需要任务 A 的输出），拓扑排序可以给出一个合法的执行顺序。

### 构建系统

Makefile、Gradle、Maven 等构建工具需要确定源文件的编译顺序。如果模块 A 依赖模块 B，那么 B 必须先编译。拓扑排序自动处理这种依赖关系。

### 课程安排

大学的课程先修关系图就是一个典型的 DAG。教务系统需要利用拓扑排序来确定学生可以选修哪些课程，以及合理的课程开设顺序。

### 包依赖管理

npm、pip、Maven 等包管理器在安装依赖时，需要解析包之间的依赖关系图。拓扑排序确保按照正确的顺序安装包——被依赖的包先安装。

### 电子表格计算

在 Excel 或 Google Sheets 中，单元格之间可以互相引用（如 A1 = B1 + C1）。计算时需要按照拓扑排序的顺序求值，确保引用的单元格已经被计算过。

## 核心原理

### Kahn 算法（基于 BFS）

Kahn 算法是最直观的拓扑排序算法，基于入度和 BFS 思想。

**核心思想**：反复找到入度为 0 的节点（没有未处理的依赖），将它加入结果序列，然后删除它的所有出边（解除对其他节点的依赖）。

**算法步骤**：

1. 计算所有节点的入度
2. 将所有入度为 0 的节点加入队列
3. 当队列不为空时：
   - 取出队首节点 u，加入结果列表
   - 对于 u 的每个邻居 v：将 v 的入度减 1
   - 如果 v 的入度变为 0，将 v 加入队列
4. 如果结果列表长度等于节点总数，则排序成功
5. 否则，图中存在环，无法完成拓扑排序

```
示例图：课程依赖关系

    数学(0) ──→ 线性代数(1) ──→ 机器学习(2)
      │                            ↑
      └──→ 概率论(1) ──→ 统计学(2) ─┘

括号内为入度

步骤 1: 入度为 0 的节点: [数学]
        取出 数学，更新入度
        线性代数: 1→0，概率论: 1→0

步骤 2: 队列: [线性代数, 概率论]
        取出 线性代数，更新入度
        机器学习: 2→1

步骤 3: 取出 概率论，更新入度
        统计学: 2→1

步骤 4: 队列为空（机器学习入度=1，统计学入度=1）
        ???

修正：统计学入度应为 1（只有概率论指向它）
      机器学习入度应为 2（线性代数和统计学都指向它）

正确步骤：
步骤 1: 入度: 数学=0, 线性代数=1, 概率论=1, 统计学=1, 机器学习=2
        队列: [数学]，取出数学
        线性代数: 1→0，概率论: 1→0

步骤 2: 队列: [线性代数, 概率论]，取出线性代数
        机器学习: 2→1

步骤 3: 队列: [概率论]，取出概率论
        统计学: 1→0

步骤 4: 队列: [统计学]，取出统计学
        机器学习: 1→0

步骤 5: 队列: [机器学习]，取出机器学习

结果: 数学 → 线性代数 → 概率论 → 统计学 → 机器学习
```

### 基于 DFS 的拓扑排序

DFS 方法利用了后序遍历的特性：对于边 (u, v)，v 一定在 u 之前完成遍历。因此将后序遍历的结果反转，就得到拓扑序。

**算法步骤**：

1. 对图中的每个未访问节点进行 DFS
2. 在 DFS 中，先递归访问所有邻居
3. 当节点的所有邻居都访问完毕后，将该节点压入栈
4. 所有节点处理完后，将栈中的元素依次弹出，即为拓扑序

```typescript
function topoSortDFS(graph: Map<number, number[]>): number[] {
  const visited = new Set<number>()
  const inStack = new Set<number>()  // 检测环
  const stack: number[] = []
  let hasCycle = false

  function dfs(node: number): void {
    if (inStack.has(node)) {
      hasCycle = true  // 发现环
      return
    }
    if (visited.has(node)) return

    visited.add(node)
    inStack.add(node)

    for (const neighbor of graph.get(node) || []) {
      dfs(neighbor)
    }

    inStack.delete(node)
    stack.push(node)  // 后序入栈
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node)
    }
  }

  if (hasCycle) return []  // 有环，无拓扑序
  return stack.reverse()   // 反转得到拓扑序
}
```

### 环的检测

检测图中是否有环是拓扑排序的重要组成部分：

**Kahn 算法检测环**：如果算法结束后，结果列表中的节点数量小于图中总节点数，说明剩余节点的入度无法降为 0（它们在环中）。

**DFS 检测环**：在 DFS 过程中维护一个"递归栈"集合。如果访问到一个已经在递归栈中的节点，说明存在环（后向边）。

## 可视化说明

在可视化面板中，拓扑排序的过程以有向图的形式直观展示：

- **蓝色节点**：当前正在处理的节点
- **绿色节点**：已完成拓扑排序的节点（已加入结果列表）
- **灰色节点**：尚未处理的节点
- **红色节点/边**：被移除的边（依赖已解除）
- **节点旁的数字**：当前入度值
- **队列显示**：当前入度为 0 的待处理节点队列
- **结果栏**：按序显示已确定的拓扑排序结果

你可以通过控制栏逐步执行 Kahn 算法，观察每一步入度的变化和节点的移除过程。也可以切换图的示例，观察不同 DAG 的拓扑排序结果。

## 常见错误

### 1. 忘记检查环的存在

```typescript
// 错误：直接返回结果，不检查是否有环
function topoSort(graph: Map<number, number[]>, n: number): number[] {
  const inDegree = new Array(n).fill(0)
  // ... 计算入度，BFS 过程 ...
  return result  // 如果图有环，result 长度 < n！
}

// 正确：检查结果长度是否等于节点数
function topoSort(graph: Map<number, number[]>, n: number): number[] {
  const inDegree = new Array(n).fill(0)
  // ... 计算入度，BFS 过程 ...
  if (result.length !== n) {
    throw new Error('图中存在环，无法进行拓扑排序')
  }
  return result
}
```

### 2. 入度更新遗漏

```typescript
// 错误：只更新了部分邻居的入度
for (const neighbor of graph.get(node)!) {
  inDegree[neighbor]--
  // 忘记检查是否变为 0 并加入队列
}

// 正确：更新入度后，检查是否可以加入队列
for (const neighbor of graph.get(node)!) {
  inDegree[neighbor]--
  if (inDegree[neighbor] === 0) {
    queue.push(neighbor)
  }
}
```

### 3. DFS 中混淆"已访问"和"在递归栈中"

```typescript
// 错误：只用一个 visited 集合，无法正确检测环
const visited = new Set<number>()
function dfs(node: number): void {
  if (visited.has(node)) return  // 这样会错过环的检测！
  visited.add(node)
  // ...
}

// 正确：分别维护 visited 和 inRecursionStack
const visited = new Set<number>()
const inStack = new Set<number>()
function dfs(node: number): boolean {
  if (inStack.has(node)) return true   // 发现环
  if (visited.has(node)) return false  // 已处理过，跳过
  visited.add(node)
  inStack.add(node)
  for (const neighbor of graph.get(node) || []) {
    if (dfs(neighbor)) return true
  }
  inStack.delete(node)  // 回溯时移除
  result.push(node)
  return false
}
```

### 4. 初始化入度时遗漏边

```typescript
// 错误：遍历时搞反了方向
for (const [u, neighbors] of graph) {
  inDegree[u] += neighbors.length  // 这是出度，不是入度！
}

// 正确：对于边 u→v，v 的入度加 1
for (const [u, neighbors] of graph) {
  for (const v of neighbors) {
    inDegree[v]++
  }
}
```

## 实际应用

### Makefile 构建顺序

```makefile
# Makefile 中的依赖关系
app: main.o utils.o config.o
main.o: main.c utils.h
utils.o: utils.c utils.h
config.o: config.c

# 拓扑排序结果：
# 1. config.c → config.o
# 2. utils.c + utils.h → utils.o
# 3. main.c + utils.h → main.o
# 4. main.o + utils.o + config.o → app
```

### npm 依赖安装

当你运行 `npm install` 时，npm 会解析 `package.json` 中的依赖关系图，然后通过拓扑排序确定安装顺序。如果检测到循环依赖，npm 会发出警告。

### 课程规划系统

```typescript
// 大学课程先修关系
const prerequisites = new Map([
  ['数据结构', ['程序设计基础']],
  ['算法', ['数据结构', '离散数学']],
  ['操作系统', ['数据结构', '计算机组成']],
  ['数据库', ['数据结构']],
  ['计算机网络', ['操作系统']],
])

// 拓扑排序结果之一：
// 程序设计基础 → 离散数学 → 数据结构 → 计算机组成
// → 操作系统 → 数据库 → 算法 → 计算机网络
```

### 电子表格单元格计算

```typescript
// A1 = 10
// B1 = 20
// C1 = A1 + B1      (依赖 A1, B1)
// D1 = C1 * 2       (依赖 C1)
// E1 = C1 + D1      (依赖 C1, D1)

// 拓扑排序: A1 → B1 → C1 → D1 → E1
// 按此顺序计算，确保每次计算时引用的单元格已有值
```

### CI/CD 流水线

在持续集成系统中，项目的构建、测试、部署步骤之间存在依赖关系。拓扑排序可以确定各步骤的执行顺序，并识别可以并行执行的步骤（它们之间没有依赖关系）。

## 总结

拓扑排序是处理有向无环图中依赖关系的核心算法。以下是两种主要实现方式的对比：

| 特性 | Kahn 算法 (BFS) | DFS 方法 |
|------|-----------------|----------|
| 核心思想 | 反复移除入度为 0 的节点 | 后序遍历反转 |
| 环检测 | 结果长度 < 节点数 | 递归栈中重复访问 |
| 实现难度 | 较简单 | 中等 |
| 时间复杂度 | O(V + E) | O(V + E) |
| 空间复杂度 | O(V) | O(V) |
| 并行化 | 天然支持（多个入度 0 节点可同时处理） | 较难并行化 |

选择算法时的考虑因素：

1. **Kahn 算法**更适合需要逐步执行、可并行处理的场景（如任务调度）
2. **DFS 方法**更适合需要快速判断是否有环的场景
3. 两种算法的时间复杂度相同，选择取决于具体需求
4. 实际工程中，Kahn 算法更常用，因为它更直观且易于调试

拓扑排序是理解图论算法的重要入门，也是解决实际依赖排序问题的必备工具。
