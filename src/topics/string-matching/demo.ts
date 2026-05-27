export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 字符串匹配 (String Matching / KMP) 演示 ===')
  lines.push('')

  // --- 1. 暴力匹配 ---
  lines.push('【1】暴力匹配 (Brute Force)')
  lines.push('─────────────────────────')
  const text1 = 'ABABABCABABABCABD'
  const pattern1 = 'ABABCABD'
  lines.push(`文本 T: "${text1}"`)
  lines.push(`模式 P: "${pattern1}"`)
  lines.push('')
  bruteForceTrace(text1, pattern1, lines)
  lines.push('')

  // --- 2. 失败函数计算 ---
  lines.push('【2】KMP 失败函数 (Failure Function) 计算')
  lines.push('─────────────────────────')
  const pattern2 = 'ABABCABD'
  lines.push(`模式串: "${pattern2}"`)
  lines.push('')
  const fail = failureFunctionTrace(pattern2, lines)
  lines.push('')

  // --- 3. KMP 匹配 ---
  lines.push('【3】KMP 匹配过程')
  lines.push('─────────────────────────')
  const text3 = 'ABABABCABABABCABD'
  const pattern3 = 'ABABCABD'
  lines.push(`文本 T: "${text3}"`)
  lines.push(`模式 P: "${pattern3}"`)
  lines.push(`失败函数: [${fail.join(', ')}]`)
  lines.push('')
  kmpMatchTrace(text3, pattern3, fail, lines)
  lines.push('')

  // --- 4. 算法对比 ---
  lines.push('【4】算法效率对比')
  lines.push('─────────────────────────')
  const testText = 'AAAAAAAAAB'
  const testPattern = 'AAAAB'
  lines.push(`测试文本: "${testText}"`)
  lines.push(`测试模式: "${testPattern}"`)
  lines.push('')

  const bfCount = bruteForceCount(testText, testPattern)
  const kmpCountResult = kmpCount(testText, testPattern)
  lines.push(`暴力匹配: 比较 ${bfCount} 次`)
  lines.push(`KMP 匹配: 比较 ${kmpCountResult} 次`)
  lines.push(`效率提升: ${bfCount} / ${kmpCountResult} = ${(bfCount / kmpCountResult).toFixed(1)} 倍`)
  lines.push('')

  // --- 5. 更多场景对比 ---
  lines.push('【5】不同场景对比')
  lines.push('─────────────────────────')
  const scenarios = [
    { text: 'ABCABCAABCABCD', pattern: 'ABCABCD', desc: '有重复前缀' },
    { text: 'ABABABABABABAB', pattern: 'ABABABD', desc: '高度重复文本' },
    { text: 'ABCDEFGHIJKLMNOP', pattern: 'PONMLK', desc: '无重复（最坏情况）' },
  ]

  for (const s of scenarios) {
    const bf = bruteForceCount(s.text, s.pattern)
    const kmp = kmpCount(s.text, s.pattern)
    lines.push(`"${s.text}" 中查找 "${s.pattern}" (${s.desc}):`)
    lines.push(`  暴力: ${bf} 次, KMP: ${kmp} 次, 提升 ${(bf / kmp).toFixed(1)} 倍`)
  }
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 暴力匹配详细过程
function bruteForceTrace(text: string, pattern: string, lines: string[]): void {
  const n = text.length
  const m = pattern.length
  let totalComparisons = 0
  let found = false

  for (let i = 0; i <= n - m; i++) {
    let j = 0
    let comparisons = ''
    let matched = true

    while (j < m) {
      totalComparisons++
      if (text[i + j] === pattern[j]) {
        comparisons += `T[${i + j}]='${text[i + j]}'==P[${j}]='${pattern[j]}'  `
        j++
      } else {
        comparisons += `T[${i + j}]='${text[i + j]}'≠P[${j}]='${pattern[j]}'  失配!`
        matched = false
        break
      }
    }

    const prefix = '  '.repeat(0)
    if (matched) {
      lines.push(`${prefix}位置 ${i}: 全部匹配! ★ 找到匹配位置 ${i}`)
      lines.push(`${prefix}  ${comparisons}`)
      found = true
    } else {
      lines.push(`${prefix}位置 ${i}: ${comparisons}`)
      lines.push(`${prefix}  → 模式串右移 1 位`)
    }
  }

  if (!found) {
    lines.push('未找到匹配!')
  }
  lines.push(`总比较次数: ${totalComparisons}`)
}

