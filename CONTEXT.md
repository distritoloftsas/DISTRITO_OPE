# Contexto para continuar — Distrito Loft Operativo

Archivo interno con todo lo necesario para retomar el proyecto. Si vas a compactar
la conversación, este es el punto de verdad.

## Qué es

Plataforma operativa interna de **Distrito Loft**, lavandería estilo americano en
Neiva. Complementa al sitio informativo público (`distritoloft.com`, otro repo).
Maneja pedidos, clientes, empleados, sedes, máquinas, inventario y reportes.

**Repo:** https://github.com/distritoloftsas/DISTRITO_OPE
**Working dir:** `C:\Users\asus\Desktop\Operativo Distrito`

## Estructura

```
Operativo Distrito/
├── distrito-backend/      Spring Boot 3.5 + Java 21 + PostgreSQL
├── distrito-frontend/     React 19 + Vite + TypeScript + Tailwind v4
├── docker-compose.yml     Postgres 16 en puerto 5433
├── README.md              Doc del repo (ambientes, setup, etc.)
├── CONTEXT.md             ESTE archivo (interno)
├── requests.http          .http con tokens reales (gitignored)
└── requests.http.example  Plantilla
```

## Stack y decisiones de stack

- **Backend:** Java 21, Spring Boot 3.5, Spring Security + JWT (`jjwt 0.12.6`),
  Spring Data JPA + Hibernate 6.6, PostgreSQL 16, Flyway, Lombok, HikariCP.
  Empaquetado **por feature** (no por capa): `auth/`, `cliente/`, `empleado/`,
  `pedido/`, `maquina/`, `insumo/`, `plan/`, `reportes/`, `sede/`, `usuario/`,
  `config/`, `common/`.
- **Frontend:** React 19, Vite, TS, TailwindCSS v4, React Router v6, TanStack
  Query, Axios, Zustand (con `persist` para sesión), React Hook Form + Zod,
  `qrcode.react`. Empaquetado por feature en `src/features/<dominio>/`.
- **DB local:** Postgres en Docker, puerto **5433** (no 5432 porque hay
  Postgres nativo del usuario en 5432).
- **Identidad visual:** `#2B2926` negro, `#C9A96E` dorado, `#A88046` dorado
  oscuro, `#F4EFE6` cream. Tipografía Poppins.

## Roles del sistema

| Rol | Alcance | Página |
|---|---|---|
| CLIENTE | Sus propios pedidos | `/cliente` |
| EMPLEADO | Operación de una sede | `/empleado` |
| GERENTE_SEDE | Toda una sede (operación + administración) | `/gerente` |
| SUPER_ADMIN | Todas las sedes | `/admin` |

Además hay rutas públicas: `/login`, `/registro` (cliente self-service),
`/cambiar-password` (forzoso en primer login), `/p/:codigo` (seguimiento
público del pedido por QR).

## Sprints completados (resumen)

