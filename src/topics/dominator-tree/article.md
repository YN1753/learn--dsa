# 支配树 (Dominator Tree)

## 概念解释

### 支配关系

在有向图中，给定一个**起点 s**（entry node），如果从 s 到节点 b 的**所有路径**都必须经过节点 a，则称 **a 支配 b**（a dominates b），记作 a dom b。

```
      s
     / \
    v   w
     \ /
      b       s dom v, s dom w, s dom b
              v dom b（从 s 到 b 的所有路径经过 v？不一定）
```

更精确地说：
- **每个节点都支配自身**（自反性）
- **起点 s 支配所有从 s 可达的节点**
- 支配关系具有**传递性**：若 a dom b 且 b dom c，则 a dom c
- 支配关系具有**反对称性**：若 a dom b 且 b dom a，则 a = b

### 直接支配者 (Immediate Dominator, idom)

节点 b 的**直接支配者** idom(b) 是支配 b 的所有节点中，**离 b 最近**的那个。换句话说：
- idom(b) 支配 b
- 不存在其他节点 c，使得 idom(b) 支配 c 且 c 支配 b

直接支配者关系形成一棵以 s 为根的树，这就是**支配树**。

### 支配树

支配树是一棵有根树，其中：
- 根节点是起点 s
- 每个节点的父节点是它的直接支配者
- 节点 a 在支配树中的**祖先**恰好是所有支配 a 的节点

```
原图:                    支配树:
  s → a → c              s
  s → b → c              / \
  a → d                  a   b
  b → d                  |   |
  c → d                  c   d
                         |
                         d
```

## 为什么重要

### 1. 编译器优化

支配树是编译器进行**控制流分析**的基础工具：
- **循环识别**：自然循环的头节点支配回边的尾节点
- **SSA 构建**：静态单赋值形式需要支配树来确定 phi 函数的插入位置
- **代码移动**：通过支配树判断表达式是否可以在不同基本块间移动
- **公共子表达式消除**：利用支配关系确定表达式的可用范围

### 2. 程序分析

- **程序切片**：通过支配树确定哪些语句影响特定程序点
- **数据流分析**：支配树提供高效的迭代分析框架
- **死代码消除**：识别不可达代码

### 3. 网络与图论

- **关键节点识别**：在交通网络、通信网络中找到必经节点
- **可靠性分析**：移除支配节点会断开网络
- **竞赛图论**：支配树是许多图论问题的关键工具

### 4. 生物信息学

- **基因调控网络**：识别关键调控基因
- **代谢网络分析**：找到代谢路径中的瓶颈节点

## 核心原理

### Lengauer-Tarjan 算法

Lengauer-Tarjan 算法是计算支配树最经典的算法，由 Thomas Lengauer 和 Robert Endre Tarjan 于 1979 年提出。

#### 算法概述

算法分为三个阶段：
1. **DFS 遍历**：对图进行深度优先搜索，为每个节点分配 DFS 序
2. **计算半支配点**：对每个节点计算其半支配点 sdom
3. **推导直接支配者**：通过半支配点和并查集推导出每个节点的 idom

#### 第一阶段：DFS 遍历

从起点 s 开始进行 DFS，为每个节点分配一个 DFS 序（dfn）：

```
DFS 序分配示例：
     s(1)
    / \
   a(2) b(3)
   |   |
   c(4) d(5)
    \ /
     e(6)
```

关键数据结构：
- `dfn[v]`：节点 v 的 DFS 序
- `vertex[i]`：DFS 序为 i 的节点（vertex 的逆映射）
- `parent[v]`：DFS 树中 v 的父节点

#### 第二阶段：计算半支配点

**半支配点的定义**：

sdom(v) = min{ u | 存在路径 u = v_0 → v_1 → ... → v_k = v，使得 dfn[v_i] > dfn[v] 对所有 1 <= i <= k-1 成立 }

直观理解：sdom(v) 是所有能通过一条「只经过 DFS 序大于 v 的中间节点」的路径到达 v 的节点中，DFS 序最小的那个。

**计算方法**：

对每个节点 v，遍历所有指向 v 的入边 (u, v)：
- 如果 dfn[u] < dfn[v]：sdom(v) = min(sdom(v), u)
- 如果 dfn[u] > dfn[v]：对 u 的所有祖先 a（满足 dfn[sdom(a)] >= dfn[v]），sdom(v) = min(sdom(v), sdom(a))

