export default function inclusionExclusionDemo(): string {
  const output: string[] = []

  output.push('=== 容斥原理演示 ===\n')

  // 1. 两个集合的容斥原理
  output.push('1. 两个集合的容斥原理')
  output.push('   |A ∪ B| = |A| + |B| - |A ∩ B|')
  const setA = new Set([1, 2, 3, 4, 5, 6, 7, 8])
  const setB = new Set([5, 6, 7, 8, 9, 10])
  const unionAB = new Set([...setA, ...setB])
  const interAB = new Set([...setA].filter(x => setB.has(x)))
  output.push(`   A = {${[...setA].join(', ')}}  |A| = ${setA.size}`)
  output.push(`   B = {${[...setB].join(', ')}}  |B| = ${setB.size}`)
  output.push(`   A ∩ B = {${[...interAB].join(', ')}}  |A ∩ B| = ${interAB.size}`)
  output.push(`   A ∪ B = {${[...unionAB].join(', ')}}  |A ∪ B| = ${unionAB.size}`)
  output.push(`   验证: ${setA.size} + ${setB.size} - ${interAB.size} = ${setA.size + setB.size - interAB.size}\n`)

  // 2. 三个集合的容斥原理
  output.push('2. 三个集合的容斥原理')
  output.push('   |A ∪ B ∪ C| = |A| + |B| + |C| - |A∩B| - |A∩C| - |B∩C| + |A∩B∩C|')
  const setC = new Set([7, 8, 9, 10, 11, 12])
  const interAC = new Set([...setA].filter(x => setC.has(x)))
  const interBC = new Set([...setB].filter(x => setC.has(x)))
  const interABC = new Set([...interAB].filter(x => setC.has(x)))
  const unionABC = new Set([...setA, ...setB, ...setC])
  output.push(`   A = {${[...setA].join(', ')}}  |A| = ${setA.size}`)
  output.push(`   B = {${[...setB].join(', ')}}  |B| = ${setB.size}`)
  output.push(`   C = {${[...setC].join(', ')}}  |C| = ${setC.size}`)
  output.push(`   |A∩B| = ${interAB.size}, |A∩C| = ${interAC.size}, |B∩C| = ${interBC.size}`)
  output.push(`   |A∩B∩C| = ${interABC.size}`)
  const calculated = setA.size + setB.size + setC.size - interAB.size - interAC.size - interBC.size + interABC.size
  output.push(`   计算: ${setA.size}+${setB.size}+${setC.size}-${interAB.size}-${interAC.size}-${interBC.size}+${interABC.size} = ${calculated}`)
  output.push(`   实际 |A∪B∪C| = ${unionABC.size}\n`)

  // 3. 求 1~100 中能被 2、3、5 整除的数的个数
  output.push('3. 1~100 中能被 2、3 或 5 整除的数')
  let count2 = 0, count3 = 0, count5 = 0
  let count6 = 0, count10 = 0, count15 = 0, count30 = 0
  for (let i = 1; i <= 100; i++) {
    if (i % 2 === 0) count2++
    if (i % 3 === 0) count3++
    if (i % 5 === 0) count5++
    if (i % 6 === 0) count6++
    if (i % 10 === 0) count10++
    if (i % 15 === 0) count15++
    if (i % 30 === 0) count30++
  }
  output.push(`   |A|(被2整除) = ${count2}`)
  output.push(`   |B|(被3整除) = ${count3}`)
  output.push(`   |C|(被5整除) = ${count5}`)
  output.push(`   |A∩B|(被6整除) = ${count6}`)
  output.push(`   |A∩C|(被10整除) = ${count10}`)
  output.push(`   |B∩C|(被15整除) = ${count15}`)
  output.push(`   |A∩B∩C|(被30整除) = ${count30}`)
  const result3 = count2 + count3 + count5 - count6 - count10 - count15 + count30
  output.push(`   容斥: ${count2}+${count3}+${count5}-${count6}-${count10}-${count15}+${count30} = ${result3}\n`)

  // 4. 错排问题
  output.push('4. 错排问题 (Derangement)')
  function derangement(n: number): number {
    if (n === 0) return 1
    if (n === 1) return 0
    return (n - 1) * (derangement(n - 1) + derangement(n - 2))
  }
  output.push('   错排: 所有元素都不在原来位置上的排列')
  for (let n = 1; n <= 7; n++) {
    output.push(`   D(${n}) = ${derangement(n)}`)
  }
  output.push('')

  // 5. 欧拉函数
  output.push('5. 欧拉函数 φ(n) 的容斥推导')
  function eulerPhi(n: number): number {
    let result = n
    let temp = n
    for (let p = 2; p * p <= temp; p++) {
      if (temp % p === 0) {
        while (temp % p === 0) temp /= p
        result -= result / p
      }
    }
    if (temp > 1) result -= result / temp
    return result
  }
  const testValues = [12, 30, 36, 60, 100]
  for (const n of testValues) {
    output.push(`   φ(${n}) = ${eulerPhi(n)}`)
  }
  output.push('')

  // 6. 莫比乌斯函数
  output.push('6. 莫比乌斯函数 μ(n)')
  function mobius(n: number): number {
    if (n === 1) return 1
    let factors = 0
    let temp = n
    for (let p = 2; p * p <= temp; p++) {
      if (temp % p === 0) {
        factors++
        temp /= p
        if (temp % p === 0) return 0 // 有平方因子
      }
    }
    if (temp > 1) factors++
    return factors % 2 === 0 ? 1 : -1
  }
  output.push('   μ(1) = 1')
  output.push('   μ(n) = 0 如果 n 有平方因子')
  output.push('   μ(n) = (-1)^k 如果 n 是 k 个不同素数的乘积')
  for (let i = 1; i <= 15; i++) {
    output.push(`   μ(${i}) = ${mobius(i)}`)
  }
  output.push('')

  output.push('=== 演示结束 ===')

  return output.join('\n')
}
