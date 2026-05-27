# 强连通分量 (Strongly Connected Components)

## 概念解释

在有向图中，**强连通分量**（Strongly Connected Component，简称 SCC）是指一个极大的顶点子集，其中任意两个顶点都**互相可达**。

具体来说，对于有向图 G = (V, E) 中的一个顶点集合 S：
- 对于 S 中的任意两个顶点 u 和 v，都存在从 u 到 v 的路径
- 同时也存在从 v 到 u 的路径
- S 是满足上述条件的极大集合（不能再加入更多顶点）

### 直观理解

想象一群人之间的电话关系：
- 如果 A 能打电话给 B，B 也能打电话给 A，那么 A 和 B 是「互相可达」的
- 如果一群人中，每个人都能打电话给其他任何人，那这群人就构成一个「强连通分量」

```
有向图示例：
  1 → 2 → 3 → 1    ← {1, 2, 3} 互相可达，构成 SCC
  3 → 4
  4 → 5 → 4        ← {4, 5} 互相可达，构成 SCC
  5 → 6             ← {6} 单独构成 SCC
```

### 基本术语

| 术语 | 说明 |
|------|------|
| 强连通 (Strongly Connected) | 有向图中任意两个顶点互相可达 |
| 强连通分量 (SCC) | 极大的强连通子图 |
| 缩点 (Condensation) | 将每个 SCC 缩成一个点 |
| 分量图 (Component Graph / DAG) | 缩点后得到的有向无环图 |
| dfn (Discovery Time) | DFS 中节点被首次访问的时间戳 |
| low-link | 节点通过子树和回边能到达的最小时间戳 |

## 为什么重要

强连通分量是图论中的核心概念，具有广泛的应用：

1. **图的结构分析**：SCC 将复杂的有向图分解为更简单的结构，帮助理解图的整体拓扑
2. **简化问题**：通过缩点，将有向图转化为 DAG，许多图论问题在 DAG 上更容易求解
3. **2-SAT 问题**：SCC 是解决 2-SAT 可满足性问题的核心工具
4. **编译器优化**：检测程序中的循环依赖关系
5. **社交网络分析**：发现紧密联系的社群
6. **网页聚类**：搜索引擎利用 SCC 分析网页之间的链接关系

## 核心原理

### 算法一：Tarjan 算法

Tarjan 算法由 Robert Tarjan 于 1972 年提出，只需**一次 DFS** 即可找到所有 SCC。

#### 核心思想

在 DFS 过程中维护两个关键数组：
- **dfn[u]**：节点 u 被首次访问的时间戳
- **low[u]**：从 u 出发，通过其子树中的节点和最多一条回边，能够到达的最小时间戳

当一个节点 u 满足 `dfn[u] == low[u]` 时，u 就是某个 SCC 的「根」，此时栈中从栈顶到 u 之间的所有节点构成一个完整的 SCC。

#### 算法步骤

```typescript
function tarjan(n: number, graph: number[][]): number[][] {
  let timer = 0
  const dfn = new Array(n + 1).fill(0)
  const low = new Array(n + 1).fill(0)
  const inStack = new Array(n + 1).fill(false)
  const stack: number[] = []
  const sccs: number[][] = []

  function dfs(u: number) {
    timer++
    dfn[u] = low[u] = timer  // 初始化 dfn 和 low
    stack.push(u)             // 入栈
    inStack[u] = true

    for (const v of graph[u]) {
      if (dfn[v] === 0) {
        // v 未访问：递归访问
        dfs(v)
        low[u] = Math.min(low[u], low[v])
      } else if (inStack[v]) {
        // v 在栈中：说明有回边
        low[u] = Math.min(low[u], dfn[v])
      }
    }

    // u 是 SCC 的根
    if (dfn[u] === low[u]) {
      const scc: number[] = []
      let node: number
      do {
        node = stack.pop()!
        inStack[node] = false
        scc.push(node)
      } while (node !== u)
      sccs.push(scc)
    }
  }

  for (let i = 1; i <= n; i++) {
    if (dfn[i] === 0) dfs(i)
  }

  return sccs
}
```

#### 运行示例

对于图 `1→2, 2→3, 3→1, 3→4, 4→5, 5→4`：

```
DFS 过程：
  访问 1: dfn=1, low=1, 入栈 [1]
    访问 2: dfn=2, low=2, 入栈 [1,2]
      访问 3: dfn=3, low=3, 入栈 [1,2,3]
        邻居 1: 在栈中, low[3]=min(3,1)=1
        访问 4: dfn=4, low=4, 入栈 [1,2,3,4]
          访问 5: dfn=5, low=5, 入栈 [1,2,3,4,5]
            邻居 4: 在栈中, low[5]=min(5,4)=4
          回溯到 5: dfn[5]=5!=low[5]=4, 不是根
        回溯到 4: dfn[4]=4==low[4]=4, 是根！
          弹出: {5, 4}  ← SCC #1
      回溯到 3: low[3]=1
    回溯到 2: low[2]=1
  回溯到 1: dfn[1]=1==low[1]=1, 是根！
    弹出: {3, 2, 1}  ← SCC #2
```

