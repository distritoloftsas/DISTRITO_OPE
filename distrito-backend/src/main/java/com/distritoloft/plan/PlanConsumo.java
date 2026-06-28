package com.distritoloft.plan;

import com.distritoloft.common.enums.FaseConsumo;
import com.distritoloft.insumo.Insumo;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "plan_consumo")
@Getter
@Setter
@NoArgsConstructor
public class PlanConsumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "insumo_id", nullable = false)
    private Insumo insumo;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "fase_consumo")
    private FaseConsumo fase;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal cantidad;

    /**
     * Unidad en la que se expresa la cantidad de esta receta. Puede diferir
     * de la unidad del insumo (ej. insumo en LITROS, receta en MILILITROS).
     * Al descontar inventario se convierte a la unidad del insumo.
     */
    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "unidad_insumo")
    private com.distritoloft.common.enums.UnidadInsumo unidad;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
