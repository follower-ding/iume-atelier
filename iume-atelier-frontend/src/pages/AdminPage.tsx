import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Edit, ExternalLink, ImagePlus, Loader2 } from 'lucide-react'
import { articleApi, categoryApi, tagApi, uploadApi } from '@/api'
import TechBlogEditor from '@/components/business/TechBlogEditor'
import PageMeta from '@/components/seo/PageMeta'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'
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

export default function AdminPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [form, setForm] = useState<ArticleRequest>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)
  const [slugManual, setSlugManual] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadArticles()
    categoryApi.list().then(setCategories).catch(() => {})
    tagApi.list().then(setTags).catch(() => {})
  }, [user, navigate])

  const loadArticles = () => {
    articleApi.manage(1, 50).then((res) => setArticles(res.records)).catch(() => {})
  }

  const handleSave = async (status?: 'DRAFT' | 'PUBLISHED') => {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    setMessage('')
    setMessageIsError(false)

    const payload: ArticleRequest = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      slug: form.slug?.trim() || generateSlug(form.title),
      summary: form.summary?.trim() || extractSummary(form.content),
      status: status || form.status,
    }

    try {
      if (editingId) {
        await articleApi.update(editingId, payload)
      } else {
        await articleApi.create(payload)
      }
      setMessage(zh.studio.saved)
      setMessageIsError(false)
      setForm(emptyForm)
      setEditingId(null)
      setSlugManual(false)
      setShowForm(false)
      loadArticles()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : zh.studio.saveFailed)
      setMessageIsError(true)
    } finally {
      setSaving(false)
    }
  }

  const handleTitleChange = (title: string) => {
    const next: ArticleRequest = { ...form, title }
    if (!slugManual && !editingId) {
      next.slug = generateSlug(title)
    }
    setForm(next)
  }

  const handleEdit = (article: Article) => {
    setForm({
      title: article.title,
      slug: article.slug,
      content: article.content,
      summary: article.summary,
      status: article.status,
      categoryId: article.categoryId,
      tagIds: article.tags?.map((t) => t.id) || [],
      coverImage: article.coverImage,
    })
    setEditingId(article.id)
    setSlugManual(true)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number) => {
    if (confirm(zh.studio.deleteConfirm)) {
      await articleApi.remove(id)
      loadArticles()
    }
  }

  const toggleTag = (tagId: number) => {
    const current = form.tagIds || []
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId]
    setForm({ ...form, tagIds: next })
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  if (!user) return null

  return (
    <>
      <PageMeta title={zh.studio.title} description="技术博客写作与管理" />
      <section className="page-container py-10 lg:py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl">{zh.studio.title}</h1>
            <p className="mt-2 text-sm text-zinc-500">专注技术写作，支持 Markdown、代码高亮、图片粘贴</p>
          </div>
          {!showForm && (
            <button
              type="button"
              onClick={() => { setShowForm(true); setForm(emptyForm); setEditingId(null); setSlugManual(false); setMessage('') }}
              className="btn-primary inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} /> {zh.studio.newArticle}
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-12 space-y-5">
            <h2 className="font-display text-2xl">{editingId ? zh.studio.editArticle : zh.studio.newArticle}</h2>

            <input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={zh.studio.titlePlaceholder}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 font-display text-2xl"
            />

            <div>
              <label className="block text-xs text-zinc-500 mb-1">{zh.studio.slug}</label>
              <input
                value={form.slug || ''}
                onChange={(e) => { setSlugManual(true); setForm({ ...form, slug: e.target.value }) }}
                placeholder={zh.studio.slugPlaceholder}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm font-mono text-zinc-600 dark:text-zinc-400"
              />
            </div>

            <input
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder={zh.studio.summaryPlaceholder}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 text-sm"
            />

            <div className="flex flex-wrap gap-3 items-center">
              <input
                value={form.coverImage || ''}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder={zh.studio.coverPlaceholder}
                className="flex-1 min-w-[200px] rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm"
              />
              <label className="btn-ghost inline-flex items-center gap-2 cursor-pointer text-sm">
                {coverUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                上传封面
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
              </label>
              {form.coverImage && (
                <img src={form.coverImage} alt="封面预览" className="h-12 w-20 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700" />
              )}
            </div>

            <TechBlogEditor
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
            />

            <div className="flex flex-wrap gap-4 items-start">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">{zh.studio.category}</label>
                <select
                  value={form.categoryId || ''}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : undefined })}
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 cursor-pointer text-sm"
                >
                  <option value="">{zh.studio.noCategory}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">{zh.studio.status}</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 cursor-pointer text-sm"
                >
                  <option value="DRAFT">{zh.studio.draft}</option>
                  <option value="PUBLISHED">{zh.studio.published}</option>
                </select>
              </div>
            </div>

            {tags.length > 0 && (
              <div>
                <label className="block text-xs text-zinc-500 mb-2">{zh.studio.tags}</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={`rounded-full px-3 py-1 text-sm cursor-pointer transition-colors ${
                        form.tagIds?.includes(t.id)
                          ? 'bg-accent text-white'
                          : 'border border-zinc-300 dark:border-zinc-700 hover:border-accent'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                disabled={saving || !form.title || !form.content}
                onClick={() => handleSave('PUBLISHED')}
                className="btn-primary cursor-pointer disabled:opacity-50"
              >
                {saving ? '保存中…' : zh.studio.publish}
              </button>
              <button
                type="button"
                disabled={saving || !form.title || !form.content}
                onClick={() => handleSave('DRAFT')}
                className="btn-ghost cursor-pointer disabled:opacity-50"
              >
                {zh.studio.saveDraft}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost cursor-pointer">
                {zh.studio.cancel}
              </button>
              {message && (
                <span className={`text-sm self-center ${messageIsError ? 'text-red-500' : 'text-green-600'}`}>
                  {message}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-sm text-zinc-500">
                  <span className={a.status === 'PUBLISHED' ? 'text-green-600' : 'text-amber-600'}>
                    {a.status === 'PUBLISHED' ? zh.studio.published : zh.studio.draft}
                  </span>
                  {' · '}{a.authorName}
                  {' · '}{a.viewCount} {zh.article.reads}
                </div>
              </div>
              <div className="flex gap-2">
                {a.status === 'PUBLISHED' && (
                  <Link to={`/article/${a.slug}`} target="_blank" className="p-2 hover:text-accent cursor-pointer" title={zh.studio.view}>
                    <ExternalLink size={16} />
                  </Link>
                )}
                <button type="button" onClick={() => handleEdit(a)} className="p-2 hover:text-accent cursor-pointer" title="编辑">
                  <Edit size={16} />
                </button>
                <button type="button" onClick={() => handleDelete(a.id)} className="p-2 hover:text-red-500 cursor-pointer" title="删除">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
