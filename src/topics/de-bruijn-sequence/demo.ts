function deBruijn(k: number, n: number): number[] {
  const kPow = Math.pow(k, n - 1)
  const edges: number[] = new Array(kPow).fill(0)
  const sequence: number[] = []

  function dfs(node: number): void {
    while (edges[node] < k) {
      const edge = edges[node]
      edges[node]++
      dfs((node * k + edge) % kPow)
      sequence.push(edge)
    }
  }

  dfs(0)
  sequence.reverse()
  return sequence
}

function allTuples(k: number, n: number): string[] {
  if (n === 0) return ['']
  const result: string[] = []
  const prev = allTuples(k, n - 1)
  for (const p of prev) {
    for (let d = 0; d < k; d++) {
      result.push(p + d)
    }
  }
  return result
}

export default function deBruijnDemo(): string {
  const output: string[] = []

  output.push('=== De Bruijn序列演示 ===\n')

  // B(2,3)
  output.push('1. 构造B(2,3) - 二进制De Bruijn序列，覆盖所有3位二进制串')
  const seq23 = deBruijn(2, 3)
  const seqStr23 = seq23.join('')
  output.push(`   序列: ${seqStr23} (长度: ${seqStr23.length})`)
  output.push('')

  output.push('   验证 - 所有3位二进制子串:')
  const covered = new Set<string>()
  for (let i = 0; i < seqStr23.length; i++) {
    const sub = seqStr23.substring(i, i + 3 > seqStr23.length ? seqStr23.length : i + 3)
    const circSub = (i + 3 > seqStr23.length)
      ? seqStr23.substring(i) + seqStr23.substring(0, 3 - (seqStr23.length - i))
      : sub
    covered.add(circSub)
    output.push(`   位置${i}: ${circSub}`)
  }
  output.push(`   总共覆盖 ${covered.size} 个不同的子串 (应为 ${Math.pow(2, 3)} 个)`)
  output.push('')

  // B(2,4)
  output.push('2. 构造B(2,4) - 覆盖所有4位二进制串')
  const seq24 = deBruijn(2, 4)
  const seqStr24 = seq24.join('')
  output.push(`   序列: ${seqStr24} (长度: ${seqStr24.length})`)
  output.push(`   应覆盖 ${Math.pow(2, 4)} 个不同的4位二进制串`)
  output.push('')

  // B(3,2)
  output.push('3. 构造B(3,2) - 三进制De Bruijn序列，覆盖所有2位三进制串')
  const seq32 = deBruijn(3, 2)
  const seqStr32 = seq32.join('')
  output.push(`   序列: ${seqStr32} (长度: ${seqStr32.length})`)
  output.push('   验证 - 所有2位三进制子串:')
  const covered32 = new Set<string>()
  for (let i = 0; i < seqStr32.length; i++) {
    const end = i + 2
    let sub: string
    if (end <= seqStr32.length) {
      sub = seqStr32.substring(i, end)
    } else {
      sub = seqStr32.substring(i) + seqStr32.substring(0, end - seqStr32.length)
    }
    covered32.add(sub)
  }
  output.push(`   覆盖 ${covered32.size} 个不同子串: ${[...covered32].sort().join(', ')}`)
  output.push(`   应覆盖 ${Math.pow(3, 2)} 个不同的2位三进制串`)
  output.push('')

  // De Bruijn图结构
  output.push('4. De Bruijn图 G(2,3) 结构')
  output.push('   顶点 (n-1=2位二进制串): 00, 01, 10, 11')
  output.push('   边 (n=3位二进制串):')
  const tuples23 = allTuples(2, 3)
  for (const t of tuples23) {
    const from = t.substring(0, 2)
    const to = t.substring(1, 3)
    output.push(`   ${t}: ${from} -> ${to}`)
  }
  output.push('')

  // 欧拉回路
  output.push('5. 欧拉回路构造过程')
  output.push(`   从顶点00开始，沿边标签构建序列: ${seqStr23}`)
  output.push('   回路上的顶点序列: 00 -> 00 -> 01 -> 10 -> 01 -> 11 -> 11 -> 10 -> 00')
  output.push('   边标签序列: 0, 0, 1, 0, 1, 1, 1, 0 -> 反转 -> 0,0,0,1,0,1,1,1')
  output.push('')

  // 密码锁应用
  output.push('6. 应用示例 - 4位二进制密码锁')
  output.push('   传统暴力破解: 需要尝试 2^4 = 16 组密码，每组4位 = 64次拨号')
  output.push(`   De Bruijn方法: 只需 ${seqStr24.length + 3} 次拨号 (序列 ${seqStr24} + 回绕3位)`)
  output.push(`   效率提升: 从64次减少到${seqStr24.length + 3}次，节省 ${Math.round((1 - (seqStr24.length + 3) / 64) * 100)}%`)
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
