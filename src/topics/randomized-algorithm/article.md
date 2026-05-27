# 随机化算法 (Randomized Algorithm)

## 概念解释

随机化算法是指在算法执行过程中**引入随机性**的算法。它利用随机数来指导计算过程，从而在期望意义上获得高效性能，或简化算法设计。

### 两大分类

| 类型 | 结果正确性 | 运行时间 | 典型代表 |
|------|-----------|---------|---------|
| Las Vegas 算法 | **一定正确** | 随机变量 | 随机快速排序、随机选择 |
| Monte Carlo 算法 | **可能出错** | 确定 | Miller-Rabin 素性测试 |

**Las Vegas 算法**：永远返回正确结果，但运行时间是随机的。随机快速排序就是典型代表——无论怎么选 pivot，排序结果都是对的，只是耗时不同。

**Monte Carlo 算法**：运行时间有确定的上界，但结果有小概率出错。Miller-Rabin 素性测试可以在多项式时间内判断一个数是否为素数，但存在极小概率将合数误判为素数。

## 为什么重要

随机化算法在理论和实践中都有巨大价值：

1. **打破最坏情况**：确定性算法可能被特定输入卡到最坏情况，随机化可以消除这种可能性
2. **简化算法设计**：许多问题的随机化算法比确定性算法简单得多
3. **理论下界突破**：某些问题的最优随机化算法比最优确定性算法更快
4. **实际应用广泛**：密码学、机器学习、网络协议、游戏等领域大量使用随机化

## 核心原理

### 1. 随机快速排序

确定性快速排序在最坏情况下（已排序数组选首元素为 pivot）退化到 O(n^2)。随机选择 pivot 可以从根源上消除这个问题。

```typescript
function randomizedPartition(arr: number[], lo: number, hi: number): number {
  // 随机选择 pivot，而非固定选首/尾元素
  const pivotIdx = lo + Math.floor(Math.random() * (hi - lo + 1))
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
```

**关键性质**：无论输入数据是什么分布，随机快速排序的期望比较次数为 `2n ln n ≈ 1.39n log n`。

### 2. 随机选择算法

在无序数组中找第 k 小元素，利用随机 pivot 划分：

```typescript
function randomizedSelect(arr: number[], lo: number, hi: number, k: number): number {
  if (lo === hi) return arr[lo]

  const pivotIdx = randomizedPartition(arr, lo, hi)
  const rank = pivotIdx - lo

  if (k === rank) return arr[pivotIdx]
  else if (k < rank) return randomizedSelect(arr, lo, pivotIdx - 1, k)
  else return randomizedSelect(arr, pivotIdx + 1, hi, k - rank - 1)
}
```

**期望时间复杂度**：O(n)，比先排序再取第 k 个的 O(n log n) 更快。

### 3. Miller-Rabin 素性测试

基于费马小定理的推广，通过随机选取底数进行测试：

**基本思想**：
- 对于素数 p 和任意 a (1 < a < p)，有 `a^(p-1) ≡ 1 (mod p)`
- 如果某个 a 不满足此条件，则 p 一定是合数
- 通过多次随机选取 a 进行测试，可以高概率判断是否为素数

**单轮测试的错误概率** ≤ 1/4，进行 k 轮测试后错误概率 ≤ (1/4)^k。进行 20 轮测试，错误概率低于百万分之一。

### 4. 通用哈希 (Universal Hashing)

从一族哈希函数中随机选取一个，保证对任意输入分布都有良好的期望性能：

```typescript
// h(x) = ((a*x + b) mod p) mod m
// a, b 随机选取，p 是大于键域的大素数
function universalHash(x: number, a: number, b: number, p: number, m: number): number {
  return ((a * x + b) % p) % m
}
```

**核心保证**：对于任意两个不同的键 x ≠ y，它们发生冲突的概率 ≤ 1/m。

### 5. 随机洗牌 (Fisher-Yates)

等概率地生成所有排列之一：

```typescript
function fisherYatesShuffle(arr: number[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}
```

**时间复杂度**：O(n)，每个排列等概率出现。

## 可视化说明

在可视化界面中，可以观察随机化快速排序的运行过程：

