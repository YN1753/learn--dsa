# 舞蹈链 (Dancing Links / DLX)

## 概念解释

舞蹈链（Dancing Links，简称 DLX）是计算机科学家 **Donald Knuth** 在 2000 年提出的一种高效算法，用于求解**精确覆盖问题（Exact Cover Problem）**。

它的核心思想是：将一个稀疏的 0-1 矩阵用**十字双向链表（Doubly Linked Circular List）**来表示，然后通过高效的**覆盖（Cover）**和**取消覆盖（Uncover）**操作，实现快速回溯搜索。

### 什么是精确覆盖问题？

给定一个由 0 和 1 组成的矩阵，要求选出若干行，使得：
- 每一列**恰好**有一个 1 被选中
- 每一行要么全部选中，要么全部不选

举个例子，给定矩阵：

```
    A  B  C  D  E  F  G
0: [1, 0, 0, 1, 0, 0, 1]
1: [1, 0, 0, 1, 0, 0, 0]
2: [0, 0, 0, 1, 1, 0, 1]
3: [0, 0, 1, 0, 1, 1, 0]
4: [0, 1, 1, 0, 0, 1, 1]
5: [0, 1, 0, 0, 0, 0, 1]
```

精确覆盖的解是选择第 1、3、5 行（索引从 0 开始），这样每一列恰好被覆盖一次。

### 为什么叫「舞蹈链」？

Knuth 形象地将链表节点的插入和删除比喻为「跳舞」：节点在链表中不断地被摘除（cover）和恢复（uncover），就像在跳舞一样来回穿梭，因此得名「Dancing Links」。

## 为什么重要

DLX 算法在计算机科学中具有重要地位，原因如下：

1. **高效解决 NP 完全问题**：精确覆盖问题是经典的 NP 完全问题，DLX 通过巧妙的数据结构设计，将回溯搜索中的覆盖和恢复操作优化到 O(1)，在实际应用中远超朴素回溯。

2. **广泛的问题建模**：许多看似不相关的问题都可以转化为精确覆盖问题，从而用 DLX 统一求解：
   - 数独（Sudoku）
   - N 皇后问题
   - 铺砖 / 多格骨牌问题（Pentomino Tiling）
   - 排课 / 排班问题
   - 逻辑谜题（如数织 Nonogram）

3. **理论与实践的桥梁**：DLX 展示了如何通过精巧的数据结构设计，将理论上的指数级算法在实际中变得可行。

4. **算法竞赛中的利器**：在需要求解精确覆盖或约束满足问题的竞赛题目中，DLX 往往是最高效的解法。

## 核心原理

### 第一步：稀疏矩阵的十字链表表示

DLX 的关键创新在于将稀疏 0-1 矩阵转化为十字双向链表。每个 1 在矩阵中的位置对应链表中的一个节点，每个节点有四个指针：`left`、`right`、`up`、`down`。

```
         列头节点
         ↓
    ┌──→ C0 ←→ C1 ←→ C2 ←─┐
    │    ↑      ↑      ↑    │
    │    ↓      ↓      ↓    │
    │   R0     R0     R0    │  ← 行节点
    │    ↓      ↓      ↓    │
    │   R1     R1           │
    │    ↓      ↓           │
    └── R2            R2 ──┘
```

每个节点结构：

```typescript
class DLXNode {
  left: DLXNode    // 左邻居
  right: DLXNode   // 右邻居
  up: DLXNode      // 上邻居
  down: DLXNode    // 下邻居
  column: ColumnHeader  // 所属列头
  rowId: number         // 所属行号
}
```

列头节点额外维护：

```typescript
class ColumnHeader extends DLXNode {
  size: number  // 该列中 1 的数量
  name: string  // 列名
}
```

### 第二步：覆盖操作（Cover）

当选中一行时，需要「覆盖」该行和该行中 1 所在的所有列。覆盖操作包含两个核心动作：

**1. 覆盖列**：将该列从列头链表中摘除，并将该列中所有行的节点也摘除。

