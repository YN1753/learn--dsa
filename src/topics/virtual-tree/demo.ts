interface TreeNode {
  id: number
  children: number[]
  depth: number
  dfn: number
}

interface VirtualTreeEdge {
  from: number
  to: number
  weight: number
}

// 原树结构
const tree: TreeNode[] = [
  { id: 0, children: [1, 2, 3], depth: 0, dfn: 0 },
  { id: 1, children: [4, 5], depth: 1, dfn: 1 },
  { id: 2, children: [6, 7], depth: 1, dfn: 4 },
  { id: 3, children: [8], depth: 1, dfn: 7 },
  { id: 4, children: [], depth: 2, dfn: 2 },
  { id: 5, children: [], depth: 2, dfn: 3 },
  { id: 6, children: [], depth: 2, dfn: 5 },
  { id: 7, children: [], depth: 2, dfn: 6 },
  { id: 8, children: [], depth: 2, dfn: 8 },
]

const parent: number[] = [0, 0, 0, 0, 1, 1, 2, 2, 3]

function getLCA(u: number, v: number): number {
  const visited = new Set<number>()
  let a = u
  let b = v
  while (true) {
    if (a !== 0) {
      if (visited.has(a)) return a
      visited.add(a)
      a = parent[a]
    }
    if (b !== 0) {
      if (visited.has(b)) return b
      visited.add(b)
      b = parent[b]
    }
    if (a === 0 && b === 0) return 0
  }
}

function getNodeName(id: number): string {
  return `节点${id}`
}

export default function virtualTreeDemo(): string {
  const output: string[] = []

  output.push('=== 虚树构建演示 ===\n')

  output.push('原树结构:')
  output.push('         0')
  output.push('       / | \\')
  output.push('      1  2  3')
  output.push('     /\\  /\\  |')
  output.push('    4 5 6 7  8')
  output.push('')

  output.push('DFS 序:')
  for (const node of tree) {
    output.push(`  ${getNodeName(node.id)}: DFS序 = ${node.dfn}, 深度 = ${node.depth}`)
  }
  output.push('')

  const keyNodes = [4, 6, 7, 8]
  output.push(`关键节点: [${keyNodes.map(getNodeName).join(', ')}]`)
  output.push('')

  // 按 DFS 序排序
  const sorted = [...keyNodes].sort((a, b) => tree[a].dfn - tree[b].dfn)
  output.push('1. 按 DFS 序排序:')
  output.push(`   [${sorted.map(getNodeName).join(', ')}]`)
  output.push('')

  // 栈构建法
  const stack: number[] = [sorted[0]]
  const vtEdges: VirtualTreeEdge[] = []
  const vtNodes = new Set<number>([sorted[0]])

  output.push('2. 栈构建法:')
  output.push(`   初始栈: [${stack.map(getNodeName).join(', ')}]`)
  output.push('')

  for (let i = 1; i < sorted.length; i++) {
    const node = sorted[i]
    const top = stack[stack.length - 1]
    const lca = getLCA(node, top)

    output.push(`   处理 ${getNodeName(node)}:`)
    output.push(`     LCA(${getNodeName(node)}, ${getNodeName(top)}) = ${getNodeName(lca)}`)

    if (lca === top) {
      stack.push(node)
      vtNodes.add(node)
      output.push(`     LCA 就是栈顶，直接压入`)
      output.push(`     栈: [${stack.map(getNodeName).join(', ')}]`)
    } else {
      // 弹出栈中 depth >= depth[lca] 的节点
      while (stack.length >= 2 && tree[stack[stack.length - 2]].depth >= tree[lca].depth) {
        const from = stack[stack.length - 2]
        const to = stack[stack.length - 1]
        const w = tree[to].depth - tree[from].depth
        vtEdges.push({ from, to, weight: w })
        output.push(`     连边: ${getNodeName(from)} -> ${getNodeName(to)} (权=${w})`)
        stack.pop()
      }

      if (stack[stack.length - 1] !== lca) {
        const to = stack[stack.length - 1]
        const w = tree[to].depth - tree[lca].depth
        vtEdges.push({ from: lca, to, weight: w })
        output.push(`     连边: ${getNodeName(lca)} -> ${getNodeName(to)} (权=${w})`)
        stack.pop()
        stack.push(lca)
        vtNodes.add(lca)
      }

      stack.push(node)
      vtNodes.add(node)
      output.push(`     栈: [${stack.map(getNodeName).join(', ')}]`)
    }
    output.push('')
  }

  // 处理栈中剩余节点
  output.push('   处理栈中剩余节点:')
  while (stack.length >= 2) {
    const from = stack[stack.length - 2]
    const to = stack[stack.length - 1]
    const w = tree[to].depth - tree[from].depth
    vtEdges.push({ from, to, weight: w })
    output.push(`     连边: ${getNodeName(from)} -> ${getNodeName(to)} (权=${w})`)
    stack.pop()
  }
  output.push('')

  // 输出结果
  output.push('3. 虚树构建结果:')
  output.push(`   虚树节点: [${[...vtNodes].sort((a, b) => a - b).map(getNodeName).join(', ')}]`)
  output.push(`   节点数: ${vtNodes.size} (关键节点 ${keyNodes.length} + LCA ${vtNodes.size - keyNodes.length})`)
  output.push(`   最大可能节点数: 2*${keyNodes.length} - 1 = ${2 * keyNodes.length - 1}`)
  output.push('')
  output.push('   虚树边:')
  for (const edge of vtEdges) {
    output.push(`     ${getNodeName(edge.from)} -> ${getNodeName(edge.to)} (权=${edge.weight})`)
  }
  output.push('')

  output.push('4. 虚树结构:')
  output.push('         0')
  output.push('       / | \\')
  output.push('      1  2  3')
  output.push('     |  /\\  |')
  output.push('    4 6  7  8')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