**时间复杂度**：O(V + E)，其中 V 是顶点数，E 是边数

### 算法二：Kosaraju 算法

Kosaraju 算法思路更直观，需要**两次 DFS**。

#### 核心思想

1. 第一次 DFS：对原图进行后序遍历，记录节点的完成顺序
2. 构建反向图：将所有边反向
3. 第二次 DFS：在反向图上，按照第一次得到的逆序进行 DFS，每次 DFS 访问到的节点构成一个 SCC

#### 为什么有效？

关键观察：如果一个 SCC 在反向图中能「逃出去」到达另一个 SCC，那么在原图中另一个 SCC 一定能到达这个 SCC。按完成时间的逆序遍历，保证了我们总是先处理「出度方向」的 SCC。

```typescript
function kosaraju(n: number, graph: number[][]): number[][] {
  const visited = new Array(n + 1).fill(false)
  const order: number[] = []  // 完成时间顺序
  const sccs: number[][] = []

  // 第一次 DFS：后序遍历
  function dfs1(u: number) {
    visited[u] = true
    for (const v of graph[u]) {
      if (!visited[v]) dfs1(v)
    }
    order.push(u)
  }

  // 构建反向图
  const reverseGraph: number[][] = Array.from({ length: n + 1 }, () => [])
  for (let u = 1; u <= n; u++) {
    for (const v of graph[u]) {
      reverseGraph[v].push(u)
    }
  }

  // 第二次 DFS：在反向图上按逆序遍历
  const component: number[] = []
  function dfs2(u: number) {
    visited[u] = true
    component.push(u)
    for (const v of reverseGraph[u]) {
      if (!visited[v]) dfs2(v)
    }
  }

  // 执行第一次 DFS
  for (let i = 1; i <= n; i++) {
    if (!visited[i]) dfs1(i)
  }

  // 按逆序执行第二次 DFS
  visited.fill(false)
  for (let i = order.length - 1; i >= 0; i--) {
    if (!visited[order[i]]) {
      component.length = 0
      dfs2(order[i])
      sccs.push([...component])
    }
  }

  return sccs
}
```

**时间复杂度**：O(V + E)

### 两种算法对比

| 特性 | Tarjan | Kosaraju |
|------|--------|----------|
| DFS 次数 | 1 次 | 2 次 |
| 需要反向图 | 不需要 | 需要 |
| 额外空间 | 栈 + 数组 | 反向图 + 数组 |
| 实现难度 | 中等 | 较简单 |
| 实际性能 | 通常更快 | 稍慢（需要构建反向图） |

### 缩点（构建 SCC DAG）

找到所有 SCC 后，将每个 SCC 缩成一个点，得到的图称为**分量图**或**缩点图**。

```typescript
function buildCondensation(
  n: number,
  graph: number[][],
  sccs: number[][]
): number[][] {
  // 为每个节点分配其所属的 SCC 编号
  const sccId = new Array(n + 1).fill(0)
  sccs.forEach((scc, index) => {
    for (const node of scc) {
      sccId[node] = index
    }
  })

  // 构建缩点图
  const dag: number[][] = Array.from({ length: sccs.length }, () => [])
  const edges = new Set<string>()

  for (let u = 1; u <= n; u++) {
    for (const v of graph[u]) {
      if (sccId[u] !== sccId[v]) {
        const key = `${sccId[u]}-${sccId[v]}`
        if (!edges.has(key)) {
          edges.add(key)
          dag[sccId[u]].push(sccId[v])
        }
      }
    }
  }

  return dag
}
```

缩点后的 DAG 具有重要性质：
- 不存在环（否则那些 SCC 应该合并）
- 保留了原图的可达性关系
- 许多图论问题可以在 DAG 上更高效地求解

## 可视化说明

在可视化界面中，你可以直观地观察 Tarjan 算法的执行过程：

- **节点颜色**：不同颜色表示不同状态
  - 灰色：未访问
  - 蓝色：正在访问（在栈中）
  - 绿色：已确定属于某个 SCC
- **箭头**：表示有向边
- **栈显示**：右侧实时显示当前栈中的节点
- **dfn/low 值**：每个节点上显示其 dfn 和 low 值

通过控制栏，你可以：
- 逐步执行算法，观察每一步的变化
- 播放/暂停动画
- 调整动画速度
- 重置到初始状态

## 常见错误

### 1. 混淆回边和前向边

