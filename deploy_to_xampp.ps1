# Script de Sincronización a XAMPP
# Destino: C:\xampp\htdocs\controlrapaprendiz

$source = Join-Path $PSScriptRoot "php\*"
$destination = "C:\xampp\htdocs\controlrapaprendiz\"

if (!(Test-Path "C:\xampp\htdocs")) {
    Write-Error "No se encontró el directorio de XAMPP en C:\xampp\htdocs"
    exit 1
}

if (!(Test-Path $destination)) {
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
}

Write-Host "Sincronizando proyecto a XAMPP..." -ForegroundColor Cyan
Copy-Item -Path $source -Destination $destination -Recurse -Force
Write-Host "Despliegue completado con éxito en: $destination" -ForegroundColor Green
Write-Host "Acceso local: http://localhost/controlrapaprendiz/" -ForegroundColor Yellow
