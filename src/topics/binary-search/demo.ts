export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 二分查找 (Binary Search) 演示 ===')
  lines.push('')

  // --- 1. 标准二分查找 ---
  lines.push('【1】标准二分查找')
  lines.push('─────────────────────────')
  const arr1 = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
  const target1 = 11
  lines.push(`数组: [${arr1.join(', ')}]`)
  lines.push(`目标值: ${target1}`)
  lines.push('')
  binarySearchTrace(arr1, target1, lines)
  lines.push('')

  // --- 2. 查找不存在的值 ---
  lines.push('【2】查找不存在的值')
  lines.push('─────────────────────────')
  const target2 = 10
  lines.push(`数组: [${arr1.join(', ')}]`)
  lines.push(`目标值: ${target2}`)
  lines.push('')
  binarySearchTrace(arr1, target2, lines)
  lines.push('')

  // --- 3. 查找第一次出现的位置 ---
  lines.push('【3】查找第一次出现的位置')
  lines.push('─────────────────────────')
  const arr3 = [1, 2, 3, 3, 3, 4, 5, 6]
  const target3 = 3
  lines.push(`数组: [${arr3.join(', ')}]  (包含重复元素)`)
  lines.push(`目标值: ${target3}`)
  lines.push('')
  findFirstTrace(arr3, target3, lines)
  lines.push('')

  // --- 4. 查找最后一次出现的位置 ---
  lines.push('【4】查找最后一次出现的位置')
  lines.push('─────────────────────────')
  lines.push(`数组: [${arr3.join(', ')}]  (包含重复元素)`)
  lines.push(`目标值: ${target3}`)
  lines.push('')
  findLastTrace(arr3, target3, lines)
  lines.push('')

  // --- 5. 查找插入位置 ---
  lines.push('【5】查找插入位置')
  lines.push('─────────────────────────')
  const arr5 = [1, 3, 5, 7, 9, 11]
  const targets5 = [0, 4, 6, 12]
  lines.push(`数组: [${arr5.join(', ')}]`)
  for (const t of targets5) {
    const pos = searchInsertTrace(arr5, t)
    lines.push(`  目标值 ${t} → 应插入到位置 ${pos}`)
  }
  lines.push('')

  // --- 6. 效率对比 ---
  lines.push('【6】二分查找 vs 线性查找 效率对比')
  lines.push('─────────────────────────')
  const sizes = [100, 1000, 10000, 1000000]
  for (const size of sizes) {
    const logSteps = Math.ceil(Math.log2(size))
    lines.push(`  n=${size.toLocaleString().padStart(10)}:  线性查找最多 ${size.toLocaleString().padStart(10)} 步,  二分查找最多 ${logSteps} 步`)
  }
  lines.push('')

  // --- 7. 旋转数组查找 ---
  lines.push('【7】旋转数组查找')
  lines.push('─────────────────────────')
  const rotated = [4, 5, 6, 7, 0, 1, 2]
  const rotTarget = 0
  lines.push(`旋转数组: [${rotated.join(', ')}]`)
  lines.push(`目标值: ${rotTarget}`)
  lines.push('')
  searchRotatedTrace(rotated, rotTarget, lines)
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 辅助函数：标准二分查找详细过程
function binarySearchTrace(arr: number[], target: number, lines: string[]): void {
  let left = 0
  let right = arr.length - 1
  let step = 0

  while (left <= right) {
    step++
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) {
      lines.push(
        `  第${step}步: left=${left}, right=${right}, mid=${mid}  ` +
        `arr[${mid}]=${arr[mid]} == ${target}  --> 找到!`
      )
      lines.push(`  共执行 ${step} 次比较`)
      return
    } else if (arr[mid] < target) {
      lines.push(
        `  第${step}步: left=${left}, right=${right}, mid=${mid}  ` +
        `arr[${mid}]=${arr[mid]} < ${target}  --> 搜索右半部分 [${mid + 1}..${right}]`
      )
      left = mid + 1
    } else {
      lines.push(
        `  第${step}步: left=${left}, right=${right}, mid=${mid}  ` +
        `arr[${mid}]=${arr[mid]} > ${target}  --> 搜索左半部分 [${left}..${mid - 1}]`
      )
      right = mid - 1
    }
  }

  lines.push(`  搜索范围为空 (left=${left} > right=${right})，目标值 ${target} 不存在`)
  lines.push(`  共执行 ${step} 次比较`)
}

