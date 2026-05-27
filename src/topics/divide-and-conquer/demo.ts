export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 分治法 (Divide and Conquer) 演示 ===')
  lines.push('')

  // --- 1. 归并排序（分治全流程追踪） ---
  lines.push('【1】归并排序 —— 分治全流程追踪')
  lines.push('─────────────────────────────────────────')

  let mergeStep = 0

  function mergeSortTrace(arr: number[], depth: number = 0): number[] {
    const indent = '  '.repeat(depth)
    mergeStep++
    lines.push(`${indent}[步骤${mergeStep}] 分解: [${arr.join(', ')}] (长度=${arr.length})`)

    if (arr.length <= 1) {
      lines.push(`${indent}  → 基本情况，直接返回`)
      return arr
    }

    const mid = Math.floor(arr.length / 2)
    const left = mergeSortTrace(arr.slice(0, mid), depth + 1)
    const right = mergeSortTrace(arr.slice(mid), depth + 1)

    // Merge
    const merged: number[] = []
    let i = 0
    let j = 0
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        merged.push(left[i])
        i++
      } else {
        merged.push(right[j])
        j++
      }
    }
    while (i < left.length) {
      merged.push(left[i])
      i++
    }
    while (j < right.length) {
      merged.push(right[j])
      j++
    }

    mergeStep++
    lines.push(`${indent}[步骤${mergeStep}] 合并: [${left.join(', ')}] + [${right.join(', ')}] → [${merged.join(', ')}]`)
    return merged
  }

  const testArr = [38, 27, 43, 3, 9, 82, 10]
  lines.push(`输入数组: [${testArr.join(', ')}]`)
  lines.push('')
  const sorted = mergeSortTrace(testArr)
  lines.push('')
  lines.push(`排序结果: [${sorted.join(', ')}]`)
  lines.push('')

  // --- 2. 归并排序复杂度分析 ---
  lines.push('【2】归并排序复杂度分析')
  lines.push('─────────────────────────────────────────')

  let compareCount = 0

  function mergeSortCount(arr: number[]): number[] {
    if (arr.length <= 1) return arr
    const mid = Math.floor(arr.length / 2)
    const left = mergeSortCount(arr.slice(0, mid))
    const right = mergeSortCount(arr.slice(mid))

    const merged: number[] = []
    let i = 0
    let j = 0
    while (i < left.length && j < right.length) {
      compareCount++
      if (left[i] <= right[j]) {
        merged.push(left[i])
        i++
      } else {
        merged.push(right[j])
        j++
      }
    }
    while (i < left.length) {
      merged.push(left[i])
      i++
    }
    while (j < right.length) {
      merged.push(right[j])
      j++
    }
    return merged
  }

  for (const n of [8, 16, 32, 64]) {
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 100))
    compareCount = 0
    mergeSortCount(arr)
    const theoretical = n * Math.ceil(Math.log2(n))
    lines.push(`n=${String(n).padStart(2)}: 比较次数=${String(compareCount).padStart(4)}, 理论上界 n*log(n)=${theoretical}`)
  }
  lines.push('')

  // --- 3. 逆序对计数（分治应用） ---
  lines.push('【3】逆序对计数 —— 分治的经典应用')
  lines.push('─────────────────────────────────────────')

  function countInversions(arr: number[]): { sorted: number[]; inversions: number } {
    if (arr.length <= 1) return { sorted: arr, inversions: 0 }

    const mid = Math.floor(arr.length / 2)
    const leftResult = countInversions(arr.slice(0, mid))
    const rightResult = countInversions(arr.slice(mid))

    const merged: number[] = []
    let i = 0
    let j = 0
    let inversions = leftResult.inversions + rightResult.inversions

    while (i < leftResult.sorted.length && j < rightResult.sorted.length) {
      if (leftResult.sorted[i] <= rightResult.sorted[j]) {
        merged.push(leftResult.sorted[i])
        i++
      } else {
        merged.push(rightResult.sorted[j])
        // All remaining elements in left are greater than right[j]
        inversions += leftResult.sorted.length - i
        j++
      }
    }
    while (i < leftResult.sorted.length) {
      merged.push(leftResult.sorted[i])
      i++
    }
    while (j < rightResult.sorted.length) {
      merged.push(rightResult.sorted[j])
      j++
    }

    return { sorted: merged, inversions }
  }

  const inversionExamples = [
    [2, 4, 1, 3, 5],
    [5, 4, 3, 2, 1],
    [1, 2, 3, 4, 5],
    [1, 3, 2, 5, 4],
  ]

  for (const arr of inversionExamples) {
    const result = countInversions([...arr])
    lines.push(`[${arr.join(', ')}] → 逆序对数: ${result.inversions}`)
  }
  lines.push('')

  // --- 4. 最大子数组和：分治 vs Kadane ---
  lines.push('【4】最大子数组和 —— 分治 vs Kadane 算法')
  lines.push('─────────────────────────────────────────')

  // D&C approach
  function maxSubarrayDC(arr: number[], _lo: number, _hi: number): number {
    if (_lo === _hi) return arr[_lo]
    const mid = Math.floor((_lo + _hi) / 2)

    // Max in left half
    let leftMax = maxSubarrayDC(arr, _lo, mid)

    // Max in right half
    let rightMax = maxSubarrayDC(arr, mid + 1, _hi)

    // Max crossing mid
    let leftSum = -Infinity
    let sum = 0
    for (let i = mid; i >= _lo; i--) {
      sum += arr[i]
      if (sum > leftSum) leftSum = sum
    }

    let rightSum = -Infinity
    sum = 0
    for (let i = mid + 1; i <= _hi; i++) {
      sum += arr[i]
      if (sum > rightSum) rightSum = sum
    }

    const crossMax = leftSum + rightSum
    return Math.max(leftMax, rightMax, crossMax)
  }

  // Kadane's algorithm
  function maxSubarrayKadane(arr: number[]): number {
    let maxSoFar = arr[0]
    let maxEndingHere = arr[0]
    for (let i = 1; i < arr.length; i++) {
      maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i])
      maxSoFar = Math.max(maxSoFar, maxEndingHere)
    }
    return maxSoFar
  }

  const subarrayExamples = [
    [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    [1, 2, 3, 4, 5],
    [-1, -2, -3, -4],
    [5, -3, 5],
  ]

  for (const arr of subarrayExamples) {
    const dcResult = maxSubarrayDC(arr, 0, arr.length - 1)
    const kadaneResult = maxSubarrayKadane(arr)
    lines.push(`[${arr.join(', ')}]`)
    lines.push(`  分治法: ${dcResult}, Kadane: ${kadaneResult}`)
  }
  lines.push('')

  // --- 5. Master 定理示例 ---
  lines.push('【5】Master 定理 —— 分治复杂度分析')
  lines.push('─────────────────────────────────────────')

  interface MasterCase {
    name: string
    a: number
    b: number
    k: number
    result: string
  }

  const masterCases: MasterCase[] = [
    { name: '归并排序', a: 2, b: 2, k: 1, result: 'O(n log n)' },
    { name: '二分查找', a: 1, b: 2, k: 0, result: 'O(log n)' },
    { name: 'Strassen矩阵乘法', a: 7, b: 2, k: 2, result: 'O(n^2.81)' },
    { name: '朴素最近点对', a: 2, b: 2, k: 1, result: 'O(n log n)' },
  ]

  lines.push('T(n) = aT(n/b) + O(n^k)')
  lines.push('')
  for (const mc of masterCases) {
    const logAB = Math.log(mc.a) / Math.log(mc.b)
    let caseNum: string
    if (logAB > mc.k) {
      caseNum = '情况1'
    } else if (Math.abs(logAB - mc.k) < 0.001) {
      caseNum = '情况2'
    } else {
      caseNum = '情况3'
    }
    lines.push(`${mc.name}: a=${mc.a}, b=${mc.b}, k=${mc.k}`)
    lines.push(`  log_b(a) = ${logAB.toFixed(2)}, ${caseNum}`)
    lines.push(`  T(n) = ${mc.result}`)
  }
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}
