import { topicRegistry } from '../registry'
import type { TopicMetadata } from '../../types'
import metadata from './metadata.json'
import quiz from './quiz.json'
import articleMd from './article.md?raw'

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
          trimmed.startsWith('<ol') || trimmed.startsWith('<!--')) {
        return trimmed
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

    // Clean up
    .replace(/<p><\/p>/g, '')

  return html
}

const topicMetadata: TopicMetadata = metadata as TopicMetadata

topicRegistry.register(topicMetadata.id, {
  metadata: topicMetadata,
  articleHtml: simpleMarkdownToHtml(articleMd),
  quiz,
  getVisualization: () => import('./visualization.tsx'),
  getDemo: () => import('./demo.ts'),
})
