export type AiToolCategory = 'mcp' | 'skill' | 'prompt' | 'online'

export interface AiToolConfigBlock {
  id: string
  title: string
  content: string
}

export interface AiToolDetail {
  intro?: string
  features: string[]
  install?: string[]
  setup?: string[]
  usage: string[]
  configs?: AiToolConfigBlock[]
  related?: string[]
}

/** 列表 + 详情合一，新增工具只维护这一个对象 */
export interface AiToolEntry {
  id: string
  name: string
  description: string
  category: AiToolCategory
  icon: string
  tags: string[]
  url?: string
  featured?: boolean
  source?: 'official' | 'custom'
  detail: AiToolDetail
}

export type AiToolFilter = AiToolCategory | 'all'

/** 卡片列表展示用（不含 detail 正文） */
export type AiToolItem = Omit<AiToolEntry, 'detail'>
