// 哈希表演示 - 链地址法实现

interface HashNode {
  key: string
  value: number
  next: HashNode | null
}

class SimpleHashTable {
  private buckets: (HashNode | null)[]
  private capacity: number
  private count: number = 0

  constructor(capacity: number = 7) {
    this.capacity = capacity
    this.buckets = new Array(capacity).fill(null)
  }

  // 简单哈希函数：将字符串的字符编码求和后取模
  hash(key: string): number {
    let hashValue = 0
    for (let i = 0; i < key.length; i++) {
      hashValue += key.charCodeAt(i)
    }
    return hashValue % this.capacity
  }

  // 插入键值对（链地址法处理冲突）
  insert(key: string, value: number): { bucket: number; chainPosition: number } {
    const bucket = this.hash(key)
    let current = this.buckets[bucket]
    let position = 0

    // 检查是否已存在该 key，若存在则更新
    while (current !== null) {
      if (current.key === key) {
        current.value = value
        return { bucket, chainPosition: position }
      }
      current = current.next
      position++
    }

    // 头部插入新节点
    const newNode: HashNode = { key, value, next: this.buckets[bucket] }
    this.buckets[bucket] = newNode
    this.count++
    return { bucket, chainPosition: 0 }
  }

  // 查找
  search(key: string): { found: boolean; value?: number; bucket: number; steps: number } {
    const bucket = this.hash(key)
    let current = this.buckets[bucket]
    let steps = 0

    while (current !== null) {
      steps++
      if (current.key === key) {
        return { found: true, value: current.value, bucket, steps }
      }
      current = current.next
    }

    return { found: false, bucket, steps }
  }

  // 删除
  delete(key: string): boolean {
    const bucket = this.hash(key)
    let current = this.buckets[bucket]
    let prev: HashNode | null = null

    while (current !== null) {
      if (current.key === key) {
        if (prev === null) {
          this.buckets[bucket] = current.next
        } else {
          prev.next = current.next
        }
        this.count--
        return true
      }
      prev = current
      current = current.next
    }
    return false
  }

  // 获取负载因子
  getLoadFactor(): number {
    return this.count / this.capacity
  }

  // 打印哈希表状态
  print(): string {
    const lines: string[] = []
    for (let i = 0; i < this.capacity; i++) {
      const items: string[] = []
      let current = this.buckets[i]
      while (current !== null) {
        items.push(`[${current.key}:${current.value}]`)
        current = current.next
      }
      const chain = items.length > 0 ? items.join(' -> ') + ' -> null' : 'null'
      lines.push(`  桶[${i}]: ${chain}`)
    }
    return lines.join('\n')
  }

  // 统计分布信息
  getDistribution(): { occupied: number; maxChainLength: number; avgChainLength: number } {
    let occupied = 0
    let maxChain = 0
    let totalChain = 0

    for (let i = 0; i < this.capacity; i++) {
      let length = 0
      let current = this.buckets[i]
      while (current !== null) {
        length++
        current = current.next
      }
      if (length > 0) {
        occupied++
        totalChain += length
      }
      maxChain = Math.max(maxChain, length)
    }

    return {
      occupied,
      maxChainLength: maxChain,
      avgChainLength: occupied > 0 ? totalChain / occupied : 0,
    }
  }
}

export default function hashTableDemo(): string {
  const output: string[] = []

  output.push('=== 哈希表演示（链地址法）===')
  output.push('')
  output.push('哈希函数: hash(key) = sum(charCode(key)) % capacity')
  output.push('初始容量: 7')
  output.push('')

  const table = new SimpleHashTable(7)

  // 插入数据
  output.push('1. 插入键值对')
  const entries: [string, number][] = [
    ['apple', 100],
    ['banana', 200],
    ['cherry', 300],
    ['date', 400],
    ['elderberry', 500],
    ['fig', 600],
    ['grape', 700],
  ]

  for (const [key, value] of entries) {
    const result = table.insert(key, value)
    const hashVal = table.hash(key)
    output.push(`   插入 "${key}": ${value}  hash("${key}") = ${hashVal} -> 桶[${result.bucket}]`)
  }
  output.push('')
  output.push('   当前哈希表状态:')
  output.push(table.print())
  output.push(`   负载因子: ${table.getLoadFactor().toFixed(2)}`)
  output.push('')

  // 演示冲突
  output.push('2. 演示哈希冲突')
  output.push(`   hash("apple") = ${table.hash('apple')}`)
  output.push(`   hash("cherry") = ${table.hash('cherry')}`)
  if (table.hash('apple') === table.hash('cherry')) {
    output.push('   --> "apple" 和 "cherry" 映射到同一个桶！通过链表处理冲突')
  } else {
    // 找一对确实冲突的 key
    output.push('   尝试插入冲突示例...')
  }
  output.push('')

  // 插入导致冲突的键
  const conflictKey = 'peach'
  const conflictHash = table.hash(conflictKey)
  output.push(`   插入 "${conflictKey}": 800  hash("${conflictKey}") = ${conflictHash}`)

  // 找同桶的键
  let sameKey = ''
  for (const [k] of entries) {
    if (table.hash(k) === conflictHash && k !== conflictKey) {
      sameKey = k
      break
    }
  }
  if (sameKey) {
    output.push(`   与 "${sameKey}" (hash=${table.hash(sameKey)}) 映射到同一个桶[${conflictHash}]`)
    output.push('   通过链表头部插入解决冲突')
  }
  table.insert(conflictKey, 800)
  output.push('')
  output.push('   插入后的桶状态:')
  output.push(table.print())
  output.push('')

  // 查找操作
  output.push('3. 查找操作')
  const searchTests = ['banana', 'cherry', 'mango']
  for (const key of searchTests) {
    const result = table.search(key)
    if (result.found) {
      output.push(`   查找 "${key}": 找到! 值=${result.value}, 桶[${result.bucket}], 步骤=${result.steps}`)
    } else {
      output.push(`   查找 "${key}": 未找到, 桶[${result.bucket}], 步骤=${result.steps}`)
    }
  }
  output.push('')

  // 删除操作
  output.push('4. 删除操作')
  const deleteKey = 'cherry'
  output.push(`   删除 "${deleteKey}": ${table.delete(deleteKey) ? '成功' : '失败'}`)
  output.push('   删除后的桶状态:')
  output.push(table.print())
  output.push('')

  // 分布统计
  output.push('5. 哈希分布统计')
  const dist = table.getDistribution()
  output.push(`   已占用桶数: ${dist.occupied} / ${7}`)
  output.push(`   最长链长度: ${dist.maxChainLength}`)
  output.push(`   平均链长度: ${dist.avgChainLength.toFixed(2)}`)
  output.push(`   当前负载因子: ${table.getLoadFactor().toFixed(2)}`)
  output.push('')

  // 哈希函数示例
  output.push('6. 哈希函数工作原理')
  output.push('   hash("hello") = (104+101+108+108+111) % 7 = 532 % 7 = ' + (532 % 7))
  output.push('   hash("world") = (119+111+114+108+100) % 7 = 552 % 7 = ' + (552 % 7))
  output.push('   hash("test")  = (116+101+115+116) % 7 = 448 % 7 = ' + (448 % 7))
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
