package com.distritoloft.pedido;

import com.distritoloft.common.enums.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Optional<Pedido> findByCodigoQr(String codigoQr);

    List<Pedido> findBySedeIdAndEstadoNotIn(Long sedeId, List<EstadoPedido> estados);

    List<Pedido> findByClienteIdOrderByFechaRecepcionDesc(Long clienteId);
}
