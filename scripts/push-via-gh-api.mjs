#!/usr/bin/env node
/**
 * Push a local commit to GitHub when git push HTTPS is blocked.
 * Usage: node scripts/push-via-gh-api.mjs [commitSha] [parentSha] [owner] [repo]
 */
import { execSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const owner = process.argv[4] || 'follower-ding'
const repo = process.argv[5] || 'iume-atelier'
const repoRoot = process.cwd()
let commitSha = process.argv[2] || execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: repoRoot }).trim()
let parentSha = process.argv[3]

const fullSha = (ref) => execSync(`git rev-parse ${ref}`, { encoding: 'utf8', cwd: repoRoot }).trim()
commitSha = fullSha(commitSha)
if (parentSha) parentSha = fullSha(parentSha)

const gh = (method, endpoint, body) => {
  const tmp = join(tmpdir(), `gh-api-${Date.now()}.json`)
  if (body) writeFileSync(tmp, JSON.stringify(body), 'utf8')
  try {
    const cmd = body
      ? `gh api --method ${method} ${endpoint} --input "${tmp}"`
      : `gh api --method ${method} ${endpoint}`
    return JSON.parse(execSync(cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }))
  } finally {
    if (body) try { unlinkSync(tmp) } catch { /* ignore */ }
  }
}

if (!parentSha) {
  parentSha = gh('GET', `repos/${owner}/${repo}/git/ref/heads/main`).object.sha
  console.log('Remote main:', parentSha)
}

function listChanges() {
  try {
    const out = execSync(`git diff --name-status ${parentSha} ${commitSha}`, {
      encoding: 'utf8',
      cwd: repoRoot,
    }).trim()
    if (!out) return []
    return out.split('\n').map((line) => {
      const [status, ...rest] = line.split('\t')
      let path = rest.join('\t').replace(/\\/g, '/').trim()
      if (path.startsWith('"') && path.endsWith('"')) path = path.slice(1, -1)
      return { status: status.trim(), path }
    })
  } catch {
    const out = execSync(`git diff-tree --no-commit-id --name-status -r ${commitSha}`, {
      encoding: 'utf8',
      cwd: repoRoot,
    }).trim()
    if (!out) return []
    return out.split('\n').map((line) => {
      const [status, ...rest] = line.split('\t')
      let path = rest.join('\t').replace(/\\/g, '/').trim()
      if (path.startsWith('"') && path.endsWith('"')) path = path.slice(1, -1)
      return { status: status.trim(), path }
    })
  }
}

const changes = listChanges()

console.log(`Uploading ${changes.length} changes from ${commitSha}...`)

const tree = changes.map(({ status, path }) => {
  if (status.startsWith('D')) {
    return { path, mode: '100644', sha: null }
  }
  const content = execSync(`git -c core.quotepath=false show ${commitSha}:"${path.replace(/"/g, '\\"')}"`, {
    encoding: 'utf8',
    cwd: repoRoot,
    maxBuffer: 64 * 1024 * 1024,
  })
  return { path, mode: '100644', type: 'blob', content }
})

const parentCommit = gh('GET', `repos/${owner}/${repo}/git/commits/${parentSha}`)
const newTree = gh('POST', `repos/${owner}/${repo}/git/trees`, {
  base_tree: parentCommit.tree.sha,
  tree,
})

let msg
try {
  msg = execSync(`git log --format=%B ${parentSha}..${commitSha}`, { encoding: 'utf8', cwd: repoRoot }).trim()
} catch {
  msg = execSync(`git log -1 --format=%B ${commitSha}`, { encoding: 'utf8', cwd: repoRoot }).trim()
}
const newCommit = gh('POST', `repos/${owner}/${repo}/git/commits`, {
  message: msg,
  tree: newTree.sha,
  parents: [parentSha],
})

gh('PATCH', `repos/${owner}/${repo}/git/refs/heads/main`, {
  sha: newCommit.sha,
  force: false,
})

console.log('✅ Pushed:', newCommit.sha)
console.log(`https://github.com/${owner}/${repo}/commit/${newCommit.sha}`)
