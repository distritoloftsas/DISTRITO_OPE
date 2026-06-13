package com.distritoloft.usuario;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "cliente_perfil")
@Getter
@Setter
@NoArgsConstructor
public class ClientePerfil {

    @Id
    @Column(name = "usuario_id")
    private Long usuarioId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(name = "direccion_principal", columnDefinition = "TEXT")
    private String direccionPrincipal;

    @Column(name = "cliente_desde", nullable = false)
    private LocalDate clienteDesde = LocalDate.now();

    @Column(name = "lavados_acumulados", nullable = false)
    private Integer lavadosAcumulados = 0;
}
