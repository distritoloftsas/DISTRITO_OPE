package com.distritoloft.notificaciones;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ResumenDiarioScheduler {

    private final ResumenDiarioService service;

    /**
     * Todos los dias a las 19:00 hora Colombia (America/Bogota).
     * Segundo, minuto, hora, dia, mes, dia-semana.
     */
    @Scheduled(cron = "0 0 19 * * *", zone = "America/Bogota")
    public void ejecutar() {
        log.info("Disparando resumen diario de 7 PM.");
        try {
            service.enviarResumenDeHoy();
        } catch (RuntimeException ex) {
            log.error("Falló el resumen diario: {}", ex.getMessage(), ex);
        }
    }
}
