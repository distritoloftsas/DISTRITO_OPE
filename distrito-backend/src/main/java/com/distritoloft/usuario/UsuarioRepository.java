package com.distritoloft.usuario;

import com.distritoloft.common.enums.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByTelefono(String telefono);

    boolean existsByEmail(String email);

    List<Usuario> findByRolAndActivoTrue(RolUsuario rol);
}
