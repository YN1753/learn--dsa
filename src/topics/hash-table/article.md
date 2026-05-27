# 哈希表 (Hash Table)

## 概念解释

哈希表（Hash Table），也称为散列表，是一种通过**哈希函数**将键（Key）映射到数组索引，从而实现快速数据存取的数据结构。它是计算机科学中最重要的数据结构之一。

### 核心组件

哈希表由三个核心部分组成：

- **键（Key）**：用于标识数据的唯一标识符，如字符串、数字等
- **哈希函数（Hash Function）**：将任意大小的键转换为固定范围的整数（数组索引）
- **桶数组（Bucket Array）**：存储实际数据的数组，每个位置称为一个"桶"

### 基本术语

| 术语 | 说明 |
|------|------|
| 哈希函数 (Hash Function) | 将键映射为数组索引的函数 |
| 桶 (Bucket) | 哈希表数组中的一个位置 |
| 冲突 (Collision) | 不同的键映射到相同的索引 |
| 负载因子 (Load Factor) | 元素数量 / 桶的数量 |
| 再哈希 (Rehashing) | 扩容后重新计算所有元素的位置 |

### 工作原理示意

```
键 "apple" → 哈希函数 → 3 → 桶[3] 存储值
键 "banana" → 哈希函数 → 1 → 桶[1] 存储值
键 "cherry" → 哈希函数 → 3 → 桶[3] (冲突！需要处理)
```

## 为什么重要

哈希表在现代编程中无处不在，它的重要性体现在：

1. **O(1) 平均查找**：在理想情况下，插入、查找、删除操作的平均时间复杂度都是 O(1)，这是数组和链表无法比拟的
2. **语言内置支持**：几乎每种编程语言都内置了哈希表实现——Python 的 `dict`、Java 的 `HashMap`、JavaScript 的 `Map` 和 `Object`、C++ 的 `unordered_map`
3. **通用性强**：可以存储任意类型的键值对，适用于各种场景
4. **工程基石**：数据库索引、缓存系统、编译器符号表等核心组件都依赖哈希表

## 核心原理

### 哈希函数设计

一个好的哈希函数应该具备以下特性：

1. **确定性**：相同的输入始终产生相同的输出
2. **均匀性**：输出应均匀分布在整个范围内，减少冲突
3. **高效性**：计算速度快，不应成为性能瓶颈

```typescript
// 简单的字符串哈希函数
function simpleHash(key: string, capacity: number): number {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i)
  }
  return hash % capacity
}

// 更好的哈希函数（djb2 算法）
function djb2Hash(key: string, capacity: number): number {
  let hash = 5381
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash + key.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(hash) % capacity
}
```

### 冲突解决

哈希冲突是不可避免的——当两个不同的键映射到同一个桶时，就需要冲突解决策略。

#### 方法一：链地址法 (Chaining)

每个桶维护一个链表，所有映射到该桶的元素都存储在链表中：

```
桶[0]: null
桶[1]: [banana:200] -> null
桶[2]: null
桶[3]: [apple:100] -> [cherry:300] -> null
桶[4]: null
桶[5]: null
桶[6]: null
```

```typescript
class HashTableChaining {
  private buckets: ListNode[][]

  insert(key: string, value: number): void {
    const index = this.hash(key)
    // 检查是否已存在
    for (const node of this.buckets[index]) {
      if (node.key === key) {
        node.value = value  // 更新
        return
      }
    }
    this.buckets[index].push({ key, value })  // 添加到链表
  }
}
```

#### 方法二：开放寻址法 (Open Addressing)

当冲突发生时，按照某种探测序列寻找下一个空闲位置：

```typescript
// 线性探测：冲突时检查下一个位置
function linearProbe(hash: number, i: number, capacity: number): number {
  return (hash + i) % capacity
}

// 二次探测：冲突时按二次方跳跃
function quadraticProbe(hash: number, i: number, capacity: number): number {
  return (hash + i * i) % capacity
}
```

```
线性探测过程：
插入 "apple"  → hash=3 → 桶[3] 空 → 放入
插入 "cherry" → hash=3 → 桶[3] 已满 → 检查桶[4] → 空 → 放入
插入 "date"   → hash=4 → 桶[4] 已满 → 检查桶[5] → 空 → 放入
```

### 再哈希 (Rehashing)

当负载因子过高时，需要扩容并重新分配所有元素：

