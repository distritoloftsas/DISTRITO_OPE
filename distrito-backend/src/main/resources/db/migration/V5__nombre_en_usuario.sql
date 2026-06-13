-- =========================================================================
-- V5 — Mover el nombre a la tabla usuario
-- Todos los roles tienen nombre (incluso SUPER_ADMIN sin perfil),
-- así que conviene tenerlo en una sola columna.
-- =========================================================================

ALTER TABLE usuario ADD COLUMN nombre VARCHAR(120);

UPDATE usuario SET nombre = 'Sin nombre' WHERE nombre IS NULL;

ALTER TABLE usuario ALTER COLUMN nombre SET NOT NULL;

ALTER TABLE cliente_perfil DROP COLUMN nombre;
ALTER TABLE empleado_perfil DROP COLUMN nombre;
