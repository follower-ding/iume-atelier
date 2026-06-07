import { useState } from 'react'
import { newsletterApi } from '@/api'
import { zh } from '@/locales/zh'

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'dup' | 'error'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setStatus('loading')
    try {
      await newsletterApi.subscribe(trimmed)
      setStatus('ok')
      setEmail('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setStatus(msg.includes('already') || msg.includes('已') ? 'dup' : 'error')
    }
  }

  return (
    <form onSubmit={submit} className="newsletter-subscribe">
      <label htmlFor="newsletter-email" className="newsletter-subscribe__label">
        {zh.newsletter.title}
      </label>
      <p className="newsletter-subscribe__hint">{zh.newsletter.hint}</p>
      <div className="newsletter-subscribe__row">
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
          placeholder={zh.newsletter.placeholder}
          className="newsletter-subscribe__input"
          required
        />
        <button type="submit" disabled={status === 'loading'} className="btn-primary cursor-pointer shrink-0">
          {status === 'loading' ? zh.newsletter.submitting : zh.newsletter.submit}
        </button>
      </div>
      {status === 'ok' && <p className="newsletter-subscribe__msg newsletter-subscribe__msg--ok">{zh.newsletter.success}</p>}
      {status === 'dup' && <p className="newsletter-subscribe__msg">{zh.newsletter.duplicate}</p>}
      {status === 'error' && <p className="newsletter-subscribe__msg newsletter-subscribe__msg--error">{zh.newsletter.error}</p>}
    </form>
  )
}
