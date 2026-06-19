# BM CRM Server - Avtomatik Ishga Tushirish
# PowerShell script

$serverPath = "f:\oqava suv\server"

Write-Host "🚀 BM CRM Server ishga tushirilmoqda..." -ForegroundColor Green

# Server papkasiga o'tish
Set-Location $serverPath

# Node.js va npm mavjudligini tekshirish
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js topilmadi! https://nodejs.org dan o'rnating" -ForegroundColor Red
    Read-Host "Davom etish uchun Enter bosing"
    exit
}

# .env fayl mavjudligini tekshirish
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env fayl topilmadi!" -ForegroundColor Yellow
    Write-Host "📝 .env.example dan .env yaratilmoqda..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env yaratildi. NODE_ENV=development ga o'zgartirildi" -ForegroundColor Green
    (Get-Content .env) -replace 'NODE_ENV=production', 'NODE_ENV=development' | Set-Content .env
}

# Server ishga tushirish
Write-Host "🚀 Server ishga tushirilmoqda..." -ForegroundColor Cyan
Write-Host "📍 Port 5200 (ISUP) va Port 5000 (API)" -ForegroundColor Cyan
Write-Host "" 
Write-Host "⏹️  To'xtatish uchun: Ctrl + C" -ForegroundColor Yellow
Write-Host ""

npm run dev
