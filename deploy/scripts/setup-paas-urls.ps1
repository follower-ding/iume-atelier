#Requires -Version 5.1
<#
.SYNOPSIS
  Replace backend URL placeholders in Vercel/Netlify configs.
.EXAMPLE
  .\deploy\scripts\setup-paas-urls.ps1 -BackendUrl "iume-atelier-backend-production-xxxx.up.railway.app"
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$BackendUrl
)

$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$backendHost = $BackendUrl -replace '^https?://', '' -replace '/.*$', ''

$vercel = Join-Path $root "iume-atelier-frontend\vercel.json"
$netlify = Join-Path $root "netlify.toml"

if (Test-Path $vercel) {
    (Get-Content $vercel -Raw) -replace 'REPLACE_WITH_RAILWAY_BACKEND_URL', $backendHost | Set-Content $vercel -NoNewline
    Write-Host "Updated: $vercel" -ForegroundColor Green
}

if (Test-Path $netlify) {
    (Get-Content $netlify -Raw) -replace 'REPLACE_WITH_RAILWAY_BACKEND_URL', $backendHost | Set-Content $netlify -NoNewline
    Write-Host "Updated: $netlify" -ForegroundColor Green
}

Write-Host "`nNext: commit, push, then deploy on Vercel/Netlify/EdgeOne." -ForegroundColor Cyan
Write-Host "Set Railway IUME_CORS_ORIGINS to your frontend URL after deploy." -ForegroundColor Yellow
