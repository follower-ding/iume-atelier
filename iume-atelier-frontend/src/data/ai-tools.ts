export interface AiToolItem {
  id: string
  name: string
  description: string
  category: 'cursor' | 'mcp' | 'prompt'
  url?: string
  snippetId?: string
}

export const aiTools: AiToolItem[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'AI 结对编程主编辑器，支持 Agent / Rules / Skills。',
    category: 'cursor',
    url: 'https://cursor.com',
  },
  {
    id: 'fullstack-scaffold',
    name: '全栈脚手架 Skill',
    description: '创建新项目、初始化规则与 skill 流水线。',
    category: 'cursor',
  },
  {
    id: 'api-sync',
    name: 'API 契约同步',
    description: 'Spring OpenAPI → 前端 TypeScript 类型。',
    category: 'cursor',
  },
  {
    id: 'e2e-playwright',
    name: 'Playwright E2E',
    description: '端到端测试脚手架与 smoke 用例。',
    category: 'cursor',
  },
  {
    id: 'mcp-mysql',
    name: 'MySQL MCP',
    description: '连接数据库，执行只读查询与 schema 探索。',
    category: 'mcp',
    snippetId: 'mcp-config',
  },
  {
    id: 'mcp-github',
    name: 'GitHub MCP',
    description: '仓库、Issue、PR 与 Actions 信息拉取。',
    category: 'mcp',
  },
  {
    id: 'mcp-firecrawl',
    name: 'Firecrawl MCP',
    description: '网页搜索、抓取与内容提取。',
    category: 'mcp',
  },
  {
    id: 'mcp-context7',
    name: 'Context7 文档',
    description: '拉取库/框架最新官方文档。',
    category: 'mcp',
  },
  {
    id: 'prompt-blog',
    name: '技术博客 Prompt',
    description: '「问题 → 方案 → 代码 → 踩坑 → 总结」结构。',
    category: 'prompt',
  },
  {
    id: 'prompt-refactor',
    name: '小步重构 Prompt',
    description: '最小 diff、匹配现有风格、不 over-engineer。',
    category: 'prompt',
  },
]

export const aiToolCategories = [
  { id: 'cursor' as const, label: 'Cursor / Skills' },
  { id: 'mcp' as const, label: 'MCP' },
  { id: 'prompt' as const, label: 'Prompt' },
]
