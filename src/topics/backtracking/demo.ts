export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 回溯 (Backtracking) 演示 ===')
  lines.push('')

  // --- 1. N 皇后问题（逐步展示） ---
  lines.push('【1】N 皇后问题 —— 8 皇后求解过程')
  lines.push('─────────────────────────────────────────')

  const n = 8
  const board: number[] = new Array(n).fill(-1)
  let placeCount = 0
  let backtrackCount = 0
  const solutions: number[][] = []

  function isSafe(row: number, col: number): boolean {
    for (let i = 0; i < row; i++) {
      if (board[i] === col) return false
      if (Math.abs(board[i] - col) === Math.abs(i - row)) return false
    }
    return true
  }

  function solveNQueens(row: number): void {
    if (row === n) {
      solutions.push([...board])
      return
    }
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row] = col
        placeCount++
        solveNQueens(row + 1)
        board[row] = -1
      } else {
        backtrackCount++
      }
    }
  }

  solveNQueens(0)
  lines.push(`棋盘大小: ${n}×${n}`)
  lines.push(`共找到 ${solutions.length} 组解`)
  lines.push(`皇后放置次数: ${placeCount}`)
  lines.push(`冲突剪枝次数: ${backtrackCount}`)
  lines.push('')
  lines.push('第一组解（Q 表示皇后）:')
  if (solutions.length > 0) {
    const sol = solutions[0]
    lines.push('  ' + Array.from({ length: n }, (_, i) => i).join(' '))
    lines.push('  ' + '-'.repeat(n * 2 - 1))
    for (let row = 0; row < n; row++) {
      const line = Array.from({ length: n }, (_, col) =>
        sol[row] === col ? 'Q' : '.'
      ).join(' ')
      lines.push(`  ${line} |${row}`)
    }
  }
  lines.push('')

  // --- 2. 子集生成 ---
  lines.push('【2】子集生成 —— [1, 2, 3] 的所有子集')
  lines.push('─────────────────────────────────────────')

  const nums = [1, 2, 3]
  const subsets: number[][] = []

  function generateSubsets(start: number, path: number[]): void {
    subsets.push([...path])
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])
      generateSubsets(i + 1, path)
      path.pop()
    }
  }

  generateSubsets(0, [])
  lines.push(`输入: [${nums.join(', ')}]`)
  lines.push(`共 ${subsets.length} 个子集:`)
  for (const subset of subsets) {
    lines.push(`  [${subset.join(', ')}]`)
  }
  lines.push('')

  // 子集和问题
  lines.push('子集和问题 —— 找出和为目标值的子集:')
  const numsForSum = [2, 3, 6, 7]
  const targetSum = 9
  const sumSubsets: number[][] = []

  function subsetSum(start: number, path: number[], sum: number): void {
    if (sum === targetSum) {
      sumSubsets.push([...path])
      return
    }
    if (sum > targetSum) return  // 剪枝
    for (let i = start; i < numsForSum.length; i++) {
      path.push(numsForSum[i])
      subsetSum(i + 1, path, sum + numsForSum[i])
      path.pop()
    }
  }

  subsetSum(0, [], 0)
  lines.push(`输入: [${numsForSum.join(', ')}], 目标和: ${targetSum}`)
  lines.push(`找到 ${sumSubsets.length} 个子集:`)
  for (const subset of sumSubsets) {
    lines.push(`  [${subset.join(', ')}] = ${subset.reduce((a, b) => a + b, 0)}`)
  }
  lines.push('')

  // --- 3. 全排列生成 ---
  lines.push('【3】全排列生成 —— [1, 2, 3] 的所有排列')
  lines.push('─────────────────────────────────────────')

  const permNums = [1, 2, 3]
  const permutations: number[][] = []
  let permSteps = 0

  function permute(path: number[], used: boolean[]): void {
    permSteps++
    if (path.length === permNums.length) {
      permutations.push([...path])
      return
    }
    for (let i = 0; i < permNums.length; i++) {
      if (used[i]) continue
      used[i] = true
      path.push(permNums[i])
      permute(path, used)
      path.pop()
      used[i] = false
    }
  }

  permute([], new Array(permNums.length).fill(false))
  lines.push(`输入: [${permNums.join(', ')}]`)
  lines.push(`共 ${permutations.length} 个排列（递归调用 ${permSteps} 次）:`)
  for (const perm of permutations) {
    lines.push(`  [${perm.join(', ')}]`)
  }
  lines.push('')

  // --- 4. 数独求解器 ---
  lines.push('【4】数独求解器')
  lines.push('─────────────────────────────────────────')

  const sudokuBoard: number[][] = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ]

  let sudokuBacktracks = 0

  function isSudokuValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false
      if (board[i][col] === num) return false
      const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3)
      const boxCol = 3 * Math.floor(col / 3) + (i % 3)
      if (board[boxRow][boxCol] === num) return false
    }
    return true
  }

  function solveSudoku(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (sudokuBoard[row][col] !== 0) continue
        for (let num = 1; num <= 9; num++) {
          if (isSudokuValid(sudokuBoard, row, col, num)) {
            sudokuBoard[row][col] = num
            if (solveSudoku()) return true
            sudokuBoard[row][col] = 0
          } else {
            sudokuBacktracks++
          }
        }
        return false
      }
    }
    return true
  }

  function printSudoku(board: number[][]): void {
    for (let row = 0; row < 9; row++) {
      const line = board[row].map((v, col) => {
        const separator = (col + 1) % 3 === 0 && col < 8 ? '|' : ' '
        return (v === 0 ? '.' : v.toString()) + separator
      }).join('')
      lines.push(`  ${line}`)
      if ((row + 1) % 3 === 0 && row < 8) {
        lines.push('  ' + '-'.repeat(20))
      }
    }
  }

  lines.push('题目:')
  printSudoku(sudokuBoard)
  lines.push('')

  const sudokuSolved = solveSudoku()
  lines.push(`求解${sudokuSolved ? '成功' : '失败'}（回溯 ${sudokuBacktracks} 次）:`)
  if (sudokuSolved) {
    printSudoku(sudokuBoard)
  }
  lines.push('')

  // --- 5. 组合总和 ---
  lines.push('【5】组合总和 —— 从 [2,3,6,7] 中找出和为 7 的组合（元素可重复使用）')
  lines.push('─────────────────────────────────────────')

  const candidates = [2, 3, 6, 7]
  const target = 7
  const comboResults: number[][] = []

  function combinationSum(start: number, path: number[], remaining: number): void {
    if (remaining === 0) {
      comboResults.push([...path])
      return
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) continue  // 剪枝
      path.push(candidates[i])
      combinationSum(i, path, remaining - candidates[i])  // i 不是 i+1，允许重复
      path.pop()
    }
  }

  combinationSum(0, [], target)
  lines.push(`候选: [${candidates.join(', ')}], 目标: ${target}`)
  lines.push(`找到 ${comboResults.length} 个组合:`)
  for (const combo of comboResults) {
    lines.push(`  [${combo.join(', ')}] = ${combo.reduce((a, b) => a + b, 0)}`)
  }
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}
