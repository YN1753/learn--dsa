interface KDNode {
  point: number[]
  left: KDNode | null
  right: KDNode | null
  axis: number
}

function buildKDTree(points: number[][], depth: number = 0): KDNode | null {
  if (points.length === 0) return null

  const k = points[0].length
  const axis = depth % k

  points.sort((a, b) => a[axis] - b[axis])
  const mid = Math.floor(points.length / 2)

  return {
    point: points[mid],
    axis,
    left: buildKDTree(points.slice(0, mid), depth + 1),
    right: buildKDTree(points.slice(mid + 1), depth + 1),
  }
}

function distance(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2
  }
  return Math.sqrt(sum)
}

function nearestNeighbor(root: KDNode | null, target: number[], depth: number = 0, best: KDNode | null = null): KDNode | null {
  if (root === null) return best

  const k = target.length
  const axis = depth % k

  if (best === null || distance(target, root.point) < distance(target, best.point)) {
    best = root
  }

  const diff = target[axis] - root.point[axis]
  const closeSide = diff < 0 ? root.left : root.right
  const farSide = diff < 0 ? root.right : root.left

  best = nearestNeighbor(closeSide, target, depth + 1, best)

  if (best !== null && Math.abs(diff) < distance(target, best.point)) {
    best = nearestNeighbor(farSide, target, depth + 1, best)
  }

  return best
}

function rangeSearch(root: KDNode | null, target: number[], radius: number, depth: number = 0): number[][] {
  if (root === null) return []

  const k = target.length
  const axis = depth % k
  const result: number[][] = []

  if (distance(target, root.point) <= radius) {
    result.push(root.point)
  }

  const diff = target[axis] - root.point[axis]

  if (diff - radius <= 0) {
    result.push(...rangeSearch(root.left, target, radius, depth + 1))
  }
  if (diff + radius >= 0) {
    result.push(...rangeSearch(root.right, target, radius, depth + 1))
  }

  return result
}

function printTree(node: KDNode | null, prefix: string = '', isLeft: boolean = true): string[] {
  if (node === null) return []
  const lines: string[] = []
  const pointStr = `(${node.point.join(',')}) [dim=${node.axis}]`
  lines.push(`${prefix}${isLeft ? '├── ' : '└── '}${pointStr}`)
  if (node.left) lines.push(...printTree(node.left, prefix + (isLeft ? '│   ' : '    '), true))
  if (node.right) lines.push(...printTree(node.right, prefix + (isLeft ? '│   ' : '    '), false))
  return lines
}

export default function kdTreeDemo(): string {
  const output: string[] = []

  output.push('=== K-D树演示 ===\n')

  // 构建K-D树
  const points: number[][] = [
    [2, 3], [5, 4], [9, 6], [4, 7], [8, 1], [7, 2]
  ]
  output.push('1. 构建K-D树')
  output.push(`   数据点: ${points.map(p => `(${p.join(',')})`).join(', ')}`)
  const tree = buildKDTree(points)
  output.push('   树结构:')
  if (tree) {
    const treeLines = printTree(tree)
    for (const line of treeLines) {
      output.push(`   ${line}`)
    }
  }
  output.push('')

  // 最近邻搜索
  output.push('2. 最近邻搜索')
  const queryPoint = [6, 3]
  output.push(`   查询点: (${queryPoint.join(',')})`)
  const nearest = nearestNeighbor(tree, queryPoint)
  if (nearest) {
    output.push(`   最近点: (${nearest.point.join(',')})`)
    output.push(`   距离: ${distance(queryPoint, nearest.point).toFixed(2)}`)
  }
  output.push('')

  // 范围搜索
  output.push('3. 范围搜索')
  const center = [5, 4]
  const radius = 3.5
  output.push(`   中心: (${center.join(',')}), 半径: ${radius}`)
  const inRange = rangeSearch(tree, center, radius)
  output.push(`   范围内的点: ${inRange.map(p => `(${p.join(',')})`).join(', ')}`)
  output.push(`   共找到 ${inRange.length} 个点`)
  output.push('')

  // 另一个最近邻查询
  output.push('4. 另一个最近邻查询')
  const query2 = [1, 1]
  output.push(`   查询点: (${query2.join(',')})`)
  const nearest2 = nearestNeighbor(tree, query2)
  if (nearest2) {
    output.push(`   最近点: (${nearest2.point.join(',')})`)
    output.push(`   距离: ${distance(query2, nearest2.point).toFixed(2)}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
