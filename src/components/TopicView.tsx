import { useState, lazy, Suspense } from 'react'
import { topicRegistry } from '../topics/registry'

interface TopicViewProps {
  topicId: string
  onBack: () => void
}

type Tab = 'article' | 'visualization' | 'demo' | 'quiz'

export function TopicView({ topicId, onBack }: TopicViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('article')
  const topic = topicRegistry.get(topicId)

  if (!topic) {
    return (
      <div className="topic-not-found">
        <h2>主题未找到</h2>
        <button className="btn btn-primary" onClick={onBack}>返回</button>
      </div>
    )
  }

  const Visualization = lazy(() =>
    import(`../topics/${topicId}/visualization.tsx`).then(m => ({ default: m.default }))
  )

  return (
    <div className="topic-view">
      <div className="topic-header">
        <button className="btn btn-secondary" onClick={onBack}>← 返回</button>
        <h2>{topic.metadata.title}</h2>
        <span className={`difficulty difficulty-${topic.metadata.difficulty}`}>
          {topic.metadata.difficulty === 'beginner' ? '入门' : topic.metadata.difficulty === 'intermediate' ? '进阶' : '高级'}
        </span>
      </div>

      <nav className="topic-tabs">
        {(['article', 'visualization', 'demo', 'quiz'] as Tab[]).map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'article' ? '文章' : tab === 'visualization' ? '可视化' : tab === 'demo' ? '演示' : '测验'}
          </button>
        ))}
      </nav>

      <div className="topic-content">
        <Suspense fallback={<div>加载中...</div>}>
          {activeTab === 'article' && (
            <div className="article-content" dangerouslySetInnerHTML={{ __html: topic.articleHtml }} />
          )}
          {activeTab === 'visualization' && <Visualization />}
          {activeTab === 'demo' && <DemoSection topicId={topicId} />}
          {activeTab === 'quiz' && <QuizSection quiz={topic.quiz} />}
        </Suspense>
      </div>
    </div>
  )
}

function DemoSection({ topicId }: { topicId: string }) {
  const [output, setOutput] = useState<string>('')

  const runDemo = async () => {
    try {
      const module = await import(`../topics/${topicId}/demo.ts`)
      const result = module.default()
      setOutput(result)
    } catch {
      setOutput('演示加载失败')
    }
  }

  return (
    <div className="demo-section">
      <button className="btn btn-primary" onClick={runDemo}>运行演示</button>
      <pre className="demo-output">{output || '点击按钮运行演示'}</pre>
    </div>
  )
}

function QuizSection({ quiz }: { quiz: { question: string; options: string[]; answer: number; explanation: string }[] }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const q = quiz[current]

  return (
    <div className="quiz-section">
      <div className="quiz-progress">
        第 {current + 1} / {quiz.length} 题
      </div>
      <h3>{q.question}</h3>
      <div className="quiz-options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className={`quiz-option ${selected === i ? (i === q.answer ? 'correct' : 'wrong') : ''} ${showAnswer && i === q.answer ? 'correct' : ''}`}
            onClick={() => { setSelected(i); setShowAnswer(true) }}
            disabled={showAnswer}
          >
            {opt}
          </button>
        ))}
      </div>
      {showAnswer && (
        <div className="quiz-explanation">
          <p><strong>解析：</strong>{q.explanation}</p>
          <button className="btn btn-primary" onClick={() => { setCurrent(c => c + 1); setSelected(null); setShowAnswer(false) }} disabled={current >= quiz.length - 1}>
            下一题
          </button>
        </div>
      )}
    </div>
  )
}
