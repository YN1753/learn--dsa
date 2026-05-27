export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 排序算法 (Sorting Algorithms) 演示 ===')
  lines.push('')

  // --- 1. 冒泡排序 ---
  lines.push('【1】冒泡排序 (Bubble Sort)')
  lines.push('─────────────────────────')
  const bubbleArr = [5, 3, 8, 1, 2]
  lines.push(`初始数组: [${bubbleArr.join(', ')}]`)
  lines.push('')
  bubbleSortTrace([...bubbleArr], lines)
  lines.push('')

  // --- 2. 选择排序 ---
  lines.push('【2】选择排序 (Selection Sort)')
  lines.push('─────────────────────────')
  const selectionArr = [5, 3, 8, 1, 2]
  lines.push(`初始数组: [${selectionArr.join(', ')}]`)
  lines.push('')
  selectionSortTrace([...selectionArr], lines)
  lines.push('')

  // --- 3. 插入排序 ---
  lines.push('【3】插入排序 (Insertion Sort)')
  lines.push('─────────────────────────')
  const insertionArr = [5, 3, 8, 1, 2]
  lines.push(`初始数组: [${insertionArr.join(', ')}]`)
  lines.push('')
  insertionSortTrace([...insertionArr], lines)
  lines.push('')

  // --- 4. 归并排序 ---
  lines.push('【4】归并排序 (Merge Sort)')
  lines.push('─────────────────────────')
  const mergeArr = [5, 3, 8, 1, 2]
  lines.push(`初始数组: [${mergeArr.join(', ')}]`)
  lines.push('')
  let mergeDepth = 0
  mergeSortTrace([...mergeArr], 0, mergeArr.length - 1, lines, mergeDepth)
  lines.push('')

  // --- 5. 快速排序 ---
  lines.push('【5】快速排序 (Quick Sort)')
  lines.push('─────────────────────────')
  const quickArr = [5, 3, 8, 1, 2]
  lines.push(`初始数组: [${quickArr.join(', ')}]`)
  lines.push('')
  let quickDepth = 0
  quickSortTrace([...quickArr], 0, quickArr.length - 1, lines, quickDepth)
  lines.push('')

  // --- 6. 算法对比 ---
  lines.push('【6】算法效率对比')
  lines.push('─────────────────────────')
  const testArr = [38, 27, 43, 3, 9, 82, 10]
  lines.push(`测试数组: [${testArr.join(', ')}]`)
  lines.push('')

  const bubbleResult = countOperations([...testArr], 'bubble')
  const selectionResult = countOperations([...testArr], 'selection')
  const insertionResult = countOperations([...testArr], 'insertion')
  const mergeResult = countOperations([...testArr], 'merge')
  const quickResult = countOperations([...testArr], 'quick')

  lines.push(`冒泡排序: 比较 ${bubbleResult.comparisons} 次, 交换 ${bubbleResult.swaps} 次`)
  lines.push(`选择排序: 比较 ${selectionResult.comparisons} 次, 交换 ${selectionResult.swaps} 次`)
  lines.push(`插入排序: 比较 ${insertionResult.comparisons} 次, 交换 ${insertionResult.swaps} 次`)
  lines.push(`归并排序: 比较 ${mergeResult.comparisons} 次, 交换 ${mergeResult.swaps} 次`)
  lines.push(`快速排序: 比较 ${quickResult.comparisons} 次, 交换 ${quickResult.swaps} 次`)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 辅助函数：冒泡排序详细过程
function bubbleSortTrace(arr: number[], lines: string[]): void {
  const n = arr.length
  let totalSwaps = 0
  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
        totalSwaps++
      }
    }
    lines.push(`第${i + 1}轮: [${arr.join(', ')}]  (已排序: 右侧 ${i + 1} 个元素)`)
    if (!swapped) {
      lines.push('  → 本轮无交换，提前终止')
      break
    }
  }
  lines.push(`排序完成! 总共交换 ${totalSwaps} 次`)
}

// 辅助函数：选择排序详细过程
function selectionSortTrace(arr: number[], lines: string[]): void {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j
      }
    }
    if (minIdx !== i) {
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
    }
    lines.push(
      `第${i + 1}轮: 最小值=${arr[i]}, 放到位置${i}  →  [${arr.join(', ')}]`
    )
  }
  lines.push('排序完成!')
}

// 辅助函数：插入排序详细过程
function insertionSortTrace(arr: number[], lines: string[]): void {
  const n = arr.length
  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = key
    lines.push(
      `第${i}步: 插入 ${key} → [${arr.join(', ')}]`
    )
  }
  lines.push('排序完成!')
}

