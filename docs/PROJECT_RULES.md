# Data Structures & Algorithms Interactive Learning System
# PROJECT_RULES.md

> DSA 专项项目规则
> 本文档定义数据结构与算法学习系统的核心设计原则、可视化规范、算法模拟规则与 AI Agent 开发约束。

---

# 1. Project Identity

这是一个：

# 「算法与数据结构交互式学习系统」

核心不是刷题。

核心是：

- 理解数据结构
- 可视化算法执行过程
- 观察状态变化
- 理解时间复杂度与空间复杂度
- 理解算法思想

系统必须：

- simulation-first
- state-driven
- visualization-heavy
- interaction-oriented

---

# 2. Core Learning Philosophy

DSA 学习不能只展示代码。

必须展示：

- 数据如何变化
- 指针如何移动
- 节点如何连接
- 栈如何压入弹出
- 队列如何移动
- 树如何旋转
- 图如何遍历
- DP 状态如何转移

用户必须能：

- 单步执行
- 自动播放
- 自定义输入
- 回退步骤
- 比较不同算法

---

# 3. Visualization Categories

## A. Data Structure Explorer

用于：

- 数组
- 链表
- 栈
- 队列
- 哈希表
- 堆
- 并查集

交互：

- 插入
- 删除
- 查找
- 修改
- 扩容
- rehash

必须可视化：

- 节点关系
- 内存逻辑
- 指针方向
- 索引变化

---

## B. Algorithm Step Simulator

用于：

- 排序
- 搜索
- BFS
- DFS
- Dijkstra
- Prim
- Kruskal
- KMP

必须：

- 高亮当前元素
- 显示当前步骤
- 显示比较过程
- 显示交换过程
- 显示状态变化

---

## C. State Transition Visualizer

用于：

- 动态规划
- 状态压缩
- 自动机
- Trie
- AC 自动机

必须：

- 显示状态表
- 显示状态转移
- 显示当前状态
- 显示 transition path

---

## D. Tree / Graph Animator

用于：

- AVL
- 红黑树
- B树
- Trie
- 图算法

必须：

- 节点动态高亮
- 边高亮
- 路径动画
- 旋转过程
- 插入删除过程

---

# 4. Algorithm Visualization Rules

## 所有算法必须：

### 1. 可单步执行

用户点击：

```txt
执行一步
算法推进一步。

2. 可自动播放

必须支持：

play
pause
reset
speed control
3. 显示当前状态

必须显示：

当前步骤
当前元素
当前变量
当前数据结构状态
4. 显示时间复杂度

必须动态显示：

当前操作复杂度
总体复杂度
5. 显示伪代码

当前执行行必须高亮。

5. DSA-Specific Rendering Rules
数组

必须：

index visible
value visible
active index highlighted
链表

必须：

next 指针箭头
null 可视化
head/tail 可视化

禁止：

用普通数组替代链表视觉
栈

必须：

top 指针
push/pop 动画
队列

必须：

front/rear 指针
环形队列必须可视化
树

必须：

parent-child hierarchy
balanced tree rotation animation
traversal path animation
图

必须：

node state
edge weight
visited state
traversal order
6. Dynamic Programming Rules

DP 是重点。

必须：

展示 DP table
展示状态转移
展示初始化
展示滚动数组优化

用户必须能：

点击单元格查看来源
查看 transition formula
对比 brute force vs DP
7. Sorting Algorithm Protocol

所有排序必须：

支持随机数组生成
支持数组大小调节
支持速度调节
支持暂停恢复

必须展示：

当前比较
当前交换
已排序区域
未排序区域

颜色规范：

状态	颜色
当前比较	warning
当前交换	error
已排序	success
未处理	secondary
8. Graph Algorithm Rules

图算法必须：

使用邻接表逻辑
可视化节点与边
显示 visited 状态

BFS/DFS：

queue/stack 必须同步显示

Dijkstra：

priority queue 必须显示
dist 数组必须显示

MST：

当前生成树高亮
9. Code Rules

禁止：

monaco editor
code mirror
canvas
d3
three.js

允许：

inline code block
pseudo code panel
10. Interaction Philosophy

用户必须：

“看到算法在思考”

不是：

只看到结果

系统核心：

状态变化 > 最终答案
11. Autonomous Agent Rules

Agent 生成新 topic 时：

必须：

先确定算法类别
选择 visualization category
设计 step sequence
实现状态驱动可视化
实现 quiz
build 检查
commit
12. Forbidden Actions

禁止：

静态图片式 visualization
只有代码没有状态变化
跳步执行
不显示变量
不显示当前状态
不显示数据结构变化
canvas
第三方图表库
外部 UI 库
13. Priority Order
1. Build Stability
2. Visualization Correctness
3. State Clarity
4. Interactivity
5. Topic Breadth
6. Animation Polish