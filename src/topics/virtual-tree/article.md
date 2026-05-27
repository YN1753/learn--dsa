# 虚树 (Virtual Tree)

## 概念解释

虚树（Virtual Tree），也叫辅助树或压缩树，是一种**从原树中提取关键节点及其 LCA（最近公共祖先）构成的精简树结构**。

简单来说：给定一棵大树和其中若干「关键节点」，虚树是一棵只保留这些关键节点以及它们之间必要连接关系的小树。

### 核心性质

- 虚树的节点数不超过 **2k - 1**（k 为关键节点数）
- 虚树保留了原树中关键节点之间的所有祖先关系
- 虚树的边权等于原树中对应路径的长度
- 构建时间复杂度为 **O(k log k)**

### 术语说明

| 术语 | 说明 |
|------|------|
| 关键节点 | 题目给定的需要处理的节点集合 |
| LCA | 最近公共祖先（Lowest Common Ancestor） |
| DFS 序 | 节点在深度优先搜索中被访问的顺序 |
| 栈（右链） | 构建虚树时维护的从根到当前最右叶子的路径 |

## 为什么重要

在算法竞赛和实际应用中，经常会遇到这样的问题：

> 给定一棵 n 个节点的树，有多组询问，每组询问涉及 k 个关键节点。

如果直接在原树上处理，每组询问的时间复杂度为 **O(n)**，总复杂度为 **O(nm)**（m 为询问次数）。当 n 和 m 都很大时，这显然不可接受。

**虚树的优势**：

1. 将每组询问的时间复杂度从 O(n) 降至 **O(k log k)**
2. 当 k 远小于 n 时，优化效果极为显著
3. 是处理「多次树上少量节点查询」的标准优化技巧
4. 在竞赛中是区分普通选手和高水平选手的重要知识点

### 复杂度对比

| 方法 | 单次询问 | m 次询问（总复杂度） |
|------|----------|---------------------|
| 暴力处理 | O(n) | O(nm) |
| 虚树优化 | O(k log k) | O(mk log k) |

当 n = 10^5, k = 100, m = 10^5 时，暴力约为 10^10，虚树约为 10^7，差距巨大。

## 核心原理

### 1. DFS 序排序

虚树构建的第一步是将关键节点按 **DFS 序** 排序。

DFS 序是节点在深度优先搜索中被第一次访问的顺序编号。按 DFS 序排序后，相邻的节点在原树中的相对位置关系是确定的，这为后续的栈构建法奠定了基础。

```
原树:        1
            / \
           2   3
          / \   \
         4   5   6

DFS 序:  1->2->4->5->3->6
编号:    1  2  3  4  5  6
```

### 2. 栈构建法

虚树的核心构建算法使用一个**栈**来维护当前虚树的「右链」——从根节点到当前最右侧叶子节点的路径。

**算法流程**：

设关键节点按 DFS 序排序为 a1, a2, ..., ak，栈 S 初始为空：

```
将 a1 压入栈 S

对于每个 ai (i = 2, 3, ..., k):
  令 L = LCA(ai, S.top)   // 计算新节点与栈顶的 LCA

  如果 L == S.top:
    // LCA 就是栈顶，直接压入
    将 ai 压入栈

  否则:
    // 需要弹出栈中已处理完的节点
    当 |S| >= 2 且 depth[S.second] >= depth[L]:
      连边 S.second -> S.top
      弹出栈顶

    如果 S.top != L:
      连边 L -> S.top
      弹出栈顶
      将 L 压入栈

    将 ai 压入栈

// 处理栈中剩余节点
当 |S| >= 2:
  连边 S.second -> S.top
  弹出栈顶
```

### 3. LCA 插入

在构建过程中，当两个关键节点的 LCA 不在栈中时，需要将 LCA 也加入虚树。这确保了虚树完整保留了所有关键节点之间的祖先关系。

**LCA 计算方法**（倍增法预处理）：

```typescript
// 预处理：O(n log n)
// 查询：O(log n) 或 O(1)（使用 Tarjan 算法或欧拉序 + ST 表）

function lca(u: number, v: number): number {
  // 1. 将 u, v 调整到同一深度
  // 2. 从高位向低位尝试跳转
  // 3. 返回父节点
}
```

### 4. 完整示例

以一棵 7 个节点的树为例，关键节点为 {3, 5, 6}：

```
原树:           1
              / | \
             2  3  4
            / \    |
           5   6   7

DFS 序排序关键节点: 3, 5, 6

构建过程:
1. 栈: [3]
2. 处理 5:  LCA(5, 3) = 1
   - 弹出 3，连边 1->3
   - 栈: [1, 5]
3. 处理 6:  LCA(6, 5) = 2
   - 弹出 5，连边 2->5
   - 栈: [1, 2, 6]

最终虚树:
      1
     / \
    2   3
    |
    5
    |
    6  (但实际上 5 和 6 是 2 的子节点)

修正虚树边:
  1 -> 3 (原路径长度 = 1)
  1 -> 2 (原路径长度 = 1)
  2 -> 5 (原路径长度 = 1)
  2 -> 6 (原路径长度 = 1)
```

虚树节点：{1, 2, 3, 5, 6}，共 5 个（3 个关键节点 + 2 个 LCA）。

## 可视化说明

在可视化界面中，虚树的构建过程分为以下几个阶段展示：

