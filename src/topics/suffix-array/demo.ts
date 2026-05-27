// 后缀数组 (Suffix Array) 演示

/**
 * 构建后缀数组（朴素方法）
 * 对所有后缀按字典序排序
 */
function buildSuffixArray(text: string): number[] {
  const n = text.length
  const suffixes: { index: number; suffix: string }[] = []
  for (let i = 0; i < n; i++) {
    suffixes.push({ index: i, suffix: text.substring(i) })
  }
  suffixes.sort((a, b) => a.suffix.localeCompare(b.suffix))
  return suffixes.map(s => s.index)
}

/**
 * 使用 Kasai 算法构建 LCP 数组
 * 时间复杂度 O(n)
 */
function buildLCPArray(text: string, sa: number[]): number[] {
  const n = text.length
  const rank: number[] = new Array(n)
  const lcp: number[] = new Array(n).fill(0)

  // 构建 Rank 数组
  for (let i = 0; i < n; i++) {
    rank[sa[i]] = i
  }

  let h = 0
  for (let i = 0; i < n; i++) {
    if (rank[i] > 0) {
      const j = sa[rank[i] - 1]
      // 找 Suffix(i) 和 Suffix(j) 的公共前缀长度
      while (i + h < n && j + h < n && text[i + h] === text[j + h]) {
        h++
      }
      lcp[rank[i]] = h
      if (h > 0) h--
    }
  }
  return lcp
}

/**
 * 在后缀数组上进行二分查找
 * 返回所有匹配位置
 */
