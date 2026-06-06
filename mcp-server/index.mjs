#!/usr/bin/env node
/**
 * iume-atelier MCP Server
 * Publish AI-generated Markdown docs to the blog platform.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { readFile } from 'fs/promises'
import { BlogClient } from './lib/blog-client.mjs'
import { takeScreenshot } from './lib/screenshot.mjs'

const client = new BlogClient()
const frontendBase = (process.env.IUME_BLOG_FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')

const TOOLS = [
  {
    name: 'blog_health',
    description: 'Check iume-atelier backend health and API connectivity',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'blog_list_taxonomy',
    description: 'List blog categories (编程/AI/生活) and tags for article publishing',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'blog_publish_article',
    description: 'Publish or draft a Markdown article to iume-atelier blog. Use after writing AI docs.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Article title (required)' },
        content: { type: 'string', description: 'Markdown body (required). Use ##/### for TOC.' },
        slug: { type: 'string', description: 'URL slug (optional, auto-generated from title)' },
        summary: { type: 'string', description: 'Short summary (optional, auto from first paragraph)' },
        coverImage: { type: 'string', description: 'Cover image URL (optional)' },
        categorySlug: { type: 'string', enum: ['programming', 'ai', 'life'], description: 'Category slug' },
        categoryId: { type: 'number', description: 'Category ID (alternative to categorySlug)' },
        tagSlugs: { type: 'array', items: { type: 'string' }, description: 'Tag slugs e.g. ["java","react"]' },
        tagIds: { type: 'array', items: { type: 'number' }, description: 'Tag IDs (alternative)' },
        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'], description: 'Default PUBLISHED' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'blog_publish_file',
    description: 'Publish a Markdown file from disk to the blog',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Absolute path to .md file' },
        title: { type: 'string', description: 'Override title (default: first # heading)' },
        slug: { type: 'string' },
        summary: { type: 'string' },
        coverImage: { type: 'string' },
        categorySlug: { type: 'string', enum: ['programming', 'ai', 'life'] },
        tagSlugs: { type: 'array', items: { type: 'string' } },
        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'blog_update_article',
    description: 'Update an existing article by ID',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number', description: 'Article ID' },
        title: { type: 'string' },
        content: { type: 'string' },
        slug: { type: 'string' },
        summary: { type: 'string' },
        coverImage: { type: 'string' },
        categorySlug: { type: 'string', enum: ['programming', 'ai', 'life'] },
        tagSlugs: { type: 'array', items: { type: 'string' } },
        status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
      },
      required: ['id'],
    },
  },
  {
    name: 'blog_upload_image',
    description: 'Upload an image file for use in article Markdown (![alt](url))',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Absolute path to image file' },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'blog_screenshot',
    description: 'Take a reliable page screenshot (Playwright). Prefer over puppeteer_screenshot for blog pages.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'URL path e.g. /articles or /article/my-slug (uses frontend base URL)' },
        url: { type: 'string', description: 'Full URL (overrides path)' },
        name: { type: 'string', description: 'Screenshot filename without extension' },
        selector: { type: 'string', description: 'CSS selector to capture element only (recommended for article pages)' },
        width: { type: 'number', default: 1280 },
        height: { type: 'number', default: 800 },
        upload: { type: 'boolean', description: 'Upload to blog and return /api/uploads URL for Markdown' },
        waitForSelector: { type: 'string', description: 'Wait for element before capture e.g. .article-layout' },
      },
      required: ['name'],
    },
  },
]

function extractTitleFromMarkdown(content, fallback) {
  const m = content.match(/^#\s+(.+)/m)
  return m?.[1]?.trim() || fallback
}

async function handleTool(name, args) {
  switch (name) {
    case 'blog_health': {
      const health = await client.health()
      return { content: [{ type: 'text', text: JSON.stringify(health, null, 2) }] }
    }
    case 'blog_list_taxonomy': {
      const [categories, tags] = await Promise.all([client.listCategories(), client.listTags()])
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ categories, tags }, null, 2),
        }],
      }
    }
    case 'blog_publish_article': {
      const article = await client.publishArticle(args)
      const url = `${frontendBase}/article/${article.slug}`
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ ...article, publicUrl: url }, null, 2),
        }],
      }
    }
    case 'blog_publish_file': {
      const content = await readFile(args.filePath, 'utf-8')
      const title = args.title || extractTitleFromMarkdown(content, 'Untitled')
      const article = await client.publishArticle({ ...args, title, content })
      const url = `${frontendBase}/article/${article.slug}`
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ ...article, publicUrl: url }, null, 2),
        }],
      }
    }
    case 'blog_update_article': {
      const { id, ...payload } = args
      const article = await client.updateArticle(id, payload)
      return {
        content: [{ type: 'text', text: JSON.stringify(article, null, 2) }],
      }
    }
    case 'blog_upload_image': {
      const result = await client.uploadImage({ filePath: args.filePath })
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            url: result.url,
            markdown: `![image](${result.url})`,
            originalName: result.originalName,
          }, null, 2),
        }],
      }
    }
    case 'blog_screenshot': {
      const url = args.url || `${frontendBase}${args.path || '/'}`
      const shot = await takeScreenshot({
        url,
        name: args.name,
        selector: args.selector,
        width: args.width ?? 1280,
        height: args.height ?? 800,
        waitForSelector: args.waitForSelector ?? (args.selector ? undefined : '.site-header'),
        fullPage: !args.selector,
      })
      if (args.upload) {
        const uploaded = await client.uploadImage({ buffer: shot.buffer, filename: `${args.name}.png` })
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              localPath: shot.path,
              url: uploaded.url,
              markdown: `![${args.name}](${uploaded.url})`,
            }, null, 2),
          }],
        }
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ localPath: shot.path, url: shot.url, size: `${shot.width}x${shot.height}` }, null, 2),
        }],
      }
    }
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

const server = new Server(
  { name: 'iume-atelier-blog', version: '1.0.0' },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  try {
    return await handleTool(req.params.name, req.params.arguments ?? {})
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
