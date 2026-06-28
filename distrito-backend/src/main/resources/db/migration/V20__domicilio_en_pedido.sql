-- El precio del domicilio depende de la ubicacion del cliente y es la
-- empleada quien lo decide al crear el pedido. Antes el plan solo tenia
-- un boolean incluye_domicilio sin precio.
--
-- direccion_entrega es opcional a nivel de columna (puede haber pedidos
-- sin domicilio). El backend valida que sea obligatoria cuando el plan
-- incluye_domicilio = true.

ALTER TABLE pedido
    ADD COLUMN costo_domicilio NUMERIC(10, 2) NOT NULL DEFAULT 0
        CHECK (costo_domicilio >= 0),
    ADD COLUMN direccion_entrega TEXT NULL;
