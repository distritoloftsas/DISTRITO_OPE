package com.distritoloft.pedido;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.pedido.dto.CrearPedidoRequest;
import com.distritoloft.pedido.dto.PedidoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLEADO', 'GERENTE_SEDE', 'SUPER_ADMIN')")
    public ResponseEntity<PedidoResponse> crear(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CrearPedidoRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.crear(principal, req));
    }
}
