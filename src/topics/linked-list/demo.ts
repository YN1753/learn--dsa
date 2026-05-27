interface ListNode<T> {
  data: T
  next: ListNode<T> | null
}

function createNode<T>(data: T): ListNode<T> {
  return { data, next: null }
}

function printList<T>(head: ListNode<T> | null): string {
  const values: T[] = []
  let current = head
  while (current !== null) {
    values.push(current.data)
    current = current.next
  }
  return values.join(' -> ') + ' -> null'
}

export default function linkedListDemo(): string {
  const output: string[] = []

  output.push('=== 链表演示 ===\n')

  // 创建链表
  output.push('1. 创建链表: 1 -> 2 -> 3')
  let head = createNode(1)
  head.next = createNode(2)
  head.next.next = createNode(3)
  output.push(`   当前链表: ${printList(head)}\n`)

  // 头部插入
  output.push('2. 在头部插入 0')
  const newHead = createNode(0)
  newHead.next = head
  head = newHead
  output.push(`   当前链表: ${printList(head)}\n`)

  // 尾部插入
  output.push('3. 在尾部插入 4')
  let current = head
  while (current.next !== null) {
    current = current.next
  }
  current.next = createNode(4)
  output.push(`   当前链表: ${printList(head)}\n`)

  // 中间插入
  output.push('4. 在位置 2 插入 99 (在 2 和 3 之间)')
  current = head
  for (let i = 0; i < 1; i++) {
    if (current.next !== null) {
      current = current.next
    }
  }
  const newNode = createNode(99)
  newNode.next = current.next
  current.next = newNode
  output.push(`   当前链表: ${printList(head)}\n`)

  // 删除节点
  output.push('5. 删除值为 99 的节点')
  if (head.data === 99) {
    head = head.next!
  } else {
    current = head
    while (current.next !== null && current.next.data !== 99) {
      current = current.next
    }
    if (current.next !== null) {
      current.next = current.next.next
    }
  }
  output.push(`   当前链表: ${printList(head)}\n`)

  // 搜索节点
  output.push('6. 搜索值为 3 的节点')
  let searchCurrent: ListNode<number> | null = head
  let position = 0
  let found = false
  while (searchCurrent !== null) {
    if (searchCurrent.data === 3) {
      output.push(`   找到节点，值为 ${searchCurrent.data}，位置为 ${position}`)
      found = true
      break
    }
    searchCurrent = searchCurrent.next
    position++
  }
  if (!found) {
    output.push('   未找到节点')
  }
  output.push('')

  // 遍历链表
  output.push('7. 遍历整个链表:')
  let traverseCurrent: ListNode<number> | null = head
  let traversePosition = 0
  while (traverseCurrent !== null) {
    output.push(`   位置 ${traversePosition}: 值 = ${traverseCurrent.data}`)
    traverseCurrent = traverseCurrent.next
    traversePosition++
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
