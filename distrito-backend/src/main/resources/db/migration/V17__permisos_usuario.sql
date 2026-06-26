-- Sprint 26: permisos por vista. El SUPER_ADMIN puede otorgarlos o
-- quitarlos a empleados y gerentes. Los super admin tienen todos por
-- logica de codigo, no necesitan filas en esta tabla.

CREATE TYPE permiso_usuario AS ENUM (
    'VER_OPERACION',
    'VER_CLIENTES',
    'VER_EQUIPO',
    'VER_INVENTARIO',
    'GESTIONAR_RECETAS',
    'GESTIONAR_MAQUINAS',
    'GESTIONAR_TOLERANCIA',
    'VER_CIERRE_CAJA',
    'VER_REPORTES_VENTAS',
    'VER_REPORTES_INSUMOS',
    'EXPORTAR_REPORTES'
);

CREATE TABLE usuario_permiso (
    usuario_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    permiso    permiso_usuario NOT NULL,
    PRIMARY KEY (usuario_id, permiso)
);

CREATE INDEX idx_usuario_permiso_usuario ON usuario_permiso(usuario_id);

-- Seed: dar a los empleados y gerentes existentes los defaults para no
-- romper la app despues de aplicar la migracion.
INSERT INTO usuario_permiso (usuario_id, permiso)
SELECT u.id, p::permiso_usuario
FROM usuario u
CROSS JOIN (
    VALUES
        ('VER_OPERACION'),
        ('VER_CLIENTES'),
        ('VER_EQUIPO'),
        ('VER_INVENTARIO'),
        ('GESTIONAR_RECETAS'),
        ('GESTIONAR_MAQUINAS'),
        ('GESTIONAR_TOLERANCIA'),
        ('VER_CIERRE_CAJA'),
        ('VER_REPORTES_VENTAS'),
        ('VER_REPORTES_INSUMOS'),
        ('EXPORTAR_REPORTES')
) AS perms(p)
WHERE u.rol = 'GERENTE_SEDE'
ON CONFLICT DO NOTHING;

INSERT INTO usuario_permiso (usuario_id, permiso)
SELECT u.id, p::permiso_usuario
FROM usuario u
CROSS JOIN (
    VALUES
        ('VER_OPERACION'),
        ('VER_CLIENTES'),
        ('VER_CIERRE_CAJA')
) AS perms(p)
WHERE u.rol = 'EMPLEADO'
ON CONFLICT DO NOTHING;
