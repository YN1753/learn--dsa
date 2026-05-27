# 2-SAT问题 (2-Satisfiability)

## 概念解释

**2-SAT** 是布尔可满足性问题（SAT）的一个特殊形式。给定一组**子句**，每个子句恰好包含**两个文字**（变量或其否定），问是否存在一组变量赋值使得所有子句同时为真。

### 基本术语

| 术语 | 说明 |
|------|------|
| 文字 (Literal) | 一个布尔变量 x 或其否定 ¬x |
| 子句 (Clause) | 若干文字的析取（OR），如 (a ∨ ¬b) |
| 2-CNF | 合取范式，每个子句恰好两个文字 |
| 蕴含图 (Implication Graph) | 将子句转换为蕴含关系后构成的有向图 |
| 强连通分量 (SCC) | 图中任意两点互相可达的最大子图 |

### 从子句到蕴含图

一个关键观察：子句 (a ∨ b) 等价于两个蕴含关系：

- **¬a → b**：如果 a 为假，则 b 必须为真
- **¬b → a**：如果 b 为假，则 a 必须为真

因此，每个 2-CNF 子句生成两条有向边。对于 n 个变量、m 个子句的实例，蕴含图有 **2n 个节点**和 **2m 条边**。

```
子句: (a ∨ b)
等价于: (¬a → b) ∧ (¬b → a)

蕴含图:
  ¬a ──→ b
  ¬b ──→ a
```

## 为什么重要

2-SAT 在算法竞赛和实际应用中都非常重要：

1. **线性时间可解**：一般的 SAT 是 NP 完全问题，但 2-SAT 可以在 O(n + m) 时间内解决
2. **建模能力强**：许多「二选一」的约束问题可以建模为 2-SAT
3. **算法竞赛高频考点**：与 SCC、图论深度结合
4. **实际应用广泛**：调度系统、配置选择、逻辑推理等场景

## 核心原理

### 第一步：构建蕴含图

对于每个变量 x，创建两个节点：x（表示 x 为真）和 ¬x（表示 x 为假）。

对于每个子句 (a ∨ b)，添加两条边：
- ¬a → b
- ¬b → a

```typescript
function buildImplicationGraph(
  variables: number,
  clauses: [number, number][]
): number[][] {
  // 每个变量 x 对应节点 2*x (x为真) 和 2*x+1 (¬x为真)
  const n = variables * 2
  const graph: number[][] = Array.from({ length: n }, () => [])

  for (const [a, b] of clauses) {
    // (a ∨ b) → (¬a → b) 和 (¬b → a)
    const negA = a ^ 1  // 取反：偶数变奇数，奇数变偶数
    const negB = b ^ 1
    graph[negA].push(b)
    graph[negB].push(a)
  }

  return graph
}
```

**节点编码技巧**：变量 x 的真值节点为 `2*x`，假值节点为 `2*x+1`。取反操作只需异或 1：`x ^ 1`。

### 第二步：求强连通分量 (SCC)

使用 **Tarjan 算法**或 **Kosaraju 算法**求出蕴含图的所有 SCC。

```typescript
function tarjanSCC(graph: number[][]): number[] {
  const n = graph.length
  const dfn = new Array(n).fill(0)
  const low = new Array(n).fill(0)
  const sccId = new Array(n).fill(-1)
  const stack: number[] = []
  const onStack = new Array(n).fill(false)
  let timer = 0
  let sccCount = 0

  function dfs(u: number): void {
    dfn[u] = low[u] = ++timer
    stack.push(u)
    onStack[u] = true

    for (const v of graph[u]) {
      if (dfn[v] === 0) {
        dfs(v)
        low[u] = Math.min(low[u], low[v])
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], dfn[v])
      }
    }

    if (dfn[u] === low[u]) {
      while (true) {
        const v = stack.pop()!
        onStack[v] = false
        sccId[v] = sccCount
        if (v === u) break
      }
      sccCount++
    }
  }

  for (let i = 0; i < n; i++) {
    if (dfn[i] === 0) dfs(i)
  }

  return sccId
}
```

