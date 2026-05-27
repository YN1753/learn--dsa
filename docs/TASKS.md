
---

# TASKS.md

```md
# DSA Interactive Learning System
# TASKS.md

---

# CURRENT PRIORITY

```txt
Build a complete simulation-first DSA learning platform.
Global Rules

每完成一个 topic：

必须：

npm run build
修复所有类型错误
测试 dark mode
测试 mobile
commit
TODO — Foundation
Layout
 Root layout
 Sidebar collapse
 Mobile sidebar overlay
 Header actions
Theme
 Light mode
 Dark mode
 localStorage persistence
Shared Components
 VisualizationWrapper
 QuizRenderer
 TopicCard
 StepController
TODO — Visualization System
Shared Controls
 play/pause
 reset
 next/prev
 speed selector
Shared UI
 state badge
 complexity badge
 pseudo code viewer
 variable panel
TODO — Data Structures
Arrays
 insertion animation
 deletion animation
 dynamic resize
Linked List
 pointer visualization
 reverse animation
 insert/delete
Stack
 push/pop animation
 expression evaluation
Queue
 circular queue
 deque
Hash Table
 collision visualization
 rehash animation
TODO — Trees
BST
 insert
 delete
 traversal
AVL
 LL/LR/RL/RR rotations
Heap
 heapify
 priority queue
Trie
 insertion
 prefix matching
TODO — Graph
BFS
 queue state
 visited state
DFS
 recursion stack
 traversal order
Dijkstra
 priority queue
 shortest path update
MST
 edge selection
 cycle detection
TODO — Algorithms
Sorting
 bubble sort
 selection sort
 insertion sort
 merge sort
 quick sort
 heap sort
Binary Search
 lower bound
 upper bound
Dynamic Programming
 knapsack
 LIS
 path DP
TODO — Quiz System
 score statistics
 retry wrong questions
 answer explanation panel
TODO — Optimization
 reduce unnecessary rerender
 improve animation smoothness
 improve mobile layout
FUTURE
Advanced Algorithms
 segment tree
 fenwick tree
 network flow
 suffix automaton
 tarjan
 lca
RELEASE CHECKLIST

发布前：

 build passes
 no TS errors
 no hydration mismatch
 mobile tested
 dark mode verified
 all visualizations interactive
 all quizzes complete