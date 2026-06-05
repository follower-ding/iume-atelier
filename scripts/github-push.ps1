# 初始�?Git 并推送到 GitHub（触�?CD�?
# 用法:
#   copy deploy\repo.env.example deploy\repo.env   # �?GITHUB_REPO_URL
#   .\scripts\github-push.ps1
# �?
#   .\scripts\github-push.ps1 -RepoUrl https://github.com/user/iume-atelier.git

param(
  [string]$RepoUrl = "",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$RepoEnv = Join-Path $Root "deploy\repo.env"

if (-not $RepoUrl -and (Test-Path $RepoEnv)) {
  Get-Content $RepoEnv | ForEach-Object {
    if ($_ -match '^\s*GITHUB_REPO_URL\s*=\s*(.+)\s*$') {
      $RepoUrl = $Matches[1].Trim().Trim('"').Trim("'")
    }
    if ($_ -match '^\s*GITHUB_BRANCH\s*=\s*(.+)\s*$') {
      $Branch = $Matches[1].Trim().Trim('"').Trim("'")
    }
  }
}

if (-not $RepoUrl -or $RepoUrl -match 'YOUR_USERNAME') {
  Write-Host @"
[错误] 请设�?GitHub 仓库地址�?

  方式 1 �?编辑 deploy\repo.env（从 repo.env.example 复制�?
    GITHUB_REPO_URL=https://github.com/<你的用户�?/iume-atelier.git

  方式 2 �?参数:
    .\scripts\github-push.ps1 -RepoUrl https://github.com/<用户>/<仓库>.git

先在 GitHub 网页创建空仓库（不要勾�?README），再执行本脚本�?
"@ -ForegroundColor Red
  exit 1
}

Push-Location $Root
try {
  $gitName = git config user.name 2>$null
  $gitEmail = git config user.email 2>$null
  if (-not $gitName -or -not $gitEmail) {
    Write-Host @"
[错误] 请先配置 Git 身份（仅本仓库，勿用 --global 也可�?

  cd $Root
  git config user.name "你的GitHub用户�?
  git config user.email "你的GitHub邮箱"

然后重新运行本脚本�?
"@ -ForegroundColor Red
    exit 1
  }

  if (-not (Test-Path ".git")) {
    Write-Host ">> git init -b $Branch" -ForegroundColor Cyan
    git init -b $Branch
  }

  $remote = git remote get-url origin 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host ">> git remote add origin $RepoUrl" -ForegroundColor Cyan
    git remote add origin $RepoUrl
  } elseif ($remote -ne $RepoUrl) {
    Write-Host ">> git remote set-url origin $RepoUrl" -ForegroundColor Cyan
    git remote set-url origin $RepoUrl
  }

  Write-Host ">> git add -A" -ForegroundColor Cyan
  git add -A

  $status = git status --porcelain
  if ($status) {
    Write-Host ">> git commit" -ForegroundColor Cyan
    git commit -m "chore: iume-atelier v1.0.0-beta �?GitHub CD ready"
  } else {
    Write-Host "[INFO] 无新变更，跳�?commit" -ForegroundColor Yellow
  }

  Write-Host ">> git push -u origin $Branch" -ForegroundColor Cyan
  git push -u origin $Branch

  Write-Host @"

[OK] 已推送到 $RepoUrl ($Branch)
下一�?
  1. 打开 GitHub Actions 查看 CD workflow
  2. 配置 Secrets �?�?deploy/CONFIG.md
  3. Ubuntu 服务器首次部�?�?�?deploy/GITHUB-CD.md
"@ -ForegroundColor Green
} finally {
  Pop-Location
}
