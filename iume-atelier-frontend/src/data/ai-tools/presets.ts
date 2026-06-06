export const MCP_INSTALL = [
  '确保本机已安装 Node.js 18+（运行 npx 需要）',
  '打开 Cursor → Settings（齿轮）→ MCP → Edit in settings.json',
  '或直接编辑 mcp.json（~/.cursor/mcp.json，Windows：%USERPROFILE%\\.cursor\\mcp.json）',
]

export const MCP_SETUP = [
  '将下方 JSON 合并进 mcpServers（注意逗号，不要重复外层大括号）',
  '保存后在 MCP 面板点 Refresh，或完全重启 Cursor',
  '确认服务旁绿灯 Connected；红灯则检查 env 与 Node 路径',
]

export const SKILL_INSTALL = [
  '将 Skill 目录放到 ~/.cursor/skills/<skill-name>/（项目级：.cursor/skills/）',
  '目录内必须有 SKILL.md，Cursor Agent 会自动索引',
]

export const SKILL_SETUP = [
  '新开 Agent 对话或重启 Cursor 让 Skill 生效',
  'Settings → Rules / Skills 确认出现在列表中',
]
