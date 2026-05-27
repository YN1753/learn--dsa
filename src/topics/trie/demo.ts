// 字典树 (Trie) 演示

class TrieNode {
  children: Map<string, TrieNode>
  isEnd: boolean

  constructor() {
    this.children = new Map()
    this.isEnd = false
  }
}

class Trie {
  root: TrieNode

  constructor() {
    this.root = new TrieNode()
  }

  insert(word: string): void {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode())
      }
      node = node.children.get(char)!
    }
    node.isEnd = true
  }

  search(word: string): boolean {
    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) return false
      node = node.children.get(char)!
    }
    return node.isEnd
  }

  startsWith(prefix: string): boolean {
    let node = this.root
    for (const char of prefix) {
      if (!node.children.has(char)) return false
      node = node.children.get(char)!
    }
    return true
  }

  getAllWords(): string[] {
    const words: string[] = []
    this._collect(this.root, '', words)
    return words
  }

  private _collect(node: TrieNode, prefix: string, words: string[]): void {
    if (node.isEnd) words.push(prefix)
    for (const [char, child] of node.children) {
      this._collect(child, prefix + char, words)
    }
  }

  getWordsWithPrefix(prefix: string): string[] {
    let node = this.root
    for (const char of prefix) {
      if (!node.children.has(char)) return []
      node = node.children.get(char)!
    }
    const words: string[] = []
    this._collect(node, prefix, words)
    return words
  }

  getNodeCount(): number {
    let count = 0
    const queue: TrieNode[] = [this.root]
    while (queue.length > 0) {
      const node = queue.shift()!
      count++
      for (const child of node.children.values()) {
        queue.push(child)
      }
    }
    return count
  }
}

function printTrieFromRoot(trie: Trie): string {
  const lines: string[] = []
  printNode(trie.root, '', true, lines, '')
  return lines.join('\n')
}

function printNode(node: TrieNode, prefix: string, isLast: boolean, lines: string[], charLabel: string): void {
  if (charLabel === '') {
    lines.push(prefix + '[root]')
    const children = Array.from(node.children.entries())
    children.forEach(([char, child], i) => {
      printNode(child, prefix, i === children.length - 1, lines, char)
    })
  } else {
    const connector = isLast ? '└── ' : '├── '
    const endMark = node.isEnd ? ' (单词结尾)' : ''
    lines.push(prefix + connector + charLabel + endMark)
    const newPrefix = prefix + (isLast ? '    ' : '│   ')
    const children = Array.from(node.children.entries())
    children.forEach(([char, child], i) => {
      printNode(child, newPrefix, i === children.length - 1, lines, char)
    })
  }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('        字典树 (Trie) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 构建字典树
  lines.push('【第一步】构建字典树')
  const words = ['apple', 'app', 'application', 'bat', 'ball', 'band']
  lines.push(`依次插入单词: ${words.join(', ')}`)
  lines.push('')

  const trie = new Trie()
  for (const word of words) {
    trie.insert(word)
  }

  lines.push('字典树结构:')
  lines.push(printTrieFromRoot(trie))
  lines.push('')

  // 2. 基本信息
  lines.push('【第二步】基本信息')
  lines.push(`  存储的单词数: ${trie.getAllWords().length}`)
  lines.push(`  节点总数: ${trie.getNodeCount()}`)
  lines.push(`  所有单词: [${trie.getAllWords().join(', ')}]`)
  lines.push('')

  // 3. 搜索演示
  lines.push('【第三步】搜索演示')
  lines.push('')
  const searchWords = ['app', 'apple', 'ap', 'bat', 'ball', 'cat']
  for (const word of searchWords) {
    const found = trie.search(word)
    lines.push(`  search("${word}"): ${found ? '✓ 找到' : '✗ 未找到'}`)
  }
  lines.push('')

  // 4. 前缀匹配演示
  lines.push('【第四步】前缀匹配演示')
  lines.push('')
  const prefixes = ['app', 'ba', 'ban', 'c', '']
  for (const prefix of prefixes) {
    const hasPrefix = trie.startsWith(prefix)
    const matching = trie.getWordsWithPrefix(prefix)
    lines.push(`  startsWith("${prefix}"): ${hasPrefix ? '✓ 存在' : '✗ 不存在'}`)
    if (matching.length > 0) {
      lines.push(`    匹配的单词: [${matching.join(', ')}]`)
    }
  }
  lines.push('')

  // 5. 插入新单词演示
  lines.push('【第五步】插入新单词 "bandana"')
  lines.push('')
  trie.insert('bandana')
  lines.push('  更新后的字典树:')
  lines.push(printTrieFromRoot(trie))
  lines.push(`  所有单词: [${trie.getAllWords().join(', ')}]`)
  lines.push('')

  // 6. 共享前缀的优势
  lines.push('【第六步】共享前缀的优势')
  lines.push('')
  lines.push('  "app", "apple", "application" 共享前缀 "app"')
  lines.push('  这三个单词只在字典树中存储了 "app" 一次路径')
  lines.push(`  节点总数: ${trie.getNodeCount()}（远少于 ${words.reduce((s, w) => s + w.length, 0)} 个字符总数）`)
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}
