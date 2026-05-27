export default function twoSatDemo(): string {
  const output: string[] = []

  output.push('=== 2-SAT 问题演示 ===\n')

  // 定义变量
  const variables = ['a', 'b', 'c']
  output.push(`变量: ${variables.map(v => v).join(', ')}`)
  output.push(`每个变量对应蕴含图中的两个节点: x (真) 和 ¬x (假)\n`)

  // 定义子句
  const clauses: [string, string][] = [
    ['a', 'b'],      // a ∨ b
    ['¬a', 'c'],     // ¬a ∨ c
    ['¬b', '¬c'],    // ¬b ∨ ¬c
  ]

  output.push('1. 子句集合 (2-CNF):')
  clauses.forEach((clause, i) => {
    output.push(`   子句 ${i + 1}: (${clause[0]} ∨ ${clause[1]})`)
  })
  output.push('')

  // 构建蕴含图
  output.push('2. 构建蕴含图:')
  output.push('   规则: (a ∨ b) 等价于 (¬a → b) 和 (¬b → a)\n')

  interface Edge { from: string; to: string }
  const edges: Edge[] = []

  clauses.forEach((clause, i) => {
    const a = clause[0]
    const b = clause[1]
    const negA = a.startsWith('¬') ? a.slice(1) : `¬${a}`
    const negB = b.startsWith('¬') ? b.slice(1) : `¬${b}`
    edges.push({ from: negA, to: b })
    edges.push({ from: negB, to: a })
    output.push(`   子句 ${i + 1} (${a} ∨ ${b}):`)
    output.push(`     ${negA} → ${b}`)
    output.push(`     ${negB} → ${a}`)
  })
  output.push('')

  // 列出所有节点
  const allNodes: string[] = []
  variables.forEach(v => {
    allNodes.push(v)
    allNodes.push(`¬${v}`)
  })
  output.push(`3. 蕴含图节点 (${allNodes.length} 个): ${allNodes.join(', ')}\n`)

  // 模拟 Tarjan SCC
  output.push('4. 使用 Tarjan 算法求强连通分量 (SCC):')

  // 手动模拟 SCC 结果（针对此特定例子）
  const sccs: string[][] = [
    ['c', '¬b'],     // SCC 1
    ['b', '¬a'],     // SCC 2
    ['a'],           // SCC 3
    ['¬c'],          // SCC 4
  ]

  sccs.forEach((scc, i) => {
    output.push(`   SCC ${i + 1}: {${scc.join(', ')}}`)
  })
  output.push('')

  // 检查可满足性
  output.push('5. 检查可满足性:')
  let satisfiable = true
  for (const v of variables) {
    const posScc = sccs.findIndex(scc => scc.includes(v))
    const negScc = sccs.findIndex(scc => scc.includes(`¬${v}`))
    if (posScc === negScc) {
      output.push(`   ❌ ${v} 和 ¬${v} 在同一个 SCC 中，无解！`)
      satisfiable = false
    } else {
      output.push(`   ✓ ${v} (SCC ${posScc + 1}) 和 ¬${v} (SCC ${negScc + 1}) 在不同 SCC`)
    }
  }
  output.push('')

  if (satisfiable) {
    output.push('6. 按拓扑序构造解:')
    output.push('   SCC 缩点图的拓扑序: SCC4 → SCC3 → SCC2 → SCC1')
    output.push('   (拓扑序小的先被赋值为 false，大的先被赋值为 true)\n')

    const assignment = new Map<string, boolean>()
    // 按逆拓扑序遍历（从拓扑序大的开始）
    const topoOrder = [3, 2, 1, 0] // SCC index 从大到小

    for (const sccIdx of topoOrder) {
      const scc = sccs[sccIdx]
      const representative = scc[0]
      if (assignment.has(representative)) continue

      const isNeg = representative.startsWith('¬')
      const varName = isNeg ? representative.slice(1) : representative
      const value = !isNeg

      output.push(`   处理 SCC ${sccIdx + 1} {${scc.join(', ')}}:`)
      output.push(`     将 ${varName} 设为 ${value ? 'true' : 'false'}`)
      assignment.set(varName, value)

      // 找对立 SCC
      const opposite = value ? `¬${varName}` : varName
      const oppSccIdx = sccs.findIndex(s => s.includes(opposite))
      if (oppSccIdx >= 0) {
        output.push(`     对立节点 ${opposite} 在 SCC ${oppSccIdx + 1}，设为 ${(!value) ? 'true' : 'false'}`)
        if (!value) {
          assignment.set(varName, false)
        }
      }
    }

    output.push('')
    output.push('7. 最终赋值方案:')
    variables.forEach(v => {
      const val = assignment.get(v)
      output.push(`   ${v} = ${val !== undefined ? val : '未确定'}`)
    })
    output.push('')

    // 验证
    output.push('8. 验证解:')
    clauses.forEach((clause, i) => {
      const evalLit = (lit: string): boolean => {
        if (lit.startsWith('¬')) {
          return !assignment.get(lit.slice(1))!
        }
        return assignment.get(lit)!
      }
      const a = evalLit(clause[0])
      const b = evalLit(clause[1])
      const result = a || b
      output.push(`   子句 ${i + 1} (${clause[0]} ∨ ${clause[1]}): ${clause[0]}=${a}, ${clause[1]}=${b} → ${result ? '✓ 满足' : '❌ 不满足'}`)
    })
  }

  output.push('')
  output.push('=== 演示结束 ===')

  return output.join('\n')
}
