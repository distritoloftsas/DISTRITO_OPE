package com.distritoloft.pedido;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoMaquina;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.enums.TipoMaquina;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.maquina.Maquina;
import com.distritoloft.maquina.MaquinaRepository;
import com.distritoloft.pedido.dto.CambioEstadoRequest;
import com.distritoloft.pedido.dto.CrearPedidoRequest;
import com.distritoloft.pedido.dto.HistorialEventoResponse;
import com.distritoloft.pedido.dto.PedidoResponse;
import com.distritoloft.plan.Plan;
import com.distritoloft.plan.PlanRepository;
import com.distritoloft.sede.Sede;
import com.distritoloft.usuario.ClientePerfil;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PlanRepository planRepository;
    private final MaquinaRepository maquinaRepository;
    private final PedidoEstadoHistorialRepository historialRepository;

    @PersistenceContext
    private EntityManager em;

    private static final Map<EstadoPedido, Set<EstadoPedido>> TRANSICIONES_VALIDAS = Map.of(
            EstadoPedido.RECIBIDO,  Set.of(EstadoPedido.LAVANDO, EstadoPedido.CANCELADO),
            EstadoPedido.LAVANDO,   Set.of(EstadoPedido.SECANDO, EstadoPedido.CANCELADO),
            EstadoPedido.SECANDO,   Set.of(EstadoPedido.DOBLANDO, EstadoPedido.LISTO, EstadoPedido.CANCELADO),
            EstadoPedido.DOBLANDO,  Set.of(EstadoPedido.LISTO, EstadoPedido.CANCELADO),
            EstadoPedido.LISTO,     Set.of(EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO),
            EstadoPedido.ENTREGADO, Set.of(),
            EstadoPedido.CANCELADO, Set.of()
    );

    @Transactional(readOnly = true)
    public List<HistorialEventoResponse> historial(CustomUserDetails principal, Long pedidoId) {
        Usuario actual = cargarUsuarioActual(principal);
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado: " + pedidoId));

        if (actual.getRol() == RolUsuario.CLIENTE) {
            if (!pedido.getCliente().getId().equals(actual.getId())) {
                throw new ReglaNegocioException("No puedes ver este pedido.");
            }
        } else {
            validarSedeDelEmpleado(actual, pedido);
        }

        return historialRepository.findByPedidoIdOrderByFecha(pedidoId).stream()
                .map(HistorialEventoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listar(CustomUserDetails principal, Long sedeIdParam, List<EstadoPedido> estados) {
        Usuario actual = cargarUsuarioActual(principal);

        if (actual.getRol() == RolUsuario.CLIENTE) {
            return pedidoRepository.buscarPorCliente(actual.getId(), estados).stream()
                    .map(PedidoResponse::from)
                    .toList();
        }

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
        pedido.setPagado(false);
        pedido.setObservaciones(req.observaciones());
        pedido.setFechaEntregaEstimada(entregaEstimada);
        pedido.setCreadoPorEmpleado(empleado);

        Pedido guardado = pedidoRepository.save(pedido);

        registrarHistorial(guardado, EstadoPedido.RECIBIDO, empleado, null);

        return PedidoResponse.from(guardado);
    }

    @Transactional
    public PedidoResponse cambiarEstado(CustomUserDetails principal, Long pedidoId, CambioEstadoRequest req) {
        Usuario empleado = cargarUsuarioActual(principal);

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado: " + pedidoId));

        validarSedeDelEmpleado(empleado, pedido);

        EstadoPedido actual = pedido.getEstado();
        EstadoPedido nuevo = aplicarSaltoDoblado(pedido, req.nuevoEstado());

        validarTransicion(actual, nuevo);
        validarReglasEspeciales(pedido, nuevo, req.observacion());

        gestionarMaquinas(pedido, actual, nuevo, req.maquinaId());

        pedido.setEstado(nuevo);

        if (nuevo == EstadoPedido.ENTREGADO) {
            pedido.setFechaEntregaReal(OffsetDateTime.now());
            incrementarLavadosCliente(pedido.getCliente());
        }

        Pedido guardado = pedidoRepository.save(pedido);
        registrarHistorial(guardado, nuevo, empleado, req.observacion());

        return PedidoResponse.from(guardado);
    }

    private void gestionarMaquinas(Pedido pedido, EstadoPedido actual, EstadoPedido nuevo, Long maquinaId) {
        // Salida de LAVANDO: liberar lavadora si estaba asignada
        if (actual == EstadoPedido.LAVANDO && nuevo != EstadoPedido.LAVANDO) {
            liberarMaquina(pedido.getLavadora());
            pedido.setLavadora(null);
        }
        // Salida de SECANDO: liberar secadora
        if (actual == EstadoPedido.SECANDO && nuevo != EstadoPedido.SECANDO) {
            liberarMaquina(pedido.getSecadora());
            pedido.setSecadora(null);
        }

        // Entrada a LAVANDO: requiere lavadora
        if (nuevo == EstadoPedido.LAVANDO && actual != EstadoPedido.LAVANDO) {
            Maquina lavadora = asignarMaquina(pedido, maquinaId, TipoMaquina.LAVADORA);
            pedido.setLavadora(lavadora);
        }
        // Entrada a SECANDO: requiere secadora
        if (nuevo == EstadoPedido.SECANDO && actual != EstadoPedido.SECANDO) {
            Maquina secadora = asignarMaquina(pedido, maquinaId, TipoMaquina.SECADORA);
            pedido.setSecadora(secadora);
        }

        // CANCELADO desde cualquier estado: liberar todo lo asignado
        if (nuevo == EstadoPedido.CANCELADO) {
            if (pedido.getLavadora() != null) {
                liberarMaquina(pedido.getLavadora());
                pedido.setLavadora(null);
            }
            if (pedido.getSecadora() != null) {
                liberarMaquina(pedido.getSecadora());
                pedido.setSecadora(null);
            }
        }
    }

    private Maquina asignarMaquina(Pedido pedido, Long maquinaId, TipoMaquina tipoEsperado) {
        if (maquinaId == null) {
            throw new ReglaNegocioException(
                    "Debe seleccionar una " + tipoEsperado.name().toLowerCase() + " antes de avanzar.");
        }
        Maquina m = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Máquina no encontrada: " + maquinaId));
        if (!m.getSede().getId().equals(pedido.getSede().getId())) {
            throw new ReglaNegocioException("La máquina seleccionada no pertenece a esta sede.");
        }
        if (m.getTipo() != tipoEsperado) {
            throw new ReglaNegocioException(
                    "La máquina seleccionada no es una " + tipoEsperado.name().toLowerCase() + ".");
        }
        if (m.getEstado() != EstadoMaquina.LIBRE) {
            throw new ReglaNegocioException(
                    tipoEsperado + " " + m.getNumero() + " no está disponible (" + m.getEstado() + ").");
        }
        m.setEstado(EstadoMaquina.OCUPADA);
        return m;
    }

    private void liberarMaquina(Maquina m) {
        if (m == null) return;
        if (m.getEstado() == EstadoMaquina.OCUPADA) {
            m.setEstado(EstadoMaquina.LIBRE);
        }
    }

    private void validarTransicion(EstadoPedido actual, EstadoPedido nuevo) {
        Set<EstadoPedido> permitidos = TRANSICIONES_VALIDAS.getOrDefault(actual, Set.of());
        if (!permitidos.contains(nuevo)) {
            throw new ReglaNegocioException(
                    "Transición no permitida: de " + actual + " no se puede pasar a " + nuevo + "."
            );
        }
    }

    private void validarReglasEspeciales(Pedido pedido, EstadoPedido nuevo, String observacion) {
        if (pedido.getEstado() == EstadoPedido.RECIBIDO && nuevo == EstadoPedido.LAVANDO) {
            if (!Boolean.TRUE.equals(pedido.getPagado())) {
                throw new ReglaNegocioException("No se puede iniciar el lavado: el pedido aún no ha sido pagado.");
            }
        }

        if (nuevo == EstadoPedido.CANCELADO && (observacion == null || observacion.isBlank())) {
            throw new ReglaNegocioException("Para cancelar un pedido es obligatorio indicar una observación.");
        }
    }

    private EstadoPedido aplicarSaltoDoblado(Pedido pedido, EstadoPedido nuevo) {
        if (nuevo == EstadoPedido.DOBLANDO
                && !Boolean.TRUE.equals(pedido.getPlan().getIncluyeDoblado())) {
            return EstadoPedido.LISTO;
        }
        return nuevo;
    }

    private void validarSedeDelEmpleado(Usuario empleado, Pedido pedido) {
        if (empleado.getRol() == RolUsuario.SUPER_ADMIN) return;

        Sede sedeEmpleado = sedeDelEmpleado(empleado);
        if (!sedeEmpleado.getId().equals(pedido.getSede().getId())) {
            throw new ReglaNegocioException("No puedes operar sobre pedidos de otra sede.");
        }
    }

    private void incrementarLavadosCliente(Usuario cliente) {
        ClientePerfil perfil = cliente.getClientePerfil();
        if (perfil != null) {
            perfil.setLavadosAcumulados(perfil.getLavadosAcumulados() + 1);
        }
    }

    private void registrarHistorial(Pedido pedido, EstadoPedido estado, Usuario empleado, String observacion) {
        PedidoEstadoHistorial historial = new PedidoEstadoHistorial();
        historial.setPedido(pedido);
        historial.setEstado(estado);
        historial.setEmpleado(empleado);
        historial.setObservacion(observacion);
        em.persist(historial);
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
