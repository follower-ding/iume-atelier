$ErrorActionPreference = "Stop"
$patterns = @(
    '\.env$',
    'deploy/\.env$',
    'deploy/repo\.env$',
    'deploy_key',
    '\.pem$',
    'ghp_',
    'gho_',
    'AKIA',
    'sk-[a-zA-Z0-9]{20,}'
)

$staged = git diff --cached --name-only 2>$null
if (-not $staged) {
    Write-Host "No staged files. Scanning working tree for common secret patterns..."
    $files = git ls-files 2>$null
} else {
    $files = $staged
}

$found = $false
foreach ($file in $files) {
    if (-not (Test-Path $file)) { continue }
    if ($file -match '\.gitignore$|\.env\.example$|check-secrets\.ps1$') { continue }
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            Write-Host "SECRET RISK: $file matches pattern $pattern" -ForegroundColor Red
            $found = $true
        }
    }
}

if ($found) {
    Write-Host "Secrets check FAILED. Do not push." -ForegroundColor Red
    exit 1
}

Write-Host "Secrets check passed."
exit 0
