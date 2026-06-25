# Restaurar la DB desde un .sql producido por backup-db.ps1.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts\restaurar-db.ps1 -Archivo C:\DistritoBackups\distrito_loft_20260625_233000.sql
#
# IMPORTANTE: --clean en pg_dump implica que esto reemplaza los datos
# actuales. Confirma antes de correrlo en produccion.

param(
    [Parameter(Mandatory=$true)]
    [string]$Archivo
)

if (-not (Test-Path $Archivo)) {
    Write-Error "No existe el archivo: $Archivo"
    exit 1
}

$contenedor = "distrito-postgres"
$usuario = "distrito"
$db = "distrito_loft"

Write-Host "Vas a restaurar la base de datos '$db' desde:"
Write-Host "  $Archivo"
$confirma = Read-Host "Esto SOBREESCRIBE los datos actuales. Escribe 'restaurar' para continuar"
if ($confirma -ne "restaurar") {
    Write-Host "Cancelado."
    exit 0
}

Get-Content $Archivo | docker exec -i $contenedor psql -U $usuario -d $db

if ($LASTEXITCODE -ne 0) {
    Write-Error "Restauracion fallo."
    exit 1
}

Write-Host "[OK] Restaurado."
