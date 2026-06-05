# 提交前密钥扫描
# 用法: .\scripts\check-secrets.ps1

$ErrorActionPreference = "Continue"
$Root = if ($PSScriptRoot) { Split-Path (Split-Path $PSScriptRoot -Parent) -Parent } else { Get-Location }
Set-Location $Root

$blockedFiles = @(
  "deploy\.env", "deploy\repo.env", "deploy\github.token",
  "deploy\deploy_key", ".env"
)
$secretPatterns = @(
  'ghp_[A-Za-z0-9]{20,}',
  'gho_[A-Za-z0-9]{20,}',
  'AKIA[0-9A-Z]{16}',
  'sk-[A-Za-z0-9]{20,}',
  'JWT_SECRET=[^\s]{16,}',
  'password\s*=\s*[^\s#]{8,}'
)

$issues = @()

foreach ($f in $blockedFiles) {
  if (Test-Path $f) {
    $staged = git diff --cached --name-only 2>$null
    if ($staged -contains $f -or $staged -contains $f.Replace('\','/')) {
      $issues += "已暂存敏感文件: $f"
    }
  }
}

$diff = git diff --cached 2>$null
if (-not $diff) { $diff = "" }
foreach ($pat in $secretPatterns) {
  if ($diff -match $pat) {
    $issues += "暂存区疑似密钥匹配: $pat"
  }
}

if ($issues.Count -gt 0) {
  Write-Host "[FAIL] 发现 $($issues.Count) 个风险:" -ForegroundColor Red
  $issues | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
  Write-Host "请从暂存区移除敏感文件后再 push。" -ForegroundColor Yellow
  exit 1
}

Write-Host "[OK] 密钥检查通过" -ForegroundColor Green
exit 0
