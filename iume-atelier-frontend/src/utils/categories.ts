import type { Category } from '@/types/api'

/** 首页/列表大类展示顺序 */
const CATEGORY_ORDER = ['programming', 'ai', 'life', 'design', 'product', 'essay']

const CATEGORY_META: Record<string, { icon: string; hint: string }> = {
  programming: { icon: '</>', hint: '代码、架构、工程' },
  ai: { icon: 'AI', hint: '大模型、智能体、工具' },
  life: { icon: '☕', hint: '随笔、思考、日常' },
  design: { icon: '◆', hint: 'UI、视觉、体验' },
  product: { icon: '◎', hint: '产品、运营、增长' },
  essay: { icon: '✎', hint: '长文、观点、杂谈' },
}

export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a.slug)
    const ib = CATEGORY_ORDER.indexOf(b.slug)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

export function getCategoryMeta(slug?: string) {
  if (!slug) return { icon: '•', hint: '' }
  return CATEGORY_META[slug] ?? { icon: '•', hint: '' }
}
