function buildFailFunction(pattern: string): number[] {
  const m = pattern.length
  const fail = new Array(m).fill(0)
  let k = 0
  for (let i = 1; i < m; i++) {
    while (k > 0 && pattern[k] !== pattern[i]) {
      k = fail[k - 1]
    }
    if (pattern[k] === pattern[i]) {
      k++
    }
    fail[i] = k
  }
  return fail
}

function buildDFA(pattern: string, alphabet: string): number[][] {
  const m = pattern.length
  const R = alphabet.length
  const charIndex = new Map<string, number>()
  for (let i = 0; i < R; i++) charIndex.set(alphabet[i], i)

  const dfa: number[][] = Array.from({ length: R }, () => new Array(m).fill(0))

  const firstIdx = charIndex.get(pattern[0]) ?? -1
  if (firstIdx >= 0) dfa[firstIdx][0] = 1

  let x = 0
  for (let j = 1; j < m; j++) {
    for (let c = 0; c < R; c++) {
      dfa[c][j] = dfa[c][x]
    }
    const pjIdx = charIndex.get(pattern[j]) ?? -1
    if (pjIdx >= 0) dfa[pjIdx][j] = j + 1
    const xIdx = charIndex.get(pattern[x]) ?? 0
    x = dfa[xIdx][x]
  }

  return dfa
}

function searchWithDFA(text: string, pattern: string, dfa: number[][], alphabet: string): number[] {
  const m = pattern.length
  const charIndex = new Map<string, number>()
  for (let i = 0; i < alphabet.length; i++) charIndex.set(alphabet[i], i)

  const results: number[] = []
  let state = 0

  for (let i = 0; i < text.length; i++) {
    const cIdx = charIndex.get(text[i]) ?? -1
    if (cIdx >= 0) {
      state = dfa[cIdx][state]
    } else {
      state = 0
    }
    if (state === m) {
      results.push(i - m + 1)
    }
  }

  return results
}

export default function kmpAutomatonDemo(): string {
  const output: string[] = []

  output.push('=== KMP自动机演示 ===\n')

  // 1. Build fail function
  const pattern = 'ABABC'
  output.push(`1. 模式串: "${pattern}"`)

  const fail = buildFailFunction(pattern)
  output.push(`   fail函数: [${fail.join(', ')}]`)
  output.push(`   含义: fail[i] 表示 pattern[0..i] 的最长相等前后缀长度\n`)

  // 2. Build DFA
  const text = 'ABABABCABABABC'
  const alphabet = Array.from(new Set((pattern + text).split(''))).sort().join('')
  output.push(`2. 字母表: {${alphabet.split('').join(', ')}}`)

  const dfa = buildDFA(pattern, alphabet)
  output.push(`   DFA转移表 (${dfa[0].length} 个状态, ${alphabet.length} 个字符):\n`)

  // Print transition table header
  const header = '     ' + alphabet.split('').map(c => c.padStart(4)).join('')
  output.push(header)

  for (let j = 0; j < dfa[0].length; j++) {
    const row = alphabet.split('').map((_, i) => dfa[i][j].toString().padStart(4)).join('')
    output.push(`  ${j}: ${row}`)
  }
  output.push('')

  // 3. Run matching
  output.push(`3. 匹配文本: "${text}"`)
  output.push(`   匹配过程:`)

  let state = 0
  const charIndex = new Map<string, number>()
  for (let i = 0; i < alphabet.length; i++) charIndex.set(alphabet[i], i)

  for (let i = 0; i < text.length; i++) {
    const prevState = state
    const cIdx = charIndex.get(text[i]) ?? -1
    if (cIdx >= 0) {
      state = dfa[cIdx][state]
    } else {
      state = 0
    }

    const action = state > prevState ? '匹配' : state < prevState ? '回退' : '保持'
    let line = `   i=${i}, 读入'${text[i]}': 状态${prevState} -> 状态${state} (${action})`

    if (state === pattern.length) {
      line += ` [找到匹配! 位置=${i - pattern.length + 1}]`
    }
    output.push(line)

    if (state === pattern.length) {
      state = 0
    }
  }
  output.push('')

  // 4. Direct search results
  const results = searchWithDFA(text, pattern, dfa, alphabet)
  output.push(`4. 搜索结果: 在位置 [${results.join(', ')}] 找到模式串`)

  // 5. Complexity
  output.push('\n5. 复杂度分析:')
  output.push(`   预处理: O(m × |Σ|) = O(${pattern.length} × ${alphabet.length}) = O(${pattern.length * alphabet.length})`)
  output.push(`   匹配:   O(n) = O(${text.length})`)
  output.push(`   空间:   O(m × |Σ|) = O(${pattern.length * alphabet.length})`)

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
