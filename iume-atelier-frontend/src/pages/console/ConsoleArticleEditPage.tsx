import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ExternalLink, ImagePlus, Loader2 } from 'lucide-react'
import { articleApi, categoryApi, tagApi, uploadApi } from '@/api'
import TechBlogEditor from '@/components/business/TechBlogEditor'
import { clearDraft, loadDraft, useDraftAutosave } from '@/hooks/useDraftAutosave'
import { zh } from '@/locales/zh'
import { sortCategories } from '@/utils/categories'
import { generateSlug, extractSummary } from '@/utils/slug'
import type { ArticleRequest, Category, Tag } from '@/types/api'

const emptyForm: ArticleRequest = {
  title: '',
  content: '',
  summary: '',
  status: 'DRAFT',
  categoryId: undefined,
  tagIds: [],
}

export default function ConsoleArticleEditPage() {
  const { id } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const isNew = id === 'new' || pathname.endsWith('/articles/new')
  const editingId = isNew ? null : Number(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [form, setForm] = useState<ArticleRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useDraftAutosave(form, editingId, true)

  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {})
    tagApi.list().then(setTags).catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) {
      const draft = loadDraft(null)
      if (draft?.title || draft?.content) setForm(draft)
      setLoading(false)
      return
    }
    if (!editingId || Number.isNaN(editingId)) return
    setLoading(true)
    articleApi
      .getById(editingId)
      .then((a) => {
        setForm({
          title: a.title,
          slug: a.slug,
          content: a.content,
          summary: a.summary,
          status: a.status,
          categoryId: a.categoryId,
          tagIds: a.tags?.map((t) => t.id) || [],
          coverImage: a.coverImage,
        })
        setSlugManual(true)
      })
      .catch(() => navigate('/console/articles'))
      .finally(() => setLoading(false))
  }, [editingId, isNew, navigate])

  const handleSave = async (status?: 'DRAFT' | 'PUBLISHED') => {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    setMessage('')
    const payload: ArticleRequest = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      slug: form.slug?.trim() || generateSlug(form.title),
      summary: form.summary?.trim() || extractSummary(form.content),
      status: status || form.status,
    }
    const savedId = editingId
    try {
      if (editingId) await articleApi.update(editingId, payload)
      else await articleApi.create(payload)
      clearDraft(savedId)
      navigate('/console/articles')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : zh.studio.saveFailed)
      setMessageIsError(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="console-page"><p className="text-secondary">{zh.articles.loading}</p></div>

  return (
    <div className="console-page">
      <header className="console-page__header console-page__header--row">
        <div>
          <h1>{isNew ? zh.studio.newArticle : zh.studio.editArticle}</h1>
          <Link to="/console/articles" className="text-sm prose-link cursor-pointer">← {zh.console.backToList}</Link>
        </div>
        {form.slug && (
          <Link to={`/article/${form.slug}`} target="_blank" className="btn-ghost text-sm inline-flex items-center gap-1.5 cursor-pointer">
            <ExternalLink size={14} />
            {form.status === 'PUBLISHED' ? zh.studio.view : zh.studio.previewDraft}
          </Link>
        )}
      </header>

      <div className="space-y-5 max-w-4xl">
        <input
          value={form.title}
          onChange={(e) => {
            const title = e.target.value
            const next = { ...form, title }
            if (!slugManual && !editingId) next.slug = generateSlug(title)
            setForm(next)
          }}
          placeholder={zh.studio.titlePlaceholder}
          className="console-input console-input--lg"
        />
        <input
          value={form.slug || ''}
          onChange={(e) => { setSlugManual(true); setForm({ ...form, slug: e.target.value }) }}
          placeholder={zh.studio.slugPlaceholder}
          className="console-input font-mono text-sm"
        />
        <input
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          placeholder={zh.studio.summaryPlaceholder}
          className="console-input"
        />
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={form.coverImage || ''}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            placeholder={zh.studio.coverPlaceholder}
            className="console-input flex-1 min-w-[200px]"
          />
          <label className="btn-ghost inline-flex items-center gap-2 cursor-pointer text-sm">
            {coverUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            上传封面
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setCoverUploading(true)
                try {
                  const url = await uploadApi.uploadImage(file)
                  setForm({ ...form, coverImage: url })
                } finally {
                  setCoverUploading(false)
                  e.target.value = ''
                }
              }}
            />
          </label>
        </div>

        <TechBlogEditor value={form.content} onChange={(content) => setForm({ ...form, content })} />

        <div className="flex flex-wrap gap-4">
          <select
            value={form.categoryId || ''}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : undefined })}
            className="console-select"
          >
            <option value="">{zh.studio.noCategory}</option>
            {sortCategories(categories).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
            className="console-select"
          >
            <option value="DRAFT">{zh.studio.draft}</option>
            <option value="PUBLISHED">{zh.studio.published}</option>
          </select>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  const current = form.tagIds || []
                  setForm({
                    ...form,
                    tagIds: current.includes(t.id) ? current.filter((x) => x !== t.id) : [...current, t.id],
                  })
                }}
                className={`rounded-full px-3 py-1 text-sm cursor-pointer ${
                  form.tagIds?.includes(t.id) ? 'bg-accent text-white' : 'border border-zinc-600'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={saving} onClick={() => handleSave('PUBLISHED')} className="btn-primary cursor-pointer">{zh.studio.publish}</button>
          <button type="button" disabled={saving} onClick={() => handleSave('DRAFT')} className="btn-ghost cursor-pointer">{zh.studio.saveDraft}</button>
          {message && <span className={`text-sm ${messageIsError ? 'text-red-500' : 'text-green-600'}`}>{message}</span>}
        </div>
      </div>
    </div>
  )
}
