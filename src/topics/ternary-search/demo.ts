export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 三分搜索 (Ternary Search) 演示 ===')
  lines.push('')

  // --- 1. 在单峰函数上找最大值 ---
  lines.push('【1】在单峰函数 f(x) = -(x-3)^2 + 10 上找最大值')
  lines.push('─────────────────────────')
  lines.push('函数: f(x) = -(x-3)^2 + 10，最大值在 x=3 处，f(3)=10')
  lines.push(`搜索区间: [0, 6]`)
  lines.push('')
  ternarySearchTrace(0, 6, (x) => -(x - 3) * (x - 3) + 10, 'max', lines)
  lines.push('')

  // --- 2. 在单峰函数上找最小值 ---
  lines.push('【2】在单峰函数 f(x) = (x-5)^2 + 1 上找最小值')
  lines.push('─────────────────────────')
  lines.push('函数: f(x) = (x-5)^2 + 1，最小值在 x=5 处，f(5)=1')
  lines.push(`搜索区间: [0, 10]`)
  lines.push('')
  ternarySearchTrace(0, 10, (x) => (x - 5) * (x - 5) + 1, 'min', lines)
  lines.push('')

  // --- 3. 更复杂的函数 ---
  lines.push('【3】在 f(x) = -x^4 + 12x^2 + 1 上找最大值')
  lines.push('─────────────────────────')
  lines.push('函数: f(x) = -x^4 + 12x^2 + 1')
  lines.push(`搜索区间: [-4, 4]`)
  lines.push('')
  ternarySearchTrace(-4, 4, (x) => -x * x * x * x + 12 * x * x + 1, 'max', lines)
  lines.push('')

  // --- 4. 整数三分搜索 ---
  lines.push('【4】整数三分搜索：f(x) = -(x-7)^2 + 20')
  lines.push('─────────────────────────')
  lines.push('函数: f(x) = -(x-7)^2 + 20，最大值在 x=7 处')
  lines.push(`搜索区间: [0, 15]（整数域）`)
  lines.push('')
  integerTernarySearchTrace(0, 15, (x) => -(x - 7) * (x - 7) + 20, 'max', lines)
  lines.push('')

  // --- 5. 收敛过程分析 ---
  lines.push('【5】收敛过程分析')
  lines.push('─────────────────────────')
  lines.push('每次迭代区间长度变为原来的 2/3：')
  let len = 6.0
  for (let i = 1; i <= 10; i++) {
    const prev = len
    len = len * 2 / 3
    lines.push(`  第${i}次迭代后: 区间长度 = ${prev.toFixed(4)} * 2/3 = ${len.toFixed(6)}`)
  }
  lines.push('')

  // --- 6. 效率对比 ---
  lines.push('【6】三分搜索 vs 线性搜索 效率对比')
  lines.push('─────────────────────────')
  const epsilons = [1e-3, 1e-6, 1e-9, 1e-12]
  for (const eps of epsilons) {
    const ternarySteps = Math.ceil(Math.log(1.0 / eps) / Math.log(1.5))
    const linearSteps = Math.ceil(1.0 / eps)
    lines.push(`  精度 ${eps.toExponential()}:  线性搜索约 ${linearSteps.toLocaleString()} 步,  三分搜索约 ${ternarySteps} 步`)
  }
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 辅助函数：浮点三分搜索详细过程
function ternarySearchTrace(
  left: number,
  right: number,
  f: (x: number) => number,
  mode: 'max' | 'min',
  lines: string[]
): void {
  const epsilon = 1e-9
  let step = 0

  while (right - left > epsilon) {
    step++
    const m1 = left + (right - left) / 3
    const m2 = right - (right - left) / 3
    const f1 = f(m1)
    const f2 = f(m2)

    const cmpSymbol = mode === 'max'
      ? (f1 < f2 ? '<' : f1 > f2 ? '>' : '=')
      : (f1 < f2 ? '<' : f1 > f2 ? '>' : '=')

    if (mode === 'max') {
      if (f1 < f2) {
        lines.push(
          `  第${step}步: [${left.toFixed(6)}, ${right.toFixed(6)}]  ` +
          `m1=${m1.toFixed(6)} f(m1)=${f1.toFixed(6)}  m2=${m2.toFixed(6)} f(m2)=${f2.toFixed(6)}  ` +
          `f(m1) ${cmpSymbol} f(m2) → 最大值在右侧，排除 [${left.toFixed(6)}, ${m1.toFixed(6)}]`
        )
        left = m1
      } else {
        lines.push(
          `  第${step}步: [${left.toFixed(6)}, ${right.toFixed(6)}]  ` +
          `m1=${m1.toFixed(6)} f(m1)=${f1.toFixed(6)}  m2=${m2.toFixed(6)} f(m2)=${f2.toFixed(6)}  ` +
          `f(m1) ${cmpSymbol} f(m2) → 最大值在左侧，排除 [${m2.toFixed(6)}, ${right.toFixed(6)}]`
        )
        right = m2
      }
    } else {
      if (f1 < f2) {
        lines.push(
          `  第${step}步: [${left.toFixed(6)}, ${right.toFixed(6)}]  ` +
          `m1=${m1.toFixed(6)} f(m1)=${f1.toFixed(6)}  m2=${m2.toFixed(6)} f(m2)=${f2.toFixed(6)}  ` +
          `f(m1) ${cmpSymbol} f(m2) → 最小值在左侧，排除 [${m2.toFixed(6)}, ${right.toFixed(6)}]`
        )
        right = m2
      } else {
        lines.push(
          `  第${step}步: [${left.toFixed(6)}, ${right.toFixed(6)}]  ` +
          `m1=${m1.toFixed(6)} f(m1)=${f1.toFixed(6)}  m2=${m2.toFixed(6)} f(m2)=${f2.toFixed(6)}  ` +
          `f(m1) ${cmpSymbol} f(m2) → 最小值在右侧，排除 [${left.toFixed(6)}, ${m1.toFixed(6)}]`
        )
        left = m1
      }
    }
  }

  const result = (left + right) / 2
  lines.push(`  搜索完成: x ≈ ${result.toFixed(9)}, f(x) = ${f(result).toFixed(9)}`)
  lines.push(`  共执行 ${step} 次迭代`)
}

