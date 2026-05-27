interface SAMState {
  len: number
  link: number
  transitions: Record<string, number>
}

let samStates: SAMState[] = []
let samLast = 0

function samInit(): void {
  samStates = []
  samLast = 0
  samStates.push({ len: 0, link: -1, transitions: {} })
}

function samExtend(c: string): void {
  const cur = samStates.length
  samStates.push({ len: samStates[samLast].len + 1, link: 0, transitions: {} })

  let p = samLast
  while (p !== -1 && !samStates[p].transitions[c]) {
    samStates[p].transitions[c] = cur
    p = samStates[p].link
  }

  if (p === -1) {
    samStates[cur].link = 0
  } else {
    const q = samStates[p].transitions[c]
    if (samStates[p].len + 1 === samStates[q].len) {
      samStates[cur].link = q
    } else {
      const clone = samStates.length
      samStates.push({
        len: samStates[p].len + 1,
        link: samStates[q].link,
        transitions: { ...samStates[q].transitions },
      })
      while (p !== -1 && samStates[p].transitions[c] === q) {
        samStates[p].transitions[c] = clone
        p = samStates[p].link
      }
      samStates[q].link = clone
      samStates[cur].link = clone
    }
  }

  samLast = cur
}

function samBuild(str: string): void {
  samInit()
  for (const ch of str) {
    samExtend(ch)
  }
}

function samCountDistinctSubstrings(): number {
  let count = 0
  for (let i = 1; i < samStates.length; i++) {
    count += samStates[i].len - samStates[samStates[i].link].len
  }
  return count
}

function samCountOccurrences(str: string): number[] {
  // Build suffix link tree and compute subtree sizes
  const size = samStates.length
  const cnt: number[] = new Array(size).fill(0)

  // Each state created during construction is an end position
  let p = samLast
  while (p !== -1) {
    cnt[p] = 1
    p = samStates[p].link
  }

  // Sort states by len descending (bucket sort)
  const bucketLen: number[] = new Array(str.length + 1).fill(0)
  for (let i = 0; i < size; i++) bucketLen[samStates[i].len]++
  for (let i = 1; i <= str.length; i++) bucketLen[i] += bucketLen[i - 1]
  const order: number[] = new Array(size)
  for (let i = size - 1; i >= 0; i--) order[--bucketLen[samStates[i].len]] = i

  // Accumulate along suffix link tree (from long to short)
  for (let i = size - 1; i >= 1; i--) {
    const v = order[i]
    if (samStates[v].link >= 0) {
      cnt[samStates[v].link] += cnt[v]
    }
  }

  return cnt
}

function samQuery(_str: string, pattern: string): boolean {
  let v = 0
  for (const ch of pattern) {
    if (!samStates[v].transitions[ch]) return false
    v = samStates[v].transitions[ch]
  }
  return true
}

export default function suffixAutomatonDemo(): string {
  const output: string[] = []

  output.push('=== 后缀自动机演示 ===\n')

  // Build SAM
  const text = 'abcbc'
  output.push(`1. 构建字符串 "${text}" 的后缀自动机`)

  samBuild(text)

  output.push(`   共创建 ${samStates.length} 个状态 (包括初始状态)\n`)

  // Print states
  output.push('2. 状态信息:')
  for (let i = 0; i < samStates.length; i++) {
    const s = samStates[i]
    const trans = Object.entries(s.transitions)
      .map(([ch, to]) => `${ch}->${to}`)
      .join(', ')
    output.push(`   状态 ${i}: len=${s.len}, link=${s.link}, 转移=[${trans}]`)
  }
  output.push('')

  // Distinct substrings
  output.push(`3. 不同子串个数: ${samCountDistinctSubstrings()}`)
  output.push('   (公式: 所有状态的 len[v] - len[link[v]] 之和)\n')

  // Verify by brute force
  const substrings = new Set<string>()
  for (let i = 0; i < text.length; i++) {
    for (let j = i + 1; j <= text.length; j++) {
      substrings.add(text.substring(i, j))
    }
  }
  output.push(`   暴力验证: ${substrings.size} 个不同子串`)
  output.push(`   子串列表: ${Array.from(substrings).sort().join(', ')}\n`)

  // Occurrence counts
  output.push('4. 子串出现次数统计:')
  const occ = samCountOccurrences(text)
  for (let i = 0; i < samStates.length; i++) {
    if (occ[i] > 0) {
      output.push(`   状态 ${i} (len=${samStates[i].len}): 出现 ${occ[i]} 次`)
    }
  }
  output.push('')

  // Pattern queries
  output.push('5. 子串查询:')
  const patterns = ['ab', 'bc', 'abc', 'bcb', 'xyz', 'abcbc', 'c']
  for (const p of patterns) {
    const found = samQuery(text, p)
    output.push(`   "${p}" ${found ? '是' : '不是'} "${text}" 的子串`)
  }
  output.push('')

  // Longest common substring
  output.push('6. 最长公共子串示例:')
  const s1 = 'abcde'
  const s2 = 'abfcd'
  samBuild(s1)
  let v = 0
  let l = 0
  let best = 0
  let bestEnd = 0
  for (let i = 0; i < s2.length; i++) {
    const ch = s2[i]
    if (samStates[v].transitions[ch]) {
      v = samStates[v].transitions[ch]
      l++
    } else {
      while (v !== -1 && !samStates[v].transitions[ch]) {
        v = samStates[v].link
      }
      if (v === -1) {
        v = 0
        l = 0
      } else {
        l = samStates[v].len + 1
        v = samStates[v].transitions[ch]
      }
    }
    if (l > best) {
      best = l
      bestEnd = i + 1
    }
  }
  output.push(`   "${s1}" 和 "${s2}" 的最长公共子串: "${s2.substring(bestEnd - best, bestEnd)}" (长度 ${best})`)
  output.push('')

  // Second example
  output.push('7. 另一个例子: "aabab"')
  samBuild('aabab')
  output.push(`   共创建 ${samStates.length} 个状态`)
  output.push(`   不同子串个数: ${samCountDistinctSubstrings()}`)

  const substrings2 = new Set<string>()
  for (let i = 0; i < 'aabab'.length; i++) {
    for (let j = i + 1; j <= 'aabab'.length; j++) {
      substrings2.add('aabab'.substring(i, j))
    }
  }
  output.push(`   暴力验证: ${substrings2.size} 个不同子串`)
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
