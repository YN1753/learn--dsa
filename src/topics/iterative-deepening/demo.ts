interface TreeNode {
  name: string
  children: TreeNode[]
}

function createTree(): TreeNode {
  return {
    name: 'A',
    children: [
      {
        name: 'B',
        children: [
          { name: 'D', children: [
            { name: 'H', children: [] },
            { name: 'I', children: [] },
          ]},
          { name: 'E', children: [
            { name: 'J', children: [] },
          ]},
        ],
      },
      {
        name: 'C',
        children: [
          { name: 'F', children: [
            { name: 'K', children: [] },
            { name: 'L', children: [] },
          ]},
          { name: 'G', children: [
            { name: 'M', children: [] },
          ]},
        ],
      },
    ],
  }
}

function depthLimitedSearch(
  node: TreeNode,
  target: string,
  limit: number,
  path: string[],
  visited: string[]
): { found: boolean; path: string[]; visited: string[] } {
  visited.push(node.name)
  path.push(node.name)

  if (node.name === target) {
    return { found: true, path: [...path], visited: [...visited] }
  }

  if (limit <= 0) {
    path.pop()
    return { found: false, path: [], visited: [...visited] }
  }

  for (const child of node.children) {
    const result = depthLimitedSearch(child, target, limit - 1, path, visited)
    if (result.found) return result
  }

  path.pop()
  return { found: false, path: [], visited: [...visited] }
}

export default function iterativeDeepeningDemo(): string {
  const output: string[] = []

  output.push('=== 迭代加深搜索演示 ===')
  output.push('')
  output.push('搜索树结构:')
  output.push('        A')
  output.push('       / \\')
  output.push('      B   C')
  output.push('     / \\ / \\')
  output.push('    D  E F  G')
  output.push('   /|  | /\\ |')
  output.push('  H I  J K L M')
  output.push('')

  const tree = createTree()
  const target = 'K'

  output.push(`目标节点: ${target}`)
  output.push('')

  for (let depth = 0; depth <= 5; depth++) {
    output.push(`--- 第 ${depth + 1} 次迭代 (深度限制 = ${depth}) ---`)

    const path: string[] = []
    const visited: string[] = []
    const result = depthLimitedSearch(tree, target, depth, path, visited)

    output.push(`  访问节点: [${visited.join(', ')}]`)

    if (result.found) {
      output.push(`  找到目标! 路径: ${result.path.join(' -> ')}`)
      output.push('')
      break
    } else {
      output.push(`  未找到目标，增加深度限制`)
    }
    output.push('')
  }

  // 对比BFS的空间使用
  output.push('--- 空间复杂度对比 ---')
  output.push('BFS 空间: O(b^d) = O(2^3) = 8 个节点同时在队列中')
  output.push('IDDFS 空间: O(b*d) = O(2*3) = 6 最大栈深度')
  output.push('')

  // 演示IDA*的概念
  output.push('--- IDA* 算法说明 ---')
  output.push('IDA* 使用 f(n) = g(n) + h(n) 代替深度作为截断阈值')
  output.push('  g(n): 从起点到当前节点的实际代价')
  output.push('  h(n): 从当前节点到目标的启发式估计')
  output.push('每次迭代: 阈值 = 上次迭代中最小的超出阈值的 f 值')
  output.push('优势: 结合启发式信息，减少无效搜索')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
