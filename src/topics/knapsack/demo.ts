export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 背包问题 (Knapsack Problem) 演示 ===')
  lines.push('')

  // --- 1. 0/1 背包 DP 表逐步填充 ---
  lines.push('【1】0/1 背包 - DP 表逐步填充')
  lines.push('─────────────────────────')
  const weights1 = [2, 3, 4, 5]
  const values1 = [3, 4, 5, 6]
  const W1 = 8
  lines.push(`物品: 共 ${weights1.length} 件`)
  for (let i = 0; i < weights1.length; i++) {
    lines.push(`  物品 ${i + 1}: 重量=${weights1[i]}, 价值=${values1[i]}`)
  }
  lines.push(`背包容量: ${W1}`)
  lines.push('')

  const { dp: dp1, steps: steps1 } = knapsack01Trace(weights1, values1, W1)
  for (const step of steps1) {
    lines.push(`  ${step}`)
  }
  lines.push('')
  lines.push(`  最终 DP 表:`)
  printDPTable(dp1, weights1, W1, lines)
  lines.push(`  最大价值: ${dp1[weights1.length][W1]}`)
  lines.push('')

  // --- 2. 回溯最优解 ---
  lines.push('【2】回溯最优解 - 确定选择了哪些物品')
  lines.push('─────────────────────────')
  const selected = traceback01(dp1, weights1, values1, W1)
  let totalWeight = 0
  let totalValue = 0
  for (const item of selected) {
    lines.push(`  选择物品 ${item.index + 1}: 重量=${item.weight}, 价值=${item.value}`)
    totalWeight += item.weight
    totalValue += item.value
  }
  lines.push(`  总重量: ${totalWeight}/${W1},  总价值: ${totalValue}`)
  lines.push('')

  // --- 3. 完全背包 ---
  lines.push('【3】完全背包 - 每种物品可选无限次')
  lines.push('─────────────────────────')
  const weights2 = [2, 3, 5]
  const values2 = [3, 4, 7]
  const W2 = 10
  lines.push(`物品: 共 ${weights2.length} 种`)
  for (let i = 0; i < weights2.length; i++) {
    lines.push(`  物品 ${i + 1}: 重量=${weights2[i]}, 价值=${values2[i]}`)
  }
  lines.push(`背包容量: ${W2}`)
  lines.push('')

  const { dp: dp2, steps: steps2 } = knapsackCompleteTrace(weights2, values2, W2)
  for (const step of steps2) {
    lines.push(`  ${step}`)
  }
  lines.push('')
  lines.push(`  最大价值: ${dp2[W2]}`)
  lines.push('')

  // --- 4. 一维空间优化 ---
  lines.push('【4】一维空间优化 - 逆序 vs 正序')
  lines.push('─────────────────────────')
  lines.push('  0/1 背包（逆序遍历容量）:')
  const result01 = knapsack01_1D(weights1, values1, W1)
  lines.push(`    dp = [${result01.join(', ')}]`)
  lines.push(`    最大价值: ${result01[W1]}`)
  lines.push('')
  lines.push('  完全背包（正序遍历容量）:')
  const resultComplete = knapsackComplete1D(weights2, values2, W2)
  lines.push(`    dp = [${resultComplete.join(', ')}]`)
  lines.push(`    最大价值: ${resultComplete[W2]}`)
  lines.push('')

  // --- 5. 效率对比 ---
  lines.push('【5】时间复杂度对比')
  lines.push('─────────────────────────')
  const scenarios = [
    { n: 10, W: 100 },
    { n: 100, W: 1000 },
    { n: 1000, W: 10000 },
    { n: 100, W: 1000000 },
  ]
  for (const s of scenarios) {
    const dpOps = s.n * s.W
    const bruteForce = Math.pow(2, s.n)
    lines.push(`  n=${s.n}, W=${s.W.toLocaleString()}:  DP=${dpOps.toLocaleString()} 次运算,  暴力=${bruteForce > 1e15 ? '2^' + s.n : bruteForce.toLocaleString()} 次运算`)
  }
  lines.push('')

  // --- 6. 多重背包示例 ---
  lines.push('【6】多重背包 - 每种物品有数量限制')
  lines.push('─────────────────────────')
  const weights3 = [2, 3, 4]
  const values3 = [3, 4, 5]
  const counts3 = [3, 2, 1]
  const W3 = 10
  lines.push(`物品: 共 ${weights3.length} 种`)
  for (let i = 0; i < weights3.length; i++) {
    lines.push(`  物品 ${i + 1}: 重量=${weights3[i]}, 价值=${values3[i]}, 数量上限=${counts3[i]}`)
  }
  lines.push(`背包容量: ${W3}`)
  lines.push('')
  const resultMultiple = knapsackMultiple1D(weights3, values3, counts3, W3)
  lines.push(`  最大价值: ${resultMultiple}`)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 0/1 背包二维 DP，记录每步操作
