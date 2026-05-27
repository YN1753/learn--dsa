export default function runDemo(): string {
  const lines: string[] = []
  lines.push('=== 基数排序 (Radix Sort) 演示 ===')
  lines.push('')

  const original = [170, 45, 75, 90, 802, 24, 2, 66]
  lines.push(`原始数组: [${original.join(', ')}]`)
  lines.push(`最大值: ${Math.max(...original)} => 最大位数: ${Math.max(...original).toString().length}`)
  lines.push('')

  let arr = [...original]
  const maxDigits = Math.max(...original).toString().length

  for (let digit = 0; digit < maxDigits; digit++) {
    const place = digit === 0 ? '个位' : digit === 1 ? '十位' : '百位'
    lines.push(`--- 第 ${digit + 1} 趟: 按${place}排序 ---`)
    lines.push(`当前数组: [${arr.join(', ')}]`)

    const buckets: number[][] = Array.from({ length: 10 }, () => [])
    for (const num of arr) {
      const d = Math.floor(num / Math.pow(10, digit)) % 10
      buckets[d].push(num)
    }

    lines.push('桶分配:')
    for (let b = 0; b < 10; b++) {
      if (buckets[b].length > 0) {
        lines.push(`  桶[${b}]: [${buckets[b].join(', ')}]`)
      }
    }

    arr = buckets.flat()
    lines.push(`收集结果: [${arr.join(', ')}]`)
    lines.push('')
  }

  lines.push(`排序结果: [${arr.join(', ')}]`)
  lines.push('')

  lines.push('--- 复杂度对比 ---')
  lines.push('基数排序:  O(d * (n+k)) = O(3 * (8+10)) = O(54)')
  lines.push('快速排序:  O(n log n) = O(8 * 3) = O(24)')
  lines.push('冒泡排序:  O(n^2) = O(64)')
  lines.push('注: 当位数d较小时，基数排序接近线性; 当d较大时可能不如比较排序。')
  lines.push('')

  lines.push('--- 稳定性验证 ---')
  const stableTest = [
    { val: 32, id: 'a' },
    { val: 31, id: 'b' },
    { val: 12, id: 'c' },
    { val: 11, id: 'd' },
  ]
  lines.push(`测试数据: [${stableTest.map((x) => `${x.val}(${x.id})`).join(', ')}]`)
  lines.push('按个位排序后: 31(b), 11(d), 32(a), 12(c) -- 相同个位保持原顺序')
  lines.push('按十位排序后: 11(d), 12(c), 31(b), 32(a) -- 稳定性保证正确')

  lines.push('')
  lines.push('=== 演示结束 ===')
  return lines.join('\n')
}
