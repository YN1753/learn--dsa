export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 桶排序 (Bucket Sort) 演示 ===')
  lines.push('')

  // --- 1. 均匀分布浮点数演示 ---
  lines.push('【1】均匀分布浮点数 —— 桶排序经典场景')
  lines.push('─────────────────────────────────────────')

  const floatArr = [0.42, 0.32, 0.23, 0.52, 0.25, 0.47, 0.51, 0.38, 0.15, 0.09]
  const bucketCount = 5
  lines.push(`  原数组: [${floatArr.join(', ')}]`)
  lines.push(`  桶数量: ${bucketCount}，每桶范围: ${(1 / bucketCount).toFixed(2)}`)
  lines.push('')

  // 分配
  const buckets: number[][] = Array.from({ length: bucketCount }, () => [])
  for (const x of floatArr) {
    const idx = Math.min(Math.floor(x * bucketCount), bucketCount - 1)
    buckets[idx].push(x)
  }

  lines.push('  第1步: 分配元素到桶中')
  for (let i = 0; i < bucketCount; i++) {
    const lo = (i / bucketCount).toFixed(2)
    const hi = ((i + 1) / bucketCount).toFixed(2)
    lines.push(`    桶${i} [${lo}, ${hi}): [${buckets[i].join(', ')}]`)
  }
  lines.push('')

  // 桶内排序（插入排序）
  lines.push('  第2步: 桶内排序（插入排序）')
  for (const bucket of buckets) {
    for (let i = 1; i < bucket.length; i++) {
      const key = bucket[i]
      let j = i - 1
      while (j >= 0 && bucket[j] > key) {
        bucket[j + 1] = bucket[j]
        j--
      }
      bucket[j + 1] = key
    }
  }
  for (let i = 0; i < bucketCount; i++) {
    if (buckets[i].length > 0) {
      lines.push(`    桶${i}: [${buckets[i].join(', ')}]`)
    }
  }
  lines.push('')

  // 合并
  const result = buckets.flat()
  lines.push(`  第3步: 合并所有桶`)
  lines.push(`  结果: [${result.join(', ')}]`)
  lines.push('')

  // --- 2. 整数演示 ---
  lines.push('【2】整数数据 —— 桶排序演示')
  lines.push('─────────────────────────────────────────')

  const intArr = [29, 25, 3, 49, 9, 37, 21, 43, 12, 35]
  const intMin = Math.min(...intArr)
  const intMax = Math.max(...intArr)
  const intBucketCount = 5
  const range = intMax - intMin
  const bucketWidth = Math.ceil(range / intBucketCount)

  lines.push(`  原数组: [${intArr.join(', ')}]`)
  lines.push(`  值域: [${intMin}, ${intMax}]，桶数量: ${intBucketCount}，每桶宽度: ${bucketWidth}`)
  lines.push('')

  const intBuckets: number[][] = Array.from({ length: intBucketCount }, () => [])
  for (const x of intArr) {
    const idx = Math.min(Math.floor((x - intMin) / bucketWidth), intBucketCount - 1)
    intBuckets[idx].push(x)
  }

  lines.push('  分配结果:')
  for (let i = 0; i < intBucketCount; i++) {
    const lo = intMin + i * bucketWidth
    const hi = intMin + (i + 1) * bucketWidth
    lines.push(`    桶${i} [${lo}, ${hi}): [${intBuckets[i].join(', ')}]`)
  }
  lines.push('')

  // 桶内排序
  for (const bucket of intBuckets) {
    for (let i = 1; i < bucket.length; i++) {
      const key = bucket[i]
      let j = i - 1
      while (j >= 0 && bucket[j] > key) {
        bucket[j + 1] = bucket[j]
        j--
      }
      bucket[j + 1] = key
    }
  }

  lines.push('  桶内排序后:')
  for (let i = 0; i < intBucketCount; i++) {
    if (intBuckets[i].length > 0) {
      lines.push(`    桶${i}: [${intBuckets[i].join(', ')}]`)
    }
  }
  lines.push('')
  lines.push(`  合并结果: [${intBuckets.flat().join(', ')}]`)
  lines.push('')

  // --- 3. 最坏情况演示 ---
  lines.push('【3】最坏情况 —— 所有元素落入同一个桶')
  lines.push('─────────────────────────────────────────')

  const worstArr = [51, 52, 53, 54, 55, 56, 57, 58, 59]
  const worstBucketCount = 5
  lines.push(`  原数组: [${worstArr.join(', ')}]`)
  lines.push(`  桶数量: ${worstBucketCount}，每桶范围: 20`)
  lines.push('')

  const worstBuckets: number[][] = Array.from({ length: worstBucketCount }, () => [])
  for (const x of worstArr) {
    const idx = Math.min(Math.floor(x / 20), worstBucketCount - 1)
    worstBuckets[idx].push(x)
  }

  lines.push('  分配结果:')
  for (let i = 0; i < worstBucketCount; i++) {
    const lo = i * 20
    const hi = (i + 1) * 20
    lines.push(`    桶${i} [${lo}, ${hi}): [${worstBuckets[i].join(', ')}]`)
  }
  lines.push('')

  const maxBucketSize = Math.max(...worstBuckets.map(b => b.length))
  lines.push(`  最大桶大小: ${maxBucketSize}（全部 ${worstArr.length} 个元素在同一个桶中）`)
  lines.push(`  桶内排序代价: O(${maxBucketSize}²) = O(${maxBucketSize * maxBucketSize})`)
  lines.push(`  总体复杂度退化为 O(n²) = O(${worstArr.length * worstArr.length})`)
  lines.push('')

  // --- 4. 与比较排序对比 ---
  lines.push('【4】桶排序 vs 快速排序 —— 性能对比')
  lines.push('─────────────────────────────────────────')
  lines.push('')
  lines.push('  场景1: 均匀分布的 100 万个浮点数')
  lines.push('    桶排序: O(n)     ≈ 100 万次操作')
  lines.push('    快速排序: O(n log n) ≈ 2000 万次操作')
  lines.push('    桶排序快约 20 倍')
  lines.push('')
  lines.push('  场景2: 数据极度不均匀（99% 在同一个桶）')
  lines.push('    桶排序: O(n²)    ≈ 10^12 次操作（不可接受）')
  lines.push('    快速排序: O(n log n) ≈ 2000 万次操作')
  lines.push('    快速排序快约 50000 倍')
  lines.push('')
  lines.push('  结论: 桶排序在均匀分布时极快，但分布不好时灾难性退化')
  lines.push('')

  // --- 5. 桶排序 vs 计数排序 vs 基数排序 ---
  lines.push('【5】三种非比较排序对比')
  lines.push('─────────────────────────────────────────')
  lines.push('')
  lines.push('  算法      | 时间(平均)    | 空间      | 稳定 | 适用数据')
  lines.push('  ----------|--------------|-----------|------|------------------')
  lines.push('  桶排序    | O(n)         | O(n+k)    | 视情况| 均匀分布的任意类型')
  lines.push('  计数排序  | O(n+k)       | O(n+k)    | 是   | 值域小的整数')
  lines.push('  基数排序  | O(d·(n+k))   | O(n+k)    | 是   | 位数有限的整数')
  lines.push('')
  lines.push('  桶排序是计数排序的泛化:')
  lines.push('    计数排序 = 每个值一个桶（桶数量 = 值域大小）')
  lines.push('    桶排序   = 多个值共享一个桶（桶数量 << 值域大小）')
  lines.push('')

  // --- 6. 总结 ---
  lines.push('【6】总结')
  lines.push('─────────────────────────────────────────')
  lines.push('')
  lines.push('  桶排序的核心要点:')
  lines.push('    1. 分而治之: 将数据分配到桶中，各桶独立处理')
  lines.push('    2. 均匀分布假设: O(n) 的前提条件')
  lines.push('    3. 桶内排序的选择: 插入排序（小桶）、递归桶排序（大桶）')
  lines.push('    4. 桶数量的权衡: 太小则桶内元素多，太大则空间浪费')
  lines.push('')
  lines.push('  何时使用桶排序:')
  lines.push('    - 数据均匀分布在已知范围内')
  lines.push('    - 数据类型为浮点数或其他连续值')
  lines.push('    - 不要求最坏情况保证')
  lines.push('    - 需要并行化排序')
  lines.push('')
  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}
