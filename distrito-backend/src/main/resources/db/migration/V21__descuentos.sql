-- Sprint 33: Descuentos aplicables al plan (no al domicilio).
-- Por ahora los tipos son fijos (4 categorias), la UI selecciona uno o
-- ninguno, y solo se guarda porcentaje al momento de crear el pedido
-- para que si el descuento cambia mas adelante el historico no se altere.

CREATE TABLE descuento (
    id            BIGSERIAL PRIMARY KEY,
    codigo        VARCHAR(30)  NOT NULL UNIQUE,
    etiqueta      VARCHAR(100) NOT NULL,
    porcentaje    NUMERIC(5, 2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
    activo        BOOLEAN NOT NULL DEFAULT true,
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO descuento (codigo, etiqueta, porcentaje) VALUES
    ('ESTUDIANTE',  'Estudiante universitario',                              10.00),
    ('POLICIA',     'Policía',                                                10.00),
    ('SALUD',       'Sector salud (clínicas cercanas)',                       10.00),
    ('RESIDENCIAL', 'Sector residencial (Bambú, Multicentro, Los Tulipanes)', 10.00);

ALTER TABLE pedido
    ADD COLUMN descuento_id           BIGINT REFERENCES descuento(id),
    ADD COLUMN porcentaje_descuento   NUMERIC(5, 2) NOT NULL DEFAULT 0
        CHECK (porcentaje_descuento >= 0 AND porcentaje_descuento <= 100),
    ADD COLUMN subtotal               NUMERIC(10, 2),
    ADD COLUMN monto_descuento        NUMERIC(10, 2) NOT NULL DEFAULT 0
        CHECK (monto_descuento >= 0);

-- Backfill: pedidos existentes no tienen descuento; subtotal = precio del plan
-- guardado hoy en `total - costo_domicilio` para conservar la relacion.
UPDATE pedido
   SET subtotal = total - costo_domicilio
 WHERE subtotal IS NULL;

ALTER TABLE pedido
    ALTER COLUMN subtotal SET NOT NULL,
    ADD CONSTRAINT pedido_subtotal_no_negativo CHECK (subtotal >= 0);
