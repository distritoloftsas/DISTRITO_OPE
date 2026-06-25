package com.distritoloft.insumo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MovimientoInsumoRepository extends JpaRepository<MovimientoInsumo, Long> {

    @Query("""
            SELECT m FROM MovimientoInsumo m
            LEFT JOIN FETCH m.empleado
            LEFT JOIN FETCH m.pedido
            WHERE m.insumo.id = :insumoId
            ORDER BY m.fecha DESC
            """)
    List<MovimientoInsumo> historialPorInsumo(@Param("insumoId") Long insumoId);

    @Query("""
            SELECT m FROM MovimientoInsumo m
            JOIN FETCH m.insumo i
            WHERE i.sede.id = :sedeId
              AND m.tipo = :tipo
              AND m.fecha >= :desde AND m.fecha < :hasta
            """)
    List<MovimientoInsumo> movimientosPorTipoEnRango(
            @Param("sedeId") Long sedeId,
            @Param("tipo") com.distritoloft.common.enums.TipoMovimientoInsumo tipo,
            @Param("desde") java.time.OffsetDateTime desde,
            @Param("hasta") java.time.OffsetDateTime hasta);
}
