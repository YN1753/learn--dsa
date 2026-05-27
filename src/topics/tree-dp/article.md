# 树形DP (Tree DP)

## 概念解释

**树形DP**是在树结构上进行动态规划的算法范式。核心思想是：通过DFS遍历树，在后序遍历（先处理子树，再处理当前节点）的过程中，利用子树的最优解来构建当前节点的最优解。

直观理解：想象你在公司管理架构中做决策——每个部门经理需要先知道下属部门的最优方案，然后才能做出自己部门的最优决策。

```
       1 (根节点)
      / \
     2   3
    / \   \
   4   5   6

计算顺序（后序遍历）: 4 -> 5 -> 2 -> 6 -> 3 -> 1
先算叶子，再算中间，最后算根
```

### 关键术语

| 术语 | 说明 |
|------|------|
| 树形DP | 在树结构上利用DP思想求解最优问题 |
| 状态定义 | dp[u][...] 表示以u为根的子树的某种状态 |
| 转移方程 | 利用子节点的dp值更新当前节点的dp值 |
| 后序遍历 | 先处理子树，再处理当前节点的遍历顺序 |
| 有根树 vs 无根树 | 有根树有明确父子关系；无根树需要先选定根 |

## 为什么重要

树形DP是算法竞赛和实际应用中的核心技巧：

1. **树上优化问题**：许多在树上求最优解的问题都需要用到树形DP
2. **竞赛高频考点**：NOI/ICPC/LeetCode中大量题目涉及树形DP
3. **实际应用场景广泛**：社交网络分析、组织架构优化、决策树等
4. **理解DP本质**：树形DP展示了DP思想在非线性结构上的应用

## 核心原理

### 基本框架

树形DP的核心步骤：

1. **选定根节点**（无根树需要先转化为有根树）
2. **定义状态**：dp[u] 表示以节点u为根的子树的某种最优值
3. **DFS后序遍历**：先递归处理所有子节点
4. **状态转移**：利用子节点的dp值更新当前节点

```typescript
function treeDP(node: number, parent: number): void {
  // 初始化当前节点的dp值
  dp[node] = initialValue

  for (const child of adj[node]) {
    if (child === parent) continue  // 避免回到父节点
    treeDP(child, node)              // 先处理子树
    // 用子节点的dp值更新当前节点
    dp[node] = combine(dp[node], dp[child])
  }
}

// 从根节点开始
treeDP(root, -1)
```

### 经典问题一：树的直径

**问题**：求树中任意两点间的最长路径长度。

**状态定义**：
- d1[u]：以u为起点，向下走的最长链长度
- d2[u]：以u为起点，向下走的次长链长度

**转移方程**：
```
对于u的每个子节点v：
  若 d1[v] + 1 > d1[u]：
    d2[u] = d1[u]
    d1[u] = d1[v] + 1
  否则若 d1[v] + 1 > d2[u]：
    d2[u] = d1[v] + 1

直径 = max(所有节点的 d1[u] + d2[u])
```

```typescript
function treeDiameter(n: number, adj: number[][]): number {
  let diameter = 0

  function dfs(node: number, parent: number): number {
    let d1 = 0, d2 = 0

    for (const child of adj[node]) {
      if (child === parent) continue
      const childLen = dfs(child, node) + 1
      if (childLen > d1) {
        d2 = d1
        d1 = childLen
      } else if (childLen > d2) {
        d2 = childLen
      }
    }

    diameter = Math.max(diameter, d1 + d2)
    return d1
  }

  dfs(1, -1)
  return diameter
}
```

### 经典问题二：最大独立集

**问题**：在树中选择一些节点，使得选中的节点之间没有边相连，且权值和最大。

**状态定义**：
- dp[u][0]：不选节点u时，以u为根的子树的最大权值和
- dp[u][1]：选节点u时，以u为根的子树的最大权值和

**转移方程**：
```
dp[u][0] = sum( max(dp[v][0], dp[v][1]) )  // v是u的子节点
dp[u][1] = w[u] + sum( dp[v][0] )           // 选了u，子节点不能选
```

```typescript
function maxIndependentSet(n: number, adj: number[][], weight: number[]): number {
  const dp: number[][] = Array.from({ length: n + 1 }, () => [0, 0])

  function dfs(node: number, parent: number): void {
    dp[node][1] = weight[node]

    for (const child of adj[node]) {
      if (child === parent) continue
      dfs(child, node)
      dp[node][0] += Math.max(dp[child][0], dp[child][1])
      dp[node][1] += dp[child][0]
    }
  }

  dfs(1, -1)
  return Math.max(dp[1][0], dp[1][1])
}
```

### 经典问题三：树上背包

**问题**：在树上选择恰好k个节点，使得权值和最大（选了父节点才能选子节点）。

**状态定义**：dp[u][j] 表示以u为根的子树中选择j个节点的最大权值和。

**转移**：类似分组背包，依次将每个子节点"加入"当前节点的背包。