| Sprint | Entrega |
|---|---|
| 1 | Setup + esqueleto + Docker + git inicial |
| 2 | Schema, JWT, login, registro empleado, ProtectedRoute, placeholders |
| 3 | Estados de pedido + reglas, pago previo al lavado |
| 4 | Máquinas físicas (3 lav + 3 sec por sede), asignación al avanzar |
| 5 | Empleados (alta por gerente/super) + cambio forzoso de password |
| 6 | Toggle ojo en password (CambiarPasswordPage + NuevoEmpleadoModal), mantenimiento de máquinas, header gerente con su sede |
| 7 | Refactor PasswordInput a forwardRef (compat con react-hook-form), aplicado a LoginPage |
| 8 | Historial visible del pedido (timeline) + pestaña "Cerrados" en Kanban |
| 9 | Reporte cierre de caja diario por sede |
| 10 | Vista del cliente: registro self-service, lista de pedidos con progreso visual |
| 11 | Timer del ciclo (countdown) + Kanban operativo en GerentePage |
| 12 | Profiles dev/qa/prod, .env por modo Vite, ramas main/develop |
| 13 | Ticket con QR (URL absoluta `/p/CODIGO`), filtro rango en Cerrados, fix sesión 403 y countdown leak |
| 14 | Página /admin: KPIs multi-sede + alta de sedes (con 3+3 máquinas automáticas) |
| **v1.0.0** | **Release tag en main** |
| 15 | PWA (manifest + iconos DL propios), Esc cierra modales, confirmar cerrar sesión, títulos de página, 404 propia |
| 16+17 | **Inventario por sede + receta de consumo por plan**: descuento automático en LAVANDO/SECANDO con bloqueo si no hay stock |
| 18 | **Trazabilidad**: costo promedio ponderado en ENTRADA, modal historial de movimientos por insumo, reporte de gasto en insumos por rango |
| 19 | **Tiempos reales + tolerancia operativa por sede**: V14 ajusta duraciones de planes; sede.tolerancia_pre/post_lavado_minutos editable; countdown la suma |
| 20 | **Excel XLSX** con Apache POI: endpoints `.xlsx` para cierre, ventas y consumo de insumos; botón "↓ Excel" en cada sección de Reportes |
| 21 | **Perfil del cliente editable**: `GET/PATCH /api/clientes/me`, tab "Mi perfil" en ClientePage |
| 22 | **Panel de clientes en Gerencia y Admin**: lista global con buscador y conteo, edición de datos, **activación de cuenta con contraseña temporal** desde el modal (must_change_password=true) |
| 22b | **AdminPage rehecha** con nav de 3 pestañas (Sedes / Clientes / Reportes) y selector de sede |
| 22c | **Reportes visuales con Recharts**: gráficas de barras, pie y línea de tendencia; bloque de verificación de cuadre en cierre; alertas de pedidos sin pago en ventas |
| 23 | **Tipo de ciclo de lavadora (Sencillo 30 / Intermedio 36 / Deluxe 43)**: V15 + enum + columna en pedido; modal pide ciclo antes de la lavadora; countdown usa la duración del ciclo elegido |
| 23b | **WhatsApp semiautomático**: helper `whatsappAvisar`, botón "WA" en cada card que abre `wa.me/<num>?text=<mensaje pre-armado>` según fase |

## Migraciones Flyway aplicadas

- V1: schema test inicial (deprecado)
- V2: schema core (sede, usuario, cliente_perfil, empleado_perfil, plan, pedido, pedido_estado_historial, pago) + ENUMs
- V3: seed Bambú + 3 planes
- V4: quitar triggers SQL (Hibernate audit)
- V5: nombre a usuario
- V6: cliente rápido (email/password nullable, telefono UNIQUE)
- V7: sequence para `pedido.codigo_qr` ("DL-0001")
- V8: `pedido.pagado`
- V9: tabla `maquina` + FKs lavadora_id/secadora_id en pedido + seed 3+3 Bambú
- V10: `usuario.must_change_password`
- V11: `plan.duracion_lavado_minutos` (35) y `duracion_secado_minutos` (30); `pedido.fecha_inicio_lavado`, `fecha_inicio_secado`
- V12: tabla `insumo` + `movimiento_insumo` + ENUMs `unidad_insumo`, `tipo_movimiento_insumo`
- V13: tabla `plan_consumo` + ENUM `fase_consumo`
- V14: `plan.duracion_lavado/secado` ajustadas + `sede.tolerancia_pre/post_lavado_minutos`
- V15: ENUM `tipo_ciclo_lavadora` + `pedido.tipo_ciclo_lavadora`

## Endpoints clave

### Auth
- `POST /api/auth/setup` — primer SUPER_ADMIN (solo si DB vacía)
- `POST /api/auth/login`
- `POST /api/auth/registro-cliente` (público)
- `GET /api/auth/me`
- `POST /api/auth/cambiar-password`

### Empleados
- `POST /api/empleados` (gerente: solo EMPLEADO en su sede; super: cualquiera)
- `GET /api/empleados`
- `PATCH /api/empleados/{id}/activo`

### Clientes
- `POST /api/clientes` (cliente rápido)
- `GET /api/clientes/buscar?q=...`

