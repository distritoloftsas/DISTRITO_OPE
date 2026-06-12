# Distrito Loft · Plataforma Operativa

Plataforma de gestión interna de Distrito Loft (lavandería estilo americano). Maneja pedidos, clientes, empleados, sedes, máquinas, inventario y reportes.

Complementa al sitio informativo público (`distritoloft.com`), que vive en otra carpeta y es estático.

## Estructura del proyecto

```
Operativo Distrito/
├── distrito-backend/      Spring Boot 3.5 + Java 21 + PostgreSQL
├── distrito-frontend/     React + Vite + TypeScript + Tailwind
├── docker-compose.yml     PostgreSQL local para desarrollo
├── .env.example           Plantilla de variables de entorno
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

## Cómo levantar el entorno

**1. Clonar variables de entorno**

```bash
cp .env.example .env
```

**2. Levantar PostgreSQL**

```bash
docker compose up -d
```

Postgres queda disponible en `localhost:5432` (db: `distrito_loft`, user: `distrito`).

**3. Backend**

```bash
cd distrito-backend
./mvnw spring-boot:run
```

API disponible en `http://localhost:8080`.

**4. Frontend**

```bash
cd distrito-frontend
npm run dev
```

App disponible en `http://localhost:5173`. Las llamadas a `/api/...` se redirigen automáticamente al backend.

## Fases de desarrollo

- **Fase 0 — Setup** ✅ (en curso)
- **Fase 1 — MVP Operativo** (3 semanas): empleado puede crear pedido, generar QR, cambiar estados y registrar pago. Cliente puede consultar su pedido por QR.
- **Fase 2 — Cliente completo** (2 semanas): registro, login, historial, notificaciones por WhatsApp.
- **Fase 3 — Administración avanzada** (2 semanas): inventario, máquinas, reportes.
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
