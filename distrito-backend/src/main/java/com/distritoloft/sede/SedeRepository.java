package com.distritoloft.sede;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SedeRepository extends JpaRepository<Sede, Long> {

    Optional<Sede> findByNombre(String nombre);

    List<Sede> findByActivaTrue();
}
