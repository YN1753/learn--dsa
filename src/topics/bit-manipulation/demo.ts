export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 位运算 (Bit Manipulation) 演示 ===')
  lines.push('')

  // --- 1. 基本位运算 ---
  lines.push('【1】基本位运算操作')
  lines.push('─────────────────────────')

  const a = 0b1101  // 13
  const b = 0b1011  // 11

  const toBin = (n: number, width = 8): string =>
    (n >>> 0).toString(2).padStart(width, '0').slice(-width)

  lines.push(`a = ${a} (二进制: ${toBin(a, 4)})`)
  lines.push(`b = ${b} (二进制: ${toBin(b, 4)})`)
  lines.push('')
  lines.push(`a & b  (AND) = ${a & b}    二进制: ${toBin(a & b, 4)}`)
  lines.push(`a | b  (OR)  = ${a | b}    二进制: ${toBin(a | b, 4)}`)
  lines.push(`a ^ b  (XOR) = ${a ^ b}     二进制: ${toBin(a ^ b, 4)}`)
  lines.push(`a << 1 (左移) = ${a << 1}   二进制: ${toBin(a << 1, 5)}`)
  lines.push(`a >> 1 (右移) = ${a >> 1}    二进制: ${toBin(a >> 1, 4)}`)
  lines.push('')

  // --- 2. 检查/设置/清除/翻转位 ---
  lines.push('【2】检查/设置/清除/翻转位')
  lines.push('─────────────────────────')

  const n = 0b10110100  // 180
  lines.push(`n = ${n} (二进制: ${toBin(n)})`)
  lines.push('')

  for (let k = 0; k < 8; k++) {
    const mask = 1 << k
    const isSet = (n & mask) !== 0
    lines.push(`  第 ${k} 位: ${isSet ? '1' : '0'}`)
  }
  lines.push('')

  // 设置第 2 位
  const setBit = n | (1 << 2)
  lines.push(`设置第 2 位: ${toBin(n)} → ${toBin(setBit)}  (${n} → ${setBit})`)

  // 清除第 6 位
  const cleared = n & ~(1 << 6)
  lines.push(`清除第 6 位: ${toBin(n)} → ${toBin(cleared)}  (${n} → ${cleared})`)

  // 翻转第 0 位
  const toggled = n ^ (1 << 0)
  lines.push(`翻转第 0 位: ${toBin(n)} → ${toBin(toggled)}  (${n} → ${toggled})`)
  lines.push('')

  // --- 3. Brian Kernighan 算法计算置位个数 ---
  lines.push('【3】Brian Kernighan 算法 — 计算置位个数')
  lines.push('─────────────────────────')

  const testNums = [13, 255, 1024, 0b10101010]
  for (const num of testNums) {
    let temp = num
    let count = 0
    const steps: string[] = []
    while (temp > 0) {
      steps.push(toBin(temp))
      temp &= (temp - 1)
      count++
    }
    lines.push(`${num} (${toBin(num, 8)}) → ${count} 个置位`)
    lines.push(`  步骤: ${steps.join(' → ')} → 00000000`)
  }
  lines.push('')

  // --- 4. 判断 2 的幂 ---
  lines.push('【4】判断 2 的幂')
  lines.push('─────────────────────────')

  const candidates = [1, 2, 3, 4, 7, 8, 16, 15, 32, 100]
  for (const num of candidates) {
    const isPow2 = num > 0 && (num & (num - 1)) === 0
    lines.push(
      `  ${num.toString().padStart(3)} (${toBin(num, 8)})  ${isPow2 ? '✓ 是' : '✗ 否'}  ` +
      `n & (n-1) = ${num & (num - 1)}`
    )
  }
  lines.push('')

  // --- 5. 子集枚举 ---
  lines.push('【5】子集枚举 (位掩码)')
  lines.push('─────────────────────────')

  const elements = ['a', 'b', 'c']
  const nElem = elements.length
  lines.push(`集合: {${elements.join(', ')}}`)
  lines.push(`共 ${1 << nElem} 个子集:`)
  lines.push('')

  for (let mask = 0; mask < (1 << nElem); mask++) {
    const subset: string[] = []
    for (let i = 0; i < nElem; i++) {
      if (mask & (1 << i)) {
        subset.push(elements[i])
      }
    }
    const binStr = toBin(mask, nElem)
    lines.push(`  mask = ${binStr}  →  {${subset.join(', ') || '∅'}}`)
  }
  lines.push('')

  // --- 6. XOR 技巧 ---
  lines.push('【6】XOR 技巧')
  lines.push('─────────────────────────')

  // 找唯一元素
  const arr = [4, 1, 2, 1, 2]
  lines.push(`数组: [${arr.join(', ')}]  (每个元素出现两次，只有一个出现一次)`)
  let xorResult = 0
  for (const num of arr) {
    xorResult ^= num
    lines.push(`  XOR ${num}: 当前结果 = ${xorResult}`)
  }
  lines.push(`唯一元素: ${xorResult}`)
  lines.push('')

  // XOR 交换
  let x = 42
  let y = 99
  lines.push(`XOR 交换: x=${x}, y=${y}`)
  x ^= y; lines.push(`  x ^= y  → x=${x}, y=${y}`)
  y ^= x; lines.push(`  y ^= x  → x=${x}, y=${y}`)
  x ^= y; lines.push(`  x ^= y  → x=${x}, y=${y}`)
  lines.push(`交换完成: x=${x}, y=${y}`)
  lines.push('')

  // --- 7. 权限掩码 ---
  lines.push('【7】权限掩码示例')
  lines.push('─────────────────────────')

  const READ = 1 << 0
  const WRITE = 1 << 1
  const EXECUTE = 1 << 2
  const ADMIN = 1 << 3

  const permNames: Record<number, string> = {
    [READ]: '读',
    [WRITE]: '写',
    [EXECUTE]: '执行',
    [ADMIN]: '管理',
  }

  let perm = 0
  lines.push(`初始权限: ${toBin(perm, 4)} → 无权限`)

  perm |= READ | WRITE
  lines.push(`添加读写: ${toBin(perm, 4)} → ${getPermNames(perm, permNames)}`)

  perm |= EXECUTE
  lines.push(`添加执行: ${toBin(perm, 4)} → ${getPermNames(perm, permNames)}`)

  perm &= ~WRITE
  lines.push(`撤销写入: ${toBin(perm, 4)} → ${getPermNames(perm, permNames)}`)

  perm ^= READ | ADMIN
  lines.push(`翻转读+管理: ${toBin(perm, 4)} → ${getPermNames(perm, permNames)}`)

  const hasExec = (perm & EXECUTE) !== 0
  lines.push(`检查执行权限: ${hasExec ? '有' : '无'}`)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

function getPermNames(perm: number, names: Record<number, string>): string {
  const result: string[] = []
  for (const [bit, name] of Object.entries(names)) {
    if (perm & Number(bit)) result.push(name)
  }
  return result.length > 0 ? result.join('+') : '无权限'
}