### Pedidos
- `GET /api/pedidos?estado=&desde=&hasta=&sedeId=` (CLIENTE solo ve los suyos)
- `POST /api/pedidos`
- `PATCH /api/pedidos/{id}/estado` — body: `{nuevoEstado, observacion?, maquinaId?}`
- `POST /api/pedidos/{id}/pagos`
- `GET /api/pedidos/{id}/historial`
- `GET /api/pedidos/publico/{codigoQr}` (público, info reducida)

### Máquinas
- `GET /api/maquinas` (sede del empleado / param sedeId si super)
- `PATCH /api/maquinas/{id}/estado` (gerente para MANTENIMIENTO/LIBRE; OCUPADA es automática)

### Sedes (super admin)
- `GET /api/sedes/admin` con KPIs
- `POST /api/sedes` (crea 3+3 máquinas)
- `PATCH /api/sedes/{id}/activa`

### Insumos
- `GET /api/insumos`
- `GET /api/insumos/stock-bajo`
- `POST /api/insumos`
- `PATCH /api/insumos/{id}`
- `POST /api/insumos/{id}/movimientos` (ENTRADA/AJUSTE/BAJA — el CONSUMO es automático)
- `GET /api/insumos/{id}/historial`

### Plan consumo (receta)
- `GET /api/planes/{planId}/consumos`
- `POST /api/planes/{planId}/consumos`
- `DELETE /api/planes/consumos/{id}`

### Reportes
- `GET /api/reportes/cierre-caja?fecha=&sedeId=` (+ `.xlsx`)
- `GET /api/reportes/consumo-insumos?desde=&hasta=&sedeId=` (+ `.xlsx`)
- `GET /api/reportes/ventas?desde=&hasta=&sedeId=` (+ `.xlsx`)

### Sede (continuación)
- `GET /api/sedes/mi-sede` (gerente/empleado/super) — devuelve sede + tolerancias
- `PATCH /api/sedes/{id}/tolerancia` — gerente solo sobre su sede; super admin cualquiera

### Cliente (continuación)
- `GET /api/clientes/me` y `PATCH /api/clientes/me` (rol CLIENTE)
- `GET /api/clientes/conteo` → `{ total }`
- `PATCH /api/clientes/{id}` y `POST /api/clientes/{id}/cuenta` (gerente/super)

## Reglas de negocio claves (acordadas)

1. **Ciclo de lavado**: máx 10 kg por ciclo. **No se cobra por bolsas/kilos** sino
   por **plan**. Cada plan = un ciclo de lavadora + un ciclo de secadora.
   El usuario del repo es además el dueño del negocio: dev Java Spring Boot.
2. **Cliente rápido**: el empleado puede crear cliente con solo nombre +
   teléfono (sin email/password). El teléfono es `UNIQUE`. Si después el
   cliente se registra por `/registro` con el mismo teléfono, su cuenta hace
   **upgrade** (mismo `usuario.id`, ya con `lavados_acumulados` históricos).
3. **Pago previo al lavado**: no se puede pasar de RECIBIDO a LAVANDO si
   `pedido.pagado=false`. Está hardcoded en `PedidoService.cambiarEstado`.
4. **Asignación de máquina**: al pasar a LAVANDO el empleado elige lavadora;
   al pasar a SECANDO elige secadora. La de la fase anterior se libera
   automático.
5. **Sin DOBLADO si el plan no lo incluye**: SECANDO → LISTO directo.
6. **Cancelar requiere observación** (motivo obligatorio).
7. **Al ENTREGAR**: incrementa `cliente.lavadosAcumulados` y setea `fechaEntregaReal`.
8. **3 lavadoras + 3 secadoras por sede**. Numeradas 1-3 por tipo. Solo
   GERENTE_SEDE/SUPER_ADMIN pueden poner una en MANTENIMIENTO. No se puede
   marcar como MANTENIMIENTO una OCUPADA.
