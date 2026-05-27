const INF = Infinity

interface FloydStep {
  k: number
  i: number
  j: number
  dist: number[][]
  updated: boolean
  oldValue: number
  newValue: number
  description: string
}

export default function floydWarshallDemo(): string {
  const result: string[] = []

  // 创建一个 5 个顶点的有向加权图
  // 顶点: 0=A, 1=B, 2=C, 3=D, 4=E
  const n = 5
  const nodeNames = ['A', 'B', 'C', 'D', 'E']

  // 邻接矩阵（初始距离矩阵）
  const dist: number[][] = [
  //    A    B    C    D    E
    [  0,   3,   8, INF,  -4],  // A
    [INF,   0, INF,   1,   7],  // B
    [INF,   4,   0, INF, INF],  // C
    [  2, INF, INF,   0, INF],  // D
    [INF, INF, INF,   6,   0],  // E
  ]

  // 前驱矩阵（用于路径重建）
  const next: number[][] = []
  for (let i = 0; i < n; i++) {
    next[i] = []
    for (let j = 0; j < n; j++) {
      if (i === j || dist[i][j] === INF) {
        next[i][j] = -1
      } else {
        next[i][j] = j
      }
    }
  }

  result.push("=== Floyd-Warshall 最短路径算法演示 ===\n")

  // 显示图结构
  result.push("图结构 (邻接矩阵):")
  result.push(formatMatrix(dist, nodeNames))
  result.push("")

  // 记录每一步
  const steps: FloydStep[] = []

  // Floyd 主算法
  for (let k = 0; k < n; k++) {
    result.push(`--- 阶段 ${k + 1}: 允许经过顶点 ${nodeNames[k]} 作为中间节点 ---\n`)

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j || i === k || j === k) continue
        if (dist[i][k] === INF || dist[k][j] === INF) continue

        const oldValue = dist[i][j]
        const newValue = dist[i][k] + dist[k][j]

        if (newValue < oldValue) {
          dist[i][j] = newValue
          next[i][j] = next[i][k]
          steps.push({
            k, i, j,
            dist: dist.map(row => [...row]),
            updated: true,
            oldValue,
            newValue,
            description: `dist[${nodeNames[i]}][${nodeNames[j]}] = min(${oldValue === INF ? '∞' : oldValue}, ${dist[i][k]}+${dist[k][j]}) = min(${oldValue === INF ? '∞' : oldValue}, ${newValue}) = ${newValue}`
          })
          result.push(`  更新: dist[${nodeNames[i]}][${nodeNames[j]}] = ${oldValue === INF ? '∞' : oldValue} → ${newValue} (经过 ${nodeNames[k]}, 路径: ${nodeNames[i]}→${nodeNames[k]}→${nodeNames[j]})`)
        }
      }
    }

    result.push(`\n  当前距离矩阵:`)
    result.push(formatMatrix(dist, nodeNames))
    result.push("")
  }

  // 检测负权环
  result.push("=== 负权环检测 ===\n")
  let hasNegativeCycle = false
  for (let i = 0; i < n; i++) {
    if (dist[i][i] < 0) {
      result.push(`  警告: dist[${nodeNames[i]}][${nodeNames[i]}] = ${dist[i][i]} < 0, 存在经过顶点 ${nodeNames[i]} 的负权环!`)
      hasNegativeCycle = true
    }
  }
  if (!hasNegativeCycle) {
    result.push("  不存在负权环\n")
  }
  result.push("")

  // 显示最终结果
  result.push("=== 最终距离矩阵 ===\n")
  result.push(formatMatrix(dist, nodeNames))
  result.push("")

  // 路径重建
  result.push("=== 所有顶点对的最短路径 ===\n")
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const distance = dist[i][j]
      if (distance === INF) {
        result.push(`  ${nodeNames[i]} → ${nodeNames[j]}: 不可达`)
      } else {
        const path = getPath(next, i, j, nodeNames)
        result.push(`  ${nodeNames[i]} → ${nodeNames[j]}: 距离 = ${distance}, 路径: ${path}`)
      }
    }
  }
  result.push("")

  // 统计信息
  result.push("=== 算法统计 ===\n")
  result.push(`  顶点数: ${n}`)
  result.push(`  总更新次数: ${steps.length}`)
  result.push(`  时间复杂度: O(${n}³) = O(${n * n * n})`)
  result.push(`  空间复杂度: O(${n}²) = O(${n * n})`)

  return result.join('\n')
}

function formatMatrix(matrix: number[][], names: string[]): string {
  const lines: string[] = []
  const n = matrix.length

  // 表头
  const header = '     ' + names.map(n => n.padStart(6)).join('')
  lines.push(header)

  // 分隔线
  lines.push('     ' + '------'.repeat(n))

  // 数据行
  for (let i = 0; i < n; i++) {
    const row = names[i] + ' | ' + matrix[i]
      .map(v => (v === INF ? '∞' : String(v)).padStart(6))
      .join('')
    lines.push(row)
  }

  return lines.join('\n')
}

function getPath(next: number[][], u: number, v: number, names: string[]): string {
  if (next[u][v] === -1) return '无路径'
  const path: string[] = [names[u]]
  let current = u
  while (current !== v) {
    current = next[current][v]
    if (current === -1) return '无路径'
    path.push(names[current])
  }
  return path.join(' → ')
}
