import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Trash2 } from 'lucide-react'
import EmojiPicker from '@/components/interactive/EmojiPicker'
import { commentApi } from '@/api'
import { useAuthStore } from '@/store'
import { zh } from '@/locales/zh'
import type { Comment } from '@/types/api'

interface CommentThreadProps {
  comments: Comment[]
  articleId: number
  onRefresh: () => void
}

function displayName(c: Comment) {
  return c.nickname || c.username || c.userName || zh.article.anonymous
}

function canDelete(comment: Comment, userId?: number, role?: string) {
  if (!userId) return false
  return comment.userId === userId || role === 'ADMIN'
}

function countAll(comments: Comment[]): number {
  return comments.reduce((n, c) => n + 1 + countAll(c.replies ?? []), 0)
}

export { countAll as countComments }

function CommentItem({
  comment,
  articleId,
  depth,
  onRefresh,
}: {
  comment: Comment
  articleId: number
  depth: number
  onRefresh: () => void
}) {
  const { user } = useAuthStore()
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !user) return
    setSubmitting(true)
    try {
      await commentApi.create(articleId, replyText.trim(), comment.id)
      setReplyText('')
      setReplying(false)
      onRefresh()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(zh.article.deleteCommentConfirm)) return
    setDeleting(true)
    try {
      await commentApi.remove(comment.id)
      onRefresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={`comment-item ${depth > 0 ? 'comment-item--reply' : ''}`}>
      <div className="comment-item__head">
        <span className="comment-item__author">{displayName(comment)}</span>
        <span className="comment-item__date">
          {new Date(comment.createdAt).toLocaleString('zh-CN')}
        </span>
      </div>
      <p className="comment-item__body">{comment.content}</p>
      <div className="comment-item__actions">
        {user && (
          <button
            type="button"
            className="comment-item__action click-particles-ignore"
            onClick={() => setReplying((v) => !v)}
          >
            <MessageCircle size={14} />
            {zh.article.reply}
          </button>
        )}
        {canDelete(comment, user?.id, user?.role) && (
          <button
            type="button"
            className="comment-item__action comment-item__action--danger click-particles-ignore"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={14} />
            {zh.article.deleteComment}
          </button>
        )}
      </div>

      {replying && user && (
        <form onSubmit={submitReply} className="comment-reply-form">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={zh.article.replyPlaceholder}
            rows={2}
            className="comment-reply-form__input"
            autoFocus
          />
          <EmojiPicker onPick={(e) => setReplyText((t) => t + e)} />
          <div className="comment-reply-form__actions">
            <button type="submit" disabled={submitting || !replyText.trim()} className="btn-primary text-sm py-2 px-4 cursor-pointer">
              {zh.article.postReply}
            </button>
            <button type="button" onClick={() => setReplying(false)} className="btn-ghost text-sm py-2 px-4 cursor-pointer">
              {zh.studio.cancel}
            </button>
          </div>
        </form>
      )}

      {(comment.replies?.length ?? 0) > 0 && (
        <div className="comment-replies">
          {comment.replies!.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              articleId={articleId}
              depth={depth + 1}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CommentThread({ comments, articleId, onRefresh }: CommentThreadProps) {
  const { user } = useAuthStore()
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !user) return
    setSubmitting(true)
    try {
      await commentApi.create(articleId, text.trim())
      setText('')
      onRefresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="comment-section">
      <h2 className="section-title text-xl lg:text-2xl">
        {zh.article.comments}（{countAll(comments)}）
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={zh.article.commentPlaceholder}
            rows={3}
            className="comment-form__input"
          />
          <EmojiPicker onPick={(e) => setText((t) => t + e)} />
          <button type="submit" disabled={submitting} className="btn-primary cursor-pointer mt-3">
            {zh.article.postComment}
          </button>
        </form>
      ) : (
        <p className="mb-6 text-secondary">
          {zh.article.signInToComment}{' '}
          <Link to="/login" className="prose-link cursor-pointer">{zh.nav.signIn}</Link>
        </p>
      )}

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="text-secondary py-6">{zh.article.noComments}</p>
        ) : (
          comments.map((c) => (
            <CommentItem key={c.id} comment={c} articleId={articleId} depth={0} onRefresh={onRefresh} />
          ))
        )}
      </div>
    </section>
  )
}
