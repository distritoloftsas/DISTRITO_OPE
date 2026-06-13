package com.distritoloft.pedido;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
