interface TreeNode {
  id: number
  children: number[]
}

function buildTree(): { nodes: TreeNode[], root: number } {
  const nodes: TreeNode[] = []
  for (let i = 0; i <= 6; i++) {
    nodes.push({ id: i, children: [] })
  }
  //       1
  //      / \
  //     2   3
  //    / \   \
  //   4   5   6
  nodes[1].children = [2, 3]
  nodes[2].children = [4, 5]
  nodes[3].children = [6]
  return { nodes, root: 1 }
}

function generateFullEulerTour(
  nodes: TreeNode[],
  u: number,
  parent: number,
  tour: number[],
  depth: number[],
  currentDepth: number
): void {
  tour.push(u)
  depth.push(currentDepth)
  for (const v of nodes[u].children) {
    if (v !== parent) {
      generateFullEulerTour(nodes, v, u, tour, depth, currentDepth + 1)
      tour.push(u)
      depth.push(currentDepth)
    }
  }
}

function generateInOutOrder(
  nodes: TreeNode[],
  u: number,
  parent: number,
  sequence: number[],
  inTime: number[],
  outTime: number[],
  timer: { value: number }
): void {
  inTime[u] = timer.value
  sequence.push(u)
  timer.value++
  for (const v of nodes[u].children) {
    if (v !== parent) {
      generateInOutOrder(nodes, v, u, sequence, inTime, outTime, timer)
    }
  }
  outTime[u] = timer.value
  sequence.push(-u)  // 用负数表示「出」
  timer.value++
}

export default function eulerTourDemo(): string {
  const output: string[] = []

  output.push('=== 欧拉序演示 ===\n')

  const { nodes, root } = buildTree()

  output.push('树结构:')
  output.push('       1')
  output.push('      / \\')
  output.push('     2   3')
  output.push('    / \\   \\')
  output.push('   4   5   6')
  output.push('')

  // 完全欧拉序
  output.push('--- 完全欧拉序 (Euler Tour Sequence) ---')
  const fullTour: number[] = []
  const fullDepth: number[] = []
  generateFullEulerTour(nodes, root, -1, fullTour, fullDepth, 0)

  output.push(`序列: [${fullTour.join(', ')}]`)
  output.push(`深度: [${fullDepth.join(', ')}]`)
  output.push(`长度: ${fullTour.length} (2n-1 = ${2 * 7 - 1})`)
  output.push('')

  // 显示每个节点首次出现位置
  output.push('节点首次出现位置 (first[]):')
  const first: number[] = new Array(7).fill(-1)
  for (let i = 0; i < fullTour.length; i++) {
    if (first[fullTour[i]] === -1) {
      first[fullTour[i]] = i
    }
  }
  for (let i = 1; i <= 6; i++) {
    output.push(`  first[${i}] = ${first[i]}`)
  }
  output.push('')

  // LCA示例
  output.push('LCA查询示例 (使用完全欧拉序):')
  const lcaPairs = [[4, 5], [4, 6], [2, 3], [5, 6]]
  for (const [u, v] of lcaPairs) {
    let l = first[u]
    let r = first[v]
    if (l > r) [l, r] = [r, l]

    // 在 fullTour[l..r] 中找深度最小的节点
    let minDepth = Infinity
    let lcaNode = -1
    for (let i = l; i <= r; i++) {
      if (fullDepth[i] < minDepth) {
        minDepth = fullDepth[i]
        lcaNode = fullTour[i]
      }
    }
    output.push(`  LCA(${u}, ${v}) = ${lcaNode}  (区间 [${l}, ${r}] 中深度最小)`)
  }
  output.push('')

  // 入出序
  output.push('--- 入出序 (Entry-Exit Order) ---')
  const inOutSeq: number[] = []
  const inTime: number[] = new Array(7).fill(-1)
  const outTime: number[] = new Array(7).fill(-1)
  const timer = { value: 0 }
  generateInOutOrder(nodes, root, -1, inOutSeq, inTime, outTime, timer)

  output.push(`序列: [${inOutSeq.map(x => x < 0 ? `出${-x}` : `入${x}`).join(', ')}]`)
  output.push(`长度: ${inOutSeq.length} (2n = ${2 * 7})`)
  output.push('')

  output.push('每个节点的 in/out 时间戳:')
  for (let i = 1; i <= 6; i++) {
    output.push(`  节点 ${i}: in=${inTime[i]}, out=${outTime[i]}  子树区间=[${inTime[i]}, ${outTime[i]}]`)
  }
  output.push('')

  // 子树操作示例
  output.push('子树操作示例:')
  output.push('  节点2的子树包含: 节点4, 节点5 (区间内所有节点)')
  output.push(`  节点2的子树区间: [${inTime[2]}, ${outTime[2]}]`)
  output.push(`  节点4在区间内? in[4]=${inTime[4]}, ${inTime[2]}<=${inTime[4]} && ${outTime[4]}<=${outTime[2]} => ${inTime[2] <= inTime[4] && outTime[4] <= outTime[2]}`)
  output.push(`  节点3在区间内? in[3]=${inTime[3]}, ${inTime[2]}<=${inTime[3]} && ${outTime[3]}<=${outTime[2]} => ${inTime[2] <= inTime[3] && outTime[3] <= outTime[2]}`)
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
