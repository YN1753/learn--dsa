import { topicRegistry } from '../topics/registry'

interface TopicListProps {
  onSelect: (topicId: string) => void
}

export function TopicList({ onSelect }: TopicListProps) {
  const topics = topicRegistry.getAll()

  const categories = ['基础线性结构', '树形结构', '排序算法', '搜索算法']

  return (
    <div className="topic-list">
      <h2>选择主题</h2>
      {categories.map(category => {
        const categoryTopics = topics.filter(t => t.category === category)
        if (categoryTopics.length === 0) return null
        return (
          <section key={category} className="category-section">
            <h3>{category}</h3>
            <div className="topic-grid">
              {categoryTopics.map(topic => (
                <div key={topic.id} className="topic-card" onClick={() => onSelect(topic.id)}>
                  <h4>{topic.title}</h4>
                  <p>{topic.description}</p>
                  <div className="topic-meta">
                    <span className={`difficulty difficulty-${topic.difficulty}`}>
                      {topic.difficulty === 'beginner' ? '入门' : topic.difficulty === 'intermediate' ? '进阶' : '高级'}
                    </span>
                    <div className="tags">
                      {topic.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
