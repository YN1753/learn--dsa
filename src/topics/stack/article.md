# 栈 (Stack)

## 概念解释

栈是一种遵循**后进先出**（LIFO, Last In First Out）原则的线性数据结构。想象一摞叠放的盘子：你只能从最顶部拿起盘子（弹出），也只能把新盘子放在最顶部（压入）。

栈只允许在一端（称为**栈顶**）进行插入和删除操作，另一端称为**栈底**。栈底是固定的，最先放入的元素位于栈底。

### 核心操作

- **push（压栈）**：将一个元素添加到栈顶。时间复杂度 O(1)
- **pop（弹栈）**：移除并返回栈顶元素。时间复杂度 O(1)
- **peek / top（查看栈顶）**：返回栈顶元素但不移除。时间复杂度 O(1)
- **isEmpty（判空）**：检查栈是否为空。时间复杂度 O(1)

所有操作都在栈顶进行，因此每个操作的时间复杂度都是 O(1)。

## 为什么重要

栈虽然结构简单，但它是计算机科学中最基础、最重要的数据结构之一：

### 函数调用栈

每次调用函数时，系统会将函数的返回地址、局部变量等信息压入**调用栈**（Call Stack）。函数返回时，这些信息从栈中弹出。这就是为什么递归能够工作的基础——每次递归调用都创建一个新的栈帧。

```text
main()          栈底 → [main]
  ├─ foo()            [main, foo]
  │  └─ bar()         [main, foo, bar]
  │  ← bar返回        [main, foo]
  ← foo返回           [main]
← main返回           []
```

### 表达式求值

编译器使用栈来计算数学表达式。中缀表达式（如 `3 + 4 * 2`）通过栈转换为后缀表达式（如 `3 4 2 * +`），再用栈进行求值。

### 回溯算法

在迷宫求解、八皇后等问题中，栈用于记录已走过的路径。当遇到死胡同时，回退到上一个分叉点重新选择。

### 深度优先搜索 (DFS)

图和树的深度优先搜索本质上就是栈操作的递归版本，也可以用显式栈来实现非递归版本。

## 核心原理

### 基于数组的实现

```typescript
class ArrayStack<T> {
  private items: T[] = []
  private maxSize: number

  constructor(size: number) {
    this.maxSize = size
  }

  push(item: T): void {
    if (this.isFull()) throw new Error('栈溢出')
    this.items.push(item)
  }

  pop(): T | undefined {
    if (this.isEmpty()) throw new Error('栈为空')
    return this.items.pop()
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1]
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  isFull(): boolean {
    return this.items.length >= this.maxSize
  }

  size(): number {
    return this.items.length
  }
}
```

**优点**：内存连续，缓存友好，实现简单。
**缺点**：需要预设大小（静态数组）或可能浪费内存（动态数组扩容）。

### 基于链表的实现

```typescript
class ListNode<T> {
  constructor(
    public data: T,
    public next: ListNode<T> | null = null
  ) {}
}

class LinkedStack<T> {
  private head: ListNode<T> | null = null
  private count = 0

  push(item: T): void {
    const node = new ListNode(item, this.head)
    this.head = node
    this.count++
  }

  pop(): T | undefined {
    if (!this.head) return undefined
    const data = this.head.data
    this.head = this.head.next
    this.count--
    return data
  }

  peek(): T | undefined {
    return this.head?.data
  }

  isEmpty(): boolean {
    return this.head === null
  }

  size(): number {
    return this.count
  }
}
```

**优点**：动态大小，不需要预设容量。
**缺点**：每个节点需要额外的指针空间，内存不连续。

### 两种实现的比较

| 特性 | 数组实现 | 链表实现 |
|------|---------|---------|
| 内存分配 | 连续 | 分散 |
| 容量 | 固定/需扩容 | 动态 |
| 缓存性能 | 好 | 较差 |
| 额外开销 | 无 | 每节点一个指针 |
| push/pop | O(1) 均摊 | O(1) |

## 可视化说明

在可视化演示中，栈被表示为一个垂直的容器：

- **栈底**在下方，**栈顶**在上方
- **压入操作**：新元素从顶部滑入
- **弹出操作**：顶部元素滑出
- **查看栈顶**：顶部元素高亮显示

每个操作都有动画效果，帮助你直观理解栈的工作方式。

## 常见错误

### 栈溢出 (Stack Overflow)

当栈已满时继续压入元素就会发生栈溢出。在基于数组的固定大小栈中，这是一个真实的问题。在递归中，过深的递归调用也会耗尽调用栈空间。

```typescript
// 危险：无限递归导致栈溢出
function infinite(): void {
  infinite()  // 每次调用都在栈上创建新帧
}
```

### 空栈弹出

对空栈执行 pop 或 peek 操作是常见的边界错误。始终在操作前检查栈是否为空。

```typescript
// 错误示范
const stack = new ArrayStack<number>(10)
stack.pop()  // 栈为空，抛出异常！

// 正确做法
if (!stack.isEmpty()) {
  stack.pop()
}
```

### 混淆栈和队列

初学者容易混淆栈（LIFO）和队列（FIFO）的特性。记住：栈像一摞盘子，队列像排队买票。

## 实际应用

### 撤销/重做 (Undo/Redo)

文字编辑器使用两个栈实现撤销重做功能：

- **撤销栈**：每次操作压入撤销栈
- **重做栈**：执行撤销时，将操作移入重做栈
- 执行新操作时，清空重做栈

### 浏览器历史记录

浏览器的"后退"按钮使用栈来记录访问过的页面。每次访问新页面，当前页面被压入栈。点击"后退"时，从栈中弹出上一个页面。

### 括号匹配

检查括号是否匹配是栈的经典应用：

```typescript
function isBalanced(str: string): boolean {
  const stack: string[] = []
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{'
  }

  for (const char of str) {
    if ('([{'.includes(char)) {
      stack.push(char)
    } else if (')]}'.includes(char)) {
      if (stack.length === 0 || stack.pop() !== pairs[char]) {
        return false
      }
    }
  }

  return stack.length === 0
}

// 测试
isBalanced('{[()]}')  // true
isBalanced('{[(])}')  // false
isBalanced('((()')    // false
```

### 后缀表达式求值

后缀表达式（逆波兰表示法）不需要括号，用栈可以优雅地求值：

```typescript
function evaluatePostfix(expression: string): number {
  const stack: number[] = []
  const tokens = expression.split(' ')

  for (const token of tokens) {
    if ('+-*/'.includes(token)) {
      const b = stack.pop()!
      const a = stack.pop()!
      switch (token) {
        case '+': stack.push(a + b); break
        case '-': stack.push(a - b); break
        case '*': stack.push(a * b); break
        case '/': stack.push(a / b); break
      }
    } else {
      stack.push(Number(token))
    }
  }

  return stack.pop()!
}

// "3 4 + 2 *" 等价于 "(3 + 4) * 2"
evaluatePostfix('3 4 + 2 *')  // 14
```

## 总结

栈是一种简单但强大的数据结构，遵循后进先出(LIFO)原则。它的所有核心操作（push、pop、peek）都是 O(1) 时间复杂度。

栈的关键特性：
- **操作受限**：只能在栈顶进行插入和删除
- **高效**：所有基本操作都是常数时间
- **用途广泛**：从函数调用到表达式求值，从撤销功能到括号匹配

理解栈是理解更复杂数据结构和算法的基础。递归、深度优先搜索、动态规划等高级概念都与栈密切相关。