- **蓝色区域**：当前待划分的子数组
- **高亮元素**：随机选中的 pivot
- **箭头指示**：划分过程中元素的移动方向
- **已完成区域**：已确定最终位置的元素

通过反复运行，可以看到：
- 不同的 pivot 选择导致不同的划分过程
- 最终排序结果始终相同（Las Vegas 算法的正确性）
- 平均划分较为均匀，避免了最坏情况

## 常见错误

### 1. 伪随机数质量不足

```typescript
// 错误：使用简单线性同余，周期短、相关性高
let seed = Date.now()
function badRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed
}

// 正确：使用密码学安全的随机数
function goodRandom(): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] / (0xffffffff + 1)
}
```

### 2. 随机选择 pivot 的实现错误

```typescript
// 错误：没有将 pivot 交换到正确位置
function badPartition(arr: number[], lo: number, hi: number): number {
  const pivotIdx = lo + Math.floor(Math.random() * (hi - lo + 1))
  const pivot = arr[pivotIdx]  // 取出值但没交换
  // ... 后续比较时 pivotIdx 位置的元素已变
}

// 正确：先将 pivot 交换到末尾
function goodPartition(arr: number[], lo: number, hi: number): number {
  const pivotIdx = lo + Math.floor(Math.random() * (hi - lo + 1))
  ;[arr[pivotIdx], arr[hi]] = [arr[hi], arr[pivotIdx]]
  const pivot = arr[hi]
  // ...
}
```

### 3. Miller-Rabin 忘记处理特殊情况

```typescript
// 错误：没有处理小于 2 的输入
function badMillerRabin(n: number): boolean {
  // n = 0, 1 时逻辑出错
}

// 正确：先处理边界情况
function goodMillerRabin(n: number, k: number): boolean {
  if (n < 2) return false
  if (n === 2 || n === 3) return true
  if (n % 2 === 0) return false
  // ...
}
```

## 实际应用

### 1. 密码学

RSA、Diffie-Hellman 等公钥密码系统依赖于大素数。Miller-Rabin 测试用于高效生成大素数候选，是密钥生成的核心步骤。

### 2. 负载均衡

使用一致性哈希（Consistent Hashing）将请求随机分配到服务器，避免热点问题。虚拟节点的随机分布在实践中有极好的均衡效果。

### 3. 蒙特卡洛方法

在物理学、金融工程中，通过大量随机采样来近似计算复杂积分、期权定价等问题。例如：

- 计算圆周率：在单位正方形内随机撒点，统计落在单位圆内的比例
- 期权定价：Black-Scholes 模型的数值解法
- 物理模拟：Metropolis 算法、蒙特卡洛树搜索

### 4. 机器学习

- **随机梯度下降 (SGD)**：每次随机选取一小批数据计算梯度，是深度学习训练的核心算法
- **随机森林**：通过随机选取特征和样本来构建多棵决策树，降低过拟合风险
- **Dropout**：训练时随机丢弃神经元，是一种正则化技术

### 5. 网络协议

- **指数退避 (Exponential Backoff)**：冲突后等待随机时间再重试，避免多节点同时冲突
- **随机早期检测 (RED)**：路由器以一定概率随机丢包，避免全局同步

## 总结

随机化算法是一种强大的算法设计范式：

**核心优势**：
- 打破确定性算法的最坏情况限制
- 算法设计更简洁、更优雅
- 期望性能往往接近最优
- 对任意输入分布都有良好保证

**两类算法**：
- **Las Vegas 算法**：结果一定正确，运行时间随机（如随机快排）
- **Monte Carlo 算法**：运行时间确定，结果可能出错（如 Miller-Rabin）

**典型应用**：
- 排序与选择：随机快速排序 O(n log n)，随机选择 O(n)
- 素性测试：Miller-Rabin 多项式时间判断素数
- 哈希表：通用哈希保证任意输入的期望 O(1) 操作
- 密码学、机器学习、网络协议等

随机化算法体现了「以概率换确定性」的思想：虽然单次运行可能遇到不理想的结果，但在概率意义上，它提供了高效且可靠的保证。
