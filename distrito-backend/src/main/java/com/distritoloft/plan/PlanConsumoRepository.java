package com.distritoloft.plan;

import com.distritoloft.common.enums.FaseConsumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlanConsumoRepository extends JpaRepository<PlanConsumo, Long> {

    @Query("""
            SELECT pc FROM PlanConsumo pc
            JOIN FETCH pc.insumo i
            JOIN FETCH i.sede
            WHERE pc.plan.id = :planId
            ORDER BY pc.fase, i.nombre
            """)
    List<PlanConsumo> findByPlan(@Param("planId") Long planId);

    @Query("""
            SELECT pc FROM PlanConsumo pc
            JOIN FETCH pc.insumo i
            WHERE pc.plan.id = :planId
              AND pc.fase = :fase
              AND i.sede.id = :sedeId
              AND i.activo = true
            """)
    List<PlanConsumo> findParaPedido(@Param("planId") Long planId,
                                     @Param("fase") FaseConsumo fase,
                                     @Param("sedeId") Long sedeId);

    boolean existsByPlanIdAndInsumoIdAndFase(Long planId, Long insumoId, FaseConsumo fase);
}
