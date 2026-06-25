package com.distritoloft.turno;

import com.distritoloft.sede.Sede;
import com.distritoloft.usuario.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "turno_caja")
@Getter
@Setter
@NoArgsConstructor
public class TurnoCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sede_id", nullable = false)
    private Sede sede;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empleado_id", nullable = false)
    private Usuario empleado;

    @Column(name = "fecha_apertura", nullable = false)
    private OffsetDateTime fechaApertura = OffsetDateTime.now();

    @Column(name = "efectivo_apertura", nullable = false, precision = 12, scale = 2)
    private BigDecimal efectivoApertura = BigDecimal.ZERO;

    @Column(name = "fecha_cierre")
    private OffsetDateTime fechaCierre;

    @Column(name = "efectivo_cierre_declarado", precision = 12, scale = 2)
    private BigDecimal efectivoCierreDeclarado;

    @Column(name = "efectivo_esperado", precision = 12, scale = 2)
    private BigDecimal efectivoEsperado;

    @Column(precision = 12, scale = 2)
    private BigDecimal diferencia;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    public boolean estaAbierto() {
        return fechaCierre == null;
    }
}
