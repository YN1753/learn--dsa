import { topicRegistry } from '../registry'
import type { TopicMetadata, QuizQuestion } from '../../types'
import metadataJson from './metadata.json'
import quizJson from './quiz.json'

const metadata: TopicMetadata = metadataJson as TopicMetadata
const quiz: QuizQuestion[] = quizJson as QuizQuestion[]

// Simple markdown to HTML converter for article content
function markdownToHtml(md: string): string {
  let html = md

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Code blocks (fenced)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `<pre><code class="language-${lang}">${escaped}</code></pre>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Tables
  html = html.replace(
    /^\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/gm,
    (_match, headerRow, bodyRows) => {
      const headers = headerRow
        .split('|')
        .map((h: string) => h.trim())
        .filter((h: string) => h)
      const rows = bodyRows
        .trim()
        .split('\n')
        .map((row: string) =>
          row
            .split('|')
            .map((c: string) => c.trim())
            .filter((c: string) => c)
        )

      let table = '<table>\n<thead><tr>'
      headers.forEach((h: string) => {
        table += `<th>${h}</th>`
      })
      table += '</tr></thead>\n<tbody>'
      rows.forEach((row: string[]) => {
        table += '<tr>'
        row.forEach((cell: string) => {
          table += `<td>${cell}</td>`
        })
        table += '</tr>'
      })
      table += '</tbody>\n</table>'
      return table
    }
  )

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // Paragraphs - wrap lines that aren't already in block elements
  const lines = html.split('\n')
  const result: string[] = []
  let inBlock = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<table') || trimmed.startsWith('<thead') || trimmed.startsWith('<tbody') || trimmed.startsWith('<tr') || trimmed.startsWith('</') || trimmed.startsWith('<li')) {
      result.push(line)
      if (trimmed.startsWith('<pre')) inBlock = true
      if (trimmed.startsWith('</pre>')) inBlock = false
    } else if (trimmed === '') {
      result.push('')
    } else if (!inBlock) {
      result.push(`<p>${trimmed}</p>`)
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}

// Read the raw article markdown and convert to HTML
const articleRaw = `# 栈 (Stack)

## 概念解释

栈是一种遵循**后进先出**（LIFO, Last In First Out）原则的线性数据结构。想象一摞叠放的盘子：你只能从最顶部拿起盘子（弹出），也只能把新盘子放在最顶部（压入）。

栈只允许在一端（称为**栈顶**）进行插入和删除操作，另一端称为**栈底**。栈底是固定的，最先放入的元素位于栈底。

### 核心操作

- **push（压栈）**：将一个元素添加到栈顶。时间复杂度 O(1)
- **pop（弹栈）**：移除并返回栈顶元素。时间复杂度 O(1)
- **peek / top（查看栈顶）**：返回栈顶元素但不移除。时间复杂度 O(1)
- **isEmpty（判空）**：检查栈是否为空。时间复杂度 O(1)

所有操作都在栈顶进行，因此每个操作的时间复杂度都是 O(1)。

## 为什么重要

栈虽然结构简单，但它是计算机科学中最基础、最重要的数据结构之一：

### 函数调用栈

每次调用函数时，系统会将函数的返回地址、局部变量等信息压入**调用栈**（Call Stack）。函数返回时，这些信息从栈中弹出。这就是为什么递归能够工作的基础——每次递归调用都创建一个新的栈帧。

### 表达式求值

编译器使用栈来计算数学表达式。中缀表达式（如 3 + 4 * 2）通过栈转换为后缀表达式，再用栈进行求值。

### 回溯算法

在迷宫求解、八皇后等问题中，栈用于记录已走过的路径。当遇到死胡同时，回退到上一个分叉点重新选择。

### 深度优先搜索 (DFS)

图和树的深度优先搜索本质上就是栈操作的递归版本，也可以用显式栈来实现非递归版本。

## 核心原理

### 基于数组的实现

数组实现使用动态数组存储元素，push 在尾部添加，pop 从尾部移除。

**优点**：内存连续，缓存友好，实现简单。
**缺点**：需要预设大小（静态数组）或可能浪费内存（动态数组扩容）。

### 基于链表的实现

链表实现在头部插入和删除节点，每个节点包含数据和指向下一个节点的指针。

**优点**：动态大小，不需要预设容量。
**缺点**：每个节点需要额外的指针空间，内存不连续。

### 两种实现的比较

| 特性 | 数组实现 | 链表实现 |
|------|---------|---------|
| 内存分配 | 连续 | 分散 |
| 容量 | 固定/需扩容 | 动态 |
| 缓存性能 | 好 | 较差 |
| 额外开销 | 无 | 每节点一个指针 |
| push/pop | O(1) 均摊 | O(1) |

## 可视化说明

在可视化演示中，栈被表示为一个垂直的容器：

- **栈底**在下方，**栈顶**在上方
- **压入操作**：新元素从顶部滑入
- **弹出操作**：顶部元素滑出
- **查看栈顶**：顶部元素高亮显示

每个操作都有动画效果，帮助你直观理解栈的工作方式。

## 常见错误

### 栈溢出 (Stack Overflow)

当栈已满时继续压入元素就会发生栈溢出。在基于数组的固定大小栈中，这是一个真实的问题。在递归中，过深的递归调用也会耗尽调用栈空间。

### 空栈弹出

对空栈执行 pop 或 peek 操作是常见的边界错误。始终在操作前检查栈是否为空。

### 混淆栈和队列

初学者容易混淆栈（LIFO）和队列（FIFO）的特性。记住：栈像一摞盘子，队列像排队买票。

## 实际应用

### 撤销/重做 (Undo/Redo)

文字编辑器使用两个栈实现撤销重做功能：撤销栈记录操作，执行撤销时将操作移入重做栈。

### 浏览器历史记录

浏览器的"后退"按钮使用栈来记录访问过的页面。每次访问新页面，当前页面被压入栈。

### 括号匹配

检查括号是否匹配是栈的经典应用。遇到左括号入栈，遇到右括号时检查栈顶是否匹配。

### 后缀表达式求值

后缀表达式（逆波兰表示法）不需要括号，用栈可以优雅地求值。遇到数字入栈，遇到运算符弹出两个操作数计算后入栈。

## 总结

栈是一种简单但强大的数据结构，遵循后进先出(LIFO)原则。它的所有核心操作（push、pop、peek）都是 O(1) 时间复杂度。

栈的关键特性：
- **操作受限**：只能在栈顶进行插入和删除
- **高效**：所有基本操作都是常数时间
- **用途广泛**：从函数调用到表达式求值，从撤销功能到括号匹配

理解栈是理解更复杂数据结构和算法的基础。递归、深度优先搜索、动态规划等高级概念都与栈密切相关。`

const articleHtml = markdownToHtml(articleRaw)

topicRegistry.register('stack', {
  metadata,
  articleHtml,
  quiz,
  getVisualization: () => import('./visualization.tsx'),
  getDemo: () => import('./demo.ts'),
})
