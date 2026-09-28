package com.distritoloft.descuento;

import java.math.BigDecimal;

public record DescuentoResponse(
        Long id,
        String codigo,
        String etiqueta,
        BigDecimal porcentaje
) {
    public static DescuentoResponse from(Descuento d) {
        return new DescuentoResponse(d.getId(), d.getCodigo(), d.getEtiqueta(), d.getPorcentaje());
    }
}
