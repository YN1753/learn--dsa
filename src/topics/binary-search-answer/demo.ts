export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 二分答案 (Binary Search on Answer) 演示 ===')
  lines.push('')

  // --- 1. Aggressive Cows 问题 ---
  lines.push('【1】Aggressive Cows — 最大化最小间距')
  lines.push('─────────────────────────────────────')
  lines.push('问题：将 5 头牛放入以下牛棚，最大化任意两头牛的最小间距')
  const positions = [1, 2, 8, 4, 9]
  const cows = 3
  const sorted = [...positions].sort((a, b) => a - b)
  lines.push(`牛棚位置: [${positions.join(', ')}]  排序后: [${sorted.join(', ')}]`)
  lines.push(`牛的数量: ${cows}`)
  lines.push('')

  const cowsResult = aggressiveCowsTrace(sorted, cows, lines)
  lines.push(`最终答案: 最大化最小间距 = ${cowsResult}`)
  lines.push('')

  // --- 2. Ship Packages 问题 ---
  lines.push('【2】Ship Packages — 最小化运载能力')
  lines.push('─────────────────────────────────────')
  lines.push('问题：一艘船需要在 3 天内运走所有包裹，求最小运载能力')
  const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  const days = 5
  lines.push(`包裹重量: [${weights.join(', ')}]`)
  lines.push(`运送天数: ${days}`)
  lines.push('')

  const shipResult = shipPackagesTrace(weights, days, lines)
  lines.push(`最终答案: 最小运载能力 = ${shipResult}`)
  lines.push('')

  // --- 3. 分割数组最小化最大和 ---
  lines.push('【3】分割数组 — 最小化子数组和的最大值')
  lines.push('─────────────────────────────────────')
  lines.push('问题：将数组分成 3 个连续子数组，使子数组和的最大值最小')
  const nums = [7, 2, 5, 10, 8]
  const m = 2
  lines.push(`数组: [${nums.join(', ')}]`)
  lines.push(`分割份数: ${m}`)
  lines.push('')

  const splitResult = splitArrayTrace(nums, m, lines)
  lines.push(`最终答案: 最小化的最大和 = ${splitResult}`)
  lines.push('')

  // --- 4. 效率对比 ---
  lines.push('【4】二分答案 vs 暴力枚举 效率对比')
  lines.push('─────────────────────────────────────')
  const ranges = [100, 1000, 10000, 1000000, 1000000000]
  for (const range of ranges) {
    const logSteps = Math.ceil(Math.log2(range))
    lines.push(`  答案空间 ${range.toLocaleString().padStart(12)}:  暴力枚举最多 ${range.toLocaleString().padStart(12)} 次,  二分答案最多 ${logSteps} 次`)
  }
  lines.push('')

  // --- 5. 通用框架说明 ---
  lines.push('【5】二分答案通用框架')
  lines.push('─────────────────────────────────────')
  lines.push('  function solve(): number {')
  lines.push('    let lo = 最小可能答案')
  lines.push('    let hi = 最大可能答案')
  lines.push('    while (lo < hi) {')
  lines.push('      const mid = lo + floor((hi - lo) / 2)')
  lines.push('      if (check(mid)) {')
  lines.push('        hi = mid        // 可行，尝试更优')
  lines.push('      } else {')
  lines.push('        lo = mid + 1    // 不可行，调整范围')
  lines.push('      }')
  lines.push('    }')
  lines.push('    return lo')
  lines.push('  }')
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// Aggressive Cows 详细过程
function aggressiveCowsTrace(positions: number[], m: number, lines: string[]): number {
  let lo = 1
  let hi = positions[positions.length - 1] - positions[0]
  let step = 0

  lines.push(`答案空间: [${lo}, ${hi}]`)
  lines.push('')

  while (lo < hi) {
    step++
    const mid = lo + Math.floor((hi - lo + 1) / 2)

    // 执行 check
    const { feasible, placement } = checkCows(positions, m, mid)

    lines.push(`  第${step}步: lo=${lo}, hi=${hi}, mid=${mid}`)
    lines.push(`           check(${mid}): 间距>=${mid}时 `, )
    if (feasible) {
      lines.push(`           --> 可行! (放置了 ${placement.length} 头牛: 位置 [${placement.join(', ')}])`)
      lines.push(`           --> 间距 ${mid} 可行，尝试更大的间距: lo=${mid}`)
      lo = mid
    } else {
      lines.push(`           --> 不可行! (只能放置 ${placement.length}/${m} 头牛)`)
      lines.push(`           --> 间距 ${mid} 不可行，缩小间距: hi=${mid - 1}`)
      hi = mid - 1
    }
    lines.push('')
  }

  return lo
}

