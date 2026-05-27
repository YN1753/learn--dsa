export default function linearProgrammingDemo(): string {
  const output: string[] = []

  output.push('=== 线性规划演示 ===\n')

  // 问题定义
  output.push('问题：生产计划优化')
  output.push('目标：最大化利润 z = 5x₁ + 4x₂')
  output.push('约束条件：')
  output.push('  2x₁ + 3x₂ ≤ 120  (原材料)')
  output.push('  4x₁ + 2x₂ ≤ 160  (工时)')
  output.push('  x₁, x₂ ≥ 0')
  output.push('')

  // 引入松弛变量转为标准形式
  output.push('1. 转化为标准形式（引入松弛变量）')
  output.push('   最大化: z = 5x₁ + 4x₂')
  output.push('   2x₁ + 3x₂ + x₃ = 120')
  output.push('   4x₁ + 2x₂ + x₄ = 160')
  output.push('   x₁, x₂, x₃, x₄ ≥ 0')
  output.push('')

  // 初始单纯形表
  output.push('2. 初始单纯形表')
  output.push('   基变量 | x₁  x₂  x₃  x₄  | RHS')
  output.push('   ─────────────────────────────────')
  output.push('     x₃   | 2   3   1   0   | 120')
  output.push('     x₄   | 4   2   0   1   | 160')
  output.push('   ─────────────────────────────────')
  output.push('     z    | -5  -4  0   0   | 0')
  output.push('   当前解: x₁=0, x₂=0, z=0')
  output.push('')

  // 第一次迭代
  output.push('3. 第一次迭代')
  output.push('   入基变量: x₁（检验数 -5 最负）')
  output.push('   出基变量: x₄（min(120/2, 160/4) = min(60, 40) = 40）')
  output.push('   转轴操作...')
  output.push('')
  output.push('   基变量 | x₁   x₂   x₃   x₄   | RHS')
  output.push('   ────────────────────────────────────')
  output.push('     x₃   | 0    2    1    -0.5  | 40')
  output.push('     x₁   | 1    0.5  0     0.25 | 40')
  output.push('   ────────────────────────────────────')
  output.push('     z    | 0   -1.5  0     1.25 | 200')
  output.push('   当前解: x₁=40, x₂=0, z=200')
  output.push('')

  // 第二次迭代
  output.push('4. 第二次迭代')
  output.push('   入基变量: x₂（检验数 -1.5 仍为负）')
  output.push('   出基变量: x₃（min(40/2, 40/0.5) = min(20, 80) = 20）')
  output.push('   转轴操作...')
  output.push('')
  output.push('   基变量 | x₁  x₂  x₃   x₄    | RHS')
  output.push('   ────────────────────────────────────')
  output.push('     x₂   | 0   1   0.5  -0.25 | 20')
  output.push('     x₁   | 1   0  -0.25  0.375| 30')
  output.push('   ────────────────────────────────────')
  output.push('     z    | 0   0   0.75  0.875 | 230')
  output.push('   当前解: x₁=30, x₂=20, z=230')
  output.push('')

  // 最优性检验
  output.push('5. 最优性检验')
  output.push('   所有检验数非负 (0, 0, 0.75, 0.875)')
  output.push('   当前解即为最优解！')
  output.push('')

  // 结果
  output.push('6. 最优解')
  output.push('   x₁ = 30（产品 A 生产 30 单位）')
  output.push('   x₂ = 20（产品 B 生产 20 单位）')
  output.push('   最大利润 z = 5×30 + 4×20 = 230')
  output.push('')

  // 对偶分析
  output.push('7. 对偶问题分析')
  output.push('   对偶变量 y₁（原材料影子价格）= 0.75')
  output.push('   对偶变量 y₂（工时影子价格）= 0.875')
  output.push('   含义：增加 1 单位原材料可增加 0.75 利润')
  output.push('         增加 1 单位工时可增加 0.875 利润')
  output.push('')

  // 灵敏度分析
  output.push('8. 灵敏度分析')
  output.push('   原材料供应量范围: [80, 240] 时基不变')
  output.push('   工时供应量范围: [80, 200] 时基不变')
  output.push('   产品 A 利润系数范围: [4, 8] 时基不变')
  output.push('   产品 B 利润系数范围: [2.5, 10] 时基不变')
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
