export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 计数排序 (Counting Sort) 演示 ===')
  lines.push('')

  // --- 1. Basic counting sort trace ---
  lines.push('【1】计数排序基本过程')
  lines.push('─────────────────────────')

  const arr = [4, 2, 2, 8, 3, 3, 1]
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const k = max - min + 1

  lines.push(`输入数组: [${arr.join(', ')}]`)
  lines.push(`值域范围: [${min}, ${max}], k = ${k}`)
  lines.push('')

  // Phase 1: counting
  const count = new Array(k).fill(0)
  for (const x of arr) count[x - min]++

  lines.push('第 1 步: 统计每个值出现的次数')
  lines.push(`  值:    ${Array.from({ length: k }, (_, i) => String(i + min).padStart(3)).join(' ')}`)
  lines.push(`  次数:  ${count.map(c => String(c).padStart(3)).join(' ')}`)
  lines.push('')

  // Phase 2: prefix sum
  const prefixSum = [...count]
  for (let i = 1; i < k; i++) prefixSum[i] += prefixSum[i - 1]

  lines.push('第 2 步: 计算前缀和（累积计数）')
  lines.push(`  累积:  ${prefixSum.map(c => String(c).padStart(3)).join(' ')}`)
  lines.push('  含义: prefixSum[i] = 值 <= (i + min) 的元素个数')
  lines.push('')

  // Phase 3: reverse placement
  const output = new Array(arr.length)
  const tempPrefix = [...prefixSum]
  const placementLog: string[] = []
  for (let i = arr.length - 1; i >= 0; i--) {
    const val = arr[i]
    const idx = val - min
    const pos = --tempPrefix[idx]
    output[pos] = val
    placementLog.push(
      `  arr[${i}]=${val} -> 输出位置 ${pos}  (prefixSum[${idx}] 减为 ${tempPrefix[idx]})`
    )
  }

  lines.push('第 3 步: 反向放置元素（保证稳定性）')
  for (const log of placementLog) lines.push(log)
  lines.push('')
  lines.push(`排序结果: [${output.join(', ')}]`)
  lines.push('')

  // --- 2. Stability demonstration ---
  lines.push('【2】稳定性验证')
  lines.push('─────────────────────────')

  interface Student { name: string; score: number }
  const students: Student[] = [
    { name: 'Alice', score: 85 },
    { name: 'Bob', score: 90 },
    { name: 'Charlie', score: 85 },
    { name: 'David', score: 90 },
    { name: 'Eve', score: 85 },
  ]

  lines.push('输入（按录入顺序）:')
  students.forEach((s, i) => lines.push(`  [${i}] ${s.name}: ${s.score}分`))
  lines.push('')

  const scores = students.map(s => s.score)
  const sMin = Math.min(...scores)
  const sMax = Math.max(...scores)
  const sK = sMax - sMin + 1
  const sCount = new Array(sK).fill(0)

  for (const s of scores) sCount[s - sMin]++
  for (let i = 1; i < sK; i++) sCount[i] += sCount[i - 1]

  const sortedStudents: Student[] = new Array(students.length)
  for (let i = students.length - 1; i >= 0; i--) {
    const score = students[i].score
    sortedStudents[--sCount[score - sMin]] = students[i]
  }

  lines.push('按成绩计数排序后（稳定）:')
  sortedStudents.forEach((s, i) => lines.push(`  [${i}] ${s.name}: ${s.score}分`))
  lines.push('')
  lines.push('注意: 相同成绩的学生保持了原始相对顺序')
  lines.push('  85分: Alice -> Charlie -> Eve')
  lines.push('  90分: Bob -> David')
  lines.push('')

  // --- 3. Complexity analysis ---
  lines.push('【3】复杂度分析')
  lines.push('─────────────────────────')
  lines.push('')
  lines.push('  操作           | 次数       | 复杂度')
  lines.push('  ---------------|-----------|--------')
  lines.push(`  统计计数       | ${arr.length} 次遍历  | O(n)`)
  lines.push(`  计算前缀和     | ${k - 1} 次累加  | O(k)`)
  lines.push(`  反向放置       | ${arr.length} 次遍历  | O(n)`)
  lines.push(`  计数数组空间   | ${k} 个元素  | O(k)`)
  lines.push(`  输出数组空间   | ${arr.length} 个元素  | O(n)`)
  lines.push('')
  lines.push('  总计: 时间 O(n + k), 空间 O(n + k)')
  lines.push('')

  // --- 4. Comparison with comparison sort ---
  lines.push('【4】与比较排序的对比')
  lines.push('─────────────────────────')
  lines.push('')

  const scenarios = [
    { n: 1000000, k: 1001, desc: '值域小 [0,1000]' },
    { n: 1000000, k: 10001, desc: '值域中 [0,10000]' },
    { n: 1000000, k: 1000001, desc: '值域大 [0,10^6]' },
    { n: 1000000, k: 1000000001, desc: '值域巨大 [0,10^9]' },
  ]

  for (const s of scenarios) {
    const countingTime = s.n + s.k
    const comparisonTime = Math.round(s.n * Math.log2(s.n))
    const ratio = (comparisonTime / countingTime).toFixed(1)
    const feasible = s.k <= 1e7 ? '可行' : '不可行（空间爆炸）'
    lines.push(`  ${s.desc}:`)
    lines.push(`    计数排序: O(${s.n} + ${s.k > 1e6 ? s.k.toExponential(0) : s.k}) = ${countingTime > 1e9 ? countingTime.toExponential(1) : countingTime}  ${feasible}`)
    lines.push(`    比较排序: O(${s.n} x ${Math.round(Math.log2(s.n))}) ≈ ${comparisonTime.toLocaleString()}`)
    if (s.k <= 1e7) {
      lines.push(`    计数排序快 ${ratio} 倍`)
    }
    lines.push('')
  }

  // --- 5. Summary ---
  lines.push('【5】总结')
  lines.push('─────────────────────────')
  lines.push('')
  lines.push('  计数排序的三大要素:')
  lines.push('    1. 统计计数 -> 知道每个值有多少个')
  lines.push('    2. 前缀和   -> 知道每个值应该放在哪里')
  lines.push('    3. 反向放置 -> 保证稳定性')
  lines.push('')
  lines.push('  适用条件:')
  lines.push('    - 值域 k 不能太大（建议 k <= 10^7）')
  lines.push('    - 数据可映射为整数下标')
  lines.push('    - 需要稳定排序时优先考虑')
  lines.push('')
  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}
