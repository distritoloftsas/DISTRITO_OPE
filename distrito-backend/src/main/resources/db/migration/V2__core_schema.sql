-- =========================================================================
-- V2 — Schema core del MVP
-- Entidades: sede, usuario, cliente_perfil, empleado_perfil, plan, pedido,
--            pedido_estado_historial, pago
-- =========================================================================

-- ----- Tipos enumerados -----------------------------------------------------

CREATE TYPE rol_usuario AS ENUM (
    'CLIENTE',
    'EMPLEADO',
    'GERENTE_SEDE',
    'SUPER_ADMIN'
);

CREATE TYPE estado_pedido AS ENUM (
    'RECIBIDO',
    'LAVANDO',
    'SECANDO',
    'DOBLANDO',
    'LISTO',
    'ENTREGADO',
    'CANCELADO'
);

CREATE TYPE metodo_pago AS ENUM (
    'EFECTIVO',
    'TRANSFERENCIA',
    'DATAFONO'
);

-- ----- Función para trigger actualizado_en ---------------------------------

CREATE OR REPLACE FUNCTION set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----- sede ----------------------------------------------------------------

CREATE TABLE sede (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL UNIQUE,
    direccion       TEXT         NOT NULL,
    ciudad          VARCHAR(80)  NOT NULL,
    telefono        VARCHAR(20),
    coordenadas     POINT,
    activa          BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_sede_actualizado_en
    BEFORE UPDATE ON sede
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE INDEX idx_sede_activa ON sede(activa);

-- ----- usuario -------------------------------------------------------------

CREATE TABLE usuario (
    id              BIGSERIAL    PRIMARY KEY,
    email           VARCHAR(120) NOT NULL UNIQUE,
    telefono        VARCHAR(20),
    password_hash   VARCHAR(120) NOT NULL,
    rol             rol_usuario  NOT NULL,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    ultimo_login    TIMESTAMPTZ,
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_usuario_actualizado_en
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE INDEX idx_usuario_telefono ON usuario(telefono) WHERE telefono IS NOT NULL;
CREATE INDEX idx_usuario_rol      ON usuario(rol);
CREATE INDEX idx_usuario_activo   ON usuario(activo);

-- ----- cliente_perfil ------------------------------------------------------

CREATE TABLE cliente_perfil (
    usuario_id           BIGINT       PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    nombre               VARCHAR(120) NOT NULL,
    direccion_principal  TEXT,
    cliente_desde        DATE         NOT NULL DEFAULT CURRENT_DATE,
    lavados_acumulados   INT          NOT NULL DEFAULT 0 CHECK (lavados_acumulados >= 0)
);

-- ----- empleado_perfil -----------------------------------------------------

CREATE TABLE empleado_perfil (
    usuario_id      BIGINT       PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    sede_id         BIGINT       NOT NULL REFERENCES sede(id),
    nombre          VARCHAR(120) NOT NULL,
    cargo           VARCHAR(60),
    fecha_ingreso   DATE         NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_empleado_perfil_sede ON empleado_perfil(sede_id);

-- ----- plan ----------------------------------------------------------------

CREATE TABLE plan (
    id                  BIGSERIAL    PRIMARY KEY,
    nombre              VARCHAR(80)  NOT NULL UNIQUE,
    descripcion         TEXT,
    kilos_max_ciclo     INT          NOT NULL DEFAULT 10 CHECK (kilos_max_ciclo > 0),
    incluye_doblado     BOOLEAN      NOT NULL DEFAULT FALSE,
    incluye_domicilio   BOOLEAN      NOT NULL DEFAULT FALSE,
    precio              NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    orden               INT          NOT NULL DEFAULT 0,
    activo              BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_en      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_plan_actualizado_en
    BEFORE UPDATE ON plan
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE INDEX idx_plan_activo ON plan(activo);

-- ----- pedido --------------------------------------------------------------

CREATE TABLE pedido (
    id                       BIGSERIAL     PRIMARY KEY,
    codigo_qr                VARCHAR(20)   NOT NULL UNIQUE,
    cliente_id               BIGINT        NOT NULL REFERENCES usuario(id),
    sede_id                  BIGINT        NOT NULL REFERENCES sede(id),
    plan_id                  BIGINT        NOT NULL REFERENCES plan(id),
    estado                   estado_pedido NOT NULL DEFAULT 'RECIBIDO',
    total                    NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    observaciones            TEXT,
    fecha_recepcion          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    fecha_entrega_estimada   TIMESTAMPTZ,
    fecha_entrega_real       TIMESTAMPTZ,
    creado_por_empleado_id   BIGINT        REFERENCES usuario(id),
    actualizado_en           TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_pedido_actualizado_en
    BEFORE UPDATE ON pedido
    FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

CREATE INDEX idx_pedido_codigo_qr             ON pedido(codigo_qr);
CREATE INDEX idx_pedido_cliente_fecha         ON pedido(cliente_id, fecha_recepcion DESC);
CREATE INDEX idx_pedido_sede_estado           ON pedido(sede_id, estado);
CREATE INDEX idx_pedido_estado                ON pedido(estado) WHERE estado NOT IN ('ENTREGADO', 'CANCELADO');

-- ----- pedido_estado_historial ---------------------------------------------

CREATE TABLE pedido_estado_historial (
    id           BIGSERIAL     PRIMARY KEY,
    pedido_id    BIGINT        NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    estado       estado_pedido NOT NULL,
    empleado_id  BIGINT        REFERENCES usuario(id),
    fecha        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    observacion  TEXT
);

CREATE INDEX idx_pedido_historial_pedido_fecha ON pedido_estado_historial(pedido_id, fecha);

-- ----- pago ----------------------------------------------------------------

CREATE TABLE pago (
    id           BIGSERIAL     PRIMARY KEY,
    pedido_id    BIGINT        NOT NULL REFERENCES pedido(id),
    metodo       metodo_pago   NOT NULL,
    monto        NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    empleado_id  BIGINT        REFERENCES usuario(id),
    fecha        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    referencia   VARCHAR(80)
);

CREATE INDEX idx_pago_pedido ON pago(pedido_id);
CREATE INDEX idx_pago_fecha  ON pago(fecha);
