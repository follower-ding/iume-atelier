import type { AiToolCategory } from '@/data/ai-tools/types'
import type { LegacyAiToolItem } from '@/data/ai-tools-list'

export interface AiToolConfigBlock {
  id: string
  title: string
  content: string
}

export interface AiToolDetailContent {
  intro?: string
  features: string[]
  install?: string[]
  setup?: string[]
  usage: string[]
  configs?: AiToolConfigBlock[]
}

const MCP_INSTALL = [
  '确保本机已安装 Node.js 18+（运行 npx 需要）',
  '打开 Cursor → Settings（齿轮）→ MCP → Edit in settings.json',
  '或直接编辑 mcp.json 文件（路径见下方配置章节）',
]

const MCP_SETUP_BASE = [
  '将下方 JSON 合并进 mcpServers 对象（注意逗号，不要重复外层大括号）',
  '保存文件后，在 Cursor MCP 面板点击 Refresh，或完全重启 Cursor',
  '确认对应服务旁显示绿灯 Connected；红灯则检查 Node 路径与 env 变量',
]

const SKILL_INSTALL = [
  '在 Cursor 中打开目标项目（或任意工作区）',
  '将 Skill 目录放到 ~/.cursor/skills/<skill-name>/（项目级可放 .cursor/skills/）',
  '目录内必须包含 SKILL.md 文件，Cursor Agent 会自动索引',
]

const SKILL_SETUP = [
  '重启 Cursor 或新开 Agent 对话，让 Skill 被重新加载',
  '在 Settings → Rules / Skills 确认该 Skill 出现在列表中',
  '按需编辑 SKILL.md 内的触发条件与步骤说明',
]

