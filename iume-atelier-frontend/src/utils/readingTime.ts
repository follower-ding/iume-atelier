/** 估算阅读时间（中文约 400 字/分钟，代码块加权） */
export function estimateReadingTime(text: string): number {
  const plain = text
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/\n/g, ' '))
    .replace(/[#>*`\[\]()!-]/g, '')
    .trim()
  const cjk = (plain.match(/[\u4e00-\u9fff]/g) ?? []).length
  const latin = plain.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(Boolean).length
  const codeBlocks = (text.match(/```[\s\S]*?```/g) ?? []).length
  const minutes = cjk / 400 + latin / 200 + codeBlocks * 0.5
  return Math.max(1, Math.ceil(minutes))
}

export function formatReadingTime(minutes: number, locale = 'zh'): string {
  if (locale === 'zh') return `约 ${minutes} 分钟阅读`
  return `${minutes} min read`
}
