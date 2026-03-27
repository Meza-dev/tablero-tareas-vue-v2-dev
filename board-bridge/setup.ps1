# Script de configuración para Windows - Board System
# Ejecuta este script como Administrador para configurar todo

$FilesDir = Get-Location
$ModulesPath = Join-Path $FilesDir "node_modules"

if (-not (Test-Path $ModulesPath)) {
    Write-Host "📦 Instalando dependencias del servidor..." -ForegroundColor Cyan
    npm install
}

# 1. Configurar alias global para 'board'
$ProfilePath = $PROFILE
if (-not (Test-Path $ProfilePath)) {
    New-Item -Path $ProfilePath -ItemType File -Force
}

$AliasCode = @"
# Board System Alias
function board-command {
    node "$FilesDir\board-cli.js" @args
}
Set-Alias board board-command
"@

if (-not (Get-Content $ProfilePath | Select-String "board-command")) {
    Add-Content $ProfilePath "`n$AliasCode"
    Write-Host "✅ Comando 'board' configurado en tu perfil de PowerShell." -ForegroundColor Green
    Write-Host "⚠️ Reinicia PowerShell para usar el comando." -ForegroundColor Yellow
} else {
    Write-Host "✅ El comando 'board' ya está configurado." -ForegroundColor Green
}

# 2. Configurar el servidor como un comando rápido
Write-Host "`n🚀 Para iniciar el puente con la App de Vue, ejecuta:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host "   (desde esta carpeta: $FilesDir)`n"

Write-Host "📊 El sistema JSON ahora es compatible con la IA y con tu interfaz web." -ForegroundColor Green
