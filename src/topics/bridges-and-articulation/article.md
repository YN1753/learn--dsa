# 桥与割点 (Bridges and Articulation Points)

## 概念解释

在一个无向图中，有些边和顶点对图的连通性起着至关重要的作用。删除它们会导致图「断开」。

### 桥 (Bridge / Cut Edge)

**桥**是一条边，如果删除它，图的连通分量数量会增加。换句话说，桥是两个连通区域之间唯一的连接通道。

```
    A --- B --- C
          |
          D

边 B-C 是桥：删除后 C 成为孤立点
边 A-B 也是桥：删除后 A 断开
边 B-D 也是桥：删除后 D 断开
```

### 割点 (Articulation Point / Cut Vertex)

**割点**是一个顶点，如果删除它（及其相连的所有边），图的连通分量数量会增加。割点是多个连通区域的「交汇点」。

```
    A --- B --- C
          |
          D

B 是割点：删除 B 后，A、C、D 互不相连
```

### 关键区别

| 概念 | 删除对象 | 影响 |
|------|----------|------|
| 桥 | 一条边 | 连通分量增加 |
| 割点 | 一个顶点 | 连通分量增加 |

## 为什么重要

桥和割点在实际应用中意义重大：

1. **网络可靠性**：桥代表网络中的「单点故障」链路，割点代表「单点故障」节点。识别它们有助于设计高可用网络
2. **交通规划**：桥是城市间的唯一通道，割点是交通枢纽。它们的失效会导致区域隔离
3. **社交网络**：割点是连接不同社交圈子的「关键人物」
4. **双连通分量**：桥和割点是分解双连通分量的基础

## 核心原理

### Tarjan 算法

Robert Tarjan 在 1974 年提出了基于 DFS 的高效算法来识别桥和割点。算法使用两个关键数组：

- **disc[u]**：节点 u 的发现时间（DFS 中第一次访问 u 的时间戳）
- **low[u]**：从 u 出发，经过 u 的子树中的节点，再通过一条反向边所能到达的最小时间戳

### 算法步骤

```typescript
function findBridgesAndArticulationPoints(graph: Map<number, number[]>): void {
  const n = graph.size
  const disc = new Array(n).fill(-1)  // 发现时间
  const low = new Array(n).fill(-1)   // 最低可达时间
  const visited = new Array(n).fill(false)
  const parent = new Array(n).fill(-1)
  let time = 0

  function dfs(u: number): void {
    visited[u] = true
    disc[u] = low[u] = time++
    let childCount = 0  // DFS 树中的子节点数

    for (const v of graph.get(u)!) {
      if (!visited[v]) {
        childCount++
        parent[v] = u
        dfs(v)

        // 更新 low[u]
        low[u] = Math.min(low[u], low[v])

        // 判断桥: low[v] > disc[u]
        if (low[v] > disc[u]) {
          console.log(`桥: ${u} - ${v}`)
        }

        // 判断割点（非根节点）: low[v] >= disc[u]
        if (parent[u] !== -1 && low[v] >= disc[u]) {
          console.log(`割点: ${u}`)
        }
      } else if (v !== parent[u]) {
        // 反向边
        low[u] = Math.min(low[u], disc[v])
      }
    }

    // 根节点是割点当且仅当有 2 个以上子节点
    if (parent[u] === -1 && childCount >= 2) {
      console.log(`割点（根节点）: ${u}`)
    }
  }

  for (let i = 0; i < n; i++) {
    if (!visited[i]) dfs(i)
  }
}
```

### 判断条件详解

#### 桥的判断

边 (u, v) 是桥的条件（v 是 u 的子节点）：

```
low[v] > disc[u]
```

含义：v 的子树中没有任何反向边能回到 u 或 u 的祖先。删除 (u, v) 后，v 的子树将与图的其余部分完全断开。

```
disc: 0    1    2    3
      A -- B -- C -- D

假设 A-B 不是桥（有其他路径绕回 A）
假设 low[C] = 0 < disc[B] = 1，说明 C 能回到 A
假设 low[D] = 2 > disc[C] = 2... 不对，应该是 low[D] > disc[C]

更准确的例子：
disc: 0    1    2
      A -- B -- C -- D (disc=3)

如果有反向边 D->A，则 low[D] = 0
low[C] = min(low[D]) = 0
边 B-C: low[C] = 0 < disc[B] = 1，不是桥

如果没有反向边 D->A：
low[D] = 3, low[C] = 3
边 B-C: low[C] = 3 > disc[B] = 1，是桥！
```

