-- Sprint 25: turno de caja y gastos.
-- El empleado abre el turno con el efectivo base. Durante el turno se cobran
-- pedidos y se registran gastos. Al cerrar, el sistema calcula el efectivo
-- esperado (apertura + cobrado en efectivo - gastos) y la diferencia contra
-- lo que la empleada declara en caja.

CREATE TABLE turno_caja (
    id                          BIGSERIAL PRIMARY KEY,
    sede_id                     BIGINT NOT NULL REFERENCES sede(id),
    empleado_id                 BIGINT NOT NULL REFERENCES usuario(id),
    fecha_apertura              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    efectivo_apertura           NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (efectivo_apertura >= 0),
    fecha_cierre                TIMESTAMPTZ,
    efectivo_cierre_declarado   NUMERIC(12,2) CHECK (efectivo_cierre_declarado >= 0),
    efectivo_esperado           NUMERIC(12,2),
    diferencia                  NUMERIC(12,2),
    observaciones               TEXT,
    CONSTRAINT chk_cierre_completo CHECK (
        (fecha_cierre IS NULL AND efectivo_cierre_declarado IS NULL)
        OR (fecha_cierre IS NOT NULL AND efectivo_cierre_declarado IS NOT NULL)
    )
);

CREATE INDEX idx_turno_empleado_abierto ON turno_caja(empleado_id) WHERE fecha_cierre IS NULL;
CREATE INDEX idx_turno_sede_fecha ON turno_caja(sede_id, fecha_apertura DESC);

-- Solo puede haber un turno abierto por empleado a la vez.
CREATE UNIQUE INDEX uk_turno_abierto_por_empleado
    ON turno_caja(empleado_id) WHERE fecha_cierre IS NULL;

CREATE TABLE gasto_caja (
    id              BIGSERIAL PRIMARY KEY,
    turno_id        BIGINT NOT NULL REFERENCES turno_caja(id) ON DELETE CASCADE,
    concepto        VARCHAR(160) NOT NULL,
    monto           NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    empleado_id     BIGINT REFERENCES usuario(id)
);

CREATE INDEX idx_gasto_turno ON gasto_caja(turno_id);
