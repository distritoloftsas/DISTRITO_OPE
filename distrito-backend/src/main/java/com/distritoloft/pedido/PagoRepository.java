package com.distritoloft.pedido;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByPedidoIdOrderByFechaAsc(Long pedidoId);
}
