interface TrieNode {
  children: [TrieNode | null, TrieNode | null]
  count: number
  id: number
}

let nodeIdCounter = 0

function createNode(): TrieNode {
  return { children: [null, null], count: 0, id: nodeIdCounter++ }
}

function insert(root: TrieNode, value: number, maxBit: number): TrieNode {
  const newRoot = createNode()
  let newCur = newRoot
  let oldCur = root

  for (let bit = maxBit; bit >= 0; bit--) {
    const b = (value >> bit) & 1
    const other = 1 - b

    // 共享另一个分支
    newCur.children[other] = oldCur.children[other]

    // 新建当前分支
    const newNode = createNode()
    newNode.count = (oldCur.children[b]?.count ?? 0) + 1
    newCur.children[b] = newNode

    newCur = newCur.children[b]!
    oldCur = oldCur.children[b] ?? createNode()
  }

  return newRoot
}

function queryMaxXor(lRoot: TrieNode, rRoot: TrieNode, x: number, maxBit: number): number {
  let nodeL = lRoot
  let nodeR = rRoot
  let result = 0

  for (let bit = maxBit; bit >= 0; bit--) {
    const b = (x >> bit) & 1
    const desired = 1 - b

    const countR = nodeR.children[desired]?.count ?? 0
    const countL = nodeL.children[desired]?.count ?? 0

    if (countR - countL > 0) {
      result |= (1 << bit)
      nodeL = nodeL.children[desired]!
      nodeR = nodeR.children[desired]!
    } else {
      nodeL = nodeL.children[b]!
      nodeR = nodeR.children[b]!
    }
  }

  return result
}

function countNodes(node: TrieNode | null): number {
  if (!node) return 0
  return 1 + countNodes(node.children[0]) + countNodes(node.children[1])
}

function toBinary(value: number, bits: number): string {
  let result = ''
  for (let i = bits; i >= 0; i--) {
    result += ((value >> i) & 1).toString()
  }
  return result
}

export default function persistentTrieDemo(): string {
  nodeIdCounter = 0
  const output: string[] = []

  output.push('=== 可持久化字典树演示 ===\n')

  const maxBit = 4  // 使用 5 位二进制，值域 [0, 31]
  const values = [5, 12, 7, 20, 15]

  // 初始化空树
  output.push(`1. 初始化空 Trie（二进制位数: ${maxBit + 1}，值域: [0, ${(1 << (maxBit + 1)) - 1}]）`)
  const emptyRoot = createNode()
  const roots: TrieNode[] = [emptyRoot]
  output.push(`   版本 0: 空树，节点数: ${countNodes(emptyRoot)}\n`)

  // 依次插入元素
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    const prevRoot = roots[roots.length - 1]
    const newRoot = insert(prevRoot, v, maxBit)
    roots.push(newRoot)

    const prevCount = countNodes(prevRoot)
    const newCount = countNodes(newRoot)
    output.push(`${i + 2}. 版本 ${i + 1}: 插入 ${v} (${toBinary(v, maxBit)})`)
    output.push(`   新建节点数: ${newCount - prevCount}`)
    output.push(`   总节点数: ${newCount}`)
    output.push(`   版本 Root ID: ${newRoot.id}\n`)
  }

  // 节点共享分析
  output.push('7. 节点共享分析:')
  let totalNodes = 0
  for (const root of roots) {
    totalNodes += countNodes(root)
  }
  const uniqueNodes = new Set<TrieNode>()
  function collectAll(node: TrieNode | null): void {
    if (!node) return
    if (uniqueNodes.has(node)) return
    uniqueNodes.add(node)
    collectAll(node.children[0])
    collectAll(node.children[1])
  }
  for (const root of roots) {
    collectAll(root)
  }
  output.push(`   各版本节点总数（含共享）: ${totalNodes}`)
  output.push(`   实际唯一节点数: ${uniqueNodes.size}`)
  output.push(`   节点共享节省: ${totalNodes - uniqueNodes.size} 个节点\n`)

  // 区间查询演示
  output.push('8. 区间异或最大值查询演示:')

  const queries = [
    { l: 1, r: 3, x: 10 },
    { l: 2, r: 5, x: 3 },
    { l: 1, r: 5, x: 17 },
  ]

  for (const q of queries) {
    const maxXor = queryMaxXor(roots[q.l - 1], roots[q.r], q.x, maxBit)

    // 验证：暴力枚举
    let bruteMax = 0
    let bruteIdx = q.l
    for (let i = q.l; i <= q.r; i++) {
      const xorVal = values[i - 1] ^ q.x
      if (xorVal > bruteMax) {
        bruteMax = xorVal
        bruteIdx = i
      }
    }

    output.push(`   查询 [${q.l}, ${q.r}] 与 ${q.x} 异或最大值:`)
    output.push(`     可持久化 Trie 结果: ${maxXor}`)
    output.push(`     暴力验证结果: ${bruteMax}`)
    output.push(`     匹配: ${maxXor === bruteMax ? '是' : '否'}`)
    output.push(`     最优选择: a[${bruteIdx}] = ${values[bruteIdx - 1]} (${toBinary(values[bruteIdx - 1], maxBit)})`)
    output.push(`     异或过程: ${toBinary(values[bruteIdx - 1], maxBit)} ^ ${toBinary(q.x, maxBit)} = ${toBinary(maxXor, maxBit)}`)
    output.push('')
  }

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
