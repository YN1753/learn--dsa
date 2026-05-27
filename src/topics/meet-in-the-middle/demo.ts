export default function meetInTheMiddleDemo(): string {
  const output: string[] = []

  output.push('=== 折半搜索 (Meet in the Middle) 演示 ===')
  output.push('问题：给定数组，求有多少个子集的和恰好等于目标值\n')

  // 示例数据
  const arr = [3, 7, 1, 5, 9, 2, 8, 4]
  const target = 12
  const n = arr.length

  output.push(`数组: [${arr.join(', ')}]`)
  output.push(`目标值: ${target}`)
  output.push(`数组长度: ${n}\n`)

  // --- 暴力解法 ---
  output.push('--- 方法一：暴力枚举 ---')
  let bruteForceCount = 0
  let bruteForceOps = 0
  for (let mask = 0; mask < (1 << n); mask++) {
    let sum = 0
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        sum += arr[i]
      }
      bruteForceOps++
    }
    if (sum === target) {
      bruteForceCount++
    }
  }
  output.push(`暴力枚举所有 2^${n} = ${1 << n} 个子集`)
  output.push(`操作次数: ${bruteForceOps}`)
  output.push(`结果: ${bruteForceCount} 个子集的和为 ${target}\n`)

  // --- 折半搜索 ---
  output.push('--- 方法二：折半搜索 ---')
  const mid = Math.floor(n / 2)
  const leftArr = arr.slice(0, mid)
  const rightArr = arr.slice(mid)
  output.push(`分割点: mid = ${mid}`)
  output.push(`左半部分 A: [${leftArr.join(', ')}] (长度 ${mid})`)
  output.push(`右半部分 B: [${rightArr.join(', ')}] (长度 ${n - mid})\n`)

  // 枚举左半部分所有子集和
  output.push('步骤 1: 枚举左半部分 A 的所有子集和')
  const leftSums: number[] = []
  for (let mask = 0; mask < (1 << mid); mask++) {
    let sum = 0
    const subset: number[] = []
    for (let i = 0; i < mid; i++) {
      if (mask & (1 << i)) {
        sum += leftArr[i]
        subset.push(leftArr[i])
      }
    }
    leftSums.push(sum)
    if (mask < 8 || mask === (1 << mid) - 1) {
      output.push(`  子集 ${subset.length === 0 ? '{}' : '{' + subset.join(',') + '}'} = ${sum}`)
    }
  }
  if ((1 << mid) > 9) {
    output.push(`  ... (共 ${1 << mid} 个子集)`)
  }
  output.push(`  左半子集和数组 S_A: [${leftSums.join(', ')}]\n`)

  // 枚举右半部分所有子集和
  output.push('步骤 2: 枚举右半部分 B 的所有子集和')
  const rightSums: number[] = []
  for (let mask = 0; mask < (1 << (n - mid)); mask++) {
    let sum = 0
    const subset: number[] = []
    for (let i = 0; i < n - mid; i++) {
      if (mask & (1 << i)) {
        sum += rightArr[i]
        subset.push(rightArr[i])
      }
    }
    rightSums.push(sum)
    if (mask < 8 || mask === (1 << (n - mid)) - 1) {
      output.push(`  子集 ${subset.length === 0 ? '{}' : '{' + subset.join(',') + '}'} = ${sum}`)
    }
  }
  if ((1 << (n - mid)) > 9) {
    output.push(`  ... (共 ${1 << (n - mid)} 个子集)`)
  }
  output.push(`  右半子集和数组 S_B: [${rightSums.join(', ')}]\n`)

  // 排序右半部分
  output.push('步骤 3: 对 S_B 排序（用于二分查找）')
  rightSums.sort((a, b) => a - b)
  output.push(`  排序后 S_B: [${rightSums.join(', ')}]\n`)

  // 合并匹配
  output.push('步骤 4: 对 S_A 中每个值 x，在 S_B 中二分查找 target - x')
  let mitmCount = 0
  let mitmOps = 0

  for (const x of leftSums) {
    const need = target - x

    // 二分查找 need 在 rightSums 中出现的次数
    let lo = 0
    let hi = rightSums.length
    while (lo < hi) {
      const m = Math.floor((lo + hi) / 2)
      mitmOps++
      if (rightSums[m] < need) {
        lo = m + 1
      } else {
        hi = m
      }
    }
    const first = lo

    lo = 0
    hi = rightSums.length
    while (lo < hi) {
      const m = Math.floor((lo + hi) / 2)
      mitmOps++
      if (rightSums[m] <= need) {
        lo = m + 1
      } else {
        hi = m
      }
    }
    const last = lo

    const count = last - first
    if (count > 0) {
      mitmCount += count
      output.push(`  x=${x}, 需要 ${need}，在 S_B 中找到 ${count} 个`)
    }
  }

  output.push(`\n结果: ${mitmCount} 个子集的和为 ${target}`)
  output.push(`二分查找操作次数: ${mitmOps}`)

  // 对比
  output.push('\n--- 复杂度对比 ---')
  output.push(`暴力枚举: 2^${n} = ${1 << n} 次操作`)
  output.push(`折半搜索: 2^${mid} + 2^${n - mid} + 二分查找 ≈ ${(1 << mid) + (1 << (n - mid))} 次枚举 + ${mitmOps} 次查找`)
  output.push(`加速比: 约 ${((1 << n) / mitmOps).toFixed(1)} 倍`)

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
