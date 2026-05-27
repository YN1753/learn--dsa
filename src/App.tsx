import { useState } from 'react'
import { TopicList } from './components/TopicList'
import { TopicView } from './components/TopicView'
import { Sidebar } from './components/Sidebar'

function App() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app">
      <Sidebar
        isOpen={sidebarOpen}
        selectedTopic={selectedTopic}
        onSelect={setSelectedTopic}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-content">
        <header className="app-header">
          <div className="app-header-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="打开导航">
              ☰
            </button>
            <div>
              <h1>数据结构与算法 - 可视化知识库</h1>
              <p>交互式学习数据结构与算法</p>
            </div>
          </div>
        </header>
        <main className="app-main">
          {selectedTopic ? (
            <TopicView topicId={selectedTopic} onBack={() => setSelectedTopic(null)} />
          ) : (
            <TopicList onSelect={setSelectedTopic} />
          )}
        </main>
      </div>
      <button
        className="fab"
        onClick={() => setSidebarOpen(true)}
        aria-label="打开导航"
      >
        ☰
      </button>
    </div>
  )
}

export default App
