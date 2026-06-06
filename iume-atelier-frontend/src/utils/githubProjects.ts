import type { ProjectItem } from '@/data/site-profile'

interface GitHubRepo {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  topics?: string[]
}

export async function fetchGitHubProjects(username: string): Promise<ProjectItem[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=12&type=owner`,
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    if (!res.ok) return null

    const repos: GitHubRepo[] = await res.json()
    return repos
      .filter((r) => !r.name.endsWith('.github.io'))
      .map((r) => ({
        name: r.name,
        description: r.description || '暂无描述',
        url: r.html_url,
        language: r.language || '—',
        stars: String(r.stargazers_count),
        topics: r.topics?.slice(0, 4) ?? [],
      }))
  } catch {
    return null
  }
}