```typescript
// 错误：所有已访问的邻居都更新 low 值
if (dfn[v] !== 0) {
  low[u] = Math.min(low[u], dfn[v])  // 错误！
}

// 正确：只有在栈中的邻居才能更新 low 值
if (dfn[v] !== 0 && inStack[v]) {
  low[u] = Math.min(low[u], dfn[v])  // 正确
}
```

已访问但不在栈中的节点属于已处理完的 SCC，不能用来更新当前节点的 low 值。

### 2. 使用 low[v] 而不是 dfn[v] 更新

```typescript
// 错误：用 low[v] 更新
low[u] = Math.min(low[u], low[v])  // 对回边来说是错误的

// 正确：回边用 dfn[v]，树边用 low[v]
if (dfn[v] === 0) {
  dfs(v)
  low[u] = Math.min(low[u], low[v])   // 树边：用 low[v]
} else if (inStack[v]) {
  low[u] = Math.min(low[u], dfn[v])   // 回边：用 dfn[v]
}
```

### 3. 弹栈条件错误

```typescript
// 错误：弹出到 v 而不是 u
do {
  node = stack.pop()!
  scc.push(node)
} while (node !== v)  // 错误！应该是 u

// 正确：弹出到当前根节点 u
do {
  node = stack.pop()!
  inStack[node] = false
  scc.push(node)
} while (node !== u)  // 正确
```

### 4. 忘记标记 inStack

```typescript
// 错误：入栈时忘记标记
stack.push(u)
// 忘记 inStack[u] = true

// 正确：入栈时必须标记
stack.push(u)
inStack[u] = true

// 出栈时也必须取消标记
node = stack.pop()!
inStack[node] = false
```

### 5. 图不连通时的处理

```typescript
// 错误：只从节点 1 开始 DFS
dfs(1)  // 如果图不连通，会漏掉其他 SCC

// 正确：对每个未访问的节点都启动 DFS
for (let i = 1; i <= n; i++) {
  if (dfn[i] === 0) {
    dfs(i)
  }
}
```

## 实际应用

### 1. 2-SAT 问题

2-SAT 是一个经典的可满足性问题：给定若干个形如 `(a OR b)` 的条件，判断是否存在满足所有条件的赋值。

**SCC 在 2-SAT 中的应用**：
- 将每个布尔变量 x 拆成两个节点：x（为真）和 ¬x（为假）
- 对于条件 `(a OR b)`，添加边 `¬a → b` 和 `¬b → a`
- 如果 x 和 ¬x 在同一个 SCC 中，则无解
- 否则存在解，可以根据 SCC 在 DAG 中的拓扑序确定赋值

### 2. 编译器中的循环检测

编译器在优化代码时需要检测函数之间的循环调用：

```
函数调用关系：
  main → foo → bar → foo  ← {foo, bar} 构成循环
  main → baz → end

SCC 分析结果：
  SCC {foo, bar}：循环调用，需要特殊处理（如内联优化）
  SCC {main}, SCC {baz}, SCC {end}：无循环
```

### 3. 社交网络分析

在社交网络中，SCC 可以发现紧密联系的社群：
- 将用户视为顶点，关注关系视为有向边
- 大的 SCC 表示一群互相关注的用户
- 帮助推荐「你可能感兴趣的人」

### 4. 网页聚类

搜索引擎利用网页间的超链接关系进行聚类：
- 网页 A 链接到网页 B，表示为有向边 A → B
- 同一 SCC 中的网页主题相关性高
- 缩点后的 DAG 反映了不同主题之间的层次关系

### 5. 电路分析

在数字电路中，SCC 用于检测反馈环路：
- 逻辑门之间的连接构成有向图
- SCC 中的门电路存在组合反馈
- 需要特殊处理（如插入锁存器）以避免不稳定状态

## 总结

强连通分量是图论中的核心概念，理解它对于掌握更高级的图算法至关重要：

**核心要点**：
- SCC 是有向图中互相可达的最大顶点子集
- Tarjan 算法：一次 DFS，利用 dfn 和 low-link 值识别 SCC 的根
- Kosaraju 算法：两次 DFS，先在原图后序遍历，再在反向图按逆序遍历
- 缩点后得到的 DAG 保留了原图的可达性关系

**算法选择**：
- 追求效率：选择 Tarjan 算法（只需一次 DFS）
- 追求简洁：选择 Kosaraju 算法（思路更直观）
- 两者时间复杂度都是 O(V + E)

**应用场景**：
- 2-SAT 问题求解
- 编译器循环检测
- 社交网络社群发现
- 网页聚类
- 电路反馈环路分析

掌握 SCC 算法，是深入学习图论的重要一步。它不仅是独立的算法，更是解决许多复杂问题的基础工具。
