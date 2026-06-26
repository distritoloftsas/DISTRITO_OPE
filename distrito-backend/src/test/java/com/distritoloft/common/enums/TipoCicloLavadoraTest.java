package com.distritoloft.common.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TipoCicloLavadoraTest {

    @Test
    void duracionesCoincidenConLasMaquinasFisicas() {
        assertEquals(30, TipoCicloLavadora.SENCILLO.getDuracionMinutos());
        assertEquals(36, TipoCicloLavadora.INTERMEDIO.getDuracionMinutos());
        assertEquals(43, TipoCicloLavadora.DELUXE.getDuracionMinutos());
    }

    @Test
    void valuesEnOrdenAscendenteDeDuracion() {
        TipoCicloLavadora[] valores = TipoCicloLavadora.values();
        for (int i = 1; i < valores.length; i++) {
            assertEquals(
                    true,
                    valores[i - 1].getDuracionMinutos() < valores[i].getDuracionMinutos(),
                    "Las duraciones deben estar en orden ascendente para que la UI las muestre así"
            );
        }
    }
}
