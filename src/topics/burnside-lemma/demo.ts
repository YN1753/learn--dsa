/**
 * Burnside 引理演示
 * 通过具体的项链染色问题展示 Burnside 引理的计算过程
 */

interface GroupElement {
  name: string
  /** 该群元素作用在位置上的置换（循环分解中的循环列表） */
  cycles: number[][]
}

function countFixedColorings(cycles: number[][], numColors: number): number {
  // 每个循环内的位置必须同色，所以不动点数 = numColors^(循环个数)
  return Math.pow(numColors, cycles.length)
}

export default function burnsideDemo(): string {
  const output: string[] = []

  output.push('=== Burnside 引理演示 ===\n')

  // 例1: 用2种颜色给正三角形的3个顶点着色，旋转对称 C3
  output.push('【例1】用 2 种颜色给正三角形的 3 个顶点着色')
  output.push('群 C_3（仅旋转）：\n')

  const colors1 = 2
  const c3: GroupElement[] = [
    { name: '恒等 (旋转 0 度)', cycles: [[0], [1], [2]] },
    { name: '旋转 120 度', cycles: [[0, 1, 2]] },
    { name: '旋转 240 度', cycles: [[0, 2, 1]] },
  ]

  let sum1 = 0
  for (const elem of c3) {
    const fixed = countFixedColorings(elem.cycles, colors1)
    sum1 += fixed
    output.push(`  ${elem.name}`)
    output.push(`    循环分解: ${elem.cycles.map(c => `(${c.join(' ')})`).join(' ')}`)
    output.push(`    循环个数: ${elem.cycles.length}`)
    output.push(`    不动点数: ${colors1}^${elem.cycles.length} = ${fixed}`)
    output.push('')
  }
  const result1 = sum1 / c3.length
  output.push(`  不等价着色数 = (${sum1}) / ${c3.length} = ${result1}\n`)

  // 例2: 用3种颜色给正方形的4个顶点着色，旋转对称 C4
  output.push('【例2】用 3 种颜色给正方形的 4 个顶点着色')
  output.push('群 C_4（仅旋转）：\n')

  const colors2 = 3
  const c4: GroupElement[] = [
    { name: '恒等 (旋转 0 度)', cycles: [[0], [1], [2], [3]] },
    { name: '旋转 90 度', cycles: [[0, 1, 2, 3]] },
    { name: '旋转 180 度', cycles: [[0, 2], [1, 3]] },
    { name: '旋转 270 度', cycles: [[0, 3, 2, 1]] },
  ]

  let sum2 = 0
  for (const elem of c4) {
    const fixed = countFixedColorings(elem.cycles, colors2)
    sum2 += fixed
    output.push(`  ${elem.name}`)
    output.push(`    循环分解: ${elem.cycles.map(c => `(${c.join(' ')})`).join(' ')}`)
    output.push(`    循环个数: ${elem.cycles.length}`)
    output.push(`    不动点数: ${colors2}^${elem.cycles.length} = ${fixed}`)
    output.push('')
  }
  const result2 = sum2 / c4.length
  output.push(`  不等价着色数 = (${sum2}) / ${c4.length} = ${result2}\n`)

  // 例3: 用2种颜色给正方形的4个顶点着色，旋转+翻转对称 D4
  output.push('【例3】用 2 种颜色给正方形的 4 个顶点着色')
  output.push('群 D_4（旋转 + 翻转）：\n')

  const colors3 = 2
  const d4: GroupElement[] = [
    { name: '恒等 (旋转 0 度)', cycles: [[0], [1], [2], [3]] },
    { name: '旋转 90 度', cycles: [[0, 1, 2, 3]] },
    { name: '旋转 180 度', cycles: [[0, 2], [1, 3]] },
    { name: '旋转 270 度', cycles: [[0, 3, 2, 1]] },
    { name: '翻转 (对称轴穿过顶点 0 和 2)', cycles: [[0], [2], [1, 3]] },
    { name: '翻转 (对称轴穿过顶点 1 和 3)', cycles: [[1], [3], [0, 2]] },
    { name: '翻转 (对称轴穿过边 01 和边 23 的中点)', cycles: [[0, 1], [2, 3]] },
    { name: '翻转 (对称轴穿过边 12 和边 30 的中点)', cycles: [[1, 2], [3, 0]] },
  ]

  let sum3 = 0
  for (const elem of d4) {
    const fixed = countFixedColorings(elem.cycles, colors3)
    sum3 += fixed
    output.push(`  ${elem.name}`)
    output.push(`    循环分解: ${elem.cycles.map(c => `(${c.join(' ')})`).join(' ')}`)
    output.push(`    循环个数: ${elem.cycles.length}`)
    output.push(`    不动点数: ${colors3}^${elem.cycles.length} = ${fixed}`)
    output.push('')
  }
  const result3 = sum3 / d4.length
  output.push(`  不等价着色数 = (${sum3}) / ${d4.length} = ${result3}\n`)

  // 例4: 骰子着色
  output.push('【例4】用 2 种颜色给正方体的 6 个面着色')
  output.push('考虑正方体的旋转对称群（24 个元素）：\n')

  const colors4 = 2
  const cubeRotations: GroupElement[] = [
    // 恒等
    { name: '恒等', cycles: [[0], [1], [2], [3], [4], [5]] },
    // 绕对面中心轴旋转 90/180/270 度 (3 个轴)
    { name: '绕上下轴旋转 90 度', cycles: [[0], [5], [1, 2, 3, 4]] },
    { name: '绕上下轴旋转 180 度', cycles: [[0], [5], [1, 3], [2, 4]] },
    { name: '绕上下轴旋转 270 度', cycles: [[0], [5], [1, 4, 3, 2]] },
    { name: '绕左右轴旋转 90 度', cycles: [[2], [4], [0, 1, 5, 3]] },
    { name: '绕左右轴旋转 180 度', cycles: [[2], [4], [0, 5], [1, 3]] },
    { name: '绕左右轴旋转 270 度', cycles: [[2], [4], [0, 3, 5, 1]] },
    { name: '绕前后轴旋转 90 度', cycles: [[1], [3], [0, 2, 5, 4]] },
    { name: '绕前后轴旋转 180 度', cycles: [[1], [3], [0, 5], [2, 4]] },
    { name: '绕前后轴旋转 270 度', cycles: [[1], [3], [0, 4, 5, 2]] },
    // 绕对边中点轴旋转 180 度 (6 个轴)
    { name: '对边轴旋转 180 度 (a)', cycles: [[0, 2], [1, 5], [3, 4]] },
    { name: '对边轴旋转 180 度 (b)', cycles: [[0, 4], [1, 5], [2, 3]] },
    { name: '对边轴旋转 180 度 (c)', cycles: [[0, 2], [3, 5], [1, 4]] },
    { name: '对边轴旋转 180 度 (d)', cycles: [[0, 4], [3, 5], [1, 2]] },
    { name: '对边轴旋转 180 度 (e)', cycles: [[1, 3], [0, 5], [2, 4]] },
    { name: '对边轴旋转 180 度 (f)', cycles: [[2, 4], [0, 5], [1, 3]] },
    // 绕对角轴旋转 120/240 度 (4 个轴)
    { name: '对角轴旋转 120 度 (a)', cycles: [[0, 1, 2], [3, 4, 5]] },
    { name: '对角轴旋转 240 度 (a)', cycles: [[0, 2, 1], [3, 5, 4]] },
    { name: '对角轴旋转 120 度 (b)', cycles: [[0, 2, 4], [1, 3, 5]] },
    { name: '对角轴旋转 240 度 (b)', cycles: [[0, 4, 2], [1, 5, 3]] },
    { name: '对角轴旋转 120 度 (c)', cycles: [[0, 1, 4], [2, 3, 5]] },
    { name: '对角轴旋转 240 度 (c)', cycles: [[0, 4, 1], [2, 5, 3]] },
    { name: '对角轴旋转 120 度 (d)', cycles: [[0, 3, 1], [2, 5, 4]] },
    { name: '对角轴旋转 240 度 (d)', cycles: [[0, 1, 3], [2, 4, 5]] },
  ]

  let sum4 = 0
  let count4 = 0
  for (const elem of cubeRotations) {
    const fixed = countFixedColorings(elem.cycles, colors4)
    sum4 += fixed
    count4++
    if (count4 <= 4 || count4 === 11 || count4 === 17) {
      output.push(`  ${elem.name}`)
      output.push(`    循环个数: ${elem.cycles.length}，不动点数: ${fixed}`)
    } else if (count4 === 5) {
      output.push(`  ... (省略部分旋转操作) ...`)
    }
  }
  const result4 = sum4 / cubeRotations.length
  output.push(`\n  共 ${cubeRotations.length} 个群元素`)
  output.push(`  不动点总数: ${sum4}`)
  output.push(`  不等价着色数 = ${sum4} / ${cubeRotations.length} = ${result4}\n`)

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
