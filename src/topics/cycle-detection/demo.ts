export default function cycleDetectionDemo(): string {
  const output: string[] = []

  output.push('=== 环检测算法演示 ===\n')

  // 1. 有向图DFS三色标记
  output.push('1. 有向图 - DFS三色标记法检测环\n')
  output.push('   图结构: 0->1, 1->2, 2->0 (存在环)\n')

  const adjList: number[][] = [[1], [2], [0]]
  const colors = new Map<number, string>()
  const colorNames = ['白色(未访问)', '灰色(访问中)', '黑色(已完成)']
  const WHITE = 'white', GRAY = 'gray', BLACK = 'black'
  let hasCycle = false

  adjList.forEach((_, i) => colors.set(i, WHITE))

  function dfsThreeColor(node: number, path: number[]): void {
    colors.set(node, GRAY)
    path.push(node)
    output.push(`   访问节点 ${node}，标记为灰色，路径: [${path.join(' -> ')}]`)

    for (const neighbor of adjList[node]) {
      const neighborColor = colors.get(neighbor)
      if (neighborColor === GRAY) {
        output.push(`   -> 邻居 ${neighbor} 为灰色，发现回边！存在环！`)
        hasCycle = true
        return
      }
      if (neighborColor === WHITE) {
        output.push(`   -> 邻居 ${neighbor} 为白色，继续DFS`)
        dfsThreeColor(neighbor, path)
        if (hasCycle) return
      } else {
        output.push(`   -> 邻居 ${neighbor} 为黑色，跳过`)
      }
    }

    colors.set(node, BLACK)
    path.pop()
    output.push(`   节点 ${node} 处理完成，标记为黑色`)
  }

  dfsThreeColor(0, [])
  output.push(`   结果: ${hasCycle ? '图中存在环' : '图中无环'}\n`)

  // 2. 无向图DFS检测环
  output.push('2. 无向图 - DFS检测环\n')
  output.push('   图结构: 0-1, 1-2, 2-0 (存在环)\n')

  const undirectedAdj: number[][] = [[1, 2], [0, 2], [0, 1]]
  const visited = new Set<number>()
  let undirectedCycle = false

  function dfsUndirected(node: number, parent: number): boolean {
    visited.add(node)
    output.push(`   访问节点 ${node}，父节点为 ${parent}`)

    for (const neighbor of undirectedAdj[node]) {
      if (!visited.has(neighbor)) {
        output.push(`   -> 邻居 ${neighbor} 未访问，继续DFS`)
        if (dfsUndirected(neighbor, node)) return true
      } else if (neighbor !== parent) {
        output.push(`   -> 邻居 ${neighbor} 已访问且不是父节点，发现环！`)
        return true
      } else {
        output.push(`   -> 邻居 ${neighbor} 是父节点，跳过`)
      }
    }
    return false
  }

  undirectedCycle = dfsUndirected(0, -1)
  output.push(`   结果: ${undirectedCycle ? '图中存在环' : '图中无环'}\n`)

  // 3. Floyd快慢指针检测链表环
  output.push('3. 链表 - Floyd快慢指针检测环\n')

  // 创建有环链表: 1->2->3->4->2 (环)
  interface LLNode {
    val: number
    next: LLNode | null
  }

  const node1: LLNode = { val: 1, next: null }
  const node2: LLNode = { val: 2, next: null }
  const node3: LLNode = { val: 3, next: null }
  const node4: LLNode = { val: 4, next: null }
  node1.next = node2
  node2.next = node3
  node3.next = node4
  node4.next = node2  // 形成环

  output.push('   链表: 1->2->3->4->2->3->... (有环)\n')

  let slow: LLNode | null = node1
  let fast: LLNode | null = node1
  let step = 0
  let floydCycle = false

  while (fast !== null && fast.next !== null) {
    slow = slow!.next
    fast = fast.next.next
    step++
    output.push(`   步骤${step}: 慢指针=节点${slow!.val}, 快指针=节点${fast.val}`)
    if (slow === fast) {
      output.push(`   -> 快慢指针相遇于节点${slow!.val}，存在环！`)
      floydCycle = true
      break
    }
  }

  if (!floydCycle) {
    output.push('   快指针到达null，无环')
  }
  output.push('')

  // 4. 拓扑排序检测环
  output.push('4. 有向图 - 拓扑排序检测环\n')
  output.push('   图结构: 0->1, 1->2, 2->3, 3->1 (存在环)\n')

  const topoAdj: number[][] = [[1], [2], [3], [1]]
  const inDegree = [0, 0, 0, 0]
  for (const neighbors of topoAdj) {
    for (const n of neighbors) {
      inDegree[n]++
    }
  }
  output.push(`   入度: [${inDegree.join(', ')}]`)

  const queue: number[] = []
  for (let i = 0; i < inDegree.length; i++) {
    if (inDegree[i] === 0) queue.push(i)
  }
  output.push(`   初始入度为0的节点: [${queue.join(', ')}]`)

  let sorted = 0
  while (queue.length > 0) {
    const node = queue.shift()!
    sorted++
    output.push(`   取出节点 ${node}，处理其邻居`)
    for (const neighbor of topoAdj[node]) {
      inDegree[neighbor]--
      output.push(`   -> 节点 ${neighbor} 入度减为 ${inDegree[neighbor]}`)
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
        output.push(`   -> 节点 ${neighbor} 入度为0，加入队列`)
      }
    }
  }

  if (sorted < topoAdj.length) {
    output.push(`   排序了 ${sorted} 个节点，共 ${topoAdj.length} 个，存在环！`)
  } else {
    output.push(`   所有节点排序完成，无环`)
  }

  output.push('\n=== 演示结束 ===')

  return output.join('\n')
}