```typescript
function cover(col: ColumnHeader): void {
  // 1. 将列头从左右链表中摘除
  col.right.left = col.left
  col.left.right = col.right

  // 2. 遍历该列中每一行
  for (let row = col.down; row !== col; row = row.down) {
    // 3. 对该行中每个节点，从上下链表中摘除
    for (let node = row.right; node !== row; node = node.right) {
      node.down.up = node.up
      node.up.down = node.down
      node.column.size--  // 更新列计数
    }
  }
}
```

**关键点**：覆盖操作的时间复杂度与被覆盖区域的 1 的数量成正比，但由于链表的双向指针，摘除单个节点的操作是 O(1)。

### 第三步：取消覆盖操作（Uncover）

取消覆盖是覆盖操作的**精确逆序**，用于回溯时恢复链表状态。

```typescript
function uncover(col: ColumnHeader): void {
  // 注意：操作顺序与 cover 完全相反！

  // 1. 反向遍历该列中每一行
  for (let row = col.up; row !== col; row = row.up) {
    // 2. 对该行中每个节点，恢复到上下链表中
    for (let node = row.left; node !== row; node = node.left) {
      node.column.size++
      node.down.up = node
      node.up.down = node
    }
  }

  // 3. 恢复列头到左右链表中
  col.right.left = col
  col.left.right = col
}
```

**关键点**：Uncover 中的遍历顺序必须与 Cover **完全相反**，这是保证正确性的关键。

### 第四步：Algorithm X + 舞蹈技巧

Knuth 的 Algorithm X 是一个抽象的回溯算法：

```
如果矩阵为空（没有列头）:
    找到一个解，返回

选择 1 的数量最少的列 c（启发式优化）

覆盖列 c

对列 c 中每一行 r:
    将 r 加入解集
    对 r 中每个 1 所在的列 j:
        覆盖列 j
    递归调用 Algorithm X
    如果找到解，返回
    对 r 中每个 1 所在的列 j（逆序）:
        取消覆盖列 j
    将 r 从解集中移除

取消覆盖列 c
```

DLX 将这个算法用十字链表高效实现，使得覆盖和恢复操作都能在极短时间内完成。

## 可视化说明

在可视化界面中，DLX 的运作过程通过以下方式呈现：

- **矩阵视图**：以表格形式展示 0-1 矩阵，其中 1 的位置用彩色方块标记
- **链表箭头**：用箭头连接同一列或同一行的节点，展示十字链表的结构
- **覆盖动画**：选中一行后，相关节点和列头逐渐淡出或变为灰色，表示已被覆盖
- **回溯动画**：取消覆盖时，节点重新出现，恢复原来的颜色
- **解的高亮**：找到解时，解中涉及的行用特殊颜色高亮显示

通过动画控制，你可以：
- 逐步执行 Algorithm X 的每一步
- 观察每次覆盖操作如何影响链表结构
- 理解回溯时取消覆盖的逆序恢复过程
- 调整动画速度，深入理解算法的搜索策略

## 常见错误

### 1. 覆盖操作顺序错误

```typescript
// ❌ 错误：先覆盖行再覆盖列
for (let row = col.down; row !== col; row = row.down) {
  for (let node = row.right; node !== row; node = node.right) {
    // 先摘除行节点，再摘除列头 → 顺序错误！
  }
}
col.right.left = col.left  // 应该先做这步
col.left.right = col.right

// ✅ 正确：先覆盖列头，再处理行
col.right.left = col.left   // 先摘除列头
col.left.right = col.right
for (let row = col.down; row !== col; row = row.down) {
  // 再处理行
}
```

覆盖时**必须先摘除列头**，否则遍历该列的循环会出错。取消覆盖时则**必须最后恢复列头**。

### 2. 忘记恢复操作的逆序

```typescript
// ❌ 错误：Uncover 中的遍历顺序与 Cover 相同
function uncover(col: ColumnHeader): void {
  for (let row = col.down; row !== col; row = row.down) {  // 应该是 col.up
    for (let node = row.right; node !== row; node = node.right) {  // 应该是 row.left
      node.down.up = node
      node.up.down = node
    }
  }
  col.right.left = col
  col.left.right = col
}

// ✅ 正确：所有方向都要反过来
function uncover(col: ColumnHeader): void {
  for (let row = col.up; row !== col; row = row.up) {      // up, 逆序
    for (let node = row.left; node !== row; node = node.left) {  // left, 逆序
      node.down.up = node
      node.up.down = node
    }
  }
  col.right.left = col
  col.left.right = col
}
```

