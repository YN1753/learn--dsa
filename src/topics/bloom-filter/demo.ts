// 布隆过滤器演示

class BloomFilter {
  private bits: number[]
  private size: number
  private hashCount: number

  constructor(size: number, hashCount: number) {
    this.size = size
    this.hashCount = hashCount
    this.bits = new Array(size).fill(0)
  }

  // 简单的多哈希函数实现
  private hash(element: string, seed: number): number {
    let hash = 5381 + seed * 33
    for (let i = 0; i < element.length; i++) {
      hash = ((hash << 5) + hash + element.charCodeAt(i)) & 0x7fffffff
    }
    return hash % this.size
  }

  insert(element: string): number[] {
    const positions: number[] = []
    for (let i = 0; i < this.hashCount; i++) {
      const pos = this.hash(element, i)
      positions.push(pos)
      this.bits[pos] = 1
    }
    return positions
  }

  query(element: string): { result: boolean; positions: number[]; bitsAtPositions: number[] } {
    const positions: number[] = []
    const bitsAtPositions: number[] = []
    let allOnes = true

    for (let i = 0; i < this.hashCount; i++) {
      const pos = this.hash(element, i)
      positions.push(pos)
      bitsAtPositions.push(this.bits[pos])
      if (this.bits[pos] === 0) allOnes = false
    }

    return { result: allOnes, positions, bitsAtPositions }
  }

  getBits(): number[] {
    return [...this.bits]
  }

  getOnCount(): number {
    return this.bits.filter(b => b === 1).length
  }
}

export default function bloomFilterDemo(): string {
  const output: string[] = []

  output.push('=== 布隆过滤器演示 ===\n')

  // 创建布隆过滤器
  const size = 20
  const hashCount = 3
  const filter = new BloomFilter(size, hashCount)

  output.push(`位数组大小: ${size}`)
  output.push(`哈希函数个数: ${hashCount}`)
  output.push(`初始位数组: [${filter.getBits().join(', ')}]\n`)

  // 插入元素
  const elements = ['apple', 'banana', 'cherry']
  for (const elem of elements) {
    const positions = filter.insert(elem)
    output.push(`1. 插入 "${elem}":`)
    for (let i = 0; i < hashCount; i++) {
      output.push(`   h${i + 1}("${elem}") = ${positions[i]} → 位数组[${positions[i]}] = 1`)
    }
    output.push(`   位数组状态: [${filter.getBits().join(', ')}]`)
    output.push(`   已置 1 的位数: ${filter.getOnCount()}/${size}\n`)
  }

  // 查询已插入的元素（真阳性）
  output.push('--- 查询测试 ---\n')
  const queryTrue = 'apple'
  const result1 = filter.query(queryTrue)
  output.push(`2. 查询已插入元素 "${queryTrue}":`)
  for (let i = 0; i < hashCount; i++) {
    const status = result1.bitsAtPositions[i] === 1 ? '✓ 为 1' : '✗ 为 0'
    output.push(`   h${i + 1}("${queryTrue}") = ${result1.positions[i]} → 位[${result1.positions[i]}] ${status}`)
  }
  output.push(`   结果: ${result1.result ? '可能存在（正确，元素已插入）' : '一定不存在'}\n`)

  // 查询不存在的元素（可能假阳性或真阴性）
  const queryFalse = 'grape'
  const result2 = filter.query(queryFalse)
  output.push(`3. 查询未插入元素 "${queryFalse}":`)
  for (let i = 0; i < hashCount; i++) {
    const status = result2.bitsAtPositions[i] === 1 ? '✓ 为 1' : '✗ 为 0'
    output.push(`   h${i + 1}("${queryFalse}") = ${result2.positions[i]} → 位[${result2.positions[i]}] ${status}`)
  }
  if (result2.result) {
    output.push(`   结果: 可能存在（假阳性！该元素未被插入，但所有对应位恰好都为 1）`)
  } else {
    output.push(`   结果: 一定不存在（真阴性，至少有一个对应位为 0）`)
  }
  output.push('')

  // 另一个不存在的元素
  const queryFalse2 = 'mango'
  const result3 = filter.query(queryFalse2)
  output.push(`4. 查询未插入元素 "${queryFalse2}":`)
  for (let i = 0; i < hashCount; i++) {
    const status = result3.bitsAtPositions[i] === 1 ? '✓ 为 1' : '✗ 为 0'
    output.push(`   h${i + 1}("${queryFalse2}") = ${result3.positions[i]} → 位[${result3.positions[i]}] ${status}`)
  }
  if (result3.result) {
    output.push(`   结果: 可能存在（假阳性！）`)
  } else {
    output.push(`   结果: 一定不存在（真阴性）`)
  }
  output.push('')

  // 展示最终状态
  output.push('--- 最终位数组状态 ---')
  const bits = filter.getBits()
  let bitDisplay = '索引: '
  for (let i = 0; i < size; i++) {
    bitDisplay += String(i).padStart(3) + ' '
  }
  output.push(bitDisplay)
  let valDisplay = '数值: '
  for (let i = 0; i < size; i++) {
    valDisplay += String(bits[i]).padStart(3) + ' '
  }
  output.push(valDisplay)
  output.push('')
  output.push(`已置 1 的位数: ${filter.getOnCount()}/${size} (${(filter.getOnCount() / size * 100).toFixed(1)}%)`)
  output.push(`理论最优哈希函数个数 k* = (m/n) × ln2 = (${size}/${elements.length}) × 0.693 ≈ ${(size / elements.length * 0.693).toFixed(1)}`)
  const fpRate = Math.pow(1 - Math.exp(-hashCount * elements.length / size), hashCount)
  output.push(`当前假阳性率估算: ~${(fpRate * 100).toFixed(2)}%`)
  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
