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
| 24 | **Tests automáticos**: JUnit + Mockito sobre `PedidoService.cambiarEstado` (transiciones, pago previo, tipo ciclo obligatorio, observación al cancelar, sede ajena), Vitest sobre `whatsappAvisar`. **Bug encontrado y corregido por test**: la validación de tipo de ciclo ocurría DESPUÉS de asignar la máquina; ahora va antes. Comandos: `mvnw test -Dtest=...` y `npm test` |
| 25 | **Recibo de pago imprimible** (modal con CSS print friendly tras cobrar) · **Alerta pedidos sin recoger** (banner + anillo ámbar a las 24h, alarmado a las 72h) · **Script de backup automático** `scripts/backup-db.ps1` con rotación de 30 archivos + `restaurar-db.ps1` + instrucciones para Task Scheduler |
| 25b | **Apertura y cierre de turno + gastos de caja**: V16 (`turno_caja`, `gasto_caja`), `TurnoSection` con flujo abrir → registrar gasto → cerrar con cuadre. Calcula efectivo esperado = apertura + cobrado_efectivo − gastos. Diferencia se muestra en verde (cuadra) / rojo (falta) / ámbar (sobra) |
| 26 | **Sistema de permisos por vista**: V17 (`usuario_permiso` + ENUM `permiso_usuario`), enum `Permiso` con 11 valores, `UsuarioPermisoRepository` JDBC, defaults sensatos por rol al crear empleado. `PermisosModal` con checkboxes solo accesible a SUPER_ADMIN. UI condicionada por `tienePermiso(usuario, X)`. EmpleadoPage eliminada — empleado y gerente ahora usan la misma `/gerente` y las pestañas se filtran por permisos. AdminPage gana pestaña Equipo con selector de sede |
| 27 | **Backend blindado con permisos finos**: bean `PermisoChecker` evaluable desde `@PreAuthorize("@permisoChecker.tiene('X')")`; reemplaza `hasAnyRole` en endpoints sensibles (cierre/ventas/consumo, sede tolerancia, insumos, recetas, máquinas, clientes, equipo). Defensa en profundidad: tanto la UI como la API rechazan; el `BotonDescargarExcel` también se auto-oculta si falta `EXPORTAR_REPORTES`. SUPER_ADMIN siempre pasa por código |
| 28 | **UX final**: sistema unificado de toasts (`lib/notify.ts` + `NotificationCenter`) con `notify.exito / .error / .info` (auto-dismiss), helper `mensajeDeError()`, modal de confirmación reusable `confirmar({...})` con Enter/Esc. Aplicado en hooks de mutación clave (pedidos, empleados, turnos) — los modales no necesitan código extra. `confirmarCerrarSesion` ahora usa el modal en vez de `window.confirm`. `GlobalExceptionHandler` mejorado: mensaje 500 incluye ClassName + msg; `AuthorizationDeniedException`/`AccessDeniedException` ahora devuelven 403 con mensaje claro |

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
- V16: tablas `turno_caja` (con índice único parcial: un solo turno abierto por empleado) + `gasto_caja`
- V17: ENUM `permiso_usuario` (11 valores) + tabla `usuario_permiso(usuario_id, permiso)` + seed que asigna defaults a gerentes y empleados existentes

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

### Turno + gastos
- `POST /api/turnos` → abrir turno con efectivo base
- `GET /api/turnos/actual` → turno abierto del empleado (con cobrado en vivo + gastos + esperado)
- `PATCH /api/turnos/{id}/cerrar` → calcula esperado y diferencia, persiste
- `POST /api/turnos/{id}/gastos` → registra gasto del turno
- `GET /api/turnos?sedeId=&desde=&hasta=` (gerente/super)

### Empleados / Permisos
- `PATCH /api/empleados/{id}/permisos` (solo SUPER_ADMIN) — `{ permisos: [...] }`
- AuthMe (`/api/auth/me`) y `EmpleadoResponse` ahora exponen el set de permisos
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
14. **Permisos por vista** (Sprint 26): cada usuario empleado/gerente tiene N
    permisos del enum `Permiso`. SUPER_ADMIN siempre los tiene todos por
    código. Solo SUPER_ADMIN puede asignar/quitar. Defaults al crear:
    - GERENTE_SEDE: todos los permisos
    - EMPLEADO: VER_OPERACION + VER_CLIENTES + VER_CIERRE_CAJA
15. **Empleado y gerente comparten `/gerente`** (Sprint 26). El nav filtra
    pestañas por permiso del usuario. Si una empleada no tiene VER_EQUIPO,
    no ve la pestaña "Equipo". Backend `@PreAuthorize("@permisoChecker.tiene('X')")`
    bloquea con 403 si llaman el endpoint igual.
16. **Tipo de ciclo de lavadora vs tiempos del plan** (Sprint 23): el plan
    sigue teniendo `duracionLavadoMinutos` como fallback, pero lo que manda
    en el countdown es `pedido.tipoCicloLavadora` (SENCILLO 30, INTERMEDIO 36,
    DELUXE 43) que elige la empleada al iniciar el lavado.
17. **Turno de caja por empleado** (Sprint 25b): un solo turno abierto por
    empleado a la vez (índice único parcial en DB). El cuadre al cerrar:
    `esperado = apertura + sum(pagos EFECTIVO del empleado en el rango) − gastos`.

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
   patrones repetidos en un mismo archivo. Pasó dos veces que abrió o
   cerró accesos no deseados. Solución: usar constantes (`CIERRE_ROLES`,
   `GESTION_ROLES`) en lugar de strings literales en cada anotación.
