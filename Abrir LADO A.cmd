@echo off
set "APP_DIR=%~dp0"
set "APP_URL=http://127.0.0.1:5173/"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; try { $r=Invoke-WebRequest -UseBasicParsing -Uri '%APP_URL%' -TimeoutSec 1; $ok=$r.StatusCode -eq 200 } catch {}; if (-not $ok) { Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ""%APP_DIR%servidor-lado-a.ps1""' }; Start-Sleep -Milliseconds 700; Start-Process '%APP_URL%'"
