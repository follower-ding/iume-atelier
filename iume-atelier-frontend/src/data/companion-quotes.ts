import { useUserPrefsStore } from '@/store/useUserPrefsStore'

export const companionQuotes = [
  '写下去，好文章都是改出来的。',
  '今天也要写一点可运行的代码。',
  'Markdown 是程序员的母语。',
  '保存草稿，灵感不会等人。',
  '分屏预览，所见即所得。',
  '小步提交，大步发布。',
  '读完了？记得留下评论。',
  '简洁模式随时可开，专注写作。',
  'iume·atelier — 你的写作工作室。',
  'Ctrl+S 是肌肉记忆，存草稿也是。',
]

export function randomQuote(): string {
  const { companionCallName, customQuotes } = useUserPrefsStore.getState()
  const personal = customQuotes.map((q) => q.trim()).filter(Boolean)
  const pool = [...personal, ...companionQuotes]

  if (companionCallName.trim()) {
    pool.push(`${companionCallName.trim()}，今天也要好好写。`)
    pool.push(`加油，${companionCallName.trim()}！`)
  }

  return pool[Math.floor(Math.random() * pool.length)]
}