const details: Record<string, AiToolDetailContent> = {
  'iume-atelier-mcp': {
    intro: '在 Cursor 里直接调用博客 API，把 Markdown 草稿发布到 iume-atelier，省去复制粘贴。',
    features: [
      '支持创建、更新文章与封面上传',
      'Agent 可读取站点分类与标签',
      '配合 iume-atelier-publish Skill 一句话发博',
    ],
    install: [
      '克隆或复制 iume-atelier-blog MCP 服务到 ~/.cursor/mcp-servers/iume-atelier-blog/',
      '在该目录执行 npm install 安装依赖',
      ...MCP_INSTALL,
    ],
    setup: [
      '在博客后台获取管理员账号，或使用已知的 admin 凭据',
      'IUME_BLOG_API_URL 填后端地址（本地 http://localhost:8080/api，线上 https://xxx.up.railway.app/api）',
      'IUME_BLOG_FRONTEND_URL 填前端公网地址（用于文章链接预览）',
      ...MCP_SETUP_BASE,
    ],
    usage: [
      '在 Agent 对话说：「列出博客分类」验证 MCP 连通',
      '说：「把下面这篇 Markdown 发到博客，分类 programming，标签 tutorial」',
      '发布成功后 Agent 会返回文章 slug 与可访问 URL',
    ],
  },
  'mcp-mysql': {
    intro: '让 Agent 安全地查询 MySQL，适合排查数据、验证 schema，不必离开编辑器。',
    features: ['只读查询与表结构探索', '支持多数据库连接', '结果可直接用于写 SQL 或接口'],
    install: MCP_INSTALL,
    setup: [
      '将下方 env 中的 MYSQL_HOST / USER / PASSWORD / DATABASE 改为你的连接信息',
      '生产库建议只给只读账号，或仅在本地开发库使用',
      ...MCP_SETUP_BASE,
    ],
    usage: [
      '在 Agent 说：「列出 iume_atelier 库所有表」',
      '说：「查 articles 表最近 5 条已发布文章」',
      '大表务必加 LIMIT；写操作请自己在终端执行，MCP 默认只读',
    ],
  },
  'mcp-github': {
    intro: '在 IDE 内拉取仓库、Issue、PR 与 Actions 状态，减少在浏览器和终端之间切换。',
    features: ['浏览代码与提交历史', '查看 / 创建 Issue 与 PR', '读取 CI 运行结果'],
    install: [
      'GitHub → Settings → Developer settings → Personal access tokens → Generate',
      '勾选 repo（读私有库）、read:org（按需）、workflow（读 Actions）',
      ...MCP_INSTALL,
    ],
    setup: [
      '将 GITHUB_PERSONAL_ACCESS_TOKEN 填入下方 env',
      'Windows 若 npx 报错，可在 args 前加 cmd /c',
      ...MCP_SETUP_BASE,
    ],
    usage: [
      '说：「查看 follower-ding/iume-atelier 最近 3 次 commit」',
      '说：「这个仓库 open 的 PR 有哪些？」',
      '说：「最近一次 GitHub Actions 失败日志是什么」',
    ],
    configs: [{
      id: 'mcp-github-config',
      title: 'GitHub MCP 配置（mcp.json）',
      content: `{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}`,
    }],
  },
  'mcp-firecrawl': {
    intro: '网页搜索、抓取与结构化提取，适合技术调研、竞品分析和文档采集。',
    features: ['站内 / 全网搜索', '单页抓取与 Markdown 转换', '批量爬取与摘要'],
    install: [
      '打开 https://firecrawl.dev 注册账号',
      'Dashboard → API Keys → 创建 Key 并复制',
      ...MCP_INSTALL,
    ],
    setup: [
      '将 FIRECRAWL_API_KEY 填入下方 env',
      ...MCP_SETUP_BASE,
    ],
    usage: [
      '说：「搜索 Spring Boot 3.4 新特性，总结前 5 篇」',
      '说：「抓取 https://example.com/docs 并转成 Markdown 大纲」',
      '调研类任务先 firecrawl 再写代码，减少幻觉',
    ],
    configs: [{
      id: 'mcp-firecrawl-config',
      title: 'Firecrawl MCP 配置（mcp.json）',
      content: `{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "fc-xxxxxxxxxxxx"
      }
    }
  }
}`,
    }],
  },
  'mcp-context7': {
    intro: '拉取第三方库的最新官方文档，避免 AI 用过期 API 或幻觉接口。',
    features: ['按库名解析文档源', '支持主流框架与 npm 包', '与 Agent 编码流程无缝衔接'],
    install: [
      '无需 API Key，只需 Node.js 18+ 与 npx',
      ...MCP_INSTALL,
    ],
    setup: [
      '将下方 context7 配置合并进 mcp.json',
      '首次连接会自动下载 @upstash/context7-mcp，需保持网络畅通',
      ...MCP_SETUP_BASE,
      '验证：MCP 面板 context7 显示 Connected 即可使用',
    ],
    usage: [
      '写代码前说：「use context7，查 React Router v7 的 loader 用法」',
      '说：「先拉 Spring Boot 3.4 官方文档，再帮我写分页接口」',
      '说：「查 Tailwind v4 的 @theme 配置方式再改样式」',
      '把 Agent 返回的文档片段作为唯一实现依据',
    ],
    configs: [{
      id: 'mcp-context7-config',
      title: 'Context7 MCP 配置（mcp.json）',
      content: `{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}`,
    }],
  },
  'mcp-puppeteer': {
    intro: '浏览器自动化与截图；小页面够用，复杂 SPA 建议换 Playwright。',
    features: ['打开 URL 并截图', '简单页面交互与 DOM 读取', '适合快速预览线上页面'],
    install: [
      '首次运行会自动下载 Chromium，体积较大，请预留磁盘空间',
      ...MCP_INSTALL,
    ],
    setup: [
      '将下方配置写入 mcp.json',
      'Windows 若启动失败，尝试以管理员运行 Cursor 或检查杀毒软件拦截',
      ...MCP_SETUP_BASE,
    ],
    usage: [
      '说：「打开 http://localhost:5173 并截图首页」',
      '说：「访问线上文章页，检查标题是否正确渲染」',
      '长页面、登录态页面优先用 Playwright MCP',
    ],
    configs: [{
      id: 'mcp-puppeteer-config',
      title: 'Puppeteer MCP 配置（mcp.json）',
      content: `{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}`,
    }],
  },
  'fullstack-scaffold': {
    intro: '一句话创建全栈项目骨架，自动调度 PRD、设计系统、E2E 等 skill 流水线。',
    features: ['按项目类型选用技术栈', '生成 .cursor/rules 与目录结构', '串联 api-contract-sync、secrets-guard 等'],
    install: SKILL_INSTALL,
    setup: [
      'Skill 路径：~/.cursor/skills/fullstack-scaffold/SKILL.md',
      '或在创建新项目时说「初始化规则」，由 scaffold 写入 .cursor/rules/',
      ...SKILL_SETUP,
    ],
    usage: [
      '说：「我要创建一个博客项目，React + Spring Boot」',
      '确认 AI 给出的 PRD 与技术方案后再执行脚手架',
      '按流水线依次：PRD → 设计系统 → 前后端代码 → E2E → CD',
    ],
  },
  'iume-atelier-publish': {
    intro: '任意 Cursor 项目中说「发布到博客」，自动调用 iume-atelier MCP 发文章。',
    features: ['无需记忆 MCP 工具名', '支持草稿润色后发布', '可附带本地截图路径'],
    install: [
      '先完成 iume-atelier MCP 的安装与配置（见 iume-atelier 发博 MCP 详情页）',
      ...SKILL_INSTALL,
    ],
    setup: [
      'Skill 目录：~/.cursor/skills/iume-atelier-publish/',
      '确认 SKILL.md 描述与 MCP 工具名一致',
      ...SKILL_SETUP,
    ],
    usage: [
      '在任意项目写好 Markdown 草稿',
      '说：「发布到 iume-atelier，分类 AI，标签 deploy」',
      'Agent 会依次：健康检查 → 拉分类标签 → 调用 blog_publish_article',
    ],
  },
  'api-sync': {
    intro: 'Spring Boot OpenAPI 导出后，一键生成前端 TypeScript 类型，保持前后端契约一致。',
    features: ['读取 openapi.json / yaml', '生成 types 与 API 客户端骨架', '适合全栈迭代时同步接口'],
    install: SKILL_INSTALL,
    setup: [
      'Skill 路径：~/.cursor/skills/api-contract-sync/SKILL.md',
      '后端需启用 springdoc，确保 /v3/api-docs 可访问',
      ...SKILL_SETUP,
    ],
    usage: [
      '后端改完接口后，说：「同步 API 类型到前端」',
      'Agent 读取 OpenAPI → 生成 src/types/api.ts',
      '检查 diff 后提交，避免前后端字段不一致',
    ],
  },
  'e2e-playwright': {
    intro: '为中型以上项目加 Playwright 端到端测试脚手架与 smoke 用例模板。',
    features: ['初始化 playwright.config', '登录 / 首页等 smoke 用例', 'CI 集成示例'],
    install: SKILL_INSTALL,
    setup: [
      'Skill 路径：~/.cursor/skills/e2e-playwright/SKILL.md',
      '项目需已有可运行的前端 dev server 地址',
      ...SKILL_SETUP,
    ],
    usage: [
      '说：「加 E2E 测试」或「端到端测试」',
      '确认 baseURL（如 http://localhost:5173）与测试目录',
      '本地执行 npx playwright test，通过后接入 GitHub Actions',
    ],
  },
  'secrets-guard': {
    intro: 'git push 或 CD 前扫描 .env、密钥文件，降低误提交风险。',
    features: ['匹配常见密钥模式', '检查 .gitignore 是否覆盖敏感路径', '发版前自动提醒'],
    install: SKILL_INSTALL,
    setup: [
      'Skill 路径：~/.cursor/skills/secrets-guard/SKILL.md',
      '建议在 .cursor/rules 加一条：push 前自动触发 secrets 扫描',
      ...SKILL_SETUP,
    ],
    usage: [
      'push 前说：「检查密钥」或「secrets 扫描」',
      '按提示把 .env、credentials.json 加入 .gitignore',
      '若已误提交，轮换密钥并从 git 历史中清除',
    ],
  },
  'cursor-editor': {
    intro: 'AI 结对编程主编辑器，Agent、Rules、Skills、MCP 均在此编排。',
    features: ['多模型 Agent 对话', '项目级 Rules 与 Skills', 'MCP 扩展外部能力'],
    install: [
      '访问 https://cursor.com 下载对应系统安装包',
      '安装后登录 GitHub 或邮箱账号',
      'Settings → General → 选择默认 AI 模型',
    ],
    setup: [
      'Settings → MCP → 按本工具箱各 MCP 条目配置 mcp.json',
      '项目根目录建 .cursor/rules/*.mdc 约束代码风格',
      '全局 Skills 放 ~/.cursor/skills/，项目级放 .cursor/skills/',
    ],
    usage: [
      'Cmd/Ctrl + I 打开 Agent，描述任务而非贴长 prompt',
      '用 @file / @folder 精确引用上下文',
      '复杂工作流封装成 Skill，一次性配置多次复用',
    ],
  },
  'prompt-blog': {
    intro: '结构化技术博客写作话术：问题 → 方案 → 代码 → 踩坑 → 总结。',
    features: ['适合 iume-atelier 长文', '强调可复现步骤', '自动生成清晰小标题'],
    install: [
      '无需安装，复制下方 Prompt 模板即可',
      '可选：存为 .cursor/rules/blog-writing.mdc 长期生效',
    ],
    setup: [
      '新建对话，将模板粘贴为第一条消息',
      '或 Settings → Rules → Add rule，粘贴模板内容',
    ],
    usage: [
      '附上素材：错误日志、代码片段、环境版本号',
      '让 AI 按结构输出完整 Markdown',
      '人工润色后，用 iume-atelier MCP 或写作台发布',
    ],
  },
  'prompt-refactor': {
    intro: '约束 AI 做小步重构：最小 diff、匹配现有风格、不过度抽象。',
    features: ['避免大范围重写', '强调读周边代码再改', '适合 Code Review 前清理'],
    install: ['复制下方 Prompt，无需额外安装'],
    setup: [
      '可设为项目 Rule：globs 匹配 **/*.{ts,tsx,java}',
      '或在重构前手动粘贴到对话开头',
    ],
    usage: [
      '@选中文件 或说明要重构的路径',
      '说明目标：提取函数、去重复、改命名等',
      '逐文件应用 diff，每步跑测试确认行为不变',
    ],
  },
  'prompt-deploy': {
    intro: 'Netlify + Railway 部署 checklist 与常见踩坑排查话术。',
    features: ['前后端分离部署步骤', 'CORS / 环境变量排查', '适合小白上线场景'],
    install: ['复制下方 Prompt，部署遇到问题时使用'],
    setup: [
      '提前准备好：Netlify 域名、Railway 公网 URL、构建报错日志',
      '把 netlify.toml、环境变量列表整理到一条消息里',
    ],
    usage: [
      '按模板填写【现象】【Deploy log】【已配环境变量】',
      '让 AI 按 CORS → 构建 → 数据库顺序排查',
      '按给出的命令逐步修复，不要一次改太多变量',
    ],
  },
  'cursor-rule': {
    intro: 'Spring Boot API 规范片段，可复制到 .cursor/rules 统一后端风格。',
    features: ['REST 与 DTO 约定', '异常与分页响应格式', '与 iume-atelier 后端一致'],
    install: [
      '在项目根目录创建 .cursor/rules/ 目录（不存在则新建）',
    ],
    setup: [
      '新建 spring-api.mdc，粘贴下方规则内容',
      'globs 设为 **/*.java 仅对 Java 文件生效',
      '保存后 Agent 写后端代码会自动遵循',
    ],
    usage: [
      '新接口开发前无需重复说明规范',
      'Code Review 时可对照规则检查 Controller / DTO',
      '按项目需要增删条款，保持规则简短可执行',
    ],
  },
  'online-netlify': {
    intro: 'iume-atelier 前端静态托管，/api 反代到 Railway 后端。',
    features: ['Git 推送自动构建', '自定义域名与 HTTPS', 'netlify.toml 配置 API 代理'],
    install: [
      '登录 https://app.netlify.com',
      'Add new site → Import an existing project → 连接 GitHub 仓库',
      '选择 iume-atelier 仓库',
    ],
    setup: [
      'Base directory：iume-atelier-frontend（若 monorepo）',
      'Build command：npm run build',
      'Publish directory：dist（⚠️ 不要填 iume-atelier-frontend/dist，除非 base 已设子目录）',
      'UI 里 Base/Publish 若与 netlify.toml 冲突，以 toml 为准或 UI 留空',
      '在 netlify.toml 配置 /api 反代到 Railway 后端 URL',
    ],
    usage: [
      'git push 到 main 自动触发构建',
      'Site overview → Domain management 绑定自定义域名',
      'Deploy log 报错时，对照 prompt-deploy 模板排查',
    ],
    configs: [{
      id: 'netlify-toml',
      title: 'netlify.toml 示例（前端 + API 反代）',
      content: `[build]
  base = "iume-atelier-frontend"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://iume-atelier-production.up.railway.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`,
    }],
  },
  'online-railway': {
    intro: 'Spring Boot + MySQL 后端 PaaS，适合个人博客与小项目。',
    features: ['容器化部署', '环境变量管理', '可挂 MySQL 插件'],
    install: [
      '登录 https://railway.app',
      'New Project → Deploy from GitHub repo → 选择后端仓库',
      'Add Plugin → MySQL，Railway 自动注入连接变量',
    ],
    setup: [
      'Settings → Variables 添加业务环境变量（见下方模板）',
      'IUME_CORS_ORIGINS 必须包含 Netlify 前端域名（含 https://）',
      'IUME_SITE_URL 填前端公网地址',
      'Root directory 若 monorepo 设为 iume-atelier-backend',
      '部署成功后复制 Public URL，填到 Netlify 反代',
    ],
    usage: [
      '每次 push main 自动重新部署',
      'Variables 改完会触发 redeploy',
      'Logs 面板查看启动失败原因（常见：数据库连接、Flyway）',
    ],
    configs: [{
      id: 'railway-env',
      title: 'Railway 环境变量示例',
      content: `IUME_CORS_ORIGINS=https://your-site.netlify.app
IUME_SITE_URL=https://your-site.netlify.app
SPRING_PROFILES_ACTIVE=prod

# MySQL 插件会自动提供，通常名为：
# MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
# 在 application-prod.yml 中映射为 spring.datasource.*`,
    }],
  },
  'online-vite': {
    intro: 'iume-atelier 前端构建工具，开发时 HMR 极快，生产构建体积小。',
    features: ['React + TypeScript 开箱', 'Tailwind 与路径别名', 'npm run build 输出 dist'],
    install: [
      'cd iume-atelier-frontend',
      'npm install',
    ],
    setup: [
      '本地 API 代理在 vite.config.ts 的 server.proxy 配置',
      '环境变量以 VITE_ 前缀，写入 .env.local（不提交 git）',
      '生产构建：npm run build，产物在 dist/',
    ],
    usage: [
      '开发：npm run dev → http://localhost:5173',
      '类型检查：npm run build（含 tsc -b）',
      '预览生产包：npm run preview',
    ],
    configs: [{
      id: 'vite-env',
      title: '.env.local 示例',
      content: `# 本地开发可选，默认走 vite proxy 到 localhost:8080
VITE_API_BASE=/api`,
    }],
  },
  'online-github-actions': {
    intro: 'iume-atelier CI/CD：构建 Docker 镜像并通过 SSH 部署到服务器。',
    features: ['push main 触发流水线', 'GHCR 镜像仓库', 'deploy 目录脚本化发布'],
    install: [
      '仓库已含 .github/workflows/ 时，push 到 GitHub 即启用',
      'GitHub 仓库 → Settings → Secrets and variables → Actions',
    ],
    setup: [
      '添加 Secrets：SSH_HOST、SSH_USER、SSH_PRIVATE_KEY、GHCR_TOKEN 等（见项目 deploy 文档）',
      '确认 workflow 监听 main 分支 push',
      '首次运行可在 Actions 页手动触发 workflow_dispatch',
    ],
    usage: [
      'merge 到 main 后自动构建并部署',
      '失败时点开 Actions → 对应 run → 查看红色步骤日志',
      '镜像 tag 通常为 latest 或 git sha',
    ],
    configs: [{
      id: 'gh-actions-secrets',
      title: 'GitHub Actions Secrets 清单',
      content: `SSH_HOST=your.server.ip
SSH_USER=deploy
SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
GHCR_TOKEN=ghp_xxx（需 write:packages 权限）
DEPLOY_PATH=/opt/iume-atelier`,
    }],
  },
}

