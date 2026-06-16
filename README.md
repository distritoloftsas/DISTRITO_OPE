# Distrito Loft · Plataforma Operativa

Plataforma de gestión interna de Distrito Loft (lavandería estilo americano). Maneja pedidos, clientes, empleados, sedes, máquinas, inventario y reportes.

Complementa al sitio informativo público (`distritoloft.com`), que vive en otra carpeta y es estático.

**Repositorio:** https://github.com/distritoloftsas/DISTRITO_OPE

## Estructura del proyecto

```
Operativo Distrito/
├── distrito-backend/      Spring Boot 3.5 + Java 21 + PostgreSQL
├── distrito-frontend/     React + Vite + TypeScript + Tailwind
├── docker-compose.yml     PostgreSQL local para desarrollo
└── README.md
```

## Stack

- **Backend:** Java 21, Spring Boot 3.5, Spring Security + JWT, Spring Data JPA, PostgreSQL 16, Flyway, Lombok.
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS v4, React Router, TanStack Query, Axios, Zustand, React Hook Form + Zod.
- **DB local:** PostgreSQL en Docker.

## Roles

| Rol             | Alcance                          |
| --------------- | -------------------------------- |
| Cliente         | Sus propios pedidos              |
| Empleado        | Operación de una sede            |
| Gerente de sede | Toda una sede                    |
| Super Admin     | Todas las sedes del país         |

## Requisitos previos

- Java 21+
- Node.js 20+
- Docker Desktop
- Git

## Ambientes

| Ambiente | Backend profile | Frontend mode | Datos | Propósito |
|---|---|---|---|---|
| **dev** (local) | `dev` | `development` | Tus pruebas | Desarrollo diario |
| **qa** | `qa` | `qa` | Datos representativos | Validación previa a prod |
| **prod** | `prod` | `production` | Datos reales | Producción |

### Cómo correr en local (dev)

**1. Levantar PostgreSQL**

```bash
docker compose up -d
```

Postgres queda disponible en `localhost:5433` (db: `distrito_loft`, user: `distrito`).

**2. Backend**

```bash
cd distrito-backend
./mvnw spring-boot:run
```

Usa el perfil `dev` por defecto (definido en `application.yml`).

API disponible en `http://localhost:8080`.

**3. Frontend**

```bash
cd distrito-frontend
npm run dev
```

App en `http://localhost:5173`. Vite usa `.env.development` (`VITE_API_URL=/api`) y hace proxy al backend.

### Cómo correr otro perfil de backend

```bash
# Con env var (Mac/Linux)
SPRING_PROFILES_ACTIVE=qa ./mvnw spring-boot:run

# PowerShell (Windows)
$env:SPRING_PROFILES_ACTIVE="qa"; .\mvnw.cmd spring-boot:run
```

Antes debes exportar las variables que el perfil necesita (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS`).

### Build de frontend por ambiente

```bash
npm run build         # usa .env.production
npm run build:qa      # usa .env.qa
npm run build:prod    # usa .env.production
```

## Variables de entorno por ambiente

### Backend

| Variable | dev (default) | qa / prod |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` | `qa` o `prod` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | localhost:5433/distrito_loft/distrito/distrito_local_dev | Inyectar en `DB_URL`, `DB_USER`, `DB_PASSWORD` |
| `JWT_SECRET` | placeholder en `application-dev.yml` | **obligatorio** (>= 256 bits) |
| `CORS_ORIGINS` | `http://localhost:5173` | URL del frontend desplegado (coma para múltiples) |
| `SUPER_ADMIN_EMAIL` | `distritoloftsas@gmail.com` | igual o el de cada ambiente |

### Frontend

| Variable | dev | qa | prod |
|---|---|---|---|
| `VITE_API_URL` | `/api` (proxy Vite) | URL absoluta del backend QA | URL absoluta del backend PROD |

## Estrategia de ramas

```
main      ──●────●────●──   PROD (release)
              \    \
develop  ───●──●────●──     DEV/QA (integración)
                \
feature/*  ────●─●          tu trabajo diario
```

- `feature/*` → PR a `develop`.
- `develop` → desplegado en QA.
- Cuando QA aprueba, merge `develop` → `main` → deploy a PROD.

## Fases de desarrollo

- **Fase 0 — Setup** ✅
- **Fase 1 — MVP Operativo** ✅ pedidos, estados, pagos, máquinas, cierre de caja.
- **Fase 2 — Cliente completo** ✅ self-service, vista del cliente con progreso.
- **Fase 3 — Administración avanzada** (en curso): reportes adicionales, inventario.
- **Fase 4 — Multi-sede y optimización** (continuo).

El plan completo está en `Desktop/Distrito/Plan_Distrito_Loft_Operativo_v2.docx`.

## Identidad visual

| Color           | Hex      |
| --------------- | -------- |
| Negro suave     | `#2B2926`|
| Dorado          | `#C9A96E`|
| Dorado oscuro   | `#A88046`|
| Crema           | `#F4EFE6`|

Tipografía: **Poppins**.
