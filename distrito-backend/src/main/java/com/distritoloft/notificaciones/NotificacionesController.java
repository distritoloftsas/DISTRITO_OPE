package com.distritoloft.notificaciones;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionesController {

    private final ResumenDiarioService resumenDiarioService;

    /**
     * Dispara manualmente el envio del resumen de hoy (o de otra fecha).
     * Util para probar la configuracion de correo o reenviar un resumen.
     */
    @PostMapping("/resumen-diario/enviar")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Map<String, Object> enviarAhora(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        String resultado;
        if (fecha != null) {
            resultado = resumenDiarioService.enviarResumen(fecha);
        } else {
            resultado = resumenDiarioService.enviarResumenDeHoy();
        }
        boolean ok = resultado != null && resultado.startsWith("ENVIADO");
        return Map.of("ok", ok, "resultado", resultado);
    }
}
