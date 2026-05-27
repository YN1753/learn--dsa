export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 双指针 (Two Pointers) 演示 ===')
  lines.push('')

  // --- 1. 有序数组两数之和 ---
  lines.push('【1】有序数组两数之和')
  lines.push('─────────────────────────')
  const arr1 = [1, 2, 3, 4, 6, 8, 9, 11, 15]
  const target1 = 10
  lines.push(`数组: [${arr1.join(', ')}]`)
  lines.push(`目标和: ${target1}`)
  lines.push('')
  twoSumTrace(arr1, target1, lines)
  lines.push('')

  // --- 2. 盛最多水的容器 ---
  lines.push('【2】盛最多水的容器')
  lines.push('─────────────────────────')
  const heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
  lines.push(`高度数组: [${heights.join(', ')}]`)
  lines.push('')
  maxAreaTrace(heights, lines)
  lines.push('')

  // --- 3. 链表环检测 (Floyd 判圈算法) ---
  lines.push('【3】链表环检测 (Floyd 判圈算法)')
  lines.push('─────────────────────────')
  // 创建有环链表: 1 -> 2 -> 3 -> 4 -> 5 -> 3 (回到节点3)
  lines.push('链表: 1 -> 2 -> 3 -> 4 -> 5 -> (回到节点3，形成环)')
  lines.push('')
  cycleDetectionTrace(lines)
  lines.push('')

  // --- 4. 去除有序数组中的重复元素 ---
  lines.push('【4】去除有序数组中的重复元素')
  lines.push('─────────────────────────')
  const arr4 = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
  lines.push(`数组: [${arr4.join(', ')}]  (含重复元素)`)
  lines.push('')
  removeDuplicatesTrace([...arr4], lines)
  lines.push('')

  // --- 5. 三数之和 ---
  lines.push('【5】三数之和')
  lines.push('─────────────────────────')
  const arr5 = [-1, 0, 1, 2, -1, -4]
  lines.push(`数组: [${arr5.join(', ')}]`)
  lines.push(`目标和: 0`)
  lines.push('')
  threeSumTrace(arr5, lines)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 辅助函数：有序数组两数之和
function twoSumTrace(arr: number[], target: number, lines: string[]): void {
  let left = 0
  let right = arr.length - 1
  let step = 0

  while (left < right) {
    step++
    const sum = arr[left] + arr[right]

    if (sum === target) {
      lines.push(
        `  第${step}步: left=${left} (值=${arr[left]}), right=${right} (值=${arr[right]})  ` +
        `${arr[left]} + ${arr[right]} = ${sum} == ${target}  --> 找到!`
      )
      lines.push(`  答案: 索引 [${left}, ${right}], 值 [${arr[left]}, ${arr[right]}]`)
      lines.push(`  共执行 ${step} 次比较`)
      return
    } else if (sum < target) {
      lines.push(
        `  第${step}步: left=${left} (值=${arr[left]}), right=${right} (值=${arr[right]})  ` +
        `${arr[left]} + ${arr[right]} = ${sum} < ${target}  --> left 右移`
      )
      left++
    } else {
      lines.push(
        `  第${step}步: left=${left} (值=${arr[left]}), right=${right} (值=${arr[right]})  ` +
        `${arr[left]} + ${arr[right]} = ${sum} > ${target}  --> right 左移`
      )
      right--
    }
  }

  lines.push(`  未找到和为 ${target} 的两个数 (共执行 ${step} 次比较)`)
}

// 辅助函数：盛最多水的容器
function maxAreaTrace(height: number[], lines: string[]): void {
  let left = 0
  let right = height.length - 1
  let maxWater = 0
  let step = 0

  while (left < right) {
    step++
    const width = right - left
    const h = Math.min(height[left], height[right])
    const area = h * width

    if (area > maxWater) {
      maxWater = area
    }

    lines.push(
      `  第${step}步: left=${left} (高=${height[left]}), right=${right} (高=${height[right]})  ` +
      `面积 = min(${height[left]}, ${height[right]}) * ${width} = ${area}` +
      (area === maxWater ? `  ** 当前最大 **` : '')
    )

    if (height[left] < height[right]) {
      lines.push(`         height[${left}]=${height[left]} < height[${right}]=${height[right]}, left 右移`)
      left++
    } else {
      lines.push(`         height[${left}]=${height[left]} >= height[${right}]=${height[right]}, right 左移`)
      right--
    }
  }

  lines.push(`  最大面积: ${maxWater}`)
}