// 辅助函数：归并排序详细过程
function mergeSortTrace(
  arr: number[],
  left: number,
  right: number,
  lines: string[],
  depth: number
): void {
  if (left >= right) return

  const mid = (left + right) >> 1
  const indent = '  '.repeat(depth)

  lines.push(`${indent}分割: [${arr.slice(left, right + 1).join(', ')}]`)

  mergeSortTrace(arr, left, mid, lines, depth + 1)
  mergeSortTrace(arr, mid + 1, right, lines, depth + 1)

  // 合并
  const temp: number[] = []
  let i = left,
    j = mid + 1
  while (i <= mid && j <= right) {
    if (arr[i] <= arr[j]) {
      temp.push(arr[i++])
    } else {
      temp.push(arr[j++])
    }
  }
  while (i <= mid) temp.push(arr[i++])
  while (j <= right) temp.push(arr[j++])

  for (let k = 0; k < temp.length; k++) {
    arr[left + k] = temp[k]
  }

  lines.push(
    `${indent}合并: [${arr.slice(left, right + 1).join(', ')}]`
  )
}

// 辅助函数：快速排序详细过程
function quickSortTrace(
  arr: number[],
  left: number,
  right: number,
  lines: string[],
  depth: number
): void {
  if (left >= right) return

  const indent = '  '.repeat(depth)
  const pivotIdx = partition(arr, left, right)
  const pivot = arr[pivotIdx]

  lines.push(
    `${indent}枢轴=${pivot}, 分区: [${arr.slice(left, pivotIdx).join(', ')}] | [${pivot}] | [${arr.slice(pivotIdx + 1, right + 1).join(', ')}]`
  )

  quickSortTrace(arr, left, pivotIdx - 1, lines, depth + 1)
  quickSortTrace(arr, pivotIdx + 1, right, lines, depth + 1)

  if (depth === 0) {
    lines.push(`排序结果: [${arr.join(', ')}]`)
  }
}

// 辅助函数：Lomuto 分区
function partition(arr: number[], left: number, right: number): number {
  const pivot = arr[right]
  let i = left
  for (let j = left; j < right; j++) {
    if (arr[j] <= pivot) {
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      i++
    }
  }
  ;[arr[i], arr[right]] = [arr[right], arr[i]]
  return i
}

// 辅助函数：统计操作次数
function countOperations(
  arr: number[],
  algorithm: 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick'
): { comparisons: number; swaps: number } {
  let comparisons = 0
  let swaps = 0
  const n = arr.length

  switch (algorithm) {
    case 'bubble': {
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          comparisons++
          if (arr[j] > arr[j + 1]) {
            ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
            swaps++
          }
        }
      }
      break
    }
    case 'selection': {
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i
        for (let j = i + 1; j < n; j++) {
          comparisons++
          if (arr[j] < arr[minIdx]) {
            minIdx = j
          }
        }
        if (minIdx !== i) {
          ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
          swaps++
        }
      }
      break
    }
    case 'insertion': {
      for (let i = 1; i < n; i++) {
        const key = arr[i]
        let j = i - 1
        while (j >= 0) {
          comparisons++
          if (arr[j] > key) {
            arr[j + 1] = arr[j]
            swaps++
            j--
          } else {
            break
          }
        }
        arr[j + 1] = key
      }
      break
    }
    case 'merge': {
      const mergeCount = { comparisons: 0, swaps: 0 }
      mergeSortCount(arr, 0, n - 1, mergeCount)
      comparisons = mergeCount.comparisons
      swaps = mergeCount.swaps
      break
    }
    case 'quick': {
      const quickCount = { comparisons: 0, swaps: 0 }
      quickSortCount(arr, 0, n - 1, quickCount)
      comparisons = quickCount.comparisons
      swaps = quickCount.swaps
      break
    }
  }

  return { comparisons, swaps }
}

function mergeSortCount(
  arr: number[],
  left: number,
  right: number,
  count: { comparisons: number; swaps: number }
): void {
  if (left >= right) return
  const mid = (left + right) >> 1
  mergeSortCount(arr, left, mid, count)
  mergeSortCount(arr, mid + 1, right, count)

  const temp: number[] = []
  let i = left,
    j = mid + 1
  while (i <= mid && j <= right) {
    count.comparisons++
    if (arr[i] <= arr[j]) {
      temp.push(arr[i++])
    } else {
      temp.push(arr[j++])
      count.swaps++
    }
  }
  while (i <= mid) temp.push(arr[i++])
  while (j <= right) temp.push(arr[j++])
  for (let k = 0; k < temp.length; k++) {
    arr[left + k] = temp[k]
  }
}

function quickSortCount(
  arr: number[],
  left: number,
  right: number,
  count: { comparisons: number; swaps: number }
): void {
  if (left >= right) return
  const pivot = arr[right]
  let i = left
  for (let j = left; j < right; j++) {
    count.comparisons++
    if (arr[j] <= pivot) {
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      count.swaps++
      i++
    }
  }
  ;[arr[i], arr[right]] = [arr[right], arr[i]]
  count.swaps++
  quickSortCount(arr, left, i - 1, count)
  quickSortCount(arr, i + 1, right, count)
}
