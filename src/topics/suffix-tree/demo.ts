interface SuffixTreeNode {
  children: Map<string, { start: number; end: number; node: SuffixTreeNode }>
  suffixLink: SuffixTreeNode | null
  id: number
  isLeaf: boolean
}

let nodeIdCounter = 0

function createNode(): SuffixTreeNode {
  return {
    children: new Map(),
    suffixLink: null,
    id: nodeIdCounter++,
    isLeaf: false,
  }
}

function printTree(node: SuffixTreeNode, text: string, prefix: string, isLast: boolean, output: string[]): void {
  const connector = isLast ? '└── ' : '├── '
  const childPrefix = prefix + (isLast ? '    ' : '│   ')

  const entries = Array.from(node.children.entries())
  entries.forEach(([ch, edge], index) => {
    const isChildLast = index === entries.length - 1
    const label = text.substring(edge.start, edge.end + 1)
    const leafMark = edge.node.isLeaf ? ' *' : ''
    output.push(`${prefix}${connector}[${edge.start}..${edge.end}] "${label}"${leafMark}`)
    printTree(edge.node, text, childPrefix, isChildLast, output)
  })
}

function buildSimpleSuffixTree(text: string): SuffixTreeNode {
  nodeIdCounter = 0
  const root = createNode()

  // Simple O(n^2) construction for demo purposes
  for (let i = 0; i < text.length; i++) {
    let current = root
    for (let j = i; j < text.length; j++) {
      const ch = text[j]
      if (current.children.has(ch)) {
        const edge = current.children.get(ch)!
        const edgeLabel = text.substring(edge.start, edge.end + 1)
        let k = 0
        while (k < edgeLabel.length && edge.start + k <= edge.end && text[edge.start + k] === text[j + k]) {
          k++
        }
        if (k === edgeLabel.length) {
          current = edge.node
          continue
        }
        // Split edge
        const splitNode = createNode()
        const newLeaf = createNode()
        newLeaf.isLeaf = true

        splitNode.children.set(edgeLabel[k], {
          start: edge.start + k,
          end: edge.end,
          node: edge.node,
        })
        splitNode.children.set(text[j + k], {
          start: j + k,
          end: text.length - 1,
          node: newLeaf,
        })

        edge.end = edge.start + k - 1
        edge.node = splitNode
        break
      } else {
        const newLeaf = createNode()
        newLeaf.isLeaf = true
        current.children.set(ch, {
          start: j,
          end: text.length - 1,
          node: newLeaf,
        })
        break
      }
    }
  }

  return root
}

function searchPattern(root: SuffixTreeNode, text: string, pattern: string): number[] {
  const results: number[] = []

  // Navigate to the pattern
  let current = root
  let patternIdx = 0

  while (patternIdx < pattern.length) {
    const ch = pattern[patternIdx]
    if (!current.children.has(ch)) {
      return results // Pattern not found
    }
    const edge = current.children.get(ch)!
    const edgeLabel = text.substring(edge.start, edge.end + 1)

    let k = 0
    while (k < edgeLabel.length && patternIdx < pattern.length) {
      if (edgeLabel[k] !== pattern[patternIdx]) {
        return results
      }
      k++
      patternIdx++
    }
    current = edge.node
  }

  // Collect all leaves under current node
  function collectLeaves(node: SuffixTreeNode, depth: number): void {
    if (node.isLeaf) {
      results.push(text.length - depth)
    }
    for (const [, edge] of node.children) {
      const edgeLen = edge.end - edge.start + 1
      collectLeaves(edge.node, depth + edgeLen)
    }
  }

  collectLeaves(current, pattern.length)
  return results.sort((a, b) => a - b)
}

export default function suffixTreeDemo(): string {
  const output: string[] = []

  output.push('=== 后缀树演示 ===\n')

  // Build suffix tree
  const text = 'banana$'
  output.push(`1. 构建字符串 "${text}" 的后缀树`)
  output.push(`   所有后缀:`)
  for (let i = 0; i < text.length; i++) {
    output.push(`     [${i}] ${text.substring(i)}`)
  }
  output.push('')

  const root = buildSimpleSuffixTree(text)

  output.push('2. 后缀树结构:')
  const treeLines: string[] = []
  treeLines.push('root')
  printTree(root, text, '', true, treeLines)
  output.push('   ' + treeLines.join('\n   '))
  output.push('')

  // Pattern search
  const patterns = ['an', 'na', 'ban', 'nan', 'xyz']
  output.push('3. 模式搜索演示:')

  for (const pattern of patterns) {
    const positions = searchPattern(root, text, pattern)
    if (positions.length > 0) {
      output.push(`   搜索 "${pattern}": 在位置 [${positions.join(', ')}] 找到`)
    } else {
      output.push(`   搜索 "${pattern}": 未找到`)
    }
  }
  output.push('')

  // Different substring count
  output.push('4. 不同子串计数:')
  const substrings = new Set<string>()
  for (let i = 0; i < text.length; i++) {
    for (let j = i + 1; j <= text.length; j++) {
      substrings.add(text.substring(i, j))
    }
  }
  output.push(`   字符串 "${text}" 共有 ${substrings.size} 个不同子串`)
  output.push('')

  // Longest repeated substring
  output.push('5. 最长重复子串:')
  let longestRepeated = ''
  for (let i = 0; i < text.length; i++) {
    for (let j = i + 1; j < text.length; j++) {
      const sub = text.substring(i, j)
      if (sub.length > longestRepeated.length) {
        // Check if it appears more than once
        let count = 0
        let pos = 0
        while ((pos = text.indexOf(sub, pos)) !== -1) {
          count++
          pos++
        }
        if (count > 1) {
          longestRepeated = sub
        }
      }
    }
  }
  output.push(`   最长重复子串: "${longestRepeated}"`)
  output.push('')

  // Second example
  output.push('6. 另一个例子: "abcabxabcd$"')
  const text2 = 'abcabxabcd$'
  const root2 = buildSimpleSuffixTree(text2)
  const treeLines2: string[] = []
  treeLines2.push('root')
  printTree(root2, text2, '', true, treeLines2)
  output.push('   ' + treeLines2.join('\n   '))
  output.push('')

  const positions2 = searchPattern(root2, text2, 'abc')
  output.push(`   搜索 "abc": 在位置 [${positions2.join(', ')}] 找到`)

  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
