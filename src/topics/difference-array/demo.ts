export default function differenceArrayDemo(): string {
  const output: string[] = []

  output.push('=== 差分数组 (Difference Array) 操作演示 ===\n')

  // 1. 构建差分数组
  const arr: number[] = [2, 5, 9, 7, 10]
  output.push(`原始数组: [${arr.join(', ')}]\n`)

  output.push('--- 步骤 1: 构建差分数组 ---')
  const diff: number[] = new Array(arr.length).fill(0)
  diff[0] = arr[0]
  output.push(`  diff[0] = arr[0] = ${arr[0]}`)
  for (let i = 1; i < arr.length; i++) {
    diff[i] = arr[i] - arr[i - 1]
    output.push(`  diff[${i}] = arr[${i}] - arr[${i - 1}] = ${arr[i]} - ${arr[i - 1]} = ${diff[i]}`)
  }
  output.push(`  差分数组: [${diff.join(', ')}]\n`)

  // 2. 区间修改操作
  output.push('--- 步骤 2: 区间修改 [1, 3] 加 3 ---')
  const l = 1, r = 3, val = 3
  output.push(`  操作: diff[${l}] += ${val}, diff[${r + 1}] -= ${val}`)
  diff[l] += val
  output.push(`  diff[${l}] = ${diff[l]}`)
  if (r + 1 < diff.length) {
    diff[r + 1] -= val
    output.push(`  diff[${r + 1}] = ${diff[r + 1]}`)
  }
  output.push(`  修改后差分数组: [${diff.join(', ')}]\n`)

  // 3. 再做一次区间修改
  output.push('--- 步骤 3: 再次区间修改 [0, 2] 加 1 ---')
  const l2 = 0, r2 = 2, val2 = 1
  output.push(`  操作: diff[${l2}] += ${val2}, diff[${r2 + 1}] -= ${val2}`)
  diff[l2] += val2
  output.push(`  diff[${l2}] = ${diff[l2]}`)
  if (r2 + 1 < diff.length) {
    diff[r2 + 1] -= val2
    output.push(`  diff[${r2 + 1}] = ${diff[r2 + 1]}`)
  }
  output.push(`  修改后差分数组: [${diff.join(', ')}]\n`)

  // 4. 还原数组
  output.push('--- 步骤 4: 通过前缀和还原数组 ---')
  const reconstructed: number[] = new Array(diff.length).fill(0)
  reconstructed[0] = diff[0]
  output.push(`  arr[0] = diff[0] = ${diff[0]}`)
  for (let i = 1; i < diff.length; i++) {
    reconstructed[i] = reconstructed[i - 1] + diff[i]
    output.push(`  arr[${i}] = arr[${i - 1}] + diff[${i}] = ${reconstructed[i - 1]} + ${diff[i]} = ${reconstructed[i]}`)
  }
  output.push(`  还原数组: [${reconstructed.join(', ')}]\n`)

  // 5. 暴力方法验证
  output.push('--- 步骤 5: 暴力方法验证 ---')
  const bruteForce: number[] = [...arr]
  output.push(`  初始: [${bruteForce.join(', ')}]`)

  // 第一次修改 [1, 3] 加 3
  for (let i = 1; i <= 3; i++) {
    bruteForce[i] += 3
  }
  output.push(`  [1,3] 加 3 后: [${bruteForce.join(', ')}]`)

  // 第二次修改 [0, 2] 加 1
  for (let i = 0; i <= 2; i++) {
    bruteForce[i] += 1
  }
  output.push(`  [0,2] 加 1 后: [${bruteForce.join(', ')}]`)

  // 对比结果
  output.push('')
  output.push('--- 结果对比 ---')
  output.push(`  差分数组方法: [${reconstructed.join(', ')}]`)
  output.push(`  暴力方法:     [${bruteForce.join(', ')}]`)
  const match = reconstructed.every((v, i) => v === bruteForce[i])
  output.push(`  结果一致: ${match ? '✓ 是' : '✗ 否'}\n`)

  // 6. 时间复杂度对比
  output.push('=== 时间复杂度对比 ===')
  output.push('  操作              | 暴力方法    | 差分数组')
  output.push('  ------------------|-------------|----------')
  output.push('  单次区间修改       | O(n)        | O(1)')
  output.push('  m 次区间修改       | O(mn)       | O(m)')
  output.push('  最终还原数组       | 不需要       | O(n)')
  output.push('  总计 (m 次修改)    | O(mn)       | O(m + n)')

  return output.join('\n')
}
