import { useState, useMemo } from 'react'
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

interface SidebarProps {
  isOpen: boolean
  selectedTopic: string | null
  onSelect: (topicId: string) => void
  onClose: () => void
}

export function Sidebar({ isOpen, selectedTopic, onSelect, onClose }: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
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

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const expandAll = () => setExpandedCategories(new Set(categories.map(([c]) => c)))
  const collapseAll = () => setExpandedCategories(new Set())

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>📚 知识库</h2>
          <div className="sidebar-actions">
            <button className="sidebar-action-btn" onClick={expandAll} title="全部展开">▼</button>
            <button className="sidebar-action-btn" onClick={collapseAll} title="全部折叠">▲</button>
            <button className="sidebar-close-btn" onClick={onClose} title="关闭">✕</button>
          </div>
        </div>
        <div className="sidebar-stats">
          {topics.length} 个主题 · {categories.length} 个分类
        </div>
        <nav className="sidebar-nav">
          {categories.map(([category, catTopics]) => {
            const isExpanded = expandedCategories.has(category)
            const icon = CATEGORY_ICONS[category] || '📁'
            return (
              <div key={category} className="sidebar-category">
                <button
                  className="sidebar-category-header"
                  onClick={() => toggleCategory(category)}
                >
                  <span className="sidebar-category-icon">{icon}</span>
                  <span className="sidebar-category-name">{category}</span>
                  <span className="sidebar-category-count">{catTopics.length}</span>
                  <span className={`sidebar-chevron ${isExpanded ? 'expanded' : ''}`}>›</span>
                </button>
                {isExpanded && (
                  <div className="sidebar-topic-list">
                    {catTopics.map(topic => (
                      <button
                        key={topic.id}
                        className={`sidebar-topic ${selectedTopic === topic.id ? 'active' : ''}`}
                        onClick={() => { onSelect(topic.id); onClose() }}
                      >
                        <span className={`sidebar-dot difficulty-${topic.difficulty}`} />
                        <span className="sidebar-topic-title">{topic.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
