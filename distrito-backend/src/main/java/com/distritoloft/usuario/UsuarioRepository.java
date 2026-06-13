package com.distritoloft.usuario;

import com.distritoloft.common.enums.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByTelefono(String telefono);

    boolean existsByEmail(String email);

    boolean existsByTelefono(String telefono);

    List<Usuario> findByRolAndActivoTrue(RolUsuario rol);

    @Query("""
            SELECT u FROM Usuario u
            LEFT JOIN FETCH u.clientePerfil
            WHERE u.rol = :rol
              AND u.activo = true
              AND (LOWER(u.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR u.telefono LIKE CONCAT('%', :q, '%'))
            ORDER BY u.nombre
            """)
    List<Usuario> buscarClientes(@Param("q") String q, @Param("rol") RolUsuario rol);
}
