/** 从标题生成 URL slug，中文标题会转为 post-{hash} */
export function generateSlug(title: string): string {
  const trimmed = title.trim()
  if (!trimmed) return 'article'

  let slug = trimmed
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '-')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!slug || /[\u4e00-\u9fff]/.test(trimmed)) {
    let hash = 0
    for (const ch of trimmed) {
      hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
    }
    slug = `post-${Math.abs(hash)}`
  }

  return slug.length > 180 ? slug.slice(0, 180).replace(/-$/, '') : slug
}

/** 从 Markdown 正文提取摘要 */
export function extractSummary(content: string, maxLen = 160): string {
  const text = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*`]/g, '')
    .trim()

  const line = text.split('\n').find((l) => l.trim())?.trim() || ''
  return line.length > maxLen ? line.slice(0, maxLen) : line
}
