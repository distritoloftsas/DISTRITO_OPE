# Backup automatico de la DB Distrito Loft.
# Corre pg_dump dentro del contenedor docker y guarda el archivo
# con timestamp en C:\DistritoBackups (configurable). Rota los
# 30 mas recientes; los demas se eliminan.
#
# Uso manual:
#   powershell -ExecutionPolicy Bypass -File scripts\backup-db.ps1
#
# Programar (Windows Task Scheduler):
#   1. Abre "Programador de tareas"
#   2. Crear tarea basica > "Backup Distrito DB"
#   3. Diariamente, a las 23:30 (despues del cierre)
#   4. Accion: Iniciar un programa
#      - Programa: powershell
#      - Argumentos: -ExecutionPolicy Bypass -File "C:\Users\asus\Desktop\Operativo Distrito\scripts\backup-db.ps1"

$contenedor = "distrito-postgres"
$usuario = "distrito"
$db = "distrito_loft"
$carpetaBackups = "C:\DistritoBackups"
$retener = 30

if (-not (Test-Path $carpetaBackups)) {
    New-Item -ItemType Directory -Force -Path $carpetaBackups | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$archivo = Join-Path $carpetaBackups "distrito_loft_$timestamp.sql"

Write-Host "[$timestamp] Iniciando backup..."

# pg_dump al stdout del contenedor; lo redirigimos al archivo.
docker exec $contenedor pg_dump -U $usuario -d $db --clean --if-exists |
    Out-File -Encoding utf8 -FilePath $archivo

if ($LASTEXITCODE -ne 0 -or -not (Test-Path $archivo) -or (Get-Item $archivo).Length -eq 0) {
    Write-Error "Backup fallo. Revisa que el contenedor '$contenedor' este corriendo."
    if (Test-Path $archivo) { Remove-Item $archivo }
    exit 1
}

$tam = [math]::Round((Get-Item $archivo).Length / 1KB, 1)
Write-Host "Backup creado: $archivo ($tam KB)"

# Rotacion: borrar los mas viejos despues de los $retener mas recientes.
$todos = Get-ChildItem $carpetaBackups -Filter "distrito_loft_*.sql" |
    Sort-Object LastWriteTime -Descending
if ($todos.Count -gt $retener) {
    $aBorrar = $todos | Select-Object -Skip $retener
    foreach ($f in $aBorrar) {
        Remove-Item $f.FullName -Force
        Write-Host "Rotado (borrado): $($f.Name)"
    }
}

Write-Host "[OK] $($todos.Count - [math]::Max(0, $todos.Count - $retener)) backups conservados en $carpetaBackups"
