-- Sprint 11: duracion estimada por plan + tracking de inicio de cada ciclo

ALTER TABLE plan
    ADD COLUMN duracion_lavado_minutos INT NOT NULL DEFAULT 35 CHECK (duracion_lavado_minutos > 0),
    ADD COLUMN duracion_secado_minutos INT NOT NULL DEFAULT 30 CHECK (duracion_secado_minutos > 0);

ALTER TABLE pedido
    ADD COLUMN fecha_inicio_lavado TIMESTAMPTZ,
    ADD COLUMN fecha_inicio_secado TIMESTAMPTZ;
