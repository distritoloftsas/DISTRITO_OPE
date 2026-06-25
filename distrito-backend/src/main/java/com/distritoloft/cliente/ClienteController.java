package com.distritoloft.cliente;

import com.distritoloft.cliente.dto.ActivarCuentaClienteRequest;
import com.distritoloft.cliente.dto.ActualizarClienteRequest;
import com.distritoloft.cliente.dto.ClienteResponse;
import com.distritoloft.cliente.dto.CrearClienteRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('EMPLEADO', 'GERENTE_SEDE', 'SUPER_ADMIN')")
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public List<ClienteResponse> buscar(@RequestParam(name = "q", required = false) String q) {
        return clienteService.buscar(q);
    }

    @GetMapping("/{id}")
    public ClienteResponse obtener(@PathVariable Long id) {
        return clienteService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> crear(@Valid @RequestBody CrearClienteRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.crear(req));
    }

    @PatchMapping("/{id}")
    public ClienteResponse actualizar(@PathVariable Long id,
                                      @Valid @RequestBody ActualizarClienteRequest req) {
        return clienteService.actualizar(id, req);
    }

    @GetMapping("/conteo")
    public Map<String, Long> conteo() {
        return Map.of("total", clienteService.contar());
    }

    @PostMapping("/{id}/cuenta")
    @PreAuthorize("hasAnyRole('GERENTE_SEDE', 'SUPER_ADMIN')")
    public ClienteResponse activarCuenta(@PathVariable Long id,
                                         @Valid @RequestBody ActivarCuentaClienteRequest req) {
        return clienteService.activarCuenta(id, req);
    }
}
