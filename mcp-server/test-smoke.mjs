/** Quick smoke test for blog MCP client + screenshot */
import { BlogClient } from './lib/blog-client.mjs'
import { takeScreenshot } from './lib/screenshot.mjs'

const client = new BlogClient()

console.log('1. Health...')
const health = await client.health()
console.log('   ', health)

console.log('2. Taxonomy...')
const cats = await client.listCategories()
console.log('   categories:', cats.map(c => c.slug).join(', '))

console.log('3. Screenshot homepage...')
const frontend = process.env.IUME_BLOG_FRONTEND_URL || 'http://localhost:5173'
try {
  const shot = await takeScreenshot({
    url: frontend,
    name: 'smoke-test-home',
    selector: '.site-header',
    waitForSelector: '.site-header',
  })
  console.log('   saved:', shot.path)
} catch (e) {
  console.log('   SKIP (frontend not running):', e.message)
}

console.log('4. Publish test draft...')
const article = await client.publishArticle({
  title: 'MCP 发布测试 ' + new Date().toISOString().slice(0, 16),
  content: '# MCP 发布测试\n\n## 说明\n\n由 iume-atelier MCP 自动发布。\n\n```typescript\nconsole.log("hello")\n```\n',
  categorySlug: 'programming',
  tagSlugs: ['tutorial'],
  status: 'DRAFT',
})
console.log('   draft id:', article.id, 'slug:', article.slug)
console.log('\nAll OK')
