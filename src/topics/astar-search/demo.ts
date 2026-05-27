interface Pos {
  row: number
  col: number
}

interface AStarNode {
  pos: Pos
  g: number
  h: number
  f: number
  parent: AStarNode | null
}

export default function astarSearchDemo(): string {
  const result: string[] = []

  // 7x7 网格，0=可通行，1=障碍物
  const grid: number[][] = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ]

  const ROWS = grid.length
  const COLS = grid[0].length
  const start: Pos = { row: 0, col: 0 }
  const goal: Pos = { row: 6, col: 6 }

  result.push("=== A* 搜索算法演示 ===\n")

  // 显示网格
  result.push("网格地图 (S=起点, G=目标, #=障碍, .=可通行):")
  for (let r = 0; r < ROWS; r++) {
    let row = "  "
    for (let c = 0; c < COLS; c++) {
      if (r === start.row && c === start.col) row += "S "
      else if (r === goal.row && c === goal.col) row += "G "
      else if (grid[r][c] === 1) row += "# "
      else row += ". "
    }
    result.push(row)
  }
  result.push(`\n起点: (${start.row}, ${start.col})`)
  result.push(`目标: (${goal.row}, ${goal.col})`)
  result.push(`启发式函数: 曼哈顿距离 h(n) = |r1-r2| + |c1-c2|\n`)

  // 曼哈顿距离
  function heuristic(a: Pos, b: Pos): number {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
  }

  // 四个方向：上、下、左、右
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ]

  // 简单的最小堆
  class MinHeap {
    private data: AStarNode[] = []

    get size(): number { return this.data.length }

    push(node: AStarNode): void {
      this.data.push(node)
      this.bubbleUp(this.data.length - 1)
    }

    pop(): AStarNode | undefined {
      if (this.data.length === 0) return undefined
      const top = this.data[0]
      const last = this.data.pop()!
      if (this.data.length > 0) {
        this.data[0] = last
        this.sinkDown(0)
      }
      return top
    }

    contains(pos: Pos): boolean {
      return this.data.some(n => n.pos.row === pos.row && n.pos.col === pos.col)
    }

    get(pos: Pos): AStarNode | undefined {
      return this.data.find(n => n.pos.row === pos.row && n.pos.col === pos.col)
    }

    update(pos: Pos, newNode: AStarNode): void {
      const idx = this.data.findIndex(n => n.pos.row === pos.row && n.pos.col === pos.col)
      if (idx !== -1) {
        this.data[idx] = newNode
        this.bubbleUp(idx)
      }
    }

    private bubbleUp(i: number): void {
      while (i > 0) {
        const parent = Math.floor((i - 1) / 2)
        if (this.data[i].f < this.data[parent].f) {
          [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]]
          i = parent
        } else break
      }
    }

    private sinkDown(i: number): void {
      const n = this.data.length
      while (true) {
        let smallest = i
        const left = 2 * i + 1
        const right = 2 * i + 2
        if (left < n && this.data[left].f < this.data[smallest].f) smallest = left
        if (right < n && this.data[right].f < this.data[smallest].f) smallest = right
        if (smallest !== i) {
          [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]]
          i = smallest
        } else break
      }
    }
  }

  // A* 主算法
  const openList = new MinHeap()
  const closedSet = new Set<string>()
  const posKey = (p: Pos) => `${p.row},${p.col}`

  const startH = heuristic(start, goal)
  const startNode: AStarNode = { pos: start, g: 0, h: startH, f: startH, parent: null }
  openList.push(startNode)

  let step = 0
  let found = false
  let finalPath: Pos[] = []

  result.push("=== A* 搜索过程 ===\n")

  while (openList.size > 0) {
    const current = openList.pop()!
    step++

    result.push(`步骤 ${step}: 扩展 (${current.pos.row},${current.pos.col})  g=${current.g}  h=${current.h}  f=${current.f}`)

    // 检查是否到达目标
    if (current.pos.row === goal.row && current.pos.col === goal.col) {
      result.push(`  -> 到达目标! 最短路径长度 = ${current.g}`)
      found = true

      // 重建路径
      let node: AStarNode | null = current
      while (node) {
        finalPath.unshift(node.pos)
        node = node.parent
      }
      break
    }

    closedSet.add(posKey(current.pos))

    // 扩展邻居
    const neighbors: AStarNode[] = []
    for (const dir of directions) {
      const nr = current.pos.row + dir.dr
      const nc = current.pos.col + dir.dc

      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue
      if (grid[nr][nc] === 1) continue  // 障碍物
      if (closedSet.has(posKey({ row: nr, col: nc }))) continue

      const newG = current.g + 1
      const h = heuristic({ row: nr, col: nc }, goal)
      const newF = newG + h

      if (openList.contains({ row: nr, col: nc })) {
        const existing = openList.get({ row: nr, col: nc })!
        if (newG < existing.g) {
          const updated: AStarNode = { pos: { row: nr, col: nc }, g: newG, h, f: newF, parent: current }
          openList.update({ row: nr, col: nc }, updated)
          neighbors.push(updated)
        }
      } else {
        const neighbor: AStarNode = { pos: { row: nr, col: nc }, g: newG, h, f: newF, parent: current }
        openList.push(neighbor)
        neighbors.push(neighbor)
      }
    }

    if (neighbors.length > 0) {
      result.push(`  邻居: ${neighbors.map(n => `(${n.pos.row},${n.pos.col}) f=${n.f}`).join(', ')}`)
    }
    result.push(`  开放列表大小: ${openList.size}, 关闭列表大小: ${closedSet.size}`)
    result.push("")
  }

  if (!found) {
    result.push("未找到路径!")
  }

  // 显示最终路径
  result.push("\n=== 最终路径 ===\n")
  if (found) {
    result.push(`路径: ${finalPath.map(p => `(${p.row},${p.col})`).join(' -> ')}`)
    result.push(`路径长度: ${finalPath.length - 1} 步\n`)

    // 在网格上显示路径
    result.push("路径可视化 (*=路径):")
    const pathSet = new Set(finalPath.map(p => posKey(p)))
    for (let r = 0; r < ROWS; r++) {
      let row = "  "
      for (let c = 0; c < COLS; c++) {
        if (r === start.row && c === start.col) row += "S "
        else if (r === goal.row && c === goal.col) row += "G "
        else if (grid[r][c] === 1) row += "# "
        else if (pathSet.has(posKey({ row: r, col: c }))) row += "* "
        else row += ". "
      }
      result.push(row)
    }
  }

  // 统计信息
  result.push("\n=== 算法统计 ===\n")
  result.push(`  网格大小: ${ROWS}×${COLS}`)
  result.push(`  总步数: ${step}`)
  result.push(`  启发式函数: 曼哈顿距离`)
  result.push(`  空间复杂度: O(V), V = 可达节点数`)
  result.push(`  时间复杂度: O(b^d), b=分支因子, d=解的深度`)

  return result.join('\n')
}
