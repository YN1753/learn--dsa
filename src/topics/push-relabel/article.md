# 预流推进算法 (Push-Relabel Algorithm)

## 概念解释

预流推进（Push-Relabel）是求解**最大流问题**的一种高效算法。与传统的增广路方法（如 Ford-Fulkerson、Dinic 算法）不同，预流推进算法采用**局部操作**的策略，通过 push（推送）和 relabel（重贴标签）两种基本操作，逐步将一个「预流」转化为合法的最大流。

### 核心术语

| 术语 | 说明 |
|------|------|
| 预流 (Preflow) | 满足容量约束但允许中间节点超额的流函数 |
| 高度标签 (Height Label) | 每个节点的整数标签，指导流量推送方向 |
| 超额 (Excess) | 节点的流入量减去流出量，源汇外超额为正则称活跃 |
| Push 操作 | 将超额从一个节点推送到邻近节点 |
| Relabel 操作 | 抬高活跃节点的高度标签以允许更多推送 |
| 活跃节点 (Active Node) | 非源非汇且超额大于 0 的节点 |

## 为什么重要

预流推进算法在最大流领域具有重要地位：

1. **局部操作**：每次操作只涉及单个节点及其邻居，不需要全局搜索增广路
2. **理论保证**：最高标号选择策略下时间复杂度为 O(V²√E)，FIFO 策略下为 O(V³)
3. **并行友好**：局部性使得算法天然适合并行计算
4. **实践高效**：在稠密图和大规模网络中表现优异
5. **理论基础**：与最短路径、二分匹配等问题有深刻联系

## 核心原理

### 初始化

算法从一个特殊的初始状态开始：

1. 源点 s 的高度设为 |V|（节点总数）
2. 源点的所有出边设置满流（流量等于容量）
3. 源点的邻居获得初始超额
4. 所有其他节点高度设为 0

```typescript
// 初始化
height[s] = n
for each edge (s, v) from source {
  flow[s][v] = capacity[s][v]
  excess[v] = capacity[s][v]
  excess[s] -= capacity[s][v]
}
```

### Push 操作

当一个活跃节点 u 的高度恰好比邻居 v 高 1 时，可以执行 push：

- 将尽可能多的超额从 u 推送到 v
- 推送量不超过边的残量容量和 u 的超额

```typescript
function push(u: number, v: number): void {
  const delta = Math.min(excess[u], residualCapacity[u][v])
  flow[u][v] += delta
  flow[v][u] -= delta
  excess[u] -= delta
  excess[v] += delta
}
```

**条件**：height[u] = height[v] + 1 且 residualCapacity[u][v] > 0

### Relabel 操作

当活跃节点 u 无法向任何邻居 push 时（所有邻居高度 >= u 的高度），执行 relabel：

- 将 u 的高度抬高到可接受 push 的最低邻居高度加 1

```typescript
function relabel(u: number): void {
  height[u] = 1 + min(height[v]) for all v where residualCapacity[u][v] > 0
}
```

**条件**：excess[u] > 0 且对于所有残量边 (u, v)，height[u] <= height[v]

### 算法主循环

```typescript
function pushRelabel(): number {
  initialize()
  while (exists active node u) {
    if (can push from u) {
      push(u, v)  // 选择满足条件的邻居 v
    } else {
      relabel(u)
    }
  }
  return excess[t]  // 汇点的超额即为最大流
}
```

### 高度标签的性质

高度标签是算法正确性的关键，必须满足以下条件：

1. **可行性**：对于残量图中的每条边 (u, v)，height[u] <= height[v] + 1
2. **源点高度**：height[s] = |V| 始终不变
3. **汇点高度**：height[t] = 0 始终不变
4. **单调递增**：relabel 操作只增不减高度标签

## 可视化说明

在可视化界面中，每个节点显示两个标签：

```
┌──────────┐
│  h = 3   │  ← 高度标签
│  e = 5   │  ← 超额值
│  [节点A]  │
└──────────┘
```

- **蓝色节点**：正在执行 push 操作
- **绿色节点**：正在执行 relabel 操作
- **红色节点**：活跃节点（有超额）
- **灰色节点**：非活跃节点
- **箭头粗细**：表示流量大小

通过可视化可以直观地观察：
- 高度标签如何引导流量向汇点推进
- Push 操作如何在节点间传递超额
- Relabel 操作如何抬高节点以打破「瓶颈」
- 间隙优化如何识别并消除无效节点

## 常见错误

### 1. 忽略反向边

预流推进需要在残量图上操作，反向边不可忽略：

```typescript
// 错误：只考虑正向边
if (residual[u][v] > 0) push(u, v)

// 正确：同时考虑正向和反向残量边
for each neighbor v of u {
  if (residual[u][v] > 0 && height[u] === height[v] + 1) {
    push(u, v)
  }
}
```

### 2. 高度标签更新不及时

relabel 后必须立即检查是否还能继续 push：

```typescript
// 错误：relabel 后直接跳到下一个节点
relabel(u)
continue // 可能错过 push 机会

// 正确：relabel 后重新检查
relabel(u)
// 继续尝试 push
```

### 3. 混淆预流与可行流

在算法执行过程中，中间节点可能有正的超额。只有算法结束时，预流才变为可行流（最大流）。

### 4. 源点和汇点的处理

源点和汇点不参与 relabel 操作，源点高度固定为 |V|，汇点高度固定为 0。

## 实际应用

### 1. 网络带宽分配

在计算机网络中，预流推进可用于：
- 计算网络最大吞吐量
- 优化路由带宽分配
- 评估网络瓶颈

### 2. 图像分割

在计算机视觉中，最大流/最小割用于：
- 前景-背景分割
- 图像修复
- 立体匹配

### 3. 项目选择问题

在运筹学中：
- 有依赖关系的项目选择
- 资源分配优化
- 二分图最大匹配

### 4. 交通流量优化

- 城市交通网络的最大通行能力
- 物流网络的运力规划
- 供应链优化

## 总结

预流推进算法是一种优雅而高效的最大流算法：

**优点**：
- 基于局部操作，天然适合并行计算
- 时间复杂度有严格保证：O(V²√E) 或 O(V³)
- 在稠密图中实际表现优异
- 算法思想简洁，push 和 relabel 两种操作清晰明了

**缺点**：
- 实现细节较多（高度维护、超额管理）
- 在稀疏图中可能不如 Dinic 算法高效
- 需要额外的 O(V) 空间存储高度和超额

**与其他算法对比**：

| 算法 | 时间复杂度 | 特点 |
|------|------------|------|
| Ford-Fulkerson | O(E * max_flow) | 简单但可能慢 |
| Dinic | O(V²E) | BFS分层 + DFS增广 |
| Push-Relabel (FIFO) | O(V³) | 局部操作，实现较简单 |
| Push-Relabel (最高标号) | O(V²√E) | 最优理论复杂度 |

理解预流推进算法有助于深入理解网络流理论，也是学习更高级算法（如最小费用流、二分匹配）的重要基础。
