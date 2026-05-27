function computeZArray(s: string): number[] {
  const n = s.length
  const z = new Array(n).fill(0)
  let l = 0
  let r = 0

  for (let i = 1; i < n; i++) {
    if (i <= r) {
      z[i] = Math.min(r - i + 1, z[i - l])
    }
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      z[i]++
    }
    if (i + z[i] - 1 > r) {
      l = i
      r = i + z[i] - 1
    }
  }
  return z
}

function zSearch(text: string, pattern: string): number[] {
  const combined = pattern + '$' + text
  const z = computeZArray(combined)
  const results: number[] = []
  const pLen = pattern.length

  for (let i = pLen + 1; i < combined.length; i++) {
    if (z[i] === pLen) {
      results.push(i - pLen - 1)
    }
  }
  return results
}

export default function zAlgorithmDemo(): string {
  const output: string[] = []

  output.push('=== Z 算法演示 ===\n')

  // 示例 1：计算 Z 数组
  const s1 = 'aabxaabxcaab'
  output.push('1. 计算 Z 数组')
  output.push(`   字符串: "${s1}"`)
  const z1 = computeZArray(s1)
  output.push(`   Z 数组: [${z1.join(', ')}]`)
  output.push('   索引:    ' + Array.from({ length: s1.length }, (_, i) => String(i).padStart(3)).join(' '))
  output.push('   字符:    ' + s1.split('').map(c => c.padStart(3)).join(' '))
  output.push('')

  // 详细解释每个 Z 值
  output.push('2. Z 数组详解')
  for (let i = 0; i < s1.length; i++) {
    if (z1[i] > 0) {
      output.push(`   Z[${i}] = ${z1[i]}: S[${i}:] = "${s1.substring(i, i + z1[i])}" 与前缀 "${s1.substring(0, z1[i])}" 匹配`)
    }
  }
  output.push('')

  // 示例 2：模式匹配
  const text = 'abcabcabcabc'
  const pattern = 'abcabc'
  output.push('3. 模式匹配')
  output.push(`   文本:   "${text}"`)
  output.push(`   模式串: "${pattern}"`)

  const combined = pattern + '$' + text
  const z2 = computeZArray(combined)
  output.push(`   拼接串: "${combined}"`)
  output.push(`   Z 数组: [${z2.join(', ')}]`)

  const matches = zSearch(text, pattern)
  output.push(`   匹配位置: [${matches.join(', ')}]`)
  for (const pos of matches) {
    output.push(`     位置 ${pos}: "${text.substring(pos, pos + pattern.length)}"`)
  }
  output.push('')

  // 示例 3：另一个匹配例子
  const text2 = 'abracadabra'
  const pattern2 = 'abra'
  output.push('4. 更多匹配示例')
  output.push(`   文本:   "${text2}"`)
  output.push(`   模式串: "${pattern2}"`)

  const matches2 = zSearch(text2, pattern2)
  output.push(`   匹配位置: [${matches2.join(', ')}]`)
  for (const pos of matches2) {
    output.push(`     位置 ${pos}: "${text2.substring(pos, pos + pattern2.length)}"`)
  }
  output.push('')

  // 示例 4：Z-box 机制演示
  const s2 = 'aabxaabxcaab'
  output.push('5. Z-box 机制演示')
  output.push(`   字符串: "${s2}"`)
  const z3 = computeZArray(s2)
  output.push(`   Z 数组: [${z3.join(', ')}]`)
  output.push('   Z-box 扩展过程:')
  let l = 0, r = 0
  for (let i = 1; i < s2.length; i++) {
    if (i + z3[i] - 1 > r) {
      l = i
      r = i + z3[i] - 1
      output.push(`     i=${i}: Z-box 更新为 [${l}, ${r}], Z[${i}]=${z3[i]}`)
    }
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
