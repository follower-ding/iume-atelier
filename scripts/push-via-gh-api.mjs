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

const files = execSync(`git diff --name-only ${parentSha} ${commitSha}`, {
  encoding: 'utf8',
  cwd: repoRoot,
}).trim().split('\n').filter(Boolean)

console.log(`Uploading ${files.length} files from ${commitSha}...`)

const tree = files.map((path) => {
  const content = execSync(`git show ${commitSha}:${path}`, {
    encoding: 'utf8',
    cwd: repoRoot,
    maxBuffer: 64 * 1024 * 1024,
  })
  return { path: path.replace(/\\/g, '/'), mode: '100644', type: 'blob', content }
})

const parentCommit = gh('GET', `repos/${owner}/${repo}/git/commits/${parentSha}`)
const newTree = gh('POST', `repos/${owner}/${repo}/git/trees`, {
  base_tree: parentCommit.tree.sha,
  tree,
})

const msg = execSync(`git log --format=%B ${parentSha}..${commitSha}`, { encoding: 'utf8', cwd: repoRoot }).trim()
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
