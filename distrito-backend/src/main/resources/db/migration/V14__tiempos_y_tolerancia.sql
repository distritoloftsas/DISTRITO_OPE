-- Sprint 19: tiempos reales por plan + tolerancia por sede

-- Tiempos reales segun maquinas Speed Queen:
--   Sencillo (Lavado y Secado):                 lavado 30, secado 43
--   Intermedio (Lavado, Secado y Doblado):      lavado 36, secado 43
--   Deluxe (Lavado, Secado, Doblado y Domicilio): lavado 43, secado 43
UPDATE plan SET duracion_lavado_minutos = 30, duracion_secado_minutos = 43 WHERE orden = 1;
UPDATE plan SET duracion_lavado_minutos = 36, duracion_secado_minutos = 43 WHERE orden = 2;
UPDATE plan SET duracion_lavado_minutos = 43, duracion_secado_minutos = 43 WHERE orden = 3;

-- Tolerancia operativa por sede:
--   pre_lavado:  minutos entre que la empleada recibe la ropa y arranca la lavadora
--   post_lavado: minutos entre que termina la lavadora y arranca la secadora
ALTER TABLE sede
    ADD COLUMN tolerancia_pre_lavado_minutos  INT NOT NULL DEFAULT 5 CHECK (tolerancia_pre_lavado_minutos  >= 0),
    ADD COLUMN tolerancia_post_lavado_minutos INT NOT NULL DEFAULT 5 CHECK (tolerancia_post_lavado_minutos >= 0);
