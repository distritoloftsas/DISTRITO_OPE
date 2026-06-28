package com.distritoloft.pedido;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.EstadoMaquina;
import com.distritoloft.common.enums.EstadoPedido;
import com.distritoloft.common.enums.FaseConsumo;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.enums.TipoMaquina;
import com.distritoloft.common.enums.TipoMovimientoInsumo;
import com.distritoloft.common.enums.UnidadInsumo;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.insumo.Insumo;
import com.distritoloft.insumo.MovimientoInsumo;
import com.distritoloft.insumo.MovimientoInsumoRepository;
import com.distritoloft.maquina.Maquina;
import com.distritoloft.maquina.MaquinaRepository;
import com.distritoloft.pedido.dto.CambioEstadoRequest;
import com.distritoloft.pedido.dto.CrearPedidoRequest;
import com.distritoloft.pedido.dto.HistorialEventoResponse;
import com.distritoloft.pedido.dto.PedidoPublicoResponse;
import com.distritoloft.pedido.dto.PedidoResponse;
import com.distritoloft.plan.Plan;
import com.distritoloft.plan.PlanConsumo;
import com.distritoloft.plan.PlanConsumoRepository;
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
    private final PlanConsumoRepository planConsumoRepository;
    private final MovimientoInsumoRepository movimientoInsumoRepository;

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
    public PedidoPublicoResponse obtenerPublico(String codigoQr) {
        Pedido pedido = pedidoRepository.findByCodigoQr(codigoQr)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado: " + codigoQr));
        return PedidoPublicoResponse.from(pedido);
    }

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

    private static final OffsetDateTime FECHA_MIN = OffsetDateTime.parse("1970-01-01T00:00:00Z");
    private static final OffsetDateTime FECHA_MAX = OffsetDateTime.parse("9999-12-31T23:59:59Z");

    @Transactional(readOnly = true)
    public List<PedidoResponse> listar(CustomUserDetails principal,
                                       Long sedeIdParam,
                                       List<EstadoPedido> estados,
                                       OffsetDateTime desde,
                                       OffsetDateTime hasta) {
        Usuario actual = cargarUsuarioActual(principal);
        OffsetDateTime desdeSeguro = desde != null ? desde : FECHA_MIN;
        OffsetDateTime hastaSeguro = hasta != null ? hasta : FECHA_MAX;

        if (actual.getRol() == RolUsuario.CLIENTE) {
            return pedidoRepository.buscarPorCliente(actual.getId(), estados, desdeSeguro, hastaSeguro).stream()
                    .map(PedidoResponse::from)
                    .toList();
        }

        Long sedeId = resolverSede(actual, sedeIdParam);
        return pedidoRepository.buscar(sedeId, estados, desdeSeguro, hastaSeguro).stream()
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

        // Validar tipo de ciclo ANTES de asignar máquina, para no dejarla ocupada
        // si la empleada olvidó elegir el ciclo.
        if (actual == EstadoPedido.RECIBIDO && nuevo == EstadoPedido.LAVANDO) {
            if (req.tipoCicloLavadora() == null) {
                throw new ReglaNegocioException("Debe indicar el tipo de ciclo de la lavadora.");
            }
            pedido.setTipoCicloLavadora(req.tipoCicloLavadora());
        }

        gestionarMaquinas(pedido, actual, nuevo, req.maquinaId());

        // Descontar insumos del plan ANTES de cambiar estado, para que si falla por
        // stock insuficiente no haya efectos parciales.
        if (actual == EstadoPedido.RECIBIDO && nuevo == EstadoPedido.LAVANDO) {
            descontarInsumosDelPlan(pedido, FaseConsumo.LAVADO, empleado);
        }
        if (actual == EstadoPedido.LAVANDO && nuevo == EstadoPedido.SECANDO) {
            descontarInsumosDelPlan(pedido, FaseConsumo.SECADO, empleado);
        }

        pedido.setEstado(nuevo);

        OffsetDateTime ahora = OffsetDateTime.now();
        if (nuevo == EstadoPedido.LAVANDO && pedido.getFechaInicioLavado() == null) {
            pedido.setFechaInicioLavado(ahora);
        }
        if (nuevo == EstadoPedido.SECANDO && pedido.getFechaInicioSecado() == null) {
            pedido.setFechaInicioSecado(ahora);
        }

        if (nuevo == EstadoPedido.ENTREGADO) {
            pedido.setFechaEntregaReal(ahora);
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

    private void descontarInsumosDelPlan(Pedido pedido, FaseConsumo fase, Usuario empleado) {
        List<PlanConsumo> lineas = planConsumoRepository.findParaPedido(
                pedido.getPlan().getId(), fase, pedido.getSede().getId());

        if (lineas.isEmpty()) return; // Sin receta para esta fase, no descuenta nada.

        // Primera pasada: convertir cantidad de la receta a la unidad del
        // insumo y validar que haya stock suficiente para TODO antes de
        // tocar nada. La receta puede estar en una unidad distinta a la del
        // insumo (ej. insumo en LITROS, receta en MILILITROS).
        java.math.BigDecimal[] cantidadesEnUnidadInsumo = new java.math.BigDecimal[lineas.size()];
        for (int i = 0; i < lineas.size(); i++) {
            PlanConsumo linea = lineas.get(i);
            Insumo insumo = linea.getInsumo();
            java.math.BigDecimal cantidadInsumo = UnidadInsumo.convertir(
                    linea.getCantidad(), linea.getUnidad(), insumo.getUnidad());
            cantidadesEnUnidadInsumo[i] = cantidadInsumo;
            if (insumo.getStockActual().compareTo(cantidadInsumo) < 0) {
                throw new ReglaNegocioException(
                        "No hay suficiente " + insumo.getNombre()
                                + " (necesario " + formatoCantidad(cantidadInsumo)
                                + " " + insumo.getUnidad().name().toLowerCase()
                                + ", disponible " + formatoCantidad(insumo.getStockActual())
                                + " " + insumo.getUnidad().name().toLowerCase() + ")."
                );
            }
        }

        // Segunda pasada: descontar y registrar movimiento (en la unidad del
        // insumo, que es como esta el inventario).
        for (int i = 0; i < lineas.size(); i++) {
            PlanConsumo linea = lineas.get(i);
            Insumo insumo = linea.getInsumo();
            java.math.BigDecimal cantidadInsumo = cantidadesEnUnidadInsumo[i];

            insumo.setStockActual(insumo.getStockActual().subtract(cantidadInsumo));

            MovimientoInsumo mov = new MovimientoInsumo();
            mov.setInsumo(insumo);
            mov.setTipo(TipoMovimientoInsumo.CONSUMO);
            mov.setCantidad(cantidadInsumo);
            mov.setCostoUnitario(insumo.getCostoUnitario());
            mov.setMotivo("Consumo " + fase.name().toLowerCase() + " · " + pedido.getCodigoQr());
            mov.setPedido(pedido);
            mov.setEmpleado(empleado);
            movimientoInsumoRepository.save(mov);
        }
    }

    private static String formatoCantidad(java.math.BigDecimal valor) {
        if (valor == null) return "0";
        java.math.BigDecimal limpio = valor.stripTrailingZeros();
        // stripTrailingZeros puede dejar "1E+3"; toPlainString lo evita.
        if (limpio.scale() < 0) limpio = limpio.setScale(0);
        return limpio.toPlainString();
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