function patternSearch(
  text: string,
  sa: number[],
  pattern: string
): { positions: number[]; steps: { low: number; high: number; mid: number; comparison: string; result: string }[] } {
  const n = text.length
  const m = pattern.length
  const steps: { low: number; high: number; mid: number; comparison: string; result: string }[] = []

  // 查找第一个 >= pattern 的位置
  let low = 0, high = n - 1
  let start = n
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const suffix = text.substring(sa[mid], Math.min(sa[mid] + m, n))
    let cmp: string
    let result: string
    if (suffix < pattern) {
      cmp = `"${suffix}" < "${pattern}"`
      result = '向右查找'
      low = mid + 1
    } else {
      cmp = `"${suffix}" >= "${pattern}"`
      result = '向左查找'
      start = mid
      high = mid - 1
    }
    steps.push({ low, high, mid, comparison: cmp, result })
  }

  // 查找最后一个匹配的位置
  low = 0
  high = n - 1
  let end = -1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const suffix = text.substring(sa[mid], Math.min(sa[mid] + m, n))
    if (suffix <= pattern) {
      low = mid + 1
    } else {
      end = mid
      high = mid - 1
    }
  }
  if (end === -1) end = n

  const positions: number[] = []
  for (let i = start; i < end; i++) {
    positions.push(sa[i])
  }
  positions.sort((a, b) => a - b)
  return { positions, steps }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═'.repeat(50))
  lines.push('         后缀数组 (Suffix Array) 演示')
  lines.push('═'.repeat(50))
  lines.push('')

  // 1. 构建后缀数组
  const text = 'banana'
  lines.push('【第一步】构建后缀数组')
  lines.push(`  原始字符串: "${text}" (长度 ${text.length})`)
  lines.push('')

  lines.push('  所有后缀:')
  for (let i = 0; i < text.length; i++) {
    lines.push(`    Suffix(${i}) = "${text.substring(i)}"`)
  }
  lines.push('')

  const sa = buildSuffixArray(text)
  lines.push('  排序后的后缀 (字典序):')
  for (let rank = 0; rank < sa.length; rank++) {
    const idx = sa[rank]
    lines.push(`    SA[${rank}] = ${idx}  ->  "${text.substring(idx)}"`)
  }
  lines.push(`  后缀数组 SA = [${sa.join(', ')}]`)
  lines.push('')

  // 2. Rank 数组
  lines.push('【第二步】Rank 数组')
  const rank: number[] = new Array(text.length)
  for (let i = 0; i < text.length; i++) {
    rank[sa[i]] = i
  }
  lines.push(`  Rank = [${rank.join(', ')}]`)
  lines.push('  Rank[i] 表示 Suffix(i) 的字典序排名')
  lines.push(`  例如: Rank[0] = ${rank[0]}，Suffix(0) = "banana" 排名第 ${rank[0]}`)
  lines.push('')

  // 3. LCP 数组
  lines.push('【第三步】LCP 数组 (Kasai 算法)')
  const lcp = buildLCPArray(text, sa)
  lines.push(`  LCP = [${lcp.join(', ')}]`)
  lines.push('')
  lines.push('  相邻后缀的公共前缀:')
  for (let i = 1; i < sa.length; i++) {
    const s1 = text.substring(sa[i])
    const s2 = text.substring(sa[i - 1])
    const prefix = s1.substring(0, lcp[i])
    lines.push(`    LCP[${i}] = ${lcp[i]}  "${s1}" 与 "${s2}"`)
    if (lcp[i] > 0) {
      lines.push(`             公共前缀: "${prefix}"`)
    }
  }
  lines.push('')

  // 4. 最长重复子串
  lines.push('【第四步】最长重复子串')
  let maxLcp = 0
  let maxIdx = 0
  for (let i = 1; i < lcp.length; i++) {
    if (lcp[i] > maxLcp) {
      maxLcp = lcp[i]
      maxIdx = i
    }
  }
  lines.push(`  LCP 最大值: ${maxLcp} (位置 LCP[${maxIdx}])`)
  lines.push(`  最长重复子串: "${text.substring(sa[maxIdx], sa[maxIdx] + maxLcp)}"`)
  lines.push(`  出现在: Suffix(${sa[maxIdx]}) 和 Suffix(${sa[maxIdx - 1]})`)
  lines.push('')

  // 5. 模式匹配
  lines.push('【第五步】模式匹配 (二分查找)')
  const pattern = 'ana'
  lines.push(`  文本: "${text}"`)
  lines.push(`  模式: "${pattern}"`)
  lines.push('')

  const { positions, steps } = patternSearch(text, sa, pattern)
  lines.push('  二分查找过程:')
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i]
    lines.push(`    步骤 ${i + 1}: low=${s.low}, high=${s.high}, mid=${s.mid}`)
    lines.push(`           比较: ${s.comparison}  -> ${s.result}`)
  }
  lines.push('')
  if (positions.length > 0) {
    lines.push(`  找到 ${positions.length} 个匹配位置: [${positions.join(', ')}]`)
    for (const pos of positions) {
      lines.push(`    位置 ${pos}: "${text.substring(pos, pos + pattern.length)}"`)
    }
  } else {
    lines.push('  未找到匹配')
  }
  lines.push('')

  // 6. 复杂度总结
  lines.push('【第六步】复杂度总结')
  lines.push('  ┌──────────────────────┬──────────────┬──────────────┐')
  lines.push('  │ 操作                 │ 时间复杂度   │ 空间复杂度   │')
  lines.push('  ├──────────────────────┼──────────────┼──────────────┤')
  lines.push('  │ 朴素构建 SA          │ O(n² log n)  │ O(n)         │')
  lines.push('  │ 倍增算法构建 SA      │ O(n log²n)   │ O(n)         │')
  lines.push('  │ SA-IS 线性构建 SA    │ O(n)         │ O(n)         │')
  lines.push('  │ Kasai 构建 LCP       │ O(n)         │ O(n)         │')
  lines.push('  │ 模式匹配 (二分查找)  │ O(m log n)   │ O(1)         │')
  lines.push('  └──────────────────────┴──────────────┴──────────────┘')
  lines.push('')

  lines.push('═'.repeat(50))
  lines.push('  演示完成！')
  lines.push('═'.repeat(50))

  return lines.join('\n')
}
