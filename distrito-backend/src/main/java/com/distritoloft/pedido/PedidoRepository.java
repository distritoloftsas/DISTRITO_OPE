package com.distritoloft.pedido;

import com.distritoloft.common.enums.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Optional<Pedido> findByCodigoQr(String codigoQr);

    @Query("""
            SELECT p FROM Pedido p
            JOIN FETCH p.cliente
            JOIN FETCH p.sede
            JOIN FETCH p.plan
            LEFT JOIN FETCH p.lavadora
            LEFT JOIN FETCH p.secadora
            WHERE (:sedeId IS NULL OR p.sede.id = :sedeId)
              AND (:#{#estados == null || #estados.isEmpty()} = true OR p.estado IN :estados)
              AND p.actualizadoEn >= :desde
              AND p.actualizadoEn < :hasta
            ORDER BY p.fechaRecepcion DESC
            """)
    List<Pedido> buscar(@Param("sedeId") Long sedeId,
                        @Param("estados") List<EstadoPedido> estados,
                        @Param("desde") OffsetDateTime desde,
                        @Param("hasta") OffsetDateTime hasta);

    @Query("""
            SELECT p FROM Pedido p
            JOIN FETCH p.cliente
            LEFT JOIN FETCH p.lavadora
            LEFT JOIN FETCH p.secadora
            WHERE p.sede.id = :sedeId
              AND (p.lavadora IS NOT NULL OR p.secadora IS NOT NULL)
            """)
    List<Pedido> buscarConMaquinaAsignada(@Param("sedeId") Long sedeId);

    @Query("""
            SELECT p FROM Pedido p
            JOIN FETCH p.cliente
            JOIN FETCH p.sede
            JOIN FETCH p.plan
            LEFT JOIN FETCH p.lavadora
            LEFT JOIN FETCH p.secadora
            WHERE p.cliente.id = :clienteId
              AND (:#{#estados == null || #estados.isEmpty()} = true OR p.estado IN :estados)
              AND p.actualizadoEn >= :desde
              AND p.actualizadoEn < :hasta
            ORDER BY p.fechaRecepcion DESC
            """)
    List<Pedido> buscarPorCliente(@Param("clienteId") Long clienteId,
                                  @Param("estados") List<EstadoPedido> estados,
                                  @Param("desde") OffsetDateTime desde,
                                  @Param("hasta") OffsetDateTime hasta);

    List<Pedido> findByClienteIdOrderByFechaRecepcionDesc(Long clienteId);

    @Query("""
            SELECT COUNT(p) FROM Pedido p
            WHERE p.sede.id = :sedeId
              AND p.estado = :estado
              AND p.fechaRecepcion >= :desde AND p.fechaRecepcion < :hasta
            """)
    long contarPorSedeEstadoYFechaRecepcion(@Param("sedeId") Long sedeId,
                                            @Param("estado") EstadoPedido estado,
                                            @Param("desde") OffsetDateTime desde,
                                            @Param("hasta") OffsetDateTime hasta);

    @Query("""
            SELECT COUNT(p) FROM Pedido p
            WHERE p.sede.id = :sedeId
              AND p.estado = :estado
              AND p.fechaEntregaReal >= :desde AND p.fechaEntregaReal < :hasta
            """)
    long contarPorEstadoYFechaEntregaReal(@Param("sedeId") Long sedeId,
                                          @Param("estado") EstadoPedido estado,
                                          @Param("desde") OffsetDateTime desde,
                                          @Param("hasta") OffsetDateTime hasta);

    @Query("""
            SELECT COUNT(p) FROM Pedido p
            WHERE p.sede.id = :sedeId
              AND p.fechaRecepcion >= :desde AND p.fechaRecepcion < :hasta
            """)
    long contarPorSedeEnRangoRecepcion(@Param("sedeId") Long sedeId,
                                       @Param("desde") OffsetDateTime desde,
                                       @Param("hasta") OffsetDateTime hasta);

    @Query("""
            SELECT COUNT(p) FROM Pedido p
            WHERE p.sede.id = :sedeId
              AND p.estado IN :estados
            """)
    long contarPorSedeYEstados(@Param("sedeId") Long sedeId,
                               @Param("estados") List<EstadoPedido> estados);
}
