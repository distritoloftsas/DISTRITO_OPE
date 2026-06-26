-- Sprint 17 (Fase B): receta de consumo de insumos por plan y fase del ciclo.

CREATE TYPE fase_consumo AS ENUM ('LAVADO', 'SECADO');

CREATE TABLE plan_consumo (
    id          BIGSERIAL PRIMARY KEY,
    plan_id     BIGINT NOT NULL REFERENCES plan(id) ON DELETE CASCADE,
    insumo_id   BIGINT NOT NULL REFERENCES insumo(id) ON DELETE RESTRICT,
    fase        fase_consumo NOT NULL,
    cantidad    NUMERIC(12,3) NOT NULL CHECK (cantidad > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_plan_consumo UNIQUE (plan_id, insumo_id, fase)
);

CREATE INDEX idx_plan_consumo_plan_fase ON plan_consumo(plan_id, fase);
