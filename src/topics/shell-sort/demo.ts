export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 希尔排序 (Shell Sort) 演示 ===')
  lines.push('')

  // --- 1. 基本希尔排序演示 ---
  lines.push('【1】希尔排序基本演示 (Knuth 增量序列)')
  lines.push('─────────────────────────')
  const demoArr = [35, 33, 42, 10, 14, 19, 27, 44, 26, 31]
  lines.push(`初始数组: [${demoArr.join(', ')}]`)
  lines.push('')
  shellSortTrace([...demoArr], lines)
  lines.push('')

  // --- 2. Shell 增量序列对比 ---
  lines.push('【2】Shell 增量序列 (N/2, N/4, ..., 1)')
  lines.push('─────────────────────────')
  const shellArr = [35, 33, 42, 10, 14, 19, 27, 44, 26, 31]
  lines.push(`初始数组: [${shellArr.join(', ')}]`)
  lines.push('')
  shellSortWithGaps([...shellArr], generateShellGaps(shellArr.length), lines)
  lines.push('')

  // --- 3. Knuth 增量序列对比 ---
  lines.push('【3】Knuth 增量序列 (1, 4, 13, 40, ...)')
  lines.push('─────────────────────────')
  const knuthArr = [35, 33, 42, 10, 14, 19, 27, 44, 26, 31]
  lines.push(`初始数组: [${knuthArr.join(', ')}]`)
  lines.push('')
  shellSortWithGaps([...knuthArr], generateKnuthGaps(knuthArr.length), lines)
  lines.push('')

  // --- 4. Sedgewick 增量序列对比 ---
  lines.push('【4】Sedgewick 增量序列 (1, 5, 19, 41, ...)')
  lines.push('─────────────────────────')
  const sedgewickArr = [35, 33, 42, 10, 14, 19, 27, 44, 26, 31]
  lines.push(`初始数组: [${sedgewickArr.join(', ')}]`)
  lines.push('')
  shellSortWithGaps([...sedgewickArr], generateSedgewickGaps(sedgewickArr.length), lines)
  lines.push('')

  // --- 5. 效率对比 ---
  lines.push('【5】不同增量序列效率对比')
  lines.push('─────────────────────────')
  const testArr = [59, 42, 17, 95, 8, 33, 71, 55, 23, 68, 11, 47, 86, 30, 62]
  lines.push(`测试数组: [${testArr.join(', ')}]`)
  lines.push('')

  const shellResult = countShellOps([...testArr], 'shell')
  const knuthResult = countShellOps([...testArr], 'knuth')
  const sedgewickResult = countShellOps([...testArr], 'sedgewick')

  lines.push(`Shell 增量序列:     比较 ${shellResult.comparisons} 次, 移动 ${shellResult.moves} 次`)
  lines.push(`Knuth 增量序列:     比较 ${knuthResult.comparisons} 次, 移动 ${knuthResult.moves} 次`)
  lines.push(`Sedgewick 增量序列: 比较 ${sedgewickResult.comparisons} 次, 移动 ${sedgewickResult.moves} 次`)
  lines.push('')

  // --- 6. 大规模数组对比 ---
  lines.push('【6】大规模数组排序 (n=50)')
  lines.push('─────────────────────────')
  const largeArr: number[] = []
  for (let i = 0; i < 50; i++) {
    largeArr.push(Math.floor(Math.random() * 99) + 1)
  }
  lines.push(`初始数组 (前20个): [${largeArr.slice(0, 20).join(', ')}, ...]`)
  lines.push('')

  const largeShell = countShellOps([...largeArr], 'shell')
  const largeKnuth = countShellOps([...largeArr], 'knuth')
  const largeSedgewick = countShellOps([...largeArr], 'sedgewick')

  lines.push(`Shell 增量序列:     比较 ${largeShell.comparisons} 次, 移动 ${largeShell.moves} 次`)
  lines.push(`Knuth 增量序列:     比较 ${largeKnuth.comparisons} 次, 移动 ${largeKnuth.moves} 次`)
  lines.push(`Sedgewick 增量序列: 比较 ${largeSedgewick.comparisons} 次, 移动 ${largeSedgewick.moves} 次`)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// Shell 增量序列: N/2, N/4, ..., 1
