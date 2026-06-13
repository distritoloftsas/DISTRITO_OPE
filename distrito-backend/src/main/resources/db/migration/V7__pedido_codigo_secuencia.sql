-- =========================================================================
-- V7 — Secuencia para generar el codigo_qr de pedidos (DL-0001, DL-0002, ...).
-- Usamos una secuencia dedicada en vez del id de la tabla porque puede
-- haber gaps por transacciones revertidas; el codigo del cliente debe ser
-- limpio y monotónico.
-- =========================================================================

CREATE SEQUENCE pedido_codigo_seq START WITH 1 INCREMENT BY 1;
