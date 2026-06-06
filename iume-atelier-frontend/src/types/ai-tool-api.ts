export interface AiToolConfigDto {
  id: string
  title: string
  content: string
}

export interface AiToolDetailDto {
  intro?: string
  features: string[]
  install?: string[]
  setup?: string[]
  usage: string[]
  configs?: AiToolConfigDto[]
  related?: string[]
}

export interface AiToolDto {
  id?: number
  slug: string
  name: string
  description: string
  category: 'mcp' | 'skill' | 'prompt' | 'online'
  icon: string
  tags: string[]
  url?: string
  featured?: boolean
  source?: 'official' | 'custom'
  detail: AiToolDetailDto
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

export interface ChatMessageDto {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AiToolGenerateRequestDto {
  message: string
  context?: string
  history?: ChatMessageDto[]
}

export interface AiToolGenerateResponseDto {
  draft: AiToolRequestDto
  summary: string
  model?: string
}

export interface AiToolRequestDto {
  slug: string
  name: string
  description: string
  category: 'mcp' | 'skill' | 'prompt' | 'online'
  icon: string
  tags: string[]
  url?: string
  featured?: boolean
  source?: 'official' | 'custom'
  detail: AiToolDetailDto
  sortOrder?: number
}
