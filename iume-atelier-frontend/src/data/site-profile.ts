/**
 * 个人资料数据 — 通过 GitHub MCP 同步
 * 用户：follower-ding · https://github.com/follower-ding
 * 同步时间：2026-06-06
 */

export const siteProfile = {
  name: 'follower',
  username: 'follower-ding',
  title: '全栈开发者 · 技术写作者',
  avatar: 'https://avatars.githubusercontent.com/u/57831471?v=4',
  location: '中国',
  pronouns: 'he/him',
  email: 'follower-ding@users.noreply.github.com',
  github: 'https://github.com/follower-ding',
  githubSince: '2019',
  bio: [
    '你好！我是 follower（@follower-ding），一名专注于全栈开发的工程师。',
    'iume-atelier 是我的写作工作室——基于 React + Spring Boot 构建的技术博客，支持 Markdown、评论、RSS 与自动部署。',
    '我也维护 generate_code 等实验项目，喜欢把代码生成、工程化实践和博客设计结合起来，记录真实可复现的开发过程。',
  ],
  highlights: [
    { label: '公开仓库', value: '9' },
    { label: 'GitHub 始于', value: '2019' },
    { label: '主力方向', value: '全栈 · 博客' },
  ],
}

export interface ProjectItem {
  name: string
  description: string
  url: string
  language: string
  stars?: string
  topics: string[]
}

export const projects: ProjectItem[] = [
  {
    name: 'iume-atelier',
    description: 'iume 的写作工作室 — React + Spring Boot 全栈技术博客，支持 Markdown、评论、RSS 与 GitHub Actions 自动部署。',
    url: 'https://github.com/follower-ding/iume-atelier',
    language: 'Java',
    stars: '0',
    topics: ['Spring Boot', 'React', 'Blog', 'Docker'],
  },
  {
    name: 'generate_code',
    description: '生成代码平台 — 面向开发者的代码生成与模板实验项目。',
    url: 'https://github.com/follower-ding/generate_code',
    language: '—',
    stars: '1',
    topics: ['Codegen', 'Platform'],
  },
  {
    name: 'github.io',
    description: '个人 GitHub Pages 站点仓库，用于托管静态页面与作品展示。',
    url: 'https://github.com/follower-ding/github.io',
    language: '—',
    stars: '0',
    topics: ['GitHub Pages', 'Static Site'],
  },
]

export const aboutBento = [
  {
    id: 'stack',
    title: '技术栈',
    body: 'React 18 · TypeScript · Vite · Spring Boot 3 · MyBatis · MySQL · Docker · GitHub Actions',
    span: 'md:col-span-2',
  },
  {
    id: 'oss',
    title: '开源仓库',
    body: 'GitHub @follower-ding，公开维护 iume-atelier、generate_code 等项目。',
    span: '',
  },
  {
    id: 'write',
    title: '写作方式',
    body: '在 iume-atelier 记录可运行的方案、部署流程与踩坑笔记，偏向实战复盘。',
    span: 'md:col-span-2',
  },
  {
    id: 'fun',
    title: '当前关注',
    body: '全栈博客工程化、页面交互设计，以及代码生成类工具的探索。',
    span: '',
  },
]
