interface EertreeNode {
  len: number
  link: number
  next: Map<string, number>
  count: number
  occurrences: number
}

function buildEertree(s: string): { nodes: EertreeNode[]; longestSuffix: number[] } {
  // Initialize with two root nodes
  const nodes: EertreeNode[] = [
    { len: -1, link: 0, next: new Map(), count: 0, occurrences: 0 }, // odd root
    { len: 0, link: 0, next: new Map(), count: 0, occurrences: 0 },  // even root
  ]
  let last = 1 // points to node representing longest palindromic suffix
  const longestSuffix: number[] = []

  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    let cur = last

    // Find the longest palindromic suffix that can be extended
    while (true) {
      const curLen = nodes[cur].len
      if (i - curLen - 1 >= 0 && s[i - curLen - 1] === ch) {
        break
      }
      cur = nodes[cur].link
    }

    // Check if the extended palindrome already exists
    if (nodes[cur].next.has(ch)) {
      last = nodes[cur].next.get(ch)!
      nodes[last].occurrences++
      longestSuffix.push(last)
      continue
    }

    // Create new node
    const newNodeIdx = nodes.length
    nodes[cur].next.set(ch, newNodeIdx)
    nodes.push({ len: nodes[cur].len + 2, link: 0, next: new Map(), count: 0, occurrences: 1 })

    if (nodes[newNodeIdx].len === 1) {
      nodes[newNodeIdx].link = 1
      last = newNodeIdx
      longestSuffix.push(newNodeIdx)
      continue
    }

    // Find suffix link for the new node
    let linkCur = nodes[cur].link
    while (true) {
      const linkLen = nodes[linkCur].len
      if (i - linkLen - 1 >= 0 && s[i - linkLen - 1] === ch) {
        break
      }
      linkCur = nodes[linkCur].link
    }
    nodes[newNodeIdx].link = nodes[linkCur].next.get(ch)!
    last = newNodeIdx
    longestSuffix.push(newNodeIdx)
  }

  // Propagate occurrence counts
  const order = nodes.map((_, idx) => idx).slice(2).sort((a, b) => nodes[b].len - nodes[a].len)
  for (const idx of order) {
    nodes[nodes[idx].link].count += nodes[idx].count
  }
  // Each node's count = its own occurrence count + occurrences via suffix links
  for (const idx of order) {
    nodes[nodes[idx].link].occurrences += nodes[idx].occurrences
  }

  return { nodes, longestSuffix }
}

export default function palindromicTreeDemo(): string {
  const output: string[] = []

  output.push('=== 回文树（Eertree）演示 ===\n')

  const testString = 'abacabacabb'
  output.push(`输入字符串: "${testString}"\n`)

  const { nodes, longestSuffix } = buildEertree(testString)

  output.push('1. 节点信息（本质不同的回文子串）:')
  output.push('   节点 0: 奇根 (len=-1, 虚拟节点)')
  output.push('   节点 1: 偶根 (len=0, 空字符串)')
  for (let i = 2; i < nodes.length; i++) {
    const node = nodes[i]
    output.push(`   节点 ${i}: len=${node.len}, suffixLink=${node.link}, 出现次数=${node.occurrences}`)
  }
  output.push('')

  output.push(`2. 本质不同回文子串总数: ${nodes.length - 2}`)
  output.push('   (节点数减去两个根节点)\n')

  output.push('3. 逐字符构建过程:')
  for (let i = 0; i < testString.length; i++) {
    const suffixNode = longestSuffix[i]
    const suffixLen = nodes[suffixNode].len
    // Extract the palindrome from the string
    const start = i - suffixLen + 1
    const palindrome = testString.substring(start, i + 1)
    output.push(`   添加 '${testString[i]}' -> 最长回文后缀: "${palindrome}" (长度=${suffixLen})`)
  }
  output.push('')

  output.push('4. 所有本质不同的回文子串:')
  const palindromes: string[] = []
  function extractPalindromes(nodeIdx: number, chars: string) {
    if (nodeIdx >= 2) {
      palindromes.push(chars)
    }
    for (const [ch, nextIdx] of nodes[nodeIdx].next) {
      extractPalindromes(nextIdx, ch + chars + ch)
    }
    // Also handle odd-length from odd root
    if (nodeIdx === 0) {
      for (const [ch, nextIdx] of nodes[nodeIdx].next) {
        extractPalindromes(nextIdx, ch)
      }
    }
  }
  // For even root: add children as 2-char palindromes
  for (const [ch, nextIdx] of nodes[1].next) {
    extractPalindromes(nextIdx, ch + ch)
  }
  // For odd root: single char palindromes
  for (const [ch, nextIdx] of nodes[0].next) {
    extractPalindromes(nextIdx, ch)
  }
  // Deduplicate
  const uniquePalindromes = [...new Set(palindromes)].sort((a, b) => a.length - b.length || a.localeCompare(b))
  for (const p of uniquePalindromes) {
    output.push(`   "${p}"`)
  }
  output.push('')

  // Additional test
  output.push('5. 另一个示例: s = "aaaa"')
  const { nodes: nodes2, longestSuffix: ls2 } = buildEertree('aaaa')
  output.push(`   本质不同回文子串数: ${nodes2.length - 2}`)
  for (let i = 0; i < 4; i++) {
    const suffixLen = nodes2[ls2[i]].len
    const start = i - suffixLen + 1
    const palindrome = 'aaaa'.substring(start, i + 1)
    output.push(`   添加 'a' -> 最长回文后缀: "${palindrome}" (长度=${suffixLen})`)
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
