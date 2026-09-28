package com.distritoloft.descuento;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DescuentoRepository extends JpaRepository<Descuento, Long> {
    List<Descuento> findByActivoTrueOrderByEtiquetaAsc();
}