9. **Inventario por sede**: cada sede tiene su propio inventario de insumos.
10. **Receta por plan + fase**: en LAVANDO descuenta los `plan_consumo` con
    `fase=LAVADO`; en SECANDO descuenta los de `fase=SECADO`. Si no hay
    suficiente stock para CUALQUIERA, no se descuenta nada y se bloquea el
    avance.
11. **Costo promedio ponderado** al hacer ENTRADA con costo distinto al actual:
    `(stock × costoActual + cantidad × costoNuevo) / (stock + cantidad)`.
    Redondeo a 4 decimales.
12. **AJUSTE conserva costo** (no es compra). BAJA y CONSUMO registran al
    costo actual del insumo en ese momento.
13. **Super admin email** del bootstrap: `distritoloftsas@gmail.com`.
    Definido en `application.yml` (`distrito.setup.super-admin-email`).

## Pitfalls técnicos conocidos (importante para no repetir)

Ya documentado en `~/.claude/projects/.../memory/feedback_jpa_principal.md`:

1. **La entidad del `principal` está detached.** Nunca accedas a relaciones
   lazy de `principal.getUsuario()` desde un `@Transactional`. Síntoma:
   `LazyInitializationException`. Fix: recargar usuario al inicio con
   `usuarioRepository.findById(principal.getUsuario().getId())`.
2. **No compares un campo ENUM contra una constante de la clase enum en JPQL.**
   `WHERE u.rol = RolUsuario.CLIENTE` genera cast PascalCase que no
   coincide con el tipo PG snake_case. Síntoma:
   `ERROR: type "rolusuario" does not exist`. Fix: siempre pasar como
   `@Param("rol") RolUsuario rol`.
3. **Parámetros nullable de tipo no primitivo en JPQL revientan en PG.**
   Patrón `WHERE (:fecha IS NULL OR p.fecha >= :fecha)` con `null` falla
   porque PG no infiere el tipo. Fix: convertir null a centinela ANTES de
   pasar al repo (`OffsetDateTime.parse("1970-01-01T00:00:00Z")` /
   `"9999-12-31T23:59:59Z"`). Ver `PedidoService.listar`.

Otros aprendizajes:

4. **`baseURL` con `??` vs `||`**: usar `||` para que `VITE_API_URL=""` caiga
   al default. Con `??` solo cae si es undefined.
5. **`useEffect` con objeto memoizado**: si el deps array depende de un
   objeto que se recrea en cada render, el effect corre infinito. Memoizar
   con `useMemo` y usar valores primitivos en las deps. Ver `CicloCountdown`.
6. **Sesión 403 en `/auth/me`**: el axios interceptor limpia el store en
   401 o 403 sobre `/auth/me` para evitar bucles login↔rol cuando el token
   persistido en localStorage es viejo.
7. **`replace_all: true` peligroso**: ojo cuando edites `@PreAuthorize` o
   patrones repetidos en un mismo archivo. Pasó una vez que abrió accesos
   no deseados al rol CLIENTE.

## Ambientes (Sprint 12)

### Backend
- `application.yml`: config común, `spring.profiles.active: ${SPRING_PROFILES_ACTIVE:dev}`.
- `application-dev.yml`: defaults locales, Postgres en 5433, JWT secret
  hardcodeado en yml.
- `application-qa.yml` y `application-prod.yml`: **todas las credenciales
  por env vars** (`DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS`).

### Frontend
- `.env.development`: `VITE_API_URL=/api` (usa proxy de Vite a 8080)
- `.env.qa` y `.env.production`: URL absoluta placeholder
- Scripts: `npm run dev`, `npm run build`, `npm run build:qa`, `npm run build:prod`

### Git
- `main` → producción (tag `v1.0.0` actual)
- `develop` → integración (donde se trabaja)
- `feature/*` → opcional para trabajo grande, PR a develop

## Comandos para levantar (Windows PowerShell)

3 ventanas:

**Ventana 1 — Postgres:**
```powershell
cd "C:\Users\asus\Desktop\Operativo Distrito"
docker compose up -d
```

