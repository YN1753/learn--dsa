function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffleArray(arr: number[]): number[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function randomizedPartition(arr: number[], lo: number, hi: number): number {
  const pivotIdx = randomInt(lo, hi)
  ;[arr[pivotIdx], arr[hi]] = [arr[hi], arr[pivotIdx]]
  const pivot = arr[hi]
  let i = lo
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      i++
    }
  }
  ;[arr[i], arr[hi]] = [arr[hi], arr[i]]
  return i
}

function randomizedSelect(arr: number[], lo: number, hi: number, k: number): number {
  if (lo === hi) return arr[lo]
  const pivotIdx = randomizedPartition(arr, lo, hi)
  const rank = pivotIdx - lo
  if (k === rank) return arr[pivotIdx]
  else if (k < rank) return randomizedSelect(arr, lo, pivotIdx - 1, k)
  else return randomizedSelect(arr, pivotIdx + 1, hi, k - rank - 1)
}

export default function randomizedAlgorithmDemo(): string {
  const output: string[] = []

  output.push('=== 随机化算法演示 ===\n')

  // 1. 随机洗牌 (Fisher-Yates)
  output.push('1. Fisher-Yates 随机洗牌')
  const original = [1, 2, 3, 4, 5, 6, 7, 8]
  output.push(`   原始数组: [${original.join(', ')}]`)
  for (let i = 0; i < 3; i++) {
    const shuffled = shuffleArray(original)
    output.push(`   洗牌结果 ${i + 1}: [${shuffled.join(', ')}]`)
  }
  output.push('')

  // 2. 随机快速排序
  output.push('2. 随机快速排序')
  const unsorted = [38, 27, 43, 3, 9, 82, 10, 55, 21, 64]
  output.push(`   排序前: [${unsorted.join(', ')}]`)
  const toSort = [...unsorted]
  const sorted = randomizedQuickSort(toSort)
  output.push(`   排序后: [${sorted.join(', ')}]`)
  output.push(`   使用随机 pivot 选择，期望 O(n log n)`)
  output.push('')

  // 3. 随机选择算法
  output.push('3. 随机选择算法 (找第 k 小元素)')
  const data = [38, 27, 43, 3, 9, 82, 10, 55, 21, 64]
  output.push(`   数组: [${data.join(', ')}]`)
  for (const k of [0, 3, 9]) {
    const result = randomizedSelect([...data], 0, data.length - 1, k)
    output.push(`   第 ${k + 1} 小元素 = ${result} (期望 O(n))`)
  }
  output.push('')

  // 4. Miller-Rabin 素性测试
  output.push('4. Miller-Rabin 素性测试 (Monte Carlo)')
  const testNumbers = [2, 7, 15, 17, 561, 1105, 65537]
  for (const n of testNumbers) {
    const isPrime = millerRabin(n, 5)
    output.push(`   ${n} -> ${isPrime ? '可能是素数' : '是合数'}`)
  }
  output.push(`   注意: 561 = 3 * 11 * 17 是 Carmichael 数，但多次测试可提高准确率`)
  output.push('')

  // 5. 通用哈希
  output.push('5. 通用哈希函数示例')
  const a = randomInt(1, 997)
  const b = randomInt(0, 997)
  const p = 1009
  const m = 16
  output.push(`   随机选取参数: a=${a}, b=${b}, p=${p}, m=${m}`)
  output.push(`   哈希函数: h(x) = ((a*x + b) mod p) mod m`)
  const sampleKeys = [10, 25, 42, 100, 255]
  for (const key of sampleKeys) {
    const hashVal = ((a * key + b) % p) % m
    output.push(`   h(${key}) = ${hashVal}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}

function randomizedQuickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr
  rqsHelper(arr, 0, arr.length - 1)
  return arr
}

function rqsHelper(arr: number[], lo: number, hi: number): void {
  if (lo < hi) {
    const p = randomizedPartition(arr, lo, hi)
    rqsHelper(arr, lo, p - 1)
    rqsHelper(arr, p + 1, hi)
  }
}

function millerRabin(n: number, k: number): boolean {
  if (n < 2) return false
  if (n === 2 || n === 3) return true
  if (n % 2 === 0) return false

  // Write n-1 as 2^r * d
  let r = 0
  let d = n - 1
  while (d % 2 === 0) {
    d /= 2
    r++
  }

  for (let i = 0; i < k; i++) {
    const a = randomInt(2, n - 2)
    let x = modPow(a, d, n)

    if (x === 1 || x === n - 1) continue

    let found = false
    for (let j = 0; j < r - 1; j++) {
      x = modMul(x, x, n)
      if (x === n - 1) {
        found = true
        break
      }
    }
    if (!found) return false
  }

  return true
}

function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  base = base % mod
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = modMul(result, base, mod)
    }
    exp = Math.floor(exp / 2)
    base = modMul(base, base, mod)
  }
  return result
}

function modMul(a: number, b: number, mod: number): number {
  return ((a % mod) * (b % mod)) % mod
}
