package com.distritoloft.pedido;

import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.TipoCicloLavadora;
import com.distritoloft.maquina.Maquina;
import com.distritoloft.plan.Plan;
import com.distritoloft.sede.Sede;
import com.distritoloft.usuario.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "pedido")
@Getter
@Setter
@NoArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_qr", nullable = false, unique = true, length = 20)
    private String codigoQr;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sede_id", nullable = false)
    private Sede sede;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "estado_pedido")
    private EstadoPedido estado = EstadoPedido.RECIBIDO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    /**
     * Costo del domicilio. La empleada lo fija al crear el pedido cuando
     * el plan incluye domicilio (el precio depende de la ubicacion).
     * 0 si el plan no lo incluye.
     */
    @Column(name = "costo_domicilio", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoDomicilio = BigDecimal.ZERO;

    /** Direccion donde el repartidor entrega. Obligatoria si plan.incluyeDomicilio. */
    @Column(name = "direccion_entrega", columnDefinition = "TEXT")
    private String direccionEntrega;

    @Column(nullable = false)
    private Boolean pagado = false;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @CreationTimestamp
    @Column(name = "fecha_recepcion", nullable = false, updatable = false)
    private OffsetDateTime fechaRecepcion;

    @Column(name = "fecha_entrega_estimada")
    private OffsetDateTime fechaEntregaEstimada;

    @Column(name = "fecha_entrega_real")
    private OffsetDateTime fechaEntregaReal;

    @Column(name = "fecha_inicio_lavado")
    private OffsetDateTime fechaInicioLavado;

    @Column(name = "fecha_inicio_secado")
    private OffsetDateTime fechaInicioSecado;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "tipo_ciclo_lavadora", columnDefinition = "tipo_ciclo_lavadora")
    private TipoCicloLavadora tipoCicloLavadora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por_empleado_id")
    private Usuario creadoPorEmpleado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lavadora_id")
    private Maquina lavadora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secadora_id")
    private Maquina secadora;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn;
}