// 辅助函数：查找第一次出现的位置
function findFirstTrace(arr: number[], target: number, lines: string[]): void {
  let left = 0
  let right = arr.length - 1
  let result = -1
  let step = 0

  while (left <= right) {
    step++
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) {
      result = mid
      lines.push(
        `  第${step}步: mid=${mid}, arr[${mid}]=${arr[mid]} == ${target}  ` +
        `--> 记录位置 ${mid}，继续向左搜索`
      )
      right = mid - 1
    } else if (arr[mid] < target) {
      lines.push(
        `  第${step}步: mid=${mid}, arr[${mid}]=${arr[mid]} < ${target}  --> 向右搜索`
      )
      left = mid + 1
    } else {
      lines.push(
        `  第${step}步: mid=${mid}, arr[${mid}]=${arr[mid]} > ${target}  --> 向左搜索`
      )
      right = mid - 1
    }
  }

  if (result !== -1) {
    lines.push(`  ${target} 第一次出现在位置 ${result} (共执行 ${step} 次比较)`)
  } else {
    lines.push(`  未找到 ${target} (共执行 ${step} 次比较)`)
  }
}

// 辅助函数：查找最后一次出现的位置
function findLastTrace(arr: number[], target: number, lines: string[]): void {
  let left = 0
  let right = arr.length - 1
  let result = -1
  let step = 0

  while (left <= right) {
    step++
    const mid = left + Math.floor((right - left) / 2)

    if (arr[mid] === target) {
      result = mid
      lines.push(
        `  第${step}步: mid=${mid}, arr[${mid}]=${arr[mid]} == ${target}  ` +
        `--> 记录位置 ${mid}，继续向右搜索`
      )
      left = mid + 1
    } else if (arr[mid] < target) {
      lines.push(
        `  第${step}步: mid=${mid}, arr[${mid}]=${arr[mid]} < ${target}  --> 向右搜索`
      )
      left = mid + 1
    } else {
      lines.push(
        `  第${step}步: mid=${mid}, arr[${mid}]=${arr[mid]} > ${target}  --> 向左搜索`
      )
      right = mid - 1
    }
  }

  if (result !== -1) {
    lines.push(`  ${target} 最后一次出现在位置 ${result} (共执行 ${step} 次比较)`)
  } else {
    lines.push(`  未找到 ${target} (共执行 ${step} 次比较)`)
  }
}

// 辅助函数：查找插入位置
function searchInsertTrace(arr: number[], target: number): number {
  let left = 0
  let right = arr.length

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid
    }
  }

  return left
}

// 辅助函数：旋转数组查找
function searchRotatedTrace(nums: number[], target: number, lines: string[]): void {
  let left = 0
  let right = nums.length - 1
  let step = 0

  while (left <= right) {
    step++
    const mid = left + Math.floor((right - left) / 2)

    if (nums[mid] === target) {
      lines.push(
        `  第${step}步: mid=${mid}, arr[${mid}]=${nums[mid]} == ${target}  --> 找到!`
      )
      lines.push(`  共执行 ${step} 次比较`)
      return
    }

    // 判断哪半部分是有序的
    if (nums[left] <= nums[mid]) {
      // 左半部分有序
      if (nums[left] <= target && target < nums[mid]) {
        lines.push(
          `  第${step}步: mid=${mid}, arr[${mid}]=${nums[mid]}  ` +
          `左半部分 [${left}..${mid}] 有序，目标在左半部分`
        )
        right = mid - 1
      } else {
        lines.push(
          `  第${step}步: mid=${mid}, arr[${mid}]=${nums[mid]}  ` +
          `左半部分 [${left}..${mid}] 有序，目标在右半部分`
        )
        left = mid + 1
      }
    } else {
      // 右半部分有序
      if (nums[mid] < target && target <= nums[right]) {
        lines.push(
          `  第${step}步: mid=${mid}, arr[${mid}]=${nums[mid]}  ` +
          `右半部分 [${mid}..${right}] 有序，目标在右半部分`
        )
        left = mid + 1
      } else {
        lines.push(
          `  第${step}步: mid=${mid}, arr[${mid}]=${nums[mid]}  ` +
          `右半部分 [${mid}..${right}] 有序，目标在左半部分`
        )
        right = mid - 1
      }
    }
  }

  lines.push(`  未找到 ${target} (共执行 ${step} 次比较)`)
}
