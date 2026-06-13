package com.distritoloft.plan.dto;

import com.distritoloft.plan.Plan;

import java.math.BigDecimal;

public record PlanResponse(
        Long id,
        String nombre,
        String descripcion,
        Integer kilosMaxCiclo,
        Boolean incluyeDoblado,
        Boolean incluyeDomicilio,
        BigDecimal precio,
        Integer orden,
        Boolean activo
) {
    public static PlanResponse from(Plan plan) {
        return new PlanResponse(
                plan.getId(),
                plan.getNombre(),
                plan.getDescripcion(),
                plan.getKilosMaxCiclo(),
                plan.getIncluyeDoblado(),
                plan.getIncluyeDomicilio(),
                plan.getPrecio(),
                plan.getOrden(),
                plan.getActivo()
        );
    }
}
