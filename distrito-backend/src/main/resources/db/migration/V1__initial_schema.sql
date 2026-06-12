-- Migración inicial: tabla mínima para validar la conexión.
-- Las tablas reales del modelo de datos se añadirán en V2, V3...

CREATE TABLE IF NOT EXISTS plataforma_info (
    id          BIGSERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    version     VARCHAR(20)  NOT NULL,
    creado_en   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

INSERT INTO plataforma_info (nombre, version)
VALUES ('Distrito Loft Operativo', '0.0.1');
