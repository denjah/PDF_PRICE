@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules\vite\bin\vite.js" (
  echo Dependencies are missing. Installing them now...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Installation failed. Check Node.js and npm, then try again.
    pause
    exit /b 1
  )
)

start "RASSON Presentation — Vite" /D "%~dp0" cmd /k npm.cmd run dev -- --host 127.0.0.1 --port 4173 --strictPort
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4173/"

endlocal
