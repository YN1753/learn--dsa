interface HuffmanNode {
  char: string | null
  freq: number
  left: HuffmanNode | null
  right: HuffmanNode | null
}

function buildFrequencyTable(text: string): Map<string, number> {
  const freq = new Map<string, number>()
  for (const ch of text) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1)
  }
  return freq
}

function buildHuffmanTree(freq: Map<string, number>): HuffmanNode | null {
  const nodes: HuffmanNode[] = []
  for (const [ch, f] of freq) {
    nodes.push({ char: ch, freq: f, left: null, right: null })
  }

  if (nodes.length === 0) return null
  if (nodes.length === 1) {
    const only = nodes[0]
    return { char: null, freq: only.freq, left: only, right: null }
  }

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq)
    const left = nodes.shift()!
    const right = nodes.shift()!
    const parent: HuffmanNode = {
      char: null,
      freq: left.freq + right.freq,
      left,
      right,
    }
    nodes.push(parent)
  }

  return nodes[0]
}

function buildCodeTable(root: HuffmanNode | null): Map<string, string> {
  const table = new Map<string, string>()
  if (!root) return table

  function dfs(node: HuffmanNode, code: string) {
    if (node.char !== null) {
      table.set(node.char, code || '0')
      return
    }
    if (node.left) dfs(node.left, code + '0')
    if (node.right) dfs(node.right, code + '1')
  }

  dfs(root, '')
  return table
}

function encode(text: string, codeTable: Map<string, string>): string {
  let result = ''
  for (const ch of text) {
    result += codeTable.get(ch) ?? ''
  }
  return result
}

function printTree(node: HuffmanNode | null, prefix: string, isLeft: boolean, output: string[]): void {
  if (!node) return
  const connector = isLeft ? '├── ' : '└── '
  const label = node.char !== null
    ? `'${node.char}'(${node.freq})`
    : `(${node.freq})`
  output.push(prefix + connector + label)
  const newPrefix = prefix + (isLeft ? '│   ' : '    ')
  printTree(node.left, newPrefix, true, output)
  printTree(node.right, newPrefix, false, output)
}

export default function huffmanCodingDemo(): string {
  const output: string[] = []

  output.push('=== 哈夫曼编码演示 ===\n')

  const text = 'aababcabcd'
  output.push(`原始文本: "${text}"`)
  output.push(`文本长度: ${text.length} 个字符\n`)

  // 1. 统计频率
  output.push('1. 字符频率统计:')
  const freq = buildFrequencyTable(text)
  const freqEntries = [...freq.entries()].sort((a, b) => b[1] - a[1])
  for (const [ch, f] of freqEntries) {
    output.push(`   '${ch}' : ${f}`)
  }
  output.push('')

  // 2. 构建哈夫曼树
  output.push('2. 构建哈夫曼树:')
  const root = buildHuffmanTree(freq)
  if (root) {
    const treeLines: string[] = []
    printTree(root, '', false, treeLines)
    output.push(...treeLines)
  }
  output.push('')

  // 3. 生成编码表
  output.push('3. 编码表:')
  const codeTable = buildCodeTable(root)
  const codeEntries = [...codeTable.entries()].sort((a, b) => a[1].length - b[1].length)
  for (const [ch, code] of codeEntries) {
    output.push(`   '${ch}' -> ${code}`)
  }
  output.push('')

  // 4. 编码结果
  output.push('4. 编码结果:')
  const encoded = encode(text, codeTable)
  output.push(`   编码: ${encoded}`)
  output.push(`   编码长度: ${encoded.length} 位`)
  output.push('')

  // 5. 压缩率计算
  const originalBits = text.length * 8
  const compressedBits = encoded.length
  const ratio = ((1 - compressedBits / originalBits) * 100).toFixed(1)
  output.push('5. 压缩统计:')
  output.push(`   原始大小 (ASCII): ${originalBits} 位`)
  output.push(`   压缩后大小: ${compressedBits} 位`)
  output.push(`   压缩率: ${ratio}%\n`)

  // 6. Shannon 熵计算
  output.push('6. 信息熵 (Shannon 熵):')
  let entropy = 0
  const total = text.length
  for (const [, f] of freq) {
    const p = f / total
    if (p > 0) entropy -= p * Math.log2(p)
  }
  output.push(`   H = ${entropy.toFixed(4)} bits/字符`)
  const avgLen = compressedBits / total
  output.push(`   平均码长: ${avgLen.toFixed(4)} bits/字符`)
  output.push(`   理论最优下限: ${entropy.toFixed(4)} bits/字符`)
  output.push(`   效率: ${((entropy / avgLen) * 100).toFixed(1)}%\n`)

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
