/**
 * 卡特兰数演示
 * 展示卡特兰数的计算方法和经典应用
 */

// 闭合公式计算卡特兰数
function catalanClosed(n: number): number {
  let result = 1
  for (let i = 0; i < n; i++) {
    result = result * (2 * n - i) / (i + 1)
  }
  return Math.round(result / (n + 1))
}

// 递推公式计算卡特兰数
function catalanRecursive(n: number): number[] {
  const c: number[] = new Array(n + 1).fill(0)
  c[0] = 1
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j < i; j++) {
      c[i] += c[j] * c[i - 1 - j]
    }
  }
  return c
}

// 生成所有合法括号序列
function generateParentheses(n: number): string[] {
  const result: string[] = []
  function backtrack(open: number, close: number, current: string) {
    if (current.length === 2 * n) {
      result.push(current)
      return
    }
    if (open < n) {
      backtrack(open + 1, close, current + '(')
    }
    if (close < open) {
      backtrack(open, close + 1, current + ')')
    }
  }
  backtrack(0, 0, '')
  return result
}

// 统计不同形态的二叉树数量（验证）
function countBinaryTrees(n: number): number {
  const c = catalanRecursive(n)
  return c[n]
}

// 统计不越过对角线的网格路径
function countDyckPaths(n: number): number {
  return catalanClosed(n)
}

export default function catalanNumbersDemo(): string {
  const output: string[] = []

  output.push('=== 卡特兰数演示 ===\n')

  // 1. 基础数值
  output.push('1. 卡特兰数序列 (n = 0 到 15):')
  const c = catalanRecursive(15)
  output.push(`   ${c.join(', ')}`)
  output.push('')

  // 2. 两种计算方法对比
  output.push('2. 闭合公式 vs 递推公式 对比:')
  for (let n = 0; n <= 10; n++) {
    const closed = catalanClosed(n)
    const rec = c[n]
    const match = closed === rec ? 'OK' : 'MISMATCH'
    output.push(`   C(${n}): 闭合=${closed}, 递推=${rec} [${match}]`)
  }
  output.push('')

  // 3. 合法括号序列
  output.push('3. n=3 时的所有合法括号序列:')
  const parens = generateParentheses(3)
  output.push(`   共 ${parens.length} 种（应等于 C(3)=5）:`)
  for (const p of parens) {
    output.push(`   ${p}`)
  }
  output.push('')

  // 4. 不同节点数的二叉树数量
  output.push('4. 不同形态二叉树数量:')
  for (let n = 0; n <= 8; n++) {
    output.push(`   ${n} 个节点: ${countBinaryTrees(n)} 种`)
  }
  output.push('')

  // 5. 单调路径计数
  output.push('5. 不越过对角线的网格路径 (Dyck 路径):')
  for (let n = 1; n <= 8; n++) {
    output.push(`   ${n}x${n} 网格: ${countDyckPaths(n)} 种路径`)
  }
  output.push('')

  // 6. 卡特兰数的增长率
  output.push('6. 卡特兰数增长率 C(n)/C(n-1):')
  for (let n = 1; n <= 10; n++) {
    const ratio = c[n] / c[n - 1]
    output.push(`   C(${n})/C(${n-1}) = ${ratio.toFixed(4)}`)
  }
  output.push('   极限约为 4（当 n 趋于无穷时）')
  output.push('')

  // 7. 经典应用统计
  output.push('7. 卡特兰数经典应用:')
  output.push('   - n 对括号的合法匹配: C(n)')
  output.push('   - n 个节点的不同二叉树: C(n)')
  output.push('   - n 个元素的出栈序列数: C(n)')
  output.push('   - n 边凸多边形的三角剖分数: C(n-2)')
  output.push('   - 不越过对角线的网格路径: C(n)')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
