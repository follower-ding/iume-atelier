/** Resolve API-relative asset URLs for use in img src */
export function resolveAssetUrl(url?: string | null): string | null {
  if (!url?.trim()) return null
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export function isAdmin(user: { role?: string } | null | undefined): boolean {
  return user?.role === 'ADMIN'
}

export function isAuthor(user: { role?: string } | null | undefined): boolean {
  return user?.role === 'AUTHOR' || user?.role === 'ADMIN'
}
