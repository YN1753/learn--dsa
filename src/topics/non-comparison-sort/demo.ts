export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 非比较排序 (Non-Comparison Sort) 演示 ===')
  lines.push('')

  // --- 1. 计数排序逐步演示 ---
  lines.push('【1】计数排序 (Counting Sort) 逐步演示')
  lines.push('─────────────────────────────────────────')

  const countingArr = [4, 2, 2, 8, 3, 3, 1]
  const min = Math.min(...countingArr)
  const max = Math.max(...countingArr)
  const k = max - min + 1

  lines.push(`  原数组: [${countingArr.join(', ')}]`)
  lines.push(`  值域范围: [${min}, ${max}], k = ${k}`)
  lines.push('')

  // 统计次数
  const count = new Array(k).fill(0)
  for (const x of countingArr) count[x - min]++

  lines.push('  第1步: 统计每个值出现的次数')
  lines.push(`    值:    ${Array.from({ length: k }, (_, i) => String(i + min).padStart(2)).join('  ')}`)
  lines.push(`    次数:  ${count.map(c => String(c).padStart(2)).join('  ')}`)
  lines.push('')

  // 前缀和
  const prefixSum = [...count]
  for (let i = 1; i < k; i++) prefixSum[i] += prefixSum[i - 1]

  lines.push('  第2步: 计算前缀和（累积计数）')
  lines.push(`    累积:  ${prefixSum.map(c => String(c).padStart(2)).join('  ')}`)
  lines.push('    (含义: 值 ≤ x 的元素共有 prefixSum[x-min] 个)')
  lines.push('')

  // 从后往前放置
  const result = new Array(countingArr.length)
  const placementLog: string[] = []
  const tempPrefix = [...prefixSum]
  for (let i = countingArr.length - 1; i >= 0; i--) {
    const val = countingArr[i]
    const idx = val - min
    const pos = --tempPrefix[idx]
    result[pos] = val
    placementLog.push(`    arr[${i}]=${val} → 位置 ${pos} (prefixSum[${idx}] 减为 ${tempPrefix[idx]})`)
  }

  lines.push('  第3步: 从后往前放置元素（保证稳定性）')
  for (const log of placementLog) lines.push(log)
  lines.push('')
  lines.push(`  结果: [${result.join(', ')}]`)
  lines.push('')

  // --- 2. 基数排序逐步演示 ---
  lines.push('【2】基数排序 (Radix Sort) 逐步演示')
  lines.push('─────────────────────────────────────────')

  const radixArr = [170, 45, 75, 90, 802, 24, 2, 66]
  const radixMax = Math.max(...radixArr)
  lines.push(`  原数组: [${radixArr.join(', ')}]`)
  lines.push(`  最大值: ${radixMax}`)
  lines.push('')

  let currentArr = [...radixArr]
  for (let exp = 1; Math.floor(radixMax / exp) > 0; exp *= 10) {
    const digitName = exp === 1 ? '个位' : exp === 10 ? '十位' : '百位'

    // 计数排序按当前位
    const digitCount = new Array(10).fill(0)
    for (const x of currentArr) digitCount[Math.floor(x / exp) % 10]++
    for (let i = 1; i < 10; i++) digitCount[i] += digitCount[i - 1]

    const sorted = new Array(currentArr.length)
    for (let i = currentArr.length - 1; i >= 0; i--) {
      const digit = Math.floor(currentArr[i] / exp) % 10
      sorted[--digitCount[digit]] = currentArr[i]
    }
    currentArr = sorted

    // 显示每位的值
    const digitValues = radixArr.map(x => Math.floor(x / exp) % 10)
    lines.push(`  第${exp === 1 ? 1 : exp === 10 ? 2 : 3}轮: 按${digitName}排序`)
    lines.push(`    各元素的${digitName}: ${radixArr.map((x, i) => `${x}(${digitValues[i]})`).join(', ')}`)
    lines.push(`    排序结果: [${currentArr.join(', ')}]`)
    lines.push('')
  }

  lines.push(`  最终结果: [${currentArr.join(', ')}]`)
  lines.push('')

  // --- 3. 桶排序演示 ---
  lines.push('【3】桶排序 (Bucket Sort) 演示')
  lines.push('─────────────────────────────────────────')

  const bucketArr = [0.42, 0.32, 0.23, 0.52, 0.25, 0.47, 0.51, 0.38, 0.15, 0.09]
  const bucketCount = 5
  lines.push(`  原数组: [${bucketArr.join(', ')}]`)
  lines.push(`  桶数量: ${bucketCount}`)
  lines.push('')

  const buckets: number[][] = Array.from({ length: bucketCount }, () => [])
  for (const x of bucketArr) {
    const idx = Math.min(Math.floor(x * bucketCount), bucketCount - 1)
    buckets[idx].push(x)
  }

  lines.push('  分配到各桶:')
  for (let i = 0; i < bucketCount; i++) {
    const rangeStart = (i / bucketCount).toFixed(2)
    const rangeEnd = ((i + 1) / bucketCount).toFixed(2)
    lines.push(`    桶${i} [${rangeStart}, ${rangeEnd}): [${buckets[i].join(', ')}]`)
  }
  lines.push('')

  // 桶内排序（插入排序）
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

  lines.push('  桶内排序后:')
  for (let i = 0; i < bucketCount; i++) {
    lines.push(`    桶${i}: [${buckets[i].join(', ')}]`)
  }
  lines.push('')

  const bucketResult = buckets.flat()
  lines.push(`  合并结果: [${bucketResult.join(', ')}]`)
  lines.push('')

  // --- 4. 三种非比较排序对比 ---
  lines.push('【4】三种非比较排序对比')
  lines.push('─────────────────────────────────────────')
  lines.push('')
  lines.push('  算法      | 时间复杂度      | 空间复杂度 | 稳定 | 适用场景')
  lines.push('  ----------|----------------|-----------|------|------------------')
  lines.push('  计数排序  | O(n+k)         | O(n+k)    | 是   | 值域小的整数')
  lines.push('  基数排序  | O(d·(n+k))     | O(n+k)    | 是   | 位数有限的整数')
  lines.push('  桶排序    | O(n) 平均      | O(n)      | 视情况 | 均匀分布的数据')
  lines.push('')

  // --- 5. 与比较排序性能对比 ---
  lines.push('【5】与比较排序的性能对比')
  lines.push('─────────────────────────────────────────')
  lines.push('')
  lines.push('  场景: 排序 100 万个整数，值域 [0, 1000]')
  lines.push('')
  lines.push('  快速排序:    O(n log n) ≈ 100万 × 20 = 2000 万次操作')
  lines.push('  计数排序:    O(n+k)     ≈ 100万 + 1000 = 100 万次操作')
  lines.push('  加速比:      约 20 倍')
  lines.push('')
  lines.push('  场景: 排序 100 万个整数，值域 [0, 10^9]')
  lines.push('')
  lines.push('  快速排序:    O(n log n) ≈ 2000 万次操作')
  lines.push('  计数排序:    O(n+k)     ≈ 10^9 次操作（空间爆炸！）')
  lines.push('  基数排序:    O(d·n)     ≈ 10 × 100万 = 1000 万次操作')
  lines.push('  结论:        值域大时用基数排序，值域小时用计数排序')
  lines.push('')

  // --- 6. 总结 ---
  lines.push('【6】总结')
  lines.push('─────────────────────────────────────────')
  lines.push('')
  lines.push('  非比较排序的三大核心:')
  lines.push('    1. 不比较 → 突破 O(n log n) 下界')
  lines.push('    2. 利用值本身 → 直接计算目标位置')
  lines.push('    3. 稳定性 → 多关键字排序的基础')
  lines.push('')
  lines.push('  选择依据:')
  lines.push('    - 值域小 → 计数排序')
  lines.push('    - 值域大但位数有限 → 基数排序')
  lines.push('    - 数据均匀分布 → 桶排序')
  lines.push('    - 通用场景 → 快速排序/归并排序')
  lines.push('')
  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}