这个过程使用**并查集**来高效实现路径压缩。

#### 第三阶段：推导直接支配者

关键定理：对于节点 v（v != s），设 u = sdom(v)：
- 如果 u == sdom(v)，则 idom(v) = u（当 u 是 v 的半支配点，且 u 就是直接支配者）
- 否则，idom(v) = idom(w)，其中 w 是 v 的祖先中满足 dfn[sdom(w)] >= dfn[sdom(v)] 的最浅节点

最终，对所有节点按 DFS 序从小到大处理，利用并查集的路径压缩特性，可以高效地确定每个节点的直接支配者。

#### 伪代码

```
算法 LengauerTarjan(G, s):
  // 第一阶段：DFS
  DFS(s)，记录 dfn, vertex, parent

  // 第二阶段：计算半支配点
  初始化 sdom[v] = v 对所有 v
  for v 按 DFS 序从大到小:
    for (u, v) in 入边:
      if dfn[u] < dfn[v]:
        sdom[v] = min(sdom[v], u)
      else:
        sdom[v] = min(sdom[v], sdom(eval(u)))
    link(parent[v], v)

  // 第三阶段：推导直接支配者
  for v 按 DFS 序从小到大（跳过 s）:
    if sdom[v] == sdom[vertex[semi[v]]]:
      idom[v] = sdom[v]
    else:
      idom[v] = idom[vertex[semi[v]]]
```

#### 时间复杂度

| 步骤 | 时间复杂度 | 说明 |
|------|------------|------|
| DFS 遍历 | O(n + m) | 标准 DFS |
| 计算半支配点 | O((n + m) * alpha(n)) | 使用并查集优化 |
| 推导直接支配者 | O(n * alpha(n)) | 并查集路径压缩 |
| **总计** | **O((n + m) * alpha(n))** | alpha 是反阿克曼函数，实际近似线性 |

### 简化算法（直接法）

对于小规模图，可以使用更直观的方法：

```
算法 SimpleDominator(G, s):
  计算每个节点的支配集：Dom(v) = {所有支配 v 的节点}
  for v in V:
    Dom(v) = V  // 初始化为所有节点
  Dom(s) = {s}
  changed = true
  while changed:
    changed = false
    for v in V \ {s}:
      newDom = {s} ∪ ∩_{u ∈ pred(v)} Dom(u)
      if newDom != Dom(v):
        Dom(v) = newDom
        changed = true
  // 从 Dom 集合推导 idom
  for v in V \ {s}:
    idom(v) = Dom(v) 中离 v 最近的节点
```

时间复杂度：O(n^2 * m)，适合小规模图。

## 可视化说明

在可视化界面中，支配树的构建过程通过动画展示：

1. **原图展示**：显示有向图的节点和边，标注起点
2. **DFS 遍历**：依次高亮 DFS 访问的节点，标注 DFS 序
3. **半支配点计算**：对每个节点展示其半支配点的计算过程
4. **支配树构建**：逐步连接 idom 边，形成支配树
5. **结果展示**：同时显示原图和支配树，高亮支配关系

通过动画控制栏，你可以：
- 播放 / 暂停动画
- 单步执行
- 调整动画速度
- 重置到初始状态

## 常见错误

### 1. 混淆支配关系的方向性

```typescript
// 错误理解：如果 a 支配 b，那么 a 在 b 的所有入路径上
// 实际上：a 支配 b 意味着从起点 s 到 b 的所有路径都经过 a
// 支配关系是相对于起点 s 定义的！

// 错误：改变起点后支配关系不变
// 正确：起点改变，支配关系完全改变
```

### 2. DFS 序计算错误

```typescript
// 错误：DFS 序分配不连续或有遗漏
function dfs(graph: number[][], s: number): number[] {
  const dfn = new Array(graph.length).fill(-1)
  let counter = 0
  const visited = new Set<number>()

  function traverse(v: number) {
    visited.add(v)
    dfn[v] = counter++  // 正确：按访问顺序分配
    for (const u of graph[v]) {
      if (!visited.has(u)) {
        traverse(u)
      }
    }
  }

  traverse(s)
  return dfn
}

// 常见错误：在递归之前就分配了 dfn，或者忘记标记 visited
```

