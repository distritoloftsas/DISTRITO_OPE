package com.distritoloft.maquina;

import com.distritoloft.common.enums.EstadoMaquina;
import com.distritoloft.common.enums.TipoMaquina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MaquinaRepository extends JpaRepository<Maquina, Long> {

    @Query("""
           SELECT m FROM Maquina m
           WHERE m.sede.id = :sedeId
           ORDER BY m.tipo, m.numero
           """)
    List<Maquina> findBySede(@Param("sedeId") Long sedeId);

    @Query("""
           SELECT m FROM Maquina m
           WHERE m.sede.id = :sedeId
             AND m.tipo = :tipo
             AND m.estado = :estado
           ORDER BY m.numero
           """)
    List<Maquina> findBySedeAndTipoAndEstado(
            @Param("sedeId") Long sedeId,
            @Param("tipo") TipoMaquina tipo,
            @Param("estado") EstadoMaquina estado);
}
