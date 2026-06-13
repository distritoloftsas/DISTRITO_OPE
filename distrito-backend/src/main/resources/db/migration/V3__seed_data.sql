-- =========================================================================
-- V3 — Datos iniciales (seed)
-- Solo catálogos. Los usuarios se crearán vía la API una vez que
-- Spring Security esté configurado.
-- =========================================================================

-- ----- Sede principal ------------------------------------------------------

INSERT INTO sede (nombre, direccion, ciudad, telefono, activa)
VALUES (
    'Bambú',
    'Local No.10 Etapa III, Bambú Conjunto Residencial, Cra. 21 No. 25-52 Sur',
    'Neiva',
    '+57 320 362 8511',
    TRUE
);

-- ----- Planes --------------------------------------------------------------

INSERT INTO plan (nombre, descripcion, kilos_max_ciclo, incluye_doblado, incluye_domicilio, precio, orden, activo)
VALUES
    ('Lavado y Secado',
     'Ciclo completo de lavado y secado. Incluye detergente, suavizante y bruma textil.',
     10, FALSE, FALSE, 18000, 1, TRUE),

    ('Lavado, Secado y Doblado',
     'Incluye además el doblado de la ropa lista para guardar.',
     10, TRUE, FALSE, 25000, 2, TRUE),

    ('Lavado, Secado, Doblado y Domicilio',
     'Servicio completo con recolección y entrega a domicilio.',
     10, TRUE, TRUE, 32000, 3, TRUE);
