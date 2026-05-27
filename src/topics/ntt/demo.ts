const P = 998244353
const G = 3

function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  let b = base % mod
  let e = exp
  while (e > 0) {
    if (e & 1) result = Number(BigInt(result) * BigInt(b) % BigInt(mod))
    b = Number(BigInt(b) * BigInt(b) % BigInt(mod))
    e >>= 1
  }
  return result
}

function ntt(a: number[], n: number, invert: boolean): void {
  // Bit-reversal permutation
  const rev: number[] = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    rev[i] = (rev[i >> 1] >> 1) | ((i & 1) ? (n >> 1) : 0)
  }
  for (let i = 0; i < n; i++) {
    if (i < rev[i]) {
      const tmp = a[i]
      a[i] = a[rev[i]]
      a[rev[i]] = tmp
    }
  }

  // Butterfly operations
  const root = invert ? modPow(G, P - 2, P) : G
  for (let len = 2; len <= n; len <<= 1) {
    const wn = modPow(root, (P - 1) / len, P)
    for (let i = 0; i < n; i += len) {
      let w = 1
      for (let j = 0; j < len / 2; j++) {
        const u = a[i + j]
        const v = Number(BigInt(a[i + j + len / 2]) * BigInt(w) % BigInt(P))
        a[i + j] = (u + v) % P
        a[i + j + len / 2] = ((u - v) % P + P) % P
        w = Number(BigInt(w) * BigInt(wn) % BigInt(P))
      }
    }
  }

  if (invert) {
    const invN = modPow(n, P - 2, P)
    for (let i = 0; i < n; i++) {
      a[i] = Number(BigInt(a[i]) * BigInt(invN) % BigInt(P))
    }
  }
}

function polyMultiply(a: number[], b: number[]): number[] {
  const n = a.length
  const m = b.length
  const N = 1 << Math.ceil(Math.log2(n + m - 1))

  const fa = [...a, ...new Array(N - n).fill(0)]
  const fb = [...b, ...new Array(N - m).fill(0)]

  ntt(fa, N, false)
  ntt(fb, N, false)

  for (let i = 0; i < N; i++) {
    fa[i] = Number(BigInt(fa[i]) * BigInt(fb[i]) % BigInt(P))
  }

  ntt(fa, N, true)

  return fa.slice(0, n + m - 1)
}

export default function nttDemo(): string {
  const output: string[] = []

  output.push('=== 数论变换 NTT 演示 ===\n')
  output.push(`模数 p = ${P}，原根 g = ${G}\n`)

  // Example 1: Simple polynomial multiplication
  output.push('1. 多项式乘法: (1 + 2x + 3x^2) * (4 + 5x)')
  const a = [1, 2, 3]
  const b = [4, 5]
  output.push(`   A(x) = [${a.join(', ')}]`)
  output.push(`   B(x) = [${b.join(', ')}]`)

  const result = polyMultiply(a, b)
  output.push(`   C(x) = A(x) * B(x) = [${result.join(', ')}]`)
  output.push(`   验证: C(1) = ${result.reduce((s, v) => s + v, 0)}, A(1)*B(1) = ${a.reduce((s, v) => s + v, 0)} * ${b.reduce((s, v) => s + v, 0)} = ${a.reduce((s, v) => s + v, 0) * b.reduce((s, v) => s + v, 0)}\n`)

  // Example 2: Convolution
  output.push('2. 卷积运算: [1, 1, 1] * [1, 1, 1]')
  const c = [1, 1, 1]
  const d = [1, 1, 1]
  const conv = polyMultiply(c, d)
  output.push(`   结果: [${conv.join(', ')}]`)
  output.push(`   即: 1 + 2x + 3x^2 + 2x^3 + x^4\n`)

  // Example 3: Larger polynomial
  output.push('3. 较大多项式: [1, 2, 3, 4] * [5, 6, 7, 8]')
  const e = [1, 2, 3, 4]
  const f = [5, 6, 7, 8]
  const large = polyMultiply(e, f)
  output.push(`   结果: [${large.join(', ')}]\n`)

  // Show NTT process
  output.push('4. NTT 正变换过程:')
  const sample = [1, 2, 3, 0]
  output.push(`   输入: [${sample.join(', ')}]`)
  const nttResult = [...sample]
  ntt(nttResult, 4, false)
  output.push(`   NTT结果: [${nttResult.join(', ')}]`)
  const restored = [...nttResult]
  ntt(restored, 4, true)
  output.push(`   逆NTT还原: [${restored.join(', ')}]\n`)

  // Complexity comparison
  output.push('5. 复杂度比较:')
  output.push('   暴力多项式乘法: O(n^2)')
  output.push('   NTT多项式乘法: O(n log n)')
  output.push('   当 n = 10^5 时: 暴力 10^10 次运算 vs NTT 约 1.7 * 10^6 次运算\n')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