```typescript
function treeKnapsack(
  n: number, adj: number[][], weight: number[], k: number
): number {
  const dp: number[][] = Array.from({ length: n + 1 },
    () => new Array(k + 1).fill(-Infinity))
  const sz: number[] = new Array(n + 1).fill(0)

  function dfs(node: number, parent: number): void {
    dp[node][1] = weight[node]
    sz[node] = 1

    for (const child of adj[node]) {
      if (child === parent) continue
      dfs(child, node)

      // 合并子树（分组背包）
      for (let j = Math.min(k, sz[node]); j >= 1; j--) {
        for (let t = 1; t <= Math.min(sz[child], k - j); t++) {
          dp[node][j + t] = Math.max(dp[node][j + t], dp[node][j] + dp[child][t])
        }
      }
      sz[node] += sz[child]
    }
  }

  dfs(1, -1)

  let ans = 0
  for (let j = 1; j <= k; j++) {
    ans = Math.max(ans, dp[1][j])
  }
  return ans
}
```

## 可视化说明

在可视化界面中，你可以观察到：

```
DP计算流程（最大独立集示例）：

Step 1: 处理叶子节点 4
  dp[4][0] = 0, dp[4][1] = 4

Step 2: 处理叶子节点 7
  dp[7][0] = 0, dp[7][1] = 7

Step 3: 处理叶子节点 8
  dp[8][0] = 0, dp[8][1] = 8

Step 4: 处理节点 5（子节点7、8已处理完）
  dp[5][0] = max(0,7) + max(0,8) = 15
  dp[5][1] = 5 + 0 + 0 = 5

Step 5: 处理节点 2（子节点4、5已处理完）
  dp[2][0] = max(0,4) + max(15,5) = 19
  dp[2][1] = 2 + 0 + 15 = 17

Step 6: 处理叶子节点 6
  dp[6][0] = 0, dp[6][1] = 6

Step 7: 处理节点 3（子节点6已处理完）
  dp[3][0] = max(0,6) = 6
  dp[3][1] = 3 + 0 = 3

Step 8: 处理根节点 1（子节点2、3已处理完）
  dp[1][0] = max(19,17) + max(6,3) = 25
  dp[1][1] = 1 + 17 + 6 = 24

结果: max(25, 24) = 25
```

可视化特性：
- 节点按DFS后序遍历顺序依次高亮
- 每个节点处理完成后显示dp值
- 当前正在处理的节点用特殊颜色标记
- 已处理和未处理的节点有明显区分

## 常见错误

### 1. 忘记排除父节点

```typescript
// 错误：遍历所有邻居，包括父节点，导致无限递归
function dfs(node: number): void {
  for (const child of adj[node]) {
    dfs(child) // 可能回到父节点！
  }
}

// 正确：传入parent参数，跳过父节点
function dfs(node: number, parent: number): void {
  for (const child of adj[node]) {
    if (child === parent) continue
    dfs(child, node)
  }
}
```

### 2. 叶子节点的初始化错误

```typescript
// 错误：叶子节点没有正确初始化
function dfs(node: number, parent: number): void {
  for (const child of adj[node]) {
    if (child === parent) continue
    dfs(child, node)
    dp[node] += dp[child]
  }
  // 叶子节点进入时dp[node]可能是undefined或NaN！
}

// 正确：在循环前初始化
function dfs(node: number, parent: number): void {
  dp[node] = weight[node]  // 先初始化
  for (const child of adj[node]) {
    if (child === parent) continue
    dfs(child, node)
    dp[node] += dp[child]
  }
}
```

### 3. 无根树没有转化为有根树

```typescript
// 错误：直接用无向图的邻接表，不知道谁是父节点
// 在树形DP中，必须有明确的父子关系

// 正确：任选一个节点作为根，DFS建立父子关系
function solve(): void {
  // 选节点1作为根
  dfs(1, -1)
}
```

### 4. 树上背包的合并顺序错误

```typescript
// 错误：正序遍历容量，导致同一子树的节点被多次选择
for (let j = 1; j <= k; j++) {
  for (let t = 1; t <= sz[child]; t++) {
    dp[node][j + t] = Math.max(dp[node][j + t], dp[node][j] + dp[child][t])
  }
}

// 正确：逆序遍历容量（类似0-1背包）
for (let j = Math.min(k, sz[node]); j >= 1; j--) {
  for (let t = 1; t <= sz[child]; t++) {
    dp[node][j + t] = Math.max(dp[node][j + t], dp[node][j] + dp[child][t])
  }
}
```

## 实际应用

### 1. 网络拓扑优化

在树形网络中，选择一些节点放置服务器，使得覆盖范围最大且服务器之间不直接相连——这就是最大独立集问题。

### 2. 社交网络影响力分析

在组织架构树中，选择一些人进行宣传，要求直接上下级不能同时被选中（避免冲突），使得影响力最大。

### 3. 决策树分析

在多级决策过程中，每个节点代表一个决策点，子节点代表子决策。树形DP可以找到最优决策组合。

### 4. 生物信息学

在进化树上进行分析，选择一些物种进行基因测序，使得覆盖的进化分支最广。

## 总结

树形DP是将动态规划思想应用于树结构的强大工具：

**核心思想**：
- DFS后序遍历：先处理子树，再处理当前节点
- 状态定义：dp[u] 表示以u为根的子树的某种最优值
- 状态转移：利用子节点的dp值更新当前节点

**经典问题**：
- 树的直径：维护最长链和次长链
- 最大独立集：维护选/不选两种状态
- 树上背包：类似分组背包的合并策略

**关键注意点**：
- 必须排除父节点，避免无限递归
- 叶子节点的初始化要正确
- 无根树需要先转化为有根树
- 树上背包的容量需要逆序遍历

掌握树形DP，你就掌握了解决一大类树上优化问题的通用方法。
