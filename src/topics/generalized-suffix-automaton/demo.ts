interface GSAMState {
  len: number
  link: number
  transitions: Record<string, number>
  source: Set<number> // 来源标记：记录该状态来自哪些字符串
}

let gsamStates: GSAMState[] = []
let gsamLast = 0
let gsamStringCount = 0

function gsamInit(): void {
  gsamStates = []
  gsamLast = 0
  gsamStringCount = 0
  gsamStates.push({ len: 0, link: -1, transitions: {}, source: new Set() })
}

function gsamExtend(c: string, stringIdx: number): void {
  const cur = gsamStates.length
  gsamStates.push({
    len: gsamStates[gsamLast].len + 1,
    link: 0,
    transitions: {},
    source: new Set([stringIdx]),
  })

  let p = gsamLast
  while (p !== -1 && !gsamStates[p].transitions[c]) {
    gsamStates[p].transitions[c] = cur
    p = gsamStates[p].link
  }

  if (p === -1) {
    gsamStates[cur].link = 0
  } else {
    const q = gsamStates[p].transitions[c]
    if (gsamStates[p].len + 1 === gsamStates[q].len) {
      gsamStates[cur].link = q
    } else {
      const clone = gsamStates.length
      gsamStates.push({
        len: gsamStates[p].len + 1,
        link: gsamStates[q].link,
        transitions: { ...gsamStates[q].transitions },
        source: new Set(gsamStates[q].source), // clone 继承 q 的来源
      })
      while (p !== -1 && gsamStates[p].transitions[c] === q) {
        gsamStates[p].transitions[c] = clone
        p = gsamStates[p].link
      }
      gsamStates[q].link = clone
      gsamStates[cur].link = clone
    }
  }

  gsamLast = cur
}

function gsamBuildString(str: string, stringIdx: number): void {
  gsamLast = 0 // 关键：每条新串从根节点开始
  for (const ch of str) {
    gsamExtend(ch, stringIdx)
  }
}

function gsamBuild(strings: string[]): void {
  gsamInit()
  for (let i = 0; i < strings.length; i++) {
    gsamBuildString(strings[i], i)
  }
  gsamStringCount = strings.length
}

function gsamCountDistinctSubstrings(): number {
  let count = 0
  for (let i = 1; i < gsamStates.length; i++) {
    count += gsamStates[i].len - gsamStates[gsamStates[i].link].len
  }
  return count
}

function gsamQuery(pattern: string): boolean {
  let v = 0
  for (const ch of pattern) {
    if (!gsamStates[v].transitions[ch]) return false
    v = gsamStates[v].transitions[ch]
  }
  return true
}

function gsamFindCommonSubstrings(minLen: number): string[] {
  // 找出同时包含所有字符串来源的状态，返回其代表的最长子串长度
  const results: { state: number; maxLen: number }[] = []
  for (let i = 1; i < gsamStates.length; i++) {
    if (gsamStates[i].source.size === gsamStringCount) {
      results.push({ state: i, maxLen: gsamStates[i].len })
    }
  }
  results.sort((a, b) => b.maxLen - a.maxLen)
  return results
    .filter(r => r.maxLen >= minLen)
    .map(r => `状态 ${r.state}: 最长公共子串长度 = ${r.maxLen}`)
}

export default function generalizedSuffixAutomatonDemo(): string {
  const output: string[] = []

  output.push('=== 广义后缀自动机演示 ===\n')

  // 构建 GSAM
  const strings = ['abcbc', 'bcbc', 'abc']
  output.push(`1. 构建 ${strings.length} 个字符串的广义后缀自动机:`)
  for (let i = 0; i < strings.length; i++) {
    output.push(`   字符串 ${i}: "${strings[i]}"`)
  }
  output.push('')

  gsamBuild(strings)
  output.push(`   共创建 ${gsamStates.length} 个状态 (包括初始状态)\n`)

  // 打印状态信息
  output.push('2. 状态信息 (仅显示非空来源):')
  for (let i = 0; i < gsamStates.length; i++) {
    const s = gsamStates[i]
    const trans = Object.entries(s.transitions)
      .map(([ch, to]) => `${ch}->${to}`)
      .join(', ')
    const sources = Array.from(s.source).join(',')
    output.push(`   状态 ${i}: len=${s.len}, link=${s.link}, 来源=[${sources}], 转移=[${trans}]`)
  }
  output.push('')

  // 不同子串计数
  output.push(`3. 所有字符串的不同子串总数: ${gsamCountDistinctSubstrings()}`)
  output.push('   (包含所有字符串的所有不同子串)\n')

  // 暴力验证
  const allSubstrings = new Set<string>()
  for (const s of strings) {
    for (let i = 0; i < s.length; i++) {
      for (let j = i + 1; j <= s.length; j++) {
        allSubstrings.add(s.substring(i, j))
      }
    }
  }
  output.push(`   暴力验证: ${allSubstrings.size} 个不同子串`)
  output.push(`   子串列表: ${Array.from(allSubstrings).sort().join(', ')}\n`)

  // 子串查询
  output.push('4. 子串查询:')
  const patterns = ['ab', 'bc', 'abc', 'bcbc', 'xyz', 'cbc', 'a']
  for (const p of patterns) {
    const found = gsamQuery(p)
    const inWhich = strings
      .map((s, idx) => (s.includes(p) ? idx : -1))
      .filter(idx => idx >= 0)
    output.push(`   "${p}" ${found ? '是' : '不是'} 某个字符串的子串 (出现于字符串: ${inWhich.join(',')})`)
  }
  output.push('')

  // 公共子串
  output.push('5. 所有字符串的公共子串:')
  const commonResults = gsamFindCommonSubstrings(1)
  if (commonResults.length > 0) {
    for (const r of commonResults) {
      output.push(`   ${r}`)
    }
  } else {
    output.push('   没有公共子串')
  }
  output.push('')

  // 来源分析
  output.push('6. 来源分析 (各状态覆盖的字符串数):')
  const sourceCounts = new Map<number, number[]>()
  for (let i = 0; i < gsamStates.length; i++) {
    const size = gsamStates[i].source.size
    if (!sourceCounts.has(size)) sourceCounts.set(size, [])
    sourceCounts.get(size)!.push(i)
  }
  for (const [size, states] of Array.from(sourceCounts.entries()).sort((a, b) => b[0] - a[0])) {
    output.push(`   来自 ${size} 个字符串的状态: [${states.join(', ')}]`)
  }
  output.push('')

  // 另一个例子
  output.push('7. 另一个例子: ["aab", "ab", "b"]')
  const strings2 = ['aab', 'ab', 'b']
  gsamBuild(strings2)
  output.push(`   共创建 ${gsamStates.length} 个状态`)
  output.push(`   不同子串总数: ${gsamCountDistinctSubstrings()}`)

  const allSub2 = new Set<string>()
  for (const s of strings2) {
    for (let i = 0; i < s.length; i++) {
      for (let j = i + 1; j <= s.length; j++) {
        allSub2.add(s.substring(i, j))
      }
    }
  }
  output.push(`   暴力验证: ${allSub2.size} 个不同子串`)
  output.push('')

  const commonResults2 = gsamFindCommonSubstrings(1)
  output.push('   所有字符串的公共子串:')
  if (commonResults2.length > 0) {
    for (const r of commonResults2) {
      output.push(`     ${r}`)
    }
  } else {
    output.push('     没有公共子串')
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
