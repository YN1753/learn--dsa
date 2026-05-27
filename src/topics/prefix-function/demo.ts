function computePrefixFunction(s: string): number[] {
  const n = s.length
  const pi: number[] = new Array(n).fill(0)

  for (let i = 1; i < n; i++) {
    let j = pi[i - 1]
    while (j > 0 && s[i] !== s[j]) {
      j = pi[j - 1]
    }
    if (s[i] === s[j]) {
      j++
    }
    pi[i] = j
  }

  return pi
}

function findPattern(text: string, pattern: string): number[] {
  const combined = pattern + '#' + text
  const pi = computePrefixFunction(combined)
  const patternLen = pattern.length
  const matches: number[] = []

  for (let i = patternLen + 1; i < combined.length; i++) {
    if (pi[i] === patternLen) {
      matches.push(i - 2 * patternLen)
    }
  }

  return matches
}

export default function prefixFunctionDemo(): string {
  const output: string[] = []

  output.push('=== 前缀函数 (Prefix Function) 演示 ===\n')

  // 基本计算
  output.push('1. 计算字符串 "ababaca" 的前缀函数:')
  const s1 = 'ababaca'
  const pi1 = computePrefixFunction(s1)
  output.push(`   字符串: ${s1}`)
  output.push(`   pi 数组: [${pi1.join(', ')}]`)
  output.push('')

  // 详细步骤
  output.push('2. 详细计算过程:')
  for (let i = 0; i < s1.length; i++) {
    const prefix = s1.substring(0, i + 1)
    output.push(`   i=${i}, s[0..${i}] = "${prefix}", pi[${i}] = ${pi1[i]}`)
    if (pi1[i] > 0) {
      const match = s1.substring(0, pi1[i])
      output.push(`     最长相等前后缀: "${match}" (长度 ${pi1[i]})`)
    } else {
      output.push(`     无相等前后缀`)
    }
  }
  output.push('')

  // 周期性检测
  output.push('3. 字符串周期性检测:')
  const testStrings = ['abcabcabc', 'ababab', 'abcdef', 'aaaaaa', 'aabaaab']
  for (const str of testStrings) {
    const pi = computePrefixFunction(str)
    const n = str.length
    const lastPi = pi[n - 1]
    const period = n - lastPi
    const isPeriodic = n % period === 0 && lastPi >= n / 2
    output.push(`   "${str}": pi = [${pi.join(', ')}]`)
    if (isPeriodic) {
      const repeat = str.substring(0, period)
      output.push(`     周期 = ${period}, 基本单元 = "${repeat}", 重复 ${n / period} 次`)
    } else {
      output.push(`     无明显周期结构`)
    }
  }
  output.push('')

  // 模式匹配
  output.push('4. 使用前缀函数进行模式匹配:')
  const text = 'ababcabcabababd'
  const pattern = 'ababd'
  const matches = findPattern(text, pattern)
  output.push(`   文本: "${text}"`)
  output.push(`   模式: "${pattern}"`)
  output.push(`   匹配位置: [${matches.join(', ')}]`)
  output.push('')

  // 另一个匹配例子
  const text2 = 'aabaabaabaab'
  const pattern2 = 'aab'
  const matches2 = findPattern(text2, pattern2)
  output.push(`   文本: "${text2}"`)
  output.push(`   模式: "${pattern2}"`)
  output.push(`   匹配位置: [${matches2.join(', ')}]`)
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
