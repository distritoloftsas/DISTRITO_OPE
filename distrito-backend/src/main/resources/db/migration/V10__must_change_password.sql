-- Sprint 5: forzar cambio de password en el primer login del empleado.

ALTER TABLE usuario
    ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE;
