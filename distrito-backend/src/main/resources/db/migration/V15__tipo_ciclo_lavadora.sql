-- Sprint 23: el ciclo de la lavadora (Sencillo/Intermedio/Deluxe) lo elige
-- la empleada al iniciar el lavado, independiente del plan del cliente.

CREATE TYPE tipo_ciclo_lavadora AS ENUM ('SENCILLO', 'INTERMEDIO', 'DELUXE');

ALTER TABLE pedido
    ADD COLUMN tipo_ciclo_lavadora tipo_ciclo_lavadora;
