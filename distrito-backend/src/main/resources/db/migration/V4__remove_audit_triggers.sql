-- =========================================================================
-- V4 — Quitar triggers de actualizado_en
-- Ahora la gestión de fechas audit la hace Hibernate con
-- @CreationTimestamp y @UpdateTimestamp. Tener ambos (trigger + ORM) es
-- redundante y puede causar inconsistencias en caches de JPA.
-- =========================================================================

DROP TRIGGER IF EXISTS trg_sede_actualizado_en ON sede;
DROP TRIGGER IF EXISTS trg_usuario_actualizado_en ON usuario;
DROP TRIGGER IF EXISTS trg_plan_actualizado_en ON plan;
DROP TRIGGER IF EXISTS trg_pedido_actualizado_en ON pedido;

DROP FUNCTION IF EXISTS set_actualizado_en();
