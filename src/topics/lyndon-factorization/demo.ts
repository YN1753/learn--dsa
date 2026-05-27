function duvalFactorize(s: string): string[] {
  const n = s.length
  const factors: string[] = []
  let i = 0

  while (i < n) {
    let j = i + 1
    let k = i

    while (j < n && s[k] <= s[j]) {
      if (s[k] < s[j]) {
        k = i
      } else {
        k++
      }
      j++
    }

    while (i <= k) {
      factors.push(s.substring(i, i + j - k))
      i += j - k
    }
  }

  return factors
}

function minRepresentation(s: string): { start: number; rotation: string } {
  const doubled = s + s
  const factors = duvalFactorize(doubled)
  let pos = 0

  for (const factor of factors) {
    if (factor.length >= s.length) {
      return { start: pos % s.length, rotation: doubled.substring(pos, pos + s.length) }
    }
    pos += factor.length
  }

  return { start: 0, rotation: s }
}

export default function lyndonFactorizationDemo(): string {
  const output: string[] = []

  output.push('=== Lyndon分解演示 ===\n')

  // 基本Lyndon分解
  output.push('1. Lyndon词检测')
  output.push('   Lyndon词定义：严格小于所有真后缀的字符串')
  const testWords = ['ababb', 'banana', 'aababb', 'abc', 'aaa']
  for (const word of testWords) {
    const factors = duvalFactorize(word)
    const isLyndon = factors.length === 1
    output.push(`   「${word}」: ${isLyndon ? '是Lyndon词' : '不是Lyndon词'}, 分解 = [${factors.map(f => `「${f}」`).join(', ')}]`)
  }
  output.push('')

  // Duval算法分解示例
  output.push('2. Duval算法Lyndon分解')
  const examples = ['abcabc', 'ababb', 'aababb', 'dcbaabcd', 'abacabadabacaba']
  for (const s of examples) {
    const factors = duvalFactorize(s)
    output.push(`   「${s}」 -> [${factors.map(f => `「${f}」`).join(', ')}]`)
  }
  output.push('')

  // 分解性质验证
  output.push('3. 分解性质验证')
  output.push('   性质1: 每个因子都是Lyndon词')
  output.push('   性质2: 因子按字典序非增排列 (w1 >= w2 >= ... >= wk)')
  const verifyStr = 'abcabac'
  const verifyFactors = duvalFactorize(verifyStr)
  output.push(`   示例: 「${verifyStr}」 -> [${verifyFactors.map(f => `「${f}」`).join(', ')}]`)
  for (let i = 0; i < verifyFactors.length - 1; i++) {
    const cmp = verifyFactors[i] >= verifyFactors[i + 1] ? '>=' : '<'
    output.push(`   ${verifyFactors[i]} ${cmp} ${verifyFactors[i + 1]}`)
  }
  output.push('')

  // 最小表示法
  output.push('4. 最小表示法 (Minimum Representation)')
  const rotations = ['abc', 'aab', 'abab', 'dcba']
  for (const s of rotations) {
    const result = minRepresentation(s)
    output.push(`   「${s}」的最小表示: 从位置 ${result.start} 开始 -> 「${result.rotation}」`)

    // 枚举所有循环同构验证
    const allRotations: string[] = []
    for (let i = 0; i < s.length; i++) {
      allRotations.push(s.substring(i) + s.substring(0, i))
    }
    allRotations.sort()
    output.push(`     所有循环同构排序: [${allRotations.map(r => `「${r}」`).join(', ')}]`)
    output.push(`     最小的是「${allRotations[0]}」，与结果一致: ${allRotations[0] === result.rotation ? '是' : '否'}`)
  }
  output.push('')

  // Lyndon词计数
  output.push('5. 不同长度的Lyndon词数量 (二进制字母表)')
  output.push('   Lyndon词数量 = (1/n) * sum(d|n) mu(d) * 2^(n/d)')
  for (let n = 1; n <= 8; n++) {
    let count = 0
    for (let d = 1; d <= n; d++) {
      if (n % d === 0) {
        count += mobius(d) * Math.pow(2, n / d)
      }
    }
    count = Math.round(count / n)
    output.push(`   长度 ${n}: ${count} 个Lyndon词`)
  }
  output.push('')

  // 应用场景
  output.push('6. 应用场景')
  output.push('   - 字符串最小表示法: O(n) 求循环同构中字典序最小的')
  output.push('   - Burrows-Wheeler变换(BWT): 数据压缩的核心操作')
  output.push('   - 字符串匹配: 利用Lyndon分解加速模式匹配')
  output.push('   - de Bruijn序列: 构造包含所有k长度子串的最短序列')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}

function mobius(n: number): number {
  if (n === 1) return 1
  let factors = 0
  let d = 2
  let remaining = n
  while (d * d <= remaining) {
    if (remaining % d === 0) {
      factors++
      remaining /= d
      if (remaining % d === 0) return 0
    }
    d++
  }
  if (remaining > 1) factors++
  return factors % 2 === 0 ? 1 : -1
}
