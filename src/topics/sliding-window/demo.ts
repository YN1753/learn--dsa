export default function runDemo(): string {
  const lines: string[] = []

  lines.push('=== 滑动窗口 (Sliding Window) 演示 ===')
  lines.push('')

  // --- 1. 固定大小窗口：最大子数组和 ---
  lines.push('【1】固定大小窗口：最大子数组和 (k=3)')
  lines.push('─────────────────────────')
  const arr1 = [2, 1, 5, 1, 3, 2]
  lines.push(`数组: [${arr1.join(', ')}]`)
  lines.push(`窗口大小 k = 3`)
  lines.push('')
  maxSumSubarrayTrace(arr1, 3, lines)
  lines.push('')

  // --- 2. 固定大小窗口：平均值 ---
  lines.push('【2】固定大小窗口：移动平均值 (k=4)')
  lines.push('─────────────────────────')
  const arr2 = [1, 3, 2, 6, -1, 4, 1, 8, 2]
  lines.push(`数组: [${arr2.join(', ')}]`)
  lines.push(`窗口大小 k = 4`)
  lines.push('')
  movingAverageTrace(arr2, 4, lines)
  lines.push('')

  // --- 3. 可变大小窗口：最长无重复字符子串 ---
  lines.push('【3】可变大小窗口：最长无重复字符子串')
  lines.push('─────────────────────────')
  const str1 = 'abcabcbb'
  lines.push(`字符串: "${str1}"`)
  lines.push('')
  longestSubstringTrace(str1, lines)
  lines.push('')

  // --- 4. 可变大小窗口：另一个例子 ---
  lines.push('【4】可变大小窗口：最长无重复字符子串')
  lines.push('─────────────────────────')
  const str2 = 'pwwkew'
  lines.push(`字符串: "${str2}"`)
  lines.push('')
  longestSubstringTrace(str2, lines)
  lines.push('')

  // --- 5. 可变大小窗口：最小覆盖子串 ---
  lines.push('【5】可变大小窗口：最小覆盖子串')
  lines.push('─────────────────────────')
  const s5 = 'ADOBECODEBANC'
  const t5 = 'ABC'
  lines.push(`源字符串: "${s5}"`)
  lines.push(`目标字符: "${t5}"`)
  lines.push('')
  minWindowSubstringTrace(s5, t5, lines)
  lines.push('')

  // --- 6. 效率对比 ---
  lines.push('【6】滑动窗口 vs 暴力解法 效率对比')
  lines.push('─────────────────────────')
  const sizes = [100, 1000, 10000, 100000]
  for (const size of sizes) {
    lines.push(`  n=${size.toLocaleString().padStart(8)}:  暴力 O(n*k) ≈ ${(size * 3).toLocaleString().padStart(10)} 次操作,  滑动窗口 O(n) = ${size.toLocaleString().padStart(8)} 次操作`)
  }
  lines.push('')

  lines.push('=== 演示结束 ===')

  return lines.join('\n')
}

// 辅助函数：固定窗口最大子数组和
function maxSumSubarrayTrace(arr: number[], k: number, lines: string[]): void {
  let windowSum = 0
  for (let i = 0; i < k; i++) {
    windowSum += arr[i]
  }
  let maxSum = windowSum
  let maxStart = 0

  lines.push(`  初始窗口 [${arr.slice(0, k).join(', ')}]  和 = ${windowSum}, 最大和 = ${maxSum}`)

  for (let i = k; i < arr.length; i++) {
    const removed = arr[i - k]
    const added = arr[i]
    windowSum += added - removed
    if (windowSum > maxSum) {
      maxSum = windowSum
      maxStart = i - k + 1
    }
    lines.push(
      `  滑动: 移除 ${removed}, 加入 ${added} → [${arr.slice(i - k + 1, i + 1).join(', ')}]  ` +
      `和 = ${windowSum}, 最大和 = ${maxSum}`
    )
  }

  lines.push(`  结果: 最大和 = ${maxSum}，子数组 [${arr.slice(maxStart, maxStart + k).join(', ')}]`)
}

// 辅助函数：移动平均值
function movingAverageTrace(arr: number[], k: number, lines: string[]): void {
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
    if (i >= k) sum -= arr[i - k]
    if (i >= k - 1) {
      const window = arr.slice(i - k + 1, i + 1)
      const avg = (sum / k).toFixed(2)
      lines.push(`  窗口 [${window.join(', ')}]  平均值 = ${avg}`)
    }
  }
}

// 辅助函数：最长无重复字符子串
function longestSubstringTrace(s: string, lines: string[]): void {
  const seen = new Set<string>()
  let left = 0
  let maxLen = 0
  let maxStart = 0

  for (let right = 0; right < s.length; right++) {
    while (seen.has(s[right])) {
      lines.push(
        `  right=${right}: '${s[right]}' 重复, 移除 '${s[left]}' → ` +
        `窗口 "${s.substring(left + 1, right + 1)}"`
      )
      seen.delete(s[left])
      left++
    }
    seen.add(s[right])
    const currentLen = right - left + 1
    if (currentLen > maxLen) {
      maxLen = currentLen
      maxStart = left
    }
    lines.push(
      `  right=${right}: 加入 '${s[right]}' → 窗口 "${s.substring(left, right + 1)}" ` +
      `(长度=${currentLen}, 最大=${maxLen})`
    )
  }

  lines.push(`  结果: 最长无重复子串 = "${s.substring(maxStart, maxStart + maxLen)}" (长度 ${maxLen})`)
}

// 辅助函数：最小覆盖子串
function minWindowSubstringTrace(s: string, t: string, lines: string[]): void {
  const need = new Map<string, number>()
  for (const c of t) need.set(c, (need.get(c) || 0) + 1)

  const window = new Map<string, number>()
  let left = 0
  let valid = 0
  let start = 0
  let minLen = Infinity

  for (let right = 0; right < s.length; right++) {
    const c = s[right]
    if (need.has(c)) {
      window.set(c, (window.get(c) || 0) + 1)
      if (window.get(c) === need.get(c)) {
        valid++
      }
    }

    // 当所有字符都满足时，尝试收缩
    while (valid === need.size) {
      const windowLen = right - left + 1
      if (windowLen < minLen) {
        minLen = windowLen
        start = left
      }
      lines.push(
        `  找到覆盖: "${s.substring(left, right + 1)}" (长度=${windowLen}), ` +
        `当前最优: "${s.substring(start, start + minLen)}"`
      )

      const d = s[left]
      if (need.has(d)) {
        if (window.get(d) === need.get(d)) valid--
        window.set(d, window.get(d)! - 1)
      }
      left++
    }
  }

  if (minLen === Infinity) {
    lines.push('  结果: 未找到覆盖子串')
  } else {
    lines.push(`  结果: 最小覆盖子串 = "${s.substring(start, start + minLen)}" (长度 ${minLen})`)
  }
}