function generateShellGaps(n: number): number[] {
  const gaps: number[] = []
  let gap = Math.floor(n / 2)
  while (gap > 0) {
    gaps.push(gap)
    gap = Math.floor(gap / 2)
  }
  return gaps
}

// Knuth 增量序列: 1, 4, 13, 40, ...
function generateKnuthGaps(n: number): number[] {
  const gaps: number[] = []
  let h = 1
  while (h < Math.floor(n / 3)) {
    h = 3 * h + 1
  }
  while (h >= 1) {
    gaps.push(h)
    h = Math.floor(h / 3)
  }
  return gaps
}

// Sedgewick 增量序列: 1, 5, 19, 41, 109, ...
function generateSedgewickGaps(n: number): number[] {
  const gaps: number[] = []
  let k = 0
  while (true) {
    const gap = k % 2 === 0
      ? 9 * (Math.pow(2, k) - Math.pow(2, k / 2)) + 1
      : 8 * Math.pow(2, k) - 6 * Math.pow(2, (k + 1) / 2) + 1
    if (gap >= n) break
    gaps.push(gap)
    k++
  }
  gaps.push(0) // sentinel
  return gaps.reverse().filter(g => g > 0)
}

// 详细希尔排序过程 (Knuth 序列)
function shellSortTrace(arr: number[], lines: string[]): void {
  const n = arr.length
  const gaps = generateKnuthGaps(n)

  lines.push(`Knuth 增量序列: [${gaps.join(', ')}]`)
  lines.push('')

  for (const gap of gaps) {
    lines.push(`--- gap = ${gap} ---`)
    let moves = 0
    for (let i = gap; i < n; i++) {
      const temp = arr[i]
      let j = i
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap]
        j -= gap
        moves++
      }
      arr[j] = temp
    }
    lines.push(`  排序后: [${arr.join(', ')}]  (移动 ${moves} 次)`)
  }

  lines.push('')
  lines.push(`排序结果: [${arr.join(', ')}]`)
}

// 使用指定增量序列的希尔排序
function shellSortWithGaps(arr: number[], gaps: number[], lines: string[]): void {
  const n = arr.length

  lines.push(`增量序列: [${gaps.join(', ')}]`)
  lines.push('')

  for (const gap of gaps) {
    if (gap === 0) continue
    lines.push(`--- gap = ${gap} ---`)
    for (let i = gap; i < n; i++) {
      const temp = arr[i]
      let j = i
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap]
        j -= gap
      }
      arr[j] = temp
    }
    lines.push(`  排序后: [${arr.join(', ')}]`)
  }

  lines.push('')
  lines.push(`排序结果: [${arr.join(', ')}]`)
}

// 统计操作次数
function countShellOps(
  arr: number[],
  seqType: 'shell' | 'knuth' | 'sedgewick'
): { comparisons: number; moves: number } {
  const n = arr.length
  let gaps: number[]

  switch (seqType) {
    case 'shell':
      gaps = generateShellGaps(n)
      break
    case 'knuth':
      gaps = generateKnuthGaps(n)
      break
    case 'sedgewick':
      gaps = generateSedgewickGaps(n)
      break
  }

  let comparisons = 0
  let moves = 0

  for (const gap of gaps) {
    if (gap === 0) continue
    for (let i = gap; i < n; i++) {
      const temp = arr[i]
      let j = i
      while (j >= gap) {
        comparisons++
        if (arr[j - gap] > temp) {
          arr[j] = arr[j - gap]
          moves++
          j -= gap
        } else {
          break
        }
      }
      arr[j] = temp
    }
  }

  return { comparisons, moves }
}
