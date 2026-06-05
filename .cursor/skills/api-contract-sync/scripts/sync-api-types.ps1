# 从 Spring Boot OpenAPI 同步前端 TypeScript 类型
# 用法: .\scripts\sync-api-types.ps1 [-ApiUrl http://127.0.0.1:8080/api/v3/api-docs]

param(
  [string]$ApiUrl = "http://127.0.0.1:8080/api/v3/api-docs",
  [string]$OutFile = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not $OutFile) {
  $frontend = Get-ChildItem $Root -Directory -Filter "*-frontend" | Select-Object -First 1
  if (-not $frontend) { Write-Host "[错误] 未找到 *-frontend 目录"; exit 1 }
  $OutFile = Join-Path $frontend.FullName "src\types\api-generated.ts"
}

Write-Host ">> 拉取 OpenAPI: $ApiUrl" -ForegroundColor Cyan
$json = (Invoke-WebRequest -Uri $ApiUrl -UseBasicParsing).Content
$tmpJson = Join-Path $env:TEMP "openapi.json"
Set-Content $tmpJson $json -Encoding UTF8

$outDir = Split-Path $OutFile -Parent
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# 优先 openapi-typescript
$hasOapi = $false
try { npx --yes openapi-typescript --version 2>$null | Out-Null; $hasOapi = $true } catch {}

if ($hasOapi) {
  npx --yes openapi-typescript $tmpJson -o $OutFile
  Write-Host "[OK] 已生成 $OutFile (openapi-typescript)" -ForegroundColor Green
} else {
  @"
// AUTO-GENERATED SKELETON — 安装 openapi-typescript 后可完整生成
// npm i -D openapi-typescript && npx openapi-typescript http://127.0.0.1:8080/api/v3/api-docs -o src/types/api-generated.ts

export interface ApiResult<T> {
  code: number
  message: string
  data: T
  timestamp: number
}

// OpenAPI 已下载到: $tmpJson
// 请运行: npx openapi-typescript `"$tmpJson`" -o src/types/api-generated.ts
"@ | Set-Content $OutFile -Encoding UTF8
  Write-Host "[WARN] 已写骨架。建议: npm i -D openapi-typescript" -ForegroundColor Yellow
}
