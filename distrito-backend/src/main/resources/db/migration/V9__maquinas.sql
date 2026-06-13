-- Sprint 4: gestion de maquinas fisicas (3 lavadoras + 3 secadoras por sede)

CREATE TYPE tipo_maquina AS ENUM ('LAVADORA', 'SECADORA');
CREATE TYPE estado_maquina AS ENUM ('LIBRE', 'OCUPADA', 'MANTENIMIENTO');

CREATE TABLE maquina (
    id         BIGSERIAL PRIMARY KEY,
    sede_id    BIGINT NOT NULL REFERENCES sede(id),
    tipo       tipo_maquina NOT NULL,
    numero     SMALLINT NOT NULL CHECK (numero > 0),
    estado     estado_maquina NOT NULL DEFAULT 'LIBRE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_maquina_sede_tipo_numero UNIQUE (sede_id, tipo, numero)
);

CREATE INDEX idx_maquina_sede_tipo_estado ON maquina(sede_id, tipo, estado);

-- FKs opcionales en pedido: la maquina que esta procesando (o proceso) este pedido
ALTER TABLE pedido
    ADD COLUMN lavadora_id BIGINT REFERENCES maquina(id),
    ADD COLUMN secadora_id BIGINT REFERENCES maquina(id);

-- Seed: 3 lavadoras + 3 secadoras en sede Bambu (id=1)
INSERT INTO maquina (sede_id, tipo, numero) VALUES
    (1, 'LAVADORA', 1),
    (1, 'LAVADORA', 2),
    (1, 'LAVADORA', 3),
    (1, 'SECADORA', 1),
    (1, 'SECADORA', 2),
    (1, 'SECADORA', 3);