8. **Los services NO deben rebloquear por rol si el controller ya filtra
   con `@permisoChecker.tiene(...)`**. Pasó múltiples veces que un endpoint
   abierto con permiso fallaba con 422 "Solo el gerente puede..." porque
   el service hacía un check redundante de `rol == GERENTE_SEDE`. Patrón
   correcto: el service solo bloquea CLIENTE (defensa en profundidad) y la
   lógica de sede se evalúa por `actual.getRol() != SUPER_ADMIN ⇒ usar su
   propia sede`. Aplicado en `InsumoService`, `MaquinaService`,
   `PlanConsumoService`, `ReportesService`.
9. **Spring Security 6 lanza `AuthorizationDeniedException`, no
   `AccessDeniedException`.** Antes del Sprint 28 caía al handler de
   `Exception` y devolvía 500. Ahora `GlobalExceptionHandler` mapea ambas
   a 403 con mensaje claro.
10. **Tests con Mockito y SpringSecurity**: para evitar `UnnecessaryStubbing`
    use `@MockitoSettings(strictness = Strictness.LENIENT)`. Para test que
    inyecta `PedidoService` use `ReflectionTestUtils.setField(service, "em", em)`
    porque el `@PersistenceContext` no se mockea por defecto.

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
8. **WhatsApp automático real** — reemplazar el wa.me semiautomático actual
   cuando el dueño contrate proveedor (Twilio/Meta API). Ver memoria
   `negocio_whatsapp.md` para diseño previsto.
9. **Devoluciones / reembolsos** — flujo cuando el cliente reclama después
   de un ENTREGADO.
10. **Habeas data (Ley 1581)** — checkbox de aceptación en `/registro`
    + política de tratamiento de datos.
11. **Factura electrónica DIAN** — solo cuando se pase el umbral o un
    cliente la exija.
12. **Foto al recibir / al entregar** (opcional) — 2 fotos por pedido
    en S3 para evitar disputas de "me dañaron la camisa".
13. **Apertura/cierre de turno con Excel export** — el reporte de turnos
    ya existe en la DB pero no hay XLSX todavía.

## Trucos de prueba útiles

- **Resetear permisos de un usuario** a defaults (en psql):
  ```sql
  DELETE FROM usuario_permiso WHERE usuario_id = X;
  -- después relogin para que AuthMe los reasigne (NO, los defaults solo
  -- se aplican al CREAR el usuario, así que toca insertar a mano o usar
  -- el modal de permisos como super admin)
  ```
- **Forzar a un empleado a estar sin permisos** para probar 403:
  marca todos los checks vacíos en el modal de permisos. El back devuelve
  "No tienes permiso para esta acción".
- **Reproducir el flujo completo** después de un reset:
  1. `POST /api/auth/setup` con email + password del super admin
  2. Crear sede (POST /sedes) — automáticamente crea 3+3 máquinas
  3. Crear gerente (POST /empleados con rol GERENTE_SEDE) → recibe
     todos los permisos por default
  4. Logear como gerente → crear empleado → ese recibe los 3 permisos
     básicos por default
  5. Como super admin desde /admin → Equipo → ajustar permisos del
     empleado según lo que necesite

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

## Estado actual de develop (al cierre de esta sesión)

Último commit pusheado: **`3dfc766`** "Fix: AccessDenied → 403 (no 500)".

Todo lo que sigue YA está commiteado y en `origin/develop`:

- Sprint 18 → 28 completos
- 17 migraciones Flyway (V1 → V17)
- 8 tests backend verde + 9 tests frontend verde (`./mvnw.cmd test` y `npm test`)
- Backend compila limpio (`./mvnw.cmd -DskipTests clean compile` → BUILD SUCCESS)
- Frontend tipo-checked (`npx tsc --noEmit` → EXIT 0)
- Backend y frontend levantando OK con `docker compose up -d` + `mvnw spring-boot:run` + `npm run dev`

## Pendientes inmediatos (nada bloqueante)

1. **Tag `v2.0.0`** en main cuando se merguee — incluye permisos por
   vista, turnos, recibo, WhatsApp y backups. Importante porque marca
   el inicio del modelo de seguridad nuevo.
2. **Migración para limpiar `plan_consumo` viejo** si se decide quitar
   la receta. Actualmente está activa.
3. **Probar end-to-end** desde un usuario con permisos parciales para
   confirmar que los 403 llegan con mensaje legible al frontend (toast
   rojo).
4. **Si un empleado nuevo no tiene permisos** (creado antes de V17 que
   por algún motivo no recibió el seed): el super admin entra a
   `/admin → Equipo → click Permisos sobre la fila → marca lo que
   necesite → Guardar`. El backend ahora responde 403 con mensaje
   claro cuando falta uno.

## Convenciones de respuesta del asistente en futuras sesiones

- Tono breve, español sin emojis (mantener estilo histórico).
- Cada sprint = un commit con prefijo `Sprint NN: ...` o un mensaje
  descriptivo si es fix.
- Antes de cambios pesados o decisiones de negocio, **preguntar con
  `AskUserQuestion`** ofreciendo recomendación.
- Después de cada sprint, **mostrar resumen** + **comandos para probar**
  + **preguntar siguiente paso**.
- Si hay cambios destructivos en git (push, reset, etc.), **confirmar**.
- En git, NO usar `--no-verify`, NO force-push a main, los warnings
  de LF/CRLF son normales en Windows.
- Co-author en commits: omitido en este repo (el usuario commitea
  manualmente la mayoría).
