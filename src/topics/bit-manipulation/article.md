# 位运算 (Bit Manipulation)

## 概念解释

位运算是直接对整数在内存中的**二进制表示**进行操作的运算方式。与普通的算术运算不同，位运算在最低层级上操作数据，因此效率极高。

计算机中所有数据都以二进制形式存储。例如，十进制数 `13` 在二进制中表示为 `1101`。位运算就是对这些 0 和 1 直接进行逻辑操作。

### 六种基本位运算

| 运算符 | 名称 | 符号 | 规则 | 示例 |
|--------|------|------|------|------|
| AND | 按位与 | `&` | 两位都为 1 时结果为 1 | `1101 & 1011 = 1001` |
| OR | 按位或 | `\|` | 任一位为 1 时结果为 1 | `1101 \| 1011 = 1111` |
| XOR | 按位异或 | `^` | 两位不同时结果为 1 | `1101 ^ 1011 = 0110` |
| NOT | 按位取反 | `~` | 0 变 1，1 变 0 | `~1101 = ...0010` |
| 左移 | Left Shift | `<<` | 所有位向左移动，右侧补 0 | `0011 << 1 = 0110` |
| 右移 | Right Shift | `>>` | 所有位向右移动 | `1100 >> 1 = 0110` |

```
AND (&)  按位与：
  1 1 0 1
& 1 0 1 1
---------
  1 0 0 1

OR (|)  按位或：
  1 1 0 1
| 1 0 1 1
---------
  1 1 1 1

XOR (^) 按位异或：
  1 1 0 1
^ 1 0 1 1
---------
  0 1 1 0
```

### 补码 (Two's Complement)

在计算机中，负数使用**补码**表示。补码的规则：

1. 正数的补码就是其二进制本身
2. 负数的补码 = 对应正数的二进制**取反后加 1**

```
以 8 位为例：
  +5 的二进制: 00000101
  取反:        11111010
  加 1:        11111011  ← 这就是 -5 的补码

验证: 5 + (-5) = 00000101 + 11111011 = 00000000 ✓
```

补码的优势：加法和减法可以统一处理，不需要额外的减法电路。

## 为什么重要

### 1. O(1) 集合操作

用一个整数的每一位代表一个元素是否在集合中，可以实现 O(1) 的集合操作：

```typescript
// 全集 {0, 1, 2, 3, 4}
const S = (1 << 5) - 1  // 11111 = 31

// 添加元素 2
S |= (1 << 2)

// 删除元素 2
S &= ~(1 << 2)

// 检查元素 2 是否存在
const has2 = (S & (1 << 2)) !== 0

// 两个集合的并集
const union = A | B

// 两个集合的交集
const intersection = A & B
```

### 2. 空间高效

一个 `int` 类型（32 位）可以表示 32 个元素的集合，一个 `long`（64 位）可以表示 64 个元素的集合。相比布尔数组，空间效率极高。

### 3. 底层优化

位运算是 CPU 直接支持的指令，比乘除法快得多：
- `x << 1` 等价于 `x * 2`，但更快
- `x >> 1` 等价于 `x / 2`（正数时），但更快
- `x & 1` 可以判断奇偶性

### 4. 竞赛与面试

位运算是算法竞赛和面试中的高频考点，掌握位运算技巧可以让你在很多问题上获得更简洁、更高效的解法。

## 核心原理

### 基本位操作

```typescript
// 检查第 k 位是否为 1
function checkBit(n: number, k: number): boolean {
  return (n & (1 << k)) !== 0
}

// 将第 k 位设为 1
function setBit(n: number, k: number): number {
  return n | (1 << k)
}

// 将第 k 位清零
function clearBit(n: number, k: number): number {
  return n & ~(1 << k)
}

// 翻转第 k 位
function toggleBit(n: number, k: number): number {
  return n ^ (1 << k)
}
```

