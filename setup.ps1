# 🛠️ SETUP SCRIPT - Tablero Tareas (Zero-Config)

Write-Host "🚀 Iniciando configuración de entorno..." -ForegroundColor Cyan

# 1. Instalar dependencias
Write-Host "📦 Instalando dependencias de Vue y del Motor SQLite..." -ForegroundColor Yellow
npm run install:all

# 2. Configurar Alias temporal / sugerido
$CurrentDir = Get-Location
$CliPath = Join-Path $CurrentDir "board-bridge\board-cli.js"

Write-Host "`n✅ Instalación completa." -ForegroundColor Green
Write-Host "`nPara usar el comando 'board' desde esta carpeta, ejecuta:" -ForegroundColor White
Write-Host "Set-Alias board 'node $CliPath'" -ForegroundColor Yellow

Write-Host "`nPara arrancar el sistema completo (Web + Server):" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor Cyan

# Autopolar DB si no existe (opcional, el CLI lo hace en init)
if (-not (Test-Path "board-bridge\board-db.sqlite")) {
    Write-Host "`n📁 Inicializando base de datos vacía..." -ForegroundColor Gray
    node board-bridge\board-cli.js init
}

Write-Host "`n🎉 ¡Listo para trabajar!" -ForegroundColor Green
