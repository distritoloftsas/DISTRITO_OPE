-- La receta (plan_consumo) puede usar una unidad distinta a la del insumo.
-- Caso real: jabon comprado en LITROS pero gastado en MILILITROS por ciclo.
-- El sistema convierte en runtime al descontar inventario.
--
-- Backfill: las recetas existentes heredan la unidad del insumo (no hay
-- discrepancia hasta que el usuario explicitamente la cambie).

ALTER TABLE plan_consumo ADD COLUMN unidad unidad_insumo NULL;

UPDATE plan_consumo pc
SET unidad = (SELECT i.unidad FROM insumo i WHERE i.id = pc.insumo_id)
WHERE pc.unidad IS NULL;

ALTER TABLE plan_consumo ALTER COLUMN unidad SET NOT NULL;
