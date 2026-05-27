import { topicRegistry } from '../registry'
import type { TopicMetadata, QuizQuestion } from '../../types'
import metadataJson from './metadata.json'
import quizJson from './quiz.json'
import articleMd from './article.md?raw'

const metadata: TopicMetadata = {
  ...metadataJson,
  difficulty: metadataJson.difficulty as TopicMetadata['difficulty'],
}
const quiz: QuizQuestion[] = quizJson as QuizQuestion[]

function simpleMarkdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')

    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')

    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')

    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_match: string, _lang: string, code: string) => {
      return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    })

    // Tables
    .replace(/^\|(.+)\|$/gm, (_match: string, content: string) => {
      const cells = content.split('|').map(c => c.trim())
      if (cells.every(c => /^[-:]+$/.test(c))) return '<!-- table separator -->'
      const cellTag = 'td'
      return `<tr>${cells.map(c => `<${cellTag}>${c}</${cellTag}>`).join('')}</tr>`
    })

    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match: string) => `<ul>${match}</ul>`)

    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

    // Paragraphs - wrap lines that aren't already wrapped
    .split('\n\n')
    .map((block: string) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<ul') ||
          trimmed.startsWith('<ol') || trimmed.startsWith('<tr') || trimmed.startsWith('<!--') ||
          trimmed.startsWith('<blockquote')) {
        return trimmed
      }
      if (trimmed.includes('<tr>')) {
        return `<table>${trimmed.replace(/<!-- table separator -->/g, '')}</table>`
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

    // Clean up
    .replace(/<p><\/p>/g, '')
    .replace(/<!-- table separator -->/g, '')

  return html
}

topicRegistry.register(metadata.id, {
  metadata,
  articleHtml: simpleMarkdownToHtml(articleMd),
  quiz,
  getVisualization: () => import('./visualization.tsx'),
  getDemo: () => import('./demo.ts'),
})