#### 割点的判断

**非根节点 u** 是割点的条件：

```
存在子节点 v，使得 low[v] >= disc[u]
```

含义：v 的子树无法绕过 u 到达 u 的祖先。删除 u 后，v 的子树将断开。

**根节点**是割点的条件：

```
在 DFS 树中有 2 个或更多子节点
```

含义：这些子树之间唯一的连接路径经过根节点。

### low 值的更新规则

```typescript
// 情况 1: 树边 (u -> v)，v 未访问
low[u] = Math.min(low[u], low[v])

// 情况 2: 反向边 (u -> v)，v 已访问且不是父节点
low[u] = Math.min(low[u], disc[v])
```

注意：反向边更新使用 `disc[v]` 而非 `low[v]`，因为反向边只能到达 v，不能经过 v 继续往下。

## 可视化说明

在可视化界面中：

- **节点**：圆形，显示节点编号
- **树边**：DFS 树中的边，用实线表示
- **反向边**：非树边，用虚线表示
- **桥**：红色加粗高亮
- **割点**：橙色高亮
- **disc/low 值**：每个节点旁显示 `disc/low` 标签

通过 step-by-step 模式可以观察：
1. DFS 遍历顺序和时间戳分配
2. low 值的逐层更新过程
3. 桥和割点的逐步识别

## 常见错误

### 1. 混淆 low 值更新

```typescript
// 错误：反向边用 low[v] 更新
low[u] = Math.min(low[u], low[v])  // 这是树边的更新方式

// 正确：反向边用 disc[v] 更新
low[u] = Math.min(low[u], disc[v])
```

### 2. 忘记处理根节点特殊情况

```typescript
// 错误：对根节点也用 low[v] >= disc[u] 判断
if (low[v] >= disc[u]) {
  isArticulation[u] = true  // 根节点会被误判
}

// 正确：根节点单独判断
if (parent[u] !== -1 && low[v] >= disc[u]) {
  isArticulation[u] = true
}
// 根节点：
if (parent[u] === -1 && childCount >= 2) {
  isArticulation[u] = true
}
```

### 3. 未处理重边

如果图中有重边（两个节点之间有多条边），需要特殊处理。重边中的任何一条都不是桥。

### 4. 混淆桥和割点的关系

- 桥的端点不一定是割点（如叶子节点）
- 割点不一定在桥上
- 两者是独立的概念

## 实际应用

### 1. 网络可靠性分析

在计算机网络中，桥对应单点故障链路，割点对应单点故障路由器：

```typescript
function analyzeNetworkReliability(topology: Map<string, string[]>): void {
  // 找到所有桥和割点
  const bridges = findBridges(topology)
  const articulationPoints = findArticulationPoints(topology)

  // 建议增加冗余链路
  for (const bridge of bridges) {
    console.log(`建议在 ${bridge.from} 和 ${bridge.to} 之间增加备用链路`)
  }

  // 建议增加备用节点
  for (const point of articulationPoints) {
    console.log(`节点 ${point} 是关键节点，建议增加备份`)
  }
}
```

### 2. 双连通分量分解

桥和割点是求解双连通分量（Biconnected Components）的基础：

- **点双连通分量**：不含割点的最大连通子图
- **边双连通分量**：不含桥的最大连通子图

### 3. 社交网络关键人物

在社交网络中，割点是连接不同社群的关键人物。移除他们会导致社群分裂。

### 4. 求解关节点

在电网、交通网等基础设施中，识别割点（关节点）有助于评估系统的脆弱性并制定应急预案。

## 总结

桥和割点是图论中分析连通性的核心概念：

**桥**：删除后使连通分量增加的边
- 判断条件：`low[v] > disc[u]`

**割点**：删除后使连通分量增加的顶点
- 非根节点：存在子节点 v 使得 `low[v] >= disc[u]`
- 根节点：DFS 树中子节点数 >= 2

**Tarjan 算法**：
- 基于 DFS，使用 disc 和 low 两个数组
- 时间复杂度 O(V + E)
- 空间复杂度 O(V)

**适用场景**：
- 网络可靠性分析
- 双连通分量分解
- 社交网络关键人物识别
- 基础设施脆弱性评估

理解桥和割点是深入学习图连通性算法的重要基础，也是面试和竞赛中的常见考点。
