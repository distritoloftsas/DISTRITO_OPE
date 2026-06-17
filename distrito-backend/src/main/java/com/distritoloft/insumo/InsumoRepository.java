package com.distritoloft.insumo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InsumoRepository extends JpaRepository<Insumo, Long> {

    @Query("""
            SELECT i FROM Insumo i
            JOIN FETCH i.sede
            WHERE (:sedeId IS NULL OR i.sede.id = :sedeId)
            ORDER BY i.activo DESC, i.nombre
            """)
    List<Insumo> listar(@Param("sedeId") Long sedeId);

    @Query("""
            SELECT i FROM Insumo i
            JOIN FETCH i.sede
            WHERE i.sede.id = :sedeId
              AND i.activo = true
              AND i.stockActual <= i.stockMinimo
            ORDER BY i.nombre
            """)
    List<Insumo> listarStockBajo(@Param("sedeId") Long sedeId);

    boolean existsBySedeIdAndNombreIgnoreCase(Long sedeId, String nombre);
}
