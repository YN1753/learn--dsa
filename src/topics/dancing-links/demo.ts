// Dancing Links (DLX) Demo
// Demonstrates solving a small exact cover problem

interface DLXNode {
  left: DLXNode
  right: DLXNode
  up: DLXNode
  down: DLXNode
  column: ColumnHeader
  rowId: number
}

interface ColumnHeader extends DLXNode {
  size: number
  name: string
}

function createColumnHeader(name: string): ColumnHeader {
  const col: ColumnHeader = {
    left: null as unknown as DLXNode,
    right: null as unknown as DLXNode,
    up: null as unknown as DLXNode,
    down: null as unknown as DLXNode,
    column: null as unknown as ColumnHeader,
    size: 0,
    name,
    rowId: -1,
  }
  col.left = col
  col.right = col
  col.up = col
  col.down = col
  col.column = col
  return col
}

function cover(col: ColumnHeader): void {
  col.right.left = col.left
  col.left.right = col.right
  for (let row = col.down; row !== col; row = row.down) {
    for (let node = row.right; node !== row; node = node.right) {
      node.down.up = node.up
      node.up.down = node.down
      node.column.size--
    }
  }
}

function uncover(col: ColumnHeader): void {
  for (let row = col.up; row !== col; row = row.up) {
    for (let node = row.left; node !== row; node = node.left) {
      node.column.size++
      node.down.up = node
      node.up.down = node
    }
  }
  col.right.left = col
  col.left.right = col
}

function buildDLX(matrix: number[][], colNames: string[]): {
  header: ColumnHeader
  columns: ColumnHeader[]
  rowNodes: DLXNode[][]
} {
  const header = createColumnHeader('H')
  const columns: ColumnHeader[] = []
  const rowNodes: DLXNode[][] = []

  // Create column headers
  let prev: DLXNode = header
  for (const name of colNames) {
    const col = createColumnHeader(name)
    col.left = prev
    col.right = header
    prev.right = col
    header.left = col
    columns.push(col)
    prev = col
  }

  // Create nodes for each 1 in the matrix
  for (let r = 0; r < matrix.length; r++) {
    const nodesInRow: DLXNode[] = []
    let firstInRow: DLXNode | null = null

    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        const col = columns[c]
        const node: DLXNode = {
          left: null as unknown as DLXNode,
          right: null as unknown as DLXNode,
          up: col.up,
          down: col,
          column: col,
          rowId: r,
        }
        node.up.down = node
        col.up = node
        col.size++

        if (!firstInRow) {
          firstInRow = node
          node.left = node
          node.right = node
        } else {
          node.left = firstInRow.left
          node.right = firstInRow
          firstInRow.left.right = node
          firstInRow.left = node
        }
        nodesInRow.push(node)
      }
    }
    rowNodes.push(nodesInRow)
  }

  return { header, columns, rowNodes }
}

function solve(
  header: ColumnHeader,
  solution: number[],
  allSolutions: number[][],
  maxSolutions: number = 10
): void {
  if (allSolutions.length >= maxSolutions) return

  // Check if matrix is empty (all columns covered)
  if (header.right === header) {
    allSolutions.push([...solution])
    return
  }

  // Choose column with minimum size (MRV heuristic)
  let bestCol = header.right as ColumnHeader
  let minSize = bestCol.size
  for (let col = bestCol.right as ColumnHeader; col !== header; col = col.right as ColumnHeader) {
    if (col.size < minSize) {
      bestCol = col
      minSize = col.size
    }
  }

  if (minSize === 0) return // No solution possible

  // Cover chosen column
  cover(bestCol)

  // Try each row in this column
  for (let row = bestCol.down; row !== bestCol; row = row.down) {
    solution.push(row.rowId)

    // Cover all other columns in this row
    for (let node = row.right; node !== row; node = node.right) {
      cover(node.column)
    }

    solve(header, solution, allSolutions, maxSolutions)

    // Uncover in reverse order
    for (let node = row.left; node !== row; node = node.left) {
      uncover(node.column)
    }

    solution.pop()
  }

  uncover(bestCol)
}

export default function dlxDemo(): string {
  const output: string[] = []

  output.push('=== 舞蹈链 (DLX) 精确覆盖演示 ===\n')

  // Define a small exact cover problem
  //     C0 C1 C2 C3 C4 C5 C6
  // R0:  1  0  0  1  0  0  1
  // R1:  1  0  0  1  0  0  0
  // R2:  0  0  0  1  1  0  1
  // R3:  0  0  1  0  1  1  0
  // R4:  0  1  1  0  0  1  1
  // R5:  0  1  0  0  0  0  1

  const matrix = [
    [1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 1],
    [0, 0, 1, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1],
    [0, 1, 0, 0, 0, 0, 1],
  ]
  const colNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  output.push('输入矩阵:')
  output.push('     ' + colNames.join('  '))
  for (let i = 0; i < matrix.length; i++) {
    output.push(`R${i}:  ${matrix[i].join('  ')}`)
  }
  output.push('')

  // Build DLX structure
  const { header } = buildDLX(matrix, colNames)

  // Solve
  const solutions: number[][] = []
  solve(header, [], solutions)

  output.push(`找到 ${solutions.length} 个精确覆盖解:\n`)

  for (let i = 0; i < solutions.length; i++) {
    const sol = solutions[i]
    output.push(`解 ${i + 1}: 选择行 R${sol.join(', R')}`)

    // Verify the solution
    const covered = new Array(7).fill(0)
    for (const rowIdx of sol) {
      for (let c = 0; c < 7; c++) {
        covered[c] += matrix[rowIdx][c]
      }
    }
    output.push(`  覆盖验证: [${covered.join(', ')}] (应全为1)`)

    // Show which rows were selected
    for (const rowIdx of sol) {
      output.push(`  R${rowIdx}: [${matrix[rowIdx].join(', ')}]`)
    }
    output.push('')
  }

  // Complexity analysis
  output.push('--- 算法分析 ---')
  output.push(`矩阵大小: ${matrix.length} 行 x ${colNames.length} 列`)
  output.push(`1 的总数: ${matrix.flat().reduce((a, b) => a + b, 0)}`)
  output.push(`精确覆盖解数: ${solutions.length}`)
  output.push('')
  output.push('DLX 的核心优势:')
  output.push('  - 覆盖/取消覆盖操作: O(1) per node')
  output.push('  - 列选择启发式 (MRV): 减少搜索分支')
  output.push('  - 十字双向链表: 支持高效的插入和删除')
  output.push('  - 回溯时完美恢复: 通过逆序 uncover 操作')
  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