function defaultDetail(tool: LegacyAiToolItem): AiToolDetailContent {
  const byCategory: Record<AiToolCategory, AiToolDetailContent> = {
    mcp: {
      features: ['扩展 Cursor Agent 外部能力', '配置一次，多项目复用'],
      install: MCP_INSTALL,
      setup: MCP_SETUP_BASE,
      usage: [
        '在 Agent 对话用自然语言描述任务',
        '首次调用可能较慢（npx 下载），后续会快很多',
        '多 MCP 并存时注意 mcp.json 逗号与 JSON 合法性',
      ],
    },
    skill: {
      features: ['封装可复用工作流', 'Agent 按场景自动选用'],
      install: SKILL_INSTALL,
      setup: SKILL_SETUP,
      usage: [
        '用自然语言描述场景，Agent 自动匹配 Skill',
        'Skill 不生效时检查目录名与 SKILL.md 是否存在',
        '复杂流程拆成多个 Skill 比单文件过长更好',
      ],
    },
    prompt: {
      features: ['统一 AI 输出结构与质量', '可复制到对话或 Rules'],
      install: ['复制配置模板到 Cursor 对话或 Rules'],
      setup: ['可选存为 .cursor/rules/*.mdc 长期生效'],
      usage: [
        '附上具体素材与约束条件',
        '根据输出微调后再用于开发或写作',
        '不同任务使用不同 Prompt，避免一条规则包打天下',
      ],
    },
    online: {
      features: ['配套 iume-atelier 工作流', '官方文档与控制台操作'],
      install: ['点击「打开链接」访问官网并注册'],
      setup: ['按官网文档完成项目创建与密钥配置'],
      usage: [
        '与博客部署、开发流程结合使用',
        '遇到问题可配合 prompt-deploy 模板排查',
        '敏感配置只放平台环境变量，不写进代码库',
      ],
    },
  }
  return byCategory[tool.category]
}

export function getAiToolDetail(tool: LegacyAiToolItem): AiToolDetailContent {
  return details[tool.id] ?? defaultDetail(tool)
}
