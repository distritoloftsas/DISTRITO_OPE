package com.distritoloft.pedido;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.pedido.dto.CrearPagoRequest;
import com.distritoloft.pedido.dto.PagoResponse;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PedidoRepository pedidoRepository;
    private final PagoRepository pagoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public PagoResponse registrar(CustomUserDetails principal, Long pedidoId, CrearPagoRequest req) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado: " + pedidoId));

        if (Boolean.TRUE.equals(pedido.getPagado())) {
            throw new ReglaNegocioException("El pedido " + pedido.getCodigoQr() + " ya fue pagado.");
        }

        if (req.monto().compareTo(pedido.getTotal()) != 0) {
            throw new ReglaNegocioException(
                    "El monto del pago (" + req.monto() + ") debe ser exactamente igual al total del pedido (" + pedido.getTotal() + ").");
        }

        Usuario empleado = usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));

        Pago pago = new Pago();
        pago.setPedido(pedido);
        pago.setMetodo(req.metodo());
        pago.setMonto(req.monto());
        pago.setReferencia(req.referencia());
        pago.setEmpleado(empleado);

        Pago guardado = pagoRepository.save(pago);

        pedido.setPagado(true);
        pedidoRepository.save(pedido);

        return PagoResponse.from(guardado);
    }
}
