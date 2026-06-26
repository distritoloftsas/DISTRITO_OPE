-- Sprint 16: inventario de insumos (jabon, suavizante, energia, etc.)

CREATE TYPE unidad_insumo AS ENUM (
    'GRAMO', 'KILO', 'MILILITRO', 'LITRO', 'KILOVATIO_HORA', 'UNIDAD'
);

CREATE TYPE tipo_movimiento_insumo AS ENUM (
    'ENTRADA',  -- compra / reposicion
    'CONSUMO',  -- gasto por pedido (reservado, hoy manual)
    'AJUSTE',   -- correccion al alza o baja
    'BAJA'      -- descarte por vencimiento, dano, etc.
);

CREATE TABLE insumo (
    id              BIGSERIAL PRIMARY KEY,
    sede_id         BIGINT NOT NULL REFERENCES sede(id),
    nombre          VARCHAR(80) NOT NULL,
    unidad          unidad_insumo NOT NULL,
    stock_actual    NUMERIC(12,3) NOT NULL DEFAULT 0,
    stock_minimo    NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    costo_unitario  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (costo_unitario >= 0),
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_insumo_sede_nombre UNIQUE (sede_id, nombre)
);

CREATE INDEX idx_insumo_sede_activo ON insumo(sede_id, activo);

CREATE TABLE movimiento_insumo (
    id              BIGSERIAL PRIMARY KEY,
    insumo_id       BIGINT NOT NULL REFERENCES insumo(id) ON DELETE CASCADE,
    tipo            tipo_movimiento_insumo NOT NULL,
    cantidad        NUMERIC(12,3) NOT NULL CHECK (cantidad > 0),
    costo_unitario  NUMERIC(12,2),
    motivo          TEXT,
    pedido_id       BIGINT REFERENCES pedido(id),
    empleado_id     BIGINT REFERENCES usuario(id),
    fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mov_insumo_insumo_fecha ON movimiento_insumo(insumo_id, fecha DESC);
CREATE INDEX idx_mov_insumo_pedido ON movimiento_insumo(pedido_id) WHERE pedido_id IS NOT NULL;
