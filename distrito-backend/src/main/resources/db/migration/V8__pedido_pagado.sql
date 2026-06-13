-- =========================================================================
-- V8 — Marcar pedidos como pagados.
-- Denormalizado para evitar SUM(pagos) en cada lectura del Kanban.
-- Se actualiza al registrar un pago que cubre el total del pedido.
-- =========================================================================

ALTER TABLE pedido ADD COLUMN pagado BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_pedido_pagado ON pedido(pagado) WHERE pagado = FALSE;
