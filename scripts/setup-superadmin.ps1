# Crear el primer SUPER_ADMIN del sistema Distrito Loft.
#
# Llama a POST /api/auth/setup, que solo funciona si la tabla usuario
# esta vacia. Es la unica forma de bootstrap: despues de crear el
# super admin, todo se gestiona desde /admin.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts\setup-superadmin.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\setup-superadmin.ps1 -BaseUrl "https://api.distritoloft.com"
#
# El password se pide enmascarado, nunca queda en historial ni en disco.
# El email del super admin se toma de application.yml (distrito.setup.super-admin-email)
# y NO se puede cambiar desde aqui.

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$Nombre = "Angela Aroca",
    [string]$Telefono = ""
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Setup Super Admin Distrito Loft ===" -ForegroundColor Cyan
Write-Host "Backend: $BaseUrl"
Write-Host ""

# Verificar que el backend responde
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/actuator/health" -Method Get -TimeoutSec 5
    if ($health.status -ne "UP") {
        Write-Host "Backend respondio pero no esta UP: $($health.status)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "No se puede contactar el backend en $BaseUrl" -ForegroundColor Red
    Write-Host "Detalle: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Asegurate de que el backend este corriendo:"
    Write-Host "  cd distrito-backend; .\mvnw.cmd spring-boot:run"
    exit 1
}

# Pedir password enmascarado
Write-Host "Define el password del super admin."
Write-Host "Debe tener al menos 8 caracteres. Usalo solo tu." -ForegroundColor Yellow
$pass1 = Read-Host "Password" -AsSecureString
$pass2 = Read-Host "Repite el password" -AsSecureString

# NetworkCredential extrae el texto plano del SecureString de forma confiable
# en Windows PowerShell 5.1 y en PowerShell 7+. Es el patron documentado por
# Microsoft. Otros approaches (PtrToStringAuto) fallan en algunas configs.
$plain1 = [System.Net.NetworkCredential]::new("", $pass1).Password
$plain2 = [System.Net.NetworkCredential]::new("", $pass2).Password

if ($plain1 -ne $plain2) {
    Write-Host "Los passwords no coinciden." -ForegroundColor Red
    exit 1
}
if ($plain1.Length -lt 8) {
    Write-Host "El password debe tener al menos 8 caracteres. (Detectados: $($plain1.Length))" -ForegroundColor Red
    exit 1
}

# Construir y enviar el request
$body = @{
    password = $plain1
    nombre = $Nombre
}
if ($Telefono) {
    $body.telefono = $Telefono
}
$json = $body | ConvertTo-Json

Write-Host ""
Write-Host "Enviando setup..."
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/auth/setup" `
        -Method Post `
        -ContentType "application/json" `
        -Body $json
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host ""
    Write-Host "Setup fallo (HTTP $statusCode)." -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalle: $($_.ErrorDetails.Message)"
    }
    if ($statusCode -eq 422) {
        Write-Host ""
        Write-Host "Causa probable: el setup ya fue ejecutado." -ForegroundColor Yellow
        Write-Host "Si necesitas reiniciar desde cero:"
        Write-Host "  docker compose down -v   (CUIDADO: borra todos los datos)"
        Write-Host "  docker compose up -d"
        Write-Host "  .\mvnw.cmd spring-boot:run"
    }
    exit 1
} finally {
    # Limpiar passwords de memoria
    $plain1 = $null
    $plain2 = $null
    [GC]::Collect()
}

Write-Host ""
Write-Host "Super admin creado." -ForegroundColor Green
Write-Host "  Email: $($response.usuario.email)"
Write-Host "  Nombre: $($response.usuario.nombre)"
Write-Host "  Rol: $($response.usuario.rol)"
Write-Host "  ID: $($response.usuario.id)"
Write-Host ""
Write-Host "Ya puedes ingresar en la web con ese email y el password que pusiste." -ForegroundColor Cyan
