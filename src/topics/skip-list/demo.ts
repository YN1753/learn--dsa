interface SkipListNode {
  value: number
  next: SkipListNode[]
}

function createNode(value: number, level: number): SkipListNode {
  return {
    value,
    next: new Array(level + 1).fill(null),
  }
}

function getRandomLevel(maxLevel: number): number {
  let level = 0
  while (Math.random() < 0.5 && level < maxLevel) {
    level++
  }
  return level
}

function buildSkipList(values: number[], maxLevel: number): SkipListNode {
  const head = createNode(-Infinity, maxLevel)
  for (const val of values) {
    insertSkipList(head, val, maxLevel)
  }
  return head
}

function insertSkipList(head: SkipListNode, value: number, maxLevel: number): void {
  const level = getRandomLevel(maxLevel)
  const newNode = createNode(value, level)
  const update: SkipListNode[] = new Array(maxLevel + 1).fill(null)
  let current = head

  for (let i = maxLevel; i >= 0; i--) {
    while (current.next[i] !== null && current.next[i].value < value) {
      current = current.next[i]
    }
    update[i] = current
  }

  for (let i = 0; i <= level; i++) {
    newNode.next[i] = update[i].next[i]
    update[i].next[i] = newNode
  }
}

function searchSkipList(head: SkipListNode, value: number, maxLevel: number): { found: boolean; path: string[] } {
  const path: string[] = []
  let current = head
  let found = false

  for (let i = maxLevel; i >= 0; i--) {
    while (current.next[i] !== null && current.next[i].value < value) {
      path.push(`第 ${i} 层: 从 ${current.value === -Infinity ? 'HEAD' : current.value} 移动到 ${current.next[i].value}`)
      current = current.next[i]
    }
    if (current.next[i] !== null && current.next[i].value === value) {
      path.push(`第 ${i} 层: 找到目标值 ${value}！`)
      found = true
      break
    }
    if (i > 0) {
      path.push(`第 ${i} 层: 未找到，下降到第 ${i - 1} 层`)
    }
  }

  if (!found) {
    path.push(`底层: 目标值 ${value} 不存在`)
  }

  return { found, path }
}

function deleteSkipList(head: SkipListNode, value: number, maxLevel: number): boolean {
  const update: SkipListNode[] = new Array(maxLevel + 1).fill(null)
  let current = head

  for (let i = maxLevel; i >= 0; i--) {
    while (current.next[i] !== null && current.next[i].value < value) {
      current = current.next[i]
    }
    update[i] = current
  }

  current = current.next[0]
  if (current === null || current.value !== value) {
    return false
  }

  for (let i = 0; i <= maxLevel; i++) {
    if (update[i].next[i] !== current) break
    update[i].next[i] = current.next[i]
  }

  return true
}

function printSkipList(head: SkipListNode, maxLevel: number): string {
  const lines: string[] = []
  for (let i = maxLevel; i >= 0; i--) {
    const values: string[] = []
    let current: SkipListNode | null = head.next[i]
    while (current !== null) {
      values.push(String(current.value))
      current = current.next[i]
    }
    const label = i === maxLevel ? `第 ${i} 层 (顶层)` : i === 0 ? '第 0 层 (底层)' : `第 ${i} 层`
    lines.push(`  ${label}: HEAD -> ${values.join(' -> ')} -> null`)
  }
  return lines.join('\n')
}

export default function skipListDemo(): string {
  const output: string[] = []
  const maxLevel = 4

  output.push('=== 跳表演示 ===\n')

  // 构建跳表
  const values = [3, 7, 12, 19, 25, 31, 38, 44, 50]
  output.push(`1. 构建跳表，插入值: ${values.join(', ')}`)
  const head = buildSkipList(values, maxLevel)
  output.push('\n   跳表结构:')
  output.push(printSkipList(head, maxLevel))
  output.push('')

  // 搜索
  const searchTarget = 19
  output.push(`2. 搜索值 ${searchTarget}:`)
  const searchResult = searchSkipList(head, searchTarget, maxLevel)
  for (const step of searchResult.path) {
    output.push(`   ${step}`)
  }
  output.push(`   结果: ${searchResult.found ? '找到了' : '未找到'}\n`)

  // 插入新元素
  const insertValue = 22
  output.push(`3. 插入值 ${insertValue}:`)
  const newLevel = getRandomLevel(maxLevel)
  output.push(`   随机分配层数: ${newLevel} (出现在第 0 到第 ${newLevel} 层)`)
  insertSkipList(head, insertValue, maxLevel)
  output.push('\n   插入后的跳表结构:')
  output.push(printSkipList(head, maxLevel))
  output.push('')

  // 再次搜索
  output.push(`4. 搜索刚插入的值 ${insertValue}:`)
  const searchResult2 = searchSkipList(head, insertValue, maxLevel)
  for (const step of searchResult2.path) {
    output.push(`   ${step}`)
  }
  output.push(`   结果: ${searchResult2.found ? '找到了' : '未找到'}\n`)

  // 删除元素
  const deleteValue = 25
  output.push(`5. 删除值 ${deleteValue}:`)
  const deleted = deleteSkipList(head, deleteValue, maxLevel)
  output.push(`   删除${deleted ? '成功' : '失败（元素不存在）'}`)
  output.push('\n   删除后的跳表结构:')
  output.push(printSkipList(head, maxLevel))
  output.push('')

  // 搜索不存在的元素
  output.push('6. 搜索值 99（不存在的元素）:')
  const searchResult3 = searchSkipList(head, 99, maxLevel)
  for (const step of searchResult3.path) {
    output.push(`   ${step}`)
  }
  output.push(`   结果: ${searchResult3.found ? '找到了' : '未找到'}\n`)

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