### 计算置位个数 (Brian Kernighan 算法)

计算一个数的二进制中有多少个 1。Brian Kernighan 算法的核心观察：`n & (n - 1)` 会消除 `n` 的最低位的 1。

```typescript
function countSetBits(n: number): number {
  let count = 0
  while (n > 0) {
    n &= (n - 1)  // 消除最低位的 1
    count++
  }
  return count
}

// 示例: countSetBits(13) = 3
// 13 = 1101 → 1100 → 1000 → 0000，共 3 次
```

```
n = 13 (1101)
n & (n-1) = 1101 & 1100 = 1100  (count = 1)
n & (n-1) = 1100 & 1011 = 1000  (count = 2)
n & (n-1) = 1000 & 0111 = 0000  (count = 3)
结果: 3 个置位
```

### 判断 2 的幂

一个数是 2 的幂当且仅当它的二进制表示中**只有一个 1**：

```typescript
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

// 示例:
// 8  = 1000,  8 & 7 = 1000 & 0111 = 0000 → true
// 12 = 1100, 12 & 11 = 1100 & 1011 = 1000 → false
```

### 子集枚举 (位掩码)

用位掩码枚举一个集合的所有子集。如果集合有 n 个元素，则有 2^n 个子集，每个子集用一个 n 位的二进制数表示。

```typescript
function enumerateSubsets(n: number): number[][] {
  const allSubsets: number[][] = []

  for (let mask = 0; mask < (1 << n); mask++) {
    const subset: number[] = []
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.push(i)
      }
    }
    allSubsets.push(subset)
  }
  return allSubsets
}

// n = 3 时的子集:
// 000 → []
// 001 → [0]
// 010 → [1]
// 011 → [0, 1]
// 100 → [2]
// 101 → [0, 2]
// 110 → [1, 2]
// 111 → [0, 1, 2]
```

### XOR 的性质

XOR 有几个非常有用的性质：

1. **自反性**: `a ^ a = 0`（相同数异或为 0）
2. **恒等性**: `a ^ 0 = a`（与 0 异或不变）
3. **交换律**: `a ^ b = b ^ a`
4. **结合律**: `(a ^ b) ^ c = a ^ (b ^ c)`

利用这些性质，可以解决很多巧妙的问题。

## 可视化说明

在右侧的可视化面板中，你可以直观地观察位运算的工作过程：

- **二进制表示**：输入数字会显示其二进制形式，每一位用方块表示
- **高亮特定位**：可以选中某一位，观察位操作对其的影响
- **逐步演示**：每一步展示位运算的执行过程，以及二进制位的变化
- **子集枚举**：展示位掩码如何对应到具体的子集

通过控制面板，你可以：
- 输入任意数字，查看其二进制表示
- 执行各种位运算，观察位级别的变化
- 查看 Brian Kernighan 算法的逐步执行
- 枚举小集合的所有子集

## 常见错误

### 1. 运算符优先级问题

位运算符的优先级**低于**比较运算符，这是一个巨大的陷阱：

```typescript
// ❌ 错误：优先级问题
if (n & 1 == 0)  // 等价于 n & (1 == 0) → n & 0 → 0

// ✅ 正确：加括号
if ((n & 1) == 0)

// ❌ 错误
if (flags & MASK != 0)  // 等价于 flags & (MASK != 0)

// ✅ 正确
if ((flags & MASK) != 0)
```

**经验法则：在位运算表达式中，永远多加括号。**

### 2. 负数与移位

JavaScript/TypeScript 中的右移有两种：

```typescript
// 算术右移 (>>)：保留符号位
(-8) >> 1  // -4（保留负号）

// 逻辑右移 (>>>)：高位补 0
(-8) >>> 1  // 2147483644（变成很大的正数）

// ❌ 对负数使用 >>> 可能导致意外结果
// ✅ 使用 >> 进行算术右移更安全
```

### 3. 左移溢出

