$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

if (-not (Test-Path ".git")) {
    git init -b main
}

$repoEnv = "deploy/repo.env"
if (Test-Path $repoEnv) {
    Get-Content $repoEnv | ForEach-Object {
        if ($_ -match '^GITHUB_REPO_URL=(.+)$') {
            $repoUrl = $matches[1].Trim()
        }
    }
}

if (-not $repoUrl) {
    $repoUrl = "https://github.com/follower-ding/iume-atelier.git"
    Write-Host "Using default repo URL: $repoUrl"
}

& "$root\scripts\check-secrets.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

if (-not (git remote get-url origin 2>$null)) {
    git remote add origin $repoUrl
}

git add -A
$status = git status --porcelain
if ($status) {
    git commit -m "chore: initial commit for iume-atelier"
}

git push -u origin main
Write-Host "Pushed to $repoUrl"
