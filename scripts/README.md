# Scripts operativos

## Backup automatico de la base de datos

`backup-db.ps1` ejecuta un `pg_dump` del contenedor `distrito-postgres` y guarda
el archivo `.sql` en `C:\DistritoBackups` con timestamp. Conserva los **30
backups mas recientes** y elimina el resto.

### Probar manualmente

```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup-db.ps1
```

Debe aparecer un archivo en `C:\DistritoBackups\distrito_loft_<fecha>.sql`.

### Programar diario en Windows

1. `Win+R` → `taskschd.msc`
2. **Acciones** → "Crear tarea basica..."
3. Nombre: `Backup Distrito DB`. Siguiente.
4. **Diariamente** → 23:30 (despues del cierre operativo).
5. **Iniciar un programa**:
   - Programa: `powershell`
   - Argumentos: `-ExecutionPolicy Bypass -File "C:\Users\asus\Desktop\Operativo Distrito\scripts\backup-db.ps1"`
6. Finalizar.

Para que corra aunque la sesion este cerrada: en propiedades de la tarea,
"Ejecutar tanto si el usuario inicio sesion como si no".

### Buena practica adicional

Copia periodicamente (manual o sincronizado) la carpeta `C:\DistritoBackups`
a un disco externo o a la nube (Drive, OneDrive). Tener backups SOLO en el
mismo equipo no protege contra robo o falla de disco.

## Restaurar desde un backup

```powershell
powershell -ExecutionPolicy Bypass -File scripts\restaurar-db.ps1 -Archivo C:\DistritoBackups\distrito_loft_20260625_233000.sql
```

Pide confirmacion explicita ya que sobreescribe la base actual.
