export interface QuizQuestion {
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface TopicMetadata {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  order: number
}

export interface Topic {
  metadata: TopicMetadata
  article: string
  quiz: QuizQuestion[]
}
