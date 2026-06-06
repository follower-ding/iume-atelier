import type { AiToolRequestDto } from '@/types/ai-tool-api'

/** 从粘贴的 MCP 文档 / README 中尽量提取 mcp.json 与基本信息 */
export function parseAiToolQuickImport(text: string, category: AiToolRequestDto['category'] = 'mcp'): Partial<AiToolRequestDto> {
  const trimmed = text.trim()
  if (!trimmed) return {}

  let configs: AiToolRequestDto['detail']['configs'] = []
  const jsonBlocks = [...trimmed.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map((m) => m[1].trim())
  for (const block of jsonBlocks) {
    if (block.includes('mcpServers') || block.startsWith('{')) {
      try {
        JSON.parse(block)
        configs.push({
          id: 'imported-config',
          title: 'MCP 配置（mcp.json）',
          content: block,
        })
        break
      } catch {
        // ignore invalid json block
      }
    }
  }

  if (!configs.length) {
    const inline = trimmed.match(/\{[\s\S]*"mcpServers"[\s\S]*\}/)
    if (inline) {
      try {
        JSON.parse(inline[0])
        configs = [{ id: 'imported-config', title: 'MCP 配置（mcp.json）', content: inline[0] }]
      } catch {
        // ignore
      }
    }
  }

  const firstLine = trimmed.split('\n').find((l) => l.trim())?.trim() ?? ''
  const name = firstLine.replace(/^#+\s*/, '').slice(0, 120)
  const slugGuess = name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'new-tool'

  const urlMatch = trimmed.match(/https?:\/\/[^\s)]+/)

  return {
    slug: category === 'mcp' ? `mcp-${slugGuess}` : slugGuess,
    name: name || '新工具',
    description: trimmed.slice(0, 200).replace(/\n/g, ' '),
    category,
    icon: category === 'mcp' ? '🔌' : category === 'skill' ? '⚙' : category === 'prompt' ? '✍' : '◆',
    tags: [],
    url: urlMatch?.[0],
    detail: {
      intro: trimmed.slice(0, 500),
      features: ['待补充功能特点'],
      install: category === 'mcp' ? ['确保 Node.js 18+', '打开 Cursor → Settings → MCP'] : ['待补充安装步骤'],
      setup: configs.length ? ['将下方配置合并进 mcp.json', '保存后 Refresh MCP 面板'] : ['待补充配置步骤'],
      usage: ['在 Agent 对话中描述你的使用场景'],
      configs,
    },
  }
}
