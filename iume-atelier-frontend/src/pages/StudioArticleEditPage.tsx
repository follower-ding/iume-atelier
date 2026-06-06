import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ExternalLink, ImagePlus, Loader2 } from 'lucide-react'
import { articleApi, categoryApi, tagApi, uploadApi } from '@/api'
import TechBlogEditor from '@/components/business/TechBlogEditor'
import PageMeta from '@/components/seo/PageMeta'
import { clearDraft, loadDraft, useDraftAutosave } from '@/hooks/useDraftAutosave'
import { zh } from '@/locales/zh'
import { sortCategories } from '@/utils/categories'
import { generateSlug, extractSummary } from '@/utils/slug'
import type { Article, ArticleRequest, Category, Tag } from '@/types/api'

const emptyForm: ArticleRequest = {
  title: '',
  content: '',
  summary: '',
  status: 'DRAFT',
  categoryId: undefined,
  tagIds: [],
}

export default function StudioArticleEditPage() {
  const { id } = useParams<{ id: string }>()
  const { pathname } = useLocation()
  const isNew = id === 'new' || pathname.endsWith('/studio/new')
  const editingId = isNew ? null : Number(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [form, setForm] = useState<ArticleRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useDraftAutosave(form, editingId, true)

  useEffect(() => {
    document.documentElement.classList.add('studio-write-mode')
    return () => document.documentElement.classList.remove('studio-write-mode')
  }, [])

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
        if (a.summary || a.coverImage) setSettingsOpen(true)
      })
      .catch(() => navigate('/studio'))
      .finally(() => setLoading(false))
  }, [editingId, isNew, navigate])

  const handleSave = async (
    status?: 'DRAFT' | 'PUBLISHED',
    options?: { redirect?: boolean; silentSuccess?: boolean },
  ): Promise<Article | null> => {
    if (!form.title.trim()) {
      setMessage(zh.studio.titleRequired)
      setMessageIsError(true)
      return null
    }
    if (!form.content.trim()) {
      setMessage(zh.studio.contentRequired)
      setMessageIsError(true)
      return null
    }
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
      const result = editingId
        ? await articleApi.update(editingId, payload)
        : await articleApi.create(payload)
      clearDraft(savedId)
      if (!options?.silentSuccess) {
        setMessage(status === 'PUBLISHED' ? zh.studio.published : zh.studio.saved)
        setMessageIsError(false)
      }
      if (options?.redirect !== false) {
        navigate('/studio')
      } else if (!editingId && result.id) {
        navigate(`/studio/${result.id}/edit`, { replace: true })
      }
      return result
    } catch (err) {
      setMessage(err instanceof Error ? err.message : zh.studio.saveFailed)
      setMessageIsError(true)
      return null
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    if (!form.title.trim()) {
      setMessage(zh.studio.titleRequired)
      setMessageIsError(true)
      return
    }
    if (!form.content.trim()) {
      setMessage(zh.studio.contentRequired)
      setMessageIsError(true)
      return
    }
    setPreviewing(true)
    setMessage(zh.studio.previewSaving)
    setMessageIsError(false)
    try {
      const result = await handleSave('DRAFT', { redirect: false, silentSuccess: true })
      const slug = result?.slug || form.slug?.trim() || generateSlug(form.title)
      if (slug) {
        window.open(`/article/${slug}`, '_blank', 'noopener,noreferrer')
        setMessage('')
      }
    } finally {
      setPreviewing(false)
    }
  }

  if (loading) {
    return (
      <section className="studio-write">
        <div className="studio-write__inner">
          <p className="text-secondary">{zh.articles.loading}</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <PageMeta title={isNew ? zh.studio.newArticle : zh.studio.editArticle} />
      <section className="studio-write">
        <div className="studio-write__toolbar">
          <div className="studio-write__inner studio-write__toolbar-inner">
            <Link to="/studio" className="studio-write__back cursor-pointer">
              ← {zh.studio.backToList}
            </Link>
            <div className="studio-write__toolbar-actions click-particles-ignore">
              <button
                type="button"
                disabled={saving || previewing}
                onClick={handlePreview}
                className="btn-ghost text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink size={14} />
                {previewing ? zh.studio.previewSaving : (form.status === 'PUBLISHED' ? zh.studio.view : zh.studio.previewDraft)}
              </button>
              <button
                type="button"
                disabled={saving || previewing}
                onClick={() => handleSave('DRAFT')}
                className="btn-ghost cursor-pointer"
              >
                {saving ? zh.studio.save : zh.studio.saveDraft}
              </button>
              <button
                type="button"
                disabled={saving || previewing}
                onClick={() => handleSave('PUBLISHED')}
                className="btn-primary cursor-pointer"
              >
                {saving ? zh.studio.save : zh.studio.publish}
              </button>
            </div>
          </div>
        </div>

        <div className="studio-write__inner">
          {message && (
            <p className={`studio-write__message studio-write__message--banner ${messageIsError ? 'studio-write__message--error' : 'studio-write__message--ok'}`}>
              {message}
            </p>
          )}
          <p className="studio-write__hint">{zh.studio.writingHint}</p>

          <input
            value={form.title}
            onChange={(e) => {
              const title = e.target.value
              const next = { ...form, title }
              if (!slugManual && !editingId) next.slug = generateSlug(title)
              setForm(next)
            }}
            placeholder={zh.studio.titlePlaceholder}
            className="studio-write__title"
            autoFocus
          />

          <details
            className="studio-write__settings"
            open={settingsOpen}
            onToggle={(e) => setSettingsOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="studio-write__settings-summary cursor-pointer">
              <span>{zh.studio.articleSettings}</span>
              <span className="studio-write__settings-hint">{zh.studio.settingsHint}</span>
              <ChevronDown size={16} className="studio-write__settings-chevron" />
            </summary>
            <div className="studio-write__settings-body">
              <label className="studio-write__field">
                <span>{zh.studio.slug}</span>
                <input
                  value={form.slug || ''}
                  onChange={(e) => { setSlugManual(true); setForm({ ...form, slug: e.target.value }) }}
                  placeholder={zh.studio.slugPlaceholder}
                  className="studio-write__input studio-write__input--mono"
                />
              </label>
              <label className="studio-write__field">
                <span>{zh.studio.summaryPlaceholder}</span>
                <input
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder={zh.studio.summaryPlaceholder}
                  className="studio-write__input"
                />
              </label>
              <label className="studio-write__field">
                <span>{zh.studio.coverPlaceholder}</span>
                <div className="studio-write__cover-row">
                  <input
                    value={form.coverImage || ''}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    placeholder={zh.studio.coverPlaceholder}
                    className="studio-write__input"
                  />
                  <label className="btn-ghost inline-flex items-center gap-2 cursor-pointer text-sm shrink-0">
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
                {form.coverImage && (
                  <img src={form.coverImage} alt="" className="studio-write__cover-preview" />
                )}
              </label>
              <div className="studio-write__field-row">
                <label className="studio-write__field studio-write__field--half">
                  <span>{zh.studio.category}</span>
                  <select
                    value={form.categoryId || ''}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                    className="studio-write__select"
                  >
                    <option value="">{zh.studio.noCategory}</option>
                    {sortCategories(categories).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="studio-write__field studio-write__field--half">
                  <span>{zh.studio.status}</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                    className="studio-write__select"
                  >
                    <option value="DRAFT">{zh.studio.draft}</option>
                    <option value="PUBLISHED">{zh.studio.published}</option>
                  </select>
                </label>
              </div>
              {tags.length > 0 && (
                <div className="studio-write__field">
                  <span>{zh.studio.tags}</span>
                  <div className="studio-write__tags">
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
                        className={`studio-write__tag cursor-pointer ${form.tagIds?.includes(t.id) ? 'studio-write__tag--active' : ''}`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>

          <div className="studio-write__editor">
            <TechBlogEditor
              immersive
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
            />
          </div>

        </div>
      </section>
    </>
  )
}
