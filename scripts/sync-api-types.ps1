$ErrorActionPreference = "Stop"
$apiUrl = if ($env:OPENAPI_URL) { $env:OPENAPI_URL } else { "http://127.0.0.1:8080/api/v3/api-docs" }
$outFile = "iume-atelier-frontend/src/types/api-generated.ts"

Write-Host "Fetching OpenAPI from $apiUrl ..."
try {
    Invoke-WebRequest -Uri $apiUrl -OutFile "$env:TEMP\openapi.json" -UseBasicParsing
} catch {
    Write-Host "Backend not running. Start backend first: cd iume-atelier-backend; mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

$hasOpenApiTs = $null -ne (Get-Command npx -ErrorAction SilentlyContinue)
if ($hasOpenApiTs) {
    npx --yes openapi-typescript "$env:TEMP\openapi.json" -o $outFile
    Write-Host "Generated $outFile"
} else {
    @"
// Auto-generated skeleton — run with backend up: .\scripts\sync-api-types.ps1
// Install: npm i -D openapi-typescript
export type ApiGenerated = Record<string, unknown>
"@ | Set-Content $outFile -Encoding UTF8
    Write-Host "Wrote skeleton. Install openapi-typescript for full generation."
}
