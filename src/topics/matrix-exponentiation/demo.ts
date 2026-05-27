type Matrix = number[][]

function matMul(A: Matrix, B: Matrix, mod: number): Matrix {
  const n = A.length
  const m = B[0].length
  const k = B.length
  const C: Matrix = Array.from({ length: n }, () => new Array(m).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      for (let p = 0; p < k; p++) {
        C[i][j] = (C[i][j] + A[i][p] * B[p][j]) % mod
      }
    }
  }
  return C
}

function matPow(base: Matrix, exp: number, mod: number): Matrix {
  const n = base.length
  let result: Matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  )
  let current = base
  let e = exp

  while (e > 0) {
    if (e & 1) {
      result = matMul(result, current, mod)
    }
    current = matMul(current, current, mod)
    e >>= 1
  }
  return result
}

function fibonacciMatrix(n: number, mod: number): number {
  if (n <= 0) return 0
  if (n === 1) return 1

  const T: Matrix = [
    [1, 1],
    [1, 0],
  ]
  const Tn = matPow(T, n - 1, mod)
  return Tn[0][0]
}

function naiveFibonacci(n: number, mod: number): number {
  if (n <= 0) return 0
  if (n === 1) return 1
  let a = 0
  let b = 1
  for (let i = 2; i <= n; i++) {
    const c = (a + b) % mod
    a = b
    b = c
  }
  return b
}

export default function matrixExponentiationDemo(): string {
  const output: string[] = []
  const MOD = 10 ** 9 + 7

  output.push('=== 矩阵快速幂演示 ===\n')

  // 基本矩阵乘法演示
  output.push('1. 矩阵乘法演示:')
  const A: Matrix = [
    [1, 2],
    [3, 4],
  ]
  const B: Matrix = [
    [5, 6],
    [7, 8],
  ]
  const C = matMul(A, B, MOD)
  output.push(`   A = [[${A[0].join(', ')}], [${A[1].join(', ')}]]`)
  output.push(`   B = [[${B[0].join(', ')}], [${B[1].join(', ')}]]`)
  output.push(`   A × B = [[${C[0].join(', ')}], [${C[1].join(', ')}]]\n`)

  // 矩阵快速幂演示
  output.push('2. 矩阵快速幂演示 (T = [[1,1],[1,0]], 计算 T^8):')
  const T: Matrix = [
    [1, 1],
    [1, 0],
  ]
  const T8 = matPow(T, 8, MOD)
  output.push(`   T^8 = [[${T8[0].join(', ')}], [${T8[1].join(', ')}]]`)
  output.push(`   二进制分解: 8 = 1000₂, 只需 3 次矩阵平方\n`)

  // 斐波那契数列对比
  output.push('3. 斐波那契数列计算对比:')
  const testValues = [10, 50, 100, 1000, 100000]
  for (const n of testValues) {
    const t0 = performance.now()
    const matrixResult = fibonacciMatrix(n, MOD)
    const t1 = performance.now()
    let naiveResult = -1
    let naiveTime = -1
    if (n <= 10000) {
      const t2 = performance.now()
      naiveResult = naiveFibonacci(n, MOD)
      const t3 = performance.now()
      naiveTime = t3 - t2
    }
    const matrixTime = t1 - t0

    output.push(`   F(${n}):`)
    output.push(`     矩阵快速幂: ${matrixResult}  (${matrixTime.toFixed(3)} ms)`)
    if (naiveResult >= 0) {
      output.push(`     朴素递推:   ${naiveResult}  (${naiveTime!.toFixed(3)} ms)`)
    } else {
      output.push(`     朴素递推:   (n 过大，跳过)`)
    }
    output.push('')
  }

  // 图上路径计数
  output.push('4. 图上路径计数示例:')
  output.push('   有向图邻接矩阵 (3 个节点):')
  const adj: Matrix = [
    [0, 1, 1],
    [1, 0, 1],
    [0, 1, 0],
  ]
  output.push(`   [[${adj[0].join(', ')}], [${adj[1].join(', ')}], [${adj[2].join(', ')}]]`)

  for (const k of [2, 3, 5]) {
    const adjK = matPow(adj, k, MOD)
    let totalPaths = 0
    for (const row of adjK) {
      for (const v of row) {
        totalPaths += v
      }
    }
    output.push(`   长度为 ${k} 的路径总数: ${totalPaths}`)
    output.push(`   A^${k} = [[${adjK[0].join(', ')}], [${adjK[1].join(', ')}], [${adjK[2].join(', ')}]]`)
  }
  output.push('')

  // 线性递推示例
  output.push('5. 三阶线性递推示例:')
  output.push('   f(n) = 2*f(n-1) + f(n-2) + 3*f(n-3), f(0)=1, f(1)=1, f(2)=3')
  const T3: Matrix = [
    [2, 1, 3],
    [1, 0, 0],
    [0, 1, 0],
  ]
  function tribonacci(n: number): number {
    if (n === 0) return 1
    if (n === 1) return 1
    if (n === 2) return 3
    const Tn = matPow(T3, n - 2, MOD)
    return (Tn[0][0] * 3 + Tn[0][1] * 1 + Tn[0][2] * 1) % MOD
  }

  for (const n of [5, 10, 20]) {
    const result = tribonacci(n)
    output.push(`   f(${n}) = ${result}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
