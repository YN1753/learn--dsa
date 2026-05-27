function formatMatrix(mat: number[][]): string {
  return mat.map(row =>
    '[ ' + row.map(v => v.toFixed(2).padStart(8)).join(' ') + ' ]'
  ).join('\n')
}

export default function gaussianEliminationDemo(): string {
  const output: string[] = []

  output.push('=== 高斯消元演示 ===\n')

  // 例1：有唯一解的方程组
  output.push('1. 求解 3x3 线性方程组：')
  output.push('   2x + y - z = 8')
  output.push('   -3x - y + 2z = -11')
  output.push('   -2x + y + 2z = -3\n')

  const matrix = [
    [2, 1, -1, 8],
    [-3, -1, 2, -11],
    [-2, 1, 2, -3],
  ]

  output.push('增广矩阵:')
  output.push(formatMatrix(matrix))
  output.push('')

  // 第一步：选取主元，消去第一列
  output.push('--- 消元阶段 ---\n')
  output.push('2. 选取第一列主元（第1行，值为 2）')
  output.push('   消去第2行第1列：R2 = R2 - (-3/2) * R1')
  const f1 = -3 / 2
  for (let j = 0; j < 4; j++) matrix[1][j] -= f1 * matrix[0][j]
  output.push(formatMatrix(matrix))
  output.push('')

  output.push('3. 消去第3行第1列：R3 = R3 - (-1) * R1')
  const f2 = -2 / 2
  for (let j = 0; j < 4; j++) matrix[2][j] -= f2 * matrix[0][j]
  output.push(formatMatrix(matrix))
  output.push('')

  // 第二步：消去第二列
  output.push('4. 选取第二列主元（第2行，值为 0.50）')
  output.push('   消去第3行第2列：R3 = R3 - (2/0.5) * R2')
  const f3 = 2 / 0.5
  for (let j = 0; j < 4; j++) matrix[2][j] -= f3 * matrix[1][j]
  // 修正浮点误差
  matrix[2] = matrix[2].map(v => Math.abs(v) < 1e-10 ? 0 : v)
  output.push(formatMatrix(matrix))
  output.push('')

  // 回代
  output.push('--- 回代阶段 ---\n')
  output.push('5. 从最后一行开始回代:')

  const z = matrix[2][3] / matrix[2][2]
  output.push(`   z = ${matrix[2][3].toFixed(2)} / ${matrix[2][2].toFixed(2)} = ${z.toFixed(2)}`)

  const y = (matrix[1][3] - matrix[1][2] * z) / matrix[1][1]
  output.push(`   y = (${matrix[1][3].toFixed(2)} - ${matrix[1][2].toFixed(2)} × ${z.toFixed(2)}) / ${matrix[1][1].toFixed(2)} = ${y.toFixed(2)}`)

  const x = (matrix[0][3] - matrix[0][1] * y - matrix[0][2] * z) / matrix[0][0]
  output.push(`   x = (${matrix[0][3].toFixed(2)} - ${matrix[0][1].toFixed(2)} × ${y.toFixed(2)} - ${matrix[0][2].toFixed(2)} × ${z.toFixed(2)}) / ${matrix[0][0].toFixed(2)} = ${x.toFixed(2)}`)
  output.push('')

  output.push(`解：x = ${x.toFixed(2)}, y = ${y.toFixed(2)}, z = ${z.toFixed(2)}`)
  output.push('')

  // 例2：无解的情况
  output.push('--- 无解示例 ---\n')
  output.push('6. 以下方程组无解：')
  output.push('   x + y = 1')
  output.push('   x + y = 2\n')
  output.push('   增广矩阵:')
  output.push('   [ 1.00    1.00    1.00 ]')
  output.push('   [ 1.00    1.00    2.00 ]')
  output.push('')
  output.push('   消元后：R2 = R2 - R1')
  output.push('   [ 1.00    1.00    1.00 ]')
  output.push('   [ 0.00    0.00    1.00 ]')
  output.push('')
  output.push('   第2行对应方程 0 = 1，矛盾！方程组无解。')
  output.push('')

  // 例3：无穷多解
  output.push('--- 无穷多解示例 ---\n')
  output.push('7. 以下方程组有无穷多解：')
  output.push('   x + y = 1')
  output.push('   2x + 2y = 2\n')
  output.push('   消元后：R2 = R2 - 2*R1')
  output.push('   [ 1.00    1.00    1.00 ]')
  output.push('   [ 0.00    0.00    0.00 ]')
  output.push('')
  output.push('   第2行全为 0，y 是自由变量。')
  output.push('   通解：x = 1 - t, y = t（t 为任意实数）')
  output.push('')

  // 例4：异或方程组
  output.push('--- 异或方程组示例 ---\n')
  output.push('8. GF(2) 上的异或方程组：')
  output.push('   x1 XOR x2 = 1')
  output.push('   x2 XOR x3 = 1')
  output.push('   x1 XOR x3 = 0\n')
  output.push('   增广矩阵:')
  output.push('   [ 1  1  0 | 1 ]')
  output.push('   [ 0  1  1 | 1 ]')
  output.push('   [ 1  0  1 | 0 ]')
  output.push('')
  output.push('   R3 = R3 XOR R1:')
  output.push('   [ 1  1  0 | 1 ]')
  output.push('   [ 0  1  1 | 1 ]')
  output.push('   [ 0  1  1 | 1 ]')
  output.push('')
  output.push('   R3 = R3 XOR R2:')
  output.push('   [ 1  1  0 | 1 ]')
  output.push('   [ 0  1  1 | 1 ]')
  output.push('   [ 0  0  0 | 0 ]')
  output.push('')
  output.push('   x3 是自由变量。一组解：x1=0, x2=1, x3=0')
  output.push('   验证：0 XOR 1 = 1 ✓, 1 XOR 0 = 1 ✓, 0 XOR 0 = 0 ✓')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