function checkCows(positions: number[], m: number, d: number): { feasible: boolean; placement: number[] } {
  const placement = [positions[0]]
  let lastPos = positions[0]

  for (let i = 1; i < positions.length; i++) {
    if (positions[i] - lastPos >= d) {
      placement.push(positions[i])
      lastPos = positions[i]
      if (placement.length >= m) return { feasible: true, placement }
    }
  }

  return { feasible: false, placement }
}

// Ship Packages 详细过程
function shipPackagesTrace(weights: number[], days: number, lines: string[]): number {
  const maxWeight = Math.max(...weights)
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let lo = maxWeight
  let hi = totalWeight
  let step = 0

  lines.push(`答案空间: [${lo}, ${hi}] (最小需要装下最重包裹 ${maxWeight}, 最大为总重量 ${totalWeight})`)
  lines.push('')

  while (lo < hi) {
    step++
    const mid = lo + Math.floor((hi - lo) / 2)

    const { feasible, schedule } = checkShip(weights, days, mid)

    lines.push(`  第${step}步: lo=${lo}, hi=${hi}, mid=${mid}`)
    lines.push(`           check(${mid}): 容量=${mid}时`)
    if (feasible) {
      lines.push(`           --> 可行! (${days}天内运完，日程: [${schedule.join(', ')}])`)
      lines.push(`           --> 容量 ${mid} 可行，尝试更小容量: hi=${mid}`)
      hi = mid
    } else {
      lines.push(`           --> 不可行! (需要 ${schedule.length} 天 > ${days} 天)`)
      lines.push(`           --> 容量 ${mid} 不可行，增大容量: lo=${mid + 1}`)
      lo = mid + 1
    }
    lines.push('')
  }

  return lo
}

function checkShip(weights: number[], days: number, capacity: number): { feasible: boolean; schedule: number[] } {
  const schedule: number[] = []
  let currentLoad = 0

  for (const w of weights) {
    if (currentLoad + w > capacity) {
      schedule.push(currentLoad)
      currentLoad = w
    } else {
      currentLoad += w
    }
  }
  schedule.push(currentLoad)

  return { feasible: schedule.length <= days, schedule }
}

// Split Array 详细过程
function splitArrayTrace(nums: number[], m: number, lines: string[]): number {
  const maxNum = Math.max(...nums)
  const totalSum = nums.reduce((a, b) => a + b, 0)
  let lo = maxNum
  let hi = totalSum
  let step = 0

  lines.push(`答案空间: [${lo}, ${hi}] (最小为最大元素 ${maxNum}, 最大为总和 ${totalSum})`)
  lines.push('')

  while (lo < hi) {
    step++
    const mid = lo + Math.floor((hi - lo) / 2)

    const { feasible, parts } = checkSplit(nums, m, mid)

    lines.push(`  第${step}步: lo=${lo}, hi=${hi}, mid=${mid}`)
    lines.push(`           check(${mid}): 最大子数组和<=${mid}时`)
    if (feasible) {
      lines.push(`           --> 可行! (${m}份分割: [${parts.map(p => `[${p.join(',')}]`).join(', ')}])`)
      lines.push(`           --> ${mid} 可行，尝试更小值: hi=${mid}`)
      hi = mid
    } else {
      lines.push(`           --> 不可行! (需要 ${parts.length} 份 > ${m} 份)`)
      lines.push(`           --> ${mid} 不可行，增大值: lo=${mid + 1}`)
      lo = mid + 1
    }
    lines.push('')
  }

  return lo
}

function checkSplit(nums: number[], m: number, maxSum: number): { feasible: boolean; parts: number[][] } {
  const parts: number[][] = []
  let currentPart: number[] = []
  let currentSum = 0

  for (const num of nums) {
    if (currentSum + num > maxSum) {
      parts.push(currentPart)
      currentPart = [num]
      currentSum = num
    } else {
      currentPart.push(num)
      currentSum += num
    }
  }
  parts.push(currentPart)

  return { feasible: parts.length <= m, parts }
}