// 辅助函数：链表环检测
function cycleDetectionTrace(lines: string[]): void {
  // 模拟链表: 1 -> 2 -> 3 -> 4 -> 5 -> 3 (环入口在节点3)
  // 用索引模拟: 0->1->2->3->4->2
  const nodes = [1, 2, 3, 4, 5]
  const nextIdx = [1, 2, 3, 4, 2]  // 节点4(索引4)指向节点3(索引2)，形成环

  let slow = 0
  let fast = 0
  let step = 0
  let meetPoint = -1

  lines.push('  快指针每次走 2 步，慢指针每次走 1 步')
  lines.push('')

  while (true) {
    step++
    // 慢指针走 1 步
    slow = nextIdx[slow]
    // 快指针走 2 步
    fast = nextIdx[nextIdx[fast]]

    const slowVal = nodes[slow]
    const fastVal = nodes[fast]

    lines.push(
      `  第${step}步: slow -> 节点${slowVal}, fast -> 节点${fastVal}`
    )

    if (slow === fast) {
      meetPoint = slow
      lines.push(`         相遇! 在节点 ${nodes[meetPoint]} 处`)
      break
    }

    if (step > 20) {
      lines.push('  (超过最大步数，停止)')
      return
    }
  }

  // 找环入口
  lines.push('')
  lines.push('  --- 查找环入口 ---')
  slow = 0
  let entranceStep = 0
  while (slow !== fast) {
    entranceStep++
    slow = nextIdx[slow]
    fast = nextIdx[fast]
    lines.push(
      `  第${entranceStep}步: slow -> 节点${nodes[slow]}, fast -> 节点${nodes[fast]}`
    )
  }
  lines.push(`  环入口: 节点 ${nodes[slow]}`)
  lines.push(`  总步数: ${step + entranceStep}`)
}

// 辅助函数：去除有序数组中的重复元素
function removeDuplicatesTrace(arr: number[], lines: string[]): void {
  if (arr.length === 0) {
    lines.push('  数组为空')
    return
  }

  let slow = 0
  lines.push(`  初始: slow=0, 数组 = [${arr.join(', ')}]`)
  lines.push('')

  for (let fast = 1; fast < arr.length; fast++) {
    if (arr[fast] !== arr[slow]) {
      slow++
      arr[slow] = arr[fast]
      lines.push(
        `  fast=${fast}: arr[${fast}]=${arr[fast]} != arr[${slow - 1}]=${arr[slow - 1]}  ` +
        `--> slow 移到 ${slow}, 复制 arr[${slow}] = ${arr[fast]}`
      )
      lines.push(`         数组: [${arr.slice(0, slow + 1).join(', ')}]`)
    } else {
      lines.push(
        `  fast=${fast}: arr[${fast}]=${arr[fast]} == arr[${slow}]=${arr[slow]}  --> 跳过重复`
      )
    }
  }

  const newLength = slow + 1
  lines.push('')
  lines.push(`  去重后长度: ${newLength}`)
  lines.push(`  去重后数组: [${arr.slice(0, newLength).join(', ')}]`)
}

// 辅助函数：三数之和
function threeSumTrace(nums: number[], lines: string[]): void {
  const sorted = [...nums].sort((a, b) => a - b)
  lines.push(`  排序后: [${sorted.join(', ')}]`)
  lines.push('')

  const results: [number, number, number][] = []
  let outerStep = 0

  for (let i = 0; i < sorted.length - 2; i++) {
    // 跳过重复的第一个数
    if (i > 0 && sorted[i] === sorted[i - 1]) {
      lines.push(`  i=${i}: 跳过重复值 ${sorted[i]}`)
      continue
    }

    outerStep++
    let left = i + 1
    let right = sorted.length - 1
    const target = -sorted[i]

    lines.push(
      `  第${outerStep}轮: 固定 sorted[${i}]=${sorted[i]}, 用对撞指针在 [${left}, ${right}] 中找和为 ${target}`
    )

    while (left < right) {
      const sum = sorted[left] + sorted[right]

      if (sum === target) {
        results.push([sorted[i], sorted[left], sorted[right]])
        lines.push(
          `    找到: (${sorted[i]}, ${sorted[left]}, ${sorted[right]})`
        )
        left++
        right--
        // 跳过重复
        while (left < right && sorted[left] === sorted[left - 1]) left++
        while (left < right && sorted[right] === sorted[right + 1]) right--
      } else if (sum < target) {
        left++
      } else {
        right--
      }
    }
  }

  lines.push('')
  lines.push(`  共找到 ${results.length} 个三元组:`)
  for (const [a, b, c] of results) {
    lines.push(`    (${a}, ${b}, ${c})  ->  ${a} + ${b} + ${c} = 0`)
  }
}
