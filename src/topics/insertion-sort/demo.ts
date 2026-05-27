export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 插入排序 (Insertion Sort) 演示 ===')
  lines.push('')

  // --- 1. 基本插入排序追踪 ---
  lines.push('【1】基本插入排序过程')
  lines.push('─────────────────────────')
  const arr = [5, 3, 8, 1, 2]
  lines.push(`初始数组: [${arr.join(', ')}]`)
  lines.push('')

  const sortedArr = insertionSortTrace([...arr], lines)
  lines.push(`排序结果: [${sortedArr.join(', ')}]`)
  lines.push('')

  // --- 2. 近乎有序数据演示 ---
  lines.push('【2】近乎有序数据 — 展示 O(n) 最佳情况')
  lines.push('─────────────────────────')
  const nearlySorted = [1, 2, 4, 3, 5, 6, 7, 8]
  lines.push(`近乎有序数组: [${nearlySorted.join(', ')}]`)
  lines.push('(只有 3 和 4 的顺序不对)')
  lines.push('')

  let totalComparisons = 0
  const nsArr = [...nearlySorted]
  for (let i = 1; i < nsArr.length; i++) {
    const key = nsArr[i]
    let j = i - 1
    let comparisons = 0

    while (j >= 0 && nsArr[j] > key) {
      comparisons++
      nsArr[j + 1] = nsArr[j]
      j--
    }
    nsArr[j + 1] = key
    totalComparisons += comparisons

    if (comparisons > 0) {
      lines.push(`第 ${i} 轮: 插入 ${key}，需要 ${comparisons} 次比较`)
    }
  }

  lines.push('')
  lines.push(`总比较次数: ${totalComparisons}（完全有序时为 0）`)
  lines.push(`排序结果: [${nsArr.join(', ')}]`)
  lines.push('')

  // --- 3. 最坏情况（逆序数组）---
  lines.push('【3】最坏情况 — 逆序数组，展示 O(n²)')
  lines.push('─────────────────────────')
  const worst = [8, 7, 6, 5, 4, 3, 2, 1]
  lines.push(`逆序数组: [${worst.join(', ')}]`)
  lines.push('')

  let worstComparisons = 0
  let worstMoves = 0
  const wArr = [...worst]
  for (let i = 1; i < wArr.length; i++) {
    const key = wArr[i]
    let j = i - 1
    let roundMoves = 0

    while (j >= 0 && wArr[j] > key) {
      worstComparisons++
      wArr[j + 1] = wArr[j]
      roundMoves++
      j--
    }
    wArr[j + 1] = key
    worstMoves += roundMoves

    lines.push(`第 ${i} 轮: 插入 ${key}，比较 ${roundMoves + 1} 次，移动 ${roundMoves} 次`)
  }

  lines.push('')
  lines.push(`总比较次数: ${worstComparisons}`)
  lines.push(`总移动次数: ${worstMoves}`)
  lines.push(`理论值 n*(n-1)/2 = ${wArr.length * (wArr.length - 1) / 2}`)
  lines.push(`排序结果: [${wArr.join(', ')}]`)
  lines.push('')

  // --- 4. 与选择排序对比 ---
  lines.push('【4】插入排序 vs 选择排序 对比')
  lines.push('─────────────────────────')
  const testData = [5, 3, 8, 1, 2]
  lines.push(`测试数组: [${testData.join(', ')}]`)
  lines.push('')

  const insertionResult = countOps([...testData], 'insertion')
  const selectionResult = countOps([...testData], 'selection')

  lines.push(`插入排序: 比较 ${insertionResult.comparisons} 次, 移动/交换 ${insertionResult.moves} 次`)
  lines.push(`选择排序: 比较 ${selectionResult.comparisons} 次, 移动/交换 ${selectionResult.moves} 次`)
  lines.push('')

  // 对比近乎有序数据
  const nearlySortedData = [1, 2, 3, 5, 4, 6, 7, 8]
  lines.push(`近乎有序数组: [${nearlySortedData.join(', ')}]`)
  lines.push('')

  const insertionResult2 = countOps([...nearlySortedData], 'insertion')
  const selectionResult2 = countOps([...nearlySortedData], 'selection')

  lines.push(`插入排序: 比较 ${insertionResult2.comparisons} 次, 移动/交换 ${insertionResult2.moves} 次`)
  lines.push(`选择排序: 比较 ${selectionResult2.comparisons} 次, 移动/交换 ${selectionResult2.moves} 次`)
  lines.push('')
  lines.push('结论: 在近乎有序数据上，插入排序的比较次数远少于选择排序。')
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 详细插入排序追踪
function insertionSortTrace(arr: number[], lines: string[]): number[] {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]
    lines.push(`第 ${i} 轮: 插入元素 key = ${key}`)
    lines.push(`  已排序部分: [${arr.slice(0, i).join(', ')}]`)
    lines.push(`  未排序部分: [${arr.slice(i).join(', ')}]`)

    let j = i - 1
    let comparisons = 0
    let shifts = 0

    while (j >= 0 && arr[j] > key) {
      comparisons++
      lines.push(`  比较: arr[${j}]=${arr[j]} > key=${key}，右移`)
      arr[j + 1] = arr[j]
      shifts++
      j--
    }

    if (j >= 0) {
      comparisons++
      lines.push(`  比较: arr[${j}]=${arr[j]} <= key=${key}，找到插入位置`)
    }

    arr[j + 1] = key
    lines.push(`  将 key=${key} 插入到位置 ${j + 1}`)
    lines.push(`  结果: [${arr.join(', ')}]`)
    lines.push(`  统计: ${comparisons} 次比较, ${shifts} 次移动`)
    lines.push('')
  }
  return arr
}

// 统计操作次数
function countOps(
  input: number[],
  algorithm: 'insertion' | 'selection'
): { comparisons: number; moves: number } {
  const arr = [...input]
  const n = arr.length
  let comparisons = 0
  let moves = 0

  if (algorithm === 'insertion') {
    for (let i = 1; i < n; i++) {
      const key = arr[i]
      let j = i - 1
      while (j >= 0) {
        comparisons++
        if (arr[j] > key) {
          arr[j + 1] = arr[j]
          moves++
          j--
        } else {
          break
        }
      }
      arr[j + 1] = key
    }
  } else {
    // selection sort
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i
      for (let j = i + 1; j < n; j++) {
        comparisons++
        if (arr[j] < arr[minIdx]) {
          minIdx = j
        }
      }
      if (minIdx !== i) {
        const tmp = arr[i]
        arr[i] = arr[minIdx]
        arr[minIdx] = tmp
        moves++
      }
    }
  }

  return { comparisons, moves }
}
