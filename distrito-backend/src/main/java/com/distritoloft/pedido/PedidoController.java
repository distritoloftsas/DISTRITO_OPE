package com.distritoloft.pedido;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.pedido.dto.CambioEstadoRequest;
import com.distritoloft.pedido.dto.CrearPagoRequest;
import com.distritoloft.pedido.dto.CrearPedidoRequest;
import com.distritoloft.pedido.dto.HistorialEventoResponse;
import com.distritoloft.pedido.dto.PagoResponse;
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
    private final PagoService pagoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLEADO', 'GERENTE_SEDE', 'SUPER_ADMIN', 'CLIENTE')")
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

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('EMPLEADO', 'GERENTE_SEDE', 'SUPER_ADMIN')")
    public PedidoResponse cambiarEstado(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody CambioEstadoRequest req
    ) {
        return pedidoService.cambiarEstado(principal, id, req);
    }

    @PostMapping("/{id}/pagos")
    @PreAuthorize("hasAnyRole('EMPLEADO', 'GERENTE_SEDE', 'SUPER_ADMIN')")
    public ResponseEntity<PagoResponse> registrarPago(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody CrearPagoRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.registrar(principal, id, req));
    }

    @GetMapping("/{id}/historial")
    @PreAuthorize("hasAnyRole('EMPLEADO', 'GERENTE_SEDE', 'SUPER_ADMIN', 'CLIENTE')")
    public List<HistorialEventoResponse> historial(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id
    ) {
        return pedidoService.historial(principal, id);
    }
}
