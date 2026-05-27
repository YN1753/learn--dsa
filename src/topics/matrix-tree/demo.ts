function determinant(matrix: number[][]): number {
  const n = matrix.length
  if (n === 1) return matrix[0][0]
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]

  let det = 0
  for (let col = 0; col < n; col++) {
    const subMatrix: number[][] = []
    for (let i = 1; i < n; i++) {
      const row: number[] = []
      for (let j = 0; j < n; j++) {
        if (j !== col) row.push(matrix[i][j])
      }
      subMatrix.push(row)
    }
    det += (col % 2 === 0 ? 1 : -1) * matrix[0][col] * determinant(subMatrix)
  }
  return det
}

function buildKirchhoffMatrix(adjMatrix: number[][]): number[][] {
  const n = adjMatrix.length
  const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0))

  for (let i = 0; i < n; i++) {
    let degree = 0
    for (let j = 0; j < n; j++) {
      if (i !== j && adjMatrix[i][j] > 0) {
        L[i][j] = -adjMatrix[i][j]
        degree += adjMatrix[i][j]
      }
    }
    L[i][i] = degree
  }

  return L
}

function getCofactor(matrix: number[][], row: number, col: number): number[][] {
  return matrix
    .filter((_, i) => i !== row)
    .map(r => r.filter((_, j) => j !== col))
}

function formatMatrix(matrix: number[][]): string {
  return matrix.map(row => '  [' + row.map(v => String(v).padStart(3)).join(', ') + ']').join('\n')
}

export default function matrixTreeDemo(): string {
  const output: string[] = []

  output.push('=== Matrix-Tree 定理演示 ===\n')

  // 示例图: 4个节点的无向图
  // 0 -- 1
  // |    |
  // 2 -- 3
  const adjMatrix = [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ]

  output.push('1. 构建邻接矩阵 A (4节点无向图: 0-1, 0-2, 1-3, 2-3):')
  output.push(formatMatrix(adjMatrix))
  output.push('')

  // 度数矩阵
  const degreeMatrix = [
    [2, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 2, 0],
    [0, 0, 0, 2],
  ]
  output.push('2. 度数矩阵 D (每个节点的度数在对角线上):')
  output.push(formatMatrix(degreeMatrix))
  output.push('')

  // Kirchhoff矩阵
  const L = buildKirchhoffMatrix(adjMatrix)
  output.push('3. Kirchhoff矩阵 L = D - A (拉普拉斯矩阵):')
  output.push(formatMatrix(L))
  output.push('')

  output.push('4. Kirchhoff矩阵的结构:')
  output.push('   - 对角线 L[i][i] = 节点i的度数')
  output.push('   - 非对角线 L[i][j] = -A[i][j] (如果i和j之间有边则为-1)')
  output.push('')

  // 删除第0行第0列，计算代数余子式
  const cofactor = getCofactor(L, 0, 0)
  output.push('5. 删除第0行第0列，得到余子式矩阵:')
  output.push(formatMatrix(cofactor))
  output.push('')

  const det = determinant(cofactor)
  output.push('6. 计算该余子式的行列式:')
  output.push(`   det = ${det}`)
  output.push('')

  output.push('7. 结论: 该图的生成树数量 = det(L余子式) = ' + det)
  output.push('')

  // 验证: 列举所有生成树
  output.push('8. 验证 - 枚举所有生成树:')
  output.push('   生成树1: 0-1, 1-3, 3-2 (边: 01, 13, 23)')
  output.push('   生成树2: 0-1, 1-3, 0-2 (边: 01, 13, 02)')
  output.push('   生成树3: 0-2, 2-3, 3-1 (边: 02, 23, 13)')
  output.push('   生成树4: 0-2, 2-3, 0-1 (边: 02, 23, 01)')
  output.push('   共 4 种，与定理结果一致!\n')

  // 带权版本
  output.push('=== 带权版本演示 ===\n')
  const weightedAdj = [
    [0, 3, 5, 0],
    [3, 0, 0, 2],
    [5, 0, 0, 4],
    [0, 2, 4, 0],
  ]
  output.push('9. 带权邻接矩阵 (边权重):')
  output.push(formatMatrix(weightedAdj))
  output.push('')

  const weightedL = buildKirchhoffMatrix(weightedAdj)
  output.push('10. 带权Kirchhoff矩阵 L_w = D_w - A_w:')
  output.push(formatMatrix(weightedL))
  output.push('')

  const weightedCofactor = getCofactor(weightedL, 0, 0)
  const weightedDet = determinant(weightedCofactor)
  output.push('11. 删除第0行第0列，计算行列式:')
  output.push(`    det(L_w余子式) = ${weightedDet}`)
  output.push('')

  output.push('12. 带权版本的结果表示所有生成树权重乘积之和:')
  output.push(`    所有生成树边权乘积之和 = ${weightedDet}`)
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
