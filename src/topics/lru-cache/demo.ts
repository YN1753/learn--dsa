interface LRUNode {
  key: number
  value: number
  prev: LRUNode | null
  next: LRUNode | null
}

class LRUCache {
  private capacity: number
  private map: Map<number, LRUNode>
  private head: LRUNode
  private tail: LRUNode

  constructor(capacity: number) {
    this.capacity = capacity
    this.map = new Map()
    // 哨兵节点
    this.head = { key: -1, value: -1, prev: null, next: null }
    this.tail = { key: -1, value: -1, prev: null, next: null }
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  private addToHead(node: LRUNode): void {
    node.next = this.head.next
    node.prev = this.head
    this.head.next!.prev = node
    this.head.next = node
  }

  private removeNode(node: LRUNode): void {
    node.prev!.next = node.next
    node.next!.prev = node.prev
  }

  private moveToHead(node: LRUNode): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  private removeTail(): LRUNode {
    const node = this.tail.prev!
    this.removeNode(node)
    return node
  }

  get(key: number): number | null {
    const node = this.map.get(key)
    if (!node) return null
    this.moveToHead(node)
    return node.value
  }

  put(key: number, value: number): { evicted: number | null } {
    let evicted: number | null = null
    const existing = this.map.get(key)

    if (existing) {
      existing.value = value
      this.moveToHead(existing)
    } else {
      const newNode: LRUNode = { key, value, prev: null, next: null }
      this.map.set(key, newNode)
      this.addToHead(newNode)

      if (this.map.size > this.capacity) {
        const tail = this.removeTail()
        this.map.delete(tail.key)
        evicted = tail.key
      }
    }

    return { evicted }
  }

  getState(): string {
    const items: string[] = []
    let current = this.head.next
    while (current && current !== this.tail) {
      items.push(`[${current.key}:${current.value}]`)
      current = current.next
    }
    return items.length > 0 ? items.join(' <-> ') : '(空)'
  }

  getHashMapState(): string {
    const entries: string[] = []
    for (const [key, node] of this.map) {
      entries.push(`${key} -> ${node.value}`)
    }
    return entries.length > 0 ? `{ ${entries.join(', ')} }` : '(空)'
  }
}

export default function lruCacheDemo(): string {
  const output: string[] = []
  const cache = new LRUCache(3)

  output.push('=== LRU 缓存演示 ===')
  output.push(`容量: 3\n`)

  // Step 1: put(1, 10)
  output.push('1. put(1, 10) — 插入键 1，值 10')
  const r1 = cache.put(1, 10)
  output.push(`   链表: ${cache.getState()}`)
  output.push(`   哈希: ${cache.getHashMapState()}`)
  output.push(`   淘汰: ${r1.evicted !== null ? '键 ' + r1.evicted : '无'}\n`)

  // Step 2: put(2, 20)
  output.push('2. put(2, 20) — 插入键 2，值 20')
  const r2 = cache.put(2, 20)
  output.push(`   链表: ${cache.getState()}`)
  output.push(`   哈希: ${cache.getHashMapState()}`)
  output.push(`   淘汰: ${r2.evicted !== null ? '键 ' + r2.evicted : '无'}\n`)

  // Step 3: put(3, 30)
  output.push('3. put(3, 30) — 插入键 3，值 30')
  const r3 = cache.put(3, 30)
  output.push(`   链表: ${cache.getState()}`)
  output.push(`   哈希: ${cache.getHashMapState()}`)
  output.push(`   淘汰: ${r3.evicted !== null ? '键 ' + r3.evicted : '无'}\n`)

  // Step 4: get(1) — 访问键 1，将其移到头部
  output.push('4. get(1) — 访问键 1，将其移到链表头部（最近使用）')
  const v1 = cache.get(1)
  output.push(`   返回: ${v1}`)
  output.push(`   链表: ${cache.getState()}`)
  output.push(`   哈希: ${cache.getHashMapState()}\n`)

  // Step 5: put(4, 40) — 容量满，淘汰最久未使用的键 2
  output.push('5. put(4, 40) — 容量已满，插入键 4，淘汰最久未使用的键 2')
  const r5 = cache.put(4, 40)
  output.push(`   链表: ${cache.getState()}`)
  output.push(`   哈希: ${cache.getHashMapState()}`)
  output.push(`   淘汰: ${r5.evicted !== null ? '键 ' + r5.evicted : '无'}\n`)

  // Step 6: get(2) — 访问已淘汰的键
  output.push('6. get(2) — 尝试访问已淘汰的键 2')
  const v2 = cache.get(2)
  output.push(`   返回: ${v2}（未找到，返回 null）\n`)

  // Step 7: get(3)
  output.push('7. get(3) — 访问键 3，将其移到链表头部')
  const v3 = cache.get(3)
  output.push(`   返回: ${v3}`)
  output.push(`   链表: ${cache.getState()}`)
  output.push(`   哈希: ${cache.getHashMapState()}\n`)

  // Step 8: put(5, 50) — 淘汰最久未使用的键 4
  output.push('8. put(5, 50) — 容量已满，插入键 5，淘汰最久未使用的键 4')
  const r8 = cache.put(5, 50)
  output.push(`   链表: ${cache.getState()}`)
  output.push(`   哈希: ${cache.getHashMapState()}`)
  output.push(`   淘汰: ${r8.evicted !== null ? '键 ' + r8.evicted : '无'}\n`)

  // Step 9: 更新已有键
  output.push('9. put(3, 300) — 更新键 3 的值为 300（不会淘汰，因为 key 已存在）')
  const r9 = cache.put(3, 300)
  output.push(`   链表: ${cache.getState()}`)
  output.push(`   哈希: ${cache.getHashMapState()}`)
  output.push(`   淘汰: ${r9.evicted !== null ? '键 ' + r9.evicted : '无'}\n`)

  // Step 10: get(4) — 已淘汰
  output.push('10. get(4) — 尝试访问已淘汰的键 4')
  const v4 = cache.get(4)
  output.push(`    返回: ${v4}（未找到）\n`)

  output.push('=== 演示结束 ===')
  output.push('')
  output.push('关键观察:')
  output.push('- get 操作会将访问的节点移到链表头部（标记为最近使用）')
  output.push('- put 新键时，若容量已满，淘汰链表尾部节点（最久未使用）')
  output.push('- put 已有键时只更新值并移到头部，不触发淘汰')
  output.push('- 所有操作的时间复杂度均为 O(1)')

  return output.join('\n')
}
