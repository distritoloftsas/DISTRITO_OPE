package com.distritoloft.pedido;

import com.distritoloft.common.enums.EstadoPedido;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por_empleado_id")
    private Usuario creadoPorEmpleado;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private OffsetDateTime actualizadoEn;
}
