# 链表 (Linked List)

## 概念解释

链表是一种**线性数据结构**，其中元素（称为**节点**）不必存储在连续的内存空间中。每个节点包含两部分：

- **数据域**：存储实际数据
- **指针域**：存储指向下一个节点的地址

### 基本术语

| 术语 | 说明 |
|------|------|
| 节点 (Node) | 链表的基本单元，包含数据和指针 |
| 头指针 (Head) | 指向第一个节点的指针 |
| 尾指针 (Tail) | 指向最后一个节点的指针（可选） |
| 空指针 (Null) | 表示链表的结束 |

### 单链表 vs 双链表

**单链表 (Singly Linked List)**：
- 每个节点只有一个指向下一节点的指针
- 只能单向遍历
- 节省内存空间

```
[数据|next] -> [数据|next] -> [数据|next] -> null
```

**双链表 (Doubly Linked List)**：
- 每个节点有两个指针：`prev` 和 `next`
- 可以双向遍历
- 插入删除更方便，但占用更多内存

```
null <- [prev|数据|next] <-> [prev|数据|next] <-> [prev|数据|next] -> null
```

## 为什么重要

链表在计算机科学中具有重要地位：

1. **动态大小**：不需要预先分配固定大小的内存，可以随时增加或减少节点
2. **高效插入删除**：在已知位置的情况下，插入和删除操作的时间复杂度为 O(1)
3. **基础数据结构**：栈、队列等抽象数据类型可以用链表实现
4. **内存灵活**：不要求连续内存空间，适合内存碎片化的场景

## 核心原理

### 节点结构

```typescript
class ListNode<T> {
  data: T
  next: ListNode<T> | null

  constructor(data: T) {
    this.data = data
    this.next = null
  }
}
```

### 链表操作

#### 1. 遍历 (Traversal)

从头节点开始，沿着 `next` 指针逐个访问节点：

```typescript
function traverse(head: ListNode<any> | null): void {
  let current = head
  while (current !== null) {
    console.log(current.data)
    current = current.next
  }
}
```

**时间复杂度**：O(n)

#### 2. 头部插入 (Insert at Head)

在链表开头添加新节点，新节点成为新的头节点：

```typescript
function insertAtHead(head: ListNode<T>, data: T): ListNode<T> {
  const newNode = new ListNode(data)
  newNode.next = head  // 新节点指向原头节点
  return newNode       // 新节点成为新头节点
}
```

**时间复杂度**：O(1)

#### 3. 尾部插入 (Insert at Tail)

在链表末尾添加新节点：

```typescript
function insertAtTail(head: ListNode<T>, data: T): ListNode<T> {
  const newNode = new ListNode(data)
  if (head === null) return newNode

  let current = head
  while (current.next !== null) {
    current = current.next
  }
  current.next = newNode
  return head
}
```

**时间复杂度**：O(n)，需要遍历到末尾

#### 4. 指定位置插入 (Insert at Position)

在指定位置插入新节点：

```typescript
function insertAtPosition(head: ListNode<T>, data: T, position: number): ListNode<T> {
  if (position === 0) return insertAtHead(head, data)

  const newNode = new ListNode(data)
  let current = head
  for (let i = 0; i < position - 1 && current !== null; i++) {
    current = current.next
  }

  if (current === null) return head

  newNode.next = current.next
  current.next = newNode
  return head
}
```

**时间复杂度**：O(n)

#### 5. 删除节点 (Delete Node)

删除指定节点：

```typescript
function deleteNode(head: ListNode<T>, target: T): ListNode<T> | null {
  if (head === null) return null

  // 如果要删除的是头节点
  if (head.data === target) return head.next

  let current = head
  while (current.next !== null && current.next.data !== target) {
    current = current.next
  }

  if (current.next !== null) {
    current.next = current.next.next
  }

  return head
}
```

**时间复杂度**：O(n)

#### 6. 搜索 (Search)

查找指定值的节点：