1. **原树展示**：显示完整的原始树结构，关键节点用特殊颜色标记
2. **DFS 序标注**：展示每个节点的 DFS 序编号
3. **排序后的关键节点**：按 DFS 序排列的关键节点序列
4. **逐步构建**：通过栈操作，逐步展示虚树的构建过程
   - 蓝色高亮：当前正在处理的关键节点
   - 绿色高亮：新加入虚树的 LCA 节点
   - 黄色高亮：栈中的节点（右链）
5. **最终虚树**：展示构建完成的虚树，保留原树中的边权信息

通过交互操作可以：
- 点击「下一步」逐步执行构建算法
- 点击「自动播放」观看完整构建过程
- 点击「重置」重新开始
- 调节动画速度

## 常见错误

### 1. 忘记加入 LCA

```typescript
// 错误：只保留关键节点，不加入 LCA
function buildWrong(keyNodes: number[]): Edge[] {
  const edges: Edge[] = []
  for (let i = 1; i < keyNodes.length; i++) {
    edges.push({ from: keyNodes[i - 1], to: keyNodes[i] })
  }
  return edges
}
// 问题：这样构建的不是虚树，丢失了祖先关系
```

```typescript
// 正确：在栈构建过程中正确插入 LCA
function buildCorrect(keyNodes: number[]): Edge[] {
  keyNodes.sort((a, b) => dfn[a] - dfn[b])
  const stack: number[] = [keyNodes[0]]
  const edges: Edge[] = []

  for (let i = 1; i < keyNodes.length; i++) {
    const lca = getLCA(keyNodes[i], stack[stack.length - 1])
    // ... 栈操作，必要时插入 LCA
  }
  return edges
}
```

### 2. DFS 序排序错误

```typescript
// 错误：按节点编号排序
keyNodes.sort((a, b) => a - b)

// 正确：按 DFS 序排序
keyNodes.sort((a, b) => dfn[a] - dfn[b])
```

按节点编号排序不等于按 DFS 序排序，必须使用预处理得到的 DFS 序数组。

### 3. 栈操作边界错误

```typescript
// 错误：没有检查栈大小
while (depth[stack[stack.length - 2]] >= depth[lca]) {
  // stack.length - 2 可能为负数！
}

// 正确：同时检查栈大小
while (stack.length >= 2 && depth[stack[stack.length - 2]] >= depth[lca]) {
  // ...
}
```

### 4. 边权计算错误

虚树中两个节点之间的边权应等于原树中对应路径的长度，而不是 1。

```typescript
// 错误：边权设为 1
edges.push({ from: lca, to: node, weight: 1 })

// 正确：计算原树中的路径长度
const dist = depth[node] - depth[lca]
edges.push({ from: lca, to: node, weight: dist })
```

## 实际应用

### 1. 多次树上询问

**场景**：给定一棵树，多次询问每组关键节点之间的距离和。

```typescript
// 使用虚树优化
function solve(keyNodes: number[]): number {
  const vt = buildVirtualTree(keyNodes)  // O(k log k)
  let totalDist = 0

  // 在虚树上进行 DFS，计算距离和
  // 时间复杂度 O(k)，而非 O(n)
  dfs(vt.root, (node, dist) => {
    totalDist += dist
  })

  return totalDist
}
```

### 2. 树上 DP 优化

**场景**：在树上进行动态规划，但每次 DP 只涉及少量关键节点。

```typescript
// 在虚树上进行 DP
function treeDP(keyNodes: number[]): number {
  const vt = buildVirtualTree(keyNodes)
  const dp = new Map<number, number>()

  // 自底向上 DP，只在虚树节点上计算
  // 复杂度 O(k)，而非 O(n)
  postOrder(vt.root, (node) => {
    dp.set(node, computeDP(node, dp))
  })

  return dp.get(vt.root) ?? 0
}
```

### 3. 关键节点间距离计算

**场景**：计算所有关键节点对之间的距离之和。

利用虚树和子树大小信息，可以在 O(k) 时间内计算：

```typescript
function distanceSum(keyNodes: number[]): number {
  const vt = buildVirtualTree(keyNodes)
  const keySet = new Set(keyNodes)
  let sum = 0

  // 在虚树上 DFS，利用子树中关键节点数量计算贡献
  dfs(vt.root, (node, children) => {
    for (const child of children) {
      const edgeWeight = getEdgeWeight(node, child)
      const cnt = countKeyNodes(child)  // 子树中关键节点数量
      sum += edgeWeight * cnt * (keyNodes.length - cnt) * 2
    }
  })

  return sum / 2
}
```

## 总结

虚树是处理「多次树上少量节点查询」问题的核心优化技巧：

**核心思想**：
- 从原树中提取关键节点和它们的 LCA，构建精简的虚树
- 在虚树上进行查询/DP，避免遍历无关节点

**关键步骤**：
1. 按 DFS 序对关键节点排序
2. 使用栈构建法逐步构建虚树
3. 在构建过程中正确插入 LCA 节点

**复杂度**：
- 构建：O(k log k)，其中 k 为关键节点数
- 虚树大小：不超过 2k - 1
- 总优化效果：将 O(n) 每次查询降至 O(k log k)

**适用条件**：
- 多组询问
- 每组询问涉及的关键节点数 k 远小于总节点数 n
- 需要预处理 LCA（倍增法、Tarjan 算法等）

**学习建议**：
1. 先熟练掌握 LCA 算法
2. 理解 DFS 序的含义和作用
3. 手动模拟栈构建法的过程
4. 在实际题目中练习虚树的构建和应用
