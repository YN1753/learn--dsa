export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 字符串哈希 (Rabin-Karp) 演示 ===')
  lines.push('')

  // --- 1. 多项式哈希计算 ---
  lines.push('【1】多项式哈希计算')
  lines.push('─────────────────────────')
  const base = 31
  const mod = 1e9 + 7
  lines.push(`基数 (base) = ${base}, 模数 (mod) = ${mod}`)
  lines.push('')

  const str1 = 'ABC'
  const hash1 = polynomialHash(str1, base, mod)
  lines.push(`字符串 "${str1}" 的哈希值计算:`)
  lines.push(`  H = (A×31² + B×31¹ + C×31⁰) mod ${mod}`)
  lines.push(`  H = (${charVal('A')}×961 + ${charVal('B')}×31 + ${charVal('C')}×1) mod ${mod}`)
  lines.push(`  H = (${charVal('A') * 961} + ${charVal('B') * 31} + ${charVal('C')}) mod ${mod}`)
  lines.push(`  H = ${charVal('A') * 961 + charVal('B') * 31 + charVal('C')} mod ${mod}`)
  lines.push(`  H = ${hash1}`)
  lines.push('')

  // --- 2. 滚动哈希演示 ---
  lines.push('【2】滚动哈希 (Rolling Hash) 演示')
  lines.push('─────────────────────────')
  const text2 = 'ABRACADABRA'
  const windowSize = 3
  lines.push(`文本 T = "${text2}", 窗口大小 m = ${windowSize}`)
  lines.push(`基数 base = ${base}, 模数 mod = ${mod}`)
  lines.push('')

  const powBaseM = modPow(base, windowSize, mod)
  lines.push(`预计算: base^m = ${base}^${windowSize} = ${powBaseM}`)
  lines.push('')

  // 计算第一个窗口的哈希值
  let hash = polynomialHash(text2.substring(0, windowSize), base, mod)
  lines.push(`初始窗口 T[0..2] = "${text2.substring(0, windowSize)}":`)
  lines.push(`  H_0 = ${hash}`)
  lines.push('')

  // 滚动计算后续窗口
  for (let i = 1; i <= text2.length - windowSize; i++) {
    const oldChar = text2[i - 1]
    const newChar = text2[i + windowSize - 1]
    const oldHash = hash

    // 滚动哈希公式
    hash = ((hash * base - oldChar.charCodeAt(0) * powBaseM % mod + newChar.charCodeAt(0)) % mod + mod) % mod

    const window = text2.substring(i, i + windowSize)
    lines.push(`滚动到 T[${i}..${i + windowSize - 1}] = "${window}":`)
    lines.push(`  H_${i} = (H_${i - 1} × ${base} - '${oldChar}'×${base}^${windowSize} + '${newChar}') mod ${mod}`)
    lines.push(`  H_${i} = (${oldHash} × ${base} - ${charVal(oldChar)}×${powBaseM} + ${charVal(newChar)}) mod ${mod}`)
    lines.push(`  H_${i} = ${hash}`)
    lines.push('')
  }

  // --- 3. Rabin-Karp 匹配 ---
  lines.push('【3】Rabin-Karp 字符串匹配')
  lines.push('─────────────────────────')
  const text3 = 'ABRACADABRA'
  const pattern3 = 'ABRA'
  lines.push(`文本 T = "${text3}", 模式 P = "${pattern3}"`)
  lines.push(`基数 base = ${base}, 模数 mod = ${mod}`)
  lines.push('')

  rabinKarpTrace(text3, pattern3, base, mod, lines)
  lines.push('')

  // --- 4. 哈希冲突演示 ---
  lines.push('【4】哈希冲突演示')
  lines.push('─────────────────────────')
  const smallMod = 13
  lines.push(`使用小模数 mod = ${smallMod} 来演示冲突:`)
  lines.push('')

  const testStrings = ['AB', 'BA', 'CD', 'DC', 'AB', 'XY']
  const hashMap = new Map<number, string[]>()

  for (const s of testStrings) {
    const h = polynomialHash(s, base, smallMod)
    const existing = hashMap.get(h) || []
    existing.push(s)
    hashMap.set(h, existing)
    lines.push(`  "${s}" → H = ${h}`)
  }

  lines.push('')
  lines.push('冲突分析:')
  for (const [h, strs] of hashMap) {
    if (strs.length > 1) {
      lines.push(`  哈希值 ${h}: ${strs.map(s => `"${s}"`).join(', ')} 发生冲突!`)
    }
  }
  lines.push('')
  lines.push('结论: 使用小模数时冲突率很高，必须选择大质数作为模数')
  lines.push('')

  // --- 5. 双哈希演示 ---
  lines.push('【5】双哈希 (Double Hashing)')
  lines.push('─────────────────────────')
  const base2 = 131
  const mod2 = 1e9 + 9
  lines.push(`哈希1: base=${base}, mod=${mod}`)
  lines.push(`哈希2: base=${base2}, mod=${mod2}`)
  lines.push('')

  const pairs = [
    ['ABC', 'XYZ'],
    ['HELLO', 'WORLD'],
    ['ABRA', 'ABRA'],
  ]

  for (const [s1, s2] of pairs) {
    const h1a = polynomialHash(s1, base, mod)
    const h1b = polynomialHash(s1, base2, mod2)
    const h2a = polynomialHash(s2, base, mod)
    const h2b = polynomialHash(s2, base2, mod2)
    const singleMatch = h1a === h2a
    const doubleMatch = h1a === h2a && h1b === h2b

    lines.push(`"${s1}" vs "${s2}":`)
    lines.push(`  哈希1: ${h1a} vs ${h2a} → ${singleMatch ? '匹配' : '不匹配'}`)
    lines.push(`  哈希2: ${h1b} vs ${h2b} → ${h1b === h2b ? '匹配' : '不匹配'}`)
    lines.push(`  双哈希结论: ${doubleMatch ? '两个字符串相同' : '两个字符串不同'}`)
    lines.push('')
  }

  // --- 6. 效率对比 ---
  lines.push('【6】效率对比')
  lines.push('─────────────────────────')
  const longText = 'A'.repeat(10000) + 'B' + 'A'.repeat(9999)
  const longPattern = 'A'.repeat(1000) + 'B'

  const bruteCount = bruteForceCount(longText, longPattern)
  const rkCount = rabinKarpCount(longText, longPattern)

  lines.push(`文本长度: ${longText.length}, 模式长度: ${longPattern.length}`)
  lines.push(`暴力匹配: 比较 ${bruteCount} 次`)
  lines.push(`Rabin-Karp: 哈希计算 + 验证共约 ${rkCount} 次操作`)
  lines.push(`效率提升: 约 ${(bruteCount / rkCount).toFixed(1)} 倍`)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 计算字符值 (ASCII 码)
