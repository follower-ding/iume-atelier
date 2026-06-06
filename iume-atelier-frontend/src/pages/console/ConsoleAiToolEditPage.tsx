import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { aiToolApi } from '@/api'
import { aiToolCategories } from '@/data/ai-tools'
import { zh } from '@/locales/zh'
import type { AiToolRequestDto } from '@/types/ai-tool-api'
import { parseAiToolQuickImport } from '@/utils/parseAiToolQuickImport'

const emptyForm = (): AiToolRequestDto => ({
  slug: '',
  name: '',
  description: '',
  category: 'mcp',
  icon: '🔌',
  tags: [],
  featured: false,
  source: 'custom',
  detail: {
    intro: '',
    features: [],
    install: [],
    setup: [],
    usage: [],
    configs: [],
    related: [],
  },
})

function linesToArray(text: string) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean)
}

function arrayToLines(arr?: string[]) {
  return (arr ?? []).join('\n')
}

export default function ConsoleAiToolEditPage() {
  const { id } = useParams<{ id: string }>()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const [form, setForm] = useState<AiToolRequestDto>(emptyForm())
  const [quickPaste, setQuickPaste] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew || !id) return
    aiToolApi.getBySlug(id).then((dto) => {
      setForm({
        slug: dto.slug,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        icon: dto.icon,
        tags: dto.tags ?? [],
        url: dto.url,
        featured: dto.featured,
        source: dto.source,
        sortOrder: dto.sortOrder,
        detail: {
          intro: dto.detail.intro,
          features: dto.detail.features ?? [],
          install: dto.detail.install ?? [],
          setup: dto.detail.setup ?? [],
          usage: dto.detail.usage ?? [],
          configs: dto.detail.configs ?? [],
          related: dto.detail.related ?? [],
        },
      })
    }).catch(() => setError(zh.console.saveFailed))
  }, [id, isNew])

  const patch = (partial: Partial<AiToolRequestDto>) => setForm((f) => ({ ...f, ...partial }))
  const patchDetail = (partial: Partial<AiToolRequestDto['detail']>) =>
    setForm((f) => ({ ...f, detail: { ...f.detail, ...partial } }))

  const handleQuickImport = () => {
    const parsed = parseAiToolQuickImport(quickPaste, form.category)
    setForm((f) => ({
      ...f,
      ...parsed,
      slug: parsed.slug || f.slug,
      detail: { ...f.detail, ...parsed.detail },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      if (isNew) {
        await aiToolApi.create(form)
      } else {
        await aiToolApi.update(id!, form)
      }
      navigate('/console/ai-tools')
    } catch {
      setError(zh.console.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="console-page console-page--fill">
      <header className="console-page__header">
        <Link to="/console/ai-tools" className="console-back-link cursor-pointer">← {zh.console.backToList}</Link>
        <h1>{isNew ? zh.console.newAiTool : zh.console.editAiTool}</h1>
        <p>{zh.console.aiToolEditHint}</p>
      </header>

      <section className="console-quick-import mb-8 max-w-4xl">
        <h2 className="text-lg font-semibold mb-2">{zh.console.aiToolQuickImport}</h2>
        <p className="text-sm text-secondary mb-3">{zh.console.aiToolQuickImportDesc}</p>
        <textarea
          className="console-input w-full min-h-[120px]"
          placeholder={zh.console.aiToolQuickImportPlaceholder}
          value={quickPaste}
          onChange={(e) => setQuickPaste(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" className="btn-secondary cursor-pointer" onClick={handleQuickImport}>
            {zh.console.aiToolQuickImportBtn}
          </button>
          <p className="text-sm text-secondary self-center">{zh.console.aiToolCursorHint}</p>
        </div>
      </section>

      <form className="space-y-5 max-w-4xl" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="console-label">slug</span>
            <input className="console-input w-full" value={form.slug} onChange={(e) => patch({ slug: e.target.value })} required />
          </label>
          <label className="block">
            <span className="console-label">{zh.console.aiToolName}</span>
            <input className="console-input w-full" value={form.name} onChange={(e) => patch({ name: e.target.value })} required />
          </label>
        </div>

        <label className="block">
          <span className="console-label">{zh.console.aiToolDesc}</span>
          <textarea className="console-input w-full" rows={2} value={form.description} onChange={(e) => patch({ description: e.target.value })} required />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="console-label">{zh.console.aiToolCategory}</span>
            <select className="console-select w-full" value={form.category} onChange={(e) => patch({ category: e.target.value as AiToolRequestDto['category'] })}>
              {aiToolCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="console-label">icon</span>
            <input className="console-input w-full" value={form.icon} onChange={(e) => patch({ icon: e.target.value })} />
          </label>
          <label className="block">
            <span className="console-label">URL</span>
            <input className="console-input w-full" value={form.url ?? ''} onChange={(e) => patch({ url: e.target.value })} />
          </label>
        </div>

        <label className="block">
          <span className="console-label">tags（逗号分隔）</span>
          <input className="console-input w-full" value={form.tags.join(', ')} onChange={(e) => patch({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => patch({ featured: e.target.checked })} />
          <span>{zh.aiTools.featuredBadge}</span>
        </label>

        <label className="block">
          <span className="console-label">{zh.aiTools.features}（每行一条）</span>
          <textarea className="console-input w-full" rows={3} value={arrayToLines(form.detail.features)} onChange={(e) => patchDetail({ features: linesToArray(e.target.value) })} />
        </label>

        <label className="block">
          <span className="console-label">{zh.aiTools.install}（每行一条）</span>
          <textarea className="console-input w-full" rows={4} value={arrayToLines(form.detail.install)} onChange={(e) => patchDetail({ install: linesToArray(e.target.value) })} />
        </label>

        <label className="block">
          <span className="console-label">{zh.aiTools.setup}（每行一条）</span>
          <textarea className="console-input w-full" rows={4} value={arrayToLines(form.detail.setup)} onChange={(e) => patchDetail({ setup: linesToArray(e.target.value) })} />
        </label>

        <label className="block">
          <span className="console-label">{zh.aiTools.howToUse}（每行一条）</span>
          <textarea className="console-input w-full" rows={4} value={arrayToLines(form.detail.usage)} onChange={(e) => patchDetail({ usage: linesToArray(e.target.value) })} />
        </label>

        <label className="block">
          <span className="console-label">{zh.aiTools.configSnippet}（JSON 数组）</span>
          <textarea
            className="console-input w-full font-mono text-sm"
            rows={10}
            value={JSON.stringify(form.detail.configs ?? [], null, 2)}
            onChange={(e) => {
              try {
                patchDetail({ configs: JSON.parse(e.target.value) })
                setError('')
              } catch {
                setError('configs JSON 格式错误')
              }
            }}
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary cursor-pointer" disabled={saving}>
            {saving ? zh.articles.loading : zh.console.save}
          </button>
          <Link to="/console/ai-tools" className="btn-secondary cursor-pointer inline-flex items-center">{zh.console.cancel}</Link>
        </div>
      </form>
    </div>
  )
}
