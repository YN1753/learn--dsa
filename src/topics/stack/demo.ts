export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 栈 (Stack) 演示 ===')
  lines.push('')

  // --- 1. 基本的 push/pop 操作 ---
  lines.push('【1】基本 push / pop 操作')
  lines.push('─────────────────────────')

  const stack: number[] = []

  const pushSteps = [10, 20, 30, 40, 50]
  for (const val of pushSteps) {
    stack.push(val)
    lines.push(`push(${val})  →  栈: [${stack.join(', ')}]  (栈顶在右)`)
  }
  lines.push('')

  lines.push('执行 pop 操作:')
  for (let i = 0; i < 3; i++) {
    const val = stack.pop()
    lines.push(`pop() → ${val}  →  栈: [${stack.join(', ')}]`)
  }
  lines.push('')

  // --- 2. Peek 操作 ---
  lines.push('【2】Peek 操作（查看栈顶）')
  lines.push('─────────────────────────')

  const peekStack = ['A', 'B', 'C', 'D']
  lines.push(`当前栈: [${peekStack.join(', ')}]`)
  lines.push(`peek() → ${peekStack[peekStack.length - 1]}  （不移除元素）`)
  lines.push(`peek后栈: [${peekStack.join(', ')}]`)
  lines.push('')

  // --- 3. 括号匹配 ---
  lines.push('【3】括号匹配算法')
  lines.push('─────────────────────────')

  const testCases = ['{[()]}', '{[(])}', '((()))', '(()', '([{}])', '']

  for (const input of testCases) {
    const result = checkBrackets(input)
    const display = input || '(空字符串)'
    lines.push(`"${display}" → ${result ? '✓ 匹配' : '✗ 不匹配'}`)
  }
  lines.push('')

  // --- 4. 详细的括号匹配过程 ---
  lines.push('【4】括号匹配详细过程')
  lines.push('─────────────────────────')
  lines.push('输入: "{[()()]}"')
  lines.push('')

  traceBrackets('{[()()]}', lines)
  lines.push('')

  // --- 5. 后缀表达式求值 ---
  lines.push('【5】后缀表达式求值')
  lines.push('─────────────────────────')

  const expressions = [
    { expr: '3 4 +', expected: 7 },
    { expr: '3 4 + 2 *', expected: 14 },
    { expr: '5 1 2 + 4 * + 3 -', expected: 14 },
  ]

  for (const { expr, expected } of expressions) {
    const result = evaluatePostfix(expr)
    lines.push(`"${expr}" = ${result}  (期望: ${expected})  ${result === expected ? '✓' : '✗'}`)
  }
  lines.push('')

  // --- 6. 字符串反转 ---
  lines.push('【6】使用栈反转字符串')
  lines.push('─────────────────────────')

  const original = 'HELLO'
  const reversed = reverseString(original)
  lines.push(`原始字符串: "${original}"`)
  lines.push(`反转结果:   "${reversed}"`)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 辅助函数：括号匹配
function checkBrackets(str: string): boolean {
  const stack: string[] = []
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  }

  for (const char of str) {
    if ('([{'.includes(char)) {
      stack.push(char)
    } else if (')]}'.includes(char)) {
      if (stack.length === 0 || stack.pop() !== pairs[char]) {
        return false
      }
    }
  }

  return stack.length === 0
}

// 辅助函数：括号匹配详细过程
function traceBrackets(str: string, lines: string[]): void {
  const stack: string[] = []
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  }

  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    if ('([{'.includes(char)) {
      stack.push(char)
      lines.push(`第${i + 1}步: 遇到 '${char}' → 压栈  栈: [${stack.join(', ')}]`)
    } else if (')]}'.includes(char)) {
      const popped = stack.pop()!
      const match = popped === pairs[char]
      lines.push(
        `第${i + 1}步: 遇到 '${char}' → 弹出 '${popped}' ${match ? '✓ 匹配' : '✗ 不匹配'}  栈: [${stack.join(', ')}]`
      )
    }
  }

  lines.push(`最终栈为空: ${stack.length === 0 ? '✓ 是' : '✗ 否'} → ${stack.length === 0 ? '括号完全匹配' : '括号不匹配'}`)
}

// 辅助函数：后缀表达式求值
function evaluatePostfix(expression: string): number {
  const stack: number[] = []
  const tokens = expression.split(' ')

  for (const token of tokens) {
    if ('+-*/'.includes(token) && token.length === 1) {
      const b = stack.pop()!
      const a = stack.pop()!
      let result: number
      switch (token) {
        case '+': result = a + b; break
        case '-': result = a - b; break
        case '*': result = a * b; break
        case '/': result = a / b; break
        default: result = 0
      }
      stack.push(result)
    } else {
      stack.push(Number(token))
    }
  }

  return stack.pop()!
}

// 辅助函数：使用栈反转字符串
function reverseString(str: string): string {
  const stack: string[] = []

  for (const char of str) {
    stack.push(char)
  }

  let result = ''
  while (stack.length > 0) {
    result += stack.pop()
  }

  return result
}
