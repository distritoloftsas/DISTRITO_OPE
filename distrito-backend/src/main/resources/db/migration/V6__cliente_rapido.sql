-- =========================================================================
-- V6 — Soporte para "cliente rápido" sin email ni password.
-- Reglas:
--   - Para CLIENTE: email y password_hash pueden ser NULL. telefono OBLIGATORIO.
--   - Para los demás roles: email y password_hash OBLIGATORIOS. telefono opcional.
--   - Telefono es UNIQUE en toda la tabla cuando está presente.
-- =========================================================================

ALTER TABLE usuario ALTER COLUMN email DROP NOT NULL;
ALTER TABLE usuario ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE usuario ADD CONSTRAINT chk_usuario_credenciales_no_cliente
    CHECK (
        rol = 'CLIENTE'
        OR (email IS NOT NULL AND password_hash IS NOT NULL)
    );

ALTER TABLE usuario ADD CONSTRAINT chk_usuario_telefono_obligatorio_cliente
    CHECK (
        rol <> 'CLIENTE' OR telefono IS NOT NULL
    );

CREATE UNIQUE INDEX uq_usuario_telefono ON usuario (telefono) WHERE telefono IS NOT NULL;