**时间复杂度**：O(n + m)，其中 n 是节点数，m 是边数。

### 第三步：判定可满足性

**定理**：2-SAT 有解当且仅当对于每个变量 x，x 和 ¬x 不在同一个 SCC 中。

直觉理解：如果 x 和 ¬x 在同一个 SCC 中，说明：
- 从 x 可以推导出 ¬x
- 从 ¬x 可以推导出 x

这意味着无论 x 取什么值都会导致矛盾，因此无解。

```typescript
function isSatisfiable(sccId: number[], variables: number): boolean {
  for (let x = 0; x < variables; x++) {
    if (sccId[2 * x] === sccId[2 * x + 1]) {
      return false  // x 和 ¬x 在同一个 SCC，无解
    }
  }
  return true
}
```

### 第四步：构造解

如果有解，按照 SCC 缩点图的**拓扑序**为变量赋值：

1. 将每个 SCC 看作一个超级节点，构建缩点图（DAG）
2. 按拓扑序从后往前遍历 SCC
3. 如果当前 SCC 中的变量未赋值，则将该 SCC 中所有变量设为 **true**，其对立 SCC 中的变量设为 **false**

```typescript
function findSolution(sccId: number[], variables: number): boolean[] {
  const assignment = new Array(variables).fill(false)

  // SCC 编号越大的 SCC 拓扑序越小（Tarjan 的性质）
  for (let x = 0; x < variables; x++) {
    // sccId[2*x] 是 x 为真的 SCC
    // sccId[2*x+1] 是 x 为假的 SCC
    // 拓扑序大的 SCC 先被访问
    if (sccId[2 * x] > sccId[2 * x + 1]) {
      assignment[x] = true   // x 的「真」节点拓扑序更小，优先赋 true
    } else {
      assignment[x] = false  // x 的「假」节点拓扑序更小，优先赋 false
    }
  }

  return assignment
}
```

**关键洞察**：在 Tarjan 算法中，SCC 编号越大的 SCC 在缩点图的拓扑序中越靠前。因此，如果 x 的真值节点所在 SCC 编号更大，就将 x 设为 true。

### 完整算法流程

```typescript
function solve2SAT(
  variables: number,
  clauses: [number, number][]
): boolean[] | null {
  // 1. 构建蕴含图
  const graph = buildImplicationGraph(variables, clauses)

  // 2. 求 SCC
  const sccId = tarjanSCC(graph)

  // 3. 判定可满足性
  if (!isSatisfiable(sccId, variables)) {
    return null  // 无解
  }

  // 4. 构造解
  return findSolution(sccId, variables)
}
```

### 时间复杂度

| 步骤 | 时间复杂度 | 说明 |
|------|------------|------|
| 构建蕴含图 | O(m) | m 为子句数，每条子句生成两条边 |
| Tarjan SCC | O(n + m) | n 为变量数，2n 个节点，2m 条边 |
| 判定可满足性 | O(n) | 遍历每个变量检查 |
| 构造解 | O(n) | 遍历每个变量赋值 |
| **总计** | **O(n + m)** | 线性时间 |

### 空间复杂度

O(n + m)：存储蕴含图需要 O(n + m) 空间。

## 可视化说明

在可视化界面中，2-SAT 的求解过程分为三个阶段展示：

**阶段一：蕴含图构建**
- 左侧显示布尔变量及其否定作为图节点
- 添加子句时，对应的蕴含边以动画形式出现
- 每条边标注其来源子句

**阶段二：SCC 染色**
- 运行 Tarjan 算法，节点按 DFS 顺序依次高亮
- 同一 SCC 内的节点染相同颜色
- 如果发现 x 和 ¬x 同色，高亮提示无解

