import { MCP_INSTALL, MCP_SETUP, SKILL_INSTALL, SKILL_SETUP } from '@/data/ai-tools/presets'
import type { AiToolCategory, AiToolDetail, AiToolEntry } from '@/data/ai-tools/types'

function defaultDetail(category: AiToolCategory): AiToolDetail {
  const map: Record<AiToolCategory, AiToolDetail> = {
    mcp: {
      features: ['扩展 Cursor Agent 外部能力', '配置一次，多项目复用'],
      install: MCP_INSTALL,
      setup: MCP_SETUP,
      usage: [
        '在 Agent 对话用自然语言描述任务',
        '首次 npx 下载可能较慢，之后会快很多',
      ],
    },
    skill: {
      features: ['封装可复用工作流', 'Agent 按场景自动选用'],
      install: SKILL_INSTALL,
      setup: SKILL_SETUP,
      usage: ['用自然语言描述场景即可触发'],
    },
    prompt: {
      features: ['统一 AI 输出结构', '可复制到对话或 Rules'],
      install: ['复制下方配置模板即可'],
      setup: ['可选存为 .cursor/rules/*.mdc'],
      usage: ['附上素材与约束，根据输出微调'],
    },
    online: {
      features: ['配套开发/部署工作流'],
      install: ['点击「打开链接」访问官网'],
      setup: ['按官网完成注册与项目创建'],
      usage: ['与博客部署流程结合使用'],
    },
  }
  return map[category]
}

/** 新建工具条目：detail 字段可只填一部分，其余用分类默认值补全 */
export function defineAiTool(entry: AiToolEntry): AiToolEntry {
  const base = defaultDetail(entry.category)
  return {
    ...entry,
    detail: {
      ...base,
      ...entry.detail,
      features: entry.detail.features?.length ? entry.detail.features : base.features,
      usage: entry.detail.usage?.length ? entry.detail.usage : base.usage,
    },
  }
}
