import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, X, Check } from 'lucide-react'
import { categoryApi, tagApi } from '@/api'
import { zh } from '@/locales/zh'
import { generateSlug } from '@/utils/slug'
import type { Category, CategoryRequest, Tag, TagRequest } from '@/types/api'

type TaxonomyTab = 'categories' | 'tags'

const emptyCategory: CategoryRequest = { name: '', slug: '', description: '' }
const emptyTag: TagRequest = { name: '', slug: '' }

export default function TaxonomyPanel() {
  const [tab, setTab] = useState<TaxonomyTab>('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageIsError, setMessageIsError] = useState(false)

  const [catForm, setCatForm] = useState<CategoryRequest>(emptyCategory)
  const [tagForm, setTagForm] = useState<TagRequest>(emptyTag)
  const [editingCatId, setEditingCatId] = useState<number | null>(null)
  const [editingTagId, setEditingTagId] = useState<number | null>(null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [cats, tgs] = await Promise.all([categoryApi.list(), tagApi.list()])
      setCategories(cats)
      setTags(tgs)
    } catch {
      setMessage(zh.taxonomy.loadFailed)
      setMessageIsError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const resetCatForm = () => {
    setCatForm(emptyCategory)
    setEditingCatId(null)
    setShowCatForm(false)
  }

  const resetTagForm = () => {
    setTagForm(emptyTag)
    setEditingTagId(null)
    setShowTagForm(false)
  }

  const handleSaveCategory = async () => {
    if (!catForm.name.trim() || !catForm.slug.trim()) return
    setSaving(true)
    setMessage('')
    const payload: CategoryRequest = {
      name: catForm.name.trim(),
      slug: catForm.slug.trim(),
      description: catForm.description?.trim() || undefined,
    }
    try {
      if (editingCatId) {
        await categoryApi.update(editingCatId, payload)
      } else {
        await categoryApi.create(payload)
      }
      setMessage(zh.taxonomy.saved)
      setMessageIsError(false)
      resetCatForm()
      await load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : zh.taxonomy.saveFailed)
      setMessageIsError(true)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTag = async () => {
    if (!tagForm.name.trim() || !tagForm.slug.trim()) return
    setSaving(true)
    setMessage('')
    const payload: TagRequest = {
      name: tagForm.name.trim(),
      slug: tagForm.slug.trim(),
    }
    try {
      if (editingTagId) {
        await tagApi.update(editingTagId, payload)
      } else {
        await tagApi.create(payload)
      }
      setMessage(zh.taxonomy.saved)
      setMessageIsError(false)
      resetTagForm()
      await load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : zh.taxonomy.saveFailed)
      setMessageIsError(true)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm(zh.taxonomy.deleteCategoryConfirm)) return
    try {
      await categoryApi.remove(id)
      await load()
      setMessage(zh.taxonomy.deleted)
      setMessageIsError(false)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : zh.taxonomy.deleteFailed)
      setMessageIsError(true)
    }
  }

  const handleDeleteTag = async (id: number) => {
    if (!confirm(zh.taxonomy.deleteTagConfirm)) return
    try {
      await tagApi.remove(id)
      await load()
      setMessage(zh.taxonomy.deleted)
      setMessageIsError(false)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : zh.taxonomy.deleteFailed)
      setMessageIsError(true)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setTab('categories'); setMessage('') }}
          className={`category-pill cursor-pointer ${tab === 'categories' ? 'category-pill--active' : ''}`}
        >
          {zh.taxonomy.categories}
        </button>
        <button
          type="button"
          onClick={() => { setTab('tags'); setMessage('') }}
          className={`category-pill cursor-pointer ${tab === 'tags' ? 'category-pill--active' : ''}`}
        >
          {zh.taxonomy.tags}
        </button>
      </div>

      {message && (
        <p className={`mb-4 text-sm ${messageIsError ? 'text-red-500' : 'text-green-600'}`}>{message}</p>
      )}

      {tab === 'categories' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">{zh.taxonomy.categories}</h2>
            {!showCatForm && (
              <button
                type="button"
                onClick={() => { resetCatForm(); setShowCatForm(true) }}
                className="btn-primary inline-flex items-center gap-2 cursor-pointer text-sm"
              >
                <Plus size={16} /> {zh.taxonomy.addCategory}
              </button>
            )}
          </div>

          {showCatForm && (
            <div className="mb-6 space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: editingCatId ? catForm.slug : generateSlug(e.target.value) })}
                placeholder={zh.taxonomy.namePlaceholder}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm"
              />
              <input
                value={catForm.slug}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                placeholder={zh.taxonomy.slugPlaceholder}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm font-mono"
              />
              <input
                value={catForm.description || ''}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                placeholder={zh.taxonomy.descriptionPlaceholder}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button type="button" disabled={saving} onClick={handleSaveCategory} className="btn-primary cursor-pointer text-sm inline-flex items-center gap-1">
                  <Check size={14} /> {saving ? zh.taxonomy.saving : zh.taxonomy.save}
                </button>
                <button type="button" onClick={resetCatForm} className="btn-ghost cursor-pointer text-sm inline-flex items-center gap-1">
                  <X size={14} /> {zh.studio.cancel}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-secondary">{zh.articles.loading}</p>
          ) : categories.length === 0 ? (
            <p className="text-secondary">{zh.taxonomy.emptyCategories}</p>
          ) : (
            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">{c.slug}{c.description ? ` · ${c.description}` : ''}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCatForm({ name: c.name, slug: c.slug, description: c.description })
                        setEditingCatId(c.id)
                        setShowCatForm(true)
                      }}
                      className="p-2 hover:text-accent cursor-pointer"
                    >
                      <Edit size={15} />
                    </button>
                    <button type="button" onClick={() => handleDeleteCategory(c.id)} className="p-2 hover:text-red-500 cursor-pointer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'tags' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">{zh.taxonomy.tags}</h2>
            {!showTagForm && (
              <button
                type="button"
                onClick={() => { resetTagForm(); setShowTagForm(true) }}
                className="btn-primary inline-flex items-center gap-2 cursor-pointer text-sm"
              >
                <Plus size={16} /> {zh.taxonomy.addTag}
              </button>
            )}
          </div>

          {showTagForm && (
            <div className="mb-6 space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <input
                value={tagForm.name}
                onChange={(e) => setTagForm({ ...tagForm, name: e.target.value, slug: editingTagId ? tagForm.slug : generateSlug(e.target.value) })}
                placeholder={zh.taxonomy.namePlaceholder}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm"
              />
              <input
                value={tagForm.slug}
                onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })}
                placeholder={zh.taxonomy.slugPlaceholder}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm font-mono"
              />
              <div className="flex gap-2">
                <button type="button" disabled={saving} onClick={handleSaveTag} className="btn-primary cursor-pointer text-sm inline-flex items-center gap-1">
                  <Check size={14} /> {saving ? zh.taxonomy.saving : zh.taxonomy.save}
                </button>
                <button type="button" onClick={resetTagForm} className="btn-ghost cursor-pointer text-sm inline-flex items-center gap-1">
                  <X size={14} /> {zh.studio.cancel}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-secondary">{zh.articles.loading}</p>
          ) : tags.length === 0 ? (
            <p className="text-secondary">{zh.taxonomy.emptyTags}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <div key={t.id} className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm">
                  <span>{t.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTagForm({ name: t.name, slug: t.slug })
                      setEditingTagId(t.id)
                      setShowTagForm(true)
                    }}
                    className="p-0.5 hover:text-accent cursor-pointer"
                  >
                    <Edit size={13} />
                  </button>
                  <button type="button" onClick={() => handleDeleteTag(t.id)} className="p-0.5 hover:text-red-500 cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
