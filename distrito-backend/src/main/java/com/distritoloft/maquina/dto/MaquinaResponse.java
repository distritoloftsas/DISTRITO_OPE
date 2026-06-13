package com.distritoloft.maquina.dto;

import com.distritoloft.common.enums.EstadoMaquina;
import com.distritoloft.common.enums.TipoMaquina;

public record MaquinaResponse(
        Long id,
        TipoMaquina tipo,
        Short numero,
        EstadoMaquina estado,
        PedidoEnCurso pedido
) {
    public record PedidoEnCurso(Long id, String codigoQr, String cliente) {}
}
