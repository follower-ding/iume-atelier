Write-Host "Starting iume-atelier..." -ForegroundColor Cyan
$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\iume-atelier-backend'; mvn spring-boot:run"
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\iume-atelier-frontend'; npm run dev"

Write-Host "Backend: http://localhost:8080/api" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Admin: admin / admin123" -ForegroundColor Yellow