**阶段三：解的构造**
- 按拓扑序遍历 SCC
- 被赋值为 true 的变量标记为绿色
- 被赋值为 false 的变量标记为红色
- 最终展示完整的赋值方案

通过动画控制栏，你可以：
- 逐步执行每个阶段
- 播放/暂停动画
- 调整动画速度

## 常见错误

### 1. 蕴含边方向搞反

```typescript
// ❌ 错误：(a ∨ b) 生成了 a → b
graph[a].push(b)

// ✅ 正确：(a ∨ b) 生成 ¬a → b 和 ¬b → a
graph[negA].push(b)
graph[negB].push(a)
```

### 2. 取反操作错误

```typescript
// ❌ 错误：用减法取反
const negA = a - 1  // 不通用

// ✅ 正确：异或取反（适用于 2*x, 2*x+1 编码）
const negA = a ^ 1
```

### 3. 忘记检查可满足性

```typescript
// ❌ 错误：直接构造解，不检查是否有解
const solution = findSolution(sccId, variables)

// ✅ 正确：先判定可满足性
if (!isSatisfiable(sccId, variables)) {
  return null  // 无解
}
const solution = findSolution(sccId, variables)
```

### 4. SCC 编号与拓扑序的关系搞混

```typescript
// ❌ 错误：认为 SCC 编号小的拓扑序靠前
// Tarjan 中，编号越大的 SCC 拓扑序越靠前（先被发现的 SCC 编号大）

// ✅ 正确：Tarjan SCC 编号越大的 SCC 在 DAG 中拓扑序越靠前
if (sccId[2 * x] > sccId[2 * x + 1]) {
  assignment[x] = true
}
```

### 5. 变量编码不一致

```typescript
// ❌ 错误：题目中变量从 1 开始，代码中从 0 开始，导致越界
const a = clause[0]  // 题目的 1-based

// ✅ 正确：统一转为 0-based
const a = clause[0] - 1
```

## 实际应用

### 1. 课程安排问题

学校有 n 门课程，每门课可以在上午或下午上。某些课程之间有冲突（不能同时在上午或同时在下午）。判断是否存在合法安排。

建模：变量 x_i 表示课程 i 在上午。对于冲突的课程 i 和 j：
- 子句 (x_i ∨ x_j)：至少一门在上午
- 子句 (¬x_i ∨ ¬x_j)：至少一门在下午

### 2. 逻辑电路设计

在数字电路设计中，某些信号必须满足特定的逻辑约束。2-SAT 可以快速判断是否存在满足所有约束的信号赋值。

### 3. 游戏关卡设计

在游戏设计中，某些事件 A 和 B 之间有依赖关系（如「如果 A 发生，则 B 必须发生」）。2-SAT 可以验证事件系统的一致性。

### 4. 配置管理系统

软件系统中，某些配置项之间有依赖或互斥关系。2-SAT 可以快速判断是否存在合法的配置组合。

### 5. 竞赛中的建模

在算法竞赛中，许多「二选一」约束问题可以用 2-SAT 建模：
- 选择/不选择某个元素
- 两种颜色的图着色
- 开/关某个开关

## 总结

2-SAT 是一个优雅的算法，将布尔可满足性问题转化为图论问题：

**核心思想**：
- 将析取子句 (a ∨ b) 转换为蕴含关系 (¬a → b, ¬b → a)
- 利用 SCC 判断是否存在矛盾
- 利用拓扑序构造合法解

**关键性质**：
- 一般 SAT 是 NP 完全问题，但 2-SAT 是多项式可解的
- 时间复杂度 O(n + m)，非常高效
- 本质上是 SCC 算法的一个精彩应用

**适用场景**：
- 涉及「二选一」约束的判定问题
- 需要快速验证逻辑一致性
- 算法竞赛中的图论建模题

理解 2-SAT 不仅掌握了一个实用算法，更重要的是理解了如何将逻辑约束问题转化为图论问题——这种建模思想在计算机科学中具有广泛的应用价值。
