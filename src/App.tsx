import { useState } from 'react'
import { TopicList } from './components/TopicList'
import { TopicView } from './components/TopicView'

function App() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  return (
    <div className="app">
      <header className="app-header">
        <h1>数据结构与算法 - 可视化知识库</h1>
        <p>交互式学习数据结构与算法</p>
      </header>
      <main className="app-main">
        {selectedTopic ? (
          <TopicView topicId={selectedTopic} onBack={() => setSelectedTopic(null)} />
        ) : (
          <TopicList onSelect={setSelectedTopic} />
        )}
      </main>
    </div>
  )
}

export default App
