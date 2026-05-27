// AC自动机 (Aho-Corasick) 演示

class ACNode {
  children: Map<string, ACNode>
  fail: ACNode | null
  output: string[]
  depth: number

  constructor(depth: number = 0) {
    this.children = new Map()
    this.fail = null
    this.output = []
    this.depth = depth
  }
}

class AhoCorasick {
  root: ACNode

  constructor() {
    this.root = new ACNode(0)
  }

  // 第一步：插入模式串到 Trie
  insert(pattern: string): void {
    let node = this.root
    for (const char of pattern) {
      if (!node.children.has(char)) {
        node.children.set(char, new ACNode(node.depth + 1))
      }
      node = node.children.get(char)!
    }
    node.output.push(pattern)
  }

  // 第二步：BFS 构建失败指针
  buildFailureLinks(): void {
    const queue: ACNode[] = []

    // 根节点的子节点的失败指针指向根
    for (const child of this.root.children.values()) {
      child.fail = this.root
      queue.push(child)
    }

    // BFS 逐层计算失败指针
    while (queue.length > 0) {
      const current = queue.shift()!

      for (const [char, child] of current.children) {
        let failNode = current.fail

        // 沿失败指针链查找有相同字符子节点的节点
        while (failNode !== null && !failNode.children.has(char)) {
          failNode = failNode.fail
        }

        // 设置失败指针
        child.fail = failNode?.children.get(char) ?? this.root
        if (child.fail === child) {
          child.fail = this.root
        }

        // 传播输出链接：继承失败指针节点的输出
        child.output = [...child.output, ...child.fail.output]

        queue.push(child)
      }
    }
  }

  // 第三步：匹配文本
  match(text: string): { pattern: string; index: number }[] {
    const results: { pattern: string; index: number }[] = []
    let current = this.root

    for (let i = 0; i < text.length; i++) {
      const char = text[i]

      // 沿失败指针链查找有当前字符子节点的节点
      while (current !== this.root && !current.children.has(char)) {
        current = current.fail!
      }

      // 如果有匹配的子节点，前进
      if (current.children.has(char)) {
        current = current.children.get(char)!
      }

      // 检查当前节点及输出链接的所有匹配
      for (const pattern of current.output) {
        results.push({ pattern, index: i - pattern.length + 1 })
      }
    }

    return results
  }
}

function printTrie(node: ACNode, prefix: string, isLast: boolean, lines: string[], charLabel: string): void {
  if (charLabel === '') {
    lines.push(prefix + '[root]')
    const children = Array.from(node.children.entries())
    children.forEach(([char, child], i) => {
      printTrie(child, prefix, i === children.length - 1, lines, char)
    })
  } else {
    const connector = isLast ? '└── ' : '├── '
    const endMark = node.output.length > 0 ? ` [匹配: ${node.output.join(', ')}]` : ''
    lines.push(prefix + connector + charLabel + endMark)
    const newPrefix = prefix + (isLast ? '    ' : '│   ')
    const children = Array.from(node.children.entries())
    children.forEach(([char, child], i) => {
      printTrie(child, newPrefix, i === children.length - 1, lines, char)
    })
  }
}

export default function demo(): string {
  const lines: string[] = []

  lines.push('═══════════════════════════════════════')
  lines.push('    AC自动机 (Aho-Corasick) 演示')
  lines.push('═══════════════════════════════════════')
  lines.push('')

  // 1. 构建自动机
  lines.push('【第一步】构建 Trie 并插入模式串')
  const patterns = ['he', 'she', 'his', 'hers']
  lines.push(`模式串集合: {${patterns.map(p => `"${p}"`).join(', ')}}`)
  lines.push('')

  const ac = new AhoCorasick()
  for (const pattern of patterns) {
    ac.insert(pattern)
    lines.push(`  插入 "${pattern}"`)
  }
  lines.push('')

  // 2. 构建失败指针
  lines.push('【第二步】BFS 构建失败指针')
  ac.buildFailureLinks()
  lines.push('  失败指针已构建完成')
  lines.push('')

  // 3. Trie 结构
  lines.push('【第三步】Trie 结构')
  const trieLines: string[] = []
  printTrie(ac.root, '', true, trieLines, '')
  lines.push(trieLines.join('\n'))
  lines.push('')

  // 4. 匹配演示
  lines.push('【第四步】文本匹配')
  lines.push('')
  const texts = ['ushers', 'ahishers', 'hehe', 'sheshe']
  for (const text of texts) {
    lines.push(`  文本: "${text}"`)
    const results = ac.match(text)
    if (results.length === 0) {
      lines.push(`    未找到任何匹配`)
    } else {
      for (const r of results) {
        lines.push(`    在位置 ${r.index} 找到 "${r.pattern}"`)
      }
    }
    lines.push('')
  }

  // 5. 复杂示例
  lines.push('【第五步】敏感词过滤示例')
  lines.push('')
  const sensitiveWords = ['暴力', '色情', '赌博', '诈骗']
  const acFilter = new AhoCorasick()
  for (const word of sensitiveWords) acFilter.insert(word)
  acFilter.buildFailureLinks()

  const comment = '这条评论包含暴力和诈骗内容'
  lines.push(`  敏感词: {${sensitiveWords.map(w => `"${w}"`).join(', ')}}`)
  lines.push(`  原文: "${comment}"`)

  const filterResults = acFilter.match(comment)
  let filtered = comment
  for (const r of filterResults) {
    const stars = '*'.repeat(r.pattern.length)
    filtered = filtered.substring(0, r.index) + stars + filtered.substring(r.index + r.pattern.length)
  }
  lines.push(`  过滤后: "${filtered}"`)
  lines.push(`  发现 ${filterResults.length} 个敏感词`)
  lines.push('')

  // 6. 复杂度分析
  lines.push('【第六步】复杂度分析')
  lines.push('')
  lines.push(`  模式串总长度 m = ${patterns.reduce((s, p) => s + p.length, 0)}`)
  lines.push(`  Trie 节点数 = ${countNodes(ac.root)}`)
  lines.push('  建 Trie:    O(m)')
  lines.push('  建失败指针: O(m)')
  lines.push('  匹配文本:   O(n + z)，n=文本长度, z=匹配次数')
  lines.push('  总复杂度:   O(n + m + z)')
  lines.push('')

  lines.push('═══════════════════════════════════════')
  lines.push('  演示完成！')
  lines.push('═══════════════════════════════════════')

  return lines.join('\n')
}

function countNodes(node: ACNode): number {
  let count = 1
  for (const child of node.children.values()) {
    count += countNodes(child)
  }
  return count
}
