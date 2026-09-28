package com.distritoloft.descuento;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/descuentos")
@RequiredArgsConstructor
public class DescuentoController {

    private final DescuentoRepository descuentoRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLEADO', 'GERENTE_SEDE', 'SUPER_ADMIN')")
    public List<DescuentoResponse> listar() {
        return descuentoRepository.findByActivoTrueOrderByEtiquetaAsc().stream()
                .map(DescuentoResponse::from)
                .toList();
    }
}
