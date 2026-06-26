-- Ley 1581 / Decreto 1377 de 2013: registramos la aceptación de la política
-- de tratamiento de datos. El consentimiento queda en el usuario porque es
-- por persona, no por perfil cliente (un empleado promovido a admin no
-- tiene que re-aceptar).
ALTER TABLE usuario
    ADD COLUMN fecha_aceptacion_habeas_data TIMESTAMPTZ NULL,
    ADD COLUMN version_politica_aceptada VARCHAR(20) NULL;

-- Backfill: usuarios existentes (super admin, gerentes, empleados creados
-- antes de esta versión) marcamos como aceptados implícitamente con la
-- versión inicial "1.0" y la fecha de su creación. Es el comportamiento
-- correcto porque no eran sujetos del registro público.
UPDATE usuario
SET fecha_aceptacion_habeas_data = creado_en,
    version_politica_aceptada = '1.0'
WHERE fecha_aceptacion_habeas_data IS NULL;
