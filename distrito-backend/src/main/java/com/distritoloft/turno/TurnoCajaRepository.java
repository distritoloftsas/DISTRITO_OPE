package com.distritoloft.turno;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface TurnoCajaRepository extends JpaRepository<TurnoCaja, Long> {

    @Query("""
            SELECT t FROM TurnoCaja t
            JOIN FETCH t.sede
            JOIN FETCH t.empleado
            WHERE t.empleado.id = :empleadoId
              AND t.fechaCierre IS NULL
            """)
    Optional<TurnoCaja> findAbiertoPorEmpleado(@Param("empleadoId") Long empleadoId);

    @Query("""
            SELECT t FROM TurnoCaja t
            JOIN FETCH t.empleado
            WHERE t.sede.id = :sedeId
              AND t.fechaApertura >= :desde
              AND t.fechaApertura < :hasta
            ORDER BY t.fechaApertura DESC
            """)
    List<TurnoCaja> listarPorSede(@Param("sedeId") Long sedeId,
                                  @Param("desde") OffsetDateTime desde,
                                  @Param("hasta") OffsetDateTime hasta);
}