// 辅助函数：整数三分搜索详细过程
function integerTernarySearchTrace(
  left: number,
  right: number,
  f: (x: number) => number,
  mode: 'max' | 'min',
  lines: string[]
): void {
  let step = 0

  while (left < right) {
    step++
    const m1 = left + Math.floor((right - left) / 3)
    const m2 = right - Math.floor((right - left) / 3)
    const f1 = f(m1)
    const f2 = f(m2)

    if (mode === 'max') {
      if (f1 < f2) {
        lines.push(
          `  第${step}步: [${left}, ${right}]  ` +
          `m1=${m1} f(m1)=${f1}  m2=${m2} f(m2)=${f2}  ` +
          `f(m1) < f(m2) → 排除 [${left}, ${m1}]`
        )
        left = m1 + 1
      } else {
        lines.push(
          `  第${step}步: [${left}, ${right}]  ` +
          `m1=${m1} f(m1)=${f1}  m2=${m2} f(m2)=${f2}  ` +
          `f(m1) >= f(m2) → 排除 [${m2}, ${right}]`
        )
        right = m2 - 1
      }
    } else {
      if (f1 < f2) {
        lines.push(
          `  第${step}步: [${left}, ${right}]  ` +
          `m1=${m1} f(m1)=${f1}  m2=${m2} f(m2)=${f2}  ` +
          `f(m1) < f(m2) → 排除 [${m2}, ${right}]`
        )
        right = m2 - 1
      } else {
        lines.push(
          `  第${step}步: [${left}, ${right}]  ` +
          `m1=${m1} f(m1)=${f1}  m2=${m2} f(m2)=${f2}  ` +
          `f(m1) >= f(m2) → 排除 [${left}, ${m1}]`
        )
        left = m1 + 1
      }
    }
  }

  lines.push(`  搜索完成: x = ${left}, f(x) = ${f(left)}`)
  lines.push(`  共执行 ${step} 次迭代`)
}
