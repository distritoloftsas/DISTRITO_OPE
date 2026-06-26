package com.distritoloft.turno;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public interface GastoCajaRepository extends JpaRepository<GastoCaja, Long> {

    List<GastoCaja> findByTurnoIdOrderByFechaAsc(Long turnoId);

    @Query("""
            SELECT COALESCE(SUM(g.monto), 0) FROM GastoCaja g
            WHERE g.turno.id = :turnoId
            """)
    BigDecimal sumarPorTurno(@Param("turnoId") Long turnoId);

    @Query("""
            SELECT g FROM GastoCaja g
            JOIN FETCH g.turno t
            WHERE t.sede.id = :sedeId
              AND g.fecha >= :desde
              AND g.fecha < :hasta
            ORDER BY g.fecha
            """)
    List<GastoCaja> listarPorSedeEnRango(@Param("sedeId") Long sedeId,
                                         @Param("desde") OffsetDateTime desde,
                                         @Param("hasta") OffsetDateTime hasta);
}