```typescript
private rehash(): void {
  const oldBuckets = this.buckets
  this.capacity *= 2  // 容量翻倍
  this.buckets = new Array(this.capacity).fill(null)
  this.count = 0

  // 将所有元素重新插入
  for (const bucket of oldBuckets) {
    if (bucket) {
      for (const entry of bucket) {
        this.insert(entry.key, entry.value)
      }
    }
  }
}
```

### 时间复杂度

| 操作 | 平均情况 | 最坏情况 | 说明 |
|------|----------|----------|------|
| 插入 | O(1) | O(n) | 最坏情况所有键在同一桶 |
| 查找 | O(1) | O(n) | 需要遍历链表或探测序列 |
| 删除 | O(1) | O(n) | 需要先找到元素 |

## 可视化说明

在可视化界面中，哈希表展示为：

- **上方**：桶数组，每个方框代表一个桶
- **下方**：链表节点，展示冲突时的链地址法
- **高亮**：不同颜色表示当前操作阶段

通过动画可以观察：
- 哈希函数如何将键映射到桶
- 冲突发生时链表如何增长
- 查找过程中如何遍历链表

## 常见错误

### 1. 哈希函数设计不当导致聚集

```typescript
// 错误：简单的取模运算，连续键导致聚集
function badHash(key: number, capacity: number): number {
  return key % capacity  // 如果 key 是 10,20,30... 都映射到同一个桶
}

// 正确：使用更好的哈希函数
function goodHash(key: number, capacity: number): number {
  key = ((key >> 16) ^ key) * 0x45d9f3b
  key = ((key >> 16) ^ key) * 0x45d9f3b
  key = (key >> 16) ^ key
  return Math.abs(key) % capacity
}
```

### 2. 忘记处理冲突

```typescript
// 错误：直接覆盖，丢失已有数据
function badInsert(key: string, value: number): void {
  const index = this.hash(key)
  this.buckets[index] = { key, value }  // 如果桶里已有数据会被覆盖！
}

// 正确：使用链表或探测
function goodInsert(key: string, value: number): void {
  const index = this.hash(key)
  if (!this.buckets[index]) {
    this.buckets[index] = []
  }
  this.buckets[index].push({ key, value })
}
```

### 3. 负载因子过高导致性能退化

```typescript
// 错误：不检查负载因子
// 当元素数量远大于桶数量时，链表变长，O(1) 退化为 O(n)

// 正确：监控负载因子，及时扩容
if (this.count / this.capacity > 0.75) {
  this.rehash()
}
```

## 实际应用

### 1. 数据库索引

数据库使用哈希索引加速等值查询。当执行 `WHERE id = 12345` 时，哈希表可以在 O(1) 时间内定位到目标记录。

### 2. 缓存系统

浏览器缓存、CDN、Redis 等都使用哈希表存储已缓存的数据。通过 URL 或键名快速查找缓存内容，避免重复计算或网络请求。

### 3. 编译器符号表

编译器使用哈希表记录变量名、函数名等标识符的信息（类型、作用域、内存地址），在语法分析和代码生成阶段快速查找。

### 4. 去重 (Deduplication)

```typescript
function deduplicate(arr: number[]): number[] {
  const seen = new Set<number>()  // Set 底层就是哈希表
  return arr.filter(item => {
    if (seen.has(item)) return false
    seen.add(item)
    return true
  })
}
```

### 5. 计数统计

```typescript
function countFrequency(arr: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const item of arr) {
    freq.set(item, (freq.get(item) || 0) + 1)
  }
  return freq
}
```

### 6. 两数之和问题

```typescript
function twoSum(nums: number[], target: number): [number, number] {
  const map = new Map<number, number>()
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (map.has(complement)) {
      return [map.get(complement)!, i]
    }
    map.set(nums[i], i)
  }
  return [-1, -1]
}
```

## 总结

哈希表是计算机科学中最实用的数据结构之一：

**核心思想**：通过哈希函数将键映射为数组索引，实现 O(1) 的平均存取。

**优点**：
- 平均 O(1) 的插入、查找、删除
- 实现简单，编程语言内置支持
- 适用范围广泛

**缺点**：
- 最坏情况 O(n)（所有键冲突到同一桶）
- 不支持有序遍历
- 哈希函数设计影响性能

**关键要点**：
- 选择好的哈希函数，保证均匀分布
- 合理设置负载因子阈值（通常 0.75），及时 rehash
- 根据场景选择冲突解决策略：链地址法实现简单，开放寻址缓存友好

理解哈希表是掌握 HashMap、Set、缓存系统等高级数据结构和工程实践的基础。