在 32 位整数中，左移 31 位以上会导致溢出：

```typescript
1 << 30  // 1073741824（正常）
1 << 31  // -2147483648（溢出为负数！）

// ❌ 危险：假设 1 << 31 是正数
// ✅ 安全：使用 1 << 30 并检查边界
```

### 4. 混淆逻辑运算符和位运算符

```typescript
// ❌ 错误：想做位运算却用了逻辑运算
if (a && b)   // 逻辑与，结果是布尔值
if (a || b)   // 逻辑或，结果是布尔值

// ✅ 正确：位运算
const c = a & b   // 按位与
const d = a | b   // 按位或
```

## 实际应用

### 1. 子集枚举

枚举集合 `{0, 1, 2, ..., n-1}` 的所有子集：

```typescript
function subsets(nums: number[]): number[][] {
  const n = nums.length
  const result: number[][] = []

  for (let mask = 0; mask < (1 << n); mask++) {
    const subset: number[] = []
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.push(nums[i])
      }
    }
    result.push(subset)
  }
  return result
}
```

### 2. Bitset 优化

在动态规划中，用 bitset 优化状态转移：

```typescript
// 例：判断能否从数组中选出若干数使其和为 target
function canPartition(nums: number[], target: number): boolean {
  let bitset = 1n  // 使用 BigInt 表示大 bitset
  for (const num of nums) {
    bitset |= (bitset << BigInt(num))
  }
  return (bitset & (1n << BigInt(target))) !== 0n
}
```

### 3. XOR 交换

不使用临时变量交换两个数：

```typescript
function xorSwap(a: number, b: number): [number, number] {
  a ^= b
  b ^= a
  a ^= b
  return [a, b]
}

// 原理:
// a = a ^ b
// b = (a ^ b) ^ b = a ^ (b ^ b) = a ^ 0 = a
// a = (a ^ b) ^ a = b ^ (a ^ a) = b ^ 0 = b
```

### 4. 找唯一元素

一个数组中，除了一个元素只出现一次，其他元素都出现两次，找出那个唯一元素：

```typescript
function singleNumber(nums: number[]): number {
  let result = 0
  for (const num of nums) {
    result ^= num  // 成对的数异或后变为 0
  }
  return result
}

// 示例: [4, 1, 2, 1, 2]
// 4 ^ 1 ^ 2 ^ 1 ^ 2 = 4 ^ (1^1) ^ (2^2) = 4 ^ 0 ^ 0 = 4
```

### 5. 权限与掩码

在系统设计中，用位掩码表示权限：

```typescript
const READ    = 1 << 0  // 001 = 1
const WRITE   = 1 << 1  // 010 = 2
const EXECUTE = 1 << 2  // 100 = 4

// 授予权限
let permission = 0
permission |= READ | WRITE  // 011 = 3

// 检查权限
const canRead = (permission & READ) !== 0     // true
const canExec = (permission & EXECUTE) !== 0  // false

// 撤销权限
permission &= ~WRITE  // 001 = 1

// 切换权限
permission ^= EXECUTE  // 101 = 5
```

## 总结

位运算是一种直接操作二进制位的底层技巧，掌握它可以让你写出更高效、更简洁的代码。

核心要点：

- **六种基本运算**：AND、OR、XOR、NOT、左移、右移
- **基本操作**：检查位、设置位、清除位、翻转位
- **Brian Kernighan 算法**：`n & (n-1)` 消除最低位 1，用于计数和判断 2 的幂
- **XOR 性质**：自反性 `a^a=0`，恒等性 `a^0=a`，交换律和结合律
- **子集枚举**：用位掩码枚举 2^n 个子集
- **常见陷阱**：运算符优先级（加括号）、负数移位、左移溢出

位运算的题目在面试和竞赛中非常常见。建议从基本的位操作开始练习，逐步掌握子集枚举、XOR 技巧等进阶用法。
