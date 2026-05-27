// 选择排序 Step-by-Step Demo

export interface SortStep {
  array: number[]
  comparing: number[]
  minIndex: number
  sortedBoundary: number
  description: string
}

export function generateSteps(input: number[]): SortStep[] {
  const arr = [...input]
  const steps: SortStep[] = []
  const n = arr.length

  steps.push({
    array: [...arr],
    comparing: [],
    minIndex: -1,
    sortedBoundary: 0,
    description: '初始数组',
  })

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i

    steps.push({
      array: [...arr],
      comparing: [],
      minIndex: minIdx,
      sortedBoundary: i,
      description: `第 ${i + 1} 轮：假设最小值在位置 ${i}（值为 ${arr[i]}）`,
    })

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        comparing: [minIdx, j],
        minIndex: minIdx,
        sortedBoundary: i,
        description: `比较 ${arr[minIdx]} 和 ${arr[j]}`,
      })

      if (arr[j] < arr[minIdx]) {
        minIdx = j
        steps.push({
          array: [...arr],
          comparing: [],
          minIndex: minIdx,
          sortedBoundary: i,
          description: `发现更小值 ${arr[minIdx]}，更新最小值位置`,
        })
      }
    }

    if (minIdx !== i) {
      steps.push({
        array: [...arr],
        comparing: [i, minIdx],
        minIndex: minIdx,
        sortedBoundary: i,
        description: `交换位置 ${i}（${arr[i]}）和位置 ${minIdx}（${arr[minIdx]}）`,
      })
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
    }

    steps.push({
      array: [...arr],
      comparing: [],
      minIndex: -1,
      sortedBoundary: i + 1,
      description: `第 ${i + 1} 轮结束，${arr[i]} 就位`,
    })
  }

  steps.push({
    array: [...arr],
    comparing: [],
    minIndex: -1,
    sortedBoundary: n,
    description: '排序完成！',
  })

  return steps
}

export const defaultArray = [64, 25, 12, 22, 11, 90, 45]

export const demo = {
  title: '选择排序演示',
  description: '逐步展示选择排序的完整过程',
  generateSteps,
  defaultArray,
}

export default function runDemo(): string {
  const lines: string[] = []
  lines.push('=== 选择排序 (Selection Sort) 演示 ===')
  lines.push('')
  const arr = [...defaultArray]
  lines.push(`初始数组: [${arr.join(', ')}]`)
  lines.push('')
  const steps = generateSteps(arr)
  for (const step of steps) {
    lines.push(step.description)
    lines.push(`  数组: [${step.array.join(', ')}]`)
  }
  lines.push('')
  lines.push('=== 演示结束 ===')
  return lines.join('\n')
}
