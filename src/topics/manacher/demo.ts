/**
 * Manacher算法演示
 * 展示O(n)时间复杂度查找最长回文子串的过程
 */

function preprocess(s: string): string {
  if (s.length === 0) return '^$'
  let result = '^'
  for (let i = 0; i < s.length; i++) {
    result += '#' + s[i]
  }
  result += '#$'
  return result
}

function manacher(s: string): { transformed: string; p: number[]; maxLength: number; center: number } {
  const T = preprocess(s)
  const n = T.length
  const P = new Array(n).fill(0)
  let C = 0  // 当前回文中心
  let R = 0  // 当前回文右边界

  for (let i = 1; i < n - 1; i++) {
    const mirror = 2 * C - i  // i关于C的对称点

    if (i < R) {
      P[i] = Math.min(R - i, P[mirror])
    }

    // 尝试扩展
    while (T[i + P[i] + 1] === T[i - P[i] - 1]) {
      P[i]++
    }

    // 更新中心和右边界
    if (i + P[i] > R) {
      C = i
      R = i + P[i]
    }
  }

  // 找出最大回文
  let maxLen = 0
  let centerIndex = 0
  for (let i = 1; i < n - 1; i++) {
    if (P[i] > maxLen) {
      maxLen = P[i]
      centerIndex = i
    }
  }

  return { transformed: T, p: P, maxLength: maxLen, center: centerIndex }
}

export default function manacherDemo(): string {
  const output: string[] = []

  output.push('=== Manacher算法演示 ===\n')

  // 示例1：奇数长度回文
  const s1 = 'abacaba'
  output.push(`1. 输入字符串: "${s1}"`)
  const result1 = manacher(s1)
  output.push(`   变换后: ${result1.transformed}`)
  output.push(`   回文半径数组P[]: [${result1.p.slice(1, -1).join(', ')}]`)
  output.push(`   最长回文长度: ${result1.maxLength}`)
  const start1 = (result1.center - result1.maxLength) / 2
  output.push(`   最长回文子串: "${s1.substring(start1, start1 + result1.maxLength)}"\n`)

  // 示例2：偶数长度回文
  const s2 = 'cbbd'
  output.push(`2. 输入字符串: "${s2}"`)
  const result2 = manacher(s2)
  output.push(`   变换后: ${result2.transformed}`)
  output.push(`   回文半径数组P[]: [${result2.p.slice(1, -1).join(', ')}]`)
  output.push(`   最长回文长度: ${result2.maxLength}`)
  const start2 = (result2.center - result2.maxLength) / 2
  output.push(`   最长回文子串: "${s2.substring(start2, start2 + result2.maxLength)}"\n`)

  // 示例3：全部相同字符
  const s3 = 'aaaa'
  output.push(`3. 输入字符串: "${s3}"`)
  const result3 = manacher(s3)
  output.push(`   变换后: ${result3.transformed}`)
  output.push(`   回文半径数组P[]: [${result3.p.slice(1, -1).join(', ')}]`)
  output.push(`   最长回文长度: ${result3.maxLength}`)
  const start3 = (result3.center - result3.maxLength) / 2
  output.push(`   最长回文子串: "${s3.substring(start3, start3 + result3.maxLength)}"\n`)

  // 示例4：无回文
  const s4 = 'abcde'
  output.push(`4. 输入字符串: "${s4}"`)
  const result4 = manacher(s4)
  output.push(`   变换后: ${result4.transformed}`)
  output.push(`   回文半径数组P[]: [${result4.p.slice(1, -1).join(', ')}]`)
  output.push(`   最长回文长度: ${result4.maxLength} (单个字符)`)
  const start4 = (result4.center - result4.maxLength) / 2
  output.push(`   最长回文子串: "${s4.substring(start4, start4 + result4.maxLength)}"\n`)

  // 算法步骤演示
  output.push('--- 算法步骤演示 (以"abacaba"为例) ---\n')
  const T = result1.transformed
  const P = result1.p
  for (let i = 1; i < T.length - 1; i++) {
    output.push(`   步骤 ${i}: 处理 T[${i}]='${T[i]}'`)
    output.push(`     P[${i}] = ${P[i]}`)
    const palindrome = T.substring(i - P[i], i + P[i] + 1).replace(/[#^$]/g, '')
    if (palindrome.length > 1) {
      output.push(`     以该位置为中心的回文: "${palindrome}"`)
    }
  }

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
