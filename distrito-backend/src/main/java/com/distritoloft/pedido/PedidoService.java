package com.distritoloft.pedido;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.pedido.dto.PedidoResponse;
import com.distritoloft.usuario.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public List<PedidoResponse> listar(CustomUserDetails principal, Long sedeIdParam, List<EstadoPedido> estados) {
        Long sedeId = resolverSede(principal, sedeIdParam);

        return pedidoRepository.buscar(sedeId, estados).stream()
                .map(PedidoResponse::from)
                .toList();
    }

    private Long resolverSede(CustomUserDetails principal, Long sedeIdParam) {
        Usuario u = principal.getUsuario();

        if (u.getRol() == RolUsuario.EMPLEADO || u.getRol() == RolUsuario.GERENTE_SEDE) {
            if (u.getEmpleadoPerfil() == null || u.getEmpleadoPerfil().getSede() == null) {
                throw new ReglaNegocioException("El usuario no tiene una sede asignada.");
            }
            return u.getEmpleadoPerfil().getSede().getId();
        }

        return sedeIdParam;
    }
}
