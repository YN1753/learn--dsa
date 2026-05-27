import { topicRegistry } from '../registry'
import type { TopicMetadata, QuizQuestion } from '../../types'
import metadataJson from './metadata.json'
import quizJson from './quiz.json'
import articleMd from './article.md?raw'

const metadata: TopicMetadata = { ...metadataJson, difficulty: metadataJson.difficulty as TopicMetadata['difficulty'] }
const quiz: QuizQuestion[] = quizJson as QuizQuestion[]

function simpleMarkdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m: string, _l: string, c: string) => `<pre><code>${c.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
    .replace(/^\|(.+)\|$/gm, (_m: string, content: string) => {
      const cells = content.split('|').map(c => c.trim())
      if (cells.every(c => /^[-:]+$/.test(c))) return '<!-- table separator -->'
      return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m: string) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .split('\n\n')
    .map((block: string) => {
      const t = block.trim()
      if (!t) return ''
      if (t.startsWith('<h')||t.startsWith('<pre')||t.startsWith('<ul')||t.startsWith('<ol')||t.startsWith('<tr')||t.startsWith('<!--')) return t
      if (t.includes('<tr>')) return `<table>${t.replace(/<!-- table separator -->/g, '')}</table>`
      return `<p>${t.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')
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
