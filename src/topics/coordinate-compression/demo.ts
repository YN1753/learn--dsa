/**
 * 坐标压缩 (Coordinate Compression) 演示
 *
 * 展示如何将大范围离散值映射为连续的小范围索引，
 * 以及如何在压缩后的索引上进行查询。
 */

function compress(values: number[]): { sorted: number[]; map: Map<number, number> } {
  const sorted = [...new Set(values)].sort((a, b) => a - b)
  const map = new Map<number, number>()
  sorted.forEach((v, i) => map.set(v, i))
  return { sorted, map }
}

function decompress(index: number, sorted: number[]): number | undefined {
  if (index < 0 || index >= sorted.length) return undefined
  return sorted[index]
}

export default function coordinateCompressionDemo(): string {
  const output: string[] = []

  output.push('=== 坐标压缩演示 ===\n')

  // 示例 1: 基本压缩
  const values1 = [100, 5000, 300, 100, 5000, 7, 300]
  output.push('1. 基本坐标压缩')
  output.push(`   原始数据: [${values1.join(', ')}]`)
  const { sorted: sorted1, map: map1 } = compress(values1)
  output.push(`   去重排序: [${sorted1.join(', ')}]`)
  output.push('   映射关系:')
  sorted1.forEach(v => {
    output.push(`     ${v} -> ${map1.get(v)}`)
  })
  output.push(`   压缩后的索引序列: [${values1.map(v => map1.get(v)).join(', ')}]`)
  output.push('')

  // 示例 2: 大范围稀疏值
  const values2 = [1000000000, 1, 999999999, 500000000, 1, 1000000000]
  output.push('2. 大范围稀疏值压缩')
  output.push(`   原始数据: [${values2.join(', ')}]`)
  output.push(`   值域范围: 1 ~ 1000000000 (跨度 10^9)`)
  const { sorted: sorted2 } = compress(values2)
  output.push(`   去重排序: [${sorted2.join(', ')}]`)
  output.push(`   压缩后索引范围: 0 ~ ${sorted2.length - 1} (仅需 ${sorted2.length} 个位置)`)
  output.push(`   内存节省: 从 O(10^9) 降至 O(${sorted2.length})`)
  output.push('')

  // 示例 3: 查询演示
  output.push('3. 压缩后的查询演示')
  const queryValues = [300, 999, 5000, 100]
  queryValues.forEach(q => {
    const idx = map1.get(q)
    if (idx !== undefined) {
      output.push(`   查询 ${q}: 压缩索引 = ${idx}, 反向映射 = ${decompress(idx, sorted1)}`)
    } else {
      output.push(`   查询 ${q}: 不存在于原始数据中`)
    }
  })
  output.push('')

  // 示例 4: 配合线段树使用
  output.push('4. 配合线段树使用的场景')
  output.push('   假设有区间操作: [10, 100], [200, 500], [10, 500], [100, 200]')
  const intervals = [[10, 100], [200, 500], [10, 500], [100, 200]]
  const allPoints = intervals.flat()
  const { sorted: sortedInt, map: mapInt } = compress(allPoints)
  output.push(`   所有端点: [${allPoints.join(', ')}]`)
  output.push(`   去重排序: [${sortedInt.join(', ')}]`)
  output.push('   压缩后的区间:')
  intervals.forEach(([l, r]) => {
    output.push(`     [${l}, ${r}] -> [${mapInt.get(l)}, ${mapInt.get(r)}]`)
  })
  output.push(`   线段树大小: 仅需 ${sortedInt.length} 个叶子节点 (而非值域跨度 ${sortedInt[sortedInt.length - 1] - sortedInt[0]})`)
  output.push('')

  // 示例 5: 含负数的压缩
  const values5 = [-100, 0, 50, -100, 200, 0, -50]
  output.push('5. 含负数的坐标压缩')
  output.push(`   原始数据: [${values5.join(', ')}]`)
  const { sorted: sorted5, map: map5 } = compress(values5)
  output.push(`   去重排序: [${sorted5.join(', ')}]`)
  output.push('   映射关系:')
  sorted5.forEach(v => {
    output.push(`     ${v} -> ${map5.get(v)}`)
  })
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
