export default function sparseTableDemo(): string {
  const output: string[] = []

  output.push('=== 稀疏表（ST表）演示 ===\n')

  // 原始数组
  const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]
  const n = arr.length
  const logN = Math.floor(Math.log2(n))

  output.push(`原始数组: [${arr.join(', ')}]`)
  output.push(`数组长度: n = ${n}, log2(n) ≈ ${Math.log2(n).toFixed(2)}\n`)

  // 预处理
  output.push('--- 预处理阶段 ---')
  output.push('构建 st[i][k] = 从位置 i 开始，长度为 2^k 的区间的最大值\n')

  // st[i][k]
  const st: number[][] = Array.from({ length: n }, () => Array(logN + 1).fill(0))

  // 初始化 k=0
  for (let i = 0; i < n; i++) {
    st[i][0] = arr[i]
  }
  output.push('k = 0 (长度 1):')
  output.push(`  st[i][0] = [${st.map(row => row[0]).join(', ')}]`)
  output.push('  (即数组本身)\n')

  // 递推
  for (let k = 1; k <= logN; k++) {
    const len = 1 << k
    const halfLen = 1 << (k - 1)
    for (let i = 0; i + len - 1 < n; i++) {
      st[i][k] = Math.max(st[i][k - 1], st[i + halfLen][k - 1])
    }
    const validCount = n - len + 1
    if (validCount > 0 && validCount <= 6) {
      output.push(`k = ${k} (长度 ${len}):`)
      const values = []
      for (let i = 0; i + len - 1 < n; i++) {
        values.push(st[i][k])
      }
      output.push(`  st[i][${k}] = [${values.join(', ')}]`)
      output.push(`  公式: st[i][${k}] = max(st[i][${k - 1}], st[i + ${halfLen}][${k - 1}])\n`)
    }
  }

  output.push('预处理完成！时间复杂度: O(n log n)\n')

  // 查询演示
  output.push('--- 查询演示 ---')
  output.push('查询 [l, r] 区间最大值:\n')

  const queries: [number, number][] = [[0, 3], [2, 7], [4, 9], [1, 5]]

  for (const [l, r] of queries) {
    const len = r - l + 1
    const k = Math.floor(Math.log2(len))
    const halfLen = 1 << k

    const leftMax = st[l][k]
    const rightMax = st[r - halfLen + 1][k]
    const result = Math.max(leftMax, rightMax)

    output.push(`查询 [${l}, ${r}] (长度 ${len}):`)
    output.push(`  k = floor(log2(${len})) = ${k}`)
    output.push(`  左半: st[${l}][${k}] = max([${l}, ${l + halfLen - 1}]) = ${leftMax}`)
    output.push(`  右半: st[${r - halfLen + 1}][${k}] = max([${r - halfLen + 1}, ${r}]) = ${rightMax}`)
    output.push(`  结果: max(${leftMax}, ${rightMax}) = ${result}`)
    output.push(`  验证: max([${arr.slice(l, r + 1).join(', ')}]) = ${Math.max(...arr.slice(l, r + 1))}\n`)
  }

  // 复杂度总结
  output.push('--- 复杂度总结 ---')
  output.push('预处理: O(n log n) 时间, O(n log n) 空间')
  output.push('查询:   O(1) 时间')
  output.push('修改:   不支持（需要重新预处理）\n')

  output.push('--- ST表 vs 线段树 ---')
  output.push('ST表:   预处理 O(n log n), 查询 O(1), 不支持修改')
  output.push('线段树: 预处理 O(n),       查询 O(log n), 支持修改')
  output.push('选择建议: 纯查询场景用 ST 表, 需要修改用线段树\n')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
