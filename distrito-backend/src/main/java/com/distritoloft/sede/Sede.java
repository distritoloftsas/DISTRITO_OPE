package com.distritoloft.sede;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "sede")
@Getter
@Setter
@NoArgsConstructor
public class Sede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String direccion;

    @Column(nullable = false, length = 80)
    private String ciudad;

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false)
    private Boolean activa = true;

    @Column(name = "tolerancia_pre_lavado_minutos", nullable = false)
    private Integer toleranciaPreLavadoMinutos = 5;

    @Column(name = "tolerancia_post_lavado_minutos", nullable = false)
    private Integer toleranciaPostLavadoMinutos = 5;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private OffsetDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn;
}
