@echo off
echo ====================================
echo Frontend Starter
echo ====================================
echo.

cd /d "C:\Users\BOBORAHIM MASHRAB\Downloads\bm crmm\bm crmm\client"

echo [1/2] Lokal server sozlamalari...
echo API URL: http://192.168.100.167:5000
timeout /t 2 /nobreak >nul

echo [2/2] Frontend ishga tushirilmoqda...
echo.
echo Brauzerda ochiladi: http://localhost:5173
echo.
echo To'xtatish uchun Ctrl+C bosing
echo.

npm run dev
