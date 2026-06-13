package com.distritoloft.pedido;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.pedido.dto.CrearPedidoRequest;
import com.distritoloft.pedido.dto.PedidoResponse;
import com.distritoloft.plan.Plan;
import com.distritoloft.plan.PlanRepository;
import com.distritoloft.sede.Sede;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PlanRepository planRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional(readOnly = true)
    public List<PedidoResponse> listar(CustomUserDetails principal, Long sedeIdParam, List<EstadoPedido> estados) {
        Usuario actual = cargarUsuarioActual(principal);
        Long sedeId = resolverSede(actual, sedeIdParam);
        return pedidoRepository.buscar(sedeId, estados).stream()
                .map(PedidoResponse::from)
                .toList();
    }

    @Transactional
    public PedidoResponse crear(CustomUserDetails principal, CrearPedidoRequest req) {
        Usuario empleado = cargarUsuarioActual(principal);

        if (empleado.getRol() != RolUsuario.EMPLEADO
                && empleado.getRol() != RolUsuario.GERENTE_SEDE
                && empleado.getRol() != RolUsuario.SUPER_ADMIN) {
            throw new ReglaNegocioException("Solo personal de la operación puede crear pedidos.");
        }

        Sede sede = sedeDelEmpleado(empleado);

        Usuario cliente = usuarioRepository.findById(req.clienteId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado: " + req.clienteId()));
        if (cliente.getRol() != RolUsuario.CLIENTE) {
            throw new ReglaNegocioException("El usuario " + req.clienteId() + " no es un cliente.");
        }

        Plan plan = planRepository.findById(req.planId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Plan no encontrado: " + req.planId()));
        if (!Boolean.TRUE.equals(plan.getActivo())) {
            throw new ReglaNegocioException("El plan " + plan.getNombre() + " no está activo.");
        }

        OffsetDateTime entregaEstimada = req.fechaEntregaEstimada() != null
                ? req.fechaEntregaEstimada()
                : calcularEntregaPorDefecto(plan);

        Pedido pedido = new Pedido();
        pedido.setCodigoQr(generarCodigoQr());
        pedido.setCliente(cliente);
        pedido.setSede(sede);
        pedido.setPlan(plan);
        pedido.setEstado(EstadoPedido.RECIBIDO);
        pedido.setTotal(plan.getPrecio());
        pedido.setObservaciones(req.observaciones());
        pedido.setFechaEntregaEstimada(entregaEstimada);
        pedido.setCreadoPorEmpleado(empleado);

        Pedido guardado = pedidoRepository.save(pedido);

        PedidoEstadoHistorial historial = new PedidoEstadoHistorial();
        historial.setPedido(guardado);
        historial.setEstado(EstadoPedido.RECIBIDO);
        historial.setEmpleado(empleado);
        em.persist(historial);

        return PedidoResponse.from(guardado);
    }

    private Usuario cargarUsuarioActual(CustomUserDetails principal) {
        return usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));
    }

    private Long resolverSede(Usuario u, Long sedeIdParam) {
        if (u.getRol() == RolUsuario.EMPLEADO || u.getRol() == RolUsuario.GERENTE_SEDE) {
            return sedeDelEmpleado(u).getId();
        }
        return sedeIdParam;
    }

    private Sede sedeDelEmpleado(Usuario u) {
        if (u.getEmpleadoPerfil() == null || u.getEmpleadoPerfil().getSede() == null) {
            throw new ReglaNegocioException("El usuario no tiene una sede asignada.");
        }
        return u.getEmpleadoPerfil().getSede();
    }

    private String generarCodigoQr() {
        Number n = (Number) em.createNativeQuery("SELECT nextval('pedido_codigo_seq')").getSingleResult();
        return "DL-" + String.format("%04d", n.longValue());
    }

    private OffsetDateTime calcularEntregaPorDefecto(Plan plan) {
        int horas = Boolean.TRUE.equals(plan.getIncluyeDomicilio()) ? 3 : 2;
        return OffsetDateTime.now().plusHours(horas);
    }
}
