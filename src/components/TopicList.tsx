import { useMemo } from 'react'
import { topicRegistry } from '../topics/registry'
import type { TopicMetadata } from '../types'

const CATEGORY_ICONS: Record<string, string> = {
  '基础线性结构': '📏',
  '树形结构': '🌳',
  '排序算法': '🔄',
  '搜索算法': '🔍',
  '图论算法': '🕸️',
  '数论': '🔢',
  '字符串算法': '📝',
  '高级数据结构': '🏗️',
  '高级树结构': '🌲',
  '高级字符串结构': '🔤',
  '动态规划': '📊',
  '组合数学': '🎲',
  '数学': '➗',
  '计算几何': '📐',
  '高级算法': '⚡',
  '算法设计': '🧩',
  '算法分析': '📈',
  '数论算法': '🔣',
  '数据结构': '🗂️',
  '数据结构技巧': '🔧',
  '贪心算法': '💰',
  '离线算法': '📥',
  '博弈论': '🎮',
  '线性代数': '📐',
  '图论与线性代数': '📐',
  '高级数学结构': '🧮',
  '优化': '⚙️',
  '图论高级': '🕸️',
  '树上技巧': '🌿',
}

interface TopicListProps {
  onSelect: (topicId: string) => void
}

export function TopicList({ onSelect }: TopicListProps) {
  const topics = topicRegistry.getAll()

  const categories = useMemo(() => {
    const map = new Map<string, TopicMetadata[]>()
    for (const t of topics) {
      const list = map.get(t.category) || []
      list.push(t)
      map.set(t.category, list)
    }
    return Array.from(map.entries()).sort((a, b) => {
      const orderA = Math.min(...a[1].map(t => t.order))
      const orderB = Math.min(...b[1].map(t => t.order))
      return orderA - orderB
    })
  }, [topics])

  const stats = useMemo(() => {
    const beginner = topics.filter(t => t.difficulty === 'beginner').length
    const intermediate = topics.filter(t => t.difficulty === 'intermediate').length
    const advanced = topics.filter(t => t.difficulty === 'advanced').length
    return { total: topics.length, categories: categories.length, beginner, intermediate, advanced }
  }, [topics, categories])

  return (
    <div className="topic-list">
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">主题总数</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📂</span>
          <div className="stat-info">
            <span className="stat-number">{stats.categories}</span>
            <span className="stat-label">分类数</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{color: '#4ade80'}}>🟢</span>
          <div className="stat-info">
            <span className="stat-number">{stats.beginner}</span>
            <span className="stat-label">入门</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{color: '#fbbf24'}}>🟡</span>
          <div className="stat-info">
            <span className="stat-number">{stats.intermediate}</span>
            <span className="stat-label">进阶</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon" style={{color: '#f87171'}}>🔴</span>
          <div className="stat-info">
            <span className="stat-number">{stats.advanced}</span>
            <span className="stat-label">高级</span>
          </div>
        </div>
      </div>

      {categories.map(([category, catTopics]) => {
        const icon = CATEGORY_ICONS[category] || '📁'
        return (
          <section key={category} className="category-section">
            <h3 className="category-heading">
              <span className="category-icon">{icon}</span>
              <span>{category}</span>
              <span className="category-count">{catTopics.length}</span>
            </h3>
            <div className="topic-grid">
              {catTopics.map(topic => (
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