### 3. 半支配点和直接支配者关系搞混

```typescript
// 错误：认为半支配点就是直接支配者
// 实际上：idom(v) 可能不等于 sdom(v)

// 例如：
//   s → a → c
//   s → b → c
// sdom(c) = s（从 s 到 c 的最短路径经过 s）
// idom(c) = s（s 支配 c，且没有其他节点在 s 和 c 之间支配 c）

// 但在某些图中：
//   s → a → b → c
//   s → c
// sdom(c) = s
// idom(c) = s（因为 s 直接支配 c，不需要经过 a 或 b）
```

### 4. 并查集路径压缩时机错误

```typescript
// 错误：在计算半支配点之前就进行路径压缩
// 正确：在 eval 函数中使用带路径压缩的并查集，
//       但 link 操作必须在处理完当前节点之后

// 关键：eval(u) 返回 u 到根路径上，sdom 值最小的祖先
// 这需要并查集的特殊实现，不是标准的 union-find
```

### 5. 忘记处理不可达节点

```typescript
// 错误：假设所有节点都从起点可达
// 正确：不可达节点不在支配树中
// 在 DFS 阶段，只访问从 s 可达的节点
// 不可达节点的 idom 未定义
```

## 实际应用

### 1. 编译器控制流图优化

编译器将程序表示为**控制流图（CFG）**，支配树用于：

```typescript
// 识别自然循环
// 自然循环定义：回边 (a, b) 满足 b 支配 a
// 回边的目标 b 就是循环头
function findNaturalLoops(cfg: CFG): Loop[] {
  const domTree = buildDominatorTree(cfg)
  const loops: Loop[] = []

  for (const edge of cfg.edges) {
    const [a, b] = edge
    // 如果 b 支配 a，则 (a, b) 是回边
    if (domTree.dominates(b, a)) {
      loops.push(extractLoop(cfg, a, b))
    }
  }
  return loops
}
```

### 2. SSA 形式构建

静态单赋值（SSA）是现代编译器的核心中间表示：
- 每个变量只被赋值一次
- phi 函数插入在**支配边界**处
- 支配边界通过支配树高效计算

### 3. 网络关键节点分析

在通信网络或交通网络中：
- 支配节点是网络的**关键节点**
- 移除支配节点会导致部分网络不可达
- 用于网络脆弱性分析和冗余设计

```typescript
// 找到网络中的关键节点
function findCriticalNodes(network: Graph, entry: number): number[] {
  const domTree = buildDominatorTree(network, entry)
  // 支配树中度数高的节点是关键节点
  return domTree.nodes.filter(n => domTree.children(n).length > 2)
}
```

### 4. 程序切片

程序切片是提取程序中影响特定变量在特定点的值的所有语句：
- 后向切片：利用支配树确定哪些定义影响特定使用
- 前向切片：利用支配树的性质确定影响范围

### 5. 竞赛图论

在算法竞赛中，支配树常用于：
- **必经点问题**：找到从 s 到 t 的所有路径都经过的节点
- **关键边问题**：找到所有路径都经过的边（桥）
- **网络可靠性**：计算移除节点后 s-t 连通性的变化

## 总结

支配树是一种强大的图论工具，核心要点：

**基本概念**：
- 支配关系：从起点到目标的所有路径都经过的节点
- 直接支配者：支配目标的最近祖先
- 支配树：由直接支配者关系形成的有根树

**核心算法**：
- Lengauer-Tarjan 算法：O((n + m) * alpha(n))，几乎线性
- 三阶段流程：DFS -> 半支配点 -> 直接支配者
- 并查集优化是实现高效算法的关键

**应用场景**：
- 编译器控制流分析和优化
- SSA 形式构建
- 网络关键节点识别
- 程序切片和数据流分析
- 竞赛图论问题

**学习建议**：
- 先理解支配关系的定义和性质
- 用小图手动模拟 Lengauer-Tarjan 算法
- 结合可视化工具观察支配树的构建过程
- 在实际问题中练习应用支配树

支配树虽然概念抽象，但掌握后会成为解决图论和程序分析问题的利器。
