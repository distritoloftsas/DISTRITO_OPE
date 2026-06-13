package com.distritoloft.pedido;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.pedido.dto.PedidoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLEADO', 'GERENTE_SEDE', 'SUPER_ADMIN')")
    public List<PedidoResponse> listar(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(name = "sedeId", required = false) Long sedeId,
            @RequestParam(name = "estado", required = false) List<EstadoPedido> estados
    ) {
        return pedidoService.listar(principal, sedeId, estados);
    }
}
