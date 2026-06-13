package com.distritoloft.pedido;

import com.distritoloft.common.enums.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Optional<Pedido> findByCodigoQr(String codigoQr);

    @Query("""
            SELECT p FROM Pedido p
            JOIN FETCH p.cliente
            JOIN FETCH p.sede
            JOIN FETCH p.plan
            WHERE (:sedeId IS NULL OR p.sede.id = :sedeId)
              AND (:#{#estados == null || #estados.isEmpty()} = true OR p.estado IN :estados)
            ORDER BY p.fechaRecepcion DESC
            """)
    List<Pedido> buscar(@Param("sedeId") Long sedeId, @Param("estados") List<EstadoPedido> estados);

    List<Pedido> findByClienteIdOrderByFechaRecepcionDesc(Long clienteId);
}
