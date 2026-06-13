package com.distritoloft.pedido;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PedidoEstadoHistorialRepository extends JpaRepository<PedidoEstadoHistorial, Long> {

    @Query("""
            SELECT h FROM PedidoEstadoHistorial h
            LEFT JOIN FETCH h.empleado
            WHERE h.pedido.id = :pedidoId
            ORDER BY h.fecha
            """)
    List<PedidoEstadoHistorial> findByPedidoIdOrderByFecha(@Param("pedidoId") Long pedidoId);
}
