# Instalador de Remotion para Windows.
# Uso (PowerShell, dentro de la carpeta del proyecto):
#   powershell -ExecutionPolicy Bypass -File .\instalar-windows.ps1
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Test-Cmd($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }

function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
              [Environment]::GetEnvironmentVariable("Path", "User")
}

Write-Host "== 1/4 Comprobando Node.js ==" -ForegroundColor Cyan
$needNode = $true
if (Test-Cmd node) {
  $major = [int]((node -v).TrimStart("v").Split(".")[0])
  if ($major -ge 18) { $needNode = $false; Write-Host "Node.js $(node -v) ya instalado." }
}
if ($needNode) {
  if (-not (Test-Cmd winget)) {
    Write-Host "No se encontro winget. Instala Node.js LTS desde https://nodejs.org y vuelve a ejecutar este script." -ForegroundColor Red
    exit 1
  }
  Write-Host "Instalando Node.js LTS con winget..."
  winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
  Refresh-Path
}

Write-Host "== 2/4 Comprobando Git (opcional) ==" -ForegroundColor Cyan
if (-not (Test-Cmd git) -and (Test-Cmd winget)) {
  winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
  Refresh-Path
}

Write-Host "== 3/4 Instalando dependencias del proyecto ==" -ForegroundColor Cyan
npm install --loglevel=error

Write-Host "== 4/4 Descargando el navegador que usa Remotion para renderizar ==" -ForegroundColor Cyan
npx remotion browser ensure

Write-Host ""
Write-Host "Listo. Prueba con:" -ForegroundColor Green
Write-Host "  npm run dev      (abre el editor Remotion Studio)"
Write-Host "  npm run render   (crea out\video.mp4)"
Write-Host "  npm run lote     (renderiza todos los videos de videos.json)"
