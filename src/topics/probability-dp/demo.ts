/**
 * 概率DP演示：骰子游戏
 *
 * 场景：一个 n 格的线性棋盘，玩家从位置 0 出发。
 * 每次掷一个标准六面骰子（1~6），前进对应步数。
 * 到达或超过终点 n 即获胜。
 * 求：从起点到达终点的期望掷骰次数。
 */

function diceGameExpectation(n: number): { expectation: number; steps: string[] } {
  const output: string[] = []
  const dice = 6

  // dp[i] = 从位置 i 到达终点的期望掷骰次数
  // dp[n] = 0, dp[n+1]...dp[n+5] = 0
  // dp[i] = 1 + (dp[i+1] + dp[i+2] + ... + dp[i+6]) / 6
  const dp = new Array(n + dice + 1).fill(0)
  // dp[n..n+5] = 0 已经初始化

  output.push(`棋盘长度: ${n} 格，骰子: ${dice} 面`)
  output.push(`dp[${n}]..dp[${n + dice - 1}] = 0（已到达终点）`)
  output.push('')

  for (let i = n - 1; i >= 0; i--) {
    let sum = 0
    const transitions: string[] = []
    for (let d = 1; d <= dice; d++) {
      sum += dp[i + d]
      transitions.push(`dp[${i + d}]=${dp[i + d].toFixed(4)}`)
    }
    dp[i] = 1 + sum / dice
    output.push(`dp[${i}] = 1 + (${transitions.join(' + ')}) / ${dice} = ${dp[i].toFixed(4)}`)
  }

  output.push('')
  output.push(`从位置 0 到达终点的期望掷骰次数: ${dp[0].toFixed(4)}`)

  return { expectation: dp[0], steps: output }
}

function couponCollectorProblem(n: number): { expectation: number; steps: string[] } {
  const output: string[] = []

  output.push(`=== 集卡问题（Coupon Collector）===`)
  output.push(`有 ${n} 种不同的卡牌，每次等概率获得一张。`)
  output.push(`求集齐所有卡牌的期望购买次数。`)
  output.push('')

  // dp[k] = 已经收集 k 种卡牌，还需多少次才能收集完的期望
  // dp[n] = 0
  // dp[k] = k/n × dp[k] + (n-k)/n × dp[k+1] + 1
  // 移项：dp[k] × (1 - k/n) = (n-k)/n × dp[k+1] + 1
  // dp[k] = dp[k+1] + n/(n-k)
  const dp = new Array(n + 1).fill(0)
  dp[n] = 0

  output.push(`dp[${n}] = 0（已集齐）`)

  for (let k = n - 1; k >= 0; k--) {
    dp[k] = dp[k + 1] + n / (n - k)
    const pRepeat = k / n
    const pNew = (n - k) / n
    output.push(`dp[${k}] = ${pRepeat.toFixed(3)} × dp[${k}] + ${pNew.toFixed(3)} × dp[${k + 1}] + 1`)
    output.push(`       = dp[${k + 1}] + ${n}/${n - k} = ${dp[k + 1].toFixed(4)} + ${(n / (n - k)).toFixed(4)} = ${dp[k].toFixed(4)}`)
  }

  output.push('')
  output.push(`集齐 ${n} 种卡牌的期望购买次数: ${dp[0].toFixed(4)}`)
  output.push(`理论公式: ${n} × H(${n}) = ${n} × ln(${n}) ≈ ${(n * Math.log(n)).toFixed(4)}`)

  return { expectation: dp[0], steps: output }
}

function randomWalkOnLine(n: number): { expectation: number; steps: string[] } {
  const output: string[] = []

  output.push(`=== 一维随机游走 ===`)
  output.push(`在数轴 [0, ${n}] 上，从位置 ${Math.floor(n / 2)} 出发。`)
  output.push(`每步等概率向左或向右移动 1 格。`)
  output.push(`到达 0 或 ${n} 即停止。求期望步数。`)
  output.push('')

  // dp[i] = 从位置 i 出发到达边界的期望步数
  // dp[0] = dp[n] = 0
  // dp[i] = 1 + 0.5 × dp[i-1] + 0.5 × dp[i+1]
  const dp = new Array(n + 1).fill(0)
  dp[0] = 0
  dp[n] = 0

  // 这是一个线性方程组，可以直接求解
  // dp[i] - 0.5*dp[i-1] - 0.5*dp[i+1] = 1
  // 用追赶法（Thomas算法）求解三对角方程组
  // 简化：dp[i] = i × (n - i)
  for (let i = 1; i < n; i++) {
    dp[i] = i * (n - i)
    output.push(`dp[${i}] = ${i} × (${n} - ${i}) = ${dp[i]}`)
  }

  const start = Math.floor(n / 2)
  output.push('')
  output.push(`从位置 ${start} 出发的期望步数: ${dp[start]}`)

  return { expectation: dp[start], steps: output }
}

export default function probabilityDPDemo(): string {
  const output: string[] = []

  output.push('=== 概率DP演示 ===')
  output.push('')

  // 1. 骰子游戏
  output.push('【1. 骰子游戏】')
  output.push('一个 10 格棋盘，掷六面骰子前进，求期望掷骰次数。')
  output.push('')
  const diceResult = diceGameExpectation(10)
  for (const line of diceResult.steps) {
    output.push(`  ${line}`)
  }
  output.push('')

  // 2. 集卡问题
  output.push('【2. 集卡问题 (Coupon Collector)】')
  output.push('')
  const couponResult = couponCollectorProblem(5)
  for (const line of couponResult.steps) {
    output.push(`  ${line}`)
  }
  output.push('')

  // 3. 一维随机游走
  output.push('【3. 一维随机游走】')
  output.push('')
  const walkResult = randomWalkOnLine(8)
  for (const line of walkResult.steps) {
    output.push(`  ${line}`)
  }
  output.push('')

  // 总结
  output.push('=== 核心要点 ===')
  output.push('1. 期望 = Σ(概率 × 价值)，是概率加权的平均值')
  output.push('2. 求期望通常需要逆向DP（从目标往回推）')
  output.push('3. 当转移涉及自身时，需要移项化简')
  output.push('4. 随机游走问题常可用线性方程组求解')
  output.push('5. 集卡问题的期望 ≈ n × ln(n)（调和级数近似）')
  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
