package com.distritoloft.insumo;

import com.distritoloft.auth.CustomUserDetails;
import com.distritoloft.common.enums.RolUsuario;
import com.distritoloft.common.enums.TipoMovimientoInsumo;
import com.distritoloft.common.exception.RecursoNoEncontradoException;
import com.distritoloft.common.exception.ReglaNegocioException;
import com.distritoloft.insumo.dto.*;
import com.distritoloft.sede.Sede;
import com.distritoloft.sede.SedeRepository;
import com.distritoloft.usuario.Usuario;
import com.distritoloft.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InsumoService {

    private final InsumoRepository insumoRepository;
    private final MovimientoInsumoRepository movimientoRepository;
    private final SedeRepository sedeRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<InsumoResponse> listar(CustomUserDetails principal, Long sedeIdParam) {
        Usuario actual = cargarUsuarioActual(principal);
        validarRolStaff(actual);

        Long sedeId = actual.getRol() == RolUsuario.GERENTE_SEDE
                ? sedeDelEmpleado(actual).getId()
                : sedeIdParam;

        return insumoRepository.listar(sedeId).stream()
                .map(InsumoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InsumoResponse> stockBajoDeMiSede(CustomUserDetails principal) {
        Usuario actual = cargarUsuarioActual(principal);
        validarRolStaff(actual);

        Long sedeId = actual.getRol() == RolUsuario.GERENTE_SEDE
                ? sedeDelEmpleado(actual).getId()
                : null;
        if (sedeId == null) return List.of();

        return insumoRepository.listarStockBajo(sedeId).stream()
                .map(InsumoResponse::from)
                .toList();
    }

    @Transactional
    public InsumoResponse crear(CustomUserDetails principal, CrearInsumoRequest req) {
        Usuario actual = cargarUsuarioActual(principal);
        validarRolStaff(actual);

        Long sedeId = resolverSedeDestino(actual, req.sedeId());
        Sede sede = sedeRepository.findById(sedeId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sede no encontrada: " + sedeId));

        if (insumoRepository.existsBySedeIdAndNombreIgnoreCase(sedeId, req.nombre().trim())) {
            throw new ReglaNegocioException("Ya existe un insumo con ese nombre en la sede.");
        }

        Insumo i = new Insumo();
        i.setSede(sede);
        i.setNombre(req.nombre().trim());
        i.setUnidad(req.unidad());
        i.setStockActual(req.stockInicial());
        i.setStockMinimo(req.stockMinimo());
        i.setCostoUnitario(req.costoUnitario());
        i.setActivo(true);
        Insumo guardado = insumoRepository.save(i);

        // Registrar el stock inicial como movimiento de ENTRADA si es > 0.
        if (req.stockInicial().compareTo(BigDecimal.ZERO) > 0) {
            MovimientoInsumo mov = new MovimientoInsumo();
            mov.setInsumo(guardado);
            mov.setTipo(TipoMovimientoInsumo.ENTRADA);
            mov.setCantidad(req.stockInicial());
            mov.setCostoUnitario(req.costoUnitario());
            mov.setMotivo("Stock inicial");
            mov.setEmpleado(actual);
            movimientoRepository.save(mov);
        }

        return InsumoResponse.from(guardado);
    }

    @Transactional
    public InsumoResponse actualizar(CustomUserDetails principal, Long insumoId, ActualizarInsumoRequest req) {
        Usuario actual = cargarUsuarioActual(principal);
        Insumo i = cargarInsumoConPermiso(actual, insumoId);

        if (req.stockMinimo() != null) i.setStockMinimo(req.stockMinimo());
        if (req.costoUnitario() != null) i.setCostoUnitario(req.costoUnitario());
        if (req.activo() != null) i.setActivo(req.activo());
        return InsumoResponse.from(i);
    }

    @Transactional
    public InsumoResponse registrarMovimiento(CustomUserDetails principal, Long insumoId, CrearMovimientoRequest req) {
        Usuario actual = cargarUsuarioActual(principal);
        Insumo i = cargarInsumoConPermiso(actual, insumoId);

        BigDecimal nuevoStock;
        BigDecimal costoMovimiento = req.costoUnitario() != null ? req.costoUnitario() : i.getCostoUnitario();

        if (req.tipo() == TipoMovimientoInsumo.ENTRADA || req.tipo() == TipoMovimientoInsumo.AJUSTE) {
            nuevoStock = i.getStockActual().add(req.cantidad());

            // Solo en ENTRADA con costo recalcular el costo promedio ponderado del insumo.
            // (Un AJUSTE no implica compra, conservamos el costo actual.)
            if (req.tipo() == TipoMovimientoInsumo.ENTRADA && req.costoUnitario() != null) {
                i.setCostoUnitario(costoPromedioPonderado(
                        i.getStockActual(), i.getCostoUnitario(),
                        req.cantidad(), req.costoUnitario()
                ));
            }
        } else {
            nuevoStock = i.getStockActual().subtract(req.cantidad());
            if (nuevoStock.compareTo(BigDecimal.ZERO) < 0) {
                throw new ReglaNegocioException(
                        "No hay suficiente stock de " + i.getNombre()
                                + " (actual " + formatoCantidad(i.getStockActual()) + ").");
            }
            // En BAJA/CONSUMO el costo del movimiento es el costo actual del insumo.
            costoMovimiento = i.getCostoUnitario();
        }
        i.setStockActual(nuevoStock);

        MovimientoInsumo mov = new MovimientoInsumo();
        mov.setInsumo(i);
        mov.setTipo(req.tipo());
        mov.setCantidad(req.cantidad());
        mov.setCostoUnitario(costoMovimiento);
        mov.setMotivo(req.motivo());
        mov.setEmpleado(actual);
        movimientoRepository.save(mov);

        return InsumoResponse.from(i);
    }

    /**
     * Costo promedio ponderado: (stockActual * costoActual + cantidadEntra * costoEntra) / (stockActual + cantidadEntra)
     */
    private static BigDecimal costoPromedioPonderado(
            BigDecimal stockActual, BigDecimal costoActual,
            BigDecimal cantidadEntra, BigDecimal costoEntra) {
        BigDecimal numerador = stockActual.multiply(costoActual).add(cantidadEntra.multiply(costoEntra));
        BigDecimal denominador = stockActual.add(cantidadEntra);
        if (denominador.compareTo(BigDecimal.ZERO) == 0) return costoEntra;
        return numerador.divide(denominador, 4, java.math.RoundingMode.HALF_UP);
    }

    @Transactional(readOnly = true)
    public List<MovimientoResponse> historial(CustomUserDetails principal, Long insumoId) {
        Usuario actual = cargarUsuarioActual(principal);
        cargarInsumoConPermiso(actual, insumoId);

        return movimientoRepository.historialPorInsumo(insumoId).stream()
                .map(MovimientoResponse::from)
                .toList();
    }

    private Insumo cargarInsumoConPermiso(Usuario actual, Long insumoId) {
        Insumo i = insumoRepository.findById(insumoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Insumo no encontrado: " + insumoId));
        validarRolStaff(actual);
        if (actual.getRol() == RolUsuario.GERENTE_SEDE) {
            Long sedeGerente = sedeDelEmpleado(actual).getId();
            if (!i.getSede().getId().equals(sedeGerente)) {
                throw new ReglaNegocioException("No puedes operar insumos de otra sede.");
            }
        }
        return i;
    }

    private Long resolverSedeDestino(Usuario actual, Long sedeRequest) {
        if (actual.getRol() == RolUsuario.GERENTE_SEDE) return sedeDelEmpleado(actual).getId();
        if (sedeRequest == null) throw new ReglaNegocioException("Debes indicar la sede del insumo.");
        return sedeRequest;
    }

    private void validarRolStaff(Usuario u) {
        if (u.getRol() != RolUsuario.GERENTE_SEDE && u.getRol() != RolUsuario.SUPER_ADMIN) {
            throw new ReglaNegocioException("Solo el gerente o el super admin pueden gestionar insumos.");
        }
    }

    private Sede sedeDelEmpleado(Usuario u) {
        if (u.getEmpleadoPerfil() == null || u.getEmpleadoPerfil().getSede() == null) {
            throw new ReglaNegocioException("El usuario no tiene sede asignada.");
        }
        return u.getEmpleadoPerfil().getSede();
    }

    private Usuario cargarUsuarioActual(CustomUserDetails principal) {
        return usuarioRepository.findById(principal.getUsuario().getId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario actual no encontrado."));
    }

    private static String formatoCantidad(BigDecimal valor) {
        if (valor == null) return "0";
        BigDecimal limpio = valor.stripTrailingZeros();
        if (limpio.scale() < 0) limpio = limpio.setScale(0);
        return limpio.toPlainString();
    }
}