function knapsack01Trace(
  weights: number[],
  values: number[],
  W: number
): { dp: number[][]; steps: string[] } {
  const n = weights.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0))
  const steps: string[] = []

  for (let i = 1; i <= n; i++) {
    const wi = weights[i - 1]
    const vi = values[i - 1]
    steps.push(`考虑物品 ${i} (重量=${wi}, 价值=${vi}):`)

    for (let w = 0; w <= W; w++) {
      if (w < wi) {
        dp[i][w] = dp[i - 1][w]
      } else {
        const notPick = dp[i - 1][w]
        const pick = dp[i - 1][w - wi] + vi
        dp[i][w] = Math.max(notPick, pick)

        if (w === W || w === wi || w === W - 1) {
          steps.push(
            `  w=${w}: max(不选=${notPick}, 选=${pick}) = ${dp[i][w]}`
          )
        }
      }
    }
  }

  return { dp, steps }
}

// 回溯 0/1 背包选择了哪些物品
function traceback01(
  dp: number[][],
  weights: number[],
  values: number[],
  W: number
): { index: number; weight: number; value: number }[] {
  const n = weights.length
  const selected: { index: number; weight: number; value: number }[] = []
  let w = W

  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push({ index: i - 1, weight: weights[i - 1], value: values[i - 1] })
      w -= weights[i - 1]
    }
  }

  selected.reverse()
  return selected
}

// 完全背包 DP，记录步骤
function knapsackCompleteTrace(
  weights: number[],
  values: number[],
  W: number
): { dp: number[]; steps: string[] } {
  const dp = Array(W + 1).fill(0)
  const steps: string[] = []

  for (let i = 0; i < weights.length; i++) {
    const wi = weights[i]
    const vi = values[i]
    steps.push(`考虑物品 ${i + 1} (重量=${wi}, 价值=${vi}), 正序遍历容量 ${wi}→${W}:`)

    for (let w = wi; w <= W; w++) {
      const old = dp[w]
      dp[w] = Math.max(dp[w], dp[w - wi] + vi)
      if (dp[w] !== old && (w === W || w === wi || w === W - 1)) {
        steps.push(`  w=${w}: max(旧值=${old}, 选入=${dp[w - wi] + vi}) = ${dp[w]}`)
      }
    }
  }

  return { dp, steps }
}

// 0/1 背包一维优化
function knapsack01_1D(weights: number[], values: number[], W: number): number[] {
  const dp = Array(W + 1).fill(0)
  for (let i = 0; i < weights.length; i++) {
    for (let w = W; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i])
    }
  }
  return dp
}

// 完全背包一维优化
function knapsackComplete1D(weights: number[], values: number[], W: number): number[] {
  const dp = Array(W + 1).fill(0)
  for (let i = 0; i < weights.length; i++) {
    for (let w = weights[i]; w <= W; w++) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i])
    }
  }
  return dp
}

// 多重背包一维优化（朴素）
function knapsackMultiple1D(
  weights: number[],
  values: number[],
  counts: number[],
  W: number
): number {
  const dp = Array(W + 1).fill(0)
  for (let i = 0; i < weights.length; i++) {
    for (let w = W; w >= weights[i]; w--) {
      for (let k = 1; k <= counts[i] && k * weights[i] <= w; k++) {
        dp[w] = Math.max(dp[w], dp[w - k * weights[i]] + k * values[i])
      }
    }
  }
  return dp[W]
}

// 打印 DP 表
function printDPTable(dp: number[][], weights: number[], W: number, lines: string[]): void {
  // Header
  let header = '       '
  for (let w = 0; w <= W; w++) {
    header += `w=${w}`.padStart(5)
  }
  lines.push(`  ${header}`)

  for (let i = 0; i < dp.length; i++) {
    const label = i === 0 ? 'i=0' : `i=${i}(w${i}=${weights[i - 1]})`
    let row = `  ${label.padEnd(12)}`
    for (let w = 0; w <= W; w++) {
      row += String(dp[i][w]).padStart(5)
    }
    lines.push(row)
  }
}
