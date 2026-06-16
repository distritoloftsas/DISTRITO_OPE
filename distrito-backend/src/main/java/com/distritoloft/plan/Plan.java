package com.distritoloft.plan;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "plan")
@Getter
@Setter
@NoArgsConstructor
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "kilos_max_ciclo", nullable = false)
    private Integer kilosMaxCiclo = 10;

    @Column(name = "incluye_doblado", nullable = false)
    private Boolean incluyeDoblado = false;

    @Column(name = "incluye_domicilio", nullable = false)
    private Boolean incluyeDomicilio = false;

    @Column(name = "duracion_lavado_minutos", nullable = false)
    private Integer duracionLavadoMinutos = 35;

    @Column(name = "duracion_secado_minutos", nullable = false)
    private Integer duracionSecadoMinutos = 30;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer orden = 0;

    @Column(nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn;
}
