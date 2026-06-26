# Guía de despliegue a producción

Stack: **Neon** (DB) + **Railway** (backend) + **Vercel** (frontend) + **GoDaddy** (DNS).

Sigue los pasos en orden. Cada bloque deja activo lo que el siguiente necesita.

---

## 0. Antes de empezar

- Repo en `main` actualizado. Si vienes de `develop`, mergea primero.
- Tener a mano:
  - Cuenta GitHub donde está el repo
  - Acceso al panel de GoDaddy para distritoloft.com
- Generar un JWT secret nuevo (NO reutilizar el de dev). En PowerShell:
  ```powershell
  $b = New-Object byte[] 64
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
  [Convert]::ToBase64String($b)
  ```
  Guardalo en un gestor de contraseñas. Lo vas a pegar en Railway.

---

## 1. Neon (base de datos)

1. Ir a https://neon.tech → "Sign up with GitHub".
2. Click **New Project**:
   - Name: `distrito-loft-prod`
   - Postgres version: 16
   - Region: `AWS US East (Ohio)` (más cerca de Colombia que Europa, y Railway tiene region cercana)
3. En **Connection Details** copia el connection string:
   ```
   postgresql://<user>:<password>@ep-xxxx.aws.neon.tech/neondb?sslmode=require
   ```
4. **Convertir a JDBC URL** para Spring (cambia el prefijo y agrega `?sslmode=require`):
   ```
   jdbc:postgresql://ep-xxxx.aws.neon.tech/neondb?sslmode=require
   ```
   Usuario y password van por separado en Railway, no en la URL.

Guarda los tres valores: `DB_URL`, `DB_USER`, `DB_PASSWORD`.

---

## 2. Railway (backend)

1. Ir a https://railway.com → "Login with GitHub".
2. **New Project** → "Deploy from GitHub repo" → elegir `distritoloftsas/DISTRITO_OPE` branch `main`.
3. Railway detecta automaticamente Java por `system.properties` y `pom.xml`. El build usa el `railway.json` que ya está en el repo.
4. En el panel del servicio → **Variables** → agregar todas estas:

   | Variable | Valor |
   |---|---|
   | `SPRING_PROFILES_ACTIVE` | `prod` |
   | `DB_URL` | (el JDBC URL de Neon) |
   | `DB_USER` | (usuario de Neon) |
   | `DB_PASSWORD` | (password de Neon) |
   | `JWT_SECRET` | (el que generaste en el paso 0) |
   | `CORS_ORIGINS` | `https://app.distritoloft.com` |
   | `PORT` | `8080` |

5. **Settings** → **Networking** → "Generate Domain". Te da algo como `distrito-ope-production.up.railway.app`. Prueba que responde:
   ```bash
   curl https://distrito-ope-production.up.railway.app/actuator/health
   ```
   Esperado: `{"status":"UP"}`. Si dice "still booting" espera 1-2 min.

6. **Settings** → **Networking** → **Custom Domain** → escribir `api.distritoloft.com`. Railway te da un CNAME tipo `xxx.up.railway.app`. **Copia ese CNAME**, lo necesitas para GoDaddy.

---

## 3. Vercel (frontend)

1. Ir a https://vercel.com → "Sign up with GitHub".
2. **Add New Project** → importar `distritoloftsas/DISTRITO_OPE`.
3. **Configure**:
   - **Root Directory**: `distrito-frontend`
   - Framework Preset: Vite (debería autodetectar)
   - Build Command: déjalo en blanco (lee del `vercel.json`)
4. **Environment Variables**: déjalas vacías. El `.env.production` del repo ya tiene `VITE_API_URL=https://api.distritoloft.com/api`.
5. **Deploy**. Espera ~2 min.
6. Vercel te da una URL `*.vercel.app`. Pruebala — abre el login.
7. **Settings** → **Domains** → "Add" → `app.distritoloft.com`. Vercel te indica el CNAME (algo como `cname.vercel-dns.com`).

---

## 4. GoDaddy (DNS)

En el panel de distritoloft.com → **DNS** → **Records**:

| Tipo | Host | Apunta a | TTL |
|---|---|---|---|
| `CNAME` | `app` | (el CNAME de Vercel, ej. `cname.vercel-dns.com`) | 600 |
| `CNAME` | `api` | (el CNAME de Railway, ej. `xxx.up.railway.app`) | 600 |

Esperar 5-30 min a que propague. Verificar con:
```bash
nslookup app.distritoloft.com
nslookup api.distritoloft.com
```

Cuando los dos resuelvan, Vercel y Railway emiten los certificados HTTPS automáticamente (puede tardar otros 5 min más).

---

## 5. Setup del super admin en prod

```powershell
cd "C:\Users\asus\Desktop\Operativo Distrito"
powershell -ExecutionPolicy Bypass -File scripts\setup-superadmin.ps1 -BaseUrl "https://api.distritoloft.com"
```

Te pide un password (escribelo a ciegas, no se muestra). Cuando termine:
- Email: `distritoloftsas@gmail.com`
- Password: el que pusiste
- URL: `https://app.distritoloft.com/login`

---

## 6. Smoke en prod

1. https://app.distritoloft.com/login → entrar con el super admin
2. Crear sede de prueba (si no existe Bambú por seed) en Sedes → + Nueva sede
3. Equipo → + Nuevo empleado → asignar a una sede
4. Cerrar sesión → logear con ese empleado → forzar cambio de password
5. Probar crear un pedido en /gerente

Si todo eso funciona, el deploy está listo.

---

## 7. Antes de dar acceso a clientes reales

- [ ] Reemplazar `{{NIT}}` en `distrito-frontend/src/pages/PoliticaTratamientoDatosPage.tsx`
- [ ] Reemplazar `{{NIT}}` y datos en políticas
- [ ] Implementar rate limit en `/auth/login` y `/auth/registro-cliente` (siguiente sprint)
- [ ] Configurar backup automático en Neon (panel → Backups → enable PITR si quieres > 7 días)
- [ ] Tag `v2.0.0` en main del repo

---

## Costos esperados

- Neon Free: 0.5 GB, autosuspend → $0 mientras estés bajo el límite (~10k pedidos sin sobrepasarlo)
- Railway Hobby: ~$5/mes flat
- Vercel Hobby: $0
- GoDaddy: ya pagado

Total mes 1: **~$5 USD**.

Cuando crezca el negocio, lo más probable es que Neon se quede corto antes que Railway. Plan Neon Pro: $19/mes para 10 GB.

---

## Si algo falla

| Síntoma | Causa típica | Fix |
|---|---|---|
| Railway no arranca, dice `JWT_SECRET` faltante | Olvidaste setear la env var | Variables → agregar y redeploy |
| Frontend abre pero login da CORS error | `CORS_ORIGINS` no coincide con la URL del frontend | Railway → Variables → corregir y redeploy |
| Frontend abre pero /api/* responde 404 | `VITE_API_URL` apunta mal | Verificar `.env.production` y rebuild en Vercel |
| Postgres rechaza conexión | DB_URL mal formada o falta `?sslmode=require` | Neon exige SSL siempre |
| Flyway falla con "schema doesn't exist" | Neon a veces crea schema `public` con permisos raros | Ir a Neon SQL editor: `GRANT ALL ON SCHEMA public TO <user>;` |
