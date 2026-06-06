#!/usr/bin/env node
/**
 * 快速新增 AI 工具箱条目
 *
 * 用法：
 *   npm run tool:add -- <id> "<名称>" <category> [icon]
 *
 * 示例：
 *   npm run tool:add -- mcp-playwright "Playwright MCP" mcp 🎭
 *   npm run tool:add -- prompt-code-review "Code Review Prompt" prompt 🔍
 *   npm run tool:add -- skill-my-flow "我的工作流 Skill" skill ⚙
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const entriesDir = join(root, 'src/data/ai-tools/entries')
const templatePath = join(entriesDir, '_template.ts')

const [id, name, category, icon = '🔌'] = process.argv.slice(2)
const validCategories = new Set(['mcp', 'skill', 'prompt', 'online'])

if (!id || !name || !category) {
  console.error(`
用法: npm run tool:add -- <id> "<名称>" <category> [icon]

  id        路由用，如 mcp-playwright（=/tools/mcp-playwright）
  name      显示名称
  category  mcp | skill | prompt | online
  icon      可选 emoji，默认 🔌

示例:
  npm run tool:add -- mcp-playwright "Playwright MCP" mcp
  npm run tool:add -- prompt-review "代码审查 Prompt" prompt
`)
  process.exit(1)
}

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
  console.error('❌ id 请用小写英文和连字符，如 mcp-playwright')
  process.exit(1)
}

if (!validCategories.has(category)) {
  console.error(`❌ category 必须是: ${[...validCategories].join(' | ')}`)
  process.exit(1)
}

const target = join(entriesDir, `${id}.ts`)
if (existsSync(target)) {
  console.error(`❌ 已存在: ${target}`)
  process.exit(1)
}

// 检查 legacy 列表是否 id 冲突
const legacyList = readFileSync(join(root, 'src/data/ai-tools-list.ts'), 'utf8')
if (legacyList.includes(`id: '${id}'`)) {
  console.error(`❌ id "${id}" 已在 ai-tools-list.ts（旧数据）中存在，请换一个 id`)
  process.exit(1)
}

if (!existsSync(templatePath)) {
  console.error(`❌ 找不到模板: ${templatePath}`)
  process.exit(1)
}

copyFileSync(templatePath, target)

let content = readFileSync(target, 'utf8')
content = content
  .replace(/id: 'mcp-foo'/g, `id: '${id}'`)
  .replace(/name: 'Foo MCP'/g, `name: '${name}'`)
  .replace(/category: 'mcp'/g, `category: '${category}'`)
  .replace(/icon: '🔌'/g, `icon: '${icon}'`)
  .replace(/id: 'mcp-foo-config'/g, `id: '${id}-config'`)
  .replace(/Foo MCP/g, name)
  .replace(/mcp-foo/g, id)

writeFileSync(target, content, 'utf8')

console.log(`
✅ 已创建: src/data/ai-tools/entries/${id}.ts

下一步（约 5 分钟）:
  1. 打开该文件，填写 detail.install / setup / configs / usage
  2. MCP：从官方文档复制 mcp.json 到 configs.content
  3. Skill：把 SKILL.md 正文放进 configs
  4. Prompt：把完整 Prompt 放进 configs
  5. npm run tool:check
  6. npm run dev → 打开 /tools/${id}

旧条目仍在 ai-tools-list.ts + ai-tool-details.ts；
新条目只改 entries/${id}.ts 这一个文件即可。
`)
