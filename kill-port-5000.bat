@echo off
echo Mencari process yang menggunakan port 5000...
echo.

REM PowerShell command untuk stop process di port 5000
powershell -Command "$conn = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue; if ($conn) { $targetPid = $conn.OwningProcess; $proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue; if ($proc) { Write-Host 'Process ditemukan:' -ForegroundColor Cyan; Write-Host \"  ID: $($proc.Id)\" -ForegroundColor White; Write-Host \"  Name: $($proc.ProcessName)\" -ForegroundColor White; Write-Host 'Menghentikan process...' -ForegroundColor Yellow; Stop-Process -Id $targetPid -Force; Write-Host 'Process berhasil dihentikan!' -ForegroundColor Green; Start-Sleep -Seconds 2; } else { Write-Host 'Process tidak ditemukan' -ForegroundColor Red; } } else { Write-Host 'Port 5000 sudah bebas!' -ForegroundColor Green; }"

echo.
echo Selesai! Sekarang jalankan: npm start
pause