function charVal(ch: string): number {
  return ch.charCodeAt(0)
}

// 快速幂: base^exp mod mod
function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base %= mod
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod
    base = (base * base) % mod
    exp >>= 1
  }
  return result
}

// 多项式哈希
function polynomialHash(s: string, base: number, mod: number): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (hash * base + s.charCodeAt(i)) % mod
  }
  return hash
}

// Rabin-Karp 匹配详细过程
function rabinKarpTrace(
  text: string,
  pattern: string,
  base: number,
  mod: number,
  lines: string[]
): number[] {
  const n = text.length
  const m = pattern.length
  const matches: number[] = []

  if (m === 0 || n < m) return matches

  // 预计算
  const hashP = polynomialHash(pattern, base, mod)
  const powBaseM = modPow(base, m, mod)
  lines.push(`模式串哈希: H(P) = ${hashP}`)
  lines.push(`预计算: base^m = ${powBaseM}`)
  lines.push('')

  // 计算第一个窗口
  let hashW = polynomialHash(text.substring(0, m), base, mod)
  let comparisons = 0

  for (let i = 0; i <= n - m; i++) {
    const window = text.substring(i, i + m)
    const hashMatch = hashW === hashP

    if (hashMatch) {
      // 逐字符验证
      comparisons++
      const charMatch = window === pattern
      if (charMatch) {
        lines.push(`位置 ${i}: H("${window}") = ${hashW} == H(P) = ${hashP} ✓ 哈希匹配, 验证通过! ★ 找到匹配`)
        matches.push(i)
      } else {
        lines.push(`位置 ${i}: H("${window}") = ${hashW} == H(P) = ${hashP} ✓ 哈希匹配, 但验证失败 (冲突!)`)
      }
    } else {
      lines.push(`位置 ${i}: H("${window}") = ${hashW} ≠ H(P) = ${hashP} ✗ 哈希不匹配, 跳过`)
    }

    // 滚动哈希
    if (i < n - m) {
      const oldChar = text[i]
      const newChar = text[i + m]
      hashW = ((hashW * base - oldChar.charCodeAt(0) * powBaseM % mod + newChar.charCodeAt(0)) % mod + mod) % mod
    }
  }

  lines.push('')
  lines.push(`找到 ${matches.length} 个匹配: 位置 [${matches.join(', ')}]`)
  return matches
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

// Rabin-Karp 计数
function rabinKarpCount(text: string, pattern: string): number {
  const n = text.length
  const m = pattern.length
  const base = 31
  const mod = 1e9 + 7

  if (m === 0 || n < m) return 0

  let count = 0
  const hashP = polynomialHash(pattern, base, mod)
  const powBaseM = modPow(base, m, mod)
  let hashW = polynomialHash(text.substring(0, m), base, mod)

  for (let i = 0; i <= n - m; i++) {
    count++ // 每次哈希比较算一次操作
    if (hashW === hashP) {
      count += m // 冲突验证
      if (text.substring(i, i + m) === pattern) {
        // found
      }
    }

    if (i < n - m) {
      hashW = ((hashW * base - text.charCodeAt(i) * powBaseM % mod + text.charCodeAt(i + m)) % mod + mod) % mod
    }
  }

  return count
}
