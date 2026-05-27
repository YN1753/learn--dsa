export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 前缀和 (Prefix Sum) 演示 ===')
  lines.push('')

  // --- 1. 一维前缀和构建 ---
  lines.push('【1】一维前缀和构建')
  lines.push('─────────────────────────')
  const arr1 = [3, 1, 4, 1, 5, 9, 2, 6]
  lines.push(`原数组: [${arr1.join(', ')}]`)
  lines.push('')
  const sum1 = buildPrefixSum(arr1)
  lines.push(`前缀和: [${sum1.join(', ')}]`)
  lines.push(`  sum[0] = 0（哨兵值）`)
  for (let i = 1; i <= arr1.length; i++) {
    const parts = arr1.slice(0, i).join(' + ')
    lines.push(`  sum[${i}] = ${parts} = ${sum1[i]}`)
  }
  lines.push('')

  // --- 2. 区间查询 ---
  lines.push('【2】区间查询演示')
  lines.push('─────────────────────────')
  const queries: [number, number][] = [[1, 3], [2, 5], [4, 4], [1, 8]]
  for (const [l, r] of queries) {
    const result = rangeQuery(sum1, l, r)
    const elements = arr1.slice(l - 1, r).join(' + ')
    lines.push(`  查询 [${l}, ${r}]: sum[${r}] - sum[${l - 1}] = ${sum1[r]} - ${sum1[l - 1]} = ${result}  （${elements} = ${result}）`)
  }
  lines.push('')

  // --- 3. 暴力 vs 前缀和效率对比 ---
  lines.push('【3】暴力求和 vs 前缀和 效率对比')
  lines.push('─────────────────────────')
  const sizes = [100, 1000, 10000, 100000]
  for (const size of sizes) {
    const queryCount = size
    lines.push(`  n=${size.toLocaleString().padStart(8)}, 查询${queryCount.toLocaleString().padStart(8)}次:  暴力 O(n*m) ≈ ${(size * queryCount).toLocaleString().padStart(15)} 次操作,  前缀和 O(n+m) = ${(size + queryCount).toLocaleString().padStart(10)} 次操作`)
  }
  lines.push('')

  // --- 4. 子数组和等于 k ---
  lines.push('【4】子数组和等于 k')
  lines.push('─────────────────────────')
  const arr2 = [1, 2, 3, -1, 1, 2]
  const k = 3
  lines.push(`数组: [${arr2.join(', ')}]`)
  lines.push(`目标和 k = ${k}`)
  lines.push('')
  const count = subarraySumTrace(arr2, k, lines)
  lines.push(`  结果: 共 ${count} 个子数组的和为 ${k}`)
  lines.push('')

  // --- 5. 二维前缀和 ---
  lines.push('【5】二维前缀和演示')
  lines.push('─────────────────────────')
  const matrix = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ]
  lines.push('原矩阵:')
  for (const row of matrix) {
    lines.push(`  [${row.map(v => String(v).padStart(3)).join(', ')}]`)
  }
  lines.push('')

  const sum2d = build2DPrefixSum(matrix)
  lines.push('前缀和矩阵:')
  for (let i = 0; i < sum2d.length; i++) {
    lines.push(`  [${sum2d[i].map(v => String(v).padStart(4)).join(', ')}]`)
  }
  lines.push('')

  const queries2d: [number, number, number, number][] = [
    [1, 1, 2, 2],
    [1, 2, 3, 4],
    [2, 1, 3, 3],
  ]
  for (const [r1, c1, r2, c2] of queries2d) {
    const result = query2D(sum2d, r1, c1, r2, c2)
    lines.push(`  查询子矩阵 (${r1},${c1})→(${r2},${c2}): ${result}`)
  }
  lines.push('')

  // --- 6. 前缀异或和 ---
  lines.push('【6】前缀异或和演示')
  lines.push('─────────────────────────')
  const arr3 = [3, 5, 7, 9, 2]
  lines.push(`数组: [${arr3.join(', ')}]`)
  lines.push('')
  const xorArr = buildPrefixXor(arr3)
  lines.push(`前缀异或: [${xorArr.join(', ')}]`)
  const xorQueries: [number, number][] = [[1, 3], [2, 4], [1, 5]]
  for (const [l, r] of xorQueries) {
    const result = rangeXor(xorArr, l, r)
    const elements = arr3.slice(l - 1, r).join(' ^ ')
    lines.push(`  区间异或 [${l}, ${r}]: ${elements} = ${result}`)
  }
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 辅助函数：构建前缀和
function buildPrefixSum(arr: number[]): number[] {
  const sum = new Array(arr.length + 1).fill(0)
  for (let i = 1; i <= arr.length; i++) {
    sum[i] = sum[i - 1] + arr[i - 1]
  }
  return sum
}

// 辅助函数：区间查询
function rangeQuery(sum: number[], l: number, r: number): number {
  return sum[r] - sum[l - 1]
}

// 辅助函数：子数组和等于 k（带追踪）
function subarraySumTrace(nums: number[], k: number, lines: string[]): number {
  const prefixCount = new Map<number, number>()
  prefixCount.set(0, 1)

  let currSum = 0
  let count = 0

  lines.push('  步骤追踪:')
  for (let i = 0; i < nums.length; i++) {
    currSum += nums[i]
    const target = currSum - k
    const found = prefixCount.get(target) || 0

    if (found > 0) {
      lines.push(`  i=${i}: 加入 ${nums[i]}，currSum=${currSum}，查找 currSum-k=${target}，出现 ${found} 次 → 找到 ${found} 个子数组`)
      count += found
    } else {
      lines.push(`  i=${i}: 加入 ${nums[i]}，currSum=${currSum}，查找 currSum-k=${target}，未找到`)
    }

    prefixCount.set(currSum, (prefixCount.get(currSum) || 0) + 1)
  }

  return count
}

// 辅助函数：构建二维前缀和
function build2DPrefixSum(matrix: number[][]): number[][] {
  const m = matrix.length
  const n = matrix[0].length
  const sum: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      sum[i][j] = matrix[i - 1][j - 1]
        + sum[i - 1][j]
        + sum[i][j - 1]
        - sum[i - 1][j - 1]
    }
  }

  return sum
}

// 辅助函数：二维区间查询
function query2D(
  sum: number[][],
  r1: number, c1: number,
  r2: number, c2: number
): number {
  return sum[r2][c2]
    - sum[r1 - 1][c2]
    - sum[r2][c1 - 1]
    + sum[r1 - 1][c1 - 1]
}

// 辅助函数：构建前缀异或和
function buildPrefixXor(arr: number[]): number[] {
  const xor = new Array(arr.length + 1).fill(0)
  for (let i = 1; i <= arr.length; i++) {
    xor[i] = xor[i - 1] ^ arr[i - 1]
  }
  return xor
}

// 辅助函数：区间异或查询
function rangeXor(xor: number[], l: number, r: number): number {
  return xor[r] ^ xor[l - 1]
}
