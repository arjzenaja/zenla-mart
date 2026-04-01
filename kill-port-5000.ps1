# Script untuk stop process yang menggunakan port 5000
Write-Host "Mencari process yang menggunakan port 5000..." -ForegroundColor Yellow

$connection = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($connection) {
    $processId = $connection.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "`nProcess ditemukan:" -ForegroundColor Cyan
        Write-Host "  ID: $($process.Id)" -ForegroundColor White
        Write-Host "  Name: $($process.ProcessName)" -ForegroundColor White
        Write-Host "  Path: $($process.Path)" -ForegroundColor White
        
        Write-Host "`nMenghentikan process..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Write-Host "✅ Process berhasil dihentikan!" -ForegroundColor Green
        
        # Tunggu sebentar
        Start-Sleep -Seconds 2
        
        # Verifikasi port sudah bebas
        $check = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
        if (-not $check) {
            Write-Host "✅ Port 5000 sekarang bebas!" -ForegroundColor Green
            Write-Host "`nSekarang Anda bisa menjalankan: npm start" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️  Port 5000 masih digunakan" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Process tidak ditemukan" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Port 5000 sudah bebas!" -ForegroundColor Green
    Write-Host "Anda bisa langsung menjalankan: npm start" -ForegroundColor Cyan
}

Write-Host ""