// 失败函数计算详细过程
function failureFunctionTrace(pattern: string, lines: string[]): number[] {
  const m = pattern.length
  const fail: number[] = new Array(m).fill(0)
  fail[0] = 0

  lines.push('失败函数定义: fail[j] = P[0..j] 的最长相等真前缀和真后缀的长度')
  lines.push('')
  lines.push(`j=0: P[0]='${pattern[0]}'，单个字符，fail[0] = 0`)
  lines.push('')

  let len = 0
  let i = 1

  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++
      fail[i] = len
      lines.push(
        `j=${i}: P[${i}]='${pattern[i]}' == P[${len - 1}]='${pattern[len - 1]}'，` +
        `最长相等前后缀长度 = ${len}，fail[${i}] = ${len}`
      )
      i++
    } else {
      if (len > 0) {
        lines.push(
          `j=${i}: P[${i}]='${pattern[i]}' ≠ P[${len}]='${pattern[len]}'，` +
          `回退 len: ${len} → fail[${len - 1}] = ${fail[len - 1]}`
        )
        len = fail[len - 1]
      } else {
        fail[i] = 0
        lines.push(
          `j=${i}: P[${i}]='${pattern[i]}' ≠ P[0]='${pattern[0]}'，fail[${i}] = 0`
        )
        i++
      }
    }
  }

  lines.push('')
  lines.push(`最终失败函数: [${fail.join(', ')}]`)

  // 展示最长相等前后缀
  lines.push('')
  lines.push('各位置的最长相等前后缀:')
  for (let j = 1; j < m; j++) {
    if (fail[j] > 0) {
      const prefix = pattern.substring(0, fail[j])
      const suffix = pattern.substring(j - fail[j] + 1, j + 1)
      lines.push(
        `  P[0..${j}] = "${pattern.substring(0, j + 1)}"` +
        ` → 前缀 "${prefix}" = 后缀 "${suffix}"，长度 ${fail[j]}`
      )
    }
  }

  return fail
}

// KMP 匹配详细过程
function kmpMatchTrace(
  text: string,
  pattern: string,
  fail: number[],
  lines: string[]
): void {
  const n = text.length
  const m = pattern.length
  let i = 0
  let j = 0
  let totalComparisons = 0
  let step = 1
  let found = false

  while (i < n) {
    totalComparisons++
    if (text[i] === pattern[j]) {
      lines.push(
        `步骤${step}: i=${i}, j=${j}  ` +
        `T[${i}]='${text[i]}' == P[${j}]='${pattern[j]}'  ✓  → i=${i + 1}, j=${j + 1}`
      )
      i++
      j++
      if (j === m) {
        lines.push(`  ★ 找到匹配! 位置 ${i - m}`)
        found = true
        j = fail[j - 1]
        lines.push(`  → 匹配成功，j 回退到 fail[${m - 1}] = ${j}`)
      }
    } else {
      if (j > 0) {
        const oldJ = j
        j = fail[j - 1]
        lines.push(
          `步骤${step}: i=${i}, j=${oldJ}  ` +
          `T[${i}]='${text[i]}' ≠ P[${oldJ}]='${pattern[oldJ]}'  ✗  ` +
          `→ j 回退: fail[${oldJ - 1}] = ${j}（i=${i} 不变!）`
        )
      } else {
        lines.push(
          `步骤${step}: i=${i}, j=0  ` +
          `T[${i}]='${text[i]}' ≠ P[0]='${pattern[0]}'  ✗  → i=${i + 1}`
        )
        i++
      }
    }
    step++
  }

  if (!found) {
    lines.push('未找到匹配!')
  }
  lines.push(`总比较次数: ${totalComparisons}`)
}

// 暴力匹配计数
function bruteForceCount(text: string, pattern: string): number {
  const n = text.length
  const m = pattern.length
  let count = 0

  for (let i = 0; i <= n - m; i++) {
    let j = 0
    while (j < m) {
      count++
      if (text[i + j] === pattern[j]) {
        j++
      } else {
        break
      }
    }
  }

  return count
}

// KMP 匹配计数
function kmpCount(text: string, pattern: string): number {
  const n = text.length
  const m = pattern.length
  if (m === 0) return 0

  // 构建失败函数
  const fail: number[] = new Array(m).fill(0)
  let len = 0
  let i = 1
  while (i < m) {
    if (pattern[i] === pattern[len]) {
      len++
      fail[i] = len
      i++
    } else {
      if (len > 0) {
        len = fail[len - 1]
      } else {
        fail[i] = 0
        i++
      }
    }
  }

  // KMP 匹配
  let count = 0
  i = 0
  let j = 0
  while (i < n) {
    count++
    if (text[i] === pattern[j]) {
      i++
      j++
      if (j === m) {
        j = fail[j - 1]
      }
    } else {
      if (j > 0) {
        j = fail[j - 1]
      } else {
        i++
      }
    }
  }

  return count
}
