export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 复杂度分析 (Complexity Analysis) 演示 ===')
  lines.push('')

  // --- 1. Common complexity classes ---
  lines.push('【1】常见复杂度等级对比')
  lines.push('─────────────────────────')
  const sizes = [10, 100, 1000, 10000, 100000]
  const complexities: [string, (n: number) => number][] = [
    ['O(1)', () => 1],
    ['O(log n)', (n: number) => Math.ceil(Math.log2(n))],
    ['O(n)', (n: number) => n],
    ['O(n log n)', (n: number) => Math.ceil(n * Math.log2(n))],
    ['O(n²)', (n: number) => n * n],
  ]

  const header = '  n'.padEnd(12) + complexities.map(c => c[0].padStart(12)).join('')
  lines.push(header)
  lines.push('  ' + '-'.repeat(12 + complexities.length * 12))

  for (const n of sizes) {
    const row = `  ${n}`.padEnd(12) + complexities.map(([, fn]) => {
      const val = fn(n)
      return val > 99999999 ? '  > 10^8'.padStart(12) : val.toLocaleString().padStart(12)
    }).join('')
    lines.push(row)
  }
  lines.push('')

  // --- 2. Single loop analysis ---
  lines.push('【2】单层循环分析')
  lines.push('─────────────────────────')
  const singleLoopCode = [
    '  for (let i = 0; i < n; i++) {',
    '    console.log(i)',
    '  }',
  ]
  lines.push('  代码:')
  singleLoopCode.forEach(l => lines.push(`    ${l}`))
  lines.push('')
  lines.push('  分析: 循环从 0 到 n-1，共执行 n 次')
  lines.push('  每次循环体内操作: O(1)')
  lines.push('  总复杂度: n × O(1) = O(n)')
  lines.push('')

  // --- 3. Nested loop analysis ---
  lines.push('【3】嵌套循环分析')
  lines.push('─────────────────────────')
  const nestedLoopCode = [
    '  for (let i = 0; i < n; i++) {',
    '    for (let j = 0; j < n; j++) {',
    '      console.log(i, j)',
    '    }',
    '  }',
  ]
  lines.push('  代码:')
  nestedLoopCode.forEach(l => lines.push(`    ${l}`))
  lines.push('')
  lines.push('  分析: 外层循环 n 次，内层循环 n 次')
  lines.push('  总操作数: n × n = n²')
  lines.push('  总复杂度: O(n²)')
  lines.push('')

  // --- 4. Halving loop analysis ---
  lines.push('【4】减半循环分析')
  lines.push('─────────────────────────')
  const halvingLoopCode = [
    '  let i = n',
    '  while (i > 1) {',
    '    i = Math.floor(i / 2)',
    '  }',
  ]
  lines.push('  代码:')
  halvingLoopCode.forEach(l => lines.push(`    ${l}`))
  lines.push('')
  lines.push('  分析: i 的变化过程:')
  const n = 64
  let i = n
  const steps: number[] = []
  while (i > 1) {
    steps.push(i)
    i = Math.floor(i / 2)
  }
  steps.push(1)
  lines.push(`  n=${n}: ${steps.join(' → ')}`)
  lines.push(`  共 ${steps.length - 1} 次迭代 = log₂(${n}) = ${Math.log2(n)}`)
  lines.push('  总复杂度: O(log n)')
  lines.push('')

  // --- 5. Triangle loop analysis ---
  lines.push('【5】三角循环分析')
  lines.push('─────────────────────────')
  const triangleLoopCode = [
    '  for (let i = 0; i < n; i++) {',
    '    for (let j = 0; j < i; j++) {',
    '      console.log(i, j)',
    '    }',
    '  }',
  ]
  lines.push('  代码:')
  triangleLoopCode.forEach(l => lines.push(`    ${l}`))
  lines.push('')
  lines.push('  分析: 外层 i 从 0 到 n-1，内层 j 从 0 到 i-1')
  lines.push('  总操作数: 0 + 1 + 2 + ... + (n-1) = n(n-1)/2')
  lines.push('  忽略常数和低阶项: O(n²)')
  lines.push('')

  // --- 6. Real-world comparison ---
  lines.push('【6】实际运行时间对比（假设每秒 10^8 次操作）')
  lines.push('─────────────────────────')
  const opsPerSec = 1e8
  const scenarios: [string, (n: number) => number][] = [
    ['O(log n)', (n: number) => Math.log2(n)],
    ['O(n)', (n: number) => n],
    ['O(n log n)', (n: number) => n * Math.log2(n)],
    ['O(n²)', (n: number) => n * n],
  ]
  const testN = 1000000

  for (const [name, fn] of scenarios) {
    const ops = fn(testN)
    const seconds = ops / opsPerSec
    let timeStr: string
    if (seconds < 0.001) {
      timeStr = `${(seconds * 1e6).toFixed(1)} 微秒`
    } else if (seconds < 1) {
      timeStr = `${(seconds * 1000).toFixed(1)} 毫秒`
    } else if (seconds < 60) {
      timeStr = `${seconds.toFixed(2)} 秒`
    } else if (seconds < 3600) {
      timeStr = `${(seconds / 60).toFixed(1)} 分钟`
    } else if (seconds < 86400) {
      timeStr = `${(seconds / 3600).toFixed(1)} 小时`
    } else if (seconds < 86400 * 365) {
      timeStr = `${(seconds / 86400).toFixed(1)} 天`
    } else {
      timeStr = `${(seconds / (86400 * 365)).toFixed(1)} 年`
    }
    lines.push(`  ${name.padEnd(14)} n=${testN.toLocaleString()}:  ${timeStr}`)
  }
  lines.push('')

  // --- 7. Space complexity examples ---
  lines.push('【7】空间复杂度示例')
  lines.push('─────────────────────────')

  lines.push('  O(1) 空间 — 只用固定变量:')
  lines.push('    function sum(arr: number[]): number {')
  lines.push('      let total = 0')
  lines.push('      for (let i = 0; i < arr.length; i++) total += arr[i]')
  lines.push('      return total')
  lines.push('    }')
  lines.push('')

  lines.push('  O(n) 空间 — 创建新数组:')
  lines.push('    function double(arr: number[]): number[] {')
  lines.push('      const result: number[] = []')
  lines.push('      for (let i = 0; i < arr.length; i++) result.push(arr[i] * 2)')
  lines.push('      return result')
  lines.push('    }')
  lines.push('')

  lines.push('  O(n) 空间 — 递归栈:')
  lines.push('    function factorial(n: number): number {')
  lines.push('      if (n <= 1) return 1')
  lines.push('      return n * factorial(n - 1)  // 递归深度 n')
  lines.push('    }')
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}