**Ventana 2 — Backend:**
```powershell
cd "C:\Users\asus\Desktop\Operativo Distrito\distrito-backend"
.\mvnw.cmd spring-boot:run
```

**Ventana 3 — Frontend:**
```powershell
cd "C:\Users\asus\Desktop\Operativo Distrito\distrito-frontend"
npm run dev
```

App en `http://localhost:5173`.

**Apagar:** `Ctrl+C` en backend/frontend. `docker compose down` opcional.

**Reset DB completo** (cuidado, borra todo):
```powershell
docker compose down -v
docker compose up -d
.\mvnw.cmd spring-boot:run   # Flyway corre todas las migraciones
```

## Datos de prueba que existen actualmente

- Super admin: `distritoloftsas@gmail.com` (Angela Aroca). Password fue
  definido por usuario en el setup.
- Gerente Bambú: `maria.gerente@distritoloft.com`, password `Temporal2026!`
  (la cambió en su primer login).
- Empleados de prueba: `empleado.bambu01@gmail.com` (María De Los Ángeles
  Aroca), `nicolas.bambu01@gmail.com` (Nicolás Rivera, dev).
- Hay clientes rápidos creados durante pruebas (Cindy, Aranza, Paula, etc.)
- IDs altos (11, 12...) por huecos del `BIGSERIAL` consumido en inserts
  fallidos previos. **Es normal, no es bug.**

## Cosas pendientes guardadas en memoria

- `negocio_pasarela_pago.md` — integración futura (Wompi/Bold/ePayco/MP).
  Implica pago asíncrono, webhook, idempotencia. Esfuerzo ~1.5 sprints
  + trámite con proveedor.
- `negocio_speed_queen.md` — el fabricante de las máquinas (Speed Queen /
  Alliance Laundry) tiene su propia plataforma "Insights" sin API pública.
  Solo partner program cerrado (contacto `softwaresupport@alliancels.com`).
  Las máquinas de Bambú **probablemente NO son IoT** (sin módulo conectado).
  Hay que verificar el modelo antes de pensar en integrar.

## Próximas opciones de feature (la fila)

1. **Costo y margen en cierre de caja** (S) — restar el costo de insumos
   consumidos a los ingresos para mostrar ganancia neta del día. Aprovecha
   todo lo del Sprint 18.
2. **Fase C: Mantenimiento de máquinas** (M) — historial por máquina, vida
   útil, alertas.
3. **Productividad por empleado** (M).
4. **Fidelización** (M) — descuento cada N lavados acumulados.
5. **Comentarios del cliente al pedido** (S).
6. **Notificación push PWA al LISTO** (M) — sin proveedor externo.
7. **Deploy real a QA** (M) — Railway/Neon/Vercel.
8. **Tests automáticos** (M).

Lista completa con ~40 ideas más en el resumen de la conversación. Si quiere
otra cosa nueva, pídele recomendación al asistente con la nueva ronda de ideas.

## Convenciones del proyecto (lo que el dueño espera)

- Tono conciso, español, sin emojis.
- Sprint = un commit con prefijo `Sprint NN: ...`.
- Trabajar en `develop`, **NO** committear en main.
- Antes de cambios pesados o decisiones de negocio, **preguntar con
  `AskUserQuestion`** ofreciendo recomendación.
- Después de cada sprint terminado, **mostrar resumen** + **comandos para
  probar** + **preguntar siguiente paso**.
- Si hay duda con cambios destructivos en git (push, reset, etc.),
  **confirmar antes**.
- En git, NO usar `--no-verify`, NO force-push a main, los warnings de
  LF/CRLF son normales en Windows.
- Co-author en commits: omitido en este repo (el usuario commitea
  manualmente la mayoría).

## Estado del último commit en develop

A la fecha del último mensaje antes de compactar: **Sprint 18** (trazabilidad,
CPP, historial e informe de consumo) está listo en código **pero no
commiteado**. El último commit pusheado fue `724516f` con
"Sprint 16+17: inventario de insumos + receta de consumo por plan".

Hay que hacer commit del Sprint 18 cuando se retome.