### 3. 循环终止条件错误

```typescript
// ❌ 错误：用 null 判断终止
for (let row = col.down; row !== null; row = row.down) {
  // 如果是循环链表，永远不会到达 null！
}

// ✅ 正确：用列头节点本身作为哨兵
for (let row = col.down; row !== col; row = row.down) {
  // 当回到列头节点时停止
}
```

DLX 使用的是**循环双向链表**，没有 null 指针。遍历时必须以头节点本身作为终止条件。

### 4. 列选择启发式缺失

```typescript
// ❌ 错误：总是选择第一列
const col = header.right as ColumnHeader

// ✅ 正确：选择 1 最少的列（MRV 启发式）
let bestCol = header.right as ColumnHeader
let minSize = bestCol.size
for (let col = bestCol.right; col !== header; col = col.right) {
  if ((col as ColumnHeader).size < minSize) {
    bestCol = col as ColumnHeader
    minSize = bestCol.size
  }
}
```

选择包含 1 最少的列可以显著减少搜索空间，这是 DLX 效率的关键优化。

## 实际应用

### 1. 数独求解（Sudoku）

数独可以自然地转化为精确覆盖问题：

- **列约束**（324 列）：
  - 每个格子必须填一个数字（81 列）
  - 每行必须包含 1-9 各一次（81 列）
  - 每列必须包含 1-9 各一次（81 列）
  - 每宫必须包含 1-9 各一次（81 列）

- **行选择**：每个格子的每个可能数字对应一行（最多 729 行）

```typescript
function sudokuToExactCover(grid: number[][]): number[][] {
  const rows: number[][] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const num = grid[r][c]
      const digits = num === 0 ? [1,2,3,4,5,6,7,8,9] : [num]
      for (const d of digits) {
        const row = new Array(324).fill(0)
        // 格子约束
        row[r * 9 + c] = 1
        // 行约束
        row[81 + r * 9 + (d - 1)] = 1
        // 列约束
        row[162 + c * 9 + (d - 1)] = 1
        // 宫约束
        const box = Math.floor(r / 3) * 3 + Math.floor(c / 3)
        row[243 + box * 9 + (d - 1)] = 1
        rows.push(row)
      }
    }
  }
  return rows
}
```

### 2. 铺砖问题（Pentomino Tiling）

用 12 种五格骨牌恰好铺满一个矩形区域，每块骨牌的每种放置方式对应一行，每个格子的覆盖需求对应一列。

### 3. N 皇后问题

在 N x N 的棋盘上放置 N 个皇后，使得它们互不攻击。可以建模为：
- 列约束：每列恰好一个皇后
- 行约束：每行恰好一个皇后
- 对角线约束：每条对角线最多一个皇后

### 4. 排课问题

将课程、教师、教室、时间段的约束建模为精确覆盖问题，用 DLX 求解满足所有约束的排课方案。

### 5. 逻辑谜题

许多逻辑谜题（如数织 Nonogram、填字游戏）都可以转化为精确覆盖问题。

## 总结

舞蹈链（DLX）是一种优雅而高效的算法，它将精确覆盖问题的回溯搜索提升到了新的高度：

**核心思想**：
- 用十字双向链表表示稀疏 0-1 矩阵
- 覆盖和取消覆盖操作均为 O(1)（单个节点）
- Algorithm X 的回溯框架 + 链表的舞蹈技巧

**关键技巧**：
- 覆盖时先摘除列头，再处理行
- 取消覆盖时操作顺序与覆盖**完全相反**
- 使用 MRV 启发式（选 1 最少的列）优化搜索

**适用场景**：
- 精确覆盖问题（NP 完全）
- 数独、N 皇后、铺砖等约束满足问题
- 排课、排班等组合优化问题

**时间复杂度**：最坏情况仍是指数级，但在实际问题中，由于链表操作的高效性和启发式优化，DLX 通常能在合理时间内找到解。

理解 DLX 不仅能帮助你高效求解一大类难题，更能让你体会到**数据结构与算法设计的完美结合**——一个好的数据结构可以让算法的实现变得既简洁又高效。
