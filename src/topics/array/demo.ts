export default function arrayDemo(): string {
  const output: string[] = []

  output.push('=== 数组 (Array) 操作演示 ===\n')

  // 1. 创建数组
  const arr: number[] = [10, 25, 33, 47, 58, 62, 79]
  output.push(`初始数组: [${arr.join(', ')}]`)
  output.push(`数组长度: ${arr.length}\n`)

  // 2. 随机访问
  output.push('--- 随机访问 ---')
  for (const index of [0, 3, 6]) {
    output.push(`  arr[${index}] = ${arr[index]}  (O(1) 时间复杂度)`)
  }
  output.push('')

  // 3. 线性查找
  output.push('--- 线性查找: 查找 47 ---')
  const target = 47
  let found = false
  for (let i = 0; i < arr.length; i++) {
    output.push(`  第 ${i + 1} 步: 比较 arr[${i}] = ${arr[i]} 与 ${target}`)
    if (arr[i] === target) {
      output.push(`  ✓ 找到! 索引为 ${i}`)
      found = true
      break
    }
  }
  if (!found) {
    output.push('  ✗ 未找到')
  }
  output.push('')

  // 4. 末尾插入
  output.push('--- 末尾插入: 在末尾添加 85 ---')
  arr.push(85)
  output.push(`  插入后: [${arr.join(', ')}]`)
  output.push(`  时间复杂度: O(1)\n`)

  // 5. 指定位置插入
  output.push('--- 指定位置插入: 在索引 3 处插入 40 ---')
  const insertIndex = 3
  output.push(`  插入前: [${arr.join(', ')}]`)
  // 模拟插入过程
  arr.push(0) // 扩展数组
  for (let i = arr.length - 1; i > insertIndex; i--) {
    arr[i] = arr[i - 1]
    output.push(`  移动: arr[${i - 1}] -> arr[${i}]`)
  }
  arr[insertIndex] = 40
  output.push(`  插入 arr[${insertIndex}] = 40`)
  output.push(`  插入后: [${arr.join(', ')}]`)
  output.push(`  时间复杂度: O(n) (需要移动元素)\n`)

  // 6. 删除指定位置元素
  output.push('--- 删除操作: 删除索引 2 处的元素 ---')
  const deleteIndex = 2
  const deletedValue = arr[deleteIndex]
  output.push(`  删除前: [${arr.join(', ')}]`)
  output.push(`  删除元素: arr[${deleteIndex}] = ${deletedValue}`)
  for (let i = deleteIndex; i < arr.length - 1; i++) {
    arr[i] = arr[i + 1]
    output.push(`  移动: arr[${i + 1}] -> arr[${i}]`)
  }
  arr.pop()
  output.push(`  删除后: [${arr.join(', ')}]`)
  output.push(`  时间复杂度: O(n) (需要移动元素)\n`)

  // 7. 末尾删除
  output.push('--- 末尾删除 ---')
  const lastValue = arr.pop()
  output.push(`  删除末尾元素: ${lastValue}`)
  output.push(`  删除后: [${arr.join(', ')}]`)
  output.push(`  时间复杂度: O(1)\n`)

  // 8. 时间复杂度总结
  output.push('=== 时间复杂度总结 ===')
  output.push('  随机访问:        O(1)')
  output.push('  线性查找:        O(n)')
  output.push('  末尾插入:        O(1)')
  output.push('  指定位置插入:    O(n)')
  output.push('  末尾删除:        O(1)')
  output.push('  指定位置删除:    O(n)')

  return output.join('\n')
}