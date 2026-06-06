/**
 * ═══════════════════════════════════════════════════════════════
 *  新增 MCP / Skill / Prompt — 复制本文件即可
 * ═══════════════════════════════════════════════════════════════
 *
 *  方式 A（推荐）：一条命令生成
 *    cd iume-atelier-frontend
 *    npm run tool:add -- mcp-foo "Foo MCP" mcp
 *
 *  方式 B：手动复制
 *    1. 复制本文件为 entries/mcp-foo.ts（文件名 = id）
 *    2. 改 id / name / category / detail / configs
 *    3. npm run tool:check && npm run dev
 *    4. 浏览器打开 /tools/mcp-foo 检查
 *
 *  category 取值：mcp | skill | prompt | online
 *
 *  发现好用 MCP 时建议填写：
 *    - install：要不要 API Key、装什么包
 *    - setup：mcp.json 怎么写、env 填什么
 *    - configs：完整可复制的 JSON / Prompt 正文
 *    - usage：在 Cursor 里怎么说、怎么验证连通
 */
import { defineAiTool } from '@/data/ai-tools/define'
import { MCP_INSTALL, MCP_SETUP } from '@/data/ai-tools/presets'

export default defineAiTool({
  id: 'mcp-foo',
  name: 'Foo MCP',
  description: '一句话简介，显示在列表卡片上',
  category: 'mcp',
  icon: '🔌',
  tags: ['demo'],
  url: 'https://example.com/docs',
  featured: false,
  source: 'official',
  detail: {
    intro: '稍长的介绍：解决什么问题',
    features: ['功能 1', '功能 2'],
    install: [
      '如需 API Key：去官网注册并创建 Key',
      ...MCP_INSTALL,
    ],
    setup: [
      '把下方 JSON 合并进 mcp.json',
      ...MCP_SETUP,
    ],
    usage: [
      '在 Agent 说：「用 foo 做 xxx」',
      '说：「验证 foo MCP 是否连通」',
    ],
    configs: [{
      id: 'mcp-foo-config',
      title: 'Foo MCP 配置（mcp.json）',
      content: `{
  "mcpServers": {
    "foo": {
      "command": "npx",
      "args": ["-y", "package-name-here"],
      "env": {
        "API_KEY": "your-key-here"
      }
    }
  }
}`,
    }],
    related: ['mcp-context7'],
  },
})
