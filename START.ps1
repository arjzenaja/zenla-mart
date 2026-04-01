Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Zenla Mart Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from env-example.txt..." -ForegroundColor Yellow
    Copy-Item env-example.txt .env
    Write-Host ""
}

Write-Host "Starting server..." -ForegroundColor Green
Write-Host ""
npm start
