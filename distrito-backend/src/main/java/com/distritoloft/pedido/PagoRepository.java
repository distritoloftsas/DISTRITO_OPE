package com.distritoloft.pedido;

import com.distritoloft.common.enums.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByPedidoIdOrderByFechaAsc(Long pedidoId);

    @Query("""
            SELECT p FROM Pago p
            JOIN FETCH p.pedido pe
            JOIN FETCH pe.cliente
            LEFT JOIN FETCH p.empleado
            WHERE pe.sede.id = :sedeId
              AND p.fecha >= :desde AND p.fecha < :hasta
            ORDER BY p.fecha
            """)
    List<Pago> findPagosEntre(@Param("sedeId") Long sedeId,
                              @Param("desde") OffsetDateTime desde,
                              @Param("hasta") OffsetDateTime hasta);

    @Query("""
            SELECT COALESCE(SUM(p.monto), 0) FROM Pago p
            WHERE p.empleado.id = :empleadoId
              AND p.metodo = :metodo
              AND p.fecha >= :desde
              AND p.fecha < :hasta
            """)
    BigDecimal sumarPorEmpleadoYMetodoEnRango(@Param("empleadoId") Long empleadoId,
                                              @Param("metodo") MetodoPago metodo,
                                              @Param("desde") OffsetDateTime desde,
                                              @Param("hasta") OffsetDateTime hasta);
}