```typescript
function search(head: ListNode<T>, target: T): ListNode<T> | null {
  let current = head
  while (current !== null) {
    if (current.data === target) return current
    current = current.next
  }
  return null
}
```

**时间复杂度**：O(n)

### 时间复杂度总结

| 操作 | 时间复杂度 | 说明 |
|------|------------|------|
| 头部插入 | O(1) | 直接修改头指针 |
| 尾部插入 | O(n) | 需要遍历到末尾 |
| 指定位置插入 | O(n) | 需要遍历到指定位置 |
| 删除节点 | O(n) | 需要先找到节点 |
| 搜索 | O(n) | 需要遍历整个链表 |
| 访问第i个元素 | O(n) | 不能随机访问 |

## 可视化说明

在可视化界面中，链表通常表示为：

```
┌─────┬─────┐    ┌─────┬─────┐    ┌─────┬─────┐
│  A  │  ───┼───>│  B  │  ───┼───>│  C  │ null│
└─────┴─────┘    └─────┴─────┘    └─────┴─────┘
```

- **方框**表示节点
- **箭头**表示指针关系
- **null**表示链表结束

通过可视化可以直观地观察：
- 插入操作如何改变指针指向
- 删除操作如何"跳过"被删除节点
- 遍历过程如何逐个访问节点

## 常见错误

### 1. 空指针异常 (Null Pointer Exception)

```typescript
// 错误：没有检查链表是否为空
function getFirst(head: ListNode<T>): T {
  return head.data  // 如果 head 为 null，会报错
}

// 正确：先检查是否为空
function getFirst(head: ListNode<T> | null): T | null {
  if (head === null) return null
  return head.data
}
```

### 2. 丢失头节点引用

```typescript
// 错误：在遍历时修改了头节点
function badDelete(head: ListNode<T>): void {
  head = head.next  // 只修改了局部变量，不影响外部
}

// 正确：返回新的头节点
function goodDelete(head: ListNode<T>): ListNode<T> | null {
  return head.next
}
```

### 3. 循环链表检测

如果链表中存在环，遍历会陷入无限循环。使用**快慢指针法**检测：

```typescript
function hasCycle(head: ListNode<T>): boolean {
  let slow = head
  let fast = head

  while (fast !== null && fast.next !== null) {
    slow = slow.next        // 慢指针每次走一步
    fast = fast.next.next   // 快指针每次走两步
    if (slow === fast) return true
  }

  return false
}
```

## 实际应用

### 1. LRU 缓存 (Least Recently Used Cache)

LRU 缓存使用**双向链表 + 哈希表**实现：
- 哈希表提供 O(1) 的查找
- 双向链表维护访问顺序
- 最近访问的节点移到链表头部
- 缓存满时删除链表尾部节点

### 2. 撤销功能 (Undo Functionality)

文本编辑器的撤销功能可以用链表实现：
- 每次操作作为一个节点
- 新操作添加到链表头部
- 撤销时移动到上一个节点
- 重做时移动到下一个节点

### 3. 音乐播放列表

音乐播放器的播放列表可以使用循环链表：
- 每首歌是一个节点
- 循环链表实现"循环播放"
- 双向链表支持"上一首"和"下一首"

### 4. 操作系统任务调度

操作系统使用链表管理进程：
- 就绪队列、等待队列都是链表
- 进程状态改变时，在链表间移动节点

## 总结

链表是一种基础而重要的数据结构：

**优点**：
- 动态大小，无需预先分配内存
- 在已知位置的插入删除操作高效 O(1)
- 不要求连续内存空间
- 可以方便地实现栈、队列等数据结构

**缺点**：
- 不能随机访问，访问第 i 个元素需要 O(n)
- 每个节点需要额外的指针空间
- 缓存不友好（节点在内存中不连续）

**适用场景**：
- 频繁插入删除的场景
- 无法预知数据量大小的场景
- 需要实现栈、队列等抽象数据类型
- LRU 缓存、撤销功能等特定应用

理解链表是学习更复杂数据结构（如树、图）的基础，因为这些结构本质上都是节点和指针的组合。
